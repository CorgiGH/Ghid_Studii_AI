**What:** Content outline for ML lessons 1-6 (probability and random variables, everything before entropy): ids ml-l01 .. ml-l06, exactly as allocated in `allocation.json` · **When:** 2026-10-28 · **Status:** active

# Outline: probability and random variables (L1-L6)

## 0. How to read this file

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

### 0.1 Ownership ledger (no item in two lessons)

| Lesson | Teaches (once) | Data owned |
|---|---|---|
| L1 | probability space, axioms, properties from the definition, classical formula, set notation, conditional probability, multiplication and chain rule, conditional multiplication rule | f1-f4 on Ω={a,b,c} (Cn-s1:3); die and "even" (pretest payoff); soldiers 1/3 and 1/10 (Cn-s1:6); 0.1, 0.2, 0.3, 0.8 |
| L2 | partition, total probability, Bayes | screening 10 000 persons; 0.6, 0.7, 0.90, 0.94, 0.95 |
| L3 | independence of events (both forms), conditional independence of events (both forms), the two default assumptions | Cn-s1:7 (0.5, 0.2, 0.11); 0.89; 0.5 coin game |
| L4 | random variable, pmf, cdf, g(X), mean, variance, Bernoulli, binomial, categorical, indicator | three coins R; X in {-1,0,1}; X in {-1,0,1,2}; the two games; 0.24, 0.97 |
| L5 | joint, marginal, conditional distribution of variables; independence of variables; covariance, correlation, Var(X+Y) | Cn-s2:6 table; 0.11, 0.99, 0.100 tables; 0.13 lists |
| L6 | conditional independence of variables; what is needed to use it | noisy-witness example; 0.15, 0.16, 0.101, 0.102 data |

### 0.2 Decisions I made (plumbing; Alex can veto; also see the end of the file)

1. The screening example uses 10 000 people, not 1000: 1000 people give 89.1 false positives (not a whole number). Same probabilities (1%, 90%, 9%).
2. The word "evidență" (for the denominator of Bayes) is not used on any screen: it appears in `Companion.pdf` only, not in Ciortuz's slides or book. The denominator is called "P(A) din formula probabilității totale".
3. "Dependent but conditionally independent" (and its example) belongs to L6 only. L3 teaches the definition of conditional independence of events with a plain numeric check and the proof 0.92, nothing more.
4. The Cn-s1:6 multiplication-rule example (1/3 and 1/10, answer 1/30) is not in `allocation.json` data tables; L1 uses it as its multiplication-rule example and no other lesson does.
5. The "two forms" of independence are named by their formulas ("forma cu produs", "forma cu probabilitate condiționată"), because the book and the seminar call them "tare/slabă" in opposite senses (conflict C-6).

---

# Lecția 1 (`ml-l01`): Probabilitate: spațiu de probabilitate, probabilitate condiționată, regula de înmulțire

**Priority A.** **Concepts (3):** (1) spațiul de probabilitate $(\Omega,\mathcal F,P)$, aditivitatea numărabilă, cazul uniform; (2) probabilitatea condiționată $P(A\mid B)$; (3) regula de înmulțire și regula de înlănțuire, inclusiv varianta condiționată. **Prerequisites:** none.

**Does not teach (owned elsewhere):** total probability, Bayes (L2); independence (L3); random variables (L4).

## L1 screens: opening question

**L1.s01** (question, number or fraction field; data on the same screen)
> Aruncăm un zar corect. Un prieten ne spune doar atât: **a căzut o față pară**. Cât este acum probabilitatea să fi căzut 6?

Expected `1/3` (frac). Typical wrong value `1/6`. After the answer the screen only says: "Păstrează răspunsul. Îl verifici mai departe." The payoff is on screen L1.s10 (same die, drawn as a diagram). Source of the problem type: Cn-s1:4 (die and even); the question about 6 is mine `[construit]`.

## L1 screens: worked example, probability space (Cn-s1:3)

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

## L1 screens: rules

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

## L1 screen: why

**L1.s13** (reflect, one causal question with a reveal)
> De ce împărțim la $P(B)$ în definiția $P(A \mid B)$, în loc să luăm direct $P(A \cap B)$?

Answer: after we learn $B$, the event $B$ becomes the whole space, so its probability must be 1. $P(B \mid B) = P(B)/P(B) = 1$. Without the division the outcomes inside $B$ would carry total mass $P(B) < 1$ (for the die: 1/2), and half of the probability would be lost. Dividing rescales all the outcomes of $B$ by the same factor, so they keep the same proportions between them (2, 4, 6 stay equally likely: 1/3 each).

## L1 screens: retrieve (4 items; new numbers, never the die or the soldiers again)

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

## L1 exercises (calculation exercises; each is owned only here)

### L1.e1: ex. 0.1 (B:23), `[caiet]`, answer status book

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

### L1.e2: ex. 0.2 (B:24), `[caiet]`, answer status book

**Enunț:** Se aruncă simultan două zaruri. $S$ = suma numerelor. **a.** Calculați $P(S = 11)$. **b.** Dacă știm că $S$ este număr prim, cât devine probabilitatea de mai sus?

**Fields:** `a` frac `1/18` (= 2/36); `b0` num "Câte cazuri (perechi de zaruri) dau $S$ prim?" `15`; `b` frac `2/15`.

**Hints:** 1) Cele două zaruri dau 36 de perechi la fel de probabile; sumele nu sunt la fel de probabile. 2) Sumele prime sunt 2, 3, 5, 7, 11: numără perechile pentru fiecare (1, 2, 4, 6, 2). 3) $P(S{=}11 \mid S\text{ prim}) = \dfrac{P(S{=}11)}{P(S\text{ prim})} = \dfrac{2/36}{15/36}$.

**Worked solution (book):** 36 cazuri posibile; $S = 11$ în (5,6), (6,5): $P=2/36=1/18$. Prime sums: S=2: (1,1); S=3: (1,2),(2,1); S=5: 4 cazuri; S=7: 6 cazuri; S=11: 2 cazuri; total 15, $P(S\text{ prim}) = 15/36$. $P(S{=}11\mid S\text{ prim}) = (2/36)/(15/36) = 2/15$. Since $2/15 > 1/18$ the probability of an event rose after learning a related fact; in general $A\subseteq B \Rightarrow P(A)\le P(A\mid B)$ (book remark, B:24).

**Detectors (b):** `1/18` → "Ai dat $P(S=11)$ fără să folosești informația 'S prim'." `1/5` → "Ai tratat cele 5 sume prime (2, 3, 5, 7, 11) ca la fel de probabile; zarurile dau 36 de cazuri egale, sumele nu." `2/36` → "Ai dat numărătorul; împarte la $P(S\text{ prim})=15/36$." `15/36` → "Aceasta este $P(S\text{ prim})$, numitorul." (a) `1/36` → "S=11 se obține în două moduri, (5,6) și (6,5)."

### L1.e3: ex. 0.3 (B:25), `[caiet]`, answer status book

**Enunț:** O cutie conține trei carduri: unul roșu pe ambele părți, unul verde pe ambele părți, unul roșu pe o parte și verde pe cealaltă. Selectăm un card la întâmplare; vedem doar fața de sus și e verde. Care este probabilitatea ca și cealaltă față să fie verde?

**Fields:** `n` num "Câte fețe are Ω?" `6`; `a` frac `2/3`.

**Hints:** 1) Ce se observă după extragere: un card sau o față? Spațiul de eșantionare e format din ce? 2) Notează fețele R1, R2 (cardul 1), R3, V4 (cardul 2), V5, V6 (cardul 3); cazurile posibile sunt fețele verzi. 3) Cazuri posibile: V4, V5, V6; favorabile: V5 și V6 (doar la ele cealaltă față e verde).

**Worked solution (book):** $\Omega = \{R1, R2, R3, V4, V5, V6\}$ (feţele, nu cardurile, fiindcă observăm o faţă, nu ambele). $p = m/n = 2/3$.

**Detectors:** `1/2` → "Ai ales cardurile ca spațiu: 'cardul e VV sau RV, deci 1/2'. Dar VV poate arăta verde în două moduri (V5, V6), RV într-unul (V4): cardurile nu sunt la fel de probabile după ce vezi verde." `1/3` → "Ai numărat un card favorabil din trei carduri; după ce vezi verde mai rămân 3 fețe posibile, din care 2 sunt favorabile."

### L1.e4: ex. 0.14 (B:38), `[caiet]`, answer status book (proof; also the statement of T21P item 1 and T20b 1.2)

**Enunț:** Arătați că pentru orice evenimente (valori) x, y, z: $P(X{=}x, Y{=}y \mid Z{=}z) = P(X{=}x \mid Y{=}y, Z{=}z)\cdot P(Y{=}y\mid Z{=}z)$. În notație simplificată: $P(A, B \mid C) = P(A \mid B, C)\,P(B \mid C)$ (cu $P(B,C)>0$). Indicație: regula de înlănțuire.

**Proof screens:** 1. "Cum se scrie membrul stâng cu definiția?" ✓ $P(A,B\mid C)=\dfrac{P(A,B,C)}{P(C)}$. ✗[definiția cu alt numitor] "$\dfrac{P(A,B,C)}{P(B)}$": the condition is C, so the denominator is $P(C)$. 2. Chain rule with the factors in a convenient order: $P(A,B,C) = P(C)\,P(B\mid C)\,P(A\mid B,C)$. 3. Cancel $P(C)$: $P(B\mid C)\,P(A\mid B,C)$. ∎ Alternative (book): expand the right side: $\dfrac{P(A,B,C)}{P(B,C)}\cdot\dfrac{P(B,C)}{P(C)} = \dfrac{P(A,B,C)}{P(C)}$.

**Fields:** `f` choice "Care este forma echivalentă (aceeași demonstrație, rolurile lui A și B schimbate)?" ✓ $P(A,B\mid C)=P(A\mid C)\,P(B\mid A,C)$; ✗[transpusă] $P(A,B\mid C)=P(A\mid B)\,P(B\mid C)$ (the condition C is lost); ✗[produs simplu] $P(A,B\mid C)=P(A\mid C)\,P(B\mid C)$ (this holds only under conditional independence, Lecția 3).

**Detector note:** the second wrong option is the exam-level trap: the product form without $A$ in the condition is a special case (vezi Lecția 3).

**Builder:** `T21P` item 1 writes the second form with conditions $P(C)\ne0$, $P(A,C)\ne0$; show both orders and say the proof is the same.

### L1.e5 (optional): ex. 0.8 (B:29), `[caiet]`, answer status book

**Enunț:** Marcați adevărat sau fals. Pentru fiecare afirmație adevărată demonstrați; pentru fiecare falsă dați un contraexemplu sau o justificare. **a.** $P(A\mid B)P(B)=P(B\mid A)P(A)$ dacă $P(A),P(B)>0$. **b.** $P(A\cup B)=P(A)+P(B)-P(A\mid B)$ dacă $P(B)>0$. **c.** $\dfrac{P(A\cup B\cup C)}{P(B\cup C)} \ge P(A\mid B\cup C)\,P(B\cup C)$ dacă $P(B\cup C)>0$. **d.** $P(B\mid A)+P(B\mid\bar A)=1$ dacă $P(A),P(\bar A)>0$.

**Fields:** `a` tf `adevărat`; `b` tf `fals`; `c` tf `adevărat`; `d` tf `fals`. Counterexample fields (zar corect): for b, with A = B = "număr par": `b1` frac "$P(A\cup B)$" `1/2`, `b2` frac "$P(A)+P(B)-P(A\mid B)$" `0` (`[construit]`); for d, with A = "număr par", B = "fața 1": `d1` frac "$P(B\mid A)$" `0`, `d2` frac "$P(B\mid\bar A)$" `1/3`, `d3` frac "suma" `1/3` (the book shows $P(B\mid\bar A)=1/3$ and $P(\bar B\mid A)=1$, B:30; mine adds the sum, `[construit]`).

**Hints:** 1) Scrie fiecare membru cu regula de înmulțire sau cu definiția. 2) Pentru (b): regula de adunare dă $P(A\cup B)=P(A)+P(B)-P(A\cap B)$; când e $P(A\cap B)=P(A\mid B)$? 3) Pentru (d): $P(B\mid A)+P(\bar B\mid A)=1$ (aceeași condiție A), nu $P(B\mid A)+P(B\mid\bar A)$.

**Worked solution (book):** (a) true: both sides equal $P(A\cap B)$ (multiplication rule). (b) false: it would need $P(A\cap B)=P(A\mid B)$, i.e. $P(A\cap B)=P(A\cap B)/P(B)$, i.e. $P(B)=1$ or $P(A\cap B)=0$. (c) true: with $D=B\cup C$ the claim is $P(A\cup D)/P(D)\ge P(A\cap D)$ (since $P(A\mid D)P(D)=P(A\cap D)$); it holds because $P(A\cup D)/P(D)\ge P(A\cup D)$ ($0<P(D)\le1$) and $P(A\cup D)\ge P(A\cap D)$. (d) false: $P(B\mid A)+P(\bar B\mid A)=1$ always, so (d) would need $P(B\mid\bar A)=P(\bar B\mid A)$; with a fair die, A even, B = face 1: $P(B\mid\bar A)=1/3$, $P(\bar B\mid A)=1$.

**Detectors:** (d) `adevărat` → "Condiția trebuie să fie aceeași: $P(B\mid A)+P(\bar B\mid A)=1$. Aici condițiile sunt A și Ā, deci suma poate fi orice (1/3 în contraexemplu, 2 dacă B = Ω)." (b) `adevărat` → "Regula de adunare scade $P(A\cap B)$, nu $P(A\mid B)$; cele două coincid doar dacă $P(B)=1$ sau $P(A\cap B)=0$."

## L1 visual spec: `ml-viz-omega` (diagram of Ω with events and the restriction to B)

- **Data:** Ω = six die faces drawn as six equal cells; B = {2,4,6}; A = {6}. Nothing else.
- **Steps (manual advance, prediction first):** (1) show Ω and ask "câte rezultate mai rămân după ce aflăm B?" Predict a number; reveal: cells outside B fade, three remain. (2) ask "în câte dintre ele s-a întâmplat A?" Predict; reveal A∩B = {6}, counter 1/3. (3) switch labels to probabilities: cell mass 1/6 each; P(B)=1/2; the three B cells are rescaled by the factor 2 to total 1 (this is the picture for L1.s13); show $P(A\mid B) = 1/3$ as the formula. (4) toggle "B = Ω": nothing fades, $P(A\mid\Omega)=P(A)=1/6$.
- **Learner predicts:** the number of remaining outcomes (3), the favourable count (1), the final value (1/3).
- **Reduced motion:** fading replaced by an instant greying; no auto-advance.

## L1 builder notes

- Sources: FND:4-5, B:23-25, B:29, B:38, Cn-s1:2-6, WYSK:1 (the three properties), T20a 1.1, T21P items 1, 4, 6.
- Uncertain: `L1.s08` row "A sau B, dar nu amândouă" and the 0.8 (c) wording come from tests/book; check against the printed pages when building the KaTeX. In the 0.8 (c) solution the book writes "implies" where "equivalent" is true; the text above keeps the stronger and correct reading.
- 0.14 uses events here and variables in the book: see L1.s12 bridge line.
- Repetition check: the die on L1.s01/L1.s10 is one example used for question and payoff, not twice explained. The seminar urns (11/4, 8/5) are 0.95 in L2 and are not used here.

---

# Lecția 2 (`ml-l02`): Probabilitatea totală și formula lui Bayes

**Priority A.** **Concepts (2):** (1) partiția și formula probabilității totale; (2) formula lui Bayes: a priori, verosimilitate, a posteriori, cu numitorul din formula totală. **Prerequisites:** vezi Lecția 1 (probabilitate condiționată, regula de înmulțire).

**Does not teach:** conditional probability and the multiplication rule (L1); independence (L3).

## L2 screens: opening question

**L2.s01** (question, number field; data on the same screen)
> O boală rară afectează **1%** din populație. Un test o detectează la **90%** dintre bolnavi, dar iese pozitiv și la **9%** dintre oamenii sănătoși. Ai ieșit pozitiv la test. Cât este probabilitatea să fii bolnav?

Expected `≈ 0,09` (accept 0,09 ± 0,005; exact $90/981 = 0{,}0917$). Typical wrong value `0,9`. The screen only says "Păstrează răspunsul."; the learner builds the answer on the next screens. Numbers: `[construit]`, value 0,0917 verified in `seminar-and-errors` B3.

## L2 screens: worked example (viz `ml-viz-freq-tree`, natural frequencies before any formula)

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

## L2 screens: rules

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

## L2 screen: why

**L2.s10** (viz parameter change, then reflect)
> Același test (detectează 90% dintre bolnavi, 9% fals pozitivi), dar acum boala afectează **jumătate** din populație. Din nou 10 000 de persoane: câți dintre cei pozitivi sunt bolnavi, ca fracțiune?

Predict, then reveal: 5 000 bolnavi → 4 500 pozitivi; 5 000 sănătoși → 450 pozitivi; $4500/4950 = 10/11 \approx 0{,}909$. `[construit]`.
> **De ce** același test dă 9% într-un caz și 91% în celălalt? Poate $P(\text{bolnav} \mid \text{pozitiv})$ să fie aflat doar din $P(\text{pozitiv} \mid \text{bolnav})$?

Answer: no. $P(A\mid B)$ says how often the test catches the sick; it says nothing about how many sick people there are (the prior $P(B)$) or how many positives come from the healthy. Bayes needs both the prior and the denominator; change the prior and the posterior changes even though the test is the same.

## L2 screens: retrieve (4 items; new situations)

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

## L2 exercises

### L2.e1: ex. 0.6 (B:27-28), `[caiet]`, answer status book

**Enunț:** Variabilele aleatoare A și B (folosite aici ca evenimente); informațiile: (a) $P(A\mid B)=2/3$; (b) $P(A\mid B)=2/3$ și $P(A\mid\bar B)=1/3$; (c) $P(A\mid B)=2/3$, $P(A\mid\bar B)=1/3$, $P(B)=1/3$; (d) cele trei de la (c) și $P(A)=4/9$. În care dintre cele patru cazuri informațiile sunt suficiente pentru a calcula $P(B\mid A)$? Există informații superflue?

**Fields:** `a` tf `nu`; `b` tf `nu`; `c` tf `da`; `d` tf `da`; `sup` choice "Informația superfluă este..." ✓ `P(A)=4/9 din cazul (d)`; ✗ `P(A|B̄)=1/3 din cazul (b)`; ✗ `P(B)=1/3 din cazul (c)`. Extra checks `[calculat]` (the book gives no numbers): `v` frac "$P(B\mid A)$ în cazul (c)" `1/2`; `pa` frac "$P(A)$ calculat din cazul (c)" `4/9`.

**Hints:** 1) Scrie formula lui Bayes cu numitorul din formula totală. 2) Ai nevoie de trei numere: $P(A\mid B)$, $P(A\mid\bar B)$, $P(B)$. 3) În (d) poți calcula $P(A) = \frac23\cdot\frac13+\frac13\cdot\frac23 = \frac49$, deci e dedus din celelalte.

**Worked solution (book):** $P(B\mid A) = \dfrac{P(A\mid B)P(B)}{P(A\mid B)P(B)+P(A\mid\bar B)(1-P(B))}$. Cazurile (c) și (d) au toate cele trei numere; (a) și (b) nu au $P(B)$ (nici prior). În (d), $P(A)=4/9$ este superfluă (se deduce). Numeric (c): $P(B\mid A)=\frac{2/9}{4/9}=\frac12$.

**Detectors:** `b` = `da` → "În (b) lipsește $P(B)$, probabilitatea a priori; fără ea posteriorul nu e determinat (același test, priori diferite: Lecția 2, exemplul cu boala la jumătate din populație)." `sup` = `P(B)=1/3` → "P(B) este prior-ul, fără el nu merge Bayes; superfluu e P(A), care rezultă din formula totală."

### L2.e2 (optional): ex. 0.7 (B:28), `[caiet]`, answer status book

**Enunț:** Un student fie știe răspunsul la o întrebare adevărat/fals (probabilitate $p$), fie ghicește ($1-p$). Răspunde corect cu probabilitatea 1 dacă știe și 0,5 dacă ghicește. Exprimați în funcție de $p$ probabilitatea $P(\text{knew}\mid\text{correct})$.

**Fields:** `f` choice: ✓ $\dfrac{2p}{p+1}$; ✗[uită ponderea ghicitului] $\dfrac{p}{p+0{,}5}$ (the guess branch has probability $0{,}5(1-p)$, not $0{,}5$); ✗[prior] $p$ (a correct answer is evidence that raises the probability of "knew"). `n1` frac $p=1/2$ → `2/3`; `n2` frac $p=0{,}8$ → `8/9` (`[construit]`, from the printed formula).

**Hints:** 1) Evenimentele: correct, knew, guess = non-knew. 2) $P(\text{correct}) = 1\cdot p + 0{,}5(1-p)$. 3) $\dfrac{1\cdot p}{1\cdot p + 0{,}5(1-p)}$.

**Worked solution (book):** $\dfrac{p}{0{,}5p+0{,}5}=\dfrac{2p}{p+1}$.

### L2.e3: ex. 0.90 (B:216), answer status verified-twice

**Enunț:** O urnă conține $w$ bile albe și $b$ bile negre. Extragem o bilă la întâmplare, o punem înapoi împreună cu alte $d$ bile de aceeași culoare, apoi extragem încă o bilă. **a.** Arătați că probabilitatea ca a doua bilă să fie albă nu depinde de $d$. **b.** Particularizați pentru $w=2$, $b=3$, $d=7$.

**Fields:** `a` choice "$P(\text{a doua albă})$": ✓ $\dfrac{w}{w+b}$; ✗[doar ramura "prima albă"] $\dfrac{w+d}{w+b+d}$; ✗[numitor cu d] $\dfrac{w}{w+b+d}$. `p1` frac $P(W_2\mid W_1)$ for the data `3/4` (9/12); `p2` frac $P(W_2\mid B_1)$ `1/6` (2/12); `b` frac `2/5`.

**Hints:** 1) Împarte după culoarea primei bile: formula probabilității totale. 2) După prima bilă albă urna are $w+b+d$ bile, din care $w+d$ albe; după una neagră, $w+b+d$ bile din care $w$ albe. 3) $\dfrac{w}{w+b}\cdot\dfrac{w+d}{w+b+d}+\dfrac{b}{w+b}\cdot\dfrac{w}{w+b+d}$.

**Worked solution:** $P(W_2) = \dfrac{w(w+d)+bw}{(w+b)(w+b+d)} = \dfrac{w(w+b+d)}{(w+b)(w+b+d)} = \dfrac{w}{w+b}$: $d$ cancels. With $w=2,b=3,d=7$: $\frac25\cdot\frac9{12}+\frac35\cdot\frac2{12} = \frac3{10}+\frac1{10}=\frac25$. Culegerea nu dă răspunsul; verificat de două ori.

**Detectors:** `b` = `3/4` → "Aceasta este $P(W_2\mid W_1)$, doar ramura 'prima albă'; formula totală adună și ramura 'prima neagră'." `b` = `3/10` → "Ai adunat doar ramura albă-albă; lipsește ramura neagră-albă ($1/10$)." (a) ✗ options explain: with $\frac{w+d}{w+b+d}$ the learner kept the conditional only.

### L2.e4: ex. 0.93 (B:217), answer status verified-twice (proof)

**Enunț:** $B_1,\dots,B_k$ formează o partiție a lui $\Omega$; $P(A)>0$. Arătați că dacă $P(B_1\mid A) < P(B_1)$, atunci $P(B_i\mid A) > P(B_i)$ pentru cel puțin un $i \in \{2,\dots,k\}$. Indicații (de dovedit în ordine): (a) $\sum P(B_i)=1$; (b) $\sum P(B_i\cap A)=P(A)$; (c) $P(B_i\mid A)P(A)=P(B_i\cap A)$; (d) $\sum P(B_i\mid A)=1$; (e) $P(B_i\cap A)+P(B_i\cap\bar A)=P(B_i)$.

**Proof screens:** 1. (a) "Ce proprietate dă $\sum P(B_i)=1$?" ✓ aditivitate numărabilă pe o partiție + $P(\Omega)=1$. 2. (b) $A=\bigcup_i (A\cap B_i)$ disjoint, so $\sum_i P(B_i\cap A)=P(A)$ (varianta formulei totale). 3. (c) regula de înmulțire. 4. (d) divide (b) by $P(A)$ using (c): $\sum_i P(B_i\mid A)=1$. 5. Suppose, by contradiction, $P(B_i\mid A)\le P(B_i)$ for every $i\ge2$. 6. Then $1 = P(B_1\mid A)+\sum_{i\ge2}P(B_i\mid A) < P(B_1)+\sum_{i\ge2}P(B_i) = 1$: contradiction. ∎ Prediction at step 5: "Ce presupunem pentru a face contradicția?" ✓ că pentru toți $i\ge2$, $P(B_i\mid A)\le P(B_i)$. ✗[negare greșită] "pentru toți $i\ge2$, $P(B_i\mid A)<P(B_i)$": the negation of "at least one is larger" is "none is larger" ($\le$), and a strict inequality is not needed.
**Fields (numeric end check, `[construit]`):** `e` frac "Pentru o partiție $B_1,B_2,B_3$ cu $P(B_i)=1/3$ și $P(B_1\mid A)=1/6$, $P(B_2\mid A)=1/6$: cât trebuie să fie $P(B_3\mid A)$?" `2/3` (it exceeds 1/3, as the claim says).
**Status:** the book gives no answer (propuse); the proof is the one in the content map, logic checked (`verified-answers`: "proof logic").

### L2.e5: ex. 0.94 (B:217), answer status verified-twice

**Enunț:** Într-o grupă de creșă, 30% dintre copii au ochi căprui, 50% albaștri, 20% alte culori. Pentru prima rundă a unui joc, educatoarea selectează 65% dintre copiii cu ochi căprui, 82% dintre cei cu ochi albaștri și 50% dintre ceilalți. Care este probabilitatea ca un copil ales la întâmplare să aibă ochi albaștri, dacă știm că **nu** a fost selecționat?

**Fields:** `n` frac "$P(\text{neselecționat})$" `59/200` (= 0,295); `r` frac `18/59` (≈ 0,3051, tol ±0,0005).

**Hints:** 1) Rata de neselecție în fiecare grup: 35%, 18%, 50%. 2) $P(\text{nesel.}) = 0{,}3\cdot0{,}35+0{,}5\cdot0{,}18+0{,}2\cdot0{,}5$. 3) $P(\text{albaștri}\mid\text{nesel.}) = \dfrac{0{,}5\cdot0{,}18}{P(\text{nesel.})}$.

**Worked solution:** neselecționați: căprui 0,35; albaștri 0,18; altele 0,50. Formula totală: $0{,}105+0{,}09+0{,}1=0{,}295$. Bayes: $\dfrac{0{,}09}{0{,}295}=\dfrac{18}{59}\approx0{,}3051$. Culegerea nu dă răspunsul; verificat de două ori.

**Detectors:** `0,5816` (82/141) → "Ai folosit procentele de **selecție** (0,65; 0,82; 0,50); întrebarea cere cei neselecționați: complementele 0,35; 0,18; 0,50." `0,09` → "Ai uitat numitorul: împarte la $P(\text{nesel.})=0{,}295$." `0,18` → "Aceasta este $P(\text{nesel.}\mid\text{albaștri})$, verosimilitatea, nu posteriorul."

### L2.e6: ex. 0.95 (B:218), answer status verified-twice

**Enunț:** Urna 1: 11 bile albe, 4 roșii. Urna 2: 8 albe, 5 roșii. Alegem o urnă la întâmplare (probabilitate uniformă), apoi extragem o bilă din ea. Dacă bila extrasă e albă, care este probabilitatea să provină din prima urnă?

**Fields:** `pw` frac "$P(\text{albă})$" `263/390` (≈ 0,6744; the seminar asks it as part a, Cn-s1:6); `r` frac `143/263` (≈ 0,5437).

**Hints:** 1) $P(\text{albă}\mid U_1)=11/15$, $P(\text{albă}\mid U_2)=8/13$, $P(U_i)=1/2$. 2) Numitorul: $\frac12\cdot\frac{11}{15}+\frac12\cdot\frac{8}{13}$. 3) $\dfrac{\frac12\cdot\frac{11}{15}}{\frac12\cdot\frac{11}{15}+\frac12\cdot\frac{8}{13}}=\dfrac{143}{143+120}$.

**Worked solution:** $P(U_1\mid\text{albă}) = \dfrac{11/15}{11/15+8/13} = \dfrac{143}{263}\approx 0{,}5437$. Culegerea nu dă răspunsul; verificat de două ori.

**Detectors:** `11/15` (0,7333) → "Ai dat $P(\text{albă}\mid U_1)$; întrebarea e $P(U_1\mid\text{albă})$, condiționata inversă; cele două diferă (0,73 față de 0,54)." `11/19` (0,579) → "Ai numărat bilele albe din ambele urne (11 din 19), dar urnele nu au același conținut (15 și 13 bile), iar alegerea urnei e la fel de probabilă pentru fiecare, nu proporțională cu bilele." `1/2` → "Aceasta este probabilitatea a priori a urnei 1; bila albă o schimbă."

### L2.e7: ex. 0.96 (B:218), answer status verified-twice

**Enunț:** Adevărat sau fals, cu justificare riguroasă (contraexemplu pentru false; tipul proprietății pentru adevărate): **a.** $P(A\cup B\cup C)\ge P(A)+P(B)+P(C)$. **b.** $P(A\mid B,C)=\dfrac{P(B\mid A,C)\,P(A\mid C)}{P(B\mid C)}$. **c.** $P(A\mid C)=\sum_{i=1}^n P(A,B_i\mid C)$, cu $B_i\cap B_j=\emptyset$, $\bigcup B_i=\Omega$. **d.** $P(A\mid C)=\sum_{i=1}^n P(A\mid B_i,C)\,P(B_i\mid C)$, cu aceleași $B_i$.

**Fields:** `a` tf `fals`; `b` tf `adevărat`; `c` tf `adevărat`; `d` tf `adevărat`; `bt` choice "tipul (b)" ✓ `formula lui Bayes, varianta condiționată`; `ct` choice "tipul (c) și (d)" ✓ `formula probabilității totale, varianta condiționată`. Counterexample fields for (a), with $A=B=C$, $P(A)=1/2$: `a1` frac "$P(A\cup B\cup C)$" `1/2`; `a2` frac "$P(A)+P(B)+P(C)$" `3/2` (`[construit]`).

**Hints:** 1) Pentru (b)-(d): fiecare formulă e cunoscută din Lecția 1-2, cu "dat C" adăugat în toate probabilitățile. 2) (b): $P(A\mid B,C)=\dfrac{P(A,B\mid C)}{P(B\mid C)}$ și $P(A,B\mid C)=P(B\mid A,C)P(A\mid C)$ (exercițiul 0.14, Lecția 1). 3) (c)-(d): evenimentele $A\cap B_i$ sunt disjuncte și reuniunea lor este $A$ (dat C).

**Worked solution:** (a) false: the union bound goes the other way, $P(A\cup B\cup C)\le P(A)+P(B)+P(C)$; $A=B=C$ with $P=1/2$ gives $1/2<3/2$. (b) true: conditional Bayes: $P(A,B\mid C)=P(A\mid B,C)P(B\mid C)=P(B\mid A,C)P(A\mid C)$, then divide by $P(B\mid C)$. (c) true: conditional marginalization over a partition, $A\cap B_i$ disjoint with union $A$. (d) true: each term of (c) is $P(A\mid B_i,C)P(B_i\mid C)$ by 0.14. The footnote of the book allows relaxing $\bigcup B_i=\Omega$ to $P(\bigcup B_i)=1$ or $A\subseteq\bigcup B_i$ (B:218). Culegerea nu dă răspunsul; verificat de două ori.

**Detector:** `a` = `adevărat` → "Inegalitatea e pe dos. Suma $P(A)+P(B)+P(C)$ numără suprapunerile de mai multe ori, deci ≥ reuniunea."

## L2 visual spec: `ml-viz-freq-tree` (probability tree with natural frequencies)

- **Data (parameters editable by the lesson, not by the learner):** population $N=10\,000$; prevalence $0{,}01$; detection $0{,}9$ ($P(\text{poz}\mid\text{boală})$); false positive rate $0{,}09$ ($P(\text{poz}\mid\text{sănătos})$).
- **Steps (manual advance; each preceded by a numeric prediction):** root 10 000; level 1: 100 boală / 9 900 sănătoși; level 2: 90 poz + 10 neg under boală, 891 poz + 9 009 neg under sănătoși; highlight the two positive leaves (90 and 891) and show the fraction $90/981$; then a toggle "arată probabilitățile": each branch gets its probability (0,01 / 0,99 / 0,9 / 0,09), each leaf its product (0,009; 0,0891), and the fraction $0{,}009/(0{,}009+0{,}0891)$ is aligned with the Bayes formula of L2.s07.
- **Second configuration (L2.s10):** prevalence $0{,}5$, same test: leaves 4 500 / 450; fraction $4500/4950 = 10/11$.
- **Learner predicts:** each node count in turn (100, 90, 891, 981) and the final fraction.
- **Reduced motion:** counts appear without growth animation. Integer counts only (that is why $N=10\,000$).

## L2 builder notes

- Sources: FND:6, ML6:4 (not needed here; hypotheses belong to L19), B:27-28 (0.6, 0.7), B:216-218 (0.90-0.96), Cn-s1:6 (the urns), T20a 1.2 (prove total probability), T20b 3.1 and T21P item 9 (Bayes word problems; their numbers are not reused).
- Numbers: all `[construit]` values (screening, factory, q2, q4, 0.7 numerics) were recomputed with exact fractions; the printed-book ones are only formulas.
- Uncertain: the term "verosimilitate" for $P(A\mid B)$ is natural in the course (ML6 uses "likelihood") but is not printed next to Bayes in FND:6; keep it as a label, not as a quotation.
- Repetition check: the screening example appears in the question, the tree, the rule footnote line and the why (as a prevalence change); the explanation is given once (the tree).

---

# Lecția 3 (`ml-l03`): Independența evenimentelor și independența condiționată

**Priority B.** **Concepts (3):** (1) independența evenimentelor (forma cu produs și forma cu probabilitate condiționată; nu se confundă cu evenimente disjuncte); (2) independența condiționată a evenimentelor (ambele forme); (3) cele două presupuneri implicite: echiprobabilitate și independență. **Prerequisites:** vezi Lecția 1 (probabilitate condiționată, regula de înmulțire, regula de adunare, ex. 0.1.a, 0.14).

**Does not teach:** the dependent-but-conditionally-independent example (L6, decision 3); random-variable independence (L5).

## L3 screens: opening question

**L3.s01** (question, number field; data on the same screen)
> Evenimentele A și B **nu pot avea loc împreună**. Știm că $P(A) = 0{,}3$ și $P(B) = 0{,}5$. Aflăm că **A s-a întâmplat**. Cât devine probabilitatea lui B?

Expected `0`. Typical wrong value `0,5` ("nu are legătură"). After the answer: "Păstrează răspunsul; vezi mai departe ce înseamnă că două evenimente nu au legătură." `[construit]`; the misconception is in `allocation.md` L3 and `seminar-and-errors` B3 item 1.

## L3 screens: worked example (Cn-s1:7, `[seminar]`)

**L3.s02** (prediction)
> Probabilitatea ca studentul X să ia 6 puncte la un test este 0,5. Pentru studentul Y este 0,2. Nu știm nimic altceva. Cât este probabilitatea ca **amândoi** să ia 6 puncte?

Correct `0,1` ($0{,}5\cdot0{,}2$). Reveal: with no other information we **assume** the events do not influence each other (independent) and multiply. The answer is an assumption, not a fact; the next screen shows what happens when the problem gives more data.

**L3.s03** (viz `ml-viz-indep-2x2`, step by step)
> Acum ni se spune că probabilitatea ca **amândoi** să ia 6 puncte este **0,11**. Mai sunt evenimentele "X ia 6" și "Y ia 6" independente?

Predictions: product $0{,}5\cdot0{,}2 = 0{,}1$; compare to 0,11: `nu`. Reveal in the 2×2 table (cells 0,11; 0,39; 0,09; 0,41), plus the conditional form: $P(Y\mid X) = 0{,}11/0{,}5 = 0{,}22 \ne 0{,}2 = P(Y)$; knowing that X took 6 raises Y's probability from 0,2 to 0,22. The difference looks small, but the equality must be exact: 0,11 is not "aproape" 0,1.

**L3.s04** (prediction; `[construit]`)
> Fie C evenimentul "testul a fost ușor". Dat C: $P(X \mid C) = 0{,}8$, $P(Y \mid C) = 0{,}5$ și $P(X \cap Y \mid C) = 0{,}4$. Sunt X și Y independente **dat C**, adică independente în lumea în care C s-a întâmplat?

Correct `da`: $0{,}8 \cdot 0{,}5 = 0{,}4$. Second prediction: "Cât este $P(X \mid Y, C)$?" Correct `0,8` ($0{,}4/0{,}5$), equal to $P(X\mid C)$: both forms agree.

## L3 screens: rules

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

## L3 screen: why

**L3.s10** (reflect)
> De ce preferăm ca definiție **forma cu produs** $P(A\cap B)=P(A)P(B)$, deși $P(A\mid B)=P(A)$ pare mai apropiată de ideea de "nu se influențează"?

Answer: $P(A\mid B)$ is defined only when $P(B)\ne0$, and the product form is symmetric and always defined. It also covers events of probability 0, a case the conditional form cannot even state when $P(B)=0$; what happens then is exercise 0.91.b below (the answer is not given here).

## L3 screens: retrieve (4 items; new numbers)

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

## L3 exercises

### L3.e1: ex. 0.4 (B:25-26), `[caiet]`, answer status book (Seminarul Special, week 2)

**Enunț:** Două evenimente A și B sunt independente statistic dacă $P(A\cap B)=P(A)P(B)$. **a.** Arătați că dacă A și B sunt independente, atunci A și $\bar B$ sunt independente, iar $\bar A$ și $\bar B$ sunt independente. **b.** Dacă A este independent în raport cu el însuși, ce puteți spune despre $P(A)$?

**Proof screens.**
- (a, first pair) 1. "Cu ce proprietate începem?" ✓ $P(A\cap\bar B)=P(A)-P(A\cap B)$ (ex. 0.1.a, vezi Lecția 1). ✗[reuniunea] $P(A\cap\bar B)=P(A)+P(\bar B)-P(A\cup\bar B)$: true but it leads away from independence of A and B. 2. Use independence of A and B: $=P(A)-P(A)P(B)$. 3. Factor: $=P(A)(1-P(B))=P(A)P(\bar B)$. So A and $\bar B$ are independent.
- (a, second pair) 1. $P(\bar A\cap\bar B)=P(\bar B)-P(A\cap\bar B)$ (0.1.a applied to $\bar B$ and A). 2. Replace $P(A\cap\bar B)=P(A)P(\bar B)$ (just proved). 3. $=P(\bar B)(1-P(A))=P(\bar A)P(\bar B)$.
- (b) 1. Independence of A with itself: $P(A\cap A)=P(A)P(A)$. 2. $P(A)=[P(A)]^2$, so $P(A)[P(A)-1]=0$. 3. Hence $P(A)=0$ or $P(A)=1$.

**Fields:** `a1` frac "$P(A\cap\bar B)$ pentru $P(A)=0{,}3$, $P(B)=0{,}5$ independente" `3/20` (0,15); `a2` frac "$P(\bar A\cap\bar B)$" `7/20` (0,35) (both `[construit]`); `b` choice "$P(A)$ poate fi" ✓ `0 sau 1`; ✗[A=∅ sau A=Ω] `A = ∅ sau A = Ω` (book trap: "nu rezultă neapărat că A = ∅ respectiv A = Ω"); ✗[jumătate] `1/2`.

**Hints:** 1) Folosește $P(A\cap\bar B)=P(A)-P(A\cap B)$. 2) Înlocuiește $P(A\cap B)$ cu produsul. 3) Pentru (b): scrie independența lui A cu A: $P(A\cap A)=P(A)^2$ și rezolvă ecuația.

**Detectors:** `a1` = `0,35` → "Ai calculat $P(\bar A\cap\bar B)=0{,}7\cdot0{,}5$; întrebarea e $P(A\cap\bar B)=0{,}3\cdot0{,}5$." `a1` = `0,2` → "$P(A)-P(B)$ nu e o formulă; folosește $P(A)-P(A\cap B)=0{,}3-0{,}15$."

### L3.e2: ex. 0.5 (B:26-27), `[caiet]`, answer status book

**Enunț:** Robert și Alina dau cu banul alternativ, Alina prima; primul care obține stema câștigă jocul. **a.** Dacă $P(\text{stemă})=1/2$, care este probabilitatea ca Alina să câștige? (Indicații: enumeră situațiile în care câștigă; $\sum_{i\ge0}a^i=\frac1{1-a}$ pentru $a\in[0,1)$.) **b.** Aceeași întrebare pentru $P(\text{stemă})=p\in(0,1]$. **c.** Cum ai alege să intri în joc: primul sau al doilea?

**Fields:** `p1` frac "$P(A_1)$: Alina câștigă la aruncarea 1" `1/2`; `p3` frac "$P(A_3)$: la aruncarea 3" `1/8`; `rho` frac "raportul dintre doi termeni consecutivi ai seriei" `1/4`; `a` frac `2/3`; `b` choice ✓ $\dfrac1{2-p}$; ✗[simetrie falsă] $\dfrac12$; ✗[doar prima aruncare] $p$; `bn` frac "pentru $p=1/5$" `5/9` (`[construit]` from the printed formula); `c` choice ✓ `primul`; ✗ `al doilea`; ✗ `e indiferent`.

**Hints:** 1) Alina poate câștiga la aruncarea 1, 3, 5, …; evenimentele $A_1, A_3, A_5,\dots$ sunt disjuncte, deci probabilitățile se adună (aditivitate numărabilă). 2) Pentru a câștiga la aruncarea $2i+1$, primele $2i$ aruncări (ale ambilor) trebuie să nu dea stemă, independent, și a $(2i+1)$-a să dea: $(1-p)^{2i}p$. 3) Suma este $p\sum_i\bigl[(1-p)^2\bigr]^i = \dfrac{p}{1-(1-p)^2}$.

**Worked solution (book):** $P(A_{2i+1}) = (1-p)^{2i}p$. For $p=1/2$: $\sum_i (1/2)^{2i+1} = \frac12\cdot\frac1{1-1/4}=\frac23$ (Alina is twice as likely as Robert to win only because she throws first). General: $P(A)=p\cdot\frac1{1-(1-p)^2}=\frac{p}{2p-p^2}=\frac1{2-p}$. For $c$: $\frac1{2-p}\ge\frac12$ for $p\ge0$, so play first.

**Detectors:** `a` = `1/2` → "Ai numărat doar prima aruncare. Alina mai poate câștiga la aruncările 3, 5, …: $1/2+1/8+1/32+\dots$." `a` = `1` → "Ai folosit raportul 1/2 în loc de 1/4: între două șanse ale Alinei sunt două aruncări fără stemă, $(1/2)^2$." `a` = `1/3` → "Aceasta e probabilitatea ca Robert să câștige."

### L3.e3: ex. 0.89 (B:216), answer status verified-twice

**Enunț:** Doi soldați A și B trag la țintă. Probabilitatea ca A să greșească este 1/5, ca B să greșească 1/2, iar ca ambii să greșească simultan 1/10. **a.** Care este probabilitatea ca cel puțin unul dintre soldați să greșească? **b.** Dar ca exact unul să greșească?

**Fields:** `a` frac `3/5` (0,6); `b` frac `1/2` (0,5).

**Hints:** 1) "Cel puțin unul" este reuniunea celor două evenimente. 2) Regula de adunare: $\frac15+\frac12-\frac1{10}$. 3) "Exact unul" = reuniunea fără cazul "ambii": scade încă o dată $P(\text{ambii})$.

**Worked solution:** (a) $P(a\cup b)=P(a)+P(b)-P(a\cap b)=\frac15+\frac12-\frac1{10}=\frac6{10}=\frac35$. (b) exact unul $=P(a\cup b)-P(a\cap b)=\frac6{10}-\frac1{10}=\frac12$. Side note: $P(a)P(b)=\frac1{10}=P(a\cap b)$, so the two events are independent. Culegerea nu dă răspunsul; verificat de două ori.

**Detectors:** `a` = `7/10` → "Ai adunat $\frac15+\frac12$ și ai uitat să scazi intersecția $\frac1{10}$, numărată de două ori." `b` = `3/5` → "Aceasta este răspunsul de la (a), 'cel puțin unul'; 'exact unul' exclude și cazul în care ambii greșesc." `b` = `1/10` → "Aceasta este P(ambii)."

### L3.e4: ex. 0.91 (B:216-217), answer status verified-twice (proofs)

**Enunț:** A și B evenimente. **a.** Arătați că $P(A\mid A,B)=1$. **b.** Arătați că dacă $P(A)=0$ atunci A și B sunt independente. **c.** Arătați că dacă $P(B)=1$ atunci $P(A\mid B)=P(A)$.

**Proof screens.**
- (a) 1. $P(A\mid A,B)=\dfrac{P(A\cap(A\cap B))}{P(A\cap B)}$ (definiția, cu condiția $A\cap B$). 2. $A\cap(A\cap B)=A\cap B$, deci raportul e 1. Condition to say: $P(A\cap B)>0$ (altfel $P(A\mid A,B)$ nu există). ✗[uită condiția] a step that divides without noting $P(A\cap B)>0$.
- (b) 1. "Ce margini are $P(A\cap B)$?" ✓ $0\le P(A\cap B)\le P(A)=0$ (monotonie, Lecția 1). 2. So $P(A\cap B)=0=P(A)P(B)$: forma cu produs.
- (c) 1. $P(B)=1\Rightarrow P(\bar B)=0$. 2. $P(A\cap\bar B)\le P(\bar B)=0$ (monotonie). 3. $P(A\cap B)=P(A)-P(A\cap\bar B)=P(A)$ (ex. 0.1.a). 4. $P(A\mid B)=P(A\cap B)/P(B)=P(A)/1$.

**Remark from the book (B:217):** if $P(B)\ne0$, $P(A\mid B)=P(A)$ gives $P(A\cap B)=P(A)P(B)$, so it is a "mai restrictivă" form (closer to intuition); the lesson names the forms by formula (decision 5).

**Fields (numeric end checks):** `a` num "$P(A\mid A,B)$" `1`; `b` num "dacă $P(A)=0$: $P(A\cap B)$" `0`; `c` frac "dacă $P(B)=1$ și $P(A)=0{,}3$: $P(A\mid B)$" `3/10` (`[construit]`).

**Hints:** 1) (a) Scrie definiția probabilității condiționate cu condiția "$A$ și $B$". 2) (b) Intersecția e inclusă în A. 3) (c) Complementul lui B are probabilitate 0.

**Detectors:** `c` = `1` → "$P(A\mid B)$ cu $P(B)=1$ nu face evenimentul sigur; rămâne $P(A)$, aici 0,3."

### L3.e5: ex. 0.92 (B:217), answer status verified-twice (proof)

**Enunț:** Folosind doar definiția probabilității condiționate, arătați că dacă $P(A\mid B,C)=P(A\mid C)$ sau $P(B\mid A,C)=P(B\mid C)$ atunci $P(A,B\mid C)=P(A\mid C)\cdot P(B\mid C)$.

**Proof screens.** 1. "Ce egalitate leagă $P(A,B\mid C)$ de $P(A\mid B,C)$?" ✓ varianta condiționată a regulii de înmulțire, $P(A,B\mid C)=P(A\mid B,C)\,P(B\mid C)$ (ex. 0.14, vezi Lecția 1). ✗[fără condiția C] $P(A,B\mid C)=P(A\mid B)P(B\mid C)$: the condition C must stay in every factor. 2. Substitute the hypothesis $P(A\mid B,C)=P(A\mid C)$: $P(A,B\mid C)=P(A\mid C)P(B\mid C)$. 3. For the other hypothesis write the rule with A and B swapped: $P(A,B\mid C)=P(B\mid A,C)P(A\mid C)=P(B\mid C)P(A\mid C)$. ∎ Conclusion: the two forms of L3.s08 are equivalent (the converse direction follows by dividing by $P(B\mid C)$ when $P(B,C)\ne0$).

**Fields:** `f` choice "Care este egalitatea-cheie?" (same as step 1).

**Builder:** the book title names the two forms "slabă" and "tare"; the screen does not (decision 5).

## L3 visual spec: `ml-viz-indep-2x2` (independence check on a 2×2 table of events)

- **Data:** events X ("X ia 6"), Y ("Y ia 6"). $P(X)=0{,}5$, $P(Y)=0{,}2$, $P(X\cap Y)=0{,}11$. Cells: $X\cap Y=0{,}11$, $X\cap\bar Y=0{,}39$, $\bar X\cap Y=0{,}09$, $\bar X\cap\bar Y=0{,}41$. Products of marginals: $0{,}10$, $0{,}40$, $0{,}10$, $0{,}40$.
- **Steps:** (1) show the two marginals only, empty cells; the learner predicts the product $0{,}5\cdot0{,}2$ for the top-left cell (0,1). (2) reveal the real cell 0,11; mark the mismatch. (3) the learner predicts whether the other three cells match their products (none does); reveal 0,39 against 0,40, 0,09 against 0,10, 0,41 against 0,40; remark: for events one failed equation already decides, and the four cells fail or hold together (the reason is in ex. 0.4). (4) toggle "$P(X\cap Y)=0{,}10$": all four cells equal their products, independent.
- **Learner predicts:** the product (0,1) and the verdict.
- **Reduced motion:** cell values appear without count-up.

## L3 builder notes

- Sources: FND:7, B:25-27, B:39, B:216-217, Cn-s1:4, 7, 8 (assumptions; the seminar notes' final scheme p.8), T21S 4a, T21P (items 1, 7: independence from numbers).
- The Cn-s1:7 numbers (0,5; 0,2; 0,11) are `[seminar]`; the "test ușor" screen numbers and quiz numbers are `[construit]`.
- Uncertain: nothing numerical. The slide FND:7 states the conditional equivalence "when P(B∩C)≠0"; the seminar adds the strong/weak labels; no label is shown.
- Repetition check: 0.89 uses soldiers with new numbers; the soldiers of L1.s11 are a different problem (a multiplication-rule example) and are not repeated.

---

# Lecția 4 (`ml-l04`): Variabile aleatoare discrete: distribuție, medie, varianță; Bernoulli și binomială

**Priority B.** **Concepts (4):** (1) variabila aleatoare discretă: $\mathrm{Val}(X)$, p.m.f., c.d.f., funcție de variabilă (se aplică valorilor, nu probabilităților); (2) media $E[X]$ și liniaritatea ei; (3) varianța și abaterea standard: $\mathrm{Var}(aX+b)$, $\mathrm{Var}(X)=E[X^2]-E^2[X]$; (4) distribuțiile Bernoulli, binomială, categorială; variabila indicator. **Prerequisites:** vezi Lecția 1 (aditivitate, probabilitate condiționată); vezi Lecția 3 (independența evenimentelor, pentru "n aruncări independente").

**Does not teach:** pairs of variables, joint tables, covariance (L5). One sentence on densities only (L4.s11); continuous distributions are out of scope (allocation `out_of_scope`).

## L4 screens: opening question

**L4.s01** (question; data on the same screen; `[seminar]`, Cn-s2:5)
> Două jocuri cu o monedă corectă. **Jocul 1:** câștigi 1000 de lei la stemă, pierzi 1000 de lei la pajură. **Jocul 2:** câștigi 1 leu la stemă, pierzi 1 leu la pajură. Câștigul mediu este 0 în ambele jocuri. Care joc e mai riscant și cum ai pune riscul într-un singur număr?

Expected: Jocul 1; the number (any of): distanța pătrată medie față de medie, $10^6$ față de $1$ (or its square root, 1000 față de 1). Free-text self-check: the screen shows the expected answer and the learner marks "am avut/n-am avut". After it: "Păstrează ideea; revii la ea mai departe."

## L4 screens: worked example (Cn-s2:2-5, `[seminar]`)

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

## L4 screens: rules

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

## L4 screen: why

**L4.s12** (reflect; payoff of L4.s01)
> În cele două jocuri de la început (câștigi sau pierzi 1000 de lei, respectiv 1 leu, cu o monedă corectă), abaterea medie față de medie, $E[X-E[X]]$, este 0 în ambele. De ce nu o folosim ca măsură a riscului? Ce folosim în loc?

Answer: positive and negative deviations cancel for **every** variable, $E[X-E[X]]=E[X]-E[X]=0$ (game 1: $\frac12\cdot1000+\frac12\cdot(-1000)=0$), so it cannot tell the games apart. Squaring makes every deviation positive: $\mathrm{Var}=\frac12\cdot1000^2+\frac12\cdot1000^2=1\,000\,000$ for game 1 and $1$ for game 2. The unit becomes lei², so we take $\sigma=\sqrt{\mathrm{Var}}$: 1000 lei and 1 leu. (Cn-s2:5; the seminar adds that $E|X-E[X]|$ is harder to compute with.)

## L4 screens: retrieve (4 items; new numbers)

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

## L4 exercises

### L4.e1: ex. 0.9.a (B:30-32), `[caiet]`, answer status book (proof)

**Enunț:** Pentru orice două variabile aleatoare discrete $W$ și $Z$ pe același $\Omega$ arătați că $E[W+Z]=E[W]+E[Z]$, și pentru orice constantă $a$: $E[aX]=aE[X]$. (Variabile cu mulțimi finite de valori, ca în nota 20 din culegere.)

**Proof screens (short proof, PS:3).** 1. "Cum scriem media folosind rezultatele?" ✓ $E[X]=\sum_{\omega\in\Omega}X(\omega)P(\omega)$ (grupăm rezultatele care dau aceeași valoare). ✗[fără probabilități] $E[X]=\sum_\omega X(\omega)$: lipsesc probabilitățile. 2. $(W+Z)(\omega)=W(\omega)+Z(\omega)$, deci $E[W+Z]=\sum_\omega(W(\omega)+Z(\omega))P(\omega)$. 3. Split the sum: $=\sum_\omega W(\omega)P(\omega)+\sum_\omega Z(\omega)P(\omega)=E[W]+E[Z]$. 4. $E[aX]=\sum_\omega aX(\omega)P(\omega)=a\sum_\omega X(\omega)P(\omega)=aE[X]$. ∎ Book's longer route for $E[aX]$ (B:32): $a\ne0$: substitute $x=u/a$ in $\sum_u uP(aX=u)$; $a=0$ trivial.

**Fields (numeric end check, `[construit]`):** pe $\Omega=\{\omega_1,\omega_2\}$ cu $P=\frac12$ fiecare, $W=(1,3)$, $Z=(2,0)$ (valorile în $\omega_1,\omega_2$): `e` num "$E[W+Z]$" `3`; `e2` num "$E[-2W]$" `-4`.

**Detector:** `e` = `4` → "Ai adunat valorile maxime; media este ponderată: $W+Z=(3,3)$, media 3."

### L4.e2: ex. 0.9.b (B:31-33), `[caiet]`, answer status book (proof)

**Enunț:** Notăm $\bar X=E[X]$ și $\mathrm{Var}(X)=E[(X-\bar X)^2]$. Arătați că $\mathrm{Var}(X)=E[X^2]-(E[X])^2$ și că $\mathrm{Var}(aX)=a^2\mathrm{Var}(X)$.

**Proof screens.** 1. Expand: $(X-\bar X)^2=X^2-2\bar XX+\bar X^2$. 2. By linearity ($\bar X$ is a constant): $E[X^2]-2\bar XE[X]+\bar X^2=E[X^2]-2\bar X^2+\bar X^2=E[X^2]-\bar X^2$. Prediction at step 2: "Cât este $E[2\bar X X]$?" ✓ $2\bar X\,E[X]=2\bar X^2$. ✗[constantă în exterior] $2\bar X$: $E[X]$ nu dispare. 3. $\mathrm{Var}(aX)=E[(aX-E[aX])^2]=E[a^2(X-\bar X)^2]=a^2\mathrm{Var}(X)$ (uses $E[aX]=a\bar X$ from 0.9.a). Alternative (book): $E[a^2X^2]-(aE[X])^2=a^2(E[X^2]-(E[X])^2)$.

**Fields (`[construit]`):** $X$ ia 1 cu probabilitatea $\frac14$ și 3 cu $\frac34$: `m` num "$E[X]$" `2,5`; `q` num "$E[X^2]$" `7`; `v` num "$\mathrm{Var}(X)$" `0,75`. (No numeric check of $\mathrm{Var}(aX)$ here: that is exercise 0.97, L4.e9.)

**Hints:** 1) $E[X]=\frac14+\frac94$. 2) $E[X^2]=1\cdot\frac14+9\cdot\frac34$. 3) $\mathrm{Var}=7-6{,}25$.

**Detectors:** `v` = `1` → "Ai scăzut $E[X]=2{,}5$ dintr-un $E[X^2]$ greșit sau ai uitat să ridici media la pătrat: $7-2{,}5^2=0{,}75$."

### L4.e3: ex. 0.12 (B:36), `[caiet]`, answer status book

**Enunț:** $X$ are $E[X]=\mu$ și $\mathrm{Var}(X)=\sigma^2$. **a.** Cât este $E[X(X-1)]$ în funcție de $\mu$ și $\sigma$? **b.** Pentru $c\in\mathbb{R}$, care dintre variantele următoare sunt adevărate? A. $E[(X-c)^2]=(\mu-c)^2+\sigma^2$; B. $(\mu-c)^2$; C. $(\mu-c)^2-\sigma^2$; D. $(\mu-c)^2+2\sigma^2$; E. $\mu^2+c^2+2\sigma^2$; F. $\mu^2+c^2-2\sigma^2$.

**Fields:** `a` choice ✓ $\sigma^2+\mu^2-\mu$; ✗[g(E[X])] $\mu^2-\mu$; ✗[fără $\mu^2$] $\sigma^2-\mu$. `an` num "pentru $\mu=3$, $\sigma^2=2$" `8` (`[construit]`). `b` multi ✓ `A`. `bn` num "$E[(X-5)^2]$ pentru $\mu=3$, $\sigma^2=2$" `6`.

**Hints:** 1) $E[X(X-1)]=E[X^2]-E[X]$ (liniaritate). 2) $E[X^2]=\mathrm{Var}(X)+(E[X])^2$. 3) (b) Dezvoltă $(X-c)^2=X^2-2cX+c^2$ și ia media.

**Worked solution (book):** (a) $E[X^2-X]=E[X^2]-E[X]=\sigma^2+\mu^2-\mu$. (b) $E[X^2]-2c\mu+c^2=\sigma^2+\mu^2-2c\mu+c^2=\sigma^2+(\mu-c)^2$: only A is true (the others are false in general). Numeric: $(3-5)^2+2=6$.

**Detectors:** `an` = `6` → "Ai calculat $g(\mu)=\mu(\mu-1)$; $E[g(X)]\ne g(E[X])$ pentru $g$ neliniară (lipsește $\sigma^2$)." `bn` = `4` → "Aceasta este varianta B, $(\mu-c)^2$: lipsește $\sigma^2$; media pătratelor abaterilor e mai mare decât pătratul abaterii mediei." `bn` = `2` → "Varianța nu se scade (varianta C); $(\mu-c)^2$ se adună cu $\sigma^2$."

**Builder:** the same quantity appears in T21S 4b with the false claim $(m-c)^2-s$ (C-9); do not reuse that statement here.

### L4.e4: ex. 0.23.a (B:55-56), `[caiet]`, answer status book

**Enunț:** Adevărat sau fals: dacă o variabilă aleatoare continuă $X$ are densitatea $p$ diferită de zero pe tot domeniul de definiție, atunci probabilitatea ca $X$ să ia o valoare oarecare $x$ este $P(X=x)=p(x)$.

**Fields:** `tf` `fals`; `v` num "$P(X=x)$ pentru orice $x$, variabilă continuă" `0`.

**Hints:** 1) Pentru o variabilă continuă probabilitățile se calculează pe intervale: $P(a\le X\le b)=\int_a^b p(x)\,dx$. 2) Ia $a=b=x$. 3) Dacă $P(X=x)=p(x)$ și $P(X=x)=0$, atunci $p(x)=0$.

**Worked solution (book):** $P(a\le X\le b)=\int_a^bp$, so $P(X=x)=0$ for every $x$. The claim would give $p(x)=0$ everywhere, contradicting that $p$ is non-zero.

**Detector:** `tf` = `adevărat` → "Densitatea nu este o probabilitate: probabilitatea unui punct exact este 0 în cazul continuu."

### L4.e5: ex. 0.24 (B:56-57), `[caiet]`, answer status book

**Enunț:** Un iepuraș pornește din originea axei și face salturi de lungime 1, spre dreapta dacă la aruncarea unei monede obține stema (probabilitate $p$), spre stânga în caz contrar. Care este poziția medie după $n$ salturi?

**Fields:** `m` frac "$E[X_i]$ pentru $p=2/3$ (un salt)" `1/3`; `a` num "$n=9$, $p=2/3$: poziția medie" `3`; `b` num "$n=9$, $p=1/3$" `-3`; `c` num "$n=9$, $p=1/2$" `0`; `f` choice "pentru $p$ oarecare" ✓ $n(2p-1)$; ✗[doar salturile spre dreapta] $np$; ✗[fără $n$] $2p-1$.

**Hints:** 1) Fiecare salt este o variabilă $X_i$ cu valorile $-1$ și $+1$. 2) $E[X_i]=-1\cdot(1-p)+1\cdot p$. 3) Poziția este $X_1+\dots+X_n$; media sumei este suma mediilor (liniaritate).

**Worked solution (book):** $E[X_i]=2p-1$; $E[X_1+\dots+X_n]=n(2p-1)$. For $p=1/2$ the position 0; for $p=2/3$ it is $n/3$; for $p=1/3$ it is $-n/3$.

**Detectors:** `a` = `6` → "$np=6$ este media salturilor spre dreapta; poziția este (spre dreapta) − (spre stânga) $=6-3$." `b` = `3` → "Semnul: pentru $p<1/2$ iepurașul se îndepărtează spre stânga."

**Builder:** the book text says "dacă obține banul" for tails (typo for the other face); the screen says "pajură".

### L4.e6: ex. 0.25 (B:57-59), `[caiet]`, answer status book

**Enunț:** Distribuția binomială $b(r;n,p)=C_n^rp^r(1-p)^{n-r}$ pentru $r\in\{0,\dots,n\}$. **a.** Verificați că este o p.m.f. **b.** Calculați media și varianța.

**Proof screens.** (a) 1. $b\ge0$ for $p\in[0,1]$. 2. "Ce formulă dă suma?" ✓ binomul lui Newton: $\sum_rC_n^rp^r(1-p)^{n-r}=[p+(1-p)]^n=1$. ✗[suma probabilităților celor două rezultate] $p+(1-p)=1$ doar pentru $n=1$.
(b, media) 1. $kC_n^k=nC_{n-1}^{k-1}$ (se simplifică $k$ din $k!$). 2. $E=\sum_{k\ge1}k\,C_n^kp^k(1-p)^{n-k}=np\sum_{k\ge1}C_{n-1}^{k-1}p^{k-1}(1-p)^{(n-1)-(k-1)}=np[p+(1-p)]^{n-1}=np$. Second way (book remark): the binomial counts heads in $n$ throws, a sum of $n$ Bernoulli($p$) variables, each with mean $p$; linearity gives $np$.
(b, varianța) 1. $\mathrm{Var}=E[X^2]-(E[X])^2$ (L4.e2). 2. Same identity: $E[X^2]=np\sum_{j=0}^{n-1}(j+1)C_{n-1}^jp^jq^{(n-1)-j}$ (with $q=1-p$, $j=k-1$). 3. Split $(j+1)$: the first sum is the mean of $b(\cdot;n-1,p)$, i.e. $(n-1)p$; the second is $1$. So $E[X^2]=np[(n-1)p+1]=n^2p^2-np^2+np$. 4. $\mathrm{Var}=n^2p^2-np^2+np-n^2p^2=np(1-p)$. ∎

**Fields (`[construit]`, $n=20$, $p=0{,}25$; not the $n=10$, $p=0{,}3$ of quiz L4.q3):** `m` num `5`; `q` num "$E[X^2]=n^2p^2-np^2+np$" `28,75`; `v` num `3,75`.

**Hints:** 1) Folosește $kC_n^k=nC_{n-1}^{k-1}$. 2) Scrie $r^2=r(r-1)+r$ sau factorul $(j+1)$ ca în soluție. 3) Verifică la sfârșit cu $n=1$: obții media $p$ și varianța $p(1-p)$ (Bernoulli).

**Detectors:** `v` = `5` → "Aceasta este media $np$; varianța are factorul $(1-p)$." `q` = `25` → "Aceasta este $(E[X])^2=n^2p^2$; $E[X^2]$ o depășește cu varianța $3{,}75$."

### L4.e7 (optional): ex. 0.27 (B:62-63), `[caiet]`, answer status book

**Enunț (distribuție folosită rar; exercițiu opțional):** Distribuția Poisson are $p(x\mid\lambda)=\dfrac{1}{e^{\lambda}}\dfrac{\lambda^x}{x!}$, $x\in\mathbb N$ (cu $0!=1$). Arătați că este o p.m.f., apoi că media este $\lambda$ și varianța este tot $\lambda$. Sugestie: $\sum_{x\ge0}\lambda^x/x!=e^\lambda$.

**Fields:** `m` choice ✓ $\lambda$; ✗ $\lambda^2$; ✗ $1/\lambda$. `v` choice ✓ $\lambda$; ✗ $\lambda^2+\lambda$ (this is $E[X^2]$). `vn` num "$\mathrm{Var}$ pentru $\lambda=2$" `2`.

**Worked solution (book):** $p>0$ and $\frac1{e^\lambda}\sum\frac{\lambda^x}{x!}=1$. Mean: $\sum x\frac{\lambda^x}{e^\lambda x!}=\frac{\lambda}{e^\lambda}\sum_{x\ge1}\frac{\lambda^{x-1}}{(x-1)!}=\lambda$. $E[X^2]$: write $x^2=x(x-1)+x$, get $\lambda^2+\lambda$; $\mathrm{Var}=\lambda^2+\lambda-\lambda^2=\lambda$.

**Hints:** 1) Șterge $x$ din $x/x!$. 2) Schimbă indicele cu $x-1$. 3) $E[X^2]=E[X(X-1)]+E[X]$.

### L4.e8 (optional): ex. 0.28 (B:63-64), `[caiet]`, answer status book

**Enunț:** Care este numărul mediu de aruncări ale unui zar corect până când apare fața 6 (distribuția geometrică)? Justificați.

**Fields:** `e` num `6`.

**Hints:** 1) Probabilitatea ca prima față 6 să apară la aruncarea $n$ este $\frac16\left(\frac56\right)^{n-1}$. 2) $E=\sum_n n\cdot\frac16\left(\frac56\right)^{n-1}$; scrie $n=1+(n-1)$. 3) Rezultă $E=\frac16+\frac56\cdot1+\frac56E$.

**Worked solution (book):** $E=\frac16+\frac56+\frac56E$ (the sum of the probabilities $\sum\frac16(\frac56)^{n-1}=1$ and the shifted sum equals $E$), so $\frac16E=\frac16+\frac56$ and $E=6$.

**Detector:** `e` = `3,5` → "3,5 este media unei singure aruncări; aici numărăm aruncările până la prima față 6, care e în medie 6."

### L4.e9: ex. 0.97 (B:218), answer status verified-twice

**Enunț:** $X$ are $E[X]=1$ și $\mathrm{Var}(X)=1$. Calculați: i. $E[3X]$; ii. $\mathrm{Var}(3X)$; iii. $\mathrm{Var}(X+3)$.

**Fields:** `i` num `3`; `ii` num `9`; `iii` num `1`.

**Hints:** 1) Media e liniară. 2) $\mathrm{Var}(aX)=a^2\mathrm{Var}(X)$. 3) $\mathrm{Var}(X+a)=\mathrm{Var}(X)$.

**Worked solution:** $E[3X]=3\cdot1=3$; $\mathrm{Var}(3X)=3^2\cdot1=9$; $\mathrm{Var}(X+3)=1$ (shifting does not change the spread). Culegerea nu dă răspunsul; verificat de două ori.

**Detectors:** `ii` = `3` → "Varianța nu e liniară: factorul e $a^2=9$." `iii` = `4` → "O constantă adăugată mută toate valorile la fel, deci împrăștierea rămâne 1." `iii` = `10` → "Ai combinat cu $a^2$: aici nu se înmulțește nimic, se adaugă o constantă."

### L4.e10: ex. 0.98 (B:219), answer status ruled (one-line identity; proof)

**Enunț:** Pentru un eveniment $A$, fie $X=1$ dacă $A$ are loc și $0$ în caz contrar (variabila indicator a lui $A$). Arătați că $E[X]=P(A)$.

**Proof screen.** 1. "Care sunt valorile și probabilitățile lui $X$?" ✓ $X=1$ cu probabilitatea $P(A)$, $X=0$ cu $P(\bar A)$. 2. $E[X]=1\cdot P(A)+0\cdot P(\bar A)=P(A)$. ∎

**Fields:** `e` frac "pentru $P(A)=0{,}3$: $E[X]$" `3/10` (`[construit]`).

**Status note:** answer status "ruled": the book gives no answer; the content map gives the one-line proof above.

## L4 visual spec: `ml-viz-pmf-cdf` (pmf bars, mean marked, then the c.d.f. staircase)

- **Data:** configuration 1: $X$ on $\{-1,0,1,2\}$ with $\frac16,\frac16,\frac16,\frac12$. Configuration 2 (appears once, for "mean not a value"): $R$ on $\{0,1,2,3\}$ with $\frac18,\frac38,\frac38,\frac18$.
- **Steps:** (1) pmf bars with heights; the learner predicts the balance point (mean), 1; a triangle marker appears at 1. (2) show the deviations $X-1$ under each bar and their squares; the learner predicts the variance (4/3); a bracket of width $\sigma\approx1{,}15$ is drawn around the mean. (3) configuration 2: predict whether the mean 1,5 is a possible value (it is not); marker between the bars. (4) toggle "c.d.f.": the same variable as a staircase, the learner predicts $F(1)$ (1/2 for configuration 1).
- **Learner predicts:** mean, variance, $F(1)$.
- **Reduced motion:** markers appear in place; no sliding.

## L4 builder notes

- Sources: FND:8-10, 14; Cn-s2:2-5, 8-9; B:30-33 (0.9), B:36 (0.12), B:55-56 (0.23), B:56-64 (0.24-0.28), B:218-219 (0.97, 0.98); WYSK:2 (function composition; identify the distribution; sum of identically distributed variables).
- `[calculat]`/`[construit]` values: all recomputed (checked: $F$ values, $E[R]=3/2$, $E[X^2]=7/3$, $\mathrm{Var}=4/3$, quiz and exercise numerics).
- Uncertain: nothing numerical. The variance of the binomial through "sum of independent Bernoulli variables" is not taught here (it needs the variance of a sum, Lecția 5); L5 gives it as a one-line back-link to this lesson.
- Repetition check: Var is taught once (L4.s09) and proven once (L4.e2); the games of L4.s01 return only as the payoff in L4.s12.

---

# Lecția 5 (`ml-l05`): Distribuții comune, marginale, condiționate; independența variabilelor; covarianță

**Priority A.** **Concepts (3):** (1) distribuția comună, marginalele, distribuțiile condiționate; regula de înlănțuire pentru 3 variabile; (2) independența variabilelor aleatoare (pe toate perechile de valori); (3) covarianța, coeficientul de corelație, $\mathrm{Var}(X+Y)$. **Prerequisites:** vezi Lecția 1 (probabilitate condiționată, înlănțuire); vezi Lecția 3 (independența evenimentelor); vezi Lecția 4 (variabile, medie, varianță, liniaritate).

**Does not teach:** conditional independence of variables (L6).

## L5 screens: opening question

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

## L5 screens: worked example (Cn-s2:6-7, `[seminar]`; table read from the page image, p. 6)

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

## L5 screens: rules

**L5.s06** (definition)
> **Distribuția comună** a lui $X$ și $Y$: $p(x,y) = P(X{=}x, Y{=}y)$. **Marginalele:** $p_X(x) = \sum_y p(x,y)$ și $p_Y(y) = \sum_x p(x,y)$. **Distribuția condiționată:** $p_{X\mid Y}(x \mid y) = \dfrac{p(x,y)}{p_Y(y)}$ (pentru $p_Y(y)\neq0$).

Footnote: "Cursul: slide 15. Culegerea: p. 39." Builder: continuous version (integrals) exists in FND:15 and is out of scope.

**L5.s07** (definition)
> **Regula de înlănțuire pentru trei variabile:** $P(X,Y,Z)=P(Z)\,P(X\mid Z)\,P(Y\mid X,Z)$. Se aplică regula de înlănțuire pentru evenimente (vezi Lecția 1); ordinea factorilor poate fi oricare.

Footnote: "Culegerea: p. 37 (nota 21)."

**L5.s08** (definition + callout)
> **Independența variabilelor.** $X$ și $Y$ sunt independente dacă $p(x,y)=p_X(x)\,p_Y(y)$ **pentru toate** perechile $(x,y)$. (Echivalent, când $p_Y(y)\ne0$ pentru toți $y$: $p_{X\mid Y}(x\mid y)=p_X(x)$ pentru toți $x,y$.)
>
> **Atenție:** la evenimente e o singură egalitate; la variabile sunt câte egalități are tabelul. O celulă care verifică nu ajunge (ecranul de la început). Pentru variabile binare cu valori 0 și 1 se va vedea (ex. 0.11 și 0.99) că o egalitate, împreună cu marginalele, ajunge.

Footnote: "Cursul: slide 16. Seminar 2, p. 6-7. Culegerea: p. 33."

**L5.s09** (definition + list)
> **Covarianța:** $\mathrm{Cov}(X,Y)=E[(X-E[X])(Y-E[Y])]$; echivalent $\mathrm{Cov}(X,Y)=E[XY]-E[X]E[Y]$ (se dovedește în ex. 0.9.c). **Coeficientul de corelație:** $\rho(X,Y)=\dfrac{\mathrm{Cov}(X,Y)}{\sigma_X\sigma_Y}$, cu $-1\le\rho\le1$ (ex. 0.19). O covarianță mare indică o dependență aproximativ liniară, $X\approx aY+b$.
>
> **Varianța unei sume:** $\mathrm{Var}(X+Y)=\mathrm{Var}(X)+\mathrm{Var}(Y)+2\,\mathrm{Cov}(X,Y)$ (ex. 0.23.c); în general $\mathrm{Var}(aX+bY+c)=a^2\mathrm{Var}(X)+b^2\mathrm{Var}(Y)+2ab\,\mathrm{Cov}(X,Y)$; $\mathrm{Cov}(aX,bY)=ab\,\mathrm{Cov}(X,Y)$.
>
> **Dacă $X$ și $Y$ sunt independente:** $E[XY]=E[X]E[Y]$ (deci $\mathrm{Cov}=0$) și $\mathrm{Var}(X+Y)=\mathrm{Var}(X)+\mathrm{Var}(Y)$ (ex. 0.10). **Reciproca este falsă:** $\mathrm{Cov}=0$ nu implică independența (ex. 0.11).

Footnote: "Cursul: slide 9, 14, 17. Seminar 2, p. 6-7. Culegerea: p. 31, 45."

**L5.s10** (callout, one line back to L4)
> Aceasta explică varianța binomialei din Lecția 4: suma a $n$ variabile Bernoulli($p$) independente, fiecare cu varianța $p(1-p)$, are varianța $np(1-p)$.

Builder: this is the book's remark in ex. 0.25 (B:59), kept as a one-line consequence, not a re-derivation.

## L5 screen: why

**L5.s11** (reflect)
> $X$ ia valorile $-1, 0, 1$, fiecare cu probabilitatea $\frac13$, iar $Y=X^2$. $Y$ este complet determinată de $X$. Totuși $\mathrm{Cov}(X,Y)=0$. **De ce?**

Answer: $E[X]=0$ and $E[XY]=E[X^3]=\frac13(-1+0+1)=0$, so $\mathrm{Cov}=E[XY]-E[X]E[Y]=0$. The values $-1$ and $1$ give the same $Y=1$ but opposite signs of $X$, and their contributions to $E[XY]$ cancel. Covariance measures only a **linear** trend (a line $Y\approx aX+b$); here the dependence is a parabola. `[construit]` (`seminar-and-errors` B3 item 6, derived).

## L5 screens: retrieve (4 items; new numbers)

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

## L5 exercises

### L5.e1: ex. 0.9.c (B:31, 33), `[caiet]`, answer status book (proof)

**Enunț:** Arătați $\mathrm{Cov}(X,Y)=E[XY]-E[X]E[Y]$. Consecință: $\mathrm{Cov}(aX,bY)=ab\,\mathrm{Cov}(X,Y)$.

**Proof screens.** 1. "Ce desfacem?" ✓ $(X-E[X])(Y-E[Y])=XY-X\,E[Y]-E[X]\,Y+E[X]E[Y]$. ✗[desfacere cu semn greșit] $XY+X\,E[Y]+E[X]\,Y+E[X]E[Y]$: sign errors. 2. Take $E[\cdot]$ with linearity ($E[Y]$ and $E[X]$ are constants): $E[XY]-E[X]E[Y]-E[X]E[Y]+E[X]E[Y]$. 3. The last three terms give $-E[X]E[Y]$. ∎ Consequence: $E[aX\cdot bY]-E[aX]E[bY]=ab(E[XY]-E[X]E[Y])$.

**Fields (`[construit]`):** `c` num "$E[X]=2$, $E[Y]=3$, $E[XY]=7$: $\mathrm{Cov}(X,Y)$" `1`; `c2` num "$\mathrm{Cov}(2X,5Y)$" `10`.

**Detector:** `c` = `7` → "Ai dat $E[XY]$; scade $E[X]E[Y]=6$."

### L5.e2: ex. 0.10 (B:33-34), `[caiet]`, answer status book (proof; `PS:4`)

**Enunț:** Arătați că dacă $X$ și $Y$ sunt variabile independente, atunci $E[XY]=E[X]E[Y]$; echivalent, $\mathrm{Cov}(X,Y)=0$.

**Proof screens.** 1. $E[XY]=\sum_x\sum_y xy\,P(X{=}x,Y{=}y)$. 2. "Ce folosim?" ✓ independența: $P(X{=}x,Y{=}y)=P(X{=}x)P(Y{=}y)$ pentru toate perechile. ✗[doar o celulă] independența unei singure celule: ar da egalitatea doar pentru acel termen. 3. $=\sum_x xP(X{=}x)\cdot\sum_y yP(Y{=}y)$ (factorii separă sumele). 4. $=E[X]E[Y]$. ∎ Remark (book): the converse is false (ex. 0.11).

**Fields:** `e` num "$E[X]=2$, $E[Y]=3$, independente: $E[XY]$" `6`; `c` num "$\mathrm{Cov}(X,Y)$" `0` (`[construit]`).

### L5.e3: ex. 0.11 (B:34-36), `[caiet]`, answer status book

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

### L5.e4: ex. 0.13 (B:36-38), `[caiet]`, answer status book

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

### L5.e5: ex. 0.19 (B:45-46), `[caiet]`, answer status book (proofs; `PS:12-13`)

**Enunț:** Pentru $X, Y$ cu $\mathrm{Var}(X)\ne0$, $\mathrm{Var}(Y)\ne0$, $\rho(X,Y)=\mathrm{Cov}(X,Y)/(\sigma_X\sigma_Y)$. **a.** Arătați $-1\le\rho\le1$ (consecință: $\mathrm{Cov}\in[-\sigma_X\sigma_Y,+\sigma_X\sigma_Y]$). **b.** Arătați că dacă $\rho=1$ atunci $Y=aX+b$ cu $a=\sigma_Y/\sigma_X>0$, iar dacă $\rho=-1$ atunci $Y=aX+b$ cu $a=-\sigma_Y/\sigma_X<0$. Indicații: dezvoltă $\mathrm{Var}\left(\frac X{\sigma_X}+\frac Y{\sigma_Y}\right)$ și $\mathrm{Var}\left(\frac X{\sigma_X}-\frac Y{\sigma_Y}\right)$ cu $\mathrm{Var}(X+Y)=\mathrm{Var}X+\mathrm{Var}Y+2\mathrm{Cov}$ și $\mathrm{Cov}(aX,bY)=ab\,\mathrm{Cov}$; $\mathrm{Var}(X)=0$ dacă și numai dacă $X$ este constantă.

**Proof screens.** (a) 1. $\mathrm{Var}\left(\frac X{\sigma_X}+\frac Y{\sigma_Y}\right)=\frac{\mathrm{Var}X}{\sigma_X^2}+\frac{\mathrm{Var}Y}{\sigma_Y^2}+2\frac{\mathrm{Cov}(X,Y)}{\sigma_X\sigma_Y}$. Prediction: "Cât dau primii doi termeni?" ✓ $1+1$. ✗[σ în loc de σ²] $\frac1{\sigma_X}+\frac1{\sigma_Y}$: the variance of $X/\sigma_X$ is $\mathrm{Var}X/\sigma_X^2=1$. 2. So the variance is $2+2\rho=2(1+\rho)$. 3. A variance is $\ge0$: $1+\rho\ge0$, $\rho\ge-1$. 4. Same with the minus sign: $2(1-\rho)\ge0$, $\rho\le1$.
(b) 1. If $\rho=-1$ then $\mathrm{Var}\left(\frac X{\sigma_X}+\frac Y{\sigma_Y}\right)=0$. 2. A variable with variance 0 is constant with probability 1: $\frac X{\sigma_X}+\frac Y{\sigma_Y}=a'$. 3. Solve for $Y$: $Y=a'\sigma_Y-\frac{\sigma_Y}{\sigma_X}X$, i.e. $Y=aX+b$ with $a=-\sigma_Y/\sigma_X<0$, $b=a'\sigma_Y$. 4. If $\rho=1$ use the minus combination: variance $2(1-\rho)=0$, so $\frac X{\sigma_X}-\frac Y{\sigma_Y}=a''$ and $Y=\frac{\sigma_Y}{\sigma_X}X-a''\sigma_Y$, $a>0$.

**Fields (`[construit]`):** `v1` num "dacă $\rho=-1$: $\mathrm{Var}\left(\frac X{\sigma_X}+\frac Y{\sigma_Y}\right)$" `0`; `v2` num "dacă $\rho=0{,}6$: $\mathrm{Var}\left(\frac X{\sigma_X}+\frac Y{\sigma_Y}\right)$" `3,2`; `s` num "$\sigma_X=1$, $\sigma_Y=5$, $\rho=-1$: panta $a$" `-5`.

**Hints:** 1) Împarte fiecare variabilă la propria abatere standard. 2) $\mathrm{Var}(X/\sigma_X)=1$. 3) Varianța nu poate fi negativă.

**Detectors:** `v2` = `1,6` → "Varianța este $2(1+\rho)=3{,}2$; $1+\rho=1{,}6$ este doar jumătate." `s` = `5` → "Pentru $\rho=-1$ panta este negativă: $a=-\sigma_Y/\sigma_X$."

**Builder:** footnote 24 (B:45): the coefficient $a$ is not $\rho$; $\rho$ measures the degree of linear dependence (this is the distractor of L5.q3).

### L5.e6: ex. 0.23.b, c, d (B:55-56), `[caiet]`, answer status book (week-2 Special)

**Enunț:** Adevărat sau fals pentru orice două variabile aleatoare $X, Y$: **b.** $E[X+Y]=E[X]+E[Y]$. **c.** $\mathrm{Var}[X+Y]=\mathrm{Var}[X]+\mathrm{Var}[Y]$. **d.** $E[XY]=E[X]\cdot E[Y]$.

**Fields:** `b` tf `adevărat`; `c` tf `fals`; `d` tf `fals`. Counterexample numerics (`[construit]`): $X$ Bernoulli(1/2), $Y=-X$: `c1` frac "$\mathrm{Var}[X+Y]$" `0`; `c2` frac "$\mathrm{Var}[X]+\mathrm{Var}[Y]$" `1/2`. $Y=X$, $X$ Bernoulli(1/2): `d1` frac "$E[XY]$" `1/2`; `d2` frac "$E[X]E[Y]$" `1/4`.

**Hints:** 1) (b): ex. 0.9.a din Lecția 4. 2) (c): ia $Y=-X$. 3) (d): ia $Y=X$ cu $X$ binară.

**Worked solution (book):** (b) true (0.9.a). (c) false: with $Y=-X$, $\mathrm{Var}[X+Y]=0$ but $\mathrm{Var}[X]+\mathrm{Var}[Y]=2\mathrm{Var}[X]\ne0$. In general (book derivation): $\mathrm{Var}[X+Y]=E[(X+Y)^2]-(E[X]+E[Y])^2=\left(E[X^2]-E[X]^2\right)+\left(E[Y^2]-E[Y]^2\right)+2\left(E[XY]-E[X]E[Y]\right)=\mathrm{Var}[X]+\mathrm{Var}[Y]+2\mathrm{Cov}[X,Y]$; equality holds when $\mathrm{Cov}=0$, e.g. independent variables (0.10). (d) false: it is equivalent to $\mathrm{Cov}=0$; with $Y=X$ binary and $P(X{=}1)=p$: $E[X^2]=p\ne p^2$ since $p(1-p)\ne0$.

**Proof screen (derivation in (c)).** Steps: 1. $E[(X+Y)^2]=E[X^2]+2E[XY]+E[Y^2]$. 2. $(E[X+Y])^2=(E[X]+E[Y])^2=E[X]^2+2E[X]E[Y]+E[Y]^2$ (linearity). 3. Subtract and regroup into three parenthesized differences. Prediction at step 3: "Ce se obține ca al treilea termen?" ✓ $2(E[XY]-E[X]E[Y])=2\mathrm{Cov}$. ✗[fără factorul 2] $\mathrm{Cov}$.

**Detectors:** `c` = `adevărat` → "Egalitatea cere $\mathrm{Cov}=0$; cu $Y=-X$ varianța sumei este 0, nu $2\mathrm{Var}X$." `d1` = `1/4` → "$E[X\cdot X]=E[X^2]=\frac12$ (X ia 0 sau 1, $X^2=X$); $\frac14$ este $E[X]E[Y]$."

### L5.e7: ex. 0.99 (B:219), answer status verified-twice

**Enunț:** Două variabile discrete $X, Y\in\{0,1\}$ cu distribuția comună $P(0,0)=\alpha$, $P(0,1)=\beta$, $P(1,0)=\gamma$, $P(1,1)=\delta$. **a.** Calculați $E[X]$ și $E[Y]$ în funcție de $\alpha,\beta,\gamma,\delta$. **b.** Găsiți condițiile necesare și suficiente pentru ca $X$ și $Y$ să fie independente.

**Fields:** `a1` choice $E[X]$: ✓ $\gamma+\delta$; ✗[linia greșită] $\beta+\delta$ (this is $E[Y]$); ✗[celula singură] $\delta$. `a2` choice $E[Y]$: ✓ $\beta+\delta$; ✗ $\gamma+\delta$. `b` choice: ✓ $\alpha\delta=\beta\gamma$; ✗[sumă în loc de produs] $\alpha+\delta=\beta+\gamma$; ✗[produs pe rânduri] $\alpha\beta=\gamma\delta$. `n` tf "pentru $\alpha=0{,}12$, $\beta=0{,}28$, $\gamma=0{,}18$, $\delta=0{,}42$: independente?" `da` (`[construit]`: $\alpha\delta=\beta\gamma=0{,}0504$).

**Hints:** 1) $E[X]=P(X{=}1)$ pentru o variabilă binară. 2) Independența cere patru egalități; scrie-o pe cea pentru celula $(1,1)$. 3) Folosește $\alpha+\beta+\gamma+\delta=1$.

**Worked solution:** (a) $E[X]=\gamma+\delta$, $E[Y]=\beta+\delta$. (b) Independence means $\alpha=(\alpha+\beta)(\alpha+\gamma)$, $\beta=(\alpha+\beta)(\beta+\delta)$, $\gamma=(\gamma+\delta)(\alpha+\gamma)$, $\delta=(\gamma+\delta)(\beta+\delta)$. For binary variables one of them suffices (L5.e3, part b): $\delta=(\gamma+\delta)(\beta+\delta)\iff\delta(1-\beta-\gamma-\delta)=\beta\gamma\iff\alpha\delta=\beta\gamma$ (since $\alpha=1-\beta-\gamma-\delta$). Culegerea nu dă răspunsul; verificat de două ori.

**Detector:** `a1` = `β+δ` → "Aceasta este $E[Y]$; $X=1$ înseamnă linia a doua, celulele $\gamma$ și $\delta$."

### L5.e8: ex. 0.100 (B:219), answer status verified-twice

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

## L5 visual spec: `ml-viz-joint-table` (joint table with marginals filling in and an independence check cell by cell)

- **Config A (opening question):** the 3×2 table of L5.s01, marginals shown, cells clickable to display the product. No auto-reveal; the learner clicks cells.
- **Config B (concrete):** the table 0,1 / 0,2 / 0,3 / 0,4 of L5.s02. **Steps:** (1) marginals empty; the learner predicts $P(X=0)$ (0,4); the column sum animates into the margin; the other three marginals follow after a prediction each. (2) conditional: the learner predicts $P(X{=}0\mid Y{=}1)$ (3/7); the row $Y=1$ is highlighted and renormalized to 1. (3) independence: for each cell the product of its marginals appears beside the real value; the learner predicts "verifică / nu verifică" for each (0,12 against 0,1, nu; ...). (4) expectation view: shade the cell $(1,1)$ as the only one with $XY\ne0$; predict $E[XY]$ (0,4); show $E[X]E[Y]=0{,}42$ and $\mathrm{Cov}=-0{,}02$. (5) "grupează după sumă": the cells with the same $X+Y$ merge (0,1 / 0,5 / 0,4) for L5.s05.
- **Learner predicts:** each marginal, the conditional, the verdict per cell, $E[XY]$, $\mathrm{Var}(X+Y)$.
- **Reduced motion:** sums and merges happen as instant state changes.
- **Reuse:** the same component, with a "condiționează pe $Z$" option, is used in Lecția 6 (its own data, L6 visual spec).

## L5 builder notes

- Sources: FND:9, 14-17; Cn-s2:6-7 (table read from `notes-s2.pdf` page 6 image: cells 0,1 / 0,2 / 0,3 / 0,4 by $X=0,Y=0$; $X=1,Y=0$; $X=0,Y=1$; $X=1,Y=1$); B:31, 33-36, 37-38 (0.13), 45-46 (0.19), 55-56 (0.23), 219 (0.99, 0.100); PS:4, 12-13; T16 (2), T20a 1.5, T21S 1 (joint table with unknowns, used by the mock test, not here).
- The Cn-s2 table does not coincide with 0.99, 0.100 or T16 (checked: $\alpha\delta=0{,}04\ne\beta\gamma=0{,}06$ for it), so the allocation's fallback "replace with a constructed table" was not needed.
- Uncertain: the claim "for binary {0,1} variables one equation (with marginals) suffices" is stated in L5.s08 as a forward promise to L5.e3 and L5.e7 (same lesson). 0.19's footnote 27: "Var(X)=0" means constant with probability 1.
- Repetition check: Var(X+Y) is derived once (L5.e6 c) and used in L5.e5 and the concrete; the formula is stated once (L5.s09).

---

# Lecția 6 (`ml-l06`): Independența condiționată a variabilelor aleatoare

**Priority B.** **Concepts (2):** (1) independența condiționată a variabilelor aleatoare (pe toate valorile $x,y,z$); nu decurge din independență și nici invers; (2) folosirea independenței condiționate: ce probabilități trebuie cunoscute și ce se poate însuma (marginalizare condiționată). **Prerequisites:** vezi Lecția 2 (Bayes); vezi Lecția 3 (independență condiționată pentru evenimente, ex. 0.92); vezi Lecția 5 (tabel comun, marginale, independența variabilelor).

## L6 screens: opening question

**L6.s01** (question, choice; data on the same screen; `[construit]`)
> $Z$ este un bit corect: 0 sau 1, la fel de probabile. $X$ și $Y$ sunt două copii zgomotoase ale lui $Z$: fiecare este egală cu $Z$ cu probabilitatea **0,8** și este inversată cu probabilitatea 0,2, **independent una de alta**, dacă știm $Z$. Nu știm $Z$. Aflăm că $X=1$. Probabilitatea ca $Y=1$ **crește, scade** sau **rămâne** 0,5?

Expected `crește` (exact value 0,68 on L6.s03). After: "Păstrează răspunsul."

## L6 screens: worked example (viz `ml-viz-joint-table`, config C, `[construit]`; all values recomputed with exact fractions)

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

## L6 screens: rules

**L6.s05** (definition)
> **Independența condiționată a variabilelor.** $X$ și $Y$ sunt independente condiționat de $Z$ ($X\perp Y\mid Z$) dacă pentru **toate** valorile $x, y, z$ (cu $P(Z{=}z)\ne0$):
> $$p(x,y\mid z)=p(x\mid z)\,p(y\mid z).$$
> Echivalent, când $p(y,z)\ne0$: $p(x\mid y,z)=p(x\mid z)$ (echivalența: exercițiul 0.92, Lecția 3).
>
> **Cum se verifică:** fiecare felie $Z=z$ separat, cu toate celulele ei (pentru variabile binare, 4 egalități pe felie, deci 8 în total; într-o felie binară una singură ajunge, împreună cu marginalele feliei, ca în Lecția 5).
>
> **Independența și independența condiționată nu se implică una pe alta.** Exemplul de mai sus: dependente, dar independente condiționat. Exercițiul 0.16: independente, dar nu independente condiționat.

Footnote: "Cursul: slide 16. Seminar 2, p. 7. Culegerea: p. 39, 42." Builder: decision 3 (this lesson owns the example).

**L6.s06** (learn)
> **Ce poți face cu ea.**
> - **Bayes cu două dovezi** $E_1, E_2$ date $H$ (vezi Lecția 2): $P(H\mid E_1,E_2)=\dfrac{P(E_1,E_2\mid H)\,P(H)}{P(E_1,E_2)}$. Ai nevoie de $P(E_1,E_2\mid H)$; dacă $E_1\perp E_2\mid H$ el este $P(E_1\mid H)\,P(E_2\mid H)$.
> - **Marginalizare condiționată:** $p(x\mid z)=\sum_y p(x,y\mid z)$. Se însumează pe variabila care nu interesează; **nu este nevoie de nicio independență** ca să faci asta.

Footnote: "Culegerea: p. 220."

## L6 screen: why

**L6.s07** (reflect)
> În exemplul cu cele două copii ale lui $Z$: de ce, odată ce știm $Z$, aflarea lui $X$ nu mai spune nimic despre $Y$, deși fără $Z$ le legam?

Answer: $X$ tells us something about $Y$ only because it tells us something about $Z$ (which both copy). Once $Z$ is known, that channel is closed: the only thing left in each copy is its own independent noise. The dependence between $X$ and $Y$ in the marginal table was all carried by $Z$. (Explanation of the constructed example; not a statement from the course.)

## L6 screens: retrieve (4 items; new numbers)

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

## L6 exercises

### L6.e1: ex. 0.15 (B:38-39), `[caiet]`, answer status book

**Enunț:** $A, B, C$ binare cu distribuția comună uniformă: $P(A,B,C)=\frac18$ pentru fiecare dintre cele opt rânduri. **a.** Este $A$ independentă condiționat de $B$ în raport cu $C$? **b.** Dacă da, faceți o schimbare în primele două rânduri ale tabelului pentru a obține o distribuție la care răspunsul devine nu (dacă nu, invers).

**Fields:** `a` tf `da`; `b1` frac "după schimbarea $P(0,0,0)=\frac14$, $P(0,0,1)=0$: $P(A{=}0\mid B{=}0,C{=}0)$" `2/3`; `b2` frac "$P(A{=}0\mid C{=}0)$" `3/5`; `b` tf "A⊥B|C după schimbare?" `nu`.

**Hints:** 1) Forma convenabilă: $P(A{=}a\mid B{=}b,C{=}c)=P(A{=}a\mid C{=}c)$, bună dacă $P(B{=}b,C{=}c)\ne0$. 2) Compară cele două probabilități pentru toate valorile $a, b, c$. 3) Cu toate rândurile $\frac18$, fiecare probabilitate condiționată este $\frac12$.

**Worked solution (book):** (a) da: pentru $(0,0,0)$: $P(A{=}0\mid B{=}0,C{=}0)=\frac{1/8}{2\cdot1/8}=\frac12$ and $P(A{=}0\mid C{=}0)=\frac{2/8}{4/8}=\frac12$; the same values in every other case. (b) One possible change (sum kept 1): first two rows $\frac14$ and $0$: $P(A{=}0\mid B{=}0,C{=}0)=\frac{1/4}{1/4+1/8}=\frac23$ and $P(A{=}0\mid C{=}0)=\frac{1/4+1/8}{1/4+1/8+1/8+1/8}=\frac35$; one case with unequal values is enough.

**Detectors:** `a` = `nu` → "Toate rândurile au aceeași probabilitate, deci $P(A{=}0\mid B{=}b,C{=}c)=\frac12=P(A{=}0\mid C{=}c)$ pentru toate $b, c$." `b` = `da` → "$\frac23\ne\frac35$: o singură nepotrivire ajunge pentru a respinge independența condiționată."

**Builder:** the book asks the learner to choose the change; the fixed change above is the book's example. The builder may also accept any pair $(u,v)$ with $u+v=\frac14$ for the first two rows and check $A\perp B\mid C$ with the script.

### L6.e2: ex. 0.16 (B:39-42), `[caiet]`, answer status book

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

### L6.e3: ex. 0.101 (B:219-220), `[slides]` PS:5-8, answer status verified-twice

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

### L6.e4: ex. 0.102 (B:220), answer status verified-twice (reasoned from Bayes)

**Enunț:** Variabilele $H, E_1, E_2$ (aici $P(H)$, $P(E_1\mid H)$, $P(E_2\mid H)$ înseamnă tabelele pentru toate valorile). Vrem $P(H\mid E_1,E_2)$. **a.** Fără informații de independență condiționată, care dintre seturile de numere sunt suficiente? (i) $P(E_1,E_2)$, $P(H)$, $P(E_1\mid H)$, $P(E_2\mid H)$; (ii) $P(E_1,E_2)$, $P(H)$, $P(E_1,E_2\mid H)$; (iii) $P(H)$, $P(E_1\mid H)$, $P(E_2\mid H)$. **b.** Presupunem $P(E_1\mid E_2,H)=P(E_1\mid H)$ pentru toate valorile (deci $E_1\perp E_2\mid H$). Care seturi sunt acum suficiente?

**Fields:** `ai` tf `nu`; `aii` tf `da`; `aiii` tf `nu`; `bi` tf `da`; `bii` tf `da`; `biii` tf `da`.

**Hints:** 1) Bayes: $P(H\mid E_1,E_2)=\dfrac{P(E_1,E_2\mid H)\,P(H)}{P(E_1,E_2)}$. 2) Ce are nevoie formula: $P(E_1,E_2\mid H)$, $P(H)$, $P(E_1,E_2)$. 3) (b) Cu independență condiționată $P(E_1,E_2\mid H)=P(E_1\mid H)P(E_2\mid H)$, iar $P(E_1,E_2)=\sum_hP(h)P(E_1\mid h)P(E_2\mid h)$ (probabilitatea totală).

**Worked solution:** (a) only (ii) has all three ingredients. (i) and (iii) lack $P(E_1,E_2\mid H)$; the pair of marginals $P(E_1\mid H)$, $P(E_2\mid H)$ does not determine it (the same situation as $X+Y$ and the marginals in Lecția 4); (iii) also lacks $P(E_1,E_2)$. (b) With $E_1\perp E_2\mid H$, $P(E_1,E_2\mid H)=P(E_1\mid H)P(E_2\mid H)$, so (i) works (its extra $P(E_1,E_2)$ is given), (ii) works, and (iii) works because $P(E_1,E_2)$ comes from the total probability formula. Culegerea nu dă răspunsul; verificat de două ori.

**Detector:** `aiii` = `da` → "Setul (iii) nu dă $P(E_1,E_2\mid H)$: din marginalele $P(E_1\mid H)$ și $P(E_2\mid H)$ nu se poate construi probabilitatea comună fără independență condiționată."

### L6.e5: ex. 0.103 (B:220), answer status verified-twice (proof)

**Enunț:** Arătați că dacă distribuția comună a lui $(X,Y)$ este independentă de $W$ în raport cu $Z$ (notație: $(X,Y)\perp W\mid Z$), atunci $X\perp W\mid Z$, și similar $Y\perp W\mid Z$.

**Proof screens.** 1. Ipoteza: $p(x,y,w\mid z)=p(x,y\mid z)\,p(w\mid z)$ pentru toate $x,y,w,z$. 2. "Ce însumăm ca să scăpăm de $Y$?" ✓ ambii membri după $y$. ✗[însumare după z] după $z$: condiția $Z$ trebuie să rămână. 3. Stânga: $\sum_y p(x,y,w\mid z)=p(x,w\mid z)$ (marginalizare condiționată, fără independență). 4. Dreapta: $\sum_y p(x,y\mid z)\,p(w\mid z)=p(x\mid z)\,p(w\mid z)$ ($p(w\mid z)$ nu depinde de $y$). 5. Deci $p(x,w\mid z)=p(x\mid z)p(w\mid z)$: $X\perp W\mid Z$. Pentru $Y$: însumare după $x$. ∎

**Fields:** `c` choice "Variabila după care se însumează pentru a obține $X\perp W\mid Z$" ✓ `y`; ✗ `z`; ✗ `w`.

**Status:** the book gives no answer; the proof is the sum over $y$ (content map). The converse is not asked (see builder notes).

## L6 visual spec: `ml-viz-joint-table` (same widget as Lecția 5, with the "condiționează pe $Z$" option)

- **Data (config C, `[construit]`):** the 8-cell table of L6.s02 (rows $(X,Y)$, columns $Z$): 0,32 / 0,02; 0,08 / 0,08; 0,08 / 0,08; 0,02 / 0,32.
- **Steps:** (1) cells appear one prediction at a time, each as $P(z)P(x\mid z)P(y\mid z)$ (the learner predicts 0,32 first, then the rest follow the pattern 0,5·0,8·0,2 and so on). (2) toggle "ascunde $Z$": the two columns add into four cells (0,34 / 0,16 / 0,16 / 0,34); the independence check of Lecția 5 fails (0,25 against 0,34); the learner predicts $P(Y{=}1\mid X{=}1)$ (0,68). (3) toggle "condiționează pe $Z=0$": the column is renormalized by $P(Z{=}0)=0{,}5$ into 0,64 / 0,16 / 0,16 / 0,04; the learner predicts, cell by cell, whether the product of the slice marginals (0,8·0,8; 0,8·0,2; ...) matches; all four match. (4) switch to $Z=1$ and repeat (prediction: also independent).
- **Explorer mode (optional, not graded):** the data of 0.16 and 0.101 can be loaded; for 0.16 the slice $Z=0$ fails at $(0,0)$; for 0.101 both slices pass.
- **Learner predicts:** the first cell, the marginal dependence, the slice verdict per cell and per $z$.
- **Reduced motion:** renormalization is shown as a before/after swap without animation.

## L6 builder notes

- Sources: FND:16, Cn-s2:7 (weak and hard definitions), B:38-42 (0.15, 0.16), B:219-220 (0.101-0.103), PS:5-8 (0.101 solved), T20a 1.5b, T20b 1.4, T21P items 11, 13 (past tests asking conditional independence from tables; their numbers are not reused).
- All `[construit]` values (the noisy-witness table, its slices, the quiz numbers) were recomputed with exact fractions: $P(Y{=}1\mid X{=}1)=17/25$, cells $8/25, 2/25, 1/50$.
- Uncertain: in 0.102 the notation $P(H)$ is read as the full table over all values of $H$ (the book's variables are not necessarily boolean); with that reading (iii) suffices in (b). The content-map remark that the converse of 0.103 is false is the reader's claim and has no numeric check; it is not used on any screen.
- Repetition check: the idea "dependent but conditionally independent" is shown once (L6.s02-s04) and used as data in 0.101; 0.16 is the opposite direction; the plain statement of both appears once in L6.s05.

---

# Appendix A. Coverage of the allocation (every owned exercise appears exactly once)

| Lecția | Exercise screens in this file |
|---|---|
| L1 | 0.1 (a, b, c) = L1.e1; 0.2 (a, b) = L1.e2; 0.3 = L1.e3; 0.14 = L1.e4; 0.8 (a-d, optional) = L1.e5 |
| L2 | 0.6 = L2.e1; 0.7 (optional) = L2.e2; 0.90 (a, b) = L2.e3; 0.93 = L2.e4; 0.94 = L2.e5; 0.95 = L2.e6; 0.96 (a-d) = L2.e7 |
| L3 | 0.4 (a, b) = L3.e1; 0.5 (a-c) = L3.e2; 0.89 (a, b) = L3.e3; 0.91 (a-c) = L3.e4; 0.92 = L3.e5 |
| L4 | 0.9.a = L4.e1; 0.9.b = L4.e2; 0.12 (a, b) = L4.e3; 0.23.a = L4.e4; 0.24 = L4.e5; 0.25 (a, b) = L4.e6; 0.27 (optional) = L4.e7; 0.28 (optional) = L4.e8; 0.97 = L4.e9; 0.98 = L4.e10 |
| L5 | 0.9.c = L5.e1; 0.10 = L5.e2; 0.11 (a, b) = L5.e3; 0.13 = L5.e4; 0.19 (a, b) = L5.e5; 0.23.b, c, d = L5.e6; 0.99 (a, b) = L5.e7; 0.100 = L5.e8 |
| L6 | 0.15 (a, b) = L6.e1; 0.16 (a, b) = L6.e2; 0.101 (a, b, c) = L6.e3; 0.102 (a, b) = L6.e4; 0.103 = L6.e5 |

Total: 40 exercise screens; the four allocation-optional ones are 0.7 (L2.e2), 0.8 (L1.e5), 0.27 (L4.e7) and 0.28 (L4.e8).

# Appendix B. Visual widgets

| Id | Lecția | Design list |
|---|---|---|
| `ml-viz-omega` | L1 | diagram of Ω with events and restriction to B |
| `ml-viz-freq-tree` | L2 | probability tree with natural frequencies (design viz 1) |
| `ml-viz-indep-2x2` | L3 | independence check on a 2×2 table of events |
| `ml-viz-pmf-cdf` | L4 | pmf / cdf bars with the mean marked |
| `ml-viz-joint-table` | L5, L6 | joint table, marginals, independence cell by cell (design viz 2); with "condiționează pe Z" in L6 |

# Appendix C. Problems found and open points for the lead

1. `allocation.json` has 0.8 in L1 as optional and 0.7 in L2 as optional; the book marks 0.7 and 0.8 with ◦ and 0.27, 0.28 in brackets; all four are kept as optional screens.
2. The "evidență" term is not in Ciortuz's material (only in `Companion.pdf`); not used (decision 2).
3. The Cn-s1:6 multiplication example (1/3, 1/10) and the two default assumptions (Cn-s1:4, 7, 8) are assigned here: the first to L1 (not in the allocation tables), the second to L3 (as allocated).
4. 0.102 depends on reading $P(H)$ etc. as full tables; the book's statement does not say the variables are boolean.
5. Book typos found in this range: none that changes a number. Two wording slips only: 0.24 says "banul" for the tails face; the 0.8 (c) solution writes "implies" where it means "is equivalent to". Neither needs a corrected-value note.
6. L4's binomial variance is derived directly (no variance-of-a-sum), to avoid a forward dependency on L5; L5 links back in one line.
7. The `proof-steps` shape in section 0 is a proposal: the design says to reuse existing blocks first; the builder decides between `mcq` + `equation` and a new block (design §8 requires registering any new block in `registry.js` and in `validate-course-json.mjs`).
8. Not checked by me against the page images: only pp. 3 and 6 of `notes-s2.pdf`, p. 3 of `notes-s1.pdf` and p. 37 of the book were read as images (these carry tables); everything else was read from the text mirror, which prints the overlines of $\bar A$ without the bar in places (this affects 0.6 and 0.8 in the mirror; I took the complements from the book's solutions and the content map).
9. Critic pass (2026-10-28, `outline-critique.md`): L1.q1, L3.q4 and L4.q2 replaced (they asked the same question as exercises 0.1.c, 0.91.b and 0.97 of the same lesson); L4.e2 lost its $\mathrm{Var}(-4X)$ field (0.97 again); L4.e6 numbers changed to $n=20$, $p=0{,}25$ (they were the numbers of quiz L4.q3); L3.s10 no longer answers 0.91.b; L4.s12 restates the games' data on its own screen.
