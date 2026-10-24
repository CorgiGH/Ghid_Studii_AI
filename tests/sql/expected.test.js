// The datasets and the Oracle-frozen expected answers (Task 7).
//   - the four dataset files load, with the same schema in each pair and the properties the hidden copies are made for
//   - every sql-exercise / sql question in the lesson content has an expected file for both datasets of its pair, and the
//     engine reproduces it exactly. The content (src/content/bd) is checked when it exists; the fixture content under
//     tests/sql/fixtures is always checked, with answers frozen from Oracle by scripts/sql/freeze-expected.mjs.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PGlite } from '@electric-sql/pglite'
import { beforeAll, describe, expect, it } from 'vitest'
import { createEngine } from '../../src/sql/engine/core.js'
import {
  DEFAULT_CLOCK, DEFAULT_CONTENT_DIR, DEFAULT_EXPECTED_DIR, collectExercises, datasetPair, datasetText, engineCache, engineDifference,
  expectedFile,
} from '../../scripts/sql/freeze-lib.mjs'
import { oracleSchemaFor, pgToOracle } from '../../scripts/sql/oracle-datasets.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const FIXTURES = path.join(here, 'fixtures')

describe('datasets', () => {
  const TABLES = {
    facultate: ['studenti', 'cursuri', 'note', 'profesori', 'didactic'],
    biblioteca: ['cititori', 'carti', 'autori', 'scris', 'imprumuturi'],
  }
  const engines = {}
  beforeAll(async () => {
    for (const name of ['facultate', 'facultate-hidden', 'biblioteca', 'biblioteca-hidden']) {
      engines[name] = await createEngine(new PGlite(), { clock: DEFAULT_CLOCK, datasets: { [name]: datasetText(name) } })
    }
  }, 120000)
  const q = async (name, sql) => {
    const r = await engines[name].run(sql, { dataset: name })
    expect(r.error, sql).toBeUndefined()
    return r.rows
  }

  for (const base of ['facultate', 'biblioteca']) {
    it(`${base} and ${base}-hidden have the same schema and different rows`, async () => {
      for (const t of TABLES[base]) {
        const a = await engines[base].describe(t, { dataset: base })
        const b = await engines[`${base}-hidden`].describe(t, { dataset: `${base}-hidden` })
        expect(a.length, t).toBeGreaterThan(1)
        expect(b, t).toEqual(a)
        const ra = await q(base, `SELECT * FROM ${t}`)
        const rb = await q(`${base}-hidden`, `SELECT * FROM ${t}`)
        expect(JSON.stringify(rb), t).not.toBe(JSON.stringify(ra))
      }
    })
  }

  it('facultate-hidden: same-name students, NULLs elsewhere, no-grade student, course without professor', async () => {
    const h = 'facultate-hidden'
    expect((await q(h, 'SELECT COUNT(*) FROM studenti'))[0][0]).toBe('13')
    // a surname shared by two students, and a full name shared by two students
    expect((await q(h, 'SELECT nume FROM studenti GROUP BY nume HAVING COUNT(*) > 1 ORDER BY nume')).length).toBeGreaterThanOrEqual(2)
    expect((await q(h, 'SELECT nume, prenume FROM studenti GROUP BY nume, prenume HAVING COUNT(*) > 1')).length).toBe(1)
    // a student in a year above 1 with no grade, a course with no professor
    expect((await q(h, 'SELECT nr_matricol FROM studenti WHERE an > 1 AND nr_matricol NOT IN (SELECT nr_matricol FROM note)')).length).toBe(1)
    expect((await q(h, 'SELECT id_curs FROM cursuri WHERE id_curs NOT IN (SELECT id_curs FROM didactic) ORDER BY id_curs')).map((r) => r[0].trim())).toEqual(['26', '29'])
    // NULLs in places the lab data has none
    expect((await q(h, 'SELECT COUNT(*) FROM studenti WHERE grupa IS NULL OR data_nastere IS NULL'))[0][0]).toBe('2')
    expect((await q(h, 'SELECT COUNT(*) FROM cursuri WHERE semestru IS NULL'))[0][0]).toBe('1')
    // birthdays fall on more than the weekdays of the lab data
    const days = (name) => q(name, "SELECT DISTINCT TO_CHAR(data_nastere, 'D') FROM studenti WHERE data_nastere IS NOT NULL")
    expect((await days(h)).length).toBeGreaterThan((await days('facultate')).length - 1)
    // the key literals the state exercises use are still there
    expect((await q(h, "SELECT COUNT(*) FROM studenti WHERE nr_matricol IN ('111', '113', '119', '123')"))[0][0]).toBe('4')
  })

  it('biblioteca-hidden: a pair of equal names, a reader and a book without loans, an author without a book', async () => {
    const h = 'biblioteca-hidden'
    expect((await q(h, 'SELECT nume, prenume FROM cititori GROUP BY nume, prenume HAVING COUNT(*) > 1')).length).toBe(1)
    expect((await q(h, 'SELECT id_cititor FROM cititori WHERE id_cititor NOT IN (SELECT id_cititor FROM imprumuturi)')).length).toBe(1)
    expect((await q(h, 'SELECT id_carte FROM carti WHERE id_carte NOT IN (SELECT id_carte FROM scris)')).length).toBe(1)
    expect((await q(h, 'SELECT id_autor FROM autori WHERE id_autor NOT IN (SELECT id_autor FROM scris)')).length).toBe(1)
    expect((await q(h, 'SELECT COUNT(*) FROM imprumuturi WHERE data_returnare IS NULL'))[0][0]).toBe('2')
  })

  it('biblioteca has the mock test shape: Ababei twice, c6 without loans, b8 without author, a7 without book', async () => {
    const b = 'biblioteca'
    expect((await q(b, "SELECT COUNT(*) FROM cititori WHERE nume = 'Ababei' AND prenume = 'Vlad'"))[0][0]).toBe('2')
    expect((await q(b, 'SELECT id_cititor FROM cititori WHERE id_cititor NOT IN (SELECT id_cititor FROM imprumuturi)')).map((r) => r[0].trim())).toEqual(['c6'])
    expect((await q(b, 'SELECT id_carte FROM carti WHERE id_carte NOT IN (SELECT id_carte FROM scris)')).map((r) => r[0].trim())).toEqual(['b8'])
    expect((await q(b, 'SELECT id_autor FROM autori WHERE id_autor NOT IN (SELECT id_autor FROM scris)')).map((r) => r[0].trim())).toEqual(['a7'])
  })

  it('converts the engine spelling to the Oracle spelling', () => {
    const o = pgToOracle(datasetText('biblioteca'))
    expect(o).toContain('nume VARCHAR2(10)')
    expect(o).toContain('taxa NUMBER(5,2)')
    expect(o).toContain('an_aparitie NUMBER(4)')
    expect(o).toContain('data_inscriere DATE')
    expect(o).not.toMatch(/ora_date|numeric|varchar\(/i)
    expect(oracleSchemaFor('facultate-hidden')).toBe('FZ_FACULTATE_HIDDEN')
    expect(() => oracleSchemaFor('x; DROP USER y')).toThrow()
  })
})

// Every graded item of a content tree has an expected file per dataset of its pair, and the engine reproduces it.
function frozenAnswers(label, contentDir, expectedDir, { needContent }) {
  describe(label, () => {
    const items = collectExercises(contentDir)
    const engineFor = engineCache()

    if (needContent) {
      it('has graded items', () => {
        expect(items.length).toBeGreaterThan(5)
        expect(new Set(items.map((i) => i.kind))).toEqual(new Set(['query', 'state']))
        expect(items.some((i) => i.clock)).toBe(true)
      })
    }

    it('has an expected file for both datasets of every item', () => {
      const missing = []
      for (const item of items) {
        for (const dataset of datasetPair(item.dataset)) {
          if (!fs.existsSync(expectedFile(expectedDir, item.id, dataset))) missing.push(`${item.id}.${dataset}.json`)
        }
      }
      expect(missing).toEqual([])
    })

    it('has no expected file without an item', () => {
      if (!fs.existsSync(expectedDir)) return
      const wanted = new Set(items.flatMap((i) => datasetPair(i.dataset).map((d) => `${i.id}.${d}.json`)))
      const stray = fs.readdirSync(expectedDir).filter((f) => f.endsWith('.json') && !wanted.has(f))
      expect(stray).toEqual([])
    })

    for (const item of items) {
      for (const dataset of datasetPair(item.dataset)) {
        const file = expectedFile(expectedDir, item.id, dataset)
        it(`engine reproduces ${item.id} on ${dataset}`, async () => {
          if (!fs.existsSync(file)) return // reported by the test above
          const expected = JSON.parse(fs.readFileSync(file, 'utf8'))
          expect(await engineDifference(item, dataset, expected, engineFor)).toBeNull()
        })
      }
    }
  })
}

describe('engineDifference', () => {
  it('reports an expected answer the engine does not reproduce', async () => {
    const item = { id: 'x', dataset: 'facultate', kind: 'query', solution: 'SELECT DISTINCT an FROM studenti', check: { order: 'any', mode: 'bag' } }
    const good = JSON.parse(fs.readFileSync(expectedFile(path.join(FIXTURES, 'expected'), 'fx-alt', 'facultate'), 'utf8'))
    const engineFor = engineCache()
    expect(await engineDifference(item, 'facultate', good, engineFor)).toBeNull()
    const bad = { ...good, rows: [...good.rows.slice(1), ['9']] }
    expect(await engineDifference(item, 'facultate', bad, engineFor)).toMatch(/^rows: missing/)
    expect(await engineDifference({ ...item, solution: 'SELECT nope FROM studenti' }, 'facultate', good, engineFor)).toMatch(/ORA-00904/)
  })
})

frozenAnswers('fixture exercises', path.join(FIXTURES, 'content'), path.join(FIXTURES, 'expected'), { needContent: true })
frozenAnswers('lesson content', DEFAULT_CONTENT_DIR, DEFAULT_EXPECTED_DIR, { needContent: false })
