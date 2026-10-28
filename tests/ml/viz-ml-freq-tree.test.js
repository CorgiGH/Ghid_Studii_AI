import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { freqTree, freqTreeProblems, FREQ_FRAMES } from '../../src/components/lesson/viz/logic/ml/freqTree.js';
import { numberTokens } from '../../src/components/lesson/viz/logic/ml/probFormat.js';
import { validateViz } from '../../src/components/lesson/viz/vizSpec.js';

let LANG = 'ro';
vi.mock('../../src/contexts/AppContext', () => ({ useApp: () => ({ t: (en, ro) => (LANG === 'ro' ? ro : en), lang: LANG }) }));
vi.mock('../../src/lesson/useLessonStore', () => ({ getLessonStore: () => ({}), useLessonStore: () => ({}) }));
vi.mock('motion/react', async (orig) => ({ ...(await orig()), useReducedMotion: () => true }));

const { FreqTreeBody } = await import('../../src/components/lesson/viz/widgets/ml/FreqTree.jsx');

const labels = {
  sick: { en: 'sick', ro: 'bolnavi' }, healthy: { en: 'healthy', ro: 'sănătoși' },
  pos: { en: 'positive', ro: 'pozitivi' }, neg: { en: 'negative', ro: 'negativi' }, people: { en: 'people', ro: 'persoane' },
};
// The outline's L2 example (visual spec) and its second configuration (L2.s10).
const SCREEN = { population: 10000, prior: 0.01, sens: 0.9, fpr: 0.09, labels };
const HALF = { ...SCREEN, prior: 0.5 };
const stepper = (step, n = FREQ_FRAMES) => ({ n, step, predicting: false, canBack: step > 0, canNext: step < n - 1, last: step >= n - 1, next() {}, back() {}, goto() {}, reset() {}, reveal() {} });
const marksOf = (html) => [...html.matchAll(/data-mark="([^"]+)"(?:[^>]*?)data-value="([^"]*)"/g)].map((m) => [m[1], m[2]]);
const esc = (s) => s.replace(/&/g, '&amp;').replace(/>/g, '&gt;').replace(/</g, '&lt;');

describe('ml-freq-tree logic: the outline numbers', () => {
  const L = freqTree(SCREEN);
  it('counts 100 / 9900, 90 + 10, 891 + 9009, 981 positives, 90/981', () => {
    expect(L.counts).toMatchObject({ root: '10000', sick: '100', healthy: '9900', sickPos: '90', sickNeg: '10', healthyPos: '891', healthyNeg: '9009' });
    expect(L.total).toBe('981');
    expect(L.ratio).toBe('90/981');
    expect(L.posterior).toBe('0.0917');
  });
  it('probabilities: 0.01 / 0.99 / 0.9 / 0.09, leaves 0.009 and 0.0891, the same fraction', () => {
    expect(L.probs.edge).toMatchObject({ sick: '0.01', healthy: '0.99', sickPos: '0.9', healthyPos: '0.09', sickNeg: '0.1', healthyNeg: '0.91' });
    expect(L.probs.product).toMatchObject({ sickPos: '0.009', healthyPos: '0.0891' });
    expect(L.probs.positive).toBe('0.0981');
  });
  it('second configuration: prevalence 0.5 gives 4500 and 450, 4500/4950 = 10/11', () => {
    const H = freqTree(HALF);
    expect(H.counts).toMatchObject({ sick: '5000', healthy: '5000', sickPos: '4500', healthyPos: '450' });
    expect(H.total).toBe('4950');
    expect(H.ratio).toBe('4500/4950');
    expect(H.posterior).toBe('0.9091');
  });
  it('nodes appear in order and a node asked about is hidden before its reveal', () => {
    const shown = (s) => L.frame(s).nodes.filter((n) => n.shown).map((n) => n.id);
    expect(shown(0)).toEqual(['root']);
    expect(shown(1)).toEqual(['root', 'sick', 'healthy']);
    expect(shown(2)).toEqual(['root', 'sick', 'healthy']);
    expect(shown(3)).toContain('sickPos');
    expect(shown(4)).not.toContain('healthyPos');
    expect(shown(5)).toContain('healthyNeg');
    expect(L.frame(7).nodes.filter((n) => n.hl).map((n) => n.id)).toEqual(['sickPos', 'healthyPos']);
    expect(L.frame(8).nodes.find((n) => n.id === 'healthyPos')).toMatchObject({ edge: '0.09', product: '0.0891' });
  });
  it('the ask frames do not contain the answer asked for', () => {
    const toks = (s) => { const c = L.frame(s).caption; return [...numberTokens(c.en), ...numberTokens(c.ro)]; };
    expect(toks(0)).not.toContain('100');
    expect(toks(2)).not.toContain('90');
    expect(toks(4)).not.toContain('891');
    expect(toks(6)).not.toEqual(expect.arrayContaining(['981']));
    expect(toks(6)).not.toContain('90/981');
    expect(L.frame(6).marks.some((m) => m.id === 'positives' || m.id === 'fraction')).toBe(false);
  });
  it('every number of every caption is a mark of that frame (both languages, both configurations)', () => {
    for (const props of [SCREEN, HALF]) {
      const X = freqTree(props);
      for (let s = 0; s < X.n; s += 1) {
        const f = X.frame(s);
        const allowed = new Set(f.marks.map((m) => m.value));
        for (const lang of ['en', 'ro']) {
          for (const tok of numberTokens(f.caption[lang])) expect(allowed.has(tok), `frame ${s} ${lang}: ${tok} not in ${[...allowed]}`).toBe(true);
        }
      }
    }
  });
  it('writes Romanian counts with "de" where the language needs it', () => {
    expect(L.frame(0).caption.ro).toContain('10 000 de persoane');
    expect(L.frame(1).caption.ro).toContain('100 de bolnavi');
    expect(L.frame(3).caption.ro).toContain('90 de pozitivi');
    expect(L.frame(5).caption.ro).toContain('9 009 negativi');
    expect(L.frame(7).caption.ro).toContain('981 de pozitivi');
    expect(L.frame(7).caption.ro).toContain('90/981 ≈ 0,0917');
    expect(L.frame(7).caption.en).toContain('90/981 ≈ 0.0917');
  });
});

describe('ml-freq-tree props', () => {
  const block = (props) => ({ id: 'v', widget: 'ml-freq-tree', props });
  it('validateViz accepts the outline props and rejects a missing or impossible one', () => {
    expect(validateViz(block(SCREEN))).toEqual([]);
    expect(validateViz(block(HALF))).toEqual([]);
    for (const k of ['population', 'prior', 'sens', 'fpr', 'labels']) {
      const p = { ...SCREEN }; delete p[k];
      expect(validateViz(block(p)).length, k).toBeGreaterThan(0);
    }
    expect(validateViz(block({ ...SCREEN, labels: { ...labels, neg: undefined } })).length).toBeGreaterThan(0);
    expect(freqTreeProblems({ ...SCREEN, population: 1000 }).join()).toMatch(/not a whole number/); // 1000 persons give 89.1 false positives
    expect(freqTreeProblems({ ...SCREEN, prior: 1.5 }).length).toBeGreaterThan(0);
  });
});

describe('ml-freq-tree render', () => {
  const html = (step, props = SCREEN) => renderToStaticMarkup(React.createElement(FreqTreeBody, { props, stepper: stepper(step) }));
  it('draws the first frame: the root, the givens, question marks and no answers', () => {
    LANG = 'ro';
    const h = html(0);
    expect(h).toContain('data-widget="ml-freq-tree"');
    const ids = marksOf(h).map(([id]) => id);
    expect(ids).toEqual(['given-prior', 'given-sens', 'given-fpr', 'population']);
    expect(h).toContain('aria-label="?"');
    expect(h).not.toContain('data-mark="node-');
  });
  it('draws every mark of every frame with its value, and the caption text', () => {
    for (const lang of ['ro', 'en']) {
      LANG = lang;
      for (const props of [SCREEN, HALF]) {
        const L = freqTree(props);
        for (let s = 0; s < L.n; s += 1) {
          const h = html(s, props);
          const drawn = new Map(marksOf(h));
          for (const m of L.frame(s).marks) expect(drawn.get(m.id), `${lang} frame ${s} ${m.id}`).toBe(m.value);
          expect(h).toContain(esc(L.frame(s).caption[lang]));
        }
      }
    }
    LANG = 'ro';
  });
  it('the end state (reduced motion) shows the probabilities, the leaves and the result', () => {
    const h = html(8);
    expect(h).toContain('data-mark="prod-healthyPos" data-value="0.0891"');
    expect(h).toContain('data-mark="posterior" data-value="0.0917"');
  });
  it('uses no colour literals and no opacity', () => {
    const css = readFileSync('src/components/lesson/viz/widgets/ml/freqTree.css', 'utf8');
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(|opacity/);
  });
});
