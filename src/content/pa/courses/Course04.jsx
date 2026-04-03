import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Section, Toggle } from '../../../components/ui';

export default function Course04() {
  const { t, checked, toggleCheck } = useApp();

  return (
    <>
      {/* ── Roadmap ── */}
      <Box type="definition">
        <p className="font-bold mb-2">{t('Lecture 4 — Topics:', 'Cursul 4 — Subiecte:')}</p>
        <ol className="list-decimal pl-5 text-sm">
          <li>{t('Expected time analysis of deterministic algorithms', 'Analiza timpului așteptat al algoritmilor deterministici')}</li>
          <li>{t('The Hiring Problem — indicator random variables', 'Problema angajării — variabile aleatoare indicator')}</li>
          <li>{t('Streaks analysis — longest run of heads in coin flips', 'Analiza secvențelor — cea mai lungă serie de „cap" la aruncări de monedă')}</li>
          <li>{t('First Occurrence in a list — expected comparisons', 'Prima apariție într-o listă — comparații așteptate')}</li>
          <li>{t('Nuts and Bolts — matching problem & expected-case analysis', 'Piulițe și șuruburi — problema potrivirii și analiza cazului mediu')}</li>
        </ol>
      </Box>

      {/* ── 1. Probabilistic Analysis of Deterministic Algorithms ── */}
      <Section title={t('1. Probabilistic Analysis of Deterministic Algorithms', '1. Analiza probabilistică a algoritmilor deterministici')} id="pa-c4-prob-analysis" checked={!!checked['pa-c4-prob-analysis']} onCheck={() => toggleCheck('pa-c4-prob-analysis')}>

        <Box type="definition">
          <p className="font-bold">{t('Probabilistic Analysis', 'Analiză probabilistică')}</p>
          <p>{t(
            'Probabilistic analysis is the use of probability in the analysis of problems. We assume a distribution over inputs and compute an average-case (expected) running time, averaged over all possible inputs.',
            'Analiza probabilistică este utilizarea probabilităților în analiza problemelor. Presupunem o distribuție asupra input-urilor și calculăm un timp mediu (expected) de execuție, mediat peste toate input-urile posibile.'
          )}</p>
        </Box>

        <p className="font-bold mt-3">{t('Worst-case vs. Average-case', 'Worst-case vs. Average-case')}</p>

        <Box type="formula">
          <p className="text-sm font-mono">T<sub>worst-case</sub>(n) = max<sub>|X|=n</sub> T(X)</p>
          <p className="text-sm font-mono mt-1">T<sub>best-case</sub>(n) = min<sub>|X|=n</sub> T(X)</p>
          <p className="text-sm font-mono mt-1">T<sub>average-case</sub>(n) = E[T(X)] = &Sigma;<sub>|X|=n</sub> T(X) &middot; Pr&#123;X&#125;</p>
        </Box>

        <p className="mt-3 text-sm">{t(
          'Sometimes worst-case inputs are very rare, so the expected time is more meaningful. However, computing average-case requires assuming a probability distribution over inputs (e.g., all inputs equally likely).',
          'Uneori input-urile de worst-case sunt foarte rare, deci timpul așteptat este mai semnificativ. Totuși, calculul cazului mediu necesită presupunerea unei distribuții de probabilitate asupra input-urilor (de ex., toate input-urile la fel de probabile).'
        )}</p>

        <Box type="definition">
          <p className="font-bold">{t('Deterministic vs. Randomized', 'Determinist vs. Randomizat')}</p>
          <p>{t(
            'In a deterministic algorithm, each input uniquely determines the execution path. If inputs are random, the execution time becomes a random variable with expected value E[T(n)]. In a randomized algorithm, the algorithm itself makes random choices, so the same input can produce different execution paths.',
            'Într-un algorithm determinist, fiecare input determină unic calea de execuție. Dacă input-urile sunt aleatorii, timpul de execuție devine o variabilă aleatoare cu valoarea așteptată E[T(n)]. Într-un algorithm randomizat, algoritmul face el însuși alegeri aleatorii, deci același input poate produce căi de execuție diferite.'
          )}</p>
        </Box>

        <Box type="formula">
          <p className="font-bold">{t('Expected time (discrete case)', 'Timpul așteptat (cazul discret)')}</p>
          <p className="text-sm font-mono">{t(
            'If running time takes values {t₀, t₁, ...} with probabilities pᵢ = Pr{T(n) = tᵢ}:',
            'Dacă timpul de execuție ia valorile {t₀, t₁, ...} cu probabilitățile pᵢ = Pr{T(n) = tᵢ}:'
          )}</p>
          <p className="text-sm font-mono mt-1">exp-time(n) = &Sigma;<sub>i</sub> t<sub>i</sub> &middot; p<sub>i</sub></p>
        </Box>
      </Section>

      {/* ── 2. The Hiring Problem ── */}
      <Section title={t('2. The Hiring Problem', '2. Problema angajării')} id="pa-c4-hiring" checked={!!checked['pa-c4-hiring']} onCheck={() => toggleCheck('pa-c4-hiring')}>

        <p>{t(
          'You interview n candidates one per day. You always hire the current candidate if they are better than the current employee (firing the previous one). Interviewing costs cᵢ (cheap), hiring costs cₕ (expensive). Total cost: O(cᵢ·n + cₕ·m), where m = number of hires. We want to estimate m.',
          'Intervievezi n candidați, câte unul pe zi. Angajezi întotdeauna candidatul curent dacă este mai bun decât angajatul curent (concediindu-l pe cel anterior). Interviul costă cᵢ (ieftin), angajarea costă cₕ (scump). Cost total: O(cᵢ·n + cₕ·m), unde m = numărul de angajări. Vrem să estimăm m.'
        )}</p>

        <Code>{`HireAssistant(n):
  best ← 0
  for i ← 1 to n:
    Interview candidate i
    if candidate i is better than best:
      best ← i
      Hire candidate i`}</Code>

        <Box type="warning">
          <p className="font-bold">{t('Worst case', 'Cazul cel mai defavorabil')}</p>
          <p>{t(
            'If candidates arrive in strictly increasing order of ability, you hire all n candidates. Cost = O(cₕ·n).',
            'Dacă candidații sosesc în ordine strict crescătoare a abilităților, angajezi toți n candidații. Cost = O(cₕ·n).'
          )}</p>
        </Box>

        <p className="font-bold mt-3">{t('Average-case analysis using indicator random variables', 'Analiza cazului mediu folosind variabile aleatoare indicator')}</p>

        <Box type="definition">
          <p className="font-bold">{t('Indicator Random Variable', 'Variabilă aleatoare indicator')}</p>
          <p>{t(
            'For an event A, the indicator random variable is: I{A} = 1 if A occurs, 0 otherwise.',
            'Pentru un eveniment A, variabila aleatoare indicator este: I{A} = 1 dacă A are loc, 0 altfel.'
          )}</p>
        </Box>

        <Box type="theorem">
          <p className="font-bold">{t('Lemma: E[I{A}] = Pr{A}', 'Lemă: E[I{A}] = Pr{A}')}</p>
          <p className="text-sm">{t(
            'Proof: E[I{A}] = 1·Pr{A} + 0·Pr{not A} = Pr{A}.',
            'Demonstrație: E[I{A}] = 1·Pr{A} + 0·Pr{nu A} = Pr{A}.'
          )}</p>
        </Box>

        <p className="mt-3 text-sm">{t(
          'Assume candidates arrive in uniformly random order (each of the n! permutations is equally likely).',
          'Presupunem că candidații sosesc în ordine uniform aleatoare (fiecare din cele n! permutări este la fel de probabilă).'
        )}</p>

        <p className="mt-2 text-sm">{t(
          'Let Xᵢ = I{candidate i is hired}. Candidate i is hired iff they are the best among the first i candidates. Since the order is random, each of the first i candidates is equally likely to be the best, so:',
          'Fie Xᵢ = I{candidatul i este angajat}. Candidatul i este angajat dacă și numai dacă este cel mai bun din primii i candidați. Deoarece ordinea este aleatoare, fiecare din primii i candidați este la fel de probabil să fie cel mai bun, deci:'
        )}</p>

        <Box type="formula">
          <p className="text-sm font-mono">E[Xᵢ] = Pr&#123;candidate i is hired&#125; = 1/i</p>
        </Box>

        <p className="mt-2 text-sm">{t('The total number of hires is X = X₁ + X₂ + ... + Xₙ. By linearity of expectation:', 'Numărul total de angajări este X = X₁ + X₂ + ... + Xₙ. Prin liniaritatea așteptării:')}</p>

        <Box type="formula">
          <p className="font-bold">{t('Expected number of hires', 'Numărul așteptat de angajări')}</p>
          <p className="text-sm font-mono">E[X] = &Sigma;<sub>i=1..n</sub> E[Xᵢ] = &Sigma;<sub>i=1..n</sub> 1/i = H<sub>n</sub> &asymp; ln(n)</p>
        </Box>

        <Box type="theorem">
          <p>{t(
            'On average, we hire approximately ln(n) candidates, so the expected total hiring cost is O(cₕ·ln(n)), much better than the worst-case O(cₕ·n).',
            'În medie, angajăm aproximativ ln(n) candidați, deci costul total așteptat de angajare este O(cₕ·ln(n)), mult mai bun decât worst-case O(cₕ·n).'
          )}</p>
        </Box>
      </Section>

      {/* ── 3. Streaks Analysis ── */}
      <Section title={t('3. Streaks — Longest Run of Heads', '3. Secvențe — Cea mai lungă serie de „cap"')} id="pa-c4-streaks" checked={!!checked['pa-c4-streaks']} onCheck={() => toggleCheck('pa-c4-streaks')}>

        <p>{t(
          'Flip a fair coin n times. What is the expected length of the longest streak of consecutive heads?',
          'Aruncăm o monedă corectă de n ori. Care este lungimea așteptată a celei mai lungi serii consecutive de „cap"?'
        )}</p>

        <Box type="definition">
          <p className="font-bold">{t('Setup', 'Configurare')}</p>
          <p className="text-sm">{t(
            'Let Aᵢₖ = event that a streak of heads of length ≥ k begins at flip i. Since flips are independent: Pr{Aᵢₖ} = (1/2)ᵏ.',
            'Fie Aᵢₖ = evenimentul că o serie de „cap" de lungime ≥ k începe la aruncarea i. Deoarece aruncările sunt independente: Pr{Aᵢₖ} = (1/2)ᵏ.'
          )}</p>
        </Box>

        <p className="mt-2 text-sm">{t(
          'Let Xᵢₖ = I{Aᵢₖ}. The total number of streaks of length ≥ k is X = Σᵢ₌₁ⁿ⁻ᵏ⁺¹ Xᵢₖ.',
          'Fie Xᵢₖ = I{Aᵢₖ}. Numărul total de serii de lungime ≥ k este X = Σᵢ₌₁ⁿ⁻ᵏ⁺¹ Xᵢₖ.'
        )}</p>

        <Box type="formula">
          <p className="font-bold">{t('Expected number of streaks of length k', 'Numărul așteptat de serii de lungime k')}</p>
          <p className="text-sm font-mono">E[X] = (n - k + 1) / 2<sup>k</sup></p>
        </Box>

        <p className="mt-3 text-sm">{t('Substituting k = c·log₂(n):', 'Substituind k = c·log₂(n):')}</p>

        <Box type="formula">
          <p className="text-sm font-mono">E[X] = (n - c·log n + 1) / n<sup>c</sup> = O(1/n<sup>c-1</sup>)</p>
        </Box>

        <div className="mt-2 text-sm space-y-1">
          <p>{t(
            'If c is large → E[X] is very small → streaks of length c·log(n) are unlikely.',
            'Dacă c este mare → E[X] este foarte mic → serii de lungime c·log(n) sunt improbabile.'
          )}</p>
          <p>{t(
            'If c = 1/2 → E[X] = O(√n) → many streaks of length (log n)/2 are expected.',
            'Dacă c = 1/2 → E[X] = O(√n) → multe serii de lungime (log n)/2 sunt așteptate.'
          )}</p>
        </div>

        <Box type="theorem">
          <p className="font-bold">{t('Conclusion', 'Concluzie')}</p>
          <p>{t(
            'The expected length of the longest streak of consecutive heads in n fair coin flips is O(log n).',
            'Lungimea așteptată a celei mai lungi serii consecutive de „cap" în n aruncări corecte de monedă este O(log n).'
          )}</p>
        </Box>
      </Section>

      {/* ── 4. First Occurrence ── */}
      <Section title={t('4. First Occurrence in a List', '4. Prima apariție într-o listă')} id="pa-c4-first-occ" checked={!!checked['pa-c4-first-occ']} onCheck={() => toggleCheck('pa-c4-first-occ')}>

        <p>{t(
          'Given an array a and a target value k, find the index of the first occurrence of k in a, or -1 if not found.',
          'Dat un array a și o valoare țintă k, găsiți indexul primei apariții a lui k în a, sau -1 dacă nu este găsit.'
        )}</p>

        <Code>{`FOAlg(a, k):
  i ← 0
  while (a[i] ≠ k) and (i < a.size() - 1):
    i ← i + 1
  if a[i] = k:
    return i
  else:
    return -1`}</Code>

        <p className="font-bold mt-3">{t('Expected time analysis', 'Analiza timpului așteptat')}</p>

        <p className="text-sm mt-2">{t(
          'Assume the probability that k is in the array is q. If present, the first occurrence is equally likely at any position, so Pr{first occurrence at position i} = q/n.',
          'Presupunem că probabilitatea ca k să fie în array este q. Dacă este prezent, prima apariție este la fel de probabilă la orice poziție, deci Pr{prima apariție la poziția i} = q/n.'
        )}</p>

        <Box type="formula">
          <p className="font-bold">{t('Probability distribution', 'Distribuția de probabilitate')}</p>
          <p className="text-sm font-mono">Pr&#123;k &notin; a&#125; = 1 - q</p>
          <p className="text-sm font-mono">Pr&#123;T(n) = i&#125; = q/n, &nbsp; 2 &le; i &le; n</p>
          <p className="text-sm font-mono">Pr&#123;T(n) = n+1&#125; = q/n + (1-q)</p>
        </Box>

        <Box type="formula">
          <p className="font-bold">{t('Expected time', 'Timpul așteptat')}</p>
          <p className="text-sm font-mono">exp-time(n) = n/2 + 1/2 - q/2 + (1-q)·(n+1)</p>
          <p className="text-sm font-mono mt-1">{t('For q = 1 (k is always present): exp-time(n) = (n+1)/2', 'Pentru q = 1 (k este mereu prezent): exp-time(n) = (n+1)/2')}</p>
          <p className="text-sm font-mono mt-1">{t('For q = 1/2: exp-time(n) = (3n+3)/4 + 5/4', 'Pentru q = 1/2: exp-time(n) = (3n+3)/4 + 5/4')}</p>
        </Box>

        <Box type="warning">
          <p>{t(
            'When q = 1, the expected time is about n/2 — half the worst-case. When q < 1, many runs end with a full scan (n comparisons) without finding k, so the expected time is higher.',
            'Când q = 1, timpul așteptat este circa n/2 — jumătate din worst-case. Când q < 1, multe execuții se termină cu o scanare completă (n comparații) fără a găsi k, deci timpul așteptat este mai mare.'
          )}</p>
        </Box>
      </Section>

      {/* ── 5. Nuts and Bolts ── */}
      <Section title={t('5. The Nuts and Bolts Problem', '5. Problema piulițelor și șuruburilor')} id="pa-c4-nuts-bolts" checked={!!checked['pa-c4-nuts-bolts']} onCheck={() => toggleCheck('pa-c4-nuts-bolts')}>

        <Box type="definition">
          <p className="font-bold">{t('Problem Statement (Rawlins, 1992)', 'Enunțul problemei (Rawlins, 1992)')}</p>
          <p>{t(
            'Given n nuts and n bolts of different sizes, each nut matches exactly one bolt. We cannot compare two nuts or two bolts directly — only a nut to a bolt (too big, too small, or just right). Match each nut to its bolt.',
            'Date n piulițe și n șuruburi de dimensiuni diferite, fiecare piuliță se potrivește exact cu un șurub. Nu putem compara direct două piulițe sau două șuruburi — doar o piuliță cu un șurub (prea mare, prea mic sau exact). Potriviți fiecare piuliță cu șurubul ei.'
          )}</p>
        </Box>

        <p className="font-bold mt-3">{t('5.1 Finding the nut for one bolt', '5.1 Găsirea piuliței pentru un șurub')}</p>

        <p className="text-sm mt-2">{t(
          'Test every nut randomly against a given bolt. Worst-case: n-1 comparisons. Let C(n) = number of comparisons.',
          'Testăm fiecare piuliță aleatoriu cu un șurub dat. Worst-case: n-1 comparații. Fie C(n) = numărul de comparații.'
        )}</p>

        <Box type="formula">
          <p className="font-bold">{t('Expected comparisons for one bolt', 'Comparații așteptate pentru un șurub')}</p>
          <p className="text-sm font-mono">Pr&#123;C(n) = k&#125; = 1/n &nbsp;(k &lt; n-1), &nbsp; 2/n &nbsp;(k = n-1)</p>
          <p className="text-sm font-mono mt-1">E[C(n)] = (n+1)/2 - 1/n</p>
        </Box>

        <p className="text-sm mt-2">{t('Alternative recursive formulation:', 'Formulare recursivă alternativă:')}</p>

        <Box type="formula">
          <p className="text-sm font-mono">C(1) = 0</p>
          <p className="text-sm font-mono">E[C(n)] = 1 + ((n-1)/n) &middot; E[C(n-1)]</p>
          <p className="text-sm font-mono mt-1">{t('Let c(n) = n·E[C(n)], then c(n) = n + c(n-1), which gives c(n) = n(n+1)/2 - 1.', 'Fie c(n) = n·E[C(n)], atunci c(n) = n + c(n-1), ceea ce dă c(n) = n(n+1)/2 - 1.')}</p>
          <p className="text-sm font-mono mt-1">E[C(n)] = (n+1)/2 - 1/n</p>
        </Box>

        <p className="font-bold mt-4">{t('5.2 Matching all nuts and bolts', '5.2 Potrivirea tuturor piulițelor și șuruburilor')}</p>

        <p className="text-sm mt-2">{t(
          'Choose a pivot bolt, test it against all nuts to find its match and partition the remaining nuts into two piles (smaller/larger). Then use the matching nut to partition the bolts. Recurse on both subproblems. This is analogous to QuickSort.',
          'Alegem un șurub pivot, îl testăm cu toate piulițele pentru a-i găsi perechea și a partiționa piulițele rămase în două grupe (mai mici/mai mari). Apoi folosim piulița potrivită pentru a partiționa șuruburile. Recursie pe ambele subprobleme. Aceasta este analogă cu QuickSort.'
        )}</p>

        <Code>{`MatchNutsAndBolts(N, B, low, high):
  if low < high:
    p ← ChoosePivotBolt(B, low, high)        // random pivot
    pivotNutIdx ← Partition(N, low, high, B[p])  // partition nuts
    pivotBoltIdx ← Partition(B, low, high, N[pivotNutIdx]) // partition bolts
    MatchNutsAndBolts(N, B, low, pivotNutIdx - 1)
    MatchNutsAndBolts(N, B, pivotNutIdx + 1, high)

Partition(A, low, high, pivot):
  i ← low
  for j ← low to high - 1:
    if Compare(A[j], pivot) = -1:
      Swap(A[i], A[j])
      i ← i + 1
    else if Compare(A[j], pivot) = 0:
      Swap(A[j], A[high])
      j ← j - 1
  Swap(A[i], A[high])
  return i`}</Code>

        <p className="font-bold mt-3">{t('Worst-case analysis', 'Analiza worst-case')}</p>

        <Box type="formula">
          <p className="text-sm font-mono">C(0) = 0</p>
          <p className="text-sm font-mono">C(n) = 2n - 1 + max&#123;C(k-1) + C(n-k)&#125; = 2n - 1 + C(n-1)</p>
          <p className="text-sm font-mono mt-1">{t('Solves to C(n) = n², same as testing every pair.', 'Se rezolvă la C(n) = n², la fel ca testarea fiecărei perechi.')}</p>
        </Box>

        <p className="font-bold mt-3">{t('Expected-case analysis (indicator variables)', 'Analiza cazului mediu (variabile indicator)')}</p>

        <p className="text-sm mt-2">{t(
          'Let Bᵢ be the i-th smallest bolt and Nⱼ the j-th smallest nut. Define Xᵢⱼ = I{Bᵢ and Nⱼ are compared}. The total comparisons are C(n) = ΣΣ Xᵢⱼ.',
          'Fie Bᵢ al i-lea cel mai mic șurub și Nⱼ a j-a cea mai mică piuliță. Definim Xᵢⱼ = I{Bᵢ și Nⱼ sunt comparate}. Comparațiile totale sunt C(n) = ΣΣ Xᵢⱼ.'
        )}</p>

        <Box type="theorem">
          <p className="font-bold">{t('Key insight: when are Bᵢ and Nⱼ compared?', 'Observație cheie: când sunt Bᵢ și Nⱼ comparate?')}</p>
          <p className="text-sm">{t(
            'Bᵢ and Nⱼ are compared if and only if the first pivot chosen from {Bᵢ, Bᵢ₊₁, ..., Bⱼ} is Bᵢ or Bⱼ (for i < j). Since there are j-i+1 bolts in this range, each equally likely to be chosen first: E[Xᵢⱼ] = 2/(j-i+1).',
            'Bᵢ și Nⱼ sunt comparate dacă și numai dacă primul pivot ales din {Bᵢ, Bᵢ₊₁, ..., Bⱼ} este Bᵢ sau Bⱼ (pentru i < j). Deoarece sunt j-i+1 șuruburi în acest interval, fiecare la fel de probabil să fie ales primul: E[Xᵢⱼ] = 2/(j-i+1).'
          )}</p>
        </Box>

        <Box type="formula">
          <p className="font-bold">{t('Expected total comparisons', 'Comparații totale așteptate')}</p>
          <p className="text-sm font-mono">E[C(n)] = n + 4 &middot; &Sigma;<sub>i=1..n</sub> &Sigma;<sub>j=i+1..n</sub> 1/(j-i+1)</p>
          <p className="text-sm font-mono mt-1">= 4n&middot;H<sub>n</sub> + 4H<sub>n</sub> - 7n</p>
          <p className="text-sm font-mono mt-1">= O(n&middot;ln(n))</p>
        </Box>

        <Toggle
          question={t('Show recursive analysis derivation', 'Arată derivarea analizei recursive')}
          answer={
            <div className="text-sm space-y-2">
              <p>{t(
                'Let Yₖ = E[C(k-1)] + E[C(n-k)] if the pivot is the k-th element (probability 1/n), 0 otherwise.',
                'Fie Yₖ = E[C(k-1)] + E[C(n-k)] dacă pivotul este al k-lea element (probabilitate 1/n), 0 altfel.'
              )}</p>
              <p className="font-mono">E[C(n)] = 2n - 1 + (2/n) &middot; &Sigma;<sub>k=0..n-1</sub> E[C(k)]</p>
              <p>{t('Multiply by n and subtract (n-1)·E[C(n-1)]:', 'Înmulțim cu n și scădem (n-1)·E[C(n-1)]:')}</p>
              <p className="font-mono">n·E[C(n)] - (n-1)·E[C(n-1)] = 4n - 3 + 2·E[C(n-1)]</p>
              <p>{t('Let t(n) = E[C(n)]/(n+1). After simplification:', 'Fie t(n) = E[C(n)]/(n+1). După simplificare:')}</p>
              <p className="font-mono">t(n) = t(n-1) + 7/(n+1) - 3/n</p>
              <p>{t('Summing the telescoping series:', 'Sumând seria telescopică:')}</p>
              <p className="font-mono">t(n) = 7(H<sub>n+1</sub> - 1) - 3H<sub>n</sub> = 4H<sub>n</sub> - 7 + 7/(n+1)</p>
              <p className="font-mono">E[C(n)] = (n+1)·t(n) = 4nH<sub>n</sub> + 4H<sub>n</sub> - 7n</p>
            </div>
          }
          showLabel={t('Show Derivation', 'Arată derivarea')}
          hideLabel={t('Hide', 'Ascunde')}
        />

        <p className="font-bold mt-4">{t('5.3 Reduction to and from Sorting', '5.3 Reducerea la și din sortare')}</p>

        <Box type="theorem">
          <p className="font-bold">{t('Reductions', 'Reduceri')}</p>
          <p className="text-sm">{t(
            'Sorting → Nuts and Bolts: Duplicate the array (one copy = nuts, other = bolts), run the matching algorithm, which also sorts both arrays.',
            'Sortare → Piulițe și Șuruburi: Duplicăm array-ul (o copie = piulițe, cealaltă = șuruburi), rulăm algoritmul de potrivire, care sortează și ambele array-uri.'
          )}</p>
          <p className="text-sm mt-1">{t(
            'Nuts and Bolts → Sorting: If we could sort the bolts (O(n log n)), we could binary-search each nut in O(n log n). But we cannot compare bolts to bolts directly!',
            'Piulițe și Șuruburi → Sortare: Dacă am putea sorta șuruburile (O(n log n)), am putea căuta binar fiecare piuliță în O(n log n). Dar nu putem compara direct șuruburi cu șuruburi!'
          )}</p>
        </Box>

        <Box type="warning">
          <p>{t(
            'The reductions show that an O(n log n) algorithm for either problem automatically gives O(n log n) for the other. A deterministic O(n log n) algorithm for Nuts and Bolts was found by Bradford (1995).',
            'Reducerile arată că un algoritm O(n log n) pentru oricare problemă oferă automat O(n log n) pentru cealaltă. Un algoritm determinist O(n log n) pentru Piulițe și Șuruburi a fost găsit de Bradford (1995).'
          )}</p>
        </Box>
      </Section>

      {/* ── Self-Test ── */}
      <Section title={t('Self-Test (6 Questions)', 'Autoevaluare (6 întrebări)')} id="pa-c4-quiz" checked={!!checked['pa-c4-quiz']} onCheck={() => toggleCheck('pa-c4-quiz')}>
        <Toggle
          question={t('1. What is an indicator random variable and why is it useful?', '1. Ce este o variabilă aleatoare indicator și de ce este utilă?')}
          answer={t(
            'An indicator random variable I{A} equals 1 if event A occurs, 0 otherwise. Its expected value equals the probability of A: E[I{A}] = Pr{A}. It is useful because it simplifies expected value calculations — instead of computing E[X] directly, we decompose X into a sum of indicator variables and use linearity of expectation: E[X] = Σ E[Xᵢ] = Σ Pr{Aᵢ}.',
            'O variabilă aleatoare indicator I{A} este egală cu 1 dacă evenimentul A are loc, 0 altfel. Valoarea ei așteptată este egală cu probabilitatea lui A: E[I{A}] = Pr{A}. Este utilă deoarece simplifică calculele de valoare așteptată — în loc să calculăm E[X] direct, descompunem X într-o sumă de variabile indicator și folosim liniaritatea așteptării: E[X] = Σ E[Xᵢ] = Σ Pr{Aᵢ}.'
          )}
          hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
        />
        <Toggle
          question={t('2. In the Hiring Problem, why is the expected number of hires O(ln n)?', '2. În problema angajării, de ce este numărul așteptat de angajări O(ln n)?')}
          answer={t(
            'Candidate i is hired iff they are the best among the first i candidates, which happens with probability 1/i (assuming random order). The expected total hires is Σᵢ₌₁ⁿ 1/i = Hₙ ≈ ln(n). This is the harmonic series, which grows logarithmically.',
            'Candidatul i este angajat dacă și numai dacă este cel mai bun din primii i candidați, ceea ce se întâmplă cu probabilitate 1/i (presupunând ordine aleatoare). Angajările totale așteptate sunt Σᵢ₌₁ⁿ 1/i = Hₙ ≈ ln(n). Aceasta este seria armonică, care crește logaritmic.'
          )}
          hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
        />
        <Toggle
          question={t('3. What is the expected length of the longest streak of heads in n fair coin flips?', '3. Care este lungimea așteptată a celei mai lungi serii de „cap" în n aruncări corecte de monedă?')}
          answer={t(
            'O(log n). The expected number of streaks of length k is (n-k+1)/2ᵏ. For k = c·log₂(n) with large c, this is very small (unlikely). For k = (log n)/2, it is O(√n) (many such streaks exist). The crossover point gives an expected longest streak of O(log n).',
            'O(log n). Numărul așteptat de serii de lungime k este (n-k+1)/2ᵏ. Pentru k = c·log₂(n) cu c mare, acesta este foarte mic (improbabil). Pentru k = (log n)/2, este O(√n) (multe astfel de serii există). Punctul de tranziție dă o serie maximă așteptată de O(log n).'
          )}
          hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
        />
        <Toggle
          question={t('4. In the First Occurrence problem, what is the expected time when k is always in the array (q=1)?', '4. În problema primei apariții, care este timpul așteptat când k este mereu în array (q=1)?')}
          answer={t(
            'When q = 1, the expected time is (n+1)/2. Each position is equally likely for the first occurrence, so on average we scan about half the array. This is roughly half the worst-case of n comparisons.',
            'Când q = 1, timpul așteptat este (n+1)/2. Fiecare poziție este la fel de probabilă pentru prima apariție, deci în medie scanăm aproximativ jumătate din array. Aceasta este aproximativ jumătate din worst-case de n comparații.'
          )}
          hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
        />
        <Toggle
          question={t('5. Why can\'t we directly use a sorting algorithm to solve the Nuts and Bolts problem in O(n log n) worst case?', '5. De ce nu putem folosi direct un algoritm de sortare pentru a rezolva problema piulițelor și șuruburilor în O(n log n) worst-case?')}
          answer={t(
            'Standard sorting algorithms require comparing elements of the same type (bolt vs. bolt, or nut vs. nut). In the Nuts and Bolts problem, we can only compare a nut to a bolt — we cannot determine the relative order of two nuts or two bolts directly. Therefore, standard comparison-based sorting cannot be applied directly.',
            'Algoritmii standard de sortare necesită compararea elementelor de același tip (șurub vs. șurub, sau piuliță vs. piuliță). În problema piulițelor și șuruburilor, putem compara doar o piuliță cu un șurub — nu putem determina ordinea relativă a două piulițe sau două șuruburi direct. Prin urmare, sortarea bazată pe comparații standard nu poate fi aplicată direct.'
          )}
          hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
        />
        <Toggle
          question={t('6. What is the expected number of comparisons for the randomized Nuts and Bolts matching algorithm?', '6. Care este numărul așteptat de comparații pentru algoritmul randomizat de potrivire piulițe-șuruburi?')}
          answer={t(
            'E[C(n)] = 4n·Hₙ + 4Hₙ - 7n = O(n·ln(n)). This is derived using indicator variables: Bᵢ and Nⱼ are compared iff the first pivot from {Bᵢ,...,Bⱼ} is an endpoint, giving E[Xᵢⱼ] = 2/(j-i+1). Summing over all pairs yields the harmonic-series-based result, analogous to the expected-case analysis of QuickSort.',
            'E[C(n)] = 4n·Hₙ + 4Hₙ - 7n = O(n·ln(n)). Aceasta este derivată folosind variabile indicator: Bᵢ și Nⱼ sunt comparate dacă și numai dacă primul pivot din {Bᵢ,...,Bⱼ} este un capăt, dând E[Xᵢⱼ] = 2/(j-i+1). Sumând peste toate perechile obținem rezultatul bazat pe seria armonică, analog analizei cazului mediu al QuickSort.'
          )}
          hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
        />
      </Section>
    </>
  );
}
