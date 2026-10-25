// Repeated table pass: FROM studenti, studenti (the same table twice, neither with an alias). PostgreSQL refuses the FROM clause
// itself; Oracle runs it (COUNT(*) FROM studenti, studenti is 169) and only refuses a column it cannot place: an unqualified
// column, studenti.nume and the * of the select list are all ORA-00918 there. So the repeat gets an alias of its own, PostgreSQL
// answers an unqualified column with its "ambiguous" error (mapped to ORA-00918), and a * or a column qualified with the
// repeated name is refused here with ORA-00918.
import { OracleError } from '../engine/errors.js'
import { isSig, isSym, isWord, matchParen, raw, selectListBounds } from './tokens.js'

const FROM_END = new Set(['WHERE', 'GROUP', 'HAVING', 'ORDER', 'UNION', 'INTERSECT', 'MINUS', 'EXCEPT', 'CONNECT', 'START', 'FOR'])
const JOIN_WORDS = new Set(['JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER', 'CROSS', 'NATURAL', 'ON', 'USING'])

// The table references of the FROM clause that starts after index `from` (same parenthesis level): [{ name, at, aliased }],
// `at` = index of the (last part of the) table name in ts.
function fromRefs(ts, from) {
  const refs = []
  let expect = true
  for (let i = from + 1; i < ts.length; i++) {
    const x = ts[i]
    if (!isSig(x)) continue
    if (isSym(x, '(')) {
      const c = matchParen(ts, i)
      if (c < 0) break
      i = c
      expect = false
      continue
    }
    if (isSym(x, ')') || isSym(x, ';')) break
    if (x.type === 'word' && FROM_END.has(x.text.toUpperCase())) break
    if (isSym(x, ',') || isWord(x, 'JOIN')) { expect = true; continue }
    if (isWord(x, 'ON') || isWord(x, 'USING')) { expect = false; continue }
    if (!expect || x.type !== 'word' || JOIN_WORDS.has(x.text.toUpperCase())) continue
    let at = i
    let j = i + 1
    while (j < ts.length && !isSig(ts[j])) j++
    while (isSym(ts[j], '.')) {
      let k = j + 1
      while (k < ts.length && !isSig(ts[k])) k++
      if (!ts[k] || ts[k].type !== 'word') break
      at = k
      j = k + 1
      while (j < ts.length && !isSig(ts[j])) j++
    }
    const next = ts[j]
    const aliased = !!next && (next.type === 'word' || next.type === 'qident') && !FROM_END.has(String(next.text).toUpperCase()) && !JOIN_WORDS.has(String(next.text).toUpperCase())
    refs.push({ name: ts[at].text.toLowerCase(), at, aliased })
    expect = false
    i = at
  }
  return refs
}

export function repeatedTables(ts) {
  const extra = new Map() // index of a repeated table name -> alias to add after it
  let refused = false
  for (let s = 0; s < ts.length; s++) {
    if (!isWord(ts[s], 'SELECT')) continue
    const { start, end } = selectListBounds(ts, s)
    if (!isWord(ts[end], 'FROM')) continue
    const plain = fromRefs(ts, end).filter((r) => !r.aliased)
    const seen = new Set()
    const repeated = new Set()
    for (const r of plain) {
      if (seen.has(r.name)) {
        repeated.add(r.name)
        extra.set(r.at, `ora_r${extra.size + 2}`)
      }
      seen.add(r.name)
    }
    if (!repeated.size) continue
    // * in the select list, or a column qualified with the repeated name anywhere: Oracle cannot tell the two apart
    const list = ts.slice(start, end).filter(isSig)
    const star = list.some((t, k) => isSym(t, '*') && (k === 0 || isSym(list[k - 1], ',')))
    const qualified = ts.some((t, k) => t.type === 'word' && repeated.has(t.text.toLowerCase()) && isSym(ts.slice(k + 1).find(isSig), '.'))
    if (star || qualified) refused = true
  }
  if (refused) throw new OracleError('ORA-00918', 'column ambiguously defined')
  if (!extra.size) return ts
  return ts.flatMap((t, i) => (extra.has(i) ? [t, raw(` ${extra.get(i)}`)] : [t]))
}
