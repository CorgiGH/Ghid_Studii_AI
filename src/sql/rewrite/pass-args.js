// Argument pass: Oracle converts a function argument to the type of its parameter (TO_CHAR rules for NUMBER / DATE -> text, a
// numeric text -> NUMBER). PostgreSQL has no such implicit casts, so the arguments of the character functions are wrapped:
//   LPAD / RPAD (str, n [, pad])            -> lpad(ora_t(str), ora_n(n), ora_t(pad))
//   INSTR (str, sub [, pos [, occurrence]]) -> instr(ora_t(str), ora_t(sub), ora_n(pos), ora_n(occurrence))
//   REPLACE (str, search [, repl])          -> ora_t on every argument
//   TRANSLATE (str, from, to)               -> ora_t on every argument
// ora_t / ora_n live in compat/60-strings.sql. A call with an argument count Oracle does not accept is left alone, so it fails with
// the code Oracle gives for the count (engine/errors.js).
//
// DATE 'YYYY-MM-DD' beside || is typed as the compat layer's DATE (a timestamp), so DATE '1995-02-17' || 'x' concatenates the
// session's date text ('17-FEB-95x') as in Oracle, instead of being an ambiguous PostgreSQL date || text.
import { isSig, isSym, isWord, matchParen, nextSig, prevSig, raw, splitTop, tokenize, trimSpace } from './tokens.js'

// T = text argument, N = number argument; the list is the parameters in order, `min` the fewest Oracle accepts
const SIGNATURES = {
  LPAD: { params: 'TNT', min: 2 },
  RPAD: { params: 'TNT', min: 2 },
  INSTR: { params: 'TTNN', min: 2 },
  REPLACE: { params: 'TTT', min: 2 },
  TRANSLATE: { params: 'TTT', min: 3 },
}

export function argConversions(ts) {
  const out = []
  for (let i = 0; i < ts.length; i++) {
    const x = ts[i]
    const sig = x.type === 'word' ? SIGNATURES[x.text.toUpperCase()] : undefined
    if (sig && !isSym(ts[prevSig(ts, i)], '.')) {
      const o = nextSig(ts, i)
      const c = o >= 0 && isSym(ts[o], '(') ? matchParen(ts, o) : -1
      if (c > 0) {
        const args = splitTop(ts.slice(o + 1, c)).map(trimSpace)
        const usable = args.length >= sig.min && args.length <= sig.params.length && args.every((a) => a.some(isSig))
        if (usable) {
          out.push(...ts.slice(i, o + 1))
          args.forEach((a, k) => {
            if (k) out.push(...tokenize(', '))
            out.push(...tokenize(sig.params[k] === 'N' ? 'ora_n(' : 'ora_t('), ...argConversions(a), ...tokenize(')'))
          })
          out.push(ts[c])
          i = c
          continue
        }
      }
    }
    out.push(x)
  }
  return out
}

export function dateLiteralConcat(ts) {
  const out = []
  for (let i = 0; i < ts.length; i++) {
    const x = ts[i]
    if (isWord(x, 'DATE') && !isSym(ts[prevSig(ts, i)], '.')) {
      const s = nextSig(ts, i)
      if (s >= 0 && ts[s].type === 'string' && (isSym(ts[prevSig(ts, i)], '||') || isSym(ts[nextSig(ts, s)], '||'))) {
        out.push(...tokenize('('), ...ts.slice(i, s + 1), ...tokenize(')'), raw('::timestamp'))
        i = s
        continue
      }
    }
    out.push(x)
  }
  return out
}
