import { mulberry32, randInt, pick } from '../../linalg/seedRandom';

const SPECIAL_FORMS = ['random', 'symmetric', 'upperTri', 'lowerTri', 'diagonal'];

/**
 * @returns {{
 *   matrix: number[][],
 *   m: number,
 *   n: number,
 *   form: 'random'|'symmetric'|'upperTri'|'lowerTri'|'diagonal',
 *   correctProperties: string[]
 * }}
 */
export function generateMatrixInputInstance(seed, difficulty = 'medium') {
  const rand = mulberry32(seed);
  const maxDim = difficulty === 'easy' ? 3 : difficulty === 'hard' ? 5 : 4;
  const minDim = 2;
  const isSquare = rand() < 0.6;
  const m = randInt(rand, minDim, maxDim);
  const n = isSquare ? m : randInt(rand, minDim, maxDim);
  const form = isSquare ? pick(rand, SPECIAL_FORMS) : 'random';

  const matrix = Array.from({ length: m }, () => Array(n).fill(0));
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (form === 'upperTri' && j < i) { matrix[i][j] = 0; continue; }
      if (form === 'lowerTri' && j > i) { matrix[i][j] = 0; continue; }
      if (form === 'diagonal' && i !== j) { matrix[i][j] = 0; continue; }
      matrix[i][j] = randInt(rand, -9, 9);
    }
  }
  if (form === 'symmetric') {
    for (let i = 0; i < m; i++) for (let j = i + 1; j < n; j++) matrix[j][i] = matrix[i][j];
  }

  const correctProperties = [];
  if (form === 'symmetric') correctProperties.push('symmetric');
  if (form === 'upperTri' || form === 'diagonal') correctProperties.push('upperTriangular');
  if (form === 'lowerTri' || form === 'diagonal') correctProperties.push('lowerTriangular');
  if (form === 'diagonal') correctProperties.push('diagonal');
  if (m === n) correctProperties.push('square');

  return { matrix, m, n, form, correctProperties };
}
