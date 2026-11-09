// graph-walk, mode colour: greedy colouring in the order of props.order (default: the node list). Each node takes the smallest
// colour no neighbour already has, which is how the lesson's wheel gets its 4 colours (ag-cp-10b). The learner taps the colour;
// an illegal pick names the neighbour that has it, a legal but larger one is told to take the smallest free colour.
// The end shows k colours, so chi(G) <= k, beside the clique number omega(G) <= chi(G).
import { both, readGraph } from './common.js';

export function colour(props) {
  const G = readGraph(props);
  if (G.directed) throw new RangeError('colour: the graph is undirected');
  const { ids } = G;
  const order = props.order ?? ids;
  if (!Array.isArray(order) || order.length !== ids.length || !ids.every((i) => order.includes(i))) throw new RangeError('colour: props.order must list every node once');
  const col = {};
  const steps = [];
  for (const id of order) {
    const used = G.nb(id).filter((x) => x in col).map((x) => ({ x, c: col[x] }));
    let c = 1;
    while (used.some((u) => u.c === c)) c++;
    col[id] = c;
    steps.push({ id, c, used, colours: { ...col } });
  }
  const K = Math.max(...Object.values(col));
  // clique number by search; the graphs of a lesson are small
  const adj = (a, b) => !!G.edgeOf(a, b);
  let omega = 1;
  const grow = (cl, cand) => { omega = Math.max(omega, cl.length); cand.forEach((v, i) => { if (cl.every((x) => adj(x, v))) grow([...cl, v], cand.slice(i + 1)); }); };
  grow([], ids);
  const frames = [{ kind: 'start', k: 0, colours: {} }, ...steps.map((s, i) => ({ kind: 'node', k: i + 1, ...s }))];
  const M = { frames, count: frames.length, colours: col, K, omega, steps, order, mode: 'colour' };

  M.pickSpec = (k, predict = true) => {
    if (!predict || k >= frames.length - 1) return null;
    const s = frames[k + 1];
    const palette = Array.from({ length: K }, (_, i) => i + 1);
    return { items: [{
      key: `f${k}-col`, kind: 'single', answer: String(s.c),
      prompt: { en: `Which colour does ${s.id} take?`, ro: `Ce culoare ia ${s.id}?` },
      options: palette.map((c) => ({ id: String(c), label: String(c) })),
      fb: (p, ok) => both((lang) => {
        const T = (en, ro) => (lang === 'en' ? en : ro);
        const c = Number(p);
        const clash = s.used.find((u) => u.c === c);
        if (ok) return s.used.length ? T(`${s.id} touches ${s.used.map((u) => `${u.x} (${u.c})`).join(', ')}; ${s.c} is the smallest colour none of them has.`, `${s.id} se învecinează cu ${s.used.map((u) => `${u.x} (${u.c})`).join(', ')}; ${s.c} e cea mai mică culoare pe care nu o are niciunul.`) : T(`${s.id} has no coloured neighbour yet: the smallest colour, 1.`, `${s.id} nu are încă niciun vecin colorat: cea mai mică culoare, 1.`);
        if (clash) return T(`Not allowed: neighbour ${clash.x} already has colour ${c}.`, `Nu se poate: vecinul ${clash.x} are deja culoarea ${c}.`);
        return T(`Allowed, but the greedy rule takes the smallest free colour: ${s.c}.`, `Se poate, dar regula greedy ia cea mai mică culoare liberă: ${s.c}.`);
      }),
    }] };
  };

  M.caption = (k) => both((lang) => {
    const T = (en, ro) => (lang === 'en' ? en : ro);
    const f = frames[k];
    if (k === 0) return T(`Colour the nodes in the order ${order.join(', ')}. Two nodes joined by an edge must get different colours.`, `Colorăm nodurile în ordinea ${order.join(', ')}. Două noduri unite printr-o muchie trebuie să aibă culori diferite.`);
    let s = f.used.length
      ? T(`${f.id} touches ${f.used.map((u) => `${u.x} (${u.c})`).join(', ')}, so it takes colour ${f.c}.`, `${f.id} se învecinează cu ${f.used.map((u) => `${u.x} (${u.c})`).join(', ')}, deci ia culoarea ${f.c}.`)
      : T(`${f.id} has no coloured neighbour: colour ${f.c}.`, `${f.id} nu are niciun vecin colorat: culoarea ${f.c}.`);
    if (k === frames.length - 1) {
      s += omega === K
        ? T(` ${K} colours used and a clique of ${omega} nodes needs ${omega}: χ(G) = ${K}.`, ` S-au folosit ${K} culori, iar o clică de ${omega} noduri cere ${omega}: χ(G) = ${K}.`)
        : T(` ${K} colours used, so χ(G) ≤ ${K}; a clique of ${omega} nodes gives only ω(G) = ${omega} ≤ χ(G).`, ` S-au folosit ${K} culori, deci χ(G) ≤ ${K}; o clică de ${omega} noduri dă doar ω(G) = ${omega} ≤ χ(G).`);
    }
    return s;
  });

  M.scene = (k) => {
    const f = frames[k];
    const nodes = G.nodes.map((nd) => {
      const c = f.colours[nd.id];
      return { id: nd.id, x: nd.x, y: nd.y, cls: c ? `c${(c - 1) % 6}` : '', label: c ? { items: [{ t: String(c), hl: f.id === nd.id }] } : undefined, above: nd.lab === 'above' };
    });
    const edges = G.edges.map((e) => ({ u: e.u, v: e.v, cls: f.kind === 'node' && (e.u === f.id || e.v === f.id) && (f.colours[e.u] && f.colours[e.v]) ? 'hl' : '' }));
    const rows = frames.slice(1, k + 1).map((r) => ({ node: r.id, nb: G.nb(r.id).join(', '), c: String(r.c) }));
    return {
      nodes, edges,
      table: rows.length ? { columns: ['node', 'nb', 'c'], rows, hlRow: rows.length - 1, heads: { node: { en: 'Node', ro: 'Nod' }, nb: { en: 'Neighbours', ro: 'Vecini' }, c: { en: 'Colour', ro: 'Culoare' } } } : undefined,
    };
  };
  return M;
}
