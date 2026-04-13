import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Toggle } from '../../../components/ui';
import MultipleChoice from '../../../components/ui/MultipleChoice';

export default function Seminar06() {
  const { t } = useApp();

  /* ─── P1: eigenvalues / eigenvectors ─── */
  const mc1a = [{
    question: {
      en: 'For A = [[2,−3,6],[0,3,−4],[0,2,−3]], the eigenvalues are',
      ro: 'Pentru A = [[2,−3,6],[0,3,−4],[0,2,−3]], valorile proprii sunt',
    },
    options: [
      { text: '{2, 1, −1}', correct: true },
      { text: '{2, 3, −3}', correct: false },
      { text: '{2, 2, 2}', correct: false },
      { text: '{0, 1, 2}', correct: false },
    ],
    explanation: {
      en: 'A is block upper-triangular: λ = 2 from the (1,1) block. The trailing 2×2 [[3,−4],[2,−3]] has det(B−λI) = λ² − 1, giving λ = ±1. Three distinct eigenvalues ⇒ 3 LI eigenvectors, A is diagonalisable.',
      ro: 'A este bloc superior-triunghiular: λ = 2 din blocul (1,1). Blocul 2×2 final [[3,−4],[2,−3]] are det(B−λI) = λ² − 1, dând λ = ±1. Trei valori proprii distincte ⇒ 3 vectori proprii LI, A e diagonalizabilă.',
    },
  }];

  const mc1c = [{
    question: {
      en: 'For A = [[2,1,−1],[0,2,1],[0,0,3]], how many linearly independent eigenvectors does A have?',
      ro: 'Pentru A = [[2,1,−1],[0,2,1],[0,0,3]], câți vectori proprii liniar independenți are A?',
    },
    options: [
      { text: '2', correct: true },
      { text: '3', correct: false },
      { text: '1', correct: false },
      { text: '0', correct: false },
    ],
    explanation: {
      en: 'Upper-triangular ⇒ eigenvalues are diagonal: {2, 2, 3}. For λ = 2: (A − 2I) has rank 2, so null(A − 2I) is 1-D — only one eigenvector. For λ = 3 one more. Total 2 < 3 ⇒ A is not diagonalisable (defective).',
      ro: 'Triunghi superior ⇒ valorile proprii sunt pe diagonală: {2, 2, 3}. Pentru λ = 2: (A − 2I) are rang 2, deci nucleul are dim 1 — un singur vector propriu. Pentru λ = 3 încă unul. Total 2 < 3 ⇒ A nu este diagonalizabilă (defectivă).',
    },
  }];

  const mc1d = [{
    question: {
      en: 'For A = [[1,0,0],[−1,0,1],[−1,−1,2]], the algebraic and geometric multiplicities of λ = 1 are',
      ro: 'Pentru A = [[1,0,0],[−1,0,1],[−1,−1,2]], multiplicitățile algebrică și geometrică ale lui λ = 1 sunt',
    },
    options: [
      { text: { en: 'algebraic = 3, geometric = 2', ro: 'algebrică = 3, geometrică = 2' }, correct: true },
      { text: { en: 'algebraic = 3, geometric = 3', ro: 'algebrică = 3, geometrică = 3' }, correct: false },
      { text: { en: 'algebraic = 1, geometric = 1', ro: 'algebrică = 1, geometrică = 1' }, correct: false },
      { text: { en: 'algebraic = 2, geometric = 1', ro: 'algebrică = 2, geometrică = 1' }, correct: false },
    ],
    explanation: {
      en: 'det(A − λI) = −(λ − 1)³, so algebraic = 3. A − I = [[0,0,0],[−1,−1,1],[−1,−1,1]] has rank 1, so dim null(A − I) = 3 − 1 = 2 (geometric). Geometric < algebraic ⇒ A is not diagonalisable.',
      ro: 'det(A − λI) = −(λ − 1)³, deci algebrică = 3. A − I = [[0,0,0],[−1,−1,1],[−1,−1,1]] are rang 1, deci dim null(A − I) = 3 − 1 = 2 (geometrică). Geometrică < algebrică ⇒ A nu e diagonalizabilă.',
    },
  }];

  /* ─── P2: Non-similarity ─── */
  const mc2invariants = [{
    question: {
      en: 'Which of the following is NOT preserved under similarity A ↦ P⁻¹AP?',
      ro: 'Care dintre următoarele NU este conservat sub similaritate A ↦ P⁻¹AP?',
    },
    options: [
      { text: { en: 'The matrix entries (they can change completely)', ro: 'Intrările matricei (se pot schimba complet)' }, correct: true },
      { text: { en: 'Trace', ro: 'Urma' }, correct: false },
      { text: { en: 'Determinant', ro: 'Determinantul' }, correct: false },
      { text: { en: 'Characteristic polynomial (hence spectrum)', ro: 'Polinomul caracteristic (deci spectrul)' }, correct: false },
    ],
    explanation: {
      en: 'Similarity is a change of basis: the same operator, new coordinates. Entries change; trace, determinant, characteristic polynomial, minimal polynomial, rank, Jordan form — all invariant. Comparing any one of these is enough to disprove similarity.',
      ro: 'Similaritatea este schimbare de bază: același operator, coordonate noi. Intrările se schimbă; urma, determinantul, polinomul caracteristic, polinomul minimal, rangul, forma Jordan — toate invariante. Compararea oricăruia ajunge pentru a respinge similaritatea.',
    },
  }];

  const mc2a = [{
    question: {
      en: 'For A = [[2,1],[1,2]] vs B = [[1,2],[2,1]], which invariant distinguishes them?',
      ro: 'Pentru A = [[2,1],[1,2]] vs B = [[1,2],[2,1]], care invariant le distinge?',
    },
    options: [
      { text: { en: 'Trace: tr(A) = 4, tr(B) = 2', ro: 'Urma: tr(A) = 4, tr(B) = 2' }, correct: true },
      { text: { en: 'Determinant: equal in both', ro: 'Determinantul: egal în ambele' }, correct: false },
      { text: { en: 'Size: different dimensions', ro: 'Dimensiunea: diferite' }, correct: false },
      { text: { en: 'Symmetry: one is not symmetric', ro: 'Simetria: una nu e simetrică' }, correct: false },
    ],
    explanation: {
      en: 'Trace is the sum of diagonal entries. tr(A) = 2 + 2 = 4 ≠ 2 = 1 + 1 = tr(B), so A, B have different eigenvalue sums and cannot be similar. (In fact both are symmetric and have the same det = 3; trace is the deciding invariant here.)',
      ro: 'Urma este suma elementelor diagonale. tr(A) = 2 + 2 = 4 ≠ 2 = 1 + 1 = tr(B), deci A, B au sume de valori proprii diferite și nu pot fi asemenea. (Ambele sunt simetrice și au același det = 3; urma decide.)',
    },
  }];

  /* ─── P3: Power method ─── */
  const mc3a = [{
    question: {
      en: 'For A = [[2,1,1],[1,2,1],[1,1,2]] with x⁽⁰⁾ = (1, −1, 2)ᵀ, the un-normalised iterate A·x⁽⁰⁾ is',
      ro: 'Pentru A = [[2,1,1],[1,2,1],[1,1,2]] cu x⁽⁰⁾ = (1, −1, 2)ᵀ, iterata ne-normalizată A·x⁽⁰⁾ este',
    },
    options: [
      { text: '(3, 1, 4)ᵀ', correct: true },
      { text: '(1, 1, 4)ᵀ', correct: false },
      { text: '(2, −1, 4)ᵀ', correct: false },
      { text: '(1, −1, 2)ᵀ', correct: false },
    ],
    explanation: {
      en: 'Row-by-row: 2·1 + 1·(−1) + 1·2 = 3;  1·1 + 2·(−1) + 1·2 = 1;  1·1 + 1·(−1) + 2·2 = 4. Normalising by ‖·‖∞ = 4 gives x⁽¹⁾ = (3/4, 1/4, 1)ᵀ.',
      ro: 'Linie cu linie: 2·1 + 1·(−1) + 1·2 = 3;  1·1 + 2·(−1) + 1·2 = 1;  1·1 + 1·(−1) + 2·2 = 4. Normalizat la ‖·‖∞ = 4 dă x⁽¹⁾ = (3/4, 1/4, 1)ᵀ.',
    },
  }];

  const mc3converge = [{
    question: {
      en: 'For A = [[2,1,1],[1,2,1],[1,1,2]], the dominant eigenvalue is',
      ro: 'Pentru A = [[2,1,1],[1,2,1],[1,1,2]], valoarea proprie dominantă este',
    },
    options: [
      { text: '4', correct: true },
      { text: '2', correct: false },
      { text: '3', correct: false },
      { text: '1', correct: false },
    ],
    explanation: {
      en: 'A = I + J where J is the all-ones matrix. J has eigenvalues {3, 0, 0}, so A = I + J has {4, 1, 1}. The dominant is λ = 4, eigenvector (1, 1, 1)ᵀ — which matches the direction the power iterates approach.',
      ro: 'A = I + J unde J este matricea toți-unu. J are valorile proprii {3, 0, 0}, deci A = I + J are {4, 1, 1}. Dominanta este λ = 4, vectorul propriu (1, 1, 1)ᵀ — direcția spre care converg iterațiile.',
    },
  }];

  /* ─── P4: QR eigenvalue iteration ─── */
  const mc4 = [{
    question: {
      en: 'After one QR-iteration step A⁽¹⁾ = R·Q on A = [[6,8,13],[−8,6,−9],[0,0,10]], the matrix A⁽¹⁾ equals',
      ro: 'După un pas de iterație QR A⁽¹⁾ = R·Q pentru A = [[6,8,13],[−8,6,−9],[0,0,10]], matricea A⁽¹⁾ este',
    },
    options: [
      { text: 'A⁽¹⁾ = [[6, 8, 15], [−8, 6, 5], [0, 0, 10]]', correct: true },
      { text: 'A⁽¹⁾ = R (upper-triangular)', correct: false },
      { text: 'A⁽¹⁾ = A (unchanged)', correct: false },
      { text: 'A⁽¹⁾ = [[10, 8, 13], [−8, 10, −9], [0, 0, 6]]', correct: false },
    ],
    explanation: {
      en: 'With Q = [[0.6, 0.8, 0],[−0.8, 0.6, 0],[0, 0, 1]] and R = [[10, 0, 15],[0, 10, 5],[0, 0, 10]], multiply R·Q block-wise: the (3, :) row of R gives (0, 0, 10) → row 3 of A⁽¹⁾ unchanged; the leading 2×2 block comes back to (6, 8; −8, 6) because A has complex eigenvalues 6 ± 8i and QR cannot reduce them further without shifts.',
      ro: 'Cu Q = [[0.6, 0.8, 0],[−0.8, 0.6, 0],[0, 0, 1]] și R = [[10, 0, 15],[0, 10, 5],[0, 0, 10]], înmulțim R·Q pe blocuri: linia (3, :) din R dă (0, 0, 10) → linia 3 din A⁽¹⁾ neschimbată; blocul 2×2 de sus revine la (6, 8; −8, 6) pentru că A are valori proprii complexe 6 ± 8i și QR nu le poate reduce fără shifturi.',
    },
  }];

  return (
    <>
      <p className="mb-4 text-sm opacity-80">
        {t(
          'Source: Linear Algebra & Optimization Seminar 6 — Eigenvalues, similarity, power method, QR iteration, UAIC 2025–2026.',
          'Sursa: Seminar ALO 6 — Valori proprii, similaritate, metoda puterii, iterație QR, UAIC 2025–2026.',
        )}
      </p>

      {/* ══════════ Problem 1 ══════════ */}
      <h3 className="text-lg font-bold mt-6 mb-2">
        {t('Problem 1: Compute eigenvalues and eigenvectors — is there a LI basis?', 'Problema 1: Calculați valorile și vectorii proprii — există o bază LI?')}
      </h3>
      <Box type="definition">
        <p className="text-sm">{t(
          'For each matrix, find eigenvalues, a basis of eigenvectors for each, and decide whether A is diagonalisable.',
          'Pentru fiecare matrice, găsiți valorile proprii, o bază de vectori proprii pentru fiecare, și decideți dacă A este diagonalizabilă.',
        )}</p>
        <ul className="text-sm list-disc ml-4 mt-1">
          <li>(a) A = [[2, −3, 6],[0, 3, −4],[0, 2, −3]]</li>
          <li>(b) A = [[2, 0, 1],[0, 2, 0],[1, 0, 2]]</li>
          <li>(c) A = [[2, 1, −1],[0, 2, 1],[0, 0, 3]]</li>
          <li>(d) A = [[1, 0, 0],[−1, 0, 1],[−1, −1, 2]]</li>
        </ul>
      </Box>

      <p className="text-sm font-semibold mt-3 mb-1">{t('Spectrum of (a)', 'Spectrul lui (a)')}</p>
      <MultipleChoice questions={mc1a} />

      <p className="text-sm font-semibold mt-3 mb-1">{t('Eigenvector count of (c)', 'Numărul de vectori proprii pentru (c)')}</p>
      <MultipleChoice questions={mc1c} />

      <p className="text-sm font-semibold mt-3 mb-1">{t('Multiplicities of (d)', 'Multiplicitățile pentru (d)')}</p>
      <MultipleChoice questions={mc1d} />

      <Toggle
        question={t('Show eigenpairs and diagonalisability for all four', 'Arată perechile proprii și diagonalizabilitatea pentru toate patru')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">(a) λ = 2, 1, −1 — {t('diagonalisable', 'diagonalizabilă')}</p>
            <ul className="text-sm list-disc ml-4 mb-2">
              <li>λ = 2:  v = (1, 0, 0)ᵀ</li>
              <li>λ = 1:  v = (0, 2, 1)ᵀ</li>
              <li>λ = −1:  v = (−1, 1, 1)ᵀ</li>
            </ul>

            <p className="font-bold mt-3 mb-1">(b) λ = 1, 2, 3 — {t('diagonalisable', 'diagonalizabilă')}</p>
            <ul className="text-sm list-disc ml-4 mb-2">
              <li>λ = 1:  v = (−1, 0, 1)ᵀ</li>
              <li>λ = 2:  v = (0, 1, 0)ᵀ</li>
              <li>λ = 3:  v = (1, 0, 1)ᵀ</li>
            </ul>
            <p className="text-sm mb-2">{t(
              'Found from det(A − λI) = (2 − λ)·[(2 − λ)² − 1] = (2 − λ)(1 − λ)(3 − λ).',
              'Obținute din det(A − λI) = (2 − λ)·[(2 − λ)² − 1] = (2 − λ)(1 − λ)(3 − λ).',
            )}</p>

            <p className="font-bold mt-3 mb-1">(c) λ = 2 (algebraic 2), λ = 3 — {t('defective (not diagonalisable)', 'defectivă (ne-diagonalizabilă)')}</p>
            <ul className="text-sm list-disc ml-4 mb-2">
              <li>λ = 2:  v = (1, 0, 0)ᵀ — only one eigenvector (geometric 1 &lt; 2)</li>
              <li>λ = 3:  v = (0, 1, 1)ᵀ</li>
            </ul>

            <p className="font-bold mt-3 mb-1">(d) λ = 1 (algebraic 3) — {t('defective', 'defectivă')}</p>
            <p className="text-sm mb-2">{t(
              'A − I has rank 1, so null space is 2-D:',
              'A − I are rang 1, deci nucleul are dim 2:',
            )}</p>
            <ul className="text-sm list-disc ml-4 mb-2">
              <li>v₁ = (1, 0, 1)ᵀ,  v₂ = (0, 1, 1)ᵀ</li>
            </ul>
            <Box type="theorem">
              <p className="text-sm">{t(
                'A is diagonalisable ⇔ the geometric multiplicity equals the algebraic multiplicity for every eigenvalue. Distinct eigenvalues give diagonalisability automatically (like (a) and (b)). Repeated eigenvalues can fail (like (c) and (d)).',
                'A e diagonalizabilă ⇔ multiplicitatea geometrică = cea algebrică pentru fiecare valoare proprie. Valorile distincte dau diagonalizabilitate automat (ca (a) și (b)). Valorile repetate pot eșua (ca (c) și (d)).',
              )}</p>
            </Box>
          </div>
        }
      />

      {/* ══════════ Problem 2 ══════════ */}
      <h3 className="text-lg font-bold mt-8 mb-2">
        {t('Problem 2: Show the matrix pairs are NOT similar', 'Problema 2: Arată că perechile de matrice NU sunt asemenea')}
      </h3>
      <Box type="definition">
        <p className="text-sm">{t(
          'Two matrices A, B are similar iff B = P⁻¹AP for some invertible P. Disprove similarity by exhibiting a mismatched invariant.',
          'Două matrice A, B sunt asemenea dacă și numai dacă B = P⁻¹AP pentru o P inversabilă. Respinge similaritatea arătând un invariant diferit.',
        )}</p>
      </Box>

      <p className="text-sm font-semibold mt-3 mb-1">{t('Which is NOT a similarity invariant?', 'Care NU este invariant la similaritate?')}</p>
      <MultipleChoice questions={mc2invariants} />

      <p className="text-sm font-semibold mt-3 mb-1">{t('Separating invariant for pair (a)', 'Invariantul care separă perechea (a)')}</p>
      <MultipleChoice questions={mc2a} />

      <Toggle
        question={t('Show invariant that separates each pair', 'Arată invariantul care separă fiecare pereche')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">{t('(a) Trace', '(a) Urma')}</p>
            <p className="text-sm mb-2">tr(A) = 2 + 2 = 4; tr(B) = 1 + 1 = 2. {t('Different ⇒ not similar.', 'Diferite ⇒ nu sunt asemenea.')}</p>

            <p className="font-bold mt-3 mb-1">{t('(b) Determinant', '(b) Determinantul')}</p>
            <p className="text-sm mb-2">
              det(A) = 1 · 1 · 2 = 2 {t('(upper-triangular)', '(triunghi superior)')}; det(B) = 6 ({t('expand row 3', 'dezvoltă linia 3')}). {t('Different ⇒ not similar.', 'Diferite ⇒ nu sunt asemenea.')}
            </p>

            <p className="font-bold mt-3 mb-1">{t('(c) Trace', '(c) Urma')}</p>
            <p className="text-sm mb-2">
              tr(A) = 1 + 0 + 2 = 3; tr(B) = 2 + 0 + (−2) = 0. {t('Different ⇒ not similar.', 'Diferite ⇒ nu sunt asemenea.')}
            </p>
            <Box type="warning">
              <p className="text-sm">{t(
                'Matching trace and determinant does not imply similarity — you may need the full characteristic polynomial or the Jordan form. But a single mismatch already proves non-similarity.',
                'Potrivirea urmei și determinantului nu implică similaritate — s-ar putea să ai nevoie de polinomul caracteristic complet sau forma Jordan. Dar o singură nepotrivire e suficientă ca să respingi similaritatea.',
              )}</p>
            </Box>
          </div>
        }
      />

      {/* ══════════ Problem 3 ══════════ */}
      <h3 className="text-lg font-bold mt-8 mb-2">
        {t('Problem 3: Power method — three iterations', 'Problema 3: Metoda puterii — trei iterații')}
      </h3>
      <Box type="definition">
        <p className="text-sm">{t(
          'Run three iterations of the power method x⁽ᵏ⁺¹⁾ = A·x⁽ᵏ⁾ / ‖A·x⁽ᵏ⁾‖∞ on:',
          'Rulați trei iterații ale metodei puterii x⁽ᵏ⁺¹⁾ = A·x⁽ᵏ⁾ / ‖A·x⁽ᵏ⁾‖∞ pentru:',
        )}</p>
        <ul className="text-sm list-disc ml-4 mt-1">
          <li>(a) A = [[2,1,1],[1,2,1],[1,1,2]],  x⁽⁰⁾ = (1, −1, 2)ᵀ</li>
          <li>(b) A = [[1,1,1],[1,1,0],[1,0,1]],  x⁽⁰⁾ = (−1, 0, 1)ᵀ</li>
        </ul>
      </Box>

      <p className="text-sm font-semibold mt-3 mb-1">{t('First product for (a)', 'Primul produs pentru (a)')}</p>
      <MultipleChoice questions={mc3a} />

      <p className="text-sm font-semibold mt-3 mb-1">{t('Dominant eigenvalue of (a)', 'Valoarea proprie dominantă pentru (a)')}</p>
      <MultipleChoice questions={mc3converge} />

      <Toggle
        question={t('Show three iterations for both matrices', 'Arată trei iterații pentru ambele matrice')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">(a)</p>
            <Code>{`x⁽⁰⁾ = (1, -1, 2)
A·x⁽⁰⁾ = (3, 1, 4)          →  x⁽¹⁾ = (3/4, 1/4, 1)
A·x⁽¹⁾ = (2.75, 2.25, 3)    →  x⁽²⁾ = (11/12, 3/4, 1)
A·x⁽²⁾ = (43/12, 41/12, 44/12)  →  x⁽³⁾ = (43/44, 41/44, 1)`}</Code>
            <p className="text-sm mt-2 mb-2">{t(
              'λ-estimate ≈ 44/12 ≈ 3.67, heading to λ = 4. Eigenvector direction approaches (1, 1, 1)ᵀ.',
              'Estimare λ ≈ 44/12 ≈ 3.67, apropiindu-se de λ = 4. Direcția vectorului propriu se apropie de (1, 1, 1)ᵀ.',
            )}</p>

            <p className="font-bold mt-3 mb-1">(b)</p>
            <Code>{`x⁽⁰⁾ = (-1, 0, 1)
A·x⁽⁰⁾ = (0, -1, 0)         →  x⁽¹⁾ = (0, -1, 0)
A·x⁽¹⁾ = (-1, -1, 0)        →  x⁽²⁾ = (-1, -1, 0)
A·x⁽²⁾ = (-2, -2, -1)       →  x⁽³⁾ = (-1, -1, -1/2)`}</Code>
            <p className="text-sm mt-2 mb-2">{t(
              'True dominant λ = 1 + √2 ≈ 2.414 with eigenvector (√2, 1, 1)ᵀ. Iterates converge slowly because λ₂ = 1 has ratio |λ₂/λ₁| = 1/2.414 ≈ 0.41.',
              'Valoarea dominantă adevărată λ = 1 + √2 ≈ 2.414 cu vector propriu (√2, 1, 1)ᵀ. Iterațiile converg lent pentru că λ₂ = 1 are raport |λ₂/λ₁| = 1/2.414 ≈ 0.41.',
            )}</p>
            <Box type="theorem">
              <p className="text-sm">{t(
                'Convergence rate of the power method is geometric with ratio |λ₂/λ₁| (second-largest over largest). A good Rayleigh-quotient eigenvalue estimate at step k is λ ≈ ⟨x⁽ᵏ⁾, A·x⁽ᵏ⁾⟩ / ‖x⁽ᵏ⁾‖²; alternatively, if we normalise to ‖·‖∞, the dividing factor used at each step is itself a λ estimate.',
                'Rata de convergență a metodei puterii este geometrică cu raportul |λ₂/λ₁| (a doua valoare ca mărime / prima). O estimare bună a valorii proprii prin coeficientul Rayleigh la pasul k este λ ≈ ⟨x⁽ᵏ⁾, A·x⁽ᵏ⁾⟩ / ‖x⁽ᵏ⁾‖²; alternativ, dacă normalizăm la ‖·‖∞, factorul de împărțire folosit la fiecare pas este chiar o estimare a lui λ.',
              )}</p>
            </Box>
          </div>
        }
      />

      {/* ══════════ Problem 4 ══════════ */}
      <h3 className="text-lg font-bold mt-8 mb-2">
        {t('Problem 4: QR-iteration step for eigenvalues', 'Problema 4: Pas de iterație QR pentru valori proprii')}
      </h3>
      <Box type="definition">
        <p className="text-sm">{t(
          'Let A = [[6,8,13],[−8,6,−9],[0,0,10]]. Compute the QR decomposition by Givens, then the next matrix A⁽¹⁾ = R·Q in the QR-for-eigenvalues iteration.',
          'Fie A = [[6,8,13],[−8,6,−9],[0,0,10]]. Calculați QR prin Givens, apoi A⁽¹⁾ = R·Q, următoarea matrice în iterația QR pentru valori proprii.',
        )}</p>
      </Box>
      <MultipleChoice questions={mc4} />
      <Toggle
        question={t('Show Q, R, R·Q and comment', 'Arată Q, R, R·Q și comentariul')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">{t('QR by a single Givens in plane (1, 2)', 'QR printr-o singură rotație Givens în planul (1, 2)')}</p>
            <p className="text-sm mb-2">ρ = 10, c = 0.6, s = −0.8. {t('Same derivation as Seminar 5, Problem 4.', 'Aceeași derivare ca în Seminar 5, Problema 4.')}</p>
            <Code>{`Q = 0.6   0.8   0       R = 10    0   15
   -0.8   0.6   0            0   10    5
     0     0    1            0    0   10`}</Code>

            <p className="font-bold mt-3 mb-1">{t('Multiply R·Q', 'Înmulțim R·Q')}</p>
            <Code>{`A⁽¹⁾ = R·Q =  6   8  15
              -8   6   5
               0   0  10`}</Code>

            <p className="text-sm mt-2 mb-2">{t(
              'The trailing (3, 3) entry stays at 10 — one eigenvalue already converged. The top-left 2×2 block comes back to its original [[6, 8],[−8, 6]], because this block has complex eigenvalues 6 ± 8i: Givens/Householder over ℝ cannot drive a 2×2 with complex conjugate eigenvalues to triangular. Real-Schur form keeps such blocks.',
              'Intrarea (3, 3) rămâne 10 — o valoare proprie a convers deja. Blocul 2×2 din stânga-sus revine la [[6, 8],[−8, 6]], pentru că acest bloc are valori proprii complexe 6 ± 8i: Givens/Householder peste ℝ nu poate reduce un 2×2 cu valori proprii complex-conjugate la formă triunghiulară. Forma Schur reală păstrează astfel de blocuri.',
            )}</p>

            <Box type="theorem">
              <p className="text-sm">{t(
                'The QR iteration A⁽ᵏ⁺¹⁾ = R⁽ᵏ⁾ Q⁽ᵏ⁾ (after A⁽ᵏ⁾ = Q⁽ᵏ⁾R⁽ᵏ⁾) converges to block-upper-triangular form: 1×1 blocks for real eigenvalues, 2×2 blocks for conjugate complex pairs. With shifts and preliminary Hessenberg reduction it is the industry-standard eigenvalue solver.',
                'Iterația QR A⁽ᵏ⁺¹⁾ = R⁽ᵏ⁾ Q⁽ᵏ⁾ (după A⁽ᵏ⁾ = Q⁽ᵏ⁾R⁽ᵏ⁾) converge la formă bloc-triunghiulară superior: blocuri 1×1 pentru valori proprii reale, blocuri 2×2 pentru perechi complex-conjugate. Cu shifturi și reducere preliminară la Hessenberg este solverul standard pentru valori proprii.',
              )}</p>
            </Box>
          </div>
        }
      />
    </>
  );
}
