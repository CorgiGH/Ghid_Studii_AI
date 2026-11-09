// graph-walk, mode cut: cut vertices and bridges as the course does them (ag-cp-8b). Remove each node in turn and count the
// components of what is left, then do the same for each edge: more than one component means a cut vertex or a bridge.
// The graph must be connected. Frames: the whole graph, one per node removed, one per edge removed.
import { both, readGraph, components, edgeName, showSet } from './common.js';

export function cut(props) {
  const G = readGraph(props);
  if (G.directed) throw new RangeError('cut: the graph is undirected');
  const { ids } = G;
  if (components(G).length !== 1) throw new RangeError('cut: the graph must be connected');
  const items = [
    ...ids.map((id) => ({ type: 'node', id, name: id, comps: components(G, { skipNode: id }) })),
    ...G.edges.map((e) => ({ type: 'edge', e, name: edgeName(G, e), comps: components(G, { skipEdge: e }) })),
  ].map((x) => ({ ...x, breaks: x.comps.length > 1 }));
  const frames = [{ kind: 'start', k: 0, comps: components(G) }, ...items.map((x, i) => ({ kind: x.type, k: i + 1, ...x }))];
  const cutVertices = items.filter((x) => x.type === 'node' && x.breaks).map((x) => x.id);
  const bridges = items.filter((x) => x.type === 'edge' && x.breaks).map((x) => x.name);
  const M = { frames, count: frames.length, items, cutVertices, bridges, mode: 'cut' };

  M.pickSpec = (k, predict = true) => {
    if (!predict || k >= frames.length - 1) return null;
    const x = frames[k + 1];
    const isNode = x.kind === 'node';
    return { items: [{
      key: `f${k}-cut`, kind: 'single', answer: x.breaks ? 'yes' : 'no',
      prompt: isNode
        ? { en: `Remove node ${x.name}: does the rest fall apart?`, ro: `Scoți nodul ${x.name}: se rupe restul grafului?` }
        : { en: `Remove edge ${x.name}: does the graph fall apart?`, ro: `Scoți muchia ${x.name}: se rupe graful?` },
      options: [{ id: 'yes', label: { en: 'breaks', ro: 'se rupe' } }, { id: 'no', label: { en: 'stays whole', ro: 'rămâne întreg' } }],
      fb: (p, ok) => both((lang) => {
        const T = (en, ro) => (lang === 'en' ? en : ro);
        const pieces = x.comps.map((c) => showSet(c)).join(' ');
        const what = T(`Without ${x.name}`, `Fără ${x.name}`);
        const verdict = x.breaks
          ? T(`${x.comps.length} components (${pieces}): ${isNode ? 'cut vertex' : 'bridge'}.`, `${x.comps.length} componente (${pieces}): ${isNode ? 'punct de articulație' : 'punte'}.`)
          : T(`1 component: ${isNode ? 'not a cut vertex' : 'not a bridge'}.`, `1 componentă: ${isNode ? 'nu e punct de articulație' : 'nu e punte'}.`);
        return `${ok ? '' : T('Count the pieces left. ', 'Numără bucățile rămase. ')}${what}: ${verdict}`;
      }),
    }] };
  };

  M.caption = (k) => both((lang) => {
    const T = (en, ro) => (lang === 'en' ? en : ro);
    const f = frames[k];
    if (k === 0) return T(`The whole graph is one component. Remove each node in turn and count the components left; more than 1 means a cut vertex. Then the same for each edge.`, `Graful întreg e o singură componentă. Scoți fiecare nod pe rând și numeri componentele rămase; mai mult de 1 înseamnă punct de articulație. Apoi la fel pentru fiecare muchie.`);
    const pieces = f.comps.map((c) => showSet(c)).join(' ');
    let s;
    if (f.kind === 'node') s = f.breaks ? T(`Without node ${f.name}: ${f.comps.length} components ${pieces}. ${f.name} is a cut vertex.`, `Fără nodul ${f.name}: ${f.comps.length} componente ${pieces}. ${f.name} e punct de articulație.`) : T(`Without node ${f.name}: 1 component. Not a cut vertex.`, `Fără nodul ${f.name}: 1 componentă. Nu e punct de articulație.`);
    else s = f.breaks ? T(`Without edge ${f.name}: ${f.comps.length} components ${pieces}. ${f.name} is a bridge.`, `Fără muchia ${f.name}: ${f.comps.length} componente ${pieces}. ${f.name} e punte.`) : T(`Without edge ${f.name}: 1 component. Not a bridge.`, `Fără muchia ${f.name}: 1 componentă. Nu e punte.`);
    if (k === frames.length - 1) s += T(` Result: cut vertices ${cutVertices.join(', ') || 'none'}; bridges ${bridges.join(', ') || 'none'}.`, ` Rezultat: puncte de articulație ${cutVertices.join(', ') || 'niciunul'}; punți ${bridges.join(', ') || 'niciuna'}.`);
    return s;
  });

  M.scene = (k) => {
    const f = frames[k];
    const comps = f.comps;
    const colourOf = {};
    if (k > 0) comps.forEach((c, i) => c.forEach((x) => { colourOf[x] = comps.length > 1 ? `c${i % 6}` : 'fixed'; }));
    // the node or edge the next question is about: a dashed ring, or a dashed edge
    const ask = frames[k + 1];
    const nodes = G.nodes.map((nd) => {
      let cls = f.kind === 'node' && f.id === nd.id ? 'gone' : colourOf[nd.id] || '';
      if (ask?.kind === 'node' && ask.id === nd.id) cls = `${cls} target`.trim();
      return { id: nd.id, x: nd.x, y: nd.y, cls, above: nd.lab === 'above' };
    });
    const edges = G.edges.map((e) => {
      let cls = '';
      if (ask?.kind === 'edge' && ask.e === e) cls = 'target';
      else if (f.kind === 'node' && (e.u === f.id || e.v === f.id)) cls = 'dim';
      else if (f.kind === 'edge' && f.e === e) cls = 'cut'; // removed: dashed and faded, not emphasised
      return { u: e.u, v: e.v, cls };
    });
    // the table of the course: what was removed, the components left, and the verdict, one row per frame
    const done = frames.slice(1, k + 1);
    const nodeRows = done.filter((x) => x.kind === 'node').map((x) => ({ out: x.name, n: x.comps.length, v: x.breaks ? '✓' : '–' }));
    const edgeRows = done.filter((x) => x.kind === 'edge').map((x) => ({ out: x.name, n: x.comps.length, v: x.breaks ? '✓' : '–' }));
    const showEdges = f.kind === 'edge';
    const rows = showEdges ? edgeRows : nodeRows;
    return {
      nodes, edges,
      table: rows.length ? {
        columns: ['out', 'n', 'v'], rows, hlRow: rows.length - 1,
        heads: showEdges
          ? { out: { en: 'Removed edge', ro: 'Muchie scoasă' }, n: { en: 'Components left', ro: 'Componente rămase' }, v: { en: 'Bridge?', ro: 'Punte?' } }
          : { out: { en: 'Removed node', ro: 'Nod scos' }, n: { en: 'Components left', ro: 'Componente rămase' }, v: { en: 'Cut vertex?', ro: 'Punct de articulație?' } },
      } : undefined,
    };
  };
  return M;
}
