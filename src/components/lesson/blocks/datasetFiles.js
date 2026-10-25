// The files the sql blocks fetch from public/sql: each one once per page. A load that failed is not kept, so the next call (a retry
// button, the drawer opened again) fetches it again instead of failing for the life of the page.
import { rowsFromSql, schemaFromSql } from './sqlExerciseSpec.js';

export const FILE_TIMEOUT_MS = 15000;

// cache: Map key -> Promise. A rejected promise leaves the cache (unless a newer load already took its place).
export function cachedLoad(cache, key, load) {
  if (!cache.has(key)) {
    const p = Promise.resolve().then(load);
    cache.set(key, p);
    p.catch(() => { if (cache.get(key) === p) cache.delete(key); });
  }
  return cache.get(key);
}

// fetch(url) that gives up after `ms` (body included): rejects with { code: 'TIMEOUT' }, or with the HTTP status when it is not ok.
export async function fetchWithin(url, ms = FILE_TIMEOUT_MS, read = (r) => r.json()) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctrl.signal });
    if (!r.ok) throw new Error(`${url}: ${r.status}`);
    return await read(r);
  } catch (e) {
    if (ctrl.signal.aborted) throw Object.assign(new Error(`${url}: no answer within ${ms} ms`), { code: 'TIMEOUT' });
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

const datasetUrl = (dataset) => `${import.meta.env.BASE_URL}sql/datasets/${dataset}.sql`;
const rowsCache = new Map(); // dataset -> Promise<[{ table, columns, rows }]>
const schemaCache = new Map(); // dataset -> Promise<[{ table, columns }]>

// The rows of a dataset file, table by table (the review variant's drawer).
export const loadDatasetRows = (dataset) => cachedLoad(rowsCache, dataset, () => fetchWithin(datasetUrl(dataset), FILE_TIMEOUT_MS, (r) => r.text()).then(rowsFromSql));

// The tables and columns of a dataset (a hidden twin has the same schema as its lab dataset), read from the file.
export const loadDatasetSchema = (dataset) => {
  const base = dataset.replace(/-hidden$/, '');
  return cachedLoad(schemaCache, base, () => fetchWithin(datasetUrl(base), FILE_TIMEOUT_MS, (r) => r.text()).then(schemaFromSql));
};
