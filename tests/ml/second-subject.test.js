import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { createLessonStore } from '../../src/lesson/store.js';
import { dueCountFor, inSubject, pendingReviewFor } from '../../src/lesson/subjectScope.js';
import { readFileSync } from 'node:fs';
import { ML_TAGS, TRAP_TAGS } from '../../src/components/lesson/blocks/trapTags.js';
import { lessonOrder, validateMcq } from '../../src/components/lesson/blocks/choiceSpec.js';

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

  it('hold every ✗[label] of the outline, under the slug rule written in trapTags.js', () => {
    const outline = readFileSync(new URL('../../docs/superpowers/specs/ml-outline/2026-10-28-ml-lessons-content-outline.md', import.meta.url), 'utf8');
    const labels = [...new Set([...outline.matchAll(/✗\[([^\]]*)\]/g)].map((m) => m[1]))];
    expect(labels.length).toBeGreaterThan(250);
    const missing = labels.filter((l) => !ML_TAGS.includes(mlTag(l))).map((l) => `${l} -> ${mlTag(l)}`);
    expect(missing).toEqual([]);
  });
});

// The slug rule of ML_TAGS (trapTags.js): LaTeX commands dropped, − ≠ and Greek letters spelled out, sub- and superscript
// digits as digits, diacritics dropped, lower case, every other run of characters a hyphen.
const WORD = { '−': 'minus', '≠': 'neq', 'θ': 'theta', 'σ': 'sigma', 'ρ': 'rho', 'μ': 'mu', 'Ω': 'omega', '∅': 'empty', '²': '2' };
const SUB = '₀₁₂₃₄₅₆₇₈₉';
function mlTag(label) {
  return label
    .replace(/\\[A-Za-z]+/g, ' ')
    .replace(/[₀-₉]/g, (c) => String(SUB.indexOf(c)))
    .replace(/[−≠θσρμΩ∅²]/g, (c) => ` ${WORD[c]} `)
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

describe('lesson ids of both lesson-player subjects', () => {
  const bi = (s) => ({ en: s, ro: s });
  const mcq = (review) => ({
    id: 'ml-l03-q1', question: bi('q'), review,
    options: [{ text: bi('a'), correct: true, explain: bi('e') }, { text: bi('b'), correct: false, explain: bi('e'), misconception: 'uita-priorul' }],
  });

  it('places ml ids in course order like bd ids', () => {
    expect(lessonOrder('ml-l01')).toBeLessThan(lessonOrder('ml-l02'));
    expect(lessonOrder('ml-l24')).toBe(lessonOrder('bd-l24'));
    expect(lessonOrder('ml-24')).toBeNull();
  });

  it('a review names an earlier lesson of the same subject', () => {
    expect(validateMcq(mcq('ml-l01'), { lessonId: 'ml-l03' })).toEqual([]);
    expect(validateMcq(mcq('ml-l04'), { lessonId: 'ml-l03' }).join(' ')).toMatch(/earlier/);
    expect(validateMcq(mcq('bd-l01'), { lessonId: 'ml-l03' }).join(' ')).toMatch(/same subject/);
    expect(validateMcq(mcq('ml-l01'), { lessonId: 'bd-l03' }).join(' ')).toMatch(/same subject/);
  });
});
