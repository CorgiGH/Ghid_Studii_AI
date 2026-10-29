import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { omega, omegaProblems, OMEGA_FRAMES } from '../../src/components/lesson/viz/logic/ml/omega.js';
import { numberTokens } from '../../src/components/lesson/viz/logic/ml/probFormat.js';
import { validateViz } from '../../src/components/lesson/viz/vizSpec.js';

vi.mock('../../src/contexts/AppContext', () => ({ useApp: () => ({ t: (en, ro) => ro, lang: 'ro' }) }));
vi.mock('../../src/lesson/useLessonStore', () => ({ getLessonStore: () => ({}), useLessonStore: () => ({}) }));
vi.mock('motion/react', async (orig) => ({ ...(await orig()), useReducedMotion: () => true }));

const { default: Omega, OmegaBody } = await import('../../src/components/lesson/viz/widgets/ml/Omega.jsx');

// The outline's own example (L1 visual spec): the die, B = even, A = {6}.
const DIE = { outcomes: [1, 2, 3, 4, 5, 6], events: { A: [6], B: [2, 4, 6] } };
const stepper = (step, n = OMEGA_FRAMES) => ({ n, step, predicting: false, canBack: step > 0, canNext: step < n - 1, last: step >= n - 1, next() {}, back() {}, goto() {}, reset() {}, reveal() {} });
const marksOf = (html) => [...html.matchAll(/data-mark="([^"]+)"(?:[^>]*?)data-value="([^"]*)"/g)].map((m) => [m[1], m[2]]);

describe('ml-omega logic on the die', () => {
  const L = omega(DIE);
  it('has the outline numbers: 3 remain, 1 favourable, 1/3, masses 1/6, factor 2', () => {
    expect(L.q).toMatchObject({ N: 6, nG: 3, nAG: 1, mass: '1/6', pG: '1/2', pAG: '1/6', pA: '1/6', cond: '1/3', factor: '2', condMass: '1/3' });
    expect(L.n).toBe(7);
  });
  it('frame 1 greys the three outcomes outside B, frame 3 marks only 6 as favourable', () => {
    expect(L.frame(1).cells.filter((c) => c.status === 'out').map((c) => c.label)).toEqual(['1', '3', '5']);
    expect(L.frame(3).cells.filter((c) => c.status === 'fav').map((c) => c.label)).toEqual(['6']);
    expect(L.frame(0).cells.every((c) => c.status === 'open')).toBe(true);
  });
  it('the cut outcomes stay greyed while the caption says they are gone (frames 1, 2, 3 and 5)', () => {
    for (const s of [1, 2, 3, 5]) expect(L.frame(s).cells.filter((c) => c.status === 'out').map((c) => c.label), `frame ${s}`).toEqual(['1', '3', '5']);
    // frame 4 shows the unconditional masses of all six outcomes, frame 6 has B = Ω
    for (const s of [0, 4, 6]) expect(L.frame(s).cells.some((c) => c.status === 'out'), `frame ${s}`).toBe(false);
  });
  it('frame 3 names A ∩ B as a set and says which probability the count gives', () => {
    expect(L.frame(3).caption.ro).toBe('A ∩ B = {6}: A s-a întâmplat în 1 din cele 3 rezultate rămase, deci P(A | B) = 1/3.');
    expect(L.frame(3).caption.en).toBe('A ∩ B = {6}: A happened in 1 of the 3 remaining outcomes, so P(A | B) = 1/3.');
    const M = omega({ outcomes: ['a', 'b', 'c', 'd'], events: { A: ['a', 'b'], B: ['b', 'c', 'd'] }, restrictTo: 'A' });
    expect(M.frame(3).caption.ro).toBe('B ∩ A = {b}: B s-a întâmplat în 1 din cele 2 rezultate rămase, deci P(B | A) = 1/2.');
    const Z = omega({ outcomes: [1, 2, 3, 4], events: { A: [1], B: [2, 3] } });
    expect(Z.frame(3).caption.ro).toBe('A ∩ B = ∅: A nu s-a întâmplat în niciunul dintre cele 2 rezultate rămase, deci P(A | B) = 0.');
    expect(Z.frame(3).caption.en).toBe('A ∩ B = ∅: A happened in none of the 2 remaining outcomes, so P(A | B) = 0.');
  });
  it('frame 5 rescales the B cells to 1/3 each (they add up to 1) and zeroes the others', () => {
    const c = L.frame(5).cells;
    expect(c.filter((x) => x.inG).map((x) => x.mass)).toEqual(['1/3', '1/3', '1/3']);
    expect(c.filter((x) => !x.inG).map((x) => x.mass)).toEqual(['0', '0', '0']);
  });
  it('frame 6 (B = whole space) cuts nothing and says P(A|Ω) = P(A) = 1/6', () => {
    const f = L.frame(6);
    expect(f.cells.every((c) => c.status === 'open' && c.inG && c.mass === '1/6')).toBe(true);
    expect(f.caption.ro).toContain('P(A | Ω) = P(A) = 1/6');
  });
  it('the ask frames do not contain the answer asked for', () => {
    const t0 = numberTokens(L.frame(0).caption.ro + L.frame(0).caption.en);
    expect(t0).not.toContain('3');
    const t2 = numberTokens(L.frame(2).caption.ro + L.frame(2).caption.en);
    expect(t2).not.toContain('1/3');
    const t4 = numberTokens(L.frame(4).caption.ro + L.frame(4).caption.en);
    expect(t4).not.toContain('1/3');
    expect(L.frame(0).marks.map((m) => m.id)).toEqual(['omega-size']);
    expect(L.frame(2).marks.some((m) => m.id === 'favourable')).toBe(false);
    expect(L.frame(4).marks.some((m) => m.id === 'cond')).toBe(false);
  });
  it('every number of every caption is a mark of that frame or an outcome label', () => {
    for (let s = 0; s < L.n; s += 1) {
      const f = L.frame(s);
      const allowed = new Set([...f.marks.map((m) => m.value), ...f.cells.map((c) => c.label)]);
      for (const lang of ['en', 'ro']) {
        for (const tok of numberTokens(f.caption[lang])) expect(allowed.has(tok), `frame ${s} ${lang}: ${tok}`).toBe(true);
      }
    }
  });
  it('Romanian: the cut outcomes are no longer possible, and it is the masses that are multiplied', () => {
    expect(L.frame(1).caption.ro).toBe('Rămân doar rezultatele din B: 3 din 6. Celelalte nu mai sunt posibile.');
    expect(L.frame(5).caption.ro).toBe('Masa fiecărui rezultat din B se înmulțește cu 2, ca masele lor să dea împreună 1: fiecare are acum masa 1/3. P(A | B) = (1/6) / (1/2) = 1/3.');
    expect(L.frame(5).caption.en).toBe('The mass of each outcome in B is multiplied by 2 so that their masses add up to 1: each now has mass 1/3. P(A | B) = (1/6) / (1/2) = 1/3.');
  });
  it('works on other data and on restrictTo A', () => {
    const M = omega({ outcomes: ['a', 'b', 'c', 'd'], events: { A: ['a', 'b'], B: ['b', 'c', 'd'] }, restrictTo: 'A' });
    expect(M.q).toMatchObject({ nG: 2, nAG: 1, cond: '1/2', pG: '1/2', factor: '2' }); // P(B given A) = (1/4)/(1/2)
  });
});

describe('ml-omega Romanian lists', () => {
  it('never joins decimal-comma numbers with ", "', () => {
    for (const props of [DIE, { outcomes: ["a", "b", "c", "d"], events: { A: ["a", "b"], B: ["b", "c", "d"] }, restrictTo: "A" }]) {
      const X = omega(props);
      for (let s = 0; s < X.n; s += 1) expect(X.frame(s).caption.ro, `frame ${s}`).not.toMatch(/\d,\d+, (?=[−\d(P])/);
    }
  });
});

describe('ml-omega props', () => {
  const block = (props) => ({ id: 'v', widget: 'ml-omega', props });
  it('validateViz accepts the outline props and rejects the broken ones', () => {
    expect(validateViz(block(DIE))).toEqual([]);
    expect(validateViz(block({ ...DIE, restrictTo: 'A' }))).toEqual([]);
    expect(validateViz(block({ events: DIE.events })).length).toBeGreaterThan(0);
    expect(validateViz(block({ outcomes: DIE.outcomes })).length).toBeGreaterThan(0);
    expect(validateViz(block({ ...DIE, events: { A: [6], B: [7] } })).length).toBeGreaterThan(0);
    expect(validateViz(block({ ...DIE, events: { A: [6], B: [] } })).length).toBeGreaterThan(0);
    expect(omegaProblems({ ...DIE, restrictTo: 'C' }).length).toBeGreaterThan(0);
  });
});

describe('ml-omega render', () => {
  const html = (step) => renderToStaticMarkup(React.createElement(OmegaBody, { props: DIE, stepper: stepper(step) }));
  it('draws the first frame without any answer on screen', () => {
    const h = html(0);
    expect(h).toContain('data-widget="ml-omega"');
    expect(marksOf(h).filter(([id]) => !id.startsWith('cell:'))).toEqual([['omega-size', '6']]);
    expect(h).not.toContain('data-status="out"');
  });
  it('draws every mark of every frame with its value (caption numbers match the drawing)', () => {
    const L = omega(DIE);
    for (let s = 0; s < L.n; s += 1) {
      const h = html(s);
      const drawn = new Map(marksOf(h));
      for (const m of L.frame(s).marks) expect(drawn.get(m.id), `frame ${s} ${m.id}`).toBe(m.value);
      // the caption in the markup is the logic caption (ro, as the mock t picks it)
      expect(h).toContain(L.frame(s).caption.ro.replace(/&/g, '&amp;').replace(/>/g, '&gt;').replace(/</g, '&lt;'));
    }
  });
  it('with predict, the widget shows only "Arată-mi" (no Next) and the first question', () => {
    const h = renderToStaticMarkup(React.createElement(Omega, { props: DIE, predict: true }));
    expect(h).toContain('Arată-mi');
    expect(h).not.toContain('Mai departe');
    expect(h).toContain(omega(DIE).frame(0).caption.ro);
  });
  it('labels the rescaled mass plainly', () => {
    expect(html(5)).toContain('masa nouă a unui rezultat din B');
  });
  it('the end state (reduced motion) shows the whole-space frame', () => {
    const h = html(6);
    expect(h).toContain('P(A | Ω) = P(A) = 1/6');
    expect(h).not.toContain('data-status="out"');
  });
  it('uses no colour literals', () => {
    const css = readFileSync('src/components/lesson/viz/widgets/ml/omega.css', 'utf8') + readFileSync('src/components/lesson/viz/widgets/ml/probWidgets.css', 'utf8');
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/);
    expect(css).not.toMatch(/opacity/);
  });
});
