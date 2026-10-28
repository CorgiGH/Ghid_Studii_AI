import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { indep2x2, indepProblems, INDEP_FRAMES } from '../../src/components/lesson/viz/logic/ml/indep2x2.js';
import { numberTokens } from '../../src/components/lesson/viz/logic/ml/probFormat.js';
import { validateViz } from '../../src/components/lesson/viz/vizSpec.js';

let LANG = 'ro';
vi.mock('../../src/contexts/AppContext', () => ({ useApp: () => ({ t: (en, ro) => (LANG === 'ro' ? ro : en), lang: LANG }) }));
vi.mock('../../src/lesson/useLessonStore', () => ({ getLessonStore: () => ({}), useLessonStore: () => ({}) }));
vi.mock('motion/react', async (orig) => ({ ...(await orig()), useReducedMotion: () => true }));

const { Indep2x2Body } = await import('../../src/components/lesson/viz/widgets/ml/Indep2x2.jsx');

// The outline's L3 example (Cn-s1:7): P(X)=0.5, P(Y)=0.2, P(X and Y)=0.11 out of 100.
const SEMINAR = { counts: [[11, 39], [9, 41]], labels: { x: 'X', y: 'Y' } };
const INDEP = { counts: [[10, 40], [10, 40]], labels: { x: 'X', y: 'Y' } };
const stepper = (step, n = INDEP_FRAMES) => ({ n, step, predicting: false, canBack: step > 0, canNext: step < n - 1, last: step >= n - 1, next() {}, back() {}, goto() {}, reset() {}, reveal() {} });
const marksOf = (html) => [...html.matchAll(/data-mark="([^"]+)"(?:[^>]*?)data-value="([^"]*)"/g)].map((m) => [m[1], m[2]]);
const esc = (s) => s.replace(/&/g, '&amp;').replace(/>/g, '&gt;').replace(/</g, '&lt;');

describe('ml-indep-2x2 logic: the outline numbers', () => {
  const L = indep2x2(SEMINAR);
  it('margins 0.5 and 0.2, cells 0.11 / 0.39 / 0.09 / 0.41, products 0.1 / 0.4 / 0.1 / 0.4, P(Y|X) = 0.22', () => {
    expect(L.q).toMatchObject({ pX: '0.5', pNX: '0.5', pY: '0.2', pNY: '0.8', condYX: '0.22', independent: false });
    expect(L.q.cell).toEqual({ '00': '0.11', '01': '0.39', 10: '0.09', 11: '0.41' });
    expect(L.q.prod).toEqual({ '00': '0.1', '01': '0.4', 10: '0.1', 11: '0.4' });
    expect(L.q.equal).toEqual({ '00': false, '01': false, 10: false, 11: false });
  });
  it('step order: margins only, product for the first cell, the cell beside it, the verdict, the other three, the toggle', () => {
    const f = (s) => L.frame(s).cells.map((c) => [c.actual, c.product, c.sign]);
    expect(f(0)).toEqual([[null, null, null], [null, null, null], [null, null, null], [null, null, null]]);
    expect(f(1)[0]).toEqual([null, '0.1', null]);
    expect(f(2)[0]).toEqual(['0.11', '0.1', null]);
    expect(f(3)[0]).toEqual(['0.11', '0.1', 'ne']);
    expect(f(4)[1]).toEqual([null, null, null]);
    expect(f(5)).toEqual([['0.11', '0.1', 'ne'], ['0.39', '0.4', 'ne'], ['0.09', '0.1', 'ne'], ['0.41', '0.4', 'ne']]);
    expect(f(6)).toEqual([['0.1', '0.1', 'eq'], ['0.4', '0.4', 'eq'], ['0.1', '0.1', 'eq'], ['0.4', '0.4', 'eq']]);
  });
  it('the ask frames do not contain what they ask', () => {
    const toks = (s) => { const c = L.frame(s).caption; return [...numberTokens(c.en), ...numberTokens(c.ro)]; };
    expect(toks(0)).not.toContain('0.1'); // the product
    expect(toks(2)).not.toContain('0.22');
    expect(L.frame(2).marks.some((m) => m.id === 'verdict' || m.id.startsWith('sign-'))).toBe(false);
    expect(L.frame(4).marks.some((m) => ['cell-01', 'cell-10', 'cell-11', 'prod-01'].includes(m.id))).toBe(false);
  });
  it('every number of every caption is a mark of that frame, in both languages', () => {
    for (const props of [SEMINAR, INDEP, { counts: [[2, 1], [1, 2]], labels: { x: 'A', y: 'B' } }]) {
      const X = indep2x2(props);
      for (let s = 0; s < X.n; s += 1) {
        const f = X.frame(s);
        const allowed = new Set(f.marks.map((m) => m.value));
        for (const lang of ['en', 'ro']) for (const tok of numberTokens(f.caption[lang])) expect(allowed.has(tok), `frame ${s} ${lang}: ${tok}`).toBe(true);
      }
    }
  });
  it('an independent table: the verdict says so and every cell matches', () => {
    const I = indep2x2(INDEP);
    expect(I.q.independent).toBe(true);
    expect(I.frame(3).caption.en).toContain('0.1 = 0.1');
    expect(I.frame(5).caption.en).toContain('All of them match');
    expect(I.frame(5).cells.every((c) => c.sign === 'eq')).toBe(true);
  });
  it('writes the Romanian comma and the conditional form', () => {
    expect(L.frame(3).caption.ro).toBe('0,11 ≠ 0,1: nu sunt independente. Forma condiționată spune la fel: P(Y | X) = 0,22 ≠ 0,2 = P(Y). Egalitatea trebuie să fie exactă.');
    expect(L.frame(5).caption.ro).toContain('Niciuna nu se potrivește');
  });
});

describe('ml-indep-2x2 props', () => {
  const block = (props) => ({ id: 'v', widget: 'ml-indep-2x2', props });
  it('validateViz accepts the outline props and rejects the broken ones', () => {
    expect(validateViz(block(SEMINAR))).toEqual([]);
    expect(validateViz(block({ labels: SEMINAR.labels })).length).toBeGreaterThan(0);
    expect(validateViz(block({ counts: SEMINAR.counts })).length).toBeGreaterThan(0);
    expect(validateViz(block({ counts: [[1, 2, 3], [4, 5, 6]], labels: SEMINAR.labels })).length).toBeGreaterThan(0);
    expect(validateViz(block({ counts: [[0, 0], [0, 0]], labels: SEMINAR.labels })).length).toBeGreaterThan(0);
    expect(indepProblems({ counts: [[1, 0], [1, 0]], labels: SEMINAR.labels }).join()).toMatch(/empty/);
    expect(indepProblems({ counts: [[1.5, 0], [1, 2]], labels: SEMINAR.labels }).length).toBeGreaterThan(0);
  });
});

describe('ml-indep-2x2 render', () => {
  const html = (step, props = SEMINAR) => renderToStaticMarkup(React.createElement(Indep2x2Body, { props, stepper: stepper(step) }));
  it('draws the first frame: the four margins and empty cells', () => {
    LANG = 'ro';
    const h = html(0);
    expect(h).toContain('data-widget="ml-indep-2x2"');
    expect(marksOf(h)).toEqual([['pX', '0.5'], ['pNX', '0.5'], ['pY', '0.2'], ['pNY', '0.8']]);
    expect(h).toContain('mli-cell empty');
  });
  it('draws every mark of every frame with its value, and the caption text', () => {
    for (const lang of ['ro', 'en']) {
      LANG = lang;
      for (const props of [SEMINAR, INDEP]) {
        const L = indep2x2(props);
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
  it('the end state (reduced motion) is the independent table', () => {
    const h = html(6);
    expect(h).toContain('data-variant="independent"');
    expect(h).toContain('data-mark="verdict" data-value="independent"');
    expect(h).toContain('data-mark="cell-11" data-value="0.4"');
  });
  it('uses no colour literals and no opacity', () => {
    const css = readFileSync('src/components/lesson/viz/widgets/ml/indep2x2.css', 'utf8');
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(|opacity/);
  });
});
