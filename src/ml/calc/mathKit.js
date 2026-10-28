// The statistics the ML calculation exercises need, over a block's static table ({ columns, rows, ignore?, domains? }):
// entropy and information gain, thresholds for a continuous attribute, ID3 with training error and CVLOO, Naive Bayes and
// Joint Bayes, counting and conditional probabilities, a few distributions. Plain functions with no React and no
// formula parsing (formula.js binds them to names), so the content tests and the browser run the same code.
//
// Conventions (the outline's default tie rules): attributes are tried in table order, thresholds ascending, the first of
// equal best gains wins; a leaf whose classes tie goes to class 0 unless `tie` says otherwise.
//   table.ignore:  columns that are not attributes (the Day column of PlayTennis)
//   table.domains: { column: [values] } when the training rows do not show every value (add-one smoothing needs it)
//   a column named P holds the probability of each row (a joint distribution): counts below are then weights
// Numbers in a table are read as the decimals they print as (2.3 is 23/10), so thresholds and sums are exact.

import Fraction from './fraction.js';

const ZERO = new Fraction(0);
const ONE = new Fraction(1);
const EPS = 1e-12; // two gains this close are a tie

export const num = (x) => (x instanceof Fraction ? x.toNumber() : x);
const isInt = (x) => (x instanceof Fraction ? x.isInteger() : Number.isInteger(x));
const frac = (x) => (x instanceof Fraction ? x : Fraction.from(x));
const exact = (xs) => xs.every((x) => x instanceof Fraction);

// --- arithmetic on mixed exact and float values (the formula language uses these) ---

function binary(a, b, onFrac, onNum) {
  for (const x of [a, b]) {
    if (!(x instanceof Fraction) && typeof x !== 'number') throw new TypeError('arithmetic needs numbers');
  }
  if (a instanceof Fraction && b instanceof Fraction) return onFrac(a, b);
  return onNum(num(a), num(b));
}
export const add = (a, b) => binary(a, b, (x, y) => x.add(y), (x, y) => x + y);
export const sub = (a, b) => binary(a, b, (x, y) => x.sub(y), (x, y) => x - y);
export const mul = (a, b) => binary(a, b, (x, y) => x.mul(y), (x, y) => x * y);
export const div = (a, b) => binary(a, b, (x, y) => x.div(y), (x, y) => {
  if (y === 0) throw new RangeError('division by zero');
  return x / y;
});
export function pow(a, b) {
  if (a instanceof Fraction && b instanceof Fraction && b.isInteger() && b.abs().n <= 10000n) return a.pow(b.n);
  const r = Math.pow(num(a), num(b));
  if (!Number.isFinite(r)) throw new RangeError('power is not a finite number');
  return r;
}

// --- tables ---

const cache = new WeakMap();
const colName = (c) => (typeof c === 'string' ? c : c.en);

// A table in the form the functions use: names, rows, the attribute columns and a weight per row.
function norm(T) {
  if (!T || typeof T !== 'object' || !Array.isArray(T.columns) || !Array.isArray(T.rows)) throw new TypeError('expected a table { columns, rows }');
  let t = cache.get(T);
  if (t) return t;
  const cols = T.columns.map(colName);
  const wi = cols.indexOf('P');
  t = {
    cols,
    rows: T.rows,
    ignore: new Set(T.ignore || []),
    wi,
    w: T.rows.map((r) => (wi >= 0 ? frac(r[wi]) : ONE)),
    domains: T.domains || {},
    raw: T,
  };
  cache.set(T, t);
  return t;
}
const idx = (t, name) => {
  const i = t.cols.indexOf(name);
  if (i < 0) throw new RangeError(`unknown column ${name} (columns: ${t.cols.join(', ')})`);
  return i;
};
const view = (T) => { const t = norm(T); return { t, ids: t.rows.map((_, i) => i) }; };
const attrsOf = (t, ti) => t.cols.filter((c, i) => i !== ti && i !== t.wi && !t.ignore.has(c));
const sumW = (t, ids) => ids.reduce((s, i) => s.add(t.w[i]), ZERO);

const cmpLabel = (a, b) => (typeof a === 'number' && typeof b === 'number' ? a - b : String(a) < String(b) ? -1 : String(a) > String(b) ? 1 : 0);

// Label -> weight over the rows of a view, labels sorted.
function classWeights(v, ti) {
  const m = new Map();
  for (const i of v.ids) m.set(v.t.rows[i][ti], (m.get(v.t.rows[i][ti]) || ZERO).add(v.t.w[i]));
  const labels = [...m.keys()].sort(cmpLabel);
  return { labels, ws: labels.map((l) => m.get(l)), total: sumW(v.t, v.ids) };
}

function entropyOf(ws, total) {
  if (total.sign() <= 0) return 0;
  let h = 0;
  for (const w of ws) {
    if (w.sign() <= 0) continue;
    const p = w.div(total).toNumber();
    h -= p * Math.log2(p);
  }
  return h;
}

// --- distributions given as arguments ---

const flat = (xs) => xs.flatMap((x) => (Array.isArray(x) ? flat(x) : [x]));

// H(...probs): a distribution, or counts when the arguments are integers that sum to more than 1.
function probs(args, what) {
  const xs = flat(args);
  if (!xs.length) throw new TypeError(`${what} needs at least one value`);
  for (const x of xs) if (num(x) < 0 || !Number.isFinite(num(x))) throw new RangeError(`${what}: ${x} is not a probability or a count`);
  const total = exact(xs) ? xs.reduce((s, x) => s.add(x), ZERO) : null;
  const sum = total ? total.toNumber() : xs.reduce((s, x) => s + num(x), 0);
  if (xs.every(isInt) && sum > 1) return xs.map((x) => num(x) / sum);
  const one = total ? total.equals(ONE) : Math.abs(sum - 1) < 1e-9;
  if (!one) throw new RangeError(`${what}: the values must be a distribution (sum 1) or counts (integers summing past 1), got sum ${sum}`);
  return xs.map(num);
}
const entropyP = (ps) => ps.reduce((h, p) => (p > 0 ? h - p * Math.log2(p) : h), 0);
export const H = (...args) => entropyP(probs(args, 'H'));
export const gini = (...args) => 1 - probs(args, 'gini').reduce((s, p) => s + p * p, 0);
export const misclass = (...args) => 1 - Math.max(...probs(args, 'misclass'));

// --- entropy and information gain over a table ---

// H of one column of the table (H(Y)).
export function Hcol(T, col) {
  const v = view(T);
  const w = classWeights(v, idx(v.t, col));
  return entropyOf(w.ws, w.total);
}

const isCont = (name, v, o) => {
  if (Array.isArray(o.continuous)) return o.continuous.includes(name);
  if (o.continuous === true) return v.ids.every((i) => typeof v.t.rows[i][idx(v.t, name)] === 'number');
  return false;
};

// The row ids of a view split by an attribute: one group per value (in order of first appearance), or { threshold } -> <= and >.
function partition(v, ai, threshold) {
  if (threshold !== undefined) {
    const th = frac(threshold);
    const lo = [];
    const hi = [];
    for (const i of v.ids) (frac(v.t.rows[i][ai]).cmp(th) <= 0 ? lo : hi).push(i);
    return [lo, hi];
  }
  const m = new Map();
  for (const i of v.ids) {
    const key = v.t.rows[i][ai];
    if (!m.has(key)) m.set(key, []);
    m.get(key).push(i);
  }
  return [...m.values()];
}

const optsOf = (o) => o || {};

// H(Y | X): the groups' entropies weighted by their share (opts.threshold makes X a test X <= v).
export function Hc(T, attr, target, opts) {
  const v = view(T);
  const ai = idx(v.t, attr);
  const ti = idx(v.t, target);
  const total = sumW(v.t, v.ids);
  if (total.sign() <= 0) throw new RangeError('the table is empty');
  let h = 0;
  for (const g of partition(v, ai, optsOf(opts).threshold)) {
    const gv = { t: v.t, ids: g };
    const cw = classWeights(gv, ti);
    h += cw.total.div(total).toNumber() * entropyOf(cw.ws, cw.total);
  }
  return h;
}

export function IG(T, attr, target, opts) {
  return Hcol(T, target) - Hc(T, attr, target, opts);
}

// SplitInfo(X) = the entropy of the attribute's own value distribution.
export function splitInfo(T, attr, opts) {
  const v = view(T);
  const ai = idx(v.t, attr);
  const total = sumW(v.t, v.ids);
  return entropyOf(partition(v, ai, optsOf(opts).threshold).map((g) => sumW(v.t, g)), total);
}

export function IGR(T, attr, target, opts) {
  const s = splitInfo(T, attr, opts);
  return s === 0 ? 0 : IG(T, attr, target, opts) / s;
}

// --- thresholds for a continuous attribute ---

const mid = (a, b) => a.add(b).div(new Fraction(2));
function numericColumn(v, ai, name) {
  for (const i of v.ids) if (typeof v.t.rows[i][ai] !== 'number') throw new TypeError(`column ${name} is not numeric`);
}

// Candidate thresholds as exact fractions, ascending.
function thresholdFracs(v, ai, ti, mixedBoundary) {
  numericColumn(v, ai, v.t.cols[ai]);
  const items = v.ids
    .filter((i) => v.t.w[i].sign() > 0)
    .map((i, k) => ({ k, x: frac(v.t.rows[i][ai]), y: v.t.rows[i][ti] }))
    .sort((a, b) => a.x.cmp(b.x) || a.k - b.k);
  const out = [];
  const push = (a, b) => { const m = mid(a, b); if (!out.some((o) => o.equals(m))) out.push(m); };
  if (mixedBoundary) {
    // distinct values with their label sets; a threshold between neighbours whenever the two together hold more than one label
    const groups = [];
    for (const it of items) {
      const last = groups[groups.length - 1];
      if (last && last.x.equals(it.x)) last.ys.add(it.y);
      else groups.push({ x: it.x, ys: new Set([it.y]) });
    }
    for (let g = 1; g < groups.length; g++) {
      if (new Set([...groups[g - 1].ys, ...groups[g].ys]).size > 1) push(groups[g - 1].x, groups[g].x);
    }
  } else {
    // the classic rule: instances sorted by value (equal values keep table order), a threshold where neighbours differ in value and label
    for (let k = 1; k < items.length; k++) {
      if (items[k - 1].x.cmp(items[k].x) < 0 && items[k - 1].y !== items[k].y) push(items[k - 1].x, items[k].x);
    }
  }
  return out;
}

// thresholds(T, attr, target, { mixedBoundary }): midpoints between neighbouring values whose labels differ.
// mixedBoundary (default true): a value that occurs with both labels is a boundary, so the midpoints on both its sides count (4.51: 6).
// With false the classic rule over the instances sorted by value, ties in table order, counts fewer (4.51: 5).
export function thresholds(T, attr, target, opts) {
  const v = view(T);
  return thresholdFracs(v, idx(v.t, attr), idx(v.t, target), optsOf(opts).mixedBoundary !== false).map((f) => f.toNumber());
}

// --- ID3 ---

function options(v, ti, opts) {
  const o = optsOf(opts);
  const classes = [...new Set(v.t.rows.map((r) => r[ti]))].sort(cmpLabel);
  return {
    continuous: o.continuous,
    maxDepth: o.maxDepth === undefined ? Infinity : num(o.maxDepth),
    tie: o.tie === undefined ? 'class0' : o.tie,
    mixed: o.mixedBoundary !== false,
    classes,
  };
}

// The best test at a node: the largest IG, the first on a tie. null when nothing splits the rows.
function bestSplit(v, attrs, ti, o) {
  let best = null;
  for (const name of attrs) {
    const ai = idx(v.t, name);
    const cands = isCont(name, v, o)
      ? thresholdFracs(v, ai, ti, o.mixed).map((th) => ({ attr: name, ai, th }))
      : new Set(v.ids.map((i) => v.t.rows[i][ai])).size > 1 ? [{ attr: name, ai }] : [];
    for (const c of cands) {
      const ig = gainOf(v, c, ti);
      if (!best || ig > best.ig + EPS) best = { ...c, ig };
    }
  }
  return best;
}

// IG of a candidate test over the rows of a view.
function gainOf(v, c, ti) {
  const total = sumW(v.t, v.ids);
  const whole = classWeights(v, ti);
  let hc = 0;
  for (const g of partition(v, c.ai, c.th)) {
    const cw = classWeights({ t: v.t, ids: g }, ti);
    hc += cw.total.div(total).toNumber() * entropyOf(cw.ws, cw.total);
  }
  return entropyOf(whole.ws, whole.total) - hc;
}

function majority(v, ti, o) {
  const cw = classWeights(v, ti);
  const top = cw.ws.reduce((m, w) => (w.cmp(m) > 0 ? w : m), ZERO);
  const tied = cw.labels.filter((_, k) => cw.ws[k].equals(top));
  if (tied.length === 1) return tied[0];
  const k = /^class(\d+)$/.exec(String(o.tie));
  if (k) {
    const want = o.classes[Number(k[1])];
    return tied.includes(want) ? want : Number(k[1]) === 0 ? tied[0] : tied[tied.length - 1];
  }
  return tied.find((l) => String(l) === String(o.tie)) ?? tied[0];
}

function build(v, attrs, ti, o, depth, parentLabel) {
  if (!v.ids.length) return { leaf: parentLabel };
  const label = majority(v, ti, o);
  if (new Set(v.ids.map((i) => v.t.rows[i][ti])).size === 1 || !attrs.length || depth >= o.maxDepth) return { leaf: label };
  const best = bestSplit(v, attrs, ti, o);
  if (!best) return { leaf: label };
  const rest = best.th === undefined ? attrs.filter((a) => a !== best.attr) : attrs; // a discrete attribute is used once per path
  const groups = partition(v, best.ai, best.th);
  if (best.th !== undefined) {
    return { attr: best.attr, ai: best.ai, th: best.th, label, kids: groups.map((g) => build({ t: v.t, ids: g }, rest, ti, o, depth + 1, label)) };
  }
  const kids = new Map(groups.map((g) => [v.t.rows[g[0]][best.ai], build({ t: v.t, ids: g }, rest, ti, o, depth + 1, label)]));
  return { attr: best.attr, ai: best.ai, label, kids };
}

function classify(tree, row) {
  let n = tree;
  while (n.attr !== undefined) {
    if (n.th !== undefined) n = n.kids[frac(row[n.ai]).cmp(frac(n.th)) <= 0 ? 0 : 1];
    else if (n.kids.has(row[n.ai])) n = n.kids.get(row[n.ai]);
    else return n.label; // a value no training row has: the majority of the node
  }
  return n.leaf;
}

const learn = (v, ti, o) => build(v, attrsOf(v.t, ti), ti, o, 0, undefined);
const leafOrAttr = (tree) => (tree.attr === undefined ? null : tree.th === undefined ? { attr: tree.attr } : { attr: tree.attr, threshold: frac(tree.th).toNumber() });

export function trainErrId3(T, target, opts) {
  const v = view(T);
  const ti = idx(v.t, target);
  const tree = learn(v, ti, options(v, ti, opts));
  return v.ids.filter((i) => classify(tree, v.t.rows[i]) !== v.t.rows[i][ti]).length;
}

// Leave one row out, learn on the rest, classify it; the number of rows classified wrongly.
export function cvlooId3(T, target, opts) {
  const v = view(T);
  const ti = idx(v.t, target);
  const o = options(v, ti, opts);
  let errs = 0;
  for (const i of v.ids) {
    const tree = learn({ t: v.t, ids: v.ids.filter((j) => j !== i) }, ti, o);
    if (classify(tree, v.t.rows[i]) !== v.t.rows[i][ti]) errs++;
  }
  return errs;
}

// The test at the root of the learned tree: { attr } or { attr, threshold }; null for a single leaf.
export function id3Root(T, target, opts) {
  const v = view(T);
  const ti = idx(v.t, target);
  return leafOrAttr(learn(v, ti, options(v, ti, opts)));
}

// The number of test nodes of the learned tree.
export function id3Tests(T, target, opts) {
  const v = view(T);
  const ti = idx(v.t, target);
  const count = (n) => (n.attr === undefined ? 0 : 1 + (n.kids instanceof Map ? [...n.kids.values()] : n.kids).reduce((s, k) => s + count(k), 0));
  return count(learn(v, ti, options(v, ti, opts)));
}

// bestAttr(T, target): the column with the largest IG (the leftmost on a tie).
export function bestAttr(T, target, opts) {
  const v = view(T);
  const ti = idx(v.t, target);
  const best = bestSplit(v, attrsOf(v.t, ti), ti, options(v, ti, opts));
  if (!best) throw new RangeError('no attribute splits the rows');
  return best.attr;
}

// --- counting and probabilities ---

const OPS = /^\s*(.+?)\s*(<=|>=|!=|==|=|<|>)\s*(.+?)\s*$/;
const unquote = (s) => (/^(['"]).*\1$/.test(s) ? s.slice(1, -1) : s);
const NUMERIC = /^[+-]?(\d+\.?\d*|\.\d+)$/;

// "Outlook=Sunny & Play=Yes" -> [{ ci, op, lit }]
function parseCond(t, text) {
  if (text === undefined || text === null || String(text).trim() === '') return [];
  return String(text).split('&').map((part) => {
    const m = OPS.exec(part);
    if (!m) throw new SyntaxError(`cannot read the condition "${part.trim()}" (write Column=value, joined with &)`);
    return { ci: idx(t, m[1]), op: m[2] === '==' ? '=' : m[2], lit: unquote(m[3]) };
  });
}

function cmpCell(cell, lit) {
  if (typeof cell === 'number' && NUMERIC.test(lit)) return frac(cell).cmp(new Fraction(lit));
  const a = String(cell);
  return a < lit ? -1 : a > lit ? 1 : 0;
}

function matches(row, terms) {
  return terms.every(({ ci, op, lit }) => {
    const c = cmpCell(row[ci], lit);
    if (op !== '=' && op !== '!=' && typeof row[ci] !== 'number') throw new TypeError('<, <=, > and >= need a numeric column');
    return op === '=' ? c === 0 : op === '!=' ? c !== 0 : op === '<' ? c < 0 : op === '<=' ? c <= 0 : op === '>' ? c > 0 : c >= 0;
  });
}

const ids = (t, text) => { const terms = parseCond(t, text); return t.rows.map((_, i) => i).filter((i) => matches(t.rows[i], terms)); };

// count(T, cond): rows that satisfy the condition (all rows without one); count(array) is its length.
export function count(T, cond) {
  if (Array.isArray(T)) return T.length;
  const t = norm(T);
  return ids(t, cond).length;
}

// P(T, cond): the share of the table (its weights when there is a P column) that satisfies the condition, exact.
export function P(T, cond) {
  const t = norm(T);
  return sumW(t, ids(t, cond)).div(sumW(t, t.rows.map((_, i) => i)));
}

// Pc(T, cond, given) = P(cond & given) / P(given).
export function Pc(T, cond, given) {
  const t = norm(T);
  const g = sumW(t, ids(t, given));
  if (g.sign() === 0) throw new RangeError(`division by zero: no row satisfies the condition "${given}"`);
  const both = [cond, given].filter((c) => c !== undefined && String(c).trim() !== '').join(' & ');
  return sumW(t, ids(t, both)).div(g);
}

// The rows of T that satisfy the condition, as a table of its own (its attribute domains stay those of T).
export function where(T, cond) {
  const t = norm(T);
  const domains = { ...t.domains };
  t.cols.forEach((c, i) => { if (!domains[c]) domains[c] = [...new Set(t.rows.map((r) => r[i]))]; });
  return { columns: t.raw.columns, rows: ids(t, cond).map((i) => t.rows[i]), ignore: [...t.ignore], domains };
}

// --- Naive Bayes and Joint Bayes ---

// A row to classify, as { column index: value }: "A=1 & B=x", or { A: 1, B: 'x' }.
function rowSpec(t, spec) {
  const pairs = typeof spec === 'string'
    ? parseCond(t, spec).map(({ ci, op, lit }) => { if (op !== '=') throw new SyntaxError('a row to classify uses = only'); return [t.cols[ci], lit]; })
    : Object.entries(spec || {}).map(([k, x]) => [k, String(num(x))]);
  return pairs.map(([name, lit]) => ({ ci: idx(t, name), lit }));
}

const domainSize = (t, ci) => (t.domains[t.cols[ci]] ? t.domains[t.cols[ci]].length : new Set(t.rows.map((r) => r[ci])).size);
const labelIs = (cell, label) => (typeof cell === 'number' && typeof label === 'number' ? cell === label : String(cell) === String(label));

// nbScore: P(class) * product of P(attribute = value | class) for the attributes the row gives, exact.
// laplace: add-one on the conditionals, (count + 1) / (class size + number of values); the prior stays a relative frequency.
function nbScoreOn(v, ti, spec, cls, laplace) {
  const t = v.t;
  const inClass = v.ids.filter((i) => labelIs(t.rows[i][ti], cls));
  const wc = sumW(t, inClass);
  if (wc.sign() === 0) throw new RangeError(`no row of class ${cls}`);
  let score = wc.div(sumW(t, v.ids));
  for (const { ci, lit } of spec) {
    const c = sumW(t, inClass.filter((i) => cmpCell(t.rows[i][ci], lit) === 0));
    score = score.mul(laplace ? c.add(ONE).div(wc.add(new Fraction(domainSize(t, ci)))) : c.div(wc));
  }
  return score;
}

const classList = (v, ti) => [...new Set(v.ids.map((i) => v.t.rows[i][ti]))].sort(cmpLabel);

export function nbScore(T, target, row, cls, opts) {
  const v = view(T);
  const ti = idx(v.t, target);
  return nbScoreOn(v, ti, rowSpec(v.t, row), cls, !!optsOf(opts).laplace);
}

function argmax(scores) {
  return scores.reduce((best, s) => (s.score.cmp(best.score) > 0 ? s : best)).label; // the first class on a tie
}

export function nb(T, target, row, opts) {
  const v = view(T);
  const ti = idx(v.t, target);
  const spec = rowSpec(v.t, row);
  return argmax(classList(v, ti).map((label) => ({ label, score: nbScoreOn(v, ti, spec, label, !!optsOf(opts).laplace) })));
}

// nbProb: the score of one class over the scores of all classes (the posterior Naive Bayes reports).
export function nbProb(T, target, row, cls, opts) {
  const v = view(T);
  const ti = idx(v.t, target);
  const spec = rowSpec(v.t, row);
  const all = classList(v, ti).map((label) => nbScoreOn(v, ti, spec, label, !!optsOf(opts).laplace));
  return nbScoreOn(v, ti, spec, cls, !!optsOf(opts).laplace).div(all.reduce((s, x) => s.add(x), ZERO));
}

// jointScore: P(class, row) read straight from the joint counts, exact.
function jointScoreOn(v, ti, spec, cls) {
  const t = v.t;
  const hit = v.ids.filter((i) => labelIs(t.rows[i][ti], cls) && spec.every(({ ci, lit }) => cmpCell(t.rows[i][ci], lit) === 0));
  return sumW(t, hit).div(sumW(t, v.ids));
}
export function jointScore(T, target, row, cls) {
  const v = view(T);
  const ti = idx(v.t, target);
  return jointScoreOn(v, ti, rowSpec(v.t, row), cls);
}
export function joint(T, target, row) {
  const v = view(T);
  const ti = idx(v.t, target);
  const spec = rowSpec(v.t, row);
  return argmax(classList(v, ti).map((label) => ({ label, score: jointScoreOn(v, ti, spec, label) })));
}

// Naive Bayes on every row: errors on the training rows, or with each row left out in turn (ties go to the first class).
function nbErrors(T, target, opts, leaveOut) {
  const v = view(T);
  const ti = idx(v.t, target);
  const attrs = attrsOf(v.t, ti).map((a) => idx(v.t, a));
  const laplace = !!optsOf(opts).laplace;
  let errs = 0;
  for (const i of v.ids) {
    const train = { t: v.t, ids: leaveOut ? v.ids.filter((j) => j !== i) : v.ids };
    const spec = attrs.map((ci) => ({ ci, lit: String(v.t.rows[i][ci]) }));
    const pred = argmax(classList(train, ti).map((label) => ({ label, score: nbScoreOn(train, ti, spec, label, laplace) })));
    if (!labelIs(v.t.rows[i][ti], pred)) errs++;
  }
  return errs;
}
export const trainErrNB = (T, target, opts) => nbErrors(T, target, opts, false);
export const cvlooNB = (T, target, opts) => nbErrors(T, target, opts, true);

// Free parameters. nVals: values per attribute, one number for all or a list; Naive Bayes (C-1) + C*sum(v-1), Joint Bayes C*prod(v) - 1.
// With Bernoulli attributes and two classes these are 2n+1 and 2^(n+1)-1.
function valuesPerAttr(nAttrs, nVals) {
  const n = num(nAttrs);
  const vs = Array.isArray(nVals) ? nVals.map(num) : Array(n).fill(num(nVals));
  if (vs.length !== n) throw new RangeError(`${n} attributes but ${vs.length} value counts`);
  return vs;
}
export function paramsNB(nAttrs, nVals, nClasses = 2) {
  const c = num(nClasses);
  return (c - 1) + c * valuesPerAttr(nAttrs, nVals).reduce((s, v) => s + (v - 1), 0);
}
export function paramsJoint(nAttrs, nVals, nClasses = 2) {
  const c = num(nClasses);
  return c * valuesPerAttr(nAttrs, nVals).reduce((p, v) => p * v, 1) - 1;
}

// --- distributions ---

export function binom(n, k) {
  const N = BigInt(num(n));
  const K = BigInt(num(k));
  if (K < 0n || K > N) return ZERO;
  let r = 1n;
  for (let i = 1n; i <= K; i++) r = (r * (N - K + i)) / i;
  return new Fraction(r);
}

export function binomPmf(n, p, k) {
  const q = sub(new Fraction(1), p);
  return mul(mul(binom(n, k), pow(p, frac(num(k)))), pow(q, frac(num(n) - num(k))));
}

const sumMixed = (xs) => xs.reduce((s, x) => add(s, x), ZERO);

// E, Var and Cov weigh by probabilities; Cov over a table uses its P column, or equal weights.
export function E(values, ps) {
  const vs = flat([values]);
  const wp = flat([ps]);
  if (vs.length !== wp.length) throw new RangeError('values and probabilities differ in length');
  return sumMixed(vs.map((x, i) => mul(x, wp[i])));
}
export function Var(values, ps) {
  const mean = E(values, ps);
  return sub(E(flat([values]).map((x) => mul(x, x)), ps), mul(mean, mean));
}
export function Cov(T, x, y) {
  const t = norm(T);
  const xi = idx(t, x);
  const yi = idx(t, y);
  const total = sumW(t, t.rows.map((_, i) => i));
  const ps = t.w.map((w) => w.div(total));
  const col = (ci) => t.rows.map((r) => frac(r[ci]));
  const ex = E(col(xi), ps);
  const ey = E(col(yi), ps);
  return sub(E(t.rows.map((r) => mul(frac(r[xi]), frac(r[yi]))), ps), mul(ex, ey));
}

// KL(p || q) and the cross-entropy CH(p, q) = H(p) + KL(p || q), in bits.
export function KL(p, q) {
  const ps = flat([p]).map(num);
  const qs = flat([q]).map(num);
  if (ps.length !== qs.length) throw new RangeError('p and q differ in length');
  let s = 0;
  ps.forEach((pi, i) => {
    if (pi > 0) s += qs[i] > 0 ? pi * Math.log2(pi / qs[i]) : Infinity;
  });
  return s;
}
export function CH(p, q) {
  const ps = flat([p]).map(num);
  const qs = flat([q]).map(num);
  if (ps.length !== qs.length) throw new RangeError('p and q differ in length');
  let s = 0;
  ps.forEach((pi, i) => {
    if (pi > 0) s -= qs[i] > 0 ? pi * Math.log2(qs[i]) : -Infinity;
  });
  return s;
}
