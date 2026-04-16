import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Toggle } from '../../../components/ui';
import MultipleChoice from '../../../components/ui/MultipleChoice';

export default function Seminar02() {
  const { t } = useApp();

  /* ─── P1: Triangular systems ─── */
  const mc1a = [{
    question: { en: '(a) The solution of the lower-triangular system in part (a) is', ro: '(a) Soluția sistemului triunghiular inferior din (a) este' },
    options: [
      { text: 'x = (0, 1, 1)ᵀ', correct: true },
      { text: 'x = (0, 2, 3.5)ᵀ', correct: false, feedback: { en: 'You copied b into x without dividing by the diagonal entries — forward substitution divides by Lᵢᵢ at each step.', ro: 'Ai copiat b în x fără să împarți la elementele diagonale — substituția directă împarte cu Lᵢᵢ la fiecare pas.' } },
      { text: 'x = (1, 1, 1)ᵀ', correct: false, feedback: { en: 'That would be the solution if the RHS started with b₁ = 1; here b₁ = 0 forces x₁ = 0.', ro: 'Aceea ar fi soluția dacă primul element al lui b era 1; aici b₁ = 0 forțează x₁ = 0.' } },
      { text: 'x = (0, 1, 0)ᵀ', correct: false, feedback: { en: 'Off on x₃: 0 + 1 + 2.5·x₃ = 3.5 ⇒ x₃ = 1, not 0.', ro: 'Greșit pe x₃: 0 + 1 + 2.5·x₃ = 3.5 ⇒ x₃ = 1, nu 0.' } },
    ],
    explanation: {
      en: 'Forward substitution: x₁ = 0, then 1.5·0 + 2x₂ = 2 ⇒ x₂ = 1, then 0 + 1 + 2.5x₃ = 3.5 ⇒ x₃ = 1.',
      ro: 'Substituție directă: x₁ = 0, apoi 1.5·0 + 2x₂ = 2 ⇒ x₂ = 1, apoi 0 + 1 + 2.5x₃ = 3.5 ⇒ x₃ = 1.',
    },
  }];

  const mc1dir = [{
    question: {
      en: 'For a lower-triangular system L·x = b, the natural solution procedure is',
      ro: 'Pentru un sistem triunghiular inferior L·x = b, procedura naturală de rezolvare este',
    },
    options: [
      { text: { en: 'Forward substitution — solve x₁ first, then x₂, …, xₙ', ro: 'Substituție directă — rezolvă x₁ primul, apoi x₂, …, xₙ' }, correct: true },
      { text: { en: 'Back substitution — solve xₙ first, then xₙ₋₁, …, x₁', ro: 'Substituție inversă — rezolvă xₙ primul, apoi xₙ₋₁, …, x₁' }, correct: false, feedback: { en: 'That is the procedure for *upper* triangular U·x = b. For L (lower), the last row has all n unknowns, so solving xₙ first is blocked.', ro: 'Aceea e procedura pentru U·x = b (superior). Pentru L (inferior), ultima linie conține toate n necunoscutele, deci xₙ nu se poate calcula primul.' } },
      { text: { en: 'Compute L⁻¹ explicitly, then x = L⁻¹b', ro: 'Calculează L⁻¹ explicit, apoi x = L⁻¹b' }, correct: false, feedback: { en: 'Correct result but wasteful: computing L⁻¹ costs Θ(n³), while forward substitution solves L·x = b directly in Θ(n²).', ro: 'Rezultat corect dar risipitor: calcularea L⁻¹ costă Θ(n³), pe când substituția directă rezolvă L·x = b în Θ(n²).' } },
      { text: { en: 'Cramer’s rule', ro: 'Regula lui Cramer' }, correct: false, feedback: { en: 'Cramer computes each xᵢ via an n×n determinant — Θ(n·n!) naively or Θ(n⁴) with smart expansion. Forward substitution is Θ(n²).', ro: 'Cramer calculează fiecare xᵢ printr-un determinant n×n — Θ(n·n!) naiv sau Θ(n⁴) cu expansiune inteligentă. Substituția directă e Θ(n²).' } },
    ],
    explanation: {
      en: 'In L (lower triangular), row i has unknowns x₁, …, xᵢ only, so we solve top-down. For an upper-triangular U we solve bottom-up (back substitution). Both cost Θ(n²).',
      ro: 'În L (triunghiulară inferior), linia i are doar necunoscutele x₁, …, xᵢ, deci rezolvăm de sus în jos. Pentru U (triunghiulară superior) rezolvăm de jos în sus. Ambele costă Θ(n²).',
    },
  }];

  /* ─── P2: Inverses ─── */
  const mc2b = [{
    question: {
      en: 'For the n × n cumulative-sum matrix A with aᵢⱼ = 1 if i ≥ j and 0 otherwise, the inverse A⁻¹ is',
      ro: 'Pentru matricea sumei cumulative n × n cu aᵢⱼ = 1 dacă i ≥ j și 0 altfel, inversa A⁻¹ este',
    },
    options: [
      { text: { en: 'bidiagonal: 1 on the diagonal, −1 on the first sub-diagonal, 0 elsewhere', ro: 'bidiagonală: 1 pe diagonală, −1 pe prima sub-diagonală, 0 în rest' }, correct: true },
      { text: { en: 'A itself (A⁻¹ = A)', ro: 'A însăși (A⁻¹ = A)' }, correct: false, feedback: { en: 'A² ≠ I in general — A² is the "sum of first i twice over" operator, not the identity. Cumulative-sum is not involutive.', ro: 'A² ≠ I în general — A² e operatorul "sumă a primilor i de două ori", nu identitatea. Suma cumulativă nu e involutivă.' } },
      { text: { en: 'Aᵀ', ro: 'Aᵀ' }, correct: false, feedback: { en: 'Aᵀ is upper-triangular (cumulative *suffix* sum); for A·Aᵀ = I you\'d need A orthogonal, which it is not.', ro: 'Aᵀ e triunghiulară superior (sumă cumulativă *sufix*); pentru A·Aᵀ = I ar trebui A ortogonală, ceea ce nu e.' } },
      { text: { en: 'all entries equal to 1/n', ro: 'toate elementele egale cu 1/n' }, correct: false, feedback: { en: 'The average/uniform matrix has rank 1, not n — it cannot be A\'s inverse since A has full rank.', ro: 'Matricea uniformă (medie) are rangul 1, nu n — nu poate fi inversa lui A, care are rang complet.' } },
    ],
    explanation: {
      en: 'A acts as a cumulative sum: (Ax)ᵢ = x₁ + ⋯ + xᵢ. The inverse is the differencing operator: (A⁻¹y)ᵢ = yᵢ − yᵢ₋₁ (with y₀ = 0). Thus A⁻¹ has 1 on the diagonal and −1 on the first sub-diagonal.',
      ro: 'A acționează ca sumă cumulativă: (Ax)ᵢ = x₁ + ⋯ + xᵢ. Inversa este operatorul de diferențiere: (A⁻¹y)ᵢ = yᵢ − yᵢ₋₁ (cu y₀ = 0). Astfel A⁻¹ are 1 pe diagonală și −1 pe prima sub-diagonală.',
    },
  }];

  /* ─── P3: Linear dependence + cosines ─── */
  const mc3dep = [{
    question: {
      en: 'The vectors x¹=(1,1,0)ᵀ, x²=(0,1,1)ᵀ, x³=(1,2,1)ᵀ are',
      ro: 'Vectorii x¹=(1,1,0)ᵀ, x²=(0,1,1)ᵀ, x³=(1,2,1)ᵀ sunt',
    },
    options: [
      { text: { en: 'linearly dependent — x³ = x¹ + x²', ro: 'liniar dependenți — x³ = x¹ + x²' }, correct: true },
      { text: { en: 'linearly independent — det([x¹|x²|x³]) ≠ 0', ro: 'liniar independenți — det([x¹|x²|x³]) ≠ 0' }, correct: false, feedback: { en: 'Actually det = 0: expand and you\'ll get x³ = x¹ + x², which forces a dependent set. A zero determinant ⇔ dependence.', ro: 'De fapt det = 0: dezvoltă și vei obține x³ = x¹ + x², ceea ce forțează dependența. Determinant nul ⇔ dependență.' } },
      { text: { en: 'orthogonal', ro: 'ortogonali' }, correct: false, feedback: { en: '⟨x¹, x²⟩ = 0 + 1 + 0 = 1 ≠ 0, so not pairwise orthogonal. Also orthogonal ⇒ independent, not dependent.', ro: '⟨x¹, x²⟩ = 0 + 1 + 0 = 1 ≠ 0, deci nu sunt ortogonali. Și ortogonal ⇒ independent, nu dependent.' } },
      { text: { en: 'a basis for ℝ³', ro: 'o bază a lui ℝ³' }, correct: false, feedback: { en: 'A basis requires 3 *independent* vectors in ℝ³; these are dependent, so they span only a 2-D subspace.', ro: 'O bază cere 3 vectori *independenți* în ℝ³; aceștia sunt dependenți, generează doar un subspațiu 2-D.' } },
    ],
    explanation: {
      en: 'Check componentwise: (1+0, 1+1, 0+1) = (1, 2, 1) = x³. Since x³ is a combination of x¹, x², they are dependent — so no basis and no span of ℝ³.',
      ro: 'Verificare pe componente: (1+0, 1+1, 0+1) = (1, 2, 1) = x³. Cum x³ este combinație de x¹, x², sunt dependenți — deci nu formează bază și nu generează ℝ³.',
    },
  }];

  const mc3modify = [{
    question: {
      en: 'Replacing the second component of x³ by α gives a linearly independent triple iff',
      ro: 'Înlocuind componenta a doua a lui x³ cu α, tripletul devine liniar independent dacă și numai dacă',
    },
    options: [
      { text: 'α ≠ 2', correct: true },
      { text: 'α > 0', correct: false, feedback: { en: 'α = 1 > 0 still gives (1,1,1), which is independent — so the condition "positive" is too restrictive; α < 0 or α = 0 also work. The one value that *fails* is α = 2.', ro: 'α = 1 > 0 dă tot (1,1,1), independent — deci "pozitiv" e prea restrictiv; α < 0 sau α = 0 merg și ele. Singura valoare care *eșuează* e α = 2.' } },
      { text: 'α = 0', correct: false, feedback: { en: 'α = 0 makes them independent, but so does any α ≠ 2. The question asks for the *characterising* condition.', ro: 'α = 0 îi face independenți, dar la fel orice α ≠ 2. Întrebarea cere condiția *caracterizantă*.' } },
      { text: { en: 'any α ∈ ℝ', ro: 'orice α ∈ ℝ' }, correct: false, feedback: { en: 'Misses the exclusion: α = 2 recovers the original (dependent) case. Independence holds only for α ≠ 2.', ro: 'Omite excluderea: α = 2 recuperează cazul original (dependent). Independența are loc doar pentru α ≠ 2.' } },
    ],
    explanation: {
      en: 'Dependence requires a·x¹ + b·x² = x³ for some (a,b). Matching components: a = 1, b = 1, a + b = α ⇒ α = 2. So α ≠ 2 ⇒ independence.',
      ro: 'Dependența cere a·x¹ + b·x² = x³ pentru anumiți (a,b). Egalând componente: a = 1, b = 1, a + b = α ⇒ α = 2. Deci α ≠ 2 ⇒ independență.',
    },
  }];

  const mc3cos = [{
    question: {
      en: 'cos(x¹, x²) for x¹=(1,1,0)ᵀ and x²=(0,1,1)ᵀ equals',
      ro: 'cos(x¹, x²) pentru x¹=(1,1,0)ᵀ și x²=(0,1,1)ᵀ este',
    },
    options: [
      { text: '1/2', correct: true },
      { text: '0', correct: false, feedback: { en: '⟨x¹, x²⟩ = 1 ≠ 0, so cosine is nonzero. The vectors are not orthogonal.', ro: '⟨x¹, x²⟩ = 1 ≠ 0, deci cosinusul e nenul. Vectorii nu sunt ortogonali.' } },
      { text: '1/√2', correct: false, feedback: { en: 'You may have divided ⟨x¹, x²⟩ = 1 by only one √2 instead of (√2·√2) = 2. cos(x, y) normalizes by the *product* of norms.', ro: 'Poate ai împărțit ⟨x¹, x²⟩ = 1 doar la √2 în loc de (√2·√2) = 2. cos(x, y) normalizează cu *produsul* normelor.' } },
      { text: '1', correct: false, feedback: { en: 'cos = 1 would mean x¹ = α·x² for some α > 0; here x¹ = (1,1,0) ≠ α·(0,1,1) for any α.', ro: 'cos = 1 ar însemna x¹ = α·x² cu α > 0; aici x¹ = (1,1,0) ≠ α·(0,1,1) pentru niciun α.' } },
    ],
    explanation: {
      en: 'cos(x, y) = ⟨x, y⟩ / (‖x‖₂ · ‖y‖₂). Here ⟨x¹, x²⟩ = 0+1+0 = 1 and ‖x¹‖₂ = ‖x²‖₂ = √2, so cos = 1/(√2·√2) = 1/2. The vectors are not orthogonal (cos ≠ 0).',
      ro: 'cos(x, y) = ⟨x, y⟩ / (‖x‖₂ · ‖y‖₂). Aici ⟨x¹, x²⟩ = 0+1+0 = 1 și ‖x¹‖₂ = ‖x²‖₂ = √2, deci cos = 1/(√2·√2) = 1/2. Vectorii nu sunt ortogonali (cos ≠ 0).',
    },
  }];

  const mc3cos23 = [{
    question: {
      en: 'With the modification x³ = (1, 0, 1)ᵀ (choosing α = 0), cos(x², x³) equals',
      ro: 'Cu modificarea x³ = (1, 0, 1)ᵀ (alegând α = 0), cos(x², x³) este',
    },
    options: [
      { text: '1/2', correct: true },
      { text: '0', correct: false, feedback: { en: '⟨x², x³⟩ with x³=(1,0,1) gives 0·1 + 1·0 + 1·1 = 1 ≠ 0; orthogonality would require all three products to cancel.', ro: '⟨x², x³⟩ cu x³=(1,0,1) dă 0·1 + 1·0 + 1·1 = 1 ≠ 0; ortogonalitatea ar cere ca cele trei produse să se anuleze.' } },
      { text: '1', correct: false, feedback: { en: 'cos = 1 means parallel; x² = (0,1,1) and x³ = (1,0,1) are not scalar multiples.', ro: 'cos = 1 înseamnă paraleli; x² = (0,1,1) și x³ = (1,0,1) nu sunt multiple scalare.' } },
      { text: '1/√2', correct: false, feedback: { en: 'Divided only by one norm: the formula divides by ‖x²‖·‖x³‖ = √2·√2 = 2, not √2.', ro: 'Ai împărțit doar la o normă: formula împarte la ‖x²‖·‖x³‖ = √2·√2 = 2, nu √2.' } },
    ],
    explanation: {
      en: '⟨x², x³⟩ = 0·1 + 1·0 + 1·1 = 1. ‖x²‖₂ = ‖x³‖₂ = √2. cos = 1/(√2·√2) = 1/2. The value depends on the α you chose — if you picked a different α, recompute.',
      ro: '⟨x², x³⟩ = 0·1 + 1·0 + 1·1 = 1. ‖x²‖₂ = ‖x³‖₂ = √2. cos = 1/(√2·√2) = 1/2. Valoarea depinde de α-ul ales — dacă alegeți alt α, recalculați.',
    },
  }];

  /* ─── P4: Gram–Schmidt on x¹, x², x³ ─── */
  const mc4indep = [{
    question: {
      en: 'det([x¹|x²|x³]) with x¹=(1,1,0)ᵀ, x²=(1,0,1)ᵀ, x³=(0,0,1)ᵀ equals',
      ro: 'det([x¹|x²|x³]) cu x¹=(1,1,0)ᵀ, x²=(1,0,1)ᵀ, x³=(0,0,1)ᵀ este',
    },
    options: [
      { text: '−1', correct: true },
      { text: '0', correct: false, feedback: { en: 'det = 0 would mean dependence; expand and you get −1 ≠ 0, so they are independent.', ro: 'det = 0 ar însemna dependență; dezvoltând obții −1 ≠ 0, deci sunt independenți.' } },
      { text: '1', correct: false, feedback: { en: 'Sign error: expanding along row 1, the cofactor 1·0 − 1·1 = −1 contributes −1, not +1.', ro: 'Eroare de semn: dezvoltând pe linia 1, cofactorul 1·0 − 1·1 = −1 contribuie cu −1, nu +1.' } },
      { text: '2', correct: false, feedback: { en: 'That would be a different matrix; here the three 2×2 minors evaluate to 0, 1, 0 with alternating signs (+, −, +), summing to −1.', ro: 'Aceea ar fi altă matrice; aici cei trei minori 2×2 dau 0, 1, 0 cu semne alternante (+, −, +), însumând −1.' } },
    ],
    explanation: {
      en: 'Expanding along the first row: 1·(0·1 − 0·1) − 1·(1·1 − 0·0) + 0 = 0 − 1 + 0 = −1. Nonzero, so the vectors are independent.',
      ro: 'Dezvoltând pe prima linie: 1·(0·1 − 0·1) − 1·(1·1 − 0·0) + 0 = 0 − 1 + 0 = −1. Nenul, deci vectorii sunt independenți.',
    },
  }];

  const mc4sol = [{
    question: {
      en: 'The solution of Ax = b with A = [[1,1,0],[1,0,0],[0,1,1]] and b = (2,1,1)ᵀ is',
      ro: 'Soluția lui Ax = b cu A = [[1,1,0],[1,0,0],[0,1,1]] și b = (2,1,1)ᵀ este',
    },
    options: [
      { text: 'x = (1, 1, 0)ᵀ', correct: true },
      { text: 'x = (0, 1, 1)ᵀ', correct: false, feedback: { en: 'Check row 2: 1·0 + 0·1 + 0·1 = 0 ≠ 1 (b₂). Row 2 forces x₁ = 1, not 0.', ro: 'Verifică linia 2: 1·0 + 0·1 + 0·1 = 0 ≠ 1 (b₂). Linia 2 forțează x₁ = 1, nu 0.' } },
      { text: 'x = (2, 0, 1)ᵀ', correct: false, feedback: { en: 'Row 1: 1·2 + 1·0 + 0·1 = 2 = b₁ ✓ but row 2: 1·2 + 0 + 0 = 2 ≠ 1 (b₂).', ro: 'Linia 1: 1·2 + 1·0 + 0·1 = 2 = b₁ ✓ dar linia 2: 1·2 + 0 + 0 = 2 ≠ 1 (b₂).' } },
      { text: 'x = (1, 0, 1)ᵀ', correct: false, feedback: { en: 'Row 1: 1·1 + 1·0 = 1 ≠ 2 (b₁). The x₂ contribution is missing — x₂ must be 1 to match b₁ = 2.', ro: 'Linia 1: 1·1 + 1·0 = 1 ≠ 2 (b₁). Lipsește contribuția lui x₂ — x₂ trebuie 1 ca să dea b₁ = 2.' } },
    ],
    explanation: {
      en: 'Row 2 gives x₁ = 1. Row 1 gives 1 + x₂ = 2 ⇒ x₂ = 1. Row 3 gives x₂ + x₃ = 1 ⇒ x₃ = 0. The QR route gives the same answer: y = Qᵀb, then back-solve Rx = y.',
      ro: 'Linia 2 dă x₁ = 1. Linia 1 dă 1 + x₂ = 2 ⇒ x₂ = 1. Linia 3 dă x₂ + x₃ = 1 ⇒ x₃ = 0. Ruta QR dă același răspuns: y = Qᵀb, apoi rezolvăm Rx = y.',
    },
  }];

  /* ─── P5 ─── */
  const mc5sol = [{
    question: {
      en: 'For A = [y¹ y² y³] with y¹=(1,1,0), y²=(1,1,1), y³=(3,1,1), and b = (4,2,2)ᵀ, x solving Ax = b is',
      ro: 'Pentru A = [y¹ y² y³] cu y¹=(1,1,0), y²=(1,1,1), y³=(3,1,1), și b = (4,2,2)ᵀ, soluția x a lui Ax = b este',
    },
    options: [
      { text: 'x = (0, 1, 1)ᵀ', correct: true },
      { text: 'x = (1, 1, 1)ᵀ', correct: false, feedback: { en: 'Check row 3: 0·1 + 1·1 + 1·1 = 2 = b₃ ✓, but row 1: 1·1 + 1·1 + 3·1 = 5 ≠ 4 (b₁).', ro: 'Verifică linia 3: 0·1 + 1·1 + 1·1 = 2 = b₃ ✓, dar linia 1: 1·1 + 1·1 + 3·1 = 5 ≠ 4 (b₁).' } },
      { text: 'x = (1, 0, 1)ᵀ', correct: false, feedback: { en: 'Row 1: 1 + 0 + 3 = 4 ✓ but row 2: 1 + 0 + 1 = 2 = b₂ ✓ too, and row 3: 0 + 0 + 1 = 1 ≠ 2 (b₃). Close but last row fails.', ro: 'Linia 1: 1 + 0 + 3 = 4 ✓ iar linia 2: 1 + 0 + 1 = 2 = b₂ ✓, dar linia 3: 0 + 0 + 1 = 1 ≠ 2 (b₃). Aproape, dar ultima linie eșuează.' } },
      { text: 'x = (2, 0, 0)ᵀ', correct: false, feedback: { en: 'Row 1: 2 + 0 + 0 = 2 ≠ 4 (b₁). Also row 3: 0 + 0 + 0 = 0 ≠ 2.', ro: 'Linia 1: 2 + 0 + 0 = 2 ≠ 4 (b₁). Și linia 3: 0 + 0 + 0 = 0 ≠ 2.' } },
    ],
    explanation: {
      en: 'Using A = QR with the Gram–Schmidt Q below: Qᵀb = (3√2, 2, √2)ᵀ, then back-solve R x = Qᵀb — R is upper-triangular, giving x₃ = 1, x₂ = 1, x₁ = 0. Check: 0·y¹ + 1·y² + 1·y³ = (1+3, 1+1, 1+1) = (4, 2, 2). ✓',
      ro: 'Folosim A = QR cu Q Gram–Schmidt (mai jos): Qᵀb = (3√2, 2, √2)ᵀ, apoi rezolvăm Rx = Qᵀb — R e triunghiulară superior, dând x₃ = 1, x₂ = 1, x₁ = 0. Verificare: 0·y¹ + 1·y² + 1·y³ = (1+3, 1+1, 1+1) = (4, 2, 2). ✓',
    },
  }];

  return (
    <>
      <p className="mb-4 text-sm opacity-80">
        {t(
          'Source: Linear Algebra & Optimization Seminar 2 — Triangular systems, inverses, linear independence, Gram–Schmidt, UAIC 2025–2026.',
          'Sursa: Seminar ALO 2 — Sisteme triunghiulare, inverse, independență liniară, Gram–Schmidt, UAIC 2025–2026.',
        )}
      </p>

      {/* ══════════ Problem 1 ══════════ */}
      <h3 className="text-lg font-bold mt-6 mb-2">
        {t('Problem 1: Solve four triangular systems', 'Problema 1: Rezolvă patru sisteme triunghiulare')}
      </h3>
      <Box type="definition">
        <p className="text-sm">{t(
          'Solve Ax = b for the four triangular matrices below.',
          'Rezolvă Ax = b pentru cele patru matrici triunghiulare de mai jos.',
        )}</p>
        <ul className="text-sm list-disc ml-4 mt-1">
          <li>(a) A lower, rows (1,0,0), (1.5,2,0), (1,1,2.5); b = (0, 2, 3.5)ᵀ</li>
          <li>(b) A lower 4×4, 1s on and below diagonal; b = (1, 2, 3, 4)ᵀ</li>
          <li>(c) A upper, rows (2,1,3), (0,4,1), (0,0,1); b = (8, 5, 1)ᵀ</li>
          <li>(d) A upper, rows (1,1,1,0), (0,1,1,1), (0,0,1,1), (0,0,0,1); b = (6, 9, 7, 4)ᵀ</li>
        </ul>
      </Box>

      <p className="text-sm font-semibold mt-3 mb-1">{t('Which direction first?', 'Care direcție mai întâi?')}</p>
      <MultipleChoice questions={mc1dir} />

      <p className="text-sm font-semibold mt-3 mb-1">{t('Solution of (a)', 'Soluția pentru (a)')}</p>
      <MultipleChoice questions={mc1a} />

      <Toggle
        question={t('Show all four solutions', 'Arată toate cele patru soluții')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">(a) {t('Forward substitution', 'Substituție directă')}</p>
            <p className="text-sm mb-2">x₁ = 0; 2x₂ = 2 ⇒ x₂ = 1; 2.5x₃ = 3.5 − 0 − 1 = 2.5 ⇒ x₃ = 1. Solution: (0, 1, 1)ᵀ.</p>

            <p className="font-bold mt-4 mb-1">(b) {t('Forward substitution, all-ones lower-triangular', 'Substituție directă, triunghiulară inferior cu toți 1')}</p>
            <p className="text-sm mb-2">xₖ = bₖ − (x₁ + ⋯ + xₖ₋₁). With b = (1,2,3,4): x = (1, 1, 1, 1)ᵀ.</p>

            <p className="font-bold mt-4 mb-1">(c) {t('Back substitution', 'Substituție inversă')}</p>
            <p className="text-sm mb-2">x₃ = 1; 4x₂ + 1 = 5 ⇒ x₂ = 1; 2x₁ + 1 + 3 = 8 ⇒ x₁ = 2. Solution: (2, 1, 1)ᵀ.</p>

            <p className="font-bold mt-4 mb-1">(d) {t('Back substitution', 'Substituție inversă')}</p>
            <p className="text-sm mb-2">x₄ = 4; x₃ + 4 = 7 ⇒ x₃ = 3; x₂ + 3 + 4 = 9 ⇒ x₂ = 2; x₁ + 2 + 3 + 0 = 6 ⇒ x₁ = 1. Solution: (1, 2, 3, 4)ᵀ.</p>

            <Box type="theorem">
              <p className="text-sm">{t(
                'Cost of forward/back substitution is Θ(n²) — specifically n(n−1)/2 multiplies and n divisions — versus Θ(n³) for Gaussian elimination on a general dense system.',
                'Costul substituției directe/inverse este Θ(n²) — mai exact n(n−1)/2 înmulțiri și n împărțiri — față de Θ(n³) pentru eliminarea Gauss pe un sistem dens general.',
              )}</p>
            </Box>
          </div>
        }
      />

      {/* ══════════ Problem 2 ══════════ */}
      <h3 className="text-lg font-bold mt-8 mb-2">
        {t('Problem 2: Inverses of the matrices in P1(b) and P1(d)', 'Problema 2: Inversele matricelor din P1(b) și P1(d)')}
      </h3>
      <Box type="definition">
        <p className="text-sm">{t(
          'Compute A⁻¹ for the matrices in P1(b) and P1(d). For P1(b), generalise to the n × n case.',
          'Calculează A⁻¹ pentru matricele din P1(b) și P1(d). Pentru P1(b), generalizează la cazul n × n.',
        )}</p>
      </Box>
      <MultipleChoice questions={mc2b} />
      <Toggle
        question={t('Show both inverses and the general n × n formula', 'Arată ambele inverse și formula generală n × n')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">{t('(b) Inverse of the 4×4 cumulative-sum matrix', '(b) Inversa matricei sumă cumulativă 4×4')}</p>
            <Code>{`A⁻¹ =  1  0  0  0
       -1  1  0  0
        0 -1  1  0
        0  0 -1  1`}</Code>
            <p className="text-sm mt-2 mb-2">{t(
              'Verify by solving Aeⱼ column by column, or observe that A is the cumulative-sum operator and A⁻¹ is its inverse — the first-difference operator.',
              'Verifică rezolvând Aeⱼ coloană cu coloană, sau observă că A este operatorul sumei cumulative iar A⁻¹ este inversul său — operatorul diferenței finite.',
            )}</p>

            <p className="font-bold mt-4 mb-1">{t('General n × n formula', 'Formula generală n × n')}</p>
            <p className="text-sm mb-2">
              (A⁻¹)ᵢⱼ = 1 if i = j, −1 if i = j + 1, 0 otherwise. Equivalently A⁻¹ = I − S where S is the shift-by-one matrix (Sᵢⱼ = 1 if i = j + 1, else 0).
            </p>

            <p className="font-bold mt-4 mb-1">{t('(d) Inverse of the 4×4 upper-triangular matrix', '(d) Inversa matricei triunghiular superior 4×4')}</p>
            <Code>{`A⁻¹ =  1 -1  0  1
        0  1 -1  0
        0  0  1 -1
        0  0  0  1`}</Code>
            <p className="text-sm mt-2 mb-2">{t(
              'Found by solving Ax = eⱼ for j = 1, …, 4 via back substitution. For example, for e₄: x₄ = 1, x₃ = −1, x₂ = 0, x₁ = 1 — giving column 4.',
              'Găsită rezolvând Ax = eⱼ pentru j = 1, …, 4 prin substituție inversă. De exemplu, pentru e₄: x₄ = 1, x₃ = −1, x₂ = 0, x₁ = 1 — dând coloana 4.',
            )}</p>
            <Box type="theorem">
              <p className="text-sm">{t(
                'The inverse of a triangular matrix is triangular of the same type, and each column can be found by back/forward substitution with right-hand side eⱼ. Cost: Θ(n³) total (n systems of size n).',
                'Inversa unei matrici triunghiulare este triunghiulară de același tip, iar fiecare coloană se obține prin substituție inversă/directă cu membrul drept eⱼ. Cost: Θ(n³) total (n sisteme de dimensiune n).',
              )}</p>
            </Box>
          </div>
        }
      />

      {/* ══════════ Problem 3 ══════════ */}
      <h3 className="text-lg font-bold mt-8 mb-2">
        {t('Problem 3: Dependence, modification, and angles', 'Problema 3: Dependență, modificare și unghiuri')}
      </h3>
      <Box type="definition">
        <p className="text-sm">{t(
          'Show that x¹=(1,1,0)ᵀ, x²=(0,1,1)ᵀ, x³=(1,2,1)ᵀ are linearly dependent. Modify the second component of x³ so the vectors become independent. Are they orthogonal? Compute cos(x¹, x²) and cos(x², x³) after modification.',
          'Arată că x¹=(1,1,0)ᵀ, x²=(0,1,1)ᵀ, x³=(1,2,1)ᵀ sunt liniar dependenți. Modifică componenta a doua a lui x³ astfel încât vectorii să devină liniar independenți. Sunt ortogonali? Calculează cos(x¹, x²) și cos(x², x³) după modificare.',
        )}</p>
      </Box>

      <p className="text-sm font-semibold mt-3 mb-1">{t('Dependence check', 'Verificarea dependenței')}</p>
      <MultipleChoice questions={mc3dep} />

      <p className="text-sm font-semibold mt-3 mb-1">{t('Modification condition', 'Condiția de modificare')}</p>
      <MultipleChoice questions={mc3modify} />

      <p className="text-sm font-semibold mt-3 mb-1">{t('Angle computation — cos(x¹, x²)', 'Calculul unghiului — cos(x¹, x²)')}</p>
      <MultipleChoice questions={mc3cos} />

      <p className="text-sm font-semibold mt-3 mb-1">{t('Angle after modification — cos(x², x³)', 'Unghiul după modificare — cos(x², x³)')}</p>
      <MultipleChoice questions={mc3cos23} />

      <Toggle
        question={t('Show full reasoning and cos(x², x³) after modification', 'Arată raționamentul complet și cos(x², x³) după modificare')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">{t('Dependence', 'Dependență')}</p>
            <p className="text-sm mb-2">x¹ + x² = (1, 2, 1)ᵀ = x³, so the three are linearly dependent.</p>

            <p className="font-bold mt-4 mb-1">{t('Modification', 'Modificare')}</p>
            <p className="text-sm mb-2">{t(
              'Write x³ = (1, α, 1)ᵀ. Dependence means a·x¹ + b·x² = x³; matching gives a = 1, b = 1, α = 2. Any α ≠ 2 makes the set independent — e.g., take α = 0, so x³ = (1, 0, 1)ᵀ.',
              'Scrie x³ = (1, α, 1)ᵀ. Dependența cere a·x¹ + b·x² = x³; egalând obținem a = 1, b = 1, α = 2. Orice α ≠ 2 face mulțimea independentă — de exemplu α = 0, deci x³ = (1, 0, 1)ᵀ.',
            )}</p>

            <p className="font-bold mt-4 mb-1">{t('Orthogonality', 'Ortogonalitate')}</p>
            <p className="text-sm mb-2">⟨x¹, x²⟩ = 1 ≠ 0, so the vectors are not pairwise orthogonal.</p>

            <p className="font-bold mt-4 mb-1">{t('Cosines', 'Cosinusuri')}</p>
            <ul className="text-sm list-disc ml-4 mb-2">
              <li>cos(x¹, x²) = ⟨x¹, x²⟩ / (‖x¹‖₂ · ‖x²‖₂) = 1 / (√2 · √2) = 1/2.</li>
              <li>{t('Using the modified x³ = (1, 0, 1)ᵀ', 'Folosind modificatul x³ = (1, 0, 1)ᵀ')}: ⟨x², x³⟩ = 0 + 0 + 1 = 1, ‖x²‖ = ‖x³‖ = √2 ⇒ cos(x², x³) = 1/2.</li>
            </ul>
            <Box type="warning">
              <p className="text-sm">{t(
                'The cosine depends on the choice of α: different modifications yield different angles. The sheet leaves the choice open — state yours explicitly.',
                'Cosinusul depinde de alegerea lui α: modificări diferite dau unghiuri diferite. Fișa lasă alegerea deschisă — declară explicit alegerea ta.',
              )}</p>
            </Box>
          </div>
        }
      />

      {/* ══════════ Problem 4 ══════════ */}
      <h3 className="text-lg font-bold mt-8 mb-2">
        {t('Problem 4: Gram–Schmidt on x¹, x², x³ + solve Ax = b', 'Problema 4: Gram–Schmidt pe x¹, x², x³ + rezolvă Ax = b')}
      </h3>
      <Box type="definition">
        <p className="text-sm">{t(
          'Let x¹=(1,1,0)ᵀ, x²=(1,0,1)ᵀ, x³=(0,0,1)ᵀ. Show independence and non-orthogonality. Orthonormalize by Gram–Schmidt, then use Q, R to solve Ax = b with A = [[1,1,0],[1,0,0],[0,1,1]], b = (2,1,1)ᵀ. Compute A⁻¹ from the QR decomposition.',
          'Fie x¹=(1,1,0)ᵀ, x²=(1,0,1)ᵀ, x³=(0,0,1)ᵀ. Arată independența și non-ortogonalitatea. Ortonormalizează prin Gram–Schmidt, apoi folosește Q, R pentru a rezolva Ax = b cu A = [[1,1,0],[1,0,0],[0,1,1]], b = (2,1,1)ᵀ. Calculează A⁻¹ din descompunerea QR.',
        )}</p>
      </Box>

      <p className="text-sm font-semibold mt-3 mb-1">{t('Independence check', 'Verificarea independenței')}</p>
      <MultipleChoice questions={mc4indep} />

      <p className="text-sm font-semibold mt-3 mb-1">{t('Solution of Ax = b', 'Soluția Ax = b')}</p>
      <MultipleChoice questions={mc4sol} />

      <Toggle
        question={t('Show Gram–Schmidt, Q, R, and A⁻¹', 'Arată Gram–Schmidt, Q, R și A⁻¹')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">{t('Independence', 'Independență')}</p>
            <p className="text-sm mb-2">det([x¹|x²|x³]) = −1 ≠ 0.</p>

            <p className="font-bold mt-4 mb-1">{t('Non-orthogonality', 'Non-ortogonalitate')}</p>
            <p className="text-sm mb-2">⟨x¹, x²⟩ = 1 ≠ 0.</p>

            <p className="font-bold mt-4 mb-1">{t('Gram–Schmidt', 'Gram–Schmidt')}</p>
            <ul className="text-sm list-disc ml-4 mb-2">
              <li>q₁ = x¹ / ‖x¹‖ = (1/√2, 1/√2, 0)ᵀ.</li>
              <li>v₂ = x² − ⟨x², q₁⟩ q₁ = (1,0,1) − (1/√2)·q₁ = (1/2, −1/2, 1) ⇒ q₂ = (1/√6, −1/√6, 2/√6)ᵀ.</li>
              <li>v₃ = x³ − ⟨x³, q₁⟩ q₁ − ⟨x³, q₂⟩ q₂ = (0,0,1) − 0 − (2/√6)·q₂ = (−1/3, 1/3, 1/3) ⇒ q₃ = (−1/√3, 1/√3, 1/√3)ᵀ.</li>
            </ul>

            <p className="font-bold mt-4 mb-1">{t('Q and R', 'Q și R')}</p>
            <Code>{`Q = [ 1/√2   1/√6   -1/√3 ]
    [ 1/√2  -1/√6    1/√3 ]
    [  0     2/√6    1/√3 ]

R = [ √2    1/√2     0   ]
    [  0   √6/2    2/√6  ]
    [  0    0     1/√3   ]`}</Code>

            <p className="font-bold mt-4 mb-1">{t('Solve Ax = b via A = QR', 'Rezolvă Ax = b via A = QR')}</p>
            <p className="text-sm mb-2">
              y = Qᵀb = (3/√2, 3/√6, 0)ᵀ. Back substitution on Rx = y gives x₃ = 0, x₂ = 1, x₁ = 1.
            </p>

            <p className="font-bold mt-4 mb-1">{t('Inverse (via Aeⱼ)', 'Inversa (via Aeⱼ)')}</p>
            <Code>{`A⁻¹ =  0  1  0
        1 -1  0
       -1  1  1`}</Code>
            <Box type="theorem">
              <p className="text-sm">{t(
                'A = QR with Q unitary means A⁻¹ = R⁻¹Qᵀ. Because R is upper-triangular, R⁻¹ is cheap: triangular back-substitution, Θ(n²) per column.',
                'A = QR cu Q unitară implică A⁻¹ = R⁻¹Qᵀ. Cum R e triunghiulară superior, R⁻¹ se calculează ieftin: substituție inversă triunghiulară, Θ(n²) pe coloană.',
              )}</p>
            </Box>
          </div>
        }
      />

      {/* ══════════ Problem 5 ══════════ */}
      <h3 className="text-lg font-bold mt-8 mb-2">
        {t('Problem 5: Gram–Schmidt on y¹, y², y³ + solve Ax = b', 'Problema 5: Gram–Schmidt pe y¹, y², y³ + rezolvă Ax = b')}
      </h3>
      <Box type="definition">
        <p className="text-sm">{t(
          'Let y¹=(1,1,0)ᵀ, y²=(1,1,1)ᵀ, y³=(3,1,1)ᵀ. Show independence and non-orthogonality. Orthonormalize by Gram–Schmidt. Solve Ax = b with A = [y¹ y² y³], b = (4, 2, 2)ᵀ. Compute A⁻¹.',
          'Fie y¹=(1,1,0)ᵀ, y²=(1,1,1)ᵀ, y³=(3,1,1)ᵀ. Arată independența și non-ortogonalitatea. Ortonormalizează prin Gram–Schmidt. Rezolvă Ax = b cu A = [y¹ y² y³], b = (4, 2, 2)ᵀ. Calculează A⁻¹.',
        )}</p>
      </Box>
      <MultipleChoice questions={mc5sol} />
      <Toggle
        question={t('Show Gram–Schmidt, Q, R, and A⁻¹', 'Arată Gram–Schmidt, Q, R și A⁻¹')}
        showLabel={t('Show', 'Arată')}
        hideLabel={t('Hide', 'Ascunde')}
        answer={
          <div>
            <p className="font-bold mb-1">{t('Independence & non-orthogonality', 'Independență și non-ortogonalitate')}</p>
            <p className="text-sm mb-2">
              det(A) = 2 ≠ 0; ⟨y¹, y²⟩ = 2 ≠ 0 — linearly independent but not pairwise orthogonal.
            </p>

            <p className="font-bold mt-4 mb-1">{t('Gram–Schmidt', 'Gram–Schmidt')}</p>
            <ul className="text-sm list-disc ml-4 mb-2">
              <li>q₁ = (1/√2, 1/√2, 0)ᵀ (‖y¹‖ = √2).</li>
              <li>v₂ = y² − √2·q₁ = (0, 0, 1)ᵀ ⇒ q₂ = (0, 0, 1)ᵀ.</li>
              <li>v₃ = y³ − 2√2·q₁ − 1·q₂ = (1, −1, 0)ᵀ ⇒ q₃ = (1/√2, −1/√2, 0)ᵀ.</li>
            </ul>

            <p className="font-bold mt-4 mb-1">{t('Q and R', 'Q și R')}</p>
            <Code>{`Q = [ 1/√2   0    1/√2 ]
    [ 1/√2   0   -1/√2 ]
    [  0    1     0   ]

R = [ √2   √2   2√2 ]
    [  0   1     1   ]
    [  0   0    √2   ]`}</Code>

            <p className="font-bold mt-4 mb-1">{t('Solve via Qᵀb then Rx = y', 'Rezolvă via Qᵀb apoi Rx = y')}</p>
            <p className="text-sm mb-2">
              Qᵀb = (3√2, 2, √2)ᵀ. Back-solve: √2·x₃ = √2 ⇒ x₃ = 1; x₂ + 1 = 2 ⇒ x₂ = 1; √2·x₁ + √2 + 2√2 = 3√2 ⇒ x₁ = 0.
            </p>

            <p className="font-bold mt-4 mb-1">{t('Inverse', 'Inversa')}</p>
            <Code>{`A⁻¹ =   0     1    -1
      -1/2   1/2   1
       1/2  -1/2   0`}</Code>
            <Box type="theorem">
              <p className="text-sm">{t(
                'QR preserves the linear system: solving Ax = b costs one Qᵀb matrix-vector product plus one triangular back-substitution. This is numerically more stable than computing A⁻¹ explicitly when A is ill-conditioned (see the course material on conditioning and QR).',
                'QR conservă sistemul: rezolvarea Ax = b costă un produs Qᵀb și o substituție triunghiulară. Numeric e mai stabil decât calculul explicit al A⁻¹ când A e rău-condiționată (Curs 5/6).',
              )}</p>
            </Box>
          </div>
        }
      />
    </>
  );
}
