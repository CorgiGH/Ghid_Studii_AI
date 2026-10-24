import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { validateMcq, validateReflect } from '../../src/components/lesson/blocks/choiceSpec.js';
import { collectMcqPool, dueLabel, groupReview, itemTag, pickVariant, shuffled } from '../../src/lesson/review.js';
import { fallbackTable, tableFromResult } from '../../src/components/lesson/blocks/reflectTable.js';
import { createLessonStore } from '../../src/lesson/store.js';

// Real staged lesson content: every mcq and reflect block, with the lesson file and screen it sits on.
const real = JSON.parse(readFileSync(new URL('./fixtures/real-choice-blocks.json', import.meta.url), 'utf8'));
const realMcq = real.filter(r => r.block.type === 'mcq');
const realReflect = real.filter(r => r.block.type === 'reflect');

const bi = (s) => ({ en: s, ro: s });
const opt = (correct, misconception) => ({ text: bi('o'), correct, explain: bi('e'), ...(correct ? {} : { misconception }) });
const mcq = (id, tags) => ({ type: 'mcq', id, question: bi('q'), options: [opt(true), ...tags.map(t => opt(false, t))] });
const lessonsOf = (blocks) => [{ src: 'bd/courses/lesson-x.json', course: { steps: [{ blocks }] } }];

describe('mcq / reflect validator', () => {
  it('accepts every real staged block', () => {
    expect(realMcq.length).toBeGreaterThan(100);
    expect(realReflect.length).toBeGreaterThan(40);
    for (const { block } of realMcq) expect(validateMcq(block), block.id).toEqual([]);
    for (const { block } of realReflect) expect(validateReflect(block), block.id).toEqual([]);
  });

  it('rejects an mcq with two correct options', () => {
    const b = mcq('q1', ['t']);
    b.options[1] = { ...b.options[1], correct: true };
    expect(validateMcq(b).join(' ')).toMatch(/exactly one correct/);
  });

  it('rejects an mcq with no correct option', () => {
    const b = mcq('q1', ['a', 'b']);
    b.options[0] = { ...b.options[0], correct: false, misconception: 'x' };
    expect(validateMcq(b).join(' ')).toMatch(/exactly one correct/);
  });

  it('rejects a wrong option without a misconception tag', () => {
    const b = mcq('q1', ['t']);
    delete b.options[1].misconception;
    expect(validateMcq(b).join(' ')).toMatch(/no misconception/);
  });

  it('rejects missing translations and a bad review id', () => {
    const b = mcq('q1', ['t']);
    b.options[0].explain = { en: 'x' };
    b.review = 'lesson 3';
    const msg = validateMcq(b).join(' ');
    expect(msg).toMatch(/explain must have en \+ ro/);
    expect(msg).toMatch(/review must be a lesson id/);
  });

  it('rejects a reflect without an answer or with a half table', () => {
    expect(validateReflect({ id: 'r', prompt: bi('p') }).join(' ')).toMatch(/answer/);
    expect(validateReflect({ id: 'r', prompt: bi('p'), answer: bi('a'), table: { dataset: 'facultate' } }).join(' ')).toMatch(/table/);
    expect(validateReflect({ id: 'r', prompt: bi('p'), answer: bi('a'), table: { dataset: 'facultate', sql: 'SELECT 1 FROM dual' } })).toEqual([]);
  });
});

describe('variant picker', () => {
  const pool = collectMcqPool(lessonsOf([mcq('a', ['null-eq', 'x']), mcq('b', ['null-eq']), mcq('c', ['other'])]));
  const item = { itemId: 'a', tag: 'null-eq' };

  it('returns a different item with the same tag when one exists', () => {
    const v = pickVariant(item, pool);
    expect(v.reshuffled).toBe(false);
    expect(v.entry.id).toBe('b');
  });

  it('falls back to the same item reshuffled when the tag is unique', () => {
    const v = pickVariant({ itemId: 'c', tag: 'other' }, pool, { rand: () => 0 });
    expect(v.reshuffled).toBe(true);
    expect(v.entry.id).toBe('c');
    expect(v.block.options.map(o => o.correct)).toContain(true);
    expect(v.block.options).toHaveLength(pool[2].block.options.length);
  });

  it('uses the first wrong option tag when the item stored none', () => {
    expect(itemTag({ itemId: 'a' }, pool[0].block)).toBe('null-eq');
    expect(pickVariant({ itemId: 'a' }, pool).entry.id).toBe('b');
  });

  it('avoids variants already shown while others remain', () => {
    const p = collectMcqPool(lessonsOf([mcq('a', ['t']), mcq('b', ['t']), mcq('c', ['t'])]));
    const seen = new Set();
    let avoid = [];
    for (let i = 0; i < 2; i++) {
      const v = pickVariant({ itemId: 'a', tag: 't' }, p, { avoid, rand: () => 0 });
      seen.add(v.entry.id);
      avoid = [...avoid, v.entry.id];
    }
    expect([...seen].sort()).toEqual(['b', 'c']);
    // once all have been shown it starts over instead of failing
    expect(pickVariant({ itemId: 'a', tag: 't' }, p, { avoid, rand: () => 0 }).entry.id).toBeTruthy();
  });

  it('returns null when the item is gone and nothing else matches', () => {
    expect(pickVariant({ itemId: 'zzz', tag: 'nope' }, pool)).toBeNull();
  });

  it('works on the real tags: every wrong option has a different item with the same tag', () => {
    const realPool = collectMcqPool([{ src: 'all', course: { steps: [{ blocks: realMcq.map(r => r.block) }] } }]);
    let checked = 0;
    for (const { block } of realPool) {
      for (const o of block.options.filter(x => !x.correct)) {
        const v = pickVariant({ itemId: block.id, tag: o.misconception }, realPool, { rand: () => 0.5 });
        expect(v.reshuffled, `${block.id} / ${o.misconception}`).toBe(false);
        expect(v.entry.id).not.toBe(block.id);
        expect(v.block.options.some(x => x.misconception === o.misconception)).toBe(true);
        checked++;
      }
    }
    expect(checked).toBeGreaterThan(250);
  });

  it('shuffles without losing or duplicating options', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(shuffled(arr, () => 0.3).sort()).toEqual(arr);
  });
});

describe('review pile: three right answers on three days', () => {
  const DAY = 24 * 3600 * 1000;
  const mem = () => { const m = new Map(); return { getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)) }; };

  it('a miss shows up, three right answers on later days remove it', () => {
    const st = createLessonStore(mem());
    const ref = { src: 'bd/courses/lesson-01.json', screen: 2 };
    const t0 = Date.UTC(2026, 9, 26);
    st.recordAttempt('q', { ok: false, hints: 0, kind: 'mcq', misconception: 't', ref, at: t0 });
    expect(st.pendingReview(t0).map(i => i.itemId)).toEqual(['q']);
    st.markReview('q', true, t0);
    expect(st.pendingReview(t0 + DAY)[0].due).toBe(t0 + DAY);
    st.markReview('q', true, t0 + DAY);
    expect(st.pendingReview(t0 + DAY)[0].due).toBe(t0 + 4 * DAY);
    st.markReview('q', true, t0 + 4 * DAY);
    expect(st.pendingReview(t0 + 4 * DAY)).toEqual([]);
  });
});

describe('review list helpers', () => {
  const NOW = 10 * 24 * 3600 * 1000;
  const DAY = 24 * 3600 * 1000;
  const it_ = (itemId, src, due) => ({ itemId, ref: { src, screen: 1 }, kind: 'mcq', due, streak: 0 });

  it('labels due dates in both languages', () => {
    expect(dueLabel(NOW - 5, NOW, 'ro')).toBe('acum');
    expect(dueLabel(NOW + 3600 * 1000, NOW, 'ro')).toBe('mâine');
    expect(dueLabel(NOW + 3 * DAY, NOW, 'ro')).toBe('în 3 zile');
    expect(dueLabel(NOW + 3 * DAY, NOW, 'en')).toBe('in 3 days');
  });

  it('groups by lesson with due items first', () => {
    const g = groupReview([it_('a', 'L2', NOW + DAY), it_('b', 'L1', NOW - 1), it_('c', 'L2', NOW - 2), it_('d', 'L1', NOW + 3 * DAY)].sort((x, y) => x.due - y.due), NOW);
    expect(g.map(x => x.src)).toEqual(['L2', 'L1']);
    expect(g[0].items.map(i => i.itemId)).toEqual(['c', 'a']);
    expect(g[0].dueCount).toBe(1);
    expect(g[1].items.map(i => i.isDue)).toEqual([true, false]);
  });

  it('an empty pile gives no groups', () => {
    expect(groupReview([], NOW)).toEqual([]);
  });
});

describe('reflect table fallback', () => {
  it('selects columns, filters and orders over the lab data', () => {
    const t = fallbackTable("SELECT nr_matricol, id_curs, valoare FROM note WHERE id_curs = '24'");
    expect(t.columns).toEqual(['NR_MATRICOL', 'ID_CURS', 'VALOARE']);
    expect(t.rows.length).toBeGreaterThan(3);
    const o = fallbackTable('SELECT nume, prenume, an FROM studenti ORDER BY an, nr_matricol');
    expect(o.rows.map(r => r.AN)).toEqual([...o.rows.map(r => r.AN)].sort((a, b) => a - b));
  });
  it('shows dates the Oracle way, DD-MON-RR', () => {
    const t = fallbackTable("SELECT nume, prenume, data_nastere FROM studenti WHERE nume = 'Popescu'");
    expect(t.rows.length).toBeGreaterThan(0);
    for (const r of t.rows) expect(r.DATA_NASTERE).toMatch(/^\d{2}-[A-Z]{3}-\d{2}$/);
    expect(fallbackTable('SELECT * FROM studenti').rows.every(r => !/^\d{4}-/.test(String(r.DATA_NASTERE)))).toBe(true);
  });
  it('gives up on joins and functions', () => {
    expect(fallbackTable('SELECT * FROM dual')).toBeNull();
    expect(fallbackTable('SELECT s.nume FROM studenti s JOIN note n ON 1=1')).toBeNull();
    expect(fallbackTable("SELECT nume, data_nastere, SYSDATE AS azi FROM studenti")).toBeNull();
  });
  it('turns an engine result into table rows', () => {
    expect(tableFromResult({ columns: ['A', 'B'], rows: [[1, null]] })).toEqual({ columns: ['A', 'B'], rows: [{ A: 1, B: null }] });
    expect(tableFromResult({ error: { code: 'ORA-00942' }, columns: [], rows: [] })).toBeNull();
  });
});
