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
    it('aliasCase compares a listed alias letter for letter ("Astazi" is not ASTAZI)', () => {
      const e = exp(['Astazi'], ['x'])
      const spec = { ...ANY, aliases: ['Astazi'], aliasCase: true }
      expect(checkResult(rows(['Astazi'], ['x']), e, spec).ok).toBe(true)
      expect(checkResult(rows(['ASTAZI'], ['x']), e, spec)).toMatchObject({ ok: false, kind: 'alias' })
      expect(checkResult(rows(['ASTAZI'], ['x']), e, { ...ANY, aliases: ['Astazi'] }).ok).toBe(true)
    })

    it('aliasesDiffer refuses a header equal to the column it came from', () => {
      const e = exp(['F', 'P'], ['1', '2'])
      const spec = { ...ANY, aliases: 'any-distinct', aliasesDiffer: ['nume', 'prenume'] }
      expect(checkResult(rows(['NUME', 'P'], ['1', '2']), e, spec)).toMatchObject({ ok: false, kind: 'alias' })
      expect(checkResult(rows(['F', 'P'], ['1', '2']), e, spec).ok).toBe(true)
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
      expect(checkResult(wrongCentury, e, ANY)).toMatchObject({ ok: false, kind: 'century', missing: [['17-FEB-95']], extra: [['17-FEB-95']] })
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
    it('reports an error the strictness pass marked as another dialect as not-oracle, whatever its code', () => {
      for (const code of ['ORA-00920', 'ORA-00923', 'ORA-00928', 'ORA-00933']) {
        const r = failed(code)
        r.error.dialect = true
        expect(checkResult(r, expected, ANY)).toMatchObject({ ok: false, kind: 'not-oracle', code })
      }
    })
    it('keeps an unmarked ORA-00900 / 00923 as an Oracle error with its own explanation', () => {
      for (const code of ['ORA-00900', 'ORA-00923']) {
        expect(checkResult(failed(code), expected, ANY)).toMatchObject({ ok: false, kind: 'error', code })
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
    const kinds = ['correct', 'rows', 'rowcount', 'order', 'columns', 'alias', 'century', 'error', 'not-oracle', 'structure', 'contents']
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
  }, 60000)
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

  it('inner-vs-left is not named for a filter mistake on a join', async () => {
    const base = 'SELECT s.nume, n.valoare FROM studenti s JOIN note n ON n.nr_matricol = s.nr_matricol'
    expect(await mistakeOf(`${base} WHERE n.valoare > 9`, `${base} WHERE n.valoare >= 9`)).toBeNull()
    expect(await mistakeOf(`${base} WHERE s.prenume = 'ioana'`, `${base} WHERE s.prenume = 'Ioana'`)).toBe('case-literal')
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

describe('not-oracle comes from the strictness pass, not from the error code', () => {
  let engine
  beforeAll(async () => {
    engine = await createEngine(new PGlite(), { clock: '2026-10-26 14:30:00', datasets: { facultate: datasetText('facultate') } })
  }, 60000)
  const verdictOf = async (sql) => checkResult(await engine.run(sql, { dataset: 'facultate' }), { columns: ['NUME'], rows: [] }, ANY)

  it('names LIMIT, FETCH FIRST, ILIKE, :: and TOP as another dialect', async () => {
    for (const sql of [
      'SELECT nume FROM studenti LIMIT 5',
      'SELECT nume FROM studenti FETCH FIRST 1 ROWS ONLY',
      "SELECT nume FROM studenti WHERE nume ILIKE 'p%'",
      'SELECT an::text FROM studenti',
      'SELECT TOP 2 nume FROM studenti',
    ]) expect(await verdictOf(sql), sql).toMatchObject({ kind: 'not-oracle' })
  })

  it('leaves plain typos with their own Oracle error', async () => {
    for (const sql of [
      'SELECT nume prenume an FROM studenti',
      "SELECT 'Azi este ' TO_CHAR(SYSDATE, 'month') FROM dual",
      'SELECT nume FORM studenti',
      'BEGIN NULL; END',
    ]) expect((await verdictOf(sql)).kind, sql).toBe('error')
  })
})

describe('checkResult: a frozen answer with `describe` grades the table definition (lab 1 ex 1)', () => {
  const spec = { order: 'any', mode: 'bag', kind: 'state', tables: ['studenti'] }
  const col = (name, type, nullable = true) => ({ name, type, nullable })
  const expected = { STUDENTI: { ...exp(['NR', 'NUME']), describe: [col('NR', 'CHAR(6)', false), col('NUME', 'VARCHAR2(10)')] } }
  const actual = (describe) => ({ STUDENTI: { ...rows(['NR', 'NUME']), describe } })

  it('accepts the same types and NOT NULL', () => {
    expect(checkResult(actual([col('NR', 'CHAR(6)', false), col('NUME', 'VARCHAR2(10)')]), expected, spec).ok).toBe(true)
  })
  it('rejects another length, another type, a missing or an extra NOT NULL', () => {
    for (const d of [
      [col('NR', 'CHAR(6)', false), col('NUME', 'VARCHAR2(50)')],
      [col('NR', 'VARCHAR2(6)', false), col('NUME', 'VARCHAR2(10)')],
      [col('NR', 'CHAR(6)'), col('NUME', 'VARCHAR2(10)')],
      [col('NR', 'CHAR(6)', false), col('NUME', 'VARCHAR2(10)', false)],
    ]) expect(checkResult(actual(d), expected, spec)).toMatchObject({ ok: false, kind: 'structure', table: 'STUDENTI' })
  })
  it('does not look at types when the frozen answer has none', () => {
    const plain = { STUDENTI: exp(['NR', 'NUME']) }
    expect(checkResult(actual([col('NR', 'DATE')]), plain, spec).ok).toBe(true)
  })

  it('the official CREATE TABLE answer passes on the engine; the page\'s own VARCHAR2(10) title and an all-VARCHAR2(50) version do not', async () => {
    const fs = await import('node:fs')
    const lesson = JSON.parse(fs.readFileSync(new URL('../../src/content/bd/courses/lesson-01a.json', import.meta.url), 'utf8'))
    let item
    const walk = (o) => { if (o && typeof o === 'object') { if (o.id === 'bd-l01a-ex-1-1') item = o; Object.values(o).forEach(walk) } }
    walk(lesson)
    const frozen = JSON.parse(fs.readFileSync(new URL('../../public/sql/expected/bd-l01a-ex-1-1.facultate.json', import.meta.url), 'utf8'))
    const engine = await createEngine(new PGlite(), { clock: '2026-10-26 14:30:00', datasets: { facultate: datasetText('facultate') } })
    const grade = async (sql) => {
      await engine.run(sql, { dataset: 'facultate', script: true })
      return checkResult(await engine.snapshot({ dataset: 'facultate', tables: item.check.tables }), frozen, { ...item.check, kind: 'state' })
    }
    expect(item.check.structure).toBe(true)
    expect((await grade(item.solution)).ok).toBe(true)
    expect(await grade(item.solution.replace('VARCHAR2(15)', 'VARCHAR2(10)'))).toMatchObject({ ok: false, kind: 'structure', table: 'CURSURI' })
    expect(await grade(item.solution.replace(/VARCHAR2\(\d+\)/g, 'VARCHAR2(50)').replace(/NOT NULL/g, ''))).toMatchObject({ ok: false, kind: 'structure' })
    expect(await grade(item.solution.replace('nr_matricol CHAR(6) NOT NULL', 'nr_matricol CHAR(6)'))).toMatchObject({ ok: false, kind: 'structure', table: 'STUDENTI' })
  }, 60000)
})

// ---- final fix wave: the checker and the named mistakes --------------------------------------------------------------
describe('cosmetic trim (CHAR(n) padding the learner may cut)', () => {
  const e = exp(['NUME', 'PRENUME'], ['Buraga    ', 'Sabin     '])
  const spec = { ...ANY, cosmetic: ['trim', 'trim'] }
  it('accepts the trimmed text and the padded one', () => {
    expect(checkResult(rows(['NUME', 'PRENUME'], ['Buraga', 'Sabin']), e, spec).ok).toBe(true)
    expect(checkResult(rows(['NUME', 'PRENUME'], ['Buraga    ', 'Sabin     ']), e, spec).ok).toBe(true)
  })
  it('keeps case and leading blanks significant', () => {
    expect(checkResult(rows(['NUME', 'PRENUME'], ['BURAGA', 'Sabin']), e, spec)).toMatchObject({ ok: false, kind: 'rows' })
    expect(checkResult(rows(['NUME', 'PRENUME'], [' Buraga', 'Sabin']), e, spec).ok).toBe(false)
  })
  it('leaves the columns marked "" exact', () => {
    expect(checkResult(rows(['NUME', 'PRENUME'], ['Buraga', 'Sabin']), e, { ...ANY, cosmetic: ['', 'trim'] }).ok).toBe(false)
  })
})

describe('aliasesDiffer is case-sensitive against the header Oracle shows without an alias', () => {
  const e = exp(['A', 'B'], ['1', 'x'])
  const spec = { ...ANY, aliasesDiffer: ['nume', 'prenume'] }
  it('accepts a quoted mixed-case alias ("Nume" is not NUME)', () => {
    expect(checkResult(rows(['Nume', 'Prenume'], ['1', 'x']), e, spec).ok).toBe(true)
  })
  it('still names an alias equal to the column (nume AS nume, "NUME")', () => {
    expect(checkResult(rows(['NUME', 'PRENUMESTUD'], ['1', 'x']), e, spec)).toMatchObject({ ok: false, kind: 'alias' })
    expect(checkResult(rows(['FAMILIE', 'PRENUME'], ['1', 'x']), e, spec)).toMatchObject({ ok: false, kind: 'alias' })
  })
})

describe('century: only the four-digit years differ', () => {
  const e = { ...exp(['NUME', 'D'], ['Popescu', '17-FEB-95'], ['Arhire', '26-DEC-95']), probe: [['Popescu', ' 1995-02-17'], ['Arhire', ' 1995-12-26']] }
  it('gives the century verdict with the rows as displayed, not the probe rows', () => {
    const a = { ...rows(['NUME', 'D'], ['Popescu', '17-FEB-95'], ['Arhire', '26-DEC-95']), probe: [['Popescu', ' 2095-02-17'], ['Arhire', ' 1995-12-26']] }
    const v = checkResult(a, e, ANY)
    expect(v).toMatchObject({ ok: false, kind: 'century', missing: [['Popescu', '17-FEB-95']], extra: [['Popescu', '17-FEB-95']] })
    expect(JSON.stringify(v)).not.toContain('2095')
    expect(JSON.stringify(v)).not.toContain('1995-')
  })
  it('explains that the dates print the same but the full years differ', () => {
    const t = explainVerdict({ ok: false, kind: 'century', missing: [['a']], extra: [['a']] })
    expect(t.ro).toMatch(/DD-MON-RR/)
    expect(t.ro).toMatch(/TO_CHAR/)
    expect(t.en).toMatch(/full year/i)
  })
  it('a row that really differs is still a rows verdict', () => {
    const a = { ...rows(['NUME', 'D'], ['Popescu', '17-FEB-95'], ['Bodnar', '26-DEC-95']), probe: [['Popescu', ' 1995-02-17'], ['Bodnar', ' 1995-12-26']] }
    expect(checkResult(a, e, ANY).kind).toBe('rows')
  })
})

describe('runWithProbe drops a probe that changes the row count', () => {
  it('a WHERE on the date text finds other rows under SYYYY-MM-DD: the probe is dropped and the answer passes', async () => {
    const engine = await createEngine(new PGlite(), { clock: '2026-10-26 14:30:00', datasets: { facultate: datasetText('facultate') } })
    const sql = "SELECT nume, data_nastere FROM studenti WHERE data_nastere LIKE '%FEB%'"
    const r = await runWithProbe(engine, sql, { dataset: 'facultate' })
    expect(r.rows.length).toBeGreaterThan(0)
    expect(r.probe).toBeUndefined()
    const frozen = { columns: r.columns, rows: r.rows, probe: r.rows.map((row) => [row[0], ' 1995-02-17']) }
    expect(checkResult(r, frozen, ANY).ok).toBe(true)
  }, 60000)
})

describe('explainVerdict contents drops zero counts', () => {
  it('names only the counts that are not zero', () => {
    const t = explainVerdict({ kind: 'contents', table: 'NOTE', missing: [], extra: [['1']] })
    expect(t.ro).not.toMatch(/\b0 rânduri/)
    expect(t.en).not.toMatch(/\b0 expected/)
    expect(t.en).toContain('1 extra row')
    const u = explainVerdict({ kind: 'contents', table: 'NOTE', missing: [['1'], ['2']], extra: [] })
    expect(u.en).toContain('2 expected rows are missing')
    expect(u.en).not.toMatch(/\b0 extra/)
  })
})

describe('char-trim is named only when the learner kept blanks the answer does not have', () => {
  it('learner padded, expected trimmed: char-trim', () => {
    const v = detectMistake({ sql: 'SELECT nume FROM profesori', actual: rows(['NUME'], ['Buraga    ']), expected: exp(['NUME'], ['Buraga']), spec: ANY })
    expect(v).toBe('char-trim')
  })
  it('learner trimmed, expected padded: no named mistake (TRIM is not the fix)', () => {
    const v = detectMistake({ sql: 'SELECT TRIM(nume) FROM profesori', actual: rows(['NUME'], ['Buraga']), expected: exp(['NUME'], ['Buraga    ']), spec: ANY })
    expect(v).toBeNull()
  })
})

describe('named-mistake detectors fire on their own signature only', () => {
  let engine
  beforeAll(async () => {
    engine = await createEngine(new PGlite(), { clock: '2026-10-26 14:30:00', datasets: { facultate: datasetText('facultate') } })
  }, 60000)
  const run = (sql) => engine.run(sql, { dataset: 'facultate' })
  const mistakeOf = async (wrong, right, spec = ANY) => {
    const e = await run(right)
    return detectMistake({ sql: wrong, actual: await run(wrong), expected: { columns: e.columns, rows: e.rows }, spec })
  }

  it('minus-name-collapse needs a name column with repeated values in the answer', async () => {
    // ids are unique: nothing to collapse, even though MINUS returns fewer rows
    expect(await mistakeOf('SELECT id_curs FROM cursuri MINUS SELECT id_curs FROM note', 'SELECT id_curs FROM cursuri')).not.toBe('minus-name-collapse')
    expect(await mistakeOf("SELECT nume FROM studenti MINUS SELECT nume FROM studenti WHERE nr_matricol = '119'", "SELECT nume FROM studenti WHERE nr_matricol <> '119'")).toBe('minus-name-collapse')
  })

  it('and-or skips the AND of BETWEEN ... AND', async () => {
    expect(await mistakeOf('SELECT nume FROM studenti WHERE an BETWEEN 1 AND 2 OR bursa > 400', 'SELECT nume FROM studenti WHERE an BETWEEN 1 AND 3 OR bursa > 400')).not.toBe('and-or')
    expect(await mistakeOf('SELECT nume FROM studenti WHERE an = 1 OR an = 2 AND bursa IS NOT NULL', 'SELECT nume FROM studenti WHERE (an = 1 OR an = 2) AND bursa IS NOT NULL')).toBe('and-or')
  })

  it('dml-no-where looks at every statement of the script', () => {
    const spec = { order: 'any', mode: 'bag', kind: 'state', tables: ['note'] }
    expect(detectMistake({ sql: "INSERT INTO note VALUES ('111', 21, 10, SYSDATE);\nDELETE FROM note", actual: {}, expected: {}, spec })).toBe('dml-no-where')
    expect(detectMistake({ sql: "INSERT INTO note VALUES ('111', 21, 10, SYSDATE);\nDELETE FROM note WHERE id_curs = 21", actual: {}, expected: {}, spec })).toBeNull()
    expect(detectMistake({ sql: "UPDATE studenti SET bursa = 1 WHERE an = 1;\nUPDATE studenti SET bursa = 2", actual: {}, expected: {}, spec })).toBe('dml-no-where')
  })

  it('inner-vs-left only when the NULLs of the missing rows sit in columns of the outer (right-hand) table', () => {
    const wrong = 'SELECT s.nume, n.valoare FROM studenti s JOIN note n ON n.nr_matricol = s.nr_matricol'
    // the NULL is in n.valoare (the table the LEFT JOIN would pad): named
    expect(detectMistake({ sql: wrong, actual: rows(['NUME', 'VALOARE'], ['Pop', '9']), expected: exp(['NUME', 'VALOARE'], ['Pop', '9'], ['Ion', null]), spec: ANY })).toBe('inner-vs-left')
    // the NULL is in s.nume, a column of the kept (left-hand) table: an outer join would not produce it
    expect(detectMistake({ sql: wrong, actual: rows(['NUME', 'VALOARE'], ['Pop', '9']), expected: exp(['NUME', 'VALOARE'], ['Pop', '9'], [null, '7']), spec: ANY })).toBeNull()
  })
})
