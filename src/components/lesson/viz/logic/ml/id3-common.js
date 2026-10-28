// Shared pieces of the ID3 widgets (ml-id3-builder, ml-dup-counter, ml-tree-pair): reading a static table, class order, the
// [a+,b-] boxes, and one stump (a decision stump: one test with its branches). Every number comes from mathKit (H, Hc, IG,
// Hcol) or from exact Fraction arithmetic; nothing here is typed into a widget's props except the data itself.
import Fraction from '../../../../../ml/calc/fraction.js';
import * as K from '../../../../../ml/calc/mathKit.js';
import { roCount, enCount } from '../words.js';

export const MINUS = '−';
export const SYMS = ['+', MINUS, '*', '#'];
export const EPS = 1e-9; // two entropies this close are a tie

// ---- text helpers: every learner string is { en, ro } ----
export const both = (f) => ({ en: f('en'), ro: f('ro') });
export const pick = (lang, en, ro) => (lang === 'en' ? en : ro);
// a label is a plain string/number or { en, ro }
export const lab = (x, lang) => (x !== null && typeof x === 'object' ? x[lang] : String(x));
export const colName = (c) => (typeof c === 'string' ? c : c.en);

export const fmt4 = (x) => (Math.abs(x) < 5e-5 ? 0 : x).toFixed(4);
// 7 significant digits, no trailing zeros (11608.27, 368224.2)
export const fmtBig = (x) => String(Number(x.toPrecision(7)));
export const fmtDec = (x) => String(Number(x.toFixed(4)));

// ---- classes ----
const POS = ['+', 1, '1', true, 'true', 'Yes', 'yes', 'da', 'Da', 'DA'];
export const cmpLabel = (a, b) => (typeof a === 'number' && typeof b === 'number' ? a - b : String(a) < String(b) ? -1 : String(a) > String(b) ? 1 : 0);

// The positive class first (the one drawn as +), the others in table order of their sort. `positive` names it; without it the
// usual positive spellings are tried, then the smallest label.
export function classOrder(labels, positive) {
  const sorted = [...labels].sort(cmpLabel);
  const same = (l, p) => String(l) === String(p);
  const found = positive !== undefined
    ? sorted.find((l) => same(l, positive))
    : POS.map((p) => sorted.find((l) => same(l, p))).find((x) => x !== undefined);
  const first = found !== undefined ? found : sorted[0];
  return [first, ...sorted.filter((l) => l !== first)];
}

export const sumF = (fs) => fs.reduce((s, f) => s.add(f), new Fraction(0));
export const showN = (f) => f.toString();

// "[48+,16-]" from a list of Fractions
export const boxText = (counts) => `[${counts.map((c, i) => `${showN(c)}${SYMS[i] ?? '?'}`).join(',')}]`;

// entropy of a list of counts (Fractions); 0 for an empty node
export function entropyOfCounts(counts) {
  if (counts.every((c) => c.sign() === 0)) return 0;
  return K.H(...counts);
}

// ---- a static table, ready for mathKit ----
// A column named Counts (multiplicities, exercise 4.41) is the weight column mathKit calls P.
export function prep(table, target, positive) {
  const names = table.columns.map(colName);
  const ti = names.indexOf(target);
  if (ti < 0) throw new RangeError(`unknown target column ${target}`);
  const wi = names.findIndex((n) => n === 'Counts' || n === 'P');
  const ignore = table.ignore || [];
  const columns = names.map((n, i) => (i === wi ? 'P' : n));
  const mk = { columns, rows: table.rows, ignore, domains: table.domains };
  const attrs = names.filter((n, i) => i !== ti && i !== wi && !ignore.includes(n));
  const classes = classOrder([...new Set(table.rows.map((r) => r[ti]))], positive);
  return {
    names,
    headers: table.columns,
    ti,
    wi,
    mk,
    target,
    attrs,
    classes,
    rows: table.rows,
    ignore,
    domains: table.domains || {},
    w: table.rows.map((r) => (wi >= 0 ? Fraction.from(r[wi]) : new Fraction(1))),
  };
}

export const allIds = (P) => P.rows.map((_, i) => i);
export const subTable = (P, ids) => ({ columns: P.mk.columns, rows: ids.map((i) => P.rows[i]), ignore: P.ignore, domains: P.mk.domains });
export const weightOf = (P, ids) => sumF(ids.map((i) => P.w[i]));
const isClass = (cell, c) => String(cell) === String(c);
export const countsOf = (P, ids) => P.classes.map((c) => sumF(ids.filter((i) => isClass(P.rows[i][P.ti], c)).map((i) => P.w[i])));
export const headerOf = (P, name) => P.headers[P.names.indexOf(name)];

// The values of an attribute in display order: the declared domain when there is one, else the values present, sorted.
export function valuesOf(P, ids, attr) {
  const ai = P.names.indexOf(attr);
  if (P.domains[attr]) return P.domains[attr];
  const seen = [];
  for (const i of ids) if (!seen.some((v) => String(v) === String(P.rows[i][ai]))) seen.push(P.rows[i][ai]);
  return seen.sort(cmpLabel);
}

// The majority class of a node; a tie goes to the smallest label (the outline's class-0 rule), as mathKit does.
export function majorityOf(P, counts) {
  const top = counts.reduce((m, c) => (c.cmp(m) > 0 ? c : m), new Fraction(0));
  const tied = P.classes.filter((_, k) => counts[k].equals(top));
  if (tied.length === 1) return { label: tied[0], tie: false };
  const smallest = [...P.classes].sort(cmpLabel)[0];
  return { label: tied.includes(smallest) ? smallest : tied[0], tie: true };
}

// ---- a stump ----
// branch: { value, counts[Fraction], n, w (share, Fraction), h (entropy of the branch) }
// stump:  { attr (key), label (header: string or {en,ro}), branches, hc (H(Y|A)), ig }
function finishBranches(branches, N) {
  return branches.map((b) => ({ ...b, n: sumF(b.counts), w: sumF(b.counts).div(N), h: entropyOfCounts(b.counts) }));
}

export function tableStump(P, ids, attr) {
  const ai = P.names.indexOf(attr);
  const N = weightOf(P, ids);
  const sub = subTable(P, ids);
  const raw = valuesOf(P, ids, attr).map((v) => {
    const g = ids.filter((i) => String(P.rows[i][ai]) === String(v));
    return { value: v, ids: g, counts: countsOf(P, g) };
  });
  return {
    attr,
    label: headerOf(P, attr),
    branches: finishBranches(raw, N),
    hc: K.Hc(sub, attr, P.target),
    ig: K.IG(sub, attr, P.target),
  };
}

// A stump given by its branch counts alone (data the book prints as boxes, not as rows).
// def: { name: string|{en,ro}, branches: [{ value?, counts: [pos, neg, ...] }] }
export function givenStump(def, nClasses, rootCounts) {
  const raw = def.branches.map((b, j) => {
    if (!Array.isArray(b.counts) || b.counts.length !== nClasses) throw new RangeError(`branch ${j + 1} of ${lab(def.name, 'en')} needs ${nClasses} counts`);
    return { value: b.value ?? j, counts: b.counts.map((c) => Fraction.from(c)) };
  });
  const N = sumF(raw.flatMap((b) => b.counts));
  const branches = finishBranches(raw, N);
  if (rootCounts) {
    rootCounts.forEach((rc, k) => {
      if (!sumF(raw.map((b) => b.counts[k])).equals(rc)) throw new RangeError(`the branches of ${lab(def.name, 'en')} do not add up to the root (class ${k + 1})`);
    });
  }
  const hc = branches.reduce((s, b) => s + b.w.toNumber() * b.h, 0);
  const root = rootCounts || Array.from({ length: nClasses }, (_, k) => sumF(raw.map((b) => b.counts[k])));
  return { attr: lab(def.name, 'en'), label: def.name, branches, hc, ig: entropyOfCounts(root) - hc };
}

// Training errors of a stump whose leaves take the majority: sum over branches of (n - largest count), exact.
export function stumpErrors(stump) {
  return stump.branches.map((b) => b.n.sub(b.counts.reduce((m, c) => (c.cmp(m) > 0 ? c : m), new Fraction(0))));
}

// the leaf a branch ends in: its majority class label (null label on a tie)
export function leafOf(classes, branch) {
  const top = branch.counts.reduce((m, c) => (c.cmp(m) > 0 ? c : m), new Fraction(0));
  const tied = classes.filter((_, k) => branch.counts[k].equals(top));
  return { label: tied.length === 1 ? tied[0] : null, tie: tied.length > 1, tied };
}

export const bestIndex = (stumps) => stumps.reduce((bi, s, i) => (s.hc < stumps[bi].hc - EPS ? i : bi), 0);
export const tiedBest = (stumps) => {
  const m = stumps[bestIndex(stumps)].hc;
  return stumps.map((s, i) => (Math.abs(s.hc - m) <= EPS ? i : -1)).filter((i) => i >= 0);
};

// "11 de" style is not needed: counts are written as digits. A list "a, b and c" / "a, b și c".
export const listIn = (lang, xs) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} ${lang === 'en' ? 'and' : 'și'} ${xs.at(-1)}`);

// "128 de exemple" / "6 exemple" / "1 test": a counted noun in either language (n may be a Fraction)
export function cnt(lang, n, enOne, enMany, roOne, roMany) {
  const v = n instanceof Fraction ? (n.isInteger() ? Number(n.toString()) : n.toString()) : n;
  if (typeof v !== 'number') return `${v} ${lang === 'en' ? enMany : roMany}`;
  return lang === 'en' ? enCount(v, enOne, enMany) : roCount(v, roOne, roMany);
}
