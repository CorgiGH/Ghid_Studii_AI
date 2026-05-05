import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Toggle, Section } from '../../../components/ui';

export default function T3() {
  const { t, checked, toggleCheck } = useApp();
  return (
    <>
      <p className="mb-3 text-sm opacity-80">
        {t(
          'Source: ALO Lab Theme 3 — LU decomposition and solving linear systems, UAIC 2026.',
          'Sursă: ALO Tema 3 — Descompunerea LU și rezolvarea sistemelor liniare, UAIC 2026.'
        )}
      </p>

      <Section
        title={t('1. Task overview', '1. Prezentarea sarcinilor')}
        id="alo-t3-overview"
        checked={!!checked['alo-t3-overview']}
        onCheck={() => toggleCheck('alo-t3-overview')}
      >
        <p className="mb-2">
          {t(
            'Given: n (dimension), ε (precision), square matrix A ∈ ℝⁿˣⁿ, vector b ∈ ℝⁿ. Tasks:',
            'Date: n (dimensiunea), ε (precizia), matricea A ∈ ℝⁿˣⁿ, vectorul b ∈ ℝⁿ. Sarcini:'
          )}
        </p>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li>{t('Compute LU decomposition of A (if possible)', 'Calculați descompunerea LU a lui A (dacă este posibil)')}</li>
          <li>{t('Compute det(A) = det(L)·det(U) efficiently', 'Calculați det(A) = det(L)·det(U) eficient')}</li>
          <li>{t('Solve Ax = b using forward/back substitution via LU', 'Rezolvați Ax = b prin substituție directă/inversă cu LU')}</li>
          <li>{t('Verify: ‖Ainit·xLU − binit‖₂ < 10⁻⁸', 'Verificați: ‖Ainit·xLU − binit‖₂ < 10⁻⁸')}</li>
          <li>{t('Compare with library solution; display ‖xLU − xlib‖₂', 'Comparați cu soluția din bibliotecă; afișați ‖xLU − xlib‖₂')}</li>
        </ul>
        <Box type="warning">
          <p className="text-sm">
            {t(
              'Memory constraint: allocate only two matrices — A (modified in-place for LU) and Ainit (original copy). The diagonal of L (all 1s) is NOT stored.',
              'Restricție de memorie: alocați doar două matrice — A (modificată in-place pentru LU) și Ainit (copia originală). Diagonala lui L (toți 1) NU se memorează.'
            )}
          </p>
        </Box>
      </Section>

      <Section
        title={t('2. LU Decomposition — Doolittle algorithm', '2. Descompunerea LU — algoritmul Doolittle')}
        id="alo-t3-lu"
        checked={!!checked['alo-t3-lu']}
        onCheck={() => toggleCheck('alo-t3-lu')}
      >
        <p>
          {t(
            'At each step p = 1, …, n compute simultaneously one row of U and one column of L, stored directly in A.',
            'La fiecare pas p = 1, …, n calculați simultan o linie din U și o coloană din L, memorate direct în A.'
          )}
        </p>
        <Code>{`// Doolittle LU decomposition (in-place)
for p = 1 to n:
    // Row p of U
    for i = p to n:
        u[p][i] = a[p][i] - sum(l[p][k]*u[k][i], k=1..p-1)
    if |u[p][p]| <= ε: STOP  // singular, det(Ap) = 0
    // Column p of L
    for i = p+1 to n:
        l[i][p] = (a[i][p] - sum(l[i][k]*u[k][p], k=1..p-1)) / u[p][p]`}</Code>
        <Toggle
          question={t('Example', 'Exemplu')}
          answer={t(
            'A = [[2.5, 2, 2], [5, 6, 5], [5, 6, 6.5]] decomposes as:\nL = [[1,0,0],[2,1,0],[2,1,1]]\nU = [[2.5,2,2],[0,2,1],[0,0,1.5]]\nSolution of Ax = (2,2,2)ᵀ: x = (1.6, -1, 0)ᵀ.',
            'A = [[2.5, 2, 2], [5, 6, 5], [5, 6, 6.5]] se descompune ca:\nL = [[1,0,0],[2,1,0],[2,1,1]]\nU = [[2.5,2,2],[0,2,1],[0,0,1.5]]\nSoluția lui Ax = (2,2,2)ᵀ: x = (1.6, -1, 0)ᵀ.'
          )}
        />
      </Section>

      <Section
        title={t('3. Forward and back substitution', '3. Substituția directă și inversă')}
        id="alo-t3-subst"
        checked={!!checked['alo-t3-subst']}
        onCheck={() => toggleCheck('alo-t3-subst')}
      >
        <p>
          {t(
            'Solving Ax = b reduces to two triangular systems: first Ly = b (forward), then Ux = y (back).',
            'Rezolvarea Ax = b se reduce la două sisteme triunghiulare: mai întâi Ly = b (directă), apoi Ux = y (inversă).'
          )}
        </p>
        <Box type="formula">
          <p className="font-bold mb-1 text-sm">{t('Forward substitution (L has 1s on diagonal)', 'Substituție directă (L are 1 pe diagonală)')}</p>
          <p className="font-mono text-sm">xᵢ = bᵢ − Σⱼ₌₁ⁱ⁻¹ aᵢⱼxⱼ, i = 1, …, n</p>
          <p className="font-bold mt-2 mb-1 text-sm">{t('Back substitution', 'Substituție inversă')}</p>
          <p className="font-mono text-sm">xᵢ = (bᵢ − Σⱼ₌ᵢ₊₁ⁿ aᵢⱼxⱼ) / aᵢᵢ, i = n, n−1, …, 1</p>
        </Box>
      </Section>
    </>
  );
}
