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

const { default: FreqTree, FreqTreeBody } = await import('../../src/components/lesson/viz/widgets/ml/FreqTree.jsx');

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
    expect(L.frame(2).caption.ro).toContain('Dintre cei 100 de bolnavi');
    expect(L.frame(4).caption.ro).toContain('Dintre cei 9 900 de sănătoși');
    // every count written before a label word takes "de" exactly when Romanian needs it (20 and up, unless it ends in 01-19)
    const words = Object.values(labels).map((x) => x.ro).join('|');
    for (const props of [SCREEN, HALF]) {
      const X = freqTree(props);
      for (let s = 0; s < X.n; s += 1) {
        for (const m of X.frame(s).caption.ro.matchAll(new RegExp(`(\\d[\\d\\u00a0]*) (de )?(${words})`, 'g'))) {
          const n = Number(m[1].replace(/ /g, ''));
          const r = n % 100;
          expect(!!m[2], `frame ${s}: "${m[0]}"`).toBe(r === 0 || r >= 20);
        }
      }
    }
    expect(L.frame(7).caption.ro).toContain('90/981 ≈ 0,0917');
    expect(L.frame(7).caption.en).toContain('90/981 ≈ 0.0917');
  });
});

describe('ml-freq-tree Romanian and the Bayes line', () => {
  const L = freqTree(SCREEN);
  it('agrees in gender, says "sunt", and the probability frame lines up with the Bayes formula', () => {
    expect(L.frame(0).caption.ro).toBe('Imaginează-ți 10 000 de persoane. Câți bolnavi sunt în acest grup?');
    expect(L.frame(1).caption.ro).toBe('Sunt 100 de bolnavi din 10 000 (0,01); ceilalți 9 900 sunt sănătoși.');
    expect(L.frame(8).caption.ro).toContain('sunt frunzele celor pozitivi');
    expect(L.frame(8).caption.ro).not.toMatch(/frunzele pozitivi/);
    expect(L.frame(8).caption.en).toContain('= 0.0891 are the positive leaves.');
    expect(L.frame(8).caption.ro).toContain('0,009 / (0,009 + 0,0891) = 0,009 / 0,0981 ≈ 0,0917');
    expect(L.frame(8).caption.en).toContain('0.009 / (0.009 + 0.0891) = 0.009 / 0.0981 ≈ 0.0917');
  });
});

describe('ml-freq-tree Romanian lists', () => {
  it('never joins decimal-comma numbers with ", "', () => {
    for (const props of [SCREEN, HALF]) {
      const X = freqTree(props);
      for (let s = 0; s < X.n; s += 1) expect(X.frame(s).caption.ro, `frame ${s}`).not.toMatch(/\d,\d+, (?=[−\d(P])/);
    }
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
  it('with predict, the widget shows only "Arată-mi" (no Next) and the first question', () => {
    LANG = 'ro';
    const h = renderToStaticMarkup(React.createElement(FreqTree, { props: SCREEN, predict: true }));
    expect(h).toContain('Arată-mi');
    expect(h).not.toContain('Mai departe');
    expect(h).toContain(esc(freqTree(SCREEN).frame(0).caption.ro));
    const free = renderToStaticMarkup(React.createElement(FreqTree, { props: SCREEN, predict: false }));
    expect(free).toContain('Mai departe');
    expect(free).not.toContain('Arată-mi');
  });
  it('the end state (reduced motion) shows the probabilities, the leaves and the result', () => {
    const h = html(8);
    expect(h).toContain('data-mark="prod-healthyPos" data-value="0.0891"');
    expect(h).toContain('data-mark="posterior" data-value="0.0917"');
  });
  // Seen in Chrome: next to the "pozitivi 981" chip, the probability 0,0981 was labelled "toți cei pozitivi", two labels for
  // two different numbers; it is the share of the positives, labelled like the share of the sick at the top.
  it('labels the probability of a positive as a share, like the prior', () => {
    LANG = 'ro';
    const h = html(8);
    expect(h).toContain('ponderea celor pozitivi');
    expect(h).not.toContain('toți cei pozitivi');
    LANG = 'en';
    expect(html(8)).toContain('share positive');
    LANG = 'ro';
  });
  it('uses no colour literals and no opacity', () => {
    const css = readFileSync('src/components/lesson/viz/widgets/ml/freqTree.css', 'utf8');
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(|opacity/);
  });
});

// ml-g4 s2 and s4: the coins (feminine nouns), and s9: the cancer test (masculine, the default)
describe('ml-freq-tree Romanian agreement (ml-g4 s2, s4, s9)', () => {
  const COINS = { population: 20, prior: 0.5, sens: 0.9, fpr: 0.5, feminine: true, labels: {
    sick: { en: 'rigged', ro: 'măsluite' }, healthy: { en: 'fair', ro: 'corecte' }, pos: { en: 'heads', ro: 'cu cap' }, neg: { en: 'tails', ro: 'cu pajură' }, people: { en: 'coins', ro: 'monede' } } };
  const cap = (props, s) => freqTree(props).frame(s).caption.ro;
  it('feminine: câte, celelalte, cele, ele; a count of 1 reads "cealaltă"', () => {
    expect(cap(COINS, 0)).toBe('Imaginează-ți 20 de monede. Câte măsluite sunt în acest grup?');
    expect(cap(COINS, 1)).toContain('; celelalte 10 sunt corecte.');
    expect(cap(COINS, 2)).toBe('Dintre cele 10 măsluite, câte sunt cu cap? (0,9 dintre ele.)');
    expect(cap(COINS, 3)).toBe('10 × 0,9 = 9 cu cap; cealaltă cu pajură.');
    expect(cap(COINS, 6)).toBe('Câte sunt cu cap în total și câte dintre ele sunt măsluite? Ce fracție?');
    expect(cap(COINS, 7)).toContain('dintre ele 9 sunt măsluite');
    for (let s = 0; s < FREQ_FRAMES; s++) expect(cap(COINS, s)).not.toMatch(/Câți|ceilalți|dintre ei\b|Dintre cei/);
  });
  it('a label that is a prepositional phrase takes no "de" after a count from 20 up (ml-g4 s4: 45 cu cap)', () => {
    const S4 = { ...COINS, population: 100, prior: 0.1 };
    expect(cap(S4, 4)).toBe('Dintre cele 90 de corecte, câte sunt cu cap? (0,5 dintre ele.)');
    expect(cap(S4, 5)).toBe('90 × 0,5 = 45 cu cap; celelalte 45 cu pajură.');
    expect(cap(S4, 7)).toMatch(/^9 \+ 45 = 54 cu cap; dintre ele 9 sunt măsluite\./);
    for (let s = 0; s < FREQ_FRAMES; s++) expect(cap(S4, s)).not.toMatch(/ de cu /);
  });
  it('the default stays masculine: câți, cei, ceilalți (ml-g4 s9 with "bolnavi de cancer")', () => {
    const CANCER = { population: 100000, prior: 0.008, sens: 0.98, fpr: 0.03, labels: {
      sick: { en: 'with cancer', ro: 'bolnavi de cancer' }, healthy: { en: 'healthy', ro: 'sănătoși' }, pos: { en: 'positive', ro: 'pozitivi' }, neg: { en: 'negative', ro: 'negativi' }, people: { en: 'people', ro: 'persoane' } } };
    expect(cap(CANCER, 0)).toContain('Câți bolnavi de cancer sunt în acest grup?');
    expect(cap(CANCER, 2)).toContain('Dintre cei 800 de bolnavi de cancer, câți sunt pozitivi?');
    expect(cap(CANCER, 3)).toContain('ceilalți 16 negativi');
  });
  it('validateViz accepts feminine as a boolean only', () => {
    const b = (props) => ({ id: 'x', type: 'viz', widget: 'ml-freq-tree', predict: true, props });
    expect(validateViz(b(COINS))).toEqual([]);
    expect(validateViz(b({ ...COINS, feminine: 'yes' })).length).toBe(1);
  });
});
