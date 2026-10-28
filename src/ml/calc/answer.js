// Reading and grading what the learner types into a calculation field. Pure, no React: the block, the review tab and the
// content tests all use these functions.
//
// A field is { id, kind: 'num' | 'frac' | 'choice' | 'tf' | 'multi', expected, tol?, options?, accept? }. `expected` is what the learner
// should type; the content test checks that it equals the value of the field's formula (formulaMatches below).

import Fraction from './fraction.js';
import { evaluate, toNumber } from './formula.js';

export const KINDS = ['num', 'frac', 'choice', 'tf', 'multi'];

// Default tolerance: the outline's +-0.0005 below 1 and +-0.001 from 1 up.
export function tolOf(field) {
  if (Number.isFinite(field?.tol) && field.tol > 0) return field.tol;
  const e = Math.abs(toExpectedNumber(field?.expected));
  return e < 1 ? 0.0005 : 0.001;
}

// Case, diacritics and spacing do not matter when a name is typed ("outlook", "Outlook", "OUTLOOK ").
export const norm = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();

const MINUS = /[−–—]/g;
const DECIMAL = /^[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)$/;
const RATIO = /^([+-]?\d+(?:[.,]\d+)?)\s*\/\s*(\d+(?:[.,]\d+)?)$/;

const asDot = (s) => s.replace(',', '.');

// "0,9183", "0.918", ".5", "-1", "9/17" -> a Fraction (exact), or null.
function readExact(text) {
  const s = String(text ?? '').replace(MINUS, '-').replace(/\s+/g, ' ').trim();
  if (!s) return null;
  if (DECIMAL.test(s)) {
    const d = asDot(s).replace(/^([+-]?)\./, '$10.').replace(/\.$/, '');
    return new Fraction(d.replace(/^\+/, ''));
  }
  const m = s.replace(/\s*\/\s*/, '/').match(RATIO);
  if (m) {
    const n = new Fraction(asDot(m[1]).replace(/^\+/, ''));
    const d = new Fraction(asDot(m[2]));
    return d.sign() === 0 ? null : n.div(d);
  }
  return null;
}

const TRUE_WORDS = ['true', 't', 'da', 'yes', 'y', 'adevarat', 'adevarata', '1'];
const FALSE_WORDS = ['false', 'f', 'nu', 'no', 'n', 'fals', 'falsa', '0'];

const optionText = (o) => (typeof o === 'string' ? { en: o, ro: o } : o);

// The option a typed text names (by its en or ro text, ignoring case), or null.
export function matchOption(text, options) {
  const n = norm(text);
  if (!n || !Array.isArray(options)) return null;
  return options.map(optionText).find((o) => norm(o.en) === n || norm(o.ro) === n) || null;
}

const splitMulti = (text) => String(text ?? '').split(/[;,\n]+/).map((x) => x.trim()).filter(Boolean);

// parseAnswer(text, kind, options?) -> { ok, value }
//   num     value is a JS number ("0,9183", "0.918", ".5", "9/17" all read)
//   frac    value is an exact Fraction ("9/17", "18/34", "0.5")
//   choice  value is the chosen option's en text, or the text itself when the field has no options
//   tf      value is true or false
//   multi   value is the sorted list of chosen names
export function parseAnswer(text, kind, options) {
  if (kind === 'num' || kind === 'frac') {
    const f = readExact(text);
    if (!f) return { ok: false, value: null };
    return { ok: true, value: kind === 'frac' ? f : f.toNumber() };
  }
  if (kind === 'choice') {
    const n = norm(text);
    if (!n) return { ok: false, value: null };
    if (Array.isArray(options) && options.length) {
      const o = matchOption(text, options);
      return o ? { ok: true, value: o.en } : { ok: false, value: null };
    }
    return { ok: true, value: String(text).trim() };
  }
  if (kind === 'tf') {
    const n = norm(text);
    if (TRUE_WORDS.includes(n)) return { ok: true, value: true };
    if (FALSE_WORDS.includes(n)) return { ok: true, value: false };
    return { ok: false, value: null };
  }
  if (kind === 'multi') {
    const parts = splitMulti(text);
    if (!parts.length) return { ok: false, value: null };
    if (Array.isArray(options) && options.length) {
      const hits = parts.map((p) => matchOption(p, options));
      if (hits.some((h) => !h)) return { ok: false, value: null };
      return { ok: true, value: [...new Set(hits.map((h) => h.en))].sort((a, b) => (norm(a) < norm(b) ? -1 : 1)) };
    }
    return { ok: true, value: [...new Set(parts)].sort((a, b) => (norm(a) < norm(b) ? -1 : 1)) };
  }
  return { ok: false, value: null };
}

function toExpectedNumber(v) {
  if (typeof v === 'number') return v;
  const f = readExact(v);
  return f ? f.toNumber() : NaN;
}

// Whether a parsed value equals an expected one (a number/fraction, a name, a boolean or a set) under the field's tolerance.
function sameValue(field, parsed, expected) {
  const kind = field.kind;
  if (kind === 'num' || kind === 'frac') {
    const wantNum = toExpectedNumber(expected);
    if (!Number.isFinite(wantNum)) return false;
    // an exact fraction typed for an exact expected fraction is equal exactly; anything else is a decimal within the tolerance
    if (parsed instanceof Fraction && typeof expected === 'string') {
      const want = readExact(expected);
      if (want && parsed.equals(want)) return true;
    }
    const a = parsed instanceof Fraction ? parsed.toNumber() : parsed;
    return Math.abs(a - wantNum) <= tolOf({ ...field, expected });
  }
  if (kind === 'choice') {
    const o = matchOption(String(parsed), field.options);
    const e = norm(expected);
    return o ? norm(o.en) === e || norm(o.ro) === e : norm(parsed) === e;
  }
  if (kind === 'tf') return parsed === (typeof expected === 'boolean' ? expected : TRUE_WORDS.includes(norm(expected)));
  if (kind === 'multi') {
    const want = parseAnswer(Array.isArray(expected) ? expected.join(', ') : expected, 'multi', field.options);
    return want.ok && want.value.length === parsed.length && want.value.every((v, i) => norm(v) === norm(parsed[i]));
  }
  return false;
}

function scoped(d, scope) {
  try { return evaluate(d.formula, scope); } catch { return undefined; }
}

// grade(field, text, scope, detectors?) -> { verdict: 'right' | 'wrong' | 'accepted-alt' | 'unparsed', detector?, note? }
//   right          the text equals `expected` (a fraction exactly, a decimal within the tolerance)
//   accepted-alt   the text equals an `accept` value (a stated convention, D-049); `note` is that entry's note
//   wrong          anything else; `detector` is the message of the first detector whose formula the text matches
//   unparsed       the text is not a value of this kind
export function grade(field, text, scope = {}, detectors = []) {
  const p = parseAnswer(text, field.kind, field.options);
  if (!p.ok) return { verdict: 'unparsed' };
  if (sameValue(field, p.value, field.expected)) return { verdict: 'right' };
  for (const a of field.accept || []) {
    if (sameValue(field, p.value, a.value)) return { verdict: 'accepted-alt', note: a.note };
  }
  for (const d of (detectors || []).filter((x) => x.field === field.id)) {
    const v = scoped(d, scope);
    if (v === undefined) continue;
    let target;
    try { target = v instanceof Fraction || typeof v === 'number' ? toNumber(v) : v; } catch { continue; }
    if (typeof target === 'number' && (field.kind === 'num' || field.kind === 'frac')) {
      const a = p.value instanceof Fraction ? p.value.toNumber() : p.value;
      if (Math.abs(a - target) <= tolOf({ ...field, expected: target })) return { verdict: 'wrong', detector: d.message };
    } else if (sameValue(field, p.value, target)) {
      return { verdict: 'wrong', detector: d.message };
    }
  }
  return { verdict: 'wrong' };
}

export const isRight = (v) => !!v && (v.verdict === 'right' || v.verdict === 'accepted-alt');

// The value of a field's formula in a form comparable with `expected`: used by the content test and the block's own tests.
export function formulaMatches(field, scope) {
  let v;
  try { v = evaluate(field.formula, scope); } catch (e) { return { ok: false, error: e.message }; }
  const shown = v instanceof Fraction ? v.toString() : Array.isArray(v) ? v.join(', ') : String(v);
  if (field.kind === 'num' || field.kind === 'frac') {
    let got;
    try { got = toNumber(v); } catch (e) { return { ok: false, error: e.message, value: shown }; }
    const want = toExpectedNumber(field.expected);
    return { ok: Math.abs(got - want) <= tolOf(field), value: got, error: null };
  }
  if (field.kind === 'tf') return { ok: String(v) === String(field.expected), value: shown, error: null };
  if (field.kind === 'multi') {
    const a = parseAnswer(shown, 'multi', field.options);
    return { ok: a.ok && sameValue(field, a.value, field.expected), value: shown, error: null };
  }
  return { ok: norm(shown) === norm(field.expected), value: shown, error: null };
}

// The log calculator's evaluator: the learner's keys are a formula (log2(9/14), ln(2)^2, sqrt(3)).
// Returns { ok, text } where text is the value with up to six decimals, or why it failed.
export function padEval(expr) {
  const src = String(expr ?? '').replace(MINUS, '-').replace(/,/g, '.').replace(/[×]/g, '*').replace(/[÷]/g, '/');
  if (!src.trim()) return { ok: false, text: '' };
  try {
    const v = evaluate(src, {});
    const n = v instanceof Fraction ? v.toNumber() : v;
    if (typeof n !== 'number' || !Number.isFinite(n)) return { ok: false, text: '?' };
    return { ok: true, text: String(Math.round(n * 1e6) / 1e6) };
  } catch {
    return { ok: false, text: '?' };
  }
}
