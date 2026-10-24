# BD SQL Lessons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a "Baze de date" subject in Ghid_Studii_AI that teaches everything in BD labs 1–4 from zero, one screen at a time, with runnable Oracle-faithful SQL graded against answers frozen from real Oracle 11g.

**Architecture:** A new `LessonPlayer` renders each course step as one full screen with motion transitions and gating. SQL runs in a Web Worker on PGlite with an Oracle-compatibility layer (SQL functions + a query rewriter split into passes); a deterministic checker compares results with expected outputs produced by a real Oracle XE 11g container and committed as data. Lessons are course JSON using five new block types; progress and a review pile live in localStorage behind a store interface.

**Tech Stack:** React 19, Vite 8, Tailwind 4, react-router 7, `motion` 12 (installed), `@electric-sql/pglite` 0.5.11, `@codemirror/lang-sql` 6.10.0 with the installed `codemirror` 6.0.2, `vitest` 4.1.12 (new, dev), Oracle XE 11.2.0.2 in rootless Docker (dev-only reference).

**Spec:** `docs/superpowers/specs/2026-10-24-bd-lessons-design.md` and its content outline `docs/superpowers/specs/2026-10-24-bd-lessons-content-outline.md`. Read both before any task.

## Global Constraints

- Learner language Romanian; every `{en, ro}` string has both sides, English is a real translation (spec §5, `validate-bilingual.mjs`).
- No pedagogy labels, study citations or phase names in learner text (spec §3 anti-goals).
- Animations advance manually only; every animation honours `prefers-reduced-motion` (spec §3, §4).
- All asset URLs go through `import.meta.env.BASE_URL` (base `/Ghid_Studii_AI/`).
- SQL engine, WASM, datasets and expected outputs load lazily and never enter the eager JSON glob of `src/content/jsonLoader.js` (keep them under `public/sql/` or a lazy chunk).
- Fixed clock: SYSDATE/CURRENT_DATE = `2026-10-26 14:30:00`; second clock `2026-08-26 14:30:00` only where the outline marks it (spec §5).
- Oracle display defaults: NLS AMERICAN/AMERICA, `DD-MON-RR`, AL32UTF8, up to 39 significant digits (spec §8 "Measured against real Oracle").
- Expected answers come only from Oracle 11g; a mismatch between engine and Oracle on an exercise's reference solution blocks that exercise (spec §8).
- Engine rejects Oracle-invalid syntax with the 11g ORA code (spec §8 item 13; review fix #18).
- No PDFs, slides or other course files added to this public repo (spec §4).
- Don't commit `.claude/settings.local.json`, `scripts/review-gemini-alo-c11.mjs`, `.superpowers/`, or other pre-existing untracked files; `git add` only the paths a task names.
- Oracle container: `oraxe11`, `DOCKER_HOST=unix:///run/user/1000/docker.sock`, user `STUDENT`, password from env `ORA_STUDENT_PW` (never written to files or logs). Port bound to 127.0.0.1.
- Push to `main` only in the final task, after every spec §10 check passes (Alex: "you can push.").
- No time or effort estimates in any written output.

## Review Focus

1. A learner pastes a query with a trailing semicolon, several statements, comments, lowercase keywords or Romanian diacritics in literals: it must run as Oracle would (one statement per run; a second statement gives a clear message), never crash the worker. → Task 1 test `rewrite handles semicolons, comments, case, diacritics`.
2. A learner writes an endless or huge query (cartesian product of all five tables, recursive nonsense): the worker must stay responsive, cap displayed rows (show the count), and allow a cancel. → Task 8 test `runaway query is capped and cancellable`.
3. A learner's DML/DDL (DELETE without WHERE, DROP TABLE) must not leak into the next exercise or the next run. → Task 6 test `dml and ddl never leak between runs`.
4. Reload, back button or a shared link mid-lesson lands on the same screen with the same answers shown, and a corrupted or old `bdLessonState` value doesn't break the page. → Task 9 test `resume from url and survives corrupted storage`.
5. Phone-width Chrome where PGlite fails to start: the SQL screens degrade to paper mode instead of an endless spinner. → Task 8 test `engine start failure switches to paper mode`.

---

## File Structure

```
src/sql/
  rewrite/index.js          rewriteOracle(sql, opts) — runs the passes in order
  rewrite/tokens.js         tokenize(sql) / untokenize(tokens) (string-, comment-, quote-aware)
  rewrite/pass-*.js         one pass per concern (empty-string, clock, setops, outer-join, decode, like, idents, misc)
  rewrite/lint.js           lintOracle(sql) — Oracle 11g strictness
  compat/00-base.sql … 70-ddl.sql   Oracle-compat SQL, by family
  engine/core.js            createEngine(pg, opts) — environment-agnostic
  engine/format.js          formatCell(value, typeOid, typmod)
  engine/errors.js          mapPgError(err)
  engine/worker.js          browser worker wrapping core.js
  engine/client.js          getSqlClient() — page-side API
  check.js                  checkResult(actual, expected, spec)
  mistakes.js               detectMistake(input)
  explain.js                explainOra(code), explainMistake(id), explainVerdict(verdict)
src/lesson/
  store.js                  createLessonStore(storage)
  useLessonStore.js         React hook over the store
src/components/lesson/
  LessonPlayer.jsx          one-screen player
  ScreenGate.jsx            gate context + useScreenGate()
  SchemaPanel.jsx           schema drawer for the active dataset
  ResultTable.jsx           result/expected table with diff highlighting
  SqlEditor.jsx             CodeMirror SQL editor
  blocks/SqlExerciseBlock.jsx, QueryMachineBlock.jsx, ReflectBlock.jsx, McqBlock.jsx, VizBlock.jsx
  viz/kit.js                shared motion variants + useStepper()
  viz/<Widget>.jsx          one file per widget (Task 12 table)
  ReviewTab.jsx             Recapitulare tab
src/components/blocks/test/SqlQuestion.jsx   test question type 'sql'
src/content/bd/index.js, courses/lesson-NN.json, tests/mock-l1.json, practice/Practice.jsx
public/sql/                 datasets, prebuilt data dirs, expected/*.json
scripts/sql/                oracle.mjs, snapshot-oracle.mjs, freeze-expected.mjs, build-datadirs.mjs, measure-browser.mjs
tests/sql/                  *.test.js, corpus/*.json, oracle-snapshot.json, known-gaps.json
tests/lesson/               *.test.js
```

Source material outside the repo (read, don't commit): `/home/alexa/hub/docs/2026-10-24-research-bd-lessons/` — `sql-spike/` (starting code), `oracle-diff/` (Oracle harness, corpus, `oracle_expected.json`), `reports/oracle-diff-review.md` (the 22 prioritised fixes with Oracle evidence; cited below as "fix #N"), `official/` (lab pages, `facultate.sql`), `mock-test-biblioteca.sql`.

---

### Task 1: Engine core in the repo, test runner, differential harness

**Files:**
- Create: `src/sql/rewrite/index.js`, `src/sql/rewrite/tokens.js`, `src/sql/rewrite/pass-*.js` (ported from `sql-spike/rewrite.js`, split per concern), `src/sql/compat/00-base.sql`…`70-ddl.sql` (ported from `sql-spike/compat.sql`, split per family), `src/sql/engine/core.js`, `src/sql/engine/format.js`, `src/sql/engine/errors.js`, `public/sql/datasets/facultate.sql` (from `sql-spike/schema_data.sql`), `scripts/sql/oracle.mjs`, `scripts/sql/snapshot-oracle.mjs`, `tests/sql/corpus/*.json`, `tests/sql/oracle-snapshot.json`, `tests/sql/known-gaps.json`, `tests/sql/differential.test.js`, `tests/sql/rewrite.test.js`, `vitest.config.js`
- Modify: `package.json` (devDependency `vitest` 4.1.12, dependency `@electric-sql/pglite` 0.5.11, script `"test": "vitest run"`), `.github/workflows/deploy.yml` (node-version 22; `npm test` after `npm run validate`)

**Interfaces:**
- Produces:
  - `rewriteOracle(sql: string, opts?: { clock?: string }) => { sql: string, notes: string[] }`
  - `tokenize(sql: string) => Token[]`, `untokenize(tokens: Token[]) => string` where `Token = { type: 'word'|'string'|'qident'|'number'|'op'|'space'|'comment'|'punct', text: string }`
  - `createEngine(pg: PGlite, opts: { clock: string, datasets: Record<string, string> }) => Promise<Engine>`
  - `Engine.run(sql: string, o: { dataset: string, maxRows?: number }) => Promise<Result>`
  - `Result = { kind: 'rows'|'ddl'|'dml'|'tx', columns: string[], rows: (string|null)[][], rowCount: number, truncated: boolean, error?: { code: string, message: string } }` — cells are already Oracle display text.
  - `formatCell(value: unknown, typeOid: number, typmod: number) => string|null`
  - `mapPgError(err: unknown) => { code: string, message: string }`
  - `runOnOracle(statements: string[], o: { clock: string, dataset: string }) => Promise<Result[]>` (in `scripts/sql/oracle.mjs`; same `Result` shape; dev-only)

- [ ] **Step 1:** Add the dependencies and `vitest.config.js` (environment `node`, include `tests/**/*.test.js`, testTimeout 60000). Run `npm install`. Expected: `npx vitest --version` prints `4.1.12`.
- [ ] **Step 2: Write the failing tests.** `tests/sql/rewrite.test.js`: `rewrite handles semicolons, comments, case, diacritics` — `rewriteOracle("select nume from studenti where prenume = 'Ștefan'; -- x")` returns SQL with no trailing `;`, the literal unchanged, and `notes` empty; two statements `"select 1 from dual; select 2 from dual"` → throws `{ code: 'ORA-00933' }`-shaped error. `tests/sql/differential.test.js`: for every corpus entry, `engine.run` equals `oracle-snapshot.json[id]` (columns, rows, error code), unless `id` is in `known-gaps.json`.
- [ ] **Step 3:** Build the corpus from `/home/alexa/hub/docs/2026-10-24-research-bd-lessons/oracle-diff/corpus.json` plus the 150 step-5 probes (`q5*.json` in the same folder). Port the Oracle harness (`oracle-diff/run_oracle.mjs`, `reverify/ora.mjs`) into `scripts/sql/oracle.mjs` and write `scripts/sql/snapshot-oracle.mjs` that runs the corpus on `oraxe11` with the 14:30 clock and writes `tests/sql/oracle-snapshot.json`. Run it. Expected: 458 entries, none marked `harness-error`.
- [ ] **Step 4:** Port the spike into the files above, split by concern (no behaviour change yet). `known-gaps.json` lists every currently failing corpus id with the fix number that will close it.
- [ ] **Step 5:** Run `npm test`. Expected: PASS (all failures are listed gaps); the summary line prints the gap count.
- [ ] **Step 6: Commit** `git add package.json package-lock.json vitest.config.js .github/workflows/deploy.yml src/sql public/sql/datasets/facultate.sql scripts/sql tests/sql && git commit -m "feat(sql): oracle-compat engine core, vitest, oracle differential harness"`

### Task 2: Dates and implicit conversions (fixes #1, #2, #8, #9, #15)

**Files:** Modify `src/sql/engine/format.js`, `src/sql/compat/10-dates.sql`, `src/sql/compat/60-strings.sql`, `src/sql/rewrite/pass-misc.js`; Test `tests/sql/dates.test.js`, `tests/sql/known-gaps.json`

**Interfaces:** Consumes Task 1 `Engine`, `formatCell`. Produces no new names.

- [ ] **Step 1: Failing tests** (Oracle values from `oracle-diff-review.md`): `SELECT SYSDATE FROM dual` → `26-OCT-26`; `SELECT nume||data_nastere FROM studenti WHERE nr_matricol='111'` → `Popescu17-FEB-95`; `SELECT COUNT(*) FROM studenti WHERE data_nastere > '01-JAN-60'` → `13`; `NEXT_DAY('13-OCT-55','TUESDAY')` → `18-OCT-55`; `TO_DATE('1995','YYYY')` → `01-OCT-95`; `TO_DATE('17/02','DD/MM')` year `2026`; `'01/01/1997'` compared to a DATE → error `ORA-01843`; `bursa LIKE '4%'` → 1 row; `SUBSTR(data_nastere,4,3)` → `FEB`.
- [ ] **Step 2:** Run `npx vitest run tests/sql/dates.test.js`. Expected: FAIL.
- [ ] **Step 3:** Implement: DATE display `DD-MON-RR` without time; implicit DATE→text through `DD-MON-RR` (including `||`, `CONCAT`, `TO_CHAR(d)`, `RR`/`RRRR` in formats); implicit text→DATE through `TO_DATE(s,'DD-MON-RR')` with the RR pivot and Oracle's errors for other shapes; implicit NUMBER→text in LIKE/SUBSTR/`||` (including `num||num`); TO_DATE missing fields default to day 1 of the clock's month and year.
- [ ] **Step 4:** Run `npm test`. Expected: PASS; remove the closed ids from `known-gaps.json` (the differential test fails if a listed gap now passes, so the list can't go stale).
- [ ] **Step 5: Commit** `feat(sql): oracle date display and implicit conversions`.

### Task 3: CHAR semantics, set operators, LIKE, empty strings (fixes #3, #4a, #4b, #6, #7, #17, #21)

**Files:** Modify `src/sql/compat/20-char.sql`, `src/sql/rewrite/pass-setops.js`, `pass-outer-join.js`, `pass-like.js`, `pass-empty-string.js`, `pass-decode.js`; Test `tests/sql/char-setops.test.js`

- [ ] **Step 1: Failing tests:** `UPPER(nume)='BREABAN'` on profesori → 1 row; `RPAD(nume,12,'*')` for Breaban → `Breaban   **`; `prenume` studenti `INTERSECT` profesori → 0 rows, `UNION` → 26, `MINUS` → 11; `DECODE(nr_matricol,'111','da','nu')` for 111 → `nu`; `an=1 UNION an=2 INTERSECT an=2` style precedence → 3 rows; a `(+)` query followed by `UNION` (L4.6 old style) → 18 rows; `nume LIKE 'P'||'%'` → 4 rows; `TRANSLATE('b','ab','x') IS NULL` → true; set-operator results with no ORDER BY come back sorted (L2.11b, L2.14, L4.12).
- [ ] **Step 2:** Run, expect FAIL.
- [ ] **Step 3:** Implement the two CHAR parts separately as fix #4a/#4b describe; parenthesise set operators left to right; sort top-level set-operator output when there's no ORDER BY; rebuild `(+)` rewriting on the token stream so it composes with set operators and parentheses; place `ESCAPE` after the full pattern expression; NULL-ify empty function results.
- [ ] **Step 4:** `npm test` PASS; prune `known-gaps.json`.
- [ ] **Step 5: Commit** `feat(sql): oracle CHAR semantics, set operator order and sorting, (+) joins`.

### Task 4: Numbers, formats, NLS, INSTR, mixed types (fixes #5, #10, #11a–c, #12, #13, #14a–c, #16)

**Files:** Modify `src/sql/compat/30-numbers.sql`, `40-formats.sql`, `50-nls.sql`, `60-strings.sql`; Test `tests/sql/numbers-formats.test.js`

- [ ] **Step 1: Failing tests:** `1/3*3` → `1`; `MONTHS_BETWEEN(SYSDATE, TO_DATE('17-02-1995','DD-MM-YYYY'))` → `380.309811827956989247311827956989247312`; `TO_CHAR(TO_DATE('03-02-1995','DD-MM-YYYY'),'fmDD-MM-YYYY')` → `3-2-1995`; `'YEAR'` → `NINETEEN NINETY-FIVE`; `'Ddspth'` for the 17th → `Seventeenth`; `TO_CHAR(450,'$99,999')` → `    $450`; `TO_CHAR(1234567,'9,999')` → `######`; `ROUND(SYSDATE,'Q')` → `01-OCT-26`; `TRUNC(SYSDATE,'WW')` → `22-OCT-26`; `TO_CHAR(d,'Month','nls_date_language=romanian')` for September → `Septembrie` (10 chars, no cut) and Tuesday → `Marţi   ` (width 8, U+0163); `NVL(TO_CHAR(bursa),0)` for a NULL bursa → `0`; `INSTR('AAAA','AA',1,2)` → `2`; `INSTR('abc','b',0)` → `0`.
- [ ] **Step 2:** Run, expect FAIL.
- [ ] **Step 3:** Implement with exact `numeric` arithmetic for MONTHS_BETWEEN and date subtraction, Oracle format-model parsing for `fm` toggling, spelled formats, number formats (integer-literal dispatch, `L`, overflow), the listed ROUND/TRUNC date formats, Romanian/French/German names per fix #14, overlapping INSTR, first-argument typing for NVL/NVL2/DECODE/GREATEST/LEAST.
- [ ] **Step 4:** `npm test` PASS; prune gaps.
- [ ] **Step 5: Commit** `feat(sql): oracle number precision, format models, nls names, instr`.

### Task 5: Oracle strictness, errors, headers (fixes #18, #19, #20, #22) and Romanian explanations

**Files:** Modify `src/sql/rewrite/lint.js`, `src/sql/rewrite/pass-idents.js`, `src/sql/engine/errors.js`, `src/sql/engine/core.js`; Create `src/sql/explain.js`; Test `tests/sql/strict.test.js`

**Interfaces:** Produces `lintOracle(sql: string) => { code: string, message: string } | null`; `explainOra(code: string) => { ro: string, en: string }` covering at least ORA-00904, 00905, 00907, 00909, 00918, 00920, 00923, 00928, 00933, 00936, 00937, 00942, 01722, 01843, 01858, 01861, 01898, 01821, 25154, 25155, 00001, 01400, 02291, 02292, 02290, 12899, 01438.

- [ ] **Step 1: Failing tests:** `LIMIT 5` → ORA-00933; `FETCH FIRST 1 ROWS ONLY` → ORA-00933; `FROM studenti AS s` → ORA-00933; `CONCAT(a,b,c)` → ORA-00909; `ILIKE` → ORA-00920; `x::text` → ORA-00923; `INTERSECT ALL` → ORA-00928; qualified `USING` column → ORA-25154; `ROWNUM <= 2` → 2 rows; `an ^= 1` → 9 rows; `SELECT "NUME" FROM studenti` → 13 rows; unaliased `bursa+10` header → `BURSA+10`; `CONCAT(CONCAT(nume,' este'),an)` header → `CONCAT(CONCAT(NUME,'ESTE'),AN)`; every code in the Interfaces list has a non-empty `ro` explanation.
- [ ] **Step 2:** Run, expect FAIL.
- [ ] **Step 3:** Implement lint before rewrite (it sees the learner's original text); derive Oracle-style headers from the select-list text; map PG errors to the ORA codes Oracle gives for the corpus; write the explanations in plain Romanian (what went wrong and how to fix it, one or two sentences) with English translations.
- [ ] **Step 4:** `npm test` PASS; `known-gaps.json` now holds only items outside labs 1–4 (CONNECT BY, `sys_context`, `CONVERT`, `ALTER SESSION`, `CURRENT_TIMESTAMP` display), each with a one-line reason.
- [ ] **Step 5: Commit** `feat(sql): oracle 11g strictness, error codes, headers, romanian explanations`.

### Task 6: DDL and DML in the sandbox

**Files:** Modify `src/sql/compat/70-ddl.sql`, `src/sql/engine/core.js`, `src/sql/rewrite/pass-misc.js`; Test `tests/sql/ddl-dml.test.js`; extend `tests/sql/corpus/ddl.json` and re-run `scripts/sql/snapshot-oracle.mjs`

**Interfaces:** Produces `Engine.describe(table: string, o: { dataset: string }) => Promise<{ name: string, nullable: boolean, type: string }[]>` (DESCRIBE text, e.g. `VARCHAR2(10)`, `NUMBER(6,2)`, `CHAR(4)`, `DATE`); `Engine.snapshot(o: { dataset: string, tables?: string[] }) => Promise<Record<string, Result>>` (table contents after a run, for the checker).

- [ ] **Step 1: Failing tests:** `dml and ddl never leak between runs` — run `DELETE FROM note`, then a new run of `SELECT COUNT(*) FROM note` → `42`; `DROP TABLE studenti` then a new run sees 13 students; within one run `INSERT …; ROLLBACK; SELECT …` shows the insert undone and `CREATE TABLE t(x NUMBER); ROLLBACK` keeps `t` (DDL commits implicitly); `INSERT INTO studenti(nr_matricol) VALUES ('111')` → ORA-00001 if lab 1's script defines the key, otherwise matches the Oracle snapshot; `NUMBER(6,2)` insert of `12345.678` → ORA-01438; `VARCHAR2(10)` insert of 11 chars → ORA-12899; NOT NULL violation → ORA-01400; FK child without parent → ORA-02291; `describe('studenti')` matches Oracle's `user_tab_columns`; `SELECT table_name FROM user_tables ORDER BY 1` lists the five tables; `''` inserted is NULL.
- [ ] **Step 2:** Run, expect FAIL.
- [ ] **Step 3:** Implement: each `run` executes inside a transaction that is always rolled back at the end (pristine data next run); within a run, emulate Oracle COMMIT/ROLLBACK with savepoints and implicit commit after DDL; map Oracle types to Postgres domains that enforce Oracle errors; emulate `user_tables`, `user_tab_columns`, `user_constraints` as views; `DESCRIBE x` (a SQL*Plus command) is accepted and returns `describe(x)` as rows.
- [ ] **Step 4:** `npm test` PASS.
- [ ] **Step 5: Commit** `feat(sql): ddl and dml sandbox with oracle types, constraint errors and reset`.

### Task 7: Checker, named mistakes, datasets, Oracle-frozen expected answers

**Files:** Create `src/sql/check.js`, `src/sql/mistakes.js`, `public/sql/datasets/facultate-hidden.sql`, `public/sql/datasets/biblioteca.sql`, `public/sql/datasets/biblioteca-hidden.sql`, `scripts/sql/freeze-expected.mjs`, `public/sql/expected/.gitkeep`; Test `tests/sql/check.test.js`, `tests/sql/expected.test.js`

**Interfaces:**
- Consumes `Result`, `Engine.snapshot`, `runOnOracle`.
- Produces:
  - `Expected = { columns: string[], rows: (string|null)[][] }` stored at `public/sql/expected/<exerciseId>.<dataset>.json`
  - `CheckSpec = { order: 'any'|'required', orderBy?: string[], aliases?: 'any-distinct'|string[], mode: 'bag'|'set', kind: 'query'|'state', tables?: string[] }`
  - `checkResult(actual: Result | Record<string, Result>, expected: Expected | Record<string, Expected>, spec: CheckSpec) => Verdict`
  - `Verdict = { ok: boolean, kind: 'correct'|'rows'|'rowcount'|'order'|'columns'|'alias'|'error'|'not-oracle'|'structure'|'contents', missing: (string|null)[][], extra: (string|null)[][], mistake?: MistakeId }`
  - `MistakeId = 'eq-null'|'inner-vs-left'|'missing-join-cond'|'char-trim'|'self-pair-name'|'minus-name-collapse'|'and-or'|'dml-no-where'|'distinct-first-col'|'case-literal'`
  - `detectMistake(i: { sql: string, actual: Result, expected: Expected, spec: CheckSpec }) => MistakeId | null`
  - `explainVerdict(v: Verdict) => { ro: string, en: string }` and `explainMistake(id: MistakeId) => { ro: string, en: string }` in `src/sql/explain.js`
- [ ] **Step 1: Failing tests** (`check.test.js`): multiset equality ignoring order when `order:'any'`; `order` verdict when rows match but order differs and `order:'required'` (ties on `orderBy` keys are not an error); `alias` verdict; `set` mode merges duplicate rows (L4.12); dates compared as displayed text with century check via a hidden `SYYYY` probe (a wrong century fails); number-like strings compared as text (`0000000450` ≠ `450`); each `MistakeId` is detected on a crafted wrong answer (e.g. `bursa = NULL` → `eq-null`; JOIN without ON condition on 3 tables → `missing-join-cond`; `s1.nume < s2.nume` dropping the Bodnar pair → `self-pair-name`).
- [ ] **Step 2:** Write `facultate-hidden.sql` (same schema, altered rows: different names, a second same-name pair, NULLs in other places, birthdays on other weekdays, a student with no grades, a course with no professor) and the Biblioteca pair from `/home/alexa/hub/docs/2026-10-24-research-bd-lessons/mock-test-biblioteca.sql` (hidden copy altered the same way).
- [ ] **Step 3:** `scripts/sql/freeze-expected.mjs`: scans `src/content/bd/**/*.json` for `sql-exercise` blocks and test questions of type `sql`, runs each `solution` on Oracle for both datasets of its pair and both clocks where `clock` is set, writes `public/sql/expected/<id>.<dataset>.json`, then runs the same solution on the engine and exits non-zero on any mismatch. `tests/sql/expected.test.js` asserts every `sql-exercise` id in content has both expected files and that the engine reproduces them.
- [ ] **Step 4:** `npm test` PASS.
- [ ] **Step 5: Commit** `feat(sql): result checker, named mistakes, hidden datasets, oracle-frozen expected answers`.

### Task 8: Browser runtime

**Files:** Create `src/sql/engine/worker.js`, `src/sql/engine/client.js`, `scripts/sql/build-datadirs.mjs`, `scripts/sql/measure-browser.mjs`; Modify `vite.config.js` (`optimizeDeps.exclude: ['@electric-sql/pglite']`, worker format `es`), `package.json` (`"prebuild": "node scripts/sql/build-datadirs.mjs"`); Test `tests/sql/client.test.js`

**Interfaces:**
- Produces `getSqlClient() => SqlClient` (singleton) with `SqlClient.run(sql: string, o: { dataset: string, maxRows?: number }) => Promise<Result>`, `SqlClient.describe(table, o)`, `SqlClient.snapshot(o)`, `SqlClient.cancel() => void`, `SqlClient.status: 'idle'|'loading'|'ready'|'failed'`, `SqlClient.onStatus(cb) => () => void`.
- `build-datadirs.mjs` writes `public/sql/datadir-<dataset>.tar.gz` (compat installed, data loaded) for the four datasets.

- [ ] **Step 1: Failing tests** (`client.test.js`, with a worker stub running `core.js` in-process): `runaway query is capped and cancellable` — the 5-table cartesian product returns `truncated: true`, `rowCount` equal to the true count, at most `maxRows` (default 500) rows, and `cancel()` during a slow query rejects with `{ code: 'CANCELLED' }` and leaves the client `ready`; `engine start failure switches to paper mode` — a worker that fails to boot sets `status` to `failed` within the boot timeout (20 s) and `run` rejects with `{ code: 'ENGINE_UNAVAILABLE' }`.
- [ ] **Step 2:** Run, expect FAIL.
- [ ] **Step 3:** Implement the worker (boots from the prebuilt data dir via `loadDataDir`, runs statements with a statement timeout, posts results), the client (lazy: the worker is created on first `run`), cancel by terminating and re-booting the worker.
- [ ] **Step 4:** `npm test` PASS. Then `npm run build && npx vite preview` and run `node scripts/sql/measure-browser.mjs` (Puppeteer: desktop and 390×844 mobile emulation with 4× CPU throttle; records boot time, first-query time, `performance.memory` and JS heap). Write the numbers into `docs/superpowers/specs/2026-10-24-bd-lessons-design.md` §8. Set `PAPER_MODE_THRESHOLD` in `client.js` from them (boot failure, or boot over 20 s, forces paper mode).
- [ ] **Step 5: Commit** `feat(sql): web worker runtime with prebuilt data dirs, cancel, paper-mode fallback`.

### Task 9: Subject shell and the one-screen lesson player

**Files:** Create `src/content/bd/index.js`, `src/content/bd/practice/Practice.jsx` (placeholder pointing to the lessons), `src/components/lesson/LessonPlayer.jsx`, `src/components/lesson/ScreenGate.jsx`, `src/lesson/store.js`, `src/lesson/useLessonStore.js`; Modify `src/content/registry.js` (add `bd`, new `yearSemesters` entry `{ id: 'y2s1', title: { en: 'Year 2, Semester 1', ro: 'Anul 2, Semestrul 1' }, subjects: ['bd'] }`), `src/pages/SubjectPage.jsx` (use `LessonPlayer` for `course_N` when `subject.player === 'lesson'`), `src/index.css` (reduced-motion entries for the new classes), `scripts/smoke-test.mjs` (subjects and year-semester per subject instead of hard-coded `'y1s2'`); Test `tests/lesson/store.test.js`, `tests/lesson/player.test.js` (vitest + `@testing-library/react` is NOT added; test the pure helpers `screenFromUrl`, `nextScreen`, `canAdvance` exported by `LessonPlayer.jsx`)

**Interfaces:**
- Produces:
  - Subject object fields used: `slug: 'bd'`, `player: 'lesson'`, `yearSemester: 'y2s1'`, `courses: [{ id, src: 'bd/courses/lesson-NN.json', metaId: 'bd-lNN', title, shortTitle, sectionCount }]`, `tests: [{ id: 'bd-mock-l1', group, title, shortTitle, src: 'bd/tests/mock-l1.json' }]`.
  - URL: `/y2s1/bd/course_N?s=K` (K = 1-based screen).
  - `useScreenGate() => { complete(): void, skip(): void, isComplete: boolean }` — any block on a screen may call it; a screen gates only if it contains a gating block (`reflect`, `mcq`, `sql-exercise`, or `query-machine`/`viz` with `predict: true`).
  - `createLessonStore(storage: Storage) => LessonStore`, key `bdLessonState.v1`:
    - `getPosition(src: string) => number`, `setPosition(src, screen: number) => void`
    - `recordAttempt(itemId: string, a: { ok: boolean, hints: number, skipped?: boolean, kind: 'mcq'|'sql'|'reflect'|'predict', ref: { src: string, screen: number }, at: number }) => void`
    - `pendingReview(now: number) => ReviewItem[]` (all pending, due first), `markReview(itemId: string, ok: boolean, now: number) => void`
    - `ReviewItem = { itemId: string, ref: { src, screen }, due: number, streak: number, kind }`; schedule: a miss is due immediately, then +1 day, then +3 days; two right answers in a row remove it.
  - Lesson JSON = existing course shape: `{ meta: { id: 'bd-lNN', title, shortTitle, source }, steps: [{ id: 'bd-lNN-sK', title, blocks: [...] }] }` — one step = one screen.
- [ ] **Step 1: Failing tests:** store round-trip; `resume from url and survives corrupted storage` — `screenFromUrl('?s=7', 12)` → 7, out-of-range → clamped, garbage → 1; a store built over storage holding `"{not json"` or a `v0` shape starts empty without throwing; review schedule (miss → due now; right → due +1 day; right again → removed); `canAdvance(screen, gateState)` false for a gating screen until `complete()` or `skip()`.
- [ ] **Step 2:** Run, expect FAIL.
- [ ] **Step 3:** Implement the player as spec §6 describes: full-height card, direction-aware slide+fade with `AnimatePresence` (fade only under reduced motion), thin progress bar, Back/Continue, ←/→/Enter when focus is not in an editor or textarea, "Sari peste" on gating screens (records a skip), resume from store, `?s=` kept in sync with `replace` navigation, `markVisited(step.id)` so the existing sidebar/course map rings stay right. No "I understand" button, no stepper strip. One placeholder lesson `lesson-01.json` with three screens (`learn`, `code`, `callout`) so routes exist.
- [ ] **Step 4:** `npm test` PASS; `npm run validate` PASS; `npm run build && npm run smoke` PASS with `/y2s1/bd/...` walked.
- [ ] **Step 5: Commit** `feat(bd): subject shell, y2s1, one-screen lesson player with gating, resume and review store`.

### Task 10: SQL exercise block and editor

**Files:** Create `src/components/lesson/blocks/SqlExerciseBlock.jsx`, `src/components/lesson/SqlEditor.jsx`, `src/components/lesson/ResultTable.jsx`, `src/components/lesson/SchemaPanel.jsx`; Modify `src/components/blocks/registry.js` (`'sql-exercise'`), `scripts/validate-course-json.mjs`, `package.json` (`@codemirror/lang-sql` 6.10.0); Test `tests/lesson/sql-exercise.test.js` (pure helpers), `scripts/validate-course-json.mjs` fixtures

**Interfaces:**
- Consumes `getSqlClient`, `checkResult`, `detectMistake`, `explainVerdict`, `explainOra`, `explainMistake`, `useScreenGate`, `useLessonStore`.
- Block JSON (validator enforces every required field):
  ```json
  { "type": "sql-exercise", "id": "bd-l2-ex2", "dataset": "facultate", "kind": "query",
    "prompt": { "en": "…", "ro": "…" }, "official": { "lab": 2, "ex": 2 },
    "starter": "SELECT …", "solution": "SELECT DISTINCT bursa FROM studenti",
    "check": { "order": "any", "mode": "bag" }, "clock": "2026-10-26",
    "hints": [{ "en": "…", "ro": "…" }, { "en": "…", "ro": "…" }, { "en": "…", "ro": "…" }],
    "explain": { "en": "…", "ro": "…" } }
  ```
  `dataset` ∈ `facultate|biblioteca`; `kind` ∈ `query|state` (state = DDL/DML, needs `check.tables`); `official` optional; `clock` optional (`2026-08-26` for the five marked exercises); `starter` optional; exactly 3 hints; `explain` is the text shown with the solution.
- [ ] **Step 1: Failing tests:** validator rejects a `sql-exercise` missing `solution`, with 2 hints, or with an unknown `dataset`; helper `verdictView(verdict)` maps each `Verdict.kind` to a Romanian headline.
- [ ] **Step 2:** Run, expect FAIL.
- [ ] **Step 3:** Implement: CodeMirror editor (SQL highlighting, Ctrl/Cmd+Enter runs, mobile friendly), Run button, result table with row count and a "truncated" note, verdict panel (correct / differences side by side with the expected table using `missing`/`extra` / ORA code + explanation / named mistake explanation), hint ladder (each hint reveal is counted), solution reveal with `explain`, schema drawer (`SchemaPanel` uses `describe` for the five tables), gate `complete()` on first run or reveal, `recordAttempt` with `ok` = verdict.ok on first graded run, paper mode when the client status is `failed` (locked textarea → "Predă" → expected table + solution + self-check list).
- [ ] **Step 4:** `npm test` and `npm run validate` PASS; open the placeholder lesson with one `sql-exercise` in `vite preview` and run a right and a wrong answer in Chrome (screenshot both).
- [ ] **Step 5: Commit** `feat(bd): sql exercise block with editor, verdicts, hints, schema panel, paper mode`.

### Task 11: Query machine block

**Files:** Create `src/components/lesson/blocks/QueryMachineBlock.jsx`, `src/sql/machine.js`; Modify `src/components/blocks/registry.js` (`'query-machine'`), `scripts/validate-course-json.mjs`; Test `tests/sql/machine.test.js`

**Interfaces:**
- Block JSON:
  ```json
  { "type": "query-machine", "id": "bd-l4-qm", "dataset": "facultate",
    "sql": "SELECT nume, bursa FROM studenti WHERE an = 1 ORDER BY nume",
    "stages": [ { "clause": "from" }, { "clause": "where", "predict": true, "tri": false },
                { "clause": "select" }, { "clause": "distinct" }, { "clause": "order", "predict": true } ],
    "show": ["nume", "an", "bursa"], "say": { "where": { "en": "…", "ro": "…" } } }
  ```
  `clause` ∈ `from|join|where|select|distinct|order|union|union-all|intersect|minus`; `tri: true` colours TRUE/FALSE/UNKNOWN (L5); `predict` asks the learner to click surviving rows (where/join) or place rows (order).
- Produces `planStages(sql: string, stages: Stage[], engine) => Promise<StageState[]>` in `src/sql/machine.js` where `StageState = { rows: Row[], kept: string[], removed: string[], order?: string[], columns: string[], dimmed: string[], truth?: Record<string, 'T'|'F'|'U'> }` and `Row = { key: string, cells: Record<string, string|null> }`; it derives every stage by running sub-queries on the engine (e.g. the WHERE stage evaluates the predicate per row), so nothing is hand-authored but the stage list.
- [ ] **Step 1: Failing tests:** for the block above, stage `where` keeps exactly the rows Oracle's `WHERE an = 1` keeps and `order` matches `ORDER BY nume`; `tri` truth for `NOT (bursa > 300)` gives 8 `U`; a join stage on `studenti JOIN note` gives 42 pairs; `minus` stage reproduces L4.12's 4 rows.
- [ ] **Step 2:** Run, expect FAIL.
- [ ] **Step 3:** Implement `planStages` and the component: clause chips, animated rows (`motion` layout animations: removed rows fall away, ORDER BY reorders, SELECT dims columns, DISTINCT merges with a counter, set ops as two lists merging), per-stage Romanian explanation from `say`, predict-then-check with ✓/✗ per row and a score, manual advance only, gate on predict stages.
- [ ] **Step 4:** `npm test` PASS; check it live in Chrome on a placeholder screen (screenshot each stage).
- [ ] **Step 5: Commit** `feat(bd): engine-driven query machine with predict-then-check`.

### Task 12: Visual widget kit

**Files:** Create `src/components/lesson/viz/kit.js`, `src/components/lesson/blocks/VizBlock.jsx`, one file per widget below; Modify `src/components/blocks/registry.js` (`'viz'`), `scripts/validate-course-json.mjs`; Test `tests/lesson/viz.test.js` (pure step logic per widget)

**Interfaces:**
- Block JSON: `{ "type": "viz", "id": "bd-l6-like", "widget": "<name>", "predict": false, "props": { … } }`.
- `kit.js` produces `useStepper(n: number, o?: { predict?: boolean }) => { step, next, back, canNext, reveal }` and motion variants `enter`, `exit`, `pop`, `fall` (reduced-motion aware).
- Widgets and their `props` (the lesson the outline puts each in):

| widget | lesson | props |
|---|---|---|
| `table-map` | L1 | `{ dataset, from: 'note.nr_matricol', to: 'studenti.nr_matricol', question: {en,ro}, answerKey: string }` |
| `table-build` | DDL | `{ table, columns: [{ name, type, notNull? }] }` |
| `row-insert` | DDL | `{ table, row: Record<string,string\|null>, errorCase?: { row, code } }` |
| `delete-sweep` | DDL | `{ table, where?: string }` (no `where` = every row goes) |
| `like-slider` | L6 | `{ pattern: string, values: string[] }` |
| `in-between` | L7 | `{ mode: 'in'\|'between'\|'any'\|'all', list?: (number\|string)[], low?: number, high?: number, values: (number\|string\|null)[] }` |
| `number-line` | L10 | `{ values: number[], fns: ('CEIL'\|'FLOOR'\|'ROUND'\|'TRUNC')[], digits?: number }` |
| `char-boxes` | L11 | `{ value: string, width: number, ops: ('LENGTH'\|'TRIM'\|'LIKE')[], likePattern?: string }` |
| `char-strips` | L12 | `{ mode: 'pad'\|'swap', input: string, fn?: 'LPAD'\|'RPAD', len?: number, fill?: string, from?: string, to?: string }` |
| `calendar-clock` | L13 | `{ start: 'YYYY-MM-DD HH24:MI', ops: [{ fn: '+'\|'ADD_MONTHS'\|'LAST_DAY'\|'NEXT_DAY'\|'TRUNC', arg?: string\|number }] }` |
| `date-mask` | L14 | `{ date: 'YYYY-MM-DD', masks: string[] }` |
| `age-timeline` | L15 | `{ birth: 'YYYY-MM-DD', today: 'YYYY-MM-DD HH24:MI' }` |
| `decode-sieve` | L16 | `{ expr: string, pairs: [string\|number, string][], default?: string, values: (string\|number\|null)[] }` |
| `type-pipes` | L17 | `{ conversions: [{ from: string, to: string, value: string, fn: string }] }` |
| `cartesian-grid` | L18 | `{ left: 'studenti', right: 'note', on: string }` |
| `join-wires` | L20 | `{ left, right, on, kind: 'inner'\|'left'\|'right'\|'full', filterIn?: 'on'\|'where', filter?: string }` |
| `self-pairs` | L21/L22 | `{ table, pairOn: string, order: '<>'\|'<' }` |
| `all-vs-some` | L23 | `{ studentsFrom: string, condition: string, showMinusByName: boolean }` |
| `set-balls` | L9 | `{ left: string, right: string, ops: ('UNION'\|'UNION ALL'\|'INTERSECT'\|'MINUS')[] }` |

Every value a widget shows that depends on Oracle (dates, padding, join counts) comes from `getSqlClient` at render time, not from props.

- [ ] **Step 1: Failing tests:** per widget, its step function: e.g. `likeSteps('_r%','Prelipcean')` ends `match: true`; `charBoxes('Breaban',10)` has 3 blank boxes and LENGTH 10; `calendar('2026-01-31', ADD_MONTHS 1)` lands on `2026-02-28`; `decodeRoute(null, pairs)` → default; `numberLine(-51.3,'TRUNC')` → `-51`.
- [ ] **Step 2:** Run, expect FAIL.
- [ ] **Step 3:** Implement the kit and widgets (motion, theme tokens, manual advance, predict where `predict: true`, reduced-motion fallback = no movement, same end state).
- [ ] **Step 4:** `npm test` PASS; a dev-only gallery route `?viz-gallery` (excluded from smoke and production nav) shows every widget; check each in Chrome at desktop and 390 px (screenshots).
- [ ] **Step 5: Commit** `feat(bd): visual widget kit for lessons`.

### Task 13: Reflect and multiple-choice blocks, review tab

**Files:** Create `src/components/lesson/blocks/ReflectBlock.jsx`, `src/components/lesson/blocks/McqBlock.jsx`, `src/components/lesson/ReviewTab.jsx`; Modify `src/components/blocks/registry.js` (`'reflect'`, `'mcq'`), `scripts/validate-course-json.mjs`, `src/components/ui/ContentTypeBar.jsx`, `src/components/ui/BottomTabBar.jsx`, `src/pages/SubjectPage.jsx` (tab `review`, only for subjects with `player: 'lesson'`); Test `tests/lesson/review.test.js`

**Interfaces:**
- `reflect`: `{ "type": "reflect", "id", "prompt": {en,ro}, "placeholder"?: {en,ro}, "answer": {en,ro}, "table"?: { "dataset", "sql" } }` — free-text box, "Arată-mi" reveals `answer`; gate completes on reveal; used for the pretest and the "why" screens.
- `mcq`: `{ "type": "mcq", "id", "question": {en,ro}, "options": [{ "text": {en,ro}, "correct": bool, "misconception"?: string, "explain": {en,ro} }], "review"?: "bd-lNN" }` — exactly one correct; every wrong option has `misconception` (a trap tag from outline §2) and `explain`; `review` marks the ~30% items that revisit an earlier lesson. Wrong answer → `recordAttempt(ok:false)` and the option's explanation; gate completes on first answer.
- Review tab: lists `pendingReview(now)` grouped by lesson, "due" first; each item opens a variant: for `mcq`, another `mcq` with the same `misconception` tag from any lesson (fallback: the same item reshuffled); for `sql`, the same exercise graded on the hidden dataset; a right answer calls `markReview(itemId, true)`.
- [ ] **Step 1: Failing tests:** variant picker returns a different item with the same tag when one exists; validator rejects an `mcq` with two correct options or a wrong option without `misconception`.
- [ ] **Step 2:** Run, expect FAIL.
- [ ] **Step 3:** Implement the blocks and the tab with the player's visual language (cards, motion).
- [ ] **Step 4:** `npm test`, `npm run validate` PASS; live check in Chrome: answer wrong, see the item in Recapitulare, fix it twice, see it leave.
- [ ] **Step 5: Commit** `feat(bd): reflect and mcq blocks, review pile tab`.

### Task 14: Mock L1 test

**Files:** Create `src/components/blocks/test/SqlQuestion.jsx`, `src/content/bd/tests/mock-l1.json`; Modify `src/components/blocks/test/TestRenderer.jsx` (`questionComponents.sql`, `meta.oneQuestionPerScreen`), `scripts/validate-test-json.mjs`, `src/content/bd/index.js` (`tests[]`); Test `tests/lesson/mock.test.js`

**Interfaces:**
- Question JSON: `{ "id": "p1", "type": "sql", "prompt": {en,ro}, "points": 3, "dataset": "biblioteca", "solution": "…", "check": { … CheckSpec }, "kind": "query" }`; test `meta`: `{ id: 'bd-mock-l1', title, year: 2026, type: 'mock', duration: 0, totalPoints: 25, oneQuestionPerScreen: true, modes: ['paper', 'practice'] }`.
- Scoring: full points when `checkResult` is ok on both biblioteca datasets, 0 otherwise; paper mode shows the expected table, the reference solution and the outline's grading notes per problem.
- [ ] **Step 1: Failing tests:** validator requires `solution`, `dataset`, `check` for `sql`; scoring helper gives 25 for all-correct answers and 0 for a wrong one.
- [ ] **Step 2:** Run, expect FAIL.
- [ ] **Step 3:** Implement; write `mock-l1.json` from outline §3.3 (8 problems, its point split 3×7 + 4), with real English translations; run `node scripts/sql/freeze-expected.mjs`.
- [ ] **Step 4:** `npm test`, `npm run validate` PASS; live run of both modes in Chrome.
- [ ] **Step 5: Commit** `feat(bd): L1 mock test with sql questions, paper and practice modes`.

### Tasks 15–20: Lesson content

One task per module; each module's lessons are authored from the outline section named, as course JSON in `src/content/bd/courses/`, registered in `src/content/bd/index.js` in outline order (the DDL/DML module right after L1). These tasks can run in parallel once Tasks 9–13 are merged (they only add JSON and register entries).

| Task | Module | Lessons → files |
|---|---|---|
| 15 | Fundamente + DDL/DML (spec §7) | L1, D1–D3, L2, L3 → `lesson-01.json`, `lesson-01a.json`…`lesson-01c.json`, `lesson-02.json`, `lesson-03.json` |
| 16 | Filtrare, sortare, mulțimi | L4–L9 → `lesson-04.json`…`lesson-09.json` |
| 17 | Funcții pe linie | L10–L12 |
| 18 | Date + NVL/DECODE/CASE + conversions | L13–L17 |
| 19 | JOIN I | L18–L21 |
| 20 | JOIN II + recap | L22–L25 |

**Each lesson** (outline §0.3 and the lesson's own entry): screens in order — `reflect` pretest (with the lesson's table) → `query-machine` and/or `viz` with predict → `callout` trap(s) → rule screen (`code` + `definition`) → `reflect` "why" → one `mcq` per screen (the outline's items, misconception tags kept) → one `sql-exercise` per official exercise the outline places here (statement quoted verbatim in `official` lessons, "ADAPT" notes applied) with three climbing hints and an `explain`. Learner text in Romanian with real English translations; no pedagogy labels; none of the errors in outline §4.

**Steps for each content task:**
- [ ] **Step 1:** Author the JSON for the module.
- [ ] **Step 2:** `node scripts/sql/freeze-expected.mjs` (Oracle container up). Expected: exit 0 — every solution reproduced by the engine on both datasets.
- [ ] **Step 3:** `npm test && npm run validate`. Expected: PASS; `tests/sql/expected.test.js` sees every new exercise.
- [ ] **Step 4:** Live walk-through in Chrome of every lesson in the module at desktop and 390 px: every screen advances, every predict works, every `sql-exercise` accepts its solution and rejects one named wrong answer. Keep screenshots.
- [ ] **Step 5:** Coverage check: `node scripts/sql/coverage.mjs` (created in Task 15: lists official exercises from `official.lab/ex` across content) — at the end of Task 20 it must print lab 1 ex 1–3, lab 2 inline 1–2 and ex 1–15, lab 3 ex 1–13, lab 4 ex 1–14, each exactly once.
- [ ] **Step 6: Commit** `content(bd): <module name> lessons`.

### Task 21: Docs, full verification, deploy

**Files:** Modify `CLAUDE.md` (new subject, `player: 'lesson'`, the five block types, `src/sql/`, Oracle reference workflow, scripts; fix the stale HashRouter and CodeMirror lines), `docs/superpowers/specs/2026-10-24-bd-lessons-design.md` (§8 browser numbers if not yet in).

- [ ] **Step 1:** `npm test && npm run validate && npm run build && npm run smoke`. Expected: all PASS.
- [ ] **Step 2:** `node scripts/sql/snapshot-oracle.mjs --check` (re-runs the corpus on Oracle and compares with the committed snapshot). Expected: no drift.
- [ ] **Step 3:** Learner-text sweep: `node scripts/sql/text-sweep.mjs` (created here: fails on phase names, "Kapur", "Dunlosky", "pretest", "faza", English words in `ro` strings from a stop-list, and the outline §4 error strings). Expected: PASS.
- [ ] **Step 4:** Full live pass on `vite preview` in Chrome at desktop and 390 px per spec §10.3: every lesson, the review pile, the mock test in both modes, reduced motion on. Screenshots and one screen recording kept under `.scratch/` (gitignored).
- [ ] **Step 5: Commit** `docs(bd): CLAUDE.md and spec numbers`, then `git pull --rebase origin main` and `git push origin main`.
- [ ] **Step 6:** Watch the Pages deploy (`gh run watch`), then repeat Step 4's walk-through on `https://corgigh.github.io/Ghid_Studii_AI/y2s1/bd/` at desktop and 390 px. Expected: identical behaviour; engine loads from the Pages base path.
