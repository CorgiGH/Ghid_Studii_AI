import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { mlPrune, epsChoices, removedTopDown, removedBottomUp } from '../../src/components/lesson/viz/logic/ml/prune.js';
import { validateViz } from '../../src/components/lesson/viz/vizSpec.js';

vi.mock('../../src/contexts/AppContext', () => ({ useApp: () => ({ t: (en, ro) => ro, lang: 'ro' }) }));
vi.mock('../../src/lesson/useLessonStore', () => ({ useLessonStore: () => null, getLessonStore: () => null }));
vi.mock('motion/react', async (orig) => ({ ...(await orig()), useReducedMotion: () => true }));

const leaf = (l) => ({ leaf: l });
// T21T2 10: the tree of the worked example; the exercise states the IG of each test and gives no data
const T21 = {
  tree: {
    attr: 'B', ig: 0.3,
    kids: {
      0: { attr: 'A', ig: 0.01, kids: { 0: leaf(0), 1: leaf(1) } },
      1: { attr: 'A', ig: 0.02, kids: { 0: { attr: 'C', ig: 0.9, kids: { 0: leaf(0), 1: leaf(1) } }, 1: leaf(1) } },
    },
  },
  epsilon: 0.03,
};
// E 4.19: five rows and the ID3 tree; every IG is computed from the rows
const D419 = { columns: ['V', 'W', 'X', 'Y'], rows: [[0, 0, 0, 0], [0, 1, 0, 1], [1, 0, 0, 1], [1, 1, 0, 0], [1, 1, 1, 1]] };
const E419 = {
  table: D419, target: 'Y', epsilon: 0.0001,
  tree: {
    attr: 'X',
    kids: {
      0: { attr: 'V', kids: { 0: { attr: 'W', kids: { 0: leaf(0), 1: leaf(1) } }, 1: { attr: 'W', kids: { 0: leaf(1), 1: leaf(0) } } } },
      1: leaf(1),
    },
  },
};
// E 4.54: PlayTennis and its ID3 tree
const PT = {
  columns: ['Day', 'Outlook', 'Temperature', 'Humidity', 'Wind', 'Play'],
  ignore: ['Day'],
  rows: [
    ['D1', 'Sunny', 'Hot', 'High', 'Weak', 'No'], ['D2', 'Sunny', 'Hot', 'High', 'Strong', 'No'], ['D3', 'Overcast', 'Hot', 'High', 'Weak', 'Yes'],
    ['D4', 'Rain', 'Mild', 'High', 'Weak', 'Yes'], ['D5', 'Rain', 'Cool', 'Normal', 'Weak', 'Yes'], ['D6', 'Rain', 'Cool', 'Normal', 'Strong', 'No'],
    ['D7', 'Overcast', 'Cool', 'Normal', 'Strong', 'Yes'], ['D8', 'Sunny', 'Mild', 'High', 'Weak', 'No'], ['D9', 'Sunny', 'Cool', 'Normal', 'Weak', 'Yes'],
    ['D10', 'Rain', 'Mild', 'Normal', 'Weak', 'Yes'], ['D11', 'Sunny', 'Mild', 'Normal', 'Strong', 'Yes'], ['D12', 'Overcast', 'Mild', 'High', 'Strong', 'Yes'],
    ['D13', 'Overcast', 'Hot', 'Normal', 'Weak', 'Yes'], ['D14', 'Rain', 'Mild', 'High', 'Strong', 'No'],
  ],
};
const E454 = {
  table: PT, target: 'Play', epsilon: 0.3,
  tree: {
    attr: 'Outlook',
    kids: {
      Sunny: { attr: 'Humidity', kids: { High: leaf('No'), Normal: leaf('Yes') } },
      Overcast: leaf('Yes'),
      Rain: { attr: 'Wind', kids: { Strong: leaf('No'), Weak: leaf('Yes') } },
    },
  },
};

const close = (a, b) => expect(a).toBeCloseTo(b, 3);
const node = (P, attr, conds) => P.A.nodes.find((n) => !n.leaf && n.attr === attr && n.conds.map((c) => `${c.attr}=${c.value}`).join(',') === conds);

describe('ml-prune on the worked example (T21T2 10)', () => {
  const P = mlPrune(T21);
  it('uses the IG the exercise gives and counts four tests', () => {
    expect(P.nTests).toBe(4);
    expect(P.hasTable).toBe(false);
    expect(P.A.nodes.filter((n) => !n.leaf).map((n) => n.ig)).toEqual([0.3, 0.01, 0.02, 0.9]);
    expect(P.frames.map((f) => f.kind)).toEqual(['setup', 'topdown', 'bottomup', 'compare']);
  });
  it('top-down: both A nodes go, the lower one with C below it; B stays with two empty leaves', () => {
    const f = P.frames[1];
    const cut = P.A.nodes.filter((n) => f.status[n.id] === 'cut').map((n) => `${n.attr}:${n.conds.map((c) => c.value).join('')}`);
    expect(cut).toEqual(['A:0', 'A:1']);
    expect(P.A.nodes.filter((n) => !n.leaf && f.status[n.id] === 'gone').map((n) => n.attr)).toEqual(['C']);
    expect(f.tests).toBe(1);
    expect(Object.values(f.cutLabels)).toEqual(['?', '?']);
    expect(f.err).toBeNull();
    expect(f.caption.en).toContain('A (B = 1), IG 0.02, with C below it');
    expect(f.caption.en).toContain('1 of 4 tests remain');
  });
  it('bottom-up: only the left A goes; the right A stays because C below it has IG 0.9', () => {
    const f = P.frames[2];
    expect(P.A.nodes.filter((n) => f.status[n.id] === 'cut').map((n) => n.conds.map((c) => c.value).join(''))).toEqual(['0']);
    expect(f.tests).toBe(3);
    expect(f.keptLow.length).toBe(1);
    expect(f.keptLow[0].node.conds[0].value).toBe('1');
    expect(f.keptLow[0].witness.attr).toBe('C');
    expect(f.caption.en).toContain('A (B = 1), IG 0.02 (the test C below it has IG 0.9)');
  });
  it('the comparison names what only bottom-up keeps', () => {
    const f = P.frames[3];
    expect(f.tdTests).toBe(1);
    expect(f.buTests).toBe(3);
    expect(f.same).toBe(false);
    expect(f.caption.en).toContain('Only bottom-up keeps A (B = 1), IG 0.02 and C (B = 1, A = 0), IG 0.9');
    expect(f.rows.map((r) => [r.td, r.bu])).toEqual([[true, true], [false, false], [false, true], [false, true]]);
  });
  it('a bigger or smaller epsilon changes the answer', () => {
    expect(epsChoices(T21)).toEqual([0.01, 0.02, 0.03, 0.3, 0.9]);
    const big = mlPrune({ ...T21, epsilon: 0.95 });
    expect(big.frames[1].tests).toBe(0);
    expect(big.frames[2].tests).toBe(0);
    const small = mlPrune({ ...T21, epsilon: 0.005 });
    expect(small.frames[1].tests).toBe(4);
    expect(small.frames[1].caption.en).toContain('Nothing is cut');
    expect(small.frames[3].same).toBe(true);
  });
});

describe('ml-prune on E 4.19 (IG computed from the rows)', () => {
  const P = mlPrune(E419);
  it('IG(X) = 0.1710, IG(V) = 0, IG(W) = 1 twice', () => {
    expect(P.hasTable).toBe(true);
    const igs = P.A.nodes.filter((n) => !n.leaf).map((n) => [n.attr, n.ig]);
    expect(igs.map((x) => x[0])).toEqual(['X', 'V', 'W', 'W']);
    close(igs[0][1], 0.171);
    close(igs[1][1], 0);
    close(igs[2][1], 1);
    close(igs[3][1], 1);
    expect(P.A.nodes[0].counts).toEqual([3, 2]);
  });
  it('top-down cuts V and leaves X with training error 2/5', () => {
    const f = P.frames[1];
    expect(f.tests).toBe(1);
    expect(f.err).toBe(2);
    expect(f.caption.en).toContain('Training error 2/5');
    expect(f.caption.en).toContain('equal counts takes the smaller label (0)');
    expect(Object.values(f.cutLabels)).toEqual([0]);
  });
  it('bottom-up cuts nothing: V stays because W below it has IG 1; error 0', () => {
    const f = P.frames[2];
    expect(f.tests).toBe(4);
    expect(f.err).toBe(0);
    expect(f.keptLow.map((k) => k.node.attr)).toEqual(['V']);
    expect(f.caption.en).toContain('Nothing is cut');
    expect(f.caption.en).toContain('Kept although IG < ε: V (X = 0), IG 0 (the test W below it has IG 1)');
  });
  it('the comparison gives both training errors', () => {
    const f = P.frames[3];
    expect([f.eTD, f.eBU]).toEqual([2, 0]);
    expect(f.caption.en).toContain('Training error: top-down 2/5, bottom-up 0/5');
  });
});

describe('ml-prune on PlayTennis (E 4.54 tree, epsilon 0.3)', () => {
  const P = mlPrune(E454);
  it('computes the IG of each test from the rows that reach it', () => {
    close(node(P, 'Outlook', '').ig, 0.2467);
    close(node(P, 'Humidity', 'Outlook=Sunny').ig, 0.971);
    close(node(P, 'Wind', 'Outlook=Rain').ig, 0.971);
    expect(node(P, 'Outlook', '').counts).toEqual([9, 5]);
  });
  it('top-down cuts the root (IG below epsilon); bottom-up keeps it because of the nodes below', () => {
    expect(P.frames[1].tests).toBe(0);
    expect(P.frames[1].err).toBe(5);
    expect(P.frames[2].tests).toBe(3);
    expect(P.frames[2].err).toBe(0);
    expect(removedTopDown(P.A, 0.3).size).toBe(1);
    expect(removedBottomUp(P.A, 0.3).size).toBe(0);
  });
});

describe('validateViz for ml-prune', () => {
  const ok = { id: 'v1', widget: 'ml-prune', predict: true, props: T21 };
  it('accepts the worked example (no table) and the exercise (table)', () => {
    expect(validateViz(ok)).toEqual([]);
    expect(validateViz({ ...ok, props: E419 })).toEqual([]);
    expect(validateViz({ ...ok, props: E454 })).toEqual([]);
  });
  it('rejects a missing tree or epsilon, a test without ig and without data, and a column that is not there', () => {
    for (const k of ['tree', 'epsilon']) {
      const props = { ...T21 }; delete props[k];
      expect(validateViz({ ...ok, props }).join(' ')).toContain(`props.${k}`);
    }
    const noIg = { tree: { attr: 'B', kids: { 0: leaf(0), 1: leaf(1) } }, epsilon: 0.1 };
    expect(validateViz({ ...ok, props: noIg }).join(' ')).toContain('without ig');
    expect(validateViz({ ...ok, props: { ...E419, tree: { attr: 'Nope', kids: { 0: leaf(0) } } } }).join(' ')).toContain('Nope');
    expect(validateViz({ ...ok, props: { ...E419, target: undefined } }).join(' ')).toContain('go together');
    expect(validateViz({ ...ok, props: { ...T21, tree: { attr: 'B', kids: {} } } }).join(' ')).toContain('props.tree');
  });
});

const numbers = (str) => (String(str).match(/-?\d+(?:\.\d+)?/g) || []).map((x) => String(Number(x)));
const marks = (html) => {
  const out = new Set();
  for (const m of html.matchAll(/data-value="([^"]*)"/g)) for (const n of numbers(m[1])) out.add(n);
  return out;
};

describe('ml-prune: the caption matches the picture (every frame)', async () => {
  const { Stage } = await import('../../src/components/lesson/viz/widgets/ml/Prune.jsx');
  const cases = { t21: T21, e419: E419, e454: E454, bigEps: { ...T21, epsilon: 0.95 } };
  for (const [name, props] of Object.entries(cases)) {
    it(`${name}: every number of both captions is a data-value of that frame`, () => {
      const P = mlPrune(props);
      P.frames.forEach((f, k) => {
        const have = marks(renderToStaticMarkup(React.createElement(Stage, { P, frame: f, choices: epsChoices(props) })));
        for (const lang of ['en', 'ro']) {
          for (const nr of numbers(f.caption[lang])) expect(have.has(nr), `${name} frame ${k} (${f.kind}) ${lang}: ${nr} in "${f.caption[lang]}"`).toBe(true);
        }
      });
    });
  }
  it('cut nodes carry a word as well as a style, and removed nodes are struck', () => {
    const P = mlPrune(T21);
    const html = renderToStaticMarkup(React.createElement(Stage, { P, frame: P.frames[1] }));
    expect(html).toContain('data-status="cut"');
    expect(html).toContain('data-status="gone"');
    expect(html).toContain('tăiat');
    expect(html).toContain('eliminat');
    expect(html).not.toMatch(/#[0-9a-f]{3,8}\b|rgb\(|hsl\(/i);
  });
  it('the setup frame draws every IG and no verdict', () => {
    const P = mlPrune(T21);
    const html = renderToStaticMarkup(React.createElement(Stage, { P, frame: P.frames[0] }));
    expect([...html.matchAll(/data-mark="ig" data-value="([^"]*)"/g)].map((m) => m[1])).toEqual(['0.3', '0.01', '0.02', '0.9']);
    expect(html).not.toContain('data-status');
  });
});

describe('ml-prune component', () => {
  it('renders the asking frame with predict: Show me, no result yet', async () => {
    const { default: Prune } = await import('../../src/components/lesson/viz/widgets/ml/Prune.jsx');
    const html = renderToStaticMarkup(React.createElement(Prune, { props: T21, predict: true }));
    expect(html).toContain('data-widget="ml-prune"');
    expect(html).toContain('Arată-mi');
    expect(html).not.toContain('data-status');
  });
  it('the end state with reduced motion is the comparison with both counts', async () => {
    const { Stage } = await import('../../src/components/lesson/viz/widgets/ml/Prune.jsx');
    const P = mlPrune(T21);
    const html = renderToStaticMarkup(React.createElement(Stage, { P, frame: P.frames[3], choices: epsChoices(T21) }));
    expect(html).toContain('data-mark="td" data-value="1"');
    expect(html).toContain('data-mark="bu" data-value="3"');
    expect(html).toContain('data-mark="eps" data-value="0.9"');
  });
});

describe('review fixes', () => {
  const P = mlPrune(T21);
  const Q = mlPrune(E419);
  it('the Romanian uses the lesson terms top-down and bottom-up (outline L16), not a fresh translation', () => {
    for (const f of [...P.frames, ...Q.frames]) {
      expect(f.caption.ro).not.toMatch(/[Dd]e sus în jos|[Dd]e jos în sus|sus-jos|jos-sus/);
    }
    expect(P.frames[1].caption.ro).toMatch(/^Top-down: /);
    expect(P.frames[2].caption.ro).toMatch(/^Bottom-up: /);
    expect(P.frames[3].caption.ro).toContain('Top-down păstrează 1 din 4 teste, bottom-up 3.');
    expect(Q.frames[3].caption.ro).toContain('Eroarea la antrenare: top-down 2/5, bottom-up 0/5.');
  });
  it('the compare table and the counts under it use the same terms', async () => {
    const { Stage } = await import('../../src/components/lesson/viz/widgets/ml/Prune.jsx');
    const html = renderToStaticMarkup(React.createElement(Stage, { P, frame: P.frames[3] }));
    expect(html).not.toMatch(/sus-jos|jos-sus/);
    expect(html).toContain('<th>top-down</th><th>bottom-up</th>');
    expect(html).toContain('mlw4-cmp');
  });
  it('two tests with the same name below a cut are counted, not listed twice', () => {
    expect(Q.frames[1].caption.en).toContain('V (X = 0), IG 0, with two W tests below it');
    expect(Q.frames[1].caption.ro).toContain('V (X = 0), IG 0, cu două teste W sub el');
    expect(mlPrune({ ...T21, epsilon: 0.95 }).frames[1].caption.ro).toContain('B, IG 0.3, cu două teste A și C sub el');
    expect(P.frames[1].caption.ro).toContain('A (B = 1), IG 0.02, cu C sub el');
  });
  it('the compare table lets its first column wrap so its four columns fit a phone', async () => {
    const { readFileSync } = await import('node:fs');
    const css = readFileSync(new URL('../../src/components/lesson/viz/widgets/ml/ml-w4.css', import.meta.url), 'utf8');
    expect(css).toMatch(/\.mlw4-cmp td:first-child \{[^}]*white-space: normal/);
  });
});
