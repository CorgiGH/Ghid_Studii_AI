// Set-operator pass.
//   MINUS  -> EXCEPT
//   a UNION b INTERSECT c is (a UNION b) INTERSECT c in Oracle (equal precedence, left to right); PostgreSQL binds
//   INTERSECT tighter, so a chain with an INTERSECT in it gets explicit parentheses.
//   Oracle 11g sorts the result of UNION / INTERSECT / MINUS (sort-based duplicate removal; all 27 observed results were
//   sorted, see the review): without ORDER BY the statement is wrapped so its rows come back ordered by all columns.
import { isSig, isSym, isWord, matchParen, nextSig, prevSig, raw, splitTop, trimSpace } from './tokens.js'

// real punctuation tokens: later passes and setOperatorSorts count them as parentheses
const PAREN_OPEN = { type: 'punct', text: '(' }
const PAREN_CLOSE = { type: 'punct', text: ')' }
const SET_WORDS = ['UNION', 'INTERSECT', 'EXCEPT', 'MINUS']

// a set-operator keyword: a word (not a qualified name part) or the raw EXCEPT that stands for MINUS
function isSetOperator(ts, i) {
  const x = ts[i]
  if (x.type !== 'word' && x.type !== 'raw') return false
  if (!SET_WORDS.includes(x.text.toUpperCase())) return false
  const p = prevSig(ts, i)
  return !(p >= 0 && isSym(ts[p], '.'))
}

export function minusToExcept(ts) {
  return ts.map((x, i) => (x.type === 'word' && x.text.toUpperCase() === 'MINUS' && isSetOperator(ts, i) ? raw('EXCEPT') : x))
}

// depth-0 set operators of a token list: [{ at, end, name, all }] (end = index after the operator, ALL included)
export function topLevelSetOperators(ts) {
  const found = []
  let depth = 0
  for (let i = 0; i < ts.length; i++) {
    if (isSym(ts[i], '(')) depth++
    else if (isSym(ts[i], ')')) depth--
    else if (depth === 0 && isSetOperator(ts, i)) {
      const name = ts[i].text.toUpperCase()
      const n = nextSig(ts, i)
      const all = name === 'UNION' && n >= 0 && isWord(ts[n], 'ALL')
      found.push({ at: i, end: all ? n + 1 : i + 1, name, all })
    }
  }
  return found
}

function topLevelOrderBy(ts, from = 0) {
  let depth = 0
  for (let i = from; i < ts.length; i++) {
    if (isSym(ts[i], '(')) depth++
    else if (isSym(ts[i], ')')) depth--
    else if (depth === 0 && isWord(ts[i], 'ORDER')) {
      const n = nextSig(ts, i)
      if (n >= 0 && isWord(ts[n], 'BY')) return i
    }
  }
  return -1
}

// Does Oracle return the rows of this statement sorted by all columns? True when the outermost set operator is not
// UNION ALL (the operators evaluate left to right, so the last one is the outermost) and there is no ORDER BY.
export function setOperatorSorts(ts) {
  const first = ts.find(isSig)
  if (!first || !(isWord(first, 'SELECT') || isWord(first, 'WITH') || isSym(first, '('))) return false
  const ops = topLevelSetOperators(ts)
  if (!ops.length) return false
  return !ops[ops.length - 1].all && topLevelOrderBy(ts, ops[ops.length - 1].end) < 0
}

// end index (exclusive) of the WITH clause at the start of ts: the main query starts there
function withClauseEnd(ts) {
  let i = nextSig(ts, ts.findIndex(isSig))
  for (;;) {
    if (i < 0) return -1
    i = nextSig(ts, i)                                   // after the CTE name
    if (i >= 0 && isSym(ts[i], '(')) i = nextSig(ts, matchParen(ts, i))   // column list
    if (i < 0 || !isWord(ts[i], 'AS')) return -1
    const o = nextSig(ts, i)
    if (o < 0 || !isSym(ts[o], '(')) return -1
    const c = matchParen(ts, o)
    if (c < 0) return -1
    const n = nextSig(ts, c)
    if (n >= 0 && isSym(ts[n], ',')) { i = nextSig(ts, n); continue }
    return c + 1
  }
}

function leftToRight(ts) {
  const ops = topLevelSetOperators(ts)
  if (ops.length < 2 || !ops.some((o) => o.name === 'INTERSECT')) return ts
  const first = ts.findIndex(isSig)
  let start = 0
  if (isWord(ts[first], 'WITH')) {
    start = withClauseEnd(ts)
    if (start < 0) return ts
  }
  const orderAt = topLevelOrderBy(ts, ops[ops.length - 1].end)
  const bodyEnd = orderAt < 0 ? ts.length : orderAt
  const seg = (a, b) => trimSpace(ts.slice(a, b))
  let acc = seg(start, ops[0].at)
  ops.forEach((o, k) => {
    const next = seg(o.end, k + 1 < ops.length ? ops[k + 1].at : bodyEnd)
    acc = [...(k ? [PAREN_OPEN, ...acc, PAREN_CLOSE] : acc), raw(' '), ...ts.slice(o.at, o.end), raw(' '), ...next]
  })
  return [...ts.slice(0, start), ...acc, ...(orderAt < 0 ? [] : [raw(' '), ...trimSpace(ts.slice(orderAt))])]
}

// A string literal select item of a set-operator arm is typed text. A literal is CHAR(n) in Oracle, and CHAR arms of
// different lengths unite as VARCHAR2 (compared without padding): 'Alexandru' INTERSECT a CHAR(10) column finds nothing.
function typeArmLiterals(arm) {
  const first = arm.findIndex(isSig)
  if (first < 0) return arm
  if (isSym(arm[first], '(')) {
    const c = matchParen(arm, first)
    return c > 0 ? [...arm.slice(0, first + 1), ...typeArmLiterals(arm.slice(first + 1, c)), ...arm.slice(c)] : arm
  }
  if (!isWord(arm[first], 'SELECT')) return arm
  let from = first + 1
  while (from < arm.length && (!isSig(arm[from]) || ['DISTINCT', 'UNIQUE', 'ALL'].some((w) => isWord(arm[from], w)))) from++
  let end = from
  let depth = 0
  for (; end < arm.length; end++) {
    if (isSym(arm[end], '(')) depth++
    else if (isSym(arm[end], ')')) depth--
    else if (depth === 0 && isWord(arm[end], 'FROM')) break
  }
  if (end >= arm.length) return arm
  const items = splitTop(arm.slice(from, end)).map((item) => {
    const sig = item.filter(isSig)
    const alias = sig.length === 1 || (sig.length === 2 && sig[1].type === 'word') || (sig.length === 3 && isWord(sig[1], 'AS'))
    if (!(alias && sig[0].type === 'string')) return item
    const at = item.indexOf(sig[0])
    return [...item.slice(0, at + 1), raw('::text'), ...item.slice(at + 1)]
  })
  return [...arm.slice(0, from), ...items.flatMap((item, i) => (i ? [{ type: 'punct', text: ',' }, ...item] : item)), ...arm.slice(end)]
}

function typeLiterals(ts) {
  const ops = topLevelSetOperators(ts)
  if (!ops.length) return ts
  const out = []
  let at = 0
  ;[...ops, { at: ts.length, end: ts.length }].forEach((o) => {
    out.push(...typeArmLiterals(ts.slice(at, o.at)), ...ts.slice(o.at, o.end))
    at = o.end
  })
  return out
}

// apply leftToRight to every parenthesised group too
function parenthesise(ts) {
  const flat = []
  for (let i = 0; i < ts.length; i++) {
    if (isSym(ts[i], '(')) {
      const c = matchParen(ts, i)
      if (c > 0) {
        flat.push(ts[i], ...parenthesise(ts.slice(i + 1, c)), ts[c])
        i = c
        continue
      }
    }
    flat.push(ts[i])
  }
  return leftToRight(typeLiterals(flat))
}

export function setOperatorPrecedence(ts) {
  return parenthesise(ts)
}

export function sortSetOperatorOutput(ts) {
  if (!setOperatorSorts(ts)) return ts
  return [raw('SELECT * FROM ('), ...ts, raw(') ora_s ORDER BY ora_s')]
}
