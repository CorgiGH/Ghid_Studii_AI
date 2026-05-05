import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Toggle } from '../../../components/ui';
import MultipleChoice from '../../../components/ui/MultipleChoice';

export default function Seminar09() {
  const { t } = useApp();

  /* ─── Problem 1(a): SUBSET-SUM nondeterministic algorithm ─── */
  const mc1a = [
    {
      question: {
        en: 'What is the certificate (witness) for a SUBSET-SUM instance (S, t) that shows it belongs to NP?',
        ro: 'Care este certificatul (martorul) pentru o instanță SUBSET-SUM (S, t) care arată că aparține lui NP?',
      },
      options: [
        {
          text: {
            en: 'A subset S\' ⊆ S such that Σx∈S\' x = t',
            ro: 'O submulțime S\' ⊆ S astfel încât Σx∈S\' x = t',
          },
          correct: true,
          feedback: {
            en: 'The nondeterministic algorithm guesses S\' ⊆ S (polynomial in |S|), then verifies Σx∈S\' x = t in O(|S|) time. Both steps are polynomial, so SUBSET-SUM ∈ NP.',
            ro: 'Algoritmul nedeterminist ghicește S\' ⊆ S (polinomial în |S|), apoi verifică Σx∈S\' x = t în O(|S|). Ambele etape sunt polinomiale, deci SUBSET-SUM ∈ NP.',
          },
        },
        {
          text: {
            en: 'The value t itself',
            ro: 'Valoarea t în sine',
          },
          correct: false,
          feedback: {
            en: 't is part of the input, not a witness. A certificate must be a concrete object whose correctness can be verified in polynomial time.',
            ro: 't face parte din input, nu este un martor. Un certificat trebuie să fie un obiect concret a cărui corectitudine poate fi verificată în timp polinomial.',
          },
        },
        {
          text: {
            en: 'The dynamic programming table dp[0..|S|][0..t]',
            ro: 'Tabelul de programare dinamică dp[0..|S|][0..t]',
          },
          correct: false,
          feedback: {
            en: 'The DP table is an algorithm artefact for solving the problem, not a short certificate. A certificate must be polynomial in input size; the DP table has size |S|·t which is pseudopolynomial.',
            ro: 'Tabelul DP este un artefact algoritmic pentru rezolvarea problemei, nu un certificat scurt. Un certificat trebuie să fie polinomial în dimensiunea inputului; tabelul DP are dimensiunea |S|·t, care este pseudopolinomială.',
          },
        },
        {
          text: {
            en: 'The number 2^|S| (total number of subsets)',
            ro: 'Numărul 2^|S| (numărul total de submulțimi)',
          },
          correct: false,
          feedback: {
            en: 'This counts the search space but provides no witness for a YES instance. A valid certificate must exhibit an actual subset summing to t.',
            ro: 'Acesta numără spațiul de căutare dar nu furnizează niciun martor pentru o instanță DA. Un certificat valid trebuie să exhibe o submulțime reală cu suma t.',
          },
        },
      ],
      explanation: {
        en: 'SUBSET-SUM ∈ NP: nondeterministically guess a subset S\' ⊆ S, then verify in O(|S|) that its sum equals t. The certificate is the subset S\' itself.',
        ro: 'SUBSET-SUM ∈ NP: ghicim nedeterminist o submulțime S\' ⊆ S, apoi verificăm în O(|S|) că suma sa este egală cu t. Certificatul este chiar submulțimea S\'.',
      },
    },
  ];

  /* ─── Problem 1(b): VERTEX-COVER nondeterministic algorithm ─── */
  const mc1b = [
    {
      question: {
        en: 'For VERTEX-COVER (given graph G and integer k, does G have a vertex cover of size ≤ k?), what does the nondeterministic verification step check?',
        ro: 'Pentru VERTEX-COVER (dat graful G și un întreg k, are G un vertex cover de dimensiune ≤ k?), ce verifică etapa de verificare nedeterministă?',
      },
      options: [
        {
          text: {
            en: 'That the guessed set C ⊆ V has |C| ≤ k, and for every edge (u,v) ∈ E, at least one of u, v is in C',
            ro: 'Că mulțimea ghicită C ⊆ V are |C| ≤ k, și că pentru fiecare muchie (u,v) ∈ E cel puțin unul din u, v este în C',
          },
          correct: true,
          feedback: {
            en: 'Guess C ⊆ V with |C| ≤ k (O(n) bits), then scan all edges to verify coverage. Both in polynomial time. This shows VERTEX-COVER ∈ NP.',
            ro: 'Ghicim C ⊆ V cu |C| ≤ k (O(n) biți), apoi parcurgem toate muchiile pentru a verifica acoperirea. Ambele în timp polinomial. Aceasta arată că VERTEX-COVER ∈ NP.',
          },
        },
        {
          text: {
            en: 'That C is an independent set of size ≥ n − k',
            ro: 'Că C este un set independent de dimensiune ≥ n − k',
          },
          correct: false,
          feedback: {
            en: 'An independent set of size n−k is equivalent (complement of a vertex cover of size k), but the direct verification checks edge coverage by C, not independence of V\\C.',
            ro: 'Un set independent de dimensiune n−k este echivalent (complementul unui vertex cover de dimensiune k), dar verificarea directă verifică acoperirea muchiilor de către C, nu independența lui V\\C.',
          },
        },
        {
          text: {
            en: 'That the maximum degree of G is at most 2k',
            ro: 'Că gradul maxim al lui G este cel mult 2k',
          },
          correct: false,
          feedback: {
            en: 'This is a structural property of G, not the NP certificate. It may relate to approximation bounds but does not constitute a verification of a specific cover.',
            ro: 'Aceasta este o proprietate structurală a lui G, nu certificatul NP. Poate fi legată de limite de aproximare dar nu constituie o verificare a unui cover specific.',
          },
        },
        {
          text: {
            en: 'That every vertex in G has degree ≤ k',
            ro: 'Că fiecare vârf din G are gradul ≤ k',
          },
          correct: false,
          feedback: {
            en: 'This checks a degree condition, not vertex cover membership. A vertex can have high degree and still be in a small cover.',
            ro: 'Aceasta verifică o condiție de grad, nu apartenența la vertex cover. Un vârf poate avea grad mare și totuși să fie într-un cover mic.',
          },
        },
      ],
      explanation: {
        en: 'VERTEX-COVER ∈ NP: guess C ⊆ V with |C| ≤ k, then verify every edge (u,v) ∈ E has u ∈ C or v ∈ C. Both phases run in polynomial time.',
        ro: 'VERTEX-COVER ∈ NP: ghicim C ⊆ V cu |C| ≤ k, apoi verificăm că fiecare muchie (u,v) ∈ E are u ∈ C sau v ∈ C. Ambele faze rulează în timp polinomial.',
      },
    },
  ];

  /* ─── Problem 1(c): 3-COLORABILITY nondeterministic algorithm ─── */
  const mc1c = [
    {
      question: {
        en: 'For 3-COLORABILITY (does graph G have a proper coloring with 3 colors?), what is the nondeterministic polynomial-time algorithm?',
        ro: 'Pentru 3-COLORABILITY (are graful G o colorare proprie cu 3 culori?), care este algoritmul nedeterminist polinomial?',
      },
      options: [
        {
          text: {
            en: 'Guess a coloring c: V → {0, 1, 2}, then verify for every edge (u,v) ∈ E that c(u) ≠ c(v)',
            ro: 'Ghicim o colorare c: V → {0, 1, 2}, apoi verificăm pentru fiecare muchie (u,v) ∈ E că c(u) ≠ c(v)',
          },
          correct: true,
          feedback: {
            en: 'The certificate is the coloring function c (n values from {0,1,2}). Verification scans all |E| edges: O(n + m). Both phases polynomial — 3-COLORABILITY ∈ NP.',
            ro: 'Certificatul este funcția de colorare c (n valori din {0,1,2}). Verificarea parcurge toate |E| muchii: O(n + m). Ambele faze polinomiale — 3-COLORABILITY ∈ NP.',
          },
        },
        {
          text: {
            en: 'Try all 3^n colorings and accept if any is proper',
            ro: 'Încercăm toate cele 3^n colorări și acceptăm dacă vreuna este proprie',
          },
          correct: false,
          feedback: {
            en: 'That is a deterministic exponential-time algorithm, not a nondeterministic polynomial-time one. The nondeterministic version guesses a single coloring in one step.',
            ro: 'Acesta este un algoritm determinist exponențial, nu unul nedeterminist polinomial. Versiunea nedeterministă ghicește o singură colorare într-un singur pas.',
          },
        },
        {
          text: {
            en: 'Compute the chromatic number χ(G) and check χ(G) ≤ 3',
            ro: 'Calculăm numărul cromatic χ(G) și verificăm χ(G) ≤ 3',
          },
          correct: false,
          feedback: {
            en: 'Computing χ(G) is itself NP-hard (at least as hard as 3-COLORABILITY). A nondeterministic algorithm guesses and verifies a witness, it does not solve a harder sub-problem.',
            ro: 'Calcularea χ(G) este ea însăși NP-dificilă (cel puțin la fel de dificilă ca 3-COLORABILITY). Un algoritm nedeterminist ghicește și verifică un martor, nu rezolvă o sub-problemă mai dificilă.',
          },
        },
        {
          text: {
            en: 'Check if G is bipartite, and if yes conclude it is 3-colorable',
            ro: 'Verificăm dacă G este bipartit, și dacă da concluzionăm că este 3-colorabil',
          },
          correct: false,
          feedback: {
            en: 'Bipartite graphs are 2-colorable, hence 3-colorable. But non-bipartite graphs can also be 3-colorable (e.g., a triangle). This check is not a complete characterization of 3-colorability.',
            ro: 'Grafurile bipartite sunt 2-colorabile, deci 3-colorabile. Dar grafurile non-bipartite pot fi și ele 3-colorabile (ex. un triunghi). Această verificare nu este o caracterizare completă a 3-colorabilității.',
          },
        },
      ],
      explanation: {
        en: '3-COLORABILITY ∈ NP: certificate is a coloring c: V → {0,1,2}. Verify in O(n+m) that no two adjacent vertices share a color.',
        ro: '3-COLORABILITY ∈ NP: certificatul este o colorare c: V → {0,1,2}. Verificăm în O(n+m) că niciun vârf adiacent nu are aceeași culoare.',
      },
    },
  ];

  /* ─── Problem 2: 2-colorability is in P ─── */
  const mc2 = [
    {
      question: {
        en: 'Which algorithm proves that 2-colorability (bipartiteness) is in P?',
        ro: 'Care algoritm demonstrează că 2-colorabilitatea (bipartitismul) este în P?',
      },
      options: [
        {
          text: {
            en: 'BFS/DFS that 2-colors the graph level by level; reject if any edge connects two vertices of the same color',
            ro: 'BFS/DFS care colorează graful cu 2 culori nivel cu nivel; respingem dacă vreo muchie conectează două vârfuri de aceeași culoare',
          },
          correct: true,
          feedback: {
            en: 'BFS from any vertex assigns color 0 to even BFS-layers and color 1 to odd layers. If any cross-edge connects two vertices at the same layer, the graph contains an odd cycle and is not bipartite. Runs in O(n + m). This is a polynomial-time decision algorithm, so 2-colorability ∈ P.',
            ro: 'BFS de la orice vârf atribuie culoarea 0 straturilor BFS pare și culoarea 1 straturilor impare. Dacă vreo muchie transversală conectează două vârfuri din același strat, graful conține un ciclu impar și nu este bipartit. Rulează în O(n + m). Acesta este un algoritm de decizie polinomial, deci 2-colorabilitatea ∈ P.',
          },
        },
        {
          text: {
            en: 'Try all 2^n color assignments and accept if any is proper',
            ro: 'Încercăm toate cele 2^n atribuiri de culori și acceptăm dacă vreuna este proprie',
          },
          correct: false,
          feedback: {
            en: 'This is exponential time — it does not prove the problem is in P. The key insight is that BFS/DFS gives a deterministic polynomial-time algorithm.',
            ro: 'Acesta este timp exponențial — nu demonstrează că problema este în P. Ideea cheie este că BFS/DFS dă un algoritm determinist polinomial.',
          },
        },
        {
          text: {
            en: 'Reduce to 2-SAT and solve using SCC decomposition',
            ro: 'Reducem la 2-SAT și rezolvăm folosind descompunerea în SCC',
          },
          correct: false,
          feedback: {
            en: 'While 2-colorability can be encoded as 2-SAT (and 2-SAT ∈ P via SCC), this is indirect. The direct BFS/DFS approach is the canonical proof that 2-colorability ∈ P.',
            ro: 'Deși 2-colorabilitatea poate fi codificată ca 2-SAT (și 2-SAT ∈ P via SCC), aceasta este indirect. Abordarea directă BFS/DFS este demonstrația canonică că 2-colorabilitatea ∈ P.',
          },
        },
        {
          text: {
            en: 'Check if the graph has an Eulerian circuit; if yes, it is 2-colorable',
            ro: 'Verificăm dacă graful are un circuit eulerian; dacă da, este 2-colorabil',
          },
          correct: false,
          feedback: {
            en: 'Eulerian circuits and graph bipartiteness are unrelated properties. A graph can have an Eulerian circuit without being bipartite (e.g., K₃ has an Eulerian circuit but is not bipartite).',
            ro: 'Circuitele euleriene și bipartitismul sunt proprietăți nerelate. Un graf poate avea un circuit eulerian fără a fi bipartit (ex. K₃ are un circuit eulerian dar nu este bipartit).',
          },
        },
      ],
      explanation: {
        en: 'A graph is 2-colorable iff it is bipartite iff it has no odd cycles. BFS/DFS detects this in O(n + m). Since this is a deterministic polynomial-time algorithm, 2-colorability ∈ P.',
        ro: 'Un graf este 2-colorabil dacă și numai dacă este bipartit dacă și numai dacă nu are cicluri impare. BFS/DFS detectează aceasta în O(n + m). Deoarece acesta este un algoritm determinist polinomial, 2-colorabilitatea ∈ P.',
      },
    },
  ];

  /* ─── Problem 3: 2-SAT is in P ─── */
  const mc3 = [
    {
      question: {
        en: 'Which algorithm proves that 2-SAT is in P?',
        ro: 'Care algoritm demonstrează că 2-SAT este în P?',
      },
      options: [
        {
          text: {
            en: 'Build the implication graph, find SCCs via Kosaraju/Tarjan in O(n + m), and check that no variable x_i and its negation ¬x_i are in the same SCC',
            ro: 'Construim graful de implicație, găsim SCC-urile via Kosaraju/Tarjan în O(n + m), și verificăm că nicio variabilă x_i și negarea sa ¬x_i nu sunt în același SCC',
          },
          correct: true,
          feedback: {
            en: 'Each clause (a ∨ b) becomes two implications: ¬a → b and ¬b → a. If x_i and ¬x_i are in the same SCC, we can derive both x_i = true and x_i = false — contradiction, unsatisfiable. Otherwise satisfying assignment exists and can be read from SCC topological order. This runs in O(n + m), so 2-SAT ∈ P.',
            ro: 'Fiecare clauză (a ∨ b) devine două implicații: ¬a → b și ¬b → a. Dacă x_i și ¬x_i sunt în același SCC, putem deduce atât x_i = adevărat cât și x_i = fals — contradicție, nesatisfiabilă. Altfel există o atribuire satisfăcătoare care poate fi citită din ordinea topologică a SCC-urilor. Rulează în O(n + m), deci 2-SAT ∈ P.',
          },
        },
        {
          text: {
            en: 'Try all 2^n truth assignments and check each one in O(m)',
            ro: 'Încercăm toate cele 2^n atribuiri de adevăr și verificăm fiecare în O(m)',
          },
          correct: false,
          feedback: {
            en: 'This is O(2^n · m) — exponential. It shows 2-SAT is decidable, not that it is in P.',
            ro: 'Acesta este O(2^n · m) — exponențial. Arată că 2-SAT este decidabilă, nu că este în P.',
          },
        },
        {
          text: {
            en: 'Reduce 2-SAT to MAX-FLOW and solve with Edmonds-Karp',
            ro: 'Reducem 2-SAT la MAX-FLOW și rezolvăm cu Edmonds-Karp',
          },
          correct: false,
          feedback: {
            en: 'No standard polynomial reduction from 2-SAT to MAX-FLOW is used in this context. The canonical algorithm is SCC-based on the implication graph.',
            ro: 'Nu există nicio reducere polinomială standard de la 2-SAT la MAX-FLOW în acest context. Algoritmul canonic este bazat pe SCC în graful de implicație.',
          },
        },
        {
          text: {
            en: 'Apply unit propagation: set each unit clause, simplify, repeat until done or contradiction',
            ro: 'Aplicăm unit propagation: setăm fiecare clauză unitară, simplificăm, repetăm până la terminare sau contradicție',
          },
          correct: false,
          feedback: {
            en: 'Unit propagation alone does not solve 2-SAT in general — it may not terminate without branching. The polynomial algorithm requires SCC decomposition of the implication graph.',
            ro: 'Unit propagation singur nu rezolvă 2-SAT în general — poate să nu termine fără ramificare. Algoritmul polinomial necesită descompunerea în SCC a grafului de implicație.',
          },
        },
      ],
      explanation: {
        en: '2-SAT ∈ P: build the implication graph (2 implications per clause), compute SCCs in O(n+m) via Kosaraju or Tarjan. Unsatisfiable iff some variable x_i and ¬x_i are in the same SCC. The SCC topological order gives a satisfying assignment otherwise.',
        ro: '2-SAT ∈ P: construim graful de implicație (2 implicații per clauză), calculăm SCC-urile în O(n+m) via Kosaraju sau Tarjan. Nesatisfiabilă dacă și numai dacă o variabilă x_i și ¬x_i sunt în același SCC. Ordinea topologică a SCC-urilor dă o atribuire satisfăcătoare altfel.',
      },
    },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold" style={{ color: 'var(--theme-heading)' }}>
        {t('Seminar 9: NP-completeness', 'Seminar 9: NP Completitudine')}
      </h2>

      {/* Problem 1 */}
      <section id="pa-s9-ndp-algorithms">
        <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--theme-heading)' }}>
          {t(
            'Problem 1: Nondeterministic polynomial-time algorithms',
            'Problema 1: Algoritmi nedeterminiști polinomiali'
          )}
        </h3>
        <p className="mb-4 text-sm" style={{ color: 'var(--theme-text)' }}>
          {t(
            'Give a nondeterministic polynomial-time algorithm for each of the following problems.',
            'Găsiți algoritmi nedeterminiști polinomiali pentru următoarele probleme.'
          )}
        </p>

        {/* 1a SUBSET-SUM */}
        <div className="mb-6" id="pa-s9-subset-sum">
          <h4 className="font-medium mb-2" style={{ color: 'var(--theme-heading)' }}>
            {t('(a) SUBSET-SUM', '(a) SUBSET-SUM')}
          </h4>
          <MultipleChoice questions={mc1a} />
          <div className="mt-3">
            <Toggle
              question={t(
                'Write the nondeterministic algorithm for SUBSET-SUM in pseudocode.',
                'Scrieți algoritmul nedeterminist pentru SUBSET-SUM în pseudocod.'
              )}
              answer={t(
                'NDA-SUBSET-SUM(S, t):\n  S\' := choose(P(S))         // nondeterministically guess any subset of S\n  sum := 0\n  for each x in S\':\n    sum := sum + x\n  return (sum = t)            // polynomial-time verification\n\nThe guess is |S| bits; the verify loop is O(|S|). Total: O(|S|) — polynomial.',
                'NDA-SUBSET-SUM(S, t):\n  S\' := choose(P(S))         // ghicim nedeterminist orice submulțime a lui S\n  sum := 0\n  pentru fiecare x din S\':\n    sum := sum + x\n  returnează (sum = t)        // verificare în timp polinomial\n\nGhicitul este |S| biți; bucla de verificare este O(|S|). Total: O(|S|) — polinomial.'
              )}
            />
          </div>
        </div>

        {/* 1b VERTEX-COVER */}
        <div className="mb-6" id="pa-s9-vertex-cover">
          <h4 className="font-medium mb-2" style={{ color: 'var(--theme-heading)' }}>
            {t('(b) VERTEX-COVER', '(b) VERTEX-COVER')}
          </h4>
          <MultipleChoice questions={mc1b} />
          <div className="mt-3">
            <Toggle
              question={t(
                'Write the nondeterministic algorithm for VERTEX-COVER in pseudocode.',
                'Scrieți algoritmul nedeterminist pentru VERTEX-COVER în pseudocod.'
              )}
              answer={t(
                'NDA-VERTEX-COVER(G=(V,E), k):\n  C := choose(P(V)) with |C| <= k  // guess a set of at most k vertices\n  for each edge (u,v) in E:\n    if u not in C and v not in C:\n      return false               // edge not covered\n  return true\n\nGuess: O(n) bits. Verify: O(m). Both polynomial.',
                'NDA-VERTEX-COVER(G=(V,E), k):\n  C := choose(P(V)) cu |C| <= k    // ghicim o mulțime de cel mult k vârfuri\n  pentru fiecare muchie (u,v) din E:\n    dacă u nu e în C și v nu e în C:\n      returnează false             // muchia nu este acoperită\n  returnează true\n\nGhicit: O(n) biți. Verificare: O(m). Ambele polinomiale.'
              )}
            />
          </div>
        </div>

        {/* 1c 3-COLORABILITY */}
        <div className="mb-6" id="pa-s9-3-colorability">
          <h4 className="font-medium mb-2" style={{ color: 'var(--theme-heading)' }}>
            {t('(c) 3-COLORABILITY', '(c) 3-COLORABILITY')}
          </h4>
          <MultipleChoice questions={mc1c} />
          <div className="mt-3">
            <Toggle
              question={t(
                'Write the nondeterministic algorithm for 3-COLORABILITY in pseudocode.',
                'Scrieți algoritmul nedeterminist pentru 3-COLORABILITY în pseudocod.'
              )}
              answer={t(
                'NDA-3-COL(G=(V,E)):\n  c := choose(function from V to {0,1,2})  // guess a 3-coloring\n  for each edge (u,v) in E:\n    if c[u] = c[v]:\n      return false                            // same color on adjacent vertices\n  return true\n\nGuess: O(n) values. Verify: O(m). Both polynomial.',
                'NDA-3-COL(G=(V,E)):\n  c := choose(funcție de la V la {0,1,2})  // ghicim o 3-colorare\n  pentru fiecare muchie (u,v) din E:\n    dacă c[u] = c[v]:\n      returnează false                         // aceeași culoare pe vârfuri adiacente\n  returnează true\n\nGhicit: O(n) valori. Verificare: O(m). Ambele polinomiale.'
              )}
            />
          </div>
        </div>

        {/* 1d–1f: remaining problems as Toggle only */}
        <div className="mb-6" id="pa-s9-hamiltonian-path">
          <h4 className="font-medium mb-2" style={{ color: 'var(--theme-heading)' }}>
            {t('(d) HAMILTONIAN-PATH', '(d) HAMILTONIAN-PATH')}
          </h4>
          <Toggle
            question={t(
              'Give a nondeterministic polynomial-time algorithm for HAMILTONIAN-PATH.',
              'Dați un algoritm nedeterminist polinomial pentru HAMILTONIAN-PATH.'
            )}
            answer={t(
              'NDA-HAM-PATH(G=(V,E)):\n  π := choose(permutation of V)         // guess an ordering of all n vertices\n  for i := 1 to n-1:\n    if (π[i], π[i+1]) not in E:\n      return false                       // consecutive pair is not an edge\n  return true\n\nCertificate: a permutation π of V (n values). Verification: check n−1 edges in O(n). Both polynomial. Note: HAMILTONIAN-PATH is NP-complete.',
              'NDA-HAM-PATH(G=(V,E)):\n  π := choose(permutare a lui V)        // ghicim o ordonare a tuturor n vârfuri\n  pentru i := 1 la n-1:\n    dacă (π[i], π[i+1]) nu e în E:\n      returnează false                   // perechea consecutivă nu este o muchie\n  returnează true\n\nCertificat: o permutare π a lui V (n valori). Verificare: verificăm n−1 muchii în O(n). Ambele polinomiale. Notă: HAMILTONIAN-PATH este NP-completă.'
            )}
          />
        </div>

        <div className="mb-6" id="pa-s9-hamiltonian-cycle">
          <h4 className="font-medium mb-2" style={{ color: 'var(--theme-heading)' }}>
            {t('(e) HAMILTONIAN-CYCLE', '(e) HAMILTONIAN-CYCLE')}
          </h4>
          <Toggle
            question={t(
              'Give a nondeterministic polynomial-time algorithm for HAMILTONIAN-CYCLE.',
              'Dați un algoritm nedeterminist polinomial pentru HAMILTONIAN-CYCLE.'
            )}
            answer={t(
              'NDA-HAM-CYCLE(G=(V,E)):\n  π := choose(permutation of V)         // guess an ordering of all n vertices\n  for i := 1 to n-1:\n    if (π[i], π[i+1]) not in E:\n      return false\n  if (π[n], π[1]) not in E:             // check closing edge\n    return false\n  return true\n\nSame as HAMILTONIAN-PATH but also checks the closing edge (π[n], π[1]). Runs in O(n). HAMILTONIAN-CYCLE is NP-complete.',
              'NDA-HAM-CYCLE(G=(V,E)):\n  π := choose(permutare a lui V)        // ghicim o ordonare a tuturor n vârfuri\n  pentru i := 1 la n-1:\n    dacă (π[i], π[i+1]) nu e în E:\n      returnează false\n  dacă (π[n], π[1]) nu e în E:          // verificăm muchia de închidere\n    returnează false\n  returnează true\n\nLa fel ca HAMILTONIAN-PATH dar verificăm și muchia de închidere (π[n], π[1]). Rulează în O(n). HAMILTONIAN-CYCLE este NP-completă.'
            )}
          />
        </div>

        <div className="mb-6" id="pa-s9-graph-isomorphism">
          <h4 className="font-medium mb-2" style={{ color: 'var(--theme-heading)' }}>
            {t('(f) GRAPH ISOMORPHISM', '(f) GRAPH ISOMORPHISM')}
          </h4>
          <Toggle
            question={t(
              'Give a nondeterministic polynomial-time algorithm for GRAPH ISOMORPHISM.',
              'Dați un algoritm nedeterminist polinomial pentru GRAPH ISOMORPHISM.'
            )}
            answer={t(
              'NDA-GRAPH-ISO(G₁=(V₁,E₁), G₂=(V₂,E₂)):\n  if |V₁| ≠ |V₂| or |E₁| ≠ |E₂|:\n    return false\n  f := choose(bijection from V₁ to V₂)  // guess a vertex mapping\n  for each edge (u,v) in E₁:\n    if (f(u), f(v)) not in E₂:\n      return false\n  for each edge (u,v) in E₂:\n    if (f⁻¹(u), f⁻¹(v)) not in E₁:\n      return false\n  return true\n\nCertificate: a bijection f (n values). Verification: check all edges in O(n + m). Both polynomial. Note: GRAPH ISOMORPHISM is in NP but its NP-completeness is an open problem.',
              'NDA-GRAPH-ISO(G₁=(V₁,E₁), G₂=(V₂,E₂)):\n  dacă |V₁| ≠ |V₂| sau |E₁| ≠ |E₂|:\n    returnează false\n  f := choose(bijecție de la V₁ la V₂)  // ghicim o mapare de vârfuri\n  pentru fiecare muchie (u,v) din E₁:\n    dacă (f(u), f(v)) nu e în E₂:\n      returnează false\n  pentru fiecare muchie (u,v) din E₂:\n    dacă (f⁻¹(u), f⁻¹(v)) nu e în E₁:\n      returnează false\n  returnează true\n\nCertificat: o bijecție f (n valori). Verificare: verificăm toate muchiile în O(n + m). Ambele polinomiale. Notă: GRAPH ISOMORPHISM este în NP dar NP-completitudinea sa este o problemă deschisă.'
            )}
          />
        </div>
      </section>

      {/* Problem 2 */}
      <section id="pa-s9-2-colorability">
        <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--theme-heading)' }}>
          {t(
            'Problem 2: Prove that the 2-colorability problem is in P',
            'Problema 2: Arătați că problema 2-colorabilității este în P'
          )}
        </h3>
        <MultipleChoice questions={mc2} />
        <div className="mt-4">
          <Toggle
            question={t(
              'Write the full proof that 2-colorability ∈ P.',
              'Scrieți demonstrația completă că 2-colorabilitatea ∈ P.'
            )}
            answer={t(
              'Claim: 2-colorability ∈ P.\n\nProof: We give a deterministic polynomial-time algorithm.\n\nAlgorithm 2-COLOR(G=(V,E)):\n  color := array of size n, initialized to -1 (uncolored)\n  for each unvisited vertex s in V:        // handle disconnected components\n    color[s] := 0\n    queue := {s}\n    while queue is not empty:\n      u := dequeue()\n      for each neighbor v of u:\n        if color[v] = -1:\n          color[v] := 1 - color[u]         // assign opposite color\n          enqueue(v)\n        else if color[v] = color[u]:\n          return false                      // odd cycle detected\n  return true\n\nRuntime: O(n + m) — BFS visits each vertex and edge once.\n\nCorrectness: A graph is 2-colorable iff it is bipartite iff it contains no odd cycles. BFS assigns alternating colors by BFS layer; an edge connecting same-layer vertices implies an odd cycle.\n\nSince this is a deterministic O(n+m) algorithm, 2-colorability ∈ P.',
              'Afirmație: 2-colorabilitatea ∈ P.\n\nDemonstrație: Dăm un algoritm determinist polinomial.\n\nAlgoritm 2-COLOR(G=(V,E)):\n  culoare := tablou de dimensiune n, inițializat cu -1 (necolorat)\n  pentru fiecare vârf nevizitat s din V:   // gestionăm componentele deconectate\n    culoare[s] := 0\n    coadă := {s}\n    cât timp coada nu este goală:\n      u := scoatem din coadă\n      pentru fiecare vecin v al lui u:\n        dacă culoare[v] = -1:\n          culoare[v] := 1 - culoare[u]     // atribuim culoarea opusă\n          adăugăm v în coadă\n        altfel dacă culoare[v] = culoare[u]:\n          returnează false                  // ciclu impar detectat\n  returnează true\n\nTimpul de rulare: O(n + m) — BFS vizitează fiecare vârf și muchie o singură dată.\n\nCorectitudine: Un graf este 2-colorabil dacă și numai dacă este bipartit dacă și numai dacă nu conține cicluri impare. BFS atribuie culori alternante pe niveluri BFS; o muchie ce conectează vârfuri de pe același nivel implică un ciclu impar.\n\nDeoarece acesta este un algoritm determinist O(n+m), 2-colorabilitatea ∈ P.'
            )}
          />
        </div>
      </section>

      {/* Problem 3 */}
      <section id="pa-s9-2-sat">
        <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--theme-heading)' }}>
          {t(
            'Problem 3: Prove that the 2-SAT problem is in P',
            'Problema 3: Arătați că problema 2-SAT este în P'
          )}
        </h3>
        <MultipleChoice questions={mc3} />
        <div className="mt-4">
          <Toggle
            question={t(
              'Write the full proof that 2-SAT ∈ P, including the implication graph construction and SCC algorithm.',
              'Scrieți demonstrația completă că 2-SAT ∈ P, incluzând construcția grafului de implicație și algoritmul SCC.'
            )}
            answer={t(
              'Claim: 2-SAT ∈ P.\n\nStep 1 — Implication graph construction:\nGiven a 2-CNF formula φ with variables x₁,...,xₙ and clauses (a₁ ∨ b₁), ..., (aₘ ∨ bₘ):\n  Nodes: 2n nodes — one per literal: x₁, ¬x₁, x₂, ¬x₂, ..., xₙ, ¬xₙ\n  Edges: for each clause (a ∨ b), add directed edges:\n    ¬a → b  (if a is false, then b must be true)\n    ¬b → a  (if b is false, then a must be true)\nResult: directed graph with 2n nodes and 2m edges.\n\nStep 2 — Compute SCCs:\nRun Kosaraju or Tarjan on the implication graph: O(n + m).\n\nStep 3 — Check satisfiability:\n  φ is UNSAT iff there exists some i such that xᵢ and ¬xᵢ are in the same SCC.\n  (They would force xᵢ = true AND xᵢ = false — contradiction.)\n\nStep 4 — Extract assignment (if SAT):\n  Let scc(v) be the SCC index of literal v in reverse topological order.\n  Set xᵢ := true iff scc(xᵢ) > scc(¬xᵢ).\n  This gives a satisfying assignment.\n\nTotal runtime: O(n + m) — polynomial.\nTherefore 2-SAT ∈ P.',
              'Afirmație: 2-SAT ∈ P.\n\nPasul 1 — Construcția grafului de implicație:\nDat o formulă 2-CNF φ cu variabilele x₁,...,xₙ și clauzele (a₁ ∨ b₁), ..., (aₘ ∨ bₘ):\n  Noduri: 2n noduri — câte unul per literal: x₁, ¬x₁, x₂, ¬x₂, ..., xₙ, ¬xₙ\n  Muchii: pentru fiecare clauză (a ∨ b), adăugăm muchii dirijate:\n    ¬a → b  (dacă a este fals, atunci b trebuie să fie adevărat)\n    ¬b → a  (dacă b este fals, atunci a trebuie să fie adevărat)\nRezultat: graf dirigit cu 2n noduri și 2m muchii.\n\nPasul 2 — Calculăm SCC-urile:\nRulăm Kosaraju sau Tarjan pe graful de implicație: O(n + m).\n\nPasul 3 — Verificăm satisfiabilitatea:\n  φ este NESAT dacă și numai dacă există i astfel încât xᵢ și ¬xᵢ sunt în același SCC.\n  (Ar forța xᵢ = adevărat ȘI xᵢ = fals — contradicție.)\n\nPasul 4 — Extragem atribuirea (dacă SAT):\n  Fie scc(v) indexul SCC al literalului v în ordine topologică inversă.\n  Setăm xᵢ := adevărat dacă și numai dacă scc(xᵢ) > scc(¬xᵢ).\n  Aceasta dă o atribuire satisfăcătoare.\n\nTimpul total: O(n + m) — polinomial.\nPrin urmare 2-SAT ∈ P.'
            )}
          />
        </div>
      </section>
    </div>
  );
}
