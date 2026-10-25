// The page's handle on the SQL engine. The worker is created on the first run (nothing is downloaded before a learner asks
// for a result), a dataset switch boots a new worker, cancel() terminates the worker and boots a fresh one.
//
//   const sql = getSqlClient()
//   const result = await sql.run('SELECT nume FROM studenti', { dataset: 'facultate', maxRows: 500 })
//   sql.cancel()                       // the pending run rejects with { code: 'CANCELLED' }
//   sql.status                         // 'idle' | 'loading' | 'ready' | 'failed'
//   const off = sql.onStatus((s) => ...)
//
// When the engine cannot start (boot error, or no answer within BOOT_TIMEOUT_MS) the status is 'failed' and every run rejects
// with { code: 'ENGINE_UNAVAILABLE' }; the lesson then falls back to paper mode (worked examples with frozen results).

// Measured in scripts/sql/measure-browser.mjs (numbers in spec section 8: about 0.9 s desktop, about 8 s phone-class): a boot that
// fails, or takes longer than this, forces paper mode.
export const BOOT_TIMEOUT_MS = 20000
export const PAPER_MODE_THRESHOLD = { bootMs: BOOT_TIMEOUT_MS }
export const DEFAULT_MAX_ROWS = 500
// PGlite ignores statement_timeout (single-user mode has no timers), so the page enforces the limit: a statement that has not
// answered by then is cancelled with { code: 'TIMEOUT' } and the worker is rebooted. A 5-table cartesian product takes ~3 s on a
// desktop and ~26 s on a phone-class CPU (spec section 8), well under this.
export const RUN_TIMEOUT_MS = 60000

const err = (code, message) => Object.assign(new Error(message), { code })

function defaultCreateWorker() {
  return new Worker(new URL('./worker.js', import.meta.url), { type: 'module' })
}

export function createSqlClient({ createWorker = defaultCreateWorker, bootTimeoutMs = BOOT_TIMEOUT_MS, runTimeoutMs = RUN_TIMEOUT_MS } = {}) {
  let status = 'idle'
  const listeners = new Set()
  let worker = null
  let dataset = null
  let booting = null // Promise resolving when the current worker is ready
  let nextId = 1
  const pending = new Map() // id -> { resolve, reject }

  const setStatus = (s) => {
    if (s === status) return
    status = s
    for (const cb of [...listeners]) cb(s)
  }

  function rejectAll(e) {
    const all = [...pending.values()]
    pending.clear()
    for (const p of all) p.reject(e)
  }

  function send(w, msg) {
    return new Promise((resolve, reject) => {
      pending.set(msg.id, { resolve, reject, worker: w })
      w.postMessage(msg)
    })
  }

  function stop() {
    if (worker) {
      worker.onmessage = null
      worker.onerror = null
      try { worker.terminate() } catch { /* already gone */ }
    }
    worker = null
    booting = null
  }

  function boot(ds) {
    setStatus('loading')
    dataset = ds
    let w
    try {
      w = createWorker()
    } catch (e) {
      setStatus('failed')
      booting = Promise.reject(err('ENGINE_UNAVAILABLE', String(e?.message ?? e)))
      booting.catch(() => {})
      return booting
    }
    worker = w
    w.onmessage = (ev) => {
      const { id, ok, result, error } = ev.data
      const p = pending.get(id)
      if (!p || p.worker !== w) return
      pending.delete(id)
      if (ok) p.resolve(result)
      else p.reject(Object.assign(new Error(error.message), { code: error.code }))
    }
    w.onerror = (ev) => {
      if (worker !== w) return
      fail(String(ev?.message ?? 'worker error'))
    }
    const p = new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        if (worker === w) fail(`engine did not start within ${bootTimeoutMs} ms`)
      }, bootTimeoutMs)
      send(w, { id: nextId++, op: 'boot', dataset: ds }).then(
        () => {
          clearTimeout(timer)
          if (worker !== w) return reject(err('CANCELLED', 'cancelled while booting'))
          setStatus('ready')
          resolve()
        },
        (e) => {
          clearTimeout(timer)
          if (e.code === 'CANCELLED') return reject(e)
          if (worker === w) fail(e.message)
          reject(err('ENGINE_UNAVAILABLE', e.message))
        },
      )
    })
    p.catch(() => {})
    booting = p
    return p
  }

  function fail(message) {
    stop()
    setStatus('failed')
    rejectAll(err('ENGINE_UNAVAILABLE', message))
  }

  async function call(op, args, ds) {
    if (status === 'failed') throw err('ENGINE_UNAVAILABLE', 'the SQL engine could not start')
    if (!worker || dataset !== ds) {
      stop()
      rejectAll(err('CANCELLED', 'dataset changed'))
      boot(ds)
    }
    const w = worker
    try {
      await booting
    } catch (e) {
      if (e.code === 'CANCELLED') throw e
      throw err('ENGINE_UNAVAILABLE', e.message)
    }
    if (worker !== w) throw err('CANCELLED', 'cancelled')
    const answer = send(w, { id: nextId++, op, args })
    const timer = setTimeout(() => {
      if (worker === w) restart(err('TIMEOUT', `the statement took longer than ${runTimeoutMs} ms`))
    }, runTimeoutMs)
    try {
      return await answer
    } finally {
      clearTimeout(timer)
    }
  }

  // terminate the worker (the only way to stop a running query), fail what was waiting with `reason`, boot a fresh worker
  function restart(reason) {
    const ds = dataset
    stop()
    rejectAll(reason)
    boot(ds)
  }

  const client = {
    get status() {
      return status
    },
    onStatus(cb) {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    run(sql, o = {}) {
      return call('run', [sql, { ...o, maxRows: o.maxRows ?? DEFAULT_MAX_ROWS }], o.dataset)
    },
    describe(table, o = {}) {
      return call('describe', [table, o], o.dataset)
    },
    snapshot(o = {}) {
      return call('snapshot', [o], o.dataset)
    },
    // Terminates the worker (the only way to stop a running query) and boots a fresh one on the same dataset.
    cancel() {
      if (worker) restart(err('CANCELLED', 'cancelled'))
    },
    // resolves when the engine is ready (or rejects when it cannot start)
    ready() {
      return booting ?? Promise.reject(err('ENGINE_UNAVAILABLE', 'engine not started'))
    },
  }
  return client
}

let singleton = null
export function getSqlClient() {
  return (singleton ??= createSqlClient())
}
