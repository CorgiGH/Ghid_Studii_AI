// Oracle-shaped errors. Everything the learner sees as an error is { code: 'ORA-xxxxx', message }.

export class OracleError extends Error {
  // `dialect` marks a rejection of another SQL dialect's habit (LIMIT, ILIKE, ::); the code alone cannot tell that from a typo.
  // `construct` names the habit: 'except' | 'limit' | 'ilike' | 'cast' | 'set-all' (the explanation says what Oracle uses instead).
  constructor(code, message, dialect = false, construct = undefined) {
    super(message)
    this.name = 'OracleError'
    this.code = code
    if (dialect) this.dialect = true
    if (dialect && construct) this.construct = construct
  }
}

// Oracle 11g's argument counts for the functions whose wrong count it answers with ORA-00938 (not enough arguments) or ORA-00939
// (too many): the ones that take a range of counts (measured). A function with one fixed count answers ORA-00909.
const ARG_RANGE = {
  lpad: [2, 3], rpad: [2, 3], substr: [2, 3], instr: [2, 4], round: [1, 2], trunc: [1, 2], to_char: [1, 3], to_date: [1, 3],
  to_number: [1, 3], replace: [2, 3], decode: [3, Infinity], greatest: [1, Infinity], least: [1, Infinity], coalesce: [2, Infinity],
}

// The ORA code for a call of a function that exists, with argument types or a count it has no version for.
//   name: the function; argc: the arguments of the failing call; arities: [{ min, max }] of the versions that exist
export function wrongCallCode(name, argc, arities = []) {
  const range = ARG_RANGE[String(name).toLowerCase()]
  if (range) {
    if (argc < range[0]) return 'ORA-00938'
    if (argc > range[1]) return 'ORA-00939'
    return 'ORA-00932'
  }
  if (arities.some((a) => argc >= a.min && argc <= a.max)) return 'ORA-00932'
  return 'ORA-00909'
}

const CALL_MESSAGES = {
  'ORA-00909': 'invalid number of arguments',
  'ORA-00938': 'not enough arguments for function',
  'ORA-00939': 'too many arguments for function',
  'ORA-00932': 'inconsistent datatypes: expected one type, got another',
}

// PostgreSQL names its own types and the compat layer's helpers (ora_date, timestamp without time zone, ora_t ...) in a message;
// the learner never sees them.
const internalNames = (m) => /\bora_\w+|without time zone|with time zone|\bbpchar\b|\bpg_\w+/.test(m)

// PostgreSQL SQLSTATE (or an ORA-nnnnn text raised by the compat layer) -> the closest Oracle 11g error.
// `context` is optional: { sql } (the statement as typed) lets 42803 tell ORA-00937 from ORA-00979; { knownFunction } says whether
// a function of that name exists at all (wrong argument count) or not (unknown name).
export function mapPgError(err, context = {}) {
  if (err instanceof OracleError) {
    if (!err.dialect) return { code: err.code, message: err.message }
    return { code: err.code, message: err.message, dialect: true, ...(err.construct ? { construct: err.construct } : {}) }
  }
  const m = String((err && err.message) || err)
  const c = (err && err.code) || ''
  const ora = (code, message) => ({ code, message })
  if (/^ORA-\d+/.test(m)) {
    const mm = m.match(/^(ORA-\d+):?\s*(.*)$/s)
    return ora(mm[1], internalNames(mm[2]) ? CALL_MESSAGES[mm[1]] ?? 'the practice database raised this error' : mm[2])
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
  if (c === '42702' || c === '42725' || c === '42712') return ora('ORA-00918', 'column ambiguously defined')
  if (c === '42601' && /INSERT has more expressions than target columns/.test(m)) return ora('ORA-00913', 'too many values')
  if (c === '42601' && /INSERT has more target columns than expressions/.test(m)) return ora('ORA-00947', 'not enough values')
  if (c === '42601' && /each (UNION|INTERSECT|EXCEPT) query must have the same number of columns/.test(m)) return ora('ORA-01789', 'query block has incorrect number of result columns')
  if (c === '42601' && /unterminated quoted string/.test(m)) return ora('ORA-01756', 'quoted string not properly terminated')
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
    // context.knownFunction: true (the function exists, with other argument types or counts), false (no such name), or
    // { arities: [{ min, max }] } (it exists; the counts its versions take)
    const fn = (m.match(/function ([A-Za-z_0-9]+)\(/) || [])[1]
    if (fn && context.knownFunction === false) return ora('ORA-00904', `"${fn.toUpperCase()}": invalid identifier`)
    if (fn && context.knownFunction) {
      const argList = (m.match(/function [A-Za-z_0-9]+\(([^)]*)\)/) || [])[1] ?? ''
      const argc = argList.trim() ? argList.split(',').length : 0
      const arities = context.knownFunction === true ? [] : context.knownFunction.arities ?? []
      const code = wrongCallCode(fn, argc, arities)
      return ora(code, CALL_MESSAGES[code])
    }
    if (/operator does not exist/.test(m) && /\b(text|character|unknown)\b/.test(m)) return ora('ORA-01722', 'invalid number')
    return ora('ORA-00932', 'inconsistent datatypes: expected one type, got another')
  }
  if (c === '42804' && /(UNION|INTERSECT|EXCEPT) types .* cannot be matched/.test(m)) return ora('ORA-01790', 'expression must have same datatype as corresponding expression')
  if (c === '42804' || c === '42846') return ora('ORA-00932', 'inconsistent datatypes')
  if (c === '21000') return ora('ORA-01427', 'single-row subquery returns more than one row')
  if (c === '42P20') {
    // a ROWNUM form the rewriter could not turn into a row limit ends up as a window function in WHERE; Oracle runs it
    if (/\bROWNUM\b/i.test(context.sql || '')) return ora('ORA-03001', 'unimplemented feature: this use of ROWNUM is not available in this practice database')
    return ora('ORA-30483', 'window functions are not allowed here')
  }
  if (c === '22012') return ora('ORA-01476', 'divisor is equal to zero')
  if (c === '42803') {
    if (/aggregate functions are not allowed/.test(m)) return ora('ORA-00934', 'group function is not allowed here')
    // no GROUP BY at all: a plain column next to an aggregate; with a GROUP BY: a column that is not grouped
    return /\bGROUP\s+BY\b/i.test(context.sql || '') ? ora('ORA-00979', 'not a GROUP BY expression') : ora('ORA-00937', 'not a single-group group function')
  }
  if (c === '42P10' && /ORDER BY position/.test(m)) return ora('ORA-01785', 'ORDER BY item must be the number of a SELECT-list expression')
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
  return ora('ORA-?', internalNames(m) ? 'the practice database could not run this statement' : m)
}
