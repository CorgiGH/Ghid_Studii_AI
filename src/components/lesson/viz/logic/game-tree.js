// game-tree (IA, c5 p.22-24): minimax by hand, bottom-up, and alpha-beta leaf by leaf. Pure; no React.
// Every frame is computed from the tree in the JSON. The cut rules are the course's (c5 p.23): at a MIN node stop when a
// child is <= alpha, at a MAX node stop when a child is >= beta; each node starts with the alpha and beta of its parent.
//
// props: { mode: 'minimax' | 'alphabeta', root: 'MIN' | 'MAX', rootLabel?: {en, ro},
//          tree: { id, children: [ { id, children: [...] } | { leaf: n } ] } }
// Levels alternate, starting with `root`. Every internal node needs an id and at least one child.

const bi = (en, ro) => ({ en, ro });
export const INF = Infinity;
export const showBound = (x) => (x === INF ? '+∞' : x === -INF ? '−∞' : String(x));
const other = (type) => (type === 'MAX' ? 'MIN' : 'MAX');

// ---- the tree, flattened ----
export function buildTree({ root = 'MAX', tree }) {
  if (root !== 'MAX' && root !== 'MIN') throw new RangeError('root must be MAX or MIN');
  const nodes = {};
  const order = []; // every node id, depth first, left to right
  const leaves = []; // leaf ids, left to right
  let maxDepth = 0;
  const walk = (raw, type, depth, parent) => {
    maxDepth = Math.max(maxDepth, depth);
    if (raw.leaf !== undefined) {
      if (typeof raw.leaf !== 'number' || !Number.isFinite(raw.leaf)) throw new RangeError('a leaf holds a number');
      const id = `l${leaves.length + 1}`;
      nodes[id] = { id, leaf: true, value: raw.leaf, parent, depth, index: leaves.length };
      leaves.push(id);
      order.push(id);
      return id;
    }
    if (typeof raw.id !== 'string' || !raw.id) throw new RangeError('every internal node needs an id');
    if (nodes[raw.id]) throw new RangeError(`duplicate node id ${raw.id}`);
    if (!Array.isArray(raw.children) || raw.children.length === 0) throw new RangeError(`node ${raw.id} needs children`);
    const node = { id: raw.id, leaf: false, type, parent, depth, children: [] };
    nodes[raw.id] = node;
    order.push(raw.id);
    for (const c of raw.children) node.children.push(walk(c, other(type), depth + 1, raw.id));
    return raw.id;
  };
  const rootId = walk(tree, root, 0, null);
  // x of every node: leaves evenly spaced, an internal node above the middle of its first and last child
  const x = {};
  const place = (id) => {
    const n = nodes[id];
    if (n.leaf) { x[id] = n.index; return; }
    n.children.forEach(place);
    x[id] = (x[n.children[0]] + x[n.children[n.children.length - 1]]) / 2;
  };
  place(rootId);
  return { nodes, order, leaves, root: rootId, maxDepth, x };
}

// ---- minimax ----
export function minimaxValues(T) {
  const val = {};
  const go = (id) => {
    const n = T.nodes[id];
    if (n.leaf) { val[id] = n.value; return n.value; }
    const vs = n.children.map(go);
    val[id] = n.type === 'MAX' ? Math.max(...vs) : Math.min(...vs);
    return val[id];
  };
  go(T.root);
  return val;
}

// internal nodes, children before parents, left to right
export function bottomUp(T) {
  const out = [];
  const go = (id) => {
    const n = T.nodes[id];
    if (n.leaf) return;
    n.children.forEach(go);
    out.push(id);
  };
  go(T.root);
  return out;
}

// ---- alpha-beta, simulated once; one frame per leaf that is evaluated ----
// A frame holds the state before the leaf (`before`), what happened (`steps`, `cut`, `closed`) and, once the next frame
// exists, the state after it (`after`). A state is { bounds: {nodeId: [alpha, beta]} of the open nodes,
// closed: {nodeId: {value, bound}}, skipped: [leaf ids] }.
export function alphaBetaRun(T) {
  const bounds = {};
  const closed = {};
  const skipped = [];
  const frames = [];
  let cur = null;
  const snap = () => ({
    bounds: Object.fromEntries(Object.entries(bounds).map(([k, v]) => [k, [...v]])),
    closed: Object.fromEntries(Object.entries(closed).map(([k, v]) => [k, { ...v }])),
    skipped: [...skipped],
  });
  const leavesUnder = (id) => {
    const n = T.nodes[id];
    return n.leaf ? [id] : n.children.flatMap(leavesUnder);
  };

  const visit = (id, a, b) => {
    const n = T.nodes[id];
    bounds[id] = [a, b];
    let best = n.type === 'MAX' ? -INF : INF;
    let bound = null;
    for (let i = 0; i < n.children.length; i += 1) {
      const cid = n.children[i];
      const c = T.nodes[cid];
      let v;
      if (c.leaf) {
        v = c.value;
        cur = { kind: 'leaf', leaf: cid, v, parent: id, before: snap(), steps: [], cut: false, skipped: [], closed: [] };
        frames.push(cur);
      } else {
        v = visit(cid, bounds[id][0], bounds[id][1]);
      }
      const [al, be] = bounds[id];
      const remaining = n.children.slice(i + 1);
      const hit = n.type === 'MAX' ? v >= be : v <= al;
      const cut = hit && remaining.length > 0;
      const step = { node: id, type: n.type, child: cid, childLeaf: c.leaf, v, alpha: al, beta: be, hit, cut, alphaAfter: al, betaAfter: be };
      best = n.type === 'MAX' ? Math.max(best, v) : Math.min(best, v);
      if (!hit) {
        if (n.type === 'MAX') bounds[id][0] = Math.max(al, v); else bounds[id][1] = Math.min(be, v);
      }
      step.alphaAfter = bounds[id][0];
      step.betaAfter = bounds[id][1];
      cur.steps.push(step);
      if (cut) {
        const gone = remaining.flatMap(leavesUnder);
        skipped.push(...gone);
        cur.cut = true;
        cur.skipped.push(...gone);
        step.skippedLeaves = gone;
        step.cutFrom = remaining[0];
        bound = n.type === 'MAX' ? '≥' : '≤';
        break;
      }
    }
    closed[id] = { value: best, bound };
    cur.closed.push({ node: id, value: best, bound });
    delete bounds[id];
    return best;
  };
  const rootValue = visit(T.root, -INF, INF);
  frames.forEach((f, k) => { f.after = k + 1 < frames.length ? frames[k + 1].before : snap(); });
  return { frames, rootValue, skipped, closed };
}

// ---- the model the widget and the tests read ----
export function gameTree(props) {
  const mode = props.mode;
  if (mode !== 'minimax' && mode !== 'alphabeta') throw new RangeError('mode must be minimax or alphabeta');
  const T = buildTree(props);
  const minimax = minimaxValues(T);
  const M = { mode, T, minimax, rootValue: minimax[T.root], rootLabel: props.rootLabel || null };

  const typeWord = (type) => `${type} ${type === 'MAX' ? '▲' : '▼'}`;

  if (mode === 'minimax') {
    const nodes = bottomUp(T);
    M.run = null;
    M.frames = [
      { kind: 'setup' },
      ...nodes.map((id) => {
        const n = T.nodes[id];
        const childValues = n.children.map((c) => minimax[c]);
        const options = [...new Set(childValues)].sort((p, q) => p - q);
        return { kind: 'node', node: id, type: n.type, childValues, options, value: minimax[id] };
      }),
    ];
  } else {
    const run = alphaBetaRun(T);
    M.run = run;
    M.frames = [{ kind: 'setup' }, ...run.frames, { kind: 'end', value: run.rootValue, skipped: run.skipped.length, total: T.leaves.length }];
  }
  M.count = M.frames.length;

  // ---- what is drawn at frame k; `answered` is false while the learner is still to pick ----
  M.state = (k, answered = true) => {
    const f = M.frames[k];
    const st = { nodes: {}, leaves: {}, current: null, skipped: [], bounds: {}, cuts: [] };
    for (const id of T.leaves) st.leaves[id] = 'pending';
    if (mode === 'minimax') {
      for (const id of T.leaves) st.leaves[id] = 'done';
      M.frames.forEach((g, j) => {
        if (g.kind !== 'node') return;
        if (j < k || (j === k && answered)) st.nodes[g.node] = { value: g.value, bound: null };
      });
      if (f.kind === 'node') st.current = f.node;
      return st;
    }
    // alpha-beta: replay every leaf frame up to k
    const run = M.run;
    const idx = k - 1; // M.frames[1..] are the leaf frames
    let s;
    if (f.kind === 'setup') s = { bounds: { [T.root]: [-INF, INF] }, closed: {}, skipped: [] };
    else if (f.kind === 'end') s = run.frames.length ? run.frames[run.frames.length - 1].after : { bounds: {}, closed: {}, skipped: [] };
    else s = answered ? f.after : f.before;
    if (f.kind === 'setup') {
      st.bounds = s.bounds;
    } else {
      st.bounds = s.bounds;
      for (const [id, c] of Object.entries(s.closed)) st.nodes[id] = { value: c.value, bound: c.bound };
      st.skipped = s.skipped;
      for (const id of s.skipped) st.leaves[id] = 'skipped';
      const evaluatedUpTo = f.kind === 'end' ? run.frames.length : (answered ? idx + 1 : idx);
      for (let j = 0; j < evaluatedUpTo; j += 1) st.leaves[run.frames[j].leaf] = 'done';
      if (f.kind === 'leaf') {
        st.leaves[f.leaf] = answered ? 'done' : 'current';
        st.current = f.leaf;
      }
      // every cut made so far: the node, the first child cut off, the leaves lost
      st.cuts = run.frames.slice(0, evaluatedUpTo).flatMap((g) => g.steps.filter((x) => x.cut).map((x) => ({ node: x.node, from: x.cutFrom, leaves: x.skippedLeaves })));
    }
    return st;
  };

  // ---- the pick asked at frame k ----
  M.pickSpec = (k) => {
    const f = M.frames[k];
    if (f.kind === 'node') {
      return {
        items: [{
          key: `v${k}`,
          prompt: bi(
            `${f.node} is a ${typeWord(f.type)} node. Its children are ${f.childValues.join(', ')}. What is its value?`,
            `${f.node} este nod ${typeWord(f.type)}. Copiii lui au valorile ${f.childValues.join(', ')}. Ce valoare are?`,
          ),
          options: f.options.map((o) => ({ id: o, label: String(o) })),
        }],
      };
    }
    if (f.kind === 'leaf') {
      const b = f.before.bounds[f.parent];
      return {
        items: [{
          key: `c${k}`,
          prompt: bi(
            `Leaf ${f.v} reaches ${f.parent} (${typeWord(T.nodes[f.parent].type)}), [alpha, beta] = [${showBound(b[0])}, ${showBound(b[1])}]. Carry on, or cut the rest?`,
            `Frunza ${f.v} ajunge în ${f.parent} (${typeWord(T.nodes[f.parent].type)}), [alpha, beta] = [${showBound(b[0])}, ${showBound(b[1])}]. Continui sau tai restul?`,
          ),
          options: [
            { id: 'go', label: bi('carry on', 'continui') },
            { id: 'cut', label: bi('cut the rest', 'tai restul') },
          ],
        }],
      };
    }
    return null;
  };
  // the right pick at frame k (the option id), or null where nothing is asked
  M.answer = (k) => {
    const f = M.frames[k];
    if (f.kind === 'node') return f.value;
    if (f.kind === 'leaf') return f.cut ? 'cut' : 'go';
    return null;
  };

  // ---- captions ----
  const stepText = (s) => {
    const sym = s.type === 'MAX' ? '≥' : '≤';
    const nm = s.type === 'MAX' ? 'beta' : 'alpha';
    const against = s.type === 'MAX' ? s.beta : s.alpha;
    const who = s.childLeaf ? `${s.v}` : `${s.child} = ${s.v}`;
    const upd = s.type === 'MAX' ? 'alpha' : 'beta';
    const updTo = s.type === 'MAX' ? s.alphaAfter : s.betaAfter;
    const updFrom = s.type === 'MAX' ? s.alpha : s.beta;
    if (s.cut) {
      return bi(
        `${s.node}: ${who} ${sym} ${nm} = ${showBound(against)}, so the rest of ${s.node} is cut.`,
        `${s.node}: ${who} ${sym} ${nm} = ${showBound(against)}, deci restul lui ${s.node} se taie.`,
      );
    }
    if (s.hit) {
      return bi(
        `${s.node}: ${who} ${sym} ${nm} = ${showBound(against)}, but no child is left to cut.`,
        `${s.node}: ${who} ${sym} ${nm} = ${showBound(against)}, dar nu mai e niciun copil de tăiat.`,
      );
    }
    const changed = updTo !== updFrom;
    return bi(
      `${s.node}: ${who} is not ${sym} ${nm} = ${showBound(against)}; ${upd} ${changed ? `becomes ${showBound(updTo)}` : `stays ${showBound(updTo)}`}.`,
      `${s.node}: ${who} nu este ${sym} ${nm} = ${showBound(against)}; ${upd} ${changed ? `devine ${showBound(updTo)}` : `rămâne ${showBound(updTo)}`}.`,
    );
  };

  M.caption = (k, { answered = true, picks = {} } = {}) => {
    const f = M.frames[k];
    const rl = M.rootLabel;
    const rootNote = rl ? bi(` The root ${T.root} is ${rl.en}.`, ` Rădăcina ${T.root} este ${rl.ro}.`) : bi('', '');
    if (f.kind === 'setup') {
      if (mode === 'minimax') {
        return bi(
          `${typeWord(T.nodes[T.root].type)} picks the largest child value if it is MAX, the smallest if it is MIN. Levels alternate. Work from the bottom up.${rootNote.en}`,
          `Un nod MAX ▲ ia cea mai mare valoare dintre copii, un nod MIN ▼ cea mai mică. Nivelurile alternează. Mergi de jos în sus.${rootNote.ro}`,
        );
      }
      return bi(
        `Go leaf by leaf, left to right. Each open node shows [alpha, beta], and a child passes its bounds down. MAX cuts when a child is ≥ beta, MIN when a child is ≤ alpha.${rootNote.en}`,
        `Mergi frunză cu frunză, de la stânga la dreapta. Fiecare nod deschis arată [alpha, beta], iar copilul primește limitele de la părinte. MAX taie când un copil este ≥ beta, MIN când un copil este ≤ alpha.${rootNote.ro}`,
      );
    }
    if (f.kind === 'node') {
      const verb = f.type === 'MAX' ? bi('the largest', 'cea mai mare') : bi('the smallest', 'cea mai mică');
      if (!answered) return bi(`Next: ${f.node}.`, `Urmează: ${f.node}.`);
      const pick = picks[`v${k}`];
      const fn = f.type === 'MAX' ? 'max' : 'min';
      const core = bi(
        `${f.node} = ${fn}(${f.childValues.join(', ')}) = ${f.value}: ${verb.en} of its children.`,
        `${f.node} = ${fn}(${f.childValues.join(', ')}) = ${f.value}: ${verb.ro} dintre copii.`,
      );
      if (pick === undefined || pick === f.value) return core;
      return bi(`You picked ${pick}; ${core.en}`, `Ai ales ${pick}; ${core.ro}`);
    }
    if (f.kind === 'leaf') {
      if (!answered) {
        return bi(`Next leaf: ${f.v}, inside ${f.parent}.`, `Urmează frunza ${f.v}, în ${f.parent}.`);
      }
      const lines = f.steps.map(stepText);
      const closing = f.closed.map((c) => {
        const v = `${c.bound ? c.bound : ''}${c.value}`;
        return bi(`${c.node} closes with ${v}.`, `${c.node} se închide cu ${v}.`);
      });
      const pick = picks[`c${k}`];
      const right = pick === undefined || pick === M.answer(k);
      const lead = right ? bi('', '') : bi(`Not quite (you picked "${pick === 'cut' ? 'cut the rest' : 'carry on'}"). `, `Nu chiar (ai ales „${pick === 'cut' ? 'tai restul' : 'continui'}”). `);
      const en = `${lead.en}${lines.map((x) => x.en).join(' ')} ${closing.map((x) => x.en).join(' ')}`.replace(/\s+/g, ' ').trim();
      const ro = `${lead.ro}${lines.map((x) => x.ro).join(' ')} ${closing.map((x) => x.ro).join(' ')}`.replace(/\s+/g, ' ').trim();
      return bi(en, ro);
    }
    // end
    const same = f.value === M.rootValue;
    return bi(
      `${T.root} = ${f.value}${same ? ', the same as minimax' : ''}. Leaves not evaluated: ${f.skipped} of ${f.total}.`,
      `${T.root} = ${f.value}${same ? ', ca la minimax' : ''}. Frunze neevaluate: ${f.skipped} din ${f.total}.`,
    );
  };
  return M;
}
