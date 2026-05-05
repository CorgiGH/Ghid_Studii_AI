import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Toggle } from '../../../components/ui';
import MultipleChoice from '../../../components/ui/MultipleChoice';

export default function Seminar09() {
  const { t } = useApp();

  /* ─── Problem 1: P vs NP classification ─── */
  const mc1 = [
    {
      question: {
        en: 'Which of the following problems is in P (has a known polynomial-time deterministic algorithm)?',
        ro: 'Care dintre următoarele probleme este în P (are un algoritm determinist polinomial cunoscut)?',
      },
      options: [
        {
          text: { en: '2-SAT', ro: '2-SAT' },
          correct: true,
          feedback: {
            en: '2-SAT is in P — solvable via strongly connected components (Kosaraju/Tarjan) in O(n + m). Unlike 3-SAT, adding one extra literal per clause changes the complexity class.',
            ro: '2-SAT este în P — rezolvabilă prin componente tari conexe (Kosaraju/Tarjan) în O(n + m). Spre deosebire de 3-SAT, adăugarea unui literal suplimentar per clauză schimbă clasa de complexitate.',
          },
        },
        {
          text: { en: '3-SAT', ro: '3-SAT' },
          correct: false,
          feedback: {
            en: '3-SAT is NP-complete (Cook, 1971). No polynomial algorithm is known, and most researchers believe none exists.',
            ro: '3-SAT este NP-completă (Cook, 1971). Nu se cunoaște niciun algoritm polinomial și cei mai mulți cercetători cred că nu există.',
          },
        },
        {
          text: { en: 'HAMILTONIAN-CIRCUIT', ro: 'HAMILTONIAN-CIRCUIT' },
          correct: false,
          feedback: {
            en: 'HAMILTONIAN-CIRCUIT is NP-complete. Contrast with EULERIAN-CIRCUIT (in P, O(n+m)), which also visits every edge — a small change in what is visited flips the complexity class.',
            ro: 'HAMILTONIAN-CIRCUIT este NP-completă. Contrastați cu EULERIAN-CIRCUIT (în P, O(n+m)), care vizitează fiecare muchie — o mică schimbare a ce se vizitează schimbă clasa de complexitate.',
          },
        },
        {
          text: { en: 'CLIQUE', ro: 'CLIQUE' },
          correct: false,
          feedback: {
            en: 'CLIQUE is NP-complete. Determining if a graph has a clique of size ≥ k requires (as far as we know) exponential time in the worst case.',
            ro: 'CLIQUE este NP-completă. Determinarea dacă un graf are o clică de dimensiune ≥ k necesită (pe cât știm) timp exponențial în cazul cel mai nefavorabil.',
          },
        },
      ],
      explanation: {
        en: '2-SAT ∈ P (SCC-based algorithm, O(n+m)). 3-SAT, HAMILTONIAN-CIRCUIT, and CLIQUE are all NP-complete. The jump from 2-SAT to 3-SAT and from EULER to HAMILTON illustrates how sensitivity to small problem changes can shift complexity class.',
        ro: '2-SAT ∈ P (algoritm bazat pe SCC, O(n+m)). 3-SAT, HAMILTONIAN-CIRCUIT și CLIQUE sunt toate NP-complete. Saltul de la 2-SAT la 3-SAT și de la EULER la HAMILTON ilustrează sensibilitatea față de mici schimbări ale problemei.',
      },
    },
  ];

  /* ─── Problem 2: Karp reduction direction ─── */
  const mc2 = [
    {
      question: {
        en: 'To prove that problem Z is NP-complete, which reduction direction is correct?',
        ro: 'Pentru a dovedi că problema Z este NP-completă, care direcție de reducere este corectă?',
      },
      options: [
        {
          text: {
            en: 'Reduce Z to a known NP-complete problem Y (Z ∝ Y)',
            ro: 'Reducem Z la o problemă NP-completă cunoscută Y (Z ∝ Y)',
          },
          correct: false,
          feedback: {
            en: 'This direction shows Z is no harder than Y (Z is NP-easy), not that Z is hard. To show hardness, you must reduce FROM a hard problem TO Z.',
            ro: 'Această direcție arată că Z nu este mai dificilă decât Y (Z este NP-facile), nu că Z este dificilă. Pentru a arăta dificultatea, trebuie să reduceți DINSPRE o problemă dificilă SPRE Z.',
          },
        },
        {
          text: {
            en: 'Reduce a known NP-complete problem Y to Z (Y ∝ Z), and show Z ∈ NP',
            ro: 'Reducem o problemă NP-completă cunoscută Y la Z (Y ∝ Z), și arătăm că Z ∈ NP',
          },
          correct: true,
          feedback: {
            en: 'Correct. Two steps: (1) show Z ∈ NP (guess + verify in polynomial time); (2) show Y ∝ Z for a known NP-complete Y. By transitivity, all NP problems reduce to Z, making Z NP-hard. Together with step 1, Z is NP-complete.',
            ro: 'Corect. Două etape: (1) arătăm că Z ∈ NP (ghici + verifică în timp polinomial); (2) arătăm că Y ∝ Z pentru un Y NP-complet cunoscut. Prin tranzitivitate, toate problemele NP se reduc la Z, deci Z este NP-dificilă. Împreună cu etapa 1, Z este NP-completă.',
          },
        },
        {
          text: {
            en: 'Show Z ∉ P and therefore Z must be NP-complete',
            ro: 'Arătăm că Z ∉ P și deci Z trebuie să fie NP-completă',
          },
          correct: false,
          feedback: {
            en: 'Z ∉ P does not imply NP-completeness. There could be problems outside P that are not NP-complete (e.g., problems not in NP at all, or NP problems that are not NP-hard). The proof requires an explicit reduction.',
            ro: 'Z ∉ P nu implică NP-completitudine. Ar putea exista probleme în afara lui P care nu sunt NP-complete (de ex., probleme deloc în NP, sau probleme NP care nu sunt NP-dificile). Dovada necesită o reducere explicită.',
          },
        },
        {
          text: {
            en: 'Show Z has no polynomial algorithm by counting the solution space',
            ro: 'Arătăm că Z nu are algoritm polinomial numărând spațiul soluțiilor',
          },
          correct: false,
          feedback: {
            en: 'Counting solutions does not establish NP-completeness. Some problems with exponentially many solutions are in P (e.g., BIPARTIT matching). NP-completeness requires a polynomial reduction, not a counting argument.',
            ro: 'Numărarea soluțiilor nu stabilește NP-completitudinea. Unele probleme cu exponențial de multe soluții sunt în P (de ex., matching BIPARTIT). NP-completitudinea necesită o reducere polinomială, nu un argument de numărare.',
          },
        },
      ],
      explanation: {
        en: 'NP-completeness proof: (1) Z ∈ NP (nondeterministic poly algorithm), (2) Y ∝ Z for known NP-complete Y (reduction from hard to Z). Direction matters: reducing FROM a hard problem TO Z shows Z is at least as hard.',
        ro: 'Dovada NP-completitudinii: (1) Z ∈ NP (algoritm nedeterminist polinomial), (2) Y ∝ Z pentru Y NP-complet cunoscut (reducere dinspre dificil spre Z). Direcția contează: reducerea DINSPRE o problemă dificilă SPRE Z arată că Z este cel puțin la fel de dificilă.',
      },
    },
  ];

  /* ─── Problem 3: NP certificate ─── */
  const mc3 = [
    {
      question: {
        en: 'A problem X is in NP iff there exists a polynomial-time verifier. For SUBSET-SUM, what is the certificate?',
        ro: 'O problemă X este în NP dacă și numai dacă există un verificator în timp polinomial. Pentru SUBSET-SUM, care este certificatul?',
      },
      options: [
        {
          text: {
            en: 'The subset S\' ⊆ S such that Σx∈S\' x = t',
            ro: 'Submulțimea S\' ⊆ S astfel încât Σx∈S\' x = t',
          },
          correct: true,
          feedback: {
            en: 'Given S\' (the certificate), we can verify in polynomial time that S\' ⊆ S and that its sum equals t. This two-phase structure (guess S\', verify) shows SUBSET-SUM ∈ NP.',
            ro: 'Dat S\' (certificatul), putem verifica în timp polinomial că S\' ⊆ S și că suma sa este egală cu t. Această structură în două faze (ghicim S\', verificăm) arată că SUBSET-SUM ∈ NP.',
          },
        },
        {
          text: {
            en: 'The value t itself',
            ro: 'Valoarea t în sine',
          },
          correct: false,
          feedback: {
            en: 't is part of the input, not a certificate. The certificate must be a witness that proves the answer is YES — here, an actual subset summing to t.',
            ro: 't face parte din input, nu este un certificat. Certificatul trebuie să fie un martor care dovedește că răspunsul este DA — aici, un subset real cu suma t.',
          },
        },
        {
          text: {
            en: 'The dynamic programming table of size |S| × t',
            ro: 'Tabelul de programare dinamică de dimensiune |S| × t',
          },
          correct: false,
          feedback: {
            en: 'The DP table is an algorithm for solving the problem, not a certificate. A certificate for an instance (S, t) must be short (polynomial in input size) and easily verifiable.',
            ro: 'Tabelul PD este un algoritm pentru rezolvarea problemei, nu un certificat. Un certificat pentru o instanță (S, t) trebuie să fie scurt (polinomial în dimensiunea inputului) și ușor verificabil.',
          },
        },
        {
          text: {
            en: 'The number of subsets of S',
            ro: 'Numărul de submulțimi ale lui S',
          },
          correct: false,
          feedback: {
            en: 'The number of subsets (2^|S|) does not help verify the YES answer. A certificate must be a concrete witness that makes verification easy.',
            ro: 'Numărul de submulțimi (2^|S|) nu ajută la verificarea răspunsului DA. Un certificat trebuie să fie un martor concret care face verificarea ușoară.',
          },
        },
      ],
      explanation: {
        en: 'For SUBSET-SUM ∈ NP, the certificate is the subset S\' itself. Verification: check S\' ⊆ S and compute Σx∈S\' x — both polynomial in |S|. This is the "guess + verify" structure of NP.',
        ro: 'Pentru SUBSET-SUM ∈ NP, certificatul este chiar submulțimea S\'. Verificare: verificăm că S\' ⊆ S și calculăm Σx∈S\' x — ambele polinomiale în |S|. Aceasta este structura "ghici + verifică" a lui NP.',
      },
    },
  ];

  /* ─── Problem 4: 3-COL NP-completeness proof step ─── */
  const mc4 = [
    {
      question: {
        en: 'In the 3-SAT ∝ 3-COL reduction, what ensures that variable gadget nodes x_i and ¬x_i receive opposite truth values?',
        ro: 'În reducerea 3-SAT ∝ 3-COL, ce garantează că nodurile gadget-ului variabilă x_i și ¬x_i primesc valori de adevăr opuse?',
      },
      options: [
        {
          text: {
            en: 'x_i and ¬x_i are adjacent to each other AND both adjacent to node O',
            ro: 'x_i și ¬x_i sunt adiacente între ele ȘI ambele adiacente cu nodul O',
          },
          correct: true,
          feedback: {
            en: 'Adjacent to O: both nodes cannot use color O, so both must be colored T or F. Adjacent to each other: they must have different colors. Therefore one is T (true) and one is F (false) — exactly modeling a boolean variable and its negation.',
            ro: 'Adiacente cu O: ambele noduri nu pot folosi culoarea O, deci ambele trebuie colorate cu T sau F. Adiacente între ele: trebuie să aibă culori diferite. Deci una este T (adevărat) și alta este F (fals) — modelând exact o variabilă booleană și negarea sa.',
          },
        },
        {
          text: {
            en: 'They are both connected to the T node of the truth gadget',
            ro: 'Ambele sunt conectate la nodul T al truth gadget-ului',
          },
          correct: false,
          feedback: {
            en: 'Connecting both to T would force both to avoid T\'s color — but not force opposite colors between them. The opposite-coloring constraint comes from their adjacency to each other, not from T.',
            ro: 'Conectarea ambelor la T ar forța ambele să evite culoarea lui T — dar nu ar forța culori opuse între ele. Constrângerea de colorare opusă vine din adiacența lor reciprocă, nu din T.',
          },
        },
        {
          text: {
            en: 'They are part of the clause gadget triangles',
            ro: 'Fac parte din triunghiurile clause gadget-ului',
          },
          correct: false,
          feedback: {
            en: 'Clause gadgets (Step 3) handle clause satisfaction. Variable gadgets (Step 2) handle the boolean variable structure. The two gadget types serve different roles.',
            ro: 'Clause gadget-urile (Pasul 3) gestionează satisfacerea clauzelor. Variable gadget-urile (Pasul 2) gestionează structura variabilei booleene. Cele două tipuri de gadget-uri servesc roluri diferite.',
          },
        },
        {
          text: {
            en: 'The reduction forces x_i = true for all variables',
            ro: 'Reducerea forțează x_i = adevărat pentru toate variabilele',
          },
          correct: false,
          feedback: {
            en: 'The reduction does not fix variable values — it encodes all possible truth assignments via 3-colorings. The bijection between truth assignments and 3-colorings is the key, not a forced fixed assignment.',
            ro: 'Reducerea nu fixează valorile variabilelor — codifică toate atribuirile de adevăr posibile prin 3-colorări. Bijecția dintre atribuirile de adevăr și 3-colorări este cheia, nu o atribuire fixă forțată.',
          },
        },
      ],
      explanation: {
        en: 'Variable gadget: x_i adjacent to ¬x_i (must differ in color) and both adjacent to O (cannot use color O). Result: one gets T, the other F — modeling a boolean literal and its complement.',
        ro: 'Variable gadget: x_i adiacent cu ¬x_i (trebuie să difere în culoare) și ambii adiacenți cu O (nu pot folosi culoarea O). Rezultat: unul primește T, celălalt F — modelând un literal boolean și complementul său.',
      },
    },
  ];

  /* ─── Problem 5: Weakly vs Strongly NP-complete ─── */
  const mc5 = [
    {
      question: {
        en: 'SUBSET-SUM has a dynamic programming algorithm running in O(|S| × t). Why is SUBSET-SUM still NP-complete?',
        ro: 'SUBSET-SUM are un algoritm de programare dinamică cu complexitate O(|S| × t). De ce este SUBSET-SUM totuși NP-completă?',
      },
      options: [
        {
          text: {
            en: 'When numbers are given in binary (base 2), t can be exponential in the input size, making O(|S|×t) exponential',
            ro: 'Când numerele sunt date în binar (baza 2), t poate fi exponențial în dimensiunea inputului, făcând O(|S|×t) exponențial',
          },
          correct: true,
          feedback: {
            en: 'The number t requires O(log t) bits in binary. So t = 2^(input_size/log|S|), meaning O(|S|×t) is exponential in the input size when numbers are given in binary. This makes SUBSET-SUM weakly NP-complete: polynomial in unary (base-1) input, NP-complete with binary input.',
            ro: 'Numărul t necesită O(log t) biți în binar. Deci t = 2^(dimensiune_input/log|S|), ceea ce înseamnă că O(|S|×t) este exponențial în dimensiunea inputului când numerele sunt date în binar. Aceasta face SUBSET-SUM weakly NP-completă: polinomială pentru input unar (baza 1), NP-completă cu input binar.',
          },
        },
        {
          text: {
            en: 'The DP algorithm has a bug — it does not correctly solve SUBSET-SUM in all cases',
            ro: 'Algoritmul PD are un bug — nu rezolvă corect SUBSET-SUM în toate cazurile',
          },
          correct: false,
          feedback: {
            en: 'The DP algorithm is correct. The issue is complexity, not correctness: O(|S|×t) is pseudopolynomial — polynomial in the value of t but exponential in the bit-length of t.',
            ro: 'Algoritmul PD este corect. Problema este complexitatea, nu corectitudinea: O(|S|×t) este pseudopolinomial — polinomial în valoarea lui t, dar exponențial în lungimea în biți a lui t.',
          },
        },
        {
          text: {
            en: 'Because |S| is always exponential in n',
            ro: 'Deoarece |S| este întotdeauna exponențial în n',
          },
          correct: false,
          feedback: {
            en: '|S| is the number of elements in S, which is part of the input and can be any size. The NP-completeness issue is specifically about the magnitude of t relative to its bit-representation, not about |S|.',
            ro: '|S| este numărul de elemente din S, care face parte din input și poate fi de orice dimensiune. Problema NP-completitudinii se referă specific la magnitudinea lui t față de reprezentarea sa în biți, nu la |S|.',
          },
        },
        {
          text: {
            en: 'The DP approach cannot handle negative numbers in S',
            ro: 'Abordarea PD nu poate gestiona numere negative în S',
          },
          correct: false,
          feedback: {
            en: 'This is a limitation of a specific DP formulation, not the reason for NP-completeness. SUBSET-SUM remains NP-complete even restricted to positive integers.',
            ro: 'Aceasta este o limitare a unei formulări specifice PD, nu motivul NP-completitudinii. SUBSET-SUM rămâne NP-completă chiar și restrânsă la numere întregi pozitive.',
          },
        },
      ],
      explanation: {
        en: 'SUBSET-SUM DP runs in O(|S|×t) — pseudopolynomial. When t is given in binary, it takes O(log t) bits, so t can be exponential in input size. This makes SUBSET-SUM weakly NP-complete: tractable with unary input, NP-complete with binary input.',
        ro: 'PD pentru SUBSET-SUM rulează în O(|S|×t) — pseudopolinomial. Când t este dat în binar, necesită O(log t) biți, deci t poate fi exponențial în dimensiunea inputului. Aceasta face SUBSET-SUM weakly NP-completă: tractabilă cu input unar, NP-completă cu input binar.',
      },
    },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold" style={{ color: 'var(--theme-heading)' }}>
        {t('Week 9: NP-Complete Problems', 'Săptămâna 9: Probleme NP-complete')}
      </h2>

      {/* Problem 1 */}
      <section>
        <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--theme-heading)' }}>
          {t('Problem 1: P vs NP Classification', 'Problema 1: Clasificare P vs NP')}
        </h3>
        <MultipleChoice questions={mc1} />
      </section>

      {/* Problem 2 */}
      <section>
        <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--theme-heading)' }}>
          {t('Problem 2: NP-completeness Proof Strategy', 'Problema 2: Strategia de demonstrare a NP-completitudinii')}
        </h3>
        <MultipleChoice questions={mc2} />
        <div className="mt-4">
          <Toggle
            question={t(
              'How do you prove 3-COL is NP-complete? Sketch the argument.',
              'Cum demonstrezi că 3-COL este NP-completă? Schițează argumentul.'
            )}
            answer={t(
              '(1) Show 3-COL ∈ NP: nondeterministic algorithm guesses a coloring c[0..n−1] from {0,1,2}, then verifies for all edges (u,v) that c[u] ≠ c[v]. Both phases are polynomial.\n\n(2) Show 3-SAT ∝ 3-COL: given φ in 3-CNF, build graph G (truth gadget + variable gadgets + clause gadgets) in polynomial time such that φ is satisfiable iff G is 3-colorable.\n\nBy transitivity (every NP problem ∝ 3-SAT ∝ 3-COL), 3-COL is NP-hard. Together with 3-COL ∈ NP, it is NP-complete.',
              '(1) Arătăm că 3-COL ∈ NP: algoritmul nedeterminist ghicește o colorare c[0..n−1] din {0,1,2}, apoi verifică pentru toate muchiile (u,v) că c[u] ≠ c[v]. Ambele faze sunt polinomiale.\n\n(2) Arătăm că 3-SAT ∝ 3-COL: dat φ în 3-CNF, construim graful G (truth gadget + variable gadgets + clause gadgets) în timp polinomial astfel încât φ este satisfiabilă dacă și numai dacă G este 3-colorabil.\n\nPrin tranzitivitate (orice problemă NP ∝ 3-SAT ∝ 3-COL), 3-COL este NP-dificilă. Împreună cu 3-COL ∈ NP, este NP-completă.'
            )}
          />
        </div>
      </section>

      {/* Problem 3 */}
      <section>
        <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--theme-heading)' }}>
          {t('Problem 3: NP Certificates', 'Problema 3: Certificate NP')}
        </h3>
        <MultipleChoice questions={mc3} />
      </section>

      {/* Problem 4 */}
      <section>
        <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--theme-heading)' }}>
          {t('Problem 4: 3-SAT ∝ 3-COL — Variable Gadget', 'Problema 4: 3-SAT ∝ 3-COL — Variable Gadget')}
        </h3>
        <MultipleChoice questions={mc4} />
        <div className="mt-4">
          <Toggle
            question={t(
              'Why does the clause gadget in 3-SAT ∝ 3-COL use two chained triangles instead of one?',
              'De ce clause gadget-ul în 3-SAT ∝ 3-COL folosește două triunghiuri înlănțuite în loc de unul?'
            )}
            answer={t(
              'A single triangle simulates a 2-input OR gate: it forces node R to receive color T iff at least one of X, Y has color T. But each clause has THREE literals. Two chained triangles compute (X OR Y) OR Z: the first triangle outputs an intermediate node with the color of (X OR Y), and the second triangle takes that intermediate + Z literal to compute the full clause disjunction. The clause gadget is satisfiable (R can be colored T) iff at least one literal in the clause is true.',
              'Un singur triunghi simulează o poartă OR cu 2 intrări: forțează nodul R să primească culoarea T dacă și numai dacă cel puțin unul din X, Y are culoarea T. Dar fiecare clauză are TREI literali. Două triunghiuri înlănțuite calculează (X SAU Y) SAU Z: primul triunghi produce un nod intermediar cu culoarea lui (X SAU Y), iar al doilea triunghi ia acel intermediar + literalul Z pentru a calcula disjuncția completă a clauzei. Clause gadget-ul este satisfiabil (R poate fi colorat cu T) dacă și numai dacă cel puțin un literal din clauză este adevărat.'
            )}
          />
        </div>
      </section>

      {/* Problem 5 */}
      <section>
        <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--theme-heading)' }}>
          {t('Problem 5: Weakly vs Strongly NP-Complete', 'Problema 5: Weakly vs Strongly NP-complete')}
        </h3>
        <MultipleChoice questions={mc5} />
        <div className="mt-4">
          <Toggle
            question={t(
              'Give one example of a strongly NP-complete problem and explain why it is strongly NP-complete.',
              'Dați un exemplu de problemă strongly NP-completă și explicați de ce este strongly NP-completă.'
            )}
            answer={t(
              'TSP (Travelling Salesman Problem) is strongly NP-complete. It remains NP-complete even when all edge costs are given in unary (base 1). This means no pseudo-polynomial algorithm exists (unless P=NP). The reduction from HAMILTONIAN-CIRCUIT to TSP works even with unit costs (1/2 for present/absent edges), so the hardness is inherent to the problem structure, not to the magnitude of the numbers.',
              'TSP (Travelling Salesman Problem) este strongly NP-completă. Rămâne NP-completă chiar și când toate costurile muchiilor sunt date în unar (baza 1). Aceasta înseamnă că nu există niciun algoritm pseudo-polinomial (dacă P≠NP). Reducerea de la HAMILTONIAN-CIRCUIT la TSP funcționează chiar și cu costuri unitare (1/2 pentru muchii prezente/absente), deci dificultatea este inerentă structurii problemei, nu magnitudinii numerelor.'
            )}
          />
        </div>
      </section>
    </div>
  );
}
