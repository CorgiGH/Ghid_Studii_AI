**What:** content outline for the information-theory ML lessons (ml-l07, ml-l08, ml-l23, ml-l24) · **When:** 2026-10-28 · **Status:** active

# Schița de conținut ML: teoria informației (L7, L8, L23, L24)

Cum se citește: textele pentru cursant sunt în română (blocurile `RO:`), notele pentru constructor sunt în engleză. În textul pentru cursant se folosesc doar **bold**, `code` și $KaTeX$, fără ghilimele românești. Fără etichete de pedagogie în textul pentru cursant (etichetele de mai jos, Pretest / Concret / Regula / De ce / Retrieve, sunt doar pentru constructor).

## 0. Builder conventions

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

## 0.1 Problems found while writing (details in the lessons)

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

