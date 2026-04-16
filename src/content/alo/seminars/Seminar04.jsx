import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Toggle } from '../../../components/ui';
import MultipleChoice from '../../../components/ui/MultipleChoice';

export default function Seminar04() {
  const { t } = useApp();

  /* ─── P1: LU already given ─── */
  const mc1a = [{
    question: {
      en: 'For system (a): L = [[1,0,0],[2,1,0],[−1,0,1]], U = [[2,3,−1],[0,−2,1],[0,0,3]], b = (2,−1,1)ᵀ. The solution x is',
      ro: 'Pentru sistemul (a): L = [[1,0,0],[2,1,0],[−1,0,1]], U = [[2,3,−1],[0,−2,1],[0,0,3]], b = (2,−1,1)ᵀ. Soluția x este',
    },
    options: [
      { text: 'x = (−3, 3, 1)ᵀ', correct: true },
      { text: 'x = (1, 1, 1)ᵀ', correct: false, feedback: { en: 'Row 1 of A = LU: test Ax — gives (2·1 + 3·1 − 1·1) = 4 ≠ 2 (b₁). The intermediate y would have to be (4, 6, 3), not (2, −5, 3).', ro: 'Linia 1 a A = LU: test Ax — dă (2·1 + 3·1 − 1·1) = 4 ≠ 2 (b₁). Intermediarul y ar fi (4, 6, 3), nu (2, −5, 3).' } },
      { text: 'x = (2, −5, 3)ᵀ', correct: false, feedback: { en: 'That is y (solution of Ly = b), not x. You stopped at the forward-substitution stage; now solve Ux = y.', ro: 'Acela e y (soluția Ly = b), nu x. Te-ai oprit la substituția directă; acum rezolvă Ux = y.' } },
      { text: 'x = (3, −3, 1)ᵀ', correct: false, feedback: { en: 'Sign error on x₁: back-substitution gives 2x₁ + 9 − 1 = 2 ⇒ x₁ = −3, not +3.', ro: 'Eroare de semn pe x₁: substituția inversă dă 2x₁ + 9 − 1 = 2 ⇒ x₁ = −3, nu +3.' } },
    ],
    explanation: {
      en: 'Two-stage solve. Forward on Ly = b: y = (2, −5, 3). Back on Ux = y: 3x₃ = 3 ⇒ x₃ = 1; −2x₂ + 1 = −5 ⇒ x₂ = 3; 2x₁ + 9 − 1 = 2 ⇒ x₁ = −3.',
      ro: 'Rezolvare în două etape. Substituție directă pe Ly = b: y = (2, −5, 3). Substituție inversă pe Ux = y: 3x₃ = 3 ⇒ x₃ = 1; −2x₂ + 1 = −5 ⇒ x₂ = 3; 2x₁ + 9 − 1 = 2 ⇒ x₁ = −3.',
    },
  }];

  const mc1strategy = [{
    question: {
      en: 'When A = LU is already known, solving Ax = b reduces to',
      ro: 'Când A = LU este deja cunoscut, rezolvarea Ax = b se reduce la',
    },
    options: [
      { text: { en: 'Ly = b by forward substitution, then Ux = y by back substitution', ro: 'Ly = b prin substituție directă, apoi Ux = y prin substituție inversă' }, correct: true },
      { text: { en: 'Forming A⁻¹ = U⁻¹L⁻¹ then multiplying', ro: 'Calculul A⁻¹ = U⁻¹L⁻¹ apoi înmulțire' }, correct: false, feedback: { en: 'Correct result but wasteful: explicit inverses cost Θ(n³) extra; the two triangular solves are Θ(n²) total.', ro: 'Rezultat corect dar risipitor: inversele explicite costă Θ(n³) în plus; cele două rezolvări triunghiulare sunt Θ(n²) total.' } },
      { text: { en: 'Ux = b by back substitution, then Ly = x by forward substitution', ro: 'Ux = b prin substituție inversă, apoi Ly = x prin substituție directă' }, correct: false, feedback: { en: 'Wrong direction: A·x = LU·x, so the outer factor L acts first on b (Ly = b gives intermediate y), then U acts on x. The order cannot be swapped.', ro: 'Direcție greșită: A·x = LU·x, deci factorul exterior L acționează întâi pe b (Ly = b dă y intermediar), apoi U pe x. Ordinea nu poate fi inversată.' } },
      { text: { en: 'Gauss elimination from scratch', ro: 'Eliminare Gauss de la zero' }, correct: false, feedback: { en: 'Wastes the LU factorisation you already have. The whole point of storing LU is to amortise Θ(n³) over many RHSs at Θ(n²) each.', ro: 'Risipește factorizarea LU pe care deja o ai. Scopul stocării LU este amortizarea Θ(n³) peste mai multe RHS la Θ(n²) fiecare.' } },
    ],
    explanation: {
      en: 'A·x = (LU)x = L(Ux). Set y = Ux. Then Ly = b is triangular (forward-solve), giving y, and Ux = y is triangular (back-solve), giving x. Two Θ(n²) solves — much cheaper than Θ(n³) re-elimination.',
      ro: 'A·x = (LU)x = L(Ux). Notăm y = Ux. Atunci Ly = b este triunghiulară (substituție directă) și dă y, iar Ux = y este triunghiulară (substituție inversă) și dă x. Două rezolvări Θ(n²) — mult mai ieftin decât Θ(n³) eliminare repetată.',
    },
  }];

  const mc1b = [{
    question: {
      en: 'For system (b) with L = [[1,0,0],[2,1,0],[−3,2,1]], U = [[1,2,−3],[0,1,2],[0,0,1]], b = (4,6,8)ᵀ, x₃ equals',
      ro: 'Pentru sistemul (b) cu L = [[1,0,0],[2,1,0],[−3,2,1]], U = [[1,2,−3],[0,1,2],[0,0,1]], b = (4,6,8)ᵀ, x₃ este',
    },
    options: [
      { text: '24', correct: true },
      { text: '8', correct: false, feedback: { en: 'You read b₃ directly as x₃ — forgot the L cascade. y₃ = 8 − (−3)·4 − 2·(−2) = 24 (not 8).', ro: 'Ai citit b₃ direct ca x₃ — ai uitat cascada L. y₃ = 8 − (−3)·4 − 2·(−2) = 24 (nu 8).' } },
      { text: '−2', correct: false, feedback: { en: 'That is y₂, an intermediate value in the forward pass. y₃ and x₃ come later.', ro: 'Acela e y₂, o valoare intermediară din substituția directă. y₃ și x₃ vin ulterior.' } },
      { text: '176', correct: false, feedback: { en: 'That is x₁ in the full solution — you returned the wrong coordinate. x₃ = 24 (= y₃ / u₃₃ = 24/1).', ro: 'Acela e x₁ din soluția completă — ai returnat coordonata greșită. x₃ = 24 (= y₃ / u₃₃ = 24/1).' } },
    ],
    explanation: {
      en: 'Ly = b: y₁ = 4; y₂ = 6 − 2·4 = −2; y₃ = 8 − (−3)·4 − 2·(−2) = 8 + 12 + 4 = 24. Then Ux = y gives x₃ = y₃ / u₃₃ = 24 / 1 = 24.',
      ro: 'Ly = b: y₁ = 4; y₂ = 6 − 2·4 = −2; y₃ = 8 − (−3)·4 − 2·(−2) = 8 + 12 + 4 = 24. Apoi Ux = y dă x₃ = y₃ / u₃₃ = 24 / 1 = 24.',
    },
  }];

  /* ─── P2: Doolittle / Crout ─── */
  const mc2flavors = [{
    question: {
      en: 'The two flavours of LU ask for (i) L with unit diagonal (Doolittle) and (ii) U with unit diagonal (Crout). They differ by',
      ro: 'Cele două variante LU cer (i) L cu diagonală unitară (Doolittle) și (ii) U cu diagonală unitară (Crout). Ele diferă prin',
    },
    options: [
      { text: { en: 'a diagonal factor D: if (L, U) is Doolittle then (LD, D⁻¹U) is Crout, where D = diag(U)', ro: 'un factor diagonal D: dacă (L, U) este Doolittle atunci (LD, D⁻¹U) este Crout, unde D = diag(U)' }, correct: true },
      { text: { en: 'a permutation matrix', ro: 'o matrice de permutare' }, correct: false, feedback: { en: 'Permutations come with PA = LU (partial pivoting), a different variant. Doolittle ↔ Crout differ by *scaling*, not reordering.', ro: 'Permutările apar la PA = LU (pivotare parțială), altă variantă. Doolittle ↔ Crout diferă prin *scalare*, nu reordonare.' } },
      { text: { en: 'nothing — they are the same decomposition', ro: 'nimic — sunt aceeași descompunere' }, correct: false, feedback: { en: 'They coincide only when diag(U_Doolittle) = I (e.g., A₁ in the worked example). For A₂ with pivots (2, −2, 3), they differ.', ro: 'Coincid doar când diag(U_Doolittle) = I (ex. A₁ în exemplu). Pentru A₂ cu pivoți (2, −2, 3), diferă.' } },
      { text: { en: 'swapping the roles of L and U', ro: 'schimbarea rolurilor lui L și U' }, correct: false, feedback: { en: 'No: in both flavours L is lower-triangular and U is upper. Only which one carries the "unit diagonal" convention changes.', ro: 'Nu: în ambele variante L e inferior și U e superior. Doar ce matrice poartă convenția „diagonală unitară" se schimbă.' } },
    ],
    explanation: {
      en: 'Both satisfy A = LU; the factorisation is unique once we fix one diagonal. Let D = diag(U_Doolittle). Then U_Crout = D⁻¹·U_Doolittle (unit diagonal) and L_Crout = L_Doolittle·D (diagonal = pivots).',
      ro: 'Ambele satisfac A = LU; factorizarea e unică odată fixată o diagonală. Fie D = diag(U_Doolittle). Atunci U_Crout = D⁻¹·U_Doolittle (diagonală unitară) și L_Crout = L_Doolittle·D (diagonală = pivoți).',
    },
  }];

  /* ─── P3 ─── */
  const mc3why = [{
    question: {
      en: 'The PA = LU factorisation differs from the plain A = LU precisely because',
      ro: 'Factorizarea PA = LU diferă de A = LU simplă tocmai pentru că',
    },
    options: [
      { text: { en: 'some matrices need row swaps (partial pivoting) to produce non-zero pivots, and P records them', ro: 'unele matrici au nevoie de schimburi de linii (pivotare parțială) pentru pivoți nenuli, iar P le înregistrează' }, correct: true },
      { text: { en: 'P is always the identity', ro: 'P este întotdeauna identitatea' }, correct: false, feedback: { en: 'If P = I always, PA = LU would be the same as A = LU — but A = LU fails for e.g. A = [[0,1],[1,0]] (zero pivot at start).', ro: 'Dacă P = I mereu, PA = LU ar fi același lucru cu A = LU — dar A = LU eșuează pentru ex. A = [[0,1],[1,0]] (pivot zero la start).' } },
      { text: { en: 'Without P, L would be upper-triangular', ro: 'Fără P, L ar fi triunghiulară superior' }, correct: false, feedback: { en: 'L stays lower-triangular in both variants; P only permutes rows, it doesn\'t flip triangularity.', ro: 'L rămâne inferior în ambele variante; P doar permută linii, nu schimbă triunghiularitatea.' } },
      { text: { en: 'It changes the solution x', ro: 'Schimbă soluția x' }, correct: false, feedback: { en: 'PA x = Pb has the same x as A x = b; permuting rows of the system doesn\'t change the unknown vector.', ro: 'PA x = Pb are același x ca A x = b; permutarea liniilor sistemului nu schimbă vectorul necunoscut.' } },
    ],
    explanation: {
      en: 'Plain A = LU exists only when every leading principal minor is non-zero. Partial pivoting (swap to put the largest |·| pivot on top) always succeeds for non-singular A and gives PA = LU. The solution is the same — the pivoting is a reordering.',
      ro: 'A = LU simplă există doar când toți minorii principali sunt nenuli. Pivotarea parțială (aduce cel mai mare pivot în modul sus) reușește întotdeauna pentru A nesingulară și dă PA = LU. Soluția este aceeași — pivotarea e o reordonare.',
    },
  }];

  const mc3swap = [{
    question: {
      en: 'In (a) A = [[0,1,1],[1,−2,−1],[1,−1,1]], the first pivoting step swaps',
      ro: 'În (a) A = [[0,1,1],[1,−2,−1],[1,−1,1]], primul pas de pivotare schimbă',
    },
    options: [
      { text: 'R1 ↔ R2', correct: true },
      { text: 'R1 ↔ R3', correct: false, feedback: { en: 'Also valid in principle (both R2 and R3 have |a₁₁| = 1), but partial pivoting conventionally picks the *first* max-absolute-value row to avoid unnecessary reordering. The worked solution uses R2.', ro: 'Valid în principiu (și R2 și R3 au |a₁₁| = 1), dar pivotarea parțială alege convențional *prima* linie cu max — soluția folosește R2.' } },
      { text: 'R2 ↔ R3', correct: false, feedback: { en: 'That leaves the zero at (1,1) untouched — the pivot is still unusable. The swap must bring a non-zero into position (1,1).', ro: 'Acela lasă zero-ul la (1,1) neschimbat — pivotul rămâne inutilizabil. Schimbul trebuie să aducă un nenul la (1,1).' } },
      { text: { en: 'no swap — first pivot is usable', ro: 'fără schimb — primul pivot e utilizabil' }, correct: false, feedback: { en: 'a₁₁ = 0 is the textbook unusable pivot — you cannot divide by zero during Gaussian elimination.', ro: 'a₁₁ = 0 este pivotul clasic inutilizabil — nu poți împărți la zero în eliminarea Gauss.' } },
    ],
    explanation: {
      en: 'a₁₁ = 0 so we cannot use it as a pivot. Partial pivoting picks the largest-modulus entry in column 1 below row 1: rows 2 and 3 both have |1|; swapping R1 ↔ R2 brings a non-zero pivot to (1, 1) and matches the worked solution.',
      ro: 'a₁₁ = 0 deci nu-l putem folosi ca pivot. Pivotarea parțială alege cea mai mare intrare în modul de pe coloana 1 sub linia 1: liniile 2 și 3 au ambele |1|; schimbând R1 ↔ R2 aducem un pivot nenul la (1, 1) și potrivim soluția.',
    },
  }];

  const mc3swapD = [{
    question: {
      en: 'In (d) A = [[2,0,0,0],[1,1.5,0,0],[0,−3,0.5,0],[2,−2,1,1]], after the first elimination pass (clearing column 1), which row swap does partial pivoting trigger for the column-2 pivot?',
      ro: 'În (d) A = [[2,0,0,0],[1,1.5,0,0],[0,−3,0.5,0],[2,−2,1,1]], după prima etapă de eliminare (coloana 1), ce schimb de linii declanșează pivotarea parțială pentru pivotul coloanei 2?',
    },
    options: [
      { text: 'R2 ↔ R3', correct: true },
      { text: 'R2 ↔ R4', correct: false, feedback: { en: 'After column-1 elimination the sub-diagonal column-2 values are 1.5, −3, −2. |−3| > |−2|, so R3 wins over R4.', ro: 'După eliminarea coloanei 1, valorile sub-diagonale ale coloanei 2 sunt 1.5, −3, −2. |−3| > |−2|, deci R3 câștigă.' } },
      { text: { en: 'no swap', ro: 'fără schimb' }, correct: false, feedback: { en: 'Current (2,2) = 1.5 is smaller than |−3|, so partial pivoting *does* swap to use the larger pivot for numerical stability.', ro: '(2,2) = 1.5 e mai mic decât |−3|, deci pivotarea parțială *chiar* schimbă pentru a folosi pivotul mai mare pentru stabilitate numerică.' } },
      { text: 'R3 ↔ R4', correct: false, feedback: { en: 'That is the *second* swap (column-3 pivot choice between 0.25 and 2/3) — not the first column-2 swap.', ro: 'Acela e al *doilea* schimb (alegerea pivotului coloanei 3 între 0.25 și 2/3) — nu primul schimb de coloană 2.' } },
    ],
    explanation: {
      en: 'After clearing column 1, the column-2 sub-diagonal entries are 1.5, −3, −2. Partial pivoting chooses the largest in absolute value: |−3| > |−2| > |1.5|, so R3 becomes the new row-2 pivot — swap R2 ↔ R3. Later, the column-3 choice between 0.25 and 2/3 triggers a second swap R3 ↔ R4.',
      ro: 'După eliminarea coloanei 1, intrările sub-diagonale ale coloanei 2 sunt 1.5, −3, −2. Pivotarea parțială alege cel mai mare în modul: |−3| > |−2| > |1.5|, deci R3 devine noul pivot în linia 2 — schimb R2 ↔ R3. Ulterior, alegerea coloanei 3 între 0.25 și 2/3 declanșează al doilea schimb R3 ↔ R4.',
    },
  }];

  /* ─── P4: actual solve ─── */
  const mc4sol = [{
    question: {
      en: 'The solution of the system 3x₁ + x₃ = 2;  6x₁ + x₂ + x₃ = 2;  −3x₁ + x₂ = 5 is',
      ro: 'Soluția sistemului 3x₁ + x₃ = 2;  6x₁ + x₂ + x₃ = 2;  −3x₁ + x₂ = 5 este',
    },
    options: [
      { text: 'x = (−5/6, 5/2, 9/2)ᵀ', correct: true },
      { text: 'x = (5/6, −5/2, 9/2)ᵀ', correct: false, feedback: { en: 'Sign error on x₁ and x₂. Verify: 3·(5/6) + 9/2 = 5/2 + 9/2 = 7 ≠ 2 (Eq 1 fails).', ro: 'Eroare de semn pe x₁ și x₂. Verifică: 3·(5/6) + 9/2 = 5/2 + 9/2 = 7 ≠ 2 (Eq 1 eșuează).' } },
      { text: 'x = (0, 5, 2)ᵀ', correct: false, feedback: { en: 'Test Eq 1: 3·0 + 2 = 2 ✓, but Eq 2: 6·0 + 5 + 2 = 7 ≠ 2, and Eq 3: 0 + 5 = 5 ✓. One equation fails.', ro: 'Test Eq 1: 3·0 + 2 = 2 ✓, dar Eq 2: 6·0 + 5 + 2 = 7 ≠ 2, iar Eq 3: 0 + 5 = 5 ✓. O ecuație eșuează.' } },
      { text: 'x = (−1, 2, 5)ᵀ', correct: false, feedback: { en: 'Eq 1: −3 + 5 = 2 ✓, Eq 3: 3 + 2 = 5 ✓, but Eq 2: −6 + 2 + 5 = 1 ≠ 2. Not quite.', ro: 'Eq 1: −3 + 5 = 2 ✓, Eq 3: 3 + 2 = 5 ✓, dar Eq 2: −6 + 2 + 5 = 1 ≠ 2. Aproape.' } },
    ],
    explanation: {
      en: 'With A = [[3,0,1],[6,1,1],[−3,1,0]], Doolittle LU gives L = [[1,0,0],[2,1,0],[−1,1,1]], U = [[3,0,1],[0,1,−1],[0,0,2]]. Solve Ly = b: y = (2, −2, 9). Solve Ux = y: x₃ = 9/2, x₂ = 5/2, x₁ = −5/6.',
      ro: 'Cu A = [[3,0,1],[6,1,1],[−3,1,0]], Doolittle LU dă L = [[1,0,0],[2,1,0],[−1,1,1]], U = [[3,0,1],[0,1,−1],[0,0,2]]. Ly = b: y = (2, −2, 9). Ux = y: x₃ = 9/2, x₂ = 5/2, x₁ = −5/6.',
    },
  }];

  return (
    <>
      <p className="mb-4 text-sm opacity-80">
        {t(
          'Source: Linear Algebra & Optimization Seminar 4 — LU decomposition, Doolittle vs Crout, PA = LU with partial pivoting, UAIC 2025–2026.',
          'Sursa: Seminar ALO 4 — Descompunerea LU, Doolittle vs Crout, PA = LU cu pivotare parțială, UAIC 2025–2026.',
        )}
      </p>

      {/* ══════════ Problem 1 ══════════ */}
      <h3 className="text-lg font-bold mt-6 mb-2">
        {t('Problem 1: Solve LU·x = b when LU is already given', 'Problema 1: Rezolvă LU·x = b când LU e deja dată')}
      </h3>
      <Box type="definition">
        <p className="text-sm">{t(
          'Solve two 3×3 systems presented directly in factored form L·U·x = b.',
          'Rezolvați două sisteme 3×3 prezentate direct sub forma factorizată L·U·x = b.',
        )}</p>
        <ul className="text-sm list-disc ml-4 mt-1">
          <li>(a) L = [[1,0,0],[2,1,0],[−1,0,1]], U = [[2,3,−1],[0,−2,1],[0,0,3]], b = (2, −1, 1)ᵀ</li>
          <li>(b) L = [[1,0,0],[2,1,0],[−3,2,1]], U = [[1,2,−3],[0,1,2],[0,0,1]], b = (4, 6, 8)ᵀ</li>
        </ul>
      </Box>

      <p className="text-sm font-semibold mt-3 mb-1">{t('Solution strategy', 'Strategia de rezolvare')}</p>
      <MultipleChoice questions={mc1strategy} />

      <p className="text-sm font-semibold mt-3 mb-1">{t('Solution of (a)', 'Soluția pentru (a)')}</p>
      <MultipleChoice questions={mc1a} />

      <p className="text-sm font-semibold mt-3 mb-1">{t('Solution of (b) — x₃', 'Soluția pentru (b) — x₃')}</p>
      <MultipleChoice questions={mc1b} />

      <Toggle
        question={t('Show both full solutions', 'Arată ambele soluții complete')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">(a)</p>
            <p className="text-sm mb-2">{t('Forward on Ly = b', 'Substituție directă pe Ly = b')}: y = (2, −5, 3)ᵀ.</p>
            <p className="text-sm mb-2">{t('Back on Ux = y', 'Substituție inversă pe Ux = y')}: x = (−3, 3, 1)ᵀ.</p>

            <p className="font-bold mt-4 mb-1">(b)</p>
            <p className="text-sm mb-2">{t('Forward on Ly = b', 'Substituție directă pe Ly = b')}: y = (4, −2, 24)ᵀ.</p>
            <p className="text-sm mb-2">{t('Back on Ux = y', 'Substituție inversă pe Ux = y')}: x = (176, −50, 24)ᵀ.</p>
            <Box type="theorem">
              <p className="text-sm">{t(
                'Cost per RHS once A = LU is known: ≈ n² multiplications for Ly = b and another ≈ n² for Ux = y, total ≈ 2n² — independent of the (one-time) Θ(n³/3) factorisation cost.',
                'Cost per RHS odată A = LU cunoscut: ≈ n² înmulțiri pentru Ly = b și încă ≈ n² pentru Ux = y, total ≈ 2n² — independent de costul (o singură dată) Θ(n³/3) al factorizării.',
              )}</p>
            </Box>
          </div>
        }
      />

      {/* ══════════ Problem 2 ══════════ */}
      <h3 className="text-lg font-bold mt-8 mb-2">
        {t('Problem 2: Compute LU in two flavours — Doolittle and Crout', 'Problema 2: Calculați LU în două variante — Doolittle și Crout')}
      </h3>
      <Box type="definition">
        <p className="text-sm">{t(
          'For A₁ = [[1,2,−3],[2,5,−4],[−3,−4,14]] and A₂ = [[2,3,−1],[4,4,−1],[−2,−3,4]], compute (i) Doolittle LU (L unit-diagonal, U upper) and (ii) Crout LU (L lower, U unit-diagonal).',
          'Pentru A₁ = [[1,2,−3],[2,5,−4],[−3,−4,14]] și A₂ = [[2,3,−1],[4,4,−1],[−2,−3,4]], calculați (i) Doolittle LU (L diagonală unitară, U superior) și (ii) Crout LU (L inferior, U diagonală unitară).',
        )}</p>
      </Box>
      <MultipleChoice questions={mc2flavors} />
      <Toggle
        question={t('Show both factorisations for A₁ and A₂', 'Arată ambele factorizări pentru A₁ și A₂')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">A₁ — Doolittle</p>
            <Code>{`L = 1   0   0      U = 1   2  -3
    2   1   0          0   1   2
   -3   2   1          0   0   1`}</Code>
            <p className="text-sm mt-2 mb-2">{t(
              'All pivots are 1 in U, so the Crout factorisation coincides with Doolittle here (D = diag(U) = I).',
              'Toți pivoții sunt 1 în U, deci factorizarea Crout coincide cu Doolittle aici (D = diag(U) = I).',
            )}</p>

            <p className="font-bold mt-4 mb-1">A₂ — Doolittle</p>
            <Code>{`L = 1   0   0      U = 2   3  -1
    2   1   0          0  -2   1
   -1   0   1          0   0   3`}</Code>

            <p className="font-bold mt-4 mb-1">A₂ — Crout</p>
            <Code>{`L = 2   0   0      U = 1   3/2  -1/2
    4  -2   0          0    1   -1/2
   -2   0   3          0    0    1`}</Code>
            <p className="text-sm mt-2 mb-2">{t(
              'Obtained by D = diag(2, −2, 3): L_Crout = L_Doolittle·D, U_Crout = D⁻¹·U_Doolittle.',
              'Obținute cu D = diag(2, −2, 3): L_Crout = L_Doolittle·D, U_Crout = D⁻¹·U_Doolittle.',
            )}</p>
            <Box type="theorem">
              <p className="text-sm">{t(
                'Uniqueness: for a non-singular A with non-zero leading minors, the LDU decomposition (L unit-lower, D diagonal, U unit-upper) is unique. Doolittle absorbs D into U; Crout absorbs D into L.',
                'Unicitate: pentru A nesingulară cu minori principali nenuli, descompunerea LDU (L inferior-unitar, D diagonal, U superior-unitar) este unică. Doolittle absoarbe D în U; Crout absoarbe D în L.',
              )}</p>
            </Box>
          </div>
        }
      />

      {/* ══════════ Problem 3 ══════════ */}
      <h3 className="text-lg font-bold mt-8 mb-2">
        {t('Problem 3: PA = LU with partial pivoting', 'Problema 3: PA = LU cu pivotare parțială')}
      </h3>
      <Box type="definition">
        <p className="text-sm">{t(
          'For each matrix, find a permutation matrix P, a unit-lower-triangular L, and an upper-triangular U with P·A = L·U.',
          'Pentru fiecare matrice, găsiți o matrice de permutare P, o matrice inferior-triunghiulară unitară L și una superior-triunghiulară U cu P·A = L·U.',
        )}</p>
        <ul className="text-sm list-disc ml-4 mt-1">
          <li>(a) A = [[0,1,1],[1,−2,−1],[1,−1,1]]</li>
          <li>(b) A = [[1,2,−1],[2,4,7],[−1,2,5]]</li>
          <li>(c) A = [[0,2,−1],[1,−1,2],[1,−1,4]]</li>
          <li>(d) A = [[2,0,0,0],[1,1.5,0,0],[0,−3,0.5,0],[2,−2,1,1]]</li>
        </ul>
      </Box>
      <MultipleChoice questions={mc3why} />

      <p className="text-sm font-semibold mt-3 mb-1">{t('First swap in (a)', 'Primul schimb în (a)')}</p>
      <MultipleChoice questions={mc3swap} />

      <p className="text-sm font-semibold mt-3 mb-1">{t('Column-2 pivot in (d)', 'Pivotul coloanei 2 în (d)')}</p>
      <MultipleChoice questions={mc3swapD} />

      <Toggle
        question={t('Show P, L, U for all four matrices', 'Arată P, L, U pentru toate patru matricile')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">(a) {t('A has a zero pivot at (1, 1), so swap R1 ↔ R2', 'A are pivot zero la (1, 1), deci schimbăm R1 ↔ R2')}</p>
            <Code>{`P =  0  1  0    L = 1  0  0    U = 1 -2 -1
     1  0  0        0  1  0        0  1  1
     0  0  1        1  1  1        0  0  1`}</Code>

            <p className="font-bold mt-4 mb-1">(b) {t('Two swaps: R1 ↔ R2 (pivot 2), then R2 ↔ R3 (pivot 4 beats 0)', 'Două schimburi: R1 ↔ R2 (pivot 2), apoi R2 ↔ R3 (pivot 4 > 0)')}</p>
            <Code>{`P =  0  1  0    L =  1      0    0    U = 2   4   7
     0  0  1       -1/2    1    0        0   4  17/2
     1  0  0        1/2    0    1        0   0  -9/2`}</Code>

            <p className="font-bold mt-4 mb-1">(c) {t('Swap R1 ↔ R2 (zero pivot)', 'Schimbăm R1 ↔ R2 (pivot zero)')}</p>
            <Code>{`P =  0  1  0    L = 1  0  0    U = 1 -1  2
     1  0  0        0  1  0        0  2 -1
     0  0  1        1  0  1        0  0  2`}</Code>

            <p className="font-bold mt-4 mb-1">(d) {t('Two swaps: R2 ↔ R3 (pivot −3), then R3 ↔ R4 (pivot 2/3 beats 1/4)', 'Două schimburi: R2 ↔ R3 (pivot −3), apoi R3 ↔ R4 (pivot 2/3 > 1/4)')}</p>
            <p className="text-sm mb-1 font-semibold">P</p>
            <Code>{`1  0  0  0
0  0  1  0
0  0  0  1
0  1  0  0`}</Code>
            <p className="text-sm mb-1 mt-2 font-semibold">L</p>
            <Code>{`  1      0      0    0
  0      1      0    0
  1     2/3     1    0
 1/2   -1/2   3/8    1`}</Code>
            <p className="text-sm mb-1 mt-2 font-semibold">U</p>
            <Code>{`2    0      0      0
0   -3    1/2      0
0    0    2/3      1
0    0      0   -3/8`}</Code>
            <Box type="theorem">
              <p className="text-sm">{t(
                'After PA = LU is computed, solving PA·x = P·b is again two triangular solves: Ly = Pb, then Ux = y. P is trivial to invert — it just permutes the entries of b.',
                'Odată calculat PA = LU, rezolvarea PA·x = P·b este iarăși două substituții triunghiulare: Ly = Pb, apoi Ux = y. P se inversează trivial — doar permută componentele lui b.',
              )}</p>
            </Box>
          </div>
        }
      />

      {/* ══════════ Problem 4 ══════════ */}
      <h3 className="text-lg font-bold mt-8 mb-2">
        {t('Problem 4: Solve Ax = b via an LU decomposition', 'Problema 4: Rezolvați Ax = b printr-o descompunere LU')}
      </h3>
      <Box type="definition">
        <p className="text-sm">{t(
          'Solve  3x₁ + x₃ = 2;  6x₁ + x₂ + x₃ = 2;  −3x₁ + x₂ = 5  via LU.',
          'Rezolvați  3x₁ + x₃ = 2;  6x₁ + x₂ + x₃ = 2;  −3x₁ + x₂ = 5  via LU.',
        )}</p>
      </Box>
      <MultipleChoice questions={mc4sol} />
      <Toggle
        question={t('Show L, U and the two substitution stages', 'Arată L, U și cele două etape de substituție')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">{t('Doolittle LU of A', 'Doolittle LU pe A')}</p>
            <Code>{`A = 3   0   1        L = 1   0   0        U = 3   0   1
    6   1   1            2   1   0            0   1  -1
   -3   1   0           -1   1   1            0   0   2`}</Code>
            <p className="text-sm mt-2 mb-2">{t('No pivoting needed — (1,1), (2,2), (3,3) pivots are 3, 1, 2, all non-zero.', 'Fără pivotare — pivoții (1,1), (2,2), (3,3) sunt 3, 1, 2, toți nenuli.')}</p>

            <p className="font-bold mt-4 mb-1">{t('Step 1: Ly = b', 'Pasul 1: Ly = b')}</p>
            <p className="text-sm mb-2">
              y₁ = 2;  2·2 + y₂ = 2 ⇒ y₂ = −2;  −2 + (−2) + y₃ = 5 ⇒ y₃ = 9.
            </p>

            <p className="font-bold mt-4 mb-1">{t('Step 2: Ux = y', 'Pasul 2: Ux = y')}</p>
            <p className="text-sm mb-2">
              2x₃ = 9 ⇒ x₃ = 9/2;  x₂ − 9/2 = −2 ⇒ x₂ = 5/2;  3x₁ + 9/2 = 2 ⇒ x₁ = −5/6.
            </p>

            <p className="text-sm mb-2">
              {t('Sanity check', 'Verificare')}: 3·(−5/6) + 9/2 = 2 ✓;  6·(−5/6) + 5/2 + 9/2 = 2 ✓;  −3·(−5/6) + 5/2 = 5 ✓.
            </p>

            <Box type="theorem">
              <p className="text-sm">{t(
                'LU is the standard factorisation for dense solvers: compute once in Θ(n³/3), reuse for any number of RHS at Θ(n²) each. For ill-conditioned A, prefer QR (course 6) — more stable, at double the cost.',
                'LU este factorizarea standard pentru solveri dens: calculăm o dată în Θ(n³/3), reutilizăm pentru oricâte RHS la Θ(n²) fiecare. Pentru A rău-condiționată, preferăm QR (cursul 6) — mai stabilă, cu cost dublu.',
              )}</p>
            </Box>
          </div>
        }
      />
    </>
  );
}
