import { mulberry32, randInt } from '../../linalg/seedRandom';

/**
 * @returns {{ vectors: number[][], dim: number, count: number, isDependent: boolean }}
 *
 * difficulty:
 *   easy    — dim=2, count=2, never dependent
 *   medium  — dim=2 or 3, count=2 or 3, ~20% dependent
 *   hard    — dim=2 or 3, count=2 or 3, ~40% dependent
 */
export function generateGramSchmidtInstance(seed, difficulty = 'medium') {
  const rand = mulberry32(seed);
  const dim = difficulty === 'easy' ? 2 : (rand() < 0.5 ? 2 : 3);
  const count = difficulty === 'easy' ? 2 : (rand() < 0.5 ? 2 : Math.min(dim, 3));
  const dependentChance = difficulty === 'easy' ? 0 : (difficulty === 'hard' ? 0.4 : 0.2);
  const isDependent = count >= 2 && rand() < dependentChance;

  let vectors;
  let attempts = 0;
  do {
    vectors = Array.from({ length: count }, () =>
      Array.from({ length: dim }, () => randInt(rand, -3, 3)),
    );
    if (vectors.some(v => v.every(c => c === 0))) { attempts++; continue; }
    if (isDependent && count >= 2) {
      const scale = randInt(rand, -2, 2) || 2;
      vectors[1] = vectors[0].map(c => c * scale);
    }
    attempts++;
  } while (attempts < 30 && vectors.some(v => v.every(c => c === 0)));

  return { vectors, dim, count, isDependent };
}
