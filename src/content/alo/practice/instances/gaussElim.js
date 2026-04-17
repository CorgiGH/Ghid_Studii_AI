import { mulberry32, randInt } from '../../linalg/seedRandom';

/**
 * @returns {{ matrix: number[][], rows: number, cols: number, requiresPivoting: boolean }}
 */
export function generateGaussElimInstance(seed, difficulty = 'medium') {
  const rand = mulberry32(seed);
  const n = difficulty === 'easy' ? 3 : difficulty === 'hard' ? 5 : 4;
  const cols = n + 1; // augmented matrix [A | b]

  let matrix;
  let attempts = 0;
  while (attempts++ < 100) {
    matrix = Array.from({ length: n }, () =>
      Array.from({ length: cols }, () => randInt(rand, -5, 5))
    );
    // Reject if first column is all zeros (no progress)
    if (matrix.some(row => row[0] !== 0)) break;
  }

  const requiresPivoting = difficulty !== 'easy' && rand() < 0.4;
  if (requiresPivoting && n >= 3) {
    // Swap row 0 to be near-zero in column 0 so partial pivoting would swap
    matrix[0][0] = 0;
    matrix[1][0] = matrix[1][0] || 2;
  }

  return { matrix, rows: n, cols, requiresPivoting };
}
