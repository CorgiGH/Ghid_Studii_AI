// graph-walk, mode dijkstra: notation of the course (agr3 p.9): S the fixed nodes, u_i the best cost found to i, before[i] the node
// before i on that path, a_ij the cost of the arc from i to j. Round 0 gives u_i = a_si; each later round fixes j*, the node outside
// S with the smallest u (ties alphabetical), and then u_j = min(u_j, u_j* + a_j*j) for the nodes j outside S.
import { both, readGraph, INF, alpha } from './common.js';
import { listEn, listRo } from '../words.js';

const lst = (lang, xs) => (lang === 'en' ? listEn(xs) : listRo(xs));

export function dijkstra(props) {
  const G = readGraph(props);
  const { ids } = G;
  const s = props.source;
  if (!G.pos[s]) throw new RangeError('dijkstra: props.source is not a node');
  const target = props.target;
  if (target !== undefined && !G.pos[target]) throw new RangeError('dijkstra: props.target is not a node');
  const a = {};
  for (const id of ids) a[id] = {};
  for (const e of G.edges) {
    if (typeof e.w !== 'number' || e.w < 0) throw new RangeError('dijkstra: every arc needs a cost w >= 0');
    a[e.u][e.v] = e.w;
    if (!G.directed) a[e.v][e.u] = e.w;
  }
  const others = ids.filter((i) => i !== s);
  const u = { [s]: 0 };
  const before = { [s]: 0 };
  for (const i of others) { u[i] = a[s][i] ?? Infinity; before[i] = a[s][i] !== undefined ? s : null; }
  const S = [s];
  const snap = () => ({ u: { ...u }, before: { ...before }, S: [...S] });
  const rounds = [{ k: 0, fixed: s, ...snap(), relaxed: [], seen: others.filter((i) => a[s][i] !== undefined).map((i) => [s, i]), updates: others.filter((i) => a[s][i] !== undefined).map((i) => ({ j: i, from: s, old: Infinity, via: a[s][i], now: a[s][i], improved: true })) }];
  while (S.length < ids.length) {
    const out = ids.filter((i) => !S.includes(i));
    const finite = out.filter((i) => u[i] !== Infinity).sort((x, y) => u[x] - u[y] || alpha(x, y));
    if (!finite.length) break;
    const j = finite[0];
    S.push(j);
    const updates = [];
    for (const i of out.filter((x) => x !== j)) {
      if (a[j][i] === undefined) continue;
      const cand = u[j] + a[j][i];
      const improved = cand < u[i];
      updates.push({ j: i, from: j, old: u[i], via: cand, now: improved ? cand : u[i], improved, w: a[j][i] });
      if (improved) { u[i] = cand; before[i] = j; }
    }
    rounds.push({ k: rounds.length, fixed: j, ...snap(), relaxed: updates.filter((x) => x.improved).map((x) => [j, x.j]), seen: updates.filter((x) => !x.improved).map((x) => [j, x.j]), updates });
  }
  const R = rounds.length - 1;
  const pathTo = (t) => {
    const p = [t];
    while (p[0] !== s && before[p[0]] !== null && before[p[0]] !== undefined) p.unshift(before[p[0]]);
    return p[0] === s ? p : null;
  };
  // every simple path from x to y (the graphs of a lesson are small), and the cost of one
  const simplePaths = (x, y) => {
    const out = [];
    const walk = (p) => {
      if (out.length >= 200) return;
      const last = p[p.length - 1];
      if (last === y) { out.push(p); return; }
      for (const n of ids) if (a[last][n] !== undefined && !p.includes(n)) walk([...p, n]);
    };
    walk([x]);
    return out;
  };
  const costOf = (p) => p.slice(1).reduce((acc, n, i) => acc + a[p[i]][n], 0);
  const frames = rounds.map((r) => ({ kind: 'round', ...r }));
  if (target !== undefined) frames.push({ kind: 'done', ...snap(), k: R + 1, path: pathTo(target) });

  const cell = (r, i) => (r.u[i] === Infinity ? INF : `${r.u[i]} (${r.before[i]})${r.fixed === i ? ' ✓' : ''}`);
  const table = {
    columns: ['k', 'fix', ...others.map((i) => `u:${i}`)],
    rowsUpTo: (k) => rounds.slice(0, k + 1).map((r) => Object.fromEntries([['k', r.k], ['fix', r.fixed], ...others.map((i) => [`u:${i}`, cell(r, i)])])),
  };
  const M = { frames, count: frames.length, ids, rounds, table, final: { u: { ...u }, before: { ...before } }, pathTo, mode: 'dijkstra' };
  const U = (x) => (x === Infinity ? INF : String(x));

  M.pickSpec = (k, predict = true) => {
    const f = frames[k];
    if (!predict || !f) return null;
    if (f.kind === 'round' && k < R) {
      const out = ids.filter((i) => !f.S.includes(i));
      if (out.length < 2) return null; // one node left outside S: nothing to choose
      const next = rounds[k + 1].fixed;
      return { items: [{
        key: `f${k}-fix`, kind: 'single', answer: next,
        prompt: { en: 'Which node do we fix now?', ro: 'Care nod fixăm acum?' },
        options: out.map((i) => ({ id: i, label: i })),
        fb: (p, ok) => both((lang) => (ok
          ? (lang === 'en' ? `u_${next} = ${U(f.u[next])} is the smallest outside S.` : `u_${next} = ${U(f.u[next])} e cel mai mic din afara lui S.`)
          : (lang === 'en' ? `u_${p} = ${U(f.u[p])}, but u_${next} = ${U(f.u[next])} is smaller: fix the smallest u outside S.` : `u_${p} = ${U(f.u[p])}, dar u_${next} = ${U(f.u[next])} e mai mic: fixăm cel mai mic u din afara lui S.`))),
      }] };
    }
    if (f.kind === 'round' && target !== undefined) {
      // the path to the target, read back through before[]; the other options are the next cheapest paths of the graph
      const path = pathTo(target);
      if (!path) return null;
      const chains = [path, ...simplePaths(s, target).filter((q) => q.join() !== path.join()).sort((x, y) => costOf(x) - costOf(y) || alpha(x.join(), y.join())).slice(0, 2)];
      if (chains.length < 2) return null;
      const show = (q) => q.join(' → ');
      const back = path.slice(1).reverse().map((n) => `before[${n}] = ${before[n]}`).join(', ');
      return { items: [{
        key: `f${k}-path`, kind: 'single', answer: show(path),
        prompt: { en: `Follow before[i] back from ${target}: which path reaches ${target} at cost u_${target}?`, ro: `Urmează before[i] înapoi din ${target}: pe ce drum se ajunge la ${target} cu costul u_${target}?` },
        options: [...chains].sort((x, y) => alpha(x.join(), y.join())).map((q) => ({ id: show(q), label: show(q) })),
        fb: (p, ok) => both((lang) => {
          const T = (en, ro) => (lang === 'en' ? en : ro);
          if (ok) return T(`Right: ${back}.`, `Corect: ${back}.`);
          const q = chains.find((x) => show(x) === p);
          return T(`That path costs ${costOf(q)}. Read it back from ${target}: ${back}.`, `Drumul acela costă ${costOf(q)}. Citește-l înapoi din ${target}: ${back}.`);
        }),
      }] };
    }
    return null;
  };

  M.caption = (k) => both((lang) => {
    const f = frames[k];
    const T = (en, ro) => (lang === 'en' ? en : ro);
    if (f.kind === 'done') {
      const p = f.path;
      if (!p) return T(`${target} cannot be reached from ${s}.`, `${target} nu poate fi atins din ${s}.`);
      const ws = p.slice(1).map((n, i) => a[p[i]][n]);
      return T(`u_${target} = ${U(u[target])}. Following before[i] back from ${target}: ${p.join(' → ')}, ${ws.join(' + ')} = ${U(u[target])}.`, `u_${target} = ${U(u[target])}. Urmând before[i] înapoi din ${target}: ${p.join(' → ')}, ${ws.join(' + ')} = ${U(u[target])}.`);
    }
    if (f.k === 0) {
      const givenNodes = f.updates.map((x) => `u_${x.j} = ${x.now}`);
      const none = others.filter((i) => a[s][i] === undefined);
      return T(`S = {${s}}, u_${s} = 0. For every other node u_i = a_${s}i${givenNodes.length ? `: ${givenNodes.join(', ')}` : ''}${none.length ? `; no arc from ${s} to ${lst(lang, none)}, so ${INF}` : ''}. before[i] = ${s}.`, `S = {${s}}, u_${s} = 0. Pentru fiecare alt nod u_i = a_${s}i${givenNodes.length ? `: ${givenNodes.join(', ')}` : ''}${none.length ? `; fără arc de la ${s} la ${lst(lang, none)}, deci ${INF}` : ''}. before[i] = ${s}.`);
    }
    const j = f.fixed;
    const ups = f.updates.map((x) => (x.improved
      ? `u_${x.j} = min(${U(x.old)}, ${U(f.u[j])} + ${x.w}) = ${x.now}, before[${x.j}] = ${j}`
      : `u_${x.j} = min(${U(x.old)}, ${U(f.u[j])} + ${x.w}) stays ${U(x.old)}`));
    const upsRo = f.updates.map((x) => (x.improved
      ? `u_${x.j} = min(${U(x.old)}, ${U(f.u[j])} + ${x.w}) = ${x.now}, before[${x.j}] = ${j}`
      : `u_${x.j} = min(${U(x.old)}, ${U(f.u[j])} + ${x.w}) rămâne ${U(x.old)}`));
    const fromJ = f.updates.length ? T(` From ${j}: ${ups.join('; ')}.`, ` Din ${j}: ${upsRo.join('; ')}.`) : T(` No arc goes from ${j} to a node outside S.`, ` Din ${j} nu pleacă niciun arc spre un nod din afara lui S.`);
    return T(`j* = ${j}: the smallest u outside S (u_${j} = ${U(f.u[j])}). S = {${f.S.join(', ')}}.${fromJ}`, `j* = ${j}: cel mai mic u din afara lui S (u_${j} = ${U(f.u[j])}). S = {${f.S.join(', ')}}.${fromJ}`);
  });

  M.scene = (k) => {
    const f = frames[k];
    const isDone = f.kind === 'done';
    const treeEdge = new Set();
    if (isDone && f.path) {
      f.path.slice(1).forEach((n, i) => {
        treeEdge.add(`${f.path[i]}>${n}`);
        if (!G.directed) treeEdge.add(`${n}>${f.path[i]}`); // an undirected edge may be stored the other way round
      });
    }
    const nodes = G.nodes.map((n) => {
      const id = n.id;
      const inS = f.S.includes(id);
      let cls = inS ? 'fixed' : '';
      if (!isDone && id === f.fixed && f.k > 0) cls = 'focus';
      if (isDone && f.path && f.path.includes(id)) cls = 'focus';
      const lbl = { items: [{ t: id === s ? '0' : U(f.u[id]) }] };
      const sub = id !== s && f.before[id] !== null && f.before[id] !== undefined && f.u[id] !== Infinity ? { en: `(${f.before[id]})`, ro: `(${f.before[id]})` } : undefined;
      return { id, x: n.x, y: n.y, cls, label: lbl, sub, above: n.lab === 'above' };
    });
    const hasA = (list, e) => list.some((x) => (x[0] === e.u && x[1] === e.v) || (!G.directed && x[0] === e.v && x[1] === e.u));
    const edges = G.edges.map((e) => {
      let cls = '';
      if (isDone) cls = treeEdge.has(`${e.u}>${e.v}`) ? 'ok' : 'dim';
      else if (hasA(f.relaxed, e)) cls = 'ok';
      else if (hasA(f.seen, e)) cls = 'hl';
      return { u: e.u, v: e.v, w: e.w, cls, arrow: G.directed };
    });
    const hl = isDone ? rounds.length - 1 : f.k;
    return { nodes, edges, table: { columns: table.columns, rows: table.rowsUpTo(Math.min(hl, R)), hlRow: Math.min(hl, R) } };
  };
  return M;
}
