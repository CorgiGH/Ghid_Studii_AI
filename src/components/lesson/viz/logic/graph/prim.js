// graph-walk, mode prim: notation of the course (agr5 p.10-12): the tree is T_s = (V_s, E_s), V_s its nodes. For j outside V_s,
// β[j] = c(α[j]j) = min over i in V_s, ij in E of c(ij): the cost of the cheapest edge from j to a node of V_s, α[j] that node.
// Start with V_s = {s}; add j*, the node outside V_s with the smallest β (ties alphabetical), then update β and α of the nodes
// outside V_s.
import { both, readGraph, INF, alpha } from './common.js';

export function prim(props) {
  const G = readGraph(props);
  if (G.directed) throw new RangeError('prim: the graph is undirected');
  if (!G.edges.every((e) => typeof e.w === 'number' && Number.isFinite(e.w))) throw new RangeError('prim: every edge needs a cost w');
  const { ids } = G;
  const start = props.source ?? ids[0];
  if (!G.pos[start]) throw new RangeError('prim: props.source is not a node');
  const others = ids.filter((i) => i !== start);
  const beta = {};
  const al = {};
  const T = [start];
  for (const i of others) {
    const e = G.edgeOf(start, i);
    beta[i] = e ? e.w : Infinity;
    al[i] = e ? start : null;
  }
  const snap = () => ({ T: [...T], beta: { ...beta }, al: { ...al } });
  const frames = [{ kind: 'round', k: 0, added: start, ...snap(), updates: others.filter((i) => al[i] !== null).map((i) => ({ j: i, old: Infinity, now: beta[i], from: start, improved: true })), tree: [], cost: 0 }];
  let cost = 0;
  const tree = [];
  while (T.length < ids.length) {
    const out = ids.filter((i) => !T.includes(i));
    const finite = out.filter((i) => beta[i] !== Infinity).sort((x, y) => beta[x] - beta[y] || alpha(x, y));
    if (!finite.length) throw new RangeError('prim: the graph is not connected');
    const j = finite[0];
    const edge = { u: al[j], v: j, w: beta[j] };
    cost += beta[j];
    tree.push(edge);
    T.push(j);
    const updates = [];
    for (const i of out.filter((x) => x !== j)) {
      const e = G.edgeOf(j, i);
      if (!e) continue;
      const improved = e.w < beta[i];
      updates.push({ j: i, old: beta[i], now: improved ? e.w : beta[i], from: j, w: e.w, improved });
      if (improved) { beta[i] = e.w; al[i] = j; }
    }
    frames.push({ kind: 'round', k: frames.length, added: j, edge, ...snap(), updates, tree: tree.map((x) => ({ ...x })), cost });
  }
  const R = frames.length - 1;
  const B = (x) => (x === Infinity ? INF : String(x));
  const M = { frames, count: frames.length, cost, tree, order: T, start, mode: 'prim' };

  M.pickSpec = (k, predict = true) => {
    if (!predict || k >= R) return null;
    const f = frames[k];
    const next = frames[k + 1].added;
    const out = ids.filter((i) => !f.T.includes(i));
    if (out.length < 2) return null; // one node left outside V_s: nothing to choose
    return { items: [{
      key: `f${k}-add`, kind: 'single', answer: next,
      prompt: { en: 'Which node joins the tree now?', ro: 'Care nod intră acum în arbore?' },
      options: out.map((i) => ({ id: i, label: i })),
      fb: (p, ok) => both((lang) => (lang === 'en'
        ? (ok ? `β[${next}] = ${B(f.beta[next])} is the smallest outside V_s.` : `β[${p}] = ${B(f.beta[p])}, but β[${next}] = ${B(f.beta[next])} is smaller: take the smallest β outside V_s.`)
        : (ok ? `β[${next}] = ${B(f.beta[next])} e cel mai mic din afara lui V_s.` : `β[${p}] = ${B(f.beta[p])}, dar β[${next}] = ${B(f.beta[next])} e mai mic: luăm cel mai mic β din afara lui V_s.`))),
    }] };
  };

  M.caption = (k) => both((lang) => {
    const T_ = (en, ro) => (lang === 'en' ? en : ro);
    const f = frames[k];
    const ups = f.updates.filter((x) => x.improved);
    const upText = (x) => (k === 0 ? `β[${x.j}] = ${x.now}, α[${x.j}] = ${x.from}` : `β[${x.j}] = min(${B(x.old)}, ${x.w}) = ${x.now}, α[${x.j}] = ${x.from}`);
    if (k === 0) {
      const none = others.filter((i) => al[i] === null && f.beta[i] === Infinity);
      return T_(
        `V_s = {${start}}, the nodes of the tree T. β[j] is the cost of the cheapest edge from j to a node of V_s, α[j] that node: ${ups.map(upText).join('; ') || 'no edge leaves V_s'}${none.length ? `; β = ${INF} for ${none.join(', ')}` : ''}.`,
        `V_s = {${start}}, nodurile arborelui T. β[j] e costul celei mai ieftine muchii de la j la un nod din V_s, α[j] acel nod: ${ups.map(upText).join('; ') || 'nicio muchie nu iese din V_s'}${none.length ? `; β = ${INF} pentru ${none.join(', ')}` : ''}.`);
    }
    const e = f.edge;
    const head = T_(`${e.u}${e.v} (${e.w}) joins ${e.v}: β[${e.v}] = ${e.w} was the smallest outside V_s. V_s = {${f.T.join(', ')}}.`, `${e.u}${e.v} (${e.w}) aduce nodul ${e.v}: β[${e.v}] = ${e.w} era cel mai mic din afara lui V_s. V_s = {${f.T.join(', ')}}.`);
    const tail = f.updates.length === 0 ? '' : ups.length ? T_(` Update: ${ups.map(upText).join('; ')}.`, ` Actualizăm: ${ups.map(upText).join('; ')}.`) : T_(' No β gets smaller.', ' Niciun β nu scade.');
    const end = k === R ? T_(` Done: c(T) = ${f.cost}, with ${R} edges = n\u00a0−\u00a01.`, ` Gata: c(T) = ${f.cost}, cu ${R} muchii = n\u00a0−\u00a01.`) : '';
    return head + tail + end;
  });

  M.scene = (k) => {
    const f = frames[k];
    const nodes = G.nodes.map((nd) => {
      const id = nd.id;
      const inT = f.T.includes(id);
      const cls = inT ? (id === f.added ? 'focus' : 'fixed') : '';
      const label = inT ? undefined : { items: [{ t: B(f.beta[id]) }] };
      const sub = !inT && f.al[id] ? `(${f.al[id]})` : undefined;
      return { id, x: nd.x, y: nd.y, cls, label, sub, above: nd.lab === 'above' };
    });
    const inTree = (e) => f.tree.some((x) => (x.u === e.u && x.v === e.v) || (x.u === e.v && x.v === e.u));
    const cand = (e) => ids.some((i) => !f.T.includes(i) && f.al[i] && ((e.u === i && e.v === f.al[i]) || (e.v === i && e.u === f.al[i])));
    const edges = G.edges.map((e) => ({ u: e.u, v: e.v, w: e.w, cls: inTree(e) ? 'ok' : cand(e) ? 'hl' : '' }));
    const rows = frames.slice(0, k + 1).map((r) => Object.fromEntries([['added', r.added], ...others.map((i) => [`b:${i}`, r.T.includes(i) ? '–' : r.beta[i] === Infinity ? INF : `${r.beta[i]} (${r.al[i]})`])]));
    return {
      nodes, edges,
      table: { columns: ['added', ...others.map((i) => `b:${i}`)], rows, hlRow: k, heads: { added: { en: 'Added', ro: 'Adăugat' }, ...Object.fromEntries(others.map((i) => [`b:${i}`, `β[${i}]`])) } },
    };
  };
  return M;
}
