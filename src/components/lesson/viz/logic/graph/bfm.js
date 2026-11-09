// graph-walk, mode bfm: Bellman-Ford-Moore in the notation of the course (agr3 p.18-22). u_i^1 = a_si (u_s^1 = 0), then
// u_i^{k+1} = min(u_i^k, min over j != i of (u_j^k + a_ji)) for k = 1 .. n-2, so the last table is u^{n-1}. Arc costs may be
// negative; a negative circuit reachable from s breaks the method, so the widget refuses such a graph.
import { both, readGraph, INF } from './common.js';

export function bfm(props) {
  const G = readGraph(props);
  if (!G.directed) throw new RangeError('bfm: the graph is directed');
  const { ids } = G;
  const s = props.source;
  if (!G.pos[s]) throw new RangeError('bfm: props.source is not a node');
  const n = ids.length;
  const a = {};
  for (const i of ids) a[i] = {};
  for (const e of G.edges) {
    if (typeof e.w !== 'number' || !Number.isFinite(e.w)) throw new RangeError('bfm: every arc needs a cost w');
    a[e.u][e.v] = e.w;
  }
  const step = (u) => {
    const nu = {};
    const how = {};
    for (const i of ids) {
      let best = u[i];
      let via = null;
      for (const j of ids) {
        if (j === i || a[j][i] === undefined || u[j] === Infinity) continue;
        const c = u[j] + a[j][i];
        if (c < best) { best = c; via = j; }
      }
      nu[i] = best;
      how[i] = via;
    }
    return { nu, how };
  };
  const u1 = {};
  for (const i of ids) u1[i] = i === s ? 0 : (a[s][i] ?? Infinity);
  const tables = [u1];
  const hows = [null];
  for (let k = 1; k <= n - 2; k++) {
    const { nu, how } = step(tables[tables.length - 1]);
    tables.push(nu);
    hows.push(how);
  }
  // the course's check: one more round must change nothing, or a negative circuit is reachable from s
  const probe = step(tables[tables.length - 1]).nu;
  if (ids.some((i) => probe[i] !== tables[tables.length - 1][i])) throw new RangeError('bfm: a negative circuit is reachable from the source');

  const frames = tables.map((u, f) => ({ kind: 'round', f, k: f + 1, u: { ...u }, how: hows[f], prev: f ? tables[f - 1] : null }));
  const R = frames.length - 1;
  const U = (x) => (x === Infinity ? INF : String(x));
  const P = (x) => (x < 0 ? `(${x})` : String(x)); // a negative cost in a sum
  const changed = (f) => (f === 0 ? [] : ids.filter((i) => frames[f].u[i] !== frames[f - 1].u[i]));
  // the node asked in round f: the first one that changes, else the first node that is not s
  const askedNode = (f) => changed(f)[0] ?? ids.find((i) => i !== s);
  const M = { frames, count: frames.length, tables, ids, final: { ...tables[R] }, changed, askedNode, mode: 'bfm' };

  M.pickSpec = (k, predict = true) => {
    if (!predict || k >= R) return null;
    const i = askedNode(k + 1);
    const cur = frames[k].u;
    const cand = new Set([cur[i]]);
    for (const j of ids) if (j !== i && a[j][i] !== undefined && cur[j] !== Infinity) cand.add(cur[j] + a[j][i]);
    const opts = [...cand].sort((x, y) => (x === Infinity ? 1 : y === Infinity ? -1 : x - y));
    const ans = frames[k + 1].u[i];
    const kk = frames[k].k;
    return { items: [{
      key: `f${k}-u`, kind: 'single', answer: U(ans),
      prompt: { en: `What is u_${i}^${kk + 1}?`, ro: `Cât este u_${i}^${kk + 1}?` },
      options: opts.map((x) => ({ id: U(x), label: U(x) })),
      fb: (p, ok) => both((lang) => {
        const via = hows[k + 1][i];
        const T = (en, ro) => (lang === 'en' ? en : ro);
        if (ok) return via === null ? T(`u_${i}^${kk} = ${U(cur[i])} and no arc into ${i} gives less: it stays.`, `u_${i}^${kk} = ${U(cur[i])}, iar niciun arc spre ${i} nu dă mai puțin: rămâne.`) : T(`u_${via}^${kk} + a_${via}${i} = ${U(cur[via])} + ${P(a[via][i])} = ${U(ans)}.`, `u_${via}^${kk} + a_${via}${i} = ${U(cur[via])} + ${P(a[via][i])} = ${U(ans)}.`);
        return T(`Take the minimum of u_${i}^${kk} and every u_j^${kk} + a_j${i} over the arcs j to ${i}.`, `Ia minimul dintre u_${i}^${kk} și toți u_j^${kk} + a_j${i} peste arcele j spre ${i}.`);
      }),
    }] };
  };

  M.caption = (k) => both((lang) => {
    const T = (en, ro) => (lang === 'en' ? en : ro);
    const f = frames[k];
    if (k === 0) {
      const given = ids.filter((i) => i !== s && a[s][i] !== undefined).map((i) => `u_${i}^1 = ${a[s][i]}`);
      return T(`u_${s}^1 = 0 and u_i^1 = a_${s}i: ${given.join(', ') || 'no arc leaves ' + s}; ${INF} where there is no arc from ${s}. The next tables use u_i^{k+1} = min(u_i^k, min over j of u_j^k + a_ji).`, `u_${s}^1 = 0 și u_i^1 = a_${s}i: ${given.join(', ') || 'niciun arc nu pleacă din ' + s}; ${INF} unde nu există arc din ${s}. Tabelele următoare folosesc u_i^{k+1} = min(u_i^k, min peste j din u_j^k + a_ji).`);
    }
    const ch = changed(k);
    const parts = ch.map((i) => { const via = f.how[i]; return `u_${i}^${f.k} = min(${U(f.prev[i])}, u_${via}^${f.k - 1} + a_${via}${i}) = min(${U(f.prev[i])}, ${U(f.prev[via])} + ${P(a[via][i])}) = ${U(f.u[i])}`; });
    const last = k === R ? T(' This is the last table (k = n − 1): the costs are final.', ' Ultimul tabel (k = n − 1): costurile sunt finale.') : '';
    return (ch.length ? T(`Round ${f.k - 1}: ${parts.join('; ')}.`, `Runda ${f.k - 1}: ${parts.join('; ')}.`) : T(`Round ${f.k - 1}: no value changes.`, `Runda ${f.k - 1}: nicio valoare nu se schimbă.`)) + last;
  });

  M.scene = (k) => {
    const f = frames[k];
    const ch = new Set(changed(k));
    const nodes = G.nodes.map((nd) => ({ id: nd.id, x: nd.x, y: nd.y, cls: ch.has(nd.id) ? 'focus' : nd.id === s ? 'fixed' : '', label: { items: [{ t: U(f.u[nd.id]), hl: ch.has(nd.id) }] }, above: nd.lab === 'above' }));
    const edges = G.edges.map((e) => ({ u: e.u, v: e.v, w: e.w, arrow: true, cls: k > 0 && ch.has(e.v) && f.how[e.v] === e.u ? 'ok' : '' }));
    const rows = frames.slice(0, k + 1).map((r) => Object.fromEntries([['k', r.k], ...ids.map((i) => [`u:${i}`, U(r.u[i])])]));
    return { nodes, edges, table: { columns: ['k', ...ids.map((i) => `u:${i}`)], rows, hlRow: k, heads: { k: 'k', ...Object.fromEntries(ids.map((i) => [`u:${i}`, `u_${i}^k`])) } } };
  };
  return M;
}
