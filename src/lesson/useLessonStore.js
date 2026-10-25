import { useSyncExternalStore } from 'react';
import { STORAGE_KEY, createLessonStore } from './store.js';

let shared = null;

function memoryStorage() {
  const m = new Map();
  return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { m.set(k, String(v)); } };
}

// One store per page load, backed by localStorage when it is usable. Another tab's write (the `storage` event) reloads it, so an open
// lesson shows that tab's answers and never writes an old copy over them.
export function getLessonStore() {
  if (!shared) {
    let storage;
    try { storage = window.localStorage; storage.getItem(STORAGE_KEY); } catch { storage = memoryStorage(); }
    const store = createLessonStore(storage);
    shared = store;
    try {
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY || e.key === null) store.reload();
      });
    } catch { /* no window events (tests) */ }
  }
  return shared;
}

// Returns the store and re-renders the caller whenever it changes.
export function useLessonStore() {
  const store = getLessonStore();
  useSyncExternalStore(store.subscribe, store.getVersion);
  return store;
}
