import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Section, Toggle } from '../../../components/ui';

export default function Course02() {
  const { t, checked, toggleCheck } = useApp();

  return (
    <>
      <Box type="definition">
        <p className="font-bold mb-2">{t('Lecture 2 — Topics:', 'Cursul 2 — Subiecte:')}</p>
        <ol className="list-decimal pl-5 text-sm">
          <li>{t('Algorithm correctness via loop invariants (Init, Maintenance, Termination)', 'Corectitudinea algoritmilor prin invarianți de buclă (Init, Mentenanță, Terminare)')}</li>
          <li>{t('InsertionSort: correctness proof and running time analysis', 'InsertionSort: demonstrarea corectitudinii și analiza timpului de execuție')}</li>
          <li>{t('MergeSort: divide-and-conquer, recurrences, O(n log n)', 'MergeSort: divide-and-conquer, recurențe, O(n log n)')}</li>
          <li>{t('Asymptotic notation: O, Ω, Θ', 'Notații asimptotice: O, Ω, Θ')}</li>
          <li>{t('Turing (Cook) problem reductions', 'Reduceri Turing (Cook) de probleme')}</li>
        </ol>
      </Box>

      {/* ── 1. Correctness & Loop Invariants ── */}
      <Section title={t('1. Algorithm Correctness — Loop Invariants', '1. Corectitudinea algoritmilor — Invarianți de buclă')} id="pa-c2-correct" checked={!!checked['pa-c2-correct']} onCheck={() => toggleCheck('pa-c2-correct')}>
        <Box type="definition">
          <p className="font-bold">{t('Loop Invariant', 'Invariant de buclă')}</p>
          <p>{t('A property that holds before and after each iteration of a loop. To prove correctness, show three things:', 'O proprietate care se menține înainte și după fiecare iterație a buclei. Pentru a demonstra corectitudinea, arătați trei lucruri:')}</p>
          <ol className="list-decimal pl-5 text-sm mt-1">
            <li><strong>Initialization</strong>{t(': The invariant is true before the first iteration.', ': Invariantul este adevărat înainte de prima iterație.')}</li>
            <li><strong>Maintenance</strong>{t(': If true before an iteration, it remains true after.', ': Dacă este adevărat înainte de o iterație, rămâne adevărat după.')}</li>
            <li><strong>Termination</strong>{t(': When the loop ends, the invariant gives us the desired property.', ': Când bucla se termină, invariantul ne dă proprietatea dorită.')}</li>
          </ol>
        </Box>

        <Box type="theorem">
          <p>{t('Mnemonic: "It Must Terminate" (I-M-T) or "It Must be True"', 'Mnemonic: „It Must Terminate" (I-M-T) sau „It Must be True"')}</p>
          <p className="text-sm mt-1">{t('Similar to mathematical induction: Initialization = base case, Maintenance = inductive step, Termination = we stop when the loop ends.', 'Similar cu inducția matematică: Initialization = cazul de bază, Maintenance = pasul inductiv, Termination = ne oprim când bucla se termină.')}</p>
        </Box>
      </Section>

      {/* ── 2. InsertionSort ── */}
      <Section title={t('2. InsertionSort', '2. InsertionSort')} id="pa-c2-insertion" checked={!!checked['pa-c2-insertion']} onCheck={() => toggleCheck('pa-c2-insertion')}>
        <Code>{`InsertionSort(a):
  n = a.size()
  for i = 1 to n-1:
    current = a[i]
    j = i - 1
    while j >= 0 and a[j] > current:
      a[j+1] = a[j]    // shift right
      j = j - 1
    a[j+1] = current    // insert`}</Code>

        <Box type="theorem">
          <p className="font-bold">{t('Loop invariant for InsertionSort:', 'Invariantul de buclă pentru InsertionSort:')}</p>
          <p className="text-sm">{t('At the start of each iteration i, the subarray a[0..i-1] contains the original first i elements in sorted order.', 'La începutul fiecărei iterații i, subarray-ul a[0..i-1] conține primele i elemente originale în ordine sortată.')}</p>
        </Box>

        <Toggle
          question={t('Correctness proof details', 'Detalii demonstrație corectitudine')}
          answer={
            <div className="text-sm">
              <p><strong>Initialization:</strong> {t('i=1, subarray a[0..0] has one element → trivially sorted.', 'i=1, subarray-ul a[0..0] are un element → trivial sortat.')}</p>
              <p className="mt-1"><strong>Maintenance:</strong> {t('At iteration i, we shift elements > a[i] right by one position and insert a[i] at position j+1 where a[j] ≤ a[i]. Result: a[0..i] is sorted.', 'La iterația i, deplasăm elementele > a[i] la dreapta cu o poziție și inserăm a[i] la poziția j+1 unde a[j] ≤ a[i]. Rezultat: a[0..i] este sortat.')}</p>
              <p className="mt-1"><strong>Termination:</strong> {t('Loop ends when i=n. Substituting: a[0..n-1] is sorted = entire array sorted. ∎', 'Bucla se termină când i=n. Substituind: a[0..n-1] este sortat = întregul array sortat. ∎')}</p>
            </div>
          }
          showLabel={t('Show Proof', 'Arată demonstrația')} hideLabel={t('Hide', 'Ascunde')}
        />

        <Box type="formula">
          <p className="font-bold">{t('Running time:', 'Timp de execuție:')}</p>
          <ul className="list-disc pl-5 text-sm">
            <li><strong>{t('Best case', 'Cel mai bun caz')}</strong>{t(' (already sorted): T(n) = an + b = Θ(n)', ' (deja sortat): T(n) = an + b = Θ(n)')}</li>
            <li><strong>{t('Worst case', 'Cel mai rău caz')}</strong>{t(' (reverse sorted): T(n) = an² + bn + c = Θ(n²)', ' (sortat invers): T(n) = an² + bn + c = Θ(n²)')}</li>
            <li><strong>{t('Average case', 'Caz mediu')}</strong>{t(': Also Θ(n²) — on average, half of elements need shifting', ': Tot Θ(n²) — în medie, jumătate din elemente necesită deplasare')}</li>
          </ul>
        </Box>
      </Section>

      {/* ── 3. MergeSort ── */}
      <Section title={t('3. MergeSort (Divide and Conquer)', '3. MergeSort (Divide and Conquer)')} id="pa-c2-merge" checked={!!checked['pa-c2-merge']} onCheck={() => toggleCheck('pa-c2-merge')}>
        <Box type="definition">
          <p className="font-bold">{t('Divide-and-Conquer paradigm:', 'Paradigma Divide-and-Conquer:')}</p>
          <ol className="list-decimal pl-5 text-sm">
            <li><strong>Divide</strong>{t(': Split the problem into smaller subproblems', ': Împarte problema în subprobleme mai mici')}</li>
            <li><strong>Conquer</strong>{t(': Solve subproblems recursively (base case: trivial)', ': Rezolvă subproblemele recursiv (caz de bază: trivial)')}</li>
            <li><strong>Combine</strong>{t(': Merge solutions of subproblems into solution of original', ': Combină soluțiile subproblemelor în soluția problemei originale')}</li>
          </ol>
        </Box>

        <Code>{`MergeSort(A, p, r):
  if p < r:
    q = (p + r) / 2
    MergeSort(A, p, q)      // sort left half
    MergeSort(A, q+1, r)    // sort right half
    Merge(A, p, q, r)       // combine

Merge(A, p, q, r):
  // Copy A[p..q] to L[], A[q+1..r] to R[]
  // Add sentinel ∞ at end of each
  i = 0; j = 0
  for k = p to r:
    if L[i] <= R[j]:
      A[k] = L[i]; i++
    else:
      A[k] = R[j]; j++`}</Code>

        <Box type="formula">
          <p className="font-bold">{t('Recurrence:', 'Recurență:')}</p>
          <p className="font-mono text-sm">T(n) = 2T(n/2) + Θ(n)</p>
          <p className="text-sm mt-1">{t('The recursion tree has log₂n + 1 levels, each costing cn. Total: T(n) = cn·log₂n + cn = Θ(n log n).', 'Arborele de recursie are log₂n + 1 niveluri, fiecare costând cn. Total: T(n) = cn·log₂n + cn = Θ(n log n).')}</p>
        </Box>

        <Box type="theorem">
          <p className="font-bold">{t('General divide-and-conquer recurrence:', 'Recurența generală divide-and-conquer:')}</p>
          <p className="font-mono text-sm">T(n) = aT(n/b) + D(n) + C(n)</p>
          <p className="text-sm mt-1">{t('a = number of subproblems, b = size reduction factor, D(n) = divide cost, C(n) = combine cost', 'a = numărul de subprobleme, b = factorul de reducere, D(n) = costul împărțirii, C(n) = costul combinării')}</p>
        </Box>
      </Section>

      {/* ── 4. Asymptotic Notation ── */}
      <Section title={t('4. Asymptotic Notation', '4. Notații asimptotice')} id="pa-c2-asymptotic" checked={!!checked['pa-c2-asymptotic']} onCheck={() => toggleCheck('pa-c2-asymptotic')}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <Box type="formula">
            <p className="font-bold">O(g(n)) — Upper bound</p>
            <p>{t('f(n) = O(g(n)) if ∃ c > 0, n₀ such that 0 ≤ f(n) ≤ c·g(n), ∀n ≥ n₀', 'f(n) = O(g(n)) dacă ∃ c > 0, n₀ a.î. 0 ≤ f(n) ≤ c·g(n), ∀n ≥ n₀')}</p>
            <p className="mt-1 opacity-70">{t('"grows at most as fast as"', '„crește cel mult la fel de repede ca"')}</p>
          </Box>
          <Box type="formula">
            <p className="font-bold">Ω(g(n)) — Lower bound</p>
            <p>{t('f(n) = Ω(g(n)) if ∃ c > 0, n₀ such that 0 ≤ c·g(n) ≤ f(n), ∀n ≥ n₀', 'f(n) = Ω(g(n)) dacă ∃ c > 0, n₀ a.î. 0 ≤ c·g(n) ≤ f(n), ∀n ≥ n₀')}</p>
            <p className="mt-1 opacity-70">{t('"grows at least as fast as"', '„crește cel puțin la fel de repede ca"')}</p>
          </Box>
          <Box type="formula">
            <p className="font-bold">Θ(g(n)) — Tight bound</p>
            <p>{t('f(n) = Θ(g(n)) iff f(n) = O(g(n)) AND f(n) = Ω(g(n))', 'f(n) = Θ(g(n)) dacă și numai dacă f(n) = O(g(n)) ȘI f(n) = Ω(g(n))')}</p>
            <p className="mt-1 opacity-70">{t('"grows exactly as fast as" (tight)', '„crește exact la fel de repede ca" (strâns)')}</p>
          </Box>
        </div>

        <Box type="warning">
          <p className="font-bold">{t('Common mistake:', 'Greșeală frecventă:')}</p>
          <p>{t('O(n²) means "at most n²", not "exactly n²". If T(n) = 3n + 5, it is correct to say T(n) = O(n²), but more precise to say T(n) = Θ(n). Use Θ when you can prove both upper and lower bounds.', 'O(n²) înseamnă „cel mult n²", nu „exact n²". Dacă T(n) = 3n + 5, este corect să spunem T(n) = O(n²), dar mai precis T(n) = Θ(n). Folosiți Θ când puteți demonstra atât limita superioară cât și cea inferioară.')}</p>
        </Box>
      </Section>

      {/* ── 5. Karatsuba & Number Multiplication ── */}
      <Section title={t('5. Case Study: Number Multiplication', '5. Studiu de caz: Multiplicarea numerelor')} id="pa-c2-karatsuba" checked={!!checked['pa-c2-karatsuba']} onCheck={() => toggleCheck('pa-c2-karatsuba')}>
        <p>{t('School multiplication of two n-digit numbers: O(n²). Can we do better?', 'Multiplicarea din școală a două numere cu n cifre: O(n²). Putem face mai bine?')}</p>

        <Box type="theorem">
          <p className="font-bold">{t('Karatsuba\'s trick (1963)', 'Trucul lui Karatsuba (1963)')}</p>
          <p className="text-sm">{t('Write x = a·10^(n/2) + b, y = c·10^(n/2) + d. Then x·y = ac·10^n + (ad+bc)·10^(n/2) + bd. Instead of computing ad and bc separately (4 subproblems), compute (a+b)(c+d) - ac - bd = ad+bc (only 3 subproblems!).', 'Scriem x = a·10^(n/2) + b, y = c·10^(n/2) + d. Atunci x·y = ac·10^n + (ad+bc)·10^(n/2) + bd. În loc să calculăm ad și bc separat (4 subprobleme), calculăm (a+b)(c+d) - ac - bd = ad+bc (doar 3 subprobleme!).')}</p>
        </Box>

        <Box type="formula">
          <p className="font-bold">{t('Complexity progression:', 'Progresul complexității:')}</p>
          <ul className="list-disc pl-5 text-sm">
            <li>{t('School: O(n²)', 'Școală: O(n²)')}</li>
            <li>Karatsuba (1963): O(n^log₂3) ≈ O(n^1.585)</li>
            <li>Toom-Cook (1963): O(n^log₃5) ≈ O(n^1.465)</li>
            <li>Schönhage-Strassen (1971): O(n log n log log n)</li>
            <li>Harvey-van der Hoeven (2019): O(n log n)</li>
          </ul>
        </Box>
      </Section>

      {/* ── 6. Problem Reductions ── */}
      <Section title={t('6. Turing (Cook) Problem Reductions', '6. Reduceri Turing (Cook) de probleme')} id="pa-c2-reductions" checked={!!checked['pa-c2-reductions']} onCheck={() => toggleCheck('pa-c2-reductions')}>
        <Box type="definition">
          <p className="font-bold">{t('Polynomial reduction P ≤ Q:', 'Reducere polinomială P ≤ Q:')}</p>
          <p className="text-sm">{t('Problem P reduces to Q if we can solve P using an algorithm for Q: (1) preprocess input of P in polynomial time to get input for Q, (2) call Q\'s algorithm (polynomial number of times), (3) postprocess Q\'s output in polynomial time to get P\'s answer.', 'Problema P se reduce la Q dacă putem rezolva P folosind un algorithm pentru Q: (1) preprocesăm input-ul lui P în timp polinomial pentru a obține input-ul lui Q, (2) apelăm algorithmul lui Q (de un număr polinomial de ori), (3) postprocesăm output-ul lui Q în timp polinomial pentru a obține răspunsul lui P.')}</p>
        </Box>

        <Box type="theorem">
          <p>{t('P ≤ Q means "P is no harder than Q". If Q has an efficient solution, so does P. We use reductions to prove algorithmic upper bounds.', 'P ≤ Q înseamnă „P nu este mai grea decât Q". Dacă Q are o soluție eficientă, la fel și P. Folosim reducerile pentru a demonstra limite superioare algoritmice.')}</p>
        </Box>

        <p className="font-bold mt-2">{t('Example: SET-INCLUSION ≤ SORTING', 'Exemplu: SET-INCLUSION ≤ SORTING')}</p>
        <Code>{`SetInclusion(A, B):
  A' = Sort(A)     // reduce to sorting
  B' = Sort(B)
  i = 0; j = 0
  while i < |A| and j < |B|:
    if A'[i] == B'[j]: i++; j++
    else if A'[i] > B'[j]: j++
    else: return NO    // A'[i] < B'[j] → not in B
  return (i == |A|) ? YES : NO
// Total: O(n log n) via sorting reduction`}</Code>
      </Section>

      {/* ── Self-Test ── */}
      <Section title={t('Self-Test (6 Questions)', 'Autoevaluare (6 întrebări)')} id="pa-c2-quiz" checked={!!checked['pa-c2-quiz']} onCheck={() => toggleCheck('pa-c2-quiz')}>
        <Toggle question={t('1. What are the three properties of a loop invariant?', '1. Care sunt cele trei proprietăți ale unui invariant de buclă?')} answer={t('Initialization (true before first iteration), Maintenance (preserved across iterations), Termination (gives desired property when loop ends). Mnemonic: I-M-T = "It Must Terminate".', 'Initialization (adevărat înainte de prima iterație), Maintenance (menținut de-a lungul iterațiilor), Termination (dă proprietatea dorită la terminarea buclei). Mnemonic: I-M-T = „It Must Terminate".')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
        <Toggle question={t('2. What is the worst-case running time of InsertionSort and when does it occur?', '2. Care este timpul de execuție cel mai defavorabil al InsertionSort și când apare?')} answer={t('Θ(n²). Occurs when the array is sorted in reverse order — every element must be shifted past all previous elements.', 'Θ(n²). Apare când array-ul este sortat în ordine inversă — fiecare element trebuie deplasat peste toate elementele anterioare.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
        <Toggle question={t('3. Why is MergeSort O(n log n)?', '3. De ce MergeSort este O(n log n)?')} answer={t('Recurrence: T(n) = 2T(n/2) + Θ(n). The recursion tree has log₂n+1 levels, each costing cn (all elements processed once per level). Total: cn·(log₂n + 1) = Θ(n log n).', 'Recurența: T(n) = 2T(n/2) + Θ(n). Arborele de recursie are log₂n+1 niveluri, fiecare costând cn (toate elementele procesate o dată per nivel). Total: cn·(log₂n + 1) = Θ(n log n).')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
        <Toggle question={t('4. What is the difference between O(n) and Θ(n)?', '4. Care este diferența între O(n) și Θ(n)?')} answer={t('O(n) is an upper bound: f(n) grows at most as fast as n. Θ(n) is a tight bound: f(n) grows exactly as fast as n (both upper AND lower bound). Θ(n) implies O(n), but not vice versa — e.g., f(n)=5 is O(n) but not Θ(n).', 'O(n) este o limită superioară: f(n) crește cel mult la fel de repede ca n. Θ(n) este o limită strânsă: f(n) crește exact la fel de repede ca n (atât limită superioară CÂT ȘI inferioară). Θ(n) implică O(n), dar nu invers — ex., f(n)=5 este O(n) dar nu Θ(n).')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
        <Toggle question={t('5. How did Karatsuba reduce multiplication from 4 to 3 subproblems?', '5. Cum a redus Karatsuba multiplicarea de la 4 la 3 subprobleme?')} answer={t('Instead of computing ac, ad, bc, bd separately, compute ac, bd, and (a+b)(c+d). Then ad+bc = (a+b)(c+d) - ac - bd. This gives T(n) = 3T(n/2) + O(n) = O(n^1.585) instead of O(n²).', 'În loc să calculeze ac, ad, bc, bd separat, calculează ac, bd și (a+b)(c+d). Atunci ad+bc = (a+b)(c+d) - ac - bd. Aceasta dă T(n) = 3T(n/2) + O(n) = O(n^1.585) în loc de O(n²).')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
        <Toggle question={t('6. What does P ≤ Q mean in problem reduction?', '6. Ce înseamnă P ≤ Q în reducerea problemelor?')} answer={t('P is no harder than Q. We can solve P by using Q as a subroutine: preprocess P\'s input → call Q → postprocess Q\'s output. If Q is solvable in polynomial time, so is P.', 'P nu este mai grea decât Q. Putem rezolva P folosind Q ca subrutină: preprocesăm input-ul lui P → apelăm Q → postprocesăm output-ul lui Q. Dacă Q este rezolvabilă în timp polinomial, la fel și P.')} hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')} />
      </Section>
    </>
  );
}
