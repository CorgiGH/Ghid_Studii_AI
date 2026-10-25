// The SQL engine inside a Web Worker. Messages (all carry the id of the request they answer):
//   client -> worker   { id, op: 'boot', dataset } | { id, op: 'run' | 'describe' | 'snapshot' | 'reset', args: [...] }
//   worker -> client   { id, ok: true, result } | { id, ok: false, error: { code, message } }
// 'boot' starts PGlite from the prebuilt data directory of the dataset (public/sql/datadir-<dataset>.tar.gz), so the compat layer
// and the data are not replayed. A worker serves one dataset; the client boots a new worker to switch.
import { createEngine } from './core.js'

export const CLOCK = '2026-10-26 14:30:00'
/* global __SQL_DATADIR_VERSION__ */
// a hash of the compat layer and the datasets, set at build time (vite.config.js): a redeploy that changes them never meets an
// old data directory from the browser's cache
export const DATADIR_VERSION = typeof __SQL_DATADIR_VERSION__ === 'undefined' ? 'dev' : __SQL_DATADIR_VERSION__

// the default boot: fetch the data directory next to the page and start PGlite from it
export async function bootFromDatadir(dataset, baseUrl) {
  const [{ PGlite }, res] = await Promise.all([import('@electric-sql/pglite'), fetch(`${baseUrl}sql/datadir-${dataset}.tar.gz?v=${DATADIR_VERSION}`)])
  if (!res.ok) throw new Error(`data directory for '${dataset}' answered ${res.status}`)
  const { loadDataDir, pgliteWasmModule, fsBundle } = await downloadEngineFiles(res, reportBoot)
  const pg = new PGlite({ loadDataDir, pgliteWasmModule, fsBundle })
  return { pg, prebuilt: dataset }
}

// Boot progress of the worker's own boot (set by the worker entry below; the client starts its start-up limit at { phase: 'start' }).
let reportBoot = () => {}

// PGlite's own files: the same hashed assets PGlite would fetch for itself once constructed. Fetching them here, before PGlite starts,
// lets the worker count every byte of the ~20 MB download (data directory, pglite.wasm, pglite.data), so the client's start-up limit
// covers only the start, not a slow download.
const pgliteWasmUrl = () => new URL('../../../node_modules/@electric-sql/pglite/dist/pglite.wasm', import.meta.url)
const pgliteDataUrl = () => new URL('../../../node_modules/@electric-sql/pglite/dist/pglite.data', import.meta.url)

// Reads a response body chunk by chunk, telling `onBytes` how many bytes each chunk had. -> Uint8Array[]
async function readChunks(res, onBytes) {
  if (!res.body?.getReader) {
    const buf = new Uint8Array(await res.arrayBuffer())
    onBytes(buf.byteLength)
    return [buf]
  }
  const reader = res.body.getReader()
  const chunks = []
  for (;;) {
    const { done, value } = await reader.read()
    if (done) return chunks
    chunks.push(value)
    onBytes(value.byteLength)
  }
}

// Downloads the data directory (its response `datadirRes` already open), pglite.wasm and pglite.data with progress
// ({ phase: 'download', received, total } a few times a second), says { phase: 'start' } once every byte is in, then compiles the WASM.
export async function downloadEngineFiles(datadirRes, report = () => {}) {
  const [wasmRes, dataRes] = await Promise.all([fetch(pgliteWasmUrl()), fetch(pgliteDataUrl())])
  for (const r of [wasmRes, dataRes]) if (!r.ok) throw new Error(`${r.url} answered ${r.status}`)
  const responses = [datadirRes, wasmRes, dataRes]
  const total = responses.reduce((n, r) => n + (Number(r.headers.get('content-length')) || 0), 0)
  let received = 0
  let last = 0
  const onBytes = (n) => {
    received += n
    const now = Date.now()
    if (now - last >= 250) {
      last = now
      report({ phase: 'download', received, total })
    }
  }
  const [datadir, wasm, data] = await Promise.all(responses.map((r) => readChunks(r, onBytes)))
  report({ phase: 'start' })
  return { loadDataDir: new Blob(datadir), pgliteWasmModule: await WebAssembly.compile(await new Blob(wasm).arrayBuffer()), fsBundle: new Blob(data) }
}

// scope: the worker global (or a stand-in with postMessage and onmessage); boot(dataset, progress) -> { pg, prebuilt?, datasets? }.
// While booting, `progress(info)` posts { id, progress: info } to the client (the boot's own id), so it can tell a slow download from
// an engine that does not start.
export function attachEngine(scope, boot) {
  let engine = null
  const reply = (id, ok, payload) => scope.postMessage(ok ? { id, ok, result: payload } : { id, ok, error: payload })
  const fail = (e) => ({ code: e?.code ?? 'ENGINE_ERROR', message: String(e?.message ?? e) })

  scope.onmessage = async (ev) => {
    const { id, op, dataset, args } = ev.data
    try {
      if (op === 'boot') {
        const { pg, prebuilt = null, datasets = {} } = await boot(dataset, (progress) => scope.postMessage({ id, progress }))
        engine = await createEngine(pg, { clock: CLOCK, datasets, prebuilt })
        reply(id, true, null)
      } else if (!engine) {
        reply(id, false, { code: 'ENGINE_UNAVAILABLE', message: 'engine not booted' })
      } else {
        reply(id, true, await engine[op](...args))
      }
    } catch (e) {
      reply(id, false, fail(e))
    }
  }
}

const WorkerScope = globalThis.WorkerGlobalScope
if (WorkerScope && globalThis instanceof WorkerScope) {
  attachEngine(globalThis, (dataset, progress) => {
    reportBoot = progress
    return bootFromDatadir(dataset, import.meta.env.BASE_URL)
  })
}
