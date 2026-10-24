// LIKE pass: Oracle has no default LIKE escape character, PostgreSQL defaults to backslash -> LIKE .. ESCAPE ''.
// The ESCAPE clause goes after the whole pattern expression ('P' || '%'), which is parenthesised when it has several tokens.
import { isSym, isWord, matchParen, nextSig, raw } from './tokens.js'

const OPERATORS = ['||', '+', '-', '*', '/']
const STOP = new Set(['AND', 'OR', 'ESCAPE', 'THEN', 'ELSE', 'WHEN', 'END', 'FROM', 'WHERE', 'GROUP', 'ORDER', 'HAVING', 'UNION', 'INTERSECT', 'EXCEPT', 'MINUS', 'JOIN', 'ON', 'NOT', 'IS', 'IN', 'BETWEEN', 'LIKE', 'CONNECT', 'START', 'LEFT', 'RIGHT', 'FULL', 'INNER', 'CROSS', 'NATURAL', 'OUTER', 'USING', 'AS', 'SET', 'VALUES', 'SELECT'])

// index of the CASE's closing END, or -1
function caseEnd(ts, open) {
  let depth = 0
  for (let j = open; j < ts.length; j++) {
    if (isSym(ts[j], '(')) j = matchParen(ts, j) < 0 ? ts.length : matchParen(ts, j)
    else if (isWord(ts[j], 'CASE')) depth++
    else if (isWord(ts[j], 'END') && --depth === 0) return j
  }
  return -1
}

// index of the last token of the operand expression that starts at ts[from], or -1 when it is not an expression
function expressionEnd(ts, from) {
  let i = from
  let last = -1
  let wantOperand = true
  while (i >= 0) {
    const x = ts[i]
    if (wantOperand) {
      if (isSym(x, '+') || isSym(x, '-')) { i = nextSig(ts, i); continue }
      if (isSym(x, '(')) {
        const c = matchParen(ts, i)
        if (c < 0) return -1
        last = c
      } else if (isWord(x, 'CASE')) {
        last = caseEnd(ts, i)
        if (last < 0) return -1
      } else if (x.type === 'word' && !STOP.has(x.text.toUpperCase())) {
        last = i
        for (;;) {                                         // owner.column, function(...)
          const n = nextSig(ts, last)
          if (n >= 0 && isSym(ts[n], '.')) {
            const m = nextSig(ts, n)
            if (m < 0 || (ts[m].type !== 'word' && ts[m].type !== 'qident')) return -1
            last = m
          } else if (n >= 0 && isSym(ts[n], '(')) {
            last = matchParen(ts, n)
            if (last < 0) return -1
          } else break
        }
      } else if (['string', 'number', 'qident', 'raw'].includes(x.type)) {
        last = i
      } else return -1
      wantOperand = false
      i = nextSig(ts, last)
    } else if (OPERATORS.some((o) => isSym(x, o))) {
      wantOperand = true
      i = nextSig(ts, i)
    } else break
  }
  return wantOperand ? -1 : last
}

// a || at depth 0 of the expression ts[from..to]
function hasConcat(ts, from, to) {
  let depth = 0
  for (let j = from; j <= to; j++) {
    if (isSym(ts[j], '(')) depth++
    else if (isSym(ts[j], ')')) depth--
    else if (depth === 0 && isSym(ts[j], '||')) return true
  }
  return false
}

export function likeEscape(ts) {
  const out = []
  for (let i = 0; i < ts.length; i++) {
    out.push(ts[i])
    if (!isWord(ts[i], 'LIKE')) continue
    const a = nextSig(ts, i)
    const last = a < 0 ? -1 : expressionEnd(ts, a)
    if (last < 0) continue
    const b = nextSig(ts, last)
    if (b >= 0 && isWord(ts[b], 'ESCAPE')) continue
    for (let j = i + 1; j < a; j++) out.push(ts[j])
    const single = a === last
    // only a text pattern gets the clause: a bare number or column keeps its own type (LIKE needs a text pattern for ESCAPE)
    const text = single ? ts[a].type === 'string' || ts[a].type === 'raw' || isWord(ts[a], 'NULL') : hasConcat(ts, a, last)
    if (!text) continue
    if (!single) out.push(raw('('))
    for (let j = a; j <= last; j++) out.push(ts[j])
    out.push(raw(single ? " ESCAPE ''" : ") ESCAPE ''"))
    i = last
  }
  return out
}
