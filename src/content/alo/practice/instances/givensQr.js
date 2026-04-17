import { mulberry32, randInt, pick } from '../../linalg/seedRandom';

/**
 * Hand-curated seeds yielding (c,s) pairs that include "nice" values
 * (0, ±1, ±1/√2, ±3/5, ±4/5) where possible.
 * @returns {{ matrix: number[][], n: number }}
 */
export function generateGivensQrInstance(seed, difficulty = 'medium') {
  const rand = mulberry32(seed);
  const n = difficulty === 'easy' ? 3 : 4;
  const range = 5;

  const curated3 = [
    [[3, 0, 1], [4, 5, 2], [0, 0, 7]],
    [[1, 2, 3], [1, 1, 4], [0, 1, 5]],
    [[5, 0, 0], [0, 12, 5], [0, 0, 13]],
    [[2, 1, 0], [2, 3, 1], [1, 0, 4]],
  ];
  const curated4 = [
    [[3, 0, 1, 0], [4, 5, 2, 1], [0, 0, 7, 0], [0, 0, 0, 9]],
    [[1, 2, 0, 0], [3, 4, 1, 0], [0, 0, 5, 0], [0, 0, 12, 13]],
  ];

  const useCurated = rand() < 0.6;
  let matrix;
  if (useCurated) {
    matrix = (n === 3 ? pick(rand, curated3) : pick(rand, curated4)).map(row => row.slice());
  } else {
    matrix = Array.from({ length: n }, () =>
      Array.from({ length: n }, () => randInt(rand, -range, range)),
    );
    if (matrix[0][0] === 0) matrix[0][0] = 1;
  }

  return { matrix, n };
}
