// DDL and DML in the sandbox (Task 6). Every run happens inside a transaction that is always rolled back, so nothing a
// learner does leaks into the next run. Inside one run COMMIT / ROLLBACK / SAVEPOINT behave like Oracle, DDL commits
// implicitly, and the constraint / size errors carry Oracle's codes. Expected codes and structures were measured on
// Oracle 11g; tests/sql/corpus/ddl.json holds the same cases for the differential test.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PGlite } from '@electric-sql/pglite'
import { beforeAll, describe, expect, it } from 'vitest'
import { createEngine } from '../../src/sql/engine/core.js'
import { explainOra } from '../../src/sql/explain.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const facultate = fs.readFileSync(path.join(here, '..', '..', 'public', 'sql', 'datasets', 'facultate.sql'), 'utf8')
const DS = { dataset: 'facultate' }

let engine
beforeAll(async () => {
  engine = await createEngine(new PGlite(), { clock: '2026-10-26 14:30:00', datasets: { facultate } })
})

const run = (sql) => engine.run(sql, DS)
const script = (sql) => engine.run(sql, { ...DS, script: true })
const cell = async (sql) => {
  const r = await run(sql)
  expect(r.error, sql).toBeUndefined()
  return r.rows[0][0]
}
// the code of the first statement of a script that failed (or undefined when none did)
const failure = async (sql) => (await script(sql)).statements.find((s) => s.error)?.error.code

// What Oracle 11g answers for DESCRIBE of the lab tables
const STUDENTI = [
  { name: 'NR_MATRICOL', nullable: false, type: 'CHAR(6)' },
  { name: 'NUME', nullable: true, type: 'VARCHAR2(10)' },
  { name: 'PRENUME', nullable: true, type: 'VARCHAR2(10)' },
  { name: 'AN', nullable: true, type: 'NUMBER(1)' },
  { name: 'GRUPA', nullable: true, type: 'CHAR(2)' },
  { name: 'BURSA', nullable: true, type: 'NUMBER(6,2)' },
  { name: 'DATA_NASTERE', nullable: true, type: 'DATE' },
]
const NOTE = [
  { name: 'NR_MATRICOL', nullable: true, type: 'CHAR(6)' },
  { name: 'ID_CURS', nullable: true, type: 'CHAR(4)' },
  { name: 'VALOARE', nullable: true, type: 'NUMBER(2)' },
  { name: 'DATA_NOTARE', nullable: true, type: 'DATE' },
]

describe('dml and ddl never leak between runs', () => {
  it('a DELETE is gone in the next run', async () => {
    const del = await run('DELETE FROM note')
    expect(del.kind).toBe('dml')
    expect(del.rowCount).toBe(42)
    expect(await cell('SELECT COUNT(*) FROM note')).toBe('42')
  })
  it('a DROP TABLE is gone in the next run', async () => {
    expect((await run('DROP TABLE studenti')).error).toBeUndefined()
    expect(await cell('SELECT COUNT(*) FROM studenti')).toBe('13')
  })
  it('a CREATE TABLE is gone in the next run', async () => {
    expect((await run('CREATE TABLE temp_t (x NUMBER)')).error).toBeUndefined()
    expect((await run('SELECT * FROM temp_t')).error.code).toBe('ORA-00942')
  })
  it('session settings survive the reset, data does not', async () => {
    await run("ALTER SESSION SET NLS_DATE_LANGUAGE = 'ROMANIAN'")
    expect(await cell("SELECT TO_CHAR(DATE '2026-03-05', 'DAY') FROM dual")).toMatch(/JOI/i)
    await run('DELETE FROM note')
    expect(await cell('SELECT COUNT(*) FROM note')).toBe('42')
    expect(await cell("SELECT TO_CHAR(DATE '2026-03-05', 'DAY') FROM dual")).toMatch(/JOI/i)
    await run("ALTER SESSION SET NLS_DATE_LANGUAGE = 'AMERICAN'")
  })
})

describe('transactions inside one run', () => {
  it('ROLLBACK undoes an INSERT', async () => {
    const r = await script("INSERT INTO note VALUES ('111', '21', 9, NULL); SELECT COUNT(*) FROM note; ROLLBACK; SELECT COUNT(*) FROM note")
    expect(r.statements.map((s) => s.kind)).toEqual(['dml', 'rows', 'tx', 'rows'])
    expect(r.rows).toEqual([['42']])
  })
  it('COMMIT makes the change survive a later ROLLBACK', async () => {
    const r = await script("DELETE FROM note; COMMIT; INSERT INTO note VALUES ('111', '21', 9, NULL); ROLLBACK; SELECT COUNT(*) FROM note")
    expect(r.rows).toEqual([['0']])
  })
  it('CREATE TABLE commits implicitly, so ROLLBACK keeps the table', async () => {
    const r = await script('CREATE TABLE t (x NUMBER); INSERT INTO t VALUES (1); ROLLBACK; SELECT COUNT(*) FROM t')
    expect(r.error).toBeUndefined()
    expect(r.rows).toEqual([['0']])
  })
  it('a DDL statement also commits the DML before it', async () => {
    const r = await script('CREATE TABLE t (x NUMBER); INSERT INTO t VALUES (1); CREATE TABLE u (y NUMBER); ROLLBACK; SELECT COUNT(*) FROM t')
    expect(r.rows).toEqual([['1']])
  })
  it('a DDL statement that fails when it runs still commits, a syntax error does not (measured)', async () => {
    const a = await script('CREATE TABLE t (x NUMBER); INSERT INTO t VALUES (1); CREATE TABLE t (y NUMBER); ROLLBACK; SELECT COUNT(*) FROM t')
    expect(a.statements[2].error.code).toBe('ORA-00955')
    expect(a.rows).toEqual([['1']])
    const b = await script('CREATE TABLE t (x NUMBER); INSERT INTO t VALUES (1); CREATE TABLE u (y NUMBER; ROLLBACK; SELECT COUNT(*) FROM t')
    expect(b.statements[2].error.code).toBe('ORA-00907')
    expect(b.rows).toEqual([['0']])
  })
  it('a failed statement undoes only itself', async () => {
    const r = await script("INSERT INTO note VALUES ('111', '21', 9, NULL); INSERT INTO note VALUES ('111', '21', 100, NULL); INSERT INTO note VALUES ('111', '22', 8, NULL); SELECT COUNT(*) FROM note")
    expect(r.statements.map((s) => s.error?.code)).toEqual([undefined, 'ORA-01438', undefined, undefined])
    expect(r.rows).toEqual([['44']])
  })
  it('SAVEPOINT and ROLLBACK TO', async () => {
    const steps = "INSERT INTO note VALUES ('111', '21', 1, NULL); SAVEPOINT a; INSERT INTO note VALUES ('111', '22', 2, NULL); SAVEPOINT b; INSERT INTO note VALUES ('111', '23', 3, NULL); "
    expect((await script(steps + 'ROLLBACK TO a; SELECT COUNT(*) FROM note')).rows).toEqual([['43']])
    expect((await script(steps + 'ROLLBACK TO SAVEPOINT b; SELECT COUNT(*) FROM note')).rows).toEqual([['44']])
    expect(await failure(steps + 'ROLLBACK TO a; ROLLBACK TO b')).toBe('ORA-01086') // b was erased when we went back to a
    expect(await failure('SAVEPOINT a; COMMIT; ROLLBACK TO a')).toBe('ORA-01086')
    expect(await failure('SAVEPOINT a; INSERT INTO note VALUES (NULL, NULL, 1, NULL); ROLLBACK TO SAVEPOINT a')).toBeUndefined()
  })
  it('works for a single statement outside a script too', async () => {
    expect((await run('COMMIT')).kind).toBe('tx')
    expect((await run('ROLLBACK')).error).toBeUndefined()
    expect((await run('ROLLBACK TO nosuch')).error.code).toBe('ORA-01086')
  })
})

describe('Oracle types and constraint errors', () => {
  it('an insert into studenti without the key column matches Oracle (the lab script only has NOT NULL)', async () => {
    const r = await run("INSERT INTO studenti(nr_matricol) VALUES ('111')")
    expect(r.error).toBeUndefined()
    expect(r.rowCount).toBe(1)
  })
  it('PRIMARY KEY duplicate is ORA-00001', async () => {
    expect(await failure("CREATE TABLE s2 (id CHAR(3) PRIMARY KEY, n VARCHAR2(5)); INSERT INTO s2 VALUES ('111', 'a'); INSERT INTO s2 VALUES ('111', 'b')")).toBe('ORA-00001')
    const r = await script("CREATE TABLE s2 (id CHAR(3) CONSTRAINT pk_s2 PRIMARY KEY); INSERT INTO s2 VALUES ('1'); INSERT INTO s2 VALUES ('1')")
    expect(r.statements[2].error.message).toMatch(/PK_S2/)
  })
  it('UNIQUE duplicate is ORA-00001, NULLs do not collide', async () => {
    const sql = "CREATE TABLE u2 (e VARCHAR2(5) UNIQUE); INSERT INTO u2 VALUES (NULL); INSERT INTO u2 VALUES (NULL); INSERT INTO u2 VALUES ('a'); INSERT INTO u2 VALUES ('a')"
    expect((await script(sql)).statements.map((s) => s.error?.code)).toEqual([undefined, undefined, undefined, undefined, 'ORA-00001'])
  })
  it('NUMBER(6,2) overflow is ORA-01438 and the scale rounds', async () => {
    const r = await script('CREATE TABLE n2 (a NUMBER(6,2)); INSERT INTO n2 VALUES (12345.678); INSERT INTO n2 VALUES (1.005); INSERT INTO n2 VALUES (-1.005); SELECT a FROM n2')
    expect(r.statements[1].error.code).toBe('ORA-01438')
    expect(r.rows.map((x) => x[0]).sort()).toEqual(['-1.01', '1.01'])
    expect(await failure('CREATE TABLE n3 (a NUMBER(1)); INSERT INTO n3 VALUES (10)')).toBe('ORA-01438')
  })
  it('VARCHAR2(10) with 11 characters is ORA-12899', async () => {
    expect(await failure("CREATE TABLE v2 (a VARCHAR2(10)); INSERT INTO v2 VALUES ('abcdefghijk')")).toBe('ORA-12899')
    expect(await failure("CREATE TABLE v2 (a VARCHAR2(10)); INSERT INTO v2 VALUES ('abcdefghij')")).toBeUndefined()
    expect(await failure("CREATE TABLE c2 (a CHAR(2)); INSERT INTO c2 VALUES ('abc')")).toBe('ORA-12899')
  })
  it('NOT NULL violation is ORA-01400, an empty string counts as NULL', async () => {
    expect(await failure('CREATE TABLE nn (a NUMBER NOT NULL); INSERT INTO nn VALUES (NULL)')).toBe('ORA-01400')
    expect(await failure("CREATE TABLE nn (a VARCHAR2(3) NOT NULL); INSERT INTO nn VALUES ('')")).toBe('ORA-01400')
    expect(await failure("INSERT INTO studenti(nr_matricol) VALUES ('')")).toBe('ORA-01400')
  })
  it("'' inserted is NULL", async () => {
    const ddl = "CREATE TABLE e2 (a VARCHAR2(3)); INSERT INTO e2 VALUES ('');"
    expect((await script(ddl + ' SELECT COUNT(*), COUNT(a) FROM e2')).rows).toEqual([['1', '0']])
    expect((await script(ddl + ' SELECT a FROM e2 WHERE a IS NULL')).rows).toEqual([[null]])
  })
  it('FOREIGN KEY: child without parent is ORA-02291, parent with children is ORA-02292', async () => {
    const ddl = 'CREATE TABLE p2 (id NUMBER(3) PRIMARY KEY); CREATE TABLE c2 (pid NUMBER(3) REFERENCES p2(id)); INSERT INTO p2 VALUES (1);'
    expect(await failure(ddl + ' INSERT INTO c2 VALUES (7)')).toBe('ORA-02291')
    expect(await failure(ddl + ' INSERT INTO c2 VALUES (1); DELETE FROM p2')).toBe('ORA-02292')
    expect(await failure(ddl + ' INSERT INTO c2 VALUES (NULL)')).toBeUndefined()
  })
  it('ON DELETE CASCADE and SET NULL', async () => {
    const ddl = 'CREATE TABLE p2 (id NUMBER(3) PRIMARY KEY); CREATE TABLE c2 (a NUMBER CONSTRAINT fk_a REFERENCES p2(id) ON DELETE CASCADE, b NUMBER, CONSTRAINT fk_b FOREIGN KEY (b) REFERENCES p2 (id) ON DELETE SET NULL); INSERT INTO p2 VALUES (1); INSERT INTO c2 VALUES (1, 1); DELETE FROM p2;'
    const r = await script(ddl + ' SELECT COUNT(*) FROM c2')
    expect(r.error).toBeUndefined()
    expect(r.rows).toEqual([['0']])
  })
  it('CHECK violation is ORA-02290', async () => {
    const r = await script('CREATE TABLE k2 (a NUMBER CONSTRAINT ck_a CHECK (a BETWEEN 1 AND 3)); INSERT INTO k2 VALUES (9)')
    expect(r.statements[1].error.code).toBe('ORA-02290')
    expect(r.statements[1].error.message).toMatch(/CK_A/)
  })
  it('DDL errors', async () => {
    expect(await failure('CREATE TABLE studenti (x NUMBER)')).toBe('ORA-00955')
    expect(await failure('DROP TABLE nope')).toBe('ORA-00942')
    expect(await failure('CREATE TABLE z (x TEXT)')).toBe('ORA-00902')
    expect(await failure('CREATE TABLE z (x VARCHAR2)')).toBe('ORA-00906')
    expect(await failure('CREATE TABLE z (x NUMBER(0))')).toBe('ORA-01727')
    expect(await failure('CREATE TABLE z (x VARCHAR2(4001))')).toBe('ORA-00910')
    expect(await failure('CREATE TABLE z (x NUMBER, x NUMBER)')).toBe('ORA-00957')
    expect(await failure('CREATE TABLE z (a NUMBER REFERENCES studenti(an))')).toBe('ORA-02270')
    expect(await failure('CREATE TABLE p2 (id NUMBER PRIMARY KEY); CREATE TABLE c2 (a NUMBER REFERENCES p2); DROP TABLE p2')).toBe('ORA-02449')
    expect(await failure('CREATE TABLE p2 (id NUMBER PRIMARY KEY); CREATE TABLE c2 (a NUMBER REFERENCES p2); DROP TABLE p2 CASCADE CONSTRAINTS')).toBeUndefined()
  })
  it('INSERT arity and column errors', async () => {
    expect(await failure("INSERT INTO studenti VALUES ('1', 'a')")).toBe('ORA-00947')
    expect(await failure("INSERT INTO studenti(nr_matricol) VALUES ('1', 'a')")).toBe('ORA-00913')
    expect(await failure("INSERT INTO studenti(nope) VALUES ('1')")).toBe('ORA-00904')
    expect(await failure("INSERT INTO studenti(nr_matricol, an) VALUES ('1', 'abc')")).toBe('ORA-01722')
    expect(await failure('INSERT INTO nope VALUES (1)')).toBe('ORA-00942')
  })
  it('DEFAULT, DELETE without FROM, UPDATE, TRUNCATE', async () => {
    const r = await script("CREATE TABLE d2 (a NUMBER DEFAULT 7, b VARCHAR2(3) DEFAULT 'xy', c DATE DEFAULT SYSDATE); INSERT INTO d2 (a) VALUES (1); INSERT INTO d2 (b) VALUES ('q'); SELECT a, b, c FROM d2 ORDER BY a; UPDATE d2 SET a = a + 1 WHERE a = 7; DELETE d2 WHERE a = 1; SELECT COUNT(*) FROM d2; TRUNCATE TABLE d2; SELECT COUNT(*) FROM d2")
    expect(r.statements.filter((s) => s.error)).toEqual([])
    expect(r.statements[3].rowCount).toBe(2)
    expect(r.statements[4].rowCount).toBe(1)
    expect(r.statements[5].rowCount).toBe(1)
    expect(r.rows).toEqual([['0']])
    const q = await script("CREATE TABLE d2 (a NUMBER DEFAULT 7, b VARCHAR2(3) DEFAULT 'xy', c DATE DEFAULT SYSDATE); INSERT INTO d2 (a) VALUES (1); INSERT INTO d2 (b) VALUES ('q'); SELECT a, b, c FROM d2 ORDER BY a")
    expect(q.rows).toEqual([['1', 'xy', '26-OCT-26'], ['7', 'q', '26-OCT-26']])
  })
})

describe('structure: describe, DESCRIBE, user_tables and user_tab_columns', () => {
  it('describe matches Oracle for the lab tables', async () => {
    expect(await engine.describe('studenti', DS)).toEqual(STUDENTI)
    expect(await engine.describe('NOTE', DS)).toEqual(NOTE)
    expect(await engine.describe('nope', DS)).toEqual([])
  })
  it('DESCRIBE is accepted as a statement', async () => {
    const r = await run('DESCRIBE studenti')
    expect(r.columns).toEqual(['Name', 'Null?', 'Type'])
    expect(r.rows).toEqual(STUDENTI.map((c) => [c.name, c.nullable ? '' : 'NOT NULL', c.type]))
    expect((await run('desc note;')).rows).toHaveLength(4)
    expect((await run('DESCRIBE nope')).error.code).toBe('ORA-04043')
  })
  it('user_tables lists the five tables', async () => {
    const r = await run('SELECT table_name FROM user_tables ORDER BY 1')
    expect(r.columns).toEqual(['TABLE_NAME'])
    expect(r.rows).toEqual([['CURSURI'], ['DIDACTIC'], ['NOTE'], ['PROFESORI'], ['STUDENTI']])
  })
  it('user_tab_columns has the Oracle values', async () => {
    const r = await run("SELECT column_name, data_type, data_length, data_precision, data_scale, nullable FROM user_tab_columns WHERE table_name = 'STUDENTI' ORDER BY column_id")
    expect(r.rows).toEqual([
      ['NR_MATRICOL', 'CHAR', '6', null, null, 'N'],
      ['NUME', 'VARCHAR2', '10', null, null, 'Y'],
      ['PRENUME', 'VARCHAR2', '10', null, null, 'Y'],
      ['AN', 'NUMBER', '22', '1', '0', 'Y'],
      ['GRUPA', 'CHAR', '2', null, null, 'Y'],
      ['BURSA', 'NUMBER', '22', '6', '2', 'Y'],
      ['DATA_NASTERE', 'DATE', '7', null, null, 'Y'],
    ])
  })
  it('user_constraints shows the NOT NULL constraints of the lab script', async () => {
    const r = await run("SELECT constraint_type, table_name, search_condition FROM user_constraints WHERE table_name IN ('STUDENTI','CURSURI','NOTE','PROFESORI','DIDACTIC') ORDER BY 2, 1")
    expect(r.rows).toEqual([['C', 'CURSURI', '"ID_CURS" IS NOT NULL'], ['C', 'STUDENTI', '"NR_MATRICOL" IS NOT NULL']])
  })
  it('user_constraints and user_cons_columns show what the learner created', async () => {
    const r = await script(`CREATE TABLE zt3 (id NUMBER(3) PRIMARY KEY, n VARCHAR2(5) NOT NULL, c NUMBER CONSTRAINT ck_c CHECK (c BETWEEN 1 AND 3), u VARCHAR2(5) UNIQUE, CONSTRAINT uq_two UNIQUE (n, c));
      CREATE TABLE zt4 (a NUMBER(3) REFERENCES zt3(id), b NUMBER CONSTRAINT fk_b REFERENCES zt3(id) ON DELETE CASCADE);
      SELECT constraint_name, r_constraint_name FROM user_constraints WHERE constraint_name = 'FK_B'`)
    expect(r.statements.filter((s) => s.error)).toEqual([])
    expect(r.rows[0][0]).toBe('FK_B')
    expect(r.rows[0][1]).toMatch(/^SYS_C\d{6}$/)
    const ddl = `CREATE TABLE zt3 (id NUMBER(3) PRIMARY KEY, n VARCHAR2(5) NOT NULL, c NUMBER CONSTRAINT ck_c CHECK (c BETWEEN 1 AND 3), u VARCHAR2(5) UNIQUE, CONSTRAINT uq_two UNIQUE (n, c));
      CREATE TABLE zt4 (a NUMBER(3) REFERENCES zt3(id), b NUMBER CONSTRAINT fk_b REFERENCES zt3(id) ON DELETE CASCADE);`
    const rows = (await script(ddl + "SELECT constraint_type, table_name, search_condition, delete_rule FROM user_constraints WHERE table_name LIKE 'ZT%' ORDER BY table_name, constraint_type, constraint_name")).rows
    expect(rows.map((x) => x.slice(0, 2).join(' '))).toEqual(['C ZT3', 'C ZT3', 'P ZT3', 'U ZT3', 'U ZT3', 'R ZT4', 'R ZT4'])
    expect(rows.filter((x) => x[0] === 'C').map((x) => x[2]).sort()).toEqual(['"N" IS NOT NULL', 'c BETWEEN 1 AND 3'])
    expect(rows.filter((x) => x[0] === 'R').map((x) => x[3]).sort()).toEqual(['CASCADE', 'NO ACTION'])
    expect((await script(ddl + "SELECT constraint_name, column_name, position FROM user_cons_columns WHERE table_name = 'ZT3' AND constraint_name = 'UQ_TWO' ORDER BY position")).rows).toEqual([['UQ_TWO', 'N', '1'], ['UQ_TWO', 'C', '2']])
  })
  it('the lab 1 script: DROP the five tables, CREATE them again, and describe matches Oracle', async () => {
    const lab = `DROP TABLE didactic; DROP TABLE profesori; DROP TABLE note; DROP TABLE cursuri; DROP TABLE studenti;
CREATE TABLE studenti(
  nr_matricol CHAR(6) NOT NULL,
  nume VARCHAR2(10),
  prenume VARCHAR2(10),
  an NUMBER(1),
  grupa CHAR(2),
  bursa NUMBER(6,2),
  data_nastere DATE
  )
/
CREATE TABLE cursuri(
  id_curs CHAR(4) NOT NULL,
  titlu_curs VARCHAR2(15),
  an NUMBER(1),
  semestru NUMBER(1),
  credite NUMBER(2)
  )
/
CREATE TABLE note(
  nr_matricol CHAR(6),
  id_curs CHAR(4),
  valoare NUMBER(2),
  data_notare DATE
  )
/
CREATE TABLE profesori(
  id_prof CHAR(4),
  nume CHAR(10),
  prenume CHAR(10),
  grad_didactic VARCHAR2(5)
  )
/
CREATE TABLE didactic(
  id_prof CHAR(4),
  id_curs CHAR(4)
  )
/
SELECT table_name FROM user_tables ORDER BY 1`
    const r = await script(lab)
    expect(r.statements.map((s) => s.error?.code)).toEqual(Array(11).fill(undefined))
    expect(r.rows).toEqual([['CURSURI'], ['DIDACTIC'], ['NOTE'], ['PROFESORI'], ['STUDENTI']])
    expect(await engine.describe('studenti', DS)).toEqual(STUDENTI)
    expect(await engine.describe('note', DS)).toEqual(NOTE)
    expect(await engine.describe('profesori', DS)).toEqual([
      { name: 'ID_PROF', nullable: true, type: 'CHAR(4)' },
      { name: 'NUME', nullable: true, type: 'CHAR(10)' },
      { name: 'PRENUME', nullable: true, type: 'CHAR(10)' },
      { name: 'GRAD_DIDACTIC', nullable: true, type: 'VARCHAR2(5)' },
    ])
    expect(await engine.describe('didactic', DS)).toHaveLength(2)
    expect(await engine.describe('cursuri', DS)).toEqual([
      { name: 'ID_CURS', nullable: false, type: 'CHAR(4)' },
      { name: 'TITLU_CURS', nullable: true, type: 'VARCHAR2(15)' },
      { name: 'AN', nullable: true, type: 'NUMBER(1)' },
      { name: 'SEMESTRU', nullable: true, type: 'NUMBER(1)' },
      { name: 'CREDITE', nullable: true, type: 'NUMBER(2)' },
    ])
  })
  it('describe of every type the sandbox accepts, as SQL*Plus prints them (measured)', async () => {
    await script('CREATE TABLE ty (a NUMBER, b NUMBER(5), c INTEGER, d FLOAT, e TIMESTAMP, f TIMESTAMP(0), g CHAR, h VARCHAR(8), i DECIMAL(7,3), j NUMBER(3,-1), k NUMBER(2,5), l DATE NOT NULL, m CHAR(3), n VARCHAR2(30) NOT NULL, o NUMBER(38), p SMALLINT, u CLOB, x DOUBLE PRECISION, r NUMBER(1,1))')
    const cols = await engine.describe('ty', DS)
    expect(cols.map((c) => c.type)).toEqual(['NUMBER', 'NUMBER(5)', 'NUMBER(38)', 'FLOAT(126)', 'TIMESTAMP(6)', 'TIMESTAMP(0)', 'CHAR(1)', 'VARCHAR2(8)', 'NUMBER(7,3)', 'NUMBER(3,-1)', 'NUMBER(2,5)', 'DATE', 'CHAR(3)', 'VARCHAR2(30)', 'NUMBER(38)', 'NUMBER(38)', 'CLOB', 'FLOAT(126)', 'NUMBER(1,1)'])
    expect(cols.filter((c) => !c.nullable).map((c) => c.name)).toEqual(['L', 'N'])
  })
})

describe('dates assigned as text', () => {
  const dates = (sql) => script(`CREATE TABLE d9 (d DATE, n NUMBER); ${sql}; SELECT TO_CHAR(d, 'YYYY-MM-DD'), n FROM d9 ORDER BY 1`)
  it('go through the session date format, like Oracle', async () => {
    const ok = await dates("INSERT INTO d9 VALUES ('15-FEB-26', 1); INSERT INTO d9 (n, d) VALUES ('2', '03-sep-96')")
    expect(ok.statements.filter((x) => x.error)).toEqual([])
    expect(ok.rows).toEqual([['1996-09-03', '2'], ['2026-02-15', '1']])
  })
  it('read a two-digit year with the RR pivot', async () => {
    const r = await dates("INSERT INTO d9 VALUES ('01-JAN-60', 1); INSERT INTO d9 VALUES ('01-JAN-26', 2); INSERT INTO d9 VALUES ('01-JAN-49', 3); INSERT INTO d9 VALUES ('01-JAN-50', 4)")
    expect(r.rows.map((x) => x[0])).toEqual(['1950-01-01', '1960-01-01', '2026-01-01', '2049-01-01'])
  })
  it('refuse the ISO spelling (ORA-01861) and other mismatches', async () => {
    expect(await failure("CREATE TABLE d9 (d DATE); INSERT INTO d9 VALUES ('2026-02-15')")).toBe('ORA-01861')
    expect(await failure("CREATE TABLE d9 (d DATE); INSERT INTO d9 VALUES ('31-FEB-26')")).toBe('ORA-01839')
    expect(await failure("CREATE TABLE d9 (d DATE); INSERT INTO d9 VALUES ('xyz')")).toBe('ORA-01858')
    expect(await failure("CREATE TABLE d9 (d DATE); INSERT INTO d9 VALUES ('01-JAN-26'); UPDATE d9 SET d = '2026-02-15'")).toBe('ORA-01861')
    expect(await failure("INSERT INTO studenti (nr_matricol, data_nastere) VALUES ('999', '1996-09-03')")).toBe('ORA-01861')
  })
  it('leave text columns alone', async () => {
    const r = await script("CREATE TABLE t9 (a VARCHAR2(20)); INSERT INTO t9 VALUES ('2026-02-15'); SELECT a FROM t9")
    expect(r.rows).toEqual([['2026-02-15']])
  })
})

describe('script runs', () => {
  it('a failing statement is reported and the next one still runs', async () => {
    const r = await script("INSERT INTO note VALUES ('111', '21', 5, NULL);\nINSERT INTO note VALUES ('111', '21', 500, NULL);\nSELECT COUNT(*) FROM note;")
    expect(r.statements).toHaveLength(3)
    expect(r.statements.map((s) => s.error?.code)).toEqual([undefined, 'ORA-01438', undefined])
    expect(r.statements[0]).toMatchObject({ kind: 'dml', rowCount: 1 })
    expect(r.statements[2]).toMatchObject({ kind: 'rows', rowCount: 1 })
    expect(r.rows).toEqual([['43']])
    expect(r.kind).toBe('rows')
    expect(r.error).toBeUndefined()
  })
  it('the error of the last statement is the error of the result', async () => {
    const r = await script('SELECT 1 FROM dual; SELECT nope FROM dual')
    expect(r.error.code).toBe('ORA-00904')
    expect(r.statements[0].error).toBeUndefined()
  })
  it('splits on ; and on a / line, not inside strings or comments', async () => {
    const r = await script("SELECT ';' FROM dual -- a ; in a comment\n/\nSELECT 2 /* ; */ FROM dual;\n\nSELECT 3 FROM dual")
    expect(r.statements.map((s) => s.rowCount)).toEqual([1, 1, 1])
    expect(r.statements[0].sql).toContain("';'")
    expect(r.rows).toEqual([['3']])
  })
  it('DESCRIBE inside a script sees the tables the script just created', async () => {
    const r = await script('CREATE TABLE d3 (a NUMBER(4,1)); DESCRIBE d3')
    expect(r.rows).toEqual([['A', '', 'NUMBER(4,1)']])
  })
  it('ALTER SESSION inside a script is honoured', async () => {
    const r = await script("ALTER SESSION SET NLS_DATE_FORMAT = 'YYYY-MM-DD'; SELECT SYSDATE FROM dual")
    expect(r.rows).toEqual([['2026-10-26']])
    await run("ALTER SESSION SET NLS_DATE_FORMAT = 'DD-MON-RR'")
  })
  it('an unknown function inside a script is an Oracle error, not a crash', async () => {
    const r = await script('INSERT INTO note VALUES (NULL, NULL, 1, NULL); SELECT no_such_fn(1) FROM dual; SELECT COUNT(*) FROM note')
    expect(r.statements.map((x) => x.error?.code)).toEqual([undefined, 'ORA-00904', undefined])
    expect(r.rows).toEqual([['43']])
  })
  it('runs that overlap take turns', async () => {
    const [a, b] = await Promise.all([script('DELETE FROM note; SELECT COUNT(*) FROM note'), script('SELECT COUNT(*) FROM note')])
    expect(a.rows).toEqual([['0']])
    expect(b.rows).toEqual([['42']])
  })
  it('every error code the sandbox raises has its own explanation', () => {
    for (const code of ['ORA-00001', 'ORA-00902', 'ORA-00906', 'ORA-00910', 'ORA-00913', 'ORA-00947', 'ORA-00955', 'ORA-00957', 'ORA-01086', 'ORA-01400', 'ORA-01407', 'ORA-01430', 'ORA-01438', 'ORA-01723', 'ORA-01727', 'ORA-01728', 'ORA-01758', 'ORA-01839', 'ORA-01861', 'ORA-02258', 'ORA-02260', 'ORA-02264', 'ORA-02266', 'ORA-02270', 'ORA-02290', 'ORA-02291', 'ORA-02292', 'ORA-02296', 'ORA-02449', 'ORA-04043', 'ORA-12899', 'ORA-12983']) {
      expect(explainOra(code), code).not.toEqual(explainOra('ORA-99999'))
    }
  })
  it('two statements without script: true are still ORA-00911', async () => {
    expect((await run('SELECT 1 FROM dual; SELECT 2 FROM dual')).error.code).toBe('ORA-00911')
  })
})

describe('snapshot: table contents after a run', () => {
  it('shows the state the last run ended in', async () => {
    await script("DELETE FROM note WHERE valoare < 5; INSERT INTO didactic VALUES ('9', '9'); CREATE TABLE s9 (x NUMBER); INSERT INTO s9 VALUES (3)")
    const snap = await engine.snapshot(DS)
    expect(Object.keys(snap).sort()).toEqual(['CURSURI', 'DIDACTIC', 'NOTE', 'PROFESORI', 'S9', 'STUDENTI'])
    expect(snap.NOTE.rowCount).toBeLessThan(42)
    expect(snap.DIDACTIC.rowCount).toBe(11)
    expect(snap.S9).toMatchObject({ kind: 'rows', columns: ['X'], rows: [['3']], rowCount: 1 })
    expect(await engine.describe('s9', DS)).toEqual([{ name: 'X', nullable: true, type: 'NUMBER' }])
  })
  it('can be limited to some tables and reports a missing one', async () => {
    await script('DROP TABLE didactic')
    const snap = await engine.snapshot({ ...DS, tables: ['didactic', 'cursuri'] })
    expect(Object.keys(snap)).toEqual(['DIDACTIC', 'CURSURI'])
    expect(snap.DIDACTIC.error.code).toBe('ORA-00942')
    expect(snap.CURSURI.rowCount).toBe(9)
  })
  it('after a read-only run it is the untouched dataset', async () => {
    await run('SELECT 1 FROM dual')
    const snap = await engine.snapshot({ ...DS, tables: ['note'] })
    expect(snap.NOTE.rowCount).toBe(42)
    expect(await engine.describe('studenti', DS)).toEqual(STUDENTI)
  })
})

describe('ALTER SESSION is not transactional', () => {
  const reset = () => run("ALTER SESSION SET NLS_DATE_FORMAT = 'DD-MON-RR'")
  const both = "SELECT TO_CHAR(SYSDATE), SYSDATE FROM dual"
  it('survives a ROLLBACK in the same run', async () => {
    const r = await script(`ALTER SESSION SET NLS_DATE_FORMAT = 'YYYY-MM-DD'; ROLLBACK; ${both}`)
    await reset()
    expect(r.rows).toEqual([['2026-10-26', '2026-10-26']])
  })
  it('survives ROLLBACK after an earlier run set it', async () => {
    await run("ALTER SESSION SET NLS_DATE_FORMAT = 'YYYY-MM-DD'")
    const r = await script(`INSERT INTO note VALUES (NULL, NULL, 1, NULL); ROLLBACK; ${both}`)
    await reset()
    expect(r.rows).toEqual([['2026-10-26', '2026-10-26']])
  })
  it('survives ROLLBACK TO a savepoint taken before the ALTER SESSION', async () => {
    const r = await script(`SAVEPOINT a; ALTER SESSION SET NLS_DATE_FORMAT = 'YYYY-MM-DD'; ROLLBACK TO a; ${both}`)
    await reset()
    expect(r.rows).toEqual([['2026-10-26', '2026-10-26']])
  })
})

describe('PostgreSQL-only transaction words never reach PostgreSQL', () => {
  it.each(['END', 'ABORT', 'BEGIN', 'START TRANSACTION', 'RELEASE SAVEPOINT x', 'PREPARE TRANSACTION', 'COMMIT AND CHAIN', 'ROLLBACK AND CHAIN'])('%s is ORA-00900', async (sql) => {
    const r = await run(sql)
    expect(r.error?.code).toBe('ORA-00900')
  })
  it('a lone END after an INSERT does not leak the INSERT into later runs', async () => {
    const r = await script('INSERT INTO note VALUES (NULL, NULL, 1, NULL); END')
    expect(r.statements[1].error.code).toBe('ORA-00900')
    expect(await cell('SELECT COUNT(*) FROM note')).toBe('42')
  })
  it('a PL/SQL block cut at its inner semicolon does not leak either', async () => {
    await script("INSERT INTO note VALUES (NULL, NULL, 1, NULL);\nBEGIN\n NULL;\nEND;\n/")
    expect(await cell('SELECT COUNT(*) FROM note')).toBe('42')
  })
})
