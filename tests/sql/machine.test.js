import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PGlite } from '@electric-sql/pglite'
import { beforeAll, describe, expect, it } from 'vitest'
import { createEngine } from '../../src/sql/engine/core.js'
import { conjuncts, planStages, parseQuery, scorePicks, scoreOrder } from '../../src/sql/machine.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const facultate = fs.readFileSync(path.join(here, '..', '..', 'public', 'sql', 'datasets', 'facultate.sql'), 'utf8')
const blocks = JSON.parse(fs.readFileSync(path.join(here, 'fixtures', 'query-machine-blocks.json'), 'utf8'))
const byId = Object.fromEntries(blocks.map((b) => [b.id, b]))

let engine
beforeAll(async () => {
  engine = await createEngine(new PGlite(), { clock: '2026-10-26 14:30:00', datasets: { facultate } })
})

const plan = (b) => planStages(b.sql, b.stages, engine, { dataset: b.dataset, show: b.show })
const rowsOf = async (sql) => (await engine.run(sql, { dataset: 'facultate' })).rows
const stageOf = (stages, clause) => stages.find((s) => s.clause === clause)
// Oracle sorts the result of UNION / INTERSECT / MINUS on every column when there is no ORDER BY.
const sortedRows = async (sql) => {
  const n = parseQuery(sql).parts[0].select.length
  return rowsOf(`SELECT * FROM (${sql}) ORDER BY ${Array.from({ length: n }, (_, i) => i + 1).join(', ')}`)
}

describe('parseQuery', () => {
  it('splits clauses, joins, aliases and set operators', () => {
    const p = parseQuery(byId['bd-l24-qm'].sql)
    expect(p.parts).toHaveLength(1)
    const a = p.parts[0]
    expect(a.base).toMatchObject({ table: 'studenti', alias: 's' })
    expect(a.joins.map((j) => [j.table, j.alias, j.kind])).toEqual([['note', 'n', 'inner'], ['cursuri', 'c', 'inner']])
    expect(a.where).toMatch(/^c\.titlu_curs = 'Logica'/)
    expect(a.order.map((o) => o.expr)).toEqual(['s.nume'])
    const m = parseQuery(byId['bd-l23-qm'].sql)
    expect(m.ops).toEqual(['minus'])
    expect(m.parts).toHaveLength(2)
    const l = parseQuery(byId['bd-l20-qm1'].sql).parts[0]
    expect(l.joins[0].kind).toBe('left')
    expect(parseQuery('SELECT DISTINCT an FROM studenti').parts[0].distinct).toBe(true)
    expect(parseQuery('SELECT a FROM t UNION ALL SELECT b FROM u').ops).toEqual(['union-all'])
  })
  it('splits an ON condition into conjuncts and tells plain equalities apart', () => {
    expect(conjuncts('n2.id_curs = n1.id_curs AND n2.valoare > n1.valoare')).toEqual([
      { text: 'n2.id_curs = n1.id_curs', eq: true },
      { text: 'n2.valoare > n1.valoare', eq: false },
    ])
    expect(conjuncts("a = '1' AND b BETWEEN 1 AND 2 AND (c = 1 OR d = 2) AND UPPER(e) = UPPER(f) AND g <> h AND k IS NULL").map((c) => [c.text, c.eq])).toEqual([
      ["a = '1'", true], ['b BETWEEN 1 AND 2', false], ['(c = 1 OR d = 2)', false], ['UPPER(e) = UPPER(f)', true], ['g <> h', false], ['k IS NULL', false],
    ])
    const j = parseQuery(byId['bd-l22-qm'].sql).parts[0].joins
    expect(j.map((x) => x.head)).toEqual(['JOIN note n1', 'JOIN note n2', 'JOIN studenti s2'])
    expect(parseQuery('SELECT * FROM studenti s JOIN note n USING (nr_matricol)').parts[0].joins[0].using).toBe(true)
    expect(j[0].using).toBe(false)
  })
  it('labels every token with the clause it belongs to', () => {
    const { segments } = parseQuery('SELECT nume FROM studenti WHERE an = 1 ORDER BY nume')
    expect(segments.map((s) => s.clause)).toEqual(['select', 'from', 'where', 'order'])
    expect(segments.map((s) => s.text).join('')).toBe('SELECT nume FROM studenti WHERE an = 1 ORDER BY nume')
  })
})

describe('parseQuery select items', () => {
  const items = (sql) => parseQuery(sql).parts[0].select.map((it) => [it.expr, it.alias])
  it('reads aliases with AS, without AS and quoted, and keeps expressions whole', () => {
    expect(items('SELECT nume n1, prenume AS p, an "An Studiu", bursa + 10 plus, s.nume FROM studenti s')).toEqual([
      ['nume', 'n1'], ['prenume', 'p'], ['an', 'An Studiu'], ['bursa + 10', 'plus'], ['s.nume', null],
    ])
    expect(items("SELECT bursa IS NULL, CASE WHEN an = 1 THEN 'a' ELSE 'b' END, CASE WHEN an = 1 THEN 'a' END c, UPPER(nume) || ' ' || prenume AS complet FROM studenti")).toEqual([
      ['bursa IS NULL', null], ["CASE WHEN an = 1 THEN 'a' ELSE 'b' END", null], ["CASE WHEN an = 1 THEN 'a' END", 'c'], ["UPPER(nume) || ' ' || prenume", 'complet'],
    ])
    expect(items('SELECT DISTINCT an a FROM studenti')).toEqual([['an', 'a']])
  })
  it('EXCEPT is not an Oracle operator, UNION ALL is one', () => {
    expect(parseQuery('SELECT a FROM t UNION ALL SELECT a FROM u').ops).toEqual(['union-all'])
    expect(parseQuery('SELECT a FROM t EXCEPT SELECT a FROM u').ops).toEqual([])
  })
})

describe('conjuncts and OR', () => {
  it('a condition with a top-level OR stays whole, because AND binds tighter', () => {
    expect(conjuncts('a.x = b.x AND a.y = b.y OR a.z > b.z')).toEqual([{ text: 'a.x = b.x AND a.y = b.y OR a.z > b.z', eq: false }])
    expect(conjuncts('a.z > b.z OR a.x = b.x')).toHaveLength(1)
    // an OR inside parentheses does not hide the ANDs around it
    expect(conjuncts('(a.x = b.x OR a.y = b.y) AND c.v = d.v').map((c) => c.text)).toEqual(['(a.x = b.x OR a.y = b.y)', 'c.v = d.v'])
    expect(conjuncts('a.v BETWEEN 1 AND 2 AND b.w = c.w').map((c) => c.text)).toEqual(['a.v BETWEEN 1 AND 2', 'b.w = c.w'])
  })
})

describe('planStages against the engine', () => {
  it('WHERE keeps exactly the rows the engine keeps, ORDER BY matches the engine order', async () => {
    const b = { ...byId['bd-l04-qm1'], stages: [{ clause: 'from' }, { clause: 'where', predict: true }, { clause: 'select' }, { clause: 'order' }], sql: 'SELECT nume, bursa FROM studenti WHERE an = 1 ORDER BY nume', show: ['nume', 'an', 'bursa'] }
    const stages = await plan(b)
    const where = stageOf(stages, 'where')
    expect(where.rows).toHaveLength(13)
    const keptRows = where.rows.filter((r) => where.kept.includes(r.key)).map((r) => [r.cells.nume, r.cells.bursa])
    const expected = await rowsOf('SELECT nume, bursa FROM studenti WHERE an = 1')
    expect(keptRows.map(String).sort()).toEqual(expected.map(String).sort())
    expect(where.kept.length + where.removed.length).toBe(13)
    const order = stageOf(stages, 'order')
    const ordered = order.rows.map((r) => [r.cells.nume, r.cells.bursa])
    expect(ordered).toEqual(await rowsOf('SELECT nume, bursa FROM studenti WHERE an = 1 ORDER BY nume'))
    expect(order.order).toEqual(order.rows.map((r) => r.key))
  })

  it('tri-state truth: NOT (bursa > 300) gives 8 unknown rows', async () => {
    const stages = await plan(byId['bd-l05-qm2'])
    const where = stageOf(stages, 'where')
    const counts = { T: 0, F: 0, U: 0 }
    for (const v of Object.values(where.truth)) counts[v] += 1
    expect(counts).toEqual({ T: 1, F: 4, U: 8 })
    expect(where.kept).toHaveLength(1)
    expect(where.rows.find((r) => r.key === where.kept[0]).cells.nume).toBe('Pintescu')
  })

  it('a join stage on studenti JOIN note gives 42 pairs, from shows the first table and 13 x 42 = 546', async () => {
    const b = { ...byId['bd-l18-qm1'], sql: 'SELECT nume, prenume, valoare FROM studenti JOIN note ON studenti.nr_matricol = note.nr_matricol', stages: [{ clause: 'from' }, { clause: 'join' }] }
    const stages = await plan(b)
    expect(stages[0].rows).toHaveLength(13)
    expect(stages[0].tables.map((t) => t.count)).toEqual([13, 42])
    expect(stages[1].rows).toHaveLength(42)
    expect(stages[1].product).toBe(546)
  })

  it('MINUS reproduces the engine result, with the two lists on view', async () => {
    const stages = await plan(byId['bd-l23-qm'])
    const minus = stageOf(stages, 'minus')
    const expected = await rowsOf(byId['bd-l23-qm'].sql)
    expect(expected).toHaveLength(1)
    const got = minus.rows.filter((r) => minus.kept.includes(r.key)).map((r) => Object.values(r.cells))
    expect(got).toEqual(expected)
    expect(minus.rows).toHaveLength(9)
    expect(minus.right).toHaveLength(8)
    const where = stageOf(stages, 'where')
    expect(where.kept.length).toBeGreaterThan(0)
  })

  it('MINUS on (nume, prenume) reproduces L4.12 as the corpus has it, in the engine order', async () => {
    const corpus = JSON.parse(fs.readFileSync(path.join(here, 'corpus', 'solutions.json'), 'utf8')).find((x) => x.id === 'sol:L4.12')
    const stages = await planStages(corpus.sql, [{ clause: 'minus' }], engine, { dataset: 'facultate', show: ['nume', 'prenume'] })
    const s = stages[0]
    const row = (k) => (s.rows.find((r) => r.key === k) || s.right.find((r) => r.key === k)).cells
    const got = s.result.map((k) => [row(k).nume, row(k).prenume])
    expect(got).toEqual(await sortedRows(corpus.sql))
    expect(got.length).toBeGreaterThan(0)
    // the two columns together are the identity of a row: the homonym surnames stay apart where the first names differ
    expect(new Set(got.map((r) => r.join('|'))).size).toBe(got.length)
  })

  it('homonyms merge: MINUS / UNION / INTERSECT on names equal the engine', async () => {
    for (const [op, clause] of [['MINUS', 'minus'], ['UNION', 'union'], ['INTERSECT', 'intersect'], ['UNION ALL', 'union-all']]) {
      const sql = `SELECT nume FROM studenti WHERE an < 3 ${op} SELECT nume FROM studenti WHERE an > 1`
      const stages = await planStages(sql, [{ clause }], engine, { dataset: 'facultate', show: ['nume'] })
      const s = stages[0]
      const got = s.result.map((k) => (s.rows.find((r) => r.key === k) || s.right.find((r) => r.key === k)).cells.nume)
      expect(got, op).toEqual((await (clause === 'union-all' ? rowsOf(sql) : sortedRows(sql))).map((r) => r[0]))
      expect([...s.result].sort(), op).toEqual([...s.kept].sort())
    }
  })

  it('DISTINCT merges duplicates and counts them', async () => {
    const stages = await plan(byId['bd-l02-qm3'])
    const d = stageOf(stages, 'distinct')
    expect(d.inputCount).toBe(13)
    expect(d.rows).toHaveLength(7)
    expect(Object.values(d.counts).reduce((a, b) => a + b, 0)).toBe(13)
    expect(d.columns).toEqual(['an', 'grupa'])
    expect(Object.keys(d.merge)).toHaveLength(6)
  })

  it('SELECT dims the columns it drops and adds computed ones', async () => {
    const stages = await plan(byId['bd-l03-qm1'])
    const sel = stageOf(stages, 'select')
    expect(sel.columns).toEqual(['nume', 'bursa', 'bursa + 10'])
    const r = sel.rows[0]
    expect(Number(r.cells['bursa + 10'])).toBe(Number(r.cells.bursa) + 10)
    const s2 = stageOf(await plan(byId['bd-l02-qm1']), 'select')
    expect(s2.dimmed).toEqual(['an', 'bursa'])
  })

  it('aliases relabel the matched columns', async () => {
    const stages = await plan(byId['bd-l22-qm'])
    const sel = stageOf(stages, 'select')
    expect(sel.labels).toMatchObject({ 's1.nume': 'mai_slab', 'n2.valoare': 'nota_celuilalt' })
  })

  it('a predicted join lists the pairs its ON equalities allow and keeps exactly the rows the join gives (L22)', async () => {
    const b = byId['bd-l22-qm']
    const stages = await plan(b)
    const join = stageOf(stages, 'join')
    const cols = b.show.join(', ')
    const cellsOf = (r) => b.show.map((c) => r.cells[c])
    const multiset = (rows) => rows.map((r) => r.map(String).join('\u0001')).sort()
    // The equalities (same student, course 24, same course) pair the 5 BD grades with each other: 5 x 5 = 25 pairs.
    const given = "studenti s1 JOIN note n1 ON n1.nr_matricol = s1.nr_matricol AND n1.id_curs = '24' JOIN note n2 ON n2.id_curs = n1.id_curs JOIN studenti s2 ON s2.nr_matricol = n2.nr_matricol"
    expect(join.rows).toHaveLength(25)
    expect(multiset(join.rows.map(cellsOf))).toEqual(multiset(await rowsOf(`SELECT ${cols} FROM ${given}`)))
    expect(join.test).toBe('n2.valoare > n1.valoare')
    expect(join.given).toEqual(["n1.nr_matricol = s1.nr_matricol", "n1.id_curs = '24'", 'n2.id_curs = n1.id_curs', 's2.nr_matricol = n2.nr_matricol'])
    // The pairs the learner should click are exactly the rows of the real join.
    const kept = join.rows.filter((r) => join.kept.includes(r.key))
    expect(kept).toHaveLength(9)
    expect(join.removed).toHaveLength(16)
    expect(multiset(kept.map(cellsOf))).toEqual(multiset(await rowsOf(`SELECT ${cols} FROM ${parseQuery(b.sql).parts[0].fromText}`)))
    // Equal grades are not "strictly higher": Antonie 10 next to Panaite 10 is a removed pair.
    const ties = join.rows.filter((r) => String(r.cells['n1.valoare']) === String(r.cells['n2.valoare']) && r.cells['s1.nume'] !== r.cells['s2.nume'])
    expect(ties.length).toBeGreaterThan(0)
    expect(ties.every((r) => join.removed.includes(r.key))).toBe(true)
    expect(scorePicks(join, join.kept)).toMatchObject({ correct: 25, total: 25 })
    expect(scorePicks(join, []).correct).toBe(16)
    // The next stage starts from the 9 survivors.
    expect(stageOf(stages, 'select').rows.map((r) => r.key).sort()).toEqual([...join.kept].sort())
  })

  it('a predicted join with only equalities offers every combination, and refuses a list too long to click', async () => {
    const sql = 'SELECT c.titlu_curs, d.id_prof FROM cursuri c JOIN didactic d ON d.id_curs = c.id_curs'
    const stages = await planStages(sql, [{ clause: 'from' }, { clause: 'join', predict: true }], engine, { dataset: 'facultate', show: ['c.titlu_curs', 'd.id_prof'], maxPairs: 90 })
    const join = stages[1]
    expect(join.rows).toHaveLength(9 * 10)
    expect(join.test).toBe('d.id_curs = c.id_curs')
    expect(join.given).toEqual([])
    expect(join.kept).toHaveLength((await rowsOf(sql)).length)
    // studenti JOIN note: 13 x 42 = 546 combinations, over the default limit
    const big = byId['bd-l18-qm1']
    await expect(planStages(big.sql, [{ clause: 'from' }, { clause: 'join', predict: true }], engine, { dataset: 'facultate', show: big.show }))
      .rejects.toMatchObject({ code: 'unsupported', message: expect.stringMatching(/546/) })
  })

  it('a predicted join needs inner JOIN ... ON', async () => {
    const left = byId['bd-l20-qm1']
    await expect(planStages(left.sql, [{ clause: 'from' }, { clause: 'join', predict: true }], engine, { dataset: 'facultate', show: left.show }))
      .rejects.toMatchObject({ code: 'unsupported' })
  })

  it('every staged query-machine block plans, and where it ends in a result that result equals the engine, column by column', async () => {
    expect(blocks).toHaveLength(27)
    // Rows are compared as lists of cells in select order; only the order of the rows is free (no ORDER BY).
    const cells = (rows) => rows.map((r) => r.map(String).join('\u0001'))
    const multiset = (rows) => cells(rows).sort()
    let compared = 0
    for (const b of blocks) {
      let stages
      try {
        stages = await plan(b)
      } catch (e) {
        // user_tables is a dictionary view the engine does not have yet (ORA-00942)
        expect(b.id, `${b.id}: ${e.message}`).toBe('bd-l01c-qm1')
        expect(e.code).toBe('ORA-00942')
        continue
      }
      expect(stages, b.id).toHaveLength(b.stages.length)
      const last = stages[stages.length - 1]
      if (!['select', 'distinct', 'order', 'minus'].includes(last.clause)) continue
      const expected = await rowsOf(b.sql)
      if (last.clause === 'minus') {
        const byKey = new Map([...last.rows, ...last.right].map((r) => [r.key, r]))
        const result = last.result.map((k) => last.columns.map((c) => byKey.get(k).cells[c]))
        expect(cells(result), `${b.id} set result`).toEqual(cells(await sortedRows(b.sql)))
        expect(multiset(result), b.id).toEqual(multiset(expected))
        compared += 1
        continue
      }
      const keep = new Set(last.kept)
      const rows = last.rows.filter((r) => keep.has(r.key)).map((r) => last.itemCols.map((c) => r.cells[c]))
      expect(multiset(rows), b.id).toEqual(multiset(expected))
      if (last.clause === 'order') {
        // the engine's own order, row by row
        const sorted = last.order.map((k) => last.rows.find((r) => r.key === k)).map((r) => last.itemCols.map((c) => r.cells[c]))
        expect(cells(sorted), `${b.id} order`).toEqual(cells(expected))
      }
      compared += 1
    }
    expect(compared).toBeGreaterThanOrEqual(20)
  })

  it('select aliases without AS plan, relabel and order by the alias', async () => {
    const sql = 'SELECT nume n1, bursa + 10 plus FROM studenti WHERE an = 1 ORDER BY n1'
    const stages = await planStages(sql, [{ clause: 'from' }, { clause: 'where' }, { clause: 'select' }, { clause: 'order' }], engine, { dataset: 'facultate', show: ['nume', 'bursa'] })
    expect(stageOf(stages, 'select').labels).toEqual({ nume: 'n1' })
    const order = stageOf(stages, 'order')
    expect(order.rows.map((r) => [r.cells.nume, Number(r.cells.plus)])).toEqual((await rowsOf(sql)).map((r) => [r[0], Number(r[1])]))
    // with no show list the expressions (not the aliases) are what the master query selects
    const bare = await planStages('SELECT nume n1 FROM studenti WHERE an = 1', [{ clause: 'where' }], engine, { dataset: 'facultate' })
    expect(bare[0].columns).toEqual(['nume'])
    // quoted aliases (with and without AS) used in ORDER BY stay valid Oracle in the master query
    for (const sel of ['nume "Nume Mare"', 'nume AS "Nume Mare"']) {
      const qsql = `SELECT ${sel} FROM studenti WHERE an = 1 ORDER BY "Nume Mare"`
      const qs = await planStages(qsql, [{ clause: 'from' }, { clause: 'where' }, { clause: 'select' }, { clause: 'order' }], engine, { dataset: 'facultate', show: ['nume'] })
      expect(stageOf(qs, 'order').rows.map((r) => r.cells.nume)).toEqual((await rowsOf(qsql)).map((r) => r[0]))
    }
  })

  it('set operator results come out in the engine order: sorted without ORDER BY, UNION ALL keeps the lists', async () => {
    const sql = 'SELECT nume FROM studenti WHERE an = 3 UNION SELECT nume FROM studenti WHERE an = 1'
    const [u] = await planStages(sql, [{ clause: 'union' }], engine, { dataset: 'facultate', show: ['nume'] })
    const name = (k) => (u.rows.find((r) => r.key === k) || u.right.find((r) => r.key === k)).cells.nume
    const names = u.result.map(name)
    expect(names).toEqual([...names].sort())
    expect(names).toEqual((await sortedRows(sql)).map((r) => r[0]))
    const all = 'SELECT nume FROM studenti WHERE an = 3 UNION ALL SELECT nume FROM studenti WHERE an = 1'
    const [ua] = await planStages(all, [{ clause: 'union-all' }], engine, { dataset: 'facultate', show: ['nume'] })
    const left = ua.rows.map((r) => r.key)
    expect(ua.result.slice(0, left.length)).toEqual(left)
    expect(ua.result.map((k) => (ua.rows.find((r) => r.key === k) || ua.right.find((r) => r.key === k)).cells.nume)).toEqual((await rowsOf(all)).map((r) => r[0]))
  })

  it('a second query that lacks the block columns never shows invented NULLs', async () => {
    const sql = 'SELECT nume FROM studenti UNION SELECT titlu_curs FROM cursuri WHERE id_curs > 0'
    // plans fine as a set operator (the lists come from the select values) ...
    const [u] = await planStages(sql, [{ clause: 'union' }], engine, { dataset: 'facultate', show: ['nume'] })
    expect(u.right.length).toBeGreaterThan(0)
    expect(u.right.every((r) => r.cells.nume !== undefined && r.cells.nume !== null)).toBe(true)
    // ... but its WHERE cannot be shown row by row
    await expect(planStages(sql, [{ clause: 'where' }, { clause: 'union' }], engine, { dataset: 'facultate', show: ['nume'] }))
      .rejects.toMatchObject({ code: 'unsupported' })
  })

  it('without an engine the plan fails with the unavailable code, and a set operator with ORDER BY is refused', async () => {
    await expect(planStages('SELECT nume FROM studenti', [{ clause: 'from' }], null, { dataset: 'facultate', show: ['nume'] })).rejects.toMatchObject({ code: 'unavailable' })
    await expect(planStages('SELECT nume FROM studenti UNION SELECT nume FROM studenti ORDER BY 1', [{ clause: 'union' }], engine, { dataset: 'facultate', show: ['nume'] }))
      .rejects.toMatchObject({ code: 'unsupported' })
  })

  it('predict scoring', async () => {
    const stage = stageOf(await plan(byId['bd-l04-qm1']), 'where')
    const right = scorePicks(stage, stage.kept)
    expect(right.correct).toBe(13)
    const wrong = scorePicks(stage, [])
    expect(wrong.correct).toBe(13 - stage.kept.length)
    const order = stageOf(await plan(byId['bd-l08-qm1']), 'order')
    expect(scoreOrder(order, order.order).correct).toBe(13)
    const swapped = order.order.slice()
    swapped.reverse()
    expect(scoreOrder(order, swapped).correct).toBeLessThan(13)
  })
})
