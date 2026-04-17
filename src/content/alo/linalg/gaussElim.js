import { Fraction, toFraction, matrixToFractions, formatFraction, fractionToKatex } from './fractions';

/**
 * Run Gauss elimination (forward phase: to REF) on an integer matrix,
 * emitting a Step[] array for replay.
 *
 * @param {number[][] | Fraction[][]} inputMatrix  m x n augmented matrix
 * @param {object} options
 * @param {'none'|'partial'} options.pivoting  partial = swap to max-|abs| row before eliminate
 * @returns {{ steps: Step[], result: Fraction[][], ops: { adds: number, swaps: number } }}
 */
export function runGaussElim(inputMatrix, { pivoting = 'none' } = {}) {
  const M = matrixToFractions(inputMatrix).map(row => row.slice());
  const m = M.length;
  const n = M[0]?.length ?? 0;
  const steps = [];
  let adds = 0;
  let swaps = 0;

  steps.push({
    matrix: cloneFrac(M),
    highlights: {},
    label: { en: 'Initial matrix', ro: 'Matricea inițială' },
  });

  let pivotRow = 0;
  for (let col = 0; col < n - 1 && pivotRow < m; col++) {
    // Find a row to use as pivot
    let targetRow = pivotRow;
    if (pivoting === 'partial') {
      let maxAbs = M[targetRow][col].abs();
      for (let r = pivotRow + 1; r < m; r++) {
        const a = M[r][col].abs();
        if (a.compare(maxAbs) > 0) { maxAbs = a; targetRow = r; }
      }
    } else {
      while (targetRow < m && M[targetRow][col].equals(0)) targetRow++;
    }
    if (targetRow >= m || M[targetRow][col].equals(0)) continue; // all zero in this column

    if (targetRow !== pivotRow) {
      [M[pivotRow], M[targetRow]] = [M[targetRow], M[pivotRow]];
      swaps++;
      steps.push({
        matrix: cloneFrac(M),
        highlights: { rows: [pivotRow, targetRow] },
        label: {
          en: `Swap R${pivotRow + 1} ↔ R${targetRow + 1}`,
          ro: `Permută R${pivotRow + 1} ↔ R${targetRow + 1}`,
        },
      });
    }

    const pivot = M[pivotRow][col];
    for (let r = pivotRow + 1; r < m; r++) {
      if (M[r][col].equals(0)) continue;
      const mult = M[r][col].div(pivot).neg();
      for (let c = col; c < n; c++) {
        M[r][c] = M[r][c].add(mult.mul(M[pivotRow][c]));
      }
      adds++;
      steps.push({
        matrix: cloneFrac(M),
        highlights: {
          cells: [[pivotRow, col]],
          rows: [pivotRow, r],
        },
        label: {
          en: `R${r + 1} ← R${r + 1} + (${formatFraction(mult)}) · R${pivotRow + 1}`,
          ro: `R${r + 1} ← R${r + 1} + (${formatFraction(mult)}) · R${pivotRow + 1}`,
        },
      });
    }

    pivotRow++;
  }

  steps.push({
    matrix: cloneFrac(M),
    highlights: { cells: diagCells(M) },
    label: { en: 'Row-echelon form reached', ro: 'Forma eșalonată obținută' },
  });

  return { steps, result: M, ops: { adds, swaps } };
}

function cloneFrac(M) {
  return M.map(row => row.map(v => toFraction(v)));
}

function diagCells(M) {
  const cols = M[0]?.length ?? 0;
  const out = [];
  for (let i = 0; i < Math.min(M.length, cols); i++) out.push([i, i]);
  return out;
}

/**
 * Renders a Step's matrix as a KaTeX string (bmatrix) with no highlighting.
 * StepPlayer passes the full Step and renders highlights via CSS overlays.
 */
export function stepToKatex(step) {
  const rows = step.matrix.map(row => row.map(fractionToKatex).join(' & ')).join(' \\\\ ');
  return `\\begin{bmatrix} ${rows} \\end{bmatrix}`;
}
