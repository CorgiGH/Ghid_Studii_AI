// Precedence pass: in Oracle 11g the binary operators + - and || have the same precedence and group left to right, so
//   'a' || 1 + 2   is  ('a' || 1) + 2  = 'a1' + 2  -> ORA-01722        3 || 4 + 1  is  ('34') + 1 = 35
// PostgreSQL binds + and - tighter than ||. Within one expression, every binary + or - that follows a || of the same chain gets
// the whole chain so far wrapped in parentheses, which gives PostgreSQL Oracle's grouping:
//   a || b + c || d - e   ->   ((a || b) + c || d) - e
// * and / bind tighter in both and stay inside their operands. A sign after an operator, '(', ',' or a keyword is unary and
// left alone. A chain ends at a comma, a comparison, AND / OR and every other keyword; each parenthesis level and the inside of a
// CASE ... END is a chain of its own.
import { isSig, isSym, isWord, matchParen } from './tokens.js'

// words that are not operands: they end the chain they meet (an identifier, a function name, NULL or SYSDATE is an operand)
const KEYWORDS = new Set([
  'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IS', 'IN', 'LIKE', 'ESCAPE', 'BETWEEN', 'AS', 'ON', 'USING', 'JOIN', 'LEFT',
  'RIGHT', 'FULL', 'INNER', 'OUTER', 'CROSS', 'NATURAL', 'GROUP', 'BY', 'HAVING', 'ORDER', 'ASC', 'DESC', 'NULLS', 'FIRST', 'LAST',
  'UNION', 'ALL', 'INTERSECT', 'MINUS', 'EXCEPT', 'DISTINCT', 'UNIQUE', 'WHEN', 'THEN', 'ELSE', 'END', 'CASE', 'EXISTS', 'ANY',
  'SOME', 'PRIOR', 'SET', 'VALUES', 'INTO', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'TABLE', 'ALTER', 'DROP', 'ADD', 'MODIFY',
  'DEFAULT', 'CHECK', 'CONSTRAINT', 'PRIMARY', 'KEY', 'REFERENCES', 'FOREIGN', 'WITH', 'CONNECT', 'START', 'OVER', 'PARTITION',
  'ROWS', 'RANGE', 'FOR', 'OF', 'TO', 'RENAME', 'COMMENT', 'TRUNCATE', 'VIEW', 'INDEX', 'CASCADE', 'CONSTRAINTS', 'PURGE',
  'LIMIT', 'OFFSET', 'FETCH', 'COLUMN', 'NOCYCLE', 'SIBLINGS', 'KEEP', 'WITHIN',
])
const TYPED_LITERAL = new Set(['DATE', 'TIMESTAMP', 'INTERVAL'])
const INTERVAL_UNITS = new Set(['YEAR', 'MONTH', 'DAY', 'HOUR', 'MINUTE', 'SECOND', 'TO'])
const isOperandToken = (t) => t.type === 'number' || t.type === 'string' || t.type === 'qident' || t.type === 'raw' || (t.type === 'word' && !KEYWORDS.has(t.text.toUpperCase()))
const punct = (text) => ({ type: 'punct', text })

// the END that closes the CASE at ts[i] (same parenthesis level), or -1
function caseEnd(ts, i) {
  let depth = 0
  let nested = 0
  for (let j = i + 1; j < ts.length; j++) {
    if (isSym(ts[j], '(')) depth++
    else if (isSym(ts[j], ')')) { if (--depth < 0) return -1 }
    else if (depth === 0 && isWord(ts[j], 'CASE')) nested++
    else if (depth === 0 && isWord(ts[j], 'END')) {
      if (nested === 0) return j
      nested--
    }
  }
  return -1
}

// the index of the next significant token at or after j (ts.length when there is none)
const sigAt = (ts, j) => {
  while (j < ts.length && !isSig(ts[j])) j++
  return j
}

function level(ts) {
  const out = []
  let chainStart = -1 // index in `out` where the current chain begins
  let sawConcat = false // a || of the current chain that no wrap has taken in yet
  let expectOperand = true
  const reset = () => { chainStart = -1; sawConcat = false; expectOperand = true }
  const beginOperand = () => { if (chainStart < 0) chainStart = out.length }

  for (let i = 0; i < ts.length; i++) {
    const x = ts[i]
    if (!isSig(x)) { out.push(x); continue }

    if (isSym(x, '(')) {
      const c = matchParen(ts, i)
      if (c < 0) { out.push(...ts.slice(i)); break }
      // a parenthesised operand, or the argument list of the function named just before it
      if (expectOperand) beginOperand()
      out.push(x, ...level(ts.slice(i + 1, c)), ts[c])
      i = c
      expectOperand = false
      continue
    }

    if (isWord(x, 'CASE')) {
      const e = caseEnd(ts, i)
      if (e < 0) { out.push(x); reset(); continue }
      if (!expectOperand) reset()
      beginOperand()
      out.push(x, ...level(ts.slice(i + 1, e)), ts[e])
      i = e
      expectOperand = false
      continue
    }

    if (isSym(x, '||') || isSym(x, '*') || isSym(x, '/')) {
      if (expectOperand) { out.push(x); reset(); continue }
      if (isSym(x, '||')) sawConcat = true
      out.push(x)
      expectOperand = true
      continue
    }

    if (isSym(x, '+') || isSym(x, '-')) {
      if (expectOperand) {
        // a sign: it belongs to the operand that follows
        beginOperand()
        out.push(x)
        continue
      }
      if (sawConcat && chainStart >= 0) {
        // ( before the chain, ) right after its last token (blanks stay outside)
        let last = out.length - 1
        while (last > chainStart && !isSig(out[last])) last--
        out.splice(last + 1, 0, punct(')'))
        out.splice(chainStart, 0, punct('('))
        sawConcat = false
      }
      out.push(x)
      expectOperand = true
      continue
    }

    if (isSym(x, '.')) {
      // a qualified name (s.nume) or s.*: the dot and what follows belong to the operand
      out.push(x)
      const j = sigAt(ts, i + 1)
      if (j < ts.length && (ts[j].type === 'word' || ts[j].type === 'qident' || isSym(ts[j], '*'))) {
        out.push(...ts.slice(i + 1, j + 1))
        i = j
      }
      continue
    }

    if (isOperandToken(x)) {
      if (!expectOperand) {
        // an operand right after an operand: an alias (or junk); the chain is over
        out.push(x)
        reset()
        expectOperand = false
        continue
      }
      beginOperand()
      out.push(x)
      expectOperand = false
      // a typed literal is one operand: DATE '2020-01-01', INTERVAL '3' DAY [TO SECOND] ...
      if (x.type === 'word' && TYPED_LITERAL.has(x.text.toUpperCase())) {
        const j = sigAt(ts, i + 1)
        if (j < ts.length && ts[j].type === 'string') {
          out.push(...ts.slice(i + 1, j + 1))
          i = j
          if (x.text.toUpperCase() === 'INTERVAL') {
            for (let k = sigAt(ts, i + 1); k < ts.length && (isWord(ts[k], 'YEAR') || INTERVAL_UNITS.has(String(ts[k].text).toUpperCase()) || isSym(ts[k], '(')); k = sigAt(ts, i + 1)) {
              const end = isSym(ts[k], '(') ? matchParen(ts, k) : k
              if (end < 0) break
              out.push(...ts.slice(i + 1, end + 1))
              i = end
            }
          }
        }
      }
      continue
    }

    // a keyword, a comma, a comparison or any other operator: the chain ends here
    out.push(x)
    reset()
  }
  return out
}

export function concatPrecedence(ts) {
  if (!ts.some((t) => isSym(t, '||'))) return ts
  return level(ts)
}
