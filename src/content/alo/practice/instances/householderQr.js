import { mulberry32, randInt, pick } from '../../linalg/seedRandom';

/**
 * @returns {{ matrix: number[][], n: number }}
 *
 * difficulty:
 *   easy   — n=3, small integer entries
 *   medium — n=3, slightly larger entries
 *   hard   — n=4
 *
 * Curated seeds for n=3 so the first column has a "nice" reflection.
 */
export function generateHouseholderQrInstance(seed, difficulty = 'medium') {
  const rand = mulberry32(seed);
  const n = difficulty === 'hard' ? 4 : 3;
  const range = difficulty === 'easy' ? 4 : 6;

  const curated3 = [
    [[12, -51, 4], [6, 167, -68], [-4, 24, -41]],
    [[3, 1, 0], [4, 1, 1], [0, 1, 1]],
    [[1, 2, 3], [2, 1, 4], [-1, 1, 2]],
    [[4, 0, 1], [0, 3, 2], [3, 4, 0]],
  ];

  const useCurated = n === 3 && rand() < 0.5;
  let matrix;
  if (useCurated) {
    matrix = pick(rand, curated3).map(row => row.slice());
  } else {
    matrix = Array.from({ length: n }, () =>
      Array.from({ length: n }, () => randInt(rand, -range, range)),
    );
    // Ensure first column has a nonzero reflection target:
    // If all first-column entries below A[0][0] are 0, force A[1][0] = 1.
    let hasNonzeroBelow = false;
    for (let i = 1; i < n; i++) if (matrix[i][0] !== 0) { hasNonzeroBelow = true; break; }
    if (!hasNonzeroBelow) matrix[1][0] = 1;
  }

  return { matrix, n };
}
