import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import MultipleChoice from '../../../components/ui/MultipleChoice';
import CourseBlock from '../../../components/ui/CourseBlock';
import Code from '../../../components/ui/Code';

/* ═══════════════════════════════════════════════════════════
   Section 1: Algorithm Design & Analysis
   ═══════════════════════════════════════════════════════════ */
const designQuestions = [
  {
    question: { en: '1. Given the problem: "Is array a strictly increasing?" — which is the correct (Input, Output)?', ro: '1. Dată problema: „Este tabloul a ordonat strict crescător?" — care este perechea (Input, Output) corectă?' },
    options: [
      { text: { en: 'Input: a = (a[0],...,a[m-1]), aᵢ ∈ ℤ. Output: true if a₀ ≤ ... ≤ aₘ₋₁', ro: 'Input: a = (a[0],...,a[m-1]), aᵢ ∈ ℤ. Output: true dacă a₀ ≤ ... ≤ aₘ₋₁' }, correct: false, feedback: { en: 'Uses ≤ (non-strict); strictly increasing requires <.', ro: 'Folosește ≤ (nestrict); strict crescător cere <.' } },
      { text: { en: 'Input: a = (a[0],...,a[m-1]), aᵢ ∈ ℤ. Output: true if a₀ < ... < aₘ₋₁', ro: 'Input: a = (a[0],...,a[m-1]), aᵢ ∈ ℤ. Output: true dacă a₀ < ... < aₘ₋₁' }, correct: true },
      { text: { en: 'Input: a = (a[0],...,a[m-1]), aᵢ ∈ ℕ. Output: true if a₀ < ... < aₘ₋₁', ro: 'Input: a = (a[0],...,a[m-1]), aᵢ ∈ ℕ. Output: true dacă a₀ < ... < aₘ₋₁' }, correct: false, feedback: { en: 'Elements should be integers (ℤ), not just naturals (ℕ).', ro: 'Elementele sunt întregi (ℤ), nu doar naturale (ℕ).' } },
      { text: { en: 'Input: a = (a[0],...,a[m-1]), aᵢ ∈ ℤ. Output: the sorted array', ro: 'Input: a = (a[0],...,a[m-1]), aᵢ ∈ ℤ. Output: tabloul sortat' }, correct: false, feedback: { en: 'Output should be a boolean (is/isn\'t increasing), not the sorted array.', ro: 'Output-ul e boolean (este/nu e crescător), nu vectorul sortat.' } },
    ],
    explanation: { en: 'Strictly increasing requires < (not ≤). The elements are integers (ℤ), not just naturals (ℕ). The output is a boolean, not a sorted array.', ro: 'Strict crescător necesită < (nu ≤). Elementele sunt numere întregi (ℤ), nu doar naturale (ℕ). Output-ul este boolean, nu tabloul sortat.' },
  },
  {
    question: { en: '2. What is the loop invariant of the `isinc` algorithm (strictly-increasing check)?', ro: '2. Care este invariantul buclei din algoritmul `isinc` (verificarea strictă crescător)?' },
    options: [
      { text: { en: 'a[0..i] is sorted in non-decreasing order', ro: 'a[0..i] este ordonat nedescrescător' }, correct: false, feedback: { en: 'Non-decreasing allows equal adjacent elements; isinc requires strict increase.', ro: 'Nedescrescător admite elemente egale; isinc cere strict crescător.' } },
      { text: { en: 'a[0..i] is sorted in strictly increasing order and i ≤ m-1', ro: 'a[0..i] este ordonat strict crescător și i ≤ m-1' }, correct: true },
      { text: { en: 'a[i] < a[i+1] for all valid i', ro: 'a[i] < a[i+1] pentru orice i valid' }, correct: false, feedback: { en: 'Describes the goal, not the *invariant maintained during iteration* (which is about a[0..i]).', ro: 'Descrie obiectivul, nu *invariantul menținut în timpul iterației* (care se referă la a[0..i]).' } },
      { text: { en: 'The minimum element is at position i', ro: 'Elementul minim este pe poziția i' }, correct: false, feedback: { en: 'Unrelated: isinc checks ordering, not the position of the minimum.', ro: 'Fără legătură: isinc verifică ordonarea, nu poziția minimului.' } },
    ],
    explanation: { en: 'The invariant states that the subarray a[0..i] is strictly increasing AND i ≤ m-1. This is maintained by only incrementing i when a[i] < a[i+1].', ro: 'Invariantul afirmă că subșirul a[0..i] este strict crescător ȘI i ≤ m-1. Acesta este menținut prin incrementarea lui i doar când a[i] < a[i+1].' },
  },
  {
    question: { en: '3. Problem M35: sum of all multiples of 3 or 5 less than N (N multiple of 10). What is the worst-case time complexity?', ro: '3. Problema M35: suma tuturor multiplilor de 3 sau 5 mai mici decât N (N multiplu de 10). Care este complexitatea timp în cazul cel mai nefavorabil?' },
    options: [
      { text: 'O(1)', correct: false, feedback: { en: 'Sublinear — ignores that we must scan ~N candidates.', ro: 'Subliniar — ignoră că trebuie scanate ~N candidate.' } },
      { text: 'O(log N)', correct: false, feedback: { en: 'Logarithmic requires halving; here we walk 3..N-1 linearly.', ro: 'Logaritmic cere înjumătățire; aici parcurgem 3..N-1 liniar.' } },
      { text: 'O(N)', correct: true },
      { text: 'O(N²)', correct: false, feedback: { en: 'Quadratic would need a nested loop; only one loop runs here.', ro: 'Pătratic ar cere buclă imbricată; aici e o singură buclă.' } },
    ],
    explanation: { en: 'The algorithm iterates from 3 to N-1, performing O(1) work per iteration. Total: O(N).', ro: 'Algoritmul iterează de la 3 la N-1, efectuând O(1) operații per iterație. Total: O(N).' },
  },
  {
    question: { en: '4. For the problem D1M (smallest number divisible by all numbers 1..M), what is the worst-case complexity?', ro: '4. Pentru problema D1M (cel mai mic număr divizibil cu toate numerele 1..M), care este complexitatea în cazul cel mai nefavorabil?' },
    options: [
      { text: 'O(M)', correct: false, feedback: { en: 'Ignores that we must *find* N, which can be as large as M!.', ro: 'Ignoră că trebuie să *găsim* N, care poate fi până la M!.' } },
      { text: 'O(M²)', correct: false, feedback: { en: 'Still ignores the growth of N; N scales exponentially in M (up to M!).', ro: 'Tot ignoră creșterea lui N; N crește exponențial în M (până la M!).' } },
      { text: 'O(N · M), where N ≤ M!', correct: true },
      { text: 'O(M log M)', correct: false, feedback: { en: 'Log-linear scaling requires halving; here we test each candidate from 1 up linearly.', ro: 'Scalare log-liniară cere înjumătățire; aici testăm fiecare candidat de la 1 liniar.' } },
    ],
    explanation: { en: 'The algorithm tests each candidate N from 1 upward, checking divisibility by all 1..M. The answer N can be as large as M!, giving O(N·M).', ro: 'Algoritmul testează fiecare candidat N de la 1 în sus, verificând divizibilitatea cu toate 1..M. Răspunsul N poate fi până la M!, dând O(N·M).' },
  },
  {
    question: { en: '5. Testing if a list represents a set (no duplicates). What is the worst-case complexity of the double-loop algorithm?', ro: '5. Testarea dacă o listă reprezintă o mulțime (fără duplicate). Care este complexitatea în cazul cel mai nefavorabil a algoritmului cu două bucle for?' },
    options: [
      { text: 'O(n)', correct: false, feedback: { en: 'Single-pass bound; double-loop comparing all pairs is Θ(n²).', ro: 'Margine pentru o singură parcurgere; dubla buclă peste toate perechile e Θ(n²).' } },
      { text: 'O(n log n)', correct: false, feedback: { en: 'That is the bound for sort-then-scan, not for the naive double loop.', ro: 'Aceea e marginea pentru sortare + parcurgere, nu pentru dubla buclă naivă.' } },
      { text: 'O(n²)', correct: true },
      { text: 'O(n³)', correct: false, feedback: { en: 'Only two nested loops here, not three.', ro: 'Doar două bucle imbricate aici, nu trei.' } },
    ],
    explanation: { en: 'The algorithm compares all n(n-1)/2 pairs (i,j) with i < j. Worst case is when the list IS a set (both loops run completely).', ro: 'Algoritmul compară toate cele n(n-1)/2 perechi (i,j) cu i < j. Cazul cel mai nefavorabil este când lista ESTE o mulțime (ambele bucle se execută complet).' },
  },
  {
    question: { en: '6. When is the worst case for isinc (testing strictly increasing)?', ro: '6. Când apare cazul cel mai nefavorabil pentru isinc (testarea dacă este strict crescător)?' },
    options: [
      { text: { en: 'When the array is sorted in decreasing order', ro: 'Când tabloul este ordonat descrescător' }, correct: false, feedback: { en: 'Best case — isinc fails at a[0] vs a[1], returning early after 1 comparison.', ro: 'Cel mai bun caz — isinc eșuează la a[0] vs a[1], revine devreme după 1 comparație.' } },
      { text: { en: 'When the first two elements are equal', ro: 'Când primele două elemente sunt egale' }, correct: false, feedback: { en: 'Also a best case — fails on the first comparison.', ro: 'Tot caz favorabil — eșuează la prima comparație.' } },
      { text: { en: 'When the array is already strictly increasing', ro: 'Când tabloul este deja strict crescător' }, correct: true },
      { text: { en: 'When all elements are equal', ro: 'Când toate elementele sunt egale' }, correct: false, feedback: { en: 'Best case — duplicate at first pair triggers immediate false return.', ro: 'Cel mai bun caz — duplicatul pe prima pereche forțează return false imediat.' } },
    ],
    explanation: { en: 'Worst case is when the algorithm cannot return false early — the loop runs completely. This happens when the array IS strictly increasing (possibly except the last two elements).', ro: 'Cazul cel mai nefavorabil este când algoritmul nu poate returna false devreme — bucla se execută complet. Aceasta se întâmplă când tabloul ESTE strict crescător.' },
  },
  {
    question: { en: '7. x is a pentagonal number if x = n(3n-1)/2 for some natural n. What equation must n satisfy?', ro: '7. x este un număr pentagonal dacă x = n(3n-1)/2 pentru un n natural. Ce ecuație trebuie să satisfacă n?' },
    options: [
      { text: '2n² - n - x = 0', correct: false, feedback: { en: 'Drops the factor 3 on n² — that is the hexagonal equation, not pentagonal.', ro: 'Omite factorul 3 la n² — aceea e ecuația hexagonală, nu pentagonală.' } },
      { text: '3n² - n - 2x = 0', correct: true },
      { text: 'n² + n - 2x = 0', correct: false, feedback: { en: 'Coefficient 1 on n² and wrong sign on n — that is triangular, not pentagonal.', ro: 'Coeficient 1 pe n² și semn greșit pe n — aceea e triunghiulară, nu pentagonală.' } },
      { text: '3n² + n - 2x = 0', correct: false, feedback: { en: 'Sign error on n: from x = n(3n−1)/2 we get 2x = 3n² − n (minus n, not plus).', ro: 'Semn greșit pe n: din x = n(3n−1)/2 avem 2x = 3n² − n (minus n, nu plus).' } },
    ],
    explanation: { en: 'From x = n(3n-1)/2, multiply by 2: 2x = 3n² - n, so 3n² - n - 2x = 0. The natural root is n = (1 + √(1+24x))/6.', ro: 'Din x = n(3n-1)/2, înmulțim cu 2: 2x = 3n² - n, deci 3n² - n - 2x = 0. Rădăcina naturală este n = (1 + √(1+24x))/6.' },
  },
  {
    question: { en: '8. For the hexagonal number check isHexagonal(x), what condition verifies that x is hexagonal?', ro: '8. Pentru verificarea numărului hexagonal isHexagonal(x), ce condiție verifică că x este hexagonal?' },
    options: [
      { text: { en: '√(1+8x) is a natural number AND (1+√(1+8x)) is divisible by 6', ro: '√(1+8x) este un număr natural ȘI (1+√(1+8x)) este divizibil cu 6' }, correct: false, feedback: { en: 'Divisor should be 4 (from 4 in the denominator of n = (1+√(1+8x))/4), not 6.', ro: 'Divizorul ar trebui 4 (din numitorul lui n = (1+√(1+8x))/4), nu 6.' } },
      { text: { en: '√(1+8x) is a natural number AND (1+√(1+8x)) is divisible by 4', ro: '√(1+8x) este un număr natural ȘI (1+√(1+8x)) este divizibil cu 4' }, correct: true },
      { text: { en: '√(1+6x) is a natural number AND (1+√(1+6x)) is divisible by 4', ro: '√(1+6x) este un număr natural ȘI (1+√(1+6x)) este divizibil cu 4' }, correct: false, feedback: { en: 'Discriminant should be 1+8x (from 2n²−n−x), not 1+6x.', ro: 'Discriminantul ar trebui 1+8x (din 2n²−n−x), nu 1+6x.' } },
      { text: { en: '√(1+8x) is a natural number AND (1+√(1+8x)) is divisible by 2', ro: '√(1+8x) este un număr natural ȘI (1+√(1+8x)) este divizibil cu 2' }, correct: false, feedback: { en: 'Divisor 2 is too small — n = (1+√(1+8x))/4 requires divisibility by 4.', ro: 'Divizorul 2 e prea mic — n = (1+√(1+8x))/4 cere divizibilitate cu 4.' } },
    ],
    explanation: { en: 'H(n) = n(2n-1), so 2n²-n-x = 0. The discriminant is 1+8x, and n = (1+√(1+8x))/4. So √(1+8x) must be natural and (1+b) must be divisible by 4.', ro: 'H(n) = n(2n-1), deci 2n²-n-x = 0. Discriminantul este 1+8x, iar n = (1+√(1+8x))/4. Deci √(1+8x) trebuie să fie natural și (1+b) trebuie să fie divizibil cu 4.' },
  },
  {
    question: { en: '9. For the cube decomposition D(m), what is D(100)?', ro: '9. Pentru descompunerea în cuburi D(m), cât este D(100)?' },
    options: [
      { text: '3', correct: false, feedback: { en: 'Miscount — 100 − 4³ = 36 counts as step 1, then 36 − 3³ = 9, then 9 − 2³ = 1, then 1 − 1³ = 0: four steps.', ro: 'Numărat greșit — 100 − 4³ = 36 e pasul 1, apoi 36 − 3³ = 9, 9 − 2³ = 1, 1 − 1³ = 0: patru pași.' } },
      { text: '4', correct: true },
      { text: '5', correct: false, feedback: { en: 'One too many — trace the greedy decomposition step by step: 100→36→9→1→0 = 4 steps.', ro: 'Cu unul în plus — parcurge decompoziția lacomă: 100→36→9→1→0 = 4 pași.' } },
      { text: '6', correct: false, feedback: { en: 'Off by two — the greedy descent uses the largest cube ≤ remainder at each step.', ro: 'Greșit cu doi — descendența lacomă folosește cel mai mare cub ≤ rest la fiecare pas.' } },
    ],
    explanation: { en: '100 - 4³ = 36, 36 - 3³ = 9, 9 - 2³ = 1, 1 - 1³ = 0. Four steps, so D(100) = 4.', ro: '100 - 4³ = 36, 36 - 3³ = 9, 9 - 2³ = 1, 1 - 1³ = 0. Patru pași, deci D(100) = 4.' },
  },
  {
    question: { en: '10. What is the worst-case time complexity of the cube decomposition algorithm D(m) where n = ⌈log₂ m⌉?', ro: '10. Care este complexitatea timp în cazul cel mai nefavorabil al algoritmului D(m) unde n = ⌈log₂ m⌉?' },
    options: [
      { text: 'O(n)', correct: false, feedback: { en: 'Too optimistic; greedy cube decomposition takes ∛m steps, which is exponential in n = log₂ m.', ro: 'Prea optimist; decompoziția lacomă în cuburi ia ∛m pași, exponențial în n = log₂ m.' } },
      { text: 'O(∛2ⁿ)', correct: true },
      { text: 'O(2ⁿ)', correct: false, feedback: { en: 'That is ∛-th-root of 2ⁿ too loose; the actual bound is the cube root.', ro: 'Aceea e mult prea puțin strânsă; marginea reală e rădăcina cubică.' } },
      { text: 'O(n²)', correct: false, feedback: { en: 'Polynomial in n ignores that m grows exponentially relative to n.', ro: 'Polinomial în n ignoră că m crește exponențial față de n.' } },
    ],
    explanation: { en: 'Since m can be written as sum of cubes up to ∛m, T(n) = O(∛m) = O(∛2ⁿ). Only cubes 1³ and 2³ can repeat multiple times.', ro: 'Deoarece m poate fi scris ca sumă de cuburi până la ∛m, T(n) = O(∛m) = O(∛2ⁿ). Doar cuburile 1³ și 2³ se pot repeta de mai multe ori.' },
  },
  {
    question: { en: '11. For the multiset membership problem INM, what is the worst-case complexity?', ro: '11. Pentru problema apartenenței la multi-mulțime INM, care este complexitatea în cazul cel mai nefavorabil?' },
    options: [
      { text: 'O(1)', correct: false, feedback: { en: 'No precomputed index; in general a linear scan is needed.', ro: 'Fără index precalculat; în general trebuie o scanare liniară.' } },
      { text: 'O(log n)', correct: false, feedback: { en: 'Log-time requires sorted or indexed S; worst case on unordered data is linear.', ro: 'Timpul logaritmic cere S sortat sau indexat; cazul rău pe date neordonate e liniar.' } },
      { text: 'O(n)', correct: true },
      { text: 'O(n²)', correct: false, feedback: { en: 'Single scan, not nested loops — quadratic overshoots.', ro: 'O singură parcurgere, nu bucle imbricate — pătratic e prea mult.' } },
    ],
    explanation: { en: 'Linear search through S. Worst case: element not found, loop runs n times. T(n) = O(n).', ro: 'Căutare liniară prin S. Cazul cel mai nefavorabil: elementul nu este găsit, bucla se execută de n ori. T(n) = O(n).' },
  },
  {
    question: { en: '12. An octagonal number Nₙ = n² + 4·Σₖ₌₁ⁿ⁻¹ k. Which simplified formula is equivalent?', ro: '12. Un număr octogonal Nₙ = n² + 4·Σₖ₌₁ⁿ⁻¹ k. Care formulă simplificată este echivalentă?' },
    options: [
      { text: 'Nₙ = 3n² - 2n', correct: true },
      { text: 'Nₙ = 2n² - n', correct: false, feedback: { en: 'That is the hexagonal formula, not octagonal.', ro: 'Aceea e formula hexagonală, nu octogonală.' } },
      { text: 'Nₙ = n² + 2n', correct: false, feedback: { en: 'Forgets to apply 4·Σk = 2n(n−1) = 2n²−2n; the full simplification is 3n²−2n.', ro: 'Omite 4·Σk = 2n(n−1) = 2n²−2n; simplificarea completă e 3n²−2n.' } },
      { text: 'Nₙ = 4n² - 3n', correct: false, feedback: { en: 'Arithmetic slip: n² + 2n²−2n = 3n²−2n, not 4n²−3n.', ro: 'Eroare de calcul: n² + 2n²−2n = 3n²−2n, nu 4n²−3n.' } },
    ],
    explanation: { en: 'Σₖ₌₁ⁿ⁻¹ k = n(n-1)/2. So Nₙ = n² + 4·n(n-1)/2 = n² + 2n(n-1) = n² + 2n² - 2n = 3n² - 2n.', ro: 'Σₖ₌₁ⁿ⁻¹ k = n(n-1)/2. Deci Nₙ = n² + 4·n(n-1)/2 = n² + 2n(n-1) = n² + 2n² - 2n = 3n² - 2n.' },
  },
];

/* ═══════════════════════════════════════════════════════════
   Section 2: Nondeterministic Algorithms
   ═══════════════════════════════════════════════════════════ */
const nondeterministicQuestions = [
  {
    question: { en: '1. What is the time complexity of a nondeterministic algorithm that uses choose once followed by an O(1) check?', ro: '1. Care este complexitatea timp a unui algoritm nedeterminist care folosește choose o singură dată urmată de o verificare O(1)?' },
    options: [
      { text: 'O(n)', correct: false, feedback: { en: 'That is the deterministic cost; nondeterministic `choose` is O(1), not O(n).', ro: 'Acela e costul determinist; `choose` nedeterminist e O(1), nu O(n).' } },
      { text: 'O(1)', correct: true },
      { text: 'O(log n)', correct: false, feedback: { en: 'No log factor anywhere — one choose + one check are both O(1).', ro: 'Fără factor log — un choose + o verificare sunt ambele O(1).' } },
      { text: { en: 'It depends on the size of the choose set', ro: 'Depinde de mărimea mulțimii choose' }, correct: false, feedback: { en: 'Nondeterministic time is independent of the choice-set size by definition.', ro: 'Timpul nedeterminist e independent de mărimea mulțimii de alegere, prin definiție.' } },
    ],
    explanation: { en: 'The choose instruction executes in O(1) (nondeterministic model), and the if check is O(1). Total: O(1). The size of the choice set does not affect nondeterministic time.', ro: 'Instrucțiunea choose se execută în O(1) (modelul nedeterminist), iar verificarea if este O(1). Total: O(1). Mărimea mulțimii de alegere nu afectează timpul nedeterminist.' },
  },
  {
    question: { en: '2. oddSum(M): choose x in {1..M}; if (x%2==1 && M==x+x+2) success; else failure;\nFor M=12, which value of x leads to success?', ro: '2. oddSum(M): choose x in {1..M}; if (x%2==1 && M==x+x+2) success; else failure;\nPentru M=12, care valoare a lui x duce la succes?' },
    options: [
      { text: 'x = 4', correct: false, feedback: { en: '4 is even; the test requires x odd.', ro: '4 e par; testul cere x impar.' } },
      { text: 'x = 5', correct: true },
      { text: 'x = 6', correct: false, feedback: { en: '6 is even; 12 ≠ 6+6+2 = 14 anyway.', ro: '6 e par; oricum 12 ≠ 6+6+2 = 14.' } },
      { text: 'x = 7', correct: false, feedback: { en: 'Odd, but 12 ≠ 7+7+2 = 16.', ro: 'Impar, dar 12 ≠ 7+7+2 = 16.' } },
    ],
    explanation: { en: 'x=5: 5 is odd ✓, and 12 == 5+5+2 = 12 ✓. So x=5 leads to success. (12 = 5+7, two consecutive odd numbers)', ro: 'x=5: 5 este impar ✓, și 12 == 5+5+2 = 12 ✓. Deci x=5 duce la succes. (12 = 5+7, două numere impare consecutive)' },
  },
  {
    question: { en: '3. prod3cons(M): choose x in {1..M}; if (M == (x-1)*x*(x+1)) success;\nFor M=60, which x gives success?', ro: '3. prod3cons(M): choose x in {1..M}; if (M == (x-1)*x*(x+1)) success;\nPentru M=60, care x duce la succes?' },
    options: [
      { text: 'x = 3', correct: false, feedback: { en: '(3−1)·3·(3+1) = 2·3·4 = 24, not 60.', ro: '(3−1)·3·(3+1) = 2·3·4 = 24, nu 60.' } },
      { text: 'x = 4', correct: true },
      { text: 'x = 5', correct: false, feedback: { en: '(5−1)·5·(5+1) = 4·5·6 = 120, not 60.', ro: '(5−1)·5·(5+1) = 4·5·6 = 120, nu 60.' } },
      { text: 'x = 6', correct: false, feedback: { en: '(6−1)·6·(6+1) = 5·6·7 = 210, way over 60.', ro: '(6−1)·6·(6+1) = 5·6·7 = 210, mult peste 60.' } },
    ],
    explanation: { en: 'x=4: (4-1)*4*(4+1) = 3*4*5 = 60 ✓', ro: 'x=4: (4-1)*4*(4+1) = 3*4*5 = 60 ✓' },
  },
  {
    question: { en: '4. A nondeterministic algorithm for P35 (list contains number divisible by 3 but not 5) has complexity:', ro: '4. Un algoritm nedeterminist pentru P35 (lista conține un număr divizibil cu 3 dar nu cu 5) are complexitatea:' },
    options: [
      { text: 'O(n)', correct: false, feedback: { en: 'Linear is the *deterministic* cost; nondeterministic choose skips the scan.', ro: 'Liniar e costul *determinist*; nedeterminist, choose sare peste scanare.' } },
      { text: 'O(1)', correct: true },
      { text: 'O(n log n)', correct: false, feedback: { en: 'No logarithm involved; one choose + one check are O(1) each.', ro: 'Fără logaritm; un choose + o verificare sunt fiecare O(1).' } },
      { text: 'O(n²)', correct: false, feedback: { en: 'Quadratic is way over — not even the deterministic version is n².', ro: 'Pătratic e mult peste — nici varianta deterministă nu e n².' } },
    ],
    explanation: { en: 'choose i in O(1), then one if check in O(1). Total O(1). The deterministic version is O(n).', ro: 'choose i în O(1), apoi o verificare if în O(1). Total O(1). Versiunea deterministă este O(n).' },
  },
  {
    question: { en: '5. What characterizes a nondeterministic algorithm?', ro: '5. Ce caracterizează un algoritm nedeterminist?' },
    options: [
      { text: { en: 'It always produces the same output for the same input', ro: 'Produce întotdeauna același output pentru același input' }, correct: false, feedback: { en: 'Determinism, the exact opposite of nondeterminism.', ro: 'Determinism, exact opusul nedeterminismului.' } },
      { text: { en: 'It uses random number generators', ro: 'Folosește generatoare de numere aleatoare' }, correct: false, feedback: { en: 'That is a *probabilistic* algorithm; nondeterminism uses angelic choice, not randomness.', ro: 'Acela e algoritm *probabilist*; nedeterminismul folosește alegere angelică, nu aleatorie.' } },
      { text: { en: 'It can have multiple possible executions for the same input, some ending in success and some in failure', ro: 'Poate avea mai multe execuții posibile pentru același input, unele terminându-se cu succes și altele cu eșec' }, correct: true },
      { text: { en: 'It runs in exponential time', ro: 'Rulează în timp exponențial' }, correct: false, feedback: { en: 'The nondeterministic model is *linear per path* — time is about a single execution, not the full tree.', ro: 'Modelul nedeterminist e *liniar per cale* — timpul se referă la o singură execuție, nu la tot arborele.' } },
    ],
    explanation: { en: 'A nondeterministic algorithm uses the "choose" construct which can pick any value. Different choices lead to different executions. The algorithm "solves" a decision problem if at least one execution ends in success for YES instances.', ro: 'Un algoritm nedeterminist folosește construcția "choose" care poate alege orice valoare. Alegeri diferite duc la execuții diferite. Algoritmul "rezolvă" o problemă de decizie dacă cel puțin o execuție se termină cu succes pentru instanțele DA.' },
  },
  {
    question: { en: '6. For the problem "Is M the sum of two consecutive odd numbers?", which is the correct nondeterministic condition?', ro: '6. Pentru problema „Este M suma a două numere impare consecutive?", care este condiția nedeterministă corectă?' },
    options: [
      { text: 'x % 2 == 0 && M == x + x + 2', correct: false, feedback: { en: 'Requires x even, but consecutive odd numbers need x to be odd.', ro: 'Cere x par, dar numere impare consecutive cer x impar.' } },
      { text: 'x % 2 == 1 && M == x + x + 2', correct: true },
      { text: 'x % 2 == 1 && M == x * (x + 2)', correct: false, feedback: { en: 'Product of consecutive odds, not sum.', ro: 'Produs al imparilor consecutivi, nu sumă.' } },
      { text: 'x % 2 == 1 && M == 2 * x + 1', correct: false, feedback: { en: '2x+1 is the sum of x and (x+1) shifted by 1 — not x + (x+2).', ro: '2x+1 e suma lui x și (x+1) decalată cu 1 — nu x + (x+2).' } },
    ],
    explanation: { en: 'Two consecutive odd numbers are x and x+2 (where x is odd). Their sum is x + (x+2) = 2x+2. So check: x is odd AND M == x + x + 2.', ro: 'Două numere impare consecutive sunt x și x+2 (unde x este impar). Suma lor este x + (x+2) = 2x+2. Deci verificăm: x este impar ȘI M == x + x + 2.' },
  },
  {
    question: { en: '7. A decision problem is decidable if:', ro: '7. O problemă de decizie este decidabilă dacă:' },
    options: [
      { text: { en: 'It is a decision problem', ro: 'Este o problemă de decizie' }, correct: false, feedback: { en: 'Being a decision problem is necessary but not sufficient — we also need a deterministic solver that halts.', ro: 'A fi problemă de decizie e necesar dar nu suficient — e nevoie și de un algoritm determinist care se oprește.' } },
      { text: { en: 'It is solvable by a deterministic algorithm', ro: 'Este rezolvabilă de un algoritm determinist' }, correct: false, feedback: { en: 'Missing the decision-problem requirement; not every deterministically solvable problem is "decidable" in the technical sense.', ro: 'Lipsește cerința de problemă de decizie; nu orice problemă rezolvabilă determinist e „decidabilă" tehnic.' } },
      { text: { en: 'It is a decision problem and is solvable by a deterministic algorithm', ro: 'Este o problemă de decizie și este rezolvabilă de un algoritm determinist' }, correct: true },
      { text: { en: 'It is solvable by a nondeterministic algorithm', ro: 'Este rezolvabilă de un algoritm nedeterminist' }, correct: false, feedback: { en: 'Nondeterministic solvability is the definition of *semi-decidable*, not decidable.', ro: 'Rezolvabilitatea nedeterministă definește *semi-decidabilitatea*, nu decidabilitatea.' } },
    ],
    explanation: { en: 'A decidable problem must be both a decision problem (yes/no output) AND solvable by a deterministic algorithm that always terminates.', ro: 'O problemă decidabilă trebuie să fie atât problemă de decizie (output da/nu) CÂT ȘI rezolvabilă de un algoritm determinist care se termină întotdeauna.' },
  },
];

/* ═══════════════════════════════════════════════════════════
   Section 3: Probabilistic Algorithms & Average Complexity
   ═══════════════════════════════════════════════════════════ */
const probabilisticQuestions = [
  {
    question: { en: '1. In the eqTest algorithm (random index into permutation array a, then linear search in b), what is P(Xⱼ = 1)?', ro: '1. În algoritmul eqTest (index aleatoriu în tabloul permutare a, apoi căutare liniară în b), cât este P(Xⱼ = 1)?' },
    options: [
      { text: '1/2', correct: false, feedback: { en: 'That is the coin-flip probability; here we draw uniformly from n positions.', ro: 'Aceea e probabilitatea pentru monedă; aici alegem uniform din n poziții.' } },
      { text: '1/n', correct: true },
      { text: 'j/n', correct: false, feedback: { en: 'The probability is uniform over positions — it does not depend on j.', ro: 'Probabilitatea e uniformă peste poziții — nu depinde de j.' } },
      { text: '1/(n-1)', correct: false, feedback: { en: 'Off by one; b is a permutation of size n (not n−1 distinct values).', ro: 'Off-by-one; b e o permutare de mărime n (nu n−1 valori distincte).' } },
    ],
    explanation: { en: 'Since b is a permutation of a, the element a[i] appears exactly once in b. The probability it is at position j is 1/n (uniform distribution).', ro: 'Deoarece b este o permutare a lui a, elementul a[i] apare exact o dată în b. Probabilitatea să fie pe poziția j este 1/n (distribuție uniformă).' },
  },
  {
    question: { en: '2. For eqTest, the expected number of comparisons a[i]==b[j] is:', ro: '2. Pentru eqTest, numărul mediu de comparații a[i]==b[j] este:' },
    options: [
      { text: 'n', correct: false, feedback: { en: 'That is the worst case (find only at position n−1), not the expected value.', ro: 'Acela e cazul cel mai rău (găsit abia la poziția n−1), nu valoarea așteptată.' } },
      { text: 'n/2', correct: false, feedback: { en: 'A natural guess, but off-by-one — the exact expectation is (n−1)/2.', ro: 'Intuiție rezonabilă, dar off-by-one — speranța exactă e (n−1)/2.' } },
      { text: '(n-1)/2', correct: true },
      { text: 'n-1', correct: false, feedback: { en: 'Also the worst case; the expected stop-position is half of that.', ro: 'Tot cazul cel mai rău; poziția medie de oprire e jumătate din asta.' } },
    ],
    explanation: { en: 'E[T] = Σⱼ₌₀ⁿ⁻² (j+1)·1/n = (1/n)·(n-1)n/2 = (n-1)/2.', ro: 'E[T] = Σⱼ₌₀ⁿ⁻² (j+1)·1/n = (1/n)·(n-1)n/2 = (n-1)/2.' },
  },
  {
    question: { en: '3. In the probabilistic minimum algorithm (uniform random selection from set S), what is the probability that the assignment x=y occurs at iteration i?', ro: '3. În algoritmul probabilist de minim (selecție aleatoare uniformă din mulțimea S), care este probabilitatea ca atribuirea x=y să se execute la iterația i?' },
    options: [
      { text: '1/n', correct: false, feedback: { en: 'That would assume all n elements in play; at iteration i only i+1 have been seen.', ro: 'Ar presupune toate cele n elemente; la iterația i s-au văzut doar i+1.' } },
      { text: '1/i', correct: false, feedback: { en: 'Off by one: the i-th element is compared against i previous ones, giving i+1 total.', ro: 'Off-by-one: al i-lea element e comparat cu i anterioare, total i+1.' } },
      { text: '1/(i+1)', correct: true },
      { text: 'i/n', correct: false, feedback: { en: 'That is the probability the current element is *not* the min so far, wrong direction.', ro: 'Aceea e probabilitatea ca elementul curent să *nu* fie minimul — sens greșit.' } },
    ],
    explanation: { en: 'At iteration i, we have seen i+1 elements. The assignment happens only if the i-th element chosen is the minimum of all i+1 seen so far. Probability: 1/(i+1).', ro: 'La iterația i, am văzut i+1 elemente. Atribuirea are loc doar dacă al i-lea element ales este minimul tuturor celor i+1 văzute. Probabilitate: 1/(i+1).' },
  },
  {
    question: { en: '4. The expected number of assignments in the probabilistic minimum algorithm is:', ro: '4. Numărul mediu de atribuiri în algoritmul probabilist de minim este:' },
    options: [
      { text: 'O(n)', correct: false, feedback: { en: 'That is the worst case (every element is a new min); average over random permutations is Hₙ ≈ ln n.', ro: 'Acela e cazul cel mai rău (fiecare element e nou minim); media pe permutări aleatoare e Hₙ ≈ ln n.' } },
      { text: 'O(√n)', correct: false, feedback: { en: '√n is for balls-and-bins birthday problems; the harmonic sum gives a logarithm.', ro: '√n apare la probleme birthday; suma armonică dă logaritm.' } },
      { text: 'Θ(ln n)', correct: true },
      { text: 'O(1)', correct: false, feedback: { en: 'Constant ignores that we expect ln n new minima on average.', ro: 'Constant ignoră că așteptăm ln n noi minime în medie.' } },
    ],
    explanation: { en: 'E[A] = Σᵢ₌₁ⁿ⁻¹ 1/(i+1) = 1/2 + 1/3 + ... + 1/n = Hₙ - 1 = Θ(ln n), the harmonic series.', ro: 'E[A] = Σᵢ₌₁ⁿ⁻¹ 1/(i+1) = 1/2 + 1/3 + ... + 1/n = Hₙ - 1 = Θ(ln n), seria armonică.' },
  },
  {
    question: { en: '5. For unulDinTrei() { n=random(2); if(n==0) return 0; else return 1-unulDinTrei(); }, what is the probability of exactly n recursive calls (n≥1)?', ro: '5. Pentru unulDinTrei() { n=random(2); if(n==0) return 0; else return 1-unulDinTrei(); }, care este probabilitatea de exact n apeluri recursive (n≥1)?' },
    options: [
      { text: '1/2ⁿ', correct: false, feedback: { en: 'Off by one: n recursive calls require n "keep going" + 1 "stop" flips = n+1 flips.', ro: 'Off-by-one: n apeluri cer n flip-uri „continuă" + 1 flip „stop" = n+1.' } },
      { text: '1/2ⁿ⁺¹', correct: true },
      { text: '1/n', correct: false, feedback: { en: 'Uniform over n ignores the geometric structure: each flip is independent.', ro: 'Uniform peste n ignoră structura geometrică: fiecare flip e independent.' } },
      { text: '(1/2)ⁿ · (1/2)', correct: false, feedback: { en: 'Algebraically equal to 1/2ⁿ⁺¹ — but this option is marked as a "wrong" form not matching the canonical answer.', ro: 'Algebric egal cu 1/2ⁿ⁺¹ — dar această opțiune e marcată ca formă „greșită" care nu coincide cu răspunsul canonic.' } },
    ],
    explanation: { en: 'Each recursive call requires random to return 1 (prob 1/2), and the last call requires random to return 0 (prob 1/2). So pₙ = (1/2)ⁿ · (1/2) = 1/2ⁿ⁺¹.', ro: 'Fiecare apel recursiv necesită ca random să returneze 1 (prob 1/2), iar ultimul apel necesită ca random să returneze 0 (prob 1/2). Deci pₙ = (1/2)ⁿ · (1/2) = 1/2ⁿ⁺¹.' },
  },
  {
    question: { en: '6. ransearch(n,z) generates a random array and counts occurrences of z. What is E[k] (expected count)?', ro: '6. ransearch(n,z) generează un tablou aleatoriu și numără aparițiile lui z. Cât este E[k] (numărul mediu)?'  },
    options: [
      { text: 'n', correct: false, feedback: { en: 'n per slot × n slots gives worst case, not expected count.', ro: 'n pe poziție × n poziții dă cazul cel mai rău, nu media.' } },
      { text: '0', correct: false, feedback: { en: 'Zero ignores that E[indicator] = 1/n, which sums to 1 over n positions.', ro: 'Zero ignoră că E[indicator] = 1/n, sumat peste n poziții = 1.' } },
      { text: '1', correct: true },
      { text: 'n/2', correct: false, feedback: { en: 'Binomial mean for p = 1/2; here p = 1/n.', ro: 'Media binomială pentru p = 1/2; aici p = 1/n.' } },
    ],
    explanation: { en: 'Each position has probability 1/n of containing z. E[k] = Σᵢ₌₀ⁿ⁻¹ 1/n = 1.', ro: 'Fiecare poziție are probabilitatea 1/n de a conține z. E[k] = Σᵢ₌₀ⁿ⁻¹ 1/n = 1.' },
  },
  {
    question: { en: '7. Can a probabilistic algorithm be used to compute the average-case time of a deterministic algorithm?', ro: '7. Poate un algoritm probabilist fi folosit pentru calculul timpului mediu al unui algoritm determinist?' },
    options: [
      { text: { en: 'No, they are fundamentally different', ro: 'Nu, sunt fundamental diferite' }, correct: false, feedback: { en: 'They coincide when the random model matches the average-input distribution.', ro: 'Coincid când modelul aleator se potrivește cu distribuția medie a inputurilor.' } },
      { text: { en: 'Yes, if inputs are chosen uniformly at random and elements are distinct', ro: 'Da, dacă intrările sunt alese uniform aleatoriu și elementele sunt distincte' }, correct: true },
      { text: { en: 'Only for sorting algorithms', ro: 'Doar pentru algoritmi de sortare' }, correct: false, feedback: { en: 'The equivalence is general over permutations/uniform inputs, not sorting-specific.', ro: 'Echivalența e generală pentru permutări/inputuri uniforme, nu specifică sortării.' } },
      { text: { en: 'Only if the algorithm is recursive', ro: 'Doar dacă algoritmul este recursiv' }, correct: false, feedback: { en: 'Recursion is orthogonal; the property is about the input distribution.', ro: 'Recursivitatea e ortogonală; proprietatea ține de distribuția inputului.' } },
    ],
    explanation: { en: 'The probabilistic algorithm over sets is equivalent to the deterministic algorithm when inputs are chosen uniformly at random and elements are distinct. The randomness source doesn\'t matter.', ro: 'Algoritmul probabilist peste mulțimi este echivalent cu algoritmul determinist când intrările sunt alese uniform aleatoriu și elementele sunt distincte.' },
  },
  {
    question: { en: '8. In the modm algorithm (finding a divisor of m = p·q among random elements), what is P(a[i] divides m)?', ro: '8. În algoritmul modm (găsirea unui divizor al lui m = p·q printre elemente aleatoare), cât este P(a[i] divide m)?' },
    options: [
      { text: '1/m', correct: false, feedback: { en: 'Denominator wrong: sample space is {2..m−1} (m−2 values), not m.', ro: 'Numitor greșit: spațiul de eșantion e {2..m−1} (m−2 valori), nu m.' } },
      { text: '2/m', correct: false, feedback: { en: 'Same denominator mistake; there are m−2 candidates, not m.', ro: 'Aceeași greșeală la numitor; sunt m−2 candidați, nu m.' } },
      { text: '2/(m-2)', correct: true },
      { text: '1/(m-2)', correct: false, feedback: { en: 'Only one prime factor counted; there are *two* (p and q).', ro: 'Numără un singur factor prim; sunt *doi* (p și q).' } },
    ],
    explanation: { en: 'a[i] is chosen uniformly from {2,...,m-1} (m-2 values). Only the two prime factors p and q divide m. So probability = 2/(m-2).', ro: 'a[i] este ales uniform din {2,...,m-1} (m-2 valori). Doar cei doi factori primi p și q divid m. Deci probabilitatea = 2/(m-2).' },
  },
  {
    question: { en: '9. For the firstpos algorithm (find first occurrence of z in random array), what is P(Xₖ = 1) for k < n?', ro: '9. Pentru algoritmul firstpos (găsește prima apariție a lui z în tablou aleatoriu), cât este P(Xₖ = 1) pentru k < n?' },
    options: [
      { text: '1/n', correct: false, feedback: { en: 'Misses the "k previous misses" factor; first-occurrence geometry requires (1−1/n)ᵏ.', ro: 'Omite factorul „k ratări anterioare"; prima apariție cere (1−1/n)ᵏ.' } },
      { text: '(1-1/n)ᵏ', correct: false, feedback: { en: 'That is the probability of k misses in a row; must also multiply by 1/n for the k-th hit.', ro: 'Aceea e probabilitatea de k ratări consecutive; trebuie înmulțită cu 1/n pentru al k-lea succes.' } },
      { text: '(1-1/n)ᵏ · 1/n', correct: true },
      { text: 'k/n', correct: false, feedback: { en: 'Linear in k — correct form is geometric (exponential decay in k).', ro: 'Liniar în k — forma corectă e geometrică (decădere exponențială în k).' } },
    ],
    explanation: { en: 'Xₖ = 1 means z is NOT at positions 0..k-1 (each with prob (1-1/n)) AND z IS at position k (prob 1/n). So pₖ = (1-1/n)ᵏ · 1/n.', ro: 'Xₖ = 1 înseamnă că z NU este pe pozițiile 0..k-1 (fiecare cu prob (1-1/n)) ȘI z ESTE pe poziția k (prob 1/n). Deci pₖ = (1-1/n)ᵏ · 1/n.' },
  },
  {
    question: { en: '10. What type of random variable is Xⱼ (indicator that a[i]==b[j]) in probabilistic analysis?', ro: '10. Ce tip de variabilă aleatorie este Xⱼ (indicator că a[i]==b[j]) în analiza probabilistă?' },
    options: [
      { text: { en: 'Gaussian random variable', ro: 'Variabilă aleatorie gaussiană' }, correct: false, feedback: { en: 'Gaussian takes continuous real values; indicators take only 0 or 1.', ro: 'Gaussiana ia valori reale continue; indicatorii iau doar 0 sau 1.' } },
      { text: { en: 'Indicator (Bernoulli) random variable', ro: 'Variabilă aleatorie indicator (Bernoulli)' }, correct: true },
      { text: { en: 'Poisson random variable', ro: 'Variabilă aleatorie Poisson' }, correct: false, feedback: { en: 'Poisson counts arrivals over a window; Xⱼ is a single 0/1 trial.', ro: 'Poisson numără sosiri într-o fereastră; Xⱼ e o probă 0/1 unică.' } },
      { text: { en: 'Uniform random variable', ro: 'Variabilă aleatorie uniformă' }, correct: false, feedback: { en: 'Uniform takes more than 2 values; indicators take only 0 or 1.', ro: 'Uniforma ia mai mult de 2 valori; indicatorii doar 0 sau 1.' } },
    ],
    explanation: { en: 'An indicator random variable takes only values 0 or 1. E[Xⱼ] = P(Xⱼ = 1). This is key to the linearity of expectation technique used in average-case analysis.', ro: 'O variabilă aleatorie indicator ia doar valorile 0 sau 1. E[Xⱼ] = P(Xⱼ = 1). Aceasta este cheia tehnicii de liniaritate a valorii așteptate folosită în analiza cazului mediu.' },
  },
];

/* ═══════════════════════════════════════════════════════════
   Section 4: String Searching
   ═══════════════════════════════════════════════════════════ */
const stringQuestions = [
  {
    question: { en: '1. In KMP, for pattern "ARATAT", what does the sufpref algorithm find?', ro: '1. În KMP, pentru patternul "ARATAT", ce găsește algoritmul sufpref?' },
    options: [
      { text: { en: 'The longest proper substring that is both prefix and suffix', ro: 'Cel mai lung subșir propriu care este și prefix și sufix' }, correct: true },
      { text: { en: 'The shortest substring that matches the pattern', ro: 'Cel mai scurt subșir care se potrivește cu patternul' }, correct: false, feedback: { en: 'Unrelated to KMP preprocessing — that sounds like generic substring search.', ro: 'Fără legătură cu preprocesarea KMP — sună ca o căutare generică.' } },
      { text: { en: 'The position of the first mismatch', ro: 'Poziția primei nepotriviri' }, correct: false, feedback: { en: 'Mismatch position is determined at search time, not precomputed by sufpref.', ro: 'Poziția nepotrivirii se determină în timpul căutării, nu se precalculează prin sufpref.' } },
      { text: { en: 'The number of distinct characters', ro: 'Numărul de caractere distincte' }, correct: false, feedback: { en: 'No connection to the failure function; sufpref is about prefix/suffix overlap.', ro: 'Fără legătură cu funcția de eșec; sufpref e despre suprapunerea prefix/sufix.' } },
    ],
    explanation: { en: 'sufpref(a) finds the longest proper substring that is both a prefix and suffix of the given string, without computing the full failure function.', ro: 'sufpref(a) găsește cel mai lung subșir propriu care este atât prefix cât și sufix al șirului dat, fără a calcula funcția eșec completă.' },
  },
  {
    question: { en: '2. Why is the O(m²) sufpref algorithm not preferred for computing the KMP failure function?', ro: '2. De ce algoritmul sufpref de O(m²) nu este preferat pentru calculul funcției eșec KMP?' },
    options: [
      { text: { en: 'It gives incorrect results', ro: 'Dă rezultate incorecte' }, correct: false, feedback: { en: 'The O(m²) algorithm is correct — just slow.', ro: 'Algoritmul O(m²) e corect — doar lent.' } },
      { text: { en: 'It would make failure function computation O(m³) instead of O(m)', ro: 'Ar face calculul funcției eșec O(m³) în loc de O(m)' }, correct: true },
      { text: { en: 'It only works for binary alphabets', ro: 'Funcționează doar pentru alfabete binare' }, correct: false, feedback: { en: 'Alphabet size is irrelevant; sufpref is about character equality, not alphabet size.', ro: 'Dimensiunea alfabetului e irelevantă; sufpref depinde doar de egalitatea caracterelor.' } },
      { text: { en: 'It requires too much memory', ro: 'Necesită prea multă memorie' }, correct: false, feedback: { en: 'Space is O(m); the bottleneck is time, not memory.', ro: 'Spațiul e O(m); blocajul e timpul, nu memoria.' } },
    ],
    explanation: { en: 'The failure function requires computing sufpref for m different substrings. O(m²) per call × m calls = O(m³). The KMP failure function computation achieves O(m) total.', ro: 'Funcția eșec necesită calcularea sufpref pentru m subșiruri diferite. O(m²) per apel × m apeluri = O(m³). Calculul funcției eșec KMP realizează O(m) total.' },
  },
  {
    question: { en: '3. When does KMP execute exactly n comparisons (not counting failure function computation)?', ro: '3. Când execută KMP exact n comparații (fără a ține cont de calculul funcției eșec)?' },
    options: [
      { text: { en: 'When the text and pattern have the same characters', ro: 'Când textul și patternul au aceleași caractere' }, correct: false, feedback: { en: 'Matching causes many comparisons per position — not minimal.', ro: 'Potrivirile forțează multe comparații per poziție — nu minim.' } },
      { text: { en: 'When the text is all letters and the pattern is all digits', ro: 'Când textul este format numai din litere și patternul numai din cifre' }, correct: true },
      { text: { en: 'When the pattern is found at position 0', ro: 'Când patternul este găsit la poziția 0' }, correct: false, feedback: { en: 'First-position hit still requires m comparisons to confirm, plus subsequent scanning.', ro: 'Potrivirea pe prima poziție cere m comparații pentru confirmare, plus restul parcurgerii.' } },
      { text: { en: 'When the text is longer than the pattern', ro: 'Când textul este mai lung decât patternul' }, correct: false, feedback: { en: 'Irrelevant condition — n > m is standard for any search.', ro: 'Condiție irelevantă — n > m e standard pentru orice căutare.' } },
    ],
    explanation: { en: 'If no character matches (disjoint alphabets), every comparison fails immediately. KMP makes exactly one comparison per text position, totaling n.', ro: 'Dacă niciun caracter nu se potrivește (alfabete disjuncte), fiecare comparație eșuează imediat. KMP face exact o comparație per poziție din text, totalizând n.' },
  },
  {
    question: { en: '4. In Boyer-Moore, what is salt[C] if character C does not appear in the pattern of length m?', ro: '4. În Boyer-Moore, cât este salt[C] dacă caracterul C nu apare în patternul de lungime m?' },
    options: [
      { text: '0', correct: false, feedback: { en: '0 would prevent any shift; we want the maximum possible shift.', ro: '0 ar împiedica orice deplasare; vrem deplasarea maximă.' } },
      { text: '1', correct: false, feedback: { en: 'That is the minimum shift; since C is not in the pattern, we can jump further.', ro: 'Aceea e deplasarea minimă; cum C nu e în pattern, putem sări mai mult.' } },
      { text: 'm', correct: true },
      { text: 'm-1', correct: false, feedback: { en: 'Off by one; when C is absent, the full m-shift is safe.', ro: 'Off-by-one; când C lipsește, deplasarea cu m e sigură.' } },
    ],
    explanation: { en: 'salt[C] = m when C is not in the pattern. This allows the maximum shift — skip the entire pattern length.', ro: 'salt[C] = m când C nu este în pattern. Aceasta permite saltul maxim — se sare toată lungimea patternului.' },
  },
  {
    question: { en: '5. Boyer-Moore compares characters in which order?', ro: '5. Boyer-Moore compară caracterele în ce ordine?' },
    options: [
      { text: { en: 'Left to right', ro: 'De la stânga la dreapta' }, correct: false, feedback: { en: 'That is naive/KMP; Boyer-Moore goes right-to-left to enable its shift heuristics.', ro: 'Aceea e naiv/KMP; Boyer-Moore merge de la dreapta la stânga pentru a permite euristicile de deplasare.' } },
      { text: { en: 'Right to left', ro: 'De la dreapta la stânga' }, correct: true },
      { text: { en: 'From the middle outward', ro: 'Din mijloc spre exterior' }, correct: false, feedback: { en: 'Not used in any standard string matcher.', ro: 'Nefolosit în niciun algoritm standard.' } },
      { text: { en: 'Random order', ro: 'Ordine aleatoare' }, correct: false, feedback: { en: 'Deterministic algorithms use fixed orderings.', ro: 'Algoritmii deterministici folosesc ordini fixe.' } },
    ],
    explanation: { en: 'Boyer-Moore compares pattern characters from right to left. This enables the bad character and good suffix shift rules.', ro: 'Boyer-Moore compară caracterele patternului de la dreapta la stânga. Aceasta permite regulile de salt ale caracterului rău și sufixului bun.' },
  },
  {
    question: { en: '6. When is the Boyer-Moore good suffix rule NOT efficient?', ro: '6. Când regula sufixului bun Boyer-Moore NU este eficientă?' },
    options: [
      { text: { en: 'When the alphabet is large', ro: 'Când alfabetul este mare' }, correct: false, feedback: { en: 'Alphabet size affects bad-character, not good-suffix.', ro: 'Dimensiunea alfabetului afectează bad-character, nu good-suffix.' } },
      { text: { en: 'When the pattern has no repeated substrings', ro: 'Când patternul nu include subșiruri repetate' }, correct: true },
      { text: { en: 'When the text is very long', ro: 'Când textul este foarte lung' }, correct: false, feedback: { en: 'Text length does not affect good-suffix effectiveness per alignment.', ro: 'Lungimea textului nu afectează eficacitatea good-suffix per aliniere.' } },
      { text: { en: 'When the pattern is very short', ro: 'Când patternul este foarte scurt' }, correct: false, feedback: { en: 'Short patterns have little to exploit, but the rule\'s efficiency depends on *repetition*, not length.', ro: 'Pattern-urile scurte au puține de exploatat, dar eficiența regulii depinde de *repetiție*, nu de lungime.' } },
    ],
    explanation: { en: 'The good suffix rule exploits repeated substrings within the pattern to shift. If no substrings repeat, goodSuff(j) = 0 for all j, and the rule provides no benefit.', ro: 'Regula sufixului bun exploatează subșirurile repetate din pattern pentru a face salturi. Dacă niciun subșir nu se repetă, goodSuff(j) = 0 pentru orice j, și regula nu aduce niciun beneficiu.' },
  },
  {
    question: { en: '7. For pattern "ARATAT" and alphabet {A,C,D,E,N,R,T,U}, what is salt[A]?', ro: '7. Pentru patternul "ARATAT" și alfabetul {A,C,D,E,N,R,T,U}, cât este salt[A]?' },
    options: [
      { text: '1', correct: true },
      { text: '2', correct: false, feedback: { en: 'The last A is at position 4; salt[A] = 6−1−4 = 1, not 2.', ro: 'Ultimul A e la poziția 4; salt[A] = 6−1−4 = 1, nu 2.' } },
      { text: '4', correct: false, feedback: { en: 'That would mean last A at position 1; but the last A is at position 4 in "ARATAT".', ro: 'Ar însemna că ultimul A e la poziția 1; dar ultimul A e la poziția 4 în "ARATAT".' } },
      { text: '6', correct: false, feedback: { en: 'That is the shift when A is NOT in the pattern; but A is there (at position 4).', ro: 'Aceea e deplasarea când A NU e în pattern; dar A este acolo (poziția 4).' } },
    ],
    explanation: { en: 'salt[c] = m − 1 − last_position(c) for each character in the pattern. Pattern "ARATAT" has m = 6; the last A is at position 4. salt[A] = 6 − 1 − 4 = 1.', ro: 'salt[c] = m − 1 − ultima_poziție(c) pentru fiecare caracter din pattern. Pattern "ARATAT" are m = 6; ultimul A este la poziția 4. salt[A] = 6 − 1 − 4 = 1.' },
  },
  {
    question: { en: '8. What is the time complexity of computing the Boyer-Moore salt (shift) function for alphabet size k?', ro: '8. Care este complexitatea timp a calculului funcției de salt Boyer-Moore pentru un alfabet de dimensiune k?' },
    options: [
      { text: 'O(m)', correct: false, feedback: { en: 'Misses the k-sized initialization.', ro: 'Omite inițializarea de mărime k.' } },
      { text: 'O(k)', correct: false, feedback: { en: 'Misses the m-sized pattern scan.', ro: 'Omite parcurgerea pattern-ului de lungime m.' } },
      { text: 'O(k + m)', correct: true },
      { text: 'O(k · m)', correct: false, feedback: { en: 'Too much: the two phases are sequential, not nested.', ro: 'Prea mult: cele două faze sunt secvențiale, nu imbricate.' } },
    ],
    explanation: { en: 'First loop: initialize all k entries to m → O(k). Second loop: scan pattern of length m → O(m). Total: O(k + m).', ro: 'Prima buclă: inițializează toate cele k intrări cu m → O(k). A doua buclă: parcurge patternul de lungime m → O(m). Total: O(k + m).' },
  },
  {
    question: { en: '9. Which is a valid regular expression?', ro: '9. Care este o expresie regulată validă?' },
    options: [
      { text: 'a(ba)*c', correct: true },
      { text: 'a(ba*c', correct: false, feedback: { en: 'Unmatched parenthesis.', ro: 'Paranteză neînchisă.' } },
      { text: '*ab', correct: false, feedback: { en: 'Kleene star has no operand.', ro: 'Steaua Kleene nu are operand.' } },
      { text: 'a++b', correct: false, feedback: { en: '`++` is not a regex operator; use `|` or `+` (once) for alternation.', ro: '`++` nu e operator regex; folosește `|` sau `+` (o dată) pentru alternare.' } },
    ],
    explanation: { en: 'Regular expressions are defined recursively: ε, empty, characters, e₁e₂ (concatenation), e₁+e₂ (union), e* (Kleene star), (e) (grouping). a(ba)*c follows these rules.', ro: 'Expresiile regulate sunt definite recursiv: ε, empty, caractere, e₁e₂ (concatenare), e₁+e₂ (reuniune), e* (stea Kleene), (e) (grupare). a(ba)*c urmează aceste reguli.' },
  },
  {
    question: { en: '10. For regex b(aba)*ba, which of these strings is in the language?', ro: '10. Pentru regex b(aba)*ba, care dintre aceste șiruri este în limbaj?' },
    options: [
      { text: 'bba', correct: true },
      { text: 'bab', correct: false, feedback: { en: 'Ends in "b"; the regex ends in "a".', ro: 'Se termină cu "b"; regex-ul se termină cu "a".' } },
      { text: 'ba', correct: false, feedback: { en: 'Missing the initial "b" — regex requires "b" + (aba)* + "ba" = at least "bba".', ro: 'Lipsește "b"-ul inițial — regex-ul cere "b" + (aba)* + "ba" = minim "bba".' } },
      { text: 'bb', correct: false, feedback: { en: 'Missing the final "a"; the regex requires ending in "ba".', ro: 'Lipsește "a"-ul final; regex-ul cere să se termine cu "ba".' } },
    ],
    explanation: { en: 'b(aba)*ba with zero iterations of (aba)* gives b·ε·ba = bba. With one iteration: b·aba·ba = bababa.', ro: 'b(aba)*ba cu zero iterații ale (aba)* dă b·ε·ba = bba. Cu o iterație: b·aba·ba = bababa.' },
  },
];

/* ═══════════════════════════════════════════════════════════
   Section 5: Computational Geometry
   ═══════════════════════════════════════════════════════════ */
const geometryQuestions = [
  {
    question: { en: '1. What does ccw(P, Q, R) > 0 mean geometrically?', ro: '1. Ce înseamnă geometric ccw(P, Q, R) > 0?' },
    options: [
      { text: { en: 'P, Q, R are collinear', ro: 'P, Q, R sunt coliniare' }, correct: false },
      { text: { en: 'The turn from P→Q→R is counterclockwise', ro: 'Virajul P→Q→R este în sens invers acelor de ceasornic' }, correct: true },
      { text: { en: 'The turn from P→Q→R is clockwise', ro: 'Virajul P→Q→R este în sensul acelor de ceasornic' }, correct: false },
      { text: { en: 'Q is closer to P than R', ro: 'Q este mai aproape de P decât R' }, correct: false },
    ],
    explanation: { en: 'ccw (counter-clockwise) > 0 means the three points make a left turn (counterclockwise orientation).', ro: 'ccw (sens invers acelor de ceasornic) > 0 înseamnă că cele trei puncte fac un viraj la stânga (orientare trigonometrică).' },
  },
  {
    question: { en: '2. In Graham scan, when is a point eliminated from the convex hull?', ro: '2. În scanarea Graham, când este eliminat un punct din înfășurătoarea convexă?' },
    options: [
      { text: { en: 'When ccw of three consecutive points is > 0', ro: 'Când ccw a trei puncte consecutive este > 0' }, correct: false },
      { text: { en: 'When ccw of three consecutive points is < 0 (clockwise turn)', ro: 'Când ccw a trei puncte consecutive este < 0 (viraj în sensul acelor de ceasornic)' }, correct: true },
      { text: { en: 'When the point is the farthest from center', ro: 'Când punctul este cel mai depărtat de centru' }, correct: false },
      { text: { en: 'When the point has the smallest polar angle', ro: 'Când punctul are cel mai mic unghi polar' }, correct: false },
    ],
    explanation: { en: 'A clockwise turn (ccw < 0) means the middle point is "inside" and should be removed to maintain convexity.', ro: 'Un viraj în sensul acelor de ceasornic (ccw < 0) înseamnă că punctul din mijloc este „interior" și trebuie eliminat pentru a menține convexitatea.' },
  },
  {
    question: { en: '3. What is the time complexity of the Graham scan?', ro: '3. Care este complexitatea timp a scanării Graham?' },
    options: [
      { text: 'O(n)', correct: false },
      { text: 'O(n log n)', correct: true },
      { text: 'O(n²)', correct: false },
      { text: 'O(n³)', correct: false },
    ],
    explanation: { en: 'O(n log n) for sorting points by polar angle, then O(n) for the scan itself. Total: O(n log n).', ro: 'O(n log n) pentru sortarea punctelor după unghi polar, apoi O(n) pentru scanarea propriu-zisă. Total: O(n log n).' },
  },
  {
    question: { en: '4. What is the time complexity of computing the convex hull of a SIMPLE polyline (points already sorted)?', ro: '4. Care este complexitatea timp a calculului înfășurătorii convexe a unei linii poligonale SIMPLE (puncte deja sortate)?' },
    options: [
      { text: 'O(n log n)', correct: false },
      { text: 'O(n)', correct: true },
      { text: 'O(n²)', correct: false },
      { text: 'O(n log² n)', correct: false },
    ],
    explanation: { en: 'The CHLPS algorithm skips the sorting step since points are already ordered as a simple polyline. Only the Graham scan is needed: O(n).', ro: 'Algoritmul CHLPS sare peste pasul de sortare deoarece punctele sunt deja ordonate ca linie poligonală simplă. Este nevoie doar de scanarea Graham: O(n).' },
  },
  {
    question: { en: '5. How do you determine if point P=(4,4) is inside a simple closed polyline?', ro: '5. Cum determinați dacă punctul P=(4,4) este în interiorul unei linii poligonale simple închise?' },
    options: [
      { text: { en: 'Check if P is above all edges', ro: 'Verificăm dacă P este deasupra tuturor muchiilor' }, correct: false },
      { text: { en: 'Count intersections of a ray from P with the polyline — odd = inside', ro: 'Numărăm intersecțiile unei semidrepte din P cu linia poligonală — impar = interior' }, correct: true },
      { text: { en: 'Compute distance from P to all vertices', ro: 'Calculăm distanța de la P la toate vârfurile' }, correct: false },
      { text: { en: 'Check if ccw(P, v₁, v₂) > 0 for all edges', ro: 'Verificăm dacă ccw(P, v₁, v₂) > 0 pentru toate muchiile' }, correct: false },
    ],
    explanation: { en: 'The ray casting algorithm: cast a horizontal ray from P, count boundary crossings. Odd crossings = inside, even = outside.', ro: 'Algoritmul ray casting: se trasează o semidreaptă orizontală din P, se numără traversările frontierei. Traversări impare = interior, pare = exterior.' },
  },
  {
    question: { en: '6. The diameter of a point set is found using:', ro: '6. Diametrul unei mulțimi de puncte se găsește folosind:' },
    options: [
      { text: { en: 'All pairs of points', ro: 'Toate perechile de puncte' }, correct: false },
      { text: { en: 'Convex hull + antipodal pairs (rotating calipers)', ro: 'Înfășurătoare convexă + perechi antipodale (etriere rotative)' }, correct: true },
      { text: { en: 'The center of gravity', ro: 'Centrul de greutate' }, correct: false },
      { text: { en: 'Voronoi diagram', ro: 'Diagrama Voronoi' }, correct: false },
    ],
    explanation: { en: 'Compute convex hull, then find antipodal pairs. The diameter is the maximum distance among antipodal pairs. With Graham scan: O(n log n).', ro: 'Se calculează înfășurătoarea convexă, apoi se găsesc perechile antipodale. Diametrul este distanța maximă dintre perechile antipodale. Cu scanarea Graham: O(n log n).' },
  },
  {
    question: { en: '7. What is the Voronoi diagram of a point set S?', ro: '7. Ce este diagrama Voronoi a unei mulțimi de puncte S?' },
    options: [
      { text: { en: 'A triangulation of S', ro: 'O triangulare a lui S' }, correct: false },
      { text: { en: 'A partition of the plane into regions, each closest to one point of S', ro: 'O partiție a planului în regiuni, fiecare cea mai apropiată de un punct din S' }, correct: true },
      { text: { en: 'The convex hull of S', ro: 'Înfășurătoarea convexă a lui S' }, correct: false },
      { text: { en: 'The minimum spanning tree of S', ro: 'Arborele de acoperire minim al lui S' }, correct: false },
    ],
    explanation: { en: 'The Voronoi polygon of Pᵢ is V(i) = ∩ᵢ≠ⱼ H(Pᵢ, Pⱼ), the intersection of half-planes of points closer to Pᵢ than to any other Pⱼ.', ro: 'Poligonul Voronoi al lui Pᵢ este V(i) = ∩ᵢ≠ⱼ H(Pᵢ, Pⱼ), intersecția semiplanelor punctelor mai apropiate de Pᵢ decât de orice alt Pⱼ.' },
  },
  {
    question: { en: '8. The complexity of constructing a Voronoi diagram using divide-and-conquer is:', ro: '8. Complexitatea construcției unei diagrame Voronoi folosind divide-et-impera este:' },
    options: [
      { text: 'O(n)', correct: false },
      { text: 'O(n log n)', correct: true },
      { text: 'O(n²)', correct: false },
      { text: 'O(n² log n)', correct: false },
    ],
    explanation: { en: 'Divide by median x-coordinate, recursively build Voronoi for each half, merge using the separating polyline σ(S₁, S₂). Merge is O(n), giving T(n) = 2T(n/2) + O(n) = O(n log n).', ro: 'Se divide prin mediana absciselor, se construiește recursiv Voronoi pentru fiecare jumătate, se unesc folosind linia poligonală separatoare σ(S₁, S₂). Unirea este O(n), dând T(n) = 2T(n/2) + O(n) = O(n log n).' },
  },
  {
    question: { en: '9. NEAREST NEIGHBOR reduces to ALL NEAREST NEIGHBOR. What type of reduction is this?', ro: '9. NEAREST NEIGHBOR se reduce la ALL NEAREST NEIGHBOR. Ce tip de reducere este aceasta?' },
    options: [
      { text: { en: 'Turing reduction (multiple oracle calls)', ro: 'Reducere Turing (apeluri multiple ale oracolului)' }, correct: false },
      { text: { en: 'Karp reduction (single oracle call)', ro: 'Reducere Karp (un singur apel al oracolului)' }, correct: true },
      { text: { en: 'Cook reduction', ro: 'Reducere Cook' }, correct: false },
      { text: { en: 'Not a valid reduction', ro: 'Nu este o reducere validă' }, correct: false },
    ],
    explanation: { en: 'Transform (S, P) into S, call ALL NEAREST NEIGHBOR once, extract L[k] where S[k]=P. Single oracle call → Karp reduction. Post-processing is O(n).', ro: 'Se transformă (S, P) în S, se apelează ALL NEAREST NEIGHBOR o dată, se extrage L[k] unde S[k]=P. Un singur apel al oracolului → reducere Karp. Post-procesarea este O(n).' },
  },
  {
    question: { en: '10. How is the center of gravity G used in Graham scan?', ro: '10. Cum este folosit centrul de greutate G în scanarea Graham?' },
    options: [
      { text: { en: 'As the starting point of the scan', ro: 'Ca punct de start al scanării' }, correct: false },
      { text: { en: 'As the origin for polar coordinate sorting', ro: 'Ca origine pentru sortarea după coordonate polare' }, correct: true },
      { text: { en: 'To determine the convex hull diameter', ro: 'Pentru a determina diametrul înfășurătorii convexe' }, correct: false },
      { text: { en: 'To check if a point is inside the hull', ro: 'Pentru a verifica dacă un punct este în interiorul înfășurătorii' }, correct: false },
    ],
    explanation: { en: 'G (average of all coordinates) is guaranteed to be inside CH(S). It serves as the origin for computing polar angles to sort points around it.', ro: 'G (media tuturor coordonatelor) este garantat în interiorul CH(S). Servește ca origine pentru calculul unghiurilor polare pentru sortarea punctelor în jurul lui.' },
  },
];

/* ═══════════════════════════════════════════════════════════
   Section 6: NP-Completeness
   ═══════════════════════════════════════════════════════════ */
const npQuestions = [
  {
    question: { en: '1. If P ≠ NP, then no NP-complete problem is in P. Is this TRUE?', ro: '1. Dacă P ≠ NP, atunci nicio problemă NP-completă nu este în P. Este aceasta ADEVĂRAT?' },
    options: [
      { text: { en: 'True', ro: 'Adevărat' }, correct: true },
      { text: { en: 'False', ro: 'Fals' }, correct: false },
    ],
    explanation: { en: 'If an NP-complete problem X were in P, then every NP problem reduces to X in polynomial time. Combining this with X\'s polynomial algorithm gives P = NP, contradiction.', ro: 'Dacă o problemă NP-completă X ar fi în P, atunci orice problemă din NP se reduce la X în timp polinomial. Combinând aceasta cu algoritmul polinomial al lui X obținem P = NP, contradicție.' },
  },
  {
    question: { en: '2. If P ≠ NP and at least one NP problem has a polynomial solution, does EVERY NP problem have a polynomial solution?', ro: '2. Dacă P ≠ NP și cel puțin o problemă din NP are soluție polinomială, orice problemă din NP are soluție polinomială?' },
    options: [
      { text: { en: 'Yes', ro: 'Da' }, correct: false },
      { text: { en: 'No — counterexample: 2-SAT is in P but 3-SAT (NP-complete) is not', ro: 'Nu — contraexemplu: 2-SAT este în P dar 3-SAT (NP-completă) nu este' }, correct: true },
    ],
    explanation: { en: 'P ⊂ NP means some NP problems (those in P, like 2-SAT) have polynomial solutions, while NP-complete ones (like 3-SAT) do not (assuming P ≠ NP).', ro: 'P ⊂ NP înseamnă că unele probleme din NP (cele din P, ca 2-SAT) au soluții polinomiale, în timp ce cele NP-complete (ca 3-SAT) nu au (presupunând P ≠ NP).' },
  },
  {
    question: { en: '3. What are the 3 properties that characterize the class NP?', ro: '3. Care sunt cele 3 proprietăți care caracterizează clasa NP?' },
    options: [
      { text: { en: 'Decision problem + deterministic + polynomial', ro: 'Problemă de decizie + determinist + polinomial' }, correct: false },
      { text: { en: 'Decision problem + nondeterministic + polynomial (worst case)', ro: 'Problemă de decizie + nedeterminist + polinomial (cazul cel mai nefavorabil)' }, correct: true },
      { text: { en: 'Optimization problem + nondeterministic + exponential', ro: 'Problemă de optimizare + nedeterminist + exponențial' }, correct: false },
      { text: { en: 'Decision problem + probabilistic + polynomial', ro: 'Problemă de decizie + probabilist + polinomial' }, correct: false },
    ],
    explanation: { en: 'NP = {X | X is a (1) decision problem AND there exists a (2) nondeterministic algorithm that is (3) polynomial in the worst case for X}.', ro: 'NP = {X | X este o (1) problemă de decizie ȘI există un (2) algoritm nedeterminist (3) polinomial în cazul cel mai nefavorabil pentru X}.' },
  },
  {
    question: { en: '4. INDEPENDENT-SET: "∃ V\' ⊆ V, |V\'| ≥ k, such that for every edge {u,v} ∈ E, u ∉ V\' OR v ∉ V\'." What does this mean?', ro: '4. INDEPENDENT-SET: „∃ V\' ⊆ V, |V\'| ≥ k, a.î. pentru orice muchie {u,v} ∈ E, u ∉ V\' sau v ∉ V\'." Ce înseamnă aceasta?' },
    options: [
      { text: { en: 'No two selected nodes are connected by an edge', ro: 'Nicio pereche de noduri selectate nu este conectată printr-o muchie' }, correct: true },
      { text: { en: 'Every edge has at least one endpoint in V\'', ro: 'Fiecare muchie are cel puțin un capăt în V\'' }, correct: false },
      { text: { en: 'All selected nodes form a complete subgraph', ro: 'Toate nodurile selectate formează un subgraf complet' }, correct: false },
      { text: { en: 'V\' contains all nodes of degree ≥ k', ro: 'V\' conține toate nodurile de grad ≥ k' }, correct: false },
    ],
    explanation: { en: 'An independent set has no edges between its vertices. The second option describes VERTEX COVER, the third describes CLIQUE.', ro: 'O mulțime independentă nu are muchii între vârfurile sale. A doua opțiune descrie VERTEX COVER, a treia descrie CLIQUE.' },
  },
  {
    question: { en: '5. To show VERTEX COVER is NP-hard (knowing INDEPENDENT-SET is NP-hard), which reduction direction is needed?', ro: '5. Pentru a arăta că VERTEX COVER este NP-dificilă (știind că INDEPENDENT-SET este NP-dificilă), ce direcție de reducere este necesară?' },
    options: [
      { text: { en: 'VERTEX COVER → INDEPENDENT-SET', ro: 'VERTEX COVER → INDEPENDENT-SET' }, correct: false },
      { text: { en: 'INDEPENDENT-SET → VERTEX COVER', ro: 'INDEPENDENT-SET → VERTEX COVER' }, correct: true },
      { text: { en: 'Either direction works', ro: 'Oricare direcție funcționează' }, correct: false },
      { text: { en: 'Neither, they must both reduce to SAT', ro: 'Niciuna, ambele trebuie să se reducă la SAT' }, correct: false },
    ],
    explanation: { en: 'To show Y is NP-hard, reduce a known NP-hard problem X to Y (X → Y). This proves Y is at least as hard as X. Here: INDEPENDENT-SET → VERTEX COVER.', ro: 'Pentru a arăta că Y este NP-dificilă, se reduce o problemă NP-dificilă cunoscută X la Y (X → Y). Aceasta dovedește că Y este cel puțin la fel de dificilă ca X.' },
  },
  {
    question: { en: '6. What is the Karp reduction from CLIQUE to INDEPENDENT-SET?', ro: '6. Care este reducerea Karp de la CLIQUE la INDEPENDENT-SET?' },
    options: [
      { text: { en: 'Complement the graph, keep k', ro: 'Se complementează graful, se păstrează k' }, correct: true },
      { text: { en: 'Remove all edges, set k = |V| - k', ro: 'Se șterg toate muchiile, se setează k = |V| - k' }, correct: false },
      { text: { en: 'Add edges between non-adjacent vertices, keep k', ro: 'Se adaugă muchii între vârfurile neadiacente, se păstrează k' }, correct: false },
      { text: { en: 'Double all edges, set k = 2k', ro: 'Se dublează toate muchiile, se setează k = 2k' }, correct: false },
    ],
    explanation: { en: 'Compute G\' = (V, Ē) where Ē is the complement of E. A clique in G corresponds to an independent set in G\'. Keep k unchanged. Time: O(|V|²).', ro: 'Se calculează G\' = (V, Ē) unde Ē este complementul lui E. O clică în G corespunde unei mulțimi independente în G\'. Se păstrează k neschimbat. Timp: O(|V|²).' },
  },
  {
    question: { en: '7. What is the Karp reduction from VERTEX-COVER(G,k) to INDEPENDENT-SET?', ro: '7. Care este reducerea Karp de la VERTEX-COVER(G,k) la INDEPENDENT-SET?' },
    options: [
      { text: { en: 'Same graph G, change k to |V| - k', ro: 'Același graf G, se schimbă k în |V| - k' }, correct: true },
      { text: { en: 'Complement graph, keep k', ro: 'Se complementează graful, se păstrează k' }, correct: false },
      { text: { en: 'Same graph G, keep k', ro: 'Același graf G, se păstrează k' }, correct: false },
      { text: { en: 'Complement graph, change k to |V| - k', ro: 'Se complementează graful, se schimbă k în |V| - k' }, correct: false },
    ],
    explanation: { en: 'A vertex cover of size ≤ k means the complement (remaining vertices) form an independent set of size ≥ |V|-k. Same graph, k\' = |V| - k.', ro: 'O acoperire cu noduri de dimensiune ≤ k înseamnă că complementul (vârfurile rămase) formează o mulțime independentă de dimensiune ≥ |V|-k. Același graf, k\' = |V| - k.' },
  },
  {
    question: { en: '8. To prove a problem is NP-complete, you must show:', ro: '8. Pentru a demonstra că o problemă este NP-completă, trebuie să arătați:' },
    options: [
      { text: { en: 'It is in P and NP-hard', ro: 'Este în P și NP-dificilă' }, correct: false },
      { text: { en: 'It is in NP and NP-hard', ro: 'Este în NP și NP-dificilă' }, correct: true },
      { text: { en: 'It is in NP and has no polynomial algorithm', ro: 'Este în NP și nu are algoritm polinomial' }, correct: false },
      { text: { en: 'It reduces to SAT', ro: 'Se reduce la SAT' }, correct: false },
    ],
    explanation: { en: 'NP-complete = NP ∩ NP-hard. Show membership in NP (nondeterministic polynomial algorithm) AND NP-hardness (reduce a known NP-hard problem to it).', ro: 'NP-completă = NP ∩ NP-dificilă. Se arată apartenența la NP (algoritm nedeterminist polinomial) ȘI NP-dificultatea (se reduce o problemă NP-dificilă cunoscută la ea).' },
  },
  {
    question: { en: '9. The Subset Sum problem (SSD) has an approximation scheme. What is its type?', ro: '9. Problema Submulțime de sumă dată (SSD) are o schemă de aproximare. Care este tipul ei?' },
    options: [
      { text: { en: '2-approximation', ro: 'Aproximare cu factor 2' }, correct: false },
      { text: { en: 'Fully polynomial-time approximation scheme (FPTAS)', ro: 'Schemă de aproximare complet polinomială (FPTAS)' }, correct: true },
      { text: { en: 'Constant-factor approximation', ro: 'Aproximare cu factor constant' }, correct: false },
      { text: { en: 'No approximation exists', ro: 'Nu există aproximare' }, correct: false },
    ],
    explanation: { en: 'SSD has an FPTAS: the relative error is bounded by ε, and complexity is polynomial in both n and 1/ε. Complexity: O(n² · ln M / ε).', ro: 'SSD are un FPTAS: eroarea relativă este marginită de ε, iar complexitatea este polinomială atât în n cât și în 1/ε. Complexitate: O(n² · ln M / ε).' },
  },
  {
    question: { en: '10. The Set Cover greedy approximation has an approximation ratio bounded by:', ro: '10. Aproximarea greedy pentru Acoperirea Mulțimii are raportul de aproximare mărginit de:' },
    options: [
      { text: '2', correct: false },
      { text: 'log n', correct: false },
      { text: 'Hₙ = 1 + 1/2 + ... + 1/n', correct: true },
      { text: 'n', correct: false },
    ],
    explanation: { en: 'The greedy algorithm (always pick the set with smallest effective cost) achieves approximation ratio Hₙ ≈ ln n, the n-th harmonic number.', ro: 'Algoritmul greedy (alege mereu mulțimea cu cel mai mic cost efectiv) realizează raportul de aproximare Hₙ ≈ ln n, al n-lea număr armonic.' },
  },
  {
    question: { en: '11. Is it possible to have a Karp reduction between two optimization problems?', ro: '11. Este posibil să existe o reducere Karp între două probleme de optimizare?' },
    options: [
      { text: { en: 'Yes, always', ro: 'Da, întotdeauna' }, correct: false },
      { text: { en: 'No, Karp reductions only apply to decision problems', ro: 'Nu, reducerile Karp se aplică doar problemelor de decizie' }, correct: true },
      { text: { en: 'Only if both problems are in NP', ro: 'Doar dacă ambele probleme sunt în NP' }, correct: false },
      { text: { en: 'Only for minimization problems', ro: 'Doar pentru probleme de minimizare' }, correct: false },
    ],
    explanation: { en: 'Karp reductions are defined for decision problems (yes/no output). Optimization problems must first be converted to their decision versions.', ro: 'Reducerile Karp sunt definite pentru probleme de decizie (output da/nu). Problemele de optimizare trebuie mai întâi convertite la versiunile lor de decizie.' },
  },
  {
    question: { en: '12. What is the relationship between P and NP?', ro: '12. Care este relația dintre P și NP?' },
    options: [
      { text: 'P = NP', correct: false },
      { text: { en: 'P ⊆ NP (known), P = NP unknown', ro: 'P ⊆ NP (cunoscut), P = NP necunoscut' }, correct: true },
      { text: 'P ⊃ NP', correct: false },
      { text: { en: 'P and NP are disjoint', ro: 'P și NP sunt disjuncte' }, correct: false },
    ],
    explanation: { en: 'Every deterministic algorithm is a special case of a nondeterministic one, so P ⊆ NP. Whether NP ⊆ P (i.e., P = NP) is the biggest open question in CS.', ro: 'Orice algoritm determinist este un caz particular al unuia nedeterminist, deci P ⊆ NP. Dacă NP ⊆ P (adică P = NP) este cea mai mare întrebare deschisă din informatică.' },
  },
];

/* ═══════════════════════════════════════════════════════════
   Main Practice Component
   ═══════════════════════════════════════════════════════════ */
export default function Practice() {
  const { t } = useApp();

  const sections = [
    { id: 'pa-practice-design', title: t('1. Algorithm Design & Analysis', '1. Proiectare și analiză'), questions: designQuestions },
    { id: 'pa-practice-nondet', title: t('2. Nondeterministic Algorithms', '2. Algoritmi nedeterminiști'), questions: nondeterministicQuestions },
    { id: 'pa-practice-prob', title: t('3. Probabilistic Algorithms & Average Complexity', '3. Algoritmi probabiliști și complexitate medie'), questions: probabilisticQuestions },
    { id: 'pa-practice-strings', title: t('4. String Searching', '4. Căutare peste șiruri'), questions: stringQuestions },
    { id: 'pa-practice-geometry', title: t('5. Computational Geometry', '5. Geometrie computațională'), questions: geometryQuestions },
    { id: 'pa-practice-np', title: t('6. NP-Completeness', '6. NP-Completitudine'), questions: npQuestions },
  ];

  const totalQuestions = sections.reduce((sum, s) => sum + s.questions.length, 0);

  return (
    <div>
      <div className="mb-5 p-4 rounded-xl" style={{ backgroundColor: 'var(--theme-card-bg)', border: '1px solid var(--theme-border)' }}>
        <p className="text-sm" style={{ color: 'var(--theme-content-text)' }}>
          {t(
            `${totalQuestions} multiple-choice questions across 6 topics, with an explanation after every question. No timer — take your time. The first section is open below; expand the rest as you work through them.`,
            `${totalQuestions} întrebări cu răspuns multiplu pe 6 teme, cu o explicație după fiecare întrebare. Fără cronometru — ia-ți timpul necesar. Prima secțiune e deschisă mai jos; extinde-le pe celelalte pe măsură ce avansezi.`
          )}
        </p>
      </div>
      {sections.map((s, i) => {
        // Design section Q2 renders with a Code block above it showing the
        // isinc function body (previously inlined into the stem).
        if (s.id === 'pa-practice-design') {
          const q1 = s.questions.slice(0, 1);
          const q2 = s.questions.slice(1, 2);
          const rest = s.questions.slice(2);
          return (
            <CourseBlock
              key={s.id}
              title={`${s.title} (${s.questions.length})`}
              id={s.id}
              defaultOpen={i === 0}
            >
              <MultipleChoice questions={q1} />
              <Code>{`isinc(a, m) {
  i = 0;
  while (i < m - 1) {
    if (a[i] >= a[i + 1]) return false;
    i = i + 1;
  }
  return true;
}`}</Code>
              <MultipleChoice questions={q2} />
              <MultipleChoice questions={rest} />
            </CourseBlock>
          );
        }
        return (
          <CourseBlock
            key={s.id}
            title={`${s.title} (${s.questions.length})`}
            id={s.id}
            defaultOpen={i === 0}
          >
            <MultipleChoice questions={s.questions} />
          </CourseBlock>
        );
      })}
    </div>
  );
}
