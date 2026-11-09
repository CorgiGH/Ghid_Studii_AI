import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { payoffMatrix, bestRowsIn, bestColsIn, pureNash, compareRows, verdictOf, dominantRows, dominantCols } from '../../src/components/lesson/viz/logic/payoff-matrix.js';
import { validateViz } from '../../src/components/lesson/viz/vizSpec.js';
import { expectCaptionDrawn } from '../ml/ml-viz-helpers.js';

vi.mock('../../src/contexts/AppContext', () => ({ useApp: () => ({ t: (en, ro) => ro, lang: 'ro' }) }));
vi.mock('../../src/lesson/useLessonStore', () => ({ useLessonStore: () => null, getLessonStore: () => null }));
vi.mock('motion/react', async (orig) => ({ ...(await orig()), useReducedMotion: () => true }));

// exam 2024-B, problem 5: Daffy (rows) against Bugs (columns); a cell is (Daffy, Bugs)
const DAFFY = {
  players: { row: 'Daffy', col: 'Bugs' },
  rows: ['Hug', 'Shoot', 'Run'],
  cols: ['Hug', 'Shoot', 'Run'],
  payoffs: [[[3, 3], [0, 3], [1, 1]], [[3, 0], [4, 4], [0, 2]], [[1, 1], [2, 0], [0, 0]]],
};
// the crash pack's s05: Ana (rows x, y, z) against Bogdan (columns p, q, r)
const ANA = {
  players: { row: 'Ana', col: 'Bogdan' },
  rows: ['x', 'y', 'z'],
  cols: ['p', 'q', 'r'],
  payoffs: [[[2, 0], [2, 0], [3, 1]], [[1, 2], [5, 4], [4, 3]], [[1, 4], [0, 1], [5, 2]]],
};
const PD = { // prisoner's dilemma, (row, column)
  players: { row: 'A', col: 'B' }, rows: ['Deny', 'Confess'], cols: ['Deny', 'Confess'],
  payoffs: [[[-1, -1], [-3, 0]], [[0, -3], [-2, -2]]],
};
const PENNIES = { players: { row: 'A', col: 'B' }, rows: ['H', 'T'], cols: ['H', 'T'], payoffs: [[[1, -1], [-1, 1]], [[-1, 1], [1, -1]]] };

describe('payoff-matrix: best replies', () => {
  it('a tie gives every tied row (Daffy, column Hug: Hug and Shoot both give 3)', () => {
    expect(bestRowsIn(DAFFY.payoffs, 0)).toEqual({ max: 3, at: [0, 1] });
    expect(bestRowsIn(DAFFY.payoffs, 1)).toEqual({ max: 4, at: [1] });
    expect(bestRowsIn(DAFFY.payoffs, 2)).toEqual({ max: 1, at: [0] });
  });
  it('Bugs, row Hug: Hug and Shoot both give 3', () => {
    expect(bestColsIn(DAFFY.payoffs, 0)).toEqual({ max: 3, at: [0, 1] });
    expect(bestColsIn(DAFFY.payoffs, 1)).toEqual({ max: 4, at: [1] });
    expect(bestColsIn(DAFFY.payoffs, 2)).toEqual({ max: 1, at: [0] });
  });
  it("Ana and Bogdan (the lesson's [ ] marks): Ana 2, 5, 5 on p, q, r; Bogdan 1, 4, 4 on x, y, z", () => {
    expect([0, 1, 2].map((c) => bestRowsIn(ANA.payoffs, c))).toEqual([{ max: 2, at: [0] }, { max: 5, at: [1] }, { max: 5, at: [2] }]);
    expect([0, 1, 2].map((r) => bestColsIn(ANA.payoffs, r))).toEqual([{ max: 1, at: [2] }, { max: 4, at: [1] }, { max: 4, at: [0] }]);
  });
});

describe('payoff-matrix: pure Nash', () => {
  it('2024-B Daffy/Bugs: (Hug, Hug) and (Shoot, Shoot), nothing else', () => {
    expect(pureNash(DAFFY.payoffs)).toEqual([[0, 0], [1, 1]]);
  });
  it('(Shoot, Hug) is a best reply for Daffy through the tie, but not for Bugs', () => {
    expect(bestRowsIn(DAFFY.payoffs, 0).at).toContain(1);
    expect(bestColsIn(DAFFY.payoffs, 1).at).not.toContain(0);
  });
  it('Ana and Bogdan: only (y, q) with (5, 4)', () => {
    expect(pureNash(ANA.payoffs)).toEqual([[1, 1]]);
  });
  it("prisoner's dilemma: (Confess, Confess); matching pennies: none", () => {
    expect(pureNash(PD.payoffs)).toEqual([[1, 1]]);
    expect(pureNash(PENNIES.payoffs)).toEqual([]);
  });
});

describe('payoff-matrix: dominance', () => {
  it('2024-B: no dominant strategy for Daffy or for Bugs, and no strictly dominant one', () => {
    expect(dominantRows(DAFFY.payoffs)).toEqual({ weak: [], strict: [] });
    expect(dominantCols(DAFFY.payoffs)).toEqual({ weak: [], strict: [] });
  });
  it('2024-B: Shoot against Run is >, >, = (dominant, not strict); Hug against Shoot fails', () => {
    expect(compareRows(DAFFY.payoffs, 1, 2)).toEqual(['>', '>', '=']);
    expect(verdictOf(compareRows(DAFFY.payoffs, 1, 2))).toBe('dominant');
    expect(compareRows(DAFFY.payoffs, 0, 1)).toEqual(['=', '<', '>']);
    expect(verdictOf(compareRows(DAFFY.payoffs, 0, 1))).toBe('none');
  });
  it("prisoner's dilemma: Confess is strictly dominant for both", () => {
    expect(dominantRows(PD.payoffs)).toEqual({ weak: [1], strict: [1] });
    expect(dominantCols(PD.payoffs)).toEqual({ weak: [1], strict: [1] });
  });
  it('Ana and Bogdan: y against x loses on p (1 < 2), so y is not dominant', () => {
    expect(compareRows(ANA.payoffs, 1, 0)).toEqual(['<', '>', '>']);
    expect(verdictOf(compareRows(ANA.payoffs, 1, 0))).toBe('none');
  });
});

describe('payoff-matrix frames', () => {
  it('nash: setup, one frame per column, one per row, then the equilibrium', () => {
    const M = payoffMatrix({ mode: 'nash', ...ANA });
    expect(M.frames.map((f) => f.kind)).toEqual(['setup', 'col', 'col', 'col', 'row', 'row', 'row', 'end']);
    expect(M.frames[1].at).toEqual([0]);
    expect(M.ask(1).answer).toEqual([0]);
    expect(M.ask(0)).toBeNull();
    expect(M.ask(7)).toBeNull();
  });
  it('nash: ties must all be tapped (the answer of a tie frame lists every tied index)', () => {
    const M = payoffMatrix({ mode: 'nash', ...DAFFY });
    expect(M.ask(1).answer).toEqual([0, 1]);
    expect(M.caption(1, { answered: true, picks: { k1: [0] } }).ro).toMatch(/^Nu chiar \(ai atins Hug\)/);
    expect(M.caption(1, { answered: true, picks: { k1: [0, 1] } }).ro).toMatch(/^Pe coloana Hug, Daffy ia 3, 3, 1; cel mai mult este 3, la rândurile Hug și Shoot/);
  });
  it('nash: marks appear only after the pick; the end frame holds the equilibria and the deviations', () => {
    const M = payoffMatrix({ mode: 'nash', ...ANA });
    expect(M.state(1, false).rowBest).toEqual([]);
    expect(M.state(1, true).rowBest).toEqual([[0, 0]]);
    const end = M.state(7);
    expect(end.nash).toEqual([[1, 1]]);
    expect(end.rowBest).toHaveLength(3);
    expect(end.colBest).toHaveLength(3);
    expect(end.deviations).toHaveLength(4); // two rows and two columns to move to
    expect(M.caption(7).ro).toBe('Echilibru Nash pur: (y, q), cu câștigurile (5, 4). În (y, q): dacă Ana schimbă singur rândul, ia 2 sau 0; dacă Bogdan schimbă singur coloana, ia 2 sau 3.');
  });
  it('nash: 2024-B ends with two equilibria; matching pennies ends with none', () => {
    expect(payoffMatrix({ mode: 'nash', ...DAFFY }).caption(7).ro).toMatch(/^Echilibre Nash pure: \(Hug, Hug\), cu câștigurile \(3, 3\) și \(Shoot, Shoot\), cu câștigurile \(4, 4\)\./);
    const P = payoffMatrix({ mode: 'nash', ...PENNIES });
    expect(P.caption(P.count - 1).ro).toMatch(/nu există echilibru Nash pur/);
  });
  it('dominance: one frame per column, the pick is >= or <, the verdict follows the course', () => {
    const M = payoffMatrix({ mode: 'dominance', ...DAFFY, compare: ['Shoot', 'Run'] });
    expect(M.frames.map((f) => f.kind)).toEqual(['setup', 'cmp', 'cmp', 'cmp', 'end']);
    expect(M.pickSpec(1).items[0].options.map((o) => o.id)).toEqual(['ge', 'lt']);
    expect([1, 2, 3].map((k) => M.answer(k))).toEqual(['ge', 'ge', 'ge']); // = counts as >=
    expect(M.caption(3).ro).toMatch(/0 = 0 \(se numără ca ≥, dar nu e strict\)/);
    expect(M.caption(4).ro).toMatch(/dominant față de Run, nu strict/);
    expect(M.caption(4).ro).toMatch(/Daffy nu are niciun rând dominant; Bugs nu are nicio coloană dominantă/);
    expect(M.state(2, true).rels).toEqual(['>', '>']);
    expect(M.state(2, false).rels).toEqual(['>']);
  });
  it('dominance: a losing column is answered "<"', () => {
    const M = payoffMatrix({ mode: 'dominance', ...ANA, compare: ['y', 'x'] });
    expect([1, 2, 3].map((k) => M.answer(k))).toEqual(['lt', 'ge', 'ge']);
    expect(M.caption(4).ro).toMatch(/^y pierde în fața lui x/);
  });
  it('rejects a bad matrix, a bad mode and a missing compare', () => {
    expect(() => payoffMatrix({ mode: 'nash', ...ANA, payoffs: ANA.payoffs.slice(1) })).toThrow();
    expect(() => payoffMatrix({ mode: 'x', ...ANA })).toThrow();
    expect(() => payoffMatrix({ mode: 'dominance', ...ANA })).toThrow();
    expect(() => payoffMatrix({ mode: 'dominance', ...ANA, compare: ['x', 'x'] })).toThrow();
  });
  it('validates as a viz block', () => {
    const block = { type: 'viz', id: 'x', widget: 'payoff-matrix', predict: true, props: { mode: 'nash', ...ANA } };
    expect(validateViz(block)).toEqual([]);
    expect(validateViz({ ...block, props: { ...block.props, mode: 'dominance' } }).join(' ')).toMatch(/compare/);
    expect(validateViz({ ...block, props: { ...block.props, payoffs: [[[1, 2]]] } }).join(' ')).toMatch(/payoff-matrix/);
  });
});

describe('payoff-matrix drawing', () => {
  it('draws every number of every caption (both modes, every frame)', async () => {
    const { Stage } = await import('../../src/components/lesson/viz/widgets/PayoffMatrix.jsx');
    const sets = [{ mode: 'nash', ...ANA }, { mode: 'nash', ...DAFFY }, { mode: 'dominance', ...DAFFY, compare: ['Shoot', 'Run'] }, { mode: 'dominance', ...ANA, compare: ['y', 'x'] }];
    for (const props of sets) {
      const M = payoffMatrix(props);
      for (let k = 0; k < M.count; k += 1) {
        const html = renderToStaticMarkup(React.createElement(Stage, { M, k, answered: true }));
        expectCaptionDrawn(expect, M.caption(k, { answered: true }), html, `${props.mode} ${props.players.row} frame ${k}`);
      }
    }
  });
  it('the end frame turns the equilibrium cells and draws the deviations', async () => {
    const { Stage } = await import('../../src/components/lesson/viz/widgets/PayoffMatrix.jsx');
    const M = payoffMatrix({ mode: 'nash', ...DAFFY });
    const html = renderToStaticMarkup(React.createElement(Stage, { M, k: M.count - 1 }));
    expect((html.match(/data-nash="true"/g) || []).length).toBe(2);
    expect(html).toContain('data-mark="deviation"');
  });
  it('an asked column makes its cells tappable, the others stay plain', async () => {
    const { Stage } = await import('../../src/components/lesson/viz/widgets/PayoffMatrix.jsx');
    const M = payoffMatrix({ mode: 'nash', ...ANA });
    const html = renderToStaticMarkup(React.createElement(Stage, { M, k: 1, answered: false, taps: [0], onTap: () => {} }));
    expect((html.match(/class="pm-btn"/g) || []).length).toBe(3);
    expect(html).toContain('aria-pressed="true"');
  });
  it('the widget renders with the corner naming both players', async () => {
    const PayoffMatrix = (await import('../../src/components/lesson/viz/widgets/PayoffMatrix.jsx')).default;
    const html = renderToStaticMarkup(React.createElement(PayoffMatrix, { props: { mode: 'nash', ...ANA }, predict: true }));
    expect(html).toContain('data-widget="payoff-matrix"');
    expect(html).toContain('Ana ↓');
    expect(html).toContain('Bogdan →');
  });
});
