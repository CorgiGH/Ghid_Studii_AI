// Lesson state: screen position per lesson, attempt history and the review pile.
// Persisted as one versioned JSON blob. Anything unreadable or from another
// version is ignored and the store starts empty.
//
// Several tabs share the blob: every change re-reads storage first and applies itself to that fresh copy, so one tab never writes
// back an old copy over another tab's work. When storage cannot be read (or our own writes do not reach it), the copy in memory is
// kept as it is.
export const STORAGE_KEY = 'bdLessonState.v1';
const MAX_ATTEMPTS = 12;
const REVIEW_GAPS = [1, 3]; // days after the 1st and 2nd right answer

const emptyState = () => ({ v: 1, positions: {}, attempts: {}, review: {} });

function isObj(x) {
  return x !== null && typeof x === 'object' && !Array.isArray(x);
}

function parse(raw) {
  if (!raw) return emptyState();
  try {
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

// The local midnight that starts the day `days` after the day of `now` (setDate counts calendar days, so a daylight-saving change
// cannot shift it).
export function midnightAfter(now, days) {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d.getTime();
}

export function createLessonStore(storage) {
  let lastRaw;
  let writable = true; // false once a write failed: storage then no longer holds what this tab did
  let state = emptyState();
  const listeners = new Set();
  let version = 0;

  // Brings in what storage holds now (another tab may have written). Returns false when storage cannot be read.
  function refresh() {
    if (!writable) return false;
    let raw;
    try { raw = storage.getItem(STORAGE_KEY); } catch { return false; }
    if (raw !== lastRaw) {
      lastRaw = raw;
      state = parse(raw);
    }
    return true;
  }
  refresh();

  function notify() {
    version += 1;
    listeners.forEach(fn => fn());
  }

  let checked = false; // the first write is read back once: a storage that does not keep it is not read again
  function commit() {
    try {
      const raw = JSON.stringify(state);
      storage.setItem(STORAGE_KEY, raw);
      if (!checked) {
        checked = true;
        if (storage.getItem(STORAGE_KEY) !== raw) writable = false;
      }
      lastRaw = raw;
    } catch { writable = false; /* quota or blocked: keep working in memory */ }
    notify();
  }

  // Every change: fresh copy from storage, then the change, then the write.
  function change(fn) {
    refresh();
    const next = fn(state);
    if (!next || next === state) return;
    state = next;
    commit();
  }

  return {
    // True once the learner has opened this lesson (a position was stored for it).
    hasPosition(src) {
      return Number.isInteger(state.positions[src]);
    },
    getPosition(src) {
      const n = state.positions[src];
      return Number.isInteger(n) && n >= 1 ? n : 1;
    },
    setPosition(src, screen) {
      if (!Number.isInteger(screen) || screen < 1) return;
      change(s => (s.positions[src] === screen ? s : { ...s, positions: { ...s.positions, [src]: screen } }));
    },
    recordAttempt(itemId, a) {
      change(s => {
        const history = [...(s.attempts[itemId] || []), a].slice(-MAX_ATTEMPTS);
        const review = { ...s.review };
        const enqueue = (!a.ok && !a.skipped && !a.unscored) || (a.hints || 0) >= 3;
        if (enqueue) {
          review[itemId] = { itemId, ref: a.ref, kind: a.kind, tag: a.misconception || null, due: a.at, streak: 0 };
        }
        return { ...s, attempts: { ...s.attempts, [itemId]: history }, review };
      });
    },
    // Changes the most recent attempt of an item (the sql block keeps its latest query, verdict and hints there so a reload can
    // bring them back). The review pile is not touched: only recordAttempt and enqueueReview can enqueue.
    updateLastAttempt(itemId, patch) {
      change(s => {
        const list = s.attempts[itemId];
        if (!list || !list.length) return s;
        const history = [...list.slice(0, -1), { ...list[list.length - 1], ...patch }];
        return { ...s, attempts: { ...s.attempts, [itemId]: history } };
      });
    },
    // Puts an item in the review pile, due at `at`, unless it is there already (an existing entry keeps its schedule).
    enqueueReview(itemId, { ref, kind, tag = null, at }) {
      change(s => (s.review[itemId] ? s : { ...s, review: { ...s.review, [itemId]: { itemId, ref, kind, tag, due: at, streak: 0 } } }));
    },
    pendingReview(now) {
      void now;
      return Object.values(state.review).sort((x, y) => x.due - y.due);
    },
    // Spaced schedule: a miss puts the item due now (streak 0). Right answers move it to the local midnight that starts the next
    // day, then the one three days on, and the third right answer removes it. A right answer on an item that is not due yet is only
    // practice and changes nothing.
    markReview(itemId, ok, now) {
      change(s => {
        const item = s.review[itemId];
        if (!item) return s;
        const review = { ...s.review };
        if (!ok) review[itemId] = { ...item, streak: 0, due: now };
        else if (item.due > now) return s;
        else if (item.streak >= REVIEW_GAPS.length) delete review[itemId];
        else review[itemId] = { ...item, streak: item.streak + 1, due: midnightAfter(now, REVIEW_GAPS[item.streak]) };
        return { ...s, review };
      });
    },
    pendingCount() {
      return Object.keys(state.review).length;
    },
    // Items due now (the Recapitulare tab badge counts these, not the ones scheduled for later).
    dueCount(now) {
      return Object.values(state.review).filter(i => i.due <= now).length;
    },
    // Attempts recorded for a given screen of a lesson file (used to re-open a gate after a reload).
    attemptsAt(src, screen) {
      const out = [];
      for (const list of Object.values(state.attempts)) {
        for (const a of list) if (a?.ref?.src === src && a.ref.screen === screen) out.push(a);
      }
      return out;
    },
    // Another tab changed storage: read it again and re-render whoever listens.
    reload() {
      const before = state;
      refresh();
      if (state !== before) notify();
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    getVersion: () => version,
  };
}
