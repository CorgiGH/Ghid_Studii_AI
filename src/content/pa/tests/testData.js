// PA Tests — Structured data for 16 previous-year exams
// Organized: Midterm (partial) first, then Final (exam)
// Within each type, sorted by year ascending

export const tests = [

  // ═══════════════════════════════════════════════════════
  // MIDTERM (PARTIAL) TESTS
  // ═══════════════════════════════════════════════════════

  // ── 2015 ──────────────────────────────────────────────
  {
    id: 'partial-2015-a',
    type: 'partial',
    year: 2015,
    variant: 'A',
    series: 'A',
    title: { en: 'Partial 2015 — Variant A', ro: 'Partial 2015 — Varianta A' },
    duration: '1 oră',
    totalPoints: 20,
    problems: [
      {
        number: 1,
        points: 8,
        title: { en: 'Design and Analysis, Basics', ro: 'Proiectare și analiză, baza' },
        statement: 'Se consideră problema testării dacă un tablou dat de numere întregi este ordonat strict crescător, notată cu ISINC.',
        parts: [
          { label: 'a', points: 1.5, question: 'Să se formuleze problema ISINC ca pereche (input, output).', answer: 'Input: a = (a[0],...,a[m-1]), a[i] = aᵢ ∈ ℤ\nOutput: true dacă a₀ < ... < aₘ₋₁, false în caz contrar', code: null },
          { label: 'b', points: 1.5, question: 'Să se descrie un algoritm care rezolvă ISINC.', answer: null, code: 'isinc(a, m) {\n  i = 0;\n  while ( i < m-1) {\n    if (a[i] >= a[i+1]) return false;\n    i = i + 1;\n  }\n  return true;\n}' },
          { label: 'c', points: 1.5, question: 'Să se arate că algoritmul de la b) rezolvă corect problema descrisă la a). Se va menționa care este invariantul instrucțiunii repetitive.', answer: 'Invariantul lui while: a[0..i] este ordonată strict crescător și i <= m-1. Pentru i = 0 este evident adevărat. Este păstrat de bucla while: incrementarea lui i se face numai dacă a[i] < a[i+1]. După execuția lui while are loc invariantul și i >= m-1, care implică i = m-1 și a[0..m-1] ordonat strict crescător.', code: null },
          { label: 'd', points: 1.5, question: 'Să se precizeze care este cazul cel mai nefavorabil pentru timpul de execuție.', answer: 'Cazul cel mai nefavorabil este când tabloul este deja ordonat crescător, cu excepția eventual a ultimelor două.', code: null },
          { label: 'e', points: 2, question: 'Se consideră ca dimensiune a intrării n = m·log M. Să se determine timpul de execuție pentru cazul cel mai nefavorabil.', answer: 'Se numără numai operațiile cu elemente din tablou.\nO buclă while execută o singură operație, comparația, în timpul log M.\nNumărul de iterații în cazul cel mai nefavorabil: m-1.\nRezultă timpul total = (m-1) log M = n – log M = O(n).', code: null },
        ],
      },
      {
        number: 2,
        points: 11,
        title: { en: 'Graham Scan — Convex Hull', ro: 'Scanarea Graham — Înfășurătoarea convexă' },
        statement: 'Se consideră mulțimea S cu următoarele puncte în plan:\nP[0]=(1,1), P[1]=(2,6), P[2]=(3,3), P[3]=(4,2), P[4]=(5,4), P[5]=(6,5)\nScopul exercițiului este de a descrie cum se aplică algoritmul lui Graham pentru a determina înfășurătoarea convexă.',
        parts: [
          { label: 'a', points: 2, question: 'Descrieți cum se determină un punct interior CH(S).', answer: 'Se poate lua centrul de greutate G = (xG, yG), unde xG și yG sunt mediile aritmetice ale absciselor respectiv ordonatelor:\nxG = (1+2+3+4+5+6)/6 = 3.5; yG = (1+6+3+2+4+5)/6 = 3.5', code: null },
          { label: 'b', points: 3, question: 'Scrieți lista punctelor sortate după coordonate polare.', answer: 'Rezultă Lista circulară L = (P[4], P[5], P[1], P[2], P[0], P[3]).', code: null },
          { label: 'c', points: 4, question: 'Descrieți cum este aplicată scanarea Graham pentru a determina CH(S).', answer: 'Se parcurge L și se calculează ccw pentru trei puncte succesive:\nccw(P[4], P[5], P[1]) > 0 ok.\nccw(P[5], P[1], P[2]) > 0 ok.\nccw(P[1], P[2], P[0]) < 0 => se elimină P[2].\nccw(P[5], P[1], P[0]) > 0 ok.\nccw(P[1], P[0], P[3]) > 0 ok.\nccw(P[0], P[3], P[4]) > 0 ok.\nccw(P[3], P[4], P[5]) < 0 => se elimină P[4].\nccw(P[0], P[3], P[5]) > 0 ok.\nccw(P[3], P[5], P[1]) > 0 ok.\nÎnfășurătoarea convexă: CH = (P[5], P[1], P[0], P[3]).', code: null },
          { label: 'd', points: 2, question: 'Descrieți invariantul menținut de scanarea Graham și exemplificați.', answer: 'Lista punctelor din L până la vârful curent formează un poligon convex:\n(P[4], P[5], P[1]); (P[4], P[5], P[1], P[2]); (P[4], P[5], P[1]); (P[4], P[5], P[1], P[0]); (P[5], P[1], P[0]); (P[5], P[1], P[0], P[3]).', code: null },
        ],
      },
      {
        number: 3,
        points: 8,
        title: { en: 'Problem Reductions', ro: 'Reduceri de probleme' },
        statement: '',
        parts: [
          { label: 'a', points: 2, question: 'Descrieți problemele NEAREST NEIGHBOR și ALL NEAREST NEIGHBOR.', answer: 'NEAREST NEIGHBOR\nIntrare: O mulțime S cu n puncte, un punct P, toate în plan.\nIeșire: Cel mai apropiat punct de P din S.\n\nALL NEAREST NEIGHBOR\nIntrare: O mulțime S cu n puncte în plan.\nIeșire: Cel mai apropiat vecin din S pentru fiecare punct din S.', code: null },
          { label: 'b', points: 3, question: 'Să se arate că NEAREST NEIGHBOR se reduce la ALL NEAREST NEIGHBOR. Să se precizeze ce tip de reducere este.', answer: '1. instanța (S, P) se transformă în instanța S.\n2. Se apelează algoritmul care calculează lista L cu L[i] cel mai apropiat de S[i].\n3. Întoarce L[k] pentru k cu proprietatea că S[k] = P.\nReducerea se face în O(n). Este o reducere Karp deoarece se apelează o singură dată algoritmul pentru ALL NEAREST NEIGHBOR.', code: null },
          { label: 'c', points: 3, question: 'Să se descrie relațiile dintre complexitățile celor două probleme, pe baza reducerii de la b).', answer: 'Dacă ALL NEAREST NEIGHBOR are complexitatea O(f(n)) atunci NEAREST NEIGHBOR are complexitatea O(f(n) + n).\nDacă NEAREST NEIGHBOR are complexitatea Ω(f(n)) atunci ALL NEAREST NEIGHBOR are complexitatea Ω(f(n) - n).', code: null },
        ],
      },
    ],
  },

  // ── 2016 ──────────────────────────────────────────────
  {
    id: 'partial-2016-a',
    type: 'partial',
    year: 2016,
    variant: 'A',
    series: 'A',
    title: { en: 'Partial 2016 — Variant A', ro: 'Partial 2016 — Varianta A' },
    duration: '1 oră',
    totalPoints: 18,
    problems: [
      {
        number: 1,
        points: 9,
        title: { en: 'Design and Analysis — P35', ro: 'Proiectare și analiză — P35' },
        statement: 'Se consideră problema testării dacă o listă de numere întregi include un număr ce este divizibil cu 3 dar nu este divizibil cu 5, notată cu P35.',
        parts: [
          { label: 'a', points: 1, question: 'Să se formuleze problema P35 ca pereche (input, output).', answer: 'Input: L = ⟨x₀,x₁,...,xₙ₋₁⟩, xᵢ ∈ ℤ, i=1,...n\nOutput: true dacă (∃i) 0 ≤ i < n și 3 divide xᵢ și 5 nu divide xᵢ\nfalse dacă (∀i) 0 ≤ i < n implică 3 nu divide xᵢ sau 5 divide xᵢ', code: null },
          { label: 'b', points: 2, question: 'Să se descrie un algoritm determinist care rezolvă P35.', answer: null, code: 'p35(L) {\n  for (i = 0; i < L.size(); ++i)\n    if (L.at(i) % 3 == 0 && L.at(i) % 5 != 0) return true;\n  return false;\n}' },
          { label: 'c', points: 2, question: 'Să se arate că algoritmul rezolvă corect problema și să se precizeze timpul de execuție pentru cazul cel mai nefavorabil.', answer: 'Invariantul pentru for: pentru orice j cu 0 ≤ j < i, L.at(j) % 3 != 0 sau L.at(j) % 5 == 0.\nLa terminarea lui for are loc invariantul și i == L.size().\nDimensiunea unei instanțe: n = L.size().\nCazul cel mai nefavorabil: când returnează false. T(n) = O(n).', code: null },
          { label: 'd', points: 2, question: 'Să se descrie un algoritm nedeterminist care rezolvă P35.', answer: null, code: 'p35nedet(L) {\n  choose i in 0..L.size() - 1;\n  if (L.at(i) % 3 == 0 && L.at(i) % 5 != 0) success;\n  else failure;\n}' },
          { label: 'e', points: 2, question: 'Să se arate că algoritmul nedeterminist rezolvă corect problema și să se precizeze timpul de execuție.', answer: 'Dacă (∃i) 0 ≤ i < n și 3 divide L.at(i) și 5 nu divide L.at(i), atunci există un calcul care se termină cu succes, cel în care instrucțiunea choose atribuie lui i o valoare care satisface condiția.\nDeoarece alegerea lui i se face în timpul O(1) și oricare din ramurile lui if necesită timpul O(1), rezultă T(n) = O(1).', code: null },
        ],
      },
      {
        number: 2,
        points: 9,
        title: { en: 'Point Localization', ro: 'Localizare punct' },
        statement: 'Se consideră linia poligonală simplă închisă L cu următoarele puncte în plan:\nL[0]=(1,1), L[1]=(3,4), L[2]=(5,0), L[3]=(7,4), L[4]=(9,2), L[5]=(7,6), L[6]=(5,2), L[7]=(3,5)\nScopul exercițiului este de a descrie cum se aplică algoritmul de localizare a unui punct față de o astfel de linie pentru P=(4,4).',
        parts: [
          { label: 'a', points: 5, question: 'Descrieți cum se determină numărul de intersecții.', answer: 'Fie d dreapta orizontală care trece prin P.\nlineIntersection(line(L[0], L[1]), d) = L[1] și L[1] < P.x => count() întoarce 0;\nlineIntersection(line(L[1], L[2]), d) = L[1] și L[1] < P.x => count() întoarce 0;\nlineIntersection(line(L[2], L[3]), d) = L[3]; primul punct care nu e pe d este L[4]; L[2] și L[4] de aceeași parte a lui d => count() întoarce 0;\nlineIntersection(line(L[4], L[5]), d) = Q și Q între L[4], L[5] => count() întoarce 1;\nlineIntersection(line(L[5], L[6]), d) = Q și Q între L[4], L[5] => count() întoarce 1;\nlineIntersection(line(L[6], L[7]), d) = Q și Q.x < P.x => count() întoarce 0;\nlineIntersection(line(L[7], L[0]), d) = Q și Q.x < P.x => count() întoarce 0;', code: null },
          { label: 'b', points: 2, question: 'Descrieți invariantul menținut de algoritmul de numărare.', answer: 'counter = numărul de intersecții ale lui d cu L[0..i] care schimbă starea intermediară de interior sau exterior a lui P', code: null },
          { label: 'c', points: 2, question: 'Descrieți cum se decide dacă P este interiorul sau exteriorul lui L.', answer: 'Dacă valoarea finală a lui counter este pară, P este exterior.\nDacă valoarea finală a lui counter este impară, P este interior.\nPentru S avem counter = 2, rezultă că P este exterior.', code: null },
        ],
      },
      {
        number: 3,
        points: 9,
        title: { en: 'Set Diameter', ro: 'Diametrul unei mulțimi' },
        statement: 'Se consideră mulțimea S = {(1,1),(3,4),(2,0),(5,4),(6,2),(4,6),(3,1),(2,3)}',
        parts: [
          { label: 'a', points: 2, question: 'Descrieți problema determinării diametrului unei mulțimi.', answer: 'Input: O mulțime finită de puncte în plan S.\nOutput: o pereche de puncte din S aflate la distanța cea mai mare.', code: null },
          { label: 'b', points: 3, question: 'Să se descrie cum se calculează punctele antipodale ale lui S.', answer: 'Se calculează înfășurătoarea convexă a lui S, CH(S)= ⟨P0, P2, P4, P5, P7⟩.\nSe pleacă din P7P0.\n- punctele antipodale cu P0: P4\n- punctele antipodale cu P2: P5\n- punctele antipodale cu P4: P0\n- punctele antipodale cu P5: P0\n- punctele antipodale cu P7: P4\nLista de perechi antipodale: AP(S) = ⟨(P0, P4), (P2, P5), (P4, P0), (P5, P2), (P7, P4)⟩', code: null },
          { label: 'c', points: 2, question: 'Să se arate cum se calculează diametrul lui S.', answer: 'Se caută perechea aflată la distanța cea mai mare din AP(S): (P2, P5)', code: null },
          { label: 'd', points: 2, question: 'Să se precizeze timpul de execuție pentru cazul cel mai nefavorabil.', answer: 'Dacă se utilizează pentru CH(S) algoritmul lui Jarvis, atunci complexitatea timp este O(n²). Dacă se utilizează scanarea Graham, atunci complexitatea timp este O(n log n).', code: null },
        ],
      },
    ],
  },

  // ── 2017 A ────────────────────────────────────────────
  {
    id: 'partial-2017-a',
    type: 'partial',
    year: 2017,
    variant: 'A',
    series: 'A + X',
    title: { en: 'Partial 2017 — Variant A (Series A+X)', ro: 'Partial 2017 — Varianta A (Seriile A+X)' },
    duration: '1 oră',
    totalPoints: 27,
    problems: [
      {
        number: 1,
        points: 9,
        title: { en: 'Design and Analysis — Set Testing', ro: 'Proiectare și analiză — Testarea mulțimilor' },
        statement: 'Se consideră problema testării dacă o listă de elemente reprezintă o mulțime. Reamintim că într-o mulțime un element poate apărea cel mult o dată. Notăm această problemă cu ST.',
        parts: [
          { label: 'a', points: 2, question: 'Să se formuleze ST ca pereche (input, output).', answer: 'Input: L = (a₀, a₁, ..., aₙ₋₁), n ≥ 0, aᵢ ∈ A\nOutput: true dacă (∀i,j) i ≠ j ⟹ aᵢ ≠ aⱼ\nfalse, altfel, i.e. (∃i,j ∈ {0..n-1}) i ≠ j ∧ aᵢ = aⱼ', code: null },
          { label: 'b', points: 3, question: 'Să se scrie un algoritm determinist care rezolvă ST.', answer: null, code: 'ST(L) {\n  if (L.size() == 0) return true;\n  for (i=0; i < L.size()-1; ++i)\n    for (j=i+1; j < L.size(); ++j)\n      if (L[i] == L[j]) return false;\n  return true;\n}' },
          { label: 'c', points: 2, question: 'Să se justifice că algoritmul rezolvă corect problema.', answer: 'Invariantul primului for: (∀k ∈ {0..i-1}, ℓ ∈ {0..n-1}) k ≠ ℓ ⟹ L[k] ≠ L[ℓ]\nProgramul se termină dacă i ≠ j și L[i] == L[j], sau dacă se termină ambele instrucțiuni for, caz în care i == n == L.size(); aceasta împreună cu invariantul asigură faptul că valoarea true este corect calculată.', code: null },
          { label: 'd', points: 2, question: 'Să se calculeze complexitatea în cazul cel mai nefavorabil.', answer: 'Dimensiunea unei instanțe: n = dimensiunea listei L\nOperații numărate: comparații în care apar elemente ale listei L\nCazul cel mai nefavorabil: L reprezintă o mulțime (instrucțiunile for se execută complet).\nTimp: n(n-1)/2 = O(n²)', code: null },
        ],
      },
      {
        number: 2,
        points: 9,
        title: { en: 'Probabilistic Algorithms — unulDinTrei', ro: 'Algoritmi probabiliști — unulDinTrei' },
        statement: 'Se consideră următorul algoritm probabilist:\nunulDinTrei()\n1. Se alege aleatoriu uniform un element din {0, 1};\n2. Dacă elementul ales este 0, întoarce 0;\n3. Altfel întoarce 1 − unulDinTrei().\nEste posibil să existe și o execuție infinită a algoritmului.',
        parts: [
          { label: 'a', points: 3, question: 'Să se descrie în Alk algoritmul (ca o funcție recursivă).', answer: null, code: 'unulDinTrei() {\n  n = random(2);\n  if (n == 0) return 0;\n  else return 1 - unulDinTrei();\n}' },
          { label: 'b-i', points: 1, question: 'Să se calculeze probabilitatea ca algoritmul să execute exact un apel recursiv.', answer: 'Primul apel recursiv se face cu probabilitatea p₁ = 1/2. Acest apel se termină dacă random întoarce 0, cu probabilitatea 1/2. Probabilitatea este 1/2 · 1/2 = 1/2².', code: null },
          { label: 'b-ii', points: 1, question: 'Să se calculeze probabilitatea pentru două apeluri recursive.', answer: 'Al doilea apel recursiv apare numai dacă apare și primul (probabilitate condiționată): p₂ = 1/2² · 1/2 = 1/2³', code: null },
          { label: 'b-iii', points: 2, question: 'Să se calculeze probabilitatea pentru n apeluri recursive, n ≥ 1.', answer: 'pₙ = 1/2ⁿ⁺¹ (se verifică prin inducție)', code: null },
          { label: 'c', points: 2, question: 'Să se exprime ca o sumă infinită numărul mediu de apeluri recursive.', answer: 'Numărul mediu de apeluri recursive = Σₙ≥₁ n · pₙ = 1 · 1/2² + 2 · 1/2³ + ... + n · 1/2ⁿ⁺¹ + ...', code: null },
        ],
      },
      {
        number: 3,
        points: 9,
        title: { en: 'Computational Geometry', ro: 'Geometrie computațională' },
        statement: '',
        parts: [
          { label: 'a', points: 2, question: 'Să se scrie în Alk o funcție cmp(P, Q, R) pentru compararea coordonatelor polare.', answer: 'dist2(P, Q) calculează pătratul distanței de la P la Q.', code: 'cmp(P, Q, R) {\n  if (ccw(P, Q, R) > 0) return -1;\n  if (ccw(P, Q, R) < 0) return 1;\n  d1 = dist2(P, Q);\n  d2 = dist2(P, R);\n  if (d1 == d2) return 0;\n  if (d1 < d2) return -1;\n  else return 1;\n}' },
          { label: 'b', points: 2, question: 'Exemplificați execuția funcției cmp(P, Q, R) pe două exemple.', answer: '1. P={x→2,y→2}, Q={x→4,y→3}, R={x→3,y→4}: ccw(P,Q,R)=1, deci cmp întoarce -1.\n2. P={x→2,y→2}, Q={x→4,y→6}, R={x→3,y→4}: ccw(P,Q,R)=0, dist2(P,Q)=20 > 5=dist2(P,R), deci cmp întoarce 1.', code: null },
          { label: 'c', points: 2, question: 'Să se scrie în Alk un algoritm lowermost(S).', answer: null, code: 'lowermost(S) {\n  if (S.size() == 0) return "error";\n  min = S[0];\n  for (i=1; i < S.size(); ++i)\n    if (min.y < S[i].y) min = S[i];\n  return min;\n}' },
          { label: 'd', points: 2, question: 'Să se scrie în Alk un algoritm sort(S) utilizând cmp() și lowermost().', answer: null, code: 'sort(out S) {\n  P = lowermost(S);\n  for (i=0; i < S.size(); ++i)\n    for (j=i+1; j < S.size(); ++j)\n      if (cmp(P, S[i], S[j]) == 1)\n        swap(S, i, j);\n}' },
          { label: 'e', points: 1, question: 'Să se precizeze complexitatea algoritmului de sortare.', answer: 'Dimensiunea: n = S.size(). Complexitatea timp a lowermost(S) este O(n). Cele două instrucțiuni for realizează n(n-1)/2 = O(n²) comparații.', code: null },
        ],
      },
    ],
  },

  // ── 2017 B ────────────────────────────────────────────
  {
    id: 'partial-2017-b',
    type: 'partial',
    year: 2017,
    variant: 'B',
    series: 'B + E',
    title: { en: 'Partial 2017 — Variant B (Series B+E)', ro: 'Partial 2017 — Varianta B (Seriile B+E)' },
    duration: '1 oră',
    totalPoints: 27,
    problems: [
      {
        number: 1,
        points: 9,
        title: { en: 'Design and Analysis — Multiset Membership', ro: 'Proiectare și analiză — Apartenență la multi-mulțime' },
        statement: 'Un element-multiplu este o pereche formată dintr-un element x și numărul de apariții ale acestuia. O multi-mulțime este o mulțime de elemente-multiple cu proprietatea că nu există două elemente-multiple care se referă la același element x. Se consideră problema determinării apartenenței unui element-multiplu la o multi-mulțime. Notăm această problemă cu INM.',
        parts: [
          { label: 'a', points: 2, question: 'Să se formuleze INM ca pereche (input, output).', answer: 'Input: S = {(x₀,k₀),...,(xₙ₋₁,kₙ₋₁)}, a = (y,k), a.î. (∀i,j ∈ {0..n-1}) i ≠ j ⟹ xᵢ ≠ xⱼ\nOutput: true dacă a ∈ S, i.e. (∃i) 0 ≤ i < n ∧ y == xᵢ ∧ nᵢ ≥ k\nfalse altfel', code: null },
          { label: 'b', points: 3, question: 'Să se scrie un algoritm determinist care rezolvă INM.', answer: null, code: 'INM(S, a) {\n  for (i=0; i < S.size(); ++i)\n    if (S[i].n == a.n && S[i].k >= a.k) return true;\n  return false;\n}' },
          { label: 'c', points: 2, question: 'Să se justifice că algoritmul rezolvă corect problema.', answer: 'Invariantul buclei for: (∀j ∈ {0..i-1}) z ≠ xⱼ ∨ nⱼ < k\nFuncția întoarce true numai dacă S[i].n == a.n && S[i].k >= a.k, adică a ∈ S.\nFuncția întoarce false numai dacă execuția instrucțiunii for se termină normal.', code: null },
          { label: 'd', points: 2, question: 'Să se calculeze complexitatea în cazul cel mai nefavorabil.', answer: 'n = S.size(). Cazul cel mai nefavorabil: când a nu apare în S. Bucla for se execută de n ori. Timpul = n = O(n).', code: null },
        ],
      },
      {
        number: 2,
        points: 9,
        title: { en: 'Probabilistic Algorithms — Minimum', ro: 'Algoritmi probabiliști — Minim' },
        statement: 'Se consideră următorul algoritm probabilist care determină minimul dintr-un tablou:\nminim(a, n)\n1. Se inițializează min cu o valoare foarte mare (∞);\n2. elementele tabloului a sunt alese pe rând aleatoriu, utilizând o distribuție uniformă, și pentru fiecare element a[i] ales\n2.1. dacă a[i] < min atunci atribuie a[i] lui min (*).',
        parts: [
          { label: 'a', points: 3, question: 'Să se descrie în Alk algoritmul.', answer: null, code: 'minim(a,n) {\n  min = ∞;\n  S = { 0 .. n };\n  while (n > 0) {\n    i = uniform(S);\n    S = S \\ singletonSet(i);\n    if (a[i] < min) min = a[i];\n    n = S.size();\n  }\n}' },
          { label: 'b-i', points: 1, question: 'Probabilitatea ca algoritmul să execute atribuirea (*) în n-a iterație.', answer: 'a[iₙ] trebuie să fie elementul minim din a. Echivalent, minimul apare pe poziția n-1 în tabloul permutat.\npₙ = (n-1)!/n! = 1/n', code: null },
          { label: 'b-ii', points: 1, question: 'Probabilitatea pentru a (n-1)-a iterație.', answer: 'a[iₙ₋₁] trebuie să fie cel mai mic din a[i₁..iₙ₋₁].\npₙ₋₁ = (n-2)!/(n-1)! = 1/(n-1)', code: null },
          { label: 'b-iii', points: 2, question: 'Probabilitatea pentru a i-a iterație, 1 ≤ i ≤ n.', answer: 'pᵢ = (i-1)!/i! = 1/i', code: null },
          { label: 'c', points: 2, question: 'Să se exprime ca o sumă numărul mediu de execuții ale atribuirii (*).', answer: 'M(A) = Σⁿᵢ₌₁ 1·pᵢ = 1 + 1/2 + ... + 1/(n-1) + 1/n', code: null },
        ],
      },
      {
        number: 3,
        points: 9,
        title: { en: 'Computational Geometry — Convex Hull of Simple Polyline', ro: 'Geometrie computațională — Înfășurătoarea convexă a unei linii poligonale' },
        statement: '',
        parts: [
          { label: 'a', points: 3, question: 'Să se scrie în Alk un algoritm care determină înfășurătoarea convexă a unei linii poligonale simple. Complexitatea O(n).', answer: null, code: 'CHLPS(P) {\n  n = P.size();\n  if (P[0] != P[n-1]) {\n    P[n] = P[0];\n    n = n+1;\n  }\n  L[0] = P[0]; L[1] = P[1]; k = 2;\n  for (i = 2; i < n; ++i) {\n    while (ccw(L[k-2], L[k-1], P[i]) < 0) {\n      --k;\n    }\n    L[k] = P[i];\n    ++k;\n  }\n  return L;\n}' },
          { label: 'c', points: 2, question: 'Să se justifice corectitudinea algoritmului.', answer: 'Invariant for: Toate punctele din linia P se află în stânga liniei poligonale convexe L[0..k-1].\nLa sfârșit L devine poligon convex și toate punctele din P se află pe L sau în interior.', code: null },
          { label: 'd', points: 2, question: 'Să se arate că într-adevăr complexitatea este O(n).', answer: 'Numărul de puncte din L[0..k-1] ∪ P[i..n-1] scade cu o unitate la fiecare iterație for + while.', code: null },
        ],
      },
    ],
  },

  // ── 2019 A ────────────────────────────────────────────
  {
    id: 'partial-2019-a',
    type: 'partial',
    year: 2019,
    variant: 'A',
    series: 'A + E',
    title: { en: 'Partial 2019 — Variant A (Series A+E)', ro: 'Partial 2019 — Varianta A (Seriile A+E)' },
    duration: '1 oră',
    totalPoints: 36,
    problems: [
      {
        number: 1,
        points: 12,
        title: { en: 'Design and Analysis — M35', ro: 'Proiectare și analiză — M35' },
        statement: 'Se consideră următoarea problemă, notată M35. Dacă enumerăm toate numerele naturale mai mici decât 10 care sunt multiplu de 3 sau 5, obținem 3, 5, 6 și 9. Suma acestor multipli este 23. Care este suma tuturor multiplilor de 3 sau 5 mai mici decât N, unde N este un număr natural multiplu de 10?',
        parts: [
          { label: 'a', points: 2, question: 'Să se formuleze M35 ca pereche (input, output).', answer: 'Input: N, N ∈ ℕ ∧ N % 10 == 0\nOutput: S = Σ{x | 1 ≤ x < N, x % 3 == 0 ∨ x % 5 == 0}', code: null },
          { label: 'b', points: 4, question: 'Să se scrie un algoritm determinist care rezolvă M35.', answer: null, code: 'M35(N) {\n  S = 0;\n  for (x = 3; x < N; ++x)\n    if (x % 3 == 0 || x % 5 == 0)\n      S = S + x;\n  return S;\n}' },
          { label: 'c', points: 3, question: 'Să se justifice că algoritmul rezolvă corect problema.', answer: 'La începutul unei iterații for S reprezintă suma multiplilor de 3 sau 5 mai mici decât x. Condiția lui if și instrucțiunea S = S + x asigură menținerea acestui invariant. La terminarea lui for x va fi egal cu N, astfel că S va avea valoarea cerută de problemă.', code: null },
          { label: 'd', points: 3, question: 'Să se calculeze complexitatea timp în cazul cel mai nefavorabil.', answer: 'Dimensiunea unei instanțe: N\nOperații numărate: Comparații cu 3 și 5.\nCazul cel mai nefavorabil: Există o singură instanță cu dimensiunea N.\nTimp: (N - 3) * 2', code: null },
        ],
      },
      {
        number: 2,
        points: 5,
        title: { en: 'Nondeterministic Algorithms', ro: 'Algoritmi nedeterminiști' },
        statement: 'Se consideră următoarea problemă de decizie: Dat un număr natural M, este M suma a două numere impare consecutive?',
        parts: [
          { label: 'a', points: 2, question: 'Să se scrie un algoritm nedeterminist care rezolvă problema.', answer: null, code: 'oddSum(M) {\n  choose x in {1 .. M};\n  if (x % 2 == 1 && M == x + x + 2)\n    print("success");\n  else print("failure");\n}' },
          { label: 'b', points: 2, question: 'Să se descrie două calcule ale algoritmului, unul cu succes și unul cu eșec.', answer: 'oddSum(12): choose x in 1..M; alege 5, 5 este impar și 12 = 5 + 7, așa că algoritmul se termină cu succes.\noddSum(12): choose x in 1..M; alege 4 și deoarece 4 este par algoritmul se termină cu eșec.', code: null },
          { label: 'c', points: 1, question: 'Să se determine complexitatea timp a algoritmului.', answer: 'Deoarece atât execuția lui choose cât și cea a lui if se fac în O(1), rezultă că timpul de execuție a întregului algoritm este O(1).', code: null },
        ],
      },
      {
        number: 3,
        points: 8,
        title: { en: 'Probabilistic Algorithms — Average Complexity', ro: 'Algoritmi probabiliști — Complexitate medie' },
        statement: 'Se consideră următorul algoritm probabilist:\nInput: două tablouri, a și b, conținând permutări ale secvenței (1,2,...,n).\nOutput: i, j cu proprietatea a[i] = b[j].\n1. alege aleatoriu uniform un element a[i];\n2. pentru j = 0,...,n-2\n2.1 dacă a[i] == b[j] atunci întoarce perechea (i,j);\n3. întoarce perechea (i, n-1);',
        parts: [
          { label: 'a', points: 2, question: 'Să se descrie în Alk algoritmul (ca o funcție).', answer: null, code: 'eqTest(a, b) {\n  n = a.size();\n  i = random(n);\n  for (j = 0; j < n-1; ++j)\n    if (a[i] == b[j]) return <i,j>;\n  return <i, n-1>;\n}' },
          { label: 'b', points: 2, question: 'Fie Xⱼ variabila aleatorie de tip indicator care indică faptul că a[i] == b[j] are loc. Să se calculeze probabilitatea ca Xⱼ să ia valoarea 1.', answer: 'Probabilitatea ca Xⱼ să ia valoarea 1 este egală cu probabilitatea ca a[i] să se afle pe poziția j în tabloul b, adică 1/n.', code: null },
          { label: 'c', points: 2, question: 'Să se descrie variabila aleatorie care exprimă numărul de teste a[i] == b[j] executate de algoritm.', answer: 'Deoarece se fac j+1 teste până avem a[i] == b[j], rezultă T = Σⱼ₌₀ⁿ⁻² (j+1)Xⱼ.', code: null },
          { label: 'd', points: 2, question: 'Să se utilizeze această variabilă aleatorie pentru a calcula numărul mediu de teste.', answer: 'exp-time(n) = M(T) = Σⱼ₌₀ⁿ⁻² (j+1)·M(Xⱼ) = Σⱼ₌₀ⁿ⁻² (j+1)·1/n = 1/n · (n-1)n/2 = (n-1)/2', code: null },
        ],
      },
      {
        number: 4,
        points: 7,
        title: { en: 'String Searching — KMP', ro: 'Căutare peste șiruri — KMP' },
        statement: '',
        parts: [
          { label: 'a', points: 4, question: 'Să se scrie un algoritm care, pentru un șir dat, determină cel mai lung subșir propriu ce este și prefix și sufix al șirului dat (fără a calcula funcția eșec).', answer: null, code: 'sufpref(a) {\n  m = a.size();\n  ipref = -1;\n  for (i = 0; i < m-1; ++i) {\n    j = 0;\n    while (j <= i && a[i-j] == a[m-1-j]) {\n      ++j;\n    }\n    if (j > i) ipref = i;\n  }\n  return ipref;\n}' },
          { label: 'b', points: 2, question: 'De ce nu se preferă un astfel de algoritm pentru calculul funcției eșec?', answer: 'Complexitatea timp a algoritmului sufpref este O(m²), ceea ce duce la o complexitate timp O(m³) pentru calculul funcției de eșec.', code: null },
          { label: 'c', points: 1, question: 'Să se descrie un caz când KMP execută n comparații.', answer: 'Textul (subiectul) este format numai din litere și patternul numai din cifre.', code: null },
        ],
      },
      {
        number: 5,
        points: 4,
        title: { en: 'Regular Expressions', ro: 'Expresii regulate' },
        statement: '',
        parts: [
          { label: 'a', points: 2, question: 'Să se construiască automatul pentru expresia b(aba)*ba.', answer: 'Automatul nedeterminist are stările 0-8 cu tranzițiile: 0→1(b), 1→2(ε), 2→3(a), 3→4(b), 4→5(a), 5→6(ε), 6→7(b), 7→8(a).\nAutomatul determinist echivalent: 0→1(b), 1→3(a), 3→4(b), 4→3(a)/4→7(b), 7→8(a).', code: null },
          { label: 'b', points: 2, question: 'Să se explice cum se face căutarea unui șir descris de această expresie în textul abacbbaabaabababba.', answer: 'Se parcurge textul caracter cu caracter, urmărind stările automatului.\nPozițiile de start testate: 0 (nepotrivire), 1-3 (nepotriviri), 4 (potrivire: b→b→a = "bba" la poziția 4, stare de acceptare 8).', code: null },
        ],
      },
    ],
  },

  // ── 2019 B ────────────────────────────────────────────
  {
    id: 'partial-2019-b',
    type: 'partial',
    year: 2019,
    variant: 'B',
    series: 'B + X',
    title: { en: 'Partial 2019 — Variant B (Series B+X)', ro: 'Partial 2019 — Varianta B (Seriile B+X)' },
    duration: '1 oră',
    totalPoints: 36,
    problems: [
      {
        number: 1,
        points: 12,
        title: { en: 'Design and Analysis — D1M', ro: 'Proiectare și analiză — D1M' },
        statement: '2520 este cel mai mic număr natural care poate fi împărțit exact la fiecare dintre numerele de la 1 la 10. Care este cel mai mic număr pozitiv care este divizibil cu toate numerele de la 1 la M, unde M este multiplu de 2 și 5?',
        parts: [
          { label: 'a', points: 2, question: 'Să se formuleze D1M ca pereche (input, output).', answer: 'Input: M, M ∈ ℕ ∧ M % 2 == 0 ∧ M % 5 == 0\nOutput: N = min{x | ∀i. 1 ≤ i ≤ M → x % i == 0}', code: null },
          { label: 'b', points: 4, question: 'Să se scrie un algoritm determinist care rezolvă D1M.', answer: null, code: 'D1M(M) {\n  N = 1;\n  do {\n    ismult = true;\n    for (i = 1; i <= M && ismult; ++i) {\n      if (N % i != 0) ismult = false;\n    }\n    if (! ismult) ++N;\n  } while (!ismult);\n  return N;\n}' },
          { label: 'c', points: 3, question: 'Să se justifice că algoritmul rezolvă corect problema.', answer: 'La începutul unei iterații do niciun număr între 1 și N-1 nu satisface cerința problemei (invariant). La terminarea instrucțiunii do ismult are valoarea true, adică N se divide prin toate numerele 1 și M. Invariantul ne asigură că e cel mai mic cu această proprietate.', code: null },
          { label: 'd', points: 3, question: 'Să se calculeze complexitatea în cazul cel mai nefavorabil.', answer: 'Dimensiunea: M. Operații numărate: Comparații N % i != 0.\nTimp: O(N · M), unde N este valoarea întoarsă de algoritm. N ≤ M!.', code: null },
        ],
      },
      {
        number: 2,
        points: 5,
        title: { en: 'Nondeterministic Algorithms', ro: 'Algoritmi nedeterminiști' },
        statement: 'Se consideră următoarea problemă de decizie: Dat un număr natural M, este M produsul a trei numere naturale consecutive?',
        parts: [
          { label: 'a', points: 2, question: 'Să se scrie un algoritm nedeterminist care rezolvă problema.', answer: null, code: 'prod3cons(M) {\n  choose x in {1..M};\n  if (M == (x-1)*x*(x+1))\n    print("success");\n  else\n    print("failure");\n}' },
          { label: 'b', points: 2, question: 'Să se descrie două calcule ale algoritmului, unul cu succes și unul cu eșec.', answer: 'prod3cons(60): choose x in 1..M; alege 4 și 3*4*5 = 60, așa că algoritmul se termină cu succes.\nprod3cons(60): choose x in 1..M; alege 7 și deoarece 6*7*8 ≠ 60 algoritmul se termină cu eșec.', code: null },
          { label: 'c', points: 1, question: 'Să se determine complexitatea timp a algoritmului.', answer: 'Deoarece atât execuția lui choose cât și cea a lui if se fac în O(1), rezultă că timpul de execuție a întregului algoritm este O(1).', code: null },
        ],
      },
      {
        number: 3,
        points: 8,
        title: { en: 'Probabilistic Algorithms — Average Complexity', ro: 'Algoritmi probabiliști — Complexitate medie' },
        statement: 'Se consideră următorul algoritm probabilist:\nInput: un număr natural m egal cu produsul a două numere prime distincte, un număr natural nenul n < m.\nOutput: perechea formată dintr-un tablou a cu n elemente ∈ {2,3,...,m-1} și un index i astfel încât a[i] divide pe m, dacă există; altfel perechea formată din tabloul vid și -1.',
        parts: [
          { label: 'a', points: 2, question: 'Să se descrie în Alk algoritmul (ca o funcție).', answer: null, code: 'modm(m, n) {\n  a = [];\n  for (i = 0; i < n; ++i)\n    a[i] = random(m-2)+2;\n  for (i = 0; i < n; ++i)\n    if (m % a[i] == 0)\n      return <a, i>;\n  return <[], -1>;\n}' },
          { label: 'b', points: 2, question: 'Fie Xᵢ variabila aleatorie de tip indicator care indică faptul că i este cel mai mic index cu proprietatea a[i] divide m. Să se calculeze probabilitatea ca Xᵢ să ia valoarea 1.', answer: 'Probabilitatea ca "a[i] divide m" este 2/(m-2). Probabilitatea ca "a[i] să nu dividă m" este (m-4)/(m-2). Probabilitatea ca Xᵢ = 1 este (2/(m-2)) · ((m-4)/(m-2))ⁱ.', code: null },
          { label: 'c', points: 2, question: 'Să se descrie variabila aleatorie care exprimă numărul de teste "a[i] divide m" executate de algoritm.', answer: 'Deoarece se fac i+1 teste până avem "a[i] divide m", rezultă T = Σᵢ₌₀ⁿ⁻¹ (i+1)Xᵢ.', code: null },
          { label: 'd', points: 2, question: 'Să se utilizeze această variabilă aleatorie pentru a determina expresia ce dă numărul mediu de teste.', answer: 'exp-time(n) = M(T) = Σᵢ₌₀ⁿ⁻¹ (i+1)·(2/(m-2))·((m-4)/(m-2))ⁱ', code: null },
        ],
      },
      {
        number: 4,
        points: 7,
        title: { en: 'String Searching — Boyer-Moore', ro: 'Căutare peste șiruri — Boyer-Moore' },
        statement: '',
        parts: [
          { label: 'a', points: 4, question: 'Se presupune că alfabetul este {0,1,2,...,k-1}. Să se scrie un algoritm cu complexitatea O(k) care calculează funcția salt.', answer: null, code: 'detsalt(k, a, out salt) {\n  n = a.size();\n  for (i = 0; i < k; ++i)\n    salt[i] = n;\n  for (i = n-1; i >= 0; --i)\n    if (salt[a[i]] == n) salt[a[i]] = n-1-i;\n}' },
          { label: 'b', points: 2, question: 'Să se arate cum se modifică regula caracterului rău dacă în loc de funcția salt se consideră salt1 definită prin salt1(C) = max({0} ∪ {j | p[j] = C}).', answer: 'Saltul pentru un caracter C este acum m-1-salt1(C).\nif ((m-j) > m-salt1[s[i]]) i = i+m-j;\nelse i = i+(m-1-salt1[s[i]]);', code: null },
          { label: 'c', points: 1, question: 'Să se descrie un caz când regula sufixului bun nu este eficientă.', answer: 'Când patternul nu include subșiruri repetate.', code: null },
        ],
      },
      {
        number: 5,
        points: 4,
        title: { en: 'Regular Expressions', ro: 'Expresii regulate' },
        statement: '',
        parts: [
          { label: 'a', points: 2, question: 'Să se construiască automatul pentru expresia a(ba)*c(ab)*c.', answer: 'Automatul nedeterminist cu 12 stări. Automatul determinist echivalent: 0→1(a), 1→3(b/c), 3→6(c)/3→4(a), 6→8(a), 8→9(b), 9→11(c).', code: null },
          { label: 'b', points: 2, question: 'Să se explice cum se face căutarea în textul abbacababaa.', answer: 'Se parcurge textul urmărind stările automatului deterministic. S-a găsit o apariție a lui "acabc" la poziția 3.', code: null },
        ],
      },
    ],
  },

  // ── 2022 A ────────────────────────────────────────────
  {
    id: 'partial-2022-a',
    type: 'partial',
    year: 2022,
    variant: 'A',
    series: 'Seria I',
    title: { en: 'Partial 2022 — Variant A (Series I)', ro: 'Partial 2022 — Varianta A (Seria I)' },
    duration: '1 oră',
    totalPoints: 40,
    problems: [
      {
        number: 1,
        points: 15,
        title: { en: 'Design and Analysis — Pentagonal Numbers', ro: 'Proiectare și analiză — Numere pentagonale' },
        statement: 'Numerele pentagonale sunt generate de formule de forma P(n) = n(3n-1)/2, n = 1,2,.... Primele numere pentagonale sunt 1, 5, 12, 22, 35, 51, .... Un șir de numere este pentagonal dacă toate numerele din șir sunt pentagonale. Problema P1 constă în determinarea dacă un șir este pentagonal.',
        parts: [
          { label: 'a', points: 3, question: 'Să se precizeze P1 ca pereche (Input, Output).', answer: 'Input: s = (x₀, x₁, ..., xₙ₋₁), n > 0, xᵢ ∈ ℕ\nOutput: true dacă pentru orice i cu 0 ≤ i < n, isPentagonal(xᵢ). Predicatul isPentagonal(x) are loc ddacă ∃n ∈ ℕ. x = n(3n-1)/2.\nfalse dacă există i cu 0 ≤ i < n a.î. ¬isPentagonal(xᵢ).', code: null },
          { label: 'b', points: 3, question: 'Să se scrie un algoritm care decide dacă un număr natural dat este pentagonal.', answer: null, code: 'isPentagonalNat(x) {\n  if (x <= 0) failure;\n  a = 1 + 24 * x;\n  b = int(sqrt(a));\n  if (b*b == a && (1+b)%6 == 0)\n    return true;\n  else\n    return false;\n}' },
          { label: 'c', points: 3, question: 'Să se scrie un algoritm care rezolvă P1.', answer: null, code: 'isPentagonalStr(s) {\n  for (i=0; i < s.size(); ++i)\n    if (! isPentagonalNat(s[i]))\n      return false;\n  return true;\n}' },
          { label: 'd', points: 2, question: 'Să se justifice cât mai riguros că algoritmul este corect.', answer: 'x = n(3n-1)/2 este echivalent cu 3n²-n-2x = 0. x este pentagonal ddacă ecuația are o rădăcină număr natural, egală cu (1+√(1+24x))/6. Funcția isPentagonalNat(x) verifică asta. Corectitudinea funcției isPentagonalStr(s) rezultă din invariantul menținut de for: pentru orice j cu 0 ≤ j < i, s[j] este pentagonal.', code: null },
          { label: 'e', points: 4, question: 'Să se determine timpul de execuție pentru cazul cel mai nefavorabil.', answer: 'Dimensiunea: n = s.size()\nOperații: isPentagonalNat(s[i]) cu timpul O(1)\nCazul cel mai nefavorabil: toate numerele din s sunt pentagonale\nTimp: T(n) = n · O(1) = O(n)', code: null },
        ],
      },
      {
        number: 2,
        points: 10,
        title: { en: 'Probabilistic Algorithms — alg2', ro: 'Algoritmi probabiliști — alg2' },
        statement: 'Se consideră următorul algoritm:\nalg2(S) { k = uniformNat(S.size()+1); A = {}; for (i=0; i < k; ++i) { uniform x from S; if (x % 2 == 1) x = x+1; A = A ∪ {x}; S = S \\ {x}; } return A; }',
        parts: [
          { label: 'a', points: 3, question: 'Să se descrie problema rezolvată de algoritm.', answer: 'Input: O mulțime S = {x₀,...,xₙ₋₁} cu elementele xᵢ numere naturale. S poate fi și mulțimea vidă.\nOutput: A cu proprietatea că există o submulțime B ⊆ S a.î. A = {x | x ∈ B, x par} ∪ {x+1 | x ∈ B, x impar}.', code: null },
          { label: 'b', points: 2, question: 'Menționați o implementare a mulțimilor în care operațiile de adăugare și eliminare se realizează în O(1).', answer: 'Presupunând S ⊆ {0,1,2,...,N}, se va considera reprezentarea lui S prin vectorul caracteristic: S[i] = 1 dacă i ∈ S, S[i] = 0 altfel.', code: null },
          { label: 'c', points: 5, question: 'Să se calculeze complexitatea medie (așteptată) a algoritmului.', answer: 'Valorile tᵢ posibile pentru timp: 0, 3, 6, ..., 3·S.size().\nPresupunem n = S.size(), n > 0.\npₖ = 1/(n+1) (= probabilitatea alegerii lui k).\nTimp mediu: exp-time(n) = Σₖ₌₁ⁿ tₖ·pₖ = 3/(n+1)·(1+2+...+n) = 3n/2', code: null },
        ],
      },
      {
        number: 3,
        points: 15,
        title: { en: 'NP-Complete Problems', ro: 'Probleme NP-complete' },
        statement: '',
        parts: [
          { label: 'a', points: 4, question: 'Dacă P ≠ NP și există cel puțin o problemă din clasa NP cu o rezolvare polinomială, atunci sigur există o rezolvare polinomială pentru orice problemă din clasa NP. Justificați că DA sau NU.', answer: 'NU.\nContraexemplu: Fie problema 2-SAT, care are o rezolvare polinomială. Fie problema 3-SAT, care este NP-completă (Cook, 1961). 3-SAT nu are rezolvare polinomială, deși este în NP (dacă 3-SAT ar avea o rezolvare polinomială, cum orice problemă din NP se reduce în timp polinomial la 3-SAT, obținem P = NP, contradicție).', code: null },
          { label: 'b', points: 3, question: 'Definiți problemele VERTEX-COVER și INDEPENDENT-SET.', answer: 'VERTEX-COVER\nInput: G = (V,E), k ∈ ℕ\nOutput: există V\' ⊆ V a.î. |V\'| ≤ k și pentru orice muchie {u,v} ∈ E avem u ∈ V\' sau v ∈ V\'?\n\nINDEPENDENT-SET\nInput: G = (V,E), k ∈ ℕ\nOutput: există V\' ⊆ V a.î. |V\'| ≥ k și pentru orice muchie {u,v} ∈ E avem u ∉ V\' și v ∉ V\'?', code: null },
          { label: 'c', points: 4, question: 'Arătați că problema VERTEX-COVER este în NP.', answer: 'Algoritmul nedeterminist rezolvă VERTEX-COVER în O(n³):\ni. ghicim o submulțime V\' ⊆ V de noduri (în timp O(n));\nii. verificăm dacă |V\'| ≤ k și ∀u ∈ V · ∀v ∈ V · {u,v} ∈ E → u ∈ V\' ∨ v ∈ V\' (două for-uri imbricate; timp O(n³)).', code: null },
          { label: 'd', points: 4, question: 'Găsiți o reducere polinomială de tip Karp de la VERTEX-COVER la INDEPENDENT-SET.', answer: 'Considerăm G = (V,E), k ∈ ℕ date de intrare pentru VERTEX-COVER.\nCalculăm k\' = |V| - k.\nVERTEX-COVER(G, k) = INDEPENDENT-SET(G, k\')\n(complementul unei mulțimi stabile este o acoperire)', code: null },
        ],
      },
    ],
  },

  // ── 2022 B ────────────────────────────────────────────
  {
    id: 'partial-2022-b',
    type: 'partial',
    year: 2022,
    variant: 'B',
    series: 'Seria II',
    title: { en: 'Partial 2022 — Variant B (Series II)', ro: 'Partial 2022 — Varianta B (Seria II)' },
    duration: '1 oră',
    totalPoints: 40,
    problems: [
      {
        number: 1,
        points: 15,
        title: { en: 'Design and Analysis — Hexagonal Numbers', ro: 'Proiectare și analiză — Numere hexagonale' },
        statement: 'Numerele hexagonale sunt generate de formule de forma H(n) = n(2n-1), n = 1,2,.... Primele numere hexagonale sunt 1, 6, 15, 28, 45, .... Problema P1 constă în determinarea dacă un șir de numere naturale include cel puțin două numere hexagonale.',
        parts: [
          { label: 'a', points: 3, question: 'Să se precizeze P1 ca pereche (Input, Output).', answer: 'Input: s = (x₀, x₁, ..., xₙ₋₁), n > 0, xᵢ ∈ ℕ\nOutput: true dacă există i,j cu 0 ≤ i < j < n a.î. isHexagonal(xᵢ) ∧ isHexagonal(xⱼ).\nfalse dacă pentru orice i,j cu 0 ≤ i < j < n avem ¬isHexagonal(xᵢ) ∨ ¬isHexagonal(xⱼ).', code: null },
          { label: 'b', points: 3, question: 'Să se scrie un algoritm care decide dacă un număr natural dat este hexagonal.', answer: null, code: 'isHexagonal(x) {\n  if (x <= 0) failure;\n  a = 1 + 8 * x;\n  b = int(sqrt(a));\n  if (b*b == a && (1+b)%4 == 0)\n    return true;\n  else\n    return false;\n}' },
          { label: 'c', points: 3, question: 'Să se scrie un algoritm care rezolvă P1.', answer: null, code: 'hasHexaPairs(s) {\n  i = -1;\n  for (k=0; k < s.size(); ++k)\n    if (isHexagonal(s[k])) {\n      if (i < 0)\n        i = k;\n      else\n        return true;\n    }\n  return false;\n}' },
          { label: 'd', points: 2, question: 'Să se justifice cât mai riguros că algoritmul este corect.', answer: 'x = n(2n-1) este echivalent cu 2n²-n-x = 0. x este hexagonal ddacă ecuația are o rădăcină număr natural, egală cu (1+√(1+8x))/4. Funcția isHexagonal(x) verifică asta. Corectitudinea funcției hasHexaPairs(s) rezultă din invariantul menținut de for: subșirul s[0..k-1] include cel mult un număr ce este hexagonal.', code: null },
          { label: 'e', points: 4, question: 'Să se determine timpul de execuție pentru cazul cel mai nefavorabil.', answer: 'Dimensiunea: n = s.size()\nOperații: isHexagonal(s[k]) cu timpul O(1)\nCazul cel mai nefavorabil: s include cel mult un număr hexagonal\nTimp: T(n) = n · O(1) = O(n)', code: null },
        ],
      },
      {
        number: 2,
        points: 10,
        title: { en: 'Probabilistic Algorithms — Minimum', ro: 'Algoritmi probabiliști — Minim' },
        statement: 'Se consideră algoritmul alg2(S) care determină minimul unei mulțimi prin selectare uniformă aleatoare.',
        parts: [
          { label: 'a', points: 3, question: 'Să se descrie problema rezolvată de algoritm.', answer: 'Input: O mulțime S = {a₀, a₁, ..., aₙ₋₁} cu elemente dintr-o mulțime total ordonată.\nOutput: Cel mai mic element x din S: ∀a.a ∈ S ⟹ x ≤ a, când S este nevidă.', code: null },
          { label: 'b', points: 5, question: 'Să se calculeze numărul mediu (așteptat) de execuții ale atribuirii x = y.', answer: 'T = Σₖ₌₁ⁿ⁻¹ Xₖ, unde Xₖ este variabila aleatorie indicator.\npₖ = 1/(k+1) (probabilitatea de a alege cel mai mic element dintre primele k+1 alese).\nTimp mediu: exp-time(n) = E(T) = Σₖ₌₁ⁿ⁻¹ 1/(k+1) = Θ(ln n)', code: null },
          { label: 'c', points: 2, question: 'Să se precizeze dacă metoda de mai sus este potrivită pentru calculul timpului mediu când S este reprezentată printr-un tablou.', answer: 'Da este potrivită. Comportarea algoritmului probabilist peste mulțimi este echivalentă cu cea a algoritmului determinist când datele de intrare sunt date aleatoriu uniform și oricare două elemente ale tabloului sunt distincte.', code: null },
        ],
      },
      {
        number: 3,
        points: 15,
        title: { en: 'NP-Complete Problems', ro: 'Probleme NP-complete' },
        statement: '',
        parts: [
          { label: 'a', points: 4, question: 'Dacă P ≠ NP, atunci nicio problemă NP-completă nu este în clasa P. Justificați că DA sau NU.', answer: 'DA.\nPresupunem prin reducere la absurd că o problemă X care este NP-completă ar fi în clasa P. Prin definiția NP-completitudinii lui X, orice problemă din NP se reduce în timp polinomial la X. Combinând reducerea polinomială cu algoritmul polinomial pentru X, obținem o rezolvare polinomială pentru orice problemă din NP. Și obținem P = NP (contradicție!).', code: null },
          { label: 'b', points: 3, question: 'Definiți problemele INDEPENDENT-SET și CLIQUE.', answer: 'INDEPENDENT-SET\nInput: G = (V,E), k ∈ ℕ\nOutput: există V\' ⊆ V a.î. |V\'| ≥ k și pentru orice muchie {u,v} ∈ E avem u ∉ V\' și v ∉ V\'?\n\nCLIQUE\nInput: G = (V,E), k ∈ ℕ\nOutput: există V\' ⊆ V a.î. |V\'| ≥ k și pentru orice u ∈ V\', v ∈ V\', u ≠ v avem muchia {u,v} ∈ E?', code: null },
          { label: 'c', points: 4, question: 'Arătați că problema CLIQUE este în NP.', answer: 'Algoritmul nedeterminist rezolvă CLIQUE în O(n²):\ni. ghicim o submulțime V\' ⊆ V de noduri (în timp O(n));\nii. verificăm dacă |V\'| ≥ k și ∀u ∈ V\', ∀v ∈ V\', u ≠ v → {u,v} ∈ E (două for-uri imbricate; timp O(n²)).', code: null },
          { label: 'd', points: 4, question: 'Găsiți o reducere polinomială de tip Karp de la CLIQUE la INDEPENDENT-SET.', answer: 'Fie G = (V,E) și k date de intrare pentru CLIQUE.\nCalculăm G\' = (V, Ē), unde Ē este complementul lui E.\nCLIQUE(G, k) = INDEPENDENT-SET(G\', k)\n(orice clică în G corespunde unei mulțimi stabile în G\')', code: null },
        ],
      },
    ],
  },

  // ── 2022 Example ──────────────────────────────────────
  {
    id: 'partial-2022-ex',
    type: 'partial',
    year: 2022,
    variant: 'Exemplu',
    series: null,
    title: { en: 'Week 8 Test — Example', ro: 'Test Săpt. 8 — Exemplu' },
    duration: '1 oră',
    totalPoints: 20,
    problems: [
      {
        number: 1,
        points: 8,
        title: { en: 'Probabilistic Algorithms — eqTest', ro: 'Algoritmi probabiliști — eqTest' },
        statement: 'Se consideră următorul algoritm probabilist:\nInput: două tablouri, a și b, conținând permutări ale secvenței (1,2,...,n).\nOutput: i, j cu proprietatea a[i] = b[j].',
        parts: [
          { label: 'a', points: 2, question: 'Să se descrie în Alk algoritmul.', answer: null, code: 'eqTest(a, b) {\n  n = a.size();\n  i = uniformNat(n);\n  for (j = 0; j < n-1; ++j)\n    if (a[i] == b[j]) return <i,j>;\n  return <i, n-1>;\n}' },
          { label: 'b', points: 2, question: 'Fie Xⱼ variabila aleatorie. Să se calculeze probabilitatea ca Xⱼ = 1.', answer: 'Probabilitatea ca Xⱼ = 1 este 1/n.', code: null },
          { label: 'c', points: 2, question: 'Să se descrie variabila aleatorie care exprimă numărul de teste.', answer: 'T = Σⱼ₌₀ⁿ⁻² (j+1)Xⱼ', code: null },
          { label: 'd', points: 2, question: 'Să se calculeze numărul mediu de teste.', answer: 'exp-time(n) = Σⱼ₌₀ⁿ⁻² (j+1)·1/n = 1/n · (n-1)n/2 = (n-1)/2', code: null },
        ],
      },
      {
        number: 2,
        points: 12,
        title: { en: 'NP-Complete Problems', ro: 'Probleme NP-complete' },
        statement: '',
        parts: [
          { label: 'a', points: 3, question: 'Clasele de probleme P și NP. Legătura dintre ele. Diferențe.', answer: 'Clasa NP este clasa tuturor problemelor de decizie care pot fi rezolvate de un algoritm nedeterminist în timp polinomial.\nClasa P este clasa tuturor problemelor de decizie care pot fi rezolvate de un algoritm determinist în timp polinomial.\nP ⊆ NP. Nu se știe dacă NP ⊆ P.', code: null },
          { label: 'b', points: 3, question: 'Să se arate că VERTEX COVER ∈ NP.', answer: null, code: 'vertexcover(V, E, k) {\n  count = 0;\n  foreach v from V {\n    choose x[v] from { 0, 1 };\n    count = count + x[v];\n  }\n  if (count > k) failure;\n  foreach e from E {\n    if ((x[e[0]] == 0) && (x[e[1]] == 0)) failure;\n  }\n  success;\n}' },
          { label: 'c', points: 3, question: 'Care dintre reducerile VERTEX COVER la INDEPENDENT-SET sau INDEPENDENT-SET la VERTEX COVER este suficientă pentru a arăta că VERTEX COVER este NP-dificilă?', answer: 'Trebuie să găsim o reducere polinomială de la INDEPENDENT-SET la VERTEX-COVER. INDEPENDENT-SET fiind NP-dificilă, orice problemă din NP se reduce polinomial la INDEPENDENT-SET. Reducerea polinomială fiind tranzitivă, rezultă că orice problemă din NP se reduce polinomial la VERTEX-COVER.', code: null },
          { label: 'd', points: 3, question: 'Să se arate că VERTEX COVER este NP-completă.', answer: 'VERTEX-COVER ∈ NP (punct b). Arătăm că INDEPENDENT-SET se reduce polinomial la VERTEX-COVER:', code: 'AlgIS(V,E,k) {\n  return AlgVertexCover(V,E,|V|-k);\n}' },
        ],
      },
    ],
  },

  // ── 2022 Seria I (variantaA) ──────────────────────────
  {
    id: 'partial-2022-i',
    type: 'partial',
    year: 2022,
    variant: 'Seria I',
    series: 'Seria I',
    title: { en: 'Week 8 Test — Series I (Cubes)', ro: 'Test Săpt. 8 — Seria I (Cuburi)' },
    duration: '1 oră',
    totalPoints: 40,
    problems: [
      {
        number: 1,
        points: 15,
        title: { en: 'Design and Analysis — Cube Decomposition D(m)', ro: 'Proiectare și analiză — Descompunere în cuburi D(m)' },
        statement: 'Pornind de la un întreg pozitiv m, la fiecare pas scădem din m cel mai mare cub perfect care nu depășește m, până când devine 0. De exemplu, cu m = 100, procedura se încheie în 4 pași: 100 →36 →9 →1 →0. Fie D(m) numărul de pași. Problema P1 constă în a calcula D(m).',
        parts: [
          { label: 'a', points: 3, question: 'Să se precizeze P1: formulă recurentă, Input, Output.', answer: 'D(0) = 0. Dacă m > 0, D(m) = D(m - i³) + 1, 0 < i³ ≤ m, ∀j. 0 < j³ ≤ m ⟹ j ≤ i.\nInput: m număr întreg, m ≥ 0\nOutput: D(m)', code: null },
          { label: 'b', points: 3, question: 'Să se scrie un algoritm care construiește un tablou a cu valorile {j³ | 0 < j³ ≤ m}.', answer: null, code: 'a[0] = 0;\ni3 = 1;\ni = 1;\nwhile (i3 <= m) {\n  a[i] = i3;\n  i = i+1;\n  i3 = i*i*i;\n}' },
          { label: 'c', points: 3, question: 'Să se scrie un algoritm care rezolvă P1 utilizând tabloul a.', answer: null, code: 'i = a.size()-1;\nD = 0;\nwhile (m > 0) {\n  while (m >= a[i]) {\n    m = m - a[i];\n    D = D + 1;\n  }\n  i = i - 1;\n}' },
          { label: 'd', points: 3, question: 'Să se justifice cât mai riguros că algoritmii sunt corecți.', answer: 'Bucla while din primul algoritm păstrează invariantul: a include primele i-1 cuburi ≤ m.\nDacă m₀ este valoarea inițială a variabilei m, atunci bucla while exterioară a celui de-al doilea algoritm păstrează invariantul D(m) + D = D(m₀) și a[0..i] include primele i+1 cuburi ≤ m.', code: null },
          { label: 'e', points: 3, question: 'Să se determine timpul de execuție pentru cazul cel mai nefavorabil.', answer: 'Dimensiunea: n = ⌈log₂ m⌉\nOperații: D = D+1\nCazul cel mai nefavorabil pentru n=5: m = 23 = 2×2³ + 7×1 (D = 9)\nTimp: T(n) = O(∛m) = O(∛2ⁿ)', code: null },
        ],
      },
      {
        number: 2,
        points: 10,
        title: { en: 'Probabilistic Algorithms — ransearch', ro: 'Algoritmi probabiliști — ransearch' },
        statement: 'Se consideră algoritmul probabilist ransearch(n, z) care generează aleatoriu un tablou și numără aparițiile lui z.',
        parts: [
          { label: 'a', points: 2, question: 'Să se calculeze probabilitatea pᵢ ca Xᵢ = 1.', answer: 'pᵢ este egal cu probabilitatea cu care este ales s[i] == z, adică 1/n.', code: null },
          { label: 'b', points: 3, question: 'Să se determine valoarea așteptată C(n) a lui k.', answer: 'C(n) = E(Σᵢ₌₀ⁿ⁻¹ Xᵢ) = Σᵢ₌₀ⁿ⁻¹ E(Xᵢ) = Σᵢ₌₀ⁿ⁻¹ 1/n = 1', code: null },
          { label: 'c', points: 3, question: 'Să se precizeze dacă algoritmul probabilist este potrivit pentru calculul timpului mediu al algoritmului determinist search(s, z).', answer: 'DA, dacă se consideră ca input doar tabloul s. Timpul așteptat se calculează ca media variabilei aleatorii timp corespunzătoare unei execuții cu input aleatoriu.', code: null },
          { label: 'd', points: 2, question: 'Să se descrie un alt mod de calcul pentru timpul mediu T(n).', answer: 'Presupunem că z este fixat. pₖ = Cₙᵏ · (n-1)ⁿ⁻ᵏ / nⁿ.\nT(n) = Σₖ₌₀ⁿ k · Cₙᵏ · (n-1)ⁿ⁻ᵏ / nⁿ = 1', code: null },
        ],
      },
      {
        number: 3,
        points: 10,
        title: { en: 'NP-Complete Problems', ro: 'Probleme NP-complete' },
        statement: '',
        parts: [
          { label: 'a', points: 3, question: 'Precizați cele 3 proprietăți care caracterizează clasa NPTIME.', answer: 'NP = {X | X este o problemă de (1) decizie și există un (2) algoritm nedeterminist (3) polinomial în cazul cel mai nefavorabil pentru X.}', code: null },
          { label: 'b', points: 2, question: 'Definiți problemele CLIQUE și MAXIMUM-INDEPENDENT-SET.', answer: 'CLIQUE: Input: G=(V,E), k∈ℕ. Output: există V\'⊆V a.î. |V\'|≥k și ∀u,v∈V\', u≠v → {u,v}∈E?\nMAXIMUM-INDEPENDENT-SET: Input: G=(V,E), k∈ℕ. Output: există V\'⊆V a.î. |V\'|≥k și ∀u,v∈V\' → {u,v}∉E?', code: null },
          { label: 'c', points: 3, question: 'Proiectați un algoritm nedeterminist pentru CLIQUE.', answer: 'i. alege nedeterminist k noduri din G.\nii. verifică dacă oricare două noduri dintre cele k ghicite sunt conectate direct.', code: null },
          { label: 'd', points: 2, question: 'Proiectați o reducere Karp de la MAXIMUM-INDEPENDENT-SET la CLIQUE.', answer: 'i. Se calculează complementul grafului.\nii. Parametrul k se păstrează.\nO mulțime stabilă de noduri în graful inițial este o clică în graful complement.', code: null },
        ],
      },
    ],
  },

  // ── 2022 Seria II (variantaB) ─────────────────────────
  {
    id: 'partial-2022-ii',
    type: 'partial',
    year: 2022,
    variant: 'Seria II',
    series: 'Seria II',
    title: { en: 'Week 8 Test — Series II (Odd Cubes)', ro: 'Test Săpt. 8 — Seria II (Cuburi impare)' },
    duration: '1 oră',
    totalPoints: 40,
    problems: [
      {
        number: 1,
        points: 15,
        title: { en: 'Design and Analysis — Odd Cube Decomposition', ro: 'Proiectare și analiză — Descompunere în cuburi impare' },
        statement: 'Pornind de la un întreg pozitiv m, la fiecare pas scădem din m cel mai mare cub perfect a unui număr impar care nu depășește m. Exemplu: m=153 → 153-5³→28-3³→1-1³→0. D(153)=3.',
        parts: [
          { label: 'a', points: 3, question: 'Să se precizeze P1.', answer: 'D(0) = 0. Dacă m > 0, D(m) = D(m-(2i+1)³)+1, 0 < (2i+1)³ ≤ m, ∀j. 0 < (2j+1)³ ≤ m ⟹ j ≤ i.\nInput: m ≥ 0\nOutput: D(m)', code: null },
          { label: 'b', points: 3, question: 'Să se scrie un algoritm care construiește tabloul a cu cuburi de numere impare.', answer: null, code: 'a[0] = 0; i3 = 1; i = 1; k = 1;\nwhile (i3 <= m) {\n  a[k] = i3;\n  i = i+2;\n  k = k+1;\n  i3 = i*i*i;\n}' },
          { label: 'c', points: 3, question: 'Să se scrie un algoritm care rezolvă P1.', answer: null, code: 'i = a.size()-1;\nD = 0;\nwhile (m > 0) {\n  while (m >= a[i]) {\n    m = m - a[i];\n    D = D + 1;\n  }\n  i = i - 1;\n}' },
          { label: 'd', points: 3, question: 'Să se justifice corectitudinea.', answer: 'Bucla while din primul algoritm păstrează invariantul: a include primele i-1 cuburi de numere impare ≤ m.\nBucla while exterioară a celui de-al doilea algoritm păstrează D(m) + D = D(m₀).', code: null },
          { label: 'e', points: 3, question: 'Timpul de execuție.', answer: 'Dimensiunea: n = ⌈log₂ m⌉\nCazul cel mai nefavorabil pentru n=6: m = 53 = 1×3³ + 26×1³ (D = 27)\nTimp: T(n) = O(∛m) = O(∛2ⁿ)', code: null },
        ],
      },
      {
        number: 2,
        points: 10,
        title: { en: 'Probabilistic Algorithms — ransearch', ro: 'Algoritmi probabiliști — ransearch' },
        statement: 'Se consideră algoritmul determinist search(s,z) și algoritmul probabilist ransearch(n,z) care generează tabloul aleatoriu apoi apelează search.',
        parts: [
          { label: 'a', points: 2, question: 'Să se calculeze probabilitatea pᵢ ca Xᵢ = 1.', answer: 'pᵢ = 1/n', code: null },
          { label: 'b', points: 3, question: 'Să se determine valoarea așteptată C(n) a lui k.', answer: 'C(n) = Σᵢ₌₀ⁿ⁻¹ 1/n = 1', code: null },
          { label: 'c', points: 3, question: 'Dacă algoritmul probabilist este potrivit pentru calculul timpului mediu al algoritmului determinist.', answer: 'DA, dacă se consideră ca input doar tabloul s.', code: null },
          { label: 'd', points: 2, question: 'Un alt mod de calcul pentru T(n).', answer: 'T(n) = Σₖ₌₀ⁿ k · Cₙᵏ · (n-1)ⁿ⁻ᵏ / nⁿ = 1', code: null },
        ],
      },
      {
        number: 3,
        points: 15,
        title: { en: 'NP-Complete Problems', ro: 'Probleme NP-complete' },
        statement: '',
        parts: [
          { label: 'a', points: 3, question: 'Precizați cele 3 proprietăți care caracterizează clasa NPTIME.', answer: 'NP = {X | X este o problemă de (1) decizie și există un (2) algoritm nedeterminist (3) polinomial în cazul cel mai nefavorabil pentru X.}', code: null },
          { label: 'b', points: 2, question: 'Definiți problemele CLIQUE și MAXIMUM-INDEPENDENT-SET.', answer: 'CLIQUE: Input: G=(V,E), k∈ℕ. Output: există V\'⊆V a.î. |V\'|≥k și ∀u,v∈V\', u≠v → {u,v}∈E?\nMAXIMUM-INDEPENDENT-SET: Input: G=(V,E), k∈ℕ. Output: există V\'⊆V a.î. |V\'|≥k și ∀u,v∈V\' → {u,v}∉E?', code: null },
          { label: 'c', points: 3, question: 'Proiectați un algoritm nedeterminist pentru MAXIMUM-INDEPENDENT-SET.', answer: 'i. alege nedeterminist k noduri din G.\nii. verifică dacă nu există nicio muchie între nodurile ghicite.', code: null },
          { label: 'd', points: 2, question: 'Proiectați o reducere Karp de la CLIQUE la MAXIMUM-INDEPENDENT-SET.', answer: 'Se calculează complementul grafului. Parametrul k se păstrează.\nO mulțime stabilă de noduri în graful complement corespunde unei clici în graful inițial.', code: null },
        ],
      },
    ],
  },

  // ── 2025 A ────────────────────────────────────────────
  {
    id: 'partial-2025-a',
    type: 'partial',
    year: 2025,
    variant: 'A',
    series: 'Seria I',
    title: { en: 'Partial 2025 — Variant A (Series I)', ro: 'Partial 2025 — Varianta A (Seria I)' },
    duration: '1 oră',
    totalPoints: 35,
    problems: [
      {
        number: 1,
        points: 15,
        title: { en: 'Design and Analysis — Octagonal Numbers', ro: 'Proiectare și analiză — Numere octogonale' },
        statement: 'Pentru n ≥ 0, numărul octogonal Nₙ este dat de formula: Nₙ = n² + 4·Σₖ₌₁ⁿ⁻¹ k. Primele numere octogonale sunt: 0, 1, 8, 21, 40, 65, 96, 133.\nDându-se un șir nevid de numere naturale, problema P1 constă în a determina câte dintre numerele date sunt octogonale pare.',
        parts: [
          { label: 'a', points: 3, question: 'Să se precizeze problema.', answer: 'Problem domain: IsOcto(k) ≡ ∃x. Nat(x) ∧ x = (1+√(1+3k))/3\nInput: v = (v₀, v₁, ..., vₙ₋₁), vᵢ ∈ ℕ, n ≥ 1\nOutput: nr = Σᵢ₌₀..ₙ₋₁ [IsOcto(vᵢ) ∧ vᵢ par]', code: null },
          { label: 'b', points: 3, question: 'Să se scrie un algoritm care verifică dacă un număr este octogonal.', answer: null, code: 'IsOctogonal(x) {\n  d = int(sqrt(1+3*x));\n  if (d*d != 1+3*x)\n    return false;\n  if ((1+d)%3 != 0)\n    return false;\n  return true;\n}' },
          { label: 'c', points: 3, question: 'Să se scrie un algoritm care rezolvă P1.', answer: null, code: 'getOctoPar(v) {\n  n = v.size();\n  nr = 0;\n  for (i = 0; i < n; ++i)\n    if (v[i]%2 == 0 && IsOctogonal(v[i]))\n      nr = nr + 1;\n  return nr;\n}' },
          { label: 'd', points: 3, question: 'Să se justifice corectitudinea.', answer: 'Bucla for păstrează invariantul nr = numărul de valori octogonale pare din subvectorul v[0..i].', code: null },
          { label: 'e', points: 3, question: 'Timpul de execuție.', answer: 'Dimensiunea: n\nOperații: v[i]%2 == 0 && IsOctogonal(v[i]), O(1)\nToate cazurile au același timp asimptotic: O(n)', code: null },
        ],
      },
      {
        number: 2,
        points: 10,
        title: { en: 'Probabilistic Algorithms — firstpos', ro: 'Algoritmi probabiliști — firstpos' },
        statement: 'Se consideră algoritmul probabilist firstpos(n, z) care generează aleatoriu un tablou v cu n elemente din {1..n}, apoi caută prima apariție a lui z.',
        parts: [
          { label: 'a', points: 3, question: 'Definiți variabila indicator Xₖ.', answer: 'Xₖ = 1 dacă 0 ≤ k < n și v[k] = z și v[j] ≠ z ∀0 ≤ j < k\nXₖ = 1 dacă k = n și v[j] ≠ z ∀0 ≤ j < n\nXₖ = 0 altfel', code: null },
          { label: 'b', points: 1, question: 'Care este probabilitatea ca pe o poziție arbitrară din tablou să se afle z?', answer: 'p = 1/n', code: null },
          { label: 'c', points: 3, question: 'Să se calculeze probabilitatea pₖ ca Xₖ = 1.', answer: 'pᵢ = (1-1/n)ⁱ · 1/n, dacă 0 ≤ i < n\npᵢ = ((n-1)/n)ⁿ, dacă i = n', code: null },
          { label: 'd', points: 3, question: 'Fie Y(n) = Σₖ₌₀ⁿ (k+1)·Xₖ. Să se determine E[Y(n)].', answer: 'E[Y(n)] = Σᵢ₌₀ⁿ⁻¹ (i+1)·(1-1/n)ⁱ·1/n + (n+1)·((n-1)/n)ⁿ', code: null },
        ],
      },
      {
        number: 3,
        points: 10,
        title: { en: 'NP-Complete Problems', ro: 'Probleme NP-complete' },
        statement: '',
        parts: [
          { label: 'a', points: 5, question: 'Proiectați o reducere Karp de la problema PARTITION la problema ZEROSUM-SUBSET.', answer: 'PARTITION: Input: S ⊆ ℕ. Output: există A,B ⊆ S a.î. A∩B=∅, A∪B=S și ΣA = ΣB?\nZEROSUM-SUBSET: Input: T ⊆ ℤ. Output: există U ⊆ T, U≠∅ a.î. Σx∈U x = 0?\n\ni. dacă ΣS este impar: T = {42} (nicio partiție posibilă)\nii. altfel: T = S\\{0} ∪ {-ΣS/2}\n→: Dacă S poate fi partiționată în A,B cu sume egale, alegem U = A\\{0} ∪ {-ΣS/2}, suma este 0.\n←: Dacă există U ⊆ T de sumă zero, U conține -ΣS/2. Fie A = U\\{-ΣS/2} și B = S\\A.', code: null },
          { label: 'b', points: 5, question: 'Care este graful calculat de reducerea de la 3-SAT la 3-COL pentru formula (x ∨ y ∨ ¬z)?', answer: 'Se construiește: (1p) truth gadget; (1p) variable gadgets; (3p) porțile sau. Vezi curs.', code: null },
        ],
      },
    ],
  },

  // ── 2025 B ────────────────────────────────────────────
  {
    id: 'partial-2025-b',
    type: 'partial',
    year: 2025,
    variant: 'B',
    series: 'Seria II',
    title: { en: 'Partial 2025 — Variant B (Series II)', ro: 'Partial 2025 — Varianta B (Seria II)' },
    duration: '1 oră',
    totalPoints: 35,
    problems: [
      {
        number: 1,
        points: 15,
        title: { en: 'Design and Analysis — Star Numbers', ro: 'Proiectare și analiză — Numere stea' },
        statement: 'Pentru n ≥ 1, numărul stea Sₙ este generat cu formula Sₙ = 6n(n-1) + 1. Primele numere stea sunt 1, 13, 37, 73, 121.\nProblema P1 cere ca, dându-se un șir v de numere naturale nenule, să se determine dacă șirul conține cel puțin două numere stea.',
        parts: [
          { label: 'a', points: 3, question: 'Să se precizeze P1.', answer: 'IsStarNr(k) ≡ ∃x. Nat(x) ∧ x = (3+√(3+6k))/6\nInput: v = (v₀,...,vₙ₋₁), vᵢ ∈ ℕ*, n ≥ 1\nOutput: da dacă ∃ 0≤i≠j≤n-1 a.î. IsStarNr(v[i]) ∧ IsStarNr(v[j])\nnu altfel', code: null },
          { label: 'b', points: 3, question: 'Să se scrie un algoritm care verifică dacă un număr este stea.', answer: null, code: 'IsStarNr(k) {\n  d = int(sqrt(3+6*k));\n  if (d*d != 3+6*k)\n    return false;\n  if ((3+d)%6 != 0)\n    return false;\n  return true;\n}' },
          { label: 'c', points: 3, question: 'Să se scrie un algoritm care rezolvă P1.', answer: null, code: 'n = a.size();\nnr = 0;\nfor (i=0; i<n && nr!=2; i++) {\n  if (IsStarNr(v[i]))\n    nr++;\n  if (nr==2)\n    return da;\n}\nreturn nu;' },
          { label: 'd', points: 3, question: 'Să se justifice corectitudinea.', answer: 'Bucla for păstrează invariantul nr = numărul de valori numere stea din subvectorul v[0..i], până se întâlnesc două astfel de numere.', code: null },
          { label: 'e', points: 3, question: 'Timpul de execuție.', answer: 'Dimensiunea: n\nOperații: IsStarNr(v[i]), O(1)\nCazul cel mai nefavorabil: v nu conține minim 2 numere stea, sau le conține pe ultimele două poziții\nTimp: O(n)', code: null },
        ],
      },
      {
        number: 2,
        points: 10,
        title: { en: 'Probabilistic Algorithms', ro: 'Algoritmi probabiliști' },
        statement: 'Se consideră un algoritm probabilist care generează aleatoriu un tablou v[i] = x*3+1 cu x uniform din {1..10}, apoi caută prima valoare v[i] cu v[i] % 5 == 0, avansând din 2 în 2.',
        parts: [
          { label: 'a', points: 3, question: 'Definiți variabila indicator Xₖ.', answer: 'Xₖ = 1 dacă condiția v[i] % 5 == 0 este evaluată (adică v[2i]%5 ≠ 0, ∀0 ≤ i < k/2)\nXₖ = 0 altfel', code: null },
          { label: 'b', points: 1, question: 'Care este probabilitatea ca v[i] % 5 == 0 să fie fals?', answer: 'p = 4/5\n(Valori posibile: 4,7,10,13,16,19,22,25,28,31 — din care 10 și 25 satisfac condiția, prob. = 2/10 = 1/5, deci fals = 4/5)', code: null },
          { label: 'c', points: 3, question: 'Să se calculeze probabilitatea pᵢ ca Xᵢ = 1.', answer: 'pₖ = (4/5)^(k/2)', code: null },
          { label: 'd', points: 3, question: 'Care e numărul mediu de comparații efectuate?', answer: 'E[Y] = Σⱼ₌₀ᵐ⁻¹ (4/5)ʲ = (1-(4/5)ᵐ)/(1-4/5), unde m = ⌊(n+1)/2⌋', code: null },
        ],
      },
      {
        number: 3,
        points: 10,
        title: { en: 'NP-Complete Problems', ro: 'Probleme NP-complete' },
        statement: '',
        parts: [
          { label: 'a', points: 5, question: 'Proiectați un algoritm nedeterminist polinomial pentru problema: Input: S ⊆ ℤ. Output: există U,V ⊆ S a.î. U≠∅, V≠∅, U ⊆ ℕ, V∩ℕ=∅, și Σx∈U x = -Σy∈V y?', answer: 'i. ghicește U, o submulțime nevidă de numere ≥ 0 din S.\nii. ghicește V, o submulțime nevidă de numere < 0 din S.\niii. verifică dacă suma elementelor din U este opusul sumei elementelor din V.', code: null },
          { label: 'b', points: 5, question: 'Care este formula aflată în 3-FNC calculată de reducerea de la SAT la 3-SAT pentru formula ¬(x ∧ y)?', answer: 'Se aplică transformarea arborelui sintactic: (2p) fiecare conector; (1p) rădăcina. Vezi curs.', code: null },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // FINAL (EXAM) TESTS
  // ═══════════════════════════════════════════════════════

  // ── 2014 Exam A ───────────────────────────────────────
  {
    id: 'exam-2014-a',
    type: 'exam',
    year: 2014,
    variant: 'A',
    series: 'A',
    title: { en: 'Exam 2014 — Variant A (Boyer-Moore)', ro: 'Examen 2014 — Varianta A (Boyer-Moore)' },
    duration: '1 oră',
    totalPoints: 6,
    problems: [
      {
        number: 1,
        points: 3,
        title: { en: 'Boyer-Moore Algorithm', ro: 'Algoritmul Boyer-Moore' },
        statement: 'În contextul algoritmului Boyer-Moore se consideră subiectul "E CARATA DAR NU E ARATATA" și patternul "ARATAT".',
        parts: [
          { label: 'a', points: 0.5, question: 'Să se enunțe regula caracterului rău (bad character rule).', answer: 'Dacă p[j] ≠ s[i] = C:\n1. dacă apariția cea mai din dreapta a lui C în p este k < j, p[k] și s[i] sunt aliniate\n2. dacă apariția cea mai din dreapta a lui C în p este k > j, p este translatat la dreapta cu o poziție\n3. dacă C nu apare în p, patternul p este aliniat cu s[i+1..i+m]', code: null },
          { label: 'b', points: 0.5, question: 'Să se calculeze funcția de salt.', answer: 'salt: A=6, C=1, D=6, E=6, N=6, R=4, T=2, U=6\n(salt[C] = m - poziția ultimei apariții a lui C în pattern, sau m dacă C nu apare)', code: null },
          { label: 'c', points: 0.5, question: 'Să se enunțe regula celui mai bun sufix.', answer: 'Presupunem că p[j-1] nu se potrivește (după ce s-au potrivit p[j..m-1]).\n1. dacă goodSuff(j) > 0, face un salt egal cu m - goodSuff(j)\n2. dacă goodSuff(j) = 0, face un salt egal cu m - lp(j)', code: null },
          { label: 'd', points: 0.5, question: 'Să se calculeze valorile goodSuff(j).', answer: 'ARATAT (poziții 0-5): goodSuff = [0, 0, 0, 0, 3, 0]', code: null },
          { label: 'e', points: 1, question: 'Să se explice cum se aplică algoritmul Boyer-Moore pentru exemplul considerat.', answer: 'Se compară de la dreapta la stânga.\nPas 1: E vs T — nepotrivire, salt[A]=1 (1 comparație)\nPas 2: C,A,R vs T,A,T — nepotrivire la R vs T, salt[R]=4 (3 comparații)\n...se continuă aplicând maximul dintre salt-ul caracterului rău și sufixul bun.', code: null },
        ],
      },
      {
        number: 2,
        points: 3,
        title: { en: 'Greedy Algorithms — Huffman Coding', ro: 'Algoritmi greedy — Coduri Huffman' },
        statement: '',
        parts: [
          { label: 'a', points: 0.5, question: 'Să se enunțe problema codurilor Huffman.', answer: 'Intrare: n mesaje M₀,...,Mₙ₋₁ cu frecvențele w₀,...,wₙ₋₁ codificate a.î. cod(Mᵢ) ∈ {0,1}*, ∀i,j: i≠j ⟹ cod(Mᵢ) nu este prefix al cod(Mⱼ).\nIeșire: codificare cu lungimea medie minimă.', code: null },
          { label: 'b', points: 0.5, question: 'Să se explice legătura dintre codurile Huffman și arborii binari.', answer: 'Codurile pot fi memorate de un arbore binar a.î. orice cod descrie unic un drum de la rădăcină la frontieră. Regula: cod=0 → copilul stâng; cod=1 → copilul drept.', code: null },
          { label: 'c', points: 0.5, question: 'Să se explice cine sunt mulțimea de stări S și colecția de submulțimi C.', answer: 'S – cea mai mică mulțime de arbori construită cu operația ⊕ (combinare).\nX ∈ C dacă elementele sunt incomparabile și X este finită.', code: null },
          { label: 'd', points: 0.5, question: 'Să se descrie pasul de alegere locală.', answer: 'Alege T₁, T₂ cu rădăcini minime în B și T₁⊕T₂ nu este în B.\nB = B – {T₁, T₂} ∪ {T₁⊕T₂}', code: null },
          { label: 'e', points: 1, question: 'Să se construiască o codificare Huffman pentru textul "streets are never stars".', answer: 'Frecvențe: a=2, e=5, n=1, r=4, s=4, t=3, v=1, ♭=3\nSe construiește arborele Huffman combinând mereu cele două elemente cu frecvențe minime.\nPas 1: combină v(1) și n(1) → nod(2)\nPas 2: combină nod(2) și a(2) → nod(4)\n...etc.', code: null },
        ],
      },
      {
        number: 3,
        points: 3,
        title: { en: 'NP — Subset Sum', ro: 'NP — Submulțime de sumă dată' },
        statement: 'Se consideră problema Submulțime de sumă dată (SSD):\nIntrare: o mulțime A cu mărimi s[a] ∈ ℤ⁺ și un număr M ∈ ℤ⁺.\nIeșire: cel mai mare M* ≤ M a.î. există A\' ⊆ A cu Σ(s[a] | a ∈ A\') = M*.',
        parts: [
          { label: 'a', points: 1, question: 'Să se arate că SSD este în NP.', answer: 'Se consideră varianta ca problemă de decizie (M* = M).', code: 'nondetSSDDec(A, s, M) {\n  foreach (a in A) x[a] = choice(2);\n  mStar = 0;\n  foreach (a in A) mStar = mStar + x[a];\n  if (mStar == M) return succes;\n  else return failure;\n}' },
          { label: 'b', points: 0.5, question: 'Există algoritm determinist polinomial care rezolvă SSD?', answer: 'Oricare din cele două variante este problemă NP-completă. Deoarece nu se știe dacă P = NP, nu se poate da un răspuns exact.', code: null },
          { label: 'c', points: 1, question: 'Să se dea un exemplu de algoritm care calculează o aproximare a soluției optime.', answer: 'Este o schemă de aproximare polinomial completă, eroarea relativă marginită de ε.', code: 'ssdAprox(n, s, M, ε) {\n  L[0] = (0);\n  for (i = 1; i <= n; ++i) {\n    Ltemp = merge(L[i-1], L[i-1] + s[i]);\n    curata(Ltemp, ε/n, L[i]);\n    elimina din L[i] valorile mai mari decât M;\n  }\n  return cea mai mare valoare din L[n];\n}' },
          { label: 'd', points: 0.5, question: 'Precizați complexitatea timp a algoritmului de aproximare.', answer: 'Complexitatea timp va fi O(n · maxᵢ L[i].length()). Se știe că L[i].length() = O(n ln M / ε).', code: null },
        ],
      },
    ],
  },

  // ── 2014 Exam B ───────────────────────────────────────
  {
    id: 'exam-2014-b',
    type: 'exam',
    year: 2014,
    variant: 'B',
    series: 'B',
    title: { en: 'Exam 2014 — Variant B (Regex + DP)', ro: 'Examen 2014 — Varianta B (Regex + PD)' },
    duration: '1 oră',
    totalPoints: 6,
    problems: [
      {
        number: 1,
        points: 3,
        title: { en: 'Regular Expressions', ro: 'Expresii regulate' },
        statement: 'Se consideră expresia regulată e = (a((a+b)c)*)b.',
        parts: [
          { label: 'a', points: 0.5, question: 'Să se dea definiția expresiilor regulate.', answer: 'Mulțimea expresiilor regulate peste alfabetul A este definită recursiv astfel:\nε, empty sunt expresii regulate;\norice caracter din A este o expresie regulată;\ndacă e₁, e₂ sunt expresii regulate, atunci e₁e₂ și e₁+e₂ sunt expresii regulate;\ndacă e este expresie regulată, atunci (e) și e* sunt expresii regulate.', code: null },
          { label: 'b', points: 0.5, question: 'Să se arate că expresia e este bine construită.', answer: 'Se poate construi arborele sintactic abstract (pe tablă).', code: null },
          { label: 'c', points: 0.5, question: 'Să se precizeze primele 6 cuvinte din limbajul desemnat de e.', answer: 'L(e) = {ab, aacb, abcb, aacacb, aacbcb, abcacb, abcbcb, ...}', code: null },
          { label: 'd', points: 1, question: 'Să se construiască automatul asociat lui e.', answer: 'Automatul are stare inițială → a → (ramificare a/b) → c → b → stare finală.', code: null },
          { label: 'e', points: 0.5, question: 'Să se explice cum se caută un cuvânt desemnat de e în șirul "aacabcb".', answer: 'Se pleacă din poziția i=0 și starea inițială (st=0). Primul caracter citit este a și există arc etichetat cu a din starea 0; st devine 1, i devine 1. Se continuă...', code: null },
        ],
      },
      {
        number: 2,
        points: 3,
        title: { en: 'Dynamic Programming — Knapsack', ro: 'Programare dinamică — Rucsac' },
        statement: '',
        parts: [
          { label: 'a', points: 0.5, question: 'Să se scrie formularea matematică a problemei rucsacului, varianta discretă.', answer: 'Funcția obiectiv: max Σⁿᵢ₌₁ xᵢ·pᵢ\nRestricții: Σⁿᵢ₌₁ xᵢ·wᵢ ≤ M, xᵢ ∈ {0,1}', code: null },
          { label: 'b', points: 0.5, question: 'Să se descrie noțiunea de stare pentru problema rucsacului.', answer: 'Rucsac(j, X) = subproblema cu primele j obiecte și capacitate X.\nfⱼ(X) = valoarea optimă pentru instanța Rucsac(j, X). Dacă j=0 și X≥0, fⱼ(X)=0.', code: null },
          { label: 'c', points: 1, question: 'Să se descrie cum este utilizat principiul de optim pentru a găsi relația de recurență.', answer: 'fⱼ(X) = -∞ dacă X < 0\nfⱼ(X) = 0 dacă j = 0 și X ≥ 0\nfⱼ(X) = max{fⱼ₋₁(X), fⱼ₋₁(X - wⱼ) + pⱼ} dacă j > 0 și X ≥ 0', code: null },
          { label: 'd', points: 1, question: 'Să se aplice algoritmul pentru n=4, M=10, w=(3,3,4,5), p=(50,20,10,40).', answer: 'Tabelul valorilor (coloane 0-10, rânduri 0-4):\nRândul 0: toate 0\nRândul 1: 0,0,0,50,50,50,50,50,50,50,50\nRândul 2: 0,0,0,50,50,50,70,70,70,70,70\nRândul 3: 0,0,0,50,50,50,70,70,70,70,80\nRândul 4: 0,0,0,50,50,50,70,70,90,90,90\nSoluția: x₃=1 (w=5,p=40), x₀=1 (w=3,p=50), total=90.', code: null },
        ],
      },
      {
        number: 3,
        points: 3,
        title: { en: 'NP — Set Cover', ro: 'NP — Acoperirea unei mulțimi' },
        statement: 'Se consideră problema Acoperirea unei mulțimi (AS).',
        parts: [
          { label: 'a', points: 1, question: 'Să se arate că AS este în clasa NP.', answer: 'Ca problemă de decizie: se adaugă K la intrare.', code: 'nondetASDec(T, S, w, K) {\n  for (i=1; i <= m; ++i) x[i] = choice(2);\n  kg = 0;\n  for (i=1; i <= m; ++i) kg = kg + w[i]*x[i];\n  if (kg <= K) return succes;\n  else return failure;\n}' },
          { label: 'b', points: 0.5, question: 'Există algoritmi determiniști polinomiali care rezolvă AS?', answer: 'Este NP-completă. Nu se știe dacă P = NP.', code: null },
          { label: 'c', points: 1, question: 'Să se dea un exemplu de algoritm greedy de aproximare.', answer: 'Cost efectiv al lui Sⱼ = wⱼ/|Sⱼ - C|. Are rația de aproximare marginită de Hₙ = 1 + 1/2 + ... + 1/n.', code: 'asGreedy(T, S, w) {\n  I = C = ∅;\n  while (T ≠ C) {\n    determina Sj cu cel mai mic cost efectiv;\n    foreach (ti ∈ Sj-C)\n      pret(ti) = wj/|Sj - C|;\n    I = I ∪ {j};\n    C = C ∪ Sj;\n  }\n}' },
          { label: 'd', points: 0.5, question: 'Precizați complexitatea timp în cazul cel mai nefavorabil.', answer: 'O(n²) (bucla while se execută de cel mult n ori, fiecare iterație O(n)).', code: null },
        ],
      },
    ],
  },

  // ── 2014 Exam C ───────────────────────────────────────
  {
    id: 'exam-2014-c',
    type: 'exam',
    year: 2014,
    variant: "A'",
    series: 'A',
    title: { en: 'Exam 2014 — Variant A\' (Voronoi)', ro: 'Examen 2014 — Varianta A\' (Voronoi)' },
    duration: '1 oră',
    totalPoints: 6,
    problems: [
      {
        number: 1,
        points: 3,
        title: { en: 'Design and Analysis — Integer Division', ro: 'Proiectare și analiză — Împărțirea întreagă' },
        statement: 'Câtul împărțirii întregi a două numere întregi poate fi calculat prin scăderi repetate.',
        parts: [
          { label: 'a', points: 0.5, question: 'Să se formuleze problema împărțirii întregi, notată DIV, ca pereche (input, output).', answer: 'Input: a, b numere întregi.\nOutput: q = câtul împărțirii întregi a lui a la b, i.e. a = bq + r cu 0 ≤ r < |b|, dacă b ≠ 0, eroare dacă b == 0.', code: null },
          { label: 'b', points: 0.5, question: 'Să se descrie un algoritm care rezolvă DIV.', answer: null, code: 'div(a, b) {\n  if (b == 0) return "eroare";\n  if (sign(a) + sign(b) == 0) s = -1;\n  else s = 1;\n  if (a < 0) a = -a;\n  if (b < 0) b = -b;\n  q = 0;\n  while (a >= b) {\n    a = a-b; q = q + 1;\n  }\n  return s*q;\n}' },
          { label: 'c', points: 0.5, question: 'Să se scrie configurațiile inițiale și finale.', answer: 'Configurația inițială: <div(a,b), a|→a₀ b|→b₀>\nConfigurația finală: <., a|→a₁ b|→b₁ q|→q₀ s|→s₁>, a₀ = b₀*q₀ + a₁, a₁ < b', code: null },
          { label: 'd', points: 0.5, question: 'Să se arate că algoritmul este corect.', answer: 'Relația a < b este dată de terminarea instrucțiunii while. La începutul și la sfârșitul buclei while avem relația a + b*q = |a₀| (invariantul).', code: null },
          { label: 'e', points: 1, question: 'Să se determine complexitatea timp.', answer: 'Valoarea cea mai mare a lui a pe n biți este 2ⁿ-1. Cazul cel mai nefavorabil: a maxim (2ⁿ-1) și b minim (b=1). Bucla while se execută de 2ⁿ-1 ori. Complexitate: O(2ⁿ).', code: null },
        ],
      },
      {
        number: 2,
        points: 3,
        title: { en: 'Nearest Neighbor & Voronoi Diagrams', ro: 'Cel mai apropiat vecin & Diagrame Voronoi' },
        statement: '',
        parts: [
          { label: 'a', points: 0.5, question: 'Descrieți problema CEI MAI APROPIAȚI VECINI.', answer: 'Intrare: O mulțime S cu n puncte în plan.\nIeșire: Cel mai apropiat vecin din S pentru fiecare punct din S.', code: null },
          { label: 'b', points: 0.5, question: 'Descrieți problema LOCUL GEOMETRIC AL CELOR MAI APROPIATE PUNCTE.', answer: 'Intrare: O mulțime S cu n puncte în plan.\nIeșire: Pentru fiecare punct P din S, locul geometric al celor mai apropiate puncte (diagrama Voronoi).', code: null },
          { label: 'c', points: 1, question: 'Să se arate că CEI MAI APROPIAȚI VECINI ∝ₙ LOCUL GEOMETRIC.', answer: '1. Se construiește diagrama Voronoi, reprezentată cu PSLG.\n2. Se parcurge structura PSLG și pentru fiecare regiune se investigează regiunile vecine.\nPostprocesarea necesită timpul O(n).', code: null },
          { label: 'd', points: 0.5, question: 'Să se arate că CEI MAI APROPIAȚI VECINI are complexitatea O(n log n).', answer: 'Se știe că LOCUL GEOMETRIC are complexitatea O(n log n). Se aplică teorema reducerilor: dacă Q are O(f(n)) și P ∝ₙ Q, atunci P are O(f(n) + n).', code: null },
          { label: 'e', points: 0.5, question: 'Ce se poate spune despre complexitatea Ω a problemei?', answer: 'Se știe că LOCUL GEOMETRIC are complexitatea Ω(n log n) și se aplică din nou teorema.', code: null },
        ],
      },
      {
        number: 3,
        points: 3,
        title: { en: 'Voronoi Diagram Construction', ro: 'Construcția diagramei Voronoi' },
        statement: 'Acest exercițiu se referă la algoritmul divide-et-impera de construcție a diagramei Voronoi.',
        parts: [
          { label: 'a', points: 0.5, question: 'Să se explice cum se calculează dreapta verticală care divizează mulțimea S.', answer: 'Se calculează mediana absciselor. Se duce o verticală la stânga sau la dreapta medianii. S₁ = punctele din stânga, S₂ = punctele din dreapta.', code: null },
          { label: 'b', points: 1, question: 'Să se construiască diagramele Voronoi pentru S₁ și S₂.', answer: 'Fiind mulțimi cu puține puncte, se pot construi direct. Se duc mediatoarele segmentelor care unesc punctele.', code: null },
          { label: 'c', points: 1, question: 'Să se arate cum se construiește linia poligonală σ(S₁, S₂).', answer: '1. Se construiesc înfășurătorile convexe.\n2. Se determină dreptele suport.\n3. Se duce perpendiculara pe dreapta suport superioară până întâlnește prima muchie Voronoi.\n4. Se continuă cu perpendicularele pe dreptele suport.', code: null },
          { label: 'd', points: 0.5, question: 'Să se arate cum se construiește diagrama Voronoi a lui S din cele două diagrame.', answer: 'Se fac intersecțiile dintre diagramele Voronoi pentru S₁ și S₂ și linia poligonală. Se șterge din Vor(S₂) ce e la stânga liniei și din Vor(S₁) ce e la dreapta liniei.', code: null },
        ],
      },
    ],
  },
];
