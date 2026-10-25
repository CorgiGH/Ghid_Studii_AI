// CAST pass: CAST to a character type or to DATE gives Oracle's value, not PostgreSQL's.
//   CAST(x AS VARCHAR2(n))  (also VARCHAR, NVARCHAR2)  -> ora_cast_varchar(x, n)   the text of x as Oracle writes it (a number
//                                                         without trailing zeros, a DATE in the session date format), cut to n
//                                                         characters for a text, ORA-25137 / ORA-01801 for a number / date
//                                                         that does not fit
//   CAST(x AS CHAR(n))      (also NCHAR; no length = 1) -> ora_cast_char(x, n)      the same, padded with blanks to n
//   CAST(x AS DATE)                                     -> ora_cast_date(x)         a text is read in the session date format
//   CAST(x AS VARCHAR2)     (no length)                 -> ORA-00906, as in Oracle
// Any other target type is left to PostgreSQL (NUMBER is mapped by pass-misc). The functions live in compat/60-strings.sql.
// The output is real tokens, so the passes after this one still see the expression inside.
import { OracleError } from '../engine/errors.js'
import { isSig, isSym, isWord, matchParen, prevSig, tokenize, trimSpace } from './tokens.js'

const VARCHAR_TYPES = new Set(['VARCHAR2', 'VARCHAR', 'NVARCHAR2'])
const CHAR_TYPES = new Set(['CHAR', 'NCHAR', 'CHARACTER'])

// the index of the last AS at the top level of ts[from, to), or -1
function topLevelAs(ts, from, to) {
  let d = 0
  let at = -1
  for (let i = from; i < to; i++) {
    if (isSym(ts[i], '(')) d++
    else if (isSym(ts[i], ')')) d--
    else if (d === 0 && isWord(ts[i], 'AS')) at = i
  }
  return at
}

// The target type of a CAST, from the tokens after AS: { kind: 'varchar'|'char'|'date', length } or null (another type)
function targetType(typeToks) {
  const sig = typeToks.filter(isSig)
  if (!sig.length || sig[0].type !== 'word') return null
  const name = sig[0].text.toUpperCase()
  if (name === 'DATE' && sig.length === 1) return { kind: 'date' }
  const varchar = VARCHAR_TYPES.has(name)
  if (!varchar && !CHAR_TYPES.has(name)) return null
  if (sig.length === 1) {
    if (varchar) throw new OracleError('ORA-00906', 'missing left parenthesis')
    return { kind: 'char', length: 1 }
  }
  // (n) or (n BYTE) or (n CHAR)
  if (!isSym(sig[1], '(') || !sig[2] || sig[2].type !== 'number' || !/^\d+$/.test(sig[2].text)) return null
  let k = 3
  if (isWord(sig[k], 'BYTE') || isWord(sig[k], 'CHAR')) k++
  if (!isSym(sig[k], ')') || k !== sig.length - 1) return null
  return { kind: varchar ? 'varchar' : 'char', length: Number(sig[2].text) }
}

export function castPass(ts) {
  const out = []
  for (let i = 0; i < ts.length; i++) {
    const x = ts[i]
    if (isWord(x, 'CAST') && !isSym(ts[prevSig(ts, i)], '.')) {
      let o = i + 1
      while (o < ts.length && !isSig(ts[o])) o++
      const c = isSym(ts[o], '(') ? matchParen(ts, o) : -1
      const as = c > 0 ? topLevelAs(ts, o + 1, c) : -1
      const type = as > 0 ? targetType(ts.slice(as + 1, c)) : null
      if (type) {
        const expr = castPass(trimSpace(ts.slice(o + 1, as)))
        if (type.kind === 'date') out.push(...tokenize('ora_cast_date('), ...expr, ...tokenize(')'))
        else out.push(...tokenize(`ora_cast_${type.kind}(`), ...expr, ...tokenize(`, ${type.length})`))
        i = c
        continue
      }
    }
    out.push(x)
  }
  return out
}
