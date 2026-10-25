// Final fix wave, test UI: grading stops at the first timeout or engine fault (item 24), the time-up hand-in waits at most 20 s
// (item 14) and the time-up note fits the mode (item 16).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { gradeParts } from '../../src/components/blocks/test/sqlGrading.js';
import { FLUSH_CAP_MS, flushWithin, timeUpText } from '../../src/components/blocks/test/testLogic.js';

const rowsOf = (rows) => ({ kind: 'rows', columns: ['A'], rows, rowCount: rows.length });
const part = (id) => ({ id, label: id, dataset: 'facultate', kind: 'query', solution: 'x', check: { order: 'any', mode: 'bag' }, points: 3 });
const exp = async () => ({ columns: ['A'], rows: [['1']] });
const fail = (code) => Object.assign(new Error(code), { code });

describe('item 24: a timeout or engine fault ends the hand-in at once', () => {
  for (const code of ['TIMEOUT', 'ENGINE_ERROR', 'CANCELLED']) {
    it(`${code} on part (a)'s first dataset makes one run call, not four`, async () => {
      let runs = 0;
      const client = { reset: async () => {}, run: async () => { runs++; throw fail(code); } };
      const r = await gradeParts({ client, parts: [part('p7a'), part('p7b')], base: 'facultate', texts: { p7a: 'select 1', p7b: 'select 2' }, loadExpected: exp });
      expect(runs).toBe(1);
      expect(r.status).toBe('ungraded');
      expect(r.issue.kind).toBe({ TIMEOUT: 'timeout', ENGINE_ERROR: 'engine', CANCELLED: 'silent' }[code]);
    });
  }
  it('a missing answer key keeps grading the other entries', async () => {
    let runs = 0;
    const client = { reset: async () => {}, run: async () => { runs++; return rowsOf([['1']]); } };
    const r = await gradeParts({ client, parts: [part('p7a'), part('p7b')], base: 'facultate', texts: { p7a: 'select 1', p7b: 'select 2' }, loadExpected: async () => { throw new Error('404'); } });
    expect(runs).toBe(4);
    expect(r).toMatchObject({ status: 'ungraded', issue: { kind: 'expected' } });
  });
  it('a missing key followed by a timeout reports the timeout', async () => {
    let n = 0;
    const client = { reset: async () => {}, run: async () => { n++; if (n === 2) throw fail('TIMEOUT'); return rowsOf([['1']]); } };
    let k = 0;
    const r = await gradeParts({ client, parts: [part('p1')], base: 'facultate', texts: { p1: 'select 1' }, loadExpected: async () => { k++; if (k === 1) throw new Error('404'); return exp(); } });
    expect(r.issue.kind).toBe('timeout');
  });
});

describe('item 14: the time-up hand-in waits at most FLUSH_CAP_MS', () => {
  afterEach(() => vi.useRealTimers());
  it('returns every outcome when the flushes finish in time', async () => {
    const r = await flushWithin(new Map([['a', async () => 'done'], ['b', async () => 'needs-score'], ['c', async () => { throw new Error('x'); }]]));
    expect(r).toEqual({ outcomes: { a: 'done', b: 'needs-score', c: 'done' }, pending: [] });
  });
  it('stops waiting at the cap and lists the questions still pending', async () => {
    vi.useFakeTimers();
    const never = () => new Promise(() => {});
    const late = () => new Promise((res) => setTimeout(() => res('done'), FLUSH_CAP_MS + 5000));
    let settled = null;
    flushWithin(new Map([['p1', async () => 'done'], ['p3', never], ['p4', late]])).then((r) => { settled = r; });
    await vi.advanceTimersByTimeAsync(FLUSH_CAP_MS - 1);
    expect(settled).toBeNull();
    await vi.advanceTimersByTimeAsync(1);
    expect(settled).toEqual({ outcomes: { p1: 'done' }, pending: ['p3', 'p4'] });
    expect(FLUSH_CAP_MS).toBe(20000);
  });
});

describe('item 16: the time-up note', () => {
  it('mentions paper questions only in paper mode', () => {
    expect(timeUpText('paper').ro).toContain('notează-te singur la întrebările pe hârtie');
    for (const mode of ['practice', 'tutor', 'timed']) {
      const n = timeUpText(mode);
      expect(n).toEqual({ en: 'Time is up. Grading your answers...', ro: 'Timpul a expirat. Se corectează răspunsurile...' });
    }
  });
});
