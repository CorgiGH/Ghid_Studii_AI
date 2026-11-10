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
  it('counts: 14 for the sheet net and net B, more for net C; no number is typed', () => {
    expect(nnNet(sheet()).count).toBe(1 + 3 + 1 + 2 + 6 + 1);
    expect(nnNet(netB(1)).count).toBe(14);
    expect(nnNet(netC([0, 1])).count).toBe(1 + 2 + 3 + 2 + 2 + 12 + 1);
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

describe('nn-net drawing', () => {
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
