// Misc pass: SELECT UNIQUE, USER, VARCHAR2 / NVARCHAR2, CAST(.. AS NUMBER), ANY/SOME/ALL (list).
import { isSig, isSym, isWord, matchParen, nextSig, prevSig, raw, splitTop, tokenize, trimSpace } from './tokens.js'
import { OracleError } from '../engine/errors.js'

const CMP = ['=', '<', '>', '<=', '>=', '<>', '!=', '^=']

export function miscMap(ts) {
  return ts.map((x, i) => {
    if (x.type === 'op' && x.text === '^=') return raw('<>')
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

// token indexes of the string literals that are a whole WHEN value of a simple CASE (CASE expr WHEN 'lit' THEN)
function simpleCaseOperands(ts) {
  const found = new Set()
  ts.forEach((x, i) => {
    if (!isWord(x, 'CASE')) return
    const first = nextSig(ts, i)
    if (first < 0 || isWord(ts[first], 'WHEN')) return
    let depth = 0
    let nested = 0
    for (let j = first; j < ts.length; j++) {
      if (isSym(ts[j], '(')) depth++
      else if (isSym(ts[j], ')')) {
        if (--depth < 0) break
      } else if (depth === 0 && isWord(ts[j], 'CASE')) nested++
      else if (depth === 0 && isWord(ts[j], 'END')) {
        if (nested === 0) break
        nested--
      } else if (depth === 0 && nested === 0 && isWord(ts[j], 'WHEN')) {
        const a = nextSig(ts, j)
        const t = a < 0 ? -1 : nextSig(ts, a)
        if (a >= 0 && ts[a].type === 'string' && t >= 0 && isWord(ts[t], 'THEN')) found.add(a)
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
  const caseWhens = simpleCaseOperands(ts)
  const out = []
  let depth = 0
  let inSet = false
  ts.forEach((x, i) => {
    if (x.type === 'string' && caseWhens.has(i) && DATE_SHAPE.test(x.text)) {
      // simple CASE: Oracle never converts the WHEN value to DATE (ORA-00932), see ora_when in 20-char.sql
      out.push(raw('ora_when('), x, raw(')'))
      return
    }
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

// ---- ROWNUM ---------------------------------------------------------------------------------------------------------
// Oracle numbers the rows that pass WHERE, before ORDER BY / GROUP BY / DISTINCT. So:
//   WHERE ROWNUM <= n  (or < n, = 1)   keeps the first n rows of the FROM clause, then everything else runs on those n rows
//   ROWNUM elsewhere                   row_number() over ()   (numbered in scan order, ORDER BY sorts afterwards)
// When the FROM clause is one table or one inline view, the cut is a derived table that keeps the table's alias, so every
// qualified column still resolves:  FROM studenti s WHERE an = 1 AND ROWNUM <= 3
//                                -> FROM (SELECT * FROM studenti s WHERE an = 1 LIMIT 3) s
// For joins the cut is a condition on the row identities of the joined tables (ctid), taken from a copy of the join that
// carries the LIMIT:  WHERE .. AND EXISTS (SELECT 1 FROM (SELECT s.ctid c0, n.ctid c1 FROM s JOIN n .. WHERE .. LIMIT 3) z
//                                           WHERE z.c0 IS NOT DISTINCT FROM s.ctid AND z.c1 IS NOT DISTINCT FROM n.ctid)
// so ORDER BY, GROUP BY and aggregates still run on the cut rows only, as in Oracle. Everything this pass writes is real
// tokens, so the passes after it still see the query structure.
const SET_OP_WORDS = new Set(['UNION', 'INTERSECT', 'MINUS', 'EXCEPT'])
const AFTER_WHERE = new Set(['GROUP', 'HAVING', 'ORDER', 'CONNECT', 'START', 'FOR'])
const FROM_KEYWORDS = new Set(['JOIN', 'NATURAL', 'LEFT', 'RIGHT', 'FULL', 'INNER', 'CROSS', 'OUTER', 'ON', 'USING'])
const isRownumAt = (ts, i) => isWord(ts[i], 'ROWNUM') && !isSym(ts[prevSig(ts, i)], '.')

function depth0(ts, pred, from = 0, to = ts.length) {
  let d = 0
  for (let i = from; i < to; i++) {
    if (isSym(ts[i], '(')) d++
    else if (isSym(ts[i], ')')) d--
    else if (d === 0 && ts[i].type === 'word' && pred(ts[i].text.toUpperCase(), i)) return i
  }
  return -1
}

function splitAnd(ts) {
  const out = [[]]
  let d = 0
  let between = false
  for (const x of ts) {
    if (isSym(x, '(')) d++
    else if (isSym(x, ')')) d--
    if (d === 0 && isWord(x, 'BETWEEN')) between = true
    if (d === 0 && isWord(x, 'AND')) {
      if (between) between = false
      else { out.push([]); continue }
    }
    out[out.length - 1].push(x)
  }
  return out
}

// ROWNUM <op> number -> { limit } | { never } | { always } ; null when the conjunct is something else
function rownumCondition(conj) {
  const sig = conj.filter(isSig)
  if (sig.length !== 3 || !isRownumAt(sig, 0) || sig[2].type !== 'number') return null
  const op = sig[1].text
  const n = Number(sig[2].text)
  if (op === '<=') return n < 1 ? { limit: 0 } : { limit: Math.floor(n) }
  if (op === '<') return { limit: Math.max(0, Math.ceil(n) - 1) }
  if (op === '=') return n === 1 ? { limit: 1 } : { never: true }
  if (op === '>') return n < 1 ? { always: true } : { never: true }
  if (op === '>=') return n <= 1 ? { always: true } : { never: true }
  return null
}

// The FROM clause as one table or one inline view: { factor, alias } or null when it joins several things
function singleFactor(fromToks) {
  const toks = trimSpace(fromToks)
  const at = []
  toks.forEach((t, k) => { if (isSig(t)) at.push(k) })
  const sig = at.map((k) => toks[k])
  let i = 0
  let name = null
  if (isSym(sig[0], '(')) {
    const c = matchParen(sig, 0)
    if (c < 0) return null
    i = c + 1
  } else if (sig[0] && sig[0].type === 'word') {
    name = sig[0].text
    i = 1
    while (isSym(sig[i], '.') && sig[i + 1] && sig[i + 1].type === 'word') { name = sig[i + 1].text; i += 2 }
  } else return null
  let alias = null
  if (sig[i] && sig[i].type === 'word' && !FROM_KEYWORDS.has(sig[i].text.toUpperCase())) { alias = sig[i].text; i++ }
  if (i !== sig.length) return null
  return { factor: toks.slice(0, at[alias ? sig.length - 2 : sig.length - 1] + 1), alias, name, paren: isSym(sig[0], '(') }
}

function joinWith(parts, sep) {
  const out = []
  parts.forEach((p, i) => out.push(...(i ? tokenize(sep) : []), ...p))
  return out
}

// Names (alias, else table name) of the tables of a FROM clause that lists plain tables only, or null (derived tables).
function fromTableNames(fromToks) {
  const sig = fromToks.filter(isSig)
  const names = []
  let expect = true
  let d = 0
  for (let i = 0; i < sig.length; i++) {
    const x = sig[i]
    if (isSym(x, '(')) { if (d === 0 && expect) return null; d++; continue }
    if (isSym(x, ')')) { d--; continue }
    if (d > 0) continue
    if (isWord(x, 'JOIN') || isSym(x, ',')) { expect = true; continue }
    if (!expect) continue
    if (x.type !== 'word' && x.type !== 'qident') return null
    let name = x.text
    let j = i + 1
    while (isSym(sig[j], '.') && sig[j + 1]) { name = sig[j + 1].text; j += 2 }
    if (isWord(sig[j], 'AS') && sig[j + 1]) { name = sig[j + 1].text; j += 2 }
    else if (sig[j] && sig[j].type === 'word' && !FROM_KEYWORDS.has(sig[j].text.toUpperCase())) { name = sig[j].text; j++ }
    names.push(name)
    expect = false
    i = j - 1
  }
  return names.length ? names : null
}

function rownumSegment(seg) {
  const first = seg.findIndex(isSig)
  if (first < 0 || !isWord(seg[first], 'SELECT')) return seg
  const fromIdx = depth0(seg, (u) => u === 'FROM')
  if (fromIdx < 0) return seg
  const whereIdx = depth0(seg, (u) => u === 'WHERE', fromIdx)
  if (whereIdx < 0) return seg
  let tailIdx = depth0(seg, (u) => AFTER_WHERE.has(u), whereIdx)
  if (tailIdx < 0) tailIdx = seg.length
  const conjs = splitAnd(seg.slice(whereIdx + 1, tailIdx))
  let limit = null
  let touched = false
  const rest = []
  for (const c of conjs) {
    const cond = rownumCondition(c)
    if (!cond) { rest.push(c); continue }
    touched = true
    if (cond.never) rest.push(tokenize(' 1 = 0 '))
    else if (cond.limit !== undefined) limit = limit === null ? cond.limit : Math.min(limit, cond.limit)
  }
  if (!touched) return seg
  const restWhere = rest.length ? [...tokenize(' WHERE '), ...joinWith(rest, ' AND ')] : []
  const tail = seg.slice(tailIdx)
  const head = seg.slice(0, fromIdx + 1)
  const fromToks = seg.slice(fromIdx + 1, whereIdx)
  if (limit === null) return [...head, ...fromToks, ...restWhere, ...tokenize(' '), ...tail]
  const one = singleFactor(fromToks)
  if (one) {
    const alias = one.alias || one.name || 'ora_v'
    const innerAlias = one.alias ? ` ${one.alias}` : one.paren ? ' ora_v' : ''
    const inner = [...tokenize('(SELECT * FROM '), ...one.factor, ...tokenize(innerAlias), ...restWhere, ...tokenize(` LIMIT ${limit}) ${alias} `)]
    return [...head, ...tokenize(' '), ...inner, ...tail]
  }
  const names = fromTableNames(fromToks)
  if (!names) throw new OracleError('ORA-?', 'ROWNUM together with a join of inline views is not supported by this practice engine')
  const ids = names.map((n, k) => `c${k}`)
  const inner = [...tokenize(`SELECT ${names.map((n, k) => `${n}.ctid ${ids[k]}`).join(', ')} FROM `), ...fromToks, ...restWhere]
  const same = names.map((n, k) => `ora_z.${ids[k]} IS NOT DISTINCT FROM ${n}.ctid`).join(' AND ')
  const cond = [...tokenize('EXISTS (SELECT 1 FROM ('), ...inner, ...tokenize(` LIMIT ${limit}) ora_z WHERE ${same})`)]
  const where = [...tokenize(' WHERE '), ...(rest.length ? [...joinWith(rest, ' AND '), ...tokenize(' AND ')] : []), ...cond]
  return [...head, ...fromToks, ...where, ...tokenize(' '), ...tail]
}

function rownumLevel(ts) {
  const out = []
  for (let i = 0; i < ts.length; i++) {
    if (isSym(ts[i], '(')) {
      const c = matchParen(ts, i)
      if (c > 0) {
        out.push(ts[i], ...rownumLevel(ts.slice(i + 1, c)), ts[c])
        i = c
        continue
      }
    }
    out.push(ts[i])
  }
  // split into the SELECTs of a set operation, rewrite each
  const cuts = []
  let d = 0
  out.forEach((x, i) => {
    if (isSym(x, '(')) d++
    else if (isSym(x, ')')) d--
    else if (d === 0 && x.type === 'word' && SET_OP_WORDS.has(x.text.toUpperCase())) cuts.push(i)
  })
  if (!cuts.length) return rownumSegment(out)
  const res = []
  let from = 0
  for (const c of cuts) {
    res.push(...rownumSegment(out.slice(from, c)))
    let opEnd = c + 1
    const n = nextSig(out, c)
    if (n >= 0 && isWord(out[n], 'ALL')) opEnd = n + 1
    res.push(...out.slice(c, opEnd))
    from = opEnd
  }
  res.push(...rownumSegment(out.slice(from)))
  return res
}

// DELETE FROM t [alias] WHERE .. AND ROWNUM <= n   /   UPDATE t [alias] SET .. WHERE .. AND ROWNUM <= n
//   -> the same statement with WHERE ctid IN (SELECT ctid FROM t [alias] WHERE <the other conditions> LIMIT n)
// (the first n rows that pass the other conditions, as Oracle numbers them). Null when the statement has no such condition.
function rownumDml(ts) {
  const sig = ts.filter(isSig)
  const deleting = isWord(sig[0], 'DELETE')
  if (!deleting && !isWord(sig[0], 'UPDATE')) return null
  const whereIdx = depth0(ts, (u) => u === 'WHERE')
  if (whereIdx < 0) return null
  const conjs = splitAnd(ts.slice(whereIdx + 1))
  if (!conjs.some((c) => rownumCondition(c))) return null
  const head = ts.slice(0, whereIdx)
  const startIdx = depth0(ts, (u) => u === (deleting ? 'FROM' : 'UPDATE'))
  const stopIdx = deleting ? whereIdx : depth0(ts, (u) => u === 'SET')
  if (startIdx < 0 || stopIdx < 0) return null
  const one = singleFactor(ts.slice(startIdx + 1, stopIdx))
  if (!one || one.paren) return null
  let limit = null
  const rest = []
  for (const c of conjs) {
    const cond = rownumCondition(c)
    if (!cond) rest.push(c)
    else if (cond.never) rest.push(tokenize(' 1 = 0 '))
    else if (cond.limit !== undefined) limit = limit === null ? cond.limit : Math.min(limit, cond.limit)
  }
  const restWhere = rest.length ? [...tokenize(' WHERE '), ...joinWith(rest, ' AND ')] : []
  if (limit === null) return [...head, ...(restWhere.length ? restWhere : [])]
  const inner = [...tokenize('SELECT ctid FROM '), ...one.factor, ...tokenize(one.alias ? ` ${one.alias}` : ''), ...restWhere, ...tokenize(` LIMIT ${limit}`)]
  return [...head, ...tokenize(' WHERE ctid IN ('), ...inner, ...tokenize(')')]
}

export function rownumPass(ts) {
  if (!ts.some((x, i) => isRownumAt(ts, i))) return ts
  ts = rownumDml(ts) ?? ts
  return rownumLevel(ts).map((x, i, all) => (isRownumAt(all, i) ? raw('row_number() over ()') : x))
}
