// Oracle-shaped errors. Everything the learner sees as an error is { code: 'ORA-xxxxx', message }.

export class OracleError extends Error {
  constructor(code, message) {
    super(message)
    this.name = 'OracleError'
    this.code = code
  }
}

// PostgreSQL SQLSTATE (or an ORA-nnnnn text raised by the compat layer) -> the closest Oracle 11g error.
export function mapPgError(err) {
  if (err instanceof OracleError) return { code: err.code, message: err.message }
  const m = String((err && err.message) || err)
  const c = (err && err.code) || ''
  const ora = (code, message) => ({ code, message })
  if (/^ORA-\d+/.test(m)) {
    const mm = m.match(/^(ORA-\d+):?\s*(.*)$/s)
    return ora(mm[1], mm[2])
  }
  if (c === '42703') {
    const q = (m.match(/column "?([^"]+)"? does not exist/) || [])[1]
    return ora('ORA-00904', `"${(q || '').toUpperCase()}": invalid identifier`)
  }
  if (c === '42P01' && /invalid reference to FROM-clause/.test(m)) return ora('ORA-00904', 'invalid identifier (table name hidden by its alias)')
  if (c === '42P01') {
    const q = (m.match(/relation "([^"]+)" does not exist/) || [])[1]
    return ora('ORA-00942', `table or view does not exist (${(q || '').toUpperCase()})`)
  }
  if (c === '42702') return ora('ORA-00918', 'column ambiguously defined')
  if (c === '42601') return ora('ORA-00933', 'SQL command not properly ended (or ORA-009xx syntax error)')
  if (c === '22P02') return ora('ORA-01722', 'invalid number')
  if (c === '22007' || c === '22008') return ora('ORA-01861', 'literal does not match format string (or ORA-018xx date error)')
  if (c === '42883') return ora(/function/.test(m) ? 'ORA-00904/ORA-00909' : 'ORA-00932', 'invalid identifier or wrong argument types/number')
  if (c === '42804' || c === '42846') return ora('ORA-00932', 'inconsistent datatypes')
  if (c === '22012') return ora('ORA-01476', 'divisor is equal to zero')
  if (c === '42803') return ora('ORA-00979', 'not a GROUP BY expression')
  if (c === '42P10') return ora('ORA-01791', 'not a SELECTed expression')
  if (c === '42725') return ora('ORA-00918', 'column ambiguously defined')
  return ora('ORA-?', m)
}
