import { expectedPath } from './sqlExerciseSpec.js';
import { cachedLoad, fetchWithin } from './datasetFiles.js';

// How long a fetch of an expected answer may take before it gives up (a stalled request must not hold a hand-in forever).
export const EXPECTED_TIMEOUT_MS = 15000;

// The frozen Oracle answer of an exercise on a dataset (public/sql/expected/<id>.<dataset>.json), fetched once. A fetch that failed
// or timed out is dropped from the cache, so the next call tries again.
const expectedCache = new Map();
export function loadExpected(id, dataset) {
  const url = `${import.meta.env.BASE_URL}${expectedPath(id, dataset)}`;
  return cachedLoad(expectedCache, url, () => fetchWithin(url, EXPECTED_TIMEOUT_MS));
}
