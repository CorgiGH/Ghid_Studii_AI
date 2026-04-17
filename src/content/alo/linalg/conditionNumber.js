import { Matrix, SingularValueDecomposition, solve } from 'ml-matrix';

/**
 * Compute the 2-norm condition number κ₂(A) = σ_max / σ_min via SVD.
 *
 * @param {number[][]} A square matrix
 * @returns {{ kappa: number, sigmaMax: number, sigmaMin: number, singular: boolean }}
 */
export function computeConditionNumber(A) {
  const M = new Matrix(A);
  const svd = new SingularValueDecomposition(M);
  const sigmas = svd.diagonal;
  if (sigmas.length === 0) {
    return { kappa: Infinity, sigmaMax: 0, sigmaMin: 0, singular: true };
  }
  const sigmaMax = sigmas[0];
  const sigmaMin = sigmas[sigmas.length - 1];
  const singular = sigmaMin < 1e-14 * Math.max(sigmaMax, 1);
  const kappa = singular ? Infinity : sigmaMax / sigmaMin;
  return { kappa, sigmaMax, sigmaMin, singular };
}

/**
 * Solve Ax = b via ml-matrix's `solve` (LU-based).
 *
 * @param {number[][]} A
 * @param {number[]}   b
 * @returns {number[]} x
 */
export function solveLinearSystem(A, b) {
  const M = new Matrix(A);
  const bMat = Matrix.columnVector(b);
  const xMat = solve(M, bMat);
  return xMat.to1DArray();
}

/**
 * For a given perturbation Δb, compute:
 *   x          = A⁻¹·b
 *   xPerturbed = A⁻¹·(b + Δb)
 *   Δx         = xPerturbed − x
 *   ratio      = (‖Δx‖₂ / ‖x‖₂) / (‖Δb‖₂ / ‖b‖₂)
 *
 * The ratio is bounded above by κ₂(A); when Δb is aligned with the worst right-singular vector
 * the bound is achieved.
 *
 * @returns {{ x, xPerturbed, deltaX, ratio, signFlip }}
 *   `signFlip` is true if any component of x flips sign between the unperturbed and perturbed solutions.
 */
export function relativeAmplification(A, b, deltaB) {
  const x = solveLinearSystem(A, b);
  const bPerturbed = b.map((v, i) => v + (deltaB?.[i] ?? 0));
  const xPerturbed = solveLinearSystem(A, bPerturbed);
  const deltaX = x.map((v, i) => xPerturbed[i] - v);

  const normX = norm2(x);
  const normB = norm2(b);
  const normDx = norm2(deltaX);
  const normDb = norm2(deltaB ?? b.map(() => 0));

  let ratio = NaN;
  if (normX > 0 && normB > 0 && normDb > 0) {
    ratio = (normDx / normX) / (normDb / normB);
  }

  const signFlip = x.some((v, i) => v !== 0 && xPerturbed[i] !== 0 && Math.sign(v) !== Math.sign(xPerturbed[i]));

  return { x, xPerturbed, deltaX, ratio, signFlip };
}

function norm2(v) {
  let s = 0;
  for (let i = 0; i < v.length; i++) s += v[i] * v[i];
  return Math.sqrt(s);
}
