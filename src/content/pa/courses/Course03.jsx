import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Section, Toggle } from '../../../components/ui';

export default function Course03() {
  const { t, checked, toggleCheck } = useApp();

  return (
    <>
      {/* ── Roadmap ── */}
      <Box type="definition">
        <p className="font-bold mb-2">{t('Lecture 3 — Topics:', 'Cursul 3 — Subiecte:')}</p>
        <ol className="list-decimal pl-5 text-sm">
          <li>{t('Nondeterministic algorithms (choice, success, failure)', 'Algoritmi nedeterministici (choice, success, failure)')}</li>
          <li>{t('Deterministic vs nondeterministic comparison and complexity', 'Comparație determinist vs nedeterminist și complexitate')}</li>
          <li>{t('Probabilistic (randomized) algorithms — Las Vegas vs Monte Carlo', 'Algoritmi probabilistici (randomizați) — Las Vegas vs Monte Carlo')}</li>
          <li>{t('Random variables and expected value', 'Variabile aleatoare și valoare așteptată')}</li>
          <li>{t('Las Vegas example: Randomized QuickSort', 'Exemplu Las Vegas: Randomized QuickSort')}</li>
          <li>{t('Monte Carlo example: Solovay-Strassen primality test', 'Exemplu Monte Carlo: testul de primalitate Solovay-Strassen')}</li>
          <li>{t('Mathematical background (counting, probability, indicator variables)', 'Context matematic (numărare, probabilitate, variabile indicator)')}</li>
        </ol>
      </Box>

      {/* ── 1. Nondeterministic Algorithms ── */}
      <Section title={t('1. Nondeterministic Algorithms', '1. Algoritmi nedeterministici')} id="pa-c3-nondet" checked={!!checked['pa-c3-nondet']} onCheck={() => toggleCheck('pa-c3-nondet')}>
        <Box type="definition">
          <p className="font-bold">{t('Deterministic Algorithm', 'Algorithm determinist')}</p>
          <p>{t('An algorithm is deterministic if each instruction it contains has a uniquely determined result. The same input always produces the same output along a single execution path.', 'Un algorithm este determinist dacă fiecare instrucțiune pe care o conține are un rezultat unic determinat. Același input produce întotdeauna același output pe o singură cale de execuție.')}</p>
        </Box>

        <Box type="definition">
          <p className="font-bold">{t('Nondeterministic Algorithm', 'Algorithm nedeterminist')}</p>
          <p>{t('An algorithm is nondeterministic if it contains instructions whose result is not uniquely determined, but a value from a finite set of possible values. It can explore multiple computational paths simultaneously (unrestricted parallelism).', 'Un algorithm este nedeterminist dacă conține instrucțiuni al căror rezultat nu este unic determinat, ci o valoare dintr-o mulțime finită de valori posibile. Poate explora simultan mai multe căi de calcul (paralelism nerestricționat).')}</p>
        </Box>

        <p className="font-bold mt-3">{t('Nondeterministic Operations', 'Operații nedeterministice')}</p>
        <Box type="formula">
          <ul className="text-sm space-y-2">
            <li><span className="font-mono font-bold">choice</span> x <span className="font-mono font-bold">from</span> A — {t('where A is a finite set: at runtime, a copy of the algorithm is made for every value of A, with all copies running independently and simultaneously.', 'unde A este o mulțime finită: la rulare, se face o copie a algorithmului pentru fiecare valoare din A, toate copiile rulând independent și simultan.')}</li>
            <li><span className="font-mono font-bold">success</span> — {t('successfully ends the current execution path AND the entire algorithm (all other paths stop).', 'termină cu succes calea curentă de execuție ȘI întregul algorithm (toate celelalte căi se opresc).')}</li>
            <li><span className="font-mono font-bold">failure</span> — {t('terminates with failure only the current execution path. Other paths are not affected.', 'termină cu eșec doar calea curentă de execuție. Celelalte căi nu sunt afectate.')}</li>
          </ul>
        </Box>

        <p className="font-bold mt-3">{t('Two Phases', 'Două faze')}</p>
        <p className="text-sm">{t('A nondeterministic algorithm generally has two phases:', 'Un algorithm nedeterminist are în general două faze:')}</p>
        <ol className="list-decimal pl-5 text-sm mt-1">
          <li><strong>{t('Guessing phase:', 'Faza de ghicire:')}</strong> {t('the algorithm nondeterministically chooses (guesses) a solution.', 'algorithmul alege nedeterminist (ghicește) o soluție.')}</li>
          <li><strong>{t('Verification phase:', 'Faza de verificare:')}</strong> {t('the algorithm checks the correctness of the guessed solution.', 'algorithmul verifică corectitudinea soluției ghicite.')}</li>
        </ol>

        <p className="font-bold mt-3">{t('Example 1: Even number check', 'Exemplul 1: Verificarea numărului par')}</p>
        <Code>{`choose x from {2, 3, 4}
if x MOD 2 = 0 then
  success
else
  failure

// Two successful choices: x=2 and x=4 → ends in success`}</Code>

        <p className="font-bold mt-3">{t('Example 2: Sum divisible by 5', 'Exemplul 2: Sumă divizibilă cu 5')}</p>
        <Code>{`choose x from {1, 2, 3}
choose y from {5, 6}
if (x + y) MOD 5 = 0 then
  success
else
  failure

// 3 * 2 = 6 execution paths, none successful → ends in failure`}</Code>

        <p className="font-bold mt-3">{t('Example 3: SAT (Boolean Satisfiability)', 'Exemplul 3: SAT (Satisfiabilitate Booleană)')}</p>
        <p className="text-sm">{t('A nondeterministic algorithm for SAT would guess an assignment for all variables, then check whether the formula is true under that assignment. If yes → success; otherwise → failure.', 'Un algorithm nedeterminist pentru SAT ar ghici o atribuire pentru toate variabilele, apoi ar verifica dacă formula este adevărată sub acea atribuire. Dacă da → success; altfel → failure.')}</p>

        <Box type="definition">
          <p className="font-bold">{t('Solving a problem nondeterministically', 'Rezolvarea nedeterministă a unei probleme')}</p>
          <p className="text-sm">{t('A nondeterministic algorithm A solves a problem P if for any instance x of P, there exists a non-failing execution that is terminating, and whose final configuration includes P(x).', 'Un algorithm nedeterminist A rezolvă o problemă P dacă pentru orice instanță x a lui P, există o execuție fără eșec care se termină și a cărei configurație finală include P(x).')}</p>
        </Box>

        <Box type="theorem">
          <p className="font-bold">{t('Equivalence Theorem', 'Teorema de echivalență')}</p>
          <p>{t('For any nondeterministic algorithm A there is an equivalent deterministic algorithm B, which has the worst-case execution time T_B(n) = O(2^{T_A(n)}).', 'Pentru orice algorithm nedeterminist A există un algorithm determinist echivalent B, cu timpul de execuție în cazul cel mai defavorabil T_B(n) = O(2^{T_A(n)}).')}</p>
        </Box>

        <p className="font-bold mt-3">{t('Comparison Table', 'Tabel comparativ')}</p>
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-current/20">
                <th className="text-left p-2">{t('Feature', 'Caracteristică')}</th>
                <th className="text-left p-2">{t('Deterministic', 'Determinist')}</th>
                <th className="text-left p-2">{t('Nondeterministic', 'Nedeterminist')}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-current/10">
                <td className="p-2">{t('Execution Path', 'Calea de execuție')}</td>
                <td className="p-2">{t('Single, well-defined', 'Unică, bine definită')}</td>
                <td className="p-2">{t('Multiple possible paths', 'Mai multe căi posibile')}</td>
              </tr>
              <tr className="border-b border-current/10">
                <td className="p-2">{t('Output for Same Input', 'Output pentru același input')}</td>
                <td className="p-2">{t('Always the same', 'Întotdeauna același')}</td>
                <td className="p-2">{t('May vary based on choices', 'Poate varia în funcție de alegeri')}</td>
              </tr>
              <tr>
                <td className="p-2">{t('Use of Randomness', 'Utilizarea aleatorismului')}</td>
                <td className="p-2">{t('None', 'Niciunul')}</td>
                <td className="p-2">{t('Can involve "guessing" or randomization', 'Poate implica „ghicire" sau randomizare')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      {/* ── 2. Probabilistic (Randomized) Algorithms ── */}
      <Section title={t('2. Probabilistic (Randomized) Algorithms', '2. Algoritmi probabilistici (randomizați)')} id="pa-c3-prob" checked={!!checked['pa-c3-prob']} onCheck={() => toggleCheck('pa-c3-prob')}>
        <Box type="definition">
          <p className="font-bold">{t('Randomized Algorithm', 'Algorithm randomizat')}</p>
          <p>{t('A randomized algorithm makes random choices at certain points during execution, leading to different possible outcomes for the same input. In addition to its input, it has access to a stream of random bits. Even when the input is fixed, the execution time is a random variable.', 'Un algorithm randomizat face alegeri aleatoare în anumite puncte ale execuției, ducând la rezultate posibile diferite pentru același input. Pe lângă input, are acces la un flux de biți aleatori. Chiar și când inputul e fix, timpul de execuție este o variabilă aleatoare.')}</p>
        </Box>

        <Box type="theorem">
          <p className="font-bold">{t('Advantages of Randomized Algorithms', 'Avantajele algoritmilor randomizați')}</p>
          <ol className="list-decimal pl-5 text-sm mt-1">
            <li>{t('Often faster or use less space than the best known deterministic algorithm (e.g., Miller-Rabin vs AKS for primality testing — AKS is O(log^12 n) vs much faster randomized tests).', 'Adesea mai rapizi sau folosesc mai puțin spațiu decât cel mai bun algorithm determinist cunoscut (ex: Miller-Rabin vs AKS pentru testarea primalității — AKS este O(log^12 n) vs teste randomizate mult mai rapide).')}</li>
            <li>{t('Usually extremely simple to understand and implement — often, adding randomization converts a naive algorithm with bad worst-case into one that performs well with high probability on every input.', 'De obicei extrem de simplu de înțeles și implementat — adesea, adăugarea randomizării convertește un algorithm naiv cu caz defavorabil prost într-unul care funcționează bine cu probabilitate mare pe orice input.')}</li>
          </ol>
        </Box>

        <p className="font-bold mt-3">{t('Two Main Classes', 'Două clase principale')}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mt-2">
          <Box type="formula">
            <p className="font-bold">Las Vegas</p>
            <p>{t('Always produce correct results, but have variable running time. Gamble with time, never with correctness.', 'Produc întotdeauna rezultate corecte, dar au timp de execuție variabil. Riscă cu timpul, niciodată cu corectitudinea.')}</p>
          </Box>
          <Box type="formula">
            <p className="font-bold">Monte Carlo</p>
            <p>{t('Run in bounded time, but may yield incorrect answers with some probability (that can be decreased at the expense of execution time).', 'Rulează în timp limitat, dar pot produce răspunsuri incorecte cu o anumită probabilitate (care poate fi scăzută pe costul timpului de execuție).')}</p>
          </Box>
        </div>

        <p className="font-bold mt-3">{t('Motivating Problem', 'Problema motivantă')}</p>
        <p className="text-sm">{t('Given an array a of n ≥ 2 elements with equal number of 0s and 1s, output an index of a 1.', 'Se dă un array a de n ≥ 2 elemente cu un număr egal de 0-uri și 1-uri, să se returneze un index al unui 1.')}</p>

        <p className="font-bold mt-3">{t('Las Vegas approach: Infinite Random Search', 'Abordarea Las Vegas: Căutare aleatoare infinită')}</p>
        <Code>{`InfiniteRandomSearch(a[0..n-1]):
  while true do
    k ← Random(0, n-1)
    if a[k] = 1 then
      return k

// Always correct, but runtime is variable
// Does NOT gamble with correctness`}</Code>

        <p className="font-bold mt-3">{t('Monte Carlo approach: ε-Bounded Random Search', 'Abordarea Monte Carlo: Căutare aleatoare ε-limitată')}</p>
        <Code>{`BoundedRandomSearch(a[0..n-1], ε):
  for i = 1 to ε do
    k ← Random(0, n-1)
    if a[k] = 1 then
      return k
  return "failed"

// Bounded runtime (at most ε iterations)
// May return "failed" even though 1s exist
// Probability of failure = (1/2)^ε`}</Code>

        <Box type="warning">
          <p className="font-bold">{t('Key distinction:', 'Distincție cheie:')}</p>
          <p>{t('Las Vegas gambles with run time (may run long, but always correct). Monte Carlo gambles with correctness (bounded time, but may be wrong). The failure probability of the Monte Carlo version is (1/2)^ε.', 'Las Vegas riscă cu timpul de execuție (poate rula mult, dar e mereu corect). Monte Carlo riscă cu corectitudinea (timp limitat, dar poate greși). Probabilitatea de eșec a versiunii Monte Carlo este (1/2)^ε.')}</p>
        </Box>
      </Section>

      {/* ── 3. Random Variables and Expected Value ── */}
      <Section title={t('3. Random Variables and Expected Value', '3. Variabile aleatoare și valoare așteptată')} id="pa-c3-rv" checked={!!checked['pa-c3-rv']} onCheck={() => toggleCheck('pa-c3-rv')}>
        <Box type="definition">
          <p className="font-bold">{t('Discrete Random Variable', 'Variabilă aleatoare discretă')}</p>
          <p>{t('A (discrete) random variable X is a function from a finite or countably infinite sample space S to the real numbers. It associates a real number with each possible outcome of an experiment.', 'O variabilă aleatoare (discretă) X este o funcție de la un spațiu de eșantionare finit sau numărabil infinit S la numerele reale. Asociază un număr real fiecărui rezultat posibil al unui experiment.')}</p>
        </Box>

        <Box type="formula">
          <p className="font-bold">{t('Probability Density Function', 'Funcția de densitate de probabilitate')}</p>
          <p className="font-mono text-sm">Pr{'{'} X = x {'}'} = {'Σ'}<sub>s{'∈'}S, X(s)=x</sub> Pr{'{'} s {'}'}</p>
          <p className="text-sm mt-1">{t('The function f(x) = Pr{X = x} is the probability density function of X.', 'Funcția f(x) = Pr{X = x} este funcția de densitate de probabilitate a lui X.')}</p>
          <p className="text-sm">{t('From axioms: Pr{X = x} ≥ 0 and Σ_x Pr{X = x} = 1.', 'Din axiome: Pr{X = x} ≥ 0 și Σ_x Pr{X = x} = 1.')}</p>
        </Box>

        <p className="font-bold mt-3">{t('Example: Rolling a Fair Die (D)', 'Exemplu: Aruncarea unui zar corect (D)')}</p>
        <p className="text-sm">{t('Each face has probability 1/6. The random variable D returns the number on the die.', 'Fiecare față are probabilitatea 1/6. Variabila aleatoare D returnează numărul de pe zar.')}</p>

        <p className="font-bold mt-3">{t('Example: Sum of Two Dice (SD2)', 'Exemplu: Suma a două zaruri (SD2)')}</p>
        <p className="text-sm">{t('Total 6×6 = 36 possible rolls. Pr{X=2} = 1/36 (only 1+1), Pr{X=4} = 3/36 (pairs: 1+3, 2+2, 3+1), Pr{X=7} = 6/36 (most likely sum).', 'Total 6×6 = 36 aruncări posibile. Pr{X=2} = 1/36 (doar 1+1), Pr{X=4} = 3/36 (perechi: 1+3, 2+2, 3+1), Pr{X=7} = 6/36 (suma cea mai probabilă).')}</p>

        <Box type="definition">
          <p className="font-bold">{t('Expected Value', 'Valoarea așteptată')}</p>
          <p className="font-mono text-sm">E[X] = Σ<sub>x</sub> x · Pr{'{'} X = x {'}'}</p>
          <p className="text-sm mt-1">{t('The expected value (expectation, mean) is the "average" of the values the random variable takes on, weighted by their probabilities.', 'Valoarea așteptată (speranța matematică, media) este „media" valorilor pe care le ia variabila aleatoare, ponderată cu probabilitățile lor.')}</p>
        </Box>

        <Box type="formula">
          <p className="font-bold">{t('Key Properties', 'Proprietăți cheie')}</p>
          <ul className="text-sm space-y-1 mt-1">
            <li><strong>{t('Linearity:', 'Liniaritate:')}</strong> E[X + Y] = E[X] + E[Y] {t('(always, even for dependent variables)', '(întotdeauna, chiar și pentru variabile dependente)')}</li>
            <li><strong>{t('Product (independent):', 'Produs (independente):')}</strong> E[X · Y] = E[X] · E[Y] {t('when X and Y are independent', 'când X și Y sunt independente')}</li>
            <li><strong>{t('Natural numbers:', 'Numere naturale:')}</strong> {t('When X takes values from ℕ:', 'Când X ia valori din ℕ:')} E[X] = Σ<sub>i=1</sub><sup>∞</sup> Pr{'{'} X ≥ i {'}'}</li>
          </ul>
        </Box>

        <p className="font-bold mt-3">{t('Example: Chocolate Bar (CB)', 'Exemplu: Tableta de ciocolată (CB)')}</p>
        <p className="text-sm">{t('Break a chocolate bar of n equal pieces at a random position, take the larger piece. CB returns max(i/n, (n-i)/n) for i = 1, ..., n-1.', 'Sparge o tabletă de ciocolată de n bucăți egale la o poziție aleatoare, ia bucata mai mare. CB returnează max(i/n, (n-i)/n) pentru i = 1, ..., n-1.')}</p>
        <Box type="formula">
          <p className="font-bold">{t('Expected value of CB (n odd)', 'Valoarea așteptată a CB (n impar)')}</p>
          <p className="text-sm">{t('Possible values: k/n for k = (n+1)/2, ..., n-1, each with probability 2/(n-1).', 'Valori posibile: k/n pentru k = (n+1)/2, ..., n-1, fiecare cu probabilitatea 2/(n-1).')}</p>
          <p className="font-mono text-sm mt-1">E[CB] = (3n² - 4n + 1) / (4n(n-1))</p>
          <p className="text-sm mt-1">{t('As n → ∞, E[CB] → 3/4. On average, you get 3/4 of the bar.', 'Când n → ∞, E[CB] → 3/4. În medie, primești 3/4 din tabletă.')}</p>
        </Box>
      </Section>

      {/* ── 4. Las Vegas: Randomized QuickSort ── */}
      <Section title={t('4. Las Vegas Example: Randomized QuickSort', '4. Exemplu Las Vegas: Randomized QuickSort')} id="pa-c3-qsort" checked={!!checked['pa-c3-qsort']} onCheck={() => toggleCheck('pa-c3-qsort')}>
        <p>{t('QuickSort applies the divide-and-conquer paradigm to sorting:', 'QuickSort aplică paradigma divide-and-conquer la sortare:')}</p>
        <ol className="list-decimal pl-5 text-sm mt-1">
          <li><strong>Divide:</strong> {t('Partition A[p..r] into A[p..q-1] (≤ pivot) and A[q+1..r] (≥ pivot).', 'Partiționează A[p..r] în A[p..q-1] (≤ pivot) și A[q+1..r] (≥ pivot).')}</li>
          <li><strong>Conquer:</strong> {t('Recursively sort the two subarrays.', 'Sortează recursiv cele două subarray-uri.')}</li>
          <li><strong>Combine:</strong> {t('No work needed — the array is already sorted in place.', 'Nicio operație necesară — array-ul e deja sortat pe loc.')}</li>
        </ol>

        <p className="font-bold mt-3">QuickSort</p>
        <Code>{`function QuickSort(A, p, r):
  if p < r then
    q ← Partition(A, p, r)
    QuickSort(A, p, q - 1)
    QuickSort(A, q + 1, r)`}</Code>

        <p className="font-bold mt-3">Partition</p>
        <Code>{`function Partition(A, p, r):
  x ← A[r]              // pivot element
  i ← p - 1
  for j ← p to r - 1 do
    if A[j] ≤ x then
      i ← i + 1
      swap A[i] and A[j]
  swap A[i + 1] and A[r]
  return i + 1`}</Code>

        <Box type="warning">
          <p className="font-bold">{t('Worst vs Best Case', 'Cazul cel mai defavorabil vs cel mai bun')}</p>
          <ul className="text-sm space-y-1 mt-1">
            <li><strong>{t('Worst case:', 'Caz defavorabil:')}</strong> {t('Partition produces n-1 and 0 elements → T(n) = T(n-1) + Θ(n) = Θ(n²)', 'Partition produce n-1 și 0 elemente → T(n) = T(n-1) + Θ(n) = Θ(n²)')}</li>
            <li><strong>{t('Best case:', 'Caz favorabil:')}</strong> {t('Partition splits evenly → T(n) = 2T(n/2) + Θ(n) = Θ(n log n)', 'Partition împarte egal → T(n) = 2T(n/2) + Θ(n) = Θ(n log n)')}</li>
          </ul>
        </Box>

        <p className="font-bold mt-3">{t('Randomized Version', 'Versiunea randomizată')}</p>
        <p className="text-sm">{t('Instead of always using the rightmost element as pivot, randomly choose an element from A[p..r]. This ensures the pivot is equally likely to be any element, giving a well-balanced split on average.', 'În loc să folosim mereu elementul din dreapta ca pivot, alegem aleator un element din A[p..r]. Aceasta asigură că pivotul este la fel de probabil să fie orice element, oferind o împărțire echilibrată în medie.')}</p>

        <Code>{`function Randomized-Partition(A, p, r):
  i ← Random(p, r)
  swap A[r] and A[i]
  return Partition(A, p, r)

function Randomized-QuickSort(A, p, r):
  if p < r then
    q ← Randomized-Partition(A, p, r)
    Randomized-QuickSort(A, p, q - 1)
    Randomized-QuickSort(A, q + 1, r)`}</Code>

        <Box type="theorem">
          <p className="font-bold">{t('Expected Running Time Analysis', 'Analiza timpului de execuție așteptat')}</p>
          <p className="text-sm">{t('Define indicator random variable X_ij = 1 if the i-th and j-th elements (in sorted order) are compared, 0 otherwise. Total comparisons:', 'Definim variabila indicator X_ij = 1 dacă al i-lea și al j-lea element (în ordine sortată) sunt comparate, 0 altfel. Total comparații:')}</p>
          <p className="font-mono text-sm mt-1">C(n) = Σ<sub>i=1</sub><sup>n-1</sup> Σ<sub>j=i+1</sub><sup>n</sup> X<sub>ij</sub></p>
          <p className="text-sm mt-2">{t('The i-th and j-th elements are compared iff the first pivot chosen from a_i..a_j is a_i or a_j, so p_ij = 2/(j+1-i).', 'Al i-lea și al j-lea element sunt comparate dacă și numai dacă primul pivot ales din a_i..a_j este a_i sau a_j, deci p_ij = 2/(j+1-i).')}</p>
          <p className="font-mono text-sm mt-1">E[C(n)] = Σ<sub>i=1</sub><sup>n-1</sup> Σ<sub>j=i+1</sub><sup>n</sup> 2/(j+1-i) {'<'} Σ<sub>i=1</sub><sup>n-1</sup> 2·H<sub>n</sub></p>
          <p className="text-sm mt-2">{t('Since the harmonic series H_n ~ ln n, the expected number of comparisons is O(n log n). Therefore Randomized QuickSort runs in expected O(n log n) time.', 'Deoarece seria armonică H_n ~ ln n, numărul așteptat de comparații este O(n log n). Prin urmare, Randomized QuickSort rulează în timp așteptat O(n log n).')}</p>
        </Box>
      </Section>

      {/* ── 5. Monte Carlo: Solovay-Strassen Primality Test ── */}
      <Section title={t('5. Monte Carlo Example: Solovay-Strassen Primality Test', '5. Exemplu Monte Carlo: Testul de primalitate Solovay-Strassen')} id="pa-c3-ss" checked={!!checked['pa-c3-ss']} onCheck={() => toggleCheck('pa-c3-ss')}>
        <p className="text-sm">{t('The primality problem: given a number k, is it prime? A naive deterministic test runs in O(√k). The Solovay-Strassen test uses number-theoretic properties for a faster probabilistic answer.', 'Problema primalității: dat un număr k, este prim? Un test naiv determinist rulează în O(√k). Testul Solovay-Strassen folosește proprietăți din teoria numerelor pentru un răspuns probabilistic mai rapid.')}</p>

        <p className="font-bold mt-3">{t('Naive Primality Test', 'Test naiv de primalitate')}</p>
        <Code>{`function IsPrime(k):
  if k ≤ 1 then return false
  for i ← 2 to √k do
    if k mod i = 0 then return false
  return true`}</Code>

        <Box type="definition">
          <p className="font-bold">{t('Legendre Symbol', 'Simbolul Legendre')}</p>
          <p className="text-sm">{t('For an odd prime p and integer a:', 'Pentru un prim impar p și un întreg a:')}</p>
          <p className="font-mono text-sm mt-1">(a/p) = {'{'}+1 {t('if a is a quadratic residue mod p and a ≢ 0 (mod p)', 'dacă a este reziduu cuadratic mod p și a ≢ 0 (mod p)')}{'}'}
          </p>
          <p className="font-mono text-sm">(a/p) = {'{'}-1 {t('if a is a non-quadratic residue mod p', 'dacă a este non-reziduu cuadratic mod p')}{'}'}
          </p>
          <p className="font-mono text-sm">(a/p) = {'{'}0 {t('if a ≡ 0 (mod p)', 'dacă a ≡ 0 (mod p)')}{'}'}
          </p>
          <p className="text-sm mt-1">{t('Determines whether ∃x such that x² ≡ a (mod p).', 'Determină dacă ∃x astfel încât x² ≡ a (mod p).')}</p>
        </Box>

        <Box type="formula">
          <p className="font-bold">{t('Properties of the Legendre Symbol', 'Proprietățile simbolului Legendre')}</p>
          <ol className="list-decimal pl-5 text-sm mt-1 space-y-1">
            <li><strong>{t('Congruence:', 'Congruență:')}</strong> {t('If a ≡ b (mod n), then (a/n) = (b/n)', 'Dacă a ≡ b (mod n), atunci (a/n) = (b/n)')}</li>
            <li><strong>{t('Multiplicative:', 'Multiplicativitate:')}</strong> (a·b/p) = (a/p)·(b/p)</li>
            <li><strong>{t("Euler's Criterion:", 'Criteriul lui Euler:')}</strong> (a/p) ≡ a<sup>(p-1)/2</sup> (mod p)</li>
            <li><strong>{t('Quadratic Reciprocity (Gauss):', 'Reciprocitatea cuadratică (Gauss):')}</strong> {t('For distinct odd primes a, p:', 'Pentru prime impare distincte a, p:')} (a/p)·(p/a) = (-1)<sup>(a-1)(p-1)/4</sup></li>
          </ol>
        </Box>

        <Box type="definition">
          <p className="font-bold">{t('Jacobi Symbol', 'Simbolul Jacobi')}</p>
          <p className="text-sm">{t('A generalization of the Legendre symbol to any odd composite number. For n = p₁^e₁ · p₂^e₂ · ... · pₖ^eₖ:', 'O generalizare a simbolului Legendre la orice număr compus impar. Pentru n = p₁^e₁ · p₂^e₂ · ... · pₖ^eₖ:')}</p>
          <p className="font-mono text-sm mt-1">(a/n) = (a/p₁)^e₁ · (a/p₂)^e₂ · ... · (a/pₖ)^eₖ</p>
          <p className="text-sm mt-1">{t('Can be computed efficiently without factoring n. If n is prime, the Jacobi symbol equals the Legendre symbol.', 'Poate fi calculat eficient fără factorizarea lui n. Dacă n este prim, simbolul Jacobi este egal cu simbolul Legendre.')}</p>
        </Box>

        <p className="font-bold mt-3">{t('Algorithm: Compute Jacobi Symbol', 'Algorithm: Calculul simbolului Jacobi')}</p>
        <Code>{`function JacobiSymbol(a, n):
  if n ≤ 0 or n is even then return undefined
  a ← a mod n
  j ← 1
  while a ≠ 0 do
    while a is even do
      a ← a / 2
      if n mod 8 = 3 or n mod 8 = 5 then
        j ← -j
    swap a, n
    if a ≡ 3 (mod 4) and n ≡ 3 (mod 4) then
      j ← -j
    a ← a mod n
  if n = 1 then return j
  else return 0`}</Code>

        <Box type="definition">
          <p className="font-bold">{t('Witness for Compositeness', 'Martor al compunerii')}</p>
          <p className="text-sm">{t('A number a is a witness for the compositeness of n if gcd(a,n) > 1 or (a/n) ≢ a^{(n-1)/2} (mod n). For an odd composite n, more than half of 1 ≤ a ≤ n-1 are witnesses.', 'Un număr a este martor al compunerii lui n dacă gcd(a,n) > 1 sau (a/n) ≢ a^{(n-1)/2} (mod n). Pentru un n compus impar, mai mult de jumătate din 1 ≤ a ≤ n-1 sunt martori.')}</p>
        </Box>

        <p className="font-bold mt-3">{t('Modular Exponentiation (Power Mod)', 'Exponențiere modulară (Power Mod)')}</p>
        <Code>{`function PowerMod(a, n, p):
  r ← 1
  while n > 0 do
    if n % 2 == 1 then
      r ← r * a (mod p)
    a ← a * a (mod p)
    n ← n / 2
  return r

// Computes a^n mod p in O(log n) time`}</Code>

        <p className="font-bold mt-3">{t('Solovay-Strassen Algorithm (single test)', 'Algorithmul Solovay-Strassen (test unic)')}</p>
        <Code>{`function SolovayStrassen(n):
  if n ≤ 1 or (n is even and n > 2) then return Composite
  Choose random a, 2 ≤ a ≤ n-1
  if gcd(a, n) ≠ 1 then return Composite
  j ← JacobiSymbol(a, n)
  x ← PowerMod(a, (n-1)/2, n)
  if j == 0 or x ≢ j (mod n) then return Composite
  return ProbablyPrime`}</Code>

        <p className="font-bold mt-3">{t('Solovay-Strassen with k iterations (reduced error)', 'Solovay-Strassen cu k iterații (eroare redusă)')}</p>
        <Code>{`function SolovayStrassen(n, k):
  if n ≤ 1 or (n is even and n > 2) then return Composite
  for i = 1 to k do
    Choose random a, 2 ≤ a ≤ n-1
    if gcd(a, n) ≠ 1 then return Composite
    j ← JacobiSymbol(a, n)
    x ← PowerMod(a, (n-1)/2, n)
    if j == 0 or x ≢ j (mod n) then return Composite
  return ProbablyPrime

// False positive probability: (1/2)^k`}</Code>

        <Box type="theorem">
          <p className="font-bold">{t('Error Probability', 'Probabilitatea de eroare')}</p>
          <p>{t('Since more than half of values 1 ≤ a ≤ n-1 are witnesses for a composite n, the probability that the k-iteration algorithm returns "ProbablyPrime" for a composite number is at most (1/2)^k. With k = 50, the false positive probability is ≈ 10⁻¹⁵.', 'Deoarece mai mult de jumătate din valorile 1 ≤ a ≤ n-1 sunt martori pentru un n compus, probabilitatea ca algorithmul cu k iterații să returneze „ProbablyPrime" pentru un număr compus este cel mult (1/2)^k. Cu k = 50, probabilitatea de fals pozitiv este ≈ 10⁻¹⁵.')}</p>
        </Box>
      </Section>

      {/* ── 6. Mathematical Background ── */}
      <Section title={t('6. Mathematical Background (Appendix)', '6. Context matematic (Apendice)')} id="pa-c3-math" checked={!!checked['pa-c3-math']} onCheck={() => toggleCheck('pa-c3-math')}>
        <p className="font-bold">{t('6.1 Counting Theory', '6.1 Teoria numărării')}</p>

        <Box type="formula">
          <p className="font-bold">{t('Rule of Sum', 'Regula sumei')}</p>
          <p className="text-sm">{t('For two disjoint sets A and B: |A ∪ B| = |A| + |B|. Example: a username character can be a letter (26), digit (10), or special char (2) → 38 choices.', 'Pentru două mulțimi disjuncte A și B: |A ∪ B| = |A| + |B|. Exemplu: un caracter de username poate fi literă (26), cifră (10) sau caracter special (2) → 38 opțiuni.')}</p>
        </Box>

        <Box type="formula">
          <p className="font-bold">{t('Rule of Product', 'Regula produsului')}</p>
          <p className="text-sm">{t('For ordered pairs from sets A and B: |A × B| = |A| · |B|. Example: 18 boys and 7 girls → 18 × 7 = 126 dance pairs.', 'Pentru perechi ordonate din mulțimile A și B: |A × B| = |A| · |B|. Exemplu: 18 băieți și 7 fete → 18 × 7 = 126 perechi de dans.')}</p>
        </Box>

        <Box type="formula">
          <p className="font-bold">{t('Strings, Permutations, Combinations', 'Șiruri, Permutări, Combinări')}</p>
          <ul className="text-sm space-y-1 mt-1">
            <li><strong>{t('k-strings over set S:', 'k-șiruri peste mulțimea S:')}</strong> |S|<sup>k</sup> {t('total', 'total')} ({t('binary strings of length k:', 'șiruri binare de lungime k:')} 2<sup>k</sup>)</li>
            <li><strong>{t('Permutations of n elements:', 'Permutări ale n elemente:')}</strong> n!</li>
            <li><strong>{t('k-permutations of n:', 'k-permutări din n:')}</strong> n! / (n-k)!</li>
            <li><strong>{t('k-combinations (C(n,k)):', 'k-combinări (C(n,k)):')}</strong> n! / (k!(n-k)!)</li>
          </ul>
        </Box>

        <Box type="formula">
          <p className="font-bold">{t('Binomial Theorem', 'Teorema binomială')}</p>
          <p className="font-mono text-sm">(x + y)<sup>n</sup> = Σ<sub>k=0</sub><sup>n</sup> C(n,k) · x<sup>k</sup> · y<sup>n-k</sup></p>
          <p className="text-sm mt-1">{t('Special case (x = y = 1): 2^n = Σ C(n,k). This counts binary n-strings by number of 1s.', 'Caz special (x = y = 1): 2^n = Σ C(n,k). Aceasta numără șirurile binare de lungime n după numărul de 1-uri.')}</p>
        </Box>

        <p className="font-bold mt-4">{t('6.2 Probability', '6.2 Probabilitate')}</p>

        <Box type="definition">
          <p className="font-bold">{t('Probability Axioms', 'Axiomele probabilității')}</p>
          <ol className="list-decimal pl-5 text-sm mt-1 space-y-1">
            <li>Pr{'{'} A {'}'} ≥ 0 {t('for any event A', 'pentru orice eveniment A')}</li>
            <li>Pr{'{'} S {'}'} = 1 ({t('certain event', 'eveniment cert')})</li>
            <li>Pr{'{'} A ∪ B {'}'} = Pr{'{'} A {'}'} + Pr{'{'} B {'}'} {t('for mutually exclusive A, B', 'pentru A, B mutual exclusive')}</li>
          </ol>
        </Box>

        <Box type="formula">
          <p className="font-bold">{t('Key Results', 'Rezultate cheie')}</p>
          <ul className="text-sm space-y-1 mt-1">
            <li>Pr{'{'} ∅ {'}'} = 0</li>
            <li>{t('If A ⊆ B, then Pr{A} ≤ Pr{B}', 'Dacă A ⊆ B, atunci Pr{A} ≤ Pr{B}')}</li>
            <li>{t('Complement:', 'Complementar:')} Pr{'{'} A̅ {'}'} = 1 - Pr{'{'} A {'}'}</li>
            <li>{t('Union bound:', 'Limita reuniunii:')} Pr{'{'} A ∪ B {'}'} = Pr{'{'} A {'}'} + Pr{'{'} B {'}'} - Pr{'{'} A ∩ B {'}'} ≤ Pr{'{'} A {'}'} + Pr{'{'} B {'}'}</li>
            <li><strong>{t('Conditional:', 'Condiționat:')}</strong> Pr{'{'} A | B {'}'} = Pr{'{'} A ∩ B {'}'} / Pr{'{'} B {'}'}</li>
            <li><strong>{t('Independence:', 'Independență:')}</strong> {t('A, B independent iff Pr{A ∩ B} = Pr{A} · Pr{B}', 'A, B independente dacă și numai dacă Pr{A ∩ B} = Pr{A} · Pr{B}')}</li>
          </ul>
        </Box>

        <p className="font-bold mt-4">{t('6.3 Indicator Random Variables', '6.3 Variabile aleatoare indicator')}</p>
        <Box type="definition">
          <p className="font-bold">{t('Indicator Random Variable', 'Variabila aleatoare indicator')}</p>
          <p className="text-sm">{t('For an event A, the indicator I{A} = 1 if A occurs, 0 otherwise.', 'Pentru un eveniment A, indicatorul I{A} = 1 dacă A se produce, 0 altfel.')}</p>
          <p className="font-mono text-sm mt-1">E[I{'{'}A{'}'}] = Pr{'{'}A{'}'}</p>
          <p className="text-sm mt-1">{t('Example: coin flip. X_H = I{H}. E[X_H] = 1·Pr{H} + 0·Pr{T} = 1/2.', 'Exemplu: aruncarea monedei. X_H = I{H}. E[X_H] = 1·Pr{H} + 0·Pr{T} = 1/2.')}</p>
        </Box>

        <Box type="theorem">
          <p className="font-bold">{t('Lemma (Indicator ↔ Probability)', 'Lema (Indicator ↔ Probabilitate)')}</p>
          <p className="text-sm">{t('Given a sample space S and an event A, let X_A = I{A}. Then E[X_A] = Pr{A}. This provides a convenient method for converting between probabilities and expectations — key for analyzing randomized algorithms (e.g., counting comparisons in Randomized QuickSort).', 'Dat un spațiu de eșantionare S și un eveniment A, fie X_A = I{A}. Atunci E[X_A] = Pr{A}. Aceasta oferă o metodă convenabilă de conversie între probabilități și speranțe — esențială pentru analiza algoritmilor randomizați (ex: numărarea comparațiilor în Randomized QuickSort).')}</p>
        </Box>
      </Section>

      {/* ── Self-Test ── */}
      <Section title={t('Self-Test (6 Questions)', 'Autoevaluare (6 întrebări)')} id="pa-c3-quiz" checked={!!checked['pa-c3-quiz']} onCheck={() => toggleCheck('pa-c3-quiz')}>
        <Toggle
          question={t('1. What are the three operations of a nondeterministic algorithm?', '1. Care sunt cele trei operații ale unui algorithm nedeterminist?')}
          answer={t('"choice x from A" — creates a copy for every value of A, running all in parallel. "success" — ends the current path and the entire algorithm (solution found). "failure" — terminates only the current path; other paths continue. The algorithm succeeds if any path reaches success.', '„choice x from A" — creează o copie pentru fiecare valoare din A, rulând toate în paralel. „success" — termină calea curentă și întregul algorithm (soluție găsită). „failure" — termină doar calea curentă; celelalte continuă. Algorithmul reușește dacă orice cale ajunge la success.')}
          hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
        />
        <Toggle
          question={t('2. What is the difference between Las Vegas and Monte Carlo algorithms?', '2. Care este diferența dintre algoritmii Las Vegas și Monte Carlo?')}
          answer={t('Las Vegas algorithms always produce correct results but have variable running time (gamble with time). Monte Carlo algorithms run in bounded time but may yield incorrect answers with some probability (gamble with correctness). The error probability of Monte Carlo can be reduced by running more iterations.', 'Algoritmii Las Vegas produc mereu rezultate corecte, dar au timp de execuție variabil (riscă cu timpul). Algoritmii Monte Carlo rulează în timp limitat, dar pot produce răspunsuri incorecte cu o anumită probabilitate (riscă cu corectitudinea). Probabilitatea de eroare Monte Carlo poate fi redusă prin mai multe iterații.')}
          hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
        />
        <Toggle
          question={t('3. Why does Randomized QuickSort have expected O(n log n) time?', '3. De ce are Randomized QuickSort timp așteptat O(n log n)?')}
          answer={t('By choosing the pivot randomly, we ensure each element is equally likely to be the pivot. The expected number of comparisons is analyzed via indicator random variables: X_ij = 1 if elements i and j (sorted order) are compared. The probability p_ij = 2/(j+1-i). Summing over all pairs gives E[C(n)] < 2(n-1)·H_n, where H_n ~ ln n. Therefore expected comparisons = O(n log n).', 'Alegând pivotul aleator, ne asigurăm că fiecare element e la fel de probabil să fie pivot. Numărul așteptat de comparații e analizat prin variabile indicator: X_ij = 1 dacă elementele i și j (ordine sortată) sunt comparate. Probabilitatea p_ij = 2/(j+1-i). Însumând peste toate perechile obținem E[C(n)] < 2(n-1)·H_n, unde H_n ~ ln n. Deci comparații așteptate = O(n log n).')}
          hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
        />
        <Toggle
          question={t('4. What is a "witness for compositeness" in the Solovay-Strassen test?', '4. Ce este un „martor al compunerii" în testul Solovay-Strassen?')}
          answer={t('A number a is a witness for the compositeness of n if gcd(a,n) > 1, or if the Jacobi symbol (a/n) ≢ a^{(n-1)/2} (mod n). For an odd composite n, more than half of all values 1 ≤ a ≤ n-1 are witnesses. This means each random test has at least a 50% chance of catching a composite, giving error probability (1/2)^k after k iterations.', 'Un număr a este martor al compunerii lui n dacă gcd(a,n) > 1, sau dacă simbolul Jacobi (a/n) ≢ a^{(n-1)/2} (mod n). Pentru un n compus impar, mai mult de jumătate din toate valorile 1 ≤ a ≤ n-1 sunt martori. Aceasta înseamnă că fiecare test aleator are cel puțin 50% șanse de a prinde un compus, dând probabilitatea de eroare (1/2)^k după k iterații.')}
          hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
        />
        <Toggle
          question={t('5. What is the relationship between a nondeterministic algorithm and its deterministic equivalent?', '5. Care este relația dintre un algorithm nedeterminist și echivalentul său determinist?')}
          answer={t('For any nondeterministic algorithm A, there exists an equivalent deterministic algorithm B with worst-case time T_B(n) = O(2^{T_A(n)}). The deterministic version simulates all possible execution paths, leading to an exponential blowup. This is the fundamental gap between NP (nondeterministic polynomial) and what deterministic algorithms can achieve.', 'Pentru orice algorithm nedeterminist A, există un algorithm determinist echivalent B cu timpul în cazul cel mai defavorabil T_B(n) = O(2^{T_A(n)}). Versiunea deterministă simulează toate căile posibile de execuție, ducând la o explozie exponențială. Aceasta este diferența fundamentală între NP (nedeterminist polinomial) și ce pot realiza algoritmii deterministi.')}
          hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
        />
        <Toggle
          question={t('6. What does E[I{A}] = Pr{A} mean and why is it useful?', '6. Ce înseamnă E[I{A}] = Pr{A} și de ce este util?')}
          answer={t('An indicator random variable I{A} is 1 if event A occurs and 0 otherwise. Its expected value equals the probability of A. This is useful because it lets us convert between probabilities and expectations: we can decompose a complex random variable into a sum of simple indicators, then use linearity of expectation (E[Σ X_i] = Σ E[X_i]) to compute the expected value — exactly as done in the Randomized QuickSort analysis.', 'O variabilă aleatoare indicator I{A} este 1 dacă evenimentul A se produce și 0 altfel. Valoarea sa așteptată este egală cu probabilitatea lui A. Aceasta e utilă deoarece permite conversia între probabilități și speranțe: putem descompune o variabilă aleatoare complexă într-o sumă de indicatori simpli, apoi folosim liniaritatea speranței (E[Σ X_i] = Σ E[X_i]) pentru a calcula valoarea așteptată — exact ca în analiza Randomized QuickSort.')}
          hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
        />
      </Section>
    </>
  );
}
