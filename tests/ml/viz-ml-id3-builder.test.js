import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import * as K from '../../src/ml/calc/mathKit.js';
import { stumpsModel, compareModel, fullModel, productOf } from '../../src/components/lesson/viz/logic/ml/id3-builder.js';
import { validateViz, WIDGET_NAMES } from '../../src/components/lesson/viz/vizSpec.js';
import { expectCaptionDrawn, numbersOf } from './ml-viz-helpers.js';

vi.mock('../../src/lesson/useLessonStore', async () => {
  const { createLessonStore } = await import('../../src/lesson/store.js');
  const m = new Map();
  const store = createLessonStore({ getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { m.set(k, String(v)); } });
  return { useLessonStore: () => store, getLessonStore: () => store };
});
vi.mock('../../src/contexts/AppContext', () => ({ useApp: () => ({ t: (en, ro) => ro }) }));
vi.mock('motion/react', async (orig) => ({ ...(await orig()), useReducedMotion: () => true }));

const { default: Id3Builder, Stage } = await import('../../src/components/lesson/viz/widgets/ml/Id3Builder.jsx');

const bi = (en, ro) => ({ en, ro });
const T = bi('true', 'adevărat');
const F = bi('false', 'fals');
// P21 1(b.i): 128 examples, three stumps given as boxes [pos, neg]
const P21 = {
  mode: 'stumps',
  given: {
    root: [64, 64],
    stumps: [
      { name: 'Home-Owner', branches: [{ value: T, counts: [48, 16] }, { value: F, counts: [16, 48] }] },
      { name: 'In-Debt', branches: [{ value: T, counts: [48, 48] }, { value: F, counts: [16, 16] }] },
      { name: 'Rich', branches: [{ value: T, counts: [24, 8] }, { value: F, counts: [40, 56] }] },
    ],
  },
};
// L10: C1, C2, C3 (counts are [pos, neg]; the outline writes [a-, b+])
const CASES = {
  mode: 'compare',
  cases: [
    { stumps: [{ name: 'A', branches: [{ counts: [0, 2] }, { counts: [4, 1] }] }, { name: 'B', branches: [{ counts: [1, 1] }, { counts: [3, 2] }] }] },
    { nodes: [[3, 5], [9, 2]] },
    { stumps: [{ name: 'A', branches: [{ counts: [9, 1] }, { counts: [3, 7] }] }, { name: 'B', branches: [{ counts: [6, 2] }, { counts: [6, 6] }] }] },
  ],
};
// L11: T20b 2.1, six rows
const T20B = { columns: ['running nose', 'coughing', 'reddened skin', 'fever', 'ill'], rows: [['+', '+', '+', '-', '+'], ['+', '+', '-', '-', '+'], ['-', '-', '+', '+', '+'], ['+', '-', '-', '-', '+'], ['-', '-', '-', '-', '-'], ['-', '+', '+', '-', '-']] };
const FULL = { mode: 'full', table: T20B, target: 'ill' };
const PT = JSON.parse(readFileSync(new URL('./fixtures/playtennis.json', import.meta.url), 'utf8'));
// 4.38: vampires, with the occurrence counts as the weight column
const VAMP = { columns: ['V', 'G', 'T', 'Counts'], rows: [['+', 't', 't', 9], ['+', 't', 'f', 4], ['+', 'f', 't', 3], ['+', 'f', 'f', 0], ['-', 't', 't', 1], ['-', 't', 'f', 3], ['-', 'f', 't', 1], ['-', 'f', 'f', 6]] };

describe('stumps (L9, P21)', () => {
  const M = stumpsModel(P21);
  it('has the outline numbers: 0.8113, 1 and 0.9377, IG 0.1887, error 1/4', () => {
    expect(M.stumps.map((s) => s.hc)).toEqual([expect.closeTo(0.8113, 4), expect.closeTo(1, 12), expect.closeTo(0.9377, 4)]);
    expect(M.stumps[0].branches.map((b) => b.counts.map(String))).toEqual([['48', '16'], ['16', '48']]);
    expect(M.best).toBe(0);
    expect(M.stumps[0].ig).toBeCloseTo(0.1887, 4);
    expect(M.errFrac.toString()).toBe('1/4');
  });
  it('H(Y|A) is the weighted sum and equals the kit value on the same data as rows', () => {
    const rows = [];
    // a table with the same boxes: Home-Owner only (the other two are not a joint table), counts as weights
    for (const [v, p, n] of [['t', '+', 48], ['t', '-', 16], ['f', '+', 16], ['f', '-', 48]]) rows.push([v, p, n]);
    const t = { columns: ['H', 'Y', 'Counts'], rows };
    const M2 = stumpsModel({ mode: 'stumps', table: t, target: 'Y' });
    expect(M2.stumps[0].hc).toBeCloseTo(M.stumps[0].hc, 12);
    expect(M2.stumps[0].hc).toBeCloseTo(K.Hc({ columns: ['H', 'Y', 'P'], rows }, 'H', 'Y'), 12);
  });
  it('frames: setup, one per stump, then formula, values and winner', () => {
    expect(M.frames.map((f) => f.kind)).toEqual(['setup', 'boxes', 'boxes', 'boxes', 'formula', 'values', 'winner']);
  });
  it('captions state the outline numbers', () => {
    expect(M.caption(1).ro).toBe('Home-Owner: adevărat [48+,16−]; fals [16+,48−]. Control: exemplele + din cutii dau 48 + 16 = 64.');
    expect(M.caption(5).ro).toContain('H(Y|Home-Owner) = 0.8113, H(Y|In-Debt) = 1.0000, H(Y|Rich) = 0.9377');
    expect(M.caption(6).ro).toContain('IG = H(Y) − H(Y|Home-Owner) = 1.0000 − 0.8113 = 0.1887');
    expect(M.caption(6).ro).toContain('(16 + 16)/128 = 1/4');
  });
  it('the values stay out of every caption until the prediction (formula frame)', () => {
    for (let k = 0; k <= 4; k++) for (const s of M.stumps) expect(M.caption(k, { predict: true }).ro).not.toContain(s.hc.toFixed(4));
    const spec = M.pickSpec(4, true);
    expect(spec.items[0].options).toHaveLength(3);
    expect(M.pickSpec(4, false)).toBeNull();
    expect(M.pickSpec(3, true).items[0].key).toBe('box2'); // the boxes of the last stump are asked first
  });
  it('a pick is answered in the values caption', () => {
    expect(M.caption(5, { picks: { best: 1 } }).ro).toContain('Ai ales In-Debt: entropia lui nu e cea mai mică.');
    expect(M.caption(5, { picks: { best: 0 } }).en).toContain('You picked Home-Owner: right.');
  });
  it('showValues false stops after the boxes', () => {
    expect(stumpsModel({ ...P21, showValues: false }).count).toBe(4);
  });
  it('rejects branches that do not add up to the root', () => {
    const bad = { mode: 'stumps', given: { root: [64, 64], stumps: [{ name: 'X', branches: [{ counts: [48, 16] }, { counts: [15, 48] }] }] } };
    expect(() => stumpsModel(bad)).toThrow(/add up/);
  });
  it('a table with Counts: 4.38 gives H(V|G) = 0.822 and H(V|T) = 0.7355, T is the root', () => {
    const V = stumpsModel({ mode: 'stumps', table: VAMP, target: 'V' });
    const [g, t] = V.stumps;
    expect(g.attr).toBe('G');
    expect(g.hc).toBeCloseTo(0.822, 3);
    expect(t.hc).toBeCloseTo(0.7355, 4);
    expect(g.branches.map((b) => b.counts.map(String))).toEqual([['3', '7'], ['13', '4']]); // values in sorted order: f, t
    expect(V.best).toBe(1);
    expect(V.stumps[1].ig).toBeCloseTo(0.9751 - 0.7355, 3);
    expect(V.rootCounts.map(String)).toEqual(['16', '11']);
  });
});

describe('compare (L10)', () => {
  const M = compareModel(CASES);
  const [c1, c2, c3] = M.cases;
  it('C1 matches the branches: weights coincide, A is better, 0.5157 against 0.9793', () => {
    expect(c1.decided).toBe(true);
    expect(c1.pairs.map((p) => p.sym)).toEqual(['<', '<']);
    expect(c1.verdict).toBe('A');
    expect(c1.stumps[0].hc).toBeCloseTo(0.5157, 4);
    expect(c1.stumps[1].hc).toBeCloseTo(0.9793, 4);
  });
  it('the minority-share order agrees with the entropy order in every pair', () => {
    for (const c of [c1, c3]) for (const p of c.pairs) expect(p.sym === p.symH || !p.wEq).toBe(true);
    expect(c2.sym).toBe(c2.symH);
  });
  it('C2: 3/8 > 2/11, entropies 0.9544 > 0.6840', () => {
    expect(c2.sym).toBe('>');
    expect(c2.units[0].share.toString()).toBe('3/8');
    expect(c2.units[1].share.toString()).toBe('2/11');
    expect(c2.units[0].h).toBeCloseTo(0.9544, 4);
    expect(c2.units[1].h).toBeCloseTo(0.684, 4);
  });
  it('C3 does not match: the weights differ, so the product formula opens', () => {
    expect(c3.decided).toBe(false);
    expect(c3.weightsEqual).toBe(false);
    expect(c3.frames.map((f) => f.kind)).toEqual(['boxes', 'product']);
    expect(c3.prods[0].value).toBeCloseTo(11608.27, 2);
    expect(c3.prods[1].value).toBeCloseTo(368224.2, 1);
    expect(c3.winner).toBe('A');
    expect(c3.stumps[0].hc).toBeCloseTo(0.6751, 4);
    expect(c3.stumps[1].hc).toBeCloseTo(0.9245, 4);
    expect(c3.hRoot).toBeCloseTo(0.971, 3);
    expect(c3.hRoot - c3.stumps[0].hc).toBeCloseTo(0.2958, 4);
    expect(c3.hRoot - c3.stumps[1].hc).toBeCloseTo(0.0464, 4);
  });
  it('log2 P / N is the weighted entropy sum', () => {
    for (const s of c3.stumps) expect(productOf(s, c3.N).hc).toBeCloseTo(s.hc, 10);
  });
  it('frames: 3 + 3 + 2', () => {
    expect(M.count).toBe(8);
    expect(M.frames.map((f) => `${f.ci}${f.kind[0]}`)).toEqual(['0b', '0s', '0v', '1b', '1s', '1v', '2b', '2p']);
  });
  it('the symbols stay out of the caption until the symbols frame, and a pick is answered', () => {
    expect(M.caption(0, { predict: true }).ro).not.toMatch(/\] [<>=] \[/);
    expect(M.caption(1, { picks: { '0:0': '<', '0:1': '>' } }).ro).toContain('(ai ales corect)');
    expect(M.caption(1, { picks: { '0:0': '<', '0:1': '>' } }).ro).toContain('(ai ales >)');
    expect(M.pickSpec(0, true).items).toHaveLength(2);
    expect(M.pickSpec(3, true).items).toHaveLength(1);
    expect(M.pickSpec(6, true).items[0].options.map((o) => o.id)).toEqual(['yes', 'no']);
    expect(M.pickSpec(1, true)).toBeNull();
  });
});

describe('full (L11, T20b 2.1)', () => {
  const M = fullModel(FULL);
  it('is the ID3 of the kit: root running nose, 2 tests, 3 leaves, error 0', () => {
    expect(K.id3Root(T20B, 'ill')).toEqual({ attr: 'running nose' });
    expect(M.expansions[0].bestStump.attr).toBe('running nose');
    expect(M.expansions[1].bestStump.attr).toBe('fever');
    expect(M.tests).toBe(K.id3Tests(T20B, 'ill'));
    expect(M.leaves).toHaveLength(3);
    expect(M.errW.toString()).toBe('0');
    expect(K.trainErrId3(T20B, 'ill')).toBe(0);
  });
  it('has the outline numbers at the root and at the second node', () => {
    const [e0, e1] = M.expansions;
    expect(M.hRoot).toBeCloseTo(0.9183, 4);
    expect(e0.cands.map((c) => c.hc)).toEqual([expect.closeTo(0.4591, 4), expect.closeTo(0.9183, 4), expect.closeTo(0.9183, 4), expect.closeTo(0.8091, 4)]);
    expect(e0.bestStump.ig).toBeCloseTo(0.4591, 4);
    expect(e1.cands.map((c) => c.ig)).toEqual([expect.closeTo(0.2516, 4), expect.closeTo(0.2516, 4), expect.closeTo(0.9183, 4)]);
    expect(e1.node.counts.map(String)).toEqual(['1', '2']);
  });
  it('frames: setup, two splits, final; the pick for a split is asked one frame before', () => {
    expect(M.frames.map((f) => f.kind)).toEqual(['setup', 'split', 'split', 'final']);
    expect(M.pickSpec(0, true).items[0].key).toBe('e0');
    expect(M.pickSpec(1, true).items[0].key).toBe('e1');
    expect(M.pickSpec(2, true)).toBeNull();
    expect(M.pickSpec(0, false)).toBeNull();
  });
  it('captions', () => {
    expect(M.caption(0).ro).toBe('Rădăcina: 6 exemple, [4+,2−], H(ill) = 0.9183.');
    expect(stumpsModel(P21).caption(0).ro).toContain('128 de exemple');
    expect(M.caption(1).ro).toContain('Cel mai bun e running nose (IG = 0.4591)');
    expect(M.caption(3).ro).toBe('Arborele e gata: 2 teste, 3 frunze. Eroarea la antrenare: 0/6.');
  });
  it('the setup caption does not name the split before the prediction', () => {
    expect(M.caption(0, { predict: true }).ro).not.toContain('running nose');
  });
  it('PlayTennis (14 rows, 3-valued Outlook): the same tree as the kit', () => {
    const P = fullModel({ mode: 'full', table: PT, target: 'EnjoyTennis' });
    expect(P.expansions[0].bestStump.attr).toBe(K.id3Root(PT, 'EnjoyTennis').attr);
    expect(P.tests).toBe(K.id3Tests(PT, 'EnjoyTennis'));
    expect(P.errW.toString()).toBe(String(K.trainErrId3(PT, 'EnjoyTennis')));
    expect(P.expansions[0].bestStump.ig).toBeCloseTo(K.IG(PT, 'Outlook', 'EnjoyTennis'), 12);
  });
  it('counts as weights: the same tree as the rows written out', () => {
    const W = fullModel({ mode: 'full', table: VAMP, target: 'V' });
    const rows = VAMP.rows.flatMap((r) => Array.from({ length: r[3] }, () => r.slice(0, 3)));
    const E = fullModel({ mode: 'full', table: { columns: ['V', 'G', 'T'], rows }, target: 'V' });
    expect(W.expansions.map((e) => e.bestStump.attr)).toEqual(E.expansions.map((e) => e.bestStump.attr));
    expect(W.expansions.map((e) => e.bestStump.hc)).toEqual(E.expansions.map((e) => e.bestStump.hc));
    expect(W.errFrac.toString()).toBe(E.errFrac.toString());
  });
});

const MODELS = { stumps: [P21, stumpsModel], compare: [CASES, compareModel], full: [FULL, fullModel] };

describe('the caption matches the picture, every frame, both languages', () => {
  for (const [name, [props, build]] of Object.entries(MODELS)) {
    it(`${name}: every number of the caption is drawn at that frame`, () => {
      const M = build(props);
      for (let k = 0; k < M.count; k++) {
        for (const predict of [false, true]) {
          const picks = predict ? { best: 0, 'e0': 'running nose', e1: 'fever', '0:0': '<', '0:1': '<', '0:2': '<', '1:0': '>', '2:match': 'no' } : {};
          const html = renderToStaticMarkup(React.createElement(Stage, { model: M, k, predict }));
          expectCaptionDrawn(expect, M.caption(k, { predict, picks }), html, `${name} frame ${k}`);
        }
      }
    });
  }
  it('stumps: every frame draws the figures its caption cites (spot check of the marks)', () => {
    const M = stumpsModel(P21);
    const html = renderToStaticMarkup(React.createElement(Stage, { model: M, k: 6, predict: false }));
    for (const v of ['1.0000', '0.8113', '0.1887', '1/4', '128']) expect(html).toContain(`data-value="${v}"`);
  });
  it('compare: the product frame draws P, the entropies and the gains', () => {
    const M = compareModel(CASES);
    const html = renderToStaticMarkup(React.createElement(Stage, { model: M, k: 7, predict: false }));
    for (const v of ['11608.27', '368224.2', '0.6751', '0.9245', '0.9710', '0.2958', '0.0464']) expect(html).toContain(`data-value="${v}"`);
  });
});

describe('the widget', () => {
  const html = (props, predict) => renderToStaticMarkup(React.createElement(Id3Builder, { props, predict }));
  it('first frame without predict: Next is open', () => {
    const h = html(P21, false);
    expect(h).toContain('data-widget="ml-id3-builder"');
    expect(h).not.toMatch(/viz-btn-primary[^>]*disabled/);
  });
  it('first frame with predict: stumps asks at the formula frame, so Next is open at the setup', () => {
    const h = html(P21, true);
    expect(h).toContain('Rădăcina: 128 de exemple');
    expect(h).not.toContain('mlv-picks');
  });
  it('full with predict: the root pick shows at the first frame and Next is locked', () => {
    const h = html(FULL, true);
    expect(h).toContain('mlv-picks');
    expect(h).toMatch(/viz-btn-primary[^>]*disabled/);
    expect(h).not.toContain('Cel mai bun e');
  });
  it('compare with predict: the symbol buttons show, with no symbol drawn yet', () => {
    const h = html(CASES, true);
    expect(h).toContain('mlv-picks');
    expect(h).not.toContain('class="mlv-sym"');
    expect(h).toMatch(/viz-btn-primary[^>]*disabled/);
  });
  it('every option is a button of at least 44 px (class carries min-height 44)', () => {
    const css = readFileSync(new URL('../../src/components/lesson/viz/widgets/ml/id3.css', import.meta.url), 'utf8');
    expect(css).toMatch(/\.mlv-opt \{[^}]*min-height: 44px/);
  });
  it('the css has no colour literals', () => {
    const css = readFileSync(new URL('../../src/components/lesson/viz/widgets/ml/id3.css', import.meta.url), 'utf8');
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/);
    expect(css).not.toMatch(/opacity: 0\.[0-9]/);
  });
  it('the drawn-number check really fails on a number that is not drawn', () => {
    expect(() => expectCaptionDrawn(expect, { en: 'is 7', ro: 'e 7' }, '<i data-value="8">8</i>', 'x')).toThrow();
    expect(() => expectCaptionDrawn(expect, { en: 'is 8', ro: 'e 9' }, '<i data-value="8">8</i>', 'x')).toThrow();
  });
  it('numbers sanity: the helper reads fractions and decimals', () => {
    expect(numbersOf('H(Y|X1) = 0.8113 and 3/8 log2(5)')).toEqual(['0.8113', '3', '8', '5']);
  });
});

describe('validateViz', () => {
  const ok = (props, predict = true) => validateViz({ id: 'ml-l09-v1', widget: 'ml-id3-builder', predict, props });
  it('is registered', () => { expect(WIDGET_NAMES).toContain('ml-id3-builder'); });
  it('accepts the outline props for the three modes', () => {
    expect(ok(P21)).toEqual([]);
    expect(ok(CASES)).toEqual([]);
    expect(ok(FULL)).toEqual([]);
    expect(ok({ mode: 'stumps', table: VAMP, target: 'V', showValues: false })).toEqual([]);
  });
  it('rejects a missing or wrong prop', () => {
    expect(ok({ mode: 'full', table: T20B })).not.toEqual([]);
    expect(ok({ mode: 'full', table: T20B, target: 'nope' })).not.toEqual([]);
    expect(ok({ mode: 'compare' })).not.toEqual([]);
    expect(ok({ mode: 'stumps' })).not.toEqual([]);
    expect(ok({ table: T20B, target: 'ill' })).not.toEqual([]);
    expect(ok({ mode: 'sideways', table: T20B, target: 'ill' })).not.toEqual([]);
    expect(ok({ mode: 'stumps', given: { root: [4, 4], stumps: [{ name: 'A', branches: [{ counts: [1, 2, 3] }, { counts: [3, 2] }] }] } })).not.toEqual([]);
    expect(ok({ mode: 'compare', cases: [{ nodes: [[1, 2]] }] })).not.toEqual([]);
  });
});

describe('review fixes', () => {
  const css = () => readFileSync(new URL('../../src/components/lesson/viz/widgets/ml/id3.css', import.meta.url), 'utf8');
  const stage = (M, k, predict, picks) => renderToStaticMarkup(React.createElement(Stage, { model: M, k, predict, picks }));
  it('stumps with predict asks for the boxes of each stump before drawing them (outline L9: the learner predicts the boxes)', () => {
    const M = stumpsModel(P21);
    expect(M.pickSpec(1, true).items[0].key).toBe('box0');
    expect(M.pickSpec(3, true).items[0].key).toBe('box2');
    expect(M.pickSpec(1, false)).toBeNull();
    const ask = M.caption(1, { predict: true, picks: {} });
    expect(ask.ro).toContain('Home-Owner');
    expect(numbersOf(ask.ro)).toEqual([]);
    expect(numbersOf(ask.en)).toEqual([]);
    expect(M.caption(1, { predict: true, picks: { box0: 'show' } }).ro).toContain('[48+,16−]');
    const hidden = stage(M, 1, true, {});
    expect(hidden).not.toContain('data-box="48,16"');
    expect(hidden).toContain('data-box="64,64"');
    expect(stage(M, 1, true, { box0: 'show' })).toContain('data-box="48,16"');
    // an earlier stump stays drawn once its boxes were shown
    expect(stage(M, 2, true, { box0: 'show' })).toContain('data-box="48,16"');
    expect(stage(M, 2, true, { box0: 'show' })).not.toContain('data-box="48,48"');
  });
  it('the boxes asked before the formula frame still lock Next on the widget', () => {
    const h = renderToStaticMarkup(React.createElement(Id3Builder, { props: P21, predict: true }));
    expect(h).toContain('Rădăcina: 128 de exemple');
  });
  it('stumps from a table draw the table they count', () => {
    const h = stage(stumpsModel({ mode: 'stumps', table: VAMP, target: 'V' }), 0, false, {});
    expect(h).toContain('<th>Counts</th>');
    expect(h).toContain('data-value="9"');
  });
  it('compare: before the yes/no pick the caption does not say whether the branches match', () => {
    const M = compareModel(CASES);
    const ask = M.caption(6, { predict: true, picks: {} });
    expect(ask.en).not.toMatch(/does not match|cannot decide|product/);
    expect(ask.ro).not.toMatch(/Nu se potrivește|nu poate hotărî|produsului/);
    expect(M.caption(6, { predict: true, picks: { '2:match': 'no' } }).ro).toContain('corect');
    expect(M.caption(6, { predict: true, picks: { '2:match': 'yes' } }).ro).toContain('Nu se potrivește');
    expect(M.caption(6, { predict: false }).ro).toContain('Nu se potrivește');
  });
  it('compare: the root box the caption cites is drawn', () => {
    const M = compareModel(CASES);
    expect(stage(M, 0, false, {})).toContain('data-box="4,3"');
    expect(stage(M, 6, false, {})).toContain('data-box="12,8"');
  });
  it('compare: Romanian for stumps with different numbers of branches, and the pair sentence', () => {
    const M = compareModel({ mode: 'compare', cases: [{ stumps: [{ name: 'A', branches: [{ counts: [1, 1] }, { counts: [2, 0] }] }, { name: 'B', branches: [{ counts: [1, 0] }, { counts: [1, 1] }, { counts: [1, 0] }] }] }] });
    expect(M.caption(0).ro).toContain('Cioturile au număr diferit de ramuri');
    const C = compareModel(CASES);
    expect(C.caption(1).ro).toMatch(/^Perechea 1:/);
    expect(C.caption(1).ro).not.toContain('câștigă ramura');
    expect(C.caption(2).ro).toContain('perechii ei din B');
  });
  it('full: rows outside the node are marked with a class of its own, not the opacity class of the BD tables', () => {
    const h = stage(fullModel(FULL), 2, false, {});
    expect(h).not.toMatch(/class="dim"/);
    expect(h).toContain('mlv-out');
  });
  it('values caption names the smallest entropy', () => {
    expect(stumpsModel(P21).caption(5).ro).toContain('Cea mai mică e H(Y|Home-Owner).');
  });
  it('css: the controls reach 44 px and coloured text uses the ink tokens, never a raw lesson token', () => {
    expect(css()).toMatch(/\.viz\[data-widget\^="ml-"\] \.viz-btn \{[^}]*min-height: 44px/);
    const colours = [...css().matchAll(/(?:^|[;{\s])color:\s*([^;}]+)/g)].map((m) => m[1]);
    expect(colours.length).toBeGreaterThan(5);
    for (const c of colours) expect(c).not.toMatch(/var\(--lt-(keep|drop|hint|acc|t\d)\)|--theme-muted-text/);
  });
  it('index.css defines the ML ink tokens as colour mixes of the lesson and theme tokens', () => {
    const idx = readFileSync(new URL('../../src/index.css', import.meta.url), 'utf8');
    for (const k of ['keep', 'drop', 'hint']) expect(idx).toContain(`--ml-${k}-ink: color-mix(in srgb, var(--lt-${k}) 70%, var(--theme-content-text));`);
    expect(idx).toContain('--ml-muted-ink: color-mix(in srgb, var(--theme-muted-text) 60%, var(--theme-content-text));');
  });
});
