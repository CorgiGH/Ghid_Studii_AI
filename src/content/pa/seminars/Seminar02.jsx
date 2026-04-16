import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Toggle } from '../../../components/ui';
import MultipleChoice from '../../../components/ui/MultipleChoice';

export default function Seminar02() {
  const { t } = useApp();

  /* ─── Problem 1: Two smallest indices ─── */
  const mc1a = [{
    question: {
      en: 'Which is the correct Input-Output formalization for "Given an array of natural numbers with at least two elements, display two indices for the two smallest elements, ordered by element value"?',
      ro: 'Care este formalizarea corectă Input-Output pentru „Dându-se un vector de numere naturale cu cel puțin două elemente, să se afișeze doi indici, pentru cele mai mici două elemente din vector, în ordine după valoarea elementelor"?',
    },
    options: [
      { text: { en: 'Input: a[0..n−1], n ≥ 2, a[i] ∈ ℕ; Output: (i, j) where a[i] ≤ a[j] ≤ a[k] ∀k ≠ i,j and i ≠ j', ro: 'Input: a[0..n−1], n ≥ 2, a[i] ∈ ℕ; Output: (i, j) unde a[i] ≤ a[j] ≤ a[k] ∀k ≠ i,j și i ≠ j' }, correct: true },
      { text: { en: 'Input: a[0..n−1]; Output: (min₁, min₂) — the two smallest values', ro: 'Input: a[0..n−1]; Output: (min₁, min₂) — cele două valori minime' }, correct: false, feedback: { en: 'Returns the two values, but the problem asks for their *indices* (the positions i, j).', ro: 'Returnează cele două valori, dar problema cere *indicii* (pozițiile i, j).' } },
      { text: { en: 'Input: a[0..n−1], n ≥ 2; Output: index of the smallest element', ro: 'Input: a[0..n−1], n ≥ 2; Output: indicele celui mai mic element' }, correct: false, feedback: { en: 'Returns only one index; we need indices for *both* smallest elements.', ro: 'Returnează un singur indice; avem nevoie de indicii pentru *ambele* elemente minime.' } },
      { text: { en: 'Input: a[0..n−1]; Output: (i, j) where a[i] and a[j] are the two largest elements', ro: 'Input: a[0..n−1]; Output: (i, j) unde a[i] și a[j] sunt cele două elemente maxime' }, correct: false, feedback: { en: 'Swaps min and max; the problem targets the two smallest, not the two largest.', ro: 'Inversează min cu max; problema vizează cele mai mici două, nu cele mai mari.' } },
    ],
    explanation: {
      en: 'The problem asks for indices (not values), of the two smallest elements, ordered by value. We need both indices, not just the minimum.',
      ro: 'Problema cere indici (nu valori), ai celor mai mici două elemente, ordonate după valoare. Avem nevoie de ambii indici, nu doar minimul.',
    },
  }];

  const mc1b = [{
    question: {
      en: 'Is the following algorithm correct for finding the two smallest indices? The algorithm initializes sml/nxtsml from a[0],a[1], then for i=2..n−1: if a[i] < a[sml] then nxtsml ← sml, sml ← i.',
      ro: 'Este corect următorul algoritm pentru găsirea celor doi indici minimi? Algoritmul inițializează sml/nxtsml din a[0],a[1], apoi pentru i=2..n−1: dacă a[i] < a[sml] atunci nxtsml ← sml, sml ← i.',
    },
    options: [
      { text: { en: 'No — it misses the case when a[i] is between a[sml] and a[nxtsml]', ro: 'Nu — ratează cazul când a[i] este între a[sml] și a[nxtsml]' }, correct: true },
      { text: { en: 'Yes — it correctly tracks the two smallest', ro: 'Da — urmărește corect cele mai mici două' }, correct: false, feedback: { en: 'Counter-example: [5, 1, 4, 2]. The algorithm leaves nxtsml = 0 (value 5) because 2 is never smaller than a[sml] = 1; the real second smallest is 2.', ro: 'Contra-exemplu: [5, 1, 4, 2]. Algoritmul lasă nxtsml = 0 (valoarea 5) pentru că 2 nu e niciodată mai mic decât a[sml] = 1; al doilea minim real e 2.' } },
      { text: { en: 'No — the initialization is wrong', ro: 'Nu — inițializarea este greșită' }, correct: false, feedback: { en: 'The initialization from a[0], a[1] is fine; the bug is in the update rule, which never records values that sit between sml and nxtsml.', ro: 'Inițializarea din a[0], a[1] e corectă; bug-ul e în regula de actualizare, care nu înregistrează niciodată valorile aflate între sml și nxtsml.' } },
    ],
    explanation: {
      en: 'The algorithm only updates nxtsml when a new global minimum is found. If a[i] is smaller than a[nxtsml] but not smaller than a[sml], it is never recorded. Counter-example: [5, 1, 4, 2]. Initialization: sml=1 (a[1]=1), nxtsml=0 (a[0]=5). i=2: a[2]=4, not less than a[sml]=1, so skipped. i=3: a[3]=2, not less than a[sml]=1, so skipped. Final nxtsml=0 (value 5) — WRONG. The true second-smallest is a[3]=2.',
      ro: 'Algoritmul actualizează nxtsml doar când se găsește un nou minim global. Dacă a[i] este mai mic decât a[nxtsml] dar nu mai mic decât a[sml], nu este înregistrat. Contraexemplu: [5, 1, 4, 2]. Inițializare: sml=1 (a[1]=1), nxtsml=0 (a[0]=5). i=2: a[2]=4, nu este mai mic decât a[sml]=1, deci se sare. i=3: a[3]=2, nu este mai mic decât a[sml]=1, deci se sare. nxtsml final=0 (valoarea 5) — GREȘIT. Al doilea minim real este a[3]=2.',
    },
  }];

  /* ─── Problem 2: Fixed point ─── */
  const mc2 = [{
    question: {
      en: 'Which is the correct I/O formalization for "Find a fixed point (index i where arr[i] == i) in a sorted array of distinct integers, or return -1"?',
      ro: 'Care este formalizarea corectă I/O pentru „Găsiți un punct fix (indice i unde arr[i] == i) într-un vector sortat de numere întregi distincte, sau returnați -1"?',
    },
    options: [
      { text: { en: 'Input: a[0..n−1] sorted, distinct, a[i] ∈ ℤ; Output: i such that a[i] = i, or −1 if none exists', ro: 'Input: a[0..n−1] sortat, distinct, a[i] ∈ ℤ; Output: i astfel încât a[i] = i, sau −1 dacă nu există' }, correct: true },
      { text: { en: 'Input: a[0..n−1]; Output: all indices i where a[i] = i', ro: 'Input: a[0..n−1]; Output: toți indicii i unde a[i] = i' }, correct: false, feedback: { en: 'Enumerates all fixed points, and drops the sorted/distinct constraints that make the O(log n) solution possible.', ro: 'Enumeră toate punctele fixe și pierde constrângerile sortat/distinct care fac posibilă soluția O(log n).' } },
      { text: { en: 'Input: a[0..n−1] sorted; Output: true if a fixed point exists', ro: 'Input: a[0..n−1] sortat; Output: true dacă există un punct fix' }, correct: false, feedback: { en: 'A decision (exists?); the problem asks to *locate* the fixed point (return its index, or −1).', ro: 'O decizie (există?); problema cere *localizarea* punctului fix (indicele, sau −1).' } },
      { text: { en: 'Input: a[0..n−1], target value v; Output: index where a[i] = v', ro: 'Input: a[0..n−1], valoare țintă v; Output: indicele unde a[i] = v' }, correct: false, feedback: { en: 'Standard search for a given target; a fixed point uses i *itself* as the target, no external v.', ro: 'Căutare standard pentru o țintă dată; un punct fix folosește *i* ca țintă, fără un v extern.' } },
    ],
    explanation: {
      en: 'The problem asks for a single fixed point index (or -1), not all of them, not a boolean, and not a standard search. The key constraints are: sorted and distinct elements.',
      ro: 'Problema cere un singur indice de punct fix (sau -1), nu toți, nu un boolean și nu o căutare standard. Constrângerile cheie: vector sortat cu elemente distincte.',
    },
  }];

  /* ─── Problem 3: Majority element ─── */
  const mc3a = [{
    question: {
      en: 'Which is the correct I/O formalization for "Find the majority element (appears more than n/2 times) in an array, or return -1 if none exists"?',
      ro: 'Care este formalizarea corectă I/O pentru „Găsiți elementul majoritar (apare de mai mult de n/2 ori) într-un vector, sau returnați -1 dacă nu există"?',
    },
    options: [
      { text: { en: 'Input: a[0..n−1], a[i] ∈ ℕ; Output: x if #{i : a[i]=x} > ⌊n/2⌋, else −1', ro: 'Input: a[0..n−1], a[i] ∈ ℕ; Output: x dacă #{i : a[i]=x} > ⌊n/2⌋, altfel −1' }, correct: true },
      { text: { en: 'Input: a[0..n−1]; Output: the element that appears most often', ro: 'Input: a[0..n−1]; Output: elementul care apare cel mai des' }, correct: false, feedback: { en: 'That is the *mode*, not majority. The mode always exists; a majority needs strictly more than n/2 copies and may not exist.', ro: 'Acela e *modul*, nu majoritarul. Modul există mereu; majoritarul necesită strict > n/2 copii și poate lipsi.' } },
      { text: { en: 'Input: a[0..n−1]; Output: all elements appearing more than once', ro: 'Input: a[0..n−1]; Output: toate elementele care apar de mai mult de o dată' }, correct: false, feedback: { en: 'Returns every duplicate; majority requires a *single* element that dominates more than half the array.', ro: 'Returnează fiecare duplicat; majoritarul cere un *singur* element care domină mai mult de jumătate din vector.' } },
      { text: { en: 'Input: a[0..n−1], threshold k; Output: elements appearing > k times', ro: 'Input: a[0..n−1], prag k; Output: elementele care apar de > k ori' }, correct: false, feedback: { en: 'The threshold is fixed at n/2 for majority; it is not an input parameter k.', ro: 'Pragul e fix la n/2 pentru majoritate, nu un parametru k de intrare.' } },
    ],
    explanation: {
      en: 'A majority element must appear strictly more than n/2 times — not just "most often" (which is the mode). The threshold n/2 is fixed, not a parameter k.',
      ro: 'Un element majoritar trebuie să apară strict de mai mult de n/2 ori — nu doar „cel mai frecvent" (care este modul). Pragul n/2 este fix, nu un parametru k.',
    },
  }];

  const mc3b = [{
    question: {
      en: 'The Boyer-Moore voting algorithm uses two passes. Why can\'t it be done in a single pass?',
      ro: 'Algoritmul de vot Boyer-Moore folosește două parcurgeri. De ce nu poate fi realizat într-o singură parcurgere?',
    },
    options: [
      { text: { en: 'The first pass finds a candidate, but the candidate might not actually be a majority — the second pass verifies', ro: 'Prima parcurgere găsește un candidat, dar candidatul ar putea să nu fie de fapt majoritar — a doua parcurgere verifică' }, correct: true },
      { text: { en: 'Two passes are needed to sort the array first', ro: 'Două parcurgeri sunt necesare pentru a sorta vectorul mai întâi' }, correct: false, feedback: { en: 'Boyer-Moore does not sort; it uses O(1) extra space. Sorting would cost O(n log n) and defeat the whole point.', ro: 'Boyer-Moore nu sortează; folosește O(1) memorie în plus. Sortarea ar costa O(n log n) și ar anula ideea.' } },
      { text: { en: 'The first pass counts occurrences, the second finds the maximum count', ro: 'Prima parcurgere numără aparițiile, a doua găsește contorul maxim' }, correct: false, feedback: { en: 'That describes a mode-finder (O(n) space). Boyer-Moore tracks a single candidate + count via cancellations, then verifies once.', ro: 'Aceea descrie un detector de mod (O(n) spațiu). Boyer-Moore ține un singur candidat + contor prin anulări, apoi verifică o dată.' } },
    ],
    explanation: {
      en: 'Boyer-Moore\'s first pass eliminates candidates by pairing different elements. The surviving candidate is guaranteed to be majority IF one exists, but if no majority exists, the candidate is arbitrary. The second pass counts actual occurrences to verify.',
      ro: 'Prima parcurgere Boyer-Moore elimină candidații prin împerecherea elementelor diferite. Candidatul supraviețuitor este garantat majoritar DACĂ există unul, dar dacă nu există majoritar, candidatul este arbitrar. A doua parcurgere numără aparițiile reale pentru verificare.',
    },
  }];

  const mc3c = [{
    question: {
      en: 'What is the time complexity of the Boyer-Moore voting algorithm?',
      ro: 'Care este complexitatea timp a algoritmului de vot Boyer-Moore?',
    },
    options: [
      { text: { en: 'O(n)', ro: 'O(n)' }, correct: true },
      { text: { en: 'O(n log n)', ro: 'O(n log n)' }, correct: false, feedback: { en: 'Sort-based bound; Boyer-Moore never sorts — two linear scans suffice.', ro: 'Margine din sortare; Boyer-Moore nu sortează niciodată — două parcurgeri liniare sunt suficiente.' } },
      { text: { en: 'O(n²)', ro: 'O(n²)' }, correct: false, feedback: { en: 'That would be the naive "count every element pairwise" approach; Boyer-Moore eliminates that with a single-pass cancellation trick.', ro: 'Aceea e abordarea naivă „numără fiecare element per pereche"; Boyer-Moore o elimină printr-o parcurgere cu anulări.' } },
      { text: { en: 'O(1)', ro: 'O(1)' }, correct: false, feedback: { en: 'O(1) would not even look at every element; you must scan the array at least once to know anything about it.', ro: 'O(1) nu ar privi fiecare element; trebuie parcurs vectorul cel puțin o dată ca să știi ceva despre el.' } },
    ],
    explanation: {
      en: 'Two sequential linear passes: O(n) + O(n) = O(n). Each pass goes through the array exactly once. Space is O(1) — only candidate and count variables.',
      ro: 'Două parcurgeri liniare secvențiale: O(n) + O(n) = O(n). Fiecare parcurgere trece prin vector exact o dată. Spațiu O(1) — doar variabilele candidate și count.',
    },
  }];

  /* ─── Problem 4: Big number operations ─── */
  const mc4 = [{
    question: {
      en: 'Which is the correct I/O formalization for "Add two large natural numbers represented as digit arrays"?',
      ro: 'Care este formalizarea corectă I/O pentru „Adunați două numere naturale mari reprezentate ca șiruri de cifre"?',
    },
    options: [
      { text: { en: 'Input: a[1..n], b[1..m] where a[i], b[j] ∈ {0..9}; Output: c[1..max(n,m)+1] representing a + b', ro: 'Input: a[1..n], b[1..m] unde a[i], b[j] ∈ {0..9}; Output: c[1..max(n,m)+1] reprezentând a + b' }, correct: true },
      { text: { en: 'Input: two integers a, b; Output: a + b', ro: 'Input: două numere întregi a, b; Output: a + b' }, correct: false, feedback: { en: 'Defeats the premise: the numbers are too large to fit in a machine word — that is why they are given as digit arrays.', ro: 'Anulează premisa: numerele sunt prea mari pentru un cuvânt mașină — de aceea sunt date ca șiruri de cifre.' } },
      { text: { en: 'Input: a[1..n], b[1..n] (same length); Output: c[1..n] representing a + b', ro: 'Input: a[1..n], b[1..n] (aceeași lungime); Output: c[1..n] reprezentând a + b' }, correct: false, feedback: { en: 'Forces equal length and drops the carry-out digit. General addition must handle n ≠ m and `max(n,m)+1` output length.', ro: 'Impune lungimi egale și elimină cifra de transport. Adunarea generală trebuie să trateze n ≠ m și lungimea `max(n,m)+1`.' } },
      { text: { en: 'Input: a[1..n], b[1..m]; Output: true if a + b overflows', ro: 'Input: a[1..n], b[1..m]; Output: true dacă a + b depășește limita' }, correct: false, feedback: { en: 'Overflow-decision; we want the actual sum as a digit array, not a boolean.', ro: 'Decizie-depășire; vrem suma efectivă ca șir de cifre, nu un boolean.' } },
    ],
    explanation: {
      en: 'Numbers are represented as digit arrays (not native integers — they\'re too large). Arrays can have different lengths. The result may have one extra digit due to carry (e.g. 999 + 1 = 1000).',
      ro: 'Numerele sunt reprezentate ca vectori de cifre (nu numere native — sunt prea mari). Vectorii pot avea lungimi diferite. Rezultatul poate avea o cifră în plus din cauza transportului (ex. 999 + 1 = 1000).',
    },
  }];

  /* ─── Problem 5: Sorting ─── */
  const mc5 = [{
    question: {
      en: 'Which is the correct I/O formalization for "Sort an array of natural numbers in ascending order"?',
      ro: 'Care este formalizarea corectă I/O pentru „Sortați un vector de numere naturale în ordine crescătoare"?',
    },
    options: [
      { text: { en: 'Input: a[1..n], a[i] ∈ ℕ; Output: a permutation a\'[1..n] of a such that a\'[1] ≤ a\'[2] ≤ … ≤ a\'[n]', ro: 'Input: a[1..n], a[i] ∈ ℕ; Output: o permutare a\'[1..n] a lui a astfel încât a\'[1] ≤ a\'[2] ≤ … ≤ a\'[n]' }, correct: true },
      { text: { en: 'Input: a[1..n]; Output: the sorted array (without specifying it\'s a permutation)', ro: 'Input: a[1..n]; Output: vectorul sortat (fără a specifica că este o permutare)' }, correct: false, feedback: { en: 'Without the "permutation of a" clause, the spec allows any sorted array (including totally different elements) — incomplete.', ro: 'Fără clauza „permutare a lui a", specificația admite orice vector sortat (inclusiv cu alte elemente) — incomplet.' } },
      { text: { en: 'Input: a[1..n]; Output: the indices that would sort the array', ro: 'Input: a[1..n]; Output: indicii care ar sorta vectorul' }, correct: false, feedback: { en: 'That is *argsort* — related but different. Sorting returns the reordered values, not a permutation of indices.', ro: 'Acela este *argsort* — înrudit dar diferit. Sortarea returnează valorile reordonate, nu o permutare de indici.' } },
      { text: { en: 'Input: a[1..n]; Output: true if the array is already sorted', ro: 'Input: a[1..n]; Output: true dacă vectorul este deja sortat' }, correct: false, feedback: { en: 'That is *is-sorted* (a decision problem); sorting must actually produce the sorted output.', ro: 'Aceea e *is-sorted* (decizie); sortarea trebuie să producă efectiv output-ul sortat.' } },
    ],
    explanation: {
      en: 'The output must be a permutation of the input (same elements, reordered). Just saying "sorted array" is incomplete — we must specify it contains exactly the same elements. Argsort and checking sortedness are different problems.',
      ro: 'Output-ul trebuie să fie o permutare a input-ului (aceleași elemente, reordonate). Doar „vector sortat" este incomplet — trebuie specificat că conține exact aceleași elemente. Argsort și verificarea sortării sunt probleme diferite.',
    },
  }];

  /* ─── Problem 6: Missing number ─── */
  const mc6 = [{
    question: {
      en: 'Which is the correct I/O formalization for "Given n and n−1 distinct natural numbers from 1 to n, find the missing number"?',
      ro: 'Care este formalizarea corectă I/O pentru „Dându-se n și n−1 numere naturale distincte între 1 și n, determinați numărul lipsă"?',
    },
    options: [
      { text: { en: 'Input: n ∈ ℤ⁺, a[1..n−1] where a[i] ∈ {1..n} all distinct; Output: x ∈ {1..n} \\ {a[1], …, a[n−1]}', ro: 'Input: n ∈ ℤ⁺, a[1..n−1] unde a[i] ∈ {1..n} toți distincți; Output: x ∈ {1..n} \\ {a[1], …, a[n−1]}' }, correct: true },
      { text: { en: 'Input: a[1..n]; Output: the smallest missing positive integer', ro: 'Input: a[1..n]; Output: cel mai mic număr natural pozitiv lipsă' }, correct: false, feedback: { en: 'A different (harder) problem: unbounded input, no guarantee of {1..n}. Our problem guarantees the domain is exactly {1..n}.', ro: 'O altă problemă (mai grea): input nemărginit, fără garanție că e din {1..n}. Problema noastră garantează domeniul exact {1..n}.' } },
      { text: { en: 'Input: n, a[1..n−1]; Output: true if a number is missing', ro: 'Input: n, a[1..n−1]; Output: true dacă lipsește un număr' }, correct: false, feedback: { en: 'Trivially true by the problem setup (n−1 from n distinct values); we want to *identify* the missing value.', ro: 'Trivial adevărat din enunț (n−1 din n valori distincte); vrem să *identificăm* valoarea lipsă.' } },
      { text: { en: 'Input: a[1..n−1] sorted; Output: the missing number', ro: 'Input: a[1..n−1] sortat; Output: numărul lipsă' }, correct: false, feedback: { en: 'Adds an unneeded "sorted" constraint and drops n from the input; the problem does not assume a sorted array and n is essential.', ro: 'Adaugă o constrângere „sortat" inutilă și omite n din input; problema nu presupune vectorul sortat iar n este esențial.' } },
    ],
    explanation: {
      en: 'The input is n and an array of n−1 distinct values from {1..n}. The output is the single missing value. The array is not necessarily sorted. "Smallest missing positive" is a different, harder problem.',
      ro: 'Input-ul este n și un vector de n−1 valori distincte din {1..n}. Output-ul este singura valoare lipsă. Vectorul nu este neapărat sortat. „Cel mai mic pozitiv lipsă" este o altă problemă, mai dificilă.',
    },
  }];

  /* ─── Problem 7: Duplicate + missing ─── */
  const mc7 = [{
    question: {
      en: 'Which is the correct I/O formalization for "Given n numbers from 1 to n where one number appears twice and one is missing, find both"?',
      ro: 'Care este formalizarea corectă I/O pentru „Dându-se n numere de la 1 la n unde un număr apare de două ori și unul lipsește, găsiți ambele"?',
    },
    options: [
      { text: { en: 'Input: a[1..n], a[i] ∈ {1..n}, exactly one value appears twice; Output: (duplicate, missing)', ro: 'Input: a[1..n], a[i] ∈ {1..n}, exact o valoare apare de două ori; Output: (duplicat, lipsă)' }, correct: true },
      { text: { en: 'Input: a[1..n]; Output: the duplicate value only', ro: 'Input: a[1..n]; Output: doar valoarea duplicat' }, correct: false, feedback: { en: 'Returns only half the answer; we need both the duplicate *and* the missing value.', ro: 'Returnează doar jumătate din răspuns; avem nevoie atât de duplicat *cât* și de valoarea lipsă.' } },
      { text: { en: 'Input: a[1..n]; Output: all values that appear more than once', ro: 'Input: a[1..n]; Output: toate valorile care apar de mai mult de o dată' }, correct: false, feedback: { en: 'Misses the missing-value part, and the problem guarantees *exactly one* duplicate (no need for "all").', ro: 'Ratează partea cu valoarea lipsă, iar problema garantează *exact un* duplicat (nu e nevoie de „toate").' } },
      { text: { en: 'Input: a[1..n−1]; Output: (duplicate, missing)', ro: 'Input: a[1..n−1]; Output: (duplicat, lipsă)' }, correct: false, feedback: { en: 'Array length is n, not n−1: n slots, one duplicated, one missing — that is how the duplicate + missing setup works.', ro: 'Lungimea vectorului e n, nu n−1: n poziții, una duplicată, una lipsă — așa funcționează configurația duplicat + lipsă.' } },
    ],
    explanation: {
      en: 'The array has exactly n elements (not n−1): one value from {1..n} appears twice, one is missing. We need to find both the duplicate and the missing value.',
      ro: 'Vectorul are exact n elemente (nu n−1): o valoare din {1..n} apare de două ori, una lipsește. Trebuie să găsim atât duplicatul cât și valoarea lipsă.',
    },
  }];

  /* ─── Problem 8: Reductions ─── */
  const mc8 = [{
    question: {
      en: 'Which of the following reductions is correct?',
      ro: 'Care dintre următoarele reduceri este corectă?',
    },
    options: [
      { text: { en: 'All three: LCM reduces to GCD, set equality reduces to sorting, set disjunction reduces to sorting', ro: 'Toate trei: cmmmc se reduce la cmmdc, egalitatea de mulțimi se reduce la sortare, disjuncția de mulțimi se reduce la sortare' }, correct: true },
      { text: { en: 'Only LCM → GCD is valid; set operations cannot use sorting', ro: 'Doar cmmmc → cmmdc este validă; operațiile pe mulțimi nu pot folosi sortarea' }, correct: false, feedback: { en: 'Sorting is exactly what enables the O(n log n) linear scan for set equality and disjunction — it is the standard reduction.', ro: 'Sortarea este tocmai ce permite scanarea liniară O(n log n) pentru egalitate/disjuncție de mulțimi — e reducerea standard.' } },
      { text: { en: 'GCD reduces to LCM (not the other way around)', ro: 'Cmmdc se reduce la cmmmc (nu invers)' }, correct: false, feedback: { en: 'The identity LCM·GCD = a·b goes both ways, but by convention we reduce LCM → GCD because Euclid gives GCD in O(log min(a,b)).', ro: 'Identitatea cmmmc·cmmdc = a·b merge în ambele sensuri, dar prin convenție reducem cmmmc → cmmdc pentru că Euclid dă cmmdc în O(log min(a,b)).' } },
    ],
    explanation: {
      en: 'LCM(a,b) = a·b / GCD(a,b). For set equality: sort both sets, then compare element by element — O(n log n). For set disjunction: sort the union, then check for duplicates — O(n log n). All three are valid reductions.',
      ro: 'Cmmmc(a,b) = a·b / cmmdc(a,b). Pentru egalitatea mulțimilor: sortăm ambele mulțimi, apoi comparăm element cu element — O(n log n). Pentru disjuncția mulțimilor: sortăm reuniunea, apoi verificăm duplicatele — O(n log n). Toate trei sunt reduceri valide.',
    },
  }];

  /* ─── Problem 12: Theta proof ─── */
  const mc12 = [{
    question: {
      en: 'What does 0.5n² − 3n = Θ(n²) mean?',
      ro: 'Ce înseamnă 0.5n² − 3n = Θ(n²)?',
    },
    options: [
      { text: { en: 'There exist constants c₁, c₂ > 0 and n₀ such that c₁·n² ≤ 0.5n² − 3n ≤ c₂·n² for all n ≥ n₀', ro: 'Există constante c₁, c₂ > 0 și n₀ astfel încât c₁·n² ≤ 0.5n² − 3n ≤ c₂·n² pentru orice n ≥ n₀' }, correct: true },
      { text: { en: '0.5n² − 3n grows exactly as fast as n²', ro: '0.5n² − 3n crește exact la fel de repede ca n²' }, correct: false, feedback: { en: 'Close in spirit, but imprecise. Θ allows any constant-factor slack (c₁ ≤ ratio ≤ c₂), not literal equality of growth.', ro: 'Apropiat ca idee, dar imprecis. Θ admite orice interval de constante (c₁ ≤ raport ≤ c₂), nu egalitate literală de creștere.' } },
      { text: { en: '0.5n² − 3n ≤ n² for all n', ro: '0.5n² − 3n ≤ n² pentru orice n' }, correct: false, feedback: { en: 'That is only the upper bound (O(n²)); Θ also requires a matching lower bound c₁·n² ≤ 0.5n² − 3n eventually.', ro: 'Aceea e doar marginea superioară (O(n²)); Θ cere și o margine inferioară corespunzătoare c₁·n² ≤ 0.5n² − 3n de la un n₀.' } },
    ],
    explanation: {
      en: 'Θ(n²) means bounded both above AND below by n² (up to constants). Choose c₁ = 0.25, c₂ = 0.5, n₀ = 12. Then for n ≥ 12: 0.25n² ≤ 0.5n² − 3n ≤ 0.5n².',
      ro: 'Θ(n²) înseamnă mărginit atât superior CÂT ȘI inferior de n² (până la constante). Alegem c₁ = 0.25, c₂ = 0.5, n₀ = 12. Atunci pentru n ≥ 12: 0.25n² ≤ 0.5n² − 3n ≤ 0.5n².',
    },
  }];

  /* ─── Problem 17: Fibonacci search ─── */
  const mc17 = [{
    question: {
      en: 'How does Fibonacci search compare to binary search asymptotically in the worst case?',
      ro: 'Cum se compară căutarea Fibonacci cu căutarea binară din punct de vedere asimptotic în cazul cel mai nefavorabil?',
    },
    options: [
      { text: { en: 'Both are O(log n) — asymptotically equivalent in the worst case', ro: 'Ambele sunt O(log n) — echivalente asimptotic în cazul cel mai nefavorabil' }, correct: true },
      { text: { en: 'Fibonacci search is O(n), slower than binary search', ro: 'Căutarea Fibonacci este O(n), mai lentă decât căutarea binară' }, correct: false, feedback: { en: 'Fibonacci search still halves the range (roughly by the golden ratio); it is log-time, not linear.', ro: 'Căutarea Fibonacci tot înjumătățește intervalul (aproximativ cu raportul de aur); e timp logaritmic, nu liniar.' } },
      { text: { en: 'Fibonacci search is O(log log n), faster than binary search', ro: 'Căutarea Fibonacci este O(log log n), mai rapidă decât căutarea binară' }, correct: false, feedback: { en: 'O(log log n) is interpolation search on uniformly distributed data; Fibonacci search is plain O(log n).', ro: 'O(log log n) e căutarea prin interpolare pe date uniform distribuite; căutarea Fibonacci este simplu O(log n).' } },
    ],
    explanation: {
      en: 'Both binary search and Fibonacci search are O(log n) in the worst case. Fibonacci search may have practical advantages on systems where comparison is cheaper than division, since it uses only addition and subtraction.',
      ro: 'Atât căutarea binară cât și căutarea Fibonacci sunt O(log n) în cazul cel mai nefavorabil. Căutarea Fibonacci poate avea avantaje practice pe sisteme unde comparația este mai ieftină decât împărțirea, deoarece folosește doar adunări și scăderi.',
    },
  }];

  return (
    <>
      <p className="mb-4 text-sm opacity-80">
        {t(
          'Source: Algorithm Design Seminar 2 — Algorithm Efficiency Analysis, UAIC 2026. For each problem: test your understanding, then reveal the solution.',
          'Sursa: Seminar PA 2 — Analiza eficienței algoritmilor, UAIC 2026. Pentru fiecare problemă: testează-ți înțelegerea, apoi dezvăluie soluția.'
        )}
      </p>

      {/* ═══ Problem 1 ═══ */}
      <h3 className="text-lg font-bold mt-6 mb-2" style={{ color: 'var(--theme-content-text)' }}>{t('Problem 1: Two Smallest Indices', 'Problema 1: Indicii celor mai mici două elemente')}</h3>
      <Box type="definition">
        <p className="text-sm">{t(
          'Given an array of natural numbers with at least two elements, display two indices for the two smallest elements, ordered by value. Example: for [3, 5, 2, 7, 4, 1] output 5, 2.',
          'Dându-se un vector de numere naturale cu cel puțin două elemente, să se afișeze doi indici, pentru cele mai mici două elemente din vector, în ordine după valoarea elementelor. Exemplu: Pentru [3, 5, 2, 7, 4, 1] se va afișa 5, 2.'
        )}</p>
      </Box>
      <p className="text-sm font-semibold mt-3 mb-1">{t('Part A: I/O Formalization', 'Partea A: Formalizare I/O')}</p>
      <MultipleChoice questions={mc1a} />
      <p className="text-sm font-semibold mt-3 mb-1">{t('Part B: Is the given algorithm correct?', 'Partea B: Este algoritmul dat corect?')}</p>
      <MultipleChoice questions={mc1b} />
      <Toggle
        question={t('Show corrected algorithm & pseudocode', 'Arată algoritmul corectat și pseudocodul')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">{t('Bug', 'Eroare')}</p>
            <p className="text-sm mb-2">{t(
              'The given algorithm only updates nxtsml when a new global minimum is found (line 9-11). It misses the case where a[i] is between a[sml] and a[nxtsml]. We need an additional else-if branch.',
              'Algoritmul dat actualizează nxtsml doar când se găsește un nou minim global (liniile 9-11). Ratează cazul în care a[i] este între a[sml] și a[nxtsml]. Avem nevoie de o ramură else-if suplimentară.'
            )}</p>
            <p className="font-bold mb-1">{t('Corrected Pseudocode', 'Pseudocod corectat')}</p>
            <Code>{`Algorithm FirstSmallestInd(a)
  n ← a.size()
  if a[0] < a[1] then
    sml ← 0; nxtsml ← 1
  else
    sml ← 1; nxtsml ← 0
  for i ← 2 to n−1 do
    if a[i] < a[sml] then
      nxtsml ← sml
      sml ← i
    else if a[i] < a[nxtsml] then
      nxtsml ← i
  print sml
  print nxtsml`}</Code>
            <Box type="theorem">
              <p className="text-sm">{t('Time complexity: O(n). Space: O(1).', 'Complexitate timp: O(n). Spațiu: O(1).')}</p>
            </Box>
          </div>
        }
      />

      {/* ═══ Problem 2 ═══ */}
      <h3 className="text-lg font-bold mt-8 mb-2" style={{ color: 'var(--theme-content-text)' }}>{t('Problem 2: Fixed Point in Sorted Array', 'Problema 2: Punct fix într-un vector sortat')}</h3>
      <Box type="definition">
        <p className="text-sm">{t(
          'A fixed point in an array is an index i such that arr[i] == i. Given a sorted array of distinct integers, design an algorithm to find a fixed point if one exists, or return -1. Can you do better than O(n)?',
          'Un punct fix într-un vector este un indice i astfel încât arr[i] == i. Dându-se un vector sortat de numere întregi distincte, proiectați un algoritm pentru a găsi un punct fix dacă există unul sau returnați -1. Puteți mai bine decât O(n)?'
        )}</p>
      </Box>
      <MultipleChoice questions={mc2} />
      <Toggle
        question={t('Show algorithm & pseudocode', 'Arată algoritmul și pseudocodul')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">{t('Algorithm', 'Algoritm')}</p>
            <p className="text-sm mb-2">{t(
              'Since the array is sorted and elements are distinct, we can use binary search. If a[mid] == mid, we found it. If a[mid] < mid, all elements to the left also satisfy a[i] < i (because elements increase by at least 1 but indices increase by exactly 1), so search right. Similarly for a[mid] > mid, search left.',
              'Deoarece vectorul este sortat și elementele sunt distincte, putem folosi căutarea binară. Dacă a[mid] == mid, l-am găsit. Dacă a[mid] < mid, toate elementele din stânga satisfac și ele a[i] < i (deoarece elementele cresc cu cel puțin 1, dar indicii cresc cu exact 1), deci căutăm la dreapta. Similar pentru a[mid] > mid, căutăm la stânga.'
            )}</p>
            <p className="font-bold mb-1">{t('Pseudocode', 'Pseudocod')}</p>
            <Code>{`Algorithm FixedPoint(a[0..n−1])
  lo ← 0, hi ← n − 1
  while lo ≤ hi do
    mid ← ⌊(lo + hi) / 2⌋
    if a[mid] = mid then
      return mid
    else if a[mid] < mid then
      lo ← mid + 1
    else
      hi ← mid − 1
  return −1`}</Code>
            <Box type="theorem">
              <p className="text-sm">{t('Time complexity: O(log n). Key insight: sorted + distinct ⇒ a[i] − i is monotonically non-decreasing.', 'Complexitate timp: O(log n). Ideea cheie: sortat + distinct ⇒ a[i] − i este monoton nedescrescător.')}</p>
            </Box>
          </div>
        }
      />

      {/* ═══ Problem 3 ═══ */}
      <h3 className="text-lg font-bold mt-8 mb-2" style={{ color: 'var(--theme-content-text)' }}>{t('Problem 3: Majority Element (Boyer-Moore)', 'Problema 3: Element majoritar (Boyer-Moore)')}</h3>
      <Box type="definition">
        <p className="text-sm">{t(
          'A majority element in an array of size n is an element that appears more than n/2 times. Given an array of n natural numbers, return the majority element if it exists, or -1 otherwise.',
          'Un element majoritar dintr-un vector de dimensiune n este un element care apare de mai mult de n/2 ori. Dându-se un vector cu n elemente naturale, returnați elementul majoritar dacă există, sau -1 dacă nu există.'
        )}</p>
      </Box>
      <p className="text-sm font-semibold mt-3 mb-1">{t('Part A: I/O Formalization', 'Partea A: Formalizare I/O')}</p>
      <MultipleChoice questions={mc3a} />
      <p className="text-sm font-semibold mt-3 mb-1">{t('Part B: Why two passes?', 'Partea B: De ce două parcurgeri?')}</p>
      <MultipleChoice questions={mc3b} />
      <p className="text-sm font-semibold mt-3 mb-1">{t('Part C: Time complexity', 'Partea C: Complexitate timp')}</p>
      <MultipleChoice questions={mc3c} />
      <Toggle
        question={t('Show algorithm & pseudocode', 'Arată algoritmul și pseudocodul')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">{t('Algorithm (Boyer-Moore Voting)', 'Algoritm (Vot Boyer-Moore)')}</p>
            <p className="text-sm mb-2">{t(
              'Pass 1: Find a candidate by maintaining a counter. When counter reaches 0, pick the current element as the new candidate. Matching elements increment the counter, non-matching decrement it. Pass 2: Count actual occurrences of the candidate to verify.',
              'Pasul 1: Găsim un candidat menținând un contor. Când contorul ajunge la 0, alegem elementul curent ca noul candidat. Elementele care se potrivesc incrementează contorul, cele care nu se potrivesc îl decrementează. Pasul 2: Numărăm aparițiile reale ale candidatului pentru verificare.'
            )}</p>
            <p className="font-bold mb-1">{t('Pseudocode', 'Pseudocod')}</p>
            <Code>{`Algorithm getMajEl(A)
  candidate ← −1
  count ← 0
  n ← A.size
  // Pass 1: find candidate
  for i ← 0 to n−1 do
    if count = 0 then
      candidate ← A[i]
      count ← 1
    else if candidate = A[i] then
      count ← count + 1
    else
      count ← count − 1
  // Pass 2: verify
  occurrences ← 0
  for i ← 0 to n−1 do
    if A[i] = candidate then
      occurrences ← occurrences + 1
  if occurrences > ⌊n/2⌋ then
    return candidate
  else
    return −1`}</Code>
            <Box type="theorem">
              <p className="text-sm">{t('Time: O(n). Space: O(1). The algorithm is optimal — Ω(n) is a lower bound since every element must be inspected.', 'Timp: O(n). Spațiu: O(1). Algoritmul este optim — Ω(n) este o limită inferioară deoarece fiecare element trebuie inspectat.')}</p>
            </Box>
          </div>
        }
      />

      {/* ═══ Problem 4 ═══ */}
      <h3 className="text-lg font-bold mt-8 mb-2" style={{ color: 'var(--theme-content-text)' }}>{t('Problem 4: Big Number Operations', 'Problema 4: Operații pe numere mari')}</h3>
      <Box type="definition">
        <p className="text-sm">{t(
          'State the problems of adding/multiplying two natural numbers represented as digit arrays. Write algorithms and analyze their worst-case time complexity. Harder: write the Karatsuba multiplication algorithm with O(n^log₂(3)) complexity.',
          'Enunțați problemele adunării/înmulțirii a două numere naturale reprezentate ca șiruri de cifre. Scrieți algoritmi și analizați complexitatea lor în cazul cel mai nefavorabil. Mai greu: scrieți algoritmul Karatsuba cu complexitate O(n^log₂(3)).'
        )}</p>
      </Box>
      <MultipleChoice questions={mc4} />
      <Toggle
        question={t('Show algorithms & complexity', 'Arată algoritmii și complexitatea')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">{t('Addition — O(n)', 'Adunare — O(n)')}</p>
            <Code>{`Algorithm BigAdd(a[1..n], b[1..m])
  // a[1] = least significant digit
  carry ← 0
  len ← max(n, m)
  for i ← 1 to len do
    sum ← carry
    if i ≤ n then sum ← sum + a[i]
    if i ≤ m then sum ← sum + b[i]
    c[i] ← sum mod 10
    carry ← ⌊sum / 10⌋
  if carry > 0 then
    c[len+1] ← carry
  return c`}</Code>

            <p className="font-bold mt-3 mb-1">{t('Multiplication — O(n·m)', 'Înmulțire — O(n·m)')}</p>
            <Code>{`Algorithm BigMul(a[1..n], b[1..m])
  c[1..n+m] ← all 0
  for i ← 1 to n do
    carry ← 0
    for j ← 1 to m do
      prod ← a[i] · b[j] + c[i+j−1] + carry
      c[i+j−1] ← prod mod 10
      carry ← ⌊prod / 10⌋
    c[i+m] ← carry
  return c`}</Code>

            <p className="font-bold mt-3 mb-1">{t('Karatsuba Multiplication — O(n^1.585)', 'Înmulțire Karatsuba — O(n^1.585)')}</p>
            <p className="text-sm mb-2">{t(
              'Split each number into two halves: x = x₁·10^(n/2) + x₀. Then x·y = z₂·10^n + z₁·10^(n/2) + z₀ where z₂ = x₁·y₁, z₀ = x₀·y₀, z₁ = (x₁+x₀)·(y₁+y₀) − z₂ − z₀. Only 3 recursive multiplications instead of 4.',
              'Împărțim fiecare număr în două jumătăți: x = x₁·10^(n/2) + x₀. Atunci x·y = z₂·10^n + z₁·10^(n/2) + z₀ unde z₂ = x₁·y₁, z₀ = x₀·y₀, z₁ = (x₁+x₀)·(y₁+y₀) − z₂ − z₀. Doar 3 înmulțiri recursive în loc de 4.'
            )}</p>
            <Code>{`Algorithm Karatsuba(x, y, n)
  if n ≤ 2 then return x · y    // base case: naive multiply for 1–2 digit inputs
  m ← ⌈n/2⌉
  x₁, x₀ ← split x at position m
  y₁, y₀ ← split y at position m
  z₂ ← Karatsuba(x₁, y₁, m)
  z₀ ← Karatsuba(x₀, y₀, m)
  z₁ ← Karatsuba(x₁+x₀, y₁+y₀, m+1) − z₂ − z₀
  return z₂ · 10^(2m) + z₁ · 10^m + z₀`}</Code>
            <Box type="formula">
              <p className="text-sm">{t(
                'T(n) = 3T(n/2) + O(n) ⇒ T(n) = O(n^log₂(3)) ≈ O(n^1.585)',
                'T(n) = 3T(n/2) + O(n) ⇒ T(n) = O(n^log₂(3)) ≈ O(n^1,585)'
              )}</p>
            </Box>
          </div>
        }
      />

      {/* ═══ Problem 5 ═══ */}
      <h3 className="text-lg font-bold mt-8 mb-2" style={{ color: 'var(--theme-content-text)' }}>{t('Problem 5: Sorting — Bubble Sort & Selection Sort', 'Problema 5: Sortare — Bubble Sort și Selection Sort')}</h3>
      <Box type="definition">
        <p className="text-sm">{t(
          'State and formalize the sorting problem. Write bubble sort and selection sort. Prove their correctness. Compute their execution time for inputs 1,2,…,n and n,n−1,…,1.',
          'Enunțați și formalizați problema sortării. Scrieți bubble sort și selection sort. Demonstrați corectitudinea lor. Calculați timpul de execuție pentru intrările 1,2,…,n și n,n−1,…,1.'
        )}</p>
      </Box>
      <MultipleChoice questions={mc5} />
      <Toggle
        question={t('Show algorithms & complexity analysis', 'Arată algoritmii și analiza complexității')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">Bubble Sort</p>
            <Code>{`Algorithm BubbleSort(a[1..n])
  for i ← 1 to n−1 do
    for j ← 1 to n−i do
      if a[j] > a[j+1] then
        swap(a[j], a[j+1])`}</Code>
            <p className="text-sm mt-2 mb-1"><strong>{t('Invariant:', 'Invariant:')}</strong> {t(
              'After iteration i of the outer loop, the last i elements are in their final sorted position.',
              'După iterația i a buclei exterioare, ultimele i elemente sunt în pozițiile lor finale sortate.'
            )}</p>

            <p className="font-bold mt-3 mb-1">Selection Sort</p>
            <Code>{`Algorithm SelectionSort(a[1..n])
  for i ← 1 to n−1 do
    minIdx ← i
    for j ← i+1 to n do
      if a[j] < a[minIdx] then
        minIdx ← j
    swap(a[i], a[minIdx])`}</Code>
            <p className="text-sm mt-2 mb-1"><strong>{t('Invariant:', 'Invariant:')}</strong> {t(
              'After iteration i, a[1..i] contains the i smallest elements in sorted order.',
              'După iterația i, a[1..i] conține cele mai mici i elemente în ordine sortată.'
            )}</p>

            <Box type="formula">
              <p className="text-sm">
                <strong>{t('Complexity analysis:', 'Analiză complexitate:')}</strong><br />
                {t('Both algorithms:', 'Ambii algoritmi:')} {t('comparisons', 'comparații')} = n(n−1)/2 = O(n²)<br /><br />
                <strong>{t('Sorted input (1,2,…,n):', 'Input sortat (1,2,…,n):')}</strong><br />
                Bubble Sort: 0 {t('swaps', 'interschimbări')} — O(n²) {t('comparisons, 0 swaps', 'comparații, 0 interschimbări')}<br />
                Selection Sort: O(n²) {t('comparisons (always)', 'comparații (întotdeauna)')}<br /><br />
                <strong>{t('Reverse input (n,…,1):', 'Input invers (n,…,1):')}</strong><br />
                Bubble Sort: n(n−1)/2 {t('swaps', 'interschimbări')} — O(n²) {t('worst case', 'cazul cel mai nefavorabil')}<br />
                Selection Sort: n−1 {t('swaps', 'interschimbări')} — O(n²) {t('comparisons', 'comparații')}
              </p>
            </Box>
          </div>
        }
      />

      {/* ═══ Problem 6 ═══ */}
      <h3 className="text-lg font-bold mt-8 mb-2" style={{ color: 'var(--theme-content-text)' }}>{t('Problem 6: Missing Number', 'Problema 6: Numărul lipsă')}</h3>
      <Box type="definition">
        <p className="text-sm">{t(
          'Given n and n−1 distinct natural numbers between 1 and n, determine the missing number. Find the most efficient solution in terms of time and space.',
          'Dându-se un număr natural n și n−1 numere naturale distincte între 1 și n să se determine numărul lipsă. Găsiți soluții cât mai eficiente din punct de vedere al timpului de calcul și al necesarului de memorie.'
        )}</p>
      </Box>
      <MultipleChoice questions={mc6} />
      <Toggle
        question={t('Show algorithms & correctness proof', 'Arată algoritmii și demonstrația corectitudinii')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">{t('Solution 1: Sum formula — O(n) time, O(1) space', 'Soluția 1: Formula sumei — O(n) timp, O(1) spațiu')}</p>
            <Code>{`Algorithm MissingNumber(a[1..n−1], n)
  expected ← n · (n + 1) / 2
  actual ← 0
  for i ← 1 to n−1 do
    actual ← actual + a[i]
  return expected − actual`}</Code>
            <p className="text-sm mt-1 mb-2">{t(
              'Correctness: Sum of 1..n is n(n+1)/2. The missing number is the difference between the expected sum and the actual sum of the array.',
              'Corectitudine: Suma 1..n este n(n+1)/2. Numărul lipsă este diferența dintre suma așteptată și suma reală a vectorului.'
            )}</p>

            <p className="font-bold mb-1">{t('Solution 2: XOR — O(n) time, O(1) space', 'Soluția 2: XOR — O(n) timp, O(1) spațiu')}</p>
            <Code>{`Algorithm MissingNumberXOR(a[1..n−1], n)
  xorAll ← 0
  for i ← 1 to n do
    xorAll ← xorAll ⊕ i
  for i ← 1 to n−1 do
    xorAll ← xorAll ⊕ a[i]
  return xorAll`}</Code>
            <p className="text-sm mt-1">{t(
              'Correctness: x ⊕ x = 0 for any x. XOR-ing all values 1..n with all array elements cancels every number except the missing one. This avoids potential integer overflow from the sum method.',
              'Corectitudine: x ⊕ x = 0 pentru orice x. XOR-ul tuturor valorilor 1..n cu toate elementele vectorului anulează fiecare număr, cu excepția celui lipsă. Aceasta evită potențialul overflow de la metoda sumei.'
            )}</p>
          </div>
        }
      />

      {/* ═══ Problem 7 ═══ */}
      <h3 className="text-lg font-bold mt-8 mb-2" style={{ color: 'var(--theme-content-text)' }}>{t('Problem 7: Duplicate & Missing Number', 'Problema 7: Număr duplicat și lipsă')}</h3>
      <Box type="definition">
        <p className="text-sm">{t(
          'Same setup as above, but now one number appears twice and one number is missing. Formalize the problem and find both.',
          'Același exercițiu ca mai sus, dar de data aceasta un număr apare de două ori și un număr lipsește. Formalizați problema și găsiți ambele.'
        )}</p>
      </Box>
      <MultipleChoice questions={mc7} />
      <Toggle
        question={t('Show algorithm', 'Arată algoritmul')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">{t('Algorithm — O(n) time, O(1) space', 'Algoritm — O(n) timp, O(1) spațiu')}</p>
            <p className="text-sm mb-2">{t(
              'Let d = duplicate, m = missing. From sums: sum(a) − n(n+1)/2 = d − m. From sum of squares: sum(a²) − n(n+1)(2n+1)/6 = d² − m² = (d−m)(d+m). Dividing gives d+m. Solve the system.',
              'Fie d = duplicat, m = lipsă. Din sume: sum(a) − n(n+1)/2 = d − m. Din suma pătratelor: sum(a²) − n(n+1)(2n+1)/6 = d² − m² = (d−m)(d+m). Împărțind obținem d+m. Rezolvăm sistemul.'
            )}</p>
            <Code>{`Algorithm FindDupAndMissing(a[1..n], n)
  diffSum ← 0     // will be d − m
  diffSqSum ← 0   // will be d² − m²
  for i ← 1 to n do
    diffSum ← diffSum + a[i] − i
    diffSqSum ← diffSqSum + a[i]² − i²
  // diffSqSum = (d−m)(d+m), diffSum = d−m
  sumDM ← diffSqSum / diffSum   // d + m
  d ← (diffSum + sumDM) / 2
  m ← (sumDM − diffSum) / 2
  return (d, m)`}</Code>
          </div>
        }
      />

      {/* ═══ Problem 8 ═══ */}
      <h3 className="text-lg font-bold mt-8 mb-2" style={{ color: 'var(--theme-content-text)' }}>{t('Problem 8: Reductions', 'Problema 8: Reduceri')}</h3>
      <Box type="definition">
        <p className="text-sm">{t(
          'Formalize the following reductions: (a) LCM to GCD, (b) set equality to sorting, (c) set disjunction to sorting.',
          'Formalizați următoarele reduceri: (a) cmmmc la cmmdc, (b) egalitatea de mulțimi la sortare, (c) disjuncția de mulțimi la sortare.'
        )}</p>
      </Box>
      <MultipleChoice questions={mc8} />
      <Toggle
        question={t('Show formal reductions', 'Arată reducerile formale')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">{t('(a) LCM → GCD', '(a) Cmmmc → Cmmdc')}</p>
            <Box type="formula">
              <p className="text-sm">LCM(a, b) = a · b / GCD(a, b)</p>
            </Box>
            <p className="text-sm mb-2">{t(
              'If we can compute GCD, we can compute LCM in O(1) additional time. Using Euclid\'s algorithm: GCD is O(log(min(a,b))).',
              'Dacă putem calcula cmmdc, putem calcula cmmmc în O(1) timp suplimentar. Folosind algoritmul lui Euclid: cmmdc este O(log(min(a,b))).'
            )}</p>

            <p className="font-bold mb-1">{t('(b) Set equality → Sorting', '(b) Egalitatea mulțimilor → Sortare')}</p>
            <p className="text-sm mb-2">{t(
              'To check if A = B: sort both sets, then compare element by element. If sorted sequences are identical, sets are equal. Time: O(n log n) for sorting + O(n) for comparison.',
              'Pentru a verifica dacă A = B: sortăm ambele mulțimi, apoi comparăm element cu element. Dacă secvențele sortate sunt identice, mulțimile sunt egale. Timp: O(n log n) pentru sortare + O(n) pentru comparație.'
            )}</p>

            <p className="font-bold mb-1">{t('(c) Set disjunction → Sorting', '(c) Disjuncția mulțimilor → Sortare')}</p>
            <p className="text-sm">{t(
              'To check if A ∩ B = ∅: sort the union A ∪ B, then check for consecutive duplicates. If no duplicates exist, the sets are disjoint. Time: O((n+m) log(n+m)).',
              'Pentru a verifica dacă A ∩ B = ∅: sortăm reuniunea A ∪ B, apoi verificăm duplicatele consecutive. Dacă nu există duplicate, mulțimile sunt disjuncte. Timp: O((n+m) log(n+m)).'
            )}</p>
          </div>
        }
      />

      {/* ═══ Problems 9-11: Complexity definitions ═══ */}
      <h3 className="text-lg font-bold mt-8 mb-2" style={{ color: 'var(--theme-content-text)' }}>{t('Problems 9-11: Complexity Definitions', 'Problemele 9-11: Definiții de complexitate')}</h3>

      <Toggle
        question={t('Problem 9: How do we define O(f(n)) and Ω(f(n)) complexity of a problem?', 'Problema 9: Cum definim complexitatea O(f(n)) și Ω(f(n)) a unei probleme?')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <Box type="definition">
              <p className="text-sm">{t(
                'A problem P has complexity O(f(n)) if there exists an algorithm that solves P in time O(f(n)). A problem P has complexity Ω(f(n)) if every algorithm that solves P requires at least Ω(f(n)) time. The upper bound comes from a specific algorithm; the lower bound applies to ALL possible algorithms.',
                'O problemă P are complexitate O(f(n)) dacă există un algoritm care rezolvă P în timp O(f(n)). O problemă P are complexitate Ω(f(n)) dacă orice algoritm care rezolvă P necesită cel puțin Ω(f(n)) timp. Marginea superioară vine de la un algoritm specific; marginea inferioară se aplică TUTUROR algoritmilor posibili.'
              )}</p>
            </Box>
          </div>
        }
      />

      <Toggle
        question={t('Problem 10: What does it mean for an algorithm to be optimal for a problem?', 'Problema 10: Ce înseamnă algoritm optim pentru o problemă?')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <Box type="definition">
              <p className="text-sm">{t(
                'An algorithm A is optimal for a problem P if A solves P and its time complexity matches the lower bound of P. That is, if P has complexity Ω(f(n)) and A runs in O(f(n)), then A is optimal. Example: merge sort is optimal for comparison-based sorting since it is O(n log n) and the lower bound is Ω(n log n).',
                'Un algoritm A este optim pentru o problemă P dacă A rezolvă P și complexitatea sa temporală se potrivește cu marginea inferioară a lui P. Adică, dacă P are complexitate Ω(f(n)) și A rulează în O(f(n)), atunci A este optim. Exemplu: merge sort este optim pentru sortarea bazată pe comparații deoarece este O(n log n) și marginea inferioară este Ω(n log n).'
              )}</p>
            </Box>
          </div>
        }
      />

      <Toggle
        question={t('Problem 11: If algorithm A solves problem P in O(f) and f = O(g), then P has complexity O(g). Why?', 'Problema 11: Dacă algoritmul A rezolvă problema P în O(f) și f = O(g), atunci P are complexitate O(g). De ce?')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="text-sm">{t(
              'Since A solves P in time O(f), P has complexity O(f). Since f = O(g), by transitivity of O: O(f) ⊆ O(g). Therefore P has complexity O(g). Formally: ∃c₁,n₁: T_A(n) ≤ c₁·f(n) for n ≥ n₁, and ∃c₂,n₂: f(n) ≤ c₂·g(n) for n ≥ n₂. Then T_A(n) ≤ c₁·c₂·g(n) for n ≥ max(n₁,n₂).',
              'Deoarece A rezolvă P în timp O(f), P are complexitate O(f). Deoarece f = O(g), prin tranzitivitatea lui O: O(f) ⊆ O(g). Prin urmare P are complexitate O(g). Formal: ∃c₁,n₁: T_A(n) ≤ c₁·f(n) pentru n ≥ n₁, și ∃c₂,n₂: f(n) ≤ c₂·g(n) pentru n ≥ n₂. Atunci T_A(n) ≤ c₁·c₂·g(n) pentru n ≥ max(n₁,n₂).'
            )}</p>
          </div>
        }
      />

      {/* ═══ Problem 12 ═══ */}
      <h3 className="text-lg font-bold mt-8 mb-2" style={{ color: 'var(--theme-content-text)' }}>{t('Problem 12: Prove 0.5n² − 3n = Θ(n²)', 'Problema 12: Demonstrați că 0.5n² − 3n = Θ(n²)')}</h3>
      <MultipleChoice questions={mc12} />
      <Toggle
        question={t('Show proof', 'Arată demonstrația')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="text-sm mb-2">{t(
              'We need to find c₁, c₂ > 0 and n₀ such that c₁·n² ≤ 0.5n² − 3n ≤ c₂·n² for all n ≥ n₀.',
              'Trebuie să găsim c₁, c₂ > 0 și n₀ astfel încât c₁·n² ≤ 0.5n² − 3n ≤ c₂·n² pentru orice n ≥ n₀.'
            )}</p>
            <Box type="formula">
              <p className="text-sm">
                <strong>{t('Upper bound:', 'Marginea superioară:')}</strong> 0.5n² − 3n ≤ 0.5n² ≤ 0.5·n² → c₂ = 0.5<br /><br />
                <strong>{t('Lower bound:', 'Marginea inferioară:')}</strong> 0.5n² − 3n = n²(0.5 − 3/n) ≥ 0.25n² {t('when', 'când')} 3/n ≤ 0.25, {t('i.e.', 'adică')} n ≥ 12<br /><br />
                → c₁ = 0.25, c₂ = 0.5, n₀ = 12 ✓
              </p>
            </Box>
          </div>
        }
      />

      {/* ═══ Problems 13-14: Asymptotic proofs ═══ */}
      <h3 className="text-lg font-bold mt-8 mb-2" style={{ color: 'var(--theme-content-text)' }}>{t('Problems 13-14: Asymptotic Properties', 'Problemele 13-14: Proprietăți asimptotice')}</h3>

      <Toggle
        question={t('Problem 13: If f is a polynomial of degree k, then f(n) ∈ Θ(nᵏ)', 'Problema 13: Dacă f este polinom de grad k, atunci f(n) ∈ Θ(nᵏ)')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="text-sm">{t(
              'Let f(n) = aₖnᵏ + aₖ₋₁nᵏ⁻¹ + … + a₁n + a₀ with aₖ > 0.',
              'Fie f(n) = aₖnᵏ + aₖ₋₁nᵏ⁻¹ + … + a₁n + a₀ cu aₖ > 0.'
            )}</p>
            <Box type="formula">
              <p className="text-sm">
                <strong>O(nᵏ):</strong> f(n) ≤ (|aₖ| + |aₖ₋₁| + … + |a₀|) · nᵏ {t('for', 'pentru')} n ≥ 1<br /><br />
                <strong>Ω(nᵏ):</strong> f(n)/nᵏ = aₖ + aₖ₋₁/n + … + a₀/nᵏ → aₖ {t('as', 'când')} n → ∞<br />
                {t('So for large enough n:', 'Deci pentru n suficient de mare:')} f(n) ≥ (aₖ/2) · nᵏ<br /><br />
                {t('Therefore', 'Prin urmare')} f(n) ∈ Θ(nᵏ) ✓
              </p>
            </Box>
          </div>
        }
      />

      <Toggle
        question={t('Problem 14: Prove that Θ(f) = O(f) ∩ Ω(f)', 'Problema 14: Demonstrați că Θ(f) = O(f) ∩ Ω(f)')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="text-sm">{t(
              'By definition, g ∈ Θ(f) iff ∃c₁,c₂ > 0, n₀: c₁·f(n) ≤ g(n) ≤ c₂·f(n) for all n ≥ n₀.',
              'Prin definiție, g ∈ Θ(f) dacă și numai dacă ∃c₁,c₂ > 0, n₀: c₁·f(n) ≤ g(n) ≤ c₂·f(n) pentru orice n ≥ n₀.'
            )}</p>
            <Box type="formula">
              <p className="text-sm">
                g(n) ≤ c₂·f(n) ⟺ g ∈ O(f)<br />
                g(n) ≥ c₁·f(n) ⟺ g ∈ Ω(f)<br /><br />
                {t('Both conditions together ⟺ g ∈ O(f) ∩ Ω(f) ⟺ g ∈ Θ(f)', 'Ambele condiții împreună ⟺ g ∈ O(f) ∩ Ω(f) ⟺ g ∈ Θ(f)')} ✓
              </p>
            </Box>
          </div>
        }
      />

      {/* ═══ Problem 15 ═══ */}
      <h3 className="text-lg font-bold mt-8 mb-2" style={{ color: 'var(--theme-content-text)' }}>{t('Problem 15: Recurrence T(n) = 2T(n/2) + Θ(n)', 'Problema 15: Recurența T(n) = 2T(n/2) + Θ(n)')}</h3>
      <Box type="definition">
        <p className="text-sm">{t(
          'Let T(n) = Θ(1) if n = 1, and T(n) = 2T(n/2) + Θ(n) if n > 1. Prove that T(n) = Θ(n log n).',
          'Fie T(n) = Θ(1) dacă n = 1, și T(n) = 2T(n/2) + Θ(n) dacă n > 1. Arătați că T(n) = Θ(n log n).'
        )}</p>
      </Box>
      <Toggle
        question={t('Show proof', 'Arată demonstrația')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">{t('Method: Recursion tree', 'Metodă: Arborele recurenței')}</p>
            <p className="text-sm mb-2">{t(
              'At each level of the recursion tree, the total work is Θ(n). The tree has log₂(n) levels (since we halve n each time). Total work = Θ(n) × log₂(n) = Θ(n log n).',
              'La fiecare nivel al arborelui de recurență, lucrul total este Θ(n). Arborele are log₂(n) niveluri (deoarece înjumătățim n la fiecare pas). Lucrul total = Θ(n) × log₂(n) = Θ(n log n).'
            )}</p>
            <Box type="formula">
              <p className="text-sm">
                {t('Level 0: 1 problem of size n → work = c·n', 'Nivelul 0: 1 problemă de dimensiune n → lucru = c·n')}<br />
                {t('Level 1: 2 problems of size n/2 → work = 2·c·n/2 = c·n', 'Nivelul 1: 2 probleme de dimensiune n/2 → lucru = 2·c·n/2 = c·n')}<br />
                {t('Level 2: 4 problems of size n/4 → work = 4·c·n/4 = c·n', 'Nivelul 2: 4 probleme de dimensiune n/4 → lucru = 4·c·n/4 = c·n')}<br />
                …<br />
                {t('Level log₂(n): n problems of size 1 → work = n·Θ(1) = Θ(n)', 'Nivelul log₂(n): n probleme de dimensiune 1 → lucru = n·Θ(1) = Θ(n)')}<br /><br />
                {t('Total:', 'Total:')} (log₂(n) + 1) · c·n = Θ(n log n) ✓
              </p>
            </Box>
            <p className="text-sm mt-2">{t(
              'This also follows from the Master Theorem: T(n) = aT(n/b) + f(n) with a=2, b=2, f(n)=Θ(n). Since log_b(a) = 1 and f(n) = Θ(n^1), we are in Case 2: T(n) = Θ(n log n).',
              'Aceasta rezultă și din Teorema Master: T(n) = aT(n/b) + f(n) cu a=2, b=2, f(n)=Θ(n). Deoarece log_b(a) = 1 și f(n) = Θ(n^1), suntem în Cazul 2: T(n) = Θ(n log n).'
            )}</p>
          </div>
        }
      />

      {/* ═══ Problem 16 ═══ */}
      <h3 className="text-lg font-bold mt-8 mb-2" style={{ color: 'var(--theme-content-text)' }}>{t('Problem 16: Induction Proof — f(n) = 3ⁿ − 2ⁿ', 'Problema 16: Demonstrație prin inducție — f(n) = 3ⁿ − 2ⁿ')}</h3>
      <Box type="definition">
        <p className="text-sm">{t(
          'Prove by induction that the following function returns 3ⁿ − 2ⁿ:',
          'Arătați prin inducție că următoarea funcție întoarce rezultatul 3ⁿ − 2ⁿ:'
        )}</p>
        <Code>{`f(n) {
  if (n == 0 || n == 1) return n;
  return 5 * f(n-1) - 6 * f(n-2);
}`}</Code>
      </Box>
      <Toggle
        question={t('Show induction proof', 'Arată demonstrația prin inducție')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="text-sm">
              <strong>{t('Base cases:', 'Cazuri de bază:')}</strong><br />
              f(0) = 0 = 3⁰ − 2⁰ = 1 − 1 = 0 ✓<br />
              f(1) = 1 = 3¹ − 2¹ = 3 − 2 = 1 ✓
            </p>
            <p className="text-sm mt-2">
              <strong>{t('Inductive step:', 'Pasul inductiv:')}</strong><br />
              {t('Assume f(k) = 3ᵏ − 2ᵏ and f(k−1) = 3ᵏ⁻¹ − 2ᵏ⁻¹ for some k ≥ 1.', 'Presupunem f(k) = 3ᵏ − 2ᵏ și f(k−1) = 3ᵏ⁻¹ − 2ᵏ⁻¹ pentru un k ≥ 1.')}
            </p>
            <Box type="formula">
              <p className="text-sm">
                f(k+1) = 5·f(k) − 6·f(k−1)<br />
                = 5·(3ᵏ − 2ᵏ) − 6·(3ᵏ⁻¹ − 2ᵏ⁻¹)<br />
                = 5·3ᵏ − 5·2ᵏ − 6·3ᵏ⁻¹ + 6·2ᵏ⁻¹<br />
                = 5·3ᵏ − 2·3ᵏ − 5·2ᵏ + 3·2ᵏ<br />
                = 3ᵏ(5 − 2) − 2ᵏ(5 − 3)<br />
                = 3ᵏ·3 − 2ᵏ·2<br />
                = 3ᵏ⁺¹ − 2ᵏ⁺¹ ✓
              </p>
            </Box>
            <p className="text-sm mt-2">{t(
              'Note: The characteristic equation x² − 5x + 6 = 0 has roots 3 and 2 (since 5 = 3+2 and 6 = 3·2), which is why the closed form involves 3ⁿ and 2ⁿ.',
              'Notă: Ecuația caracteristică x² − 5x + 6 = 0 are rădăcinile 3 și 2 (deoarece 5 = 3+2 și 6 = 3·2), de aceea forma închisă implică 3ⁿ și 2ⁿ.'
            )}</p>
          </div>
        }
      />

      {/* ═══ Problem 17 ═══ */}
      <h3 className="text-lg font-bold mt-8 mb-2" style={{ color: 'var(--theme-content-text)' }}>{t('Problem 17: Fibonacci Search', 'Problema 17: Căutarea Fibonacci')}</h3>
      <Box type="definition">
        <p className="text-sm">{t(
          'Write the Fibonacci search algorithm for searching a value in a sorted array. Analyze its complexity relative to binary search. Are they asymptotically equivalent in the worst case?',
          'Scrieți algoritmul căutării Fibonacci pentru problema căutării unei valori într-un vector sortat. Analizați complexitatea algoritmului relativ la căutarea binară. Sunt algoritmii la fel de eficienți din punct de vedere asimptotic în cazul cel mai nefavorabil?'
        )}</p>
      </Box>
      <MultipleChoice questions={mc17} />
      <Toggle
        question={t('Show algorithm & analysis', 'Arată algoritmul și analiza')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">{t('Algorithm', 'Algoritm')}</p>
            <p className="text-sm mb-2">{t(
              'Instead of dividing the array in half (binary search), divide it according to Fibonacci numbers. Find the smallest Fibonacci number ≥ n, then progressively narrow the search range using Fibonacci number offsets.',
              'În loc să împărțim vectorul în jumătate (căutare binară), îl împărțim conform numerelor Fibonacci. Găsim cel mai mic număr Fibonacci ≥ n, apoi restrângem progresiv intervalul de căutare folosind offseturi Fibonacci.'
            )}</p>
            <Code>{`Algorithm FibSearch(a[0..n−1], target)
  // Find smallest Fibonacci number ≥ n
  fib2 ← 0, fib1 ← 1
  fib ← fib2 + fib1
  while fib < n do
    fib2 ← fib1
    fib1 ← fib
    fib ← fib2 + fib1
  offset ← −1
  while fib > 1 do
    i ← min(offset + fib2, n − 1)
    if a[i] < target then
      fib ← fib1
      fib1 ← fib2
      fib2 ← fib − fib1
      offset ← i
    else if a[i] > target then
      fib ← fib2
      fib1 ← fib1 − fib2
      fib2 ← fib − fib1
    else
      return i
  if fib1 = 1 AND offset+1 < n AND a[offset+1] = target then
    return offset + 1
  return −1`}</Code>
            <Box type="theorem">
              <p className="text-sm">{t(
                'Both are O(log n) in the worst case — asymptotically equivalent. Fibonacci search uses only + and − (no division), which may be faster on some hardware. Conclusion: the search problem in a sorted array has complexity Θ(log n).',
                'Ambele sunt O(log n) în cazul cel mai nefavorabil — echivalente asimptotic. Căutarea Fibonacci folosește doar + și − (fără împărțire), ceea ce poate fi mai rapid pe unele arhitecturi. Concluzie: problema căutării într-un vector ordonat are complexitate Θ(log n).'
              )}</p>
            </Box>
          </div>
        }
      />

      {/* ═══ Problem 18 ═══ */}
      <h3 className="text-lg font-bold mt-8 mb-2" style={{ color: 'var(--theme-content-text)' }}>{t('Problem 18: Heapsort', 'Problema 18: Heapsort')}</h3>
      <Box type="definition">
        <p className="text-sm">{t(
          'Implement the heapsort algorithm and write relevant tests showing it works correctly.',
          'Implementați algoritmul heapsort și scrieți teste relevante care să arate că algoritmul funcționează conform descrierii problemei.'
        )}</p>
      </Box>
      <Toggle
        question={t('Show algorithm & pseudocode', 'Arată algoritmul și pseudocodul')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">{t('Algorithm', 'Algoritm')}</p>
            <p className="text-sm mb-2">{t(
              'Heapsort works in two phases: (1) Build a max-heap from the array using bottom-up heapify. (2) Repeatedly extract the maximum (root) by swapping it to the end and restoring the heap property.',
              'Heapsort funcționează în două faze: (1) Construim un max-heap din vector folosind heapify bottom-up. (2) Extragem repetat maximul (rădăcina) prin interschimbare la final și restaurarea proprietății de heap.'
            )}</p>
            <Code>{`Algorithm Heapify(a, n, i)
  largest ← i
  left ← 2·i + 1
  right ← 2·i + 2
  if left < n AND a[left] > a[largest] then
    largest ← left
  if right < n AND a[right] > a[largest] then
    largest ← right
  if largest ≠ i then
    swap(a[i], a[largest])
    Heapify(a, n, largest)

Algorithm HeapSort(a[0..n−1])
  // Build max-heap
  for i ← ⌊n/2⌋ − 1 downto 0 do
    Heapify(a, n, i)
  // Extract elements
  for i ← n − 1 downto 1 do
    swap(a[0], a[i])
    Heapify(a, i, 0)`}</Code>
            <Box type="theorem">
              <p className="text-sm">
                {t('Time complexity: O(n log n) in all cases (best, average, worst).', 'Complexitate timp: O(n log n) în toate cazurile (cel mai bun, mediu, cel mai nefavorabil).')}<br />
                {t('Space: O(1) auxiliary (in-place).', 'Spațiu: O(1) auxiliar (in-place).')}<br />
                {t('Build heap: O(n). Each extraction: O(log n) × n extractions = O(n log n).', 'Construire heap: O(n). Fiecare extracție: O(log n) × n extracții = O(n log n).')}
              </p>
            </Box>
            <p className="font-bold mt-3 mb-1">{t('Test cases', 'Cazuri de test')}</p>
            <ul className="text-sm list-disc pl-5 space-y-1">
              <li>{t('Already sorted: [1, 2, 3, 4, 5] → [1, 2, 3, 4, 5]', 'Deja sortat: [1, 2, 3, 4, 5] → [1, 2, 3, 4, 5]')}</li>
              <li>{t('Reverse sorted: [5, 4, 3, 2, 1] → [1, 2, 3, 4, 5]', 'Sortat invers: [5, 4, 3, 2, 1] → [1, 2, 3, 4, 5]')}</li>
              <li>{t('Duplicates: [3, 1, 3, 2, 1] → [1, 1, 2, 3, 3]', 'Duplicate: [3, 1, 3, 2, 1] → [1, 1, 2, 3, 3]')}</li>
              <li>{t('Single element: [42] → [42]', 'Un element: [42] → [42]')}</li>
              <li>{t('Two elements: [2, 1] → [1, 2]', 'Două elemente: [2, 1] → [1, 2]')}</li>
              <li>{t('All equal: [7, 7, 7] → [7, 7, 7]', 'Toate egale: [7, 7, 7] → [7, 7, 7]')}</li>
            </ul>
          </div>
        }
      />
    </>
  );
}
