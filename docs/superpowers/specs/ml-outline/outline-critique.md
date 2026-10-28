**What:** Independent critique of the ML content outline (outline-prob, outline-info, outline-dt, outline-bayes) against allocation.json, the design and the sources, with every fix applied in the four parts · **When:** 2026-10-28 · **Status:** active

# ML content outline: critique and fixes

## Verdict

**Sound after fixes.** The four parts are accurate: every number I recomputed (266 values) matches, and the 12 definitions I checked match Ciortuz's slides and book. The outline had two kinds of real problems. First, **Lecția 18 (MLE) was missing from all four parts**, although L19, L20, L24 and T21P item 8 link back to it; I wrote it (now in `outline-bayes.md`, before L19). Second, there was **repetition, the thing Alex complained about**: 18 cross-lesson repeats and 20 within-lesson repeats. Most were quiz items asking the same question as an exercise or screen of the same lesson, and "De ce?" screens that gave away an exercise. All of them are fixed in the four files. Nothing in the fixes changes the allocation's ownership.

A second pass (the resumed run, same day) re-ran every check on the fixed files (all pass), reviewed the new Lecția 18 against the book and the slides (correct), recomputed 69 values with a fresh script (all agree) and found three more kinds of problem, all fixed: the quiz explanations of L1-L6 were written in English while their stems were Romanian (36 explanations translated, 8 topic labels removed from the stems); worked examples that run over several screens asked about "același tabel" with the table out of view (a data-panel rule added to all four parts); and five weak or missing distractor explanations (L7 ×3, L17, L24). Section 7 lists them. The four parts are joined in lesson order in `2026-10-28-ml-lessons-content-outline.md`.

Counts after the fixes: **24 lessons** (L1-L24) plus 2 tests; **135 exercise numbers** (313 part-level atoms, 19 numbers optional), every one in its owner lesson; **93 quiz items** (4 per lesson, 3 in L13, L16, L22).

Scripts (all `python3 -I`, in `/tmp/claude-1000/-home-alexa-hub/586cac55-e548-45e9-92fa-828bc679c474/scratchpad/verify-outline/`): `seg.py` (splits the outlines by lesson), `cov.py` and `table.py` (coverage), `rep.py` and `fwd.py` (repetition and forward references), `count.py`, and the four numeric checks `v_prob_info.py`, `v_dt.py`, `v_bayes.py`, `v_tests.py`. The pre-fix outlines are in `.../verify-outline/bak/`.

## 1. Repetition

### 1.1 Across lessons (each was fixed)

| # | Where | What repeated | Fix |
|---|---|---|---|
| R1 | L8 pretest | Two stumps, "which attribute helps more": the root choice owned by L9, and the same question as the L9 and L10 pretests | New pretest on the worked example's own table: "afli zona sau afli chiria, unde scade mai mult nesiguranța?" (answer: la fel; payoff on screen 7, reason on "De ce?") |
| R2 | L8 retrieve 1 | Root choice by minimum $H(Y\mid A)$ (L9 R4 and L9 "De ce?") | New item: independence gives $H(X,Y)=H(X)+H(Y)$ (0.9 + 1 = 1.9) |
| R3 | L10 Q4 | $H[1{+},4{-}]$ vs $H[4{+},1{-}]$, the symmetry already retrieved in L7 item 4 | New item: compare the pocket-formula products, the minimum wins |
| R4 | L10 "De ce?" | "A pure branch does not make a stump better", already explained in L9 Q1 and the 4.38.d detector | New question: why a failed branch-by-branch matching decides nothing ((288) is sufficient, not necessary) |
| R5 | L10 Q2 | Same pure-branch trap as L9 Q1 | New boxes ($[1{+},4{-}],[6{+},1{-}]$ vs $[2{+},3{-}],[5{+},2{-}]$) testing the matching itself |
| R6 | L9 Q3 | Minimum training error on inconsistent data (L13's property, its pretest, C3 and 4.7.a) | New item on the definition only: a repeated example is not an inconsistency |
| R7 | L12 R2 | "ID3 is eager", L13's concept (d) | Sentence removed from L12 |
| R8 | L12 R3 | (P2) non-uniqueness, L11's concept (b) | Back-link to L11 |
| R9 | L12 Q2 | "ID3 finds the smallest tree", which is exercise 4.21.a in L15 | New item: no backtracking after the root |
| R10 | L13 R1 | Restated (P1) of L11 | Back-link |
| R11 | L16 R1 | MDL explained, while L19 owns the MDL note | Name only, builder note points to L19 |
| R12 | L16 C3 | The xor "IG 0 at the root" explanation of L12 | Back-link to L12 |
| R13 | L17 pretest and C1 | A separate six-row ID table computing "ID gets $IG=H(Y)$", then the same again on the worked example; the injective-attribute property is L13's (4.56.e) | Pretest uses the worked example's table; C1 links back to L13 |
| R14 | L19.s04 | Re-ran L2's natural-frequency tree (100 000 people) and its base-rate explanation | Normalises the two products of s03, one-line back-link to L2 |
| R15 | L19.s14, L20.s16 | "A zero derivative is not always a maximum" explained again (it is L18's concavity argument) | Both link back to L18 |
| R16 | L19.s18 | Described Bayes Comun one lesson early, then L20.s08 did it again | L19 keeps the "prin vot" naming only; the comparison stays in L20.s08 |
| R17 | L9 R4 | The range rule ($0\le H\le\log_2k$) for the third time (L7 R6, L8 R7) | Back-link to L7 (L8 R7 stays: it adds the IG bound) |
| R18 | L20.s11 | Prediction for $n=2$ (5 and 7) = exercises 2.7.e and 2.29.a-b | Prediction for $n=3$ (7, 15); the parameter widget now asks $n=5$ (11, 63) |

Checked and accepted: boxes such as $[3{+},2{-}]$ or $[2{+},4{-}]$ recur in many book exercises (`rep.py` lists them); each is a different exercise, not a reused table. The declared reuses (PlayTennis in L16/L17/L20, mushrooms 4.2 in L11/L20) stay as the allocation declares them. T21P and the mock reuse lesson ideas on purpose (they are tests).

### 1.2 Within a lesson (each was fixed)

| # | Lesson | What repeated | Fix |
|---|---|---|---|
| W1 | L1 | Quiz 1 "can A and B be incompatible?" = exercise 0.1.c | Monotonicity and complement item ($A\subseteq B$, $P(A)=0{,}7$, $P(\bar B)$) |
| W2 | L3 | "De ce?" and quiz 4 both answered exercise 0.91.b ($P(A)=0$ ⇒ independent) | "De ce?" no longer answers it; quiz 4 tests the default independence assumption (concept 3, which had no item) |
| W3 | L4 | Quiz 2 $\mathrm{Var}(3X-5)$ and the field $\mathrm{Var}(-4X)$ of 0.9.b = exercise 0.97 | Quiz 2: linearity of the mean for dependent variables; the 0.9.b field removed |
| W4 | L4 | Exercise 0.25 fields used $n=10$, $p=0{,}3$, the numbers of quiz 3 | $n=20$, $p=0{,}25$ (5; 28,75; 3,75) |
| W5 | L11 | Q3 = exercise 4.2.f; Q4 = R2 and exercise 4.43 | Q3: the empty branch gets the parent's majority (ML3:9); Q4: no attributes left |
| W6 | L12 | C4 and "De ce?" gave the same xor explanation | C4 states the conclusion only; "De ce?" gives the reason and links to 0.58 (L9) |
| W7 | L12 | Q1 ($2^n$ leaves) = exercise 4.33 | Version-space item |
| W8 | L13 | Pretest feedback gave the C3 explanation | Feedback without the reason |
| W9 | L13 | "De ce?" answered exercise 4.8 | New question: why the extended tree $T_2$ (4.16) can be worse than $T_1$ |
| W10 | L13 | Q1-Q4 were exercises 4.7.b, 4.8.a, 4.9, 4.56.c with numbers | Three transfer items: an impossible error 0.55 with two classes; 27 leaves for three 3-valued attributes; what "eager" means |
| W11 | L14 | "De ce?" contained the 4.47 proof | Short answer with the C5 numbers; the proof stays in 4.47 |
| W12 | L15 | Q3 = the pretest (pick a model); Q4 = the "De ce?" screen | Q3: overfitting by the ML3:26 definition ($h$ vs $h'$); Q4: 10-fold mechanics (10 trainings of 900) |
| W13 | L16 | "De ce?" printed 4.20's results ($\chi^2$ 6 and 3) | Answer without the exercise's numbers |
| W14 | L16 | Q1 = worked example and 4.19 (top-down vs bottom-up); Q3 = the pretest | Q1: reduced-error pruning choice; Q3: $\chi^2$ degrees of freedom (2, 5.991); 3 items |
| W15 | L17 | Q1 $SplitInfo=\log_28=3$ = C2; Q3 = exercise 4.15.c | Q1: parts 6, 3, 3 give 1.5; Q3: Gini reduction of a perfect split (0.5) |
| W16 | L19 | s05 reveal said what the "De ce?" screen says | Reveal states the flip only |
| W17 | L20 | "De ce?" restated s11 (the parameter counts); q3 = s06 (one attribute) | "De ce?": why JB rests on one row and NB on all seven; q3: NB training is one counting pass, no search |
| W18 | L21 | q2 reused the pretest's 10 spam emails; q4 = s04 and 2.31 ($0/0$) | q2 new data; q4: the $m$-estimate ($\frac17$) |
| W19 | L22 | s04-s05 reveals said what the "De ce?" screen says; q1 = s07-s08; q3 ($A\lor B$) = 2.11.b by symmetry | Reveals trimmed; q1: conditional independence holds ⇒ NB and Bayes Comun have the same error; q3 removed; 3 items |
| W20 | L23 | Item 3 (equality in Jensen) = the "De ce?" screen | AM-GM item ($5\ge4$) |

Accepted within a lesson (not changed): L2's two rule screens put the screening numbers into the formulas (this is the tree-to-formula step the design asks for); L5's "De ce?" ($Y=X^2$, $\mathrm{Cov}=0$) gives the "linear trend only" reason, which 0.11 and 0.100 show but do not explain; quiz items that retrieve a rule with new numbers (allowed by design §5).

## 2. Order (concept used before its lesson)

Fixed: L7 named the MLE with a pointer to L18; L8's 0.142 named KL with a pointer to L24 (L24 R6 now links back to 0.142 instead); L8 quiz used L9's root choice; L9 quiz used L13's property; L12 taught "eager" (L13); L19.s18 described Bayes Comun (L20); "MLE" appeared in L9 (0.58) and L16 (R5, 4.20) before L18, now "frecvențe relative" with a builder note. The missing L18 was the largest order gap (L19.s10/s13, L20.s03/s09, L24 R8 and 0.149 linked back to it).

Accepted: pointers that only say where something comes and use nothing (L1's notation bridge "Variabilele aleatoare vin în Lecția 4"; L7 R5 and L8 R6 "demonstrația e în Lecția 23", the allocation's decision to group the entropy proofs with Jensen); L18 glosses $\arg\max$ in one clause, while the max/argmax contrast stays L19's.

## 3. Coverage

- **Lecția 18 was missing.** Written: 2 concepts, 12 screens (pretest coin 1,0,1,1,1; Cn-s5:1 "Remember 2"; likelihood, log-likelihood, MLE, the three count formulas; proof 0.43.c as four prediction screens; "De ce ln?"), 4 quiz items, exercises 0.42 and 0.43.a-e, the `ml-viz-likelihood` spec. It does not use T21P item 8's die (the test keeps it) and has no zero-count preview (L21 owns it, per the allocation note).
- `cov.py`: every exercise number of `allocation.json` now appears in its owner lesson (it was all except L18's six). `table.py`: all 87 exercise references of the week table (WYSK p. 19) are in `exercise_index`.
- Prose lists (WYSK pp. 1-8): 2.40, 2.41, 2.43 are not named in `out_of_scope`, but they sit in the same week-6 bullet as the excluded 2.10, 2.12, 2.32, 2.34 (scope report, line 45); documentation gap only. 0.145.c is in L23 though not in `exercise_index` (the info part flagged it).
- Second pass, prose lists re-parsed (`prose.py`): every week 1-5 number is allocated or named out of scope. Not named by number, but outside weeks 1-5 by the checklist itself: 2.40, 2.41, 2.43 (week 6), and 2.15-2.23, 2.45-2.54 ("Advanced issues (II): Gaussian Bayesian classification", covered only by the allocation's "Gaussian Naive Bayes" entry). Documentation gap in `allocation.json`; no lesson is affected.
- Allocation item not used on purpose: the word "evidență" (L2), which is not in Ciortuz's material.

## 4. Correctness

**Numbers: 266 recomputed, 266 agree** (first pass), **plus 69 recomputed from scratch in the second pass, 69 agree** (`v_resume.py`: L1-L6 quiz values, the L8 worked example both ways, L9/L10/L16/L17 quiz values, L18-L22 worked examples and quizzes, the L20 parameter counts for $n=3,5,10$, the L22 error rates including $P_{NB}$ 0.174, the L24 KL values) (exact fractions and `log2`, plus an ID3 that enumerates tie choices and a Naive Bayes leave-one-out). A selection across the four parts:

| Part | Value | Recomputed |
|---|---|---|
| prob | L2 screening $90/981$; prevalence ½ $10/11$ | 0.0917; 0.9091 |
| prob | 0.94 $18/59$; 0.95 $143/263$; 0.90 $2/5$ | 0.3051; 0.5437; 0.4 |
| prob | L5 $\mathrm{Cov}=-0.02$, $\mathrm{Var}(X+Y)=0.41$ | agree |
| prob | 0.16 $p=7/60$, $q=11/120$, $13/960$ vs $1/64$ | agree |
| prob | 0.101 $11/18$, $8/15$, $5/12$; L6 $P(Y{=}1\mid X{=}1)=0.68$ | agree |
| info | 0.56.c $H(S)=3.2744$; 0.140 1.875 | agree |
| info | 0.57 $H(C\mid T)=0.82740$ (book 0.82715), $H(T\mid C)=1.43774$ | agree |
| info | 0.142 $H(I,W)=2.32113$, $IG=0.000809$ | agree |
| info | 0.63.b 2.5964 / 2.5627, detector 2.5172; 0.147 2.7362 / 2.9773 / 1.9757 | agree |
| dt | P21 0.8113 / 1 / 0.9377; 4.34 0.9839, 0.4333 | agree |
| dt | 4.38 $H(V\mid G)=0.822$, $H(V\mid T)=0.7355$; 0.58 MI 0.0157, 0.3113 | agree |
| dt | L10 C3 products 11608.27 and 368224.2, $H=0.6751$ / $0.9245$ | agree |
| dt | 4.37 IGs 0.4 / 0.1145 / 0.0349 / 0.1245; 4.41 0.0112 / 0.4267 | agree |
| dt | 4.6 IGs 0.0485 / 0.1424 / 0.0064; accuracies 1708/2201, 1713/2201 | agree |
| dt | 4.12 0.9841, 0.3789; 4.50 1.2867, 0.3534 | agree |
| dt | 4.20 $\chi^2$ 6, 3, 3 ($p$ 0.0143, 0.0833); 4.55 4.863 / 0.686 / 2.236 | agree |
| dt | 4.52 IG(Temp) 0.3500, $SplitInfo$ 2.6456, $GR$(Outlook) 0.1564 | agree |
| bayes | 2.3 $1.571\cdot10^{-8}$, log-odds −3.2244, $P(FD\mid D)=0.9617$ | agree |
| bayes | 2.4 $108/3125$ (book 0.0336 is wrong), $1/27$ | agree |
| bayes | 0.26 $P(M\mid S{=}4)=0.1659$, $a\ge7$; 2.1 $100/599$, 219.8 | agree |
| bayes | 2.6 $153/403$; 2.27 $18/875$, $1/189$, $486/611$, CVLOO 6/14 (D1, D4, D6, D8, D11, D14) | agree |
| bayes | 2.8 $3/803$, $800/827$; 2.30 0.8306 / 0.7586 / 0.8512; 2.31 $27/28$ | agree |
| bayes | 2.33 0.435 → 0.45; 2.35 error ¼ | agree |
| tests | mock P4 3 thresholds, tree with 3 tests; P5 CVLOO 3/8 (tie-independent); P6 $4/7$, $5/9$ | agree |
| tests | T21P item 10 0.7956, item 11 $H[Y\mid X]=1.3510$ | agree |
| new | L18 coin $L(0.8)=0.08192$, $\int=1/30$; 0.42 $\theta=1/5$; 0.43 $L(0.6)$ 0.03456 / 0.001194 | agree |
| new | L10 Q2 0.6460 / 0.9080; 4.36.a 0.9852; L17 Q1 1.5; L4.e6 5 / 28.75 / 3.75 | agree |

**Definitions: 12 checked, all match** the source wording: probability space (FND:4), independence and conditional independence with their equivalence conditions (FND:7), properties of $E$, $\mathrm{Var}$, $\mathrm{Cov}$ (FND:14), entropy, specific and average conditional entropy, joint entropy (B:129-130), KL $=CH-H$ (B:152), information gain (ML3:13), $GainRatio$ and $SplitInformation$ (ML3:22), overfitting (ML3:26), $h_{ML}$ and $h_{MAP}$ with equal priors (ML6:6), the $m$-estimate (ML6:18), likelihood as a function, not a distribution (FND:30, B:95).

**Quiz distractors:** every wrong quiz option is now a named misconception with its own explanation. Before the fixes six options lacked one (L7 item 4 shared one explanation for two options; L8 item 3 two; L14 Q2, L17 Q2 and L24 item 3 one each). Some exercise choice fields still have unnamed wrong options (0.6 `sup`, 0.5 `b`, 0.27, 0.103 `c`, 4.16); they are exercise fields with detectors, not quiz items, so they are left to the builder.

## 5. Rules

- No pedagogy labels in learner text (searched every `>` and `RO:` line).
- 2 to 4 concepts in every lesson.
- Data on the same screen: L19 quiz 2 pointed to quiz 1's numbers and L4's "De ce?" to the opening games; both now carry their data.
- Data on the same screen, second pass: the worked examples of L5 (s03-s05), L20 (s03-s06, s18) and L22 (s03-s07), and the same pattern in the other parts, ask about the first screen's table on later screens without showing it. Fixed with one rule in each part's conventions: a worked example keeps its data visible as a data panel on every screen that asks about it (the same example continuing, never another lesson).
- Learner language, second pass: the L1-L6 quiz explanations were English (36 strings) and eight stems began with a topic label: three English ("Conditional vs transposed.", "Chain rule.", "Addition rule."), three naming the rule to use ("Probabilitate totală.", "Frecvențe naturale.", "Monotonie și complement.") and two redundant ("Fabrică.", "Partiție."). All translated or removed; prob's conventions now say quiz items are written in Romanian in full, and that proof steps and reveals described in English are written by the builder with the lesson's own terms.
- Natural frequencies and tree before Bayes' formula: L2 does it; L19 no longer repeats the tree.
- Ciortuz's terms are used ("compas de decizie", "entropie condiționată specifică / medie", "Bayes Comun (Optimal)", "verosimilitate", "spațiul de eșantionare"). For the builder: the decimal separator differs between parts (prob and bayes write 0,0917, info and DT write 0.9183, as the book does); pick one when writing the JSON.

## 6. What I changed, per file

- `outline-prob.md`: L1 quiz 1, L3 "De ce?" and quiz 4, L4 quiz 2, L4.e2 fields, L4.e6 numbers, L4 "De ce?" data (Appendix C item 9).
- `outline-info.md`: L7 forward pointer and item 4 explanations; L8 pretest, item 1, item 3 explanations, 0.142 pointer; L23 item 3; L24 R6 back-link and item 3 explanation (problem 11).
- `outline-dt.md`: L9 pretest wording, R4, Q3, 0.58 wording; L10 "De ce?", Q2, Q4, 4.36.a; L11 Q3, Q4; L12 R2, R3, C4, "De ce?" back-link, Q1, Q2; L13 pretest, R1, "De ce?", quiz; L14 "De ce?", Q2; L15 Q2 distractor, Q3, Q4; L16 R1, R5 and 4.20 wording, C3, "De ce?", quiz; L17 pretest, C1, Q1, Q2, Q3; the constructed-values table and problem 9.
- Second pass: `outline-prob.md` L1-L6 quiz explanations and stems, conventions (language note, data-panel rule); `outline-info.md` L7 quiz 2 and 3, L24 quiz 2, conventions (data-panel rule); `outline-dt.md` L17 Q4, conventions (data-panel rule); `outline-bayes.md` conventions (data-panel rule).
- `outline-bayes.md`: new Lecția 18; header, ledger; L19.s04, s05, s14, s18, q2; L20.s11, s16, s18, q3 and the widget's $n$; L21 q2, q4; L22 s04, s05, q1, q3 removed; section 6 back-links and problem 12.

## 7. Second pass (resumed run): problems found and fixed

| # | Where | Problem | Fix |
|---|---|---|---|
| S1 | L1-L6 quizzes (`outline-prob.md`) | 36 distractor explanations in English under Romanian stems; L1.q4 carried a teaching remark ("the inequality direction that students reverse") inside the learner explanation | All written in Romanian with the lesson's terms; the remark dropped |
| S2 | L1.q1-q4, L2.q1-q4 stems | Topic labels before the question: three English, three that name the rule to use (so the item no longer asks which rule applies), two redundant | Removed (the scenario stays) |
| S3 | All four parts, multi-screen worked examples (e.g. L20.s03-s06 "Același tabel", L22.s03-s07) | The question's data is on an earlier screen | Data-panel rule in each part's conventions |
| S4 | L7 quiz 3 | Explanation of the 0.9 option was garbled ("ar depăși un șir care e aproape sigur") | Rewritten: 0.9 is the majority class's probability; a nearly certain coin has low entropy |
| S5 | L7 quiz 2 | The log₁₀ and ln options had a formula, no explanation | Each says which logarithm it is and how to get base 2 |
| S6 | L17 Q4 | Option "cel mai ieftin" had no explanation | Explanation with $0.30^2/2=0.045>0.04$ |
| S7 | L24 quiz 2 | The "KL is symmetric" explanation sent the learner to numbers from an earlier screen | Uses the item's own data: $KL(a\|b)=0.322$, $KL(b\|a)=0.278$ (recomputed) |

Checked again and correct: Lecția 18 against B:93-99 (0.42 statement, likelihood $2\theta^2(1-2\theta)^3$, $\hat\theta=\frac15$; 0.43 a-e, the four datasets and the answers 0.6 / 0.6 / 0.6 / 0.5, the shape remark of B:99), FND:30 (a likelihood is not a distribution) and Cn-s5:1 "Remember 2" (the four-row table, 1/4 and 1/2); every distractor across the 93 quiz items is named (212 options, `scan4.py`); concept counts are 2-4 in every lesson; no forward use of a later lesson's concept beyond the pointers listed in section 2.

Scripts of the second pass, same folder: `v_resume.py`, `scan2.py` (labels and off-screen references), `scan3.py` (screens that mention a table without one), `scan4.py` (named distractors), `scan5.py` (English in quiz text), `prose.py` (checklist prose lists), `ed_resume_prob.py`, `ed_resume_rest.py`, `concat.py`. Backups of the files before the second pass: `verify-outline/bak2/`.

## 8. Combined file

`2026-10-28-ml-lessons-content-outline.md` (this folder) is the four parts joined in lesson order (L1-L6 prob, L7-L8 info, L9-L17 DT, L18-L22 bayes, L23-L24 info), then the two tests, then the parts' notes. Only heading levels changed, and the four part titles and **What** lines were replaced by one header and a lesson index; a line-by-line comparison confirms every other line of the parts is in it.

## 9. Left for Alex

1. **Lecția 18 is new and was written by the critic**, from the allocation and the book (B:93-99, FND:28-30, Cn-s5:1); the second pass checked it against those pages (correct), but Alex has not seen it.
2. The open points of the parts are unchanged and still need his ruling where they matter for marking: the mock problem 1c (total-probability proof instead of $P(A,B\mid C)$, `outline-bayes` decision 1); 0.58.b (the book's four features vs smaller consistent subsets); the threshold-counting rule in 4.51.a; the tie rule in 2.4 (CVLOO 1/5 vs 3/5); the free-parameter convention in 2.27.b (13 / 71); the three readings of 2.30; T21P has no official barem.
3. Continuous distributions (the design's provisional lesson 4) stay out of scope, as the allocation decided; content-map 6.6 leaves that call to him.
