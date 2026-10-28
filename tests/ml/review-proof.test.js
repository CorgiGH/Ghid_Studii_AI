import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { StaticRouter } from 'react-router-dom';
import { renderToStaticMarkup } from 'react-dom/server';
import { createLessonStore } from '../../src/lesson/store.js';
import { collectMcqPool, collectProofPool, pickVariant } from '../../src/lesson/review.js';
import { pickAttempt } from '../../src/components/lesson/blocks/proofSpec.js';

// A wrong pick inside a proof puts `${id}#${k}` in the review pile. These tests hold that it comes back as a question the learner
// can answer, with the proof around it, so the item can leave the pile like any other.
const memStorage = () => {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { m.set(k, String(v)); } };
};

let current = null;
const courses = {};
vi.mock('../../src/lesson/useLessonStore', () => ({ useLessonStore: () => current }));
vi.mock('../../src/contexts/AppContext', () => ({ useApp: () => ({ t: (en, ro) => ro, lang: 'ro' }) }));
vi.mock('../../src/content/jsonLoader', () => ({ loadJson: (src) => { if (!courses[src]) throw new Error('no such file'); return courses[src]; } }));
vi.mock('../../src/components/lesson/viz/useSqlRunner.js', () => ({
  useSqlRunner: () => { throw new Error('a static table must not start the SQL engine'); },
}));

const bi = (s) => ({ en: `${s} (en)`, ro: s });
const opt = (text, correct, tag) => ({ text: bi(text), correct, explain: bi(`explicatie ${text}`), ...(correct ? {} : { misconception: tag }) });
const TAG = 'int-division';

const proof = {
  type: 'proof-steps',
  id: 'ml-l01-bonf',
  claim: bi('AFIRMATIA-BONFERRONI'),
  given: bi('DATELE-DATE'),
  table: { columns: ['X', 'Y'], rows: [[1, 0]] },
  steps: [
    { shown: bi('PRIMUL-PAS'), why: bi('DE-CE-UNU') },
    { shown: bi('AL-DOILEA-PAS'), why: bi('DE-CE-DOI'), predict: { question: bi('INTREBAREA-DOI'), options: [opt('BUNA', true), opt('GRESITA', false, TAG)] } },
    { shown: bi('AL-TREILEA-PAS') },
  ],
  end: bi('GATA'),
};
const lessonFile = { meta: { id: 'ml-l01' }, steps: [{ id: 'ml-l01-s1', title: bi('TITLUL-ECRANULUI'), blocks: [proof] }] };
const SRC = 'ml/courses/lesson-01.json';
const lessons = [{ src: SRC, index: 0, course: lessonFile }];
courses[SRC] = lessonFile;
const ref = { src: SRC, screen: 1 };

const missedProof = () => {
  const store = createLessonStore(memStorage());
  const w = pickAttempt(proof, 1, 1, ref, 1000);
  store.recordAttempt(w.item, w.data);
  return store;
};

describe('collectProofPool', () => {
  it('lists every prediction of a proof as a question that keeps the proof before it', () => {
    const pool = collectProofPool(lessons);
    expect(pool.map((p) => p.id)).toEqual(['ml-l01-bonf#1']);
    const [entry] = pool;
    expect(entry).toMatchObject({ src: SRC, screen: 1, lesson: 0 });
    expect(entry.block).toMatchObject({ type: 'proof-step', id: 'ml-l01-bonf#1', claim: proof.claim, given: proof.given, table: proof.table });
    expect(entry.block.question).toEqual(proof.steps[1].predict.question);
    expect(entry.block.options).toEqual(proof.steps[1].predict.options);
    expect(entry.block.before).toEqual([{ shown: proof.steps[0].shown, why: proof.steps[0].why }]);
  });
});

describe('a missed proof step in review', () => {
  it('the wrong pick is in the pile and finds a question to come back as', () => {
    const store = missedProof();
    const [item] = store.pendingReview(1000);
    expect(item).toMatchObject({ itemId: 'ml-l01-bonf#1', kind: 'mcq', tag: TAG });
    const pool = [...collectMcqPool(lessons), ...collectProofPool(lessons)];
    const v = pickVariant(item, pool, { rand: () => 0 });
    expect(v).not.toBeNull();
    expect(v.block.type).toBe('proof-step');
  });

  it('the card shows the claim, the data and the steps before the question, never the step it asks for', async () => {
    const { ReviewQuestion } = await import('../../src/components/lesson/ReviewTab.jsx');
    current = missedProof();
    const [entry] = collectProofPool(lessons);
    const html = renderToStaticMarkup(React.createElement(ReviewQuestion, { block: entry.block, onAnswer: () => {} }));
    for (const s of ['AFIRMATIA-BONFERRONI', 'DATELE-DATE', 'data-testid="question-table"', 'PRIMUL-PAS', 'DE-CE-UNU', 'INTREBAREA-DOI', 'BUNA', 'GRESITA']) {
      expect(html, s).toContain(s);
    }
    for (const s of ['AL-DOILEA-PAS', 'DE-CE-DOI', 'AL-TREILEA-PAS', 'GATA']) expect(html, s).not.toContain(s);
    expect(html).toContain('data-testid="mcq-block"');
  });

  it('the review list names it by the claim and offers Practise', async () => {
    const { default: ReviewTab } = await import('../../src/components/lesson/ReviewTab.jsx');
    current = missedProof();
    const subject = { slug: 'ml', courses: [{ src: SRC, shortTitle: bi('Lecția 1') }] };
    const html = renderToStaticMarkup(
      React.createElement(StaticRouter, { location: '/y2s1/ml/review' }, React.createElement(ReviewTab, { subject, yearSem: 'y2s1', subjectSlug: 'ml' })),
    );
    expect(html).toContain('data-item="ml-l01-bonf#1"');
    expect(html).toContain('AFIRMATIA-BONFERRONI');
    expect(html).toContain('Exersează');
  });
});
