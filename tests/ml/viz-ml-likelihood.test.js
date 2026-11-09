import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { validateViz, WIDGET_NAMES } from '../../src/components/lesson/viz/vizSpec.js';
import { mlLikelihood, likelihood, logLikelihood, area, argmax, formula } from '../../src/components/lesson/viz/logic/ml/likelihood.js';
import { stripFacts } from '../../src/components/lesson/viz/logic/ml/fact-text.js';
import { toNumber } from '../../src/ml/calc/formula.js';

let LANG = 'ro';
vi.mock('../../src/contexts/AppContext', () => ({ useApp: () => ({ t: (en, ro) => (LANG === 'ro' ? ro : en), lang: LANG }) }));
vi.mock('../../src/components/lesson/ScreenGate.jsx', () => ({ useScreenGate: () => ({ complete: () => {}, skip: () => {}, isComplete: false, ref: null }) }));
vi.mock('../../src/lesson/useLessonStore', () => ({ useLessonStore: () => ({}), getLessonStore: () => null }));

const { default: MlLikelihood, LikelihoodView } = await import('../../src/components/lesson/viz/widgets/ml/MlLikelihood.jsx');

const num = toNumber;
const near = (a, b, tol) => expect(Math.abs(a - b), `${a} vs ${b}`).toBeLessThanOrEqual(tol);
const block = (props, predict = true) => ({ id: 'ml-l18-viz', type: 'viz', widget: 'ml-likelihood', predict, props });
// L18's own data: the opening coin 1, 0, 1, 1, 1 (4 heads of 5), then the four datasets of ex. 0.43.b and d
const OPEN = { heads: 4, n: 5 };
const PROPS = { data: [OPEN, { heads: 6, n: 10 }, { heads: 3, n: 5 }, { heads: 60, n: 100 }, { heads: 5, n: 10 }], grid: [0.5, 0.8, 1] };
const ONE = { data: OPEN, grid: [0.5, 0.8, 1] };

describe('ml-likelihood logic matches the outline', () => {
  it('opening coin: L(0.5) = 1/32, L(0.8) = 0.08192, L(1) = 0, maximum at 0.8 = 4/5', () => {
    expect(likelihood(0.5, 4, 5).toString()).toBe('1/32');
    near(num(likelihood(0.5, 4, 5)), 0.03125, 1e-12);
    near(num(likelihood(0.8, 4, 5)), 0.08192, 1e-12);
    expect(num(likelihood(1, 4, 5))).toBe(0);
    expect(argmax(4, 5).toString()).toBe('4/5');
    const v = mlLikelihood(ONE).frames[1];
    expect(v.marks.filter((m) => /^L\d$/.test(m.id)).map((m) => m.fact.canon)).toEqual(['0.03125', '0.08192', '0']);
    expect(v.marks.find((m) => m.id === 'argmax').fact.canon).toBe('0.8');
  });
  it('the formula is theta^4 (1-theta) for 4 heads and 1 tail', () => {
    expect(formula(4, 1)).toBe('θ⁴(1−θ)');
    expect(formula(0, 3)).toBe('(1−θ)³');
    expect(formula(1, 0)).toBe('θ');
  });
  it('ln L: the maximum stays at 0.8; l(0.5) = 5 ln 0.5, l(1) is minus infinity', () => {
    near(logLikelihood(0.5, 4, 5), 5 * Math.log(0.5), 1e-12);
    near(logLikelihood(0.8, 4, 5), 4 * Math.log(0.8) + Math.log(0.2), 1e-12);
    expect(logLikelihood(1, 4, 5)).toBe(-Infinity);
    const f = mlLikelihood(ONE).frames[2];
    expect(f.moved).toBe(false);
    expect(f.marks.find((m) => m.id === 'argmax').fact.canon).toBe('0.8');
    expect(f.marks.find((m) => m.id === 'l2').fact.canon).toBe('-inf');
    expect(f.marks.find((m) => m.id === 'l2').fact.text.ro).toBe('−∞');
  });
  it('the area under L is 1/30 for the opening coin and the trapezoid sum agrees', () => {
    expect(area(4, 5).toString()).toBe('1/30');
    const f = mlLikelihood(ONE).frames[3];
    expect(f.marks.find((m) => m.id === 'area').fact.canon).toBe('1/30');
    near(f.trapezoid, 1 / 30, 2e-5);
    expect(f.marks.find((m) => m.id === 'one').fact.canon).toBe('1');
  });
  it('ex. 0.43.b, d, e: maxima 0.6, 0.6, 0.6, 0.5 and the values at the maximum', () => {
    const m = mlLikelihood(PROPS);
    const curve = m.frames.filter((f) => f.id.startsWith('curve-'));
    expect(curve.map((f) => f.marks.find((x) => x.id === 'argmax').fact.canon)).toEqual(['0.6', '0.6', '0.6', '0.5']);
    const lmax = curve.map((f) => num(f.axis.top.value));
    near(lmax[0], 0.001194, 1e-6);
    near(lmax[1], 0.03456, 1e-5);
    near(lmax[3], 0.000977, 1e-6);
    expect(lmax[2] / 5.9e-30).toBeGreaterThan(0.99);
    expect(lmax[2] / 5.9e-30).toBeLessThan(1.01);
    expect(curve[2].axis.top.text.ro).toBe('5,908·10⁻³⁰');
  });
  it('the drawn peak is the maximum of the sampled curve for every dataset', () => {
    for (const f of mlLikelihood(PROPS).frames.filter((x) => x.curve)) {
      const top = f.curve.reduce((b, p) => (p.L > b.L ? p : b));
      near(top.theta, f.peak, 0.005);
      near(top.y, 1, 1e-9);
    }
  });
  it('frame order: ask, values, ln, area, then an ask and a curve per other dataset', () => {
    expect(mlLikelihood(ONE).frames.map((f) => f.id)).toEqual(['ask', 'values', 'ln', 'area']);
    expect(mlLikelihood(PROPS).frames.map((f) => f.id)).toEqual(['ask', 'values', 'ln', 'area', 'ask-1', 'curve-1', 'ask-2', 'curve-2', 'ask-3', 'curve-3', 'ask-4', 'curve-4']);
  });
});

describe('ml-likelihood captions say what is drawn (G4)', () => {
  for (const [name, props] of [['one dataset', ONE], ['five datasets', PROPS], ['all heads', { data: { heads: 5, n: 5 }, grid: [0, 0.5, 1] }], ['no heads', { data: { heads: 0, n: 3 }, grid: [0, 0.4] }]]) {
    const model = mlLikelihood(props);
    it(`${name}: each caption number is a drawn mark and nothing else is a number`, () => {
      for (const fr of model.frames) {
        const marks = new Set(fr.marks.map((m) => m.fact.canon));
        for (const f of fr.facts) expect(marks.has(f.canon), `${fr.id}: ${f.canon} is in the caption but not drawn`).toBe(true);
        for (const lang of ['en', 'ro']) expect(stripFacts(fr.caption[lang], fr.facts), `${fr.id}/${lang}`).not.toMatch(/\d/);
      }
    });
    it(`${name}: the view carries exactly the frame marks in both languages`, () => {
      for (const lang of ['en', 'ro']) {
        LANG = lang;
        for (const fr of model.frames) {
          const html = renderToStaticMarkup(React.createElement(LikelihoodView, { model, frame: fr }));
          const vals = [...html.matchAll(/<li data-mark="([^"]+)" data-value="([^"]+)"/g)].map((x) => [x[1], x[2]]);
          expect(vals).toEqual(fr.marks.map((m) => [m.id, m.fact.canon]));
          expect((html.match(/data-theta=/g) || []).length).toBe(fr.points.length);
        }
      }
      LANG = 'ro';
    });
  }
  it('the question frames hide the answer: no maximum and no L value in the caption', () => {
    for (const fr of mlLikelihood(PROPS).frames.filter((f) => f.id.startsWith('ask'))) {
      expect(fr.marks.every((m) => !['argmax', 'Lmax'].includes(m.id) && !/^L\d$/.test(m.id))).toBe(true);
      for (const h of fr.hidden) {
        if (['0', '1'].includes(h.canon) || fr.facts.some((f) => f.canon === h.canon)) continue; // a count or a candidate the question itself states
        expect(fr.caption.en).not.toContain(h.text.en);
        expect(fr.caption.ro).not.toContain(h.text.ro);
      }
      expect(fr.curve).toBeUndefined();
    }
  });
  it('Romanian says 1 ban, 4 steme, 60 de steme and uses the decimal comma; the plural of English follows the count', () => {
    const ro = mlLikelihood(PROPS).frames;
    expect(ro[0].caption.ro).toContain('5 aruncări au dat 4 steme și 1 ban');
    expect(ro[0].caption.en).toContain('5 tosses gave 4 heads and 1 tail.');
    expect(ro[8].caption.ro).toContain('Alte date: 100 de aruncări, 60 de steme și 40 de bani');
    expect(ro[1].caption.ro).toContain('L(0,5) = 0,03125');
    expect(ro[1].caption.en).toContain('L(0.5) = 0.03125');
  });
  it('Romanian separates the candidate decimals with semicolons (0,5; 0,8; 1), English with commas', () => {
    const f = mlLikelihood(ONE).frames[0];
    expect(f.caption.ro).toContain('cele mai probabile: 0,5; 0,8; 1?');
    expect(f.caption.en).toContain('most probable: 0.5, 0.8, 1?');
  });
  it('the ln curve is drawn only where it is on the axis: no flat run along the floor', () => {
    const model = mlLikelihood(ONE);
    const html = renderToStaticMarkup(React.createElement(LikelihoodView, { model, frame: model.frames[2] }));
    const pts = /data-curve="l" points="([^"]+)"/.exec(html)[1].split(' ').map((s) => s.split(',').map(Number));
    const floor = 200 - 32; // Y(0) of the chart
    expect(pts.length).toBeGreaterThan(50);
    const atFloor = pts.map(([, y]) => y >= floor - 1e-9);
    // the curve goes down to the floor at both ends (ln L runs to minus infinity), with no two floor points in a row
    expect(atFloor[0]).toBe(true);
    expect(atFloor.at(-1)).toBe(true);
    expect(atFloor.slice(1, -1).some(Boolean)).toBe(false);
    // the drawn part runs between the two places where ln L meets the floor, around the maximum; the right end is theta = 1
    expect(pts[0][0]).toBeGreaterThan(64);
    expect(pts.at(-1)[0]).toBe(320 - 14);
  });
  it('the ln frame says the peak did not move only because it did not', () => {
    expect(mlLikelihood(ONE).frames[2].caption.en).toContain('The peak did not move');
    expect(mlLikelihood(ONE).frames[2].caption.en).not.toContain('The peak moved');
  });
});

describe('ml-likelihood block', () => {
  it('validateViz accepts the outline props and rejects bad ones', () => {
    expect(WIDGET_NAMES).toContain('ml-likelihood');
    expect(validateViz(block(ONE))).toEqual([]);
    expect(validateViz(block(PROPS))).toEqual([]);
    expect(validateViz(block({ grid: [0.5] }))).toContain('viz (ml-likelihood): props.data missing or invalid');
    expect(validateViz(block({ data: OPEN }))).toContain('viz (ml-likelihood): props.grid missing or invalid');
    expect(validateViz(block({ data: { heads: 6, n: 5 }, grid: [0.5] })).length).toBe(1);
    expect(validateViz(block({ data: OPEN, grid: [0.5, 1.5] })).length).toBe(1);
    expect(validateViz(block({ data: [], grid: [0.5] })).length).toBe(1);
  });
  it('first frame with predict: the question is a pick of its own, Next is locked, no curve and no L value', () => {
    const html = renderToStaticMarkup(React.createElement(MlLikelihood, { props: ONE, predict: true }));
    expect(html).toContain('mlv-picks');
    expect(html).not.toContain('Arată-mi');
    expect(html).toMatch(/viz-btn-primary" disabled/);
    expect(html).not.toContain('data-curve');
    expect(html).not.toContain('0,08192');
    expect(html).toContain('4 steme');
  });
  it('without predict Next is there at the first frame', () => {
    const html = renderToStaticMarkup(React.createElement(MlLikelihood, { props: ONE, predict: false }));
    expect(html).toContain('Mai departe');
  });
  it('the end state draws the last dataset curve with its rescaled top and no colour literals', () => {
    const model = mlLikelihood(PROPS);
    const last = model.frames.at(-1);
    const html = renderToStaticMarkup(React.createElement(LikelihoodView, { model, frame: last }));
    expect(html).toContain('data-curve="L"');
    expect(html).toContain('0,0009766');
    expect(html).toContain('data-value="0.5"');
    expect(html).not.toMatch(/#[0-9a-f]{3,8}\b|rgb\(|hsl\(|opacity-/i);
  });
});

describe('ml-likelihood own picks and the Beta prior', () => {
  const COIN = { data: [{ heads: 7, n: 10 }, { heads: 70, n: 100 }], grid: [0.3, 0.5, 0.7, 0.9], prior: { a: 2, b: 2 } };
  it('the prior prop is optional and must be whole numbers from 1', () => {
    expect(validateViz(block(COIN))).toEqual([]);
    expect(validateViz(block({ ...COIN, prior: { a: 0, b: 2 } })).length).toBe(1);
    expect(validateViz(block({ ...COIN, prior: { a: 2.5, b: 2 } })).length).toBe(1);
    expect(validateViz(block({ data: COIN.data, grid: COIN.grid }))).toEqual([]);
  });
  it('frame order: the four main frames, the second dataset, then the prior question and the prior curves', () => {
    expect(mlLikelihood(COIN).frames.map((f) => f.id)).toEqual(['ask', 'values', 'ln', 'area', 'ask-1', 'curve-1', 'prior-ask', 'prior']);
  });
  it('the peak pick: 0.7 for 7 heads in 10 tosses, among 0.3, 0.5, 0.7, 0.9, in both languages', () => {
    const f = mlLikelihood(COIN).frames[0];
    expect(f.pick.right).toBe('0.7');
    expect(f.pick.options.map((o) => o.id)).toEqual(['0.3', '0.5', '0.7', '0.9']);
    expect(f.pick.options.find((o) => o.id === '0.7').label).toEqual({ en: '0.7', ro: '0,7' });
  });
  it('the second dataset pick is 0.7 too (70 of 100) and does not give the answer in the caption', () => {
    const f = mlLikelihood(COIN).frames.find((x) => x.id === 'ask-1');
    expect(f.pick.right).toBe('0.7');
    expect(f.pick.options.length).toBeGreaterThanOrEqual(3);
  });
  it('the prior pick and marks: MLE 7/10, MAP (7 + 1) / (10 + 1 + 1) = 2/3, from the exact arithmetic', () => {
    const fr = mlLikelihood(COIN).frames;
    const ask = fr.find((f) => f.id === 'prior-ask');
    expect(ask.pick.right).toBe('0.6667');
    const pr = fr.find((f) => f.id === 'prior');
    expect(pr.marks.find((m) => m.id === 'mle').fact.canon).toBe('0.7');
    expect(pr.marks.find((m) => m.id === 'map').fact.canon).toBe('0.6667');
    near(pr.peak2, 2 / 3, 1e-12);
    // the dashed curve is L·p: its highest point sits at the MAP value
    const top = pr.curve2.reduce((b, p) => (p.y > b.y ? p : b));
    near(top.theta, 2 / 3, 0.005);
    const topL = pr.curve.reduce((b, p) => (p.y > b.y ? p : b));
    near(topL.theta, 0.7, 0.005);
  });
  it('the prior frame draws two curves and both markers; its caption quotes only facts', () => {
    const model = mlLikelihood(COIN);
    const f = model.frames.find((x) => x.id === 'prior');
    const html = renderToStaticMarkup(React.createElement(LikelihoodView, { model, frame: f }));
    expect(html).toContain('data-curve="L"');
    expect(html).toContain('data-curve="posterior"');
    expect(html).toContain('data-mark-at="map"');
    for (const lang of ['en', 'ro']) expect(stripFacts(f.caption[lang], f.facts)).not.toMatch(/\d(?!\))/);
  });
  it('every picked frame offers different options and a why in both languages', () => {
    for (const f of mlLikelihood(COIN).frames.filter((x) => x.pick)) {
      const ids = f.pick.options.map((o) => o.id);
      expect(new Set(ids).size).toBe(ids.length);
      expect(ids).toContain(f.pick.right);
      expect(f.pick.why.en.length).toBeGreaterThan(0);
      expect(f.pick.why.ro.length).toBeGreaterThan(0);
    }
  });
});

// crash-p1 s40: 7 ones in 10, the grid 0.3 / 0.5 / 0.7 / 0.9, the prior Beta(2, 2)
describe('ml-likelihood reasons, notation and Romanian (crash-p1 s40)', () => {
  const COIN = { data: [{ heads: 7, n: 10 }, { heads: 70, n: 100 }], grid: [0.3, 0.5, 0.7, 0.9], prior: { a: 2, b: 2 } };
  const fr = mlLikelihood(COIN).frames;
  it('a wrong theta gets the reason of that option: the share of tails, the fair coin, too high', () => {
    const w = fr[0].pick.whys;
    expect(Object.keys(w).sort()).toEqual(['0.3', '0.5', '0.9']);
    expect(w['0.3'].ro).toBe('0,3 este ponderea banilor (3 bani din 10); θ este probabilitatea stemei.');
    expect(w['0.5'].ro).toContain('ar fi o monedă corectă');
    expect(w['0.9'].ro).toContain('Prea mare');
  });
  it('the two questions that end the values and ln captions are picks: the peak stays under ln, the area is less than 1', () => {
    const v = fr.find((f) => f.id === 'values').pick;
    expect(v.right).toBe('no');
    expect(v.options.find((o) => o.id === 'no').label.ro).toBe('nu, rămâne la θ = 0,7');
    expect(v.whys.yes.ro).toContain('nu ordinea lor');
    const a = fr.find((f) => f.id === 'ln').pick;
    expect(a.right).toBe('less');
    expect(Object.keys(a.whys).sort()).toEqual(['more', 'one']);
    expect(a.why.ro).toBe('L nu trece de 0,002224, iar θ parcurge un interval de lungime 1, deci aria e cel mult 0,002224.');
    // the area itself is shown only on the next frame
    expect(fr.find((f) => f.id === 'ln').caption.ro).not.toContain('1320');
  });
  it('the prior question: MLE, the prior peak and the rest have their own reasons', () => {
    const p = fr.find((f) => f.id === 'prior-ask').pick;
    expect(p.whys['0.7'].ro).toContain('θ̂_MLE');
    expect(p.whys['0.5'].ro).toContain('vârful priorului singur');
    for (const o of p.options.filter((x) => x.id !== p.right)) expect(p.whys[o.id]).toBeDefined();
  });
  it('Beta(2, 2) adds "încă o stemă și un ban", with no "1 steme"', () => {
    const c = fr.find((f) => f.id === 'prior-ask').caption.ro;
    expect(c).toContain('încă o stemă și un ban');
    expect(c).not.toMatch(/1 steme|1 bani/);
    expect(mlLikelihood({ ...COIN, prior: { a: 3, b: 2 } }).frames.find((f) => f.id === 'prior-ask').caption.ro).toContain('încă 2 steme și un ban');
  });
  it('the estimators are θ̂_MLE and θ̂_MAP, drawn with a real subscript', async () => {
    const { withSubs } = await import('../../src/components/lesson/viz/widgets/ml/subscript.jsx');
    const pr = fr.find((f) => f.id === 'prior');
    expect(pr.caption.ro).toContain('θ̂_MLE');
    expect(pr.marks.map((m) => m.label.ro)).toEqual(['θ̂_MLE', 'θ̂_MAP']);
    expect(renderToStaticMarkup(React.createElement('p', null, withSubs('vârful la θ̂_MAP = 0,6667')))).toBe('<p>vârful la θ̂<sub>MAP</sub> = 0,6667</p>');
  });
});
