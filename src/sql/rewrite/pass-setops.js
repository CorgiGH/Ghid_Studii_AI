// Set-operator pass: MINUS -> EXCEPT.
import { isSym, prevSig, raw } from './tokens.js'

export function minusToExcept(ts) {
  return ts.map((x, i) => {
    if (x.type !== 'word' || x.text.toUpperCase() !== 'MINUS') return x
    const pi = prevSig(ts, i)
    return pi >= 0 && isSym(ts[pi], '.') ? x : raw('EXCEPT')
  })
}
