import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Toggle } from '../../../components/ui';
import MultipleChoice from '../../../components/ui/MultipleChoice';

export default function Seminar03() {
  const { t } = useApp();

  /* ─── Problem 1: Biased coin ─── */
  const mc1 = [{
    question: {
      en: 'Which is the correct I/O formalization for "Write a probabilistic algorithm that simulates a biased coin: heads with probability 5/9, tails with probability 4/9"?',
      ro: 'Care este formalizarea corectă I/O pentru „Scrieți un algoritm probabilist ce modelează aruncarea unui ban măsluit: cap cu probabilitatea 5/9 și pajură cu probabilitatea 4/9"?',
    },
    options: [
      { text: 'Input: (none); Output: "heads" with P = 5/9, "tails" with P = 4/9', correct: true },
      { text: 'Input: p ∈ (0,1); Output: "heads" with P = p, "tails" with P = 1−p', correct: false },
      { text: 'Input: (none); Output: "heads" with P = 1/2, "tails" with P = 1/2', correct: false },
      { text: 'Input: n — number of flips; Output: array of n results', correct: false },
    ],
    explanation: {
      en: 'The algorithm takes no input — the probabilities 5/9 and 4/9 are fixed by the problem. It outputs a single result with the specified bias, not a fair coin and not a parameterized one.',
      ro: 'Algoritmul nu primește input — probabilitățile 5/9 și 4/9 sunt fixate de problemă. Returnează un singur rezultat cu bias-ul specificat, nu un ban corect și nu unul parametrizat.',
    },
  }];

  /* ─── Problem 2: Geometric stopping ─── */
  const mc2a = [{
    question: {
      en: 'In the given probabilistic algorithm (flip coins until 0), what is the probability that the algorithm stops after exactly i iterations?',
      ro: 'În algoritmul probabilist dat (aruncă monezi până la 0), care este probabilitatea ca algoritmul să se oprească după exact i iterații?',
    },
    options: [
      { text: 'P(stop after i iterations) = (1/2)ⁱ', correct: true },
      { text: 'P(stop after i iterations) = 1/i', correct: false },
      { text: 'P(stop after i iterations) = (1/2)ⁱ⁻¹', correct: false },
      { text: 'P(stop after i iterations) = i · (1/2)ⁱ', correct: false },
    ],
    explanation: {
      en: 'To stop after exactly i iterations: we need x=1 for the first i−1 iterations (each with P=1/2) and x=0 on iteration i (P=1/2). Total: (1/2)ⁱ.',
      ro: 'Pentru a se opri după exact i iterații: avem nevoie de x=1 pentru primele i−1 iterații (fiecare cu P=1/2) și x=0 la iterația i (P=1/2). Total: (1/2)ⁱ.',
    },
  }];

  const mc2b = [{
    question: {
      en: 'Does the algorithm stop with probability 1 (almost surely)?',
      ro: 'Se oprește algoritmul cu probabilitate 1 (aproape sigur)?',
    },
    options: [
      { text: { en: 'Yes — Σᵢ₌₁^∞ (1/2)ⁱ = 1, so it stops almost surely', ro: 'Da — Σᵢ₌₁^∞ (1/2)ⁱ = 1, deci se oprește aproape sigur' }, correct: true },
      { text: { en: 'No — there is always a chance it runs forever', ro: 'Nu — există mereu o șansă să ruleze la infinit' }, correct: false },
      { text: { en: 'Yes — it stops after at most 100 iterations', ro: 'Da — se oprește după cel mult 100 de iterații' }, correct: false },
    ],
    explanation: {
      en: 'The probability of stopping is Σᵢ₌₁^∞ (1/2)ⁱ = 1. This is a geometric series. Although any single run could theoretically go on, the probability of never stopping is 0.',
      ro: 'Probabilitatea de oprire este Σᵢ₌₁^∞ (1/2)ⁱ = 1. Aceasta este o serie geometrică. Deși orice execuție ar putea teoretic continua, probabilitatea de a nu se opri niciodată este 0.',
    },
  }];

  /* ─── Problem 3: Majority element (nondeterministic, Las Vegas, Monte Carlo) ─── */
  const mc3 = [{
    question: {
      en: 'Which is the correct I/O formalization for "Given an array of natural numbers that contains a majority element, find it"?',
      ro: 'Care este formalizarea corectă I/O pentru „Dându-se un vector de numere naturale care conține un element majoritar, găsiți-l"?',
    },
    options: [
      { text: 'Input: a[0..n−1], a[i] ∈ ℕ, ∃x: #{i : a[i]=x} > ⌊n/2⌋; Output: x (the majority element)', correct: true },
      { text: 'Input: a[0..n−1]; Output: x if majority exists, else −1', correct: false },
      { text: 'Input: a[0..n−1]; Output: the element that appears most often', correct: false },
      { text: 'Input: a[0..n−1], x; Output: true if x is the majority element', correct: false },
    ],
    explanation: {
      en: 'The precondition guarantees a majority element exists — no need to handle the "not found" case. We must find the element itself, not just check a candidate. "Most frequent" ≠ majority (majority requires > n/2).',
      ro: 'Precondiția garantează că elementul majoritar există — nu trebuie tratat cazul „nu s-a găsit". Trebuie să găsim elementul în sine, nu doar să verificăm un candidat. „Cel mai frecvent" ≠ majoritar (majoritar necesită > n/2).',
    },
  }];

  const mc3type = [{
    question: {
      en: 'What is the key difference between the Las Vegas and Monte Carlo approaches for finding the majority element?',
      ro: 'Care este diferența cheie între abordările Las Vegas și Monte Carlo pentru găsirea elementului majoritar?',
    },
    options: [
      { text: { en: 'Las Vegas always returns the correct answer (may take variable time); Monte Carlo may return a wrong answer (bounded error probability)', ro: 'Las Vegas returnează mereu răspunsul corect (poate dura timp variabil); Monte Carlo poate returna un răspuns greșit (probabilitate de eroare mărginită)' }, correct: true },
      { text: { en: 'Las Vegas is deterministic; Monte Carlo is probabilistic', ro: 'Las Vegas este determinist; Monte Carlo este probabilistic' }, correct: false },
      { text: { en: 'Las Vegas is faster; Monte Carlo is slower but more accurate', ro: 'Las Vegas este mai rapid; Monte Carlo este mai lent dar mai precis' }, correct: false },
      { text: { en: 'They are the same — both names refer to randomized algorithms that always halt', ro: 'Sunt la fel — ambele denumiri se referă la algoritmi randomizați care se opresc mereu' }, correct: false },
    ],
    explanation: {
      en: 'Las Vegas algorithms are always correct but have random running time. Monte Carlo algorithms always terminate in bounded time but may be incorrect with bounded probability. Both are probabilistic.',
      ro: 'Algoritmii Las Vegas sunt mereu corecți dar au timp de execuție aleator. Algoritmii Monte Carlo se termină mereu în timp mărginit dar pot fi incorecți cu probabilitate mărginită. Ambele sunt probabilistice.',
    },
  }];

  const mc3mc = [{
    question: {
      en: 'For the Monte Carlo majority algorithm, how many random trials are needed to bring the error probability below 1/2⁵⁰?',
      ro: 'Pentru algoritmul Monte Carlo majoritar, câte încercări aleatorii sunt necesare pentru a aduce probabilitatea de eroare sub 1/2⁵⁰?',
    },
    options: [
      { text: '50', correct: true },
      { text: '250', correct: false },
      { text: '25', correct: false },
      { text: '100', correct: false },
    ],
    explanation: {
      en: 'Each trial picks a random element. Since the majority appears > n/2 times, each trial has P > 1/2 of picking it. If we verify and it fails, P(error per trial) < 1/2. After k independent trials, P(all fail) < (1/2)ᵏ. For (1/2)ᵏ < 1/2⁵⁰, we need k = 50.',
      ro: 'Fiecare încercare alege un element aleator. Deoarece majoritarul apare de > n/2 ori, fiecare încercare are P > 1/2 de a-l alege. Dacă verificăm și eșuează, P(eroare per încercare) < 1/2. După k încercări independente, P(toate eșuează) < (1/2)ᵏ. Pentru (1/2)ᵏ < 1/2⁵⁰, avem nevoie de k = 50.',
    },
  }];

  /* ─── Problem 4: Sum of random bits ─── */
  const mc4 = [{
    question: {
      en: 'For the algorithm that sums n uniform random bits from {0,1}, what is the expected value of the output?',
      ro: 'Pentru algoritmul care sumează n biți aleatori uniformi din {0,1}, care este valoarea așteptată a output-ului?',
    },
    options: [
      { text: 'E[sum] = n/2', correct: true },
      { text: 'E[sum] = n', correct: false },
      { text: 'E[sum] = n²/4', correct: false },
      { text: 'E[sum] = √n', correct: false },
    ],
    explanation: {
      en: 'Each bit xᵢ has E[xᵢ] = 0·(1/2) + 1·(1/2) = 1/2. By linearity of expectation, E[sum] = Σᵢ₌₁ⁿ E[xᵢ] = n · (1/2) = n/2.',
      ro: 'Fiecare bit xᵢ are E[xᵢ] = 0·(1/2) + 1·(1/2) = 1/2. Prin liniaritatea speranței, E[sum] = Σᵢ₌₁ⁿ E[xᵢ] = n · (1/2) = n/2.',
    },
  }];

  /* ─── Problem 5: Fair die from rand2 ─── */
  const mc5 = [{
    question: {
      en: 'Which is the correct I/O formalization for "Using only rand2 (fair bit), write a function zar that returns a number from {0..5} each with probability 1/6"?',
      ro: 'Care este formalizarea corectă I/O pentru „Folosind doar rand2 (bit echiprobabil), scrieți o funcție zar care returnează un număr din {0..5} fiecare cu probabilitatea 1/6"?',
    },
    options: [
      { text: 'Input: (none, uses rand2); Output: x ∈ {0,1,2,3,4,5} with P(x) = 1/6 for each x', correct: true },
      { text: 'Input: n; Output: x ∈ {0..n−1} with P(x) = 1/n', correct: false },
      { text: 'Input: (none); Output: x ∈ {1..6} with P(x) = 1/6', correct: false },
      { text: 'Input: (none); Output: x ∈ {0..5} with P(x) ≈ 1/6 (approximate)', correct: false },
    ],
    explanation: {
      en: 'The output range is {0..5} (not {1..6}). The distribution must be exactly uniform (not approximate). No input parameter — the range 0-5 is fixed.',
      ro: 'Domeniul output-ului este {0..5} (nu {1..6}). Distribuția trebuie să fie exact uniformă (nu aproximativă). Fără parametru de intrare — intervalul 0-5 este fix.',
    },
  }];

  /* ─── Problem 6: Fair bit from biased coin ─── */
  const mc6 = [{
    question: {
      en: 'Which is the correct I/O formalization for "Given rand2p (returns 0 with unknown probability p, 1 with probability 1−p), write rand2corect returning 0 or 1 each with probability 0.5"?',
      ro: 'Care este formalizarea corectă I/O pentru „Dată rand2p (returnează 0 cu probabilitate necunoscută p, 1 cu probabilitate 1−p), scrieți rand2corect care returnează 0 sau 1 fiecare cu probabilitate 0.5"?',
    },
    options: [
      { text: 'Input: (none, uses rand2p); Output: x ∈ {0,1} with P(x=0) = P(x=1) = 0.5', correct: true },
      { text: 'Input: p ∈ (0,1); Output: x ∈ {0,1} with P(x) = 0.5', correct: false },
      { text: 'Input: (none); Output: x ∈ {0,1} with P(x=0) = p', correct: false },
      { text: 'Input: (none); Output: x ∈ {0,1} with P(x) ≈ 0.5 (approximate)', correct: false },
    ],
    explanation: {
      en: 'We don\'t know p, so it cannot be an input. The output must be exactly fair (P = 0.5), not approximate. The function uses rand2p internally but takes no arguments.',
      ro: 'Nu cunoaștem p, deci nu poate fi input. Output-ul trebuie să fie exact echiprobabil (P = 0.5), nu aproximativ. Funcția folosește rand2p intern dar nu primește argumente.',
    },
  }];

  /* ─── Problem 7: Uniform random from rand2 ─── */
  const mc7 = [{
    question: {
      en: 'Which is the correct I/O formalization for "Using only rand2, write a function random(n) that returns a number from {0..n−1} each with probability 1/n"?',
      ro: 'Care este formalizarea corectă I/O pentru „Folosind doar rand2, scrieți o funcție random(n) care returnează un număr din {0..n−1} fiecare cu probabilitate 1/n"?',
    },
    options: [
      { text: 'Input: n ∈ ℕ, n ≥ 1 (uses rand2); Output: x ∈ {0,1,…,n−1} with P(x) = 1/n for each x', correct: true },
      { text: 'Input: n; Output: x ∈ {1..n} with P(x) = 1/n', correct: false },
      { text: 'Input: (none); Output: x ∈ {0..n−1}', correct: false },
      { text: 'Input: n, k (number of bits); Output: x ∈ {0..n−1} with P(x) ≈ 1/n', correct: false },
    ],
    explanation: {
      en: 'The range is {0..n−1} (not {1..n}). n is an input parameter. The distribution must be exactly 1/n (not approximate). No extra parameter k is needed.',
      ro: 'Domeniul este {0..n−1} (nu {1..n}). n este parametru de intrare. Distribuția trebuie să fie exact 1/n (nu aproximativă). Nu este nevoie de un parametru extra k.',
    },
  }];

  /* ─── Problem 8: Subset sum variants (SSD1, SSD2, SSD3) ─── */
  const mc8 = [{
    question: {
      en: 'What type of computational problem is SSD1 (find the largest M* ≤ M that equals the sum of some subset of S)?',
      ro: 'Ce tip de problemă computațională este SSD1 (găsiți cel mai mare M* ≤ M egal cu suma unei submulțimi a lui S)?',
    },
    options: [
      { text: { en: 'Optimization problem — it asks for the maximum M* satisfying a constraint', ro: 'Problemă de optimizare — cere maximul M* care satisface o constrângere' }, correct: true },
      { text: { en: 'Decision problem — it asks yes/no', ro: 'Problemă de decizie — cere da/nu' }, correct: false },
      { text: { en: 'Search problem — it asks for any valid subset', ro: 'Problemă de căutare — cere orice submulțime validă' }, correct: false },
      { text: { en: 'Counting problem — it asks how many subsets sum to M', ro: 'Problemă de numărare — cere câte submulțimi au suma M' }, correct: false },
    ],
    explanation: {
      en: 'SSD1 asks for the largest integer M* ≤ M achievable as a subset sum. This is optimization: we want the best (maximum) value satisfying the constraint. SSD2 and SSD3 are decision problems (yes/no answers).',
      ro: 'SSD1 cere cel mai mare întreg M* ≤ M realizabil ca sumă de submulțime. Aceasta este optimizare: vrem cea mai bună (maximă) valoare care satisface constrângerea. SSD2 și SSD3 sunt probleme de decizie (răspunsuri da/nu).',
    },
  }];

  const mc8b = [{
    question: {
      en: 'For SSD3 ("Does there exist S\' ⊆ S such that Σ S\' = M?"), what does a nondeterministic algorithm do?',
      ro: 'Pentru SSD3 („Există S\' ⊆ S, a.î. Σ S\' = M?"), ce face un algoritm nedeterminist?',
    },
    options: [
      { text: { en: 'Guess a subset S\' ⊆ S, then verify deterministically that Σ S\' = M', ro: 'Ghicește o submulțime S\' ⊆ S, apoi verifică determinist că Σ S\' = M' }, correct: true },
      { text: { en: 'Try all 2ⁿ subsets and check each one', ro: 'Încearcă toate cele 2ⁿ submulțimi și verifică fiecare' }, correct: false },
      { text: { en: 'Use dynamic programming to solve it in polynomial time', ro: 'Folosește programare dinamică pentru a rezolva în timp polinomial' }, correct: false },
      { text: { en: 'Randomly sample subsets until one works', ro: 'Eșantionează aleator submulțimi până când una funcționează' }, correct: false },
    ],
    explanation: {
      en: 'A nondeterministic algorithm has two phases: (1) guess phase — nondeterministically choose a subset S\', (2) verify phase — deterministically compute Σ S\' and compare with M. The verify phase runs in O(n). Random sampling is a probabilistic approach, not nondeterministic.',
      ro: 'Un algoritm nedeterminist are două faze: (1) faza de ghicire — alege nedeterminist o submulțime S\', (2) faza de verificare — calculează determinist Σ S\' și compară cu M. Faza de verificare rulează în O(n). Eșantionarea aleatorie este o abordare probabilistică, nu nedeterministă.',
    },
  }];

  /* ─── Problem 9: 3-SAT ─── */
  const mc9a = [{
    question: {
      en: 'Which is the correct I/O formalization for the 3-satisfiability problem?',
      ro: 'Care este formalizarea corectă I/O pentru problema 3-satisfiabilității?',
    },
    options: [
      { text: 'Input: v[n][3] — 3-CNF formula matrix, n — number of clauses; Output: "yes" if satisfiable, "no" otherwise', correct: true },
      { text: 'Input: v[n][3], n; Output: a satisfying assignment if one exists', correct: false },
      { text: 'Input: a boolean formula; Output: the number of satisfying assignments', correct: false },
      { text: 'Input: v[n][3], n; Output: "yes" if all assignments satisfy the formula', correct: false },
    ],
    explanation: {
      en: 'The 3-SAT decision problem asks only whether the formula is satisfiable (yes/no), not to find or count assignments. "All assignments satisfy" would be validity, not satisfiability.',
      ro: '3-SAT ca problemă de decizie întreabă doar dacă formula este satisfiabilă (da/nu), nu cere să găsim sau să numărăm asignările. „Toate asignările satisfac" ar fi validitate, nu satisfiabilitate.',
    },
  }];

  const mc9b = [{
    question: {
      en: 'What is the key difference between 3-CNF satisfiability and 3-DNF validity?',
      ro: 'Care este diferența cheie între satisfiabilitatea 3-CNF și validitatea 3-DNF?',
    },
    options: [
      { text: { en: '3-CNF SAT asks "∃ assignment that makes all clauses true"; 3-DNF validity asks "∀ assignments, at least one term is true"', ro: '3-CNF SAT întreabă „∃ asignare care face toate clauzele adevărate"; validitatea 3-DNF întreabă „∀ asignările, cel puțin un termen este adevărat"' }, correct: true },
      { text: { en: 'They are equivalent problems — just different notation', ro: 'Sunt probleme echivalente — doar notație diferită' }, correct: false },
      { text: { en: '3-CNF SAT is hard (NP-complete) but 3-DNF SAT is easy; vice versa for validity', ro: '3-CNF SAT este greu (NP-complet) dar 3-DNF SAT este ușor; invers pentru validitate' }, correct: false },
    ],
    explanation: {
      en: 'For CNF: satisfiability = ∃ assignment making the AND of ORs true (NP-complete). For DNF: satisfiability is easy (just satisfy one term), but validity (∀ assignments → true) is co-NP-complete. The difficulty flips between satisfiability and validity when switching CNF/DNF.',
      ro: 'Pentru CNF: satisfiabilitatea = ∃ asignare care face ȘI-ul de SAU-uri adevărat (NP-complet). Pentru DNF: satisfiabilitatea este ușoară (satisfă un termen), dar validitatea (∀ asignări → adevărat) este co-NP-completă. Dificultatea se inversează între satisfiabilitate și validitate la schimbarea CNF/DNF.',
    },
  }];

  const mc9c = [{
    question: {
      en: 'Can you write a nondeterministic algorithm for 3-equivalence (checking if two 3-CNF formulas are equivalent)?',
      ro: 'Puteți scrie un algoritm nedeterminist pentru 3-echivalența (verificarea dacă două formule 3-CNF sunt echivalente)?',
    },
    options: [
      { text: { en: 'Not directly — but 3-non-equivalence has a nondeterministic algorithm (guess an assignment where they differ)', ro: 'Nu direct — dar 3-non-echivalența are un algoritm nedeterminist (ghicește o asignare unde diferă)' }, correct: true },
      { text: { en: 'Yes — guess an assignment and check both formulas agree on it', ro: 'Da — ghicește o asignare și verifică că ambele formule sunt de acord' }, correct: false },
      { text: { en: 'Yes — 3-equivalence and 3-non-equivalence are both in NP', ro: 'Da — 3-echivalența și 3-non-echivalența sunt ambele în NP' }, correct: false },
    ],
    explanation: {
      en: 'For 3-non-equivalence: guess an assignment, evaluate both formulas, check they give different results. For equivalence: you\'d need to verify that ALL assignments give the same result — a nondeterministic guess of one agreeing assignment doesn\'t prove equivalence. This is why equivalence is in co-NP, not obviously in NP.',
      ro: 'Pentru 3-non-echivalență: ghicește o asignare, evaluează ambele formule, verifică că dau rezultate diferite. Pentru echivalență: ar trebui să verifici că TOATE asignările dau același rezultat — o ghicire nedeterministă a unei asignări nu demonstrează echivalența. De aceea echivalența este în co-NP, nu evident în NP.',
    },
  }];

  const mc9d = [{
    question: {
      en: 'What is the worst-case time complexity of a deterministic brute-force algorithm for 3-SAT with n clauses over k variables?',
      ro: 'Care este complexitatea timp în cazul cel mai nefavorabil a unui algoritm determinist brute-force pentru 3-SAT cu n clauze peste k variabile?',
    },
    options: [
      { text: 'O(n · 2ᵏ)', correct: true },
      { text: 'O(2ⁿ)', correct: false },
      { text: 'O(n · k)', correct: false },
      { text: 'O(3ⁿ)', correct: false },
    ],
    explanation: {
      en: 'Enumerate all 2ᵏ possible truth assignments for k variables. For each assignment, evaluate the formula in O(n) (check each of the n clauses). Total: O(n · 2ᵏ). The exponential is in the number of variables, not clauses.',
      ro: 'Enumerăm toate cele 2ᵏ asignări de adevăr posibile pentru k variabile. Pentru fiecare asignare, evaluăm formula în O(n) (verificăm fiecare din cele n clauze). Total: O(n · 2ᵏ). Exponențialul este în numărul de variabile, nu de clauze.',
    },
  }];

  return (
    <>
      <p className="mb-4 text-sm opacity-80">
        {t(
          'Source: Algorithm Design Seminar 3 — Nondeterministic & Probabilistic Algorithms, UAIC 2026. For each problem: test your understanding, then reveal the solution.',
          'Sursa: Seminar PA 3 — Algoritmi nedeterminiști și probabiliști, UAIC 2026. Pentru fiecare problemă: testează-ți înțelegerea, apoi dezvăluie soluția.'
        )}
      </p>

      {/* ═══ Problem 1 ═══ */}
      <h3 className="text-lg font-bold mt-6 mb-2">{t('Problem 1: Biased Coin Simulation', 'Problema 1: Simularea unui ban măsluit')}</h3>
      <Box type="definition">
        <p className="text-sm">{t(
          'Write a probabilistic algorithm that simulates a biased coin flip: "heads" with probability 5/9 and "tails" with probability 4/9.',
          'Scrieți un algoritm probabilist ce modelează aruncarea unui ban măsluit: se poate obține „cap" cu probabilitatea 5/9 și „pajură" cu probabilitatea 4/9.'
        )}</p>
      </Box>
      <MultipleChoice questions={mc1} />
      <Toggle
        question={t('Show algorithm & pseudocode', 'Arată algoritmul și pseudocodul')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">{t('Algorithm', 'Algoritm')}</p>
            <p className="text-sm mb-2">{t(
              'Use rand2 to generate a random number from {0..8} (reject and retry if ≥ 9). Each of 9 outcomes has probability 1/9. Return "heads" for values 0-4 (5 outcomes → 5/9) and "tails" for values 5-8 (4 outcomes → 4/9). To generate a number from {0..8}: generate 4 random bits (range 0-15), keep values 0-8, reject 9-15.',
              'Folosim rand2 pentru a genera un număr aleator din {0..8} (respingem și reîncercăm dacă ≥ 9). Fiecare din cele 9 rezultate are probabilitate 1/9. Returnăm „cap" pentru valorile 0-4 (5 rezultate → 5/9) și „pajură" pentru valorile 5-8 (4 rezultate → 4/9). Pentru a genera un număr din {0..8}: generăm 4 biți aleatori (interval 0-15), păstrăm valorile 0-8, respingem 9-15.'
            )}</p>
            <p className="font-bold mb-1">{t('Pseudocode', 'Pseudocod')}</p>
            <Code>{`Algorithm BiasedCoin()
  repeat
    b ← 8 · rand2() + 4 · rand2() + 2 · rand2() + rand2()
  until b ≤ 8
  if b ≤ 4 then
    return "heads"
  else
    return "tails"`}</Code>
          </div>
        }
      />

      {/* ═══ Problem 2 ═══ */}
      <h3 className="text-lg font-bold mt-8 mb-2">{t('Problem 2: Geometric Stopping', 'Problema 2: Oprire geometrică')}</h3>
      <Box type="definition">
        <p className="text-sm">{t(
          'Consider a probabilistic algorithm (no input) that flips a fair coin in a loop, incrementing a counter. It stops when the coin shows 0, and prints the counter. (a) Execute it a few times. (b) What is the probability that it stops? Hint: compute the probability of stopping after exactly i iterations.',
          'Fie un algoritm probabilist (fără input) care aruncă o monedă corectă într-o buclă, incrementând un contor. Se oprește când moneda arată 0 și tipărește contorul. (a) Executați-l de câteva ori. (b) Care este probabilitatea ca algoritmul să se oprească? Hint: calculați probabilitatea de oprire după exact i iterații.'
        )}</p>
      </Box>
      <Code>{`ok = true; i = 0;
while (ok) {
    uniform x from {0, 1};
    if (x == 0) ok = false;
    ++i;
}
print(i);`}</Code>
      <p className="text-sm font-semibold mt-3 mb-1">{t('Part A: Stopping probability per iteration', 'Partea A: Probabilitatea de oprire per iterație')}</p>
      <MultipleChoice questions={mc2a} />
      <p className="text-sm font-semibold mt-3 mb-1">{t('Part B: Does it stop with probability 1?', 'Partea B: Se oprește cu probabilitate 1?')}</p>
      <MultipleChoice questions={mc2b} />
      <Toggle
        question={t('Show detailed analysis', 'Arată analiza detaliată')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">{t('Analysis', 'Analiză')}</p>
            <p className="text-sm mb-2">{t(
              'The algorithm stops after exactly i iterations when: the first i−1 flips are all 1 (coin shows 1) and the i-th flip is 0. P(stop at i) = (1/2)^(i−1) · (1/2) = (1/2)^i. This is a geometric distribution. P(stops eventually) = Σᵢ₌₁^∞ (1/2)^i = 1. The expected number of iterations is E[i] = Σᵢ₌₁^∞ i·(1/2)^i = 2.',
              'Algoritmul se oprește după exact i iterații când: primele i−1 aruncări sunt toate 1 și aruncarea i este 0. P(oprire la i) = (1/2)^(i−1) · (1/2) = (1/2)^i. Aceasta este o distribuție geometrică. P(se oprește) = Σᵢ₌₁^∞ (1/2)^i = 1. Numărul așteptat de iterații este E[i] = Σᵢ₌₁^∞ i·(1/2)^i = 2.'
            )}</p>
          </div>
        }
      />

      {/* ═══ Problem 3 ═══ */}
      <h3 className="text-lg font-bold mt-8 mb-2">{t('Problem 3: Majority Element — Three Approaches', 'Problema 3: Element majoritar — Trei abordări')}</h3>
      <Box type="definition">
        <p className="text-sm">{t(
          'Given a, an array of natural numbers that contains a majority element (an element appearing on more than half the indices), find the majority element. (a) Write a nondeterministic algorithm. (b) Write a Las Vegas algorithm. (c) Write a Monte Carlo algorithm with error probability < 1/2⁵⁰.',
          'Dându-se a, un vector de numere naturale care conține un element majoritar (un element care apare pe mai mult de jumătate din indici), găsiți elementul majoritar. (a) Scrieți un algoritm nedeterminist. (b) Scrieți un algoritm Las Vegas. (c) Scrieți un algoritm Monte Carlo cu probabilitate de eroare < 1/2⁵⁰.'
        )}</p>
      </Box>
      <p className="text-sm font-semibold mt-3 mb-1">{t('I/O Formalization', 'Formalizare I/O')}</p>
      <MultipleChoice questions={mc3} />
      <p className="text-sm font-semibold mt-3 mb-1">{t('Las Vegas vs Monte Carlo', 'Las Vegas vs Monte Carlo')}</p>
      <MultipleChoice questions={mc3type} />
      <p className="text-sm font-semibold mt-3 mb-1">{t('Monte Carlo: Number of trials', 'Monte Carlo: Număr de încercări')}</p>
      <MultipleChoice questions={mc3mc} />
      <Toggle
        question={t('Show all three algorithms', 'Arată toți trei algoritmii')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">{t('(a) Nondeterministic Algorithm', '(a) Algoritm nedeterminist')}</p>
            <p className="text-sm mb-2">{t(
              'Guess an index, then verify the element at that index is the majority by counting its occurrences.',
              'Ghicește un indice, apoi verifică că elementul de la acel indice este majoritar numărând aparițiile.'
            )}</p>
            <Code>{`Algorithm MajorityNondet(a[0..n−1])
  choose i from {0, 1, …, n−1}      // nondeterministic
  candidate ← a[i]
  count ← 0
  for j ← 0 to n−1 do
    if a[j] = candidate then count ← count + 1
  if count > ⌊n/2⌋ then
    return candidate
  else
    fail`}</Code>

            <p className="font-bold mt-4 mb-1">{t('(b) Las Vegas Algorithm', '(b) Algoritm Las Vegas')}</p>
            <p className="text-sm mb-2">{t(
              'Keep picking random elements until we find the majority. Since the majority element occupies > n/2 positions, each trial succeeds with probability > 1/2. Expected number of trials: < 2.',
              'Alegem elemente aleatorii până găsim majoritarul. Deoarece elementul majoritar ocupă > n/2 poziții, fiecare încercare reușește cu probabilitate > 1/2. Număr așteptat de încercări: < 2.'
            )}</p>
            <Code>{`Algorithm MajorityLasVegas(a[0..n−1])
  while true do
    uniform i from {0, 1, …, n−1}
    candidate ← a[i]
    count ← 0
    for j ← 0 to n−1 do
      if a[j] = candidate then count ← count + 1
    if count > ⌊n/2⌋ then
      return candidate`}</Code>

            <p className="font-bold mt-4 mb-1">{t('(c) Monte Carlo Algorithm', '(c) Algoritm Monte Carlo')}</p>
            <p className="text-sm mb-2">{t(
              'Run at most 50 random trials. Each trial: pick a random element, verify if majority. P(error) = P(all 50 trials miss) < (1/2)⁵⁰ < 1/2⁵⁰.',
              'Rulăm cel mult 50 de încercări aleatorii. Fiecare încercare: alegem un element aleator, verificăm dacă e majoritar. P(eroare) = P(toate 50 de încercări ratează) < (1/2)⁵⁰ < 1/2⁵⁰.'
            )}</p>
            <Code>{`Algorithm MajorityMonteCarlo(a[0..n−1])
  for trial ← 1 to 50 do
    uniform i from {0, 1, …, n−1}
    candidate ← a[i]
    count ← 0
    for j ← 0 to n−1 do
      if a[j] = candidate then count ← count + 1
    if count > ⌊n/2⌋ then
      return candidate
  return a[0]    // fallback (may be wrong)`}</Code>
            <Box type="theorem">
              <p className="text-sm">{t(
                'Error probability: P(all 50 trials miss) < (1/2)⁵⁰ ≈ 8.9 × 10⁻¹⁶ ≪ 1/2⁵⁰.',
                'Probabilitate de eroare: P(toate 50 de încercări ratează) < (1/2)⁵⁰ ≈ 8.9 × 10⁻¹⁶ ≪ 1/2⁵⁰.'
              )}</p>
            </Box>
          </div>
        }
      />

      {/* ═══ Problem 4 ═══ */}
      <h3 className="text-lg font-bold mt-8 mb-2">{t('Problem 4: Sum of Random Bits', 'Problema 4: Suma de biți aleatori')}</h3>
      <Box type="definition">
        <p className="text-sm">{t(
          'Consider a probabilistic algorithm that takes n as input, sums n uniform random bits from {0,1}, and prints the sum. (a) Execute it a few times. (b) What is the expected value of the output for arbitrary n ∈ ℕ?',
          'Fie un algoritm probabilist care primește n la intrare, sumează n biți aleatori uniformi din {0,1} și tipărește suma. (a) Executați-l de câteva ori. (b) Care este media valorilor întoarse pentru un input n ∈ ℕ arbitrar?'
        )}</p>
      </Box>
      <Code>{`sum = 0;
for (i = 0; i < n; ++i) {
    uniform x from {0, 1};
    sum = sum + x;
}
print(sum);`}</Code>
      <MultipleChoice questions={mc4} />
      <Toggle
        question={t('Show detailed analysis', 'Arată analiza detaliată')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">{t('Analysis', 'Analiză')}</p>
            <p className="text-sm mb-2">{t(
              'Let Xᵢ be the random variable for the i-th bit. E[Xᵢ] = 0·P(0) + 1·P(1) = 0·½ + 1·½ = ½. By linearity of expectation: E[sum] = E[X₁ + X₂ + … + Xₙ] = E[X₁] + E[X₂] + … + E[Xₙ] = n/2. The output follows a Binomial(n, 1/2) distribution.',
              'Fie Xᵢ variabila aleatoare pentru al i-lea bit. E[Xᵢ] = 0·P(0) + 1·P(1) = 0·½ + 1·½ = ½. Prin liniaritatea speranței: E[sum] = E[X₁ + X₂ + … + Xₙ] = E[X₁] + E[X₂] + … + E[Xₙ] = n/2. Output-ul urmează o distribuție Binomială(n, 1/2).'
            )}</p>
          </div>
        }
      />

      {/* ═══ Problem 5 ═══ */}
      <h3 className="text-lg font-bold mt-8 mb-2">{t('Problem 5: Fair Die from rand2', 'Problema 5: Zar echiprobabil din rand2')}</h3>
      <Box type="definition">
        <p className="text-sm">{t(
          'Given a function rand2 that returns 0 or 1 each with probability 0.5, write a function zar (no arguments) that returns a number from {0,1,2,3,4,5} each with equal probability 1/6. You may only use rand2 — no other random source.',
          'Fie o funcție probabilistă rand2 care întoarce cu probabilitate 0.5 valoarea 0 și cu probabilitate 0.5 valoarea 1. Scrieți o funcție probabilistă zar fără argumente care întoarce un număr natural între 0 și 5, fiecare cu aceeași probabilitate. Puteți folosi doar rand2 — nicio altă funcție probabilistă.'
        )}</p>
      </Box>
      <MultipleChoice questions={mc5} />
      <Toggle
        question={t('Show algorithm & pseudocode', 'Arată algoritmul și pseudocodul')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">{t('Algorithm', 'Algoritm')}</p>
            <p className="text-sm mb-2">{t(
              'Generate 3 random bits → number in {0..7}. If the number is in {0..5}, return it. If it\'s 6 or 7, reject and retry. Each outcome in {0..5} has exactly probability 1/6. This is rejection sampling — the while loop terminates with probability 1 since P(accept) = 6/8 = 3/4 per trial.',
              'Generăm 3 biți aleatori → număr din {0..7}. Dacă numărul este în {0..5}, îl returnăm. Dacă este 6 sau 7, respingem și reîncercăm. Fiecare rezultat din {0..5} are exact probabilitate 1/6. Aceasta este eșantionare prin respingere — bucla while se termină cu probabilitate 1 deoarece P(accept) = 6/8 = 3/4 per încercare.'
            )}</p>
            <p className="font-bold mb-1">{t('Pseudocode', 'Pseudocod')}</p>
            <Code>{`Algorithm Zar()
  repeat
    x ← 4 · rand2() + 2 · rand2() + rand2()
  until x ≤ 5
  return x`}</Code>
            <Box type="theorem">
              <p className="text-sm">{t(
                'Expected number of iterations: 1 / (6/8) = 4/3 ≈ 1.33. Expected rand2 calls: 3 · 4/3 = 4.',
                'Număr așteptat de iterații: 1 / (6/8) = 4/3 ≈ 1.33. Apeluri rand2 așteptate: 3 · 4/3 = 4.'
              )}</p>
            </Box>
          </div>
        }
      />

      {/* ═══ Problem 6 ═══ */}
      <h3 className="text-lg font-bold mt-8 mb-2">{t('Problem 6: Fair Bit from Biased Coin', 'Problema 6: Bit echiprobabil din monedă măsluită')}</h3>
      <Box type="definition">
        <p className="text-sm">{t(
          'Given rand2p (returns 0 with unknown probability p ∈ (0,1) and 1 with probability 1−p), write rand2corect (no arguments) that returns 0 or 1 each with probability exactly 0.5. You may only use rand2p — no other random source.',
          'Fie o funcție probabilistă rand2p care întoarce 0 cu probabilitate p și 1 cu probabilitate 1−p. Numărul p este un real p ∈ (0,1) dar necunoscut. Scrieți o funcție rand2corect fără argumente care întoarce 0 cu probabilitate 0.5 și 1 cu probabilitate 0.5. Puteți folosi doar rand2p.'
        )}</p>
      </Box>
      <MultipleChoice questions={mc6} />
      <Toggle
        question={t('Show algorithm & pseudocode', 'Arată algoritmul și pseudocodul')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">{t('Algorithm (Von Neumann\'s trick)', 'Algoritm (trucul lui Von Neumann)')}</p>
            <p className="text-sm mb-2">{t(
              'Call rand2p twice. P(0,1) = p(1−p) and P(1,0) = (1−p)p — these are equal! If we get (0,1) return 0, if (1,0) return 1, otherwise retry. Since P(0,1) = P(1,0), the output is perfectly fair regardless of p.',
              'Apelăm rand2p de două ori. P(0,1) = p(1−p) și P(1,0) = (1−p)p — sunt egale! Dacă obținem (0,1) returnăm 0, dacă (1,0) returnăm 1, altfel reîncercăm. Deoarece P(0,1) = P(1,0), output-ul este perfect echiprobabil indiferent de p.'
            )}</p>
            <p className="font-bold mb-1">{t('Pseudocode', 'Pseudocod')}</p>
            <Code>{`Algorithm Rand2Corect()
  repeat
    a ← rand2p()
    b ← rand2p()
  until a ≠ b
  return a`}</Code>
            <Box type="theorem">
              <p className="text-sm">{t(
                'Expected calls to rand2p: 2 / (2p(1−p)). This is minimized when p = 0.5 (4 calls) and goes to infinity as p → 0 or p → 1.',
                'Apeluri așteptate de rand2p: 2 / (2p(1−p)). Se minimizează când p = 0.5 (4 apeluri) și tinde la infinit când p → 0 sau p → 1.'
              )}</p>
            </Box>
          </div>
        }
      />

      {/* ═══ Problem 7 ═══ */}
      <h3 className="text-lg font-bold mt-8 mb-2">{t('Problem 7: Uniform Random from rand2', 'Problema 7: Aleator uniform din rand2')}</h3>
      <Box type="definition">
        <p className="text-sm">{t(
          'Using only rand2 (fair bit), write a function random(n) that returns a number from {0, 1, …, n−1} each with probability exactly 1/n.',
          'Folosindu-vă doar de funcția probabilistă rand2, scrieți o funcție random care primește un număr natural n și întoarce un număr natural din mulțimea {0, 1, …, n−1}, fiecare cu probabilitatea 1/n.'
        )}</p>
      </Box>
      <MultipleChoice questions={mc7} />
      <Toggle
        question={t('Show algorithm & pseudocode', 'Arată algoritmul și pseudocodul')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">{t('Algorithm', 'Algoritm')}</p>
            <p className="text-sm mb-2">{t(
              'Find the smallest k such that 2ᵏ ≥ n. Generate k random bits to get a number in {0..2ᵏ−1}. If the number is < n, return it; otherwise reject and retry. This is rejection sampling generalized to any n.',
              'Găsim cel mai mic k astfel încât 2ᵏ ≥ n. Generăm k biți aleatori pentru a obține un număr din {0..2ᵏ−1}. Dacă numărul este < n, îl returnăm; altfel respingem și reîncercăm. Aceasta este eșantionare prin respingere generalizată pentru orice n.'
            )}</p>
            <p className="font-bold mb-1">{t('Pseudocode', 'Pseudocod')}</p>
            <Code>{`Algorithm Random(n)
  k ← ⌈log₂(n)⌉
  repeat
    x ← 0
    for i ← 1 to k do
      x ← 2 · x + rand2()
  until x < n
  return x`}</Code>
            <Box type="theorem">
              <p className="text-sm">{t(
                'Expected iterations: 2ᵏ/n < 2 (since 2ᵏ < 2n). Expected rand2 calls: k · 2ᵏ/n < 2k = 2⌈log₂(n)⌉.',
                'Iterații așteptate: 2ᵏ/n < 2 (deoarece 2ᵏ < 2n). Apeluri rand2 așteptate: k · 2ᵏ/n < 2k = 2⌈log₂(n)⌉.'
              )}</p>
            </Box>
          </div>
        }
      />

      {/* ═══ Problem 8 ═══ */}
      <h3 className="text-lg font-bold mt-8 mb-2">{t('Problem 8: Subset Sum Variants (SSD1, SSD2, SSD3)', 'Problema 8: Variante ale sumei de submulțime (SSD1, SSD2, SSD3)')}</h3>
      <Box type="definition">
        <p className="text-sm">{t(
          'Write nondeterministic algorithms for three variants of the subset sum problem:',
          'Scrieți algoritmi nedeterminiști pentru trei variante ale problemei sumei de submulțime:'
        )}</p>
        <ul className="text-sm list-disc ml-4 mt-1">
          <li><strong>SSD1</strong>: {t(
            'Input: S — set of integers, M ∈ ℕ. Output: M* — largest integer s.t. M* ≤ M and ∃S\' ⊆ S with Σ S\' = M*.',
            'Input: S — mulțime de numere întregi, M ∈ ℕ. Output: M* — cel mai mare întreg a.î. M* ≤ M și ∃S\' ⊆ S cu Σ S\' = M*.'
          )}</li>
          <li><strong>SSD2</strong>: {t(
            'Instance: S, M, K ∈ ℕ, K ≤ M. Question: ∃M* s.t. K ≤ M* ≤ M and ∃S\' ⊆ S with Σ S\' = M*?',
            'Instanță: S, M, K ∈ ℕ, K ≤ M. Întrebare: ∃M* a.î. K ≤ M* ≤ M și ∃S\' ⊆ S cu Σ S\' = M*?'
          )}</li>
          <li><strong>SSD3</strong>: {t(
            'Instance: S, M ∈ ℕ. Question: ∃S\' ⊆ S s.t. Σ S\' = M?',
            'Instanță: S, M ∈ ℕ. Întrebare: ∃S\' ⊆ S a.î. Σ S\' = M?'
          )}</li>
        </ul>
      </Box>
      <p className="text-sm font-semibold mt-3 mb-1">{t('Problem type classification', 'Clasificarea tipului de problemă')}</p>
      <MultipleChoice questions={mc8} />
      <p className="text-sm font-semibold mt-3 mb-1">{t('Nondeterministic approach for SSD3', 'Abordare nedeterministă pentru SSD3')}</p>
      <MultipleChoice questions={mc8b} />
      <Toggle
        question={t('Show nondeterministic algorithms for all three', 'Arată algoritmii nedeterminiști pentru toate trei')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">SSD3 {t('(simplest — decision)', '(cea mai simplă — decizie)')}</p>
            <Code>{`Algorithm SSD3_Nondet(S, M)
  choose S' ⊆ S          // nondeterministic
  if Σ_{x ∈ S'} x = M then
    return "yes"
  else
    fail`}</Code>

            <p className="font-bold mt-4 mb-1">SSD2 {t('(bounded decision)', '(decizie mărginită)')}</p>
            <Code>{`Algorithm SSD2_Nondet(S, M, K)
  choose M* from {K, K+1, …, M}    // nondeterministic
  choose S' ⊆ S                     // nondeterministic
  if Σ_{x ∈ S'} x = M* then
    return "yes"
  else
    fail`}</Code>

            <p className="font-bold mt-4 mb-1">SSD1 {t('(optimization)', '(optimizare)')}</p>
            <p className="text-sm mb-2">{t(
              'For optimization, the nondeterministic algorithm guesses both S\' and M*, then verifies the constraints. Note: nondeterministic algorithms for optimization problems are trickier — we guess the optimal value and verify it\'s achievable.',
              'Pentru optimizare, algoritmul nedeterminist ghicește atât S\' cât și M*, apoi verifică constrângerile. Notă: algoritmii nedeterminiști pentru probleme de optimizare sunt mai complicați — ghicim valoarea optimă și verificăm că este realizabilă.'
            )}</p>
            <Code>{`Algorithm SSD1_Nondet(S, M)
  choose M* from {0, 1, …, M}      // nondeterministic
  choose S' ⊆ S                     // nondeterministic
  if Σ_{x ∈ S'} x = M* then
    return M*
  else
    fail`}</Code>
            <Box type="warning">
              <p className="text-sm">{t(
                'The nondeterministic model assumes "angelic" choice — it always guesses correctly if a correct guess exists. For SSD1, among all valid M* values, it picks the largest one.',
                'Modelul nedeterminist presupune alegere „angelică" — ghicește mereu corect dacă există o ghicire corectă. Pentru SSD1, dintre toate valorile M* valide, o alege pe cea mai mare.'
              )}</p>
            </Box>
          </div>
        }
      />

      {/* ═══ Problem 9 ═══ */}
      <h3 className="text-lg font-bold mt-8 mb-2">{t('Problem 9: 3-SAT and Related Problems', 'Problema 9: 3-SAT și probleme conexe')}</h3>
      <Box type="definition">
        <p className="text-sm">{t(
          'A 3-CNF formula (e.g., (x₁ ∨ ¬x₂ ∨ x₃) ∧ (¬x₁ ∨ x₅ ∨ ¬x₂)) is represented as a matrix v[n][3]. (a) Write a nondeterministic algorithm for 3-satisfiability. (b) Describe 3-DNF validity as I/O. (c) Write a nondeterministic algorithm for 3-non-equivalence. (d) Write a deterministic brute-force for 3-SAT.',
          'O formulă 3-CNF (ex., (x₁ ∨ ¬x₂ ∨ x₃) ∧ (¬x₁ ∨ x₅ ∨ ¬x₂)) este reprezentată ca o matrice v[n][3]. (a) Scrieți un algoritm nedeterminist pentru 3-satisfiabilitate. (b) Descrieți validitatea 3-DNF ca I/O. (c) Scrieți un algoritm nedeterminist pentru 3-non-echivalență. (d) Scrieți un algoritm determinist brute-force pentru 3-SAT.'
        )}</p>
      </Box>
      <p className="text-sm font-semibold mt-3 mb-1">{t('Part A: 3-SAT formalization', 'Partea A: Formalizarea 3-SAT')}</p>
      <MultipleChoice questions={mc9a} />
      <p className="text-sm font-semibold mt-3 mb-1">{t('Part B: CNF satisfiability vs DNF validity', 'Partea B: Satisfiabilitate CNF vs validitate DNF')}</p>
      <MultipleChoice questions={mc9b} />
      <p className="text-sm font-semibold mt-3 mb-1">{t('Part C: Equivalence vs non-equivalence', 'Partea C: Echivalență vs non-echivalență')}</p>
      <MultipleChoice questions={mc9c} />
      <p className="text-sm font-semibold mt-3 mb-1">{t('Part D: Brute-force complexity', 'Partea D: Complexitatea brute-force')}</p>
      <MultipleChoice questions={mc9d} />
      <Toggle
        question={t('Show nondeterministic algorithms & brute-force', 'Arată algoritmii nedeterminiști și brute-force')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">{t('(a) Nondeterministic 3-SAT', '(a) 3-SAT nedeterminist')}</p>
            <Code>{`Algorithm 3SAT_Nondet(v[n][3], n)
  // Guess phase: choose truth assignment
  k ← max variable index in v
  choose (t₁, t₂, …, tₖ) from {true, false}ᵏ
  // Verify phase: check all clauses
  for i ← 1 to n do
    clause_ok ← false
    for j ← 1 to 3 do
      var ← |v[i][j]|
      if v[i][j] > 0 and t[var] = true then clause_ok ← true
      if v[i][j] < 0 and t[var] = false then clause_ok ← true
    if not clause_ok then return "no"
  return "yes"`}</Code>

            <p className="font-bold mt-4 mb-1">{t('(b) 3-DNF Validity', '(b) Validitatea 3-DNF')}</p>
            <p className="text-sm mb-2">{t(
              'Input: w[n][3] — matrix representing a 3-DNF formula, n — number of terms. Output: "yes" if the formula is valid (true under every assignment), "no" otherwise. A nondeterministic algorithm for validity is not straightforward — we can\'t nondeterministically verify that ALL assignments satisfy the formula. However, we can write one for NON-validity (guess an assignment that falsifies it).',
              'Input: w[n][3] — matrice reprezentând o formulă 3-DNF, n — numărul de termeni. Output: „da" dacă formula este validă (adevărată sub orice asignare), „nu" altfel. Un algoritm nedeterminist pentru validitate nu este direct — nu putem verifica nedeterminist că TOATE asignările satisfac formula. Putem scrie unul pentru NON-validitate (ghicim o asignare care o falsifică).'
            )}</p>

            <p className="font-bold mt-4 mb-1">{t('(c) Nondeterministic 3-Non-Equivalence', '(c) 3-Non-Echivalență nedeterministă')}</p>
            <Code>{`Algorithm 3NonEquiv_Nondet(v[n][3], w[m][3])
  k ← max variable index in v and w
  choose (t₁, t₂, …, tₖ) from {true, false}ᵏ
  val_v ← evaluate v under (t₁, …, tₖ)
  val_w ← evaluate w under (t₁, …, tₖ)
  if val_v ≠ val_w then
    return "not equivalent"
  else
    fail`}</Code>
            <p className="text-sm mb-2">{t(
              'For equivalence, we cannot write a nondeterministic algorithm because we would need to verify ALL assignments agree — a universal statement, not an existential one.',
              'Pentru echivalență, nu putem scrie un algoritm nedeterminist deoarece ar trebui să verificăm că TOATE asignările sunt de acord — o afirmație universală, nu existențială.'
            )}</p>

            <p className="font-bold mt-4 mb-1">{t('(d) Deterministic Brute-Force 3-SAT', '(d) 3-SAT determinist brute-force')}</p>
            <Code>{`Algorithm 3SAT_BruteForce(v[n][3], n)
  k ← max variable index in v
  for each assignment (t₁, …, tₖ) ∈ {true, false}ᵏ do
    satisfied ← true
    for i ← 1 to n do
      clause_ok ← false
      for j ← 1 to 3 do
        var ← |v[i][j]|
        if v[i][j] > 0 and t[var] = true then clause_ok ← true
        if v[i][j] < 0 and t[var] = false then clause_ok ← true
      if not clause_ok then satisfied ← false; break
    if satisfied then return "yes"
  return "no"`}</Code>
            <Box type="theorem">
              <p className="text-sm">{t(
                'Worst-case complexity: O(n · 2ᵏ), where k = number of variables and n = number of clauses. This is exponential in k.',
                'Complexitate în cazul cel mai nefavorabil: O(n · 2ᵏ), unde k = numărul de variabile și n = numărul de clauze. Este exponențial în k.'
              )}</p>
            </Box>
          </div>
        }
      />
    </>
  );
}
