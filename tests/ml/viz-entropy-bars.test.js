import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { marks, text } from './w2-viz-helpers.js';
import { validateViz } from '../../src/components/lesson/viz/vizSpec.js';
import { entropyBars, Hab, Hcounts, curvePoint } from '../../src/components/lesson/viz/logic/ml/entropy-bars.js';
import { H } from '../../src/ml/calc/mathKit.js';

let LANG = 'ro';
vi.mock('../../src/lesson/useLessonStore', async () => {
  const { createLessonStore } = await import('../../src/lesson/store.js');
  const m = new Map();
  const store = createLessonStore({ getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { m.set(k, String(v)); } });
  return { useLessonStore: () => store, getLessonStore: () => store };
});
vi.mock('../../src/contexts/AppContext', () => ({ useApp: () => ({ t: (en, ro) => (LANG === 'ro' ? ro : en), lang: LANG }) }));
vi.mock('motion/react', async (orig) => ({ ...(await orig()), useReducedMotion: () => true }));

const { default: EntropyBars, EntropyStage } = await import('../../src/components/lesson/viz/widgets/ml/EntropyBars.jsx');

// L7 "Vizual": [2+,4-] vs [1+,5-], [4+,4-] vs [6+,2-], the maximum, the mirror [1+,7-]. L8: the ten flats.
const L7 = { splits: [[2, 4], [1, 5], [4, 4], [6, 2], [1, 7]] };
const L8 = { splits: [[3, 1], [2, 4]], venn: { X: 'X', Y: 'Y', xGroups: ['Centru', 'Periferie'], yLabels: ['Scumpă', 'Ieftină'] } };
const r4 = (x) => Math.round(x * 1e4) / 1e4;

describe('entropy-bars logic, L7', () => {
  const M = entropyBars(L7);
  it('the outline entropies: 0.9183 > 0.6500, 1 > 0.8113, mirror 0.5436 twice', () => {
    expect(r4(Hab(2, 4))).toBe(0.9183);
    expect(r4(Hab(1, 5))).toBe(0.65);
    expect(Hab(4, 4)).toBe(1);
    expect(r4(Hab(6, 2))).toBe(0.8113);
    expect(r4(Hab(1, 7))).toBe(0.5436);
    expect(Hab(1, 7)).toBeCloseTo(Hab(7, 1), 12);
    expect(Hab(0, 6)).toBe(0);
    expect(Hab(3, 3)).toBe(1);
  });
  it('agrees with mathKit H on counts', () => {
    expect(Hab(2, 4)).toBeCloseTo(H(2, 4), 12);
    expect(Hcounts([5, 5])).toBeCloseTo(1, 12);
  });
  it('frames: ask/show, ask/show, max ask/show, mirror ask/show', () => {
    expect(M.frames.map((f) => f.kind)).toEqual(['ask', 'show', 'ask', 'show', 'max-ask', 'max-show', 'mirror-ask', 'mirror-show']);
    expect(M.count).toBe(8);
    expect(M.mode).toBe('compare');
  });
  it('ask frames hide the values and show them after', () => {
    expect(M.frames[0].values).toBe(false);
    expect(M.frames[0].points).toHaveLength(0);
    expect(M.frames[1].values).toBe(true);
    expect(M.frames[1].points).toHaveLength(2);
  });
  it('captions carry the outline numbers', () => {
    expect(M.frames[1].caption.ro).toContain('H[2+,4−] = 0,9183 este mai mare decât H[1+,5−] = 0,6500');
    expect(M.frames[1].caption.ro).toContain('p = 1/3 și p = 1/6');
    expect(M.frames[3].caption.ro).toContain('H[4+,4−] = 1 este mai mare decât H[6+,2−] = 0,8113');
    expect(M.frames[3].caption.en).toContain('is greater than');
    expect(M.frames[5].caption.ro).toContain('Maximul este H = 1, la p = 1/2');
    expect(M.frames[5].caption.ro).toContain('H(0) = 0 și H(1) = 0');
    expect(M.frames[7].caption.ro).toContain('H[1+,7−] = 0,5436 și H[7+,1−] = 0,5436: aceeași valoare');
    expect(M.frames[7].caption.ro).toContain('p = 1/8 la p = 7/8');
    expect(M.frames[1].caption.en).toContain('0.9183');
  });
  it('the maximum found on the grid is at p = 1/2 with H = 1', () => {
    expect(M.frames[5].max.p).toBe(0.5);
    expect(M.frames[5].max.H).toBe(1);
    for (let i = 0; i <= 100; i++) expect(curvePoint(i / 100).H).toBeLessThanOrEqual(1 + 1e-12);
  });
  it('equal entropies are called equal, not greater', () => {
    const E = entropyBars({ splits: [[1, 3], [3, 1]] });
    expect(E.frames[1].caption.ro).toContain('egală cu');
    expect(E.frames[1].caption.ro).not.toContain('aproape de 1/2');
  });
  it('rejects bad splits', () => {
    expect(() => entropyBars({ splits: [[1, 2]] })).toThrow();
    expect(() => entropyBars({ splits: [[0, 0], [1, 1]] })).toThrow();
    expect(() => entropyBars({ splits: [[1.5, 2], [1, 1]] })).toThrow();
  });
});

describe('entropy-bars logic, L8 (the ten flats)', () => {
  const { M, frames } = entropyBars(L8);
  it('the outline numbers', () => {
    expect(M.HY).toBe(1);
    expect(r4(M.HX)).toBe(0.971);
    expect(r4(M.hGroup[0])).toBe(0.8113);
    expect(r4(M.hGroup[1])).toBe(0.9183);
    expect(r4(M.HYgX)).toBe(0.8755);
    expect(r4(M.simple)).toBe(0.8648);
    expect(r4(M.IG)).toBe(0.1245);
    expect(r4(M.hYgroup[0])).toBe(0.971);
    expect(r4(M.hYgroup[1])).toBe(0.7219);
    expect(r4(M.HXgY)).toBe(0.8464);
    expect(r4(M.IGx)).toBe(0.1245);
    expect(r4(M.HXY)).toBe(1.8464);
  });
  it('the chain rule and the symmetry hold for the numbers drawn', () => {
    expect(M.HXY).toBeCloseTo(M.HX + M.HYgX, 10);
    expect(M.HXY).toBeCloseTo(M.HY + M.HXgY, 10);
    expect(M.IG).toBeCloseTo(M.IGx, 10);
    expect(M.IG).toBeCloseTo(M.HX + M.HY - M.HXY, 10);
    expect(M.IG).toBeCloseTo(M.HXY - M.HXgY - M.HYgX, 10);
  });
  it('frames: H(Y), H(Y|X) with weights, IG, reverse, Venn ask, Venn', () => {
    expect(frames.map((f) => f.kind)).toEqual(['hy', 'hyx', 'ig', 'rev', 'venn-ask', 'venn']);
  });
  it('captions', () => {
    expect(frames[0].caption.ro).toContain('H(Y) = 1 bit');
    expect(frames[1].caption.ro).toContain('H(Y|X) = 0,4·0,8113 + 0,6·0,9183 = 0,8755');
    expect(frames[1].caption.ro).toContain('nu media simplă 0,8648');
    expect(frames[2].caption.ro).toContain('1 − 0,8755 = 0,1245 biți');
    expect(frames[3].caption.ro).toContain('0,5·0,9710 + 0,5·0,7219 = 0,8464');
    expect(frames[3].caption.ro).toContain('tot 0,1245');
    expect(frames[5].caption.ro).toContain('H(X|Y) = 0,8464');
    expect(frames[5].caption.ro).toContain('IG(X;Y) = 0,1245');
    expect(frames[5].caption.ro).toContain('H(Y|X) = 0,8755');
    expect(frames[5].caption.ro).toContain('H(X,Y) = 1,8464');
    expect(frames[5].caption.en).toContain('1.8464');
  });
  it('the Venn regions printed add up to the union at 4 decimals', () => {
    const v = frames[5].venn;
    expect(r4(v.left) + r4(v.mid) + r4(v.right)).toBeCloseTo(r4(v.union), 10);
  });
  it('equal group sizes: no "plain mean" remark', () => {
    const E = entropyBars({ splits: [[3, 1], [1, 3]], venn: { X: 'A', Y: 'B' } });
    expect(E.frames[1].caption.ro).not.toContain('media simplă');
  });
  it('the Venn ask frame lists the three values still to be placed', () => {
    expect(frames[4].bank.map(r4)).toEqual([0.1245, 0.8755, 0.8464]);
    expect(frames[4].venn.filled).toBe(false);
  });
});

describe('entropy-bars validateViz', () => {
  const block = (props) => ({ type: 'viz', id: 'ml-l07-viz', widget: 'ml-entropy-bars', predict: true, props });
  it('accepts the outline props', () => {
    expect(validateViz(block(L7))).toEqual([]);
    expect(validateViz(block(L8))).toEqual([]);
  });
  it('rejects a missing required prop and bad data', () => {
    expect(validateViz(block({})).join(' ')).toMatch(/splits/);
    expect(validateViz(block({ splits: [[1, 2]] })).join(' ')).toMatch(/at least two/);
    expect(validateViz(block({ splits: [[1, 2], [3, 4]], venn: { X: 'X' } })).join(' ')).toMatch(/venn/);
    expect(validateViz(block({ splits: [[1, 2], ['a', 4]] })).join(' ')).toMatch(/splits/);
  });
});

describe('entropy-bars: the caption matches the drawing (G4)', () => {
  for (const [name, props] of [['L7', L7], ['L8', L8]]) {
    for (const lang of ['ro', 'en']) {
      it(`${name} ${lang}: every cap mark is quoted in its caption`, () => {
        LANG = lang;
        const model = entropyBars(props);
        model.frames.forEach((frame) => {
          const html = renderToStaticMarkup(React.createElement(EntropyStage, { model, frame }));
          const cap = frame.caption[lang];
          for (const m of marks(html).filter((k) => /data-cap="1"/.test(k.tag))) expect(cap, `${name}/${frame.kind}/${m.kind}`).toContain(m.value);
        });
        LANG = 'ro';
      });
    }
  }
  it('the show frame draws the two bars with their H and the two points on the curve', () => {
    LANG = 'ro';
    const model = entropyBars(L7);
    const ms = marks(renderToStaticMarkup(React.createElement(EntropyStage, { model, frame: model.frames[1] })));
    expect(ms.filter((m) => m.kind === 'H').map((m) => m.value)).toEqual(['0,9183', '0,6500']);
    expect(ms.filter((m) => m.kind === 'point').map((m) => [m.value, m.p])).toEqual([['0,9183', '1/3'], ['0,6500', '1/6']]);
  });
  it('the ask frame draws the bars but no value and no point', () => {
    const model = entropyBars(L7);
    const html = renderToStaticMarkup(React.createElement(EntropyStage, { model, frame: model.frames[0] }));
    expect(marks(html).filter((m) => m.kind === 'H' || m.kind === 'point')).toHaveLength(0);
    expect(html).toContain('H = ?');
    expect((html.match(/meb-sq pos/g) || []).length).toBe(3);
  });
  it('the slider frame shows the live readout from the logic', () => {
    const model = entropyBars(L7);
    const html = renderToStaticMarkup(React.createElement(EntropyStage, { model, frame: model.frames[4], live: 50 }));
    expect(marks(html).find((m) => m.kind === 'live').value).toBe('1');
    expect(text(html)).toContain('p = 0,50, H(p) = 1');
    const h20 = renderToStaticMarkup(React.createElement(EntropyStage, { model, frame: model.frames[4], live: 20 }));
    expect(marks(h20).find((m) => m.kind === 'live').value).toBe('0,7219');
  });
  it('the max frame colours the maximum at p = 1/2', () => {
    const model = entropyBars(L7);
    const ms = marks(renderToStaticMarkup(React.createElement(EntropyStage, { model, frame: model.frames[5] })));
    expect(ms.find((m) => m.kind === 'max').value).toBe('1');
  });
  it('the IG frames draw the three bars and the colored gap', () => {
    const model = entropyBars(L8);
    const ms = marks(renderToStaticMarkup(React.createElement(EntropyStage, { model, frame: model.frames[2] })));
    expect(ms.filter((m) => m.kind === 'hbar').map((m) => [m.value])).toEqual([['1'], ['0,8755']]);
    expect(ms.find((m) => m.kind === 'ig').value).toBe('0,1245');
  });
  it('the weights of the groups are drawn in the H(Y|X) frame, in the reverse frame too', () => {
    const model = entropyBars(L8);
    const a = marks(renderToStaticMarkup(React.createElement(EntropyStage, { model, frame: model.frames[1] })));
    expect(a.filter((m) => m.kind === 'grp-w').map((m) => m.value)).toEqual(['0,4', '0,6']);
    expect(a.filter((m) => m.kind === 'grp-h').map((m) => m.value)).toEqual(['0,8113', '0,9183']);
    const b = marks(renderToStaticMarkup(React.createElement(EntropyStage, { model, frame: model.frames[3] })));
    expect(b.filter((m) => m.kind === 'grp-h').map((m) => m.value)).toEqual(['0,9710', '0,7219']);
  });
  it('the Venn ask frame has empty regions and a bank of values; the Venn frame fills them', () => {
    const model = entropyBars(L8);
    const ask = renderToStaticMarkup(React.createElement(EntropyStage, { model, frame: model.frames[4] }));
    expect(marks(ask).filter((m) => m.kind === 'bank').map((m) => m.value)).toEqual(['0,1245', '0,8755', '0,8464']);
    expect(marks(ask).find((m) => m.kind === 'venn-mid').value).toBe('');
    const done = marks(renderToStaticMarkup(React.createElement(EntropyStage, { model, frame: model.frames[5] })));
    expect(['venn-left', 'venn-mid', 'venn-right', 'venn-union'].map((k) => done.find((m) => m.kind === k).value)).toEqual(['0,8464', '0,1245', '0,8755', '1,8464']);
  });
  it('reduced motion renders the end state, no hex or opacity classes', () => {
    const model = entropyBars(L8);
    const html = model.frames.map((frame) => renderToStaticMarkup(React.createElement(EntropyStage, { model, frame }))).join('');
    expect(html).not.toMatch(/opacity:\s*0[;"]/);
    expect(html).not.toMatch(/#[0-9a-f]{3,8}\b|rgb\(|opacity-/i);
  });
});

describe('entropy-bars widget', () => {
  it('first frame without predict: bars, caption, Next', () => {
    LANG = 'ro';
    const html = renderToStaticMarkup(React.createElement(EntropyBars, { props: L7, predict: false }));
    expect(html).toContain('data-widget="ml-entropy-bars"');
    expect(text(html)).toContain('Care bară are entropia mai mare');
    expect(html).toContain('Mai departe');
  });
  it('with predict: only "Arată-mi" until the learner reveals', () => {
    const html = renderToStaticMarkup(React.createElement(EntropyBars, { props: L8, predict: true }));
    expect(html).toContain('Arată-mi');
    expect(html).not.toContain('Mai departe');
    expect(text(html)).toContain('Dacă afli X, cât din nesiguranța asta rămâne?');
  });
  it('a big set draws two segments instead of 100 squares', () => {
    const model = entropyBars({ splits: [[64, 64], [100, 28]] });
    const html = renderToStaticMarkup(React.createElement(EntropyStage, { model, frame: model.frames[0] }));
    expect(html).toContain('meb-seg pos');
    expect(html).not.toContain('meb-sq');
  });
  it('the curve is a scaling SVG', () => {
    const model = entropyBars(L7);
    const html = renderToStaticMarkup(React.createElement(EntropyStage, { model, frame: model.frames[1] }));
    expect(html).toMatch(/<svg[^>]*viewBox="0 0 300 150"/);
    expect(html).not.toMatch(/<svg[^>]*\swidth=/);
  });
});
