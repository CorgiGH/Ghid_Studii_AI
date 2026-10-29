**What:** Content outline for the ML lessons (weeks 1-5, Friday 2026-10-30 test): per-lesson concepts, screens, quiz items with named misconceptions, exercises with verified answers, visuals, mock T1 · **When:** 2026-10-28 · **Status:** active (draft, with the design)

# ML lessons: content outline (L1-L24, mock T1, T21P)

This is the four outline parts joined in lesson order: `ml-outline/outline-prob.md` (L1-L6), `outline-info.md` (L7-L8 and L23-L24), `outline-dt.md` (L9-L17) and `outline-bayes.md` (L18-L22 and the two tests). The text of the parts is unchanged here; only heading levels were aligned (each lesson is a `##` heading). The design is `../2026-10-28-ml-lessons-design.md`; the allocation every lesson follows is `ml-outline/allocation.json`; the critique, with every problem found and fixed, is `ml-outline/outline-critique.md`.

How to read it: each part's conventions come first (they differ in small ways: prob and bayes mark learner text with `>`, info with `RO:` blocks, DT with Romanian bullets; prob and bayes print decimals with a comma, info and DT with a point, as the book does). Then the 24 lessons in teaching order, then the two tests, then each part's notes and open problems. Learner text is Romanian; builder notes are English. The phase words (pretest, concrete, rule, why, retrieve) appear only in builder headings.

| Lesson | Title | Part |
|---|---|---|
| L1 (`ml-l01`) | Probabilitate: spațiu de probabilitate, probabilitate condiționată, regula de înmulțire | `outline-prob.md` |
| L2 (`ml-l02`) | Probabilitatea totală și formula lui Bayes | `outline-prob.md` |
| L3 (`ml-l03`) | Independența evenimentelor și independența condiționată | `outline-prob.md` |
| L4 (`ml-l04`) | Variabile aleatoare discrete: distribuție, medie, varianță; Bernoulli și binomială | `outline-prob.md` |
| L5 (`ml-l05`) | Distribuții comune, marginale, condiționate; independența variabilelor; covarianță | `outline-prob.md` |
| L6 (`ml-l06`) | Independența condiționată a variabilelor aleatoare | `outline-prob.md` |
| L7 (`ml-l07`) | Entropia | `outline-info.md` |
| L8 (`ml-l08`) | Entropia condiționată și câștigul de informație | `outline-info.md` |
| L9 (`ml-l09`) | Arbori de decizie: compasul de decizie și alegerea rădăcinii | `outline-dt.md` |
| L10 (`ml-l10`) | Rădăcina fără calculator: raționamente relaționale și formule de buzunar | `outline-dt.md` |
| L11 (`ml-l11`) | ID3 complet, de mână | `outline-dt.md` |
| L12 (`ml-l12`) | Proprietăți ID3 (1): căutare greedy, optimalitate, expresivitate, bias inductiv | `outline-dt.md` |
| L13 (`ml-l13`) | Proprietăți ID3 (2): date reale, inconsistență, duplicate, adâncime, completare | `outline-dt.md` |
| L14 (`ml-l14`) | Atribute continue: praguri și zone de decizie | `outline-dt.md` |
| L15 (`ml-l15`) | Eroarea la antrenare, validare, CVLOO; overfitting | `outline-dt.md` |
| L16 (`ml-l16`) | Pruning: IG sub prag, top-down față de bottom-up, testul $\chi^2$ | `outline-dt.md` |
| L17 (`ml-l17`) | Raportul câștigului, atribute cu multe valori, alte criterii de impuritate | `outline-dt.md` |
| L18 (`ml-l18`) | Estimarea parametrilor: verosimilitate maximă (MLE) | `outline-bayes.md` |
| L19 (`ml-l19`) | Ipoteze ML și MAP; Bayes pentru ipoteze | `outline-bayes.md` |
| L20 (`ml-l20`) | Bayes Naiv și Bayes Comun (Optimal); numărul de parametri | `outline-bayes.md` |
| L21 (`ml-l21`) | Probabilități zero și regula add-one (Laplace) | `outline-bayes.md` |
| L22 (`ml-l22`) | Bayes Naiv în practică: rata erorii, xor, atribute duplicate, New-Bayes | `outline-bayes.md` |
| L23 (`ml-l23`) | Funcții convexe, inegalitatea lui Jensen și demonstrațiile despre entropie | `outline-info.md` |
| L24 (`ml-l24`) | Entropia încrucișată, inegalitatea lui Gibbs, divergența Kullback-Leibler | `outline-info.md` |
| Mock T1, T21P | Teste tab (paper mode) | `outline-bayes.md` |

# Conventions of the four parts

## Part 1: probability and random variables (L1-L6)

### 0. How to read this file

Learner text is Romanian and sits in quote blocks (`>`); everything else is English notes for the builder. Quiz items are written in Romanian in full (stem, options, explanations). Where a proof step, a reveal or an exercise option is described here in English, the builder writes the learner string in Romanian with the terms this lesson's own learner text uses (aditivitate numărabilă, regula de înmulțire, regula de înlănțuire, evenimente incompatibile, probabilitate a priori / a posteriori, verosimilitate), never a fresh translation. Learner text uses only **bold**, `code` and $KaTeX$ inline, no Romanian quotes, no pedagogy labels. The words "pretest / concrete / rule / why / retrieve" appear only in these builder headings, never on a learner screen.

**Source tags.** `B:p` = exercise book `source/2026/ex-book/ex-book.24sept2026.pdf` (book page = PDF page). `FND:n` = `source/2026/slides/foundations.pdf` slide n. `Cn-sK:p` = `source/2026/seminar/ciobanu/notes-sK.pdf` page p. `WYSK:p` = `source/2026/admin/what-you-should-know.pdf`. `PS:n` = `ex-book-slides/ML.ex-book.SLIDES.ProbStat.pdf`. `T21P`, `T20a`, `T20b`, `T21S`, `T16` = past tests (`tests/source/...`). Learner-visible citations are shown as a small footnote line under a rule screen, e.g. "Cursul: slide 4. Culegerea: p. 23".

**Number tags** (builder: every tag except `[caiet]` must be recomputed by the numeric test from the data in the JSON; I computed all `[construit]` and `[calculat]` values with exact fractions in a throwaway script and every one agreed):
- `[caiet]` printed in the book's worked solution.
- `[seminar]` printed or given in a seminar note.
- `[calculat]` the book gives no answer; verified twice (reader + `verified-answers.md`). The solution screen says one line: "Culegerea nu dă răspunsul; verificat de două ori."
- `[construit]` my own example numbers (never a sourced claim). Each is flagged and recomputed.

**Answer fields** (for the calculation-exercise block): `num` decimal, `frac` equivalent fractions accepted plus decimals within the tolerance, `choice` / `tf` exact, `multi` set of letters. Default tolerance for a value below 1 given as a decimal: ±0.0005; for values above 1: ±0.001. Every field below lists `expected` and, when not default, `tol`. "Detector" = a predictable wrong value and the message shown for it.

**Proof exercises** are not graded by numbers. Shape for the builder (reuse `mcq` + `equation` reveal, or add one block `proof-steps`): `steps[{shown, predict:{question, options[{text, correct, explanation, misconception}]}}]`; the learner chooses the next step, the step is revealed, the next prediction appears. Wrong options are named misconceptions. Where a proof exercise has a numeric end-check it is listed as a field.

**Answer status** per exercise (allocation legend): book, verified-twice, ruled.

**Back-link rule.** A lesson that needs an earlier concept writes one line "vezi Lecția N" and never re-explains it.

**Worked-example data stays on screen** (added by the critic pass). A worked example that runs over several screens keeps its data (the table, the distribution, the tree, the counts) visible on every screen that asks about it, as a compact data panel above the question. A later screen never relies on "același tabel" or "din tabel" with the table out of view (rule: data on the same screen as the question). Showing the same data again inside one worked example is the example continuing, not a repeated table; it never travels to another lesson.

#### 0.1 Ownership ledger (no item in two lessons)

| Lesson | Teaches (once) | Data owned |
|---|---|---|
| L1 | probability space, axioms, properties from the definition, classical formula, set notation, conditional probability, multiplication and chain rule, conditional multiplication rule | f1-f4 on Ω={a,b,c} (Cn-s1:3); die and "even" (pretest payoff); soldiers 1/3 and 1/10 (Cn-s1:6); 0.1, 0.2, 0.3, 0.8 |
| L2 | partition, total probability, Bayes | screening 10 000 persons; 0.6, 0.7, 0.90, 0.94, 0.95 |
| L3 | independence of events (both forms), conditional independence of events (both forms), the two default assumptions | Cn-s1:7 (0.5, 0.2, 0.11); 0.89; 0.5 coin game |
| L4 | random variable, pmf, cdf, g(X), mean, variance, Bernoulli, binomial, categorical, indicator | three coins R; X in {-1,0,1}; X in {-1,0,1,2}; the two games; 0.24, 0.97 |
| L5 | joint, marginal, conditional distribution of variables; independence of variables; covariance, correlation, Var(X+Y) | Cn-s2:6 table; 0.11, 0.99, 0.100 tables; 0.13 lists |
| L6 | conditional independence of variables; what is needed to use it | noisy-witness example; 0.15, 0.16, 0.101, 0.102 data |

#### 0.2 Decisions I made (plumbing; Alex can veto; also see the end of the file)

1. The screening example uses 10 000 people, not 1000: 1000 people give 89.1 false positives (not a whole number). Same probabilities (1%, 90%, 9%).
2. The word "evidență" (for the denominator of Bayes) is not used on any screen: it appears in `Companion.pdf` only, not in Ciortuz's slides or book. The denominator is called "P(A) din formula probabilității totale".
3. "Dependent but conditionally independent" (and its example) belongs to L6 only. L3 teaches the definition of conditional independence of events with a plain numeric check and the proof 0.92, nothing more.
4. The Cn-s1:6 multiplication-rule example (1/3 and 1/10, answer 1/30) is not in `allocation.json` data tables; L1 uses it as its multiplication-rule example and no other lesson does.
5. The "two forms" of independence are named by their formulas ("forma cu produs", "forma cu probabilitate condiționată"), because the book and the seminar call them "tare/slabă" in opposite senses (conflict C-6).

## Part 2: information theory (L7, L8, L23, L24)

Cum se citește: textele pentru cursant sunt în română (blocurile `RO:`), notele pentru constructor sunt în engleză. În textul pentru cursant se folosesc doar **bold**, `code` și $KaTeX$, fără ghilimele românești. Fără etichete de pedagogie în textul pentru cursant (etichetele de mai jos, Pretest / Concret / Regula / De ce / Retrieve, sunt doar pentru constructor).

### 0. Builder conventions

**Lessons written here:** `ml-l07` Entropia, `ml-l08` Entropia condiționată și câștigul de informație, `ml-l23` Funcții convexe, Jensen, demonstrațiile despre entropie, `ml-l24` Entropia încrucișată, Gibbs, KL. Ownership is exactly `ml-outline/allocation.json` (checked against `exercise_index`). Nothing owned by another lesson is re-explained; earlier concepts appear only as a one-line "vezi Lecția N".

**Source aliases (path relative to `src/content/ml`, page = PDF page):**

| Alias | File |
|---|---|
| B | `source/2026/ex-book/ex-book.24sept2026.pdf` (exercise book, printed page = PDF page) |
| FND | `source/2026/slides/foundations.pdf` (slide = page) |
| ML3 | `source/2026/slides/ml3.pdf` |
| PS | `source/2026/ex-book-slides/ML.ex-book.SLIDES.ProbStat.pdf` |
| Cn-s3 | `source/2026/seminar/ciobanu/notes-s3.pdf` (seminar 3 notes, English) |
| IT | `source/2026/notes/information-theory.pdf` |
| DEM | `source/2026/notes/demonstratii.2026f.pdf` |
| WYSK | `source/2026/admin/what-you-should-know.pdf` |

**Exercise block schema used below** (the builder maps it to the `calc-exercise` block): statement with full data; answer fields `id = expected value, tolerance`; 3 climbing hints (what to compute, then the formula with the numbers in, then the full step); full solution in the book's method; named-mistake detectors `value -> explanation`; a one-line source note. Where the book prints no answer the solution screen says: "Culegerea nu dă răspunsul; verificat de două ori."

**Notation (Ciortuz):** `log` means base 2 everywhere in these four lessons (B:129 fn 121); convention $0\log 0=0$; $H(X)$, $H(Y|X=x)$ (entropie condiționată specifică), $H(Y|X)$ (entropie condiționată medie), $H(X,Y)$, $IG(X;Y)$ (the book writes both $IG(X,Y)$ and $IG(X;Y)$; the lessons use $IG(X;Y)$), $CH(p,q)$, $KL(p\|q)$, $H[a{+},b{-}]$ for a data set with a positives and b negatives.

**Rounding policy:** all numbers below are recomputed with `python3` (`log2`, exact fractions) in `/tmp/claude-1000/-home-alexa-hub/586cac55-e548-45e9-92fa-828bc679c474/scratchpad/w/n7.py`, `n8.py`, `n8b.py`, `n24.py` (scratch only; the builder's numeric test must recompute every value from the data embedded in the JSON). Values are shown with 4 decimals; where the book prints fewer decimals, the field tolerance covers the book's value.

**Worked-example data stays on screen** (added by the critic pass). A worked example that runs over several screens keeps its data (the table, the distribution, the tree, the counts) visible on every screen that asks about it, as a compact data panel above the question. A later screen never relies on "același tabel" or "din tabel" with the table out of view (rule: data on the same screen as the question). Showing the same data again inside one worked example is the example continuing, not a repeated table; it never travels to another lesson.

**Status labels used for exercises** (from `allocation.json`): book / slides / verified-twice / ruled. "derived" below means a number I computed that is not printed in the book or verified-answers.md; the builder's script must confirm it, and the screen says "calculat aici, nu din culegere".

### 0.1 Problems found while writing (details in the lessons)

1. `allocation.json` L23 worked example says "2 ≤ 5" for $f(x)=x^2$, weights (1/2,1/2), values 1 and 3. The correct values are $f(2)=4$ and $\tfrac12 f(1)+\tfrac12 f(3)=5$, so **4 ≤ 5**. This outline uses 4 ≤ 5.
2. Exercise 0.145 has a part (c) in the book (B:245, solved at PS:173) but `exercise_index` lists only 0.145.a and 0.145.b. I put 0.145.c in L23 with 0.145.b (no other lesson owns it). Confirm.
3. 0.142.e asks to verify $IG=KL(P_{Inj,Wea}\|P_{Inj}P_{Wea})$, and KL is L24's concept. In L8 the check is done with the explicit formula (B:241 eq. 147) and the screen does not name KL; Lecția 24 (R6) links back to this numeric check.
4. 0.148.b: the statement (B:246) says "for every i≠j, X_i is conditionally independent of X_j given Y" (pairwise), but the proof (PS:214) factorises $P(x|y)=\prod_i P(x_i|y)$, which needs **mutual** conditional independence (the exercise title says "mutual independente"). The lesson states the factorisation as the hypothesis used. Pairwise independence does not imply it (see the xor example in the Naive Bayes lessons, not re-taught here).
5. FND:39 says "(However, KL is upper-bounded.)". In general this is false: $KL(p\|q)=+\infty$ if $q(x)=0<p(x)$ (B:150 fn 138 says exactly this for CH). The lessons do **not** repeat that parenthesis.
6. Statuses in `allocation.json` that the book itself upgrades: 0.62 is marked "ruled/no key" but B:143-148 prints a full solution (steps a-i); 0.61 is marked "not verified" but B:141-142 prints the solutions of (a) and (b). I checked the three continuous-entropy formulas numerically (exponential λ=2: 0.4427 bits; Gamma r=3, α=2: 1.6655 bits; Gaussian σ=2: 3.0471 bits; numerical integration, matches the closed forms).
7. Hint-table sensitivity in 0.142: with the printed hint logarithms (log2 3 = 1.585, …) a student gets IG ≈ 0.0011 instead of 0.0008. The IG fields therefore accept 0.0008 ± 0.0005.
8. B:135 prints $H(C|T)=0.82715$ (0.57.c); correct 0.82740. B:133-134 rounds H(S|first die=4) to 2.58 and IG to 0.69 (exact 2.5850, 0.6894). Cn-s3:7 prints 0.9182 for $H[2{+},4{-}]$ (exact 0.91830, truncated).
9. 0.145.a asks for the meaning "într-o singură frază"; no source gives that sentence. The sentence in L23 is written by me and labelled as such.
10. Numbering: IT:2 and WYSK:4 call the KL results "ex. 0.63.a/b"; the 2026 book has KL at 0.65.a/b and cross-entropy at 0.63 (C-7). Lessons use the book's numbers.
11. Critic pass (2026-10-28, `outline-critique.md`): the L8 pretest and L8 retrieve item 1 were replaced (both asked the root choice of Lecția 9); the L7 forward pointer to Lecția 18 and the L8 forward pointer to Lecția 24 were removed from learner text (L24 R6 now links back to 0.142); L23 item 3 was replaced (it repeated the "De ce?" screen); L7 item 4, L8 item 3 and L24 item 3 got an explanation per wrong option.

## Part 3: decision trees (L9-L17)

How to read this file:
- Learner text is Romanian, notes for the builder are English. Learner text uses only **bold**, `code` and $KaTeX$, plain quotes, no pedagogy labels. The section names below (Pretest, Concret, ...) are for the builder; they never appear on screen.
- Lesson ids and numbers follow `allocation.json` (L9 = `ml-l09` ... L17 = `ml-l17`). Back-links are one-liners "vezi Lecția N"; nothing is re-explained.
- Book citations: `B:NNN` = `source/2026/ex-book/ex-book.24sept2026.pdf`, page NNN (book page = PDF page). Slides: `ML3:N`, `ML0:N` = `source/2026/slides/ml3.pdf`, `ml0.pdf`; `DTs:N` = `source/2026/ex-book-slides/ML.ex-book.SLIDES.DT.pdf`; `Cn-s3`, `Cn-s4` = `source/2026/seminar/ciobanu/notes-s3.pdf`, `notes-s4.pdf`; `WYSK` = `source/2026/admin/what-you-should-know.pdf`; tests as `tests/<folder>:page`.
- Every number was recomputed by script (fractions + log2, own ID3 with tie enumeration, `/tmp/.../scratchpad/dt/*.py`) in addition to the readers' scripts and `verified-answers.md`. Numbers that are not in the book or in `verified-answers.md` (quiz and pretest numbers I constructed) are listed in the last section, "Valori construite", with their recomputation, so the numeric test of the build can pin them.
- Status of a key: **book** (printed solution), **slides** (DT slides), **verified-twice** (readers + independent recomputation, book has no key), **ruled** (convention or argued, no key). Where the book has no key, the solution screen carries one line: "Culegerea nu dă răspunsul; verificat de două ori." (for ruled items: "Culegerea nu dă răspunsul; răspunsul depinde de convenția spusă mai sus.")

### 0. Conventions shared by L9 to L17

**Notation (Ciortuz).** Counts in a node: $[a{+},b{-}]$ ("a pozitive, b negative"); several classes $[a{+},b{-},c{*}]$. $H[a{+},b{-}]$ is the entropy of that node, $H(p)$ the Bernoulli entropy. Specific conditional entropy $H(Y|A=v)$, average conditional entropy $H(Y|A)=\sum_v P(A=v)\,H(Y|A=v)$ (the book writes $H(0/A)$ for node 0, the seminar $H_{0/A}$; in learner text write $H(Y|A)$ and say once that the book writes it per node). Information gain $IG(S,A)=H(S)-H(S|A)$ (ML3:13; defined in Lecția 8). Training error = wrongly labelled rows / all rows; accuracy = 1 - error.

**Stump = "compas de decizie"** (term used in `tests/2021-2022-partial1-ro/subiect.pdf:1`). Every ID3 root question is answered in the exam way: draw the stumps with $[a{+},b{-}]$ boxes, write $H(Y|A)$ in general form, substitute, pick the minimum (barem P21 splits the points exactly like this).

**Calculation exercise defaults** (design section 6). Entropies in bits, answer fields accept the value rounded or truncated to 4 decimals, default tolerance ±0.001; fractions accepted as exact fractions or decimals (±0.001). A choice field is "rădăcina = Outlook" style (select). Hints always climb: (1) what to compute, (2) the formula with the numbers in, (3) the full step. Every exercise gets the log calculator.

**Generic named-mistake detectors** (the checker compares a wrong answer to these and shows the explanation; exercise blocks list only the exercise-specific values):
- **G-ln:** answer = correct bits value times 0.6931 → "Ai folosit ln în loc de $\log_2$. Entropia în biți cere $\log_2$: $\log_2 x=\ln x/\ln 2$."
- **G-IG/H:** the field asks $H(Y|A)$ and the learner gives $H(Y)-H(Y|A)$ (or the reverse) → "Ai dat câștigul de informație în loc de entropia condiționată medie (sau invers). Se alege atributul cu $H(Y|A)$ minim, adică IG maxim." (Seminar scan Tema3: 0.400 is the IG, H(Play|Weather) is 0.600.)
- **G-nw:** the unweighted mean of the children's entropies → "Ai uitat ponderile $|S_v|/|S|$ ale ramurilor."
- **G-sw:** weights swapped between branches → "Ponderea unei ramuri e numărul ei de exemple împărțit la total (Tema3: 0/10 în loc de 6/10)."
- **G-range:** a value above $\log_2 k$ or negative → "Imposibil: $0\le H\le\log_2 k$. Verifică logaritmii." (Cn-s3:5, the sanity rule.)
- **G-swap±:** counts of + and − swapped → harmless for $H$ (symmetry), tell the learner so; wrong for a decision.

**Default tie rules.** Where an exercise needs a tie rule the statement says it; otherwise: attributes in table order (left to right), thresholds ascending, a leaf tie goes to class 0 (the book's 2.4 convention, `verified-answers.md`). Where a tie changes a number, the solution screen shows both outcomes (4.51.a, 4.51.d, 4.2, 4.37, 4.48, T21T2 5).

**Worked-example data stays on screen** (added by the critic pass). A worked example that runs over several screens keeps its data (the table, the distribution, the tree, the counts) visible on every screen that asks about it, as a compact data panel above the question. A later screen never relies on "același tabel" or "din tabel" with the table out of view (rule: data on the same screen as the question). Showing the same data again inside one worked example is the example continuing, not a repeated table; it never travels to another lesson.

**Lesson order, ownership, flags.** The list of what each lesson owns is in the headers below; the counts are "concepts 3-4 per lesson". The things I needed to decide or that need Alex are in section 11 ("Probleme și hotărâri").

### 1. Exercise coverage (every part exactly once)

| Lesson | Exercises (2026 book numbers) |
|---|---|
| L9 | 0.58 a, b · 4.34 · 4.35 (optional, implementation: covered by one line, see L9 builder notes) · 4.38 a-e |
| L10 | 4.5 a-c · 4.36 a-e · 4.42 a, b |
| L11 | 4.2 a-f · 4.37 a-c · 4.41 a-c · 4.43 a-c |
| L12 | 4.1 · 4.3 a, b · 4.4 a, b · 4.17 a, b (opt.) · 4.18 a, b (opt.) · 4.32 · 4.33 · 4.39 a, b · 4.40 a-c |
| L13 | 4.6 a-c · 4.7 a, b · 4.8 a, b · 4.9 · 4.16 · 4.45 · 4.56 a-e |
| L14 | 3.11.b · 4.11 a, b · 4.12 a-c · 4.47 (opt.) · 4.48 · 4.50 a-d · 4.51 a-d |
| L15 | 4.10 a, b · 4.21 a-d · 4.44 · 4.46 a-d · 4.49 a-c · 4.57 a-c |
| L16 | 4.19 a-d · 4.20 · 4.53 (opt.) · 4.54 a-d · 4.55 (opt.) · 4.58 (opt., implementation: one line) |
| L17 | 4.13 a-c · 4.14 a-c · 4.15 a-c · 4.52 a-e |

Worked examples (each in one lesson only): L9 P21 1(b.i) (`tests/2021-2022-partial1-ro/subiect.pdf:1`, solution `solutii.pdf:1-2`); L10 Cn-s4:5-7; L11 T20b 2.1 (`tests/2020-2021-t1-seminar-b/subiect.pdf:2`); L12 T20C 2 (`tests/2020-2021-t1-ciortuz/subiect.pdf:2`); L13 T21T2 1 (`tests/2021-2022-t2-seminar-ro/subiect.pdf:1`); L14 ML3:21; L15 T21T2 5; L16 T21T2 10; L17 constructed (ID unic).

## Part 4: parameter estimation and Bayes classifiers (L18-L22) and the tests

### 0. How to read this file

Format follows `outline-prob.md`. Learner text is Romanian and sits in quote blocks (`>`) or in the Romanian lines of an exercise (statement, hints, solution, detector messages); everything else is English notes for the builder. Learner text uses only **bold**, `code` and $KaTeX$ inline, no Romanian quotes, no pedagogy labels. The words pretest / concrete / rule / why / retrieve appear only in these builder headings.

**Source tags.** `B:p` = exercise book `source/2026/ex-book/ex-book.24sept2026.pdf` (book page = PDF page). `ML6:n` = `source/2026/slides/ml6.pdf` slide n. `BS:n` = `source/2026/ex-book-slides/ML.ex-book.SLIDES.Bayes.pdf` slide n. `Cn-s5:p` / `Cn-s6:p` = `source/2026/seminar/ciobanu/notes-s5.pdf` / `notes-s6.pdf` page p. `DEM:1` = `source/2026/notes/demonstratii.2026f.pdf` p.1. Tests: `T21P` = `tests/source/2021-2022-t1-seminar-ro/subiect.pdf`, `T21T2` = `tests/source/2021-2022-t2-seminar-ro/`, `T20C` = `tests/source/2020-2021-t1-ciortuz/subiect.pdf`, `P20` = `tests/source/2020-2021-partial1/`.

**Number tags** (the builder's numeric test recomputes every tag except `[caiet]`; all of them were recomputed by `verify_bayes.py` in this folder, with exact fractions, and agreed):
- `[caiet]` printed in the book's worked solution.
- `[slide]` printed on a companion slide (BS) or a lecture slide (ML6).
- `[seminar]` printed in a seminar note or a test solution.
- `[calculat]` the book gives no answer; the readers' computation was confirmed by `verified-answers.md`. The solution screen says one line: "Culegerea nu dă răspunsul; verificat de două ori."
- `[construit]` numbers I made for a pretest, a quiz item, a numeric instance or a mock problem (never a sourced claim). Each one is recomputed by `verify_bayes.py`.

**Answer fields** (calculation-exercise block): `num` decimal; `frac` equivalent fractions accepted plus decimals within the tolerance; `choice`/`tf`/`multi` exact. Default tolerance: ±0.0005 for a value below 1, ±0.001 above 1; every other tolerance is stated. A field marked "(p)" also accepts the book's rounded value. "Detector" = a predictable wrong value and the message shown for it.

**Proof screens** use the shape of `outline-prob.md` (`proof-steps`: the learner predicts the next step, the step is revealed; wrong options are named misconceptions).

**Back-link rule.** A lesson that needs an earlier concept writes one line "vezi Lecția N" and never re-explains it.

**Worked-example data stays on screen** (added by the critic pass). A worked example that runs over several screens keeps its data (the table, the distribution, the tree, the counts) visible on every screen that asks about it, as a compact data panel above the question. A later screen never relies on "același tabel" or "din tabel" with the table out of view (rule: data on the same screen as the question). Showing the same data again inside one worked example is the example continuing, not a repeated table; it never travels to another lesson.

#### 0.1 Ownership ledger (no item in two lessons)

| Lesson | Teaches (once) | Data owned |
|---|---|---|
| L18 | likelihood as a function of the parameter, log-likelihood, MLE (Bernoulli, categorical, conditional from counts), proof 0.43.c | opening coin 1,0,1,1,1; Cn-s5:1 "Remember 2"; 0.42; 0.43 (a-e datasets) |
| L19 | Bayes for hypotheses (prior, verosimilitate, a posteriori), $h_{ML}$, $h_{MAP}$, equal priors, argmax vs max, MAP of a Bernoulli parameter with Beta(3,3), odds and log-odds, brute-force MAP and the Bayes optimal vote (name warning) | cancer ML6:7; 2.1, 2.2, 2.3, 2.4, 2.24, 2.25, 0.26, 0.43.f-i; coins pretest; Cn-s5:1 (max/argmax) |
| L20 | $v_{MAP}$ rule, Bayes Comun, Bayes Naiv (conditional independence, training = MLE per factor), unified view, free-parameter counts | P20 2 / R18 3A (seven rows x,y,z,U); 2.5, 2.6, 2.7, 2.27, 2.28, 2.29; mushrooms 4.2 (BS:88-93, link back to L11); six-row pretest |
| L21 | zero-factor problem, 0/0 posterior, add-one, m-estimate, absent-word factors | T21T2 7 (five rows); 2.8, 2.30, 2.31 |
| L22 | average error rate against the true P, two error sources, xor, duplicated attributes, New-Bayes | T20C 3 = 2.32 (worked example); 2.9, 2.11, 2.33, 2.35, 2.36, 2.42 |
| Tests | mock T1 (new numbers on every problem), T21P (as given) | own tables, none shared with L19-L22 |

#### 0.2 Decisions I made (plumbing; Alex can veto; also see section 6)

1. **Mock T1 problem 1c** proves the total probability formula (T20a 1.2, the proof L2 teaches), not $P(A,B|C)=P(A|C)P(B|A,C)$ as the allocation text says: T21P item 1 is that exact proof, it is also the proof L1 teaches (0.14), and the learner would meet it a third time. Fallback if Alex wants the allocation text: the statement is in section 5.1 builder notes.
2. **Add-one is applied to the conditionals $P(a_i|v_j)$ only; the priors $P(v_j)$ stay relative frequencies** (the convention of the book: ex. 2.8 fixes the prior by hand, 2.30's add-one value 0.7586 uses count priors). Every add-one number is computed that way and the screen says so.
3. **"Bayes optimal" has two meanings and the lessons never use the bare phrase.** L19 calls the vote of ML6:9-10 "clasificatorul Bayes optimal prin vot" and warns; L20 uses "Bayes Comun (Optimal, Joint Bayes)" for the joint classifier (B:370-371).
4. **2.4 CVLOO of DT2 is shown as 1/5 with the book's tie rule** (a tie leaf is classified 0 because DT2 must stay a one-test tree), and the screen says the other reading would give 3/5 (answer status ruled).
5. **2.27.b (13 / 71)** is taught as a convention: free parameters, generalising the book's Bernoulli formulas; answer status ruled, labelled on screen.
6. **The Gibbs classifier (ML6:11) and MDL (ML6:25-28)** get one "nu se cere la test" screen in L19, nothing more (design section 3).
7. **Numbers in pretests and quiz items are new** (never the worked-example data); each is tagged `[construit]` and recomputed.

# Additions for the teacher's list (2026-10-29)

The teacher's list of what the Friday 2026-10-30 test needs (23 items; verbatim in `ml-outline/2026-10-29-teacher-list-coverage.md`, which maps every item to its screens) was checked against this outline item by item (D-069; the plumbing calls are D-072 to D-074). Where the outline covered an item only partly, the missing piece was added to the lesson that owns the topic. Each addition carries **(added 2026-10-29, teacher list item N)** in its heading or builder line; nothing was moved, renumbered or removed, and no item changed owner. New ids: a screen with a letter suffix (`L5.s06a`) sits right after the screen it extends; quiz items continue the lesson's numbering (`L12.Q5`); a constructed exercise is `L<n>.c<k>` and that id is its key in `allocation.json` `exercise_index` (it has no book number; status verified-twice). Every new number is `[construit]` and was computed twice, with `src/ml/calc/formula.js` `evaluate` (the formula is written next to the value) and with exact fractions in Python; for the decision zones of L14, ID3 was rerun with every tie variant. Both scripts are in this folder: `verify_teacher_list.mjs` (run from the worktree root) and `verify_teacher_list.py` (`python3 -I`).

| Lesson | Added | Teacher item |
|---|---|---|
| L4 | L4.c1 (proof: $\mathrm{Var}(X+a)=\mathrm{Var}(X)$ from the definition and the linearity of the mean), L4.c2 (is it a p.m.f.?; $p(x)=c\cdot x$) | 1 |
| L5 | concept (4); L5.s06a (distribution of $g(X,Y)$ from the joint table); L5.s09a (functions of independent variables, $E[XY^2]$); L5.c1 (the product $XY$ of two independent variables); one sentence on L5.s08 | 2, 4 |
| L6 | one sentence on L6.s05 | 4 |
| L12 | concept (d); R0 (what ID3 optimizes and the model it builds); Q5 | 6 |
| L14 | R3b (a leaf's zone as inequalities); zone fields in E 3.11.b and E 4.48 | 10 |
| L15 | R4b (overfitting, underfitting, good fit); Q5; E L15.c1 (roles of the training, validation and test sets; 5-fold estimate; cost of CVLOO) | 11, 12, 13 |
| L21 | concept (3); L21.s09a (imbalanced data: predefined priors); L21.q5; field `e` of L21.e1 (2.8) | 23 |
| L22 | L22.s10a (Bayes Naiv and Bayes Comun: advantages and disadvantages, P0-P8); L22.q4 | 22 |

Not added, Alex's call: exercise 0.110 (the book's recap exercise on operations with independent variables; `allocation.json` `out_of_scope` says "de decis de Alex"). L5.s09a and L5.c1 teach its skill with our own numbers, so the lesson does not wait for that call.

# Lessons

## Lecția 1 (`ml-l01`): Probabilitate: spațiu de probabilitate, probabilitate condiționată, regula de înmulțire

**Priority A.** **Concepts (3):** (1) spațiul de probabilitate $(\Omega,\mathcal F,P)$, aditivitatea numărabilă, cazul uniform; (2) probabilitatea condiționată $P(A\mid B)$; (3) regula de înmulțire și regula de înlănțuire, inclusiv varianta condiționată. **Prerequisites:** none.

**Does not teach (owned elsewhere):** total probability, Bayes (L2); independence (L3); random variables (L4).

### L1 screens: opening question

**L1.s01** (question, number or fraction field; data on the same screen)
> Aruncăm un zar corect. Un prieten ne spune doar atât: **a căzut o față pară**. Cât este acum probabilitatea să fi căzut 6?

Expected `1/3` (frac). Typical wrong value `1/6`. After the answer the screen only says: "Păstrează răspunsul. Îl verifici mai departe." The payoff is on screen L1.s10 (same die, drawn as a diagram). Source of the problem type: Cn-s1:4 (die and even); the question about 6 is mine `[construit]`.

### L1 screens: worked example, probability space (Cn-s1:3)

**L1.s02** (learn + prediction)
> Un experiment aleator are rezultate posibile. Pentru Ω = {a, b, c} (trei rezultate), un eveniment este orice submulțime a lui Ω. Mulțimea tuturor evenimentelor este $\mathcal F = 2^\Omega$: $\emptyset$, {a}, {b}, {c}, {a,b}, {a,c}, {b,c}, Ω.

Prediction: "Câte evenimente are $\mathcal F$?" Correct `8` ($2^3$). Reveal lists the eight events.

**L1.s03** (table, from Cn-s1:3; prediction)
> Cineva a început să scrie patru funcții $f_1, f_2, f_3, f_4$ care ar trebui să fie probabilități pe $\mathcal F$. Iată ce a apucat să scrie:
>
> | eveniment | $f_1$ | $f_2$ | $f_3$ | $f_4$ |
> |---|---|---|---|---|
> | $\emptyset$ | | 1/2 | | |
> | {a} | 1/3 | | | 1,5 |
> | {b} | 1/3 | | | |
> | {c} | 1/3 | | 2/3 | |
> | {a,b} | | | 1/3 | |
> | {a,c} | | | 1/3 | |
> | {b,c} | | | | |
> | Ω | 1 | | | |
>
> Una dintre funcții are deja o valoare imposibilă pentru o probabilitate. Care?

Prediction: pick the function. Correct `f4` (1,5 is above 1). Reveal: a probability is a number in [0,1]. Why only f4 is "visibly" impossible; the other defects need a rule and come next.

**L1.s04** (prediction)
> Funcția $f_2$ dă evenimentului imposibil $\emptyset$ valoarea 1/2. Ce valoare ar trebui să aibă probabilitatea evenimentului imposibil?

Correct `0`. Reveal: f2 is inconsistent. The reason is proved on L1.s09.

**L1.s05** (prediction)
> La $f_3$: {c} are 2/3, dar {a,c}, care îl conține pe {c}, are doar 1/3. Poate un eveniment să fie mai probabil decât unul care îl conține?

Correct `nu`. Reveal: f3 is inconsistent (a bigger event cannot be less probable; proved on L1.s09).

**L1.s06** (prediction, fill-in)
> $f_1$ nu are nicio contradicție. Cât trebuie să fie $f_1(\{a,b\})$?

Correct `2/3`. Reveal: {a} and {b} are disjoint, so $P(\{a,b\}) = P(\{a\}) + P(\{b\}) = 1/3 + 1/3$. Same for {a,c} and {b,c}; $P(\emptyset)=0$. Check: 1/3 + 1/3 + 1/3 = 1 = P(Ω). So f1 is a valid probability function; f2, f3, f4 are not (Cn-s1:3, `[seminar]`).

### L1 screens: rules

**L1.s07** (definition)
> **Spațiul de probabilitate.** $\Omega$ este spațiul de eșantionare (mulțimea rezultatelor posibile). Un **eveniment** este o submulțime $A \subseteq \Omega$: $\Omega$ este evenimentul sigur, $\emptyset$ evenimentul imposibil, $\{\omega\}$ un eveniment elementar. Spațiul evenimentelor este $\mathcal F = 2^\Omega$.
>
> **Funcția de probabilitate** $P : \mathcal F \to [0,1]$ are două proprietăți:
> - $P(\Omega) = 1$;
> - **aditivitatea numărabilă:** pentru evenimente disjuncte $A_1, A_2, \dots$ avem $P\left(\bigcup_i A_i\right) = \sum_i P(A_i)$.

Footnote: "Cursul: slide 4. Culegerea: p. 23." Builder: "spațiul de eșantionare" is the book's term (B:25); "spațiul evenimentelor" appears only in the 2021 test (`tests/2021-2022-t1-seminar-ro`), the slides say "event space" (FND:4). Use both.

**L1.s08** (learn + table)
> **Cazul uniform.** Dacă $\Omega$ este finit și toate rezultatele elementare sunt la fel de probabile: $P(A) = \dfrac{\text{nr. cazuri favorabile}}{\text{nr. cazuri posibile}}$.
>
> Două evenimente sunt **incompatibile** dacă $P(A \cap B) = 0$.
>
> **Scrierea cu mulțimi:**
>
> | în cuvinte | cu mulțimi |
> |---|---|
> | A sau B | $A \cup B$ |
> | A și B | $A \cap B$ |
> | non A | $\bar A$ |
> | A sau B, dar nu amândouă | $(A \cup B) \setminus (A \cap B)$ |
>
> Virgula înseamnă intersecție: $P(A, B) = P(A \cap B)$.

Footnote: "Cursul: slide 4. Culegerea: p. 23, ex. 0.1.c." Builder: the "A sau B, dar nu amândouă" row comes from item 6 of `T21P` (set notation), not from the book; the comma = intersection convention is Ciortuz's (FND:5, B:38).

**L1.s09** (proof screen, step by step; WYSK:1 lists exactly these three; derivation is the standard one from the two axioms, the same pattern as B:23 solution 0.1.a)
> Dovedim, doar din definiția funcției de probabilitate: **(1)** $P(\emptyset) = 0$; **(2)** $P(\bar A) = 1 - P(A)$; **(3)** $A \subseteq B \Rightarrow P(A) \le P(B)$.

Steps (each: the learner predicts, then the step is revealed):
1. For (1): "Ce descompunere disjunctă a lui Ω folosim?" ✓ $\Omega = \Omega \cup \emptyset$ (disjuncte, orice mulțime e disjunctă de ∅). ✗[caz particular] "$\Omega=\{a\}\cup\{b\}\cup\{c\}$": works only for one space, the proof must hold for every Ω. ✗[∅ nu e disjunctă] "∅ nu se poate folosi, nu are elemente": the empty set is disjoint from every set.
2. Apply additivity: $P(\Omega) = P(\Omega) + P(\emptyset)$, so $1 = 1 + P(\emptyset)$, so $P(\emptyset) = 0$. This answers the seminar question "Note: P(∅)=0. Why?" (Cn-s1:3) and closes f2 of L1.s04.
3. For (2): $\Omega = A \cup \bar A$, disjoint; so $1 = P(A) + P(\bar A)$.
4. For (3): "Cum scrii B cu A?" ✓ $B = A \cup (B \setminus A)$, disjuncte. ✗[uniune nedisjunctă] $B = A \cup B$: the parts must be disjoint for additivity. Then $P(B) = P(A) + P(B\setminus A) \ge P(A)$ because probabilities are $\ge 0$. This closes f3 of L1.s05.

**L1.s10** (viz `ml-viz-omega`, step by step; this is the payoff of L1.s01 and the definition of P(A|B); data in "Visual spec" below)
> Pe zar: $\Omega = \{1,\dots,6\}$, $B$ = "număr par" = {2, 4, 6}, $A$ = {6}. Aflând că $B$ s-a întâmplat, câte rezultate mai rămân posibile? În câte dintre ele s-a întâmplat $A$?

Predictions: `3` remaining outcomes; `1` of them favorable, so `1/3` (compare to the answer given on L1.s01). Then the same with probabilities: $P(A \cap B) = 1/6$, $P(B) = 1/2$, and $\dfrac{1/6}{1/2} = \dfrac13$.
> **Probabilitatea condiționată:** $P(A \mid B) = \dfrac{P(A \cap B)}{P(B)}$, pentru $P(B) \neq 0$. Se citește "probabilitatea lui A, știind B"; se mai numește probabilitatea a posteriori a lui A dat B.
>
> Dacă $B = \Omega$ nu aflăm nimic nou: $P(A \mid \Omega) = P(A)$.

Footnote: "Cursul: slide 5. Seminar 1, p. 5." (FND:5 writes "a posteriory", sic; the screen spells it correctly.) The line $P(A\mid\Omega)=P(A)$ answers the seminar question "Is it true that P(A)=P(A|Ω)?" (Cn-s1:5).

**L1.s11** (prediction, then rule; example Cn-s1:6 `[seminar]`, see decision 4)
> Doi soldați trag la țintă. Soldatul A ratează cu probabilitatea 1/3. Știind că A a ratat, soldatul B ratează cu probabilitatea 1/10. Cât este probabilitatea ca **ambii** să rateze?

Correct `1/30`. Reveal: the number 1/10 is already conditional ($P(B\mid A)$), so $P(A\cap B) = P(B\mid A)\,P(A) = \frac1{10}\cdot\frac13 = \frac1{30}$. A wrong answer `1/10` or `1/3` means the conditional was read as a plain probability (see detector in the quiz).

**L1.s12** (definition)
> **Regula de înmulțire:** $P(A \cap B) = P(A \mid B)\,P(B) = P(B \mid A)\,P(A)$.
>
> **Regula de înlănțuire:** $P(A_1 \cap A_2 \cap \dots \cap A_n) = P(A_1)\,P(A_2 \mid A_1)\,P(A_3 \mid A_1, A_2) \cdots P(A_n \mid A_1, \dots, A_{n-1})$.
>
> **Varianta condiționată** (dovedită în exercițiul 0.14 de mai jos): $P(A, B \mid C) = P(A \mid C)\,P(B \mid A, C)$.
>
> Variabilele aleatoare vin în Lecția 4. Până atunci: $P(X{=}x, Y{=}y \mid Z{=}z)$ înseamnă același lucru, cu evenimentele $\{X{=}x\}$, $\{Y{=}y\}$, $\{Z{=}z\}$ în locul lui A, B, C.

Footnote: "Cursul: slide 5. Culegerea: p. 38 (0.14)." Builder: 0.14 is written in the book with `P(X=x,Y=y|Z=z)`; here it is shown for events (the proof is identical, per `allocation.md` L1 notes). The text above is the one-line notation bridge.

### L1 screen: why

**L1.s13** (reflect, one causal question with a reveal)
> De ce împărțim la $P(B)$ în definiția $P(A \mid B)$, în loc să luăm direct $P(A \cap B)$?

Answer: after we learn $B$, the event $B$ becomes the whole space, so its probability must be 1. $P(B \mid B) = P(B)/P(B) = 1$. Without the division the outcomes inside $B$ would carry total mass $P(B) < 1$ (for the die: 1/2), and half of the probability would be lost. Dividing rescales all the outcomes of $B$ by the same factor, so they keep the same proportions between them (2, 4, 6 stay equally likely: 1/3 each).

### L1 screens: retrieve (4 items; new numbers, never the die or the soldiers again)

**L1.q1** $A\subseteq B$ și $P(A)=0{,}7$. Care valoare este posibilă pentru $P(\bar B)$? (`[construit]`)
- ✓ $0{,}2$: $P(B)\ge P(A)=0{,}7$, deci $P(\bar B)=1-P(B)\le0{,}3$.
- ✗[monotonie în sens invers] $0{,}4$: ar însemna $P(B)=0{,}6<P(A)$; un eveniment care îl conține pe $A$ nu poate fi mai puțin probabil decât $A$.
- ✗[complementul lui A luat drept complementul lui B] "exact $0{,}3$, fiindcă $P(\bar B)=1-P(A)$": $1-P(A)$ este $P(\bar A)$; din $\bar B\subseteq\bar A$ rezultă doar $P(\bar B)\le0{,}3$, nu egalitatea.

Builder: the question "can $A$ and $B$ be incompatible?" (Bonferroni) is not asked in the quiz: it is exercise 0.1.c (L1.e1), with other numbers but the same question.

**L1.q2** În grupă, 40% știu Python, 20% știu Rust, 10% le știu pe amândouă. Cât este $P(\text{Rust} \mid \text{Python})$?
- ✓ 0,25 ($0{,}1/0{,}4$).
- ✗[P(A|B)=P(B|A)] 0,5: aceasta este $0{,}1/0{,}2 = P(\text{Python} \mid \text{Rust})$, condiționata inversă; la numitor stă probabilitatea a ceea ce știm (Python).
- ✗[intersecția în loc de condiționată] 0,1: aceasta este $P(\text{Python} \cap \text{Rust})$; condiționata o împarte la probabilitatea condiției, $P(\text{Python})=0{,}4$.
- ✗[marginala în loc de condiționată] 0,2: aceasta este $P(\text{Rust})$, ca și cum faptul că știe Python n-ar schimba nimic.

**L1.q3** O urnă are 3 bile roșii și 2 albastre. Extragem două bile, una după alta, fără a pune bila înapoi. Cât este probabilitatea să fie ambele roșii?
- ✓ $\frac35 \cdot \frac24 = \frac3{10}$.
- ✗[uită condiționarea / extragere cu întoarcere] $\frac{9}{25}$: înmulțește $\frac35\cdot\frac35$, ca și cum prima bilă ar fi pusă înapoi; la a doua extragere urna are 4 bile, dintre care 2 roșii.
- ✗[adună în loc să înmulțească] $\frac35 + \frac24$: probabilitățile evenimentelor dintr-un șir de extrageri se înmulțesc (regula de înmulțire), nu se adună; suma de aici depășește chiar 1.

**L1.q4** $P(A) = 0{,}6$, $P(B) = 0{,}3$, $P(A \cap B) = 0{,}2$. Cât este $P(A \cup B)$?
- ✓ 0,7.
- ✗[uită intersecția] 0,9: suma $0{,}6 + 0{,}3$ numără $A \cap B$ de două ori. Suma este doar o margine superioară: $P(A\cup B) \le P(A)+P(B)$, cu egalitate numai pentru evenimente incompatibile.
- ✗[produsul] 0,18: $P(A)P(B)$ ar fi intersecția, și numai pentru evenimente independente (aici $P(A\cap B)=0{,}2$); oricum nu este reuniunea.

### L1 exercises (calculation exercises; each is owned only here)

#### L1.e1: ex. 0.1 (B:23), `[caiet]`, answer status book

**Enunț (pe ecran):** Fie două evenimente A și B. **a.** Folosind doar proprietățile din definiția funcției de probabilitate, arătați că $P(A \cap \bar B) = P(A) - P(A \cap B)$. **b.** Demonstrați inegalitatea lui Bonferroni: $P(A \cap B) \ge P(A) + P(B) - 1$. **c.** Pentru $P(A) = 1/3$ și $P(B) = 5/6$, pot A și B să fie incompatibile? Justificați.

**Proof screens (a, b).**
- (a) Steps: 1. "Cum se scrie A cu B?" ✓ $A = A\cap\Omega = A \cap (B\cup\bar B) = (A\cap B)\cup(A\cap\bar B)$. ✗[A = A ∩ B] "A = A ∩ B": true only if $A \subseteq B$. 2. The two parts are disjoint (B and B̄ are), so by countable additivity $P(A) = P(A\cap B) + P(A \cap\bar B)$. 3. Rearrange: $P(A\cap\bar B) = P(A) - P(A\cap B)$. (Book's method, B:23.)
- (b) Steps: 1. $A\cup B = (A\cap\bar B)\cup(A\cap B)\cup(\bar A\cap B)$, three disjoint parts, so $P(A\cup B)$ is the sum of their probabilities. 2. Solve for the middle one: $P(A\cap B) = P(A\cup B) - P(A\cap\bar B) - P(\bar A\cap B)$. 3. Because $A\cup B = (A\cap\bar B)\cup B$ and $A \cup B = (\bar A \cap B)\cup A$ (both disjoint), $P(A\cup B) - P(A\cap\bar B) = P(B)$ and $P(A\cup B) - P(\bar A\cap B) = P(A)$; so $P(A\cap B) = P(A)+P(B)-P(A\cup B)$ (this is the addition rule, name it: "regula de adunare"). 4. Since $P(A\cup B)\le 1$: $P(A\cap B)\ge P(A)+P(B)-1$. Prediction at step 4: "Ce proprietate folosim?" ✓ $P(A\cup B)\le1$ (probabilitățile sunt ≤ 1). ✗[monotonie în sens greșit] "$P(A\cup B)\ge P(A\cap B)$": true but it does not bound the difference.

**Fields (c):**
- `c1` tf "Pot fi incompatibile?" expected `nu`.
- `c2` frac "Cea mai mică valoare posibilă a lui $P(A\cap B)$" expected `1/6` (from $\frac13+\frac56-1$).

**Hints:** 1) Folosește inegalitatea lui Bonferroni din punctul b. 2) $P(A) + P(B) - 1 = \frac13+\frac56-1$. 3) $\frac13+\frac56=\frac{7}{6}$, deci $P(A\cap B)\ge\frac16>0$, iar incompatibile ar însemna $P(A\cap B)=0$.

**Worked solution (book):** $P(A)+P(B)=\frac13+\frac56=\frac76$, so $P(A\cap B)\ge\frac16>0$. A and B are not incompatible (incompatible means $P(A\cap B)=0$).

**Detectors (c2):** `7/6` → "7/6 este suma; Bonferroni scade 1: 7/6 − 1 = 1/6." `0` → "0 ar fi valoarea pentru evenimente incompatibile, exact ce se exclude." `1/3` → "1/3 este $P(A)$: intersecția nu poate depăși un eveniment, dar marginea cerută e $P(A)+P(B)-1$." (c1) `da` → "două evenimente cu suma probabilităților peste 1 nu pot fi disjuncte: reuniunea ar avea probabilitate 7/6 > 1."

#### L1.e2: ex. 0.2 (B:24), `[caiet]`, answer status book

**Enunț:** Se aruncă simultan două zaruri. $S$ = suma numerelor. **a.** Calculați $P(S = 11)$. **b.** Dacă știm că $S$ este număr prim, cât devine probabilitatea de mai sus?

**Fields:** `a` frac `1/18` (= 2/36); `b0` num "Câte cazuri (perechi de zaruri) dau $S$ prim?" `15`; `b` frac `2/15`.

**Hints:** 1) Cele două zaruri dau 36 de perechi la fel de probabile; sumele nu sunt la fel de probabile. 2) Sumele prime sunt 2, 3, 5, 7, 11: numără perechile pentru fiecare (1, 2, 4, 6, 2). 3) $P(S{=}11 \mid S\text{ prim}) = \dfrac{P(S{=}11)}{P(S\text{ prim})} = \dfrac{2/36}{15/36}$.

**Worked solution (book):** 36 cazuri posibile; $S = 11$ în (5,6), (6,5): $P=2/36=1/18$. Prime sums: S=2: (1,1); S=3: (1,2),(2,1); S=5: 4 cazuri; S=7: 6 cazuri; S=11: 2 cazuri; total 15, $P(S\text{ prim}) = 15/36$. $P(S{=}11\mid S\text{ prim}) = (2/36)/(15/36) = 2/15$. Since $2/15 > 1/18$ the probability of an event rose after learning a related fact; in general $A\subseteq B \Rightarrow P(A)\le P(A\mid B)$ (book remark, B:24).

**Detectors (b):** `1/18` → "Ai dat $P(S=11)$ fără să folosești informația 'S prim'." `1/5` → "Ai tratat cele 5 sume prime (2, 3, 5, 7, 11) ca la fel de probabile; zarurile dau 36 de cazuri egale, sumele nu." `2/36` → "Ai dat numărătorul; împarte la $P(S\text{ prim})=15/36$." `15/36` → "Aceasta este $P(S\text{ prim})$, numitorul." (a) `1/36` → "S=11 se obține în două moduri, (5,6) și (6,5)."

#### L1.e3: ex. 0.3 (B:25), `[caiet]`, answer status book

**Enunț:** O cutie conține trei carduri: unul roșu pe ambele părți, unul verde pe ambele părți, unul roșu pe o parte și verde pe cealaltă. Selectăm un card la întâmplare; vedem doar fața de sus și e verde. Care este probabilitatea ca și cealaltă față să fie verde?

**Fields:** `n` num "Câte fețe are Ω?" `6`; `a` frac `2/3`.

**Hints:** 1) Ce se observă după extragere: un card sau o față? Spațiul de eșantionare e format din ce? 2) Notează fețele R1, R2 (cardul 1), R3, V4 (cardul 2), V5, V6 (cardul 3); cazurile posibile sunt fețele verzi. 3) Cazuri posibile: V4, V5, V6; favorabile: V5 și V6 (doar la ele cealaltă față e verde).

**Worked solution (book):** $\Omega = \{R1, R2, R3, V4, V5, V6\}$ (feţele, nu cardurile, fiindcă observăm o faţă, nu ambele). $p = m/n = 2/3$.

**Detectors:** `1/2` → "Ai ales cardurile ca spațiu: 'cardul e VV sau RV, deci 1/2'. Dar VV poate arăta verde în două moduri (V5, V6), RV într-unul (V4): cardurile nu sunt la fel de probabile după ce vezi verde." `1/3` → "Ai numărat un card favorabil din trei carduri; după ce vezi verde mai rămân 3 fețe posibile, din care 2 sunt favorabile."

#### L1.e4: ex. 0.14 (B:38), `[caiet]`, answer status book (proof; also the statement of T21P item 1 and T20b 1.2)

**Enunț:** Arătați că pentru orice evenimente (valori) x, y, z: $P(X{=}x, Y{=}y \mid Z{=}z) = P(X{=}x \mid Y{=}y, Z{=}z)\cdot P(Y{=}y\mid Z{=}z)$. În notație simplificată: $P(A, B \mid C) = P(A \mid B, C)\,P(B \mid C)$ (cu $P(B,C)>0$). Indicație: regula de înlănțuire.

**Proof screens:** 1. "Cum se scrie membrul stâng cu definiția?" ✓ $P(A,B\mid C)=\dfrac{P(A,B,C)}{P(C)}$. ✗[definiția cu alt numitor] "$\dfrac{P(A,B,C)}{P(B)}$": the condition is C, so the denominator is $P(C)$. 2. Chain rule with the factors in a convenient order: $P(A,B,C) = P(C)\,P(B\mid C)\,P(A\mid B,C)$. 3. Cancel $P(C)$: $P(B\mid C)\,P(A\mid B,C)$. ∎ Alternative (book): expand the right side: $\dfrac{P(A,B,C)}{P(B,C)}\cdot\dfrac{P(B,C)}{P(C)} = \dfrac{P(A,B,C)}{P(C)}$.

**Fields:** `f` choice "Care este forma echivalentă (aceeași demonstrație, rolurile lui A și B schimbate)?" ✓ $P(A,B\mid C)=P(A\mid C)\,P(B\mid A,C)$; ✗[transpusă] $P(A,B\mid C)=P(A\mid B)\,P(B\mid C)$ (the condition C is lost); ✗[produs simplu] $P(A,B\mid C)=P(A\mid C)\,P(B\mid C)$ (this holds only under conditional independence, Lecția 3).

**Detector note:** the second wrong option is the exam-level trap: the product form without $A$ in the condition is a special case (vezi Lecția 3).

**Builder:** `T21P` item 1 writes the second form with conditions $P(C)\ne0$, $P(A,C)\ne0$; show both orders and say the proof is the same.

#### L1.e5 (optional): ex. 0.8 (B:29), `[caiet]`, answer status book

**Enunț:** Marcați adevărat sau fals. Pentru fiecare afirmație adevărată demonstrați; pentru fiecare falsă dați un contraexemplu sau o justificare. **a.** $P(A\mid B)P(B)=P(B\mid A)P(A)$ dacă $P(A),P(B)>0$. **b.** $P(A\cup B)=P(A)+P(B)-P(A\mid B)$ dacă $P(B)>0$. **c.** $\dfrac{P(A\cup B\cup C)}{P(B\cup C)} \ge P(A\mid B\cup C)\,P(B\cup C)$ dacă $P(B\cup C)>0$. **d.** $P(B\mid A)+P(B\mid\bar A)=1$ dacă $P(A),P(\bar A)>0$.

**Fields:** `a` tf `adevărat`; `b` tf `fals`; `c` tf `adevărat`; `d` tf `fals`. Counterexample fields (zar corect): for b, with A = B = "număr par": `b1` frac "$P(A\cup B)$" `1/2`, `b2` frac "$P(A)+P(B)-P(A\mid B)$" `0` (`[construit]`); for d, with A = "număr par", B = "fața 1": `d1` frac "$P(B\mid A)$" `0`, `d2` frac "$P(B\mid\bar A)$" `1/3`, `d3` frac "suma" `1/3` (the book shows $P(B\mid\bar A)=1/3$ and $P(\bar B\mid A)=1$, B:30; mine adds the sum, `[construit]`).

**Hints:** 1) Scrie fiecare membru cu regula de înmulțire sau cu definiția. 2) Pentru (b): regula de adunare dă $P(A\cup B)=P(A)+P(B)-P(A\cap B)$; când e $P(A\cap B)=P(A\mid B)$? 3) Pentru (d): $P(B\mid A)+P(\bar B\mid A)=1$ (aceeași condiție A), nu $P(B\mid A)+P(B\mid\bar A)$.

**Worked solution (book):** (a) true: both sides equal $P(A\cap B)$ (multiplication rule). (b) false: it would need $P(A\cap B)=P(A\mid B)$, i.e. $P(A\cap B)=P(A\cap B)/P(B)$, i.e. $P(B)=1$ or $P(A\cap B)=0$. (c) true: with $D=B\cup C$ the claim is $P(A\cup D)/P(D)\ge P(A\cap D)$ (since $P(A\mid D)P(D)=P(A\cap D)$); it holds because $P(A\cup D)/P(D)\ge P(A\cup D)$ ($0<P(D)\le1$) and $P(A\cup D)\ge P(A\cap D)$. (d) false: $P(B\mid A)+P(\bar B\mid A)=1$ always, so (d) would need $P(B\mid\bar A)=P(\bar B\mid A)$; with a fair die, A even, B = face 1: $P(B\mid\bar A)=1/3$, $P(\bar B\mid A)=1$.

**Detectors:** (d) `adevărat` → "Condiția trebuie să fie aceeași: $P(B\mid A)+P(\bar B\mid A)=1$. Aici condițiile sunt A și Ā, deci suma poate fi orice (1/3 în contraexemplu, 2 dacă B = Ω)." (b) `adevărat` → "Regula de adunare scade $P(A\cap B)$, nu $P(A\mid B)$; cele două coincid doar dacă $P(B)=1$ sau $P(A\cap B)=0$."

### L1 visual spec: `ml-viz-omega` (diagram of Ω with events and the restriction to B)

- **Data:** Ω = six die faces drawn as six equal cells; B = {2,4,6}; A = {6}. Nothing else.
- **Steps (manual advance, prediction first):** (1) show Ω and ask "câte rezultate mai rămân după ce aflăm B?" Predict a number; reveal: cells outside B fade, three remain. (2) ask "în câte dintre ele s-a întâmplat A?" Predict; reveal A∩B = {6}, counter 1/3. (3) switch labels to probabilities: cell mass 1/6 each; P(B)=1/2; the three B cells are rescaled by the factor 2 to total 1 (this is the picture for L1.s13); show $P(A\mid B) = 1/3$ as the formula. (4) toggle "B = Ω": nothing fades, $P(A\mid\Omega)=P(A)=1/6$.
- **Learner predicts:** the number of remaining outcomes (3), the favourable count (1), the final value (1/3).
- **Reduced motion:** fading replaced by an instant greying; no auto-advance.

### L1 builder notes

- Sources: FND:4-5, B:23-25, B:29, B:38, Cn-s1:2-6, WYSK:1 (the three properties), T20a 1.1, T21P items 1, 4, 6.
- Uncertain: `L1.s08` row "A sau B, dar nu amândouă" and the 0.8 (c) wording come from tests/book; check against the printed pages when building the KaTeX. In the 0.8 (c) solution the book writes "implies" where "equivalent" is true; the text above keeps the stronger and correct reading.
- 0.14 uses events here and variables in the book: see L1.s12 bridge line.
- Repetition check: the die on L1.s01/L1.s10 is one example used for question and payoff, not twice explained. The seminar urns (11/4, 8/5) are 0.95 in L2 and are not used here.

---

## Lecția 2 (`ml-l02`): Probabilitatea totală și formula lui Bayes

**Priority A.** **Concepts (2):** (1) partiția și formula probabilității totale; (2) formula lui Bayes: a priori, verosimilitate, a posteriori, cu numitorul din formula totală. **Prerequisites:** vezi Lecția 1 (probabilitate condiționată, regula de înmulțire).

**Does not teach:** conditional probability and the multiplication rule (L1); independence (L3).

### L2 screens: opening question

**L2.s01** (question, number field; data on the same screen)
> O boală rară afectează **1%** din populație. Un test o detectează la **90%** dintre bolnavi, dar iese pozitiv și la **9%** dintre oamenii sănătoși. Ai ieșit pozitiv la test. Cât este probabilitatea să fii bolnav?

Expected `≈ 0,09` (accept 0,09 ± 0,005; exact $90/981 = 0{,}0917$). Typical wrong value `0,9`. The screen only says "Păstrează răspunsul."; the learner builds the answer on the next screens. Numbers: `[construit]`, value 0,0917 verified in `seminar-and-errors` B3.

### L2 screens: worked example (viz `ml-viz-freq-tree`, natural frequencies before any formula)

**L2.s02** (prediction)
> Imaginează-ți **10 000** de persoane. Câte dintre ele au boala?

Correct `100` (1%). The tree appears with the root 10 000 and two branches: boală (100), sănătoși (9 900).

**L2.s03** (prediction)
> Dintre cele **100** de persoane bolnave, câte ies pozitive la test (testul detectează 90%)?

Correct `90`. Branch: 90 pozitive, 10 negative.

**L2.s04** (prediction)
> Dintre cele **9 900** de persoane sănătoase, câte ies pozitive (9% fals pozitive)?

Correct `891` ($9900 \times 0{,}09$). Branch: 891 pozitive, 9 009 negative.

**L2.s05** (prediction)
> Câte persoane au ieșit pozitive în total? Dintre ele, câte sunt bolnave? Ce fracțiune?

Correct `981` positive in total ($90 + 891$), `90` of them sick, so $90/981 \approx 0{,}0917$. Reveal: about **9%**, not 90%. The 90% describes how many sick people the test catches, not how many positive people are sick: 891 healthy people are positive because the healthy are 99 times more numerous.

### L2 screens: rules

**L2.s06** (definition)
> **Partiție.** Evenimentele $B_1, \dots, B_k$ formează o partiție a lui $\Omega$ dacă sunt disjuncte două câte două ($B_i \cap B_j = \emptyset$ pentru $i \ne j$) și $\bigcup_i B_i = \Omega$. Exemplu: $B$ și $\bar B$.
>
> **Formula probabilității totale.** Pentru două evenimente: $P(A) = P(A \mid B)\,P(B) + P(A \mid \bar B)\,P(\bar B)$. În general, dacă $B_i$ sunt disjuncte și $A \subseteq \bigcup_i B_i$: $P(A) = \sum_i P(A \mid B_i)\,P(B_i)$.
>
> Pe exemplul cu testul: $A$ = "test pozitiv", $B$ = "bolnav": $P(A) = 0{,}9 \cdot 0{,}01 + 0{,}09 \cdot 0{,}99 = 0{,}0981$ (adică $981/10\,000$, numărul de pozitivi de pe arbore).

Footnote: "Cursul: slide 6. Culegerea: p. 217 (nota 244). Seminar 1, p. 6." Builder: the relaxed condition "$A\subseteq\bigcup B_i$ or $P(\bigcup B_i)=1$" is the book's footnote 245 (B:218) and FND:6.

**L2.s07** (definition + labelled tree)
> **Formula lui Bayes.** $P(B \mid A) = \dfrac{P(A \mid B)\,P(B)}{P(A)}$, iar $P(A)$ se calculează cu formula probabilității totale: $P(B \mid A) = \dfrac{P(A \mid B)\,P(B)}{P(A \mid B)\,P(B) + P(A \mid \bar B)\,P(\bar B)}$.
>
> Nume: $P(B)$ este probabilitatea **a priori** (înainte de test: 0,01); $P(A \mid B)$ este **verosimilitatea** (0,9); $P(B \mid A)$ este probabilitatea **a posteriori** (după test: 0,0917).
>
> Pe exemplu: $\dfrac{0{,}9 \cdot 0{,}01}{0{,}0981} = \dfrac{90}{981}$: numărătorul este ramura "bolnav și pozitiv", numitorul toate ramurile pozitive.

Footnote: "Cursul: slide 6. Seminar 1, p. 6." Builder: "a priori" is in the seminar (Cn-s1:6); "a posteriori" in FND:5; "verosimilitate" is used by the 2021 test for MLE; see decision 2 (no "evidență").

**L2.s08** (proof, step by step: total probability; T20a 1.2 asks for it)
> Dovedim $P(A) = P(A \mid B)\,P(B) + P(A \mid \bar B)\,P(\bar B)$.

Steps: 1. "Cum se rupe A în două bucăți disjuncte?" ✓ $A = (A \cap B) \cup (A \cap \bar B)$. ✗[bucăți suprapuse] $A = (A\cap B)\cup A$: the parts overlap, additivity cannot be applied. 2. Disjoint, so $P(A) = P(A\cap B) + P(A\cap\bar B)$ (aditivitate). 3. Regula de înmulțire (vezi Lecția 1) pe fiecare termen: $P(A\cap B) = P(A\mid B)P(B)$ and $P(A\cap\bar B)=P(A\mid\bar B)P(\bar B)$. ∎ General case: same with $A = \bigcup_i (A\cap B_i)$.

**L2.s09** (proof, step by step: Bayes)
> Dovedim $P(B \mid A) = \dfrac{P(A \mid B)\,P(B)}{P(A)}$ pentru $P(A) > 0$.

Steps: 1. "Ce egalitate scriem pentru $P(A\cap B)$ în două feluri?" ✓ $P(A\cap B) = P(A\mid B)P(B) = P(B\mid A)P(A)$ (regula de înmulțire). 2. Divide the second equality by $P(A)>0$. ∎ ✗[uită ipoteza] a student who divides without saying $P(A)>0$: the formula is defined only then.

### L2 screen: why

**L2.s10** (viz parameter change, then reflect)
> Același test (detectează 90% dintre bolnavi, 9% fals pozitivi), dar acum boala afectează **jumătate** din populație. Din nou 10 000 de persoane: câți dintre cei pozitivi sunt bolnavi, ca fracțiune?

Predict, then reveal: 5 000 bolnavi → 4 500 pozitivi; 5 000 sănătoși → 450 pozitivi; $4500/4950 = 10/11 \approx 0{,}909$. `[construit]`.
> **De ce** același test dă 9% într-un caz și 91% în celălalt? Poate $P(\text{bolnav} \mid \text{pozitiv})$ să fie aflat doar din $P(\text{pozitiv} \mid \text{bolnav})$?

Answer: no. $P(A\mid B)$ says how often the test catches the sick; it says nothing about how many sick people there are (the prior $P(B)$) or how many positives come from the healthy. Bayes needs both the prior and the denominator; change the prior and the posterior changes even though the test is the same.

### L2 screens: retrieve (4 items; new situations)

**L2.q1** Mașina A produce 60% din piese, cu 2% defecte; mașina B produce 40%, cu 5% defecte. O piesă aleasă la întâmplare e defectă. Cât este probabilitatea să vină de la A?
- ✓ 0,375 ($0{,}6\cdot0{,}02 / (0{,}6\cdot0{,}02+0{,}4\cdot0{,}05) = 0{,}012/0{,}032$). `[construit]`
- ✗[verosimilitate în loc de posterior] 0,02: aceasta este $P(\text{defect}\mid A)$, condiționata inversă; întrebarea cere $P(A\mid\text{defect})$.
- ✗[prior în loc de posterior] 0,6: aceasta este $P(A)$, probabilitatea a priori, dinainte de a ști că piesa e defectă; o piesă defectă vine mai probabil de la mașina care face mai multe defecte pe piesă.
- ✗[uitarea numitorului] 0,012: acesta este numărătorul $P(\text{defect}\mid A)P(A)$; împarte-l la $P(\text{defect})=0{,}032$ (formula probabilității totale).

**L2.q2** $P(A\mid B) = 0{,}3$, $P(A\mid\bar B) = 0{,}5$, $P(B) = 0{,}25$. Cât este $P(A)$?
- ✓ 0,45 ($0{,}3\cdot0{,}25 + 0{,}5\cdot0{,}75$). `[construit]`
- ✗[media simplă] 0,4: media simplă a lui 0,3 și 0,5, fără ponderi; ramurile au probabilitățile 0,25 și 0,75.
- ✗[un singur termen] 0,075: $0{,}3\cdot0{,}25$ este doar ramura prin $B$; adună și ramura prin $\bar B$.
- ✗[suma condiționatelor] 0,8: $P(A\mid B)+P(A\mid\bar B)$ nu este o probabilitate a lui $A$; fiecare termen se înmulțește cu probabilitatea ramurii lui, $P(B)$, respectiv $P(\bar B)$.

**L2.q3** Pentru un zar, care familie este o partiție a lui $\Omega=\{1,\dots,6\}$?
- ✓ {1,2}, {3,4}, {5,6}.
- ✗[se suprapun] {1,2,3}, {3,4,5}, {6}: acoperă $\Omega$, dar 3 apare în două mulțimi, deci nu sunt disjuncte.
- ✗[nu acoperă] {1,2}, {3,4}: sunt disjuncte, dar reuniunea lor nu conține 5 și 6.

**L2.q4** Dintr-un grup de 200 de persoane, 20 au boala. Testul e pozitiv la 18 dintre cei 20 bolnavi și la 18 dintre cei 180 sănătoși. Dintre cei cu test pozitiv, ce fracțiune e bolnavă?
- ✓ 1/2 ($18/36$). `[construit]`
- ✗[sensibilitate în loc de posterior] 0,9: $18/20$ este fracțiunea bolnavilor care au testul pozitiv, nu fracțiunea celor cu test pozitiv care sunt bolnavi.
- ✗[rata fals pozitivilor] 0,1: $18/180$ este fracțiunea sănătoșilor care au testul pozitiv.
- ✗[fracțiune din toți] 0,09: $18/200$ împarte la toată lumea; întrebarea se referă doar la cei 36 cu test pozitiv.

### L2 exercises

#### L2.e1: ex. 0.6 (B:27-28), `[caiet]`, answer status book

**Enunț:** Variabilele aleatoare A și B (folosite aici ca evenimente); informațiile: (a) $P(A\mid B)=2/3$; (b) $P(A\mid B)=2/3$ și $P(A\mid\bar B)=1/3$; (c) $P(A\mid B)=2/3$, $P(A\mid\bar B)=1/3$, $P(B)=1/3$; (d) cele trei de la (c) și $P(A)=4/9$. În care dintre cele patru cazuri informațiile sunt suficiente pentru a calcula $P(B\mid A)$? Există informații superflue?

**Fields:** `a` tf `nu`; `b` tf `nu`; `c` tf `da`; `d` tf `da`; `sup` choice "Informația superfluă este..." ✓ `P(A)=4/9 din cazul (d)`; ✗ `P(A|B̄)=1/3 din cazul (b)`; ✗ `P(B)=1/3 din cazul (c)`. Extra checks `[calculat]` (the book gives no numbers): `v` frac "$P(B\mid A)$ în cazul (c)" `1/2`; `pa` frac "$P(A)$ calculat din cazul (c)" `4/9`.

**Hints:** 1) Scrie formula lui Bayes cu numitorul din formula totală. 2) Ai nevoie de trei numere: $P(A\mid B)$, $P(A\mid\bar B)$, $P(B)$. 3) În (d) poți calcula $P(A) = \frac23\cdot\frac13+\frac13\cdot\frac23 = \frac49$, deci e dedus din celelalte.

**Worked solution (book):** $P(B\mid A) = \dfrac{P(A\mid B)P(B)}{P(A\mid B)P(B)+P(A\mid\bar B)(1-P(B))}$. Cazurile (c) și (d) au toate cele trei numere; (a) și (b) nu au $P(B)$ (nici prior). În (d), $P(A)=4/9$ este superfluă (se deduce). Numeric (c): $P(B\mid A)=\frac{2/9}{4/9}=\frac12$.

**Detectors:** `b` = `da` → "În (b) lipsește $P(B)$, probabilitatea a priori; fără ea posteriorul nu e determinat (același test, priori diferite: Lecția 2, exemplul cu boala la jumătate din populație)." `sup` = `P(B)=1/3` → "P(B) este prior-ul, fără el nu merge Bayes; superfluu e P(A), care rezultă din formula totală."

#### L2.e2 (optional): ex. 0.7 (B:28), `[caiet]`, answer status book

**Enunț:** Un student fie știe răspunsul la o întrebare adevărat/fals (probabilitate $p$), fie ghicește ($1-p$). Răspunde corect cu probabilitatea 1 dacă știe și 0,5 dacă ghicește. Exprimați în funcție de $p$ probabilitatea $P(\text{knew}\mid\text{correct})$.

**Fields:** `f` choice: ✓ $\dfrac{2p}{p+1}$; ✗[uită ponderea ghicitului] $\dfrac{p}{p+0{,}5}$ (the guess branch has probability $0{,}5(1-p)$, not $0{,}5$); ✗[prior] $p$ (a correct answer is evidence that raises the probability of "knew"). `n1` frac $p=1/2$ → `2/3`; `n2` frac $p=0{,}8$ → `8/9` (`[construit]`, from the printed formula).

**Hints:** 1) Evenimentele: correct, knew, guess = non-knew. 2) $P(\text{correct}) = 1\cdot p + 0{,}5(1-p)$. 3) $\dfrac{1\cdot p}{1\cdot p + 0{,}5(1-p)}$.

**Worked solution (book):** $\dfrac{p}{0{,}5p+0{,}5}=\dfrac{2p}{p+1}$.

#### L2.e3: ex. 0.90 (B:216), answer status verified-twice

**Enunț:** O urnă conține $w$ bile albe și $b$ bile negre. Extragem o bilă la întâmplare, o punem înapoi împreună cu alte $d$ bile de aceeași culoare, apoi extragem încă o bilă. **a.** Arătați că probabilitatea ca a doua bilă să fie albă nu depinde de $d$. **b.** Particularizați pentru $w=2$, $b=3$, $d=7$.

**Fields:** `a` choice "$P(\text{a doua albă})$": ✓ $\dfrac{w}{w+b}$; ✗[doar ramura "prima albă"] $\dfrac{w+d}{w+b+d}$; ✗[numitor cu d] $\dfrac{w}{w+b+d}$. `p1` frac $P(W_2\mid W_1)$ for the data `3/4` (9/12); `p2` frac $P(W_2\mid B_1)$ `1/6` (2/12); `b` frac `2/5`.

**Hints:** 1) Împarte după culoarea primei bile: formula probabilității totale. 2) După prima bilă albă urna are $w+b+d$ bile, din care $w+d$ albe; după una neagră, $w+b+d$ bile din care $w$ albe. 3) $\dfrac{w}{w+b}\cdot\dfrac{w+d}{w+b+d}+\dfrac{b}{w+b}\cdot\dfrac{w}{w+b+d}$.

**Worked solution:** $P(W_2) = \dfrac{w(w+d)+bw}{(w+b)(w+b+d)} = \dfrac{w(w+b+d)}{(w+b)(w+b+d)} = \dfrac{w}{w+b}$: $d$ cancels. With $w=2,b=3,d=7$: $\frac25\cdot\frac9{12}+\frac35\cdot\frac2{12} = \frac3{10}+\frac1{10}=\frac25$. Culegerea nu dă răspunsul; verificat de două ori.

**Detectors:** `b` = `3/4` → "Aceasta este $P(W_2\mid W_1)$, doar ramura 'prima albă'; formula totală adună și ramura 'prima neagră'." `b` = `3/10` → "Ai adunat doar ramura albă-albă; lipsește ramura neagră-albă ($1/10$)." (a) ✗ options explain: with $\frac{w+d}{w+b+d}$ the learner kept the conditional only.

#### L2.e4: ex. 0.93 (B:217), answer status verified-twice (proof)

**Enunț:** $B_1,\dots,B_k$ formează o partiție a lui $\Omega$; $P(A)>0$. Arătați că dacă $P(B_1\mid A) < P(B_1)$, atunci $P(B_i\mid A) > P(B_i)$ pentru cel puțin un $i \in \{2,\dots,k\}$. Indicații (de dovedit în ordine): (a) $\sum P(B_i)=1$; (b) $\sum P(B_i\cap A)=P(A)$; (c) $P(B_i\mid A)P(A)=P(B_i\cap A)$; (d) $\sum P(B_i\mid A)=1$; (e) $P(B_i\cap A)+P(B_i\cap\bar A)=P(B_i)$.

**Proof screens:** 1. (a) "Ce proprietate dă $\sum P(B_i)=1$?" ✓ aditivitate numărabilă pe o partiție + $P(\Omega)=1$. 2. (b) $A=\bigcup_i (A\cap B_i)$ disjoint, so $\sum_i P(B_i\cap A)=P(A)$ (varianta formulei totale). 3. (c) regula de înmulțire. 4. (d) divide (b) by $P(A)$ using (c): $\sum_i P(B_i\mid A)=1$. 5. Suppose, by contradiction, $P(B_i\mid A)\le P(B_i)$ for every $i\ge2$. 6. Then $1 = P(B_1\mid A)+\sum_{i\ge2}P(B_i\mid A) < P(B_1)+\sum_{i\ge2}P(B_i) = 1$: contradiction. ∎ Prediction at step 5: "Ce presupunem pentru a face contradicția?" ✓ că pentru toți $i\ge2$, $P(B_i\mid A)\le P(B_i)$. ✗[negare greșită] "pentru toți $i\ge2$, $P(B_i\mid A)<P(B_i)$": the negation of "at least one is larger" is "none is larger" ($\le$), and a strict inequality is not needed.
**Fields (numeric end check, `[construit]`):** `e` frac "Pentru o partiție $B_1,B_2,B_3$ cu $P(B_i)=1/3$ și $P(B_1\mid A)=1/6$, $P(B_2\mid A)=1/6$: cât trebuie să fie $P(B_3\mid A)$?" `2/3` (it exceeds 1/3, as the claim says).
**Status:** the book gives no answer (propuse); the proof is the one in the content map, logic checked (`verified-answers`: "proof logic").

#### L2.e5: ex. 0.94 (B:217), answer status verified-twice

**Enunț:** Într-o grupă de creșă, 30% dintre copii au ochi căprui, 50% albaștri, 20% alte culori. Pentru prima rundă a unui joc, educatoarea selectează 65% dintre copiii cu ochi căprui, 82% dintre cei cu ochi albaștri și 50% dintre ceilalți. Care este probabilitatea ca un copil ales la întâmplare să aibă ochi albaștri, dacă știm că **nu** a fost selecționat?

**Fields:** `n` frac "$P(\text{neselecționat})$" `59/200` (= 0,295); `r` frac `18/59` (≈ 0,3051, tol ±0,0005).

**Hints:** 1) Rata de neselecție în fiecare grup: 35%, 18%, 50%. 2) $P(\text{nesel.}) = 0{,}3\cdot0{,}35+0{,}5\cdot0{,}18+0{,}2\cdot0{,}5$. 3) $P(\text{albaștri}\mid\text{nesel.}) = \dfrac{0{,}5\cdot0{,}18}{P(\text{nesel.})}$.

**Worked solution:** neselecționați: căprui 0,35; albaștri 0,18; altele 0,50. Formula totală: $0{,}105+0{,}09+0{,}1=0{,}295$. Bayes: $\dfrac{0{,}09}{0{,}295}=\dfrac{18}{59}\approx0{,}3051$. Culegerea nu dă răspunsul; verificat de două ori.

**Detectors:** `0,5816` (82/141) → "Ai folosit procentele de **selecție** (0,65; 0,82; 0,50); întrebarea cere cei neselecționați: complementele 0,35; 0,18; 0,50." `0,09` → "Ai uitat numitorul: împarte la $P(\text{nesel.})=0{,}295$." `0,18` → "Aceasta este $P(\text{nesel.}\mid\text{albaștri})$, verosimilitatea, nu posteriorul."

#### L2.e6: ex. 0.95 (B:218), answer status verified-twice

**Enunț:** Urna 1: 11 bile albe, 4 roșii. Urna 2: 8 albe, 5 roșii. Alegem o urnă la întâmplare (probabilitate uniformă), apoi extragem o bilă din ea. Dacă bila extrasă e albă, care este probabilitatea să provină din prima urnă?

**Fields:** `pw` frac "$P(\text{albă})$" `263/390` (≈ 0,6744; the seminar asks it as part a, Cn-s1:6); `r` frac `143/263` (≈ 0,5437).

**Hints:** 1) $P(\text{albă}\mid U_1)=11/15$, $P(\text{albă}\mid U_2)=8/13$, $P(U_i)=1/2$. 2) Numitorul: $\frac12\cdot\frac{11}{15}+\frac12\cdot\frac{8}{13}$. 3) $\dfrac{\frac12\cdot\frac{11}{15}}{\frac12\cdot\frac{11}{15}+\frac12\cdot\frac{8}{13}}=\dfrac{143}{143+120}$.

**Worked solution:** $P(U_1\mid\text{albă}) = \dfrac{11/15}{11/15+8/13} = \dfrac{143}{263}\approx 0{,}5437$. Culegerea nu dă răspunsul; verificat de două ori.

**Detectors:** `11/15` (0,7333) → "Ai dat $P(\text{albă}\mid U_1)$; întrebarea e $P(U_1\mid\text{albă})$, condiționata inversă; cele două diferă (0,73 față de 0,54)." `11/19` (0,579) → "Ai numărat bilele albe din ambele urne (11 din 19), dar urnele nu au același conținut (15 și 13 bile), iar alegerea urnei e la fel de probabilă pentru fiecare, nu proporțională cu bilele." `1/2` → "Aceasta este probabilitatea a priori a urnei 1; bila albă o schimbă."

#### L2.e7: ex. 0.96 (B:218), answer status verified-twice

**Enunț:** Adevărat sau fals, cu justificare riguroasă (contraexemplu pentru false; tipul proprietății pentru adevărate): **a.** $P(A\cup B\cup C)\ge P(A)+P(B)+P(C)$. **b.** $P(A\mid B,C)=\dfrac{P(B\mid A,C)\,P(A\mid C)}{P(B\mid C)}$. **c.** $P(A\mid C)=\sum_{i=1}^n P(A,B_i\mid C)$, cu $B_i\cap B_j=\emptyset$, $\bigcup B_i=\Omega$. **d.** $P(A\mid C)=\sum_{i=1}^n P(A\mid B_i,C)\,P(B_i\mid C)$, cu aceleași $B_i$.

**Fields:** `a` tf `fals`; `b` tf `adevărat`; `c` tf `adevărat`; `d` tf `adevărat`; `bt` choice "tipul (b)" ✓ `formula lui Bayes, varianta condiționată`; `ct` choice "tipul (c) și (d)" ✓ `formula probabilității totale, varianta condiționată`. Counterexample fields for (a), with $A=B=C$, $P(A)=1/2$: `a1` frac "$P(A\cup B\cup C)$" `1/2`; `a2` frac "$P(A)+P(B)+P(C)$" `3/2` (`[construit]`).

**Hints:** 1) Pentru (b)-(d): fiecare formulă e cunoscută din Lecția 1-2, cu "dat C" adăugat în toate probabilitățile. 2) (b): $P(A\mid B,C)=\dfrac{P(A,B\mid C)}{P(B\mid C)}$ și $P(A,B\mid C)=P(B\mid A,C)P(A\mid C)$ (exercițiul 0.14, Lecția 1). 3) (c)-(d): evenimentele $A\cap B_i$ sunt disjuncte și reuniunea lor este $A$ (dat C).

**Worked solution:** (a) false: the union bound goes the other way, $P(A\cup B\cup C)\le P(A)+P(B)+P(C)$; $A=B=C$ with $P=1/2$ gives $1/2<3/2$. (b) true: conditional Bayes: $P(A,B\mid C)=P(A\mid B,C)P(B\mid C)=P(B\mid A,C)P(A\mid C)$, then divide by $P(B\mid C)$. (c) true: conditional marginalization over a partition, $A\cap B_i$ disjoint with union $A$. (d) true: each term of (c) is $P(A\mid B_i,C)P(B_i\mid C)$ by 0.14. The footnote of the book allows relaxing $\bigcup B_i=\Omega$ to $P(\bigcup B_i)=1$ or $A\subseteq\bigcup B_i$ (B:218). Culegerea nu dă răspunsul; verificat de două ori.

**Detector:** `a` = `adevărat` → "Inegalitatea e pe dos. Suma $P(A)+P(B)+P(C)$ numără suprapunerile de mai multe ori, deci ≥ reuniunea."

### L2 visual spec: `ml-viz-freq-tree` (probability tree with natural frequencies)

- **Data (parameters editable by the lesson, not by the learner):** population $N=10\,000$; prevalence $0{,}01$; detection $0{,}9$ ($P(\text{poz}\mid\text{boală})$); false positive rate $0{,}09$ ($P(\text{poz}\mid\text{sănătos})$).
- **Steps (manual advance; each preceded by a numeric prediction):** root 10 000; level 1: 100 boală / 9 900 sănătoși; level 2: 90 poz + 10 neg under boală, 891 poz + 9 009 neg under sănătoși; highlight the two positive leaves (90 and 891) and show the fraction $90/981$; then a toggle "arată probabilitățile": each branch gets its probability (0,01 / 0,99 / 0,9 / 0,09), each leaf its product (0,009; 0,0891), and the fraction $0{,}009/(0{,}009+0{,}0891)$ is aligned with the Bayes formula of L2.s07.
- **Second configuration (L2.s10):** prevalence $0{,}5$, same test: leaves 4 500 / 450; fraction $4500/4950 = 10/11$.
- **Learner predicts:** each node count in turn (100, 90, 891, 981) and the final fraction.
- **Reduced motion:** counts appear without growth animation. Integer counts only (that is why $N=10\,000$).

### L2 builder notes

- Sources: FND:6, ML6:4 (not needed here; hypotheses belong to L19), B:27-28 (0.6, 0.7), B:216-218 (0.90-0.96), Cn-s1:6 (the urns), T20a 1.2 (prove total probability), T20b 3.1 and T21P item 9 (Bayes word problems; their numbers are not reused).
- Numbers: all `[construit]` values (screening, factory, q2, q4, 0.7 numerics) were recomputed with exact fractions; the printed-book ones are only formulas.
- Uncertain: the term "verosimilitate" for $P(A\mid B)$ is natural in the course (ML6 uses "likelihood") but is not printed next to Bayes in FND:6; keep it as a label, not as a quotation.
- Repetition check: the screening example appears in the question, the tree, the rule footnote line and the why (as a prevalence change); the explanation is given once (the tree).

---

## Lecția 3 (`ml-l03`): Independența evenimentelor și independența condiționată

**Priority B.** **Concepts (3):** (1) independența evenimentelor (forma cu produs și forma cu probabilitate condiționată; nu se confundă cu evenimente disjuncte); (2) independența condiționată a evenimentelor (ambele forme); (3) cele două presupuneri implicite: echiprobabilitate și independență. **Prerequisites:** vezi Lecția 1 (probabilitate condiționată, regula de înmulțire, regula de adunare, ex. 0.1.a, 0.14).

**Does not teach:** the dependent-but-conditionally-independent example (L6, decision 3); random-variable independence (L5).

### L3 screens: opening question

**L3.s01** (question, number field; data on the same screen)
> Evenimentele A și B **nu pot avea loc împreună**. Știm că $P(A) = 0{,}3$ și $P(B) = 0{,}5$. Aflăm că **A s-a întâmplat**. Cât devine probabilitatea lui B?

Expected `0`. Typical wrong value `0,5` ("nu are legătură"). After the answer: "Păstrează răspunsul; vezi mai departe ce înseamnă că două evenimente nu au legătură." `[construit]`; the misconception is in `allocation.md` L3 and `seminar-and-errors` B3 item 1.

### L3 screens: worked example (Cn-s1:7, `[seminar]`)

**L3.s02** (prediction)
> Probabilitatea ca studentul X să ia 6 puncte la un test este 0,5. Pentru studentul Y este 0,2. Nu știm nimic altceva. Cât este probabilitatea ca **amândoi** să ia 6 puncte?

Correct `0,1` ($0{,}5\cdot0{,}2$). Reveal: with no other information we **assume** the events do not influence each other (independent) and multiply. The answer is an assumption, not a fact; the next screen shows what happens when the problem gives more data.

**L3.s03** (viz `ml-viz-indep-2x2`, step by step)
> Acum ni se spune că probabilitatea ca **amândoi** să ia 6 puncte este **0,11**. Mai sunt evenimentele "X ia 6" și "Y ia 6" independente?

Predictions: product $0{,}5\cdot0{,}2 = 0{,}1$; compare to 0,11: `nu`. Reveal in the 2×2 table (cells 0,11; 0,39; 0,09; 0,41), plus the conditional form: $P(Y\mid X) = 0{,}11/0{,}5 = 0{,}22 \ne 0{,}2 = P(Y)$; knowing that X took 6 raises Y's probability from 0,2 to 0,22. The difference looks small, but the equality must be exact: 0,11 is not "aproape" 0,1.

**L3.s04** (prediction; `[construit]`)
> Fie C evenimentul "testul a fost ușor". Dat C: $P(X \mid C) = 0{,}8$, $P(Y \mid C) = 0{,}5$ și $P(X \cap Y \mid C) = 0{,}4$. Sunt X și Y independente **dat C**, adică independente în lumea în care C s-a întâmplat?

Correct `da`: $0{,}8 \cdot 0{,}5 = 0{,}4$. Second prediction: "Cât este $P(X \mid Y, C)$?" Correct `0,8` ($0{,}4/0{,}5$), equal to $P(X\mid C)$: both forms agree.

### L3 screens: rules

**L3.s05** (definition)
> **Evenimente independente.** A și B sunt independente dacă aflarea lui B nu schimbă probabilitatea lui A. Două forme:
> - **forma cu produs:** $P(A \cap B) = P(A)\,P(B)$;
> - **forma cu probabilitate condiționată:** $P(A \mid B) = P(A)$, pentru $P(B) \ne 0$.
>
> Pentru $P(B) \neq 0$ cele două forme sunt echivalente (din $P(A\mid B) = P(A\cap B)/P(B)$). Forma cu produs acoperă și cazul $P(B) = 0$, când $P(A\mid B)$ nu există; de aceea e definiția pe care o folosim.

Footnote: "Cursul: slide 7. Seminar 1, p. 7. Culegerea: p. 25, p. 217." Builder: decision 5 (naming by formula, conflict C-6; the 2021 partial barem awards a bonus for stating both forms and says the conditional form was the one required in that exercise, `tests/2021-2022-partial1-ro/barem.pdf`).

**L3.s06** (callout trap)
> **Independent nu înseamnă disjunct.** Dacă A și B sunt independente și ambele au probabilitate pozitivă, atunci $P(A \cap B) = P(A)P(B) > 0$, deci ele **se pot întâmpla împreună**; nu pot fi disjuncte. Invers, evenimente disjuncte cu probabilități pozitive sunt cât se poate de dependente: aflând A, probabilitatea lui B devine 0.

Builder: this screen is the payoff of L3.s01.

**L3.s07** (learn)
> **Reuniunea evenimentelor independente.** Din regula de adunare (Lecția 1): $P(A \cup B) = P(A) + P(B) - P(A \cap B)$. Dacă A și B sunt independente: $P(A \cup B) = P(A) + P(B) - P(A)\,P(B)$.

Footnote: "T21S, 4a" (builder only).

**L3.s08** (definition)
> **Independență condiționată.** A și B sunt independente condiționat de C (se scrie $A \perp B \mid C$) dacă:
> - **forma cu produs:** $P(A, B \mid C) = P(A \mid C)\,P(B \mid C)$, pentru $P(C) \ne 0$;
> - **forma cu probabilitate condiționată:** $P(A \mid B, C) = P(A \mid C)$, pentru $P(B, C) \ne 0$.
>
> Cele două forme sunt echivalente (se dovedește în exercițiul 0.92, mai jos).

Footnote: "Cursul: slide 7. Culegerea: p. 39." Builder: the two forms are FND:7 and B:39; the proof of the equivalence is L3.e5 (0.92).

**L3.s09** (learn + callout)
> **Două presupuneri când nu ai altă informație.** (1) Rezultatele experimentului sunt **echiprobabile** (cazul uniform, Lecția 1). (2) Evenimentele sunt **independente**. Exemplul cu X și Y de mai sus a început exact așa.
>
> Sunt presupuneri, nu fapte: dacă problema dă o probabilitate care le contrazice (0,11 în loc de 0,1), presupunerea cade.

Footnote: "Seminar 1, p. 4, 7, 8." (`[seminar]`: "you can consider equiprobability the first assumption", "independence the second assumption … an ML algorithm does this".) Builder: no forward reference to Naive Bayes in learner text.

### L3 screen: why

**L3.s10** (reflect)
> De ce preferăm ca definiție **forma cu produs** $P(A\cap B)=P(A)P(B)$, deși $P(A\mid B)=P(A)$ pare mai apropiată de ideea de "nu se influențează"?

Answer: $P(A\mid B)$ is defined only when $P(B)\ne0$, and the product form is symmetric and always defined. It also covers events of probability 0, a case the conditional form cannot even state when $P(B)=0$; what happens then is exercise 0.91.b below (the answer is not given here).

### L3 screens: retrieve (4 items; new numbers)

**L3.q1** Două evenimente independente, cu probabilități pozitive. Pot fi disjuncte?
- ✓ Nu: $P(A\cap B)=P(A)P(B)>0$, deci se întâmplă uneori împreună.
- ✗[independent = fără nimic în comun] Da, independente înseamnă că nu au nimic în comun. Explanation: independența e despre probabilități (aflând A, P(B) nu se schimbă), nu despre elemente comune; disjuncte cu probabilități pozitive sunt dependente.
- ✗[o probabilitate mică ajută] Da, dacă una dintre probabilități e foarte mică. Explanation: produsul a două numere pozitive e pozitiv oricât de mici ar fi.

**L3.q2** $P(A) = 0{,}4$, $P(B) = 0{,}3$, $P(A \cap B) = 0{,}13$. Sunt A și B independente?
- ✓ Nu: $0{,}4\cdot0{,}3 = 0{,}12 \ne 0{,}13$. `[construit]`
- ✗[aproximativ independente] Da, 0,13 e aproape 0,12. Explanation: egalitatea trebuie să fie exactă; $P(A\mid B)=0{,}13/0{,}3\approx0{,}433\ne0{,}4$.
- ✗[condiție necesară luată drept suficientă] Da, pentru că $0{,}13 \le \min(0{,}4;\,0{,}3)$. Explanation: orice intersecție respectă această margine; nu are legătură cu independența.

**L3.q3** A și B sunt independente, $P(A) = 0{,}2$, $P(B) = 0{,}5$. Cât este $P(A \cup B)$?
- ✓ 0,6 ($0{,}2 + 0{,}5 - 0{,}1$). `[construit]`
- ✗[uită intersecția] 0,7: suma simplă numără $A\cap B$ de două ori; pentru evenimente independente $P(A\cap B)=0{,}2\cdot0{,}5=0{,}1$, care se scade.
- ✗[produsul în loc de reuniune] 0,1: aceasta este $P(A\cap B)$, intersecția, nu reuniunea.

**L3.q4** Enunțul spune doar: $P(A)=0{,}3$ și $P(B)=0{,}4$, fără nimic despre legătura dintre $A$ și $B$. Un coleg scrie $P(A\cap B)=0{,}12$. Ce a făcut? (`[construit]`)
- ✓ A folosit presupunerea implicită de independență ($0{,}3\cdot0{,}4$); e corectă cât timp enunțul nu dă o informație care o contrazice.
- ✗[presupunerea luată drept regulă generală] "A aplicat o formulă valabilă pentru orice două evenimente": $P(A\cap B)=P(A)P(B)$ este chiar definiția independenței; la evenimente dependente nu e adevărată (vezi exemplul cu 0,11 din lecție).
- ✗[fără informație, intersecția e 0] "A greșit: fără altă informație, $P(A\cap B)=0$": 0 ar însemna evenimente incompatibile, o presupunere mult mai tare și deloc implicită; presupunerea implicită a cursului este independența.

Builder: "$P(A)=0$ ⇒ independent of everything" is exercise 0.91.b (L3.e4) and is not asked in the quiz.

### L3 exercises

#### L3.e1: ex. 0.4 (B:25-26), `[caiet]`, answer status book (Seminarul Special, week 2)

**Enunț:** Două evenimente A și B sunt independente statistic dacă $P(A\cap B)=P(A)P(B)$. **a.** Arătați că dacă A și B sunt independente, atunci A și $\bar B$ sunt independente, iar $\bar A$ și $\bar B$ sunt independente. **b.** Dacă A este independent în raport cu el însuși, ce puteți spune despre $P(A)$?

**Proof screens.**
- (a, first pair) 1. "Cu ce proprietate începem?" ✓ $P(A\cap\bar B)=P(A)-P(A\cap B)$ (ex. 0.1.a, vezi Lecția 1). ✗[reuniunea] $P(A\cap\bar B)=P(A)+P(\bar B)-P(A\cup\bar B)$: true but it leads away from independence of A and B. 2. Use independence of A and B: $=P(A)-P(A)P(B)$. 3. Factor: $=P(A)(1-P(B))=P(A)P(\bar B)$. So A and $\bar B$ are independent.
- (a, second pair) 1. $P(\bar A\cap\bar B)=P(\bar B)-P(A\cap\bar B)$ (0.1.a applied to $\bar B$ and A). 2. Replace $P(A\cap\bar B)=P(A)P(\bar B)$ (just proved). 3. $=P(\bar B)(1-P(A))=P(\bar A)P(\bar B)$.
- (b) 1. Independence of A with itself: $P(A\cap A)=P(A)P(A)$. 2. $P(A)=[P(A)]^2$, so $P(A)[P(A)-1]=0$. 3. Hence $P(A)=0$ or $P(A)=1$.

**Fields:** `a1` frac "$P(A\cap\bar B)$ pentru $P(A)=0{,}3$, $P(B)=0{,}5$ independente" `3/20` (0,15); `a2` frac "$P(\bar A\cap\bar B)$" `7/20` (0,35) (both `[construit]`); `b` choice "$P(A)$ poate fi" ✓ `0 sau 1`; ✗[A=∅ sau A=Ω] `A = ∅ sau A = Ω` (book trap: "nu rezultă neapărat că A = ∅ respectiv A = Ω"); ✗[jumătate] `1/2`.

**Hints:** 1) Folosește $P(A\cap\bar B)=P(A)-P(A\cap B)$. 2) Înlocuiește $P(A\cap B)$ cu produsul. 3) Pentru (b): scrie independența lui A cu A: $P(A\cap A)=P(A)^2$ și rezolvă ecuația.

**Detectors:** `a1` = `0,35` → "Ai calculat $P(\bar A\cap\bar B)=0{,}7\cdot0{,}5$; întrebarea e $P(A\cap\bar B)=0{,}3\cdot0{,}5$." `a1` = `0,2` → "$P(A)-P(B)$ nu e o formulă; folosește $P(A)-P(A\cap B)=0{,}3-0{,}15$."

#### L3.e2: ex. 0.5 (B:26-27), `[caiet]`, answer status book

**Enunț:** Robert și Alina dau cu banul alternativ, Alina prima; primul care obține stema câștigă jocul. **a.** Dacă $P(\text{stemă})=1/2$, care este probabilitatea ca Alina să câștige? (Indicații: enumeră situațiile în care câștigă; $\sum_{i\ge0}a^i=\frac1{1-a}$ pentru $a\in[0,1)$.) **b.** Aceeași întrebare pentru $P(\text{stemă})=p\in(0,1]$. **c.** Cum ai alege să intri în joc: primul sau al doilea?

**Fields:** `p1` frac "$P(A_1)$: Alina câștigă la aruncarea 1" `1/2`; `p3` frac "$P(A_3)$: la aruncarea 3" `1/8`; `rho` frac "raportul dintre doi termeni consecutivi ai seriei" `1/4`; `a` frac `2/3`; `b` choice ✓ $\dfrac1{2-p}$; ✗[simetrie falsă] $\dfrac12$; ✗[doar prima aruncare] $p$; `bn` frac "pentru $p=1/5$" `5/9` (`[construit]` from the printed formula); `c` choice ✓ `primul`; ✗ `al doilea`; ✗ `e indiferent`.

**Hints:** 1) Alina poate câștiga la aruncarea 1, 3, 5, …; evenimentele $A_1, A_3, A_5,\dots$ sunt disjuncte, deci probabilitățile se adună (aditivitate numărabilă). 2) Pentru a câștiga la aruncarea $2i+1$, primele $2i$ aruncări (ale ambilor) trebuie să nu dea stemă, independent, și a $(2i+1)$-a să dea: $(1-p)^{2i}p$. 3) Suma este $p\sum_i\bigl[(1-p)^2\bigr]^i = \dfrac{p}{1-(1-p)^2}$.

**Worked solution (book):** $P(A_{2i+1}) = (1-p)^{2i}p$. For $p=1/2$: $\sum_i (1/2)^{2i+1} = \frac12\cdot\frac1{1-1/4}=\frac23$ (Alina is twice as likely as Robert to win only because she throws first). General: $P(A)=p\cdot\frac1{1-(1-p)^2}=\frac{p}{2p-p^2}=\frac1{2-p}$. For $c$: $\frac1{2-p}\ge\frac12$ for $p\ge0$, so play first.

**Detectors:** `a` = `1/2` → "Ai numărat doar prima aruncare. Alina mai poate câștiga la aruncările 3, 5, …: $1/2+1/8+1/32+\dots$." `a` = `1` → "Ai folosit raportul 1/2 în loc de 1/4: între două șanse ale Alinei sunt două aruncări fără stemă, $(1/2)^2$." `a` = `1/3` → "Aceasta e probabilitatea ca Robert să câștige."

#### L3.e3: ex. 0.89 (B:216), answer status verified-twice

**Enunț:** Doi soldați A și B trag la țintă. Probabilitatea ca A să greșească este 1/5, ca B să greșească 1/2, iar ca ambii să greșească simultan 1/10. **a.** Care este probabilitatea ca cel puțin unul dintre soldați să greșească? **b.** Dar ca exact unul să greșească?

**Fields:** `a` frac `3/5` (0,6); `b` frac `1/2` (0,5).

**Hints:** 1) "Cel puțin unul" este reuniunea celor două evenimente. 2) Regula de adunare: $\frac15+\frac12-\frac1{10}$. 3) "Exact unul" = reuniunea fără cazul "ambii": scade încă o dată $P(\text{ambii})$.

**Worked solution:** (a) $P(a\cup b)=P(a)+P(b)-P(a\cap b)=\frac15+\frac12-\frac1{10}=\frac6{10}=\frac35$. (b) exact unul $=P(a\cup b)-P(a\cap b)=\frac6{10}-\frac1{10}=\frac12$. Side note: $P(a)P(b)=\frac1{10}=P(a\cap b)$, so the two events are independent. Culegerea nu dă răspunsul; verificat de două ori.

**Detectors:** `a` = `7/10` → "Ai adunat $\frac15+\frac12$ și ai uitat să scazi intersecția $\frac1{10}$, numărată de două ori." `b` = `3/5` → "Aceasta este răspunsul de la (a), 'cel puțin unul'; 'exact unul' exclude și cazul în care ambii greșesc." `b` = `1/10` → "Aceasta este P(ambii)."

#### L3.e4: ex. 0.91 (B:216-217), answer status verified-twice (proofs)

**Enunț:** A și B evenimente. **a.** Arătați că $P(A\mid A,B)=1$. **b.** Arătați că dacă $P(A)=0$ atunci A și B sunt independente. **c.** Arătați că dacă $P(B)=1$ atunci $P(A\mid B)=P(A)$.

**Proof screens.**
- (a) 1. $P(A\mid A,B)=\dfrac{P(A\cap(A\cap B))}{P(A\cap B)}$ (definiția, cu condiția $A\cap B$). 2. $A\cap(A\cap B)=A\cap B$, deci raportul e 1. Condition to say: $P(A\cap B)>0$ (altfel $P(A\mid A,B)$ nu există). ✗[uită condiția] a step that divides without noting $P(A\cap B)>0$.
- (b) 1. "Ce margini are $P(A\cap B)$?" ✓ $0\le P(A\cap B)\le P(A)=0$ (monotonie, Lecția 1). 2. So $P(A\cap B)=0=P(A)P(B)$: forma cu produs.
- (c) 1. $P(B)=1\Rightarrow P(\bar B)=0$. 2. $P(A\cap\bar B)\le P(\bar B)=0$ (monotonie). 3. $P(A\cap B)=P(A)-P(A\cap\bar B)=P(A)$ (ex. 0.1.a). 4. $P(A\mid B)=P(A\cap B)/P(B)=P(A)/1$.

**Remark from the book (B:217):** if $P(B)\ne0$, $P(A\mid B)=P(A)$ gives $P(A\cap B)=P(A)P(B)$, so it is a "mai restrictivă" form (closer to intuition); the lesson names the forms by formula (decision 5).

**Fields (numeric end checks):** `a` num "$P(A\mid A,B)$" `1`; `b` num "dacă $P(A)=0$: $P(A\cap B)$" `0`; `c` frac "dacă $P(B)=1$ și $P(A)=0{,}3$: $P(A\mid B)$" `3/10` (`[construit]`).

**Hints:** 1) (a) Scrie definiția probabilității condiționate cu condiția "$A$ și $B$". 2) (b) Intersecția e inclusă în A. 3) (c) Complementul lui B are probabilitate 0.

**Detectors:** `c` = `1` → "$P(A\mid B)$ cu $P(B)=1$ nu face evenimentul sigur; rămâne $P(A)$, aici 0,3."

#### L3.e5: ex. 0.92 (B:217), answer status verified-twice (proof)

**Enunț:** Folosind doar definiția probabilității condiționate, arătați că dacă $P(A\mid B,C)=P(A\mid C)$ sau $P(B\mid A,C)=P(B\mid C)$ atunci $P(A,B\mid C)=P(A\mid C)\cdot P(B\mid C)$.

**Proof screens.** 1. "Ce egalitate leagă $P(A,B\mid C)$ de $P(A\mid B,C)$?" ✓ varianta condiționată a regulii de înmulțire, $P(A,B\mid C)=P(A\mid B,C)\,P(B\mid C)$ (ex. 0.14, vezi Lecția 1). ✗[fără condiția C] $P(A,B\mid C)=P(A\mid B)P(B\mid C)$: the condition C must stay in every factor. 2. Substitute the hypothesis $P(A\mid B,C)=P(A\mid C)$: $P(A,B\mid C)=P(A\mid C)P(B\mid C)$. 3. For the other hypothesis write the rule with A and B swapped: $P(A,B\mid C)=P(B\mid A,C)P(A\mid C)=P(B\mid C)P(A\mid C)$. ∎ Conclusion: the two forms of L3.s08 are equivalent (the converse direction follows by dividing by $P(B\mid C)$ when $P(B,C)\ne0$).

**Fields:** `f` choice "Care este egalitatea-cheie?" (same as step 1).

**Builder:** the book title names the two forms "slabă" and "tare"; the screen does not (decision 5).

### L3 visual spec: `ml-viz-indep-2x2` (independence check on a 2×2 table of events)

- **Data:** events X ("X ia 6"), Y ("Y ia 6"). $P(X)=0{,}5$, $P(Y)=0{,}2$, $P(X\cap Y)=0{,}11$. Cells: $X\cap Y=0{,}11$, $X\cap\bar Y=0{,}39$, $\bar X\cap Y=0{,}09$, $\bar X\cap\bar Y=0{,}41$. Products of marginals: $0{,}10$, $0{,}40$, $0{,}10$, $0{,}40$.
- **Steps:** (1) show the two marginals only, empty cells; the learner predicts the product $0{,}5\cdot0{,}2$ for the top-left cell (0,1). (2) reveal the real cell 0,11; mark the mismatch. (3) the learner predicts whether the other three cells match their products (none does); reveal 0,39 against 0,40, 0,09 against 0,10, 0,41 against 0,40; remark: for events one failed equation already decides, and the four cells fail or hold together (the reason is in ex. 0.4). (4) toggle "$P(X\cap Y)=0{,}10$": all four cells equal their products, independent.
- **Learner predicts:** the product (0,1) and the verdict.
- **Reduced motion:** cell values appear without count-up.

### L3 builder notes

- Sources: FND:7, B:25-27, B:39, B:216-217, Cn-s1:4, 7, 8 (assumptions; the seminar notes' final scheme p.8), T21S 4a, T21P (items 1, 7: independence from numbers).
- The Cn-s1:7 numbers (0,5; 0,2; 0,11) are `[seminar]`; the "test ușor" screen numbers and quiz numbers are `[construit]`.
- Uncertain: nothing numerical. The slide FND:7 states the conditional equivalence "when P(B∩C)≠0"; the seminar adds the strong/weak labels; no label is shown.
- Repetition check: 0.89 uses soldiers with new numbers; the soldiers of L1.s11 are a different problem (a multiplication-rule example) and are not repeated.

---

## Lecția 4 (`ml-l04`): Variabile aleatoare discrete: distribuție, medie, varianță; Bernoulli și binomială

**Priority B.** **Concepts (4):** (1) variabila aleatoare discretă: $\mathrm{Val}(X)$, p.m.f., c.d.f., funcție de variabilă (se aplică valorilor, nu probabilităților); (2) media $E[X]$ și liniaritatea ei; (3) varianța și abaterea standard: $\mathrm{Var}(aX+b)$, $\mathrm{Var}(X)=E[X^2]-E^2[X]$; (4) distribuțiile Bernoulli, binomială, categorială; variabila indicator. **Prerequisites:** vezi Lecția 1 (aditivitate, probabilitate condiționată); vezi Lecția 3 (independența evenimentelor, pentru "n aruncări independente").

**Does not teach:** pairs of variables, joint tables, covariance (L5). One sentence on densities only (L4.s11); continuous distributions are out of scope (allocation `out_of_scope`).

### L4 screens: opening question

**L4.s01** (question; data on the same screen; `[seminar]`, Cn-s2:5)
> Două jocuri cu o monedă corectă. **Jocul 1:** câștigi 1000 de lei la stemă, pierzi 1000 de lei la pajură. **Jocul 2:** câștigi 1 leu la stemă, pierzi 1 leu la pajură. Câștigul mediu este 0 în ambele jocuri. Care joc e mai riscant și cum ai pune riscul într-un singur număr?

Expected: Jocul 1; the number (any of): distanța pătrată medie față de medie, $10^6$ față de $1$ (or its square root, 1000 față de 1). Free-text self-check: the screen shows the expected answer and the learner marks "am avut/n-am avut". After it: "Păstrează ideea; revii la ea mai departe."

### L4 screens: worked example (Cn-s2:2-5, `[seminar]`)

**L4.s02** (prediction)
> Aruncăm 3 monede corecte. $\Omega$ are 8 rezultate (HHH, HHT, HTH, THH, HTT, THT, TTH, TTT). Fie $R$ = numărul de steme (H). Cât este $R(\text{HTH})$? Câte rezultate au $R=1$? Cât este $P(R=1)$?

Correct `2`; `3` (HTT, THT, TTH); `3/8` (rezultate echiprobabile). Reveal: a variable is a **function on outcomes**; "R=1" is an event (a set of outcomes).

**L4.s03** (prediction, table)
> Completează distribuția lui $R$: valorile posibile și probabilitatea fiecăreia. Cât este $P(R\in\{0,1\})$? Cât este funcția cumulativă $F(2)=P(R\le2)$?

Correct: $R$: 0, 1, 2, 3 cu 1/8, 3/8, 3/8, 1/8; $P(R\in\{0,1\})=1/8+3/8=1/2$ (the events $R=0$ and $R=1$ are disjoint); $F(0)=1/8$, $F(1)=1/2$, $F(2)=7/8$, $F(3)=1$ (`[seminar]`; $F$ values `[calculat]` from the pmf, recomputed).

**L4.s04** (prediction; `[seminar]`, Cn-s2:3)
> Fie $X$ cu valorile $-1, 0, 1$ și probabilitățile $\frac12, \frac14, \frac14$. Care este distribuția lui $X^2$? Dar a lui $2X$?

Correct: $X^2$ ia 0 cu $1/4$ și 1 cu $\frac12+\frac14=\frac34$ (valorile $-1$ și $1$ dau amândouă 1); $2X$ ia $-2, 0, 2$ cu $\frac12,\frac14,\frac14$. Reveal: apply the function to the **values**, never to the probabilities.

**L4.s05** (viz `ml-viz-pmf-cdf`, step by step; `[seminar]`, Cn-s2:4-5)
> Fie $X$ cu valorile $-1, 0, 1, 2$ și probabilitățile $\frac16, \frac16, \frac16, \frac12$. Care este media lui $X$ (punctul în care bara de distribuție stă în echilibru)? Care este varianța?

Predictions: $E[X]=-\frac16+0+\frac16+1=1$; deviations $X-1$: $-2,-1,0,1$; squares $4,1,0,1$; $\mathrm{Var}(X)=\frac46+\frac16+0+\frac12=\frac43$. A second prediction on the same screen: "Poate media să nu fie o valoare posibilă a variabilei?" Reveal with $R$ from L4.s03: $E[R]=0\cdot\frac18+1\cdot\frac38+2\cdot\frac38+3\cdot\frac18=\frac32$, a value $R$ never takes. Then the c.d.f. view: $F(1)=1/2$ (steps up at each value).

### L4 screens: rules

**L4.s06** (definition)
> **Variabila aleatoare** este o funcție $X : \Omega \to \mathbb{R}$. $\mathrm{Val}(X)$ este mulțimea valorilor ei. Dacă $\mathrm{Val}(X)$ este finită sau numărabilă, $X$ este **discretă**.
>
> **Funcția masă de probabilitate (p.m.f.):** $p(x) = P(X = x)$, cu $p(x) \ge 0$ și $\sum_x p(x) = 1$.
>
> **Funcția de distribuție cumulativă (c.d.f.):** $F(x) = P(X \le x)$, cu $F : \mathbb{R} \to [0,1]$.

Footnote: "Cursul: slide 8-9. Seminar 2, p. 4. Culegerea: p. 30." Builder: FND:8 prints the codomain of $F$ as $[0,\infty)$ (conflict C-1); the correct codomain is $[0,1]$ and the screen shows it.

**L4.s07** (learn + callout trap)
> **Funcție de variabilă.** Dacă $g$ este o funcție, $g(X)$ este tot o variabilă: ia valorile $g(x)$, cu probabilitatea valorii $x$ (probabilitățile valorilor care dau același $g(x)$ se adună). $E[g(X)] = \sum_x g(x)\,p(x)$.
>
> **Atenție.** $X + Y$ **nu** se poate afla din distribuțiile separate ale lui $X$ și $Y$. De exemplu, pentru $X$: 0, 1 cu $\frac12, \frac12$ și $Y$: 1, 2 cu $\frac13, \frac23$, probabilitatea $P(X+Y=2) = P(X{=}0, Y{=}2) + P(X{=}1, Y{=}1)$ cere informații în plus despre perechea $(X, Y)$, nu doar cele două distribuții separate.

Footnote: "Cursul: slide 14. Seminar 2, p. 3." Builder: no forward pointer on purpose; the joint distribution of a pair is taught in Lecția 5, which links back here.

**L4.s08** (definition)
> **Media:** $E[X] = \sum_x x\,p(x)$. **Liniaritatea:** $E[aX] = a\,E[X]$ și $E[X + Y] = E[X] + E[Y]$; mai general $E\left[\sum_i a_i X_i\right] = \sum_i a_i E[X_i]$. Pentru o funcție neliniară, în general $E[g(X)] \ne g(E[X])$.

Footnote: "Cursul: slide 9, 14. Culegerea: p. 30."

**L4.s09** (definition)
> **Varianța:** $\mathrm{Var}(X) = E\left[(X - E[X])^2\right]$; **abaterea standard** $\sigma = \sqrt{\mathrm{Var}(X)}$ (în unitățile lui $X$).
>
> Proprietăți: $\mathrm{Var}(X) = E[X^2] - E^2[X]$; $\mathrm{Var}(aX) = a^2\,\mathrm{Var}(X)$; $\mathrm{Var}(X + a) = \mathrm{Var}(X)$. Varianța nu este liniară: apare $a^2$, nu $a$.

Footnote: "Cursul: slide 14. Culegerea: p. 31."

**L4.s10** (definition)
> **Bernoulli:** $X \in \{0,1\}$, $P(X{=}1) = p$. $E[X] = p$, $\mathrm{Var}(X) = p(1-p)$.
>
> **Binomiala** $b(r; n, p)$: numărul de steme la $n$ aruncări independente ale unei monede cu $P(\text{stemă}) = p$: $b(r; n, p) = C_n^r\, p^r (1-p)^{n-r}$, $r = 0, \dots, n$. $E = np$, $\mathrm{Var} = np(1-p)$. Pentru $n = 1$ este Bernoulli.
>
> **Categorială:** $X$ ia valorile $v_1, \dots, v_k$ cu probabilitățile $\pi_1, \dots, \pi_k$ ($\sum \pi_i = 1$); cu două valori e Bernoulli.
>
> **Variabila indicator** a unui eveniment $A$: $1$ dacă $A$ are loc, $0$ altfel. Exemplu: $M = 1$ dacă cele 3 monede au căzut la fel (HHH sau TTT), $P(M{=}1) = 2/8$.

Footnote: "Cursul: slide 10. Seminar 2, p. 8-9. Culegerea: p. 17-18, 57." Builder: the $M$ example uses the Cn-s2:2 variable and `[calculat]` 2/8; the Bernoulli entropy formula of FND:10 is taught in L7.

**L4.s11** (learn, one sentence; see `allocation.md` L4)
> **Variabile continue.** Pentru o variabilă continuă funcția analoagă p.m.f. este **densitatea** (p.d.f.), iar valoarea ei într-un punct nu este o probabilitate.

Footnote: "Cursul: slide 8. Culegerea: p. 17." Builder: the reason $P(X=x)=0$ is the answer to ex. 0.23.a (L4.e4) and is not given here.

### L4 screen: why

**L4.s12** (reflect; payoff of L4.s01)
> În cele două jocuri de la început (câștigi sau pierzi 1000 de lei, respectiv 1 leu, cu o monedă corectă), abaterea medie față de medie, $E[X-E[X]]$, este 0 în ambele. De ce nu o folosim ca măsură a riscului? Ce folosim în loc?

Answer: positive and negative deviations cancel for **every** variable, $E[X-E[X]]=E[X]-E[X]=0$ (game 1: $\frac12\cdot1000+\frac12\cdot(-1000)=0$), so it cannot tell the games apart. Squaring makes every deviation positive: $\mathrm{Var}=\frac12\cdot1000^2+\frac12\cdot1000^2=1\,000\,000$ for game 1 and $1$ for game 2. The unit becomes lei², so we take $\sigma=\sqrt{\mathrm{Var}}$: 1000 lei and 1 leu. (Cn-s2:5; the seminar adds that $E|X-E[X]|$ is harder to compute with.)

### L4 screens: retrieve (4 items; new numbers)

**L4.q1** $X$ ia valorile $-1, 1, 2$ cu probabilitățile $\frac14, \frac14, \frac12$. Cât este $E[X^2]$?
- ✓ 2,5 ($1\cdot\frac14+1\cdot\frac14+4\cdot\frac12$). `[construit]`
- ✗[g(E[X])] 1: aceasta este $(E[X])^2$ ($E[X]=1$). $E[X^2]\ne(E[X])^2$, în afară de cazul în care varianța e 0; aici $\mathrm{Var}(X)=1{,}5$.
- ✗[funcția aplicată probabilităților] 0,375: ai ridicat la pătrat probabilitățile ($\frac1{16}+\frac1{16}+\frac14$); la pătrat se ridică valorile lui $X$, probabilitățile rămân aceleași.

**L4.q2** $E[X]=2$ și $E[Y]=5$; $X$ și $Y$ **nu** sunt independente. Cât este $E[3X-Y+1]$? (`[construit]`)
- ✓ 2 ($3\cdot2-5+1$): liniaritatea mediei nu cere independență.
- ✗[liniaritatea cere independență] "Nu se poate calcula fără distribuția comună": $E[aX+bY+c]=aE[X]+bE[Y]+c$ pentru **orice** variabile (ex. 0.9.a); independența contează la $E[XY]$, nu la sume.
- ✗[constanta ignorată] 1: constanta $+1$ se adună și ea la medie, $E[c]=c$.
- ✗[semnul lui Y pierdut] 12: $3\cdot2+5+1$; termenul este $-Y$, deci $-E[Y]$.

Builder: $\mathrm{Var}(aX+b)$ is not asked in the quiz: it is exercise 0.97 (L4.e9).

**L4.q3** $X$ este numărul de steme la 10 aruncări independente ale unei monede cu $P(\text{stemă}) = 0{,}3$. Cât este $\mathrm{Var}(X)$?
- ✓ 2,1 ($10\cdot0{,}3\cdot0{,}7$). `[construit]`
- ✗[varianța = media] 3: aceasta este media, $E[X]=np$; varianța binomialei este $np(1-p)$.
- ✗[p(1−p) fără n] 0,21: aceasta este varianța unei singure aruncări; pentru $n$ aruncări independente se înmulțește cu $n$.

**L4.q4** $X$ ia valorile 0, 1, 2 cu probabilitățile 0,2; 0,5; 0,3. Cât este $F(1)$?
- ✓ 0,7 ($P(X\le1)=0{,}2+0{,}5$). `[construit]`
- ✗[p.m.f. în loc de c.d.f.] 0,5: aceasta este $p(1)=P(X=1)$; $F(1)$ adună probabilitățile tuturor valorilor până la 1 inclusiv.
- ✗[coada opusă] 0,8: aceasta este $P(X\ge1)$; $F(x)=P(X\le x)$ adună de la stânga.

### L4 exercises

#### L4.e1: ex. 0.9.a (B:30-32), `[caiet]`, answer status book (proof)

**Enunț:** Pentru orice două variabile aleatoare discrete $W$ și $Z$ pe același $\Omega$ arătați că $E[W+Z]=E[W]+E[Z]$, și pentru orice constantă $a$: $E[aX]=aE[X]$. (Variabile cu mulțimi finite de valori, ca în nota 20 din culegere.)

**Proof screens (short proof, PS:3).** 1. "Cum scriem media folosind rezultatele?" ✓ $E[X]=\sum_{\omega\in\Omega}X(\omega)P(\omega)$ (grupăm rezultatele care dau aceeași valoare). ✗[fără probabilități] $E[X]=\sum_\omega X(\omega)$: lipsesc probabilitățile. 2. $(W+Z)(\omega)=W(\omega)+Z(\omega)$, deci $E[W+Z]=\sum_\omega(W(\omega)+Z(\omega))P(\omega)$. 3. Split the sum: $=\sum_\omega W(\omega)P(\omega)+\sum_\omega Z(\omega)P(\omega)=E[W]+E[Z]$. 4. $E[aX]=\sum_\omega aX(\omega)P(\omega)=a\sum_\omega X(\omega)P(\omega)=aE[X]$. ∎ Book's longer route for $E[aX]$ (B:32): $a\ne0$: substitute $x=u/a$ in $\sum_u uP(aX=u)$; $a=0$ trivial.

**Fields (numeric end check, `[construit]`):** pe $\Omega=\{\omega_1,\omega_2\}$ cu $P=\frac12$ fiecare, $W=(1,3)$, $Z=(2,0)$ (valorile în $\omega_1,\omega_2$): `e` num "$E[W+Z]$" `3`; `e2` num "$E[-2W]$" `-4`.

**Detector:** `e` = `4` → "Ai adunat valorile maxime; media este ponderată: $W+Z=(3,3)$, media 3."

#### L4.e2: ex. 0.9.b (B:31-33), `[caiet]`, answer status book (proof)

**Enunț:** Notăm $\bar X=E[X]$ și $\mathrm{Var}(X)=E[(X-\bar X)^2]$. Arătați că $\mathrm{Var}(X)=E[X^2]-(E[X])^2$ și că $\mathrm{Var}(aX)=a^2\mathrm{Var}(X)$.

**Proof screens.** 1. Expand: $(X-\bar X)^2=X^2-2\bar XX+\bar X^2$. 2. By linearity ($\bar X$ is a constant): $E[X^2]-2\bar XE[X]+\bar X^2=E[X^2]-2\bar X^2+\bar X^2=E[X^2]-\bar X^2$. Prediction at step 2: "Cât este $E[2\bar X X]$?" ✓ $2\bar X\,E[X]=2\bar X^2$. ✗[constantă în exterior] $2\bar X$: $E[X]$ nu dispare. 3. $\mathrm{Var}(aX)=E[(aX-E[aX])^2]=E[a^2(X-\bar X)^2]=a^2\mathrm{Var}(X)$ (uses $E[aX]=a\bar X$ from 0.9.a). Alternative (book): $E[a^2X^2]-(aE[X])^2=a^2(E[X^2]-(E[X])^2)$.

**Fields (`[construit]`):** $X$ ia 1 cu probabilitatea $\frac14$ și 3 cu $\frac34$: `m` num "$E[X]$" `2,5`; `q` num "$E[X^2]$" `7`; `v` num "$\mathrm{Var}(X)$" `0,75`. (No numeric check of $\mathrm{Var}(aX)$ here: that is exercise 0.97, L4.e9.)

**Hints:** 1) $E[X]=\frac14+\frac94$. 2) $E[X^2]=1\cdot\frac14+9\cdot\frac34$. 3) $\mathrm{Var}=7-6{,}25$.

**Detectors:** `v` = `1` → "Ai scăzut $E[X]=2{,}5$ dintr-un $E[X^2]$ greșit sau ai uitat să ridici media la pătrat: $7-2{,}5^2=0{,}75$."

#### L4.e3: ex. 0.12 (B:36), `[caiet]`, answer status book

**Enunț:** $X$ are $E[X]=\mu$ și $\mathrm{Var}(X)=\sigma^2$. **a.** Cât este $E[X(X-1)]$ în funcție de $\mu$ și $\sigma$? **b.** Pentru $c\in\mathbb{R}$, care dintre variantele următoare sunt adevărate? A. $E[(X-c)^2]=(\mu-c)^2+\sigma^2$; B. $(\mu-c)^2$; C. $(\mu-c)^2-\sigma^2$; D. $(\mu-c)^2+2\sigma^2$; E. $\mu^2+c^2+2\sigma^2$; F. $\mu^2+c^2-2\sigma^2$.

**Fields:** `a` choice ✓ $\sigma^2+\mu^2-\mu$; ✗[g(E[X])] $\mu^2-\mu$; ✗[fără $\mu^2$] $\sigma^2-\mu$. `an` num "pentru $\mu=3$, $\sigma^2=2$" `8` (`[construit]`). `b` multi ✓ `A`. `bn` num "$E[(X-5)^2]$ pentru $\mu=3$, $\sigma^2=2$" `6`.

**Hints:** 1) $E[X(X-1)]=E[X^2]-E[X]$ (liniaritate). 2) $E[X^2]=\mathrm{Var}(X)+(E[X])^2$. 3) (b) Dezvoltă $(X-c)^2=X^2-2cX+c^2$ și ia media.

**Worked solution (book):** (a) $E[X^2-X]=E[X^2]-E[X]=\sigma^2+\mu^2-\mu$. (b) $E[X^2]-2c\mu+c^2=\sigma^2+\mu^2-2c\mu+c^2=\sigma^2+(\mu-c)^2$: only A is true (the others are false in general). Numeric: $(3-5)^2+2=6$.

**Detectors:** `an` = `6` → "Ai calculat $g(\mu)=\mu(\mu-1)$; $E[g(X)]\ne g(E[X])$ pentru $g$ neliniară (lipsește $\sigma^2$)." `bn` = `4` → "Aceasta este varianta B, $(\mu-c)^2$: lipsește $\sigma^2$; media pătratelor abaterilor e mai mare decât pătratul abaterii mediei." `bn` = `2` → "Varianța nu se scade (varianta C); $(\mu-c)^2$ se adună cu $\sigma^2$."

**Builder:** the same quantity appears in T21S 4b with the false claim $(m-c)^2-s$ (C-9); do not reuse that statement here.

#### L4.e4: ex. 0.23.a (B:55-56), `[caiet]`, answer status book

**Enunț:** Adevărat sau fals: dacă o variabilă aleatoare continuă $X$ are densitatea $p$ diferită de zero pe tot domeniul de definiție, atunci probabilitatea ca $X$ să ia o valoare oarecare $x$ este $P(X=x)=p(x)$.

**Fields:** `tf` `fals`; `v` num "$P(X=x)$ pentru orice $x$, variabilă continuă" `0`.

**Hints:** 1) Pentru o variabilă continuă probabilitățile se calculează pe intervale: $P(a\le X\le b)=\int_a^b p(x)\,dx$. 2) Ia $a=b=x$. 3) Dacă $P(X=x)=p(x)$ și $P(X=x)=0$, atunci $p(x)=0$.

**Worked solution (book):** $P(a\le X\le b)=\int_a^bp$, so $P(X=x)=0$ for every $x$. The claim would give $p(x)=0$ everywhere, contradicting that $p$ is non-zero.

**Detector:** `tf` = `adevărat` → "Densitatea nu este o probabilitate: probabilitatea unui punct exact este 0 în cazul continuu."

#### L4.e5: ex. 0.24 (B:56-57), `[caiet]`, answer status book

**Enunț:** Un iepuraș pornește din originea axei și face salturi de lungime 1, spre dreapta dacă la aruncarea unei monede obține stema (probabilitate $p$), spre stânga în caz contrar. Care este poziția medie după $n$ salturi?

**Fields:** `m` frac "$E[X_i]$ pentru $p=2/3$ (un salt)" `1/3`; `a` num "$n=9$, $p=2/3$: poziția medie" `3`; `b` num "$n=9$, $p=1/3$" `-3`; `c` num "$n=9$, $p=1/2$" `0`; `f` choice "pentru $p$ oarecare" ✓ $n(2p-1)$; ✗[doar salturile spre dreapta] $np$; ✗[fără $n$] $2p-1$.

**Hints:** 1) Fiecare salt este o variabilă $X_i$ cu valorile $-1$ și $+1$. 2) $E[X_i]=-1\cdot(1-p)+1\cdot p$. 3) Poziția este $X_1+\dots+X_n$; media sumei este suma mediilor (liniaritate).

**Worked solution (book):** $E[X_i]=2p-1$; $E[X_1+\dots+X_n]=n(2p-1)$. For $p=1/2$ the position 0; for $p=2/3$ it is $n/3$; for $p=1/3$ it is $-n/3$.

**Detectors:** `a` = `6` → "$np=6$ este media salturilor spre dreapta; poziția este (spre dreapta) − (spre stânga) $=6-3$." `b` = `3` → "Semnul: pentru $p<1/2$ iepurașul se îndepărtează spre stânga."

**Builder:** the book text says "dacă obține banul" for tails (typo for the other face); the screen says "pajură".

#### L4.e6: ex. 0.25 (B:57-59), `[caiet]`, answer status book

**Enunț:** Distribuția binomială $b(r;n,p)=C_n^rp^r(1-p)^{n-r}$ pentru $r\in\{0,\dots,n\}$. **a.** Verificați că este o p.m.f. **b.** Calculați media și varianța.

**Proof screens.** (a) 1. $b\ge0$ for $p\in[0,1]$. 2. "Ce formulă dă suma?" ✓ binomul lui Newton: $\sum_rC_n^rp^r(1-p)^{n-r}=[p+(1-p)]^n=1$. ✗[suma probabilităților celor două rezultate] $p+(1-p)=1$ doar pentru $n=1$.
(b, media) 1. $kC_n^k=nC_{n-1}^{k-1}$ (se simplifică $k$ din $k!$). 2. $E=\sum_{k\ge1}k\,C_n^kp^k(1-p)^{n-k}=np\sum_{k\ge1}C_{n-1}^{k-1}p^{k-1}(1-p)^{(n-1)-(k-1)}=np[p+(1-p)]^{n-1}=np$. Second way (book remark): the binomial counts heads in $n$ throws, a sum of $n$ Bernoulli($p$) variables, each with mean $p$; linearity gives $np$.
(b, varianța) 1. $\mathrm{Var}=E[X^2]-(E[X])^2$ (L4.e2). 2. Same identity: $E[X^2]=np\sum_{j=0}^{n-1}(j+1)C_{n-1}^jp^jq^{(n-1)-j}$ (with $q=1-p$, $j=k-1$). 3. Split $(j+1)$: the first sum is the mean of $b(\cdot;n-1,p)$, i.e. $(n-1)p$; the second is $1$. So $E[X^2]=np[(n-1)p+1]=n^2p^2-np^2+np$. 4. $\mathrm{Var}=n^2p^2-np^2+np-n^2p^2=np(1-p)$. ∎

**Fields (`[construit]`, $n=20$, $p=0{,}25$; not the $n=10$, $p=0{,}3$ of quiz L4.q3):** `m` num `5`; `q` num "$E[X^2]=n^2p^2-np^2+np$" `28,75`; `v` num `3,75`.

**Hints:** 1) Folosește $kC_n^k=nC_{n-1}^{k-1}$. 2) Scrie $r^2=r(r-1)+r$ sau factorul $(j+1)$ ca în soluție. 3) Verifică la sfârșit cu $n=1$: obții media $p$ și varianța $p(1-p)$ (Bernoulli).

**Detectors:** `v` = `5` → "Aceasta este media $np$; varianța are factorul $(1-p)$." `q` = `25` → "Aceasta este $(E[X])^2=n^2p^2$; $E[X^2]$ o depășește cu varianța $3{,}75$."

#### L4.e7 (optional): ex. 0.27 (B:62-63), `[caiet]`, answer status book

**Enunț (distribuție folosită rar; exercițiu opțional):** Distribuția Poisson are $p(x\mid\lambda)=\dfrac{1}{e^{\lambda}}\dfrac{\lambda^x}{x!}$, $x\in\mathbb N$ (cu $0!=1$). Arătați că este o p.m.f., apoi că media este $\lambda$ și varianța este tot $\lambda$. Sugestie: $\sum_{x\ge0}\lambda^x/x!=e^\lambda$.

**Fields:** `m` choice ✓ $\lambda$; ✗ $\lambda^2$; ✗ $1/\lambda$. `v` choice ✓ $\lambda$; ✗ $\lambda^2+\lambda$ (this is $E[X^2]$). `vn` num "$\mathrm{Var}$ pentru $\lambda=2$" `2`.

**Worked solution (book):** $p>0$ and $\frac1{e^\lambda}\sum\frac{\lambda^x}{x!}=1$. Mean: $\sum x\frac{\lambda^x}{e^\lambda x!}=\frac{\lambda}{e^\lambda}\sum_{x\ge1}\frac{\lambda^{x-1}}{(x-1)!}=\lambda$. $E[X^2]$: write $x^2=x(x-1)+x$, get $\lambda^2+\lambda$; $\mathrm{Var}=\lambda^2+\lambda-\lambda^2=\lambda$.

**Hints:** 1) Șterge $x$ din $x/x!$. 2) Schimbă indicele cu $x-1$. 3) $E[X^2]=E[X(X-1)]+E[X]$.

#### L4.e8 (optional): ex. 0.28 (B:63-64), `[caiet]`, answer status book

**Enunț:** Care este numărul mediu de aruncări ale unui zar corect până când apare fața 6 (distribuția geometrică)? Justificați.

**Fields:** `e` num `6`.

**Hints:** 1) Probabilitatea ca prima față 6 să apară la aruncarea $n$ este $\frac16\left(\frac56\right)^{n-1}$. 2) $E=\sum_n n\cdot\frac16\left(\frac56\right)^{n-1}$; scrie $n=1+(n-1)$. 3) Rezultă $E=\frac16+\frac56\cdot1+\frac56E$.

**Worked solution (book):** $E=\frac16+\frac56+\frac56E$ (the sum of the probabilities $\sum\frac16(\frac56)^{n-1}=1$ and the shifted sum equals $E$), so $\frac16E=\frac16+\frac56$ and $E=6$.

**Detector:** `e` = `3,5` → "3,5 este media unei singure aruncări; aici numărăm aruncările până la prima față 6, care e în medie 6."

#### L4.e9: ex. 0.97 (B:218), answer status verified-twice

**Enunț:** $X$ are $E[X]=1$ și $\mathrm{Var}(X)=1$. Calculați: i. $E[3X]$; ii. $\mathrm{Var}(3X)$; iii. $\mathrm{Var}(X+3)$.

**Fields:** `i` num `3`; `ii` num `9`; `iii` num `1`.

**Hints:** 1) Media e liniară. 2) $\mathrm{Var}(aX)=a^2\mathrm{Var}(X)$. 3) $\mathrm{Var}(X+a)=\mathrm{Var}(X)$.

**Worked solution:** $E[3X]=3\cdot1=3$; $\mathrm{Var}(3X)=3^2\cdot1=9$; $\mathrm{Var}(X+3)=1$ (shifting does not change the spread). Culegerea nu dă răspunsul; verificat de două ori.

**Detectors:** `ii` = `3` → "Varianța nu e liniară: factorul e $a^2=9$." `iii` = `4` → "O constantă adăugată mută toate valorile la fel, deci împrăștierea rămâne 1." `iii` = `10` → "Ai combinat cu $a^2$: aici nu se înmulțește nimic, se adaugă o constantă."

#### L4.e10: ex. 0.98 (B:219), answer status ruled (one-line identity; proof)

**Enunț:** Pentru un eveniment $A$, fie $X=1$ dacă $A$ are loc și $0$ în caz contrar (variabila indicator a lui $A$). Arătați că $E[X]=P(A)$.

**Proof screen.** 1. "Care sunt valorile și probabilitățile lui $X$?" ✓ $X=1$ cu probabilitatea $P(A)$, $X=0$ cu $P(\bar A)$. 2. $E[X]=1\cdot P(A)+0\cdot P(\bar A)=P(A)$. ∎

**Fields:** `e` frac "pentru $P(A)=0{,}3$: $E[X]$" `3/10` (`[construit]`).

**Status note:** answer status "ruled": the book gives no answer; the content map gives the one-line proof above.

#### L4.c1: Var(X+a) = Var(X) din definiție și liniaritatea mediei, `[construit]`, answer status verified-twice (proof; added 2026-10-29, teacher list item 1)

**Enunț:** Fie $X$ o variabilă aleatoare și $a$ o constantă. Folosind definiția varianței și liniaritatea mediei, arătați că $\mathrm{Var}(X+a)=\mathrm{Var}(X)$. Verificați apoi pe $X$ care ia valorile 1 și 4 cu probabilitățile $\frac23$ și $\frac13$, cu $a=5$.

**Proof screens.** 1. Definiția: $\mathrm{Var}(X+a)=E\big[(X+a-E[X+a])^2\big]$. 2. "Cât este $E[X+a]$?" ✓ $E[X]+a$ (liniaritatea mediei, cu $E[a]=a$). ✗[media nu se mută] $E[X]$: adunând $a$ la fiecare valoare, și media crește cu $a$. ✗[constanta înmulțită] $a\,E[X]$: $a$ se adună la $X$, nu îl înmulțește; $E[aX]=aE[X]$ este altă regulă. 3. "Ce rămâne în paranteză?" ✓ $X+a-(E[X]+a)=X-E[X]$: constanta se reduce. ✗[a rămâne în paranteză] $X-E[X]+a$: din $X+a$ se scade toată media, $E[X]+a$, nu doar $E[X]$. 4. Deci $\mathrm{Var}(X+a)=E\big[(X-E[X])^2\big]=\mathrm{Var}(X)$. ∎ Remarcă: împreună cu $\mathrm{Var}(aX)=a^2\mathrm{Var}(X)$ (L4.e2) rezultă $\mathrm{Var}(aX+b)=a^2\mathrm{Var}(X)$.

**Fields (`[construit]`):** `vx` num "$\mathrm{Var}(X)$" `2` (formula `Var([1,4],[2/3,1/3])`); `m` num "$E[X+5]$" `7` (`E([1+5,4+5],[2/3,1/3])`); `v` num "$\mathrm{Var}(X+5)$" `2` (`Var([1+5,4+5],[2/3,1/3])`).

**Hints:** 1) $E[X]=1\cdot\frac23+4\cdot\frac13=2$; $X+5$ ia valorile 6 și 9 cu aceleași probabilități. 2) $E[X+5]=E[X]+5$; abaterile lui $X+5$ față de media ei sunt $6-7=-1$ și $9-7=2$, aceleași ca ale lui $X$ față de 2. 3) $\mathrm{Var}(X+5)=(-1)^2\cdot\frac23+2^2\cdot\frac13=2$.

**Worked solution:** $E[X]=2$, $E[X^2]=\frac23+\frac{16}3=6$, $\mathrm{Var}(X)=6-4=2$. $E[X+5]=7$ și $\mathrm{Var}(X+5)=E[(X+5-7)^2]=E[(X-2)^2]=2$. Culegerea nu dă răspunsul; verificat de două ori.

**Detectors:** `m` = `2` → "Media se mută și ea: $E[X+5]=E[X]+5=7$." `v` = `27` (`E([(1+5-2)^2,(4+5-2)^2],[2/3,1/3])`) → "Ai scăzut media veche, 2, în loc de $E[X+5]=7$: $E[(X+5-2)^2]=\mathrm{Var}(X)+25=27$." `v` = `7` (`Var([1,4],[2/3,1/3])+5`) → "Constanta nu se adună la varianță: toate valorile se mută cu 5, media la fel, deci abaterile rămân aceleași." `v` = `51` (`E([(1+5)^2,(4+5)^2],[2/3,1/3])`) → "Aceasta este $E[(X+5)^2]$; scade $(E[X+5])^2=49$."

**Footnote:** "Cursul: slide 14." Builder: FND:14 states $\mathrm{Var}(X+a)=\mathrm{Var}(X)$ without proof and no book exercise proves it (0.9.b proves only $\mathrm{Var}(aX)$; checked B:30-33). T21P item 2 asks exactly this proof (with $a=10$); the T21P test stays as given, so the learner meets it there as a test item, the way L1's 0.14 meets T21P item 1.

#### L4.c2: este o funcție masă de probabilitate?, `[construit]`, answer status verified-twice (added 2026-10-29, teacher list item 1)

**Enunț:** $X$ ia valorile 1, 2, 3. Pentru fiecare definiție spuneți dacă este o funcție masă de probabilitate validă și de ce. **i.** $p(1)=0{,}5$, $p(2)=0{,}3$, $p(3)=0{,}3$. **ii.** $p(1)=0{,}6$, $p(2)=-0{,}1$, $p(3)=0{,}5$. **iii.** $p(1)=0{,}2$, $p(2)=0{,}5$, $p(3)=0{,}3$. **iv.** $p(x)=c\cdot x$ pentru $x\in\{1,2,3\}$: ce valoare trebuie să aibă $c$? Cât este atunci $P(X=3)$?

**Fields:** `i` tf "i. validă?" `nu` (sum `0.5+0.3+0.3` = 1,1); `ir` choice "i. de ce?" ✓ suma este $1{,}1\ne1$; ✗[o valoare peste 1 sau negativă] "o valoare nu este în $[0,1]$" (explanation: toate trei sunt între 0 și 1; problema este suma). `ii` tf "ii. validă?" `nu` (sum `0.6+(-0.1)+0.5` = 1, `min(0.6,-0.1,0.5)` = −0,1); `iir` choice "ii. de ce?" ✓ $p(2)=-0{,}1<0$; ✗[suma 1 ajunge] "suma nu este 1" (explanation: suma este exact 1, dar o probabilitate nu poate fi negativă; se verifică ambele condiții). `iii` tf "iii. validă?" `da` (sum `0.2+0.5+0.3` = 1, `min(0.2,0.5,0.3)` = 0,2). `c` frac "iv. $c$" `1/6` (`1/(1+2+3)`); `p3` frac "$P(X=3)$" `1/2` (`3/(1+2+3)`).

**Hints:** 1) O p.m.f. cere două lucruri: $p(x)\ge0$ pentru fiecare valoare și $\sum_xp(x)=1$. 2) Verifică pe rând semnul fiecărei valori, apoi suma. 3) La iv: $c\cdot1+c\cdot2+c\cdot3=6c=1$.

**Worked solution:** i. Toate valorile sunt în $[0,1]$, dar suma este $1{,}1$: **nu** este validă. ii. Suma este $0{,}6-0{,}1+0{,}5=1$, dar $p(2)<0$: **nu** este validă. iii. Valorile sunt nenegative și suma este 1: **validă**. iv. $6c=1$, deci $c=\frac16$, iar valorile $\frac16,\frac26,\frac36$ sunt nenegative; $P(X=3)=\frac36=\frac12$. Culegerea nu dă răspunsul; verificat de două ori.

**Detectors:** `ii` = `da` → "Suma este 1, dar $p(2)=-0{,}1$: o probabilitate nu poate fi negativă. Verifică ambele condiții." `c` = `6` → "Ai inversat: $6c=1$ dă $c=\frac16$." `p3` = `3` → "$P(X=3)=3c$, cu $c=\frac16$."

**Footnote:** "Cursul: slide 9. Seminar 2, p. 4." Builder: the check is the definition of L4.s06 (one sentence there; nothing practised it). T21P item 5 asks the same check on $0{,}3$; $0{,}3$; $0{,}4$; these numbers differ on purpose.

### L4 visual spec: `ml-viz-pmf-cdf` (pmf bars, mean marked, then the c.d.f. staircase)

- **Data:** configuration 1: $X$ on $\{-1,0,1,2\}$ with $\frac16,\frac16,\frac16,\frac12$. Configuration 2 (appears once, for "mean not a value"): $R$ on $\{0,1,2,3\}$ with $\frac18,\frac38,\frac38,\frac18$.
- **Steps:** (1) pmf bars with heights; the learner predicts the balance point (mean), 1; a triangle marker appears at 1. (2) show the deviations $X-1$ under each bar and their squares; the learner predicts the variance (4/3); a bracket of width $\sigma\approx1{,}15$ is drawn around the mean. (3) configuration 2: predict whether the mean 1,5 is a possible value (it is not); marker between the bars. (4) toggle "c.d.f.": the same variable as a staircase, the learner predicts $F(1)$ (1/2 for configuration 1).
- **Learner predicts:** mean, variance, $F(1)$.
- **Reduced motion:** markers appear in place; no sliding.

### L4 builder notes

- Sources: FND:8-10, 14; Cn-s2:2-5, 8-9; B:30-33 (0.9), B:36 (0.12), B:55-56 (0.23), B:56-64 (0.24-0.28), B:218-219 (0.97, 0.98); WYSK:2 (function composition; identify the distribution; sum of identically distributed variables).
- `[calculat]`/`[construit]` values: all recomputed (checked: $F$ values, $E[R]=3/2$, $E[X^2]=7/3$, $\mathrm{Var}=4/3$, quiz and exercise numerics).
- Uncertain: nothing numerical. The variance of the binomial through "sum of independent Bernoulli variables" is not taught here (it needs the variance of a sum, Lecția 5); L5 gives it as a one-line back-link to this lesson.
- Repetition check: Var is taught once (L4.s09) and proven once (L4.e2); the games of L4.s01 return only as the payoff in L4.s12.
- Added 2026-10-29 (teacher list item 1): L4.c1 proves $\mathrm{Var}(X+a)=\mathrm{Var}(X)$, the one property of L4.s09 that no exercise proved (L4.e9 only checks it numerically), and L4.c2 practises the p.m.f. check of L4.s06. Both use new data that no other lesson or test uses.

---

## Lecția 5 (`ml-l05`): Distribuții comune, marginale, condiționate; independența variabilelor; covarianță

**Priority A.** **Concepts (3):** (1) distribuția comună, marginalele, distribuțiile condiționate; regula de înlănțuire pentru 3 variabile; (2) independența variabilelor aleatoare (pe toate perechile de valori); (3) covarianța, coeficientul de corelație, $\mathrm{Var}(X+Y)$. **Prerequisites:** vezi Lecția 1 (probabilitate condiționată, înlănțuire); vezi Lecția 3 (independența evenimentelor); vezi Lecția 4 (variabile, medie, varianță, liniaritate).

**Does not teach:** conditional independence of variables (L6).

**Added 2026-10-29 (teacher list item 2; concept C5.4 in `allocation.json`):** (4) variabile construite din două variabile: distribuția lui $g(X,Y)$ din tabelul comun, produsul $XY$, funcții de variabile independente. Screens L5.s06a and L5.s09a, exercise L5.c1.

### L5 screens: opening question

**L5.s01** (viz `ml-viz-joint-table`, config A, read-only table with click-to-test cells; data on the same screen; `[construit]`)
> $X$ ia valorile 0, 1, 2 și $Y$ ia valorile 0, 1. Distribuția lor comună:
>
> | | $Y=0$ | $Y=1$ |
> |---|---|---|
> | $X=0$ | 1/4 | 1/4 |
> | $X=1$ | 1/4 | 0 |
> | $X=2$ | 0 | 1/4 |
>
> Marginalele sunt $P(X)=\left(\frac12,\frac14,\frac14\right)$ și $P(Y)=\left(\frac12,\frac12\right)$. Pentru celula $(X{=}0, Y{=}0)$: $\frac14 = \frac12\cdot\frac12$. Putem spune că $X$ și $Y$ sunt independente?

Expected `nu`. The learner may click other cells: $(X{=}1,Y{=}0)$: $\frac14\ne\frac14\cdot\frac12=\frac18$. After the answer: "Păstrează răspunsul; vezi mai departe câte celule trebuie verificate." (Also $\mathrm{Cov}=\frac18\ne0$, not shown here.)

### L5 screens: worked example (Cn-s2:6-7, `[seminar]`; table read from the page image, p. 6)

**L5.s02** (viz config B, prediction)
> Distribuția comună a lui $(X, Y)$ (binare):
>
> | | $X=0$ | $X=1$ |
> |---|---|---|
> | $Y=0$ | 0,1 | 0,2 |
> | $Y=1$ | 0,3 | 0,4 |
>
> Cât este $P(X=0)$? Dar $P(X=1)$, $P(Y=0)$, $P(Y=1)$?

Correct `0,4` ($0{,}1+0{,}3$, suma pe coloană, trecută "în marginea" tabelului: de aici numele de marginală); `0,6`; `0,3` ($0{,}1+0{,}2$); `0,7`. The marginals fill into the table's margin.

**L5.s03** (viz, prediction)
> Cât este $P(X=0 \mid Y=1)$? Sunt $X$ și $Y$ independente? Verifică celulă cu celulă.

Correct `3/7` ($0{,}3/0{,}7$) $\ne P(X{=}0)=0{,}4$. Cell $(0,0)$: $0{,}4\cdot0{,}3=0{,}12\ne0{,}1$: **nu** sunt independente. The viz shows the four products $0{,}12;\ 0{,}18;\ 0{,}28;\ 0{,}42$ against $0{,}1;\ 0{,}2;\ 0{,}3;\ 0{,}4$.

**L5.s04** (prediction)
> Calculează $E[X]$, $E[Y]$ și $E[XY]$. Ce semn are covarianța $\mathrm{Cov}(X,Y)=E[XY]-E[X]E[Y]$?

Correct: $E[X]=0{,}6$; $E[Y]=0{,}7$; $E[XY]=0{,}4$ (doar celula $(1,1)$ dă un produs nenul: $1\cdot1\cdot0{,}4$); $\mathrm{Cov}=0{,}4-0{,}42=-0{,}02$, negativă. Reveal: $\mathrm{Var}(X)=0{,}6-0{,}36=0{,}24$ and $\mathrm{Var}(Y)=0{,}7-0{,}49=0{,}21$ (for a {0,1} variable $X^2=X$). All `[calculat]` from the seminar table, recomputed.

**L5.s05** (prediction)
> Cât este $\mathrm{Var}(X+Y)$? Calculează-l o dată cu formula $\mathrm{Var}(X)+\mathrm{Var}(Y)+2\,\mathrm{Cov}(X,Y)$ și o dată direct, din distribuția lui $X+Y$ (cum se obține ea din tabel?).

Correct: formula $0{,}24+0{,}21+2(-0{,}02)=0{,}41$. Direct: $X+Y$ ia 0 cu $0{,}1$, 1 cu $0{,}2+0{,}3=0{,}5$, 2 cu $0{,}4$ (se adună celulele care dau aceeași sumă); $E=0{,}5+0{,}8=1{,}3=0{,}6+0{,}7$; $E[(X+Y)^2]=0{,}5+1{,}6=2{,}1$; $\mathrm{Var}=2{,}1-1{,}69=0{,}41$. The two agree. Reveal: this is the situation L4 warned about: the distribution of $X+Y$ needs the **joint** table.

### L5 screens: rules

**L5.s06** (definition)
> **Distribuția comună** a lui $X$ și $Y$: $p(x,y) = P(X{=}x, Y{=}y)$. **Marginalele:** $p_X(x) = \sum_y p(x,y)$ și $p_Y(y) = \sum_x p(x,y)$. **Distribuția condiționată:** $p_{X\mid Y}(x \mid y) = \dfrac{p(x,y)}{p_Y(y)}$ (pentru $p_Y(y)\neq0$).

Footnote: "Cursul: slide 15. Culegerea: p. 39." Builder: continuous version (integrals) exists in FND:15 and is out of scope.

**L5.s06a** (definition + prediction; added 2026-10-29, teacher list item 2)
> **Funcție de două variabile.** Dacă $g$ este o funcție, $Z=g(X,Y)$ este tot o variabilă aleatoare. Distribuția ei se obține din distribuția comună: $P(Z{=}z)=\sum_{(x,y):\,g(x,y)=z}p(x,y)$, adică se adună celulele care dau aceeași valoare a lui $g$. Așa se obțin $X+Y$, $X-Y$ și **produsul** $XY$. Marginalele singure nu ajung (vezi Lecția 4).
>
> Fie distribuția comună $p(0,0)=0{,}1$, $p(1,0)=0{,}2$, $p(0,1)=0{,}3$, $p(1,1)=0{,}4$ (prima cifră: $X$, a doua: $Y$). Ce valori ia $D=X-Y$ și cu ce probabilități?

Prediction (`[construit]`; the four cells are shown on this screen as a compact table): $D$ ia $-1$ cu $0{,}3$ (celula $(0,1)$), $0$ cu $0{,}1+0{,}4=0{,}5$ (celulele $(0,0)$ și $(1,1)$ se adună) și $1$ cu $0{,}2$. Check after the reveal: $E[D]=-0{,}3+0{,}2=-0{,}1=E[X]-E[Y]=0{,}6-0{,}7$ (liniaritatea mediei). Formulas: `0.1+0.4`, `E([-1,0,1],[0.3,0.1+0.4,0.2])`, `(0.2+0.4)-(0.3+0.4)`. Footnote: "Cursul: slide 14." (FND:14: for $g:\mathbb R^n\to\mathbb R^m$, $g(X)$ is a random variable; here $n=2$.) Builder: these are the cells of the worked example (L5.s02), the example continuing inside the lesson; the product $XY$ on them is not asked again (L5.s04 read $E[XY]$ off them); the product as a variable is exercise L5.c1.

**L5.s07** (definition)
> **Regula de înlănțuire pentru trei variabile:** $P(X,Y,Z)=P(Z)\,P(X\mid Z)\,P(Y\mid X,Z)$. Se aplică regula de înlănțuire pentru evenimente (vezi Lecția 1); ordinea factorilor poate fi oricare.

Footnote: "Culegerea: p. 37 (nota 21)."

**L5.s08** (definition + callout)
> **Independența variabilelor.** $X$ și $Y$ sunt independente dacă $p(x,y)=p_X(x)\,p_Y(y)$ **pentru toate** perechile $(x,y)$. (Echivalent, când $p_Y(y)\ne0$ pentru toți $y$: $p_{X\mid Y}(x\mid y)=p_X(x)$ pentru toți $x,y$.)
>
> **Atenție:** la evenimente e o singură egalitate; la variabile sunt câte egalități are tabelul. O celulă care verifică nu ajunge (ecranul de la început). Pentru variabile binare cu valori 0 și 1 se va vedea (ex. 0.11 și 0.99) că o egalitate, împreună cu marginalele, ajunge.
>
> Pe hârtie, ca să arăți că două variabile **sunt** independente, scrie egalitatea pentru **toate** celulele, cum cere definiția. Scurtătura cu o singură egalitate pentru variabile binare este corectă, dar se sprijină pe un rezultat pe care ar trebui să-l justifici (ex. 0.11.b), așa că folosește-o ca verificare. Ca să arăți că **nu** sunt, ajunge o celulă care nu verifică.

Footnote: "Cursul: slide 16. Seminar 2, p. 6-7. Culegerea: p. 33."

Builder: the last paragraph was added 2026-10-29 (teacher list item 4): the definition asks for every pair; our own mock T1 2a barem (not an official one) gives the points only for all cells, and one failing cell settles "nu" (T21P 11b solution).

**L5.s09** (definition + list)
> **Covarianța:** $\mathrm{Cov}(X,Y)=E[(X-E[X])(Y-E[Y])]$; echivalent $\mathrm{Cov}(X,Y)=E[XY]-E[X]E[Y]$ (se dovedește în ex. 0.9.c). **Coeficientul de corelație:** $\rho(X,Y)=\dfrac{\mathrm{Cov}(X,Y)}{\sigma_X\sigma_Y}$, cu $-1\le\rho\le1$ (ex. 0.19). O covarianță mare indică o dependență aproximativ liniară, $X\approx aY+b$.
>
> **Varianța unei sume:** $\mathrm{Var}(X+Y)=\mathrm{Var}(X)+\mathrm{Var}(Y)+2\,\mathrm{Cov}(X,Y)$ (ex. 0.23.c); în general $\mathrm{Var}(aX+bY+c)=a^2\mathrm{Var}(X)+b^2\mathrm{Var}(Y)+2ab\,\mathrm{Cov}(X,Y)$; $\mathrm{Cov}(aX,bY)=ab\,\mathrm{Cov}(X,Y)$.
>
> **Dacă $X$ și $Y$ sunt independente:** $E[XY]=E[X]E[Y]$ (deci $\mathrm{Cov}=0$) și $\mathrm{Var}(X+Y)=\mathrm{Var}(X)+\mathrm{Var}(Y)$ (ex. 0.10). **Reciproca este falsă:** $\mathrm{Cov}=0$ nu implică independența (ex. 0.11).

Footnote: "Cursul: slide 9, 14, 17. Seminar 2, p. 6-7. Culegerea: p. 31, 45."

**L5.s09a** (definition + short proof; added 2026-10-29, teacher list item 2)
> **Funcții de variabile independente.** Dacă $X$ și $Y$ sunt independente, atunci și $f(X)$ și $g(Y)$ sunt independente, oricare ar fi funcțiile $f$ și $g$:
> $$P(f(X){=}a,\,g(Y){=}b)=\sum_{x:\,f(x)=a}\ \sum_{y:\,g(y)=b}p_X(x)\,p_Y(y)=P(f(X){=}a)\,P(g(Y){=}b).$$
> De aici $E[f(X)\,g(Y)]=E[f(X)]\,E[g(Y)]$; de exemplu $E[XY^2]=E[X]\,E[Y^2]$ și $\mathrm{Var}(X+2Y^2)=\mathrm{Var}(X)+4\,\mathrm{Var}(Y^2)$.
>
> **Atenție:** $E[XY^2]=E[X]\,E[Y^2]$, **nu** $E[X]\,(E[Y])^2$: pătratul se aplică lui $Y$ înainte de medie (vezi Lecția 4: $E[g(X)]\ne g(E[X])$).

Footnote: "Cursul: slide 17. Culegerea: p. 33 (ex. 0.10)." Builder: FND:17 and ex. 0.10 (L5.e2) give $E[XY]=E[X]E[Y]$ for independent variables; the extension to $f(X)$, $g(Y)$ is the grouping of L5.s06a applied to a product table (the two-line proof above) and is what the book's recap exercise 0.110 needs (0.110 itself stays out of scope until Alex rules). Numeric practice: L5.c1, field `exy2`.

**L5.s10** (callout, one line back to L4)
> Aceasta explică varianța binomialei din Lecția 4: suma a $n$ variabile Bernoulli($p$) independente, fiecare cu varianța $p(1-p)$, are varianța $np(1-p)$.

Builder: this is the book's remark in ex. 0.25 (B:59), kept as a one-line consequence, not a re-derivation.

### L5 screen: why

**L5.s11** (reflect)
> $X$ ia valorile $-1, 0, 1$, fiecare cu probabilitatea $\frac13$, iar $Y=X^2$. $Y$ este complet determinată de $X$. Totuși $\mathrm{Cov}(X,Y)=0$. **De ce?**

Answer: $E[X]=0$ and $E[XY]=E[X^3]=\frac13(-1+0+1)=0$, so $\mathrm{Cov}=E[XY]-E[X]E[Y]=0$. The values $-1$ and $1$ give the same $Y=1$ but opposite signs of $X$, and their contributions to $E[XY]$ cancel. Covariance measures only a **linear** trend (a line $Y\approx aX+b$); here the dependence is a parabola. `[construit]` (`seminar-and-errors` B3 item 6, derived).

### L5 screens: retrieve (4 items; new numbers)

**L5.q1** Tabel comun (binar): $p(0,0)=0{,}2$, $p(0,1)=0{,}2$, $p(1,0)=0{,}1$, $p(1,1)=0{,}5$ (prima cifră: $X$, a doua: $Y$). Cât este $P(Y=1\mid X=1)$?
- ✓ $5/6$ ($0{,}5/0{,}6$, unde $P(X{=}1)=0{,}1+0{,}5$). `[construit]`
- ✗[celula comună în loc de condiționată] 0,5: aceasta este celula $p(1,1)$, neîmpărțită la $P(X{=}1)$.
- ✗[marginala în loc de condiționată] 0,7: aceasta este $P(Y{=}1)$, ca și cum faptul că $X=1$ n-ar conta.
- ✗[condiționata inversă] $5/7$: aceasta este $P(X{=}1\mid Y{=}1)=0{,}5/0{,}7$; aici condiția este pe $X$.

**L5.q2** $\mathrm{Var}(X)=2$, $\mathrm{Var}(Y)=3$, $\mathrm{Cov}(X,Y)=-0{,}5$. Cât este $\mathrm{Var}(X+Y)$?
- ✓ 4 ($2+3+2\cdot(-0{,}5)$). `[construit]`
- ✗[variabile independente tacit] 5: ignoră covarianța; suma varianțelor e corectă numai când $\mathrm{Cov}=0$.
- ✗[semn greșit] 6: termenul este $+2\,\mathrm{Cov}$, iar aici $\mathrm{Cov}$ e negativă, deci suma scade cu 1.
- ✗[Cov fără factorul 2] 4,5: termenul este $2\,\mathrm{Cov}$, nu $\mathrm{Cov}$.

**L5.q3** $\mathrm{Var}(X)=4$ și $Y=-3X$. Cât este $\rho(X,Y)$?
- ✓ $-1$ ($\mathrm{Cov}=-12$, $\sigma_X=2$, $\sigma_Y=6$). `[construit]`
- ✗[ρ ca pantă] $-3$: aceasta este panta dreptei; $\rho\in[-1,1]$ măsoară cât de liniară este legătura, nu panta.
- ✗[Cov=0 pentru că Y e determinată] 0: $\mathrm{Cov}(X,-3X)=-3\,\mathrm{Var}(X)=-12\ne0$; o legătură liniară exactă dă $|\rho|=1$.

**L5.q4** $\mathrm{Var}(X)=0$. Ce înseamnă?
- ✓ $X$ ia o singură valoare, cu probabilitate 1 (este constantă).
- ✗[Var=0 înseamnă X=0] $X=0$. Explanation: constanta poate fi orice număr, de pildă 5.
- ✗[Var=0 înseamnă media 0] $E[X]=0$. Explanation: varianța măsoară împrăștierea, nu poziția; $X=5$ are $E[X]=5$ și $\mathrm{Var}=0$.

### L5 exercises

#### L5.e1: ex. 0.9.c (B:31, 33), `[caiet]`, answer status book (proof)

**Enunț:** Arătați $\mathrm{Cov}(X,Y)=E[XY]-E[X]E[Y]$. Consecință: $\mathrm{Cov}(aX,bY)=ab\,\mathrm{Cov}(X,Y)$.

**Proof screens.** 1. "Ce desfacem?" ✓ $(X-E[X])(Y-E[Y])=XY-X\,E[Y]-E[X]\,Y+E[X]E[Y]$. ✗[desfacere cu semn greșit] $XY+X\,E[Y]+E[X]\,Y+E[X]E[Y]$: sign errors. 2. Take $E[\cdot]$ with linearity ($E[Y]$ and $E[X]$ are constants): $E[XY]-E[X]E[Y]-E[X]E[Y]+E[X]E[Y]$. 3. The last three terms give $-E[X]E[Y]$. ∎ Consequence: $E[aX\cdot bY]-E[aX]E[bY]=ab(E[XY]-E[X]E[Y])$.

**Fields (`[construit]`):** `c` num "$E[X]=2$, $E[Y]=3$, $E[XY]=7$: $\mathrm{Cov}(X,Y)$" `1`; `c2` num "$\mathrm{Cov}(2X,5Y)$" `10`.

**Detector:** `c` = `7` → "Ai dat $E[XY]$; scade $E[X]E[Y]=6$."

#### L5.e2: ex. 0.10 (B:33-34), `[caiet]`, answer status book (proof; `PS:4`)

**Enunț:** Arătați că dacă $X$ și $Y$ sunt variabile independente, atunci $E[XY]=E[X]E[Y]$; echivalent, $\mathrm{Cov}(X,Y)=0$.

**Proof screens.** 1. $E[XY]=\sum_x\sum_y xy\,P(X{=}x,Y{=}y)$. 2. "Ce folosim?" ✓ independența: $P(X{=}x,Y{=}y)=P(X{=}x)P(Y{=}y)$ pentru toate perechile. ✗[doar o celulă] independența unei singure celule: ar da egalitatea doar pentru acel termen. 3. $=\sum_x xP(X{=}x)\cdot\sum_y yP(Y{=}y)$ (factorii separă sumele). 4. $=E[X]E[Y]$. ∎ Remark (book): the converse is false (ex. 0.11).

**Fields:** `e` num "$E[X]=2$, $E[Y]=3$, independente: $E[XY]$" `6`; `c` num "$\mathrm{Cov}(X,Y)$" `0` (`[construit]`).

#### L5.e3: ex. 0.11 (B:34-36), `[caiet]`, answer status book

**Enunț:** **a.** Arătați că $\mathrm{Cov}(X,Y)=0$ nu implică independența, folosind distribuția comună:
>
> | $X$ | $Y$ | $P(X,Y)$ |
> |---|---|---|
> | 0 | 0 | 1/3 |
> | 1 | 0 | 0 |
> | 2 | 0 | 1/3 |
> | 0 | 1 | 0 |
> | 1 | 1 | 1/3 |
> | 2 | 1 | 0 |
>
> **b.** Dacă $X$ și $Y$ iau valorile $\{0,1\}$ și $E[XY]=E[X]E[Y]$, arătați că sunt independente.

**Fields (a):** `px` frac "$P(X=0)$" `1/3`; `py0` frac "$P(Y=0)$" `2/3`; `ex` num `1`; `ey` frac `1/3`; `exy` frac `1/3`; `cov` num `0`; `c00` frac "$P(X{=}0)\,P(Y{=}0)$" `2/9`; `ind` tf "Sunt independente?" `nu`. (b) `b` tf `adevărat`.

**Hints:** 1) Marginalele: adună celulele pe $X$ și pe $Y$. 2) $E[XY]$: doar celula $(1,1)$ dă $XY\ne0$. 3) Compară celula $(0,0)$: $1/3$ față de produsul marginalelor.

**Worked solution (book):** $P(X)=\frac13$ for each of 0, 1, 2; $P(Y)=\frac23,\frac13$; $E[X]=1$; $E[Y]=\frac13$; $E[XY]=\frac13$; $\mathrm{Cov}=\frac13-1\cdot\frac13=0$. But $P(X{=}0,Y{=}0)=\frac13\ne\frac13\cdot\frac23=\frac29$. (b) binary: $E[X]=P(X{=}1)$, $E[Y]=P(Y{=}1)$, $E[XY]=P(X{=}1,Y{=}1)$; so zero covariance is $P(X{=}1,Y{=}1)=P(X{=}1)P(Y{=}1)$; the other three cells follow from $P(A\cap\bar B)=P(A)-P(A\cap B)$ and $P(\bar A)=1-P(A)$: $P(X{=}1,Y{=}0)=P(X{=}1)-P(X{=}1)P(Y{=}1)=P(X{=}1)P(Y{=}0)$; then $(0,1)$; then $(0,0)$ the same way.

**Detectors:** `cov` = `1/3` → "Ai uitat să scazi $E[X]E[Y]=1\cdot\frac13$: $\mathrm{Cov}=\frac13-\frac13=0$." `ind` = `da` → "Covarianța nulă nu garantează independența; celula $(0,0)$: $\frac13\ne\frac29$." `b` = `fals` → "Pentru variabile binare, covarianța nulă dă o celulă; celelalte trei se deduc din marginale."

#### L5.e4: ex. 0.13 (B:36-38), `[caiet]`, answer status book

**Enunț:** Trei variabile booleene $X, Y, Z$. Care dintre seturile de informații de mai jos sunt suficiente pentru a specifica distribuția comună $P(x,y,z)$?

| A | B | C | D |
|---|---|---|---|
| $P(\neg X\mid Z)$ | $P(\neg X\mid\neg Z)$ | $P(X\mid Z)$ | $P(X\mid Z)$ |
| $P(\neg X\mid\neg Z)$ | $P(X\mid\neg Z)$ | $P(X\mid\neg Z)$ | $P(X\mid\neg Z)$ |
| $P(\neg Y\mid X,Z)$ | $P(Y\mid X,Z)$ | $P(Y\mid X,Z)$ | $P(Y\mid X,Z)$ |
| $P(\neg Y\mid X,\neg Z)$ | $P(Y\mid X,\neg Z)$ | $P(Y\mid X,\neg Z)$ | $P(Y\mid X,\neg Z)$ |
| $P(\neg Y\mid\neg X,Z)$ | $P(Y\mid\neg X,Z)$ | $P(Y\mid\neg X,Z)$ | $P(\neg Y\mid\neg X,\neg Z)$ |
| $P(\neg Y\mid\neg X,\neg Z)$ | $P(Y\mid\neg X,\neg Z)$ | $P(\neg Y\mid\neg X,\neg Z)$ | $P(Y\mid\neg X,\neg Z)$ |
| $P(Z)$ | $P(Z)$ | $P(\neg Z)$ | $P(Z)$ |

**Fields:** `A` tf `da`; `B` tf `nu`; `C` tf `da`; `D` tf `nu`; `n` num "Câte numere libere specifică o distribuție comună pe 3 variabile booleene?" `7`.

**Hints:** 1) Folosește $P(X,Y,Z)=P(Z)\,P(X\mid Z)\,P(Y\mid X,Z)$. 2) Ai nevoie de $P(Z)$ (sau complementul), $P(X\mid Z)$ și $P(X\mid\neg Z)$ (sau complementele), și $P(Y\mid x,z)$ pentru fiecare dintre cele 4 perechi $(x,z)$ (sau complementele). 3) Verifică lista pe rând: lipsește vreo pereche $(x,z)$ sau apare aceeași informație de două ori?

**Worked solution (book):** a complement counts as known ($P(\neg X\mid Z)=1-P(X\mid Z)$). **A:** da, from $P(\neg X\mid Z)$ and $P(\neg X\mid\neg Z)$ one gets $P(X\mid Z)$, $P(X\mid\neg Z)$; the four $P(\neg Y\mid\cdot)$ give the four $P(Y\mid\cdot)$; $P(Z)$ gives $P(\neg Z)$. **B:** nu, it gives $P(\neg X\mid\neg Z)$ and $P(X\mid\neg Z)$ (the same information twice) and nothing about $P(X\mid Z)$. **C:** da, everything is present (complements). **D:** nu, it gives $P(\neg Y\mid\neg X,\neg Z)$ and $P(Y\mid\neg X,\neg Z)$ (twice the same) and nothing about $P(Y\mid\neg X,Z)$. Seven numbers (the 8 cells sum to 1).

**Detectors:** `n` = `8` → "Cele 8 celule au suma 1, deci una se deduce: 7 numere libere." `B` = `da` → "Lista B repetă informația pentru $\neg Z$ și nu dă $P(X\mid Z)$."

#### L5.e5: ex. 0.19 (B:45-46), `[caiet]`, answer status book (proofs; `PS:12-13`)

**Enunț:** Pentru $X, Y$ cu $\mathrm{Var}(X)\ne0$, $\mathrm{Var}(Y)\ne0$, $\rho(X,Y)=\mathrm{Cov}(X,Y)/(\sigma_X\sigma_Y)$. **a.** Arătați $-1\le\rho\le1$ (consecință: $\mathrm{Cov}\in[-\sigma_X\sigma_Y,+\sigma_X\sigma_Y]$). **b.** Arătați că dacă $\rho=1$ atunci $Y=aX+b$ cu $a=\sigma_Y/\sigma_X>0$, iar dacă $\rho=-1$ atunci $Y=aX+b$ cu $a=-\sigma_Y/\sigma_X<0$. Indicații: dezvoltă $\mathrm{Var}\left(\frac X{\sigma_X}+\frac Y{\sigma_Y}\right)$ și $\mathrm{Var}\left(\frac X{\sigma_X}-\frac Y{\sigma_Y}\right)$ cu $\mathrm{Var}(X+Y)=\mathrm{Var}X+\mathrm{Var}Y+2\mathrm{Cov}$ și $\mathrm{Cov}(aX,bY)=ab\,\mathrm{Cov}$; $\mathrm{Var}(X)=0$ dacă și numai dacă $X$ este constantă.

**Proof screens.** (a) 1. $\mathrm{Var}\left(\frac X{\sigma_X}+\frac Y{\sigma_Y}\right)=\frac{\mathrm{Var}X}{\sigma_X^2}+\frac{\mathrm{Var}Y}{\sigma_Y^2}+2\frac{\mathrm{Cov}(X,Y)}{\sigma_X\sigma_Y}$. Prediction: "Cât dau primii doi termeni?" ✓ $1+1$. ✗[σ în loc de σ²] $\frac1{\sigma_X}+\frac1{\sigma_Y}$: the variance of $X/\sigma_X$ is $\mathrm{Var}X/\sigma_X^2=1$. 2. So the variance is $2+2\rho=2(1+\rho)$. 3. A variance is $\ge0$: $1+\rho\ge0$, $\rho\ge-1$. 4. Same with the minus sign: $2(1-\rho)\ge0$, $\rho\le1$.
(b) 1. If $\rho=-1$ then $\mathrm{Var}\left(\frac X{\sigma_X}+\frac Y{\sigma_Y}\right)=0$. 2. A variable with variance 0 is constant with probability 1: $\frac X{\sigma_X}+\frac Y{\sigma_Y}=a'$. 3. Solve for $Y$: $Y=a'\sigma_Y-\frac{\sigma_Y}{\sigma_X}X$, i.e. $Y=aX+b$ with $a=-\sigma_Y/\sigma_X<0$, $b=a'\sigma_Y$. 4. If $\rho=1$ use the minus combination: variance $2(1-\rho)=0$, so $\frac X{\sigma_X}-\frac Y{\sigma_Y}=a''$ and $Y=\frac{\sigma_Y}{\sigma_X}X-a''\sigma_Y$, $a>0$.

**Fields (`[construit]`):** `v1` num "dacă $\rho=-1$: $\mathrm{Var}\left(\frac X{\sigma_X}+\frac Y{\sigma_Y}\right)$" `0`; `v2` num "dacă $\rho=0{,}6$: $\mathrm{Var}\left(\frac X{\sigma_X}+\frac Y{\sigma_Y}\right)$" `3,2`; `s` num "$\sigma_X=1$, $\sigma_Y=5$, $\rho=-1$: panta $a$" `-5`.

**Hints:** 1) Împarte fiecare variabilă la propria abatere standard. 2) $\mathrm{Var}(X/\sigma_X)=1$. 3) Varianța nu poate fi negativă.

**Detectors:** `v2` = `1,6` → "Varianța este $2(1+\rho)=3{,}2$; $1+\rho=1{,}6$ este doar jumătate." `s` = `5` → "Pentru $\rho=-1$ panta este negativă: $a=-\sigma_Y/\sigma_X$."

**Builder:** footnote 24 (B:45): the coefficient $a$ is not $\rho$; $\rho$ measures the degree of linear dependence (this is the distractor of L5.q3).

#### L5.e6: ex. 0.23.b, c, d (B:55-56), `[caiet]`, answer status book (week-2 Special)

**Enunț:** Adevărat sau fals pentru orice două variabile aleatoare $X, Y$: **b.** $E[X+Y]=E[X]+E[Y]$. **c.** $\mathrm{Var}[X+Y]=\mathrm{Var}[X]+\mathrm{Var}[Y]$. **d.** $E[XY]=E[X]\cdot E[Y]$.

**Fields:** `b` tf `adevărat`; `c` tf `fals`; `d` tf `fals`. Counterexample numerics (`[construit]`): $X$ Bernoulli(1/2), $Y=-X$: `c1` frac "$\mathrm{Var}[X+Y]$" `0`; `c2` frac "$\mathrm{Var}[X]+\mathrm{Var}[Y]$" `1/2`. $Y=X$, $X$ Bernoulli(1/2): `d1` frac "$E[XY]$" `1/2`; `d2` frac "$E[X]E[Y]$" `1/4`.

**Hints:** 1) (b): ex. 0.9.a din Lecția 4. 2) (c): ia $Y=-X$. 3) (d): ia $Y=X$ cu $X$ binară.

**Worked solution (book):** (b) true (0.9.a). (c) false: with $Y=-X$, $\mathrm{Var}[X+Y]=0$ but $\mathrm{Var}[X]+\mathrm{Var}[Y]=2\mathrm{Var}[X]\ne0$. In general (book derivation): $\mathrm{Var}[X+Y]=E[(X+Y)^2]-(E[X]+E[Y])^2=\left(E[X^2]-E[X]^2\right)+\left(E[Y^2]-E[Y]^2\right)+2\left(E[XY]-E[X]E[Y]\right)=\mathrm{Var}[X]+\mathrm{Var}[Y]+2\mathrm{Cov}[X,Y]$; equality holds when $\mathrm{Cov}=0$, e.g. independent variables (0.10). (d) false: it is equivalent to $\mathrm{Cov}=0$; with $Y=X$ binary and $P(X{=}1)=p$: $E[X^2]=p\ne p^2$ since $p(1-p)\ne0$.

**Proof screen (derivation in (c)).** Steps: 1. $E[(X+Y)^2]=E[X^2]+2E[XY]+E[Y^2]$. 2. $(E[X+Y])^2=(E[X]+E[Y])^2=E[X]^2+2E[X]E[Y]+E[Y]^2$ (linearity). 3. Subtract and regroup into three parenthesized differences. Prediction at step 3: "Ce se obține ca al treilea termen?" ✓ $2(E[XY]-E[X]E[Y])=2\mathrm{Cov}$. ✗[fără factorul 2] $\mathrm{Cov}$.

**Detectors:** `c` = `adevărat` → "Egalitatea cere $\mathrm{Cov}=0$; cu $Y=-X$ varianța sumei este 0, nu $2\mathrm{Var}X$." `d1` = `1/4` → "$E[X\cdot X]=E[X^2]=\frac12$ (X ia 0 sau 1, $X^2=X$); $\frac14$ este $E[X]E[Y]$."

#### L5.e7: ex. 0.99 (B:219), answer status verified-twice

**Enunț:** Două variabile discrete $X, Y\in\{0,1\}$ cu distribuția comună $P(0,0)=\alpha$, $P(0,1)=\beta$, $P(1,0)=\gamma$, $P(1,1)=\delta$. **a.** Calculați $E[X]$ și $E[Y]$ în funcție de $\alpha,\beta,\gamma,\delta$. **b.** Găsiți condițiile necesare și suficiente pentru ca $X$ și $Y$ să fie independente.

**Fields:** `a1` choice $E[X]$: ✓ $\gamma+\delta$; ✗[linia greșită] $\beta+\delta$ (this is $E[Y]$); ✗[celula singură] $\delta$. `a2` choice $E[Y]$: ✓ $\beta+\delta$; ✗ $\gamma+\delta$. `b` choice: ✓ $\alpha\delta=\beta\gamma$; ✗[sumă în loc de produs] $\alpha+\delta=\beta+\gamma$; ✗[produs pe rânduri] $\alpha\beta=\gamma\delta$. `n` tf "pentru $\alpha=0{,}12$, $\beta=0{,}28$, $\gamma=0{,}18$, $\delta=0{,}42$: independente?" `da` (`[construit]`: $\alpha\delta=\beta\gamma=0{,}0504$).

**Hints:** 1) $E[X]=P(X{=}1)$ pentru o variabilă binară. 2) Independența cere patru egalități; scrie-o pe cea pentru celula $(1,1)$. 3) Folosește $\alpha+\beta+\gamma+\delta=1$.

**Worked solution:** (a) $E[X]=\gamma+\delta$, $E[Y]=\beta+\delta$. (b) Independence means $\alpha=(\alpha+\beta)(\alpha+\gamma)$, $\beta=(\alpha+\beta)(\beta+\delta)$, $\gamma=(\gamma+\delta)(\alpha+\gamma)$, $\delta=(\gamma+\delta)(\beta+\delta)$. For binary variables one of them suffices (L5.e3, part b): $\delta=(\gamma+\delta)(\beta+\delta)\iff\delta(1-\beta-\gamma-\delta)=\beta\gamma\iff\alpha\delta=\beta\gamma$ (since $\alpha=1-\beta-\gamma-\delta$). Culegerea nu dă răspunsul; verificat de două ori.

**Detector:** `a1` = `β+δ` → "Aceasta este $E[Y]$; $X=1$ înseamnă linia a doua, celulele $\gamma$ și $\delta$."

#### L5.e8: ex. 0.100 (B:219), answer status verified-twice

**Enunț:** Covarianța nulă nu implică independența (0.11.a), dar pentru variabile binare {0,1} da (0.11.b). Arătați că dacă doar $X$ este binară, covarianța nulă nu implică neapărat independența. Indicație: 
>
> | $X$ | $Y$ | $P(X,Y)$ |
> |---|---|---|
> | 0 | −1 | 0,1 |
> | 0 | 0 | 0,4 |
> | 0 | 1 | 0,1 |
> | 1 | −1 | 0 |
> | 1 | 0 | 0,4 |
> | 1 | 1 | 0 |

**Fields:** `px1` frac "$P(X=1)$" `2/5`; `ex` frac `2/5`; `ey` num `0`; `exy` num `0`; `cov` num `0`; `p` frac "$P(X{=}1,Y{=}-1)$" `0`; `pp` frac "$P(X{=}1)P(Y{=}-1)$" `1/25` (0,04); `ind` tf `nu`.

**Hints:** 1) Marginalele: $P(X{=}0)=0{,}6$, $P(Y)=(0{,}1;\,0{,}8;\,0{,}1)$. 2) $E[XY]$: doar rândurile cu $X=1$ și $Y\ne0$ contează, iar acolo probabilitățile sunt 0. 3) Compară celula $(1,-1)$.

**Worked solution:** $E[X]=0{,}4$; $E[Y]=-0{,}1+0{,}1=0$; $E[XY]=0$ (terms with $XY\ne0$ have probability 0); $\mathrm{Cov}=0-0{,}4\cdot0=0$. But $P(X{=}1,Y{=}-1)=0\ne0{,}4\cdot0{,}1=0{,}04$: dependent. Culegerea nu dă răspunsul; verificat de două ori. The same table is the one of the T16 problem (2) and shows that "only X binary" is not enough.

**Detector:** `ind` = `da` → "Covarianța 0 nu decide independența; celula $(1,-1)$: $0\ne0{,}04$."

#### L5.c1: produsul a două variabile independente, `[construit]`, answer status verified-twice (added 2026-10-29, teacher list item 2)

**Enunț:** $X$ și $Y$ sunt independente. $X$ ia valorile 1 și 2 cu probabilitățile $0{,}4$ și $0{,}6$; $Y$ ia valorile 0, 1, 2 cu probabilitățile $0{,}5$; $0{,}3$; $0{,}2$ (două tabele statice mici pe ecran: $P(X)$ și $P(Y)$). Fie $Z=XY$. **a.** Cât sunt $P(X{=}2,Y{=}1)$ și $P(X{=}1,Y{=}2)$? **b.** Distribuția lui $Z$. **c.** $E[Z]$, comparat cu $E[X]\,E[Y]$. **d.** $E[XY^2]$.

**Fields:** `p21` frac "$P(X{=}2,Y{=}1)$" `9/50` (0,18; `0.6*0.3`); `p12` frac "$P(X{=}1,Y{=}2)$" `2/25` (0,08; `0.4*0.2`); `z0` frac "$P(Z{=}0)$" `1/2` (`0.4*0.5+0.6*0.5`); `z1` frac "$P(Z{=}1)$" `3/25` (`0.4*0.3`); `z2` frac "$P(Z{=}2)$" `13/50` (0,26; `0.4*0.2+0.6*0.3`); `z4` frac "$P(Z{=}4)$" `3/25` (`0.6*0.2`); `ez` frac "$E[Z]$" `28/25` (1,12; `E([0,1,2,4],[0.4*0.5+0.6*0.5,0.4*0.3,0.4*0.2+0.6*0.3,0.6*0.2])`); `exey` frac "$E[X]\,E[Y]$" `28/25` (`E([1,2],[0.4,0.6])*E([0,1,2],[0.5,0.3,0.2])`); `exy2` frac "$E[XY^2]$" `44/25` (1,76; `E([1,2],[0.4,0.6])*E([0,1,4],[0.5,0.3,0.2])`).

**Hints:** 1) Variabilele sunt independente, deci fiecare celulă a tabelului comun este produsul marginalelor: $p(x,y)=p_X(x)\,p_Y(y)$. 2) $Z=0$ când $Y=0$, pentru ambele valori ale lui $X$; $Z=2$ vine din două celule, $(1,2)$ și $(2,1)$, care se adună. 3) $E[Z]=0\cdot0{,}5+1\cdot0{,}12+2\cdot0{,}26+4\cdot0{,}12$; $E[XY^2]=E[X]\,E[Y^2]$, cu $E[Y^2]=0\cdot0{,}5+1\cdot0{,}3+4\cdot0{,}2$.

**Worked solution:** Tabelul comun: $(1,0)$: $0{,}2$; $(1,1)$: $0{,}12$; $(1,2)$: $0{,}08$; $(2,0)$: $0{,}3$; $(2,1)$: $0{,}18$; $(2,2)$: $0{,}12$ (suma 1). $Z$ ia 0 cu $0{,}2+0{,}3=0{,}5$; 1 cu $0{,}12$; 2 cu $0{,}08+0{,}18=0{,}26$; 4 cu $0{,}12$. $E[Z]=0{,}12+0{,}52+0{,}48=1{,}12$; $E[X]=1{,}6$, $E[Y]=0{,}7$, $E[X]E[Y]=1{,}12$: egale, fiindcă variabilele sunt independente (L5.s09). $E[Y^2]=1{,}1$, deci $E[XY^2]=1{,}6\cdot1{,}1=1{,}76$; direct din cele șase celule: $0{,}12+0{,}32+0{,}36+0{,}96=1{,}76$. Culegerea nu dă răspunsul; verificat de două ori.

**Detectors:** `z2` = `0.08` or `0.18` → "Valoarea 2 vine din două celule, $(X{=}1,Y{=}2)$ și $(X{=}2,Y{=}1)$: $0{,}08+0{,}18$." `z0` = `0.2` or `0.3` → "$Z=0$ pentru orice $X$ când $Y=0$: $0{,}2+0{,}3$." `exy2` = `98/125` (0,784; `E([1,2],[0.4,0.6])*E([0,1,2],[0.5,0.3,0.2])^2`) → "Aceasta este $E[X]\,(E[Y])^2$; media se ia după ridicarea la pătrat: $E[XY^2]=E[X]\,E[Y^2]=1{,}6\cdot1{,}1$."

**Footnote:** "Cursul: slide 14, 17." Builder: the shape of the book's recap exercise 0.110 ($E[XY^2]$ and the products of independent variables), with our own numbers; 0.110 stays out of scope until Alex rules.

### L5 visual spec: `ml-viz-joint-table` (joint table with marginals filling in and an independence check cell by cell)

- **Config A (opening question):** the 3×2 table of L5.s01, marginals shown, cells clickable to display the product. No auto-reveal; the learner clicks cells.
- **Config B (concrete):** the table 0,1 / 0,2 / 0,3 / 0,4 of L5.s02. **Steps:** (1) marginals empty; the learner predicts $P(X=0)$ (0,4); the column sum animates into the margin; the other three marginals follow after a prediction each. (2) conditional: the learner predicts $P(X{=}0\mid Y{=}1)$ (3/7); the row $Y=1$ is highlighted and renormalized to 1. (3) independence: for each cell the product of its marginals appears beside the real value; the learner predicts "verifică / nu verifică" for each (0,12 against 0,1, nu; ...). (4) expectation view: shade the cell $(1,1)$ as the only one with $XY\ne0$; predict $E[XY]$ (0,4); show $E[X]E[Y]=0{,}42$ and $\mathrm{Cov}=-0{,}02$. (5) "grupează după sumă": the cells with the same $X+Y$ merge (0,1 / 0,5 / 0,4) for L5.s05.
- **Learner predicts:** each marginal, the conditional, the verdict per cell, $E[XY]$, $\mathrm{Var}(X+Y)$.
- **Reduced motion:** sums and merges happen as instant state changes.
- **Reuse:** the same component, with a "condiționează pe $Z$" option, is used in Lecția 6 (its own data, L6 visual spec).

### L5 builder notes

- Sources: FND:9, 14-17; Cn-s2:6-7 (table read from `notes-s2.pdf` page 6 image: cells 0,1 / 0,2 / 0,3 / 0,4 by $X=0,Y=0$; $X=1,Y=0$; $X=0,Y=1$; $X=1,Y=1$); B:31, 33-36, 37-38 (0.13), 45-46 (0.19), 55-56 (0.23), 219 (0.99, 0.100); PS:4, 12-13; T16 (2), T20a 1.5, T21S 1 (joint table with unknowns, used by the mock test, not here).
- The Cn-s2 table does not coincide with 0.99, 0.100 or T16 (checked: $\alpha\delta=0{,}04\ne\beta\gamma=0{,}06$ for it), so the allocation's fallback "replace with a constructed table" was not needed.
- Uncertain: the claim "for binary {0,1} variables one equation (with marginals) suffices" is stated in L5.s08 as a forward promise to L5.e3 and L5.e7 (same lesson). 0.19's footnote 27: "Var(X)=0" means constant with probability 1.
- Repetition check: Var(X+Y) is derived once (L5.e6 c) and used in L5.e5 and the concrete; the formula is stated once (L5.s09).
- Added 2026-10-29 (teacher list items 2 and 4): L5.s06a, L5.s09a, L5.c1 and the last paragraph of L5.s08. The distribution of $X+Y$ (L5.s05) stays the worked example; L5.s06a states the rule for any $g(X,Y)$ and predicts $X-Y$, not $X+Y$ again.

---

## Lecția 6 (`ml-l06`): Independența condiționată a variabilelor aleatoare

**Priority B.** **Concepts (2):** (1) independența condiționată a variabilelor aleatoare (pe toate valorile $x,y,z$); nu decurge din independență și nici invers; (2) folosirea independenței condiționate: ce probabilități trebuie cunoscute și ce se poate însuma (marginalizare condiționată). **Prerequisites:** vezi Lecția 2 (Bayes); vezi Lecția 3 (independență condiționată pentru evenimente, ex. 0.92); vezi Lecția 5 (tabel comun, marginale, independența variabilelor).

### L6 screens: opening question

**L6.s01** (question, choice; data on the same screen; `[construit]`)
> $Z$ este un bit corect: 0 sau 1, la fel de probabile. $X$ și $Y$ sunt două copii zgomotoase ale lui $Z$: fiecare este egală cu $Z$ cu probabilitatea **0,8** și este inversată cu probabilitatea 0,2, **independent una de alta**, dacă știm $Z$. Nu știm $Z$. Aflăm că $X=1$. Probabilitatea ca $Y=1$ **crește, scade** sau **rămâne** 0,5?

Expected `crește` (exact value 0,68 on L6.s03). After: "Păstrează răspunsul."

### L6 screens: worked example (viz `ml-viz-joint-table`, config C, `[construit]`; all values recomputed with exact fractions)

**L6.s02** (prediction)
> Dacă știm $Z$, $X$ și $Y$ nu mai depind una de alta, deci $P(x,y,z)=P(z)\,P(x\mid z)\,P(y\mid z)$. Cât este $P(X{=}1, Y{=}1, Z{=}1)$?

Correct `0,32` ($0{,}5\cdot0{,}8\cdot0{,}8$). The table of 8 cells fills in, one prediction for the next cell only:

| | $Z=0$ | $Z=1$ |
|---|---|---|
| $(X,Y)=(0,0)$ | 0,32 | 0,02 |
| $(0,1)$ | 0,08 | 0,08 |
| $(1,0)$ | 0,08 | 0,08 |
| $(1,1)$ | 0,02 | 0,32 |

Reveal: this is the chain rule of Lecția 5, $P(Z)\,P(X\mid Z)\,P(Y\mid X,Z)$, with $P(Y\mid X,Z)=P(Y\mid Z)$ by construction.

**L6.s03** (prediction; payoff of L6.s01)
> Nu știm $Z$: adună cele două coloane. Cât este $P(X{=}0,Y{=}0)$? Cât este $P(X{=}0)$? Sunt $X$ și $Y$ independente? Cât este $P(Y{=}1\mid X{=}1)$?

Correct: $P(0,0)=0{,}32+0{,}02=0{,}34$; $P(X{=}0)=0{,}5$ (and $P(Y{=}0)=0{,}5$): product $0{,}25\ne0{,}34$: **dependente**. $P(Y{=}1\mid X{=}1)=0{,}34/0{,}5=0{,}68>0{,}5$ (the answer to L6.s01). The marginal table: $0{,}34;\ 0{,}16;\ 0{,}16;\ 0{,}34$.

**L6.s04** (prediction, slices)
> Acum fixează $Z=0$: păstrează doar coloana $Z=0$ și împarte-o la $P(Z{=}0)=0{,}5$. Care este distribuția condiționată $P(x,y\mid Z{=}0)$? Sunt $X$ și $Y$ independente în această felie? Dar în felia $Z=1$?

Correct: $0{,}64;\ 0{,}16;\ 0{,}16;\ 0{,}04$; marginals of the slice $P(X{=}0\mid Z{=}0)=0{,}8$ and $P(Y{=}0\mid Z{=}0)=0{,}8$; products $0{,}64;\ 0{,}16;\ 0{,}16;\ 0{,}04$: **toate celulele verifică**. By symmetry the slice $Z=1$ is $0{,}04;\ 0{,}16;\ 0{,}16;\ 0{,}64$ and verifies too. So $X$ și $Y$ sunt **dependente**, dar **independente condiționat de $Z$**.

### L6 screens: rules

**L6.s05** (definition)
> **Independența condiționată a variabilelor.** $X$ și $Y$ sunt independente condiționat de $Z$ ($X\perp Y\mid Z$) dacă pentru **toate** valorile $x, y, z$ (cu $P(Z{=}z)\ne0$):
> $$p(x,y\mid z)=p(x\mid z)\,p(y\mid z).$$
> Echivalent, când $p(y,z)\ne0$: $p(x\mid y,z)=p(x\mid z)$ (echivalența: exercițiul 0.92, Lecția 3).
>
> **Cum se verifică:** fiecare felie $Z=z$ separat, cu toate celulele ei (pentru variabile binare, 4 egalități pe felie, deci 8 în total; într-o felie binară una singură ajunge, împreună cu marginalele feliei, ca în Lecția 5).
>
> Pe hârtie, ca să arăți că $X$ și $Y$ **sunt** independente condiționat de $Z$, scrie toate egalitățile (pentru variabile binare, toate 8), cum cere definiția; scurtătura cu o egalitate pe felie folosește-o ca verificare. Ca să arăți că **nu** sunt, ajunge o egalitate care nu se verifică.
>
> **Independența și independența condiționată nu se implică una pe alta.** Exemplul de mai sus: dependente, dar independente condiționat. Exercițiul 0.16: independente, dar nu independente condiționat.

Footnote: "Cursul: slide 16. Seminar 2, p. 7. Culegerea: p. 39, 42." Builder: decision 3 (this lesson owns the example).

Builder: the paragraph about the paper answer was added 2026-10-29 (teacher list item 4; our own mock T1 2b barem asks for all eight equalities or an equivalent argument, T21P 13d settles "nu" with one).

**L6.s06** (learn)
> **Ce poți face cu ea.**
> - **Bayes cu două dovezi** $E_1, E_2$ date $H$ (vezi Lecția 2): $P(H\mid E_1,E_2)=\dfrac{P(E_1,E_2\mid H)\,P(H)}{P(E_1,E_2)}$. Ai nevoie de $P(E_1,E_2\mid H)$; dacă $E_1\perp E_2\mid H$ el este $P(E_1\mid H)\,P(E_2\mid H)$.
> - **Marginalizare condiționată:** $p(x\mid z)=\sum_y p(x,y\mid z)$. Se însumează pe variabila care nu interesează; **nu este nevoie de nicio independență** ca să faci asta.

Footnote: "Culegerea: p. 220."

### L6 screen: why

**L6.s07** (reflect)
> În exemplul cu cele două copii ale lui $Z$: de ce, odată ce știm $Z$, aflarea lui $X$ nu mai spune nimic despre $Y$, deși fără $Z$ le legam?

Answer: $X$ tells us something about $Y$ only because it tells us something about $Z$ (which both copy). Once $Z$ is known, that channel is closed: the only thing left in each copy is its own independent noise. The dependence between $X$ and $Y$ in the marginal table was all carried by $Z$. (Explanation of the constructed example; not a statement from the course.)

### L6 screens: retrieve (4 items; new numbers)

**L6.q1** $X$ și $Y$ sunt independente. Rezultă că sunt independente și condiționat de o a treia variabilă $Z$?
- ✓ Nu neapărat: depinde de tabel (ex. 0.16 are $X\perp Y$ fără $X\perp Y\mid Z$).
- ✗[independența se moștenește] Da, independența se păstrează când adaugi o condiție. Explanation: condiționarea schimbă distribuția (alege o felie și o renormalizează); două variabile independente în total pot deveni dependente în felii.
- ✗[niciodată] Nu, niciodată. Explanation: pot fi și independente condiționat (de exemplu dacă $Z$ nu are nicio legătură cu ele); nu se poate spune în general, trebuie verificat tabelul.

**L6.q2** Variabile binare $X, Y, Z$. În felia $Z=0$: $P(X{=}1\mid Z{=}0)=0{,}5$, $P(Y{=}1\mid Z{=}0)=0{,}4$, $P(X{=}1,Y{=}1\mid Z{=}0)=0{,}2$. În felia $Z=1$: $P(X{=}1\mid Z{=}1)=0{,}9$, $P(Y{=}1\mid Z{=}1)=0{,}5$, $P(X{=}1,Y{=}1\mid Z{=}1)=0{,}5$. Este $X\perp Y\mid Z$?
- ✓ Nu: felia $Z=1$ nu verifică ($0{,}9\cdot0{,}5=0{,}45\ne0{,}5$). `[construit]`
- ✗[o singură felie] Da, pentru că felia $Z=0$ verifică ($0{,}5\cdot0{,}4=0{,}2$). Explanation: definiția cere toate valorile lui $z$; o felie care nu verifică ajunge ca să fie nu.
- ✗[dependența marginală] Nu, pentru că $X$ și $Y$ sunt dependente în general. Explanation: independența condiționată nu depinde de independența marginală; se verifică doar feliile.

**L6.q3** $X, Y, Z$ sunt binare. Câte egalități $p(x,y\mid z)=p(x\mid z)\,p(y\mid z)$ cuprinde definiția independenței condiționate?
- ✓ 8 (câte una pentru fiecare triplet $(x,y,z)$: $2\cdot2\cdot2$).
- ✗[o singură felie] 4: acestea sunt egalitățile unei singure felii; $z$ ia două valori, fiecare cu cele 4 egalități ale ei.
- ✗[doar valorile lui Z] 2: definiția cere egalitatea pentru toate valorile lui $x$, $y$ **și** $z$.

**L6.q4** Ai un tabel comun $P(X,Y,Z)$ și vrei $P(X{=}0\mid Z{=}1)$. Ce faci?
- ✓ Însumezi după $y$ și împarți: $\dfrac{P(X{=}0,Z{=}1)}{P(Z{=}1)}$ cu $P(X{=}0,Z{=}1)=\sum_yP(X{=}0,y,Z{=}1)$.
- ✗[presupui independență înainte de a însuma] Presupui mai întâi $X\perp Y$ și apoi calculezi. Explanation: marginalizarea nu cere nicio independență; suma după $y$ este corectă oricum.
- ✗[o singură celulă] Iei $P(X{=}0,Y{=}0,Z{=}1)/P(Z{=}1)$. Explanation: aceasta este o singură celulă (cu $Y=0$), nu toată probabilitatea lui $X=0$.

### L6 exercises

#### L6.e1: ex. 0.15 (B:38-39), `[caiet]`, answer status book

**Enunț:** $A, B, C$ binare cu distribuția comună uniformă: $P(A,B,C)=\frac18$ pentru fiecare dintre cele opt rânduri. **a.** Este $A$ independentă condiționat de $B$ în raport cu $C$? **b.** Dacă da, faceți o schimbare în primele două rânduri ale tabelului pentru a obține o distribuție la care răspunsul devine nu (dacă nu, invers).

**Fields:** `a` tf `da`; `b1` frac "după schimbarea $P(0,0,0)=\frac14$, $P(0,0,1)=0$: $P(A{=}0\mid B{=}0,C{=}0)$" `2/3`; `b2` frac "$P(A{=}0\mid C{=}0)$" `3/5`; `b` tf "A⊥B|C după schimbare?" `nu`.

**Hints:** 1) Forma convenabilă: $P(A{=}a\mid B{=}b,C{=}c)=P(A{=}a\mid C{=}c)$, bună dacă $P(B{=}b,C{=}c)\ne0$. 2) Compară cele două probabilități pentru toate valorile $a, b, c$. 3) Cu toate rândurile $\frac18$, fiecare probabilitate condiționată este $\frac12$.

**Worked solution (book):** (a) da: pentru $(0,0,0)$: $P(A{=}0\mid B{=}0,C{=}0)=\frac{1/8}{2\cdot1/8}=\frac12$ and $P(A{=}0\mid C{=}0)=\frac{2/8}{4/8}=\frac12$; the same values in every other case. (b) One possible change (sum kept 1): first two rows $\frac14$ and $0$: $P(A{=}0\mid B{=}0,C{=}0)=\frac{1/4}{1/4+1/8}=\frac23$ and $P(A{=}0\mid C{=}0)=\frac{1/4+1/8}{1/4+1/8+1/8+1/8}=\frac35$; one case with unequal values is enough.

**Detectors:** `a` = `nu` → "Toate rândurile au aceeași probabilitate, deci $P(A{=}0\mid B{=}b,C{=}c)=\frac12=P(A{=}0\mid C{=}c)$ pentru toate $b, c$." `b` = `da` → "$\frac23\ne\frac35$: o singură nepotrivire ajunge pentru a respinge independența condiționată."

**Builder:** the book asks the learner to choose the change; the fixed change above is the book's example. The builder may also accept any pair $(u,v)$ with $u+v=\frac14$ for the first two rows and check $A\perp B\mid C$ with the script.

#### L6.e2: ex. 0.16 (B:39-42), `[caiet]`, answer status book

**Enunț:** $X,Y,Z\in\{0,1\}$. Distribuția comună $P(X,Y,Z)$:

| | $Z=0$, $X=0$ | $Z=0$, $X=1$ | $Z=1$, $X=0$ | $Z=1$, $X=1$ |
|---|---|---|---|---|
| $Y=0$ | 1/24 | 1/12 | 1/12 | 5/24 |
| $Y=1$ | 1/12 | $p$ | $q$ | 7/24 |

**a.** Presupunând că $X$ și $Y$ sunt independente, găsiți $p$ și $q$. **b.** Cu valorile lui $p$ și $q$ de la (a), sunt $X$ și $Y$ independente condiționat de $Z$? De ce?

**Fields:** `s` frac "$p+q$ (din suma tuturor celulelor)" `5/24`; `p` frac `7/60`; `q` frac `11/120`; `pz` frac "$P(Z{=}0)$" `13/40`; `l` frac "$P(X{=}0,Y{=}0,Z{=}0)\cdot P(Z{=}0)$" `13/960`; `r` frac "$P(X{=}0,Z{=}0)\cdot P(Y{=}0,Z{=}0)$" `1/64`; `ci` tf `nu`.

**Hints:** 1) Marginalizează pe $Z$: $P(0,0)=\frac18$, $P(1,0)=\frac7{24}$, $P(0,1)=\frac1{12}+q$, $P(1,1)=\frac7{24}+p$; apoi marginalele $P(X)$ și $P(Y)$. 2) Suma tuturor celulelor e 1: $p+q=\frac5{24}$; independența în celula $(0,0)$: $\frac18=\left(\frac5{12}-p\right)\cdot\frac5{12}$. 3) (b) Alege $x=y=z=0$ și compară $P(0,0,0)\,P(Z{=}0)$ cu $P(0,Z{=}0)\,P(Y{=}0,Z{=}0)$.

**Worked solution (book):** marginals: $P(X{=}0)=\frac5{24}+q$, $P(X{=}1)=\frac7{12}+p$, $P(Y{=}0)=\frac5{12}$, $P(Y{=}1)=\frac7{12}$. With $p+q=\frac5{24}$: $P(X{=}0)=\frac5{12}-p$. Cell $(0,0)$: $\frac18=\left(\frac5{12}-p\right)\frac5{12}\Rightarrow\frac5{12}-p=\frac3{10}\Rightarrow p=\frac7{60}$, $q=\frac5{24}-\frac7{60}=\frac{11}{120}$; $P(X)=\left(\frac3{10},\frac7{10}\right)$. The other three cells must be checked too (the system may be overdetermined): they all hold (two of three suffice, the last follows from sums). (b) $P(Z{=}0)=\frac5{24}+p=\frac{13}{40}$, $P(Z{=}1)=\frac{27}{40}$. For $x=y=z=0$ the condition is $P(0,0,0)\,P(Z{=}0)=P(0,Z{=}0)\,P(Y{=}0,Z{=}0)$: $\frac1{24}\cdot\frac{13}{40}=\frac{13}{960}$ against $\left(\frac1{24}+\frac1{12}\right)^2=\frac18\cdot\frac18=\frac1{64}=\frac{15}{960}$. Not equal: **not** conditionally independent. Remark (book): independence does not imply conditional independence.

**Detectors:** `ci` = `da` → "Independența nu implică independența condiționată: la $x=y=z=0$, $\frac{13}{960}\ne\frac1{64}$." `p` = `5/24` → "$\frac5{24}$ este $p+q$; mai ai nevoie de ecuația din celula $(0,0)$." `l` = `1/64` → "Aceasta este membrul drept; membrul stâng este $\frac1{24}\cdot\frac{13}{40}$."

#### L6.e3: ex. 0.101 (B:219-220), `[slides]` PS:5-8, answer status verified-twice

**Enunț:** $X,Y,Z\in\{0,1\}$; distribuția comună:

| | $Z=0$, $X=0$ | $Z=0$, $X=1$ | $Z=1$, $X=0$ | $Z=1$, $X=1$ |
|---|---|---|---|---|
| $Y=0$ | 1/15 | 1/15 | 4/15 | 2/15 |
| $Y=1$ | 1/10 | 1/10 | 8/45 | 4/45 |

(de exemplu $P(X{=}0,Y{=}1,Z{=}0)=\frac1{10}$ și $P(X{=}1,Y{=}1,Z{=}1)=\frac4{45}$). **a.** Este $X$ independentă de $Y$? **b.** Este $X$ independentă condiționat de $Y$ în raport cu $Z$? **c.** Calculați $P(X{=}0\mid X+Y>0)$.

**Fields:** `px` frac "$P(X{=}0)$" `11/18`; `py` frac "$P(Y{=}0)$" `8/15`; `p00` frac "$P(X{=}0,Y{=}0)$" `1/3`; `pr` frac "$P(X{=}0)P(Y{=}0)$" `44/135`; `a` tf `nu`; `c0` frac "$P(X{=}0\mid Z{=}0)$" `1/2`; `c1` frac "$P(X{=}0\mid Z{=}1)$" `2/3`; `b` tf `da`; `n` frac "$P(X{=}0,\,X{+}Y>0)$" `5/18`; `d` frac "$P(X{+}Y>0)$" `2/3`; `r` frac `5/12`.

**Hints:** 1) (a) Marginalizează: $P(X{=}0)$ și $P(Y{=}0)$ se obțin adunând celulele; compară $P(0,0)$ cu produsul. 2) (b) Verifică $P(X{=}0\mid Y{=}y,Z{=}z)=P(X{=}0\mid Z{=}z)$ pentru toate patru perechile $(y,z)$: valorile sunt $\frac12,\frac12$ pentru $z=0$ și $\frac23,\frac23$ pentru $z=1$. 3) (c) Evenimentul $X+Y>0$ exclude doar celulele cu $X=0,Y=0$.

**Worked solution (slides):** (a) $P(X{=}0)=\frac1{15}+\frac1{10}+\frac4{15}+\frac8{45}=\frac{11}{18}$; $P(Y{=}0)=\frac8{15}$; $P(X{=}0,Y{=}0)=\frac13$ against $\frac{11}{18}\cdot\frac8{15}=\frac{44}{135}$: **nu** sunt independente (also $P(X{=}0\mid Y{=}0)=\frac58\ne\frac{11}{18}$). (b) $P(X{=}0\mid Z{=}0)=\frac{1/15+1/10}{1/15+1/15+1/10+1/10}=\frac12$ and $P(X{=}0\mid Z{=}1)=\frac23$; $P(X{=}0\mid Y{=}y,Z{=}0)=\frac12$ for $y=0,1$ and $P(X{=}0\mid Y{=}y,Z{=}1)=\frac23$: all 8 equalities of the definition hold: **da**, $X\perp Y\mid Z$. (c) numerator $P(X{=}0,Y{=}1)=\frac1{10}+\frac8{45}=\frac5{18}$; denominator $1-P(X{=}0,Y{=}0)=\frac23$; the ratio is $\frac5{12}$. The opposite of 0.16: dependent but conditionally independent. Slides PS:5-8 solve this exercise (partly in English).

**Detectors:** `a` = `da` → "Independența se verifică pe toate celulele: $P(0,0)=\frac13\ne\frac{44}{135}$." `r` = `5/18` → "Aceasta este numărătorul; împarte la $P(X{+}Y>0)=\frac23$." `r` = `11/18` → "Aceasta este $P(X{=}0)$; condiția $X+Y>0$ schimbă spațiul și exclude celula $(0,0)$." `b` = `nu` → "Verifică feliile: $\frac12=\frac12$ pentru $Z=0$ și $\frac23=\frac23$ pentru $Z=1$."

#### L6.e4: ex. 0.102 (B:220), answer status verified-twice (reasoned from Bayes)

**Enunț:** Variabilele $H, E_1, E_2$ (aici $P(H)$, $P(E_1\mid H)$, $P(E_2\mid H)$ înseamnă tabelele pentru toate valorile). Vrem $P(H\mid E_1,E_2)$. **a.** Fără informații de independență condiționată, care dintre seturile de numere sunt suficiente? (i) $P(E_1,E_2)$, $P(H)$, $P(E_1\mid H)$, $P(E_2\mid H)$; (ii) $P(E_1,E_2)$, $P(H)$, $P(E_1,E_2\mid H)$; (iii) $P(H)$, $P(E_1\mid H)$, $P(E_2\mid H)$. **b.** Presupunem $P(E_1\mid E_2,H)=P(E_1\mid H)$ pentru toate valorile (deci $E_1\perp E_2\mid H$). Care seturi sunt acum suficiente?

**Fields:** `ai` tf `nu`; `aii` tf `da`; `aiii` tf `nu`; `bi` tf `da`; `bii` tf `da`; `biii` tf `da`.

**Hints:** 1) Bayes: $P(H\mid E_1,E_2)=\dfrac{P(E_1,E_2\mid H)\,P(H)}{P(E_1,E_2)}$. 2) Ce are nevoie formula: $P(E_1,E_2\mid H)$, $P(H)$, $P(E_1,E_2)$. 3) (b) Cu independență condiționată $P(E_1,E_2\mid H)=P(E_1\mid H)P(E_2\mid H)$, iar $P(E_1,E_2)=\sum_hP(h)P(E_1\mid h)P(E_2\mid h)$ (probabilitatea totală).

**Worked solution:** (a) only (ii) has all three ingredients. (i) and (iii) lack $P(E_1,E_2\mid H)$; the pair of marginals $P(E_1\mid H)$, $P(E_2\mid H)$ does not determine it (the same situation as $X+Y$ and the marginals in Lecția 4); (iii) also lacks $P(E_1,E_2)$. (b) With $E_1\perp E_2\mid H$, $P(E_1,E_2\mid H)=P(E_1\mid H)P(E_2\mid H)$, so (i) works (its extra $P(E_1,E_2)$ is given), (ii) works, and (iii) works because $P(E_1,E_2)$ comes from the total probability formula. Culegerea nu dă răspunsul; verificat de două ori.

**Detector:** `aiii` = `da` → "Setul (iii) nu dă $P(E_1,E_2\mid H)$: din marginalele $P(E_1\mid H)$ și $P(E_2\mid H)$ nu se poate construi probabilitatea comună fără independență condiționată."

#### L6.e5: ex. 0.103 (B:220), answer status verified-twice (proof)

**Enunț:** Arătați că dacă distribuția comună a lui $(X,Y)$ este independentă de $W$ în raport cu $Z$ (notație: $(X,Y)\perp W\mid Z$), atunci $X\perp W\mid Z$, și similar $Y\perp W\mid Z$.

**Proof screens.** 1. Ipoteza: $p(x,y,w\mid z)=p(x,y\mid z)\,p(w\mid z)$ pentru toate $x,y,w,z$. 2. "Ce însumăm ca să scăpăm de $Y$?" ✓ ambii membri după $y$. ✗[însumare după z] după $z$: condiția $Z$ trebuie să rămână. 3. Stânga: $\sum_y p(x,y,w\mid z)=p(x,w\mid z)$ (marginalizare condiționată, fără independență). 4. Dreapta: $\sum_y p(x,y\mid z)\,p(w\mid z)=p(x\mid z)\,p(w\mid z)$ ($p(w\mid z)$ nu depinde de $y$). 5. Deci $p(x,w\mid z)=p(x\mid z)p(w\mid z)$: $X\perp W\mid Z$. Pentru $Y$: însumare după $x$. ∎

**Fields:** `c` choice "Variabila după care se însumează pentru a obține $X\perp W\mid Z$" ✓ `y`; ✗ `z`; ✗ `w`.

**Status:** the book gives no answer; the proof is the sum over $y$ (content map). The converse is not asked (see builder notes).

### L6 visual spec: `ml-viz-joint-table` (same widget as Lecția 5, with the "condiționează pe $Z$" option)

- **Data (config C, `[construit]`):** the 8-cell table of L6.s02 (rows $(X,Y)$, columns $Z$): 0,32 / 0,02; 0,08 / 0,08; 0,08 / 0,08; 0,02 / 0,32.
- **Steps:** (1) cells appear one prediction at a time, each as $P(z)P(x\mid z)P(y\mid z)$ (the learner predicts 0,32 first, then the rest follow the pattern 0,5·0,8·0,2 and so on). (2) toggle "ascunde $Z$": the two columns add into four cells (0,34 / 0,16 / 0,16 / 0,34); the independence check of Lecția 5 fails (0,25 against 0,34); the learner predicts $P(Y{=}1\mid X{=}1)$ (0,68). (3) toggle "condiționează pe $Z=0$": the column is renormalized by $P(Z{=}0)=0{,}5$ into 0,64 / 0,16 / 0,16 / 0,04; the learner predicts, cell by cell, whether the product of the slice marginals (0,8·0,8; 0,8·0,2; ...) matches; all four match. (4) switch to $Z=1$ and repeat (prediction: also independent).
- **Explorer mode (optional, not graded):** the data of 0.16 and 0.101 can be loaded; for 0.16 the slice $Z=0$ fails at $(0,0)$; for 0.101 both slices pass.
- **Learner predicts:** the first cell, the marginal dependence, the slice verdict per cell and per $z$.
- **Reduced motion:** renormalization is shown as a before/after swap without animation.

### L6 builder notes

- Sources: FND:16, Cn-s2:7 (weak and hard definitions), B:38-42 (0.15, 0.16), B:219-220 (0.101-0.103), PS:5-8 (0.101 solved), T20a 1.5b, T20b 1.4, T21P items 11, 13 (past tests asking conditional independence from tables; their numbers are not reused).
- All `[construit]` values (the noisy-witness table, its slices, the quiz numbers) were recomputed with exact fractions: $P(Y{=}1\mid X{=}1)=17/25$, cells $8/25, 2/25, 1/50$.
- Uncertain: in 0.102 the notation $P(H)$ is read as the full table over all values of $H$ (the book's variables are not necessarily boolean); with that reading (iii) suffices in (b). The content-map remark that the converse of 0.103 is false is the reader's claim and has no numeric check; it is not used on any screen.
- Repetition check: the idea "dependent but conditionally independent" is shown once (L6.s02-s04) and used as data in 0.101; 0.16 is the opposite direction; the plain statement of both appears once in L6.s05.

---

## Lecția 7 (`ml-l07`). Entropia

**Priority A.** **Necesită:** vezi Lecția 4 (variabilă aleatoare, $Val(X)$, media $E[X]$ ca medie ponderată, Bernoulli). Nimic altceva.

**Titlu (RO):** Entropia: cât de nesigur ești înainte să vezi rezultatul

**Concepte (3):**
- (a) informația (surpriza) unui eveniment, $\log\frac{1}{p}$, în biți;
- (b) entropia $H(X)$ ca surpriză medie; entropia unui set de date $H[a{+},b{-}]$; convenția $0\log 0=0$;
- (c) entropia Bernoulli $H(p)$ (simetrie, maxim în $1/2$) și regula de verificare $0\le H\le\log k$.

**Owned (from allocation):** definitions: surprise, $H(X)$, $H[a{+},b{-}]$, interpretations, $\log_2 x=\ln x/\ln 2$; properties: $H\ge0$ with $H=0$ iff constant, $0\le H\le\log k$ with max at uniform (statement only; proof in L23), $H(p)=H(1-p)$, $H[n{+},n{-}]=1$, $H[0{+},n{-}]=0$, range-check rule; proof 0.55.a; data: Cn-s3:7 set 0,0,0,1,1,0; 0.56 two dice; 0.140; exercises 0.55.a, 0.56.a, 0.56.b, 0.56.c, 0.140.

### Pretest

Data on the same screen: trei saci cu bile roșii (+) și albastre (−): **Sacul A** $[4{+},4{-}]$, **Sacul B** $[8{+},0{-}]$, **Sacul C** $[7{+},1{-}]$.

RO: "Scoți o bilă fără să te uiți. La care sac ești mai nesigur ce culoare iese? Ordonează sacii de la cel mai sigur la cel mai nesigur. Apoi: ce număr ai putea asocia fiecărui sac, ca să iasă exact ordinea ta?"

- **Expected:** B (cel mai sigur), C, A (cel mai nesigur). Part 2 has no known answer yet; accepted free answer, then reveal: "Numărul se numește entropie; îl construiești în pașii următori."
- Builder: the ordering is auto-checked (choice of three orderings). Values for the builder only (not shown): $H[8{+},0{-}]=0$, $H[7{+},1{-}]=0.5436$, $H[4{+},4{-}]=1$.

### Concret (worked example, Cn-s3:1-7; data owned only here)

Setul de date: șase aruncări ale unei monede, rezultatele **0, 0, 0, 1, 1, 0**.

| Ecran | Se arată | Învățăcelul prezice | Valoarea corectă |
|---|---|---|---|
| 1 | Cele șase valori | Care sunt frecvențele relative $P(0)$ și $P(1)$? | $P(0)=\frac46=\frac23$, $P(1)=\frac26=\frac13$ (aici le luăm ca probabilități) |
| 2 | Definiția: surpriza lui $x$ este $\log\frac{1}{P(x)}$ biți | Surpriza la un 1? la un 0? (se dă $\log_2 3=1.585$) | Un 1: $\log 3=1.585$ biți. Un 0: $\log\frac32=0.585$ biți. Rarul surprinde mai mult. |
| 3 | Cele două surprize cu ponderile lor | Surpriza medie, adică $\frac23\cdot0.585+\frac13\cdot1.585$ | $0.3900+0.5283=\mathbf{0.9183}$ biți. Acesta e $H(X)$. (Notele de seminar tipăresc 0.9182, trunchiat.) |
| 4 | Același set scris $H[2{+},4{-}]$ (0→−, 1→+) | $H[0{+},6{-}]$? $H[3{+},3{-}]$? | $0$ (nicio surpriză: rezultatul se știe) și $1$ (două rezultate la fel de probabile). Aici apare $0\cdot\log0=0$. |
| 5 | Bara de entropie (viz 3, vezi mai jos) | Care are entropie mai mare: $[2{+},4{-}]$ sau $[1{+},5{-}]$? Dar $[4{+},4{-}]$ sau $[6{+},2{-}]$? | $0.9183>0.6500$; $1>0.8113$ |

RO (ecran 3, text): "Entropia este **surpriza medie**: fiecare rezultat contribuie cu surpriza lui, ponderată cu cât de des apare."

### Regula (definitions with sources)

- **R1.** Informația (surpriza) unui eveniment de probabilitate $p$: $\log\frac{1}{p}=-\log p$ biți (B:132, FND:33; Cn-s3:2).
- **R2.** $H(X)=-\sum_i P(X=x_i)\log P(X=x_i)=E_X[-\log P(X)]$; convenția $0\cdot\log0=0$; în aceste lecții $\log=\log_2$ (B:129 și nota 121).
- **R3.** Set de date: frecvențele relative joacă rolul probabilităților; $H[a{+},b{-}]=-\frac{a}{a+b}\log\frac{a}{a+b}-\frac{b}{a+b}\log\frac{b}{a+b}$ (Cn-s3:7). Interpretări: surpriza medie, incertitudinea, dezordinea (impuritatea) unui set (Cn-s3:4, 7).
- **R4.** Bernoulli: $H(p)=-p\log p-(1-p)\log(1-p)$; $H(p)=H(1-p)$; maxim $1$ în $p=\frac12$; $H(0)=H(1)=0$ (FND:34, ML3:12). $H[n{+},n{-}]=1$, $H[0{+},n{-}]=0$.
- **R5.** Proprietăți (FND:35): $H(X)\ge0$, $H(X)=0$ dacă și numai dacă $X$ e constantă; $0\le H(X)\le\log k$ cu $k=|Val(X)|$, maxim la distribuția uniformă (enunț; demonstrația e în Lecția 23).
- **R6.** Regula de verificare (Cn-s3:5): o entropie negativă sau peste $\log k$ înseamnă că ai greșit calculul.
- **R7.** Calculatorul: $\log_2x=\frac{\ln x}{\ln2}=\frac{\log_{10}x}{\log_{10}2}$ (Cn-s3:2).

### De ce?

RO: "O monedă cade pe 0 cu probabilitatea 0.0001 și pe 1 cu 0.9999. Dacă iese 0, surpriza e de 13.29 biți, enormă. Totuși entropia monedei este doar 0.0015 biți. De ce?"

- **Answer:** entropia e o medie ponderată cu probabilitățile. Surpriza uriașă apare o dată la 10000 de aruncări: contribuie $0.0001\cdot13.2877=0.0013288$. Rezultatul obișnuit costă doar $\log\frac{1}{0.9999}=0.000144$ biți și contribuie $0.9999\cdot0.000144=0.000144$. Suma: $0.001473$ (Cn-s3:2 tipărește 0.001473). Nu contează cât de mare e o surpriză, ci cât de des se plătește.
- Numbers: surprise(0)=13.2877, surprise(1)=0.000144, H=0.0014730.

### Demonstrație (ecrane cu predicție): 0.55.a, $H(X)\ge0$ și $H(X)=0\Leftrightarrow X$ constantă (B:130-131, PS:136; DEM:1)

| Pas | Se arată | Învățăcelul prezice | Corect |
|---|---|---|---|
| 1 | $H(X)=\sum_iP(x_i)\log\frac{1}{P(x_i)}$ | Semnul fiecărui factor? | $P(x_i)\ge0$; $P(x_i)\le1$ deci $\frac{1}{P(x_i)}\ge1$ deci $\log\frac{1}{P(x_i)}\ge0$. Fiecare termen $\ge0$, deci $H(X)\ge0$. |
| 2 | Presupunem $H(X)=0$ | Când poate fi nulă o sumă de termeni $\ge0$? | Doar dacă fiecare termen e $0$: pentru orice $i$, $P(x_i)=0$ sau $\log\frac{1}{P(x_i)}=0$, adică $P(x_i)=0$ sau $P(x_i)=1$. |
| 3 | Dar $\sum_iP(x_i)=1$ | Câte valori pot avea probabilitatea 1? | Exact una: $P(x_1)=1$, restul $0$. Deci $X$ e constantă (nota 122 din carte: eventual în afara unei mulțimi de probabilitate 0). |
| 4 | Invers: $X$ constantă | Cât e $H(X)$? | $P(x_1)=1$, $H(X)=-1\cdot\log1=0$. |

### Vizual (viz 3, "Bară de entropie"; shared with L8 bars)

- **Data:** o bară împărțită în $a$ pătrate "+" și $b$ pătrate "−"; sub ea valoarea $H[a{+},b{-}]$ și, alături, curba $H(p)$ cu un punct mobil la $p=\frac{a}{a+b}$.
- **Steps (manual advance, no autoplay):** (1) bară $[2{+},4{-}]$ vs bară $[1{+},5{-}]$: învățăcelul alege care are $H$ mai mare, apoi se arată $0.9183$ și $0.6500$ și punctele pe curbă; (2) $[4{+},4{-}]$ vs $[6{+},2{-}]$: $1$ vs $0.8113$; (3) învățăcelul trage punctul pe curbă și prezice unde e maximul ($p=\frac12$, $H=1$) înainte să fie colorat; (4) comutator "oglindă": $[1{+},7{-}]$ devine $[7{+},1{-}]$ și punctul sare simetric (valoare $0.5436$ în ambele).
- **Predicted each time:** "mai mare / mai mică / egală", before the value appears.

### Retrieve (4 itemi, numere noi; fiecare opțiune are explicație)

1. **Variabilă cu 8 valori, care e entropia maximă posibilă?**
   - ✓ $3$ biți ($\log 8$, la distribuția uniformă).
   - ✗[mărginită de 1] $1$ bit: "entropia nu depășește 1" e adevărat doar pentru Bernoulli; limita este $\log k$.
   - ✗[numărul de valori] $8$ biți: 8 e numărul de valori, nu logaritmul lui.
   - ✗[ln în loc de log₂] $2.08$ biți: $\ln 8=2.0794$ e în nats, nu în biți.
2. **Cât este $\log 0.125$ (în baza 2)?**
   - ✓ $-3$ ($0.125=2^{-3}$).
   - ✗[semn pierdut] $3$: asta e surpriza $\log\frac{1}{0.125}$, nu logaritmul.
   - ✗[log₁₀] $-0.903$: acesta este $\log_{10}0.125$, logaritmul zecimal; în aceste lecții $\log$ înseamnă baza 2.
   - ✗[ln] $-2.079$: acesta este $\ln0.125$, logaritmul natural; în baza 2 se împarte la $\ln2$: $-2.079/0.693=-3$.
3. **O monedă cu $P(1)=0.1$. Cât este $H$?**
   - ✓ $0.469$ biți.
   - ✗[H = probabilitatea clasei rare] $0.1$: entropia nu e o probabilitate.
   - ✗[H = probabilitatea clasei majoritare] $0.9$: nici aceasta nu e entropia, ci probabilitatea clasei majoritare; o monedă care dă aproape mereu același rezultat are entropie mică, departe de 1 bit.
   - ✗[doar termenul rar] $0.332$: ai luat doar $-0.1\log0.1$ și ai uitat termenul $-0.9\log0.9=0.1368$.
4. **$H[5{+},3{-}]$ și $H[3{+},5{-}]$: care e mai mare?**
   - ✓ Sunt egale ($0.9544$ ambele), fiindcă $H(p)=H(1-p)$.
   - ✗[clasa majoritară contează] Prima e mai mare, cu mai multe pozitive: entropia depinde doar de proporții ($\frac58$ și $\frac38$ în ambele), nu de ce clasă e majoritară.
   - ✗[etichetele contează] A doua e mai mare, cu mai multe negative: schimbarea etichetelor $+\leftrightarrow-$ schimbă doar ordinea celor doi termeni din $H$, nu suma lor.

### Exerciții (book: 0.55.a în demonstrația de mai sus; 0.56.a-c, 0.140 sunt calcule)

**Ex 1 (0.56.a, B:132; status: book).** Enunț: "Se aruncă două zaruri perfecte cu 6 fețe. $S$ este suma celor două numere. Scrie distribuția lui $S$."
- **Fields:** pentru $s=2,\dots,12$ numărătorul $k_s$ din $P(S=s)=\frac{k_s}{36}$; expected $1,2,3,4,5,6,5,4,3,2,1$; exact (fracții echivalente acceptate, ex. $\frac1{18}$ pentru $\frac2{36}$).
- **Hints:** (1) cele 36 de perechi $(a,b)$ sunt la fel de probabile; (2) numără perechile cu $a+b=s$: pentru $s=2$ doar $(1,1)$; (3) pentru $s=7$ sunt șase: $(1,6),(2,5),\dots,(6,1)$; numerele cresc până la 7 și apoi scad simetric.
- **Soluție (cartea):** tabelul $S: 2..12$ cu $\frac{1}{36},\frac{2}{36},\frac{3}{36},\frac{4}{36},\frac{5}{36},\frac{6}{36},\frac{5}{36},\frac{4}{36},\frac{3}{36},\frac{2}{36},\frac{1}{36}$.
- **Detectori:** toate valorile $\frac{1}{11}$ -> [echiprobabilitate pe sume]: cele 36 de perechi sunt la fel de probabile, nu cele 11 sume; numărători $1,1,2,2,3,3,3,2,2,1,1$ (suma 21) -> [perechi neordonate]: $(1,6)$ și $(6,1)$ sunt rezultate diferite ale celor două zaruri, deci 36 de cazuri, nu 21; orice altă listă cu suma numărătorilor diferită de 36 -> "probabilitățile trebuie să însumeze 1".

**Ex 2 (0.56.b, B:132-133; status: book).** Enunț: "Surpriza la observarea lui $S$ este $\log\frac{1}{P(S)}$ biți. Cât de surprins ești la $S=2$, $S=11$, $S=5$, $S=7$? Poți folosi $\log_23=1.584962501$."
- **Fields:** $S=2$: $5.1699$; $S=11$: $4.1699$; $S=5$: $3.1699$; $S=7$: $2.5850$; tolerance $\pm0.001$ (cartea tipărește 5.169925001, 4.169925001, 3.169925001, 2.584962501).
- **Hints:** (1) ia probabilitățile din Ex 1: $\frac1{36},\frac2{36},\frac4{36},\frac6{36}$; (2) $\log\frac{36}{k}$: $\log36=2(1+\log3)$; (3) $\log18=1+2\log3$, $\log9=2\log3$, $\log6=1+\log3$.
- **Soluție (cartea):** $S=2$: $\log36=2(1+\log3)=5.1699$; $S=11$: $\log18=1+2\log3=4.1699$; $S=5$: $\log9=2\log3=3.1699$; $S=7$: $\log6=1+\log3=2.5850$.
- **Detectori:** $3.5835$ la $S=2$ -> [ln în loc de log₂] ($\ln36$); $-5.17$ -> [semn pierdut]: surpriza e $\ge0$; $0.0278$ -> [ai dat probabilitatea, nu surpriza]; $5.1699$ la $S=7$ și $2.5850$ la $S=2$ -> [probabilități inversate]: cea mai rară sumă surprinde cel mai mult.

**Ex 3 (0.56.c, B:133; status: book).** Enunț: "Calculează entropia lui $S$."
- **Field:** $H(S)=3.2744$ biți, tolerance $\pm0.001$ (cartea: 3.274401919).
- **Hints:** (1) $H(S)$ este media ponderată a surprizelor din Ex 2 (și a celorlalte șase); (2) valorile simetrice ($s$ și $14-s$) au aceeași probabilitate, deci termenii apar câte doi; (3) $H=\frac1{36}\big(2\log36+4\log18+6\log12+8\log9+10\log\frac{36}{5}+6\log6\big)$.
- **Soluție (cartea):** după simplificare $H(S)=\frac{1}{36}\,(60\log3+46-10\log5)=3.2744$ biți.
- **Detectori:** $3.679$ -> [medie nepoderată a surprizelor] (suma celor 11 surprize / 11): depășește și $\log11=3.459$, deci e peste limită; $3.459$ -> [ai presupus distribuție uniformă pe 11 sume] ($\log11$ e doar plafonul); $2.2696$ -> [ln în loc de log₂]; $1.8526$ -> [ai numărat o singură dată valorile simetrice]; $-3.2744$ -> [semn pierdut în $-\sum p\log p$]; orice valoare $>\log11=3.4594$ -> alarma de interval.

**Ex 4 (0.140, B:241; status: verified-twice).** Enunț: "Cât este entropia distribuției discrete $[0.0625,\ 0.0625,\ 0.125,\ 0.25,\ 0.5]$?"
- **Field:** $H=1.875$ biți, tolerance $\pm0.001$.
- **Hints:** (1) $0.0625=2^{-4}$, $0.125=2^{-3}$, $0.25=2^{-2}$, $0.5=2^{-1}$, deci surprizele sunt $4,4,3,2,1$; (2) $H=\sum p\cdot\text{surpriza}$; (3) $2\cdot0.0625\cdot4+0.125\cdot3+0.25\cdot2+0.5\cdot1$.
- **Soluție:** $0.5+0.375+0.5+0.5=1.875$ biți. Verificare: $\log5=2.3219\ge1.875\ge0$. Culegerea nu dă răspunsul; verificat de două ori.
- **Detectori:** $\approx5.6$ -> [log greșit]: depășește $\log5=2.3219$; logaritmii corecți sunt $4,4,3,2,1$; $2.8$ -> [medie nepoderată] ($14/5$); $1.2997$ -> [ln în loc de log₂]; $2.3219$ -> [ai presupus uniformă] ($\log5$ e doar plafonul); $-1.875$ -> [semn pierdut].

### Builder notes (L7)

- Sources: Cn-s3:1-7; B:129-134, 241; FND:33-35; ML3:12; PS:134-144 (solved 0.55, 0.56). 0.55.a/0.56 are `book`, 0.140 `verified-twice`.
- Not owned here (do not add): chain rule, conditional entropy, IG (L8); proof of $H\le\log k$ (L23); MLE name (L18); H[a+,b−] closed form `(1/(a+b))·log2((a+b)^(a+b)/(a^a b^b))` and the min/(a+b) comparison trick (L10).
- The word "surpriză" is the seminar's; the book uses "Information(P(X=x)) = Surprise(P(X=x))" (B:132).
- Uncertain: none.

---

## Lecția 8 (`ml-l08`). Entropia condiționată și câștigul de informație

**Priority A.** **Necesită:** vezi Lecția 5 (distribuție comună, marginale, condiționate, independența variabilelor) și Lecția 7 (entropia $H$, $H[a{+},b{-}]$, $0\log0=0$).

**Titlu (RO):** Cât te ajută să afli o variabilă când vrei s-o ghicești pe alta

**Concepte (4):**
- (a) entropia condiționată specifică $H(Y|X=x)$;
- (b) entropia condiționată medie $H(Y|X)=\sum_xP(x)H(Y|X=x)$ (cu ponderi);
- (c) entropia comună $H(X,Y)$ și regula de înlănțuire;
- (d) câștigul de informație $IG(X;Y)$ (informația mutuală), simetric.

**Owned:** definitions $H(Y|X=x)$, $H(Y|X)$, $H(X,Y)$, $IG$, notation $IG_{0/A}=H_0-H_{0/A}$ (Cn-s3:11), "$H(Y|X)$ nu e entropia unei variabile $Y|X$" (Cn-s3:4); properties: chain rule (also n variables), $IG$ symmetric and $=H(X,Y)-H(X|Y)-H(Y|X)$, $IG\ge0$ and $IG=0$ iff independent (statement; direct proof L23), $IG(X;X)=H(X)$, $IG\le\min(H(X),H(Y))$, $H(X|Y)\le H(X)$, $H(X,Y)\le H(X)+H(Y)$ (statement; L23), pairs independent of Z can jointly inform (0.141.d); proofs 0.141.a-c, 0.55.b, 0.55.c; exercises 0.55.b, 0.55.c, 0.56.d, 0.57, 0.141, 0.142.

### Pretest

Data on the same screen: tabelul cu cele zece apartamente din exemplul lucrat de mai jos ($X$ = zona, Centru / Periferie; $Y$ = chiria, Scumpă / Ieftină; numărătorile 3, 1 / 2, 4).

RO: "Afli zona unui apartament și încerci să-i ghicești chiria. Apoi invers: afli chiria și încerci să-i ghicești zona. În care caz scade mai mult nesiguranța, măsurată în biți?"

- **Expected:** la fel (câștigul de informație este simetric: $0.1245$ biți în ambele sensuri). Choice of three: "afli zona", "afli chiria", "la fel". After the answer: "Păstrează răspunsul; îl verifici în exemplul de mai jos." The payoff is screen 7 of the worked example; the reason is the "De ce?" screen. `[construit]`
- Builder: an earlier draft used two stumps here (one perfect, one useless); that is the root choice owned by Lecția 9 and it was also the pretest of L9 and L10, so it was replaced.

### Concret (worked example, constructed; data owned only here)

Zece apartamente. $X$ = zona (Centru / Periferie), $Y$ = chiria (Scumpă / Ieftină). Numărul de apartamente:

| | $Y$=Scumpă | $Y$=Ieftină | total |
|---|---|---|---|
| $X$=Centru | 3 | 1 | 4 |
| $X$=Periferie | 2 | 4 | 6 |
| total | 5 | 5 | 10 |

| Ecran | Se arată | Învățăcelul prezice | Valoarea corectă |
|---|---|---|---|
| 1 | Tabelul cu totaluri | $P(X)$ și $P(Y)$ | $P(X)=(0.4,\ 0.6)$, $P(Y)=(0.5,\ 0.5)$ |
| 2 | Cele două marginale | $H(Y)$, apoi $H(X)$ | $H(Y)=1$ ($5$ cu $5$); $H(X)=H(0.4,0.6)=0.9710$ |
| 3 | Doar apartamentele din Centru: $[3{+},1{-}]$ | $H(Y|X=\text{Centru})$ | $0.8113$ |
| 4 | Doar cele din Periferie: $[2{+},4{-}]$ | $H(Y|X=\text{Periferie})$ | $0.9183$ |
| 5 | Ponderile $0.4$ și $0.6$ | $H(Y|X)$: media simplă $0.8648$ sau cu ponderi? | cu ponderi: $0.4\cdot0.8113+0.6\cdot0.9183=\mathbf{0.8755}$ (media simplă $0.8648$ ar fi greșită) |
| 6 | $H(Y)-H(Y|X)$ | $IG(Y;X)$ | $1-0.8755=\mathbf{0.1245}$ biți |
| 7 | Sensul invers: dintre apartamentele scumpe $[3\text{ C},2\text{ P}]$, dintre ieftine $[1\text{ C},4\text{ P}]$ | $H(X|Y)$, apoi $IG(X;Y)=H(X)-H(X|Y)$. Va fi egal cu cel de la ecranul 6? | $H(X|Y=\text{Scumpă})=0.9710$, $H(X|Y=\text{Ieftină})=0.7219$, $H(X|Y)=0.5\cdot0.9710+0.5\cdot0.7219=0.8464$; $IG(X;Y)=0.9710-0.8464=0.1245$. **Da, același număr.** |
| 8 | Probabilitățile comune $0.3,\,0.1,\,0.2,\,0.4$ | $H(X,Y)$ și verificarea celor două lanțuri | $H(X,Y)=1.84644$; $H(X)+H(Y|X)=0.97095+0.87549=1.84644$; $H(Y)+H(X|Y)=1+0.84644=1.84644$ (arată 5 zecimale ca sumele să se potrivească) |
| 9 | Bare: $H(Y)$, $H(Y|X)$, diferența (viz) | Ce parte din $H(Y)$ se "pierde" după ce afli $X$? | $0.1245$ din $1$ |

Check the builder script must confirm: $IG=H(X)+H(Y)-H(X,Y)=0.97095+1-1.84644=0.12451$; $H(X,Y)-H(X|Y)-H(Y|X)=1.84644-0.84644-0.87549=0.12451$; the KL-form $\sum p(x,y)\log\frac{p(x,y)}{p(x)p(y)}=0.12451$.

### Regula (definitions with sources)

- **R1.** $H(Y|X=x_k)=-\sum_jP(Y=y_j|X=x_k)\log P(Y=y_j|X=x_k)$: entropia lui $Y$ în grupul în care $X=x_k$ (B:130).
- **R2.** $H(Y|X)=\sum_kP(X=x_k)\,H(Y|X=x_k)=-\sum_i\sum_jP(x_i,y_j)\log P(y_j|x_i)$ (B:130; forma cu dublă sumă e 0.55.b). $H(Y|X)$ **nu** e entropia unei variabile "Y|X": e o medie pe grupuri, cu ponderile $P(x_k)$ (Cn-s3:4).
- **R3.** $H(X,Y)=-\sum_i\sum_jP(x_i,y_j)\log P(x_i,y_j)$ și regula de înlănțuire $H(X,Y)=H(X)+H(Y|X)=H(Y)+H(X|Y)$; pentru $n$ variabile $H(X_1,\dots,X_n)=H(X_1)+H(X_2|X_1)+\dots+H(X_n|X_1,\dots,X_{n-1})$ (B:130-132). Intuiția: pentru a afla $(X,Y)$, afli întâi $X$, apoi $Y$ știind $X$ (Cn-s3:4).
- **R4.** $IG(X;Y)=H(X)-H(X|Y)=H(Y)-H(Y|X)$ (informația mutuală $MI$); echivalent $IG(X;Y)=H(X,Y)-H(X|Y)-H(Y|X)$; simetric: $IG(X;Y)=IG(Y;X)$ (B:130; FND:33; Cn-s3:4). Notația seminarului pentru un nod 0 și un atribut $A$: $IG_{0/A}=H_0-H_{0/A}$ (Cn-s3:11).
- **R5.** Formula echivalentă $IG(X;Y)=\sum_x\sum_yP(x,y)\log\frac{P(x,y)}{P(x)P(y)}$ (B:241, relația 147; demonstrată mai jos la 0.141.a).
- **R6.** Proprietăți (FND:35): $IG(X;Y)\ge0$ și $IG(X;Y)=0$ dacă și numai dacă $X,Y$ independente; $IG(X;X)=H(X)$; $IG\le\min(H(X),H(Y))$; $H(X|Y)\le H(X)$ cu egalitate dacă și numai dacă independente; $H(X,Y)\le H(X)+H(Y)$ cu egalitate dacă și numai dacă independente. Demonstrațiile directe ale lui $IG\ge0$ și ale cazurilor de egalitate sunt în Lecția 23.
- **R7.** Aceeași regulă de verificare ca la entropie (Cn-s3:5): $IG$ negativ sau mai mare decât $\min(H(X),H(Y))$ înseamnă calcul greșit.

### De ce?

RO: "Formulele $H(X)-H(X|Y)$ și $H(Y)-H(Y|X)$ arată diferit. De ce dau mereu același număr?"

- **Answer:** din regula de înlănțuire, $H(X|Y)=H(X,Y)-H(Y)$ și $H(Y|X)=H(X,Y)-H(X)$. Deci ambele diferențe sunt egale cu $H(X)+H(Y)-H(X,Y)$, o expresie simetrică în $X$ și $Y$. În exemplul cu apartamente: $0.97095+1-1.84644=0.12451$.

### Demonstrații (ecrane cu predicție)

**0.55.b (B:131, PS:137): $H(Y|X)=-\sum_i\sum_jP(x_i,y_j)\log P(y_j|x_i)$**

| Pas | Se arată | Prezice | Corect |
|---|---|---|---|
| 1 | Definiția: $H(Y|X)=\sum_iP(x_i)H(Y|X=x_i)$ | Ce înlocuiești pentru $H(Y|X=x_i)$? | $-\sum_jP(y_j|x_i)\log P(y_j|x_i)$ |
| 2 | Introdu $P(x_i)$ în a doua sumă | Ce apare în fața logaritmului? | $-\sum_i\sum_jP(x_i)P(y_j|x_i)\log P(y_j|x_i)$ |
| 3 | Reunește produsul | Cu ce se înlocuiește $P(x_i)P(y_j|x_i)$? | $P(x_i,y_j)$ (regula de înmulțire). Rezultatul cerut. |

**0.55.c (B:131-132, PS:138-139): $H(X,Y)=H(X)+H(Y|X)=H(Y)+H(X|Y)$ și lanțul pentru $n$ variabile**

| Pas | Se arată | Prezice | Corect |
|---|---|---|---|
| 1 | $H(X,Y)=-\sum\sum p(x_i,y_j)\log p(x_i,y_j)$ | Cum scrii $p(x_i,y_j)$ cu regula de înmulțire? | $p(x_i)\,p(y_j|x_i)$ |
| 2 | Logaritmul unui produs | Ce devine $\log[p(x_i)p(y_j|x_i)]$? | $\log p(x_i)+\log p(y_j|x_i)$ |
| 3 | Împarte în două sume duble | Care sumă se simplifică și de ce? | În prima, $\sum_jp(y_j|x_i)=1$ (aditivitate numărabilă): rămâne $-\sum_ip(x_i)\log p(x_i)=H(X)$ |
| 4 | A doua sumă | Ce este? | $\sum_ip(x_i)\Big(-\sum_jp(y_j|x_i)\log p(y_j|x_i)\Big)=H(Y|X)$ |
| 5 | Cealaltă egalitate | Ce schimbi? | Același calcul cu $p(x_i,y_j)=p(y_j)\,p(x_i|y_j)$ dă $H(Y)+H(X|Y)$ |
| 6 | $n$ variabile (B:132) | Ce regulă pe probabilități folosești? | $P(X_1,\dots,X_n)=P(X_1)P(X_2|X_1)\cdots P(X_n|X_1,\dots,X_{n-1})$. Cu $H=E[-\log p]$, logaritmul face suma, iar fiecare termen $E[-\log p(x_k|x_1..x_{k-1})]$ este, după marginalizare, $H(X_k|X_1,\dots,X_{k-1})$ (se folosește punctul 0.55.b) |

**0.141.a (B:241, relațiile 142-147; PS:153): justifică fiecare egalitate din lanț**

| Pas (egalitatea) | Prezice (alege justificarea) | Corect |
|---|---|---|
| (142) $IG=H(X)-H(X|Y)$ | ? | definiția lui $IG$ |
| (143) $H(X)$ și $H(X|Y)$ scrise explicit | ? | definiția entropiei, respectiv forma cu dublă sumă (0.55.b) |
| (144) $H(X)$ ca sumă dublă | ? | marginalizare: $P(x)=\sum_yP(x,y)$, apoi se distribuie minusul |
| (145) factor comun $-P(x,y)$ | ? | distributivitatea |
| (146) $\log a-\log b=\log\frac ab$ | ? | proprietatea logaritmului |
| (147) $\frac{P(x)}{P(x|y)}=\frac{P(x)P(y)}{P(x,y)}$ | ? | $P(x|y)=\frac{P(x,y)}{P(y)}$ (probabilitatea condiționată) |

Rezultat: $IG(X;Y)=-\sum_x\sum_yP(x,y)\log\frac{P(x)P(y)}{P(x,y)}$.

**0.141.b (B:242): $X\perp Y\Rightarrow IG(X;Y)=0$.** Prezice: definiția independenței ($P(x,y)=P(x)P(y)$ pentru toate perechile de valori, vezi Lecția 5) $\Rightarrow$ raportul $\frac{P(x,y)}{P(x)P(y)}=1$ în fiecare termen $\Rightarrow$ $\log1=0$ $\Rightarrow$ suma e $0$.
**0.141.c: $IG(X;X)=H(X)$.** $IG(X;X)=H(X)-H(X|X)$. Prezice $H(X|X=x)$: dat fiind $X=x$, $X$ ia valoarea $x$ cu probabilitatea $1$, deci $H(X|X=x)=0$ pentru fiecare $x$, deci $H(X|X)=0$ și $IG(X;X)=H(X)$.
(Note for builder: "independența" is stated once in the form $P(x,y)=P(x)P(y)$ and the 2021 barem accepted the other form $P(x|y)=P(x)$ too (C-6); the lesson shows both and never calls either "slabă/tare".)

### Vizual (viz "bare de entropie" extinsă; cu diagrama Venn)

- **Data:** tabelul cu apartamente din exemplul lucrat; trei bare orizontale: $H(Y)=1$, $H(Y|X)=0.8755$, și diferența $IG=0.1245$ colorată separat. Alături diagrama Venn din carte (B:130): două cercuri $H(X)$ și $H(Y)$, intersecția $IG$, părțile exterioare $H(X|Y)$ și $H(Y|X)$, reuniunea $H(X,Y)$.
- **Steps:** (1) se arată bara $H(Y)$; învățăcelul prezice cât rămâne după ce afli $X$; (2) bara $H(Y|X)$ apare cu cele două ponderi $0.4$/$0.6$ vizibile; (3) diferența se colorează $=IG$; (4) comutator "invers": bara $H(X)$, apoi $H(X|Y)$, aceeași diferență; (5) Venn: învățăcelul trage cele patru valori $0.8464$, $0.1245$, $0.8755$ în regiunile cercurilor înainte să fie completate.
- **Predicted:** valoarea de la fiecare pas, înainte de afișare.

### Retrieve (4 itemi, numere noi)

1. **$X$ și $Y$ sunt independente, $H(X)=0.9$ și $H(Y)=1$. Cât este $H(X,Y)$?** (`[construit]`)
   - ✓ $1.9$: la independență $H(Y|X)=H(Y)$, deci $H(X,Y)=H(X)+H(Y|X)=0.9+1$.
   - ✗[entropia comună = cea mai mare dintre ele] $1$: $H(X,Y)=H(X)+H(Y|X)\ge\max(H(X),H(Y))$; egalitatea cu maximul ar cere ca una să fie determinată de cealaltă.
   - ✗[produs, ca la probabilități] $0.9$: la independență **probabilitățile** se înmulțesc, iar logaritmul transformă produsul în sumă: entropiile se **adună**.
   - ✗[IG în loc de entropia comună] $0$: $0$ este $IG(X;Y)$ la independență, nu $H(X,Y)$.
   (Builder: the root choice by minimum $H(Y|A)$ belongs to Lecția 9 and is not asked here.)
2. **$H(X)=0.5$, $H(Y)=0.9$. Care dintre valorile lui $IG(X;Y)$ arată sigur un calcul greșit?**
   - ✓ $0.7$: depășește $\min(H(X),H(Y))=0.5$.
   - ✗[$IG=0$ imposibil] $0$: este posibil, când $X$ și $Y$ sunt independente.
   - ✗[$IG<H$ strict] $0.5$: este posibil, când $X$ e determinat de $Y$ (atunci $IG=H(X)$).
3. **$X$ ia valoarea $a$ cu probabilitatea $0.75$ și $b$ cu $0.25$. $H(Y|X=a)=1$, $H(Y|X=b)=0$. Cât este $H(Y|X)$?**
   - ✓ $0.75$ (media cu ponderile $0.75$ și $0.25$).
   - ✗[medie fără ponderi] $0.5$: media simplă $\frac{1+0}{2}$ ignoră că $X=a$ apare de trei ori mai des decât $X=b$.
   - ✗[ponderi inversate] $0.25$: ai pus ponderea $0.25$ pe $H(Y|X=a)$; ponderea fiecărei valori este propria ei probabilitate.
   - ✗["Y|X nu e variabilă, deci nu există"] "$H(Y|X)$ nu se poate defini": se definește ca medie a lui $H(Y|X=x)$ pe valorile lui $X$.
4. **$H(X)=1.5$, $H(Y|X)=0.5$, $H(Y)=1.8$. Cât este $H(X|Y)$?**
   - ✓ $0.2$: $H(X,Y)=1.5+0.5=2.0$, deci $H(X|Y)=2.0-1.8=0.2$.
   - ✗[$H(X|Y)=H(Y|X)$] $0.5$: simetric e $IG$, nu $H(X|Y)$ vs $H(Y|X)$.
   - ✗[scădere în loc de înlănțuire] $1.0$: $H(X)-H(Y|X)$ nu e o formulă din lanț.
   - ✗[IG în loc de $H(X|Y)$] $1.3$: asta e $IG=H(Y)-H(Y|X)$.
   (Consistency: $IG=1.3\le\min(1.5,1.8)$.)

### Exerciții

**Ex 1 (0.56.d, B:133-134; status: book).** Enunț: "Aceleași două zaruri ca la Lecția 7, suma $S$ cu entropia $H(S)=3.2744$ biți. Zarurile se aruncă pe rând și primul zar arată 4. Care e entropia lui $S$ după această observație? S-a pierdut sau s-a câștigat informație, și cât?" (Pornește de la rezultatul din Lecția 7, fără să-l recalculeze.)
- **Fields:** $H(S|\text{primul zar}=4)=2.5850$ (tol $\pm0.01$); $IG=0.6894$ (tol $\pm0.01$; cartea: 2.58 și 0.69); alegere: câștigat (entropia a scăzut).
- **Hints:** (1) ce sume mai sunt posibile după primul zar $=4$ și cu ce probabilități? (2) sumele $5,\dots,10$, fiecare cu $\frac16$ (al doilea zar); (3) $H=\log6$, apoi $IG=H(S)-H(S|\dots)$.
- **Soluție (cartea):** $H(S|\text{prima}=4)=-6\cdot\frac16\log\frac16=\log6=2.585$; $IG=3.27-2.58=0.69$ biți. Observația află că a scăzut surpriza medie a lui $S$ cu $0.69$ biți.
- **Detectori:** $0$ -> [ai crezut că totul e știut]: al doilea zar e încă aleatoriu; $2.585$ în câmpul $IG$ -> [entropia rămasă, nu câștigul]; $3.2744$ în câmpul $H(S|\dots)$ -> [nu ai folosit informația]; $-0.69$ -> alarma "IG negativ".

**Ex 2 (0.57, B:134-135; status: book, cu o greșeală de tipar).** Enunț: "Un doctor pune un diagnostic de răceală $C$ (yes/no) în funcție de vreme $T$ (sunny, rainy, snowy). Distribuția comună:"

| | $T$=sunny | $T$=rainy | $T$=snowy |
|---|---|---|---|
| $C$=no | 0.30 | 0.20 | 0.10 |
| $C$=yes | 0.05 | 0.15 | 0.20 |

"(a) $P(C)$ și $P(T)$; (b) $H(C)$, $H(T)$; (c) $H(C|T)$ și $H(T|C)$."
- **Fields:** (a) $P(C)=(0.6,0.4)$; $P(T)=(0.35,0.35,0.30)$. (b) $H(C)=0.9710$; $H(T)=1.5813$ (tol $\pm0.001$; cartea: 0.971 și 1.581). (c) $H(C|T)=0.8274$ (tol $\pm0.0005$); $H(T|C)=1.4377$ (tol $\pm0.001$).
- **Hints (c):** (1) pentru $H(C|T)$ grupezi după $T$: trei grupe, ponderile $0.35,0.35,0.30$; (2) în grupa sunny probabilitățile lui $C$ sunt $\frac{0.30}{0.35},\frac{0.05}{0.35}=\frac67,\frac17$; (3) $H(C|T)=0.35\,H(\frac67,\frac17)+0.35\,H(\frac47,\frac37)+0.30\,H(\frac13,\frac23)$.
- **Soluție (cartea):** $H(C|T=\text{sunny})=0.5917$, rainy $0.9852$, snowy $0.9183$; $H(C|T)=0.35\cdot0.5917+0.35\cdot0.9852+0.30\cdot0.9183=\frac{7}{10}\log7-\frac{3}{20}\log3-\frac{9}{10}=0.82740$. Pentru $H(T|C)$: grupa $C$=no $\to(\frac12,\frac13,\frac16)$ cu $H=1.4591$, grupa yes $\to(\frac18,\frac38,\frac12)$ cu $H=1.4056$; $0.6\cdot1.4591+0.4\cdot1.4056=\frac65+\frac{3}{20}\log3=1.43774$.
- **Notă despre cartea:** B:135 tipărește $H(C|T)=0.82715$; forma ei închisă $\frac7{10}\log7-\frac3{20}\log3-\frac9{10}$ dă $0.82740$. Valoarea corectă este $0.82740$; concluzia nu se schimbă. Câmpul acceptă și 0.82715.
- **Verificare (nu e cerută; calculată aici, "derived"):** $H(C)+H(T|C)=H(T)+H(C|T)=H(C,T)=2.4087$.
- **Detectori:** $0.8317$ -> [medie nepoderată a entropiilor specifice] ($\frac{0.5917+0.9852+0.9183}{3}$); $1.4377$ în câmpul $H(C|T)$ (sau invers) -> [condiționare inversată]; $0.1435$ -> [ai dat $IG$, nu $H(C|T)$] ($0.9710-0.8274$); $H(C|T)>1$ -> alarma de interval ($C$ are 2 valori, plafonul e $1$); ponderi $\frac12,\frac12$ sau $\frac13$ -> [ponderi egale].

**Ex 3 (0.141.d, B:242; status: verified-twice).** Enunț: "$X$ și $Y$ sunt independente, cu $P(X=0)=P(X=1)=P(Y=0)=P(Y=1)=\frac12$. $Z\in\{0,1\}$ cu $P(Z|X,Y)$:"

| $X$ | $Y$ | $P(Z=0|X,Y)$ | $P(Z=1|X,Y)$ |
|---|---|---|---|
| 0 | 0 | 0.8 | 0.2 |
| 0 | 1 | 0.2 | 0.8 |
| 1 | 0 | 0.2 | 0.8 |
| 1 | 1 | 0.8 | 0.2 |

"(i) Completează $P(X,Y,Z)$. (ii) Calculează $P(X,Z)$, $P(Y,Z)$, $P(Z)$. (iii) Arată că $IG(X;Z)=IG(Y;Z)=0$."
- **Fields:** (i) $P(X,Y,Z)$ în ordinea $(000,001,010,011,100,101,110,111)$: $0.2,\ 0.05,\ 0.05,\ 0.2,\ 0.05,\ 0.2,\ 0.2,\ 0.05$ (exact). (ii) toate cele patru celule ale lui $P(X,Z)$ și ale lui $P(Y,Z)$ sunt $0.25$; $P(Z=0)=P(Z=1)=0.5$. (iii) $IG(X;Z)=0$, $IG(Y;Z)=0$ (tol $\pm0.0001$).
- **Hints:** (1) regula de înmulțire și independența: $P(x,y,z)=P(x)P(y)P(z|x,y)=\frac14P(z|x,y)$; (2) $P(x,z)=\sum_yP(x,y,z)$; (3) dacă $P(x,z)=P(x)P(z)$ în toate celulele, aplici 0.141.b.
- **Soluție:** (i) $\frac14\cdot0.8=0.2$ etc. (ii) de ex. $P(X=0,Z=0)=0.2+0.05=0.25$; la fel în celelalte celule, deci $P(X,Z)=P(X)P(Z)=\frac12\cdot\frac12$. (iii) $X\perp Z$ și $Y\perp Z$ $\Rightarrow$ $IG=0$ (0.141.b). Culegerea nu dă răspunsul; verificat de două ori.
- **Ecran de capcană (după soluție):** perechea $(X,Y)$ *împreună* spune ceva despre $Z$: $H(Z)=1$, $H(Z|X,Y)=H(0.8,0.2)=0.7219$, deci $IG((X,Y);Z)=0.2781$ biți (calculat aici, nu din culegere, "derived"). Concluzie: $IG(X;Z)=0$ nu înseamnă că $X$ nu e util niciodată; independența două câte două nu este independență comună.
- **Detectori:** celule $\frac18$ -> [ai uitat $P(z|x,y)$]; $P(Z=0)\ne0.5$ -> mesaj "verifică suma celor patru celule cu $Z=0$"; $IG(X;Z)=0.2781$ -> [ai calculat $IG$ cu perechea $(X,Y)$, nu cu $X$ singur].

**Ex 4 (0.142, B:243; status: verified-twice).** Enunț: "Steelers vs Packers: $I$ = Injured (no/yes), $W$ = Weather (foggy/rainy/clear sky). Distribuția comună:"

| | foggy | rainy | clear sky |
|---|---|---|---|
| Injured=no | 0.1 | 0.25 | 0.35 |
| Injured=yes | 0.05 | 0.1 | 0.15 |

"(a) marginalele; (b) $H(W)$, $H(I)$; (c) $H(I|W)$, $H(W|I)$; (d) $H(I,W)$ din definiție, apoi verifică $H(I,W)=H(I)+H(W|I)=H(W)+H(I|W)$; (e) $IG(I;W)$ și $IG(W;I)$ din definiție; verifică formula $\sum P(x,y)\log\frac{P(x,y)}{P(x)P(y)}$ (relația 147 de mai sus). Poți folosi $\log3=1.585$, $\log5=2.322$, $\log7=2.807$, $\log11=3.459$, $\log13=3.700$."
- **Fields:** (a) $P(I)=(0.7,0.3)$; $P(W)=(0.15,0.35,0.5)$. (b) $H(I)=0.8813$; $H(W)=1.4406$ (tol $\pm0.001$). (c) $H(I|W)=0.8805$; $H(W|I)=1.4398$ (tol $\pm0.001$). (d) $H(I,W)=2.3211$ (tol $\pm0.001$) și cele două sume de verificare $0.8813+1.4398=2.3211$ și $1.4406+0.8805=2.3211$. (e) $IG(I;W)=0.0008$ și $IG(W;I)=0.0008$ (tol $\pm0.0005$, vezi nota), valoarea formulei din (e) tot $0.0008$.
- **Hints (c):** (1) grupezi după $W$ pentru $H(I|W)$: ponderile $0.15,0.35,0.5$; (2) foggy: $(\frac{0.1}{0.15},\frac{0.05}{0.15})=(\frac23,\frac13)$; rainy $(\frac57,\frac27)$; clear $(0.7,0.3)$; (3) $H(I|W)=0.15\cdot0.9183+0.35\cdot0.8631+0.5\cdot0.8813$.
- **Soluție:** $H(I|W=\text{foggy})=0.9183$, rainy $0.8631$, clear $0.8813$, deci $H(I|W)=0.88048$. Pentru $H(W|I)$: $I$=no $\to(\frac17,\frac5{14},\frac12)$, $H=1.4316$; $I$=yes $\to(\frac16,\frac13,\frac12)$, $H=1.4591$; $0.7\cdot1.4316+0.3\cdot1.4591=1.43984$. $H(I,W)=2.32113$; lanțurile: $0.88129+1.43984=2.32113$ și $1.44065+0.88048=2.32113$. $IG=0.88129-0.88048=0.000809$ în ambele sensuri. Culegerea nu dă răspunsul; verificat de două ori.
- **Notă:** variabilele sunt aproape independente, deci un $IG$ foarte mic este corect. Cu logaritmii rotunjiți din indiciu, diferența iese ≈ $0.0011$; de aceea toleranța la $IG$ e mai largă. Nu e greșeală de principiu.
- **Detectori:** $IG<0$ -> alarma "$IG\ge0$"; $H(I)>1$ sau $H(I|W)>1$ -> alarma de interval ($I$ are 2 valori); $1.4398$ pus la $H(I|W)$ -> [condiționare inversată] (și depășește $1$); $IG=0.8813-1.4398$ -> [ai scăzut entropii de variabile diferite], dă negativ; ponderi $\frac13$ în $H(I|W)$ -> [ponderi egale] ($0.8876$).

### Builder notes (L8)

- Sources: Cn-s3:4-5, 11; B:129-135, 241-243; FND:33, 35; PS:134-148 (0.55, 0.56, 0.57 solved), PS:153 (justification of 0.141.a chain). 0.55.b/c, 0.56.d, 0.57 `book`; 0.141 and 0.142 `verified-twice`.
- 0.57 uses the book table as printed (B:134); the typo note must show on the solution screen.
- The Concrete table (Zonă × Chirie) is constructed and owned only here; no other lesson may reuse it. Recompute every value by script.
- Uncertain: none. Ex 4 does not name KL (no forward pointer); L24 R6 links back to it.

---

## Lecția 9. Arbori de decizie: compasul de decizie și alegerea rădăcinii (`ml-l09`, priority A)

**Concepte (4):** (a) vocabularul de învățare automată: instanță, atribut, exemplu, concept, ipoteză, set consistent / inconsistent, eroare la antrenare, învățare supervizată / nesupervizată; (b) arborele de decizie (nod de test, ramură, frunză) și clasificarea unei instanțe; (c) compasul de decizie și cutiile $[a{+},b{-}]$; (d) alegerea rădăcinii: IG maxim $\Leftrightarrow$ $H(Y|A)$ minim.
**Necesită:** vezi Lecția 8 (definițiile $H(Y|A=v)$, $H(Y|A)$, $IG$; aici doar se aplică). Nu se reexplică entropia (Lecția 7).

### Pretest
Ecran: 8 exemple, $[4{+},4{-}]$. Două întrebări posibile: A cu ramurile $[3{+},1{-}]$ (A=0) și $[1{+},3{-}]$ (A=1); B cu ramurile $[4{+},2{-}]$ (B=0) și $[0{+},2{-}]$ (B=1). "Care întrebare te lasă, în medie, cu mai puțină nesiguranță despre etichetă? Alege A sau B."
Răspuns așteptat: **B** ($H(Y|B)=0.6887$, $H(Y|A)=0.8113$; valorile apar la sfârșitul lecției, nu aici). Feedback scurt: "Vei vedea cum se decide asta cu numere, nu din ochi."

### Concret (P21 1(b.i): 128 de exemple)
Sursă: `tests/2021-2022-partial1-ro/subiect.pdf:1`, barem `barem.pdf:1`, soluție `solutii.pdf:1-2`. Enunț pe ecran: 128 de exemple, $[64{+},64{-}]$, trei atribute booleene. **Home-Owner** e adevărat la 64 dintre exemple, din care 1/4 sunt negative. **In-Debt** e adevărat la 96, din care 1/2 sunt pozitive. **Rich** e adevărat la 32, din care 3/4 sunt pozitive. Care atribut merge în rădăcină?
Ecrane (la fiecare, cursantul prezice întâi):
- **C1.** Predicție: câte exemple și ce etichete în fiecare ramură a lui Home-Owner? Corect: adevărat $[48{+},16{-}]$, fals $[16{+},48{-}]$. (Se desenează ciotul, cele două cutii sub rădăcina $[64{+},64{-}]$.)
- **C2.** Același lucru pentru In-Debt (adevărat $[48{+},48{-}]$, fals $[16{+},16{-}]$) și Rich (adevărat $[24{+},8{-}]$, fals $[40{+},56{-}]$). Control: pozitivele din cele două cutii dau mereu 64.
- **C3.** Predicție: scrie $H(Y|\text{Home-Owner})$ **fără a calcula** entropiile specifice. Corect: $\tfrac{64}{128}H\!\left(\tfrac14\right)+\tfrac{64}{128}H\!\left(\tfrac34\right)$ (barem: 0.6 p pentru forma scrisă, înaintea valorilor). Analog: $H(Y|\text{In-Debt})=\tfrac{96}{128}H\!\left(\tfrac12\right)+\tfrac{32}{128}H\!\left(\tfrac12\right)$, $H(Y|\text{Rich})=\tfrac{32}{128}H\!\left(\tfrac14\right)+\tfrac{96}{128}H\!\left(\tfrac{5}{12}\right)$.
- **C4.** Predicție: care dintre cele trei e cel mai mic? Apoi valorile: $H(Y|\text{Home-Owner})=H(1/4)=0.8113$ (soluția oficială tipărește 0.8112, trunchiat), $H(Y|\text{In-Debt})=1$ (atributul nu spune nimic: ambele cutii au 50% pozitive), $H(Y|\text{Rich})=\tfrac14H(\tfrac14)+\tfrac34H(\tfrac5{12})=0.9377$.
- **C5.** Rădăcina: **Home-Owner** (entropia condiționată medie minimă). Câștigul: $IG=1-0.8113=0.1887$. Apoi ciotul ca arbore cu o singură întrebare: Home-Owner adevărat $\to$ "+" (majoritatea din $[48{+},16{-}]$), fals $\to$ "−"; eroarea la antrenare a acestui arbore: $(16+16)/128=1/4$.
- **C6.** Concluzie în cuvinte: două atribute pot avea ramuri cu număr egal de exemple și totuși nu valorează același lucru (In-Debt nu valorează nimic).

### Regula (ecrane scurte, 3-4 concepte)
- **R1 Vocabular** (ML0:10; termenii exact ca în listă): **instanță** $x$ (un rând al tabelului, fără etichetă), **atribut de intrare** / **atribut de ieșire**, **exemplu** $\langle x,c(x)\rangle$, **concept** $c$ (funcția de învățat), **ipoteză** $h$ (ce învață algoritmul), **spațiul ipotezelor**. Învățare **supervizată** (clasificare: există etichete) vs. **nesupervizată** (clustering). **Set consistent**: nu există două rânduri cu aceleași valori de intrare și etichete diferite; **inconsistent**: există. **Eroarea la antrenare** = rânduri etichetate greșit / total; **acuratețea** = 1 − eroarea (Cn-s3:8-9).
- **R2 Arborele** (ML3:6): nod de test = un atribut de intrare; ramură = o valoare; frunză = o clasă. Clasificarea unei instanțe = urmezi ramurile până la o frunză. Exemplu de desen pe ecran: root A; A=1 → "+"; A=0 → test B (B=0 → "−", B=1 → "+"); instanța (A=0,B=1) → "+".
- **R3 Compasul de decizie** (decision stump): un arbore cu un singur nod de test, cu cutiile $[a{+},b{-}]$ sub el. $H(Y|A)=\sum_v\frac{|S_v|}{|S|}H(S_v)$ (formula din Lecția 8, aici scrisă pe cutii). Câștigul $IG(S,A)=H(S)-\sum_v\frac{|S_v|}{|S|}H(S_v)$ (ML3:13; Mitchell 1997, p.58).
- **R4 Rădăcina**: **IG maxim $\Leftrightarrow$ $H(Y|A)$ minim**; seminarul preferă a doua formă (Cn-s3:10-11). Procedura de scris la test: desenezi cioturile, scrii $H(Y|A)$ în formă generală, substitui, alegi minimul; fiecare valoare trece regula de interval (vezi Lecția 7). "Mi se pare că acest nod dă IG maxim" nu se punctează (Cn-s4:7). (Builder: the reason for the equivalence is the "De ce?" screen below; the range rule is stated once, in L7.)

### De ce?
Întrebare: "De ce e suficient să compari $H(Y|A)$ între atribute, fără să calculezi $H(Y)$?" Răspuns: $H(Y)$ e același număr pentru toate cioturile din același nod, iar $IG=H(Y)-H(Y|A)$; scăzând din același număr, cel mai mare IG apare exact la cel mai mic $H(Y|A)$. (Calculul lui $H(Y)$ e necesar doar dacă se cere explicit valoarea IG.)

### Reamintire (4 itemi, cifre noi)
- **Q1.** Rădăcina $[6{+},6{-}]$. Ciotul A: $[2{+},0{-}]$ și $[4{+},6{-}]$. Ciotul B: $[4{+},1{-}]$ și $[2{+},5{-}]$. Care e mai bun? ✓ **B** ($H(Y|B)=0.8043<H(Y|A)=0.8091$: ramura pură a lui A are doar 2 exemple din 12 și restul de 10 e foarte amestecat). ✗[ramură pură = mai bun automat]: A, "are o frunză pură" (explicație: o ramură pură mică nu compensează o ramură mare amestecată; se compară entropiile ponderate, Cn-s4:6-7). ✗[egalitate pe date]: "egale, ambele împart cele 12 exemple" (explicație: numărul de exemple nu spune nimic despre curățenia ramurilor).
- **Q2.** "$H(Y)=0.94$, $H(Y|A)=0.65$, $H(Y|B)=0.58$. Ce atribut e rădăcina și cât e IG-ul lui?" ✓ B, $IG=0.36$. ✗[max H în loc de min]: A (explicație: se alege entropia condiționată minimă). ✗[H dat drept IG]: B, "IG = 0.58" (explicație: 0.58 e $H(Y|B)$, nu câștigul; Tema3: 0.400 vs 0.600).
- **Q3.** Rândurile $(X_1,X_2\to Y)$: $(0,1\to+)$, $(1,1\to-)$, $(0,1\to+)$, $(1,0\to+)$. Este setul consistent? ✓ da: rândurile 1 și 3 sunt identice **cu aceeași etichetă** (un exemplu repetat), iar celelalte au intrări diferite. ✗[duplicat = inconsistent]: "inconsistent, rândurile 1 și 3 se repetă" (explicație: inconsistent înseamnă aceleași intrări cu etichete **diferite**; un exemplu repetat cu aceeași etichetă nu contrazice nimic). ✗[etichete diferite = inconsistent]: "inconsistent, apar și + și −" (explicație: etichete diferite la intrări diferite sunt normale; doar aceleași intrări cu etichete diferite fac setul inconsistent). (Builder: the minimum training error on inconsistent data is Lecția 13's property and is not asked here.)
- **Q4.** Cu arborele de la R2 (root A; A=1 → "+"; A=0 → test B: B=0 → "−", B=1 → "+"): cum e clasificată instanța (A=0, B=0)? ✓ "−". ✗[citești doar rădăcina]: "+" (explicație: A=0 duce la un nod de test B; încă nu ești la frunză). ✗[ordinea ramurilor]: "nu se poate spune" (explicație: arborele dă o etichetă pentru orice combinație a valorilor).

### Exerciții (toate ale lecției, ca exerciții de calcul)
**E 4.34** (B:590-591; soluție DTs:2-4; status: slides). Enunț (ro): Timmy are 9 exemple, atribute S ("e bine să stai și să înveți până noaptea târziu înainte de examen") și A ("e bine să mergi la toate cursurile și seminariile"). Rădăcina $[5{+},4{-}]$. S: S+ $[3{+},2{-}]$, S− $[2{+},2{-}]$. A: A+ $[5{+},1{-}]$, A− $[0{+},3{-}]$. Ce trăsătură alege Timmy dacă folosește câștigul maxim? Care e IG? (Se pot folosi $\log_2 3=1.5850$, $\log_2 5=2.3219$, $\log_2 7=2.8073$.)
- Câmpuri: $H(\text{all})$ = 0.9911; $H(\text{all}|S)$ = 0.9839; $IG(S)$ = 0.0072 (±0.0005); $H(\text{all}|A)$ = 0.4333; $IG(A)$ = 0.5577; alegerea = A.
- Indicii: (1) scrie $H(\text{all}|S)=\frac59H[3{+},2{-}]+\frac49H[2{+},2{-}]$; (2) $H[3{+},2{-}]=0.9710$, $H[2{+},2{-}]=1$, $H[5{+},1{-}]=0.6500$, $H[0{+},3{-}]=0$; (3) $0.9839$ și $0.4333$, apoi scădere din $H(\text{all})$.
- Soluție (DTs:4): $H(\text{all})=\log_2 9-\tfrac59\log_2 5-\tfrac49\log_2 4=0.9911$; $H(\text{all}|S)=\tfrac59\cdot0.9710+\tfrac49\cdot1=0.9839$, $IG(S)=0.0072$; $H(\text{all}|A)=\tfrac69\cdot0.6500+\tfrac39\cdot0=0.4333$, $IG(A)=0.5577$. $IG(S)<IG(A)\Leftrightarrow H(\text{all}|S)>H(\text{all}|A)$: Timmy alege **A**. O linie: programul din ex. 4.35 ar tipări exact aceste patru numere pentru intrările $[3,2],[2,2]$ și $[5,1],[0,3]$.
- Detectoare: $H(\text{all}|A)=0.5577$ la câmpul 4 → G-IG/H. $H(\text{all}|A)=0.3250$ → G-nw. $H(\text{all}|A)=0.2167$ → G-sw. $H(\text{all})=0.6870$ → G-ln. Capcana: ramura pură $[0{+},3{-}]$ are entropie 0 ($0\cdot\log0=0$); răspuns "nedefinit" la ea → "Prin convenție $0\log_2 0=0$."
**E 4.35** (opțional, implementare; B:591). Nu are răspuns de notat. Pentru a nu repeta 4.34, ecranul spune într-o linie ce face programul (ia numărul de valori ale ieșirii și ale atributului și cutiile unui ciot; tipărește $H(Y)$, entropiile specifice, entropia condiționată medie, IG) și trimite la rezolvarea lui 4.34 ca "ieșirea programului pentru $[3,2],[2,2]$ / $[5,1],[0,3]$". WYSK:5 recomandă scrierea lui acasă înaintea seminarului. Fără ecran de cod (design, non-goal).
**E 4.38** (B:595-596; status: verified-twice; "Culegerea nu dă răspunsul; verificat de două ori."). Enunț: 27 de instanțe despre vampiri; V = vampir (+/−), G = "Urăște usturoiul" (t/f), T = "Transilvănean" (t/f), număr de apariții: (+,t,t) 9; (+,t,f) 4; (+,f,t) 3; (+,f,f) 0; (−,t,t) 1; (−,t,f) 3; (−,f,t) 1; (−,f,f) 6. Valori din carte: $H(1/7)=0.5916$, $H(4/17)=0.7871$, $H(3/10)=0.8812$, $H(4/13)=0.8904$, $H(11/27)=0.9751$.
- (a) Completează cutiile și decizia în frunze la cei doi arbori (G la rădăcină apoi T; T la rădăcină apoi G). Câmpuri (numere): arborele G: G=t $[13{+},4{-}]$, G=f $[3{+},7{-}]$; sub G=t: T=t $[9{+},1{-}]$, T=f $[4{+},3{-}]$; sub G=f: T=t $[3{+},1{-}]$, T=f $[0{+},6{-}]$. Arborele T: T=t $[12{+},2{-}]$, T=f $[4{+},9{-}]$; sub T=t: G=t $[9{+},1{-}]$, G=f $[3{+},1{-}]$; sub T=f: G=t $[4{+},3{-}]$, G=f $[0{+},6{-}]$. Deciziile în frunze (ambii arbori): +, +, +, −.
- (b) $H(V|G)$ = 0.822 (±0.001). (c) $H(V|T)$ = 0.7355 (±0.001). (d) arborele ID3 = cel cu **T** la rădăcină ($0.7355<0.822$). (e) Adevărat: G=t, T=f duce la $[4{+},3{-}]$, deci "vampir".
- Indicii (b): (1) $H(V|G)=\tfrac{17}{27}H[13{+},4{-}]+\tfrac{10}{27}H[3{+},7{-}]$; (2) $\tfrac{17}{27}\cdot0.7871+\tfrac{10}{27}\cdot0.8812$; (3) $0.4956+0.3264$. (c): $\tfrac{14}{27}\cdot0.5916+\tfrac{13}{27}\cdot0.8904=0.3068+0.4287$.
- Soluție: IG(G)=0.1531, IG(T)=0.2396 față de $H(V)=0.9751$. Arborii au aceleași decizii în frunze, doar entropia decide.
- Detectoare: (b) 0.8342 → G-nw; 0.1531 → G-IG/H; (c) 0.7411 → G-nw; 0.2396 → G-IG/H. La (d) "arborele G, pentru că are frunza $[0{+},6{-}]$ pură" → "ramură pură ≠ mai bun; ambii arbori au o ramură pură; se compară $H(V|\cdot)$."
**E 0.58** (B:135-136; status: book; slide PS:182-185). Enunț: opt instanțe, intrări X1..X5, ieșire Y (rândurile X1 X2 X3 X4 X5 Y): 0 1 1 0 1 0; 1 0 0 0 1 0; 0 1 0 1 0 1; 1 1 1 1 0 1; 0 1 1 0 0 1; 0 0 0 1 1 1; 1 0 0 1 0 1; 1 1 1 0 1 1. Selecție de trăsături de tip filtru. (a) Calculează $IG(X_i;Y)$ (aici numit și $MI(X_i,Y)$) pentru fiecare $i$. (b) Alege cel mai mic subset de trăsături astfel încât cel mai bun clasificator pe subset să fie cel puțin la fel de bun ca pe toate; justifică. Probabilitățile se estimează prin frecvențe relative. (Builder: the book says "în sensul verosimilității maxime (MLE)"; the name is taught in Lecția 18, so the L9 screen says "frecvențe relative" only.)
- Câmpuri (a): $MI(X_1,Y)$ = 0; $MI(X_2,Y)$ = 0.0157 (±0.0005); $MI(X_3,Y)$ = 0; $MI(X_4,Y)$ = 0.3113; $MI(X_5,Y)$ = 0.3113. (b) (selecție multiplă) = {X1, X2, X4, X5} (răspunsul din carte).
- Metodă: $H(Y)=H(1/4)=0.8113$; pentru fiecare $X_i$ cioturile: X1: $[1{-},3{+}]$ în ambele ramuri (aceeași distribuție ca în părinte, deci IG 0); X3 la fel; X2: X2=0 $[1{-},2{+}]$ (3 rânduri), X2=1 $[1{-},4{+}]$ (5 rânduri), IG 0.0157; X4: X4=0 $[2{-},2{+}]$, X4=1 $[0{-},4{+}]$, $H(Y|X_4)=\tfrac48\cdot1=0.5$; X5 la fel, IG 0.3113.
- Soluție (b) (B:136): se rețin trăsăturile cu informație mutuală nenulă: X2, X4, X5. Dar rândurile 1 și 8 au același $(X_2,X_4,X_5)=(1,0,1)$ și etichete diferite ($Y=0$, respectiv $Y=1$): setul ar deveni inconsistent. Se adaugă X1, care le deosebește (X1=0 la rândul 1, X1=1 la rândul 8). "Deși $MI(X_1,Y)=0$, nu rezultă că X1 combinat cu alte variabile rămâne independent de Y; câștigul poate fi nenul, uneori chiar maxim." **Notă (verificat aici):** căutând toate submulțimile, cele mai mici submulțimi consistente au 3 trăsături: {X1,X2,X5} și {X1,X3,X5}; răspunsul din carte (patru trăsături) urmează regula "filtrul păstrează MI nenul, apoi repari inconsistența". Ecranul de soluție spune asta într-o propoziție și acceptă ca punct de plecare răspunsul cărții; verificatorul acceptă {X1,X2,X4,X5} ca răspuns principal și arată {X1,X2,X5} / {X1,X3,X5} cu nota "consistent și mai mic, dar nu rezultă din regula filtrului"; vezi secțiunea 11, problema 1.
- Detectoare: $MI(X_1,Y)=0.3113$ → "confuzie cu X4/X5; la X1 distribuția lui Y e aceeași în ambele ramuri". (b) {X2,X4,X5} → "rândurile 1 și 8 rămân identice la aceste trăsături, cu etichete diferite."

### Demonstrație (ecrane cu predicție, 0.58 / Special săpt. 3)
Enunț: "$MI(X_1,Y)=0$, dar $X_1$ e necesar împreună cu alte trăsături." Pași (la fiecare cursantul prezice pasul următor): (1) calculezi $P(X_1,Y)$: celulele $\tfrac18,\tfrac38,\tfrac18,\tfrac38$; (2) $P(X_1)P(Y)$: $\tfrac12\cdot\tfrac14=\tfrac18$, $\tfrac12\cdot\tfrac34=\tfrac38$: egal în toate cele patru celule, deci independente și $MI=0$ ($IG=0\Leftrightarrow$ independență, Lecția 8); (3) rândurile 1 și 8 coincid pe $(X_2,X_4,X_5)$ și diferă pe $Y$; (4) X1 le deosebește: perechea $(X_1,X_2,X_4,X_5)$ determină $Y$. Concluzie: independența marginală nu înseamnă inutilitate în combinație.

### Vizual (viz 4, ID3 builder, pasul 1 "toate cioturile")
Ecranele C1-C5 sunt randarea widgetului: tabelul P21 (128 de exemple) cu numerele de adevărat/fals, cele trei cioturi desenate, cele trei $H(Y|A)$ ca sume cu ponderi care se completează, apoi valorile. Cursantul prezice cel mai bun atribut **înainte** să apară valorile și, la fiecare ciot, cutiile. Mod liber (după lecție, pentru 4.38 și 0.58): același widget pe orice tabel din exercițiu, fără a arăta rezultatul. Avans manual; nimic nu se redă singur.

### Note pentru constructor (L9)
- Valorile sunt recalculate: P21 ($0.8113$, $1$, $0.9377$; soluția oficială tipărește $0.8112$, trunchiere); 4.34 ($0.9911$, $0.9839$, $0.0072$, $0.4333$, $0.5577$; DTs:4 tipărește $0.991076$, $0.983861$, $0.007215$, $0.433348$, $0.557728$); 4.38 verified-answers; 0.58 din B:136.
- P21 1(b.ii) (aceeași tabelă, fără calcul) nu are proprietar în alocare; l-am pus în Lecția 10 ca un singur ecran cu trimitere înapoi (problema 2, secțiunea 11).
- 4.38.a: cutiile se completează din tabelul cu numere de apariții (Counts); ponderile din $H(V|G)$ sunt 17/27 și 10/27, nu 2/4.
- Pretest-ul și Q1-Q4 folosesc cifre construite (listate la "Valori construite").

---

## Lecția 10. Rădăcina fără calculator: raționamente relaționale și formule de buzunar (`ml-l10`, priority A)

**Concepte (2 titluri, fiecare cu definiții):** (a) raționamente relaționale (calitative): comparația cu ponderi, injecția între valori, monotonia și simetria lui $H(p)$; (b) formulele pentru calculatorul de buzunar: $H[a{+},b{-}]=\tfrac1{a+b}\log_2\tfrac{(a+b)^{a+b}}{a^ab^b}$, produsul de comparat, ieșirea ternară, depășirea capacității, forma logaritmică.
**Necesită:** vezi Lecția 7 ($H(p)$ crește pe $[0,\tfrac12]$, simetria $H(p)=H(1-p)$, $H[n{+},n{-}]=1$, $H[0{+},n{-}]=0$), vezi Lecția 9 (cioturi, $H(Y|A)$).

### Pretest
Ecran: rădăcina $[5{+},5{-}]$. Ciotul A: ramurile $[4{+},1{-}]$ și $[1{+},4{-}]$. Ciotul B: $[3{+},2{-}]$ și $[2{+},3{-}]$. "Fără calculator și fără să scrii un singur logaritm: care ciot e mai bun? De ce?"
Răspuns așteptat: **A** (ramurile au aceleași ponderi, câte $\tfrac12$; în A fiecare ramură are 1/5 din exemple de o clasă, în B 2/5; $H(p)$ crește pe $[0,\tfrac12]$, deci A are entropia medie mai mică: $0.7219<0.9710$, valorile abia după răspuns).

### Concret (Cn-s4:5-7)
- **C1.** Rădăcina $[3{-},4{+}]$. Ciotul A: $[2{-},0{+}]$ și $[1{-},4{+}]$. Ciotul B: $[1{-},1{+}]$ și $[2{-},3{+}]$. Predicție: care e mai bun, doar din potriviri? Pași: ponderile coincid ($\tfrac27$ și $\tfrac57$); potrivești ramurile câte două (injecția $v\mapsto v'$): $[2{-},0{+}]$ cu $[1{-},1{+}]$ (entropie $0\le1$); $[1{-},4{+}]$ cu $[2{-},3{+}]$ (cota minoritară $1/5<2/5$, deci $H(1/5)<H(2/5)$). Concluzie: A mai bun. Valorile abia la sfârșit: $\tfrac57H[1{-},4{+}]=0.5157$ (A, plus $0$) față de $\tfrac27\cdot1+\tfrac57H[2{-},3{+}]=0.9793$ (B).
- **C2.** Predicție: care e mai mare, $H[5{-},3{+}]$ sau $H[2{-},9{+}]$? Metoda: $H[5{-},3{+}]=H[5{+},3{-}]$ (simetrie); compari cota minoritară $\min(a,b)/(a+b)$: $\tfrac38$ față de $\tfrac2{11}$, adică $\tfrac{33}{88}>\tfrac{16}{88}$, ambele sub $\tfrac12$, deci prima e mai mare. Apoi valorile: $0.9544>0.6840$. (Cn-s4:5.)
- **C3.** Rădăcina $[12{+},8{-}]$. Ciotul A: $[9{+},1{-}]$ și $[3{+},7{-}]$ (ponderi $\tfrac12,\tfrac12$). Ciotul B: $[6{+},2{-}]$ și $[6{+},6{-}]$ (ponderi $\tfrac25,\tfrac35$). Predicție: se vede câștigătorul din potriviri? Nu: ponderile diferă și entropiile nu se aliniază ramură cu ramură; carte: "în examen combină raționamentul calitativ cu calculul, fiindcă (288)/(289) nu au loc neapărat pentru toate valorile" (B:594). Se trece la formula produsului: $P_A=\tfrac{10^{10}}{9^9\cdot1^1}\cdot\tfrac{10^{10}}{3^37^7}=11608.27$, $P_B=\tfrac{8^8}{6^62^2}\cdot\tfrac{12^{12}}{6^66^6}=368224.2$; câștigă **minimul**, deci A. Apoi $H(Y|A)=\tfrac1{20}\log_2P_A=0.6751$, $H(Y|B)=0.9245$, $H(Y)=0.9710$, $IG(A)=0.2958$, $IG(B)=0.0464$.
- **C4.** Același A, în forma logaritmică (pentru numere mari): $H(Y|A)=\tfrac1{20}\sum_{\text{ramuri}}[(c+d)\log_2(c+d)-c\log_2c-d\log_2d]=\tfrac1{20}(4.690+8.813)=0.6751$. De ce: pe un calculator Sharp EL-531VH $56^{56}$ încape, $57^{57}$ nu (B:592; $179^{179}$ da, $180^{180}$ nu pe calculatorul din Linux Mint); forma logaritmică nu depășește capacitatea. Calculatorul nu are $\log_2$: $\log_2x=\ln x/\ln2=\log_{10}x/\log_{10}2$ (B:592 Obs. 1; Cn-s3:2).
- **C5 (un ecran, trimitere înapoi).** "Aceleași trei cioturi din Lecția 9 (Home-Owner, In-Debt, Rich), fără calcule" (P21 1(b.ii), 0.5+0.2 p): In-Debt are $IG=0$ (ambele cutii au 50% pozitive, $H=1$); Home-Owner are $H(Y|\cdot)=H(1/4)$, Rich are $\tfrac14H(\tfrac14)+\tfrac34H(\tfrac5{12})$ și $\tfrac14<\tfrac5{12}<\tfrac12$ dă $H(\tfrac14)<H(\tfrac5{12})$, deci Home-Owner câștigă. Tabela nu se redesenează; se arată doar cele trei expresii (declarat la secțiunea 11, problema 2).

### Regula
- **R1 (B:593-594).** $H(S|A)=\sum_v\frac{|S_v|}{|S|}H(S|A=v)$ (287). Dacă există o aplicație injectivă $v\mapsto v'$ de la $Val(A)$ la $Val(A')$ cu $P(A=v)H(S|A=v)\le P(A'=v')H(S|A'=v')$ pentru toți $v$ (288), atunci $H(S|A)\le H(S|A')$. Caz particular (289): $\tfrac{|S_v|}{|S|}\le\tfrac{|S_{v'}|}{|S|}$ și $H(S|A=v)\le H(S|A'=v')$, verificabil din desen. Aplicația se definește doar unde $P(A=v)\ne0$ și $H(S|A=v)\ne0$. Se folosesc: $H(p)$ crescătoare pe $[0,\tfrac12]$, simetrică, $H[n{+},n{-}]=1$, $H[0{+},n{-}]=0$. Se compară **entropiile înmulțite cu ponderi**, nu cele goale.
- **R2 (B:591-592, DTs:9-11).** $H[a{+},b{-}]=\frac1{a+b}\log_2\frac{(a+b)^{a+b}}{a^ab^b}$ pentru $a,b\ne0$; ieșire ternară $H[a{+},b{-},c{*}]=\frac1{a+b+c}\log_2\frac{(a+b+c)^{a+b+c}}{a^ab^bc^c}$; pentru ciotul cu copiii $[c{+},d{-}],[e{+},f{-}]$: $H(\text{nod}|\text{atribut})=\frac1{a+b}\log_2\left(\frac{(c+d)^{c+d}}{c^cd^d}\cdot\frac{(e+f)^{e+f}}{e^e f^f}\right)$ la un copil pur se omite factorul lui. Pentru a alege atributul **e destul să compari produsele și câștigă minimul** (B:592, Obs. 2).
- **R3.** Dacă potrivirile nu ies pentru toate valorile, treci la produs sau la forma logaritmică. Formulele cu $\log_2$ lipsesc de pe calculator: se folosește $\ln$ sau $\log_{10}$ și raport.

### De ce?
Întrebare: "La C3 potrivirea ramură cu ramură nu a ieșit, și totuși A a câștigat. De ce o potrivire care nu iese nu spune nimic, nici măcar că B ar fi mai bun?" Răspuns: (288) este o condiție **suficientă**: dacă fiecare termen pondere · entropie al lui A e cel mult perechea lui din B, sumele ies în aceeași ordine. Dacă o pereche iese invers, sumele pot ieși în orice ordine: un termen mai mare al lui A poate fi compensat de altul mult mai mic (la C3, A câștigă: $0.6751<0.9245$). Când potrivirea nu iese, treci la produs sau la forma logaritmică.
(Builder: "a pure branch does not make a stump better by itself" is explained in Lecția 9, Q1 and 4.38.d; it is not re-explained here.)

### Reamintire
- **Q1.** Care e mai mare: $H[4{-},5{+}]$ sau $H[5{-},6{+}]$? ✓ a doua ($\tfrac49=\tfrac{44}{99}<\tfrac5{11}=\tfrac{45}{99}<\tfrac12$ și $H$ crește: $0.9911<0.9940$). ✗[mai multe exemple = mai puțină incertitudine]: prima (explicație: numărul de exemple nu apare în $H(p)$, contează doar proporția). ✗[aproape de 1/2 = egale]: egale (explicație: $H$ e strict crescătoare pe $[0,\tfrac12]$, deci diferă, chiar dacă puțin).
- **Q2.** Rădăcina $[7{+},5{-}]$. Ciotul A: $[1{+},4{-}]$ (5 exemple) și $[6{+},1{-}]$ (7). Ciotul B: $[2{+},3{-}]$ (5) și $[5{+},2{-}]$ (7). Care e mai bun, fără niciun logaritm? ✓ **A**: ponderile se potrivesc ($\tfrac5{12}$ cu $\tfrac5{12}$, $\tfrac7{12}$ cu $\tfrac7{12}$), iar în fiecare pereche cota minoritară a lui A e mai mică ($\tfrac15<\tfrac25$, $\tfrac17<\tfrac27$), toate sub $\tfrac12$: (288) are loc ($0.6460<0.9080$, valorile abia după răspuns). ✗[fără logaritmi nu se poate]: "trebuie calculate entropiile" (explicație: când ponderile se potrivesc și cotele minoritare sunt ordonate în fiecare pereche, monotonia lui $H$ pe $[0,\tfrac12]$ decide fără calcul). ✗[număr egal de exemple = egale]: "egale, ambele împart 12 exemple în 5 și 7" (explicație: aceleași ponderi nu înseamnă aceleași entropii; se compară ramurile pereche cu pereche).
- **Q3.** "Calculatorul tău nu are $\log_2$. Cum calculezi $\log_2 5$?" ✓ $\ln5/\ln2\approx2.3219$. ✗[ln = biți]: "$\ln5\approx1.609$, direct" (explicație: $\ln$ dă nați, nu biți; $H$ ar ieși cu factor 0.6931, G-ln). ✗[înmulțire]: "$\ln5\cdot\ln2$" (explicație: schimbarea bazei împarte, nu înmulțește).
- **Q4.** Aceeași rădăcină, 20 de exemple; formula de buzunar dă produsul $P_A=1200$ pentru ciotul A și $P_B=950$ pentru ciotul B. Ce atribut alegi? ✓ **B**: $H(Y|\cdot)=\tfrac1{20}\log_2P$, iar $\log_2$ e crescătoare, deci produsul mai mic dă entropia condiționată mai mică (IG mai mare). ✗[maximul, ca la IG]: A (explicație: produsul stă în $H(Y|\cdot)$, nu în IG; câștigă minimul, B:592 Obs. 2). ✗[produsele nu se compară fără logaritm]: "trebuie calculat întâi $\log_2$" (explicație: factorul $\tfrac1{20}$ și funcția $\log_2$ sunt aceleași pentru ambele cioturi și păstrează ordinea). (Builder: the symmetry $H(p)=H(1-p)$ is retrieved in Lecția 7, item 4; not asked again here.)

### Exerciții
**E 4.5** (B:503-505; status: book). Enunț: șase date de antrenament, atribute binare X1, X2, trei clase $Y\in\{1,2,3\}$; $(X_1,X_2,Y)$: (1,1,1), (1,1,1), (1,1,2), (1,0,3), (0,0,2), (0,0,3). (a) Calculează câștigul pentru X1 și X2; folosește aproximarea $\log_23=\tfrac{19}{12}$ și scrie câștigurile ca fracții. (b) Ce atribut e în rădăcină? Desenează arborele cu un nod. (c) Cum e clasificată instanța $X_1=0$, $X_2=1$?
- Câmpuri: $Gain(X_1)$ = $\tfrac14$ ($=\tfrac3{12}$); $Gain(X_2)$ = $\tfrac23$ ($=\tfrac8{12}$); rădăcina = X2; clasa pentru $(0,1)$ = 1. (Verificatorul acceptă și $0.2516$ pentru X1 dacă s-a folosit $\log_23=1.5850$, cu nota "cu aproximarea 19/12 iese exact 1/4".)
- Indicii: (1) $H[2,2,2]=\log_23$; $X_1=1$ dă $[2,1,1]$, $X_1=0$ dă $[0,1,1]$; (2) $H[2,1,1]=\tfrac32$, $H[0,1,1]=1$, deci $H(Y|X_1)=\tfrac46\cdot\tfrac32+\tfrac26\cdot1=\tfrac43$; (3) $Gain(X_1)=\tfrac{19}{12}-\tfrac{16}{12}=\tfrac3{12}$; $X_2=1$ dă $[2,1,0]$, $X_2=0$ dă $[0,1,2]$, ambele cu $H=\tfrac{11}{12}$, $Gain(X_2)=\tfrac{19-11}{12}$.
- Soluție (B:504-505): X2=1 $\to$ $[2a,1b,0c]\to Y=1$; X2=0 $\to$ $[0a,1b,2c]\to Y=3$. $(0,1)\to Y=1$ ("cu probabilitate 2/3"). Capcană: datele sunt inconsistente (la $(1,1)$ etichetele 1,1,2; la $(0,0)$ etichetele 2,3), deci nicio structură nu are eroare 0.
- Detectoare: $H(Y)=1$ (deci câștiguri 1/3 și 5/6...) → "ieșirea are trei clase: $H=\log_23$, nu 1" (G-range pe $\log_2 k$). Câștigul $\tfrac{8}{12}$ pus la X1 → G-swap atribut.
**E 4.36** (B:591-594; soluție DTs:5-11; status: slides). Versiune de calcul (derivarea simbolică e în ecranele de demonstrație): aplici fiecare formulă pe numere. (a) $H[3{+},4{-}]$ cu formula $\frac1{a+b}\log_2\frac{(a+b)^{a+b}}{a^ab^b}$ = 0.9852. (b) $H[2{+},1{-},1{*}]$ cu formula ternară = 1.5. (c) ciotul $[7{+},5{-}]\to[5{+},1{-}],[2{+},4{-}]$: $H(\text{nod}|\text{atribut})$ = 0.7842. (d) ciotul $[5{+},4{-}]\to[3{+},0{-}],[2{+},4{-}]$ (un copil cu 0): = 0.6122. (e) pentru ciotul de la (c): $IG$ = 0.1957. (f) alegere cu produsul: ciotul de la (c) față de $[7{+},5{-}]\to[4{+},2{-}],[3{+},3{-}]$: produsele 680.24 și 2916; câștigă minimul = primul ciot (cu $H(Y|\cdot)=0.7842<0.9591$).
- Indicii: (1) la (c) scrie produsul $\tfrac{6^6}{5^5\cdot1^1}\cdot\tfrac{6^6}{2^2\cdot4^4}$; (2) $=14.93\cdot45.56=680.2$; (3) $\tfrac1{12}\log_2 680.2$.
- Soluție: DTs:9-10 (formulele a-e). Control direct: (c) $\tfrac6{12}H(\tfrac16)+\tfrac6{12}H(\tfrac13)=0.3250+0.4591$.
- Detectoare: (c) 9.4096 → "ai uitat factorul $\tfrac1{a+b}$ (entropia unui nod cu două clase nu depășește 1)"; (c) 0.5436 → G-ln (0.7842·0.6931); (d) produs cu $0^0$ calculat ca 0 → "$0^0=1$ în produs: ramura pură nu contribuie cu niciun factor".
**E 4.42** (B:598; status: ruled; "Culegerea nu dă răspunsul; răspunsul la (b) nu se poate afla din tabel."). Enunț: întârzieri de zbor; tabelul dă, pentru fiecare atribut (Ploaie, Vânt, Vară, Iarnă, Ziua, Noaptea), numărul de zboruri amânate / neamânate când atributul e "Da", respectiv "Nu": Ploaie 30/10 și 10/30; Vânt 25/15 și 15/25; Vară 5/35 și 35/5; Iarnă 20/10 și 20/30; Ziua 20/20 și 20/20; Noaptea 15/10 și 25/30. (a) Ce atribut pune ID3 în rădăcină? Justifică riguros, fără a detalia toate calculele. (b) Ce atribut ar apărea pe nivelul 2?
- Câmpuri (a): rădăcina = Vară; $IG(\text{Vară})$ = 0.4564; $IG(\text{Ploaie})$ = 0.1887; $IG(\text{Ziua})$ = 0. (b) alegere: "nu se poate decide din tabel".
- Soluție (a): fiecare rând însumează 80 de zboruri, $[40,40]$ în total, deci $H(Y)=1$. Vara are ramuri de 40+40 cu cota minoritară $\tfrac18$ în ambele (pondere $\tfrac12$ fiecare, produs $0.2718$ fiecare). Orice alt atribut are, ramură cu ramură, un produs pondere·entropie cel puțin egal: Ploaie $1/4$ (0.4056), Vânt $3/8$ (0.4772), Ziua $1/2$ (0.5), Iarnă ($\tfrac{30}{80}H(\tfrac13)=0.3444$ și $\tfrac{50}{80}H(\tfrac25)=0.6068$), Noaptea ($\tfrac{25}{80}H(\tfrac25)=0.3034$ și $\tfrac{55}{80}H(\tfrac5{11})=0.6834$). Deci (288) are loc cu o injecție evidentă și $H(Y|\text{Vară})=0.5436$ e minim. IG-urile complete: Ploaie 0.1887, Vânt 0.0456, Vară 0.4564, Iarnă 0.0488, Ziua 0, Noaptea 0.0132. (b): tabelul dă doar marginale; cum se împart zborurile cu Vară=Da / Nu nu se vede, deci nivelul 2 nu se poate stabili riguros (Ploaie e doar al doilea după IG marginal).
- Detectoare (b): "Ploaie" → "al doilea după IG marginal nu e neapărat cel mai bun în ramura Vară=Da; ai nevoie de distribuția din ramură."

### Demonstrații (4.36 a-e, ecrane cu predicția pasului următor; soluție DTs:9-10)
- **a.** $H[a{+},b{-}]=-\frac a{a+b}\log_2\frac a{a+b}-\frac b{a+b}\log_2\frac b{a+b}$. Predicție: ce factor se scoate? Răspuns: $-\tfrac1{a+b}$. Apoi $a\log_2\tfrac a{a+b}+b\log_2\tfrac b{a+b}=\log_2\frac{a^ab^b}{(a+b)^{a+b}}$ (suma $a+b$ din exponent ajunge la numitor); semnul minus inversează raportul.
- **b.** La fel cu trei termeni; $H[a{+},b{-},c{*}]=\frac1{a+b+c}\log_2\frac{(a+b+c)^{a+b+c}}{a^ab^bc^c}$ (litera $c$ de aici nu are legătură cu $c$ din ciot).
- **c.** $H(\text{nod}|\text{atribut})=\frac{c+d}{a+b}H[c{+},d{-}]+\frac{e+f}{a+b}H[e{+},f{-}]$. Predicție: ce se simplifică? Factorul $\frac{c+d}{a+b}$ cu $\frac1{c+d}$ din formula lui (a); rămâne $\frac1{a+b}\log_2(\dots\cdot\dots)$.
- **d.** Pentru $c=0$ (ramura pură) un termen dispare: $H(\text{nod}|\text{atribut})=\frac{e+f}{a+b}H[e{+},f{-}]=\frac1{a+b}\log_2\frac{(e+f)^{e+f}}{e^ef^f}$.
- **e.** $IG=H[a{+},b{-}]-H(\text{nod}|\text{atribut})=\frac1{a+b}\log_2\Big(\frac{(a+b)^{a+b}}{a^ab^b}\cdot\frac{c^cd^d}{(c+d)^{c+d}}\cdot\frac{e^ef^f}{(e+f)^{e+f}}\Big)$ (diferența logaritmilor devine raport).

### Vizual (viz 4, mod calitativ: comparator de ciote)
Date: C1, C2, C3 (în ordine). Două ciote alăturate, fiecare ramură ca o cutie $[a{+},b{-}]$ cu lățimea proporțională cu ponderea. Între cutii: simbolurile $<,=,>$ pentru "pondere · entropie". Cursantul alege simbolul **înainte** să apară; la C3 widgetul spune "nu se potrivește" și deschide formula produsului. Avans manual.

### Note pentru constructor (L10)
- Valorile constructe: pretest ($0.7219$, $0.9710$), C3 și 4.36 (c, d, f), Q1-Q4; toate recalculate la secțiunea "Valori construite". C1, C2: cifre din Cn-s4:5-7 (A $0.5157$, B $0.9793$ recalculate; seminarul nu le tipărește).
- 4.5: cartea tipărește $\tfrac14$ și $\tfrac23$ sub aproximarea $\log_23=\tfrac{19}{12}$; valoarea cu $\log_2 3$ exact e $0.2516$.
- 4.42.b: hotărât: lecția cere doar (a) și arată de ce (b) nu se poate decide (allocation, notes).
- E 4.36 este o derivare în carte; câmpurile de calcul sunt aplicații numerice ale formulelor (nu repetă numerele din concret: (a) folosește $[3{+},4{-}]$, nu $[3{+},5{-}]$ de la C2). Textul simbolic e în ecranele de demonstrație.

---

## Lecția 11. ID3 complet, de mână (`ml-l11`, priority A)

**Concepte (4):** (a) algoritmul ID3: schița (ML3:8), pseudocodul (ML3:9), condiții de oprire, etichetă majoritară, ramură goală; (b) egalități la alegere: arborele nu e unic; un atribut apare o dată pe un drum, dar poate apărea de mai multe ori în arbore; (c) arborele ca reguli (calcul propozițional de ordin 0); (d) multiplicități (coloana Counts) și duplicate: ponderi în toate entropiile.
**Necesită:** vezi Lecția 9 (cioturi, rădăcina), vezi Lecția 10 (comparația fără calculator, formula produsului).

### Pretest
Ecran: patru rânduri $(A,B\to Y)$: $(0,0\to0)$, $(0,1\to0)$, $(1,0\to0)$, $(1,1\to1)$. "Desenează un arbore care le clasifică pe toate corect. Din câte teste are, cel mult, cel mai mic arbore?" Așteptat: **2** teste (A la rădăcină; A=0 $\to$ 0; A=1 $\to$ test B: B=0 $\to$ 0, B=1 $\to$ 1). Feedback: "Ai construit pe loc ce face ID3 în mod sistematic."

### Concret (T20b 2.1: șase rânduri)
Sursă: `tests/2020-2021-t1-seminar-b/subiect.pdf:2` (2 p). Tabel (running nose, coughing, reddened skin, fever $\to$ ill): (+,+,+,− $\to$ +), (+,+,−,− $\to$ +), (−,−,+,+ $\to$ +), (+,−,−,− $\to$ +), (−,−,−,− $\to$ −), (−,+,+,− $\to$ −). $H(Y)=H[4{+},2{-}]=H(\tfrac13)=0.9183$.
- **C1.** Predicție: ce atribut e în rădăcină? Cioturile: running nose: $[3{+},0{-}]$ / $[1{+},2{-}]$, $H(Y|\text{rn})=\tfrac12H(\tfrac13)=0.4591$; coughing: $[2{+},1{-}]$ / $[2{+},1{-}]$, $0.9183$ (IG 0); reddened skin: la fel, IG 0; fever: $[1{+},0{-}]$ / $[3{+},2{-}]$, $\tfrac56H(\tfrac25)=0.8091$, IG 0.1092. Rădăcina: **running nose**. Atenție pe ecran: $H(Y|\text{running nose})$ și $IG$ au aceeași valoare, 0.4591 (coincidență: $H(Y)=2\cdot0.4591$); fiecare număr poartă eticheta lui.
- **C2.** Predicție: nodul `running nose = +` e $[3{+},0{-}]$: ce faci? Frunză "+" (oprire: toate exemplele au aceeași etichetă). Nodul `running nose = −` e $[1{+},2{-}]$ (rândurile 3, 5, 6): predicție pentru atributul următor: fever împarte în $[1{+},0{-}]$ și $[0{+},2{-}]$, entropie 0 (IG 0.9183), coughing și reddened dau $0.6667$. Se alege **fever**.
- **C3.** Arborele complet: running nose = + $\to$ ill = +; running nose = − $\to$ fever (+ $\to$ ill = +, − $\to$ ill = −). Predicție: e consistent cu datele? Da, toate cele 6 rânduri sunt clasificate corect, eroare la antrenare 0.
- **C4.** Clasifică pacientul (coughing = +, fever = +, reddened skin = −, running nose = −): running nose = − $\to$ fever = + $\to$ bolnav (+). Coughing și reddened nu sunt folosite.
- **C5.** Arborele ca reguli (una pe frunză): IF running nose = + THEN ill = +; IF running nose = − $\wedge$ fever = + THEN ill = +; IF running nose = − $\wedge$ fever = − THEN ill = −. Ca formulă (calcul propozițional de ordin 0): $ill\Leftrightarrow running\ nose\vee fever$. Regulile sunt exclusive și exhaustive.

### Regula
- **R1 ID3** (ML3:8-9). Schița: creează rădăcina; atribuie toate exemplele rădăcinii; buclă: 1. $A\leftarrow$ cel mai bun atribut pentru nodul următor; 2. pentru fiecare valoare a lui $A$ creează un descendent; 3. împarte exemplele la frunze; 4. dacă toate sunt clasificate perfect, STOP, altfel repetă pe frunzele noi. Pseudocodul (ML3:9): dacă toate exemplele sunt pozitive $\to$ frunză +; toate negative $\to$ frunză −; dacă lista atributelor e goală $\to$ frunză cu eticheta cea mai frecventă; altfel $A\leftarrow$ atributul cu IG maxim, pentru fiecare valoare $v_i$ o ramură; dacă $Examples_{v_i}$ e vid $\to$ frunză cu eticheta majoritară **a părintelui**, altfel $ID3(Examples_{v_i},Target,Attributes\setminus\{A\})$. (Pseudocodul nu e citat în tabel, dar apare în teste.)
- **R2 Procedura de răspuns:** desenezi cioturile, scrii $H(Y|A)$ în formă generală, substitui, alegi minimul, recursezi pe nodurile impure, te oprești pe cele pure sau când nu mai sunt atribute. Regula de egalitate o dă enunțul (tabel în ordine). Un atribut apare **cel mult o dată pe un drum** de la rădăcină la frunză, dar poate apărea **de mai multe ori în arbore** (pe drumuri diferite; Cn-s3:12; B:488 (P11); 4.43).
- **R3 Proprietatea (P1)** (B:488): dacă datele sunt consistente, arborele ID3 e consistent cu ele, deci eroarea la antrenare e 0.
- **R4 Counts** (4.41): coloana "Counts" înseamnă multiplicități; toate entropiile se calculează cu ponderi = numere de apariții, nu rânduri distincte: un rând repetat de 95 de ori cântărește de 95 de ori.

### De ce?
Întrebare: "De ce arborele ID3 are eroare 0 la antrenare când setul e consistent?" Răspuns: ID3 continuă să împartă până când fiecare nod e pur sau nu mai are atribute. Un nod fără atribute rămase ar conține rânduri cu aceleași valori de intrare pe tot drumul, deci, la un set consistent, cu aceeași etichetă; deci fiecare frunză e pură și nimic nu e etichetat greșit.

### Reamintire
- **Q1.** Tabelul $(A,B,C\to Y)$: $(0,0,1\to1)$, $(1,0,1\to0)$, $(0,1,1\to0)$, $(1,1,1\to0)$, $(1,0,0\to1)$, $(0,0,0\to1)$. Enunțul nu dă regulă de egalitate. Câți arbori ID3 diferiți se pot obține? ✓ mai mulți: B și C au același câștig (0.4591, față de 0.0817 la A), deci rădăcina poate fi oricare. ✗[ID3 e determinist]: unul singur (explicație: ID3 e determinist doar dacă enunțul fixează egalitățile; aici există egalitate, ca la 4.37, Sunny). ✗[primul din tabel]: unul singur, cu B (explicație: "primul din tabel" e o regulă de egalitate, nu o proprietate a algoritmului; testul o spune în enunț).
- **Q2.** Tabel cu Counts: $(x_1,+,30)$, $(x_1,-,10)$, $(x_2,+,5)$, $(x_2,-,55)$. Cât e $H(Y|X)$? ✓ 0.5728. ✗[ignori Counts]: 1 (explicație: tratând fiecare rând o dată, ambele ramuri ar fi $[1{+},1{-}]$; dar ramurile au 40 și 60 de exemple cu distribuții diferite). ✗[IG în loc de H]: 0.3613 (explicație: $H(Y)=0.9341$ și $IG=0.9341-0.5728$; ai dat câștigul).
- **Q3.** La un nod, ID3 testează Outlook (valori Sunny, Overcast, Rain), dar niciun exemplu din nod nu are Outlook = Overcast. Ce pune pe ramura Overcast (pseudocodul ML3:9)? ✓ o frunză cu eticheta majoritară a exemplelor din nodul curent (părintele ramurii). ✗[ramura se omite]: "nu creează ramura" (explicație: ID3 creează câte o ramură pentru fiecare valoare; pe cea goală pune o frunză, ca orice instanță nouă să primească o etichetă). ✗[majoritatea întregului set]: "eticheta majoritară a tuturor exemplelor de antrenament" (explicație: pseudocodul folosește exemplele din nodul curent, nu tot setul).
- **Q4.** Un nod are $[3{+},1{-}]$ și toate atributele au fost deja testate pe drumul până la el. Ce face ID3? ✓ pune o frunză "+", eticheta majoritară; un exemplu din nod rămâne clasificat greșit. ✗[testează din nou un atribut]: "reia un atribut de pe drum" (explicație: atributele de pe drum au fost scoase din listă, $Attributes\setminus\{A\}$ în pseudocod). ✗[frunză fără etichetă]: "lasă nodul fără etichetă, fiindcă nu e pur" (explicație: orice frunză primește o etichetă; când lista atributelor e goală, eticheta e cea mai frecventă). (Builder: "training error 0 says nothing about new data" is 4.2.f and "an attribute twice on a path" is 4.43, both exercises of this lesson; they are not asked again in the quiz.)

### Exerciții
**E 4.2** (B:494-498; soluție în carte, DTs:12-22; status: book). Enunț: un naufragiat, ciuperci comestibile / otrăvitoare. Tabelul (Ușoară, Mirositoare, ArePete, Netedă $\to$ Comestibilă): A (1,0,0,0 $\to$ 1); B (1,0,1,0 $\to$ 1); C (0,1,0,1 $\to$ 1); D (0,0,0,1 $\to$ 0); E (1,1,1,0 $\to$ 0); F (1,0,1,1 $\to$ 0); G (1,0,0,1 $\to$ 0); H (0,1,0,0 $\to$ 0). Necunoscute: U (0,1,1,1 $\to$ ?), V (1,1,0,1 $\to$ ?), W (1,1,0,0 $\to$ ?). (a) Entropia atributului Comestibilă. (b) Doar privind datele, fără a calcula IG, ce atribut alegi în rădăcină? (c) IG-ul atributului ales. (d) Arborele ID3 complet; clasifică U, V, W. (e) Exprimă clasificarea în calcul propozițional. (f) Există vreun risc dacă mănânci ciupercile clasificate drept comestibile?
- Câmpuri: (a) $H[3{+},5{-}]$ = 0.9544; (b) rădăcina = Netedă; (c) $IG(\text{Netedă})$ = 0.0488 (și $H(Y|\text{Netedă})$ = 0.9056); (d) arbore: Netedă=0 $\to$ Mirositoare (0 $\to$ 1, 1 $\to$ 0); Netedă=1 $\to$ Mirositoare (0 $\to$ 0, 1 $\to$ 1); U = 1, V = 1, W = 0; (e) alegere: $Comestibila\Leftrightarrow(\neg Netedă\wedge\neg Mirositoare)\vee(Netedă\wedge Mirositoare)$; (f) alegere: "da, există risc: consistent nu înseamnă corect pe date noi".
- Indicii (b): (1) calculezi, ca la Lecția 10, produsul pentru fiecare ciot: Netedă $[2{+},2{-}],[1{+},3{-}]$ față de Ușoară $[1{+},2{-}],[2{+},3{-}]$; (2) $2^{16}<3^3\cdot5^5$, adică $65536<84375$ (B:496-497: "Vă sfătuim să procedați așa"); (3) produsele 151.70 și 195.31, câștigă minimul: Netedă.
- Soluție (B:495-498): $H=3-\tfrac38\log_23-\tfrac58\log_25=0.9544$. $H(Y|\text{Netedă})=\tfrac48\cdot1+\tfrac48H[1{+},3{-}]=\tfrac32-\tfrac38\log_23=0.9056$, $IG=0.0488$; Ușoară, Mirositoare, ArePete au câte $0.9512$ și $IG=0.0032$ (egalitate între ele, nu cu Netedă). Nodul Netedă=0 ($[2{+},2{-}]$: rândurile A, B, E, H): Mirositoare dă $[2{+},0{-}]$ și $[0{+},2{-}]$, entropie 0, deci se alege fără alte calcule (entropia nu e negativă). Nodul Netedă=1 ($[1{+},3{-}]$: C, D, F, G): Mirositoare dă $[0{+},3{-}]$ și $[1{+},0{-}]$, entropie 0. (f) arborele e consistent (datele sunt necontradictorii) dar nu garantează nimic pe date noi; calitatea se verifică pe un set de validare, separat de antrenament.
- Detectoare: (a) 0.6616 → G-ln; (a) 1 → "setul nu e $[4{+},4{-}]$, are 3 + și 5 −"; (c) 0.9056 → G-IG/H; (c) 0.0032 → "ai luat IG-ul unui atribut din egalitatea Ușoară/Mirositoare/ArePete, nu pe al lui Netedă"; (d) la W: 1 → "W are Netedă=0, deci mergi pe ramura Netedă=0, Mirositoare=1 $\to$ 0".
**E 4.37** (B:594-595; status: verified-twice; "Culegerea nu dă răspunsul; verificat de două ori."). Enunț: zece zile (Weather, Temperature, Humidity, Wind $\to$ Play): 1 Sunny Hot High Weak No; 2 Cloudy Hot High Weak Yes; 3 Sunny Mild Normal Strong Yes; 4 Cloudy Mild High Strong Yes; 5 Rainy Mild High Strong No; 6 Rainy Cool Normal Strong No; 7 Rainy Mild High Weak Yes; 8 Sunny Hot High Strong No; 9 Cloudy Hot Normal Weak Yes; 10 Rainy Mild High Strong No. Valori date: $H(1/4)=0.8112$, $H(1/3)=0.9182$, $H(2/5)=0.9709$, $H(3/7)=0.9852$. (a) Stabilește riguros atributul din rădăcină. (b) La fel, prin raționament calitativ și prin produsul din Lecția 10. (c) Ce atribute pot fi puse pe nivelul 2? Completează arborele. E arborele unic? Care e eroarea la antrenare?
- Câmpuri: $H(Play)$ = 1; $H(Play|Weather)$ = 0.6; $IG(Weather)$ = 0.4; $IG(Temperature)$ = 0.1145; $IG(Humidity)$ = 0.0349; $IG(Wind)$ = 0.1245; rădăcina = Weather. (b) produsele: Weather 64.0; Temperature 462.96; Humidity 804.24; Wind 432.0: câștigă minimul = Weather. (c) Sunny $[1{+},2{-}]$: Humidity și Temperature (egalitate, IG 0.9183 fiecare), Wind 0.2516; Cloudy $[3{+},0{-}]$: frunză Yes; Rainy $[1{+},3{-}]$: Wind (IG 0.8113); arborele **nu** e unic; eroarea la antrenare = 0.
- Soluție: ciotul Weather: Sunny $[1{+},2{-}]$ (zilele 1, 3, 8), Cloudy $[3{+},0{-}]$ (2, 4, 9), Rainy $[1{+},3{-}]$ (5, 6, 7, 10). Sunny: Humidity High = zilele 1, 8 (No, No), Normal = ziua 3 (Yes): perfect; Temperature Hot = 1, 8 (No), Mild = 3 (Yes): perfect (egalitate); Wind nu separă. Rainy: Wind Weak = ziua 7 (Yes), Strong = 5, 6, 10 (No): perfect. Aceeași problemă ca T21C 2.
- Detectoare: $H(Play|Weather)=0.4$ → G-IG/H; 0.5765 → G-nw; "arborele e unic" → "la Sunny, Humidity și Temperature au același IG, deci două arbori valabili (P2)".
**E 4.41** (B:597; status: verified-twice; "Culegerea nu dă răspunsul; verificat de două ori."). Enunț: aprobarea cardului de credit. Rânduri (Gender, Income, Approved, Counts): (F, Low, +, 10); (F, High, +, 95); (M, Low, +, 5); (M, High, +, 90); (F, Low, −, 80); (F, High, −, 20); (M, Low, −, 120); (M, High, −, 30). (a) Entropia lui Approved (log$_2$). (b) $IG(Approved,Gender)$ și $IG(Approved,Income)$. (c) Arbore ID3, fără post-pruning.
- Câmpuri: total 450, $[200{+},250{-}]$; $H$ = 0.9911; $IG(Gender)$ = 0.0112; $IG(Income)$ = 0.4267; rădăcina = Income; eroarea la antrenare = $65/450$ ($0.1444$); "splitul pe Gender e redundant" = adevărat.
- Soluție: Gender: F $[105{+},100{-}]$, M $[95{+},150{-}]$, $H(A|Gender)=0.9798$. Income: Low $[15{+},200{-}]$, High $[185{+},50{-}]$, $H(A|Income)=0.5644$. Arbore: Income; Low $\to$ Gender (F $[10{+},80{-}]\to-$; M $[5{+},120{-}]\to-$); High $\to$ Gender (F $[95{+},20{-}]\to+$; M $[90{+},30{-}]\to+$). Fiecare frunză repetă decizia părintelui Income: Gender e redundant pentru clasificare (un nod care nu schimbă nicio decizie). Erori: $15+50=65$.
- Detectoare: $H(A)=1$ → "$[200{+},250{-}]$ nu e echilibrat"; cu 8 rânduri tratate ca 8 exemple, $[4{+},4{-}]$ → "Counts sunt multiplicități: contează ca ponderi."
**E 4.43** (B:598; status: verified-twice; logică). Enunț: ID3 standard interzice ca un atribut A să apară de două ori pe același drum. Dacă renunțăm: (a) cum se împart instanțele la un nod în care A apare a doua oară? (b) cât e IG acolo? (c) justifică asta restricția?
- Câmpuri (alegeri): (a) "toate instanțele merg pe o singură ramură, celelalte primesc zero"; (b) 0; (c) da.
- Soluție (demonstrație în trei pași, vezi mai jos).
- Detectoare: (b) "IG negativ" → G-range; (a) "se împart egal" → "toate instanțele de la nod au deja aceeași valoare a lui A, pentru că au trecut prin ramura A = v".

### Demonstrație (4.43, cu predicție)
(1) Predicție: ce valoare a lui $A$ au instanțele din nod? Toate au valoarea $v$ a ramurii pe care au coborât. (2) Deci la un nou test pe $A$ o singură ramură primește toate instanțele, celelalte rămân goale; entropia condiționată: $H(S|A)=\tfrac{|S|}{|S|}H(S)=H(S)$. (3) $IG=H(S)-H(S|A)=0$; un nod cu $IG=0$ nu aduce nimic, deci restricția nu pierde nimic pentru atribute discrete.

### Vizual (viz 4, ID3 builder complet)
Tabelul T20b 2.1 se partiționează la fiecare split: rândurile cad în cutii, nodurile impure se evidențiază, cursantul prezice atributul din nodul următor, iar la frunze apare regula IF...THEN. Mod liber pentru exerciții (4.37, 4.2, 4.41 cu Counts ca ponderi). Avans manual.

### Note pentru constructor (L11)
- 4.2: schimbul de IG ($0.0032$ la trei atribute) e o capcană declarată (ties reale).
- 4.37, 4.41: toate valorile verificate de două ori (verified-answers); produsele din 4.37.b recalculate aici (64, 462.96, 804.24, 432).
- Datele din 4.2 (cele opt rânduri) sunt aceleași ca în demonstrația 5 din DEM:1 și BS:90-93 (Lecția 20): declarat în `declared_reuse`; aici nu se arată nimic din Bayes.
- Pretest, Q1-Q4: cifre construite (tabelul $(A,B,C\to Y)$ cu $IG$ 0.0817/0.4591/0.4591; Counts 30/10/5/55).

---

## Lecția 12. Proprietăți ID3 (1): căutare greedy, optimalitate, expresivitate, bias inductiv (`ml-l12`, priority B)

**Concepte (3):** (a) spațiul ipotezelor complet, căutare greedy cu 1-step look-ahead, spațiul de versiuni, bias inductiv (de căutare), briciul lui Occam; (b) expresivitate: orice funcție booleană are un arbore (P0); (c) arborele ID3 nu e neapărat optim, nu e unic și e sensibil la atribute superflue (P2, P3, P4).
**Necesită:** vezi Lecția 9 (IG, cioturi), vezi Lecția 11 (algoritmul ID3, ID3 complet).
**Added 2026-10-29 (teacher list item 6; concept C12.4 in `allocation.json`):** (d) ce urmărește ID3 și ce model construiește. Rule R0 and quiz item Q5.

### Pretest
Ecran: funcția booleană $f(A,B,C)$ egală cu 1 exact pe rândurile $001,010,100,111$ (număr impar de 1) și cu 0 pe celelalte patru. "Poate un arbore de decizie să reprezinte exact $f$? Ce adâncime are arborele complet care o face?" Așteptat: da; adâncime 3, opt frunze (fiecare combinație de valori are propria frunză). Feedback: nu spune încă dacă există unul mai mic.

### Concret (T20C 2: patru puncte în xor)
Sursă: `tests/2020-2021-t1-ciortuz/subiect.pdf:2` (figura de la p.2: la $X_2=1$: $X_1=0\to-$, $X_1=1\to+$; la $X_2=0$: $X_1=0\to+$, $X_1=1\to-$). Rânduri $(X_1,X_2\to Y)$: $(0,0\to1)$, $(0,1\to0)$, $(1,0\to0)$, $(1,1\to1)$ (două exemple pozitive și două negative, "(¬)xor").
- **C1.** Predicție: există un arbore care le clasifică perfect? Da: $X_1$ la rădăcină, apoi $X_2$ pe ambele ramuri; 3 noduri de test, 4 frunze, eroare 0.
- **C2.** Predicție: care e IG pentru $X_1$ și pentru $X_2$ la rădăcină? Fiecare ramură e $[1{+},1{-}]$ cu $H=1$, deci $H(Y|X_i)=1=H(Y)$ și $IG=0$ pentru ambele.
- **C3.** Varianta de ID3 din enunț (T20C 2b): se oprește când nodul e pur **sau** nu există niciun atribut cu IG strict pozitiv. La rădăcină nu există: arborele rămâne o singură frunză, 2 din 4 exemple greșite (eroare $\tfrac12$). Predicție: ce face pseudocodul din ML3:9? Alege un atribut chiar cu IG 0 și continuă; ajunge la arborele perfect de la C1.
- **C4.** Concluzie: spațiul ipotezelor conține arborele perfect (spațiul e complet), dar căutarea greedy cu 1-step look-ahead nu-l găsește dacă primul pas nu aduce IG. (De ce: ecranul următor.)

### Regula
- **R0 Ce urmărește ID3 și ce construiește** (B:486-487, Sumar, notele 490-491; ML3:8; added 2026-10-29, teacher list item 6). **Modelul** este un arbore de decizie: noduri de test cu atribute de intrare, ramuri cu valorile lor, frunze cu valori ale ieșirii (vezi Lecția 9); altfel spus, o ierarhie de partiționări ale exemplelor de antrenament, construită adăugând atributele câte unul (nota 490). **Obiectivul** (B:486-487): un arbore care (i) explică cât mai bine datele (dacă datele sunt consistente, arborele e consistent cu ele), (ii) este cât mai **compact** (puține niveluri și noduri) și (iii) are o putere de **generalizare** cât mai bună. ID3 nu calculează un cost al arborelui întreg: urmărește obiectivul **local**, alegând la fiecare nod atributul cu IG maxim, adică $H(Y|A)$ minim (vezi Lecția 9). Cum caută și ce nu garantează: R1 și R3. (Nota 491, într-o propoziție: ID3 poate fi văzut și ca algoritm de optimizare care caută o distribuție ierarhică de entropie minimă; cerința de arbore cât mai mic este cea practică.)
- **R1 Căutarea** (B:486-487; ML3:10). Spațiul de căutare e mulțimea tuturor arborilor care se pot construi cu atributele de intrare în nodurile de test și cu valorile ieșirii în frunze, "de dimensiune exponențială" în numărul de atribute; ID3 îl parcurge **greedy**, cu **1-step look-ahead** ("Iterative Dichotomizer", divide-et-impera, recursiv), fără backtracking, și întoarce o singură ipoteză. Spațiul ipotezelor e **complet** (funcția țintă e sigur acolo). Spațiul de versiuni pentru un concept (de învățat) = arborii consistenți cu datele (ex. 1, 3, 32, 39).
- **R2 Bias inductiv** (ML3:17; B:487): ID3 nu e fără bias. Preferă arbori cu structură ierarhică, **consistenți** cu datele dacă acestea sunt consistente, cu cât mai puține niveluri / noduri, și cu atribute cu IG mare aproape de rădăcină. E un bias de **căutare** (preferință între ipoteze), nu o restricție a spațiului (bias de limbaj, ca la Candidate-Elimination). Briciul lui Occam (ML3:18): argument pentru, puține ipoteze scurte, deci una scurtă consistentă nu e coincidență; argument împotrivă: există multe moduri de a defini mulțimi mici (arbori cu număr prim de noduri), și nimic special la "mic după mărime".
- **R3 Proprietăți** (B:486-488): **(P0)** orice funcție booleană de $n$ argumente se reprezintă cu un arbore complet (adâncime $n$, $2^n$ frunze). **(P2)** arborele ID3 nu e neapărat unic (egalitățile, vezi Lecția 11). **(P3)** nu e neapărat optimal ca număr de noduri / niveluri (greedy). **(P4)** e sensibil la atribute superflue (un atribut fără rost în concept poate fi ales primul). Complexitatea (B:487; ML3:19, în ipotezele A1 adâncime $O(\log m)$, A2 instanțele diferă, A2' atributele ajung): $O(d\,m\log m)$ la antrenare, $O(d)$ la testare.

### De ce?
Întrebare: "De ce poate fi necesar un atribut cu $IG=0$ la rădăcină?" Răspuns: IG măsoară ce spune **un singur** atribut despre $Y$. La xor fiecare atribut singur lasă clasele pe jumătate în ambele ramuri, dar perechea determină $Y$ complet; algoritmul vede doar un pas înainte, deci poate fie să renunțe (varianta cu IG>0), fie să aleagă "la întâmplare" printre atribute cu IG 0. (Aceeași situație ca la 0.58, vezi Lecția 9.)

### Reamintire
- **Q1.** Pentru un set de date consistent, spațiul de versiuni este: ✓ mulțimea arborilor consistenți cu datele. ✗[arborele ID3]: "arborele întors de ID3" (explicație: ID3 întoarce o singură ipoteză din spațiul de versiuni; acesta le conține pe toate cele consistente). ✗[spațiul ipotezelor]: "toți arborii care se pot construi cu atributele" (explicație: acesta e spațiul de căutare; spațiul de versiuni păstrează doar arborii fără eroare pe date). (Builder: the leaf count $2^n$ of the complete tree is exercise 4.33; not asked here.)
- **Q2.** După ce a ales rădăcina, poate ID3 să revină asupra ei dacă arborele de dedesubt iese prea mare? ✓ nu: ID3 nu face backtracking; decide la fiecare nod o singură dată, cu 1-step look-ahead. ✗[backtracking]: "da, reface rădăcina dacă arborele final are prea multe noduri" (explicație: în pseudocod nu există niciun pas de revenire; de aceea arborele nu e neapărat minim, (P3)). ✗[privește toți pașii]: "nu e nevoie: ID3 evaluează dinainte toți pașii următori" (explicație: IG se calculează doar pentru pasul curent; varianta cu 2 pași, 4.17-4.18, e o extensie, nu ID3 standard). (Builder: the true/false "ID3 guarantees the optimal tree" is exercise 4.21.a in Lecția 15; not asked here.)
- **Q3.** Biasul inductiv al lui ID3 este: ✓ o preferință de căutare: arbori scurți, atribute cu IG mare lângă rădăcină. ✗[restricție de spațiu]: ID3 exclude unele funcții (explicație: spațiul e complet, (P0)). ✗[fără bias]: ID3 nu are bias (explicație: preferă anumiți arbori între cei consistenți).
- **Q4.** Un atribut neutil pentru conceptul real are IG pozitiv la rădăcină. ID3 poate: ✓ să-l aleagă primul, ceea ce dă un arbore mai adânc pe date consistente (P4); eroarea la antrenare rămâne 0. ✗[ignoră]: să-l ignore pentru că nu e în concept (explicație: ID3 nu cunoaște conceptul, vede doar IG). ✗[eroare la antrenare]: să crească eroarea la antrenare (explicație: pe date consistente eroarea rămâne 0; crește doar dimensiunea arborelui).
- **Q5** (added 2026-10-29, teacher list item 6). Ce model întoarce ID3 și ce urmărește când îl construiește? ✓ un arbore de decizie; caută un arbore consistent cu datele (dacă acestea sunt consistente), cât mai compact și care să generalizeze bine, alegând la fiecare nod atributul cu IG maxim. ✗[ID3 minimizează direct eroarea la antrenare]: "o regulă căutată direct după eroarea minimă la antrenare" (explicație: criteriul de alegere este IG, la fiecare nod; eroarea 0 la antrenare pe date consistente e o consecință, (P1), nu criteriul). ✗[ID3 găsește arborele minim]: "cel mai mic arbore consistent cu datele" (explicație: compactitatea e un obiectiv, dar căutarea greedy nu o garantează, (P3)). ✗[IG maximizat pe tot arborele]: "arborele cu cea mai mare sumă a câștigurilor de informație pe toate nodurile" (explicație: IG se maximizează local, la fiecare nod, o singură dată; ID3 nu compară arbori întregi).

### Exerciții
**E 4.1** (B:492-494; status: book; DTs). Enunț: reprezintă arborele / arborii cu numărul minim de noduri care corespund funcției $(\neg A\vee B)\wedge\neg(C\wedge A)$. Tabelul $(A,B,C\to X)$: 000→1, 001→1, 010→1, 011→1, 100→0, 101→0, 110→1, 111→0 ($[5{+},3{-}]$).
- Câmpuri: numărul minim de noduri de test = 3; rădăcina optimă = A; numărul de arbori optimi = 2; rădăcina B sau C: minim 4 teste.
- Indicii: (1) pui pe rând fiecare atribut în rădăcină și cauți arborele minim pentru fiecare cofactor ($f[A/0]$, $f[A/1]$); (2) $f[A/0]=1$ (frunză, $[4{+},0{-}]$), $f[A/1]=B\wedge\neg C$; (3) $B\wedge\neg C$ cere 2 teste (B apoi C, sau C apoi B).
- Soluție (B:492-494): rădăcina A: A=0 $\to$ 1; A=1 $\to$ B (B=0 $\to$ 0; B=1 $\to$ C: C=0 $\to$ 1, C=1 $\to$ 0) sau C apoi B: 3 teste. Rădăcina B: $f[B/0]=\neg A$, $f[B/1]=\neg C\vee\neg A$, minim "3 niveluri și 4 noduri"; rădăcina C la fel. Arborii optimi sunt cei cu rădăcina A.
- Detectoare: "3 teste, rădăcina B" → "B dă cel puțin 4 teste: $\neg C\vee\neg A$ cere 2 teste, plus B".
**E 4.3** (B:499-501; status: book). Enunț: $A\vee(B\wedge C)$, tabel $(A,B,C\to Y)$: 000→0, 001→0, 010→0, 011→1, 100→1, 101→1, 110→1, 111→1. (a) Aplică ID3. (b) E optimal? Există alt arbore de adâncime / număr de noduri mai mic?
- Câmpuri: $H(Y|A)$ = 0.4056; $H(Y|B)=H(Y|C)$ = 0.9056; rădăcina = A; numărul de teste ale arborelui ID3 = 3; ID3 optimal = da; ID3 unic = nu (B și C se pot schimba).
- Soluție (B:499-501): A=1 $\to$ 1 ($[4{+},0{-}]$); A=0 ($[1{+},3{-}]$): B sau C (simetrie); B=0 $\to$ 0, B=1 ($[1{+},1{-}]$) $\to$ C: C=0 $\to$ 0, C=1 $\to$ 1. Pentru (b): cu B la rădăcină, $f[B/0]=A$ și $f[B/1]=A\vee C$ cer cel puțin 4 teste în total; arborele ID3 (3 teste) e optim. Calitativ: $H(Y|A)=\tfrac12H[1{+},3{-}]<\tfrac12+\tfrac12H[3{+},1{-}]=H(Y|B)$ pentru că $H[1{+},3{-}]=H[3{+},1{-}]$ și $\tfrac48H[4{+},0{-}]<\tfrac48H[2{+},2{-}]$.
- Detectoare: "B la rădăcină" → G-nw / "ramura pură a lui A cântărește la fel de mult ca cea amestecată".
**E 4.4** (B:501-503; status: book). Enunț: intrări binare A, B, C, ieșire Y: $(A,B,C,Y)$ = (1,1,0,0), (1,0,1,1), (0,1,1,1), (0,0,1,0). (a) Arborele calculat de ID3; e consistent cu datele? (b) Există un arbore de adâncime mai mică, consistent? Ce concept logic reprezintă?
- Câmpuri: $IG(A)=IG(B)$ = 0; $IG(C)$ = 0.3113; rădăcina = C; numărul de niveluri ale arborelui ID3 = 3; consistent = da; adâncimea arborelui minim = 2; conceptul = $Y=A\ xor\ B$.
- Soluție (B:502-503): $H(Y|A)=H(Y|B)=1$ (ambele împart în $[1{+},1{-}]$ + $[1{+},1{-}]$), $C$: $[0{+},1{-}]$ și $[2{+},1{-}]$, $H=0.6887$. C=0 $\to$ 0; C=1 ($[2{+},1{-}]$): A și B au același IG (0.2516), se alege A; A=1 $\to$ 1; A=0 $\to$ B: B=0 $\to$ 0, B=1 $\to$ 1. E consistent (datele sunt consistente; "prin construcție"). (b) Arborele cu A la rădăcină și B pe ambele ramuri are 2 niveluri de teste (3 noduri de test, ca arborele ID3, dar cu un nivel mai puțin): ID3 nu e optim din cauza greedy-ului; C e atributul superflu ales primul (P3, P4).
- Detectoare: "rădăcina A" → "A are IG 0 la rădăcină, deși e în concept: C câștigă".
**E 4.17** (opțional; B:526-528; status: book). Enunț: set cu $A$ atribute booleene (toate necesare, toate instanțele prezente). (a) Numărul total de apeluri ale funcției IG pentru tot arborele. (b) $IG_{2-step}(D,a_i)=\max_{(a_l,a_r)}\tfrac{n_l}{n_l+n_r}IG(D_l,a_l)+\tfrac{n_r}{n_l+n_r}IG(D_r,a_r)$: (b1) de ce ponderile; (b2) apeluri pentru rădăcină; (b3) la $A=10$, câte niveluri complete de ID3 standard costă la fel; (b4) clasa de modele e mai mare decât la ID3?
- Câmpuri: (a) $N_{IG}=\sum_{i=0}^{A-2}2^i(A-i)$, de ex. $A=3$: 7, $A=4$: 18; (b2) $2A^2-2A$; la $A=10$: 180; (b3) 4 niveluri (ID3 standard cumulează 10, 28, 60, 116, 212 pentru 1-5 niveluri); (b4) nu, aceeași clasă de arbori.
- Soluție: (b1) ponderile = proporțiile de instanțe, altfel un câștig mare pe o mulțime mică ar conta ca unul pe o mulțime mare; (b4) arborele găsit poate fi mai bun, clasa e aceeași.
**E 4.18** (opțional; B:528-532; status: book). Enunț: opt rânduri $(X_1,X_2,X_3\to Y)$: 000→0, 001→0, 010→1, 011→1, 101→1, 101→1, 110→0, 110→0 (adică $Y=X_1\ xor\ X_2$, cu duplicate). (a) Arborele ID3 standard. (b) Arborele cu IG cu 2-step look-ahead.
- Câmpuri: (a) $IG(X_1)=IG(X_2)$ = 0, $IG(X_3)$ = 0.1887, rădăcina = $X_3$, 5 noduri de test (sub ambele ramuri $X_1$ cu IG 0.3113, apoi $X_2$); (b) $IG_{2-step}(X_1)=IG_{2-step}(X_2)=1$, $IG_{2-step}(X_3)=0.3113$; rădăcina = $X_1$ sau $X_2$; 3 noduri de test; sunt 3 arbori optimi pe care metoda îi găsește, ID3 standard pe niciunul.
**E 4.32** (B:590; status: verified-twice; "Culegerea nu dă răspunsul; verificat de două ori."). Enunț: arborele / arborii cu numărul minim de noduri de test pentru $(A\ xor\ B)\wedge C$ pe atributele booleene $A,B,C$.
- Câmpuri: numărul minim de teste = 4; rădăcina unică optimă = C; numărul de arbori optimi = 2; rădăcina A sau B: minim 5 teste.
- Soluție: cofactori: rădăcina C: $f[C/0]=0$ (frunză), $f[C/1]=A\ xor\ B$ (3 teste: A, apoi B pe ambele ramuri) $\Rightarrow$ 1+3 = 4. Rădăcina A: $f[A/0]=B\wedge C$ (2 teste), $f[A/1]=\neg B\wedge C$ (2 teste) $\Rightarrow$ 1+2+2 = 5; B la fel. Doi arbori optimi (A apoi B, sau B apoi A, sub C=1). Capcană: intuiția cere xor-ul întâi, dar $\neg C$ anulează toată funcția.
- Detectoare: "rădăcina A, 3 teste" → "pe A=0 și A=1 funcțiile $B\wedge C$ și $\neg B\wedge C$ cer câte 2 teste: total 5".
**E 4.33** (B:590; status: verified-twice, logică; "Culegerea nu dă răspunsul; verificat de două ori."). Enunț: "Orice funcție booleană de $n$ argumente poate fi reprezentată cu un arbore de decizie. Adevărat sau fals? Dacă da, explică cum se construiește arborele."
- Câmpuri: răspunsul = adevărat; numărul de frunze al arborelui complet pentru $n=5$ = 32; adâncimea = 5.
- Soluție (demonstrație mai jos). Mărimea poate fi exponențială (paritatea cere $2^n$ frunze, motiv pentru care contează întrebările de minimalitate 4.1 și 4.32).
**E 4.39** (B:596; status: verified-twice; "Culegerea nu dă răspunsul; verificat de două ori."). Enunț: $(A\wedge B)\vee(C\wedge D)$. (a) Aplică ID3 (folosește simetriile). (b) E optim arborele ID3 (adâncime / noduri)?
- Câmpuri: $[7{+},9{-}]$ pe 16 rânduri; $IG(A)=IG(B)=IG(C)=IG(D)$ = 0.1058; arborele ID3: 6 noduri de test, adâncime 4; ID3 optimal = da (minim exhaustiv: 6 teste, adâncime 4); ID3 unic = nu (rădăcina poate fi oricare din cele patru).
- Soluție: A=0: funcția $C\wedge D$ ($[2{+},6{-}]$), C și D egale (IG 0.3113), B inutil (IG 0); C=0 $\to$ 0, C=1 $\to$ D. A=1: $B\vee(C\wedge D)$ ($[5{+},3{-}]$), B cel mai bun (IG 0.5488): B=1 $\to$ 1; B=0 $\to$ C apoi D. Contrast cu 4.4: aici ID3 e optimal.
**E 4.40** (B:596-597; status: verified-twice; "Culegerea nu dă răspunsul; verificat de două ori."). Enunț: marțieni (M) față de oameni (H) după Green, Legs, Height, Smelly; instanțele (Species Green Legs Height Smelly): 1 M N 3 S Y; 2 M Y 2 T N; 3 M Y 3 T N; 4 M N 2 S Y; 5 M Y 3 T N; 6 H N 2 T Y; 7 H N 2 S N; 8 H N 2 T N; 9 H Y 2 S N; 10 H N 2 T Y. (a) Învață arborele ID3. (b) Descrie conceptul M ca mulțime de reguli conjunctive. (c) Regulile de la (b) folosesc până la 4 atribute; găsește reguli cu doar 2 atribute pe conjuncție și eroare 0; se poate reprezenta ca arbore de adâncime 2?
- Câmpuri: $IG(Legs)$ = 0.3958, $IG(Green)$ = 0.1245, $IG(Height)=IG(Smelly)$ = 0; rădăcina = Legs; la Legs=2: $IG(Green)$ = 0.0617, $IG(Height)=IG(Smelly)$ = 0.006, deci Green; 5 noduri de test, adâncime 4; (c) 2 atribute pe conjuncție = da; arbore de adâncime 2 = da, cu rădăcina Height (IG 0 la rădăcină).
- Soluție: Legs=3 $\to$ M (3 instanțe); Legs=2 ($[2M,5H]$): Green. Green=Y ($[1M,1H]$: instanțele 2 și 9, diferă doar prin Height): Height (T $\to$ M, S $\to$ H). Green=N ($[1M,4H]$): Height (0.4) bate Smelly (0.5510): T $\to$ H ($[0M,3H]$); S ($[1M,1H]$: 4 și 7) $\to$ Smelly (Y $\to$ M, N $\to$ H). (b) $M\Leftrightarrow(Legs=3)\vee(Legs=2\wedge Green=Y\wedge Height=T)\vee(Legs=2\wedge Green=N\wedge Height=S\wedge Smelly=Y)$. (c) $(Green=Y\wedge Height=T)\rightarrow M$, $(Smelly=Y\wedge Height=S)\rightarrow M$, altfel H (verificat pe toate cele 10 instanțe); arborele: Height; T $\to$ Green (Y $\to$ M, N $\to$ H); S $\to$ Smelly (Y $\to$ M, N $\to$ H), 3 noduri de test, adâncime 2, mai bun decât cel ID3 deși Height are IG 0 la rădăcină.
- Detectoare: "Height n-are loc în arborele optim fiindcă IG = 0" → "IG = 0 la rădăcină nu exclude utilitatea mai jos (P3, ca la xor)".

### Demonstrații (cu predicția pasului următor)
- **4.33 (P0).** (1) Predicție: cum construiești arborele? Fixezi o ordine a celor $n$ atribute și testezi, pe fiecare drum, toate atributele în ordinea aceea. (2) Câte frunze rezultă? Una pe fiecare combinație de valori: $2^n$, adâncime $n$. (3) Cum etichetezi frunza? Cu valoarea funcției din rândul corespunzător al tabelului de adevăr. Rezultă că orice funcție are un arbore.
- **4.1 / 4.32 (căutare exhaustivă pe cofactori).** (1) Predicție: pui fiecare atribut în rădăcină; ce rămâne de reprezentat pe fiecare ramură? Un cofactor ($f[A/0]$, $f[A/1]$), o funcție mai simplă. (2) Arborele minim cu rădăcina $A$ = 1 + minimul pentru fiecare cofactor. (3) Se ia minimul peste rădăcini. (La 4.1: A dă 3, B și C dau 4; la 4.32: C dă 4, A și B dau 5.)

### Vizual (static, fără animație)
Pentru soluțiile 4.4 și 4.40.c: două arbori alăturați pentru aceeași funcție (ID3 / minim), cu nodurile numerotate pe niveluri și numărul de teste dedesubt. Fără predicție (e un desen explicativ), dar apare doar după ce cursantul a introdus numerele.

### Note pentru constructor (L12)
- 4.17 și 4.18 sunt opționale ("[17-18]" în listă); numerele sunt din soluțiile cărții (B:526-532, extrase în content-map 6.4); 4.18: valorile IG(X3) = 0.1887 și IG(X1) = 0.3113 sub X3 recalculate aici.
- 4.4: "un nivel mai puțin", nu "mai puține noduri": ambii arbori au 3 noduri de test (recalculat, căutare exhaustivă). 4.1 și 4.3: 3 teste cu rădăcina A, 4 cu B sau C (exhaustiv).
- ML0:11-12 (ipoteza de învățare inductivă, conectorul din bias-ul inductiv: conflictul C-12): ecranul R2 nu spune conectorul; se folosește formularea cărții (B:487).
- T20C 2: cartea / testul descriu și Bayes Naiv și regresia logistică pe aceleași puncte (nu aici).

---

## Lecția 13. Proprietăți ID3 (2): date reale, inconsistență, duplicate, adâncime, completare (`ml-l13`, priority B)

**Concepte (4):** (a) date inconsistente: eroarea la antrenare nu poate fi 0; marginea $(k-1)/k$ (P7); compasul față de arborele complet; (b) atribute duplicate față de instanțe duplicate (P5); (c) margini de structură: adâncime $\le$ numărul de atribute categoriale (P11), frunze $\le\min(R,2^M)$ (P13), atribut injectiv; (d) ID3 ca învățare "eager": completarea unui arbore cu date noi.
**Necesită:** vezi Lecția 9 (eroare la antrenare, set inconsistent), vezi Lecția 11 ((P1), ID3 complet, atribut o dată pe drum), vezi Lecția 12 (greedy, (P0)).

### Pretest
Ecran: cinci rânduri $(A,B\to Y)$: $(0,0\to0)$, $(1,0\to1)$, $(1,0\to0)$, $(0,1\to1)$, $(1,1\to1)$. "Care e cea mai mică eroare la antrenare pe care o poate avea orice arbore pe acest tabel?" Așteptat: **1/5**. Feedback: "Păstrează răspunsul; motivul vine în exemplul de mai jos." (The reason is C3; it is not given twice.)

### Concret (T21T2 1)
Sursă: `tests/2021-2022-t2-seminar-ro/subiect.pdf:1` (0.1 + 0.1 p; soluția `solutii.pdf:1`). Tabel $(A,B,C\to Y)$: 000→0, 001→1, 010→1, 011→0, 100→0, 101→1, 110→0, 111→1 (fiecare combinație o dată). Enunțul interzice desenarea arborelui.
- **C1.** Predicție: eroarea la antrenare a lui ID3? **0**: toate cele 8 combinații apar o singură dată, deci setul e consistent și (P1) dă eroare 0.
- **C2.** Se adaugă rândurile $(0,0,0\to1)$ și $(0,0,1\to0)$. Predicție: noua eroare? **2/10**.
- **C3.** De ce exact 2: grupezi rândurile după intrări. $(0,0,0)$ apare de două ori, cu etichetele 0 și 1; $(0,0,1)$ de două ori, cu 1 și 0; toate celelalte combinații o dată. Fiecare grup contradictoriu primește o singură etichetă (orice arbore dă aceeași etichetă la aceleași intrări), deci greșește pe unul din cele două rânduri: $1+1=2$ erori din 10. Formula: eroarea $=\sum_{\text{intrări distincte}}(n_t-\max\text{ efectivul unei etichete})/n$.
- **C4.** Egalitatea în grup ($1$ vs $1$) nu schimbă numărul: oricare etichetă ai pune, o greșeală.

### Regula
- **R1 Inconsistența.** Datele consistente sunt cazul (P1) (vezi Lecția 11). Date inconsistente $\Rightarrow$ eroare $>0$; ID3 ajunge la minimul posibil (eticheta majoritară pe fiecare grup de intrări identice), deci formula de la C3.
- **R2 (P7)** (B:488, ex. 4.7.b): pentru o ieșire cu $k$ valori, eroarea la antrenare a lui ID3 e cel mult $\tfrac{k-1}{k}$. Pentru $k=2$: cel mult $\tfrac12$.
- **R3 (P5)** (B:488, notă B:496): ID3 **nu e sensibil** la duplicarea atributelor de intrare (două atribute cu valori egale pe toate rândurile au același IG la fiecare nod), dar **e sensibil** la duplicarea instanțelor (entropiile condiționate depind de numărul de exemple).
- **R4 (P11), (P13)** (B:488-489; 4.9): într-un arbore pentru atribute categoriale un atribut apare o dată pe drum, deci **adâncimea $\le m$** (numărul de atribute). Cu $R$ instanțe și $M$ atribute binare: **frunze $\le\min(R,2^M)$** (fiecare frunză are cel puțin o instanță). Un atribut **injectiv** pe exemple (valori distincte la toate) are $IG=H(Y)$, maxim, deci arborele are adâncime 0 sau 1 (4.56.e).
- **R5 (eager)** (B:487; 4.16): ID3 construiește modelul înainte de test; la date noi $D'$ se poate extinde arborele $T$ (în loc de refacere): instanțele din $D'$ se atașează frunzelor lui $T$ clasificându-le; în fiecare frunză cu etichete diferite se rulează ID3 cu atributele neîntrebuințate pe drum. Rezultatul $T_2$ e consistent cu $D\cup D'$ (fără zgomot) dar poate fi mai slab decât $T_1$ (ID3 refăcut de la zero).

### De ce?
Întrebare: "La 4.16, de ce arborele $T_2$, obținut prin extinderea lui $T$, poate fi mai slab decât $T_1$, refăcut de la zero pe $D\cup D'$?" Răspuns: testele de sus ale lui $T$ au fost alese după IG calculat doar pe $D$. Pe $D\cup D'$ alt atribut poate avea IG maxim la rădăcină, dar extinderea nu schimbă nicio alegere deja făcută: doar crește frunzele. $T_2$ rămâne consistent, dar poate avea mai multe noduri sau niveluri decât $T_1$, care alege din nou fiecare test pe toate datele.
(Builder: an earlier draft asked here why a duplicated attribute does not change the tree while a duplicated instance can; that is exercise 4.8 of this lesson, so it is not given away.)

### Reamintire
- **Q1.** Un coleg raportează că ID3 are, pe un set cu ieșire binară, eroarea la antrenare 0.55. Ce spui? ✓ imposibil: cu 2 clase ID3 greșește cel mult jumătate din exemple, fiindcă fiecare grup de intrări identice primește eticheta majoritară ((P7), $\tfrac{k-1}{k}=\tfrac12$). ✗[date foarte inconsistente]: "posibil, dacă datele sunt foarte inconsistente" (explicație: chiar în cel mai rău caz, eticheta majoritară a unui grup greșește cel mult jumătate din el). ✗[fără garanții la antrenare]: "posibil, ID3 nu garantează nimic la antrenare" (explicație: (P1) și (P7) sunt garanții la antrenare).
- **Q2.** Trei atribute categoriale, fiecare cu 3 valori, și 1000 de exemple de antrenament. Câte frunze poate avea cel mult arborele ID3 (fiecare frunză cu cel puțin un exemplu)? ✓ 27: un atribut apare o dată pe drum, deci sunt cel mult $3\cdot3\cdot3$ combinații de valori ($\min(1000,27)$). ✗[doar numărul de exemple]: 1000 (explicație: nu pot exista mai multe frunze decât combinații de valori ale atributelor). ✗[atribute binare presupuse]: 8 (explicație: $2^3$ e pentru atribute binare; aici fiecare are 3 valori). ✗[valori adunate]: 9 (explicație: numărul de combinații este produsul numerelor de valori, nu suma lor).
- **Q3.** ID3 este un algoritm **eager**. Ce înseamnă asta? ✓ arborele se construiește o singură dată, înainte de test; clasificarea unui exemplu nou doar parcurge un drum. ✗[reconstruiește la test]: "ID3 reface arborele pentru fiecare exemplu de test" (explicație: aceea ar fi învățarea "lazy", care amână calculul până la test). ✗[se actualizează singur]: "arborele se schimbă singur când sosesc date noi" (explicație: pentru date noi trebuie rulat din nou ID3 sau aplicată extinderea de la 4.16).
(Builder: an earlier draft asked here the bound $\tfrac{k-1}{k}$, the duplicated attribute, $\min(R,2^M)$ and the depth bound; those are exactly exercises 4.7.b, 4.8.a, 4.9 and 4.56.c of this lesson. Three items remain.)

### Exerciții
**E 4.6** (B:505-507; status: book; "Titanic", CMU 2012 HW1). Enunț: 2201 persoane; atribute Clasa (I = clasa întâi, Inf = inferioară), Sexul (M, F), Vârsta (Copil, Adult); ieșire Supraviețuitori (Nu / Da). Tabelul (Nu, Da): I-M-Copil 0, 5; I-M-Adult 118, 57; I-F-Copil 0, 1; I-F-Adult 4, 140; Inf-M-Copil 35, 24; Inf-M-Adult 1211, 281; Inf-F-Copil 17, 27; Inf-F-Adult 105, 176; total 1490 și 711. (a) Alege rădăcina prin IG (ciot de adâncime 1; arată IG pentru fiecare atribut). (b) Acuratețea medie la antrenare a ciotului. (c) Acuratețea unui arbore complet pe cele trei variabile (nu-l construi).
- Câmpuri: $H(Y)$ = 0.9077; $IG(\text{Clasa})$ = 0.0485; $IG(\text{Sexul})$ = 0.1424; $IG(\text{Vârsta})$ = 0.0064 (±0.0005); rădăcina = Sexul; (b) $\tfrac{1708}{2201}=0.776$; (c) $\tfrac{1713}{2201}=0.778$.
- Indicii: (1) marginalele: Clasa I $[122{-},203{+}]$, Inferioară $[1368{-},508{+}]$; Feminin $[126{-},344{+}]$, Masculin $[1364{-},367{+}]$; Copil $[52{-},57{+}]$, Adult $[1438{-},654{+}]$; (2) $IG=H[1490{-},711{+}]-\sum\tfrac{|S_v|}{2201}H(S_v)$; (3) ciotul Sexul: Feminin $\to$ Da (344 corecte), Masculin $\to$ Nu (1364 corecte).
- Soluție (B:506-507): rădăcina Sexul. (b) $(344+1364)/2201=0.776$. (c) arborele complet are 8 frunze, una pe rând; fiecare ia eticheta majoritară: $(5+118+1+140+35+1211+27+176)/2201=1713/2201=0.778$: cu mult mai complex, câștig de doar 0.002; datele sunt inconsistente în fiecare celulă (ambele etichete), deci acuratețe 100% e imposibilă.
- Detectoare: (b) 0.224 → "ai dat eroarea, nu acuratețea"; (c) 1 → "în fiecare celulă există ambele etichete (setul e inconsistent)"; IG(Sexul) = 0.7653 → G-IG/H.
**E 4.7** (B:507-508; status: book). Enunț: intrări $A,B,C$, ieșire $Z$, 12 rânduri $(A,B,C\to Z)$: 000→0, 001→0, 001→0, 010→0, 011→0, 011→1, 100→0, 101→1, 110→1, 110→1, 111→0, 111→1. (a) Eroarea la antrenare a arborelui învățat de ID3, ca fracție $n/12$. (b) Pentru un set oarecare cu ieșire discretă cu $k$ valori distincte, eroarea maximă la antrenare.
- Câmpuri: (a) $\tfrac2{12}$; (b) $\tfrac{k-1}{k}$.
- Soluție (B:507-508): (a) intrările $(0,1,1)$ apar de două ori cu etichetele 0 și 1, $(1,1,1)$ la fel: "jumătate din aceste exemple vor fi clasificate eronat", 2 erori. (b) demonstrația din ecranele de mai jos.
- Detectoare: (a) $\tfrac4{12}$ → "din fiecare pereche contradictorie greșești una, nu amândouă"; (b) $\tfrac{k}{k+1}$ sau $\tfrac1k$ → vezi Q1.
**E 4.8** (B:509; status: book). Enunț: $n$ vectori de antrenament, $m$ atribute. (a) Dacă atributele $i$ și $j$ au valori egale pe toți vectorii (egalitățile se rezolvă în favoarea lui $i$), ștergerea lui $j$ poate schimba arborele? (b) Dacă doi vectori $X$ și $Z$ sunt identici (inclusiv eticheta), ștergerea lui $Z$ poate schimba arborele?
- Câmpuri (alegeri): (a) nu; (b) da.
- Soluție: (a) nu, $i$ și $j$ au același IG la fiecare nod; (b) da, entropia condiționată depinde de numărul de instanțe la fiecare nod. Aceasta e (P5). Capcană: duplicat de atribut și duplicat de instanță au răspunsuri opuse.
**E 4.9** (B:509-510; status: book). Enunț: $R$ instanțe de antrenament descrise de $M$ atribute binare. Care e numărul maxim de frunze, dacă fiecare frunză are cel puțin o instanță? Alege dintre: $R$; $\log_2R$; $R^2$; $2^R$; $M$; $\min(R,2^M)$; ...
- Câmp (alegere): $\min(R,2^M)$. Detectoare: "R" → "mai ai limita $2^M$ combinații (un atribut o dată pe drum)"; "$2^M$" → "nu poți avea mai multe frunze decât instanțe".
- Soluție: cel mult $R$ frunze (fiecare are o instanță) și cel mult $2^M$ (adâncime $\le M$); valoarea se atinge, de exemplu cu o singură instanță ($R=1$, o frunză).
**E 4.16** (B:525-526; status: book). Enunț: după ce ID3 a învățat arborele $T$ din $D$, mai sosesc date $D'$. În loc de a rula din nou ID3 pe $D\cup D'$ (arborele $T_1$), propune o procedură de extindere a lui $T$ într-un arbore $T_2$.
- Câmp (alegere, patru variante): ✓ atașezi instanțele din $D'$ frunzelor lui $T$ clasificându-le și, în fiecare frunză cu etichete diferite, rulezi ID3 cu atributele neîntrebuințate pe drum; ✗ "refaci rădăcina cu atributul cu IG maxim peste $D\cup D'$" (asta e $T_1$); ✗ "adaugi o frunză nouă pentru fiecare instanță din $D'$" (nu folosește arborele); ✗ "ignori $D'$".
- Soluție: $T_2$ e consistent cu $D\cup D'$ (în absența zgomotului) dar poate fi mai slab decât $T_1$; ilustrează caracterul "eager" și (P1). Fără exemplu numeric în carte, deci fără câmp numeric.
**E 4.45** (B:599; status: ruled; "Culegerea nu dă răspunsul; răspunsul depinde de convenția spusă mai sus."). Enunț: un student susține că poate construi un set de instanțe (intrări discrete, ieșire binară) astfel încât, oricare parte proprie ai alege pentru antrenare, eroarea ID3 pe instanțele rămase să fie cel puțin 50%. Are dreptate?
- Câmp (alegere): da. Exemplu: paritatea (xor) a $n$ atribute, toate cele $2^n$ intrări. Pentru $n=2$: antrenat pe oricare 1, 2 sau 3 rânduri, eroarea pe celelalte e cel puțin $\tfrac23$ (rândul singur: $\tfrac23$; două sau trei: 1).
- Convenție spusă pe ecran: ramura nevăzută primește clasa majoritară a nodului; verificat exhaustiv pentru $n=2,3,4$ (0 din 14 / 254 / 65534 submulțimi proprii cu eroare sub 50%). Demonstrație generală nu e în material.
**E 4.56** (B:610; status: verified-twice; "Culegerea nu dă răspunsul; verificat de două ori."). Enunț: ID3 fără pruning, intrări categoriale $X_1..X_m$, ieșire categorială $Y$. Adevărat sau fals, cu o scurtă justificare (de preferat contraexemplu minim): (a) dacă $X_i$ și $Y$ sunt independente față de distribuția care a generat datele, $X_i$ nu apare în arbore. (b) Dacă $IG(Y,X_i)=0$, $X_i$ nu apare în arbore. (c) Adâncimea maximă a arborelui e cel mult $m$ (un arbore doar cu rădăcina are adâncime 0). (d) Cu $R$ exemple de antrenament, adâncimea maximă e cel mult $1+\log_2R$. (e) Dacă cu $R$ exemple unul din atribute are $R$ valori distincte, arborele are adâncime 0 sau 1.
- Câmpuri: (a) fals; (b) fals; (c) adevărat; (d) fals; (e) adevărat.
- Soluție: (a) fals: pe un eșantion finit apare dependență aparentă, iar independența marginală nu exclude dependența condiționată (xor). (b) fals: $IG=0$ la rădăcină nu oprește alegerea mai jos; $Y=A\ xor\ B$: $IG(Y,A)=0$ la rădăcină, dar A apare pe nivelul 2 (cf. 4.4). (c) adevărat: un atribut o dată pe drum (4.43), (P11). (d) fals: arborii nu sunt echilibrați; exemplu cu $R=5$, 4 atribute: $(X_1,X_2,X_3,X_4,Y)$ = (0,0,1,0,1), (0,1,0,0,0), (0,1,0,1,1), (1,1,1,0,1), (0,1,1,1,0): ID3 dă adâncime 4 $>1+\log_25=3.32$ pentru orice alegere la egalitate. (e) adevărat: atributul injectiv dă $IG=H(Y)$, maxim.
- Detectoare: (b) "adevărat" → "xor: A are IG 0 la rădăcină și tot apare"; (d) "adevărat, pentru că arborele e echilibrat" → "nu e echilibrat; vezi contraexemplul".

### Demonstrații (cu predicția pasului următor)
- **4.7.b ($(k-1)/k$)** (B:508, cazurile i-iv). (1) Cazul i: $k$ instanțe cu aceleași intrări și toate cele $k$ etichete: ID3 pune o etichetă, $k-1$ greșite, $E=\tfrac{k-1}{k}$. Predicție: ce se schimbă dacă fiecare instanță apare de $l$ ori? (2) Cazul ii: $E=\tfrac{(k-1)l}{kl}$, la fel. (3) Cazul iii: efective inegale $l_1..l_k$: eroarea maximă e la egalitate, aceeași valoare, deci factorul $l$ poate fi omis. (4) Cazul iv: $n$ exemple (etichetate distinct) dintre care $d$ sunt distincte ca tupluri de intrare, $k_t$ etichete distincte la tuplul $t$: $k_t\le k\Rightarrow n=k_1+\dots+k_d\le k\cdot d$; $E=\tfrac{(k_1-1)+\dots+(k_d-1)}{n}=\tfrac{n-d}{n}$; $\tfrac{n-d}{n}\le\tfrac{k-1}{k}\Leftrightarrow kn-kd\le kn-n\Leftrightarrow kd\ge n$, adevărat. Deci maximul e $\tfrac{k-1}{k}$.
- **4.9 (și (P13)).** (1) Câte frunze poate avea arborele, ca să aibă fiecare cel puțin o instanță? Cel mult $R$. (2) Dar adâncimea? Un atribut o dată pe drum, deci cel mult $M$, deci cel mult $2^M$ frunze. (3) Deci $\min(R,2^M)$; atins cu $R=1$.
- **4.56.c, 4.56.e.** (c) atribut o dată pe drum $\Rightarrow$ adâncime $\le m$. (e) atributul injectiv împarte în $R$ copii de câte o instanță, toate pure, $IG=H(Y)$ (maxim posibil), deci e ales (sau un egal); adâncime 1 (0 dacă toate etichetele coincid).
- **4.16.** (1) Predicție: unde pui instanțele noi? La frunzele lui $T$, clasificându-le. (2) Ce faci într-o frunză cu etichete diferite? Rulezi ID3 acolo. (3) Ce atribute ai voie? Cele neîntrebuințate pe drum. (4) De ce e $T_2$ consistent? Fiecare frunză devine pură sau epuizează atributele.

### Vizual
Tabel cu rânduri duplicate și contradictorii marcate (T21T2 1 cu cele două rânduri adăugate: perechile contradictorii colorate, restul neutre) și **contorul erorii minime** care crește cu 1 la fiecare grup contradictoriu. Avans manual: cursantul adaugă rând cu rând și prezice contorul.

### Note pentru constructor (L13)
- **4.7.b:** demonstrația urmează B:508 (cazurile i-iv), citită direct din carte; în cazul iv, $n$ numără exemplele etichetate distinct (grupurile de copii identice au fost reduse în cazurile ii-iii).
- 4.6: IG-urile recalculate (0.048501, 0.142391, 0.006411 = cartea); acuratețe 0.7760 și 0.7783.
- 4.45: ruled; convenția ramurii nevăzute e presupunerea verificatorului (verified-answers).
- T21T2 1: tabelul în ordinea din test; "NU faceți arborele" se păstrează.
- Q1-Q4 și pretestul: cifre construite (număr de valori $k=4$; $R=7$, $M=2$; 3 atribute / 100 instanțe); nu depind de calcule cu logaritmi.

---

## Lecția 14. Atribute continue: praguri și zone de decizie (`ml-l14`, priority A)

**Concepte (3):** (a) pragurile unui atribut continuu: ordonare, schimbări de etichetă, mijlocul intervalului, numărarea pragurilor; (b) IG-ul unui test cu prag, recalculat pe instanțele nodului; același atribut cu alt prag; rădăcina se alege între toate atributele și toate pragurile; (c) zone de decizie și granițe axial-paralele (P8, P9) (+ (P12), adâncimea).
**Necesită:** vezi Lecția 11 (ID3 complet; atribut o dată pe drum pentru atribute discrete).

### Pretest
Ecran: cinci puncte $(X,\text{etichetă})$: $(1,-)$, $(2,-)$, $(5,+)$, $(6,+)$, $(9,-)$. "Câte teste de forma $X\le\text{prag}$ merită încercate la rădăcină?" Așteptat: **2** ($3.5$ și $7.5$: doar unde se schimbă eticheta; mijloacele $1.5$, $5.5$ nu pot fi mai bune decât capetele șirului, motivul vine în lecție).

### Concret (ML3:21: temperaturi)
Sursă: `ml3.pdf:21` (exemplul cu Temperature 40, 48, 60, 72, 80, 90 și etichetele No, No, Yes, Yes, Yes, No; slide-ul dă testele Temperature>54 și >85).
- **C1.** Valorile sunt deja ordonate. Predicție: între ce perechi consecutive se schimbă eticheta? Între 48 (No) și 60 (Yes), și între 80 (Yes) și 90 (No). Pragurile = **mijloacele** acestor intervale: **54** și **85** ($(48+60)/2$, $(80+90)/2$). Deci 2 praguri, nu 5 (slide-ul scrie 54 și 85; că sunt mijloace nu e spus pe slide, regula e din B:510).
- **C2.** Predicție: care prag dă IG mai mare? Rădăcina $[3{+},3{-}]$, $H=1$. $T\le54$: $[0{+},2{-}]$ și $[3{+},1{-}]$, $H(Y|T\le54)=\tfrac46H(\tfrac14)=0.5409$, $IG=0.4591$. $T\le85$: $[3{+},2{-}]$ și $[0{+},1{-}]$, $\tfrac56H(\tfrac25)=0.8091$, $IG=0.1909$. Câștigă **54**.
- **C3.** Predicție: după $T\le54$, ce praguri rămân în nodul din dreapta (60 Yes, 72 Yes, 80 Yes, 90 No)? Doar **85**, calculat pe instanțele nodului: $[3{+},0{-}]$ și $[0{+},1{-}]$, $IG=0.8113$, ambele frunze pure. (Pragurile se recalculează la fiecare nod.)
- **C4.** Arborele: $T\le54\to$ No; altfel $T\le85\to$ Yes; altfel No. Zonele pe axă: $(-\infty,54]$ No, $(54,85]$ Yes, $(85,\infty)$ No.
- **C5.** Predicție: ce ar fi fost un test la mijlocul 66 (în interiorul șirului de Yes: 60, 72)? $T\le66$: $[1{+},2{-}]$ și $[2{+},1{-}]$, $H=H(\tfrac13)=0.9183$, $IG=0.0817$, mult sub $0.4591$; motivul e în demonstrația de la sfârșit.

### Regula
- **R1 Pragurile** (B:510): ordonezi crescător valorile atributului care apar în datele de antrenament; pentru perechi consecutive pentru care există instanțe etichetate diferit iei un prag la **jumătatea distanței**. Convenție folosită la numărare (hotărâtă, vezi 4.51.a): o valoare care apare cu **ambele** etichete contează ca graniță, deci între ea și vecinii ei (cu mulțimi de etichete diferite) se ia prag. Nu se testează toate valorile, nici toate mijloacele.
- **R2 Testul ca atribut discret.** "$X\le v$" împarte nodul în două ramuri, ca un atribut binar. La fiecare nod: atributele discrete rămase + toate pragurile tuturor atributelor continue, **calculate din instanțele nodului**; câștigă IG maxim (T21T2 4b: nodurile luate în calcul pentru rădăcină). Același atribut continuu poate apărea iar mai jos, cu alt prag (4.12.b; 3.11.b obs. 4). Ordinea la egalitate o fixează enunțul (T20a: "crescător pentru atributul continuu").
- **R3 Zone de decizie** (B:487, B:511-512): fiecare test compară **un** atribut cu un prag, deci granițele de decizie sunt drepte $X_i=v$, **paralele cu axele** (P8); zonele **nu sunt unice** (P9, fiindcă arborele nu e unic, (P2)); "dacă ne uităm doar la zonele de decizie în ansamblu, ordinea testelor nu contează" (nota 502, B:512).
- **R3b Zona unei frunze** (B:466-467, soluția 3.11.b; DTs:50-52; added 2026-10-29, teacher list item 10). Fiecare frunză corespunde **conjuncției testelor** de pe drumul ei de la rădăcină, deci unei zone dreptunghiulare (eventual nemărginite) cu laturile paralele cu axele, scrisă ca sistem de inegalități: de exemplu, drumul $X_1<3$, apoi $X_2\ge5$ dă zona $\{X_1<3,\ X_2\ge5\}$. Zona de decizie a unei clase este **reuniunea** zonelor frunzelor cu acea etichetă. Un punct nou primește eticheta zonei în care cade (la fel ca parcurgând arborele).
- **R4 Adâncimea** (P12, B:489; ex. 4.11; în lista proză, nu în tabel): pentru $n$ puncte în $\mathbb R^2$, cel mult $1+\lceil\log_2n\rceil$ dacă sunt liniar separabile și $2\lceil\log_2n\rceil$ dacă nu (ambele $O(\log n)$).

### De ce?
Întrebare: "De ce e suficient să încerci doar pragurile unde se schimbă eticheta?" Răspuns: într-un șir de valori cu aceeași etichetă, mutarea pragului mută dintr-o parte în alta doar puncte din aceeași clasă; IG-ul nu poate fi mai mare în interiorul șirului decât la unul dintre capetele lui, adică la o schimbare de etichetă (la C5: $0.0817$ la 66, față de $0.4591$ la 54). Demonstrația (Fayyad–Irani) este exercițiul opțional 4.47 de mai jos; aici nu se repetă.

### Reamintire
- **Q1.** Valorile $1(-),2(-),3(+),4(+),4(-),6(-)$ (valoarea 4 apare cu ambele etichete). Câte praguri se consideră? ✓ 3 ($2.5$, $3.5$, $5$). ✗[toate mijloacele]: 5 (explicație: între 1 și 2 etichetele sunt egale, deci niciun prag). ✗[valoarea cu două etichete nu contează]: 2 (explicație: pragul $3.5$ între 3(+) și 4(+,−) și pragul 5 între 4(+,−) și 6(−) sunt la granițe cu mulțimi de etichete diferite).
- **Q2.** Un nod are, după un split pe alt atribut, patru instanțe cu $X=3(-),5(-),6(+),8(+)$. Ce praguri ia în calcul? ✓ doar $5.5$ (din instanțele nodului). ✗[din tot setul]: $2.5$ și $5.5$, pragurile calculate pe tot setul inițial (explicație: valorile care nu mai ajung în nod nu mai contează). ✗[toate mijloacele]: $4$, $5.5$, $7$ (explicație: între 3 și 5, ambele −, și între 6 și 8, ambele +, eticheta nu se schimbă, deci acolo nu se pune prag).
- **Q3.** Granița de decizie a unui arbore ID3 cu două atribute continue poate fi dreapta $X_1+X_2=5$? ✓ nu: fiecare test compară un singur atribut cu un prag, deci granițele sunt paralele cu axele (P8); o dreaptă oblică se aproximează doar în trepte. ✗[orice separator]: da, ID3 învață orice separator (explicație: arborele nu folosește combinații liniare de atribute). ✗[doar verticale]: doar drepte verticale (explicație: și orizontale, $X_2=v$).
- **Q4.** Poate $X$ (continuu) să fie testat de două ori pe același drum? ✓ da, cu praguri diferite (la al doilea test, în nod rămân alte instanțe). ✗[ca la discrete]: nu, un atribut o dată pe drum (explicație: regula e pentru atribute discrete, unde al doilea test are IG 0). ✗[același prag]: da, cu același prag (explicație: același prag ar da IG 0).

### Exerciții
**E 3.11.b** (B:465-467; status: book). Enunț: zece puncte în plan; pozitive (•): (1,3), (2,3), (2,1), (3,2), (4,5); negative (◦): (1,5), (1,1), (4,3), (5,4), (5,2) (coordonate citite din figura B:465, confirmate: ID3 rulat reproduce arborele cărții). Desenează granițele de decizie și hașurează suprafețele produse de ID3 extins cu atribute continue.
- Câmpuri: $H(Y)$ = 1; $IG(x<4.5)$ = 0.2365; $IG(x<3.5)$ = 0.1245; $IG(x<1.5)$ = 0.0349; $IG(y<3.5)$ = 0.0349; rădăcina = $x<4.5$; numărul de teste din arbore = 6 (7 frunze); ordinea din carte: $x<4.5$, $x<1.5$, $y<2$, $y<4$, $x<3.5$, $y<4$.
- Câmpuri adăugate (zone; added 2026-10-29, teacher list item 10; `[construit]`, verified-twice): eticheta dată de arbore punctelor noi $(1,\ 2.5)$ → `+`, $(3,\ 5)$ → `+`, $(4.2,\ 3)$ → `−`, $(6,\ 1)$ → `−`. Soluție: fiecare punct se citește din zona lui: $(1,\ 2.5)$ e în banda $x<1.5$ cu $2<y<4$; $(3,\ 5)$ în $1.5<x<3.5$ (aici arborele nu mai testează $y$); $(4.2,\ 3)$ în $3.5<x<4.5$ cu $y<4$; $(6,\ 1)$ în $x>4.5$. Detector: $(4.2,\ 3)$ → `+` → "În banda $3.5<x<4.5$ zona pozitivă are $y>4$ (punctul $(4,5)$); la $y=3$ zona e negativă (punctul $(4,3)$)." Verificare: ID3 refăcut cu ambele variante de egalitate din bandă (Python, fracții exacte) dă aceleași etichete; inegalitățile zonelor evaluate în `formula.js`.
- Soluție (B:466-467): $x>4.5$: pur negativ ($(5,4),(5,2)$). $x\le4.5$ (8 puncte): cel mai bun $x<1.5$ (IG 0.1589). Banda $x\le1.5$: $(1,1)-$, $(1,3)+$, $(1,5)-$; pragurile $y=2$ și $y=4$ au același IG (0.2516); rezultă negativ pentru $y<2$, pozitiv pentru $2<y<4$, negativ pentru $y>4$. În $1.5<x\le4.5$: $x<3.5$ separă (IG 0.3219) zona pozitivă $\{(2,3),(2,1),(3,2)\}$ de $(4,3)-$, $(4,5)+$, care se separă cu $y<4$. Regiunile pozitive: banda $x\le1.5$ cu $2<y\le4$; $1.5<x\le3.5$ (orice $y$); $3.5<x\le4.5$ cu $y>4$.
- Obs. (B:467): (3) la egalitate arborele nu e unic determinat; (4) pragurile pe $y$ sunt $1.5,2.5,3.5,4.5$ la rădăcină, dar doar $2$ și $4$ la nodurile 2 și 3, fiindcă partițiile diferă.
- Detectoare: "5 teste" → "sunt 6: rădăcina, $x<1.5$, două teste pe $y$ în bandă, $x<3.5$ și $y<4$" (notă constructor: cititorii au numărat 5; figura din carte și rularea dau 6); "prag $x<3.5$ la rădăcină" → "$0.1245<0.2365$".
**E 4.11** (B:513-514; status: book). Enunț: $n$ vectori bidimensionali. (a) Dacă sunt liniar separabili, poate un arbore binar (nu neapărat ID3) să-i clasifice corect și care e adâncimea maximă a unui arbore optim? (b) La fel dacă nu sunt separabili.
- Câmpuri: (a) da; adâncime $1+\lceil\log_2n\rceil$, pentru $n=16$: 5; (b) da; $2\lceil\log_2n\rceil$, pentru $n=16$: 8.
- Soluție (B:513-514): (a) înjumătățiri succesive pe $x_1$ (adâncime $\lceil\log_2n\rceil$), apoi cel mult un test pe $x_2$ în fiecare frunză (separabilitate liniară). (b) $\lceil\log_2n\rceil$ pe $x_1$ și $\lceil\log_2n\rceil$ pe $x_2$ în fiecare frunză amestecată. Ambele $O(\log n)$.
- Detectoare: $\log_2 n$ fără plafon → "adâncimea e număr întreg: $\lceil\log_2n\rceil$".
**E 4.12** (B:514-518; status: book; "exoplanete"). Enunț: 800 de exoplanete cu atributele Size (Big / Small), Orbit (Near / Far), Habitable (Yes / No); (Size, Orbit, Habitable) → număr: Big-Near-Yes 20; Big-Far-Yes 170; Small-Near-Yes 139; Small-Far-Yes 45; Big-Near-No 130; Big-Far-No 30; Small-Near-No 11; Small-Far-No 255. (a) Arborele ID3 (IG, fără pruning) cu $[\text{locuibile},\text{nelocuibile}]$ la fiecare nod. (b) Pentru doar 9 planete s-a măsurat și Temperature (kelvin): (Size, Orbit, Temp, Habitable): (Big,Far,205,No), (Big,Near,205,No), (Big,Near,260,Yes), (Big,Near,380,Yes), (Small,Far,205,No), (Small,Far,260,Yes), (Small,Near,260,Yes), (Small,Near,380,No), (Small,Near,380,No). Refă cu toate trei atributele; pentru Temperature maximizează peste toate împărțirile binare potrivite. (c) Clasifică (Big, Near, 280). Valori date: $H(\tfrac13)=0.9182$, $H(\tfrac25)=0.9709$, $H(\tfrac{92}{225})=0.9759$, $H(\tfrac{43}{100})=0.9858$, $H(\tfrac{16}{35})=0.9946$, $H(\tfrac{47}{100})=0.9974$.
- Câmpuri (a): rădăcina $[374{+},426{-}]$, $H(Y)$ = 0.9970; $H(Y|\text{Size})$ = 0.9841; $H(Y|\text{Orbit})$ = 0.9902; $IG(\text{Size})$ = 0.0128, $IG(\text{Orbit})$ = 0.0068; rădăcina = Size; sub Big: Near $[20{+},130{-}]$ $\to$ No, Far $[170{+},30{-}]$ $\to$ Yes; sub Small: Near $[139{+},11{-}]$ $\to$ Yes, Far $[45{+},255{-}]$ $\to$ No. (b): numărul de praguri pentru Temperature = 2 ($232.5$, $320$); pe cele 9 planete $[4{+},5{-}]$, $H$ = 0.9911: $IG(\text{Size})$ = 0.0072, $IG(\text{Orbit})$ = 0.0183, $IG(T\le232.5)$ = 0.3789 (cartea tipărește 0.3788, trunchiat), $IG(T\le320)$ = 0.0183; rădăcina = $T\le232.5$; nivelul 2 (pe $T>232.5$, $[4{+},2{-}]$): $T\le320$ (entropia 0.4591) bate Size (0.6667) și Orbit (0.8091); nivelul 3 (pe $T>320$, $[1{+},2{-}]$): Size (Big $\to$ Yes, Small $\to$ No). (c) $(Big,Near,280)$: $T>232.5$, $T\le320$ $\to$ **Yes**.
- Indicii (a): (1) ciotul Size: Big $[190{+},160{-}]$, Small $[184{+},266{-}]$; (2) $\tfrac{35}{80}H(\tfrac{16}{35})+\tfrac{45}{80}H(\tfrac{92}{225})$; (3) $0.4375\cdot0.9946+0.5625\cdot0.9759=0.9841$.
- Soluție (B:515-518): vezi câmpurile; simetria $H(p)=H(1-p)$ ușurează calculele; pragul din enunț ($250$) e doar un exemplu, cele corecte sunt la jumătatea distanței dintre valori cu etichete diferite ($232.5$, $320$). Atributul Temperature apare de două ori pe drum, cu praguri diferite (4.43: pentru discrete n-ar avea rost; la continue da).
- Detectoare: $IG(\text{Size})$ = 0.0183 → "ai amestecat cu IG-ul lui Orbit pe 9 planete; compară pe aceleași date"; "pragul 250" → "mijlocul dintre 205 și 260 e 232.5".
**E 4.47** (opțional; B:600; status: ruled). Enunț: "Arată că pragurile de separare pentru care de o parte și de alta etichetele sunt de același tip nu duc niciodată la câștig de informație maxim" (Fayyad–Irani 1992, secțiunea 4).
- Fără câmp numeric; ecrane de demonstrație (mai jos). "Culegerea nu dă răspunsul; răspunsul depinde de convenția spusă mai sus (argument, nu cheie tipărită)." Verificare numerică pe ML3:21: $IG(66)=0.0817<IG(54)=0.4591$.
**E 4.48** (B:600; soluție DTs:48-52; status: slides). Enunț: nouă puncte $(X_1,X_2,y)$: $x_1=(1,2,+)$, $x_2=(2,3,+)$, $x_3=(3,4,-)$, $x_4=(3,2,-)$, $x_5=(3,1,-)$, $x_6=(4,4,-)$, $x_7=(5,4,-)$, $x_8=(5,2,+)$, $x_9=(5,1,+)$ (tabelul de la B:549). Aplică ID3; precizează la fiecare pas pragurile pentru ambele atribute; desenează arborele și zonele de decizie cu separatorii.
- Câmpuri: nivelul 1 ($[4{+},5{-}]$), pragurile: $X_1<\tfrac52$, $X_1<\tfrac92$, $X_2<\tfrac32$, $X_2<\tfrac52$, $X_2<\tfrac72$ cu IG: 0.3198 (slide: 0.319), 0.0728 (0.073), 0.0026 (0.003), 0.0911 (0.091), 0.3789 (0.378); toleranță ±0.002; rădăcina = $X_2<\tfrac72$ (N $\to$ $[0{+},3{-}]$ negativ; Y $\to$ $[4{+},2{-}]$). Nivelul 2 (praguri recalculate): $X_1<\tfrac52$ 0.2516, $X_1<4$ 0.2516 ("4 înlocuiește 4.5"), $X_2<\tfrac32$ 0.0441 (0.04), $X_2<\tfrac52$ 0.1092 (0.109); egalitate; arborele: $X_2<\tfrac72$? (nu: −) (da: $X_1<\tfrac52$? (da: +) (nu: $X_1<4$? (da: −) (nu: +))); 3 teste, 4 frunze. Zone pozitive: $\{X_2<3.5,X_1<2.5\}$ și $\{X_2<3.5,X_1\ge4\}$; zona negativă: $\{X_2\ge3.5\}\cup\{X_2<3.5,2.5\le X_1<4\}$.
- Câmpuri adăugate (zone; added 2026-10-29, teacher list item 10; `[construit]`, verified-twice): etichetele punctelor noi $(2,\ 2)$ → `+`, $(3,\ 3)$ → `−`, $(4.2,\ 1.5)$ → `+`, $(2,\ 5)$ → `−`; `zp` choice "zonele pozitive": ✓ $\{X_2<3.5,\ X_1<2.5\}\cup\{X_2<3.5,\ X_1\ge4\}$; ✗[pragul calculat pe tot setul] $\{X_2<3.5,\ X_1<2.5\}\cup\{X_2<3.5,\ X_1\ge4.5\}$ (explicație: la nivelul 2 pragul se recalculează din instanțele nodului; acolo mijlocul dintre 3 și 5 e 4, nu 4.5); ✗[zona fără testele de pe drum] $\{X_1<2.5\}\cup\{X_1\ge4\}$ (explicație: zona unei frunze e conjuncția **tuturor** testelor de pe drum, deci și $X_2<3.5$; partea $X_2\ge3.5$ e negativă). Detector: $(4.2,\ 1.5)$ → `−` → "Pragul de la nivelul 2 e $X_1<4$ (din instanțele nodului), nu 4.5: $4.2\ge4$ dă $+$." Verificare: ID3 refăcut cu ambele variante de egalitate de la nivelul 2 (Python, fracții exacte; zonele coincid pe o grilă de puncte) și inegalitățile evaluate în `formula.js`.
- Soluție (DTs:50-52, numere reverificate): nota 2: la egalitate oricare din cele două teste; nota 3: entropiile pondere și nepondere pot merge în sens opus: $H[2{+},2{-}]>H[3{+},2{-}]$ dar $\tfrac46H[2{+},2{-}]<\tfrac56H[3{+},2{-}]$ ($0.6667<0.8091$).
- Detectoare: "pragul $X_1<4.5$ la nivelul 2" → "pragurile se recalculează din instanțele nodului: punctul (4,4) nu mai e aici, valorile $X_1$ rămase sunt 1, 2, 3, 5, deci între 3 și 5 mijlocul e 4, nu 4.5"; comparație fără ponderi → G-nw.
**E 4.50** (B:601-602; status: verified-twice; "Culegerea nu dă răspunsul; verificat de două ori."). Enunț: problemă ternară. Dreptunghi dens populat cu trei clase: roșu ($C_1$, $1\times6$, 6000 de puncte, la stânga, $x_1\in[0,1]$, $x_2\in[0,6]$); verde ($C_2$, $7\times3$, 42000 de puncte, sus-dreapta, $x_2\in[3,6]$); galben ($C_3$, $7\times3$, 42000 de puncte, jos-dreapta, $x_2\in[0,3]$). (a) Numărul minim de noduri de test al unui arbore corect. (b) Numărul de noduri de test al arborelui învățat de ID3 cu IG (indicație: proprietatea A3 din ex. 62 pentru entropiile condiționate minime). (c) E același în cele două cazuri? De ce? (d) Condiții generale pe un astfel de set pentru un arbore compact și 100% corect.
- Câmpuri: (a) 2 ($x_1\le1\to C_1$, altfel $x_2\le3$: galben / verde); (b) $H(Y)$ = 1.2867; $H(Y|x_1\le1)$ = 0.9333; $H(Y|x_2\le3)$ = 0.3534; ID3 alege $x_2\le3$ ($IG$ = 0.9333 față de 0.3534); numărul de teste = 3; (c) nu (3 > 2): ID3 e greedy (P3); (d) (alegere) "clasele trebuie separabile prin puține regiuni dreptunghiulare aliniate cu axele".
- Soluție: $x_2\le3$: fiecare jumătate are 45000 de puncte (3000 roșii + 42000 dintr-o clasă), $H(1/15)=0.3534$; apoi roșul se separă în ambele jumătăți cu $x_1\le1$: 3 teste. Roșul (6.7% din date) nu e izolat primul fiindcă împărțirea care înjumătățește clasele dense are entropie mai mică. (d) fiecare test e pe o singură trăsătură, deci granițele sunt paralele cu axele (P8); granițele oblice ar cere multe teste. Ruled pentru (d).
**E 4.51** (B:602-603; status: ruled; "Culegerea nu dă răspunsul; răspunsul depinde de convenția spusă mai sus."). Enunț: start-up-uri (Produs, Capital atras în milioane de dolari, Științe exacte $\to$ Milionar): Site 2.9 Da $\to$ Nu; Site 1.7 Da $\to$ Nu; Site 3.4 Da $\to$ Nu; Site 2.3 Nu $\to$ Da; Bio 3.4 Da $\to$ Da; Bio 6.1 Da $\to$ Da; Bio 5.6 Nu $\to$ Nu; Bio 0.6 Nu $\to$ Nu; Nano 1.9 Nu $\to$ Nu; Nano 2.9 Nu $\to$ Da; Nano 3.1 Da $\to$ Da; Nano 0.3 Da $\to$ Nu ("Site" = SiteDeSocializare, "Bio" = MașinaAlimentatăCuCombustibilBio, "Nano" = NanoVaccin). Testele pe Capital: $\le v$ / $>v$. (a) Câte praguri distincte $v$ pentru rădăcină? (b) Arborele ID3 cu IG pe fiecare nod de test. (c) Schimbă eticheta unei instanțe astfel încât noul arbore să aibă cel puțin încă un nod de test. (d) Pot fi adăugate exemple consistente cu arborele original care duc ID3 la o altă rădăcină și mai multe noduri?
- Câmpuri: (a) 6 ($2.1$, $2.6$, $3.0$, $3.25$, $4.5$, $5.85$), cu regula: valorile care apar cu ambele etichete (2.9 și 3.4) contează ca graniță; fără regula asta ar fi 5; (b) $[5\text{ Da},7\text{ Nu}]$, $H$ = 0.9799; IG la rădăcină: Capital $\le2.1$: 0.3436; $\le5.85$: 0.1130; $\le2.6$: 0.1043; $\le3.0$: 0.0718; Produs: 0.0428; $\le3.25$: 0.0102; $\le4.5$: 0.0041; Științe: 0.0006; rădăcina = Capital $\le2.1$ (stânga $[0{+},4{-}]\to$ Nu); pe dreapta ($[5{+},3{-}]$): Produs, IG 0.2657: Nano $[2{+},0{-}]$ Da; Bio $[2{+},1{-}]$ $\to$ Științe (Da $\to$ Da, Nu $\to$ Nu); Site $[1{+},2{-}]$ $\to$ Științe (Da $\to$ Nu, Nu $\to$ Da) sau Capital $\le2.6$ (egalitate, IG 0.9183); **4 teste** pe orice alegere la egalitate; (c) de exemplu: schimbi $(Site,1.7,Da)$ de la Nu la Da: **6 teste** (alte schimbări dau 3-6); (d) da: adăugând, de exemplu, cele opt exemple $(Nano,3.5,Da,Da)$, $(Site,3.0,Da,Nu)$, $(Site,2.5,Da,Nu)$, $(Site,6.5,Da,Nu)$, $(Site,0.5,Nu,Nu)$, $(Site,3.0,Da,Nu)$, $(Nano,7.0,Da,Da)$, $(Site,5.0,Da,Nu)$ (toate clasificate corect de arborele (b) cu Științe sub Site) noul ID3 are rădăcina **Produs** (IG 0.2241) și **5** teste.
- Soluție: la (a) sortezi valorile distincte $0.3,0.6,1.7,1.9,2.3,2.9,3.1,3.4,5.6,6.1$ și te uiți la mulțimile de etichete: primele patru sunt toate Nu (niciun prag între ele); celelalte 6 goluri dau 6 praguri. La (c) condiția e "cel puțin un nod în plus". (d) nu e tipărit în sursele cursului; exemplul e găsit de script și verificat (două execuții), nu e răspunsul oficial.
- Detectoare: (a) 5 → "valoarea 2.9 are ambele etichete (Nu la Site, Da la Nano): e graniță"; (a) 11 → "nu testezi toate mijloacele"; (b) rădăcina Produs → "Produs are IG 0.0428; Capital $\le2.1$ are 0.3436".

### Demonstrații (cu predicție)
- **4.47 (opțional; de ce doar la schimbări de etichetă).** (1) Predicție: într-un șir de $m$ puncte cu aceeași etichetă, ce se întâmplă dacă muți pragul cu un punct la dreapta? Un punct din clasa $c$ trece din dreapta în stânga; celelalte clase nu se mișcă. (2) Entropia ponderată $n\cdot H(\text{efective}/n)$ e o funcție concavă de vectorul efectivelor; deci suma pe cele două părți e concavă de-a lungul șirului. (3) O funcție concavă pe un interval își atinge minimul la un capăt; minimul entropiei ponderate = IG maxim, deci la capătul șirului, adică la o schimbare de etichetă. Verificare: la 66 din C5, $IG=0.0817<0.4591$.
- **4.11 (adâncimea).** (1) Cum îți garantezi adâncimea $\lceil\log_2n\rceil$ pe $x_1$? Înjumătățești mulțimea la fiecare test. (2) De ce mai ajunge un singur test pe $x_2$ în fiecare frunză? Linia separatoare e o dreaptă: în fiecare frunză (o felie îngustă pe $x_1$) punctele de o clasă sunt de aceeași parte a ei. (3) Neseparabil: nu ai dreaptă, deci $\lceil\log_2n\rceil$ teste pe $x_2$ în fiecare frunză: $2\lceil\log_2n\rceil$.

### Vizual (viz 5, selector de prag; zone în plan)
Date: valori sortate pe o axă, cu etichete ca puncte colorate; pragurile apar **doar** unde se schimbă eticheta; sub fiecare, IG. Cursantul prezice câștigătorul înainte să apară IG. Mod 2D: pentru 4.48 punctele în plan, granița (dreaptă axială) se trage după ce cursantul alege prag. Zonele de decizie se colorează pe măsură ce arborele crește. Avans manual.

### Note pentru constructor (L14)
- **3.11.b:** cititorii au numărat 5 noduri de test; figura din carte (B:467) are 6 (noduri 0-5) și rularea mea dă 6 teste, 7 frunze. Se folosește 6.
- **4.51.a:** regula de numărare e o hotărâre (secțiunea 11, problema 3): valoarea cu ambele etichete e graniță (6 praguri); verified-answers: 6 cu regula, 5 fără.
- **4.51.d** nu are cheie în nicio sursă; exemplul dat e găsit și verificat de mine (căutare aleatoare, două rulări), etichetat "ruled".
- **4.48:** cititorii trunchiază (0.319, 0.378, 0.04); rotunjit e 0.320, 0.379, 0.044; toleranța ±0.002 acoperă ambele.
- **4.12:** cartea tipărește $IG$ trunchiat (0.3788); valoarea exactă e 0.3789.
- Pretest, Q1-Q4 și 4.11 numeric ($n=16$): cifre construite.
- T21T2 9 (`tests/2021-2022-t2-seminar-ro/subiect.pdf:3`) folosește exact aceleași zece puncte ca 3.11.b (figura din test numerotează testele 0-5: $x<4.5$, $x<1.5$, $y<2$, $y<4$, $x<3.5$, $y<4$; 7 frunze): confirmă cele 6 teste. Testul rămâne în tabloul `tests`.
- Added 2026-10-29 (teacher list item 10): R3b and the zone fields of 3.11.b and 4.48. The fields make the learner read and write zones; the earlier fields were IG values, thresholds and test counts only. The probe points avoid every boundary, so no strict / non-strict convention decides a label.

---

## Lecția 15. Eroarea la antrenare, validare, CVLOO; overfitting (`ml-l15`, priority A)

**Concepte (4):** (a) eroarea și acuratețea la antrenare / validare / test; $Acc,P,R,F,Sp$; (b) protocoale de validare: set de validare, $n$-fold, leave-one-out (CVLOO) și cum se calculează de mână pentru ID3; (c) overfitting (definiția ML3:26) și underfitting; eroarea mică la antrenare nu înseamnă calitate; (d) erori așteptate într-o frunză: aproximarea polinomială a lui $H(p)$.
**Necesită:** vezi Lecția 7 ($H(p)$), vezi Lecția 9 (eroare la antrenare, set consistent), vezi Lecția 11 (ID3 complet, (P1)), vezi Lecția 14 (praguri; pragurile se mută când scoți un punct).
**Added 2026-10-29 (teacher list items 11, 12, 13):** rule R4b (overfitting, underfitting, good fit), quiz item Q5, exercise E L15.c1 (no new concept: good fit belongs to concept (c), the protocol to (b)).

### Pretest
Ecran: două modele pentru aceeași sarcină. Modelul A: eroare 0% pe datele de antrenament, 30% pe date noi. Modelul B: eroare 12% pe antrenament, 14% pe date noi. "Care model îl alegi și de ce?" Așteptat: **B** (eroarea pe date noi e ce contează; A a "învățat pe de rost" antrenamentul).

### Concret (T21T2 5: trei rânduri)
Sursă: `tests/2021-2022-t2-seminar-ro/subiect.pdf:2` (0.3 p), soluție `solutii.pdf:2`. Setul $(A,B\to Y)$: $(0,0\to0)$, $(1,0\to1)$, $(1,1\to1)$. Regula de egalitate (soluția oficială): tabelul în ordine, A înainte de B. "Calculează eroarea ID3 la CVLOO."
- **C1.** Predicție: eroarea la antrenare a lui ID3 pe cele trei rânduri? **0** (setul e consistent, (P1)).
- **C2.** CVLOO: scoți pe rând câte un rând, antrenezi ID3 pe celelalte, prezici rândul scos; eroarea = proporția rândurilor prezise greșit.
- **C3.** Scoți rândul 1, $(0,0\to0)$: rămân $(1,0\to1)$ și $(1,1\to1)$, ambele cu eticheta 1; ID3 face o frunză "1". Predicția pentru $(0,0)$: 1, adevărul 0: **greșit**.
- **C4.** Scoți rândul 2, $(1,0\to1)$: rămân $(0,0\to0)$ și $(1,1\to1)$; $IG(A)=IG(B)=1$, egalitate; regula: A (primul în tabel): $A=0\to0$, $A=1\to1$; predicția pentru $(1,0)$: 1, **corect**. (Cu B primul, $B=0\to0$ ar da predicția 0, greșit, și CVLOO ar fi 2/3: ecranul arată asta ca avertisment despre regula de egalitate.)
- **C5.** Scoți rândul 3, $(1,1\to1)$: rămân $(0,0\to0)$, $(1,0\to1)$; A separă perfect, B are IG 0; $A=1\to1$; predicția pentru $(1,1)$: 1, **corect**.
- **C6.** $E_{CVLOO}=\tfrac13$, deși eroarea la antrenare e 0.

### Regula
- **R1 Definiții** (ML0:10, ML0:14). Eroarea la antrenare, la validare ("set de dezvoltare"), la test; acuratețea = 1 − eroarea. $Acc=\tfrac{tp+tn}{tp+tn+fp+fn}$, $P=\tfrac{tp}{tp+fp}$, $R=\tfrac{tp}{tp+fn}$, $F=\tfrac{2PR}{P+R}$, $Sp=\tfrac{tn}{tn+fp}$.
- **R2 Protocolul corect** (Cn-s4:1-4). Alegi după acuratețea de antrenare $\Rightarrow$ "ai învățat pe de rost". Alegi după acuratețea de test și o raportezi $\Rightarrow$ estimare optimistă (maximul din 15). Corect: împarți 1000 de rânduri în 900/100; pe cele 900: 810/90 (antrenare/validare) sau $k$-fold (de ex. $k=10$, media celor 10 acurateți); alegi câștigătorul; **reantrenezi pe toate cele 900**; raportezi **o singură dată** pe cele 100. **CVLOO** = $k$-fold cu $k$ = numărul de rânduri ("trebuie să știi să calculezi eroarea sau acuratețea la LOOCV").
- **R3 CVLOO la ID3 de mână** (4.10; nota 501, B:512). Scoți un punct, refaci arborele pe restul și prezici punctul scos; la atribute continue **pragurile se mută** când scoți un punct (în 4.10: $4.5$, $5.5$, $7.75$, $9.25$). Calculele "nu sunt dificile, mai ales cu raționamente calitative".
- **R4 Overfitting** (ML3:26). $h\in H$ face overfit pe datele de antrenament dacă există $h'\in H$ cu $error_{train}(h)<error_{train}(h')$ **și** $error_D(h)>error_D(h')$. Overfitting nu e "eroare mare la antrenare"; semnul lui e **diferența mare** antrenare / validare. **Underfitting:** erori mari și apropiate pe ambele. ID3 pe date consistente are mereu eroare 0 la antrenare (P1), deci nu e dovadă de calitate. (P10) (B:488): ID3 e sensibil la zgomote și poate face overfitting.
- **R4b Trei diagnostice** (Cn-s4:1; T21T2 8; added 2026-10-29, teacher list item 11). Compari eroarea la antrenare cu eroarea pe date noi (validare). **Overfitting:** eroare mică la antrenare, mult mai mare la validare. **Underfitting:** erori mari pe ambele, apropiate între ele. **Good fit:** erori mici pe ambele, apropiate între ele; acesta e modelul de ales. Semnul overfitting-ului este diferența mare dintre cele două erori, nu o eroare mare la antrenare.
- **R5 Eroare așteptată într-o frunză** (4.44, B:598-599). O frunză cu $M$ instanțe de antrenament și entropie $H$: cu aproximarea parabolică $H(p)\approx4p(1-p)$, fracția minoritară $p=\tfrac{1-\sqrt{1-H}}{2}$ și erorile $\approx M\cdot p$ (ruled: ipoteza intenționată nu e în carte).

### De ce?
Întrebare: "De ce nu ai voie să alegi modelul după acuratețea pe setul de test și apoi să o raportezi?" Răspuns: acuratețea pe test e o estimare cu zgomot; dintre 15 modele alegi pe cel cu estimarea cea mai norocoasă, deci valoarea raportată e maximul a 15 zgomote, mai bună decât realitatea. Alegerea o faci pe validare, raportul pe un test pe care nu ai ales nimic.

### Reamintire
- **Q1.** Într-un test de detecție: $tp=30$, $fp=10$, $fn=20$, $tn=40$. Cât e precizia $P$? ✓ 0.75 ($30/40$). ✗[P cu R]: 0.6 ($30/50$, aceea e recall-ul $R$). ✗[P cu Acc]: 0.7 ($70/100$, aceea e acuratețea).
- **Q2.** Rândurile $(A,B\to Y)$: $(0,0\to0)$, $(0,0\to0)$, $(0,1\to0)$, $(1,0\to1)$. Care e $E_{CVLOO}$ al lui ID3 (fără egalități în joc)? ✓ $\tfrac14$ (doar $(1,0\to1)$ se prezice greșit: fără el, toate rândurile rămase au eticheta 0). ✗[CVLOO = antrenare]: 0 (explicație: 0 e eroarea la antrenare; CVLOO scoate rândul înainte de a-l prezice). ✗[rânduri repetate numărate o dată]: $\tfrac13$ (explicație: cele două rânduri $(0,0\to0)$ sunt două exemple; fiecare se scoate pe rând, deci sunt 4 încercări, nu 3).
- **Q3.** Ipoteza $h$: eroare 5% la antrenare și 20% pe distribuția datelor. Ipoteza $h'$, din același spațiu: 10% la antrenare și 15% pe distribuție. Face $h$ overfitting după definiția ML3:26? ✓ da: există $h'$ cu $error_{train}(h)<error_{train}(h')$ **și** $error_D(h)>error_D(h')$. ✗[overfitting = eroare mare la antrenare]: "nu, $h$ are eroare mică la antrenare" (explicație: tocmai eroarea mică la antrenare, împreună cu cea mare pe distribuție, e semnul overfitting-ului). ✗[definiția cere eroare 0]: "nu, $h$ nu are eroare 0 la antrenare" (explicație: definiția compară două ipoteze; nu cere nicio eroare 0).
- **Q4.** Validare încrucișată cu $k=10$ pe 1000 de rânduri. De câte ori antrenezi modelul și pe câte rânduri de fiecare dată? ✓ de 10 ori, pe câte 900 de rânduri (validezi pe cele 100 rămase). ✗[o singură antrenare]: "o dată, pe 900" (explicație: fiecare dintre cele 10 părți e pe rând set de validare; media celor 10 erori e estimarea). ✗[CVLOO]: "de 1000 de ori, pe câte 999" (explicație: aceea e CVLOO, cazul $k$ = numărul de rânduri). ✗[antrenare pe parte]: "de 10 ori, pe câte 100" (explicație: antrenezi pe celelalte 9 părți și validezi pe partea scoasă). (Builder: choosing a model by validation error is the pretest and 4.57.c, and not selecting on the test set is the "De ce?" screen; neither is asked again here.)
- **Q5** (added 2026-10-29, teacher list item 11; `[construit]`, numbers different from T21T2 8 and mock T1 5d). Trei modele, cu eroarea la antrenare și eroarea la validare: A 4% și 5%; B 2% și 31%; C 37% și 38%. Ce diagnostic are fiecare? ✓ A good fit, B overfitting, C underfitting (diferențele: 1, 29 și 1 puncte procentuale; formula `[5-4, 31-2, 38-37]`). ✗[overfitting = eroare mare la antrenare]: "A good fit, B underfitting, C overfitting" (explicație: overfitting înseamnă eroare mică la antrenare și mult mai mare la validare, adică B; C greșește mult peste tot: underfitting). ✗[cea mai mică eroare la antrenare câștigă]: "B good fit, A și C underfitting" (explicație: B are cea mai mică eroare la antrenare, dar 31% la validare; contează eroarea pe date noi și diferența dintre cele două). ✗[erori apropiate = underfitting]: "A și C underfitting, B overfitting" (explicație: erori apropiate înseamnă underfitting doar când sunt mari; A are ambele erori mici, deci good fit).

### Exerciții
**E 4.10** (B:510-513; status: book; "overfitting"). Enunț: date $(X,Y)$: $(1,0)$, $(2,0)$, $(3,0)$, $(4,0)$, $(6,1)$, $(7,1)$, $(8,1)$, $(8.5,0)$, $(9,1)$, $(10,1)$. Pragurile: valorile ordonate crescător; pentru perechile consecutive cu instanțe etichetate diferit, prag la jumătatea distanței; la fiecare recursie alt prag rămas. ID3 taie întâi la $X=5$, apoi la $8.25$. $DT^*$ = arborele ID3 complet fără pruning; $DT_2$ = ID3 urmat de pruning la două frunze (un singur split). (a) Eroarea la antrenare a lui $DT_2$ și $DT^*$ (din 10). (b) Eroarea la CVLOO a lor.
- Câmpuri: pragurile ID3: 5 ($IG=0.6100$), 8.25 ($0.1909$ în nodul $X>5$), 8.75 ($0.9183$); (a) $E_{train}(DT_2)=\tfrac1{10}$; $E_{train}(DT^*)=0$; (b) $E_{CVLOO}(DT_2)=\tfrac1{10}$; $E_{CVLOO}(DT^*)=\tfrac3{10}$; punctele greșite la $DT^*$: $X=8$, $8.5$, $9$; concluzia = overfitting (alegere).
- Indicii: (1) $DT_2$: $X\le5\to0$, altfel 1; doar $8.5$ e greșit; (2) la CVLOO pragul rămâne 5, cu excepția lui $X=4$ (devine $4.5$) și $X=6$ (devine $5.5$), ambele tot corecte; (3) $DT^*$: scos 8 $\Rightarrow$ prag $7.75$, 8 devine negativ; scos 8.5 $\Rightarrow$ un singur split, 8.5 devine pozitiv; scos 9 $\Rightarrow$ prag $9.25$, 9 devine negativ.
- Soluție (B:511-513): $E_{train}(DT_2)=\tfrac1{10}>0=E_{train}(DT^*)$, dar $E_{CVLOO}(DT_2)=\tfrac1{10}<\tfrac3{10}=E_{CVLOO}(DT^*)$: "caz tipic de manifestare a fenomenului de overfitting (supra-specializare)". Un singur punct zgomotos ($X=8.5$) obligă arborele complet la două praguri în plus.
- Detectoare: $E_{CVLOO}(DT^*)=0$ → "CVLOO scoate punctul înainte de a-l prezice; nu e eroarea la antrenare"; la $DT_2$ cu 2/10 → "la $X=4$ și $X=6$ pragul se mută dar rămân corecte; doar $8.5$ greșește".
**E 4.21** (B:540; status: book). Enunț: Adevărat sau fals? (a) ID3 garantează obținerea arborelui optim (ca număr de niveluri sau de noduri). (b) Pentru că arborii clasifică într-o mulțime discretă de clase, nu pot face overfitting. (c) Algoritmul A e mai bun decât B dacă eroarea lui la antrenare e mai mică. (d) Cu $m$ instanțe, jumătate pentru antrenare și jumătate pentru testare (orice clasificator), diferența dintre eroarea la antrenare și cea la test scade pe măsură ce $m$ crește.
- Câmpuri: (a) fals; (b) fals; (c) fals; (d) adevărat.
- Soluție: (a) fals: căutarea e greedy (Lecția 12). (b) fals: arborii fac overfitting; afirmația discretă $\Rightarrow$ fără overfitting nu urmează. (c) fals: B poate fi mai bun la test; A atunci face overfit (definiția R4). (d) adevărat: cu date inconsistente eroarea la antrenare crește și cea la test scade, ambele converg spre eroarea adevărată.
- Detectoare: (b) "adevărat" → "overfitting apare la orice clasificator cu capacitate prea mare, nu doar la regresie".
**E 4.44** (B:598-599; status: ruled; "Culegerea nu dă răspunsul; răspunsul depinde de convenția spusă mai sus."). Enunț: ieșire binară; o frunză $l$ are $M$ instanțe de antrenament și entropia $H$. Schițează un algoritm care ia $M$ și $H$ și dă numărul de exemple clasificate greșit de frunză. Sugestie: aproximare polinomială a lui $H(p)$.
- Câmpuri: formula (alegere): $M\cdot\tfrac{1-\sqrt{1-H}}{2}$; verificări: $M=10,H=1\to5$; $M=10,H=0\to0$; $M=20,H=0.5\to\approx2.93$ (aproximare grosieră; $H(p)=0.5$ dă exact $p\approx0.11$, adică 2.2 erori; vezi nota constructorului).
- Soluție: derivarea mai jos; convenția: $H(p)\approx4p(1-p)$ (se potrivește la $H(0)=0$, $H(\tfrac12)=1$ și simetrie).
**E 4.46** (B:599-600; status: verified-twice; "Culegerea nu dă răspunsul; verificat de două ori."). Enunț: o floare e Iris? (Forma C/D; Culoare B/W/G/U; Miros 1/2/3). Date (Forma, Culoare, Miros $\to$ Iris): (C,B,1 $\to$ 1); (D,B,1 $\to$ 1); (D,W,1 $\to$ 1); (D,W,2 $\to$ 1); (C,B,2 $\to$ 1); (D,B,2 $\to$ 0); (D,G,2 $\to$ 0); (C,U,2 $\to$ 0); (C,B,3 $\to$ 0); (C,W,3 $\to$ 0); (D,W,3 $\to$ 0). (a) Atributul din rădăcină. (b) Arborele complet (fără pruning). (c) Arborele ca reguli. (d) Set de validare: (C,B,2 $\to$ 0), (D,B,2 $\to$ 0), (C,W,2 $\to$ 1). Număr de exemple clasificate greșit la antrenare și la validare.
- Câmpuri: $[5{+},6{-}]$, $H$ = 0.9940; $H(\text{Miros})$: $H(Y|\text{Miros})$ = 0.4413; $IG(\text{Miros})$ = 0.5527; $IG(\text{Culoare})$ = 0.1891; $IG(\text{Forma})$ = 0.0072; rădăcina = Miros; Miros=1 $\to$ Iris ($[3{+},0{-}]$); Miros=3 $\to$ nu ($[0{+},3{-}]$); Miros=2 ($[2{+},3{-}]$): Culoare (0.571) bate Forma (0.02); W $\to$ Iris; G, U $\to$ nu; B ($[1{+},1{-}]$) $\to$ Forma (C $\to$ Iris, D $\to$ nu); reguli: $Iris\Leftrightarrow Miros=1\vee(Miros=2\wedge Culoare=W)\vee(Miros=2\wedge Culoare=B\wedge Forma=C)$; (d) erori la antrenare = 0 din 11; la validare = 1 din 3 ($(C,B,2)$ prezis Iris, adevărul 0).
- Detectoare: $H(Y|\text{Miros})$ = 0.5527 → G-IG/H; "erori la validare 0" → "$(C,B,2)$ urmează Miros=2, Culoare=B, Forma=C $\to$ Iris, dar eticheta e 0".
**E 4.49** (B:601; status: verified-twice; "Culegerea nu dă răspunsul; verificat de două ori."). Enunț: figura cu 16 puncte, intrări $X_1,X_2$ reale, ieșire $+/-$. Rândul de sus ($X_2=2$): $+,-,+,-,+,+,+,+$ pe $X_1=1..8$; rândul de jos ($X_2=1$): $-,+,-,+,+,+,+,+$ (coordonatele exacte nu sunt în figură; răspunsurile nu depind de ele). OVERFIT = ID3 standard fără pruning; UNDERFIT = un singur nod (rădăcina e frunză). (a) Câte frunze are OVERFIT? (b) Eroarea CVLOO a lui OVERFIT; marchează punctele greșite. (c) Același lucru pentru UNDERFIT.
- Câmpuri: 12 pozitive, 4 negative; primul split $X_1\le4.5$ ($IG=0.3113$); (a) 9 frunze; (b) $\tfrac8{16}$, punctele greșite: cele 8 din primele 4 coloane (șahul); (c) UNDERFIT: frunză "+", eroare la antrenare $\tfrac4{16}$, $E_{CVLOO}=\tfrac4{16}$ (cele 4 puncte negative).
- Soluție: după $X_1\le4.5$ regiunea din dreapta e pur pozitivă (8 puncte, o frunză); regiunea din stânga e un șah (nu are split cu IG strict pozitiv; ID3 standard continuă totuși până la frunze pure), cu 8 frunze, deci 9 în total; eroare la antrenare 0. Scos un punct din șah, arborele refăcut nu-l mai poate prezice: toate cele 8 greșesc. Ordinea se inversează: antrenare OVERFIT 0 < UNDERFIT $\tfrac4{16}$, dar CVLOO OVERFIT $\tfrac8{16}$ > UNDERFIT $\tfrac4{16}$ ((P10)).
- Detectoare: "$E_{CVLOO}$(OVERFIT) = 0" → "eroarea la antrenare e 0, CVLOO nu"; "UNDERFIT: 0" → "frunza spune mereu +; cele 4 puncte negative sunt greșite".
**E 4.57** (B:610-611; status: ruled; "Culegerea nu dă răspunsul; răspunsul depinde de convenția spusă mai sus."). Enunț: imagini de celule cu și fără cancer. Adevărat sau fals? (a) Pentru a antrena un clasificator care prezice probabilitatea cancerului, preferi arbori de decizie față de regresia logistică. (b) Datele au 900 de imagini fără cancer și 100 cu cancer; un clasificator cu acuratețea 85% e bun. (c) Un clasificator cu 100% acuratețe la antrenare și 70% la validare e mai bun decât unul cu 70% la antrenare și 75% la validare.
- Câmpuri: (a) fals (argumentat: regresia logistică dă direct o probabilitate; arborele dă o clasă; cartea nu dă cheie, regresia logistică nu e predată în lecții); (b) fals ($900/1000=90\%$ cu "mereu fără cancer"); (c) fals (al doilea e mai bun pe validare; primul face overfit).
- Detectoare: (b) "adevărat, 85% e mare" → "clasificatorul trivial 'mereu fără cancer' are 90%".

**E L15.c1** (`[construit]`; status: verified-twice; "Culegerea nu dă răspunsul; verificat de două ori."; added 2026-10-29, teacher list items 12, 13). Enunț: ai 600 de rânduri etichetate și trei algoritmi candidați, A, B și C. Pui deoparte 100 de rânduri pentru test. Pe celelalte 500 faci validare încrucișată cu $k=5$ (5 pliuri de câte 100 de rânduri). Pentru A, acuratețile pe cele 5 pliuri sunt $0.80$, $0.90$, $0.70$, $0.85$, $0.75$; pentru B și C, estimările 5-fold sunt $0.78$ și $0.83$.
- Câmpuri: `acc` num "estimarea 5-fold pentru A" `0.80` (`(0.80+0.90+0.70+0.85+0.75)/5`); `alg` choice (A / B / C) "algoritmul ales" `C` (`max((0.80+0.90+0.70+0.85+0.75)/5, 0.78, 0.83)` = 0.83, al lui C); `alege` choice "după ce acuratețe alegi algoritmul?" ✓ "acuratețea de validare (estimarea 5-fold)"; ✗[criteriu pe antrenare] "acuratețea la antrenare" (explicație: ar câștiga modelul care a învățat datele pe de rost); ✗[alegi pe test] "acuratețea pe cele 100 de rânduri de test" (explicație: setul de test e păstrat pentru raportul final; dacă alegi pe el, numărul raportat nu mai e o estimare cinstită); `retrain` num "pe câte rânduri reantrenezi algoritmul ales înainte de test?" `500` (`600-100`); `raport` choice "ce raportezi ca acuratețe finală?" ✓ "acuratețea modelului reantrenat, măsurată o singură dată pe cele 100 de rânduri de test"; ✗[raportezi validarea] "estimarea 5-fold a lui C, $0.83$" (explicație: e cea mai mare dintre trei estimări, deci optimistă; raportul vine de pe date pe care nu ai ales nimic); ✗[alegi pe test] "cea mai mare dintre acuratețile pe test ale celor trei algoritmi" (explicație: maximul a trei estimări cu zgomot, ca în R2); `loo` num "câte antrenări ar cere CVLOO pe cele 500 de rânduri (la 5-fold sunt 5)?" `500` (`600-100`).
- Indicii: (1) estimarea $k$-fold e media celor $k$ acurateți; (2) alegi pe validare, reantrenezi pe tot ce nu e test, raportezi o singură dată pe test (R2); (3) CVLOO este $k$-fold cu $k$ egal cu numărul de rânduri.
- Soluție: $0.80$ (media, nu cel mai bun pliu); C câștigă la validare ($0.83$); reantrenezi C pe toate cele 500 de rânduri; raportezi acuratețea lui pe cele 100 de rânduri de test, o singură dată. CVLOO ar cere 500 de antrenări pe câte 499 de rânduri, față de 5 antrenări pe câte 400 la 5-fold: aceeași idee, de 100 de ori mai multe antrenări. Culegerea nu dă răspunsul; verificat de două ori.
- Detectoare: `acc` = 0.90 → "Ai luat cel mai bun pliu; estimarea e media celor 5." `acc` = 0.75 → "Ai luat ultimul pliu; estimarea e media celor 5." `retrain` = 400 → "După alegere reantrenezi pe toate cele 500 de rânduri (antrenare și validare), nu pe 4 pliuri." `loo` = 5 → "CVLOO scoate câte un singur rând: 500 de antrenări."
- Sursă: "Seminar 4, p. 1-4." (protocolul din R2, cu alte numere.)

### Demonstrație (4.44, aproximarea; cu predicție)
(1) Predicție: care e eroarea frunzei, în funcție de proporția clasei minoritare $p\le\tfrac12$? $M\cdot p$ (frunza etichetează cu clasa majoritară). (2) Cum legi $p$ de $H$? $H=H(p)$; se aproximează $H(p)\approx4p(1-p)$ (se potrivește la 0, la $\tfrac12$ și e simetrică). (3) Rezolvi: $4p^2-4p+H=0$, $p=\tfrac{1-\sqrt{1-H}}{2}$ (rădăcina $\le\tfrac12$). (4) Verificare: $H=1\to p=\tfrac12$, $H=0\to p=0$. Rezultat: $M\cdot\tfrac{1-\sqrt{1-H}}{2}$.

### Vizual (viz 6, CVLOO)
Datele: T21T2 5 (cele trei rânduri); la fiecare pas rândul scos se evidențiază, arborele refăcut apare, cursantul prezice predicția, apoi apare contorul de erori. Mod liber pe 4.10 (punctele pe axă; pragurile care se mută la scoaterea unui punct). Avans manual.

### Note pentru constructor (L15)
- 4.44: cartea nu dă soluție; aproximarea $4p(1-p)$ e interpretarea mea a sugestiei; la $H=0.5$ aproximarea dă 2.93 erori față de 2.2 exact ($H(0.11)\approx0.5$): se spune pe ecran "aproximare grosieră".
- 4.49: coordonatele sunt citite din figură (fără scară); 9 frunze și 8/16, 4/16 verificate de cititori și de scriptul meu (verified-answers).
- T21T2 5: egalitatea de la scoaterea rândului 2 e decisă de regula "A primul"; valoarea 1/3 numai cu ea (verified-answers).
- 4.57.a: ruled (nicio cheie); regresia logistică nu e predată (design §3).
- Pretest, Q1 (confuzie 30/10/20/40) și Q2-Q4: cifre construite.
- Added 2026-10-29 (teacher list items 11-13): R4b, Q5 and E L15.c1, all with constructed numbers. The pretest (A 0/30, B 12/14), Q3 (5/20 and 10/15), T21T2 8 (5/6, 5/40, 54/55) and mock T1 5d (8/9, 1/34, 41/43) keep their own numbers; Q5 uses 4/5, 2/31, 37/38. E L15.c1 applies R2's protocol to 600 rows with 5-fold; Q4 (counts for $k=10$) is not asked again there.

---

## Lecția 16. Pruning: IG sub prag, top-down față de bottom-up, testul $\chi^2$ (`ml-l16`, priority B)

**Concepte (3):** (a) evitarea overfitting-ului: oprire timpurie față de post-pruning; reduced-error pruning; rule post-pruning; (b) pruning cu prag $\varepsilon$ pe IG: top-down față de bottom-up; (c) testul $\chi^2$ al lui Pearson pentru independență, aplicat la pruning.
**Necesită:** vezi Lecția 5 (tabel comun, independență, distribuții marginale), vezi Lecția 8 (IG), vezi Lecția 11 (ID3, arbori ca reguli), vezi Lecția 15 (overfitting, set de validare).

### Pretest
Ecran: un arbore cu 15 noduri: eroare 0% la antrenare și 30% la validare; același arbore tăiat la 5 noduri: 8% la antrenare și 12% la validare. "Când tai ramuri dintr-un arbore, eroarea la antrenare scade sau crește? Dar cea de validare, aici?" Așteptat: la antrenare **crește** (0% $\to$ 8%), la validare aici scade.

### Concret (T21T2 10: arborele cu IG pe noduri)
Sursă: `tests/2021-2022-t2-seminar-ro/subiect.pdf:3-4` (3 × 0.1 p), soluție `solutii.pdf:5`. Arborele (figura de la p.3): rădăcina **B** ($IG=0.3$); B=0 $\to$ **A** ($IG=0.01$) cu frunzele 0 (A=0) și 1 (A=1); B=1 $\to$ **A** ($IG=0.02$): A=0 $\to$ **C** ($IG=0.9$; C=0 $\to$ 0, C=1 $\to$ 1), A=1 $\to$ 1. Prag $\varepsilon=0.03$. Frunzele rezultate la tăiere rămân goale (enunțul nu dă date).
- **C1.** Predicție, **top-down** (parcurgi de sus în jos; orice nod de test cu $IG<\varepsilon$ se înlocuiește pe loc, cu tot subarborele, printr-un nod de decizie): ce rămâne? B ($0.3\ge0.03$) rămâne; ambele A ($0.01$ și $0.02$) au $IG<\varepsilon$, deci sunt înlocuite, ultimul cu tot cu C. Rezultat: **B cu două frunze goale**.
- **C2.** Predicție, **bottom-up** (pornești de la părinții frunzelor, elimini recursiv nodurile cu $IG<\varepsilon$, dar **nu elimini** un nod care are descendenți cu $IG\ge\varepsilon$): ce rămâne? A din stânga ($0.01<\varepsilon$, fără descendenți cu IG mare) se elimină. C ($0.9\ge\varepsilon$) rămâne. A din dreapta ($0.02<\varepsilon$) are descendentul C cu $IG=0.9\ge\varepsilon$, deci **rămâne**. Rezultat: B cu o frunză goală la stânga și, la dreapta, A (A=0 $\to$ C, A=1 $\to$ 1).
- **C3.** Diferența: top-down pierde nodul C, bottom-up îl păstrează. Un nod cu IG mic poate avea sub el unul cu IG mare (ca la xor, vezi Lecția 12: IG 0 la rădăcină, IG 1 dedesubt).
- **C4.** Alt mod de a decide independența atributului de clasă, în loc de "$IG<\varepsilon$": **testul de independență $\chi^2$** (soluția oficială, `solutii.pdf:5`); se face în exerciții.

### Regula
- **R1 Evitarea overfitting-ului** (ML3:28): crești arborele complet apoi tai (**post-pruning**), sau te oprești când împărțirea nu mai e semnificativ statistic; alegerea "celui mai bun" arbore: pe un set de validare, sau printr-un criteriu MDL (ML3:28). (Builder: MDL is explained once, in the L19 one-screen note.)
- **R2 Reduced-error pruning** (ML3:29): împarți datele în antrenare și validare; cât timp tăierea nu strică: evaluezi pe validare efectul tăierii fiecărui nod (cu tot ce e sub el) și îl elimini greedy pe cel care îmbunătățește cel mai mult acuratețea pe validare (efect: ML3:30).
- **R3 Rule post-pruning** (ML3:31; B:488): arbore $\to$ reguli (una pe frunză); tai **fiecare regulă independent** (scoți precondiții); ordonezi regulile (după acuratețea estimată); folosit în C4.5.
- **R4 Prag pe IG** (4.19, B:533): **top-down** taie orice nod cu $IG<\varepsilon$ (cu tot subarborele); **bottom-up** pornește de la părinții frunzelor și taie un nod cu $IG<\varepsilon$ numai dacă niciun descendent nu are $IG\ge\varepsilon$; deci poate produce arbori diferiți. Aproape de frunze mulțimile sunt mici: "$IG\ge\varepsilon$ nu e neapărat semnificativ statistic", de unde $\chi^2$.
- **R5 Testul $\chi^2$ al lui Pearson** (4.20, B:535-539; 4.55, B:608-609). Ipoteza nulă $H_0$: atributul testat și clasa sunt independente la nodul dat. Tabelul de contingență $O$ ($r$ rânduri = valorile atributului, $c$ coloane = clase), calculat **doar** pe instanțele nodului. Valorile așteptate sub $H_0$ (probabilitățile estimate prin frecvențe relative): $E_{ij}=N\,P(A=i)P(C=j)=\frac{(\text{total rând }i)(\text{total coloană }j)}{N}$. Statistica $\chi^2=\sum_{i,j}\frac{(O_{ij}-E_{ij})^2}{E_{ij}}$ cu $(r-1)(c-1)$ grade de libertate. Pentru $\alpha=0.05$: valori critice $3.841$ (1 grad) și $5.991$ (2 grade). Dacă $p<0.05$ (sau $\chi^2$ peste valoarea critică): $H_0$ respinsă, nodul **rămâne**; dacă $p\ge0.05$: $H_0$ nerespinsă, subarborele se **înlocuiește cu o frunză**.

### De ce?
Întrebare: "De ce nu putem avea încredere într-un $IG\ge\varepsilon$ calculat într-un nod cu 3 instanțe?" Răspuns: pe un eșantion foarte mic orice împărțire pare informativă din întâmplare: cu 3 instanțe, chiar dacă atributul nu are nicio legătură cu clasa, ramurile ies adesea pure. IG-ul depinde doar de proporții, nu și de câte instanțe stau în spatele lor, deci un prag pe IG nu poate deosebi un nod mare de unul mic cu aceleași proporții. Testul $\chi^2$ ține cont de numărul de instanțe (exercițiul 4.20 arată asta pe numere; rezultatul nu se dă aici).

### Reamintire
- **Q1.** Reduced-error pruning: pe setul de validare acuratețea arborelui este 80%. Tăierea nodului N ar ridica-o la 83%, tăierea nodului M (mai adânc) la 82%, a nodului K ar coborî-o la 78%. Ce face algoritmul la pasul acesta? ✓ taie N (cea mai mare îmbunătățire pe validare), apoi reevaluează nodurile rămase. ✗[de jos în sus]: "taie întâi M, fiindcă e mai adânc" (explicație: reduced-error nu merge de la frunze în sus; alege greedy tăierea care ajută cel mai mult). ✗[toate deodată]: "taie N și M deodată, ambele ajută" (explicație: după o tăiere arborele se schimbă; efectul celorlalte se recalculează). ✗[criteriu pe antrenare]: "nu taie nimic, fiindcă orice tăiere strică acuratețea la antrenare" (explicație: criteriul e acuratețea pe validare; la antrenare tăierea nu poate ajuta).
- **Q2.** Nod cu tabelul de contingență (rânduri: valorile atributului; coloane: clasele) $\begin{pmatrix}8&2\\2&8\end{pmatrix}$. $\chi^2$? Ce faci la $\alpha=0.05$? ✓ $\chi^2=7.2>3.841$ ($p\approx0.0073$): $H_0$ respinsă, nodul rămâne. ✗[p mic = taie]: tai nodul (explicație: $p$ mic înseamnă dependență semnificativă, adică atributul contează). ✗[uiți valorile așteptate]: $\chi^2=\sum(O-E)^2/E$ cu $E=5$ peste tot, nu cu $O$ la numitor (explicație: $E_{ij}=\tfrac{10\cdot10}{20}=5$; $\chi^2=4\cdot\tfrac{9}{5}=7.2$).
- **Q3.** La un nod, atributul testat are 3 valori, iar clasa 2 valori. Câte grade de libertate are testul $\chi^2$ și care e valoarea critică la $\alpha=0.05$? ✓ $(3-1)(2-1)=2$ grade, valoarea critică $5.991$. ✗[celule minus 1]: 5 grade (explicație: se scade câte 1 pe fiecare dimensiune, $(r-1)(c-1)$, nu 1 din numărul de celule). ✗[1 grad mereu]: 1 grad, $3.841$ (explicație: 1 grad e doar pentru tabelul $2\times2$). ✗[numărul de valori]: 3 grade (explicație: formula are și factorul $(c-1)$; aici $2\cdot1$).
(Builder: the effect of pruning on training error is the pretest, and top-down versus bottom-up is the worked example and 4.19; neither is asked again. Three items.)

### Exerciții
**E 4.19** (B:533-535; soluție în carte și în DTs; status: book). Enunț: datele $(V,W,X\to Y)$: $(0,0,0\to0)$, $(0,1,0\to1)$, $(1,0,0\to1)$, $(1,1,0\to0)$, $(1,1,1\to1)$. Arborele ID3 (dat): rădăcina X; X=1 $\to$ 1; X=0 $\to$ V; V=0 $\to$ W (W=0 $\to$ 0, W=1 $\to$ 1); V=1 $\to$ W (W=0 $\to$ 1, W=1 $\to$ 0). $\varepsilon=0.0001$. (a) Pruning top-down; arborele și eroarea la antrenare. (b) Pruning bottom-up; arborele și eroarea. (c) Când preferi bottom-up față de top-down; compară acuratețea la antrenare și costul de calcul. (d) Înălțimea (nivelurile de noduri de test) arborelui ID3 + bottom-up; există un arbore consistent mai mic? Ce spune despre ID3?
- Câmpuri: contingență pe noduri: X $[3{+},2{-}]$, V (la X=0) $[2{+},2{-}]$, fiecare W $[1{+},1{-}]$; (a) $IG(X)$ = 0.1710 (> ε, rămâne); $IG(V)$ = 0 (< ε, eliminat); arborele: X=0 $\to$ 0, X=1 $\to$ 1; eroarea la antrenare = $\tfrac25$; (b) $IG(W)$ = 1 pentru ambele noduri W: nimic nu se elimină; V rămâne (are descendenți cu IG 1); eroarea = 0; (c) (alegere) top-down e mai rapid (nodul tăiat aruncă tot subarborele) dar poate arunca descendenți cu $IG\ge\varepsilon$; bottom-up e mai conservator; arborele mai simplu (a) are eroare mai mare, cel mai complex (b) riscă overfitting; (d) înălțimea = 3 (X, V, W); nu există arbore consistent mai mic; ID3 e optimal aici.
- Soluție (B:534-535): $IG(X)=H[3{+},2{-}]-\tfrac15\cdot0-\tfrac45\cdot1=0.9710-0.8=0.1710$. La V eticheta majoritară e o egalitate ($[2{+},2{-}]$): cartea ia 0 pentru frunza din stânga (cu 1 eroarea rămâne $\tfrac25$). Datele reprezintă $Y=(V\ xor\ W)\vee(V\wedge W\wedge X)$ (cartea tipărește $V\wedge V\wedge X$, evident greșeală de tipar). Aceeași problemă: un nod cu $IG=0$ poate fi necesar (xor); la (c) apare nevoia testului $\chi^2$ (4.20, 4.55).
- Detectoare: (a) eroare 0 → "după tăierea lui V frunzele nu mai disting (0,1,0) și (1,0,0): 2 din 5 greșite"; (b) "V se elimină" → "V are $IG=0$, dar descendenții W au $IG=1\ge\varepsilon$; bottom-up nu elimină".
**E 4.20** (B:535-540; soluție în carte; status: book). Enunț: date $(X_1,X_2,X_3,X_4\to Class)$, 12 rânduri: 1100→0; 1010→1; 0100→0; 1011→1; 0111→1; 0010→0; 1000→1; 0101→1; 1001→1; 1101→1; 1111→1; 0000→0 (în ordinea $X_1X_2X_3X_4$). Arborele ID3 dat: rădăcina $X_4$ ($[4{-},8{+}]$); $X_4=1\to1$ ($[0{-},6{+}]$); $X_4=0$ ($[4{-},2{+}]$) $\to$ $X_1$; $X_1=0$ ($[3{-},0{+}]$) $\to0$; $X_1=1$ ($[1{-},2{+}]$) $\to$ $X_2$; $X_2=0$ ($[0{-},2{+}]$) $\to1$; $X_2=1$ ($[1{-},0{+}]$) $\to0$. Procedura: pentru fiecare nod de test, $H_0$ = atributul e independent de $Class$; $\chi^2$ cu $(r-1)(c-1)$ grade; dacă $H_0$ nu poate fi respinsă ($p\ge0.05$), subarborele devine frunză. (a) Tabelele de contingență $O$ pentru cele trei noduri și probabilitățile estimate din date (frecvențe relative). (b) Derivă $E_{ij}$ și calculează-le. (c) $\chi^2$, p-valoarea; câte noduri se taie?
- Câmpuri: (a) $O_{X_4}=\begin{pmatrix}4&2\\0&6\end{pmatrix}$ ($N=12$; rânduri $X_4=0,1$; coloane $Class=0,1$), $P(X_4=0)=\tfrac12$, $P(Class=0)=\tfrac13$, $P(Class=1)=\tfrac23$; $O_{X_1|X_4=0}=\begin{pmatrix}3&0\\1&2\end{pmatrix}$ ($N=6$); $O_{X_2|X_4=0,X_1=1}=\begin{pmatrix}0&2\\1&0\end{pmatrix}$ ($N=3$). (b) $E_{X_4}=\begin{pmatrix}2&4\\2&4\end{pmatrix}$, $E_{X_1|X_4=0}=\begin{pmatrix}2&1\\2&1\end{pmatrix}$, $E_{X_2|\dots}=\begin{pmatrix}2/3&4/3\\1/3&2/3\end{pmatrix}$. (c) $\chi^2$ = 6, 3, 3; grade de libertate 1 pentru toate; $p$ = 0.0143, 0.0833, 0.0833; se taie 2 noduri ($X_1$ și $X_2$); arborele final: $X_4=0\to0$, $X_4=1\to1$.
- Soluție (B:538-539): la $\alpha=0.05$ rădăcina $X_4$ rămâne ("$X_4$ și $Class$ nu sunt independente"); $X_1$ și $X_2$ au $p\ge0.05$. Observație (B:539-540): nodul $X_4$ și nodul $X_1$ au **același** $IG=0.4591$, dar numai $X_1$ se elimină ($\chi^2$ 3 față de 6), fiindcă nodul $X_1$ are jumătate din instanțe; un prag pe IG nu poate trata cele două noduri diferit. Capcane: tabelul la un nod adânc folosește doar instanțele care ajung acolo; $p\ge0.05$ înseamnă **eliminare**.
- Detectoare: $\chi^2$ cu $O$ la numitor → "$\chi^2=\sum(O-E)^2/E$"; "se taie rădăcina" → "$p=0.0143<0.05$: rădăcina rămâne"; "toate nodurile rămân" → "$p=0.0833\ge0.05$ la $X_1$ și $X_2$: se taie".
**E 4.53** (opțional; B:606; status: ruled). Enunț: (a) O strategie top-down oprește ID3 pe o ramură când toate atributele rămase au $IG=0$. Arată, cu un set mic (două intrări booleene), că poate da arbori inconsistenți pe date consistente. (b) Ia datele de la (a), clonează fiecare exemplu de $K$ ori ($K$ mare) și adaugă $N$ atribute booleene cu valori uniform aleatoare; cum arată arborele și de ce poate eșua pruning-ul bottom-up?
- Câmpuri (alegeri): (a) xor ($00\to0$, $01\to1$, $10\to1$, $11\to0$): $IG(A)=IG(B)=0$ la rădăcină, regula oprește arborele la o frunză cu 2 din 4 greșite, deși datele sunt consistente; (b) atributele aleatoare au IG mic pozitiv din întâmplare și sunt alese primele; atributele xor ajung sub ele; bottom-up taie un nod numai dacă niciun descendent nu are $IG\ge\varepsilon$, iar nodurile xor de dedesubt au IG mare, deci nodurile de zgomot de deasupra se păstrează. "Culegerea nu dă răspunsul; răspunsul depinde de convenția spusă mai sus (argument, nu cheie tipărită)." Test: T21T2 10.
**E 4.54** (B:606-608; status: a verified-twice, b verified-twice, c și d ruled). Enunț: PlayTennis, 14 zile (Day, Outlook, Temperature, Humidity, Wind $\to$ EnjoyTennis): D1 Sunny Hot High Weak No; D2 Sunny Hot High Strong No; D3 Overcast Hot High Weak Yes; D4 Rain Mild High Weak Yes; D5 Rain Cool Normal Weak Yes; D6 Rain Cool Normal Strong No; D7 Overcast Cool Normal Strong Yes; D8 Sunny Mild High Weak No; D9 Sunny Cool Normal Weak Yes; D10 Rain Mild Normal Weak Yes; D11 Sunny Mild Normal Strong Yes; D12 Overcast Mild High Strong Yes; D13 Overcast Hot Normal Weak Yes; D14 Rain Mild High Strong No ($=$ tabelul din ML3:5). Arborele ID3: Outlook; Sunny $\to$ Humidity (High: No, Normal: Yes); Overcast $\to$ Yes; Rain $\to$ Wind (Strong: No, Weak: Yes). (a) Arată că Wind pe nivelul 2 (la Rain) e corect, prin IG față de alternative. (b) Scrie mulțimea de reguli a arborelui (una pe frunză). (c) Poate orice arbore fi convertit în reguli? Și invers, orice mulțime de reguli într-un arbore? (d) Compară reduced-error pruning cu rule post-pruning: sunt clasificatoarele tăiate echivalente pentru orice instanță?
- Câmpuri: (a) $H(\text{PlayTennis})$ = 0.9403; la rădăcină: $IG(\text{Outlook})$ = 0.2467, $IG(\text{Humidity})$ = 0.1518, $IG(\text{Wind})$ = 0.0481, $IG(\text{Temperature})$ = 0.0292; la nodul Rain ($[3{+},2{-}]$): $IG(\text{Wind})$ = 0.9710, $IG(\text{Temperature})$ = 0.0200, $IG(\text{Humidity})$ = 0.0200; (pentru contrast, la nodul Sunny: Humidity 0.9710, Temperature 0.5710, Wind 0.0200); (b) 5 reguli: IF Sunny $\wedge$ High THEN No; IF Sunny $\wedge$ Normal THEN Yes; IF Overcast THEN Yes; IF Rain $\wedge$ Strong THEN No; IF Rain $\wedge$ Weak THEN Yes (clasifică identic); (c) arbore $\to$ reguli: da (reguli exclusive și exhaustive); reguli $\to$ arbore: da, într-un domeniu discret finit, cu clasă implicită (P0 din Lecția 12), dar arborele poate fi mult mai mare (regulile $A\wedge B\to+$ și $C\wedge D\to+$ dau arborele cu 6 teste din 4.39); (d) nu, în general.
- Soluție (d): reduced-error taie un nod, adică înlocuiește tot subarborele cu o frunză (se pierd doar sufixele drumurilor); rule post-pruning tratează fiecare regulă separat și poate scoate orice precondiție, inclusiv testul din rădăcină, deci regulile tăiate pot suprapune sau nu mai formează un arbore. "Culegerea nu dă răspunsul; (a) și (b) verificat de două ori, (c) și (d) argumentate din cartea însăși (nu e cheie)."
- Detectoare: (a) $IG(\text{Humidity})$ 0.9710 la Rain → "la Rain Humidity dă $[1{+},1{-}]$ și $[2{+},1{-}]$: 0.0200".
**E 4.55** (opțional; B:608-610; status: verified-twice, [computed]). Enunț: 21 de instanțe $(X_1,X_2;Y)$ cu numărul de apariții: $Y=+$: TT 3, TF 4, FT 4, FF 1; $Y=-$: TT 0, TF 1, FT 3, FF 5. (a) La $\alpha=0.05$, care din cele trei împărțiri ale arborelui ID3 sunt semnificative statistic? (b) Ce arbore dă pruning-ul bottom-up cu $\chi^2$? Valori critice: 3.841 (1 grad), 5.991 (2 grade).
- Câmpuri: $H(Y|X_1)$ = 0.8021 < $H(Y|X_2)$ = 0.9403, deci rădăcina $X_1$ ($[7{+},1{-}]$ pentru $X_1=T$, $[5{+},8{-}]$ pentru $X_1=F$), apoi $X_2$ pe ambele ramuri; $\chi^2$ rădăcină = 4.863 (> 3.841, semnificativ); sub $X_1=T$ ($[3{+},0{-}]$, $[4{+},1{-}]$): 0.686; sub $X_1=F$ ($[4{+},3{-}]$, $[1{+},5{-}]$): 2.236; ambele sub 3.841, deci ambele noduri $X_2$ se taie; arborele: $X_1$ la rădăcină, $T\to+$, $F\to-$ (majoritate 8 la 5).
**E 4.58** (opțional, implementare; B:611). Nu are răspuns de notat; ecranul spune într-o linie că cere implementarea ID3 de bază (pseudocodul Mitchell, antrenare și testare, fișiere cu valori separate prin spațiu) și trimite la Lecția 11 pentru algoritm. Fără ecran de cod (design, non-goal).

### Demonstrații (cu predicție)
- **4.20.b ($E_{ij}$ sub independență).** (1) Predicție: cum arată probabilitatea unei celule dacă atributul și clasa sunt independente? $P(A=i,C=j)=P(A=i)P(C=j)$ (Lecția 3). (2) Cu probabilitățile estimate din date, $P(A=i)=\tfrac{\text{rând }i}{N}$ și $P(C=j)=\tfrac{\text{coloană }j}{N}$. (3) Numărul așteptat de instanțe în celulă: $E_{ij}=N\cdot P(A=i)P(C=j)=\tfrac{\text{rând}_i\cdot\text{coloană}_j}{N}$; la rădăcina din 4.20: $12\cdot\tfrac12\cdot\tfrac13=2$.
- **4.53 (deficiențele pruning-ului).** (a) Pe xor, ambele atribute au $IG=0$ la rădăcină; regula "taie când toate au IG 0" oprește la o frunză, deși o frunză clasifică greșit jumătate din date consistente. (b) Cu zgomot de atribute, IG-ul de noroc >0 le pune primele; bottom-up păstrează nodurile cu IG mic care au descendenți cu IG mare; deci nu elimină zgomotul.
- **4.55.** Se aplică R5: tabelele de contingență pe fiecare nod, $\chi^2$ față de $3.841$ (1 grad de libertate: 2 valori $\times$ 2 clase).

### Vizual
Arborele din T21T2 10 cu IG pe fiecare nod și un prag $\varepsilon$ reglabil; comutator top-down / bottom-up; nodurile eliminate se estompează. Cursantul prezice arborele rezultat înainte ca animația de ștergere să arate rezultatul. La 4.19 același widget pe arborele din exercițiu. Avans manual.

### Note pentru constructor (L16)
- The book's 4.20 says "probabilitățile MLE"; L16 comes before Lecția 18 (MLE), so the screens say "frecvențe relative" (the same numbers).
- Tabelul PlayTennis (ML3:5 = 4.54) are aici proprietarul; 2.27 (L20) și 4.52 (L17) îl reiau (declared_reuse). Allocation spune "trimitere vezi Lecția 9" pentru reutilizare: cred că e o scăpare, proprietarul e Lecția 16 (problema 4, secțiunea 11).
- 4.19: soluția DTs (slide-uri) e citată în lista cititorilor; cartea tipărește "$V\wedge V\wedge X$" (tipar), corectat aici.
- Q1-Q4, pretest: cifre construite (arbore Q1, matrici 8/2/2/8, procente 0/30/8/12).

---

## Lecția 17. Raportul câștigului, atribute cu multe valori, alte criterii de impuritate (`ml-l17`, priority B)

**Concepte (3):** (a) raportul câștigului de informație: SplitInfo și GainRatio (C4.5); preferința lui ID3 pentru atribute cu multe valori (P6); (b) alte măsuri de impuritate: Gini, clasificare greșită, diminuarea impurității; (c) costul atributelor: $Gain^2/Cost$; valori lipsă (doar menționat).
**Necesită:** vezi Lecția 7 ($H$, $H[a{+},b{-}]$), vezi Lecția 9 (IG, cioturi), vezi Lecția 11 (ID3 complet), vezi Lecția 14 (praguri; la 4.14.c).

### Pretest
Ecran: tabelul de opt rânduri din exemplul de mai jos ($ID$ diferit pe fiecare rând; $Q\in\{a,b\}$; clasa $Y$). "Care atribut are câștig de informație mai mare, $ID$ sau $Q$? L-ai pune pe $ID$ în rădăcină?" Așteptat: **ID** are IG mai mare, dar **nu** merită (pe un ID nou arborele nu are ramură). Valorile apar abia în exemplul de mai jos (C1, C4). (Builder: an earlier draft used a separate six-row table here, which computed the same "ID gets $IG=H(Y)$" a second time; the pretest now uses the worked example's table, and the injective-attribute property itself is Lecția 13's, 4.56.e.)

### Concret (construit: ID unic față de un atribut real)
Opt rânduri $(ID,Q\to Y)$: $(1,a,+)$, $(2,a,+)$, $(3,a,+)$, $(4,a,+)$, $(5,a,-)$, $(6,b,-)$, $(7,b,-)$, $(8,b,-)$ (cifre construite, verificate de script; ilustrează (P6)). $H(Y)=H[4{+},4{-}]=1$.
- **C1.** Predicție: $IG(ID)$ și $IG(Q)$. Opt cutii de câte un exemplu, toate pure: $IG(ID)=H(Y)=1$ (atribut injectiv, vezi Lecția 13). Q: $a=[4{+},1{-}]$, $b=[0{+},3{-}]$, $H(Y|Q)=\tfrac58H(\tfrac15)=0.4512$, $IG(Q)=0.5488$. IG alege **ID**.
- **C2.** Predicție: ce penalizare arată ID? Informația la separare $SplitInfo(S,A)=-\sum_i\tfrac{|S_i|}{|S|}\log_2\tfrac{|S_i|}{|S|}$: ID: 8 părți egale, $\log_28=3$; Q: $H(\tfrac58)=0.9544$.
- **C3.** $GainRatio=\tfrac{IG}{SplitInfo}$: ID $=\tfrac13=0.3333$; Q $=\tfrac{0.5488}{0.9544}=0.5750$. C4.5 alege **Q**.
- **C4.** Ce prezice arborele cu ID la rădăcină pe un rând nou cu ID 9? Nimic: nicio ramură pentru 9 (pseudocodul ML3:9 ar da eticheta majoritară a părintelui). Q prezice.

### Regula
- **R1 GainRatio** (ML3:22; B:603-604). $SplitInfo(S,A)=-\sum_{i=1}^{c}\frac{|S_i|}{|S|}\log_2\frac{|S_i|}{|S|}$ ("informația la separare"; $0\log_20=0$), $GainRatio(S,A)=\frac{Gain(S,A)}{SplitInfo(S,A)}$ ("raportul câștigului de informație", C4.5). Părți egale $\Rightarrow SplitInfo=\log_2|V|$ (mai multe valori, penalizare mai mare); o singură valoare în nod $\Rightarrow SplitInfo=0$ (atributul nu se ia în considerare). **(P6)** (B:488): ID3 e sensibil la atribute cu foarte multe valori ("Imaginează-ți Date = Jun 3 1996 ca atribut", ML3:22). Raportul câștigului nu rezolvă tot: o împărțire foarte informativă cu multe părți mici poate câștiga în continuare.
- **R2 Impurități** (ML3:20; B:523-524). Pentru nodul $n$ cu clasele $c_1..c_k$: **Gini** $i(n)=1-\sum_iP^2(c_i)$; **clasificare greșită** $i(n)=1-\max_iP(c_i)$; **diminuarea impurității** $\Delta i(n)=i(n)-P(n_l)\,i(n_l)-P(n_r)\,i(n_r)$. Pentru Bernoulli cu parametru $p$: $Entropy(p)=-p\log_2p-(1-p)\log_2(1-p)$, $Gini(p)=2p(1-p)$, $MisClassif(p)=\min(p,1-p)$; toate în $[0,1]$ (entropia și Gini până la 1 și 0.5), simetrice față de $\tfrac12$, crescătoare pe $[0,\tfrac12]$, maxime la $\tfrac12$; entropia $\ge$ Gini. Clasificarea greșită e "oarbă" la împărțiri care nu schimbă clasa majoritară.
- **R3 Costuri și valori lipsă** (ML3:23-24). Cu costuri se poate maximiza $\frac{Gain^2(S,A)}{Cost(A)}$ (4.14.b); există și $\frac{2^{Gain}-1}{(Cost+1)^w}$. **Valori lipsă:** există variante de tratare (ML3:24); doar menționat, nu e cerut la test.

### De ce?
Întrebare: "De ce câștigul de informație favorizează atributele cu multe valori?" Răspuns: cu multe valori fiecare ramură primește foarte puține exemple și e aproape sigur pură, deci $H(Y|A)\to0$ și $IG\to H(Y)$, indiferent dacă atributul cunoaște ceva despre $Y$; împărțirea e "fragmentată". $SplitInfo$ crește cu numărul de părți și cu cât sunt mai mici, deci împarte tocmai aceste câștiguri.

### Reamintire
- **Q1.** Un atribut împarte 12 exemple în părți de 6, 3 și 3. Cât este $SplitInfo$? ✓ $1.5$ ($\tfrac12\cdot1+\tfrac14\cdot2+\tfrac14\cdot2$). ✗[numărul de valori]: 3 (explicație: $SplitInfo$ e o entropie a mărimilor părților, nu numărul lor). ✗[părți egale presupuse]: $\log_23=1.585$ (explicație: $\log_2|V|$ e doar pentru părți egale; aici părțile au 6, 3, 3). ✗[entropia clasei]: "depinde de etichete" (explicație: $SplitInfo$ folosește doar mărimile $|S_i|$, nu clasele). (Builder: the 8 equal parts, $\log_28=3$, are C2; not asked again.)
- **Q2.** Atributul X are 3 valori cu efective egale și $IG=0.30$. Atributul Z are 2 valori cu efective egale și $IG=0.20$. Ce alege ID3? Dar C4.5? ✓ ID3: X ($0.30>0.20$); C4.5: Z ($\tfrac{0.20}{1}=0.20>\tfrac{0.30}{1.585}=0.1893$). ✗[același]: X la ambele (explicație: raportul schimbă ordinea). ✗[invers]: ID3 Z, C4.5 X (explicație: ID3 compară doar IG, unde $X$ are $0.30>0.20$; abia împărțirea la $SplitInfo$ îl penalizează pe $X$, cu trei părți).
- **Q3.** Rădăcina $[4{+},4{-}]$ se împarte perfect în $[4{+},0{-}]$ și $[0{+},4{-}]$. Cât este diminuarea impurității Gini? ✓ $0.5$ (Gini al rădăcinii $1-\tfrac14-\tfrac14=0.5$; copiii au 0). ✗[Gini are maximul 1, ca entropia]: 1 (explicație: pentru două clase Gini are maximul $0.5$, la $p=\tfrac12$; 1 e maximul entropiei). ✗[Gini fără factorul 2]: $0.25$ (explicație: $Gini(p)=2p(1-p)=1-p^2-(1-p)^2$; $p(1-p)$ singur dă jumătate). ✗[diminuare nulă la împărțirea perfectă]: 0 (explicație: copiii puri au impuritate 0, deci diminuarea e toată impuritatea rădăcinii). (Builder: a split where misclassification impurity does not change is exercise 4.15.c; not asked here.)
- **Q4.** $Gain^2/Cost$: atributul X: $Gain=0.30$, $Cost=2$; atributul Y: $Gain=0.20$, $Cost=1$. Care câștigă? ✓ X ($0.045>0.04$), în ciuda costului dublu. ✗[Gain/Cost]: Y ($\tfrac{0.20}{1}>\tfrac{0.30}{2}$; explicație: la $Gain^2/Cost$ pătratul câștigului domină costul, ca la EKG în 4.14.b). ✗[cel mai ieftin]: Y fiindcă e mai ieftin (explicație: costul singur nu decide; $Gain^2/Cost$ cântărește și câștigul, iar $0.30^2/2=0.045$ depășește $0.20^2/1=0.04$).

### Exerciții
**E 4.13** (B:518-520; status: book). Enunț: atributele $X_1$ (binar) și $X_2$ (6 valori, A..F), ieșire $Y\in\{1,2\}$; 12 exemple, câte 6 din fiecare clasă: $Y=1$: $(1,A)$, $(0,E)$, $(1,B)$, $(1,B)$, $(1,F)$, $(0,D)$; $Y=2$: $(0,A)$, $(0,C)$, $(1,E)$, $(0,F)$, $(0,B)$, $(1,D)$ (perechi $(X_1,X_2)$). $Gain(S,A)=H(S)-H(S|A)$. (a) Atributul din rădăcină după IG (folosește $\log_23=1.585$). (b) Rădăcina după "gain ratio impurity" $\tfrac{Gain(S,A)}{-\sum_vP(A=v)\log_2P(A=v)}$. (c) Discută utilitatea raportului când atributele au numere diferite de valori.
- Câmpuri: $H(Y)$ = 1; $X_1=0$: $[2{+},4{-}]$, $X_1=1$: $[4{+},2{-}]$; $IG(X_1)=\tfrac53-\log_23$ = 0.0817; $X_2$: A $[1{+},1{-}]$, B $[2{+},1{-}]$, C $[0{+},1{-}]$, D $[1{+},1{-}]$, E $[1{+},1{-}]$, F $[1{+},1{-}]$; $IG(X_2)$ = 0.1038 (cartea tipărește $\approx0.1037$, trunchiat; $=\tfrac12-\tfrac14\log_23$); (a) rădăcina = $X_2$; (b) $SplitInfo(X_1)$ = 1, $SplitInfo(X_2)$ = 2.5221; $GainRatio(X_1)$ = 0.0817; $GainRatio(X_2)$ = 0.0411; rădăcina = $X_1$; (c) alegere: "IG favorizează atributele cu multe valori, indiferent dacă împart semnificativ datele; numitorul crește cu numărul de ramuri și cu numărul de ramuri cu puține exemple".
- Soluție (B:518-520): $X_1$: $H(Y|X_1)=H[4{+},2{-}]=\log_23-\tfrac23$; $IG=1-\log_23+\tfrac23=\tfrac53-\log_23$. $X_2$: $H(Y|X_2)=\tfrac8{12}\cdot1+\tfrac3{12}H[1{+},2{-}]+\tfrac1{12}\cdot0$.
- Detectoare: (b) rădăcina $X_2$ → "SplitInfo($X_2$) e mare, raportul scade sub cel al lui $X_1$"; $GainRatio(X_2)=0.1038$ → "ai uitat să împarți la SplitInfo".
**E 4.14** (B:520-523; status: book). Enunț: 12 pacienți ipotetici; coloanele Pacient, Sex, Peste60, Diabetic, Puls, EKG, AreAritmie: 1 M 1 1 0 0 $\to$ 0; 2 M 0 0 1 1 $\to$ 1; 3 M 0 1 1 0 $\to$ 0; 4 M 1 0 0 1 $\to$ 1; 5 M 1 1 1 0 $\to$ 1; 6 M 0 1 1 0 $\to$ 1; 7 F 0 0 1 0 $\to$ 0; 8 F 1 1 1 1 $\to$ 1; 9 F 0 1 0 1 $\to$ 1; 10 F 1 0 0 0 $\to$ 0; 11 F 1 1 0 0 $\to$ 0; 12 F 1 0 1 1 $\to$ 1. (a) $H(AreAritmie|Sex=F)$. (b) Dacă atributele se aleg prin $\frac{Gain^2(S,A)}{Cost(A)}$ și $Cost(Sex)=Cost(Peste60)=1$, $Cost(Diabetic)=3$, $Cost(Puls)=2$, $Cost(EKG)=5$, care e rădăcina? ($\log_23=1.585$, $\log_25=2.322$, $\log_27=2.807$.) (c) Pentru alt set cu vârste exacte: pozitive $\{40,60,62,64,70,74,75,82\}$, negative $\{33,35,42,45,49,52,58,59,80\}$; arbore cu un nod "$varsta<k$" / "$\ge k$": ce $k$ maximizează IG?
- Câmpuri: (a) $H[3{+},3{-}]$ = 1; (b) $H(AreAritmie)=H[7{+},5{-}]$ = 0.9799; ciotul Sex: F $[3{+},3{-}]$, M $[4{+},2{-}]$; Peste60: 0 $[3{+},2{-}]$, 1 $[4{+},3{-}]$; Diabetic: 0 $[3{+},2{-}]$, 1 $[4{+},3{-}]$; Puls: 0 $[2{+},3{-}]$, 1 $[5{+},2{-}]$; EKG: 0 $[2{+},5{-}]$, 1 $[5{+},0{-}]$. $Gain$: Sex 0.0207, Peste60 = Diabetic = 0.0006, Puls 0.0718, EKG 0.4764 (toleranță ±0.001; cartea, cu $\log_23=1.585$ etc., tipărește $\approx0.02$, $0.0009$, $0.072$, $0.476$). $Gain^2/Cost$: Sex 0.0004, Peste60 $\approx0$, Diabetic $\approx0$, Puls 0.0026, EKG 0.0454 (cartea: 0.0453152; toleranță ±0.0002); rădăcina = EKG, "deși are costul cel mai mare"; (c) $[8{+},9{-}]$, $H$ = 0.9975; praguri candidate (între valori cu etichete diferite): 37.5, 41, 59.5, 77.5, 81; IG: 0.1180, 0.0119, **0.4753**, 0.0003, 0.0670; $k$ = 59.5 ($[1{+},8{-}]$ la stânga, $[7{+},1{-}]$ la dreapta).
- Soluție (B:521-523): pentru EKG pătratul câștigului ($0.476^2=0.2266$) împărțit la 5 bate celelalte; la (c) valorile 40 (+) și 60 (+) se intercalează cu negative, deci din toate mijloacele doar granița 59 (−) / 60 (+) e bună.
- Detectoare: (b) rădăcina Puls (cel mai mic cost după Sex) → "$Gain^2$ domină costul: EKG"; (c) $k$ = 61 → "pragul e la jumătatea dintre 59 și 60: 59.5".
**E 4.15** (B:523-525; status: book). Enunț: definițiile din R2. (a) Pentru $k=2$ trasează Entropy, Gini, Misclassification în funcție de $P(c_1)$. (b) Calculează diminuarea impurității (Gini, apoi clasificare greșită) pentru setul $A$: $a_1a_1a_1a_2a_2a_2$ / $C$: $c_1c_1c_2c_2c_2c_2$. (c) Există un set cu $\Delta$ clasificare-greșită $=0$ dar entropie și Gini $\ne0$? (indicație: dacă $C_1<C_2$ se păstrează în ambii copii...).
- Câmpuri: (a) la $p=0.2$: Entropy = 0.7219, Gini = 0.32, MisClassif = 0.2; la $p=\tfrac12$: 1, 0.5, 0.5; (b) partiția $[2{+},4{-}]\to a_1:[2{+},1{-}]$, $a_2:[0{+},3{-}]$; Gini: $i(0)=\tfrac49$, $i(1)=\tfrac49$, $i(2)=0$, $\Delta=\tfrac29$ = 0.2222; clasificare greșită: $i(0)=\tfrac13$, $i(1)=\tfrac13$, $i(2)=0$, $\Delta=\tfrac16$ = 0.1667; (c) da; exemplu: schimbi un $(a_1,c_1)$ în $(a_1,c_2)$ și adaugi $(a_2,c_1)$: $[2{+},5{-}]\to[1{+},2{-}]$ (3) și $[1{+},3{-}]$ (4): $\Delta_{ent}$ = 0.0060, $\Delta_{Gini}$ = 0.0034, $\Delta_{misc}$ = 0.
- Soluție (B:525): demonstrația mai jos. Capcană: clasificarea greșită nu vede împărțirile care nu schimbă majoritatea, de aceea ID3 nu o folosește.
- Detectoare: (b) $\Delta_{Gini}=0.1667$ → "ai luat Δ-ul pentru clasificare greșită; Gini are $\tfrac29$".
**E 4.52** (B:603-606; status: verified-twice; "Culegerea nu dă răspunsul; verificat de două ori."). Enunț: PlayTennis cu Temperature numerică, **tratată ca atribut discret** (variantă a tabelului din Lecția 16, aici cu 7 valori): 14 zile (Day, Outlook, Temperature, Humidity, Wind $\to$ EnjoyTennis): D1 Sunny 26 High Weak No; D2 Sunny 25 High Strong No; D3 Overcast 25 High Weak Yes; D4 Rain 24 High Weak Yes; D5 Rain 19 Normal Weak Yes; D6 Rain 20 Normal Strong No; D7 Overcast 20 Normal Strong Yes; D8 Sunny 23 High Weak No; D9 Sunny 20 Normal Weak Yes; D10 Rain 25 Normal Weak Yes; D11 Sunny 24 Normal Strong Yes; D12 Overcast 22 High Strong Yes; D13 Overcast 23 Normal Weak Yes; D14 Rain 23 High Strong No. (a) Desenează ciotul fiecărui atribut (Outlook, Humidity, Wind, Temperature) cu partițiile; calculează entropia condiționată medie și IG. (b) Rădăcina ID3. (c) $SplitInfo$ pentru toate intrările (se dau $\log_23=1.584$, $\log_25=2.322$, $\log_27=2.807$; se presupune $SplitInfo(Outlook)=1.577$, $SplitInfo(Temperature)=2.646$); rădăcina C4.5. (d) Arborele ID3 complet. (e) Arborele C4.5 complet; compară cu (d).
- Câmpuri: $H(EnjoyTennis)=H[9{+},5{-}]$ = 0.9403; (a) $H(Y|Outlook)$ = 0.6935 ($IG$ = 0.2467; Sunny $[2{+},3{-}]$, Overcast $[4{+},0{-}]$, Rain $[3{+},2{-}]$); $H(Y|Temperature)$ = 0.5903 ($IG$ = 0.3500; 26 $[0{+},1{-}]$, 25 $[2{+},1{-}]$, 24 $[2{+},0{-}]$, 19 $[1{+},0{-}]$, 20 $[2{+},1{-}]$, 23 $[1{+},2{-}]$, 22 $[1{+},0{-}]$); $H(Y|Humidity)$ = 0.7885 ($IG$ = 0.1518; High $[3{+},4{-}]$, Normal $[6{+},1{-}]$); $H(Y|Wind)$ = 0.8922 ($IG$ = 0.0481; Weak $[6{+},2{-}]$, Strong $[3{+},3{-}]$); (b) rădăcina ID3 = Temperature (0.3500); (c) $SplitInfo$: Outlook 1.5774, Temperature 2.6456, Humidity 1.0000, Wind 0.9852; $GainRatio$: Outlook 0.1564, Temperature 0.1323, Humidity 0.1518, Wind 0.0488; rădăcina C4.5 = Outlook; (d) arborele ID3: rădăcina Temperature; 26 $\to$ No; 24 $\to$ Yes; 19 $\to$ Yes; 22 $\to$ Yes; 25 ($[2{+},1{-}]$) $\to$ Outlook (Sunny No, Overcast Yes, Rain Yes; egalitate cu Wind); 20 ($[2{+},1{-}]$) $\to$ Outlook (Rain No, Overcast Yes, Sunny Yes); 23 ($[1{+},2{-}]$) $\to$ Outlook (Sunny No, Overcast Yes, Rain No; egalitate cu Humidity); (e) arborele C4.5: Outlook; Sunny $\to$ Humidity (High No, Normal Yes) [Temperature are tot 0.9710 IG dar raportul 0.4182 < 1.0]; Overcast $\to$ Yes; Rain $\to$ Wind (Strong No, Weak Yes) = arborele "manual" din Lecția 16 (aceleași 14 zile), mai mic și mai sensibil decât cel ID3 de la (d).
- Soluție: Temperature cu 7 valori bate Outlook la IG (0.3500 față de 0.2467) tocmai din fragmentare (P6); împărțit la $SplitInfo$, Outlook câștigă. Comentariul lui Ciortuz (`tests/2020-2021-partial1/solutii.pdf:1-5`): arborele ID3 "face unele predicții imposibile (vezi Temperature = 21)" și ignoră celelalte atribute.
- Detectoare: (b) Outlook la ID3 → "Temperature are IG 0.3500, mai mare decât 0.2467"; (c) rădăcina Temperature la C4.5 → "raportul 0.1323 < 0.1564".

### Demonstrație (4.15.c, cu predicție)
(1) Predicție: când nu se schimbă clasa majoritară nici în rădăcină, nici în copii? Fie $C_1<C_2$ în rădăcină și $C_{1l}<C_{2l}$, $C_{1r}<C_{2r}$ în copii: clasa minoritară e aceeași peste tot. (2) Impuritatea de clasificare greșită a nodului = proporția clasei minoritare: rădăcina $\tfrac{C_1}{C_1+C_2}$; copiii $\tfrac{C_{1l}}{n_l}$ și $\tfrac{C_{1r}}{n_r}$. (3) $\Delta=\tfrac{C_1}{C_1+C_2}-\tfrac{n_l}{n}\cdot\tfrac{C_{1l}}{n_l}-\tfrac{n_r}{n}\cdot\tfrac{C_{1r}}{n_r}=\tfrac{C_1-C_{1l}-C_{1r}}{n}=0$, fiindcă $C_1=C_{1l}+C_{1r}$. (4) Gini și entropia sunt strict concave, deci scad strict dacă distribuțiile copiilor diferă de a părintelui: exemplul $[2{+},5{-}]\to[1{+},2{-}],[1{+},3{-}]$.

### Vizual
Trei curbe de impuritate în funcție de $P(c_1)$ (entropie, Gini, clasificare greșită), cu un marcaj care se mută; cursantul prezice care curbă e deasupra la $p=0.2$ înainte să apară valorile ($0.7219$, $0.32$, $0.2$). A doua fază: bară $SplitInfo$ pentru un atribut cu $k$ părți egale ($\log_2k$). Avans manual.

### Note pentru constructor (L17)
- 4.14: cartea folosește aproximări ($\log_23=1.585$ ș.a.) și tipărește câștiguri rotunjite (0.02, 0.0009, 0.072, 0.476; raportul EKG 0.0453152); valorile exacte: 0.0207, 0.0006, 0.0718, 0.4764; raportul EKG 0.04539. Toleranțele din câmpuri acoperă ambele. 4.14.a rămâne aici cu tabelul lui (nu în Lecția 8; allocation).
- 4.13: $IG(X_2)=0.10376$; cartea tipărește 0.1037 (trunchiat), nu e greșeală de tipar.
- 4.52: Temperature e discret aici (7 valori); în Lecția 16 e Hot/Mild/Cool; tabelele sunt distincte (declared_reuse). Rezultatele cititorilor și ale scriptului meu coincid.
- Exemplul ID unic + Q și întrebările Q1-Q4: cifre construite; remarcă: cu aceste cifre GainRatio(ID)=0.3333 < GainRatio(Q)=0.5750, dar la pretest (șase rânduri) ID ar câștiga și după raport ($0.3869>0.0817$): lecția spune doar "raportul nu rezolvă tot" în R1, fără a reveni la pretest (ar repeta).

---

## Lecția 18 (`ml-l18`): Estimarea parametrilor: verosimilitate maximă (MLE)

**Priority B.** **Concepts (2):** (1) verosimilitatea unui set de date ca funcție de parametru; log-verosimilitatea; (2) estimarea în sensul verosimilității maxime (MLE): $\frac{n_1}{n_1+n_0}$, $\frac{n_i}{N}$, estimări condiționate din numărători; maximizarea prin derivată. **Prerequisites:** Lecția 4 (Bernoulli, variabile i.i.d.), Lecția 3 (evenimente independente: probabilitățile se înmulțesc); back-links only.

**Does not teach (owned elsewhere):** Bernoulli and binomial (L4); $\arg\max$ versus $\max$, MAP and the Beta(3,3) prior (L19); zero counts and add-one (L21; per the allocation note there is no zero-count preview here, so it is taught once); MLE as minimum KL, 0.149 (L24).

**Written by the critic pass (2026-10-28):** this lesson was missing from the four outline parts (it is `ml-l18` in `allocation.json`, owner of 0.42 and 0.43.a-e, and L19, L20, L24 and T21P item 8 link back to it).

### L18 screens: opening question

**L18.s01** (question, choice; data on the same screen; `[construit]`)
> O monedă (nu știm dacă e corectă) a fost aruncată de 5 ori: **1, 0, 1, 1, 1** (1 = stemă). Fie $\theta=P(\text{stemă})$. Care dintre valorile $\theta=0{,}5$, $\theta=0{,}8$, $\theta=1$ face **aceste date** cele mai probabile?

Choices `0,5` / `0,8` / `1`. Expected `0,8`. Typical wrong answers: `1` ("aproape numai steme") and `0,5` ("o monedă e corectă"). After the answer the screen only says: "Păstrează răspunsul; îl verifici pe ecranul următor." (Values for the builder: $L(0{,}5)=\frac1{32}=0{,}03125$, $L(0{,}8)=0{,}08192$, $L(1)=0$.)

### L18 screens: worked example (viz `ml-viz-likelihood`, then Cn-s5:1 "Remember 2")

**L18.s02** (prediction)
> Aruncările sunt independente (vezi Lecția 3). Scrie probabilitatea **șirului** observat 1, 0, 1, 1, 1 ca funcție de $\theta$.

✓ $\theta\cdot(1-\theta)\cdot\theta\cdot\theta\cdot\theta=\theta^4(1-\theta)$. ✗[probabilitatea numărului de steme] $5\,\theta^4(1-\theta)$: aceasta este probabilitatea de a obține **4 steme din 5 în orice ordine** (binomiala, Lecția 4); datele sunt șirul observat. Factorul 5 nu depinde de $\theta$, deci nu mută maximul. ✗[adună în loc să înmulțească] $4\theta+(1-\theta)$: probabilitățile evenimentelor independente se înmulțesc.

**L18.s03** (prediction, viz)
> Calculează $\theta^4(1-\theta)$ pentru $\theta=0{,}5$, $\theta=0{,}8$ și $\theta=1$. Care valoare e cea mai mare?

Expected `0,03125`, `0,08192`, `0`, so `0,8` (payoff of L18.s01). Reveal: the curve $\theta\mapsto\theta^4(1-\theta)$ on $[0,1]$ with the three points marked; the maximum is at $\theta=0{,}8=\frac45$, the share of 1s in the data. $\theta=1$ gives 0: a coin with $\theta=1$ could never produce the observed 0. `[construit]`

**L18.s04** (prediction; Cn-s5:1 "Remember 2", `[seminar]`)
> Aceeași idee pe un tabel. Estimează prin numărare $P(A{=}0,B{=}0)$ și $P(A{=}0\mid Y{=}1)$:
>
> | A | B | Y |
> |---|---|---|
> | 0 | 0 | 0 |
> | 0 | 1 | 1 |
> | 1 | 0 | 1 |
> | 1 | 1 | 0 |
>
> Notăm cu $\#(\cdot)$ numărul de rânduri care au proprietatea din paranteză.

Expected $\hat P(A{=}0,B{=}0)=\dfrac{\#(A=0,B=0)}{4}=\dfrac14$ and $\hat P(A{=}0\mid Y{=}1)=\dfrac{\#(A=0,Y=1)}{\#(Y=1)}=\dfrac12$ (only the rows with $Y=1$ count). Detector for the second field: `1/4` → "Ai împărțit la toate cele 4 rânduri: aceasta e $\hat P(A{=}0,Y{=}1)$. Condiționarea pe $Y=1$ păstrează doar rândurile cu $Y=1$ (două)." Reveal: these are the estimates in the maximum likelihood sense (MLE); the next screens say why counting maximises the likelihood.

### L18 screens: rules

**L18.s05** (definition)
> **Verosimilitatea** datelor $D$ în raport cu parametrul $\theta$: $L(\theta)=P(D\mid\theta)$, privită ca **funcție de $\theta$**, cu datele fixate. Pentru observații independente și identic distribuite (i.i.d.) $X_1,\dots,X_n$: $L(\theta)=\prod_{i=1}^nP(X_i\mid\theta)$.
>
> $L$ **nu** este o distribuție de probabilitate pentru $\theta$; este doar o funcție de $\theta$. Pentru datele 1, 0, 1, 1, 1: $\int_0^1\theta^4(1-\theta)\,d\theta=\frac15-\frac16=\frac1{30}$, nu 1.
>
> **Log-verosimilitatea:** $\ell(\theta)=\ln L(\theta)$.

Footnote: "Cursul: slide 30. Culegerea: p. 93-95, 97." Builder: FND:30 ("a likelihood is not a probability distribution or density; it is simply a function of the variable"); B:95 ("funcția de verosimilitate"); B:97 ($l(\theta)=\ln L(\theta)$). The integral $\frac1{30}$ is `[construit]`.

**L18.s06** (definition)
> **Estimarea în sensul verosimilității maxime (MLE):** $\hat\theta_{MLE}=\arg\max_{\theta}L(\theta)$, adică valoarea parametrului pentru care datele observate sunt cele mai probabile ($\arg\max$ = punctul în care se atinge maximul).
>
> Fiindcă $\ln$ e strict crescătoare, $L$ și $\ell=\ln L$ își ating maximul în același punct: $\hat\theta_{MLE}=\arg\max_\theta\ell(\theta)$. Baza logaritmului nu contează: alt logaritm înmulțește $\ell$ cu o constantă pozitivă.

Footnote: "Culegerea: p. 94 (nota 76), p. 95, p. 97." Builder: the one-clause gloss of $\arg\max$ is notation only; the contrast $\max$ / $\arg\max$ (Cn-s5:1 "Remember 1") is L19.s09.

**L18.s07** (rule; three formulas)
> **Rezultatele pe care le vei folosi:**
> - Bernoulli, cu $n_1$ observații egale cu 1 și $n_0$ egale cu 0: $\hat\theta_{MLE}=\dfrac{n_1}{n_1+n_0}$ (demonstrația urmează).
> - Distribuție categorială cu $K$ valori, valoarea $i$ apărând de $n_i$ ori din $N$: $\hat\theta_i=\dfrac{n_i}{N}$.
> - Probabilitate condiționată estimată dintr-un tabel: $\hat P(A{=}a\mid Y{=}y)=\dfrac{\#(A=a,\,Y=y)}{\#(Y=y)}$.
>
> Pe scurt: **MLE = frecvența relativă**, calculată doar pe rândurile care respectă condiția.

Footnote: "Cursul: slide 28. Culegerea: p. 98. Seminar 5, p. 1."

**L18.s08-s11** (proof screens: 0.43.c, B:97-98; proof 3 of the course's proof list, DEM:1; these four screens ARE the worked solution of 0.43.c, exercise L18.e2 points back here)
> Arată că pentru $X_1,\dots,X_n$ i.i.d. Bernoulli($\theta$), cu $n_1=\#\{X_i=1\}$ și $n_0=\#\{X_i=0\}$: $\hat\theta_{MLE}=\dfrac{n_1}{n_1+n_0}$.

Steps (predict, then reveal):
- **s08:** "Cum scrii $P(X_i\mid\theta)$ într-o singură formulă, pentru $X_i\in\{0,1\}$?" ✓ $\theta^{X_i}(1-\theta)^{1-X_i}$ (dă $\theta$ pentru 1 și $1-\theta$ pentru 0; B:97 îl numește "artificiul ridicării la putere"). Then $L(\theta)=\prod_i\theta^{X_i}(1-\theta)^{1-X_i}=\theta^{n_1}(1-\theta)^{n_0}$. ✗[coeficient binomial] $C_n^{n_1}\theta^{n_1}(1-\theta)^{n_0}$: ar fi probabilitatea numărului de 1, nu a datelor observate; constanta nu schimbă unde e maximul.
- **s09:** "Ce devine $\ell(\theta)$ pe $(0,1)$?" ✓ $\ell(\theta)=n_1\ln\theta+n_0\ln(1-\theta)$. ✗[logaritmul unei sume] $\ln\big(n_1\theta+n_0(1-\theta)\big)$: logaritmul transformă un produs în sumă, nu invers.
- **s10:** "Cât sunt $\ell'(\theta)$ și $\ell''(\theta)$?" ✓ $\ell'(\theta)=\dfrac{n_1}{\theta}-\dfrac{n_0}{1-\theta}$; $\ell''(\theta)=-\Big(\dfrac{n_1}{\theta^2}+\dfrac{n_0}{(1-\theta)^2}\Big)<0$ pe $(0,1)$. ✗[derivata lui ln(1−θ)] $\dfrac{n_1}{\theta}+\dfrac{n_0}{1-\theta}$: derivata lui $\ln(1-\theta)$ este $-\dfrac1{1-\theta}$. Reveal: $\ell''<0$ pe tot intervalul, deci $\ell$ e **concavă**: punctul în care $\ell'=0$ este maximul global, nu un minim.
- **s11:** Solve $\ell'(\theta)=0$: $n_1(1-\theta)=n_0\theta$, so $\hat\theta_{MLE}=\dfrac{n_1}{n_1+n_0}$. ∎ Check on the opening coin: $\frac{4}{4+1}=0{,}8$. `[caiet]` B:98.

### L18 screen: why

**L18.s12** (reflect)
> De ce lucrăm cu $\ell=\ln L$ și nu direct cu $L$, dacă maximul e în același loc?

Answer: $L$ este un produs de $n$ factori, fiecare cel mult 1. Pentru 100 de aruncări cu 60 de 1, $L(0{,}6)=0{,}6^{60}\cdot0{,}4^{40}\approx5{,}9\cdot10^{-30}$ (graficul din culegere, p. 98, are pe axa verticală valori de ordinul $10^{-30}$): un număr greu de manevrat. Iar derivata unui produs de $n$ factori are $n$ termeni. Logaritmul transformă produsul în sumă, $\ell=n_1\ln\theta+n_0\ln(1-\theta)$: numere obișnuite și o derivată scurtă. Fiindcă $\ln$ e strict crescătoare, maximul rămâne în același punct.

### L18 screens: retrieve (4 items; new data, never the opening coin or the four-row table again)

**L18.q1** Un zar a fost aruncat de 12 ori; fața 6 a apărut de 4 ori. Cât este $\hat P_{MLE}(6)$ și ce spune această valoare? (`[construit]`)
- ✓ $\frac4{12}=\frac13$; este frecvența relativă din aceste 12 aruncări, nu o dovadă că zarul e măsluit (cu puține date frecvența poate fi departe de probabilitatea adevărată).
- ✗[MLE = probabilitatea adevărată] "$\frac13$, deci zarul favorizează sigur fața 6": MLE descrie doar datele observate; alte 12 aruncări pot da altă valoare.
- ✗[echiprobabilitatea în locul estimării] "$\frac16$, fiindcă zarul are șase fețe": aceasta e presupunerea de echiprobabilitate (Lecția 3), nu o estimare din date.

**L18.q2** Datele 1, 1, 0 dau $L(\theta)=\theta^2(1-\theta)$, cu maximul $L(\frac23)=\frac4{27}$. Ce este adevărat? (`[construit]`: $\int_0^1\theta^2(1-\theta)\,d\theta=\frac1{12}$)
- ✓ $\int_0^1L(\theta)\,d\theta=\frac1{12}$: $L$ e o funcție de $\theta$, nu o distribuție, deci aria de sub ea nu trebuie să fie 1.
- ✗[verosimilitatea e o distribuție în θ] "aria de sub $L$ este 1, ca la orice densitate": $L$ fixează datele și variază $\theta$; nu este densitatea lui $\theta$.
- ✗[verosimilitatea ca probabilitate a parametrului] "$\frac4{27}$ este probabilitatea ca $\theta$ să fie $\frac23$": $L(\theta)=P(D\mid\theta)$ este probabilitatea **datelor**, nu a parametrului.

**L18.q3** Tabelul $(A,Y)$: $(0,0)$, $(1,0)$, $(1,0)$, $(1,1)$, $(1,1)$, $(1,1)$, $(0,1)$. Cât este $\hat P_{MLE}(A{=}1\mid Y{=}0)$? (`[construit]`)
- ✓ $\frac23$: dintre cele 3 rânduri cu $Y=0$, două au $A=1$.
- ✗[condiționata inversă] $\frac25$: aceasta e $\hat P(Y{=}0\mid A{=}1)$, 2 din cele 5 rânduri cu $A=1$.
- ✗[probabilitatea comună în loc de condiționată] $\frac27$: aceasta e $\hat P(A{=}1,Y{=}0)$; condiționata împarte la $\#(Y=0)$, nu la toate rândurile.
- ✗[marginala în loc de condiționată] $\frac57$: aceasta e $\hat P(A{=}1)$, ca și cum $Y$ n-ar conta.

**L18.q4** Pentru $n_1=3$ și $n_0=7$, $\ell(\theta)=3\ln\theta+7\ln(1-\theta)$. În ce punct se anulează $\ell'$? (`[construit]`)
- ✓ $\theta=0{,}3$ (din $\frac3\theta=\frac7{1-\theta}$).
- ✗[raportul în loc de proporție] $\frac37$: acesta e raportul dintre numărul de 1 și numărul de 0; estimarea e proporția 1-urilor în total, $\frac3{10}$.
- ✗[rolurile inversate] $0{,}7$: aceasta e proporția 0-urilor, adică estimarea lui $1-\theta$.

### L18 exercises (calculation exercises; each owned only here)

#### L18.e1: ex. 0.42 (B:93-94), `[caiet]`, answer status book

**Enunț:** Avem două monede. Probabilitatea stemei este $\theta$ la prima monedă și $2\theta$ la a doua. Le aruncăm de mai multe ori, independent, și obținem: moneda 1: stemă; moneda 2: ban; moneda 2: ban; moneda 2: ban; moneda 2: stemă. **a.** Care este log-verosimilitatea acestor date în funcție de $\theta$? **b.** Cât este estimarea de verosimilitate maximă a lui $\theta$?

**Fields:** `a` choice: ✓ $\ell(\theta)=\ln2+2\ln\theta+3\ln(1-2\theta)$; ✗[aceeași monedă] $2\ln\theta+3\ln(1-\theta)$ (a doua monedă are stema cu $2\theta$, banul cu $1-2\theta$); ✗[logaritmul sumei] $\ln\big(\theta+3(1-2\theta)+2\theta\big)$ (probabilitatea datelor este un produs). `dom` choice "domeniul lui $\theta$": ✓ $(0,\frac12)$ (fiindcă $2\theta\le1$); ✗ $(0,1)$. `b` frac `1/5`.

**Hints:** 1) Verosimilitatea e produsul probabilităților celor cinci rezultate: stemă la moneda 1 ($\theta$), ban la moneda 2 ($1-2\theta$, de trei ori), stemă la moneda 2 ($2\theta$). 2) $L(\theta)=\theta(1-2\theta)^3\cdot2\theta=2\theta^2(1-2\theta)^3$, deci $\ell(\theta)=\ln2+2\ln\theta+3\ln(1-2\theta)$. 3) $\ell'(\theta)=\frac2\theta-\frac{6}{1-2\theta}=0\Leftrightarrow2(1-2\theta)=6\theta$.

**Worked solution (book, p. 93-94):** $L(\theta)=2\theta^2(1-2\theta)^3$; $\ell(\theta)=\ln2+2\ln\theta+3\ln(1-2\theta)$; $\ell'(\theta)=\frac2\theta-\frac6{1-2\theta}=0\Leftrightarrow2-10\theta=0\Leftrightarrow\hat\theta_{MLE}=\frac15\in(0,\frac12)$. It is the maximum: $\ell'>0$ on $(0,\frac15)$ and $\ell'<0$ on $(\frac15,\frac12)$.

**Detectors:** `b = 2/5` → "Ai folosit $\theta$ și pentru a doua monedă; ea are stema cu probabilitatea $2\theta$ și banul cu $1-2\theta$." `b = 2/7` → "Derivata lui $3\ln(1-2\theta)$ este $\frac{-6}{1-2\theta}$: ai uitat factorul 2 din interior." `b = 1/2` → "La $\theta=\frac12$ a doua monedă ar da mereu stemă ($2\theta=1$), dar datele au trei de ban: $L(\frac12)=0$."

#### L18.e2: ex. 0.43 a-e (B:94-99), `[caiet]`, answer status book (parts f-i, the MAP, are Lecția 19)

**Enunț:** $X_1,\dots,X_n$ sunt i.i.d. Bernoulli($\theta$): $P(X_i{=}1)=\theta$, $P(X_i{=}0)=1-\theta$. **a.** Scrieți funcția de verosimilitate $L(\hat\theta)$. Depinde ea de ordinea în care apar datele? **b.** Pentru $n=10$, cu șase de 1 și patru de 0, desenați graficul lui $L$ (aici: în vizualizare) și citiți $\hat\theta_{MLE}$. **c.** Găsiți forma analitică a lui $\hat\theta_{MLE}$; concordă cu graficul? **d.** Trei grafice noi: $n=5$ (trei de 1, doi de 0); $n=100$ (60 de 1, 40 de 0); $n=10$ (cinci de 1, cinci de 0). **e.** Comparați funcțiile de verosimilitate și estimările MLE.

Builder: the book asks for a small program that draws the plots (B:95); here the plots are the viz `ml-viz-likelihood` (programming is a non-goal, design §3). Part (c) is the proof on L18.s08-s11; its solution text says "vezi demonstrația din ecranele de mai sus" and does not repeat it.

**Fields:** `a1` choice ✓ $\hat\theta^{\#\{X_i=1\}}(1-\hat\theta)^{\#\{X_i=0\}}$; ✗[coeficient binomial] $C_n^{n_1}\hat\theta^{n_1}(1-\hat\theta)^{n_0}$. `a2` tf "depinde de ordine?" `nu`. `b` num poziția maximului `0.6` (tol ±0.01). `c` choice ✓ $\frac{n_1}{n_1+n_0}$; ✗[raportul] $\frac{n_1}{n_0}$. `d1` num maximul pentru $n=5$ (3/2) `0.6`; `d2` num pentru $n=100$ (60/40) `0.6`; `d3` num pentru $n=10$ (5/5) `0.5`. `e1` num valoarea lui $L$ în punctul de maxim, $n=5$: `0.03456` (tol ±0.00001); `e2` num aceeași pentru $n=10$, 6/4: `0.001194` (tol ±0.000001); `e3` choice "când $n$ crește, cu aceeași proporție de 1": ✓ maximul rămâne la 0,6, vârful devine mai îngust, iar valoarea maximă scade (la $n=100$ e de ordinul $10^{-30}$); ✗[vârful se mută] "maximul se apropie de 0,5" (proporția de 1 rămâne 0,6); ✗[valoarea crește] "valoarea maximă crește, fiindcă avem mai multe date" (fiecare factor nou e cel mult 1, deci produsul scade).

**Hints:** 1) $P(X_i\mid\theta)=\theta^{X_i}(1-\theta)^{1-X_i}$; înmulțește pentru toți $i$. 2) Produsul depinde doar de câte 1 și câte 0 sunt: $\theta^{n_1}(1-\theta)^{n_0}$. 3) Maximul e la $\frac{n_1}{n}$ (ecranele s08-s11); valoarea în acel punct e $\left(\frac{n_1}n\right)^{n_1}\left(\frac{n_0}n\right)^{n_0}$.

**Worked solution (book, p. 97-99):** (a) $L(\hat\theta)=\hat\theta^{\#\{X_i=1\}}(1-\hat\theta)^{\#\{X_i=0\}}$: nu depinde de ordine. (b) graficul are maximul la 0,6. (c) $\hat\theta_{MLE}=\frac{n_1}{n_1+n_0}=\frac6{10}$ (vezi demonstrația din ecranele de mai sus). (d) maximele: 0,6; 0,6; 0,5. (e) pentru primele trei seturi MLE este 0,6, pentru ultimul 0,5; când $n$ crește cu aceeași proporție de 1, vârful funcției de verosimilitate se "adună" tot mai mult în jurul maximului, iar valorile maxime sunt tot mai mici (B:99). Values `[calculat]` from the formula: $L(0{,}6)=0{,}03456$ ($n=5$), $0{,}001194$ ($n=10$), $\approx5{,}9\cdot10^{-30}$ ($n=100$); $L(0{,}5)=0{,}000977$ ($n=10$, 5/5).

**Detectors:** `a2 = da` → "Produsul nu se schimbă dacă schimbi ordinea factorilor: contează doar câte 1 și câte 0 sunt." `d3 = 0.6` → "Al patrulea set are cinci de 1 și cinci de 0: maximul e la $\frac5{10}$." `e1 = 0.6` → "Câmpul cere valoarea lui $L$ în punctul de maxim, $0{,}6^3\cdot0{,}4^2$, nu punctul însuși." `c = n1/n0` → "$\frac{n_1}{n_0}$ e raportul dintre numărul de 1 și numărul de 0; estimarea e proporția 1-urilor, $\frac{n_1}{n_1+n_0}$."

### L18 visual spec: `ml-viz-likelihood` (curba verosimilității)

- **Data (selector):** (1) the opening coin 1, 0, 1, 1, 1 ($n_1=4$, $n_0=1$); (2)-(5) the four datasets of 0.43.b, d (6/4, 3/2, 60/40, 5/5).
- **Steps (manual advance, prediction first):** (1) dataset 1: three points $\theta=0{,}5$; $0{,}8$; $1$ on the axis; predict which gives the largest $L$; the three values appear; the full curve draws; the maximum is marked at 0,8. (2) toggle "$\ell=\ln L$": the curve changes shape, the marker of the maximum stays at 0,8; predict whether it moves (it does not). (3) "aria de sub curbă": the area $\frac1{30}$ is shown next to the number 1 ($L$ is not a density). (4) dataset selector for 0.43.b, d: predict the position of the maximum for each before the curve appears; the vertical axis is rescaled per dataset (values from $0{,}03456$ down to about $6\cdot10^{-30}$), with the value at the maximum printed.
- **Learner predicts:** the best of three $\theta$ values, whether the maximum moves under $\ln$, the argmax per dataset.
- **Reduced motion:** curves appear without drawing animation; no auto-advance.

### L18 builder notes

- Sources: FND:28, 30; B:93-99 (0.42, 0.43.a-e; the MAP parts f-i are L19.e6); Cn-s5:1 ("Remember 2"); DEM:1 (proof 3 = 0.43.c); `content-map.md` T4.
- Not in this lesson (by the allocation): the zero-count problem and add-one (L21; no preview here), MAP and Beta priors (L19), MLE as minimum KL (0.149, L24). The die 1,2,3,4,5,6,1,1,1,1 is T21P item 8 and is **not** used here (it stays in the test); L18.q1 uses a different die. The data 0,0,0,1,1,0 belong to L7's worked example and are not reused.
- Numbers: `[construit]` (opening coin, the integrals $\frac1{30}$ and $\frac1{12}$, quiz values) and the 0.43.e values are recomputed in `verify-outline/v_bayes.py` (section L18). The book prints $\frac15$ (0.42) and 0,6 / 0,5 (0.43).
- Repetition check: the opening coin is used for the question, the curve and the payoff only; Cn-s5:1 "Remember 2" is used once (L18.s04); the quiz uses new data; the derivation of 0.43.c appears once (s08-s11). L19.s13 refers back to its derivative and L19.s14 to its concavity argument; L20.s16 to the one-parameter case.

---

## Lecția 19 (`ml-l19`): Ipoteze ML și MAP; Bayes pentru ipoteze

**Priority A.** **Concepts (4):** (1) teorema lui Bayes pentru ipoteze: $P(h|D)$, prior, verosimilitate; (2) ipotezele $h_{ML}$ și $h_{MAP}$, egalitatea lor pentru priori egali, argmax față de max; (3) estimarea MAP a unui parametru cu prior Beta, log-odds; (4) MAP "brute-force" și clasificatorul Bayes optimal prin vot, cu avertisment de nume. **Prerequisites:** Lecțiile 2, 4, 11, 15, 18 (back-links only).

**Does not teach (owned elsewhere):** the Bayes formula and total probability (L2), Bernoulli and binomial (L4), ID3 and trees (L11), training error and CVLOO (L15), the MLE and the likelihood function (L18), Bayes Naiv and Bayes Comun (L20).

### L19 screens: opening question

**L19.s01** (question; two numeric choices on one screen)
> Un sac conține monede de două feluri: **corecte** (cap cu probabilitatea 1/2) și **măsluite** (cap cu probabilitatea 9/10). Scoți la întâmplare o monedă, o arunci o singură dată și pică **cap**.
>
> **a.** Dacă jumătate din monedele din sac sunt măsluite, ce fel de monedă crezi că ai scos?
> **b.** Dacă doar 1 din 10 monede din sac este măsluită?

Choices per part: `corectă` / `măsluită`. Expected: **a** `măsluită`, **b** `corectă`. `[construit]`: (a) $0{,}9\cdot0{,}5=0{,}45$ against $0{,}5\cdot0{,}5=0{,}25$, posterior of "măsluită" $9/14\approx0{,}64$; (b) $0{,}9\cdot0{,}1=0{,}09$ against $0{,}5\cdot0{,}9=0{,}45$, posterior of "măsluită" $1/6$. After the answer the screen only says: "Aceeași aruncare, aceeași monedă, altă concluzie. Păstrează întrebarea: răspunsul vine în lecție." No formula yet.

### L19 screens: worked example (ML6:7, cancer test)

**L19.s02** (data + prediction)
> Un test de laborator pentru o boală rară: $P(\text{cancer})=0{,}008$, deci $P(\neg\text{cancer})=0{,}992$. Testul iese pozitiv la 98% dintre bolnavi ($P(+|\text{cancer})=0{,}98$) și la 3% dintre cei sănătoși ($P(+|\neg\text{cancer})=0{,}03$). Un pacient are testul **pozitiv**. Îi spui că are cancer?

Prediction `da`/`nu`. Correct `nu` (ML6:7 "Answer: No"). Reveal: "Ca să decidem, comparăm $P(\text{cancer}|+)$ cu $P(\neg\text{cancer}|+)$ și o luăm pe cea mai mare."

**L19.s03** (two numeric predictions; the numerators of Bayes, written as products; link "formula lui Bayes: vezi Lecția 2")
> Calculează cele două produse pentru pacientul cu test pozitiv: $P(+|\text{cancer})P(\text{cancer})$ și $P(+|\neg\text{cancer})P(\neg\text{cancer})$.

Expected `0,0078` and `0,0298` (exact $0{,}00784$ and $0{,}02976$; the slide rounds, tolerance ±0.0001 on the rounded values) `[slide]` ML6:7. Reveal: the second is larger, so the most probable hypothesis given the data is $\neg$cancer. Detector: `0,98` or `0,03` → "Ai dat doar verosimilitatea; produsul mai înmulțește cu cât de frecventă e ipoteza ($0{,}008$ sau $0{,}992$)." `0,008` → "Acesta e prior-ul, fără verosimilitate."

**L19.s04** (prediction; the probability, with a back-link to Lecția 2)
> Cât este probabilitatea a posteriori $P(\text{cancer}|+)$? (Formula lui Bayes și numitorul din formula probabilității totale: vezi Lecția 2.)

Expected $\dfrac{0{,}0078}{0{,}0078+0{,}0298}\approx0{,}21$ (`[slide]` ML6:7 "21%"; exact $784/3760\approx0{,}2085$, tolerance ±0.005). Reveal, one line: "Același fenomen ca la testul de screening din Lecția 2: boala e rară." Builder: an earlier draft re-ran the natural-frequency tree here (100 000 people); the tree and the base-rate explanation are Lecția 2's and are not repeated; this screen only normalises the two products of L19.s03.

**L19.s05** (prediction, the prior flips the decision)
> Presupune că bolnavii și sănătoșii ar fi la fel de numeroși: $P(\text{cancer})=P(\neg\text{cancer})=1/2$. Cu aceleași teste, ce ipoteză câștigă acum?

Expected `cancer` (products $0{,}98\cdot0{,}5=0{,}49$ and $0{,}03\cdot0{,}5=0{,}015$) `[construit]`. Reveal: only the prior changed, and the decision flipped. The next screens name the two hypotheses; the reason is the "De ce?" screen (L19.s19), so it is not explained here.

### L19 screens: rules

**L19.s06** (definition)
> **Teorema lui Bayes pentru ipoteze.** Fie $D$ datele de antrenament și $H$ mulțimea ipotezelor considerate:
> $$P(h|D)=\frac{P(D|h)\,P(h)}{P(D)}$$
> - $P(h)$: probabilitatea **a priori** a ipotezei (cât de plauzibilă e înainte să vedem datele);
> - $P(D|h)$: **verosimilitatea** datelor în ipoteza $h$ (cât de bine o explică);
> - $P(h|D)$: probabilitatea **a posteriori** a ipotezei, după ce am văzut datele;
> - $P(D)$: probabilitatea datelor; nu depinde de $h$.

Footnote: "Cursul: slide 5. Culegerea: p. 363." Builder: ML6:5 labels $P(D|h)$ "the (a posteriori) probability of D given h" (conflict C-2); the screen uses "verosimilitate", which ML6:6 (the name "Maximum Likelihood") and B:366 ("maximizează verosimilitatea") both support. Say nothing about the slide's wording on the main screen; a one-line callout: "Pe unele slide-uri $P(D|h)$ e numit tot "a posteriori"; la test folosește **verosimilitate** pentru $P(D|h)$ și **a posteriori** pentru $P(h|D)$."

**L19.s07** (definition)
> **Ipoteza de verosimilitate maximă (ML):** $h_{ML}=\arg\max_{h_i\in H}P(D|h_i)$. Ipoteza care explică cel mai bine datele.
>
> **Ipoteza de probabilitate maximă a posteriori (MAP):** $h_{MAP}=\arg\max_{h\in H}P(h|D)=\arg\max_{h\in H}P(D|h)\,P(h)$. Ipoteza cea mai probabilă după ce am văzut datele.
>
> **Dacă $P(h_i)=P(h_j)$ pentru toți $i,j$, atunci $h_{MAP}=h_{ML}$.**

Footnote: "Cursul: slide 6. Culegerea: p. 362 (nota 423), p. 363-364." Prediction before the third line: "Ce se întâmplă cu $h_{MAP}$ când toți priorii sunt egali?" Correct: priorul devine un factor constant și iese din argmax: rămâne $\arg\max P(D|h)$, adică $h_{ML}$. Wrong option named: `[priori egali nu mai contează]` is a different misconception, see quiz.

**L19.s08** (proof screens, 3 steps; allocation proof "h_MAP = argmax P(D|h)P(h)"; B:363-364)
> Arată că în $h_{MAP}$ putem înlocui $P(h|D)$ cu $P(D|h)P(h)$.

Steps (predict, then reveal):
1. "Cum scrii $P(h|D)$?" ✓ $\dfrac{P(D|h)P(h)}{P(D)}$ (Bayes). ✗[confuzie cu regula de înmulțire] $P(D|h)P(h)$ fără numitor: that is $P(D\cap h)$, the numerator.
2. "Ce se întâmplă cu $P(D)$ când $h$ variază?" ✓ nu depinde de $h$: este același număr pozitiv pentru toate ipotezele. ✗[P(D)=1] "$P(D)=1$": $D$ e un set de date oarecare, nu evenimentul sigur.
3. Împărțirea tuturor valorilor la același număr pozitiv nu schimbă care valoare e cea mai mare: $\arg\max_h \dfrac{P(D|h)P(h)}{P(D)}=\arg\max_h P(D|h)P(h)$. ∎ "Pentru **ipoteza** MAP nu ai nevoie de $P(D)$; pentru **probabilitatea** ei (cei 21% de la cancer) ai nevoie."

**L19.s09** (prediction; Cn-s5:1 "Remember 1")
> Fie $f:\{10,20,30\}\to\mathbb R$ cu $f(30)=100$, $f(20)=200$, $f(10)=300$. Cât este $\max f(x)$ și cât este $\arg\max f(x)$?

Expected `300` and `10`. Reveal: $\max$ întoarce **valoarea** cea mai mare, $\arg\max$ întoarce **argumentul** pentru care se atinge. $h_{MAP}$ este o ipoteză (argmax), nu un număr: probabilitatea ei este altceva (L19.s08, final line). `[seminar]` Cn-s5:1.

**L19.s10** (prediction, then rule; B:94-99, the part of 0.43 that is not the MLE: the MLE itself is Lecția 18)
> Date: $n=10$ variabile Bernoulli $X_i$, șase egale cu 1 și patru egale cu 0. Estimarea MLE (vezi Lecția 18) este $\hat\theta_{MLE}=6/10=0{,}6$. Acum adăugăm o credință a priori: **moneda este probabil aproape corectă**, descrisă de distribuția $\text{Beta}(3,3)$ cu densitatea $p(\theta)\propto\theta^2(1-\theta)^2$. Estimarea MAP va fi mai mare, egală sau mai mică decât 0,6?

Expected `mai mică`. Reveal: priorul trage estimarea spre 0,5. Rule (definition):
> **Estimarea MAP a unui parametru:** $\hat\theta_{MAP}=\arg\max_{\hat\theta}P(\theta=\hat\theta|X_1,\dots,X_n)=\arg\max_{\hat\theta}L(\hat\theta)\,p(\hat\theta)$, unde $L$ este funcția de verosimilitate (Lecția 18) și $p$ densitatea priorului. Este aceeași idee ca la ipoteze, cu parametrul în rolul ipotezei.

Footnote: "Culegerea: p. 95-96."

**L19.s11-s15** (proof screens: closed form of the MAP for Beta(3,3); 0.43.g, B:99; these five screens ARE the worked solution of 0.43.g, exercise L19.e6 points back here)
> Arată că $\hat\theta_{MAP}=\dfrac{n_1+2}{n_1+n_0+4}$, unde $n_1=\#\{X_i=1\}$, $n_0=\#\{X_i=0\}$.

Steps (predict, then reveal):
- **s11:** "Cum arată $L(\theta)\,p(\theta)$?" ✓ $\theta^{n_1}(1-\theta)^{n_0}\cdot\dfrac{\theta^2(1-\theta)^2}{B(3,3)}=\dfrac{\theta^{n_1+2}(1-\theta)^{n_0+2}}{B(3,3)}$, cu $B(3,3)=1/30$ constantă. ✗[prior pe un singur factor] $\theta^{n_1}(1-\theta)^{n_0+2}$: priorul $\theta^2(1-\theta)^2$ adaugă exponenți **la ambii** factori.
- **s12:** "Ce devine log-verosimilitatea?" ✓ $\ell(\theta)=(n_1+2)\ln\theta+(n_0+2)\ln(1-\theta)-\ln B(3,3)$; ultimul termen e constant, nu contează la maximizare.
- **s13:** "Cât e derivata?" ✓ $\ell'(\theta)=\dfrac{n_1+2}{\theta}-\dfrac{n_0+2}{1-\theta}$. Remark: la MLE derivata era $\frac{n_1}{\theta}-\frac{n_0}{1-\theta}$ (Lecția 18); aici $n_1$ și $n_0$ sunt înlocuite cu $n_1+2$ și $n_0+2$.
- **s14:** "Cum știm că punctul în care $\ell'=0$ e maxim?" ✓ $\ell''(\theta)=-\dfrac{n_1+2}{\theta^2}-\dfrac{n_0+2}{(1-\theta)^2}<0$ pe $(0,1)$: $\ell$ e concavă, același argument ca la MLE (vezi Lecția 18).
- **s15:** Solve $\ell'=0$: $(n_1+2)(1-\theta)=(n_0+2)\theta$, so $\hat\theta_{MAP}=\dfrac{n_1+2}{n_1+n_0+4}$. ∎ Read it: ca MLE-ul pe datele reale plus **patru observații virtuale** (două de 1, două de 0). Pentru datele de la s10: $\dfrac{6+2}{10+4}=\dfrac{8}{14}\approx0{,}571<0{,}6$. `[caiet]` B:99.

**L19.s16** (definition; B:364-365, used in 2.3)
> **Raportul de șanse (odds ratio)** al ipotezelor $h_1,h_2$ după datele $D$: $\dfrac{P(h_1|D)}{P(h_2|D)}=\dfrac{P(D|h_1)P(h_1)}{P(D|h_2)P(h_2)}$ (fără $P(D)$). Logaritmul lui se numește **log-odds**: dacă $\ln\dfrac{P(h_1|D)}{P(h_2|D)}>0$, $h_1$ este mai plauzibilă; valoarea spune și **în ce măsură**. Cu produse foarte mici (ca la zaruri) se compară logaritmii.

Footnote: "Culegerea: p. 364-365."

**L19.s17** (learn + prediction; ML6:8-10)
> **MAP "brute-force"** (ML6:8): se calculează $P(D|h)P(h)$ pentru **toate** ipotezele și se alege maximul. Dezavantaj: trebuie calculate toate probabilitățile.
>
> **Clasificatorul Bayes optimal prin vot** (ML6:9): pentru o instanță nouă $x$ care poate avea clasa $v_j\in V$, clasa cea mai probabilă este
> $$\arg\max_{v_j\in V}\sum_{h_i\in H}P(v_j|h_i)\,P(h_i|D).$$
> **Atenție:** $h_{MAP}(x)$ nu este neapărat clasa cea mai probabilă a lui $x$.

Prediction (example ML6:10): "Avem $P(h_1|D)=0{,}4$, $P(h_2|D)=0{,}3$, $P(h_3|D)=0{,}3$; $h_1(x)=+$, $h_2(x)=-$, $h_3(x)=-$. Ce clasă are $x$ după votul ponderat? Dar după $h_{MAP}$?" Expected `−` (0,6 față de 0,4) and `+` ($h_{MAP}=h_1$). `[slide]` ML6:10.

**L19.s18** (callout, two lines, no prediction)
> **Atenție la nume.** "Clasificatorul Bayes optimal" de pe slide-urile 9-10 este un **vot peste ipoteze**; spune-i mereu cu numele întreg, "prin vot", fiindcă cuvântul "optimal" mai apare la un alt clasificator.
>
> Pe slide-uri mai există clasificatorul Gibbs (alege o ipoteză la întâmplare după $P(h|D)$) și principiul MDL; **nu se cer la test**.

Footnote: "Cursul: slide 11, 25-28." (design section 3: one-screen note.) Builder: the comparison with Bayes Comun is made once, in L20.s08, where both objects are known; this screen does not describe Bayes Comun (it would be a forward use).

### L19 screen: why

**L19.s19** (reflect)
> De ce $h_{ML}$ și $h_{MAP}$ ies diferite la testul pentru cancer, deși ambele pornesc de la același rezultat pozitiv?

Answer: $h_{ML}$ compară doar cât de bine explică fiecare ipoteză rezultatul pozitiv (0,98 față de 0,03: "cancer" explică mai bine). $h_{MAP}$ ține cont și de cât de frecventă este fiecare ipoteză (0,008 față de 0,992). O explicație perfectă pentru o ipoteză foarte rară poate pierde în fața unei explicații mediocre pentru o ipoteză foarte frecventă: produsele sunt 0,0078 și 0,0298. Când priorii sunt egali, frecvența nu mai diferențiază ipotezele, și cele două coincid.

### L19 screens: retrieve (4 items; new numbers, never the cancer test, the die or the coins again)

**L19.q1** Două ipoteze $A$ și $B$ explică datele $D$ cu $P(D|A)=0{,}5$, $P(D|B)=0{,}6$, iar priorii sunt $P(A)=0{,}8$, $P(B)=0{,}2$. Care este $h_{MAP}$? (`[construit]`: $0{,}4$ față de $0{,}12$)
- ✓ $A$: $0{,}5\cdot0{,}8=0{,}40>0{,}6\cdot0{,}2=0{,}12$.
- ✗[MAP confundat cu ML] $B$: este $h_{ML}$ (verosimilitatea mai mare, 0,6); MAP înmulțește și cu priorul.
- ✗[valoarea în loc de argument] "$0{,}40$": e valoarea produsului; $h_{MAP}$ este ipoteza, iar $0{,}40$ nici măcar nu e probabilitatea ei (ar fi $0{,}40/0{,}52\approx0{,}77$).
- ✗[e nevoie de P(D)] "nu se poate decide fără $P(D)$": $P(D)$ e același pentru ambele ipoteze și nu schimbă argmax-ul.

**L19.q2** Aceleași verosimilități, $P(D|A)=0{,}5$ și $P(D|B)=0{,}6$, dar acum priorii sunt egali, $P(A)=P(B)=0{,}5$. Care sunt acum $h_{ML}$ și $h_{MAP}$?
- ✓ Ambele sunt $B$ (priori egali ⇒ $h_{MAP}=h_{ML}$).
- ✗[MAP ≠ ML chiar la priori egali] "$h_{ML}=B$, $h_{MAP}=A$": cu priori egali termenul $P(h)$ e același pentru ambele, deci iese din comparație.
- ✗[MAP alege mereu ipoteza cu prior mai mare] "$h_{MAP}=A$ pentru că a avut prior mai mare înainte": priorii s-au schimbat, nu mai este nimic mai mare.
- ✗[egalitate a produselor] "nu se poate decide, produsele sunt egale": $0{,}25$ față de $0{,}30$, nu sunt egale.

**L19.q3** Trei ipoteze au $P(h_1|D)=0{,}45$, $P(h_2|D)=0{,}35$, $P(h_3|D)=0{,}20$, iar pentru instanța $x$: $h_1(x)=+$, $h_2(x)=-$, $h_3(x)=-$. Ce clasă dă clasificatorul Bayes optimal prin vot? (`[construit]`)
- ✓ `−`: $0{,}35+0{,}20=0{,}55>0{,}45$.
- ✗[votul lui h_MAP] `+`: este clasa dată de $h_{MAP}=h_1$, dar nu este clasa cea mai probabilă; votul adună probabilitățile ipotezelor care o susțin.
- ✗[P(v|h) necunoscut] "nu se poate decide fără $P(v_j|h_i)$": fiecare ipoteză este deterministă, $P(+|h_1)=1$, $P(-|h_1)=0$ etc. (ca la ML6:10), deci toate probabilitățile din sumă se cunosc.

**L19.q4** Date: două aruncări, ambele $X_i=1$ ($n_1=2$, $n_0=0$), prior $\text{Beta}(3,3)$. Cât este $\hat\theta_{MAP}$? (`[construit]`: $4/6$; $\hat\theta_{MLE}=1$)
- ✓ $\dfrac{2+2}{2+4}=\dfrac23$.
- ✗[doar numărătorul] $\dfrac{2+2}{2}=2$: valoare imposibilă pentru o probabilitate; cele 4 observații virtuale se adaugă și la numitor.
- ✗[MAP = MLE] $1$: asta e $\hat\theta_{MLE}$; priorul $\text{Beta}(3,3)$ îl trage spre $0{,}5$.
- ✗[adaugă doar 2 observații] $\dfrac{2+2}{2+2}=1$: priorul adaugă **patru** observații virtuale (două de 1 și două de 0).

### L19 exercises (calculation exercises; each owned only here)

#### L19.e1: ex. 2.1 (B:358-360), `[caiet]`, answer status book

**Enunț (pe ecran):** O anumită boală afectează în medie una din 500 de persoane. O analiză de sânge costă 100 de dolari de persoană; are **sensibilitate** 100% (orice bolnav are testul pozitiv) și **specificitate** 99% (un om care nu are boala are testul pozitiv cu probabilitatea de 1%). **a.** Se testează o persoană aleasă la întâmplare și rezultatul este pozitiv. Care este probabilitatea ca ea să aibă boala? **b.** Un al doilea test costă 10 000 de dolari și are sensibilitate și specificitate 100%. Toate persoanele pozitive la primul test fac și al doilea. Care este costul mediu al testării unui individ? **c.** La ce preț al celui de-al doilea test nu mai este nevoie de primul (adică devine mai ieftin să folosim doar testul al doilea)?

**Fields:** `a` frac `100/599` (≈0.1669, tol ±0.0005); `b` num `219.8` (p: `220`, tol ±0.5); `c` num `101.21` (tol ±0.01; book 101.2125).

**Hints:** 1) Notează $B$ = "are boala", $T_1$ = rezultatul primului test: $P(B)=1/500$, $P(T_1{=}+|B)=1$, $P(T_1{=}+|\bar B)=1/100$. La (a) aplici formula lui Bayes (Lecția 2). 2) Numitorul este $P(T_1{=}+)=1\cdot\frac1{500}+\frac1{100}\cdot\frac{499}{500}=\frac{599}{50000}$. La (b) costul este variabila $C$ cu valorile $c_1$ și $c_1+c_2$; $P(C=c_1+c_2)=P(T_1{=}+)$. 3) $E[C]=c_1+c_2\,P(T_1{=}+)$; la (c) rezolvă $c_n=100+c_n\cdot\frac{599}{50000}$.

**Worked solution (book):** (a) $P(B|T_1{=}+)=\dfrac{1\cdot\frac1{500}}{1\cdot\frac1{500}+\frac1{100}\cdot\frac{499}{500}}=\dfrac{100}{599}\approx0{,}1669$. Observație: $P(\bar B|T_1{=}+)=0{,}8331$; ca să stabilim ipoteza cea mai probabilă era suficient să comparăm cele două produse (sau $P(B|+)$ cu $1/2$): legătura cu MAP. (b) $E[C]=c_1P(T_1{=}-)+(c_1+c_2)P(T_1{=}+)=c_1+c_2P(T_1{=}+)=100+10000\cdot\frac{599}{50000}=219{,}8\approx220$ dolari. (c) $c_n\le100+c_n\cdot0{,}01198$ dă $c_n\approx101{,}2125$: la cel mult 101,21 dolari primul test nu mai e necesar.

**Detectors:** (a) `0.01` or `1/100` → "Aceasta este $P(T_1{=}+|\bar B)$, rata de fals pozitive. Întrebarea cere $P(B|T_1{=}+)$." `1/500` or `0.002` → "Acesta e priorul $P(B)$; după ce aflăm că testul e pozitiv probabilitatea se schimbă." `0.8331` → "Aceasta e $P(\bar B|T_1{=}+)$, cealaltă ipoteză. Cea cerută e $P(B|T_1{=}+)=0{,}1669$." `0.99` or `1` → "Sensibilitatea (100%) și specificitatea (99%) sunt probabilități condiționate de boală, nu probabilitatea bolii după un test pozitiv." (b) `10100` → "Doar persoanele cu primul test pozitiv fac al doilea; costul mediu cântărește $c_1+c_2$ cu $P(T_1{=}+)$." `200` → "Ai folosit $P(T_1{=}+|\bar B)=0{,}01$; probabilitatea unui test pozitiv este $P(T_1{=}+)=0{,}01198$ (formula probabilității totale)." `120` → "Ai folosit priorul $1/500$ în loc de $P(T_1{=}+)$." (c) `100` → "Aceasta este costul primului test; prețul $c_n$ apare în ambii membri ai ecuației $c_n=100+c_n\cdot0{,}01198$, care se rezolvă ca ecuație."

#### L19.e2: ex. 2.2 (B:360-363), "Monty's haunted house", `[caiet]`, answer status book

**Enunț:** Ești blocat în fața unui perete cu trei uși, numerotate 1, 2, 3; ușa către exterior este una singură, celelalte două sunt păzite de câte un monstru. Alegi la întâmplare ușa 1 (probabilitatea a priori ca ea să fie ieșirea: 1/3). Fantoma deschide ușa 2 și arată un monstru. Ea a ales ușa după două principii: **P1.** deschide una dintre celelalte două uși, una în spatele căreia este un monstru; **P2.** dacă ambele uși între care alege au monstru, urmează una dintre variantele: **a.** o alege cu probabilitate 1/2; **b.** alege ușa 2 cu probabilitatea 1; **c.** alege ușa 3 cu probabilitatea 1. $O$ este ușa de ieșire, $G$ este ușa deschisă de fantomă. Pentru fiecare variantă calculați $P(O=1|G=2)$ și $P(O=3|G=2)$ și decideți ce ușă alegi.

**Fields (per variantă a, b, c):** `p1` frac $P(O{=}1|G{=}2)$; `p3` frac $P(O{=}3|G{=}2)$; `ch` choice `ușa 3` / `oricare` / `ușa 1`. Expected: **a** `1/3`, `2/3`, `ușa 3`; **b** `1/2`, `1/2`, `oricare`; **c** `0`, `1`, `ușa 3`.

**Hints:** 1) Folosește Bayes cu probabilitatea totală; priorii sunt egali, $P(O{=}i)=1/3$. Numitorul are trei termeni, dar $P(G{=}2|O{=}2)=0$ (principiul P1: fantoma nu deschide ușa cu ieșirea). 2) Completează tabelul $P(G|O)$: pentru $(G{=}2,O{=}1)$ valoarea este $1/2$ (a), $1$ (b), $0$ (c); pentru $(G{=}2,O{=}3)$ este $1$ în toate variantele. 3) $P(O{=}1|G{=}2)=\dfrac{P(G{=}2|O{=}1)\cdot\frac13}{P(G{=}2|O{=}1)\cdot\frac13+P(G{=}2|O{=}3)\cdot\frac13}$.

**Worked solution (book, p. 361-362):** tabelul $P(G|O)$ (coloane = variantele a, b, c): $(G{=}2,O{=}1)$: $\frac12,\,1,\,0$; $(G{=}3,O{=}1)$: $\frac12,\,0,\,1$; $(G{=}2,O{=}3)$: $1,1,1$; $(G{=}3,O{=}2)$: $1,1,1$; $(G{=}2,O{=}2)=0$, $(G{=}3,O{=}3)=0$. Varianta a: $P(O{=}1|G{=}2)=\dfrac{\frac12\cdot\frac13}{\frac12\cdot\frac13+1\cdot\frac13}=\dfrac13$, $P(O{=}3|G{=}2)=\dfrac23$: alegi ușa 3. Varianta b: $\dfrac{1\cdot\frac13}{1\cdot\frac13+1\cdot\frac13}=\dfrac12$: alegi oricare. Varianta c: $0$ și $1$: ușa 3 este sigur ieșirea. Observație (book): fiindcă priorii sunt egali, ajunge să compari $P(G{=}2|O{=}1)$ cu $P(G{=}2|O{=}3)$, adică primul și penultimul rând din tabel; pentru varianta a, $O=3$ este **ipoteza MAP**. Cu priori egali, ipoteza MAP coincide cu ipoteza ML (B:362, nota 423).

**Detectors:** (a) `1/2` for both → "Aici nu 'au rămas două uși deci 1/2': fantoma a ales ușa 2 după o regulă. Dacă ieșirea ar fi ușa 3, ea nu avea de ales (1); dacă ar fi ușa 1, avea de ales între 2 și 3 (1/2). Rezultatul deschiderii nu e la fel de probabil în cele două cazuri." `1/6` → "Ai uitat numitorul $P(G{=}2)$; fără el nu obții o probabilitate (cele două valori ar trebui să însumeze 1)." (b) `1/3`, `2/3` → "Aceasta e varianta a. În b fantoma alege ușa 2 cu probabilitatea 1 când ambele uși au monstru: probabilitatea observației e aceeași pentru $O=1$ și $O=3$."

#### L19.e3: ex. 2.3 (B:363-365), Mickey și zarul măsluit, `[caiet]`, answer status book

**Enunț:** Mickey dă cu zarul de 10 ori și obține secvența **1, 3, 4, 2, 3, 3, 2, 5, 1, 6**. Se întreabă dacă zarul nu este măsluit (favorizează fața 3). Presupuneți că fiecare set de 100 de zaruri conține 5 zaruri măsluite, cu distribuția fețelor $(1,2,3,4,5,6)$: $P=[0{,}1;\,0{,}1;\,0{,}5;\,0{,}1;\,0{,}1;\,0{,}1]$. $D$ = cele 10 rezultate, $H=\{FD,LD\}$ (zar corect, zar măsluit). **a.** Calculați $P(D|h)P(h)$ pentru fiecare ipoteză. **b.** Care este $h_{MAP}$? **c.** Cât este log-odds $\ln\dfrac{P(LD|D)}{P(FD|D)}$? **d.** Cât este $P(FD|D)$? **e.** Ce ipoteză ar fi câștigat dacă priorii ar fi fost egali?

**Fields:** `a1` num $P(D|FD)P(FD)$ `1.571e-8` (tol 0.5% relativ); `a2` num $P(D|LD)P(LD)$ `6.25e-10` (tol 0.5% relativ); `b` choice `FD` / `LD`; `c` num `-3.2244` (tol ±0.001); `d` num `0.9617` (tol ±0.0005); `e` choice `FD` / `LD` expected `FD`; `e2` num "log-odds cu priori egali" `-0.2799` (tol ±0.002; with $\ln19=2.9444$ rounded you get $-0.2800$).

**Hints:** 1) Aruncările sunt independente: $P(D|h)=\prod_k P(x_k|h)$, fără coeficient multinomial (s-ar simplifica oricum). Priorii: $P(FD)=95/100$, $P(LD)=5/100$. 2) $P(D|FD)=(1/6)^{10}$; $P(D|LD)=(0{,}1)^7(0{,}5)^3$ (șapte fețe cu 0,1, trei de 3 cu 0,5). 3) Compară cu logaritmi: $\ln19-10\ln3=-8{,}0417$ față de $-7\ln5=-11{,}2661$; log-odds este diferența $-11{,}2661-(-8{,}0417)$.

**Worked solution (book, p. 363-365):** $P(D|FD)P(FD)=(1/6)^{10}\cdot\frac{95}{100}=1{,}571\cdot10^{-8}$; $P(D|LD)P(LD)=(1/10)^7(1/2)^3\cdot\frac5{100}=6{,}25\cdot10^{-10}$. Cartea simplifică factorul comun $\frac1{20\cdot2^{10}}$ și compară $\frac{19}{3^{10}}$ cu $\frac1{5^7}$; în logaritmi $-8{,}0417>-11{,}2661$, deci $h_{MAP}=FD$: zarul nu este măsluit. Log-odds $=-11{,}2661-(-8{,}0417)=-3{,}2244<0$ (pozitiv ar însemna că LD este mai plauzibilă). $P(D)=1{,}634\cdot10^{-8}$ (nota 424 a cărții), $P(FD|D)=0{,}9617$, $P(LD|D)=0{,}0383$. **Cu priori egali** $P(D|FD)=1{,}654\cdot10^{-8}$ față de $P(D|LD)=1{,}25\cdot10^{-8}$: tot FD câștigă, pe o diferență mică (log-odds $-0{,}2799$). Priorul $95/5$ lărgește diferența, dar nu este el care decide.

**Detectors:** `b = LD` → "Ai comparat doar $P(D|LD)$ cu $P(D|FD)$ privind cele trei 3-uri? Cu priorul 95/5 și cu verosimilitățile $1{,}65\cdot10^{-8}$ și $1{,}25\cdot10^{-8}$, FD câștigă. Zarul pare măsluit doar dacă ignori că 95% din zaruri sunt corecte." `c = 3.2244` → "Semnul e inversat: $\ln\frac{P(LD|D)}{P(FD|D)}$ este negativ când FD e mai plauzibilă." `a2 = 0.5^3*0.1^7` fără prior (`1.25e-8`) → "Aceasta este verosimilitatea $P(D|LD)$; produsul $P(D|LD)P(LD)$ mai înmulțește cu 5/100." `e = LD` → "Chiar cu priori egali, FD câștigă ($1{,}654\cdot10^{-8}>1{,}25\cdot10^{-8}$): în acest exercițiu priorul nu decide cazul."

**Builder:** P18 1A is the same method with face 2 favoured and `rolls 1,2,4,3,2,2,3,5,1,6` (three 2s): $P(\text{unfair}|D)=0{,}0383$ `[calculat]` (`verified-answers.md`, last row). It is a past-test problem, not an exercise of this lesson; do not add a screen for it. The mock problem 1 and the recap variants can generate "new face and new rolls" from this template.

#### L19.e4: ex. 2.4 (B:365-368), arbori de decizie ML și MAP, answer status: **a ruled**, **b, c, d verified-twice** (cartea dă soluția la toate; ruled = convenția de la egalități)

**Enunț:** Date de antrenament într-un spațiu real unidimensional: 5 puncte cu atributul real $X$: **1,5; 2; 3; 3,5; 3,75**. Clasa 0 este $\{3;\,3{,}5\}$, clasa 1 este $\{1{,}5;\,2;\,3{,}75\}$. Testele au forma $X>t$. $DT^*$ = arborele cu număr minim de noduri care clasifică perfect datele; $DT_2$ = arborele cu un singur nod de test. Dacă două praguri dau același câștig de informație, se alege **cel mai din stânga**. **A.** **a.** Eroarea la antrenare și eroarea CVLOO pentru $DT_2$. **b.** La fel pentru $DT^*$. **B.** Un arbore cu etichete probabiliste are în fiecare frunză $P(Y{=}y)$ = fracția punctelor cu acea etichetă din frunză (fără niciun test: $P(Y{=}1)=3/5$; un test la 2,5: $P(Y{=}1)=1$ dacă $X\le2{,}5$ și $1/3$ altfel). **c.** Arborele ML, $T_{ML}=\arg\max_T P_T(D)$. **d.** Cu priorul $P(T)\propto(1/4)^{\text{splits}(T)^2}$, arborele MAP.

**Fields:**
- **a** (status ruled): `a1` num IG la $X>2.5$ `0.4200` (p: `0.419`, tol ±0.001), `a2` num IG la $X>3.625$ `0.171` (tol ±0.001), `a3` frac eroarea la antrenare a lui $DT_2$ `1/5`, `a4` frac CVLOO a lui $DT_2$ `1/5`.
- **b** `b1` frac antrenare $DT^*$ `0`, `b2` frac CVLOO $DT^*$ `2/5`, `b3` multi "punctele clasificate greșit la CVLOO" `{3.5, 3.75}`.
- **c** `c1` choice "numărul de teste al lui $T_{ML}$" `2`; `c2` num "$P_{T_{ML}}(D)$" `1`.
- **d** `d0` frac $P(T_0|D)$-proporțional (0 teste) `108/3125` (≈0.03456, tol ±0.0001); `d1` frac (1 test) `1/27` (≈0.03704); `d2` frac (2 teste) `1/256` (≈0.00391); `d3` choice arborele MAP `1 test` (la 2,5, cu $P(Y{=}1)=1$ și $1/3$).

**Hints:** 1) Câștigul se calculează cu $H(Y)=H(3/5)$ și entropiile condiționate ale celor două părți (Lecția 8). Pragurile se pun la mijlocul dintre valori vecine de clase diferite. 2) CVLOO: scoți pe rând un punct, rulezi $DT_2$ pe celelalte patru, clasifici punctul scos. La (d) fiecare **punct** contribuie cu un factor $P(Y{=}y_i|X{=}x_i,T)$; priorul $(1/4)^{\text{splits}^2}$ are exponentul pătratul numărului de teste. 3) 0 teste: $(3/5)^3(2/5)^2\cdot(1/4)^0$; 1 test (la 2,5): $1^2\cdot\frac13\cdot(\frac23)^2\cdot\frac14$; 2 teste: $1\cdot(1/4)^4$.

**Worked solution (book, p. 365-368):** (a) $IG(X>2{,}5)=0{,}419$ (valoare exactă $0{,}4200$) și $IG(X>3{,}625)=0{,}171$: $DT_2$ pune testul la 2,5; punctul 3,75 este clasificat greșit: eroarea la antrenare $1/5$. CVLOO: scoțând 1,5 sau 2, pragul rămâne la 2,5 sau 2,25, punctul e clasificat corect; scoțând 3 pragul devine 2,75 (IG $0{,}311$ față de $0{,}122$ pentru 3,625), iar frunza din dreapta are $[1{+},1{-}]$ **egalitate**; scoțând 3,5 pragul rămâne 2,5 cu frunza dreaptă $[1{+},1{-}]$; scoțând 3,75, punctul e greșit. **Convenția cărții:** la egalitate frunza se clasifică cu 0, fiindcă altfel $DT_2$ ar deveni o frunză singură, adică n-ar mai fi un arbore cu un test; deci doar 3,75 e greșit: CVLOO $=1/5$ (cu cealaltă alegere ar fi $3/5$). `ruled`: Culegerea fixează convenția. (b) $DT^*$ are testele $X>2{,}5$ apoi $X>3{,}625$ (la dreapta); eroarea la antrenare 0 (date consistente). CVLOO: 3,5 e greșit (al doilea test cade la 3,375) și 3,75 e greșit (un singur test, la 2,5); $2/5$. (c) $P_T(D)$ este maxim dacă arborele clasifică perfect datele (probabilitate 1 pentru fiecare punct): $T_{ML}$ este $DT^*$ cu etichete probabilistice în frunze, $P(Y{=}1)=1$ la $X\le2{,}5$, $0$ la $2{,}5<X\le3{,}625$, $1$ la $X>3{,}625$. (d) $P(T_j|D)\propto P(D|T_j)P(T_j)$: 0 teste $\frac{3^3\cdot2^2}{5^5}=\frac{108}{3125}=0{,}03456$; 1 test $1\cdot\frac13\cdot\frac49\cdot\frac14=\frac1{27}=0{,}0370$; 2 teste $1\cdot(1/4)^4=\frac1{256}=0{,}0039$. Maximul este la 1 test: $T_{MAP}$ este arborele cu un test la 2,5. **Corectură:** cartea tipărește $0{,}0336$ pentru 0 teste (p. 368 și BS:23); valoarea corectă este $108/3125=0{,}03456$. Concluzia nu se schimbă ($0{,}0370>0{,}0346$), dar marja e mică. $T_{ML}$ este cel mai complex arbore (se potrivește perfect datelor), $T_{MAP}$ cel mai simplu dintre cei buni: priorul penalizează complexitatea. Fără prior, MAP = ML.

**Detectors:** `d0 = 0.0336` → "Aceasta e valoarea tipărită în carte (p. 368), dar este o greșeală de calcul: $3^3\cdot2^2/5^5=108/3125=0{,}03456$." `d2 = 1/16` → "Priorul are exponentul $\text{splits}^2$: pentru 2 teste este $(1/4)^{2^2}=(1/4)^4$, nu $(1/4)^2$." `d3 = 2 teste` → "Arborele cu 2 teste are verosimilitatea cea mai mare (1), dar priorul îl penalizează cu $(1/4)^4$: produsul $1/256$ este cel mai mic. Aceasta este $T_{ML}$, nu $T_{MAP}$." `a4 = 3/5` → "Această valoare apare dacă frunza cu egalitate se clasifică cu 1; Culegerea (p. 366-367) o clasifică cu 0, altfel $DT_2$ n-ar mai avea niciun test." `c2 = 1/4` or any product per leaf → "Verosimilitatea are un factor pe **punct**, nu pe frunză: cinci factori egali cu 1."

#### L19.e5: ex. 0.26 (B:59-61), Mickey cumpără un zar nou, `[caiet]`, answer status book

**Enunț:** Mickey vrea să cumpere un zar nou, dar se teme că și acesta ar putea fi măsluit. Vânzătorul spune că din lot o fracțiune $f$ dintre zaruri sunt măsluite, cu distribuția $P=[0{,}5;\,0{,}1;\,0{,}1;\,0{,}1;\,0{,}1;\,0{,}1]$. Mickey aruncă zarul de $n$ ori și numără de câte ori a căzut **fața 1**: numărul $a$. $S$ = numărul de aruncări la care se obține fața 1; $M$ = "zarul este măsluit". **a.** Distribuția lui $S$ pentru zarul măsluit și pentru zarul corect. **b.** Mediile lui $S$ în cele două cazuri (pentru $n=10$). **c.** Probabilitatea a posteriori $P(M|S{=}a)$ (pentru $n=10$, $a=4$, $f=5\%$). **d.** Câte din cele $n=10$ aruncări trebuie să dea fața 1 ca Mickey să poată afirma că zarul e măsluit cu probabilitate cel puțin $p=95\%$ (pentru $f=5\%$)? **e.** Presupunând zarul măsluit, numărul minim de aruncări pentru a afirma asta, $f=5\%$, $p=95\%$. **f.** Numărul **mediu** de aruncări, aceleași valori. **g.** Aplicație numerică pentru $f\in\{1\%,5\%\}$, $p\in\{50\%,95\%,99\%\}$ (tabel).

**Fields:**
- `a1` choice $S|M$ este binomială $b(n,p)$ cu $p=$ `1/2`; `a2` $S|\neg M$ cu $p=$ `1/6`.
- `b1` num $E[S|M]$ (n=10) `5`; `b2` num $E[S|\neg M]$ `1.667` (frac `5/3`).
- `c` num $P(M|S{=}4)$ cu $n=10$, $f=0{,}05$ `0.1659` (frac `59049/355924`; `[construit]`: instanța numerică e a mea, formula e din carte).
- `d` num cel mai mic $a$ întreg `7` (`[construit]`; formula cărții dă $a\ge6{,}83$; $P(M|S{=}7)=0{,}9613$, $P(M|S{=}6)=0{,}8326$).
- `e` num $n_{min}$ pentru $f=5\%$, $p=95\%$ `5.36` (tol ±0.011; cartea trunchiază); `f` num $n_{med}$ `20.03` (tol ±0.011; valoarea exactă `20.0375`).
- `g1` num $n_{min}$ la $f=1\%$, $p=99\%$ `8.36` (p: `8.37`, tol ±0.011); `g2` num $n_{med}$ la $f=1\%$, $p=99\%$ `31.27`.

**Hints:** 1) $S$ numără câte din $n$ aruncări independente dau fața 1: este binomială; probabilitatea feței 1 este $1/2$ pentru zarul măsluit și $1/6$ pentru cel corect. 2) Bayes: $P(M|S{=}a)=\dfrac{P(S{=}a|M)f}{P(S{=}a|M)f+P(S{=}a|\neg M)(1-f)}$; coeficientul binomial $C_n^a$ se simplifică și rămâne $\dfrac{3^nf}{3^nf+5^{n-a}(1-f)}$. 3) Pentru (e) minimul se atinge când toate aruncările dau 1 ($a=n$): $n\ge\dfrac1{\ln3}\left(\ln\dfrac{1-f}f+\ln\dfrac p{1-p}\right)$; pentru (f) se folosește $a\approx n/2$ și numitorul $\ln\dfrac3{\sqrt5}$.

**Worked solution (book, p. 59-61):** (a) $P(S{=}a|\neg M)=C_n^a(1/6)^a(5/6)^{n-a}$, $P(S{=}a|M)=C_n^a(1/2)^n$ (binomiale). (b) $E[S|\neg M]=n/6$, $E[S|M]=n/2$. (c) $P(M|S{=}a)=\dfrac{3^nf}{3^nf+5^{n-a}(1-f)}$; pentru $n=10$, $a=4$, $f=0{,}05$: $\dfrac{59049\cdot0{,}05}{59049\cdot0{,}05+15625\cdot0{,}95}=0{,}1659$. (d) $P(M|S{=}a)\ge p\Leftrightarrow a\ge n\left(1-\dfrac{\ln3}{\ln5}\right)+\dfrac1{\ln5}\left(\ln\dfrac{1-f}f+\ln\dfrac p{1-p}\right)$; pentru $n=10$, $f=5\%$, $p=95\%$: $a\ge3{,}175+3{,}659=6{,}83$, deci $a\ge7$. Asimptotic $a/n\ge1-\ln3/\ln5\approx0{,}317$: pentru orice $f$, cu $n$ suficient de mare putem testa cu orice precizie. (e) $n_{min}$: $n\ge\frac1{\ln3}\left(\ln\frac{1-f}f+\ln\frac p{1-p}\right)$. (f) $n_{med}\ge\frac1{\ln(3/\sqrt5)}\left(\ln\frac{1-f}f+\ln\frac p{1-p}\right)$. (g) Tabelul cărții: $n_{min}$: $f=5\%$: 2,68 / 5,36 / 6,86; $f=1\%$: 4,18 / 6,86 / 8,36 (pentru $p=50/95/99\%$). $n_{med}$: $f=5\%$: 10,02 / 20,03 / 25,65; $f=1\%$: 15,63 / 25,65 / 31,27.

**Detectors:** `c = 0.7907` → "Ai folosit priorul $1/2$ în loc de $f=0{,}05$: priorul că zarul e măsluit este $f$." `c = 0.2051` → "Aceasta este $P(S{=}4|M)=C_{10}^4/2^{10}$, verosimilitatea, nu probabilitatea a posteriori." `b2 = 1/6` → "Aceasta este probabilitatea feței 1, nu media numărului de 1 din $n=10$ aruncări: $E[S]=np$." `d = 4` → "$a=4$ dă doar $P(M|S{=}4)=0{,}166$; pentru $95\%$ cere mai mult: calculează $P(M|S{=}a)$ pentru $a=6, 7$." `e = 2.68` → "Aceasta este valoarea pentru $p=50\%$; pentru $p=95\%$ termenul $\ln\frac p{1-p}=\ln19$ nu mai e 0."

#### L19.e6: ex. 0.43 f-i (B:94-99), estimarea MAP a lui Bernoulli cu prior Beta(3,3), `[caiet]`, answer status book (the parts a-e, the MLE, are Lecția 18)

**Enunț:** $X_1,\dots,X_n$ i.i.d. Bernoulli($\theta$), cu priorul $\text{Beta}(3,3)$, $p(\theta)=\dfrac{\theta^2(1-\theta)^2}{B(3,3)}$, $B(3,3)=\dfrac1{30}$. **f.** Pentru $n=10$, șase de 1 și patru de 0, cum arată graficul funcției $\hat\theta\mapsto L(\hat\theta)p(\hat\theta)$ și în ce punct își atinge maximul? **g.** Determinați forma analitică a lui $\hat\theta_{MAP}$. Concordă cu graficul? **h.** Comparați estimările MAP și MLE pentru aceleași date; explicați diferența. **i.** Ce se întâmplă cu relația dintre cele două estimări când $n\to\infty$, dacă raportul $\#\{X_i{=}1\}/\#\{X_i{=}0\}$ rămâne constant?

**Proof screens:** (g) is the five-step proof L19.s11-s15 above (this exercise does not repeat it; its solution text says "vezi demonstrația din ecranele de mai sus").

**Fields:** `f` num poziția maximului pe grafic (viz, learner reads or types) `0.571` (tol ±0.01); `g1` choice formula: ✓ $\frac{n_1+2}{n+4}$; ✗[prior doar la numărător] $\frac{n_1+2}{n}$; ✗[prior doar la numitor] $\frac{n_1}{n+4}$; ✗[MLE] $\frac{n_1}{n}$; `g2` frac valoarea pentru $(n_1,n_0)=(6,4)$ `4/7` (≈0.5714; `8/14` accepted); `h1` num $\hat\theta_{MLE}-\hat\theta_{MAP}$ `0.0286` (frac `1/35`, tol ±0.0005); `h2` choice "MAP este mai mic decât MLE pentru că..." ✓ priorul adaugă 2 observații de 1 și 2 de 0, trage spre 0,5; `i1` num $\hat\theta_{MAP}$ pentru $n=100$ (60 de 1, 40 de 0) `0.5962` (frac `31/52`; `[construit]`); `i2` num pentru $n=1000$ (600/400) `0.5996` (frac `301/502`; `[construit]`); `i3` num limita `0.6`.

**Hints:** 1) La (f) maximul funcției $L(\theta)p(\theta)=\theta^{8}(1-\theta)^{6}/B(3,3)$ este atins aproape de mijlocul intervalului, puțin sub 0,6. 2) $\hat\theta_{MAP}$ se citește ca MLE cu 4 observații în plus. 3) La (i) împarte numărătorul și numitorul cu $n$: $\dfrac{n_1/n+2/n}{1+4/n}\to n_1/n$.

**Worked solution (book, p. 99):** (g) $\hat\theta_{MAP}=\dfrac{n_1+2}{n_1+n_0+4}$ (ecranele L19.s11-s15); pentru date: $8/14\approx0{,}571$, în acord cu graficul. (h) MAP este identic cu MLE-ul calculat pe date la care s-au adăugat patru variabile aleatoare virtuale, două de 1 și două de 0; ele împing estimarea spre 0,5 ($8/14\approx0{,}571$), de aceea $\hat\theta_{MAP}<\hat\theta_{MLE}=6/10$. (i) $\hat\theta_{MAP}=\dfrac{n_1+2}{n+4}=\dfrac{n_1/n+2/n}{1+4/n}\to\dfrac{n_1}n=\hat\theta_{MLE}$: influența celor patru observații virtuale dispare; cele două estimări devin egale.

**Detectors:** `g1 = n_1/(n+4)` → "Priorul adaugă 2 observații de 1 și 2 de 0: se adaugă 2 și la numărător, 4 la numitor." `g2 = 3/7` → "$3/7=6/14$ n-are nimic de-a face cu 8/14: numărătorul este $n_1+2=8$." `g2 = 0.6` → "Aceasta este MLE; priorul o mută." `i3 = 0.5` → "Priorul influențează tot mai puțin pe măsură ce datele cresc; limita este raportul din date, $0{,}6$."

#### L19.e7: ex. 2.24 (B:414), trei cutii, answer status verified-twice

**Enunț:** Trei cutii etichetate A, B, C; două sunt goale, una conține un premiu. Alegi la întâmplare cutia $X=A$. Înainte să o deschizi, observi că altcineva a deschis cutia $Y=B$ și e **goală**; ai dreptul să schimbi alegerea. Ți se spune cum a fost aleasă cutia $Y$, una dintre variantele: **a.** dacă $X$ conține premiul, $Y$ este aleasă cu probabilitate 1/2 una dintre cele două cutii goale diferite de $X$; dacă $X$ e goală, $Y$ este cealaltă cutie goală diferită de $X$. **b.** $Y$ este aleasă cu probabilitate 1/2 una dintre cele două cutii diferite de $X$ (poate avea premiul). **c.** $Y$ este aleasă cu probabilitate 1/2 una dintre cutiile **goale** (deci $Y=X$ este posibil). Pentru fiecare variantă decideți ce cutie alegi pentru a-ți maximiza șansele și justificați cu calculul.

**Fields (per variantă):** `pa` frac $P(\text{premiu în }A|\text{observație})$; `pc` frac $P(\text{premiu în }C|\text{observație})$; `ch` choice `C` / `oricare`. Expected: **a** `1/3`, `2/3`, `C`; **b** `1/2`, `1/2`, `oricare`; **c** `1/2`, `1/2`, `oricare`.

**Hints:** 1) Ipotezele sunt: premiul e în A, B sau C, fiecare cu priorul 1/3. Observația este "$Y=B$ și B e goală". 2) Verosimilitatea observației: dacă premiul e în B, observația e imposibilă (0). Pentru A și C calculează cât de probabil era să fie aleasă tocmai B în varianta dată. 3) Variantele a: A: 1/2, C: 1; b: A: 1/2, C: 1/2; c: A: 1/2 (cutiile goale sunt B și C), C: 1/2 (cutiile goale sunt A și B).

**Worked solution `[calculat]` (Culegerea nu dă răspunsul; verificat de două ori):** priorul $P(A)=P(B)=P(C)=1/3$. Verosimilitatea observației în fiecare ipoteză: **a** $A:\frac12$, $B:0$, $C:1$ (dacă $X=A$ e goală, $Y$ trebuie să fie cealaltă cutie goală, B); **b** $A:\frac12$, $B:0$, $C:\frac12$; **c** $A:\frac12$, $B:0$, $C:\frac12$. A posteriori: a $\frac{\frac12\cdot\frac13}{\frac12\cdot\frac13+1\cdot\frac13}=\frac13$ pentru A și $\frac23$ pentru C: alegi C (MAP). b și c: $\frac12$ și $\frac12$: cutiile sunt la fel de bune. Observație: în (a) schimbarea dublează șansa (ca la ușile fantomei, 2.2.a).

**Detectors:** (a) `1/2`, `1/2` → "Dacă X e goală, Y nu are de ales (probabilitate 1); dacă X are premiul, Y alege între B și C (1/2). Observația "Y=B" e deci de două ori mai probabilă dacă premiul e în C." (b) `1/3`, `2/3` → "Aceasta e varianta a; la b alegerea lui Y nu ține cont de unde e premiul, deci observația nu face diferență între A și C."

#### L19.e8 (optional): ex. 2.25 (B:414-415), trei deținuți, answer status verified-twice

**Enunț:** Trei deținuți $a$, $b$, $c$ sunt condamnați la moarte; guvernatorul îl grațiază pe unul, ales uniform. Deținutul $a$ îl roagă pe gardian să-i spună care dintre $b$ sau $c$ va fi executat; gardianul răspunde (fără să mintă, fără să-i spună soarta lui $a$; dacă are de ales între mai multe răspunsuri, alege uniform) că **$b$ va fi executat**. $X$ = deținutul grațiat, $Y$ = deținutul despre care spune gardianul că va muri. **a.** Priorii $P(X{=}\cdot)$; tabelul $P(Y|X)$; calculați $P(X{=}a|Y{=}b)$; a crescut probabilitatea ca $a$ să supraviețuiască? **b.** $a$ îi spune lui $c$ ce a aflat. Calculați $P(X{=}c|Y{=}b)$ și spuneți care dintre $P(X{=}a|Y{=}b)$, $P(X{=}b|Y{=}b)$, $P(X{=}c|Y{=}b)$ e cea mai mare.

**Fields:** `a1` frac $P(Y{=}b|X{=}a)$ `1/2`; `a2` frac $P(Y{=}b|X{=}b)$ `0`; `a3` frac $P(Y{=}b|X{=}c)$ `1`; `a4` frac $P(X{=}a|Y{=}b)$ `1/3`; `a5` tf "a crescut șansa lui $a$?" `nu`; `b1` frac $P(X{=}c|Y{=}b)$ `2/3`; `b2` choice cea mai mare `X=c`.

**Hints:** 1) Dacă a e grațiat, gardianul alege uniform între b și c. Dacă c e grațiat, singurul răspuns posibil este b. 2) $P(X{=}a|Y{=}b)=\dfrac{\frac12\cdot\frac13}{\frac12\cdot\frac13+0+1\cdot\frac13}$. 3) $P(X{=}b|Y{=}b)=0$: gardianul nu-l numește pe cel grațiat.

**Worked solution `[calculat]` (Culegerea nu dă răspunsul; verificat de două ori):** tabelul $P(Y|X)$: $X=a$: $Y=b$ $\frac12$, $Y=c$ $\frac12$; $X=b$: $Y=c$ $1$; $X=c$: $Y=b$ $1$. $P(X{=}a|Y{=}b)=\dfrac{\frac16}{\frac16+\frac13}=\dfrac13$ — egal cu priorul, deci șansa lui $a$ nu a crescut. $P(X{=}c|Y{=}b)=\dfrac{\frac13}{\frac12}=\frac23$: cea mai mare (ipoteza MAP). Aceeași metodă ca la fantoma din 2.2.

**Detectors:** `a4 = 1/2` → "'au rămas doi deținuți, a și c' nu dă 1/2: dacă c e grațiat, gardianul e obligat să spună b; dacă a e grațiat, avea de ales." `a5 = da` → "Probabilitatea posterioară $1/3$ este egală cu cea a priori: informația nu o schimbă pentru $a$, ci pentru $c$."

#### L19.e9 (optional): ex. 2.26 (B:415), adevărat sau fals, answer status ruled

**Enunț:** Fie $D$ un set de date și $H$ o mulțime de ipoteze. Adevărat sau fals: "$\arg\max_{h\in H}P(D|h)$ este ipoteză de probabilitate maximă a posteriori, iar $\arg\max_{h\in H}P(h|D)$ este ipoteză de verosimilitate maximă."

**Field:** `tf` expected `fals`. **Hints:** 1) Care dintre $P(D|h)$ și $P(h|D)$ conține priorul? 2) Scrie definiția lui $h_{MAP}$ cu Bayes. 3) Definițiile sunt inversate.

**Worked solution (reasoned from B:362-364; the book gives no key; answer status ruled):** $h_{ML}=\arg\max P(D|h)$ (nu folosește priorul); $h_{MAP}=\arg\max P(h|D)=\arg\max P(D|h)P(h)$. Afirmația inversează cele două definiții: fals.

**Detector:** `adevărat` → "Verifică: care dintre cele două argmax depinde de priorul $P(h)$? Doar $\arg\max P(h|D)$. Aceea este MAP."

### L19 visual spec: `ml-viz-posterior` ("bare de posterior")

- **Data (selector with two datasets):** (1) **cancer** (ML6:7): hypotheses `cancer` (prior 0,008, $P(+|h)=0{,}98$) and `¬cancer` (prior 0,992, $P(+|h)=0{,}03$). (2) **zaruri** (ex. 2.3): `FD` (prior 0,95, $P(D|h)=1{,}654\cdot10^{-8}$) and `LD` (prior 0,05, $P(D|h)=1{,}25\cdot10^{-8}$), drawn on a log axis (values this small need it); the label under each bar shows the number.
- **Steps (manual advance, prediction first):** (1) prior bars; predict "care ipoteză e mai plauzibilă înainte de date?" (2) verosimilitate bars $P(D|h)$; predict "care explică mai bine datele?" (3) product bars $P(D|h)P(h)$ with the argmax highlighted; predict "ce ipoteză va fi $h_{MAP}$?" (4) normalised posterior bars $P(h|D)$ and the numbers (21%/79% for cancer; 0,0383/0,9617 for dice). A toggle "priori egali" resets the priors to 1/2 and shows the products again: for cancer $h_{MAP}$ flips to `cancer` (= $h_{ML}$); for dice nothing flips (FD still wins).
- **Learner predicts:** the most plausible hypothesis at step 1, the best explanation at step 2, $h_{MAP}$ at step 3, and, after toggling, whether the winner changes (cancer: yes; dice: no).
- **Reduced motion:** bars jump to their final heights; no auto-advance.

### L19 builder notes

- Sources: ML6:4-11, B:358-368, B:414-415, B:59-61, B:93-99, Cn-s5:1-2, BS:19-23, `verified-answers.md` (2.1-2.4, 2.24-2.26 rows), `exbook-ch2-3.md` sections 2, 3, 6.
- **Typo shown corrected:** 2.4: the book prints $P(T_0|D)\propto0{,}0336$ (B:368, BS:23); the value is $108/3125=0{,}03456$ (`verified-answers.md`). The IG $0{,}419$ in the book is $0{,}4200$ to four digits (immaterial; the field accepts both).
- **Conventions on screen:** 2.4.a CVLOO (1/5 vs 3/5, tie leaf → 0, B:366-367); 2.3 log-odds with exact priors-equal value $-0{,}2799$ (rounding $-0{,}2800$); 0.26 table values are truncated in the book (8,36 for 8,3653).
- **0.26 (c) and (d)** use the book's own formulas with an instance I chose (`[construit]`: $n=10$, $a=4$ or the threshold $a\ge7$); parts (e)-(g) are the book's table.
- **Uncertain:** the slide ML6:5 mislabels $P(D|h)$ as "a posteriori" (callout on L19.s06). The ML6:11 Gibbs claim and MDL are on one screen only.
- Repetition check: the cancer example is used for the worked example only; the quiz uses other data; 2.1 and 2.2 are Bayes exercises whose formula comes from L2 (back-link), not re-taught; the Beta(3,3) derivation is in the proof screens once (0.43.g's solution points to it).

---

## Lecția 20 (`ml-l20`): Bayes Naiv și Bayes Comun (Optimal); numărul de parametri

**Priority A.** **Concepts (4):** (1) regula $v_{MAP}=\arg\max P(a_1,\dots,a_n|v)P(v)$ pentru clasificare; (2) Bayes Comun (Optimal, Joint Bayes): estimarea lui $P(a_1,\dots,a_n,v)$; (3) Bayes Naiv: independența condiționată a atributelor față de ieșire, antrenarea = MLE pe fiecare factor; (4) numărul de parametri liberi: NB $2n+1$, Bayes Comun $2^{n+1}-1$. **Prerequisites:** Lecțiile 6, 18, 19 (back-links only).

**Does not teach (owned elsewhere):** conditional independence of variables (L6), the MLE and counts (L18), $h_{MAP}$ (L19), zero counts and add-one (L21), the error rate and duplicated attributes (L22).

### L20 screens: opening question

**L20.s01** (question; data on the same screen)
> Un clasificator are atributele binare $A$, $B$ și clasa $Y$. Datele de antrenament:
>
> | A | B | Y |
> |---|---|---|
> | 0 | 0 | 0 |
> | 0 | 1 | 0 |
> | 1 | 0 | 0 |
> | 1 | 0 | 1 |
> | 0 | 1 | 1 |
> | 1 | 0 | 1 |
>
> Primești instanța $(A=1,\,B=1)$. Nu există niciun rând identic cu ea în tabel. Ce clasă $Y$ prezici?

Choices `Y=0` / `Y=1`. Expected `Y=1` `[construit]`. After the answer: "Fără un rând identic, nu poți căuta instanța. O soluție: te uiți la fiecare atribut separat și combini frecvențele. Cum? Vezi mai jos." Builder: with the NB rule of this lesson the scores are $1/18$ (Y=0) and $1/9$ (Y=1), so $P(Y{=}1|\cdot)=2/3$; the table lookup (Bayes Comun) finds no row at all. This anticipates nothing about zero handling: the zero is L21's.

### L20 screens: worked example (P20 2 = R18 3A, the CMU 2003 midterm table)

**L20.s02** (data + prediction; Bayes Comun by lookup first)
> Șapte exemple cu atributele $x, y, z$ și clasa $U$:
>
> | x | y | z | U |
> |---|---|---|---|
> | 1 | 0 | 0 | 0 |
> | 0 | 1 | 1 | 0 |
> | 0 | 0 | 1 | 0 |
> | 1 | 0 | 0 | 1 |
> | 0 | 0 | 1 | 1 |
> | 0 | 1 | 0 | 1 |
> | 1 | 1 | 0 | 1 |
>
> Instanța de test este $(x=0,\,y=1,\,z=0)$. Câte rânduri din tabel au **exact** aceste valori și ce clasă au?

Expected `1` row (the sixth), class `U=1`. Reveal: dacă te uiți doar la rândurile identice cu instanța, $P(U{=}0|x{=}0,y{=}1,z{=}0)=0$ și $P(U{=}1|\cdot)=1$. Acesta este mecanismul **Bayes Comun**; instanța a apărut o singură dată, deci estimarea se bazează pe un singur rând. `[seminar]` P20 solution p. 6-7.

**L20.s03** (prediction; the NB priors)
> Bayes Naiv nu caută instanța întreagă. Începe cu clasele: cât sunt $P(U{=}0)$ și $P(U{=}1)$, estimate din tabel?

Expected `3/7` and `4/7`. Reveal: relative frequencies (MLE, Lecția 18).

**L20.s04** (prediction; the six factors)
> Pentru fiecare clasă calculăm câte un factor pe atribut, uitându-ne doar la rândurile clasei. Cât este $P(x{=}0|U{=}0)$? Dar $P(y{=}1|U{=}1)$?

Expected `2/3` (rows 2, 3 of the three with $U=0$) and `2/4=1/2`. Reveal the full table of factors: $U=0$: $P(x{=}0|0)=\frac23$, $P(y{=}1|0)=\frac13$, $P(z{=}0|0)=\frac13$; $U=1$: $\frac24$, $\frac24$, $\frac34$. `[seminar]` (P20 2 gives 8/35).

**L20.s05** (prediction; scores, decision, probability)
> Înmulțește: scorul fiecărei clase este $P(U)\cdot P(x|U)\cdot P(y|U)\cdot P(z|U)$. Care clasă câștigă și cu ce probabilitate?

Expected: score $U=0$: $\frac37\cdot\frac23\cdot\frac13\cdot\frac13=\frac2{63}\approx0{,}0317$; score $U=1$: $\frac47\cdot\frac12\cdot\frac12\cdot\frac34=\frac3{28}\approx0{,}1071$; decision `U=1`; $P(U{=}0|x{=}0,y{=}1,z{=}0)=\dfrac{2/63}{2/63+3/28}=\dfrac8{35}\approx0{,}229$. Reveal: the probability of the decision is the normalised score, $\frac{27}{35}\approx0{,}771$ for $U=1$. `[seminar]` (P20: $8/35\approx0{,}229<\frac12\Rightarrow U=1$). Detector: `2/63` as the probability → "Aceasta este scorul (produsul), nu probabilitatea; împarte la suma scorurilor." `4/7` → "Aceasta e priorul $P(U{=}1)$, fără factorii atributelor."

**L20.s06** (prediction; one attribute)
> Același tabel, dar acum folosim **doar** atributul $x$. Instanța este $(x=0)$. Cât este $P(U{=}0|x{=}0)$ cu Bayes Naiv? Dar cu Bayes Comun?

Expected `1/2` and `1/2` (among the four rows with $x=0$: two with $U=0$, two with $U=1$). Reveal: cu un singur atribut nu are ce să factorizeze: cele două clasificatoare dau același număr. `[seminar]` P20: "nu este nicio diferență". Link forward only by name: the difference appears from two attributes up (L20.s10).

### L20 screens: rules

**L20.s07** (definition; ML6:12)
> **Regula MAP pentru clasificare.** Fie atributele $a_1,\dots,a_n$ ale unei instanțe și clasa $v_j\in V$:
> $$v_{MAP}=\arg\max_{v_j\in V}P(v_j|a_1,\dots,a_n)=\arg\max_{v_j\in V}P(a_1,\dots,a_n|v_j)\,P(v_j)$$
> Numitorul $P(a_1,\dots,a_n)$ nu depinde de $v_j$ și se elimină (vezi Lecția 19). Bayes Naiv și Bayes Comun sunt amândouă clasificatoare MAP; diferă prin felul în care estimează $P(a_1,\dots,a_n|v_j)$.

Footnote: "Cursul: slide 12-13. Culegerea: p. 355."

**L20.s08** (definition; ML6:13; names B:370-371)
> **Bayes Comun** (Bayes Optimal, Joint Bayes) estimează direct distribuția comună:
> $$v_{JB}=\arg\max_{v_j\in V}P(a_1,\dots,a_n,v_j)$$
> Antrenare: estimează $P(v_j)$ și $P(a_1,\dots,a_n|v_j)$ din numărători. Nu face nicio presupunere.
>
> De ce două nume: **Comun**, fiindcă lucrează cu distribuția comună a atributelor; **Optimal**, fiindcă nicio altă distribuție probabilistă nu poate da o eroare medie la clasificare mai mică. Pe slide-uri apare "Joint Bayes". În exercițiile care urmează, "Bayes Optimal" înseamnă tot Bayes Comun.

Footnote: "Cursul: slide 13. Culegerea: p. 355 (nota 415), p. 370-371." (Conflict C-5: not the vote of Lecția 19, slides ML6:9-10.)

Prediction after the paragraph (mini-check, not a quiz item): "Este **Bayes Optimal** de aici același obiect cu **clasificatorul Bayes optimal prin vot** din Lecția 19?" Choices `da` / `nu`. Expected `nu`. Reveal: votul din Lecția 19 însumează $P(v_j|h_i)P(h_i|D)$ peste **ipoteze**; Bayes Comun nu are ipoteze de votat, estimează $P(a_1,\dots,a_n,v_j)$ din numărători. Același nume, obiecte diferite. (Named misconception: `[Bayes optimal (vot) = Bayes Comun]`.)

**L20.s09** (definition; ML6:12, 14-15)
> **Bayes Naiv** presupune că atributele sunt **independente condiționat** în raport cu ieșirea:
> $$P(a_1,\dots,a_n|v_j)=\prod_iP(a_i|v_j)\quad\Longrightarrow\quad v_{NB}=\arg\max_{v_j\in V}P(v_j)\prod_iP(a_i|v_j)$$
> Antrenare: se estimează (MLE, ca în Lecția 18) $P(v_j)$ și fiecare $P(a_i|v_j)$. Nu există nicio căutare în spațiul ipotezelor: ipoteza este chiar tabelul acestor probabilități.
>
> **Atenție:** NB **nu** cere ca atributele să fie independente între ele, ci independente **când știm clasa**.

Footnote: "Cursul: slide 12, 14-15. Culegerea: p. 354-355. Seminar 5, p. 3." Builder: the second paragraph is the barem 2021 warning (`tests/2021-2022-partial1-ro/barem.pdf:1`). The property (P0) (if the conditional independence holds, NB and Bayes Comun agree at test; otherwise they may differ) goes on this screen as one line; the quiz item q1 tests the distinction.

**L20.s10** (learn; Cn-s5:4-5, "o altă perspectivă")
> Cele două reguli se pot scrie la fel: $\arg\max_{v_j}P_{NB/JB}(a_1,\dots,a_n,v_j)$. Diferența: NB calculează probabilitatea rândului $(a_1,\dots,a_n,v_j)$ cu distribuția **pe care o presupune** (produsul factorilor), iar Bayes Comun cu distribuția **reală**. Gândește instanța de test ca pe rândurile $(a_1,\dots,a_n,v_1)$, $(a_1,\dots,a_n,v_2)$, ...: calculezi probabilitatea fiecărui rând și întorci clasa celui mai probabil. Dacă independența condiționată se verifică, cele două distribuții coincid și rezultatele de la test coincid.

Footnote: "Seminar 5, p. 4-5; Seminar 6, p. 1."

**L20.s11** (learn + prediction; P1 and P2, B:355-356)
> **Parametri liberi.** Se numără numai parametrii care nu se deduc din alții: dacă ai estimat $P(x)$, $P(\neg x)=1-P(x)$ nu se mai numără. Pentru $n$ atribute binare și clasă binară:
> - **Bayes Naiv:** $2n+1$ parametri (o probabilitate $P(a_i{=}0|v_j)$ pentru fiecare atribut și fiecare dintre cele două clase, plus $P(v)$);
> - **Bayes Comun:** $2^{n+1}-1$ parametri (pentru fiecare clasă, $2^n-1$ valori libere ale lui $P(a_1,\dots,a_n|v_j)$, fiindcă ultima se deduce din suma 1; plus $P(v)$). Cresc **exponențial** cu $n$.
>
> Complexitate NB (cazul Bernoulli): spațiul $O(dK)$, antrenarea $O(dn)$, testarea $O(dK)$, cu $d$ atribute, $K$ clase și $n$ exemple.

Prediction before the formula: "Pentru $n=3$ atribute binare, câți parametri liberi are NB? Dar Bayes Comun?" Correct `7` and `15` (the case $n=2$, 5 and 7, is exercise 2.7.e and 2.29.a-b; it is not pre-solved here). Footnote: "Culegerea: p. 355 (nota 417), p. 375-376." Builder: the derivation per class belongs to the solution of 2.7.e (L20.e3), not repeated here beyond the two lines above; the formulas hold for Bernoulli inputs and output (B:355, nota 417). For categorical attributes see 2.27.b (convention).

**L20.s12-s17** (proof screens; allocation: "derivarea MLE pentru NB cu 9 parametri" and "concavitatea log-verosimilității" = proof 5 of DEM:1, BS:90-93, BS:98; data table 4.2 from Lecția 11, not re-drawn in full)
> Antrenarea lui NB = relative frequencies. Dovedim că aceasta este chiar estimarea MLE, pe datele cu ciuperci din Lecția 11 (tabelul 4.2, rândurile A-H, atributele $X_1$=NotHeavy, $X_2$=Smelly, $X_3$=Spotted, $X_4$=Smooth, clasa $Y$=Edible). Parametrii: $\theta_{j1}=P(X_j{=}1|Y{=}1)$, $\theta_{j0}=P(X_j{=}1|Y{=}0)$ pentru $j=1..4$, și $\theta_y=P(Y{=}1)$: **nouă** parametri.

Steps (predict, then reveal):
- **s12:** "Cât este $P(\text{rândul D}|\theta)$ pentru $D=(0,0,0,1;\,Y{=}0)$?" ✓ $(1-\theta_{10})(1-\theta_{20})(1-\theta_{30})\theta_{40}(1-\theta_y)$. ✗[uită clasa] $(1-\theta_{10})(1-\theta_{20})(1-\theta_{30})\theta_{40}$: factorul $P(Y{=}0)=1-\theta_y$ lipsește. Reveal also row A $=\theta_{11}(1-\theta_{21})(1-\theta_{31})(1-\theta_{41})\theta_y$. `[slide]` BS:91.
- **s13:** "Înmulțind cele 8 rânduri, cu ce exponenți apar $\theta_y$ și $1-\theta_y$?" ✓ $\theta_y^3(1-\theta_y)^5$ (trei rânduri cu $Y{=}1$, cinci cu $Y{=}0$). Reveal $L(\theta)=\theta_{11}^2(1-\theta_{11})\cdot\theta_{10}^3(1-\theta_{10})^2\cdot\theta_{21}(1-\theta_{21})^2\cdot\theta_{20}^2(1-\theta_{20})^3\cdot\theta_{31}(1-\theta_{31})^2\cdot\theta_{30}^2(1-\theta_{30})^3\cdot\theta_{41}(1-\theta_{41})^2\cdot\theta_{40}^3(1-\theta_{40})^2\cdot\theta_y^3(1-\theta_y)^5$. `[slide]` BS:92.
- **s14:** "Ce observi despre $\ell=\ln L$?" ✓ este o **sumă de nouă termeni**, fiecare conținând un singur parametru: $\ell=\sum_k\big(a_k\ln\theta_k+b_k\ln(1-\theta_k)\big)$ (cu $(a,b)$: $\theta_y$: (3,5); $\theta_{11}$: (2,1); $\theta_{10}$: (3,2); $\theta_{21}$: (1,2); $\theta_{20}$: (2,3); $\theta_{31}$: (1,2); $\theta_{30}$: (2,3); $\theta_{41}$: (1,2); $\theta_{40}$: (3,2)). Deci putem maximiza fiecare termen separat.
- **s15:** "Cât este $\partial\ell/\partial\theta_y$ și unde se anulează?" ✓ $\dfrac3{\theta_y}-\dfrac5{1-\theta_y}=0\Leftrightarrow\hat\theta_y=\dfrac38$. În general $\hat\theta_k=\dfrac{a_k}{a_k+b_k}$: de exemplu $\hat\theta_{11}=\frac23$, $\hat\theta_{10}=\frac35$, $\hat\theta_{21}=\frac13$, $\hat\theta_{20}=\frac25$. Acestea sunt exact frecvențele relative. `[slide]` BS:92, BS:90.
- **s16:** "De unde știm că punctul în care derivatele sunt 0 e un maxim, nu un minim?" ✓ matricea hessiană a lui $\ell$ este **diagonală** (fiecare termen depinde de un singur parametru, deci derivatele mixte sunt 0) și elementele ei sunt $-\dfrac{a_k}{\theta_k^2}-\dfrac{b_k}{(1-\theta_k)^2}<0$. (The one-parameter version of this argument is Lecția 18; it is not re-explained.) ✗[hessiana nu e diagonală] "derivatele mixte nu sunt 0": termenii cu parametri diferiți sunt în sume separate.
- **s17:** Conclusion: o matrice diagonală cu toate elementele strict negative este **negativ definită**, deci $\ell$ este **concavă** și punctul stațional este maximul global. Această justificare este cerută la lucrare ("demonstrația 5" a listei de demonstrații). ∎ `[slide]` BS:98; `[seminar]` DEM:1 nota 4.

**Visual note for s12-s17:** the nine $(a_k,b_k)$ pairs fill a small table as the product is collapsed; no new widget.

### L20 screen: why

**L20.s18** (reflect)
> De ce, pe tabelul cu șapte exemple, Bayes Comun și-a sprijinit răspunsul pe un singur rând, iar Bayes Naiv pe toate cele șapte?

Answer: Bayes Comun estimează $P(x,y,z|U)$ numărând rândurile **identice** cu instanța; cu $n$ atribute există $2^n$ combinații, iar datele se împart între ele, deci fiecare combinație are puține rânduri (aici unul) sau niciunul. Bayes Naiv estimează fiecare factor $P(a_i|v_j)$ din toate rândurile clasei care au acea valoare a unui **singur** atribut, deci fiecare număr se sprijină pe multe rânduri. Prețul este presupunerea de independență condiționată: dacă nu se verifică, probabilitățile lui NB pot ieși greșite (ca la 2.7). Builder: an earlier draft asked here why the counts are $2n+1$ and $2^{n+1}-1$, which restated L20.s11; the counts are stated once.

### L20 screens: retrieve (4 items; new numbers)

**L20.q1** Două trăsături ale unui client sunt puternic corelate în tot setul de date, dar, odată ce știi dacă clientul cumpără sau nu ($Y$), ele devin independente. Se poate aplica Bayes Naiv?
- ✓ Da: NB cere independență **condiționată de clasă**, iar aceasta se verifică.
- ✗[NB cere atribute independente] Nu: trăsăturile nu sunt independente. Independența necondiționată nu e cerută; ea poate lipsi complet.
- ✗[NB e inutil când atributele depind] Da, dar rezultatul va fi mereu greșit pentru că trăsăturile depind. Dependența **dată clasa** e cea care strică NB, nu cea din tot setul.

**L20.q2** Un clasificator are 4 atribute binare și o clasă binară. Câți parametri **liberi** estimează Bayes Naiv? Dar Bayes Comun? (`[construit]`)
- ✓ NB $2\cdot4+1=9$; Bayes Comun $2^{5}-1=31$.
- ✗[uită "liberi": numără și complementele] NB $18$ ($P(a_i{=}0|v)$ și $P(a_i{=}1|v)$ pentru toate); complementul $1-P$ se deduce, nu se estimează.
- ✗[uită priorul] NB $8$, Bayes Comun $30$: lipsește $P(v)$.
- ✗[$2^{n+1}$ fără −1] Bayes Comun $32$: pentru fiecare clasă ultima valoare a distribuției se deduce din suma 1.

**L20.q3** Bayes Naiv cu $d=20$ atribute binare, 2 clase și 1000 de exemple de antrenament. În ce constă antrenarea? (`[construit]`)
- ✓ Într-o singură trecere prin date, numărând: pentru fiecare clasă câte exemple are și, pentru fiecare atribut, câte au valoarea 1 (timp $O(dn)$).
- ✗[căutare ca la ID3] "O căutare greedy prin spațiul ipotezelor, ca la ID3": NB nu caută; ipoteza este chiar tabelul probabilităților estimate.
- ✗[toate combinațiile] "Estimarea probabilității fiecăreia dintre cele $2^{20}$ combinații, pentru fiecare clasă": asta ar face Bayes Comun; NB estimează $2\cdot20+1$ numere.

Builder: the one-attribute case (NB = Bayes Comun) is the worked example's L20.s06; it is not asked again.

**L20.q4** NB cu $P(Y{=}1)=P(Y{=}0)=0{,}5$, $P(A{=}1|Y{=}1)=P(A{=}1|Y{=}0)=0{,}5$, $P(B{=}1|Y{=}1)=0{,}8$, $P(B{=}1|Y{=}0)=0{,}3$. Instanța de test este $(A{=}1,B{=}0)$. Ce clasă dă NB? (`[construit]`: scoruri $0{,}05$ pentru $Y{=}1$ și $0{,}175$ pentru $Y{=}0$)
- ✓ $Y=0$: $0{,}5\cdot0{,}5\cdot0{,}7=0{,}175>0{,}5\cdot0{,}5\cdot0{,}2=0{,}05$ (probabilitatea $7/9\approx0{,}78$).
- ✗[valorile atributelor greșite] $Y=1$: ai folosit $P(B{=}1|\cdot)$ (scoruri $0{,}2$ și $0{,}075$), dar instanța are $B=0$, deci factorul este $1-P(B{=}1|\cdot)$.
- ✗[uită atributul] "egalitate, $A$ nu diferențiază clasele": adevărat pentru $A$, dar $B$ le diferențiază: $0{,}2$ față de $0{,}7$.

### L20 exercises (calculation exercises; each owned only here)

#### L20.e1: ex. 2.5 (B:368-370), `[caiet]`, answer status book

**Enunț:** Setul de date cu trei variabile booleene de intrare $a,b,c$ și variabila de ieșire $K$:

| a | b | c | K |
|---|---|---|---|
| 1 | 0 | 1 | 1 |
| 1 | 1 | 1 | 1 |
| 0 | 1 | 1 | 0 |
| 1 | 1 | 0 | 0 |
| 1 | 0 | 1 | 0 |
| 0 | 0 | 0 | 1 |
| 0 | 0 | 0 | 1 |
| 0 | 0 | 1 | 0 |

**a.** Estimați în sensul verosimilității maxime $P(K{=}1|a{=}1,b{=}1)$ și $P(K{=}1|a{=}1,b{=}1,c{=}0)$. **b.** Cum clasifică Bayes Naiv instanța $(a{=}1,b{=}1)$? Dar $(a{=}1,b{=}1,c{=}0)$?

**Fields:** `a1` frac `1/2`; `a2` frac `0`; `b1` num "scorul lui $K{=}0$ pentru $(1,1)$" `1/8`; `b2` num "scorul lui $K{=}1$" `1/16`; `b3` frac $P_{NB}(K{=}0|1,1)$ `2/3`; `b4` choice decizia pentru $(1,1,0)$: `egalitate` (scoruri $1/32$ și $1/32$, probabilitate $1/2$ fiecare).

**Hints:** 1) La (a) te uiți doar la rândurile cu $a=1,b=1$ (rândurile 2 și 4) și numeri câte au $K=1$. 2) La (b) scorul clasei $K=0$ pentru $(a{=}1,b{=}1)$ este $P(K{=}0)P(a{=}1|K{=}0)P(b{=}1|K{=}0)$; clasa $K=0$ are 4 rânduri din 8. 3) $p_0=\frac48\cdot\frac24\cdot\frac24=\frac18$, $p_1=\frac48\cdot\frac24\cdot\frac14=\frac1{16}$; pentru $(1,1,0)$ se adaugă factorii lui $c=0$: $P(c{=}0|K{=}0)=\frac14$, $P(c{=}0|K{=}1)=\frac24$.

**Worked solution (book, p. 368-369):** (a) Două rânduri au $a=1,b=1$ (rândul 2 cu $K=1$, rândul 4 cu $K=0$): $1/2$. Un singur rând are $a=1,b=1,c=0$ (rândul 4, $K=0$): $0$. (b) Pentru $(1,1)$: $p_0=\frac2{4}\cdot\frac24\cdot\frac48=\frac18$, $p_1=\frac24\cdot\frac14\cdot\frac48=\frac1{16}$; $p_0>p_1$: NB prezice $K=0$ cu $P(K{=}0|1,1)=\frac{p_0}{p_0+p_1}=\frac23$. Pentru $(1,1,0)$: $p_0=\frac24\cdot\frac24\cdot\frac14\cdot\frac48=\frac1{32}$, $p_1=\frac24\cdot\frac14\cdot\frac24\cdot\frac48=\frac1{32}$: egalitate, probabilitate $1/2$ fiecare. **Observație (book, p. 369):** estimarea MLE directă dă $P(K{=}1|1,1)=\frac12$, NB dă $\frac13$: cele două estimări ale aceleiași probabilități diferă, fiindcă independența condiționată nu se verifică ($P(a{=}0|K{=}1)=\frac24$, dar $P(a{=}0|b{=}1,K{=}1)=0$). Builder: the stray "Notă" at the end of the solution (B:370) is misplaced (the gap observation concerns the first instance; the second is a tie); do not reproduce it.

**Detectors:** `b3 = 1/3` → "Aceasta este $P_{NB}(K{=}1|1,1)$; ai cerut $K=0$." `a1 = 1/3` → "$1/3$ este ce dă NB pentru $K=1$; estimarea MLE directă numără rândurile cu $a=1,b=1$: unul din două." `b4 = K=1` or `K=0` → "Scorurile sunt egale ($1/32$ și $1/32$): NB nu poate alege după scor; Culegerea spune că probabilitatea este $1/2$ pentru fiecare clasă."

#### L20.e2: ex. 2.6 (B:370-372), `[caiet]`, answer status book

**Enunț:** Distribuția comună $P(x_1,x_2,y)$ a trei variabile booleene:

| $x_1$ | $x_2$ | $y$ | $P(x_1,x_2,y)$ |
|---|---|---|---|
| 0 | 0 | 0 | 0,15 |
| 0 | 0 | 1 | 0,25 |
| 0 | 1 | 0 | 0,05 |
| 0 | 1 | 1 | 0,08 |
| 1 | 0 | 0 | 0,10 |
| 1 | 0 | 1 | 0,02 |
| 1 | 1 | 0 | 0,20 |
| 1 | 1 | 1 | 0,15 |

**a.** Exprimați $P(y{=}0|x_1,x_2)$ cu ajutorul lui $P(x_1,x_2,y{=}0)$ și $P(x_1,x_2,y{=}1)$. **b.** Calculați mărimile de care are nevoie Bayes Naiv: $P(y)$, $P(x_1|y)$, $P(x_2|y)$. **c.** $P(y{=}1|x_1{=}1,x_2{=}0)$ calculată de Bayes Naiv. **d.** Aceeași probabilitate calculată de Bayes Optimal (Comun). **e.** De ce diferă c și d?

**Fields:** `a` choice ✓ $\dfrac{P(x_1,x_2,y{=}0)}{P(x_1,x_2,y{=}0)+P(x_1,x_2,y{=}1)}$; ✗[numitor greșit] $\dfrac{P(x_1,x_2,y{=}0)}{P(y{=}0)}$; `b1` num $P(y{=}1)$ `0.5`; `b2` num $P(x_1{=}0|y{=}0)$ `0.4`; `b3` num $P(x_1{=}0|y{=}1)$ `0.66`; `b4` num $P(x_2{=}0|y{=}0)$ `0.5`; `b5` num $P(x_2{=}0|y{=}1)$ `0.54`; `c` num `0.3796` (tol ±0.0005; exact $153/403$); `d` frac `1/6` (≈0.1667); `e1` num $P(x_1{=}1,x_2{=}0|y{=}1)$ `0.04`; `e2` num $P(x_1{=}1|y{=}1)\cdot P(x_2{=}0|y{=}1)$ `0.1836`.

**Hints:** 1) $P(y)$ și condiționatele NB sunt marginale ale tabelului: $P(y{=}1)=0{,}25+0{,}08+0{,}02+0{,}15=0{,}5$; $P(x_1{=}0|y{=}1)=\dfrac{0{,}25+0{,}08}{0{,}5}$. 2) La (c) scorurile sunt $P(y)P(x_1{=}1|y)P(x_2{=}0|y)$ pentru $y=0,1$. 3) La (d) Bayes Optimal citește direct din tabel: $\dfrac{P(1,0,y{=}1)}{P(1,0,y{=}1)+P(1,0,y{=}0)}=\dfrac{0{,}02}{0{,}02+0{,}10}$.

**Worked solution (book, p. 370-372; BS:42-48):** (b) $P(y{=}0)=P(y{=}1)=0{,}5$; $P(x_1|y{=}0)$: $0{,}4$ ($x_1{=}0$), $0{,}6$; $P(x_1|y{=}1)$: $0{,}66$, $0{,}34$; $P(x_2|y{=}0)$: $0{,}5$, $0{,}5$; $P(x_2|y{=}1)$: $0{,}54$, $0{,}46$. (c) $\dfrac{0{,}34\cdot0{,}54\cdot0{,}5}{0{,}34\cdot0{,}54\cdot0{,}5+0{,}6\cdot0{,}5\cdot0{,}5}\approx0{,}3796$. (d) $\dfrac{0{,}02}{0{,}02+0{,}10}=0{,}1\overline6$. (e) Presupunerea de independență condiționată a lui NB **nu** este adevărată aici: $P(x_1{=}1,x_2{=}0|y{=}1)=\frac{0{,}02}{0{,}5}=0{,}04\neq P(x_1{=}1|y{=}1)P(x_2{=}0|y{=}1)=0{,}34\cdot0{,}54=0{,}1836$ (BS:48 folosește alt martor: $P(x_1{=}0,x_2{=}0|y{=}0)=0{,}3\ne0{,}4\cdot0{,}5=0{,}2$). **Observație:** aici tabelele lui NB sunt marginale ale distribuției date; la ex. 2.10 sensul e invers (NB construiește comuna din independență). Ambele clasificatoare dau aici clasa 0, dar cu probabilități diferite.

**Detectors:** `c = 0.1836` → "Aceasta e $P(x_1{=}1|y{=}1)P(x_2{=}0|y{=}1)$ fără prior și fără normalizare; compară cu celălalt produs." `c = 0.0918` → "Acesta e scorul clasei 1 (cu prior 0,5); împarte la suma scorurilor $0{,}0918+0{,}15$." `d = 0.02` → "Aceasta este $P(x_1{=}1,x_2{=}0,y{=}1)$, numărătorul; împarte la $0{,}02+0{,}10$." `d = 0.3796` → "Aceea e valoarea NB. Bayes Optimal nu folosește produsul de factori."

#### L20.e3: ex. 2.7 (B:372-376), `[caiet]`, answer status book

**Enunț:** Pentru atributele $X_1,X_2$ și clasa $Y$ se observă numărătorile:

| $X_1$ | $X_2$ | $Y$ | nr. apariții |
|---|---|---|---|
| 0 | 0 | 0 | 2 |
| 0 | 0 | 1 | 18 |
| 1 | 0 | 0 | 4 |
| 1 | 0 | 1 | 1 |
| 0 | 1 | 0 | 4 |
| 0 | 1 | 1 | 1 |
| 1 | 1 | 0 | 2 |
| 1 | 1 | 1 | 18 |

Comparăm Bayes Naiv cu Bayes Comun (numit și Bayes Optimal). **a.** Clasificați $X_1{=}0,X_2{=}0$ cu Bayes Naiv. **b.** Cu Bayes Optimal. **c.** Fie $P_{NB}$ și $P_{JB}$ valorile lui $P(Y{=}1|X_1{=}0,X_2{=}0)$. De ce diferă? (Indicație: calculați $P(X_1,X_2|Y)$.) **d.** Ce se întâmplă cu $P_{NB}$ și $P_{JB}$ dacă datele sunt din al doilea tabel (toate combinațiile $(X_1,X_2)$ cu $Y=0$ apar de 3 ori, cu $Y=1$ de 9 ori)? **e.** Câți parametri independenți are fiecare clasificator? Dar în general, cu $n$ variabile binare de intrare?

**Fields:** `a1` frac scorul $Y{=}0$ (NB) `3/50` (=6/100); `a2` frac scorul $Y{=}1$ `19/100`; `a3` choice decizia NB `Y=1`; `b1` frac scorul $Y{=}0$ (JB) `1/25` (=2/50); `b2` frac scorul $Y{=}1$ `9/25` (=18/50); `b3` choice `Y=1`; `c1` frac $P_{NB}$ `19/25` (0.76); `c2` frac $P_{JB}$ `9/10` (0.9); `c3` frac $P(X_1{=}0,X_2{=}0|Y{=}0)$ `1/6` (=2/12); `c4` frac $P(X_1{=}0|Y{=}0)P(X_2{=}0|Y{=}0)$ `1/4`; `d` frac $P_{NB}=P_{JB}$ `3/4`; `e1` num parametri NB `5`; `e2` num JB `7`; `e3` expr NB general `2n+1`; `e4` JB general `2^{n+1}-1`.

**Hints:** 1) Totalul: 12 observații cu $Y=0$, 38 cu $Y=1$, 50 în total. Priorii: $12/50$ și $38/50$. 2) La (a): $P(X_1{=}0|Y{=}0)=\frac6{12}$, $P(X_2{=}0|Y{=}0)=\frac6{12}$; $P(X_1{=}0|Y{=}1)=\frac{19}{38}$, $P(X_2{=}0|Y{=}1)=\frac{19}{38}$. La (b): numărătorile exacte $(0,0)$: 2 și 18. 3) La (e): NB: $P(Y)$, $P(X_1{=}0|Y{=}0)$, $P(X_1{=}0|Y{=}1)$, $P(X_2{=}0|Y{=}0)$, $P(X_2{=}0|Y{=}1)$; Bayes Comun: $P(Y)$ plus, pentru fiecare clasă, 3 valori libere din 4.

**Worked solution (book, p. 372-376; BS:25-36):** (a) $p_0=\frac6{12}\cdot\frac6{12}\cdot\frac{12}{50}=\frac3{50}$, $p_1=\frac{19}{38}\cdot\frac{19}{38}\cdot\frac{38}{50}=\frac{19}{100}$: $p_0<p_1$, NB prezice $Y=1$. (b) $p_0'=\frac2{12}\cdot\frac{12}{50}=\frac2{50}$, $p_1'=\frac{18}{38}\cdot\frac{38}{50}=\frac{18}{50}$: Bayes Optimal prezice tot $Y=1$. (c) $P_{NB}=\frac{19/100}{3/50+19/100}=\frac{19}{25}=0{,}76$; $P_{JB}=\frac{18}{20}=0{,}9$. **Aceeași decizie, probabilități diferite:** independența condiționată nu se verifică: $P(X_1{=}0,X_2{=}0|Y{=}0)=\frac2{12}\neq\frac6{12}\cdot\frac6{12}=\frac14$. (d) Al doilea tabel: $P(Y{=}1)=\frac{36}{48}$; $P_{NB}=P_{JB}=\frac34$; raportul $3:9$ e același în fiecare celulă, deci $P(X_1,X_2|Y)$ este un produs: independența condiționată se verifică și cei doi clasificatori coincid (P0). (e) NB: $5$ parametri; Bayes Optimal: $P(Y)$ și $3+3$ valori libere = $7$. În general $2n+1$ față de $1+2(2^n-1)=2^{n+1}-1$: liniar față de exponențial.

**Detectors:** `c2 = 18/20` accepted (equivalent to 9/10). `e1 = 6` → "NB nu numără complementele: $P(X_1{=}1|Y)=1-P(X_1{=}0|Y)$ se deduce." `e2 = 8` → "Pentru fiecare clasă ultima probabilitate din $P(X_1,X_2|Y)$ se deduce din suma 1: 3 valori libere pe clasă, nu 4." `a3 = Y=0` → "Compară $p_0=0{,}06$ cu $p_1=0{,}19$: câștigă scorul mai mare." `d = 0.76` → "0,76 este $P_{NB}$ din primul tabel; în al doilea tabel independența condiționată se verifică și $P_{NB}=P_{JB}=3/4$."

#### L20.e4: ex. 2.27 (B:416), EnjoyTennis cu Bayes Naiv, answer status **ruled** (a: slide ML6:16; b: convenție; c: calcul lung)

**Enunț:** Setul de date PlayTennis (14 zile, atributul de ieșire EnjoyTennis), tabelul din Lecția 16 (aici compact, același tabel):

| Zi | Outlook | Temperature | Humidity | Wind | EnjoyTennis |
|---|---|---|---|---|---|
| D1 | Sunny | Hot | High | Weak | No |
| D2 | Sunny | Hot | High | Strong | No |
| D3 | Overcast | Hot | High | Weak | Yes |
| D4 | Rain | Mild | High | Weak | Yes |
| D5 | Rain | Cool | Normal | Weak | Yes |
| D6 | Rain | Cool | Normal | Strong | No |
| D7 | Overcast | Cool | Normal | Strong | Yes |
| D8 | Sunny | Mild | High | Weak | No |
| D9 | Sunny | Cool | Normal | Weak | Yes |
| D10 | Rain | Mild | Normal | Weak | Yes |
| D11 | Sunny | Mild | Normal | Strong | Yes |
| D12 | Overcast | Mild | High | Strong | Yes |
| D13 | Overcast | Hot | Normal | Weak | Yes |
| D14 | Rain | Mild | High | Strong | No |

**a.** Decizia lui Bayes Naiv pentru $X=\langle\text{Outlook}=\text{Sunny},\,\text{Temp}=\text{Cool},\,\text{Humidity}=\text{High},\,\text{Wind}=\text{Strong}\rangle$ și probabilitatea cu care e luată. **b.** Numărul minim de parametri pe care îi are de estimat Bayes Naiv pe aceste date? Dar Bayes Optimal? **c.** Calculați eroarea la antrenare și eroarea CVLOO ale lui Bayes Naiv pe acest set.

Builder: back-link line on screen: "Tabelul este cel din Lecția 16 (vezi acolo); aici nu-l mai explicăm, îl folosim." (declared reuse, `allocation.json` `declared_reuse`).

**Fields:**
- `a1` num scorul $No$ `0.0206` (frac `18/875`, tol ±0.0001); `a2` num scorul $Yes$ `0.0053` (frac `1/189`); `a3` choice `No`; `a4` num probabilitatea deciziei `0.7954` (frac `486/611`, tol ±0.0005). `[slide]` ML6:16 prints $0{,}0053$ and $0{,}0206$.
- `b1` num NB `13`; `b2` num Bayes Comun `71` (**convenție**, status ruled: parametri liberi, formula cărții generalizată de noi).
- `c1` frac eroarea la antrenare `1/14`; `c2` multi zilele greșite la antrenare `{D6}`; `c3` frac CVLOO `6/14` (=3/7); `c4` multi zilele greșite la CVLOO `{D1, D4, D6, D8, D11, D14}`.

**Hints:** 1) Priorii: $P(No)=\frac5{14}$, $P(Yes)=\frac9{14}$. Pentru fiecare clasă, numeri doar zilele ei. 2) Factorii: $No$: $P(\text{Sunny}|No)=\frac35$, $P(\text{Cool}|No)=\frac15$, $P(\text{High}|No)=\frac45$, $P(\text{Strong}|No)=\frac35$; $Yes$: $\frac29,\frac39,\frac39,\frac39$. 3) La (b): NB: $P(\text{clasă})$ dă 1 parametru liber; pentru fiecare clasă, fiecare atribut cu $k$ valori dă $k-1$ valori libere: Outlook 2, Temperature 2, Humidity 1, Wind 1, adică 6 pe clasă. Bayes Comun: combinațiile $3\cdot3\cdot2\cdot2=36$, deci 35 valori libere pe clasă.

**Worked solution `[calculat]` (Culegerea nu dă răspunsul; verificat de două ori; (a) coincide cu exemplul din curs ML6:16):** (a) $\text{score}(No)=\frac5{14}\cdot\frac35\cdot\frac15\cdot\frac45\cdot\frac35=\frac{18}{875}\approx0{,}0206$; $\text{score}(Yes)=\frac9{14}\cdot\frac29\cdot\frac13\cdot\frac13\cdot\frac13=\frac1{189}\approx0{,}0053$; NB decide **No**, cu $P(No|X)=\dfrac{18/875}{18/875+1/189}=\dfrac{486}{611}\approx0{,}795$ ($Yes$: $\frac{125}{611}\approx0{,}205$). (b) **Convenție** (parametri liberi, ca la ex. 7.e: complementele nu se numără; cartea dă formule doar pentru atribute Bernoulli): NB $=1+2\cdot(2+2+1+1)=13$; Bayes Optimal $=1+2\cdot(36-1)=71$. Formulele generale: $(K-1)+K\sum_i(|Val(A_i)|-1)$ și $(K-1)+K(\prod_i|Val(A_i)|-1)$. Un alt profesor ar putea număra altfel; formulele pentru atribute Bernoulli ($2n+1$, $2^{n+1}-1$) sunt cele oficiale. (c) Antrenare: NB (fără netezire) greșește doar ziua D6 (prezice Yes, adevărul e No): $1/14\approx7{,}1\%$. CVLOO (mulțimile de valori ale atributelor rămân cele din tot setul; antrenezi pe 13 zile, clasifici ziua scoasă): greșit la D1, D4, D6, D8, D11, D14: $6/14\approx42{,}9\%$. Tabelul scorurilor (calculat de script, `[calculat]`) este afișat în soluție: la D3, D6, D7, D12, D13 scorul lui $No$ e $0$ (valoare nevăzută cu clasa $No$), iar clasificarea este totuși definită; la nicio scoatere nu e egalitate exactă.

**Detectors:** `b1 = 12` → "Ai uitat $P(\text{clasă})$: 1 parametru, plus 6 pe clasă × 2 clase." `b1 = 18` → "Ai numărat complementele; se numără doar parametrii liberi." `b2 = 72` → "$2\cdot36+0$: ultima probabilitate din $P(\cdot|\text{clasă})$ se deduce din suma 1, deci $36-1=35$ pe clasă și 1 pentru priorul claselor: 71." `b2 = 70` → "Lipsește $P(\text{clasă})$." `a3 = Yes` → "Priorul $9/14$ al lui $Yes$ nu compensează factorii: $\frac13\cdot\frac13\cdot\frac13$ la $Yes$ față de $\frac35\cdot\frac15\cdot\frac45\cdot\frac35$ la $No$." `c3 = 1/14` → "Aceea e eroarea la antrenare; la CVLOO ziua scoasă nu face parte din antrenare."

**Builder:** the LOO score table (14 rows, two scores each) is in `verify_bayes.py` output; the solution screen shows it. The long computation is not a time test: the field accepts the answer, the table is the check.

#### L20.e5: ex. 2.28 (B:416), `[calculat]` + `verified-answers.md`, answer status verified-twice

**Enunț:** Setul de date cu atributele de intrare $A,B,C$ și ieșirea $Y$:

| A | B | C | Y |
|---|---|---|---|
| 0 | 0 | 1 | 0 |
| 0 | 1 | 0 | 0 |
| 1 | 1 | 0 | 0 |
| 0 | 0 | 1 | 1 |
| 1 | 1 | 1 | 1 |
| 1 | 0 | 0 | 1 |
| 1 | 1 | 0 | 1 |

Ce răspunde Bayes Naiv pentru $A=0,B=0,C=1$?

**Fields:** `s0` frac scorul $Y{=}0$ `2/63`; `s1` frac scorul $Y{=}1$ `1/28`; `y` choice `Y=1`; `p` num $P(Y{=}1|\cdot)$ `0.5294` (frac `9/17`, tol ±0.0005).

**Hints:** 1) $P(Y{=}0)=\frac37$, $P(Y{=}1)=\frac47$. 2) $Y=0$ (3 rânduri): $P(A{=}0|0)=\frac23$, $P(B{=}0|0)=\frac13$, $P(C{=}1|0)=\frac13$; $Y=1$ (4 rânduri): $\frac14,\frac24,\frac24$. 3) $\frac37\cdot\frac23\cdot\frac13\cdot\frac13=\frac2{63}$, $\frac47\cdot\frac14\cdot\frac12\cdot\frac12=\frac1{28}$.

**Worked solution `[calculat]` (Culegerea nu dă răspunsul; verificat de două ori):** scoruri $\frac2{63}\approx0{,}0317$ și $\frac1{28}\approx0{,}0357$: NB răspunde $Y=1$ cu $P(Y{=}1|\cdot)=\dfrac{1/28}{2/63+1/28}=\dfrac9{17}\approx0{,}529$. Marja este mică: o numărătoare greșită cu un rând schimbă răspunsul. Observație: instanța $(0,0,1)$ apare în tabel o dată cu $Y=0$ și o dată cu $Y=1$; Bayes Comun ar da $\frac12$ pentru fiecare clasă.

**Detectors:** `y = Y=0` → "Verifică factorii: la $Y=1$ ai 4 rânduri, nu 3; $P(A{=}0|Y{=}1)=\frac14$ (un singur rând cu $A=0$ între cele 4)." `p = 8/17` → "Aceasta e probabilitatea clasei 0; $P(Y{=}1|\cdot)=9/17$."

#### L20.e6: ex. 2.29 (B:417), `[calculat]` + `verified-answers.md`, answer status verified-twice (pe baza identică cu P18 1B)

**Enunț:** Setul de date cu atributele de intrare $A,B$ și variabila de ieșire $C$:

| A | B | C | nr. apariții |
|---|---|---|---|
| 0 | 0 | 1 | 3 |
| 0 | 1 | 0 | 1 |
| 0 | 1 | 1 | 4 |
| 1 | 0 | 0 | 5 |
| 1 | 1 | 0 | 2 |
| 1 | 1 | 1 | 1 |

**a.** Numărul minim de probabilități de estimat pentru Bayes Naiv. **b.** La fel pentru Bayes Optimal. **c.** Decizia lui Bayes Naiv pentru $A=0,B=1$ și probabilitatea ei. **d.** Decizia lui Bayes Optimal și probabilitatea ei. **e.** Dacă rezultatele de la c și d diferă (chiar numai ca probabilități), explicați riguros.

**Fields:** `a` num `5`; `b` num `7`; `c1` frac scorul $C{=}0$ `3/128`; `c2` frac scorul $C{=}1$ `35/128`; `c3` choice `C=1`; `c4` num `0.9211` (frac `35/38`); `d1` choice `C=1`; `d2` frac `4/5` (0.8); `e1` frac $P(A{=}0,B{=}1|C{=}0)$ `1/8`; `e2` frac $P(A{=}0|C{=}0)P(B{=}1|C{=}0)$ `3/64`.

**Hints:** 1) Numără apariții, nu rânduri: 16 exemple, 8 cu $C=1$ și 8 cu $C=0$. 2) Factorii NB pentru $A=0,B=1$: $P(A{=}0|C{=}1)=\frac78$, $P(B{=}1|C{=}1)=\frac58$, $P(A{=}0|C{=}0)=\frac18$, $P(B{=}1|C{=}0)=\frac38$. 3) Bayes Optimal: dintre cele 5 exemple cu $(A,B)=(0,1)$, 4 au $C=1$ și 1 are $C=0$.

**Worked solution `[calculat]` (Culegerea nu dă răspunsul; verificat de două ori):** (a) $P(C)$, $P(A|C{=}0)$, $P(A|C{=}1)$, $P(B|C{=}0)$, $P(B|C{=}1)$: **5**. (b) $P(C)$ plus $3+3$ valori libere: **7** (formulele $2n+1$ și $2^{n+1}-1$ cu $n=2$). (c) scoruri $\frac12\cdot\frac78\cdot\frac58=\frac{35}{128}$ ($C{=}1$) și $\frac12\cdot\frac18\cdot\frac38=\frac3{128}$ ($C{=}0$): **$C=1$**, cu probabilitatea $\frac{35}{38}\approx0{,}921$. (d) $C=1$ cu probabilitatea $\frac45=0{,}8$ (4 din cele 5 exemple cu $A{=}0,B{=}1$). (e) Aceeași decizie, probabilități diferite: independența condiționată **nu** se verifică: $P(A{=}0,B{=}1|C{=}0)=\frac18\neq\frac18\cdot\frac38=\frac3{64}$ (și $\frac48\ne\frac78\cdot\frac58$ pentru $C=1$). Decizia coincide doar din întâmplare; (P0) spune că rezultatele coincid când independența se verifică, nu invers. (Pentru o justificare riguroasă e suficient un singur $(a,b,c)$ la care produsul diferă de comună.)

**Detectors:** `a = 6` or `a = 4` → "5 parametri: $P(C)$ și câte un $P(\cdot|C)$ pentru fiecare dintre $A,B$ și fiecare clasă; complementele nu se numără." `c3 = C=0` → "Scorul lui $C=1$ este de aproape 12 ori mai mare: $\frac{35}{128}$ față de $\frac3{128}$." `d2 = 35/38` → "Aceea este probabilitatea NB; Bayes Optimal citește frecvența din rândurile cu $(A,B)=(0,1)$: 4 din 5." Counting: `c4` with 6 rows instead of 16 occurrences → "Ai numărat rândurile tabelului (6), nu apariții (16): fiecare rând contează de atâtea ori cât scrie în coloana nr. apariții."

### L20 visual spec: `ml-viz-nb` (calculatorul Bayes Naiv; shared with L21 and L22, each lesson uses its own modes)

- **Data (selector):** default dataset P20 (seven rows, instance $(x{=}0,y{=}1,z{=}0)$); second dataset 2.7 (counts table, instance $(0,0)$). A slider for the parameter counter: $n=1..10$ binary attributes.
- **Steps (manual advance, prediction first), P20:** (1) "Bayes Comun": highlight the rows identical to the instance (row 6), counter 1 of 1 class U=1; predict the class. (2) NB: class priors appear as bars; predict $P(U{=}1)$. (3) for each class a column of three factor cells; clicking a cell shades the rows of the class it counts over; predict one factor. (4) the product per class with the arithmetic shown; predict which class is larger. (5) normalise: $8/35$ and $27/35$; predict the decision. (6) toggle "numai atributul x": both calculators show $1/2$.
- **Parameter counter:** a second panel with the slider; shows the two numbers $2n+1$ and $2^{n+1}-1$ side by side as bars (for $n=10$: 21 and 2047); predict the value for $n=5$ before it appears (11 and 63; $n=3$ is the prediction on L20.s11, $n=4$ is quiz L20.q2).
- **Learner predicts:** the matching row count, one factor, the larger product, the decision, the parameter counts for a given $n$.
- **Reduced motion:** no sliding; values appear in place; no auto-advance.

### L20 builder notes

- Sources: ML6:12-17, Cn-s5:1-4, BS:25-36 (2.7), BS:42-48 (2.6), BS:88-93, BS:98 (proof), B:354-356, B:368-376, B:416-417, DEM:1 (proof 5), P20 solution p. 6-7 (`tests/2020-2021-partial1/solutii.pdf`), `verified-answers.md` (2.5-2.7, 2.27-2.29, mushrooms), `exbook-ch2-3.md`.
- **Conventions to state on screen:** free parameters (L20.s11, 2.27.b, 2.29.a-b); the tie of scores in 2.5.b (probability 1/2 each).
- **Shown corrected:** none in this lesson (the stray "Notă" of 2.5 at B:370 is omitted, see L20.e1).
- **Declared reuse:** the 14-day table of 2.27 is the table owned by L16 (`allocation.json` `declared_reuse`); the 4.2 mushroom table of the proof screens is owned by L11. Both are shown compactly with a back-link and are not re-explained.
- **Uncertain:** the generalisation of parameter counts to categorical attributes is not in the book (convention, `ruled`). 2.27.c's LOO uses the value sets of the full data, which the readers and `verified-answers.md` agree on (6/14 with the same six days).
- Repetition check: P20's 7-row table is used only on L20.s02-s06; the pretest uses a different 6-row table; 2.7 and 2.29 are two different count tables; the parameter-count formulas are stated once (L20.s11) and the derivations live in the solutions of 2.7.e and 2.29.a-b only as table counts.

---

## Lecția 21 (`ml-l21`): Probabilități zero și regula add-one (Laplace)

**Priority B.** **Concepts (2):** (1) problema probabilităților zero: produs 0, scoruri toate 0, posterior $0/0$; (2) regula add-one a lui Laplace $\dfrac{\text{count}+1}{N+|Val(A)|}$ și estimarea $m$. **Prerequisites:** Lecția 20 (back-link only).

**Does not teach (owned elsewhere):** the NB rule, the factors and the parameter counts (L20); the error rate and duplicated attributes (L22).

**Added 2026-10-29 (teacher list item 23; concept C21.3 in `allocation.json`):** (3) seturi de date nebalansate: priori predefiniți în locul frecvențelor relative. Screen L21.s09a, quiz item L21.q5, field `e` of L21.e1.

### L21 screens: opening question

**L21.s01** (question; data on the same screen)
> Un filtru de spam cu Bayes Naiv a învățat din 10 emailuri spam. Niciunul dintre ele nu conține cuvântul `bonus`. Primești un email care conține `bonus` și, în plus, alte două cuvinte care apar des în emailurile spam. Ce **scor** primește clasa spam pentru acest email?

Choices `0` / `mic, dar pozitiv` / `mare`. Expected `0` `[construit]`. After the answer: "Scorul e un produs de factori. Un singur factor zero anulează tot produsul, oricât de mari ar fi ceilalți. De aici începe lecția."

### L21 screens: worked example (T21T2 7, handwritten solution `solutii.pdf:3-4`)

**L21.s02** (data + prediction)
> Cinci exemple cu atributele $A\in\{0,1,2\}$, $B\in\{0,1\}$ și clasa $Y\in\{0,1,2\}$ (trei valori posibile pentru $A$ și pentru $Y$):
>
> | A | B | Y |
> |---|---|---|
> | 1 | 0 | 0 |
> | 1 | 1 | 1 |
> | 0 | 1 | 1 |
> | 1 | 1 | 2 |
> | 2 | 1 | 2 |
>
> Antrenăm Bayes Naiv **fără** regula lui Laplace. Cât sunt $P(Y{=}0)$, $P(Y{=}1)$, $P(Y{=}2)$?

Expected `1/5`, `2/5`, `2/5` `[seminar]` T21T2 7. Reveal: relative frequencies.

**L21.s03** (prediction; the factors of one class)
> Instanța de test este $(A{=}0,\,B{=}0)$. Pentru clasa $Y=0$ (un singur rând, $(1,0)$): cât sunt $P(A{=}0|Y{=}0)$ și $P(B{=}0|Y{=}0)$?

Expected `0` and `1`. Reveal: în rândul clasei 0, $A$ este 1, niciodată 0; de aceea factorul este 0.

**L21.s04** (prediction; all scores)
> Calculează scorul fiecărei clase pentru $(A{=}0,B{=}0)$: $P(Y)\,P(A{=}0|Y)\,P(B{=}0|Y)$. Apoi probabilitatea clasei $Y=1$: $P(Y{=}1|A{=}0,B{=}0)$.

Expected: all three scores `0` ($Y{=}0$: $P(A{=}0|0)=0$; $Y{=}1$: $P(B{=}0|1)=0$ — în cele două rânduri ale clasei, $B$ e 1; $Y{=}2$: $P(A{=}0|2)=0$); the probability is $\dfrac{0}{0+0+0}$, **nedefinită**. `[seminar]` T21T2 7.c.iii: "0/(0+0+0)". Reveal: nici un rând din tabel nu are $B=0$ la clasele 1 și 2, nici $A=0$ la clasele 0 și 2: fiecare clasă are un factor nul diferit. Nu putem nici decide, nici da probabilitatea.

**L21.s05** (prediction; add-one on the same table)
> Remediul: numărăm cu câte un exemplu virtual în plus pentru fiecare valoare posibilă. Pentru clasa $Y=0$ (1 rând), cât devine $P(A{=}0|Y{=}0)$ dacă adunăm 1 la numărător și numărul de valori ale lui $A$ la numitor?

Expected $\dfrac{0+1}{1+3}=\dfrac14$ ($A$ are 3 valori). Then $P(B{=}0|Y{=}0)=\dfrac{1+1}{1+2}=\dfrac23$ ($B$ are 2 valori). Reveal the table of the smoothed factors: $Y=0$ ($n=1$): $\frac14$, $\frac23$; $Y=1$ ($n=2$): $P(A{=}0)=\frac{1+1}{2+3}=\frac25$, $P(B{=}0)=\frac{0+1}{2+2}=\frac14$; $Y=2$ ($n=2$): $\frac15$, $\frac14$. Priors stay $\frac15,\frac25,\frac25$ (decision 2 of this lesson). `[construit]` (the T21T2 7 solution stops at "ar trebui Laplace").

**L21.s06** (prediction; the decision)
> Cu factorii netezi, care sunt scorurile și ce clasă decide NB?

Expected scores: $Y{=}0$: $\frac15\cdot\frac14\cdot\frac23=\frac1{30}$; $Y{=}1$: $\frac25\cdot\frac25\cdot\frac14=\frac1{25}$; $Y{=}2$: $\frac25\cdot\frac15\cdot\frac14=\frac1{50}$; sum $\frac{14}{150}$; decision `Y=1` with $P(Y{=}1|\cdot)=\dfrac{1/25}{14/150}=\dfrac37\approx0{,}43$ (the others: $\frac5{14}$, $\frac3{14}$). `[construit]` (script `verify_bayes.py`, section L21). Reveal: acum probabilitatea e definită și nu mai există scoruri nule; decizia e luată cu probabilitate mai mică de $1/2$: rezultatul e slab, dar definit.

### L21 screens: rules

**L21.s07** (definition; ML6:18, Cn-s5:5-6)
> **Problema datelor nevăzute.** Dacă nicio instanță de antrenament cu clasa $v_j$ nu are valoarea $a_i$, atunci $\hat P(a_i|v_j)=0$ și $\hat P(v_j)\prod_i\hat P(a_i|v_j)=0$ pentru orice instanță cu $a_i$. Dacă **toate** scorurile unei instanțe sunt 0, probabilitatea ei este $\dfrac{0}{0+\dots+0}$, nedefinită.
>
> **Regula add-one a lui Laplace** (netezire):
> $$\hat P(A_i{=}a_i|V{=}v_j)=\frac{\#(A_i{=}a_i,V{=}v_j)+1}{\#(V{=}v_j)+|Val(A_i)|}$$
> Fără regulă (MLE): $\dfrac{\#(A_i{=}a_i,V{=}v_j)}{\#(V{=}v_j)}$. Pentru atribute binare numitorul primește $+2$.

Footnote: "Cursul: slide 18. Seminar 5, p. 5-6. Culegerea: p. 355, 376-378."

**L21.s08** (learn + prediction; m-estimate, ML6:18, conflict C-14)
> **Estimarea $m$** (forma generală de pe curs): $\hat P(a_i|v_j)=\dfrac{n_c+m\,p}{n+m}$, unde $n$ este numărul de exemple cu $v=v_j$, $n_c$ numărul celor cu $v=v_j$ și $a=a_i$, $p$ o estimare a priori a probabilității (de obicei $\frac1k$ pentru un atribut cu $k$ valori) și $m$ ponderea ei (numărul de exemple "virtuale"). Regula add-one este cazul $m=|Val(A_i)|=k$, $p=\frac1k$: $\dfrac{n_c+1}{n+k}$.

Prediction: "Pentru $n=8$, $n_c=3$, $k=3$: cât dă add-one? Dar estimarea $m$ cu $m=3$, $p=\frac13$?" Correct: both $\frac4{11}$ `[construit]`. Footnote: "Cursul: slide 18."

**L21.s09** (learn; the two conventions that keep the sum at 1 and the absent words)
> **Convenții folosite în lecție.** (1) Netezim **probabilitățile condiționate** $P(a_i|v_j)$; priorii $P(v_j)$ rămân frecvențe relative, dacă enunțul nu spune altfel. (2) Un atribut binar "prezent/absent" contribuie întotdeauna: dacă cuvântul lipsește din email, factorul este $P(\text{cuvânt absent}|v_j)=1-P(\text{cuvânt prezent}|v_j)$; el nu se omite.

Footnote: "Culegerea: p. 376-378 (nota: nu uita $P(\neg\text{free}|\cdot)=1-P(\text{free}|\cdot)$), p. 355 (nota 416: varianta de bază a lui NB, prezență/absență)." Builder: convention (1) is mine (decision 2 above) and agrees with ex. 2.8 and the 0.7586 of ex. 2.30.

**L21.s09a** (definition; added 2026-10-29, teacher list item 23)
> **Seturi de date nebalansate: priori predefiniți.** Priorul învățat, $\hat P(v_j)$, este frecvența relativă a clasei în setul de antrenament. Dacă setul este **nebalansat** (o clasă e mult mai rară decât cealaltă) sau proporțiile lui diferă de cele reale, $\hat P(v_j)$ trage decizia spre clasa frecventă, chiar când factorii $\hat P(a_i|v_j)$ arată spre cealaltă. Remediul: **priori predefiniți**: fixezi $P(v_j)$ după proporțiile reale, egali, sau după costul fiecărei greșeli, și păstrezi factorii învățați. Decizia rămâne $\arg\max_{v_j}P(v_j)\prod_i\hat P(a_i|v_j)$, cu priorii noi; probabilitățile se normalizează ca înainte, deci suma lor rămâne 1.
>
> Cu factorii fixați, decizia între două clase se schimbă la priorul $p$ pentru care $\dfrac{p\,A}{p\,A+(1-p)\,B}=\dfrac12$, unde $A$ și $B$ sunt produsele factorilor celor două clase (ex. 2.8.d).

Footnote: "Culegerea: p. 376-378 (ex. 2.8.a, d)." Builder: ex. 2.8 is the course's only source for this (the filter uses $P(spam)=0{,}1$, not the $\frac23$ of the training data, because the two errors cost differently); Ciortuz's book, slides, Companion, seminar notes and past tests have no separate section on imbalanced data (searched 2026-10-29), so the screen stays at that level: the prior is what changes, the factors stay.

### L21 screen: why

**L21.s10** (reflect)
> De ce adunăm $|Val(A_i)|$ la numitor, nu doar 1 la numărător?

Answer: pentru fiecare valoare a lui $A_i$ adăugăm un exemplu virtual, deci numărul total de exemple crește cu $|Val(A_i)|$. Probabilitățile estimate pentru toate valorile trebuie să rămână cu suma 1: $\sum_a\frac{\#a+1}{N+k}=\frac{N+k}{N+k}=1$. Dacă adunăm 1 doar la numărător, suma devine $\frac{N+k}{N}>1$ (de exemplu $\frac52$ pentru $N=2$, $k=3$), adică nu mai sunt probabilități.

### L21 screens: retrieve (4 items; new numbers)

**L21.q1** Clasa $Y=1$ are 4 exemple și $A$ are 3 valori posibile; valoarea $A=2$ nu apare niciodată cu $Y=1$. Cât este $\hat P(A{=}2|Y{=}1)$ cu regula add-one? (`[construit]`: $\frac17$)
- ✓ $\dfrac{0+1}{4+3}=\dfrac17$.
- ✗[+1 doar la numărător] $\dfrac{0+1}{4}=\dfrac14$: numitorul crește cu numărul de valori, ca suma probabilităților să rămână 1.
- ✗[+1 la numitor în loc de $|Val|$] $\dfrac{0+1}{4+1}=\dfrac15$: se adaugă $|Val(A)|=3$ (la atribute binare, $+2$).
- ✗[MLE] $0$: asta e estimarea fără netezire, exact problema de rezolvat.

**L21.q2** Într-un clasificator de documente, cuvântul `penalty` nu a apărut în niciunul dintre cele 25 de documente de politică. Ce înseamnă estimarea $\hat P(\text{penalty}|\text{politică})=0$?
- ✓ Doar că nu l-am văzut în cele 25 de exemple; estimarea $0$ este prea categorică pentru un eveniment doar posibil.
- ✗[zero numărat = imposibil] Că cuvântul nu poate apărea niciodată într-un document de politică: zero în date nu înseamnă probabilitate 0 reală.
- ✗[se ignoră atributul] Că putem scoate cuvântul din calcul pentru clasa politică: s-ar compara scoruri cu număr diferit de factori; remediul corect este netezirea.

**L21.q3** Un filtru are $\hat P(\text{offer}|\text{spam})=\frac45$ și $\hat P(\text{offer}|\text{regular})=\frac14$. Emailul **nu** conține cuvântul `offer`. Ce factori intră pentru acest cuvânt în scorul fiecărei clase? (`[construit]`)
- ✓ spam $\frac15$, regular $\frac34$ (probabilitatea ca cuvântul să **lipsească**).
- ✗[omite cuvintele absente] niciun factor (1): un cuvânt absent contribuie cu $1-P(\text{prezent}|\text{clasă})$.
- ✗[folosește valorile instanței de antrenament] spam $\frac45$, regular $\frac14$: sunt probabilitățile pentru cuvânt **prezent**; la acest email cuvântul lipsește.

**L21.q4** Estimarea $m$ cu $n=10$ exemple ale clasei, $n_c=0$, $p=0{,}5$ și $m=4$. Cât este $\hat P(a_i|v_j)$? (`[construit]`: $\frac17$)
- ✓ $\dfrac{0+4\cdot0{,}5}{10+4}=\dfrac17$.
- ✗[mp doar la numărător] $\dfrac{0+2}{10}=0{,}2$: ponderea $m$ se adaugă și la numitor (sunt $m$ exemple virtuale).
- ✗[add-one în loc de estimarea m] $\dfrac{0+1}{10+2}=\dfrac1{12}$: add-one e cazul $m=k$, $p=\frac1k$ (aici ar fi $m=2$); enunțul dă $m=4$.
- ✗[MLE] $0$: asta e estimarea fără netezire, exact problema de rezolvat.

**L21.q5** (added 2026-10-29, teacher list item 23; `[construit]`) Un set de antrenament are 5 exemple pozitive și 95 negative. Bayes Naiv a învățat $\hat P(A{=}1|+)=0{,}8$ și $\hat P(A{=}1|-)=0{,}1$. Pentru instanța $A=1$, cu priorii din numărători ($0{,}05$ și $0{,}95$), scorurile sunt $0{,}04$ și $0{,}095$, deci NB prezice $-$, cu $P(+|A{=}1)=\frac8{27}\approx0{,}30$. În realitate cele două clase sunt la fel de frecvente, așa că fixăm priorii la $0{,}5$ și $0{,}5$. Ce se întâmplă? (formulas: `0.05*0.8`, `0.95*0.1`, `0.05*0.8/(0.05*0.8+0.95*0.1)` = 8/27; `0.5*0.8`, `0.5*0.1`, `0.5*0.8/(0.5*0.8+0.5*0.1)` = 8/9)
- ✓ Factorii rămân $0{,}8$ și $0{,}1$; scorurile devin $0{,}40$ și $0{,}05$, iar NB prezice $+$, cu $P(+|A{=}1)=\frac89\approx0{,}89$.
- ✗[factorii se reestimează] Trebuie reestimați și factorii $\hat P(A|v)$, altfel priorii noi nu schimbă nimic: factorii sunt condiționați de clasă și nu depind de câte exemple are fiecare clasă; se schimbă doar $P(v)$, iar scorurile se schimbă odată cu el.
- ✗[priorul trebuie să fie frecvența] Nu e voie: priorii trebuie să rămână frecvențele din antrenament, altfel probabilitățile nu mai au suma 1: după normalizare suma este 1 cu orice priori care au suma 1 ($\frac89+\frac19=1$).
- ✗[decizia nu se schimbă] Decizia rămâne $-$, fiindcă datele nu s-au schimbat: decizia compară produsele prior · factor; cu $0{,}5$ scorul clasei $+$ ($0{,}40$) îl depășește pe al clasei $-$ ($0{,}05$).

Builder: "all scores 0 ⇒ the probability is $0/0$" is the worked example (L21.s04) and exercise 2.31; it is not asked again. The pretest's 10 spam emails are not reused in q2.

### L21 exercises (calculation exercises; each owned only here)

#### L21.e1: ex. 2.8 (B:376-378), spam cu add-one, `[caiet]`, answer status book

**Enunț:** Aproximativ 2/3 din emailurile pe care le primești sunt spam; folosești un filtru open-source cu un clasificator Bayes Naiv. Emailurile de antrenament au trei atribute binare (conține sau nu cuvintele `study`, `free`, `money`):

| study | free | money | Categorie | nr. emailuri |
|---|---|---|---|---|
| 1 | 0 | 0 | Regular | 1 |
| 0 | 0 | 1 | Regular | 1 |
| 1 | 0 | 0 | Regular | 1 |
| 1 | 1 | 0 | Regular | 1 |
| 0 | 1 | 0 | Spam | 4 |
| 0 | 1 | 1 | Spam | 4 |

**a.** Filtrul folosește priorul $P(Spam)=0{,}1$; explicați pe scurt de ce este rezonabil. **b.** Calculați parametrii lui NB cu **netezire add-one** (regula lui Laplace): $P(study|spam)$, $P(study|regular)$, $P(free|spam)$, $P(free|regular)$, $P(money|spam)$, $P(money|regular)$. **c.** Calculați $P(spam|s)$ pentru mesajul $s$ = "money for psychology study". **d.** Ce prior $P(spam)$ face ca $P(spam|s)=0{,}5$?

**Screen for (a)** (reflect, model answer): la antrenare $P(Spam)=\frac{8}{12}=\frac23$ (MLE), dar filtrul folosește $0{,}1$ fiindcă e preferabil să treacă prin filtru un email spam decât să fie marcat ca spam un email obișnuit (care nu ajunge în Inbox): priorul codifică costul asimetric al erorilor. `[caiet]` B:377.

**Fields:** `b1` frac $P(study|spam)$ `1/10`; `b2` frac $P(study|regular)$ `2/3`; `b3` frac $P(free|spam)$ `9/10`; `b4` frac $P(free|regular)$ `1/3`; `b5` frac $P(money|spam)$ `1/2`; `b6` frac $P(money|regular)$ `1/3`; `c0` choice vectorul lui $s$ `(study=1, free=0, money=1)`; `c1` num `0.0037` (frac `3/803`, tol ±0.0001); `d` frac `800/827` (≈0.9673, tol ±0.0005).

**Hints:** 1) Numitorii: 8 emailuri spam, 4 regular; $\frac{\text{count}+1}{N+2}$ (atribute binare). 2) Mesajul $s$ are `study` și `money`, nu are `free`: factorul pentru `free` este $1-P(free|\cdot)$; "for" și "psychology" nu sunt atribute. 3) $P(study,\neg free,money|spam)=\frac1{10}\cdot\frac1{10}\cdot\frac12=\frac1{200}$ (cu $1-\frac9{10}=\frac1{10}$); pentru regular $\frac23\cdot\frac23\cdot\frac13=\frac4{27}$.

**Worked solution (book, p. 376-378):** (b) fără netezire: $\frac08$, $\frac34$, $\frac88$, $\frac14$, $\frac48$, $\frac14$; cu add-one $\frac{c+1}{N+2}$ ($+2$ = numărul de valori ale fiecărui atribut): $\frac1{10}$, $\frac23$, $\frac9{10}$, $\frac13$, $\frac12$, $\frac13$. (c) $P(spam|s)=\dfrac{\frac1{200}\cdot\frac1{10}}{\frac1{200}\cdot\frac1{10}+\frac4{27}\cdot\frac9{10}}=\dfrac3{803}\approx0{,}0037$ (probabilitate mică; fără regula Laplace ar fi fost $0$, fiindcă niciun email spam nu conține `study`). (d) $\dfrac{\frac p{200}}{\frac p{200}+\frac{4(1-p)}{27}}=\frac12\Leftrightarrow27p=800(1-p)\Leftrightarrow p=\dfrac{800}{827}\approx0{,}9673$.

**Detectors:** `c1 = 0.2` or any value > 0.1 → "Verifică factorul pentru `free`: mesajul **nu** conține `free`; factorul este $1-P(free|\cdot)$, adică $\frac1{10}$ pentru spam și $\frac23$ pentru regular." `b1 = 0` → "Asta e estimarea fără netezire ($\frac08$); cu add-one: $\frac{0+1}{8+2}$." `b1 = 1/9` or `1/8` → "Numitorul este $8+2$ (două valori pentru un atribut binar), nu $8+1$." `d = 0.5` → "Aceea e valoarea cerută pentru $P(spam|s)$; întrebarea cere priorul $p$ care o produce."

**Added field (2026-10-29, teacher list item 23; `[construit]`, verified-twice):** `e` frac "Cu priorul din numărătorile setului de antrenament, $P(spam)=\frac8{12}=\frac23$, și aceiași factori netezi, cât ar fi $P(spam|s)$?" `27/427` (≈0.0632, tol ±0.0005; formula `2/3*(1/10*1/10*1/2)/(2/3*(1/10*1/10*1/2)+1/3*(2/3*2/3*1/3))`). Solution line: $\dfrac{\frac23\cdot\frac1{200}}{\frac23\cdot\frac1{200}+\frac13\cdot\frac4{27}}=\dfrac{27}{427}\approx0{,}063$; cu priorul predefinit $0{,}1$ (partea c) scade la $\frac3{803}\approx0{,}0037$. Factorii sunt aceiași; se schimbă doar priorul. Mesajul rămâne regular în ambele cazuri; decizia s-ar schimba abia la $P(spam)=\frac{800}{827}$ (partea d). Detector: `e` = `3/803` → "Aceasta e valoarea cu priorul predefinit $0{,}1$ (partea c); aici priorul este $\frac23$."

#### L21.e2: ex. 2.30 (B:417), clasificare de texte, answer status **ruled** (convenția priorilor și a netezirii nu e în enunț)

**Enunț:** Firma Whizzco clasifică documente în clasele **sport** și **politică**. Fiecare document este un vector de prezență (1) / absență (0) pentru cuvintele-cheie: `goal, football, golf, defence, offence, wicket, office, strategy`. Datele de antrenament (fiecare rând = un document):

`xP` (politică, 6 documente): `[1 0 1 1 1 0 1 1]`, `[0 0 0 1 0 0 1 1]`, `[1 0 0 1 1 0 1 0]`, `[0 1 0 0 1 1 0 1]`, `[0 0 0 1 1 0 1 1]`, `[0 0 0 1 1 0 0 1]`.
`xS` (sport, 7 documente): `[1 1 0 0 0 0 0 0]`, `[0 0 1 0 0 0 0 0]`, `[1 1 0 1 0 0 0 0]`, `[1 1 0 1 0 0 0 1]`, `[1 1 0 1 1 0 0 0]`, `[0 0 0 1 0 1 0 0]`, `[1 1 1 1 1 0 1 0]`.

Cu Bayes Naiv, care este probabilitatea ca documentul $x=(1,0,0,1,1,1,1,0)$ să fie clasificat ca aparținând clasei **politică**?

**Convention screen (before the fields):** "Enunțul nu spune cum se iau priorii și dacă se folosește netezirea. Lucrăm cu **priorii din numărători** ($\frac6{13}$, $\frac7{13}$) și **fără netezire**, forma de bază a lui NB; apoi comparăm cu celelalte două lecturi."

**Fields:** `p1` frac $P(politică)$ `6/13`; `s_pol` num scorul politică `0.001374` (tol ±0.00001; exact $625/454896$); `s_sp` num scorul sport `0.000280` (tol ±0.000001; exact $3000/10706059$); `r0` num $P(politică|x)$ (priori din numărători, fără netezire) `0.8306` (tol ±0.0005); `r1` num cu add-one `0.7586` (tol ±0.0005); `r2` num cu priori egali, fără netezire `0.8512` (tol ±0.0005).

**Hints:** 1) Pentru fiecare cuvânt, factorul este probabilitatea valorii **din $x$**: pentru cuvintele prezente $P(\text{cuvânt}|\text{clasă})$, pentru cele absente $1-P(\text{cuvânt}|\text{clasă})$. 2) Politică: goal $\frac13$, football absent $\frac56$, golf absent $\frac56$, defence $\frac56$, offence $\frac56$, wicket $\frac16$, office $\frac23$, strategy absent $\frac16$. Sport: goal $\frac57$, football absent $\frac27$, golf absent $\frac57$, defence $\frac57$, offence $\frac27$, wicket $\frac17$, office $\frac17$, strategy absent $\frac67$. 3) $\text{score}=P(\text{clasă})\prod(\text{factori})$, apoi normalizezi.

**Worked solution `[calculat]` (Culegerea nu dă răspunsul; verificat de două ori; convenție `ruled`):** scorul politică $\frac6{13}\cdot\frac13\cdot\frac56\cdot\frac56\cdot\frac56\cdot\frac56\cdot\frac16\cdot\frac23\cdot\frac16=\frac{625}{454896}\approx1{,}374\cdot10^{-3}$, scorul sport $\approx2{,}80\cdot10^{-4}$; $P(politică|x)=\frac{4117715}{4957523}\approx0{,}8306$, documentul e clasificat **politică**. Cu **add-one** ($\frac{c+1}{n+2}$ pe cuvinte, priorii tot $\frac6{13},\frac7{13}$): $0{,}7586$. Cu **priori egali** și fără netezire: $0{,}8512$. Cuvintele absente se iau în calcul cu $1-P(\text{cuvânt}|\text{clasă})$; dacă ai lua doar cuvintele prezente ai obține $0{,}881$, o lectură greșită. Nu apare niciun factor zero la această instanță; dacă ar apărea, ex. 2.8 oferă remediul.

**Detectors:** `r0 = 0.881` → "Ai omis factorii cuvintelor **absente** (football, golf, strategy). Un cuvânt absent contribuie cu $1-P(\text{cuvânt}|\text{clasă})$." `r0 = 0.8512` → "Aceasta e valoarea cu priori egali ($\frac12,\frac12$); priorii din numărători sunt $\frac6{13}$ și $\frac7{13}$. Enunțul nu precizează; lectura de bază folosește numărătorile." `r0 = 0.7586` → "Aceea e cu add-one; fără netezire, factorii sunt frecvențe simple."

#### L21.e3: ex. 2.31 (B:418), valori lipsă și remediul standard, `[calculat]`, answer status verified-twice

**Enunț:** Date de antrenament $(x,y)$ cu 7 atribute binare $A_1,\dots,A_7$ și date de test $z$:
$x_1=(0,0,0,1,0,0,1)$, $y_1=1$; $x_2=(0,0,1,1,0,0,0)$, $y_2=1$; $x_3=(1,1,0,0,0,1,0)$, $y_3=-1$; $x_4=(1,0,0,0,1,1,0)$, $y_4=-1$; $z_1=(1,0,0,0,0,1,0)$; $z_2=(0,1,1,0,0,1,1)$. **a.** Ce problemă va întâmpina Bayes Naiv pe aceste date? (Estimați toți parametrii și aplicați algoritmul pe cele două instanțe de test.) **b.** La curs am prezentat un remediu standard: spuneți cum se numește și aplicați-l; apoi clasificați $z_1$ și $z_2$.

**Fields:** `a1` choice cu estimările fără netezire problema apare la: `z2` (scoruri 0 și 0, deci $0/0$) / `z1` / `ambele` / `niciuna`; `a2` choice decizia pentru $z_1$ fără netezire `y=-1` (scoruri $\frac18$ și $0$); `b1` choice numele remediului `regula add-one a lui Laplace`; `b2` frac $P(A_1{=}1|y{=}1)$ cu add-one `1/4`; `b3` frac $P(A_4{=}1|y{=}1)$ cu add-one `3/4`; `b4` choice decizia pentru $z_1$ `y=-1`; `b5` frac $P(y{=}-1|z_1)$ `27/28` (≈0.9643); `b6` choice $z_2$ după add-one `egalitate (1/2 fiecare)`.

**Hints:** 1) Fiecare clasă are 2 exemple: $P(A_i{=}1|y)=\frac{\text{count}}2$ înainte de netezire: pentru $y=1$ obții $0,0,\frac12,1,0,0,\frac12$; pentru $y=-1$: $1,\frac12,0,0,\frac12,1,0$. 2) $z_2$ are $A_2=1$ (imposibil pentru $y=1$: $P(A_2{=}1|1)=0$) și $A_3=1$ (imposibil pentru $y=-1$). 3) Cu add-one $\frac{c+1}{2+2}$: $y=1$: $\frac14,\frac14,\frac12,\frac34,\frac14,\frac14,\frac12$; $y=-1$: $\frac34,\frac12,\frac14,\frac14,\frac12,\frac34,\frac14$; priorii $\frac12,\frac12$.

**Worked solution `[calculat]` (Culegerea nu dă răspunsul; verificat de două ori):** (a) Fără netezire: la $z_1$ scorul clasei $-1$ este $\frac12\cdot1\cdot\frac12\cdot1\cdot1\cdot\frac12\cdot1\cdot1=\frac18$ și al clasei $+1$ este $0$: $z_1\to-1$, fără probleme. La $z_2$ clasa $+1$ ia $0$ (din $P(A_2{=}1|{+}1)=0$) și clasa $-1$ ia $0$ (din $P(A_3{=}1|{-}1)=0$): $0/0$, nedefinit. **Problema:** valori de atribut care nu apar niciodată cu o clasă în datele de antrenament, deci un factor 0 anulează produsul. Problema se vede **doar** la $z_2$: cine testează doar $z_1$ nu observă nimic. (b) Remediul: regula add-one (Laplace), $\frac{c+1}{N_{clasă}+2}$ ($+2$ = numărul de valori ale unui atribut binar). După netezire: $z_1$: scorul clasei $-1$ este $\frac{243}{8192}$, al clasei $+1$ este $\frac9{8192}$: **$-1$**, cu $P(y{=}-1|z_1)=\frac{27}{28}\approx0{,}964$; $z_2$: ambele $\frac9{8192}$: **egalitate exactă** ($\frac12$ fiecare); un clasificator are nevoie de o regulă de egalitate.

**Detectors:** `a1 = z1` or `ambele` → "La $z_1$ scorul lui $-1$ este $\frac18>0$ și al lui $+1$ este 0; decizia e clară. Doar $z_2$ are toate scorurile 0." `b6 = y=1` or `y=-1` → "Cu add-one scorurile sunt egale ($\frac9{8192}$ ambele); decizia depinde de regula de egalitate, probabilitatea este $\frac12$." `b2 = 0` → "Fără netezire e $0$; cu add-one $\frac{0+1}{2+2}=\frac14$."

### L21 visual spec: `ml-viz-nb` with the add-one switch (same widget as L20)

- **Data:** the five rows of T21T2 7 (A with three values, B with two, Y with three), instance $(A{=}0,B{=}0)$; second dataset ex. 2.8 (spam, instance $(1,0,1)$).
- **Steps (manual advance, prediction first):** (1) the calculator with the add-one switch OFF: predict the score of each class (all 0). (2) the posterior row shows `0/0` in a warning style, with the text "nedefinit". (3) switch ON: the denominators show $N+|Val|$ next to each factor (with the value counts of A and B); predict $\hat P(A{=}0|Y{=}0)$. (4) the scores become positive; predict the decision; show the probabilities $\frac5{14},\frac37,\frac3{14}$. (5) a second panel: the sum of the three smoothed probabilities of $A$ given $Y{=}1$ ($\frac25+\frac25+\frac15=1$), and the numerator-only variant ($1+1+\frac12=\frac52$) turning red.
- **Learner predicts:** the scores with the switch off, one smoothed factor, the decision after smoothing.
- **Reduced motion:** the switch changes values in place, no sliding.

### L21 builder notes

- Sources: ML6:18, Cn-s5:5-6, B:355 (nota 416), B:376-378, B:417-418, T21T2 7 (`solutii.pdf:3-4`), `verified-answers.md` (2.8, 2.30, 2.31, T21T2 7), `exbook-ch2-3.md` sections 4.
- **Computed by me, not in a source:** L21.s05-s06 (add-one on the T21T2 7 table: decision $Y=1$, probability $\frac37$); the sum-to-1 check; the $m$-estimate example. Each is recomputed by `verify_bayes.py` (section L21).
- **Conventions on screen:** priors not smoothed (L21.s09); 2.30's three conventions (0.8306 / 0.7586 / 0.8512); the tie in 2.31.z2.
- **The m-estimate** appears on one screen only (ML6:18); the exam form is add-one (C-14).
- Repetition check: the five-row table is used on L21.s02-s06 only; 2.8 is the only spam example; "NB rule and factors" are not re-taught (back-link to L20).
- Added 2026-10-29 (teacher list item 23): L21.s09a, L21.q5 and field `e` of 2.8. The q5 numbers (5 / 95, factors 0,8 and 0,1) are constructed and appear nowhere else; the cost argument of 2.8.a stays on 2.8's own screen.

---

## Lecția 22 (`ml-l22`): Bayes Naiv în practică: rata erorii, xor, atribute duplicate, New-Bayes

**Priority B.** **Concepts (4):** (1) rata medie a erorii calculată față de distribuția adevărată și cele două surse de eroare (P3); (2) Bayes Naiv pe xor, ID3 față de Bayes Naiv (P4, P5, P7); (3) atribute duplicate: acuratețea NB scade, Bayes Comun nu (P6); (4) clasificatorul între NB și Bayes Comun (New-Bayes): o singură pereche dependentă. **Prerequisites:** Lecțiile 1, 4, 6, 11, 20 (back-links only).

**Does not teach (owned elsewhere):** the NB rule, factors and parameter counts (L20); add-one (L21); expectation (L4); trees and ID3 (L11); conditional chain rule as a rule (L1).

### L22 screens: opening question

**L22.s01** (question; data on the same screen)
> Bayes Naiv a fost antrenat pe un număr **infinit** de exemple generate de distribuția: $P(Y{=}0)=0{,}6$, $P(Y{=}1)=0{,}4$; $P(X_1{=}0|Y{=}0)=0{,}8$, $P(X_1{=}0|Y{=}1)=0{,}3$ (deci $P(X_1{=}1|Y{=}0)=0{,}2$ și $P(X_1{=}1|Y{=}1)=0{,}7$). Care este **rata medie a erorii** lui, adică probabilitatea ca decizia lui să fie greșită pentru un exemplu nou generat de aceeași distribuție?

Numeric field, expected `0.24` (tol ±0.001) `[construit]`: joint cells $P(X_1,Y)$: $(0,0)=0{,}48$, $(0,1)=0{,}12$, $(1,0)=0{,}12$, $(1,1)=0{,}28$; NB decides $Y=0$ for $X_1=0$ and $Y=1$ for $X_1=1$; errors $0{,}12+0{,}12$. After the answer: "Cum ai calculat? Păstrează metoda: lecția spune ce probabilități însumezi și de ce."

### L22 screens: worked example (T20C 3 = ex. 2.32, Mitchell 2011 midterm; the exercise 2.32 itself is week 6 and not owned here)

**L22.s02** (data + prediction)
> Distribuția generatoare adevărată: $P(Y{=}0)=0{,}8$, $P(Y{=}1)=0{,}2$.
>
> | | $Y=0$ | $Y=1$ |
> |---|---|---|
> | $P(X_1{=}0\mid Y)$ | 0,7 | 0,3 |
> | $P(X_1{=}1\mid Y)$ | 0,3 | 0,7 |
>
> Bayes Naiv antrenat pe date infinite. Completează tabelul $P(X_1,Y{=}0)$ și $P(X_1,Y{=}1)$ pentru $X_1=0$ și $X_1=1$ și spune ce decide NB în fiecare caz.

Expected: $X_1{=}0$: $0{,}56$ and $0{,}06$, decision `0`; $X_1{=}1$: $0{,}24$ and $0{,}14$, decision `0`. `[seminar]` T20C 3.a. Reveal: NB prezice 0 pentru ambele valori: clasa 0 are prior 0,8.

**L22.s03** (prediction; the average error rate)
> Cât este rata medie a erorii? Care sunt celulele $(X_1,Y)$ în care decizia diferă de $Y$ și ce probabilități au?

Expected: celulele $(X_1{=}0,Y{=}1)$ și $(X_1{=}1,Y{=}1)$, cu $0{,}06$ și $0{,}14$; eroarea $0{,}06+0{,}14=0{,}20$. `[seminar]` T20C 3.b. Reveal: este mereu $P(Y{=}1)$, fiindcă NB nu prezice niciodată 1 aici.

**L22.s04** (prediction; a duplicated attribute)
> Adăugăm atributul $X_2$, **o copie exactă** a lui $X_1$ ($X_2=X_1$ în fiecare exemplu). NB estimează $P(X_2|Y)$ la fel ca $P(X_1|Y)$ și le înmulțește. Pentru celula $(X_1{=}1,X_2{=}1)$: care sunt scorurile $P(Y)P(X_1|Y)P(X_2|Y)$ și ce decide NB acum?

Expected: $Y{=}0$: $0{,}8\cdot0{,}3\cdot0{,}3=0{,}072$; $Y{=}1$: $0{,}2\cdot0{,}7\cdot0{,}7=0{,}098$; decision `1` (flipped from 0). For $(0,0)$: $0{,}392$ vs $0{,}018$, decision `0`. `[seminar]` T20C 3.c; the cells $(0,1)$ and $(1,0)$ never occur. Reveal: the decision in cell $(1,1)$ flipped from 0 to 1 (the reason is the "De ce?" screen, L22.s17; not given here).

**L22.s05** (prediction; the error after duplication)
> Rata medie a erorii (față de distribuția adevărată) crește sau scade? Cât este?

Expected `crește`, $0{,}30$: celulele greșite $(0,0,Y{=}1)$ cu $0{,}06$ și $(1,1,Y{=}0)$ cu $0{,}24$. `[seminar]` T20C 3.d-e. Reveal: celula responsabilă este $(1,1)$, a cărei decizie s-a schimbat din 0 în 1.

**L22.s06** (prediction; Bayes Comun for comparison)
> Bayes Comun, pe aceleași date cu copia $X_2=X_1$: cât este rata medie a erorii?

Expected `0.20` (la fel ca fără copie). Reveal: Bayes Comun lucrează cu distribuția comună reală; copia nu aduce informație nouă și nu schimbă nicio decizie. (P6)

**L22.s07** (learn + prediction; two error numbers)
> Pe tabelul cu copie, NB calculează și el o distribuție proprie, $P_{NB}(X_1,X_2,Y)=P(Y)P(X_1|Y)P(X_2|Y)$, care dă probabilitate și celulelor $(0,1)$ și $(1,0)$, imposibile în realitate. Rata erorii calculată cu **$P_{NB}$** ar fi $0{,}174$; cu distribuția **adevărată** $P$ este $0{,}30$. Care dintre ele cere testul?

Expected `0,30` (cea adevărată). `[slide]` BS:54 "Important Remark". `[calculat]` $0{,}174$ = suma probabilităților $P_{NB}$ ale rândurilor greșite (celula $(0,0)$: $0{,}018$; $(0,1)$: $0{,}042$; $(1,0)$: $0{,}042$; $(1,1)$: $0{,}072$; total $0{,}174$).

### L22 screens: rules

**L22.s08** (definition; Cn-s6:2, BS:49-54)
> **Rata medie a erorii** a clasificatorului $\hat v\in\{v_{NB},v_{JB}\}$ este
> $$E_P\big[I(\hat v(A_1,\dots,A_n)\neq V)\big]=\sum_{a_1,\dots,a_n,v_j}I\big(\hat v(a_1,\dots,a_n)\neq v_j\big)\,P(a_1,\dots,a_n,v_j),$$
> cu $I$ funcția indicator. Se calculează **întotdeauna cu distribuția adevărată** $P$, nu cu $P_{NB}$, distribuția pe care o construiește NB cu presupunerea de independență. Nu este numărul rândurilor de test greșite dintr-un fișier.

Footnote: "Seminar 6, p. 2. Slide-urile exercițiilor: BS:49-54."

**L22.s09** (learn; P3, P7; B:356, Cn-s6:3)
> **Două surse de eroare.** Bayes Comun greșește **numai** prin votul majoritar (argmax): când aceeași instanță apare cu clase diferite, el alege clasa cea mai frecventă. Bayes Naiv are aceeași sursă și încă una: presupunerea de independență condiționată. Dacă datele sunt **consistente** (nicio instanță cu două clase), sursa votului dispare: Bayes Comun are eroarea **0** pe orice funcție booleană (P7). Bayes Naiv nu garantează asta (P4).

Footnote: "Culegerea: p. 356."

**L22.s10** (learn; P4, P5, P6)
> - **(P4)** Bayes Naiv nu garantează eroarea 0 pe date consistente; exemplul canonic este **xor** (eroare 50%, ex. 2.11 mai jos).
> - **(P5)** Poate avea eroarea 0 chiar dacă independența condiționată nu se verifică (ex. 2.36).
> - **(P6)** Acuratețea lui NB **scade** dacă un atribut este duplicat; Bayes Comun nu e sensibil la duplicarea atributelor. Ambii sunt sensibili la duplicarea **exemplelor** de antrenament.
> - NB nu e inutil când atributele depind: presupunerea e deseori încălcată, dar NB merge surprinzător de bine; important e doar ca $\arg\max$ să iasă la fel (ML6:17).

Footnote: "Culegerea: p. 356 (P4-P6, nota 419). Cursul: slide 17."

**L22.s10a** (learn, static table; added 2026-10-29, teacher list item 22)
> **Bayes Naiv și Bayes Comun (Optimal): ce câștigi, ce pierzi.** Proprietățile P0-P8 ale cursului, pe două coloane:
>
> | | Bayes Naiv | Bayes Comun (Optimal) |
> |---|---|---|
> | Parametri liberi ($n$ atribute binare, clasă binară; P1) | $2n+1$, liniar | $2^{n+1}-1$, exponențial |
> | Antrenarea (P2) | o trecere de numărare, $O(dn)$; fără căutare | numără, pentru fiecare clasă, fiecare combinație de valori |
> | Câte exemple cere (P8) | de ordin logaritmic | de ordin exponențial |
> | Instanță cu o combinație de valori nevăzută la antrenare | scor din factorii separați | toate scorurile 0: nu poate decide |
> | Surse de eroare (P3) | votul majoritar și presupunerea de independență condiționată | doar votul majoritar |
> | Date consistente (P4, P7) | nu garantează eroarea 0 (xor: 50%) | eroare 0, pentru orice funcție booleană |
> | Atribute duplicate (P6) | acuratețea scade | nu e afectat |
> | Exemple duplicate (P6) | sensibil | sensibil |
> | Independența condiționată se verifică (P0) | aceleași decizii ca Bayes Comun | aceleași decizii ca Bayes Naiv |
>
> Pe scurt: Bayes Naiv e ieftin și fiecare număr al lui se sprijină pe multe exemple, dar plătește cu presupunerea de independență condiționată; probabilitățile lui pot ieși greșite chiar când decizia e corectă. Bayes Comun nu presupune nimic și are cea mai mică eroare medie posibilă, dar cere un număr exponențial de parametri și de exemple.

Footnote: "Culegerea: p. 355-356. Cursul: slide 16-17." Builder: a summary, one line per row, of facts taught in Lecția 20 (P0, P1, P2; the unseen combination and "many rows per factor" are L20.s01 and L20.s18; "Optimal" is L20.s08) and on L22.s09-s10 (P3-P7). Only P8 is new: one line, no proof (ex. 2.13 is week 6, `allocation.json` `out_of_scope`). The table is a static `table` block, not a markdown table in text; rows that rest on Lecția 20 carry "vezi Lecția 20" in the cell's note. The teacher's item asks for exactly this list, so the screen gathers it instead of re-explaining it.

**L22.s11** (learn; New-Bayes, B:378-379 and T20b 3.4, P21 3)
> **Clasificatorul "în-between".** Dacă atributele $X_1,\dots,X_4$ sunt independente condiționat de $Y$, **cu excepția perechii $(X_3,X_4)$**, Bayes Naiv ar greși. Păstrăm perechea dependentă în același factor:
> $$\arg\max_y P(X_1|y)\,P(X_2|y)\,P(X_3,X_4|y)\,P(y)$$
> Are eroarea la antrenare a lui Bayes Comun și mai puțini parametri decât el. Se numește pe test "New-Bayes".

Footnote: "Culegerea: p. 378-379 (ex. 2.9); 2021: examenul parțial, problema 3."

**L22.s12-s16** (proof screens; allocation proof 2.9: justification of the New-Bayes rule with the conditional chain rule; B:378)
> Arată că pentru $X_1,X_2,X_3,X_4$ independente condiționat de $Y$ cu excepția perechii $(X_3,X_4)$: $\arg\max_yP(Y{=}y|X_1,\dots,X_4)=\arg\max_yP(X_1|y)P(X_2|y)P(X_3,X_4|y)P(y)$.

Reading of the statement used by the book: "două câte două" înseamnă $P(X_1|X_2,X_3,X_4,Y)=P(X_1|Y)$ și $P(X_2|X_3,X_4,Y)=P(X_2|Y)$ (fiecare dintre $X_1$, $X_2$ este independent condiționat de $Y$ de ceilalți); the screen says it in one line.

Steps (predict, then reveal):
- **s12:** "Cum se reduce $\arg\max_yP(y|x_1..x_4)$ la o formulă cu $P(x_1..x_4|y)$?" ✓ Bayes și eliminarea numitorului (ca în Lecția 20): $\arg\max_yP(x_1,\dots,x_4|y)P(y)$. ✗[uită priorul] $\arg\max_yP(x_1,\dots,x_4|y)$: aceasta e regula ML; MAP ține și $P(y)$.
- **s13:** "Ce regulă folosim ca să despărțim $P(x_1,x_2,(x_3,x_4)|y)$?" ✓ regula de înlănțuire condiționată (Lecția 1): $P(A_1,A_2,A_3|B)=P(A_3|B)\,P(A_2|A_3,B)\,P(A_1|A_2,A_3,B)$. ✗[independența completă] "produsul $P(A_1|B)P(A_2|B)P(A_3|B)$": ar fi regula NB; ea presupune și independența perechii $(X_3,X_4)$.
- **s14:** Instantiate: $A_1=(X_1{=}x_1)$, $A_2=(X_2{=}x_2)$, $A_3=(X_3{=}x_3,X_4{=}x_4)$, $B=(Y{=}y)$.
- **s15:** "Ce simplificări ne dau independențele din enunț?" ✓ $P(X_1{=}x_1|X_2{=}x_2,X_3{=}x_3,X_4{=}x_4,Y{=}y)=P(X_1{=}x_1|Y{=}y)$ și $P(X_2{=}x_2|X_3{=}x_3,X_4{=}x_4,Y{=}y)=P(X_2{=}x_2|Y{=}y)$. ✗[simplifică $A_3$] "$P(X_3,X_4|Y)=P(X_3|Y)P(X_4|Y)$": tocmai perechea $(X_3,X_4)$ **este** dependentă.
- **s16:** Result: $P(x_1,x_2,x_3,x_4|y)=P(x_3,x_4|y)P(x_2|y)P(x_1|y)$; înmulțit cu $P(y)$ și estimat prin MLE (L18) dă regula. ∎ Remark (book): clasificatorul stă între NB și Bayes Comun: aceeași eroare la antrenare ca Bayes Comun, mai puțini parametri (vezi 2.9 și 2.35.e mai jos). `[caiet]` B:378-379.

### L22 screen: why

**L22.s17** (reflect)
> De ce un atribut duplicat poate strica Bayes Naiv, dar nu strică Bayes Comun?

Answer: Bayes Naiv înmulțește factorii presupunând că fiecare atribut aduce dovadă **nouă**. O copie a lui $X_1$ aduce aceeași dovadă încă o dată, deci argumentul lui $X_1$ cântărește de două ori și poate învinge priorul (în exemplu: $0{,}098$ față de $0{,}072$ în celula $(1,1)$). Bayes Comun nu înmulțește factori: citește probabilitatea instanței întregi din distribuția comună reală, în care copia nu schimbă nimic.

### L22 screens: retrieve (4 items; new numbers)

**L22.q1** Datele sunt generate de o distribuție în care atributele sunt independente condiționat de clasă; NB și Bayes Comun sunt antrenați pe date infinite. Cum sunt ratele lor medii de eroare? (`[construit]`, fără numere)
- ✓ Egale: când independența condiționată se verifică, $P_{NB}$ este chiar distribuția adevărată, deci cele două clasificatoare iau aceleași decizii (vezi Lecția 20, (P0)).
- ✗[NB e mereu mai slab] "NB are eroare mai mare, fiindcă e o aproximare": e o aproximare doar când presupunerea e falsă.
- ✗[eroare 0 pentru amândoi] "Ambele au eroarea 0": eroarea votului majoritar rămâne când aceeași instanță poate avea ambele clase; independența condiționată nu o elimină.

Builder: "which distribution the error rate uses" is L22.s07-s08; it is not asked again.

**L22.q2** Fie $P(Y{=}0)=0{,}9$, $P(Y{=}1)=0{,}1$, $P(X_1{=}1|Y{=}0)=0{,}2$, $P(X_1{=}1|Y{=}1)=0{,}7$. NB cu $X_1$ prezice mereu 0, deci eroarea este $0{,}1$. Adăugăm $X_2$, copie exactă a lui $X_1$. Cât devine rata medie a erorii a lui NB? (`[construit]`: $0{,}21$)
- ✓ $0{,}21$: pentru $X_1{=}1$ scorurile sunt $0{,}036$ ($Y{=}0$) și $0{,}049$ ($Y{=}1$), NB prezice 1; celulele greșite: $(0,0,Y{=}1)$ cu $0{,}03$ și $(1,1,Y{=}0)$ cu $0{,}18$.
- ✗[copia nu aduce informație nouă] $0{,}1$: pentru Bayes Comun e adevărat; NB numără dovada de două ori și își schimbă decizia în celula $(1,1)$.
- ✗[doar celula nouă] $0{,}18$: ai numărat doar celula care s-a schimbat; celula $(0,0)$ cu $Y=1$ rămâne greșită ($0{,}03$).

**L22.q3** Date consistente (nicio instanță cu două clase). Care afirmație este adevărată?
- ✓ Bayes Comun are eroarea 0 la antrenare, Bayes Naiv nu garantează 0.
- ✗[NB garantează 0 pe date consistente] Ambele au eroarea 0: pentru xor, NB are 50%.
- ✗[votul majoritar rămâne sursă] Niciunul nu poate avea 0 din cauza votului majoritar: pe date consistente fiecare instanță are o singură clasă, deci votul nu mai greșește.

**L22.q4** (added 2026-10-29, teacher list item 22) Care afirmație despre Bayes Comun (Optimal), comparat cu Bayes Naiv, este adevărată?
- ✓ Cere exponențial mai mulți parametri și mai multe exemple, dar nu greșește din cauza presupunerii de independență condiționată.
- ✗[Bayes Optimal nu greșește niciodată] Nu greșește niciodată la clasificare; de aceea se numește Optimal: greșește prin votul majoritar când aceeași instanță apare cu clase diferite (P3); Optimal înseamnă cea mai mică eroare medie posibilă, nu eroarea 0.
- ✗[NB și Bayes Comun inversate] Are mai puțini parametri decât Bayes Naiv, fiindcă nu înmulțește factori: invers; Bayes Comun estimează o probabilitate pentru fiecare combinație de valori, $2^{n+1}-1$, față de $2n+1$.
- ✗[Bayes Comun e sensibil la atribute duplicate] O copie a unui atribut îi strică deciziile, ca la Bayes Naiv: copia nu schimbă distribuția comună, deci nici deciziile lui Bayes Comun (P6); doar Bayes Naiv numără aceeași dovadă de două ori.

### L22 exercises (calculation exercises; each owned only here)

#### L22.e1: ex. 2.11 (B:382-385), "Cât de naiv este Bayes Naiv?", `[caiet]`, answer status book

**Enunț:** $X_1,X_2$ sunt variabile Bernoulli(0,5) independente, iar $Y\in\{1,2\}$ este o funcție deterministă de $(X_1,X_2)$. **a.** Definiți $Y$ (tabelul $X_1\,X_2\,Y$) astfel încât Bayes Naiv să aibă rata medie a erorii **maximă**, 50%. Observați cum se corelează $X_1$ și $X_2$ când $Y$ e fixat. **b.** Cele $2^4=16$ funcții se reduc, prin simetria etichetelor, la 4 cazuri (cele patru tabele de mai jos); unul este cel de la (a). În celelalte trei arătați că NB are eroarea 0.

Cazurile (valorile lui $Y$ pe $(X_1,X_2)=(0,0),(0,1),(1,0),(1,1)$): **1** $(1,1,1,1)$; **2** $(1,1,1,2)$; **3** $(1,2,1,2)$ ($Y$ depinde doar de $X_2$); **4** $(1,2,2,1)$ (xor).

**Fields:** `a1` num scorul lui $Y{=}1$ în celula $(0,0)$ pentru xor `1/8` (frac); `a2` num scorul lui $Y{=}2$ `1/8`; `a3` num rata erorii pentru xor `0.5` (celule cu egalitate: NB alege la întâmplare, deci 50%); `b1` num eroarea cazului 1 `0`; `b2` num eroarea cazului 2 `0`; `b3` num eroarea cazului 3 `0`; `c` num câte din cele 16 funcții au eroarea 0 `14`; `c2` num câte au 50% `2`.

**Hints:** 1) Pentru xor, când $Y=1$: $X_2=X_1$; când $Y=2$: valorile sunt complementare: dependență maximă. Calculează scorurile $P(Y)P(X_1|Y)P(X_2|Y)$ pentru celula $(0,0)$. 2) La cazul 2 calculează cele patru celule: $(0,0)$: $\frac13$ față de $0$; $(1,1)$: $\frac1{12}$ față de $\frac14$. 3) Cazul 3: $Y$ e determinat de $X_2$ singur; clasa $Y=1$ are $X_2=0$ mereu, deci scorul lui $Y{=}2$ e $0$ când $X_2=0$.

**Worked solution (book, p. 382-385):** (a) xor: $Y=1$ pe $(0,0),(1,1)$ și $Y=2$ pe $(0,1),(1,0)$. În celula $(0,0)$: $P(Y{=}1)=\frac12$, $P(X_1{=}0|Y{=}1)=\frac12$, $P(X_2{=}0|Y{=}1)=\frac12$: scorul $\frac18$; la fel pentru $Y=2$: **egalitate** în toate cele patru celule, NB alege una cu probabilitatea 0,5 și greșește cu probabilitatea 0,5: rata erorii 50%. (b) Cazul 1: scorul lui $Y{=}1$ este $\frac14$ în fiecare celulă și al lui $Y{=}2$ este $0$ (clasa 2 nu apare): corect peste tot. Cazul 2: $(0,0)$: $\frac13$ față de $0$; $(0,1)$: $\frac16$ față de $0$; $(1,0)$: $\frac16$ față de $0$; $(1,1)$: $\frac1{12}$ față de $\frac14$: clasa 2, corect. Cazul 3: $Y=1$ când $X_2=0$ (scor $\frac14$ față de 0), $Y=2$ când $X_2=1$: corect în cele 4 celule. Concluzie (p. 385): 50% pentru **2** din cele 16 funcții (xor și ¬xor), 0 pentru celelalte **14**: exact funcțiile neseparabile liniar în $\mathbb R^2$ (legătură cu ex. 14, în afara lecției). (P4, nota 419.)

**Detectors:** `a3 = 0` → "Verifică celula $(0,0)$: scorurile sunt egale ($\frac18$ și $\frac18$). NB nu poate decide; eroarea medie este 50%." `a3 = 0.25` → "În **toate** cele patru celule scorurile sunt egale, nu doar într-una: eroarea e $\frac12$." `c = 12` or `c = 15` → "Funcțiile cu eroare 50% sunt exact două: xor și negația lui. Din cele 16, $16-2=14$ au eroarea 0." Note on tie convention: the 50% is an expected error under random tie-breaking (B:383), not a deterministic one.

#### L22.e2: ex. 2.33 (B:419-420; BS:49-54), drumeție, `[slide]`, answer status slides

**Enunț:** $Y=\text{Hike}\in\{T,F\}$ depinde de $X_1=\text{Sunny}$ și $X_2=\text{Windy}$. Se estimează: $P(\text{Hike})=0{,}5$, $P(\text{Sunny}|\text{Hike})=0{,}8$, $P(\text{Sunny}|\neg\text{Hike})=0{,}7$, $P(\text{Windy}|\text{Hike})=0{,}4$, $P(\text{Windy}|\neg\text{Hike})=0{,}5$. Ipoteza de independență condiționată a lui NB este satisfăcută. **a.** $P(\text{Sunny}{=}T,\text{Windy}{=}T,\text{Hike}{=}T)$ și decizia NB în acest caz. **b.** Completați tabelul $X_1\,X_2\,Y\mid P(X_1,X_2,Y)\mid P_{NB}(Y|X_1,X_2)\mid$ decizia NB, pentru cele 8 rânduri. **c.** Rata medie a erorii lui NB. Se creează $X_3=\text{Rainy}$: fiecare zi este fie ploioasă, fie însorită, nu amândouă și nici niciuna. **d.** Mai este adevărată independența condiționată? **e.** $P(\text{Sunny}{=}T,\text{Windy}{=}T,\text{Rainy}{=}F,\text{Hike}{=}T)$. **f.** Rata medie a erorii lui NB cu trei atribute. **g.** S-a îmbunătățit performanța prin adăugarea lui Rainy?

**Fields:** `a1` num `0.16`; `a2` choice decizia pentru $(T,T)$ `F` (scoruri $0{,}16$ față de $0{,}175$); `b1`-`b4` num $P_{NB}(\text{Hike}{=}T|X_1,X_2)$ pentru $(F,F)$, $(F,T)$, $(T,F)$, $(T,T)$: `0.4444`, `0.3478`, `0.5783`, `0.4776`; `b5` multi deciziile NB (pe aceleași patru combinații) `F, F, T, F`; `c` num `0.435`; `d` choice `nu`; `e` num `0.16`; `f` num `0.45`; `g` choice `nu: eroarea a crescut`.

**Hints:** 1) Tabelul $P(X_1,X_2,Y)=P(Y)P(X_1|Y)P(X_2|Y)$ (aici distribuția adevărată e dată de produs). La (b), NB folosește aceiași factori, deci $P_{NB}$ se obține normalizând produsele pe fiecare pereche $(X_1,X_2)$. 2) Rata erorii = suma probabilităților **adevărate** $P(X_1,X_2,Y)$ ale rândurilor în care decizia NB diferă de $Y$. 3) La (f): cu $X_3=1-X_1$, NB înmulțește încă un factor $P(X_3|Y)$ în care $X_1$ apare a doua oară.

**Worked solution (BS:49-54, `[slide]`; literele cărții: slide a = a; slide b = b+c; slide c = d+e; slide d = f+g):** (a) $0{,}8\cdot0{,}4\cdot0{,}5=0{,}16$; pentru $(T,T)$ scorul lui $\neg$Hike este $0{,}7\cdot0{,}5\cdot0{,}5=0{,}175>0{,}16$: NB decide **F**, cu $P_{NB}(\text{T}|T,T)=0{,}4776$. (b) Tabelul (rândurile $Y=F$ și $Y=T$ pentru fiecare $(X_1,X_2)$): $(F,F)$: $0{,}075$ / $0{,}060$, decizia F; $(F,T)$: $0{,}075$ / $0{,}040$, F; $(T,F)$: $0{,}175$ / $0{,}240$, T; $(T,T)$: $0{,}175$ / $0{,}160$, F. (c) rândurile greșite: $(F,F,T)=0{,}060$, $(F,T,T)=0{,}040$, $(T,F,F)=0{,}175$, $(T,T,T)=0{,}160$: **$0{,}435$**. (d) Nu: Sunny și Rainy sunt complementare, deci condiționat de Hike nu sunt independente. (e) $P(\text{Rainy}{=}F|\text{Hike},\text{Sunny},\text{Windy})\cdot P(\text{Sunny},\text{Windy}|\text{Hike})P(\text{Hike})=1\cdot0{,}8\cdot0{,}4\cdot0{,}5=0{,}16$. (f) Cu trei atribute decizia NB se schimbă numai în celula $(\text{Sunny},\text{Windy})=(T,T)$ (din F în T); greșelile sunt acum $(F,F,T)=0{,}060$, $(F,T,T)=0{,}040$, $(T,F,F)=0{,}175$, $(T,T,F)=0{,}175$, în total **$0{,}45$**. (g) Nu: $0{,}435\to0{,}45$. **Observație importantă (BS:54):** eroarea se calculează față de distribuția **adevărată** $P$, nu față de $P_{NB}$; la trei atribute multe celule au probabilitate adevărată 0 și $P_{NB}>0$. NB scade fiindcă ipotezele de independență nu se mai verifică pentru atribute corelate.

**Detectors:** `c = 0.5` → "Ai împărțit greșelile la numărul de rânduri (8)? Nu: rata erorii este suma probabilităților adevărate ale rândurilor greșite." `b1 = 0.5556` → "$0{,}5556$ este $P_{NB}(\text{F}|F,F)$; cerem $P_{NB}(\text{T}|F,F)=0{,}4444$." `f = 0.435` → "Cu $X_3$ decizia NB pentru $(T,T)$ se schimbă din F în T: greșeala nu mai e rândul $(T,T,T)$ cu $0{,}160$, ci rândul $(T,T,F)$ cu $0{,}175$." `g = da` → "Eroarea a crescut ($0{,}45>0{,}435$): adăugarea unui atribut dependent poate dăuna lui NB."

#### L22.e3: ex. 2.9 (B:378-379), clasificarea bayesiană, un caz particular, `[caiet]`, answer status book (demonstrația este ecranele L22.s12-s16)

**Enunț:** Variabilele $X_1,X_2,X_3,X_4$ sunt independente condiționat două câte două în raport cu $Y$, cu excepția perechii $X_3,X_4$ (deci Bayes Naiv ar produce erori de clasificare). Cum am putea modifica regula de decizie a lui Bayes Naiv pentru a ține cont de această particularitate?

**Fields:** `r` choice regula: ✓ $\arg\max_yP(X_1|y)P(X_2|y)P(X_3,X_4|y)P(y)$; ✗[NB neschimbat] $\arg\max_yP(X_1|y)P(X_2|y)P(X_3|y)P(X_4|y)P(y)$; ✗[prea mult] $\arg\max_yP(X_1,X_2,X_3,X_4|y)P(y)$ (Bayes Comun: corect, dar nu folosește independențele date); `p1` num parametri NB (atribute și ieșire binare) `9`; `p2` num noua regulă `11` (`[construit]` pe regula cărții: $1+2+2+2\cdot3$); `p3` num Bayes Comun `31`.

**Hints:** 1) Perechea dependentă rămâne într-un singur factor. 2) Regula de înlănțuire condiționată (Lecția 1) justifică egalitatea. 3) La parametri: $P(y)$ dă 1; $P(X_1|y)$ dă 2 (câte unul pe clasă); la fel $P(X_2|y)$; $P(X_3,X_4|y)$ are 4 combinații, adică 3 valori libere pe clasă, 6 în total.

**Worked solution (book, p. 378-379):** regula este $\arg\max_yP_{MLE}(X_1|y)P_{MLE}(X_2|y)P_{MLE}(X_3,X_4|y)P_{MLE}(y)$; justificarea este în ecranele L22.s12-s16. Observație (book, p. 379): clasificatorul stă "între" Bayes Naiv și Bayes Optimal: produce aceeași eroare la antrenare ca Bayes Optimal și folosește o proprietate de independență condiționată ca Bayes Naiv, deci are mai puțini parametri decât Bayes Optimal. Numărul de parametri: cartea nu dă pentru 2.9; calculul de mai sus ($9<11<31$) `[construit]`.

**Detectors:** `p2 = 9` → "Perechea $(X_3,X_4)$ nu mai e despărțită: $P(X_3,X_4|y)$ are 3 valori libere pe clasă, nu 1+1." `p2 = 12` → "Numără doar valorile libere: $P(y)$ 1, $X_1$ 2, $X_2$ 2, perechea 6, total 11."

#### L22.e4: ex. 2.35 (B:421-422; BS:64-72), clasificatori bayesieni pe $Y=(A\land B)\lor\neg(B\lor C)$, answer status verified-twice (cartea n-o rezolvă; slide-urile BS:65-72 da)

**Enunț:** $Y=(A\land B)\lor\neg(B\lor C)$, cu $A,B,C$ variabile binare independente, fiecare cu probabilitate 50% să ia valoarea 0. **a.** Câți parametri trebuie să estimeze Bayes Naiv pentru a învăța $Y$? Enumerați-i ($P(\neg x)$ nu se numără dacă $P(x)$ e numărat). **b.** Rata medie a erorii la antrenare a lui Bayes Naiv, cu date infinite (la egalitate, $y_{NB}=1$). **c.** Câți parametri estimează Bayes Optimal? **d.** Rata medie a erorii la antrenare a lui Bayes Optimal (argument calitativ). **e.** Un clasificator care presupune că $A$ este independent de $C$ condiționat de $B$ și $Y$: arătați că estimează mai puțini parametri decât Bayes Optimal și are aceeași rată a erorii.

Tabela de adevăr (de scris întâi): $Y=1$ exact pe $ABC=000,100,110,111$, deci $P(Y{=}1)=\frac12$.

| A B C | 000 | 001 | 010 | 011 | 100 | 101 | 110 | 111 |
|---|---|---|---|---|---|---|---|---|
| Y | 1 | 0 | 0 | 0 | 1 | 0 | 1 | 1 |

**Fields:** `a` num `7`; `a2` multi parametrii: `P(Y)`, `P(A|Y=0)`, `P(A|Y=1)`, `P(B|Y=0)`, `P(B|Y=1)`, `P(C|Y=0)`, `P(C|Y=1)`; `b0` num câte celule sunt cu egalitate la NB `4` (celulele $000$, $010$, $101$, $111$); `b` num `0.25` (frac `1/4`; greșit pe $010$ și $101$); `c` num `15`; `d` num `0`; `e1` num numărul de parametri `11`; `e2` num eroarea `0`.

**Hints:** 1) $P(A{=}1|Y{=}1)=\frac34$, $P(A{=}1|Y{=}0)=\frac14$; $P(B{=}1|Y)=\frac12$ pentru ambele; $P(C{=}1|Y{=}1)=\frac14$, $P(C{=}1|Y{=}0)=\frac34$. 2) Scorurile NB sunt egale pentru $(A,C)=(0,0)$ și $(1,1)$ (deci decizia $=1$ prin convenție); greșit pe $010$ (adevărat 0) și $101$ (adevărat 0). 3) La (e): în fiecare felie $(B,Y)$ una dintre $A$, $C$ este constantă: $(B{=}0,Y{=}1)$: $C=0$; $(0,0)$: $C=1$; $(1,1)$: $A=1$; $(1,0)$: $A=0$; deci $A\perp C|B,Y$. Regula: $P(Y)P(B|Y)P(A|B,Y)P(C|B,Y)$ cu $1+2+4+4=11$ parametri.

**Worked solution `[calculat]` + BS:65-72 (Culegerea nu dă răspunsul; verificat de două ori):** (a) **7**: $P(Y)$, apoi $P(A|Y)$, $P(B|Y)$, $P(C|Y)$ pentru fiecare dintre cele două valori ale lui $Y$ (în general $2n+1$). (b) Scorurile NB $P(Y)P(A|Y)P(B|Y)P(C|Y)$ pe cele opt celule (valori în unități de $\frac1{64}$): $000$: $3$ față de $3$ (egalitate, decizia 1, corect); $001$: $9$ față de $1$ (0, corect); $010$: $3$ față de $3$ (egalitate, decizia 1, **greșit**); $011$: $9$ față de $1$ (0, corect); $100$: $1$ față de $9$ (1, corect); $101$: $3$ față de $3$ (egalitate, decizia 1, **greșit**); $110$: $1$ față de $9$ (1, corect); $111$: $3$ față de $3$ (egalitate, decizia 1, corect). Eroarea: $\frac28=\mathbf{0{,}25}$. (c) $2^{3+1}-1=\mathbf{15}$: $P(Y)$ și, pentru fiecare clasă, $2^3-1=7$ valori. (d) **0**: datele sunt consistente (fiecare instanță $ABC$ are o singură clasă) și Bayes Optimal citește eticheta rândului; nu mai există votul care să greșească (P7). (e) În fiecare felie $(B,Y)$ una dintre $A$ și $C$ este constantă, deci $P(A,C|B,Y)=P(A|B,Y)P(C|B,Y)$ (verifică cele patru felii): independență condiționată. Regula $\arg\max_yP(A|B,y)P(C|B,y)P(B|y)P(y)$ este identică cu a lui Bayes Optimal, deci eroarea este 0. Parametri: $P(Y)$; $P(B|Y{=}0)$, $P(B|Y{=}1)$; $P(A|B,Y)$ pentru cele 4 perechi $(B,Y)$; $P(C|B,Y)$ pentru cele 4: **11** — mai mult decât NB (7), mai puțin decât Bayes Optimal (15). `[slide]` BS:66-72.

**Detectors:** `a = 6` → "Ai uitat $P(Y)$; sunt 7 parametri." `a = 14` → "Ai numărat complementele; se numără doar parametrii liberi." `b = 0.5` → "Egalitatea la $000$ și $111$ cade corect (decizia 1 și adevărul 1); la $010$ și $101$ adevărul este 0: două din opt celule, $\frac28$." `b = 0` → "Naiv nu garantează 0 pe date consistente (P4): la $010$ și $101$ scorurile sunt egale și convenția cărții dă decizia 1, greșit." `c = 8` → "$2^3=8$ combinații de valori ale lui $A,B,C$; parametrii sunt probabilitățile $P(A,B,C|Y)$ pentru ambele clase minus sumele 1, plus $P(Y)$: $2\cdot7+1=15$." `e1 = 7` or `15` → "Regula $P(A|B,Y)P(C|B,Y)P(B|Y)P(Y)$ are $4+4+2+1=11$."

#### L22.e5 (optional): ex. 2.36 (B:422), NB cu eroare 0 chiar dacă independența condiționată nu se verifică (P5), answer status verified-twice (fără cheie în carte; exemplul e al nostru)

**Enunț:** $A$ și $B$ sunt variabile binare independente, fiecare cu probabilitate 50% să ia 0. Definiți o funcție booleană $y=f(A,B)$ astfel încât $A$ să **nu** fie independent de $B$ condiționat de $y$, iar Bayes Naiv să producă rata medie a erorii **0%** (date infinite).

**Fields:** `f` multi tabelul $f$ pe $(A,B)=(0,0),(0,1),(1,0),(1,1)$ (patru biți); acceptat orice funcție cu un singur 1 sau un singur 0 (opt funcții); verificare automată: pentru funcția aleasă, site-ul calculează dependența condiționată și eroarea NB. Pentru $y=A\land B$ (alegerea explicată): `d1` frac $P(A{=}1,B{=}1|y{=}0)$ `0`; `d2` frac $P(A{=}1|y{=}0)\,P(B{=}1|y{=}0)$ `1/9`; `e` num eroarea NB `0`.

**Hints:** 1) xor nu merge (eroare 50%, 2.11); funcțiile constante nu merg (dau independență trivială). 2) Încearcă $y=A\land B$. 3) Dacă $y=0$, perechile $(0,0),(0,1),(1,0)$ sunt la fel de probabile.

**Worked solution `[calculat]` (Culegerea nu dă răspunsul; verificat de două ori; exemplul $y=A\land B$ este al nostru, nu al lui Ciortuz):** pentru $y=0$: $P(A{=}1,B{=}1|y{=}0)=0$, dar $P(A{=}1|y{=}0)P(B{=}1|y{=}0)=\frac13\cdot\frac13=\frac19$: $A$ și $B$ **nu** sunt independente condiționat de $y$. Totuși scorurile NB sunt: $(0,0)$: $\frac13$ față de $0$; $(0,1)$: $\frac16$ față de $0$; $(1,0)$: $\frac16$ față de $0$; $(1,1)$: $\frac1{12}$ față de $\frac14$; decizia coincide cu eticheta în toate cele patru celule: eroare 0. În total opt funcții din 16 au proprietatea cerută (un singur 1 sau un singur 0 în tabel).

**Detector:** `f = xor` → "Pentru xor scorurile sunt egale în toate celulele; NB are eroarea 50%, nu 0." `f = constantă` → "La o funcție constantă $A$ și $B$ sunt independente condiționat de $y$: nu respectă prima condiție."

#### L22.e6 (optional): ex. 2.42 (B:429), comparație NB și ID3, answer status ruled (fără cheie; răspuns argumentat din enunț)

**Enunț:** Care dintre afirmațiile de mai jos sunt adevărate atât pentru Bayes Naiv cât și pentru ID3? (Se poate alege mai mult de una.) **1.** Pentru ambii se presupune că orice pereche de atribute $X_i,X_j$ este independentă. **2.** Pentru ambii se presupune că orice pereche este dependentă. **3.** Pentru ambii se presupune că orice pereche este independentă în raport cu eticheta. **4.** Pentru ambii se presupune că orice pereche este dependentă în raport cu eticheta.

**Field:** `m` multi `niciuna`.

**Hints:** 1) Ce presupune NB: independență necondiționată sau condiționată de etichetă? 2) Presupune ID3 ceva despre perechi de atribute? Gândește-te la xor (ID3 îl poate reprezenta). 3) Afirmația 3 este adevărată doar pentru unul dintre cei doi.

**Worked solution (reasoned; answer status ruled; no key in the book):** nicio afirmație nu este adevărată pentru amândoi. Bayes Naiv presupune independență **condiționată de etichetă** (afirmația 3 e adevărată pentru NB, nu pentru ID3) și **nu** presupune independență necondiționată (1 e falsă). ID3 nu face nicio presupunere de independență între perechi de atribute: poate reprezenta xor (ex. 4.4, 4.32), deci nici 2 sau 4 nu sunt presupuneri ale lui.

**Detector:** `3` → "Afirmația 3 descrie Bayes Naiv. ID3 nu presupune nicio independență a atributelor: poate învăța xor, unde atributele sunt perfect dependente în raport cu eticheta."

### L22 visual spec: `ml-viz-nb` with two error indicators (same widget as L20 and L21)

- **Data (selector):** (1) T20C 3: $P(Y)=(0{,}8;0{,}2)$ and the $P(X_1|Y)$ table; a switch "adaugă $X_2$ = copie a lui $X_1$". (2) ex. 2.33 (the eight rows, `Rainy` switch).
- **Steps (manual advance, prediction first), T20C 3:** (1) the joint table $P(X_1,Y)$ fills in; predict the NB decision per $X_1$. (2) the cells where decision ≠ Y turn red; predict the error rate (0,20). (3) the copy is added: the table gets four cells $(X_1,X_2)$; predict the decision of cell $(1,1)$ (flips to 1). (4) **two indicators** appear on the same table: "eroarea față de $P$ adevărată" $= 0{,}30$ and "eroarea față de $P_{NB}$" $= 0{,}174$; predict which one is the exam's (the true one). (5) a "Bayes Comun" toggle shows its decisions and its error $0{,}20$ unchanged.
- **Learner predicts:** the decision of a cell, the error rate before and after the copy, and which of the two error numbers is the right one.
- **Reduced motion:** cells change colour in place; no auto-advance.

### L22 builder notes

- Added 2026-10-29 (teacher list item 22): L22.s10a (the advantages and disadvantages, P0-P8) and L22.q4; the retrieve block now has 4 items. A quiz item on "a combination never seen in training" was not added: it is the opening question of Lecția 20 (L20.s01).
- Sources: Cn-s6:1-3, BS:49-54, BS:64-72, B:354-357 (P3-P7), B:378-379 (2.9), B:382-385 (2.11), B:419-422 (2.33, 2.35, 2.36), B:429 (2.42), T20C 3 (`tests/2020-2021-t1-ciortuz/subiect.pdf` p. 3), `verified-answers.md` (2.11, 2.33, 2.35, 2.36), `exbook-ch2-3.md` sections 3, 6.
- **Computed by me:** the $P_{NB}$-error 0,174 (L22.s07); L22.s06 (Bayes Comun error with the copy); the parameter count 11 for 2.9 (the book gives the rule only); the 8 functions of 2.36; the quiz number 0,21. (An earlier draft also asked NB on $Y=A\lor B$; that is 2.11.b, case 2, up to symmetry, so it was removed.) Each is recomputed by `verify_bayes.py` (sections L22 and quiz numbers).
- **Reading of 2.9:** the book takes "independente două câte două" to mean $X_1$ and $X_2$ are each conditionally independent of the others (stated on L22.s12). Strictly, pairwise independence alone does not give that; the screen states the reading the book uses, in one line, without a discussion.
- **Conventions on screen:** the tie rule of 2.35 ($y_{NB}=1$); ties in 2.11 count as 50% (expected error under random tie-breaking).
- **Optional:** 2.36 and 2.42 (not in the table or the weekly list; included for the only examples of P5 and the NB-vs-ID3 question).
- **2.33** letters: slides and book letters differ (stated in the solution); status slides, the numbers were recomputed (`verified-answers.md` agrees on all eight rows).
- Repetition check: T20C 3 is used on L22.s02-s07 only; 2.33's duplicate is a complement ($X_3=1-X_1$), a different mechanism from the exact copy of the worked example; xor appears in 2.11 and nowhere else; the conditional chain rule is used (not re-taught) in the proof screens, with a back-link to L1.

---

## Lecția 23 (`ml-l23`). Funcții convexe, inegalitatea lui Jensen și demonstrațiile despre entropie

**Priority C** (teorie: apare în Seminarul Special și în examenele suplimentare S1/S2, nu ca problemă de calcul în T1). **Necesită:** vezi Lecția 4 (media $E[X]$ a unei funcții de variabilă aleatoare), Lecția 7 (enunțul $0\le H\le\log k$), Lecția 8 (definițiile $H(Y|X)$, $H(X,Y)$, $IG$ și lanțul).

**Titlu (RO):** Convexitate, Jensen și de ce entropia se comportă așa

**Concepte (2 principale, plus demonstrațiile):**
- (a) mulțime convexă și funcție convexă / strict convexă / concavă (definițiile);
- (b) inegalitatea lui Jensen $f(\sum a_ix_i)\le\sum a_if(x_i)$ și consecințele ei: $f(E[X])\le E[f(X)]$, media aritmetică $\ge$ media geometrică, apoi demonstrațiile proprietăților din Lecțiile 7-8: $H(X)\le\log n$, $IG\ge0$ direct, $H(X,Y)=H(X)+H(Y)\Leftrightarrow$ independente, lanțul condiționat.

**Owned:** definitions (0.78: convex set/function; weeks: only definitions on the week-3 row, full proofs in the Special Seminar), Jensen (0.79.a, B:176-177), probabilistic form (0.79.c), AM-GM (0.79.b); properties: equality iff all $x_i$ equal for strictly convex, inequalities flip for concave, $H\le\log n$ with equality iff uniform, $IG\ge0$ directly and $IG=0$ iff independent, $H(X,Y)=H(X)+H(Y)$ iff independent, $H(X,Y|A)=H(Y|A)+H(X|Y,A)$; proofs 0.78.a-b, 0.79.a-c, 0.143, 0.144, 0.145, 0.146, 0.59, 0.62 (optional); exercises 0.59, 0.62, 0.78, 0.79, 0.143, 0.144, 0.145, 0.146, 0.151.

### Pretest

Data on the same screen: graficul lui $f(x)=x^2$ cu punctele $x=1$ și $x=3$ marcate, și cele două numere de comparat:
$$A=f\!\left(\tfrac{1+3}{2}\right),\qquad B=\tfrac{f(1)+f(3)}{2}.$$

RO: "Care număr e mai mare, $A$ sau $B$? Calculează-le pe amândouă."

- **Expected:** $A=f(2)=4$, $B=\frac{1+9}{2}=5$; $B>A$. Fields: $A=4$, $B=5$ (exact), choice "$B$ mai mare".

### Concret (worked example, construit; date deținute doar aici)

| Ecran | Se arată | Învățăcelul prezice | Valoarea corectă |
|---|---|---|---|
| 1 | $f(x)=x^2$, valorile $1$ și $3$, ponderi $(\frac12,\frac12)$ | $f$ în punctul mediu; apoi media valorilor lui $f$ | $f(2)=4$; $\frac12\cdot1+\frac12\cdot9=5$; **$4\le5$** |
| 2 | Aceleași valori, ponderi $(\frac14,\frac34)$ | punctul mediu $x=\frac14\cdot1+\frac34\cdot3$ și cele două numere | $x=2.5$; $f(2.5)=6.25$; $\frac14\cdot1+\frac34\cdot9=7$; $6.25\le7$ |
| 3 | Cazul $x_1=x_2=2$ | cele două numere | $4$ și $4$: **egalitate**, doar când punctele coincid |
| 4 | $\log$ (concavă) cu valorile $1$ și $4$, ponderi $(\frac12,\frac12)$ | $\log\frac{1+4}{2}$ vs $\frac{\log1+\log4}{2}$; care e mai mare? | $\log2.5=1.3219$; $\frac{0+2}{2}=1$; **sensul se inversează**: $\log(\ldots)\ge(\ldots)$ |
| 5 | Entropia $(\frac12,\frac14,\frac14)$: ponderile sunt $p_i$, punctele $x_i=\frac{1}{p_i}$ | $H=\sum p_i\log\frac1{p_i}$ și comparația cu $\log\sum p_i\frac1{p_i}$ | $H=\frac12\cdot1+\frac14\cdot2+\frac14\cdot2=1.5$; $\log\sum p_i\cdot\frac{1}{p_i}=\log3=1.585$; $1.5\le1.585$, adică $H\le\log n$ cu $n=3$ |

### Regula (definitions with sources)

- **R1.** Mulțime convexă $C\subseteq\mathbb R^d$: pentru orice $x,y\in C$ și $t\in[0,1]$, punctul $tx+(1-t)y\in C$ (B:170).
- **R2.** Funcție convexă: domeniul e o mulțime convexă și $f(tx+(1-t)y)\le tf(x)+(1-t)f(y)$ pentru orice $x,y$ și $t\in[0,1]$ (relația 100, B:171). **Strict convexă**: cu $<$ (pentru $x\ne y$, $t\in(0,1)$). Geometric: coarda dintre două puncte ale graficului stă deasupra graficului (B:171 nota 170). **Concavă**: inegalitățile se inversează (B:177 observația 2); echivalent, $-f$ convexă (standard; cartea spune doar "semnul se inversează").
- **R3.** Jensen: pentru $a_i\ge0$, $\sum a_i=1$ și $f$ convexă, $f(\sum_ia_ix_i)\le\sum_ia_if(x_i)$ (B:176, relația 106); mai general, cu $a_i'\ge0$, $\sum a_i'\ne0$: $f\Big(\frac{\sum a_i'x_i}{\sum a_j'}\Big)\le\frac{\sum a_i'f(x_i)}{\sum a_j'}$ (relația 107). Pentru $f$ strict convexă, egalitatea are loc **doar dacă** $x_1=\dots=x_n$ (B:177, observația 1). Pentru $f$ concavă: $\ge$.
- **R4.** Forma probabilistă: $f(E[X])\le E[f(X)]$ pentru $f$ convexă și $X$ discretă cu număr finit de valori; pentru $f$ concavă: $f(E[X])\ge E[f(X)]$ (B:178, 0.79.c).
- **R5.** Media aritmetică $\ge$ media geometrică: $\frac{x_1+\dots+x_n}{n}\ge\sqrt[n]{x_1\cdots x_n}$ pentru $x_i\ge0$ (0.79.b, B:178).
- **R6.** Harta rezultatelor demonstrate în această lecție: $H(X)\le\log n$ (0.143); $X\perp Y\Rightarrow H(X,Y)=H(X)+H(Y)$ direct (0.144); $H(X,Y|A)=H(Y|A)+H(X|Y,A)$ (0.145); $IG\ge0$ și $IG=0\Leftrightarrow$ independente, direct (0.146); $H(X,Y)=H(X)+H(Y)\Leftrightarrow$ independente (0.59). Proprietățile sunt enunțate în Lecțiile 7-8.

### De ce?

RO: "Pentru o funcție strict convexă, Jensen are egalitate doar când toate punctele $x_i$ sunt egale. De ce nu poate fi egalitate și pentru puncte diferite?"

- **Answer:** pentru două puncte diferite $x\ne y$ și $t\in(0,1)$, definiția strictă dă $f(tx+(1-t)y)<tf(x)+(1-t)f(y)$: coarda e strict deasupra graficului în interior. Deci în Jensen cu puncte diferite apare cel puțin o inegalitate strictă (B:177 observația 1). Egalitatea rămâne la capete (sau când punctele coincid), ca la ecranul 3: $4=4$.

### Demonstrații (ecrane cu predicție). Fiecare rând: ce se arată; ce prezice învățăcelul; pasul corect.

**P1. Jensen prin inducție, 0.79.a (B:177-178)**

| Pas | Se arată | Prezice | Corect |
|---|---|---|---|
| 1 | $P(n)$: Jensen cu $n$ puncte. $P(2)$ | Cum urmează $P(2)$ din definiție? | $f(a_1x_1+a_2x_2)\le a_1f(x_1)+a_2f(x_2)$ cu $a_2=1-a_1$ este chiar relația (100) cu $t=a_1$ |
| 2 | Presupunem $P(n)$; vrem $P(n+1)$ | Ce termen separi din $\sum_{i=1}^{n+1}a_ix_i$? | ultimul: $\sum_{i=1}^na_ix_i+a_{n+1}x_{n+1}$ |
| 3 | Scoți factorul $(1-a_{n+1})$ | Ce ponderi $A_i$ pui pe primele $n$ puncte, ca să fie combinație convexă? | $A_i=\frac{a_i}{1-a_{n+1}}$: $A_i\ge0$ și $\sum_{i\le n}A_i=\frac{1-a_{n+1}}{1-a_{n+1}}=1$ |
| 4 | $f\big((1-a_{n+1})\sum A_ix_i+a_{n+1}x_{n+1}\big)$ | Ce proprietate aplici prima? | convexitatea cu două puncte ($\sum A_ix_i$ și $x_{n+1}$), $t=1-a_{n+1}$ |
| 5 | $\le(1-a_{n+1})f(\sum A_ix_i)+a_{n+1}f(x_{n+1})$ | Ce aplici pe $f(\sum A_ix_i)$? | ipoteza $P(n)$: $\le\sum_{i\le n}A_if(x_i)$ |
| 6 | Reînmulțești | Ce ponderi rămân? | $(1-a_{n+1})A_i=a_i$, deci $\sum_{i=1}^{n+1}a_if(x_i)$. Cazul $a_{n+1}=1$ e trivial (B:178 nota 186). |

**P2. AM-GM, 0.79.b (B:178).** Prezice funcția: $\ln$ (concavă). Pași: (1) $a_i=\frac1n$; (2) Jensen pentru concavă: $\ln\!\big(\frac1n\sum x_i\big)\ge\frac1n\sum\ln x_i=\ln\sqrt[n]{\prod x_i}$; (3) $\ln$ crește strict, deci $\frac{\sum x_i}{n}\ge\sqrt[n]{\prod x_i}$. Verificare numerică (construit): $x=(1,4,16)$: $\frac{21}{3}=7\ge\sqrt[3]{64}=4$.

**P3. Forma probabilistă, 0.79.c.** $X$ cu valorile $x_1..x_n$ și probabilitățile $p_1..p_n$; prezice ponderile: $a_i=p_i$ ($p_i\ge0$, $\sum p_i=1$); atunci $f(\sum p_ix_i)\le\sum p_if(x_i)$ înseamnă $f(E[X])\le E[f(X)]$.

**P4. Caracterizările convexității, 0.78.a-b (B:171-176). Opțional ca detaliu; în săptămâna 3 contează doar definițiile.**

| Afirmația | Direcția | Ideea (ce prezice învățăcelul → corect) |
|---|---|---|
| 1. $f\!\big(\frac{x+y}2\big)\le\frac{f(x)+f(y)}2$ | definiție ⇒ 1 | ce $t$? → $t=\frac12$ |
| | 1 ⇒ definiție | cartea: prin reducere la absurd; $g(t)=f(tx_0+(1-t)y_0)-tf(x_0)-(1-t)f(y_0)$ are $g(0)=g(1)=0$, $g(t_0)>0$ și proprietatea punctului de mijloc; la cel mai mic $t^*$ unde $g$ atinge maximul $M$ iese $g(t^*)<M$, contradicție (B:172-173). **Notă pentru constructor:** demonstrația presupune că maximul $M$ există (adică ceva de genul $f$ continuă); cartea nu spune asta explicit |
| 2. $f(x)\ge f(y)+f'(y)(x-y)$ (tangenta sub grafic) | definiție ⇒ 2 | împarte definiția la $t$ și fă $t\to0$: $f'(y)(x-y)\le f(x)-f(y)$ |
| | 2 ⇒ definiție | aplică 2 în $z=tx+(1-t)y$ pentru $x$ și pentru $y$, înmulțește cu $t$ și $1-t$, adună: termenii cu $f'(z)$ dispar, rămâne $tf(x)+(1-t)f(y)\ge f(z)$ |
| 3. $f''\ge0$ | definiție ⇒ 3 | din 2 și Taylor de ordin 2: $f''(x)(y-x)^2+h_2(y)(y-x)^2\ge0$, împarte cu $(y-x)^2$, $y\to x$: $f''(x)\ge0$ |
| | 3 ⇒ definiție | Taylor cu $f''\ge0$ dă 2, iar 2 ⇒ definiție |
| 4. $\max(f,g)$ convexă | definiție | $\max\{tf(x)+(1-t)f(y),\,tg(x)+(1-t)g(y)\}\le t\max\{f(x),g(x)\}+(1-t)\max\{f(y),g(y)\}$ |
| 5. $f+g$ convexă | definiție | adună cele două inegalități |
| 6. $f\circ g$ convexă? | **nu mereu** | $g(x)=x^2$, $f(x)=-x$ sunt convexe dar $f(g(x))=-x^2$ e concavă. Condiție suficientă: $f,g$ de două ori derivabile și $f$ nedescrescătoare ($[f(g)]''=f''(g)(g')^2+f'(g)g''\ge0$) |

**P5. 0.143: $H(X)\le\log n$ (B:244; PS:157-165). Trei demonstrații; învățăcelul le urmărește pe rând și prezice pasul.**

*(i) Cu $\ln x\le x-1$ (PS:158-160).*

| Pas | Prezice | Corect |
|---|---|---|
| 1 | Schimbă baza: $H\le\log n$ devine ce? | $-\sum P(x_i)\ln P(x_i)\le\ln n$ |
| 2 | Scrie $\ln n=\sum P(x_i)\ln n$ și mută în partea stângă | $\sum P(x_i)\ln\frac{1}{nP(x_i)}\le0$ |
| 3 | Ce $x$ pui în $\ln x\le x-1$? | $x=\frac{1}{nP(x_i)}$ |
| 4 | Calculează | $\sum P(x_i)\big(\frac1{nP(x_i)}-1\big)=\frac1n\cdot n-1=0$. Gata. |

(Legătură făcută aici, nu din carte: $\ln x\le x-1$ este afirmația 2 din P4 pentru funcția concavă $\ln$ în punctul $y=1$: tangenta $y=x-1$ stă deasupra graficului.)

*(ii) Cu Jensen (PS:161).* Funcția concavă $\log$, ponderile $P(x_i)$, punctele $\frac{1}{P(x_i)}$: $\sum P(x_i)\log\frac{1}{P(x_i)}\le\log\sum P(x_i)\frac{1}{P(x_i)}=\log n$. Egalitate dacă și numai dacă toate $\frac{1}{P(x_i)}$ sunt egale, adică $P(x_i)=\frac1n$ (uniform). Prezice: care e funcția și care sunt ponderile?

*(iii) Cu multiplicatorii lui Lagrange (PS:162-165).* Problema: minimizează $-H(p_1..p_n)$ cu $\sum p_i=1$. $L=\sum p_i\log p_i+\lambda(\sum p_i-1)$. $\frac{\partial L}{\partial p_i}=\log p_i+\frac1{\ln2}+\lambda=0$ dă $p_i$ constant, deci $p_i=\frac1n$ și $H=\log n$. $-H$ e strict convexă (hessiana este diagonală cu $\frac{1}{p_i\ln2}>0$), deci acesta e punctul de maxim al lui $H$. Prezice: ce valoare comună au $p_i$?

**P6. 0.144: $X\perp Y\Rightarrow H(X,Y)=H(X)+H(Y)$, direct (B:244; PS:167-168)**

| Pas | Prezice | Corect |
|---|---|---|
| 1 | Cum scrii $P(x,y)$ la independență? | $P(x)P(y)$ |
| 2 | $\log(P(x)P(y))$ | $\log P(x)+\log P(y)$; despart în două sume duble |
| 3 | În prima, ce sumă dă 1? | $\sum_yP(y)=1$: rămâne $-\sum_xP(x)\log P(x)=H(X)$ |
| 4 | A doua | $\sum_xP(x)=1$: rămâne $H(Y)$ |
| 5 | **Cazul continuu** | aceleași pași cu integrale duble și densități: $\int p_Y=\int p_X=1$ dau $H(X)+H(Y)$ |

**P7. 0.145: lanțul condiționat (B:245; PS:170-173)**

| Pas | Prezice | Corect |
|---|---|---|
| a.1 | Din 0.55.c, cât e $H(X|A)$ în funcție de entropii comune? | $H(X|A)=H(X,A)-H(A)$ |
| a.2 | $H(X,Y|A)=H(X,Y,A)-H(A)$; adaugă și scade $H(X,A)$ | $[H(X,Y,A)-H(X,A)]+[H(X,A)-H(A)]=H(Y|X,A)+H(X|A)$; la fel cu rolurile schimbate |
| a.3 | Sensul într-o propoziție *(formulare scrisă aici, nu din surse)* | RO: "Entropia perechii $(X,Y)$ când știi $A$ este entropia lui $X$ când știi $A$, plus ce mai rămâne nesigur din $Y$ după ce știi și $X$, și $A$." |
| b | $H(X_1..X_n)=H(X_1)+H(X_2..X_n|X_1)$ apoi (a) repetat | $=H(X_1)+H(X_2|X_1)+H(X_3..X_n|X_1,X_2)=\dots$ până la $H(X_n|X_1..X_{n-1})$ |
| c | $H(X_1..X_n|A)=H(X_1..X_n,A)-H(A)$; lanțul din (b) cu $A$ în față | $H(A)+H(X_1|A)+H(X_2|X_1,A)+\dots-H(A)$, deci suma fără $H(A)$ |

(0.145.c is in the book and solved at PS:173, but not in `exercise_index`; see problem 2.)

**P8. 0.146: $IG\ge0$ și $IG=0\Leftrightarrow$ independente, direct (B:245-246; PS:150-155)**

| Pas | Prezice | Corect |
|---|---|---|
| 1 | Scrie $-IG$ cu definiția $H(X)-H(X|Y)$ | $-IG=\sum_iP(x_i)\log P(x_i)-\sum_jP(y_j)\sum_iP(x_i|y_j)\log P(x_i|y_j)$ |
| 2 | Marginalizează primul termen: $P(x_i)=\sum_jP(x_i,y_j)=\sum_jP(y_j)P(x_i|y_j)$ | $-IG=\sum_jP(y_j)\sum_iP(x_i|y_j)\log\frac{P(x_i)}{P(x_i|y_j)}$ |
| 3 | Pentru fiecare $j$: ce ponderi și ce puncte în Jensen cu $\log$ concavă? | ponderi $a_i=P(x_i|y_j)$ ($\ge0$, suma $1$), puncte $\frac{P(x_i)}{P(x_i|y_j)}$ |
| 4 | Aplică Jensen | $\sum_iP(x_i|y_j)\log\frac{P(x_i)}{P(x_i|y_j)}\le\log\sum_iP(x_i)=\log1=0$ |
| 5 | Concluzie | $-IG\le0$, deci $IG\ge0$ |
| 6 | $\Leftarrow$: $X\perp Y$ | $P(x_i)=P(x_i|y_j)$, logaritmul e $0$, $IG=0$ |
| 7 | $\Rightarrow$: $IG=0$ | fiecare sumă interioară (cu semn $\le0$) trebuie să fie $0$; egalitatea din Jensen (strict concavă) cere $\frac{P(x_i)}{P(x_i|y_j)}=\alpha$ constant în $i$; însumând $P(x_i)=\alpha P(x_i|y_j)$ pe $i$ se obține $\alpha=1$, deci $P(x_i)=P(x_i|y_j)$ pentru toți $i,j$: independente |

(Remark by me, not in the sources: terms with $P(x_i|y_j)=0$ contribute $0$ and the remaining $P(x_i)$ sum to at most $1$, so step 4 still holds; the book and slides write "$=1$" loosely. Keep the book's version on screen, add one line.)

**P9. 0.59: $H(X,Y)=H(X)+H(Y)\Leftrightarrow X\perp Y$ (B:137).** (1) lanțul 0.55.c: $H(X,Y)=H(X)+H(Y|X)$; (2) $IG(X;Y)=H(Y)-H(Y|X)$ și $IG=0\Leftrightarrow$ independente (P8); deci $H(Y)=H(Y|X)\Leftrightarrow X\perp Y$; (3) atunci $H(X,Y)=H(X)+H(Y|X)=H(X)+H(Y)$ și, invers, dacă $H(X,Y)=H(X)+H(Y)$, atunci $H(Y|X)=H(Y)$, deci independente. Consecință: $H(X,Y)=H(X)+H(Y)-IG(X;Y)\le H(X)+H(Y)$.

**P10. 0.62 (opțional, B:143-148): redescoperirea entropiei din trei proprietăți.** Axiomele $\psi_n(p_1..p_n)$: A0 $\psi_1(1)=0$ (adăugată de Ciortuz), A1 continuă și simetrică, A2 $\psi_n(\frac1n..\frac1n)$ strict crescătoare în $n$, A3 suma ponderată a alegerilor succesive. Concluzie: $\psi_n=-K\sum p_i\log p_i$, $K>0$. Ecrane cu calcul (cartea): (a) $H(\frac12,\frac13,\frac16)=\frac23+\frac12\log3=1.4591=H(\frac12,\frac12)+\frac12H(\frac23,\frac13)=1+\frac12\cdot0.9183$; (b) pentru codificarea din figura B:144 rezultă $\frac{47}{24}+\frac18\log3=2.1565$. Apoi schița (c-i): $A(s^m)=mA(s)$ prin descompunere pe $m$ niveluri; pentru $s^m\le t^n\le s^{m+1}$ se obțin $\big|\frac mn-\frac{\log t}{\log s}\big|\le\frac1n$ și $\big|\frac mn-\frac{A(t)}{A(s)}\big|\le\frac1n$, deci $A(t)=K\log t$; apoi cazul $p_i$ raționale și, prin continuitate, reale. Prezice la fiecare pas doar prima formulă; restul se citește.

### Vizual (viz "funcție convexă și coardă")

- **Data:** graficul lui $f(x)=x^2$ pe $[0,4]$; două puncte glisante $x_1,x_2$ (început $1$ și $3$) și un cursor de pondere $t\in[0,1]$.
- **Steps:** (1) apare coarda între $(x_1,f(x_1))$ și $(x_2,f(x_2))$; învățăcelul prezice dacă graficul e deasupra sau sub coardă pe interior; (2) cursorul $t$ merge: se afișează $f(tx_1+(1-t)x_2)$ (pe grafic) și $tf(x_1)+(1-t)f(x_2)$ (pe coardă), cu diferența colorată; învățăcelul prezice semnul diferenței înainte; (3) tragerea lui $x_2\to x_1$: diferența dispare, **punct de egalitate** (4=4 la ecranul 3); (4) comutator "concavă": $\log_2$ pe $[1,4]$, coarda sub grafic, sensul inegalității se inversează (valorile $1.3219$ și $1$).
- Accessibility: valorile numerice sunt mereu afișate; graficul nu e singura sursă.

### Retrieve (4 itemi, numere noi)

1. **$X$ ia valorile $0$ și $4$, fiecare cu probabilitatea $\frac12$; $f(x)=x^2$. Ce relație este adevărată?**
   - ✓ $f(E[X])=4\le E[f(X)]=8$.
   - ✗[sens inversat] $f(E[X])=4\ge E[f(X)]$: asta ar fi pentru concavă.
   - ✗[$E$ comută cu $f$] $E[f(X)]=f(E[X])=4$: media nu comută cu funcții neliniare (aici $E[f(X)]=\frac12\cdot0+\frac12\cdot16=8$).
2. **$X$ ia valorile $1$ și $16$, fiecare cu $\frac12$. Care relație este adevărată pentru $\log$ (baza 2)?**
   - ✓ $E[\log X]=2\le\log E[X]=\log8.5=3.0875$: $\log$ e concavă.
   - ✗[sens neinversat la concavă] $E[\log X]\ge\log E[X]$: sensul de la $x^2$ nu se păstrează la concavă.
   - ✗[$\log$ convexă] "$\log$ e convexă, deci Jensen merge ca la $x^2$": a doua derivată a lui $\log$ e negativă, deci e concavă.
3. **Pentru $x_1=2$ și $x_2=8$, ce relație este adevărată?** (`[construit]`)
   - ✓ $\frac{2+8}{2}=5\ge\sqrt{2\cdot8}=4$ (media aritmetică $\ge$ media geometrică, 0.79.b).
   - ✗[AM-GM inversată] $\sqrt{2\cdot8}\ge\frac{2+8}2$: Jensen pentru $\ln$, care e concavă, dă $\ln\frac{x_1+x_2}2\ge\frac{\ln x_1+\ln x_2}2$, adică media aritmetică e cea mare.
   - ✗[funcția greșită în Jensen] "Se obține din Jensen pentru $x^2$, care e convexă": cu $x^2$ obții $\left(\frac{x_1+x_2}2\right)^2\le\frac{x_1^2+x_2^2}2$, altă inegalitate; AM-GM vine din $\ln$ (concavă).
   (Builder: the equality condition for strictly convex $f$ is the "De ce?" screen of this lesson and is not asked again.)
4. **Care argument demonstrează $H(X)\le\log n$ pentru orice $n$?**
   - ✓ Jensen cu $\log$ concavă, ponderile $P(x_i)$ și punctele $\frac{1}{P(x_i)}$.
   - ✗[doar $n=2$] "Pentru $n=2$ graficul lui $H(p)$ arată $H\le1$, deci și pentru $n$ mare": un caz nu demonstrează cazul general.
   - ✗[Jensen cu convexă] Jensen pentru o funcție convexă aplicat lui $\log$: $\log$ nu e convexă, iar sensul ar ieși $H\ge\dots$.

### Exerciții

Toate sunt demonstrații (ecranele P1-P10 de mai sus, cu predicție la fiecare pas) în afară de 0.151, care e cu răspuns ales.

| Exercițiu | Ecran | Status |
|---|---|---|
| 0.78.a (1, 2, 3), 0.78.b (4, 5, 6) | P4 | book |
| 0.79.a, 0.79.b, 0.79.c | P1, P2, P3 | book |
| 0.143 | P5 (trei demonstrații) | slides (PS:157-165) |
| 0.144 | P6 | slides (PS:166-168) |
| 0.145.a, 0.145.b (și .c) | P7 | slides (PS:169-173) |
| 0.146.a, 0.146.b | P8 | slides (PS:150-156) |
| 0.59 | P9 | book |
| 0.62 (opțional) | P10 | book (B:143-148); allocation says "ruled" |

**Ex 0.151 (B:249; status: ruled; "propuse", fără răspuns tipărit).** Enunț: "Adevărat sau fals? (a) Entropia nu este negativă. (b) $H(X,Y)\ge H(X)+H(Y)$ pentru orice două variabile aleatoare. (c) Dacă $X$ și $Y$ sunt independente, atunci $H(X,Y)=H(X)+H(Y)$."
- **Fields:** (a) Adevărat; (b) Fals; (c) Adevărat; plus pentru (b) alegerea contraexemplului valid dintre: (i) $X,Y$ biți independenți; (ii) $X=Y$ un bit corect; (iii) $X$ constantă și $Y$ oarecare. Corect: (ii).
- **Hints:** (1) leagă fiecare enunț de o demonstrație din lecție; (2) pentru (b) caută un caz cu $Y$ complet determinat de $X$; (3) pentru $X=Y$ bit corect: $H(X,Y)=H(X)=1$, dar $H(X)+H(Y)=2$.
- **Soluție:** (a) adevărat, 0.55.a (demonstrat în Lecția 7). (b) fals: sensul corect este $H(X,Y)\le H(X)+H(Y)$ (0.59, P9), cu egalitate dacă și numai dacă independente; contraexemplu $X=Y$ bit corect: $1<2$. (c) adevărat, 0.144/0.59. Culegerea nu dă răspunsul; verificat de două ori.
- **Detectori:** (b) "Adevărat" -> [inegalitate inversată]: informația comună $IG\ge0$ face $H(X,Y)=H(X)+H(Y)-IG\le H(X)+H(Y)$; (a) "Fals" -> [entropie negativă posibilă]: fiecare termen $p\log\frac1p\ge0$; (c) "Fals" -> [independența nu ajunge]: independența dă $IG=0$, deci egalitate. Contraexemplu ales (i) sau (iii) -> [fără contraexemplu]: la (i) și (iii) egalitatea $H(X,Y)=H(X)+H(Y)$ are loc, deci nu infirmă (b).

### Builder notes (L23)

- Sources: B:170-179 (0.78, 0.79), B:244-246 (0.143-0.146), B:137 (0.59), B:143-148 (0.62), B:249 (0.151); PS:150-173 (IG≥0, H≤log n, chain), PS:232-240 (Jensen slides, not read line by line here: the book's 0.79 text is the authority used).
- The allocation example "2 ≤ 5" is wrong; correct is 4 ≤ 5 (problem 1).
- Gap in the book to carry as a one-line note, not fixed: 0.78.a statement 1 (midpoint property ⇒ convex) needs a regularity assumption such as continuity; the book's proof assumes the maximum of g exists.
- 0.78 proof detail is deliberately light (week-3 row asks only for the definitions); ordering inside the lesson: Concrete, Rule, Why, then P1-P3, P5-P9 (the ones the Special Seminar lists), then P4 and P10 marked optional.
- Uncertain: PS:232-240 not cross-checked; no learner-text claim depends on it.

---

## Lecția 24 (`ml-l24`). Entropia încrucișată, inegalitatea lui Gibbs, divergența Kullback-Leibler

**Priority C** (rândul Seminarului Special, S1/S2; selecția modelelor apare în carte ca aplicație). **Necesită:** vezi Lecția 7 (entropia), Lecția 8 ($IG$, lanțul, formula $IG=\sum P(x,y)\log\frac{P(x,y)}{P(x)P(y)}$), Lecția 18 (verosimilitatea și estimarea în sens MLE), Lecția 23 (Jensen; folosit în demonstrații).

**Titlu (RO):** Cât costă să folosești un model greșit: entropie încrucișată și KL

**Concepte (4):**
- (a) entropia încrucișată $CH(p,q)=-\sum_xp(x)\log q(x)$;
- (b) inegalitatea lui Gibbs $H(P)\le CH(P,Q)$, cu egalitate dacă și numai dacă $P=Q$;
- (c) entropia relativă (divergența Kullback-Leibler) $KL(p\|q)=CH(p,q)-H(p)$ și $IG$ ca $KL$;
- (d) selecția modelelor probabiliste după entropia încrucișată față de distribuția empirică, și legătura cu verosimilitatea.

**Owned:** definitions CH, Gibbs, KL, $IG(X;Y)=KL(p_{X,Y}\|p_Xp_Y)$, conditional KL and its chain rule, model selection; properties: $CH\ge0$, unbounded above, not symmetric (0.63); $CH(P,Q)=H(P)$ iff $P=Q$ (0.64); $KL\ge0$ with equality iff $p=q$, KL is not a distance; $IG=E_Y[KL(p_{X|Y}\|p_X)]$; $\arg\min KL(\hat P\|P_\theta)=\arg\max\sum\ln P_\theta(x^{(i)})$ (0.149); proofs 0.63.a, 0.64.a-b, 0.65.a-c, 0.148, 0.149; data: worked example $p=(\frac12,\frac12)$, $q=(\frac14,\frac34)$, 0.63.b, 0.147; exercises 0.60, 0.61 (optional), 0.63, 0.64, 0.65, 0.147, 0.148, 0.149 (optional).

### Pretest

Data on the same screen: o monedă măsluită are adevărata distribuție $p=(0.8,\ 0.2)$ (cap, pajură). Două persoane propun modele: **A** $=(0.7,\ 0.3)$ și **B** $=(0.5,\ 0.5)$. Codezi rezultatele monedei în biți, cu un cod construit după model: un rezultat de probabilitate $q$ în model costă $\log\frac1q$ biți.

RO: "Care model te costă mai puțin biți în medie, când monedele vin după adevărata distribuție $p$? Ordonează A și B. Și: cum ai calcula costul mediu?"

- **Expected:** A costă mai puțin. Costul mediu = media cu ponderile adevărate $p$ a lungimilor de cod ale modelului. (Valorile, pentru constructor, nu se arată încă: $0.7591$ pentru A, $1.0$ pentru B; entropia lui $p$ este $0.7219$.) Fields: ordinea (alegere) și un text liber.

### Concret (worked example, construit; date deținute doar aici)

Două monede. Adevărul: $p=(\frac12,\frac12)$. Modelul: $q=(\frac14,\frac34)$.

| Ecran | Se arată | Învățăcelul prezice | Valoarea corectă |
|---|---|---|---|
| 1 | $p=(\frac12,\frac12)$ | $H(p)$ | $1$ bit |
| 2 | Modelul $q$ dă coduri: cap costă $\log4=2$ biți, pajură $\log\frac43=0.4150$ biți | Costul mediu când datele vin din $p$: $\frac12\cdot2+\frac12\cdot0.4150$ | $CH(p,q)=\mathbf{1.2075}$ biți |
| 3 | Comparație cu $H(p)=1$ | Cât costă în plus? | $1.2075-1=\mathbf{0.2075}$ biți $=KL(p\|q)$. Verificare cu formula $-\sum p\log\frac qp=-\big(\frac12\log\frac12+\frac12\log\frac32\big)=0.5-0.2925=0.2075$ |
| 4 | Rolurile schimbate: datele vin din $q$, codul din $p$: costă $\log2=1$ bit pentru ambele rezultate | $CH(q,p)$; e egal cu $CH(p,q)$? | $CH(q,p)=1$; **nu**, $1\ne1.2075$ |
| 5 | $KL(q\|p)=CH(q,p)-H(q)$, cu $H(q)=0.8113$ | $KL(q\|p)$; e egal cu $KL(p\|q)$? | $1-0.8113=0.1887\ne0.2075$ |
| 6 | Gibbs: dacă $q=p$ | Cât costă codul "propriu"? | $CH(p,p)=H(p)$; în rest $CH(p,q)\ge H(p)$: nu poți câștiga cu un model greșit |

### Regula (definitions with sources)

- **R1.** $CH(p,q)=-\sum_xp(x)\log q(x)=E_p\big[\log\frac1{q(X)}\big]$: numărul mediu de biți pentru a coda un eveniment când codul se bazează pe $q$, nu pe adevărata $p$ (B:148-149; FND:36-37). Pentru distribuții continue, $\int$ în loc de $\sum$. Baza logaritmului este 2.
- **R2.** Proprietăți: $CH(p,q)\ge0$ (0.63.a); **nemărginită superior** (dacă $q(x)=0$ și $p(x)\ne0$, termenul $-p(x)\log q(x)\to+\infty$; B:150 nota 138; spre deosebire de $H\le\log n$); **nesimetrică**: în general $CH(p,q)\ne CH(q,p)$ (B:149).
- **R3.** Inegalitatea lui Gibbs: $H(P)\le CH(P,Q)$, adică $-\sum p_i\log p_i\le-\sum p_i\log q_i$, cu egalitate dacă și numai dacă $p_i=q_i$ pentru toți $i$ (0.64, B:151; FND:39).
- **R4.** Entropia relativă (divergența Kullback-Leibler): $KL(p\|q)=-\sum_xp(x)\log\frac{q(x)}{p(x)}=CH(p,q)-H(p)$: numărul de biți adiționali necesari în medie dacă valorile urmează $p$ dar codăm după $q$ (B:152). $KL(p\|q)\ge0$ și $KL(p\|q)=0$ dacă și numai dacă $p=q$.
- **R5.** $KL$ **nu e distanță**: nu e simetrică ($KL(p\|q)\ne KL(q\|p)$ în general) și nu verifică inegalitatea triunghiului (B:152 nota 141). *(Pentru simetrizare, divergența/distanța Jensen-Shannon și variația informației sunt distanțe adevărate: există, nu sunt pe test; FND:40, B:152 nota 141.)*
- **R6.** Câștigul de informație ca KL: $IG(X;Y)=KL(p_{X,Y}\|p_Xp_Y)=-\sum_x\sum_yp(x,y)\log\frac{p(x)p(y)}{p(x,y)}=H(X)-H(X|Y)$ și $IG(X;Y)=\sum_yp(y)\,KL(p_{X|Y=y}\|p_X)=E_Y[KL(p_{X|Y}\|p_X)]$ (0.65.b, B:152-153; FND:38). Formula $\sum P(x,y)\log\frac{P(x,y)}{P(x)P(y)}$ verificată numeric la ex. 0.142 (vezi Lecția 8) este deci $KL(p_{X,Y}\|p_Xp_Y)$.
- **R7.** KL condiționat: $KL(P(X|Y)\|Q(X|Y))=\sum_yP(y)\sum_xP(x|y)\log\frac{P(x|y)}{Q(x|y)}$ (media pe $y$ a divergențelor KL între condiționate); regula de înlănțuire $KL(P(X,Y)\|Q(X,Y))=KL(P(X)\|Q(X))+KL(P(Y|X)\|Q(Y|X))$ (0.148, B:246-247).
- **R8.** Selecția modelelor: pentru a alege între modele, calculează $CH(p_{\text{adevărat sau empiric}},\,q_{\text{model}})$ și alege valoarea mai mică; **argumentul întâi este distribuția adevărată (sau empirică), al doilea modelul**. Cross-entropia mică nu garantează că modelul e cel adevărat: distribuția empirică poate diferi de cea adevărată (B:150). Legătura cu verosimilitatea: maximizarea verosimilității datelor este minimizarea lui $KL(\hat P\|P_\theta)$ față de distribuția empirică $\hat P$ (0.149; vezi Lecția 18 pentru MLE).

### De ce?

RO: "$KL(p\|q)$ și $KL(q\|p)$ au fost $0.2075$ și $0.1887$ pentru aceleași două monede. De ce nu pot fi egale în general?"

- **Answer:** în $KL(p\|q)$ media se face cu ponderile lui $p$, în $KL(q\|p)$ cu ale lui $q$. Aceeași nepotrivire dintre modele (rapoartele $\frac pq$) se plătește cât de des o produce *adevărul*: ce e frecvent în $p$ contează mult în $KL(p\|q)$, ce e frecvent în $q$ contează mult în $KL(q\|p)$. De aceea nici inegalitatea triunghiului nu merge: nu e o distanță, ci un cost de cod, cu o direcție. *(Formulare scrisă aici; ideea de bază, numărul de biți adiționali când adevărul e $p$ și codul $q$, e din B:152.)*

### Demonstrații (ecrane cu predicție)

**0.63.a: $CH(p,q)\ge0$ (B:149).** Prezice semnul fiecărui termen: $q(x)\le1$, deci $\log q(x)\le0$, deci $-\log q(x)\ge0$; $p(x)\ge0$; fiecare termen $-p(x)\log q(x)\ge0$, suma $\ge0$. Remarcă (B:150): nu e mărginită superior.

**0.64.a-b: Gibbs (B:151, PS:198)**

| Pas | Prezice | Corect |
|---|---|---|
| a.1 | Ce funcție convexă, ce ponderi, ce puncte în Jensen? | $\varphi=-\log_a$ ($a>1$), ponderile $p(x_i)$, punctele $\frac{q(x_i)}{p(x_i)}$ |
| a.2 | Aplică $E[\varphi(X)]\ge\varphi(E[X])$ | $-\sum p(x_i)\log\frac{q(x_i)}{p(x_i)}\ge-\log\sum p(x_i)\frac{q(x_i)}{p(x_i)}$ |
| a.3 | Ce devine partea dreaptă? | $-\log\sum q(x_i)=-\log1=0$ |
| a.4 | Desface logaritmul din stânga | $-\sum p_i\log q_i+\sum p_i\log p_i\ge0$, adică $-\sum p_i\log p_i\le-\sum p_i\log q_i$ |
| b.1 | Când e egalitate în Jensen pentru $\varphi$ strict convexă? | doar dacă toate punctele sunt egale: $\frac{q_i}{p_i}=\alpha$ |
| b.2 | Determină $\alpha$ | $\sum q_i=\alpha\sum p_i$, adică $1=\alpha$; deci $p_i=q_i$ |

(Notă: termenii cu $p(x_i)=0$ contribuie $0$ și se omit din sumă, ca la convenția $0\log0=0$; vezi Lecția 7.)

**0.65.a: $KL(p\|q)\ge0$, egalitate iff $p=q$ (B:152-154).** Variantă 1 (din Gibbs): mută $H(p)$ în partea dreaptă: $0\le-\sum p_i\log q_i+\sum p_i\log p_i=KL(p\|q)$; egalitatea din 0.64.b. Variantă 2 (direct, Jensen cu $-\log$, ponderile $p(x)$, punctele $\frac{q(x)}{p(x)}$): $KL(p\|q)\ge-\log\sum q(x)=0$. Pentru $KL=0\Rightarrow p=q$: egalitatea din Jensen strict convexă cere $\frac{q(x)}{p(x)}=\alpha$ constant, $\alpha=1$. Prezice: ce funcție, ce ponderi, ce puncte.

**0.65.b: $KL(p_{X,Y}\|p_Xp_Y)=H(X)-H(X|Y)$ (B:153).**

| Pas | Prezice | Corect |
|---|---|---|
| 1 | Folosește $p(x,y)=p(x|y)p(y)$ în $\frac{p(x)p(y)}{p(x,y)}$ | $=\frac{p(x)}{p(x|y)}$ |
| 2 | Desface logaritmul | $-\sum\sum p(x,y)[\log p(x)-\log p(x|y)]$ |
| 3 | Primul termen $-\sum_x\log p(x)\sum_yp(x,y)$: ce sumă dă $p(x)$? | $\sum_yp(x,y)=p(x)$, deci $-\sum_xp(x)\log p(x)=H(X)$ |
| 4 | Al doilea termen $+\sum\sum p(x,y)\log p(x|y)$ | $-H(X|Y)$ (forma din 0.55.b, Lecția 8). Rezultat: $H(X)-H(X|Y)=IG(X;Y)$ |
| 5 | Observația | $IG=\sum_yp(y)\sum_xp(x|y)\log\frac{p(x|y)}{p(x)}=\sum_yp(y)\,KL(p_{X|Y=y}\|p_X)$ |

**0.65.c: $IG\ge0$ și $IG=0\Leftrightarrow X\perp Y$ ca *corolar* (B:154).** Prezice: din (a) $KL\ge0$, deci $IG\ge0$; $IG=0\Leftrightarrow KL(p_{X,Y}\|p_Xp_Y)=0\Leftrightarrow p_{X,Y}=p_Xp_Y\Leftrightarrow$ independente (aceasta este chiar definiția independenței). Demonstrația directă, mai lungă, e în Lecția 23 (0.146).

**0.148: KL condiționat și lanțul (B:246-247; PS:211-214)**

| Pas | Prezice | Corect |
|---|---|---|
| a.1 | Descompune $\frac{P(x,y)}{Q(x,y)}$ | $\frac{P(x)}{Q(x)}\cdot\frac{P(y|x)}{Q(y|x)}$ |
| a.2 | Logaritmul și sumele | $\sum_{x,y}P(x,y)\log\frac{P(x)}{Q(x)}+\sum_{x,y}P(x,y)\log\frac{P(y|x)}{Q(y|x)}$ |
| a.3 | Primul termen: $\sum_yP(x,y)=P(x)$ | $KL(P(X)\|Q(X))$; al doilea, cu $P(x,y)=P(x)P(y|x)$: $KL(P(Y|X)\|Q(Y|X))$. A doua egalitate din (148) se face la fel, rolurile schimbate |
| b.1 | Ipoteza folosită: cu $X=(X_1..X_n)$, $X_i$ independente condiționat de $Y$ (între ele, **împreună**) | $P(x|y)=\prod_iP(x_i|y)$ și la fel pentru $Q$ |
| b.2 | Raportul și logaritmul | $\log\prod_i\frac{P(x_i|y)}{Q(x_i|y)}=\sum_i\log\frac{P(x_i|y)}{Q(x_i|y)}$ |
| b.3 | Schimbă sumele, marginalizează pe celelalte $x_j$ | $\sum_i\sum_{x_i,y}P(x_i,y)\log\frac{P(x_i|y)}{Q(x_i|y)}=\sum_iKL(P(X_i|Y)\|Q(X_i|Y))$ |

(Atenție: enunțul cărții spune "pentru orice $i\ne j$, $X_i$ independent condiționat de $X_j$ în raport cu $Y$", adică doar două câte două, dar demonstrația folosește factorizarea comună; titlul exercițiului spune "mutual independente". Lecția afirmă factorizarea ca ipoteză. Vezi problema 4.)

**0.149 (opțional, B:247-248): $\arg\min_\theta KL(\hat P\|P_\theta)=\arg\max_\theta\sum_i\ln P_\theta(x^{(i)})$.** Date $D=\{x^{(1)}..x^{(m)}\}$, $\hat P$ uniformă pe date ($\hat P=\frac1m$ pe fiecare exemplu). Pas 1: $KL(\hat P\|P_\theta)=\sum\hat P\ln\hat P-\sum\hat P\ln P_\theta$. Pas 2: primul termen $=-H(\hat P)$ nu depinde de $\theta$. Pas 3: al doilea, $-\frac1m\sum_i\ln P_\theta(x^{(i)})$. Concluzie: minimizarea lui $KL$ în $\theta$ este maximizarea lui $\sum_i\ln P_\theta(x^{(i)})$ (log-verosimilitatea, Lecția 18). Prezice: care termen depinde de $\theta$? (baza logaritmului schimbă doar o constantă pozitivă). Status: ruled (propuse, fără răspuns tipărit; demonstrația de mai sus e algebra definițiilor).

### Vizual (viz "distribuții alăturate, CH, H, KL ca bare")

- **Data:** două distribuții $p$ și $q$ pe aceeași axă a valorilor (bare verticale pereche), apoi trei bare orizontale: $H(p)$, $CH(p,q)$, și diferența $KL(p\|q)$ colorată distinct.
- **Steps:** (1) $p=(\frac12,\frac12)$, $q=(\frac14,\frac34)$ ca la exemplul lucrat; învățăcelul prezice care bară e mai lungă, $H(p)$ sau $CH(p,q)$, apoi se arată $1$ și $1.2075$ și diferența $0.2075$; (2) comutatorul "schimbă rolurile" arată $H(q)=0.8113$, $CH(q,p)=1$, $KL(q\|p)=0.1887$; învățăcelul prezice dacă diferența crește sau scade; (3) cursor $q$ care se apropie de $p$: bara $KL$ se micșorează la $0$ când $q=p$ și $CH=H$; (4) $q$ cu o valoare $0$ unde $p>0$: bara $CH$ iese din ecran (nemărginită), cu eticheta "infinit".
- Prediction before each reveal; all values shown as numbers too.

### Retrieve (4 itemi, numere noi)

1. **Datele urmează $p=(\frac12,\frac12)$, codul e făcut pentru $q=(0.9,\ 0.1)$. Care valoare este numărul de biți *adiționali* față de codul perfect?**
   - ✓ $KL(p\|q)=0.737$.
   - ✗[CH în loc de KL] $CH(p,q)=1.737$: acesta e costul total, nu surplusul.
   - ✗[direcție inversată] $KL(q\|p)=0.531$: ai pus modelul în locul adevărului.
   - Values: $H(p)=1$, $CH(p,q)=1.7370$, $KL(p\|q)=0.7370$, $KL(q\|p)=0.5310$.
2. **Fie $a=(0.5,0.5)$, $b=(0.2,0.8)$, $c=(0.05,0.95)$. Ce este adevărat?**
   - ✓ $KL(a\|c)=1.198$ este mai mare decât $KL(a\|b)+KL(b\|c)=0.322+0.202=0.524$: inegalitatea triunghiului nu se verifică, deci KL nu e distanță.
   - ✗[KL e distanță] "$KL(a\|c)\le KL(a\|b)+KL(b\|c)$, ca la orice distanță": numerele arată contrariul.
   - ✗[simetrică] "$KL(p\|q)=KL(q\|p)$ pentru orice $p,q$": chiar pe datele de aici, $KL(a\|b)=0.322$, dar $KL(b\|a)=0.278$.
3. **Date: 4 aruncări dau $\hat p=(\frac34,\frac14)$. Moneda adevărată e corectă, $(\frac12,\frac12)$. Modelele: $F=(\frac12,\frac12)$ și $G=(\frac34,\frac14)$. $CH(\hat p,F)=1$, $CH(\hat p,G)=0.8113$. Ce concluzie e corectă?**
   - ✓ $G$ are $CH$ mai mic, deși $F$ este distribuția adevărată: eșantionul de 4 aruncări nu reflectă adevărul.
   - ✗[CH mic garantează modelul adevărat] "$G$ este cel adevărat, pentru că are $CH$ mai mic": $CH$ e calculat față de eșantion, iar 4 aruncări pot da $\frac34$ și cu o monedă corectă; un $CH$ mic arată doar că modelul seamănă cu eșantionul.
   - ✗[CH nu poate fi mai mic pentru modelul fals] "Imposibil: $F$ adevărat trebuie să aibă $CH$ mai mic": adevărul minimizează $CH$ față de adevăr, nu față de un eșantion mic.
4. **$p=(\frac12,\frac12)$ și un model $q=(1,0)$ (a doua valoare are probabilitatea $0$). Cât este $CH(p,q)$?**
   - ✓ Infinit: $-\frac12\log0\to+\infty$.
   - ✗[CH mărginită de $\log n$] "Cel mult $\log2=1$": $\log n$ mărginește entropia, nu cross-entropia.
   - ✗[model sigur = cost mic] "$0$, fiindcă $q$ e perfect de sigur": e sigur pe valoarea greșită.

### Exerciții

**Ex 1 (0.63.b, B:149-150; status: book).** Enunț: "Un model probabilistic pentru o variabilă cu 7 valori are două variante:
$q_1=(\frac1{10},\frac1{10},\frac15,\frac3{10},\frac15,\frac1{20},\frac1{20})$ și $q_2=(\frac1{20},\frac1{10},\frac3{20},\frac7{20},\frac15,\frac1{10},\frac1{20})$. Distribuția empirică a datelor de evaluare e $p_{\text{empiric}}=(\frac1{20},\frac1{10},\frac15,\frac3{10},\frac15,\frac1{10},\frac1{20})$. Calculează $CH(p_{\text{empiric}},q_1)$ și $CH(p_{\text{empiric}},q_2)$. Care model dă cross-entropie mai mică? Putem garanta că e cel mai bun? Explică."
- **Fields:** $CH(p,q_1)=2.5964$; $CH(p,q_2)=2.5627$ (tol $\pm0.001$; cartea: 2.596439345 și 2.562729118); alegere: modelul $q_2$; alegere: nu se poate garanta.
- **Hints:** (1) $CH=\sum p_i\log\frac1{q_i}$, cu $p=p_{\text{empiric}}$; (2) $\log\frac1{q_i}$: $\log10$, $\log10$, $\log5$, $\log\frac{10}3$, $\log5$, $\log20$, $\log20$ pentru $q_1$; (3) $CH(p,q_1)=\frac34+\log5-\frac3{10}\log3$.
- **Soluție (cartea):** $CH(p,q_1)=\frac34+\log5-\frac3{10}\log3=2.5964$; $CH(p,q_2)=\frac75+\log5-\frac15\log3-\frac3{10}\log7=2.5627$. $q_2$ are cross-entropie mai mică, deci pare mai bun. Dar distribuția empirică nu e cea adevărată (bias de eșantionare, date puține), deci nu putem garanta că $q_2$ e cel mai bun.
- **Valori suplimentare (calculate aici, "derived", nu din carte):** $H(p_{\text{empiric}})=2.5464$, $KL(p\|q_1)=0.0500$, $KL(p\|q_2)=0.0163$.
- **Detectori:** $2.8074$ ($=\log7$) -> [ai presupus un model uniform]; $2.5172$ la $q_2$ -> [argumente inversate]: ai calculat $CH(q_2,p)$ în loc de $CH(p,q_2)$; valori $<2.5464$ -> [sub entropia lui $p$]: Gibbs interzice $CH<H(p)$, deci greșeală; logaritmi naturali (≈ $1.80$ la $q_1$, $1.78$ la $q_2$) -> [ln în loc de log₂].

**Ex 2 (0.147, B:246; status: verified-twice).** Enunț: "Un zar măsluit are adevărata distribuție $P_{\text{true}}=(0.08,0.55,0.15,0.12,0.05,0.05)$. A propune $P_A=(0.07,0.14,0.24,0.24,0.05,0.26)$, iar B propune $P_B=(0.25,0.13,0.21,0.03,0.11,0.27)$. (a) Cum ai măsura care model e mai bun? (b) Calculează $CH(P_{\text{true}},P_A)$, $CH(P_{\text{true}},P_B)$ și $CH(P_{\text{true}},P_{\text{true}})$. Care model e mai bun?"
- **Fields:** (a) text liber, nu se notează (răspuns așteptat: comparând cross-entropia față de adevăr, ceea ce cere (b)); (b) $CH(P_{\text{true}},P_A)=2.7362$; $CH(P_{\text{true}},P_B)=2.9773$; $CH(P_{\text{true}},P_{\text{true}})=1.9757$ (tol $\pm0.001$); alegere: $P_A$.
- **Hints:** (1) $CH(P_{\text{true}},Q)=-\sum_iP_{\text{true}}(i)\log Q(i)$: ponderile sunt cele *adevărate*; (2) al doilea se scrie $P_{\text{true}}$ peste tot: $CH(P_{\text{true}},P_{\text{true}})=H(P_{\text{true}})$; (3) $-0.08\log0.07-0.55\log0.14-\dots$
- **Soluție:** $CH(P_{\text{true}},P_A)=2.7362$, $CH(P_{\text{true}},P_B)=2.9773$, $CH(P_{\text{true}},P_{\text{true}})=H(P_{\text{true}})=1.9757$. Modelul cu cross-entropia mai mică e $P_A$. Valori derivate: $KL(P_{\text{true}}\|P_A)=2.7362-1.9757=0.7605$, $KL(P_{\text{true}}\|P_B)=1.0017$ ("derived"). Culegerea nu dă răspunsul; verificat de două ori.
- **Detectori:** $3.1066$ la A și $3.3320$ la B -> [argumente inversate]: $CH(\text{model},\text{adevărat})$ în loc de $CH(\text{adevărat},\text{model})$; $2.5850$ ($=\log6$) -> [model uniform]; $2.0$ sau mai puțin la A sau B -> [sub $H(P_{\text{true}})=1.9757$ nu se poate pentru un model diferit]; $CH(P_{\text{true}},P_{\text{true}})\ne1.9757$ -> "este chiar entropia lui $P_{\text{true}}$".

**Ex 3 (0.60, B:137-139; opțional, status: book).** Enunț: "Entropia unei variabile continue cu densitatea $p$: $H(X)=-\int p(x)\log p(x)\,dx$ (cu $-p\log p=0$ când $p=0$). (a) uniforma pe $[a,b]$; (b) gaussiana $N(\mu,\sigma^2)$; (c) gaussiana în $\mathbb R^d$."
- **Ecran de enunț + soluția din carte, fără câmpuri notate.** (a) $f=\frac1{b-a}$ pe $[a,b]$, deci $H=\log(b-a)$. (b) $H=\frac12\log(2\pi e\sigma^2)$. (c) cartea ajunge la $H=\frac1{\ln2}\Big(\frac d2\ln(2\pi)+\frac12\ln|\Sigma|+\frac d2\Big)$ (echivalent, $\frac12\log\big((2\pi e)^d|\Sigma|\big)$, forma echivalentă calculată aici).
- **Notă:** din (a) rezultă că entropia diferențială poate fi negativă ($b-a<1$), spre deosebire de cea discretă (consecință directă a formulei, "derived"). Control numeric (aici): $N(0,2^2)$ dă $3.0471$ biți, prin integrare numerică.

**Ex 4 (0.61, B:140-142; opțional, status: ruled în alocare, dar cartea tipărește soluția).** Enunț: "Entropiile (a) distribuției exponențiale cu parametrul $\lambda>0$, $p(x)=\lambda e^{-\lambda x}$ pentru $x\ge0$; (b) distribuției Gamma$(r,\alpha)$, $p(x)=\frac{\alpha^r}{\Gamma(r)}x^{r-1}e^{-\alpha x}$ pentru $x\ge0$."
- **Ecran de enunț + soluția din carte, fără câmpuri notate.** (a) $H=\frac{1-\ln\lambda}{\ln2}$. (b) $H=\frac1{\ln2}\big(r-\ln\alpha+\ln\Gamma(r)+(1-r)\psi(r)\big)$, cu $\psi$ funcția digamma. Control numeric (aici): $\lambda=2$ dă $0.4427$ biți; $r=3,\alpha=2$ dă $1.6655$ biți, ambele confirmate prin integrare numerică.

**Ex 5 (0.64.a-b).** Demonstrație Gibbs: ecranele de mai sus (status book, B:151).
**Ex 6 (0.63.a, 0.65.a-c, 0.148, 0.149).** Demonstrațiile de mai sus. 0.63.a: book; 0.65: book; 0.148: slides (PS:211-214); 0.149: ruled, opțional.

### Builder notes (L24)

- Sources: B:148-154 (0.63-0.65), B:246-248 (0.147-0.149), B:137-142 (0.60, 0.61); PS:196-214 (Gibbs, KL, KL condiționat); FND:36-40; IT:1-2 (handout with old numbers, C-7).
- Do **not** reuse the Concrete pair $(\frac12,\frac12)$ / $(\frac14,\frac34)$ in the quiz; the quiz uses $(0.9,0.1)$, $(a,b,c)$ and a 4-toss sample.
- Do not repeat FND:39 "KL is upper-bounded" (false in general, problem 5).
- Trick found while checking: $CH(q_1,p)=CH(p,q_1)=2.5964$ for the 0.63.b data (coincidence), so the "arguments swapped" detector works for $q_2$ only.
- Uncertain: none for the numbers; the Why-answer sentence is mine and labelled.

---

# Tests

## Testele (Teste tab, mod hârtie; nu sunt lecții în player)

**Common shape (both tests).** One problem per screen. The learner reads the statement, writes on paper, presses "Predă", then sees the full solution and ticks the barem items they earned; the screen adds up the points. A timer is optional and never blocks (mock: 100 min, T21P: 1 h 30). Minimum to pass: 1,5 p of 6. Each solution screen ends with a line "Dacă ai greșit aici, revezi Lecția N" built from the problem-to-lesson table of each test. Wrong-answer items go to the Recapitulare pile as new-number variants, never as the identical question.

**Hint tables.** Every statement that needs logarithms prints the H(p) values it needs; **the values below are recomputed by script** (T20C prints $H(1/5)$ and $H(2/5)$ swapped; here they are correct: $H(1/5)=0{,}7219$, $H(2/5)=0{,}9710$).

### 5.1 `ml-test-mock-t1`: Test de probă T1 (6 p, 100 min, minim 1,5 p)

New numbers on every problem (none of the data of any lesson or of T21P is reused; variants can be generated and verified by script, constraints per problem in the builder notes). Adapted problem types from the allocation: 1 (aeroport + independență + demonstrație + adevărat/fals), 2 (tabel comun), 3 (entropie și câștig), 4 (ID3 cu atribut continuu), 5 (eroare, CVLOO, overfitting), 6 (Bayes Naiv față de Bayes Comun).

| # | Problem | Points | Lessons shown on review |
|---|---|---|---|
| 1 | Probabilități: Bayes cu probabilitate totală, independență, demonstrație, adevărat/fals | 0,9 | 1, 2, 3 |
| 2 | Tabel comun: independență, independență condiționată, E, Var, Cov | 1,1 | 4, 5, 6 |
| 3 | Entropie și câștig: definiția întâi, ciot, monotonia lui H(p) | 0,8 | 7, 8, 9, 10 |
| 4 | ID3 de mână cu un atribut continuu | 1,3 | 9, 11, 14 |
| 5 | Eroare la antrenare, CVLOO, overfitting; adevărat/fals pe ID3 | 1,0 | 12, 13, 15 |
| 6 | Bayes Naiv față de Bayes Comun pe un tabel | 0,9 | 20, 21, 22 |

#### Problema 1 (0,9 p): Probabilități

> **a. (0,3 p)** La un control de calitate, 0,4% dintre piese sunt defecte. Aparatul respinge 95% dintre piesele defecte și 8% dintre piesele bune. O piesă este respinsă. Care este probabilitatea ca ea să fie defectă? Indicați formula folosită și înlocuiți numeric; nu este necesar să duceți calculul până la capăt.
> **b. (0,2 p)** Pentru evenimentele $A$ și $B$ avem $P(A)=0{,}4$, $P(B)=0{,}25$ și $P(A\cup B)=0{,}6$. Sunt $A$ și $B$ independente? Justificați.
> **c. (0,2 p)** Demonstrați formula probabilității totale: pentru $0<P(B)<1$, $P(A)=P(A|B)P(B)+P(A|\bar B)P(\bar B)$.
> **d. (0,2 p)** Pentru fiecare afirmație spuneți dacă este adevărată sau falsă; la cea adevărată dați demonstrația, la cea falsă un contraexemplu. **(i)** Dacă $A\subseteq B$, atunci $P(A)\le P(B)$. **(ii)** Dacă $A$ și $B$ sunt incompatibile și $P(A)>0$, $P(B)>0$, atunci $A$ și $B$ sunt independente. (0,1 p fiecare)

**Solution.** (a) $D$ = piesa e defectă, $R$ = respinsă. Bayes cu probabilitatea totală: $P(D|R)=\dfrac{P(R|D)P(D)}{P(R|D)P(D)+P(R|\bar D)P(\bar D)}=\dfrac{0{,}95\cdot0{,}004}{0{,}95\cdot0{,}004+0{,}08\cdot0{,}996}=\dfrac{0{,}0038}{0{,}08348}\approx0{,}0455$ (`[construit]`, exact $95/2087$). (b) Regula de adunare: $P(A\cap B)=0{,}4+0{,}25-0{,}6=0{,}05$; produsul $P(A)P(B)=0{,}1\neq0{,}05$: **nu** sunt independente. (Verificare echivalentă: dacă ar fi independente, $P(A\cup B)=0{,}4+0{,}25-0{,}1=0{,}55\neq0{,}6$.) (c) $A=(A\cap B)\cup(A\cap\bar B)$, uniune de evenimente disjuncte; aditivitatea dă $P(A)=P(A\cap B)+P(A\cap\bar B)$; definiția probabilității condiționate dă $P(A\cap B)=P(A|B)P(B)$ și $P(A\cap\bar B)=P(A|\bar B)P(\bar B)$ (cu $P(B),P(\bar B)>0$). (d)(i) adevărat: $B=A\cup(B\setminus A)$, disjuncte, deci $P(B)=P(A)+P(B\setminus A)\ge P(A)$. (ii) fals: incompatibile înseamnă $P(A\cap B)=0$, dar $P(A)P(B)>0$; contraexemplu: zar corect, $A=\{1\}$, $B=\{2\}$: $0\ne\frac16\cdot\frac16$.

**Barem.** (a) 0,1 formula Bayes numită sau scrisă; 0,1 numitorul cu probabilitatea totală (ambii termeni); 0,1 substituirea corectă. (b) 0,1 regula de adunare pentru $P(A\cap B)$; 0,05 compararea cu $P(A)P(B)$; 0,05 concluzia. (c) 0,05 descompunerea disjunctă; 0,05 aditivitatea; 0,05 definiția condiționatei; 0,05 condițiile $P(B),P(\bar B)>0$. (d) 0,1 + 0,1 (valoare de adevăr și demonstrația/contraexemplul).

**Capcane (detectoare la nota de autoevaluare).** (a) $0{,}95$ sau $0{,}0038$ ca răspuns: este verosimilitatea, respectiv numărătorul; fără numitor nu e o probabilitate. Uitarea termenului $P(R|\bar D)P(\bar D)$ dă $1$. (b) "Independente fiindcă $P(A\cup B)$ e mare": independența se verifică prin produs. (d)(ii) "adevărat, fiindcă nu au elemente comune": incompatibil nu înseamnă independent.

#### Problema 2 (1,1 p): Tabel comun

> Tabelul comun al variabilelor $X\in\{0,1\}$ și $Y\in\{0,1,2\}$ conține două probabilități necunoscute, $p$ și $q$:
>
> | | $Y=0$ | $Y=1$ | $Y=2$ |
> |---|---|---|---|
> | $X=0$ | 0,20 | $p$ | 0,08 |
> | $X=1$ | 0,30 | 0,18 | $q$ |
>
> **a. (0,5 p)** Aflați $p$ și $q$ știind că $X$ și $Y$ sunt independente și verificați independența pe toate celulele.
> **b. (0,2 p)** Variabilele binare $X,Y,Z$ au distribuția comună de mai jos. Sunt $X$ și $Y$ independente condiționat de $Z$? Scrieți definiția și verificați-o.
>
> | | $Z=0$, $Y=0$ | $Z=0$, $Y=1$ | $Z=1$, $Y=0$ | $Z=1$, $Y=1$ |
> |---|---|---|---|---|
> | $X=0$ | 0,10 | 0,10 | 0,03 | 0,07 |
> | $X=1$ | 0,15 | 0,15 | 0,12 | 0,28 |
>
> **c. (0,4 p)** Pentru tabelul de la (a) (cu $p$ și $q$ aflate) calculați $E[X]$, $\mathrm{Var}[Y]$ și $\mathrm{Cov}[X,Y]$. Indicați formula și duceți calculele până la capăt.

**Solution.** (a) Independență: $P(X{=}x,Y{=}y)=P(X{=}x)P(Y{=}y)$ pentru toate $(x,y)$. Din prima coloană: $P(Y{=}0)=0{,}5$; $P(X{=}0)=\dfrac{0{,}20}{0{,}5}=0{,}4$ și $P(X{=}1)=\dfrac{0{,}30}{0{,}5}=0{,}6$. Atunci $p=P(X{=}0)P(Y{=}1)$, iar $P(Y{=}1)=\dfrac{0{,}18}{0{,}6}=0{,}3$ (din celula $X=1$): $p=0{,}4\cdot0{,}3=\mathbf{0{,}12}$. $P(Y{=}2)=\dfrac{0{,}08}{0{,}4}=0{,}2$ (din celula $X=0$), $q=0{,}6\cdot0{,}2=\mathbf{0{,}12}$. Verificare: suma este $0{,}20+0{,}12+0{,}08+0{,}30+0{,}18+0{,}12=1$; marginalele $X$: $(0{,}4;0{,}6)$, $Y$: $(0{,}5;0{,}3;0{,}2)$; produsele dau exact cele șase celule. (b) Definiție: $P(X{=}x,Y{=}y|Z{=}z)=P(X{=}x|Z{=}z)P(Y{=}y|Z{=}z)$ pentru toate $(x,y,z)$. $P(Z{=}0)=0{,}5$: $P(X{=}0|Z{=}0)=0{,}4$, $P(Y{=}0|Z{=}0)=0{,}5$, $P(X{=}0,Y{=}0|Z{=}0)=\frac{0{,}10}{0{,}5}=0{,}2=0{,}4\cdot0{,}5$ ✓; la fel pentru celelalte trei celule cu $Z=0$ ($\frac{0{,}10}{0{,}5}=0{,}2$, $\frac{0{,}15}{0{,}5}=0{,}3$, $0{,}3$ față de $0{,}4\cdot0{,}5$, $0{,}6\cdot0{,}5$, $0{,}6\cdot0{,}5$); $Z=1$: $P(X{=}0|Z{=}1)=0{,}2$, $P(Y{=}0|Z{=}1)=0{,}3$, $\frac{0{,}03}{0{,}5}=0{,}06=0{,}2\cdot0{,}3$ ✓ și celelalte trei. **Da, sunt independente condiționat de $Z$.** (Remarcă: necondiționat nu sunt independente: $P(X{=}0,Y{=}0)=0{,}13$, dar $P(X{=}0)P(Y{=}0)=0{,}3\cdot0{,}4=0{,}12$.) (c) $E[X]=0\cdot0{,}4+1\cdot0{,}6=0{,}6$; $E[Y]=0{,}3+2\cdot0{,}2=0{,}7$, $E[Y^2]=0{,}3+4\cdot0{,}2=1{,}1$, $\mathrm{Var}[Y]=E[Y^2]-E[Y]^2=1{,}1-0{,}49=0{,}61$; $E[XY]=1\cdot1\cdot0{,}18+1\cdot2\cdot0{,}12=0{,}42$, $\mathrm{Cov}[X,Y]=E[XY]-E[X]E[Y]=0{,}42-0{,}42=0$ (consistent cu independența).

**Barem.** (a) 0,1 definiția independenței; 0,1 $p$; 0,1 $q$; 0,2 verificarea celor șase celule (0,2 doar dacă le verifică pe toate; una singură nu ajunge). (b) 0,05 definiția; 0,1 verificarea (toate cele opt celule sau argument echivalent pe marginale condiționate); 0,05 concluzia. (c) 0,1 $E[X]$; 0,1 $\mathrm{Var}[Y]$ (cu $E[Y]$ și $E[Y^2]$); 0,2 $\mathrm{Cov}$ ($E[XY]$ 0,1 + formula 0,1).

**Capcane.** (a) A verifica o singură celulă; a rezolva $p,q$ numai din suma 1 (un sistem cu o ecuație și două necunoscute). (b) A verifica independența necondiționată în locul celei condiționate. (c) $\mathrm{Var}[Y]=E[Y^2]-E[Y]$ (uită pătratul); $\mathrm{Cov}=E[XY]$ fără $E[X]E[Y]$.

#### Problema 3 (0,8 p): Entropie și câștig

> Un set de 12 exemple cu atributele binare $A$, $B$ și clasa $Y\in\{+,-\}$ (numărul de exemple pe combinație):
>
> | $A$ | $B$ | $Y=+$ | $Y=-$ |
> |---|---|---|---|
> | 0 | 0 | 3 | 1 |
> | 0 | 1 | 2 | 0 |
> | 1 | 0 | 1 | 1 |
> | 1 | 1 | 0 | 4 |
>
> Valori ale entropiei binare: $H(1/6)=0{,}6500$, $H(1/3)=0{,}9183$, $H(1/2)=1$.
> **a. (0,2 p)** Scrieți definiția câștigului de informație $IG(Y;A)$ și înlocuiți numeric pentru atributul $A$, fără să duceți calculul până la capăt.
> **b. (0,3 p)** Desenați cele două cioturi (pentru $A$ și pentru $B$), scrieți $H(Y|A)$ și $H(Y|B)$ în formă generală, calculați-le și alegeți atributul pentru nodul rădăcină.
> **c. (0,3 p)** Argumentați aceeași alegere **fără calculator**, doar prin monotonia lui $H(p)$.

**Solution.** Total $[6+,6-]$, $H(Y)=H(1/2)=1$. Ciotul $A$: $A=0$: $[5+,1-]$ (6 exemple), $A=1$: $[1+,5-]$ (6 exemple). Ciotul $B$: $B=0$: $[4+,2-]$, $B=1$: $[2+,4-]$ (câte 6). (a) $IG(Y;A)=H(Y)-H(Y|A)=H\!\left(\tfrac12\right)-\left[\tfrac6{12}H\!\left(\tfrac16\right)+\tfrac6{12}H\!\left(\tfrac16\right)\right]$ (fiindcă $[5+,1-]$ și $[1+,5-]$ au aceeași entropie, $H(p)=H(1-p)$). (b) $H(Y|A)=\sum_vP(A{=}v)H(Y|A{=}v)=H(1/6)=0{,}6500$; $H(Y|B)=H(1/3)=0{,}9183$. $IG(A)=1-0{,}6500=0{,}3500$, $IG(B)=1-0{,}9183=0{,}0817$. Rădăcina: $A$ (entropia condiționată medie minimă, câștig maxim). (c) Ponderile sunt egale în ambele cioturi ($\frac6{12}$ și $\frac6{12}$); copiii au proporția minoritară $\frac16$ (la $A$), respectiv $\frac13$ (la $B$); cum $\frac16<\frac13<\frac12$ și $H$ este strict crescătoare pe $[0,\frac12]$, $H(1/6)<H(1/3)$, deci $H(Y|A)<H(Y|B)$ și $A$ este alegerea. `[construit]`.

**Barem.** (a) 0,1 definiția; 0,1 substituirea. (b) 0,1 cele două cioturi desenate corect; 0,1 formula $H(Y|\cdot)=\sum P(\cdot)H(\cdot)$ pentru ambele; 0,1 valorile și alegerea. (c) 0,1 ponderile egale; 0,1 monotonia lui $H$ pe $[0,\frac12]$ cu ordonarea $\frac16<\frac13<\frac12$; 0,1 concluzia.

**Capcane.** A alege atributul cu entropia condiționată **mai mare** (confuzia $H(Y|A)$ cu $IG$); a compara fără ponderi (aici ponderile sunt egale, dar în general conteaza); $\log$ în altă bază; $H(Y|A)=H(5/6)\ne H(1/6)$ crezut diferit (egale).

#### Problema 4 (1,3 p): ID3 de mână cu un atribut continuu

> Datele (ipotetice) ale unei firme de curierat: $A$ = livrare în weekend (1 = da), $B$ = zonă urbană (1 = da), $C$ = distanța în km (atribut **continuu**), $Y=1$ dacă coletul a ajuns la timp.
>
> | rând | $A$ | $B$ | $C$ | $Y$ |
> |---|---|---|---|---|
> | r1 | 1 | 1 | 6 | 0 |
> | r2 | 0 | 1 | 3 | 1 |
> | r3 | 1 | 1 | 8 | 1 |
> | r4 | 0 | 1 | 2 | 1 |
> | r5 | 1 | 0 | 5 | 0 |
> | r6 | 0 | 1 | 8 | 1 |
> | r7 | 1 | 1 | 10 | 0 |
> | r8 | 0 | 1 | 3 | 1 |
>
> Pentru atributele continue se testează praguri $C\le t$, cu $t$ la mijlocul dintre două valori vecine **cu etichete diferite**. La egalitate de câștig se alege primul test în ordinea $A$, $B$, $C$ (pragurile în ordine crescătoare). Valori ale entropiei binare: $H(1/4)=0{,}8113$, $H(2/7)=0{,}8631$, $H(1/3)=0{,}9183$, $H(2/5)=0{,}9710$, $H(3/8)=0{,}9544$, $H(1/2)=1$.
> **a. (0,2 p)** Câte praguri distincte trebuie considerate pentru $C$? Care sunt?
> **b. (0,6 p)** Elaborați arborele produs de ID3 (fără pruning), justificând fiecare alegere de nod.
> **c. (0,2 p)** Cum este clasificată instanța $(A{=}1,B{=}0,C{=}8{,}5)$? Scrieți arborele ca reguli.
> **d. (0,3 p)** Este setul consistent? Care este eroarea la antrenare a arborelui?

**Solution.** (a) Sortat după $C$: $2(1),3(1),3(1),5(0),6(0),8(1),8(1),10(0)$ (între paranteze $Y$). Etichetele se schimbă între 3 și 5, între 6 și 8 și între 8 și 10: **3 praguri**: $4{,}0$, $7{,}0$, $9{,}0$ (nu cele 5 mijloace ale valorilor distincte). (b) $[5+,3-]$, $H(Y)=H(3/8)=0{,}9544$. Candidații la rădăcină: $A$: $A=0$ $[4+,0-]$, $A=1$ $[1+,3-]$: $H(Y|A)=\frac48\cdot0+\frac48H(1/4)=0{,}4056$, $IG=0{,}5488$. $B$: $B=0$ $[0+,1-]$, $B=1$ $[5+,2-]$: $H=\frac78H(2/7)=0{,}7552$, $IG=0{,}1992$. $C\le4$: $[3+,0-]$ și $[2+,3-]$: $\frac58H(2/5)=0{,}6068$, $IG=0{,}3476$. $C\le7$: $[3+,2-]$ și $[2+,1-]$: $\frac58H(2/5)+\frac38H(1/3)=0{,}9512$, $IG=0{,}0032$. $C\le9$: la fel ca $B$ ($[5+,2-]$, $[0+,1-]$): $IG=0{,}1992$. **Rădăcina: $A$** (IG maxim $0{,}5488$). $A=0$: $[4+,0-]$, frunză $Y=1$. $A=1$: rândurile r1, r3, r5, r7: $[1+,3-]$, $H=0{,}8113$; candidați: $B$ ($[0+,1-]$, $[1+,2-]$): $IG=0{,}1226$; $C\le7$ ($[0+,2-]$, $[1+,1-]$): $IG=0{,}3113$; $C\le9$ ($[1+,2-]$, $[0+,1-]$): $IG=0{,}1226$ → **$C\le7$**: stânga ($C=5,6$) frunză $Y=0$; dreapta ($C=8,10$: $[1+,1-]$): $B$ are $IG=0$ (ambele rânduri au $B=1$), $C\le9$ are $IG=1$ → **$C\le9$**: $C\le9$ (8) frunză $Y=1$, $C>9$ (10) frunză $Y=0$. Arborele (3 teste): $A=0\to1$; $A=1\to$ ($C\le7\to0$; altfel $C\le9\to1$, altfel $0$). (c) $A=1$, $C=8{,}5>7$ și $\le9$: **$Y=1$** (la timp). Reguli: `IF A=0 THEN Y=1`; `IF A=1 ∧ C≤7 THEN Y=0`; `IF A=1 ∧ 7<C≤9 THEN Y=1`; `IF A=1 ∧ C>9 THEN Y=0`. (d) Consistent: nicio instanță cu aceleași valori $(A,B,C)$ nu apare cu două clase ($r2$ și $r8$ sunt identice, dar au aceeași clasă). Toate frunzele sunt pure, deci eroarea la antrenare este **0**.

**Barem.** (a) 0,1 regula (schimbarea etichetei); 0,1 numărul și valorile. (b) 0,2 rădăcina cu candidații și IG (sau $H(Y|\cdot)$) justificate; 0,2 al doilea nod ($C\le7$ cu motivul); 0,2 al treilea nod ($C\le9$) și frunzele. (c) 0,1 clasificarea; 0,1 regulile. (d) 0,1 consistență cu motiv; 0,1 eroarea 0; 0,1 justificare (frunze pure).

**Capcane.** A număra $5$ sau $7$ praguri; a lua $B$ drept rădăcină din intuiție; a uita că un prag se re-calculează din punctele care ajung în nod; a spune "inconsistent" din cauza rândurilor $r2$, $r8$ identice (au aceeași clasă).

#### Problema 5 (1,0 p): Eroare la antrenare, CVLOO, overfitting; adevărat/fals

> Opt puncte în plan, cu etichete $+$ sau $-$ (figura: pe rândul $X_2=2$ toate cele patru puncte sunt $+$; pe rândul $X_2=1$, la $X_1=1,2,3,4$ etichetele sunt $-,+,-,-$):
>
> | | $X_1=1$ | $X_1=2$ | $X_1=3$ | $X_1=4$ |
> |---|---|---|---|---|
> | $X_2=2$ | $+$ | $+$ | $+$ | $+$ |
> | $X_2=1$ | $-$ | $+$ | $-$ | $-$ |
>
> $DT^*$ este arborele ID3 fără pruning (testează praguri pe $X_1$ și $X_2$), $DT_2$ este arborele cu un singur nod de test și decizii majoritare. La egalitate de câștig alegeți orice test: răspunsul la acest exercițiu nu depinde de alegere.
> **a. (0,3 p)** Eroarea la antrenare a lui $DT^*$ și eroarea CVLOO. Indicați punctele clasificate greșit la CVLOO (desenați granițele de decizie).
> **b. (0,2 p)** Este $DT^*$ în overfitting față de $DT_2$? Dați definiția riguroasă (din Mitchell) și argumentați.
> **c. (0,3 p)** Adevărat sau fals, cu argumentare: **(i)** ID3 garantează arborele cu număr minim de noduri; **(ii)** în ID3 (atribute discrete) un atribut poate apărea de două ori pe același drum de la rădăcină la o frunză; **(iii)** pentru $m$ atribute discrete, adâncimea unui arbore ID3 este cel mult $m$.
> **d. (0,2 p)** Un student compară trei modele după ce le-a antrenat pe setul de antrenare: Bayes Naiv (eroare la antrenare 8%, la validare 9%); ID3 (1% și 34%); ID3 cu un singur test (41% și 43%). Ce model alege? Ce probleme au celelalte două?

**Solution.** (a) $DT^*$: rădăcina $X_2\le1{,}5$ ($IG=0{,}5488$): sus (4 puncte, toate $+$) frunză $+$; jos $X_1\le2{,}5$, apoi $X_1\le1{,}5$: $(1,1)\to-$, $(2,1)\to+$, iar $X_1>2{,}5\to-$. Eroare la antrenare **0** (datele sunt consistente). CVLOO: scoți pe rând punctul și reconstruiești: $(1,1)$ este prezis $+$ (fără el, jos rămân $+,-,-$ cu pragul la 2,5 și $x_1=1$ cade în zona lui $(2,1)$); $(2,1)$ este prezis $-$ (fără el rândul de jos e tot $-$, arborele se reduce la $X_2\le1{,}5$); $(3,1)$ este prezis $+$ (rămân $-,+,-$ pe rândul de jos; pragurile se așază la $1{,}5$ și la $3{,}0$, mijlocul dintre 2 și 4, deci $x_1=3$ cade în zona $+$ a lui $(2,1)$); $(4,1)$ corect; cele patru puncte de sus corecte. **CVLOO $=3/8$**, puncte greșite: $(1,1)$, $(2,1)$, $(3,1)$. (b) Definiție (Mitchell): ipoteza $h$ face **overfitting** pe datele de antrenament dacă există $h'$ cu $err_{train}(h)<err_{train}(h')$ și $err_{D}(h)>err_{D}(h')$, unde $err_D$ este eroarea pe distribuția întreagă (o estimăm prin CVLOO). $DT_2$ (testul $X_2\le1{,}5$; sus $+$, jos $-$): eroare la antrenare $1/8$ (punctul $(2,1)$), CVLOO $1/8$. $err_{train}(DT^*)=0<\frac18=err_{train}(DT_2)$ și $\text{CVLOO}(DT^*)=\frac38>\frac18=\text{CVLOO}(DT_2)$: **da, $DT^*$ este în overfitting** (față de $DT_2$). (c) (i) **fals**: ID3 alege greedy, local, atributul cu IG maxim, fără căutare în spațiul arborilor; există seturi unde dă un arbore mai mare decât optimul (T21P 17a). (ii) **fals**: după ce un atribut a fost testat, toate instanțele din nod au aceeași valoare pentru el, IG $=0$ (și ID3 îl elimină de pe drum); poate apărea însă în ramuri diferite. (iii) **adevărat**: pe un drum fiecare atribut apare cel mult o dată. (d) **Bayes Naiv** (eroarea de validare minimă, 9%; gap mic). **ID3** are overfitting (antrenare 1%, validare 34%: gap mare). **ID3 cu un test** are underfitting (erori mari și apropiate, 41% și 43%). Remediu pentru overfitting: pruning (sau mai multe date). `[construit]` (datele figurii și numerele de la (d)).

**Barem.** (a) 0,1 eroarea 0 cu motiv; 0,1 CVLOO $3/8$; 0,1 cele trei puncte. (b) 0,1 definiția; 0,1 compararea celor două erori pentru ambele arbori. (c) 0,1 + 0,1 + 0,1 (valoare + argument). (d) 0,1 modelul ales cu motiv; 0,1 diagnosticele (overfitting / underfitting).

**Capcane.** "Eroare mică la antrenare = model bun"; a calcula CVLOO pe arborele fix (fără a reconstrui la fiecare scoatere); "overfitting = eroare mare la antrenare" (este invers).

#### Problema 6 (0,9 p): Bayes Naiv și Bayes Comun

> Pentru atributele binare $A$, $B$ și clasa $Y$ s-au observat 20 de exemple:
>
> | $A$ | $B$ | $Y$ | nr. apariții |
> |---|---|---|---|
> | 0 | 0 | 0 | 4 |
> | 1 | 0 | 0 | 4 |
> | 0 | 0 | 1 | 5 |
> | 0 | 1 | 1 | 1 |
> | 1 | 0 | 1 | 1 |
> | 1 | 1 | 1 | 5 |
>
> (Combinațiile care nu apar au numărătoarea 0.) Pentru instanța $(A{=}0,B{=}0)$:
> **a. (0,3 p)** Decizia lui Bayes Naiv și probabilitatea cu care este luată.
> **b. (0,2 p)** La fel pentru Bayes Comun; de ce diferă rezultatele?
> **c. (0,2 p)** Câți parametri liberi estimează fiecare clasificator?
> **d. (0,2 p)** Ce probleme întâmpină Bayes Naiv din cauza numărătorilor 0 din tabel? Cum se remediază? Aplicați remediul la $P(B{=}1|Y{=}0)$.

**Solution.** Totaluri: $Y=0$: 8 exemple; $Y=1$: 12 exemple; $P(Y{=}0)=\frac25$, $P(Y{=}1)=\frac35$. (a) $P(A{=}0|Y{=}0)=\frac48=\frac12$, $P(B{=}0|Y{=}0)=\frac88=1$; $P(A{=}0|Y{=}1)=\frac{5+1}{12}=\frac12$, $P(B{=}0|Y{=}1)=\frac{5+1}{12}=\frac12$. Scoruri: $Y{=}0$: $\frac25\cdot\frac12\cdot1=\frac15$; $Y{=}1$: $\frac35\cdot\frac12\cdot\frac12=\frac3{20}$. **NB decide $Y=0$** cu $\dfrac{1/5}{1/5+3/20}=\dfrac47\approx0{,}571$. (b) Bayes Comun: rândurile cu $(0,0)$: $4$ cu $Y=0$ și $5$ cu $Y=1$: **decide $Y=1$** cu $\frac59\approx0{,}556$. Rezultatele diferă (chiar și decizia) fiindcă independența condiționată nu se verifică: pentru $Y=1$, $P(A{=}0,B{=}0|Y{=}1)=\frac5{12}$, dar $P(A{=}0|Y{=}1)P(B{=}0|Y{=}1)=\frac12\cdot\frac12=\frac14$. (c) NB: $2\cdot2+1=\mathbf5$; Bayes Comun: $2^{3}-1=\mathbf7$. (d) $P(B{=}1|Y{=}0)=\frac08=0$: orice instanță cu $B=1$ primește scorul 0 la clasa $Y=0$ (și, dacă și celelalte clase ar avea un factor 0, probabilitatea ar fi $0/0$, nedefinită). Remediul: regula add-one a lui Laplace, $\dfrac{\#+1}{N+|Val(B)|}=\dfrac{0+1}{8+2}=\dfrac1{10}$. (De exemplu, pentru $(A{=}0,B{=}1)$ scorurile devin $\frac1{50}$ și $\frac3{20}$: $P(Y{=}0)=\frac2{17}$, în loc de 0.) `[construit]`.

**Barem.** (a) 0,05 priorii; 0,1 factorii; 0,05 scorurile; 0,1 decizia cu probabilitatea. (b) 0,1 numărătorile $(0,0)$ și decizia cu probabilitatea; 0,1 explicația (independența condiționată nu se verifică, cu un contraexemplu numeric). (c) 0,1 NB; 0,1 Bayes Comun. (d) 0,1 problema (factor 0 anulează produsul, $0/0$); 0,1 remediul cu valoarea $\frac1{10}$.

**Capcane.** A folosi $P(B{=}1|Y{=}1)$ în loc de $P(B{=}0|Y{=}1)$ (valoarea instanței de test, nu a unui rând de antrenare); $\frac{0+1}{8}$ în loc de $\frac{0+1}{8+2}$ (uitarea lui $|Val|$); a număra rândurile tabelului (6) în loc de apariții (20); 4 parametri pentru NB (uită priorul) sau 8 pentru Bayes Comun (uită "−1").

#### Mock T1: visual and builder notes

- **Figures:** only problem 5 has a figure: the 8-point grid, drawn as a static scatter with `+` and `-` markers (no widget needed beyond a table-to-scatter renderer). The solution screen of problem 5 shows the decision regions of $DT^*$ and of each of the three erroneous LOO trees (static drawings).
- **Variant generation (Recapitulare and re-takes).** Each problem has a parameter template and a script check: P1a probabilities from a grid (prior 0,1-1%, detection 80-99%, false-alarm 2-15%; result recomputed); P1b any $(P(A),P(B),P(A\cup B))$ with two-decimal values, independent or not (recomputed); P2a independent table with two blanked cells (solvable uniquely); P2b conditional independence true or false by construction (recomputed over all 8 cells); P3 pairs of stumps with equal weights, where the qualitative shortcut holds, and hint values printed from the script; P4 a table of 8 rows with a continuous column chosen so that no tie occurs among the **selected** nodes (checked by an ID3 enumerating all tie choices) and the tree has 3 or 4 tests; P5 a $2\times4$ grid with labellings for which the LOO predictions are **independent of tie resolution** (`s5.py` style search; 96 of the 256 labellings qualify, among them the one used here) and $DT^*$ overfits $DT_2$; P6 a count table where NB and Bayes Comun decide differently on the asked instance and one conditional has a 0 count.
- **Numbers come from** `verify_bayes.py` (section MOCK T1) and from the ID3 enumeration used for P4/P5; the model solutions above agree with them.
- **Deviation from the allocation text:** problem 1c proves the total probability formula, not $P(A,B|C)=P(A|C)P(B|A,C)$ (decision 1 in section 0.2). Fallback statement if Alex prefers the allocation text: "c. Demonstrați că $P(A,B|C)=P(A|C)\,P(B|A,C)$ pentru $P(C)\neq0$, $P(A,C)\neq0$."
- **Not in the mock** (allocation): pruning, gain ratio, $\chi^2$ (L16-L17); NB error rate, xor, duplicates (L22); Jensen/KL proofs (L23-L24); the bonus of three prisoners (L19).

### 5.2 `ml-test-t21p`: Probabilități și statistică + ID3 (1), 2021-22, ca la examen (6 p, 1 h 30, minim 1,5 p)

**Source and form.** `tests/2021-2022-t1-seminar-ro/subiect.pdf` (RO series, 17 items; the EN series adds 1,0 p of Python output items that are not used). The statements below are the paper's, shown in the paper's order, with the figures redrawn as tables and trees. **The paper has no official barem or solution file**; the solutions below are computed here (`[calculat]`) and the barem splits each item's printed points over its steps (proposal, not official). The paper's rule is printed on the first screen: "De obicei nu vi se cere să duceți calculele până la capăt; o formulă se poate indica prin nume sau în formă generală, fără numere." The H(p) hint tables printed in the original are not part of this paper (it prints none); where an item says "înlocuiți fără a calcula", the solution shows the substitution only and a note with the value.

| Item | Points | Topic | Lesson(s) on review |
|---|---|---|---|
| 1 | 0,3 | demonstrație $P(A,B|C)=P(A|C)P(B|A,C)$ | 1 |
| 2 | 0,3 | demonstrație $\mathrm{Var}[X+10]=\mathrm{Var}[X]$ | 4 |
| 3 | 0,3 | doi jucători, media a 20 de aruncări | 4 |
| 4 | 0,1 | spațiul de eșantionare și de evenimente (două monede) | 1 |
| 5 | 0,1 | p.m.f. validă | 4 |
| 6 | 0,2 | notație cu mulțimi (a, b) | 1 |
| 7 | 0,1 | doi trăgători, independență | 3 |
| 8 | 0,2 | zar: probabilități egale și MLE (a, b) | 18 |
| 9 | 0,4 | doi seturi de exerciții: totală și Bayes (a, b) | 2 |
| 10 | 0,5 | entropia condiționată medie dintr-un ciot | 9 |
| 11 | 1,6 | tabel comun: E, Var, Cov, independență, H[X], H[Y\|X] | 5, 7, 8 |
| 12 | 0,3 | arbore dat: frunze, clasificare | 9, 10 |
| 13 | 0,4 | tabel comun cu trei variabile: independență condiționată | 6 |
| 14 | 0,5 | ID3: consistență, cioturi, arborele | 9, 10 |
| 15 | 0,2 | cioturi din două coloane | 8 |
| 16 | 0,3 | adevărat/fals (6 afirmații) | 1, 3, 5, 7, 8 |
| 17 | 0,2 | adevărat/fals despre ID3 (4 afirmații) | 11, 12, 13 |

Sum: $0{,}3+0{,}3+0{,}3+0{,}1+0{,}1+0{,}2+0{,}1+0{,}2+0{,}4+0{,}5+1{,}6+0{,}3+0{,}4+0{,}5+0{,}2+0{,}3+0{,}2=6{,}0$ (`[calculat]`; per sub-item points as printed on the paper).

> **1. (0,3 p)** Fie evenimentele aleatoare $A,B,C$ cu $P(C)\neq0$, $P(A,C)\neq0$. Demonstrați că $P(A,B|C)=P(A|C)P(B|A,C)$.

**Solution.** $P(A,B|C)=\dfrac{P(A,B,C)}{P(C)}$ (definiție); $P(A,B,C)=P(A,C)\,P(B|A,C)$ (definiția condiționatei, $P(A,C)\ne0$); $P(A,C)=P(A|C)P(C)$ ($P(C)\neq0$). Deci $P(A,B|C)=\dfrac{P(A|C)P(C)P(B|A,C)}{P(C)}=P(A|C)P(B|A,C)$. **Barem:** 0,1 definiția; 0,1 înlănțuirea $P(A,B,C)$; 0,1 simplificarea cu $P(C)$.

> **2. (0,3 p)** Fie $X$ o variabilă aleatoare. Folosind definiția varianței și liniaritatea mediei, demonstrați că $\mathrm{Var}[X+10]=\mathrm{Var}[X]$.

**Solution.** $\mathrm{Var}[X+10]=E\big[(X+10-E[X+10])^2\big]$; liniaritatea dă $E[X+10]=E[X]+10$; deci $X+10-E[X+10]=X-E[X]$ și $\mathrm{Var}[X+10]=E[(X-E[X])^2]=\mathrm{Var}[X]$. **Barem:** 0,1 definiția; 0,1 liniaritatea; 0,1 concluzia.

> **3. (0,3 p)** Doi jucători de baschet aruncă în paralel la coș (fiecare la coșul său). Primul nimerește cu probabilitatea 0,1, al doilea cu 0,7. Câte coșuri dau împreună, în medie, din 20 de aruncări (de fiecare)? [Nu vreau doar numărul final, ci și raționamentul.]

**Solution.** Fiecare aruncare este o variabilă Bernoulli: $E=p$. Numărul de coșuri ale primului este suma a 20 de Bernoulli(0,1): media $20\cdot0{,}1=2$ (liniaritatea mediei; echivalent, binomială $b(20;0{,}1)$ cu media $np$). Al doilea: $20\cdot0{,}7=14$. Împreună: $2+14=\mathbf{16}$. **Barem:** 0,1 raționamentul (Bernoulli + liniaritatea mediei sau binomiala); 0,1 + 0,1 cei doi jucători, 16 la sfârșit.

> **4. (0,1 p)** Experimentul aleator: aruncarea a două monede. Care sunt spațiul de eșantionare și spațiul de evenimente? [Primele elemente ale spațiului de evenimente, apoi "...".]

**Solution.** $\Omega=\{HH,HT,TH,TT\}$; spațiul evenimentelor este mulțimea submulțimilor lui $\Omega$: $\emptyset$, $\{HH\}$, $\{HT\}$, $\{TH\}$, $\{TT\}$, $\{HH,HT\}$, ... (16 evenimente). **Barem:** 0,05 + 0,05.

> **5. (0,1 p)** Verificați dacă definiția $p(1)=0{,}3$; $p(2)=0{,}3$; $p(3)=0{,}4$ este o funcție masă de probabilitate validă pentru $X\in\{1,2,3\}$. [Nu doar răspunsul, ci și raționamentul.]

**Solution.** Valorile sunt în $[0,1]$ și suma este $0{,}3+0{,}3+0{,}4=1$: **validă**. **Barem:** 0,05 non-negativitate; 0,05 suma 1.

> **6.** Scrieți sub formă de mulțimi: **a. (0,1 p)** $A$ și $B$; **b. (0,1 p)** fie $A$, fie $B$, dar nu ambele.

**Solution.** (a) $A\cap B$. (b) $(A\cup B)\setminus(A\cap B)$ sau, echivalent, $(A\cap\bar B)\cup(\bar A\cap B)$. **Barem:** 0,1 + 0,1.

> **7. (0,1 p)** Doi trăgători: $P(X\text{ nimerește})=0{,}1$, $P(Y\text{ nimerește})=0{,}1$, $P(\text{ambii})=0{,}01$. Sunt evenimentele independente? De ce?

**Solution.** $P(X\cap Y)=0{,}01=0{,}1\cdot0{,}1=P(X)P(Y)$: **independente**. **Barem:** 0,05 definiția; 0,05 verificarea.

> **8.** Aruncarea unui zar; $X$ este valoarea de pe zar. **a. (0,1 p)** Presupunând rezultate echiprobabile, asignați probabilități. **b. (0,1 p)** Experimentul a fost repetat de 10 ori: $1,2,3,4,5,6,1,1,1,1$. Estimați în sensul verosimilității maxime (MLE) probabilitățile.

**Solution.** (a) $P(X{=}k)=\frac16$ pentru $k=1..6$. (b) MLE = frecvențele relative: $\hat P(X{=}1)=\frac5{10}=\frac12$, iar $\hat P(X{=}k)=\frac1{10}$ pentru $k=2,\dots,6$ (suma 1). Remarcă: MLE nu spune că zarul e măsluit; maximizează verosimilitatea datelor. **Barem:** 0,1; 0,05 + 0,05 (valoarea pentru 1 și pentru restul).

> **9.** Fie 2 seturi de câte 10, respectiv 5, exerciții. Studentul $X$ știe să rezolve 9 exerciții din primul set și 4 din al doilea. El alege un set de exerciții și apoi, din setul respectiv, alege un subiect. **a. (0,2 p)** Care este probabilitatea ca el să știe subiectul ales? (1. formula; 2. înlocuire numerică, fără a ajunge la rezultatul final.) **b. (0,2 p)** Dacă studentul știe subiectul ales, care este probabilitatea ca subiectul să provină din primul set? (la fel)

**Solution.** Ipoteză neprecizată în enunț, folosită în soluție: seturile sunt alese cu probabilitate egală, $P(S_1)=P(S_2)=\frac12$ (subiectul în set, uniform). $K$ = "știe subiectul". (a) Probabilitatea totală: $P(K)=P(K|S_1)P(S_1)+P(K|S_2)P(S_2)=\frac9{10}\cdot\frac12+\frac45\cdot\frac12$ ($=\frac{17}{20}=0{,}85$). (b) Bayes: $P(S_1|K)=\dfrac{P(K|S_1)P(S_1)}{P(K)}=\dfrac{\frac9{10}\cdot\frac12}{\frac9{10}\cdot\frac12+\frac45\cdot\frac12}$ ($=\frac9{17}\approx0{,}529$). **Barem:** (a) 0,1 formula; 0,1 înlocuirea; (b) 0,1 formula; 0,1 înlocuirea. Builder: the equal-probability assumption is not printed on the paper; the solution states it.

> **10. (0,5 p)** Fie compasul de decizie (figura): nod $A$ cu $[3{+},5{-}]$; ramura $A=0$ duce la $[2{+},1{-}]$, ramura $A=1$ la $[1{+},4{-}]$. Calculați entropia condiționată medie asociată ($H_{0|A}$). Înlocuiți numeric în formula folosită, până ajungeți la logaritm (nu duceți calculele până la capăt).

**Solution.** $H(Y|A)=\sum_vP(A{=}v)H(Y|A{=}v)=\dfrac38H\!\left(\dfrac23,\dfrac13\right)+\dfrac58H\!\left(\dfrac15,\dfrac45\right)=\dfrac38\Big(-\dfrac23\log_2\dfrac23-\dfrac13\log_2\dfrac13\Big)+\dfrac58\Big(-\dfrac15\log_2\dfrac15-\dfrac45\log_2\dfrac45\Big)$ (valoare: $0{,}7956$). **Barem:** 0,1 formula; 0,2 ponderile $\frac38$, $\frac58$; 0,2 entropiile celor doi copii.

> **11.** Tabelul comun al variabilelor $X$ și $Y$:
>
> | | $X=1$ | $X=2$ |
> |---|---|---|
> | $Y=0$ | 0,4 | 0,2 |
> | $Y=1$ | 0,1 | 0,1 |
> | $Y=2$ | 0,1 | 0,1 |
>
> **a. (0,8 p = 0,2·4)** Calculați $E[X]$, $E[Y]$, $\mathrm{Var}[Y]$, $\mathrm{Cov}[X,Y]$ (formula; înlocuire; duceți calculele până la capăt). **b. (0,2 p)** Sunt $X$ și $Y$ independente? (definiția; verificarea) **c. (0,3 p)** $H[X]$ (doar înlocuire în formulă). **d. (0,3 p)** $H[Y|X]$ (doar înlocuire în formulă).

**Solution.** Marginale: $P(X{=}1)=0{,}6$, $P(X{=}2)=0{,}4$; $P(Y{=}0)=0{,}6$, $P(Y{=}1)=0{,}2$, $P(Y{=}2)=0{,}2$. (a) $E[X]=1\cdot0{,}6+2\cdot0{,}4=\mathbf{1{,}4}$; $E[Y]=0{,}2+0{,}4=\mathbf{0{,}6}$; $E[Y^2]=0{,}2+0{,}8=1$, $\mathrm{Var}[Y]=1-0{,}36=\mathbf{0{,}64}$; $E[XY]=1\cdot1\cdot0{,}1+2\cdot1\cdot0{,}1+1\cdot2\cdot0{,}1+2\cdot2\cdot0{,}1=0{,}9$, $\mathrm{Cov}[X,Y]=0{,}9-1{,}4\cdot0{,}6=\mathbf{0{,}06}$. (b) Independență: $P(X{=}x,Y{=}y)=P(X{=}x)P(Y{=}y)$ pentru toate perechile. $P(X{=}1,Y{=}0)=0{,}4\ne0{,}6\cdot0{,}6=0{,}36$: **nu** sunt independente (și $\mathrm{Cov}\ne0$). (c) $H[X]=-0{,}6\log_20{,}6-0{,}4\log_20{,}4$ (valoare $0{,}9710$). (d) $H[Y|X]=0{,}6\,H\!\left(\frac23,\frac16,\frac16\right)+0{,}4\,H\!\left(\frac12,\frac14,\frac14\right)=0{,}6\Big(-\frac23\log_2\frac23-2\cdot\frac16\log_2\frac16\Big)+0{,}4\Big(-\frac12\log_2\frac12-2\cdot\frac14\log_2\frac14\Big)$ (valoare $1{,}3510$; distribuțiile condiționate: pentru $X=1$: $\frac{0{,}4}{0{,}6},\frac{0{,}1}{0{,}6},\frac{0{,}1}{0{,}6}$). **Barem:** (a) 0,2 pentru fiecare dintre cele patru mărimi (0,1 formula + 0,1 valoarea); (b) 0,1 definiția + 0,1 verificarea (un contraexemplu e suficient); (c) 0,1 marginala + 0,2 formula; (d) 0,1 ponderile + 0,2 entropiile condiționale.

> **12.** Fie arborele: rădăcina $A$ cu $[10{+},10{-}]$; ramura $A=0$ duce la $[1{+},1{-}]$ și nodul $B$ (ramurile $a$: $[0{+},1{-}]$, $b$: $[1{+},0{-}]$); ramura $A=1$ duce la $[9{+},9{-}]$ și nodul $D$ (ramurile $1$: $[2{+},1{-}]$, $2$: $[1{+},2{-}]$, $3$: $[6{+},6{-}]$). **a. (0,1 p)** Etichetați frunzele. **b. (0,1 p)** Cum este clasificată instanța $(A{=}0,B{=}a,C{=}1,D{=}2)$? **c. (0,1 p)** Dar $(A{=}1,B{=}a,C{=}2,D{=}1)$?

**Solution.** (a) $B=a\to[0{+},1{-}]$: $-$; $B=b\to[1{+},0{-}]$: $+$; $D=1\to[2{+},1{-}]$: $+$; $D=2\to[1{+},2{-}]$: $-$; $D=3\to[6{+},6{-}]$: egalitate, orice etichetă este acceptată dacă se spune că e o egalitate (convenție). (b) $A=0\to B=a\to-$. (c) $A=1\to D=1\to+$. **Barem:** 0,1; 0,1; 0,1. Builder: the figure's leaf $[6{+},6{-}]$ is a tie; the paper does not state a tie rule, accept either label with the remark.

> **13.** Distribuția comună a variabilelor $X,Y,Z$:
>
> | | $Z=0$, $X=0$ | $Z=0$, $X=1$ | $Z=1$, $X=0$ | $Z=1$, $X=1$ |
> |---|---|---|---|---|
> | $Y=0$ | 0,10 | 0,20 | 0,10 | 0,20 |
> | $Y=1$ | 0,10 | 0,10 | 0,10 | 0,10 |
>
> **a. (0,1 p)** $P(X{=}0,Y{=}0,Z{=}0)$. **b. (0,1 p)** $P(Z{=}0)$ (formula; înlocuire; până la capăt). **c. (0,1 p)** $P(X{=}0,Y{=}0|Z{=}0)$ (la fel). **d. (0,1 p)** Sunt $X$ și $Y$ independente condiționat de $Z$? (definiția; verificarea)

**Solution.** (a) $0{,}10$. (b) $P(Z{=}0)=\sum_{x,y}P(x,y,Z{=}0)=0{,}10+0{,}20+0{,}10+0{,}10=\mathbf{0{,}5}$. (c) $P(X{=}0,Y{=}0|Z{=}0)=\dfrac{P(X{=}0,Y{=}0,Z{=}0)}{P(Z{=}0)}=\dfrac{0{,}10}{0{,}5}=\mathbf{0{,}2}$. (d) Definiție: $P(X,Y|Z)=P(X|Z)P(Y|Z)$ pentru toate valorile. $P(X{=}0|Z{=}0)=\frac{0{,}10+0{,}10}{0{,}5}=0{,}4$, $P(Y{=}0|Z{=}0)=\frac{0{,}10+0{,}20}{0{,}5}=0{,}6$; produsul $0{,}24\neq0{,}2$: **nu** sunt independente condiționat de $Z$. **Barem:** 0,1 pe literă (a: valoarea; b: formula + calcul; c: formula + calcul; d: definiția + un contraexemplu).

> **14.** În cadrul algoritmului ID3, tabelul $A,B,Y$ (ieșire $Y$): $(0,0,0)$, $(0,1,1)$, $(1,0,1)$, $(1,1,1)$, $(1,0,0)$, $(0,1,0)$. **a. (0,1 p)** Este setul consistent? **b. (0,2 p)** Desenați compașii de decizie care trebuie luați în calcul pentru nodul rădăcină. **c. (0,2 p)** Presupunem că entropiile condiționate medii dintre ieșire și atributele candidat sunt: 0,8 pentru $A$, 0,7 pentru $B$. Desenați arborele rezultat din ID3, considerând adevărate informațiile din fraza anterioară (nu faceți calcule).

**Solution.** (a) **Nu**: instanța $(A,B)=(1,0)$ apare cu $Y=1$ și cu $Y=0$, iar $(0,1)$ la fel. (b) Ciotul $A$: $A=0$: $[1{+},2{-}]$, $A=1$: $[2{+},1{-}]$; ciotul $B$: $B=0$: $[1{+},2{-}]$, $B=1$: $[2{+},1{-}]$ (total $[3{+},3{-}]$). (c) Entropia condiționată minimă: $B$ ($0{,}7<0{,}8$): rădăcina este $B$. Singurul atribut rămas este $A$: ambele ramuri ale lui $B$ se despart după $A$. Frunzele: $B=0,A=0\to[0{+},1{-}]$: $-$; $B=0,A=1\to[1{+},1{-}]$: egalitate; $B=1,A=0\to[1{+},1{-}]$: egalitate; $B=1,A=1\to[1{+},0{-}]$: $+$. **Observație:** informația din enunț este contrafactuală: pe aceste date reale $H(Y|A)=H(Y|B)=0{,}9183$ (egalitate); se cere doar să o consideri adevărată. **Barem:** (a) 0,1 (cu perechea inconsistentă); (b) 0,1 + 0,1 (cele două cioturi, cu etichetele $[a+,b-]$); (c) 0,1 rădăcina $B$; 0,1 nivelul 2 cu $A$ pe ambele ramuri.

> **15.** Două coloane ale unui set de date ($X$ și $Y$ discrete): perechile $(X,Y)$: $(0,0),(1,1),(0,2),(1,0),(0,1),(1,2)$. **a. (0,1 p)** Considerând $Y$ atribut de ieșire, desenați compasul de decizie asociat lui $X$. **b. (0,1 p)** Considerând $X$ atribut de ieșire, desenați compasul asociat lui $Y$.

**Solution.** (a) Nodul $X$; ramura $X=0$: rândurile cu $Y=0,2,1$, adică $Y{=}0$: 1, $Y{=}1$: 1, $Y{=}2$: 1; ramura $X=1$: $Y=1,0,2$, adică 1, 1, 1. (b) Nodul $Y$; $Y=0$: $X=0,1$ (1 și 1); $Y=1$: $X=1,0$ (1 și 1); $Y=2$: $X=0,1$ (1 și 1). **Barem:** 0,1 + 0,1 (arbore cu trei, respectiv două, clase afișate pe fiecare ramură).

> **16.** Adevărat sau fals (fără justificări), câte 0,05 p: **a.** $P(A\cup B\cup C)>P(A)+P(B)+P(C)$. **b.** O variabilă aleatoare Bernoulli are 3 valori posibile. **c.** Entropia lui $X$ cu valori în $\{1,\dots,8\}$ nu poate depăși valoarea 2. **d.** Câștigul de informație poate fi 0. **e.** Dacă $X,Y$ sunt independente, atunci $IG(X;Y)=0$. **f.** $\mathrm{Cov}(X,Y)=0\Rightarrow X,Y$ independente.

**Solution.** a **fals** ($\le$, subaditivitate); b **fals** (două valori); c **fals** (maximul este $\log_28=3$); d **adevărat** ($IG=0$ pentru variabile independente); e **adevărat**; f **fals** (de ex. $X$ uniformă pe $\{-1,0,1\}$, $Y=X^2$: $\mathrm{Cov}=0$, dependente). **Barem:** 0,05 fiecare.

> **17.** În legătură cu ID3 fără extensia pentru atribute continue, adevărat sau fals (fără justificări), câte 0,05 p: **a.** ID3 nu garantează arborele de decizie optimal (ca număr de niveluri sau noduri). **b.** Dacă nu mai sunt atribute candidat de testat într-un nod (toate apar deja pe drumul de la acel nod la rădăcină), ID3 nu mai continuă pe acel drum. **c.** Un atribut de intrare nu poate apărea în arborele produs de ID3 de mai multe ori. **d.** ID3 este un algoritm de programare dinamică.

**Solution.** a **adevărat** (căutare greedy); b **adevărat** (nod frunză cu eticheta majoritară); c **fals** (un atribut poate apărea o singură dată **pe un drum**, dar în ramuri diferite poate apărea de mai multe ori; conflictul C-10: afirmația c este cea falsă); d **fals** (algoritm greedy, fără subprobleme suprapuse). **Barem:** 0,05 fiecare.

#### T21P builder notes

- **Provenance of the figures** (read from the page images, `tests/2021-2022-t1-seminar-ro/subiect.pdf` pp. 2-4): item 10 stump $[3{+},5{-}]\to[2{+},1{-}],[1{+},4{-}]$; item 12 tree as above; item 15 the two columns. The text mirror drops the formulas of items 1, 2, 16a; the images were read.
- **Verification:** every number above is recomputed in `verify_bayes.py` (section T21P): items 9, 10, 11, 13, 14, 15, 3, 8.
- **Item 14c** is counterfactual (the printed 0,8 and 0,7 are not the real values); the solution says so in one sentence and still draws the tree from the given values.
- **No official barem**: the half-points above are a proposal; the point values per item and sub-item are the paper's.
- **Shared table check (allocation note "de reconfirmat"):** none of the tables of T21P coincides with a table owned by L19-L22 or by the mock; against the other lessons the reconfirmation needs their outlines (the data tables listed in `allocation.json` for L1-L18 contain no T21P table).
- **Item 17c versus the seminar note** "o dată pe drum, repetat pe ramuri diferite" (Cn-s3:12): consistent, see conflict C-10 of the content map.

# Part notes and open problems

## Part 1 notes (L1-L6)

### Appendix A. Coverage of the allocation (every owned exercise appears exactly once)

| Lecția | Exercise screens in this file |
|---|---|
| L1 | 0.1 (a, b, c) = L1.e1; 0.2 (a, b) = L1.e2; 0.3 = L1.e3; 0.14 = L1.e4; 0.8 (a-d, optional) = L1.e5 |
| L2 | 0.6 = L2.e1; 0.7 (optional) = L2.e2; 0.90 (a, b) = L2.e3; 0.93 = L2.e4; 0.94 = L2.e5; 0.95 = L2.e6; 0.96 (a-d) = L2.e7 |
| L3 | 0.4 (a, b) = L3.e1; 0.5 (a-c) = L3.e2; 0.89 (a, b) = L3.e3; 0.91 (a-c) = L3.e4; 0.92 = L3.e5 |
| L4 | 0.9.a = L4.e1; 0.9.b = L4.e2; 0.12 (a, b) = L4.e3; 0.23.a = L4.e4; 0.24 = L4.e5; 0.25 (a, b) = L4.e6; 0.27 (optional) = L4.e7; 0.28 (optional) = L4.e8; 0.97 = L4.e9; 0.98 = L4.e10 |
| L5 | 0.9.c = L5.e1; 0.10 = L5.e2; 0.11 (a, b) = L5.e3; 0.13 = L5.e4; 0.19 (a, b) = L5.e5; 0.23.b, c, d = L5.e6; 0.99 (a, b) = L5.e7; 0.100 = L5.e8 |
| L6 | 0.15 (a, b) = L6.e1; 0.16 (a, b) = L6.e2; 0.101 (a, b, c) = L6.e3; 0.102 (a, b) = L6.e4; 0.103 = L6.e5 |

Total: 40 exercise screens; the four allocation-optional ones are 0.7 (L2.e2), 0.8 (L1.e5), 0.27 (L4.e7) and 0.28 (L4.e8).

### Appendix B. Visual widgets

| Id | Lecția | Design list |
|---|---|---|
| `ml-viz-omega` | L1 | diagram of Ω with events and restriction to B |
| `ml-viz-freq-tree` | L2 | probability tree with natural frequencies (design viz 1) |
| `ml-viz-indep-2x2` | L3 | independence check on a 2×2 table of events |
| `ml-viz-pmf-cdf` | L4 | pmf / cdf bars with the mean marked |
| `ml-viz-joint-table` | L5, L6 | joint table, marginals, independence cell by cell (design viz 2); with "condiționează pe Z" in L6 |

### Appendix C. Problems found and open points for the lead

1. `allocation.json` has 0.8 in L1 as optional and 0.7 in L2 as optional; the book marks 0.7 and 0.8 with ◦ and 0.27, 0.28 in brackets; all four are kept as optional screens.
2. The "evidență" term is not in Ciortuz's material (only in `Companion.pdf`); not used (decision 2).
3. The Cn-s1:6 multiplication example (1/3, 1/10) and the two default assumptions (Cn-s1:4, 7, 8) are assigned here: the first to L1 (not in the allocation tables), the second to L3 (as allocated).
4. 0.102 depends on reading $P(H)$ etc. as full tables; the book's statement does not say the variables are boolean.
5. Book typos found in this range: none that changes a number. Two wording slips only: 0.24 says "banul" for the tails face; the 0.8 (c) solution writes "implies" where it means "is equivalent to". Neither needs a corrected-value note.
6. L4's binomial variance is derived directly (no variance-of-a-sum), to avoid a forward dependency on L5; L5 links back in one line.
7. The `proof-steps` shape in section 0 is a proposal: the design says to reuse existing blocks first; the builder decides between `mcq` + `equation` and a new block (design §8 requires registering any new block in `registry.js` and in `validate-course-json.mjs`).
8. Not checked by me against the page images: only pp. 3 and 6 of `notes-s2.pdf`, p. 3 of `notes-s1.pdf` and p. 37 of the book were read as images (these carry tables); everything else was read from the text mirror, which prints the overlines of $\bar A$ without the bar in places (this affects 0.6 and 0.8 in the mirror; I took the complements from the book's solutions and the content map).
9. Critic pass (2026-10-28, `outline-critique.md`): L1.q1, L3.q4 and L4.q2 replaced (they asked the same question as exercises 0.1.c, 0.91.b and 0.97 of the same lesson); L4.e2 lost its $\mathrm{Var}(-4X)$ field (0.97 again); L4.e6 numbers changed to $n=20$, $p=0{,}25$ (they were the numbers of quiz L4.q3); L3.s10 no longer answers 0.91.b; L4.s12 restates the games' data on its own screen.

## Part 3 notes (L9-L17)

### 10. Valori construite (pretest, concret construit, întrebările de reamintire)

Numere care nu sunt în carte și nu sunt în `verified-answers.md`; toate recalculate cu `python3` (fracții + `log2`) pe datele din ecran, în `/tmp/claude-1000/-home-alexa-hub/586cac55-e548-45e9-92fa-828bc679c474/scratchpad/dt/` (`t1.py` ... `t28.py`). Testul numeric al construcției trebuie să le recalculeze din datele din JSON.

| Lecția | Element | Date | Valori |
|---|---|---|---|
| 9 | pretest | rădăcina $[4{+},4{-}]$; A: $[3{+},1{-}],[1{+},3{-}]$; B: $[4{+},2{-}],[0{+},2{-}]$ | $H(Y\|A)=0.8113$, $H(Y\|B)=0.6887$ |
| 9 | Q1 | rădăcina $[6{+},6{-}]$; A: $[2{+},0{-}],[4{+},6{-}]$; B: $[4{+},1{-}],[2{+},5{-}]$ | $H(Y\|A)=0.8091$, $H(Y\|B)=0.8043$ |
| 9 | Q2 | $H(Y)=0.94$, $H(Y\|A)=0.65$, $H(Y\|B)=0.58$ | $IG(B)=0.36$ (aritmetică) |
| 9 | Q3 | $(0,1\to+),(1,1\to-),(0,1\to+),(1,0\to+)$ | consistent (no numbers) |
| 10 | pretest | rădăcina $[5{+},5{-}]$; A: $[4{+},1{-}],[1{+},4{-}]$; B: $[3{+},2{-}],[2{+},3{-}]$ | $0.7219$, $0.9710$ |
| 10 | C1 (Cn-s4:5-7) | $[3{-},4{+}]$; A: $[2{-},0{+}],[1{-},4{+}]$; B: $[1{-},1{+}],[2{-},3{+}]$ | $0.5157$, $0.9793$ |
| 10 | C2 | $H[5{-},3{+}]$, $H[2{-},9{+}]$ | $0.9544$, $0.6840$ |
| 10 | C3, C4 | rădăcina $[12{+},8{-}]$; A: $[9{+},1{-}],[3{+},7{-}]$; B: $[6{+},2{-}],[6{+},6{-}]$ | $P_A=11608.27$, $P_B=368224.22$, $H(Y\|A)=0.6751$, $H(Y\|B)=0.9245$, $H(Y)=0.9710$, $IG(A)=0.2958$, $IG(B)=0.0464$; forma log: $4.690+8.813$ |
| 10 | Q1 | $H[4{-},5{+}]$, $H[5{-},6{+}]$ | $0.9911<0.9940$ |
| 10 | Q2 | rădăcina $[7{+},5{-}]$; A: $[1{+},4{-}],[6{+},1{-}]$; B: $[2{+},3{-}],[5{+},2{-}]$ | $H(Y\|A)=0.6460$, $H(Y\|B)=0.9080$ |
| 10 | Q4 | produse $P_A=1200$, $P_B=950$ (date) | minimul: B |
| 10 | 4.36 (a) | $[3{+},4{-}]$ | $0.9852$ |
| 10 | 4.36 (c-f) | $[7{+},5{-}]\to[5{+},1{-}],[2{+},4{-}]$; $[5{+},4{-}]\to[3{+},0{-}],[2{+},4{-}]$; $[7{+},5{-}]\to[4{+},2{-}],[3{+},3{-}]$ | $0.7842$; $0.6122$; $IG=0.1957$; produse $680.24$, $2916.0$, $H=0.9591$ |
| 11 | Q1 | $(A,B,C\to Y)$: 001→1, 101→0, 011→0, 111→0, 100→1, 000→1 | $IG(A)=0.0817$, $IG(B)=IG(C)=0.4591$ |
| 11 | Q2 | $(x_1,+,30),(x_1,-,10),(x_2,+,5),(x_2,-,55)$ | $H(Y)=0.9341$, $H(Y\|X)=0.5728$, $IG=0.3613$ |
| 14 | pretest | $1(-),2(-),5(+),6(+),9(-)$ | praguri $3.5$ și $7.5$ |
| 14 | Q1, Q2 | $1(-),2(-),3(+),4(+),4(-),6(-)$; nod $3(-),5(-),6(+),8(+)$ | praguri $2.5,3.5,5$; apoi $5.5$ |
| 14 | 4.11 numeric | $n=16$ | $1+\lceil\log_216\rceil=5$; $2\lceil\log_216\rceil=8$ |
| 14 | C2, C3, C5 (ML3:21, calculat aici) | $40,48,60,72,80,90$ | $IG(54)=0.4591$, $IG(85)=0.1909$; nod dreapta, $IG(85)=0.8113$; $IG(66)=0.0817$ |
| 15 | Q1 | $tp=30$, $fp=10$, $fn=20$, $tn=40$ | $P=0.75$, $R=0.6$, $Acc=0.7$, $F=0.6667$, $Sp=0.8$ |
| 15 | Q2 | $(0,0\to0),(0,0\to0),(0,1\to0),(1,0\to1)$ | $E_{CVLOO}=1/4$ (verificat cu ID3 de mână și script), $E_{train}=0$; detector $1/3$ (duplicates counted once) |
| 15 | Q3, Q4 | $h$: 5% / 20%, $h'$: 10% / 15%; $k=10$, 1000 rânduri | overfitting da; 10 antrenări pe 900 |
| 15 | 4.44 (control) | $M=10,H=1$; $M=10,H=0$; $M=20,H=0.5$ | $5$; $0$; $2.93$ (aproximativ; exact $2.2$) |
| 16 | Q1 | acurateți pe validare 80% (N: 83%, M: 82%, K: 78%) | taie N |
| 16 | Q2 | $\begin{pmatrix}8&2\\2&8\end{pmatrix}$ | $E=5$ peste tot, $\chi^2=7.2$, $p=0.0073$ |
| 16 | Q3 | atribut cu 3 valori, 2 clase | 2 grade, $5.991$ |
| 17 | concret | 8 rânduri, $Q$: $a=[4{+},1{-}]$, $b=[0{+},3{-}]$ | $IG(ID)=1$, $IG(Q)=0.5488$, $SplitInfo(ID)=3$, $SplitInfo(Q)=0.9544$, $GR(ID)=0.3333$, $GR(Q)=0.5750$ |
| 17 | Q2 | $IG=0.30$ cu 3 părți egale; $IG=0.20$ cu 2 părți egale | $0.1893$ față de $0.2000$ |
| 17 | Q1 | părți 6, 3, 3 | $SplitInfo=1.5$ |
| 17 | Q3 | $[4{+},4{-}]\to[4{+},0{-}],[0{+},4{-}]$ | $\Delta_{Gini}=0.5$ |
| 13 | Q1, Q2 | eroare 0.55 cu 2 clase; 3 atribute × 3 valori, 1000 exemple | imposibil (max $\tfrac12$); 27 frunze |
| 17 | Q4 | $Gain=0.30$, $Cost=2$; $Gain=0.20$, $Cost=1$ | $0.045$, $0.040$ |
| 14 | 4.51.d | 8 rânduri adăugate (în enunț) | rădăcina Produs ($IG=0.2241$), 5 teste; găsit prin căutare aleatoare, verificat de două ori; nu e răspuns oficial |
| 9 | 0.58.b (control) | toate submulțimile de trăsături | consistente minime: {X1,X2,X5}, {X1,X3,X5}; cartea: {X1,X2,X4,X5} |

### 11. Probleme și hotărâri (pentru Alex și pentru constructor)

Hotărâri de instalație (le poate veta Alex; le-am notat în `decisions.jsonl` doar dacă cere):
- 4.35 și 4.58 (implementare, opționale): nu primesc ecran de cod și nici câmp de calcul; 4.35 e doar o linie în rezolvarea lui 4.34 (altfel ar repeta aceleași cifre). Allocation.md scria "exercițiu de calcul pe cifrele 4.34".
- P21 1(b.ii) (aceeași tabelă ca la Lecția 9, rezolvată prin monotonia lui $H(p)$) nu are proprietar în `allocation.json`; îl pun ca un singur ecran (C5) în Lecția 10, cu trimitere înapoi, fără a redesena tabela (reutilizare declarată).
- Regula de numărare a pragurilor (4.51.a): valoarea cu ambele etichete contează ca graniță (6 praguri; altfel 5).
- 4.42.b: nedecidabil din marginale; lecția cere doar (a).

Probleme găsite (verificate):
1. **0.58.b:** răspunsul din carte ({X1,X2,X4,X5}) nu e cel mai mic subset consistent; {X1,X2,X5} și {X1,X3,X5} sunt consistente cu 3 trăsături. Cartea justifică prin regula "păstrează MI nenul, apoi repară inconsistența". Verificatorul acceptă răspunsul cărții și arată alternativele cu o notă; decizia de predare e a lui Alex (dacă vrea ca test să accepte și 3 trăsături).
2. **3.11.b:** cititorii au numărat 5 noduri de test; figura din carte și T21T2 9 au 6; rularea mea dă 6 teste, 7 frunze.
3. **4.51.d** nu e rezolvat în nicio sursă; exemplul din lecție e al meu, verificat de script, marcat "ruled".
4. **PlayTennis (ML3:5 = 4.54):** `allocation.md` pentru L16 spune "trimitere vezi Lecția 9"; proprietarul tabelului e Lecția 16, deci trimiterea corectă din L17 / L20 e "vezi Lecția 16".
5. **Tipare în carte (corectate, cu notă):** 4.19.d tipărește $V\wedge V\wedge X$ (corect: $V\wedge W\wedge X$); 4.13 tipărește $IG(X_2)\approx0.1037$ (trunchiere, valoarea e 0.10376); 4.12.b tipărește 0.3788 (0.37888); 4.14 tipărește câștiguri rotunjite cu $\log_2 3=1.585$ (0.0009 pentru Peste60 și Diabetic față de 0.0006 exact). T20C 1: hint-ul $H(1/5)$, $H(2/5)$ e inversat în test (nu e folosit în lecțiile mele; T20C 1 rămâne la mock).
6. **Valori date în teste vs. exact:** 4.48 (slide trunchiat 0.319 / 0.378 / 0.04 față de 0.320 / 0.379 / 0.044); toleranța ±0.002 din câmp.
7. **4.17 și 4.18** (opționale): numerele sunt din soluțiile cărții prin content-map 6.4 (nu am citit B:526-532 direct); IG-urile din 4.18 (0.1887, 0.3113) recalculate.
8. **T20C 2:** figura (page 2, citită ca imagine) = xnor: $(0,0)+$, $(1,1)+$, $(0,1)-$, $(1,0)-$.

9. **Critic pass (2026-10-28, `outline-critique.md`):** quiz items that asked the same question as an exercise or screen of the same lesson were replaced (L9 Q3, L10 Q2 and Q4, L11 Q3 and Q4, L12 Q1 and Q2, L13 Q1-Q4, L15 Q3 and Q4, L16 Q1, Q3 and Q4, L17 Q1 and Q3; L13 and L16 now have three items); "De ce?" screens that gave away an exercise or restated another screen were rewritten (L10, L13, L14, L16; L12's reason moved out of C4); L9 R4, L12 R2/R3, L13 R1 and L16 R1 now link back instead of restating (the range rule, eager, (P2), (P1), MDL); L17's pretest uses the worked example's table; 4.36.a uses $[3{+},4{-}]$.

Verificări de repetare făcute (manual pe acest fișier): fiecare tabel de date apare într-o singură lecție ca enunț de exercițiu sau exemplu lucrat; singurele reutilizări sunt (a) cele trei cioturi P21 din Lecția 9 (referite o dată în Lecția 10, C5, fără tabel), (b) tabelele 4.2 și PlayTennis, declarate în `declared_reuse`; trimiterile sunt doar înapoi ("vezi Lecția N" cu N mai mic).

## Part 4 notes (L18-L22, tests)

### 6. Cross-lesson checks and open problems

#### 6.1 Back-links used (each is one line "vezi Lecția N"; nothing is re-explained)

| In | Back-link to | For |
|---|---|---|
| L18.s02 | L3 | independent events: probabilities multiply |
| L18 (all) | L4 | Bernoulli, binomial, i.i.d. variables |
| L19.s03, L19.s04, L19.e1, L19.e2, L19.e5 | L2 | Bayes formula and total probability (the tree is not redrawn and the base-rate explanation is not repeated; L19.s04 only normalises two products) |
| L19.e5 | L4 | binomial distribution and its mean |
| L19.e4 | L11, L15 | ID3 with continuous attributes; training error and CVLOO |
| L19.s10, L19.s11-s15, L19.e6 | L18 | the likelihood function, the MLE $\frac{n_1}{n}$ and its concavity argument (L19.s14) |
| L20.s16 | L18 | the one-parameter concavity argument |
| L20.s09 | L6 | conditional independence of random variables |
| L20.s01-s05, L20.s09 | L18 | counts as MLE |
| L20.s07 | L19 | the MAP rule without the denominator |
| L20.s12-s17 | L11 | the mushroom table 4.2 |
| L20.e4 | L16 | the 14-day PlayTennis table (declared reuse) |
| L21 (all) | L20 | the NB rule, factors, parameters |
| L22.s12-s16 | L1 | conditional chain rule |
| L22 (error rate) | L4 | expectation and the indicator function |
| L22.s09, L22.e2 | L20 | factors and parameters |

#### 6.2 Repetition check (concept, example, table, exercise; each in exactly one place)

- **Concepts.** Likelihood, log-likelihood, MLE from counts, the Bernoulli MLE proof: L18 only. Bayes for hypotheses, $h_{ML}$/$h_{MAP}$, argmax/max, Beta(3,3) MAP, log-odds, brute-force MAP, Bayes optimal vote: L19 only. $v_{MAP}$ rule, Bayes Comun, Bayes Naiv, unified view, parameter formulas: L20 only. Zero problem, 0/0, add-one, m-estimate, absent-word factors: L21 only. Error rate against $P$, two error sources, P4-P7, New-Bayes: L22 only. The add-one rule is **not** previewed in L20 (the pretest and L20.s02-s06 have no zero in a place where it matters; the pretest instance has no matching row, that is all), and L18 has no zero-count remark at all (L21 owns the zero problem; the allocation note says so).
- **Worked examples.** Cn-s5:1 "Remember 2" (L18), ML6:7 (L19), P20 2 (L20), T21T2 7 (L21), T20C 3 (L22): one lesson each. The four pretests (coins, six-row table, "bonus" word, $P(Y)=(0{,}6;0{,}4)$ table) are all different data from the worked examples and from the exercises.
- **Tables.** Each table in the four lessons appears in one lesson only, except the two declared reuses (the 14-day table in L20.e4, the mushrooms in L20.s12-s17).
- **Exercises.** L19: 0.26, 0.43.f-i, 2.1, 2.2, 2.3, 2.4, 2.24, 2.25 (opt.), 2.26 (opt.). L20: 2.5, 2.6, 2.7, 2.27, 2.28, 2.29. L21: 2.8, 2.30, 2.31. L22: 2.9, 2.11, 2.33, 2.35, 2.36 (opt.), 2.42 (opt.). Same list as `allocation.json` (checked by script: every allocated exercise number of L19-L22 has an `e` block, no other lesson's number is present).
- **Proofs.** L19: argmax without $P(D)$ (s08), the MAP of a Bernoulli parameter (s11-s15, serving 0.43.g), 2.26 (e9). L20: MLE with nine parameters and concavity (s12-s17). L22: New-Bayes justification (s12-s16, serving 2.9), A ⊥ C | B,Y for 2.35.e (in e4). Each proof appears once.
- **Tests.** The mock uses new numbers on every problem; its problem 1c is the L2 proof, not the L1 proof of T21P item 1 (decision 1). T21P is the real paper; items that coincide with a lesson's proof (1, 2) are the same proofs, shown once more as a test, which is their purpose.

#### 6.3 Open problems for Alex or the builder

1. **Mock 1c** differs from the allocation text on purpose (section 0.2, decision 1).
2. **2.4.a CVLOO** (1/5 versus 3/5), **2.27.b** (13 and 71), **2.30** (0,8306 / 0,7586 / 0,8512), **2.26**, **2.42**: answer status `ruled`; each screen states the convention. A different teacher may count differently.
3. **T21P has no official solution or barem.** The solutions are mine, the half-point splits are a proposal. Item 9 needs an assumption the paper does not print (the two sets are chosen with equal probability), item 12's leaf $[6{+},6{-}]$ is a tie with no printed rule, item 14c is counterfactual (the printed 0,8 and 0,7 are not the real values; on the data both are 0,9183).
4. **2.9** is read the way the book reads it (each of $X_1$, $X_2$ conditionally independent of the others), not as bare pairwise independence.
5. **Numbers I made** (all `[construit]` or `[calculat]`, all recomputed in `verify_bayes.py`): the four pretests, all quiz items, the numeric instances of 0.26 (c, d), the $n=100,1000$ values of 0.43.i, the add-one decision on T21T2 7 ($Y{=}1$ with $\frac37$), the $P_{NB}$-error 0,174, the New-Bayes count 11 for 2.9, the 2.36 function set, all six mock problems, the T21P solutions. Nothing is a sourced claim. Nothing on a screen is a Ciortuz quote unless it carries a book or slide citation.
6. **Verified-answers coverage.** `verified-answers.md` has no rows for 0.26, 0.43.f-i, 2.1, 2.2; the numbers come from the book's printed solutions (`[caiet]`) and from `verify_bayes.py`. 2.24, 2.25: second computation is `verify_extra.py` (allocation status verified-twice).
7. **Typos shown corrected:** 2.4 (book 0,0336, correct 0,03456); 2.5 stray Notă (omitted); 0.26 table values truncated in the book (8,36 for 8,3653); IG 0,419 versus 0,4200 (immaterial, both accepted).
8. **Answer-field tolerances for log-odds** (2.3): $-0{,}2799$ exact versus $-0{,}2800$ from rounded logs; both accepted.
9. **Uncertain reading:** the 2.33 letter mapping between the book and BS:49-54 (stated on the solution); the book's statement of 2.33 could not be re-read in this outline beyond the data the report gives (the eight $P(X_1,X_2,Y)$ values were recomputed and agree with BS:51).
10. **Calculation volume.** 2.27.c (14 LOO runs) and the mock problems are long by hand; the solution screens show the table, the field only checks the end values.
11. **Visual widgets.** `ml-viz-likelihood` (L18), `ml-viz-posterior` (L19) and `ml-viz-nb` (L20-L22, one widget, three modes) are the only widgets this part of the outline asks for; the tests need only a static figure for mock problem 5 and a table-to-scatter renderer.

12. **Critic pass (2026-10-28, `outline-critique.md`):** Lecția 18 was missing from all four outline parts and is written above (exercises 0.42, 0.43.a-e). Quiz items that repeated a screen or an exercise were replaced (L20.q3, L21.q4, L22.q1; L22's OR item removed; L21.q2 uses new data; L19.q2 carries its own data). "De ce?" duplicates were removed (L19.s05, L22.s04-s05 no longer pre-explain; L20.s18 rewritten). L19.s04 no longer re-runs the natural-frequency tree of L2. The "derivative zero is always a maximum" explanation lives once, in L18 (L19.s14 and L20.s16 link back). L19.s18 no longer describes Bayes Comun ahead of L20.

#### 6.4 Verification artefact

`/home/alexa/Desktop/SO/os-study-guide-ml/docs/superpowers/specs/ml-outline/verify_bayes.py` (exact fractions; run `python3 verify_bayes.py` from that folder; it imports the small ID3 helper `id3c.py` next to it for the sections P4 and P5, which enumerates tie choices). It prints every number of this outline in sections L19, L20, L21, L22, quiz numbers, MOCK T1 and T21P. The builder's numeric test should recompute from the exercise data in the JSON, as design section 10 says; this script is the reference computation.
