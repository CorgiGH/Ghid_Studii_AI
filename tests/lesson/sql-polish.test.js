// Polish after the sql exercise block and the L1 mock: the attempt rule, restoring a named mistake, error verdicts without an answer
// key, review-variant rows, hand-in failures, empty parts, the optional timer, group stems, one scoring path, validator checks.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import {
  attemptAction, canGrade, restoreSqlState, revealFields, rowsFromSql, slimVerdict,
} from '../../src/components/lesson/blocks/sqlExerciseSpec.js';
import { checkResult } from '../../src/sql/check.js';
import {
  checkPartOnce, classifyFailure, gradeParts, issueText, offersRetry, paperCheckable, partsOf,
} from '../../src/components/blocks/test/sqlGrading.js';
import { formatClock, showGroupStem, timerChoices, timerSeconds, totalScore } from '../../src/components/blocks/test/testLogic.js';
import { scoreMock } from '../../src/components/blocks/test/sqlScoring.js';
import { createLessonStore } from '../../src/lesson/store.js';
import bd from '../../src/content/bd/index.js';

const ROOT = path.resolve(import.meta.dirname, '..', '..');
const ok = { ok: true, kind: 'correct', missing: [], extra: [] };
const bad = { ok: false, kind: 'rows', missing: [], extra: [] };
const err = { ok: false, kind: 'error', code: 'ORA-00942', message: 'x' };
const notOracle = { ok: false, kind: 'not-oracle', code: 'ORA-00933' };

describe('attemptAction', () => {
  const base = { hidden: false, record: true, attempted: false, marked: false };
  it('does nothing for a silent re-run', () => {
    expect(attemptAction({ ...base, verdict: ok, silent: true }).type).toBe('none');
    expect(attemptAction({ ...base, hidden: true, verdict: ok, silent: true }).type).toBe('none');
  });
  it('records the first run as the attempt and then only updates it', () => {
    expect(attemptAction({ ...base, verdict: ok })).toMatchObject({ type: 'record', ok: true, unscored: false });
    expect(attemptAction({ ...base, verdict: bad })).toMatchObject({ type: 'record', ok: false, unscored: false });
    expect(attemptAction({ ...base, verdict: ok, attempted: true }).type).toBe('update');
  });
  it('counts an ORA error or a not-Oracle verdict as a failed attempt, and no verdict as an unscored one', () => {
    expect(attemptAction({ ...base, verdict: err })).toMatchObject({ type: 'record', ok: false, unscored: false });
    expect(attemptAction({ ...base, verdict: notOracle })).toMatchObject({ type: 'record', ok: false, unscored: false });
    expect(attemptAction({ ...base, verdict: null })).toMatchObject({ type: 'record', ok: false, unscored: true });
  });
  it('writes nothing when the block may not record', () => {
    expect(attemptAction({ ...base, record: false, verdict: ok }).type).toBe('none');
  });
  it('review variant: marks the review once, on a graded run only, never records', () => {
    const h = { ...base, hidden: true };
    expect(attemptAction({ ...h, verdict: ok })).toMatchObject({ type: 'markReview', ok: true });
    expect(attemptAction({ ...h, verdict: bad })).toMatchObject({ type: 'markReview', ok: false });
    expect(attemptAction({ ...h, verdict: err }).type).toBe('none');
    expect(attemptAction({ ...h, verdict: null }).type).toBe('none');
    expect(attemptAction({ ...h, verdict: ok, marked: true }).type).toBe('none');
  });
  it('a fault records a failed attempt only when there is none yet', () => {
    expect(attemptAction({ ...base, event: 'fault' })).toMatchObject({ type: 'record', ok: false });
    expect(attemptAction({ ...base, event: 'fault', attempted: true }).type).toBe('none');
    expect(attemptAction({ ...base, hidden: true, event: 'fault' }).type).toBe('none');
  });
  it('revealing the solution is a miss before an attempt, an update after one, review: a miss once', () => {
    expect(attemptAction({ ...base, event: 'reveal' })).toMatchObject({ type: 'record', ok: false });
    expect(attemptAction({ ...base, event: 'reveal', attempted: true }).type).toBe('update');
    expect(attemptAction({ ...base, hidden: true, event: 'reveal' })).toMatchObject({ type: 'markReview', ok: false });
    expect(attemptAction({ ...base, hidden: true, event: 'reveal', marked: true }).type).toBe('none');
  });
  it('paper: hand-in opens an unscored marker, the self-check decides', () => {
    expect(attemptAction({ ...base, event: 'paper-submit' })).toMatchObject({ type: 'record', unscored: true });
    expect(attemptAction({ ...base, event: 'paper-submit' }).owns).toBe(true);
    // an attempt from a live run is not the hand-in's to touch; a revealed (missed) one is marked as the paper one
    expect(attemptAction({ ...base, event: 'paper-submit', attempted: true }).type).toBe('none');
    expect(attemptAction({ ...base, event: 'paper-submit', attempted: true, revealed: true })).toMatchObject({ type: 'update', owns: true, set: { paper: true } });
    expect(attemptAction({ ...base, hidden: true, event: 'paper-submit' }).type).toBe('none');
    // all ticked: the marker becomes a right answer; anything unticked: a failed attempt that reaches the review pile
    expect(attemptAction({ ...base, event: 'paper-done', attempted: true, paperOwned: true, paperOk: true })).toMatchObject({ type: 'update', set: { ok: true, unscored: false, paperDone: true } });
    expect(attemptAction({ ...base, event: 'paper-done', attempted: true, paperOwned: true, paperOk: false })).toMatchObject({ type: 'record', ok: false, unscored: false });
    // the solution was opened first: the attempt already stands as a miss, it is only marked settled
    expect(attemptAction({ ...base, event: 'paper-done', attempted: true, paperOwned: true, paperOk: true, revealed: true })).toMatchObject({ type: 'update', set: { paperDone: true } });
    // after a reload the stored attempt may be a live run's: a second hand-in neither re-enqueues nor turns a miss into a right answer
    expect(attemptAction({ ...base, event: 'paper-done', attempted: true, paperOk: true }).type).toBe('none');
    expect(attemptAction({ ...base, event: 'paper-done', attempted: true, paperOk: false }).type).toBe('none');
    // review variant: markReview with the self-check result
    expect(attemptAction({ ...base, hidden: true, event: 'paper-done', paperOk: true })).toMatchObject({ type: 'markReview', ok: true });
    expect(attemptAction({ ...base, hidden: true, event: 'paper-done', paperOk: false })).toMatchObject({ type: 'markReview', ok: false });
  });
  it('a paper exercise with an unticked point enters the review pile; all ticked does not', () => {
    const run = (paperOk) => {
      const store = createLessonStore({ getItem: () => null, setItem: () => {} });
      const ref = { src: 'bd/x', screen: 2 };
      const submit = attemptAction({ ...base, event: 'paper-submit' });
      store.recordAttempt('e1', { ok: submit.ok, unscored: submit.unscored, kind: 'sql', item: 'e1', ref, at: 1, done: true, paper: true });
      expect(store.pendingCount()).toBe(0);
      const done = attemptAction({ ...base, event: 'paper-done', attempted: true, paperOwned: true, paperOk });
      if (done.type === 'record') store.recordAttempt('e1', { ok: done.ok, kind: 'sql', item: 'e1', ref, at: 2, done: true, paper: true });
      else store.updateLastAttempt('e1', done.set);
      return store.pendingCount();
    };
    expect(run(false)).toBe(1);
    expect(run(true)).toBe(0);
  });
});

describe('reveal and paper restore', () => {
  const ref = { src: 'bd/x', screen: 2 };
  const fresh = () => createLessonStore({ getItem: () => null, setItem: () => {} });
  it('run, reveal, restore keeps the verdict, the mistake and ran', () => {
    const store = fresh();
    const v = slimVerdict({ ok: false, kind: 'rows', missing: [], extra: [] });
    store.recordAttempt('e1', { ok: false, hints: 0, kind: 'sql', item: 'e1', ref, at: 1, done: true, revealed: false, sql: 'SELECT 1', verdict: v, mistake: 'eq-null', ran: true });
    store.updateLastAttempt('e1', { hints: 0, ...revealFields(true, 'SELECT 1') });
    expect(restoreSqlState(store.attemptsAt(ref.src, ref.screen), 'e1')).toMatchObject({ revealed: true, verdict: v, mistake: 'eq-null', ran: true, sql: 'SELECT 1' });
    expect(revealFields(false, 'x')).toEqual({ sql: 'x', verdict: null, ran: false, revealed: true });
  });
  it('a paper hand-in comes back submitted, and settled after the check was saved', () => {
    const store = fresh();
    store.recordAttempt('e1', { ok: false, unscored: true, kind: 'sql', item: 'e1', ref, at: 1, done: true, paper: true, ran: false });
    expect(restoreSqlState(store.attemptsAt(ref.src, ref.screen), 'e1')).toMatchObject({ paper: true, paperDone: false });
    store.updateLastAttempt('e1', { ok: true, unscored: false, paperDone: true });
    expect(restoreSqlState(store.attemptsAt(ref.src, ref.screen), 'e1')).toMatchObject({ paper: true, paperDone: true, ok: true });
  });
  it('a live miss survives a later paper hand-in untouched', () => {
    const store = fresh();
    store.recordAttempt('e1', { ok: false, kind: 'sql', item: 'e1', ref, at: 1, done: true, sql: 'S', ran: true });
    expect(attemptAction({ record: true, attempted: true, event: 'paper-submit' }).type).toBe('none');
    expect(attemptAction({ record: true, attempted: true, event: 'paper-done', paperOk: true }).type).toBe('none');
    expect(store.attemptsAt(ref.src, ref.screen)).toHaveLength(1);
  });
});

describe('error verdicts without an answer key', () => {
  const spec = { kind: 'query', order: 'any', mode: 'bag' };
  const failed = { error: { code: 'ORA-00942', message: 'table or view does not exist' }, columns: [], rows: [] };
  it('can grade an ORA error when the expected file is missing, and nothing else', () => {
    expect(canGrade(null, failed, spec)).toBe(true);
    expect(canGrade(null, { kind: 'rows', columns: ['A'], rows: [] }, spec)).toBe(false);
    expect(canGrade({ columns: ['A'], rows: [] }, { kind: 'rows', columns: ['A'], rows: [] }, spec)).toBe(true);
    expect(canGrade(null, failed, { ...spec, kind: 'state' })).toBe(false);
  });
  it('gives the checker verdict with the code', () => {
    const v = checkResult(failed, null, spec);
    expect(v).toMatchObject({ ok: false, kind: 'error', code: 'ORA-00942' });
  });
});

describe('restoring the named mistake', () => {
  const attempt = (over) => ({ item: 'e1', kind: 'sql', ok: false, hints: 1, sql: 'SELECT 1', verdict: slimVerdict(bad), ...over });
  it('brings the stored mistake id back', () => {
    expect(restoreSqlState([attempt({ mistake: 'eq-null', ran: true })], 'e1')).toMatchObject({ mistake: 'eq-null', ran: true });
    expect(restoreSqlState([attempt({ verdict: { ...slimVerdict(bad), mistake: 'dml-no-where' }, ran: true })], 'e1').mistake).toBe('dml-no-where');
    expect(restoreSqlState([attempt({})], 'e1').mistake).toBeNull();
  });
  it('re-runs only a query the learner ran', () => {
    expect(restoreSqlState([attempt({ ran: true })], 'e1').ran).toBe(true);
    expect(restoreSqlState([attempt({ ran: false })], 'e1').ran).toBe(false);
    expect(restoreSqlState([attempt({})], 'e1').ran).toBe(false); // no flag: a starter or paper text
    expect(restoreSqlState([attempt({ ran: true, sql: '  ' })], 'e1').ran).toBe(false);
    expect(restoreSqlState([attempt({ paper: true })], 'e1').paper).toBe(true);
  });
});

describe('rowsFromSql', () => {
  for (const name of ['biblioteca-hidden', 'facultate-hidden']) {
    it(`reads every row of ${name}.sql with one cell per column`, () => {
      const text = fs.readFileSync(path.join(ROOT, 'public/sql/datasets', `${name}.sql`), 'utf8');
      const tables = rowsFromSql(text);
      expect(tables.length).toBe(5);
      expect(tables.reduce((n, t) => n + t.rows.length, 0)).toBe((text.match(/^\s*INSERT/gim) || []).length);
      for (const tb of tables) for (const r of tb.rows) expect(r).toHaveLength(tb.columns.length);
    });
  }
  it('shows dates as the engine does, NULL as null and numbers without a trailing zero', () => {
    const t = rowsFromSql("CREATE TABLE a(x CHAR(2), y numeric(5,2), d ora_date);\nINSERT INTO a VALUES ('it''s', 12.0, TO_DATE('04/11/2022','dd/mm/yyyy'));\nINSERT INTO a VALUES ('b', NULL, null);");
    expect(t[0].rows).toEqual([["it's", '12', '04-NOV-22'], ['b', null, null]]);
  });
});

describe('hand-in grading', () => {
  const rowsOf = (rows) => ({ kind: 'rows', columns: ['A'], rows, rowCount: rows.length });
  const stub = (run) => ({ reset: async () => {}, run });
  const part = (id) => ({ id, label: id, dataset: 'biblioteca', kind: 'query', solution: 'x', check: { order: 'any', mode: 'bag' }, points: 3 });
  const exp = async () => ({ columns: ['A'], rows: [['1']] });
  const args = (client, texts, extra = {}) => ({ client, parts: [part('p1')], base: 'biblioteca', texts, loadExpected: exp, ...extra });

  it('grades a right answer on both datasets', async () => {
    const r = await gradeParts(args(stub(async () => rowsOf([['1']])), { p1: 'select 1' }));
    expect(r.status).toBe('graded');
    expect(r.flat.map((v) => v.ok)).toEqual([true, true]);
  });
  it('skips an empty part (no engine call), gives it no verdict and still counts as handed in', async () => {
    let calls = 0;
    const r = await gradeParts(args(stub(async () => { calls++; return rowsOf([]); }), { p1: '   ' }));
    expect(calls).toBe(0);
    expect(r.status).toBe('graded');
    expect(r.flat).toEqual([null, null]);
    expect(r.out.p1.every((e) => e.empty)).toBe(true);
  });
  it('CANCELLED is ungraded and silent', async () => {
    const r = await gradeParts(args(stub(async () => { throw Object.assign(new Error('c'), { code: 'CANCELLED' }); }), { p1: 'select 1' }));
    expect(r.status).toBe('ungraded');
    expect(r.issue.kind).toBe('silent');
    expect(issueText(r.issue)).toBeNull();
    expect(offersRetry(r.issue)).toBe(false);
  });
  it('TIMEOUT and ENGINE_ERROR say what happened and offer a retry', async () => {
    for (const [code, kind] of [['TIMEOUT', 'timeout'], ['ENGINE_ERROR', 'engine']]) {
      const r = await gradeParts(args(stub(async () => { throw Object.assign(new Error('boom'), { code }); }), { p1: 'select 1' }));
      expect(r.status).toBe('ungraded');
      expect(r.issue.kind).toBe(kind);
      const text = issueText(r.issue);
      expect(text.en.length).toBeGreaterThan(20);
      expect(text.ro.length).toBeGreaterThan(20);
      expect(text.ro).not.toBe(text.en);
      expect(offersRetry(r.issue)).toBe(true);
    }
  });
  it('a hard failure outranks a cancel; a missing answer key is its own ungraded case', async () => {
    let n = 0;
    const flaky = stub(async () => { n++; throw Object.assign(new Error('x'), { code: n === 1 ? 'CANCELLED' : 'TIMEOUT' }); });
    expect((await gradeParts(args(flaky, { p1: 'select 1' }))).issue.kind).toBe('timeout');
    const r = await gradeParts(args(stub(async () => rowsOf([['1']])), { p1: 'select 1' }, { loadExpected: async () => { throw new Error('404'); } }));
    expect(r.status).toBe('ungraded');
    expect(r.issue.kind).toBe('expected');
    expect(issueText(r.issue).en).toContain('try again');
  });
  it('ENGINE_UNAVAILABLE hands the question to paper mode', async () => {
    const r = await gradeParts(args(stub(async () => { throw Object.assign(new Error('x'), { code: 'ENGINE_UNAVAILABLE' }); }), { p1: 'select 1' }));
    expect(r.status).toBe('unavailable');
  });
  it('classifies failures', () => {
    expect(['CANCELLED', 'ENGINE_UNAVAILABLE', 'TIMEOUT', 'ENGINE_ERROR', undefined].map((code) => classifyFailure({ code }))).toEqual(['silent', 'unavailable', 'timeout', 'engine', 'engine']);
  });
  it('inherits dataset, kind and clock into moreParts', () => {
    const parts = partsOf({ id: 'q', dataset: 'biblioteca', clock: '2026-08-26', moreParts: [{ id: 'q-b' }] });
    expect(parts[1]).toMatchObject({ id: 'q-b', dataset: 'biblioteca', kind: 'query', clock: '2026-08-26' });
  });
});

describe('paper mode unlock and check', () => {
  const stub = (rows) => ({ reset: async () => {}, run: async () => ({ kind: 'rows', columns: ['A'], rows, rowCount: rows.length }) });
  const part = { id: 'p1', dataset: 'biblioteca', kind: 'query', check: { order: 'any', mode: 'bag' } };
  it('unlocks after hand-in, only in paper mode with a working engine', () => {
    const on = { mode: 'paper', status: 'ready', handedIn: true, hasClient: true };
    expect(paperCheckable(on)).toBe(true);
    expect(paperCheckable({ ...on, handedIn: false })).toBe(false);
    expect(paperCheckable({ ...on, status: 'failed' })).toBe(false); // the answer cannot be run on this device
    expect(paperCheckable({ ...on, hasClient: false })).toBe(false);
    expect(paperCheckable({ ...on, mode: 'practice' })).toBe(false);
  });
  it('checks the typed answer against the expected table', async () => {
    const expected = { columns: ['A'], rows: [['1']] };
    expect((await checkPartOnce({ client: stub([['1']]), part, base: 'biblioteca', sql: 'select 1', expected })).verdict.ok).toBe(true);
    const wrong = await checkPartOnce({ client: stub([['2']]), part, base: 'biblioteca', sql: 'select 2', expected });
    expect(wrong.verdict).toMatchObject({ ok: false, kind: 'rows' });
  });
});

describe('optional timer', () => {
  const meta = { duration: 0, timerChoices: [30, 45, 60] };
  it('offers the choices of the test, or none', () => {
    expect(timerChoices(meta)).toEqual([30, 45, 60]);
    expect(timerChoices({})).toBeNull();
    expect(timerChoices({ timerChoices: [] })).toBeNull();
    expect(timerChoices({ timerChoices: [0, -5, 'x'] })).toBeNull();
  });
  it('counts down the chosen minutes, nothing for "no timer"', () => {
    expect(timerSeconds({ meta, questionCount: 8, mode: 'practice', chosen: 45 })).toBe(2700);
    expect(timerSeconds({ meta, questionCount: 8, mode: 'paper', chosen: 0 })).toBeNull();
    expect(timerSeconds({ meta, questionCount: 8, mode: 'paper', chosen: null })).toBeNull();
  });
  it('keeps timed mode as it was', () => {
    expect(timerSeconds({ meta: { duration: 20 }, questionCount: 5, mode: 'timed', chosen: null })).toBe(1200);
    expect(timerSeconds({ meta: { duration: 0 }, questionCount: 5, mode: 'timed', chosen: null })).toBe(600);
  });
  it('formats the clock', () => {
    expect(formatClock(2700)).toBe('45:00');
    expect(formatClock(61)).toBe('1:01');
  });
});

describe('group stems and the total', () => {
  it('one question per screen: the stem shows with its question only', () => {
    const q = { perScreen: true, group: 'g', prevGroup: 'g', hasText: true };
    expect(showGroupStem({ ...q, i: 1, current: 1 })).toBe(true);
    expect(showGroupStem({ ...q, i: 2, current: 1 })).toBe(false);
    expect(showGroupStem({ ...q, i: 1, current: 1, group: undefined })).toBe(false);
    expect(showGroupStem({ ...q, i: 1, current: 1, hasText: false })).toBe(false);
  });
  it('scrolling mode: once, above the first question of a group', () => {
    const q = { perScreen: false, i: 3, current: 0, group: 'g', hasText: true };
    expect(showGroupStem({ ...q, prevGroup: null })).toBe(true);
    expect(showGroupStem({ ...q, prevGroup: 'g' })).toBe(false);
  });
  it('the app total is scoreMock over the answers', () => {
    const questions = [{ id: 'a', points: 3 }, { id: 'b', points: 4 }, { id: 'c', points: 3 }];
    const answers = { a: { score: 3, maxScore: 3 }, b: { score: 0 }, ghost: { score: 99 } };
    expect(totalScore(questions, answers)).toBe(3);
    expect(totalScore(questions, answers)).toBe(scoreMock(questions, { a: 3, b: 0 }));
    expect(totalScore(questions, {})).toBe(0);
  });
});

describe('validate-test-json: sql parts, notes and points', () => {
  const bi = (s) => ({ en: s, ro: s });
  const part = (over = {}) => ({ id: 'q1b', solution: 'SELECT 1 FROM dual', check: { order: 'any', mode: 'bag' }, ...over });
  const q = (over = {}) => ({
    id: 'q1', type: 'sql', prompt: bi('Show.'), points: 3, dataset: 'biblioteca', kind: 'query',
    solution: 'SELECT 1 FROM dual', check: { order: 'any', mode: 'bag' }, ...over,
  });
  const run = (question, meta = {}) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'p4-'));
    const f = path.join(dir, 'case.json');
    fs.writeFileSync(f, JSON.stringify({ meta: { id: 't', title: bi('T'), totalPoints: 3, ...meta }, questions: [question] }));
    const r = spawnSync('node', ['scripts/validate-test-json.mjs', f], { cwd: ROOT, encoding: 'utf8' });
    fs.rmSync(dir, { recursive: true, force: true });
    return { code: r.status, out: r.stdout + r.stderr };
  };
  it('accepts a question with a good extra part and bilingual notes', () => {
    expect(run(q({ moreParts: [part()], gradingNotes: bi('Note.') })).code).toBe(0);
    expect(run(q({ moreParts: [part({ dataset: 'facultate' })] })).code).toBe(0);
  });
  for (const [what, bad] of [
    ['an id', part({ id: undefined })], ['a solution', part({ solution: ' ' })], ['a check', part({ check: undefined })],
    ['a valid dataset', part({ dataset: 'nope' })], ['a duplicate id', part({ id: 'q1' })], ['a valid check order', part({ check: { order: 'x', mode: 'bag' } })],
  ]) {
    it(`rejects an extra part without ${what}`, () => {
      expect(run(q({ moreParts: [bad] })).code).toBe(1);
    });
  }
  it('rejects gradingNotes with one language', () => {
    const r = run(q({ gradingNotes: { en: 'only english' } }));
    expect(r.code).toBe(1);
    expect(r.out).toContain('gradingNotes');
  });
  it('rejects points that do not add up to meta.totalPoints', () => {
    const r = run(q(), { totalPoints: 10 });
    expect(r.code).toBe(1);
    expect(r.out).toContain('totalPoints');
  });
  it('rejects a bad timer list', () => {
    expect(run(q(), { timerChoices: [30, 'x'] }).code).toBe(1);
    expect(run(q(), { timerChoices: [30, 45] }).code).toBe(0);
  });
});

describe('the mock registration', () => {
  it('carries a group like the other subjects and offers a timer', () => {
    const entry = bd.tests.find((t) => t.id === 'bd-mock-l1');
    expect(entry.group).toBe('mock');
    const json = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/content/bd/tests/mock-l1.json'), 'utf8'));
    expect(json.meta.timerChoices).toEqual([30, 45, 60]);
  });
  it('pins the editor packages to the versions the lockfile had before the editor', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).dependencies;
    expect(pkg).toMatchObject({
      '@codemirror/commands': '6.10.3', '@codemirror/language': '6.12.3', '@codemirror/state': '6.6.0', '@codemirror/view': '6.41.0', '@lezer/highlight': '1.2.3',
    });
  });
});
