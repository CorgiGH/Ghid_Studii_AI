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
//   'x' || n, d > '01-JAN-60' -> 'x'::text || n, d > '01-JAN-60'::text   (implicit conversions go through the compat operators)
//   a.x = b.y(+)       -> LEFT/RIGHT JOIN ... ON
//   NATURAL JOIN + qualified common column          -> ORA-25155
// Known gaps are listed in tests/sql/known-gaps.json together with the fix that closes each.
import { OracleError } from '../engine/errors.js'
import { isSig, isSym, tokenize, untokenize } from './tokens.js'
import { emptyStringToNull, trimBlanksToNull } from './pass-empty-string.js'
import { clockPass } from './pass-clock.js'
import { minusToExcept } from './pass-setops.js'
import { miscMap, anyList, textLiterals } from './pass-misc.js'
import { likeEscape } from './pass-like.js'
import { decodePass } from './pass-decode.js'
import { outerJoinPass } from './pass-outer-join.js'
import { naturalJoinCheck } from './pass-idents.js'

export { tokenize, untokenize }

const CLOCK_RE = /^\d{4}-\d\d-\d\d \d\d:\d\d:\d\d$/

export function rewriteOracle(sql, opts = {}) {
  const { clock } = opts
  if (clock !== undefined && !CLOCK_RE.test(clock)) throw new Error(`clock must look like 'YYYY-MM-DD HH24:MI:SS', got '${clock}'`)
  const notes = []
  let ts = tokenize(sql)
  // strip the SQL*Plus terminators (; or /) after the statement
  while (ts.length && (!isSig(ts[ts.length - 1]) || isSym(ts[ts.length - 1], ';') || isSym(ts[ts.length - 1], '/'))) ts.pop()
  // one statement per run; Oracle 11g (DBMS_SQL, measured) answers ORA-00911 for a second statement, not ORA-00933
  if (ts.some((t) => isSym(t, ';'))) throw new OracleError('ORA-00911', 'invalid character')
  naturalJoinCheck(ts)
  ts = emptyStringToNull(ts)
  ts = clockPass(ts, clock)
  ts = miscMap(ts)
  ts = minusToExcept(ts)
  ts = likeEscape(ts)
  ts = anyList(ts)
  ts = decodePass(ts)
  ts = trimBlanksToNull(ts)
  ts = textLiterals(ts)
  ts = outerJoinPass(ts, notes)
  return { sql: untokenize(ts), notes }
}
