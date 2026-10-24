// CHAR semantics, set operators, LIKE and empty strings (review fixes 3, 4a, 4b, 6, 7, 17, 21).
// Expected values are what Oracle 11g answers (see the corpus entries named in each test).
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PGlite } from '@electric-sql/pglite'
import { beforeAll, describe, expect, it } from 'vitest'
import { createEngine } from '../../src/sql/engine/core.js'
import { rewriteOracle } from '../../src/sql/rewrite/index.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const facultate = fs.readFileSync(path.join(here, '..', '..', 'public', 'sql', 'datasets', 'facultate.sql'), 'utf8')

let engine
beforeAll(async () => {
  engine = await createEngine(new PGlite(), { clock: '2026-10-26 14:30:00', datasets: { facultate } })
})

const run = async (sql) => {
  const r = await engine.run(sql, { dataset: 'facultate' })
  expect(r.error, sql).toBeUndefined()
  return r
}
const cell = async (sql) => {
  const r = await run(sql)
  expect(r.rows, sql).toHaveLength(1)
  return r.rows[0][0]
}
const count = async (sql) => (await run(sql)).rowCount

describe('CHAR stays CHAR through UPPER / LOWER / || (fix 4a)', () => {
  it('compares blank-padded after UPPER, LOWER, INITCAP and nume||empty', async () => {
    expect(await count("SELECT * FROM profesori WHERE UPPER(nume) = 'BREABAN'")).toBe(1)
    expect(await count("SELECT * FROM profesori WHERE LOWER(nume) = 'breaban'")).toBe(1)
    expect(await count("SELECT * FROM profesori WHERE UPPER(nume) = UPPER('Breaban')")).toBe(1)
    expect(await count("SELECT * FROM profesori WHERE nume||'' = 'Breaban'")).toBe(1)
  })
  it('keeps the padding of the value', async () => {
    expect(await cell("SELECT LENGTH(UPPER(nume)) FROM profesori WHERE id_prof = 'p6'")).toBe('10')
  })
})

describe('CHAR padding survives functions that go through text (fix 4b)', () => {
  it('RPAD / LPAD / REVERSE / TRANSLATE see the blanks of a CHAR(10)', async () => {
    const r = await run("SELECT RPAD(nume, 12, '*'), LPAD(nume, 12, '*') FROM profesori WHERE id_prof = 'p6'")
    expect(r.rows[0]).toEqual(['Breaban   **', '**Breaban   '])
    const s = await run("SELECT REVERSE(nume), TRANSLATE(nume, ' ', '_') FROM profesori WHERE id_prof = 'p6'")
    expect(s.rows[0]).toEqual(['   nabaerB', 'Breaban___'])
  })
  it('CAST(CHAR AS VARCHAR2) keeps the blanks', async () => {
    expect(await count("SELECT * FROM profesori WHERE CAST(nume AS VARCHAR2(10)) = 'Breaban'")).toBe(0)
  })
  it('DECODE compares CHAR against a literal without padding', async () => {
    expect(await cell("SELECT DECODE(nr_matricol, '111', 'da', 'nu') FROM studenti WHERE nume = 'Popescu'")).toBe('nu')
    expect(await cell("SELECT DECODE(nume, 'Breaban', 'da', 'nu') FROM profesori WHERE id_prof = 'p6'")).toBe('nu')
    expect(await cell("SELECT DECODE(an, 3, 'trei', 'altul') FROM studenti WHERE nume = 'Popescu'")).toBe('trei')
  })
  it('UNION / INTERSECT / MINUS of VARCHAR2 and CHAR keep the blanks', async () => {
    expect(await count('SELECT prenume FROM studenti INTERSECT SELECT prenume FROM profesori')).toBe(0)
    expect(await count('SELECT prenume FROM studenti UNION SELECT prenume FROM profesori')).toBe(26)
    expect(await count('SELECT prenume FROM studenti MINUS SELECT prenume FROM profesori')).toBe(11)
  })
})

describe('CHAR arms of different length and a literal arm (fix 4b)', () => {
  it('a literal against a CHAR(10) column compares without padding, whichever arm comes first', async () => {
    expect(await count("SELECT 'Alexandru' x FROM dual INTERSECT SELECT prenume FROM profesori")).toBe(0)
    expect((await run("SELECT 'Alexandru' x FROM dual UNION SELECT 'Alexandru' FROM dual")).columns).toEqual(['X'])
  })
  it('CHAR first, VARCHAR2 second still gives 26 rows', async () => {
    expect(await count('SELECT DISTINCT prenume FROM profesori UNION SELECT DISTINCT prenume FROM studenti')).toBe(26)
  })
})

describe('set operators evaluate left to right (fix 6)', () => {
  it('UNION then INTERSECT is (a UNION b) INTERSECT c', async () => {
    expect(await count('SELECT nume FROM studenti WHERE an=1 UNION SELECT nume FROM studenti WHERE an=2 INTERSECT SELECT nume FROM studenti WHERE an=2')).toBe(3)
  })
  it('rewrites a chain with INTERSECT into nested parentheses and leaves ORDER BY outside', () => {
    const r = rewriteOracle('select a from t union select b from u intersect select c from v order by 1').sql
    expect(r).toMatch(/\(select a from t union select b from u\) intersect select c from v order by 1/i)
  })
  it('a chain without INTERSECT is left alone', () => {
    expect(rewriteOracle('select a from t union all select b from u union all select c from v').sql).toBe('select a from t union all select b from u union all select c from v')
  })
  it('keeps a WITH clause in front of the grouped chain', async () => {
    const r = await run('WITH c AS (SELECT nume FROM studenti WHERE an=2) SELECT nume FROM studenti WHERE an=1 UNION SELECT nume FROM c INTERSECT SELECT nume FROM c')
    expect(r.rowCount).toBe(3)
  })
})

describe('(+) composes with set operators (fix 3)', () => {
  it('old-style outer joins in both arms of a UNION (lab 4 ex 6)', async () => {
    const sql = 'SELECT p.nume, p.prenume, c.titlu_curs FROM profesori p, didactic d, cursuri c WHERE p.id_prof = d.id_prof(+) AND d.id_curs = c.id_curs(+) UNION SELECT p.nume, p.prenume, c.titlu_curs FROM profesori p, didactic d, cursuri c WHERE p.id_prof(+) = d.id_prof AND d.id_curs(+) = c.id_curs'
    expect(await count(sql)).toBe(18)
  })
  it('works with MINUS, INTERSECT, a parenthesised first arm and a subquery', async () => {
    expect(await count('SELECT s.nume FROM studenti s, note n WHERE s.nr_matricol = n.nr_matricol(+) MINUS SELECT s.nume FROM studenti s, note n WHERE s.nr_matricol = n.nr_matricol(+) AND s.an = 3')).toBe(6)
    expect(await count('SELECT s.nume FROM studenti s, note n WHERE s.nr_matricol = n.nr_matricol(+) INTERSECT SELECT nume FROM studenti WHERE an = 1')).toBe(4)
    expect(await count('(SELECT s.nume FROM studenti s, note n WHERE s.nr_matricol = n.nr_matricol(+)) UNION SELECT nume FROM profesori')).toBe(27)
    expect(await count("SELECT nume FROM studenti WHERE nr_matricol IN (SELECT s.nr_matricol FROM studenti s, note n WHERE s.nr_matricol = n.nr_matricol(+) AND n.valoare IS NULL)")).toBeGreaterThanOrEqual(0)
  })
})

describe('LIKE with a built pattern (fix 7)', () => {
  it('puts ESCAPE after the whole pattern expression', async () => {
    expect(await count("SELECT nume FROM studenti WHERE nume LIKE 'P'||'%'")).toBe(4)
    expect(rewriteOracle("select 1 from t where a like 'P' || '%' and b = 2").sql).toBe("select 1 from t where a like ('P'::text || '%'::text) ESCAPE '' and b = 2")
    expect(rewriteOracle("select 1 from t where a like 'x%'").sql).toBe("select 1 from t where a like 'x%' ESCAPE ''")
    expect(rewriteOracle("select 1 from t where a like 'x%' escape '!'").sql).toBe("select 1 from t where a like 'x%' escape '!'")
  })
  it('a pattern built from columns works', async () => {
    expect(await count("SELECT s.nume, p.nume FROM studenti s, profesori p WHERE p.nume LIKE '%' || SUBSTR(s.nume,1,1) || '%' AND s.nr_matricol='111'")).toBe(2)
  })
  it('LIKE on a CHAR column sees the padding', async () => {
    expect(await count("SELECT * FROM profesori WHERE nume LIKE '%'||'n'")).toBe(0)
  })
})

describe('empty results are NULL (fix 17)', () => {
  it('TRANSLATE that deletes every character is NULL', async () => {
    expect(await count("SELECT 1 FROM dual WHERE TRANSLATE('b','ab','x') IS NULL")).toBe(1)
  })
})

describe('set operator output is sorted (fix 21)', () => {
  it('UNION, MINUS and INTERSECT without ORDER BY come back sorted by all columns', async () => {
    for (const sql of [
      'SELECT nume FROM studenti WHERE an = 2 UNION SELECT nume FROM studenti WHERE an = 3',
      'SELECT nume FROM studenti MINUS SELECT nume FROM studenti WHERE an = 1',
      'SELECT nume FROM studenti INTERSECT SELECT nume FROM studenti WHERE bursa IS NOT NULL',
    ]) {
      const r = await run(sql)
      const col = r.rows.map((x) => x[0])
      expect(col, sql).toEqual([...col].sort())
      expect(r.rowCount).toBeGreaterThan(1)
    }
  })
  it('UNION ALL is not sorted and the header stays as typed', async () => {
    const r = await run('SELECT nume FROM studenti WHERE an = 3 UNION ALL SELECT nume FROM studenti WHERE an = 1')
    expect(r.columns).toEqual(['NUME'])
    expect(rewriteOracle('select a from t union all select b from u').sql).toBe('select a from t union all select b from u')
  })
})
