import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Toggle } from '../../../components/ui';
import MultipleChoice from '../../../components/ui/MultipleChoice';

export default function Seminar10() {
  const { t } = useApp();

  /* ─── Problem 1: Backtracking design for Subset Sum ─── */
  const mc1 = [
    {
      question: {
        en: 'For a backtracking algorithm solving Subset Sum with S = {3, 5, 6, 7} and t = 15, which partial solution is pruned first?',
        ro: 'Pentru un algoritm backtracking care rezolvă Subset Sum cu S = {3, 5, 6, 7} și t = 15, care soluție parțială este eliminată prima?',
      },
      options: [
        {
          text: {
            en: 'Partial {3, 5, 6} with sum=14 — remaining element 7 would make sum=21 > 15 (overshot with only element left)',
            ro: 'Parțial {3, 5, 6} cu suma=14 — elementul rămas 7 ar face suma=21 > 15 (depășit cu singurul element rămas)',
          },
          correct: false,
          feedback: {
            en: 'Actually {3,5,6} has sum 14 ≤ 15, and we have not yet included 7. The partial {3,5} has sum 8, and remaining = {6,7}, so partial+remaining = 8+13=21 ≥ 15 — viable. The pruning happens differently.',
            ro: 'De fapt {3,5,6} are suma 14 ≤ 15, și nu am inclus încă 7. Parțialul {3,5} are suma 8, iar rămas = {6,7}, deci parțial+rămas = 8+13=21 ≥ 15 — viabil. Pruning-ul se întâmplă altfel.',
          },
        },
        {
          text: {
            en: 'Partial {} with sum=0 — remaining_sum=21 < t=15 is false, so it is viable and not pruned',
            ro: 'Parțial {} cu suma=0 — sumă_rămasă=21 < t=15 este fals, deci este viabil și nu este eliminat',
          },
          correct: false,
          feedback: {
            en: 'The empty partial solution has sum 0 ≤ 15 and remaining = 3+5+6+7=21 ≥ 15, so it is viable. No pruning here.',
            ro: 'Soluția parțială goală are suma 0 ≤ 15 și rest = 3+5+6+7=21 ≥ 15, deci este viabilă. Fără pruning aici.',
          },
        },
        {
          text: {
            en: 'Partial {7, 6, 5} with sum=18 > 15 — upper-bound pruning (already exceeded target)',
            ro: 'Parțial {7, 6, 5} cu suma=18 > 15 — pruning limită superioară (a depășit deja ținta)',
          },
          correct: true,
          feedback: {
            en: 'When the partial sum exceeds t=15, the branch is immediately pruned. {7,6,5} sums to 18 > 15, so this entire branch (and all extensions) are discarded. Upper-bound pruning fires before lower-bound pruning in this case.',
            ro: 'Când suma parțială depășește t=15, ramura este imediat eliminată. {7,6,5} sumează 18 > 15, deci toată această ramură (și toate extensiile) sunt eliminate. Pruning-ul cu limita superioară se declanșează înainte de cel cu limita inferioară în acest caz.',
          },
        },
        {
          text: {
            en: 'Partial {3} with sum=3 — not pruned since 3+remaining=3+18=21 ≥ 15',
            ro: 'Parțial {3} cu suma=3 — nu este eliminat deoarece 3+rest=3+18=21 ≥ 15',
          },
          correct: false,
          feedback: {
            en: 'Correct analysis — {3} is viable. But this option asks which is pruned first, and {3} is not pruned at all.',
            ro: 'Analiză corectă — {3} este viabil. Dar această opțiune întreabă care este eliminat primul, iar {3} nu este eliminat deloc.',
          },
        },
      ],
      explanation: {
        en: 'Subset Sum backtracking prunes when partial_sum > t (upper bound) or partial_sum + remaining < t (lower bound). With S = {3,5,6,7}, t=15: processing largest first, {7,6,5} sums to 18 > 15 — upper-bound pruning triggers.',
        ro: 'Backtracking-ul Subset Sum elimină când suma_parțială > t (limita superioară) sau suma_parțială + rest < t (limita inferioară). Cu S = {3,5,6,7}, t=15: procesând de la cel mai mare, {7,6,5} sumează 18 > 15 — pruning-ul cu limita superioară se declanșează.',
      },
    },
  ];

  /* ─── Problem 2: N-Queens call count ─── */
  const mc2 = [
    {
      question: {
        en: 'For N-Queens with n=4, backtracking makes 17 recursive calls vs 341 for exhaustive search. What is the pruning condition?',
        ro: 'Pentru N-Regine cu n=4, backtracking face 17 apeluri recursive față de 341 pentru căutarea exhaustivă. Care este condiția de pruning?',
      },
      options: [
        {
          text: {
            en: 'The current queen placement attacks any previously placed queen (same row, column, or diagonal)',
            ro: 'Plasarea curentă a reginei atacă orice regină plasată anterior (același rând, coloană sau diagonală)',
          },
          correct: true,
          feedback: {
            en: 'A partial board placement is non-viable if any two queens attack each other. Checking this after each queen placement (at each recursion level) eliminates all extensions of invalid configurations without exploring them.',
            ro: 'O plasare parțială pe tablă este neviabilă dacă orice două regine se atacă. Verificând aceasta după fiecare plasare de regină (la fiecare nivel de recursivitate) elimină toate extensiile configurațiilor invalide fără a le explora.',
          },
        },
        {
          text: {
            en: 'The current row has more than n/2 queens placed',
            ro: 'Rândul curent are mai mult de n/2 regine plasate',
          },
          correct: false,
          feedback: {
            en: 'This is not the N-Queens constraint. Each row has exactly one queen. The constraint is about attacks between queens across rows.',
            ro: 'Aceasta nu este constrângerea N-Regine. Fiecare rând are exact o regină. Constrângerea se referă la atacuri între regine pe rânduri diferite.',
          },
        },
        {
          text: {
            en: 'The number of empty columns is less than the number of remaining rows',
            ro: 'Numărul de coloane goale este mai mic decât numărul de rânduri rămase',
          },
          correct: false,
          feedback: {
            en: 'This would be a valid additional pruning condition (pigeonhole), but the standard N-Queens pruning is the attack constraint — checking for row, column, and diagonal conflicts after each placement.',
            ro: 'Aceasta ar fi o condiție de pruning suplimentară validă (pigeonhole), dar pruning-ul standard pentru N-Regine este constrângerea de atac — verificarea conflictelor de rând, coloană și diagonală după fiecare plasare.',
          },
        },
        {
          text: {
            en: 'The queen is placed in the same column as the row index',
            ro: 'Regina este plasată în aceeași coloană ca și indicele rândului',
          },
          correct: false,
          feedback: {
            en: 'This is an arbitrary constraint with no relation to the N-Queens problem rules.',
            ro: 'Aceasta este o constrângere arbitrară fără legătură cu regulile problemei N-Regine.',
          },
        },
      ],
      explanation: {
        en: 'N-Queens backtracking pruning: after placing each queen, check if it attacks any previously placed queen (same column or diagonal). If yes, prune the entire subtree. This reduces 341 exhaustive calls to 17 for n=4.',
        ro: 'Pruning-ul backtracking-ului N-Regine: după plasarea fiecărei regine, verificăm dacă atacă orice regină plasată anterior (aceeași coloană sau diagonală). Dacă da, eliminăm întreg subtreele. Aceasta reduce 341 de apeluri exhaustive la 17 pentru n=4.',
      },
    },
  ];

  /* ─── Problem 3: SAT backtracking viability ─── */
  const mc3 = [
    {
      question: {
        en: 'For f = (¬x₁ ∨ x₂) ∧ (x₂ ∨ ¬x₃) ∧ (¬x₃ ∨ x₃), partial assignment {x₁=1, x₂=0}. Is this partial assignment viable?',
        ro: 'Pentru f = (¬x₁ ∨ x₂) ∧ (x₂ ∨ ¬x₃) ∧ (¬x₃ ∨ x₃), atribuire parțială {x₁=1, x₂=0}. Este această atribuire parțială viabilă?',
      },
      options: [
        {
          text: {
            en: 'No — clause (¬x₁ ∨ x₂) is fully assigned and false: ¬1 ∨ 0 = 0 ∨ 0 = 0',
            ro: 'Nu — clauza (¬x₁ ∨ x₂) este complet atribuită și falsă: ¬1 ∨ 0 = 0 ∨ 0 = 0',
          },
          correct: true,
          feedback: {
            en: 'With x₁=1, x₂=0: clause (¬x₁ ∨ x₂) = (¬1 ∨ 0) = (0 ∨ 0) = 0. This clause is fully evaluated and false. No extension of this partial assignment can satisfy it. Prune immediately.',
            ro: 'Cu x₁=1, x₂=0: clauza (¬x₁ ∨ x₂) = (¬1 ∨ 0) = (0 ∨ 0) = 0. Această clauză este complet evaluată și falsă. Nicio extensie a acestei atribuiri parțiale nu o poate satisface. Eliminăm imediat.',
          },
        },
        {
          text: {
            en: 'Yes — x₃ is unassigned so the formula could still be satisfied',
            ro: 'Da — x₃ este neatribuit deci formula ar putea fi încă satisfăcută',
          },
          correct: false,
          feedback: {
            en: 'Clause (¬x₁ ∨ x₂) does not contain x₃ — it is already fully determined by x₁ and x₂. Since it is false and cannot be changed, the partial assignment is non-viable regardless of x₃.',
            ro: 'Clauza (¬x₁ ∨ x₂) nu conține x₃ — este deja complet determinată de x₁ și x₂. Deoarece este falsă și nu poate fi schimbată, atribuirea parțială este neviabilă indiferent de x₃.',
          },
        },
        {
          text: {
            en: 'Yes — only the last clause (¬x₃ ∨ x₃) determines viability since it contains x₃',
            ro: 'Da — doar ultima clauză (¬x₃ ∨ x₃) determină viabilitatea deoarece conține x₃',
          },
          correct: false,
          feedback: {
            en: 'Viability requires ALL clauses to be satisfiable. If any fully-assigned clause is false, the partial assignment is non-viable — regardless of other clauses.',
            ro: 'Viabilitatea necesită ca TOATE clauzele să fie satisfiabile. Dacă orice clauză complet atribuită este falsă, atribuirea parțială este neviabilă — indiferent de alte clauze.',
          },
        },
        {
          text: {
            en: 'Yes — two of three clauses have unassigned variables so the partial assignment is trivially viable',
            ro: 'Da — două din trei clauze au variabile neatribuite deci atribuirea parțială este trivial viabilă',
          },
          correct: false,
          feedback: {
            en: 'The first clause (¬x₁ ∨ x₂) has ALL its variables assigned (x₁ and x₂ both assigned) and evaluates to false. A single falsified fully-assigned clause makes the partial assignment non-viable.',
            ro: 'Prima clauză (¬x₁ ∨ x₂) are TOATE variabilele atribuite (x₁ și x₂ ambele atribuite) și evaluează la fals. O singură clauză complet atribuită și falsificată face atribuirea parțială neviabilă.',
          },
        },
      ],
      explanation: {
        en: 'With {x₁=1, x₂=0}: clause (¬x₁ ∨ x₂) = 0. The backtracking SAT pruning condition fires: a fully-assigned clause is false. This branch is pruned. Note: (¬x₃ ∨ x₃) is a tautology — always true regardless of x₃.',
        ro: 'Cu {x₁=1, x₂=0}: clauza (¬x₁ ∨ x₂) = 0. Condiția de pruning SAT se declanșează: o clauză complet atribuită este falsă. Această ramură este eliminată. Notă: (¬x₃ ∨ x₃) este o tautologie — mereu adevărată indiferent de x₃.',
      },
    },
  ];

  /* ─── Problem 4: Branch and Bound for MIS bound ─── */
  const mc4 = [
    {
      question: {
        en: 'For Branch and Bound on Maximum Independent Set, current partial set has 3 nodes selected, and the remaining induced subgraph has 6 vertices and a greedy matching of size 2. What is the maxRest bound?',
        ro: 'Pentru Branch and Bound pe Maximum Independent Set, setul parțial curent are 3 noduri selectate, iar subgraful indus rămas are 6 vârfuri și un matching greedy de dimensiune 2. Care este estimarea maxRest?',
      },
      options: [
        {
          text: { en: '4 (= 6 − 2 = remaining_vertices − matching_size)', ro: '4 (= 6 − 2 = vârfuri_rămase − dimensiune_matching)' },
          correct: true,
          feedback: {
            en: 'A matching of size 2 means 2 edges, each covering 2 endpoints. At most one endpoint of each matching edge can be in an independent set, so the independent set size is at most |V_rem| − |matching| = 6 − 2 = 4. This is an admissible (overestimating) bound.',
            ro: 'Un matching de dimensiune 2 înseamnă 2 muchii, fiecare acoperind 2 capete. Cel mult un capăt al fiecărei muchii de matching poate fi în setul independent, deci dimensiunea setului independent este cel mult |V_rem| − |matching| = 6 − 2 = 4. Aceasta este o estimare admisibilă (supraestimatoare).',
          },
        },
        {
          text: { en: '6 (= all remaining vertices)', ro: '6 (= toate vârfurile rămase)' },
          correct: false,
          feedback: {
            en: '6 is a valid (trivially admissible) bound but weaker — it ignores the matching structure. Using the matching gives the tighter bound of 4, which prunes more branches.',
            ro: '6 este o estimare validă (trivial admisibilă) dar mai slabă — ignoră structura matching-ului. Folosind matching-ul se obține estimarea mai strânsă de 4, care elimină mai multe ramuri.',
          },
        },
        {
          text: { en: '2 (= matching size only)', ro: '2 (= doar dimensiunea matching-ului)' },
          correct: false,
          feedback: {
            en: 'The matching size alone (2) would be a pessimistic underestimate — the true remaining MIS is likely larger than 2. An underestimating bound is inadmissible for Branch and Bound (it would wrongly prune optimal branches).',
            ro: 'Dimensiunea matching-ului singură (2) ar fi o subestimare pesimistă — MIS-ul rămas real este probabil mai mare decât 2. O estimare subestimatoare este inadmisibilă pentru Branch and Bound (ar elimina incorect ramuri optime).',
          },
        },
        {
          text: { en: '3 (= current partial set size)', ro: '3 (= dimensiunea setului parțial curent)' },
          correct: false,
          feedback: {
            en: 'maxRest estimates the additional gain from remaining vertices, not the current partial set size. maxRest(partial) + current_size gives the total estimated solution value.',
            ro: 'maxRest estimează câștigul suplimentar din vârfurile rămase, nu dimensiunea setului parțial curent. maxRest(parțial) + dimensiune_curentă dă valoarea totală estimată a soluției.',
          },
        },
      ],
      explanation: {
        en: 'maxRest bound using greedy matching: MIS ≤ |V_rem| − |matching| = 6 − 2 = 4. This is admissible (never underestimates true MIS). Total estimated solution: 3 + 4 = 7. Branch is pruned if 7 ≤ bestSoFar.',
        ro: 'Estimarea maxRest folosind matching greedy: MIS ≤ |V_rem| − |matching| = 6 − 2 = 4. Aceasta este admisibilă (nu subestimează niciodată MIS-ul real). Soluție totală estimată: 3 + 4 = 7. Ramura este eliminată dacă 7 ≤ celMaiBunPânăAcum.',
      },
    },
  ];

  /* ─── Problem 5: Sudoku viability ─── */
  const mc5 = [
    {
      question: {
        en: 'In a Sudoku backtracking algorithm, which cells are chosen first to improve efficiency (fail-first heuristic)?',
        ro: 'Într-un algoritm backtracking Sudoku, care celule sunt alese mai întâi pentru a îmbunătăți eficiența (euristica fail-first)?',
      },
      options: [
        {
          text: {
            en: 'Cells with the fewest legal remaining values (most constrained variable)',
            ro: 'Celulele cu cel mai mic număr de valori legale rămase (variabila cel mai mult constrânsă)',
          },
          correct: true,
          feedback: {
            en: 'The MRV (Minimum Remaining Values) heuristic: choose the cell with fewest remaining legal digits. This finds constraint violations earlier (fail-first), pruning more of the search tree before deep exploration.',
            ro: 'Euristica MRV (Minimum Remaining Values): alegem celula cu cel mai mic număr de cifre legale rămase. Aceasta găsește violările constrângerilor mai devreme (fail-first), eliminând mai mult din arborele de căutare înainte de explorarea profundă.',
          },
        },
        {
          text: {
            en: 'The top-left empty cell (reading order)',
            ro: 'Celula goală din stânga-sus (ordine de citire)',
          },
          correct: false,
          feedback: {
            en: 'Reading order (left-to-right, top-to-bottom) works correctly but is less efficient — it may explore deeply before hitting a constraint violation. MRV (most-constrained-first) prunes earlier.',
            ro: 'Ordinea de citire (stânga-dreapta, sus-jos) funcționează corect dar este mai puțin eficientă — poate explora adânc înainte de a întâlni o violare de constrângere. MRV (cel mai constrâns mai întâi) elimină mai devreme.',
          },
        },
        {
          text: {
            en: 'The cell in the center 3×3 box, to constrain the most neighbors',
            ro: 'Celula din cutia centrală 3×3, pentru a constrânge cât mai mulți vecini',
          },
          correct: false,
          feedback: {
            en: 'The center box is not necessarily the most constrained cell. MRV considers the actual number of legal values for each cell dynamically, not a fixed geometric position.',
            ro: 'Cutia centrală nu este neapărat cea mai constrânsă celulă. MRV ia în considerare numărul actual de valori legale pentru fiecare celulă dinamic, nu o poziție geometrică fixă.',
          },
        },
        {
          text: {
            en: 'A random empty cell',
            ro: 'O celulă goală aleatoare',
          },
          correct: false,
          feedback: {
            en: 'Random selection works but has poor average performance. Heuristics like MRV significantly reduce the search space by exploiting constraint structure.',
            ro: 'Selecția aleatoare funcționează dar are performanță medie slabă. Euristica precum MRV reduce semnificativ spațiul de căutare exploatând structura constrângerilor.',
          },
        },
      ],
      explanation: {
        en: 'Fail-first / MRV heuristic: choose the most-constrained cell (fewest legal values remaining). This maximizes early pruning — if a cell has only one legal value and it leads to a conflict, we discover this quickly.',
        ro: 'Euristica fail-first / MRV: alegem celula cel mai mult constrânsă (cel mai puține valori legale rămase). Aceasta maximizează eliminarea timpurie — dacă o celulă are o singură valoare legală și aceasta duce la conflict, descoperim aceasta rapid.',
      },
    },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold" style={{ color: 'var(--theme-heading)' }}>
        {t('Week 10: Backtracking & Branch and Bound', 'Săptămâna 10: Backtracking și Branch & Bound')}
      </h2>

      {/* Problem 1 */}
      <section>
        <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--theme-heading)' }}>
          {t('Problem 1: Subset Sum — Backtracking Pruning', 'Problema 1: Subset Sum — Pruning Backtracking')}
        </h3>
        <MultipleChoice questions={mc1} />
        <div className="mt-4">
          <Toggle
            question={t(
              'Design the backtracking algorithm for Subset Sum: specify (a) solution representation, (b) partial solutions, (c) successors, (d) viability.',
              'Proiectați algoritmul backtracking pentru Subset Sum: specificați (a) reprezentarea soluției, (b) soluțiile parțiale, (c) succesorii, (d) viabilitatea.'
            )}
            answer={t(
              '(a) Solution: boolean vector b[1..n] where b[i]=1 means element s[i] is included in S\'.\n\n(b) Partial solutions: vectors b[1..k] for k<n — first k inclusion decisions made.\n\n(c) Successors: from b[1..k], extend to b[1..k+1] with b[k+1]=0 (exclude s[k+1]) or b[k+1]=1 (include s[k+1]).\n\n(d) Viability: b[1..k] is viable iff:\n   partial_sum = Σ_{i=1}^{k} b[i]·s[i] ≤ t  (have not overshot), AND\n   partial_sum + Σ_{i=k+1}^{n} s[i] ≥ t        (can still reach t).',
              '(a) Soluție: vector boolean b[1..n] unde b[i]=1 înseamnă că elementul s[i] este inclus în S\'.\n\n(b) Soluții parțiale: vectori b[1..k] pentru k<n — primele k decizii de includere luate.\n\n(c) Succesori: din b[1..k], extindem la b[1..k+1] cu b[k+1]=0 (excludem s[k+1]) sau b[k+1]=1 (includem s[k+1]).\n\n(d) Viabilitate: b[1..k] este viabil dacă:\n   sumă_parțială = Σ_{i=1}^{k} b[i]·s[i] ≤ t  (nu am depășit), ȘI\n   sumă_parțială + Σ_{i=k+1}^{n} s[i] ≥ t     (putem încă atinge t).'
            )}
          />
        </div>
      </section>

      {/* Problem 2 */}
      <section>
        <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--theme-heading)' }}>
          {t('Problem 2: N-Queens Backtracking', 'Problema 2: N-Regine Backtracking')}
        </h3>
        <MultipleChoice questions={mc2} />
        <div className="mt-4">
          <Toggle
            question={t(
              'How do you expect the ratio (backtracking calls / exhaustive calls) to change for n = 5, 6, 7...? Interpret this trend.',
              'Cum vă așteptați să se modifice raportul (apeluri backtracking / apeluri exhaustive) pentru n = 5, 6, 7...? Interpretați această tendință.'
            )}
            answer={t(
              'The ratio decreases as n grows — backtracking becomes relatively more efficient. Exhaustive search grows as n^n (each of n rows has n column choices). Backtracking prunes entire subtrees at each level: a queen placed at level k that attacks a previous queen eliminates n^(n-k) exhaustive nodes in one step. As n grows, the pruned subtrees are exponentially larger, so the ratio drops dramatically. This illustrates why backtracking is the standard approach for constraint satisfaction problems with large n despite worst-case exponential complexity.',
              'Raportul scade pe măsură ce n crește — backtracking-ul devine relativ mai eficient. Căutarea exhaustivă crește ca n^n (fiecare din n rânduri are n alegeri de coloană). Backtracking-ul elimină subtreii întregi la fiecare nivel: o regină plasată la nivelul k care atacă o regină anterioară elimină n^(n-k) noduri exhaustive dintr-un singur pas. Pe măsură ce n crește, subtreii eliminați sunt exponențial mai mari, deci raportul scade dramatic. Aceasta ilustrează de ce backtracking-ul este abordarea standard pentru problemele de satisfacere a constrângerilor cu n mare, în ciuda complexității exponențiale în cazul cel mai nefavorabil.'
            )}
          />
        </div>
      </section>

      {/* Problem 3 */}
      <section>
        <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--theme-heading)' }}>
          {t('Problem 3: SAT Backtracking — Viability Check', 'Problema 3: SAT Backtracking — Verificarea Viabilității')}
        </h3>
        <MultipleChoice questions={mc3} />
      </section>

      {/* Problem 4 */}
      <section>
        <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--theme-heading)' }}>
          {t('Problem 4: Branch and Bound for Maximum Independent Set', 'Problema 4: Branch and Bound pentru Maximum Independent Set')}
        </h3>
        <MultipleChoice questions={mc4} />
        <div className="mt-4">
          <Toggle
            question={t(
              'Argue that maxRest = |V_rem| − |matching_size| is a correct (admissible) bound for MIS.',
              'Argumentați că maxRest = |V_rem| − |dimensiune_matching| este o estimare corectă (admisibilă) pentru MIS.'
            )}
            answer={t(
              'A matching M is a set of edges with no shared endpoints. Each matching edge (u,v) means that at most one of {u, v} can belong to an independent set (since they are adjacent). So |matching| edges "consume" at least |matching| vertices that cannot all be in the independent set — each matching edge contributes at most 1 vertex to MIS instead of potentially 2. Therefore MIS ≤ |V_rem| − |matching|.\n\nThis bound is admissible: the true MIS is at most |V_rem| − |matching|, so we never underestimate. A larger matching gives a tighter (and still admissible) bound, pruning more branches.',
              'Un matching M este o mulțime de muchii fără capete comune. Fiecare muchie de matching (u,v) înseamnă că cel mult unul din {u, v} poate aparține unui set independent (deoarece sunt adiacente). Deci |matching| muchii "consumă" cel puțin |matching| vârfuri care nu pot fi toate în setul independent — fiecare muchie de matching contribuie cel mult 1 vârf la MIS în loc de potențial 2. Prin urmare MIS ≤ |V_rem| − |matching|.\n\nAceastă estimare este admisibilă: MIS-ul real este cel mult |V_rem| − |matching|, deci nu subestimăm niciodată. Un matching mai mare dă o estimare mai strânsă (și tot admisibilă), eliminând mai multe ramuri.'
            )}
          />
        </div>
      </section>

      {/* Problem 5 */}
      <section>
        <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--theme-heading)' }}>
          {t('Problem 5: Sudoku — Backtracking Heuristics', 'Problema 5: Sudoku — Euristici Backtracking')}
        </h3>
        <MultipleChoice questions={mc5} />
        <div className="mt-4">
          <Toggle
            question={t(
              'Design the backtracking algorithm for Sudoku: (a) solution, (b) partial solutions, (c) successors, (d) viability.',
              'Proiectați algoritmul backtracking pentru Sudoku: (a) soluție, (b) soluții parțiale, (c) succesori, (d) viabilitate.'
            )}
            answer={t(
              '(a) Solution: a complete 9×9 grid where each cell contains a digit 1–9, every row/column/box contains each digit exactly once.\n\n(b) Partial solutions: a 9×9 grid with some cells filled (digits 1–9) and others empty (value 0).\n\n(c) Successors: choose the next empty cell (e.g., by MRV heuristic), try each digit 1–9. Each assignment creates one successor.\n\n(d) Viability: a partial solution is viable iff no row, column, or 3×3 box contains the same digit twice among its assigned cells. (Equivalently: the last-placed digit does not conflict with any previously placed digit in its row, column, or box.)',
              '(a) Soluție: o grilă 9×9 completă unde fiecare celulă conține o cifră 1–9, fiecare rând/coloană/cutie conținând fiecare cifră exact o dată.\n\n(b) Soluții parțiale: o grilă 9×9 cu unele celule completate (cifre 1–9) și altele goale (valoare 0).\n\n(c) Succesori: alegem următoarea celulă goală (de ex., prin euristica MRV), încercăm fiecare cifră 1–9. Fiecare atribuire creează un succesor.\n\n(d) Viabilitate: o soluție parțială este viabilă dacă niciun rând, coloană sau cutie 3×3 nu conține aceeași cifră de două ori printre celulele atribuite. (Echivalent: ultima cifră plasată nu conflictează cu nicio cifră plasată anterior în rândul, coloana sau cutia sa.)'
            )}
          />
        </div>
      </section>
    </div>
  );
}
