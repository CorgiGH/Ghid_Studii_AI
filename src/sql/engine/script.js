// The SQL*Plus side of a run: cutting a script into statements and recognising the statements that are not SQL
// (DESCRIBE, COMMIT, ROLLBACK [TO], SAVEPOINT). Pure functions, no database.
import { isSig, isSym, isWord, tokenize } from '../rewrite/tokens.js'

const hasCode = (text) => tokenize(text).some(isSig)

// SQL*Plus ends a statement at a `;` or at a line that holds only `/`. A line `DESCRIBE x` ends at the end of the line.
// Strings, "quoted names" and comments are skipped over. A `/` line with nothing before it is ignored (SQL*Plus would run
// the previous statement again; a practice script that does that is a typing mistake, not something to reproduce).
export function splitScript(text) {
  const out = []
  let cur = ''
  const flush = () => {
    if (hasCode(cur)) out.push(cur.trim())
    cur = ''
  }
  const n = text.length
  let i = 0
  while (i < n) {
    const c = text[i]
    if (c === "'" || c === '"') {
      let j = i + 1
      while (j < n) {
        if (text[j] === c) {
          if (text[j + 1] === c) { j += 2; continue }
          break
        }
        j++
      }
      cur += text.slice(i, j + 1)
      i = j + 1
    } else if (c === '-' && text[i + 1] === '-') {
      let j = text.indexOf('\n', i)
      if (j < 0) j = n
      cur += text.slice(i, j)
      i = j
    } else if (c === '/' && text[i + 1] === '*') {
      let j = text.indexOf('*/', i + 2)
      j = j < 0 ? n : j + 2
      cur += text.slice(i, j)
      i = j
    } else if (c === ';') {
      flush()
      i++
    } else if (c === '/' && /^[ \t]*$/.test(text.slice(text.lastIndexOf('\n', i - 1) + 1, i)) && /^[ \t\r]*(\n|$)/.test(text.slice(i + 1))) {
      flush()
      const j = text.indexOf('\n', i)
      i = j < 0 ? n : j + 1
    } else if (c === '\n') {
      cur += c
      i++
      if (parseDescribe(cur) !== null) flush()
    } else {
      cur += c
      i++
    }
  }
  flush()
  return out
}

const sigTokens = (sql) => {
  const ts = tokenize(sql).filter(isSig)
  while (ts.length && (isSym(ts[ts.length - 1], ';') || isSym(ts[ts.length - 1], '/'))) ts.pop()
  return ts
}
const nameOf = (t) => (t.type === 'qident' ? t.text.slice(1, -1) : t.text.toUpperCase())

// DESCRIBE name  /  DESC name   ->   the table name in upper case, else null
export function parseDescribe(sql) {
  const ts = sigTokens(sql)
  if (ts.length === 2 && (isWord(ts[0], 'DESCRIBE') || isWord(ts[0], 'DESC')) && (ts[1].type === 'word' || ts[1].type === 'qident')) return nameOf(ts[1])
  return null
}

// COMMIT [WORK] | ROLLBACK [WORK] | ROLLBACK [WORK] TO [SAVEPOINT] name | SAVEPOINT name
//   -> { op: 'commit' | 'rollback' | 'rollback-to' | 'savepoint', name?: lower-case name }, else null
export function parseTransactionControl(sql) {
  const ts = sigTokens(sql)
  const isId = (t) => t && (t.type === 'word' || t.type === 'qident')
  const name = (t) => (t.type === 'qident' ? t.text.slice(1, -1) : t.text.toLowerCase())
  if (!ts.length) return null
  if (isWord(ts[0], 'SAVEPOINT') && ts.length === 2 && isId(ts[1])) return { op: 'savepoint', name: name(ts[1]) }
  if (isWord(ts[0], 'COMMIT')) {
    const rest = ts.slice(1)
    if (!rest.length || (rest.length === 1 && isWord(rest[0], 'WORK'))) return { op: 'commit' }
    return null
  }
  if (isWord(ts[0], 'ROLLBACK')) {
    let i = 1
    if (isWord(ts[i], 'WORK')) i++
    if (i === ts.length) return { op: 'rollback' }
    if (isWord(ts[i], 'TO')) {
      i++
      if (isWord(ts[i], 'SAVEPOINT')) i++
      if (i === ts.length - 1 && isId(ts[i])) return { op: 'rollback-to', name: name(ts[i]) }
    }
  }
  return null
}

// Words that would end or restart the outer PostgreSQL transaction of a run (END, ABORT, BEGIN, START, RELEASE, PREPARE), and
// any COMMIT / ROLLBACK / SAVEPOINT that parseTransactionControl did not recognise. Oracle has no such statement (a lone END
// is what a PL/SQL block leaves behind once it is cut at its inner ';'), so the engine answers ORA-00900 instead of sending it.
const FOREIGN_FIRST_WORDS = ['END', 'ABORT', 'BEGIN', 'START', 'RELEASE', 'PREPARE', 'COMMIT', 'ROLLBACK', 'SAVEPOINT']
export function isForeignTransactionStatement(sql) {
  const ts = sigTokens(sql)
  return ts.length > 0 && FOREIGN_FIRST_WORDS.some((w) => isWord(ts[0], w))
}
