// Numbers and captions for the ML widgets. A caption is written once as a template over `L`; the template is run for English
// and for Romanian, so both sides carry the same numbers in the same places (Romanian prints a decimal comma, English a point).
import Fraction from '../../../../../ml/calc/fraction.js';

// 1.2075, 0.5 -> "0.5", 1 -> "1", Infinity -> "∞"; the comma goes in for Romanian.
export function fmtNum(x, digits = 4, lang = 'en') {
  const v = x instanceof Fraction ? x.toNumber() : x;
  if (v === Infinity) return '∞';
  if (v === -Infinity) return '−∞';
  const r = Number(v.toFixed(digits));
  const s = Object.is(r, -0) ? '0' : String(r);
  const plain = s.includes('e') ? v.toFixed(digits) : s;
  const out = plain.startsWith('-') ? `−${plain.slice(1)}` : plain; // the minus sign, not a hyphen
  return lang === 'ro' ? out.replace('.', ',') : out;
}

// A Fraction as the learner reads it: 2/63, or the whole number.
export const fracText = (f) => (f instanceof Fraction ? f.toString() : String(f));

// 2/63 ≈ 0.0317 (a whole number prints alone).
export function fracApprox(f, digits, lang) {
  if (!(f instanceof Fraction)) return fmtNum(f, digits, lang);
  return f.isInteger() ? f.toString() : `${f.toString()} ≈ ${fmtNum(f, digits, lang)}`;
}

const make = (lang) => ({
  lang,
  t: (en, ro) => (lang === 'ro' ? ro : en),
  n: (x, d = 4) => fmtNum(x, d, lang),
  f: fracText,
  fa: (f, d = 4) => fracApprox(f, d, lang),
});
export const L_EN = make('en');
export const L_RO = make('ro');

// bi((L) => `${L.t('Score', 'Scorul')} ${L.n(0.5)}`) -> { en: 'Score 0.5', ro: 'Scorul 0,5' }
export const bi = (tpl) => ({ en: tpl(L_EN), ro: tpl(L_RO) });

// Every number a caption prints, as written in English (the Romanian comma folded to a point), for the tests.
export function numberTokens(text) {
  return (String(text).replace(/(\d),(\d)/g, '$1.$2').match(/\d+(?:\.\d+)?/g) || []);
}

// "a, b and c" / "a, b și c"
export const joinList = (L, xs) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} ${L.t('and', 'și')} ${xs.at(-1)}`);
