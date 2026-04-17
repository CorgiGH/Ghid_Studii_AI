/**
 * Power method for the dominant eigenvalue of a square matrix A (floats).
 *
 * xₖ₊₁ = A·xₖ / ‖A·xₖ‖
 * λₖ   = xₖᵀ·A·xₖ / (xₖᵀ·xₖ)    (Rayleigh quotient)
 *
 * Emits Step[] with shape:
 *   { k, x, Ax, lambdaRayleigh, residualLambda, angleToTruth?, highlights, label: {en, ro} }
 * where `residualLambda = |λₖ − λₖ₋₁|` (NaN on k=0).
 *
 * @param {number[][]} A
 * @param {object} options
 * @param {number} options.maxIter   default 30
 * @param {number} options.tol       default 1e-6 (stops when |λₖ − λₖ₋₁| < tol)
 * @param {number[]} [options.truthEigenvector]  for angle-to-truth metric
 * @returns {{ steps: Step[], lambda: number, iterations: number, converged: boolean, finalX: number[] }}
 */
export function runPowerMethod(A, { maxIter = 30, tol = 1e-6, truthEigenvector } = {}) {
  const n = A.length;
  const steps = [];
  let x = Array.from({ length: n }, (_, i) => (i === 0 ? 1 : 0.1)); // deterministic seed
  let prevLambda = NaN;
  let lambda = NaN;
  let iterations = 0;
  let converged = false;

  // Initial step
  {
    const Ax = matVec(A, x);
    lambda = rayleigh(x, Ax);
    steps.push({
      k: 0,
      x: x.slice(),
      Ax: Ax.slice(),
      lambdaRayleigh: lambda,
      residualLambda: NaN,
      angleToTruth: truthEigenvector ? angleBetween(x, truthEigenvector) : null,
      highlights: {},
      label: { en: 'Initial x₀', ro: 'Inițial x₀' },
    });
  }

  for (let k = 1; k <= maxIter; k++) {
    const Ax = matVec(A, x);
    const norm = Math.hypot(...Ax);
    if (norm < 1e-14) break;
    const xNext = Ax.map(c => c / norm);
    prevLambda = lambda;
    lambda = rayleigh(xNext, matVec(A, xNext));
    const residualLambda = Math.abs(lambda - prevLambda);

    steps.push({
      k,
      x: xNext.slice(),
      Ax: Ax.slice(),
      lambdaRayleigh: lambda,
      residualLambda,
      angleToTruth: truthEigenvector ? angleBetween(xNext, truthEigenvector) : null,
      highlights: {},
      label: {
        en: `k=${k}: λ = ${lambda.toFixed(5)}, Δλ = ${residualLambda.toExponential(2)}`,
        ro: `k=${k}: λ = ${lambda.toFixed(5)}, Δλ = ${residualLambda.toExponential(2)}`,
      },
    });

    x = xNext;
    iterations = k;
    if (residualLambda < tol) { converged = true; break; }
  }

  return { steps, lambda, iterations, converged, finalX: x };
}

function matVec(A, x) {
  const n = A.length;
  const out = new Array(n).fill(0);
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) out[i] += A[i][j] * x[j];
  return out;
}
function rayleigh(x, Ax) {
  let top = 0, bot = 0;
  for (let i = 0; i < x.length; i++) { top += x[i] * Ax[i]; bot += x[i] * x[i]; }
  return bot === 0 ? NaN : top / bot;
}
function angleBetween(a, b) {
  const na = Math.hypot(...a), nb = Math.hypot(...b);
  if (na === 0 || nb === 0) return NaN;
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  const cos = Math.min(1, Math.max(-1, Math.abs(dot) / (na * nb))); // abs — direction doesn't matter
  return Math.acos(cos);
}
