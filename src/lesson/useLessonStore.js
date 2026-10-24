import { useSyncExternalStore } from 'react';
import { createLessonStore } from './store.js';

let shared = null;

function memoryStorage() {
  const m = new Map();
  return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { m.set(k, String(v)); } };
}

// One store per page load, backed by localStorage when it is usable.
export function getLessonStore() {
  if (!shared) {
    let storage;
    try { storage = window.localStorage; storage.getItem('bdLessonState.v1'); } catch { storage = memoryStorage(); }
    shared = createLessonStore(storage);
  }
  return shared;
}

// Returns the store and re-renders the caller whenever it changes.
export function useLessonStore() {
  const store = getLessonStore();
  useSyncExternalStore(store.subscribe, store.getVersion);
  return store;
}
