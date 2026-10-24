// Oracle-shaped errors. Everything the learner sees as an error is { code: 'ORA-xxxxx', message }.

export class OracleError extends Error {
  constructor(code, message) {
    super(message)
    this.name = 'OracleError'
    this.code = code
  }
}

// PostgreSQL SQLSTATE (or an ORA-nnnnn text raised by the compat layer) -> the closest Oracle 11g error.
// `context` is optional: { sql } (the statement as typed) lets 42803 tell ORA-00937 from ORA-00979; { knownFunction } says whether
// a function of that name exists at all (wrong argument count) or not (unknown name).
export function mapPgError(err, context = {}) {
  if (err instanceof OracleError) return { code: err.code, message: err.message }
  const m = String((err && err.message) || err)
  const c = (err && err.code) || ''
  const ora = (code, message) => ({ code, message })
  if (/^ORA-\d+/.test(m)) {
    const mm = m.match(/^(ORA-\d+):?\s*(.*)$/s)
    return ora(mm[1], mm[2])
  }
  const constraint = ((m.match(/constraint "([^"]+)"/) || [])[1] || '').toUpperCase()
  if (c === '42703') {
    const q = (m.match(/column "([^"]+)"/) || [])[1]
    return ora('ORA-00904', `"${(q || '').toUpperCase()}": invalid identifier`)
  }
  if (c === '42P01' && /invalid reference to FROM-clause/.test(m)) return ora('ORA-00904', 'invalid identifier (table name hidden by its alias)')
  if (c === '42P01') {
    const q = (m.match(/(?:relation|table) "([^"]+)" does not exist/) || [])[1]
    return ora('ORA-00942', `table or view does not exist (${(q || '').toUpperCase()})`)
  }
  if (c === '42P07') {
    // PostgreSQL says "relation already exists" for a table and for the index behind a PRIMARY KEY / UNIQUE; Oracle tells them apart
    const rel = ((m.match(/relation "([^"]+)"/) || [])[1] || '').toLowerCase()
    const table = ((String(context.sql || '').match(/^\s*(?:CREATE\s+TABLE|RENAME\s+\S+\s+TO|ALTER\s+TABLE\s+\S+\s+RENAME\s+TO)\s+"?([\w$#]+)"?/i) || [])[1] || '').toLowerCase()
    if (rel && /^\s*(CREATE|ALTER)\s+TABLE/i.test(context.sql || '') && rel !== table) return ora('ORA-02264', 'name already used by an existing constraint')
    return ora('ORA-00955', 'name is already used by an existing object')
  }
  if (c === '42702' || c === '42725') return ora('ORA-00918', 'column ambiguously defined')
  if (c === '42601' && /INSERT has more expressions than target columns/.test(m)) return ora('ORA-00913', 'too many values')
  if (c === '42601' && /INSERT has more target columns than expressions/.test(m)) return ora('ORA-00947', 'not enough values')
  if (c === '42601') return ora('ORA-00933', 'SQL command not properly ended')
  if (c === '42701') return /already exists/.test(m) ? ora('ORA-01430', 'column being added already exists in table') : ora('ORA-00957', 'duplicate column name')
  if (c === '42P16' && /multiple primary keys/.test(m)) return ora('ORA-02260', 'table can have only one primary key')
  if (c === '42710') return ora('ORA-02264', 'name already used by an existing constraint')
  if (c === '42830') return ora('ORA-02270', 'no matching unique or primary key for this column-list')
  if (c === '2BP01') return ora('ORA-02449', 'unique/primary keys in table referenced by foreign keys')
  if (c === '0A000' && /truncate/i.test(m)) return ora('ORA-02266', 'unique/primary keys in table referenced by enabled foreign keys')
  if (c === '3B001') return ora('ORA-01086', 'savepoint never established in this session or is invalid')
  if (c === '22P02') return ora('ORA-01722', 'invalid number')
  if (c === '22007' || c === '22008') return ora('ORA-01861', 'literal does not match format string')
  if (c === '42883') {
    const fn = (m.match(/function ([A-Za-z_0-9]+)\(/) || [])[1]
    if (fn && context.knownFunction === true) return ora('ORA-00909', 'invalid number of arguments')
    if (fn && context.knownFunction === false) return ora('ORA-00904', `"${fn.toUpperCase()}": invalid identifier`)
    if (/operator does not exist/.test(m) && /\b(text|character|unknown)\b/.test(m)) return ora('ORA-01722', 'invalid number')
    return ora('ORA-00932', 'inconsistent datatypes: expected one type, got another')
  }
  if (c === '42804' || c === '42846') return ora('ORA-00932', 'inconsistent datatypes')
  if (c === '22012') return ora('ORA-01476', 'divisor is equal to zero')
  if (c === '42803') {
    if (/aggregate functions are not allowed/.test(m)) return ora('ORA-00934', 'group function is not allowed here')
    // no GROUP BY at all: a plain column next to an aggregate; with a GROUP BY: a column that is not grouped
    return /\bGROUP\s+BY\b/i.test(context.sql || '') ? ora('ORA-00979', 'not a GROUP BY expression') : ora('ORA-00937', 'not a single-group group function')
  }
  if (c === '42P10') return ora('ORA-01791', 'not a SELECTed expression')
  if (c === '23505') return ora('ORA-00001', `unique constraint (STUDENT.${constraint}) violated`)
  if (c === '23502' && /contains null values/.test(m)) {
    // ALTER TABLE .. ADD (c NOT NULL) on a table with rows, or .. MODIFY c NOT NULL on a column with NULLs
    return /\bMODIFY\b/i.test(context.sql || '') ? ora('ORA-02296', 'cannot enable - null values found') : ora('ORA-01758', 'table must be empty to add mandatory (NOT NULL) column')
  }
  if (c === '23502') {
    const col = ((m.match(/column "([^"]+)"/) || [])[1] || '').toUpperCase()
    const tab = ((m.match(/relation "([^"]+)"/) || [])[1] || '').toUpperCase()
    if (/^\s*UPDATE\b/i.test(context.sql || '')) return ora('ORA-01407', `cannot update ("STUDENT"."${tab}"."${col}") to NULL`)
    return ora('ORA-01400', `cannot insert NULL into ("STUDENT"."${tab}"."${col}")`)
  }
  if (c === '23503') {
    // deleting or updating a parent row that has children is 02292; inserting a child without a parent is 02291
    return /update or delete on table/.test(m)
      ? ora('ORA-02292', `integrity constraint (STUDENT.${constraint}) violated - child record found`)
      : ora('ORA-02291', `integrity constraint (STUDENT.${constraint}) violated - parent key not found`)
  }
  if (c === '23514') return ora('ORA-02290', `check constraint (STUDENT.${constraint}) violated`)
  if (c === '22001') {
    const max = (m.match(/\((\d+)\)/) || [])[1]
    return ora('ORA-12899', `value too large for column${max ? ` (maximum: ${max})` : ''}`)
  }
  if (c === '22003') return /integer out of range|bigint out of range/.test(m) ? ora('ORA-01426', 'numeric overflow') : ora('ORA-01438', 'value larger than specified precision allowed for this column')
  return ora('ORA-?', m)
}
