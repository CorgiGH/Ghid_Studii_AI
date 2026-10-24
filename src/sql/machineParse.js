// Splits a SELECT (or a chain of set operators) into the clauses the query machine animates.
// Pure text work on the rewriter's token stream; nothing here talks to the engine.
import { tokenize, untokenize, isSig, isSym, isWord } from './rewrite/tokens.js'

export class MachineError extends Error {
  constructor(message, code = null) {
    super(message)
    this.name = 'MachineError'
    this.code = code
  }
}

const SET_OPS = { UNION: 'union', 'UNION ALL': 'union-all', INTERSECT: 'intersect', MINUS: 'minus', EXCEPT: 'minus' }
const JOIN_MODS = new Set(['INNER', 'LEFT', 'RIGHT', 'FULL', 'CROSS', 'NATURAL', 'OUTER'])

const squash = (s) => s.replace(/\s+/g, ' ').trim()

// Indexes (into `ts`) of tokens at parenthesis depth 0 that pass `pred`.
function topLevel(ts, pred, from = 0, to = ts.length) {
  const out = []
  let d = 0
  for (let i = from; i < to; i += 1) {
    const x = ts[i]
    if (isSym(x, '(')) d += 1
    else if (isSym(x, ')')) d -= 1
    else if (d === 0 && isSig(x) && pred(x, i)) out.push(i)
  }
  return out
}

function nextSigIdx(ts, i, to = ts.length) {
  for (let j = i + 1; j < to; j += 1) if (isSig(ts[j])) return j
  return -1
}

// "a, b AS c, d" -> [{ text, expr, alias }]
function splitTopComma(ts, from, to) {
  const out = []
  let start = from
  let d = 0
  for (let i = from; i < to; i += 1) {
    if (isSym(ts[i], '(')) d += 1
    else if (isSym(ts[i], ')')) d -= 1
    else if (d === 0 && isSym(ts[i], ',')) { out.push([start, i]); start = i + 1 }
  }
  out.push([start, to])
  return out.filter(([a, b]) => ts.slice(a, b).some(isSig))
}

function selectItem(ts, a, b) {
  const sig = []
  for (let i = a; i < b; i += 1) if (isSig(ts[i])) sig.push(i)
  let exprEnd = b
  let alias = null
  if (sig.length >= 3) {
    const last = ts[sig[sig.length - 1]]
    const prev = ts[sig[sig.length - 2]]
    if (isWord(prev, 'AS') && (last.type === 'word' || last.type === 'qident')) {
      alias = last.text.replace(/^"|"$/g, '')
      exprEnd = sig[sig.length - 2]
    }
  }
  return { text: squash(untokenize(ts.slice(a, b))), expr: squash(untokenize(ts.slice(a, exprEnd))), alias }
}

// "ORDER BY an DESC, 2 ASC NULLS LAST" items -> [{ expr, mods }]
function orderItems(ts, a, b) {
  return splitTopComma(ts, a, b).map(([x, y]) => {
    const sig = []
    for (let i = x; i < y; i += 1) if (isSig(ts[i])) sig.push(i)
    let end = sig.length
    const upper = (k) => ts[sig[k]].text.toUpperCase()
    if (end >= 2 && upper(end - 2) === 'NULLS' && ['FIRST', 'LAST'].includes(upper(end - 1))) end -= 2
    if (end >= 1 && ['ASC', 'DESC'].includes(upper(end - 1))) end -= 1
    const cut = end === sig.length ? y : sig[end]
    return { expr: squash(untokenize(ts.slice(x, cut))), mods: squash(untokenize(ts.slice(cut, y))) }
  })
}

function tableAndAlias(ts, a, b) {
  const words = []
  for (let i = a; i < b; i += 1) if (isSig(ts[i])) words.push(ts[i])
  const texts = words.map((w) => w.text)
  if (!texts.length) return { table: null, alias: null }
  let i = 0
  let table = texts[i]
  while (texts[i + 1] === '.' && texts[i + 2]) { table = `${table}.${texts[i + 2]}`; i += 2 }
  let rest = texts.slice(i + 1)
  if (rest[0] && rest[0].toUpperCase() === 'AS') rest = rest.slice(1)
  const alias = rest[0] && !/^(ON|USING)$/i.test(rest[0]) ? rest[0] : null
  return { table: table.replace(/^.*\./, ''), alias: alias || table.replace(/^.*\./, '') }
}

function parseSelect(ts, lo, hi) {
  const sig = (i) => isSig(ts[i])
  let sel = -1
  for (let i = lo; i < hi; i += 1) if (sig(i)) { sel = i; break }
  if (sel < 0 || !isWord(ts[sel], 'SELECT')) throw new MachineError('Only SELECT queries can run in the query machine.', 'unsupported')
  const heads = topLevel(ts, (x) => ['FROM', 'WHERE', 'GROUP', 'HAVING', 'ORDER'].includes(x.text.toUpperCase()) && x.type === 'word', sel + 1, hi)
  const find = (kw) => heads.find((i) => ts[i].text.toUpperCase() === kw && (kw !== 'ORDER' || isWord(ts[nextSigIdx(ts, i, hi)], 'BY')))
  const fromIdx = find('FROM')
  if (fromIdx === undefined) throw new MachineError('The query has no FROM clause.', 'unsupported')
  const whereIdx = find('WHERE')
  const groupIdx = find('GROUP')
  const havingIdx = find('HAVING')
  const orderIdx = find('ORDER')
  if (groupIdx !== undefined || havingIdx !== undefined) throw new MachineError('GROUP BY and HAVING are not animated by the query machine.', 'unsupported')
  const afterFrom = [whereIdx, orderIdx].filter((x) => x !== undefined).sort((a, b) => a - b)
  const fromEnd = afterFrom.length ? afterFrom[0] : hi
  const whereEnd = whereIdx === undefined ? null : (orderIdx !== undefined && orderIdx > whereIdx ? orderIdx : hi)

  // DISTINCT / UNIQUE / ALL right after SELECT
  let selStart = sel + 1
  let distinct = false
  let distinctIdx = -1
  const first = nextSigIdx(ts, sel, fromIdx)
  if (first >= 0 && ts[first].type === 'word' && ['DISTINCT', 'UNIQUE', 'ALL'].includes(ts[first].text.toUpperCase())) {
    distinct = ts[first].text.toUpperCase() !== 'ALL'
    distinctIdx = distinct ? first : -1
    selStart = first + 1
  }
  const items = splitTopComma(ts, selStart, fromIdx).map(([a, b]) => selectItem(ts, a, b))
  const star = items.some((it) => /^(\w+\.)?\*$/.test(it.expr))

  // FROM: base item, then one segment per join
  const starts = []
  const joinIdx = topLevel(ts, (x, i) => {
    if (x.type !== 'word') return false
    const w = x.text.toUpperCase()
    if (w !== 'JOIN' && !JOIN_MODS.has(w)) return false
    const p = (() => { for (let j = i - 1; j > fromIdx; j -= 1) if (isSig(ts[j])) return ts[j]; return null })()
    return !(p && p.type === 'word' && JOIN_MODS.has(p.text.toUpperCase()) && (w === 'JOIN' || JOIN_MODS.has(w)))
  }, fromIdx + 1, fromEnd)
  const commaIdx = topLevel(ts, (x) => isSym(x, ','), fromIdx + 1, fromEnd)
  for (const i of joinIdx) starts.push({ i, comma: false })
  for (const i of commaIdx) starts.push({ i, comma: true })
  starts.sort((a, b) => a.i - b.i)
  const baseEnd = starts.length ? starts[0].i : fromEnd
  const base = { text: squash(untokenize(ts.slice(fromIdx + 1, baseEnd))), ...tableAndAlias(ts, fromIdx + 1, baseEnd) }
  const joins = starts.map((s, k) => {
    const end = k + 1 < starts.length ? starts[k + 1].i : fromEnd
    const text = squash(untokenize(ts.slice(s.i, end)))
    if (s.comma) {
      return { kind: 'comma', text, from: s.i, to: end, ...tableAndAlias(ts, s.i + 1, end), on: null }
    }
    const words = []
    let jw = s.i
    for (let i = s.i; i < end; i += 1) {
      if (isSig(ts[i]) && ts[i].type === 'word') {
        const w = ts[i].text.toUpperCase()
        if (w === 'JOIN') { jw = i; break }
        words.push(w)
      }
    }
    const kind = words.includes('LEFT') ? 'left' : words.includes('RIGHT') ? 'right' : words.includes('FULL') ? 'full' : words.includes('CROSS') ? 'cross' : words.includes('NATURAL') ? 'natural' : 'inner'
    let onIdx = -1
    let d = 0
    for (let i = jw + 1; i < end; i += 1) {
      if (isSym(ts[i], '(')) d += 1
      else if (isSym(ts[i], ')')) d -= 1
      else if (d === 0 && ts[i].type === 'word' && /^(ON|USING)$/i.test(ts[i].text)) { onIdx = i; break }
    }
    const ta = tableAndAlias(ts, jw + 1, onIdx < 0 ? end : onIdx)
    return { kind, text, from: s.i, to: end, ...ta, on: onIdx < 0 ? null : squash(untokenize(ts.slice(onIdx + 1, end))) }
  })
  const fromText = squash(untokenize(ts.slice(fromIdx + 1, fromEnd)))
  const where = whereIdx === undefined ? null : squash(untokenize(ts.slice(whereIdx + 1, whereEnd)))
  let order = []
  let orderText = null
  if (orderIdx !== undefined) {
    const by = nextSigIdx(ts, orderIdx, hi)
    order = orderItems(ts, by + 1, hi)
    orderText = squash(untokenize(ts.slice(by + 1, hi)))
  }
  const ranges = { sel, distinctIdx, fromIdx, baseEnd, joins, whereIdx: whereIdx ?? null, whereEnd, orderIdx: orderIdx ?? null, hi, fromEnd }
  return { select: items, star, distinct, base, joins, fromText, where, order, orderText, ranges }
}

// Token labels for the SQL display: every token belongs to one clause.
function labelPart(ts, p, lo, label, sub) {
  const r = p.ranges
  const set = (a, b, clause, n = 0) => { for (let i = Math.max(a, lo); i < Math.min(b, r.hi); i += 1) { label[i] = clause; sub[i] = n } }
  set(r.sel, r.fromIdx, 'select')
  if (r.distinctIdx >= 0) label[r.distinctIdx] = 'distinct'
  set(r.fromIdx, r.baseEnd, 'from')
  r.joins.forEach((j, k) => set(j.from, j.to, 'join', k + 1))
  if (r.whereIdx !== null) set(r.whereIdx, r.whereEnd, 'where')
  if (r.orderIdx !== null) set(r.orderIdx, r.hi, 'order')
}

// parseQuery(sql) -> { parts: [Select], ops: ['minus', ...], segments: [{ clause, part, text }] }
export function parseQuery(sql) {
  const ts = tokenize(String(sql).replace(/;\s*$/, ''))
  const opIdx = topLevel(ts, (x, i) => {
    if (x.type !== 'word') return false
    const w = x.text.toUpperCase()
    if (!(w in SET_OPS) || w === 'UNION ALL') return false
    // ALL after UNION belongs to the operator; a lone ALL is not an operator
    void i
    return true
  })
  const bounds = []
  let lo = 0
  const ops = []
  for (const i of opIdx) {
    let end = i + 1
    let name = ts[i].text.toUpperCase()
    const nx = nextSigIdx(ts, i)
    if (name === 'UNION' && nx >= 0 && isWord(ts[nx], 'ALL')) { name = 'UNION ALL'; end = nx + 1 }
    bounds.push({ lo, hi: i, opFrom: i, opTo: end })
    ops.push(SET_OPS[name])
    lo = end
  }
  bounds.push({ lo, hi: ts.length, opFrom: null, opTo: null })
  const parts = bounds.map((b) => parseSelect(ts, b.lo, b.hi))
  const label = new Array(ts.length).fill(null)
  const sub = new Array(ts.length).fill(0)
  const partOf = new Array(ts.length).fill(0)
  bounds.forEach((b, k) => {
    labelPart(ts, parts[k], b.lo, label, sub)
    for (let i = b.lo; i < b.hi; i += 1) partOf[i] = k
    if (b.opFrom !== null) for (let i = b.opFrom; i < b.opTo; i += 1) { label[i] = ops[k]; partOf[i] = k }
  })
  const segments = []
  ts.forEach((x, i) => {
    const clause = label[i] || (segments.length ? segments[segments.length - 1].clause : 'select')
    const part = partOf[i]
    const n = label[i] ? sub[i] : (segments.length ? segments[segments.length - 1].sub : 0)
    const last = segments[segments.length - 1]
    if (last && last.clause === clause && last.part === part && last.sub === n) last.text += x.text
    else segments.push({ clause, part, sub: n, text: x.text })
  })
  for (const p of parts) delete p.ranges
  return { parts, ops, segments }
}
