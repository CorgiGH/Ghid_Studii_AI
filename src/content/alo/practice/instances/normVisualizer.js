import { mulberry32, pick } from '../../linalg/seedRandom';

/**
 * Each predicate has:
 *   - id, prompt: {en, ro}
 *   - test(x, y) => boolean  (true when the point satisfies the target)
 *   - optimalDistance(x, y) => number  (0 when exactly optimal)
 *
 * Norms in 2D:
 *   L1(x,y) = |x|+|y|     L2(x,y) = sqrt(x^2+y^2)     Linf(x,y) = max(|x|,|y|)
 */
export const PREDICATES = [
  {
    id: 'l1-boundary',
    prompt: { en: 'Find a point with ‖x‖₁ = 1', ro: 'Găsește un punct cu ‖x‖₁ = 1' },
    test: (x, y) => Math.abs(Math.abs(x) + Math.abs(y) - 1) < 0.02,
    optimalDistance: (x, y) => Math.abs(Math.abs(x) + Math.abs(y) - 1),
  },
  {
    id: 'l2-boundary',
    prompt: { en: 'Find a point with ‖x‖₂ = 1', ro: 'Găsește un punct cu ‖x‖₂ = 1' },
    test: (x, y) => Math.abs(Math.hypot(x, y) - 1) < 0.02,
    optimalDistance: (x, y) => Math.abs(Math.hypot(x, y) - 1),
  },
  {
    id: 'linf-boundary',
    prompt: { en: 'Find a point with ‖x‖∞ = 1', ro: 'Găsește un punct cu ‖x‖∞ = 1' },
    test: (x, y) => Math.abs(Math.max(Math.abs(x), Math.abs(y)) - 1) < 0.02,
    optimalDistance: (x, y) => Math.abs(Math.max(Math.abs(x), Math.abs(y)) - 1),
  },
  {
    id: 'l1-boundary-linf-interior',
    prompt: { en: 'Find a point with ‖x‖₁ = 1 and ‖x‖∞ < 0.6', ro: 'Găsește un punct cu ‖x‖₁ = 1 și ‖x‖∞ < 0.6' },
    test: (x, y) => Math.abs(Math.abs(x) + Math.abs(y) - 1) < 0.02 && Math.max(Math.abs(x), Math.abs(y)) < 0.6,
    optimalDistance: (x, y) => Math.abs(Math.abs(x) + Math.abs(y) - 1) + Math.max(0, Math.max(Math.abs(x), Math.abs(y)) - 0.6),
  },
  {
    id: 'linf-boundary-l1-greater-than-1',
    prompt: { en: 'Find a point with ‖x‖∞ = 1 and ‖x‖₁ > 1.5', ro: 'Găsește un punct cu ‖x‖∞ = 1 și ‖x‖₁ > 1.5' },
    test: (x, y) => Math.abs(Math.max(Math.abs(x), Math.abs(y)) - 1) < 0.02 && Math.abs(x) + Math.abs(y) > 1.5,
    optimalDistance: (x, y) => Math.abs(Math.max(Math.abs(x), Math.abs(y)) - 1) + Math.max(0, 1.5 - (Math.abs(x) + Math.abs(y))),
  },
  {
    id: 'triple-tangent',
    prompt: { en: 'Find a point on ALL three unit boundaries', ro: 'Găsește un punct pe TOATE cele trei margini unitate' },
    test: (x, y) => {
      const l1 = Math.abs(x) + Math.abs(y);
      const l2 = Math.hypot(x, y);
      const linf = Math.max(Math.abs(x), Math.abs(y));
      return Math.abs(l1 - 1) < 0.02 && Math.abs(l2 - 1) < 0.02 && Math.abs(linf - 1) < 0.02;
    },
    optimalDistance: (x, y) => {
      const l1 = Math.abs(x) + Math.abs(y);
      const l2 = Math.hypot(x, y);
      const linf = Math.max(Math.abs(x), Math.abs(y));
      return Math.abs(l1 - 1) + Math.abs(l2 - 1) + Math.abs(linf - 1);
    },
  },
  {
    id: 'l2-boundary-l1-half',
    prompt: { en: 'Find a point with ‖x‖₂ = 1 and ‖x‖₁ = √2', ro: 'Găsește un punct cu ‖x‖₂ = 1 și ‖x‖₁ = √2' },
    test: (x, y) => Math.abs(Math.hypot(x, y) - 1) < 0.02 && Math.abs(Math.abs(x) + Math.abs(y) - Math.SQRT2) < 0.02,
    optimalDistance: (x, y) => Math.abs(Math.hypot(x, y) - 1) + Math.abs(Math.abs(x) + Math.abs(y) - Math.SQRT2),
  },
  {
    id: 'linf-half-l2-tight',
    prompt: { en: 'Find a point with ‖x‖∞ = 0.5 and ‖x‖₂ ≥ 0.5', ro: 'Găsește un punct cu ‖x‖∞ = 0.5 și ‖x‖₂ ≥ 0.5' },
    test: (x, y) => Math.abs(Math.max(Math.abs(x), Math.abs(y)) - 0.5) < 0.02 && Math.hypot(x, y) >= 0.5,
    optimalDistance: (x, y) => Math.abs(Math.max(Math.abs(x), Math.abs(y)) - 0.5) + Math.max(0, 0.5 - Math.hypot(x, y)),
  },
  {
    id: 'l1-corner-exact',
    prompt: { en: 'Hit a corner of the ‖x‖₁ = 1 ball (within ±0.01)', ro: 'Atinge un colț al bilei ‖x‖₁ = 1 (±0.01)' },
    test: (x, y) => {
      const corners = [[1,0],[-1,0],[0,1],[0,-1]];
      return corners.some(([cx, cy]) => Math.hypot(x - cx, y - cy) < 0.01);
    },
    optimalDistance: (x, y) => {
      const corners = [[1,0],[-1,0],[0,1],[0,-1]];
      return Math.min(...corners.map(([cx, cy]) => Math.hypot(x - cx, y - cy)));
    },
  },
  {
    id: 'l1-interior-linf-interior',
    prompt: { en: 'Interior of both ‖x‖₁ < 0.8 and ‖x‖∞ < 0.5', ro: 'Interior al ‖x‖₁ < 0.8 și ‖x‖∞ < 0.5' },
    test: (x, y) => Math.abs(x) + Math.abs(y) < 0.8 && Math.max(Math.abs(x), Math.abs(y)) < 0.5,
    optimalDistance: (x, y) => Math.max(0, Math.abs(x) + Math.abs(y) - 0.8) + Math.max(0, Math.max(Math.abs(x), Math.abs(y)) - 0.5),
  },
  {
    id: 'l2-exact-half',
    prompt: { en: 'Find a point with ‖x‖₂ = 0.5', ro: 'Găsește un punct cu ‖x‖₂ = 0.5' },
    test: (x, y) => Math.abs(Math.hypot(x, y) - 0.5) < 0.02,
    optimalDistance: (x, y) => Math.abs(Math.hypot(x, y) - 0.5),
  },
  {
    id: 'positive-quadrant-linf-boundary',
    prompt: { en: 'Find a positive-quadrant point with ‖x‖∞ = 1 and ‖x‖₁ ∈ [1.2, 1.4]', ro: 'Găsește un punct în cadranul pozitiv cu ‖x‖∞ = 1 și ‖x‖₁ ∈ [1.2, 1.4]' },
    test: (x, y) => x >= 0 && y >= 0 && Math.abs(Math.max(x, y) - 1) < 0.02 && (x + y) >= 1.2 && (x + y) <= 1.4,
    optimalDistance: (x, y) => {
      if (x < 0 || y < 0) return Math.abs(Math.min(0, x)) + Math.abs(Math.min(0, y)) + 1;
      const l1 = x + y;
      return Math.abs(Math.max(x, y) - 1) + Math.max(0, 1.2 - l1) + Math.max(0, l1 - 1.4);
    },
  },
];

export function generateNormVisualizerInstance(seed, difficulty = 'medium') {
  const rand = mulberry32(seed);
  const eligible = difficulty === 'easy' ? PREDICATES.slice(0, 3)
                 : difficulty === 'hard' ? PREDICATES
                 : PREDICATES.slice(0, 9);
  return pick(rand, eligible);
}
