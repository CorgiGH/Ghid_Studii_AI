import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { mlCvloo, foldNote } from '../../src/components/lesson/viz/logic/ml/cvloo.js';
import { cvlooId3, trainErrId3, id3Tests } from '../../src/ml/calc/mathKit.js';
import { grow, countTests } from '../../src/components/lesson/viz/logic/ml/tree-grow.js';
import { validateViz } from '../../src/components/lesson/viz/vizSpec.js';

vi.mock('../../src/contexts/AppContext', () => ({ useApp: () => ({ t: (en, ro) => ro, lang: 'ro' }) }));
vi.mock('../../src/lesson/useLessonStore', () => ({ useLessonStore: () => null, getLessonStore: () => null }));
vi.mock('motion/react', async (orig) => ({ ...(await orig()), useReducedMotion: () => true }));

// T21T2 5: the three rows of the L15 worked example
const THREE = { columns: ['A', 'B', 'Y'], rows: [[0, 0, 0], [1, 0, 1], [1, 1, 1]] };
// E 4.10: ten points on an axis, one noisy (8.5)
const P410 = { columns: ['X', 'Y'], rows: [[1, 0], [2, 0], [3, 0], [4, 0], [6, 1], [7, 1], [8, 1], [8.5, 0], [9, 1], [10, 1]] };
// Q2 of the lesson: repeated rows count as separate examples
const Q2 = { columns: ['A', 'B', 'Y'], rows: [[0, 0, 0], [0, 0, 0], [0, 1, 0], [1, 0, 1]] };

describe('ml-cvloo on the three rows (T21T2 5)', () => {
  const W = mlCvloo({ table: THREE, target: 'Y', tie: 'class0' });
  it('training error 0, CVLOO 1/3', () => {
    expect(W.trainErr).toBe(0);
    expect(W.errors).toBe(1);
    expect(W.frames.length).toBe(5);
    expect(W.frames[0].trainErr).toBe(0);
  });
  it('row 1 out: a single leaf 1, wrong; row 2 out: A first on the tie, right; row 3 out: right', () => {
    const [f1, f2, f3] = W.frames.slice(1, 4);
    expect(f1.tree.leaf).toBe(true);
    expect(f1.pred).toBe(1);
    expect(f1.truth).toBe(0);
    expect(f1.wrong).toBe(true);
    expect(f2.tree.test.attr).toBe('A');
    expect(f2.pred).toBe(1);
    expect(f2.wrong).toBe(false);
    expect(f3.tree.test.attr).toBe('A');
    expect(f3.wrong).toBe(false);
    expect([f1, f2, f3].map((f) => f.errAfter)).toEqual([1, 1, 1]);
    expect([f1, f2, f3].map((f) => f.errBefore)).toEqual([0, 1, 1]);
  });
  it('the end frame warns that the other column order gives 2/3', () => {
    const e = W.frames[4];
    expect(e.kind).toBe('end');
    expect(e.errors).toBe(1);
    expect(e.alt).toBe(2);
    expect(e.caption.en).toContain('CVLOO error: 1/3');
    expect(e.caption.en).toContain('2/3');
    expect(e.wrongRows).toEqual([1]);
  });
  it('the question frame does not give the verdict away', () => {
    const f = W.frames[1];
    expect(f.askCaption.en).not.toMatch(/wrong|right|predicts|Errors so far/);
    expect(f.askCaption.en).toContain('(A = 0, B = 0)');
    expect(f.caption.en).toContain('predicts 1');
    expect(f.caption.en).toContain('Errors so far: 1 of 1');
  });
});

describe('ml-cvloo on E 4.10 (the thresholds move)', () => {
  const W = mlCvloo({ table: P410, target: 'Y', tie: 'class0', continuous: ['X'] });
  it('training error 0 and CVLOO 3/10: the points X = 8, 8.5, 9 are wrong', () => {
    expect(W.trainErr).toBe(0);
    expect(W.errors).toBe(3);
    expect(W.wrongRows).toEqual([7, 8, 9]);
    expect(W.single).toBe('X');
  });
  it('taking out X = 4, 6, 8 and 9 moves the cut to 4.5, 5.5, 7.75 and 9.25', () => {
    const f = (k) => W.frames[k];
    expect(f(4).thresholds.map((c) => c.th)).toContain(4.5);
    expect(f(5).thresholds.map((c) => c.th)).toContain(5.5);
    expect(f(7).thresholds.map((c) => c.th)).toContain(7.75);
    expect(f(9).thresholds.map((c) => c.th)).toContain(9.25);
    expect(f(1).thresholds.map((c) => c.th)).toContain(5);
  });
});

describe('ml-cvloo: Q2 with repeated rows', () => {
  it('CVLOO 1/4 with four tries, not three', () => {
    const W = mlCvloo({ table: Q2, target: 'Y', tie: 'class0' });
    expect(W.errors).toBe(1);
    expect(W.frames.length).toBe(6);
    expect(W.wrongRows).toEqual([4]);
  });
});

describe('ml-cvloo agrees with the ML math kit', () => {
  let seed = 7;
  const rnd = (n) => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % n; };
  it('random discrete and continuous tables give the kit CVLOO, training error and test count', () => {
    for (let c = 0; c < 40; c++) {
      const cont = c % 2 === 1;
      const n = 5 + rnd(6);
      const rows = Array.from({ length: n }, () => (cont ? [rnd(9) + (rnd(2) ? 0.5 : 0), rnd(4), rnd(2)] : [rnd(3), rnd(2), rnd(2)]));
      const table = { columns: ['P1', 'P2', 'Y'], rows };
      const continuous = cont ? ['P1'] : [];
      const tie = c % 3 === 0 ? 'class1' : 'class0';
      const W = mlCvloo({ table, target: 'Y', tie, continuous });
      const o = { continuous, tie };
      expect(W.errors, `case ${c} cvloo`).toBe(cvlooId3(table, 'Y', o));
      expect(W.trainErr, `case ${c} train`).toBe(trainErrId3(table, 'Y', o));
      expect(countTests(grow(table, 'Y', o).tree), `case ${c} tests`).toBe(id3Tests(table, 'Y', o));
    }
  });
  it('the other-order count equals the kit on the table with its attribute columns reversed', () => {
    const table = { columns: ['A', 'B', 'Y'], rows: [[0, 0, 0], [1, 0, 1], [1, 1, 1]] };
    const flipped = { columns: ['B', 'A', 'Y'], rows: table.rows.map(([a, b, y]) => [b, a, y]) };
    expect(mlCvloo({ table, target: 'Y', tie: 'class0' }).alt).toBe(cvlooId3(flipped, 'Y', { tie: 'class0' }));
  });
});

describe('foldNote', () => {
  const W = mlCvloo({ table: THREE, target: 'Y', tie: 'class0' });
  it('says whether the pick matches the tree', () => {
    expect(foldNote(W.frames[1], 1).en).toBe('You predicted 1: the same as the tree.');
    expect(foldNote(W.frames[1], 0).en).toBe('You predicted 0; the tree says 1.');
    expect(foldNote(W.frames[1], null)).toBeNull();
    expect(foldNote(W.frames[0], 1)).toBeNull();
  });
});

describe('validateViz for ml-cvloo', () => {
  const ok = { id: 'v1', widget: 'ml-cvloo', predict: true, props: { table: THREE, target: 'Y', tie: 'class0' } };
  it('accepts the outline props and a continuous list', () => {
    expect(validateViz(ok)).toEqual([]);
    expect(validateViz({ ...ok, props: { table: P410, target: 'Y', tie: 'class0', continuous: ['X'] } })).toEqual([]);
  });
  it('rejects a missing prop, a column that is not there and a non-numeric continuous column', () => {
    for (const k of ['table', 'target', 'tie']) {
      const props = { ...ok.props }; delete props[k];
      expect(validateViz({ ...ok, props }).join(' ')).toContain(`props.${k}`);
    }
    expect(validateViz({ ...ok, props: { ...ok.props, target: 'Nope' } }).join(' ')).toContain('Nope');
    expect(validateViz({ ...ok, props: { ...ok.props, continuous: ['Nope'] } }).join(' ')).toContain('Nope');
    expect(validateViz({ ...ok, props: { table: { columns: ['X', 'Y'], rows: [['a', 0]] }, target: 'Y', tie: 'class0', continuous: ['X'] } }).join(' ')).toContain('must hold numbers');
  });
});

const numbers = (str) => (String(str).match(/-?\d+(?:\.\d+)?/g) || []).map((x) => String(Number(x)));
const marks = (html) => {
  const out = new Set();
  for (const m of html.matchAll(/data-value="([^"]*)"/g)) for (const n of numbers(m[1])) out.add(n);
  return out;
};

describe('ml-cvloo: the caption matches the picture (every frame)', async () => {
  const { Stage } = await import('../../src/components/lesson/viz/widgets/ml/CvLoo.jsx');
  const cases = {
    three: [THREE, { tie: 'class0' }],
    p410: [P410, { tie: 'class0', continuous: ['X'] }],
    q2: [Q2, { tie: 'class0' }],
  };
  for (const [name, [table, extra]] of Object.entries(cases)) {
    const W = mlCvloo({ table, target: 'Y', ...extra });
    it(`${name}: every number of both captions is a data-value of that frame`, () => {
      W.frames.forEach((f, k) => {
        const have = marks(renderToStaticMarkup(React.createElement(Stage, { W, table, frame: f, revealed: true })));
        for (const lang of ['en', 'ro']) {
          for (const nr of numbers(f.caption[lang])) expect(have.has(nr), `${name} frame ${k} ${lang}: ${nr} in "${f.caption[lang]}"`).toBe(true);
        }
        if (f.kind === 'fold') {
          const ask = marks(renderToStaticMarkup(React.createElement(Stage, { W, table, frame: f, revealed: false })));
          for (const lang of ['en', 'ro']) for (const nr of numbers(f.askCaption[lang])) expect(ask.has(nr), `${name} ask ${k} ${lang}: ${nr}`).toBe(true);
        }
      });
    });
  }
  it('before the pick the verdict and the new error count are not drawn', () => {
    const W = mlCvloo({ table: THREE, target: 'Y', tie: 'class0' });
    const asking = renderToStaticMarkup(React.createElement(Stage, { W, table: THREE, frame: W.frames[1], revealed: false }));
    expect(asking).not.toContain('data-mark="verdict"');
    expect(asking).toContain('data-mark="errors" data-value="0"');
    expect(asking).toContain('mlw4-chip');
    const shown = renderToStaticMarkup(React.createElement(Stage, { W, table: THREE, frame: W.frames[1], revealed: true }));
    expect(shown).toContain('data-mark="verdict" data-value="wrong"');
    expect(shown).toContain('data-mark="errors" data-value="1"');
    expect(shown).toContain('data-mark="pred" data-value="1"');
    expect(shown).toContain('data-mark="truth" data-value="0"');
  });
  it('the removed row is marked in the table and on the axis', () => {
    const W = mlCvloo({ table: P410, target: 'Y', tie: 'class0', continuous: ['X'] });
    const html = renderToStaticMarkup(React.createElement(Stage, { W, table: P410, frame: W.frames[8], revealed: true }));
    expect((html.match(/data-out="true"/g) || []).length).toBe(2);
    expect(html).not.toMatch(/#[0-9a-f]{3,8}\b|rgb\(|hsl\(/i);
  });
});

describe('ml-cvloo component', () => {
  it('renders the first frame with predict and without', async () => {
    const { default: CvLoo } = await import('../../src/components/lesson/viz/widgets/ml/CvLoo.jsx');
    const html = renderToStaticMarkup(React.createElement(CvLoo, { props: { table: THREE, target: 'Y', tie: 'class0' }, predict: true }));
    expect(html).toContain('data-widget="ml-cvloo"');
    expect(html).toContain('data-mark="train" data-value="0"');
    expect(html).not.toContain('data-mark="verdict"');
  });
  it('the end state shows the CVLOO count and the training count side by side', async () => {
    const { Stage } = await import('../../src/components/lesson/viz/widgets/ml/CvLoo.jsx');
    const W = mlCvloo({ table: THREE, target: 'Y', tie: 'class0' });
    const html = renderToStaticMarkup(React.createElement(Stage, { W, table: THREE, frame: W.frames[W.frames.length - 1] }));
    expect(html).toContain('data-mark="cvloo" data-value="1"');
    expect(html).toContain('data-mark="train" data-value="0"');
    expect(html).toContain('data-mark="alt" data-value="2"');
  });
});
