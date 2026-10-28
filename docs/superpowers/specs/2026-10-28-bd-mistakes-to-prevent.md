**What:** every mistake from the BD lesson build and how the ML build prevents it · **When:** 2026-10-28 · **Status:** active

# BD lesson build: mistakes to prevent in the ML build

## Sources and how to read this

- Git: `git -C /home/alexa/Desktop/SO/os-study-guide-ml log 3086670..3e85045` is 56 commits (52 non-merge, 4 merges of the "screen-audit content fixes" lanes c1-c4). 32 of the 52 are one-lesson content fixes (`fix(bd): L<n>` or `D<n>`). 3086670 is the tip that was pushed to main; the 45 `fix(bd|sql|test)` commits before it (11 of them `fix(sql)`) were caught inside the build by reviewers, so they show what the build's own reviews found.
- `/home/alexa/hub/docs/2026-10-25-bd-lessons-rulings.md` (rulings R1-R44, known leftovers), `/home/alexa/hub/docs/2026-10-28-recon-study-guide-systems-for-ml.md` (section 4 "What BD did wrong"), `/home/alexa/hub/DEVLOG.md` lines 110-119, Alex's feedback memories.
- Alex's words: "there was a lot of stuff that kept repeating like 3-4 times sometimes, like the topic or exercise would just be repeating even in other topics"; "you started making it without looking at any of the systems or info within the study guide project"; "don't just edit the site straight up" (DEVLOG 2026-10-26); on 2026-10-25 "you can't just ask shit about a table then not fucking show the table" (memory feedback_show_the_data).
- "Existing check" means something that exists in `/home/alexa/Desktop/SO/os-study-guide-ml` today. "ML design" means `docs/superpowers/specs/2026-10-28-ml-lessons-design.md` section 3 (anti-goals) and 10 (verification). Prevention items marked *proposed* do not exist yet; each is written so a plan can make it a task.
- Common limit of the existing checks: `scripts/sql/walk-lessons.mjs` hard-codes the BD base URL `/Ghid_Studii_AI/y2s1/bd` and `src/content/bd/courses`; `tests/content/bd-content.test.js` reads only `src/content/bd`. Neither runs on ML until it is generalised. ML design section 10 item 2 says "the walk-lessons check passes on every ML screen" but names no task that parameterises it. This is gap G0 below.

## Summary table

| # | Class | Evidence count | Existing check | ML design covers it |
|---|---|---|---|---|
| 1 | Screen asks about or cites data that is not on it | 59 questions (Alex's audit), about 136 questions fixed in f0202c5, 16+ lesson commits | partly (mcq/reflect rule) | no |
| 2 | Term, syntax or tool used before it is taught; answer given away by title or earlier screen | 17+ commits | none | no |
| 3 | Content repeats across screens and lessons | Alex's quote only; no BD commit fixes it | official-exercise count only | yes, as a plan (10.3), no script yet |
| 4 | Wrong or unverified answers and facts | 45 pre-push fix commits, 11 post-push | Oracle freeze + engine tests (SQL only) | yes (10.1) |
| 5 | Layout breaks on a phone, text cut or swallowed | 14 commits | walk (overflow, Run tap) | partly |
| 6 | Scroll, tap and navigation | 8 commits | walk waits for scroll; no jolt check | partly |
| 7 | Widget caption says what the widget does not draw | 9 commits | `viz-captions.test.js` (BD logic only) | no |
| 8 | Wording, language, EN/RO mismatch | 7 commits + 2 sweeps | `text-sweep.mjs` | partly (10.5) |
| 9 | Pedagogy labels and chrome in learner text | R14, R23, cd5c4ae | `text-sweep.mjs` | yes |
| 10 | Correct answers bunched on one option | 490b2f7 (14 files) and 6 earlier OOP/prob-stat/ALO fixes | `audit-quiz-bias.mjs`, not in validate | no |
| 11 | Exercise text and the checker disagree | 20188a0 (10 items), 4ec035e, 1f487ab, 6fe14a8 | named-mistakes + natural-answer tests (SQL only) | no |
| 12 | Progress and gating state lost or corrupted | 6 commits | store/player tests | no |
| 13 | Math or code markup silently broken | e809255, 6fe14a8 | none | no |
| 14 | Process: built before reading the project | recon section 4, 11 rows | none (docs only) | partly |
| 15 | Process: pushed or edited the live site directly | D-010, D-028, DEVLOG 110 | none | yes (rule, no hook) |
| 16 | Process: defects found by Alex, not by the checks | all of the above | walk, tests | partly |

---

## 1. Screen asks about or cites data that is not on it

**Description.** A question, caption, explanation or answer names a table, column, row or value the learner cannot see on that screen. The widget can also show the wrong rows (L1 showed 6 grades of student 111 for a question about course 24, and highlighted a 7 while the text talked about a 9).

**Evidence.**
- Alex, 2026-10-25: BD L1 asked about "foaia cu studenții", `note`, `studenti` with no table on screen. The audit found 59 questions breaking the rule (memory feedback_show_the_data).
- a98257a (L1 both sheets, table-map follows tapped row), f0202c5 ("about 136 questions across the lessons got the rows and columns they ask about"), 2bffb0c, 27c287c, 18bbdd3 ("show the rows they discuss").
- Per-lesson: a8cf275 (D3), 87e506c (L18), ee43913 (L19), a729b09 (L20), fa67bfb (L21), 17be34e (L22), 7cd3c8c (L23), 1f487ab (L24), 4ec035e (L25), 9ebe6c6 (L12), 6fd420c (L13), 07419a8 (L14), 6398d3c (L5).
- Citations of unseen values: 49b9145 (L7 explanation cites matricol 116 that the result does not show), 17be34e ("118" in traps with no source on screen), 701b442 (explanations name what the lesson rows cannot tell apart), b85fe4b (L1 asks about a grupa column never shown).

**Existing check.** `tests/content/bd-content.test.js`, "questions show the data they ask about" (mcq or reflect that names a lab table or column must carry a `table`), and "question tables run" (every `table` runs on the engine, returns 1-45 rows). This stops class 1 only for mcq/reflect naming a table or column. It does not cover captions, explanations, answers, query-machine text, exercise prompts, or values (a number or a name) cited without a table.

**ML prevention.**
- *Proposed script* `scripts/ml/screen-data-check.mjs`, run in `tests/content/ml-content.test.js`. For every screen it collects (a) the tables, figures and given numbers visible on that screen (blocks with `table`, `data`, worked-step values) and (b) every number, name or variable cited in questions, options, explanations and captions of that screen. It fails if a cited value is neither visible on the same screen nor produced by the recompute script of ML design 10.1 from visible data. Cited values the screen derives (an entropy computed from the shown counts) must be in a `derivedFrom` list that the recompute script verifies.
- Rule for the builder: any exercise that says "the table above", "the data" or a dataset name must have that dataset as a block on the same screen, not on a previous one. ID3/Bayes lessons embed the dataset per screen.
- Reviewer step: the screenshot of every step (the walk already takes one per screen per width) is read against the JSON, as Alex's memory requires ("through screenshots of every step, not only the JSON").

## 2. Term, syntax or tool used before it is taught; answer given away

**Description.** A screen uses a word, operator or function that no earlier screen defined (so the learner cannot follow), or a title/pretest answer/earlier screen already states what the next screen asks.

**Evidence (at least 17 commits for the first part).** 61b7ad1 (D1 NOT NULL and DROP TABLE used without INSERT/ROLLBACK), e775891 (D2 INSERT without column list, UPDATE SET, AND, COUNT(*)), 0c9f146 (L2 alias before its trap), 52c9c9a (L10 DUAL, MOD before the sign rule), a671e60 (L11 two-argument SUBSTR needed by the exercise), 6fd420c and a70a8ea (L13/L15 TO_DATE and the 26 August clock), 07419a8 (L14 RR rule), c8fdf0c (L16 reveal used GROUP BY, "not in the course"), 66b925e (L17 number masks), 87e506c (L18 aliases), ee43913 (L19 NATURAL JOIN defined after traps), a729b09 (L20 LEFT/RIGHT/FULL after the traps using them), b01be72 (L25 ROWNUM named in a trap, "no lesson ever shows it"), fa67bfb (L21 grid shown before the columns it pairs on), 6398d3c and 517802b (L3/L5 WHERE used before L4).
Answer given away: a8cf275 (D3 count "the upper-case listing gave away"), 61b7ad1 (s11 title names the answer), b85fe4b (s7 title names the answer), f74f6df (L6 option word gives the answer), 20188a0 item 48 (pretest answers of L9, L10, L21, L23, L25 carried the result the next predict asks for), 68df4f0, a729b09 (a trap that "answered the why-the-key question word for word").

**Existing check.** None. The query-machine "ask" rule in `bd-content.test.js` only checks that `ask` exists only for a predicted stage and that a predicted stage's `say` asks nothing.

**ML prevention.**
- *Proposed script* `scripts/ml/concept-order-check.mjs`. Each ML screen declares `introduces: [concept ids]` and `uses: [concept ids]` in the lesson JSON (concept ids from one glossary file, e.g. entropy, conditional-entropy, information-gain, MAP, add-one). It fails when a screen `uses` a concept that is not introduced on an earlier screen of the same lesson or an earlier lesson (so ID3 cannot use information gain before it is defined). The same table feeds class 3.
- *Proposed script* check: for each screen, normalised title and pretest/question-stem text must not contain the screen's own answer string (numbers and the correct option's key words), and an earlier screen's explanation must not contain a later predict step's answer.
- Rule for the builder: a trap or exercise may only use notation (log base, `H(Y|X)`, `P(A|B)` reading) that the lesson or a linked earlier lesson has defined; the linked lesson is named ("vezi Lecția N").

## 3. Content repeats across screens and lessons

**Description.** Same topic, example, table or exercise appears in several places, including in other topics.

**Evidence.** Alex's verbatim quote (above). The git history of 3086670..3e85045 has no commit that removes a repeated topic, so the quote is the only direct evidence of the BD defect. Related facts in the sources: R19 (module 4's revisit share 26%, spaced revisits repeat items by design) and R20 (review schedule re-asks each miss up to three times); the BD review pile re-asks lesson items in the review tab. The coverage script counts only the 47 official lab exercises.

**Existing check.** `scripts/sql/coverage.mjs` (+ test "official exercises") fails when one of the 47 official lab exercises is missing or appears twice. It does not look at topics, examples, tables or non-official questions. BD-only.

**ML design.** Anti-goal "Repetition" in section 3 (explanation, example, table, exercise in two lessons; a screen restating an earlier screen; review questions that are the same question again) and verification item 10.3 ("a script lists concepts, examples, data tables and exercise numbers per lesson and fails on any that appears in two lessons"). Not built yet and not specified enough to build.

**ML prevention.**
- *Proposed script* `scripts/ml/repetition-check.mjs`, in `ml-content.test.js`. Fingerprints: (a) concept id from `introduces` (class 2): each id introduced once in the whole subject; (b) data tables: sorted normalised rows of each embedded dataset; (c) exercise ids (ex-book numbers) and the normalised text of their prompts; (d) worked-example numbers (the sequence of numeric values of a worked step); (e) explanation text: normalised sentence shingles, fails above a similarity threshold between screens of different lessons and between screens of the same lesson. Fails when any fingerprint appears in two lessons; the allowed exception is a screen of kind `backlink` with one line.
- Review pile rule (not automatable by fingerprint alone): a review item must be a variant (different numbers or different dataset) of a lesson item, never the same prompt; the check in (c) runs over review items against the lesson items they point at and requires a different prompt fingerprint. The 3-4 times repetition Alex describes cannot appear in the review tab.
- Test the check: a deliberately duplicated fixture must fail it.

## 4. Wrong or unverified answers and facts

**Description.** An answer, expected result, explanation figure, or claim about the system was wrong or unchecked.

**Evidence.** 45 `fix(bd|sql|test)` commits before the push, 11 of them `fix(sql)` (engine fidelity: 8f0de0c, f81b8b7, 782e6b9, 0160a13, aae8b82, 0625a24, 2d61cd0, 5663c2a). Post-push: faefa24 (CAST text, `+ - ||` precedence, error codes), a5b44b1, 11fb19d (accepted TRIM names, ordered grading), 0b09f3d (a cut-off result told the learner expected rows were missing), 1f487ab (lab 4 ex 14 re-frozen: 17 rows, 18 hidden), 4ec035e ("0 rows, not 42"), plus many messages ending "checked on Oracle" (b85fe4b, 6398d3c, 517802b, 9ebe6c6, 66b925e, 6fd420c). Rulings R11, R24 (clock line misstated Oracle's display). Alex, 2026-10-26: "it says here nr_matricol is char(6) yet all the instances of it in a table i see are only up to 3 characters" (DEVLOG:112; the outcome is not in the sources I read).

**Existing check.** Oracle freeze (`scripts/sql/freeze-expected.mjs`, `snapshot-oracle.mjs`, `tests/sql/differential.test.js`, `expected.test.js`), `tests/sql/widgets-engine.test.js` (53 widget queries equal the widget's pure-logic value). These depend on a real Oracle container and SQL; they do not transfer to ML.

**ML design.** 10.1: every number the learner sees equals a script recomputation; every "book has no answer" solution matches two independent computations. D-049 for convention-dependent answers. Covered, but not yet a script.

**ML prevention.**
- *Proposed* `scripts/ml/recompute.mjs` plus a numeric test that recomputes every answer, every worked-step value, tolerance and quiz value from the exercise data embedded in the JSON (ML design section 8 already lists this test); the recompute covers explanation text too: any number in a `say`/`explain`/caption string must appear in the recompute output or in the visible data (shares the extraction of class 1).
- A shown datum must also match its declared schema (the char(6) lesson): each embedded table declares column types and value ranges, and the check fails when the text states a size or domain that the data contradicts or vice versa. Wherever a book value differs from the computed one, the screen carries the correction note (ML design section 3).

## 5. Layout breaks on a phone, text cut or swallowed

**Description.** Text is cut, wraps inside a word, runs off the screen, or markup swallows characters.

**Evidence (14 commits).** e809255 (code cut at about 36 characters on a phone), 2306348 (narrow table runs off), 2bffb0c (header widens the column, 4 date columns at 390 px), 27c287c (long computed header pushes columns off), 5e73e91 (nine dots wrap), b3115af ("< 7" header), 701b442 (schema list and DESCRIBE do not fit a phone line), 8f5529c (L17 padding wrapped inside a string, wrong "încă 5 rânduri mai jos" counts), 6fe14a8 (`<prenume>`, `<grupa>`, `<x>` read as HTML tags and vanished from 8 places), e113964 (a "?" box on the output line), 18bbdd3 (phone dots), ce87194 (tables), d0eee9b (typing after a result tripped React's update limit).

**Existing check.** `walk-lessons.mjs`: per screen at 390 and 1280, no console error, no page error, no horizontal overflow, not blank, Continue unlocks, screenshots saved. `tests/lesson/tables-layout.test.js`, `text-render.test.js`.

**Not caught by it:** text cut inside a box that scrolls, text swallowed as HTML, wrong "N more rows" counts, wrapped-inside-a-word. ML design section 3 sets "touch targets ≥ 44 px" and 375/390 px but section 10 has no check for them.

**ML prevention.**
- Generalise the walk to a `--subject` parameter (G0) and add *proposed* assertions per screen: (a) every interactive element at 390 px has a bounding box of at least 44x44 px; (b) no element has `scrollWidth > clientWidth` unless it is a declared scroll container with a visible "scroll" cue; (c) the rendered `textContent` of each block contains every `<...>` placeholder written in the JSON (catches 6fe14a8); (d) a long formula or code line is never clipped (formula elements fit the 390 px content box or sit in a scroll container).
- Rule for the builder: a data table wider than 390 px declares its wrap mode; no hand-set widths.

## 6. Scroll, tap and navigation

**Description.** A tap lands on the wrong control, the page jumps, a hidden control takes taps.

**Evidence.** 0735c17 (Alex 2026-10-25: scroll jolt of 224 px and a white band in dark mode when the next screen is shorter; recon section 4 notes this is against the memory feedback_no_layout_jumps), 87469a1 and af172e2 (the sticky footer let taps through to a hidden "Arată soluția"; R41), 3e85045 (walk clicked during the smooth scroll), 1ea4b6d (options moved while tables swapped, caught on L18, L23, L25), 0b09f3d (focused control hidden behind the tab bar), R42 (a 1 px sliver counted as a tap target), 5e73e91.

**Existing check.** `walk-lessons.mjs` hit-tests Run at landing scroll and at max scroll, waits for the page to stop scrolling before clicking (3e85045). Nothing asserts the jolt or the dark-mode background.

**ML prevention.**
- Reuse the BD player, which already contains these fixes. Do not fork the footer or stage code.
- *Proposed* walk assertions: after Next into a shorter screen from a scrolled position, the change in `document.documentElement.scrollHeight` while the stage animates must not move the current content by more than a few pixels (record scrollY and the first block's top over the transition); the computed background at `html` and `body` must equal the theme token in dark mode (no white band); the last interactive element of every screen must be tappable (hit-test at max scroll, as the walk already does for Run) in each of the 5 palettes at 390 px.
- Rule: the visual gate (ML design section 4) runs light and dark at 390.

## 7. Widget caption or count says what the widget does not draw

**Description.** The caption, legend or counter disagrees with the state drawn at that step.

**Evidence (9 commits).** 021ddd2 (row insert called studenti empty), 27c287c (what a tick means), ce8cc42 (LIKE/IN/set captions; UNION claimed a sorted result), f74d45f (number line, date mask, age, type pipes, DECODE), 18bbdd3 (no wires on the first step, counts), 368db72 (type-pipes target shown before the pipe ran; SOME cell), 8f5529c (row cues with stale counts: "încă 40" under a 42-row join showing 12), 7bda055 and d8fb840 (pre-push widget-kit review), 660c385.

**Existing check.** `tests/lesson/viz-captions.test.js`, `viz-widgets.test.js` (BD widget logic modules), `widgets-engine.test.js` (value equality with the engine). BD-only; ML widgets are different.

**ML prevention.**
- Rule for every ML widget (entropy bars, information-gain tree, Bayes counts, probability tree): a pure `logic/<widget>.js` module returns, per step, `{state, caption, counts}`; a test asserts that each number in the caption equals the matching number in `state` and in the recompute script (class 4), and that no caption mentions an element absent from `state`.
- Every widget declares per step what is hidden until the prediction is made; the test asserts the revealed value is absent from the caption before the prediction (class 2).

## 8. Wording, language, EN/RO mismatch

**Description.** Unnatural Romanian, grammar of counts, English and Romanian saying different things, English words left in Romanian text.

**Evidence.** 8995b1e (natural Romanian, three lessons), bf88fe8 (L4/L6/L8 captions), 49b9145 ("toate", not "toți"), e03887b (RO "ultima zi a lunii" vs EN "their month": the two sides disagreed), 1ea4b6d ("1 rând, 42 de rânduri"), f74d45f (decimal point vs comma), cd5c4ae (the sweep missed "fază", "The/Show", a bare "Încearcă singur", a literal glued to TO_CHAR), 701b442 (starter comments in Romanian only).

**Existing check.** `scripts/sql/text-sweep.mjs` (pedagogy labels, English words in Romanian, specific patterns) and its tests in `bd-content.test.js`. It is BD-specific in path and in its SQL rule 4.1.12. It does not check EN/RO agreement or naturalness.

**ML design.** 10.5 (no labels, no English in Romanian text, Ciortuz's terms used).

**ML prevention.**
- Parametrise `text-sweep.mjs` by directory (G0) and add the *proposed* rule: the ML glossary (Ciortuz's terms, e.g. "Bayes Comun", "Bayes Optimal", "entropie condițională medie") is a list of required and forbidden term pairs per language; a string using a forbidden synonym fails.
- *Proposed* parity script: for every bilingual string, the multiset of numbers, variable names, formulas and code tokens in `ro` must equal that in `en`; a number-word count must use the shared Romanian plural helper (`words.js` `roCount`), never string concatenation.
- Rule: naturalness of Romanian prose cannot be automated; a reviewer (Opus) reads every Romanian string against a fixed checklist (reads like a lecture note, count grammar, diacritics, no calque) before the push. This is a human/agent step, not a script.

## 9. Pedagogy labels and chrome in learner text

**Description.** Phase names, study citations, "what this part does" labels on screen.

**Evidence.** R14 (phase-name step titles "Regula", "Scrie singur:" ruled spec violations), R23 (block chrome labels hidden), cd5c4ae, Alex's mockup feedback 2026-10-24 ("remove the indicators saying what each part is doing").

**Existing check.** `text-sweep.mjs` rule 1; `bd-content.test.js` "finds nothing in the lessons or the mock test" and negative cases. ML design anti-goals and 10.5 cover it. Covered once the sweep is parametrised (G0).

## 10. Correct answers bunched on one option

**Description.** The correct mcq option sits on the same position too often.

**Evidence.** 490b2f7: 14 BD lesson files rebalanced (L16 and L20 had 3 of 5 on B); course total then A 47, B 51, C 50 of 148. The same defect was fixed before in other subjects: 0586493 and b6dffd3 (OOP), 8510c5b (rebalance), 35b5edd (prob-stat duplicate-correct flags). It recurred because the audit stayed out of the gate.

**Existing check.** `scripts/audit-quiz-bias.mjs` (takes a folder, "stays out of validate", per its commit message) and `scripts/audit-quiz-integrity.mjs`. `scripts/validate-all.mjs` references only `lint-site.mjs`, and that one is advisory. Not enforced.

**ML prevention.** Add `tests/content/ml-content.test.js` assertions that call the same logic: in each lesson with 4 or more mcq no position holds more than half of the correct answers; no mcq has two correct options in single-select; no duplicate distractors; every option has an explanation (`scripts/trap-audit.mjs` intent). Make the audit a test, not a script that someone has to remember.

## 11. Exercise text and the checker disagree

**Description.** The prompt does not say what the grader needs (format, case, clock, which column), or hints/answers do not match the checker.

**Evidence.** 20188a0 (ten items: capitalisation of day names, trailing blanks, mock title, year as 2 not '2', "three boxes", ROUND skipping a year, a diacritic, "show only this column", pretest answers, starters), 6fe14a8, 4ec035e, 1f487ab (lab 4 ex 14 now grades the "+"), a70a8ea and c8fdf0c (the clock of the exercise), 3b2770f (named mistakes follow each exercise's hint), 11fb19d, R43.

**Existing check.** `tests/lesson/mock-natural.test.js` (the natural answer to a mock problem is graded correct on both datasets), `tests/sql/named-mistakes.test.js` + `scripts/sql/wrong-answers.mjs` (a named wrong answer per exercise is not graded correct; the walk types it). SQL-only.

**ML prevention.**
- Each ML numeric exercise declares `answerSpec`: unit, rounding or decimals, log base, tolerance, accepted forms (fraction, decimal, comma or point), and `acceptedAlternatives` with a note (D-049). *Proposed* test: the prompt text must contain the unit, the log base and the rounding the spec requires; every accepted form is graded correct; a declared named wrong answer per exercise (the classic mistake from the hint, e.g. natural log instead of log2, forgetting to normalise) is graded wrong; the walk types both.
- A walk screen that types the correct answer and one named wrong answer into every ML calculation field is the ML counterpart of the BD wrong-answer step (ML design 10.4 lists "every calculation exercise grades right and wrong answers" as a manual item; make it the walk).

## 12. Progress and gating state lost or corrupted

**Description.** Reload, a second tab, or a failed load changes what the learner sees or unlocks.

**Evidence.** 1198c14 (two open tabs overwrote each other's progress; review due at local midnight), 368db72 (a revealed prediction forgotten after reload), 776f4b6 and 43a34ed (first runs not recorded, so the gate relocked), 9bdcb72, 0e6729a (mock hand-in), d529758 (slow download failed the engine; no retry), 44d82ba (stale data directory cache), R21, R26, R41.

**Existing check.** `tests/lesson/store.test.js`, `player.test.js`, `final-fix-player.test.js`, `clientLock.test.js`. The walk's description lists no reload step. The engine items do not apply to ML (no SQL engine).

**ML prevention.** *Proposed* walk step: on every gating screen (mcq, reflect, numeric exercise, predict), answer, reload the page, and assert the screen shows the stored state and the gate stays open; open two tabs and assert progress is the union. Because ML reuses the player and store, the storage key is per subject (recon section 4: the Review badge is not filtered by subject in BD; a task must fix or flag it and Alex decides).

## 13. Math or code markup silently broken

**Description.** The renderer changes or drops what the text means: dollar runs read as math, tags swallowed.

**Evidence.** e809255 (`$$$$$$$450` and shell `$1` read as math; `$var` code spans in OS strings were broken; fixed after rendering every string of every subject with old and new `formatMarkdown`), 6fe14a8 (placeholders swallowed as HTML), 2bffb0c (spaces collapsed in values).

**Existing check.** `tests/lesson/text-render.test.js` (BD cases). `formatMarkdown.js` and `EquationBlock.jsx` call KaTeX with `throwOnError: false`, so a malformed formula renders red text or nothing instead of failing. I found no test that fails on a KaTeX error (grep of src, tests, scripts for `katex-error` returned nothing).

**Why it matters for ML.** ML lessons are formula-heavy (entropy, conditional probability, Bayes), so this is the likely place for the same defect.

**ML prevention.** *Proposed* test in `ml-content.test.js`: pass every string and every `equation` block of the ML content through `formatMarkdown` and KaTeX with `throwOnError: true` (or assert no `.katex-error` in the output); assert no unrendered `$` remains in the rendered text; assert every `\log_2` style formula renders. Run the old-vs-new comparison of e809255 on all existing subjects whenever `formatMarkdown` is changed for ML.

## 14. Process: built before reading the project

**Description.** The BD builder did not read the study guide's own wiki, skills, memory or existing blocks before designing, and Alex had to point it out.

**Evidence.** Alex: "you started making it without looking at any of the systems or info within the study guide project" (DEVLOG 2026-10-28). Recon section 4 (11 rows): first look went to the wrong directory; three teaching-method mockups offered when the wiki had decided the method (Alex 2026-10-24T15:53 and 15:54 UTC); the study-guide memory never opened; SPEC-BD said to reuse QuizBlock and ThinkBlock but new `mcq` and `reflect` blocks were built (0 quiz or think blocks, 148 mcq and 59 reflect in the lessons); a second store `bdLessonState.v1`; mostly hard-coded hex colours in two sets for all 5 palettes with no contrast check; `/review-site` never run; CLAUDE.md not updated as the spec required; BD-only code hard-coded in shared places. Related memories: feedback_mockups_end_user_view (mockups with tags, crammed, never opened in a browser; Alex 2026-10-24), feedback_download_dont_screenshot (read a PDF slide by slide through screenshots; Alex 2026-10-24).

**Existing check.** None automatic. The recon doc (written for ML) lists the binding rules.

**ML design.** Section 5 and 8 say "same lesson player as BD", reuse blocks; anti-goal "Hard-coded colours" exists but section 10 has no automatic check for colours or contrast; CLAUDE.md update is in section 8 but not in 10.

**ML prevention.**
- *Proposed* hex-literal check: grep the ML content and the ML-only CSS for colour literals (`#xxxxxx`, `rgb(`) outside the token definitions; fail on any. Plus a contrast check per palette and mode (5 palettes x light/dark) for the tokens ML uses (a script computing WCAG ratios from the theme token values).
- *Proposed* reuse check: a test that the ML lessons contain only block types in the registry, and a list of "new block types" that must each have a one-line written reason in the design doc (so a fork needs a veto-able reason).
- Pre-build gate (rule): the builder's first plan task cites the files read, with paths: study guide `CLAUDE.md` (BD copy), the wiki pages Learning Rhythm and Pedagogy Playbook, the study-guide memory folder, `docs/2026-10-28-recon-study-guide-systems-for-ml.md`. A plan whose first task lacks this fails review.
- Rule: no method or design choice is offered to Alex when the wiki already decided it; mockups: one per page, end-user view only, opened in a browser first. PDFs are downloaded and extracted as text.
- A task "update `CLAUDE.md`" is a checklist item in the final verification (add to section 10).

## 15. Process: pushed or edited the live site directly

**Description.** Fixes went to main (which deploys the public Pages site classmates use) as each batch passed the checks; Alex said "don't just edit the site straight up".

**Evidence.** D-010 ("you can push." as a one-time grant for BD), D-028 (follow-up batches go to main and the live site as each passes the checks, Alex can say hold), DEVLOG:110 (2026-10-26, Alex: "don't just edit the site straight up if that's what you're doing"), the 52 post-push commits made while Alex studied from the live site (D-028 why: "Alex is studying from the live site tonight"). `deploy.yml` triggers on push to main with no pull-request trigger. What exactly was edited in the DEVLOG:110 session is not stated in the sources I read; the nearby prompt is the speedrun page request (D-032: a second private artifact page), so the complaint's object is unconfirmed.

**Existing check.** None. ML design section 4: "nothing goes to `main` without Alex's word for this build; work on branch `ml-lessons` in the worktree".

**ML prevention.** The rule is in the design but there is no hook. *Proposed* guard: a git pre-push hook or a check in the plan's last task that refuses a push of `ml-lessons` to `origin main` unless an environment variable holding Alex's typed word for this push is set; and the plan has no task that pushes. For any change to existing live subject code (player, formatMarkdown, store) used by ML, test on the branch and show Alex before it reaches main, because it changes BD pages for classmates too.

## 16. Process: defects found by Alex, not by the checks

**Description.** The build was declared done and pushed; the learner then found the defects by using it, and a full second audit followed.

**Evidence.** The push 3086670 was followed by 52 non-merge commits including a numbered "screen-audit" (commit messages cite items 3, 7, 9, 10, 12, 19-22, 26-31, 35-52, 56-71) and four audit lanes; D-027 records a "second full screen audit of the live site". Alex found the missing tables (class 1) and the scroll jolt (class 6) himself on 2026-10-25 within hours of the push. Memory feedback_verify_ui_with_playwright: error-free consoles proved nothing, state and pixels must be read.

**Existing check.** `walk-lessons.mjs` + screenshots + `smoke-test.mjs`. The screenshots are not read automatically.

**ML design.** 10.4 (live check at desktop and 390 px, `/review-site` loop until clean) and 10.2.

**ML prevention (rule).** Before any push request: (1) run the walk on every ML screen at both widths in light and dark; (2) an Opus agent reads each screenshot against the screen's JSON with the checklist from classes 1, 2, 5, 7 (is every cited value visible, is every term taught, is any text cut, does the caption match the widget); (3) a skeptic Opus agent verifies each finding (D-027 shape); (4) only then Alex sees the site. The checklist is the artifact: this document's classes.

---

## Gaps: not covered by any existing check nor by the ML design

These matter most.

- **G0. Existing checks are BD-only.** The walk, the content test, text sweep, coverage and the viz tests hard-code BD paths and URL. ML design names the walk as a gate but no task parameterises it. Needed: `--subject` on the walk, text sweep and a shared content-test helper.
- **G1. Cited values not on screen** (class 1, beyond mcq/reflect naming a table). No check for captions, explanations, answers, query-machine text, values cited without a table.
- **G2. Term used before it is taught; answer given away** (class 2). 17+ commits fixed it, nothing detects it.
- **G3. Repetition** (class 3). In the ML design as a plan only; no fingerprint spec, no script, no rule for the review pile.
- **G4. Widget caption vs state** (class 7). No ML-side test pattern; the BD tests are widget-specific.
- **G5. EN/RO parity and Romanian count grammar** (class 8). The sweep catches labels and English words, not disagreement or naturalness.
- **G6. Quiz position bias in the gate** (class 10). The audit exists, is not in validate, and the defect recurred from OOP to BD.
- **G7. Exercise prompt vs grader** (class 11) for numeric answers (units, log base, rounding, accepted forms).
- **G8. Math rendering errors** (class 13). KaTeX runs with `throwOnError: false` and nothing fails on an error; ML is formula-heavy.
- **G9. Colour literals, contrast per palette, touch targets 44 px, element-level overflow** (classes 5 and 14). Named in ML anti-goals; no check in section 10.
- **G10. Jolt and dark-mode background on screen change; reload and two-tab state** (classes 6 and 12). The walk does neither.
- **G11. Live-site push guard** (class 15). A rule only; no hook.
- **G12. Pre-build reading of the project's own systems** (class 14). A rule in the recon doc; no gate in the plan.

## Covered already (summary)

- Official lab exercises appear exactly once: `coverage.mjs` (BD only; ML design 10.3 plans the generalisation).
- Pedagogy labels and English in Romanian text: `text-sweep.mjs` (BD only until parametrised).
- Per-screen console, page error, horizontal overflow, blank screen, Continue unlock, Run tap: `walk-lessons.mjs` (BD only).
- Mcq/reflect naming a table must show a table: `bd-content.test.js`.
- Frozen SQL answers and widget values on the real engine: Oracle scripts and `widgets-engine.test.js` (SQL only).
- Recomputed numbers, convention notes, live check at 390 px, `/review-site`: in the ML design but not yet scripts.
