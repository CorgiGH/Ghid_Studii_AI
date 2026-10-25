// The SQL engine inside a Web Worker. Messages (all carry the id of the request they answer):
//   client -> worker   { id, op: 'boot', dataset } | { id, op: 'run' | 'describe' | 'snapshot' | 'reset', args: [...] }
//   worker -> client   { id, ok: true, result } | { id, ok: false, error: { code, message } }
// 'boot' starts PGlite from the prebuilt data directory of the dataset (public/sql/datadir-<dataset>.tar.gz), so the compat layer
// and the data are not replayed. A worker serves one dataset; the client boots a new worker to switch.
import { createEngine } from './core.js'

export const CLOCK = '2026-10-26 14:30:00'

// the default boot: fetch the data directory next to the page and start PGlite from it
export async function bootFromDatadir(dataset, baseUrl) {
  const [{ PGlite }, res] = await Promise.all([import('@electric-sql/pglite'), fetch(`${baseUrl}sql/datadir-${dataset}.tar.gz`)])
  if (!res.ok) throw new Error(`data directory for '${dataset}' answered ${res.status}`)
  const loadDataDir = await res.blob()
  const pg = new PGlite({ loadDataDir })
  return { pg, prebuilt: dataset }
}

// scope: the worker global (or a stand-in with postMessage and onmessage); boot(dataset) -> { pg, prebuilt?, datasets? }
export function attachEngine(scope, boot) {
  let engine = null
  const reply = (id, ok, payload) => scope.postMessage(ok ? { id, ok, result: payload } : { id, ok, error: payload })
  const fail = (e) => ({ code: e?.code ?? 'ENGINE_ERROR', message: String(e?.message ?? e) })

  scope.onmessage = async (ev) => {
    const { id, op, dataset, args } = ev.data
    try {
      if (op === 'boot') {
        const { pg, prebuilt = null, datasets = {} } = await boot(dataset)
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
  attachEngine(globalThis, (dataset) => bootFromDatadir(dataset, import.meta.env.BASE_URL))
}
