import { describe, it, expect } from 'vitest';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execPath } from 'node:process';
import {
  SCHEMA_TABLES, checkSpecOf, clockOf, datasetFor, expectedPath, markRows, paperChecklist, restoreSqlState, runOptions, schemaFromSql, slimVerdict,
  statementRows, validateSqlExercise, verdictView,
} from '../../src/components/lesson/blocks/sqlExerciseSpec.js';
import { createLessonStore } from '../../src/lesson/store.js';
import { seedGate } from '../../src/components/lesson/playerLogic.js';

// Real staged lesson content: every sql-exercise block, with the lesson file and screen it sits on.
const real = JSON.parse(readFileSync(new URL('./fixtures/real-sql-blocks.json', import.meta.url), 'utf8'));

const bi = (s) => ({ en: s, ro: s });
const block = (over = {}) => ({
  type: 'sql-exercise', id: 'bd-l02-ex2', dataset: 'facultate', kind: 'query', prompt: bi('p'),
  solution: 'SELECT DISTINCT bursa FROM studenti', check: { order: 'any', mode: 'bag' },
  hints: [bi('a'), bi('b'), bi('c')], explain: bi('e'), ...over,
});

describe('sql-exercise validator', () => {
  it('accepts every real staged block', () => {
    expect(real.length).toBe(71);
    for (const { block: b } of real) expect(validateSqlExercise(b), b.id).toEqual([]);
  });

  it('accepts a block with every optional field', () => {
    const b = block({
      official: { lab: 2, ex: 2 }, starter: 'SELECT …', clock: '2026-08-26', altSolutions: ['SELECT bursa FROM studenti GROUP BY bursa'],
      check: { order: 'required', mode: 'set', orderBy: ['NUME'], aliases: ['A', ''], cosmetic: ['', 'trim-case'] },
    });
    expect(validateSqlExercise(b)).toEqual([]);
    expect(validateSqlExercise(block({ official: { lab: 1, ex: 'inline-2' } }))).toEqual([]);
    expect(validateSqlExercise(block({ check: { order: 'any', mode: 'bag', aliases: 'any-distinct' } }))).toEqual([]);
  });

  it('rejects a block without a solution', () => {
    const b = block();
    delete b.solution;
    expect(validateSqlExercise(b).join(' ')).toMatch(/solution/);
  });

  it('rejects a block with two hints (or four)', () => {
    expect(validateSqlExercise(block({ hints: [bi('a'), bi('b')] })).join(' ')).toMatch(/exactly 3 hints/);
    expect(validateSqlExercise(block({ hints: [bi('a'), bi('b'), bi('c'), bi('d')] })).join(' ')).toMatch(/exactly 3 hints/);
  });

  it('rejects an unknown dataset and an unknown kind', () => {
    expect(validateSqlExercise(block({ dataset: 'northwind' })).join(' ')).toMatch(/dataset/);
    expect(validateSqlExercise(block({ kind: 'script' })).join(' ')).toMatch(/kind/);
  });

  it('rejects missing translations, a missing explain and a bad check', () => {
    expect(validateSqlExercise(block({ prompt: { en: 'only' } })).join(' ')).toMatch(/prompt/);
    expect(validateSqlExercise(block({ hints: [bi('a'), bi('b'), { en: 'x', ro: '' }] })).join(' ')).toMatch(/hints\[2\]/);
    const noExplain = block();
    delete noExplain.explain;
    expect(validateSqlExercise(noExplain).join(' ')).toMatch(/explain/);
    expect(validateSqlExercise(block({ check: { order: 'sometimes', mode: 'bag' } })).join(' ')).toMatch(/check.order/);
    expect(validateSqlExercise(block({ check: { order: 'any', mode: 'list' } })).join(' ')).toMatch(/check.mode/);
    expect(validateSqlExercise(block({ check: { order: 'any', mode: 'bag', cosmetic: ['upper'] } })).join(' ')).toMatch(/cosmetic/);
  });

  it('a state exercise needs check.tables', () => {
    expect(validateSqlExercise(block({ kind: 'state' })).join(' ')).toMatch(/check.tables/);
    expect(validateSqlExercise(block({ kind: 'state', check: { order: 'any', mode: 'bag', tables: ['PROFESORI'] } }))).toEqual([]);
  });

  it('rejects a bad clock, a bad official and a bad starter', () => {
    expect(validateSqlExercise(block({ clock: 'tomorrow' })).join(' ')).toMatch(/clock/);
    expect(validateSqlExercise(block({ official: { lab: 2 } })).join(' ')).toMatch(/official/);
    expect(validateSqlExercise(block({ starter: 5 })).join(' ')).toMatch(/starter/);
  });
});

describe('verdictView', () => {
  const kinds = ['correct', 'rows', 'rowcount', 'order', 'columns', 'alias', 'error', 'not-oracle', 'structure', 'contents'];
  it('gives every verdict kind a Romanian headline, an English one and a tone', () => {
    const seen = new Set();
    for (const kind of kinds) {
      const v = verdictView({ ok: kind === 'correct', kind, missing: [], extra: [] });
      expect(v.ro, kind).toMatch(/\S/);
      expect(v.en, kind).toMatch(/\S/);
      expect(['ok', 'bad', 'warn']).toContain(v.tone);
      seen.add(v.ro);
    }
    expect(seen.size).toBe(kinds.length);
  });

  it('the headlines say what happened in Romanian', () => {
    expect(verdictView({ ok: true, kind: 'correct' }).ro).toBe('Corect');
    expect(verdictView({ ok: false, kind: 'rowcount' }).ro).toMatch(/rânduri/);
    expect(verdictView({ ok: false, kind: 'order' }).ro).toMatch(/ordine/);
    expect(verdictView({ ok: false, kind: 'error', code: 'ORA-00904' }).ro).toMatch(/ORA-00904/);
    expect(verdictView({ ok: false, kind: 'not-oracle' }).ro).toMatch(/Oracle/);
    expect(verdictView({ ok: false, kind: 'contents', table: 'PROFESORI' }).ro).toMatch(/PROFESORI/);
  });

  it('an unknown kind still gets a headline', () => {
    expect(verdictView({ ok: false, kind: 'whatever' }).ro).toMatch(/\S/);
  });
});

describe('what the block asks the engine and the files', () => {
  it('clockOf turns a date into the 14:30 timestamp the engine takes', () => {
    expect(clockOf('2026-08-26')).toBe('2026-08-26 14:30:00');
    expect(clockOf('2026-08-26 09:00:00')).toBe('2026-08-26 09:00:00');
    expect(clockOf(undefined)).toBeUndefined();
  });

  it('a clock exercise passes the clock option; the others pass none', () => {
    expect(runOptions(block({ clock: '2026-08-26' }), { hidden: false })).toEqual({ dataset: 'facultate', clock: '2026-08-26 14:30:00' });
    expect(runOptions(block(), { hidden: false })).toEqual({ dataset: 'facultate' });
  });

  it('a state exercise runs as a script', () => {
    expect(runOptions(block({ kind: 'state', check: { order: 'any', mode: 'bag', tables: ['T'] } }), { hidden: false }).script).toBe(true);
  });

  it('the hidden variant uses the hidden dataset and its own expected file', () => {
    expect(datasetFor(block(), false)).toBe('facultate');
    expect(datasetFor(block(), true)).toBe('facultate-hidden');
    expect(datasetFor(block({ dataset: 'biblioteca' }), true)).toBe('biblioteca-hidden');
    expect(runOptions(block(), { hidden: true }).dataset).toBe('facultate-hidden');
    expect(expectedPath('bd-l02-ex2', 'facultate-hidden')).toBe('sql/expected/bd-l02-ex2.facultate-hidden.json');
  });

  it('checkSpecOf carries kind, cosmetic and tables to the checker', () => {
    const spec = checkSpecOf(block({ kind: 'state', check: { order: 'any', mode: 'set', tables: ['A'], cosmetic: ['trim-case'] } }));
    expect(spec).toMatchObject({ kind: 'state', mode: 'set', tables: ['A'], cosmetic: ['trim-case'] });
    expect(checkSpecOf(block({ check: undefined })).order).toBe('any');
  });
});

describe('markRows', () => {
  it('marks the rows listed as missing/extra, one listed row per matching row', () => {
    const rows = [['a', '1'], ['b', null], ['a', '1']];
    expect(markRows(rows, [['a', '1']])).toEqual([true, false, false]);
    expect(markRows(rows, [['a', '1'], ['a', '1']])).toEqual([true, false, true]);
    expect(markRows(rows, [['b', null]])).toEqual([false, true, false]);
    expect(markRows(rows, [])).toEqual([false, false, false]);
    expect(markRows(rows, undefined)).toEqual([false, false, false]);
  });
});

describe('statementRows', () => {
  it('names each statement of a script with its status', () => {
    const rows = statementRows([
      { sql: 'CREATE TABLE t (a NUMBER)', kind: 'ddl', rowCount: 0 },
      { sql: 'INSERT INTO t VALUES (1)', kind: 'dml', rowCount: 1 },
      { sql: 'SELEC 1', kind: 'rows', rowCount: 0, error: { code: 'ORA-00900', message: 'invalid SQL statement' } },
    ]);
    expect(rows.map((r) => r.ok)).toEqual([true, true, false]);
    expect(rows[2].code).toBe('ORA-00900');
    expect(rows[1].note).toMatch(/1/);
    expect(statementRows(undefined)).toEqual([]);
  });
});

describe('paperChecklist', () => {
  it('lists what to compare, from the expected table and the check', () => {
    const items = paperChecklist(block({ check: { order: 'required', mode: 'bag', orderBy: ['NUME'], aliases: ['Astazi'] } }), { columns: ['NUME', 'BURSA'], rows: [['a', '1'], ['b', '2']] });
    const text = items.map((i) => i.ro).join(' | ');
    expect(text).toMatch(/NUME, BURSA/);
    expect(text).toMatch(/2 rânduri/);
    expect(text).toMatch(/ordinea/);
    expect(text).toMatch(/Astazi/);
    expect(items.every((i) => i.en && i.ro)).toBe(true);
  });

  it('a state exercise lists its tables', () => {
    const items = paperChecklist(block({ kind: 'state', check: { order: 'any', mode: 'bag', tables: ['PROFESORI'] } }), { PROFESORI: { columns: ['A'], rows: [['x']] } });
    expect(items.map((i) => i.ro).join(' ')).toMatch(/PROFESORI/);
  });
});

describe('restoring the block after a reload', () => {
  const ref = { src: 'bd/courses/lesson-02.json', screen: 4 };
  const verdict = { ok: false, kind: 'rowcount', code: undefined, missing: [['a']], extra: [['b'], ['c']] };

  it('slimVerdict keeps the parts the panel shows and caps the row lists', () => {
    const many = Array.from({ length: 80 }, (_, i) => [String(i)]);
    const s = slimVerdict({ ...verdict, missing: many, extra: many, mistake: 'eq-null', code: 'ORA-1' });
    expect(s.missing.length).toBeLessThanOrEqual(20);
    expect(s).toMatchObject({ kind: 'rowcount', ok: false, mistake: 'eq-null', code: 'ORA-1' });
  });

  it('restoreSqlState rebuilds query, verdict, hints and reveal from the stored attempt', () => {
    const attempts = [
      { item: 'other', kind: 'sql', sql: 'SELECT 1', ref },
      { item: 'bd-l02-ex2', kind: 'sql', ok: false, sql: 'SELECT bursa FROM studenti', hints: 2, revealed: true, verdict: slimVerdict(verdict), done: true, ref },
    ];
    const r = restoreSqlState(attempts, 'bd-l02-ex2');
    expect(r).toMatchObject({ sql: 'SELECT bursa FROM studenti', hints: 2, revealed: true, verdict: { kind: 'rowcount' } });
    expect(restoreSqlState(attempts, 'missing')).toBeNull();
    expect(restoreSqlState([], 'bd-l02-ex2')).toBeNull();
    expect(restoreSqlState(undefined, 'x')).toBeNull();
  });

  it('hints are capped at 3 and a bad stored value is ignored', () => {
    const r = restoreSqlState([{ item: 'x', kind: 'sql', hints: 9, sql: 5, ref }], 'x');
    expect(r.hints).toBe(3);
    expect(r.sql).toBeNull();
  });

  it('updateLastAttempt changes the stored attempt without touching the review pile', () => {
    const mem = new Map();
    const storage = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v) };
    const store = createLessonStore(storage);
    store.recordAttempt('bd-l02-ex2', { ok: true, hints: 0, kind: 'sql', item: 'bd-l02-ex2', ref, at: 1, sql: 'SELECT 1', done: true });
    expect(store.pendingCount()).toBe(0);
    store.updateLastAttempt('bd-l02-ex2', { sql: 'SELECT 2', hints: 1, revealed: true });
    const [a] = store.attemptsAt(ref.src, ref.screen);
    expect(a).toMatchObject({ ok: true, sql: 'SELECT 2', hints: 1, revealed: true });
    expect(store.pendingCount()).toBe(0);
    expect(createLessonStore(storage).attemptsAt(ref.src, ref.screen)[0].sql).toBe('SELECT 2');
    store.updateLastAttempt('nothing-recorded', { sql: 'x' });
    expect(store.attemptsAt(ref.src, ref.screen)).toHaveLength(1);
  });

  it('a first run that ended in an ORA error is stored as a failed attempt, enqueued, and keeps later hint reveals', () => {
    const store = createLessonStore({ getItem: () => null, setItem: () => {} });
    store.recordAttempt('bd-l02-ex3', { ok: false, hints: 0, kind: 'sql', item: 'bd-l02-ex3', ref, at: 5, done: true, sql: 'SELECT * FROM studenti LIMIT 5', verdict: slimVerdict({ ok: false, kind: 'error', code: 'ORA-00933' }) });
    expect(store.pendingCount()).toBe(1);
    store.updateLastAttempt('bd-l02-ex3', { hints: 3 });
    expect(store.attemptsAt(ref.src, ref.screen)[0]).toMatchObject({ ok: false, hints: 3, done: true });
    expect(seedGate({ blocks: [{ type: 'sql-exercise' }] }, store.attemptsAt(ref.src, ref.screen))).toEqual({ completed: true });
  });

  it('an unscored first run (no verdict) unlocks after a reload and keeps hints, without entering the review pile', () => {
    const store = createLessonStore({ getItem: () => null, setItem: () => {} });
    store.recordAttempt('bd-l02-ex4', { ok: false, hints: 0, kind: 'sql', item: 'bd-l02-ex4', ref, at: 7, done: true, unscored: true, sql: 'SELECT 1', verdict: null });
    expect(store.pendingCount()).toBe(0);
    store.updateLastAttempt('bd-l02-ex4', { hints: 2 });
    expect(store.attemptsAt(ref.src, ref.screen)[0]).toMatchObject({ unscored: true, hints: 2 });
    expect(seedGate({ blocks: [{ type: 'sql-exercise' }] }, store.attemptsAt(ref.src, ref.screen))).toEqual({ completed: true });
  });

  it('a screen with a sql attempt that ran stays unlocked after a reload, even when the first run was wrong', () => {
    const step = { blocks: [{ type: 'sql-exercise' }] };
    expect(seedGate(step, [{ ok: false, kind: 'sql', done: true }])).toEqual({ completed: true });
    expect(seedGate(step, [{ ok: false, kind: 'sql' }])).toBeUndefined();
  });
});

describe('validate-course-json.mjs on sql-exercise blocks', () => {
  const lesson = (b) => ({ meta: { id: 'bd-l99', title: bi('t'), shortTitle: bi('t') }, steps: [{ id: 's1', title: bi('s'), blocks: [b] }] });
  const run = (b) => {
    const dir = mkdtempSync(join(tmpdir(), 'sqlx-'));
    const file = join(dir, 'lesson.json');
    writeFileSync(file, JSON.stringify(lesson(b)));
    try {
      return spawnSync(execPath, [fileURLToPath(new URL('../../scripts/validate-course-json.mjs', import.meta.url)), file], { encoding: 'utf8' });
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  };

  it('passes a real staged block', () => {
    const r = run(real[0].block);
    expect(r.stderr).toBe('');
    expect(r.status).toBe(0);
  });

  it('fails a block with a missing solution, two hints or an unknown dataset', () => {
    const noSolution = block();
    delete noSolution.solution;
    for (const [bad, pattern] of [[noSolution, /solution/], [block({ hints: [bi('a'), bi('b')] }), /exactly 3 hints/], [block({ dataset: 'x' }), /dataset/]]) {
      const r = run(bad);
      expect(r.status).toBe(1);
      expect(r.stderr).toMatch(pattern);
    }
  });
});

describe('schemaFromSql', () => {
  it('reads the five tables of both datasets with Oracle type names', () => {
    for (const [ds, tables] of Object.entries(SCHEMA_TABLES)) {
      const text = readFileSync(new URL(`../../public/sql/datasets/${ds}.sql`, import.meta.url), 'utf8');
      const schema = schemaFromSql(text);
      expect(schema.map((s) => s.table.toLowerCase()).sort(), ds).toEqual([...tables].sort());
      for (const s of schema) for (const c of s.columns) expect(c.type, `${s.table}.${c.name}`).toMatch(/^(VARCHAR2|CHAR|NUMBER|DATE)/);
    }
  });

  it('maps the engine types and keeps NOT NULL', () => {
    const [s] = schemaFromSql("CREATE TABLE studenti(\n nr_matricol CHAR(6) NOT NULL,\n bursa numeric(6,2),\n an numeric(1,0),\n data_nastere ora_date,\n nume varchar(10)\n)\n;");
    expect(s.columns.map((c) => `${c.name} ${c.type}${c.nullable ? '' : ' NOT NULL'}`)).toEqual([
      'NR_MATRICOL CHAR(6) NOT NULL', 'BURSA NUMBER(6,2)', 'AN NUMBER(1)', 'DATA_NASTERE DATE', 'NUME VARCHAR2(10)',
    ]);
  });
});

describe('registration', () => {
  it('the block type is in the registry loaders, which the player preloads', async () => {
    const { blockLoaders } = await import('../../src/components/blocks/registry.js');
    expect(typeof blockLoaders['sql-exercise']).toBe('function');
  });
});
