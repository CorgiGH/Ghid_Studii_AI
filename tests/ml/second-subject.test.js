import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { createLessonStore } from '../../src/lesson/store.js';
import { dueCountFor, inSubject, pendingReviewFor } from '../../src/lesson/subjectScope.js';
import { ML_TAGS, TRAP_TAGS } from '../../src/components/lesson/blocks/trapTags.js';

const memStorage = () => { const m = {}; return { getItem: (k) => m[k] ?? null, setItem: (k, v) => { m[k] = v; } }; };
const NOW = Date.UTC(2026, 9, 28, 12);

// One BD and one ML item, both due now; plus an ML item due tomorrow.
function seeded() {
  const store = createLessonStore(memStorage());
  store.enqueueReview('bd-q1', { ref: { src: 'bd/courses/lesson-03.json', screen: 4 }, kind: 'mcq', at: NOW });
  store.enqueueReview('ml-q1', { ref: { src: 'ml/courses/lesson-02.json', screen: 5 }, kind: 'mcq', at: NOW });
  return store;
}

// The store and the app context are replaced so ReviewTab renders on the server renderer (no DOM in this suite).
let current = null;
vi.mock('../../src/lesson/useLessonStore', () => ({ useLessonStore: () => current }));
vi.mock('../../src/contexts/AppContext', () => ({ useApp: () => ({ t: (en, ro) => ro, lang: 'ro' }) }));

async function reviewMarkup(slug) {
  const { default: ReviewTab } = await import('../../src/components/lesson/ReviewTab.jsx');
  const subject = { slug, courses: [] };
  return renderToStaticMarkup(
    React.createElement(StaticRouter, { location: `/y2s1/${slug}/review` }, React.createElement(ReviewTab, { subject, yearSem: 'y2s1', subjectSlug: slug })),
  );
}

describe('inSubject', () => {
  it('matches the course file prefix and nothing else', () => {
    expect(inSubject({ ref: { src: 'ml/courses/lesson-01.json' } }, 'ml')).toBe(true);
    expect(inSubject({ ref: { src: 'bd/courses/lesson-01.json' } }, 'ml')).toBe(false);
    expect(inSubject({ ref: { src: 'mlx/courses/a.json' } }, 'ml')).toBe(false);
    expect(inSubject({}, 'ml')).toBe(false);
    expect(inSubject(null, 'ml')).toBe(false);
  });
});

describe('badge count per subject', () => {
  it('counts one BD and one ML item separately', () => {
    const store = seeded();
    expect(dueCountFor(store, 'ml', NOW)).toBe(1);
    expect(dueCountFor(store, 'bd', NOW)).toBe(1);
    expect(store.dueCount(NOW)).toBe(2);
  });
  it('does not count an item that is not due yet', () => {
    const store = seeded();
    store.enqueueReview('ml-q2', { ref: { src: 'ml/courses/lesson-02.json', screen: 6 }, kind: 'mcq', at: NOW + 86400000 });
    expect(dueCountFor(store, 'ml', NOW)).toBe(1);
    expect(pendingReviewFor(store, 'ml', NOW).map((i) => i.itemId)).toEqual(['ml-q1', 'ml-q2']);
  });
});

describe('Recapitulare per subject', () => {
  it('lists only ML items for ml and only BD items for bd', async () => {
    current = seeded();
    const ml = await reviewMarkup('ml');
    expect(ml).toContain('data-item="ml-q1"');
    expect(ml).not.toContain('data-item="bd-q1"');
    const bd = await reviewMarkup('bd');
    expect(bd).toContain('data-item="bd-q1"');
    expect(bd).not.toContain('data-item="ml-q1"');
  });
  it('shows the empty state for a subject with no items', async () => {
    current = createLessonStore(memStorage());
    current.enqueueReview('bd-q1', { ref: { src: 'bd/courses/lesson-03.json', screen: 4 }, kind: 'mcq', at: NOW });
    expect(await reviewMarkup('ml')).toContain('data-testid="review-empty"');
  });
});

describe('ML trap tags', () => {
  it('are in the catalogue, unique and ASCII kebab-case', () => {
    expect(ML_TAGS.length).toBeGreaterThan(200);
    expect(new Set(ML_TAGS).size).toBe(ML_TAGS.length);
    for (const t of ML_TAGS) {
      expect(t).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(TRAP_TAGS.has(t)).toBe(true);
    }
  });
  it('include the outline misconceptions', () => {
    for (const t of ['ln-in-loc-de-log2', 'map-confundat-cu-ml', 'marginala-in-loc-de-conditionata', 'laplace-numerator-only', 'uita-priorul']) expect(TRAP_TAGS.has(t), t).toBe(true);
  });
});
