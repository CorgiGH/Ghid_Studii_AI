**What:** Implementation plan for the Învățare automată (ML) lessons in Ghid_Studii_AI · **When:** 2026-10-28 · **Status:** active

# ML lessons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the ML subject (24 lessons, 2 paper-mode tests) to the study guide on the BD lesson player, every number checked by script, every idea in exactly one lesson.

**Architecture:** ML is a second `player:'lesson'` subject. It reuses the BD player, store, `mcq`/`reflect` blocks and viz kit. It adds static question tables, a `calc-exercise` block whose answers are formulas the tests re-evaluate, a `proof-steps` block, 18 viz widgets and ML content tests that enforce the BD lessons-learned automatically. Content is JSON written from the approved outline.

**Tech Stack:** React 19, Vite, motion, KaTeX, vitest, puppeteer (walk), Node scripts.

**Spec:**
- `docs/superpowers/specs/2026-10-28-ml-lessons-design.md` (approved by Alex 2026-10-28: "sure, go ahead").
- `docs/superpowers/specs/ml-outline/2026-10-28-ml-lessons-content-outline.md`: what each lesson contains.
- `docs/superpowers/specs/ml-outline/allocation.json`: who owns each exercise, concept and table.
- `/home/alexa/hub/docs/2026-10-28-research-ml/reports/verified-answers.md`: checked answers and conventions.
- `docs/superpowers/specs/2026-10-28-bd-mistakes-to-prevent.md`: every BD mistake and its prevention. Each "ML prevention" line in it is a requirement of the task named next to it.

Worktree: `/home/alexa/Desktop/SO/os-study-guide-ml`, branch `ml-lessons` (from origin/main 3e85045).

## Global Constraints

- Content is JSON only, no new JSX content. Every learner string is `{en, ro}`; Romanian is the default and uses the outline's terms (Ciortuz's notation), never a fresh translation.
- Inline text is limited to `**bold**`, `` `code` `` and `$KaTeX$`. No Romanian quotes „ ”, no markdown tables, lists or code fences inside text blocks, no `$` in step titles.
- No phase or pedagogy words on learner screens (pretest, concret, regulă, de ce, retrieve, recapitulare de fază), and no "Pasul N" labels. The only citation allowed is the outline's footnote line ("Cursul: slide N. Culegerea: p. M").
- Each concept, worked example, data table, quiz stem and exercise part has exactly one owner lesson, the one in `allocation.json`. Reuse is allowed only for the `declared_reuse` tables, which are shown again in full on the screen that uses them. A lesson that needs an earlier idea writes one line "vezi Lecția N".
- A question about data shows that data on the same screen. Never write "tabelul de mai sus", "ecranul anterior" or "același tabel" pointing at another screen.
- Every number the learner sees in a field, an option or a detector comes from a formula that the content test re-evaluates. `[calculat]` solutions carry the line "Culegerea nu dă răspunsul; verificat de două ori."
- Book typos (0.57, 2.4, T20C, 4.19.d, 4.12.b, 4.13) are shown corrected, with a one-line note giving the printed value.
- Answers that depend on an unprinted convention (D-049) state the book's rule on screen and accept the alternative with a note.
- Lesson ids are `ml-lNN` (NN = 01…24), step ids `ml-lNN-sK`, files `src/content/ml/courses/lesson-NN.json`, src `ml/courses/lesson-NN.json`. Courses are appended to `ml/index.js` in lesson order.
- Block ids are `ml-lNN-<name>` and every step and block id is unique across the subject: BD and ML share one progress store keyed by those ids (`tests/content/ml-content.test.js` checks it).
- Component tests run in vitest's `node` environment: render with `react-dom/server` `renderToStaticMarkup` (inside a `StaticRouter` where a component needs the router), with `vi.mock` replacing `useLessonStore` (a real `createLessonStore` on a memory storage) and `useApp`. The repo has no jsdom or @testing-library and none is added. Typing, pressing and remounting are tested through the block's pure state and restore functions, then a render from the store those functions wrote; the real-Chrome walk (Task 10) presses the real controls.
- Colours come only from `var(--theme-*)` and the existing lesson tokens `--lt-*` (`--lt-keep` for the + class, `--lt-drop` for the − class, `--lt-hint` for highlights, `--lt-acc` for the accent, `--lt-t0`…`--lt-t3` for series). An ML-only token is defined in `src/index.css` as a `color-mix` of those. No hex in new CSS, and no opacity classes for muted text. Contrast is checked per palette and mode in the final gate.
- At 390 px there is no horizontal page overflow; wide tables scroll inside their own box. Touch targets are at least 44 px.
- Visuals advance manually and ask for a prediction first. Reduced motion keeps the end state; nothing autoplays.
- `git add` only named paths. Never commit `.claude/settings.local.json`, `scripts/review-gemini-alo-c11.mjs`, or the raw ML material (`src/content/ml/{source,tests/source,refs/files,students,_text}`, `materials.json`, `MATERIALS.md`).
- No push to origin without Alex's word. A push to main deploys the public site.
- Builders run on Sonnet; reviewers and the final verify run on Opus.
- **Clarity standard (Alex, 2026-10-30, after lesson 1 was unreadable: "i can't understand shit from lesson 1").** Every lesson, published or not, follows it; a reviewer rejects a lesson that breaks it.
  1. Core first. The main path teaches only what the teacher's list (`ml-outline/2026-10-29-teacher-list-coverage.md`) needs from this lesson. For each idea, in this order: a worked example with small concrete numbers, step by step; the rule in one plain Romanian sentence; the formula with every symbol named in words; one or two practice items.
  2. Formal material the list does not ask for (axioms, side properties, proofs the list does not name) is cut to at most one plain screen when a later lesson needs it; otherwise it moves into the optional exercises at the end, titled "Opțional: …". Order: core screens, core exercises, optional exercises.
  3. One idea per screen. Outside tables and exercise data, a screen has at most 80 words of learner text and no paragraph longer than 3 sentences.
  4. No symbol or term before plain words introduce it.
  5. At most two `reflect` screens per lesson (the pretest and the why-question), both answerable by common sense; other checks are pick-one questions.
  6. Core exercises are the ones that look like test questions (the teacher's list, T1 and T21P items); a long multi-part exercise is split or made optional.
  7. Nothing verified becomes wrong: every number, formula and verified answer is kept or recomputed with `evaluate`.

## Review Focus

1. **Answer typed in another valid form.** `0,9183`, `0.918`, `9/17`, `18/34`, `.5` and an attribute name typed with different case are all graded the same way within tolerance; `ln` instead of `log₂` gets the named message. Pinned in the calc-exercise task (parse and grade tests).
2. **Phone at 390 px with the 14-row PlayTennis table and a 5-column joint table.** The table scrolls inside its box and the fields stay reachable above the sticky footer. Pinned in the ML walk (overflow and hit-test at landing and max scroll).
3. **Reload or Back after answering a calc exercise or a proof step.** The typed answers, verdicts and hints come back and the gate stays open. Pinned in the calc-exercise and proof-steps tasks (restore tests).
4. **Two subjects in one store.** ML's Recapitulare and badge show only ML items, BD's only BD items. Pinned in the second-subject task (store and review tests).
5. **Dark mode in each of the 5 palettes.** Widget marks, verdict colours and table stripes keep WCAG AA contrast. Pinned in the final gate's visual check (contrast at 375×720 and 1280×720 per palette and mode).

---

## File structure

| Path | Responsibility |
|---|---|
| `src/content/rawMaterial.js` | `RAW_MATERIAL_GLOBS`, the folders that hold source material and are never content |
| `src/content/jsonLoader.js` (modify) | eager glob that skips raw material |
| `scripts/validate-all.mjs`, `scripts/lint-site.mjs` (modify) | same skip list |
| `src/content/ml/index.js`, `src/content/ml/practice/Practice.jsx` | subject shell |
| `src/content/registry.js`, `scripts/smoke-test.mjs` (modify) | register `ml` |
| `src/components/lesson/blocks/choiceSpec.js` (modify) | lesson ids for `bd` and `ml`; static `table` form |
| `src/components/lesson/blocks/QuestionTables.jsx` (modify) | renders static tables without the SQL engine |
| `src/components/lesson/blocks/trapTags.js` (modify) | adds `ML_TAGS` |
| `src/lesson/subjectScope.js` | `inSubject(item, slug)`; review and badge filters |
| `src/ml/calc/fraction.js`, `mathKit.js`, `formula.js` | exact math and the formula language |
| `src/ml/calc/answer.js` | parse and grade a typed answer |
| `src/components/lesson/blocks/calcSpec.js`, `CalcExerciseBlock.jsx`, `LogCalculator.jsx` | calc-exercise block |
| `src/components/lesson/blocks/proofSpec.js`, `ProofStepsBlock.jsx` | proof-steps block |
| `src/components/lesson/viz/widgets/ml/*.jsx`, `viz/logic/ml/*.js` | the 18 ML widgets and their pure logic |
| `tests/ml/*.test.js` | unit tests of the pieces above |
| `tests/content/ml-content.test.js` | the content gate (numbers, data on screen, repetition, text sweep) |
| `scripts/ml/walk-ml.mjs` | real-Chrome walk of every ML screen |
| `src/content/ml/courses/lesson-NN.json`, `src/content/ml/tests/{mock-t1,t21p}.json` | content |

---

### Task 1: Keep the raw material out of the bundle and the validators

**Files:**
- Create: `src/content/rawMaterial.js`
- Modify: `src/content/jsonLoader.js:2`, `scripts/validate-all.mjs` (`walk`), `scripts/lint-site.mjs` (its content walk)
- Test: `tests/ml/raw-material.test.js`

**Interfaces:**
- Produces: `export const RAW_MATERIAL_DIRS = ['source', 'refs', 'students', '_text']` and `export const RAW_MATERIAL_FILES = ['materials.json']`, plus `export function isRawMaterial(relPath: string): boolean`, where relPath is relative to `src/content`.

- [ ] **Step 1: Write the failing test.** `isRawMaterial('ml/materials.json') === true`, `isRawMaterial('ml/students/x/tslint.json') === true`, `isRawMaterial('ml/tests/source/a.json') === true`, `isRawMaterial('ml/courses/lesson-01.json') === false`, `isRawMaterial('bd/tests/mock-l1.json') === false`. Also: `Object.keys(import.meta.glob('../../src/content/**/*.json'))` filtered by `isRawMaterial` must have the same length as the loader's module keys. Export `__keys()` from jsonLoader for this.
- [ ] **Step 2:** Run `npx vitest run tests/ml/raw-material.test.js`. Expected: FAIL (module missing).
- [ ] **Step 3: Implement.** `import.meta.glob` takes literal patterns only, so jsonLoader uses `import.meta.glob(['./**/*.json', '!./**/source/**', '!./**/refs/**', '!./**/students/**', '!./**/_text/**', '!./*/materials.json'], { eager: true })`. Keep the literal list next to `RAW_MATERIAL_DIRS`, with a comment that the two must match; the test checks it. validate-all and lint-site skip any path where `isRawMaterial` is true.
- [ ] **Step 4:** Run `npx vitest run tests/ml/raw-material.test.js && npm run validate && npm run build`. Expected: PASS, with the local ML material present.
- [ ] **Step 5:** Commit `feat(content): skip raw course material in the JSON glob and validators`.

### Task 2: Register the ML subject

**Files:**
- Create: `src/content/ml/index.js`, `src/content/ml/practice/Practice.jsx` (BD's stub shape)
- Modify: `src/content/registry.js` (import, `subjects`, y2s1 `['bd','ml']`), `scripts/smoke-test.mjs:24` (append `'ml'`)
- Test: `tests/content/ml-content.test.js` (registration block only)

**Interfaces:**
- Produces: `ml` subject `{ slug:'ml', yearSemester:'y2s1', player:'lesson', title:{en:'Machine learning', ro:'Învățare automată'}, shortTitle:{en:'ML', ro:'ML'}, courses:[], seminars:[], labs:[], tests:[], practice }`. The ro shortTitle is `'ML'` (`IA` is the separate Inteligență artificială course). The description is `{en:'Probability, entropy, decision trees (ID3) and Bayesian classifiers, weeks 1–5', ro:'Probabilități, entropie, arbori de decizie (ID3) și clasificatori bayesieni, săptămânile 1–5'}`. The ML content test reads `courses`. Each lesson task appends one entry in BD's one-line shape, which the smoke regex needs.

- [ ] **Step 1: Failing test.** In `ml-content.test.js`, for every course: `metaId === json.meta.id`, `sectionCount === json.steps.length`, every `step.id` starts with `${metaId}-` and is unique, `courses` are in `ml-l01…` order with no gaps, every `src` loads through `loadJson`. Also `registry.yearSemesters.find(y => y.id === 'y2s1').subjects` equals `['bd','ml']`.
- [ ] **Step 2:** Run `npx vitest run tests/content/ml-content.test.js`. Expected: FAIL (no ml subject).
- [ ] **Step 3:** Implement the shell and registration.
- [ ] **Step 4:** Run `npx vitest run tests/content/ml-content.test.js && npm run build && npm run smoke`. Expected: PASS; smoke walks `/y2s1/ml` and `/y2s1/ml/practice`.
- [ ] **Step 5:** Commit `feat(ml): register the Învățare automată subject`.

### Task 3: Make the lesson player serve a second subject

**Files:**
- Create: `src/lesson/subjectScope.js`
- Modify: `src/components/lesson/ReviewTab.jsx` (filter `pendingReview`), `src/components/ui/ContentTypeBar.jsx:8`, `src/components/layout/BottomTabBar.jsx:15`, `src/components/lesson/blocks/trapTags.js`
- Test: `tests/ml/second-subject.test.js`

**Interfaces:**
- Produces:
  - `inSubject(item, slug) => boolean`, true when `item.ref.src` starts with `${slug}/`.
  - `pendingReviewFor(store, slug, now) => item[]` (the store's order) and `dueCountFor(store, slug, now) => number`.
  - `export const ML_TAGS = [...]`, merged into `TRAP_TAGS`. It holds every misconception tag the outline names, kebab-cased. The tags are listed in the outline's quiz items and in `/home/alexa/hub/docs/2026-10-28-research-ml/reports/seminar-and-errors.md`; extract them all, and the content test fails on any tag a lesson uses that is not here. The slug rule is written in `trapTags.js` (LaTeX commands dropped, − ≠ and Greek letters spelled out, sub- and superscript digits as digits, diacritics dropped, lower case, other runs one hyphen), and `tests/ml/second-subject.test.js` holds every outline `✗[label]` to it. The B3 catalogue items are short English names.

- [ ] **Step 1: Failing tests.**
  - With a store holding one BD and one ML review item, `dueCountFor(store,'ml',now) === 1` and `dueCountFor(store,'bd',now) === 1`.
  - The ReviewTab for `ml` lists only the ML item (server render with a mocked store, per the testing note in Global Constraints).
- [ ] **Step 2:** Run `npx vitest run tests/ml/second-subject.test.js tests/lesson`. Expected: the new tests FAIL and the old ones pass.
- [ ] **Step 3:** Implement. The badge components and ReviewTab take the slug from their `subject` prop (`subject.slug`), which SubjectPage resolves from the route's `useParams().subject`.
- [ ] **Step 4:** Run `npx vitest run`. Expected: PASS, with all BD tests still green.
- [ ] **Step 5:** Commit `feat(lesson): scope review and badge to the subject; ML trap tags`.

### Task 4: Static question tables

**Files:**
- Modify: `src/components/lesson/blocks/choiceSpec.js` (`tableError`, `lessonOrder`), `src/components/lesson/blocks/QuestionTables.jsx`, `src/components/lesson/ResultTable.jsx` (`highlight`; a header handed in as an element is drawn whole), `src/components/lesson/blocks/McqBlock.jsx` (options ready at once when every table is static), `src/components/lesson/tableText.js` (`cellClass` of a typeset cell), `src/index.css` (`.sx-table … .is-hl`)
- Test: `tests/ml/static-table.test.js`

**Interfaces:**
- Produces: a `table` entry may be `{ caption?:{en,ro}, columns:[string|{en,ro}], rows:[[string|number]], highlight?:{rows?:number[], cols?:number[]} }` (static) or BD's `{dataset, sql}`. A static entry renders through `ResultTable` at once, without touching `useSqlRunner`, and settles at once. Cells and column headers may hold KaTeX (`$\bar A$`); QuestionTables typesets them, and ResultTable never typesets a text header (a SQL result header such as `RPAD('$',3,'$')` stays text). The caption is plain text (a `$` in it is rejected). The block shape is used by `mcq`, `reflect`, `calc-exercise` and `proof-steps`.
  - `choiceSpec.js` also exports `MAX_TABLE_ROWS` (45), `isStaticTable(tb)` and `tablesAtOnce(table)`.
  - `lessonOrder` reads `bd-lNN` and `ml-lNN` ids; an mcq `review` must name an earlier lesson of the same subject.

- [ ] **Step 1: Failing tests.**
  - `tableError({columns:['X','Y'], rows:[[1,0]]}) === null`.
  - A ragged row is an error, and so is a row count over 45.
  - Rendering an `mcq` with a static table (server render) shows the rows and enables the options without an engine (mock `useSqlRunner` to throw if called).
- [ ] **Step 2:** Run `npx vitest run tests/ml/static-table.test.js`. Expected: FAIL.
- [ ] **Step 3:** Implement. A wide table scrolls horizontally inside ResultTable's own `.sx-table-scroll` box (`overflow:auto`) within `.ch-table`; `.ch-table` itself is unchanged, so BD tables are untouched.
- [ ] **Step 4:** Run `npx vitest run`. Expected: PASS.
- [ ] **Step 5:** Commit `feat(lesson): static data tables for questions`.

### Task 5: Exact math and the formula language

**Files:**
- Create: `src/ml/calc/fraction.js`, `src/ml/calc/mathKit.js`, `src/ml/calc/formula.js`
- Test: `tests/ml/calc-math.test.js`

**Interfaces:**
- Produces:
  - `Fraction` with `add sub mul div equals toNumber() toString()` (BigInt numerator and denominator, always reduced).
  - `evaluate(expr: string, scope: object) => number | Fraction | string | boolean`.
  - `scope.T`: a block's static table, available as `T` (or as `T1`, `T2`… for several). A table used by the formulas may also carry `ignore:[column]` (columns that are not attributes, such as PlayTennis's `Day`) and `domains:{column:[values]}` (values the rows do not show, for add-one). A column written `{en, ro}` is named by its `en` in formulas. A column named `P` holds row probabilities (a joint distribution) and the counts become weights.
  - The language: numbers, fractions `a/b`, `+ - * / ^`, parentheses, comparisons, names from `scope`, string literals, `[arrays]`, `{key: value}` options, `true`/`false`, and these functions:
    - `log2 ln log10 sqrt exp abs min max sum`
    - `H(...probs)` (entropy of a distribution, or of counts when the arguments are integers summing to more than 1)
    - `Hc(T, attr, target)`, `IG(T, attr, target)`, `IGR(T, attr, target)` (gain ratio), `splitInfo(T, attr)`, `gini(...p)`, `misclass(...p)`
    - `bestAttr(T, target)` (ties broken left to right; returns the column name)
    - `thresholds(T, attr, target)` (midpoints where the label changes; the count convention is a flag)
    - `count(T, cond)`, `P(T, cond)`, `Pc(T, cond, given)` (conditions are strings like `"Outlook=Sunny & Play=Yes"`)
    - `nb(T, target, row, {laplace:bool})` (class with the larger product), `nbScore(T, target, row, cls, {laplace})`
    - `joint(T, target, row)`, `paramsNB(nAttrs, nVals, nClasses)`, `paramsJoint(...)`
    - `cvlooId3(T, target, {tie})` (number of errors), `trainErrId3(T, target)`
    - also: `Hcol(T, col)` (entropy of one column), `where(T, cond)` (the rows that satisfy a condition, as a table), `nbProb(T, target, row, cls, {laplace})`, `jointScore(T, target, row, cls)`, `trainErrNB(T, target, {laplace})`, `cvlooNB(T, target, {laplace})`, `id3Root(T, target, opts)`, `id3Tests(T, target, opts)`, `len(x)`
    - options: `IG`, `Hc`, `IGR` and `splitInfo` take `{threshold:v}` (the test `X <= v`); the ID3 functions and `bestAttr` take `{continuous:[cols]|true, maxDepth, tie:'class0'|'class1'|label, mixedBoundary}`; `thresholds` takes `{mixedBoundary}`, default `true` (the book's count, 6 on 4.51)
    - `paramsNB(nAttrs, nVals, nClasses=2)` and `paramsJoint(…)`: `nVals` is one number or one per attribute (`[3,3,2,2]` for 2.27). Naive Bayes and Joint Bayes ties go to the first class in sorted order.
    - `binom(n,k)`, `binomPmf(n,p,k)`, `E(values, probs)`, `Var(values, probs)`, `Cov(T, x, y)`
    - `KL(p, q)`, `CH(p, q)`
  - The parser is a small Pratt parser with no `eval` and no `Function`. An unknown name is an error.

- [ ] **Step 1: Failing tests.** These values come from the book and `verified-answers.md`, compared within 5e-5 unless exact:
  - `H(9/14, 5/14) ≈ 0.9403`
  - `IG(PlayTennis,'Outlook','EnjoyTennis') ≈ 0.2467` (the target column keeps the book's name, EnjoyTennis)
  - `bestAttr(PlayTennis,'EnjoyTennis') === 'Outlook'`
  - `H(1/5,4/5) ≈ 0.7219` and `H(2/5,3/5) ≈ 0.9710` (the T20C hint, corrected)
  - 0.57 `H(C|T) ≈ 0.82740`
  - 2.4 `P(T0|D) = 108/3125` (exact)
  - `paramsNB` on the 2.27 case gives 13, and the joint count gives 71
  - `thresholds` on the 4.51 data gives 6 with the both-labels-boundary flag and 5 without
  - `cvlooId3` on 2.4 DT2 gives 1 error out of 5 with `tie:'class0'` and 3 out of 5 with `tie:'class1'`
  - `evaluate('1/3*1/10', {})` equals `Fraction(1,30)`
  - `evaluate('foo(1)', {})` throws
  
  Put the PlayTennis table in `tests/ml/fixtures/playtennis.json`, copied from the book page cited in the outline (with `ignore:['Day']`).
- [ ] **Step 2:** Run `npx vitest run tests/ml/calc-math.test.js`. Expected: FAIL.
- [ ] **Step 3:** Implement. `log2(0)*0` is treated as 0 inside `H`.
- [ ] **Step 4:** Run the test. Expected: PASS.
- [ ] **Step 5:** Commit `feat(ml): exact math kit and formula evaluator`.

### Task 6: The calc-exercise block

**Files:**
- Create: `src/ml/calc/answer.js`, `src/components/lesson/blocks/calcSpec.js`, `src/components/lesson/blocks/CalcExerciseBlock.jsx`, `src/components/lesson/blocks/LogCalculator.jsx`
- Modify:
  - `src/components/blocks/registry.js` (add `'calc-exercise'`)
  - `scripts/validate-course-json.mjs` (call `validateCalc`)
  - `src/components/lesson/playerLogic.js` (add it to `GATING_TYPES`; `gatingKind` returns `'calc'`; `seedGate` treats `'calc'` like `'sql'`: a right answer, a reveal or a skip opens the gate, read as an attempt with `ok` or `done`; a wrong check records `done:false`, so the gate stays shut after a reload)
  - `src/index.css` (`.ch-calc*` styles from theme tokens)
- Test: `tests/ml/calc-exercise.test.js`

**Interfaces:**
- Consumes: `evaluate` (Task 5), static `table` (Task 4), `useScreenGate`, `useLessonStore`, `restore.js` helpers.
- Produces: the block JSON
  ```
  { type:'calc-exercise', id, exercise:string|string[], source:{en,ro}?, statement:{en,ro}, table?, data?:{name:value},
    fields:[{ id, label:{en,ro}, kind:'num'|'frac'|'choice'|'tf'|'multi', formula, expected, tol?, options?:[{en,ro}],
              accept?:[{ value, note:{en,ro} }] }],
    detectors?:[{ field, formula, message:{en,ro} }],
    hints:[{en,ro},{en,ro},{en,ro}], solution:{en,ro}, status:'book'|'verified-twice'|'ruled', ruledNote?:{en,ro},
    variants:[{ statement, table?, data?, hints?:[{en,ro},{en,ro},{en,ro}], fields:[{id, formula, expected, tol?, accept?}], solution }] }
  ```
  - `expected` is what the learner should type. The content test asserts `evaluate(formula, scope) ≈ expected`. A `tf` field expects the string `'true'` or `'false'`; a `choice` field's `expected` is one of its options.
  - `hints` are exactly three (what to compute, the formula with the numbers in, the full step).
  - `accept` lists alternative answers under a stated convention (D-049).
  - A variant brings its own `hints` and `accept` or none: the block's own carry the block's numbers, so review never shows or accepts them for new numbers (D-666).
  - `ruledNote` is the outline's line for a `ruled` exercise; the validator requires it when `status === 'ruled'`.
  - Default tolerances follow the outline: ±0.0005 below 1 and ±0.001 at 1 and above. A fraction typed into a `frac` field must equal the expected fraction exactly (18/34 for 9/17, never a nearby fraction); a decimal is accepted within the tolerance (D-667). A `num` field reads a typed fraction as a number.
  - `parseAnswer(text, kind, options?)` returns `{ok, value}` (plus `ratio` for `num`/`frac`: the text was a fraction) and accepts a decimal comma, fractions, leading `.5` and case-insensitive choices; `options` are the field's, which a choice is matched against.
  - `grade(field, text, scope, detectors?) => {verdict:'right'|'wrong'|'accepted-alt'|'unparsed', detector?:message, note?}`. `detectors` are the block's (they are block-level in the JSON); `note` is the matching `accept` entry's.
  - An attempt is stored with `kind:'calc'`, `item:id`, `hints`, `fields:{id:text}`, `verdicts`, `ok`, `done` and `revealed`. A wrong first check or a third hint enqueues the item for review (the existing `recordAttempt` rules). A third hint before any check is a marker attempt (`unscored:true`) that keeps the gate shut. A value that cannot be read is not an attempt. `calcSpec.js` holds these rules as `calcAction`, `hintAction`, `calcWrite` and `restoreCalcState`.
  - The log calculator is an inline panel with `log₂`, `ln`, `x²`, `√`, fractions and `=`. It is opened by a button on every calc-exercise and keeps its state per screen in memory (a full reload clears it).
  - When `status === 'verified-twice'` or `'ruled'`, the solution shows the line "Culegerea nu dă răspunsul; verificat de două ori." (for `ruled`, its `ruledNote` instead).
  - Small numbers on filled marks use `--theme-content-text` on the soft fill (white on `--lt-hint` or `--lt-acc` is under 4.5:1 in light mode); a locked answer is never dimmed (D-668).

- [ ] **Step 1: Failing tests.**
  - `parseAnswer('0,9183','num').value ≈ 0.9183`; `parseAnswer('9/17','frac')` equals `Fraction(9,17)`; `parseAnswer('outlook','choice')` matches the option `Outlook`.
  - `grade` gives `right` for `18/34` against expected `9/17`, and `accepted-alt` for `3/5` on the 2.4 field whose `accept` holds 3/5.
  - A detector for `IG` typed where `Hc` was asked returns its message.
  - `validateCalc` rejects: a missing formula; `expected` not a string or number; fewer than 3 hints; no `variants` (at least 1 is required); an unknown `status`.
  - Rendered block (per the testing note in Global Constraints): checking a wrong value through the block's state functions gives "Nu chiar" plus the detector message, then the right value gives "Corect", and the gate completes. A fresh render from the same store shows the typed values and verdicts restored.
  - At 390 px the fields are not inside a horizontally overflowing box. This is asserted by class and CSS (no DOM here): the table wrapper has `overflow-x:auto`, the field row does not.
- [ ] **Step 2:** Run `npx vitest run tests/ml/calc-exercise.test.js`. Expected: FAIL.
- [ ] **Step 3:** Implement. Hints climb in three steps: what to compute, then the formula with the numbers in, then the full step. "Arată soluția" is available after the first check or the third hint.
- [ ] **Step 4:** Run `npx vitest run`. Expected: PASS.
- [ ] **Step 5:** Commit `feat(lesson): calc-exercise block with formula-checked answers`.

### Task 7: The proof-steps block

**Files:**
- Create: `src/components/lesson/blocks/proofSpec.js`, `src/components/lesson/blocks/ProofStepsBlock.jsx`
- Modify: `registry.js`, `validate-course-json.mjs`, `playerLogic.js` (`GATING_TYPES`; `gatingKind` returns `'mcq'` for it; `seedGate` re-opens a proof screen only when `proofDoneFromAttempts` holds, or on a skip)
- Test: `tests/ml/proof-steps.test.js`

Why a new block: a proof split across mcq screens would hide the earlier steps. This block keeps the whole chain visible on one screen, which the data-on-screen rule requires.

**Interfaces:**
- Produces: `{ type:'proof-steps', id, exercise?:string|string[], claim:{en,ro}, given?:{en,ro}, table?, steps:[{ shown:{en,ro}, why:{en,ro}?, predict?:{ question:{en,ro}, options:[{text,correct,explain,misconception?}] } }], end:{en,ro} }`.
  - Each `predict` is validated with `validateMcq` rules: one correct option, and every wrong option has a misconception and an `explain`.
  - Steps appear one at a time. A step with `predict` asks it first: the learner chooses the step, then its `shown` text and its `why` appear (the outline's predict-then-reveal; showing the text first gives the answer away, D-664). Earlier steps stay on screen. The Next button says "Mai departe".
  - The gate completes when the last step is shown, which for a last step with `predict` means its prediction is answered; the end line appears then.
  - Each pick is stored as an attempt (`kind:'mcq'`, `item:` `${id}#${k}`); a wrong pick enqueues the review item. Each step revealed is stored as `{kind:'proof', item:id, shown:n, ok:true}` (never enqueues), so a reload restores steps that have no prediction. `proofSpec.js` builds both attempts (`pickAttempt`, `revealAttempt`) and rebuilds the state (`restoredProof`).
  - In Recapitulare a missed pick comes back as a `proof-step` card (Task 8's `collectProofPool`), with the proof up to that step on the card (D-665).

- [ ] **Step 1: Failing tests.**
  - The validator rejects two correct options in one predict.
  - Rendered (per the testing note in Global Constraints): step 1 shows. Picking a wrong option shows its explanation and the right one, and Next reveals step 2. All earlier steps stay in the markup. The gate completes on the last step. A fresh render from the same store restores the revealed count.
- [ ] **Step 2:** Run `npx vitest run tests/ml/proof-steps.test.js`. Expected: FAIL.
- [ ] **Step 3:** Implement with `useVizMotion` (reduced motion means no movement).
- [ ] **Step 4:** Run `npx vitest run`. Expected: PASS.
- [ ] **Step 5:** Commit `feat(lesson): proof-steps block`.

### Task 8: Review brings calc items back with new numbers

**Files:**
- Modify: `src/components/lesson/ReviewTab.jsx`, `src/lesson/review.js`
- Test: `tests/ml/review-calc.test.js`

**Interfaces:**
- Produces:
  - `collectCalcPool(lessons) => [{id, block, src, screen, lesson}]`.
  - `pickCalcVariant(item, pool, {avoid, rand}) => {block, entry, variant} | null`: the block with one of its `variants` swapped in (`withVariant`), never the original numbers, avoiding the variant indexes in `avoid`; when all were shown it starts over without repeating the last one.
  - `collectProofPool(lessons) => [{id, block, src, screen, lesson}]`: every proof prediction as `{type:'proof-step', id:'${proofId}#${k}', claim, given, table, before:[{shown, why}], question, options}`; it joins the mcq pool, so `pickVariant` finds it, and the list names it by its claim.
  - `applyReviewAnswer(store, itemId, ok, at) => {ok, practice, gone, due, at}`: the `markReview` step and the result line, moved out of ReviewTab unchanged.
  - In ReviewTab (`ReviewQuestion`) a `calc` item opens inline as a `CalcExerciseBlock` with `record={false}`, a proof step as `ProofStepReview`; `onAnswer` calls `applyReviewAnswer`.

- [ ] **Step 1: Failing test.**
  - A pending calc item renders a variant whose statement differs from the original's.
  - A right answer moves it to tomorrow.
  - A second "Altă variantă" picks a different variant when there are two.
- [ ] **Step 2:** Run it. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run `npx vitest run`. Expected: PASS.
- [ ] **Step 5:** Commit `feat(lesson): calc items come back in review with new numbers`.

### Task 9: The ML content gate (BD lessons-learned as tests)

**Files:**
- Modify: `tests/content/ml-content.test.js`
- Create: `scripts/ml/check-repetition.mjs` (the same checks as a CLI that prints a per-lesson report)

**Interfaces:**
- Consumes: every `ml/courses/lesson-*.json`, `docs/superpowers/specs/ml-outline/allocation.json`, `evaluate`, `TRAP_TAGS`.
- Produces: these failing-on-violation checks, run on whatever lessons exist:
  1. **Numbers.**
     - For every calc field and variant field, `evaluate(formula, scope) ≈ expected` within `tol`.
     - For every detector, its formula's value differs from the right answer by more than `tol`; otherwise the detector would catch right answers.
     - For every `mcq` whose correct option is numeric (it matches `/^\$?-?[\d.,/ ]+\$?$/` after KaTeX is stripped), the block carries `check:{formula, data?}` and the value matches.
  2. **Data on screen.** Any `mcq`, `reflect`, `calc-exercise` or `proof-steps` whose Romanian text matches `/\btabel(ul)?\b|\bdatele\b|\bsetul de date\b|\barborele\b|\bdistribuți(a|ei) (din|de mai)/i` carries a `table`, or its screen has a `viz` or `table` block. No learner string matches `/de mai sus|ecranul anterior|același tabel|aceleași date/i`.
  3. **Repetition.**
     - Each exercise atom in `allocation.json` `exercise_index` appears in exactly one block's `exercise` (calc-exercise or proof-steps), and that block sits in the lesson `allocation.json` names as its owner.
     - No ML `mcq` carries `review` (no revisits in the lesson flow; review lives only in Recapitulare).
     - Each static table's fingerprint (sorted rows plus columns) appears in one lesson only, unless it is listed in `declared_reuse`.
     - Quiz stems (normalized Romanian) are unique across the subject.
     - No two blocks in the subject share a statement.
  4. **Quiz quality.**
     - Every wrong option has a `misconception` that is in `TRAP_TAGS`, and an `explain`.
     - Correct-answer positions are spread out: no letter holds more than 40% of a lesson's mcqs. This uses the logic of the existing `audit-quiz-bias` check.
  5. **Text sweep.**
     - No Romanian quotes „ ”.
     - No phase words in learner strings: `/\b(pretest|retrieve|faza|concret:|regula:|de ce\?:)/i`.
     - No English words in `ro` strings from a stop-list (the, and, of, which, answer, table, step).
     - No `$` in step titles.
     - Every `ro` string ends without a trailing space.
  6. **Structure.**
     - Every lesson has 2–4 `definition` blocks (its headline concepts).
     - The first screen is a gating `reflect` or `mcq` (the pretest).
     - The last screens are the lesson's exercises.
     - The validator passes.
  7. **Every `viz`** names a widget registered in `VizBlock` and passes `validateViz`.
  8. **Data cited anywhere (BD-mistakes G1).** Check 2's patterns also apply to the text of `explain`, `hints`, `solution`, `answer` and `caption`. A number cited in an explanation must appear in that block's data, its table or a field's `expected`, or be the value of one of its formulas.
  9. **No term before its lesson, no answer given away (G2).**
     - `tests/ml/term-owners.json` lists the key Romanian terms of each concept in `allocation.json` `lessons[].concepts[].name_ro` (for example `entropie condiționată`, `câștig de informație`, `Bayes Naiv`, `verosimilitate`) with the owner lesson. The Task 9 builder writes this file and the Opus reviewer checks it. A learner string in lesson k that uses a term owned by a later lesson fails, unless it is the outline's one-line forward note.
     - A pretest or quiz stem must not contain its correct option's text.
     - A calc statement or hint 1 or 2 must not contain a field's `expected`.
  10. **English and Romanian agree (G5).** In every `{en, ro}` pair, the multiset of numbers and of `$…$` segments is the same.
  11. **The answer format is stated (G7).** Every `num`/`frac` field's label or statement says the rounding ("cu 4 zecimale" or "ca fracție") whenever `tol` < 0.01. A formula that uses `log2`/`H`/`IG` has the statement say "în biți" or "$\log_2$".
  12. **KaTeX never fails silently (G8).** Every `$…$` and `$$…$$` in every ML learner string renders with `katex.renderToString(s, {throwOnError:true})`.
  13. **No hard-coded colours (G9).** New CSS and JSX under `src/components/lesson/**/ml/**`, `CalcExerciseBlock`, `ProofStepsBlock` and `LogCalculator` contain no `#hex`, `rgb(` or `hsl(` literal, and no `opacity-` class on text.

  The checks above cover every gap marked uncovered in `2026-10-28-bd-mistakes-to-prevent.md` that can be checked from the files: G1, G2, G3, G5, G6, G7, G8 and G9. The gaps that need a browser (G4, G9 layout, G10) are in Task 10 and the widget tasks. G11 (no push to main) is a rule in Global Constraints, and G12 (read the project first) was done in `hub/docs/2026-10-28-recon-study-guide-systems-for-ml.md`.

- [ ] **Step 1:** Write all checks against a fixture lesson in `tests/ml/fixtures/lesson-bad.json` that violates each one once. Assert that each check reports exactly its own violation. The checks are exported as functions (`numberProblems(lessons)`, `dataProblems`, `repetitionProblems`, `quizProblems`, `textProblems`, `structureProblems`).
- [ ] **Step 2:** Run `npx vitest run tests/content/ml-content.test.js`. Expected: the fixture tests PASS (the checks catch each violation), and the real-content `it`s pass vacuously because no lessons exist yet.
- [ ] **Step 3:** Commit `test(ml): content gate for numbers, data on screen, repetition and text`.

### Task 10: Walk every ML screen in a real Chrome

**Files:**
- Create: `scripts/ml/walk-ml.mjs` (fork of `scripts/sql/walk-lessons.mjs`, with the SQL engine parts removed)

**Interfaces:**
- Produces: `node scripts/ml/walk-ml.mjs [--lessons ml-l01,…] [--widths 390,1280] [--no-build]`. It exits 1 on any failure and writes its report to `.superpowers/sdd/2026-10-28-ml-lessons/walk/` (gitignored).
  - On each screen:
    - `mcq`: the correct option.
    - `reflect`: reveal.
    - `viz` with predict: predict, then step to the end.
    - `proof-steps`: the correct pick at every step.
    - `calc-exercise`: first the first detector's value, or `expected + 10·tol` when there is no detector. The verdict must not be `right`. Then `expected`, and the verdict must be `right`.
  - Every screen is checked for: Continue unlocks; no console or page errors; no horizontal overflow; not blank for more than 6 s; at 390 px, the Verifică button and the fields are reachable above the sticky footer at landing and at max scroll (hit-test, as BD does for Run).
  - Also: Back keeps the answers, and a reload on a calc screen restores them (on one calc screen per lesson).
  - Layout and state checks from the BD mistakes (G9, G10), on every screen at 390:
    - Every visible button and input is at least 44×44 px.
    - No element is wider than its scroll container, unless the container scrolls (`overflow-x:auto`).
    - In dark mode, scroll to the bottom and press Continue into a shorter screen. The new screen starts at its top with no jump back. No frame of the transition shows a background differing from `--theme-bg` (sample the page colour at three points mid-transition).
    - Two tabs on the same lesson: an answer in tab 1 appears in tab 2 after focus.

- [ ] **Step 1:** Write the script. It is accepted in the lesson 1 task: `PUPPETEER_EXECUTABLE_PATH=/etc/profiles/per-user/alexa/bin/google-chrome-stable node scripts/ml/walk-ml.mjs --lessons ml-l01` passes, and it fails on a scratch copy of the worktree where one `expected` in lesson 1 is wrong.
- [ ] **Step 2:** Commit `test(ml): real-Chrome walk of the ML lessons`.

### Tasks 11–28: The ML visual widgets (one task per widget)

**Files per widget `<name>`:**
- Create: `src/components/lesson/viz/widgets/ml/<Name>.jsx`, `src/components/lesson/viz/logic/ml/<name>.js`
- Modify: `vizSpec.js` (`SPEC['<name>']`), `VizBlock.jsx` (`WIDGETS['<name>']`)
- Test: `tests/ml/viz-<name>.test.js`

**Interfaces:**
- Consumes: `useStepper(n, {predict, own})`, `useVizMotion()`, the static table renderer, `evaluate` (from logic files, for every number drawn).
- Produces: widget `<name>` with the props below. Every number drawn comes from the logic module, never typed into the JSON.

| Task | Widget id | Lessons | Props (required unless `?`) | Spec in outline |
|---|---|---|---|---|
| 11 | `ml-omega` | L1 | `outcomes[]`, `events{A:[…],B:[…]}`, `restrictTo?` | "L1 visual spec" |
| 12 | `ml-freq-tree` | L2 | `population`, `prior`, `sens`, `fpr`, `labels{…}` | "L2 visual spec" |
| 13 | `ml-indep-2x2` | L3 | `counts[[a,b],[c,d]]`, `labels` | "L3 visual spec" |
| 14 | `ml-pmf-cdf` | L4 | `values[]`, `probs[]` | "L4 visual spec" |
| 15 | `ml-joint-table` | L5, L6 | `table`, `x`, `y`, `z?`, `conditionOn?` | "L5 visual spec", "L6 visual spec" |
| 16 | `ml-entropy-bars` | L7, L8 | `splits[[a,b],…]`, `venn?{X,Y}` | L7 and L8 "Vizual" |
| 17 | `ml-id3-builder` | L9, L10, L11 | `table`, `target`, `mode:'stumps'\|'compare'\|'full'` | L9, L10, L11 "Vizual" |
| 18 | `ml-tree-pair` | L12 | `left`, `right` (trees as nested objects), `counts` | L12 "Vizual" (static) |
| 19 | `ml-dup-counter` | L13 | `table`, `target`, `added[]` | L13 "Vizual" |
| 20 | `ml-threshold` | L14 | `table`, `attr`, `target`, `plane?{x,y}` | L14 "Vizual" |
| 21 | `ml-cvloo` | L15 | `table`, `target`, `tie` | L15 "Vizual" |
| 22 | `ml-prune` | L16 | `tree`, `table`, `target`, `epsilon` | L16 "Vizual" |
| 23 | `ml-impurity` | L17 | `p`, `splitInfo?{counts}` | L17 "Vizual" |
| 24 | `ml-likelihood` | L18 | `data{heads,n}`, `grid` | "L18 visual spec" |
| 25 | `ml-posterior` | L19 | `hypotheses[{name,prior,lik}]` | "L19 visual spec" |
| 26 | `ml-nb` | L20, L21, L22 | `table`, `target`, `row`, `modes[]` (`laplace`, `joint`, `errors`) | L20, L21, L22 visual specs |
| 27 | `ml-convex` | L23 | `f` (one of a named list), `a`, `b`, `t` | L23 "Vizual" |
| 28 | `ml-dist-bars` | L24 | `p[]`, `q[]` | L24 "Vizual" |

Each widget task follows the same five steps:

- [ ] **Step 1: Failing tests.**
  - The logic module returns the outline's numbers for the outline's own example (e.g. `ml-cvloo` on the L15 example data gives the outline's error count, and `ml-nb` on the L20 example gives the outline's products).
  - `validateViz` accepts the outline's props and rejects a missing required prop.
  - Rendered with `predict`: Next stays locked until the prediction; reduced motion renders the end state.
  - **The caption matches the picture (G4).** Every caption and every number in the widget text is built from the logic module's state for that step, never typed into props. The test steps through all frames and asserts each caption's numbers equal the drawn values (read from `data-value` attributes on the marks).
- [ ] **Step 2:** Run `npx vitest run tests/ml/viz-<name>.test.js`. Expected: FAIL.
- [ ] **Step 3:** Implement. Colours use only `var(--theme-*)` and `--lt-*` (see Global Constraints); the widget fits 390 px, scrolling wide tables inside their box.
- [ ] **Step 4:** Run `npx vitest run`. Expected: PASS.
- [ ] **Step 5:** Commit `feat(ml): <name> widget`.

### Tasks 29–52: Lessons 1–24 (one task per lesson, `ml-lNN`)

**Files:**
- Create: `src/content/ml/courses/lesson-NN.json`
- Modify: `src/content/ml/index.js` (append the course line)

**Interfaces:**
- Consumes:
  - The lesson's section of the outline: screens, quiz items, exercises with data and verified answers, visuals.
  - Its `allocation.json` entry.
  - The blocks from Tasks 4–8 and its widgets from Tasks 11–28.
  - `verified-answers.md` rows for its exercises.
- Produces: a lesson that passes every gate. The screen order follows the outline:
  1. The pretest (a gating `reflect` or `mcq` with its data).
  2. The worked example (with a predict on each step, and a `viz` where the outline places one).
  3. The rule screens (`definition` and `equation` blocks, 2–4 headline concepts).
  4. The why-question (`reflect`).
  5. The 3–4 quiz items (`mcq`).
  6. One screen per exercise part group (`calc-exercise` or `proof-steps`), in the outline's order, with optional ones last and their title saying so.

Each lesson task:

- [ ] **Step 1:** Write the JSON from the outline section. Every number in a field or numeric option gets a `formula`. Every `[construit]` example is computed by `evaluate` before it is written.
- [ ] **Step 2:** Run `node scripts/validate-course-json.mjs src/content/ml/courses/lesson-NN.json && npx vitest run tests/content/ml-content.test.js && node scripts/ml/check-repetition.mjs`. Expected: all pass. Fix and re-run until they do.
- [ ] **Step 3:** Run `node scripts/ml/walk-ml.mjs --lessons ml-lNN`. Expected: exit 0 at 390 and 1280.
- [ ] **Step 4: Opus review.** The reviewer gets the lesson JSON, its outline section, `verified-answers.md`, `2026-10-28-bd-mistakes-to-prevent.md` and the walk screenshots. It checks:
  - every outline item is present, and nothing is present that the outline gives to another lesson;
  - the prose numbers match the verified answers;
  - the Romanian is correct and uses the lesson's terms;
  - every screenshot shows the data the question asks about;
  - there is no BD mistake class.

  Fix every finding and re-run Steps 2–3.
- [ ] **Step 5:** Commit `feat(ml): lesson NN, <short title>`.

Lessons are independent once Tasks 1–10 and their widgets are in. They are built at most 3 at a time and published to `main` one by one as each passes every check, in the priority order of design §11 (D-067, D-068). `index.js` keeps the course lines sorted by lesson number. A published lesson's ids never change.

### Task 53: The two tests (mock T1 and T21P)

**Files:**
- Create: `src/content/ml/tests/mock-t1.json`, `src/content/ml/tests/t21p.json`
- Modify: `src/content/ml/index.js` (`tests[]`, `group:'mock'` and `group:'past'`)

**Interfaces:**
- Produces: `meta.modes:['paper','practice']`, `meta.timerChoices:[100]`, `meta.totalPoints:6`, `oneQuestionPerScreen:true`. Questions are `open-ended` with `points`, `prompt` (data included as KaTeX arrays, not markdown tables), `rubric` (the barem, item by item, from the outline) and `modelAnswer`. The points add up to 6. T21P's rubric is marked as ours ("barem propus, nu oficial").

- [ ] **Step 1:** Add to `ml-content.test.js`: both tests validate, points sum to 6, every question has a rubric, and every numeric answer in `modelAnswer` has a `check` formula that evaluates to it.
- [ ] **Step 2:** Write both JSONs from the outline's sections 5.1 and 5.2.
- [ ] **Step 3:** Run `npm run validate && npx vitest run tests/content/ml-content.test.js`. Expected: PASS. Then run the test once in Chrome at 390 and 1280: paper mode, hand-in, self-scoring.
- [ ] **Step 4:** Opus review against the outline, as in the lesson tasks.
- [ ] **Step 5:** Commit `feat(ml): mock T1 and the 2021 T21P paper`.

### Task 54: Whole-subject gate

- [ ] **Step 1:** Run `npm run validate && npx vitest run && npm run build && npm run smoke`. Expected: all pass.
- [ ] **Step 2:** Run `node scripts/ml/walk-ml.mjs` (all lessons, 390 and 1280). Expected: exit 0.
- [ ] **Step 3: Visual gate.**
  - Contrast at 375×720 and 1280×720 in all 5 palettes, light and dark, on one screen of every widget and every block type.
  - No horizontal overflow at 375.
  - Dead-UI audit: every control does what its label says.
  - CSS-variable completeness.

  Use `/review-site` and loop until it reports zero findings.
- [ ] **Step 4: Live check (Claude, in Alex's Chrome or a local Chrome).** Open the built site and go through one full lesson by hand at desktop and at 390 px: pretest, worked example, viz, a wrong then a right calc answer, the calculator, a proof, review with a variant, reduced motion. Look at every screen. Then open one screen of every other lesson.
- [ ] **Step 5:** Run `node scripts/ml/check-repetition.mjs` over all 24 lessons and attach its report. Expected: zero violations.

### Task 55: Docs and memory

- [ ] **Step 1: Update `CLAUDE.md`:**
  - the ML subject;
  - the `calc-exercise` and `proof-steps` blocks, with their JSON;
  - static tables and the formula language;
  - the ML widgets;
  - the raw-material skip list;
  - `scripts/ml/*`;
  - the ML content gate.

  Also correct the block list the recon found stale.
- [ ] **Step 2:** Add a study-guide memory entry under `/home/alexa/.claude/projects/-home-alexa-Desktop-SO-os-study-guide/memory/` for the ML subject. Link to the plan and the BD-mistakes doc.
- [ ] **Step 3:** Commit `docs: ML subject, calc and proof blocks, content gate`.

### Task 56: Publish (only on Alex's word)

- [ ] **Step 1:** Ask Alex once whether to publish to the public site or keep it local. Record his answer in design §11.
- [ ] **Step 2:**
  - **Public:** push `ml-lessons` to main on his word, then check that the Pages deploy succeeds and open `/y2s1/ml` live.
  - **Local:** run `npm run build && npx vite preview` and give him the URL.
