import Fraction from 'fraction.js';

export { Fraction };

export function toFraction(v) {
  if (v instanceof Fraction) return v;
  return new Fraction(v);
}

export function matrixToFractions(matrix) {
  return matrix.map(row => row.map(toFraction));
}

export function fractionsToNumbers(matrix) {
  return matrix.map(row => row.map(f => f.valueOf()));
}

export function formatFraction(f, { mode = 'fraction' } = {}) {
  const frac = toFraction(f);
  if (mode === 'decimal') return frac.valueOf().toFixed(3).replace(/\.?0+$/, '');
  if (frac.d === 1n || frac.d === 1) return frac.s * Number(frac.n) + '';
  return `${frac.s * Number(frac.n)}/${Number(frac.d)}`;
}

export function fractionToKatex(f) {
  const frac = toFraction(f);
  if (frac.d === 1n || frac.d === 1) return `${frac.s * Number(frac.n)}`;
  const sign = frac.s < 0 ? '-' : '';
  return `${sign}\\frac{${Number(frac.n)}}{${Number(frac.d)}}`;
}

export function parseFraction(text) {
  const trimmed = String(text).trim();
  if (!trimmed) return null;
  try {
    return new Fraction(trimmed);
  } catch {
    return null;
  }
}
