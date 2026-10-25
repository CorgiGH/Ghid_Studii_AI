// The prebuilt path (data directory + createEngine({ prebuilt })) is the only one the browser runs. It must answer exactly as the
// fresh engine does, and the client's session reset and second clock must work on it.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PGlite } from '@electric-sql/pglite'
import { beforeAll, describe, expect, it } from 'vitest'
import { createEngine } from '../../src/sql/engine/core.js'
import { createSqlClient } from '../../src/sql/engine/client.js'
import { attachEngine } from '../../src/sql/engine/worker.js'
import { buildDatadir } from '../../scripts/sql/build-datadirs.mjs'
import { loadCorpus, CLOCK } from '../../scripts/sql/snapshot-oracle.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const facultate = fs.readFileSync(path.join(here, '..', '..', 'public', 'sql', 'datasets', 'facultate.sql'), 'utf8')
const DS = { dataset: 'facultate' }
const SECOND_CLOCK = '2026-08-26 14:30:00'

let datadir
let fresh
let prebuilt
const bootPrebuilt = async () => new PGlite({ loadDataDir: new Blob([datadir]) })

beforeAll(async () => {
  datadir = await buildDatadir('facultate', createEngine)
  fresh = await createEngine(new PGlite(), { clock: CLOCK, datasets: { facultate } })
  prebuilt = await createEngine(await bootPrebuilt(), { clock: CLOCK, datasets: {}, prebuilt: 'facultate' })
}, 120000)

async function runEntry(engine, entry) {
  const o = { ...DS, fresh: true }
  for (const p of entry.pre ?? []) await engine.run(p, o)
  if (!entry.before) return engine.run(entry.sql, { ...DS, fresh: !entry.pre })
  return engine.run([...entry.before, entry.sql].join(';\n'), { ...DS, script: true, fresh: !entry.pre })
}

describe('prebuilt engine equals the fresh engine', () => {
  it('has the same session settings', async () => {
    for (const q of ['SHOW DateStyle', 'SHOW TimeZone', 'SHOW search_path']) {
      const a = await fresh.run(q, DS)
      const b = await prebuilt.run(q, DS)
      expect(a.error, q).toBeUndefined()
      expect(JSON.stringify(b), q).toBe(JSON.stringify(a))
    }
  })

  it('answers every corpus entry as the fresh engine does', async () => {
    const corpus = loadCorpus()
    const diffs = []
    for (const entry of corpus) {
      const a = await runEntry(fresh, entry)
      const b = await runEntry(prebuilt, entry)
      if (JSON.stringify(a) !== JSON.stringify(b)) diffs.push(entry.id)
    }
    expect(diffs).toEqual([])
  }, 300000)
})

function stubWorkerFactory() {
  return () => {
    const stub = { onmessage: null, onerror: null, terminate() {} }
    const scope = { onmessage: null, postMessage: (m) => setTimeout(() => stub.onmessage?.({ data: m }), 0) }
    attachEngine(scope, async (dataset) => ({ pg: await bootPrebuilt(), prebuilt: dataset }))
    stub.postMessage = (m) => scope.onmessage({ data: m })
    return stub
  }
}

describe('client on the prebuilt data directory', () => {
  const DATE_Q = "SELECT TO_CHAR(DATE '1995-05-26', 'DD-MON-RR') FROM dual"

  it('a session setting does not leak past a reset', async () => {
    const c = createSqlClient({ createWorker: stubWorkerFactory() })
    const before = (await c.run(DATE_Q, DS)).rows[0][0]
    expect(before).toMatch(/-[A-Z]{3}-/)
    await c.run('ALTER SESSION SET NLS_DATE_LANGUAGE = ROMANIAN', DS)
    const changed = (await c.run(DATE_Q, DS)).rows[0][0]
    expect(changed).not.toBe(before) // the setting survives between runs, as in a SQL*Plus session
    await c.reset(DS)
    expect((await c.run(DATE_Q, DS)).rows[0][0]).toBe(before)
    await c.run('ALTER SESSION SET NLS_DATE_LANGUAGE = ROMANIAN', DS)
    expect((await c.run(DATE_Q, { ...DS, fresh: true })).rows[0][0]).toBe(before)
  }, 60000)

  it('a run can ask for the second clock, and the next run is back on the default', async () => {
    const c = createSqlClient({ createWorker: stubWorkerFactory() })
    const q = "SELECT TO_CHAR(SYSDATE, 'YYYY-MM-DD HH24:MI:SS') FROM dual"
    expect((await c.run(q, DS)).rows[0][0]).toBe(CLOCK)
    expect((await c.run(q, { ...DS, clock: SECOND_CLOCK })).rows[0][0]).toBe(SECOND_CLOCK)
    expect((await c.run(q, DS)).rows[0][0]).toBe(CLOCK)
  }, 60000)
})
