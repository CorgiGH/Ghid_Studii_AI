// nn-net (NN lecture 4, Backprop.pdf): one backpropagation iteration on a small layered net, number by number. Pure; no React.
// Every frame is computed from the props. Convention of the lab sheet: weights[l][i][j] = w_ij^l, from neuron i of layer l-1 to
// neuron j of layer l (layers are numbered 1..L, layer 1 is the input). Biases are optional (biases[l][j], layers 2..L).
//
// props: { layers: [2,2,1], inputs: [2,6], weights: {"2": [[-3,6],[1,-2]], "3": [[8],[4]]}, biases?: {"2": [..], "3": [..]},
//          target: [0], act: 'sigmoid', out: 'sigmoid' | 'softmax', loss?: 'ce' | 'mse', eta: 0.5, values: 'sheet' | 'exact',
//          layout?: 'bottom-up', edgeLabels?: 'all' | 'active' }
// 'sheet' reads sigma from the graph like the lab sheet (one decimal: sigma(0) = 0,5, sigma(6) = 1); 'exact' uses the true sigma.

const bi = (en, ro) => ({ en, ro });
const SIG = (z) => 1 / (1 + Math.exp(-z));
const isNum = (v) => typeof v === 'number' && Number.isFinite(v);

// ---- numbers on screen: a decimal comma; exact values with 4 places, sheet values as computed (7,75), inputs as typed ----
const MINUS = '−';
export const trimmed = (x) => {
  const r = Math.round(x * 10000) / 10000;
  const s = String(Object.is(r, -0) ? 0 : r).replace('.', ',');
  return s.startsWith('-') ? MINUS + s.slice(1) : s;
};
export const fixed4 = (x) => {
  const s = (Object.is(x, -0) ? 0 : x).toFixed(4).replace('.', ',');
  const z = s === '-0,0000' ? '0,0000' : s;
  return z.startsWith('-') ? MINUS + z.slice(1) : z;
};
// the data-value of a number: a point decimal, no sign mark, 4 places at most
export const dataOf = (x) => String(Math.round(Math.abs(x) * 10000) / 10000);

// ---- validation and the normal form of the props ----
export function normalize(props) {
  const p = props || {};
  const err = (m) => { throw new RangeError(m); };
  const { layers, inputs, target } = p;
  if (!Array.isArray(layers) || layers.length < 3 || !layers.every((n) => Number.isInteger(n) && n >= 1)) err('layers needs at least three positive sizes (input, hidden, output)');
  if (!Array.isArray(inputs) || inputs.length !== layers[0] || !inputs.every(isNum)) err('inputs must hold one number per input neuron');
  const L = layers.length;
  if (!Array.isArray(target) || target.length !== layers[L - 1] || !target.every(isNum)) err('target must hold one number per output neuron');
  const out = p.out === undefined ? 'sigmoid' : p.out;
  if (out !== 'sigmoid' && out !== 'softmax') err('out must be sigmoid or softmax');
  if (out === 'softmax' && layers[L - 1] < 2) err('softmax needs at least two outputs');
  if (out === 'sigmoid' && layers[L - 1] === 1 && !(target[0] >= 0 && target[0] <= 1)) err('a sigmoid output needs a target in [0, 1]');
  const loss = p.loss === undefined ? 'ce' : p.loss;
  if (loss !== 'ce' && loss !== 'mse') err('loss must be ce or mse');
  if (loss === 'mse' && out !== 'sigmoid') err('mse goes with sigmoid outputs only');
  if (p.act !== undefined && p.act !== 'sigmoid') err('act must be sigmoid');
  if (!(isNum(p.eta) && p.eta > 0)) err('eta must be a positive number');
  const values = p.values === undefined ? 'exact' : p.values;
  if (values !== 'sheet' && values !== 'exact') err('values must be sheet or exact');
  if (!p.weights || typeof p.weights !== 'object') err('weights is missing');
  const W = [null, null];
  for (let l = 2; l <= L; l += 1) {
    const w = p.weights[String(l)];
    if (!Array.isArray(w) || w.length !== layers[l - 2] || !w.every((r) => Array.isArray(r) && r.length === layers[l - 1] && r.every(isNum))) {
      err(`weights["${l}"] must have ${layers[l - 2]} rows (neurons of layer ${l - 1}) and ${layers[l - 1]} columns (neurons of layer ${l})`);
    }
    W[l] = w;
  }
  const hasBias = p.biases !== undefined;
  const b = [null, null];
  for (let l = 2; l <= L; l += 1) {
    if (hasBias) {
      const v = p.biases[String(l)];
      if (!Array.isArray(v) || v.length !== layers[l - 1] || !v.every(isNum)) err(`biases["${l}"] must hold ${layers[l - 1]} numbers`);
      b[l] = v;
    } else b[l] = new Array(layers[l - 1]).fill(0);
  }
  const edgeCount = layers.slice(0, -1).map((n, i) => n * layers[i + 1]);
  const edgeLabels = p.edgeLabels || (Math.max(...edgeCount) <= 6 ? 'all' : 'active');
  return { layers, L, inputs, W, b, hasBias, target, out, loss, eta: p.eta, values, edgeLabels };
}

// ---- the iteration, as numbers ----
export function softmax(z) {
  const m = Math.max(...z);
  const e = z.map((v) => Math.exp(v - m));
  const s = e.reduce((a, c) => a + c, 0);
  return e.map((v) => v / s);
}
export function runNet(P) {
  const { layers, L, inputs, W, b, target, out, loss, eta, values } = P;
  const sig = values === 'sheet' ? (z) => Math.round(SIG(z) * 10) / 10 : SIG;
  const z = [null, null];
  const y = [null, inputs];
  for (let l = 2; l <= L; l += 1) {
    z[l] = Array.from({ length: layers[l - 1] }, (_, j) => b[l][j] + y[l - 1].reduce((s, v, i) => s + W[l][i][j] * v, 0));
    y[l] = l === L && out === 'softmax' ? softmax(z[l]) : z[l].map(sig);
  }
  const d = [];
  d[L] = y[L].map((v, j) => (loss === 'mse' ? (v - target[j]) * v * (1 - v) : v - target[j]));
  for (let l = L - 1; l >= 2; l -= 1) {
    d[l] = y[l].map((v, i) => v * (1 - v) * W[l + 1][i].reduce((s, w, k) => s + w * d[l + 1][k], 0));
  }
  const gradW = [null, null];
  const gradB = [null, null];
  const newW = [null, null];
  const newB = [null, null];
  for (let l = 2; l <= L; l += 1) {
    gradW[l] = W[l].map((row, i) => row.map((_, j) => d[l][j] * y[l - 1][i]));
    gradB[l] = d[l].slice();
    newW[l] = W[l].map((row, i) => row.map((w, j) => w - eta * gradW[l][i][j]));
    newB[l] = b[l].map((v, j) => v - eta * gradB[l][j]);
  }
  return { z, y, d, gradW, gradB, newW, newB };
}
// the cost of the net (exact sigma), for the finite-difference check
export function costOf(P, W, b) {
  const Q = { ...P, W, b, values: 'exact' };
  const { y } = runNet(Q);
  const o = y[P.L];
  if (P.out === 'softmax') return -o.reduce((s, v, j) => s + P.target[j] * Math.log(v), 0);
  if (P.loss === 'mse') return 0.5 * o.reduce((s, v, j) => s + (v - P.target[j]) ** 2, 0);
  return -o.reduce((s, v, j) => s + P.target[j] * Math.log(v) + (1 - P.target[j]) * Math.log(1 - v), 0);
}

// ---- the model the widget and the tests read ----
export function nnNet(props) {
  const P = normalize(props);
  const R = runNet(P);
  const { layers, L, W, b, hasBias, target, out, loss, eta, values } = P;
  const fm = (x) => (values === 'sheet' ? trimmed(x) : fixed4(x));
  const fi = trimmed;
  const isSoftmaxLayer = (l) => l === L && out === 'softmax';
  const sigmaNote = values === 'sheet'
    ? bi('σ read as on the sheet (1 decimal)', 'σ citit ca în foaie (1 zecimală)')
    : bi('σ exact (σ(6) = 0,9975)', 'σ exact (σ(6) = 0,9975)');

  const frames = [{ kind: 'setup' }];
  for (let l = 2; l <= L; l += 1) {
    for (let j = 0; j < layers[l - 1]; j += 1) frames.push({ kind: isSoftmaxLayer(l) ? 'z' : 'fwd', l, j });
    if (isSoftmaxLayer(l)) frames.push({ kind: 'softmax', l });
  }
  for (let j = 0; j < layers[L - 1]; j += 1) frames.push({ kind: 'dout', l: L, j });
  for (let l = L - 1; l >= 2; l -= 1) for (let i = 0; i < layers[l - 1]; i += 1) frames.push({ kind: 'dhid', l, i });
  for (let l = L; l >= 2; l -= 1) {
    for (let i = 0; i < layers[l - 2]; i += 1) for (let j = 0; j < layers[l - 1]; j += 1) frames.push({ kind: 'upd', l, i, j });
    if (hasBias) for (let j = 0; j < layers[l - 1]; j += 1) frames.push({ kind: 'updb', l, j });
  }
  frames.push({ kind: 'end' });

  const M = { P, R, frames, count: frames.length, sigmaNote, fm, fi, hasBias };
  M.final = { weights: R.newW.slice(2), biases: hasBias ? R.newB.slice(2) : null, flat: R.newW.slice(2).flatMap((m) => m.flat()) };

  // what a frame fills in: [kind, layer, i, j?, value]
  const entries = (f) => {
    if (f.kind === 'fwd') return [['z', f.l, f.j, R.z[f.l][f.j]], ['y', f.l, f.j, R.y[f.l][f.j]]];
    if (f.kind === 'z') return [['z', f.l, f.j, R.z[f.l][f.j]]];
    if (f.kind === 'softmax') return R.y[f.l].map((v, j) => ['y', f.l, j, v]);
    if (f.kind === 'dout') return [['d', f.l, f.j, R.d[f.l][f.j]]];
    if (f.kind === 'dhid') return [['d', f.l, f.i, R.d[f.l][f.i]]];
    if (f.kind === 'upd') return [['w', f.l, f.i, R.newW[f.l][f.i][f.j], f.j]];
    if (f.kind === 'updb') return [['nb', f.l, f.j, R.newB[f.l][f.j]]];
    return [];
  };
  // state at frame k: the values known so far; `answered` is false while the learner is still to pick
  M.state = (k, answered = true) => {
    const st = { z: {}, y: {}, d: {}, w: {}, nb: {}, current: null, lit: [], k };
    const upto = M.frames[k].kind === 'end' ? M.count : (answered ? k + 1 : k);
    for (let j = 0; j < upto; j += 1) {
      for (const e of entries(M.frames[j])) {
        if (e[0] === 'w') st.w[`${e[1]}.${e[2]}.${e[4]}`] = e[3];
        else st[e[0]][`${e[1]}.${e[2]}`] = e[3];
      }
    }
    const f = M.frames[k];
    if (f.kind === 'fwd' || f.kind === 'z') {
      st.current = [f.l, f.j];
      for (let i = 0; i < layers[f.l - 2]; i += 1) st.lit.push([f.l, i, f.j]);
    } else if (f.kind === 'softmax') {
      st.current = [f.l, 0];
    } else if (f.kind === 'dout') {
      st.current = [f.l, f.j];
    } else if (f.kind === 'dhid') {
      st.current = [f.l, f.i];
      for (let kk = 0; kk < layers[f.l]; kk += 1) st.lit.push([f.l + 1, f.i, kk]);
    } else if (f.kind === 'upd') {
      st.current = [f.l, f.j];
      st.lit.push([f.l, f.i, f.j]);
    } else if (f.kind === 'updb') {
      st.current = [f.l, f.j];
    }
    return st;
  };

  // ---- the pick asked at frame k ----
  const dedupe = (correct, wrongs) => {
    // wrongs: [{id, val, desc}]; drop duplicates of the correct value and of each other (4 places)
    const seen = new Set([Math.round(correct * 1e4)]);
    const keep = [];
    for (const w of wrongs) {
      const key = Math.round(w.val * 1e4);
      if (seen.has(key)) continue;
      seen.add(key);
      keep.push(w);
    }
    return keep.slice(0, 3);
  };
  const makeItem = (k, key, prompt, correct, wrongs, fmt = fm) => {
    const ws = dedupe(correct, wrongs);
    const all = [{ id: 'ok', val: correct, desc: null }, ...ws];
    const shift = k % all.length;
    const rotated = all.map((_, i) => all[(i + shift) % all.length]);
    return {
      key,
      prompt,
      options: rotated.map((o) => ({ id: o.id, label: fmt(o.val), desc: o.desc })),
    };
  };
  const nm = (l, i) => `${i + 1}`;
  M.pickSpec = (k) => {
    const f = M.frames[k];
    const items = [];
    if (f.kind === 'fwd' || f.kind === 'z') {
      const { l, j } = f;
      const prev = R.y[l - 1];
      const zc = R.z[l][j];
      const terms = prev.map((v, i) => W[l][i][j] * v);
      const bj = b[l][j];
      const wrongs = [];
      if (prev.length > 1) wrongs.push({ id: 'sum-incompleta', val: zc - terms[terms.length - 1], desc: bi('one term left out', 'un termen lipsă') });
      wrongs.push({ id: 'sign', val: -zc, desc: bi('the sign flipped', 'semnul schimbat') });
      if (l > 2) wrongs.push({ id: 'z-in-loc-de-y', val: R.z[l - 1].reduce((s, v, i) => s + W[l][i][j] * v, 0) + bj, desc: bi('z of the layer below instead of y', 'z-ul stratului de jos în loc de y') });
      else wrongs.push({ id: 'forgot-input', val: W[l].reduce((s, row) => s + row[j], 0) + bj, desc: bi('weights only, without the inputs', 'doar ponderile, fără intrări') });
      items.push(makeItem(k, `z${k}`,
        bi(`Neuron ${nm(l, j)} of layer ${l}: what is z?`, `Neuronul ${nm(l, j)} din stratul ${l}: cât este z?`), zc, wrongs));
      if (f.kind === 'fwd') {
        const yc = R.y[l][j];
        items.push(makeItem(k, `y${k}`,
          bi(`And y = σ(z) for z = ${fm(zc)}?`, `Și y = σ(z) pentru z = ${fm(zc)}?`), yc, [
            { id: 'y-este-z', val: zc, desc: bi('z itself', 'chiar z') },
            { id: 'y-complement', val: 1 - yc, desc: bi('1 − σ(z)', '1 − σ(z)') },
            { id: 'y-derivata', val: yc * (1 - yc), desc: bi('σ′(z) instead of σ(z)', 'σ′(z) în loc de σ(z)') },
          ]));
      }
    } else if (f.kind === 'softmax') {
      const yc = R.y[f.l][0];
      const s = R.z[f.l].map((v) => Math.exp(v));
      const tot = s.reduce((a, c) => a + c, 0);
      items.push(makeItem(k, `s${k}`,
        bi(`Softmax of the scores: what is y₁?`, `Softmax pe scoruri: cât este y₁?`), yc, [
          { id: 'fara-numitor', val: s[0], desc: bi('e^z₁ without dividing', 'e^z₁ fără împărțire') },
          { id: 'sigmoid-in-loc-de-softmax', val: SIG(R.z[f.l][0]), desc: bi('σ(z₁) instead of softmax', 'σ(z₁) în loc de softmax') },
          { id: 'impartit-la-alt-termen', val: s[0] / (tot - s[0]), desc: bi('divided by the other terms only', 'împărțit doar la ceilalți termeni') },
        ]));
    } else if (f.kind === 'dout') {
      const { j } = f;
      const y = R.y[L][j];
      const t = target[j];
      const c = R.d[L][j];
      const wrongs = loss === 'mse'
        ? [{ id: 'ce-delta', val: y - t, desc: bi('y − t (the CE form)', 'y − t (forma de la CE)') },
          { id: 't-minus-y', val: t - y, desc: bi('t − y', 't − y') },
          { id: 'only-y', val: y, desc: bi('y alone', 'doar y') }]
        : [{ id: 't-minus-y', val: t - y, desc: bi('t − y', 't − y') },
          { id: 'mse-delta', val: (y - t) * y * (1 - y), desc: bi('(y − t)·y·(1 − y), the MSE form', '(y − t)·y·(1 − y), forma de la MSE') },
          { id: 'only-y', val: y, desc: bi('y alone', 'doar y') }];
      items.push(makeItem(k, `d${k}`,
        bi(`Output neuron ${j + 1}: y = ${fm(y)}, t = ${fi(t)}. What is δ?`, `Neuronul de ieșire ${j + 1}: y = ${fm(y)}, t = ${fi(t)}. Cât este δ?`), c, wrongs));
    } else if (f.kind === 'dhid') {
      const { l, i } = f;
      const y = R.y[l][i];
      const s = W[l + 1][i].reduce((a, w, kk) => a + w * R.d[l + 1][kk], 0);
      const c = R.d[l][i];
      const wrongs = [{ id: 'no-sigma-prime', val: s, desc: bi('without y(1 − y)', 'fără y(1 − y)') }];
      const sNew = R.newW[l + 1][i].reduce((a, w, kk) => a + w * R.d[l + 1][kk], 0) * y * (1 - y);
      wrongs.push({ id: 'new-weight-in-delta', val: sNew, desc: bi('the already updated weights', 'ponderile deja actualizate') });
      wrongs.push({ id: 'forgot-weight', val: y * (1 - y) * R.d[l + 1].reduce((a, dk) => a + dk * y, 0), desc: bi('δ times y instead of δ times the weight', 'δ·y în loc de δ·pondere') });
      items.push(makeItem(k, `h${k}`,
        bi(`Hidden neuron ${i + 1} of layer ${l}: y = ${fm(y)}. What is δ (with the old weights)?`,
          `Neuronul ascuns ${i + 1} din stratul ${l}: y = ${fm(y)}. Cât este δ (cu ponderile vechi)?`), c, wrongs));
    } else if (f.kind === 'upd') {
      const { l, i, j } = f;
      const w = W[l][i][j];
      const dj = R.d[l][j];
      const yi = R.y[l - 1][i];
      const c = R.newW[l][i][j];
      items.push(makeItem(k, `u${k}`,
        bi(`Weight w${i + 1}${j + 1} of layer ${l} is ${fi(w)}, δ = ${fm(dj)}, y = ${fm(yi)}, η = ${fi(eta)}. What is the new weight?`,
          `Ponderea w${i + 1}${j + 1} din stratul ${l} este ${fi(w)}, δ = ${fm(dj)}, y = ${fm(yi)}, η = ${fi(eta)}. Cât este ponderea nouă?`), c, [
            { id: 'sign', val: w + eta * dj * yi, desc: bi('with a plus', 'cu plus') },
            { id: 'forgot-eta', val: w - dj * yi, desc: bi('without η', 'fără η') },
            { id: 'forgot-input', val: w - eta * dj, desc: bi('without the y of the neuron below', 'fără y-ul neuronului de jos') },
          ], (x) => fm(x)));
    } else if (f.kind === 'updb') {
      const { l, j } = f;
      const bb = b[l][j];
      const dj = R.d[l][j];
      items.push(makeItem(k, `b${k}`,
        bi(`Bias ${j + 1} of layer ${l} is ${fi(bb)}, δ = ${fm(dj)}, η = ${fi(eta)}. What is the new bias?`,
          `Biasul ${j + 1} din stratul ${l} este ${fi(bb)}, δ = ${fm(dj)}, η = ${fi(eta)}. Cât este biasul nou?`), R.newB[l][j], [
            { id: 'sign', val: bb + eta * dj, desc: bi('with a plus', 'cu plus') },
            { id: 'forgot-eta', val: bb - dj, desc: bi('without η', 'fără η') },
            { id: 'forgot-delta', val: bb - eta, desc: bi('η alone', 'doar η') },
          ]));
    } else return null;
    return { items };
  };
  M.answer = (k) => {
    const spec = M.pickSpec(k);
    return spec ? Object.fromEntries(spec.items.map((it) => [it.key, 'ok'])) : null;
  };

  // ---- captions ----
  const sumText = (l, j) => {
    const prev = R.y[l - 1];
    const parts = prev.map((v, i) => `${fi(W[l][i][j])}·${l === 2 ? fi(v) : fm(v)}`);
    const bias = hasBias ? ` + ${fi(b[l][j])}` : '';
    return `${parts.join(' + ')}${bias}`;
  };
  const wrongLead = (k, picks) => {
    const spec = M.pickSpec(k);
    if (!spec) return bi('', '');
    const bad = [];
    for (const it of spec.items) {
      const pk = picks[it.key];
      if (pk === undefined || pk === 'ok') continue;
      const o = it.options.find((x) => x.id === pk);
      if (o && o.desc) bad.push(o.desc);
    }
    if (!bad.length) return bi('', '');
    return bi(`Not quite (you picked: ${bad.map((d) => d.en).join('; ')}). `, `Nu chiar (ai ales: ${bad.map((d) => d.ro).join('; ')}). `);
  };
  M.caption = (k, { answered = true, picks = {} } = {}) => {
    const f = M.frames[k];
    if (f.kind === 'setup') {
      const lossEn = loss === 'mse' ? 'MSE' : out === 'softmax' ? 'cross-entropy with softmax' : 'cross-entropy';
      const lossRo = loss === 'mse' ? 'MSE' : out === 'softmax' ? 'entropie încrucișată cu softmax' : 'entropie încrucișată';
      return bi(
        `The net, bottom up: the inputs sit at the bottom. Weights are on the edges, w_ij goes from neuron i below to neuron j above. Cost: ${lossEn}. η = ${fi(eta)}. ${sigmaNote.en}.`,
        `Rețeaua, de jos în sus: intrările sunt jos. Ponderile stau pe muchii, w_ij merge de la neuronul i de jos la neuronul j de sus. Cost: ${lossRo}. η = ${fi(eta)}. ${sigmaNote.ro}.`,
      );
    }
    if (f.kind === 'end') {
      const rows = [];
      for (let l = L; l >= 2; l -= 1) rows.push(R.newW[l].flat().map(fm).join('; '));
      return bi(
        `Done. Every weight moved by η·δ·y, all deltas were computed with the old weights, and only then were the weights updated. New weights, layer ${L} down to layer 2: ${rows.join(' | ')}.`,
        `Gata. Fiecare pondere s-a mișcat cu η·δ·y, toate deltele s-au calculat cu ponderile vechi și abia apoi s-au actualizat ponderile. Ponderi noi, de la stratul ${L} în jos spre stratul 2: ${rows.join(' | ')}.`,
      );
    }
    const lead = answered ? wrongLead(k, picks) : bi('', '');
    if (!answered) {
      if (f.kind === 'fwd' || f.kind === 'z') return bi(`Forward: neuron ${f.j + 1} of layer ${f.l} sums its weighted inputs.`, `Pasul înainte: neuronul ${f.j + 1} din stratul ${f.l} adună intrările înmulțite cu ponderi.`);
      if (f.kind === 'softmax') return bi('Softmax turns the scores of the last layer into probabilities.', 'Softmax transformă scorurile ultimului strat în probabilități.');
      if (f.kind === 'dout') return bi(`Backward: the error of output neuron ${f.j + 1}.`, `Pasul înapoi: eroarea neuronului de ieșire ${f.j + 1}.`);
      if (f.kind === 'dhid') return bi(`Backward: the error of hidden neuron ${f.i + 1} of layer ${f.l}, from the layer above.`, `Pasul înapoi: eroarea neuronului ascuns ${f.i + 1} din stratul ${f.l}, adusă din stratul de sus.`);
      if (f.kind === 'upd') return bi(`Update: weight w${f.i + 1}${f.j + 1} of layer ${f.l}.`, `Actualizare: ponderea w${f.i + 1}${f.j + 1} din stratul ${f.l}.`);
      return bi(`Update: bias ${f.j + 1} of layer ${f.l}.`, `Actualizare: biasul ${f.j + 1} din stratul ${f.l}.`);
    }
    if (f.kind === 'fwd') {
      const z = R.z[f.l][f.j];
      const y = R.y[f.l][f.j];
      return bi(
        `${lead.en}z = ${sumText(f.l, f.j)} = ${fm(z)}, so y = σ(${fm(z)}) = ${fm(y)}.`,
        `${lead.ro}z = ${sumText(f.l, f.j)} = ${fm(z)}, deci y = σ(${fm(z)}) = ${fm(y)}.`,
      );
    }
    if (f.kind === 'z') {
      const z = R.z[f.l][f.j];
      return bi(`${lead.en}z = ${sumText(f.l, f.j)} = ${fm(z)}.`, `${lead.ro}z = ${sumText(f.l, f.j)} = ${fm(z)}.`);
    }
    if (f.kind === 'softmax') {
      const ys = R.y[f.l].map(fm).join('; ');
      return bi(`${lead.en}softmax gives y = ${ys}. They add up to 1.`, `${lead.ro}softmax dă y = ${ys}. Împreună fac 1.`);
    }
    if (f.kind === 'dout') {
      const y = R.y[L][f.j];
      const t = target[f.j];
      const d = R.d[L][f.j];
      if (loss === 'mse') {
        return bi(`${lead.en}With MSE, δ = (y − t)·y·(1 − y) = (${fm(y)} − ${fi(t)})·${fm(y)}·(1 − ${fm(y)}) = ${fm(d)}. The extra factor y(1 − y) makes it tiny.`,
          `${lead.ro}La MSE, δ = (y − t)·y·(1 − y) = (${fm(y)} − ${fi(t)})·${fm(y)}·(1 − ${fm(y)}) = ${fm(d)}. Factorul în plus y(1 − y) îl face minuscul.`);
      }
      return bi(`${lead.en}δ = y − t = ${fm(y)} − ${fi(t)} = ${fm(d)}.`, `${lead.ro}δ = y − t = ${fm(y)} − ${fi(t)} = ${fm(d)}.`);
    }
    if (f.kind === 'dhid') {
      const y = R.y[f.l][f.i];
      const terms = W[f.l + 1][f.i].map((w, kk) => `${fi(w)}·${fm(R.d[f.l + 1][kk])}`).join(' + ');
      return bi(
        `${lead.en}δ = y(1 − y)·(${terms}) = ${fm(y)}·(1 − ${fm(y)})·(${terms}) = ${fm(R.d[f.l][f.i])}. The weights are the old ones.`,
        `${lead.ro}δ = y(1 − y)·(${terms}) = ${fm(y)}·(1 − ${fm(y)})·(${terms}) = ${fm(R.d[f.l][f.i])}. Ponderile sunt cele vechi.`,
      );
    }
    if (f.kind === 'upd') {
      const w = W[f.l][f.i][f.j];
      const d = R.d[f.l][f.j];
      const yi = R.y[f.l - 1][f.i];
      const yiTxt = f.l === 2 ? fi(yi) : fm(yi);
      return bi(
        `${lead.en}w${f.i + 1}${f.j + 1} = ${fi(w)} − ${fi(eta)}·${fm(d)}·${yiTxt} = ${fm(R.newW[f.l][f.i][f.j])}.`,
        `${lead.ro}w${f.i + 1}${f.j + 1} = ${fi(w)} − ${fi(eta)}·${fm(d)}·${yiTxt} = ${fm(R.newW[f.l][f.i][f.j])}.`,
      );
    }
    const bb = b[f.l][f.j];
    return bi(
      `${lead.en}b = ${fi(bb)} − ${fi(eta)}·${fm(R.d[f.l][f.j])} = ${fm(R.newB[f.l][f.j])}.`,
      `${lead.ro}b = ${fi(bb)} − ${fi(eta)}·${fm(R.d[f.l][f.j])} = ${fm(R.newB[f.l][f.j])}.`,
    );
  };
  return M;
}
