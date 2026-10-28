import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import * as K from '../../src/ml/calc/mathKit.js';
import { treePairModel, annotate, stats, classify } from '../../src/components/lesson/viz/logic/ml/tree-pair.js';
import { validateViz, WIDGET_NAMES } from '../../src/components/lesson/viz/vizSpec.js';
import { expectCaptionDrawn } from './ml-viz-helpers.js';

vi.mock('../../src/lesson/useLessonStore', async () => {
  const { createLessonStore } = await import('../../src/lesson/store.js');
  const m = new Map();
  const store = createLessonStore({ getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { m.set(k, String(v)); } });
  return { useLessonStore: () => store, getLessonStore: () => store };
});
vi.mock('../../src/contexts/AppContext', () => ({ useApp: () => ({ t: (en, ro) => ro }) }));
vi.mock('motion/react', async (orig) => ({ ...(await orig()), useReducedMotion: () => true }));

const { default: TreePair, PairBody } = await import('../../src/components/lesson/viz/widgets/ml/TreePair.jsx');

// E 4.4: (A,B,C,Y) = (1,1,0,0), (1,0,1,1), (0,1,1,1), (0,0,1,0). ID3 puts C first, the smaller tree is Y = A xor B.
const TABLE = { columns: ['A', 'B', 'C', 'Y'], rows: [[1, 1, 0, 0], [1, 0, 1, 1], [0, 1, 1, 1], [0, 0, 1, 0]] };
const ID3 = { attr: 'C', kids: { 0: { leaf: 0 }, 1: { attr: 'A', kids: { 1: { leaf: 1 }, 0: { attr: 'B', kids: { 0: { leaf: 0 }, 1: { leaf: 1 } } } } } } };
const MIN = { attr: 'A', kids: { 0: { attr: 'B', kids: { 0: { leaf: 0 }, 1: { leaf: 1 } } }, 1: { attr: 'B', kids: { 0: { leaf: 1 }, 1: { leaf: 0 } } } } };
const BI = (en, ro) => ({ en, ro });
const PROPS = { left: ID3, right: MIN, counts: ['tests', 'levels'], titles: [BI('ID3 tree', 'Arborele ID3'), BI('Minimum tree', 'Arborele minim')], table: TABLE, target: 'Y' };

describe('tree stats (E 4.4)', () => {
  it('both trees have 3 tests; ID3 has 3 levels and the minimum tree 2', () => {
    const [l, r] = [ID3, MIN].map((t) => stats(annotate(t)));
    expect(l).toEqual({ tests: 3, leaves: 4, levels: 3 });
    expect(r).toEqual({ tests: 3, leaves: 4, levels: 2 });
  });
  it('the ID3 tree of the kit is the left tree: root C, 3 tests', () => {
    expect(K.id3Root(TABLE, 'Y')).toEqual({ attr: 'C' });
    expect(K.id3Tests(TABLE, 'Y')).toBe(3);
  });
  it('tests are numbered level by level, left to right, root = 1', () => {
    const root = annotate(MIN);
    expect(root.num).toBe(1);
    expect(root.kids.map((k) => k.node.num)).toEqual([2, 3]);
    const id3 = annotate(ID3);
    const a = id3.kids[1].node; const b = a.kids[0].node;
    expect([id3.num, a.num, b.num]).toEqual([1, 2, 3]);
  });
  it('both trees classify the four rows correctly (the same function)', () => {
    const names = TABLE.columns;
    for (const t of [ID3, MIN]) for (const r of TABLE.rows) expect(classify(t, r, names)).toBe(r[3]);
  });
});

describe('model and caption', () => {
  const M = treePairModel(PROPS);
  it('says 3 tests on 3 levels against 3 tests on 2 levels, one level fewer', () => {
    expect(M.caption().ro).toBe('Arborele ID3: 3 teste și 3 niveluri; arborele minim: 3 teste și 2 niveluri. Ambii au 3 teste, dar arborele minim are cu 1 nivel mai puțin. Pe cele 4 rânduri, erori: arborele ID3 0, arborele minim 0; cei doi arbori dau aceeași etichetă pe 4 rânduri.');
    expect(M.caption().en).toContain('Both have 3 tests, but the minimum tree has 1 level fewer.');
    expect(M.caption().en).toContain('On the 4 rows, errors: the ID3 tree 0, the minimum tree 0; the two trees give the same label on 4 rows.');
    expect(M.fewer).toBe(1);
  });
  it('without the table or with different test counts the sentence adapts', () => {
    const N = treePairModel({ left: ID3, right: { attr: 'C', kids: { 0: { leaf: 0 }, 1: { leaf: 1 } } }, counts: ['tests', 'leaves'] });
    expect(N.caption().ro).not.toContain('Ambii');
    expect(N.caption().ro).toContain('3 teste și 4 frunze');
    expect(N.caption().ro).toContain('1 test și 2 frunze');
    expect(N.caption().en).toContain('1 test and 2 leaves');
  });
  it('every number of the caption is drawn (static end state)', () => {
    const html = renderToStaticMarkup(React.createElement(PairBody, { model: M }));
    expectCaptionDrawn(expect, M.caption(), html, 'tree-pair');
    expect(html).toContain('data-value="3"');
    expect(html).toContain('data-side="0"');
    expect(html).toContain('data-side="1"');
  });
  it('the whole widget renders statically, with no step controls', () => {
    const html = renderToStaticMarkup(React.createElement(TreePair, { props: PROPS, predict: false }));
    expect(html).toContain('data-widget="ml-tree-pair"');
    expect(html).not.toContain('viz-controls');
    expect(html).toContain('Arborele minim');
  });
  it('the css fits a phone: sides stack under 480 px', () => {
    const css = readFileSync(new URL('../../src/components/lesson/viz/widgets/ml/id3.css', import.meta.url), 'utf8');
    expect(css).toMatch(/\.mlv-pairgrid \{[^}]*minmax\(240px, 1fr\)/);
  });
});

describe('validateViz', () => {
  const v = (props) => validateViz({ id: 'ml-l12-v1', widget: 'ml-tree-pair', props });
  it('is registered and accepts the outline props', () => {
    expect(WIDGET_NAMES).toContain('ml-tree-pair');
    expect(v(PROPS)).toEqual([]);
    expect(v({ left: ID3, right: MIN })).toEqual([]);
  });
  it('rejects a missing tree, a broken tree or table without target', () => {
    expect(v({ left: ID3 })).not.toEqual([]);
    expect(v({ left: ID3, right: { attr: 'A', kids: { 0: { leaf: 0 } } } })).not.toEqual([]);
    expect(v({ left: ID3, right: MIN, table: TABLE })).not.toEqual([]);
    expect(v({ left: ID3, right: MIN, counts: ['nodes'] })).not.toEqual([]);
  });
});
