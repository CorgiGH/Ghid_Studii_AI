// Dev-only: runs the whole differential corpus on the Oracle 11g container and freezes the output into
// tests/sql/oracle-snapshot.json (committed; CI never talks to Oracle).
//
//   set -a; . ~/.config/bd-oracle.env; set +a
//   node scripts/sql/snapshot-oracle.mjs
//
// Two passes: values come from a run with the fixed clock substituted for SYSDATE / CURRENT_DATE; column headers come
// from a run without substitution (Oracle prints the expression as typed, so the substituted text must not leak into
// a header). A result stores at most SNAPSHOT_MAX_ROWS rows; rowCount keeps the real count and truncated says so. A cut
// result that has no defined order (no ORDER BY, no sorted set operator) also stores `digest`, an order-independent hash
// of all its rows, so the differential test can still compare it as a whole.
//
// An entry with `orderKeySql` (the same query reduced to its ORDER BY key columns, same FROM/WHERE/ORDER BY) also gets
// `orderKeys` in the snapshot: the key values of the stored result rows (cut at SNAPSHOT_MAX_ROWS like the rows), in
// Oracle's order. Rows whose keys are equal are tied, and Oracle's order inside a tie is unspecified, so
// tests/sql/compare.js accepts any permutation inside a tie.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { runOnOracle, NLS_RESET } from './oracle.mjs'
import { expectsSequence, rowsDigest } from '../../tests/sql/compare.js'

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
  const sessionAt = [] // per entry: the indexes of its pre statements and of the NLS reset after it
  for (const e of entries) {
    const at = []
    for (const p of e.pre || []) { at.push(statements.length); statements.push(p) }
    slot.push(statements.length)
    statements.push(e.sql)
    if (e.pre) { at.push(statements.length); statements.push(NLS_RESET) }
    sessionAt.push(at)
  }
  const keySlot = new Map()
  entries.forEach((e) => {
    if (!e.orderKeySql) return
    keySlot.set(e.id, statements.length)
    statements.push(e.orderKeySql)
  })
  return { statements, slot, keySlot, sessionAt }
}

async function main() {
  const entries = loadCorpus()
  const { statements, slot, keySlot, sessionAt } = flatten(entries)
  const valued = await runOnOracle(statements, { clock: CLOCK, dataset: 'facultate' })
  const plain = await runOnOracle(statements, { clock: null, dataset: 'facultate' })

  const snapshot = {}
  const harness = []
  entries.forEach((e, i) => {
    // a pre statement (ALTER SESSION ...) or the reset after it that Oracle refused would freeze a result of the wrong session
    for (const at of sessionAt[i]) if (valued[at].error) harness.push(`${e.id}: session statement failed on Oracle: ${valued[at].error.code} ${valued[at].error.message}`)
    const v = valued[slot[i]]
    const h = plain[slot[i]]
    if (v.error && (v.error.code === 'HARNESS' || /^ORA-0(6502|6512|6550)$/.test(v.error.code) || !/^ORA-\d{5}$/.test(v.error.code))) {
      harness.push(`${e.id}: ${v.error.code} ${v.error.message}`)
    }
    const res = { kind: v.kind, columns: v.error ? [] : (h.error ? v.columns : h.columns), rows: v.error ? [] : v.rows.slice(0, SNAPSHOT_MAX_ROWS), rowCount: v.error ? 0 : v.rowCount, truncated: !v.error && v.rowCount > SNAPSHOT_MAX_ROWS }
    if (v.error) res.error = v.error
    if (res.truncated && !expectsSequence(e.sql)) res.digest = rowsDigest(v.rows)
    if (e.orderKeySql) {
      const k = valued[keySlot.get(e.id)]
      if (k.error || v.error || k.rowCount !== v.rowCount || k.truncated) harness.push(`${e.id}: orderKeySql does not return one key row per result row`)
      else res.orderKeys = k.rows.slice(0, SNAPSHOT_MAX_ROWS)
    }
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
