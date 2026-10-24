// DECODE / GREATEST / LEAST / NVL / NVL2 pass.
//   DECODE        -> CASE with ora_deq (NULL = NULL, CHAR compared without padding)
//   GREATEST/LEAST -> NULL if any argument is NULL
//   NVL, NVL2     -> COALESCE / CASE
// Oracle gives these functions the type of their first value expression (the first result of DECODE, the first argument of
// NVL / GREATEST / LEAST, the second of NVL2) and converts the others to it: DECODE(an, 1, 100, 2, 'abc', 0) is 0, not an
// error, NVL(TO_CHAR(bursa), 0) is the text '0'. ora_widen(first) gives the PostgreSQL type, ora_conv(other, ora_widen(first)) converts.
import { matchParen, nextSig, prevSig, raw, splitTop, trimSpace } from './tokens.js'

export function decodePass(ts) {
  const out = []
  for (let i = 0; i < ts.length; i++) {
    const x = ts[i]
    const nm = x.type === 'word' ? x.text.toUpperCase() : ''
    if (nm === 'DECODE' || nm === 'GREATEST' || nm === 'LEAST' || nm === 'NVL' || nm === 'NVL2') {
      const o = nextSig(ts, i)
      const p = prevSig(ts, i)
      if (o >= 0 && ts[o].text === '(' && !(p >= 0 && ts[p].text === '.')) {
        const c = matchParen(ts, o)
        if (c > 0) {
          const args = splitTop(ts.slice(o + 1, c)).map((a) => decodePass(trimSpace(a)))
          if (nm === 'DECODE' && args.length >= 3) {
            const [e] = args
            const first = args[2]
            const conv = (a) => [raw('ora_conv('), ...a, raw(', ora_widen('), ...first, raw('))')]
            out.push(raw('CASE'))
            let k = 1
            for (; k + 1 < args.length; k += 2) {
              out.push(raw(' WHEN ora_deq(('), ...e, raw('), ('), ...args[k], raw(')) THEN '))
              out.push(...(k === 1 ? [raw('ora_widen('), ...args[k + 1], raw(')')] : conv(args[k + 1])))
            }
            if (k < args.length) out.push(raw(' ELSE '), ...conv(args[k]))
            out.push(raw(' END'))
            i = c
            continue
          }
          if (nm === 'NVL' && args.length === 2) {
            const [a, b] = args
            out.push(raw('COALESCE(ora_widen('), ...a, raw('), ora_conv('), ...b, raw(', ora_widen('), ...a, raw(')))'))
            i = c
            continue
          }
          if (nm === 'NVL2' && args.length === 3) {
            const [e, a, b] = args
            out.push(raw('CASE WHEN ('), ...e, raw(') IS NOT NULL THEN ora_widen('), ...a, raw(') ELSE ora_conv('), ...b, raw(', ora_widen('), ...a, raw(')) END'))
            i = c
            continue
          }
          if ((nm === 'GREATEST' || nm === 'LEAST') && args.length >= 2) {
            out.push(raw('CASE WHEN '))
            args.forEach((a, j) => out.push(raw(j ? ' OR (' : '('), ...a, raw(') IS NULL')))
            out.push(raw(` THEN NULL ELSE ${nm}(ora_widen(`), ...args[0], raw(')'))
            for (const a of args.slice(1)) out.push(raw(', ora_conv('), ...a, raw(', ora_widen('), ...args[0], raw('))'))
            out.push(raw(') END'))
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

// UPPER / LOWER / INITCAP of a string literal: a literal is CHAR in Oracle and so is the result, so UPPER(nume) =
// UPPER('Breaban') compares blank-padded. Typing the literal bpchar picks the bpchar overloads of 20-char.sql.
export function charLiteralArgs(ts) {
  return ts.flatMap((x, i) => {
    if (x.type !== 'string' || x.text === "''") return [x]
    const o = prevSig(ts, i)
    const c = nextSig(ts, i)
    const f = o >= 0 ? prevSig(ts, o) : -1
    const isFn = f >= 0 && ts[f].type === 'word' && ['UPPER', 'LOWER', 'INITCAP'].includes(ts[f].text.toUpperCase())
    const dotted = isFn && prevSig(ts, f) >= 0 && ts[prevSig(ts, f)].text === '.'
    return isFn && !dotted && ts[o].text === '(' && c >= 0 && ts[c].text === ')' ? [x, raw('::bpchar')] : [x]
  })
}
