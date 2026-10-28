// ID3 growth with every step kept for display, built on the ML math kit (the same rules as the kit's own ID3:
// attributes in table order, thresholds ascending, the first of equal best gains wins, a discrete attribute once per path,
// a tied leaf goes to `tie`). Used by ml-threshold and ml-cvloo; tests pin it to the kit (cvlooId3, trainErrId3, id3Tests).
import { IG, thresholds } from '../../../../../ml/calc/mathKit.js';

const EPS = 1e-12;

export const cname = (c) => (typeof c === 'string' ? c : c.en);
export const colNames = (T) => T.columns.map(cname);

export const cmpLabel = (a, b) => (typeof a === 'number' && typeof b === 'number' ? a - b : String(a) < String(b) ? -1 : String(a) > String(b) ? 1 : 0);

// 4 decimals, no trailing zeros ("0.4591", "1", "0")
export const fmt = (x, d = 4) => String(Number(Number(x).toFixed(d)));

const POS = new Set(['+', 'yes', 'da', '1', 'true']);
const NEG = new Set(['-', '−', 'no', 'nu', '0', 'false']);
export const polarity = (label) => (POS.has(String(label).toLowerCase()) ? 'pos' : NEG.has(String(label).toLowerCase()) ? 'neg' : null);

// Classes in display order: the positive one first when there is a positive and a negative one.
export function classOrder(rows, ti) {
  const cs = [...new Set(rows.map((r) => r[ti]))].sort(cmpLabel);
  if (cs.length === 2 && polarity(cs[0]) === 'neg' && polarity(cs[1]) === 'pos') return [cs[1], cs[0]];
  return cs;
}

export const sub = (T, ids) => ({ columns: T.columns, rows: ids.map((i) => T.rows[i]), ignore: T.ignore });

const countsOf = (T, ids, ti, classes) => classes.map((c) => ids.filter((i) => T.rows[i][ti] === c).length);

function majority(counts, classes, tie) {
  const top = Math.max(...counts);
  const tied = classes.filter((_, k) => counts[k] === top);
  if (tied.length === 1) return tied[0];
  const sorted = [...classes].sort(cmpLabel);
  const tiedS = sorted.filter((c) => tied.includes(c));
  const k = /^class(\d+)$/.exec(String(tie));
  if (k) {
    const want = sorted[Number(k[1])];
    return tiedS.includes(want) ? want : Number(k[1]) === 0 ? tiedS[0] : tiedS[tiedS.length - 1];
  }
  return tiedS.find((l) => String(l) === String(tie)) ?? tiedS[0];
}

// grow(T, target, { continuous: [names], attrs: [names], tie, maxDepth }) -> the tree.
// Test node: { ids, counts, label, test: { attr, th? }, ig, cands, kids }  (continuous: kids = [<=, >]; discrete: kids = [{ value, node }] in order of first appearance)
// Leaf: { ids, counts, label, leaf: true }
export function grow(T, target, o = {}) {
  const names = colNames(T);
  const ti = names.indexOf(target);
  if (ti < 0) throw new RangeError(`unknown target ${target}`);
  const ignore = new Set(T.ignore || []);
  const all = names.filter((c, i) => i !== ti && c !== 'P' && !ignore.has(c));
  const attrs = o.attrs || all;
  const cont = new Set(o.continuous || []);
  const classes = classOrder(T.rows, ti);
  const tie = o.tie === undefined ? 'class0' : o.tie;
  const maxDepth = o.maxDepth === undefined ? Infinity : o.maxDepth;

  const build = (ids, left, depth, parentLabel) => {
    if (!ids.length) return { ids, counts: classes.map(() => 0), label: parentLabel, leaf: true, empty: true };
    const counts = countsOf(T, ids, ti, classes);
    const label = majority(counts, classes, tie);
    const pure = counts.filter((c) => c > 0).length === 1;
    if (pure || !left.length || depth >= maxDepth) return { ids, counts, label, leaf: true };
    const st = sub(T, ids);
    const cands = [];
    for (const a of left) {
      const ai = names.indexOf(a);
      if (cont.has(a)) {
        for (const th of thresholds(st, a, target)) cands.push({ attr: a, th, ig: IG(st, a, target, { threshold: th }) });
      } else if (new Set(ids.map((i) => T.rows[i][ai])).size > 1) {
        cands.push({ attr: a, ig: IG(st, a, target) });
      }
    }
    let best = null;
    for (const c of cands) if (!best || c.ig > best.ig + EPS) best = c;
    if (!best) return { ids, counts, label, leaf: true };
    const ai = names.indexOf(best.attr);
    const rest = best.th === undefined ? left.filter((a) => a !== best.attr) : left;
    // every candidate keeps the counts of the groups it makes, for the table the widget shows
    for (const c of cands) {
      const ci = names.indexOf(c.attr);
      if (c.th !== undefined) {
        c.groups = [ids.filter((i) => T.rows[i][ci] <= c.th), ids.filter((i) => T.rows[i][ci] > c.th)].map((g) => countsOf(T, g, ti, classes));
      } else {
        const vals = [...new Set(ids.map((i) => T.rows[i][ci]))];
        c.groups = vals.map((v) => countsOf(T, ids.filter((i) => T.rows[i][ci] === v), ti, classes));
      }
    }
    let kids;
    if (best.th !== undefined) {
      const lo = ids.filter((i) => T.rows[i][ai] <= best.th);
      const hi = ids.filter((i) => T.rows[i][ai] > best.th);
      kids = [build(lo, rest, depth + 1, label), build(hi, rest, depth + 1, label)];
    } else {
      const vals = [...new Set(ids.map((i) => T.rows[i][ai]))];
      kids = vals.map((v) => ({ value: v, node: build(ids.filter((i) => T.rows[i][ai] === v), rest, depth + 1, label) }));
    }
    return { ids, counts, label, test: { attr: best.attr, th: best.th }, ig: best.ig, cands, best, kids };
  };

  const tree = build(T.rows.map((_, i) => i), attrs, 0, undefined);
  return { tree, classes, names, ti, tie };
}

export const kidNodes = (n) => (n.leaf ? [] : n.kids.map((k) => (k.node ? k.node : k)));

export function classify(T, g, row) {
  let n = g.tree;
  while (!n.leaf) {
    const ai = g.names.indexOf(n.test.attr);
    if (n.test.th !== undefined) n = n.kids[row[ai] <= n.test.th ? 0 : 1];
    else {
      const k = n.kids.find((x) => x.value === row[ai]);
      if (!k) return n.label; // a value no training row has: the majority of the node
      n = k.node;
    }
  }
  return n.label;
}

export const countTests = (n) => (n.leaf ? 0 : 1 + kidNodes(n).reduce((s, k) => s + countTests(k), 0));

// "[3+,2−]" for a positive/negative pair, "[Yes 3, No 2]" otherwise (classes in display order)
export function countsText(counts, classes) {
  const pn = classes.length === 2 && polarity(classes[0]) === 'pos' && polarity(classes[1]) === 'neg';
  return pn ? `[${counts[0]}+,${counts[1]}−]` : `[${classes.map((c, k) => `${c} ${counts[k]}`).join(', ')}]`;
}
