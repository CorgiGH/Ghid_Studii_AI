// ml-threshold (L14): the thresholds of a continuous attribute, the IG of each, the winner, the thresholds recomputed
// in each child node, and the decision zones. Pure: every number, caption and mark comes from here, computed with the
// ML math kit (thresholds, IG, Hcol) through tree-grow.js. No React.
import { Hcol, IG } from '../../../../../ml/calc/mathKit.js';
import { colNames, countsText, fmt, grow, countTests, polarity, sub } from './tree-grow.js';

const bi = (en, ro) => ({ en, ro });
const TIE = 1e-9;

const test = (c) => `${c.attr} ≤ ${fmt(c.th)}`;
export const candKey = (c) => `${c.attr}@${fmt(c.th)}`;

const sideText = (conds) => conds.map((c) => `${c.attr} ${c.op} ${fmt(c.th)}`).join(', ');

// Every internal node in the order the tree is grown level by level, with the region of the plane it covers.
function internalNodes(root, plane) {
  const out = [];
  const q = [{ node: root, conds: [], region: { x: [-Infinity, Infinity], y: [-Infinity, Infinity] } }];
  while (q.length) {
    const it = q.shift();
    if (it.node.leaf) continue;
    out.push({ ...it, id: out.length });
    const { attr, th } = it.node.test;
    const axis = plane && attr === plane.y ? 'y' : 'x';
    const lo = { ...it.region, [axis]: [it.region[axis][0], Math.min(it.region[axis][1], th)] };
    const hi = { ...it.region, [axis]: [Math.max(it.region[axis][0], th), it.region[axis][1]] };
    q.push({ node: it.node.kids[0], conds: [...it.conds, { attr, op: '≤', th }], region: lo });
    q.push({ node: it.node.kids[1], conds: [...it.conds, { attr, op: '>', th }], region: hi });
  }
  return out;
}

function leaves(root, plane) {
  const out = [];
  const walk = (node, conds, region) => {
    if (node.leaf) { out.push({ node, conds, region }); return; }
    const { attr, th } = node.test;
    const axis = plane && attr === plane.y ? 'y' : 'x';
    walk(node.kids[0], [...conds, { attr, op: '≤', th }], { ...region, [axis]: [region[axis][0], Math.min(region[axis][1], th)] });
    walk(node.kids[1], [...conds, { attr, op: '>', th }], { ...region, [axis]: [Math.max(region[axis][0], th), region[axis][1]] });
  };
  walk(root, [], { x: [-Infinity, Infinity], y: [-Infinity, Infinity] });
  return out;
}

// The first midpoint inside the longest run of one label (a threshold nobody should try), or null.
function insideRun(table, attr, target) {
  const names = colNames(table);
  const ai = names.indexOf(attr);
  const ti = names.indexOf(target);
  const groups = [];
  for (const r of [...table.rows].sort((a, b) => a[ai] - b[ai])) {
    const last = groups[groups.length - 1];
    if (last && last.x === r[ai]) last.ys.add(r[ti]);
    else groups.push({ x: r[ai], ys: new Set([r[ti]]) });
  }
  let best = null;
  let g = 0;
  while (g < groups.length) {
    let e = g;
    const one = groups[g].ys.size === 1 ? [...groups[g].ys][0] : undefined;
    if (one !== undefined) while (e + 1 < groups.length && groups[e + 1].ys.size === 1 && [...groups[e + 1].ys][0] === one) e += 1;
    if (e > g && (!best || e - g > best.e - best.g)) best = { g, e };
    g = e + 1;
  }
  return best ? (groups[best.g].x + groups[best.g + 1].x) / 2 : null;
}

export function mlThreshold({ table, attr, target, plane }) {
  const attrs = plane ? [plane.x, plane.y] : [attr];
  const names = colNames(table);
  for (const a of attrs) if (!names.includes(a)) throw new RangeError(`unknown column ${a}`);
  if (!names.includes(target)) throw new RangeError(`unknown column ${target}`);
  const ti = names.indexOf(target);
  const g = grow(table, target, { attrs, continuous: attrs });
  const classes = g.classes;
  const ct = (counts) => countsText(counts, classes);
  const points = table.rows.map((r, i) => ({
    i, x: r[names.indexOf(attrs[0])], y: plane ? r[names.indexOf(attrs[1])] : undefined, label: r[ti], cls: classes.indexOf(r[ti]),
  }));
  const nodes = internalNodes(g.tree, plane);
  const root = nodes[0];
  const frames = [];

  const rootCands = root ? root.node.cands.map((c) => ({ attr: c.attr, th: c.th, key: candKey(c) })) : [];
  const rootList = rootCands.map((c) => (plane ? test(c) : fmt(c.th))).join(', ');
  frames.push({
    kind: 'setup', n: points.length, cands: rootCands, lines: [], showIG: false, h: Hcol(table, target),
    caption: plane
      ? bi(`${points.length} points in the plane. A test compares one column with one threshold, so the cuts are straight lines parallel to an axis. Thresholds only sit between neighbouring values whose labels differ: ${rootCands.length} candidates at the root (${rootList}). Which one has the largest IG?`,
        `${points.length} puncte în plan. Un test compară o singură coloană cu un prag, deci tăieturile sunt drepte paralele cu axele. Pragurile se pun doar între valori vecine cu etichete diferite: ${rootCands.length} candidați la rădăcină (${rootList}). Care are cel mai mare IG?`)
      : bi(`${points.length} points, sorted by ${attr}. A threshold goes only where the label changes, at the midpoint: ${rootCands.length} candidates (${rootList}). Which one has the largest IG?`,
        `${points.length} puncte, ordonate după ${attr}. Un prag se pune doar unde se schimbă eticheta, la mijlocul intervalului: ${rootCands.length} candidați (${rootList}). Care are cel mai mare IG?`),
  });

  const boundaryOf = (nd) => ({ attr: nd.node.test.attr, th: nd.node.test.th, region: nd.region, node: nd.id });
  const nodeFrame = (nd, lines) => {
    const n = nd.node;
    const cands = n.cands.map((c) => ({ attr: c.attr, th: c.th, ig: c.ig, key: candKey(c), left: c.groups[0], right: c.groups[1], best: c === n.best }));
    const runner = [...cands].filter((c) => !c.best).sort((a, b) => b.ig - a.ig)[0];
    const tied = cands.some((c) => !c.best && Math.abs(c.ig - n.best.ig) < TIE);
    const h = Hcol(sub(table, n.ids), target);
    const best = cands.find((c) => c.best);
    const tail = (en, ro) => (tied ? bi(`${en} Another test has the same IG; the first one in the order is kept.`, `${ro} Un alt test are același IG; se păstrează primul în ordine.`) : bi(en, ro));
    const head = nd.id === 0
      ? bi(`Root: ${n.ids.length} points ${ct(n.counts)}, H = ${fmt(h)}.`, `Rădăcina: ${n.ids.length} puncte ${ct(n.counts)}, H = ${fmt(h)}.`)
      : bi(`Node where ${sideText(nd.conds)}: ${n.ids.length} points ${ct(n.counts)}, H = ${fmt(h)}. Thresholds are recomputed from these points only: ${cands.map((c) => fmt(c.th)).join(', ')}.`,
        `Nodul în care ${sideText(nd.conds)}: ${n.ids.length} puncte ${ct(n.counts)}, H = ${fmt(h)}. Pragurile se recalculează doar din aceste puncte: ${cands.map((c) => fmt(c.th)).join(', ')}.`);
    const win = tail(`Best test: ${test(best)}, IG ${fmt(best.ig)}${runner ? ` (next: ${test(runner)}, IG ${fmt(runner.ig)})` : ''}.`,
      `Cel mai bun test: ${test(best)}, IG ${fmt(best.ig)}${runner ? ` (următorul: ${test(runner)}, IG ${fmt(runner.ig)})` : ''}.`);
    return {
      kind: 'node', id: nd.id, n: n.ids.length, counts: n.counts, h, cands, best, region: nd.region, conds: nd.conds, showIG: true, lines,
      caption: bi(`${head.en} ${win.en}`, `${head.ro} ${win.ro}`),
    };
  };

  const rootFrame = root ? nodeFrame(root, [boundaryOf(root)]) : null;
  if (rootFrame) frames.push(rootFrame);

  // a threshold inside a run of one label: the reason thresholds sit only where the label changes
  const trial = !plane && root ? insideRun(table, attr, target) : null;
  if (trial !== null && rootFrame) {
    const st = { attr, th: trial };
    const below = points.filter((p) => p.x <= trial);
    const above = points.filter((p) => p.x > trial);
    const cnt = (ps) => classes.map((c) => ps.filter((p) => p.label === c).length);
    const ig = IG(table, attr, target, { threshold: trial });
    frames.push({
      kind: 'contrast', n: points.length, trial: { ...st, ig, left: cnt(below), right: cnt(above) }, best: rootFrame.best, showIG: true,
      lines: [boundaryOf(root)], cands: rootFrame.cands, region: root.region,
      caption: bi(`A threshold inside a run of one label, ${test(st)}: ${ct(cnt(below))} and ${ct(cnt(above))}, IG ${fmt(ig)}. Far below ${fmt(rootFrame.best.ig)}, the IG of ${test(rootFrame.best)}: inside a run a test cannot beat the label change at its end.`,
        `Un prag în interiorul unui șir cu aceeași etichetă, ${test(st)}: ${ct(cnt(below))} și ${ct(cnt(above))}, IG ${fmt(ig)}. Mult sub ${fmt(rootFrame.best.ig)}, IG-ul lui ${test(rootFrame.best)}: în interiorul unui șir un test nu poate întrece schimbarea de etichetă de la capătul lui.`),
    });
  }

  nodes.slice(1).forEach((nd) => {
    frames.push(nodeFrame(nd, nodes.slice(0, nd.id + 1).map(boundaryOf)));
  });

  const lv = leaves(g.tree, plane).map((l) => ({
    region: l.region, label: l.node.label, cls: classes.indexOf(l.node.label), n: l.node.ids.length, counts: l.node.counts, conds: l.conds,
    text: l.conds.length ? l.conds.map((c) => `${c.attr} ${c.op} ${fmt(c.th)}`).join(' & ') : '*',
  }));
  const tests = countTests(g.tree);
  const zoneText = (l) => l.text;
  frames.push({
    kind: 'zones', n: points.length, tests, leaves: lv, showIG: true, lines: nodes.map(boundaryOf), region: nodes[0]?.region,
    caption: plane
      ? bi(`The finished tree: ${tests} tests and ${lv.length} zones. Every boundary is parallel to an axis, and each zone takes the label of the points inside it.`,
        `Arborele terminat: ${tests} teste și ${lv.length} zone. Fiecare graniță e paralelă cu o axă, iar fiecare zonă ia eticheta punctelor din ea.`)
      : bi(`The finished tree: ${tests} tests and ${lv.length} zones on the axis: ${lv.map((l) => `${zoneText(l)} → ${l.label}`).join('; ')}.`,
        `Arborele terminat: ${tests} teste și ${lv.length} zone pe axă: ${lv.map((l) => `${zoneText(l)} → ${l.label}`).join('; ')}.`),
  });

  return { frames, points, classes, attrs, plane: !!plane, tests, leaves: lv, root: rootFrame, tree: g.tree, countsText: ct, nodes: nodes.length };
}

// What the learner's pick was worth (null before a pick or after a skip).
export function guessNote(frame, guess) {
  if (!guess || frame.kind !== 'node' || frame.id !== 0) return null;
  const picked = frame.cands.find((c) => c.key === guess);
  if (!picked) return null;
  const best = frame.best;
  if (picked.key === best.key) return bi(`You picked ${test(picked)}: right.`, `Ai ales ${test(picked)}: corect.`);
  return bi(`You picked ${test(picked)}, IG ${fmt(picked.ig)}; the largest is ${test(best)}, IG ${fmt(best.ig)}.`,
    `Ai ales ${test(picked)}, IG ${fmt(picked.ig)}; cel mai mare e ${test(best)}, IG ${fmt(best.ig)}.`);
}
export const testLabel = test;

// Where the marks go: the plot is `w` wide with `pad` around it; a value maps linearly, a y value upwards.
export function plotScale(points, plane, w = 320, h = plane ? 250 : 100, pad = 26) {
  const range = (vs) => {
    const lo = Math.min(...vs);
    const hi = Math.max(...vs);
    const m = hi === lo ? 1 : (hi - lo) * 0.08;
    return [lo - m, hi + m];
  };
  const [x0, x1] = range(points.map((p) => p.x));
  const [y0, y1] = plane ? range(points.map((p) => p.y)) : [0, 1];
  const clampTo = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  return {
    w, h, pad, domainX: [x0, x1], domainY: [y0, y1],
    X: (x) => pad + ((clampTo(x, x0, x1) - x0) / (x1 - x0)) * (w - 2 * pad),
    Y: (y) => (plane ? h - pad - ((clampTo(y, y0, y1) - y0) / (y1 - y0)) * (h - 2 * pad) : h / 2),
  };
}

// The class colour and shape: positive and negative labels use the keep and drop tokens, any other class a series token.
export function classMark(classes, k) {
  const l = String(classes[k]).toLowerCase();
  const pol = polarity(l);
  const colour = pol === 'pos' ? 'var(--lt-keep)' : pol === 'neg' ? 'var(--lt-drop)' : `var(--lt-t${k % 4})`;
  return { colour, shape: ['circle', 'square', 'triangle', 'diamond'][k % 4] };
}
