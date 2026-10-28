import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { marks, text } from './w2-viz-helpers.js';
import { validateViz } from '../../src/components/lesson/viz/vizSpec.js';
import { pmfCdf, distribution } from '../../src/components/lesson/viz/logic/ml/pmf-cdf.js';
import { initialStepper, stepperReducer } from '../../src/components/lesson/viz/logic/stepper.js';
import Fraction from '../../src/ml/calc/fraction.js';

let LANG = 'ro';
let REDUCED = true;
vi.mock('../../src/lesson/useLessonStore', async () => {
  const { createLessonStore } = await import('../../src/lesson/store.js');
  const m = new Map();
  const store = createLessonStore({ getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { m.set(k, String(v)); } });
  return { useLessonStore: () => store, getLessonStore: () => store };
});
vi.mock('../../src/contexts/AppContext', () => ({ useApp: () => ({ t: (en, ro) => (LANG === 'ro' ? ro : en), lang: LANG }) }));
vi.mock('motion/react', async (orig) => ({ ...(await orig()), useReducedMotion: () => REDUCED }));

const { default: PmfCdf, PmfCdfStage } = await import('../../src/components/lesson/viz/widgets/ml/PmfCdf.jsx');

// The outline's L4 visual spec: configuration 1 (X on -1..2) and configuration 2 (R, three coins).
const PROPS = {
  name: 'X', values: [-1, 0, 1, 2], probs: ['1/6', '1/6', '1/6', '1/2'], format: 'fraction',
  second: { name: 'R', values: [0, 1, 2, 3], probs: ['1/8', '3/8', '3/8', '1/8'] },
};
const fr = (s) => new Fraction(s);

describe('pmf-cdf logic: the outline numbers', () => {
  const M = pmfCdf(PROPS);
  it('configuration 1: E = 1, deviations -2 -1 0 1, squares 4 1 0 1, Var = 4/3, sigma about 1.15', () => {
    expect(M.main.mean.equals(1)).toBe(true);
    expect(M.main.dev.map(String)).toEqual(['-2', '-1', '0', '1']);
    expect(M.main.sq.map(String)).toEqual(['4', '1', '0', '1']);
    expect(M.main.variance.equals(fr('4/3'))).toBe(true);
    expect(M.main.ex2.equals(fr('7/3'))).toBe(true);
    expect(M.main.sd).toBeCloseTo(1.1547, 4);
    expect(M.main.cdf.map(String)).toEqual(['1/6', '1/3', '1/2', '1']);
  });
  it('configuration 2: E[R] = 3/2, which R never takes', () => {
    expect(M.second.mean.equals(fr('3/2'))).toBe(true);
    expect(M.second.meanIsValue).toBe(false);
    expect(M.main.meanIsValue).toBe(true);
  });
  it('the c.d.f. frame highlights F(1) = 1/2', () => {
    const f = M.frames.at(-1);
    expect(f.kind).toBe('cdf');
    expect(M.main.xs[f.cdfAt].equals(1)).toBe(true);
    expect(M.main.cdf[f.cdfAt].equals(fr('1/2'))).toBe(true);
  });
  it('has setup, mean, variance, second, c.d.f. frames in that order', () => {
    expect(M.frames.map((f) => f.kind)).toEqual(['setup', 'mean', 'variance', 'second', 'cdf']);
    expect(M.count).toBe(5);
  });
  it('rejects probabilities that do not sum to 1', () => {
    expect(() => distribution([0, 1], ['1/2', '1/3'])).toThrow(/sum to 1/);
    expect(() => distribution([0, 1], ['1/2'])).toThrow();
  });
  it('captions carry the outline numbers in Romanian and English', () => {
    const [setup, mean, variance, second, cdf] = M.frames;
    expect(setup.caption.ro).toContain('−1, 0, 1, 2');
    expect(setup.caption.ro).toContain('1/6, 1/6, 1/6, 1/2');
    expect(mean.caption.ro).toBe('E[X] = (−1)·1/6 + 0·1/6 + 1·1/6 + 2·1/2 = 1. Triunghiul marchează punctul de echilibru al barelor.');
    expect(variance.caption.ro).toContain('−2, −1, 0, 1');
    expect(variance.caption.ro).toContain('4, 1, 0, 1');
    expect(variance.caption.ro).toContain('= 4/3');
    expect(variance.caption.ro).toContain('σ = √(4/3) ≈ 1,15');
    expect(variance.caption.en).toContain('≈ 1.15');
    expect(second.caption.ro).toContain('E[R] = 0·1/8 + 1·3/8 + 2·3/8 + 3·1/8 = 3/2');
    expect(second.caption.ro).toContain('nu ia niciodată valoarea 3/2');
    expect(cdf.caption.ro).toContain('F(1) = 1/6 + 1/6 + 1/6 = 1/2');
    expect(cdf.caption.en).toContain('F(1) = 1/6 + 1/6 + 1/6 = 1/2');
  });
  it('a decimal data set prints decimals with the language separator', () => {
    const D = pmfCdf({ values: [0, 1], probs: [0.25, 0.75] });
    expect(D.mode).toBe('decimal');
    expect(D.frames[1].caption.ro).toContain('= 0,75');
    expect(D.frames[1].caption.en).toContain('= 0.75');
  });
  it('says so when the mean is a value of the variable', () => {
    const D = pmfCdf({ values: [0, 1], probs: ['1/2', '1/2'], second: { values: [0, 1, 2], probs: ['1/4', '1/2', '1/4'] } });
    expect(D.frames.find((f) => f.kind === 'second').caption.ro).toContain('chiar ia valoarea 1');
  });
});

describe('pmf-cdf validateViz', () => {
  const block = { type: 'viz', id: 'ml-l04-viz', widget: 'ml-pmf-cdf', predict: true, props: PROPS };
  it('accepts the outline props', () => { expect(validateViz(block)).toEqual([]); });
  it('rejects a missing required prop and a bad distribution', () => {
    expect(validateViz({ ...block, props: { values: [1, 2] } }).join(' ')).toMatch(/probs/);
    expect(validateViz({ ...block, props: { probs: ['1/2', '1/2'] } }).join(' ')).toMatch(/values/);
    expect(validateViz({ ...block, props: { values: [1, 2], probs: ['1/2', '1/3'] } }).join(' ')).toMatch(/sum to 1/);
    expect(validateViz({ ...block, props: { ...PROPS, second: { values: [1] } } }).join(' ')).toMatch(/second/);
  });
});

describe('pmf-cdf stage: the caption matches the drawing (G4)', () => {
  const M = pmfCdf(PROPS);
  for (const lang of ['ro', 'en']) {
    it(`every frame, ${lang}: marks named in the caption carry the same text`, () => {
      LANG = lang;
      M.frames.forEach((frame) => {
        const html = renderToStaticMarkup(React.createElement(PmfCdfStage, { model: M, frame }));
        const ms = marks(html);
        const cap = frame.caption[lang];
        const D = frame.view === 'second' ? M.second : M.main;
        // bars: one per value, with the right height value
        if (!frame.cdf) {
          const bars = ms.filter((m) => m.kind === 'bar');
          expect(bars).toHaveLength(D.xs.length);
          bars.forEach((b) => expect(cap).toContain(b.value)); // setup/second list the probabilities; mean frames list p in the terms
        }
        for (const m of ms.filter((k) => ['mean', 'variance', 'sd', 'cdf-at'].includes(k.kind))) expect(cap).toContain(m.value);
        if (frame.show.mean) expect(ms.find((k) => k.kind === 'mean').value).toBe(frame.view === 'second' ? (lang === 'ro' ? '3/2' : '3/2') : '1');
        if (frame.show.dev) {
          expect(ms.filter((k) => k.kind === 'dev').map((k) => k.value)).toEqual(['−2', '−1', '0', '1']);
          expect(ms.filter((k) => k.kind === 'sq').map((k) => k.value)).toEqual(['4', '1', '0', '1']);
          expect(ms.find((k) => k.kind === 'variance').value).toBe('4/3');
        }
        if (frame.cdf) {
          expect(ms.filter((k) => k.kind === 'cdf' || k.kind === 'cdf-at').map((k) => k.value)).toEqual(['1/6', '1/3', '1/2', '1']);
        }
      });
    });
  }
  it('the sd mark is 1,15 in Romanian and 1.15 in English', () => {
    const frame = M.frames[2];
    LANG = 'ro';
    expect(marks(renderToStaticMarkup(React.createElement(PmfCdfStage, { model: M, frame }))).find((k) => k.kind === 'sd').value).toBe('1,15');
    LANG = 'en';
    expect(marks(renderToStaticMarkup(React.createElement(PmfCdfStage, { model: M, frame }))).find((k) => k.kind === 'sd').value).toBe('1.15');
    LANG = 'ro';
  });
  it('reduced motion renders the end state: nothing starts transparent', () => {
    LANG = 'ro'; REDUCED = true;
    const html = renderToStaticMarkup(React.createElement(PmfCdfStage, { model: M, frame: M.frames[2] }));
    expect(html).not.toMatch(/opacity:\s*0[;"]/);
    expect(html).toContain('data-kind="variance"');
  });
});

describe('pmf-cdf widget frame', () => {
  it('first frame without predict: bars, caption, Next enabled', () => {
    LANG = 'ro';
    const html = renderToStaticMarkup(React.createElement(PmfCdf, { props: PROPS, predict: false }));
    expect(html).toContain('data-widget="ml-pmf-cdf"');
    expect(text(html)).toContain('În ce punct ar sta barele în echilibru');
    expect(marks(html).filter((m) => m.kind === 'bar')).toHaveLength(4);
    expect(html).toContain('Mai departe');
  });
  it('with predict: only the "Arată-mi" button until the learner reveals', () => {
    const html = renderToStaticMarkup(React.createElement(PmfCdf, { props: PROPS, predict: true }));
    expect(html).toContain('Arată-mi');
    expect(html).not.toContain('Mai departe');
    expect(html).toContain('Gândește-te întâi');
  });
  it('the stepper keeps Next locked until the prediction is revealed, then moves to the mean frame', () => {
    const s0 = initialStepper({ predict: true });
    expect(stepperReducer(s0, { type: 'next', n: 5 })).toEqual(s0);
    expect(stepperReducer(s0, { type: 'reveal', n: 5 }).step).toBe(1);
  });
  it('fits 390 px: the SVG scales (viewBox, no fixed width) and the deviation table scrolls in its own box', () => {
    const html = renderToStaticMarkup(React.createElement(PmfCdfStage, { model: pmfCdf(PROPS), frame: pmfCdf(PROPS).frames[2] }));
    expect(html).toMatch(/<svg[^>]*viewBox="0 0 340 206"/);
    expect(html).not.toMatch(/<svg[^>]*\swidth=/);
    expect(html).toContain('viz-tablewrap');
  });
});
