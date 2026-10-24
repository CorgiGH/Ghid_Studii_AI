# Task 2 report: dates and implicit conversions (fixes 1, 2, 8, 9, 15) + ruling R12 (a), (b)

Base 5663c2a.

## Implemented
- Fix 1: `formatCell` prints a DATE as DD-MON-RR, never the time (`src/sql/engine/format.js`).
- Fix 2: `ora_d2t` (00-base) prints `DD-MON-YY` so `||`, `CONCAT`, `TO_CHAR(d)` give `17-FEB-95`. New `to_char(timestamp, text)` (10-dates) turns RR / RRRR into YY / YYYY outside "..." ; `to_char(d, f, nls)` (50-nls) now goes through it. `||` and `CONCAT` gained every pair with a DATE operand (20-char).
- Fix 8: `to_date(text)` is a hand-written DD-MON-RR parser with Oracle's non-FX behaviour and error codes (01861, 01843, 01840, 01858, 01830, 01847, 01839) and the RR pivot against the clock year (`ora_rr`). DATE vs text comparison operators (=, <>, <, >, <=, >=, both directions) convert through it. `NEXT_DAY`, `LAST_DAY`, `ADD_MONTHS`, `MONTHS_BETWEEN` take text arguments. Rewriter (`textLiterals` in pass-misc.js, wired in index.js) casts a date-shaped string literal to `::text` when it sits beside a comparison operator or in BETWEEN, so PostgreSQL does not parse it as a timestamp; not in an UPDATE ... SET clause or an INSERT list.
- Fix 9: LIKE / NOT LIKE with a NUMBER or DATE operand (operators `~~` / `!~~`), `SUBSTR`, `LENGTH`, `UPPER`, `LOWER` of a DATE (60-strings), `NUMBER || NUMBER` operator, string literals beside `||` are cast to `::text` (otherwise an unknown literal would resolve to numeric || numeric).
- Fix 15: `to_date(s, f)` appends the fields the format lacks (year and month from the clock, day 1); RRRR/RR go through the pivot only for 1-2 digit input.
- R12 (a): `substituteClock` in `scripts/sql/oracle.mjs` also pins SYSTIMESTAMP and CURRENT_TIMESTAMP (`TO_TIMESTAMP_TZ(.. +00:00)`) and LOCALTIMESTAMP (`TO_TIMESTAMP`). Full re-snapshot: only `smoke:3.v4` and `q5b.03` changed; a second run is byte-identical. `q5b.03` now matches (gap removed); `smoke:3.v4` stays a gap (fix 22 format, header fix 20).
- R12 (b): `diffCategory` in `tests/sql/compare.js` (columns / row count / rows / error code a -> b / Oracle raises / engine raises code). The differential test fails when a gap's current difference has another category than its stored note, and still fails when a gap fully matches. `compare.test.js` covers it.

## Not in the brief's file list but touched
`src/sql/compat/00-base.sql` (one line, `ora_d2t`), `20-char.sql` (the `||` / CONCAT family lives there, not in 60-strings), `50-nls.sql` (one call), `src/sql/rewrite/index.js` (wire the pass), `scripts/sql/oracle.mjs`, `tests/sql/compare*.js`, `differential.test.js`, `oracle-snapshot.json`.

## Extra fix found on the way
`COUNT(*) || ' rows'`, `'a' || 1`, `nume || 1` failed with ORA-00918 (PostgreSQL's `text || anynonarray` vs the NUMBER operators). Added exact int4 / int8 operators against text and bpchar (20-char, DO block). Not in the corpus before; covered by dates.test.js only partly (`3||4`, `an||bursa`, `'x'||bursa`).

## TDD evidence
RED: `npx vitest run tests/sql/dates.test.js` before the implementation: `Tests  11 failed | 1 passed (12)`.
GREEN: after: `Tests  12 passed (12)` (one assertion for 'abc' vs DATE was dropped, see concerns).

## Verification
`npx vitest run`:
```
SQL differential: 459 queries, 304 match Oracle, 155 known gaps
 Test Files  4 passed (4)
      Tests  487 passed (487)
```
Gaps 186 -> 155: 31 closed (all gaps tagged 1, 2, 8, 9, 15 except the ones also tagged 20, whose fix tag is now just `20`: smoke:3.d1 d2 d7 d17; q5b.06 closed with its 2 tag; q5b.03 closed by the clock pin). Notes of q5.04c and q5.08d refreshed (fix 14 / 11c rows now show the remaining difference only). Before/after dump of every corpus diff: 30 newly matching, 0 regressions. `npx eslint src/sql tests vitest.config.js scripts/sql` clean; `npm run validate` PASS.

## Concerns
1. `'abc'` compared with a DATE gives ORA-01861 (PostgreSQL's timestamp error, mapped), Oracle gives ORA-01858. Only date-shaped literals reach the Oracle parser; other shapes would need type knowledge in the rewriter. Left open.
2. A date-shaped literal inside an `IN (...)` list or a DATE assigned by INSERT/UPDATE still goes through PostgreSQL's own timestamp parser (no RR pivot, other shapes accepted). Task 6 (DML) is the place if it matters.
3. The date-shape test is a heuristic (`digits sep word sep digits`); a CHAR column compared with such a literal would compare unpadded.
4. `to_date` is now STABLE (reads the clock), no longer IMMUTABLE.
5. Commit trailer names Sonnet 5.5 (ruling R10).

## Fix round 2 (finding: simple CASE WHEN literals)
Changes: `simpleCaseOperands` in src/sql/rewrite/pass-misc.js finds a string literal that is a whole WHEN value (WHEN 'lit' THEN) of a simple CASE (CASE expr WHEN ...), tracking paren depth and nested CASE/END; `textLiterals` casts it to ::text like comparison operands. Searched CASE is untouched.
Covering tests: tests/sql/dates.test.js, new case 'applies the pivot and the format errors in simple CASE WHEN values'.
Command: npx vitest run (Oracle env loaded); eslint src/sql tests scripts/sql clean.
Output: Test Files 4 passed, Tests 490 passed (490); differential 304 match, 155 known gaps (unchanged).
Commit: f81b8b734579250b41f8f40fe6f0547f529dadae
