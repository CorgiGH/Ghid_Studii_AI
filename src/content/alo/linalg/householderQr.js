/**
 * QR factorization via Householder reflections (floats).
 * For each column k = 0..min(n, m-1)-1:
 *   x  = A[k..m-1, k]
 *   v  = x ± ‖x‖·e₁   (sign chosen to avoid cancellation: sign = sign(x[0]) || 1)
 *   v  = v / ‖v‖
 *   H  = I − 2 v vᵀ       (applied to rows k..m-1)
 *   A  = H·A
 *   Q  = Q·H
 *
 * Emits Step[] — each step has shape:
 *   { A, Q, reflection?: { col, x, v, normX, sign, vFull }, highlights, label: {en, ro} }
 *
 * `vFull` is v padded with zeros to length m (used by the R3F scene).
 *
 * @param {number[][]} inputMatrix
 * @returns {{ steps: Step[], Q: number[][], R: number[][], reflections: number }}
 */
export function runHouseholderQr(inputMatrix) {
  const m = inputMatrix.length;
  const n = inputMatrix[0]?.length ?? 0;
  if (m === 0 || n === 0) return { steps: [], Q: [], R: [], reflections: 0 };

  const A = inputMatrix.map(row => row.slice());
  const Q = identity(m);
  const steps = [];
  let reflections = 0;

  steps.push({
    A: cloneFloat(A),
    Q: cloneFloat(Q),
    highlights: {},
    label: { en: 'Initial: A; Q = I', ro: 'Inițial: A; Q = I' },
  });

  const limit = Math.min(n, m - 1);
  for (let k = 0; k < limit; k++) {
    // Extract subcolumn x = A[k..m-1, k]
    const x = [];
    for (let i = k; i < m; i++) x.push(A[i][k]);
    const normX = Math.hypot(...x);
    if (normX < 1e-14) continue;

    const sign = x[0] >= 0 ? 1 : -1;
    // v = x + sign(x[0]) * ‖x‖ * e₁
    const v = x.slice();
    v[0] = v[0] + sign * normX;
    const normV = Math.hypot(...v);
    if (normV < 1e-14) continue;
    for (let i = 0; i < v.length; i++) v[i] /= normV;

    // Apply H = I − 2 v vᵀ to A[k..m-1, :]
    for (let j = 0; j < n; j++) {
      let dot = 0;
      for (let i = 0; i < v.length; i++) dot += v[i] * A[k + i][j];
      for (let i = 0; i < v.length; i++) A[k + i][j] -= 2 * v[i] * dot;
    }
    // Apply H on the right to Q: Q = Q · H (cols k..m-1)
    for (let i = 0; i < m; i++) {
      let dot = 0;
      for (let j = 0; j < v.length; j++) dot += v[j] * Q[i][k + j];
      for (let j = 0; j < v.length; j++) Q[i][k + j] -= 2 * v[j] * dot;
    }

    reflections++;
    const vFull = Array.from({ length: m }, (_, i) => (i >= k ? v[i - k] : 0));
    steps.push({
      A: cloneFloat(A),
      Q: cloneFloat(Q),
      reflection: { col: k, x, v, vFull, normX, sign },
      highlights: { A: { rows: rangeArr(k, m - 1), cols: [k] } },
      label: {
        en: `Reflect column ${k + 1}: ‖x‖ = ${normX.toFixed(3)}, v = unit vector with ${v.length} entries`,
        ro: `Reflectăm coloana ${k + 1}: ‖x‖ = ${normX.toFixed(3)}, v = vector unitar cu ${v.length} componente`,
      },
    });
  }

  steps.push({
    A: cloneFloat(A),
    Q: cloneFloat(Q),
    highlights: { A: { cells: upperTriCells(A) } },
    label: {
      en: `Done — ${reflections} reflection(s). R = A; Q accumulated.`,
      ro: `Gata — ${reflections} reflexie/reflexii. R = A; Q acumulat.`,
    },
  });

  return { steps, Q, R: A, reflections };
}

function identity(n) {
  return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
}
function cloneFloat(M) { return M.map(row => row.slice()); }
function rangeArr(lo, hi) {
  const out = [];
  for (let i = lo; i <= hi; i++) out.push(i);
  return out;
}
function upperTriCells(M) {
  const out = [];
  for (let i = 0; i < M.length; i++) for (let j = i; j < (M[0]?.length ?? 0); j++) out.push([i, j]);
  return out;
}
