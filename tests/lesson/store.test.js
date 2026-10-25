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

  it('schedules review: miss due now, right next day, right 3 days on, third right removes', () => {
    const local = (d, h = 0) => new Date(2026, 9, d, h, 0).getTime();
    const st = createLessonStore(fakeStorage());
    st.recordAttempt('q1', miss({ at: local(20, 10) }));
    const [item] = st.pendingReview(local(20, 10));
    expect(item).toMatchObject({ itemId: 'q1', due: local(20, 10), streak: 0, kind: 'mcq', ref });
    st.markReview('q1', true, local(20, 11));
    expect(st.pendingReview(local(20, 11))[0]).toMatchObject({ due: local(21), streak: 1 });
    st.markReview('q1', true, local(21, 9));
    expect(st.pendingReview(local(21, 9))[0]).toMatchObject({ due: local(24), streak: 2 });
    st.markReview('q1', true, local(24, 9));
    expect(st.pendingReview(local(24, 9))).toEqual([]);
  });

  it('a miss at any point resets the item to due now', () => {
    const st = createLessonStore(fakeStorage());
    st.recordAttempt('q1', miss());
    st.markReview('q1', true, 2000);
    st.markReview('q1', true, 2000 + DAY);
    st.markReview('q1', false, 3 * DAY);
    expect(st.pendingReview(3 * DAY)[0]).toMatchObject({ streak: 0, due: 3 * DAY });
  });

  it('a repeat miss in the lesson on an item already in review restarts it', () => {
    const st = createLessonStore(fakeStorage());
    st.recordAttempt('q1', miss());
    st.markReview('q1', true, 2000);
    st.recordAttempt('q1', miss({ at: 9000 }));
    expect(st.pendingReview(9000)[0]).toMatchObject({ streak: 0, due: 9000 });
  });

  it('a right answer before the item is due is practice only', () => {
    const st = createLessonStore(fakeStorage());
    st.recordAttempt('q1', miss());
    st.markReview('q1', true, 2000);
    const before = st.pendingReview(2000)[0];
    st.markReview('q1', true, 2500);
    expect(st.pendingReview(2500)[0]).toEqual(before);
  });

  it('remembers the trap tag of the missed answer', () => {
    const st = createLessonStore(fakeStorage());
    st.recordAttempt('q1', miss({ misconception: 'null-eq' }));
    expect(st.pendingReview(1000)[0].tag).toBe('null-eq');
  });

  it('finds the attempts recorded for one screen of one lesson', () => {
    const st = createLessonStore(fakeStorage());
    st.recordAttempt('q1', miss());
    st.recordAttempt('q2', { ok: true, hints: 0, kind: 'mcq', ref: { src: ref.src, screen: 3 }, at: 5 });
    expect(st.attemptsAt(ref.src, 2).length).toBe(1);
    expect(st.attemptsAt(ref.src, 4)).toEqual([]);
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

  it('a prediction attempt (ok: true, kind predict) never enters the review pile', () => {
    const st = createLessonStore(fakeStorage());
    st.recordAttempt('qm1', { ok: true, hints: 0, kind: 'predict', item: 'qm1', ref, at: 1000, correct: 2, total: 13 });
    expect(st.pendingReview(5000)).toEqual([]);
    expect(st.pendingCount()).toBe(0);
    expect(st.attemptsAt(ref.src, ref.screen)).toHaveLength(1);
  });
});

// Final fix wave: two tabs share one storage (item 3), the idempotent review enqueue (item 12) and the midnight schedule (item 19).
describe('two tabs on one storage', () => {
  const at = (h, d = 25) => new Date(2026, 9, d, h, 0).getTime();
  it("A's miss followed by B's answer keeps both attempts and A's review item", () => {
    const s = fakeStorage();
    const a = createLessonStore(s);
    const b = createLessonStore(s);
    a.setPosition('bd/courses/lesson-02.json', 9);
    a.recordAttempt('bd-l02-q1', miss({ at: 1 }));
    b.recordAttempt('bd-l02-q2', { ok: true, hints: 0, kind: 'mcq', ref: { ...ref, screen: 10 }, at: 2 });
    b.setPosition('bd/courses/lesson-03.json', 4);
    const saved = JSON.parse(s.getItem(KEY));
    expect(Object.keys(saved.attempts).sort()).toEqual(['bd-l02-q1', 'bd-l02-q2']);
    expect(Object.keys(saved.review)).toEqual(['bd-l02-q1']);
    expect(saved.positions).toEqual({ 'bd/courses/lesson-02.json': 9, 'bd/courses/lesson-03.json': 4 });
    // and B now sees A's work in memory too
    expect(b.pendingCount()).toBe(1);
  });

  it('reload() picks up what another tab wrote and tells the subscribers', () => {
    const s = fakeStorage();
    const a = createLessonStore(s);
    const b = createLessonStore(s);
    let heard = 0;
    b.subscribe(() => { heard += 1; });
    const v0 = b.getVersion();
    a.recordAttempt('q1', miss());
    expect(b.pendingCount()).toBe(0);
    b.reload();
    expect(b.pendingCount()).toBe(1);
    expect(heard).toBe(1);
    expect(b.getVersion()).toBeGreaterThan(v0);
  });

  it('keeps the in-memory history when reading storage throws', () => {
    const s = fakeStorage();
    const st = createLessonStore(s);
    st.recordAttempt('q1', miss());
    s.getItem = () => { throw new Error('blocked'); };
    st.recordAttempt('q2', miss({ at: 2 }));
    st.setPosition('x.json', 3);
    expect(st.pendingReview(10).map((i) => i.itemId).sort()).toEqual(['q1', 'q2']);
    expect(st.getPosition('x.json')).toBe(3);
  });

  it('keeps the in-memory history when writes fail and storage stays empty (blocked storage)', () => {
    const s = { getItem: () => null, setItem() { throw new Error('quota'); } };
    const st = createLessonStore(s);
    st.recordAttempt('q1', miss());
    st.recordAttempt('q2', miss({ at: 2 }));
    expect(st.pendingCount()).toBe(2);
  });

  it('enqueueReview adds an item once and leaves an existing entry untouched', () => {
    const st = createLessonStore(fakeStorage());
    st.recordAttempt('sql1', { ok: true, hints: 1, kind: 'sql', ref, at: 10 });
    expect(st.pendingCount()).toBe(0);
    st.enqueueReview('sql1', { ref, kind: 'sql', at: 20 });
    expect(st.pendingReview(20)[0]).toMatchObject({ itemId: 'sql1', ref, kind: 'sql', due: 20, streak: 0 });
    st.markReview('sql1', true, 30);
    const before = st.pendingReview(30)[0];
    st.enqueueReview('sql1', { ref, kind: 'sql', at: 40 });
    expect(st.pendingReview(40)[0]).toEqual(before);
  });

  it('a right answer is due at the local midnight that starts day +1, then day +3', () => {
    const st = createLessonStore(fakeStorage());
    st.recordAttempt('q1', miss({ at: at(20) })); // Sunday 25 Oct, 20:00
    expect(st.pendingReview(at(20))[0].due).toBe(at(20));
    st.markReview('q1', true, at(21));
    expect(st.pendingReview(at(21))[0]).toMatchObject({ streak: 1, due: new Date(2026, 9, 26, 0, 0).getTime() });
    // Monday 08:00: the item counts as due, and a right answer moves it on
    const monday8 = at(8, 26);
    expect(st.dueCount(monday8)).toBe(1);
    st.markReview('q1', true, monday8);
    expect(st.pendingReview(monday8)[0]).toMatchObject({ streak: 2, due: new Date(2026, 9, 29, 0, 0).getTime() });
    st.markReview('q1', false, at(9, 27));
    expect(st.pendingReview(at(9, 27))[0]).toMatchObject({ streak: 0, due: at(9, 27) });
  });
});
