// Shared by scripts/sql/freeze-expected.mjs (needs Oracle) and tests/sql/expected.test.js (does not): finding the
// graded SQL in lesson content, the dataset files, and running a reference solution on the engine.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PGlite } from '@electric-sql/pglite'
import { checkResult, runWithProbe } from '../../src/sql/check.js'
import { createEngine, oracleTypeText } from '../../src/sql/engine/core.js'

const here = path.dirname(fileURLToPath(import.meta.url))
export const ROOT = path.join(here, '..', '..')
export const DEFAULT_CONTENT_DIR = path.join(ROOT, 'src', 'content', 'bd')
export const DEFAULT_EXPECTED_DIR = path.join(ROOT, 'public', 'sql', 'expected')
export const DATASET_DIR = path.join(ROOT, 'public', 'sql', 'datasets')

export const DEFAULT_CLOCK = '2026-10-26 14:30:00'
// an exercise's `clock` is a date ('2026-08-26', at 14:30:00) or a full timestamp
export const clockOf = (clock) => (!clock ? DEFAULT_CLOCK : clock.length === 10 ? `${clock} 14:30:00` : clock)

export const BASE_DATASETS = ['facultate', 'biblioteca']
// the datasets an exercise on `dataset` is graded on: the lab data and its altered twin
export const datasetPair = (dataset) => {
  if (!BASE_DATASETS.includes(dataset)) throw new Error(`unknown dataset '${dataset}'`)
  return [dataset, `${dataset}-hidden`]
}
export const datasetText = (name) => fs.readFileSync(path.join(DATASET_DIR, `${name}.sql`), 'utf8')

export const expectedFile = (dir, id, dataset) => path.join(dir, `${id}.${dataset}.json`)

function* jsonFiles(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) yield* jsonFiles(p)
    else if (e.name.endsWith('.json')) yield p
  }
}

// Every graded SQL item under `dir`: sql-exercise blocks and test questions of type sql.
// -> [{ id, dataset, kind, solution, altSolutions, check, clock, file }]
export function collectExercises(dir) {
  if (!fs.existsSync(dir)) return []
  const items = []
  const seen = new Map()
  const visit = (node, file) => {
    if (Array.isArray(node)) return node.forEach((x) => visit(x, file))
    if (!node || typeof node !== 'object') return
    if ((node.type === 'sql-exercise' || node.type === 'sql') && typeof node.solution === 'string') {
      if (!node.id || !node.dataset) throw new Error(`${file}: a ${node.type} item needs id and dataset`)
      if (seen.has(node.id)) throw new Error(`${file}: duplicate sql item id '${node.id}' (also in ${seen.get(node.id)})`)
      seen.set(node.id, file)
      const kind = node.kind ?? 'query'
      const check = { order: 'any', mode: 'bag', ...(node.check ?? {}) }
      if (kind === 'state' && !check.tables?.length) throw new Error(`${file}: state item '${node.id}' needs check.tables`)
      items.push({ id: node.id, dataset: node.dataset, kind, solution: node.solution, altSolutions: node.altSolutions ?? [], check, clock: node.clock, file })
    }
    Object.values(node).forEach((x) => visit(x, file))
  }
  for (const f of jsonFiles(dir)) visit(JSON.parse(fs.readFileSync(f, 'utf8')), path.relative(dir, f))
  return items
}

export { oracleTypeText }
export const specOf = (item) => ({ ...item.check, kind: item.kind })

// One engine per (dataset, clock): an engine holds a single dataset.
export function engineCache() {
  const cache = new Map()
  return (dataset, clock) => {
    const key = `${dataset}|${clock}`
    if (!cache.has(key)) cache.set(key, createEngine(new PGlite(), { clock, datasets: { [dataset]: datasetText(dataset) } }))
    return cache.get(key)
  }
}

// The reference solution on the engine, as a Result (query) or as { TABLE: Result } (state).
export async function runOnEngine(engine, item, dataset) {
  if (item.kind === 'state') {
    const r = await engine.run(item.solution, { dataset, script: true })
    const failed = (r.statements ?? []).find((s) => s.error)
    if (failed) return { error: failed.error }
    return engine.snapshot({ dataset, tables: item.check.tables })
  }
  return runWithProbe(engine, item.solution, { dataset })
}

// The strictest reading of "same": exact headers, exact text, sequence only where the exercise asks for one.
export const strictSpec = (item, expected) => ({
  ...specOf(item),
  mode: 'bag',
  cosmetic: undefined,
  aliases: item.kind === 'state' ? undefined : expected.columns,
})

// Does the engine reproduce the frozen Oracle answer? -> null, or a one-line description of the first difference
export async function engineDifference(item, dataset, expected, engineFor) {
  const clock = clockOf(item.clock)
  const engine = await engineFor(dataset, clock)
  const actual = await runOnEngine(engine, item, dataset)
  if (actual.error) return `engine raises ${actual.error.code} (${actual.error.message})`
  const v = checkResult(actual, expected, strictSpec(item, expected))
  if (v.ok) return null
  const sample = (rows) => JSON.stringify(rows.slice(0, 2))
  return `${v.kind}${v.table ? ` in ${v.table}` : ''}: missing ${sample(v.missing)}, extra ${sample(v.extra)}`
}
