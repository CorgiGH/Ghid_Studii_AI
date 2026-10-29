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

describe('review fixes', () => {
  it('one wrong row is singular in both languages', () => {
    const W = mlCvloo({ table: THREE, target: 'Y', tie: 'class0' });
    const end = W.frames[W.frames.length - 1];
    expect(end.caption.en).toContain('(row 1 is predicted wrong)');
    expect(end.caption.ro).toContain('(rândul 1 e prezis greșit)');
  });
  it('with one continuous attribute the wrong rows also give their value (4.10: X = 8, 8.5, 9)', () => {
    const W = mlCvloo({ table: P410, target: 'Y', tie: 'class0', continuous: ['X'] });
    const end = W.frames[W.frames.length - 1];
    expect(end.caption.en).toContain('(rows 7 (X = 8), 8 (X = 8.5) and 9 (X = 9) are predicted wrong)');
    expect(end.caption.ro).toContain('(rândurile 7 (X = 8), 8 (X = 8.5) și 9 (X = 9) sunt prezise greșit)');
  });
  it('the table box scrolls the left-out row into view (it marks the row it scrolls to)', async () => {
    const { Stage } = await import('../../src/components/lesson/viz/widgets/ml/CvLoo.jsx');
    const W = mlCvloo({ table: P410, target: 'Y', tie: 'class0', continuous: ['X'] });
    const html = renderToStaticMarkup(React.createElement(Stage, { W, table: P410, frame: W.frames[8] }));
    expect(html).toContain('data-scroll-to="out"');
  });
});

describe('second review', () => {
  it('the class legend shows only where points are drawn (the axis of 4.10), not under a plain table', async () => {
    const { Stage } = await import('../../src/components/lesson/viz/widgets/ml/CvLoo.jsx');
    const three = mlCvloo({ table: THREE, target: 'Y', tie: 'class0' });
    expect(renderToStaticMarkup(React.createElement(Stage, { W: three, table: THREE, frame: three.frames[1] }))).not.toContain('mlw4-legend');
    const p = mlCvloo({ table: P410, target: 'Y', tie: 'class0', continuous: ['X'] });
    expect(renderToStaticMarkup(React.createElement(Stage, { W: p, table: P410, frame: p.frames[1] }))).toContain('mlw4-legend');
  });
  it('the left-out row stays readable: marked, not struck through (the learner reads its values to predict)', async () => {
    const { readFileSync } = await import('node:fs');
    const css = readFileSync(new URL('../../src/components/lesson/viz/widgets/ml/ml-w4.css', import.meta.url), 'utf8');
    const rule = css.match(/\.mlw4-row-out td \{([^}]*)\}/)[1];
    expect(rule).not.toContain('line-through');
    expect(rule).toContain('font-weight: 700');
  });
});

describe('second review: the tie prop', () => {
  const v = (tie) => validateViz({ id: 'v1', widget: 'ml-cvloo', predict: true, props: { table: THREE, target: 'Y', tie } });
  it('names the leaf tie rule (class0, class1 or a label of the target); an attribute name is rejected, the table order rules attribute ties', () => {
    expect(v('class0')).toEqual([]);
    expect(v('class1')).toEqual([]);
    expect(v('1')).toEqual([]);
    expect(v('A').join(' ')).toContain('props.tie');
    expect(v('A').join(' ')).toContain('column order');
  });
});

describe('third review', () => {
  const W3 = mlCvloo({ table: THREE, target: 'Y', tie: 'class0' });
  const P = mlCvloo({ table: P410, target: 'Y', tie: 'class0', continuous: ['X'] });
  it('the fold decided by a tie between attributes says so (outline L15 C4: IG(A) = IG(B) = 1, the first column wins)', () => {
    const f2 = W3.frames[2];
    expect(f2.ties.map((x) => [x.names, Number(x.ig.toFixed(6))])).toEqual([[['A', 'B'], 1]]);
    for (const c of [f2.askCaption, f2.caption]) {
      expect(c.ro).toContain('A și B au același IG, 1; la egalitate se ia prima coloană din tabel: A.');
      expect(c.en).toContain('A and B have the same IG, 1; a tie goes to the first column of the table: A.');
    }
    for (const k of [1, 3]) {
      expect(W3.frames[k].ties).toEqual([]);
      expect(W3.frames[k].caption.ro).not.toContain('același IG');
      expect(W3.frames[k].askCaption.ro).not.toContain('același IG');
    }
  });
  it('the refit tree draws the IG of each test, so the tie can be read on it', async () => {
    const { Stage } = await import('../../src/components/lesson/viz/widgets/ml/CvLoo.jsx');
    const asking = renderToStaticMarkup(React.createElement(Stage, { W: W3, table: THREE, frame: W3.frames[2], revealed: false }));
    expect(asking).toContain('data-mark="ig" data-value="1"');
    const p = renderToStaticMarkup(React.createElement(Stage, { W: P, table: P410, frame: P.frames[1] }));
    expect([...p.matchAll(/data-mark="ig" data-value="([^"]*)"/g)].length).toBe(3);
  });
  it('a tie between two thresholds of one attribute names the smaller threshold', () => {
    // X: 1 -> 0, 2 -> 1, 3 -> 0 (out: none): the thresholds 1.5 and 2.5 have the same IG
    const T = { columns: ['X', 'Y'], rows: [[1, 0], [2, 1], [3, 0], [9, 1]] };
    const W = mlCvloo({ table: T, target: 'Y', tie: 'class0', continuous: ['X'] });
    const f = W.frames.find((x) => x.kind === 'fold' && x.ties.length);
    expect(f).toBeDefined();
    expect(f.caption.ro).toMatch(/au același IG, [\d.]+; la egalitate se ia pragul mai mic: X ≤ [\d.]+\./);
    expect(f.caption.en).toMatch(/have the same IG, [\d.]+; a tie goes to the smaller threshold: X ≤ [\d.]+\./);
  });
  it('the Romanian speaks of training ID3 / the learnt tree (outline L15 C2, 4.40), not of growing it', () => {
    for (const W of [W3, P]) for (const f of W.frames) for (const c of [f.caption, f.askCaption].filter(Boolean)) expect(c.ro).not.toMatch(/crescut|crește/);
    expect(W3.frames[0].caption.ro).toContain('antrenează ID3 pe celelalte 2 rânduri');
    expect(W3.frames[1].caption.ro).toContain('arborele învățat pe celelalte 2 rânduri');
  });
  it('threshold labels on the axis never overlap: with row 10 out of 4.10 the cuts 8.25 and 8.75 sit on two rows', async () => {
    const { Stage } = await import('../../src/components/lesson/viz/widgets/ml/CvLoo.jsx');
    const html = renderToStaticMarkup(React.createElement(Stage, { W: P, table: P410, frame: P.frames[10] }));
    const labels = [...html.matchAll(/<text [^>]*data-mark="cut-label"[^>]*>/g)].map((m) => ({ x: Number(/ x="([^"]+)"/.exec(m[0])[1]), y: Number(/ y="([^"]+)"/.exec(m[0])[1]), v: /data-value="([^"]+)"/.exec(m[0])[1] }));
    expect(labels.map((l) => l.v)).toEqual(['5', '8.25', '8.75']);
    for (let i = 0; i < labels.length; i++) for (let j = i + 1; j < labels.length; j++) {
      const [a, b] = [labels[i], labels[j]];
      expect(Math.abs(a.x - b.x) >= 30 || a.y !== b.y, `${a.v} and ${b.v} overlap`).toBe(true);
    }
  });
});
