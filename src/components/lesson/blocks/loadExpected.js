import { expectedPath } from './sqlExerciseSpec.js';

// The frozen Oracle answer of an exercise on a dataset (public/sql/expected/<id>.<dataset>.json), fetched once.
const expectedCache = new Map();
export function loadExpected(id, dataset) {
  const url = `${import.meta.env.BASE_URL}${expectedPath(id, dataset)}`;
  if (!expectedCache.has(url)) {
    const p = fetch(url).then((r) => (r.ok ? r.json() : Promise.reject(new Error(`${url}: ${r.status}`))));
    p.catch(() => expectedCache.delete(url));
    expectedCache.set(url, p);
  }
  return expectedCache.get(url);
}
