// The engine: Oracle-flavoured SQL in, Oracle-flavoured result out, on top of a PGlite instance.
//
//   const engine = await createEngine(pg, { clock: '2026-10-26 14:30:00', datasets: { facultate: sqlText } })
//   const result = await engine.run('SELECT nume FROM studenti', { dataset: 'facultate' })
//
// `pg` is a ready PGlite. The compat layer (../compat/*.sql, in file-name order) is installed once; a dataset is
// loaded the first time a run asks for it. Cells in the Result are already Oracle display text.
import { rewriteOracle } from '../rewrite/index.js'
import { mapPgError } from './errors.js'
import { displayNames, formatCell } from './format.js'

// Compat files as raw text, sorted by file name (00-base ... 70-ddl). Vite inlines them into this (lazy) chunk.
const COMPAT_FILES = import.meta.glob('../compat/*.sql', { query: '?raw', import: 'default', eager: true })

// PGlite would turn numeric / date / bigint cells into JS numbers and Date objects; the engine wants the raw text.
const RAW_TEXT_PARSERS = { 20: (v) => v, 1082: (v) => v, 1114: (v) => v, 1184: (v) => v, 1700: (v) => v }

const CLOCK_RE = /^\d{4}-\d\d-\d\d \d\d:\d\d:\d\d$/

export function compatStatements() {
  return Object.keys(COMPAT_FILES)
    .sort()
    .flatMap((name) => COMPAT_FILES[name].split(/^--;;\s*$/m).map((s) => s.trim()).filter(Boolean))
}

export function statementKind(sql) {
  const w = (/^[\s(]*(?:\/\*[\s\S]*?\*\/[\s(]*|--[^\n]*\n[\s(]*)*([A-Za-z]+)/.exec(sql) || [])[1]?.toUpperCase()
  if (w === 'INSERT' || w === 'UPDATE' || w === 'DELETE' || w === 'MERGE') return 'dml'
  if (w === 'COMMIT' || w === 'ROLLBACK' || w === 'SAVEPOINT') return 'tx'
  if (w === 'SELECT' || w === 'WITH' || w === undefined) return 'rows'
  return 'ddl'
}

export async function createEngine(pg, { clock, datasets }) {
  if (!CLOCK_RE.test(clock)) throw new Error(`clock must look like 'YYYY-MM-DD HH24:MI:SS', got '${clock}'`)
  await pg.waitReady
  for (const stmt of compatStatements()) {
    try {
      await pg.exec(stmt)
    } catch (e) {
      throw new Error(`compat layer failed: ${e.message}\n${stmt.slice(0, 200)}`)
    }
  }
  await pg.query('UPDATE ora_clock SET d = $1::timestamp', [clock])

  let loaded = null
  async function loadDataset(name) {
    if (loaded === name) return
    if (!(name in datasets)) throw new Error(`unknown dataset '${name}'`)
    if (loaded !== null) throw new Error(`dataset '${loaded}' is already loaded; resetting between datasets is not built yet`)
    await pg.exec(datasets[name])
    loaded = name
  }

  async function run(sql, { dataset, maxRows } = {}) {
    await loadDataset(dataset)
    const kind = statementKind(sql)
    const failed = (err) => ({ kind, columns: [], rows: [], rowCount: 0, truncated: false, error: mapPgError(err) })
    let rewritten
    try {
      rewritten = rewriteOracle(sql)
    } catch (err) {
      return failed(err)
    }
    try {
      const r = await pg.query(rewritten.sql, [], { rowMode: 'array', parsers: RAW_TEXT_PARSERS })
      const total = r.rows.length
      const cut = maxRows != null && total > maxRows
      const rows = (cut ? r.rows.slice(0, maxRows) : r.rows).map((row) => row.map((v, i) => formatCell(v, r.fields[i].dataTypeID, -1)))
      if (kind !== 'rows') return { kind, columns: [], rows: [], rowCount: r.affectedRows ?? 0, truncated: false }
      return { kind, columns: displayNames(r.fields.map((f) => f.name), sql), rows, rowCount: total, truncated: cut }
    } catch (err) {
      return failed(err)
    }
  }

  return { run }
}
