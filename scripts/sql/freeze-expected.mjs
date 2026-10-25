// Freezes the expected answers of every graded SQL item from real Oracle 11g, then checks the engine reproduces them.
//
//   set -a; . ~/.config/bd-oracle.env; set +a
//   node scripts/sql/freeze-expected.mjs [--content <dir>] [--out <dir>] [--only <id>[,<id>...]]
//
// --content  where the lesson JSON lives (default src/content/bd): every sql-exercise block and every test question of type sql
// --out      where the answers go (default public/sql/expected), one file per item and dataset: <id>.<dataset>.json
// --only     freeze just these ids
//
// For each item the reference `solution` runs on Oracle against both datasets of its pair (facultate + facultate-hidden, or
// biblioteca + biblioteca-hidden), under the item's clock on the lab dataset and under the default clock (2026-10-26 14:30:00) on the hidden one, so a
// date typed by hand fails the hidden variant. An item with a `clock` is also compared with the engine under both clocks. Each dataset lives in its own Oracle schema (oracle-datasets.mjs), so
// solutions that DROP or UPDATE never touch the STUDENT lab tables.
//   query item: file = { columns, rows, probe? }; `probe` = the rows again under NLS_DATE_FORMAT='SYYYY-MM-DD', only when the result has DATE cells
//   state item: file = { TABLE: { columns, rows } } for each check.tables, read after the script ran
// Each `altSolutions` entry must give a result the item's check accepts against the main solution's answer. Then the solution runs on
// the engine and has to match the Oracle answer exactly; any mismatch makes the script exit non-zero (the answer is still written, the
// engine is what is wrong).
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { checkResult, PROBE_FORMAT } from '../../src/sql/check.js'
import { splitScript } from '../../src/sql/engine/script.js'
import { createServer } from 'vite'
import { substituteClock } from './oracle.mjs'
import { loadDatasetOnOracle, runOnDataset } from './oracle-datasets.mjs'

// The engine imports its compat SQL with import.meta.glob, which only Vite resolves: load the shared code through a Vite server.
const here = path.dirname(fileURLToPath(import.meta.url))
const vite = await createServer({ configFile: false, root: path.join(here, '..', '..'), appType: 'custom', logLevel: 'error', server: { middlewareMode: true, hmr: false, ws: false } })
const {
  DEFAULT_CLOCK, DEFAULT_CONTENT_DIR, DEFAULT_EXPECTED_DIR, clockFor, clockOf, collectExercises, datasetPair, datasetText, engineCache,
  engineDifference, expectedFile, oracleTypeText, specOf,
} = await vite.ssrLoadModule('/scripts/sql/freeze-lib.mjs')

const DATE_CELL = /^\d\d-[A-Z]{3}-\d\d$/
const PROBE_ON = `ALTER SESSION SET NLS_DATE_FORMAT='${PROBE_FORMAT}'`
const PROBE_OFF = "ALTER SESSION SET NLS_DATE_FORMAT='DD-MON-RR'"
const MAX = 100000

function args(argv) {
  const o = { content: DEFAULT_CONTENT_DIR, out: DEFAULT_EXPECTED_DIR, only: null }
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--content') o.content = path.resolve(argv[++i])
    else if (argv[i] === '--out') o.out = path.resolve(argv[++i])
    else if (argv[i] === '--only') o.only = new Set(argv[++i].split(','))
    else throw new Error(`unknown argument '${argv[i]}'`)
  }
  return o
}

const plain = (r) => ({ columns: r.columns, rows: r.rows })
const hasDates = (r) => r.rows.some((row) => row.some((c) => typeof c === 'string' && DATE_CELL.test(c)))

// Queries of one dataset and clock, one Oracle session: for each query [sql, probe on, sql again, probe off]
async function oracleQueries(dataset, clock, queries) {
  const statements = queries.flatMap((q) => [q, PROBE_ON, q, PROBE_OFF])
  const res = await runOnDataset(dataset, statements, { clock, maxRows: MAX })
  return queries.map((_, i) => ({ main: res[4 * i], probe: res[4 * i + 2] }))
}

// The clock is substituted into the SQL text, which leaks into the headers of unaliased expressions (the header would read
// MONTHS_BETWEEN(TO_DATE('2026-...'),...) instead of MONTHS_BETWEEN(SYSDATE,...)). Statements that use a clock function
// are run once more untouched, only to read the headers Oracle really prints.
async function oracleHeaders(dataset, sqls) {
  const need = [...new Set(sqls)].filter((q) => substituteClock(q, DEFAULT_CLOCK) !== q)
  const out = new Map()
  if (!need.length) return out
  const res = await runOnDataset(dataset, need, { clock: null, maxRows: 1 })
  need.forEach((q, i) => { if (!res[i].error) out.set(q, res[i].columns) })
  return out
}

// A state item: reload the dataset, run the script, read the check tables, all in one session
async function oracleState(dataset, clock, item) {
  await loadDatasetOnOracle(dataset, datasetText(dataset))
  const script = splitScript(item.solution)
  const tables = item.check.tables.map((t) => t.toUpperCase())
  // `check.structure`: the table definitions (DESCRIBE: type, length, NOT NULL) are part of the answer
  const describing = item.check.structure ? tables.map((t) => `SELECT column_name, data_type, data_length, data_precision, data_scale, nullable, char_length FROM user_tab_columns WHERE table_name = '${t}' ORDER BY column_id`) : []
  const res = await runOnDataset(dataset, [...script, ...tables.map((t) => `SELECT * FROM ${t}`), ...describing], { clock, maxRows: MAX })
  const failed = res.slice(0, script.length).findIndex((r) => r.error)
  if (failed >= 0) return { error: `statement ${failed + 1} (${script[failed].slice(0, 60)}...): ${res[failed].error.code} ${res[failed].error.message}` }
  const out = {}
  tables.forEach((t, i) => {
    const r = res[script.length + i]
    if (r.error) throw new Error(`reading ${t} after the script: ${r.error.code}`)
    out[t] = plain(r)
    if (describing.length) {
      const d = res[script.length + tables.length + i]
      if (d.error) throw new Error(`describing ${t}: ${d.error.code}`)
      out[t].describe = d.rows.map(([name, type, len, prec, scale, nullable, charLen]) => ({ name, nullable: nullable === 'Y', type: oracleTypeText(type, len, prec, scale, charLen) }))
    }
  })
  return { expected: out }
}

const main = async () => {
  const opts = args(process.argv.slice(2))
  let items = collectExercises(opts.content)
  if (opts.only) items = items.filter((i) => opts.only.has(i.id))
  fs.mkdirSync(opts.out, { recursive: true })
  const failures = []
  const warnings = []
  const fail = (item, dataset, msg) => failures.push(`${item.id} [${dataset}]: ${msg}`)
  const engineFor = engineCache()
  const frozen = new Map() // `${id}|${dataset}|${clock}` -> expected
  const frozenAlts = new Map() // `${id}|${dataset}|${clock}` -> [Oracle result of each altSolutions entry]
  let written = 0

  for (const base of ['facultate', 'biblioteca']) {
    for (const dataset of datasetPair(base)) {
      const mine = items.filter((i) => i.dataset === base)
      if (!mine.length) continue
      await loadDatasetOnOracle(dataset, datasetText(dataset))

      // ---- query items, grouped by clock
      const byClock = new Map()
      for (const item of mine.filter((i) => i.kind === 'query')) {
        for (const clock of new Set([clockOf(item.clock), DEFAULT_CLOCK])) {
          if (!byClock.has(clock)) byClock.set(clock, [])
          byClock.get(clock).push(item)
        }
      }
      for (const [clock, group] of byClock) {
        const sqls = group.flatMap((i) => [i.solution, ...i.altSolutions])
        const results = await oracleQueries(dataset, clock, sqls)
        const headers = await oracleHeaders(dataset, sqls)
        sqls.forEach((q, i) => { if (headers.has(q)) { results[i].main = { ...results[i].main, columns: headers.get(q) } } })
        let k = 0
        for (const item of group) {
          const main = results[k++]
          const alts = item.altSolutions.map(() => results[k++])
          if (main.main.error) { fail(item, dataset, `solution fails on Oracle: ${main.main.error.code} ${main.main.error.message}`); continue }
          const expected = plain(main.main)
          if (hasDates(main.main) && !main.probe.error) expected.probe = main.probe.rows
          frozen.set(`${item.id}|${dataset}|${clock}`, expected)
          const altResults = []
          frozenAlts.set(`${item.id}|${dataset}|${clock}`, altResults)
          alts.forEach((alt, a) => {
            if (alt.main.error) return fail(item, dataset, `altSolutions[${a}] fails on Oracle: ${alt.main.error.code}`)
            const altResult = { ...plain(alt.main), probe: hasDates(alt.main) ? alt.probe.rows : undefined }
            altResults[a] = altResult
            const v = checkResult(altResult, expected, specOf(item))
            if (!v.ok) fail(item, dataset, `altSolutions[${a}] differs from the solution (${v.kind}) on clock ${clock}`)
          })
        }
      }

      // ---- state items, each on a freshly loaded dataset
      for (const item of mine.filter((i) => i.kind === 'state')) {
        const clock = clockFor(item, dataset)
        const r = await oracleState(dataset, clock, item)
        if (r.error) { fail(item, dataset, `solution fails on Oracle: ${r.error}`); continue }
        frozen.set(`${item.id}|${dataset}|${clock}`, r.expected)
      }

      // ---- write the answers and compare with the engine
      for (const item of mine) {
        const clock = clockFor(item, dataset)
        const expected = frozen.get(`${item.id}|${dataset}|${clock}`)
        if (!expected) continue
        fs.writeFileSync(expectedFile(opts.out, item.id, dataset), JSON.stringify(expected) + '\n')
        written++
        const empty = item.kind === 'state' ? Object.values(expected).every((t) => !t.rows.length && !t.describe) : !expected.rows.length
        if (empty) warnings.push(`${item.id} [${dataset}]: the answer is empty, the exercise tells nothing on this dataset`)
        for (const c of new Set([clock, DEFAULT_CLOCK])) {
          const exp = frozen.get(`${item.id}|${dataset}|${c}`)
          if (!exp) continue
          const diff = await engineDifference({ ...item, clock: c === DEFAULT_CLOCK ? undefined : item.clock }, dataset, exp, engineFor)
          if (diff) fail(item, dataset, `engine differs from Oracle on clock ${c}: ${diff}`)
          // every altSolutions entry must be reproduced by the engine as well: a learner who writes it is graded by the engine
          const altOracle = frozenAlts.get(`${item.id}|${dataset}|${c}`) ?? []
          for (const [a, altExpected] of altOracle.entries()) {
            if (!altExpected) continue
            const altDiff = await engineDifference({ ...item, solution: item.altSolutions[a], altSolutions: [], clock: c === DEFAULT_CLOCK ? undefined : item.clock }, dataset, altExpected, engineFor)
            if (altDiff) fail(item, dataset, `engine differs from Oracle on altSolutions[${a}] (clock ${c}): ${altDiff}`)
          }
        }
      }
    }
  }

  // an exercise whose two datasets give the same answer cannot tell a hard-coded result from a real query
  for (const item of items) {
    const [a, b] = datasetPair(item.dataset).map((d) => frozen.get(`${item.id}|${d}|${clockFor(item, d)}`))
    if (a && b && !item.check.structure && JSON.stringify(a) === JSON.stringify(b)) warnings.push(`${item.id}: identical answer on ${item.dataset} and ${item.dataset}-hidden`)
  }

  console.log(`${items.length} items, ${written} answer files written to ${path.relative(process.cwd(), opts.out) || '.'}`)
  for (const w of warnings) console.warn(`warning: ${w}`)
  for (const f of failures) console.error(`FAIL ${f}`)
  process.exitCode = failures.length ? 1 : 0
}

main()
  .catch((e) => { console.error(e); process.exitCode = 2 })
  .finally(() => vite.close())
