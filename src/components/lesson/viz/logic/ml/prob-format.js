// How the ML widgets print numbers, so a caption and a drawn mark never disagree: both come from these functions.
// A probability is an exact Fraction. In 'decimal' mode a terminating one prints as a decimal (0,4), any other as n/d (3/7);
// in 'fraction' mode every non-integer prints as n/d. Romanian uses the decimal comma; the minus is the real minus sign.
import Fraction from '../../../../../ml/calc/fraction.js';

export const MINUS = '−';
const sep = (s, lang) => (lang === 'ro' ? s.replace('.', ',') : s);
const neg = (s) => s.replace('-', MINUS);

export const toFrac = (x) => (x instanceof Fraction ? x : Fraction.from(x));

// k when d = 2^a * 5^b (k = max(a, b)), else -1.
function decimalPlaces(d) {
  let a = 0, b = 0;
  let x = d;
  while (x % 2n === 0n) { x /= 2n; a += 1; }
  while (x % 5n === 0n) { x /= 5n; b += 1; }
  return x === 1n ? Math.max(a, b) : -1;
}

export const terminates = (f) => { const k = decimalPlaces(toFrac(f).d); return k >= 0 && k <= 6; };

// 'fraction' | 'decimal' for a whole widget: decimal only when every given probability terminates.
export function pickMode(format, fracs) {
  if (format === 'fraction' || format === 'decimal') return format;
  return fracs.every(terminates) ? 'decimal' : 'fraction';
}

export function fmtFrac(x, lang, mode = 'decimal') {
  const f = toFrac(x);
  if (f.isInteger()) return neg(f.toString());
  const k = decimalPlaces(f.d);
  if (mode === 'decimal' && k >= 0 && k <= 6) {
    const scaled = f.abs().mul(new Fraction(10n ** BigInt(k))).n; // exact integer
    let s = scaled.toString().padStart(k + 1, '0');
    s = `${s.slice(0, s.length - k)}.${s.slice(s.length - k)}`;
    return sep(`${f.sign() < 0 ? '-' : ''}${s}`, lang).replace('-', MINUS);
  }
  return neg(f.toString());
}

// A bilingual pair for one number.
export const disp = (x, mode = 'decimal') => ({ en: fmtFrac(x, 'en', mode), ro: fmtFrac(x, 'ro', mode) });

// A float with a fixed number of decimals; whole numbers print without any (the bars say 1, not 1.0000).
export function fmtNum(x, lang, digits = 2) {
  const r = Math.round(x);
  if (Math.abs(x - r) < 1e-12) return neg(String(r === 0 ? 0 : r));
  return neg(sep(x.toFixed(digits), lang));
}
export const dispNum = (x, digits = 2) => ({ en: fmtNum(x, 'en', digits), ro: fmtNum(x, 'ro', digits) });

// Entropy values: 4 decimals, as the lessons print them.
export const bits = (x) => dispNum(x, 4);

// A list in a caption: Romanian writes the decimal comma, so a list whose items hold one ("0,1, 0,4") is joined with "; ".
export const joinList = (items, lang) => (lang === 'ro' && items.some((s) => /\d,\d/.test(s)) ? items.join('; ') : items.join(', '));

// A caption (or any text) that differs only by the number format: build it once per language.
export const both = (fn) => ({ en: fn('en'), ro: fn('ro') });
// Pick the language of a disp pair inside a builder.
export const pick = (d, lang) => d[lang];
