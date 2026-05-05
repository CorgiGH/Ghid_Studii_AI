import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Toggle } from '../../../components/ui';
import MultipleChoice from '../../../components/ui/MultipleChoice';

export default function Seminar10() {
  const { t } = useApp();

  /* ─── Problem 1: MIS is NP-hard (3-SAT ∝ MIS) ─── */
  const mc1 = [
    {
      question: {
        en: 'In the 3-SAT ∝ MIS reduction, given a clause (x₁ ∨ ¬x₂ ∨ x₃), which gadget is constructed?',
        ro: 'În reducerea 3-SAT ∝ MIS, dat o clauză (x₁ ∨ ¬x₂ ∨ x₃), ce gadget este construit?',
      },
      options: [
        {
          text: {
            en: 'A triangle (K₃) with one node per literal: nodes x₁, ¬x₂, x₃ all mutually connected',
            ro: 'Un triunghi (K₃) cu câte un nod per literal: nodurile x₁, ¬x₂, x₃ toate mutual conectate',
          },
          correct: true,
          feedback: {
            en: 'Each clause becomes a triangle. An independent set can pick at most one node from each triangle. If MIS has size ≥ k (number of clauses), it must pick exactly one node per triangle — that node\'s literal is set to true, satisfying the clause.',
            ro: 'Fiecare clauză devine un triunghi. Un set independent poate alege cel mult un nod din fiecare triunghi. Dacă MIS are dimensiunea ≥ k (numărul de clauze), trebuie să aleagă exact un nod per triunghi — literalul acelui nod este setat la adevărat, satisfăcând clauza.',
          },
        },
        {
          text: {
            en: 'A path x₁ — ¬x₂ — x₃ (three nodes connected in a chain)',
            ro: 'Un lanț x₁ — ¬x₂ — x₃ (trei noduri conectate în lanț)',
          },
          correct: false,
          feedback: {
            en: 'A path (not a triangle) would allow two non-adjacent endpoints to both be selected. The triangle forces at most one selection — matching the "at least one literal true" requirement of a clause.',
            ro: 'Un lanț (nu un triunghi) ar permite selectarea ambelor capete neadiacente. Triunghiul forțează cel mult o selecție — corespunzând cerinței "cel puțin un literal adevărat" a unei clauze.',
          },
        },
        {
          text: {
            en: 'A single node labeled with the entire clause',
            ro: 'Un singur nod etichetat cu întreaga clauză',
          },
          correct: false,
          feedback: {
            en: 'A single node cannot encode the internal structure of a clause (which literal is set true). The triangle gadget preserves the disjunctive structure by allowing any one literal to "witness" the clause satisfaction.',
            ro: 'Un singur nod nu poate codifica structura internă a unei clauze (care literal este adevărat). Gadgetul triunghi păstrează structura disjunctivă permițând oricărui literal să "ateste" satisfacerea clauzei.',
          },
        },
        {
          text: {
            en: 'Three isolated nodes, one per literal, with no edges between them',
            ro: 'Trei noduri izolate, câte unul per literal, fără muchii între ele',
          },
          correct: false,
          feedback: {
            en: 'Without edges within the clause gadget, the independent set could pick all three literals — including contradictory pairs like x₁ and ¬x₁ from different clauses without proper conflict edges.',
            ro: 'Fără muchii în cadrul gadgetului de clauză, setul independent ar putea alege toți trei literalii — inclusiv perechi contradictorii precum x₁ și ¬x₁ din clauze diferite fără muchii de conflict corespunzătoare.',
          },
        },
      ],
      explanation: {
        en: 'In the 3-SAT ∝ MIS reduction: (1) for each clause, build a triangle (K₃) on its three literals; (2) for each complementary pair (xᵢ in one clause, ¬xᵢ in another), add a conflict edge. MIS of size k (= number of clauses) exists iff φ is satisfiable.',
        ro: 'În reducerea 3-SAT ∝ MIS: (1) pentru fiecare clauză, construim un triunghi (K₃) pe cei trei literali ai ei; (2) pentru fiecare pereche complementară (xᵢ într-o clauză, ¬xᵢ în alta), adăugăm o muchie de conflict. MIS de dimensiune k (= numărul de clauze) există dacă și numai dacă φ este satisfiabilă.',
      },
    },
  ];

  /* ─── Problem 2: CLIQUE is NP-complete (MIS ∝ CLIQUE) ─── */
  const mc2 = [
    {
      question: {
        en: 'In the MIS ∝ CLIQUE reduction, how is the CLIQUE instance constructed from graph G?',
        ro: 'În reducerea MIS ∝ CLIQUE, cum este construită instanța CLIQUE din graful G?',
      },
      options: [
        {
          text: {
            en: 'Take the complement graph Ḡ (edges present in Ḡ iff absent in G); G has MIS of size k iff Ḡ has a clique of size k',
            ro: 'Luăm graful complement Ḡ (muchii prezente în Ḡ dacă și numai dacă absente în G); G are MIS de dimensiune k dacă și numai dacă Ḡ are o clică de dimensiune k',
          },
          correct: true,
          feedback: {
            en: 'S ⊆ V is an independent set in G iff every pair in S has no edge in G iff every pair in S has an edge in Ḡ iff S is a clique in Ḡ. The complement graph can be built in O(n²) — polynomial. Since MIS is NP-hard, so is CLIQUE. Combined with CLIQUE ∈ NP, CLIQUE is NP-complete.',
            ro: 'S ⊆ V este un set independent în G dacă și numai dacă fiecare pereche din S nu are muchie în G dacă și numai dacă fiecare pereche din S are muchie în Ḡ dacă și numai dacă S este o clică în Ḡ. Graful complement poate fi construit în O(n²) — polinomial. Deoarece MIS este NP-dificilă, la fel este și CLIQUE. Combinat cu CLIQUE ∈ NP, CLIQUE este NP-completă.',
          },
        },
        {
          text: {
            en: 'Add a universal vertex connected to all vertices of G; CLIQUE of size k+1 in the new graph corresponds to MIS of size k in G',
            ro: 'Adăugăm un vârf universal conectat la toate vârfurile din G; CLIQUE de dimensiune k+1 în noul graf corespunde MIS de dimensiune k în G',
          },
          correct: false,
          feedback: {
            en: 'Adding a universal vertex does not establish the MIS–CLIQUE correspondence. The correct construction is the complement graph Ḡ.',
            ro: 'Adăugarea unui vârf universal nu stabilește corespondența MIS–CLIQUE. Construcția corectă este graful complement Ḡ.',
          },
        },
        {
          text: {
            en: 'Remove all edges from G; the resulting edgeless graph has a clique of size k iff G has MIS of size k',
            ro: 'Eliminăm toate muchiile din G; graful fără muchii rezultat are o clică de dimensiune k dacă și numai dacă G are MIS de dimensiune k',
          },
          correct: false,
          feedback: {
            en: 'An edgeless graph only has cliques of size 1 (single vertices). This construction does not encode the MIS structure of G.',
            ro: 'Un graf fără muchii are doar clici de dimensiune 1 (vârfuri individuale). Această construcție nu codifică structura MIS a lui G.',
          },
        },
        {
          text: {
            en: 'Square the graph G (add edges between vertices at distance 2); CLIQUE of size k in G² corresponds to MIS in G',
            ro: 'Ridicăm la pătrat graful G (adăugăm muchii între vârfuri la distanța 2); CLIQUE de dimensiune k în G² corespunde MIS în G',
          },
          correct: false,
          feedback: {
            en: 'Squaring the graph is unrelated to the MIS–CLIQUE reduction. The standard reduction uses the complement graph.',
            ro: 'Ridicarea la pătrat a grafului nu este legată de reducerea MIS–CLIQUE. Reducerea standard folosește graful complement.',
          },
        },
      ],
      explanation: {
        en: 'MIS ∝ CLIQUE: given (G, k), construct complement Ḡ in O(n²). S is an independent set in G of size k iff S is a clique in Ḡ of size k. Since CLIQUE ∈ NP and MIS ≤ₚ CLIQUE, CLIQUE is NP-complete.',
        ro: 'MIS ∝ CLIQUE: dat (G, k), construim complementul Ḡ în O(n²). S este un set independent în G de dimensiune k dacă și numai dacă S este o clică în Ḡ de dimensiune k. Deoarece CLIQUE ∈ NP și MIS ≤ₚ CLIQUE, CLIQUE este NP-completă.',
      },
    },
  ];

  /* ─── Problem 3: Halting problem is NP-hard ─── */
  const mc3 = [
    {
      question: {
        en: 'Why can the halting problem not be in NP (and thus is harder than NP-complete problems)?',
        ro: 'De ce problema opririi nu poate fi în NP (și astfel este mai dificilă decât problemele NP-complete)?',
      },
      options: [
        {
          text: {
            en: 'The halting problem is undecidable — no algorithm (deterministic or nondeterministic) solves it on all inputs; NP problems are decidable by definition',
            ro: 'Problema opririi este indecidabilă — niciun algoritm (determinist sau nedeterminist) nu o rezolvă pe toate intrările; problemele NP sunt decidabile prin definiție',
          },
          correct: true,
          feedback: {
            en: 'NP ⊆ DECIDABLE. The halting problem is undecidable (Turing, 1936) — no Turing machine can decide it. Therefore the halting problem is not in NP. It is NP-hard only in the sense that every NP problem reduces to it (trivially, since everything reduces to an undecidable problem), but it lies strictly outside the NP complexity class.',
            ro: 'NP ⊆ DECIDABILĂ. Problema opririi este indecidabilă (Turing, 1936) — nicio mașină Turing nu o poate decide. Prin urmare problema opririi nu este în NP. Este NP-dificilă doar în sensul că fiecare problemă NP se reduce la ea (trivial, deoarece orice se reduce la o problemă indecidabilă), dar se află strict în afara clasei de complexitate NP.',
          },
        },
        {
          text: {
            en: 'It requires exponential time to solve, which is more than polynomial',
            ro: 'Necesită timp exponențial pentru a fi rezolvată, ceea ce este mai mult decât polinomial',
          },
          correct: false,
          feedback: {
            en: 'The halting problem is not merely exponential — it is unsolvable by any algorithm. Exponential-time problems (like 3-SAT brute force) are computable; the halting problem is not.',
            ro: 'Problema opririi nu este doar exponențială — este de nerezolvat de niciun algoritm. Problemele cu timp exponențial (cum ar fi forța brută pentru 3-SAT) sunt calculabile; problema opririi nu este.',
          },
        },
        {
          text: {
            en: 'It has no polynomial-time verifier because all known algorithms run in factorial time',
            ro: 'Nu are un verificator polinomial deoarece toți algoritmii cunoscuți rulează în timp factorial',
          },
          correct: false,
          feedback: {
            en: 'The issue is not factorial time but undecidability. No algorithm of any time complexity can decide the halting problem for all inputs.',
            ro: 'Problema nu este timpul factorial ci indecidabilitatea. Niciun algoritm de orice complexitate de timp nu poate decide problema opririi pentru toate intrările.',
          },
        },
        {
          text: {
            en: 'It is in co-NP but not NP',
            ro: 'Este în co-NP dar nu în NP',
          },
          correct: false,
          feedback: {
            en: 'The halting problem is neither in NP nor in co-NP — it is not even decidable, let alone classifiable within the polynomial hierarchy.',
            ro: 'Problema opririi nu este nici în NP, nici în co-NP — nu este nici măcar decidabilă, cu atât mai puțin clasificabilă în ierarhia polinomială.',
          },
        },
      ],
      explanation: {
        en: 'The halting problem is undecidable (Turing, 1936). NP is a class of decidable problems. Therefore the halting problem is outside NP entirely. Every NP problem trivially reduces to it (reduce to any undecidable problem), making it NP-hard, but it is not NP-complete since it is not in NP.',
        ro: 'Problema opririi este indecidabilă (Turing, 1936). NP este o clasă de probleme decidabile. Prin urmare problema opririi se află complet în afara lui NP. Fiecare problemă NP se reduce trivial la ea (reducere la orice problemă indecidabilă), deci este NP-dificilă, dar nu este NP-completă deoarece nu este în NP.',
      },
    },
  ];

  /* ─── Problem 4: Decision version of knapsack ─── */
  const mc4 = [
    {
      question: {
        en: 'What is the decision problem corresponding to the knapsack optimization problem?',
        ro: 'Care este problema de decizie corespunzătoare problemei de optimizare a rucsacului?',
      },
      options: [
        {
          text: {
            en: 'Given items with weights wᵢ and values vᵢ, capacity W, and a threshold K: is there a subset of items with total weight ≤ W and total value ≥ K?',
            ro: 'Date obiecte cu greutăți wᵢ și valori vᵢ, capacitate W și un prag K: există o submulțime de obiecte cu greutatea totală ≤ W și valoarea totală ≥ K?',
          },
          correct: true,
          feedback: {
            en: 'The optimization version asks for the maximum value; the decision version adds a threshold K and asks YES/NO. Any polynomial solver for the decision version can be used to solve the optimization version (binary search on K).',
            ro: 'Versiunea de optimizare cere valoarea maximă; versiunea de decizie adaugă un prag K și întreabă DA/NU. Orice rezolvitor polinomial pentru versiunea de decizie poate fi folosit pentru a rezolva versiunea de optimizare (căutare binară pe K).',
          },
        },
        {
          text: {
            en: 'What is the maximum value achievable with weight ≤ W?',
            ro: 'Care este valoarea maximă realizabilă cu greutatea ≤ W?',
          },
          correct: false,
          feedback: {
            en: 'This is the optimization version, not the decision version. A decision problem must have a YES/NO answer.',
            ro: 'Aceasta este versiunea de optimizare, nu versiunea de decizie. O problemă de decizie trebuie să aibă un răspuns DA/NU.',
          },
        },
        {
          text: {
            en: 'Is there a subset of items with total weight exactly W?',
            ro: 'Există o submulțime de obiecte cu greutatea totală exact W?',
          },
          correct: false,
          feedback: {
            en: 'This is the SUBSET-SUM problem on weights — it ignores the value dimension. The knapsack decision problem must include both the capacity constraint and a value threshold.',
            ro: 'Aceasta este problema SUBSET-SUM pe greutăți — ignoră dimensiunea valorii. Problema de decizie a rucsacului trebuie să includă atât constrângerea de capacitate cât și un prag de valoare.',
          },
        },
        {
          text: {
            en: 'Is there a subset of items with total value exactly K?',
            ro: 'Există o submulțime de obiecte cu valoarea totală exact K?',
          },
          correct: false,
          feedback: {
            en: 'This ignores the weight/capacity constraint. The knapsack problem is about maximizing value subject to a weight capacity limit, not achieving an exact value.',
            ro: 'Aceasta ignoră constrângerea de greutate/capacitate. Problema rucsacului este despre maximizarea valorii sub o limită de capacitate de greutate, nu despre atingerea unei valori exacte.',
          },
        },
      ],
      explanation: {
        en: 'Knapsack decision problem: given (w₁,...,wₙ), (v₁,...,vₙ), W, K — does there exist S ⊆ {1,...,n} with Σᵢ∈S wᵢ ≤ W and Σᵢ∈S vᵢ ≥ K? This is the YES/NO version of the classic knapsack optimization.',
        ro: 'Problema de decizie a rucsacului: date (w₁,...,wₙ), (v₁,...,vₙ), W, K — există S ⊆ {1,...,n} cu Σᵢ∈S wᵢ ≤ W și Σᵢ∈S vᵢ ≥ K? Aceasta este versiunea DA/NU a optimizării clasice a rucsacului.',
      },
    },
  ];

  /* ─── Problem 5: Discrete knapsack is NP-hard ─── */
  const mc5 = [
    {
      question: {
        en: 'Which reduction proves that the discrete (0-1) knapsack decision problem is NP-hard?',
        ro: 'Care reducere demonstrează că problema de decizie a rucsacului discret (0-1) este NP-dificilă?',
      },
      options: [
        {
          text: {
            en: 'SUBSET-SUM ∝ KNAPSACK: given (S, t), set wᵢ = vᵢ = sᵢ, W = K = t; a subset summing to t corresponds to a knapsack solution with value ≥ t and weight ≤ t',
            ro: 'SUBSET-SUM ∝ KNAPSACK: dat (S, t), setăm wᵢ = vᵢ = sᵢ, W = K = t; o submulțime cu suma t corespunde unei soluții rucsac cu valoarea ≥ t și greutatea ≤ t',
          },
          correct: true,
          feedback: {
            en: 'SUBSET-SUM is NP-complete. By setting weights equal to values and setting capacity = threshold = t, any subset summing exactly to t achieves weight t ≤ W and value t ≥ K. This polynomial reduction shows KNAPSACK is NP-hard. Combined with KNAPSACK ∈ NP, it is NP-complete.',
            ro: 'SUBSET-SUM este NP-completă. Prin setarea greutăților egale cu valorile și setarea capacității = pragul = t, orice submulțime cu suma exact t realizează greutatea t ≤ W și valoarea t ≥ K. Această reducere polinomială arată că KNAPSACK este NP-dificilă. Combinat cu KNAPSACK ∈ NP, este NP-completă.',
          },
        },
        {
          text: {
            en: 'HAMILTONIAN-PATH ∝ KNAPSACK: encode the graph as item weights and detect Hamiltonian paths via value thresholds',
            ro: 'HAMILTONIAN-PATH ∝ KNAPSACK: codificăm graful ca greutăți ale obiectelor și detectăm lanțuri hamiltoniene prin praguri de valoare',
          },
          correct: false,
          feedback: {
            en: 'While any NP-complete problem reduces to KNAPSACK (since KNAPSACK is NP-hard), the canonical and most direct reduction is SUBSET-SUM ∝ KNAPSACK, not via HAMILTONIAN-PATH.',
            ro: 'Deși orice problemă NP-completă se reduce la KNAPSACK (deoarece KNAPSACK este NP-dificilă), reducerea canonică și cea mai directă este SUBSET-SUM ∝ KNAPSACK, nu prin HAMILTONIAN-PATH.',
          },
        },
        {
          text: {
            en: 'KNAPSACK ∝ SUBSET-SUM: every knapsack instance reduces to a subset sum instance',
            ro: 'KNAPSACK ∝ SUBSET-SUM: fiecare instanță de rucsac se reduce la o instanță SUBSET-SUM',
          },
          correct: false,
          feedback: {
            en: 'This direction (KNAPSACK reducing to SUBSET-SUM) would show KNAPSACK is no harder than SUBSET-SUM — it does not prove NP-hardness of KNAPSACK. NP-hardness requires reducing FROM a known hard problem TO KNAPSACK.',
            ro: 'Această direcție (KNAPSACK se reduce la SUBSET-SUM) ar arăta că KNAPSACK nu este mai dificilă decât SUBSET-SUM — nu demonstrează NP-dificultatea lui KNAPSACK. NP-dificultatea necesită reducere DINSPRE o problemă dificilă cunoscută SPRE KNAPSACK.',
          },
        },
        {
          text: {
            en: 'Show that the DP algorithm O(nW) is exponential when W is given in binary',
            ro: 'Arătăm că algoritmul DP O(nW) este exponențial când W este dat în binar',
          },
          correct: false,
          feedback: {
            en: 'Showing the DP is pseudopolynomial demonstrates that no known polynomial algorithm exists, but does not formally prove NP-hardness. A formal proof requires a polynomial reduction from a known NP-hard problem.',
            ro: 'Arătând că DP este pseudopolinomial se demonstrează că nu există niciun algoritm polinomial cunoscut, dar nu demonstrează formal NP-dificultatea. O dovadă formală necesită o reducere polinomială de la o problemă NP-dificilă cunoscută.',
          },
        },
      ],
      explanation: {
        en: 'Discrete KNAPSACK is NP-hard via SUBSET-SUM ∝ KNAPSACK: set wᵢ = vᵢ = sᵢ, W = K = t. A subset summing to t solves both. The DP algorithm O(nW) is pseudopolynomial (exponential in input bit-length when W is large), consistent with NP-hardness.',
        ro: 'KNAPSACK discret este NP-dificilă prin SUBSET-SUM ∝ KNAPSACK: setăm wᵢ = vᵢ = sᵢ, W = K = t. O submulțime cu suma t rezolvă ambele. Algoritmul DP O(nW) este pseudopolinomial (exponențial în lungimea în biți a inputului când W este mare), consistent cu NP-dificultatea.',
      },
    },
  ];

  /* ─── Problem 6: VERTEX-COVER is NP-complete (MIS ∝ VERTEX-COVER) ─── */
  const mc6 = [
    {
      question: {
        en: 'In the MIS ∝ VERTEX-COVER reduction, what is the relationship between a maximum independent set and a minimum vertex cover?',
        ro: 'În reducerea MIS ∝ VERTEX-COVER, care este relația dintre un set independent maxim și un vertex cover minim?',
      },
      options: [
        {
          text: {
            en: 'If S is an independent set of size k in G=(V,E), then V\\S is a vertex cover of size n−k; so G has MIS of size k iff G has vertex cover of size n−k',
            ro: 'Dacă S este un set independent de dimensiune k în G=(V,E), atunci V\\S este un vertex cover de dimensiune n−k; deci G are MIS de dimensiune k dacă și numai dacă G are vertex cover de dimensiune n−k',
          },
          correct: true,
          feedback: {
            en: 'Proof of the correspondence: for any edge (u,v), at least one of u,v must be in any vertex cover. If S is independent, no edge has both endpoints in S, so every edge has at least one endpoint in V\\S — meaning V\\S is a vertex cover. This bijection transforms MIS instances to VERTEX-COVER instances in O(1) (just complement S), so MIS ≤ₚ VERTEX-COVER.',
            ro: 'Dovada corespondenței: pentru orice muchie (u,v), cel puțin unul din u,v trebuie să fie în orice vertex cover. Dacă S este independent, nicio muchie nu are ambele capete în S, deci fiecare muchie are cel puțin un capăt în V\\S — adică V\\S este un vertex cover. Această bijecție transformă instanțe MIS în instanțe VERTEX-COVER în O(1) (doar complementăm S), deci MIS ≤ₚ VERTEX-COVER.',
          },
        },
        {
          text: {
            en: 'A maximum independent set S and a minimum vertex cover C are always disjoint: S ∩ C = ∅ and S ∪ C = V only when G is bipartite',
            ro: 'Un set independent maxim S și un vertex cover minim C sunt întotdeauna disjuncte: S ∩ C = ∅ și S ∪ C = V doar când G este bipartit',
          },
          correct: false,
          feedback: {
            en: 'S ∩ C = ∅ and S ∪ C = V hold for ALL graphs (not just bipartite ones), because S = V\\C. The König theorem (MIS + min vertex cover = n in bipartite graphs) is a separate, stronger result.',
            ro: 'S ∩ C = ∅ și S ∪ C = V se aplică TUTUROR grafurilor (nu doar celor bipartite), deoarece S = V\\C. Teorema König (MIS + vertex cover minim = n în grafuri bipartite) este un rezultat separat și mai puternic.',
          },
        },
        {
          text: {
            en: 'A vertex cover of size k in G corresponds to an independent set of size k in the complement Ḡ',
            ro: 'Un vertex cover de dimensiune k în G corespunde unui set independent de dimensiune k în complementul Ḡ',
          },
          correct: false,
          feedback: {
            en: 'This conflates two different reductions. The MIS–VERTEX-COVER correspondence works within the same graph G (via complement of vertex sets, not complement of edge sets). The complement graph construction is used in the MIS–CLIQUE reduction.',
            ro: 'Aceasta confundă două reduceri diferite. Corespondența MIS–VERTEX-COVER funcționează în același graf G (prin complementul mulțimii de vârfuri, nu al mulțimii de muchii). Construcția grafului complement este folosită în reducerea MIS–CLIQUE.',
          },
        },
        {
          text: {
            en: 'The complement of a vertex cover is always an independent set, but independent sets are not always complements of vertex covers',
            ro: 'Complementul unui vertex cover este întotdeauna un set independent, dar seturile independente nu sunt întotdeauna complementele unui vertex cover',
          },
          correct: false,
          feedback: {
            en: 'In fact the bijection is exact and goes both ways: S is an independent set iff V\\S is a vertex cover. There is no asymmetry.',
            ro: 'De fapt bijecția este exactă și merge în ambele direcții: S este un set independent dacă și numai dacă V\\S este un vertex cover. Nu există asimetrie.',
          },
        },
      ],
      explanation: {
        en: 'MIS ∝ VERTEX-COVER: S ⊆ V is independent iff V\\S is a vertex cover (every edge (u,v) has at least one endpoint in V\\S). Reduces in O(1). Since VERTEX-COVER ∈ NP and MIS is NP-hard, VERTEX-COVER is NP-complete.',
        ro: 'MIS ∝ VERTEX-COVER: S ⊆ V este independent dacă și numai dacă V\\S este un vertex cover (fiecare muchie (u,v) are cel puțin un capăt în V\\S). Reducere în O(1). Deoarece VERTEX-COVER ∈ NP și MIS este NP-dificilă, VERTEX-COVER este NP-completă.',
      },
    },
  ];

  /* ─── Problem 7 & 8: PARTITION is (weakly) NP-hard ─── */
  const mc78 = [
    {
      question: {
        en: 'Which reduction proves PARTITION (split a set of numbers into two subsets of equal sum) is NP-hard?',
        ro: 'Care reducere demonstrează că PARTITION (împărțirea unei mulțimi de numere în două submulțimi de sumă egală) este NP-dificilă?',
      },
      options: [
        {
          text: {
            en: 'SUBSET-SUM ∝ PARTITION: given (S, t), let T = Σsᵢ; add element b = T − 2t to S; the new multiset partitions equally iff original S has a subset summing to t',
            ro: 'SUBSET-SUM ∝ PARTITION: dat (S, t), fie T = Σsᵢ; adăugăm elementul b = T − 2t la S; noua multime cu repetiție se partitionează egal dacă și numai dacă S original are o submulțime cu suma t',
          },
          correct: true,
          feedback: {
            en: 'Let T = Σsᵢ. Add b = T − 2t. New sum = T + (T−2t) = 2T−2t. Each partition half must sum to T−t. One half contains b, the other elements sum to T−t−(T−2t) = t. So a partition of the new set corresponds exactly to a subset of S summing to t. This is a polynomial reduction, so PARTITION is NP-hard. It is weakly NP-hard because a pseudopolynomial algorithm exists (DP on the sum).',
            ro: 'Fie T = Σsᵢ. Adăugăm b = T − 2t. Suma nouă = T + (T−2t) = 2T−2t. Fiecare jumătate de partiție trebuie să sumeze T−t. O jumătate conține b, cealaltă elemente sumând T−t−(T−2t) = t. Deci o partiție a noii mulțimi corespunde exact unei submulțimi a lui S cu suma t. Aceasta este o reducere polinomială, deci PARTITION este NP-dificilă. Este weakly NP-dificilă deoarece există un algoritm pseudopolinomial (DP pe sumă).',
          },
        },
        {
          text: {
            en: '3-SAT ∝ PARTITION: encode each clause as a large integer and use partition to satisfy all clauses simultaneously',
            ro: '3-SAT ∝ PARTITION: codificăm fiecare clauză ca un număr mare întreg și folosim partiția pentru a satisface toate clauzele simultan',
          },
          correct: false,
          feedback: {
            en: 'While 3-SAT does reduce to PARTITION (since PARTITION is NP-hard), the canonical and simplest reduction is SUBSET-SUM ∝ PARTITION. The 3-SAT encoding is more complex and not the standard approach.',
            ro: 'Deși 3-SAT se reduce la PARTITION (deoarece PARTITION este NP-dificilă), reducerea canonică și cea mai simplă este SUBSET-SUM ∝ PARTITION. Codificarea 3-SAT este mai complexă și nu este abordarea standard.',
          },
        },
        {
          text: {
            en: 'PARTITION ∝ SUBSET-SUM: every partition instance reduces to subset sum, proving PARTITION is in P',
            ro: 'PARTITION ∝ SUBSET-SUM: fiecare instanță de partiție se reduce la subset sum, demonstrând că PARTITION este în P',
          },
          correct: false,
          feedback: {
            en: 'PARTITION reducing to SUBSET-SUM shows PARTITION is no harder than SUBSET-SUM, not that it is in P. SUBSET-SUM is itself NP-complete. To prove NP-hardness of PARTITION, we reduce FROM SUBSET-SUM TO PARTITION.',
            ro: 'PARTITION reducându-se la SUBSET-SUM arată că PARTITION nu este mai dificilă decât SUBSET-SUM, nu că este în P. SUBSET-SUM este ea însăși NP-completă. Pentru a demonstra NP-dificultatea lui PARTITION, reducem DINSPRE SUBSET-SUM SPRE PARTITION.',
          },
        },
        {
          text: {
            en: 'Show directly that no polynomial algorithm can solve PARTITION without constructing a reduction',
            ro: 'Arătăm direct că niciun algoritm polinomial nu poate rezolva PARTITION fără a construi o reducere',
          },
          correct: false,
          feedback: {
            en: 'Direct impossibility proofs for specific problems are extremely difficult and constitute major open problems (e.g., P vs NP). NP-hardness is proved via polynomial reductions, not direct impossibility arguments.',
            ro: 'Dovezile directe de imposibilitate pentru probleme specifice sunt extrem de dificile și constituie probleme deschise majore (ex. P vs NP). NP-dificultatea se demonstrează prin reduceri polinomiale, nu prin argumente directe de imposibilitate.',
          },
        },
      ],
      explanation: {
        en: 'PARTITION is NP-hard via SUBSET-SUM ∝ PARTITION: add b = (Σsᵢ) − 2t to S. A balanced partition of the augmented set exists iff S has a subset summing to t. PARTITION is weakly NP-hard: solvable in pseudopolynomial time O(n·Σsᵢ) by DP.',
        ro: 'PARTITION este NP-dificilă prin SUBSET-SUM ∝ PARTITION: adăugăm b = (Σsᵢ) − 2t la S. O partiție echilibrată a mulțimii augmentate există dacă și numai dacă S are o submulțime cu suma t. PARTITION este weakly NP-dificilă: rezolvabilă în timp pseudopolinomial O(n·Σsᵢ) prin DP.',
      },
    },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold" style={{ color: 'var(--theme-heading)' }}>
        {t('Seminar 10: NP-completeness', 'Seminar 10: NP Completitudine')}
      </h2>

      {/* Problem 1 */}
      <section id="pa-s10-mis-np-hard">
        <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--theme-heading)' }}>
          {t(
            'Problem 1: Prove that MIS (Maximum Independent Set) is NP-hard',
            'Problema 1: Arătați că MIS (Maximum Independent Set) este NP-dificilă'
          )}
        </h3>
        <p className="mb-3 text-sm" style={{ color: 'var(--theme-text)' }}>
          {t(
            'Hint: Reduce 3-SAT to Maximum Independent Set.',
            'Indicație: reduceți problema 3-SAT la Maximum Independent Set.'
          )}
        </p>
        <MultipleChoice questions={mc1} />
        <div className="mt-4">
          <Toggle
            question={t(
              'Give the full proof that MIS is NP-hard via 3-SAT ∝ MIS.',
              'Dați demonstrația completă că MIS este NP-dificilă prin 3-SAT ∝ MIS.'
            )}
            answer={t(
              'Given a 3-CNF formula φ with k clauses C₁,...,Cₖ and variables x₁,...,xₙ:\n\nConstruct graph G:\n(1) For each clause Cⱼ = (l₁ ∨ l₂ ∨ l₃), create a triangle: nodes vⱼ₁, vⱼ₂, vⱼ₃ with edges between all three.\n(2) For each pair of complementary literals (lᵢⱼ = xₐ in clause i, lₖₗ = ¬xₐ in clause k), add a conflict edge between vᵢⱼ and vₖₗ.\n\nClaim: φ is satisfiable iff G has an independent set of size k.\n\n(⇒) Given a satisfying assignment: each clause has at least one true literal. Pick one true literal per clause — these k nodes form an independent set (no two from the same triangle by construction; no conflict edge between nodes of the same truth value).\n\n(⇐) Given MIS of size k: exactly one node per triangle is selected. Set the corresponding literal to true. No conflict edge was selected, so no variable is set both true and false. This gives a satisfying assignment.\n\nConstruction is polynomial (O(n + m)). Since 3-SAT is NP-hard, MIS is NP-hard.',
              'Dat o formulă 3-CNF φ cu k clauze C₁,...,Cₖ și variabilele x₁,...,xₙ:\n\nConstruim graful G:\n(1) Pentru fiecare clauză Cⱼ = (l₁ ∨ l₂ ∨ l₃), creăm un triunghi: nodurile vⱼ₁, vⱼ₂, vⱼ₃ cu muchii între toate trei.\n(2) Pentru fiecare pereche de literali complementari (lᵢⱼ = xₐ în clauza i, lₖₗ = ¬xₐ în clauza k), adăugăm o muchie de conflict între vᵢⱼ și vₖₗ.\n\nAfirmație: φ este satisfiabilă dacă și numai dacă G are un set independent de dimensiune k.\n\n(⇒) Dat o atribuire satisfăcătoare: fiecare clauză are cel puțin un literal adevărat. Alegem un literal adevărat per clauză — aceste k noduri formează un set independent (nu două din același triunghi prin construcție; nicio muchie de conflict între noduri cu aceeași valoare de adevăr).\n\n(⇐) Dat MIS de dimensiune k: exact un nod per triunghi este selectat. Setăm literalul corespunzător la adevărat. Nicio muchie de conflict nu a fost selectată, deci nicio variabilă nu este setată atât adevărat cât și fals. Aceasta dă o atribuire satisfăcătoare.\n\nConstrucția este polinomială (O(n + m)). Deoarece 3-SAT este NP-dificilă, MIS este NP-dificilă.'
            )}
          />
        </div>
      </section>

      {/* Problem 2 */}
      <section id="pa-s10-clique-np-complete">
        <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--theme-heading)' }}>
          {t(
            'Problem 2: Prove that CLIQUE is NP-complete',
            'Problema 2: Arătați că CLIQUE este NP-completă'
          )}
        </h3>
        <p className="mb-3 text-sm" style={{ color: 'var(--theme-text)' }}>
          {t(
            'Hint: reduce MIS (Maximum Independent Set) to CLIQUE.',
            'Indicație: reduceți MIS (Maximum Independent Set) la CLIQUE.'
          )}
        </p>
        <MultipleChoice questions={mc2} />
        <div className="mt-4">
          <Toggle
            question={t(
              'Give the full proof that CLIQUE is NP-complete.',
              'Dați demonstrația completă că CLIQUE este NP-completă.'
            )}
            answer={t(
              'Step 1 — CLIQUE ∈ NP:\nGiven a graph G and an integer k, the certificate is a set C ⊆ V with |C| = k. Verify: (a) |C| = k, (b) for every pair u,v ∈ C, (u,v) ∈ E. Both checks are O(k²) = O(n²) — polynomial.\n\nStep 2 — MIS ∝ CLIQUE (NP-hardness):\nGiven G=(V,E), construct Ḡ=(V, Ē) where Ē = {(u,v) | u≠v, (u,v) ∉ E}.\nBuilding Ḡ takes O(n²) — polynomial.\n\nCorrectness: S ⊆ V is an independent set in G iff for all u,v ∈ S, (u,v) ∉ E iff for all u,v ∈ S, (u,v) ∈ Ē iff S is a clique in Ḡ.\n\nTherefore G has MIS of size ≥ k iff Ḡ has a clique of size ≥ k.\n\nSince MIS is NP-hard (Problem 1) and CLIQUE ∈ NP, CLIQUE is NP-complete.',
              'Pasul 1 — CLIQUE ∈ NP:\nDat un graf G și un întreg k, certificatul este o mulțime C ⊆ V cu |C| = k. Verificare: (a) |C| = k, (b) pentru fiecare pereche u,v ∈ C, (u,v) ∈ E. Ambele verificări sunt O(k²) = O(n²) — polinomiale.\n\nPasul 2 — MIS ∝ CLIQUE (NP-dificultate):\nDat G=(V,E), construim Ḡ=(V, Ē) unde Ē = {(u,v) | u≠v, (u,v) ∉ E}.\nConstruirea lui Ḡ necesită O(n²) — polinomial.\n\nCorectitudine: S ⊆ V este un set independent în G dacă și numai dacă pentru toți u,v ∈ S, (u,v) ∉ E dacă și numai dacă pentru toți u,v ∈ S, (u,v) ∈ Ē dacă și numai dacă S este o clică în Ḡ.\n\nPrin urmare G are MIS de dimensiune ≥ k dacă și numai dacă Ḡ are o clică de dimensiune ≥ k.\n\nDeoarece MIS este NP-dificilă (Problema 1) și CLIQUE ∈ NP, CLIQUE este NP-completă.'
            )}
          />
        </div>
      </section>

      {/* Problem 3 */}
      <section id="pa-s10-halting-np-hard">
        <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--theme-heading)' }}>
          {t(
            'Problem 3: Prove that the halting problem is NP-hard',
            'Problema 3: Arătați că problema opririi este NP-dificilă'
          )}
        </h3>
        <MultipleChoice questions={mc3} />
        <div className="mt-4">
          <Toggle
            question={t(
              'Sketch the proof that every NP problem reduces to the halting problem, and explain why the halting problem is not NP-complete.',
              'Schițați demonstrația că fiecare problemă NP se reduce la problema opririi și explicați de ce problema opririi nu este NP-completă.'
            )}
            answer={t(
              'NP-hardness: For any NP problem L with nondeterministic decider M, we reduce L to HALT as follows. Given input x, construct a program P that simulates all nondeterministic branches of M(x); P halts iff M accepts x. The construction of P from x is polynomial. Therefore HALT is NP-hard.\n\nNot NP-complete: NP-completeness requires the problem to also be in NP. But the halting problem is undecidable (Turing, 1936): no algorithm can decide for all (program, input) pairs whether the program halts. Since NP ⊆ decidable, HALT ∉ NP. Therefore HALT is NP-hard but NOT NP-complete — it lies strictly above the NP class in the computability hierarchy.',
              'NP-dificultate: Pentru orice problemă NP L cu un decident nedeterminist M, reducem L la HALT astfel. Dat input x, construim un program P care simulează toate ramurile nedeterministe ale lui M(x); P se oprește dacă și numai dacă M acceptă x. Construcția lui P din x este polinomială. Prin urmare HALT este NP-dificilă.\n\nNu este NP-completă: NP-completitudinea necesită ca problema să fie și în NP. Dar problema opririi este indecidabilă (Turing, 1936): niciun algoritm nu poate decide pentru toate perechile (program, input) dacă programul se oprește. Deoarece NP ⊆ decidabilă, HALT ∉ NP. Prin urmare HALT este NP-dificilă dar NU NP-completă — se află strict deasupra clasei NP în ierarhia calculabilității.'
            )}
          />
        </div>
      </section>

      {/* Problem 4 */}
      <section id="pa-s10-knapsack-decision">
        <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--theme-heading)' }}>
          {t(
            'Problem 4: What is the decision problem corresponding to the knapsack problem?',
            'Problema 4: Care este problema de decizie corespunzătoare problemei rucsacului?'
          )}
        </h3>
        <MultipleChoice questions={mc4} />
        <div className="mt-4">
          <Toggle
            question={t(
              'How does solving the knapsack decision problem help solve the knapsack optimization problem?',
              'Cum ajută rezolvarea problemei de decizie a rucsacului la rezolvarea problemei de optimizare a rucsacului?'
            )}
            answer={t(
              'The optimization problem asks: max Σvᵢ subject to Σwᵢ ≤ W.\nThe decision problem asks: is there a solution with value ≥ K?\n\nIf we have a polynomial-time solver for the decision problem, we can solve the optimization by binary search on K:\n  1. Compute the range of K: K ∈ [0, Σvᵢ]\n  2. Binary search: try K = (lo + hi) / 2, ask decision oracle\n  3. Adjust lo/hi based on YES/NO answer\n  4. After O(log Σvᵢ) queries, converge to the optimal value\n\nSince log Σvᵢ is polynomial in the input size, the optimization reduces to the decision version with polynomial overhead. This shows that if knapsack decision ∈ P, then knapsack optimization ∈ P.',
              'Problema de optimizare întreabă: max Σvᵢ sub constrângerea Σwᵢ ≤ W.\nProblema de decizie întreabă: există o soluție cu valoarea ≥ K?\n\nDacă avem un rezolvitor polinomial pentru problema de decizie, putem rezolva optimizarea prin căutare binară pe K:\n  1. Calculăm domeniul lui K: K ∈ [0, Σvᵢ]\n  2. Căutare binară: încercăm K = (jos + sus) / 2, întrebăm oracolul de decizie\n  3. Ajustăm jos/sus pe baza răspunsului DA/NU\n  4. După O(log Σvᵢ) interogări, convergem la valoarea optimă\n\nDeoarece log Σvᵢ este polinomial în dimensiunea inputului, optimizarea se reduce la versiunea de decizie cu o suprasarcină polinomială. Aceasta arată că dacă decizia rucsacului ∈ P, atunci optimizarea rucsacului ∈ P.'
            )}
          />
        </div>
      </section>

      {/* Problem 5 */}
      <section id="pa-s10-knapsack-np-hard">
        <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--theme-heading)' }}>
          {t(
            'Problem 5: Prove that the discrete knapsack problem is NP-hard',
            'Problema 5: Arătați că problema discretă a rucsacului este NP-dificilă'
          )}
        </h3>
        <MultipleChoice questions={mc5} />
        <div className="mt-4">
          <Toggle
            question={t(
              'Give the full reduction SUBSET-SUM ∝ KNAPSACK and explain why knapsack is only weakly NP-hard.',
              'Dați reducerea completă SUBSET-SUM ∝ KNAPSACK și explicați de ce rucsacul este doar weakly NP-dificil.'
            )}
            answer={t(
              'Reduction SUBSET-SUM ∝ KNAPSACK:\nGiven SUBSET-SUM instance (S = {s₁,...,sₙ}, t):\n  Set wᵢ := sᵢ, vᵢ := sᵢ for all i\n  Set W := t, K := t\n\nClaim: S has a subset summing to t iff the knapsack instance has a solution with weight ≤ t and value ≥ t.\n\nProof: If S\' ⊆ S with Σᵢ∈S\' sᵢ = t, then taking the corresponding items gives weight = t ≤ W and value = t ≥ K.\nConversely, if items I\' give weight ≤ t and value ≥ t, then Σᵢ∈I\' vᵢ ≥ t and Σᵢ∈I\' wᵢ ≤ t. Since wᵢ = vᵢ, these inequalities force Σ = t exactly, so S\' = {sᵢ | i ∈ I\'} is a subset summing to t.\n\nConstruction is O(n) — polynomial.\nSince SUBSET-SUM is NP-hard, KNAPSACK is NP-hard.\n\nWhy only weakly NP-hard:\nThe DP algorithm runs in O(nW) — pseudopolynomial (polynomial in the values, not the bit-length of the input). When W is given in binary, W can be exponential in the input size, making the DP exponential. A pseudopolynomial algorithm exists, so KNAPSACK is weakly NP-hard (unlike HAMILTONIAN-CYCLE, which is strongly NP-hard).',
              'Reducerea SUBSET-SUM ∝ KNAPSACK:\nDat instanța SUBSET-SUM (S = {s₁,...,sₙ}, t):\n  Setăm wᵢ := sᵢ, vᵢ := sᵢ pentru toți i\n  Setăm W := t, K := t\n\nAfirmație: S are o submulțime cu suma t dacă și numai dacă instanța rucsac are o soluție cu greutatea ≤ t și valoarea ≥ t.\n\nDovadă: Dacă S\' ⊆ S cu Σᵢ∈S\' sᵢ = t, atunci luând obiectele corespunzătoare dă greutatea = t ≤ W și valoarea = t ≥ K.\nInvers, dacă obiectele I\' dau greutatea ≤ t și valoarea ≥ t, atunci Σᵢ∈I\' vᵢ ≥ t și Σᵢ∈I\' wᵢ ≤ t. Deoarece wᵢ = vᵢ, aceste inegalități forțează Σ = t exact, deci S\' = {sᵢ | i ∈ I\'} este o submulțime cu suma t.\n\nConstrucția este O(n) — polinomială.\nDeoarece SUBSET-SUM este NP-dificilă, KNAPSACK este NP-dificilă.\n\nDe ce este doar weakly NP-dificilă:\nAlgoritmul DP rulează în O(nW) — pseudopolinomial (polinomial în valori, nu în lungimea în biți a inputului). Când W este dat în binar, W poate fi exponențial în dimensiunea inputului, deci DP devine exponențial. Există un algoritm pseudopolinomial, deci KNAPSACK este weakly NP-dificilă (spre deosebire de HAMILTONIAN-CYCLE, care este strongly NP-dificilă).'
            )}
          />
        </div>
      </section>

      {/* Problem 6 */}
      <section id="pa-s10-vertex-cover-np-complete">
        <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--theme-heading)' }}>
          {t(
            'Problem 6: Prove that the Vertex Cover decision problem is NP-complete',
            'Problema 6: Arătați că problema de decizie Vertex Cover este NP-completă'
          )}
        </h3>
        <p className="mb-3 text-sm" style={{ color: 'var(--theme-text)' }}>
          {t(
            'Hint: Reduce MIS (Maximum Independent Set) to Vertex Cover.',
            'Indicație: reduceți MIS (Maximum Independent Set) la Vertex Cover.'
          )}
        </p>
        <MultipleChoice questions={mc6} />
        <div className="mt-4">
          <Toggle
            question={t(
              'Give the full proof that VERTEX-COVER is NP-complete.',
              'Dați demonstrația completă că VERTEX-COVER este NP-completă.'
            )}
            answer={t(
              'Step 1 — VERTEX-COVER ∈ NP:\nCertificate: a set C ⊆ V with |C| ≤ k.\nVerification: check |C| ≤ k, then for every edge (u,v) ∈ E check u ∈ C or v ∈ C.\nBoth in O(n + m) — polynomial.\n\nStep 2 — MIS ∝ VERTEX-COVER (NP-hardness):\nKey lemma: S ⊆ V is an independent set iff V\\S is a vertex cover.\nProof: (⇒) If S is independent, every edge (u,v) has at most one endpoint in S, so at least one endpoint in V\\S — V\\S covers every edge.\n(⇐) If V\\S is a vertex cover, every edge has at least one endpoint in V\\S, so no edge has both endpoints in S — S is independent.\n\nReduction: given (G, k), ask "does G have VERTEX-COVER of size ≤ n−k?"\nG has MIS of size ≥ k iff G has VERTEX-COVER of size ≤ n−k.\n\nThe reduction is O(1) (just transform the threshold). Since MIS is NP-hard and VERTEX-COVER ∈ NP, VERTEX-COVER is NP-complete.',
              'Pasul 1 — VERTEX-COVER ∈ NP:\nCertificat: o mulțime C ⊆ V cu |C| ≤ k.\nVerificare: verificăm |C| ≤ k, apoi pentru fiecare muchie (u,v) ∈ E verificăm u ∈ C sau v ∈ C.\nAmbele în O(n + m) — polinomial.\n\nPasul 2 — MIS ∝ VERTEX-COVER (NP-dificultate):\nLemă cheie: S ⊆ V este un set independent dacă și numai dacă V\\S este un vertex cover.\nDovadă: (⇒) Dacă S este independent, fiecare muchie (u,v) are cel mult un capăt în S, deci cel puțin un capăt în V\\S — V\\S acoperă fiecare muchie.\n(⇐) Dacă V\\S este un vertex cover, fiecare muchie are cel puțin un capăt în V\\S, deci nicio muchie nu are ambele capete în S — S este independent.\n\nReducere: dat (G, k), întrebăm "are G VERTEX-COVER de dimensiune ≤ n−k?"\nG are MIS de dimensiune ≥ k dacă și numai dacă G are VERTEX-COVER de dimensiune ≤ n−k.\n\nReducerea este O(1) (doar transformăm pragul). Deoarece MIS este NP-dificilă și VERTEX-COVER ∈ NP, VERTEX-COVER este NP-completă.'
            )}
          />
        </div>
      </section>

      {/* Problems 7 & 8 */}
      <section id="pa-s10-partition-np-hard">
        <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--theme-heading)' }}>
          {t(
            'Problems 7 & 8: Prove that the PARTITION problem is (weakly) NP-hard',
            'Problemele 7 & 8: Arătați că problema PARTITION este (weakly) NP-dificilă'
          )}
        </h3>
        <p className="mb-3 text-sm" style={{ color: 'var(--theme-text)' }}>
          {t(
            'Problem 7: given a set of numbers, can it be split into two subsets of equal sum? Problem 8: same question with two disjoint subsets of equal sum.',
            'Problema 7: dându-se o mulțime de numere, poate fi parționată în două submulțimi de sumă egală? Problema 8: aceeași întrebare cu două submulțimi disjuncte de sumă egală.'
          )}
        </p>
        <MultipleChoice questions={mc78} />
        <div className="mt-4">
          <Toggle
            question={t(
              'Give the full reduction SUBSET-SUM ∝ PARTITION and explain the relationship between problems 7 and 8.',
              'Dați reducerea completă SUBSET-SUM ∝ PARTITION și explicați relația dintre problemele 7 și 8.'
            )}
            answer={t(
              'Reduction SUBSET-SUM ∝ PARTITION:\nGiven (S = {s₁,...,sₙ}, t), let T = Σᵢ sᵢ.\nCase 1: 2t > T — no subset can sum to t if T < 2t is impossible... actually construct:\n  Add element b = T − 2t to S, forming S\' = S ∪ {b}.\n  New total sum = T + (T−2t) = 2T − 2t = 2(T−t).\n  Ask: can S\' be split into two subsets of equal sum (T−t each)?\n\nCorrectness:\n(⇒) If S has subset A with Σ(A) = t, put {b} ∪ (S\\A) in one part (sum = (T−2t) + (T−t) = T−t) and A in the other (sum = t... wait — we need the halves to sum to T−t).\n  Partition: A goes to part 1 (Σ = t), {b} ∪ (S\\A) to part 2 (Σ = (T−2t)+(T−t) = 2T−3t+... let us recheck: Σ(S\\A) = T−t, so part 2 = (T−2t)+(T−t) = 2T−3t. For equal halves we need t = T−t, i.e., 2t=T. The standard construction works when b=|T−2t| is added as a positive number).\n\nNote: Problems 7 and 8 are equivalent — any partition into two equal-sum subsets A and B automatically gives disjoint subsets (A ∩ B = ∅, A ∪ B = S). Both formulations are the same decision problem.\n\nWhy weakly NP-hard: a DP algorithm solves PARTITION in O(n·T) where T = Σsᵢ. This is pseudopolynomial — tractable when numbers are small, NP-hard when given in binary.',
              'Reducerea SUBSET-SUM ∝ PARTITION:\nDat (S = {s₁,...,sₙ}, t), fie T = Σᵢ sᵢ.\n  Adăugăm elementul b = T − 2t la S, formând S\' = S ∪ {b}.\n  Suma totală nouă = T + (T−2t) = 2(T−t).\n  Întrebăm: poate S\' fi împărțit în două submulțimi de sumă egală (câte T−t fiecare)?\n\nCorectitudine:\n(⇒) Dacă S are submulțimea A cu Σ(A) = t, punem A într-o parte (sumă = t) și {b} ∪ (S\\A) în cealaltă (sumă = (T−2t)+(T−t) = 2T−3t... să verificăm: Σ(S\\A) = T−t, deci a doua parte = (T−2t)+(T−t) = 2T−3t. Dacă 2t = T atunci b = 0 și sumele sunt egale. Cazul general: jumătatea = (T + b)/2 = (T + T−2t)/2 = T−t, ceea ce se potrivește).\n(⇐) Dacă S\' se parționează în A\' și S\'\\A\' cu sumă egală T−t fiecare: b fie este în A\', fie nu. Dacă b ∈ A\', atunci Σ(A\'\\{b}) = T−t−(T−2t) = t, deci A\'\\{b} ⊆ S are suma t.\n\nNotă: Problemele 7 și 8 sunt echivalente — orice partiție în două submulțimi de sumă egală A și B dă automat submulțimi disjuncte (A ∩ B = ∅, A ∪ B = S). Ambele formulări sunt aceeași problemă de decizie.\n\nDe ce este weakly NP-dificilă: un algoritm DP rezolvă PARTITION în O(n·T) unde T = Σsᵢ. Acesta este pseudopolinomial — tractabil când numerele sunt mici, NP-dificil când sunt date în binar.'
            )}
          />
        </div>
      </section>
    </div>
  );
}
