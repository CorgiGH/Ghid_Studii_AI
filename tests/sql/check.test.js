// The result checker, the named-mistake detector and their explanations (Task 7).
import { PGlite } from '@electric-sql/pglite'
import { beforeAll, describe, expect, it } from 'vitest'
import { checkResult, runWithProbe } from '../../src/sql/check.js'
import { createEngine } from '../../src/sql/engine/core.js'
import { explainMistake, explainVerdict } from '../../src/sql/explain.js'
import { detectMistake } from '../../src/sql/mistakes.js'
import { datasetText } from '../../scripts/sql/freeze-lib.mjs'

const rows = (columns, ...data) => ({ kind: 'rows', columns, rows: data, rowCount: data.length, truncated: false })
const exp = (columns, ...data) => ({ columns, rows: data })
const ANY = { order: 'any', mode: 'bag', kind: 'query' }

describe('checkResult: query results', () => {
  const expected = exp(['A', 'B'], ['1', 'x'], ['2', 'y'], ['3', null])

  it('accepts the same rows in any order when order is any', () => {
    const v = checkResult(rows(['A', 'B'], ['3', null], ['1', 'x'], ['2', 'y']), expected, ANY)
    expect(v).toMatchObject({ ok: true, kind: 'correct', missing: [], extra: [] })
  })

  it('names the missing and the extra rows', () => {
    const v = checkResult(rows(['A', 'B'], ['1', 'x'], ['2', 'y'], ['4', 'z']), expected, ANY)
    expect(v).toMatchObject({ ok: false, kind: 'rows', missing: [['3', null]], extra: [['4', 'z']] })
  })

  it('reports a different number of rows as rowcount', () => {
    const v = checkResult(rows(['A', 'B'], ['1', 'x'], ['2', 'y']), expected, ANY)
    expect(v).toMatchObject({ ok: false, kind: 'rowcount', missing: [['3', null]], extra: [] })
  })

  it('treats a duplicate row as an extra row in bag mode', () => {
    const v = checkResult(rows(['A', 'B'], ['1', 'x'], ['1', 'x'], ['2', 'y'], ['3', null]), expected, ANY)
    expect(v).toMatchObject({ ok: false, kind: 'rowcount', extra: [['1', 'x']] })
  })

  it('does not confuse NULL with the text null or an empty text', () => {
    expect(checkResult(rows(['A', 'B'], ['1', 'x'], ['2', 'y'], ['3', 'null']), expected, ANY).ok).toBe(false)
    expect(checkResult(rows(['A', 'B'], ['1', 'x'], ['2', 'y'], ['3', '']), expected, ANY).ok).toBe(false)
  })

  it('reports a different number of columns as columns', () => {
    expect(checkResult(rows(['A'], ['1'], ['2'], ['3']), expected, ANY)).toMatchObject({ ok: false, kind: 'columns' })
  })

  describe('order', () => {
    const sorted = exp(['NUME', 'AN'], ['Ana', '1'], ['Bob', '1'], ['Cip', '2'])
    const spec = { ...ANY, order: 'required' }

    it('reports the order verdict when the rows match but the sequence differs', () => {
      const v = checkResult(rows(['NUME', 'AN'], ['Cip', '2'], ['Ana', '1'], ['Bob', '1']), sorted, spec)
      expect(v).toMatchObject({ ok: false, kind: 'order', missing: [], extra: [] })
    })

    it('accepts the sequence', () => {
      expect(checkResult(rows(['NUME', 'AN'], ['Ana', '1'], ['Bob', '1'], ['Cip', '2']), sorted, spec).ok).toBe(true)
    })

    it('does not count rows tied on the orderBy key as an error', () => {
      const tied = { ...spec, orderBy: ['AN'] }
      expect(checkResult(rows(['NUME', 'AN'], ['Bob', '1'], ['Ana', '1'], ['Cip', '2']), sorted, tied).ok).toBe(true)
      expect(checkResult(rows(['NUME', 'AN'], ['Cip', '2'], ['Bob', '1'], ['Ana', '1']), sorted, tied)).toMatchObject({ ok: false, kind: 'order' })
    })

    it('ignores the sequence when order is any', () => {
      expect(checkResult(rows(['NUME', 'AN'], ['Cip', '2'], ['Bob', '1'], ['Ana', '1']), sorted, ANY).ok).toBe(true)
    })
  })

  describe('aliases', () => {
    it('does not look at the headers when aliases is absent', () => {
      expect(checkResult(rows(['X', 'Y'], ['1', 'x'], ['2', 'y'], ['3', null]), expected, ANY).ok).toBe(true)
    })
    it('wants the named headers, in capitals, as Oracle shows unquoted aliases', () => {
      const spec = { ...ANY, aliases: ['Total', 'Nume'] }
      expect(checkResult(rows(['TOTAL', 'NUME'], ['1', 'x'], ['2', 'y'], ['3', null]), expected, spec).ok).toBe(true)
      expect(checkResult(rows(['TOTAL', 'NAME'], ['1', 'x'], ['2', 'y'], ['3', null]), expected, spec)).toMatchObject({ ok: false, kind: 'alias' })
    })
    it("treats '' in the list as any header", () => {
      const spec = { ...ANY, aliases: ['', 'Nume'] }
      expect(checkResult(rows(['Q', 'NUME'], ['1', 'x'], ['2', 'y'], ['3', null]), expected, spec).ok).toBe(true)
      expect(checkResult(rows(['Q', 'ALTA'], ['1', 'x'], ['2', 'y'], ['3', null]), expected, spec)).toMatchObject({ ok: false, kind: 'alias' })
      expect(checkResult(rows(['Q', 'NUME'], ['1', 'x'], ['2', 'y'], ['3', null]), expected, { ...ANY, aliases: ['', 'NUME', 'X'] }).kind).toBe('alias')
    })
    it('any-distinct accepts any headers that differ from each other', () => {
      const spec = { ...ANY, aliases: 'any-distinct' }
      expect(checkResult(rows(['P', 'Q'], ['1', 'x'], ['2', 'y'], ['3', null]), expected, spec).ok).toBe(true)
      expect(checkResult(rows(['P', 'P'], ['1', 'x'], ['2', 'y'], ['3', null]), expected, spec)).toMatchObject({ ok: false, kind: 'alias' })
    })
    it('reports wrong data before a wrong header', () => {
      const spec = { ...ANY, aliases: ['TOTAL', 'NUME'] }
      expect(checkResult(rows(['A', 'B'], ['9', 'x'], ['2', 'y'], ['3', null]), expected, spec).kind).toBe('rows')
    })
  })

  describe('set mode (duplicate rows merge)', () => {
    const names = exp(['NUME'], ['Bodnar'], ['Arhire'])
    it('merges duplicates on both sides', () => {
      const spec = { ...ANY, mode: 'set' }
      expect(checkResult(rows(['NUME'], ['Bodnar'], ['Bodnar'], ['Arhire']), names, spec).ok).toBe(true)
      expect(checkResult(rows(['NUME'], ['Bodnar'], ['Arhire']), exp(['NUME'], ['Bodnar'], ['Bodnar'], ['Arhire']), spec).ok).toBe(true)
    })
    it('still fails in bag mode', () => {
      expect(checkResult(rows(['NUME'], ['Bodnar'], ['Bodnar'], ['Arhire']), names, ANY).ok).toBe(false)
    })
  })

  describe('text, numbers and dates', () => {
    it('compares number-like strings as text', () => {
      const v = checkResult(rows(['S'], ['450']), exp(['S'], ['0000000450']), ANY)
      expect(v).toMatchObject({ ok: false, kind: 'rows', missing: [['0000000450']], extra: [['450']] })
    })
    it('compares CHAR padding exactly', () => {
      expect(checkResult(rows(['M'], ['113']), exp(['M'], ['113   ']), ANY).ok).toBe(false)
    })
    it('compares dates as displayed, and the century through the probe', () => {
      const e = { ...exp(['D'], ['17-FEB-95']), probe: [[' 1995-02-17']] }
      const right = { ...rows(['D'], ['17-FEB-95']), probe: [[' 1995-02-17']] }
      const wrongCentury = { ...rows(['D'], ['17-FEB-95']), probe: [[' 2095-02-17']] }
      expect(checkResult(right, e, ANY).ok).toBe(true)
      expect(checkResult(wrongCentury, e, ANY)).toMatchObject({ ok: false, kind: 'rows', missing: [[' 1995-02-17']], extra: [[' 2095-02-17']] })
      // no probe on the learner's side: the displayed text is all there is to compare
      expect(checkResult(rows(['D'], ['17-FEB-95']), e, ANY).ok).toBe(true)
    })
    it('compares displayed dates that differ', () => {
      expect(checkResult(rows(['D'], ['18-FEB-95']), exp(['D'], ['17-FEB-95']), ANY).ok).toBe(false)
    })
  })

  describe('cosmetic columns', () => {
    const e = exp(['NUME', 'LUNA'], ['Ana', 'JUNE     '])
    it('trims and case-folds only the columns marked trim-case', () => {
      const spec = { ...ANY, cosmetic: ['', 'trim-case'] }
      expect(checkResult(rows(['NUME', 'LUNA'], ['Ana', 'June']), e, spec).ok).toBe(true)
      expect(checkResult(rows(['NUME', 'LUNA'], ['ana', 'June']), e, spec).ok).toBe(false)
      expect(checkResult(rows(['NUME', 'LUNA'], ['Ana', 'June']), e, ANY).ok).toBe(false)
    })
    it('keeps NULL different from empty text', () => {
      const spec = { ...ANY, cosmetic: ['trim-case'] }
      expect(checkResult(rows(['X'], [null]), exp(['X'], ['']), spec).ok).toBe(false)
    })
  })

  describe('errors', () => {
    const failed = (code) => ({ kind: 'rows', columns: [], rows: [], rowCount: 0, truncated: false, error: { code, message: 'm' } })
    it('reports an Oracle error with its code', () => {
      expect(checkResult(failed('ORA-00904'), expected, ANY)).toMatchObject({ ok: false, kind: 'error', code: 'ORA-00904' })
    })
    it('reports PostgreSQL / MySQL habits as not-oracle', () => {
      for (const code of ['ORA-00920', 'ORA-00923', 'ORA-00928']) {
        expect(checkResult(failed(code), expected, ANY)).toMatchObject({ ok: false, kind: 'not-oracle', code })
      }
    })
  })
})

describe('checkResult: state exercises', () => {
  const spec = { order: 'any', mode: 'bag', kind: 'state', tables: ['studenti'] }
  const expected = { STUDENTI: exp(['NR', 'BURSA'], ['111', '250'], ['112', null]) }

  it('accepts the same contents', () => {
    const actual = { STUDENTI: rows(['NR', 'BURSA'], ['112', null], ['111', '250']) }
    expect(checkResult(actual, expected, spec)).toMatchObject({ ok: true, kind: 'correct' })
  })
  it('reports a missing table as structure', () => {
    const actual = { STUDENTI: { ...rows([]), error: { code: 'ORA-00942', message: 'x' } } }
    expect(checkResult(actual, expected, spec)).toMatchObject({ ok: false, kind: 'structure', table: 'STUDENTI' })
  })
  it('reports other columns as structure', () => {
    const actual = { STUDENTI: rows(['NR', 'SUMA'], ['111', '250'], ['112', null]) }
    expect(checkResult(actual, expected, spec)).toMatchObject({ ok: false, kind: 'structure' })
  })
  it('reports other data as contents, with the rows', () => {
    const actual = { STUDENTI: rows(['NR', 'BURSA'], ['111', '250'], ['112', '0']) }
    expect(checkResult(actual, expected, spec)).toMatchObject({ ok: false, kind: 'contents', table: 'STUDENTI', missing: [['112', null]], extra: [['112', '0']] })
  })
  it('matches table names whatever their case', () => {
    expect(checkResult({ studenti: rows(['NR', 'BURSA'], ['111', '250'], ['112', null]) }, expected, spec).ok).toBe(true)
  })
})

describe('explanations', () => {
  it('has a Romanian and an English text for every verdict kind', () => {
    const kinds = ['correct', 'rows', 'rowcount', 'order', 'columns', 'alias', 'error', 'not-oracle', 'structure', 'contents']
    for (const kind of kinds) {
      const t = explainVerdict({ ok: kind === 'correct', kind, code: 'ORA-00904', missing: [['a']], extra: [] })
      expect(t.ro.length, kind).toBeGreaterThan(10)
      expect(t.en.length, kind).toBeGreaterThan(10)
    }
  })
  it('counts the rows in a rows verdict', () => {
    const t = explainVerdict({ kind: 'rows', missing: [['a'], ['b']], extra: [['c']] })
    expect(t.en).toContain('2 expected rows are missing')
    expect(t.en).toContain('1 extra row')
  })
  it('has texts for all ten named mistakes', () => {
    const ids = ['eq-null', 'inner-vs-left', 'missing-join-cond', 'char-trim', 'self-pair-name', 'minus-name-collapse', 'and-or', 'dml-no-where', 'distinct-first-col', 'case-literal']
    const seen = new Set()
    for (const id of ids) {
      const t = explainMistake(id)
      expect(t.ro.length, id).toBeGreaterThan(40)
      expect(t.en.length, id).toBeGreaterThan(40)
      seen.add(t.en)
    }
    expect(seen.size).toBe(ids.length)
  })
})

describe('detectMistake on the lab data', () => {
  let engine
  beforeAll(async () => {
    engine = await createEngine(new PGlite(), { clock: '2026-10-26 14:30:00', datasets: { facultate: datasetText('facultate') } })
  })
  const run = (sql) => engine.run(sql, { dataset: 'facultate' })
  const expectedOf = async (sql) => {
    const r = await run(sql)
    expect(r.error, sql).toBeUndefined()
    return { columns: r.columns, rows: r.rows }
  }
  // the learner's wrong query against the right one -> the named mistake
  const mistakeOf = async (wrong, right, spec = ANY) => detectMistake({ sql: wrong, actual: await run(wrong), expected: await expectedOf(right), spec })

  it('eq-null: bursa = NULL', async () => {
    expect(await mistakeOf('SELECT nume FROM studenti WHERE bursa = NULL', 'SELECT nume FROM studenti WHERE bursa IS NULL')).toBe('eq-null')
    expect(await mistakeOf('SELECT nume FROM studenti WHERE bursa <> NULL', 'SELECT nume FROM studenti WHERE bursa IS NOT NULL')).toBe('eq-null')
  })

  it('inner-vs-left: JOIN where the rows without a partner are wanted', async () => {
    const right = 'SELECT s.nume, n.valoare FROM studenti s LEFT JOIN note n ON n.nr_matricol = s.nr_matricol WHERE s.an = 1'
    const wrong = 'SELECT s.nume, n.valoare FROM studenti s JOIN note n ON n.nr_matricol = s.nr_matricol WHERE s.an = 1'
    expect(await mistakeOf(wrong, right)).toBe('inner-vs-left')
  })

  it('missing-join-cond: three tables, one condition', async () => {
    const right = 'SELECT s.nume, c.titlu_curs, n.valoare FROM studenti s, note n, cursuri c WHERE s.nr_matricol = n.nr_matricol AND n.id_curs = c.id_curs'
    const wrong = 'SELECT s.nume, c.titlu_curs, n.valoare FROM studenti s, note n, cursuri c WHERE s.nr_matricol = n.nr_matricol'
    expect(await mistakeOf(wrong, right)).toBe('missing-join-cond')
  })

  it('char-trim: CHAR padding left in the answer', async () => {
    expect(await mistakeOf('SELECT nr_matricol FROM studenti', 'SELECT TRIM(nr_matricol) FROM studenti')).toBe('char-trim')
  })

  it('self-pair-name: s1.nume < s2.nume drops the pair of homonyms', async () => {
    const right = 'SELECT s1.nr_matricol, s2.nr_matricol FROM studenti s1, studenti s2 WHERE s1.an = s2.an AND s1.nr_matricol < s2.nr_matricol'
    const wrong = 'SELECT s1.nr_matricol, s2.nr_matricol FROM studenti s1, studenti s2 WHERE s1.an = s2.an AND s1.nume < s2.nume'
    expect(await mistakeOf(wrong, right)).toBe('self-pair-name')
  })

  it('minus-name-collapse: MINUS on names merges the homonyms', async () => {
    const right = "SELECT nume FROM studenti WHERE nr_matricol <> '119'"
    const wrong = "SELECT nume FROM studenti MINUS SELECT nume FROM studenti WHERE nr_matricol = '119'"
    expect(await mistakeOf(wrong, right)).toBe('minus-name-collapse')
  })

  it('and-or: OR and AND mixed without parentheses', async () => {
    const right = 'SELECT nume FROM studenti WHERE (an = 1 OR an = 2) AND bursa IS NOT NULL'
    const wrong = 'SELECT nume FROM studenti WHERE an = 1 OR an = 2 AND bursa IS NOT NULL'
    expect(await mistakeOf(wrong, right)).toBe('and-or')
  })

  it('dml-no-where: UPDATE and DELETE on every row', () => {
    const spec = { order: 'any', mode: 'bag', kind: 'state', tables: ['studenti'] }
    for (const sql of ['UPDATE studenti SET bursa = 0', 'DELETE FROM note', 'delete studenti']) {
      expect(detectMistake({ sql, actual: {}, expected: {}, spec })).toBe('dml-no-where')
    }
    expect(detectMistake({ sql: "UPDATE studenti SET bursa = 0 WHERE nr_matricol = '111'", actual: {}, expected: {}, spec })).toBeNull()
    expect(detectMistake({ sql: "UPDATE studenti SET bursa = 0 -- WHERE x", actual: {}, expected: {}, spec })).toBe('dml-no-where')
  })

  it('distinct-first-col: DISTINCT over several columns', async () => {
    expect(await mistakeOf('SELECT DISTINCT an, grupa FROM studenti', 'SELECT DISTINCT an FROM studenti')).toBe('distinct-first-col')
  })

  it('case-literal: a text in the wrong case', async () => {
    const right = "SELECT nume, prenume FROM studenti WHERE prenume = 'Ioana'"
    expect(await mistakeOf("SELECT nume, prenume FROM studenti WHERE prenume = 'ioana'", right)).toBe('case-literal')
    expect(await mistakeOf("SELECT nume, prenume FROM studenti WHERE prenume = 'Ioana' AND an = 1", right)).toBeNull()
  })

  it('names nothing for a right answer or an unrelated wrong one', async () => {
    const right = 'SELECT nume FROM studenti WHERE bursa IS NULL'
    expect(await mistakeOf(right, right)).toBeNull()
    expect(await mistakeOf('SELECT nume FROM studenti WHERE bursa < 300', right)).toBeNull()
    expect(await mistakeOf('SELECT nume FROM studenti WHERE an = 1', 'SELECT nume FROM studenti WHERE an = 2')).toBeNull()
  })

  it('does not call an UPDATE ... SET x = NULL an eq-null', () => {
    expect(detectMistake({
      sql: "UPDATE studenti SET bursa = NULL WHERE nr_matricol = '111'",
      actual: rows(['A'], ['1']), expected: exp(['A'], ['2']), spec: ANY,
    })).toBeNull()
  })
})

describe('runWithProbe', () => {
  it('adds the four-digit-year rows to a result with DATE cells and leaves the session as it was', async () => {
    const engine = await createEngine(new PGlite(), { clock: '2026-10-26 14:30:00', datasets: { facultate: datasetText('facultate') } })
    const r = await runWithProbe(engine, "SELECT nume, data_nastere FROM studenti WHERE nr_matricol = '111'", { dataset: 'facultate' })
    expect(r.rows).toEqual([['Popescu', '17-FEB-95']])
    expect(r.probe).toEqual([['Popescu', ' 1995-02-17']])
    const after = await engine.run("SELECT data_nastere FROM studenti WHERE nr_matricol = '111'", { dataset: 'facultate' })
    expect(after.rows).toEqual([['17-FEB-95']])
    const plain = await runWithProbe(engine, 'SELECT nume FROM studenti WHERE nr_matricol = \'111\'', { dataset: 'facultate' })
    expect(plain.probe).toBeUndefined()
  })
})
