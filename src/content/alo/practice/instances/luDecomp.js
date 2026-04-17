import { mulberry32, randInt } from '../../linalg/seedRandom';
import { runLuDecomp } from '../../linalg/luDecomp';

/**
 * @returns {{ matrix: number[][], n: number, defaultVariant: 'doolittle' | 'crout' }}
 *
 * Guarantees the random matrix is LU-decomposable for the chosen variant
 * (no zero pivots) by retrying up to 50 times with fresh entries.
 */
export function generateLuDecompInstance(seed, difficulty = 'medium') {
  const rand = mulberry32(seed);
  const n = difficulty === 'easy' ? 3 : difficulty === 'hard' ? 4 : 3;
  const range = difficulty === 'hard' ? 5 : 4;
  const defaultVariant = rand() < 0.5 ? 'doolittle' : 'crout';

  let matrix;
  for (let attempt = 0; attempt < 50; attempt++) {
    matrix = Array.from({ length: n }, () =>
      Array.from({ length: n }, () => randInt(rand, -range, range)),
    );
    if (matrix[0][0] === 0) matrix[0][0] = 1;
    const { success } = runLuDecomp(matrix, { variant: defaultVariant });
    if (success) break;
  }

  return { matrix, n, defaultVariant };
}
