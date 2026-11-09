// graph-walk, mode kruskal: sort the edges by cost (ties by name), take each one if its ends lie in different components, reject
// it if they lie in the same one (it would close a circuit). After the last accepted edge the remaining ones are still checked
// and rejected, as the course's table lists them. Frames are computed from the edges of the lesson JSON.
import { both, readGraph, alpha, showSet, edgeName } from './common.js';

export function kruskal(props) {
  const G = readGraph(props);
  if (G.directed) throw new RangeError('kruskal: the graph is undirected');
  if (!G.edges.every((e) => typeof e.w === 'number' && Number.isFinite(e.w))) throw new RangeError('kruskal: every edge needs a cost w');
  const { ids } = G;
  const n = ids.length;
  const sorted = G.edges.map((e) => ({ ...e, name: edgeName(G, e) })).sort((x, y) => x.w - y.w || alpha(x.name, y.name));
  const m = sorted.length;
  const accepted = [];
  const compOf = Object.fromEntries(ids.map((i) => [i, [i]]));
  const compsNow = () => {
    const seen = new Set();
    return ids.filter((i) => !seen.has(compOf[i]) && seen.add(compOf[i])).map((i) => [...compOf[i]].sort((a, b) => ids.indexOf(a) - ids.indexOf(b)));
  };
  // the path of accepted edges between two nodes: the circuit the rejected edge would close, with that edge
  const treePath = (a, b) => {
    const prev = { [a]: null };
    const queue = [a];
    while (queue.length) {
      const x = queue.shift();
      if (x === b) break;
      for (const e of accepted) {
        const y = e.u === x ? e.v : e.v === x ? e.u : null;
        if (y !== null && !(y in prev)) { prev[y] = { from: x, e }; queue.push(y); }
      }
    }
    const nodes = [b];
    const edges = [];
    for (let x = b; prev[x]; x = prev[x].from) { nodes.unshift(prev[x].from); edges.push(prev[x].e.name); }
    return { nodes, edges };
  };
  const frames = [{ kind: 'start', k: 0, decided: [], comps: compsNow(), cost: 0, nAcc: 0 }];
  const decided = [];
  let cost = 0;
  sorted.forEach((e, i) => {
    const same = compOf[e.u] === compOf[e.v];
    let circuit = null;
    if (same) circuit = treePath(e.u, e.v);
    else {
      const merged = [...compOf[e.u], ...compOf[e.v]];
      for (const x of merged) compOf[x] = merged;
      accepted.push(e);
      cost += e.w;
    }
    decided.push({ name: e.name, ok: !same, comp: same ? null : [...compOf[e.u]].sort((a, b) => ids.indexOf(a) - ids.indexOf(b)) });
    frames.push({ kind: 'edge', k: i + 1, edge: e, ok: !same, circuit, decided: decided.map((d) => ({ ...d })), comps: compsNow(), cost, nAcc: accepted.length, acceptedNames: accepted.map((x) => x.name) });
  });
  const final = frames[frames.length - 1];
  const complete = final.nAcc === n - 1;
  const M = { frames, count: frames.length, sorted, cost, accepted: accepted.map((e) => e.name), rejected: sorted.filter((e) => !accepted.includes(e)).map((e) => e.name), complete, mode: 'kruskal' };

  M.pickSpec = (k, predict = true) => {
    if (!predict || k >= m) return null;
    const next = frames[k + 1];
    const e = next.edge;
    const before = frames[k].comps;
    const cu = before.find((c) => c.includes(e.u));
    const cv = before.find((c) => c.includes(e.v));
    return { items: [{
      key: `f${k}-edge`, kind: 'single', answer: next.ok ? 'acc' : 'rej',
      prompt: { en: `Edge ${e.name}, cost ${e.w}: accept or reject?`, ro: `Muchia ${e.name}, cost ${e.w}: o accepți sau o respingi?` },
      options: [{ id: 'acc', label: { en: 'accept', ro: 'accepți' } }, { id: 'rej', label: { en: 'reject', ro: 'respingi' } }],
      fb: (p, ok) => both((lang) => {
        const T = (en, ro) => (lang === 'en' ? en : ro);
        if (next.ok) {
          return ok
            ? T(`${e.u} is in ${showSet(cu)} and ${e.v} in ${showSet(cv)}: different components, so ${e.name} joins them.`, `${e.u} e în ${showSet(cu)}, iar ${e.v} în ${showSet(cv)}: componente diferite, deci ${e.name} le unește.`)
            : T(`${e.u} is in ${showSet(cu)} and ${e.v} in ${showSet(cv)}: different components, so no circuit closes. Accept.`, `${e.u} e în ${showSet(cu)}, iar ${e.v} în ${showSet(cv)}: componente diferite, deci nu se închide niciun circuit. Se acceptă.`);
        }
        const circ = next.circuit.nodes.join('–');
        return ok
          ? T(`${e.u} and ${e.v} are already in one component: ${e.name} would close the circuit ${circ}–${e.u}.`, `${e.u} și ${e.v} sunt deja în aceeași componentă: ${e.name} ar închide circuitul ${circ}–${e.u}.`)
          : T(`${e.u} and ${e.v} are already joined through ${circ}: ${e.name} would close a circuit. Reject.`, `${e.u} și ${e.v} sunt deja legate prin ${circ}: ${e.name} ar închide un circuit. Se respinge.`);
      }),
    }] };
  };

  M.caption = (k) => both((lang) => {
    const T = (en, ro) => (lang === 'en' ? en : ro);
    const f = frames[k];
    if (f.kind === 'start') {
      return T(`Edges sorted by cost: ${sorted.map((e) => `${e.name} (${e.w})`).join(', ')}. Each node is its own component.`, `Muchiile sortate după cost: ${sorted.map((e) => `${e.name} (${e.w})`).join(', ')}. Fiecare nod e propria lui componentă.`);
    }
    const e = f.edge;
    let s;
    if (f.ok) s = T(`${e.name} (${e.w}) joins two components: accepted. Now ${showSet(f.decided.at(-1).comp)}.`, `${e.name} (${e.w}) unește două componente: acceptată. Acum ${showSet(f.decided.at(-1).comp)}.`);
    else s = T(`${e.name} (${e.w}) has both ends in one component: rejected, it would close the circuit ${f.circuit.nodes.join('–')}–${e.u}.`, `${e.name} (${e.w}) are ambele capete în aceeași componentă: respinsă, ar închide circuitul ${f.circuit.nodes.join('–')}–${e.u}.`);
    if (k === m) s += T(` Done: c(T) = ${f.cost}, with ${f.nAcc} edges${f.nAcc === n - 1 ? ` = n\u00a0−\u00a01` : ''}.`, ` Gata: c(T) = ${f.cost}, cu ${f.nAcc} muchii${f.nAcc === n - 1 ? ` = n\u00a0−\u00a01` : ''}.`);
    return s;
  });

  M.scene = (k) => {
    const f = frames[k];
    const colourOf = {};
    f.comps.filter((c) => c.length > 1).forEach((c, i) => c.forEach((x) => { colourOf[x] = `c${i % 6}`; }));
    const state = new Map(f.decided.map((d, i) => [sorted[i].name, d]));
    const nodes = G.nodes.map((nd) => ({ id: nd.id, x: nd.x, y: nd.y, cls: colourOf[nd.id] || '', above: nd.lab === 'above' }));
    const circ = new Set(f.kind === 'edge' && f.circuit ? f.circuit.edges : []);
    const edges = sorted.map((e) => {
      const d = state.get(e.name);
      let cls = '';
      if (f.kind === 'edge' && f.edge === e) cls = f.ok ? 'ok' : 'bad';
      else if (circ.has(e.name)) cls = 'hl';
      else if (d) cls = d.ok ? 'ok' : 'dim';
      return { u: e.u, v: e.v, w: e.w, cls };
    });
    const rows = sorted.map((e, i) => {
      const d = f.decided[i];
      return { edge: `${i === k && k < m ? '→ ' : ''}${e.name}`, w: e.w, comp: d ? (d.ok ? showSet(d.comp) : '–') : '', ok: d ? (d.ok ? '✓' : '✗') : '' };
    });
    return {
      nodes, edges,
      table: {
        columns: ['edge', 'w', 'comp', 'ok'], rows, hlRow: -1,
        rowCls: rows.map((_, i) => (i === k - 1 ? (f.ok ? 'pick' : 'gw-rej') : '')),
        heads: { edge: { en: 'Edge', ro: 'Muchie' }, w: { en: 'Cost', ro: 'Cost' }, comp: { en: 'Component after', ro: 'Componenta după' }, ok: { en: 'Accepted?', ro: 'Acceptată?' } },
      },
    };
  };
  return M;
}
