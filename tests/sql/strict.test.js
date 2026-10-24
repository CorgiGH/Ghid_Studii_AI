// Oracle 11g strictness, error codes, column headers, ROWNUM and Romanian explanations (review fixes 18, 19, 20, 22).
// Every expected value below was measured on the Oracle 11g container (see the probe and q5.18 entries of the corpus).
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PGlite } from '@electric-sql/pglite'
import { beforeAll, describe, expect, it } from 'vitest'
import { createEngine } from '../../src/sql/engine/core.js'
import { mapPgError, OracleError } from '../../src/sql/engine/errors.js'
import { explainOra } from '../../src/sql/explain.js'
import { lintOracle } from '../../src/sql/rewrite/lint.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const facultate = fs.readFileSync(path.join(here, '..', '..', 'public', 'sql', 'datasets', 'facultate.sql'), 'utf8')

let engine
beforeAll(async () => {
  engine = await createEngine(new PGlite(), { clock: '2026-10-26 14:30:00', datasets: { facultate } })
})

const exec = (sql) => engine.run(sql, { dataset: 'facultate' })
const codeOf = async (sql) => (await exec(sql)).error?.code
const rows = async (sql) => {
  const r = await exec(sql)
  expect(r.error, sql).toBeUndefined()
  return r
}

describe('Oracle rejects what PostgreSQL accepts (fix 18)', () => {
  it.each([
    ['LIMIT', 'SELECT nume FROM studenti LIMIT 5', 'ORA-00933'],
    ['LIMIT OFFSET', 'SELECT nume FROM studenti LIMIT 2 OFFSET 1', 'ORA-00933'],
    ['FETCH FIRST', 'SELECT nume FROM studenti FETCH FIRST 1 ROWS ONLY', 'ORA-00933'],
    ['FETCH NEXT after ORDER BY', 'SELECT nume FROM studenti ORDER BY nume FETCH NEXT 2 ROWS ONLY', 'ORA-00933'],
    ['OFFSET n ROWS', 'SELECT * FROM studenti OFFSET 2 ROWS', 'ORA-00933'],
    ['AS before a table alias', 'SELECT s.nume FROM studenti AS s', 'ORA-00933'],
    ['AS before an inline view alias', 'SELECT * FROM (SELECT nume FROM studenti) AS x', 'ORA-00933'],
    ['AS after a comma table', 'SELECT 1 FROM studenti s, note AS n', 'ORA-00933'],
    ['AS after a JOIN that wants ON', 'SELECT s.nume FROM studenti s JOIN note AS n ON s.nr_matricol = n.nr_matricol', 'ORA-00905'],
    ['AS after LEFT JOIN', 'SELECT 1 FROM studenti s LEFT JOIN note AS n ON 1 = 1', 'ORA-00905'],
    ['AS after NATURAL JOIN', 'SELECT 1 FROM studenti s NATURAL JOIN note AS n', 'ORA-00933'],
    ['AS after CROSS JOIN', 'SELECT 1 FROM studenti s CROSS JOIN note AS n', 'ORA-00933'],
    ['EXCEPT', 'SELECT nume FROM studenti EXCEPT SELECT nume FROM studenti', 'ORA-00933'],
    ['CONCAT with three arguments', "SELECT CONCAT(nume, ' ', prenume) x FROM studenti", 'ORA-00909'],
    ['CONCAT with one argument', 'SELECT CONCAT(nume) FROM studenti', 'ORA-00909'],
    ['CONCAT with none', 'SELECT CONCAT() FROM studenti', 'ORA-00909'],
    ['ILIKE', "SELECT nume FROM studenti WHERE nume ILIKE 'p%'", 'ORA-00920'],
    ['::cast in WHERE', 'SELECT nume FROM studenti WHERE an::int = 1', 'ORA-00920'],
    ['::cast in the select list', 'SELECT an::text FROM studenti', 'ORA-00923'],
    ['TOP', 'SELECT TOP 2 nume FROM studenti', 'ORA-00923'],
    ['a literal, then a name and a parenthesis', "SELECT 'Azi este ' TO_CHAR(SYSDATE, 'month') FROM dual", 'ORA-00923'],
    ['INTERSECT ALL', 'SELECT nume FROM studenti INTERSECT ALL SELECT nume FROM studenti', 'ORA-00928'],
    ['MINUS ALL', 'SELECT nume FROM studenti MINUS ALL SELECT nume FROM studenti', 'ORA-00928'],
    ['qualified USING column in the select list', 'SELECT s.nr_matricol FROM studenti s JOIN note n USING (nr_matricol)', 'ORA-25154'],
    ['qualified USING column, other table', 'SELECT n.nr_matricol FROM studenti s JOIN note n USING (nr_matricol)', 'ORA-25154'],
    ['qualified USING column used by a correlated subquery', 'SELECT nume FROM studenti s JOIN note n USING (nr_matricol) WHERE EXISTS (SELECT 1 FROM cursuri c WHERE s.nr_matricol = 1)', 'ORA-25154'],
    ['qualified USING column in WHERE', 'SELECT s.nume FROM studenti s JOIN note n USING (nr_matricol) WHERE n.nr_matricol = 111', 'ORA-25154'],
    ['PostgreSQL catalog table', 'SELECT datname FROM pg_database', 'ORA-00942'],
    ['PostgreSQL system function', 'SELECT pg_sleep(0) FROM dual', 'ORA-00904'],
    ['SELECT with nothing selected', 'SELECT FROM studenti', 'ORA-00936'],
    ['trailing comma in the select list', 'SELECT nume, FROM studenti', 'ORA-00936'],
    ['WHERE with no condition', 'SELECT nume FROM studenti WHERE', 'ORA-00936'],
    ['comparison with no right side', 'SELECT nume FROM studenti WHERE an =', 'ORA-00936'],
    ['empty IN list', 'SELECT nume FROM studenti WHERE an IN ()', 'ORA-00936'],
    ['unclosed parenthesis', 'SELECT (nume FROM studenti', 'ORA-00907'],
    ['stray closing parenthesis in the select list', 'SELECT nume) FROM studenti', 'ORA-00923'],
    ['stray closing parenthesis after FROM', 'SELECT nume FROM studenti WHERE an = 1)', 'ORA-00933'],
  ])('%s -> %s', async (_name, sql, code) => {
    const r = await exec(sql)
    expect(r.error?.code, sql).toBe(code)
    expect(r.rows).toEqual([])
  })

  it('two statements in one run are ORA-00911, not ORA-00933 (what Oracle 11g answers)', async () => {
    expect(await codeOf('SELECT 1 FROM dual; SELECT 2 FROM dual')).toBe('ORA-00911')
  })

  it('valid Oracle that looks like the rejected forms still runs', async () => {
    for (const sql of [
      "SELECT CONCAT(CONCAT(nume, ' este'), an) FROM studenti",
      "SELECT nume || ' LIMIT 5 FETCH FIRST ::int ILIKE' x FROM studenti",
      '/* LIMIT 3 */ SELECT nume FROM studenti -- FETCH FIRST 1 ROWS ONLY',
      'SELECT EXTRACT(YEAR FROM data_nastere) y FROM studenti',
      'SELECT CAST(an AS NUMBER) FROM studenti s',
      'SELECT s.nume FROM studenti s, note n WHERE s.nr_matricol = n.nr_matricol(+)',
      "SELECT TRIM(BOTH ' ' FROM nume) FROM studenti",
      "SELECT nume FROM studenti WHERE an IN (1, 2) AND nume LIKE 'P%'",
      'SELECT nume FROM studenti UNION ALL SELECT nume FROM studenti',
      "SELECT DATE '2026-01-01', N'abc', INTERVAL '1' DAY FROM dual",
      'SELECT limit_ FROM (SELECT 1 limit_ FROM dual)',
      'SELECT s.nume FROM studenti s JOIN note n ON s.nr_matricol = n.nr_matricol',
      'SELECT nr_matricol FROM studenti s JOIN note n USING (nr_matricol)',
      'SELECT s.nume FROM studenti s JOIN note n USING (nr_matricol)',
      // another block may use the USING column's name with its own alias (Oracle: 27 rows)
      'SELECT nume FROM studenti JOIN note USING (nr_matricol) WHERE nr_matricol IN (SELECT n2.nr_matricol FROM note n2 WHERE n2.valoare = 10)',
      'SELECT (SELECT COUNT(*) FROM studenti s JOIN note n USING (nr_matricol)) FROM studenti s WHERE s.nr_matricol = 111',
      "SELECT nume FROM studenti s UNION SELECT s.nume FROM profesori s JOIN didactic USING (id_prof) WHERE s.nume = 'x'",
      'SELECT s.nume FROM studenti s JOIN note n USING (nr_matricol) UNION SELECT s.nume FROM studenti s',
    ]) {
      expect(await codeOf(sql), sql).toBeUndefined()
    }
  })

  it('lintOracle returns the first problem by position, or null', () => {
    expect(lintOracle('SELECT nume FROM studenti')).toBeNull()
    expect(lintOracle('SELECT nume FROM studenti LIMIT 5')).toEqual({ code: 'ORA-00933', message: 'SQL command not properly ended' })
    expect(lintOracle("SELECT CONCAT(a, b, c) FROM t WHERE x ILIKE 'a'").code).toBe('ORA-00909')
  })
})

describe('Oracle accepts what PostgreSQL does not (fix 19)', () => {
  it('ROWNUM <= n keeps n rows', async () => {
    expect((await rows('SELECT nume FROM studenti WHERE ROWNUM <= 2')).rowCount).toBe(2)
    expect((await rows('SELECT nume FROM studenti WHERE ROWNUM < 3')).rowCount).toBe(2)
    expect((await rows('SELECT * FROM studenti WHERE an = 1 AND ROWNUM = 1')).rowCount).toBe(1)
    expect((await rows('SELECT nume FROM studenti WHERE ROWNUM > 0')).rowCount).toBe(13)
  })
  it('ROWNUM = 2 and ROWNUM > 1 never match (the first row is always number 1)', async () => {
    expect((await rows('SELECT nume FROM studenti WHERE ROWNUM = 2')).rowCount).toBe(0)
    expect((await rows('SELECT nume FROM studenti WHERE ROWNUM > 1')).rowCount).toBe(0)
  })
  it('ROWNUM numbers the rows in the select list, also of an inline view', async () => {
    const r = await rows('SELECT ROWNUM, nume FROM studenti')
    expect(r.columns).toEqual(['ROWNUM', 'NUME'])
    expect(r.rows.map((x) => x[0])).toEqual(Array.from({ length: 13 }, (_, i) => String(i + 1)))
    const top = await rows('SELECT ROWNUM rn, nume FROM (SELECT nume FROM studenti ORDER BY nume) WHERE ROWNUM <= 3')
    expect(top.rows.map((x) => x[0])).toEqual(['1', '2', '3'])
    const names = top.rows.map((x) => x[1]) // the first three of the inline view, which is sorted
    expect(names).toEqual([...names].sort())
  })
  it('the cut happens before ORDER BY, as in Oracle (the classic top-N trap)', async () => {
    const first3 = (await rows('SELECT nume FROM studenti WHERE ROWNUM <= 3')).rows.map((x) => x[0]).sort()
    const sorted = (await rows('SELECT nume FROM studenti WHERE ROWNUM <= 3 ORDER BY nume DESC')).rows.map((x) => x[0])
    expect(sorted).toEqual([...first3].reverse())
  })
  it('the cut happens before an aggregate', async () => {
    expect((await rows('SELECT COUNT(*) FROM studenti WHERE ROWNUM <= 3')).rows).toEqual([['3']])
  })
  it('a table alias keeps working after the cut', async () => {
    const r = await rows('SELECT s.nume FROM studenti s WHERE s.an = 1 AND ROWNUM <= 2')
    expect(r.rowCount).toBe(2)
  })
  it('ROWNUM on a join cuts the joined rows before aggregate and ORDER BY (Oracle: 3, and Popescu 10/9/8)', async () => {
    expect((await rows('SELECT COUNT(*) FROM studenti s, note n WHERE s.nr_matricol = n.nr_matricol AND ROWNUM <= 3')).rows).toEqual([['3']])
    const r = await rows('SELECT s.nume, n.valoare FROM studenti s JOIN note n ON s.nr_matricol = n.nr_matricol WHERE ROWNUM <= 3 ORDER BY n.valoare DESC')
    expect(r.rows.map((x) => x[0].trim())).toEqual(['Popescu', 'Popescu', 'Popescu'])
    expect(r.rows.map((x) => x[1])).toEqual(['10', '9', '8'])
    expect((await rows('SELECT s.nume FROM studenti s JOIN note n ON s.nr_matricol = n.nr_matricol WHERE ROWNUM = 1')).rowCount).toBe(1)
    expect((await rows('SELECT s.nume FROM studenti s JOIN note n ON s.nr_matricol = n.nr_matricol WHERE ROWNUM <= 0')).rowCount).toBe(0)
  })
  it('ROWNUM together with (+) still converts the outer join (Oracle: 3)', async () => {
    expect((await rows('SELECT COUNT(*) FROM studenti s, note n WHERE s.nr_matricol = n.nr_matricol(+) AND ROWNUM <= 3')).rows).toEqual([['3']])
    expect((await rows('SELECT COUNT(*) FROM studenti s, note n WHERE s.nr_matricol = n.nr_matricol(+) AND s.an = 1 AND ROWNUM < 5')).rows).toEqual([['4']])
  })
  it('ROWNUM on a join of inline views is refused with a clear message, not answered differently', async () => {
    const r = await exec('SELECT COUNT(*) FROM studenti s, (SELECT * FROM note) n WHERE s.nr_matricol = n.nr_matricol AND ROWNUM <= 3')
    expect(r.error.message).toMatch(/ROWNUM.*not supported/)
  })
  it('a quoted upper-case identifier names the same column as the unquoted one', async () => {
    const r = await rows('SELECT "NUME" FROM studenti')
    expect(r.rowCount).toBe(13)
    expect(r.columns).toEqual(['NUME'])
    expect((await rows('SELECT nume AS "TOTAL" FROM studenti ORDER BY "TOTAL"')).columns).toEqual(['TOTAL'])
  })
  it('a mixed-case quoted identifier stays a different name (ORA-00904)', async () => {
    expect(await codeOf('SELECT "Nume" FROM studenti')).toBe('ORA-00904')
  })
  it('^= is not equal', async () => {
    expect((await rows('SELECT nume FROM studenti WHERE an ^= 1')).rowCount).toBe(9)
    expect((await rows('SELECT nume FROM studenti WHERE an != 1 AND an <> 2 AND an ^= 3')).rowCount).toBe(0)
  })
})

describe('column headers are the select-list text, as Oracle prints them (fix 20)', () => {
  const headers = async (sql) => (await rows(sql)).columns
  it('an unaliased expression is upper case with every blank removed', async () => {
    expect(await headers('SELECT nume, prenume, bursa+10 FROM studenti')).toEqual(['NUME', 'PRENUME', 'BURSA+10'])
    expect(await headers('SELECT   bursa  +  10 FROM studenti')).toEqual(['BURSA+10'])
    expect(await headers("SELECT CONCAT(CONCAT(nume,' este'),an) FROM studenti")).toEqual(["CONCAT(CONCAT(NUME,'ESTE'),AN)"])
    expect(await headers("SELECT LPAD('pagina', 15, '*.') FROM dual")).toEqual(["LPAD('PAGINA',15,'*.')"])
    expect(await headers('SELECT COUNT(*) FROM studenti')).toEqual(['COUNT(*)'])
    expect(await headers('SELECT 1, -1, 1.50, NULL FROM dual')).toEqual(['1', '-1', '1.50', 'NULL'])
    expect(await headers("SELECT TO_CHAR(SYSDATE, 'DD-MM-YYYY HH:MI') FROM dual")).toEqual(["TO_CHAR(SYSDATE,'DD-MM-YYYYHH:MI')"])
    expect(await headers("SELECT DECODE(bursa, 450, 'Premiul 1', '?') FROM studenti")).toEqual(["DECODE(BURSA,450,'PREMIUL1','?')"])
    expect(await headers('SELECT SYSDATE, CURRENT_DATE, USER FROM dual')).toEqual(['SYSDATE', 'CURRENT_DATE', 'USER'])
    expect(await headers('SELECT CASE WHEN an = 1 THEN 1 END FROM studenti')).toEqual(['CASEWHENAN=1THEN1END'])
  })
  it('an ANSI DATE literal prints as a DATE', async () => {
    expect((await rows("SELECT DATE '2020-01-01' FROM dual")).rows).toEqual([['01-JAN-20']])
  })
  it('a bare column is headed by its name, whatever the qualifier, quotes or parentheses', async () => {
    expect(await headers('SELECT s.nume, s."NUME", (an), ((an)), +an FROM studenti s')).toEqual(['NUME', 'NUME', 'AN', 'AN', 'AN'])
    expect(await headers('SELECT (bursa+10), - an FROM studenti')).toEqual(['(BURSA+10)', '-AN'])
  })
  it('an alias is used as written', async () => {
    expect(await headers("SELECT nume n, an AS a, bursa+10 \"Total\", 'x y' z FROM studenti")).toEqual(['N', 'A', 'Total', 'Z'])
    expect(await headers('SELECT bursa b, COUNT(*) OVER () FROM studenti')).toEqual(['B', 'COUNT(*)OVER()'])
  })
  it('a SELECT * and a comment keep the engine names', async () => {
    expect((await headers('SELECT * FROM cursuri')).length).toBe(5)
    expect(await headers('SELECT nume /* x */, an -- y\nFROM studenti')).toEqual(['NUME', 'AN'])
  })
  it('the first SELECT of a set operation, a WITH query and DISTINCT name the columns', async () => {
    expect(await headers('SELECT DISTINCT an+1 FROM studenti UNION SELECT 7 FROM dual')).toEqual(['AN+1'])
    expect(await headers('WITH t AS (SELECT an a FROM studenti) SELECT a*2 FROM t')).toEqual(['A*2'])
  })
})

describe('the engine surfaces its own bugs instead of calling them Oracle errors (ruling R12)', () => {
  it('an Oracle rejection is a result with the ORA code', async () => {
    expect((await exec('SELECT nume FROM studenti LIMIT 1')).error.code).toBe('ORA-00933')
  })
  it('an internal exception in the rewriter is rethrown, not turned into ORA-?', async () => {
    await expect(engine.run(undefined, { dataset: 'facultate' })).rejects.toBeInstanceOf(TypeError)
  })
  it('OracleError is the type the rewriter throws for rejections', () => {
    expect(new OracleError('ORA-00933', 'x')).toBeInstanceOf(Error)
  })
})

describe('PostgreSQL errors map to the ORA code Oracle gives', () => {
  const pg = (code, message) => Object.assign(new Error(message), { code })
  it.each([
    ['42703', 'column "x" does not exist', 'ORA-00904'],
    ['42P01', 'relation "x" does not exist', 'ORA-00942'],
    ['42702', 'column reference "x" is ambiguous', 'ORA-00918'],
    ['42601', 'syntax error at or near "x"', 'ORA-00933'],
    ['22P02', 'invalid input syntax for type numeric', 'ORA-01722'],
    ['22012', 'division by zero', 'ORA-01476'],
    ['23505', 'duplicate key value violates unique constraint "pk_stud"', 'ORA-00001'],
    ['23502', 'null value in column "nume" of relation "studenti" violates not-null constraint', 'ORA-01400'],
    ['23503', 'insert or update on table "note" violates foreign key constraint "fk_n"', 'ORA-02291'],
    ['23503', 'update or delete on table "studenti" violates foreign key constraint "fk_n" on table "note"', 'ORA-02292'],
    ['23514', 'new row for relation "t" violates check constraint "ck_t"', 'ORA-02290'],
    ['22001', 'value too long for type character varying(10)', 'ORA-12899'],
    ['22003', 'numeric field overflow', 'ORA-01438'],
    ['42P07', 'relation "t" already exists', 'ORA-00955'],
  ])('%s -> %s', (state, message, ora) => {
    expect(mapPgError(pg(state, message)).code).toBe(ora)
  })
  it('42803 is ORA-00937 without GROUP BY and ORA-00979 with it', () => {
    const e = pg('42803', 'column "x" must appear in the GROUP BY clause or be used in an aggregate function')
    expect(mapPgError(e, { sql: 'SELECT nume, COUNT(*) FROM studenti' }).code).toBe('ORA-00937')
    expect(mapPgError(e, { sql: 'SELECT nume, COUNT(*) FROM studenti GROUP BY an' }).code).toBe('ORA-00979')
    expect(mapPgError(pg('42803', 'aggregate functions are not allowed in WHERE')).code).toBe('ORA-00934')
  })
  it('an unknown function is ORA-00904 and a known one with the wrong argument count is ORA-00909', () => {
    const e = pg('42883', 'function foo(integer) does not exist')
    expect(mapPgError(e, { knownFunction: false }).code).toBe('ORA-00904')
    expect(mapPgError(e, { knownFunction: true }).code).toBe('ORA-00909')
  })
  it('the engine tells them apart through the catalog', async () => {
    expect(await codeOf('SELECT nume, COUNT(*) FROM studenti')).toBe('ORA-00937')
    expect(await codeOf('SELECT nume, COUNT(*) FROM studenti GROUP BY an')).toBe('ORA-00979')
    expect(await codeOf('SELECT nume FROM studenti WHERE COUNT(*) > 1')).toBe('ORA-00934')
    expect(await codeOf('SELECT nonexistent_fn(nume) FROM studenti')).toBe('ORA-00904')
    expect(await codeOf('SELECT LPAD(nume) FROM studenti')).toBe('ORA-00909')
  })
  it('an ORA code raised by the compat layer passes through unchanged', () => {
    expect(mapPgError(pg('P0001', 'ORA-01843: not a valid month'))).toEqual({ code: 'ORA-01843', message: 'not a valid month' })
  })
})

describe('Romanian explanations', () => {
  const CODES = ['00904', '00905', '00907', '00909', '00918', '00920', '00923', '00928', '00933', '00936', '00937', '00942', '01722', '01843', '01858', '01861', '01898', '01821', '25154', '25155', '00001', '01400', '02291', '02292', '02290', '12899', '01438']
  it.each(CODES)('ORA-%s has a Romanian and an English text', (n) => {
    const e = explainOra(`ORA-${n}`)
    expect(e.ro.length).toBeGreaterThan(30)
    expect(e.en.length).toBeGreaterThan(30)
    expect(e.ro).not.toBe(e.en)
  })
  it('the codes the engine itself produces are covered too', async () => {
    for (const code of ['ORA-00911', 'ORA-00934', 'ORA-00955', 'ORA-00979', 'ORA-01426', 'ORA-01476', 'ORA-01481', 'ORA-01785', 'ORA-01791', 'ORA-12705']) {
      expect(explainOra(code).ro, code).not.toBe(explainOra('ORA-99999').ro)
    }
  })
  it('an unknown code gets a generic pair, and a short code is padded', () => {
    expect(explainOra('ORA-99999').ro.length).toBeGreaterThan(10)
    expect(explainOra('ORA-904')).toEqual(explainOra('ORA-00904'))
  })
  it('the Romanian text is written with diacritics', () => {
    expect(explainOra('ORA-00907').ro).toMatch(/[ăâîșț]/)
  })
})
