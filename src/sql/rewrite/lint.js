// Oracle 11g strictness: things PostgreSQL accepts (or reports differently) that Oracle 11g rejects, answered with the
// code Oracle gives. Runs on the learner's original text, before any rewrite.
//
//   lintOracle(sql) -> { code, message } | null       the first problem by position in the text
//
// Every code below was measured on the Oracle 11g container (see the probe entries in the differential corpus).
import { isSig, isSym, isWord, matchParen, selectListBounds, splitTop, tokenize } from './tokens.js'
import { usingQualifierProblem } from './pass-idents.js'

const MESSAGES = {
  'ORA-00905': 'missing keyword',
  'ORA-00907': 'missing right parenthesis',
  'ORA-00909': 'invalid number of arguments',
  'ORA-00920': 'invalid relational operator',
  'ORA-00923': 'FROM keyword not found where expected',
  'ORA-00928': 'missing SELECT keyword',
  'ORA-00933': 'SQL command not properly ended',
  'ORA-00936': 'missing expression',
}

// Words after which a literal or a '(' is normal inside a select-list item (an operator or a literal prefix)
const BEFORE_LITERAL = new Set(['DATE', 'TIMESTAMP', 'INTERVAL', 'N', 'NOT', 'AND', 'OR', 'IN', 'LIKE', 'BETWEEN', 'IS', 'THEN', 'ELSE', 'WHEN', 'CASE', 'ESCAPE', 'DISTINCT', 'UNIQUE', 'ALL', 'AS', 'ANY', 'SOME', 'SELECT', 'DEFAULT', 'BY', 'DAY', 'MONTH', 'YEAR', 'HOUR', 'MINUTE', 'SECOND', 'TO', 'AT', 'OVER', 'KEEP', 'WITHIN', 'FROM', 'EXISTS'])
// Words whose FROM is part of a function call (EXTRACT(YEAR FROM d)), not a FROM clause
const FROM_IN_CALL = new Set(['EXTRACT', 'TRIM', 'SUBSTRING', 'OVERLAY'])
const CLAUSE_END = new Set(['WHERE', 'GROUP', 'HAVING', 'ORDER', 'UNION', 'INTERSECT', 'MINUS', 'EXCEPT', 'CONNECT', 'START', 'FOR', 'SET', 'VALUES', 'SELECT'])
// A comparison / logic word or symbol that needs a right-hand side
const NEEDS_OPERAND_WORD = new Set(['WHERE', 'AND', 'OR', 'ON', 'HAVING', 'BY'])
const NEEDS_OPERAND_SYM = ['=', '<', '>', '<=', '>=', '<>', '!=', '^=', '||', '+', '-']
const NEXT_CLAUSE = new Set(['ORDER', 'GROUP', 'HAVING', 'UNION', 'INTERSECT', 'MINUS', 'EXCEPT'])

// AS between a table and its alias. After a plain JOIN (one that still wants ON / USING) Oracle misses a keyword (ORA-00905);
// after FROM, a comma, NATURAL JOIN or CROSS JOIN the statement just ends too early (ORA-00933).
function asAfterTable(ts, as) {
  let d = 0
  for (let j = as - 1; j >= 0; j--) {
    if (isSym(ts[j], ')')) d++
    else if (isSym(ts[j], '(')) d--
    else if (d === 0 && (isWord(ts[j], 'FROM') || isSym(ts[j], ','))) return 'ORA-00933'
    else if (d === 0 && isWord(ts[j], 'JOIN')) {
      let k = j - 1
      while (k >= 0 && ['INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER'].some((q) => isWord(ts[k], q))) k--
      return k >= 0 && (isWord(ts[k], 'NATURAL') || isWord(ts[k], 'CROSS')) ? 'ORA-00933' : 'ORA-00905'
    }
  }
  return 'ORA-00933'
}

export function lintOracle(sql) {
  let ts = tokenize(sql).filter(isSig)
  while (ts.length && (isSym(ts[ts.length - 1], ';') || isSym(ts[ts.length - 1], '/'))) ts = ts.slice(0, -1)
  const found = []
  const add = (idx, code, message = MESSAGES[code]) => found.push({ idx, code, message })
  const prevIsDot = (i) => i > 0 && isSym(ts[i - 1], '.')
  const w = (i) => (ts[i] && ts[i].type === 'word' && !prevIsDot(i) ? ts[i].text.toUpperCase() : '')

  // ---- word-level checks ----------------------------------------------------------------------------------------
  const owners = [] // word before each open '(' , to tell EXTRACT(.. FROM ..) from a FROM clause
  const inFrom = [false]
  for (let i = 0; i < ts.length; i++) {
    const x = ts[i]
    const u = w(i)
    const depth = owners.length
    if (isSym(x, '(')) {
      owners.push(ts[i - 1] && ts[i - 1].type === 'word' ? ts[i - 1].text.toUpperCase() : '')
      inFrom[owners.length] = false
      continue
    }
    if (isSym(x, ')')) {
      owners.pop()
      continue
    }
    if (!u) continue
    if (u === 'FROM') {
      if (!FROM_IN_CALL.has(owners[depth - 1])) inFrom[depth] = true
    } else if (CLAUSE_END.has(u)) inFrom[depth] = false
    else if (u === 'AS' && inFrom[depth]) add(i, asAfterTable(ts, i)) // FROM studenti AS s
    if ((u === 'LIMIT' || u === 'OFFSET') && ts[i + 1] && ts[i + 1].type === 'number') add(i, 'ORA-00933')
    else if (u === 'FETCH' && (isWord(ts[i + 1], 'FIRST') || isWord(ts[i + 1], 'NEXT'))) add(i, 'ORA-00933')
    else if (u === 'EXCEPT') add(i, 'ORA-00933') // Oracle 11g spells it MINUS
    else if ((u === 'INTERSECT' || u === 'MINUS') && isWord(ts[i + 1], 'ALL')) add(i + 1, 'ORA-00928')
    else if (u === 'ILIKE') add(i, 'ORA-00920')
    else if (u === 'CONCAT' && isSym(ts[i + 1], '(')) {
      const c = matchParen(ts, i + 1)
      if (c > 0 && (c === i + 2 ? 0 : splitTop(ts.slice(i + 2, c)).length) !== 2) add(i, 'ORA-00909')
    } else if (/^pg_/i.test(ts[i].text) && !isSym(ts[i + 1], '(')) add(i, 'ORA-00942', 'table or view does not exist')
    else if (/^pg_/i.test(ts[i].text)) add(i, 'ORA-00904', `"${ts[i].text.toUpperCase()}": invalid identifier`)
    else if (u === 'INFORMATION_SCHEMA') add(i, 'ORA-00942', 'table or view does not exist')
    // IN ( ) and other empty operand lists
    if (u === 'IN' && isSym(ts[i + 1], '(') && isSym(ts[i + 2], ')')) add(i + 2, 'ORA-00936')
  }

  // ---- '::' and select-list shapes ------------------------------------------------------------------------------
  const colonColon = (i) => isSym(ts[i], ':') && isSym(ts[i + 1], ':')
  const inSelectList = new Set()
  for (let s = 0; s < ts.length; s++) {
    if (w(s) !== 'SELECT') continue
    const { start, end } = selectListBounds(ts, s)
    for (let i = start; i < end; i++) inSelectList.add(i)
    let at = start
    for (const item of splitTop(ts.slice(start, end))) {
      const base = at
      at += item.length + 1
      let depth = 0
      for (let k = 0; k < item.length; k++) {
        const t = item[k]
        if (isSym(t, '(')) depth++
        else if (isSym(t, ')')) depth--
        if (colonColon(base + k)) add(base + k, 'ORA-00923') // an::text
        if (depth !== 0) continue
        const nx = item[k + 1]
        // SELECT TOP 2 nume: a name followed by a literal is two expressions with no comma between them
        if (t.type === 'word' && nx && (nx.type === 'number' || nx.type === 'string') && !BEFORE_LITERAL.has(t.text.toUpperCase())) add(base + k + 1, 'ORA-00923')
        // SELECT 'a' TO_CHAR(..): a literal, an alias, then more
        if ((t.type === 'string' || t.type === 'number') && nx && nx.type === 'word' && !BEFORE_LITERAL.has(nx.text.toUpperCase()) && isSym(item[k + 2], '(')) add(base + k + 2, 'ORA-00923')
      }
    }
  }
  for (let i = 0; i < ts.length; i++) if (colonColon(i) && !inSelectList.has(i)) add(i, 'ORA-00920') // WHERE x::int = 1

  // ---- missing expression -----------------------------------------------------------------------------------------
  for (let i = 0; i < ts.length; i++) {
    const x = ts[i]
    const n = ts[i + 1]
    const nw = n ? w(i + 1) : ''
    if (isSym(x, '+') && isSym(ts[i - 1], '(') && isSym(n, ')')) continue // the (+) outer-join marker
    const endsHere = !n || isSym(n, ')') || NEXT_CLAUSE.has(nw)
    if (isWord(x, 'SELECT') && n && isWord(n, 'FROM')) add(i + 1, 'ORA-00936')
    else if (isSym(x, ',') && (!n || isSym(n, ')') || isSym(n, ',') || nw === 'FROM' || nw === 'WHERE' || NEXT_CLAUSE.has(nw))) add(i + 1, 'ORA-00936')
    else if (((x.type === 'word' && NEEDS_OPERAND_WORD.has(w(i))) || NEEDS_OPERAND_SYM.some((c) => isSym(x, c))) && endsHere) add(i + 1, 'ORA-00936')
  }

  // ---- parentheses -------------------------------------------------------------------------------------------------
  const open = []
  for (let i = 0; i < ts.length; i++) {
    if (isSym(ts[i], '(')) open.push(i)
    else if (isSym(ts[i], ')')) {
      if (open.length) open.pop()
      else {
        // a stray ')' inside a select list is "FROM not found", anywhere else the statement just ends too early
        let j = i - 1
        let d = 0
        let sawFrom = false
        for (; j >= 0; j--) {
          if (isSym(ts[j], ')')) d++
          else if (isSym(ts[j], '(')) d--
          else if (d === 0 && isWord(ts[j], 'FROM')) sawFrom = true
          else if (d === 0 && isWord(ts[j], 'SELECT')) break
        }
        add(i, j >= 0 && !sawFrom ? 'ORA-00923' : 'ORA-00933')
      }
    }
  }
  if (open.length) add(ts.length, 'ORA-00907')

  const using = usingQualifierProblem(ts)
  if (using) found.push(using)

  if (!found.length) return null
  found.sort((a, b) => a.idx - b.idx)
  return { code: found[0].code, message: found[0].message }
}
