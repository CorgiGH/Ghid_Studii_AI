// Dates and implicit conversions (review fixes 1, 2, 8, 9, 15). Expected values are what Oracle 11g answers
// (tests/sql/oracle-snapshot.json holds the full corpus; these cases pin the headline behaviours by name).
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PGlite } from '@electric-sql/pglite'
import { beforeAll, describe, expect, it } from 'vitest'
import { createEngine } from '../../src/sql/engine/core.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const facultate = fs.readFileSync(path.join(here, '..', '..', 'public', 'sql', 'datasets', 'facultate.sql'), 'utf8')

let engine
beforeAll(async () => {
  engine = await createEngine(new PGlite(), { clock: '2026-10-26 14:30:00', datasets: { facultate } })
})

const run = (sql) => engine.run(sql, { dataset: 'facultate' })
const cell = async (sql) => {
  const r = await run(sql)
  expect(r.error, sql).toBeUndefined()
  expect(r.rows, sql).toHaveLength(1)
  return r.rows[0][0]
}

describe('DATE display (fix 1)', () => {
  it('shows DD-MON-RR without the time', async () => {
    expect(await cell('SELECT SYSDATE FROM dual')).toBe('26-OCT-26')
    expect(await cell('SELECT SYSDATE + 1/24 FROM dual')).toBe('26-OCT-26')
  })
})

describe('DATE to text (fix 2)', () => {
  it('goes through DD-MON-RR in ||, CONCAT and TO_CHAR(d)', async () => {
    expect(await cell("SELECT nume||data_nastere FROM studenti WHERE nr_matricol='111'")).toBe('Popescu17-FEB-95')
    expect(await cell("SELECT CONCAT(nume, data_nastere) FROM studenti WHERE nr_matricol='111'")).toBe('Popescu17-FEB-95')
    expect(await cell("SELECT TO_CHAR(data_nastere) FROM studenti WHERE nr_matricol='111'")).toBe('17-FEB-95')
    expect(await cell("SELECT an||data_nastere FROM studenti WHERE nume='Antonie'")).toBe('303-JAN-95')
  })
  it('prints RR and RRRR in formats as the year', async () => {
    expect(await cell("SELECT TO_CHAR(TO_DATE('17-02-1995','DD-MM-YYYY'),'DD-MON-RR') FROM dual")).toBe('17-FEB-95')
    expect(await cell("SELECT TO_CHAR(TO_DATE('17-02-1995','DD-MM-YYYY'),'DD-MM-RRRR') FROM dual")).toBe('17-02-1995')
  })
})

describe('text to DATE (fix 8)', () => {
  it('compares a DD-MON-RR literal with the RR pivot', async () => {
    expect(await cell("SELECT COUNT(*) FROM studenti WHERE data_nastere > '01-JAN-60'")).toBe('13')
    expect(await cell("SELECT COUNT(*) FROM studenti WHERE data_nastere BETWEEN '01-JAN-95' AND '31-DEC-95'")).toBe('5')
  })
  it('leaves ANSI typed literals alone, also on the left of a comparison', async () => {
    expect(await cell("SELECT COUNT(*) FROM studenti WHERE DATE '1996-01-01' < data_nastere")).toBe('8')
    expect(await cell("SELECT COUNT(*) FROM studenti WHERE TIMESTAMP '1996-01-01 00:00:00' <= data_nastere")).toBe('8')
    expect(await cell("SELECT COUNT(*) FROM studenti WHERE data_nastere > DATE '1996-01-01'")).toBe('8')
    const r = await run("SELECT COUNT(*) FROM studenti WHERE data_nastere - DATE '1995-01-01' > 30")
    expect(r.error).toBeUndefined()
  })
  it('applies the pivot and the format errors inside IN lists', async () => {
    const code = async (sql) => (await run(sql)).error?.code
    expect(await cell("SELECT COUNT(*) FROM studenti WHERE data_nastere IN ('17-FEB-95')")).toBe('1')
    expect(await cell("SELECT COUNT(*) FROM studenti WHERE data_nastere IN ('17-FEB-55', '17-FEB-95')")).toBe('1')
    expect(await cell("SELECT COUNT(*) FROM studenti WHERE data_nastere NOT IN ('17-FEB-55')")).not.toBe('0')
    expect(await code("SELECT COUNT(*) FROM studenti WHERE data_nastere IN ('01/01/1997')")).toBe('ORA-01843')
    expect(await cell("SELECT COUNT(*) FROM studenti WHERE nume IN ('Popescu', 'x')")).toBe('1')
  })
  it('refuses a date-shaped string WHEN value against a DATE in a simple CASE (ORA-00932)', async () => {
    const code = async (sql) => (await run(sql)).error?.code
    expect(await code("SELECT CASE TO_DATE('17-02-1955','DD-MM-YYYY') WHEN '17-FEB-55' THEN 1 ELSE 0 END FROM dual")).toBe('ORA-00932')
    expect(await code("SELECT CASE data_nastere WHEN '01/01/1997' THEN 1 ELSE 0 END FROM studenti")).toBe('ORA-00932')
    expect(await cell("SELECT CASE nume WHEN 'Popescu' THEN 1 ELSE 0 END FROM studenti WHERE nr_matricol='111'")).toBe('1')
  })
  it('converts text arguments of date functions', async () => {
    expect(await cell("SELECT NEXT_DAY('13-OCT-55','TUESDAY') FROM dual")).toBe('18-OCT-55')
    expect(await cell("SELECT ADD_MONTHS('31-JAN-95',1) FROM dual")).toBe('28-FEB-95')
    expect(await cell("SELECT LAST_DAY('15-FEB-96') FROM dual")).toBe('29-FEB-96')
    expect(await cell("SELECT MONTHS_BETWEEN('01-MAR-95','01-JAN-95') FROM dual")).toBe('2')
  })
  it('rejects other shapes with the Oracle codes', async () => {
    const code = async (sql) => (await run(sql)).error?.code
    expect(await code("SELECT COUNT(*) FROM studenti WHERE data_nastere > '01/01/1997'")).toBe('ORA-01843')
    expect(await code("SELECT COUNT(*) FROM studenti WHERE data_nastere > '01-01-1997'")).toBe('ORA-01843')
    expect(await code("SELECT COUNT(*) FROM studenti WHERE data_nastere > '01-IAN-97'")).toBe('ORA-01843')
    expect(await code("SELECT COUNT(*) FROM studenti WHERE data_nastere > '1997-01-01'")).toBe('ORA-01861')
    expect(await code("SELECT TO_DATE('31-FEB-97') FROM dual")).toBe('ORA-01839')
    expect(await code("SELECT TO_DATE('32-JAN-97') FROM dual")).toBe('ORA-01847')
  })
  it('does not touch literals that are not compared with a DATE', async () => {
    expect(await cell("SELECT COUNT(*) FROM studenti WHERE nume = 'Popescu'")).toBe('1')
    const r = await run("UPDATE studenti SET data_nastere = '17-FEB-95' WHERE nr_matricol = '111'")
    expect(r.error).toBeUndefined()
  })
})

describe('NUMBER and DATE to text (fix 9)', () => {
  it('LIKE converts a NUMBER or DATE operand', async () => {
    const r = await run("SELECT nume FROM studenti WHERE bursa LIKE '4%'")
    expect(r.rows).toEqual([['Antonie']])
    expect((await run("SELECT nume FROM studenti WHERE data_nastere LIKE '%95'")).rowCount).toBe(5)
    expect((await run('SELECT nume FROM studenti WHERE an LIKE 1')).rowCount).toBe(4)
    expect((await run("SELECT nume FROM studenti WHERE bursa NOT LIKE '4%' AND bursa IS NOT NULL")).error).toBeUndefined()
  })
  it('SUBSTR and LENGTH take a DATE', async () => {
    expect(await cell("SELECT SUBSTR(data_nastere,4,3) FROM studenti WHERE nume='Popescu'")).toBe('FEB')
    expect(await cell("SELECT LENGTH(data_nastere) FROM studenti WHERE nume='Popescu'")).toBe('9')
  })
  it('|| and CONCAT join two NUMBERs', async () => {
    expect(await cell('SELECT 3||4 FROM dual')).toBe('34')
    expect(await cell("SELECT an||bursa FROM studenti WHERE nume='Antonie'")).toBe('3450')
    expect(await cell("SELECT 'x'||bursa FROM studenti WHERE nume='Antonie'")).toBe('x450')
  })
})

describe('TO_DATE missing fields (fix 15)', () => {
  it('default to day 1 of the clock month and year', async () => {
    expect(await cell("SELECT TO_DATE('1995','YYYY') FROM dual")).toBe('01-OCT-95')
    expect(await cell("SELECT TO_CHAR(TO_DATE('17/02','DD/MM'),'DD-MM-YYYY') FROM dual")).toBe('17-02-2026')
    expect(await cell("SELECT TO_CHAR(TO_DATE('17','DD'),'DD-MM-YYYY') FROM dual")).toBe('17-10-2026')
    expect(await cell("SELECT TO_CHAR(TO_DATE('10:30','HH24:MI'),'DD-MM-YYYY HH24:MI:SS') FROM dual")).toBe('01-10-2026 10:30:00')
  })
  it('RRRR with two digits follows the RR pivot', async () => {
    expect(await cell("SELECT TO_CHAR(TO_DATE('01-01-60','DD-MM-RRRR'),'YYYY') FROM dual")).toBe('1960')
    expect(await cell("SELECT TO_CHAR(TO_DATE('01-01-49','DD-MM-RRRR'),'YYYY') FROM dual")).toBe('2049')
  })
})
