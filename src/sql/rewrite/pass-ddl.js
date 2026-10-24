// DDL / DML pass: Oracle's CREATE TABLE, ALTER TABLE, DROP TABLE, RENAME and DELETE spellings -> PostgreSQL, with Oracle's types.
//
//   ddlPass(ts, { columns? }) -> { ts, post }   post: statements the engine runs right after this one succeeded (bookkeeping, see below)
//                                               columns: [{ name, date }] of the table an INSERT / UPDATE writes to (see dmlTarget)
//
//   CREATE TABLE t (c VARCHAR2(10), n NUMBER(6,2), d DATE, ...)   column types become PostgreSQL types that raise Oracle's errors
//                                                                 (ORA-12899, ORA-01438); the types themselves are listed in 70-ddl.sql
//   every PRIMARY KEY / UNIQUE / CHECK / FOREIGN KEY gets a name (the one the learner gave, else SYS_Cnnnnnn)
//   CHECK (...)        the text the learner typed is kept in ora_check_text for user_constraints.search_condition
//   DROP TABLE t [CASCADE CONSTRAINTS] [PURGE]    CASCADE CONSTRAINTS -> CASCADE, PURGE is dropped
//   DELETE t WHERE ... -> DELETE FROM t WHERE ...
//   INSERT / UPDATE    a string literal assigned to a DATE column goes through TO_DATE (the session's format); INSERT INTO t VALUES
//                      with fewer values than columns is ORA-00947 (PostgreSQL would fill the rest)
//   RENAME a TO b      -> ALTER TABLE a RENAME TO b
//   ALTER TABLE t ADD (...) / ADD CONSTRAINT / MODIFY (...)   same column and constraint rules as CREATE TABLE
// Oracle's rejections come out as OracleError with the code Oracle gives (ORA-00902 invalid datatype, ORA-00906, ORA-00910, ORA-01723,
// ORA-01727, ORA-01728).
import { OracleError } from '../engine/errors.js'
import { isSig, isSym, isWord, matchParen, raw, splitTop, tokenize, trimSpace, untokenize } from './tokens.js'

const lit = (s) => `'${String(s).replace(/'/g, "''")}'`

// ---- names ---------------------------------------------------------------------------------------------------------
// The PostgreSQL spelling of an identifier token: unquoted names fold to lower case, "quoted" ones keep their text
const pgName = (t) => (t.type === 'qident' ? t.text.slice(1, -1) : t.text.toLowerCase())
const isName = (t) => !!t && (t.type === 'word' || t.type === 'qident')

// SYS_Cnnnnnn: a name for a constraint the learner did not name, stable for the same table and columns
function sysName(table, kind, cols) {
  let h = 2166136261
  for (const ch of `${table}.${kind}.${cols}`) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0
  return `sys_c${100000 + (h % 900000)}`
}

// ---- types ---------------------------------------------------------------------------------------------------------
const bad = (code, message) => new OracleError(code, message)

// Reads a type at sig[i...] (sig = significant tokens). Returns { text, next } where text is the PostgreSQL type.
function readType(sig, i) {
  const t = sig[i]
  if (!t || t.type !== 'word') throw bad('ORA-00902', 'invalid datatype')
  const word = t.text.toUpperCase()
  // optional ( n [, m] ) after the type name; each argument is a number, `*`, BYTE or CHAR
  let j = i + 1
  let args = null
  if (isSym(sig[j], '(')) {
    const close = matchParen(sig, j)
    if (close < 0) throw bad('ORA-00907', 'missing right parenthesis')
    args = []
    for (const part of splitTop(sig.slice(j + 1, close))) {
      const p = part.filter(isSig)
      const num = p.find((x) => x.type === 'number' || isSym(x, '*') || isSym(x, '-'))
      if (isSym(p[0], '-') && p[1]?.type === 'number') args.push(-Number(p[1].text))
      else if (num && num.type === 'number') args.push(Number(num.text))
      else if (num) args.push('*')
      else throw bad('ORA-00907', 'missing right parenthesis')
    }
    j = close + 1
  }
  const next = () => ({ next: j })
  switch (word) {
    case 'VARCHAR2': case 'VARCHAR': case 'NVARCHAR2': {
      if (!args) throw bad('ORA-00906', 'missing left parenthesis')
      const n = args[0]
      if (n === 0) throw bad('ORA-01723', 'zero-length columns are not allowed')
      if (typeof n !== 'number' || n > 4000) throw bad('ORA-00910', 'specified length too long for its datatype')
      return { text: `varchar(${n})`, ...next() }
    }
    case 'CHAR': case 'NCHAR': {
      const n = args ? args[0] : 1
      if (n === 0) throw bad('ORA-01723', 'zero-length columns are not allowed')
      if (typeof n !== 'number' || n > 2000) throw bad('ORA-00910', 'specified length too long for its datatype')
      return { text: `char(${n})`, ...next() }
    }
    case 'NUMBER': case 'NUMERIC': case 'DECIMAL': case 'DEC': {
      if (!args) return { text: 'numeric', ...next() }
      const p = args[0] === '*' ? 38 : args[0]
      const s = args.length > 1 ? args[1] : 0
      if (!(p >= 1 && p <= 38)) throw bad('ORA-01727', 'numeric precision specifier is out of range (1 to 38)')
      if (!(s >= -84 && s <= 127)) throw bad('ORA-01728', 'numeric scale specifier is out of range (-84 to 127)')
      return { text: `numeric(${p},${s})`, ...next() }
    }
    case 'INTEGER': case 'INT': case 'SMALLINT':
      return { text: 'ora_integer', ...next() }
    case 'FLOAT': case 'REAL':
      return { text: 'ora_float', ...next() }
    case 'DOUBLE':
      if (isWord(sig[j], 'PRECISION')) return { text: 'ora_float', next: j + 1 }
      throw bad('ORA-00902', 'invalid datatype')
    case 'DATE':
      return { text: 'ora_date', ...next() }
    case 'TIMESTAMP': {
      const n = args ? args[0] : 6
      if (typeof n !== 'number' || n < 0 || n > 9) throw bad('ORA-30088', 'datetime/interval precision is out of range')
      return { text: `timestamp(${n})`, ...next() }
    }
    case 'CLOB': case 'NCLOB': case 'LONG':
      return { text: 'text', ...next() }
    default:
      throw bad('ORA-00902', 'invalid datatype')
  }
}

// ---- column definitions and constraints ------------------------------------------------------------------------------
const CONSTRAINT_START = new Set(['NOT', 'NULL', 'CONSTRAINT', 'PRIMARY', 'UNIQUE', 'CHECK', 'REFERENCES', 'DEFAULT', 'ENABLE', 'DISABLE'])

// Table-level or column-level constraint body starting at sig[i] (PRIMARY KEY, UNIQUE, CHECK, FOREIGN KEY, REFERENCES).
// Returns { tokens, next } with the PostgreSQL text; `name` is the constraint name chosen by the caller.
function readConstraintBody(sig, i, ctx, name, columns) {
  const w = sig[i] && sig[i].type === 'word' ? sig[i].text.toUpperCase() : ''
  const cols = (open) => {
    const close = matchParen(sig, open)
    return { close, list: sig.slice(open + 1, close).filter(isName).map(pgName) }
  }
  if (w === 'PRIMARY' && isWord(sig[i + 1], 'KEY')) {
    let j = i + 2
    let list = columns
    if (isSym(sig[j], '(')) { const c = cols(j); list = c.list; j = c.close + 1 }
    const nm = claim(ctx, name || sysName(ctx.table, 'p', list.join(',')))
    return { out: [raw(` CONSTRAINT ${nm} PRIMARY KEY`), ...(isSym(sig[i + 2], '(') ? [raw(` (${list.join(', ')})`)] : [])], next: j }
  }
  if (w === 'UNIQUE') {
    let j = i + 1
    let list = columns
    if (isSym(sig[j], '(')) { const c = cols(j); list = c.list; j = c.close + 1 }
    const nm = claim(ctx, name || sysName(ctx.table, 'u', list.join(',')))
    return { out: [raw(` CONSTRAINT ${nm} UNIQUE`), ...(isSym(sig[i + 1], '(') ? [raw(` (${list.join(', ')})`)] : [])], next: j }
  }
  if (w === 'CHECK' && isSym(sig[i + 1], '(')) {
    const close = matchParen(sig, i + 1)
    if (close < 0) throw bad('ORA-00907', 'missing right parenthesis')
    const inner = ctx.toks.slice(ctx.toks.indexOf(sig[i + 1]) + 1, ctx.toks.indexOf(sig[close]))
    const text = untokenize(trimSpace(inner)).trim()
    const nm = claim(ctx, name || sysName(ctx.table, 'c', text))
    ctx.checks.push({ name: nm, text })
    return { out: [raw(` CONSTRAINT ${nm} CHECK (`), ...inner, raw(')')], next: close + 1 }
  }
  if (w === 'FOREIGN' && isWord(sig[i + 1], 'KEY') && isSym(sig[i + 2], '(')) {
    const c = cols(i + 2)
    if (!isWord(sig[c.close + 1], 'REFERENCES')) throw bad('ORA-00905', 'missing keyword')
    const r = readReferences(sig, c.close + 1, claim(ctx, name || sysName(ctx.table, 'f', c.list.join(','))))
    return { out: [raw(` CONSTRAINT ${r.name} FOREIGN KEY (${c.list.join(', ')})`), ...r.out], next: r.next }
  }
  if (w === 'REFERENCES') {
    const r = readReferences(sig, i, claim(ctx, name || sysName(ctx.table, 'f', columns.join(','))))
    return { out: [raw(` CONSTRAINT ${r.name}`), ...r.out], next: r.next }
  }
  return null
}

// REFERENCES table [(cols)] [ON DELETE CASCADE | ON DELETE SET NULL]
function readReferences(sig, i, name) {
  let j = i + 1
  if (!isName(sig[j])) throw bad('ORA-00905', 'missing keyword')
  const out = [raw(` REFERENCES ${pgName(sig[j])}`)]
  j++
  if (isSym(sig[j], '(')) {
    const close = matchParen(sig, j)
    out.push(raw(` (${sig.slice(j + 1, close).filter(isName).map(pgName).join(', ')})`))
    j = close + 1
  }
  if (isWord(sig[j], 'ON') && isWord(sig[j + 1], 'DELETE')) {
    if (isWord(sig[j + 2], 'CASCADE')) { out.push(raw(' ON DELETE CASCADE')); j += 3 }
    else if (isWord(sig[j + 2], 'SET') && isWord(sig[j + 3], 'NULL')) { out.push(raw(' ON DELETE SET NULL')); j += 4 }
  }
  return { name, out, next: j }
}

// One item of CREATE TABLE ( ... ) or ADD ( ... ): a column definition or a table constraint. Returns the PostgreSQL tokens.
function readItem(item, ctx) {
  ctx.toks = trimSpace(item) // with the blanks: the CHECK and DEFAULT expressions keep their spacing
  const sig = ctx.toks.filter(isSig)
  if (!sig.length) throw bad('ORA-00936', 'missing expression')
  const first = sig[0].type === 'word' ? sig[0].text.toUpperCase() : ''
  // table constraint
  if (first === 'CONSTRAINT' || first === 'PRIMARY' || first === 'UNIQUE' || first === 'CHECK' || first === 'FOREIGN') {
    let i = 0
    let name = null
    if (first === 'CONSTRAINT') {
      if (!isName(sig[1])) throw bad('ORA-00903', 'invalid table name')
      name = pgName(sig[1])
      i = 2
    }
    const body = readConstraintBody(sig, i, ctx, name, [])
    if (!body) throw bad('ORA-00900', 'invalid SQL statement')
    return { kind: 'constraint', out: body.out }
  }
  // column definition: name type [DEFAULT expr] [constraints]
  if (!isName(sig[0])) throw bad('ORA-00904', 'invalid identifier')
  const col = pgName(sig[0])
  if (ctx.columns.includes(col)) throw bad('ORA-00957', 'duplicate column name')
  ctx.columns.push(col)
  const type = readType(sig, 1)
  const out = [raw(`${col} ${type.text}`)]
  let i = type.next
  let pending = null
  let nullSpec = false
  while (i < sig.length) {
    const t = sig[i]
    const w = t.type === 'word' ? t.text.toUpperCase() : ''
    if (w === 'DEFAULT') {
      let j = i + 1
      let depth = 0
      while (j < sig.length) {
        if (isSym(sig[j], '(')) depth++
        else if (isSym(sig[j], ')')) depth--
        else if (depth === 0 && sig[j].type === 'word' && CONSTRAINT_START.has(sig[j].text.toUpperCase())) break
        j++
      }
      if (j === i + 1) throw bad('ORA-00936', 'missing expression')
      out.push(raw(' DEFAULT '), ...ctx.toks.slice(ctx.toks.indexOf(sig[i]) + 1, ctx.toks.indexOf(sig[j - 1]) + 1))
      i = j
    } else if (w === 'NOT' && isWord(sig[i + 1], 'NULL')) {
      if (nullSpec) throw bad('ORA-02258', 'duplicate or conflicting NULL and/or NOT NULL specifications')
      nullSpec = true
      out.push(raw(pending ? ` CONSTRAINT ${claim(ctx, pending)} NOT NULL` : ' NOT NULL'))
      pending = null
      i += 2
    } else if (w === 'NULL') {
      if (nullSpec) throw bad('ORA-02258', 'duplicate or conflicting NULL and/or NOT NULL specifications')
      nullSpec = true
      out.push(raw(' NULL'))
      i++
    } else if (w === 'CONSTRAINT') {
      if (!isName(sig[i + 1])) throw bad('ORA-00903', 'invalid table name')
      pending = pgName(sig[i + 1])
      i += 2
    } else if (w === 'ENABLE' || w === 'DISABLE') {
      i++
    } else {
      const body = readConstraintBody(sig, i, ctx, pending, [col])
      if (!body) throw bad('ORA-00907', 'missing right parenthesis')
      out.push(...body.out)
      pending = null
      i = body.next
    }
  }
  return { kind: 'column', out }
}

const newCtx = (table) => ({ table, columns: [], checks: [], names: new Set() })

// a constraint name may be used once per statement (Oracle: once per schema, ORA-02264)
function claim(ctx, name) {
  if (ctx.names.has(name)) throw bad('ORA-02264', 'name already used by an existing constraint')
  ctx.names.add(name)
  return name
}

// bookkeeping statements for the CHECK texts of one table (the engine runs them after the statement succeeded)
function checkPost(ctx, { replace }) {
  const post = []
  if (replace) post.push(`DELETE FROM ora_check_text WHERE tbl = ${lit(ctx.table)}`)
  for (const c of ctx.checks) post.push(`INSERT INTO ora_check_text VALUES (${lit(ctx.table)}, ${lit(c.name)}, ${lit(c.text)})`)
  return post
}

// ---- statements ----------------------------------------------------------------------------------------------------
function createTable(ts, sig) {
  // CREATE TABLE name ( items ) [physical clauses]     (CREATE TABLE ... AS SELECT is left to PostgreSQL)
  if (!isName(sig[2])) return null
  const open = ts.findIndex((t, i) => isSym(t, '(') && i > ts.indexOf(sig[2]))
  if (open < 0 || !isSym(sig[3], '(')) return null
  const close = matchParen(ts, open)
  if (close < 0) throw bad('ORA-00907', 'missing right parenthesis')
  const ctx = newCtx(pgName(sig[2]))
  const items = splitTop(ts.slice(open + 1, close)).map((it) => readItem(it, ctx))
  const out = [raw(`CREATE TABLE ${ctx.table} (`)]
  items.forEach((it, k) => out.push(...(k ? [raw(', ')] : []), ...it.out))
  out.push(raw(')'))
  // storage clauses (TABLESPACE x, PCTFREE n, ...) mean nothing here
  return { ts: out, post: checkPost(ctx, { replace: true }) }
}

function dropTable(ts, sig) {
  if (!isName(sig[2])) return null
  const table = pgName(sig[2])
  let cascade = false
  for (let i = 3; i < sig.length; i++) {
    if (isWord(sig[i], 'CASCADE') && isWord(sig[i + 1], 'CONSTRAINTS')) { cascade = true; i++ } else if (!isWord(sig[i], 'PURGE')) return null
  }
  return { ts: [raw(`DROP TABLE ${table}${cascade ? ' CASCADE' : ''}`)], post: [`DELETE FROM ora_check_text WHERE tbl = ${lit(table)}`] }
}

// ALTER TABLE t ADD ( items ) | ADD item | MODIFY ( col type [NOT NULL | NULL] [DEFAULT x] ) | MODIFY col ...; the other forms
// (DROP COLUMN, DROP CONSTRAINT, RENAME ...) are spelled the same in PostgreSQL and go through unchanged
function alterTable(ts, sig) {
  if (!isName(sig[2])) return null
  const table = pgName(sig[2])
  const verb = sig[3] && sig[3].type === 'word' ? sig[3].text.toUpperCase() : ''
  if (verb === 'DROP' && isWord(sig[4], 'COLUMN')) {
    // spelled the same in PostgreSQL, but PostgreSQL lets a table lose its last column
    return { ts, post: [`SELECT ora_check_columns(${lit(table)})`] }
  }
  if (verb !== 'ADD' && verb !== 'MODIFY') return null
  const rest = trimSpace(ts.slice(ts.indexOf(sig[3]) + 1))
  const wrapped = isSym(rest[0], '(') && matchParen(rest, 0) === rest.length - 1
  const ctx = newCtx(table)
  const actions = []
  for (const item of splitTop(wrapped ? rest.slice(1, -1) : rest)) {
    if (verb === 'ADD') {
      const it = readItem(item, ctx)
      actions.push([raw(it.kind === 'column' ? 'ADD COLUMN ' : 'ADD'), ...it.out])
      continue
    }
    const s = trimSpace(item).filter(isSig)
    if (!isName(s[0])) throw bad('ORA-00904', 'invalid identifier')
    const col = pgName(s[0])
    let i = 1
    if (s[i] && !['NOT', 'NULL', 'DEFAULT'].some((w) => isWord(s[i], w))) {
      const type = readType(s, i)
      actions.push([raw(`ALTER COLUMN ${col} TYPE ${type.text}`)])
      i = type.next
    }
    while (i < s.length) {
      if (isWord(s[i], 'NOT') && isWord(s[i + 1], 'NULL')) { actions.push([raw(`ALTER COLUMN ${col} SET NOT NULL`)]); i += 2 }
      else if (isWord(s[i], 'NULL')) { actions.push([raw(`ALTER COLUMN ${col} DROP NOT NULL`)]); i++ }
      else if (isWord(s[i], 'DEFAULT')) { actions.push([raw(`ALTER COLUMN ${col} SET DEFAULT `), ...s.slice(i + 1)]); i = s.length }
      else throw bad('ORA-00905', 'missing keyword')
    }
  }
  const out = [raw(`ALTER TABLE ${table} `)]
  actions.forEach((a, k) => out.push(...(k ? [raw(', ')] : []), ...a))
  return { ts: out, post: checkPost(ctx, { replace: false }) }
}

function renameTable(sig) {
  if (isName(sig[1]) && isWord(sig[2], 'TO') && isName(sig[3]) && sig.length === 4) return { ts: [raw(`ALTER TABLE ${pgName(sig[1])} RENAME TO ${pgName(sig[3])}`)], post: [] }
  return null
}

// DELETE t WHERE ... : Oracle allows the table without FROM
function deleteWithoutFrom(ts, sig) {
  if (isWord(sig[1], 'FROM')) return null
  const at = ts.indexOf(sig[0])
  return { ts: [...ts.slice(0, at + 1), ...tokenize(' FROM'), ...ts.slice(at + 1)], post: [] }
}

// The table a DML statement writes to (INSERT INTO t / UPDATE t), as PostgreSQL spells it; else null. The engine looks up this
// table's columns and hands them back to the rewriter (rewriteOracle's `columns` option).
export function dmlTarget(sql) {
  const sig = tokenize(sql).filter(isSig)
  if (isWord(sig[0], 'INSERT') && isWord(sig[1], 'INTO') && isName(sig[2])) return pgName(sig[2])
  if (isWord(sig[0], 'UPDATE') && isName(sig[1])) return pgName(sig[1])
  return null
}

// A string literal that is assigned to a DATE column is converted the way Oracle converts it: through the session's date format
// (DD-MON-RR, the RR pivot, ORA-01861 for '2026-02-15'). PostgreSQL would parse the text by its own rules. `columns` is
// [{ name, date }] in table order.
function dateLiteral(tokens) {
  const items = tokens.filter(isSig)
  return items.length === 1 && items[0].type === 'string' && items[0].text !== "''" ? items[0] : null
}

// INSERT INTO t [(c1, c2)] VALUES (v1, v2): the date literals; without a column list also the count of values (ORA-00947 when short)
function insertValues(sig, columns, wrap) {
  if (!(isWord(sig[1], 'INTO') && isName(sig[2]))) return
  let at = 3
  let names = columns.map((c) => c.name)
  if (isSym(sig[at], '(')) {
    const close = matchParen(sig, at)
    if (close < 0) return
    names = sig.slice(at + 1, close).filter(isName).map(pgName)
    at = close + 1
  } else if (!(isWord(sig[at], 'VALUES') && isSym(sig[at + 1], '('))) return
  if (!(isWord(sig[at], 'VALUES') && isSym(sig[at + 1], '('))) return
  const close = matchParen(sig, at + 1)
  if (close < 0 || close !== sig.length - 1) return
  const values = splitTop(sig.slice(at + 2, close))
  if (at === 3 && values.length < names.length) throw bad('ORA-00947', 'not enough values')
  values.forEach((v, k) => {
    const col = columns.find((c) => c.name === names[k])
    const lit1 = col && col.date ? dateLiteral(v) : null
    if (lit1) wrap(lit1)
  })
}

// UPDATE t SET c1 = 'literal', c2 = ... [WHERE ...]
function updateSet(sig, columns, wrap) {
  const set = sig.findIndex((t, i) => i > 1 && isWord(t, 'SET'))
  if (set < 0) return
  let end = sig.length
  let depth = 0
  for (let i = set + 1; i < sig.length; i++) {
    if (isSym(sig[i], '(')) depth++
    else if (isSym(sig[i], ')')) depth--
    else if (depth === 0 && isWord(sig[i], 'WHERE')) { end = i; break }
  }
  for (const item of splitTop(sig.slice(set + 1, end))) {
    const eq = item.findIndex((t) => isSym(t, '='))
    if (eq < 1 || !isName(item[eq - 1])) continue
    const col = columns.find((c) => c.name === pgName(item[eq - 1]))
    const lit1 = col && col.date ? dateLiteral(item.slice(eq + 1)) : null
    if (lit1) wrap(lit1)
  }
}

function assignments(ts, sig, columns) {
  const replace = new Map()
  const wrap = (t) => replace.set(t, [raw('to_date('), t, raw(')')])
  if (isWord(sig[0], 'INSERT')) insertValues(sig, columns, wrap)
  else updateSet(sig, columns, wrap)
  return replace.size ? ts.flatMap((t) => replace.get(t) ?? [t]) : ts
}

export function ddlPass(ts, { columns } = {}) {
  const sig = ts.filter(isSig)
  const first = sig[0] && sig[0].type === 'word' ? sig[0].text.toUpperCase() : ''
  const second = sig[1] && sig[1].type === 'word' ? sig[1].text.toUpperCase() : ''
  let r = null
  if (first === 'CREATE' && second === 'TABLE') r = createTable(ts, sig)
  else if (first === 'DROP' && second === 'TABLE') r = dropTable(ts, sig)
  else if (first === 'ALTER' && second === 'TABLE') r = alterTable(ts, sig)
  else if (first === 'RENAME') r = renameTable(sig)
  else if (first === 'DELETE') r = deleteWithoutFrom(ts, sig)
  else if ((first === 'INSERT' || first === 'UPDATE') && columns && columns.length) return { ts: assignments(ts, sig, columns), post: [] }
  return r || { ts, post: [] }
}
