// Result checker: is the learner's result the one the exercise asks for?
//
//   checkResult(actual, expected, spec) -> Verdict
//
//   query exercise: actual is a Result ({ columns, rows, error? ... }), expected is { columns, rows, probe? }
//   state exercise: actual is { TABLE: Result } (Engine.snapshot), expected is { TABLE: { columns, rows } }
//   spec = { order: 'any'|'required', orderBy?: string[], aliases?: 'any-distinct'|string[], mode: 'bag'|'set',
//            kind: 'query'|'state', tables?: string[], cosmetic?: (''|'trim-case')[] }
//
// What counts as the same result:
//   - cells are compared as the text Oracle displays, no number or date coercion ('0000000450' is not '450')
//   - mode 'bag' compares the rows as a multiset, mode 'set' first merges duplicate rows on both sides
//   - order 'any' ignores the order of the rows; order 'required' wants the sequence of the rows, except that rows with the
//     same `orderBy` key values may come in any order among themselves (ties are not an error)
//   - aliases: absent = the column headers are not compared; 'any-distinct' = any headers, but different from each other;
//     a list = those headers (case-insensitive, Oracle shows unquoted aliases in capitals), '' in the list = any header there
//   - cosmetic[i] = 'trim-case' compares column i after TRIM and upper-casing (day and month names, padding the exercise does
//     not ask about)
//   - a DATE shows as DD-MON-RR, which hides the century. `runWithProbe` runs the query a second time with
//     NLS_DATE_FORMAT='SYYYY-MM-DD' and attaches the rows as `probe`; when both sides carry a probe the probes must match too,
//     so a result with a wrong century fails even though it prints the same
//
// Verdict = { ok, kind, missing, extra, code?, message?, table? }  with kind one of
//   correct | rows | rowcount | order | columns | alias | error | not-oracle | structure | contents
// `missing` are expected rows the learner did not return, `extra` are returned rows that are not expected.
// `mistake` (a MistakeId) is not set here: src/sql/mistakes.js looks at the learner's SQL for that.

export const PROBE_FORMAT = 'SYYYY-MM-DD'
const DATE_CELL = /^\d\d-[A-Z]{3}-\d\d$/

// "not-oracle" = the strictness pass (src/sql/rewrite/lint.js) caught a PostgreSQL / MySQL / SQL Server habit and marked its
// error `dialect: true`. The code alone cannot say so: ORA-00923 is also a missing comma, ORA-00900 a PL/SQL block, and
// LIMIT answers ORA-00933 like any other tail of junk. Every other error keeps its own explanation (explainOra).

const NULL_KEY = '\u0000null'
const cellText = (v) => (v === null || v === undefined ? null : String(v))

// A cell as it is compared: null stays distinct from every text, 'trim-case' columns are trimmed and upper-cased.
function cellKey(v, mode) {
  const t = cellText(v)
  if (t === null) return NULL_KEY
  return mode === 'trim-case' ? t.trim().toUpperCase() : t
}
const rowKey = (row, cosmetic = []) => JSON.stringify(row.map((v, i) => cellKey(v, cosmetic[i])))

function dedupe(rows, cosmetic) {
  const seen = new Set()
  return rows.filter((r) => {
    const k = rowKey(r, cosmetic)
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

// Multiset difference of two row lists: { missing: expected rows the actual list lacks, extra: actual rows that are not expected }.
export function diffRows(actualRows, expectedRows, cosmetic = []) {
  const left = new Map()
  for (const r of actualRows) {
    const k = rowKey(r, cosmetic)
    ;(left.get(k) ?? left.set(k, []).get(k)).push(r)
  }
  const missing = []
  for (const r of expectedRows) {
    const bucket = left.get(rowKey(r, cosmetic))
    if (bucket?.length) bucket.pop()
    else missing.push(r.map(cellText))
  }
  const extra = []
  for (const bucket of left.values()) for (const r of bucket) extra.push(r.map(cellText))
  return { missing, extra }
}

const upper = (s) => String(s ?? '').toUpperCase()
const sameNames = (a, b) => a.length === b.length && a.every((n, i) => upper(n) === upper(b[i]))

function verdict(kind, extra = {}) {
  return { ok: kind === 'correct', kind, missing: [], extra: [], ...extra }
}

function errorVerdict(result) {
  const code = result.error.code
  return verdict(result.error.dialect === true ? 'not-oracle' : 'error', { code, message: result.error.message })
}

// Is the sequence right, given that rows with equal `orderBy` keys may swap? (the rows themselves already match as a multiset)
function sequenceMatches(actualRows, expectedRows, columns, spec, cosmetic) {
  const keyCols = (spec.orderBy ?? [])
    .map((name) => columns.findIndex((c) => upper(c) === upper(name)))
    .filter((i) => i >= 0)
  if (!keyCols.length) return actualRows.every((r, i) => rowKey(r, cosmetic) === rowKey(expectedRows[i], cosmetic))
  const keyOf = (r) => JSON.stringify(keyCols.map((i) => cellKey(r[i], cosmetic[i])))
  for (let lo = 0; lo < expectedRows.length;) {
    let hi = lo + 1
    while (hi < expectedRows.length && keyOf(expectedRows[hi]) === keyOf(expectedRows[lo])) hi++
    const a = actualRows.slice(lo, hi).map((r) => rowKey(r, cosmetic)).sort()
    const e = expectedRows.slice(lo, hi).map((r) => rowKey(r, cosmetic)).sort()
    if (a.some((k, i) => k !== e[i])) return false
    lo = hi
  }
  return true
}

function checkQuery(actual, expected, spec) {
  if (!actual || typeof actual !== 'object' || !Array.isArray(actual.columns)) {
    throw new TypeError('checkResult: a query exercise needs a Result as the actual value')
  }
  if (actual.error) return errorVerdict(actual)
  if (actual.kind && actual.kind !== 'rows') return verdict('structure', { message: 'the statement did not return rows' })
  const cosmetic = spec.cosmetic ?? []
  if (actual.columns.length !== expected.columns.length) return verdict('columns')

  const merge = spec.mode === 'set' ? (rows) => dedupe(rows, cosmetic) : (rows) => rows
  const aRows = merge(actual.rows)
  const eRows = merge(expected.rows)
  let { missing, extra } = diffRows(aRows, eRows, cosmetic)
  if (!missing.length && !extra.length && actual.probe && expected.probe) {
    ;({ missing, extra } = diffRows(merge(actual.probe), merge(expected.probe), cosmetic))
  }
  if (missing.length || extra.length) {
    return verdict(aRows.length === eRows.length ? 'rows' : 'rowcount', { missing, extra })
  }
  if (spec.order === 'required' && !sequenceMatches(aRows, eRows, expected.columns, spec, cosmetic)) return verdict('order')

  if (spec.aliases === 'any-distinct') {
    const names = actual.columns.map(upper)
    if (names.some((n) => !n) || new Set(names).size !== names.length) return verdict('alias')
  } else if (Array.isArray(spec.aliases)) {
    const wanted = spec.aliases
    if (wanted.length !== actual.columns.length || wanted.some((a, i) => a !== '' && upper(a) !== upper(actual.columns[i]))) return verdict('alias')
  }
  return verdict('correct')
}

function checkState(actual, expected, spec) {
  const upperKeys = (o) => Object.fromEntries(Object.entries(o ?? {}).map(([k, v]) => [k.toUpperCase(), v]))
  const a = upperKeys(actual)
  const e = upperKeys(expected)
  const tables = (spec.tables ?? Object.keys(e)).map((t) => t.toUpperCase())
  for (const t of tables) {
    if (!e[t]) throw new Error(`checkResult: no expected rows for table ${t}`)
    if (!a[t] || a[t].error) return verdict('structure', { table: t, message: a[t]?.error?.message ?? 'the table does not exist' })
    if (!sameNames(a[t].columns, e[t].columns)) return verdict('structure', { table: t })
  }
  for (const t of tables) {
    const merge = spec.mode === 'set' ? (rows) => dedupe(rows, []) : (rows) => rows
    const { missing, extra } = diffRows(merge(a[t].rows), merge(e[t].rows))
    if (missing.length || extra.length) return verdict('contents', { table: t, missing, extra })
  }
  return verdict('correct')
}

export function checkResult(actual, expected, spec) {
  return spec.kind === 'state' ? checkState(actual, expected, spec) : checkQuery(actual, expected, spec)
}

// Runs `sql` through `runner.run(sql, opts)` (an Engine or an SqlClient) and, when the result holds DATE cells, once more
// with a four-digit-year date format. The rows of that second run come back as `probe`.
export async function runWithProbe(runner, sql, opts) {
  const result = await runner.run(sql, opts)
  if (result.error || result.kind !== 'rows') return result
  if (!result.rows.some((r) => r.some((c) => typeof c === 'string' && DATE_CELL.test(c)))) return result
  await runner.run(`ALTER SESSION SET NLS_DATE_FORMAT='${PROBE_FORMAT}'`, opts)
  try {
    const second = await runner.run(sql, opts)
    return second.error ? result : { ...result, probe: second.rows }
  } finally {
    await runner.run(`ALTER SESSION SET NLS_DATE_FORMAT='DD-MON-RR'`, opts)
  }
}
