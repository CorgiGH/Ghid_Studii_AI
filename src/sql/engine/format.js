// Result presentation: PostgreSQL value -> the text Oracle would display.
//
// The engine asks PGlite for raw strings for numeric, timestamp, date and bigint columns (see core.js), so these
// functions see the PostgreSQL text form and turn it into Oracle's.
import { tokenize } from '../rewrite/tokens.js'

// Unquoted identifiers and aliases are upper case in Oracle; PostgreSQL folds to lower case. A name the user wrote
// in "quotes" keeps its case. The result set cannot tell, so look it up in the original statement.
export function displayNames(fields, originalSql) {
  const quoted = new Set(tokenize(originalSql).filter((x) => x.type === 'qident').map((x) => x.text.slice(1, -1)))
  return fields.map((f) => (quoted.has(f) ? f : f.toUpperCase()))
}

const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
const NUMERIC_OIDS = new Set([1700, 20, 23, 21])
const TIMESTAMP_OID = 1114
const SHOWN_CHARS = 40 // a NUMBER prints in at most 40 characters, sign and decimal point included

// Round the digit string `digits` (no sign, no point) to n digits, half away from zero. Returns { digits, carry }
// where carry means the rounding added a digit (999 -> 1000).
function roundDigits(digits, n) {
  if (digits.length <= n) return { digits, carry: false }
  let v = BigInt(digits.slice(0, n))
  if (digits.charCodeAt(n) >= 53) v += 1n // '5'
  const out = v.toString().padStart(n, '0')
  return out.length > n ? { digits: out.slice(0, n), carry: true } : { digits: out, carry: false }
}

// NUMBER -> the text Oracle prints with no format model. Plain decimal text in ('-123.456000', '0.0003333...'),
// Oracle text out: fixed notation when it fits in 40 characters, else fixed notation cut to 40 characters (numbers of at
// least .00001 or below 1E39), else scientific notation with a 40 character mantissa field ('3.33...E-06').
export function numberText(text) {
  const m = /^(-?)(\d+)(?:\.(\d+))?$/.exec(text)
  if (!m) return text
  const sign = m[1]
  const ip = m[2].replace(/^0+(?=\d)/, '')
  const fp = (m[3] || '').replace(/0+$/, '')
  if (ip === '0' && fp === '') return '0'
  const intPart = ip === '0' ? '' : ip
  const fixed = `${sign}${intPart}${fp ? '.' + fp : ''}`
  if (fixed.length <= SHOWN_CHARS) return fixed
  const lead = ip === '0' ? fp.length - fp.replace(/^0+/, '').length : 0
  const exp10 = ip === '0' ? -lead - 1 : ip.length - 1
  if (ip !== '0' ? ip.length < SHOWN_CHARS - sign.length : exp10 >= -5) {
    const keepFrac = SHOWN_CHARS - sign.length - 1 - intPart.length
    const r = roundDigits(intPart + fp, intPart.length + keepFrac)
    const all = r.carry ? r.digits + '0' : r.digits
    const ipLen = intPart.length + (r.carry ? 1 : 0)
    const head = all.slice(0, ipLen)
    const tail = all.slice(ipLen).replace(/0+$/, '')
    return `${sign}${head}${tail ? '.' + tail : ''}`
  }
  const sig = (ip === '0' ? fp.slice(lead) : ip + fp)
  const r = roundDigits(sig, 1000)
  let e = exp10
  const expDigits = String(Math.abs(e)).length
  const width = SHOWN_CHARS - sign.length - 1 - (2 + Math.max(2, expDigits))
  const rr = roundDigits(r.digits, width)
  if (rr.carry) e += 1
  const mant = (rr.digits + '0'.repeat(width)).slice(0, width)
  const expText = `E${e < 0 ? '-' : '+'}${String(Math.abs(e)).padStart(2, '0')}`
  return `${sign}${mant[0]}.${mant.slice(1)}${expText}`
}

// formatCell(value, typeOid, typmod) -> display text, or null for SQL NULL.
// NUMBER -> shortest decimal text without a leading zero; DATE -> DD-MON-RR, never the time (what Oracle prints under the default NLS_DATE_FORMAT).
// typmod is accepted for the DDL work (NUMBER(p,s), VARCHAR2(n)); it does not change the text yet.
// eslint-disable-next-line no-unused-vars
export function formatCell(value, typeOid, typmod) {
  if (value === null || value === undefined || value === '') return null // Oracle has no empty string
  if (NUMERIC_OIDS.has(typeOid)) return numberText(String(value))
  if (typeOid === TIMESTAMP_OID) {
    const m = String(value).match(/^(\d{4})-(\d\d)-(\d\d)/)
    if (m) return `${m[3]}-${MON[+m[2] - 1]}-${m[1].slice(2)}`
  }
  return String(value)
}
