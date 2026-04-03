import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Section, Toggle } from '../../../components/ui';

export default function Course01() {
  const { t, checked, toggleCheck } = useApp();

  return (
    <>
      {/* ── Roadmap ── */}
      <Box type="definition">
        <p className="font-bold mb-2">{t('Lecture 1 — Topics:', 'Cursul 1 — Subiecte:')}</p>
        <ol className="list-decimal pl-5 text-sm">
          <li>{t('Defining computational problems (Input/Output pairs, formal specification)', 'Definirea problemelor computaționale (perechi Input/Output, specificare formală)')}</li>
          <li>{t('Classification by output type (decision, optimization, search, counting)', 'Clasificarea după tipul output-ului (decizie, optimizare, căutare, numărare)')}</li>
          <li>{t('Classification by input type (sorting, graphs, geometric, strings)', 'Clasificarea după tipul input-ului (sortare, grafuri, geometrice, șiruri)')}</li>
          <li>{t('Solvability & complexity classes (P, NP, NP-complete)', 'Rezolvabilitate și clase de complexitate (P, NP, NP-complete)')}</li>
          <li>{t('From problem to algorithm to implementation', 'De la problemă la algorithm la implementare')}</li>
        </ol>
      </Box>

      {/* ── 1. Defining Computational Problems ── */}
      <Section title={t('1. Defining Computational Problems', '1. Definirea problemelor computaționale')} id="pa-c1-def" checked={!!checked['pa-c1-def']} onCheck={() => toggleCheck('pa-c1-def')}>
        <Box type="definition">
          <p className="font-bold">{t('Computational Problem', 'Problemă computațională')}</p>
          <p>{t('A computational problem is a function f : I → O that maps each valid input to a valid output, where I is the input set and O is the output set.', 'O problemă computațională este o funcție f : I → O care mapează fiecare input valid la un output valid, unde I este mulțimea de input și O este mulțimea de output.')}</p>
        </Box>

        <p className="mt-3">{t('A problem P is represented as a pair (Input, Output). We denote by p an instance of P and by P(p) the output for instance p.', 'O problemă P este reprezentată ca o pereche (Input, Output). Notăm cu p o instanță a lui P și cu P(p) output-ul pentru instanța p.')}</p>

        <Box type="warning">
          <p className="font-bold">{t('Key insight:', 'Observație cheie:')}</p>
          <p>{t('"I would spend 55 minutes defining the problem and then five minutes solving it." — Understanding the problem is crucial to correctly solving it. Formal specification prevents ambiguity.', '„Aș petrece 55 de minute definind problema și apoi cinci minute rezolvând-o." — Înțelegerea problemei este crucială pentru a o rezolva corect. Specificarea formală previne ambiguitatea.')}</p>
        </Box>

        <p className="font-bold mt-3">{t('Example: Greatest Common Divisor (GCD)', 'Exemplu: Cel mai mare divisor comun (GCD)')}</p>

        <Box type="formula">
          <p className="font-bold">{t('GCD — Natural language:', 'GCD — Limbaj natural:')}</p>
          <p className="text-sm">{t('Input: Two numbers a, b ∈ ℕ. Output: A natural number d that is the greatest common divisor of a and b.', 'Input: Două numere a, b ∈ ℕ. Output: Un număr natural d care este cel mai mare divisor comun al lui a și b.')}</p>
        </Box>

        <Box type="formula">
          <p className="font-bold">{t('GCD — Formalized with predicates:', 'GCD — Formalizat cu predicate:')}</p>
          <p className="text-sm font-mono">{t('Input: a, b ∈ ℕ. Output: d ∈ ℕ such that CD(d,a,b) ∧ (∀c. Nat(c) ∧ CD(c,a,b) → d ≥ c), where CD(x,y,z): y MOD x = 0 ∧ z MOD x = 0', 'Input: a, b ∈ ℕ. Output: d ∈ ℕ astfel încât CD(d,a,b) ∧ (∀c. Nat(c) ∧ CD(c,a,b) → d ≥ c), unde CD(x,y,z): y MOD x = 0 ∧ z MOD x = 0')}</p>
        </Box>

        <Box type="theorem">
          <p>{t('When defining a problem as an Input-Output pair, aim to be formal and use logical predicates or mathematical notations!', 'Când definiți o problemă ca pereche Input-Output, încercați să fiți formali și să folosiți predicate logice sau notații matematice!')}</p>
        </Box>
      </Section>

      {/* ── 2. Classification by Output Type ── */}
      <Section title={t('2. Classification by Output Type', '2. Clasificarea după tipul output-ului')} id="pa-c1-output" checked={!!checked['pa-c1-output']} onCheck={() => toggleCheck('pa-c1-output')}>

        <p className="font-bold mt-2">{t('2.1 Decision Problems', '2.1 Probleme de decizie')}</p>
        <Box type="definition">
          <p>{t('A decision problem requires a Boolean answer (Yes/No). Formally: f : I → {Yes, No}.', 'O problemă de decizie necesită un răspuns Boolean (Yes/No). Formal: f : I → {Yes, No}.')}</p>
        </Box>
        <Box type="formula">
          <p className="font-bold">PRIMES</p>
          <p className="text-sm">{t('Input: k ∈ ℕ. Output: Yes if k is prime (k MOD i ≠ 0, ∀i ∈ ℕ, 1 < i ≤ √k); No otherwise.', 'Input: k ∈ ℕ. Output: Yes dacă k este prim (k MOD i ≠ 0, ∀i ∈ ℕ, 1 < i ≤ √k); No altfel.')}</p>
        </Box>
        <p className="text-sm mt-1 opacity-70">{t('Real-life: password verification, spam detection, face recognition, disease diagnosis.', 'Viața reală: verificarea parolelor, detectarea spam-ului, recunoaștere facială, diagnosticare boli.')}</p>

        <p className="font-bold mt-4">{t('2.2 Optimization Problems', '2.2 Probleme de optimizare')}</p>
        <Box type="definition">
          <p>{t('Find the best solution according to an objective function. Input: d. Output: s ∈ S(d) s.t. cost(s) is minimum (or maximum).', 'Găsirea celei mai bune soluții conform unei funcții obiectiv. Input: d. Output: s ∈ S(d) a.î. cost(s) este minim (sau maxim).')}</p>
        </Box>
        <Box type="formula">
          <p className="font-bold">SHORTEST-PATH</p>
          <p className="text-sm">{t('Input: Graph G=(V,E), vertices s,t ∈ V. Output: The shortest path between s and t in G.', 'Input: Graf G=(V,E), vârfuri s,t ∈ V. Output: Cel mai scurt drum între s și t în G.')}</p>
        </Box>

        <p className="font-bold mt-4">{t('2.3 Search Problems', '2.3 Probleme de căutare')}</p>
        <Box type="definition">
          <p>{t('Find at least one solution, without necessarily optimizing.', 'Găsirea a cel puțin unei soluții, fără a optimiza neapărat.')}</p>
        </Box>
        <Box type="formula">
          <p className="font-bold">Element-Search</p>
          <p className="text-sm">{t('Input: Sorted array d, searched item k. Output: i s.t. d[i] = k, or -1 if k not in d.', 'Input: Array sortat d, element căutat k. Output: i a.î. d[i] = k, sau -1 dacă k nu este în d.')}</p>
        </Box>

        <p className="font-bold mt-4">{t('2.4 Counting Problems', '2.4 Probleme de numărare')}</p>
        <Box type="definition">
          <p>{t('Determine the number of valid solutions meeting specific criteria.', 'Determinarea numărului de soluții valide ce satisfac criterii specifice.')}</p>
        </Box>
        <Box type="formula">
          <p className="font-bold">#SAT</p>
          <p className="text-sm">{t('Input: Boolean formula φ. Output: n = |T|, where T = {σ : vars(φ) → {0,1} | σ(φ) = 1} (count of satisfying assignments).', 'Input: Formula Booleană φ. Output: n = |T|, unde T = {σ : vars(φ) → {0,1} | σ(φ) = 1} (numărul de atribuiri satisfiabile).')}</p>
        </Box>
      </Section>

      {/* ── 3. Classification by Input Type ── */}
      <Section title={t('3. Classification by Input Type', '3. Clasificarea după tipul input-ului')} id="pa-c1-input" checked={!!checked['pa-c1-input']} onCheck={() => toggleCheck('pa-c1-input')}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <Box type="formula">
            <p className="font-bold">{t('Sorting Problems', 'Probleme de sortare')}</p>
            <p>{t('Input: unordered data. Output: data in specific order. Examples: Merge Sort, Quick Sort, Heap Sort.', 'Input: date neordonate. Output: date în ordine specifică. Exemple: Merge Sort, Quick Sort, Heap Sort.')}</p>
          </Box>
          <Box type="formula">
            <p className="font-bold">{t('Graph Problems', 'Probleme pe grafuri')}</p>
            <p>{t('Input: graph structure (vertices + edges). Examples: connectivity, shortest path, TSP, cycle detection.', 'Input: structură de graf (vârfuri + muchii). Exemple: conectivitate, drum minim, TSP, detectarea ciclurilor.')}</p>
          </Box>
          <Box type="formula">
            <p className="font-bold">{t('Geometric Problems', 'Probleme geometrice')}</p>
            <p>{t('Input: geometric objects (points, lines, polygons). Examples: convex hull, collision detection, path planning.', 'Input: obiecte geometrice (puncte, linii, poligoane). Exemple: convex hull, detectarea coliziunilor, planificarea rutelor.')}</p>
          </Box>
          <Box type="formula">
            <p className="font-bold">{t('String Processing', 'Procesarea șirurilor')}</p>
            <p>{t('Input: character sequences. Operations: matching, transforming, comparing. Examples: Pattern Matching (KMP, Boyer-Moore, Rabin-Karp).', 'Input: secvențe de caractere. Operații: potrivire, transformare, comparare. Exemple: Pattern Matching (KMP, Boyer-Moore, Rabin-Karp).')}</p>
          </Box>
        </div>

        <Box type="formula">
          <p className="font-bold">{t('Traveling Salesman Problem (TSP)', 'Problema comis-voiajorului (TSP)')}</p>
          <p className="text-sm">{t('Input: Complete graph G=(V,E), cost function c: E → ℕ. Output: Minimum cost Hamiltonian circuit (visits each vertex exactly once and returns to start).', 'Input: Graf complet G=(V,E), funcție de cost c: E → ℕ. Output: Circuit Hamiltonian de cost minim (vizitează fiecare vârf exact o dată și revine la start).')}</p>
        </Box>
      </Section>

      {/* ── 4. Solvability & Complexity ── */}
      <Section title={t('4. Solvability & Complexity Classes', '4. Rezolvabilitate și clase de complexitate')} id="pa-c1-solvability" checked={!!checked['pa-c1-solvability']} onCheck={() => toggleCheck('pa-c1-solvability')}>

        <Box type="definition">
          <p className="font-bold">{t('Decidable (Solvable)', 'Decidabilă (Rezolvabilă)')}</p>
          <p>{t('An algorithm exists that always terminates and provides a correct answer for any valid input.', 'Există un algorithm care termină întotdeauna și oferă un răspuns corect pentru orice input valid.')}</p>
        </Box>

        <Box type="definition">
          <p className="font-bold">{t('Undecidable (Unsolvable)', 'Nedecidabilă (Nerezolvabilă)')}</p>
          <p>{t('No algorithm exists that can always provide a correct solution for all valid inputs.', 'Nu există niciun algorithm care poate oferi întotdeauna o soluție corectă pentru toate input-urile valide.')}</p>
        </Box>

        <Box type="theorem">
          <p className="font-bold">{t('Halting Problem (Turing, 1936)', 'Problema opririi (Turing, 1936)')}</p>
          <p>{t('Given a program P and input x, will P halt on x? There is NO algorithm that can solve this for all program-input pairs.', 'Dat un program P și un input x, se va opri P pe x? NU există niciun algorithm care poate rezolva aceasta pentru toate perechile program-input.')}</p>
        </Box>

        <Toggle
          question={t('Proof sketch (by contradiction)', 'Schița demonstrației (prin reducere la absurd)')}
          answer={
            <div className="text-sm">
              <p>{t('Assume H(P,x) exists that correctly determines if P halts on x.', 'Presupunem că H(P,x) există și determină corect dacă P se oprește pe x.')}</p>
              <p className="mt-2">{t('Construct D(P): if H(P,P)=Yes → loop forever; if H(P,P)=No → halt.', 'Construim D(P): dacă H(P,P)=Yes → buclă infinită; dacă H(P,P)=No → oprire.')}</p>
              <p className="mt-2">{t('Now run D(D): if H(D,D)=Yes → D loops (contradiction: H said it halts). If H(D,D)=No → D halts (contradiction: H said it loops). Either way, H is wrong. ∎', 'Acum rulăm D(D): dacă H(D,D)=Yes → D buclă (contradicție: H a zis că se oprește). Dacă H(D,D)=No → D se oprește (contradicție: H a zis că buclă). Oricum, H greșește. ∎')}</p>
            </div>
          }
          showLabel={t('Show Proof', 'Arată demonstrația')}
          hideLabel={t('Hide', 'Ascunde')}
        />

        <p className="font-bold mt-4">{t('Complexity Classes', 'Clase de complexitate')}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mt-2">
          <Box type="formula">
            <p className="font-bold">P</p>
            <p>{t('Problems solvable in polynomial time. "Efficiently solvable."', 'Probleme rezolvabile în timp polinomial. „Rezolvabile eficient."')}</p>
          </Box>
          <Box type="formula">
            <p className="font-bold">NP</p>
            <p>{t('Problems whose solutions can be verified in polynomial time. P ⊆ NP.', 'Probleme ale căror soluții pot fi verificate în timp polinomial. P ⊆ NP.')}</p>
          </Box>
          <Box type="formula">
            <p className="font-bold">NP-hard</p>
            <p>{t('At least as hard as the hardest problems in NP. May not be in NP themselves.', 'Cel puțin la fel de grele ca cele mai grele probleme din NP. Pot să nu fie în NP.')}</p>
          </Box>
          <Box type="formula">
            <p className="font-bold">NP-complete</p>
            <p>{t('Both in NP AND NP-hard. The "hardest" problems in NP. If any NP-complete problem has a polynomial solution, then P = NP.', 'Atât în NP CÂT ȘI NP-hard. Cele mai „grele" probleme din NP. Dacă orice problemă NP-complete are soluție polinomială, atunci P = NP.')}</p>
          </Box>
        </div>

        <Box type="warning">
          <p className="font-bold">{t('The P vs NP question:', 'Întrebarea P vs NP:')}</p>
          <p>{t('Is P = NP? This is one of the most important open problems in computer science and mathematics. A $1M Millennium Prize awaits whoever solves it.', 'Este P = NP? Aceasta este una dintre cele mai importante probleme deschise în informatică și matematică. Un premiu Millennium de $1M așteaptă pe cel care o rezolvă.')}</p>
        </Box>
      </Section>

      {/* ── 5. From Problem to Algorithm ── */}
      <Section title={t('5. From Problem to Algorithm to Implementation', '5. De la problemă la algorithm la implementare')} id="pa-c1-algo" checked={!!checked['pa-c1-algo']} onCheck={() => toggleCheck('pa-c1-algo')}>
        <Box type="theorem">
          <p className="font-bold">{t('The workflow:', 'Fluxul de lucru:')}</p>
          <p>{t('1. Understand the problem → 2. Formally specify Input/Output → 3. Design algorithm → 4. Analyze correctness & complexity → 5. Implement', '1. Înțelegerea problemei → 2. Specificarea formală Input/Output → 3. Proiectarea algorithm-ului → 4. Analiza corectitudinii și complexității → 5. Implementare')}</p>
        </Box>

        <p className="font-bold mt-3">{t('Example: Linear Search', 'Exemplu: Căutare liniară')}</p>
        <Code>{`LinearSearch(A, n, k):
  for i = 0 to n-1:
    if A[i] == k:
      return i
  return -1

// Time: O(n) — checks each element once
// Works on unsorted arrays`}</Code>

        <p className="font-bold mt-3">{t('Example: Binary Search', 'Exemplu: Căutare binară')}</p>
        <Code>{`BinarySearch(A, n, k):
  lo = 0, hi = n-1
  while lo <= hi:
    mid = (lo + hi) / 2
    if A[mid] == k: return mid
    if A[mid] < k:  lo = mid + 1
    else:           hi = mid - 1
  return -1

// Time: O(log n) — halves search space each step
// Requires SORTED array`}</Code>

        <Box type="warning">
          <p className="font-bold">{t('Can we do better?', 'Putem face mai bine?')}</p>
          <p>{t('Always ask this question after finding a solution. Linear search is O(n), but if the array is sorted, binary search achieves O(log n) — exponentially faster for large inputs.', 'Întrebați-vă întotdeauna aceasta după găsirea unei soluții. Căutarea liniară este O(n), dar dacă array-ul este sortat, căutarea binară atinge O(log n) — exponențial mai rapidă pentru input-uri mari.')}</p>
        </Box>
      </Section>

      {/* ── Self-Test ── */}
      <Section title={t('Self-Test (6 Questions)', 'Autoevaluare (6 întrebări)')} id="pa-c1-quiz" checked={!!checked['pa-c1-quiz']} onCheck={() => toggleCheck('pa-c1-quiz')}>
        <Toggle
          question={t('1. What is a computational problem?', '1. Ce este o problemă computațională?')}
          answer={t('A function f: I → O mapping valid inputs to valid outputs. Represented as a pair (Input, Output) where input describes the data and output describes the expected result.', 'O funcție f: I → O care mapează input-uri valide la output-uri valide. Reprezentată ca o pereche (Input, Output) unde input descrie datele și output descrie rezultatul așteptat.')}
          hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
        />
        <Toggle
          question={t('2. What is the difference between a decision problem and an optimization problem?', '2. Care este diferența dintre o problemă de decizie și una de optimizare?')}
          answer={t('A decision problem returns Yes/No (Boolean). An optimization problem finds the best solution according to an objective function (minimize cost or maximize value). Every optimization problem has an associated decision version.', 'O problemă de decizie returnează Yes/No (Boolean). O problemă de optimizare găsește cea mai bună soluție conform unei funcții obiectiv (minimizare cost sau maximizare valoare). Fiecare problemă de optimizare are o versiune de decizie asociată.')}
          hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
        />
        <Toggle
          question={t('3. Why is the Halting Problem undecidable?', '3. De ce este problema opririi nedecidabilă?')}
          answer={t('Turing proved by contradiction: if an algorithm H could decide halting for all programs, we could construct a program D that contradicts H\'s answer when run on itself. D(D) leads to a paradox regardless of H\'s output, so H cannot exist.', 'Turing a demonstrat prin reducere la absurd: dacă un algorithm H ar putea decide oprirea pentru toate programele, am putea construi un program D care contrazice răspunsul lui H când rulează pe el însuși. D(D) duce la un paradox indiferent de output-ul lui H, deci H nu poate exista.')}
          hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
        />
        <Toggle
          question={t('4. What makes a problem NP-complete?', '4. Ce face o problemă NP-complete?')}
          answer={t('A problem is NP-complete if it is both in NP (solutions can be verified in polynomial time) AND NP-hard (at least as hard as every problem in NP). If ANY NP-complete problem could be solved in polynomial time, then P = NP.', 'O problemă este NP-complete dacă este atât în NP (soluțiile pot fi verificate în timp polinomial) CÂT ȘI NP-hard (cel puțin la fel de grea ca orice problemă din NP). Dacă ORICE problemă NP-complete ar putea fi rezolvată în timp polinomial, atunci P = NP.')}
          hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
        />
        <Toggle
          question={t('5. Formally define the GCD problem using predicates.', '5. Definiți formal problema GCD folosind predicate.')}
          answer={t('Input: a, b ∈ ℕ. Output: d ∈ ℕ such that CD(d,a,b) ∧ ∀c.(Nat(c) ∧ CD(c,a,b) → d ≥ c), where CD(x,y,z) means y MOD x = 0 ∧ z MOD x = 0.', 'Input: a, b ∈ ℕ. Output: d ∈ ℕ astfel încât CD(d,a,b) ∧ ∀c.(Nat(c) ∧ CD(c,a,b) → d ≥ c), unde CD(x,y,z) înseamnă y MOD x = 0 ∧ z MOD x = 0.')}
          hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
        />
        <Toggle
          question={t('6. When should you use binary search instead of linear search?', '6. Când ar trebui să folosiți binary search în loc de linear search?')}
          answer={t('Use binary search when the data is SORTED. It runs in O(log n) vs O(n) for linear search. For unsorted data, you must use linear search (or sort first, which costs O(n log n)).', 'Folosiți binary search când datele sunt SORTATE. Rulează în O(log n) vs O(n) pentru linear search. Pentru date nesortate, trebuie să folosiți linear search (sau să sortați mai întâi, ceea ce costă O(n log n)).')}
          hideLabel={t('Hide', 'Ascunde')} showLabel={t('Show Answer', 'Arată răspunsul')}
        />
      </Section>
    </>
  );
}
