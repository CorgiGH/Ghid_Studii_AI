**What:** Content outline for ML lessons 18-22 (maximum likelihood estimation, MAP and ML hypotheses, Bayes Naiv and Bayes Comun, zero counts and add-one, Naive Bayes in practice) and the two tests (mock T1, T21P), exactly as allocated in `allocation.json` · **When:** 2026-10-28 · **Status:** active

# Outline: parameter estimation, Bayes classifiers and the two tests (L18-L22, mock T1, T21P)

## 0. How to read this file

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

### 0.1 Ownership ledger (no item in two lessons)

| Lesson | Teaches (once) | Data owned |
|---|---|---|
| L18 | likelihood as a function of the parameter, log-likelihood, MLE (Bernoulli, categorical, conditional from counts), proof 0.43.c | opening coin 1,0,1,1,1; Cn-s5:1 "Remember 2"; 0.42; 0.43 (a-e datasets) |
| L19 | Bayes for hypotheses (prior, verosimilitate, a posteriori), $h_{ML}$, $h_{MAP}$, equal priors, argmax vs max, MAP of a Bernoulli parameter with Beta(3,3), odds and log-odds, brute-force MAP and the Bayes optimal vote (name warning) | cancer ML6:7; 2.1, 2.2, 2.3, 2.4, 2.24, 2.25, 0.26, 0.43.f-i; coins pretest; Cn-s5:1 (max/argmax) |
| L20 | $v_{MAP}$ rule, Bayes Comun, Bayes Naiv (conditional independence, training = MLE per factor), unified view, free-parameter counts | P20 2 / R18 3A (seven rows x,y,z,U); 2.5, 2.6, 2.7, 2.27, 2.28, 2.29; mushrooms 4.2 (BS:88-93, link back to L11); six-row pretest |
| L21 | zero-factor problem, 0/0 posterior, add-one, m-estimate, absent-word factors | T21T2 7 (five rows); 2.8, 2.30, 2.31 |
| L22 | average error rate against the true P, two error sources, xor, duplicated attributes, New-Bayes | T20C 3 = 2.32 (worked example); 2.9, 2.11, 2.33, 2.35, 2.36, 2.42 |
| Tests | mock T1 (new numbers on every problem), T21P (as given) | own tables, none shared with L19-L22 |

### 0.2 Decisions I made (plumbing; Alex can veto; also see section 6)

1. **Mock T1 problem 1c** proves the total probability formula (T20a 1.2, the proof L2 teaches), not $P(A,B|C)=P(A|C)P(B|A,C)$ as the allocation text says: T21P item 1 is that exact proof, it is also the proof L1 teaches (0.14), and the learner would meet it a third time. Fallback if Alex wants the allocation text: the statement is in section 5.1 builder notes.
2. **Add-one is applied to the conditionals $P(a_i|v_j)$ only; the priors $P(v_j)$ stay relative frequencies** (the convention of the book: ex. 2.8 fixes the prior by hand, 2.30's add-one value 0.7586 uses count priors). Every add-one number is computed that way and the screen says so.
3. **"Bayes optimal" has two meanings and the lessons never use the bare phrase.** L19 calls the vote of ML6:9-10 "clasificatorul Bayes optimal prin vot" and warns; L20 uses "Bayes Comun (Optimal, Joint Bayes)" for the joint classifier (B:370-371).
4. **2.4 CVLOO of DT2 is shown as 1/5 with the book's tie rule** (a tie leaf is classified 0 because DT2 must stay a one-test tree), and the screen says the other reading would give 3/5 (answer status ruled).
5. **2.27.b (13 / 71)** is taught as a convention: free parameters, generalising the book's Bernoulli formulas; answer status ruled, labelled on screen.
6. **The Gibbs classifier (ML6:11) and MDL (ML6:25-28)** get one "nu se cere la test" screen in L19, nothing more (design section 3).
7. **Numbers in pretests and quiz items are new** (never the worked-example data); each is tagged `[construit]` and recomputed.

---

# Lecția 18 (`ml-l18`): Estimarea parametrilor: verosimilitate maximă (MLE)

**Priority B.** **Concepts (2):** (1) verosimilitatea unui set de date ca funcție de parametru; log-verosimilitatea; (2) estimarea în sensul verosimilității maxime (MLE): $\frac{n_1}{n_1+n_0}$, $\frac{n_i}{N}$, estimări condiționate din numărători; maximizarea prin derivată. **Prerequisites:** Lecția 4 (Bernoulli, variabile i.i.d.), Lecția 3 (evenimente independente: probabilitățile se înmulțesc); back-links only.

**Does not teach (owned elsewhere):** Bernoulli and binomial (L4); $\arg\max$ versus $\max$, MAP and the Beta(3,3) prior (L19); zero counts and add-one (L21; per the allocation note there is no zero-count preview here, so it is taught once); MLE as minimum KL, 0.149 (L24).

**Written by the critic pass (2026-10-28):** this lesson was missing from the four outline parts (it is `ml-l18` in `allocation.json`, owner of 0.42 and 0.43.a-e, and L19, L20, L24 and T21P item 8 link back to it).

## L18 screens: opening question

**L18.s01** (question, choice; data on the same screen; `[construit]`)
> O monedă (nu știm dacă e corectă) a fost aruncată de 5 ori: **1, 0, 1, 1, 1** (1 = stemă). Fie $\theta=P(\text{stemă})$. Care dintre valorile $\theta=0{,}5$, $\theta=0{,}8$, $\theta=1$ face **aceste date** cele mai probabile?

Choices `0,5` / `0,8` / `1`. Expected `0,8`. Typical wrong answers: `1` ("aproape numai steme") and `0,5` ("o monedă e corectă"). After the answer the screen only says: "Păstrează răspunsul; îl verifici pe ecranul următor." (Values for the builder: $L(0{,}5)=\frac1{32}=0{,}03125$, $L(0{,}8)=0{,}08192$, $L(1)=0$.)

## L18 screens: worked example (viz `ml-viz-likelihood`, then Cn-s5:1 "Remember 2")

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

## L18 screens: rules

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

## L18 screen: why

**L18.s12** (reflect)
> De ce lucrăm cu $\ell=\ln L$ și nu direct cu $L$, dacă maximul e în același loc?

Answer: $L$ este un produs de $n$ factori, fiecare cel mult 1. Pentru 100 de aruncări cu 60 de 1, $L(0{,}6)=0{,}6^{60}\cdot0{,}4^{40}\approx5{,}9\cdot10^{-30}$ (graficul din culegere, p. 98, are pe axa verticală valori de ordinul $10^{-30}$): un număr greu de manevrat. Iar derivata unui produs de $n$ factori are $n$ termeni. Logaritmul transformă produsul în sumă, $\ell=n_1\ln\theta+n_0\ln(1-\theta)$: numere obișnuite și o derivată scurtă. Fiindcă $\ln$ e strict crescătoare, maximul rămâne în același punct.

## L18 screens: retrieve (4 items; new data, never the opening coin or the four-row table again)

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

## L18 exercises (calculation exercises; each owned only here)

### L18.e1: ex. 0.42 (B:93-94), `[caiet]`, answer status book

**Enunț:** Avem două monede. Probabilitatea stemei este $\theta$ la prima monedă și $2\theta$ la a doua. Le aruncăm de mai multe ori, independent, și obținem: moneda 1: stemă; moneda 2: ban; moneda 2: ban; moneda 2: ban; moneda 2: stemă. **a.** Care este log-verosimilitatea acestor date în funcție de $\theta$? **b.** Cât este estimarea de verosimilitate maximă a lui $\theta$?

**Fields:** `a` choice: ✓ $\ell(\theta)=\ln2+2\ln\theta+3\ln(1-2\theta)$; ✗[aceeași monedă] $2\ln\theta+3\ln(1-\theta)$ (a doua monedă are stema cu $2\theta$, banul cu $1-2\theta$); ✗[logaritmul sumei] $\ln\big(\theta+3(1-2\theta)+2\theta\big)$ (probabilitatea datelor este un produs). `dom` choice "domeniul lui $\theta$": ✓ $(0,\frac12)$ (fiindcă $2\theta\le1$); ✗ $(0,1)$. `b` frac `1/5`.

**Hints:** 1) Verosimilitatea e produsul probabilităților celor cinci rezultate: stemă la moneda 1 ($\theta$), ban la moneda 2 ($1-2\theta$, de trei ori), stemă la moneda 2 ($2\theta$). 2) $L(\theta)=\theta(1-2\theta)^3\cdot2\theta=2\theta^2(1-2\theta)^3$, deci $\ell(\theta)=\ln2+2\ln\theta+3\ln(1-2\theta)$. 3) $\ell'(\theta)=\frac2\theta-\frac{6}{1-2\theta}=0\Leftrightarrow2(1-2\theta)=6\theta$.

**Worked solution (book, p. 93-94):** $L(\theta)=2\theta^2(1-2\theta)^3$; $\ell(\theta)=\ln2+2\ln\theta+3\ln(1-2\theta)$; $\ell'(\theta)=\frac2\theta-\frac6{1-2\theta}=0\Leftrightarrow2-10\theta=0\Leftrightarrow\hat\theta_{MLE}=\frac15\in(0,\frac12)$. It is the maximum: $\ell'>0$ on $(0,\frac15)$ and $\ell'<0$ on $(\frac15,\frac12)$.

**Detectors:** `b = 2/5` → "Ai folosit $\theta$ și pentru a doua monedă; ea are stema cu probabilitatea $2\theta$ și banul cu $1-2\theta$." `b = 2/7` → "Derivata lui $3\ln(1-2\theta)$ este $\frac{-6}{1-2\theta}$: ai uitat factorul 2 din interior." `b = 1/2` → "La $\theta=\frac12$ a doua monedă ar da mereu stemă ($2\theta=1$), dar datele au trei de ban: $L(\frac12)=0$."

### L18.e2: ex. 0.43 a-e (B:94-99), `[caiet]`, answer status book (parts f-i, the MAP, are Lecția 19)

**Enunț:** $X_1,\dots,X_n$ sunt i.i.d. Bernoulli($\theta$): $P(X_i{=}1)=\theta$, $P(X_i{=}0)=1-\theta$. **a.** Scrieți funcția de verosimilitate $L(\hat\theta)$. Depinde ea de ordinea în care apar datele? **b.** Pentru $n=10$, cu șase de 1 și patru de 0, desenați graficul lui $L$ (aici: în vizualizare) și citiți $\hat\theta_{MLE}$. **c.** Găsiți forma analitică a lui $\hat\theta_{MLE}$; concordă cu graficul? **d.** Trei grafice noi: $n=5$ (trei de 1, doi de 0); $n=100$ (60 de 1, 40 de 0); $n=10$ (cinci de 1, cinci de 0). **e.** Comparați funcțiile de verosimilitate și estimările MLE.

Builder: the book asks for a small program that draws the plots (B:95); here the plots are the viz `ml-viz-likelihood` (programming is a non-goal, design §3). Part (c) is the proof on L18.s08-s11; its solution text says "vezi demonstrația din ecranele de mai sus" and does not repeat it.

**Fields:** `a1` choice ✓ $\hat\theta^{\#\{X_i=1\}}(1-\hat\theta)^{\#\{X_i=0\}}$; ✗[coeficient binomial] $C_n^{n_1}\hat\theta^{n_1}(1-\hat\theta)^{n_0}$. `a2` tf "depinde de ordine?" `nu`. `b` num poziția maximului `0.6` (tol ±0.01). `c` choice ✓ $\frac{n_1}{n_1+n_0}$; ✗[raportul] $\frac{n_1}{n_0}$. `d1` num maximul pentru $n=5$ (3/2) `0.6`; `d2` num pentru $n=100$ (60/40) `0.6`; `d3` num pentru $n=10$ (5/5) `0.5`. `e1` num valoarea lui $L$ în punctul de maxim, $n=5$: `0.03456` (tol ±0.00001); `e2` num aceeași pentru $n=10$, 6/4: `0.001194` (tol ±0.000001); `e3` choice "când $n$ crește, cu aceeași proporție de 1": ✓ maximul rămâne la 0,6, vârful devine mai îngust, iar valoarea maximă scade (la $n=100$ e de ordinul $10^{-30}$); ✗[vârful se mută] "maximul se apropie de 0,5" (proporția de 1 rămâne 0,6); ✗[valoarea crește] "valoarea maximă crește, fiindcă avem mai multe date" (fiecare factor nou e cel mult 1, deci produsul scade).

**Hints:** 1) $P(X_i\mid\theta)=\theta^{X_i}(1-\theta)^{1-X_i}$; înmulțește pentru toți $i$. 2) Produsul depinde doar de câte 1 și câte 0 sunt: $\theta^{n_1}(1-\theta)^{n_0}$. 3) Maximul e la $\frac{n_1}{n}$ (ecranele s08-s11); valoarea în acel punct e $\left(\frac{n_1}n\right)^{n_1}\left(\frac{n_0}n\right)^{n_0}$.

**Worked solution (book, p. 97-99):** (a) $L(\hat\theta)=\hat\theta^{\#\{X_i=1\}}(1-\hat\theta)^{\#\{X_i=0\}}$: nu depinde de ordine. (b) graficul are maximul la 0,6. (c) $\hat\theta_{MLE}=\frac{n_1}{n_1+n_0}=\frac6{10}$ (vezi demonstrația din ecranele de mai sus). (d) maximele: 0,6; 0,6; 0,5. (e) pentru primele trei seturi MLE este 0,6, pentru ultimul 0,5; când $n$ crește cu aceeași proporție de 1, vârful funcției de verosimilitate se "adună" tot mai mult în jurul maximului, iar valorile maxime sunt tot mai mici (B:99). Values `[calculat]` from the formula: $L(0{,}6)=0{,}03456$ ($n=5$), $0{,}001194$ ($n=10$), $\approx5{,}9\cdot10^{-30}$ ($n=100$); $L(0{,}5)=0{,}000977$ ($n=10$, 5/5).

**Detectors:** `a2 = da` → "Produsul nu se schimbă dacă schimbi ordinea factorilor: contează doar câte 1 și câte 0 sunt." `d3 = 0.6` → "Al patrulea set are cinci de 1 și cinci de 0: maximul e la $\frac5{10}$." `e1 = 0.6` → "Câmpul cere valoarea lui $L$ în punctul de maxim, $0{,}6^3\cdot0{,}4^2$, nu punctul însuși." `c = n1/n0` → "$\frac{n_1}{n_0}$ e raportul dintre numărul de 1 și numărul de 0; estimarea e proporția 1-urilor, $\frac{n_1}{n_1+n_0}$."

## L18 visual spec: `ml-viz-likelihood` (curba verosimilității)

- **Data (selector):** (1) the opening coin 1, 0, 1, 1, 1 ($n_1=4$, $n_0=1$); (2)-(5) the four datasets of 0.43.b, d (6/4, 3/2, 60/40, 5/5).
- **Steps (manual advance, prediction first):** (1) dataset 1: three points $\theta=0{,}5$; $0{,}8$; $1$ on the axis; predict which gives the largest $L$; the three values appear; the full curve draws; the maximum is marked at 0,8. (2) toggle "$\ell=\ln L$": the curve changes shape, the marker of the maximum stays at 0,8; predict whether it moves (it does not). (3) "aria de sub curbă": the area $\frac1{30}$ is shown next to the number 1 ($L$ is not a density). (4) dataset selector for 0.43.b, d: predict the position of the maximum for each before the curve appears; the vertical axis is rescaled per dataset (values from $0{,}03456$ down to about $6\cdot10^{-30}$), with the value at the maximum printed.
- **Learner predicts:** the best of three $\theta$ values, whether the maximum moves under $\ln$, the argmax per dataset.
- **Reduced motion:** curves appear without drawing animation; no auto-advance.

## L18 builder notes

- Sources: FND:28, 30; B:93-99 (0.42, 0.43.a-e; the MAP parts f-i are L19.e6); Cn-s5:1 ("Remember 2"); DEM:1 (proof 3 = 0.43.c); `content-map.md` T4.
- Not in this lesson (by the allocation): the zero-count problem and add-one (L21; no preview here), MAP and Beta priors (L19), MLE as minimum KL (0.149, L24). The die 1,2,3,4,5,6,1,1,1,1 is T21P item 8 and is **not** used here (it stays in the test); L18.q1 uses a different die. The data 0,0,0,1,1,0 belong to L7's worked example and are not reused.
- Numbers: `[construit]` (opening coin, the integrals $\frac1{30}$ and $\frac1{12}$, quiz values) and the 0.43.e values are recomputed in `verify-outline/v_bayes.py` (section L18). The book prints $\frac15$ (0.42) and 0,6 / 0,5 (0.43).
- Repetition check: the opening coin is used for the question, the curve and the payoff only; Cn-s5:1 "Remember 2" is used once (L18.s04); the quiz uses new data; the derivation of 0.43.c appears once (s08-s11). L19.s13 refers back to its derivative and L19.s14 to its concavity argument; L20.s16 to the one-parameter case.

---

# Lecția 19 (`ml-l19`): Ipoteze ML și MAP; Bayes pentru ipoteze

**Priority A.** **Concepts (4):** (1) teorema lui Bayes pentru ipoteze: $P(h|D)$, prior, verosimilitate; (2) ipotezele $h_{ML}$ și $h_{MAP}$, egalitatea lor pentru priori egali, argmax față de max; (3) estimarea MAP a unui parametru cu prior Beta, log-odds; (4) MAP "brute-force" și clasificatorul Bayes optimal prin vot, cu avertisment de nume. **Prerequisites:** Lecțiile 2, 4, 11, 15, 18 (back-links only).

**Does not teach (owned elsewhere):** the Bayes formula and total probability (L2), Bernoulli and binomial (L4), ID3 and trees (L11), training error and CVLOO (L15), the MLE and the likelihood function (L18), Bayes Naiv and Bayes Comun (L20).

## L19 screens: opening question

**L19.s01** (question; two numeric choices on one screen)
> Un sac conține monede de două feluri: **corecte** (cap cu probabilitatea 1/2) și **măsluite** (cap cu probabilitatea 9/10). Scoți la întâmplare o monedă, o arunci o singură dată și pică **cap**.
>
> **a.** Dacă jumătate din monedele din sac sunt măsluite, ce fel de monedă crezi că ai scos?
> **b.** Dacă doar 1 din 10 monede din sac este măsluită?

Choices per part: `corectă` / `măsluită`. Expected: **a** `măsluită`, **b** `corectă`. `[construit]`: (a) $0{,}9\cdot0{,}5=0{,}45$ against $0{,}5\cdot0{,}5=0{,}25$, posterior of "măsluită" $9/14\approx0{,}64$; (b) $0{,}9\cdot0{,}1=0{,}09$ against $0{,}5\cdot0{,}9=0{,}45$, posterior of "măsluită" $1/6$. After the answer the screen only says: "Aceeași aruncare, aceeași monedă, altă concluzie. Păstrează întrebarea: răspunsul vine în lecție." No formula yet.

## L19 screens: worked example (ML6:7, cancer test)

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

## L19 screens: rules

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

## L19 screen: why

**L19.s19** (reflect)
> De ce $h_{ML}$ și $h_{MAP}$ ies diferite la testul pentru cancer, deși ambele pornesc de la același rezultat pozitiv?

Answer: $h_{ML}$ compară doar cât de bine explică fiecare ipoteză rezultatul pozitiv (0,98 față de 0,03: "cancer" explică mai bine). $h_{MAP}$ ține cont și de cât de frecventă este fiecare ipoteză (0,008 față de 0,992). O explicație perfectă pentru o ipoteză foarte rară poate pierde în fața unei explicații mediocre pentru o ipoteză foarte frecventă: produsele sunt 0,0078 și 0,0298. Când priorii sunt egali, frecvența nu mai diferențiază ipotezele, și cele două coincid.

## L19 screens: retrieve (4 items; new numbers, never the cancer test, the die or the coins again)

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

## L19 exercises (calculation exercises; each owned only here)

### L19.e1: ex. 2.1 (B:358-360), `[caiet]`, answer status book

**Enunț (pe ecran):** O anumită boală afectează în medie una din 500 de persoane. O analiză de sânge costă 100 de dolari de persoană; are **sensibilitate** 100% (orice bolnav are testul pozitiv) și **specificitate** 99% (un om care nu are boala are testul pozitiv cu probabilitatea de 1%). **a.** Se testează o persoană aleasă la întâmplare și rezultatul este pozitiv. Care este probabilitatea ca ea să aibă boala? **b.** Un al doilea test costă 10 000 de dolari și are sensibilitate și specificitate 100%. Toate persoanele pozitive la primul test fac și al doilea. Care este costul mediu al testării unui individ? **c.** La ce preț al celui de-al doilea test nu mai este nevoie de primul (adică devine mai ieftin să folosim doar testul al doilea)?

**Fields:** `a` frac `100/599` (≈0.1669, tol ±0.0005); `b` num `219.8` (p: `220`, tol ±0.5); `c` num `101.21` (tol ±0.01; book 101.2125).

**Hints:** 1) Notează $B$ = "are boala", $T_1$ = rezultatul primului test: $P(B)=1/500$, $P(T_1{=}+|B)=1$, $P(T_1{=}+|\bar B)=1/100$. La (a) aplici formula lui Bayes (Lecția 2). 2) Numitorul este $P(T_1{=}+)=1\cdot\frac1{500}+\frac1{100}\cdot\frac{499}{500}=\frac{599}{50000}$. La (b) costul este variabila $C$ cu valorile $c_1$ și $c_1+c_2$; $P(C=c_1+c_2)=P(T_1{=}+)$. 3) $E[C]=c_1+c_2\,P(T_1{=}+)$; la (c) rezolvă $c_n=100+c_n\cdot\frac{599}{50000}$.

**Worked solution (book):** (a) $P(B|T_1{=}+)=\dfrac{1\cdot\frac1{500}}{1\cdot\frac1{500}+\frac1{100}\cdot\frac{499}{500}}=\dfrac{100}{599}\approx0{,}1669$. Observație: $P(\bar B|T_1{=}+)=0{,}8331$; ca să stabilim ipoteza cea mai probabilă era suficient să comparăm cele două produse (sau $P(B|+)$ cu $1/2$): legătura cu MAP. (b) $E[C]=c_1P(T_1{=}-)+(c_1+c_2)P(T_1{=}+)=c_1+c_2P(T_1{=}+)=100+10000\cdot\frac{599}{50000}=219{,}8\approx220$ dolari. (c) $c_n\le100+c_n\cdot0{,}01198$ dă $c_n\approx101{,}2125$: la cel mult 101,21 dolari primul test nu mai e necesar.

**Detectors:** (a) `0.01` or `1/100` → "Aceasta este $P(T_1{=}+|\bar B)$, rata de fals pozitive. Întrebarea cere $P(B|T_1{=}+)$." `1/500` or `0.002` → "Acesta e priorul $P(B)$; după ce aflăm că testul e pozitiv probabilitatea se schimbă." `0.8331` → "Aceasta e $P(\bar B|T_1{=}+)$, cealaltă ipoteză. Cea cerută e $P(B|T_1{=}+)=0{,}1669$." `0.99` or `1` → "Sensibilitatea (100%) și specificitatea (99%) sunt probabilități condiționate de boală, nu probabilitatea bolii după un test pozitiv." (b) `10100` → "Doar persoanele cu primul test pozitiv fac al doilea; costul mediu cântărește $c_1+c_2$ cu $P(T_1{=}+)$." `200` → "Ai folosit $P(T_1{=}+|\bar B)=0{,}01$; probabilitatea unui test pozitiv este $P(T_1{=}+)=0{,}01198$ (formula probabilității totale)." `120` → "Ai folosit priorul $1/500$ în loc de $P(T_1{=}+)$." (c) `100` → "Aceasta este costul primului test; prețul $c_n$ apare în ambii membri ai ecuației $c_n=100+c_n\cdot0{,}01198$, care se rezolvă ca ecuație."

### L19.e2: ex. 2.2 (B:360-363), "Monty's haunted house", `[caiet]`, answer status book

**Enunț:** Ești blocat în fața unui perete cu trei uși, numerotate 1, 2, 3; ușa către exterior este una singură, celelalte două sunt păzite de câte un monstru. Alegi la întâmplare ușa 1 (probabilitatea a priori ca ea să fie ieșirea: 1/3). Fantoma deschide ușa 2 și arată un monstru. Ea a ales ușa după două principii: **P1.** deschide una dintre celelalte două uși, una în spatele căreia este un monstru; **P2.** dacă ambele uși între care alege au monstru, urmează una dintre variantele: **a.** o alege cu probabilitate 1/2; **b.** alege ușa 2 cu probabilitatea 1; **c.** alege ușa 3 cu probabilitatea 1. $O$ este ușa de ieșire, $G$ este ușa deschisă de fantomă. Pentru fiecare variantă calculați $P(O=1|G=2)$ și $P(O=3|G=2)$ și decideți ce ușă alegi.

**Fields (per variantă a, b, c):** `p1` frac $P(O{=}1|G{=}2)$; `p3` frac $P(O{=}3|G{=}2)$; `ch` choice `ușa 3` / `oricare` / `ușa 1`. Expected: **a** `1/3`, `2/3`, `ușa 3`; **b** `1/2`, `1/2`, `oricare`; **c** `0`, `1`, `ușa 3`.

**Hints:** 1) Folosește Bayes cu probabilitatea totală; priorii sunt egali, $P(O{=}i)=1/3$. Numitorul are trei termeni, dar $P(G{=}2|O{=}2)=0$ (principiul P1: fantoma nu deschide ușa cu ieșirea). 2) Completează tabelul $P(G|O)$: pentru $(G{=}2,O{=}1)$ valoarea este $1/2$ (a), $1$ (b), $0$ (c); pentru $(G{=}2,O{=}3)$ este $1$ în toate variantele. 3) $P(O{=}1|G{=}2)=\dfrac{P(G{=}2|O{=}1)\cdot\frac13}{P(G{=}2|O{=}1)\cdot\frac13+P(G{=}2|O{=}3)\cdot\frac13}$.

**Worked solution (book, p. 361-362):** tabelul $P(G|O)$ (coloane = variantele a, b, c): $(G{=}2,O{=}1)$: $\frac12,\,1,\,0$; $(G{=}3,O{=}1)$: $\frac12,\,0,\,1$; $(G{=}2,O{=}3)$: $1,1,1$; $(G{=}3,O{=}2)$: $1,1,1$; $(G{=}2,O{=}2)=0$, $(G{=}3,O{=}3)=0$. Varianta a: $P(O{=}1|G{=}2)=\dfrac{\frac12\cdot\frac13}{\frac12\cdot\frac13+1\cdot\frac13}=\dfrac13$, $P(O{=}3|G{=}2)=\dfrac23$: alegi ușa 3. Varianta b: $\dfrac{1\cdot\frac13}{1\cdot\frac13+1\cdot\frac13}=\dfrac12$: alegi oricare. Varianta c: $0$ și $1$: ușa 3 este sigur ieșirea. Observație (book): fiindcă priorii sunt egali, ajunge să compari $P(G{=}2|O{=}1)$ cu $P(G{=}2|O{=}3)$, adică primul și penultimul rând din tabel; pentru varianta a, $O=3$ este **ipoteza MAP**. Cu priori egali, ipoteza MAP coincide cu ipoteza ML (B:362, nota 423).

**Detectors:** (a) `1/2` for both → "Aici nu 'au rămas două uși deci 1/2': fantoma a ales ușa 2 după o regulă. Dacă ieșirea ar fi ușa 3, ea nu avea de ales (1); dacă ar fi ușa 1, avea de ales între 2 și 3 (1/2). Rezultatul deschiderii nu e la fel de probabil în cele două cazuri." `1/6` → "Ai uitat numitorul $P(G{=}2)$; fără el nu obții o probabilitate (cele două valori ar trebui să însumeze 1)." (b) `1/3`, `2/3` → "Aceasta e varianta a. În b fantoma alege ușa 2 cu probabilitatea 1 când ambele uși au monstru: probabilitatea observației e aceeași pentru $O=1$ și $O=3$."

### L19.e3: ex. 2.3 (B:363-365), Mickey și zarul măsluit, `[caiet]`, answer status book

**Enunț:** Mickey dă cu zarul de 10 ori și obține secvența **1, 3, 4, 2, 3, 3, 2, 5, 1, 6**. Se întreabă dacă zarul nu este măsluit (favorizează fața 3). Presupuneți că fiecare set de 100 de zaruri conține 5 zaruri măsluite, cu distribuția fețelor $(1,2,3,4,5,6)$: $P=[0{,}1;\,0{,}1;\,0{,}5;\,0{,}1;\,0{,}1;\,0{,}1]$. $D$ = cele 10 rezultate, $H=\{FD,LD\}$ (zar corect, zar măsluit). **a.** Calculați $P(D|h)P(h)$ pentru fiecare ipoteză. **b.** Care este $h_{MAP}$? **c.** Cât este log-odds $\ln\dfrac{P(LD|D)}{P(FD|D)}$? **d.** Cât este $P(FD|D)$? **e.** Ce ipoteză ar fi câștigat dacă priorii ar fi fost egali?

**Fields:** `a1` num $P(D|FD)P(FD)$ `1.571e-8` (tol 0.5% relativ); `a2` num $P(D|LD)P(LD)$ `6.25e-10` (tol 0.5% relativ); `b` choice `FD` / `LD`; `c` num `-3.2244` (tol ±0.001); `d` num `0.9617` (tol ±0.0005); `e` choice `FD` / `LD` expected `FD`; `e2` num "log-odds cu priori egali" `-0.2799` (tol ±0.002; with $\ln19=2.9444$ rounded you get $-0.2800$).

**Hints:** 1) Aruncările sunt independente: $P(D|h)=\prod_k P(x_k|h)$, fără coeficient multinomial (s-ar simplifica oricum). Priorii: $P(FD)=95/100$, $P(LD)=5/100$. 2) $P(D|FD)=(1/6)^{10}$; $P(D|LD)=(0{,}1)^7(0{,}5)^3$ (șapte fețe cu 0,1, trei de 3 cu 0,5). 3) Compară cu logaritmi: $\ln19-10\ln3=-8{,}0417$ față de $-7\ln5=-11{,}2661$; log-odds este diferența $-11{,}2661-(-8{,}0417)$.

**Worked solution (book, p. 363-365):** $P(D|FD)P(FD)=(1/6)^{10}\cdot\frac{95}{100}=1{,}571\cdot10^{-8}$; $P(D|LD)P(LD)=(1/10)^7(1/2)^3\cdot\frac5{100}=6{,}25\cdot10^{-10}$. Cartea simplifică factorul comun $\frac1{20\cdot2^{10}}$ și compară $\frac{19}{3^{10}}$ cu $\frac1{5^7}$; în logaritmi $-8{,}0417>-11{,}2661$, deci $h_{MAP}=FD$: zarul nu este măsluit. Log-odds $=-11{,}2661-(-8{,}0417)=-3{,}2244<0$ (pozitiv ar însemna că LD este mai plauzibilă). $P(D)=1{,}634\cdot10^{-8}$ (nota 424 a cărții), $P(FD|D)=0{,}9617$, $P(LD|D)=0{,}0383$. **Cu priori egali** $P(D|FD)=1{,}654\cdot10^{-8}$ față de $P(D|LD)=1{,}25\cdot10^{-8}$: tot FD câștigă, pe o diferență mică (log-odds $-0{,}2799$). Priorul $95/5$ lărgește diferența, dar nu este el care decide.

**Detectors:** `b = LD` → "Ai comparat doar $P(D|LD)$ cu $P(D|FD)$ privind cele trei 3-uri? Cu priorul 95/5 și cu verosimilitățile $1{,}65\cdot10^{-8}$ și $1{,}25\cdot10^{-8}$, FD câștigă. Zarul pare măsluit doar dacă ignori că 95% din zaruri sunt corecte." `c = 3.2244` → "Semnul e inversat: $\ln\frac{P(LD|D)}{P(FD|D)}$ este negativ când FD e mai plauzibilă." `a2 = 0.5^3*0.1^7` fără prior (`1.25e-8`) → "Aceasta este verosimilitatea $P(D|LD)$; produsul $P(D|LD)P(LD)$ mai înmulțește cu 5/100." `e = LD` → "Chiar cu priori egali, FD câștigă ($1{,}654\cdot10^{-8}>1{,}25\cdot10^{-8}$): în acest exercițiu priorul nu decide cazul."

**Builder:** P18 1A is the same method with face 2 favoured and `rolls 1,2,4,3,2,2,3,5,1,6` (three 2s): $P(\text{unfair}|D)=0{,}0383$ `[calculat]` (`verified-answers.md`, last row). It is a past-test problem, not an exercise of this lesson; do not add a screen for it. The mock problem 1 and the recap variants can generate "new face and new rolls" from this template.

### L19.e4: ex. 2.4 (B:365-368), arbori de decizie ML și MAP, answer status: **a ruled**, **b, c, d verified-twice** (cartea dă soluția la toate; ruled = convenția de la egalități)

**Enunț:** Date de antrenament într-un spațiu real unidimensional: 5 puncte cu atributul real $X$: **1,5; 2; 3; 3,5; 3,75**. Clasa 0 este $\{3;\,3{,}5\}$, clasa 1 este $\{1{,}5;\,2;\,3{,}75\}$. Testele au forma $X>t$. $DT^*$ = arborele cu număr minim de noduri care clasifică perfect datele; $DT_2$ = arborele cu un singur nod de test. Dacă două praguri dau același câștig de informație, se alege **cel mai din stânga**. **A.** **a.** Eroarea la antrenare și eroarea CVLOO pentru $DT_2$. **b.** La fel pentru $DT^*$. **B.** Un arbore cu etichete probabiliste are în fiecare frunză $P(Y{=}y)$ = fracția punctelor cu acea etichetă din frunză (fără niciun test: $P(Y{=}1)=3/5$; un test la 2,5: $P(Y{=}1)=1$ dacă $X\le2{,}5$ și $1/3$ altfel). **c.** Arborele ML, $T_{ML}=\arg\max_T P_T(D)$. **d.** Cu priorul $P(T)\propto(1/4)^{\text{splits}(T)^2}$, arborele MAP.

**Fields:**
- **a** (status ruled): `a1` num IG la $X>2.5$ `0.4200` (p: `0.419`, tol ±0.001), `a2` num IG la $X>3.625$ `0.171` (tol ±0.001), `a3` frac eroarea la antrenare a lui $DT_2$ `1/5`, `a4` frac CVLOO a lui $DT_2$ `1/5`.
- **b** `b1` frac antrenare $DT^*$ `0`, `b2` frac CVLOO $DT^*$ `2/5`, `b3` multi "punctele clasificate greșit la CVLOO" `{3.5, 3.75}`.
- **c** `c1` choice "numărul de teste al lui $T_{ML}$" `2`; `c2` num "$P_{T_{ML}}(D)$" `1`.
- **d** `d0` frac $P(T_0|D)$-proporțional (0 teste) `108/3125` (≈0.03456, tol ±0.0001); `d1` frac (1 test) `1/27` (≈0.03704); `d2` frac (2 teste) `1/256` (≈0.00391); `d3` choice arborele MAP `1 test` (la 2,5, cu $P(Y{=}1)=1$ și $1/3$).

**Hints:** 1) Câștigul se calculează cu $H(Y)=H(3/5)$ și entropiile condiționate ale celor două părți (Lecția 8). Pragurile se pun la mijlocul dintre valori vecine de clase diferite. 2) CVLOO: scoți pe rând un punct, rulezi $DT_2$ pe celelalte patru, clasifici punctul scos. La (d) fiecare **punct** contribuie cu un factor $P(Y{=}y_i|X{=}x_i,T)$; priorul $(1/4)^{\text{splits}^2}$ are exponentul pătratul numărului de teste. 3) 0 teste: $(3/5)^3(2/5)^2\cdot(1/4)^0$; 1 test (la 2,5): $1^2\cdot\frac13\cdot(\frac23)^2\cdot\frac14$; 2 teste: $1\cdot(1/4)^4$.

**Worked solution (book, p. 365-368):** (a) $IG(X>2{,}5)=0{,}419$ (valoare exactă $0{,}4200$) și $IG(X>3{,}625)=0{,}171$: $DT_2$ pune testul la 2,5; punctul 3,75 este clasificat greșit: eroarea la antrenare $1/5$. CVLOO: scoțând 1,5 sau 2, pragul rămâne la 2,5 sau 2,25, punctul e clasificat corect; scoțând 3 pragul devine 2,75 (IG $0{,}311$ față de $0{,}122$ pentru 3,625), iar frunza din dreapta are $[1{+},1{-}]$ **egalitate**; scoțând 3,5 pragul rămâne 2,5 cu frunza dreaptă $[1{+},1{-}]$; scoțând 3,75, punctul e greșit. **Convenția cărții:** la egalitate frunza se clasifică cu 0, fiindcă altfel $DT_2$ ar deveni o frunză singură, adică n-ar mai fi un arbore cu un test; deci doar 3,75 e greșit: CVLOO $=1/5$ (cu cealaltă alegere ar fi $3/5$). `ruled`: Culegerea fixează convenția. (b) $DT^*$ are testele $X>2{,}5$ apoi $X>3{,}625$ (la dreapta); eroarea la antrenare 0 (date consistente). CVLOO: 3,5 e greșit (al doilea test cade la 3,375) și 3,75 e greșit (un singur test, la 2,5); $2/5$. (c) $P_T(D)$ este maxim dacă arborele clasifică perfect datele (probabilitate 1 pentru fiecare punct): $T_{ML}$ este $DT^*$ cu etichete probabilistice în frunze, $P(Y{=}1)=1$ la $X\le2{,}5$, $0$ la $2{,}5<X\le3{,}625$, $1$ la $X>3{,}625$. (d) $P(T_j|D)\propto P(D|T_j)P(T_j)$: 0 teste $\frac{3^3\cdot2^2}{5^5}=\frac{108}{3125}=0{,}03456$; 1 test $1\cdot\frac13\cdot\frac49\cdot\frac14=\frac1{27}=0{,}0370$; 2 teste $1\cdot(1/4)^4=\frac1{256}=0{,}0039$. Maximul este la 1 test: $T_{MAP}$ este arborele cu un test la 2,5. **Corectură:** cartea tipărește $0{,}0336$ pentru 0 teste (p. 368 și BS:23); valoarea corectă este $108/3125=0{,}03456$. Concluzia nu se schimbă ($0{,}0370>0{,}0346$), dar marja e mică. $T_{ML}$ este cel mai complex arbore (se potrivește perfect datelor), $T_{MAP}$ cel mai simplu dintre cei buni: priorul penalizează complexitatea. Fără prior, MAP = ML.

**Detectors:** `d0 = 0.0336` → "Aceasta e valoarea tipărită în carte (p. 368), dar este o greșeală de calcul: $3^3\cdot2^2/5^5=108/3125=0{,}03456$." `d2 = 1/16` → "Priorul are exponentul $\text{splits}^2$: pentru 2 teste este $(1/4)^{2^2}=(1/4)^4$, nu $(1/4)^2$." `d3 = 2 teste` → "Arborele cu 2 teste are verosimilitatea cea mai mare (1), dar priorul îl penalizează cu $(1/4)^4$: produsul $1/256$ este cel mai mic. Aceasta este $T_{ML}$, nu $T_{MAP}$." `a4 = 3/5` → "Această valoare apare dacă frunza cu egalitate se clasifică cu 1; Culegerea (p. 366-367) o clasifică cu 0, altfel $DT_2$ n-ar mai avea niciun test." `c2 = 1/4` or any product per leaf → "Verosimilitatea are un factor pe **punct**, nu pe frunză: cinci factori egali cu 1."

### L19.e5: ex. 0.26 (B:59-61), Mickey cumpără un zar nou, `[caiet]`, answer status book

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

### L19.e6: ex. 0.43 f-i (B:94-99), estimarea MAP a lui Bernoulli cu prior Beta(3,3), `[caiet]`, answer status book (the parts a-e, the MLE, are Lecția 18)

**Enunț:** $X_1,\dots,X_n$ i.i.d. Bernoulli($\theta$), cu priorul $\text{Beta}(3,3)$, $p(\theta)=\dfrac{\theta^2(1-\theta)^2}{B(3,3)}$, $B(3,3)=\dfrac1{30}$. **f.** Pentru $n=10$, șase de 1 și patru de 0, cum arată graficul funcției $\hat\theta\mapsto L(\hat\theta)p(\hat\theta)$ și în ce punct își atinge maximul? **g.** Determinați forma analitică a lui $\hat\theta_{MAP}$. Concordă cu graficul? **h.** Comparați estimările MAP și MLE pentru aceleași date; explicați diferența. **i.** Ce se întâmplă cu relația dintre cele două estimări când $n\to\infty$, dacă raportul $\#\{X_i{=}1\}/\#\{X_i{=}0\}$ rămâne constant?

**Proof screens:** (g) is the five-step proof L19.s11-s15 above (this exercise does not repeat it; its solution text says "vezi demonstrația din ecranele de mai sus").

**Fields:** `f` num poziția maximului pe grafic (viz, learner reads or types) `0.571` (tol ±0.01); `g1` choice formula: ✓ $\frac{n_1+2}{n+4}$; ✗[prior doar la numărător] $\frac{n_1+2}{n}$; ✗[prior doar la numitor] $\frac{n_1}{n+4}$; ✗[MLE] $\frac{n_1}{n}$; `g2` frac valoarea pentru $(n_1,n_0)=(6,4)$ `4/7` (≈0.5714; `8/14` accepted); `h1` num $\hat\theta_{MLE}-\hat\theta_{MAP}$ `0.0286` (frac `1/35`, tol ±0.0005); `h2` choice "MAP este mai mic decât MLE pentru că..." ✓ priorul adaugă 2 observații de 1 și 2 de 0, trage spre 0,5; `i1` num $\hat\theta_{MAP}$ pentru $n=100$ (60 de 1, 40 de 0) `0.5962` (frac `31/52`; `[construit]`); `i2` num pentru $n=1000$ (600/400) `0.5996` (frac `301/502`; `[construit]`); `i3` num limita `0.6`.

**Hints:** 1) La (f) maximul funcției $L(\theta)p(\theta)=\theta^{8}(1-\theta)^{6}/B(3,3)$ este atins aproape de mijlocul intervalului, puțin sub 0,6. 2) $\hat\theta_{MAP}$ se citește ca MLE cu 4 observații în plus. 3) La (i) împarte numărătorul și numitorul cu $n$: $\dfrac{n_1/n+2/n}{1+4/n}\to n_1/n$.

**Worked solution (book, p. 99):** (g) $\hat\theta_{MAP}=\dfrac{n_1+2}{n_1+n_0+4}$ (ecranele L19.s11-s15); pentru date: $8/14\approx0{,}571$, în acord cu graficul. (h) MAP este identic cu MLE-ul calculat pe date la care s-au adăugat patru variabile aleatoare virtuale, două de 1 și două de 0; ele împing estimarea spre 0,5 ($8/14\approx0{,}571$), de aceea $\hat\theta_{MAP}<\hat\theta_{MLE}=6/10$. (i) $\hat\theta_{MAP}=\dfrac{n_1+2}{n+4}=\dfrac{n_1/n+2/n}{1+4/n}\to\dfrac{n_1}n=\hat\theta_{MLE}$: influența celor patru observații virtuale dispare; cele două estimări devin egale.

**Detectors:** `g1 = n_1/(n+4)` → "Priorul adaugă 2 observații de 1 și 2 de 0: se adaugă 2 și la numărător, 4 la numitor." `g2 = 3/7` → "$3/7=6/14$ n-are nimic de-a face cu 8/14: numărătorul este $n_1+2=8$." `g2 = 0.6` → "Aceasta este MLE; priorul o mută." `i3 = 0.5` → "Priorul influențează tot mai puțin pe măsură ce datele cresc; limita este raportul din date, $0{,}6$."

### L19.e7: ex. 2.24 (B:414), trei cutii, answer status verified-twice

**Enunț:** Trei cutii etichetate A, B, C; două sunt goale, una conține un premiu. Alegi la întâmplare cutia $X=A$. Înainte să o deschizi, observi că altcineva a deschis cutia $Y=B$ și e **goală**; ai dreptul să schimbi alegerea. Ți se spune cum a fost aleasă cutia $Y$, una dintre variantele: **a.** dacă $X$ conține premiul, $Y$ este aleasă cu probabilitate 1/2 una dintre cele două cutii goale diferite de $X$; dacă $X$ e goală, $Y$ este cealaltă cutie goală diferită de $X$. **b.** $Y$ este aleasă cu probabilitate 1/2 una dintre cele două cutii diferite de $X$ (poate avea premiul). **c.** $Y$ este aleasă cu probabilitate 1/2 una dintre cutiile **goale** (deci $Y=X$ este posibil). Pentru fiecare variantă decideți ce cutie alegi pentru a-ți maximiza șansele și justificați cu calculul.

**Fields (per variantă):** `pa` frac $P(\text{premiu în }A|\text{observație})$; `pc` frac $P(\text{premiu în }C|\text{observație})$; `ch` choice `C` / `oricare`. Expected: **a** `1/3`, `2/3`, `C`; **b** `1/2`, `1/2`, `oricare`; **c** `1/2`, `1/2`, `oricare`.

**Hints:** 1) Ipotezele sunt: premiul e în A, B sau C, fiecare cu priorul 1/3. Observația este "$Y=B$ și B e goală". 2) Verosimilitatea observației: dacă premiul e în B, observația e imposibilă (0). Pentru A și C calculează cât de probabil era să fie aleasă tocmai B în varianta dată. 3) Variantele a: A: 1/2, C: 1; b: A: 1/2, C: 1/2; c: A: 1/2 (cutiile goale sunt B și C), C: 1/2 (cutiile goale sunt A și B).

**Worked solution `[calculat]` (Culegerea nu dă răspunsul; verificat de două ori):** priorul $P(A)=P(B)=P(C)=1/3$. Verosimilitatea observației în fiecare ipoteză: **a** $A:\frac12$, $B:0$, $C:1$ (dacă $X=A$ e goală, $Y$ trebuie să fie cealaltă cutie goală, B); **b** $A:\frac12$, $B:0$, $C:\frac12$; **c** $A:\frac12$, $B:0$, $C:\frac12$. A posteriori: a $\frac{\frac12\cdot\frac13}{\frac12\cdot\frac13+1\cdot\frac13}=\frac13$ pentru A și $\frac23$ pentru C: alegi C (MAP). b și c: $\frac12$ și $\frac12$: cutiile sunt la fel de bune. Observație: în (a) schimbarea dublează șansa (ca la ușile fantomei, 2.2.a).

**Detectors:** (a) `1/2`, `1/2` → "Dacă X e goală, Y nu are de ales (probabilitate 1); dacă X are premiul, Y alege între B și C (1/2). Observația "Y=B" e deci de două ori mai probabilă dacă premiul e în C." (b) `1/3`, `2/3` → "Aceasta e varianta a; la b alegerea lui Y nu ține cont de unde e premiul, deci observația nu face diferență între A și C."

### L19.e8 (optional): ex. 2.25 (B:414-415), trei deținuți, answer status verified-twice

**Enunț:** Trei deținuți $a$, $b$, $c$ sunt condamnați la moarte; guvernatorul îl grațiază pe unul, ales uniform. Deținutul $a$ îl roagă pe gardian să-i spună care dintre $b$ sau $c$ va fi executat; gardianul răspunde (fără să mintă, fără să-i spună soarta lui $a$; dacă are de ales între mai multe răspunsuri, alege uniform) că **$b$ va fi executat**. $X$ = deținutul grațiat, $Y$ = deținutul despre care spune gardianul că va muri. **a.** Priorii $P(X{=}\cdot)$; tabelul $P(Y|X)$; calculați $P(X{=}a|Y{=}b)$; a crescut probabilitatea ca $a$ să supraviețuiască? **b.** $a$ îi spune lui $c$ ce a aflat. Calculați $P(X{=}c|Y{=}b)$ și spuneți care dintre $P(X{=}a|Y{=}b)$, $P(X{=}b|Y{=}b)$, $P(X{=}c|Y{=}b)$ e cea mai mare.

**Fields:** `a1` frac $P(Y{=}b|X{=}a)$ `1/2`; `a2` frac $P(Y{=}b|X{=}b)$ `0`; `a3` frac $P(Y{=}b|X{=}c)$ `1`; `a4` frac $P(X{=}a|Y{=}b)$ `1/3`; `a5` tf "a crescut șansa lui $a$?" `nu`; `b1` frac $P(X{=}c|Y{=}b)$ `2/3`; `b2` choice cea mai mare `X=c`.

**Hints:** 1) Dacă a e grațiat, gardianul alege uniform între b și c. Dacă c e grațiat, singurul răspuns posibil este b. 2) $P(X{=}a|Y{=}b)=\dfrac{\frac12\cdot\frac13}{\frac12\cdot\frac13+0+1\cdot\frac13}$. 3) $P(X{=}b|Y{=}b)=0$: gardianul nu-l numește pe cel grațiat.

**Worked solution `[calculat]` (Culegerea nu dă răspunsul; verificat de două ori):** tabelul $P(Y|X)$: $X=a$: $Y=b$ $\frac12$, $Y=c$ $\frac12$; $X=b$: $Y=c$ $1$; $X=c$: $Y=b$ $1$. $P(X{=}a|Y{=}b)=\dfrac{\frac16}{\frac16+\frac13}=\dfrac13$ — egal cu priorul, deci șansa lui $a$ nu a crescut. $P(X{=}c|Y{=}b)=\dfrac{\frac13}{\frac12}=\frac23$: cea mai mare (ipoteza MAP). Aceeași metodă ca la fantoma din 2.2.

**Detectors:** `a4 = 1/2` → "'au rămas doi deținuți, a și c' nu dă 1/2: dacă c e grațiat, gardianul e obligat să spună b; dacă a e grațiat, avea de ales." `a5 = da` → "Probabilitatea posterioară $1/3$ este egală cu cea a priori: informația nu o schimbă pentru $a$, ci pentru $c$."

### L19.e9 (optional): ex. 2.26 (B:415), adevărat sau fals, answer status ruled

**Enunț:** Fie $D$ un set de date și $H$ o mulțime de ipoteze. Adevărat sau fals: "$\arg\max_{h\in H}P(D|h)$ este ipoteză de probabilitate maximă a posteriori, iar $\arg\max_{h\in H}P(h|D)$ este ipoteză de verosimilitate maximă."

**Field:** `tf` expected `fals`. **Hints:** 1) Care dintre $P(D|h)$ și $P(h|D)$ conține priorul? 2) Scrie definiția lui $h_{MAP}$ cu Bayes. 3) Definițiile sunt inversate.

**Worked solution (reasoned from B:362-364; the book gives no key; answer status ruled):** $h_{ML}=\arg\max P(D|h)$ (nu folosește priorul); $h_{MAP}=\arg\max P(h|D)=\arg\max P(D|h)P(h)$. Afirmația inversează cele două definiții: fals.

**Detector:** `adevărat` → "Verifică: care dintre cele două argmax depinde de priorul $P(h)$? Doar $\arg\max P(h|D)$. Aceea este MAP."

## L19 visual spec: `ml-viz-posterior` ("bare de posterior")

- **Data (selector with two datasets):** (1) **cancer** (ML6:7): hypotheses `cancer` (prior 0,008, $P(+|h)=0{,}98$) and `¬cancer` (prior 0,992, $P(+|h)=0{,}03$). (2) **zaruri** (ex. 2.3): `FD` (prior 0,95, $P(D|h)=1{,}654\cdot10^{-8}$) and `LD` (prior 0,05, $P(D|h)=1{,}25\cdot10^{-8}$), drawn on a log axis (values this small need it); the label under each bar shows the number.
- **Steps (manual advance, prediction first):** (1) prior bars; predict "care ipoteză e mai plauzibilă înainte de date?" (2) verosimilitate bars $P(D|h)$; predict "care explică mai bine datele?" (3) product bars $P(D|h)P(h)$ with the argmax highlighted; predict "ce ipoteză va fi $h_{MAP}$?" (4) normalised posterior bars $P(h|D)$ and the numbers (21%/79% for cancer; 0,0383/0,9617 for dice). A toggle "priori egali" resets the priors to 1/2 and shows the products again: for cancer $h_{MAP}$ flips to `cancer` (= $h_{ML}$); for dice nothing flips (FD still wins).
- **Learner predicts:** the most plausible hypothesis at step 1, the best explanation at step 2, $h_{MAP}$ at step 3, and, after toggling, whether the winner changes (cancer: yes; dice: no).
- **Reduced motion:** bars jump to their final heights; no auto-advance.

## L19 builder notes

- Sources: ML6:4-11, B:358-368, B:414-415, B:59-61, B:93-99, Cn-s5:1-2, BS:19-23, `verified-answers.md` (2.1-2.4, 2.24-2.26 rows), `exbook-ch2-3.md` sections 2, 3, 6.
- **Typo shown corrected:** 2.4: the book prints $P(T_0|D)\propto0{,}0336$ (B:368, BS:23); the value is $108/3125=0{,}03456$ (`verified-answers.md`). The IG $0{,}419$ in the book is $0{,}4200$ to four digits (immaterial; the field accepts both).
- **Conventions on screen:** 2.4.a CVLOO (1/5 vs 3/5, tie leaf → 0, B:366-367); 2.3 log-odds with exact priors-equal value $-0{,}2799$ (rounding $-0{,}2800$); 0.26 table values are truncated in the book (8,36 for 8,3653).
- **0.26 (c) and (d)** use the book's own formulas with an instance I chose (`[construit]`: $n=10$, $a=4$ or the threshold $a\ge7$); parts (e)-(g) are the book's table.
- **Uncertain:** the slide ML6:5 mislabels $P(D|h)$ as "a posteriori" (callout on L19.s06). The ML6:11 Gibbs claim and MDL are on one screen only.
- Repetition check: the cancer example is used for the worked example only; the quiz uses other data; 2.1 and 2.2 are Bayes exercises whose formula comes from L2 (back-link), not re-taught; the Beta(3,3) derivation is in the proof screens once (0.43.g's solution points to it).

---

# Lecția 20 (`ml-l20`): Bayes Naiv și Bayes Comun (Optimal); numărul de parametri

**Priority A.** **Concepts (4):** (1) regula $v_{MAP}=\arg\max P(a_1,\dots,a_n|v)P(v)$ pentru clasificare; (2) Bayes Comun (Optimal, Joint Bayes): estimarea lui $P(a_1,\dots,a_n,v)$; (3) Bayes Naiv: independența condiționată a atributelor față de ieșire, antrenarea = MLE pe fiecare factor; (4) numărul de parametri liberi: NB $2n+1$, Bayes Comun $2^{n+1}-1$. **Prerequisites:** Lecțiile 6, 18, 19 (back-links only).

**Does not teach (owned elsewhere):** conditional independence of variables (L6), the MLE and counts (L18), $h_{MAP}$ (L19), zero counts and add-one (L21), the error rate and duplicated attributes (L22).

## L20 screens: opening question

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

## L20 screens: worked example (P20 2 = R18 3A, the CMU 2003 midterm table)

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

## L20 screens: rules

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

## L20 screen: why

**L20.s18** (reflect)
> De ce, pe tabelul cu șapte exemple, Bayes Comun și-a sprijinit răspunsul pe un singur rând, iar Bayes Naiv pe toate cele șapte?

Answer: Bayes Comun estimează $P(x,y,z|U)$ numărând rândurile **identice** cu instanța; cu $n$ atribute există $2^n$ combinații, iar datele se împart între ele, deci fiecare combinație are puține rânduri (aici unul) sau niciunul. Bayes Naiv estimează fiecare factor $P(a_i|v_j)$ din toate rândurile clasei care au acea valoare a unui **singur** atribut, deci fiecare număr se sprijină pe multe rânduri. Prețul este presupunerea de independență condiționată: dacă nu se verifică, probabilitățile lui NB pot ieși greșite (ca la 2.7). Builder: an earlier draft asked here why the counts are $2n+1$ and $2^{n+1}-1$, which restated L20.s11; the counts are stated once.

## L20 screens: retrieve (4 items; new numbers)

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

## L20 exercises (calculation exercises; each owned only here)

### L20.e1: ex. 2.5 (B:368-370), `[caiet]`, answer status book

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

### L20.e2: ex. 2.6 (B:370-372), `[caiet]`, answer status book

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

### L20.e3: ex. 2.7 (B:372-376), `[caiet]`, answer status book

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

### L20.e4: ex. 2.27 (B:416), EnjoyTennis cu Bayes Naiv, answer status **ruled** (a: slide ML6:16; b: convenție; c: calcul lung)

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

### L20.e5: ex. 2.28 (B:416), `[calculat]` + `verified-answers.md`, answer status verified-twice

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

### L20.e6: ex. 2.29 (B:417), `[calculat]` + `verified-answers.md`, answer status verified-twice (pe baza identică cu P18 1B)

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

## L20 visual spec: `ml-viz-nb` (calculatorul Bayes Naiv; shared with L21 and L22, each lesson uses its own modes)

- **Data (selector):** default dataset P20 (seven rows, instance $(x{=}0,y{=}1,z{=}0)$); second dataset 2.7 (counts table, instance $(0,0)$). A slider for the parameter counter: $n=1..10$ binary attributes.
- **Steps (manual advance, prediction first), P20:** (1) "Bayes Comun": highlight the rows identical to the instance (row 6), counter 1 of 1 class U=1; predict the class. (2) NB: class priors appear as bars; predict $P(U{=}1)$. (3) for each class a column of three factor cells; clicking a cell shades the rows of the class it counts over; predict one factor. (4) the product per class with the arithmetic shown; predict which class is larger. (5) normalise: $8/35$ and $27/35$; predict the decision. (6) toggle "numai atributul x": both calculators show $1/2$.
- **Parameter counter:** a second panel with the slider; shows the two numbers $2n+1$ and $2^{n+1}-1$ side by side as bars (for $n=10$: 21 and 2047); predict the value for $n=5$ before it appears (11 and 63; $n=3$ is the prediction on L20.s11, $n=4$ is quiz L20.q2).
- **Learner predicts:** the matching row count, one factor, the larger product, the decision, the parameter counts for a given $n$.
- **Reduced motion:** no sliding; values appear in place; no auto-advance.

## L20 builder notes

- Sources: ML6:12-17, Cn-s5:1-4, BS:25-36 (2.7), BS:42-48 (2.6), BS:88-93, BS:98 (proof), B:354-356, B:368-376, B:416-417, DEM:1 (proof 5), P20 solution p. 6-7 (`tests/2020-2021-partial1/solutii.pdf`), `verified-answers.md` (2.5-2.7, 2.27-2.29, mushrooms), `exbook-ch2-3.md`.
- **Conventions to state on screen:** free parameters (L20.s11, 2.27.b, 2.29.a-b); the tie of scores in 2.5.b (probability 1/2 each).
- **Shown corrected:** none in this lesson (the stray "Notă" of 2.5 at B:370 is omitted, see L20.e1).
- **Declared reuse:** the 14-day table of 2.27 is the table owned by L16 (`allocation.json` `declared_reuse`); the 4.2 mushroom table of the proof screens is owned by L11. Both are shown compactly with a back-link and are not re-explained.
- **Uncertain:** the generalisation of parameter counts to categorical attributes is not in the book (convention, `ruled`). 2.27.c's LOO uses the value sets of the full data, which the readers and `verified-answers.md` agree on (6/14 with the same six days).
- Repetition check: P20's 7-row table is used only on L20.s02-s06; the pretest uses a different 6-row table; 2.7 and 2.29 are two different count tables; the parameter-count formulas are stated once (L20.s11) and the derivations live in the solutions of 2.7.e and 2.29.a-b only as table counts.

---

# Lecția 21 (`ml-l21`): Probabilități zero și regula add-one (Laplace)

**Priority B.** **Concepts (2):** (1) problema probabilităților zero: produs 0, scoruri toate 0, posterior $0/0$; (2) regula add-one a lui Laplace $\dfrac{\text{count}+1}{N+|Val(A)|}$ și estimarea $m$. **Prerequisites:** Lecția 20 (back-link only).

**Does not teach (owned elsewhere):** the NB rule, the factors and the parameter counts (L20); the error rate and duplicated attributes (L22).

## L21 screens: opening question

**L21.s01** (question; data on the same screen)
> Un filtru de spam cu Bayes Naiv a învățat din 10 emailuri spam. Niciunul dintre ele nu conține cuvântul `bonus`. Primești un email care conține `bonus` și, în plus, alte două cuvinte care apar des în emailurile spam. Ce **scor** primește clasa spam pentru acest email?

Choices `0` / `mic, dar pozitiv` / `mare`. Expected `0` `[construit]`. After the answer: "Scorul e un produs de factori. Un singur factor zero anulează tot produsul, oricât de mari ar fi ceilalți. De aici începe lecția."

## L21 screens: worked example (T21T2 7, handwritten solution `solutii.pdf:3-4`)

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

## L21 screens: rules

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

## L21 screen: why

**L21.s10** (reflect)
> De ce adunăm $|Val(A_i)|$ la numitor, nu doar 1 la numărător?

Answer: pentru fiecare valoare a lui $A_i$ adăugăm un exemplu virtual, deci numărul total de exemple crește cu $|Val(A_i)|$. Probabilitățile estimate pentru toate valorile trebuie să rămână cu suma 1: $\sum_a\frac{\#a+1}{N+k}=\frac{N+k}{N+k}=1$. Dacă adunăm 1 doar la numărător, suma devine $\frac{N+k}{N}>1$ (de exemplu $\frac52$ pentru $N=2$, $k=3$), adică nu mai sunt probabilități.

## L21 screens: retrieve (4 items; new numbers)

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

Builder: "all scores 0 ⇒ the probability is $0/0$" is the worked example (L21.s04) and exercise 2.31; it is not asked again. The pretest's 10 spam emails are not reused in q2.

## L21 exercises (calculation exercises; each owned only here)

### L21.e1: ex. 2.8 (B:376-378), spam cu add-one, `[caiet]`, answer status book

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

### L21.e2: ex. 2.30 (B:417), clasificare de texte, answer status **ruled** (convenția priorilor și a netezirii nu e în enunț)

**Enunț:** Firma Whizzco clasifică documente în clasele **sport** și **politică**. Fiecare document este un vector de prezență (1) / absență (0) pentru cuvintele-cheie: `goal, football, golf, defence, offence, wicket, office, strategy`. Datele de antrenament (fiecare rând = un document):

`xP` (politică, 6 documente): `[1 0 1 1 1 0 1 1]`, `[0 0 0 1 0 0 1 1]`, `[1 0 0 1 1 0 1 0]`, `[0 1 0 0 1 1 0 1]`, `[0 0 0 1 1 0 1 1]`, `[0 0 0 1 1 0 0 1]`.
`xS` (sport, 7 documente): `[1 1 0 0 0 0 0 0]`, `[0 0 1 0 0 0 0 0]`, `[1 1 0 1 0 0 0 0]`, `[1 1 0 1 0 0 0 1]`, `[1 1 0 1 1 0 0 0]`, `[0 0 0 1 0 1 0 0]`, `[1 1 1 1 1 0 1 0]`.

Cu Bayes Naiv, care este probabilitatea ca documentul $x=(1,0,0,1,1,1,1,0)$ să fie clasificat ca aparținând clasei **politică**?

**Convention screen (before the fields):** "Enunțul nu spune cum se iau priorii și dacă se folosește netezirea. Lucrăm cu **priorii din numărători** ($\frac6{13}$, $\frac7{13}$) și **fără netezire**, forma de bază a lui NB; apoi comparăm cu celelalte două lecturi."

**Fields:** `p1` frac $P(politică)$ `6/13`; `s_pol` num scorul politică `0.001374` (tol ±0.00001; exact $625/454896$); `s_sp` num scorul sport `0.000280` (tol ±0.000001; exact $3000/10706059$); `r0` num $P(politică|x)$ (priori din numărători, fără netezire) `0.8306` (tol ±0.0005); `r1` num cu add-one `0.7586` (tol ±0.0005); `r2` num cu priori egali, fără netezire `0.8512` (tol ±0.0005).

**Hints:** 1) Pentru fiecare cuvânt, factorul este probabilitatea valorii **din $x$**: pentru cuvintele prezente $P(\text{cuvânt}|\text{clasă})$, pentru cele absente $1-P(\text{cuvânt}|\text{clasă})$. 2) Politică: goal $\frac13$, football absent $\frac56$, golf absent $\frac56$, defence $\frac56$, offence $\frac56$, wicket $\frac16$, office $\frac23$, strategy absent $\frac16$. Sport: goal $\frac57$, football absent $\frac27$, golf absent $\frac57$, defence $\frac57$, offence $\frac27$, wicket $\frac17$, office $\frac17$, strategy absent $\frac67$. 3) $\text{score}=P(\text{clasă})\prod(\text{factori})$, apoi normalizezi.

**Worked solution `[calculat]` (Culegerea nu dă răspunsul; verificat de două ori; convenție `ruled`):** scorul politică $\frac6{13}\cdot\frac13\cdot\frac56\cdot\frac56\cdot\frac56\cdot\frac56\cdot\frac16\cdot\frac23\cdot\frac16=\frac{625}{454896}\approx1{,}374\cdot10^{-3}$, scorul sport $\approx2{,}80\cdot10^{-4}$; $P(politică|x)=\frac{4117715}{4957523}\approx0{,}8306$, documentul e clasificat **politică**. Cu **add-one** ($\frac{c+1}{n+2}$ pe cuvinte, priorii tot $\frac6{13},\frac7{13}$): $0{,}7586$. Cu **priori egali** și fără netezire: $0{,}8512$. Cuvintele absente se iau în calcul cu $1-P(\text{cuvânt}|\text{clasă})$; dacă ai lua doar cuvintele prezente ai obține $0{,}881$, o lectură greșită. Nu apare niciun factor zero la această instanță; dacă ar apărea, ex. 2.8 oferă remediul.

**Detectors:** `r0 = 0.881` → "Ai omis factorii cuvintelor **absente** (football, golf, strategy). Un cuvânt absent contribuie cu $1-P(\text{cuvânt}|\text{clasă})$." `r0 = 0.8512` → "Aceasta e valoarea cu priori egali ($\frac12,\frac12$); priorii din numărători sunt $\frac6{13}$ și $\frac7{13}$. Enunțul nu precizează; lectura de bază folosește numărătorile." `r0 = 0.7586` → "Aceea e cu add-one; fără netezire, factorii sunt frecvențe simple."

### L21.e3: ex. 2.31 (B:418), valori lipsă și remediul standard, `[calculat]`, answer status verified-twice

**Enunț:** Date de antrenament $(x,y)$ cu 7 atribute binare $A_1,\dots,A_7$ și date de test $z$:
$x_1=(0,0,0,1,0,0,1)$, $y_1=1$; $x_2=(0,0,1,1,0,0,0)$, $y_2=1$; $x_3=(1,1,0,0,0,1,0)$, $y_3=-1$; $x_4=(1,0,0,0,1,1,0)$, $y_4=-1$; $z_1=(1,0,0,0,0,1,0)$; $z_2=(0,1,1,0,0,1,1)$. **a.** Ce problemă va întâmpina Bayes Naiv pe aceste date? (Estimați toți parametrii și aplicați algoritmul pe cele două instanțe de test.) **b.** La curs am prezentat un remediu standard: spuneți cum se numește și aplicați-l; apoi clasificați $z_1$ și $z_2$.

**Fields:** `a1` choice cu estimările fără netezire problema apare la: `z2` (scoruri 0 și 0, deci $0/0$) / `z1` / `ambele` / `niciuna`; `a2` choice decizia pentru $z_1$ fără netezire `y=-1` (scoruri $\frac18$ și $0$); `b1` choice numele remediului `regula add-one a lui Laplace`; `b2` frac $P(A_1{=}1|y{=}1)$ cu add-one `1/4`; `b3` frac $P(A_4{=}1|y{=}1)$ cu add-one `3/4`; `b4` choice decizia pentru $z_1$ `y=-1`; `b5` frac $P(y{=}-1|z_1)$ `27/28` (≈0.9643); `b6` choice $z_2$ după add-one `egalitate (1/2 fiecare)`.

**Hints:** 1) Fiecare clasă are 2 exemple: $P(A_i{=}1|y)=\frac{\text{count}}2$ înainte de netezire: pentru $y=1$ obții $0,0,\frac12,1,0,0,\frac12$; pentru $y=-1$: $1,\frac12,0,0,\frac12,1,0$. 2) $z_2$ are $A_2=1$ (imposibil pentru $y=1$: $P(A_2{=}1|1)=0$) și $A_3=1$ (imposibil pentru $y=-1$). 3) Cu add-one $\frac{c+1}{2+2}$: $y=1$: $\frac14,\frac14,\frac12,\frac34,\frac14,\frac14,\frac12$; $y=-1$: $\frac34,\frac12,\frac14,\frac14,\frac12,\frac34,\frac14$; priorii $\frac12,\frac12$.

**Worked solution `[calculat]` (Culegerea nu dă răspunsul; verificat de două ori):** (a) Fără netezire: la $z_1$ scorul clasei $-1$ este $\frac12\cdot1\cdot\frac12\cdot1\cdot1\cdot\frac12\cdot1\cdot1=\frac18$ și al clasei $+1$ este $0$: $z_1\to-1$, fără probleme. La $z_2$ clasa $+1$ ia $0$ (din $P(A_2{=}1|{+}1)=0$) și clasa $-1$ ia $0$ (din $P(A_3{=}1|{-}1)=0$): $0/0$, nedefinit. **Problema:** valori de atribut care nu apar niciodată cu o clasă în datele de antrenament, deci un factor 0 anulează produsul. Problema se vede **doar** la $z_2$: cine testează doar $z_1$ nu observă nimic. (b) Remediul: regula add-one (Laplace), $\frac{c+1}{N_{clasă}+2}$ ($+2$ = numărul de valori ale unui atribut binar). După netezire: $z_1$: scorul clasei $-1$ este $\frac{243}{8192}$, al clasei $+1$ este $\frac9{8192}$: **$-1$**, cu $P(y{=}-1|z_1)=\frac{27}{28}\approx0{,}964$; $z_2$: ambele $\frac9{8192}$: **egalitate exactă** ($\frac12$ fiecare); un clasificator are nevoie de o regulă de egalitate.

**Detectors:** `a1 = z1` or `ambele` → "La $z_1$ scorul lui $-1$ este $\frac18>0$ și al lui $+1$ este 0; decizia e clară. Doar $z_2$ are toate scorurile 0." `b6 = y=1` or `y=-1` → "Cu add-one scorurile sunt egale ($\frac9{8192}$ ambele); decizia depinde de regula de egalitate, probabilitatea este $\frac12$." `b2 = 0` → "Fără netezire e $0$; cu add-one $\frac{0+1}{2+2}=\frac14$."

## L21 visual spec: `ml-viz-nb` with the add-one switch (same widget as L20)

- **Data:** the five rows of T21T2 7 (A with three values, B with two, Y with three), instance $(A{=}0,B{=}0)$; second dataset ex. 2.8 (spam, instance $(1,0,1)$).
- **Steps (manual advance, prediction first):** (1) the calculator with the add-one switch OFF: predict the score of each class (all 0). (2) the posterior row shows `0/0` in a warning style, with the text "nedefinit". (3) switch ON: the denominators show $N+|Val|$ next to each factor (with the value counts of A and B); predict $\hat P(A{=}0|Y{=}0)$. (4) the scores become positive; predict the decision; show the probabilities $\frac5{14},\frac37,\frac3{14}$. (5) a second panel: the sum of the three smoothed probabilities of $A$ given $Y{=}1$ ($\frac25+\frac25+\frac15=1$), and the numerator-only variant ($1+1+\frac12=\frac52$) turning red.
- **Learner predicts:** the scores with the switch off, one smoothed factor, the decision after smoothing.
- **Reduced motion:** the switch changes values in place, no sliding.

## L21 builder notes

- Sources: ML6:18, Cn-s5:5-6, B:355 (nota 416), B:376-378, B:417-418, T21T2 7 (`solutii.pdf:3-4`), `verified-answers.md` (2.8, 2.30, 2.31, T21T2 7), `exbook-ch2-3.md` sections 4.
- **Computed by me, not in a source:** L21.s05-s06 (add-one on the T21T2 7 table: decision $Y=1$, probability $\frac37$); the sum-to-1 check; the $m$-estimate example. Each is recomputed by `verify_bayes.py` (section L21).
- **Conventions on screen:** priors not smoothed (L21.s09); 2.30's three conventions (0.8306 / 0.7586 / 0.8512); the tie in 2.31.z2.
- **The m-estimate** appears on one screen only (ML6:18); the exam form is add-one (C-14).
- Repetition check: the five-row table is used on L21.s02-s06 only; 2.8 is the only spam example; "NB rule and factors" are not re-taught (back-link to L20).

---

# Lecția 22 (`ml-l22`): Bayes Naiv în practică: rata erorii, xor, atribute duplicate, New-Bayes

**Priority B.** **Concepts (4):** (1) rata medie a erorii calculată față de distribuția adevărată și cele două surse de eroare (P3); (2) Bayes Naiv pe xor, ID3 față de Bayes Naiv (P4, P5, P7); (3) atribute duplicate: acuratețea NB scade, Bayes Comun nu (P6); (4) clasificatorul între NB și Bayes Comun (New-Bayes): o singură pereche dependentă. **Prerequisites:** Lecțiile 1, 4, 6, 11, 20 (back-links only).

**Does not teach (owned elsewhere):** the NB rule, factors and parameter counts (L20); add-one (L21); expectation (L4); trees and ID3 (L11); conditional chain rule as a rule (L1).

## L22 screens: opening question

**L22.s01** (question; data on the same screen)
> Bayes Naiv a fost antrenat pe un număr **infinit** de exemple generate de distribuția: $P(Y{=}0)=0{,}6$, $P(Y{=}1)=0{,}4$; $P(X_1{=}0|Y{=}0)=0{,}8$, $P(X_1{=}0|Y{=}1)=0{,}3$ (deci $P(X_1{=}1|Y{=}0)=0{,}2$ și $P(X_1{=}1|Y{=}1)=0{,}7$). Care este **rata medie a erorii** lui, adică probabilitatea ca decizia lui să fie greșită pentru un exemplu nou generat de aceeași distribuție?

Numeric field, expected `0.24` (tol ±0.001) `[construit]`: joint cells $P(X_1,Y)$: $(0,0)=0{,}48$, $(0,1)=0{,}12$, $(1,0)=0{,}12$, $(1,1)=0{,}28$; NB decides $Y=0$ for $X_1=0$ and $Y=1$ for $X_1=1$; errors $0{,}12+0{,}12$. After the answer: "Cum ai calculat? Păstrează metoda: lecția spune ce probabilități însumezi și de ce."

## L22 screens: worked example (T20C 3 = ex. 2.32, Mitchell 2011 midterm; the exercise 2.32 itself is week 6 and not owned here)

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

## L22 screens: rules

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

## L22 screen: why

**L22.s17** (reflect)
> De ce un atribut duplicat poate strica Bayes Naiv, dar nu strică Bayes Comun?

Answer: Bayes Naiv înmulțește factorii presupunând că fiecare atribut aduce dovadă **nouă**. O copie a lui $X_1$ aduce aceeași dovadă încă o dată, deci argumentul lui $X_1$ cântărește de două ori și poate învinge priorul (în exemplu: $0{,}098$ față de $0{,}072$ în celula $(1,1)$). Bayes Comun nu înmulțește factori: citește probabilitatea instanței întregi din distribuția comună reală, în care copia nu schimbă nimic.

## L22 screens: retrieve (4 items; new numbers)

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

## L22 exercises (calculation exercises; each owned only here)

### L22.e1: ex. 2.11 (B:382-385), "Cât de naiv este Bayes Naiv?", `[caiet]`, answer status book

**Enunț:** $X_1,X_2$ sunt variabile Bernoulli(0,5) independente, iar $Y\in\{1,2\}$ este o funcție deterministă de $(X_1,X_2)$. **a.** Definiți $Y$ (tabelul $X_1\,X_2\,Y$) astfel încât Bayes Naiv să aibă rata medie a erorii **maximă**, 50%. Observați cum se corelează $X_1$ și $X_2$ când $Y$ e fixat. **b.** Cele $2^4=16$ funcții se reduc, prin simetria etichetelor, la 4 cazuri (cele patru tabele de mai jos); unul este cel de la (a). În celelalte trei arătați că NB are eroarea 0.

Cazurile (valorile lui $Y$ pe $(X_1,X_2)=(0,0),(0,1),(1,0),(1,1)$): **1** $(1,1,1,1)$; **2** $(1,1,1,2)$; **3** $(1,2,1,2)$ ($Y$ depinde doar de $X_2$); **4** $(1,2,2,1)$ (xor).

**Fields:** `a1` num scorul lui $Y{=}1$ în celula $(0,0)$ pentru xor `1/8` (frac); `a2` num scorul lui $Y{=}2$ `1/8`; `a3` num rata erorii pentru xor `0.5` (celule cu egalitate: NB alege la întâmplare, deci 50%); `b1` num eroarea cazului 1 `0`; `b2` num eroarea cazului 2 `0`; `b3` num eroarea cazului 3 `0`; `c` num câte din cele 16 funcții au eroarea 0 `14`; `c2` num câte au 50% `2`.

**Hints:** 1) Pentru xor, când $Y=1$: $X_2=X_1$; când $Y=2$: valorile sunt complementare: dependență maximă. Calculează scorurile $P(Y)P(X_1|Y)P(X_2|Y)$ pentru celula $(0,0)$. 2) La cazul 2 calculează cele patru celule: $(0,0)$: $\frac13$ față de $0$; $(1,1)$: $\frac1{12}$ față de $\frac14$. 3) Cazul 3: $Y$ e determinat de $X_2$ singur; clasa $Y=1$ are $X_2=0$ mereu, deci scorul lui $Y{=}2$ e $0$ când $X_2=0$.

**Worked solution (book, p. 382-385):** (a) xor: $Y=1$ pe $(0,0),(1,1)$ și $Y=2$ pe $(0,1),(1,0)$. În celula $(0,0)$: $P(Y{=}1)=\frac12$, $P(X_1{=}0|Y{=}1)=\frac12$, $P(X_2{=}0|Y{=}1)=\frac12$: scorul $\frac18$; la fel pentru $Y=2$: **egalitate** în toate cele patru celule, NB alege una cu probabilitatea 0,5 și greșește cu probabilitatea 0,5: rata erorii 50%. (b) Cazul 1: scorul lui $Y{=}1$ este $\frac14$ în fiecare celulă și al lui $Y{=}2$ este $0$ (clasa 2 nu apare): corect peste tot. Cazul 2: $(0,0)$: $\frac13$ față de $0$; $(0,1)$: $\frac16$ față de $0$; $(1,0)$: $\frac16$ față de $0$; $(1,1)$: $\frac1{12}$ față de $\frac14$: clasa 2, corect. Cazul 3: $Y=1$ când $X_2=0$ (scor $\frac14$ față de 0), $Y=2$ când $X_2=1$: corect în cele 4 celule. Concluzie (p. 385): 50% pentru **2** din cele 16 funcții (xor și ¬xor), 0 pentru celelalte **14**: exact funcțiile neseparabile liniar în $\mathbb R^2$ (legătură cu ex. 14, în afara lecției). (P4, nota 419.)

**Detectors:** `a3 = 0` → "Verifică celula $(0,0)$: scorurile sunt egale ($\frac18$ și $\frac18$). NB nu poate decide; eroarea medie este 50%." `a3 = 0.25` → "În **toate** cele patru celule scorurile sunt egale, nu doar într-una: eroarea e $\frac12$." `c = 12` or `c = 15` → "Funcțiile cu eroare 50% sunt exact două: xor și negația lui. Din cele 16, $16-2=14$ au eroarea 0." Note on tie convention: the 50% is an expected error under random tie-breaking (B:383), not a deterministic one.

### L22.e2: ex. 2.33 (B:419-420; BS:49-54), drumeție, `[slide]`, answer status slides

**Enunț:** $Y=\text{Hike}\in\{T,F\}$ depinde de $X_1=\text{Sunny}$ și $X_2=\text{Windy}$. Se estimează: $P(\text{Hike})=0{,}5$, $P(\text{Sunny}|\text{Hike})=0{,}8$, $P(\text{Sunny}|\neg\text{Hike})=0{,}7$, $P(\text{Windy}|\text{Hike})=0{,}4$, $P(\text{Windy}|\neg\text{Hike})=0{,}5$. Ipoteza de independență condiționată a lui NB este satisfăcută. **a.** $P(\text{Sunny}{=}T,\text{Windy}{=}T,\text{Hike}{=}T)$ și decizia NB în acest caz. **b.** Completați tabelul $X_1\,X_2\,Y\mid P(X_1,X_2,Y)\mid P_{NB}(Y|X_1,X_2)\mid$ decizia NB, pentru cele 8 rânduri. **c.** Rata medie a erorii lui NB. Se creează $X_3=\text{Rainy}$: fiecare zi este fie ploioasă, fie însorită, nu amândouă și nici niciuna. **d.** Mai este adevărată independența condiționată? **e.** $P(\text{Sunny}{=}T,\text{Windy}{=}T,\text{Rainy}{=}F,\text{Hike}{=}T)$. **f.** Rata medie a erorii lui NB cu trei atribute. **g.** S-a îmbunătățit performanța prin adăugarea lui Rainy?

**Fields:** `a1` num `0.16`; `a2` choice decizia pentru $(T,T)$ `F` (scoruri $0{,}16$ față de $0{,}175$); `b1`-`b4` num $P_{NB}(\text{Hike}{=}T|X_1,X_2)$ pentru $(F,F)$, $(F,T)$, $(T,F)$, $(T,T)$: `0.4444`, `0.3478`, `0.5783`, `0.4776`; `b5` multi deciziile NB (pe aceleași patru combinații) `F, F, T, F`; `c` num `0.435`; `d` choice `nu`; `e` num `0.16`; `f` num `0.45`; `g` choice `nu: eroarea a crescut`.

**Hints:** 1) Tabelul $P(X_1,X_2,Y)=P(Y)P(X_1|Y)P(X_2|Y)$ (aici distribuția adevărată e dată de produs). La (b), NB folosește aceiași factori, deci $P_{NB}$ se obține normalizând produsele pe fiecare pereche $(X_1,X_2)$. 2) Rata erorii = suma probabilităților **adevărate** $P(X_1,X_2,Y)$ ale rândurilor în care decizia NB diferă de $Y$. 3) La (f): cu $X_3=1-X_1$, NB înmulțește încă un factor $P(X_3|Y)$ în care $X_1$ apare a doua oară.

**Worked solution (BS:49-54, `[slide]`; literele cărții: slide a = a; slide b = b+c; slide c = d+e; slide d = f+g):** (a) $0{,}8\cdot0{,}4\cdot0{,}5=0{,}16$; pentru $(T,T)$ scorul lui $\neg$Hike este $0{,}7\cdot0{,}5\cdot0{,}5=0{,}175>0{,}16$: NB decide **F**, cu $P_{NB}(\text{T}|T,T)=0{,}4776$. (b) Tabelul (rândurile $Y=F$ și $Y=T$ pentru fiecare $(X_1,X_2)$): $(F,F)$: $0{,}075$ / $0{,}060$, decizia F; $(F,T)$: $0{,}075$ / $0{,}040$, F; $(T,F)$: $0{,}175$ / $0{,}240$, T; $(T,T)$: $0{,}175$ / $0{,}160$, F. (c) rândurile greșite: $(F,F,T)=0{,}060$, $(F,T,T)=0{,}040$, $(T,F,F)=0{,}175$, $(T,T,T)=0{,}160$: **$0{,}435$**. (d) Nu: Sunny și Rainy sunt complementare, deci condiționat de Hike nu sunt independente. (e) $P(\text{Rainy}{=}F|\text{Hike},\text{Sunny},\text{Windy})\cdot P(\text{Sunny},\text{Windy}|\text{Hike})P(\text{Hike})=1\cdot0{,}8\cdot0{,}4\cdot0{,}5=0{,}16$. (f) Cu trei atribute decizia NB se schimbă numai în celula $(\text{Sunny},\text{Windy})=(T,T)$ (din F în T); greșelile sunt acum $(F,F,T)=0{,}060$, $(F,T,T)=0{,}040$, $(T,F,F)=0{,}175$, $(T,T,F)=0{,}175$, în total **$0{,}45$**. (g) Nu: $0{,}435\to0{,}45$. **Observație importantă (BS:54):** eroarea se calculează față de distribuția **adevărată** $P$, nu față de $P_{NB}$; la trei atribute multe celule au probabilitate adevărată 0 și $P_{NB}>0$. NB scade fiindcă ipotezele de independență nu se mai verifică pentru atribute corelate.

**Detectors:** `c = 0.5` → "Ai împărțit greșelile la numărul de rânduri (8)? Nu: rata erorii este suma probabilităților adevărate ale rândurilor greșite." `b1 = 0.5556` → "$0{,}5556$ este $P_{NB}(\text{F}|F,F)$; cerem $P_{NB}(\text{T}|F,F)=0{,}4444$." `f = 0.435` → "Cu $X_3$ decizia NB pentru $(T,T)$ se schimbă din F în T: greșeala nu mai e rândul $(T,T,T)$ cu $0{,}160$, ci rândul $(T,T,F)$ cu $0{,}175$." `g = da` → "Eroarea a crescut ($0{,}45>0{,}435$): adăugarea unui atribut dependent poate dăuna lui NB."

### L22.e3: ex. 2.9 (B:378-379), clasificarea bayesiană, un caz particular, `[caiet]`, answer status book (demonstrația este ecranele L22.s12-s16)

**Enunț:** Variabilele $X_1,X_2,X_3,X_4$ sunt independente condiționat două câte două în raport cu $Y$, cu excepția perechii $X_3,X_4$ (deci Bayes Naiv ar produce erori de clasificare). Cum am putea modifica regula de decizie a lui Bayes Naiv pentru a ține cont de această particularitate?

**Fields:** `r` choice regula: ✓ $\arg\max_yP(X_1|y)P(X_2|y)P(X_3,X_4|y)P(y)$; ✗[NB neschimbat] $\arg\max_yP(X_1|y)P(X_2|y)P(X_3|y)P(X_4|y)P(y)$; ✗[prea mult] $\arg\max_yP(X_1,X_2,X_3,X_4|y)P(y)$ (Bayes Comun: corect, dar nu folosește independențele date); `p1` num parametri NB (atribute și ieșire binare) `9`; `p2` num noua regulă `11` (`[construit]` pe regula cărții: $1+2+2+2\cdot3$); `p3` num Bayes Comun `31`.

**Hints:** 1) Perechea dependentă rămâne într-un singur factor. 2) Regula de înlănțuire condiționată (Lecția 1) justifică egalitatea. 3) La parametri: $P(y)$ dă 1; $P(X_1|y)$ dă 2 (câte unul pe clasă); la fel $P(X_2|y)$; $P(X_3,X_4|y)$ are 4 combinații, adică 3 valori libere pe clasă, 6 în total.

**Worked solution (book, p. 378-379):** regula este $\arg\max_yP_{MLE}(X_1|y)P_{MLE}(X_2|y)P_{MLE}(X_3,X_4|y)P_{MLE}(y)$; justificarea este în ecranele L22.s12-s16. Observație (book, p. 379): clasificatorul stă "între" Bayes Naiv și Bayes Optimal: produce aceeași eroare la antrenare ca Bayes Optimal și folosește o proprietate de independență condiționată ca Bayes Naiv, deci are mai puțini parametri decât Bayes Optimal. Numărul de parametri: cartea nu dă pentru 2.9; calculul de mai sus ($9<11<31$) `[construit]`.

**Detectors:** `p2 = 9` → "Perechea $(X_3,X_4)$ nu mai e despărțită: $P(X_3,X_4|y)$ are 3 valori libere pe clasă, nu 1+1." `p2 = 12` → "Numără doar valorile libere: $P(y)$ 1, $X_1$ 2, $X_2$ 2, perechea 6, total 11."

### L22.e4: ex. 2.35 (B:421-422; BS:64-72), clasificatori bayesieni pe $Y=(A\land B)\lor\neg(B\lor C)$, answer status verified-twice (cartea n-o rezolvă; slide-urile BS:65-72 da)

**Enunț:** $Y=(A\land B)\lor\neg(B\lor C)$, cu $A,B,C$ variabile binare independente, fiecare cu probabilitate 50% să ia valoarea 0. **a.** Câți parametri trebuie să estimeze Bayes Naiv pentru a învăța $Y$? Enumerați-i ($P(\neg x)$ nu se numără dacă $P(x)$ e numărat). **b.** Rata medie a erorii la antrenare a lui Bayes Naiv, cu date infinite (la egalitate, $y_{NB}=1$). **c.** Câți parametri estimează Bayes Optimal? **d.** Rata medie a erorii la antrenare a lui Bayes Optimal (argument calitativ). **e.** Un clasificator care presupune că $A$ este independent de $C$ condiționat de $B$ și $Y$: arătați că estimează mai puțini parametri decât Bayes Optimal și are aceeași rată a erorii.

Tabela de adevăr (de scris întâi): $Y=1$ exact pe $ABC=000,100,110,111$, deci $P(Y{=}1)=\frac12$.

| A B C | 000 | 001 | 010 | 011 | 100 | 101 | 110 | 111 |
|---|---|---|---|---|---|---|---|---|
| Y | 1 | 0 | 0 | 0 | 1 | 0 | 1 | 1 |

**Fields:** `a` num `7`; `a2` multi parametrii: `P(Y)`, `P(A|Y=0)`, `P(A|Y=1)`, `P(B|Y=0)`, `P(B|Y=1)`, `P(C|Y=0)`, `P(C|Y=1)`; `b0` num câte celule sunt cu egalitate la NB `4` (celulele $000$, $010$, $101$, $111$); `b` num `0.25` (frac `1/4`; greșit pe $010$ și $101$); `c` num `15`; `d` num `0`; `e1` num numărul de parametri `11`; `e2` num eroarea `0`.

**Hints:** 1) $P(A{=}1|Y{=}1)=\frac34$, $P(A{=}1|Y{=}0)=\frac14$; $P(B{=}1|Y)=\frac12$ pentru ambele; $P(C{=}1|Y{=}1)=\frac14$, $P(C{=}1|Y{=}0)=\frac34$. 2) Scorurile NB sunt egale pentru $(A,C)=(0,0)$ și $(1,1)$ (deci decizia $=1$ prin convenție); greșit pe $010$ (adevărat 0) și $101$ (adevărat 0). 3) La (e): în fiecare felie $(B,Y)$ una dintre $A$, $C$ este constantă: $(B{=}0,Y{=}1)$: $C=0$; $(0,0)$: $C=1$; $(1,1)$: $A=1$; $(1,0)$: $A=0$; deci $A\perp C|B,Y$. Regula: $P(Y)P(B|Y)P(A|B,Y)P(C|B,Y)$ cu $1+2+4+4=11$ parametri.

**Worked solution `[calculat]` + BS:65-72 (Culegerea nu dă răspunsul; verificat de două ori):** (a) **7**: $P(Y)$, apoi $P(A|Y)$, $P(B|Y)$, $P(C|Y)$ pentru fiecare dintre cele două valori ale lui $Y$ (în general $2n+1$). (b) Scorurile NB $P(Y)P(A|Y)P(B|Y)P(C|Y)$ pe cele opt celule (valori în unități de $\frac1{64}$): $000$: $3$ față de $3$ (egalitate, decizia 1, corect); $001$: $9$ față de $1$ (0, corect); $010$: $3$ față de $3$ (egalitate, decizia 1, **greșit**); $011$: $9$ față de $1$ (0, corect); $100$: $1$ față de $9$ (1, corect); $101$: $3$ față de $3$ (egalitate, decizia 1, **greșit**); $110$: $1$ față de $9$ (1, corect); $111$: $3$ față de $3$ (egalitate, decizia 1, corect). Eroarea: $\frac28=\mathbf{0{,}25}$. (c) $2^{3+1}-1=\mathbf{15}$: $P(Y)$ și, pentru fiecare clasă, $2^3-1=7$ valori. (d) **0**: datele sunt consistente (fiecare instanță $ABC$ are o singură clasă) și Bayes Optimal citește eticheta rândului; nu mai există votul care să greșească (P7). (e) În fiecare felie $(B,Y)$ una dintre $A$ și $C$ este constantă, deci $P(A,C|B,Y)=P(A|B,Y)P(C|B,Y)$ (verifică cele patru felii): independență condiționată. Regula $\arg\max_yP(A|B,y)P(C|B,y)P(B|y)P(y)$ este identică cu a lui Bayes Optimal, deci eroarea este 0. Parametri: $P(Y)$; $P(B|Y{=}0)$, $P(B|Y{=}1)$; $P(A|B,Y)$ pentru cele 4 perechi $(B,Y)$; $P(C|B,Y)$ pentru cele 4: **11** — mai mult decât NB (7), mai puțin decât Bayes Optimal (15). `[slide]` BS:66-72.

**Detectors:** `a = 6` → "Ai uitat $P(Y)$; sunt 7 parametri." `a = 14` → "Ai numărat complementele; se numără doar parametrii liberi." `b = 0.5` → "Egalitatea la $000$ și $111$ cade corect (decizia 1 și adevărul 1); la $010$ și $101$ adevărul este 0: două din opt celule, $\frac28$." `b = 0` → "Naiv nu garantează 0 pe date consistente (P4): la $010$ și $101$ scorurile sunt egale și convenția cărții dă decizia 1, greșit." `c = 8` → "$2^3=8$ combinații de valori ale lui $A,B,C$; parametrii sunt probabilitățile $P(A,B,C|Y)$ pentru ambele clase minus sumele 1, plus $P(Y)$: $2\cdot7+1=15$." `e1 = 7` or `15` → "Regula $P(A|B,Y)P(C|B,Y)P(B|Y)P(Y)$ are $4+4+2+1=11$."

### L22.e5 (optional): ex. 2.36 (B:422), NB cu eroare 0 chiar dacă independența condiționată nu se verifică (P5), answer status verified-twice (fără cheie în carte; exemplul e al nostru)

**Enunț:** $A$ și $B$ sunt variabile binare independente, fiecare cu probabilitate 50% să ia 0. Definiți o funcție booleană $y=f(A,B)$ astfel încât $A$ să **nu** fie independent de $B$ condiționat de $y$, iar Bayes Naiv să producă rata medie a erorii **0%** (date infinite).

**Fields:** `f` multi tabelul $f$ pe $(A,B)=(0,0),(0,1),(1,0),(1,1)$ (patru biți); acceptat orice funcție cu un singur 1 sau un singur 0 (opt funcții); verificare automată: pentru funcția aleasă, site-ul calculează dependența condiționată și eroarea NB. Pentru $y=A\land B$ (alegerea explicată): `d1` frac $P(A{=}1,B{=}1|y{=}0)$ `0`; `d2` frac $P(A{=}1|y{=}0)\,P(B{=}1|y{=}0)$ `1/9`; `e` num eroarea NB `0`.

**Hints:** 1) xor nu merge (eroare 50%, 2.11); funcțiile constante nu merg (dau independență trivială). 2) Încearcă $y=A\land B$. 3) Dacă $y=0$, perechile $(0,0),(0,1),(1,0)$ sunt la fel de probabile.

**Worked solution `[calculat]` (Culegerea nu dă răspunsul; verificat de două ori; exemplul $y=A\land B$ este al nostru, nu al lui Ciortuz):** pentru $y=0$: $P(A{=}1,B{=}1|y{=}0)=0$, dar $P(A{=}1|y{=}0)P(B{=}1|y{=}0)=\frac13\cdot\frac13=\frac19$: $A$ și $B$ **nu** sunt independente condiționat de $y$. Totuși scorurile NB sunt: $(0,0)$: $\frac13$ față de $0$; $(0,1)$: $\frac16$ față de $0$; $(1,0)$: $\frac16$ față de $0$; $(1,1)$: $\frac1{12}$ față de $\frac14$; decizia coincide cu eticheta în toate cele patru celule: eroare 0. În total opt funcții din 16 au proprietatea cerută (un singur 1 sau un singur 0 în tabel).

**Detector:** `f = xor` → "Pentru xor scorurile sunt egale în toate celulele; NB are eroarea 50%, nu 0." `f = constantă` → "La o funcție constantă $A$ și $B$ sunt independente condiționat de $y$: nu respectă prima condiție."

### L22.e6 (optional): ex. 2.42 (B:429), comparație NB și ID3, answer status ruled (fără cheie; răspuns argumentat din enunț)

**Enunț:** Care dintre afirmațiile de mai jos sunt adevărate atât pentru Bayes Naiv cât și pentru ID3? (Se poate alege mai mult de una.) **1.** Pentru ambii se presupune că orice pereche de atribute $X_i,X_j$ este independentă. **2.** Pentru ambii se presupune că orice pereche este dependentă. **3.** Pentru ambii se presupune că orice pereche este independentă în raport cu eticheta. **4.** Pentru ambii se presupune că orice pereche este dependentă în raport cu eticheta.

**Field:** `m` multi `niciuna`.

**Hints:** 1) Ce presupune NB: independență necondiționată sau condiționată de etichetă? 2) Presupune ID3 ceva despre perechi de atribute? Gândește-te la xor (ID3 îl poate reprezenta). 3) Afirmația 3 este adevărată doar pentru unul dintre cei doi.

**Worked solution (reasoned; answer status ruled; no key in the book):** nicio afirmație nu este adevărată pentru amândoi. Bayes Naiv presupune independență **condiționată de etichetă** (afirmația 3 e adevărată pentru NB, nu pentru ID3) și **nu** presupune independență necondiționată (1 e falsă). ID3 nu face nicio presupunere de independență între perechi de atribute: poate reprezenta xor (ex. 4.4, 4.32), deci nici 2 sau 4 nu sunt presupuneri ale lui.

**Detector:** `3` → "Afirmația 3 descrie Bayes Naiv. ID3 nu presupune nicio independență a atributelor: poate învăța xor, unde atributele sunt perfect dependente în raport cu eticheta."

## L22 visual spec: `ml-viz-nb` with two error indicators (same widget as L20 and L21)

- **Data (selector):** (1) T20C 3: $P(Y)=(0{,}8;0{,}2)$ and the $P(X_1|Y)$ table; a switch "adaugă $X_2$ = copie a lui $X_1$". (2) ex. 2.33 (the eight rows, `Rainy` switch).
- **Steps (manual advance, prediction first), T20C 3:** (1) the joint table $P(X_1,Y)$ fills in; predict the NB decision per $X_1$. (2) the cells where decision ≠ Y turn red; predict the error rate (0,20). (3) the copy is added: the table gets four cells $(X_1,X_2)$; predict the decision of cell $(1,1)$ (flips to 1). (4) **two indicators** appear on the same table: "eroarea față de $P$ adevărată" $= 0{,}30$ and "eroarea față de $P_{NB}$" $= 0{,}174$; predict which one is the exam's (the true one). (5) a "Bayes Comun" toggle shows its decisions and its error $0{,}20$ unchanged.
- **Learner predicts:** the decision of a cell, the error rate before and after the copy, and which of the two error numbers is the right one.
- **Reduced motion:** cells change colour in place; no auto-advance.

## L22 builder notes

- Sources: Cn-s6:1-3, BS:49-54, BS:64-72, B:354-357 (P3-P7), B:378-379 (2.9), B:382-385 (2.11), B:419-422 (2.33, 2.35, 2.36), B:429 (2.42), T20C 3 (`tests/2020-2021-t1-ciortuz/subiect.pdf` p. 3), `verified-answers.md` (2.11, 2.33, 2.35, 2.36), `exbook-ch2-3.md` sections 3, 6.
- **Computed by me:** the $P_{NB}$-error 0,174 (L22.s07); L22.s06 (Bayes Comun error with the copy); the parameter count 11 for 2.9 (the book gives the rule only); the 8 functions of 2.36; the quiz number 0,21. (An earlier draft also asked NB on $Y=A\lor B$; that is 2.11.b, case 2, up to symmetry, so it was removed.) Each is recomputed by `verify_bayes.py` (sections L22 and quiz numbers).
- **Reading of 2.9:** the book takes "independente două câte două" to mean $X_1$ and $X_2$ are each conditionally independent of the others (stated on L22.s12). Strictly, pairwise independence alone does not give that; the screen states the reading the book uses, in one line, without a discussion.
- **Conventions on screen:** the tie rule of 2.35 ($y_{NB}=1$); ties in 2.11 count as 50% (expected error under random tie-breaking).
- **Optional:** 2.36 and 2.42 (not in the table or the weekly list; included for the only examples of P5 and the NB-vs-ID3 question).
- **2.33** letters: slides and book letters differ (stated in the solution); status slides, the numbers were recomputed (`verified-answers.md` agrees on all eight rows).
- Repetition check: T20C 3 is used on L22.s02-s07 only; 2.33's duplicate is a complement ($X_3=1-X_1$), a different mechanism from the exact copy of the worked example; xor appears in 2.11 and nowhere else; the conditional chain rule is used (not re-taught) in the proof screens, with a back-link to L1.

---

# Testele (Teste tab, mod hârtie; nu sunt lecții în player)

**Common shape (both tests).** One problem per screen. The learner reads the statement, writes on paper, presses "Predă", then sees the full solution and ticks the barem items they earned; the screen adds up the points. A timer is optional and never blocks (mock: 100 min, T21P: 1 h 30). Minimum to pass: 1,5 p of 6. Each solution screen ends with a line "Dacă ai greșit aici, revezi Lecția N" built from the problem-to-lesson table of each test. Wrong-answer items go to the Recapitulare pile as new-number variants, never as the identical question.

**Hint tables.** Every statement that needs logarithms prints the H(p) values it needs; **the values below are recomputed by script** (T20C prints $H(1/5)$ and $H(2/5)$ swapped; here they are correct: $H(1/5)=0{,}7219$, $H(2/5)=0{,}9710$).

## 5.1 `ml-test-mock-t1`: Test de probă T1 (6 p, 100 min, minim 1,5 p)

New numbers on every problem (none of the data of any lesson or of T21P is reused; variants can be generated and verified by script, constraints per problem in the builder notes). Adapted problem types from the allocation: 1 (aeroport + independență + demonstrație + adevărat/fals), 2 (tabel comun), 3 (entropie și câștig), 4 (ID3 cu atribut continuu), 5 (eroare, CVLOO, overfitting), 6 (Bayes Naiv față de Bayes Comun).

| # | Problem | Points | Lessons shown on review |
|---|---|---|---|
| 1 | Probabilități: Bayes cu probabilitate totală, independență, demonstrație, adevărat/fals | 0,9 | 1, 2, 3 |
| 2 | Tabel comun: independență, independență condiționată, E, Var, Cov | 1,1 | 4, 5, 6 |
| 3 | Entropie și câștig: definiția întâi, ciot, monotonia lui H(p) | 0,8 | 7, 8, 9, 10 |
| 4 | ID3 de mână cu un atribut continuu | 1,3 | 9, 11, 14 |
| 5 | Eroare la antrenare, CVLOO, overfitting; adevărat/fals pe ID3 | 1,0 | 12, 13, 15 |
| 6 | Bayes Naiv față de Bayes Comun pe un tabel | 0,9 | 20, 21, 22 |

### Problema 1 (0,9 p): Probabilități

> **a. (0,3 p)** La un control de calitate, 0,4% dintre piese sunt defecte. Aparatul respinge 95% dintre piesele defecte și 8% dintre piesele bune. O piesă este respinsă. Care este probabilitatea ca ea să fie defectă? Indicați formula folosită și înlocuiți numeric; nu este necesar să duceți calculul până la capăt.
> **b. (0,2 p)** Pentru evenimentele $A$ și $B$ avem $P(A)=0{,}4$, $P(B)=0{,}25$ și $P(A\cup B)=0{,}6$. Sunt $A$ și $B$ independente? Justificați.
> **c. (0,2 p)** Demonstrați formula probabilității totale: pentru $0<P(B)<1$, $P(A)=P(A|B)P(B)+P(A|\bar B)P(\bar B)$.
> **d. (0,2 p)** Pentru fiecare afirmație spuneți dacă este adevărată sau falsă; la cea adevărată dați demonstrația, la cea falsă un contraexemplu. **(i)** Dacă $A\subseteq B$, atunci $P(A)\le P(B)$. **(ii)** Dacă $A$ și $B$ sunt incompatibile și $P(A)>0$, $P(B)>0$, atunci $A$ și $B$ sunt independente. (0,1 p fiecare)

**Solution.** (a) $D$ = piesa e defectă, $R$ = respinsă. Bayes cu probabilitatea totală: $P(D|R)=\dfrac{P(R|D)P(D)}{P(R|D)P(D)+P(R|\bar D)P(\bar D)}=\dfrac{0{,}95\cdot0{,}004}{0{,}95\cdot0{,}004+0{,}08\cdot0{,}996}=\dfrac{0{,}0038}{0{,}08348}\approx0{,}0455$ (`[construit]`, exact $95/2087$). (b) Regula de adunare: $P(A\cap B)=0{,}4+0{,}25-0{,}6=0{,}05$; produsul $P(A)P(B)=0{,}1\neq0{,}05$: **nu** sunt independente. (Verificare echivalentă: dacă ar fi independente, $P(A\cup B)=0{,}4+0{,}25-0{,}1=0{,}55\neq0{,}6$.) (c) $A=(A\cap B)\cup(A\cap\bar B)$, uniune de evenimente disjuncte; aditivitatea dă $P(A)=P(A\cap B)+P(A\cap\bar B)$; definiția probabilității condiționate dă $P(A\cap B)=P(A|B)P(B)$ și $P(A\cap\bar B)=P(A|\bar B)P(\bar B)$ (cu $P(B),P(\bar B)>0$). (d)(i) adevărat: $B=A\cup(B\setminus A)$, disjuncte, deci $P(B)=P(A)+P(B\setminus A)\ge P(A)$. (ii) fals: incompatibile înseamnă $P(A\cap B)=0$, dar $P(A)P(B)>0$; contraexemplu: zar corect, $A=\{1\}$, $B=\{2\}$: $0\ne\frac16\cdot\frac16$.

**Barem.** (a) 0,1 formula Bayes numită sau scrisă; 0,1 numitorul cu probabilitatea totală (ambii termeni); 0,1 substituirea corectă. (b) 0,1 regula de adunare pentru $P(A\cap B)$; 0,05 compararea cu $P(A)P(B)$; 0,05 concluzia. (c) 0,05 descompunerea disjunctă; 0,05 aditivitatea; 0,05 definiția condiționatei; 0,05 condițiile $P(B),P(\bar B)>0$. (d) 0,1 + 0,1 (valoare de adevăr și demonstrația/contraexemplul).

**Capcane (detectoare la nota de autoevaluare).** (a) $0{,}95$ sau $0{,}0038$ ca răspuns: este verosimilitatea, respectiv numărătorul; fără numitor nu e o probabilitate. Uitarea termenului $P(R|\bar D)P(\bar D)$ dă $1$. (b) "Independente fiindcă $P(A\cup B)$ e mare": independența se verifică prin produs. (d)(ii) "adevărat, fiindcă nu au elemente comune": incompatibil nu înseamnă independent.

### Problema 2 (1,1 p): Tabel comun

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

### Problema 3 (0,8 p): Entropie și câștig

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

### Problema 4 (1,3 p): ID3 de mână cu un atribut continuu

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

### Problema 5 (1,0 p): Eroare la antrenare, CVLOO, overfitting; adevărat/fals

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

### Problema 6 (0,9 p): Bayes Naiv și Bayes Comun

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

### Mock T1: visual and builder notes

- **Figures:** only problem 5 has a figure: the 8-point grid, drawn as a static scatter with `+` and `-` markers (no widget needed beyond a table-to-scatter renderer). The solution screen of problem 5 shows the decision regions of $DT^*$ and of each of the three erroneous LOO trees (static drawings).
- **Variant generation (Recapitulare and re-takes).** Each problem has a parameter template and a script check: P1a probabilities from a grid (prior 0,1-1%, detection 80-99%, false-alarm 2-15%; result recomputed); P1b any $(P(A),P(B),P(A\cup B))$ with two-decimal values, independent or not (recomputed); P2a independent table with two blanked cells (solvable uniquely); P2b conditional independence true or false by construction (recomputed over all 8 cells); P3 pairs of stumps with equal weights, where the qualitative shortcut holds, and hint values printed from the script; P4 a table of 8 rows with a continuous column chosen so that no tie occurs among the **selected** nodes (checked by an ID3 enumerating all tie choices) and the tree has 3 or 4 tests; P5 a $2\times4$ grid with labellings for which the LOO predictions are **independent of tie resolution** (`s5.py` style search; 96 of the 256 labellings qualify, among them the one used here) and $DT^*$ overfits $DT_2$; P6 a count table where NB and Bayes Comun decide differently on the asked instance and one conditional has a 0 count.
- **Numbers come from** `verify_bayes.py` (section MOCK T1) and from the ID3 enumeration used for P4/P5; the model solutions above agree with them.
- **Deviation from the allocation text:** problem 1c proves the total probability formula, not $P(A,B|C)=P(A|C)P(B|A,C)$ (decision 1 in section 0.2). Fallback statement if Alex prefers the allocation text: "c. Demonstrați că $P(A,B|C)=P(A|C)\,P(B|A,C)$ pentru $P(C)\neq0$, $P(A,C)\neq0$."
- **Not in the mock** (allocation): pruning, gain ratio, $\chi^2$ (L16-L17); NB error rate, xor, duplicates (L22); Jensen/KL proofs (L23-L24); the bonus of three prisoners (L19).

## 5.2 `ml-test-t21p`: Probabilități și statistică + ID3 (1), 2021-22, ca la examen (6 p, 1 h 30, minim 1,5 p)

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

### T21P builder notes

- **Provenance of the figures** (read from the page images, `tests/2021-2022-t1-seminar-ro/subiect.pdf` pp. 2-4): item 10 stump $[3{+},5{-}]\to[2{+},1{-}],[1{+},4{-}]$; item 12 tree as above; item 15 the two columns. The text mirror drops the formulas of items 1, 2, 16a; the images were read.
- **Verification:** every number above is recomputed in `verify_bayes.py` (section T21P): items 9, 10, 11, 13, 14, 15, 3, 8.
- **Item 14c** is counterfactual (the printed 0,8 and 0,7 are not the real values); the solution says so in one sentence and still draws the tree from the given values.
- **No official barem**: the half-points above are a proposal; the point values per item and sub-item are the paper's.
- **Shared table check (allocation note "de reconfirmat"):** none of the tables of T21P coincides with a table owned by L19-L22 or by the mock; against the other lessons the reconfirmation needs their outlines (the data tables listed in `allocation.json` for L1-L18 contain no T21P table).
- **Item 17c versus the seminar note** "o dată pe drum, repetat pe ramuri diferite" (Cn-s3:12): consistent, see conflict C-10 of the content map.

---

# 6. Cross-lesson checks and open problems

## 6.1 Back-links used (each is one line "vezi Lecția N"; nothing is re-explained)

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

## 6.2 Repetition check (concept, example, table, exercise; each in exactly one place)

- **Concepts.** Likelihood, log-likelihood, MLE from counts, the Bernoulli MLE proof: L18 only. Bayes for hypotheses, $h_{ML}$/$h_{MAP}$, argmax/max, Beta(3,3) MAP, log-odds, brute-force MAP, Bayes optimal vote: L19 only. $v_{MAP}$ rule, Bayes Comun, Bayes Naiv, unified view, parameter formulas: L20 only. Zero problem, 0/0, add-one, m-estimate, absent-word factors: L21 only. Error rate against $P$, two error sources, P4-P7, New-Bayes: L22 only. The add-one rule is **not** previewed in L20 (the pretest and L20.s02-s06 have no zero in a place where it matters; the pretest instance has no matching row, that is all), and L18 has no zero-count remark at all (L21 owns the zero problem; the allocation note says so).
- **Worked examples.** Cn-s5:1 "Remember 2" (L18), ML6:7 (L19), P20 2 (L20), T21T2 7 (L21), T20C 3 (L22): one lesson each. The four pretests (coins, six-row table, "bonus" word, $P(Y)=(0{,}6;0{,}4)$ table) are all different data from the worked examples and from the exercises.
- **Tables.** Each table in the four lessons appears in one lesson only, except the two declared reuses (the 14-day table in L20.e4, the mushrooms in L20.s12-s17).
- **Exercises.** L19: 0.26, 0.43.f-i, 2.1, 2.2, 2.3, 2.4, 2.24, 2.25 (opt.), 2.26 (opt.). L20: 2.5, 2.6, 2.7, 2.27, 2.28, 2.29. L21: 2.8, 2.30, 2.31. L22: 2.9, 2.11, 2.33, 2.35, 2.36 (opt.), 2.42 (opt.). Same list as `allocation.json` (checked by script: every allocated exercise number of L19-L22 has an `e` block, no other lesson's number is present).
- **Proofs.** L19: argmax without $P(D)$ (s08), the MAP of a Bernoulli parameter (s11-s15, serving 0.43.g), 2.26 (e9). L20: MLE with nine parameters and concavity (s12-s17). L22: New-Bayes justification (s12-s16, serving 2.9), A ⊥ C | B,Y for 2.35.e (in e4). Each proof appears once.
- **Tests.** The mock uses new numbers on every problem; its problem 1c is the L2 proof, not the L1 proof of T21P item 1 (decision 1). T21P is the real paper; items that coincide with a lesson's proof (1, 2) are the same proofs, shown once more as a test, which is their purpose.

## 6.3 Open problems for Alex or the builder

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

## 6.4 Verification artefact

`/home/alexa/Desktop/SO/os-study-guide-ml/docs/superpowers/specs/ml-outline/verify_bayes.py` (exact fractions; run `python3 verify_bayes.py` from that folder; it imports the small ID3 helper `id3c.py` next to it for the sections P4 and P5, which enumerates tie choices). It prints every number of this outline in sections L19, L20, L21, L22, quiz numbers, MOCK T1 and T21P. The builder's numeric test should recompute from the exercise data in the JSON, as design section 10 says; this script is the reference computation.
