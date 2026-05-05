import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Toggle, Section } from '../../../components/ui';

export default function T5() {
  const { t, checked, toggleCheck } = useApp();
  return (
    <>
      <p className="mb-3 text-sm opacity-80">
        {t(
          'Source: ALO Lab Theme 5 — Jacobi eigenvalue method, Cholesky QR iteration, and SVD / Moore–Penrose pseudoinverse, UAIC 2026.',
          'Sursă: ALO Tema 5 — Metoda Jacobi pentru valori proprii, iterația QR Cholesky și SVD / pseudoinversa Moore–Penrose, UAIC 2026.'
        )}
      </p>

      <Section
        title={t('1. Jacobi method for symmetric eigenvalues (p = n)', '1. Metoda Jacobi pentru valori proprii simetrice (p = n)')}
        id="alo-t5-jacobi"
        checked={!!checked['alo-t5-jacobi']}
        onCheck={() => toggleCheck('alo-t5-jacobi')}
      >
        <p>
          {t(
            'For a symmetric matrix A = Aᵀ ∈ ℝⁿˣⁿ, the Jacobi method builds a sequence of orthogonally similar matrices converging to a diagonal one. The diagonal entries converge to the eigenvalues.',
            'Pentru o matrice simetrică A = Aᵀ ∈ ℝⁿˣⁿ, metoda Jacobi construiește un șir de matrice similar ortogonal care converge la o matrice diagonală. Elementele diagonale converg la valorile proprii.'
          )}
        </p>
        <Code>{`// Jacobi eigenvalue algorithm
k = 0; U = I_n
find indices (p,q) with |a[p][q]| = max{|a[i][j]|; i≠j}
compute θ: α = (a[p][p] - a[q][q]) / (2*a[p][q])
           t = -α + sign(α)*sqrt(α² + 1)   // smaller root
           c = 1/sqrt(1+t²); s = t/sqrt(1+t²)

while (|a[p][q]| > ε  and  k ≤ kmax):
    // Update A = Rpq * A * Rpq^T
    for j ≠ p,q: a[p][j] = a[j][p] = c*a[p][j] + s*a[q][j]
                           a[q][j] = a[j][q] = -s*a[p][j_old] + c*a[q][j]
    a[p][p] += t*a[p][q]_old
    a[q][q] -= t*a[p][q]_old
    a[p][q] = a[q][p] = 0
    // Update U = U * Rpq^T
    for i: u[i][p], u[i][q] = c*u[i][p]+s*u[i][q], -s*u[i][p]+c*u[i][q]
    find new (p,q); recompute c, s, t; k++
// Eigenvalues: diagonal of A; Eigenvectors: columns of U`}</Code>
        <Box type="definition">
          <p className="font-bold mb-1 text-sm">{t('Verification', 'Verificare')}</p>
          <p className="text-sm">
            {t(
              'Display ‖Ainit·U − U·Λ‖ where Λ = diag(λ₁,…,λn) and U = [u₁,…,uₙ]. This should be < ε.',
              'Afișați ‖Ainit·U − U·Λ‖ unde Λ = diag(λ₁,…,λn) și U = [u₁,…,uₙ]. Ar trebui să fie < ε.'
            )}
          </p>
        </Box>
      </Section>

      <Section
        title={t('2. Cholesky QR iteration (p = n)', '2. Iterația QR Cholesky (p = n)')}
        id="alo-t5-cholesky-qr"
        checked={!!checked['alo-t5-cholesky-qr']}
        onCheck={() => toggleCheck('alo-t5-cholesky-qr')}
      >
        <p>
          {t(
            'Build the sequence A⁽ᵏ⁾ using alternating Cholesky factorization and transpose multiplication until convergence.',
            'Construiți șirul A⁽ᵏ⁾ prin factorizare Cholesky alternantă și înmulțire transpusă până la convergență.'
          )}
        </p>
        <Box type="formula">
          <p className="font-bold mb-1 text-sm">{t('Algorithm', 'Algoritmul')}</p>
          <p className="font-mono text-sm">
            A⁽⁰⁾ = A = L₀L₀ᵀ (Cholesky)<br />
            A⁽¹⁾ = L₀ᵀL₀; A⁽¹⁾ = L₁L₁ᵀ<br />
            A⁽ᵏ⁺¹⁾ = Lₖᵀ Lₖ<br />
            {t('Stop when', 'Oprire când')} ‖A⁽ᵏ⁾ − A⁽ᵏ⁻¹⁾‖ &lt; ε {t('or', 'sau')} k &gt; kmax
          </p>
        </Box>
        <Toggle
          question={t('What does the final matrix tell us?', 'Ce ne spune matricea finală?')}
          answer={t(
            'The final matrix A^(final) converges to a diagonal-like form. The diagonal entries approximate the eigenvalues of the original A. This is a symmetric QR iteration variant using the Cholesky structure to guarantee positive definiteness at each step.',
            'Matricea finală A^(final) converge la o formă aproximativ diagonală. Elementele diagonale aproximează valorile proprii ale lui A original. Aceasta este o variantă a iterației QR simetrice folosind structura Cholesky pentru a garanta pozitivitatea definită la fiecare pas.'
          )}
        />
      </Section>

      <Section
        title={t('3. SVD and Moore–Penrose pseudoinverse (p > n)', '3. SVD și pseudoinversa Moore–Penrose (p > n)')}
        id="alo-t5-svd"
        checked={!!checked['alo-t5-svd']}
        onCheck={() => toggleCheck('alo-t5-svd')}
      >
        <p>
          {t(
            'For A ∈ ℝᵖˣⁿ with p > n, use the library SVD to compute singular values, rank, condition number, and the Moore–Penrose pseudoinverse.',
            'Pentru A ∈ ℝᵖˣⁿ cu p > n, folosiți SVD din bibliotecă pentru a calcula valorile singulare, rangul, numărul de condiționare și pseudoinversa Moore–Penrose.'
          )}
        </p>
        <Box type="definition">
          <p className="font-bold mb-2 text-sm">{t('Quantities to compute', 'Cantități de calculat')}</p>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>{t('SVD: A = UΣVᵀ (use library)', 'SVD: A = UΣVᵀ (folosiți biblioteca)')}</li>
            <li>{t('Rank = number of strictly positive singular values σᵢ > 0', 'Rang = numărul valorilor singulare strict pozitive σᵢ > 0')}</li>
            <li>{t('Condition number κ₂(A) = σmax / σmin (σmin = smallest positive)', 'Numărul de condiționare κ₂(A) = σmax / σmin (σmin = cea mai mică strict pozitivă)')}</li>
            <li>{t('Pseudoinverse: Aᴵ = V·Sᴵ·Uᵀ where Sᴵᵢᵢ = 1/σᵢ for σᵢ > 0', 'Pseudoinversa: Aᴵ = V·Sᴵ·Uᵀ unde Sᴵᵢᵢ = 1/σᵢ pentru σᵢ > 0')}</li>
            <li>{t('Least-squares inverse: Aᴶ = (AᵀA)⁻¹Aᵀ', 'Pseudoinversa CMM: Aᴶ = (AᵀA)⁻¹Aᵀ')}</li>
            <li>{t('Display ‖Aᴵ − Aᴶ‖₁', 'Afișați ‖Aᴵ − Aᴶ‖₁')}</li>
          </ul>
        </Box>
        <Toggle
          question={t('Example eigenvalues for test matrices', 'Valori proprii exemplu pentru matrice de test')}
          answer={t(
            'A = [[0,0,1],[0,0,1],[1,1,1]] has eigenvalues λ₁ = −1, λ₂ = 0, λ₃ = 2.\nA = [[1,1,2],[1,1,2],[2,2,2]] has eigenvalues λ₁ = 0, λ₂ = 2(1−√2) ≈ −0.828, λ₃ = 2(1+√2) ≈ 4.828.\nA = 4×4 [[1,0,1,0],[0,0,1,0,1],[1,0,1,0],[0,1,0,1]] has eigenvalues λ₁ = λ₂ = 0, λ₃ = λ₄ = 2.',
            'A = [[0,0,1],[0,0,1],[1,1,1]] are valorile proprii λ₁ = −1, λ₂ = 0, λ₃ = 2.\nA = [[1,1,2],[1,1,2],[2,2,2]] are λ₁ = 0, λ₂ = 2(1−√2) ≈ −0.828, λ₃ = 2(1+√2) ≈ 4.828.\nA 4×4 = [[1,0,1,0],[0,0,1,0,1],[1,0,1,0],[0,1,0,1]] are λ₁ = λ₂ = 0, λ₃ = λ₄ = 2.'
          )}
        />
      </Section>
    </>
  );
}
