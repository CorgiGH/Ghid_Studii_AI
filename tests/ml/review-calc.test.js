import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { StaticRouter } from 'react-router-dom';
import { renderToStaticMarkup } from 'react-dom/server';
import { createLessonStore, midnightAfter } from '../../src/lesson/store.js';
import { applyReviewAnswer, collectCalcPool, collectMcqPool, pickCalcVariant } from '../../src/lesson/review.js';
import { validateCalc } from '../../src/components/lesson/blocks/calcSpec.js';

const memStorage = () => {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { m.set(k, String(v)); } };
};

// The store, the app context and the lesson files are replaced so ReviewTab renders on the server renderer (no DOM in this suite).
let current = null;
const courses = {};
vi.mock('../../src/lesson/useLessonStore', () => ({ useLessonStore: () => current }));
vi.mock('../../src/contexts/AppContext', () => ({ useApp: () => ({ t: (en, ro) => ro, lang: 'ro' }) }));
vi.mock('../../src/content/jsonLoader', () => ({ loadJson: (src) => { if (!courses[src]) throw new Error('no such file'); return courses[src]; } }));
vi.mock('../../src/components/lesson/viz/useSqlRunner.js', () => ({
  useSqlRunner: () => { throw new Error('a static table must not start the SQL engine'); },
}));

const bi = (s) => ({ en: s, ro: s });
const table = (rows) => ({ columns: ['X', 'Y'], rows });
const calc = {
  type: 'calc-exercise',
  id: 'ml-l07-h',
  statement: bi('Entropia clasei [9+, 5-]'),
  table: table([[9, 5]]),
  fields: [{ id: 'h', label: bi('H'), kind: 'num', formula: 'H(9,5)', expected: 0.9403 }],
  hints: [bi('a'), bi('b'), bi('c')],
  solution: bi('s'),
  status: 'book',
  variants: [
    { statement: bi('Entropia clasei [3+, 1-]'), table: table([[3, 1]]), fields: [{ id: 'h', formula: 'H(3,1)', expected: 0.8113 }], solution: bi('v1') },
    { statement: bi('Entropia clasei [2+, 2-]'), table: table([[2, 2]]), fields: [{ id: 'h', formula: 'H(2,2)', expected: 1 }], solution: bi('v2') },
  ],
};
const mcq = {
  type: 'mcq', id: 'ml-l07-q', question: bi('Ce e entropia?'),
  options: [{ text: bi('a'), correct: true, explain: bi('e') }, { text: bi('b'), correct: false, misconception: 'x', explain: bi('e') }],
};
const lessonFile = { meta: { id: 'ml-l07' }, steps: [{ id: 'ml-l07-s1', title: bi('t1'), blocks: [mcq] }, { id: 'ml-l07-s2', title: bi('t2'), blocks: [calc] }] };
const lessons = [{ src: 'ml/courses/lesson-07.json', index: 0, course: lessonFile }];
courses['ml/courses/lesson-07.json'] = lessonFile;

const NOW = new Date(2026, 9, 28, 15, 0, 0).getTime();
const ref = { src: 'ml/courses/lesson-07.json', screen: 2 };
const missed = () => {
  const store = createLessonStore(memStorage());
  store.enqueueReview('ml-l07-h', { ref, kind: 'calc', at: NOW });
  return store;
};

describe('the calc exercise in the test fixture is a valid block', () => {
  it('passes validateCalc', () => { expect(validateCalc(calc)).toEqual([]); });
});

describe('collectCalcPool', () => {
  it('lists the calc exercises with their screen, and the mcq pool leaves them out', () => {
    const pool = collectCalcPool(lessons);
    expect(pool).toHaveLength(1);
    expect(pool[0]).toMatchObject({ id: 'ml-l07-h', src: 'ml/courses/lesson-07.json', screen: 2, lesson: 0 });
    expect(collectMcqPool(lessons).map((p) => p.id)).toEqual(['ml-l07-q']);
  });
});

describe('pickCalcVariant', () => {
  const pool = collectCalcPool(lessons);
  const item = { itemId: 'ml-l07-h', kind: 'calc' };

  it('swaps a variant in: a new statement, new data and new expected values, never the original numbers', () => {
    for (const r of [0, 0.4, 0.99]) {
      const v = pickCalcVariant(item, pool, { rand: () => r });
      expect(v.block.statement).not.toEqual(calc.statement);
      expect(v.block.table).not.toEqual(calc.table);
      expect(v.block.fields[0].expected).not.toBe(0.9403);
      expect(v.block.fields[0].label).toEqual(calc.fields[0].label); // everything not numeric stays
      expect(v.block.variants).toBeUndefined();
      expect(v.block.id).toBe('ml-l07-h');
    }
  });

  it('a second pick differs from the first when there are two variants', () => {
    const first = pickCalcVariant(item, pool, { rand: () => 0 });
    const second = pickCalcVariant(item, pool, { avoid: [first.variant], rand: () => 0 });
    expect(second.variant).not.toBe(first.variant);
    expect(second.block.statement).not.toEqual(first.block.statement);
  });

  it('starts over once all have been shown, without repeating the one just shown', () => {
    const v = pickCalcVariant(item, pool, { avoid: [0, 1], rand: () => 0 });
    expect(v.variant).toBe(0);
    const w = pickCalcVariant(item, pool, { avoid: [1, 0], rand: () => 0 });
    expect(w.variant).toBe(1);
  });

  it('gives the only variant again when there is just one', () => {
    const one = collectCalcPool([{ ...lessons[0], course: { steps: [{ blocks: [{ ...calc, variants: [calc.variants[0]] }] }] } }]);
    expect(pickCalcVariant(item, one, { avoid: [0] }).variant).toBe(0);
  });

  it('returns null for an exercise that is gone or has no variant', () => {
    expect(pickCalcVariant({ itemId: 'nope' }, pool)).toBeNull();
    const bare = collectCalcPool([{ ...lessons[0], course: { steps: [{ blocks: [{ ...calc, variants: [] }] }] } }]);
    expect(pickCalcVariant(item, bare)).toBeNull();
  });
});

describe('a review answer', () => {
  it('a right answer moves the item to tomorrow (the local midnight that starts the next day)', () => {
    const store = missed();
    const r = applyReviewAnswer(store, 'ml-l07-h', true, NOW);
    expect(r).toMatchObject({ ok: true, practice: false, gone: false, due: midnightAfter(NOW, 1) });
    expect(store.pendingReview(NOW)[0]).toMatchObject({ itemId: 'ml-l07-h', streak: 1, due: midnightAfter(NOW, 1) });
    expect(store.dueCount(NOW)).toBe(0);
  });
  it('a wrong answer keeps it due now', () => {
    const store = missed();
    const r = applyReviewAnswer(store, 'ml-l07-h', false, NOW);
    expect(r).toMatchObject({ ok: false, gone: false, due: NOW });
    expect(store.dueCount(NOW)).toBe(1);
  });
  it('a right answer before it is due is only practice', () => {
    const store = missed();
    applyReviewAnswer(store, 'ml-l07-h', true, NOW);
    const r = applyReviewAnswer(store, 'ml-l07-h', true, NOW + 1000);
    expect(r.practice).toBe(true);
    expect(store.pendingReview(NOW)[0].streak).toBe(1);
  });
  it('the third right answer on different days removes it', () => {
    const store = missed();
    applyReviewAnswer(store, 'ml-l07-h', true, NOW);
    applyReviewAnswer(store, 'ml-l07-h', true, midnightAfter(NOW, 1) + 1000);
    const last = applyReviewAnswer(store, 'ml-l07-h', true, midnightAfter(NOW, 4) + 1000);
    expect(last.gone).toBe(true);
    expect(store.pendingCount()).toBe(0);
  });
});

describe('the review tab', () => {
  const subject = (slug) => ({ slug, courses: [{ src: 'ml/courses/lesson-07.json', shortTitle: bi('Entropia') }] });
  const tab = async (slug) => {
    const { default: ReviewTab } = await import('../../src/components/lesson/ReviewTab.jsx');
    return renderToStaticMarkup(
      React.createElement(StaticRouter, { location: `/y2s1/${slug}/review` }, React.createElement(ReviewTab, { subject: subject(slug), yearSem: 'y2s1', subjectSlug: slug })),
    );
  };

  it('lists a missed calc item with its statement and a Practise button', async () => {
    current = missed();
    const html = await tab('ml');
    expect(html).toContain('data-item="ml-l07-h"');
    expect(html).toContain('Entropia clasei [9+, 5-]');
    expect(html).toContain('Exersează');
  });

  it('a calc item of ML does not show in the BD tab', async () => {
    current = missed();
    const html = await tab('bd');
    expect(html).not.toContain('data-item="ml-l07-h"');
  });

  it('opens a card that is a calculation exercise with the variant numbers, not the original ones', async () => {
    const { ReviewQuestion } = await import('../../src/components/lesson/ReviewTab.jsx');
    current = missed();
    const v = pickCalcVariant({ itemId: 'ml-l07-h' }, collectCalcPool(lessons), { rand: () => 0 });
    const html = renderToStaticMarkup(React.createElement(ReviewQuestion, { block: v.block, onAnswer: () => {} }));
    expect(html).toContain('data-testid="calc-exercise"');
    expect(html).toContain('Entropia clasei [3+, 1-]');
    expect(html).not.toContain('Entropia clasei [9+, 5-]');
    const orig = renderToStaticMarkup(React.createElement(ReviewQuestion, { block: calc, onAnswer: () => {} }));
    expect(orig).toContain('Entropia clasei [9+, 5-]');
    expect(html).not.toBe(orig);
  });

  it('a multiple-choice card still renders as before', async () => {
    const { ReviewQuestion } = await import('../../src/components/lesson/ReviewTab.jsx');
    current = missed();
    const html = renderToStaticMarkup(React.createElement(ReviewQuestion, { block: mcq, onAnswer: () => {} }));
    expect(html).toContain('data-testid="mcq-block"');
  });
});
