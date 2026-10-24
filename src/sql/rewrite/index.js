// Oracle 11g SQL -> PostgreSQL (PGlite) source-to-source rewriter for the BD lab subset.
// Token based (strings, "quoted ids" and comments are never touched). Pure ES module, runs in node and in the browser.
//
//   rewriteOracle(sql, { clock?, columns? }) -> { sql, notes, post }  throws OracleError { code, message } for what Oracle rejects
//                                                           post: statements to run right after `sql` succeeded (DDL bookkeeping)
//
// What the passes do (each is covered by the differential tests):
//   ''                 -> NULL                     (Oracle: empty string IS NULL)
//   SYSDATE, CURRENT_DATE, SYSTIMESTAMP, CURRENT_TIMESTAMP, LOCALTIMESTAMP -> the fixed clock
//   USER               -> 'STUDENT'
//   MINUS              -> EXCEPT;   a UNION b INTERSECT c -> (a UNION b) INTERSECT c;   UNION / INTERSECT / MINUS rows come back sorted;   SELECT UNIQUE -> SELECT DISTINCT;   VARCHAR2 / CAST(.. AS NUMBER) -> VARCHAR / NUMERIC
//   LIKE 'pat'         -> LIKE 'pat' ESCAPE ''     (Oracle has no default escape char; PG defaults to backslash;
//                                                   a built pattern 'P' || '%' is parenthesised first)
//   DECODE / GREATEST / LEAST / ANY / TRIM          -> PostgreSQL forms with Oracle NULL behaviour
//   'x' || n, d > '01-JAN-60' -> 'x'::text || n, d > '01-JAN-60'::text   (implicit conversions go through the compat operators)
//   a.x = b.y(+)       -> LEFT/RIGHT JOIN ... ON
//   NATURAL JOIN + qualified common column          -> ORA-25155
//   lint.js: LIMIT / FETCH / OFFSET / AS table alias / ILIKE / :: / EXCEPT / INTERSECT ALL / CONCAT(a,b,c) / JOIN .. USING qualified
//                                                   -> the ORA code Oracle 11g gives
//   ROWNUM             -> LIMIT or row_number() over ()      "NUME" -> "nume"      ^= -> <>
//   CREATE / ALTER / DROP TABLE, RENAME, DELETE t -> pass-ddl.js (Oracle types, constraint names, CASCADE CONSTRAINTS)
// Known gaps are listed in tests/sql/known-gaps.json together with the fix that closes each.
import { OracleError } from '../engine/errors.js'
import { isSig, isSym, tokenize, untokenize } from './tokens.js'
import { emptyStringToNull, trimBlanksToNull } from './pass-empty-string.js'
import { clockPass } from './pass-clock.js'
import { minusToExcept, setOperatorPrecedence, sortSetOperatorOutput } from './pass-setops.js'
import { miscMap, anyList, textLiterals, rownumPass } from './pass-misc.js'
import { lintOracle } from './lint.js'
import { likeEscape } from './pass-like.js'
import { charLiteralArgs, decodePass } from './pass-decode.js'
import { outerJoinPass } from './pass-outer-join.js'
import { naturalJoinCheck, upperQuotedIdents } from './pass-idents.js'
import { ddlPass } from './pass-ddl.js'

export { tokenize, untokenize }

const CLOCK_RE = /^\d{4}-\d\d-\d\d \d\d:\d\d:\d\d$/

export function rewriteOracle(sql, opts = {}) {
  const { clock, columns } = opts
  if (clock !== undefined && !CLOCK_RE.test(clock)) throw new Error(`clock must look like 'YYYY-MM-DD HH24:MI:SS', got '${clock}'`)
  const notes = []
  let ts = tokenize(sql)
  // strip the SQL*Plus terminators (; or /) after the statement
  while (ts.length && (!isSig(ts[ts.length - 1]) || isSym(ts[ts.length - 1], ';') || isSym(ts[ts.length - 1], '/'))) ts.pop()
  // one statement per run; Oracle 11g (DBMS_SQL, measured) answers ORA-00911 for a second statement, not ORA-00933
  if (ts.some((t) => isSym(t, ';'))) throw new OracleError('ORA-00911', 'invalid character')
  const bad = lintOracle(sql)
  if (bad) throw new OracleError(bad.code, bad.message)
  naturalJoinCheck(ts)
  ts = upperQuotedIdents(ts)
  const ddl = ddlPass(ts, { columns })
  ts = ddl.ts
  ts = emptyStringToNull(ts)
  ts = clockPass(ts, clock)
  ts = miscMap(ts)
  ts = rownumPass(ts)
  ts = minusToExcept(ts)
  ts = likeEscape(ts)
  ts = anyList(ts)
  ts = decodePass(ts)
  ts = charLiteralArgs(ts)
  ts = trimBlanksToNull(ts)
  ts = textLiterals(ts)
  ts = outerJoinPass(ts, notes)
  ts = setOperatorPrecedence(ts)
  ts = sortSetOperatorOutput(ts)
  return { sql: untokenize(ts), notes, post: ddl.post }
}
