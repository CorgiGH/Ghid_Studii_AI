import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Toggle } from '../../../components/ui';
import MultipleChoice from '../../../components/ui/MultipleChoice';

export default function Seminar01() {
  const { t } = useApp();

  /* ─── P1 ─── */
  const mc1 = [{
    question: {
      en: 'For x = (1, 2, …, n)ᵀ ∈ ℕⁿ, which expression gives ‖x‖₁?',
      ro: 'Pentru x = (1, 2, …, n)ᵀ ∈ ℕⁿ, care expresie dă ‖x‖₁?',
    },
    options: [
      { text: 'n(n+1)/2', correct: true },
      { text: 'n²', correct: false },
      { text: 'n(n+1)(2n+1)/6', correct: false },
      { text: 'n', correct: false },
    ],
    explanation: {
      en: '‖x‖₁ = Σᵢ|xᵢ| = 1+2+⋯+n = n(n+1)/2.',
      ro: '‖x‖₁ = Σᵢ|xᵢ| = 1+2+⋯+n = n(n+1)/2.',
    },
  }];

  /* ─── P2: representative sub-parts a and c ─── */
  const mc2a = [{
    question: { en: 'For x = (−2, 2, 1)ᵀ, compute (‖x‖₂, ‖x‖₁, ‖x‖∞).', ro: 'Pentru x = (−2, 2, 1)ᵀ, calculați (‖x‖₂, ‖x‖₁, ‖x‖∞).' },
    options: [
      { text: '(3, 5, 2)', correct: true },
      { text: '(5, 3, 2)', correct: false },
      { text: '(3, 5, 3)', correct: false },
      { text: '(√5, 5, 2)', correct: false },
    ],
    explanation: {
      en: '‖x‖₂ = √(4+4+1) = 3; ‖x‖₁ = 2+2+1 = 5; ‖x‖∞ = max{2,2,1} = 2.',
      ro: '‖x‖₂ = √(4+4+1) = 3; ‖x‖₁ = 2+2+1 = 5; ‖x‖∞ = max{2,2,1} = 2.',
    },
  }];
  const mc2c = [{
    question: { en: 'For x = (3, −4, 0, 3/2)ᵀ, ‖x‖₂ equals', ro: 'Pentru x = (3, −4, 0, 3/2)ᵀ, ‖x‖₂ este' },
    options: [
      { text: '√109 / 2', correct: true },
      { text: '17/2', correct: false },
      { text: '4', correct: false },
      { text: '√(109/2)', correct: false },
    ],
    explanation: {
      en: '‖x‖₂² = 9+16+0+9/4 = 109/4; thus ‖x‖₂ = √109/2 ≈ 5.22.',
      ro: '‖x‖₂² = 9+16+0+9/4 = 109/4; deci ‖x‖₂ = √109/2 ≈ 5.22.',
    },
  }];

  /* ─── P3: pick 3 representative matrices for MC ─── */
  const mc3 = [{
    question: { en: 'For matrix (d) A with rows (4,−1,7), (−1,4,0), (−7,0,4), ‖A‖∞ = ?', ro: 'Pentru matricea (d) A cu liniile (4,−1,7), (−1,4,0), (−7,0,4), ‖A‖∞ = ?' },
    options: [
      { text: '12', correct: true },
      { text: '11', correct: false },
      { text: '7', correct: false },
      { text: '5', correct: false },
    ],
    explanation: {
      en: '‖A‖∞ is the max absolute row sum. Row sums: 4+1+7=12, 1+4+0=5, 7+0+4=11. Max = 12.',
      ro: '‖A‖∞ este maximul sumei absolute pe linii. Sume: 4+1+7=12, 1+4+0=5, 7+0+4=11. Max = 12.',
    },
  }];

  /* ─── P4: ‖·‖₁ column-sum norm ─── */
  const mc4 = [{
    question: {
      en: 'The matrix norm ‖A‖₁ = max_j Σᵢ|aᵢⱼ| is the maximum … sum.',
      ro: 'Norma matricială ‖A‖₁ = max_j Σᵢ|aᵢⱼ| este maximul sumei pe …',
    },
    options: [
      { text: { en: 'column', ro: 'coloană' }, correct: true },
      { text: { en: 'row', ro: 'linie' }, correct: false },
      { text: { en: 'diagonal', ro: 'diagonală' }, correct: false },
      { text: { en: 'main entries', ro: 'elementele diagonale' }, correct: false },
    ],
    explanation: {
      en: 'The index i runs over rows inside the sum, while j (the column) is fixed; the outer max is over columns — so ‖A‖₁ is the maximum column-sum of absolute values.',
      ro: 'Indicele i parcurge liniile în sumă, iar j (coloana) este fix; maximul exterior este pe coloane — deci ‖A‖₁ este maximul sumei absolute pe coloane.',
    },
  }];

  /* ─── P5: ⬚1 sum-of-all-entries norm ─── */
  const mc5 = [{
    question: {
      en: 'For the candidate norm ‖A‖⬚₁ = Σᵢⱼ |aᵢⱼ|, which property requires the most careful argument (beyond positivity and homogeneity)?',
      ro: 'Pentru norma candidat ‖A‖⬚₁ = Σᵢⱼ |aᵢⱼ|, care proprietate cere cea mai atentă argumentare (dincolo de pozitivitate și omogenitate)?',
    },
    options: [
      { text: { en: 'Sub-multiplicativity ‖AB‖⬚₁ ≤ ‖A‖⬚₁ · ‖B‖⬚₁', ro: 'Submultiplicativitatea ‖AB‖⬚₁ ≤ ‖A‖⬚₁ · ‖B‖⬚₁' }, correct: true },
      { text: { en: 'Triangle inequality', ro: 'Inegalitatea triunghiului' }, correct: false },
      { text: { en: '‖0‖⬚₁ = 0', ro: '‖0‖⬚₁ = 0' }, correct: false },
      { text: { en: 'Positive-definiteness', ro: 'Pozitiv-definirea' }, correct: false },
    ],
    explanation: {
      en: 'Triangle/positivity follow from the scalar |·|. Sub-multiplicativity needs the inequality |Σₖ aᵢₖbₖⱼ| ≤ Σₖ|aᵢₖ||bₖⱼ| summed over i,j and then factored as (Σᵢₖ|aᵢₖ|)(Σₖⱼ|bₖⱼ|).',
      ro: 'Triunghi/pozitivitate urmează din |·| scalar. Submultiplicativitatea cere |Σₖ aᵢₖbₖⱼ| ≤ Σₖ|aᵢₖ||bₖⱼ| sumat pe i,j și factorizat ca (Σᵢₖ|aᵢₖ|)(Σₖⱼ|bₖⱼ|).',
    },
  }];

  /* ─── P6: Frobenius ─── */
  const mc6 = [{
    question: {
      en: 'The key inequality used to prove ‖AB‖_F ≤ ‖A‖_F · ‖B‖_F is',
      ro: 'Inegalitatea cheie pentru a demonstra ‖AB‖_F ≤ ‖A‖_F · ‖B‖_F este',
    },
    options: [
      { text: { en: 'Cauchy–Schwarz on each entry (AB)ᵢⱼ = Σₖ aᵢₖ bₖⱼ', ro: 'Cauchy–Schwarz pe fiecare element (AB)ᵢⱼ = Σₖ aᵢₖ bₖⱼ' }, correct: true },
      { text: { en: 'The triangle inequality in ℝ', ro: 'Inegalitatea triunghiului în ℝ' }, correct: false },
      { text: { en: 'Hölder with p = ∞, q = 1', ro: 'Hölder cu p = ∞, q = 1' }, correct: false },
      { text: { en: 'Jensen’s inequality', ro: 'Inegalitatea lui Jensen' }, correct: false },
    ],
    explanation: {
      en: 'Cauchy–Schwarz gives |Σₖ aᵢₖbₖⱼ|² ≤ (Σₖ|aᵢₖ|²)(Σₖ|bₖⱼ|²). Summing over i,j and factoring yields ‖AB‖_F² ≤ ‖A‖_F² · ‖B‖_F².',
      ro: 'Cauchy–Schwarz dă |Σₖ aᵢₖbₖⱼ|² ≤ (Σₖ|aᵢₖ|²)(Σₖ|bₖⱼ|²). Sumând pe i,j și factorizând obținem ‖AB‖_F² ≤ ‖A‖_F² · ‖B‖_F².',
    },
  }];

  /* ─── P7: ‖x*‖₂ = ‖x‖₂ ─── */
  const mc7 = [{
    question: {
      en: 'Which identity is central to proving ‖x*‖₂ = ‖x‖₂ for x ∈ ℂⁿ?',
      ro: 'Care identitate este centrală pentru demonstrarea ‖x*‖₂ = ‖x‖₂ pentru x ∈ ℂⁿ?',
    },
    options: [
      { text: '|z̄| = |z| for every z ∈ ℂ', correct: true },
      { text: { en: 'Triangle inequality in ℂ', ro: 'Inegalitatea triunghiului în ℂ' }, correct: false },
      { text: 'z + z̄ = 2·Re(z)', correct: false },
      { text: { en: 'Cauchy–Schwarz in ℂⁿ', ro: 'Cauchy–Schwarz în ℂⁿ' }, correct: false },
    ],
    explanation: {
      en: 'x* is the conjugate transpose (a row vector). ‖x*‖₂² = Σᵢ|x̄ᵢ|² = Σᵢ|xᵢ|² = ‖x‖₂², using |z̄| = |z|.',
      ro: 'x* este transpusa conjugată (vector linie). ‖x*‖₂² = Σᵢ|x̄ᵢ|² = Σᵢ|xᵢ|² = ‖x‖₂², folosind |z̄| = |z|.',
    },
  }];

  /* ─── P8: x = (1-i, ..., 1-i) ─── */
  const mc8 = [{
    question: {
      en: 'For x ∈ ℂⁿ with every entry equal to 1 − i, compute ‖x‖₂.',
      ro: 'Pentru x ∈ ℂⁿ cu toate componentele egale cu 1 − i, calculați ‖x‖₂.',
    },
    options: [
      { text: '√(2n)', correct: true },
      { text: 'n√2', correct: false },
      { text: '2√n', correct: false },
      { text: 'n', correct: false },
    ],
    explanation: {
      en: '|1 − i|² = 1² + 1² = 2, so ‖x‖₂² = n · 2 and ‖x‖₂ = √(2n).',
      ro: '|1 − i|² = 1² + 1² = 2, deci ‖x‖₂² = n · 2 și ‖x‖₂ = √(2n).',
    },
  }];

  /* ─── P9: ‖x‖₂ ≤ √(‖x‖₁ · ‖x‖∞) ─── */
  const mc9 = [{
    question: {
      en: 'Which bound on |xᵢ|² is used to prove ‖x‖₂² ≤ ‖x‖₁ · ‖x‖∞?',
      ro: 'Ce margine pe |xᵢ|² se folosește pentru a demonstra ‖x‖₂² ≤ ‖x‖₁ · ‖x‖∞?',
    },
    options: [
      { text: '|xᵢ|² ≤ |xᵢ| · max_k |x_k|', correct: true },
      { text: '|xᵢ|² ≤ (Σ|xⱼ|)²', correct: false },
      { text: '|xᵢ|² ≤ ‖x‖₂²', correct: false },
      { text: '|xᵢ|² ≤ |xᵢ|²', correct: false },
    ],
    explanation: {
      en: 'Bound each term: |xᵢ|² = |xᵢ|·|xᵢ| ≤ |xᵢ|·‖x‖∞. Summing over i: ‖x‖₂² ≤ ‖x‖∞·Σᵢ|xᵢ| = ‖x‖∞·‖x‖₁.',
      ro: 'Majorăm fiecare termen: |xᵢ|² = |xᵢ|·|xᵢ| ≤ |xᵢ|·‖x‖∞. Sumând pe i: ‖x‖₂² ≤ ‖x‖∞·Σᵢ|xᵢ| = ‖x‖∞·‖x‖₁.',
    },
  }];

  /* ─── P10 ─── */
  const mc10a = [{
    question: {
      en: 'The complex inner product ⟨x, y⟩ = yᴴx satisfies',
      ro: 'Produsul scalar complex ⟨x, y⟩ = yᴴx satisface',
    },
    options: [
      { text: '⟨y, x⟩ = conj(⟨x, y⟩)', correct: true },
      { text: '⟨y, x⟩ = ⟨x, y⟩', correct: false },
      { text: '⟨y, x⟩ = −⟨x, y⟩', correct: false },
      { text: '⟨y, x⟩ = ‖x‖₂ · ‖y‖₂', correct: false },
    ],
    explanation: {
      en: '⟨y, x⟩ = xᴴy = Σᵢyᵢx̄ᵢ = conj(Σᵢxᵢȳᵢ) = conj(⟨x, y⟩). This is Hermitian symmetry.',
      ro: '⟨y, x⟩ = xᴴy = Σᵢyᵢx̄ᵢ = conj(Σᵢxᵢȳᵢ) = conj(⟨x, y⟩). Aceasta este simetria hermitiană.',
    },
  }];
  const mc10b = [{
    question: {
      en: 'Which pair (x, y) ∈ ℂⁿ × ℂⁿ with ⟨x, y⟩ ≠ 0 attains |⟨x, y⟩| = ‖x‖₂ · ‖y‖₂?',
      ro: 'Care pereche (x, y) ∈ ℂⁿ × ℂⁿ cu ⟨x, y⟩ ≠ 0 atinge |⟨x, y⟩| = ‖x‖₂ · ‖y‖₂?',
    },
    options: [
      { text: { en: 'x = y = e₁ (first standard basis vector)', ro: 'x = y = e₁ (primul vector din baza canonică)' }, correct: true },
      { text: { en: 'x = e₁, y = e₂', ro: 'x = e₁, y = e₂' }, correct: false },
      { text: { en: 'x = (1,1,…,1), y = e₁', ro: 'x = (1,1,…,1), y = e₁' }, correct: false },
      { text: { en: 'Any x, y ∈ ℂⁿ', ro: 'Orice x, y ∈ ℂⁿ' }, correct: false },
    ],
    explanation: {
      en: 'Equality in Cauchy–Schwarz needs x, y linearly dependent (x = αy). With x = y = e₁: ⟨x, y⟩ = 1 and ‖x‖₂‖y‖₂ = 1 · 1 = 1. x = e₁, y = e₂ gives ⟨x, y⟩ = 0 (excluded). x = (1,…,1), y = e₁ gives 1 vs √n — strict inequality.',
      ro: 'Egalitatea în Cauchy–Schwarz cere x, y liniar dependente (x = αy). Cu x = y = e₁: ⟨x, y⟩ = 1 și ‖x‖₂‖y‖₂ = 1 · 1 = 1. x = e₁, y = e₂ dă ⟨x, y⟩ = 0 (exclus). x = (1,…,1), y = e₁ dă 1 vs √n — inegalitate strictă.',
    },
  }];

  /* ─── P11 ─── */
  const mc11a = [{
    question: {
      en: 'Is the matrix A = [[1,1,0],[i,−i,0],[0,0,√2]] Hermitian?',
      ro: 'Matricea A = [[1,1,0],[i,−i,0],[0,0,√2]] este hermitiană?',
    },
    options: [
      { text: { en: 'No — entry (1,2) = 1 but (2,1) = i, so A ≠ Aᴴ', ro: 'Nu — elementul (1,2) = 1 dar (2,1) = i, deci A ≠ Aᴴ' }, correct: true },
      { text: { en: 'Yes — the diagonal is real', ro: 'Da — diagonala este reală' }, correct: false },
      { text: { en: 'Yes — det(A) is real', ro: 'Da — det(A) este real' }, correct: false },
      { text: { en: 'No — because √2 ∉ ℤ', ro: 'Nu — pentru că √2 ∉ ℤ' }, correct: false },
    ],
    explanation: {
      en: 'Hermitian requires aᵢⱼ = conj(aⱼᵢ). Here a₁₂ = 1 but conj(a₂₁) = conj(i) = −i. Since 1 ≠ −i, A is not Hermitian.',
      ro: 'Hermitian cere aᵢⱼ = conj(aⱼᵢ). Aici a₁₂ = 1 dar conj(a₂₁) = conj(i) = −i. Cum 1 ≠ −i, A nu este hermitiană.',
    },
  }];
  const mc11b = [{
    question: {
      en: 'Are the columns a₁ = (1, i, 0)ᵀ and a₂ = (1, −i, 0)ᵀ of A orthogonal in ℂ³?',
      ro: 'Coloanele a₁ = (1, i, 0)ᵀ și a₂ = (1, −i, 0)ᵀ ale lui A sunt ortogonale în ℂ³?',
    },
    options: [
      { text: { en: 'Yes — ⟨a₁, a₂⟩ = a₂ᴴa₁ = 1·1 + i·i + 0 = 1 + i² = 0', ro: 'Da — ⟨a₁, a₂⟩ = a₂ᴴa₁ = 1·1 + i·i + 0 = 1 + i² = 0' }, correct: true },
      { text: { en: 'No — they both start with 1', ro: 'Nu — amândouă încep cu 1' }, correct: false },
      { text: { en: 'Yes — because they are linearly independent', ro: 'Da — pentru că sunt liniar independente' }, correct: false },
      { text: { en: 'No — ⟨a₁, a₂⟩ = 2', ro: 'Nu — ⟨a₁, a₂⟩ = 2' }, correct: false },
    ],
    explanation: {
      en: 'a₂ᴴ = (1, i, 0) (row, entries conjugated). ⟨a₁, a₂⟩ = a₂ᴴ·a₁ = 1·1 + i·i + 0·0 = 1 − 1 = 0. (Note: linear independence does not imply orthogonality.)',
      ro: 'a₂ᴴ = (1, i, 0) (vector linie, componente conjugate). ⟨a₁, a₂⟩ = a₂ᴴ·a₁ = 1·1 + i·i + 0·0 = 1 − 1 = 0. (Observație: independența liniară nu implică ortogonalitatea.)',
    },
  }];
  const mc11c = [{
    question: {
      en: 'After normalizing, is U = [u₁  u₂  u₃] unitary?',
      ro: 'După normalizare, U = [u₁  u₂  u₃] este unitară?',
    },
    options: [
      { text: { en: 'Yes — columns are orthonormal, so UᴴU = I', ro: 'Da — coloanele sunt ortonormale, deci UᴴU = I' }, correct: true },
      { text: { en: 'Yes — det(U) = 1', ro: 'Da — det(U) = 1' }, correct: false },
      { text: { en: 'No — U contains i', ro: 'Nu — U conține i' }, correct: false },
      { text: { en: 'No — U is not Hermitian', ro: 'Nu — U nu este hermitiană' }, correct: false },
    ],
    explanation: {
      en: 'Unitary ⇔ columns orthonormal. P11(b) showed the columns of A are pairwise orthogonal; dividing by their ‖·‖₂ gives unit columns. Therefore UᴴU = I. Determinant = 1 is neither necessary (only |det U| = 1) nor sufficient, and unitary ≠ Hermitian.',
      ro: 'Unitară ⇔ coloanele ortonormale. P11(b) a arătat că coloanele lui A sunt ortogonale două câte două; împărțind la ‖·‖₂ obținem coloane unitare. Deci UᴴU = I. Determinant = 1 nu e nici necesar (doar |det U| = 1) nici suficient, iar unitară ≠ hermitiană.',
    },
  }];

  /* ─── P12 ─── */
  const mc12 = [{
    question: {
      en: 'If A is unitary, which identity for Aᴴ is most direct?',
      ro: 'Dacă A este unitară, care identitate pentru Aᴴ este cea mai directă?',
    },
    options: [
      { text: { en: 'AAᴴ = I (so Aᴴ is unitary)', ro: 'AAᴴ = I (deci Aᴴ este unitară)' }, correct: true },
      { text: { en: '(Aᴴ)ᴴ = Aᵀ', ro: '(Aᴴ)ᴴ = Aᵀ' }, correct: false },
      { text: { en: 'Aᴴ = A', ro: 'Aᴴ = A' }, correct: false },
      { text: { en: 'Aᴴ = A⁻¹ᵀ', ro: 'Aᴴ = A⁻¹ᵀ' }, correct: false },
    ],
    explanation: {
      en: 'From AᴴA = I we get Aᴴ = A⁻¹, so AAᴴ = A·A⁻¹ = I. Applying conjugate to AᴴA = I gives AᵀĀ = I and Ā·Aᵀ = I — these handle Aᵀ and Ā.',
      ro: 'Din AᴴA = I rezultă Aᴴ = A⁻¹, deci AAᴴ = A·A⁻¹ = I. Aplicând conjugata lui AᴴA = I obținem AᵀĀ = I și Ā·Aᵀ = I — acestea tratează Aᵀ și Ā.',
    },
  }];

  return (
    <>
      <p className="mb-4 text-sm opacity-80">
        {t(
          'Source: Linear Algebra & Optimization Seminar 1 — Vector and matrix norms, complex inner product, UAIC 2025–2026.',
          'Sursa: Seminar ALO 1 — Norme vectoriale și matriciale, produs scalar complex, UAIC 2025–2026.',
        )}
      </p>

      {/* ══════════ Problem 1 ══════════ */}
      <h3 className="text-lg font-bold mt-6 mb-2">
        {t('Problem 1: Norms of the ramp vector (1, 2, …, n)ᵀ', 'Problema 1: Normele vectorului rampă (1, 2, …, n)ᵀ')}
      </h3>
      <Box type="definition">
        <p className="text-sm">{t(
          'Let x = (1, 2, …, n)ᵀ ∈ ℕⁿ. Compute ‖x‖₁, ‖x‖₂, and ‖x‖∞.',
          'Fie x = (1, 2, …, n)ᵀ ∈ ℕⁿ. Calculați ‖x‖₁, ‖x‖₂ și ‖x‖∞.',
        )}</p>
      </Box>
      <MultipleChoice questions={mc1} />
      <Toggle
        question={t('Show all three norms', 'Arată cele trei norme')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">{t('All three norms', 'Toate cele trei norme')}</p>
            <ul className="text-sm list-disc ml-4">
              <li>‖x‖₁ = 1 + 2 + ⋯ + n = n(n+1)/2</li>
              <li>‖x‖₂ = √(1² + 2² + ⋯ + n²) = √(n(n+1)(2n+1)/6)</li>
              <li>‖x‖∞ = max{'{'}1, 2, …, n{'}'} = n</li>
            </ul>
            <Box type="theorem">
              <p className="text-sm">{t(
                'Sanity: ‖x‖∞ ≤ ‖x‖₂ ≤ ‖x‖₁ (always). Here n ≤ √(n(n+1)(2n+1)/6) ≤ n(n+1)/2, consistent for all n ≥ 1.',
                'Verificare: ‖x‖∞ ≤ ‖x‖₂ ≤ ‖x‖₁ (întotdeauna). Aici n ≤ √(n(n+1)(2n+1)/6) ≤ n(n+1)/2, consistent pentru orice n ≥ 1.',
              )}</p>
            </Box>
          </div>
        }
      />

      {/* ══════════ Problem 2 ══════════ */}
      <h3 className="text-lg font-bold mt-8 mb-2">
        {t('Problem 2: ‖·‖₁, ‖·‖₂, ‖·‖∞ for six vectors', 'Problema 2: ‖·‖₁, ‖·‖₂, ‖·‖∞ pentru șase vectori')}
      </h3>
      <Box type="definition">
        <p className="text-sm">{t(
          'Compute ‖·‖₁, ‖·‖₂, ‖·‖∞ for each of the following vectors (k ∈ ℕ* fixed):',
          'Calculați ‖·‖₁, ‖·‖₂, ‖·‖∞ pentru fiecare dintre vectorii (k ∈ ℕ* fixat):',
        )}</p>
        <ul className="text-sm list-disc ml-4 mt-1">
          <li>a. x = (−2, 2, 1)ᵀ</li>
          <li>b. x = (2, −1, 3, 4)ᵀ</li>
          <li>c. x = (3, −4, 0, 3/2)ᵀ</li>
          <li>d. x = (sin k, cos k, 2ᵏ)ᵀ</li>
          <li>e. x = (4/(k+1), 2/k², k²e⁻ᵏ)ᵀ</li>
          <li>f. x = ((2+k)/k, 1/√k, 0, −3)ᵀ</li>
        </ul>
      </Box>

      <p className="text-sm font-semibold mt-3 mb-1">{t('Quick check (a)', 'Verificare rapidă (a)')}</p>
      <MultipleChoice questions={mc2a} />

      <p className="text-sm font-semibold mt-3 mb-1">{t('Quick check (c)', 'Verificare rapidă (c)')}</p>
      <MultipleChoice questions={mc2c} />

      <Toggle
        question={t('Show all six answers', 'Arată toate cele șase răspunsuri')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">(a) x = (−2, 2, 1)ᵀ</p>
            <p className="text-sm mb-2">‖·‖₁ = 5, ‖·‖₂ = 3, ‖·‖∞ = 2.</p>

            <p className="font-bold mt-3 mb-1">(b) x = (2, −1, 3, 4)ᵀ</p>
            <p className="text-sm mb-2">‖·‖₁ = 10, ‖·‖₂ = √30, ‖·‖∞ = 4.</p>

            <p className="font-bold mt-3 mb-1">(c) x = (3, −4, 0, 3/2)ᵀ</p>
            <p className="text-sm mb-2">‖·‖₁ = 17/2, ‖·‖₂ = √109/2, ‖·‖∞ = 4.</p>

            <p className="font-bold mt-3 mb-1">(d) x = (sin k, cos k, 2ᵏ)ᵀ, k ∈ ℕ*</p>
            <p className="text-sm mb-2">
              ‖·‖₁ = |sin k| + |cos k| + 2ᵏ; ‖·‖₂ = √(sin²k + cos²k + 4ᵏ) = √(1 + 4ᵏ); ‖·‖∞ = 2ᵏ (since 2ᵏ ≥ 2 &gt; 1 ≥ |sin k|, |cos k|).
            </p>

            <p className="font-bold mt-3 mb-1">(e) x = (4/(k+1), 2/k², k²e⁻ᵏ)ᵀ</p>
            <p className="text-sm mb-2">
              ‖·‖₁ = 4/(k+1) + 2/k² + k²e⁻ᵏ; ‖·‖₂ = √(16/(k+1)² + 4/k⁴ + k⁴e⁻²ᵏ); ‖·‖∞ = max of the three (for k = 1: 2 vs 2 vs 1/e ⇒ 2; for k large all terms are small, but 4/(k+1) dominates eventually).
            </p>

            <p className="font-bold mt-3 mb-1">(f) x = ((2+k)/k, 1/√k, 0, −3)ᵀ</p>
            <p className="text-sm mb-2">
              ‖·‖₁ = (2+k)/k + 1/√k + 3; ‖·‖₂ = √((1 + 2/k)² + 1/k + 9); ‖·‖∞ = 3 for all k ≥ 1 (since (2+k)/k ≤ 3, reached only at k = 1).
            </p>

            <Box type="warning">
              <p className="text-sm">{t(
                'For parametric vectors (d)–(f), the ‖·‖∞ answer depends on k. State a closed form or a case split — do not drop one of the components.',
                'Pentru vectorii parametrici (d)–(f), răspunsul ‖·‖∞ depinde de k. Oferiți o formă închisă sau o analiză pe cazuri — nu aruncați una din componente.',
              )}</p>
            </Box>
          </div>
        }
      />

      {/* ══════════ Problem 3 ══════════ */}
      <h3 className="text-lg font-bold mt-8 mb-2">
        {t('Problem 3: ‖A‖∞ for six matrices', 'Problema 3: ‖A‖∞ pentru șase matrice')}
      </h3>
      <Box type="definition">
        <p className="text-sm">{t(
          '‖A‖∞ = max_i Σⱼ |aᵢⱼ| (max absolute row sum). Compute for:',
          '‖A‖∞ = max_i Σⱼ |aᵢⱼ| (maximul sumei absolute pe linii). Calculați pentru:',
        )}</p>
        <ul className="text-sm list-disc ml-4 mt-1">
          <li>a. A = [[10,15],[0,1]]</li>
          <li>b. A = [[10,0],[15,1]]</li>
          <li>c. A = [[0,−i],[i,0]]</li>
          <li>d. A = [[4,−1,7],[−1,4,0],[−7,0,4]]</li>
          <li>e. A = [[2,−1,0],[−1,2,−1],[0,−1,2]]</li>
          <li>f. A = [[1/3,−1/3,1/3],[−1/4,1/2,1/4],[2,−2,−1]]</li>
        </ul>
      </Box>
      <MultipleChoice questions={mc3} />
      <Toggle
        question={t('Show ‖A‖∞ for all six matrices', 'Arată ‖A‖∞ pentru toate cele șase matrice')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="text-sm mb-2">{t(
              'Row sums of absolute values, then take the max:',
              'Sumele absolute pe linii, apoi maximul:',
            )}</p>
            <ul className="text-sm list-disc ml-4">
              <li>a. rows 25, 1 ⇒ ‖A‖∞ = 25</li>
              <li>b. rows 10, 16 ⇒ ‖A‖∞ = 16</li>
              <li>c. rows 1, 1 ⇒ ‖A‖∞ = 1</li>
              <li>d. rows 12, 5, 11 ⇒ ‖A‖∞ = 12</li>
              <li>e. rows 3, 4, 3 ⇒ ‖A‖∞ = 4</li>
              <li>f. rows 1, 1, 5 ⇒ ‖A‖∞ = 5</li>
            </ul>
          </div>
        }
      />

      {/* ══════════ Problem 4 ══════════ */}
      <h3 className="text-lg font-bold mt-8 mb-2">
        {t('Problem 4: The column-sum matrix norm ‖·‖₁', 'Problema 4: Norma matricială pe coloane ‖·‖₁')}
      </h3>
      <Box type="definition">
        <p className="text-sm">{t(
          'Consider ‖A‖₁ = max_j Σᵢ |aᵢⱼ| on ℝⁿˣⁿ (or ℂⁿˣⁿ). (a) Show ‖·‖₁ is a matrix norm. (b) Compute ‖·‖₁ for the six matrices of Problem 3.',
          'Considerăm ‖A‖₁ = max_j Σᵢ |aᵢⱼ| pe ℝⁿˣⁿ (sau ℂⁿˣⁿ). (a) Arătați că ‖·‖₁ este o normă matricială. (b) Calculați ‖·‖₁ pentru cele șase matrice din Problema 3.',
        )}</p>
      </Box>
      <MultipleChoice questions={mc4} />
      <Toggle
        question={t('Show proof and all six ‖A‖₁ values', 'Arată demonstrația și cele șase valori ‖A‖₁')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">{t('(a) Proof that ‖·‖₁ is a matrix norm', '(a) Demonstrație că ‖·‖₁ este normă matricială')}</p>
            <ul className="text-sm list-disc ml-4 mb-2">
              <li>{t('Positivity: all |aᵢⱼ| ≥ 0; if ‖A‖₁ = 0 then every column sum is 0 ⇒ every |aᵢⱼ| = 0 ⇒ A = 0.', 'Pozitivitate: |aᵢⱼ| ≥ 0; dacă ‖A‖₁ = 0 atunci fiecare sumă de coloană e 0 ⇒ fiecare |aᵢⱼ| = 0 ⇒ A = 0.')}</li>
              <li>{t('Homogeneity: ‖αA‖₁ = max_j Σᵢ |α·aᵢⱼ| = |α| · max_j Σᵢ |aᵢⱼ| = |α| · ‖A‖₁.', 'Omogenitate: ‖αA‖₁ = max_j Σᵢ |α·aᵢⱼ| = |α| · max_j Σᵢ |aᵢⱼ| = |α| · ‖A‖₁.')}</li>
              <li>{t('Triangle: for any fixed j, Σᵢ |aᵢⱼ + bᵢⱼ| ≤ Σᵢ |aᵢⱼ| + Σᵢ |bᵢⱼ| ≤ ‖A‖₁ + ‖B‖₁. Taking max_j keeps the bound.', 'Triunghi: pentru orice j fix, Σᵢ |aᵢⱼ + bᵢⱼ| ≤ Σᵢ |aᵢⱼ| + Σᵢ |bᵢⱼ| ≤ ‖A‖₁ + ‖B‖₁. Maximul pe j păstrează inegalitatea.')}</li>
              <li>{t('Sub-multiplicativity: Σᵢ |(AB)ᵢⱼ| = Σᵢ |Σₖ aᵢₖ bₖⱼ| ≤ Σₖ |bₖⱼ| · (Σᵢ |aᵢₖ|) ≤ ‖A‖₁ · Σₖ |bₖⱼ|. Taking max_j gives ‖AB‖₁ ≤ ‖A‖₁ · ‖B‖₁.', 'Submultiplicativitate: Σᵢ |(AB)ᵢⱼ| = Σᵢ |Σₖ aᵢₖ bₖⱼ| ≤ Σₖ |bₖⱼ| · (Σᵢ |aᵢₖ|) ≤ ‖A‖₁ · Σₖ |bₖⱼ|. Maximul pe j dă ‖AB‖₁ ≤ ‖A‖₁ · ‖B‖₁.')}</li>
            </ul>

            <p className="font-bold mt-3 mb-1">{t('(b) Values (column sums)', '(b) Valori (sume pe coloane)')}</p>
            <ul className="text-sm list-disc ml-4">
              <li>a. cols 10, 16 ⇒ ‖A‖₁ = 16</li>
              <li>b. cols 25, 1 ⇒ ‖A‖₁ = 25</li>
              <li>c. cols 1, 1 ⇒ ‖A‖₁ = 1</li>
              <li>d. cols 12, 5, 11 ⇒ ‖A‖₁ = 12</li>
              <li>e. cols 3, 4, 3 ⇒ ‖A‖₁ = 4</li>
              <li>f. cols 31/12, 17/6, 19/12 ⇒ ‖A‖₁ = 17/6</li>
            </ul>
            <Box type="theorem">
              <p className="text-sm">{t(
                'Mnemonic: ‖A‖∞ = max absolute row sum; ‖A‖₁ = max absolute column sum. Row ↔ ∞, Column ↔ 1.',
                'Mnemonică: ‖A‖∞ = max sumă absolută pe linii; ‖A‖₁ = max sumă absolută pe coloane. Linie ↔ ∞, Coloană ↔ 1.',
              )}</p>
            </Box>
          </div>
        }
      />

      {/* ══════════ Problem 5 ══════════ */}
      <h3 className="text-lg font-bold mt-8 mb-2">
        {t('Problem 5: The sum-of-all-entries norm', 'Problema 5: Norma sumei tuturor elementelor')}
      </h3>
      <Box type="definition">
        <p className="text-sm">{t(
          'Show that ‖A‖⬚₁ = Σᵢ Σⱼ |aᵢⱼ|, A ∈ ℝⁿˣⁿ, is a matrix norm.',
          'Arătați că ‖A‖⬚₁ = Σᵢ Σⱼ |aᵢⱼ|, A ∈ ℝⁿˣⁿ, este o normă matricială.',
        )}</p>
      </Box>
      <MultipleChoice questions={mc5} />
      <Toggle
        question={t('Show proof', 'Arată demonstrația')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="text-sm mb-2">{t(
              'Positivity, homogeneity, triangle inequality follow directly from |·| on scalars (summing over i, j preserves each inequality).',
              'Pozitivitatea, omogenitatea, inegalitatea triunghiului urmează direct din |·| pe scalari (sumarea pe i, j păstrează inegalitatea).',
            )}</p>
            <p className="font-bold mt-3 mb-1">{t('Sub-multiplicativity', 'Submultiplicativitate')}</p>
            <p className="text-sm mb-2">
              ‖AB‖⬚₁ = Σᵢⱼ |Σₖ aᵢₖ bₖⱼ| ≤ Σᵢⱼₖ |aᵢₖ||bₖⱼ| = Σₖ (Σᵢ |aᵢₖ|)(Σⱼ |bₖⱼ|) ≤ (Σᵢₖ |aᵢₖ|)(Σₖⱼ |bₖⱼ|) = ‖A‖⬚₁ · ‖B‖⬚₁.
            </p>
            <Box type="warning">
              <p className="text-sm">{t(
                'The last inequality uses (Σₖ αₖβₖ) ≤ (Σₖ αₖ)(Σₖ βₖ) for αₖ, βₖ ≥ 0. It is a loose bound but sufficient here.',
                'Ultima inegalitate folosește (Σₖ αₖβₖ) ≤ (Σₖ αₖ)(Σₖ βₖ) pentru αₖ, βₖ ≥ 0. Este o margine largă, dar suficientă.',
              )}</p>
            </Box>
          </div>
        }
      />

      {/* ══════════ Problem 6 ══════════ */}
      <h3 className="text-lg font-bold mt-8 mb-2">
        {t('Problem 6: The Frobenius norm', 'Problema 6: Norma Frobenius')}
      </h3>
      <Box type="definition">
        <p className="text-sm">{t(
          '‖A‖_F = (Σᵢⱼ |aᵢⱼ|²)^(1/2). Show ‖·‖_F is a matrix norm.',
          '‖A‖_F = (Σᵢⱼ |aᵢⱼ|²)^(1/2). Arătați că ‖·‖_F este o normă matricială.',
        )}</p>
      </Box>
      <MultipleChoice questions={mc6} />
      <Toggle
        question={t('Show proof', 'Arată demonstrația')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="text-sm mb-2">{t(
              'Treat A as a vector in ℝⁿ² and apply the Euclidean vector norm:',
              'Tratăm A ca vector în ℝⁿ² și aplicăm norma vectorială euclidiană:',
            )}</p>
            <ul className="text-sm list-disc ml-4 mb-2">
              <li>{t('Positivity and homogeneity: inherited from Euclidean norm.', 'Pozitivitate și omogenitate: moștenite de la norma euclidiană.')}</li>
              <li>{t('Triangle: ‖A + B‖_F = ‖vec(A) + vec(B)‖₂ ≤ ‖vec(A)‖₂ + ‖vec(B)‖₂ = ‖A‖_F + ‖B‖_F.', 'Triunghi: ‖A + B‖_F = ‖vec(A) + vec(B)‖₂ ≤ ‖vec(A)‖₂ + ‖vec(B)‖₂ = ‖A‖_F + ‖B‖_F.')}</li>
            </ul>
            <p className="font-bold mt-3 mb-1">{t('Sub-multiplicativity (Cauchy–Schwarz)', 'Submultiplicativitate (Cauchy–Schwarz)')}</p>
            <p className="text-sm mb-2">
              ‖AB‖_F² = Σᵢⱼ |Σₖ aᵢₖ bₖⱼ|² ≤ Σᵢⱼ (Σₖ |aᵢₖ|²)(Σₖ |bₖⱼ|²) = (Σᵢₖ |aᵢₖ|²)(Σₖⱼ |bₖⱼ|²) = ‖A‖_F² · ‖B‖_F².
            </p>
            <Box type="theorem">
              <p className="text-sm">{t(
                '‖A‖_F is the ℓ² norm of A viewed as a long vector, which is why it inherits all three linear-space properties automatically. Sub-multiplicativity is the only entry-level bound that uses matrix multiplication.',
                '‖A‖_F este norma ℓ² a lui A privit ca vector lung, de aceea moștenește automat cele trei proprietăți de spațiu normat. Submultiplicativitatea este singura margine la nivel de element care folosește produsul de matrice.',
              )}</p>
            </Box>
          </div>
        }
      />

      {/* ══════════ Problem 7 ══════════ */}
      <h3 className="text-lg font-bold mt-8 mb-2">
        {t('Problem 7: ‖x*‖₂ = ‖x‖₂ for x ∈ ℂⁿ', 'Problema 7: ‖x*‖₂ = ‖x‖₂ pentru x ∈ ℂⁿ')}
      </h3>
      <Box type="definition">
        <p className="text-sm">{t(
          'For x ∈ ℂⁿ, show that ‖x*‖₂ = ‖x‖₂, where x* is the conjugate transpose of x.',
          'Pentru x ∈ ℂⁿ, arătați că ‖x*‖₂ = ‖x‖₂, unde x* este transpusa conjugată a lui x.',
        )}</p>
      </Box>
      <MultipleChoice questions={mc7} />
      <Toggle
        question={t('Show proof', 'Arată demonstrația')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="text-sm mb-2">
              {t(
                'x* is the row vector (x̄₁, x̄₂, …, x̄ₙ). Its 2-norm is the square root of the sum of squared moduli:',
                'x* este vectorul linie (x̄₁, x̄₂, …, x̄ₙ). Norma 2 este rădăcina pătrată a sumei modulelor la pătrat:',
              )}
            </p>
            <p className="text-sm mb-2">
              ‖x*‖₂² = Σᵢ |x̄ᵢ|² = Σᵢ |xᵢ|² = ‖x‖₂²,
            </p>
            <p className="text-sm mb-2">
              {t(
                'since |z̄| = |z| for every z ∈ ℂ. Taking square roots yields ‖x*‖₂ = ‖x‖₂.',
                'deoarece |z̄| = |z| pentru orice z ∈ ℂ. Extragând rădăcina obținem ‖x*‖₂ = ‖x‖₂.',
              )}
            </p>
          </div>
        }
      />

      {/* ══════════ Problem 8 ══════════ */}
      <h3 className="text-lg font-bold mt-8 mb-2">
        {t('Problem 8: All norms of the constant 1−i vector', 'Problema 8: Toate normele vectorului constant 1−i')}
      </h3>
      <Box type="definition">
        <p className="text-sm">{t(
          'Let x ∈ ℂⁿ have every entry equal to 1 − i. Compute ‖x‖₁, ‖x*‖₁, ‖x‖∞, ‖x*‖∞, ‖x‖₂, ‖x*‖₂.',
          'Fie x ∈ ℂⁿ cu toate componentele egale cu 1 − i. Calculați ‖x‖₁, ‖x*‖₁, ‖x‖∞, ‖x*‖∞, ‖x‖₂, ‖x*‖₂.',
        )}</p>
      </Box>
      <MultipleChoice questions={mc8} />
      <Toggle
        question={t('Show all six values', 'Arată toate cele șase valori')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="text-sm mb-2">
              {t('Key fact: |1 − i| = √(1 + 1) = √2.', 'Fapt cheie: |1 − i| = √(1 + 1) = √2.')}
            </p>
            <ul className="text-sm list-disc ml-4">
              <li>‖x‖₁ = n · √2</li>
              <li>‖x*‖₁ = n · √2 (|1 + i| = √2 as well)</li>
              <li>‖x‖∞ = √2</li>
              <li>‖x*‖∞ = √2</li>
              <li>‖x‖₂ = √(n · 2) = √(2n)</li>
              <li>‖x*‖₂ = √(2n)</li>
            </ul>
            <Box type="theorem">
              <p className="text-sm">{t(
                'This example is a minimal witness of Problem 7: entries of x* are conjugates of entries of x, and every p-norm depends only on the moduli. So ‖x*‖_p = ‖x‖_p for every p.',
                'Acest exemplu este un martor minimal pentru Problema 7: componentele lui x* sunt conjugatele componentelor lui x, iar orice normă p depinde doar de module. Deci ‖x*‖_p = ‖x‖_p pentru orice p.',
              )}</p>
            </Box>
          </div>
        }
      />

      {/* ══════════ Problem 9 ══════════ */}
      <h3 className="text-lg font-bold mt-8 mb-2">
        {t('Problem 9: The inequality ‖x‖₂ ≤ √(‖x‖₁ · ‖x‖∞)', 'Problema 9: Inegalitatea ‖x‖₂ ≤ √(‖x‖₁ · ‖x‖∞)')}
      </h3>
      <Box type="definition">
        <p className="text-sm">{t(
          'For x ∈ ℂⁿ, show that ‖x‖₂ ≤ √(‖x‖₁ · ‖x‖∞).',
          'Pentru x ∈ ℂⁿ, arătați că ‖x‖₂ ≤ √(‖x‖₁ · ‖x‖∞).',
        )}</p>
      </Box>
      <MultipleChoice questions={mc9} />
      <Toggle
        question={t('Show proof', 'Arată demonstrația')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="text-sm mb-2">
              {t(
                'Bound each squared term by |xᵢ| times the maximum modulus, then sum:',
                'Majorăm fiecare termen pătrat cu |xᵢ| înmulțit cu modulul maxim, apoi sumăm:',
              )}
            </p>
            <p className="text-sm mb-2">
              ‖x‖₂² = Σᵢ |xᵢ|² = Σᵢ |xᵢ| · |xᵢ| ≤ Σᵢ |xᵢ| · max_k |x_k| = ‖x‖∞ · ‖x‖₁.
            </p>
            <p className="text-sm mb-2">
              {t('Taking square roots gives ‖x‖₂ ≤ √(‖x‖₁ · ‖x‖∞).', 'Extragând rădăcina obținem ‖x‖₂ ≤ √(‖x‖₁ · ‖x‖∞).')}
            </p>
            <Box type="theorem">
              <p className="text-sm">{t(
                'Equality holds when x is a non-zero scalar multiple of e_k (one nonzero entry), or more generally when all nonzero |xᵢ| are equal.',
                'Egalitatea este atinsă când x este un multiplu scalar nenul al lui e_k (o singură componentă nenulă), sau mai general când toate |xᵢ| nenule sunt egale.',
              )}</p>
            </Box>
          </div>
        }
      />

      {/* ══════════ Problem 10 ══════════ */}
      <h3 className="text-lg font-bold mt-8 mb-2">
        {t('Problem 10: The complex inner product', 'Problema 10: Produsul scalar complex')}
      </h3>
      <Box type="definition">
        <p className="text-sm">{t(
          'Define ⟨x, y⟩ = yᴴx = x₁ȳ₁ + ⋯ + xₙȳₙ for x, y ∈ ℂⁿ.',
          'Definim ⟨x, y⟩ = yᴴx = x₁ȳ₁ + ⋯ + xₙȳₙ pentru x, y ∈ ℂⁿ.',
        )}</p>
        <ul className="text-sm list-disc ml-4 mt-1">
          <li>(a) {t('Show ⟨y, x⟩ = conj(⟨x, y⟩).', 'Arătați că ⟨y, x⟩ = conj(⟨x, y⟩).')}</li>
          <li>(b) {t('Give examples with ⟨x, y⟩ ≠ 0 for which |⟨x, y⟩| = ‖x‖₁ · ‖y‖∞, and for which |⟨x, y⟩| = ‖x‖₂ · ‖y‖₂.', 'Dați exemple cu ⟨x, y⟩ ≠ 0 pentru care |⟨x, y⟩| = ‖x‖₁ · ‖y‖∞, respectiv |⟨x, y⟩| = ‖x‖₂ · ‖y‖₂.')}</li>
        </ul>
      </Box>

      <p className="text-sm font-semibold mt-3 mb-1">{t('Part (a): Hermitian symmetry', 'Partea (a): Simetrie hermitiană')}</p>
      <MultipleChoice questions={mc10a} />

      <p className="text-sm font-semibold mt-3 mb-1">{t('Part (b): Cauchy–Schwarz equality', 'Partea (b): Egalitate în Cauchy–Schwarz')}</p>
      <MultipleChoice questions={mc10b} />

      <Toggle
        question={t('Show proof and worked examples', 'Arată demonstrația și exemplele')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">{t('(a) Hermitian symmetry', '(a) Simetrie hermitiană')}</p>
            <p className="text-sm mb-2">
              ⟨y, x⟩ = xᴴy = Σᵢ yᵢ x̄ᵢ = conj(Σᵢ xᵢ ȳᵢ) = conj(⟨x, y⟩).
            </p>

            <p className="font-bold mt-3 mb-1">{t('(b-i) Example with |⟨x, y⟩| = ‖x‖₁ · ‖y‖∞', '(b-i) Exemplu cu |⟨x, y⟩| = ‖x‖₁ · ‖y‖∞')}</p>
            <p className="text-sm mb-2">
              x = e₁ = (1, 0, …, 0)ᵀ, y = (1, 1, …, 1)ᵀ. Then ⟨x, y⟩ = 1, ‖x‖₁ = 1, ‖y‖∞ = 1; |⟨x, y⟩| = 1 = 1 · 1.
            </p>
            <p className="font-bold mt-3 mb-1">{t('(b-ii) Example with |⟨x, y⟩| = ‖x‖₂ · ‖y‖₂', '(b-ii) Exemplu cu |⟨x, y⟩| = ‖x‖₂ · ‖y‖₂')}</p>
            <p className="text-sm mb-2">
              x = y = e₁. Then ⟨x, y⟩ = 1, ‖x‖₂ = ‖y‖₂ = 1; equality. More generally, any x = αy achieves Cauchy–Schwarz equality.
            </p>
            <Box type="warning">
              <p className="text-sm">{t(
                'The general Cauchy–Schwarz bound |⟨x, y⟩| ≤ ‖x‖₂ · ‖y‖₂ becomes equality iff {x, y} is linearly dependent.',
                'Inegalitatea generală Cauchy–Schwarz |⟨x, y⟩| ≤ ‖x‖₂ · ‖y‖₂ devine egalitate dacă și numai dacă {x, y} este liniar dependent.',
              )}</p>
            </Box>
          </div>
        }
      />

      {/* ══════════ Problem 11 ══════════ */}
      <h3 className="text-lg font-bold mt-8 mb-2">
        {t('Problem 11: A 3×3 complex matrix — Hermitian? Orthogonal columns? Unitary normalization?', 'Problema 11: O matrice complexă 3×3 — hermitiană? coloane ortogonale? normalizare unitară?')}
      </h3>
      <Box type="definition">
        <p className="text-sm">{t(
          'Let A ∈ ℂ³ˣ³ with rows (1, 1, 0), (i, −i, 0), (0, 0, √2). (a) Is A Hermitian? (b) Are its columns pairwise orthogonal? (c) Normalize the columns to get u₁, u₂, u₃ and form U = [u₁  u₂  u₃]. Is U unitary?',
          'Fie A ∈ ℂ³ˣ³ cu liniile (1, 1, 0), (i, −i, 0), (0, 0, √2). (a) Este A hermitiană? (b) Coloanele sale sunt ortogonale două câte două? (c) Normalizați coloanele în u₁, u₂, u₃ și formați U = [u₁  u₂  u₃]. Este U unitară?',
        )}</p>
      </Box>

      <p className="text-sm font-semibold mt-3 mb-1">{t('Part (a): Hermitian?', 'Partea (a): Hermitiană?')}</p>
      <MultipleChoice questions={mc11a} />

      <p className="text-sm font-semibold mt-3 mb-1">{t('Part (b): Orthogonal columns?', 'Partea (b): Coloane ortogonale?')}</p>
      <MultipleChoice questions={mc11b} />

      <p className="text-sm font-semibold mt-3 mb-1">{t('Part (c): Is U unitary?', 'Partea (c): U este unitară?')}</p>
      <MultipleChoice questions={mc11c} />

      <Toggle
        question={t('Show full working', 'Arată calculul complet')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">{t('(a) Hermitian test', '(a) Test hermitian')}</p>
            <p className="text-sm mb-2">{t(
              'Check aᵢⱼ = conj(aⱼᵢ) entry by entry. Here a₁₂ = 1 and conj(a₂₁) = conj(i) = −i. Since 1 ≠ −i, A is not Hermitian.',
              'Verificăm aᵢⱼ = conj(aⱼᵢ) element cu element. Aici a₁₂ = 1 și conj(a₂₁) = conj(i) = −i. Cum 1 ≠ −i, A nu este hermitiană.',
            )}</p>

            <p className="font-bold mt-3 mb-1">{t('(b) Orthogonality of columns', '(b) Ortogonalitatea coloanelor')}</p>
            <p className="text-sm mb-2">
              a₁ = (1, i, 0)ᵀ, a₂ = (1, −i, 0)ᵀ, a₃ = (0, 0, √2)ᵀ.
            </p>
            <ul className="text-sm list-disc ml-4 mb-2">
              <li>⟨a₁, a₂⟩ = a₂ᴴ a₁ = (1, i, 0) · (1, i, 0)ᵀ = 1 + i² + 0 = 0</li>
              <li>⟨a₁, a₃⟩ = a₃ᴴ a₁ = (0, 0, √2) · (1, i, 0)ᵀ = 0</li>
              <li>⟨a₂, a₃⟩ = a₃ᴴ a₂ = (0, 0, √2) · (1, −i, 0)ᵀ = 0</li>
            </ul>

            <p className="font-bold mt-3 mb-1">{t('(c) Normalization', '(c) Normalizare')}</p>
            <p className="text-sm mb-2">
              ‖a₁‖₂ = ‖a₂‖₂ = √2; ‖a₃‖₂ = √2. Hence
              u₁ = (1/√2, i/√2, 0)ᵀ, u₂ = (1/√2, −i/√2, 0)ᵀ, u₃ = (0, 0, 1)ᵀ.
            </p>
            <p className="text-sm mb-2">
              U = [u₁  u₂  u₃]. Because the uₖ are orthonormal (unit-length by construction, pairwise orthogonal by (b)), UᴴU = I, so U is unitary.
            </p>
            <Box type="theorem">
              <p className="text-sm">{t(
                'Unitary matrices preserve ‖·‖₂: ‖Ux‖₂ = ‖x‖₂. They are the complex analogue of orthogonal matrices in ℝⁿˣⁿ.',
                'Matricele unitare conservă ‖·‖₂: ‖Ux‖₂ = ‖x‖₂. Sunt analogul complex al matricelor ortogonale din ℝⁿˣⁿ.',
              )}</p>
            </Box>
          </div>
        }
      />

      {/* ══════════ Problem 12 ══════════ */}
      <h3 className="text-lg font-bold mt-8 mb-2">
        {t('Problem 12: If A is unitary, so are Aᴴ, Aᵀ, Ā', 'Problema 12: Dacă A este unitară, atunci Aᴴ, Aᵀ, Ā sunt unitare')}
      </h3>
      <Box type="definition">
        <p className="text-sm">{t(
          'Let A ∈ M₂(ℂ). Show that if A is unitary, then Aᴴ, Aᵀ, and Ā are unitary.',
          'Fie A ∈ M₂(ℂ). Arătați că dacă A este unitară, atunci Aᴴ, Aᵀ și Ā sunt unitare.',
        )}</p>
      </Box>
      <MultipleChoice questions={mc12} />
      <Toggle
        question={t('Show proof for all three', 'Arată demonstrația pentru toate trei')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="text-sm mb-2">
              {t(
                'Hypothesis: AᴴA = I ⇔ Aᴴ = A⁻¹ ⇔ AAᴴ = I.',
                'Ipoteza: AᴴA = I ⇔ Aᴴ = A⁻¹ ⇔ AAᴴ = I.',
              )}
            </p>

            <p className="font-bold mt-3 mb-1">(Aᴴ)</p>
            <p className="text-sm mb-2">
              {t('(Aᴴ)ᴴ · Aᴴ = A · Aᴴ = I, so Aᴴ is unitary.', '(Aᴴ)ᴴ · Aᴴ = A · Aᴴ = I, deci Aᴴ este unitară.')}
            </p>

            <p className="font-bold mt-3 mb-1">(Aᵀ)</p>
            <p className="text-sm mb-2">
              {t(
                'Take the complex conjugate of AᴴA = I: (Aᴴ)ᵀ · A = conj(AᴴA) = Ā · A. Wait — a cleaner route: conj(AAᴴ) = ĀAᵀ = I, so ĀAᵀ = I. Therefore (Aᵀ)ᴴ · Aᵀ = (conj(A))·Aᵀ is not what we need; use (Aᵀ)ᴴ = Ā, so (Aᵀ)ᴴ · Aᵀ = Ā · Aᵀ = I. Hence Aᵀ is unitary.',
                'Luăm conjugata lui AAᴴ = I: ĀAᵀ = I. Cum (Aᵀ)ᴴ = Ā, rezultă (Aᵀ)ᴴ · Aᵀ = Ā · Aᵀ = I. Deci Aᵀ este unitară.',
              )}
            </p>

            <p className="font-bold mt-3 mb-1">(Ā)</p>
            <p className="text-sm mb-2">
              {t(
                '(Ā)ᴴ = Aᵀ. Taking conj of AᴴA = I gives AᵀĀ = I, so (Ā)ᴴ · Ā = Aᵀ · Ā = I. Hence Ā is unitary.',
                '(Ā)ᴴ = Aᵀ. Conjugând AᴴA = I obținem AᵀĀ = I, deci (Ā)ᴴ · Ā = Aᵀ · Ā = I. Deci Ā este unitară.',
              )}
            </p>

            <Box type="theorem">
              <p className="text-sm">{t(
                'The set of unitary matrices is closed under Hermitian-conjugate, transpose, and complex conjugate. It forms a group under matrix multiplication (the unitary group U(n)).',
                'Mulțimea matricelor unitare este închisă la conjugata hermitiană, transpusă și conjugat complex. Formează un grup sub înmulțire matricială (grupul unitar U(n)).',
              )}</p>
            </Box>
          </div>
        }
      />
    </>
  );
}
