import { mulberry32, randInt } from '../../linalg/seedRandom';
import { optimalOmegaEstimate } from '../../linalg/iterativeSolvers';

/**
 * Generates strictly diagonally-dominant A (ensures convergence for all three methods)
 * plus a random b.
 *
 * difficulty:
 *   easy   — n=3, dominance margin ≥ 3
 *   medium — n=4, dominance margin ≥ 2
 *   hard   — n=5, dominance margin = 1
 *
 * @returns {{ matrix, b, n, optimalOmega }}
 */
export function generateIterativeSolversInstance(seed, difficulty = 'medium') {
  const rand = mulberry32(seed);
  const n = difficulty === 'easy' ? 3 : (difficulty === 'hard' ? 5 : 4);
  const margin = difficulty === 'easy' ? 3 : (difficulty === 'hard' ? 1 : 2);

  const A = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    let rowAbsSum = 0;
    for (let j = 0; j < n; j++) {
      if (i !== j) {
        A[i][j] = randInt(rand, -3, 3);
        rowAbsSum += Math.abs(A[i][j]);
      }
    }
    // Diagonal: at least rowAbsSum + margin in magnitude
    const sign = rand() < 0.5 ? -1 : 1;
    A[i][i] = sign * (rowAbsSum + margin + randInt(rand, 0, 2));
    if (A[i][i] === 0) A[i][i] = rowAbsSum + margin; // paranoia
  }

  const b = Array.from({ length: n }, () => randInt(rand, -5, 5));

  return { matrix: A, b, n, optimalOmega: optimalOmegaEstimate(A) };
}
