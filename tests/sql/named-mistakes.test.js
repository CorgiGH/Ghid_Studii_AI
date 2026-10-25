// Every sql-exercise has a named classic mistake (scripts/sql/named-mistakes.json) that the checker really catches, on the lab
// dataset and on the hidden one. A "trap" entry is a mistake the lab data cannot show (the wrong query happens to give the same
// rows there): the hidden dataset must catch it.
import { describe, expect, it } from 'vitest'
import { collectExercises, DEFAULT_CONTENT_DIR, engineCache } from '../../scripts/sql/freeze-lib.mjs'
import { gradeMistake, loadNamedMistakes } from '../../scripts/sql/mistakes-lib.mjs'

const items = collectExercises(DEFAULT_CONTENT_DIR).filter((i) => i.id.startsWith('bd-l'))
const named = loadNamedMistakes()
const caught = (k) => k !== 'correct' && k !== 'error'
const engineFor = engineCache()

describe('named mistakes', () => {
  it('lists exactly the exercises of the lessons', () => {
    expect(Object.keys(named).sort()).toEqual(items.map((i) => i.id).sort())
  })

  it('the hidden dataset can catch what the lab data cannot (lab 2 ex 8 and ex 11)', () => {
    expect(named['bd-l08-ex-2-8'].some((m) => m.trap)).toBe(true)
    expect(named['bd-l06-ex-2-11'].some((m) => m.trap)).toBe(true)
  })

  // the mistake each exercise's own hint names, with the verdict the checker must give on the lab data and on the hidden variant
  const hintNamed = {
    'bd-l13-ex-3-1': ['alias', 'alias'], // unquoted alias: ASTAZI is not "Astazi"
    'bd-l09-ex-x1': ['rowcount', 'rowcount'], // UNION ALL keeps the shared surname twice
    'bd-l02-ex-2-3': ['alias', 'alias'], // an alias equal to the column name renames nothing
    'bd-l16-ex-3-12': ['correct', 'rows'], // a hand-typed date: right on the exercise's own clock, wrong on the second one
  }
  it.each(Object.entries(hintNamed))('%s: its hint-named mistake is listed first and is graded as the hint says', async (id, [lab, hid]) => {
    const item = items.find((i) => i.id === id)
    const first = named[id][0]
    expect(first.name).toMatch(/\(hint 3/)
    const g = await gradeMistake(item, first, engineFor)
    expect([g.visible, g.hidden]).toEqual([lab, hid])
  }, 60000)

  describe.each(items.map((i) => [i.id, i]))('%s', (id, item) => {
    it('has a named mistake that neither dataset grades as correct', async () => {
      const mistakes = named[id].filter((m) => !m.trap)
      expect(mistakes.length).toBeGreaterThan(0)
      for (const m of mistakes) {
        expect(m.name.length).toBeGreaterThan(8)
        const g = await gradeMistake(item, m, engineFor)
        expect(g, `${m.name}: ${m.sql}`).toSatisfy((x) => caught(x.visible) && caught(x.hidden))
      }
    }, 60000)

    it('catches its dataset traps on the hidden dataset', async () => {
      for (const m of named[id].filter((x) => x.trap)) {
        const g = await gradeMistake(item, m, engineFor)
        expect(caught(g.hidden), `${m.name}: hidden gave ${g.hidden}`).toBe(true)
      }
    }, 60000)
  })
})
