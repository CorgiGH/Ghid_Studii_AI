// The engine: Oracle-flavoured SQL in, Oracle-flavoured result out, on top of a PGlite instance.
//
//   const engine = await createEngine(pg, { clock: '2026-10-26 14:30:00', datasets: { facultate: sqlText } })
//   const result = await engine.run('SELECT nume FROM studenti', { dataset: 'facultate' })
//   const result = await engine.run(script, { dataset: 'facultate', script: true })   // SQL*Plus style: ; and / end a statement
//   await engine.describe('studenti', { dataset: 'facultate' })    // [{ name, nullable, type: 'VARCHAR2(10)' }]
//   await engine.snapshot({ dataset: 'facultate', tables: ['note'] })   // { NOTE: Result }
//
// Every run is one transaction that is always rolled back, so nothing a learner does (INSERT, DROP TABLE, COMMIT ...) reaches
// the next run. Inside a run COMMIT, ROLLBACK, SAVEPOINT and the implicit commit of DDL work like Oracle's, and a failed
// statement undoes only itself. A script returns the Result of its last statement plus `statements: [{ sql, kind, rowCount,
// error? }]`; it carries on after an error, as SQL*Plus does. describe() and snapshot() answer for the state the most recent
// run ended in when that run changed something, else for the untouched dataset.
//
// `pg` is a ready PGlite. The compat layer (../compat/*.sql, in file-name order) is installed once; a dataset is
// loaded the first time a run asks for it. Cells in the Result are already Oracle display text.
import { rewriteOracle } from '../rewrite/index.js'
import { dmlTarget } from '../rewrite/pass-ddl.js'
import { mapPgError, OracleError } from './errors.js'
import { displayNames, formatCell } from './format.js'
import { isForeignTransactionStatement, parseDescribe, parseTransactionControl, splitScript } from './script.js'

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

// `prebuilt: '<dataset>'` means pg was started from a data directory that already holds the compat layer, the clock and that
// dataset (scripts/sql/build-datadirs.mjs); only the session settings are restored.
export async function createEngine(pg, { clock, datasets, prebuilt = null }) {
  if (!CLOCK_RE.test(clock)) throw new Error(`clock must look like 'YYYY-MM-DD HH24:MI:SS', got '${clock}'`)
  await pg.waitReady
  if (prebuilt) {
    // session settings do not live in a data directory: replay every SET of the compat layer (time zone, search_path, DateStyle ...)
    for (const stmt of compatStatements().filter((x) => /^(?:\s*--[^\n]*\n)*\s*SET\s/i.test(x))) await pg.exec(stmt)
  } else {
    for (const stmt of compatStatements()) {
      try {
        await pg.exec(stmt)
      } catch (e) {
        throw new Error(`compat layer failed: ${e.message}\n${stmt.slice(0, 200)}`)
      }
    }
  }
  // the clock is a plain table: the default is set here (a data directory carries its own, but set it again to be sure), and a
  // run may ask for another one (`clock` option, for the exercises on the second clock)
  let currentClock = null
  async function setEngineClock(want) {
    if (!CLOCK_RE.test(want)) throw new Error(`clock must look like 'YYYY-MM-DD HH24:MI:SS', got '${want}'`)
    if (want === currentClock) return
    await pg.query('UPDATE ora_clock SET d = $1::timestamp', [want])
    currentClock = want
  }
  await setEngineClock(clock)

  let loaded = prebuilt
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
    await writeSession()
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

  // ---- one run = one transaction, always rolled back -------------------------------------------------------------------
  // ora_c is "the last COMMIT": ROLLBACK goes back to it, COMMIT (and a DDL statement) moves it forward. Every statement runs
  // under ora_s, so a statement that fails undoes only itself, as in Oracle (PostgreSQL would abort the whole transaction).
  // A run never leaves anything behind: the session's NLS settings live in JS and are written into the fresh transaction.
  // ALTER SESSION is not transactional: the JS session is the truth and is written back after every ROLLBACK
  const writeSession = () => pg.query('UPDATE ora_session SET lang = $1, datefmt = $2', [session.lang, session.dateFormat])
  async function begin() {
    await pg.query('BEGIN')
    if (!sessionIsDefault()) await writeSession() // before ora_c, so ROLLBACK keeps it
    await pg.query('SAVEPOINT ora_c')
  }
  async function commitPoint(tx) {
    await pg.query('RELEASE SAVEPOINT ora_c')
    await pg.query('SAVEPOINT ora_c')
    tx.savepoints = []
  }
  async function guarded(body) {
    await pg.query('SAVEPOINT ora_s')
    try {
      const r = await body()
      await pg.query('RELEASE SAVEPOINT ora_s')
      return r
    } catch (err) {
      await pg.query('ROLLBACK TO SAVEPOINT ora_s')
      await pg.query('RELEASE SAVEPOINT ora_s')
      throw err
    }
  }

  // result presentation shared by run and snapshot
  async function present(r, kind, sql, maxRows) {
    const total = r.rows.length
    const cut = maxRows != null && total > maxRows
    const kept = cut ? r.rows.slice(0, maxRows) : r.rows
    const dates = await formatDates(kept, r.fields)
    const rows = kept.map((row) => row.map((v, i) => (dates && r.fields[i].dataTypeID === TIMESTAMP_OID && v != null ? (dates.get(v) ?? null) : formatCell(v, r.fields[i].dataTypeID, -1))))
    return { kind, columns: displayNames(r.fields.map((f) => f.name), sql), rows, rowCount: total, truncated: cut }
  }
  const query = (text) => pg.query(text, [], { rowMode: 'array', parsers: RAW_TEXT_PARSERS })

  // The tables of the learner as they stand now: { schema: { TABLE: [{ name, nullable, type }] }, tables: { TABLE: Result } }
  async function inspect() {
    const cols = await query('SELECT table_name, column_name, data_type, data_length, data_precision, data_scale, nullable, char_length FROM user_tab_columns ORDER BY table_name, column_id')
    const schema = {}
    for (const [table, name, type, len, prec, scale, nullable, charLen] of cols.rows) {
      ;(schema[table] ??= []).push({ name, nullable: nullable === 'Y', type: oracleTypeText(type, len, prec, scale, charLen) })
    }
    const rels = await query('SELECT relname FROM ora_rels ORDER BY relname')
    const tables = {}
    for (const [rel] of rels.rows) {
      const text = `SELECT * FROM "${rel}"`
      tables[rel.toUpperCase()] = await present(await query(text), 'rows', text, null)
    }
    return { schema, tables }
  }

  // state after the most recent run that changed something (null: the last run left the dataset as it was)
  let lastState = null
  // runs, describe and snapshot take turns: each one owns the database connection while its transaction is open
  let queue = Promise.resolve()
  const exclusive = (fn) => {
    const p = queue.then(fn)
    queue = p.catch(() => {})
    return p
  }

  const textResult = (kind) => ({ kind, columns: [], rows: [], rowCount: 0, truncated: false })

  async function statement(sql, tx, maxRows) {
    const kind = statementKind(sql)
    const failed = async (err) => {
      const context = { sql }
      if (err && err.code === '42883') {
        const fn = (String(err.message).match(/function ([A-Za-z_0-9]+)\(/) || [])[1]
        if (fn) context.knownFunction = (await pg.query('SELECT 1 FROM pg_proc WHERE proname = $1 LIMIT 1', [fn.toLowerCase()])).rows.length > 0
      }
      return { ...textResult(kind), error: mapPgError(err, context) }
    }
    try {
      const pairs = parseAlterSession(sql)
      if (pairs) {
        await guarded(() => alterSession(pairs))
        return textResult('ddl')
      }
      const describing = parseDescribe(sql)
      if (describing !== null) {
        const cols = await guarded(() => describeNow(describing))
        if (!cols.length) throw new OracleError('ORA-04043', `object ${describing} does not exist`)
        return { kind: 'rows', columns: ['Name', 'Null?', 'Type'], rows: cols.map((c) => [c.name, c.nullable ? '' : 'NOT NULL', c.type]), rowCount: cols.length, truncated: false }
      }
      const control = parseTransactionControl(sql)
      if (control) {
        await transactionControl(control, tx)
        return textResult('tx')
      }
      if (isForeignTransactionStatement(sql)) throw new OracleError('ORA-00900', 'invalid SQL statement')
    } catch (err) {
      // an OracleError or a PostgreSQL error (it carries a SQLSTATE code) is the learner's answer; anything else is our bug
      if (!(err instanceof OracleError) && !(err && err.code)) throw err
      return failed(err)
    }
    let rewritten
    try {
      const target = dmlTarget(sql)
      rewritten = rewriteOracle(sql, { columns: target ? await columnsOf(target) : undefined })
    } catch (err) {
      // What Oracle rejects arrives as an OracleError and is the learner's answer. Anything else is a bug in a rewrite pass:
      // let it surface instead of dressing it up as an Oracle error.
      if (err instanceof OracleError) return failed(err)
      throw err
    }
    if (kind === 'dml' || kind === 'ddl') tx.changed = true
    // DDL commits what came before it and itself, also when it fails while running; a statement that does not parse commits nothing
    let result
    try {
      const r = await guarded(async () => {
        const out = await pg.query(rewritten.sql, [], { rowMode: 'array', parsers: RAW_TEXT_PARSERS })
        for (const extra of rewritten.post) await pg.query(extra)
        return out
      })
      result = kind !== 'rows' ? { ...textResult(kind), rowCount: kind === 'dml' ? (r.affectedRows ?? 0) : 0 } : await present(r, kind, sql, maxRows)
    } catch (err) {
      result = await failed(err)
      if (kind === 'ddl' && err.code === '42601') return result
    }
    if (kind === 'ddl') await commitPoint(tx)
    return result
  }

  // [{ name, date }] of a table in column order: what the rewriter needs to treat the values an INSERT / UPDATE assigns
  async function columnsOf(table) {
    const r = await pg.query(
      `SELECT a.attname, t.typname = 'ora_date' FROM pg_attribute a JOIN ora_rels r ON r.relid = a.attrelid JOIN pg_type t ON t.oid = a.atttypid
       WHERE r.relname = $1 AND a.attnum > 0 AND NOT a.attisdropped ORDER BY a.attnum`,
      [table],
      { rowMode: 'array' },
    )
    return r.rows.map(([name, date]) => ({ name, date }))
  }

  async function transactionControl({ op, name }, tx) {
    if (op === 'commit') return commitPoint(tx)
    if (op === 'rollback') {
      await pg.query('ROLLBACK TO SAVEPOINT ora_c')
      tx.savepoints = []
      await writeSession()
      return undefined
    }
    if (op === 'savepoint') {
      tx.savepoints = tx.savepoints.filter((n) => n !== name)
      await pg.query(`SAVEPOINT "u_${name}"`)
      tx.savepoints.push(name)
      return undefined
    }
    const at = tx.savepoints.lastIndexOf(name)
    if (at < 0) throw new OracleError('ORA-01086', `savepoint '${name.toUpperCase()}' never established in this session or is invalid`)
    await pg.query(`ROLLBACK TO SAVEPOINT "u_${name}"`)
    tx.savepoints.length = at + 1
    await writeSession()
    return undefined
  }

  async function describeNow(table) {
    const r = await query(`SELECT column_name, data_type, data_length, data_precision, data_scale, nullable, char_length FROM user_tab_columns WHERE table_name = '${table.replace(/'/g, "''")}' ORDER BY column_id`)
    return r.rows.map(([name, type, len, prec, scale, nullable, charLen]) => ({ name, nullable: nullable === 'Y', type: oracleTypeText(type, len, prec, scale, charLen) }))
  }

  // Back to a brand-new session: Oracle's default NLS settings and the default clock. Called when a screen or exercise opens, so
  // nothing a learner did earlier (ALTER SESSION ...) leaks into it.
  async function resetSession() {
    session.lang = 'AMERICAN'
    session.dateFormat = 'DD-MON-RR'
    lastState = null
    await writeSession()
    await setEngineClock(clock)
  }
  const reset = ({ dataset } = {}) =>
    exclusive(async () => {
      if (dataset) await loadDataset(dataset)
      await resetSession()
    })

  // `fresh: true` starts from a reset session; `clock` ('YYYY-MM-DD HH24:MI:SS') runs on that clock instead of the default
  async function run(sql, { dataset, maxRows, script = false, fresh = false, clock: runClock } = {}) {
    return exclusive(async () => {
      await loadDataset(dataset)
      if (fresh) await resetSession()
      await setEngineClock(runClock ?? clock)
      lastState = null
      await begin()
      const tx = { savepoints: [], changed: false }
      try {
        if (!script) {
          const result = await statement(sql, tx, maxRows)
          if (tx.changed) lastState = await inspect()
          return result
        }
        const statements = []
        let last = textResult('rows')
        for (const text of splitScript(sql)) {
          last = await statement(text, tx, maxRows)
          statements.push({ sql: text, kind: last.kind, rowCount: last.rowCount, ...(last.error ? { error: last.error } : {}) })
        }
        if (tx.changed) lastState = await inspect()
        return { ...last, statements }
      } finally {
        await pg.query('ROLLBACK')
      }
    })
  }

  // The column list of a table as DESCRIBE shows it: [{ name, nullable, type }] ([] when there is no such table).
  // It describes the state the last run ended in when that run changed something, else the untouched dataset.
  function describe(table, { dataset } = {}) {
    return exclusive(async () => {
      await loadDataset(dataset)
      const key = String(table).toUpperCase()
      return lastState ? (lastState.schema[key] ?? []) : describeNow(key)
    })
  }

  // The contents of the tables after the last run: { TABLE: Result }. `tables` (any case) limits it; a table that does not
  // exist comes back as a Result carrying ORA-00942.
  function snapshot({ dataset, tables } = {}) {
    return exclusive(async () => {
      await loadDataset(dataset)
      const state = lastState ?? (await inspect())
      if (!tables) return state.tables
      const out = {}
      for (const t of tables) {
        const key = String(t).toUpperCase()
        out[key] = state.tables[key] ?? { ...textResult('rows'), error: { code: 'ORA-00942', message: 'table or view does not exist' } }
      }
      return out
    })
  }

  return { run, describe, snapshot, reset }
}

// DESCRIBE's Type column, from the USER_TAB_COLUMNS values
function oracleTypeText(type, length, precision, scale, charLength) {
  if (type === 'CHAR' || type === 'VARCHAR2') return `${type}(${charLength || length})`
  if (type === 'FLOAT') return `FLOAT(${precision})`
  if (type === 'NUMBER') {
    if (precision === null && scale === null) return 'NUMBER'
    if (precision === null) return scale === '0' ? 'NUMBER(38)' : `NUMBER(*,${scale})`
    return scale === '0' ? `NUMBER(${precision})` : `NUMBER(${precision},${scale})`
  }
  return type
}
