import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { gameTree, buildTree, minimaxValues, alphaBetaRun, layoutOf } from '../../src/components/lesson/viz/logic/game-tree.js';
import { validateViz } from '../../src/components/lesson/viz/vizSpec.js';
import { expectCaptionDrawn } from '../ml/ml-viz-helpers.js';

vi.mock('../../src/contexts/AppContext', () => ({ useApp: () => ({ t: (en, ro) => ro, lang: 'ro' }) }));
vi.mock('../../src/lesson/useLessonStore', () => ({ useLessonStore: () => null, getLessonStore: () => null }));
vi.mock('motion/react', async (orig) => ({ ...(await orig()), useReducedMotion: () => true }));

const L = (leaf) => ({ leaf });
const kids = (id, ...vs) => ({ id, children: vs.map(L) });
// c5 p.24: A(1, 5, 9), B(8), C(3, 9, 2) under S
const course = (root) => ({ mode: 'alphabeta', root, tree: { id: 'S', children: [kids('A', 1, 5, 9), kids('B', 8), kids('C', 3, 9, 2)] } });
// the crash pack's own screens s26 and s28: S = MIN over A(4, 9, 6), B(11, 5, 7), C(7, 10, 2)
const lesson = { mode: 'alphabeta', root: 'MIN', tree: { id: 'S', children: [kids('A', 4, 9, 6), kids('B', 11, 5, 7), kids('C', 7, 10, 2)] } };
// c5 p.22: S MIN = 9, A MAX = 9 over (9, 8), B MAX >= 10 (the leaf 10 reaches beta = 9, the next leaf is cut)
const p22 = { mode: 'alphabeta', root: 'MIN', tree: { id: 'S', children: [kids('A', 9, 8), kids('B', 10, 4)] } };
// the crash pack's s30: S = MAX over A(5, 8, 6), B(4, 9, 3), C(9, 7, 12); its solution: root 7, B cut after 4 (9 and 3)
const s30 = { mode: 'alphabeta', root: 'MAX', tree: { id: 'S', children: [kids('A', 5, 8, 6), kids('B', 4, 9, 3), kids('C', 9, 7, 12)] } };
// three levels: S MAX over X MIN(A MAX(5), B MAX(2, 9)) and Y MIN(C MAX(1, 2), D MAX(3, 7)); X = 5, then C = 2 <= alpha 5 in Y
const deep = { mode: 'alphabeta', root: 'MAX', tree: { id: 'S', children: [
  { id: 'X', children: [kids('A', 5), kids('B', 2, 9)] },
  { id: 'Y', children: [kids('C', 1, 2), kids('D', 3, 7)] },
] } };
// a cut whose bound was set higher up: R MAX gets alpha 8 from P (8); in Q (MIN) -> Z (MAX) -> X (MIN), the leaf 3 <= 8 cuts X,
// but the 8 belongs to R, not to X's parent Z
const far = { mode: 'alphabeta', root: 'MAX', tree: { id: 'R', children: [
  kids('P', 8),
  { id: 'Q', children: [{ id: 'Z', children: [kids('X', 3, 10), kids('W', 1)] }, L(2)] },
] } };

const leafValues = (M, ids) => ids.map((id) => M.T.nodes[id].value);
const evaluated = (M) => M.run.frames.map((f) => f.v);

describe('game-tree logic: the course tree (c5 p.24)', () => {
  it('S = MIN: value 8 and only leaf 2 is cut', () => {
    const M = gameTree(course('MIN'));
    expect(M.rootValue).toBe(8);
    expect(M.run.rootValue).toBe(8);
    expect(leafValues(M, M.run.skipped)).toEqual([2]);
    expect(evaluated(M)).toEqual([1, 5, 9, 8, 3, 9]);
    expect(M.run.closed.A).toEqual({ value: 9, bound: null });
    expect(M.run.closed.B).toEqual({ value: 8, bound: null });
    expect(M.run.closed.C).toEqual({ value: 9, bound: '≥' });
  });
  it('S = MAX: value 8 and the leaves 9 and 2 of C are cut (3 <= alpha 8)', () => {
    const M = gameTree(course('MAX'));
    expect(M.rootValue).toBe(8);
    expect(M.run.rootValue).toBe(8);
    expect(leafValues(M, M.run.skipped)).toEqual([9, 2]);
    expect(evaluated(M)).toEqual([1, 5, 9, 8, 3]);
    expect(M.run.closed.C).toEqual({ value: 3, bound: '≤' });
    const cut = M.run.frames.find((f) => f.cut);
    const step = cut.steps[0];
    expect([step.node, step.v, step.alpha]).toEqual(['C', 3, 8]);
  });
  it('a child starts with the alpha and beta of its parent', () => {
    const M = gameTree(course('MIN'));
    // before leaf 8 (frame of B): S has beta 9 after A, and B starts with [-inf, 9]
    const f = M.run.frames.find((x) => x.v === 8);
    expect(f.before.bounds.B).toEqual([-Infinity, 9]);
    expect(f.before.bounds.S).toEqual([-Infinity, 9]);
    const g = M.run.frames.find((x) => x.leaf === 'l6');
    expect(g.before.bounds.C).toEqual([3, 8]);
  });
  it('has one frame per evaluated leaf plus the setup and the end frame', () => {
    expect(gameTree(course('MIN')).count).toBe(1 + 6 + 1);
    expect(gameTree(course('MAX')).count).toBe(1 + 5 + 1);
  });
});

describe('game-tree logic: the lesson trees and c5 p.22', () => {
  it("the crash pack's s26/s28 tree: minimax 9, alpha-beta 9, leaves 5, 7, 2 cut", () => {
    const M = gameTree(lesson);
    expect(M.rootValue).toBe(9);
    expect(M.run.rootValue).toBe(9);
    expect(leafValues(M, M.run.skipped)).toEqual([5, 7, 2]);
    expect(evaluated(M)).toEqual([4, 9, 6, 11, 7, 10]); // 6 of 9 leaves, as the s28 table says
    expect(M.run.closed.B).toEqual({ value: 11, bound: '≥' });
    expect(M.run.closed.C).toEqual({ value: 10, bound: '≥' });
  });
  it('c5 p.22: A = 9, B >= 10, S = 9', () => {
    const M = gameTree(p22);
    expect(M.run.closed.A.value).toBe(9);
    expect(M.run.closed.B).toEqual({ value: 10, bound: '≥' });
    expect(M.run.rootValue).toBe(9);
    expect(leafValues(M, M.run.skipped)).toEqual([4]);
  });
  it('a leaf that meets the rule with nothing left after it cuts nothing', () => {
    const M = gameTree({ mode: 'alphabeta', root: 'MIN', tree: { id: 'S', children: [kids('A', 9), kids('B', 12)] } });
    const f = M.run.frames[1];
    expect(f.steps[0].hit).toBe(true); // 12 >= beta 9 at the last leaf of B
    expect(f.cut).toBe(false);
    expect(M.answer(2)).toBe('go');
  });
  it("the crash pack's s30 tree (S = MAX): root 7, B cut after its first leaf 4, so 9 and 3 are not evaluated", () => {
    const M = gameTree(s30);
    expect(M.rootValue).toBe(7);
    expect(M.run.rootValue).toBe(7);
    expect(leafValues(M, M.run.skipped)).toEqual([9, 3]);
    expect(evaluated(M)).toEqual([5, 8, 6, 4, 9, 7, 12]);
    expect(M.run.closed.A).toEqual({ value: 5, bound: null });
    expect(M.run.closed.B).toEqual({ value: 4, bound: '≤' });
    expect(M.run.closed.C).toEqual({ value: 7, bound: null });
    const k = M.frames.findIndex((f) => f.cut);
    expect([M.frames[k].v, M.frames[k].parent, M.answer(k)]).toEqual([4, 'B', 'cut']);
    expect(M.caption(k).ro).toMatch(/^B: 4 ≤ alpha = 5, deci restul lui B se taie: B va fi cel mult 4, iar S are deja 5, așa că S nu alege B\. B se închide cu ≤ 4\. S: B ≤ 4 nu este ≥ beta = \+∞; alpha rămâne 5\.$/);
    expect(M.caption(M.count - 1).ro).toBe('S = 7, ca la minimax. Frunze neevaluate: 2 din 9.');
  });
  it('works over three levels: a cut at the last leaf of C lifts to Y and drops the whole subtree D', () => {
    const M = gameTree(deep);
    expect(M.rootValue).toBe(5);
    expect(M.run.rootValue).toBe(5);
    expect(M.run.closed.X).toEqual({ value: 5, bound: null });
    expect(M.run.closed.Y).toEqual({ value: 2, bound: '≤' });
    expect(leafValues(M, M.run.skipped)).toEqual([3, 7]);
    const f = M.run.frames.find((x) => x.cut);
    expect([f.v, f.parent]).toEqual([2, 'C']); // the pick "tai restul" is right at C's last leaf: the cut is higher up
    expect(f.steps.map((x) => [x.node, x.cut])).toEqual([['C', false], ['Y', true], ['S', false]]); // Y closes with <= 2 and S reads it
    expect(M.answer(M.frames.indexOf(f))).toBe('cut');
    // the last leaf of C asks about a cut higher up and shows the bounds of every open node above C
    const spec = M.pickSpec(M.frames.indexOf(f)).items[0];
    expect(spec.prompt.ro).toBe('Frunza 2 este ultima din C (MAX ▲). Se închide C: se taie ceva mai sus? Deasupra, [alpha, beta]: Y (MIN ▼) [5, +∞]; S (MAX ▲) [5, +∞].');
    expect(spec.options.map((o) => [o.id, o.label.ro])).toEqual([['go', 'nu'], ['cut', 'da, se taie']]);
    // the caption follows the order things happen: C closes, then Y reads it and cuts
    expect(M.caption(M.frames.indexOf(f)).ro).toMatch(/C se închide cu 2\. Y: C = 2 ≤ alpha = 5, deci restul lui Y se taie: Y va fi cel mult 2, iar S are deja 5, așa că S nu alege Y\. Y se închide cu ≤ 2\./);
  });
  it('a cut against a bound set higher up names the node that holds it', () => {
    const M = gameTree(far);
    expect(M.run.rootValue).toBe(M.rootValue);
    expect(M.rootValue).toBe(8);
    const k = M.frames.findIndex((f) => f.cut);
    const step = M.frames[k].steps.find((x) => x.cut);
    expect([step.node, step.v, step.alpha, step.origin, M.T.nodes.X.parent]).toEqual(['X', 3, 8, 'R', 'Z']);
    expect(M.caption(k).ro).toMatch(/X va fi cel mult 3, iar R are deja 8 pe altă ramură, așa că valoarea exactă a lui X nu mai contează\./);
    // then W's only leaf closes W, Z closes with 3 and Q (whose parent is R) cuts the leaf 2: two cuts, 10 and 2 not evaluated
    expect(leafValues(M, M.run.skipped)).toEqual([10, 2]);
    const last = M.frames.findIndex((f) => f.v === 1);
    expect([M.frames[last].last, M.answer(last)]).toEqual([true, 'cut']);
    expect(M.caption(last).ro).toMatch(/Q va fi cel mult 3, iar R are deja 8, așa că R nu alege Q\./);
  });
  it('a cut on a tie says the parent gains nothing', () => {
    const M = gameTree({ mode: 'alphabeta', root: 'MIN', tree: { id: 'S', children: [kids('A', 8), kids('B', 8, 1)] } });
    const k = M.frames.findIndex((f) => f.cut);
    expect(M.caption(k).ro).toMatch(/^B: 8 ≥ beta = 8, deci restul lui B se taie: B va fi cel puțin 8, iar S are deja 8, așa că S nu câștigă nimic alegând B\./);
  });
  it('alpha-beta always returns the minimax value (random trees, both root types)', () => {
    let seed = 7;
    const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
    let n = 0;
    const make = (depth, id) => {
      if (depth === 0) return { leaf: Math.floor(rnd() * 20) - 5 };
      const k = 1 + Math.floor(rnd() * 3);
      return { id: `${id}`, children: Array.from({ length: k }, (_, i) => make(depth - 1, `${id}${i}`)) };
    };
    for (let i = 0; i < 300; i += 1) {
      const depth = 1 + (i % 4);
      const tree = make(depth, 'n');
      for (const root of ['MIN', 'MAX']) {
        const T = buildTree({ root, tree });
        expect(alphaBetaRun(T).rootValue).toBe(minimaxValues(T)[T.root]);
        n += 1;
      }
    }
    expect(n).toBe(600);
  });
  it('rejects a tree without ids or with a bad mode', () => {
    expect(() => gameTree({ mode: 'alphabeta', root: 'MIN', tree: { children: [L(1)] } })).toThrow();
    expect(() => gameTree({ mode: 'nope', root: 'MIN', tree: kids('S', 1) })).toThrow();
  });
});

describe('game-tree minimax frames', () => {
  const M = gameTree({ ...course('MIN'), mode: 'minimax' });
  it('go bottom-up, left to right, and the picks are the children values', () => {
    expect(M.frames.slice(1).map((f) => [f.node, f.value])).toEqual([['A', 9], ['B', 8], ['C', 9], ['S', 8]]);
    expect(M.frames[1].options).toEqual([1, 5, 9]);
    expect(M.frames[4].options).toEqual([8, 9]);
    expect(M.pickSpec(1).items[0].options.map((o) => o.id)).toEqual([1, 5, 9]);
    expect(M.answer(4)).toBe(8);
  });
  it('asks nothing where there is nothing to choose (B has one child), and says so', () => {
    expect(M.pickSpec(2)).toBeNull();
    expect(M.answer(2)).toBeNull();
    expect(M.caption(2).ro).toBe('B = max(8) = 8: are un singur copil.');
    // two children with the same value leave nothing to choose either
    const same = gameTree({ mode: 'minimax', root: 'MAX', tree: kids('S', 4, 4) });
    expect(same.pickSpec(1)).toBeNull();
  });
  it('the reveal marks the child a node takes, and the root names it (c5 p.17: "= 8 (choice B)")', () => {
    expect(M.state(1, false).chosen).toEqual([]);
    expect(M.state(1, true).chosen).toEqual([['A', 'l3']]);
    expect(M.state(4, true).chosen).toContainEqual(['S', 'B']);
    expect(M.caption(4).ro).toBe('S = min(9, 8, 9) = 8: cea mai mică dintre copii. S alege B.');
    expect(M.caption(1).ro).toBe('A = max(1, 5, 9) = 9: cea mai mare dintre copii.');
  });
  it('a wrong pick starts with "Nu chiar"', () => {
    expect(M.caption(1, { picks: { v1: 5 } }).ro).toBe('Nu chiar (ai ales 5). A = max(1, 5, 9) = 9: cea mai mare dintre copii.');
  });
  it('names the root with its label', () => {
    const R = gameTree({ ...course('MIN'), mode: 'minimax', rootLabel: { en: 'us (AI)', ro: 'noi (AI)' } });
    expect(R.caption(0).ro).toMatch(/ Rădăcina S: noi \(AI\)\.$/);
  });
  it('writes the value inside the node only after the pick', () => {
    expect(M.state(1, false).nodes).toEqual({});
    expect(M.state(1, true).nodes.A.value).toBe(9);
    expect(M.state(4, true).nodes.S.value).toBe(8);
  });
});

describe('game-tree alpha-beta picks and state', () => {
  const M = gameTree(course('MIN'));
  it('the right pick is "tai restul" only at the leaf that cuts', () => {
    expect(M.frames.map((_, k) => M.answer(k))).toEqual([null, 'go', 'go', 'go', 'go', 'go', 'cut', null]);
  });
  it('greys the cut leaf and counts it only after the reveal', () => {
    expect(M.state(6, false).skipped).toEqual([]);
    const after = M.state(6, true);
    expect(after.skipped).toEqual(['l7']);
    expect(after.leaves.l7).toBe('skipped');
    expect(after.cuts).toEqual([{ node: 'C', from: 'l7', leaves: ['l7'] }]);
    expect(M.state(7).skipped).toEqual(['l7']);
  });
  it('shows [alpha, beta] on the open nodes only', () => {
    const s = M.state(5, false); // leaf 3 in C, nothing answered
    expect(Object.keys(s.bounds).sort()).toEqual(['C', 'S']);
    expect(s.bounds.C).toEqual([-Infinity, 8]);
    expect(s.bounds.S).toEqual([-Infinity, 8]);
    expect(s.nodes.A.value).toBe(9);
  });
  it('captions say what happened and a wrong pick is named', () => {
    expect(M.caption(6, { answered: true, picks: { c6: 'cut' } }).ro).toMatch(/9 ≥ beta = 8, deci restul lui C se taie/);
    expect(M.caption(6, { answered: true, picks: { c6: 'go' } }).ro).toMatch(/^Nu chiar \(ai ales „continui”\)/);
    expect(M.caption(7).ro).toBe('S = 8, ca la minimax. Frunze neevaluate: 1 din 7.');
  });
  it('the cut says why it is safe, and a node closed early is written with its limit', () => {
    expect(M.caption(6).ro).toBe('C: 9 ≥ beta = 8, deci restul lui C se taie: C va fi cel puțin 9, iar S are deja 8, așa că S nu alege C. C se închide cu ≥ 9. S: C ≥ 9 nu este ≤ alpha = −∞; beta rămâne 8. S se închide cu 8.');
    expect(M.caption(6).ro).toMatch(/S: C ≥ 9/);
    const X = gameTree(course('MAX'));
    const k = X.frames.findIndex((f) => f.cut);
    expect(X.caption(k).ro).toMatch(/^C: 3 ≤ alpha = 8, deci restul lui C se taie: C va fi cel mult 3, iar S are deja 8, așa că S nu alege C\. C se închide cu ≤ 3\. S: C ≤ 3 nu este/);
  });
  it('a leaf with siblings after it asks "continui / tai restul"; a last leaf asks about a cut higher up', () => {
    const ask = (k) => M.pickSpec(k).items[0];
    expect(ask(2).prompt.ro).toBe('Frunza 5 ajunge în A (MAX ▲), [alpha, beta] = [1, +∞]. Continui sau tai restul?');
    expect(ask(2).options.map((o) => o.label.ro)).toEqual(['continui', 'tai restul']);
    expect(ask(3).prompt.ro).toBe('Frunza 9 este ultima din A (MAX ▲). Se închide A: se taie ceva mai sus? Deasupra, [alpha, beta]: S (MIN ▼) [−∞, +∞].');
    expect(ask(4).prompt.ro).toBe('Frunza 8 este ultima din B (MAX ▲). Se închide B: se taie ceva mai sus? Deasupra, [alpha, beta]: S (MIN ▼) [−∞, 9].');
    expect(ask(4).options.map((o) => o.label.ro)).toEqual(['nu', 'da, se taie']);
    expect([3, 4].map((k) => M.answer(k))).toEqual(['go', 'go']);
    expect(M.caption(3, { picks: { c3: 'cut' } }).ro).toBe('Nu chiar (ai ales „da, se taie”). A: 9 nu este ≥ beta = +∞; alpha devine 9. A se închide cu 9. S: A = 9 nu este ≤ alpha = −∞; beta devine 9.');
  });
  it('validates as a viz block', () => {
    const block = { type: 'viz', id: 'x', widget: 'game-tree', predict: true, props: course('MIN') };
    expect(validateViz(block)).toEqual([]);
    expect(validateViz({ ...block, props: { ...block.props, mode: 'nope' } }).join(' ')).toMatch(/mode/);
    expect(validateViz({ ...block, props: { ...block.props, tree: { id: 'S', children: [] } } }).join(' ')).toMatch(/tree/);
  });
});

describe('game-tree drawing', () => {
  it('keeps the viewBox at most 336 wide (a 9-leaf tree is at most 360), so the text keeps its size on a phone', async () => {
    const { Stage } = await import('../../src/components/lesson/viz/widgets/GameTree.jsx');
    for (const props of [lesson, s30]) {
      const M = gameTree(props);
      expect(M.T.leaves).toHaveLength(9);
      const G = layoutOf(M.T);
      expect(G.W).toBeLessThanOrEqual(360);
      expect(G.W).toBe(336);
      expect(G.leafW).toBeLessThanOrEqual(G.slot - 4);
      const html = renderToStaticMarkup(React.createElement(Stage, { M, k: 0 }));
      const vb = html.match(/viewBox="(-?[\d.]+) 0 ([\d.]+) ([\d.]+)"/);
      expect(Number(vb[1])).toBe(0);
      expect(Number(vb[2])).toBeLessThanOrEqual(360);
    }
    const C = layoutOf(gameTree(course('MIN')).T);
    expect([C.W, C.vbX, C.vbW]).toEqual([336, 0, 336]);
  });
  it('widens the viewBox only as much as a node name or [alpha, beta] at the edge needs', () => {
    const G = layoutOf(gameTree(deep).T); // A sits over the first leaf alone, so its name would fall off the left edge
    expect(G.vbX).toBeLessThan(0);
    expect(G.px('A') - 31 - 9 - G.vbX).toBeGreaterThan(0);
    expect(G.vbW).toBeLessThanOrEqual(360);
  });
  it('draws the edge to the child a revealed minimax node takes', async () => {
    const { Stage } = await import('../../src/components/lesson/viz/widgets/GameTree.jsx');
    const M = gameTree({ ...course('MIN'), mode: 'minimax' });
    expect(renderToStaticMarkup(React.createElement(Stage, { M, k: 1, answered: false }))).not.toContain('data-mark="pick"');
    const html = renderToStaticMarkup(React.createElement(Stage, { M, k: 4 }));
    expect((html.match(/data-mark="pick"/g) || []).length).toBe(4); // A-9, B-8, C-9 and S-B
  });
  it('draws every number of every caption and the cut leaf greyed (both modes, every frame)', async () => {
    const { Stage } = await import('../../src/components/lesson/viz/widgets/GameTree.jsx');
    for (const props of [course('MIN'), course('MAX'), lesson, s30, deep, far, { ...course('MIN'), mode: 'minimax' }]) {
      const M = gameTree(props);
      for (let k = 0; k < M.count; k += 1) {
        for (const answered of [false, true]) {
          if (!answered && M.frames[k].kind !== 'leaf' && M.frames[k].kind !== 'node') continue;
          const html = renderToStaticMarkup(React.createElement(Stage, { M, k, answered }));
          expectCaptionDrawn(expect, M.caption(k, { answered }), html, `${props.mode}/${props.root} frame ${k} answered=${answered}`);
        }
      }
    }
  });
  it('marks skipped leaves, the slash and the count at the end', async () => {
    const { Stage } = await import('../../src/components/lesson/viz/widgets/GameTree.jsx');
    const M = gameTree(course('MAX'));
    const html = renderToStaticMarkup(React.createElement(Stage, { M, k: M.count - 1 }));
    expect((html.match(/data-leaf="skipped"/g) || []).length).toBe(2);
    expect(html).toContain('data-mark="slash"');
    expect(html).toMatch(/data-mark="skipped" data-value="2"/);
  });
  it('the widget renders its first frame with the rules', async () => {
    const GameTree = (await import('../../src/components/lesson/viz/widgets/GameTree.jsx')).default;
    const html = renderToStaticMarkup(React.createElement(GameTree, { props: course('MIN'), predict: true }));
    expect(html).toContain('data-widget="game-tree"');
    expect(html).toContain('[−∞, +∞]');
  });
});
