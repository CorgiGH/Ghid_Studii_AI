import { toFraction, matrixToFractions, formatFraction } from './fractions';

/**
 * LU decomposition (Doolittle or Crout) over exact rationals.
 * Emits Step[] for replay. Each step has shape:
 *   { L: Fraction[][], U: Fraction[][], highlights: { L?, U? }, label: {en, ro} }
 *
 * @param {number[][] | Fraction[][]} inputMatrix  square n×n matrix
 * @param {object} options
 * @param {'doolittle'|'crout'} options.variant
 * @returns {{ steps: Step[], L: Fraction[][], U: Fraction[][], success: boolean, ops: { divisions: number } }}
 */
export function runLuDecomp(inputMatrix, { variant = 'doolittle' } = {}) {
  const A = matrixToFractions(inputMatrix);
  const n = A.length;
  if (n === 0 || A[0].length !== n) {
    throw new Error('LU decomposition requires a square matrix');
  }

  const L = empty(n);
  const U = empty(n);
  const steps = [];
  let divisions = 0;

  if (variant === 'doolittle') {
    for (let i = 0; i < n; i++) L[i][i] = toFraction(1);
  } else {
    for (let i = 0; i < n; i++) U[i][i] = toFraction(1);
  }

  steps.push({
    L: cloneFrac(L),
    U: cloneFrac(U),
    highlights: {},
    label: {
      en: variant === 'doolittle'
        ? 'Initial — Doolittle (L diagonal = 1)'
        : 'Initial — Crout (U diagonal = 1)',
      ro: variant === 'doolittle'
        ? 'Inițial — Doolittle (diagonala L = 1)'
        : 'Inițial — Crout (diagonala U = 1)',
    },
  });

  for (let k = 0; k < n; k++) {
    if (variant === 'doolittle') {
      for (let j = k; j < n; j++) {
        let sum = toFraction(0);
        for (let p = 0; p < k; p++) sum = sum.add(L[k][p].mul(U[p][j]));
        U[k][j] = A[k][j].sub(sum);
        steps.push({
          L: cloneFrac(L), U: cloneFrac(U),
          highlights: { U: { cells: [[k, j]] }, L: { rows: [k] } },
          label: {
            en: `U[${k+1}][${j+1}] = A[${k+1}][${j+1}] − Σ L[${k+1}][p]·U[p][${j+1}] = ${formatFraction(U[k][j])}`,
            ro: `U[${k+1}][${j+1}] = A[${k+1}][${j+1}] − Σ L[${k+1}][p]·U[p][${j+1}] = ${formatFraction(U[k][j])}`,
          },
        });
      }
      if (U[k][k].equals(0)) return failStep(steps, L, U, k, 'U', divisions);
      for (let i = k + 1; i < n; i++) {
        let sum = toFraction(0);
        for (let p = 0; p < k; p++) sum = sum.add(L[i][p].mul(U[p][k]));
        L[i][k] = A[i][k].sub(sum).div(U[k][k]);
        divisions++;
        steps.push({
          L: cloneFrac(L), U: cloneFrac(U),
          highlights: { L: { cells: [[i, k]] }, U: { cells: [[k, k]] } },
          label: {
            en: `L[${i+1}][${k+1}] = (A[${i+1}][${k+1}] − Σ L[${i+1}][p]·U[p][${k+1}]) / U[${k+1}][${k+1}] = ${formatFraction(L[i][k])}`,
            ro: `L[${i+1}][${k+1}] = (A[${i+1}][${k+1}] − Σ L[${i+1}][p]·U[p][${k+1}]) / U[${k+1}][${k+1}] = ${formatFraction(L[i][k])}`,
          },
        });
      }
    } else {
      for (let i = k; i < n; i++) {
        let sum = toFraction(0);
        for (let p = 0; p < k; p++) sum = sum.add(L[i][p].mul(U[p][k]));
        L[i][k] = A[i][k].sub(sum);
        steps.push({
          L: cloneFrac(L), U: cloneFrac(U),
          highlights: { L: { cells: [[i, k]] }, U: { rows: [k] } },
          label: {
            en: `L[${i+1}][${k+1}] = A[${i+1}][${k+1}] − Σ L[${i+1}][p]·U[p][${k+1}] = ${formatFraction(L[i][k])}`,
            ro: `L[${i+1}][${k+1}] = A[${i+1}][${k+1}] − Σ L[${i+1}][p]·U[p][${k+1}] = ${formatFraction(L[i][k])}`,
          },
        });
      }
      if (L[k][k].equals(0)) return failStep(steps, L, U, k, 'L', divisions);
      for (let j = k + 1; j < n; j++) {
        let sum = toFraction(0);
        for (let p = 0; p < k; p++) sum = sum.add(L[k][p].mul(U[p][j]));
        U[k][j] = A[k][j].sub(sum).div(L[k][k]);
        divisions++;
        steps.push({
          L: cloneFrac(L), U: cloneFrac(U),
          highlights: { U: { cells: [[k, j]] }, L: { cells: [[k, k]] } },
          label: {
            en: `U[${k+1}][${j+1}] = (A[${k+1}][${j+1}] − Σ L[${k+1}][p]·U[p][${j+1}]) / L[${k+1}][${k+1}] = ${formatFraction(U[k][j])}`,
            ro: `U[${k+1}][${j+1}] = (A[${k+1}][${j+1}] − Σ L[${k+1}][p]·U[p][${j+1}]) / L[${k+1}][${k+1}] = ${formatFraction(U[k][j])}`,
          },
        });
      }
    }
  }

  steps.push({
    L: cloneFrac(L), U: cloneFrac(U),
    highlights: { L: { cells: diagCells(L) }, U: { cells: diagCells(U) } },
    label: { en: 'A = LU complete', ro: 'A = LU complet' },
  });

  return { steps, L, U, success: true, ops: { divisions } };
}

function failStep(steps, L, U, k, which, divisions) {
  steps.push({
    L: cloneFrac(L), U: cloneFrac(U),
    highlights: { [which]: { cells: [[k, k]] } },
    label: {
      en: `Zero pivot at ${which}[${k+1}][${k+1}] — variant fails without pivoting`,
      ro: `Pivot zero la ${which}[${k+1}][${k+1}] — varianta eșuează fără pivotare`,
    },
  });
  return { steps, L, U, success: false, ops: { divisions } };
}

function empty(n) {
  return Array.from({ length: n }, () => Array.from({ length: n }, () => toFraction(0)));
}
function cloneFrac(M) { return M.map(row => row.map(v => toFraction(v))); }
function diagCells(M) {
  const out = [];
  for (let i = 0; i < M.length; i++) out.push([i, i]);
  return out;
}
