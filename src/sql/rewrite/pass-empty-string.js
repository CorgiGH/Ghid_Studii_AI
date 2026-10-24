// Empty-string pass: Oracle treats '' as NULL. A '' literal becomes NULL, and TRIM of only blanks (which is '') becomes NULL.
import { isSym, matchParen, nextSig, prevSig, raw } from './tokens.js'

// Beside || the NULL is typed CHAR: Oracle's '' is a CHAR literal, so  nume || ''  stays a CHAR and compares blank-padded.
export function emptyStringToNull(ts) {
  return ts.map((x, i) => {
    if (x.type !== 'string' || x.text !== "''") return x
    const p = prevSig(ts, i)
    const n = nextSig(ts, i)
    return raw(isSym(ts[p], '||') || isSym(ts[n], '||') ? 'NULL::bpchar' : 'NULL')
  })
}

// TRIM / LTRIM / RTRIM (...) -> NULLIF(TRIM(...), '')
export function trimBlanksToNull(ts) {
  const out = []
  for (let i = 0; i < ts.length; i++) {
    const x = ts[i]
    const nm = x.type === 'word' ? x.text.toUpperCase() : ''
    if (nm === 'TRIM' || nm === 'LTRIM' || nm === 'RTRIM') {
      const o = nextSig(ts, i)
      const p = prevSig(ts, i)
      if (o >= 0 && ts[o].text === '(' && !(p >= 0 && ts[p].text === '.')) {
        const c = matchParen(ts, o)
        if (c > 0) {
          out.push(raw('NULLIF('), x, raw('('), ...trimBlanksToNull(ts.slice(o + 1, c)), raw('), \'\')'))
          i = c
          continue
        }
      }
    }
    out.push(x)
  }
  return out
}
