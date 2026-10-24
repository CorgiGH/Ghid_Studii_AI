// Dev-only: runs the whole differential corpus on the Oracle 11g container and freezes the output into
// tests/sql/oracle-snapshot.json (committed; CI never talks to Oracle).
//
//   set -a; . ~/.config/bd-oracle.env; set +a
//   node scripts/sql/snapshot-oracle.mjs
//
// Two passes: values come from a run with the fixed clock substituted for SYSDATE / CURRENT_DATE; column headers come
// from a run without substitution (Oracle prints the expression as typed, so the substituted text must not leak into
// a header). A result stores at most SNAPSHOT_MAX_ROWS rows; rowCount keeps the real count and truncated says so.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { runOnOracle, NLS_RESET } from './oracle.mjs'

export const CLOCK = '2026-10-26 14:30:00'
export const SNAPSHOT_MAX_ROWS = 200

const here = path.dirname(fileURLToPath(import.meta.url))
const testsDir = path.join(here, '..', '..', 'tests', 'sql')

export function loadCorpus() {
  const dir = path.join(testsDir, 'corpus')
  const entries = []
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json')).sort()) {
    entries.push(...JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')))
  }
  const ids = new Set()
  for (const e of entries) {
    if (ids.has(e.id)) throw new Error(`duplicate corpus id ${e.id}`)
    ids.add(e.id)
  }
  return entries
}

// One flat statement list so the whole corpus is a single sqlplus session: an entry's `pre` statements (ALTER SESSION
// ...) run first and the NLS defaults are restored right after it.
function flatten(entries) {
  const statements = []
  const slot = []
  for (const e of entries) {
    for (const p of e.pre || []) statements.push(p)
    slot.push(statements.length)
    statements.push(e.sql)
    if (e.pre) statements.push(NLS_RESET)
  }
  return { statements, slot }
}

async function main() {
  const entries = loadCorpus()
  const { statements, slot } = flatten(entries)
  const valued = await runOnOracle(statements, { clock: CLOCK, dataset: 'facultate' })
  const plain = await runOnOracle(statements, { clock: null, dataset: 'facultate' })

  const snapshot = {}
  const harness = []
  entries.forEach((e, i) => {
    const v = valued[slot[i]]
    const h = plain[slot[i]]
    if (v.error && (v.error.code === 'HARNESS' || /^ORA-0(6502|6512|6550)$/.test(v.error.code) || !/^ORA-\d{5}$/.test(v.error.code))) {
      harness.push(`${e.id}: ${v.error.code} ${v.error.message}`)
    }
    const res = { kind: v.kind, columns: v.error ? [] : (h.error ? v.columns : h.columns), rows: v.error ? [] : v.rows.slice(0, SNAPSHOT_MAX_ROWS), rowCount: v.error ? 0 : v.rowCount, truncated: !v.error && v.rowCount > SNAPSHOT_MAX_ROWS }
    if (v.error) res.error = v.error
    snapshot[e.id] = res
  })
  if (harness.length) {
    console.error('harness-error entries:\n' + harness.join('\n'))
    process.exit(1)
  }
  fs.writeFileSync(path.join(testsDir, 'oracle-snapshot.json'), JSON.stringify(snapshot, null, 1) + '\n')
  const errors = Object.values(snapshot).filter((r) => r.error).length
  console.log(`snapshot: ${entries.length} entries, ${errors} Oracle errors, clock ${CLOCK}, 0 harness-error`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main()
