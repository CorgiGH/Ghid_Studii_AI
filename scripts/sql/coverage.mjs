// Is every official exercise of the four labs in the lessons exactly once?
//
//   node scripts/sql/coverage.mjs [<courses dir>]      (default src/content/bd/courses)
//
// Lists the sql-exercise blocks that carry `official: { lab, ex }` and exits non-zero unless
//   lab 1: ex 1-3;  lab 2: inline-1, inline-2 and ex 1-15;  lab 3: ex 1-13;  lab 4: ex 1-14
// each appear exactly once. Exercises the lessons add themselves (no `official`) are not counted.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i)
export const REQUIRED = {
  1: range(1, 3),
  2: ['inline-1', 'inline-2', ...range(1, 15)],
  3: range(1, 13),
  4: range(1, 14),
}

export function officialExercises(dir) {
  const found = []
  const visit = (node, file) => {
    if (Array.isArray(node)) return node.forEach((x) => visit(x, file))
    if (!node || typeof node !== 'object') return
    if (node.type === 'sql-exercise' && node.official) found.push({ lab: node.official.lab, ex: node.official.ex, id: node.id, file })
    Object.values(node).forEach((x) => visit(x, file))
  }
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json')).sort()) visit(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')), f)
  return found
}

// -> { missing: ['lab 2 ex 4'], repeated: ['lab 3 ex 1: a, b'], unknown: ['lab 5 ex 1: id'] }
export function coverage(dir) {
  const found = officialExercises(dir)
  const key = (lab, ex) => `lab ${lab} ex ${ex}`
  const by = new Map()
  for (const f of found) by.set(key(f.lab, f.ex), [...(by.get(key(f.lab, f.ex)) ?? []), f.id])
  const missing = []
  const repeated = []
  for (const [lab, exs] of Object.entries(REQUIRED)) {
    for (const ex of exs) {
      const ids = by.get(key(lab, ex)) ?? []
      if (ids.length === 0) missing.push(key(lab, ex))
      if (ids.length > 1) repeated.push(`${key(lab, ex)}: ${ids.join(', ')}`)
    }
  }
  const wanted = new Set(Object.entries(REQUIRED).flatMap(([lab, exs]) => exs.map((ex) => key(lab, ex))))
  const unknown = [...by].filter(([k]) => !wanted.has(k)).map(([k, ids]) => `${k}: ${ids.join(', ')}`)
  return { found, by, missing, repeated, unknown }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dir = path.resolve(process.argv[2] ?? path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'src', 'content', 'bd', 'courses'))
  const { by, missing, repeated, unknown } = coverage(dir)
  for (const [lab, exs] of Object.entries(REQUIRED)) {
    console.log(`lab ${lab}: ${exs.map((ex) => `${ex} ${(by.get(`lab ${lab} ex ${ex}`) ?? ['-']).join('+')}`).join('  ')}`)
  }
  for (const m of missing) console.error(`MISSING ${m}`)
  for (const r of repeated) console.error(`REPEATED ${r}`)
  for (const u of unknown) console.error(`NOT AN OFFICIAL EXERCISE ${u}`)
  const bad = missing.length + repeated.length + unknown.length
  console.log(bad ? `coverage: ${bad} problem(s)` : `coverage: all ${[...by.values()].length} official exercises appear exactly once`)
  process.exitCode = bad ? 1 : 0
}
