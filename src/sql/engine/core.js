// The engine: Oracle-flavoured SQL in, Oracle-flavoured result out, on top of a PGlite instance.
//
//   const engine = await createEngine(pg, { clock: '2026-10-26 14:30:00', datasets: { facultate: sqlText } })
//   const result = await engine.run('SELECT nume FROM studenti', { dataset: 'facultate' })
//
// `pg` is a ready PGlite. The compat layer (../compat/*.sql, in file-name order) is installed once; a dataset is
// loaded the first time a run asks for it. Cells in the Result are already Oracle display text.
import { rewriteOracle } from '../rewrite/index.js'
import { mapPgError, OracleError } from './errors.js'
import { displayNames, formatCell } from './format.js'

// Compat files as raw text, sorted by file name (00-base ... 70-ddl). Vite inlines them into this (lazy) chunk.
const COMPAT_FILES = import.meta.glob('../compat/*.sql', { query: '?raw', import: 'default', eager: true })

// PGlite would turn numeric / date / bigint cells into JS numbers and Date objects; the engine wants the raw text.
const RAW_TEXT_PARSERS = { 20: (v) => v, 1082: (v) => v, 1114: (v) => v, 1184: (v) => v, 1700: (v) => v }

const TIMESTAMP_OID = 1114
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

// ALTER SESSION SET <parameter> = <value> [<parameter> = <value> ...]. Supported: the date language (NLS_DATE_LANGUAGE,
// NLS_LANGUAGE: AMERICAN / ENGLISH, ROMANIAN, FRENCH, GERMAN) and the defaults of everything else (NLS_TERRITORY AMERICA,
// NLS_DATE_FORMAT DD-MON-RR, NLS_NUMERIC_CHARACTERS '.,'), so a script can restore the defaults. Any other value is
// ORA-12705; an unknown parameter is ORA-02248.
const ALTER_SESSION_RE = /^\s*ALTER\s+SESSION\s+SET\s+([\s\S]*?)\s*;?\s*$/i
const SESSION_PAIR_RE = /([A-Za-z_]+)\s*=\s*('(?:[^']|'')*'|"[^"]*"|[^\s]+)/g
const unquote = (v) => v.replace(/^['"]|['"]$/g, '').replace(/''/g, "'")

export function parseAlterSession(sql) {
  const m = ALTER_SESSION_RE.exec(sql)
  if (!m) return null
  const pairs = [...m[1].matchAll(SESSION_PAIR_RE)].map((x) => [x[1].toUpperCase(), unquote(x[2])])
  if (!pairs.length) throw new OracleError('ORA-00922', 'missing or invalid option')
  return pairs
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
  // Session NLS state, mirrored from the ora_session table so that result cells can be formatted in the session's language and
  // date format. A default session formats DATE cells in JavaScript; any other goes through ora_to_char_date.
  const session = { lang: 'AMERICAN', dateFormat: 'DD-MON-RR' }
  const sessionIsDefault = () => session.lang === 'AMERICAN' && session.dateFormat === 'DD-MON-RR'

  async function alterSession(pairs) {
    const unsupported = (name, value) => new OracleError('ORA-12705', `${name} = ${value} is not supported by this practice database (cannot access NLS data files or invalid environment specified)`)
    let lang = null
    let dateFormat = null
    for (const [name, value] of pairs) {
      const v = value.toUpperCase()
      if (name === 'NLS_LANGUAGE' || name === 'NLS_DATE_LANGUAGE') {
        const key = v === 'ENGLISH' ? 'AMERICAN' : v
        const r = await pg.query('SELECT 1 FROM ora_nls_names WHERE lang = $1 LIMIT 1', [key])
        if (!r.rows.length) throw new OracleError('ORA-12705', 'cannot access NLS data files or invalid environment specified')
        if (name === 'NLS_DATE_LANGUAGE' || lang === null) lang = key
      } else if (name === 'NLS_TERRITORY') {
        if (v !== 'AMERICA') throw unsupported(name, value)
        if (dateFormat === null) dateFormat = 'DD-MON-RR' // the territory brings its default date format back
      } else if (name === 'NLS_DATE_FORMAT') {
        await pg.query(`SELECT ora_to_char_date(timestamp '2000-01-01', $1, 'AMERICAN')`, [value]) // a model Oracle would refuse raises here
        dateFormat = value
      } else if (name === 'NLS_NUMERIC_CHARACTERS') {
        if (value !== '.,') throw unsupported(name, value)
      } else {
        throw new OracleError('ORA-00922', 'missing or invalid option')
      }
    }
    if (lang !== null) session.lang = lang
    if (dateFormat !== null) session.dateFormat = dateFormat
    await pg.query('UPDATE ora_session SET lang = $1, datefmt = $2', [session.lang, session.dateFormat])
  }

  // DATE cells of a non-default session: one query formats every distinct value
  async function formatDates(rows, fields) {
    const cols = fields.map((f, i) => (f.dataTypeID === TIMESTAMP_OID ? i : -1)).filter((i) => i >= 0)
    if (!cols.length || sessionIsDefault()) return null
    const values = [...new Set(cols.flatMap((i) => rows.map((r) => r[i])).filter((v) => v !== null && v !== undefined))]
    if (!values.length) return new Map()
    const r = await pg.query('SELECT v, ora_to_char_date(v::timestamp, $2, $3) FROM unnest($1::text[]) v', [values, session.dateFormat, session.lang], { rowMode: 'array' })
    return new Map(r.rows.map(([v, t]) => [v, t]))
  }

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
    const failed = async (err) => {
      const context = { sql }
      if (err && err.code === '42883') {
        const fn = (String(err.message).match(/function ([A-Za-z_0-9]+)\(/) || [])[1]
        if (fn) context.knownFunction = (await pg.query('SELECT 1 FROM pg_proc WHERE proname = $1 LIMIT 1', [fn.toLowerCase()])).rows.length > 0
      }
      return { kind, columns: [], rows: [], rowCount: 0, truncated: false, error: mapPgError(err, context) }
    }
    try {
      const pairs = parseAlterSession(sql)
      if (pairs) {
        await alterSession(pairs)
        return { kind: 'ddl', columns: [], rows: [], rowCount: 0, truncated: false }
      }
    } catch (err) {
      return failed(err)
    }
    let rewritten
    try {
      rewritten = rewriteOracle(sql)
    } catch (err) {
      // What Oracle rejects arrives as an OracleError and is the learner's answer. Anything else is a bug in a rewrite pass:
      // let it surface instead of dressing it up as an Oracle error.
      if (err instanceof OracleError) return failed(err)
      throw err
    }
    try {
      const r = await pg.query(rewritten.sql, [], { rowMode: 'array', parsers: RAW_TEXT_PARSERS })
      const total = r.rows.length
      const cut = maxRows != null && total > maxRows
      const kept = cut ? r.rows.slice(0, maxRows) : r.rows
      const dates = await formatDates(kept, r.fields)
      const rows = kept.map((row) => row.map((v, i) => (dates && r.fields[i].dataTypeID === TIMESTAMP_OID && v != null ? (dates.get(v) ?? null) : formatCell(v, r.fields[i].dataTypeID, -1))))
      if (kind !== 'rows') return { kind, columns: [], rows: [], rowCount: r.affectedRows ?? 0, truncated: false }
      return { kind, columns: displayNames(r.fields.map((f) => f.name), sql), rows, rowCount: total, truncated: cut }
    } catch (err) {
      return failed(err)
    }
  }

  return { run }
}
