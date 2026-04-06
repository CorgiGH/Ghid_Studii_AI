import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Section, Toggle } from '../../../components/ui';
import MultipleChoice from '../../../components/ui/MultipleChoice';

export default function Course01() {
  const { t, checked, toggleCheck } = useApp();

  return (
    <>
      <p className="mb-3 text-sm opacity-80">
        {t('Source: Algorithm Design, Lecture 1 — Computational Problems, UAIC 2025–2026.',
           'Sursă: Proiectarea Algoritmilor, Cursul 1 — Probleme computaționale, UAIC 2025–2026.')}
      </p>

      <Box type="definition">
        <p className="font-bold mb-2">{t('Roadmap', 'Foaie de parcurs')}</p>
        <ol className="list-decimal pl-5 text-sm space-y-1">
          <li>{t('Introduction — What are computational problems?', 'Introducere — Ce sunt problemele computaționale?')}</li>
          <li>{t('Defining computational problems (Input/Output pairs, formal specification)', 'Definirea problemelor computaționale (perechi Input/Output, specificare formală)')}</li>
          <li>{t('Classifying computational problems (by output, by input, by solvability)', 'Clasificarea problemelor computaționale (după output, după input, după rezolvabilitate)')}</li>
          <li>{t('Internal representation of data (numbers, strings, colors/images)', 'Reprezentarea internă a datelor (numere, șiruri, culori/imagini)')}</li>
          <li>{t('Algorithms — From problem to algorithm to implementation', 'Algoritmi — De la problemă la algoritm la implementare')}</li>
        </ol>
      </Box>

      {/* ── 1. Introduction ── */}
      <Section
        title={t('1. Introduction', '1. Introducere')}
        id="pa-c1-intro"
        checked={!!checked['pa-c1-intro']}
        onCheck={() => toggleCheck('pa-c1-intro')}
      >
        <p>{t(
          'In this lecture we talk about computational problems, defining them in terms of input and output, internal representation of data, and algorithms. We classify computational problems using several criteria and discuss their relevance in real-world situations.',
          'În acest curs vorbim despre probleme computaționale, definirea lor în termeni de input și output, reprezentarea internă a datelor și algoritmi. Clasificăm problemele computaționale folosind mai multe criterii și discutăm relevanța lor în situații din viața reală.'
        )}</p>

        <p className="mt-3">{t(
          'Every day we are confronted with problems to solve. For some, we have established routines (algorithms); others require creativity. We can think of ourselves as "machines" that solve various problems.',
          'În fiecare zi ne confruntăm cu probleme de rezolvat. Pentru unele avem rutine stabilite (algoritmi); altele necesită creativitate. Ne putem gândi la noi înșine ca la „mașini" care rezolvă diverse probleme.'
        )}</p>

        {/* Inline SVG: Input → Algorithm → Output */}
        <div className="my-4 flex justify-center">
          <svg width="400" height="60" viewBox="0 0 400 60" className="text-[var(--theme-text)]">
            <rect x="10" y="15" width="90" height="30" rx="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <text x="55" y="35" textAnchor="middle" fill="currentColor" fontSize="13" fontFamily="monospace">Input</text>
            <line x1="100" y1="30" x2="145" y2="30" stroke="currentColor" strokeWidth="1.5" markerEnd="url(#arrow)" />
            <rect x="145" y="15" width="110" height="30" rx="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <text x="200" y="35" textAnchor="middle" fill="currentColor" fontSize="13" fontFamily="monospace">Algorithm</text>
            <line x1="255" y1="30" x2="300" y2="30" stroke="currentColor" strokeWidth="1.5" markerEnd="url(#arrow)" />
            <rect x="300" y="15" width="90" height="30" rx="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <text x="345" y="35" textAnchor="middle" fill="currentColor" fontSize="13" fontFamily="monospace">Output</text>
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
              </marker>
            </defs>
          </svg>
        </div>

        <Box type="warning">
          <p>{t(
            'Correctly identifying the problem, its inputs and the expected output is crucial to solving the problem. Even when the problem seems the same, the input can change (e.g., waking up at 7AM after sleeping at 10PM vs 3AM).',
            'Identificarea corectă a problemei, a input-urilor și a output-ului așteptat este crucială pentru rezolvarea problemei. Chiar și când problema pare aceeași, input-ul se poate schimba (ex.: trezit la 7AM după ce ai dormit la 22:00 vs 3AM).'
          )}</p>
        </Box>
      </Section>

      {/* ── 2. Defining Computational Problems ── */}
      <Section
        title={t('2. Defining Computational Problems', '2. Definirea problemelor computaționale')}
        id="pa-c1-def"
        checked={!!checked['pa-c1-def']}
        onCheck={() => toggleCheck('pa-c1-def')}
      >
        <Box type="definition">
          <p className="font-bold">{t('Computational Problem', 'Problemă computațională')}</p>
          <p>{t(
            'A computational problem is a function f : I → O that maps each valid input to a valid output, where I is the input set and O is the output set. It can be solved using some mode of computation (e.g., a Turing Machine).',
            'O problemă computațională este o funcție f : I → O care mapează fiecare input valid la un output valid, unde I este mulțimea de input și O este mulțimea de output. Poate fi rezolvată folosind un mod de calcul (ex.: o Mașină Turing).'
          )}</p>
        </Box>

        {/* ⚠️ UNVERIFIED: exact quotes attributed to CLRS and Kleinberg/Tardos */}
        <Box type="formula">
          <p className="text-sm italic">{t(
            '"A computational problem is specified by a set of instances together with a function that maps each instance to a correct output." — Cormen et al.',
            '„O problemă computațională este specificată de o mulțime de instanțe împreună cu o funcție care mapează fiecare instanță la un output corect." — Cormen et al.'
          )}</p>
          <p className="text-sm italic mt-2">{t(
            '"A computational problem specifies the desired relationship to inputs and outputs, and an algorithm provides a step-by-step method for achieving this relationship." — Kleinberg & Tardos',
            '„O problemă computațională specifică relația dorită între input-uri și output-uri, iar un algoritm oferă o metodă pas-cu-pas pentru a obține această relație." — Kleinberg & Tardos'
          )}</p>
        </Box>

        <p className="mt-3">{t(
          'A problem P is represented as a pair (INPUT, OUTPUT). We denote by p an instance of P and by P(p) the output for instance p.',
          'O problemă P este reprezentată ca o pereche (INPUT, OUTPUT). Notăm cu p o instanță a lui P și cu P(p) output-ul pentru instanța p.'
        )}</p>

        <Box type="warning">
          <p>{t(
            '"I would spend 55 minutes defining the problem and then five minutes solving it." — Understanding the problem is crucial to correctly solving it. Spending time reviewing an initial idea for a solution may lead to a more cost-effective solution.',
            '„Aș petrece 55 de minute definind problema și apoi cinci minute rezolvând-o." — Înțelegerea problemei este crucială pentru a o rezolva corect. Petrecerea timpului revizuind o idee inițială poate duce la o soluție mai eficientă.'
          )}</p>
        </Box>

        <p className="font-bold mt-4">{t('Example: Greatest Common Divisor (GCD)', 'Exemplu: Cel mai mare divisor comun (CMMDC)')}</p>

        <Box type="formula">
          <p className="font-bold">{t('GCD — Natural language:', 'CMMDC — Limbaj natural:')}</p>
          <p className="text-sm">{t(
            'INPUT: Two numbers a, b ∈ ℕ. OUTPUT: A natural number d that is the greatest common divisor of a and b.',
            'INPUT: Două numere a, b ∈ ℕ. OUTPUT: Un număr natural d care este cel mai mare divisor comun al lui a și b.'
          )}</p>
        </Box>

        <p className="mt-2 text-sm">{t(
          'A common divisor c of a and b means: c divides both a and b. We define predicate D(x,y): y MOD x = 0, and CD(c,a,b): D(c,a) ∧ D(c,b).',
          'Un divisor comun c al lui a și b înseamnă: c divide atât a cât și b. Definim predicatul D(x,y): y MOD x = 0, și CD(c,a,b): D(c,a) ∧ D(c,b).'
        )}</p>

        <Box type="formula">
          <p className="font-bold">{t('GCD — Formalized with predicates:', 'CMMDC — Formalizat cu predicate:')}</p>
          <p className="text-sm font-mono">{'INPUT: a, b ∈ ℕ'}</p>
          <p className="text-sm font-mono">{'OUTPUT: d ∈ ℕ s.t. CD(d,a,b) ∧ (∀c. Nat(c) ∧ CD(c,a,b) → d ≥ c)'}</p>
          <p className="text-sm font-mono mt-1">{t('where Nat(x): x ∈ ℕ, CD(x,y,z): y MOD x = 0 ∧ z MOD x = 0', 'unde Nat(x): x ∈ ℕ, CD(x,y,z): y MOD x = 0 ∧ z MOD x = 0')}</p>
        </Box>

        <Box type="formula">
          <p className="font-bold">{t('GCD — Mathematical notation:', 'CMMDC — Notație matematică:')}</p>
          <p className="text-sm font-mono">{'INPUT: a, b ∈ ℕ'}</p>
          <p className="text-sm font-mono">{'OUTPUT: d ∈ ℕ s.t. a:d and b:d and ∀c ∈ ℕ s.t. a:c and b:c, c ≤ d'}</p>
        </Box>

        <Box type="theorem">
          <p>{t(
            'When defining a problem as an INPUT-OUTPUT pair, aim to be formal and use logical predicates or mathematical notations!',
            'Când definiți o problemă ca pereche INPUT-OUTPUT, încercați să fiți formali și să folosiți predicate logice sau notații matematice!'
          )}</p>
        </Box>
      </Section>

      {/* ── 3. Classification by Output Type ── */}
      <Section
        title={t('3. Classification by Output Type', '3. Clasificarea după tipul output-ului')}
        id="pa-c1-output"
        checked={!!checked['pa-c1-output']}
        onCheck={() => toggleCheck('pa-c1-output')}
      >
        {/* 3.1.1 Decision Problems */}
        <p className="font-bold mt-2">{t('3.1 Decision Problems', '3.1 Probleme de decizie')}</p>
        <Box type="definition">
          <p className="font-bold">{t('Decision Problem', 'Problemă de decizie')}</p>
          <p>{t(
            'A decision problem requires a Boolean answer (Yes/No). Formally: f : I → {Yes, No}, where I is the set of all possible problem instances.',
            'O problemă de decizie necesită un răspuns Boolean (Da/Nu). Formal: f : I → {Da, Nu}, unde I este mulțimea tuturor instanțelor posibile.'
          )}</p>
        </Box>

        <Box type="formula">
          <p className="font-bold">PRIMES</p>
          <p className="text-sm font-mono">{'INPUT: k ∈ ℕ'}</p>
          <p className="text-sm font-mono">{t(
            'OUTPUT: Yes, if k MOD i ≠ 0, ∀i ∈ ℕ, 1 < i ≤ √k; No, if ∃a,b ∈ ℕ, a,b ≠ 1 s.t. k = a·b',
            'OUTPUT: Da, dacă k MOD i ≠ 0, ∀i ∈ ℕ, 1 < i ≤ √k; Nu, dacă ∃a,b ∈ ℕ, a,b ≠ 1 a.î. k = a·b'
          )}</p>
        </Box>

        <p className="text-sm mt-1">{t(
          'Decision problems can also be specified as INSTANCE-QUESTION pairs.',
          'Problemele de decizie pot fi specificate și ca perechi INSTANȚĂ-ÎNTREBARE.'
        )}</p>

        <Box type="formula">
          <p className="font-bold">HAMILTONIAN-CIRCUIT</p>
          <p className="text-sm font-mono">{t('INSTANCE: a directed graph G = (V, E)', 'INSTANȚĂ: un graf orientat G = (V, E)')}</p>
          <p className="text-sm font-mono">{t(
            'QUESTION: Is there a Hamiltonian circuit (a permutation v₁,v₂,...,vₙ of V s.t. (vᵢ,vᵢ₊₁) ∈ E and (vₙ,v₁) ∈ E)?',
            'ÎNTREBARE: Există un circuit Hamiltonian (o permutare v₁,v₂,...,vₙ a lui V a.î. (vᵢ,vᵢ₊₁) ∈ E și (vₙ,v₁) ∈ E)?'
          )}</p>
        </Box>

        <Box type="formula">
          <p className="font-bold">SAT</p>
          <p className="text-sm font-mono">{t('INSTANCE: a Boolean formula φ in CNF', 'INSTANȚĂ: o formulă Booleană φ în CNF')}</p>
          <p className="text-sm font-mono">{t('QUESTION: Is φ satisfiable?', 'ÎNTREBARE: Este φ satisfiabilă?')}</p>
        </Box>

        <p className="text-sm mt-2 opacity-70">{t(
          'Real-life: password verification, spam detection, face recognition, disease diagnosis, collision detection in self-driving cars, loan approval, genetic mutation detection.',
          'Viața reală: verificarea parolelor, detectarea spam-ului, recunoaștere facială, diagnosticare boli, detectarea coliziunilor la mașini autonome, aprobarea creditelor, detectarea mutațiilor genetice.'
        )}</p>

        {/* 3.1.2 Optimization Problems */}
        <p className="font-bold mt-5">{t('3.2 Optimization Problems', '3.2 Probleme de optimizare')}</p>
        <Box type="definition">
          <p className="font-bold">{t('Optimization Problem', 'Problemă de optimizare')}</p>
          <p>{t(
            'Find the best solution according to an objective function. Minimization: find s ∈ S(d) s.t. cost(s) is minimum. Maximization: find s ∈ S(d) s.t. cost(s) is maximum.',
            'Găsirea celei mai bune soluții conform unei funcții obiectiv. Minimizare: găsește s ∈ S(d) a.î. cost(s) este minim. Maximizare: găsește s ∈ S(d) a.î. cost(s) este maxim.'
          )}</p>
        </Box>

        <Box type="formula">
          <p className="font-bold">{t('SHORTEST-PATH (minimization)', 'DRUM-MINIM (minimizare)')}</p>
          <p className="text-sm font-mono">{'INPUT: G = (V, E), s, t ∈ V'}</p>
          <p className="text-sm font-mono">{t('OUTPUT: The shortest path between s and t in G', 'OUTPUT: Cel mai scurt drum între s și t în G')}</p>
        </Box>

        <Box type="formula">
          <p className="font-bold">{t('LONGEST-PATH (maximization)', 'DRUM-MAXIM (maximizare)')}</p>
          <p className="text-sm font-mono">{'INPUT: G = (V, E), s, t ∈ V'}</p>
          <p className="text-sm font-mono">{t(
            'OUTPUT: The longest simple path between s and t (no vertex visited more than once)',
            'OUTPUT: Cel mai lung drum simplu între s și t (niciun vârf vizitat de mai multe ori)'
          )}</p>
        </Box>

        <p className="text-sm mt-2 opacity-70">{t(
          'Real-life: vehicle routing, portfolio optimization, inventory management, hyperparameter tuning in AI, wireless signal optimization, path planning for autonomous vehicles.',
          'Viața reală: rutarea vehiculelor, optimizarea portofoliului, gestiunea inventarului, ajustarea hiperparametrilor în AI, optimizarea semnalului wireless, planificarea rutelor vehiculelor autonome.'
        )}</p>

        {/* 3.1.3 Search Problems */}
        <p className="font-bold mt-5">{t('3.3 Search Problems', '3.3 Probleme de căutare')}</p>
        <Box type="definition">
          <p>{t(
            'A search problem requires finding at least one solution, without necessarily optimizing.',
            'O problemă de căutare necesită găsirea a cel puțin unei soluții, fără a optimiza neapărat.'
          )}</p>
        </Box>

        <Box type="formula">
          <p className="font-bold">ELEMENT-SEARCH</p>
          <p className="text-sm font-mono">{t(
            'INPUT: Sorted array d, searched item k. OUTPUT: i s.t. d[i] = k, or -1 if k not in d.',
            'INPUT: Array sortat d, element căutat k. OUTPUT: i a.î. d[i] = k, sau -1 dacă k nu este în d.'
          )}</p>
        </Box>

        <p className="text-sm mt-2 opacity-70">{t(
          'Real-life: pathfinding for autonomous vehicles, web search engines, auto-complete, malware detection, DNA sequence search, product recommendations, plagiarism detection.',
          'Viața reală: planificarea rutelor vehiculelor autonome, motoare de căutare web, auto-completare, detectarea malware, căutarea secvențelor ADN, recomandări de produse, detectarea plagiatului.'
        )}</p>

        {/* 3.1.4 Counting Problems */}
        <p className="font-bold mt-5">{t('3.4 Counting Problems', '3.4 Probleme de numărare')}</p>
        <Box type="definition">
          <p>{t(
            'Counting problems determine the number of possible solutions that meet specific criteria. Unlike decision problems (Yes/No), they focus on how many valid solutions exist.',
            'Problemele de numărare determină numărul de soluții posibile care satisfac criterii specifice. Spre deosebire de problemele de decizie (Da/Nu), se concentrează pe câte soluții valide există.'
          )}</p>
        </Box>

        <Box type="formula">
          <p className="font-bold">#SAT</p>
          <p className="text-sm font-mono">{'INPUT: Boolean formula φ'}</p>
          <p className="text-sm font-mono">{'OUTPUT: n = |T|, where T = {τ : vars(φ) → {0,1} | τ(φ) = 1}'}</p>
        </Box>

        <p className="text-sm mt-2 opacity-70">{t(
          'Real-life: counting attack vectors in network security, counting game states, DNA sequence alignment, drug combination testing, graph coloring, counting paths in networks.',
          'Viața reală: numărarea vectorilor de atac în securitatea rețelelor, numărarea stărilor de joc, alinierea secvențelor ADN, testarea combinațiilor de medicamente, colorarea grafurilor, numărarea drumurilor în rețele.'
        )}</p>
      </Section>

      {/* ── 4. Classification by Input Type ── */}
      <Section
        title={t('4. Classification by Input Type', '4. Clasificarea după tipul input-ului')}
        id="pa-c1-input"
        checked={!!checked['pa-c1-input']}
        onCheck={() => toggleCheck('pa-c1-input')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <Box type="definition">
            <p className="font-bold">{t('Sorting Problems', 'Probleme de sortare')}</p>
            <p>{t(
              'Input: unordered data. Goal: arrange in specific order (increasing, decreasing, alphabetical). Sorting is often a pre-processing step for search, optimization, or classification. Examples: Merge Sort, Quick Sort, Heap Sort.',
              'Input: date neordonate. Scop: aranjarea într-o ordine specifică (crescătoare, descrescătoare, alfabetică). Sortarea este adesea un pas de preprocesare pentru căutare, optimizare sau clasificare. Exemple: Merge Sort, Quick Sort, Heap Sort.'
            )}</p>
          </Box>
          <Box type="definition">
            <p className="font-bold">{t('Graph Problems', 'Probleme pe grafuri')}</p>
            <p>{t(
              'Input: graph structure (vertices + edges). Analyzing relationships through nodes and connections. Examples: connectivity, shortest path, TSP, cycle detection, MST.',
              'Input: structură de graf (vârfuri + muchii). Analiza relațiilor prin noduri și conexiuni. Exemple: conectivitate, drum minim, TSP, detectarea ciclurilor, APM.'
            )}</p>
          </Box>
          <Box type="definition">
            <p className="font-bold">{t('Geometric Problems', 'Probleme geometrice')}</p>
            <p>{t(
              'Input: geometric objects (points, lines, polygons). Solving questions about spatial relationships, distances, angles, intersections. Examples: convex hull, collision detection, path planning.',
              'Input: obiecte geometrice (puncte, linii, poligoane). Rezolvarea întrebărilor despre relații spațiale, distanțe, unghiuri, intersecții. Exemple: convex hull, detectarea coliziunilor, planificarea rutelor.'
            )}</p>
          </Box>
          <Box type="definition">
            <p className="font-bold">{t('String Processing', 'Procesarea șirurilor')}</p>
            <p>{t(
              'Input: character sequences. Operations: matching, transforming, comparing. Example: Pattern Matching — find first/all occurrences of pattern P in text T. You will study KMP, Boyer-Moore, Rabin-Karp in Lectures 9–10.',
              'Input: secvențe de caractere. Operații: potrivire, transformare, comparare. Exemplu: Pattern Matching — găsirea primei/tuturor aparițiilor pattern-ului P în textul T. Veți studia KMP, Boyer-Moore, Rabin-Karp în Cursurile 9–10.'
            )}</p>
          </Box>
        </div>

        <Box type="formula">
          <p className="font-bold">{t('Traveling Salesman Problem (TSP)', 'Problema comis-voiajorului (TSP)')}</p>
          <p className="text-sm font-mono">{t(
            'INPUT: Complete graph G=(V,E), cost function c : E → ℕ',
            'INPUT: Graf complet G=(V,E), funcție de cost c : E → ℕ'
          )}</p>
          <p className="text-sm font-mono">{t(
            'OUTPUT: n = min Σᵢ₌₁ⁿ⁻¹ c(vᵢ,vᵢ₊₁) + c(vₙ,v₁), where v₁,...,vₙ is a Hamiltonian circuit',
            'OUTPUT: n = min Σᵢ₌₁ⁿ⁻¹ c(vᵢ,vᵢ₊₁) + c(vₙ,v₁), unde v₁,...,vₙ este un circuit Hamiltonian'
          )}</p>
        </Box>

        <Box type="formula">
          <p className="font-bold">GRAPH-CONNECTIVITY</p>
          <p className="text-sm font-mono">{t('INSTANCE: undirected graph G = (V, E)', 'INSTANȚĂ: graf neorientat G = (V, E)')}</p>
          <p className="text-sm font-mono">{t(
            'QUESTION: Are all nodes reachable from any node? (∀u ∈ V, R(u,v) True ∀v ∈ V, v ≠ u)',
            'ÎNTREBARE: Sunt toate nodurile accesibile din orice nod? (∀u ∈ V, R(u,v) Adevărat ∀v ∈ V, v ≠ u)'
          )}</p>
        </Box>

        <Box type="formula">
          <p className="font-bold">PATTERN-MATCHING</p>
          <p className="text-sm font-mono">{t(
            'INPUT: Strings P (pattern) and T (text), |P| < |T|',
            'INPUT: Șirurile P (pattern) și T (text), |P| < |T|'
          )}</p>
          <p className="text-sm font-mono">{t(
            'OUTPUT: i ∈ ℕ ∪ {-1}, index of first occurrence of P in T, or -1 if not found',
            'OUTPUT: i ∈ ℕ ∪ {-1}, indexul primei apariții a lui P în T, sau -1 dacă nu este găsit'
          )}</p>
        </Box>
      </Section>

      {/* ── 5. Solvability ── */}
      <Section
        title={t('5. Classification by Solvability', '5. Clasificarea după rezolvabilitate')}
        id="pa-c1-solvability"
        checked={!!checked['pa-c1-solvability']}
        onCheck={() => toggleCheck('pa-c1-solvability')}
      >
        <Box type="definition">
          <p className="font-bold">{t('Decidable (Solvable)', 'Decidabilă (Rezolvabilă)')}</p>
          <p>{t(
            'An algorithm exists that always terminates after a finite number of steps and provides a correct answer for any valid input. All problems given so far as examples are decidable.',
            'Există un algoritm care se termină întotdeauna după un număr finit de pași și oferă un răspuns corect pentru orice input valid. Toate problemele date ca exemplu până acum sunt decidabile.'
          )}</p>
        </Box>

        <Box type="definition">
          <p className="font-bold">{t('Undecidable (Unsolvable)', 'Nedecidabilă (Nerezolvabilă)')}</p>
          <p>{t(
            'No algorithm exists that can always provide a correct solution for all valid inputs.',
            'Nu există niciun algoritm care poate oferi întotdeauna o soluție corectă pentru toate input-urile valide.'
          )}</p>
        </Box>

        <Box type="theorem">
          <p className="font-bold">{t('Halting Problem (Turing, 1936)', 'Problema opririi (Turing, 1936)')}</p>
          <p>{t(
            'Given a program P and input x, will P eventually halt on x, or will it run forever? There is NO algorithm that can solve the halting problem for all possible program-input pairs.',
            'Dat un program P și un input x, se va opri P pe x, sau va rula la infinit? NU există niciun algoritm care poate rezolva problema opririi pentru toate perechile program-input posibile.'
          )}</p>
        </Box>

        <Toggle
          question={t('Proof by Contradiction (Turing, 1936)', 'Demonstrație prin reducere la absurd (Turing, 1936)')}
          answer={
            <div className="text-sm space-y-2">
              <p className="font-bold">{t('Assumption:', 'Presupunere:')}</p>
              <p>{t(
                'Suppose there exists an algorithm H(P,x) that correctly determines whether any program P halts on input x.',
                'Presupunem că există un algoritm H(P,x) care determină corect dacă orice program P se oprește pe input-ul x.'
              )}</p>
              <Code>{`H(P, x) = {
  Yes, if P halts on input x
  No,  if P runs forever on input x
}`}</Code>
              <p className="font-bold">{t('Construct the contradiction:', 'Construim contradicția:')}</p>
              <p>{t('Define a new program D (Diagonalization):', 'Definim un nou program D (Diagonalizare):')}</p>
              <Code>{`D(P) = {
  loop forever,      if H(P, P) = Yes
  halt immediately,  if H(P, P) = No
}`}</Code>
              <p className="font-bold">{t('Run D(D):', 'Rulăm D(D):')}</p>
              <ul className="list-disc pl-5">
                <li>{t('If H(D,D) = Yes → D loops forever (contradiction: H said it halts)', 'Dacă H(D,D) = Da → D buclă infinită (contradicție: H a zis că se oprește)')}</li>
                <li>{t('If H(D,D) = No → D halts immediately (contradiction: H said it loops)', 'Dacă H(D,D) = Nu → D se oprește imediat (contradicție: H a zis că buclă)')}</li>
              </ul>
              <p>{t('Both cases lead to contradiction. Therefore H cannot exist. ∎', 'Ambele cazuri duc la contradicție. Deci H nu poate exista. ∎')}</p>
            </div>
          }
          showLabel={t('Show Proof', 'Arată demonstrația')}
          hideLabel={t('Hide', 'Ascunde')}
        />

        <Box type="definition">
          <p className="font-bold">{t('Semi-Decidable (Recursively Enumerable)', 'Semi-decidabilă (Recursiv enumerabilă)')}</p>
          <p>{t(
            'An algorithm will provide a Yes answer if the solution exists, but may not terminate if the answer is No.',
            'Un algoritm va oferi răspunsul Da dacă soluția există, dar poate să nu se termine dacă răspunsul este Nu.'
          )}</p>
        </Box>

        <p className="text-sm mt-2 opacity-70">{t(
          'Example: Theorem Proving in Logic — can a logical statement be derived from axioms? A valid proof can eventually be found if it exists, but if no proof exists, the search could run forever.',
          'Exemplu: Demonstrarea Teoremelor în Logică — poate fi derivată o propoziție logică din axiome? O demonstrație validă poate fi găsită eventual dacă există, dar dacă nu există, căutarea poate rula la infinit.'
        )}</p>
      </Section>

      {/* ── 6. Internal Representation of Data ── */}
      <Section
        title={t('6. Internal Representation of Data', '6. Reprezentarea internă a datelor')}
        id="pa-c1-representation"
        checked={!!checked['pa-c1-representation']}
        onCheck={() => toggleCheck('pa-c1-representation')}
      >
        <p>{t(
          'In computers, all types of data are ultimately represented in binary form (sequences of 0s and 1s). This binary data is interpreted by hardware and software according to the type of data.',
          'În calculatoare, toate tipurile de date sunt reprezentate în formă binară (secvențe de 0 și 1). Aceste date binare sunt interpretate de hardware și software conform tipului de date.'
        )}</p>

        <p className="font-bold mt-4">{t('6.1 Representing Numbers', '6.1 Reprezentarea numerelor')}</p>
        <Box type="formula">
          <p className="text-sm">{t('Integers are represented in base-2 and stored as a fixed number of bits:', 'Numerele întregi sunt reprezentate în baza 2 și stocate ca un număr fix de biți:')}</p>
          <ul className="list-disc pl-5 text-sm mt-1">
            <li>8 bits (1 byte) → char</li>
            <li>16 bits (2 bytes) → short int</li>
            <li>32 bits (4 bytes) → int</li>
            <li>64 bits (8 bytes) → long int</li>
          </ul>
        </Box>

        <Box type="warning">
          <p className="text-sm">{t(
            'In cryptography, very large numbers (4096 bits for high-security RSA) are used. With such large numbers, basic operations that we consider as single computation steps actually need more steps in practice.',
            'În criptografie se folosesc numere foarte mari (4096 biți pentru RSA cu securitate ridicată). Cu numere atât de mari, operațiile de bază pe care le considerăm ca un singur pas de calcul au nevoie de mai mulți pași în practică.'
          )}</p>
        </Box>

        <p className="font-bold mt-4">{t('6.2 Representing Characters/Strings', '6.2 Reprezentarea caracterelor/șirurilor')}</p>
        <p className="text-sm">{t(
          'Characters are stored as integer encodings. Strings are sequences of characters followed by a null terminator (\\0 in C/C++).',
          'Caracterele sunt stocate ca codificări întregi. Șirurile sunt secvențe de caractere urmate de un terminator null (\\0 în C/C++).'
        )}</p>

        <Box type="formula">
          <p className="font-bold">ASCII</p>
          <p className="text-sm">{t(
            '7 bits per character. \'A\' = 65, \'a\' = 97. Letters are encoded increasingly in lexicographic order. These encodings are relevant for text algorithms studied later in the course.',
            '7 biți per caracter. \'A\' = 65, \'a\' = 97. Literele sunt codificate crescător în ordine lexicografică. Aceste codificări sunt relevante pentru algoritmii pe text studiați mai târziu în curs.'
          )}</p>
        </Box>

        <Box type="formula">
          <p className="font-bold">Unicode (UTF-8, UTF-16, UTF-32)</p>
          <p className="text-sm">{t(
            'Variable-length encoding: 1 to 4 bytes per character. Backward compatible with ASCII (first 128 characters match). Supports special characters, emojis, and all writing systems.',
            'Codificare cu lungime variabilă: 1 până la 4 octeți per caracter. Compatibilă cu ASCII (primele 128 de caractere). Suportă caractere speciale, emoji-uri și toate sistemele de scriere.'
          )}</p>
          <table className="w-full text-xs mt-2 border-collapse">
            <thead>
              <tr className="border-b border-current/20">
                <th className="text-left p-1">{t('Character', 'Caracter')}</th>
                <th className="text-left p-1">Code Point</th>
                <th className="text-left p-1">UTF-8 (Hex)</th>
                <th className="text-left p-1">UTF-8 (Binary)</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              <tr className="border-b border-current/10"><td className="p-1">A</td><td className="p-1">U+0041</td><td className="p-1">0x41</td><td className="p-1">01000001</td></tr>
              <tr className="border-b border-current/10"><td className="p-1">€</td><td className="p-1">U+20AC</td><td className="p-1">0xE2 0x82 0xAC</td><td className="p-1">11100010 10000010 10101100</td></tr>
              <tr><td className="p-1">😊</td><td className="p-1">U+1F60A</td><td className="p-1">0xF0 0x9F 0x98 0x8A</td><td className="p-1">11110000 10011111 10011000 10001010</td></tr>
            </tbody>
          </table>
        </Box>

        <p className="font-bold mt-4">{t('6.3 Representing Colors/Images', '6.3 Reprezentarea culorilor/imaginilor')}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mt-2">
          <Box type="formula">
            <p className="font-bold">RGB</p>
            <p>{t(
              'Three values (0–255 each) for Red, Green, Blue. Stored as 24-bit integer. Example: Yellow = (255, 255, 0) = #FFFF00',
              'Trei valori (0–255 fiecare) pentru Roșu, Verde, Albastru. Stocat ca întreg pe 24 biți. Exemplu: Galben = (255, 255, 0) = #FFFF00'
            )}</p>
          </Box>
          <Box type="formula">
            <p className="font-bold">CMYK</p>
            <p>{t(
              'Used in color printing. Channels: Cyan, Magenta, Yellow, Black (0–100% each). Example: Pure yellow = C=0%, M=0%, Y=100%, K=0%',
              'Folosit în tipărirea color. Canale: Cyan, Magenta, Yellow, Black (0–100% fiecare). Exemplu: Galben pur = C=0%, M=0%, Y=100%, K=0%'
            )}</p>
          </Box>
        </div>
        <p className="text-sm mt-2">{t(
          'RGBA adds an Alpha channel (transparency, 0–255). Images are collections of colored pixels. Raster images (JPG, PNG, BMP) use pixel grids. Vector images (SVG, EPS) use mathematical equations — scalable without quality loss.',
          'RGBA adaugă un canal Alpha (transparență, 0–255). Imaginile sunt colecții de pixeli colorați. Imaginile raster (JPG, PNG, BMP) folosesc grile de pixeli. Imaginile vectoriale (SVG, EPS) folosesc ecuații matematice — scalabile fără pierderea calității.'
        )}</p>
      </Section>

      {/* ── 7. Algorithms ── */}
      <Section
        title={t('7. From Problem to Algorithm to Implementation', '7. De la problemă la algoritm la implementare')}
        id="pa-c1-algo"
        checked={!!checked['pa-c1-algo']}
        onCheck={() => toggleCheck('pa-c1-algo')}
      >
        <Box type="definition">
          <p className="font-bold">{t('Algorithm', 'Algoritm')}</p>
          <p>{t(
            'A well-defined, step-by-step sequence of instructions designed to perform a specific task or solve a particular problem. A good algorithm is not only correct but also efficient in terms of time (speed) and space (memory usage).',
            'O secvență bine definită, pas-cu-pas, de instrucțiuni concepute pentru a efectua o sarcină specifică sau a rezolva o problemă particulară. Un algoritm bun nu este doar corect, ci și eficient în termeni de timp (viteză) și spațiu (utilizarea memoriei).'
          )}</p>
        </Box>

        <Box type="theorem">
          <p className="font-bold">{t('Five-Step Approach: P.A.P.I.A.', 'Abordarea în cinci pași: P.A.P.I.A.')}</p>
          <p className="text-sm italic mb-2">{t('"Please Always Plan Intelligently Ahead"', '„Please Always Plan Intelligently Ahead"')}</p>
          <ol className="list-decimal pl-5 text-sm space-y-1">
            <li><span className="font-bold">P</span>roblem — {t('Understand, define INPUT-OUTPUT, identify constraints and edge cases', 'Înțelege, definește INPUT-OUTPUT, identifică constrângeri și cazuri limită')}</li>
            <li><span className="font-bold">A</span>lgorithm — {t('Think through solutions, break into sub-problems', 'Gândește soluții, descompune în sub-probleme')}</li>
            <li><span className="font-bold">P</span>seudocode — {t('Write high-level description, choose data structures, spot errors early', 'Scrie descrierea de nivel înalt, alege structurile de date, detectează erori devreme')}</li>
            <li><span className="font-bold">I</span>mplementation — {t('Translate pseudocode into real code', 'Traduce pseudocodul în cod real')}</li>
            <li><span className="font-bold">A</span>ssessment — {t('Test, debug, optimize for time and space', 'Testează, depanează, optimizează pentru timp și spațiu')}</li>
          </ol>
        </Box>

        <Box type="warning">
          <p>{t(
            'Don\'t start coding right away! You may later discover that your data structures are unsuitable, or your solution is incorrect/inefficient, and have to restart from scratch.',
            'Nu începe să codezi imediat! Poți descoperi ulterior că structurile de date sunt inadecvate, sau soluția este incorectă/ineficientă, și trebuie să reiei de la zero.'
          )}</p>
        </Box>

        <p className="font-bold mt-4">{t('Example: The Search Problem', 'Exemplu: Problema căutării')}</p>

        <Box type="formula">
          <p className="font-bold">ELEMENT-SEARCH</p>
          <p className="text-sm font-mono">{'INPUT: (a₁, a₂, ..., aₙ), aᵢ ∈ ℕ, aᵢ < aᵢ₊₁, ∀1 ≤ i ≤ n-1, and k ∈ ℕ'}</p>
          <p className="text-sm font-mono">{'OUTPUT: i ∈ ℕ ∪ {-1}, s.t. aᵢ = k, or -1 if k not in a'}</p>
        </Box>

        <p className="font-bold mt-3">{t('Linear Search — Pseudocode:', 'Căutare liniară — Pseudocod:')}</p>
        <Code>{`Algorithm 1: Linear Search
Input: array a of nonneg. integers, target k
Output: index of k, or -1

1: n ← a.size()
2: for i = 0..n-1 do
3:   if a[i] == k then
4:     return i
5: return -1`}</Code>

        <p className="font-bold mt-3">{t('Linear Search — Implementation:', 'Căutare liniară — Implementare:')}</p>
        <Code>{`int search(vector<int> &a, int k) {
    int n = a.size();
    for (int i = 0; i < n; i++)
        if (a[i] == k)
            return i;
    return -1;
}`}</Code>

        <p className="font-bold mt-3">{t('Binary Search — Can we do better?', 'Căutare binară — Putem face mai bine?')}</p>
        <p className="text-sm mb-2">{t(
          'Since the array is sorted, we can start in the middle. If the element is found, return. If less than target, search right; otherwise search left.',
          'Deoarece array-ul este sortat, putem începe din mijloc. Dacă elementul este găsit, returnăm. Dacă e mai mic decât ținta, căutăm la dreapta; altfel la stânga.'
        )}</p>

        <Code>{`Algorithm 2: Binary Search
Input: sorted array a of length n, target k
Output: index of k, or -1

1:  low ← 0
2:  high ← n − 1
3:  while low ≤ high do
4:    mid ← ⌊(low + high) / 2⌋
5:    if a[mid] == k then
6:      return mid
7:    else if a[mid] < k then
8:      low ← mid + 1
9:    else
10:     high ← mid − 1
11: return −1`}</Code>

        <Box type="theorem">
          <p className="font-bold">{t('"Can we do better?"', '„Putem face mai bine?"')}</p>
          <p className="text-sm">{t(
            '"Perhaps the most important principle for the good algorithm designer is to refuse to be content." — Aho & Hopcroft. Linear search is O(n), but binary search on sorted data is O(log n) — exponentially faster.',
            '„Poate cel mai important principiu pentru un bun proiectant de algoritmi este să refuze să fie mulțumit." — Aho & Hopcroft. Căutarea liniară este O(n), dar căutarea binară pe date sortate este O(log n) — exponențial mai rapidă.'
          )}</p>
        </Box>
      </Section>

      {/* ── Cheat Sheet ── */}
      <Section
        title={t('Cheat Sheet', 'Referință rapidă')}
        id="pa-c1-cheat"
        checked={!!checked['pa-c1-cheat']}
        onCheck={() => toggleCheck('pa-c1-cheat')}
      >
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b-2 border-current/20">
              <th className="text-left p-2">{t('Concept', 'Concept')}</th>
              <th className="text-left p-2">{t('Key Idea', 'Idee cheie')}</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-current/10">
              <td className="p-2 font-bold">{t('Computational Problem', 'Problemă computațională')}</td>
              <td className="p-2">f : I → O</td>
            </tr>
            <tr className="border-b border-current/10">
              <td className="p-2 font-bold">{t('Decision', 'Decizie')}</td>
              <td className="p-2">f : I → {'{'} Yes, No {'}'}</td>
            </tr>
            <tr className="border-b border-current/10">
              <td className="p-2 font-bold">{t('Optimization', 'Optimizare')}</td>
              <td className="p-2">{t('min/max cost(s) over S(d)', 'min/max cost(s) peste S(d)')}</td>
            </tr>
            <tr className="border-b border-current/10">
              <td className="p-2 font-bold">{t('Search', 'Căutare')}</td>
              <td className="p-2">{t('Find any valid solution', 'Găsește orice soluție validă')}</td>
            </tr>
            <tr className="border-b border-current/10">
              <td className="p-2 font-bold">{t('Counting', 'Numărare')}</td>
              <td className="p-2">{t('How many valid solutions?', 'Câte soluții valide?')}</td>
            </tr>
            <tr className="border-b border-current/10">
              <td className="p-2 font-bold">{t('Decidable', 'Decidabilă')}</td>
              <td className="p-2">{t('Algorithm always terminates correctly', 'Algoritmul se termină întotdeauna corect')}</td>
            </tr>
            <tr className="border-b border-current/10">
              <td className="p-2 font-bold">{t('Undecidable', 'Nedecidabilă')}</td>
              <td className="p-2">{t('No algorithm for all inputs (Halting Problem)', 'Niciun algoritm pt. toate input-urile (Problema opririi)')}</td>
            </tr>
            <tr className="border-b border-current/10">
              <td className="p-2 font-bold">{t('Semi-decidable', 'Semi-decidabilă')}</td>
              <td className="p-2">{t('Terminates for Yes; may loop for No', 'Se termină pt. Da; poate bucla pt. Nu')}</td>
            </tr>
            <tr>
              <td className="p-2 font-bold">P.A.P.I.A.</td>
              <td className="p-2">{t('Problem → Algorithm → Pseudocode → Implementation → Assessment', 'Problem → Algorithm → Pseudocode → Implementation → Assessment')}</td>
            </tr>
          </tbody>
        </table>
      </Section>

      {/* ── Self-Test ── */}
      <Section
        title={t('Self-Test', 'Autoevaluare')}
        id="pa-c1-quiz"
        checked={!!checked['pa-c1-quiz']}
        onCheck={() => toggleCheck('pa-c1-quiz')}
      >
        <MultipleChoice questions={[
          {
            question: t('What is a computational problem?', 'Ce este o problemă computațională?'),
            options: [
              { text: t('A program that runs on a computer', 'Un program care rulează pe un calculator'), correct: false },
              { text: t('A function f : I → O mapping inputs to outputs', 'O funcție f : I → O care mapează input-uri la output-uri'), correct: true },
              { text: t('A set of instructions in pseudocode', 'Un set de instrucțiuni în pseudocod'), correct: false },
              { text: t('Any task a human can perform', 'Orice sarcină pe care un om o poate efectua'), correct: false },
            ],
            explanation: t(
              'A computational problem is formally a function mapping each valid input to a valid output, solvable by some mode of computation.',
              'O problemă computațională este formal o funcție care mapează fiecare input valid la un output valid, rezolvabilă printr-un mod de calcul.'
            ),
          },
          {
            question: t('Which problem type returns only Yes or No?', 'Ce tip de problemă returnează doar Da sau Nu?'),
            options: [
              { text: t('Optimization problem', 'Problemă de optimizare'), correct: false },
              { text: t('Counting problem', 'Problemă de numărare'), correct: false },
              { text: t('Decision problem', 'Problemă de decizie'), correct: true },
              { text: t('Search problem', 'Problemă de căutare'), correct: false },
            ],
            explanation: t(
              'Decision problems return a Boolean answer: f : I → {Yes, No}.',
              'Problemele de decizie returnează un răspuns Boolean: f : I → {Da, Nu}.'
            ),
          },
          {
            question: t('Why is the Halting Problem undecidable?', 'De ce este problema opririi nedecidabilă?'),
            options: [
              { text: t('Because computers are too slow to solve it', 'Pentru că calculatoarele sunt prea lente'), correct: false },
              { text: t('Because we haven\'t found the right algorithm yet', 'Pentru că nu am găsit încă algoritmul potrivit'), correct: false },
              { text: t('Because assuming a solution exists leads to a logical contradiction', 'Pentru că presupunerea că o soluție există duce la o contradicție logică'), correct: true },
              { text: t('Because it requires infinite memory', 'Pentru că necesită memorie infinită'), correct: false },
            ],
            explanation: t(
              'Turing proved by diagonalization that any assumed halting algorithm H leads to a program D(D) that contradicts H\'s answer, so H cannot exist.',
              'Turing a demonstrat prin diagonalizare că orice algoritm de oprire presupus H duce la un program D(D) care contrazice răspunsul lui H, deci H nu poate exista.'
            ),
          },
          {
            question: t('What is the correct order of the P.A.P.I.A. approach?', 'Care este ordinea corectă a abordării P.A.P.I.A.?'),
            options: [
              { text: t('Pseudocode → Algorithm → Problem → Implementation → Assessment', 'Pseudocod → Algoritm → Problemă → Implementare → Evaluare'), correct: false },
              { text: t('Problem → Algorithm → Pseudocode → Implementation → Assessment', 'Problemă → Algoritm → Pseudocod → Implementare → Evaluare'), correct: true },
              { text: t('Problem → Implementation → Algorithm → Pseudocode → Assessment', 'Problemă → Implementare → Algoritm → Pseudocod → Evaluare'), correct: false },
              { text: t('Algorithm → Problem → Implementation → Pseudocode → Assessment', 'Algoritm → Problemă → Implementare → Pseudocod → Evaluare'), correct: false },
            ],
            explanation: t(
              '"Please Always Plan Intelligently Ahead" — understand the Problem, design the Algorithm, write Pseudocode, Implement, then Assess.',
              '„Please Always Plan Intelligently Ahead" — înțelege Problema, proiectează Algoritmul, scrie Pseudocodul, Implementează, apoi Evaluează.'
            ),
          },
          {
            question: t('What is the time complexity advantage of binary search over linear search?', 'Care este avantajul de complexitate al căutării binare față de cea liniară?'),
            options: [
              { text: t('O(1) vs O(n)', 'O(1) vs O(n)'), correct: false },
              { text: t('O(log n) vs O(n)', 'O(log n) vs O(n)'), correct: true },
              { text: t('O(n) vs O(n²)', 'O(n) vs O(n²)'), correct: false },
              { text: t('O(n log n) vs O(n)', 'O(n log n) vs O(n)'), correct: false },
            ],
            explanation: t(
              'Binary search halves the search space each step → O(log n). Linear search checks each element → O(n). Binary search requires sorted input.',
              'Căutarea binară înjumătățește spațiul de căutare la fiecare pas → O(log n). Căutarea liniară verifică fiecare element → O(n). Căutarea binară necesită input sortat.'
            ),
          },
          {
            question: t('What is a semi-decidable problem?', 'Ce este o problemă semi-decidabilă?'),
            options: [
              { text: t('A problem that can only be half-solved', 'O problemă care poate fi rezolvată doar pe jumătate'), correct: false },
              { text: t('A problem where the algorithm terminates for Yes but may loop forever for No', 'O problemă unde algoritmul se termină pentru Da dar poate bucla infinit pentru Nu'), correct: true },
              { text: t('A problem with two possible algorithms', 'O problemă cu doi algoritmi posibili'), correct: false },
              { text: t('A problem that is both decidable and undecidable', 'O problemă care este atât decidabilă cât și nedecidabilă'), correct: false },
            ],
            explanation: t(
              'Semi-decidable: an algorithm will eventually say Yes if the answer is Yes, but may never halt if the answer is No (e.g., theorem proving).',
              'Semi-decidabilă: un algoritm va spune eventual Da dacă răspunsul este Da, dar poate să nu se oprească niciodată dacă răspunsul este Nu (ex.: demonstrarea teoremelor).'
            ),
          },
        ]} />
      </Section>
    </>
  );
}
