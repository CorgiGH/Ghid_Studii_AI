// Differential test: every corpus query runs on the engine and must equal the frozen Oracle 11g result
// (tests/sql/oracle-snapshot.json, produced by scripts/sql/snapshot-oracle.mjs), unless its id is listed in
// known-gaps.json with the fix that will close it. A listed gap that now passes fails the test: delete the entry.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PGlite } from '@electric-sql/pglite'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createEngine } from '../../src/sql/engine/core.js'
import { loadCorpus, CLOCK, SNAPSHOT_MAX_ROWS } from '../../scripts/sql/snapshot-oracle.mjs'
import { diffResults } from './compare.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const readJson = (f) => JSON.parse(fs.readFileSync(path.join(here, f), 'utf8'))
const corpus = loadCorpus()
const snapshot = readJson('oracle-snapshot.json')
const knownGaps = readJson('known-gaps.json')
const facultate = fs.readFileSync(path.join(here, '..', '..', 'public', 'sql', 'datasets', 'facultate.sql'), 'utf8')

let engine
const outcome = { pass: 0, gap: 0 }

beforeAll(async () => {
  engine = await createEngine(new PGlite(), { clock: CLOCK, datasets: { facultate } })
})

afterAll(() => {
  console.log(`SQL differential: ${corpus.length} queries, ${outcome.pass} match Oracle, ${outcome.gap} known gaps`)
})

describe('corpus is consistent with the snapshot', () => {
  it('has 459 entries, each with a frozen Oracle result and a valid gap entry', () => {
    expect(corpus).toHaveLength(459)
    for (const e of corpus) expect(snapshot[e.id], e.id).toBeDefined()
    for (const e of corpus) if (e.orderKeySql) expect(snapshot[e.id].orderKeys, `${e.id} needs frozen orderKeys`).toHaveLength(snapshot[e.id].rowCount)
    expect(Object.keys(snapshot)).toHaveLength(corpus.length)
    const ids = new Set(corpus.map((e) => e.id))
    for (const id of Object.keys(knownGaps)) {
      expect(ids.has(id), `known-gaps lists unknown id ${id}`).toBe(true)
      expect(knownGaps[id].fix, `gap ${id} needs a fix reference`).toBeTruthy()
    }
  })
})

describe('engine equals Oracle', () => {
  it.each(corpus.map((e) => [e.id, e]))('%s', async (id, entry) => {
    for (const p of entry.pre || []) await engine.run(p, { dataset: 'facultate' })
    const actual = await engine.run(entry.sql, { dataset: 'facultate', maxRows: SNAPSHOT_MAX_ROWS })
    const diff = diffResults(snapshot[id], actual, entry.sql)
    if (id in knownGaps) {
      expect(diff, `${id} now matches Oracle: remove it from known-gaps.json`).not.toBeNull()
      outcome.gap++
    } else {
      expect(diff, `${id} differs from Oracle`).toBeNull()
      outcome.pass++
    }
  })
})
