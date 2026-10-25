// Final fix wave: the file loaders of the sql blocks. A failed fetch is not cached (item 15), and an expected-answer fetch that never
// answers gives up after 15 s (item 14).
import fs from 'node:fs';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EXPECTED_TIMEOUT_MS, loadExpected } from '../../src/components/lesson/blocks/loadExpected.js';
import { loadDatasetRows, loadDatasetSchema } from '../../src/components/lesson/blocks/datasetFiles.js';

const ROOT = path.resolve(import.meta.dirname, '..', '..');
const facultate = fs.readFileSync(path.join(ROOT, 'public/sql/datasets/facultate.sql'), 'utf8');
const textResponse = (text) => ({ ok: true, status: 200, text: async () => text, json: async () => JSON.parse(text) });

afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

describe('dataset files: a failed load is tried again', () => {
  it('the rows drawer loader fetches again after a first reject', async () => {
    const fetch = vi.fn().mockRejectedValueOnce(new Error('aborted')).mockResolvedValue(textResponse(facultate));
    vi.stubGlobal('fetch', fetch);
    await expect(loadDatasetRows('facultate')).rejects.toThrow();
    const tables = await loadDatasetRows('facultate');
    expect(tables.map((t) => t.table)).toContain('STUDENTI');
    expect(fetch).toHaveBeenCalledTimes(2);
    await loadDatasetRows('facultate'); // a success stays cached
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('the schema loader fetches again after an HTTP error', async () => {
    const fetch = vi.fn().mockResolvedValueOnce({ ok: false, status: 503 }).mockResolvedValue(textResponse(facultate));
    vi.stubGlobal('fetch', fetch);
    await expect(loadDatasetSchema('biblioteca-hidden')).rejects.toThrow();
    const schema = await loadDatasetSchema('biblioteca-hidden');
    expect(schema.length).toBe(5);
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});

describe('expected answers', () => {
  it('a fetch that never answers rejects after the limit and is not cached', async () => {
    vi.useFakeTimers();
    let signal = null;
    const fetch = vi.fn((url, opts) => {
      signal = opts?.signal;
      return new Promise((_, reject) => { opts?.signal?.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' }))); });
    });
    vi.stubGlobal('fetch', fetch);
    const p = loadExpected('bd-x', 'facultate');
    const seen = expect(p).rejects.toMatchObject({ code: 'TIMEOUT' });
    await vi.advanceTimersByTimeAsync(EXPECTED_TIMEOUT_MS - 1);
    expect(signal.aborted).toBe(false);
    await vi.advanceTimersByTimeAsync(2);
    await seen;
    expect(EXPECTED_TIMEOUT_MS).toBe(15000);
    fetch.mockResolvedValue(textResponse('{"columns":["A"],"rows":[]}'));
    await expect(loadExpected('bd-x', 'facultate')).resolves.toEqual({ columns: ['A'], rows: [] });
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
