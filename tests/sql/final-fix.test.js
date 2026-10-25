// The final fix wave of the engine and the checker (lane a): the rewrite passes on their own, the error codes, the grading of the
// answers the reviewers found graded wrong, and the guards around them. Oracle's values come from the corpus entries
// tests/sql/corpus/final-fix.json (frozen in tests/sql/oracle-snapshot.json); the differential test compares the whole corpus.
import { PGlite } from '@electric-sql/pglite'
import { beforeAll, describe, expect, it } from 'vitest'
import { createEngine } from '../../src/sql/engine/core.js'
import { mapPgError, OracleError, wrongCallCode } from '../../src/sql/engine/errors.js'
import { numberText } from '../../src/sql/engine/format.js'
import { explainOra, explainVerdict } from '../../src/sql/explain.js'
import { rewriteOracle, tokenize, untokenize } from '../../src/sql/rewrite/index.js'
import { lintOracle } from '../../src/sql/rewrite/lint.js'
import { concatPrecedence } from '../../src/sql/rewrite/pass-precedence.js'
import { castPass } from '../../src/sql/rewrite/pass-cast.js'
import { argConversions, dateLiteralConcat } from '../../src/sql/rewrite/pass-args.js'
import { repeatedTables } from '../../src/sql/rewrite/pass-repeat.js'
import { collectExercises, DEFAULT_CONTENT_DIR, datasetText, engineCache } from '../../scripts/sql/freeze-lib.mjs'
import { gradeOn } from '../../scripts/sql/mistakes-lib.mjs'

const pass = (fn) => (sql) => untokenize(fn(tokenize(sql)))

describe('concatPrecedence: + - || group left to right (item 4)', () => {
  const p = pass(concatPrecedence)
  it('wraps the chain before a + or - that follows a ||', () => {
    expect(p("SELECT 'a' || 1 + 2 FROM dual")).toBe("SELECT ('a' || 1) + 2 FROM dual")
    expect(p('SELECT 1 || 2 + 3 || 4 - 5 FROM dual')).toBe('SELECT ((1 || 2) + 3 || 4) - 5 FROM dual')
    expect(p("SELECT 'Anul viitor: ' || an + 1 FROM studenti")).toBe("SELECT ('Anul viitor: ' || an) + 1 FROM studenti")
    expect(p("SELECT nume || ' are ' || an + 0 || ' ani' FROM studenti")).toBe("SELECT (nume || ' are ' || an) + 0 || ' ani' FROM studenti")
  })
  it('leaves + and - before the first ||, * and /, and unary signs alone', () => {
    expect(p("SELECT 1 + 2 || 'a' FROM dual")).toBe("SELECT 1 + 2 || 'a' FROM dual")
    expect(p('SELECT 10 - 2 || 3 FROM dual')).toBe('SELECT 10 - 2 || 3 FROM dual')
    expect(p('SELECT 2 * 3 || 4 FROM dual')).toBe('SELECT 2 * 3 || 4 FROM dual')
    expect(p("SELECT 'x' || -1 FROM dual")).toBe("SELECT 'x' || -1 FROM dual")
    expect(p('SELECT 1 || 2 * 3 + 4 FROM dual')).toBe('SELECT (1 || 2 * 3) + 4 FROM dual')
    expect(p('SELECT 1 || - 2 + 3 FROM dual')).toBe('SELECT (1 || - 2) + 3 FROM dual')
  })
  it('does not cross commas, comparisons, AND / OR, aliases or clause keywords', () => {
    expect(p("SELECT a || b, c + 1 FROM t")).toBe('SELECT a || b, c + 1 FROM t')
    expect(p("SELECT a FROM t WHERE x || y = z + 1")).toBe('SELECT a FROM t WHERE x || y = z + 1')
    expect(p("SELECT a FROM t WHERE x || 'a' = 'b' AND n + 1 > 2")).toBe("SELECT a FROM t WHERE x || 'a' = 'b' AND n + 1 > 2")
    expect(p('SELECT a || b x, c - 1 FROM t')).toBe('SELECT a || b x, c - 1 FROM t')
    expect(p('SELECT a FROM t ORDER BY a || b, c - 1')).toBe('SELECT a FROM t ORDER BY a || b, c - 1')
  })
  it('works inside parentheses, function arguments and CASE, and keeps an operand whole', () => {
    expect(p('SELECT NVL(an || 0 - 1, 0) FROM studenti')).toBe('SELECT NVL((an || 0) - 1, 0) FROM studenti')
    expect(p('SELECT CASE WHEN an = 3 THEN 9 END || 0 - 1 FROM studenti')).toBe('SELECT (CASE WHEN an = 3 THEN 9 END || 0) - 1 FROM studenti')
    expect(p("SELECT s.nume || TO_CHAR(s.an) + 1 FROM studenti s")).toBe('SELECT (s.nume || TO_CHAR(s.an)) + 1 FROM studenti s')
    expect(p("SELECT 'x' || DATE '2020-01-01' + 1 FROM dual")).toBe("SELECT ('x' || DATE '2020-01-01') + 1 FROM dual")
    expect(p('SELECT x FROM t WHERE a.y = b.y(+) AND a || b + 1 = 2')).toBe('SELECT x FROM t WHERE a.y = b.y(+) AND (a || b) + 1 = 2')
  })
  it('keeps text + number converting (or failing) as Oracle does', async () => {
    const engine = await createEngine(new PGlite(), { clock: '2026-10-26 14:30:00', datasets: { facultate: datasetText('facultate') } })
    const run = (sql) => engine.run(sql, { dataset: 'facultate' })
    expect((await run("SELECT 'a1' + 2 FROM dual")).error.code).toBe('ORA-01722')
    expect((await run("SELECT '12' + 3 FROM dual")).rows).toEqual([['15']])
    expect((await run("SELECT 'a' || 1 + 2 FROM dual")).error.code).toBe('ORA-01722')
    expect((await run('SELECT 3 || 4 + 1 FROM dual')).rows).toEqual([['35']])
  }, 60000)
})

describe('castPass: CAST to a character type or DATE (item 2)', () => {
  const p = pass(castPass)
  it('turns the character targets into the compat functions', () => {
    expect(p('SELECT CAST(bursa AS VARCHAR2(10)) FROM studenti')).toBe('SELECT ora_cast_varchar(bursa, 10) FROM studenti')
    expect(p('SELECT CAST(an AS CHAR(3)) FROM studenti')).toBe('SELECT ora_cast_char(an, 3) FROM studenti')
    expect(p('SELECT CAST(an AS CHAR) FROM studenti')).toBe('SELECT ora_cast_char(an, 1) FROM studenti')
    expect(p('SELECT CAST(x AS NVARCHAR2(5 CHAR)) FROM t')).toBe('SELECT ora_cast_varchar(x, 5) FROM t')
    expect(p("SELECT CAST('17-FEB-95' AS DATE) FROM dual")).toBe("SELECT ora_cast_date('17-FEB-95') FROM dual")
  })
  it('handles a CAST inside a CAST and leaves other targets alone', () => {
    expect(p('SELECT CAST(CAST(bursa AS VARCHAR2(10)) AS NUMBER) FROM s')).toBe('SELECT CAST(ora_cast_varchar(bursa, 10) AS NUMBER) FROM s')
    expect(p('SELECT CAST(x AS NUMBER(5)) FROM s')).toBe('SELECT CAST(x AS NUMBER(5)) FROM s')
  })
  it('a VARCHAR2 with no length is ORA-00906, as in Oracle', () => {
    expect(() => castPass(tokenize('SELECT CAST(bursa AS VARCHAR2) FROM studenti'))).toThrowError(expect.objectContaining({ code: 'ORA-00906' }))
  })
})

describe('argConversions and DATE literals beside || (item 5)', () => {
  const p = pass(argConversions)
  it('wraps the arguments of LPAD, RPAD, INSTR, REPLACE and TRANSLATE by their parameter types', () => {
    expect(p('SELECT LPAD(bursa, 10, 0) FROM s')).toBe('SELECT LPAD(ora_t(bursa), ora_n(10), ora_t(0)) FROM s')
    expect(p("SELECT INSTR(nr, 1, '2') FROM s")).toBe("SELECT INSTR(ora_t(nr), ora_t(1), ora_n('2')) FROM s")
    expect(p("SELECT REPLACE(an, 1, 'unu') FROM s")).toBe("SELECT REPLACE(ora_t(an), ora_t(1), ora_t('unu')) FROM s")
    expect(p('SELECT TRANSLATE(LPAD(a, 2), 1, 2) FROM s')).toBe('SELECT TRANSLATE(ora_t(LPAD(ora_t(a), ora_n(2))), ora_t(1), ora_t(2)) FROM s')
  })
  it('leaves a call with a count Oracle refuses alone, so the count error comes out', () => {
    expect(p("SELECT LPAD('a') FROM dual")).toBe("SELECT LPAD('a') FROM dual")
    expect(p("SELECT TRANSLATE('a', 'b') FROM dual")).toBe("SELECT TRANSLATE('a', 'b') FROM dual")
  })
  it('types a DATE literal beside || as the compat DATE', () => {
    expect(untokenize(dateLiteralConcat(tokenize("SELECT DATE '1995-02-17' || 'x' FROM dual")))).toBe("SELECT (DATE '1995-02-17')::timestamp || 'x' FROM dual")
    expect(untokenize(dateLiteralConcat(tokenize("SELECT DATE '1995-02-17' + 1 FROM dual")))).toBe("SELECT DATE '1995-02-17' + 1 FROM dual")
  })
})

describe('repeatedTables: FROM t, t (item 6)', () => {
  it('aliases the repeat so a COUNT(*) runs', () => {
    expect(untokenize(repeatedTables(tokenize('SELECT COUNT(*) FROM studenti, studenti')))).toBe('SELECT COUNT(*) FROM studenti, studenti ora_r2')
  })
  it('refuses * and a column qualified with the repeated name with ORA-00918', () => {
    for (const sql of ['SELECT * FROM studenti, studenti', 'SELECT studenti.nume FROM studenti, studenti', 'SELECT COUNT(*) FROM studenti JOIN studenti ON studenti.an = studenti.an']) {
      expect(() => repeatedTables(tokenize(sql)), sql).toThrowError(expect.objectContaining({ code: 'ORA-00918' }))
    }
  })
  it('leaves aliased self-joins and subqueries alone', () => {
    for (const sql of ['SELECT * FROM studenti s1, studenti s2', 'SELECT * FROM studenti WHERE an IN (SELECT an FROM studenti)', 'SELECT s.* FROM studenti s, studenti']) {
      expect(untokenize(repeatedTables(tokenize(sql))), sql).toBe(sql)
    }
  })
})

describe('lintOracle: the new strictness rules (items 6 and 34)', () => {
  const codeOf = (sql) => lintOracle(sql)?.code ?? null
  it.each([
    ["SELECT 'abc FROM dual", 'ORA-01756'],
    ["SELECT nume FROM studenti WHERE nume = 'Pop", 'ORA-01756'],
    ['SELECT 10 % 3 FROM dual', 'ORA-00911'],
    ['SELECT nume FROM studenti WHERE nume LIKE %a%', 'ORA-00911'],
    ['SELECT', 'ORA-00936'],
    ['SELECT FROM dual', 'ORA-00936'],
    ['SELECT nume studenti', 'ORA-00923'],
    ['SELECT nume FORM studenti', 'ORA-00923'],
    ['SELECT nume, prenume studenti', 'ORA-00923'],
    ['SELECT * FROM ', 'ORA-00903'],
    ['SELECT * FROM WHERE an = 1', 'ORA-00903'],
    ['SELECT * FROM studenti s JOIN note n', 'ORA-00905'],
    ['SELECT * FROM studenti JOIN note WHERE an = 1', 'ORA-00905'],
    ['SELECT (nume FROM studenti', 'ORA-00907'],
  ])('%s -> %s', (sql, code) => expect(codeOf(sql)).toBe(code))
  it('accepts what Oracle accepts', () => {
    for (const sql of [
      "SELECT nume FROM studenti WHERE nume LIKE '%a%'",
      'SELECT EXTRACT(YEAR FROM data_nastere) FROM studenti',
      "SELECT TRIM(BOTH ' ' FROM nume) FROM studenti",
      'SELECT * FROM studenti s JOIN note n ON s.nr_matricol = n.nr_matricol',
      'SELECT * FROM studenti NATURAL JOIN note',
      'SELECT * FROM studenti CROSS JOIN cursuri',
      'SELECT * FROM studenti JOIN note USING (nr_matricol) WHERE an = 1',
      "SELECT 'it''s' FROM dual",
      'SELECT nume FROM studenti WHERE an IN (SELECT an FROM studenti)',
    ]) expect(codeOf(sql), sql).toBeNull()
  })
  it('names the construct of another dialect', () => {
    expect(lintOracle('SELECT nume FROM studenti EXCEPT SELECT nume FROM profesori')).toMatchObject({ dialect: true, construct: 'except' })
    expect(lintOracle('SELECT nume FROM studenti FETCH FIRST 2 ROWS ONLY')).toMatchObject({ dialect: true, construct: 'limit' })
    expect(lintOracle('SELECT TOP 2 nume FROM studenti')).toMatchObject({ dialect: true, construct: 'limit' })
    expect(lintOracle("SELECT nume FROM studenti WHERE nume ILIKE 'p%'")).toMatchObject({ dialect: true, construct: 'ilike' })
    expect(lintOracle('SELECT an::text FROM studenti')).toMatchObject({ dialect: true, construct: 'cast' })
    expect(lintOracle('SELECT nume FROM studenti INTERSECT ALL SELECT nume FROM profesori')).toMatchObject({ dialect: true, construct: 'set-all' })
  })
  it('the construct reaches the learner through the error', () => {
    let err
    try { rewriteOracle("SELECT nume FROM studenti WHERE nume ILIKE 'p%'") } catch (e) { err = e }
    expect(err).toBeInstanceOf(OracleError)
    expect(mapPgError(err)).toEqual({ code: 'ORA-00920', message: 'invalid relational operator', dialect: true, construct: 'ilike' })
  })
})

describe('mapPgError: the codes Oracle gives (items 5 and 6)', () => {
  const pg = (code, message) => Object.assign(new Error(message), { code })
  it.each([
    ['42601', 'each UNION query must have the same number of columns', 'ORA-01789'],
    ['42601', 'each EXCEPT query must have the same number of columns', 'ORA-01789'],
    ['42601', 'unterminated quoted string at or near "\'abc"', 'ORA-01756'],
    ['42601', 'syntax error at end of input', 'ORA-00933'],
    ['42P10', 'ORDER BY position 5 is not in select list', 'ORA-01785'],
    ['42P10', 'for SELECT DISTINCT, ORDER BY expressions must appear in select list', 'ORA-01791'],
    ['42804', 'UNION types character varying and numeric cannot be matched', 'ORA-01790'],
    ['42804', 'argument of CASE/WHEN must be type boolean, not type integer', 'ORA-00932'],
    ['21000', 'more than one row returned by a subquery used as an expression', 'ORA-01427'],
    ['42712', 'table name "studenti" specified more than once', 'ORA-00918'],
    ['42P20', 'window functions are not allowed in WHERE', 'ORA-30483'],
  ])('%s %s -> %s', (state, message, ora) => expect(mapPgError(pg(state, message)).code).toBe(ora))
  it('a window function left by a ROWNUM form is "not available in this practice database"', () => {
    const r = mapPgError(pg('42P20', 'window functions are not allowed in WHERE'), { sql: 'SELECT nume FROM studenti WHERE ROWNUM BETWEEN 1 AND 2' })
    expect(r.code).toBe('ORA-03001')
    expect(r.message).toMatch(/not available in this practice database/)
  })
  it('a known function: wrong count -> 00909 / 00938 / 00939, wrong types -> 00932', () => {
    const fn = (sig) => pg('42883', `function ${sig} does not exist`)
    const arities = (...a) => ({ knownFunction: { arities: a.map(([min, max]) => ({ min, max })) } })
    expect(mapPgError(fn('lpad(unknown)'), arities([2, 2], [3, 3])).code).toBe('ORA-00938')
    expect(mapPgError(fn('lpad(unknown, integer, unknown, unknown)'), arities([2, 2], [3, 3])).code).toBe('ORA-00939')
    expect(mapPgError(fn('nvl(integer)'), arities([2, 2])).code).toBe('ORA-00909')
    expect(mapPgError(fn('months_between(integer, integer)'), arities([2, 2])).code).toBe('ORA-00932')
    expect(mapPgError(fn('to_char(timestamp without time zone, integer)'), arities([1, 1], [2, 2], [3, 3])).code).toBe('ORA-00932')
    expect(wrongCallCode('upper', 2, [{ min: 1, max: 1 }])).toBe('ORA-00909')
    expect(wrongCallCode('round', 3, [])).toBe('ORA-00939')
  })
  it('never passes an internal name on to the learner', () => {
    expect(mapPgError(pg('P0001', 'ORA-00932: inconsistent datatypes: expected timestamp without time zone got ora_date')).message).not.toMatch(/ora_|without time zone/)
    expect(mapPgError(pg('XX000', 'function ora_t(boolean) is broken')).message).not.toMatch(/ora_/)
  })
})

describe('the engine, end to end', () => {
  let engine
  beforeAll(async () => {
    engine = await createEngine(new PGlite(), { clock: '2026-10-26 14:30:00', datasets: { facultate: datasetText('facultate') } })
  }, 60000)
  const run = (sql) => engine.run(sql, { dataset: 'facultate' })

  it('no error message names an internal type or helper (items 5 and 6)', async () => {
    const wrong = [
      'SELECT GREATEST(SYSDATE, data_nastere, 5) FROM studenti', "SELECT DECODE(an, 1, SYSDATE, 'x') FROM studenti",
      'SELECT LPAD(nume, SYSDATE) FROM studenti', 'SELECT MONTHS_BETWEEN(1, 2) FROM dual', 'SELECT TO_CHAR(SYSDATE, 5) FROM dual',
      'SELECT NVL(bursa, SYSDATE) FROM studenti', 'SELECT ADD_MONTHS(1, 1) FROM dual', "SELECT LEAST(data_nastere, 'abc') FROM studenti",
      "SELECT INSTR(nume, 'a', SYSDATE) FROM studenti", 'SELECT CAST(SYSDATE AS NUMBER) FROM dual', 'SELECT CAST(1 AS DATE) FROM dual',
      'SELECT * FROM studenti, studenti', 'SELECT nume FROM studenti UNION SELECT an FROM studenti', "SELECT CONVERT('a', 'US7ASCII') FROM dual",
      'SELECT nume FROM studenti WHERE ROWNUM BETWEEN 1 AND 2', 'SELECT (SELECT nume FROM studenti) FROM dual', "SELECT TO_DATE('31-02-1995', 'DD-MM-YYYY') FROM dual",
    ]
    for (const sql of wrong) {
      const r = await run(sql)
      expect(r.error, sql).toBeDefined()
      expect(r.error.code, sql).toMatch(/^ORA-\d{5}$/)
      expect(r.error.message, sql).not.toMatch(/ora_|without time zone|with time zone|bpchar/)
    }
  }, 60000)

  it('ROWNUM on a join with an inline view is refused with a real-format code (item 6)', async () => {
    const r = await run('SELECT s.nume FROM (SELECT * FROM studenti) s, note n WHERE s.nr_matricol = n.nr_matricol AND ROWNUM <= 3')
    expect(r.error.code).toBe('ORA-03001')
    expect(r.error.message).toMatch(/not available in this practice database/)
    expect(explainOra('ORA-03001').ro).toMatch(/exercițiu/)
  })

  it('ora_n2t writes a NUMBER exactly as the result grid does (numberText)', async () => {
    const values = ['0', '7', '-7', '450.50', '0.5', '-0.5', '123.456', '1e40', '-1e40', '1e-7', '0.000012345', '12345678901234567890123456789012345678901',
      '1.23456789012345678901234567890123456789012345', '-98765432109876543210987654321098765432.123', '0.00000099999999999999999999999999999999999999999', '999999999999999999999999999999999999999.9999']
    const r = await run(`SELECT ${values.map((v, i) => `TO_CHAR(${v}) c${i}`).join(', ')} FROM dual`)
    expect(r.error).toBeUndefined()
    const plain = await run(`SELECT ${values.map((v, i) => `${v} c${i}`).join(', ')} FROM dual`)
    expect(r.rows[0]).toEqual(plain.rows[0])
    expect(r.rows[0].map((t) => t.length <= 40)).toEqual(values.map(() => true))
    expect(numberText('450.50')).toBe('450.5')
  })
})

describe('answers the checker used to grade wrong', () => {
  const items = collectExercises(DEFAULT_CONTENT_DIR)
  const item = (id) => items.find((i) => i.id === id)
  const engineFor = engineCache()
  const grade = (id, sql) => Promise.all(['facultate', 'facultate-hidden'].map((d) => gradeOn(item(id), sql, d, engineFor)))

  it('item 1: the TRIM forms of the CHAR(10) professor names are correct on both datasets', async () => {
    expect(await grade('bd-l19-ex-4-3', 'SELECT TRIM(p.nume), TRIM(p.prenume), c.titlu_curs FROM profesori p JOIN didactic d ON p.id_prof = d.id_prof JOIN cursuri c ON d.id_curs = c.id_curs')).toEqual(['correct', 'correct'])
    expect(await grade('bd-l21-ex-4-10', 'SELECT s.nume, s.prenume, TRIM(p.nume), TRIM(p.prenume) FROM studenti s JOIN profesori p ON LENGTH(s.nume) = LENGTH(TRIM(p.nume))')).toEqual(['correct', 'correct'])
    expect(await grade('bd-l11-ex-2-15', "SELECT TRIM(nume), TRIM(prenume) FROM profesori WHERE LOWER(TRIM(prenume)) LIKE '%n'")).toEqual(['correct', 'correct'])
    // the case of the names still counts
    expect(await grade('bd-l19-ex-4-3', 'SELECT UPPER(TRIM(p.nume)), TRIM(p.prenume), c.titlu_curs FROM profesori p JOIN didactic d ON p.id_prof = d.id_prof JOIN cursuri c ON d.id_curs = c.id_curs')).toEqual(['rows', 'rows'])
  }, 120000)

  it('item 2: the CAST answers of L16 x2 and L12 3-5 are correct on both datasets', async () => {
    expect(await grade('bd-l16-ex-x2', "SELECT nume, NVL(CAST(bursa AS VARCHAR2(10)),'Nu are bursa') AS bursa FROM studenti")).toEqual(['correct', 'correct'])
    expect(await grade('bd-l12-ex-3-5', "SELECT LPAD(CAST(bursa AS VARCHAR2(10)),10,'$') FROM studenti")).toEqual(['correct', 'correct'])
  }, 120000)

  it('item 8: L14 ex 2-5 wants the order; the unordered answer is an order verdict', async () => {
    const base = "SELECT nume, prenume, data_nastere FROM studenti WHERE data_nastere BETWEEN TO_DATE('01-01-1995', 'DD-MM-YYYY') AND TO_DATE('10-06-1997', 'DD-MM-YYYY')"
    expect(await grade('bd-l14-ex-2-5', base)).toEqual(['order', 'order'])
    expect(await grade('bd-l14-ex-2-5', item('bd-l14-ex-2-5').solution)).toEqual(['correct', 'correct'])
  }, 120000)

  it("item 45: L21 ex 4-7 accepts the padded 'Day' name", async () => {
    const sql = "SELECT s1.nume AS nume1, s2.nume AS nume2, TO_CHAR(s1.data_nastere, 'Day') AS zi FROM studenti s1 JOIN studenti s2 ON TO_CHAR(s1.data_nastere, 'D') = TO_CHAR(s2.data_nastere, 'D') AND (s1.nume < s2.nume OR (s1.nume = s2.nume AND s1.nr_matricol < s2.nr_matricol)) ORDER BY TRUNC(s1.data_nastere) - TRUNC(s1.data_nastere, 'IW'), s1.nume, s2.nume"
    expect(await grade('bd-l21-ex-4-7', sql)).toEqual(['correct', 'correct'])
  }, 120000)
})

describe('explanations of the new verdicts and codes', () => {
  it('not-oracle says what Oracle uses instead, per construct', () => {
    const t = (construct) => explainVerdict({ ok: false, kind: 'not-oracle', code: 'ORA-00933', construct }).ro
    expect(t('except')).toMatch(/MINUS/)
    expect(t('limit')).toMatch(/ROWNUM/)
    expect(t('ilike')).toMatch(/UPPER/)
    expect(t('cast')).toMatch(/CAST|TO_CHAR/)
    expect(t('set-all')).toMatch(/UNION ALL/)
    expect(new Set(['except', 'limit', 'ilike', 'cast', 'set-all'].map(t)).size).toBe(5)
  })
  it('ORA-00933 no longer reads as if LIMIT were the only cause', () => {
    const e = explainOra('ORA-00933')
    expect(e.ro).toMatch(/nu se termină/)
    expect(e.en).toMatch(/does not end where Oracle expects/)
  })
})
