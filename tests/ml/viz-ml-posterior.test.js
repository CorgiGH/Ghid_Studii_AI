import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { validateViz, WIDGET_NAMES } from '../../src/components/lesson/viz/vizSpec.js';
import { mlPosterior, posteriorOf } from '../../src/components/lesson/viz/logic/ml/posterior.js';
import { stripFacts } from '../../src/components/lesson/viz/logic/ml/fact-text.js';
import { toNumber } from '../../src/ml/calc/formula.js';

let LANG = 'ro';
vi.mock('../../src/contexts/AppContext', () => ({ useApp: () => ({ t: (en, ro) => (LANG === 'ro' ? ro : en), lang: LANG }) }));
vi.mock('../../src/components/lesson/ScreenGate.jsx', () => ({ useScreenGate: () => ({ complete: () => {}, skip: () => {}, isComplete: false, ref: null }) }));
vi.mock('../../src/lesson/useLessonStore', () => ({ useLessonStore: () => ({}), getLessonStore: () => null }));

const { default: MlPosterior, PosteriorView } = await import('../../src/components/lesson/viz/widgets/ml/MlPosterior.jsx');
const { withSubs } = await import('../../src/components/lesson/viz/widgets/ml/subscript.jsx');

const near = (a, b, tol) => expect(Math.abs(a - b), `${a} vs ${b}`).toBeLessThanOrEqual(tol);
const block = (props, predict = true) => ({ id: 'ml-l19-viz', type: 'viz', widget: 'ml-posterior', predict, props });
// L19's two datasets: the cancer test (ML6:7) and the dice of ex. 2.3, whose likelihoods are exact formulas
const CANCER = { hypotheses: [{ name: 'cancer', prior: 0.008, lik: 0.98 }, { name: '¬cancer', prior: 0.992, lik: 0.03 }] };
const DICE = { hypotheses: [{ name: 'FD', prior: 0.95, lik: '(1/6)^10' }, { name: 'LD', prior: 0.05, lik: '0.1^7*0.5^3' }] };
const THREE = { hypotheses: [{ name: 'a', prior: 0.5, lik: 0.1 }, { name: 'b', prior: 0.3, lik: 0.2 }, { name: 'c', prior: 0.2, lik: 0.3 }] };
const byId = (fr, id) => fr.marks.find((m) => m.id === id).fact;

describe('ml-posterior logic matches the outline', () => {
  it('cancer: products 0.0078 / 0.0298 (slide, exact 0.00784 / 0.02976), P(cancer|+) = 0.2085 = 21%', () => {
    const m = mlPosterior(CANCER);
    const prod = m.frames[3];
    near(toNumber(m.state.prod[0]), 0.0078, 1e-4);
    near(toNumber(m.state.prod[1]), 0.0298, 1e-4);
    expect(byId(prod, 'prod0').canon).toBe('0.00784');
    expect(byId(prod, 'prod1').canon).toBe('0.02976');
    const post = m.frames[4];
    expect(m.state.post[0].toString()).toBe('49/235');
    near(toNumber(m.state.post[0]), 0.21, 0.005);
    expect(byId(post, 'pct0').canon).toBe('21');
    expect(byId(post, 'pct1').canon).toBe('79');
    expect(byId(post, 'pd').canon).toBe('0.0376');
  });
  it('cancer: h_MAP is not cancer, h_ML is cancer, equal priors give 0.49 / 0.015 and flip h_MAP to cancer', () => {
    const m = mlPosterior(CANCER);
    expect(m.state.map).toEqual([1]);
    expect(m.state.ml).toEqual([0]);
    const eq = m.frames[5];
    expect(byId(eq, 'eq0').canon).toBe('0.49');
    expect(byId(eq, 'eq1').canon).toBe('0.015');
    expect(m.state.mapEq).toEqual([0]);
    expect(m.flips).toBe(true);
    expect(eq.bars.map((b) => b.win)).toEqual([true, false]);
  });
  it('dice: products 1.571e-8 and 6.25e-10, P(D) = 1.634e-8, P(FD|D) = 0.9617, P(LD|D) = 0.0383, equal priors 1.654e-8 vs 1.25e-8 and nothing flips', () => {
    const m = mlPosterior(DICE);
    expect(byId(m.frames[3], 'prod0').canon).toBe('1.571e-8');
    expect(byId(m.frames[3], 'prod1').canon).toBe('6.25e-10');
    expect(byId(m.frames[2], 'lik0').canon).toBe('1.654e-8');
    expect(byId(m.frames[2], 'lik1').canon).toBe('1.25e-8');
    expect(byId(m.frames[4], 'pd').canon).toBe('1.634e-8');
    expect(byId(m.frames[4], 'post0').canon).toBe('0.9617');
    expect(byId(m.frames[4], 'post1').canon).toBe('0.0383');
    expect(m.flips).toBe(false);
    expect(m.state.map).toEqual([0]);
    expect(m.state.mapEq).toEqual([0]);
    // equal priors: the likelihoods themselves divided by two
    near(toNumber(m.state.prodEq[0]) * 2, 1.654e-8, 1e-11);
    near(toNumber(m.state.prodEq[1]) * 2, 1.25e-8, 1e-11);
  });
  it('dice: log-odds ln(P(LD|D)/P(FD|D)) = -3.2244 comes out of the same posteriors', () => {
    const { post } = posteriorOf(DICE.hypotheses);
    near(Math.log(toNumber(post[1]) / toNumber(post[0])), -3.2244, 1e-3);
  });
  it('the posteriors sum to 1 exactly, for 2 and 3 hypotheses', () => {
    for (const p of [CANCER, DICE, THREE]) expect(posteriorOf(p.hypotheses).post.reduce((s, x) => s.add(x)).toString()).toBe('1');
  });
  it('a log axis only where the values are tiny (dice likelihood, product, equal), never for probabilities', () => {
    expect(mlPosterior(DICE).frames.map((f) => f.scale.kind)).toEqual(['abs', 'abs', 'log', 'log', 'abs', 'log']);
    expect(mlPosterior(CANCER).frames.map((f) => f.scale.kind)).toEqual(['abs', 'abs', 'rel', 'rel', 'abs', 'rel']);
  });
  it('log bars order like the values and stay inside the axis', () => {
    const fr = mlPosterior(DICE).frames[3];
    expect(fr.bars[0].fraction).toBeGreaterThan(fr.bars[1].fraction);
    for (const b of fr.bars) { expect(b.fraction).toBeGreaterThan(0); expect(b.fraction).toBeLessThanOrEqual(1); }
    // one tick per power of ten, so "each step to the right is ten times more" is something the learner can see
    expect(fr.scale.ticks.map((t) => t.text.ro)).toEqual(['10⁻¹¹', '10⁻¹⁰', '10⁻⁹', '10⁻⁸', '10⁻⁷']);
    LANG = 'ro';
    const html = renderToStaticMarkup(React.createElement(PosteriorView, { frame: fr }));
    const row = /<div class="mlv-axisrow"[^>]*>(.*?)<\/div>/.exec(html)[1];
    expect((row.match(/<span>/g) || []).length).toBe(5);
  });
  it('bar lengths: probabilities are drawn as they are, relative frames scale to the largest', () => {
    const m = mlPosterior(CANCER);
    near(m.frames[1].bars[1].fraction, 0.992, 1e-12);
    near(m.frames[4].bars[0].fraction, 0.2085, 1e-3);
    expect(m.frames[3].bars[1].fraction).toBe(1);
    near(m.frames[3].bars[0].fraction, 0.00784 / 0.02976, 1e-9);
  });
  it('three hypotheses: h_ML is c; the products 0.05, 0.06, 0.06 tie b and c and the caption says so; equal priors give 1/3', () => {
    const m = mlPosterior(THREE);
    expect(m.state.ml).toEqual([2]);
    expect(m.state.map).toEqual([1, 2]);
    expect(m.frames[3].caption.en).toContain('h_MAP = b = c');
    expect(m.frames[3].bars.map((b) => b.win)).toEqual([false, true, true]);
    expect(byId(m.frames[5], 'eqprior').canon).toBe('0.3333');
    expect(m.state.mapEq).toEqual([2]);
  });
  it('rejects priors that do not sum to 1', () => {
    expect(() => mlPosterior({ hypotheses: [{ name: 'a', prior: 0.5, lik: 0.1 }, { name: 'b', prior: 0.4, lik: 0.2 }] })).toThrow(/sum to 1/);
  });
});

describe('ml-posterior captions say what is drawn (G4)', () => {
  for (const [name, props] of [['cancer', CANCER], ['dice', DICE], ['three hypotheses', THREE]]) {
    const model = mlPosterior(props);
    it(`${name}: each caption number is a drawn mark and no other number is typed`, () => {
      for (const fr of model.frames) {
        const marks = new Set(fr.marks.map((m) => m.fact.canon));
        for (const f of fr.facts) expect(marks.has(f.canon), `${fr.id}: ${f.canon} is in the caption but not drawn`).toBe(true);
        for (const lang of ['en', 'ro']) {
          const left = stripFacts(fr.caption[lang], fr.facts).replace(/h_(ML|MAP)/g, '');
          const withoutNames = props.hypotheses.reduce((s, h) => s.split(h.name).join(''), left);
          expect(withoutNames, `${fr.id}/${lang}`).not.toMatch(/\d/);
        }
      }
    });
    it(`${name}: the rendered marks are the frame marks, in both languages`, () => {
      for (const lang of ['en', 'ro']) {
        LANG = lang;
        for (const fr of model.frames) {
          const html = renderToStaticMarkup(React.createElement(PosteriorView, { frame: fr }));
          const got = [...html.matchAll(/data-mark="([^"]+)" data-value="([^"]+)"/g)].map((x) => `${x[1]}=${x[2]}`).sort();
          expect(got).toEqual(fr.marks.map((m) => `${m.id}=${m.fact.canon}`).sort());
        }
      }
      LANG = 'ro';
    });
  }
  it('every frame shows the given priors and likelihoods, so the first question has its data on screen', () => {
    for (const props of [CANCER, DICE]) {
      const m = mlPosterior(props);
      for (const fr of m.frames) {
        const given = fr.marks.filter((x) => /^g[pl]\d$/.test(x.id)).map((x) => `${x.id}=${x.fact.canon}`);
        // the equal-priors frame puts 1/2 in the prior column, the prior its bars use
        const pri = fr.id === 'equal' ? ['0.5', '0.5'] : props === CANCER ? ['0.008', '0.992'] : ['0.95', '0.05'];
        const lik = props === CANCER ? ['0.98', '0.03'] : ['1.654e-8', '1.25e-8'];
        expect(given).toEqual([`gp0=${pri[0]}`, `gl0=${lik[0]}`, `gp1=${pri[1]}`, `gl1=${lik[1]}`]);
        LANG = 'ro';
        const html = renderToStaticMarkup(React.createElement(PosteriorView, { frame: fr }));
        expect(html).toContain('<th>P(h)</th>');
        expect(html).toMatch(new RegExp(`data-mark="gp0" data-value="${pri[0]}"`));
        expect(html.includes('mlv-changed')).toBe(fr.id === 'equal');
      }
    }
  });
  it('the question frames do not leak the next result', () => {
    const m = mlPosterior(CANCER);
    expect(m.frames[0].marks.map((x) => x.id)).toEqual(['gp0', 'gl0', 'gp1', 'gl1']);
    expect(m.frames[0].bars.every((b) => b.fact === null)).toBe(true);
    for (const h of m.frames[0].hidden) expect(m.frames[0].caption.ro).not.toContain(h.text.ro);
    expect(m.frames[0].caption.ro).toContain('tabel');
    // the prior frame ends with the likelihood question and shows no likelihood
    expect(m.frames[1].caption.ro).not.toContain('0,98');
    // the likelihood frame asks about h_MAP without the products
    expect(m.frames[2].caption.ro).not.toContain('0,00784');
    // the product frame asks for the posteriors without them
    expect(m.frames[3].caption.ro).not.toContain('0,2085');
  });
  it('the caption names the winner the bars highlight', () => {
    for (const props of [CANCER, DICE]) {
      const m = mlPosterior(props);
      for (const fr of m.frames.slice(2)) {
        const win = fr.bars.filter((b) => b.win).map((b) => b.name).join(' = ');
        const html = renderToStaticMarkup(React.createElement(PosteriorView, { frame: fr }));
        expect(html.match(/mlv-bar win/g)?.length).toBe(fr.bars.filter((b) => b.win).length);
        if (fr.id === 'product') expect(fr.caption.en).toContain(`h_MAP = ${win}`);
        if (fr.id === 'equal') expect(fr.caption.en).toContain(`h_MAP = ${win}`);
      }
    }
  });
  it('Romanian uses the decimal comma and English the point', () => {
    const m = mlPosterior(CANCER);
    expect(m.frames[4].caption.ro).toContain('0,2085 (21%)');
    expect(m.frames[4].caption.en).toContain('0.2085 (21%)');
    expect(mlPosterior(DICE).frames[3].caption.ro).toContain('1,571·10⁻⁸');
  });
});

describe('ml-posterior block', () => {
  it('validateViz accepts the outline props and rejects bad ones', () => {
    expect(WIDGET_NAMES).toContain('ml-posterior');
    expect(validateViz(block(CANCER))).toEqual([]);
    expect(validateViz(block(DICE))).toEqual([]);
    expect(validateViz(block(THREE))).toEqual([]);
    expect(validateViz(block({}))).toContain('viz (ml-posterior): props.hypotheses missing or invalid');
    expect(validateViz(block({ hypotheses: [{ name: 'a', prior: 1, lik: 0.5 }] })).length).toBe(1);
    expect(validateViz(block({ hypotheses: [{ name: 'a', prior: 0.5, lik: 0.5 }, { name: 'b', prior: 0.4, lik: 0.5 }] })).length).toBe(1);
    expect(validateViz(block({ hypotheses: [{ name: 'a', prior: 0.5, lik: 0.5 }, { name: 'a', prior: 0.5, lik: 0.5 }] })).length).toBe(1);
    expect(validateViz(block({ hypotheses: [{ name: 'a', prior: 0.5 }, { name: 'b', prior: 0.5, lik: 0.5 }] })).length).toBe(1);
  });
  it('first frame with predict: the question, the given table, empty bars, Show me, no Next', () => {
    const html = renderToStaticMarkup(React.createElement(MlPosterior, { props: CANCER, predict: true }));
    expect(html).toContain('Arată-mi');
    expect(html).not.toContain('Mai departe');
    expect(html).not.toMatch(/data-mark="(prior|lik|prod|post|eq|pct)\d/);
    expect(html).toContain('data-mark="gp0" data-value="0.008"');
    expect(html).toContain('data-mark="gl1" data-value="0.03"');
    expect(html).toContain('width:0.0%');
  });
  it('validateViz runs the logic: a formula that is not one, or priors that do not sum to 1, is reported', () => {
    expect(validateViz(block({ hypotheses: [{ name: 'a', prior: 'half', lik: 0.5 }, { name: 'b', prior: 0.5, lik: 0.5 }] })).length).toBe(1);
    expect(validateViz(block({ hypotheses: [{ name: 'a', prior: '1/3', lik: 0.5 }, { name: 'b', prior: '1/3', lik: 0.5 }] })).join(' ')).toMatch(/sum to 1/);
    expect(validateViz(block({ hypotheses: [{ name: 'a', prior: 0.5, lik: '3/2' }, { name: 'b', prior: 0.5, lik: 0.5 }] })).join(' ')).toMatch(/between 0 and 1/);
    expect(validateViz(block(DICE))).toEqual([]);
  });
  it('h_MAP and h_ML are drawn with a real subscript, never as h_MAP', () => {
    expect(renderToStaticMarkup(React.createElement('p', null, withSubs('so h_MAP = cancer, not h_ML; P_NB(Y=0)')))).toBe('<p>so h<sub>MAP</sub> = cancer, not h<sub>ML</sub>; P<sub>NB</sub>(Y=0)</p>');
    expect(withSubs('no notation here')).toBe('no notation here');
    const m = mlPosterior(CANCER);
    const html = renderToStaticMarkup(React.createElement(PosteriorView, { frame: m.frames[3] }));
    expect(html).toContain('h<sub>MAP</sub>');
    expect(html).not.toContain('h_MAP');
  });
  it('without predict, Next is there at the first frame', () => {
    expect(renderToStaticMarkup(React.createElement(MlPosterior, { props: CANCER, predict: false }))).toContain('Mai departe');
  });
  it('the end state (equal priors) shows the flipped winner and no colour literals', () => {
    const m = mlPosterior(CANCER);
    const html = renderToStaticMarkup(React.createElement(PosteriorView, { frame: m.frames.at(-1) }));
    expect(html).toContain('data-value="0.49"');
    expect(html).toContain('h<sub>MAP</sub>');
    expect(html).not.toMatch(/#[0-9a-f]{3,8}\b|rgb\(|hsl\(|opacity-/i);
  });
});

describe('ml-posterior second review', () => {
  it('a sentence never starts with a lower-case hypothesis name: the likelihood frame names h_ML after a lead-in', () => {
    const lik = mlPosterior(CANCER).frames[2];
    expect(lik.caption.en).toContain('The data are explained better by the hypothesis cancer: it is h_ML.');
    expect(lik.caption.ro).toContain('Datele sunt explicate mai bine de ipoteza cancer: ea este h_ML.');
    expect(lik.caption.en).not.toMatch(/\. cancer explains/);
  });
  it('the h_MAP / h_ML badge reads at AA contrast: content-coloured text on the tinted fill', async () => {
    const fs = await import('node:fs');
    const css = fs.readFileSync('src/components/lesson/viz/widgets/ml/ml-widgets.css', 'utf8');
    expect(css).toMatch(/\.mlv-badge \{[^}]*color: var\(--theme-content-text\)/);
  });
  it('the charts stop growing on a laptop so the caption and the buttons stay in view', async () => {
    const fs = await import('node:fs');
    const css = fs.readFileSync('src/components/lesson/viz/widgets/ml/ml-widgets.css', 'utf8');
    expect(css).toMatch(/\.mlv-chart \{[^}]*max-height: 300px/);
  });
});
