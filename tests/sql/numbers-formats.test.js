// NUMBER precision, format models, NLS names, INSTR and mixed types (review fixes 5, 10, 11a-c, 12, 13, 14a-c, 16).
// The expected values come from Oracle 11g (numbers-formats.cases.js lists them; the corpus in differential.test.js
// holds the same behaviours as frozen Oracle results).
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PGlite } from '@electric-sql/pglite'
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { createEngine } from '../../src/sql/engine/core.js'
import { numberText } from '../../src/sql/engine/format.js'
import { rewriteOracle } from '../../src/sql/rewrite/index.js'
import {
  DATE_FORMAT_CASES, INSTR_CASES, MIXED_TYPE_CASES, NLS_CASES, NUMBER_CASES, NUMBER_FORMAT_CASES, ROUND_TRUNC_CASES,
} from './numbers-formats.cases.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const facultate = fs.readFileSync(path.join(here, '..', '..', 'public', 'sql', 'datasets', 'facultate.sql'), 'utf8')
const NLS_DEFAULTS = "ALTER SESSION SET NLS_LANGUAGE=AMERICAN NLS_TERRITORY=AMERICA NLS_DATE_FORMAT='DD-MON-RR' NLS_DATE_LANGUAGE=AMERICAN NLS_NUMERIC_CHARACTERS='.,'"

let engine
beforeAll(async () => {
  engine = await createEngine(new PGlite(), { clock: '2026-10-26 14:30:00', datasets: { facultate } })
}, 60000)
afterEach(async () => {
  await engine.run(NLS_DEFAULTS, { dataset: 'facultate' })
})

const run = (sql) => engine.run(sql, { dataset: 'facultate' })

function table(name, cases) {
  describe(name, () => {
    it.each(cases.map((c) => [c[0], c[1]]))('%s', async (sql, expected) => {
      const r = await run(sql)
      if (expected !== null && typeof expected === 'object') {
        expect(r.error?.code, `${sql} should fail`).toBe(expected.error)
        return
      }
      expect(r.error, sql).toBeUndefined()
      expect(r.rows).toHaveLength(1)
      expect(r.rows[0][0]).toBe(expected)
    })
  })
}

table('NUMBER precision (fix 5)', NUMBER_CASES)
table('TO_CHAR(date, fmt): fm, spelled and suffixed elements (fix 11)', DATE_FORMAT_CASES)
table('TO_CHAR(number, fmt) (fix 12)', NUMBER_FORMAT_CASES)
table('ROUND and TRUNC of dates (fix 13)', ROUND_TRUNC_CASES)
table('names in other languages (fix 14)', NLS_CASES)
table('mixed types in NVL, NVL2, DECODE, GREATEST, LEAST (fix 10)', MIXED_TYPE_CASES)
table('INSTR (fix 16)', INSTR_CASES)

describe('Romanian month and day names keep their width and diacritics', () => {
  it('pads September to 10 characters without cutting it, and Tuesday to 8 with U+0163', async () => {
    const r = await run(`SELECT TO_CHAR(TO_DATE('15-09-2026','DD-MM-YYYY'),'Month','nls_date_language=romanian'), TO_CHAR(TO_DATE('27-10-2026','DD-MM-YYYY'),'Day','nls_date_language=romanian') FROM dual`)
    expect(r.rows[0][0]).toBe('Septembrie')
    expect(r.rows[0][0]).toHaveLength(10)
    expect(r.rows[0][1]).toBe('Marţi   ')
    expect(r.rows[0][1]).toHaveLength(8)
  })
})

describe('ALTER SESSION', () => {
  it('SET NLS_DATE_LANGUAGE changes names in TO_CHAR, in the date display and in NEXT_DAY, and the defaults bring English back', async () => {
    expect((await run('ALTER SESSION SET NLS_DATE_LANGUAGE=ROMANIAN')).error).toBeUndefined()
    const r = await run("SELECT data_nastere, TO_CHAR(data_nastere, 'Month'), nume || data_nastere FROM studenti WHERE nume = 'Antonie'")
    expect(r.rows[0]).toEqual(['03-IAN-95', 'Ianuarie  ', 'Antonie03-IAN-95'])
    expect((await run("SELECT NEXT_DAY(TO_DATE('17-02-1995','DD-MM-YYYY'), 'LUNI') FROM dual")).rows[0][0]).toBe('20-FEB-95')
    expect((await run("SELECT TO_DATE('15 septembrie 2026','DD Month YYYY') FROM dual")).rows[0][0]).toBe('15-SEP-26')
    expect((await run(NLS_DEFAULTS)).error).toBeUndefined()
    const back = await run("SELECT data_nastere, TO_CHAR(data_nastere, 'Month') FROM studenti WHERE nume = 'Antonie'")
    expect(back.rows[0]).toEqual(['03-JAN-95', 'January  '])
  })
  it('NLS_LANGUAGE sets the date language too, an explicit NLS_DATE_LANGUAGE wins', async () => {
    await run('ALTER SESSION SET NLS_LANGUAGE=FRENCH')
    expect((await run("SELECT TO_CHAR(TO_DATE('26-10-2026','DD-MM-YYYY'), 'Day') FROM dual")).rows[0][0]).toBe('Lundi   ')
    await run('ALTER SESSION SET NLS_LANGUAGE=FRENCH NLS_DATE_LANGUAGE=GERMAN')
    expect((await run("SELECT TO_CHAR(TO_DATE('26-10-2026','DD-MM-YYYY'), 'Day') FROM dual")).rows[0][0]).toBe('Montag    ')
  })
  it('SET NLS_DATE_FORMAT changes the date display and the text to DATE conversions', async () => {
    await run("ALTER SESSION SET NLS_DATE_FORMAT='DD-MON-RR HH24:MI:SS'")
    expect((await run('SELECT SYSDATE FROM dual')).rows[0][0]).toBe('26-OCT-26 14:30:00')
    await run("ALTER SESSION SET NLS_DATE_FORMAT='DD/MM/YYYY'")
    expect((await run("SELECT data_nastere FROM studenti WHERE nume = 'Popescu'")).rows[0][0]).toBe('17/02/1995')
    expect((await run("SELECT COUNT(*) FROM studenti WHERE data_nastere > '01/01/1997'")).rows[0][0]).toBe('4')
    expect((await run("SELECT TO_CHAR(data_nastere) FROM studenti WHERE nume = 'Popescu'")).rows[0][0]).toBe('17/02/1995')
    expect((await run("ALTER SESSION SET NLS_DATE_FORMAT='XX'")).error?.code).toBe('ORA-01821')
  })
  it('refuses what the practice database cannot do, with Oracle codes', async () => {
    expect((await run('ALTER SESSION SET NLS_TERRITORY=ROMANIA')).error?.code).toBe('ORA-12705')
    expect((await run('ALTER SESSION SET NLS_DATE_LANGUAGE=KLINGON')).error?.code).toBe('ORA-12705')
    expect((await run('ALTER SESSION SET NLS_FOO=1')).error?.code).toBe('ORA-00922')
    // a refused statement changes nothing
    expect((await run("SELECT TO_CHAR(TO_DATE('26-10-2026','DD-MM-YYYY'), 'Day') FROM dual")).rows[0][0]).toBe('Monday   ')
  })
})

describe('number display (engine/format.js)', () => {
  it('prints at most 40 characters, fixed notation first and scientific notation when it cannot fit', () => {
    expect(numberText('12.500')).toBe('12.5')
    expect(numberText('0.5')).toBe('.5')
    expect(numberText('-0.5')).toBe('-.5')
    expect(numberText('100')).toBe('100')
    expect(numberText('0')).toBe('0')
    expect(numberText('0.3333333333333333333333333333333333333333')).toBe('.333333333333333333333333333333333333333')
    expect(numberText('-0.3333333333333333333333333333333333333333')).toBe('-.33333333333333333333333333333333333333')
    expect(numberText('0.6666666666666666666666666666666666666667')).toBe('.666666666666666666666666666666666666667')
    expect(numberText('0.9999999999999999999999999999999999999999')).toBe('1')
    expect(numberText('0.0000011111111111111111111111111111111111')).toBe('1.1111111111111111111111111111111111E-06')
    expect(numberText('0.000001234567')).toBe('.000001234567')
    expect(numberText(`1${'0'.repeat(40)}`)).toBe('1.0000000000000000000000000000000000E+40')
    expect(numberText('12345678901234567890123456789012345678901')).toBe('1.2345678901234567890123456789012346E+40')
  })
})

describe('rewriting (fix 10)', () => {
  it('types NVL, NVL2, DECODE, GREATEST and LEAST by their first value', () => {
    const r = rewriteOracle("select nvl(a, 0), nvl2(a, 'x', 0), decode(a, 1, 'u', 2), greatest(a, 2), least(a, 2) from t").sql
    expect(r).toBe(
      "select COALESCE(ora_widen(a), ora_conv(0, ora_widen(a))), " +
      "CASE WHEN (a) IS NOT NULL THEN ora_widen('x') ELSE ora_conv(0, ora_widen('x')) END, " +
      "CASE WHEN ora_deq((a), (1)) THEN ora_widen('u') ELSE ora_conv(2, ora_widen('u')) END, " +
      'CASE WHEN (a) IS NULL OR (2) IS NULL THEN NULL ELSE GREATEST(ora_widen(a), ora_conv(2, ora_widen(a))) END, ' +
      'CASE WHEN (a) IS NULL OR (2) IS NULL THEN NULL ELSE LEAST(ora_widen(a), ora_conv(2, ora_widen(a))) END from t',
    )
  })
})
