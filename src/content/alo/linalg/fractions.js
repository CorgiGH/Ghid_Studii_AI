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
  const sign = Number(frac.s);
  const num = Number(frac.n);
  const den = Number(frac.d);
  if (den === 1) return `${sign * num}`;
  return `${sign * num}/${den}`;
}

export function fractionToKatex(f) {
  const frac = toFraction(f);
  const sign = Number(frac.s);
  const num = Number(frac.n);
  const den = Number(frac.d);
  if (den === 1) return `${sign * num}`;
  const sgn = sign < 0 ? '-' : '';
  return `${sgn}\\frac{${num}}{${den}}`;
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
