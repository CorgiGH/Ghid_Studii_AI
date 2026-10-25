// Named mistakes: when a wrong answer has the signature of a classic Oracle trap, say which one.
//
//   detectMistake({ sql, actual, expected, spec }) -> MistakeId | null
//
// MistakeId = 'eq-null' | 'inner-vs-left' | 'missing-join-cond' | 'char-trim' | 'self-pair-name' | 'minus-name-collapse'
//           | 'and-or' | 'dml-no-where' | 'distinct-first-col' | 'case-literal'
//
// Each detector looks at the learner's SQL text and at how the wrong result differs from the expected one, so a correct
// answer, or a query that merely contains the same words, is never named. The text checks run on the SQL with strings and
// comments blanked out. Texts for each id are in src/sql/explain.js (explainMistake).
import { diffRows } from './check.js'

// The SQL with every string, "quoted name" and comment replaced by spaces (same length); `strings` lists the string bodies.
function mask(sql) {
  let out = ''
  const strings = []
  let i = 0
  const n = sql.length
  while (i < n) {
    const c = sql[i]
    if (c === "'") {
      let j = i + 1
      let body = ''
      while (j < n) {
        if (sql[j] === "'") {
          if (sql[j + 1] === "'") { body += "'"; j += 2; continue }
          break
        }
        body += sql[j]; j++
      }
      strings.push(body)
      out += "'" + ' '.repeat(Math.max(0, Math.min(j, n - 1) - i)) + (j < n ? "'" : '')
      i = j + 1
    } else if (c === '"') {
      const j = sql.indexOf('"', i + 1)
      const end = j < 0 ? n : j + 1
      out += ' '.repeat(end - i); i = end
    } else if (c === '-' && sql[i + 1] === '-') {
      const j = sql.indexOf('\n', i)
      const end = j < 0 ? n : j
      out += ' '.repeat(end - i); i = end
    } else if (c === '/' && sql[i + 1] === '*') {
      const j = sql.indexOf('*/', i + 2)
      const end = j < 0 ? n : j + 2
      out += ' '.repeat(end - i); i = end
    } else { out += c; i++ }
  }
  return { text: out, strings }
}

// Where the top-level clauses of the first query block start: { select, from, where, group, having, order, setop } -> index | -1
function clauseStarts(text) {
  const at = { select: -1, from: -1, where: -1, group: -1, having: -1, order: -1, setop: -1 }
  const names = { SELECT: 'select', FROM: 'from', WHERE: 'where', GROUP: 'group', HAVING: 'having', ORDER: 'order', UNION: 'setop', MINUS: 'setop', INTERSECT: 'setop' }
  let depth = 0
  for (const m of text.matchAll(/[()]|[A-Za-z_][A-Za-z0-9_$#]*/g)) {
    if (m[0] === '(') depth++
    else if (m[0] === ')') depth--
    else if (depth === 0) {
      const key = names[m[0].toUpperCase()]
      if (key && at[key] < 0) at[key] = m.index
    }
  }
  return at
}

// text between a clause keyword and the next clause keyword that follows it
function clauseText(text, at, name) {
  const start = at[name]
  if (start < 0) return ''
  const next = Object.values(at).filter((p) => p > start)
  const end = next.length ? Math.min(...next) : text.length
  return text.slice(start, end).replace(/^[A-Za-z]+(\s+BY)?/i, '')
}

// the part of a text that is not inside parentheses
function topLevel(text) {
  let depth = 0
  let out = ''
  for (const c of text) {
    if (c === '(') { if (depth++ === 0) out += ' ' } else if (c === ')') depth--
    else if (depth === 0) out += c
  }
  return out
}

// cells that end in a blank (the padding of a CHAR(n) value)
const paddedCells = (rows) => rows.reduce((n, r) => n + r.filter((v) => typeof v === 'string' && / $/.test(v)).length, 0)
const NAME_COLUMN = /NUME|NAME|TITLU/i
// does a name column of the answer hold the same value twice (homonyms)?
function repeatsAName(expected) {
  return (expected.columns ?? []).some((col, c) => {
    if (!NAME_COLUMN.test(String(col))) return false
    const seen = new Set()
    for (const r of expected.rows) {
      const v = r[c] === null || r[c] === undefined ? null : String(r[c]).trim()
      if (v === null) continue
      if (seen.has(v)) return true
      seen.add(v)
    }
    return false
  })
}
const hasOuter = (t) => /\b(LEFT|RIGHT|FULL)\b/i.test(t) || /\(\s*\+\s*\)/.test(t)
const trimCell = (v) => (v === null || v === undefined ? null : String(v).trim())
const trimRows = (rows) => rows.map((r) => r.map(trimCell))
const bagEqual = (a, b) => {
  const d = diffRows(a, b)
  return !d.missing.length && !d.extra.length
}

// Do the missing rows look like the padding of an outer join? The columns that hold NULL (or '0', what COUNT gives a group with
// no partner) in a missing row while no row of the learner's answer has that value there.
function outerPaddedColumns(missing, actualRows) {
  const width = missing[0]?.length ?? 0
  const cols = []
  for (let c = 0; c < width; c++) {
    for (const pad of [null, '0']) {
      const same = (v) => (pad === null ? v === null || v === undefined : v !== null && v !== undefined && String(v).trim() === pad)
      if (missing.some((r) => same(r[c])) && !actualRows.some((r) => same(r[c]))) { cols.push(c); break }
    }
  }
  return cols
}

// The names (alias, else table) of the FROM clause in order: the first is the table a LEFT JOIN keeps whole, the others are the
// ones it pads with NULL. Null when the clause has a subquery or cannot be read.
function fromNames(text, at) {
  const from = topLevel(clauseText(text, at, 'from'))
  if (/\(\s*SELECT\b/i.test(clauseText(text, at, 'from'))) return null
  const factors = from.split(/,|\b(?:NATURAL\s+|CROSS\s+|INNER\s+|(?:LEFT|RIGHT|FULL)(?:\s+OUTER)?\s+)?JOIN\b/i)
  const names = []
  for (const f of factors) {
    const words = f.replace(/\b(ON|USING)\b[\s\S]*$/i, '').trim().split(/\s+/).filter(Boolean)
    if (!words.length) return null
    const last = words[words.length - 1].replace(/^.*\./, '')
    names.push(last.toLowerCase())
  }
  return names
}

// The table alias a select-list item reads its column from (s.nume, COUNT(n.valoare) -> 's', 'n'), or null when it names none.
function itemQualifiers(text, at) {
  const list = clauseText(text, at, 'select').replace(/^\s*(DISTINCT|UNIQUE|ALL)\b/i, '')
  const items = []
  let depth = 0
  let cur = ''
  for (const c of list) {
    if (c === '(') depth++
    else if (c === ')') depth--
    if (c === ',' && depth === 0) { items.push(cur); cur = '' } else cur += c
  }
  items.push(cur)
  return items.map((it) => (/\b([A-Za-z_][\w$#]*)\s*\.\s*[A-Za-z_"]/.exec(it)?.[1] ?? null)?.toLowerCase() ?? null)
}

// number of tables in the FROM list, and how many join conditions the text provides
function joinShape(text, at) {
  const from = topLevel(clauseText(text, at, 'from'))
  const joins = (from.match(/\bJOIN\b/gi) ?? []).length
  const commas = (from.match(/,/g) ?? []).length
  const tables = joins + commas + 1
  const crossJoins = (from.match(/\bCROSS\s+JOIN\b/gi) ?? []).length
  let conditions = (from.match(/\b(ON|USING)\b/gi) ?? []).length + (from.match(/\bNATURAL\b/gi) ?? []).length
  const where = clauseText(text, at, 'where')
  for (const m of where.matchAll(/(\w+)\.\w+\s*(?:\(\s*\+\s*\))?\s*=\s*(\w+)\.\w+/g)) if (m[1].toLowerCase() !== m[2].toLowerCase()) conditions++
  return { tables, conditions, crossJoins }
}

export function detectMistake({ sql, actual, expected, spec }) {
  if (typeof sql !== 'string' || !sql.trim()) return null
  const { text, strings } = mask(sql)
  const at = clauseStarts(text)

  // a DELETE or UPDATE that touches every row, in any statement of the script
  if (text.split(';').some((st) => /^\s*(DELETE|UPDATE)\b/i.test(st) && !/\bWHERE\b/i.test(st))) return 'dml-no-where'
  if (spec?.kind === 'state' || !actual || actual.error || !Array.isArray(actual.rows) || !expected?.rows) return null
  const diff = diffRows(actual.rows, expected.rows)
  if (!diff.missing.length && !diff.extra.length) return null // the rows are right: nothing to name

  // CHAR columns are padded with blanks: the rows match once the blanks are cut off. Only the learner's blanks are a mistake to
  // name (cut them with TRIM); when the answer keeps the padding and the learner cut it, TRIM is not the fix.
  if (bagEqual(trimRows(actual.rows), trimRows(expected.rows))) return paddedCells(diff.extra) > paddedCells(diff.missing) ? 'char-trim' : null

  // = NULL / <> NULL in a condition (UPDATE ... SET x = NULL is not a condition)
  const condition = /^\s*UPDATE\b/i.test(text) ? text.slice(Math.max(0, text.search(/\bWHERE\b/i))) : text
  if (/(=|<>|!=|\^=)\s*NULL\b/i.test(condition) || /\bNULL\s*(=|<>|!=|\^=)/i.test(condition)) return 'eq-null'

  const { tables, conditions, crossJoins } = joinShape(text, at)

  // too many rows because a table is not tied to the others
  if (tables >= 2 && (conditions < tables - 1 || crossJoins > 0) && actual.rows.length > expected.rows.length) return 'missing-join-cond'

  // the same table twice, paired on a name with < > <>: homonyms are lost
  const namePair = /\b(\w+)\.(nume|prenume)\s*(<>|!=|<|>)\s*(\w+)\.\2\b/i.exec(text)
  if (namePair && namePair[1].toLowerCase() !== namePair[4].toLowerCase() && diff.missing.length) return 'self-pair-name'

  // MINUS on names: people with the same name merge into one row, so rows are missing (only possible when the answer has a name
  // column that repeats a value)
  if (/\bMINUS\b/i.test(text) && actual.rows.length < expected.rows.length && !diff.extra.length && repeatsAName(expected)) return 'minus-name-collapse'

  // AND and OR mixed with no parentheses (the AND of BETWEEN .. AND is not a condition)
  const where = topLevel(clauseText(text, at, 'where')).replace(/\bBETWEEN\b[\s\S]*?\bAND\b/gi, 'BETWEEN ')
  if (/\bAND\b/i.test(where) && /\bOR\b/i.test(where)) return 'and-or'

  // a text literal in the wrong case, so the condition finds fewer rows than it should
  if (actual.rows.length < expected.rows.length && strings.length) {
    const cells = expected.rows.flat().map((v) => (v === null ? '' : String(v).trim()))
    for (const lit of strings) {
      const core = lit.replace(/[%_]/g, '').trim()
      if (!/[A-Za-z]{2}/.test(core)) continue
      const sensitive = cells.some((c) => c.includes(core))
      const insensitive = cells.some((c) => c.toLowerCase().includes(core.toLowerCase()))
      if ((insensitive && !sensitive) || (actual.rows.length === 0 && core === core.toLowerCase() && core.length >= 3)) return 'case-literal'
    }
  }

  // an inner join where the exercise wants the rows without a partner too: the missing rows are the ones an outer join pads
  // with NULL (or with 0 from COUNT) in columns where the learner's rows have no NULL (or 0)
  // (an outer join pads the columns of the tables after the first one; a NULL in a column of the first table is something else)
  if (tables >= 2 && !hasOuter(text) && !/\bMINUS\b|\bUNION\b|\bINTERSECT\b/i.test(text) && !diff.extra.length && diff.missing.length) {
    const padded = outerPaddedColumns(diff.missing, actual.rows)
    const names = fromNames(text, at)
    const quals = itemQualifiers(text, at)
    const outer = (c) => !names || quals.length !== expected.rows[0]?.length || quals[c] === null || names.slice(1).includes(quals[c])
    if (padded.some(outer)) return 'inner-vs-left'
  }

  // DISTINCT with several columns while the expected answer has one row per first-column value
  const selectList = topLevel(clauseText(text, at, 'select'))
  if (/^\s*DISTINCT\b/i.test(selectList) && (selectList.match(/,/g) ?? []).length >= 1 && actual.rows.length > expected.rows.length) {
    const firstValues = new Set(actual.rows.map((r) => String(r[0])))
    if (firstValues.size === expected.rows.length) return 'distinct-first-col'
  }

  return null
}
