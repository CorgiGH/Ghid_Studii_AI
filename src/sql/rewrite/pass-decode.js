// DECODE / GREATEST / LEAST pass: DECODE -> CASE with NULL = NULL, GREATEST/LEAST -> NULL if any argument is NULL.
import { matchParen, nextSig, prevSig, raw, splitTop, trimSpace } from './tokens.js'

const joinArgs = (args, sep) => args.flatMap((a, i) => (i ? [raw(sep), ...a] : a))

export function decodePass(ts) {
  const out = []
  for (let i = 0; i < ts.length; i++) {
    const x = ts[i]
    const nm = x.type === 'word' ? x.text.toUpperCase() : ''
    if (nm === 'DECODE' || nm === 'GREATEST' || nm === 'LEAST') {
      const o = nextSig(ts, i)
      const p = prevSig(ts, i)
      if (o >= 0 && ts[o].text === '(' && !(p >= 0 && ts[p].text === '.')) {
        const c = matchParen(ts, o)
        if (c > 0) {
          const args = splitTop(ts.slice(o + 1, c)).map((a) => decodePass(trimSpace(a)))
          if (nm === 'DECODE' && args.length >= 3) {
            const [e] = args
            out.push(raw('CASE'))
            let k = 1
            for (; k + 1 < args.length; k += 2) out.push(raw(' WHEN ('), ...e, raw(') IS NOT DISTINCT FROM ('), ...args[k], raw(') THEN ('), ...args[k + 1], raw(')'))
            if (k < args.length) out.push(raw(' ELSE ('), ...args[k], raw(')'))
            out.push(raw(' END'))
            i = c
            continue
          }
          if ((nm === 'GREATEST' || nm === 'LEAST') && args.length >= 2) {
            out.push(raw('CASE WHEN '))
            args.forEach((a, j) => out.push(raw(j ? ' OR (' : '('), ...a, raw(') IS NULL')))
            out.push(raw(` THEN NULL ELSE ${nm}(`), ...joinArgs(args, ', '), raw(') END'))
            i = c
            continue
          }
        }
      }
    }
    out.push(x)
  }
  return out
}
