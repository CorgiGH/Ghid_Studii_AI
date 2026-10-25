// The lesson widgets compute what they show in plain JavaScript (src/components/lesson/viz/logic/*) and print the SQL that gives
// it (viz/logic/oracle.js). Every such query of every lesson viz block runs here on the engine and must give the widget's value,
// so a change in the rewriter or the compat layer cannot silently change what a widget teaches.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PGlite } from '@electric-sql/pglite'
import { beforeAll, describe, expect, it } from 'vitest'
import { createEngine } from '../../src/sql/engine/core.js'
import * as O from '../../src/components/lesson/viz/logic/oracle.js'
import { numberLines } from '../../src/components/lesson/viz/logic/number-line.js'
import { charStrips } from '../../src/components/lesson/viz/logic/char-strips.js'
import { calendarSteps } from '../../src/components/lesson/viz/logic/calendar-clock.js'
import { dateMask } from '../../src/components/lesson/viz/logic/date-mask.js'
import { ageSteps } from '../../src/components/lesson/viz/logic/age-timeline.js'
import { decodeSieve } from '../../src/components/lesson/viz/logic/decode-sieve.js'
import { typePipes } from '../../src/components/lesson/viz/logic/type-pipes.js'
import { cartesianGrid } from '../../src/components/lesson/viz/logic/cartesian-grid.js'
import { joinRows } from '../../src/components/lesson/viz/logic/join-wires.js'
import { selfPairs } from '../../src/components/lesson/viz/logic/self-pairs.js'
import { setBalls } from '../../src/components/lesson/viz/logic/set-balls.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(here, '..', '..')
const COURSES = path.join(ROOT, 'src', 'content', 'bd', 'courses')

// widget -> (props) => [the SQL texts, the values the widget shows for them, in the same order]
const PLAN = {
  'number-line': (p) => [O.numberLineSql(p), numberLines(p).lines.flatMap((l) => l.results.map((r) => r.result))],
  'char-strips': (p) => [O.charStripsSql(p), [charStrips(p).plan.result]],
  'calendar-clock': (p) => [O.calendarSql(p), calendarSteps(p).stops],
  'date-mask': (p) => [O.dateMaskSql(p), dateMask(p).formats.map((f) => f.text)],
  'age-timeline': (p) => [O.ageSql(p), [ageSteps(p).months]],
  'decode-sieve': (p) => [O.decodeSql(p), decodeSieve(p).routes.map((r) => r.result)],
  'type-pipes': (p) => [O.typePipesSql(p), typePipes(p).items.map((i) => i.result)],
  'cartesian-grid': (p) => { const g = cartesianGrid(p); return [O.cartesianSql(p), [g.total, g.matches]] },
  'join-wires': (p) => { const j = joinRows(p); return [O.joinSql(p), [p.filterIn === 'where' ? j.kept : j.pairs.length]] },
  'self-pairs': (p) => [O.selfPairsSql(p), [selfPairs(p).pairs.length]],
  'set-balls': (p) => [O.setBallsSql(p), setBalls(p).results.map((r) => r.values.length)],
}

function vizBlocks() {
  const blocks = []
  for (const f of fs.readdirSync(COURSES).filter((x) => x.endsWith('.json')).sort()) {
    const lesson = JSON.parse(fs.readFileSync(path.join(COURSES, f), 'utf8'))
    for (const step of lesson.steps ?? []) for (const b of step.blocks ?? []) if (b.type === 'viz' && PLAN[b.widget]) blocks.push(b)
  }
  return blocks
}

// [block id, index, sql, the widget's value]
const cases = vizBlocks().flatMap((b) => {
  const [sqls, pure] = PLAN[b.widget](b.props)
  return sqls.map((sql, i) => [b.id, i, sql, pure[i]]).filter(([, , sql]) => sql)
})

let engine
beforeAll(async () => {
  engine = await createEngine(new PGlite(), { clock: '2026-10-26 14:30:00', datasets: { facultate: fs.readFileSync(path.join(ROOT, 'public', 'sql', 'datasets', 'facultate.sql'), 'utf8') } })
}, 60000)

describe('widget SQL on the engine', () => {
  it('covers the widgets of the lessons', () => {
    expect(new Set(cases.map((c) => c[0])).size).toBeGreaterThanOrEqual(20)
    expect(cases.length).toBeGreaterThanOrEqual(45)
  })
  it.each(cases)('%s [%i] %s', async (id, i, sql, pure) => {
    const r = await engine.run(sql, { dataset: 'facultate' })
    expect(r.error, `${id}: ${sql}`).toBeUndefined()
    const shown = r.rows[0]?.[0]
    const same = String(shown) === String(pure) || (shown !== null && shown !== undefined && !Number.isNaN(Number(shown)) && Number(shown) === Number(pure))
    expect(same, `${id} [${i}] ${sql}: engine ${JSON.stringify(shown)}, widget ${JSON.stringify(pure)}`).toBe(true)
  })
})
