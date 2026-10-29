**What:** Design for the Învățare automată (ML) lessons in Ghid_Studii_AI: weeks 1–5 of Ciortuz's course for the test on Friday 2026-10-30, on the BD lesson player, with hand-calculation exercises, ML visuals and a T1 mock test · **When:** 2026-10-28 · **Status:** active (draft, waiting for Alex's approval)

# ML lessons: design

## 1. Why this exists

Alex (UAIC FII, BSc AI, year 2, IA22) has an **ML test on Friday 2026-10-30** (his word; never doubt it). He hasn't studied for it yet and needs the site for it. His words: "just assume 0, even if i understand stuff i wanna repeat everythign and make sure that i know everything."

What he said about the BD lessons he used for Monday's L1: "they were kinda good, there was a lot of stuff that kept repeating like 3-4 times sometimes, like the topic or exercise would just be repeating even in other topics. but in general i think it was pretty good, but i just didn't have time to use it properly". Checked on the BD content: NULL is re-taught in 11 of the 26 BD lessons (about 37 steps), and the same students table is shown 29 times.

The study guide already settled the teaching method: the 5-phase Learning Rhythm (pretest → concrete → rule → why → retrieve; `wiki/concepts/Learning Rhythm.md`). This design does not reopen it. It removes the repetition Alex complained about.

## 2. Who uses it

- Alex, from zero, before Friday, on laptop and phone.
- Possibly his classmates (IA year 2) through the public link, if Alex lets it go live.
- Romanian is the learner language.

## 3. Goals, non-goals, anti-goals

**Goals**
1. A new subject **Învățare automată** (slug `ml`, semester `y2s1`) covering **weeks 1–5 of the 2026 course table** (`what-you-should-know.pdf` p.19, "Tabel centralizator"): probability and statistics foundations, information theory (entropy, conditional entropy, information gain, cross-entropy, KL), decision trees and ID3 (continuous attributes, overfitting, validation, CVLOO, pruning ideas, ID3 properties P0–P11), Bayes classifiers (MAP vs ML, Joint/"Bayes comun" vs Naive Bayes, Laplace add-one).
2. **Every exercise number in those table rows** (lecture, seminar and Seminarul Special columns) is placed in exactly one lesson, plus the topics the table doesn't cite but past tests ask (ID3 pseudocode ml3:9, overfitting definition ml3:26, CVLOO, NB smoothing and Bayes Optimal ml6:7–18).
3. **Each idea is taught once**, in the lesson where it belongs. A later lesson that needs it links back ("vezi Lecția N") and does not re-teach it.
4. Exercises are done **the way the test works**: by hand, with a calculator that has log. The learner types numbers; the site checks them.
5. **Visuals** for the parts that are easier to see than read (§6).
6. A **T1 mock test** built from the real past papers, with the barem.
7. Every number shown to the learner is **recomputed by a script** from the exercise data (§10).

**Non-goals**
- Weeks 6+ (AdaBoost, k-NN/IBL beyond what ID3 lessons need, SVM, clustering, EM, HMM).
- Lecture-only theory no test has asked: limit theorems and probability bounds (foundations:18–26), uncommon distributions (foundations:44–51), Occam/MDL, costs and missing values, Gibbs classifier. They get at most a one-screen "exists, not on the test" note.
- Programming the algorithms (implementation exercises) and running Python in the browser.
- Accounts, server sync, an LLM grader.

**Anti-goals (a failure even if it "works")**
- **Repetition:** the same explanation, example, table or exercise appearing in two lessons; a screen that restates what an earlier screen of the same lesson already said; review questions that are the same question again. (Alex's BD complaint.)
- Teaching something different from Ciortuz's 2026 material: his notation, terms and definitions win (e.g. "Bayes Comun/Optimal", choosing the minimum average conditional entropy as in seminar 3, his MAP/ML definitions).
- A wrong number. A typo in the book is shown corrected, with a note of what the book prints.
- Pedagogy labels in learner text ("Phase 2", study citations).
- Auto-playing animations. Advance is always manual, prediction first.
- Hard-coded colours. Only `var(--theme-*)` tokens, defined in all 5 palettes.
- A page that is slow, jumps or is broken on a phone (375/390 px, touch targets ≥ 44 px).

## 4. Constraints

- **Deadline:** Alex must be able to study from it before Friday 2026-10-30; the earlier the better. The whole scope ships together (no staged cut, no MVP).
- **Platform:** the same as BD: React 19, Vite, react-router BrowserRouter, `motion`, JSON content through `loadJson()`, `{en, ro}` strings everywhere (Romanian default), KaTeX through `formatMarkdown.js` (`$...$`). Inline formatting is limited to **bold**, `code` and $KaTeX$. No Romanian quotes „” in JSON.
- **Gates:** `npm run validate` → `npm test` → `npm run build` → `npm run smoke` (add `ml` under `y2s1` to `SUBJECTS` in `scripts/smoke-test.mjs`), the walk-lessons check, the visual gate and `/review-site`.
- **Public repo:** no course PDFs, slides or scans get committed. They live untracked in `src/content/ml/source`, `tests/source` and `refs/files` (local git exclude; Alex hasn't ruled on PDFs in the public repo). Lessons paraphrase; exercise statements may be quoted with their book number.
- **Push:** nothing goes to `main` (which deploys the public site) without Alex's word for this build. Work happens on branch `ml-lessons` in the worktree `~/Desktop/SO/os-study-guide-ml`.
- **Never commit** `.claude/settings.local.json` or `scripts/review-gemini-alo-c11.mjs`. `git add` named paths only.

## 5. Decided

**By Alex (his words in §1):**
- The test is Friday 2026-10-30.
- Start from zero and cover everything, even what he may already know.
- The BD lesson format was good; the repetition across topics was not.
- Collect all material (Piazza, FiiMaterials, student archives), label it and put it where it belongs: done, 790+ files in `src/content/ml/` (index `MATERIALS.md`, `materials.json`).

**By Claude (provisional, Alex can veto; logged in `/home/alexa/hub/decisions.jsonl`):**
- **Scope = weeks 1–5 of the 2026 table** (D-034), including week 5 (Bayes / Naive Bayes). Reason: no announcement gives the scope; Ignat's T1 (Thu 29 Oct) follows her week-5 Bayes seminar; past "T1/partea I" papers split both ways (2021 ends at ID3, 2020 includes Bayes), so covering more misses nothing.
- **Same lesson player as BD** (`player: 'lesson'`), same subject shell (`src/content/ml/index.js` modelled on `bd/index.js`), same tabs (Cursuri, Recapitulare, Teste). Reuse the player's existing blocks (`learn`, `definition`, `callout`, `equation`, `table`, `mcq`, `reflect`, `viz`) before adding any.
- **No cross-lesson repetition inside lessons.** BD put about 30% revisits of earlier lessons into each lesson's quiz; ML puts none there. Spaced review lives only in the Recapitulare tab, which the learner opens when they choose. Within a lesson, each screen adds something new; the retrieve quiz uses new numbers or a new situation, never the concrete example again.
- **Exercises the book leaves unsolved** (chapter 0: 0.89–0.103, 0.140–0.148; chapter 2: 2.27–2.31; chapter 4: 4.32–4.56 except 4.34, 4.36, 4.48 — these are most seminar exercises): solved by two independent computations (the readers' scripts and a second, separate script). Where they disagree, an Opus check decides from the book's own method. The solution screen says in one line that the book gives no answer and that this one was checked twice.
- **Book typos:** show the correct value and say what the book prints (e.g. 0.57: book 0.82715, correct 0.82740; 2.4: book 0.0336, correct 108/3125 = 0.03456).
- **Proofs:** Ciobanu's T1 asked for proofs from `demonstratii.2026f.pdf`. The proofs in weeks 1–5 scope get their own screens inside the lesson of the result they prove (step-by-step reveal, the learner predicts the next step).
- **English side:** real translations of every new string, written from the Romanian, as BD did.
- **Mock test:** T1-shaped (6 p, 100 min optional timer), built from the 2020–2021 T1 / partea I papers and the 2021-22 seminar tests, one problem per screen, paper mode (write on paper → Predă → see the solution and score yourself against the barem items).
- **Log calculator:** exercise screens that need logarithms offer a small calculator (log₂, ln, basic arithmetic), because the real test allows a calculator with log.
- **Build order (builder check, D-036):** the shared pieces first (calculation exercise, log calculator, ML viz widgets, subject shell, review filter), then the lessons one at a time in teaching order, each through its gates before the next starts, so Alex can study finished lessons while later ones are built. The scope stays whole; only the order is fixed.
- **Base (builder check, D-036):** branch `ml-lessons` starts from `origin/main` 3e85045, not from the unmerged BD branches `bd-lo-ui`, `bd-lo-mock`, `bd-lo-tooling` (merging those is Alex's call and they carry BD work he hasn't reviewed). ML content loads through `loadJson()` like everything else; the builder measures the main bundle before and after and records it.

## 6. What the learner sees

**Subject page.** "Învățare automată" under semester 3 (`y2s1`) next to "Baze de date". Tabs: Cursuri (the lessons), Recapitulare (review pile, filtered to ML), Teste (mock T1).

**A lesson, one screen at a time**, exactly as BD (Continue/Back, arrow keys, progress bar without phase names, screen in the URL, gating with "Sari peste"). The five phases per lesson:
1. *Pretest:* one question the learner can't answer yet, with its data on the same screen.
2. *Concrete:* a worked example with real numbers, built up step by step; the learner predicts each step before it is shown.
3. *Rule:* the definition/formula in Ciortuz's notation, 3–4 concepts per lesson at most.
4. *Why:* one causal question with a reveal.
5. *Retrieve:* 3–4 quiz items whose wrong options are named misconceptions (from the researched catalogue, `reports/seminar-and-errors.md`), each with an explanation; then the lesson's book exercises as **calculation exercises**.

**Calculation exercise (new block, e.g. `calc-exercise`).** The statement with its data (table, distribution, tree) on the same screen; one or more answer fields (number, fraction like `9/17`, or a choice such as "rădăcina = Outlook"); a tolerance per field (e.g. ±0.001 for entropies in bits; equivalent fractions accepted); verdict per field; hints that climb (what to compute → the formula with the numbers in → the full worked step); a full worked solution reveal in the book's method. Named-mistake detectors where a wrong value is predictable: IG reported where H(Y|X) was asked (the H vs IG direction), entropy above log₂ k, natural log instead of log₂, forgetting the weights in the average conditional entropy, Laplace denominators without the number of values, P(A|B) swapped with P(B|A).

**Visuals (viz widgets, manual advance, prediction first):**
- *Probability tree with natural frequencies* (out of 1000 people …) before Bayes' formula, as the wiki requires.
- *Joint distribution table* with marginals filling in, and an independence check cell by cell.
- *Entropy bar*: a class split [a+, b−] and its H, with the H(p) curve; the learner predicts which split has more entropy.
- *ID3 builder*: a training table; for each candidate attribute the learner predicts the best one, then sees the stumps, the weighted conditional entropies and the IG; the chosen node splits and the table partitions; repeat until leaves.
- *Threshold picker* for continuous attributes: sorted values, thresholds only where the label changes, IG per threshold.
- *Overfitting / CVLOO*: leave one row out at a time, the tree's prediction on it, the error counter.
- *Naive Bayes calculator*: counts → probabilities (with and without add-one) → the product per class → the decision; and the parameter count NB 2n+1 vs Joint 2^(n+1)−1.

**Recapitulare.** Wrong quiz answers, failed calculation exercises and third hints add items; each comes back as a variant with new numbers (generated from the same template and checked by the script), never as the identical question. The badge counts ML items only.

**Teste.** The mock T1 (§5) and, as a second test, the 2021 "Probabilități și statistică + ID3 (1)" paper as it was given.

## 7. Content

The full content map is `/home/alexa/hub/docs/2026-10-28-research-ml/reports/content-map.md` (topics in teaching order, concepts with Ciortuz's notation, the exercises per topic with book pages, past-test problem types, misconceptions with diagnostic questions, conflicts between sources), with the critique next to it and the seven source reports (`scope-and-rules`, `theory-slides`, `exbook-ch0`, `exbook-ch4`, `exbook-ch2-3`, `past-tests`, `seminar-and-errors`).

Before any JSON is written, a **content outline** (like BD's `2026-10-24-bd-lessons-content-outline.md`) is produced from the map: the lesson list, per lesson the concepts, the pretest, the worked example, the "why" question, the quiz items with named distractors, the exercises with their data and verified answers, and the visuals. It is checked for repetition (no concept, example or exercise in two lessons) before building.

The content outline is `ml-outline/2026-10-28-ml-lessons-content-outline.md` (allocation in `ml-outline/allocation.md`, critique in `ml-outline/outline-critique.md`). It replaces the provisional 14-lesson order with 24 lessons in dependency order (D-048), each with 2-4 headline concepts and every exercise part owned by exactly one lesson:

1. Spațiu de probabilitate, probabilitate condiționată, regula de înmulțire
2. Probabilitatea totală și formula lui Bayes
3. Independența evenimentelor și independența condiționată
4. Variabile aleatoare discrete; Bernoulli și binomială
5. Distribuții comune și marginale; independența variabilelor; covarianță
6. Independența condiționată a variabilelor
7. Entropia
8. Entropia condiționată și câștigul de informație
9. Compasul de decizie și alegerea rădăcinii
10. Rădăcina fără calculator
11. ID3 complet, de mână
12. Proprietăți ID3 (1): greedy, optimalitate, expresivitate, bias inductiv
13. Proprietăți ID3 (2): inconsistență, duplicate, adâncime
14. Atribute continue: praguri
15. Eroarea la antrenare, CVLOO, overfitting
16. Pruning
17. Raportul câștigului, alte criterii de impuritate
18. Estimarea parametrilor: verosimilitate maximă (MLE)
19. Ipoteze ML și MAP
20. Bayes Naiv și Bayes Comun; numărul de parametri
21. Probabilități zero și add-one (Laplace)
22. Bayes Naiv în practică: rata erorii, xor, atribute duplicate
23. Funcții convexe, Jensen, demonstrațiile despre entropie
24. Entropia încrucișată, Gibbs, divergența KL

Teste tab: the mock T1 (6 p, 100 min) and the 2021 T21P paper as given. Answers that depend on an unprinted convention state the book's rule and accept the alternative (D-049).

## 8. Fitting into the repo

- **Subject shell:** `src/content/ml/index.js` (from `bd/index.js:3-56`); append `'ml'` to the `y2s1` entry in `src/content/registry.js`. Course entry fields: id, title, shortTitle, sectionCount (= steps.length), metaId, src; `step.id` starts with `metaId-`.
- **Blocks:** register any new block type in `src/components/blocks/registry.js` **and** `scripts/validate-course-json.mjs` (unknown types pass validation silently otherwise). Every quiz option has `explanation{en,ro}`; `reviewStep` must be a valid step id; props are `code`, not `content`.
- **Viz widgets** go next to BD's in `src/components/lesson/viz/widgets/` and use the same kit (`viz/kit.js`).
- **Progress:** reuse the lesson store BD added (`src/lesson/useLessonStore`); no second store. The Recapitulare badge must filter by subject.
- **Tests:** `tests/content/ml-content.test.js` (structure) and a numeric test that recomputes every answer from the exercise data embedded in the JSON.
- **Docs:** update `CLAUDE.md` for the new subject and blocks.

## 9. Sources

Local, not committed: `src/content/ml/` in this worktree (`MATERIALS.md`, `materials.json`, text mirror `_text/`). Research: `/home/alexa/hub/docs/2026-10-28-research-ml/`. The study guide's own rules for this build: `/home/alexa/hub/docs/2026-10-28-recon-study-guide-systems-for-ml.md`.

## 10. Verification before calling it done

1. Every number the learner sees (answers, worked steps, tolerances, quiz values) equals a script recomputation from the data; every "book has no answer" solution matches two independent computations.
2. `npm run validate`, `npm test`, `npm run build`, `npm run smoke` pass with the `ml` routes walked; the walk-lessons check passes on every ML screen.
3. Repetition check: a script lists concepts, examples, data tables and exercise numbers per lesson and fails on any that appears in two lessons (allowed: a one-line back-link).
4. Opened live in a real Chrome at desktop width and at 390 px: every lesson advances, every calculation exercise grades right and wrong answers, every visual steps and predicts, reduced motion works, the mock test runs. `/review-site` loop until clean.
5. Learner-text sweep: no pedagogy labels, no English in Romanian text, Ciortuz's terms used.

## 11. Open questions for Alex

Asked one at a time after the builder check; answers go here.

- **Public or laptop?** Public. Alex, 2026-10-29: "my classmates also need this". Each lesson is pushed to `main` (the public site) on its own once it passes every check, in the priority order below (D-067, D-070).
- **Order.** The teacher's 2026-10-29 list of what the Friday test needs sets the priority: L1–L16, L18–L22, the two paper tests, then L17, L23, L24 (D-068). Items of that list the outline covered only partly are added to their owner lesson (D-069); the map is `ml-outline/2026-10-29-teacher-list-coverage.md`.
- **Published ids are frozen.** Once a lesson is public, its lesson, step and block ids never change: learners' progress is stored under them.
- **Clarity rewrite (2026-10-30, D-083).** Every lesson is rewritten to the plan's clarity standard and republished in order. Blocks that survive keep their ids; new blocks get new ids; a removed id is never reused for other content.

## 12. Left to the builder

- Component structure, the calculation block's exact JSON shape (validator-enforced), the log calculator's look.
- How variants with new numbers are generated, as long as the script checks them.
- Exact animation timings, within the theme tokens and reduced-motion rules.
- Wording beyond the outline, within §3's anti-goals.
