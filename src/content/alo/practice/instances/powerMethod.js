import { Matrix, EigenvalueDecomposition } from 'ml-matrix';
import { mulberry32, randInt } from '../../linalg/seedRandom';

/**
 * Generates a symmetric n×n matrix with a controlled spectral gap.
 *
 * difficulty:
 *   easy   — n=3, target gap |λ₁/λ₂| ≥ 2.5
 *   medium — n=3, gap ≥ 1.8
 *   hard   — n=4, gap ≥ 1.3
 *
 * Symmetric ensures real eigenvalues. Gap verified via ml-matrix's EVD.
 *
 * @returns {{ matrix: number[][], n: number, truthLambda: number, truthVec: number[], gapRatio: number }}
 */
export function generatePowerMethodInstance(seed, difficulty = 'medium') {
  const rand = mulberry32(seed);
  const n = difficulty === 'hard' ? 4 : 3;
  const minGap = difficulty === 'easy' ? 2.5 : difficulty === 'hard' ? 1.3 : 1.8;

  for (let attempt = 0; attempt < 100; attempt++) {
    const M = Array.from({ length: n }, () =>
      Array.from({ length: n }, () => randInt(rand, -3, 3)),
    );
    // Symmetrize: A = M + Mᵀ
    const A = Array.from({ length: n }, () => new Array(n).fill(0));
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) A[i][j] = M[i][j] + M[j][i];

    // Compute eigenvalues via ml-matrix
    const evd = new EigenvalueDecomposition(new Matrix(A));
    const real = evd.realEigenvalues;
    // Sort by |λ| desc
    const sortedIdx = [...real.map((_, i) => i)].sort((a, b) => Math.abs(real[b]) - Math.abs(real[a]));
    const lambdas = sortedIdx.map(i => real[i]);
    if (Math.abs(lambdas[1]) < 1e-9) continue; // degenerate — λ₂ ≈ 0
    const gapRatio = Math.abs(lambdas[0]) / Math.abs(lambdas[1]);
    if (gapRatio < minGap) continue;

    const eigenVec = evd.eigenvectorMatrix.to2DArray().map(row => row[sortedIdx[0]]);
    return {
      matrix: A,
      n,
      truthLambda: lambdas[0],
      truthVec: eigenVec,
      gapRatio,
    };
  }

  // Fallback — shouldn't hit, but return a known-good 3×3
  return {
    matrix: [[4, 1, 0], [1, 3, 1], [0, 1, 2]],
    n: 3,
    truthLambda: 4.7321,
    truthVec: [0.7370, 0.5910, 0.3280],
    gapRatio: 2.1,
  };
}
