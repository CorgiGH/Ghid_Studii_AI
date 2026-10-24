import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PGlite } from '@electric-sql/pglite'
import { beforeAll, describe, expect, it } from 'vitest'
import { createEngine } from '../../src/sql/engine/core.js'
import { planStages } from '../../src/sql/machine.js'
import { buildSteps, chipStep, predictKind, settled, viewAt } from '../../src/sql/machineView.js'
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
    expect(predictKind('join')).toBe('count')
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

  it('distinct: representatives with counts that add up; join: predicted count; settled carries columns', async () => {
    const d = await planOf(byId['bd-l02-qm3'])
    const shown = viewAt(d, buildSteps(d), 3, { 2: { value: '7' } }, { 2: { correct: 1, total: 1 } })
    expect(shown.rows).toHaveLength(7)
    expect(shown.rows.reduce((n, r) => n + r.count, 0)).toBe(13)
    expect(settled(d, 1).dimmed).toEqual(['nume'])
    const j = await planOf(byId['bd-l22-qm'])
    const steps = buildSteps(j)
    const ask = viewAt(j, steps, 1)
    expect(ask.ask.kind).toBe('count')
    expect(ask.rows).toHaveLength(13)
    expect(viewAt(j, steps, 2, { 1: { value: '9' } }, { 1: { correct: 1, total: 1 } }).meta.count).toMatchObject({ ok: true })
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
