import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Toggle } from '../../../components/ui';
import MultipleChoice from '../../../components/ui/MultipleChoice';

export default function Seminar04() {
  const { t } = useApp();

  /* ─── Problem 1: Max-tracking with inner loop ─── */
  const mc1io = [{
    question: { en: 'Which I/O formalization best describes Problem 1?', ro: 'Care formalizare I/O descrie cel mai bine Problema 1?' },
    options: [
      { text: { en: 'Input: n ∈ ℕ, v: permutation of {1,...,n}; Output: sum ∈ ℕ₀', ro: 'Input: n ∈ ℕ, v: permutare a lui {1,...,n}; Output: sumă ∈ ℕ₀' }, correct: true },
      { text: { en: 'Input: n ∈ ℕ, v: array of n reals; Output: max ∈ ℝ', ro: 'Input: n ∈ ℕ, v: vector de n reale; Output: max ∈ ℝ' }, correct: false, feedback: { en: 'Two mistakes: the input is a *permutation of {1..n}*, not arbitrary reals; and the algorithm returns `sum`, not `max`.', ro: 'Două greșeli: input-ul e o *permutare a {1..n}*, nu reale oarecare; iar algoritmul returnează `sum`, nu `max`.' } },
      { text: { en: 'Input: n ∈ ℕ, v: permutation of {1,...,n}; Output: max ∈ ℕ', ro: 'Input: n ∈ ℕ, v: permutare a lui {1,...,n}; Output: max ∈ ℕ' }, correct: false, feedback: { en: '`max` is only an internal variable; the algorithm returns `sum`.', ro: '`max` e doar o variabilă internă; algoritmul returnează `sum`.' } },
      { text: { en: 'Input: n ∈ ℕ; Output: sum ∈ ℕ₀', ro: 'Input: n ∈ ℕ; Output: sumă ∈ ℕ₀' }, correct: false, feedback: { en: 'The algorithm reads v throughout, so v must be an input in addition to n.', ro: 'Algoritmul citește v peste tot, deci v trebuie să fie input pe lângă n.' } },
    ],
    explanation: {
      en: 'The algorithm takes n and a vector v (permutation of {1,...,n}) and returns sum — a counter incremented in the inner loop. The max variable is internal, not returned.',
      ro: 'Algoritmul primește n și un vector v (permutare a {1,...,n}) și returnează sum — un contor incrementat în bucla interioară. Variabila max este internă, nu returnată.',
    },
  }];

  const mc1comp = [{
    question: { en: 'What is the average-case time complexity of Problem 1\'s algorithm?', ro: 'Care este complexitatea medie de timp a algoritmului din Problema 1?' },
    options: [
      { text: { en: 'Θ(n · ln n)', ro: 'Θ(n · ln n)' }, correct: true },
      { text: { en: 'Θ(n²)', ro: 'Θ(n²)' }, correct: false, feedback: { en: 'That would be the worst case (every element is a new maximum); on average only Hₙ ≈ ln n updates happen.', ro: 'Acela ar fi cazul cel mai rău (fiecare element e nou maxim); în medie apar doar Hₙ ≈ ln n actualizări.' } },
      { text: { en: 'Θ(n)', ro: 'Θ(n)' }, correct: false, feedback: { en: 'Ignores the inner loop cost; each of the Hₙ ≈ ln n updates triggers n extra iterations.', ro: 'Ignoră costul buclei interioare; fiecare din cele Hₙ ≈ ln n actualizări declanșează n iterații în plus.' } },
      { text: { en: 'Θ(n² · ln n)', ro: 'Θ(n² · ln n)' }, correct: false, feedback: { en: 'One factor of n too many: the outer loop is n, not n²; the Hₙ factor comes from the expected update count.', ro: 'Un factor n în plus: bucla exterioară e n, nu n²; factorul Hₙ vine din numărul așteptat de actualizări.' } },
    ],
    explanation: {
      en: 'The inner loop runs n times each time a new maximum is found. The expected number of new-max updates is Hₙ − 1 = 1/2 + 1/3 + … + 1/n ≈ ln n − 1 (the i = 0 position does not count as an update). Total average cost = n · (Hₙ − 1) + n = n · Hₙ = Θ(n · ln n).',
      ro: 'Bucla interioară se execută de n ori la fiecare actualizare a maximului. Numărul mediu de actualizări este Hₙ − 1 = 1/2 + 1/3 + … + 1/n ≈ ln n − 1 (poziția i = 0 nu se numără ca actualizare). Costul mediu total = n · (Hₙ − 1) + n = n · Hₙ = Θ(n · ln n).',
    },
  }];

  /* ─── Problem 2: Inversion-counting with inner loop ─── */
  const mc2io = [{
    question: { en: 'Which I/O formalization best describes Problem 2?', ro: 'Care formalizare I/O descrie cel mai bine Problema 2?' },
    options: [
      { text: { en: 'Input: n ∈ ℕ, v: permutation of {0,...,n−1}; Output: sum ∈ ℕ₀', ro: 'Input: n ∈ ℕ, v: permutare a lui {0,...,n−1}; Output: sumă ∈ ℕ₀' }, correct: true },
      { text: { en: 'Input: n ∈ ℕ, v: permutation of {0,...,n−1}; Output: number of inversions ∈ ℕ₀', ro: 'Input: n ∈ ℕ, v: permutare a lui {0,...,n−1}; Output: numărul de inversiuni ∈ ℕ₀' }, correct: false, feedback: { en: 'Close but off by a factor: sum adds n (not 1) per inversion, so sum = n · (#inversions).', ro: 'Aproape, dar greșit cu un factor: sum adună n (nu 1) per inversiune, deci sum = n · (#inversiuni).' } },
      { text: { en: 'Input: n ∈ ℕ, v: array of n integers; Output: sorted array', ro: 'Input: n ∈ ℕ, v: vector de n întregi; Output: vector sortat' }, correct: false, feedback: { en: 'The algorithm never sorts; it only compares and counts, returning a single number.', ro: 'Algoritmul nu sortează niciodată; doar compară și numără, returnând un număr.' } },
      { text: { en: 'Input: n ∈ ℕ; Output: sum ∈ ℕ₀', ro: 'Input: n ∈ ℕ; Output: sumă ∈ ℕ₀' }, correct: false, feedback: { en: 'Forgot v: the algorithm reads v[i] and v[j], so v must be part of the input.', ro: 'A uitat v: algoritmul citește v[i] și v[j], deci v trebuie input.' } },
    ],
    explanation: {
      en: 'The algorithm returns sum, which counts n for each inversion found (not the number of inversions itself). The input is n and a permutation of {0,...,n−1}.',
      ro: 'Algoritmul returnează sum, care numără n pentru fiecare inversiune găsită (nu numărul de inversiuni în sine). Intrarea este n și o permutare a {0,...,n−1}.',
    },
  }];

  const mc2comp = [{
    question: { en: 'What is the average-case time complexity of Problem 2\'s algorithm?', ro: 'Care este complexitatea medie de timp a algoritmului din Problema 2?' },
    options: [
      { text: { en: 'Θ(n³)', ro: 'Θ(n³)' }, correct: true },
      { text: { en: 'Θ(n²)', ro: 'Θ(n²)' }, correct: false, feedback: { en: 'Only the outer double-loop; forgets the n-iteration inner loop fired ~n²/4 times on average.', ro: 'Doar bucla exterioară dublă; omite bucla interioară de n iterații, declanșată în medie de ~n²/4 ori.' } },
      { text: { en: 'Θ(n² · ln n)', ro: 'Θ(n² · ln n)' }, correct: false, feedback: { en: 'No ln factor here — the expected inversion count is Θ(n²), a constant fraction of all pairs.', ro: 'Nu există factor ln — numărul așteptat de inversiuni e Θ(n²), o fracție constantă din perechi.' } },
      { text: { en: 'Θ(n⁴)', ro: 'Θ(n⁴)' }, correct: false, feedback: { en: 'Too much: the double-loop is n², not n³; adding one more n-inner-loop gives n³, not n⁴.', ro: 'Prea mult: bucla dublă e n², nu n³; adăugând o buclă interioară de n obținem n³, nu n⁴.' } },
    ],
    explanation: {
      en: 'Expected inversions = C(n,2) · 1/2 = n(n−1)/4. Each inversion triggers n inner iterations, and the outer double-loop always does C(n,2) comparisons. Total = C(n,2) + n · n(n−1)/4 = Θ(n³).',
      ro: 'Inversiuni așteptate = C(n,2) · 1/2 = n(n−1)/4. Fiecare inversiune declanșează n iterații interioare, iar bucla exterioară dublă face mereu C(n,2) comparații. Total = C(n,2) + n · n(n−1)/4 = Θ(n³).',
    },
  }];

  /* ─── Problem 3: Break-on-first-even ─── */
  const mc3io = [{
    question: { en: 'Which I/O formalization best describes Problem 3?', ro: 'Care formalizare I/O descrie cel mai bine Problema 3?' },
    options: [
      { text: { en: 'Input: n ∈ ℕ, v: permutation of {0,...,n−1}; Output: 0', ro: 'Input: n ∈ ℕ, v: permutare a lui {0,...,n−1}; Output: 0' }, correct: true },
      { text: { en: 'Input: n ∈ ℕ, v: permutation of {0,...,n−1}; Output: index of first even element', ro: 'Input: n ∈ ℕ, v: permutare a lui {0,...,n−1}; Output: indicele primului element par' }, correct: false, feedback: { en: 'The algorithm never returns i — only `return 0`; the early exit is `break`, not `return i`.', ro: 'Algoritmul nu returnează i — doar `return 0`; ieșirea timpurie e `break`, nu `return i`.' } },
      { text: { en: 'Input: n ∈ ℕ, v: permutation of {0,...,n−1}; Output: v[i] (first even element)', ro: 'Input: n ∈ ℕ, v: permutare a lui {0,...,n−1}; Output: v[i] (primul element par)' }, correct: false, feedback: { en: 'Same confusion: the function returns 0, not v[i]. The "first even" aspect only affects runtime, not output.', ro: 'Aceeași confuzie: funcția returnează 0, nu v[i]. „Primul par" afectează doar timpul de execuție, nu rezultatul.' } },
      { text: { en: 'Input: n ∈ ℕ; Output: boolean', ro: 'Input: n ∈ ℕ; Output: boolean' }, correct: false, feedback: { en: 'Drops v and gets the output type wrong: 0 is an integer, not a boolean.', ro: 'Omite v și greșește tipul de output: 0 e întreg, nu boolean.' } },
    ],
    explanation: {
      en: 'The algorithm always returns 0 regardless of input. The interesting aspect is the execution time, not the output — it breaks early when finding the first even element.',
      ro: 'Algoritmul returnează întotdeauna 0 indiferent de intrare. Aspectul interesant este timpul de execuție, nu rezultatul — se oprește devreme când găsește primul element par.',
    },
  }];

  const mc3comp = [{
    question: { en: 'What is the average-case time complexity of Problem 3\'s algorithm?', ro: 'Care este complexitatea medie de timp a algoritmului din Problema 3?' },
    options: [
      { text: { en: 'Θ(1)', ro: 'Θ(1)' }, correct: true },
      { text: { en: 'Θ(n)', ro: 'Θ(n)' }, correct: false, feedback: { en: 'That is the worst case (all odd first); with ~n/2 even elements, we expect to hit one after ~2 steps.', ro: 'Acela e cazul cel mai rău (toate impare la început); cu ~n/2 pare, apucăm unul după ~2 pași în medie.' } },
      { text: { en: 'Θ(ln n)', ro: 'Θ(ln n)' }, correct: false, feedback: { en: 'No logarithm here — the first hit arrives in O(1) expected steps because the hit probability is a constant ~1/2.', ro: 'Fără logaritm — prima potrivire vine în O(1) pași așteptați pentru că probabilitatea e constantă ~1/2.' } },
      { text: { en: 'Θ(√n)', ro: 'Θ(√n)' }, correct: false, feedback: { en: '√n would arise from balls-and-bins collisions; here the event probability per step is constant, giving Θ(1).', ro: '√n apare la coliziuni tip bile-și-coșuri; aici probabilitatea per pas e constantă, deci Θ(1).' } },
    ],
    explanation: {
      en: 'In a permutation of {0,...,n−1}, about half the elements are even. The expected position of the first even element is (n+1)/(⌈n/2⌉+1) ≈ 2 for large n. This is constant, so Θ(1). (This is the permutation-model argument; the i.i.d. analogue used in Problem 4c arrives at the same Θ(1) via the geometric distribution, E[trials] = 1/p.)',
      ro: 'Într-o permutare a {0,...,n−1}, aproximativ jumătate din elemente sunt pare. Poziția așteptată a primului element par este (n+1)/(⌈n/2⌉+1) ≈ 2 pentru n mare. Aceasta este constantă, deci Θ(1). (Acesta e argumentul pentru modelul permutărilor; analogul i.i.d. folosit în Problema 4c ajunge la același Θ(1) prin distribuția geometrică, E[încercări] = 1/p.)',
    },
  }];

  /* ─── Problem 4: i.i.d. uniform values (not permutations) ─── */
  const mc4diff = [{
    question: {
      en: 'What is the key difference between the i.i.d. uniform model (Problem 4) and the permutation model (Problems 1-3)?',
      ro: 'Care este diferența cheie între modelul i.i.d. uniform (Problema 4) și modelul cu permutări (Problemele 1-3)?',
    },
    options: [
      { text: { en: 'In the i.i.d. model, values can repeat and positions are independent; in permutations, values are distinct and positions are dependent', ro: 'În modelul i.i.d., valorile se pot repeta și pozițiile sunt independente; în permutări, valorile sunt distincte și pozițiile sunt dependente' }, correct: true },
      { text: { en: 'The i.i.d. model always gives worse complexity', ro: 'Modelul i.i.d. dă întotdeauna complexitate mai proastă' }, correct: false, feedback: { en: 'For Problems 1-3 the asymptotic result is the same; the models differ in *structure*, not always in the final bound.', ro: 'Pentru Problemele 1-3 rezultatul asimptotic e același; modelele diferă ca *structură*, nu întotdeauna ca margine finală.' } },
      { text: { en: 'The permutation model has independent positions too', ro: 'Modelul cu permutări are și el poziții independente' }, correct: false, feedback: { en: 'The exact opposite: in a permutation, knowing v[0] removes that value from the remaining positions — they are *dependent*.', ro: 'Exact opusul: într-o permutare, cunoașterea lui v[0] scoate valoarea din restul pozițiilor — sunt *dependente*.' } },
      { text: { en: 'There is no difference — the analyses give the same results', ro: 'Nu există diferență — analizele dau aceleași rezultate' }, correct: false, feedback: { en: 'Although the asymptotic bounds coincide here, the *argument* is different: geometric r.v. (i.i.d.) vs symmetry over permutations.', ro: 'Deși marginile asimptotice coincid aici, *argumentul* diferă: v.a. geometrică (i.i.d.) vs simetrie pe permutări.' } },
    ],
    explanation: {
      en: 'In the i.i.d. model, each v[i] is drawn independently and uniformly from {0,...,n−1}, so repeats are possible. In permutations, all values are distinct and knowing some values constrains the rest.',
      ro: 'În modelul i.i.d., fiecare v[i] este ales independent și uniform din {0,...,n−1}, deci repetițiile sunt posibile. În permutări, toate valorile sunt distincte și cunoașterea unor valori constrânge restul.',
    },
  }];

  const mc4p1 = [{
    question: { en: 'What is the average complexity of Problem 1\'s algorithm under the i.i.d. uniform model?', ro: 'Care este complexitatea medie a algoritmului din Problema 1 sub modelul i.i.d. uniform?' },
    options: [
      { text: { en: 'Θ(n · ln n)', ro: 'Θ(n · ln n)' }, correct: true },
      { text: { en: 'Θ(n²)', ro: 'Θ(n²)' }, correct: false, feedback: { en: 'The number of new maxima is Θ(ln n) in expectation under i.i.d. too, not Θ(n).', ro: 'Numărul de noi maxime e Θ(ln n) în medie și la i.i.d., nu Θ(n).' } },
      { text: { en: 'Θ(n)', ro: 'Θ(n)' }, correct: false, feedback: { en: 'Ignores the inner loop: each of the ~ln n new maxima triggers n extra iterations.', ro: 'Ignoră bucla interioară: fiecare din cele ~ln n noi maxime declanșează n iterații în plus.' } },
      { text: { en: 'Θ(n · ln² n)', ro: 'Θ(n · ln² n)' }, correct: false, feedback: { en: 'Likely doubled the log factor — once for "number of new maxima" and once for "cost per update." But the inner loop here is n (linear), not ln n; only the update-count contributes the log.', ro: 'Probabil ai dublat factorul log — o dată pentru „numărul de noi maxime" și o dată pentru „cost per actualizare". Dar bucla interioară aici e n (liniară), nu ln n; doar numărul de actualizări contribuie cu log-ul.' } },
    ],
    explanation: {
      en: 'With i.i.d. uniform values on {0,...,n−1}, P(v[i] > max(v[0],...,v[i−1])) is close to 1/(i+1) for large n. The expected number of max updates remains Θ(ln n), giving Θ(n · ln n) total.',
      ro: 'Cu valori i.i.d. uniforme pe {0,...,n−1}, P(v[i] > max(v[0],...,v[i−1])) este aproape de 1/(i+1) pentru n mare. Numărul așteptat de actualizări ale maximului rămâne Θ(ln n), dând Θ(n · ln n) total.',
    },
  }];

  const mc4p2 = [{
    question: { en: 'What is the average complexity of Problem 2\'s algorithm under the i.i.d. uniform model?', ro: 'Care este complexitatea medie a algoritmului din Problema 2 sub modelul i.i.d. uniform?' },
    options: [
      { text: { en: 'Θ(n³)', ro: 'Θ(n³)' }, correct: true },
      { text: { en: 'Θ(n²)', ro: 'Θ(n²)' }, correct: false, feedback: { en: 'Counts only the outer pair comparisons; forgets the n-wide inner loop fired for each of the Θ(n²) inversions.', ro: 'Numără doar comparațiile din bucla exterioară; omite bucla interioară de n pentru cele Θ(n²) inversiuni.' } },
      { text: { en: 'Θ(n² · ln n)', ro: 'Θ(n² · ln n)' }, correct: false, feedback: { en: 'No ln factor — P(inversion) is constant in the i.i.d. model, so the expected count is Θ(n²), not Θ(n² log n).', ro: 'Fără factor ln — P(inversiune) e constantă în modelul i.i.d., deci numărul așteptat e Θ(n²), nu Θ(n² log n).' } },
      { text: { en: 'Θ(n⁴)', ro: 'Θ(n⁴)' }, correct: false, feedback: { en: 'Too much: the nested loops give at most Θ(n³); Θ(n⁴) would need another layer.', ro: 'Prea mult: buclele imbricate dau cel mult Θ(n³); Θ(n⁴) ar cere încă un nivel.' } },
    ],
    explanation: {
      en: 'P(v[i] > v[j]) = (n−1)/(2n) for i.i.d. uniform on {0,...,n−1}. Expected "inversions" = C(n,2) · (n−1)/(2n) = (n−1)²/4 ≈ n²/4. Each triggers n inner iterations: total ≈ n³/4 = Θ(n³).',
      ro: 'P(v[i] > v[j]) = (n−1)/(2n) pentru i.i.d. uniform pe {0,...,n−1}. „Inversiuni" așteptate = C(n,2) · (n−1)/(2n) = (n−1)²/4 ≈ n²/4. Fiecare declanșează n iterații interioare: total ≈ n³/4 = Θ(n³).',
    },
  }];

  const mc4p3 = [{
    question: { en: 'What is the average complexity of Problem 3\'s algorithm under the i.i.d. uniform model?', ro: 'Care este complexitatea medie a algoritmului din Problema 3 sub modelul i.i.d. uniform?' },
    options: [
      { text: { en: 'Θ(1)', ro: 'Θ(1)' }, correct: true },
      { text: { en: 'Θ(n)', ro: 'Θ(n)' }, correct: false, feedback: { en: 'That is the worst case; expected value of a geometric(1/2) is 2 = Θ(1).', ro: 'Acela e cazul cel mai rău; media unei geometrice(1/2) e 2 = Θ(1).' } },
      { text: { en: 'Θ(ln n)', ro: 'Θ(ln n)' }, correct: false, feedback: { en: 'No ln: when the per-step success probability is a *constant*, E[trials] is a constant.', ro: 'Fără ln: când probabilitatea de succes per pas e *constantă*, E[încercări] e constantă.' } },
      { text: { en: 'Θ(n / ln n)', ro: 'Θ(n / ln n)' }, correct: false, feedback: { en: 'Not related to any quantity here; the geometric-distribution mean is 1/p, which does not depend on n asymptotically.', ro: 'Fără legătură cu nimic aici; media geometricei e 1/p, care nu depinde asimptotic de n.' } },
    ],
    explanation: {
      en: 'Each position independently has P(even) = ⌈n/2⌉/n ≈ 1/2. The number of iterations follows a geometric distribution with expected value 1/p ≈ 2. This is Θ(1).',
      ro: 'Fiecare poziție are independent P(par) = ⌈n/2⌉/n ≈ 1/2. Numărul de iterații urmează o distribuție geometrică cu valoare așteptată 1/p ≈ 2. Aceasta este Θ(1).',
    },
  }];

  /* ─── Problem 5: Permutation generation algorithms ─── */
  const mc5a = [{
    question: { en: 'Why does the naive shuffle algorithm (swap with uniform j from [0..n-1]) NOT produce each permutation with equal probability?', ro: 'De ce algoritmul naiv de amestecare (swap cu j uniform din [0..n-1]) NU produce fiecare permutare cu probabilitate egală?' },
    options: [
      { text: { en: 'There are nⁿ equally likely execution paths but n! permutations, and nⁿ is not divisible by n! for n ≥ 3', ro: 'Există nⁿ căi de execuție echiprobabile dar n! permutări, iar nⁿ nu este divizibil cu n! pentru n ≥ 3' }, correct: true },
      { text: { en: 'The algorithm never swaps an element with itself', ro: 'Algoritmul nu interschimbă niciodată un element cu el însuși' }, correct: false, feedback: { en: 'It can — j = i is allowed, producing a self-swap (identity). That would not by itself cause bias.', ro: 'Poate — j = i este admis, producând un self-swap (identitate). Asta în sine nu ar cauza un bias.' } },
      { text: { en: 'The algorithm only produces sorted permutations', ro: 'Algoritmul produce doar permutări sortate' }, correct: false, feedback: { en: 'It produces every permutation with positive probability; the bug is uneven probabilities, not missing outcomes.', ro: 'Produce orice permutare cu probabilitate pozitivă; bug-ul e în probabilitățile inegale, nu în rezultatele lipsă.' } },
      { text: { en: 'The algorithm runs in O(n²) which is too slow to be correct', ro: 'Algoritmul rulează în O(n²) ceea ce este prea lent pentru a fi corect' }, correct: false, feedback: { en: 'Complexity has nothing to do with distributional correctness; it is actually O(n). The bug is statistical.', ro: 'Complexitatea nu are legătură cu corectitudinea distribuțională; de fapt e O(n). Bug-ul e statistic.' } },
    ],
    explanation: {
      en: 'Each iteration picks j uniformly from n choices, giving nⁿ total paths. Since nⁿ mod n! ≠ 0 for n ≥ 3, some permutations must appear more often than others. For n=3: 3³=27 paths but 3!=6 permutations, and 27/6 = 4.5.',
      ro: 'Fiecare iterație alege j uniform din n posibilități, dând nⁿ căi totale. Deoarece nⁿ mod n! ≠ 0 pentru n ≥ 3, unele permutări trebuie să apară mai des decât altele. Pentru n=3: 3³=27 căi dar 3!=6 permutări, iar 27/6 = 4.5.',
    },
  }];

  const mc5b = [{
    question: { en: 'What is the time complexity of the original Fisher-Yates algorithm?', ro: 'Care este complexitatea de timp a algoritmului Fisher-Yates original?' },
    options: [
      { text: { en: 'O(n²)', ro: 'O(n²)' }, correct: true },
      { text: { en: 'O(n)', ro: 'O(n)' }, correct: false, feedback: { en: 'The inner while scan is not O(1) — it walks the used[] array up to n times per outer iteration.', ro: 'Scanarea while interioară nu e O(1) — parcurge used[] până la n ori per iterație exterioară.' } },
      { text: { en: 'O(n · ln n)', ro: 'O(n · ln n)' }, correct: false, feedback: { en: 'No logarithm here; the inner scan is linear in the remaining unused count.', ro: 'Fără logaritm aici; scanarea interioară e liniară în nr. rămase.' } },
      { text: { en: 'O(n³)', ro: 'O(n³)' }, correct: false, feedback: { en: 'Too much: only the inner while adds an extra O(n); the outer loop already has n iterations.', ro: 'Prea mult: doar while-ul interior adaugă O(n); bucla exterioară are deja n iterații.' } },
    ],
    explanation: {
      en: 'In each iteration i, the while loop scans the used[] array to find the k-th unused element. In the worst case it scans up to n elements. Over n iterations, total scans ≈ n + (n−1) + ... + 1 = n(n+1)/2 = O(n²).',
      ro: 'La fiecare iterație i, bucla while parcurge vectorul used[] pentru a găsi al k-lea element nefolosit. În cel mai rău caz parcurge până la n elemente. Pe n iterații, parcurgeri totale ≈ n + (n−1) + ... + 1 = n(n+1)/2 = O(n²).',
    },
  }];

  const mc5c = [{
    question: { en: 'What is the time complexity of the optimized Fisher-Yates algorithm?', ro: 'Care este complexitatea de timp a algoritmului Fisher-Yates optimizat?' },
    options: [
      { text: { en: 'O(n)', ro: 'O(n)' }, correct: true },
      { text: { en: 'O(n²)', ro: 'O(n²)' }, correct: false, feedback: { en: 'That is the *original* Fisher-Yates; the optimized version avoids the inner scan by swapping with a random prior position.', ro: 'Aceea e Fisher-Yates *original*; versiunea optimizată evită scanarea interioară prin swap cu o poziție anterioară aleatoare.' } },
      { text: { en: 'O(n · ln n)', ro: 'O(n · ln n)' }, correct: false, feedback: { en: 'No log factor — just two linear passes.', ro: 'Fără factor log — doar două parcurgeri liniare.' } },
      { text: { en: 'O(1)', ro: 'O(1)' }, correct: false, feedback: { en: 'Cannot be sublinear: we must write n output positions.', ro: 'Nu poate fi subliniar: trebuie scrise n poziții de output.' } },
    ],
    explanation: {
      en: 'The optimized version does two passes of n iterations each: one to initialize p[i] = i, one to perform swaps. Each swap is O(1). Total = O(n).',
      ro: 'Versiunea optimizată face două parcurgeri de n iterații fiecare: una pentru inițializare p[i] = i, una pentru interschimbări. Fiecare swap este O(1). Total = O(n).',
    },
  }];

  /* ─── Problem 6: Min-finding with Fisher-Yates ─── */
  const mc6io = [{
    question: { en: 'Which I/O formalization best describes Problem 6?', ro: 'Care formalizare I/O descrie cel mai bine Problema 6?' },
    options: [
      { text: { en: 'Input: n ∈ ℕ, a: array of n distinct elements; Output: sum ∈ ℕ₀ (printed)', ro: 'Input: n ∈ ℕ, a: vector de n elemente distincte; Output: sumă ∈ ℕ₀ (afișată)' }, correct: true },
      { text: { en: 'Input: n ∈ ℕ, a: array of n distinct elements; Output: min ∈ ℝ', ro: 'Input: n ∈ ℕ, a: vector de n elemente distincte; Output: min ∈ ℝ' }, correct: false, feedback: { en: '`min` is internal; the algorithm prints `sum` (the counter), not `min`.', ro: '`min` e internă; algoritmul afișează `sum` (contorul), nu `min`.' } },
      { text: { en: 'Input: n ∈ ℕ; Output: permutation p', ro: 'Input: n ∈ ℕ; Output: permutare p' }, correct: false, feedback: { en: 'The Fisher-Yates call produces p, but it is an internal step; the final output is `sum`.', ro: 'Apelul Fisher-Yates produce p, dar e un pas intern; output-ul final e `sum`.' } },
      { text: { en: 'Input: n ∈ ℕ, a: array; Output: sorted array', ro: 'Input: n ∈ ℕ, a: vector; Output: vector sortat' }, correct: false, feedback: { en: 'Never sorts; only scans a in a shuffled order while tracking the running min.', ro: 'Nu sortează niciodată; doar parcurge a într-o ordine amestecată urmărind min-ul curent.' } },
    ],
    explanation: {
      en: 'The algorithm takes an array a of n distinct elements, shuffles access order via Fisher-Yates, and prints sum — a counter incremented n times for each new minimum found.',
      ro: 'Algoritmul primește un tablou a de n elemente distincte, amestecă ordinea de acces prin Fisher-Yates și afișează sum — un contor incrementat de n ori pentru fiecare nou minim găsit.',
    },
  }];

  const mc6comp = [{
    question: { en: 'What is the average-case time complexity of Problem 6\'s algorithm (excluding the Fisher-Yates call)?', ro: 'Care este complexitatea medie de timp a algoritmului din Problema 6 (excluzând apelul Fisher-Yates)?' },
    options: [
      { text: { en: 'Θ(n · ln n)', ro: 'Θ(n · ln n)' }, correct: true },
      { text: { en: 'Θ(n²)', ro: 'Θ(n²)' }, correct: false, feedback: { en: 'That is the worst case (already-sorted-descending order); a random order gives Hₙ ≈ ln n updates on average.', ro: 'Acela e cazul cel mai rău (ordine deja descrescătoare); o ordine aleatorie dă Hₙ ≈ ln n actualizări în medie.' } },
      { text: { en: 'Θ(n)', ro: 'Θ(n)' }, correct: false, feedback: { en: 'Ignores the inner loop; each expected update triggers n extra steps.', ro: 'Ignoră bucla interioară; fiecare actualizare așteptată declanșează n pași în plus.' } },
      { text: { en: 'Θ(n² · ln n)', ro: 'Θ(n² · ln n)' }, correct: false, feedback: { en: 'Only one n factor from the outer loop — the number of inner-loop triggers is Θ(ln n), not Θ(n log n).', ro: 'Doar un factor n din bucla exterioară — numărul de declanșări al buclei interioare e Θ(ln n), nu Θ(n log n).' } },
    ],
    explanation: {
      en: 'Fisher-Yates produces a uniform random permutation, so a[p[0]], a[p[1]], ... is a random ordering of distinct elements. The analysis is identical to Problem 1: outer loop runs n−1 iterations; expected min updates = H_n − 1, each costs n inner steps. Total = (n−1) + n·(H_n − 1) = n·H_n − 1 = Θ(n log n).',
      ro: 'Fisher-Yates produce o permutare aleatorie uniformă, deci a[p[0]], a[p[1]], ... este o ordine aleatorie a elementelor distincte. Analiza este identică cu Problema 1: bucla exterioară face n−1 iterații; actualizări min așteptate = H_n − 1, fiecare costând n pași interiori. Total = (n−1) + n·(H_n − 1) = n·H_n − 1 = Θ(n log n).',
    },
  }];

  return (
    <>
      <p className="mb-4 text-sm opacity-80">
        {t('Source: Algorithm Design Seminar 4 — Probabilistic Algorithms, Average Complexity (Cont.), UAIC 2026.',
          'Sursa: Seminar PA 4 — Algoritmi probabiliști, Complexitatea medie (cont.), UAIC 2026.')}
      </p>

      {/* ═══════ Problem 1 ═══════ */}
      <h3 className="text-lg font-bold mt-6 mb-2" style={{ color: 'var(--theme-content-text)' }}>
        {t('Problem 1: Max-Tracking with Inner Loop', 'Problema 1: Urmărirea maximului cu buclă interioară')}
      </h3>
      <Box type="definition">
        <p className="text-sm">
          {t('Given a natural number n and a vector v containing a random permutation of {1,...,n} (each permutation equally likely), analyze the following algorithm. What is the average execution time?',
            'Fie un număr natural n și un vector v conținând o permutare aleatorie a {1,...,n} (fiecare permutare echiprobabilă). Analizați următorul algoritm. Care este timpul mediu de execuție?')}
        </p>
      </Box>
      <Code>{`max = v[0];
sum = 0;
for (i = 0; i < n; ++i) {
  if (v[i] > max) {
    max = v[i];
    for (j = 0; j < n; ++j) {   // inner for loop
      sum = sum + 1;
    }
  }
}
return sum;`}</Code>

      <p className="text-sm font-semibold mt-3 mb-1">{t('I/O Formalization', 'Formalizare I/O')}</p>
      <MultipleChoice questions={mc1io} />

      <p className="text-sm font-semibold mt-3 mb-1">{t('Average Complexity', 'Complexitate medie')}</p>
      <MultipleChoice questions={mc1comp} />

      <Toggle
        question={t('Show derivation', 'Arată derivarea')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">{t('Key Insight', 'Ideea cheie')}</p>
            <p className="text-sm mb-2">
              {t('The inner for loop executes n iterations each time a new maximum is found. We need to compute the expected number of times a new maximum appears.',
                'Bucla for interioară se execută de n ori de fiecare dată când se găsește un nou maxim. Trebuie să calculăm numărul așteptat de apariții ale unui nou maxim.')}
            </p>

            <p className="font-bold mb-1">{t('Derivation', 'Derivare')}</p>
            <p className="text-sm mb-2">
              {t('Let Xᵢ be the indicator: Xᵢ = 1 if v[i] > max(v[0],...,v[i−1]) (defined for i ≥ 1; X₀ is not counted because max is initialized to v[0] with no update). In a random permutation, v[i] is the maximum of v[0],...,v[i] with probability 1/(i+1). Therefore:',
                'Fie Xᵢ indicatorul: Xᵢ = 1 dacă v[i] > max(v[0],...,v[i−1]) (definit pentru i ≥ 1; X₀ nu se numără deoarece max este inițializat cu v[0], fără actualizare). Într-o permutare aleatorie, v[i] este maximul lui v[0],...,v[i] cu probabilitate 1/(i+1). Prin urmare:')}
            </p>
            <Code>{`E[number of max updates] = Σᵢ₌₁ⁿ⁻¹ P(Xᵢ = 1)
                        = Σᵢ₌₁ⁿ⁻¹ 1/(i+1)
                        = 1/2 + 1/3 + ... + 1/n
                        = Hₙ − 1
                        ≈ ln n − 1`}</Code>
            <p className="text-sm mb-2">
              {t('Each max update triggers n inner loop iterations. The outer loop itself does n iterations. Total average cost:',
                'Fiecare actualizare a maximului declanșează n iterații ale buclei interioare. Bucla exterioară face ea însăși n iterații. Costul mediu total:')}
            </p>
            <Box type="theorem">
              <p className="text-sm">T(n) = n + n · (Hₙ − 1) = n · Hₙ ≈ n · (ln n + γ) = Θ(n · ln n)</p>
            </Box>
          </div>
        }
      />

      {/* ═══════ Problem 2 ═══════ */}
      <h3 className="text-lg font-bold mt-8 mb-2" style={{ color: 'var(--theme-content-text)' }}>
        {t('Problem 2: Inversion-Counting with Inner Loop', 'Problema 2: Numărarea inversiunilor cu buclă interioară')}
      </h3>
      <Box type="definition">
        <p className="text-sm">
          {t('Given n and a vector v containing a random permutation of {0,...,n−1}, analyze the following algorithm. What is the average execution time?',
            'Fie n și un vector v conținând o permutare aleatorie a {0,...,n−1}. Analizați următorul algoritm. Care este timpul mediu de execuție?')}
        </p>
      </Box>
      <Code>{`sum = 0;
for (i = 0; i < n - 1; ++i) {
  for (j = i + 1; j < n; ++j) {
    if (v[i] > v[j]) {
      for (k = 0; k < n; ++k) {   // inner for loop
        sum = sum + 1;
      }
    }
  }
}
return sum;`}</Code>

      <p className="text-sm font-semibold mt-3 mb-1">{t('I/O Formalization', 'Formalizare I/O')}</p>
      <MultipleChoice questions={mc2io} />

      <p className="text-sm font-semibold mt-3 mb-1">{t('Average Complexity', 'Complexitate medie')}</p>
      <MultipleChoice questions={mc2comp} />

      <Toggle
        question={t('Show derivation', 'Arată derivarea')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">{t('Key Insight', 'Ideea cheie')}</p>
            <p className="text-sm mb-2">
              {t('The inner loop runs n times for each inversion (pair (i,j) where i < j and v[i] > v[j]). We need the expected number of inversions in a random permutation.',
                'Bucla interioară se execută de n ori pentru fiecare inversiune (pereche (i,j) unde i < j și v[i] > v[j]). Avem nevoie de numărul așteptat de inversiuni într-o permutare aleatorie.')}
            </p>

            <p className="font-bold mb-1">{t('Derivation', 'Derivare')}</p>
            <p className="text-sm mb-2">
              {t('For any pair of distinct positions (i,j) with i < j, in a random permutation P(v[i] > v[j]) = 1/2 (by symmetry — each of the two orderings is equally likely).',
                'Pentru orice pereche de poziții distincte (i,j) cu i < j, într-o permutare aleatorie P(v[i] > v[j]) = 1/2 (prin simetrie — fiecare din cele două ordini este la fel de probabilă).')}
            </p>
            <Code>{`E[inversions] = Σ P(v[i] > v[j])  for all i < j
              = C(n,2) · 1/2
              = n(n−1)/2 · 1/2
              = n(n−1)/4`}</Code>
            <p className="text-sm mb-2">
              {t('Each inversion triggers n inner loop iterations:', 'Fiecare inversiune declanșează n iterații ale buclei interioare:')}
            </p>
            <Box type="theorem">
              <p className="text-sm">E[T(n)] = n · n(n−1)/4 + C(n,2) = n²(n−1)/4 + n(n−1)/2 = Θ(n³)</p>
            </Box>
          </div>
        }
      />

      {/* ═══════ Problem 3 ═══════ */}
      <h3 className="text-lg font-bold mt-8 mb-2" style={{ color: 'var(--theme-content-text)' }}>
        {t('Problem 3: Break on First Even Element', 'Problema 3: Oprire la primul element par')}
      </h3>
      <Box type="definition">
        <p className="text-sm">
          {t('Given n and a vector v containing a random permutation of {0,...,n−1}, analyze the following algorithm. What is the average execution time?',
            'Fie n și un vector v conținând o permutare aleatorie a {0,...,n−1}. Analizați următorul algoritm. Care este timpul mediu de execuție?')}
        </p>
      </Box>
      <Code>{`for (i = 0; i < n; ++i) {
  if (v[i] % 2 == 0) {
    break;
  }
}
return 0;`}</Code>

      <p className="text-sm font-semibold mt-3 mb-1">{t('I/O Formalization', 'Formalizare I/O')}</p>
      <MultipleChoice questions={mc3io} />

      <p className="text-sm font-semibold mt-3 mb-1">{t('Average Complexity', 'Complexitate medie')}</p>
      <MultipleChoice questions={mc3comp} />

      <Toggle
        question={t('Show derivation', 'Arată derivarea')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">{t('Key Insight', 'Ideea cheie')}</p>
            <p className="text-sm mb-2">
              {t('The algorithm stops at the first even element. In {0,...,n−1}, there are ⌈n/2⌉ even numbers. We need the expected position of the first even number in a random permutation.',
                'Algoritmul se oprește la primul element par. În {0,...,n−1}, există ⌈n/2⌉ numere pare. Trebuie să găsim poziția așteptată a primului număr par într-o permutare aleatorie.')}
            </p>

            <p className="font-bold mb-1">{t('Derivation', 'Derivare')}</p>
            <p className="text-sm mb-2">
              {t('Let m = ⌈n/2⌉ be the number of even elements among {0,...,n−1}. Consider the n−m = ⌊n/2⌋ odd elements as "failures" and the m even elements as "successes". The expected position of the first success among n elements with m successes is:',
                'Fie m = ⌈n/2⌉ numărul de elemente pare din {0,...,n−1}. Considerăm cele n−m = ⌊n/2⌋ elemente impare ca „eșecuri" și cele m elemente pare ca „succese". Poziția așteptată a primului succes printre n elemente cu m succese este:')}
            </p>
            <p className="text-sm mb-2">
              {t('By symmetry, the m successes partition the n−m failures into m+1 gaps of equal expected size (n−m)/(m+1); the first success sits at position 1 plus the first gap\'s size:',
                'Prin simetrie, cele m succese împart cele n−m eșecuri în m+1 goluri de dimensiune așteptată egală (n−m)/(m+1); primul succes se află la poziția 1 plus dimensiunea primului gol:')}
            </p>
            <Code>{`E[iterations] = (n + 1) / (m + 1)
              = (n + 1) / (⌈n/2⌉ + 1)
              ≈ 2  for large n`}</Code>
            <Box type="theorem">
              <p className="text-sm">E[T(n)] = (n + 1) / (⌈n/2⌉ + 1) = Θ(1)</p>
            </Box>
            <Box type="warning">
              <p className="text-sm">
                {t('Note: the worst case is still Θ(n) — when all odd elements come first in the permutation. But on average, we find an even element after about 2 steps.',
                  'Notă: cazul cel mai rău este tot Θ(n) — când toate elementele impare vin primele în permutare. Dar în medie, găsim un element par după aproximativ 2 pași.')}
              </p>
            </Box>
          </div>
        }
      />

      {/* ═══════ Problem 4 ═══════ */}
      <h3 className="text-lg font-bold mt-8 mb-2" style={{ color: 'var(--theme-content-text)' }}>
        {t('Problem 4: i.i.d. Uniform Model (Not Permutations)', 'Problema 4: Modelul i.i.d. uniform (nu permutări)')}
      </h3>
      <Box type="definition">
        <p className="text-sm">
          {t('Solve Problems 1–3 for the case where v[i] is an independent uniform random value from {0,...,n−1} (values can repeat, v is not necessarily a permutation).',
            'Rezolvați Problemele 1–3 pentru cazul în care v[i] este o valoare aleatorie uniformă independentă din {0,...,n−1} (valorile se pot repeta, v nu este neapărat o permutare).')}
        </p>
      </Box>

      <p className="text-sm font-semibold mt-3 mb-1">{t('Key Difference', 'Diferența cheie')}</p>
      <MultipleChoice questions={mc4diff} />

      <p className="text-sm font-semibold mt-3 mb-1">{t('Problem 1 — i.i.d. variant', 'Problema 1 — varianta i.i.d.')}</p>
      <MultipleChoice questions={mc4p1} />

      <p className="text-sm font-semibold mt-3 mb-1">{t('Problem 2 — i.i.d. variant', 'Problema 2 — varianta i.i.d.')}</p>
      <MultipleChoice questions={mc4p2} />

      <p className="text-sm font-semibold mt-3 mb-1">{t('Problem 3 — i.i.d. variant', 'Problema 3 — varianta i.i.d.')}</p>
      <MultipleChoice questions={mc4p3} />

      <Toggle
        question={t('Show detailed analysis for all three', 'Arată analiza detaliată pentru toate trei')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">{t('(a) Problem 1 — Max tracking, i.i.d.', '(a) Problema 1 — Urmărirea maximului, i.i.d.')}</p>
            <p className="text-sm mb-2">
              {t('With i.i.d. values from {0,...,n−1}, the probability that v[i] is a strict new maximum given i previous values can be computed. For large n, P(new max at position i) → 1/(i+1), same as the permutation case. The expected number of max updates remains Hₙ − 1 (the initial assignment to v[0] is not counted as an update), and the total work n + n·(Hₙ − 1) = n·Hₙ gives average complexity Θ(n · ln n).',
                'Cu valori i.i.d. din {0,...,n−1}, probabilitatea ca v[i] să fie un nou maxim strict dat fiind i valori anterioare poate fi calculată. Pentru n mare, P(nou maxim la poziția i) → 1/(i+1), la fel ca în cazul permutărilor. Numărul așteptat de actualizări ale maximului rămâne Hₙ − 1 (atribuirea inițială pentru v[0] nu se numără ca actualizare), iar lucrul total n + n·(Hₙ − 1) = n·Hₙ dă complexitatea medie Θ(n · ln n).')}
            </p>

            <p className="font-bold mt-4 mb-1">{t('(b) Problem 2 — Inversions, i.i.d.', '(b) Problema 2 — Inversiuni, i.i.d.')}</p>
            <p className="text-sm mb-2">
              {t('For independent uniform values X, Y from {0,...,n−1}: P(X > Y) = n(n−1)/2 / n² = (n−1)/(2n). Expected "inversions" = C(n,2) · (n−1)/(2n) = (n−1)²/4. Each triggers n inner iterations, so total = n · (n−1)²/4 = Θ(n³).',
                'Pentru valori uniforme independente X, Y din {0,...,n−1}: P(X > Y) = n(n−1)/2 / n² = (n−1)/(2n). „Inversiuni" așteptate = C(n,2) · (n−1)/(2n) = (n−1)²/4. Fiecare declanșează n iterații interioare, deci total = n · (n−1)²/4 = Θ(n³).')}
            </p>

            <p className="font-bold mt-4 mb-1">{t('(c) Problem 3 — First even, i.i.d.', '(c) Problema 3 — Primul par, i.i.d.')}</p>
            <p className="text-sm mb-2">
              {t('Each v[i] is independently even with probability p = ⌈n/2⌉/n ≈ 1/2. The number of iterations until the first even element follows a geometric distribution: E[iterations] = 1/p ≈ 2. Still Θ(1), but the reasoning is simpler than the permutation case — independence makes it a standard geometric random variable.',
                'Fiecare v[i] este independent par cu probabilitate p = ⌈n/2⌉/n ≈ 1/2. Numărul de iterații până la primul element par urmează o distribuție geometrică: E[iterații] = 1/p ≈ 2. Tot Θ(1), dar raționamentul este mai simplu decât cazul permutărilor — independența face din aceasta o variabilă geometrică standard.')}
            </p>
            <Box type="warning">
              <p className="text-sm">
                {t('Key difference: for permutations, the positions are dependent (knowing v[0] constrains v[1],...,v[n−1]). For i.i.d., positions are independent. Despite this, the asymptotic complexities happen to match for all three problems.',
                  'Diferența cheie: pentru permutări, pozițiile sunt dependente (cunoașterea lui v[0] constrânge v[1],...,v[n−1]). Pentru i.i.d., pozițiile sunt independente. În ciuda acestui fapt, complexitățile asimptotice coincid pentru toate cele trei probleme.')}
              </p>
            </Box>
          </div>
        }
      />

      {/* ═══════ Problem 5 ═══════ */}
      <h3 className="text-lg font-bold mt-8 mb-2" style={{ color: 'var(--theme-content-text)' }}>
        {t('Problem 5: Permutation Generation Algorithms', 'Problema 5: Algoritmi de generare a permutărilor')}
      </h3>
      <Box type="definition">
        <p className="text-sm">
          {t('Design a probabilistic algorithm that takes n as input and outputs a permutation of order n, where each permutation is equally likely.',
            'Proiectați un algoritm probabilist care primește n la intrare și produce o permutare de ordin n, fiecare permutare fiind echiprobabilă.')}
        </p>
      </Box>

      <p className="text-sm font-semibold mt-3 mb-1">{t('(a) Why is the naive shuffle incorrect?', '(a) De ce este amestecarea naivă incorectă?')}</p>
      <Code>{`for (i = 0; i < n; ++i) {
  p[i] = i;
}
for (i = 0; i < n; ++i) {
  uniform j from [0..n-1];
  temp = p[i];
  p[i] = p[j];
  p[j] = temp;
}`}</Code>
      <MultipleChoice questions={mc5a} />

      <p className="text-sm font-semibold mt-3 mb-1">{t('(b) Fisher-Yates original — complexity', '(b) Fisher-Yates original — complexitate')}</p>
      <Code>{`fisher_yates(n) {
  used = [ 0 | i from [1..n]];
  notused = n;
  for (i = 0; i < n; ++i) {
    k = uniformNat(notused);
    j = 0;
    while (j < n) {
      if (used[j] == 0) {
        if (k == 0) { break; }
        k = k - 1;
      }
      j = j + 1;
    }
    p[i] = j;
    used[j] = 1;
    notused = notused - 1;
  }
  return p;
}`}</Code>
      <MultipleChoice questions={mc5b} />

      <p className="text-sm font-semibold mt-3 mb-1">{t('(c) Fisher-Yates optimized — complexity', '(c) Fisher-Yates optimizat — complexitate')}</p>
      <Code>{`fisher_yates(n) {
  for (i = 0; i < n; ++i) {
    p[i] = i;
  }
  for (i = 0; i < n; ++i) {
    uniform j from [0..i];
    temp = p[i];
    p[i] = p[j];
    p[j] = temp;
  }
  return p;
}`}</Code>
      <MultipleChoice questions={mc5c} />

      <Toggle
        question={t('Show correctness proofs & analysis', 'Arată demonstrațiile de corectitudine și analiza')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">{t('(a) Naive shuffle — why it fails', '(a) Amestecarea naivă — de ce eșuează')}</p>
            <p className="text-sm mb-2">
              {t('For n = 3, there are n³ = 27 equally likely execution paths (each iteration picks j from {0,1,2}). But there are n! = 6 permutations. Since 27 is not divisible by 6, some permutations must be more likely than others.',
                'Pentru n = 3, există n³ = 27 căi de execuție echiprobabile (fiecare iterație alege j din {0,1,2}). Dar există n! = 6 permutări. Deoarece 27 nu este divizibil cu 6, unele permutări trebuie să fie mai probabile decât altele.')}
            </p>
            <p className="text-sm mb-2">
              {t('Enumerating all 27 outcomes for n = 3:', 'Enumerând toate cele 27 rezultate pentru n = 3:')}
            </p>
            <Code>{`Starting: [0, 1, 2]
Permutation  | Count | Probability
(0, 1, 2)    |   4   |  4/27
(0, 2, 1)    |   5   |  5/27
(1, 0, 2)    |   5   |  5/27
(1, 2, 0)    |   5   |  5/27
(2, 0, 1)    |   4   |  4/27
(2, 1, 0)    |   4   |  4/27`}</Code>
            <Box type="warning">
              <p className="text-sm">
                {t('The probabilities are not equal! Some permutations appear 5/27 of the time while others appear 4/27.',
                  'Probabilitățile nu sunt egale! Unele permutări apar de 5/27 din timp, în timp ce altele apar de 4/27.')}
              </p>
            </Box>

            <p className="font-bold mt-4 mb-1">{t('(b) Fisher-Yates original — correctness', '(b) Fisher-Yates original — corectitudine')}</p>
            <p className="text-sm mb-2">
              {t('At step i, there are (n−i) unused elements. The algorithm picks a uniform random index k among them (uniformNat(notused)), then finds the k-th unused element by scanning. This means each unused element is equally likely to be chosen. By induction: the first element is chosen uniformly from n elements (probability 1/n), the second from n−1 remaining (probability 1/(n−1)), etc. Total probability of any permutation = 1/n · 1/(n−1) · ... · 1/1 = 1/n!',
                'La pasul i, există (n−i) elemente nefolosite. Algoritmul alege un index aleator uniform k printre ele (uniformNat(notused)), apoi găsește al k-lea element nefolosit prin scanare. Aceasta înseamnă că fiecare element nefolosit este la fel de probabil să fie ales. Prin inducție: primul element este ales uniform din n elemente (probabilitate 1/n), al doilea din n−1 rămase (probabilitate 1/(n−1)), etc. Probabilitatea totală a oricărei permutări = 1/n · 1/(n−1) · ... · 1/1 = 1/n!')}
            </p>
            <Box type="theorem">
              <p className="text-sm">
                {t('Complexity: O(n²). The while loop scans up to n elements in each of the n iterations. Total work ≈ n + (n−1) + ... + 1 = n(n+1)/2.',
                  'Complexitate: O(n²). Bucla while parcurge până la n elemente în fiecare din cele n iterații. Lucru total ≈ n + (n−1) + ... + 1 = n(n+1)/2.')}
              </p>
            </Box>

            <p className="font-bold mt-4 mb-1">{t('(c) Fisher-Yates optimized — correctness by induction', '(c) Fisher-Yates optimizat — corectitudine prin inducție')}</p>
            <p className="text-sm mb-2">
              {t('Claim: after iteration i (for i ∈ {1,...,n}), positions 0,...,i−1 contain each permutation of i elements from {0,...,n−1} with equal probability.',
                'Afirmație: după iterația i (pentru i ∈ {1,...,n}), pozițiile 0,...,i−1 conțin fiecare permutare de i elemente din {0,...,n−1} cu probabilitate egală.')}
            </p>
            <p className="text-sm mb-2">
              {t('Base case (i = 1): p[0] is swapped with p[j] where j = 0 (since uniform from [0..0]). So p[0] = 0, the only permutation of one element. ✓',
                'Cazul de bază (i = 1): p[0] este interschimbat cu p[j] unde j = 0 (deoarece uniform din [0..0]). Deci p[0] = 0, singura permutare a unui element. ✓')}
            </p>
            <p className="text-sm mb-2">
              {t('Inductive step: assume after iteration i, the first i positions hold each permutation of {0,...,i−1} with probability 1/i!. At iteration i+1, j is uniform from [0..i], so p[i] is swapped with any of p[0],...,p[i] equally. Each element has probability 1/(i+1) of ending up at position i, and the remaining i positions hold each permutation with probability 1/i! · i/(i+1) · ... This gives probability 1/(i+1)! for each permutation of i+1 elements. ✓',
                'Pasul inductiv: presupunem că după iterația i, primele i poziții conțin fiecare permutare a {0,...,i−1} cu probabilitate 1/i!. La iterația i+1, j este uniform din [0..i], deci p[i] este interschimbat cu oricare din p[0],...,p[i] cu probabilitate egală. Fiecare element are probabilitate 1/(i+1) să ajungă pe poziția i, iar celelalte i poziții conțin fiecare permutare cu probabilitate 1/i! · i/(i+1) · ... Aceasta dă probabilitate 1/(i+1)! pentru fiecare permutare de i+1 elemente. ✓')}
            </p>
            <Box type="theorem">
              <p className="text-sm">
                {t('Complexity: O(n). Two linear passes (initialization + swaps), each swap is O(1).',
                  'Complexitate: O(n). Două parcurgeri liniare (inițializare + interschimbări), fiecare swap este O(1).')}
              </p>
            </Box>
          </div>
        }
      />

      {/* ═══════ Problem 6 ═══════ */}
      <h3 className="text-lg font-bold mt-8 mb-2" style={{ color: 'var(--theme-content-text)' }}>
        {t('Problem 6: Min-Finding with Fisher-Yates Shuffle', 'Problema 6: Găsirea minimului cu amestecarea Fisher-Yates')}
      </h3>
      <Box type="definition">
        <p className="text-sm">
          {t('Given an array a of n distinct elements, the algorithm shuffles the access order using Fisher-Yates, then finds the minimum while counting inner loop executions. What is the average execution time?',
            'Dat un tablou a de n elemente distincte, algoritmul amestecă ordinea de acces folosind Fisher-Yates, apoi găsește minimul numărând execuțiile buclei interioare. Care este timpul mediu de execuție?')}
        </p>
      </Box>
      <Code>{`p = fisher_yates(n);
min = a[p[0]];
sum = 0;
for (i = 1; i < n; ++i) {
  if (a[p[i]] < min) {
    min = a[p[i]];
    for (j = 0; j < n; ++j) {   // inner for loop
      sum = sum + 1;
    }
  }
}
print(sum);`}</Code>

      <p className="text-sm font-semibold mt-3 mb-1">{t('I/O Formalization', 'Formalizare I/O')}</p>
      <MultipleChoice questions={mc6io} />

      <p className="text-sm font-semibold mt-3 mb-1">{t('Average Complexity', 'Complexitate medie')}</p>
      <MultipleChoice questions={mc6comp} />

      <Toggle
        question={t('Show derivation', 'Arată derivarea')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">{t('Key Insight', 'Ideea cheie')}</p>
            <p className="text-sm mb-2">
              {t('Since Fisher-Yates produces a uniform random permutation p, the sequence a[p[0]], a[p[1]], ..., a[p[n−1]] is a uniform random ordering of the n distinct elements in a. The analysis reduces to Problem 1 (with min instead of max, but the symmetry is the same).',
                'Deoarece Fisher-Yates produce o permutare aleatorie uniformă p, secvența a[p[0]], a[p[1]], ..., a[p[n−1]] este o ordine aleatorie uniformă a celor n elemente distincte din a. Analiza se reduce la Problema 1 (cu min în loc de max, dar simetria este aceeași).')}
            </p>

            <p className="font-bold mb-1">{t('Derivation', 'Derivare')}</p>
            <p className="text-sm mb-2">
              {t('Let Xᵢ = 1 if a[p[i]] < min(a[p[0]],...,a[p[i−1]]). Since p is a uniform random permutation of distinct elements, a[p[i]] is the minimum of {a[p[0]],...,a[p[i]]} with probability 1/(i+1). This is identical to the max-tracking analysis:',
                'Fie Xᵢ = 1 dacă a[p[i]] < min(a[p[0]],...,a[p[i−1]]). Deoarece p este o permutare aleatorie uniformă a elementelor distincte, a[p[i]] este minimul lui {a[p[0]],...,a[p[i]]} cu probabilitate 1/(i+1). Aceasta este identică cu analiza urmăririi maximului:')}
            </p>
            <Code>{`E[min updates] = Σᵢ₌₁ⁿ⁻¹ 1/(i+1) = Hₙ − 1`}</Code>
            <Box type="theorem">
              <p className="text-sm">
                {t('Outer loop runs n−1 iterations; expected min updates = H_n − 1, each costs n inner steps. Total = (n−1) + n·(H_n − 1) = n·H_n − 1 = Θ(n log n). Including Fisher-Yates: O(n) + Θ(n log n) = Θ(n log n).',
                  'Bucla exterioară face n−1 iterații; actualizări min așteptate = H_n − 1, fiecare costând n pași interiori. Total = (n−1) + n·(H_n − 1) = n·H_n − 1 = Θ(n log n). Incluzând Fisher-Yates: O(n) + Θ(n log n) = Θ(n log n).')}
              </p>
            </Box>
          </div>
        }
      />
    </>
  );
}
