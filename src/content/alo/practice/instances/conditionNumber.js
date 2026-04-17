import { mulberry32, randInt, pick } from '../../linalg/seedRandom';
import { computeConditionNumber } from '../../linalg/conditionNumber';

/**
 * Returns a problem instance for W10:
 *   { matrix, n, b, family, kappaTrue, isHilbert }
 *
 * Difficulty controls the κ band:
 *   easy   — κ ∈ [1, 10²]      (well-conditioned)
 *   medium — κ ∈ [10², 10⁶]    (moderately ill-conditioned)
 *   hard   — κ ∈ [10⁶, 10¹²]   (severely ill-conditioned, e.g. Hilbert 5+)
 *
 * Families: 'identity-scaled', 'random', 'vandermonde', 'hilbert'.
 * Hilbert is forced for ~30% of medium/hard instances so the `hilbert-spotter` feat is reachable.
 */
export function generateConditionNumberInstance(seed, difficulty = 'medium') {
  const rand = mulberry32(seed);

  const wantHilbert = difficulty !== 'easy' && rand() < 0.3;
  const candidatesEasy = ['identity-scaled', 'random'];
  const candidatesMed = ['random', 'vandermonde', 'hilbert'];
  const candidatesHard = ['vandermonde', 'hilbert'];

  for (let attempt = 0; attempt < 60; attempt++) {
    const family = wantHilbert
      ? 'hilbert'
      : difficulty === 'easy'
        ? pick(rand, candidatesEasy)
        : difficulty === 'hard'
          ? pick(rand, candidatesHard)
          : pick(rand, candidatesMed);
    const n = pickSize(rand, family, difficulty);
    const matrix = buildMatrix(rand, family, n);
    const { kappa, singular } = computeConditionNumber(matrix);
    if (singular) continue;
    if (!withinBand(kappa, difficulty)) continue;

    const b = Array.from({ length: n }, () => randInt(rand, -3, 3) || 1);
    return {
      matrix,
      n,
      b,
      family,
      kappaTrue: kappa,
      isHilbert: family === 'hilbert',
    };
  }

  // Fallback: Hilbert 4 always exists and is moderately ill-conditioned.
  const fallback = buildMatrix(rand, 'hilbert', 4);
  return {
    matrix: fallback,
    n: 4,
    b: [1, 1, 1, 1],
    family: 'hilbert',
    kappaTrue: computeConditionNumber(fallback).kappa,
    isHilbert: true,
  };
}

function pickSize(rand, family, difficulty) {
  if (family === 'hilbert') return difficulty === 'hard' ? 5 : difficulty === 'medium' ? 4 : 3;
  if (family === 'vandermonde') return difficulty === 'hard' ? 5 : 4;
  return difficulty === 'hard' ? 4 : 3;
}

function buildMatrix(rand, family, n) {
  if (family === 'hilbert') {
    return Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (_, j) => 1 / (i + j + 1)),
    );
  }
  if (family === 'vandermonde') {
    const xs = Array.from({ length: n }, (_, i) => 1 + i * 0.5);
    return Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (_, j) => Math.pow(xs[i], j)),
    );
  }
  if (family === 'identity-scaled') {
    const scale = randInt(rand, 1, 4);
    return Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (_, j) => (i === j ? scale : 0)),
    );
  }
  // random
  return Array.from({ length: n }, () =>
    Array.from({ length: n }, () => randInt(rand, -4, 4)),
  );
}

function withinBand(kappa, difficulty) {
  if (!Number.isFinite(kappa)) return false;
  if (difficulty === 'easy') return kappa >= 1 && kappa < 1e2;
  if (difficulty === 'medium') return kappa >= 1e2 && kappa < 1e6;
  return kappa >= 1e6 && kappa < 1e12;
}
