// Number text for the probability widgets (omega, freq-tree, indep-2x2). Pure. A value is formatted from a Fraction;
// the canonical text uses a dot ("0.0917"), and loc() turns it into the Romanian comma for display. Marks carry the
// canonical text in data-value, captions carry the localised one, and the tests compare the two after normalising.
import Fraction from '../../../../../ml/calc/fraction.js';

const NBSP = '\u00a0';

// A Fraction whose denominator has only the factors 2 and 5 is a finite decimal.
function decimalPlaces(f) {
  let d = f.d;
  let twos = 0;
  let fives = 0;
  while (d % 2n === 0n) { d /= 2n; twos += 1; }
  while (d % 5n === 0n) { d /= 5n; fives += 1; }
  return d === 1n ? Math.max(twos, fives) : null;
}

// dec(1/100) -> '0.01'; dec(90/981) -> '0.0917' (rounded to 4 places); dec(1/2) -> '0.5'; dec(3) -> '3'.
export function dec(f, places = 4) {
  f = Fraction.from(f);
  const exactPlaces = decimalPlaces(f);
  const p = exactPlaces !== null && exactPlaces <= 6 ? exactPlaces : places;
  const neg = f.n < 0n;
  const a = neg ? -f.n : f.n;
  const scale = 10n ** BigInt(p);
  let q = (a * scale * 2n + f.d) / (f.d * 2n); // round half up
  let s = q.toString().padStart(p + 1, '0');
  if (p > 0) s = `${s.slice(0, -p)}.${s.slice(-p)}`;
  if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, '');
  return (neg && q !== 0n ? '-' : '') + s;
}

// A decimal text in the learner's language: Romanian writes the comma.
export const loc = (text, lang) => (lang === 'ro' ? String(text).replace('.', ',') : String(text));

// 10000 -> '10 000' (a non-breaking space), 9009 -> '9 009', 100 -> '100'.
export function group(n) {
  const s = String(n);
  return s.length > 3 ? s.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP) : s;
}

// A list in a caption: Romanian writes the decimal comma, so a list whose items hold one ("0,1, 0,4") is joined with "; ".
export const joinList = (items, lang) => (lang === 'ro' && items.some((s) => /\d,\d/.test(s)) ? items.join('; ') : items.join(', '));

// Both languages for a decimal value.
export const decBi = (f, places) => { const t = dec(f, places); return { en: t, ro: loc(t, 'ro') }; };

// 90/981, kept unreduced when the widget shows counts (the learner sees 90 of 981).
export const ratio = (a, b) => `${a}/${b}`;

// Every number token of a caption, canonical: thousands spaces removed, the decimal comma turned into a dot.
export function numberTokens(text) {
  const t = String(text).replace(/(\d)\u00a0(?=\d{3}\b)/g, '$1').replace(/(\d),(\d)/g, '$1.$2');
  return t.match(/\d+\/\d+|\d+(?:\.\d+)?/g) || [];
}
