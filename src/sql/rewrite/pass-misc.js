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
