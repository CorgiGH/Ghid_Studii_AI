**What:** Design for the Baze de date (BD) SQL lessons in Ghid_Studii_AI: one-screen lesson player, real SQL sandbox, query machine, review pile, L1 mock test · **When:** 2026-10-24 · **Status:** active (approved by Alex 2026-10-24: "looks good")

# BD SQL lessons: design

## 1. Why this exists

Alex (UAIC FII, BSc AI, year 2) has the BD lab test **L1 on Monday 2026-10-26** (group IA22 per the IA points sheet: Mon 10:00–12:00, room C405). The test is written and covers **only SQL from labs 1–4** (Alex: "only sql"). He wants something that takes **anyone from zero to full understanding**, good enough to share with his classmates, and better than the pages classmates made (an audit found 13 SQL errors in those).

What worked for him in the past: the explanation mode and the visuals, and going from "anyone can understand this" to the meat of the subject. His study guide (this repo) already fixed the teaching method in `wiki/concepts/Learning Rhythm.md`: pretest → concrete → rule → elaborate ("why") → retrieve. He compared four mockups and chose **D**, that rhythm, then asked for: real queries he can run, a better UI, one screen at a time, and smooth transitions and animations (his words: "D is best. but i want to have something interactive where i can do actual query's maybe. and also need better UI AND also something like one screen at a time and also transitions and animations to make things smoooth. maybe some other stuff").

The approved mockup D is in `assets/2026-10-24-bd-lessons-mockup/` next to this file (`lesson-d.html` with `lesson.css` and `lesson.js`; it loads them from `/files/`, so serve the folder or adjust the two paths to open it).

## 2. Who uses it

- Alex, studying from zero for Monday.
- His classmates (IA year 2, groups IA21/22/23), on laptops and phones, opening a link the night before.
- Nobody installs anything. Romanian is the learner language.

## 3. Goals, non-goals, anti-goals

**Goals**
1. A new subject **Baze de date** (semester 3) whose lessons cover **everything labs 1–4 contain**: every official exercise of labs 2–4 exactly once (44 exercises), the lab 1 concepts (table, row, column, NULL, keys, types) and the lab 1 exercises (CREATE TABLE for the five tables, INSERT of a student with a grade, running the data script and inspecting the schema). Alex: "anything is fine, just needs whatever the labs have and if it can have more then that's fine". The SELECT lessons are fixed by the content outline (§7); the DDL/DML module is added on top (§7).
2. Every lesson follows the D rhythm and is shown **one screen at a time** with animated transitions.
3. Every write-it-yourself exercise has a **real SQL box**: type, run, see the result table, get a verdict against the expected result and a plain-Romanian explanation of what's wrong.
4. A **query machine** that animates a query on the real tables clause by clause (FROM → WHERE → SELECT → ORDER BY, joins, set operators) with predict-then-check: the learner clicks the rows they think survive before seeing the answer.
5. Saved progress, a **review pile** of what the learner got wrong, and a **mock L1** on a new schema.
6. Every expected answer is the output of a **real Oracle 11g**, not of the in-browser engine.

**Non-goals**
- Lecture theory (relational algebra, functional dependencies, normalisation): not on L1 (Alex: "only sql").
- Emulating SQL*Plus itself. SQL*Plus steps the labs mention (saving/loading a `.sql` file, `@script`) are explained; `DESCRIBE` and `user_tables` are emulated because they show the schema.
- Accounts, server sync, an LLM grader. SQL grading is local and deterministic.
- Other semester-3 subjects (AG, ML, IA, RN). They come later through the same machinery.

**Anti-goals (would make this a failure even if it "works")**
- Teaching a wrong Oracle behaviour, or marking an Oracle-invalid query as correct. The test is on Oracle 11g on paper; habits from Postgres or SQLite (LIMIT, `AS` before a table alias, ILIKE, `::`, 3-argument CONCAT, FETCH FIRST) must be rejected with an explanation.
- Copying the errors of the official pages or the classmates' pages (listed in §7 and the outline §4).
- Labels that describe the pedagogy to the learner ("Productive failure", "Phase 2", study citations). Alex removed these from the mockups: learners see only the lesson.
- Auto-playing animations. Advance is always manual.
- A page that is slow or broken on a phone.

## 4. Constraints

- **Deadline:** usable by Alex before Monday 2026-10-26 10:00. The whole scope ships together (no staged cut).
- **Platform:** this repo (React 19, Vite 8, Tailwind 4, react-router 7 BrowserRouter, `motion` 12), deployed to GitHub Pages at `https://corgigh.github.io/Ghid_Studii_AI/` by `.github/workflows/deploy.yml` on push to `main`. Base path `/Ghid_Studii_AI/`: every asset URL goes through `import.meta.env.BASE_URL`.
- **CI gates** (`npm run validate`, `npm run build`, `npm run smoke`) must pass. Every `{en, ro}` string needs both sides (`validate-bilingual.mjs`); Romanian is the default UI language.
- **Bundle:** the main chunk is already 4.65 MB (eager JSON glob in `src/content/jsonLoader.js`). The SQL engine, its WASM and the datasets must load lazily and live outside the eager glob (e.g. `public/` fetched via `BASE_URL`, or a lazy chunk).
- **Public repo:** no lecture or lab PDFs, slide dumps or other course files get added. Lesson text paraphrases; official exercise statements may be quoted (the outline marks them).
- **Reduced motion:** every new animation respects `prefers-reduced-motion` (see `src/index.css`).
- **Oracle reference:** a real Oracle XE 11g runs in the rootless Docker already on this machine (`DOCKER_HOST=unix:///run/user/1000/docker.sock`, declared in `/etc/nixos/dev-projects.nix:206`). Image `gvenzl/oracle-xe:11-slim` (292 MB compressed). Root filesystem has 16.7 GB free. Bind the port to 127.0.0.1 only. Pulling it needs Alex's OK (§11).
- Repo state: local `main` is 1 README commit behind `origin/main`; uncommitted `.claude/settings.local.json` and `scripts/review-gemini-alo-c11.mjs`, plus untracked scratch. Don't commit those. Pull before starting.

## 5. Decided

**By Alex (his words in §1):**
- Lesson shape D (the study guide's 5-phase rhythm, A + B + C combined).
- One screen at a time, transitions and animations.
- Real, runnable SQL.
- Scope for Monday: SQL from labs 1–4 only.
- No pedagogy labels visible to learners.

**By Claude (provisional, Alex can veto; logged in `/home/alexa/hub/decisions.jsonl` D-004):**
- Build inside Ghid_Studii_AI, as subject slug `bd` under a new year-semester `y2s1`.
- SQL runs in the browser on **PGlite** (`@electric-sql/pglite` 0.5.11, Postgres 18 in WASM) with an Oracle-compatibility layer. Reason: Postgres's `to_char`/`to_date`, CHAR padding, exact decimals, NULL ordering and operator overloading are close to Oracle; SQLite would need far more rewriting and still can't type dates (spike numbers in §8).
- Expected answers are frozen from real Oracle 11g and committed as data; CI never needs Oracle.
- A fixed "today" of **2026-10-26 14:30:00** for SYSDATE/CURRENT_DATE so date exercises have stable answers. The outline's content depends on the time of day (e.g. `SYSDATE - TRUNC(SYSDATE)` ≈ 0.604, Popescu ≈ 380.31 months); the spike's `compat.sql` used 00:00 and must change. The five date exercises the outline marks for a second "today" also get **2026-08-26 14:30:00**.
- A **hidden grading dataset**: a second copy of the five lab tables with altered rows (written by the builder, results frozen from Oracle). Every exercise is graded on both datasets, which catches hard-coded answers and wrong sort keys (e.g. lab 2 ex 8's "prenume descrescător"). Learners only ever see the normal dataset.
- **All the outline's per-lesson visuals are in scope**, not just the query machine: the LIKE pattern sliding over letters (L6), IN/BETWEEN drawers and ruler (L7), number line (L10), CHAR(10) boxes (L11), character strips for LPAD/TRANSLATE (L12), calendar and clock (L13), date mask (L14), age timeline (L15), DECODE sieve (L16), type pipes (L17), the 13×42 grid (L18). Alex said the visuals were what worked for him. Build them on one shared animation kit; manual advance only.
- **Review pile variants:** a variant is another quiz item that tests the same named misconception, or the same exercise graded on the hidden dataset. The Recapitulare tab always lets the learner do every pending item right away; the next-day and three-day gaps only decide the order and what's flagged as due. This matters because Monday is close.
- **Phones:** measure PGlite in the browser first. If it crashes or is too heavy on a phone-sized Chrome (the builder sets and records the threshold), phones get paper mode on SQL screens: write the answer, then reveal the expected table (frozen from Oracle), the solution and a self-check list. No second engine, so grading stays Oracle-checked everywhere it runs.
- **English side:** real English translations for every new string, written from the Romanian (Romanian is the source of truth). The site has an EN toggle and the other subjects are fully translated.
- **Storage:** static site plus localStorage, behind a small storage interface so a backend can replace it later. The untracked May redesign spec (`docs/specs/2026-05-17-full-scope-redesign-spec.md`, council verdicts calling for a Fastify/Postgres backend and ruling out static + localStorage) is not followed for this build; it was never implemented, and a council call stays provisional until Alex ratifies it.
- Everything else in §6–§9 unless marked "left to the builder".

## 6. What the learner sees

**Subject page.** "Baze de date" appears under a new semester group on the home page. Tabs: Cursuri (the 25 lessons), Recapitulare (review pile), Teste (mock L1). The Practice tab must exist as a placeholder (the shell requires it) or be hidden.

**A lesson, one screen at a time.** Each screen is one card that fills the content area: a question to try cold, a table, the query machine, a rule, a "why" question, one quiz item, one SQL exercise. Moving forward: a Continue button and the right-arrow/Enter key; back: a Back button and left-arrow. A thin progress bar shows position in the lesson (no phase names). Screens slide/fade with `motion`'s `AnimatePresence`. The URL carries the screen (`?s=` or a path segment) so reload and resume land on the same screen.

**Gating.** Screens that ask something (pretest, predict, quiz, SQL exercise) unlock Continue only after an attempt (an answer, a reveal or a run). Skipping is allowed through an explicit "Sari peste" link that records a skip.

**The five phases per lesson** (content from the outline, §7):
1. *Pretest:* a question the learner can't answer yet, with the lesson's table, a free-text box and "Arată-mi".
2. *Concrete:* the query machine on real rows, with predict-then-check; trap callouts for the lesson's misconceptions.
3. *Rule:* the general form (SQL template + 2–3 one-line definitions).
4. *Why:* one causal question with a free-text box and a reveal.
5. *Retrieve:* 3–4 quiz items (one per screen) whose wrong options are named misconceptions with an explanation each; then the lesson's official exercises in SQL boxes with climbing hints (in words → the SQL pieces → a mini-lesson) and a solution reveal. About 30% of quiz items revisit earlier lessons.

**SQL box.** A code editor with SQL highlighting, Run (Ctrl+Enter), the result table (with row count), and a verdict:
- correct;
- wrong rows / missing rows / extra rows (shows the first differences side by side with the expected result);
- wrong order (when the exercise requires ORDER BY);
- wrong columns or missing alias (when the exercise requires one);
- an Oracle error, shown as `ORA-xxxxx` plus a Romanian explanation;
- "valid in Postgres but not in Oracle 11g" for non-Oracle syntax, with the Oracle way.
Named-mistake detectors with targeted explanations: `= NULL` instead of `IS NULL`; INNER instead of LEFT join (fewer rows); a forgotten join condition (row count = product); missing TRIM on CHAR columns; `s1.nume < s2.nume` dropping same-name pairs; MINUS on names collapsing two students with the same name. The schema of the five tables is one click away on every SQL screen.

**Query machine.** Shows the query with its clauses as chips and the table below. Each clause is a step; the learner advances manually. Rows removed by WHERE animate out; ORDER BY visibly reorders; SELECT dims dropped columns; joins show which row pairs match. On predict steps the learner clicks rows to mark "rămâne", presses Verifică, and sees ✓/✗ per row and a score. Step data is authored per lesson (cheaper and verifiable) and its row sets are checked against the engine at build time.

**Review pile (Recapitulare).** Every wrong quiz answer, failed SQL exercise and opened third hint adds an item. Items come back the next day and three days later as a fresh variant of the exercise or question; answering right twice removes them. Each item links back to its lesson screen.

**Mock L1 (Teste).** Mirrors L1 on a new 5-table "Biblioteca" schema (outline §3; script `/home/alexa/hub/docs/2026-10-24-research-bd-lessons/mock-test-biblioteca.sql`), 8 problems across the topics. One problem per screen. Two modes: **paper mode** (write the answer on paper or in a locked box; after "Predă" the box unlocks, runs, and shows the verdict and reference solution) and **practice mode** (run as you go). Optional timer chosen by the learner. Score saved with the existing `saveTestResult`.

## 7. Content

The lesson list, per-lesson concepts, hooks, query-machine content, "why" questions, quiz items with named distractors, the placement of all 44 official exercises, the Oracle trap catalogue, the mock test and the "don't copy these errors" list are in **`2026-10-24-bd-lessons-content-outline.md`** next to this file (Romanian learner text, English notes). The builder turns it into course JSON; changes to lesson order or exercise placement need a reason.

Sources (local, not to be committed here): official lab pages and the data script `facultate.sql` in `/home/alexa/hub/docs/2026-10-24-research-bd-lessons/official/`; the audit of the classmates' pages in `/home/alexa/hub/docs/2026-10-24-recon-semester-3.md` §6.

**DDL/DML module (Claude's call, on top of the outline; Alex said more is fine).** Place it right after Lesson 1, since it builds the tables the rest uses:
- *Create the tables:* Oracle types (VARCHAR2, CHAR, NUMBER(p,s), DATE), NOT NULL, then PRIMARY KEY / FOREIGN KEY / UNIQUE / CHECK as "more"; DROP TABLE. Lab 1 ex 1 (create the five tables as specified on the lab page) is the write-it-yourself part.
- *Insert, update, delete:* INSERT with and without a column list, TO_DATE in INSERT, NULL vs '', UPDATE and DELETE with WHERE (and the missing-WHERE trap), COMMIT/ROLLBACK. Lab 1 ex 2 (insert Popescu Ionuț with his grade at "Logica pentru informatică" taught by Masalagiu) is the write-it-yourself part.
- *Look at what you built:* `DESCRIBE`, `SELECT table_name FROM user_tables`, running the data script. Lab 1 ex 3.
- Same D rhythm, query-machine-style visuals (a table being created column by column, rows being inserted, a WHERE-less DELETE emptying the table), quiz items with named misconceptions, and the hidden-dataset grading where it applies.

Learner text must not contain pedagogy labels, study citations or phase names.

## 8. The SQL engine

**Starting point:** the spike in `/home/alexa/hub/docs/2026-10-24-research-bd-lessons/sql-spike/` (`compat.sql` ≈300 lines, `rewrite.js` ≈300 lines, `solutions.sql` with 52 Oracle solutions, `check.mjs` result checker, `schema_data.sql` converted from the official script). All 52 solutions ran; 158 of 159 smoke queries passed. An adversarial check (`reports/sql-check.json`, probes in `sql-refute/`) confirmed PGlite as the right engine but found these faults, which must be fixed and covered by tests:

1. A `(+)` query followed by UNION/INTERSECT/MINUS breaks in the rewriter (`rewrite.js:233`, `:248`); this is the 11g way to write lab 4 ex 6.
2. Set operators must evaluate left to right with equal precedence (Oracle) — add parentheses in the rewrite.
3. CHAR vs VARCHAR2 inside UNION/INTERSECT/MINUS must keep CHAR blanks (Oracle result type VARCHAR2 with padding kept).
4. LPAD, RPAD, REVERSE and TRANSLATE must keep CHAR padding.
5. DECODE compares character data **without** blank padding (Oracle doc); the CASE rewrite must not use padded comparison.
6. INSTR forward search must count overlapping occurrences.
7. `fm` toggles on each occurrence and applies to the rest of the format; `YEAR`, `SP`, `SPTH`, `TH` formats; Romanian day/month names never cut (e.g. "septembrie").
8. Implicit string→date conversion uses Oracle's RR rule; implicit DATE/NUMBER→text conversion in LIKE, SUBSTR, CONCAT, NVL uses Oracle's default formats (`DD-MON-RR`); NVL/NVL2 mixed types convert like Oracle.
9. TO_DATE fills missing fields like Oracle (current year; month defaults per Oracle).
10. The LIKE `ESCAPE ''` rewrite must not break patterns built with `||`.
11. `''` → NULL also for function results that end up empty (e.g. TRANSLATE).
12. Unsupported syntax should error like 11g: quoted upper-case identifiers must work; `^=`, `TRUNC(d,'WW')`, `ROUND(d,'DAY'/'Q')` should work; invalid NEXT_DAY day names must raise ORA-01846.
13. **Oracle strictness:** reject what 11g rejects (3-arg CONCAT, `FROM t AS x`, qualified USING column, LIMIT, ILIKE, `::`, INTERSECT ALL, FETCH FIRST) with the ORA code 11g gives and a Romanian explanation.
14. Checker blind spots: compare dates at full precision including century; don't coerce number-like strings to numbers (LPAD results); demo must exercise `values` and `order` verdicts.
15. Open questions the docs disagree on (UPPER on CHAR comparison, NLS_TERRITORY for `'D'`, NLS_DATE_LANGUAGE on the lab machines): resolve by running them on the Oracle container; where the lab page contradicts real Oracle, real Oracle wins and the lesson explains it.

**Measured against real Oracle 11.2.0.2 (2026-10-24).** The spike engine was run against the Oracle container on 308 queries plus 150 targeted probes. 228 match on values, 45 differ in values or row count, and 35 differ in error behaviour. Of the 52 official solutions, 45 are identical and 5 differ only in the order of tied rows. An independent re-run confirmed every verdict and that `oracle_expected.json` came from Oracle. **The prioritised fix list with Oracle evidence (22 items) is `/home/alexa/hub/docs/2026-10-24-research-bd-lessons/reports/oracle-diff-review.md`; it supersedes items 1–15 above where they differ.** Highlights: show DATE as `DD-MON-RR` without time; implicit DATE↔text via `DD-MON-RR`; `(+)` with set operators; CHAR semantics in two separate parts; ~39-digit NUMBER precision; Oracle sorts set-operator output; column headers as Oracle prints them. Container defaults: NLS AMERICAN/AMERICA, `DD-MON-RR`, AL32UTF8; UPPER on a CHAR column compares blank-padded (1 row for `'BREABAN'`, so the lab 3 page is wrong there). Harness and data: `/home/alexa/hub/docs/2026-10-24-research-bd-lessons/oracle-diff/` (the STUDENT password comes from `ORA_STUDENT_PW`).

**DDL/DML in the sandbox.** Learners may run CREATE/DROP/INSERT/UPDATE/DELETE/COMMIT/ROLLBACK. Each exercise runs in its own throwaway copy of the dataset, reset on every run and every screen, so nothing a learner does leaks. Oracle types map onto Postgres types with Oracle behaviour (VARCHAR2 length errors ORA-12899, NUMBER(p,s) precision ORA-01438 and rounding, CHAR padding, DATE with time). Constraint violations raise the Oracle codes (ORA-00001, ORA-01400, ORA-02291, ORA-02292, ORA-02290). The checker for DDL/DML compares the resulting table structure (columns, types, nullability, constraints, as `DESCRIBE`/`user_tab_columns` would show) and the resulting table contents against Oracle's, not a query result. These statements join the differential test corpus.

**Runtime.** Load PGlite in a **Web Worker** only when the first SQL or query-machine screen opens; show a skeleton meanwhile. Preload a dumped data directory to skip initdb (spike: cold start ≈0.7 s with a 4.65 MB `datadir.tar.gz`, vs ≈2.1 s fresh). Two datasets: the lab's five tables and the Biblioteca mock schema; reset between runs so learners can't damage them (read-only role or rollback). Measured in node: ≈4 MB brotli transfer, RSS ≈720 MB.

**Measured in headless Chrome (2026-10-25, `scripts/sql/measure-browser.mjs`, median of 3 cold runs, the real worker bundle served by Vite preview).** The worker starts from `public/sql/datadir-<dataset>.tar.gz` (4.6 MB gzip, built by `npm run build`'s prebuild step; the data dir is fetched from localhost, so real network time comes on top). One worker serves one dataset; a dataset switch boots a new worker.

| | Desktop (1280x800) | Phone-class (390x844, mobile UA, CPU at 25%) |
|---|---|---|
| Boot (first `run` until the engine is ready) | 0.9 s | 7.7 to 8.3 s |
| First query after boot (`SELECT ... ORDER BY`) | 9 ms | 0.2 s |
| 3-table join with ORDER BY | 7 ms | 0.2 s |
| 5-table cartesian product (105 300 rows, 500 kept) | 2.8 s | 26 s |
| Worker JS heap (used / total) | 36 / 55 MB | 6 / 42 MB (measured after a GC) |
| Page main-thread JS heap | 1 MB | 2 MB |
| Browser processes, summed RSS | about 1.4 GB (headless, includes browser, GPU and renderer) | about 1.4 GB |

How the phone-class column was produced: the CDP CPU throttle (4x) does not reach a Web Worker, and the engine runs in one, so Chrome was started under a systemd CPU quota of 25% (a 4x cut for the whole browser, hence an upper bound for the worker). Real hardware was not measured. `PAPER_MODE_THRESHOLD` in `src/sql/engine/client.js` is a boot of 20 s: a failed boot or no answer within 20 s sets the status to `failed` and the lesson uses paper mode (worked examples with frozen results); the measured phone-class boot of about 8 s leaves 2.5x headroom. PGlite ignores `statement_timeout` (single-user mode has no timers; a 1.5 s `pg_sleep` under a 300 ms limit ran to the end), so the client enforces a run limit of 60 s by terminating and rebooting the worker; `cancel()` does the same on demand. A statement runs on the dataset's clock of 2026-10-26 14:30:00; exercises on the second clock need their own engine and are not served by these data dirs (see the Task 8 report).

**Differential testing against real Oracle.** A dev-only harness (not shipped) runs a query corpus on Oracle 11g and on the engine and diffs results (values, types as text, row order where ORDER BY exists, error codes). The corpus: every official exercise solution, every alternative correct solution in the lessons, every named wrong answer used by the checker, every query shown in lesson text, the mock test, the 159 smoke queries, the refute probes, and generated variants per function family. Oracle outputs are frozen into a committed JSON snapshot that the app and CI use as "expected". A mismatch blocks shipping the affected exercise.

## 9. Fitting into the repo (from the architecture map)

The full map is `/home/alexa/hub/docs/2026-10-24-research-bd-lessons/reports/arch.md`. Key points the plan must respect:

- **Subject shell:** `src/content/bd/index.js` modelled on `oop/index.js`; register in `src/content/registry.js` with a new `yearSemesters` entry `y2s1`. `step.id` must start with the course `metaId` + `-`, and `sectionCount` must equal `steps.length`.
- **Smoke test** hard-codes `SUBJECTS` and `'y1s2'` in `scripts/smoke-test.mjs`; extend it to `bd` under `y2s1`.
- **Validator:** unknown block types pass `npm run validate` silently. Add clauses for every new block type to `scripts/validate-course-json.mjs`, and a `sql` question type to `validate-test-json.mjs`.
- **Player:** `CourseRenderer.jsx` already shows one step per screen with `CourseTransition` and a stepper; `StepRenderer.jsx` maps blocks. A step can be a long stack, so add a card mode (one block or block-group per screen) in `StepRenderer`, a completion callback so blocks can gate Continue, and the screen in the URL (`SubjectPage.jsx` parses the route). `CourseRenderer` currently resets to step 0 on load; fix resume. Choosing between "one step per screen" and "cards inside a step" is left to the builder as long as §6 holds.
- **Blocks:** new `sql-sandbox` and `query-machine` in `src/components/blocks/registry.js` (lazy, Suspense skeleton, like `AnimationBlock.jsx`). Reuse `QuizBlock` (per-option explanations, `reviewStep`) and `ThinkBlock` where they fit. `StepPlayer.jsx` has a reveal-only prediction gate; the query machine needs click-to-predict. `TableRenderer.jsx` auto-plays; the query machine must not.
- **Editor:** `CodeEditor.jsx` is a plain textarea despite `CLAUDE.md`; CodeMirror packages are installed but unused and `@codemirror/lang-sql` is not in `package.json`. Editor choice is left to the builder (must highlight SQL, work on phones, support Ctrl+Enter).
- **Tests:** `TestRenderer.jsx` falls back to an LLM-graded open question for unknown question types; add a real `sql` question component and a one-question-per-screen mode for the mock.
- **Progress:** add a new versioned localStorage key (e.g. `bdLessonState`) through `useLocalStorage` in `AppContext.jsx` for attempts, hints used, verdicts, timestamps and review scheduling. Don't reshape the existing `progress` (`{visited, understood}`). New tab "Recapitulare" needs edits in `ContentTypeBar.jsx`, `BottomTabBar.jsx` and `SubjectPage.jsx` together.
- **Docs drift:** `CLAUDE.md` is stale (HashRouter line, CodeMirror claim) and the authoring skills in `.claude/skills/` are untracked and partly stale. Update `CLAUDE.md` for the new subject, blocks and player.

## 10. Verification before calling it done

1. Every expected result in the app equals Oracle 11g's output (differential harness green).
2. `npm run validate`, `npm run build`, `npm run smoke` pass, with `bd` routes walked.
3. Opened live (on `vite preview` and then on the Pages URL after deploy) in a real Chrome at desktop width and at phone width (≈390 px): every lesson's screens advance, animations run, reduced-motion works, every SQL exercise runs and grades, the query machine predicts and checks, the review pile fills and resurfaces, the mock test runs in both modes. Screenshots and a short screen recording are kept.
4. PGlite memory and load time measured in Chrome desktop and phone emulation and recorded in the PR.
5. A learner-text sweep: no pedagogy labels, no citations, no English left in Romanian text, no errors from the outline's "don't copy" list.

## 11. Open questions for Alex

Asked one at a time; answers go here.

1. **Pull the Oracle 11g image?** `gvenzl/oracle-xe:11-slim`, ~300 MB download, 1–2 GB of the 16.7 GB free on `/`, rootless Docker, bound to 127.0.0.1. If no: fallbacks in `/home/alexa/hub/docs/2026-10-24-research-bd-lessons/reports/oracle.md` (Alex runs the scripts on his Windows XE 11g, or Oracle 21c, or answers labelled unverified). *Answer: yes (Alex, 2026-10-24: "yes download").*
2. **Are CREATE TABLE / INSERT (lab 1 ex 1–2) on L1?** *Answer: include everything the labs have, more is fine (Alex, 2026-10-24: "anything is fine, just needs whatever the labs have and if it can have more then that's fine i think"). See the DDL/DML module in §7 and §8.*
3. **May the builder push to `main` (which deploys the public site) once every check in §10 passes, or should Alex review a branch first?** *Answer: push to `main` once every §10 check passes (Alex, 2026-10-24: "you can push.").*

## 12. Left to the builder

- Component structure, file names, styling details within the existing theme tokens, exact animation curves and timings.
- Editor library, and how the worker talks to the page.
- Whether card mode is "a step per screen" or "cards inside a step".
- How hints and named-mistake detectors are encoded in JSON, as long as the validator enforces them.
- Exact wording of learner text beyond the outline, within §3's anti-goals.
