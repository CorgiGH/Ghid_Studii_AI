// For the lesson walk (scripts/sql/walk-lessons.mjs): one named wrong answer per graded exercise.
//
//   node scripts/sql/wrong-answers.mjs [--content src/content/bd/courses] [--out <file>]
//
// The wrong answer of an exercise is its named mistake from scripts/sql/named-mistakes.json: the classic error its hints, its
// explanation or the outline's trap name (no TRIM on a CHAR column, = NULL, swapped BETWEEN ends, no parentheses ...). Each one is
// graded on the lab dataset and on the hidden one against the frozen Oracle answers; the walk gets the first that neither dataset
// grades as correct and that is a real verdict (not just an ORA error). A generic mutation of the solution (drop the WHERE ...)
// is only the fallback for an exercise with no usable named mistake, and is listed under `fallback`.
// Writes { answers: { [id]: { name, sql, source, visible, hidden } }, fallback: [ids], none: [ids] }.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const here = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(here, '..', '..')
const argv = process.argv.slice(2)
const arg = (name, dflt) => (argv.includes(name) ? argv[argv.indexOf(name) + 1] : dflt)
const contentDir = path.resolve(arg('--content', path.join(ROOT, 'src', 'content', 'bd', 'courses')))
const outFile = path.resolve(arg('--out', path.join(ROOT, '.superpowers', 'sdd', '2026-10-24-bd-lessons', 'walk', 'wrong-answers.json')))

const vite = await createServer({ configFile: false, root: ROOT, appType: 'custom', logLevel: 'error', server: { middlewareMode: true, hmr: false, ws: false } })
try {
  const lib = await vite.ssrLoadModule('/scripts/sql/freeze-lib.mjs')
  const { checkResult } = await vite.ssrLoadModule('/src/sql/check.js')
  const mlib = await vite.ssrLoadModule('/scripts/sql/mistakes-lib.mjs')
  const named = mlib.loadNamedMistakes()
  const { splitScript } = await vite.ssrLoadModule('/src/sql/engine/script.js')
  const engineFor = lib.engineCache()

  // [name, function(sql) -> sql | null]
  const mutations = [
    ['drops the WHERE clause', (s) => { const m = /\s+WHERE\s[\s\S]*?(?=\s+(GROUP BY|ORDER BY|UNION|MINUS|INTERSECT)\b|$)/i.exec(s); return m ? s.replace(m[0], '') : null }],
    ['drops the last AND condition', (s) => { const m = /\s+AND\s+(?:(?!\s+AND\s)(?!\s+ORDER BY\b)[\s\S])+?(?=\s+ORDER BY\b|$)/i.exec(s); return m ? s.replace(m[0], '') : null }],
    ['forgets DISTINCT', (s) => (/\bDISTINCT\b/i.test(s) ? s.replace(/\bDISTINCT\s+/i, '') : null)],
    ['drops the quotes of an alias', (s) => (/\bAS\s+"[^"]+"/i.test(s) ? s.replace(/(\bAS\s+)"([^"]+)"/i, '$1$2') : null)],
    ['changes a number by one', (s) => (/(?<![\w.'"])\d+(?![\w.'"])/.test(s) ? s.replace(/(?<![\w.'"])(\d+)(?![\w.'"])/, (_, n) => String(Number(n) + 1)) : null)],
    ['changes a text value', (s) => (/'([^']+)'/.test(s) ? s.replace(/'([^']+)'/, (_, t) => `'${t}x'`) : null)],
    ['swaps > and <', (s) => (/[<>]/.test(s.replace(/<>/g, '')) ? s.replace(/<>/g, '\u0001').replace(/>=/g, '\u0002').replace(/<=/g, '\u0003').replace(/>/g, '\u0004').replace(/</g, '>').replace(/\u0004/g, '<').replace(/\u0002/g, '<=').replace(/\u0003/g, '>=').replace(/\u0001/g, '<>') : null)],
    ['turns the first INNER JOIN into LEFT JOIN', (s) => (/\bJOIN\b/i.test(s) && !/\b(LEFT|RIGHT|FULL)\b/i.test(s) ? s.replace(/\bJOIN\b/i, 'LEFT JOIN') : null)],
    ['reverses the sort direction', (s) => (/\bORDER BY\b/i.test(s) ? (/\bDESC\b/i.test(s) ? s.replace(/\bDESC\b/i, 'ASC') : s.replace(/(ORDER BY[^;)]*?)(\s*)$/i, '$1 DESC$2')) : null)],
    ['returns only the first column', (s) => { const m = /^(\s*SELECT\s+(?:DISTINCT\s+)?)([^,]+?)(,[\s\S]*?)(\s+FROM\s)/i.exec(s); return m ? s.replace(m[0], `${m[1]}${m[2]}${m[4]}`) : null }],
    ['keeps only the first statement', (s) => { const parts = splitScript(s); return parts.length > 1 ? parts[0] : null }],
    ['drops the last statement', (s) => { const parts = splitScript(s); return parts.length > 1 ? parts.slice(0, -1).join(';\n') : null }],
    ['uses tomorrow instead of today', (s) => (/\bSYSDATE\b/i.test(s) ? s.replace(/\bSYSDATE\b/i, '(SYSDATE + 1)') : null)],
    ['asks for one row only', (s) => (/^\s*SELECT\b/i.test(s) && !/\b(UNION|MINUS|INTERSECT)\b/i.test(s) ? `SELECT * FROM (${s.replace(/\s*;\s*$/, '')}) WHERE ROWNUM = 1` : null)],
  ]

  const items = lib.collectExercises(contentDir)
  const out = {}
  const none = []
  const fallback = []
  const caught = (k) => k !== 'correct' && k !== 'error'
  for (const item of items.filter((i) => i.id.startsWith('bd-l'))) {
    let pick = null
    for (const m of (named[item.id] ?? []).filter((x) => !x.trap)) {
      const g = await mlib.gradeMistake(item, m, engineFor)
      if (caught(g.visible) && caught(g.hidden)) { pick = { name: m.name, sql: m.sql, source: 'named', visible: g.visible, hidden: g.hidden }; break }
    }
    if (pick) { out[item.id] = pick; continue }
    const clock = lib.clockOf(item.clock)
    const expected = JSON.parse(fs.readFileSync(lib.expectedFile(lib.DEFAULT_EXPECTED_DIR, item.id, item.dataset), 'utf8'))
    const spec = lib.specOf(item)
    const seen = new Set([item.solution.trim()])
    let found = null
    for (const [name, mutate] of mutations) {
      let sql
      try { sql = mutate(item.solution) } catch { sql = null }
      if (!sql || seen.has(sql.trim())) continue
      seen.add(sql.trim())
      // a fresh engine for every candidate: a state exercise changes the dataset
      const engine = await (item.kind === 'state' ? lib.engineCache() : engineFor)(item.dataset, clock)
      let verdict
      try {
        let actual
        if (item.kind === 'state') {
          const r = await engine.run(sql, { dataset: item.dataset, script: true })
          const failed = (r.statements ?? []).find((s) => s.error)
          actual = failed ? { error: failed.error } : await engine.snapshot({ dataset: item.dataset, tables: item.check.tables })
        } else {
          actual = await engine.run(sql, { dataset: item.dataset })
        }
        verdict = actual.error ? { ok: false, kind: 'error' } : checkResult(actual, expected, spec)
      } catch {
        verdict = { ok: false, kind: 'error' }
      }
      if (!verdict.ok && verdict.kind !== 'error') { found = { name, sql, verdict: verdict.kind }; break }
    }
    if (found) { out[item.id] = { ...found, source: 'mutation' }; fallback.push(item.id) }
    else none.push(item.id)
  }
  fs.mkdirSync(path.dirname(outFile), { recursive: true })
  fs.writeFileSync(outFile, JSON.stringify({ answers: out, fallback, none }, null, 1) + '\n')
  console.log(`wrong answers: ${Object.keys(out).length} found (${Object.keys(out).length - fallback.length} named, ${fallback.length} generic fallback${fallback.length ? `: ${fallback.join(', ')}` : ''}), ${none.length} exercises without one${none.length ? `: ${none.join(', ')}` : ''}`)
} finally {
  await vite.close()
}
