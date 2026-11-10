import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { nnNet, normalize, runNet, costOf } from '../../src/components/lesson/viz/logic/nn-net.js';
import { validateViz } from '../../src/components/lesson/viz/vizSpec.js';

vi.mock('../../src/contexts/AppContext', () => ({ useApp: () => ({ t: (en, ro) => ro, lang: 'ro' }) }));
vi.mock('../../src/lesson/useLessonStore', () => ({ useLessonStore: () => null, getLessonStore: () => null }));
vi.mock('motion/react', async (orig) => ({ ...(await orig()), useReducedMotion: () => true }));

const close = (a, b, tol = 1e-4) => expect(Math.abs(a - b)).toBeLessThan(tol);
const closeAll = (a, b, tol = 1e-4) => { expect(a.length).toBe(b.length); a.forEach((v, i) => close(v, b[i], tol)); };

// Backprop.pdf (the lab sheet): inputs (2, 6), target 0, no bias, sigmoid, CE, eta 0,5
const sheet = (values = 'sheet', extra = {}) => ({
  layers: [2, 2, 1], inputs: [2, 6], weights: { 2: [[-3, 6], [1, -2]], 3: [[8], [4]] },
  target: [0], act: 'sigmoid', out: 'sigmoid', eta: 0.5, values, layout: 'bottom-up', ...extra,
});
// fresh net B (recipe, scripts nn_l4_numbers_b.py)
const netB = (t) => ({
  layers: [2, 2, 1], inputs: [1, 2], weights: { 2: [[0.5, -1], [1, 0.5]], 3: [[1], [-1]] },
  target: [t], act: 'sigmoid', out: 'sigmoid', eta: 0.5, values: 'exact',
});
// fresh net C: softmax output, biases
const netC = (t) => ({
  layers: [2, 2, 2], inputs: [1, 2], weights: { 2: [[0.5, -1], [1, 0.5]], 3: [[1, -1], [-1, 1]] },
  biases: { 2: [0.1, -0.1], 3: [0, 0] }, target: t, act: 'sigmoid', out: 'softmax', eta: 0.5, values: 'exact',
});

describe('nn-net: the sheet net (Backprop.pdf)', () => {
  it('sheet values: the new weights are 7,75; 3,75; -5; 5; -5; -5', () => {
    const M = nnNet(sheet('sheet'));
    expect(M.R.z[2]).toEqual([0, 0]);
    expect(M.R.y[2]).toEqual([0.5, 0.5]);
    expect(M.R.z[3]).toEqual([6]);
    expect(M.R.y[3]).toEqual([1]);
    expect(M.R.d[3]).toEqual([1]);
    expect(M.R.d[2]).toEqual([2, 1]);
    expect(M.final.weights[1]).toEqual([[7.75], [3.75]]);
    expect(M.final.weights[0]).toEqual([[-5, 5], [-5, -5]]);
    expect(M.final.flat).toEqual([-5, 5, -5, -5, 7.75, 3.75]);
  });
  it('exact values: sigma(6) = 0,9975 and the exact new weights', () => {
    const M = nnNet(sheet('exact'));
    close(M.R.y[3][0], 0.9975);
    close(M.R.d[3][0], 0.9975);
    closeAll(M.R.d[2], [1.9951, 0.9975]);
    closeAll(M.final.weights[1].flat(), [7.7506, 3.7506]);
    closeAll(M.final.weights[0].flat(), [-4.9951, 5.0025, -4.9852, -4.9926]);
  });
  it('the hidden delta uses the old weight 8, not 7,75, and the props are not changed', () => {
    const props = sheet('sheet');
    const before = JSON.stringify(props);
    const M = nnNet(props);
    expect(M.R.d[2][0]).toBe(0.5 * 0.5 * 1 * 8);
    expect(JSON.stringify(props)).toBe(before);
    const k = M.frames.findIndex((f) => f.kind === 'dhid');
    expect(M.caption(k).ro).toContain('Ponderile sunt cele vechi');
    expect(M.pickSpec(k).items[0].options.some((o) => o.id === 'new-weight-in-delta')).toBe(true);
  });
  it('MSE: delta 0,0025 and the output weight only moves 8 to 7,9994', () => {
    const M = nnNet(sheet('exact', { loss: 'mse' }));
    close(M.R.d[3][0], 0.0025, 1e-4);
    close(M.final.weights[1][0][0], 7.9994, 1e-4);
    close(M.final.weights[1][1][0], 3.9994, 1e-4);
  });
  it('target 1: sheet mode changes nothing, exact mode moves w11 of layer 3 to 8,0006', () => {
    const a = nnNet(sheet('sheet', { target: [1] }));
    expect(a.R.d[3]).toEqual([0]);
    expect(a.R.d[2].map((v) => Math.abs(v))).toEqual([0, 0]);
    const b = nnNet(sheet('exact', { target: [1] }));
    close(b.R.d[3][0], -0.0025, 1e-4);
    close(b.final.weights[1][0][0], 8.0006, 1e-4);
  });
});

describe('nn-net: fresh nets and the finite-difference check', () => {
  it('net B, t = 1 then t = 0 (the numbers of the recipe)', () => {
    const one = nnNet(netB(1));
    closeAll(one.R.z[2], [2.5, 0]);
    close(one.R.y[3][0], 0.6045);
    close(one.R.d[3][0], -0.3955);
    closeAll(one.R.d[2], [-0.0277, 0.0989]);
    closeAll(one.final.weights[1].flat(), [1.1828, -0.9011]);
    closeAll(one.final.weights[0].flat(), [0.5139, -1.0494, 1.0277, 0.4011]);
    const zero = nnNet(netB(0));
    close(zero.R.d[3][0], 0.6045);
    closeAll(zero.R.d[2], [0.0424, -0.1511]);
    closeAll(zero.final.weights[1].flat(), [0.7207, -1.1511]);
    closeAll(zero.final.weights[0].flat(), [0.4788, -0.9244, 0.9576, 0.6511]);
  });
  it('net C, softmax with biases (the numbers of the recipe)', () => {
    const M = nnNet(netC([0, 1]));
    closeAll(M.R.z[2], [2.6, -0.1]);
    closeAll(M.R.y[3], [0.7133, 0.2867]);
    closeAll(M.R.d[3], [0.7133, -0.7133]);
    closeAll(M.R.d[2], [0.0918, -0.3558]);
    closeAll(M.final.weights[1].flat(), [0.668, -0.668, -1.1694, 1.1694]);
    closeAll(M.final.biases[1], [-0.3567, 0.3567]);
    closeAll(M.final.weights[0].flat(), [0.4541, -0.8221, 0.9082, 0.8558]);
    closeAll(M.final.biases[0], [0.0541, 0.0779]);
    const flip = nnNet(netC([1, 0]));
    closeAll(flip.R.d[3], [-0.2867, 0.2867]);
    closeAll(flip.R.d[2], [-0.0369, 0.143]);
    closeAll(flip.final.weights[1].flat(), [1.1334, -1.1334, -0.9319, 0.9319]);
    close(M.R.d[3].reduce((a, c) => a + c, 0), 0, 1e-12); // y - t sums to 0
  });
  it('every analytic gradient equals the central finite difference of the cost (1e-6)', () => {
    for (const props of [netB(1), netB(0), netC([0, 1]), netC([1, 0]), sheet('exact'), sheet('exact', { loss: 'mse' })]) {
      const P = normalize(props);
      const R = runNet(P);
      const h = 1e-6;
      for (let l = 2; l <= P.L; l += 1) {
        P.W[l].forEach((row, i) => row.forEach((_, j) => {
          const up = P.W.map((m) => (m ? m.map((r) => r.slice()) : m));
          const dn = P.W.map((m) => (m ? m.map((r) => r.slice()) : m));
          up[l][i][j] += h; dn[l][i][j] -= h;
          const fd = (costOf(P, up, P.b) - costOf(P, dn, P.b)) / (2 * h);
          close(R.gradW[l][i][j], fd, 1e-6);
        }));
        P.b[l].forEach((_, j) => {
          const up = P.b.map((v) => (v ? v.slice() : v));
          const dn = P.b.map((v) => (v ? v.slice() : v));
          up[l][j] += h; dn[l][j] -= h;
          close(R.gradB[l][j], (costOf(P, P.W, up) - costOf(P, P.W, dn)) / (2 * h), 1e-6);
        });
      }
    }
  });
});

describe('nn-net: frames, picks and captions', () => {
  it('counts: z and y are separate frames on sigmoid layers (17 for the sheet net and net B), softmax gets one frame; no number is typed', () => {
    expect(nnNet(sheet()).count).toBe(1 + 6 + 1 + 2 + 6 + 1);
    expect(nnNet(netB(1)).count).toBe(17);
    expect(nnNet(netC([0, 1])).count).toBe(1 + 4 + 2 + 1 + 2 + 2 + 12 + 1);
  });
  it('the y of a neuron is asked only after its z is revealed: no y prompt names a z that is still to be picked', () => {
    for (const props of [sheet('sheet'), sheet('exact'), netB(1), netC([0, 1])]) {
      const M = nnNet(props);
      M.frames.forEach((f, k) => {
        const spec = M.pickSpec(k);
        if (!spec) return;
        if (f.kind === 'z') expect(spec.items.length).toBe(1);
        if (f.kind === 'y') {
          expect(spec.items.length).toBe(1);
          expect(M.frames[k - 1]).toEqual({ kind: 'z', l: f.l, j: f.j });
          expect(M.state(k, false).z[`${f.l}.${f.j}`]).toBe(M.R.z[f.l][f.j]);
        }
      });
    }
  });
  it('every asked pick has one correct option and distinct labels; updates come after all delta frames', () => {
    for (const props of [sheet('sheet'), sheet('exact'), netB(1), netC([0, 1])]) {
      const M = nnNet(props);
      let lastDelta = -1; let firstUpd = 1e9;
      M.frames.forEach((f, k) => {
        if (f.kind === 'dout' || f.kind === 'dhid') lastDelta = k;
        if ((f.kind === 'upd' || f.kind === 'updb') && k < firstUpd) firstUpd = k;
        const spec = M.pickSpec(k);
        if (!spec) return;
        for (const it of spec.items) {
          expect(it.options.filter((o) => o.id === 'ok').length).toBe(1);
          expect(new Set(it.options.map((o) => o.label)).size).toBe(it.options.length);
          expect(it.options.length).toBeGreaterThanOrEqual(2);
        }
        expect(Object.values(M.answer(k)).every((v) => v === 'ok')).toBe(true);
      });
      expect(firstUpd).toBeGreaterThan(lastDelta);
    }
  });
  it('the values note is always in the first caption, with a comma and 4 places in exact mode', () => {
    expect(nnNet(sheet('sheet')).caption(0).ro).toContain('σ citit ca în foaie (1 zecimală)');
    expect(nnNet(sheet('exact')).caption(0).ro).toContain('σ exact (σ(6) = 0,9975)');
    // nets B and C never have z = 6: their note does not name σ(6)
    expect(nnNet(netB(1)).caption(0).ro).not.toContain('σ(6)');
    expect(nnNet(netC([0, 1])).caption(0).ro).not.toContain('σ(6)');
    expect(nnNet(netB(1)).caption(0).ro).toContain('wᵢⱼ');
    expect(nnNet(netB(1)).caption(0).ro).not.toContain('w_ij');
    const M = nnNet(sheet('exact'));
    const k = M.frames.findIndex((f) => f.kind === 'dout');
    expect(M.caption(k).ro).toContain('0,9975');
    expect(M.caption(k).ro).not.toMatch(/\d\.\d/);
  });
  it('a wrong pick leads the caption with Nu chiar', () => {
    const M = nnNet(sheet('sheet'));
    const k = M.frames.findIndex((f) => f.kind === 'dout');
    const spec = M.pickSpec(k);
    const bad = spec.items[0].options.find((o) => o.id !== 'ok');
    expect(M.caption(k, { picks: { [spec.items[0].key]: bad.id } }).ro.startsWith('Nu chiar (ai ales')).toBe(true);
  });
});

describe('nn-net: validation', () => {
  const block = (props) => ({ type: 'viz', id: 'v', widget: 'nn-net', predict: true, props });
  it('accepts the sheet net', () => { expect(validateViz(block(sheet()))).toEqual([]); });
  it('rejects a weights shape that does not match layers, a missing target, softmax with one output', () => {
    expect(validateViz(block({ ...sheet(), weights: { 2: [[1, 2]], 3: [[8], [4]] } })).join(' ')).toMatch(/weights/);
    const { target, ...noTarget } = sheet();
    void target;
    expect(validateViz(block(noTarget)).length).toBeGreaterThan(0);
    expect(validateViz(block({ ...sheet(), out: 'softmax' })).join(' ')).toMatch(/softmax/);
    expect(validateViz(block({ ...sheet(), loss: 'mse', out: 'softmax', layers: [2, 2, 2], weights: { 2: [[1, 2], [3, 4]], 3: [[1, 2], [3, 4]] }, target: [0, 1] })).join(' ')).toMatch(/mse/);
  });
});

// Every text of the drawing as a box in viewBox units: a bold glyph is at most 0.64 of the font size wide, caps reach 0.74 of it above
// the baseline and a comma 0.2 below; 1 unit of margin on each side keeps a label clear of its neighbour's 2-unit halo.
const textBoxes = (html) => [...html.matchAll(/<text ([^>]*)>([\s\S]*?)<\/text>/g)].map((m) => {
  const a = (n) => (m[1].match(new RegExp(`(?:^|\\s)${n}="([^"]*)"`)) || [])[1];
  const txt = m[2].replace(/<!-- -->/g, '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&');
  const fs = Number(a('font-size'));
  const x = Number(a('x'));
  const y = Number(a('y'));
  const w = [...txt].length * 0.64 * fs + 2;
  const anchor = a('text-anchor') || 'start';
  const x0 = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
  return { txt, x0, x1: x0 + w, y0: y - 0.74 * fs - 1, y1: y + 0.2 * fs + 1, numeric: a('data-value') !== undefined, fs };
});
const circles = (html) => [...html.matchAll(/<circle cx="([^"]*)" cy="([^"]*)" r="([^"]*)"/g)].map((m) => ({ cx: Number(m[1]), cy: Number(m[2]), r: Number(m[3]) }));
const hit = (p, q) => p.x0 < q.x1 && q.x0 < p.x1 && p.y0 < q.y1 && q.y0 < p.y1;
const plates = (html) => [...html.matchAll(/<rect class="nn-plate" x="([^"]*)" y="([^"]*)" width="([^"]*)" height="([^"]*)"/g)]
  .map((m) => ({ x0: Number(m[1]), y0: Number(m[2]), x1: Number(m[1]) + Number(m[3]), y1: Number(m[2]) + Number(m[4]) }));
const inside = (b, pl) => b.x0 >= pl.x0 && b.x1 <= pl.x1 && b.y0 >= pl.y0 && b.y1 <= pl.y1;

describe('nn-net drawing', () => {
  it('no two labels overlap and none leaves the picture or covers a neuron, in every frame of the six lesson nets', async () => {
    const { Stage } = await import('../../src/components/lesson/viz/widgets/NnNet.jsx');
    const { NN_GEOM } = await import('../../src/components/lesson/viz/logic/nn-net-layout.js');
    const nets = [sheet('sheet'), sheet('exact'), sheet('exact', { loss: 'mse' }), netB(1), netB(0), netC([0, 1]), netC([1, 0])];
    let checked = 0;
    for (const props of nets) {
      const M = nnNet(props);
      for (let k = 0; k < M.count; k += 1) {
        for (const answered of [false, true]) {
          const html = renderToStaticMarkup(React.createElement(Stage, { M, k, answered }));
          const vb = html.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/).slice(1).map(Number);
          const boxes = textBoxes(html);
          const circ = circles(html);
          const pls = plates(html);
          // the z, δ, b lines sit inside their neuron's plate; no other label touches a plate
          for (const b of boxes) {
            const own = pls.filter((pl) => inside(b, pl));
            if (/^[zδb] /.test(b.txt)) expect(own.length, `frame ${k}: "${b.txt}" is not on its plate`).toBe(1);
            else for (const pl of pls) expect(hit(b, pl), `frame ${k}: "${b.txt}" runs into a plate`).toBe(false);
          }
          expect(boxes.every((b) => b.fs >= 13), `frame ${k}: a text under 13 units`).toBe(true);
          for (const b of boxes) {
            expect(b.x0 >= 0 && b.x1 <= vb[0] && b.y0 >= 0 && b.y1 <= vb[1], `frame ${k}: "${b.txt}" leaves the ${vb.join('x')} picture`).toBe(true);
            // a label may sit inside its own neuron only (the value in the circle); everything else stays off the circles
            for (const c of circ) {
              const inside = Math.abs((b.x0 + b.x1) / 2 - c.cx) < 1 && Math.abs((b.y0 + b.y1) / 2 - c.cy) < c.r;
              if (inside) { expect(b.x1 - b.x0, `frame ${k}: "${b.txt}" is wider than its neuron`).toBeLessThanOrEqual(2 * c.r + 4); continue; }
              const nx = Math.max(b.x0, Math.min(c.cx, b.x1));
              const ny = Math.max(b.y0, Math.min(c.cy, b.y1));
              expect(Math.hypot(nx - c.cx, ny - c.cy) >= c.r, `frame ${k}: "${b.txt}" covers a neuron`).toBe(true);
            }
          }
          for (let i = 0; i < boxes.length; i += 1) {
            for (let j = i + 1; j < boxes.length; j += 1) {
              if (!boxes[i].numeric && !boxes[j].numeric) continue;
              expect(hit(boxes[i], boxes[j]), `frame ${k}: "${boxes[i].txt}" overlaps "${boxes[j].txt}"`).toBe(false);
              checked += 1;
            }
          }
        }
      }
    }
    expect(checked).toBeGreaterThan(1000);
    expect(NN_GEOM.R).toBeGreaterThanOrEqual(24);
  });
  it('exact mode draws 2 places on the net and keeps 4 in the caption and the end table', async () => {
    const { Stage } = await import('../../src/components/lesson/viz/widgets/NnNet.jsx');
    const M = nnNet(netC([0, 1]));
    const end = M.count - 1;
    const html = renderToStaticMarkup(React.createElement(Stage, { M, k: end }));
    const svg = html.slice(0, html.indexOf('</svg>'));
    const table = html.slice(html.indexOf('<table'));
    expect(svg).toContain('0,67');
    expect(svg).not.toMatch(/\d,\d{3}/);
    expect(table).toContain('0,6680');
    expect(table).toContain('w³₁₁');
    expect(M.caption(end).ro).toContain('0,6680');
    // a small delta keeps its digits: the MSE output delta 0,0025 is not drawn as 0,00
    const Q = nnNet(sheet('exact', { loss: 'mse' }));
    const k = Q.frames.findIndex((f) => f.kind === 'dout');
    const mse = renderToStaticMarkup(React.createElement(Stage, { M: Q, k }));
    expect(mse).toContain('δ 0,0025');
    expect(mse).not.toContain('δ 0,00<');
  });
  it('draws every computed number of every caption (all frames, both modes)', async () => {
    const { Stage } = await import('../../src/components/lesson/viz/widgets/NnNet.jsx');
    for (const props of [sheet('sheet'), sheet('exact'), netB(1), netC([0, 1])]) {
      const M = nnNet(props);
      for (let k = 1; k < M.count; k += 1) {
        const html = renderToStaticMarkup(React.createElement(Stage, { M, k, answered: true }));
        const drawn = new Set([...html.matchAll(/data-value="([^"]*)"/g)].map((m) => m[1]));
        const cap = M.caption(k).ro;
        for (const m of cap.matchAll(/\d+,\d+/g)) {
          const v = String(Number(m[0].replace(',', '.')));
          expect(drawn.has(v), `frame ${k}: ${m[0]} is in the caption but not drawn. ${cap}`).toBe(true);
        }
      }
    }
  });
  it('the widget renders its first frame with the note and the legend', async () => {
    const NnNet = (await import('../../src/components/lesson/viz/widgets/NnNet.jsx')).default;
    const html = renderToStaticMarkup(React.createElement(NnNet, { props: sheet('sheet'), predict: true }));
    expect(html).toContain('data-widget="nn-net"');
    expect(html).toContain('σ citit ca în foaie');
  });
  it('the end frame lists old and new weights', async () => {
    const { Stage } = await import('../../src/components/lesson/viz/widgets/NnNet.jsx');
    const M = nnNet(sheet('sheet'));
    const html = renderToStaticMarkup(React.createElement(Stage, { M, k: M.count - 1 }));
    expect((html.match(/data-mark="final"/g) || []).length).toBe(6);
    expect(html).toContain('7,75');
  });
});
