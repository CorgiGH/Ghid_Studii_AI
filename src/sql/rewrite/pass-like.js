// Pass 2: Oracle has no default LIKE escape character, PostgreSQL defaults to backslash -> LIKE .. ESCAPE ''.
import { isWord, nextSig, raw } from './tokens.js'

export function likeEscape(ts) {
  const out = []
  for (let i = 0; i < ts.length; i++) {
    out.push(ts[i])
    if (isWord(ts[i], 'LIKE')) {
      const a = nextSig(ts, i)
      if (a >= 0 && (ts[a].type === 'string' || isWord(ts[a], 'NULL') || ts[a].type === 'raw')) {
        const b = nextSig(ts, a)
        if (!(b >= 0 && isWord(ts[b], 'ESCAPE'))) {
          for (let j = i + 1; j <= a; j++) out.push(ts[j])
          out.push(raw(" ESCAPE ''")); i = a
        }
      }
    }
  }
  return out
}
