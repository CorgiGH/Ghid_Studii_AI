// The browser-side client (Task 8), driven with a worker stub that runs the real engine in-process.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PGlite } from '@electric-sql/pglite'
import { describe, expect, it } from 'vitest'
import { createSqlClient } from '../../src/sql/engine/client.js'
import { attachEngine } from '../../src/sql/engine/worker.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const facultate = fs.readFileSync(path.join(here, '..', '..', 'public', 'sql', 'datasets', 'facultate.sql'), 'utf8')
const DS = { dataset: 'facultate' }

// A Worker look-alike: the same message handler the real worker uses, running in this process. `delayMs` holds back every reply.
function stubWorkerFactory({ delayMs = 0, bootError = null, log = [] } = {}) {
  return () => {
    const stub = { onmessage: null, onerror: null, terminated: false, terminate() { this.terminated = true; log.push('terminate') } }
    const scope = {
      onmessage: null,
      postMessage(m) {
        setTimeout(() => { if (!stub.terminated) stub.onmessage?.({ data: m }) }, delayMs)
      },
    }
    attachEngine(scope, async (dataset) => {
      log.push(`boot ${dataset}`)
      if (bootError) throw new Error(bootError)
      return { pg: new PGlite(), datasets: { [dataset]: facultate } }
    })
    stub.postMessage = (m) => { if (!stub.terminated) scope.onmessage({ data: m }) }
    return stub
  }
}

describe('runaway query', () => {
  it('is capped at maxRows with the true row count', async () => {
    const client = createSqlClient({ createWorker: stubWorkerFactory() })
    expect(client.status).toBe('idle')
    const CROSS = 'SELECT * FROM cursuri a, didactic b, cursuri c, didactic d, studenti e' // five tables, no join condition
    const r = await client.run(CROSS, DS)
    expect(client.status).toBe('ready')
    expect(r.error).toBeUndefined()
    expect(r.truncated).toBe(true)
    expect(r.rowCount).toBe(9 * 10 * 9 * 10 * 13)
    expect(r.rows.length).toBe(500)
    const few = await client.run(CROSS, { ...DS, maxRows: 7 })
    expect(few.rows.length).toBe(7)
  })

  it('is cancellable: the run rejects with CANCELLED and the client is ready again', async () => {
    // a worker that answers slowly, so the run is still in flight when cancel() arrives
    const slow = createSqlClient({ createWorker: stubWorkerFactory({ delayMs: 3000 }) })
    const booted = slow.run('SELECT 1 FROM dual', DS)
    await new Promise((r) => setTimeout(r, 50))
    slow.cancel()
    await expect(booted).rejects.toMatchObject({ code: 'CANCELLED' })

    const log = []
    const c2 = createSqlClient({ createWorker: stubWorkerFactory({ log }) })
    await c2.run('SELECT 1 FROM dual', DS)
    const inFlight = c2.run('SELECT COUNT(*) FROM note', DS)
    c2.cancel()
    await expect(inFlight).rejects.toMatchObject({ code: 'CANCELLED' })
    expect(log).toContain('terminate')
    await c2.ready()
    expect(c2.status).toBe('ready')
    expect((await c2.run('SELECT COUNT(*) FROM note', DS)).rows[0][0]).toBe('42')
  })
})

describe('statement timeout', () => {
  it('a statement that does not answer in time rejects with TIMEOUT and the client recovers', async () => {
    const hung = createSqlClient({ createWorker: stubWorkerFactory({ delayMs: 1500 }), runTimeoutMs: 100, bootTimeoutMs: 5000 })
    await expect(hung.run('SELECT 1 FROM dual', DS)).rejects.toMatchObject({ code: 'TIMEOUT' })
    await hung.ready().catch(() => {})
    expect(['loading', 'ready']).toContain(hung.status)
  })
})

describe('engine start failure', () => {
  it('switches to paper mode: status failed, runs reject with ENGINE_UNAVAILABLE', async () => {
    const client = createSqlClient({ createWorker: stubWorkerFactory({ bootError: 'no wasm' }) })
    const seen = []
    client.onStatus((s) => seen.push(s))
    await expect(client.run('SELECT 1 FROM dual', DS)).rejects.toMatchObject({ code: 'ENGINE_UNAVAILABLE' })
    expect(client.status).toBe('failed')
    expect(seen).toEqual(['loading', 'failed'])
    await expect(client.run('SELECT 1 FROM dual', DS)).rejects.toMatchObject({ code: 'ENGINE_UNAVAILABLE' })
  })

  it('a worker that never answers fails at the boot timeout', async () => {
    const mute = () => ({ onmessage: null, postMessage() {}, terminate() {} })
    const client = createSqlClient({ createWorker: mute, bootTimeoutMs: 150 })
    await expect(client.run('SELECT 1 FROM dual', DS)).rejects.toMatchObject({ code: 'ENGINE_UNAVAILABLE' })
    expect(client.status).toBe('failed')
  })

  it('a worker that cannot be created fails the same way', async () => {
    const client = createSqlClient({ createWorker: () => { throw new Error('no Worker here') } })
    await expect(client.run('SELECT 1 FROM dual', DS)).rejects.toMatchObject({ code: 'ENGINE_UNAVAILABLE' })
    expect(client.status).toBe('failed')
  })
})

describe('lazy start', () => {
  it('creates no worker until the first run', async () => {
    const log = []
    const client = createSqlClient({ createWorker: stubWorkerFactory({ log }) })
    expect(log).toEqual([])
    await client.describe('studenti', DS)
    expect(log).toEqual(['boot facultate'])
  })
})
