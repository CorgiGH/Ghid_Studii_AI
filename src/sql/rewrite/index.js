// Oracle 11g SQL -> PostgreSQL (PGlite) source-to-source rewriter for the BD lab subset.
// Token based (strings, "quoted ids" and comments are never touched). Pure ES module, runs in node and in the browser.
//
//   rewriteOracle(sql, { clock? }) -> { sql, notes }       throws OracleError { code, message } for what Oracle rejects
//
// What the passes do (each is covered by the differential tests):
//   ''                 -> NULL                     (Oracle: empty string IS NULL)
//   SYSDATE, CURRENT_DATE, SYSTIMESTAMP, CURRENT_TIMESTAMP, LOCALTIMESTAMP -> the fixed clock
//   USER               -> 'STUDENT'
//   MINUS              -> EXCEPT;   SELECT UNIQUE -> SELECT DISTINCT;   VARCHAR2 / CAST(.. AS NUMBER) -> VARCHAR / NUMERIC
//   LIKE 'pat'         -> LIKE 'pat' ESCAPE ''     (Oracle has no default escape char; PG defaults to backslash)
//   DECODE / GREATEST / LEAST / ANY / TRIM          -> PostgreSQL forms with Oracle NULL behaviour
//   a.x = b.y(+)       -> LEFT/RIGHT JOIN ... ON
//   NATURAL JOIN + qualified common column          -> ORA-25155
// Known gaps are listed in tests/sql/known-gaps.json together with the fix that closes each.
import { OracleError } from '../engine/errors.js'
import { isSig, isSym, tokenize, untokenize } from './tokens.js'
import { simpleMap } from './pass-simple.js'
import { likeEscape } from './pass-like.js'
import { callTransforms } from './pass-calls.js'
import { outerJoinPass } from './pass-outer-join.js'
import { naturalJoinCheck } from './pass-natural-join.js'

export { tokenize, untokenize }

const CLOCK_RE = /^\d{4}-\d\d-\d\d \d\d:\d\d:\d\d$/

export function rewriteOracle(sql, opts = {}) {
  const { clock } = opts
  if (clock !== undefined && !CLOCK_RE.test(clock)) throw new Error(`clock must look like 'YYYY-MM-DD HH24:MI:SS', got '${clock}'`)
  const notes = []
  let ts = tokenize(sql)
  // strip the SQL*Plus terminators (; or /) after the statement
  while (ts.length && (!isSig(ts[ts.length - 1]) || isSym(ts[ts.length - 1], ';') || isSym(ts[ts.length - 1], '/'))) ts.pop()
  // one statement per run, like Oracle's own parser
  if (ts.some((t) => isSym(t, ';'))) throw new OracleError('ORA-00933', 'SQL command not properly ended')
  naturalJoinCheck(ts)
  ts = simpleMap(ts, clock)
  ts = likeEscape(ts)
  ts = callTransforms(ts)
  ts = outerJoinPass(ts, notes)
  return { sql: untokenize(ts), notes }
}
