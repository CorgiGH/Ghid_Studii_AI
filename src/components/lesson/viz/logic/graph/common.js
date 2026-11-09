// Shared pieces of the graph-walk widget: reading the graph, the pick specs every mode asks, and judging a pick.
// Every frame of every mode is computed from the nodes, edges and domains in the lesson JSON; nothing is typed in.
// A pick spec is { items: [{ key, kind: 'single' | 'multi', prompt, options: [{ id, label }], answer, confirm?, fb }] }.
import { roCount, enCount } from '../words.js';

export const both = (f) => ({ en: f('en'), ro: f('ro') });
export const INF = '∞';

// Where a node's value labels go: under it, unless its edges mostly leave downward (then they would run through the labels), in which
// case over it. A node that says lab: 'above' or lab: 'below' keeps that.
export function placeLabels(nodes, edges) {
  const at = Object.fromEntries(nodes.map((n) => [n.id, n]));
  return nodes.map((n) => {
    if (n.lab === 'above' || n.lab === 'below') return n;
    let dy = 0;
    for (const e of edges) {
      const o = e.u === n.id ? at[e.v] : e.v === n.id ? at[e.u] : null;
      if (!o) continue;
      const d = Math.hypot(o.x - n.x, o.y - n.y) || 1;
      dy += (o.y - n.y) / d;
    }
    return { ...n, lab: dy > 0.9 ? 'above' : 'below' };
  });
}

export function readGraph(props) {
  const nodes = props.nodes;
  const ids = nodes.map((n) => n.id);
  if (new Set(ids).size !== ids.length) throw new RangeError('graph-walk: node ids must be distinct');
  const raw = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const edges = (props.edges || []).map((e) => {
    if (!raw[e.u] || !raw[e.v]) throw new RangeError(`graph-walk: edge ${e.u}-${e.v} names an unknown node`);
    return { ...e };
  });
  const placed = placeLabels(nodes, edges);
  const pos = Object.fromEntries(placed.map((n) => [n.id, n]));
  // neighbours in the order of the node list (the lesson's order: A, B, C ...)
  const nb = (id) => ids.filter((o) => o !== id && edges.some((e) => (e.u === id && e.v === o) || (e.v === id && e.u === o)));
  const edgeOf = (a, b) => edges.find((e) => (e.u === a && e.v === b) || (e.u === b && e.v === a));
  return { nodes: placed, ids, pos, edges, nb, edgeOf, directed: !!props.directed };
}

// The picture needs a box: the nodes plus room for the value labels under them.
export function boxOf(nodes, pad = 34) {
  // a node's value labels sit under it (or over it with lab: 'above'); the box covers them
  const below = (n) => n.y + 19 + 38;
  const above = (n) => n.y - 19 - 40;
  const x0 = Math.min(...nodes.map((n) => n.x)) - pad;
  const x1 = Math.max(...nodes.map((n) => n.x)) + pad;
  const y0 = Math.min(...nodes.map((n) => (n.lab === 'above' ? above(n) : n.y - pad)));
  const y1 = Math.max(...nodes.map((n) => (n.lab === 'above' ? n.y + pad : below(n))));
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

export const alpha = (a, b) => (String(a) < String(b) ? -1 : String(a) > String(b) ? 1 : 0);
export const showSet = (xs) => `{${xs.join(', ')}}`;
export const showArc = (a) => `(${a[0]}, ${a[1]})`;
export const sameSet = (a, b) => a.length === b.length && a.every((x) => b.includes(x));

// judge a pick: a single option, or the set of tapped options (confirmed)
export function judge(item, pick) {
  if (item.kind === 'multi') return Array.isArray(pick) && sameSet(pick.map(String), item.answer.map(String));
  return pick !== undefined && String(pick) === String(item.answer);
}
export const confirmKey = (key) => `${key}#c`;
export function answered(spec, picks) {
  return !spec || spec.items.every((it) => (it.kind === 'multi' ? picks[confirmKey(it.key)] === true : picks[it.key] !== undefined));
}
export function feedback(item, pick) {
  const ok = judge(item, pick);
  return { ok, msg: item.fb ? item.fb(pick, ok) : null };
}

// counted words in both languages
export const nodesWord = (n) => ({ en: enCount(n, 'node', 'nodes'), ro: roCount(n, 'nod', 'noduri') });
export const valuesWord = (n) => ({ en: enCount(n, 'value', 'values'), ro: roCount(n, 'valoare', 'valori') });
export const arcsWord = (n) => ({ en: enCount(n, 'arc', 'arcs'), ro: roCount(n, 'arc', 'arce') });
export const L = (o, lang) => o[lang];

// connected components of the graph without one node and/or one edge, each in the order of the node list
export function components(G, { skipNode, skipEdge } = {}) {
  const keep = G.ids.filter((i) => i !== skipNode);
  const seen = new Set();
  const out = [];
  for (const s of keep) {
    if (seen.has(s)) continue;
    const comp = [];
    const stack = [s];
    seen.add(s);
    while (stack.length) {
      const x = stack.pop();
      comp.push(x);
      for (const e of G.edges) {
        if (e === skipEdge) continue;
        const y = e.u === x ? e.v : e.v === x ? e.u : null;
        if (y === null || y === skipNode || seen.has(y)) continue;
        seen.add(y);
        stack.push(y);
      }
    }
    out.push(G.ids.filter((i) => comp.includes(i)));
  }
  return out;
}

// the name of an edge as the course writes it: its two ends in the order of the node list (DE, 12)
export function edgeName(G, e) {
  const [a, b] = [e.u, e.v].sort((x, y) => G.ids.indexOf(x) - G.ids.indexOf(y));
  return G.ids.every((i) => i.length === 1) ? `${a}${b}` : `${a}-${b}`;
}
