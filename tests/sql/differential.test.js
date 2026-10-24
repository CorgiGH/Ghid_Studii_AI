// Differential test: every corpus query runs on the engine and must equal the frozen Oracle 11g result
// (tests/sql/oracle-snapshot.json, produced by scripts/sql/snapshot-oracle.mjs), unless its id is listed in
// known-gaps.json with the fix that will close it. A listed gap that now passes fails the test: delete the entry.
// A listed gap also has to keep the category of its stored difference (columns / row count / rows / error code), so a
// gap that gets worse or changes shape is noticed instead of hiding behind "still differs".
// An entry's `pre` statements (ALTER SESSION ...) run first and must succeed on the engine, as they did on Oracle (the snapshot
// script refuses to freeze an entry whose session statement failed). A known gap may have a pre statement the engine does not
// support yet. The NLS defaults are restored after every entry with a `pre`, so nothing leaks into the next one.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PGlite } from '@electric-sql/pglite'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createEngine } from '../../src/sql/engine/core.js'
import { loadCorpus, CLOCK, SNAPSHOT_MAX_ROWS } from '../../scripts/sql/snapshot-oracle.mjs'
import { NLS_RESET } from '../../scripts/sql/oracle.mjs'
import { diffCategory, diffResults, expectsSequence } from './compare.js'

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

// An entry with `before` is a scene (DDL / DML) followed by the statement under test, all in one run: a script. The statement
// under test gives the result that is compared; the scene must do what the entry says (`beforeErrors`: the error codes it raises).
// `after` is clean-up for the Oracle session only: every engine run is thrown away.
async function runEntry(entry) {
  if (!entry.before) return engine.run(entry.sql, { dataset: 'facultate' })
  const r = await engine.run([...entry.before, entry.sql].join(';\n'), { dataset: 'facultate', script: true })
  expect(r.statements, `${entry.id}: the script was cut into the wrong statements`).toHaveLength(entry.before.length + 1)
  expect(r.statements.slice(0, -1).filter((x) => x.error).map((x) => x.error.code), `${entry.id}: errors of the set-up statements`).toEqual(entry.beforeErrors || [])
  return r
}

describe('corpus is consistent with the snapshot', () => {
  it('has 661 entries, each with a frozen Oracle result and a valid gap entry', () => {
    expect(corpus).toHaveLength(661)
    for (const e of corpus) expect(snapshot[e.id], e.id).toBeDefined()
    for (const e of corpus) if (e.orderKeySql) expect(snapshot[e.id].orderKeys, `${e.id} needs frozen orderKeys, cut like the rows`).toHaveLength(Math.min(snapshot[e.id].rowCount, SNAPSHOT_MAX_ROWS))
    for (const e of corpus) if (snapshot[e.id].truncated && !expectsSequence(e.sql)) expect(snapshot[e.id].digest, `${e.id} is cut and unordered: it needs a digest`).toMatch(/^[0-9a-f]{40}$/)
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
    try {
      const preErrors = []
      for (const p of entry.pre || []) {
        const r = await engine.run(p, { dataset: 'facultate' })
        if (r.error) preErrors.push(`${p}: ${r.error.code}`)
      }
      if (!(id in knownGaps)) expect(preErrors, `${id}: session statements Oracle accepted failed on the engine`).toEqual([])
      // uncapped: a cut snapshot with a digest is compared against the engine's whole result
      const actual = await runEntry(entry)
      const diff = diffResults(snapshot[id], actual, entry.sql)
      if (id in knownGaps) {
        expect(diff, `${id} now matches Oracle: remove it from known-gaps.json`).not.toBeNull()
        expect(diffCategory(diff), `${id} is a known gap, but its difference changed kind. Now: ${diff}\nStored: ${knownGaps[id].note}\nFix the engine, or update the stored note if the change is intended.`).toBe(diffCategory(knownGaps[id].note))
        outcome.gap++
      } else {
        expect(diff, `${id} differs from Oracle`).toBeNull()
        outcome.pass++
      }
    } finally {
      if (entry.pre) {
        const reset = await engine.run(NLS_RESET, { dataset: 'facultate' })
        expect(reset.error, `${id}: restoring the NLS defaults failed`).toBeUndefined()
      }
    }
  })
})
