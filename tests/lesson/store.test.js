import { describe, it, expect } from 'vitest';
import { createLessonStore } from '../../src/lesson/store.js';

function fakeStorage(initial = {}) {
  const m = new Map(Object.entries(initial));
  return {
    getItem: k => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => { m.set(k, String(v)); },
    removeItem: k => { m.delete(k); },
    _m: m,
  };
}
const KEY = 'bdLessonState.v1';
const DAY = 24 * 3600 * 1000;
const ref = { src: 'bd/courses/lesson-01.json', screen: 2 };
const miss = (extra = {}) => ({ ok: false, hints: 0, kind: 'mcq', ref, at: 1000, ...extra });

describe('lesson store', () => {
  it('round-trips positions through storage', () => {
    const s = fakeStorage();
    const a = createLessonStore(s);
    expect(a.getPosition('x.json')).toBe(1);
    a.setPosition('x.json', 5);
    const b = createLessonStore(s);
    expect(b.getPosition('x.json')).toBe(5);
    expect(JSON.parse(s.getItem(KEY)).v).toBe(1);
  });

  it('starts empty on corrupted or old-version storage without throwing', () => {
    for (const raw of ['{not json', JSON.stringify({ positions: { a: 3 } }), JSON.stringify({ v: 0, positions: { a: 3 } }), 'null', '[]']) {
      const st = createLessonStore(fakeStorage({ [KEY]: raw }));
      expect(st.getPosition('a')).toBe(1);
      expect(st.pendingReview(0)).toEqual([]);
    }
  });

  it('survives a storage that throws', () => {
    const bad = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('quota'); } };
    const st = createLessonStore(bad);
    st.setPosition('a', 4);
    expect(st.getPosition('a')).toBe(4);
  });

  it('schedules review: miss due now, right +1 day, right again removes', () => {
    const st = createLessonStore(fakeStorage());
    st.recordAttempt('q1', miss());
    const [item] = st.pendingReview(1000);
    expect(item).toMatchObject({ itemId: 'q1', due: 1000, streak: 0, kind: 'mcq', ref });
    st.markReview('q1', true, 2000);
    expect(st.pendingReview(2000)[0]).toMatchObject({ due: 2000 + DAY, streak: 1 });
    st.markReview('q1', true, 2000 + DAY);
    expect(st.pendingReview(2000 + DAY)).toEqual([]);
  });

  it('a wrong review answer resets the streak', () => {
    const st = createLessonStore(fakeStorage());
    st.recordAttempt('q1', miss());
    st.markReview('q1', true, 2000);
    st.markReview('q1', false, 3000);
    expect(st.pendingReview(3000)[0].streak).toBe(0);
  });

  it('lists due items before later ones and ignores correct or skipped attempts', () => {
    const st = createLessonStore(fakeStorage());
    st.recordAttempt('late', miss({ at: 5000 }));
    st.markReview('late', true, 5000);
    st.recordAttempt('now', miss({ at: 6000 }));
    st.recordAttempt('fine', { ok: true, hints: 0, kind: 'sql', ref, at: 6000 });
    st.recordAttempt('skip', { ok: false, hints: 0, skipped: true, kind: 'reflect', ref, at: 6000 });
    expect(st.pendingReview(6000).map(i => i.itemId)).toEqual(['now', 'late']);
  });

  it('a third opened hint adds a review item even when the answer is right', () => {
    const st = createLessonStore(fakeStorage());
    st.recordAttempt('sql1', { ok: true, hints: 3, kind: 'sql', ref, at: 10 });
    expect(st.pendingReview(10).map(i => i.itemId)).toEqual(['sql1']);
  });
});
