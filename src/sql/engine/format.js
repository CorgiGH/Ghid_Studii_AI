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

// formatCell(value, typeOid, typmod) -> display text, or null for SQL NULL.
// NUMBER -> shortest decimal text without a leading zero; DATE -> DD-MON-RR, with the time when it is not midnight.
// typmod is accepted for the DDL work (NUMBER(p,s), VARCHAR2(n)); it does not change the text yet.
// eslint-disable-next-line no-unused-vars
export function formatCell(value, typeOid, typmod) {
  if (value === null || value === undefined || value === '') return null // Oracle has no empty string
  if (NUMERIC_OIDS.has(typeOid)) {
    let s = String(value)
    if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, '')
    return s.replace(/^(-?)0\./, '$1.')
  }
  if (typeOid === TIMESTAMP_OID) {
    const m = String(value).match(/^(\d{4})-(\d\d)-(\d\d)(?: (\d\d:\d\d:\d\d))?/)
    if (m) return `${m[3]}-${MON[+m[2] - 1]}-${m[1].slice(2)}` + (m[4] && m[4] !== '00:00:00' ? ' ' + m[4] : '')
  }
  return String(value)
}
