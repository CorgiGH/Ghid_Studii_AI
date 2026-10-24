// Lesson state: screen position per lesson, attempt history and the review pile.
// Persisted as one versioned JSON blob. Anything unreadable or from another
// version is ignored and the store starts empty.
export const STORAGE_KEY = 'bdLessonState.v1';
const DAY = 24 * 60 * 60 * 1000;
const MAX_ATTEMPTS = 12;
const REVIEW_GAPS = [1, 3]; // days after the 1st and 2nd right answer

const emptyState = () => ({ v: 1, positions: {}, attempts: {}, review: {} });

function isObj(x) {
  return x !== null && typeof x === 'object' && !Array.isArray(x);
}

function load(storage) {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const data = JSON.parse(raw);
    if (!isObj(data) || data.v !== 1) return emptyState();
    return {
      v: 1,
      positions: isObj(data.positions) ? data.positions : {},
      attempts: isObj(data.attempts) ? data.attempts : {},
      review: isObj(data.review) ? data.review : {},
    };
  } catch {
    return emptyState();
  }
}

export function createLessonStore(storage) {
  let state = load(storage);
  const listeners = new Set();
  let version = 0;

  function commit() {
    version += 1;
    try { storage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* quota or blocked: keep working in memory */ }
    listeners.forEach(fn => fn());
  }

  return {
    getPosition(src) {
      const n = state.positions[src];
      return Number.isInteger(n) && n >= 1 ? n : 1;
    },
    setPosition(src, screen) {
      if (!Number.isInteger(screen) || screen < 1 || state.positions[src] === screen) return;
      state = { ...state, positions: { ...state.positions, [src]: screen } };
      commit();
    },
    recordAttempt(itemId, a) {
      const history = [...(state.attempts[itemId] || []), a].slice(-MAX_ATTEMPTS);
      const review = { ...state.review };
      const enqueue = (!a.ok && !a.skipped) || (a.hints || 0) >= 3;
      if (enqueue) {
        review[itemId] = { itemId, ref: a.ref, kind: a.kind, tag: a.misconception || null, due: a.at, streak: 0 };
      }
      state = { ...state, attempts: { ...state.attempts, [itemId]: history }, review };
      commit();
    },
    pendingReview(now) {
      void now;
      return Object.values(state.review).sort((x, y) => x.due - y.due);
    },
    // Spaced schedule: a miss puts the item due now (streak 0). Right answers move it
    // to +1 day, then +3 days, and the third right answer removes it. A right answer
    // on an item that is not due yet is only practice and changes nothing.
    markReview(itemId, ok, now) {
      const item = state.review[itemId];
      if (!item) return;
      const review = { ...state.review };
      if (!ok) review[itemId] = { ...item, streak: 0, due: now };
      else if (item.due > now) return;
      else if (item.streak >= REVIEW_GAPS.length) delete review[itemId];
      else review[itemId] = { ...item, streak: item.streak + 1, due: now + REVIEW_GAPS[item.streak] * DAY };
      state = { ...state, review };
      commit();
    },
    pendingCount() {
      return Object.keys(state.review).length;
    },
    // Attempts recorded for a given screen of a lesson file (used to re-open a gate after a reload).
    attemptsAt(src, screen) {
      const out = [];
      for (const list of Object.values(state.attempts)) {
        for (const a of list) if (a?.ref?.src === src && a.ref.screen === screen) out.push(a);
      }
      return out;
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    getVersion: () => version,
  };
}
