/**
 * QR factorization via Givens rotations (in floats — cosines/sines are irrational in general).
 * Emits Step[] for replay. Each step:
 *   { A: number[][], Qt: number[][], rotation?: { col, row, c, s, r }, highlights, label: {en, ro} }
 *
 * After the loop, R = final A and Q = transpose(Qt).
 *
 * @param {number[][]} inputMatrix
 * @returns {{ steps: Step[], Q: number[][], R: number[][], rotations: number }}
 */
export function runGivensQr(inputMatrix) {
  const m = inputMatrix.length;
  const n = inputMatrix[0]?.length ?? 0;
  if (m === 0 || n === 0) {
    return { steps: [], Q: [], R: [], rotations: 0 };
  }

  const A = inputMatrix.map(row => row.slice());
  const Qt = identity(m);
  const steps = [];
  let rotations = 0;

  steps.push({
    A: cloneFloat(A),
    Qt: cloneFloat(Qt),
    highlights: { A: {} },
    label: { en: 'Initial: A; Qᵀ = I', ro: 'Inițial: A; Qᵀ = I' },
  });

  for (let col = 0; col < Math.min(n, m - 1); col++) {
    for (let row = m - 1; row > col; row--) {
      const a = A[col][col];
      const b = A[row][col];
      if (Math.abs(b) < 1e-12) continue;
      const r = Math.hypot(a, b);
      const c = a / r;
      const s = b / r;

      for (let k = 0; k < n; k++) {
        const aTop = A[col][k];
        const aBot = A[row][k];
        A[col][k] = c * aTop + s * aBot;
        A[row][k] = -s * aTop + c * aBot;
      }
      for (let k = 0; k < m; k++) {
        const qTop = Qt[col][k];
        const qBot = Qt[row][k];
        Qt[col][k] = c * qTop + s * qBot;
        Qt[row][k] = -s * qTop + c * qBot;
      }

      rotations++;
      steps.push({
        A: cloneFloat(A),
        Qt: cloneFloat(Qt),
        rotation: { col, row, c, s, r },
        highlights: { A: { rows: [col, row], cells: [[row, col]] } },
        label: {
          en: `G(${col+1},${row+1}): c=${c.toFixed(3)}, s=${s.toFixed(3)}, zero A[${row+1}][${col+1}]`,
          ro: `G(${col+1},${row+1}): c=${c.toFixed(3)}, s=${s.toFixed(3)}, anulează A[${row+1}][${col+1}]`,
        },
      });
    }
  }

  steps.push({
    A: cloneFloat(A),
    Qt: cloneFloat(Qt),
    highlights: { A: { cells: upperTriCells(A) } },
    label: {
      en: `Done — ${rotations} rotation(s). R = A; Q = Qᵀᵀ.`,
      ro: `Gata — ${rotations} rotație/rotații. R = A; Q = Qᵀᵀ.`,
    },
  });

  return { steps, Q: transpose(Qt), R: A, rotations };
}

function identity(n) {
  return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
}
function cloneFloat(M) { return M.map(row => row.slice()); }
function transpose(M) {
  const m = M.length, n = M[0]?.length ?? 0;
  return Array.from({ length: n }, (_, j) => Array.from({ length: m }, (_, i) => M[i][j]));
}
function upperTriCells(M) {
  const out = [];
  for (let i = 0; i < M.length; i++) for (let j = i; j < (M[0]?.length ?? 0); j++) out.push([i, j]);
  return out;
}
