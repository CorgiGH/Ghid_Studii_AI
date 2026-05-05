import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Toggle, Section } from '../../../components/ui';

export default function T4() {
  const { t, checked, toggleCheck } = useApp();
  return (
    <>
      <p className="mb-3 text-sm opacity-80">
        {t(
          'Source: ALO Lab Theme 4 — QR decomposition via Householder and matrix inverse, UAIC 2026.',
          'Sursă: ALO Tema 4 — Descompunerea QR prin Householder și inversa matricei, UAIC 2026.'
        )}
      </p>

      <Section
        title={t('1. Task overview', '1. Prezentarea sarcinilor')}
        id="alo-t4-overview"
        checked={!!checked['alo-t4-overview']}
        onCheck={() => toggleCheck('alo-t4-overview')}
      >
        <p className="mb-2">
          {t(
            'Given: n, ε, square matrix A ∈ ℝⁿˣⁿ, vector s ∈ ℝⁿ. Let b = Aᵀs. Tasks:',
            'Date: n, ε, matricea A ∈ ℝⁿˣⁿ, vectorul s ∈ ℝⁿ. Fie b = Aᵀs. Sarcini:'
          )}
        </p>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li>{t('Implement Householder QR decomposition', 'Implementați descompunerea QR Householder')}</li>
          <li>{t('Solve Ax = b using both QR (Householder) and library QR; compare ‖xQR − xHouseholder‖₂', 'Rezolvați Ax = b cu QR (Householder) și QR din bibliotecă; comparați ‖xQR − xHouseholder‖₂')}</li>
          <li>{t('Display errors: ‖Ainit·xHouseholder − binit‖₂ and ‖xHouseholder − s‖₂/‖s‖₂', 'Afișați erorile: ‖Ainit·xHouseholder − binit‖₂ și ‖xHouseholder − s‖₂/‖s‖₂')}</li>
          <li>{t('Compute matrix inverse A⁻¹ via QR and compare with library inverse', 'Calculați inversa A⁻¹ prin QR și comparați cu cea din bibliotecă')}</li>
          <li>{t('Support random initialization for testing with any dimension n', 'Suportați inițializare aleatoare pentru testare cu orice dimensiune n')}</li>
        </ul>
      </Section>

      <Section
        title={t('2. Householder QR algorithm', '2. Algoritmul QR Householder')}
        id="alo-t4-qr"
        checked={!!checked['alo-t4-qr']}
        onCheck={() => toggleCheck('alo-t4-qr')}
      >
        <p>
          {t(
            'The Householder algorithm applies n−1 reflection matrices Pᵣ (one per column) to reduce A to upper-triangular R, while accumulating Q.',
            'Algoritmul Householder aplică n−1 matrice de reflexie Pᵣ (câte una pe coloană) pentru a reduce A la forma superior triunghiulară R, acumulând Q.'
          )}
        </p>
        <Code>{`Q = I_n
for r = 1 to n-1:
    // Build reflection Pr = I - (1/β)uu^T
    σ = sum(a[i][r]^2, i=r+1..n)
    if σ <= ε: continue  // column already in Hessenberg form
    k = sqrt(σ)
    if a[r+1][r] > 0: k = -k
    β = σ - k * a[r+1][r]
    u[r+1] = a[r+1][r] - k
    u[i] = a[i][r], for i = r+2..n

    // A = Pr * A  (transform columns r+1..n)
    for j = r+1 to n:
        γ = (dot(u[r+1..n], a[r+1..n][j])) / β
        a[i][j] -= γ * u[i], for i = r+1..n
    a[r+1][r] = k; a[i][r] = 0, for i = r+2..n

    // A = A * Pr  (transform rows 1..n)
    for i = 1 to n:
        γ = (dot(u[r+1..n], a[i][r+1..n])) / β
        a[i][j] -= γ * u[j], for j = r+1..n

    // Q = Q * Pr
    for i = 1 to n:
        γ = (dot(u[r+1..n], q[i][r+1..n])) / β
        q[i][j] -= γ * u[j], for j = r+1..n`}</Code>
        <Toggle
          question={t('Solving Ax = b via QR', 'Rezolvarea Ax = b prin QR')}
          answer={t(
            'After QR: A = QR (R is in the matrix A after algorithm, Qᵀ is in Q). Solve Rx = Qᵀb by back substitution. Steps: (1) compute c = Qᵀb; (2) back-substitute Rx = c. Check: |rii| < ε means A is singular.',
            'După QR: A = QR (R se află în matricea A după algoritm, Qᵀ în Q). Rezolvați Rx = Qᵀb prin substituție inversă. Pași: (1) calculați c = Qᵀb; (2) substituție inversă Rx = c. Verificare: |rii| < ε înseamnă A singulară.'
          )}
        />
      </Section>

      <Section
        title={t('3. Matrix inverse via QR', '3. Inversa matricei prin QR')}
        id="alo-t4-inv"
        checked={!!checked['alo-t4-inv']}
        onCheck={() => toggleCheck('alo-t4-inv')}
      >
        <p>
          {t(
            'Column j of A⁻¹ is the solution xⱼ of Axⱼ = eⱼ. Use the QR factorization already computed.',
            'Coloana j a lui A⁻¹ este soluția xⱼ a lui Axⱼ = eⱼ. Folosiți factorizarea QR deja calculată.'
          )}
        </p>
        <Box type="definition">
          <p className="text-sm">
            {t(
              'For each j = 1, …, n: (1) set b = Qᵀeⱼ = column j of Qᵀ (= row j of Q); (2) solve Rx = b by back substitution; (3) store x as column j of A⁻¹. Compare with library inverse by displaying ‖A⁻¹Householder − A⁻¹lib‖₁.',
              'Pentru fiecare j = 1, …, n: (1) puneți b = Qᵀeⱼ = coloana j a lui Qᵀ (= linia j a lui Q); (2) rezolvați Rx = b prin substituție inversă; (3) memorați x ca coloana j a lui A⁻¹. Comparați cu inversa din bibliotecă afișând ‖A⁻¹Householder − A⁻¹lib‖₁.'
            )}
          </p>
        </Box>
      </Section>
    </>
  );
}
