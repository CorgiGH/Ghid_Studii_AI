import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PGlite } from '@electric-sql/pglite'
import { beforeAll, describe, expect, it } from 'vitest'
import { createEngine } from '../../src/sql/engine/core.js'
import { planStages } from '../../src/sql/machine.js'
import { allPredictionsChecked, buildSteps, chipStep, predictKind, settled, sumChecks, viewAt } from '../../src/sql/machineView.js'
import { validateQueryMachine } from '../../src/sql/machineSpec.js'
import { isGatingBlock, isGatingScreen } from '../../src/components/lesson/playerLogic.js'
import { blockLoaders } from '../../src/components/blocks/registry.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const facultate = fs.readFileSync(path.join(here, '..', '..', 'public', 'sql', 'datasets', 'facultate.sql'), 'utf8')
const blocks = JSON.parse(fs.readFileSync(path.join(here, 'fixtures', 'query-machine-blocks.json'), 'utf8'))
const byId = Object.fromEntries(blocks.map((b) => [b.id, b]))
let engine
beforeAll(async () => {
  engine = await createEngine(new PGlite(), { clock: '2026-10-26 14:30:00', datasets: { facultate } })
})
const planOf = async (b) => (await planStages(b.sql, b.stages, engine, { dataset: b.dataset, show: b.show })).map((p, i) => ({ ...p, predict: !!b.stages[i].predict }))

describe('block spec', () => {
  it('accepts all 27 staged blocks', () => {
    for (const b of blocks) expect(validateQueryMachine(b), b.id).toEqual([])
  })
  it('rejects a bad clause, a stage the query does not have, a missing say and a predict that cannot be asked', () => {
    const ok = byId['bd-l04-qm1']
    expect(validateQueryMachine({ ...ok, stages: [{ clause: 'having' }] })).not.toEqual([])
    expect(validateQueryMachine({ ...ok, stages: [{ clause: 'from' }, { clause: 'order' }] }).join()).toMatch(/no such clause/)
    expect(validateQueryMachine({ ...ok, say: { from: ok.say.from } }).join()).toMatch(/no say text/)
    expect(validateQueryMachine({ ...ok, stages: [{ clause: 'select', predict: true }] }).join()).toMatch(/cannot ask/)
    expect(validateQueryMachine({ ...ok, say: { ...ok.say, from: { en: 'x' } } }).join()).toMatch(/en and ro/)
    expect(validateQueryMachine({ ...ok, ask: { select: { en: 'a', ro: 'b' } } }).join()).toMatch(/predicted stage/)
    expect(validateQueryMachine({ ...ok, show: [] }).join()).toMatch(/show/)
    const left = byId['bd-l20-qm1']
    expect(validateQueryMachine({ ...left, stages: [{ clause: 'from' }, { clause: 'join', predict: true }, { clause: 'where' }] }).join()).toMatch(/inner JOIN/)
    expect(validateQueryMachine({ ...left, stages: [{ clause: 'from' }, { clause: 'join' }, { clause: 'where', predict: true }] })).toEqual([])
  })
})

describe('block spec: every clause of the SQL has a stage', () => {
  const ok = byId['bd-l04-qm1']
  it('names the missing stage for WHERE, ORDER BY, DISTINCT, JOIN and a set operator', () => {
    const sql = (q, stages, say = {}) => validateQueryMachine({ ...ok, sql: q, stages, say: { from: ok.say.from, ...say } })
    const bi = { en: 'x', ro: 'y' }
    expect(sql('SELECT nume FROM studenti WHERE an = 1 ORDER BY nume', [{ clause: 'from' }, { clause: 'order' }], { order: bi }).join()).toMatch(/has WHERE but no "where" stage/)
    expect(sql('SELECT nume FROM studenti WHERE an = 1 ORDER BY nume', [{ clause: 'from' }, { clause: 'where' }], { where: bi }).join()).toMatch(/has ORDER but no "order" stage/)
    expect(sql('SELECT DISTINCT an FROM studenti', [{ clause: 'from' }, { clause: 'select' }], { select: bi }).join()).toMatch(/has DISTINCT but no "distinct" stage/)
    expect(sql('SELECT nume FROM studenti s JOIN note n ON n.nr_matricol = s.nr_matricol', [{ clause: 'from' }], {}).join()).toMatch(/has JOIN but no "join" stage/)
    expect(sql('SELECT nume FROM studenti MINUS SELECT nume FROM studenti WHERE an = 1', [{ clause: 'from' }, { clause: 'where' }], { where: bi }).join()).toMatch(/has MINUS but no "minus" stage/)
    expect(sql('SELECT nume FROM studenti UNION SELECT nume FROM studenti ORDER BY 1', [{ clause: 'from' }, { clause: 'union' }], { union: bi }).join()).toMatch(/ORDER BY after a set operator/)
  })
  it('accepts the lists wording of a set operator only for a set operator stage', () => {
    const m = byId['bd-l23-qm']
    const lists = { en: 'two lists', ro: 'două liste' }
    expect(validateQueryMachine({ ...m, say: { ...m.say, 'minus:lists': lists } })).toEqual([])
    expect(validateQueryMachine({ ...m, say: { ...m.say, 'where:lists': lists } }).join()).toMatch(/not a clause/)
    expect(validateQueryMachine({ ...m, say: { ...m.say, 'minus:lists': { en: 'x' } } }).join()).toMatch(/en and ro/)
  })
})

describe('the gate and the score', () => {
  it('the gate opens only when every predicted stage is checked', () => {
    const flags = [false, true, false, true]
    expect(allPredictionsChecked(flags, {})).toBe(false)
    expect(allPredictionsChecked(flags, { 1: { correct: 3, total: 4 } })).toBe(false)
    expect(allPredictionsChecked(flags, { 1: { correct: 3, total: 4 }, 3: { correct: 1, total: 1 } })).toBe(true)
    expect(allPredictionsChecked([false, false], {})).toBe(true)
  })
  it('one score for the block sums its predicted stages', () => {
    expect(sumChecks([false, true, true], { 1: { correct: 3, total: 4 }, 2: { correct: 5, total: 13 } })).toEqual({ correct: 8, total: 17 })
  })
  it('a set operator shows its result in the engine order', async () => {
    const m = { ...byId['bd-l23-qm'] }
    const plan = await planOf(m)
    const steps = buildSteps(plan)
    const last = plan.length - 1
    const shown = viewAt(plan, steps, steps.length - 1)
    expect(shown.panels.result.map((r) => r.key)).toEqual(plan[last].result)
    expect(settled(plan, last).rows.map((r) => r.key)).toEqual(plan[last].result)
  })
})

describe('gating and loading', () => {
  it('a query-machine block with a predicted stage gates its screen, one without does not', () => {
    expect(isGatingBlock(byId['bd-l04-qm1'])).toBe(true)
    expect(isGatingBlock(byId['bd-l01-qm1'])).toBe(false)
    expect(isGatingScreen({ blocks: [byId['bd-l02-qm3']] })).toBe(true)
    expect(isGatingScreen({ blocks: [byId['bd-l08-qm2']] })).toBe(false)
  })
  it('the block type is registered with a loader the player can preload', () => {
    expect(typeof blockLoaders['query-machine']).toBe('function')
  })
})

describe('steps and views', () => {
  it('a predicted stage has an ask step before its show step, a set operator has a lists step', async () => {
    const steps = buildSteps(await planOf(byId['bd-l04-qm1']))
    expect(steps.map((s) => `${s.stage}:${s.phase}`)).toEqual(['0:show', '1:ask', '1:show', '2:show'])
    const sets = buildSteps(await planOf(byId['bd-l23-qm']))
    expect(sets.map((s) => s.phase)).toEqual(['show', 'show', 'show', 'lists', 'show'])
    expect(predictKind('where')).toBe('rows')
    expect(predictKind('order')).toBe('order')
    expect(predictKind('distinct')).toBe('count')
    expect(predictKind('join')).toBe('rows')
  })

  it('ask shows the stage input untouched, show marks kept rows and holds the removed ones when predicted', async () => {
    const plan = await planOf(byId['bd-l04-qm1'])
    const steps = buildSteps(plan)
    const ask = viewAt(plan, steps, 1)
    expect(ask.ask.kind).toBe('rows')
    expect(ask.rows).toHaveLength(13)
    expect(ask.rows.every((r) => r.status === 'pickable')).toBe(true)
    const picks = plan[1].kept
    const shown = viewAt(plan, steps, 2, { 1: { picks } }, { 1: { correct: 13, total: 13 } })
    expect(shown.rows).toHaveLength(13)
    expect(shown.rows.filter((r) => r.status === 'kept')).toHaveLength(plan[1].kept.length)
    expect(shown.rows.every((r) => r.mark === true)).toBe(true)
    // the next stage starts from the survivors
    expect(viewAt(plan, steps, 3).rows).toHaveLength(plan[1].kept.length)
  })

  it('an unpredicted WHERE drops the removed rows at once', async () => {
    const b = { ...byId['bd-l04-qm1'], stages: [{ clause: 'from' }, { clause: 'where' }] }
    const plan = await planOf(b)
    const steps = buildSteps(plan)
    expect(viewAt(plan, steps, 1).rows).toHaveLength(plan[1].kept.length)
  })

  it('tri-state rows carry their truth value', async () => {
    const plan = await planOf(byId['bd-l05-qm2'])
    const steps = buildSteps(plan)
    const shown = viewAt(plan, steps, 2)
    expect(shown.rows.filter((r) => r.truth === 'U')).toHaveLength(8)
  })

  it('order: placed rows are numbered in ask, show lists the engine order with a mark per place', async () => {
    const plan = await planOf(byId['bd-l08-qm1'])
    const steps = buildSteps(plan)
    const ask = viewAt(plan, steps, 2, { 2: { placed: [plan[2].order[3], plan[2].order[0]] } })
    expect(ask.rows.find((r) => r.key === plan[2].order[3]).pickNo).toBe(1)
    expect(ask.rows.find((r) => r.key === plan[2].order[0]).pickNo).toBe(2)
    const shown = viewAt(plan, steps, 3, { 2: { placed: plan[2].order } }, { 2: { correct: 13, total: 13 } })
    expect(shown.rows.map((r) => r.key)).toEqual(plan[2].order)
    expect(shown.rows.every((r) => r.mark === true && r.pos > 0)).toBe(true)
  })

  it('distinct: representatives with counts that add up; settled carries columns', async () => {
    const d = await planOf(byId['bd-l02-qm3'])
    const shown = viewAt(d, buildSteps(d), 3, { 2: { value: '7' } }, { 2: { correct: 1, total: 1 } })
    expect(shown.rows).toHaveLength(7)
    expect(shown.rows.reduce((n, r) => n + r.count, 0)).toBe(13)
    expect(settled(d, 1).dimmed).toEqual(['nume'])
  })

  it('a predicted join asks for the surviving pairs by clicking, marks every pair, then goes on with the survivors', async () => {
    const b = byId['bd-l22-qm']
    const j = await planOf(b)
    const steps = buildSteps(j)
    expect(steps.map((s) => `${s.stage}:${s.phase}`)).toEqual(['0:show', '1:ask', '1:show', '2:show', '3:show'])
    const ask = viewAt(j, steps, 1, { 1: { picks: [j[1].kept[0]] } })
    expect(ask.ask.kind).toBe('rows')
    expect(ask.columns).toEqual(b.show)
    expect(ask.rows).toHaveLength(25)
    expect(ask.rows.every((r) => r.status === 'pickable')).toBe(true)
    expect(ask.rows.filter((r) => r.picked).map((r) => r.key)).toEqual([j[1].kept[0]])
    expect(ask.rows.every((r) => r.mark === undefined)).toBe(true)
    // one survivor missed: every other pair is right
    const picks = j[1].kept.slice(1)
    const shown = viewAt(j, steps, 2, { 1: { picks } }, { 1: { correct: 24, total: 25 } })
    expect(shown.rows).toHaveLength(25)
    expect(shown.rows.filter((r) => r.status === 'kept')).toHaveLength(9)
    expect(shown.rows.filter((r) => r.status === 'gone')).toHaveLength(16)
    expect(shown.rows.filter((r) => r.mark === false).map((r) => r.key)).toEqual([j[1].kept[0]])
    expect(shown.meta).toMatchObject({ from: 25, to: 9, score: { correct: 24, total: 25 } })
    expect(settled(j, 1).rows).toHaveLength(9)
    expect(viewAt(j, steps, 3).rows.map((r) => r.key)).toEqual(j[1].kept)
  })

  it('an unpredicted join shows its result rows, all of them standing', async () => {
    const plan = await planOf(byId['bd-l18-qm1'])
    const steps = buildSteps(plan)
    const join = viewAt(plan, steps, 1)
    expect(join.rows).toHaveLength(42)
    expect(join.meta).toMatchObject({ from: 13, to: 42, product: 546 })
    expect(settled(plan, 1).rows).toHaveLength(42)
  })

  it('set operator: lists first, then the result with the second list left alone for MINUS', async () => {
    const plan = await planOf(byId['bd-l23-qm'])
    const steps = buildSteps(plan)
    const lists = viewAt(plan, steps, 3)
    expect(lists.panels.result).toHaveLength(0)
    const shown = viewAt(plan, steps, 4)
    expect(shown.panels.result).toHaveLength(1)
    expect(shown.panels.right.every((r) => r.status === 'plain')).toBe(true)
    expect(shown.panels.left.filter((r) => r.moved)).toHaveLength(1)
  })
})

describe('clause chips never reveal an unanswered prediction', () => {
  it('jumps to the ask step until the stage is checked, then to the show step', () => {
    const steps = buildSteps([{ clause: 'from' }, { clause: 'where', predict: true }, { clause: 'order', predict: true }])
    expect(steps[chipStep(steps, 1, {})]).toEqual({ stage: 1, phase: 'ask' })
    expect(steps[chipStep(steps, 2, {})]).toEqual({ stage: 2, phase: 'ask' })
    expect(steps[chipStep(steps, 1, { 1: { correct: 1, total: 1 } })]).toEqual({ stage: 1, phase: 'show' })
    expect(steps[chipStep(steps, 0, {})]).toEqual({ stage: 0, phase: 'show' })
  })
})
