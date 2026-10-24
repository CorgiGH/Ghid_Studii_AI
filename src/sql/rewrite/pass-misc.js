// Misc pass: SELECT UNIQUE, USER, VARCHAR2 / NVARCHAR2, CAST(.. AS NUMBER), ANY/SOME/ALL (list).
import { isSig, isSym, isWord, matchParen, nextSig, prevSig, raw, splitTop, trimSpace } from './tokens.js'

const CMP = ['=', '<', '>', '<=', '>=', '<>', '!=', '^=']

export function miscMap(ts) {
  return ts.map((x, i) => {
    if (x.type !== 'word') return x
    const pi = prevSig(ts, i)
    if (pi >= 0 && isSym(ts[pi], '.')) return x
    const ni = nextSig(ts, i)
    const u = x.text.toUpperCase()
    if (u === 'UNIQUE' && pi >= 0 && isWord(ts[pi], 'SELECT')) return raw('DISTINCT')
    if (u === 'USER' && !(ni >= 0 && isSym(ts[ni], '('))) return raw("'STUDENT'")
    if (u === 'VARCHAR2' || u === 'NVARCHAR2') return raw('VARCHAR')
    if (u === 'NUMBER' && pi >= 0 && isWord(ts[pi], 'AS')) return raw('NUMERIC')
    return x
  })
}

// x = ANY (a, b, c)  ->  x = ANY (ARRAY[a, b, c])   (a subquery is left alone)
export function anyList(ts) {
  const out = []
  for (let i = 0; i < ts.length; i++) {
    const x = ts[i]
    const nm = x.type === 'word' ? x.text.toUpperCase() : ''
    if (nm === 'ANY' || nm === 'SOME' || nm === 'ALL') {
      const p = prevSig(ts, i)
      const o = nextSig(ts, i)
      if (p >= 0 && CMP.includes(ts[p].text) && o >= 0 && ts[o].text === '(') {
        const c = matchParen(ts, o)
        const inner = trimSpace(ts.slice(o + 1, c))
        if (c > 0 && !(inner.length && isWord(inner.filter(isSig)[0], 'SELECT'))) {
          const args = splitTop(inner).map((a) => anyList(trimSpace(a)))
          out.push(raw(`${nm} (ARRAY[`))
          args.forEach((a, j) => out.push(...(j ? [raw(', ')] : []), ...a))
          out.push(raw('])'))
          i = c
          continue
        }
      }
    }
    out.push(x)
  }
  return out
}

// Implicit conversions that need the literal to be typed text (PostgreSQL would otherwise type an unknown literal
// like the other operand):
//   - a string literal beside ||                      'x' || bursa      (text || NUMBER, not NUMBER || NUMBER)
//   - a date-shaped literal compared with something   data_nastere > '01-JAN-60'   (DATE vs text goes through TO_DATE)
// A date-shaped literal in an UPDATE ... SET clause or an INSERT list stays unknown: it is assigned, not compared.
const DATE_SHAPE = /^'\s*\d{1,4}\s*[-/.]\s*[0-9A-Za-z]{1,9}\s*[-/.]\s*\d{1,4}/
const COMPARISONS = ['=', '<>', '!=', '^=', '<', '>', '<=', '>=']

// token indexes of the string literals that stand right after BETWEEN or after the AND that closes it
function betweenOperands(ts) {
  const found = new Set()
  ts.forEach((x, i) => {
    if (!isWord(x, 'BETWEEN')) return
    const a = nextSig(ts, i)
    if (a >= 0 && ts[a].type === 'string') found.add(a)
    let depth = 0
    for (let j = a < 0 ? ts.length : a; j < ts.length; j++) {
      if (isSym(ts[j], '(')) depth++
      else if (isSym(ts[j], ')')) depth--
      else if (depth === 0 && isWord(ts[j], 'AND')) {
        const b = nextSig(ts, j)
        if (b >= 0 && ts[b].type === 'string') found.add(b)
        break
      }
    }
  })
  return found
}

// token indexes of the string literals that are whole elements of an IN ( 'a', 'b' ) list
function inListOperands(ts) {
  const found = new Set()
  ts.forEach((x, i) => {
    if (!isWord(x, 'IN')) return
    const o = nextSig(ts, i)
    if (o < 0 || !isSym(ts[o], '(')) return
    const c = matchParen(ts, o)
    if (c < 0) return
    let depth = 0
    for (let j = o + 1; j < c; j++) {
      if (isSym(ts[j], '(')) depth++
      else if (isSym(ts[j], ')')) depth--
      else if (depth === 0 && ts[j].type === 'string') {
        const p = prevSig(ts, j)
        const n = nextSig(ts, j)
        if ((p === o || isSym(ts[p], ',')) && (n === c || isSym(ts[n], ','))) found.add(j)
      }
    }
  })
  return found
}

const ARITH = ['+', '-', '*', '/']
const TYPED = ['DATE', 'TIMESTAMP', 'INTERVAL']

export function textLiterals(ts) {
  const first = ts.find(isSig)
  const isUpdate = isWord(first, 'UPDATE')
  const between = betweenOperands(ts)
  const inLists = inListOperands(ts)
  const out = []
  let depth = 0
  let inSet = false
  ts.forEach((x, i) => {
    out.push(x)
    if (isSym(x, '(')) depth++
    else if (isSym(x, ')')) depth--
    else if (isUpdate && depth === 0 && isWord(x, 'SET')) inSet = true
    else if (isUpdate && depth === 0 && isWord(x, 'WHERE')) inSet = false
    if (x.type !== 'string') return
    const p = prevSig(ts, i)
    const n = nextSig(ts, i)
    const besideConcat = isSym(ts[p], '||') || isSym(ts[n], '||')
    // ANSI typed literal (DATE '..') or part of arithmetic: not a bare string operand
    const typed = p >= 0 && ts[p].type === 'word' && TYPED.includes(ts[p].text.toUpperCase())
    const arith = ARITH.some((c) => isSym(ts[p], c) || isSym(ts[n], c))
    const compared =
      COMPARISONS.some((c) => isSym(ts[p], c) || isSym(ts[n], c)) || between.has(i) || inLists.has(i)
    if (typed) return
    if (besideConcat || (compared && !arith && !inSet && DATE_SHAPE.test(x.text))) out.push(raw('::text'))
  })
  return out
}
