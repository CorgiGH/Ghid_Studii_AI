// Final fix wave, player lane: the attempt rule for an unedited starter and an unscored first attempt (item 11), the hint-only
// marker (item 12), the paper self-check gate (item 13), the review-variant note (item 18), what an update writes (item 25) and the
// saved ticks (item 26).
import { describe, expect, it } from 'vitest';
import {
  HIDDEN_CLOCK, attemptAction, attemptWrite, hiddenNote, hintMarker, paperChecklist, restoreSqlState,
} from '../../src/components/lesson/blocks/sqlExerciseSpec.js';
import { seedGate } from '../../src/components/lesson/playerLogic.js';
import { createLessonStore } from '../../src/lesson/store.js';
import { CLOCK } from '../../src/sql/engine/worker.js';

const ok = { ok: true, kind: 'correct', missing: [], extra: [] };
const bad = { ok: false, kind: 'rows', missing: [], extra: [] };
const err = { ok: false, kind: 'error', code: 'ORA-00903', message: 'x' };
const base = { hidden: false, record: true, attempted: false, marked: false };
const ref = { src: 'bd/courses/lesson-02.json', screen: 17 };
const sqlStep = { id: 's17', blocks: [{ type: 'sql-exercise', id: 'e1' }] };
const fresh = () => createLessonStore({ getItem: () => null, setItem: () => {} });
// carries out an action the way SqlExerciseBlock.apply does
const applyTo = (store, action, ctx) => {
  const w = attemptWrite(action, { item: 'e1', ref, at: ctx.at ?? 1, hints: ctx.hints ?? 0, fields: ctx.fields, extra: ctx.extra });
  if (w?.method === 'recordAttempt') store.recordAttempt('e1', w.data);
  if (w?.method === 'updateLastAttempt') store.updateLastAttempt('e1', w.data);
  return w;
};

describe('item 11: the unedited starter and the unscored first attempt', () => {
  it('a first run of the unedited starter records nothing (in the lesson and in review)', () => {
    expect(attemptAction({ ...base, event: 'run', verdict: err, edited: false }).type).toBe('none');
    expect(attemptAction({ ...base, event: 'run', verdict: bad, edited: false }).type).toBe('none');
    expect(attemptAction({ ...base, hidden: true, event: 'run', verdict: bad, edited: false }).type).toBe('none');
    expect(attemptAction({ ...base, event: 'fault', edited: false }).type).toBe('none');
  });
  it('an edited first run is the attempt; once an attempt is stored the starter rule does not apply', () => {
    expect(attemptAction({ ...base, event: 'run', verdict: err, edited: true })).toMatchObject({ type: 'record', ok: false, unscored: false });
    expect(attemptAction({ ...base, event: 'run', verdict: ok, edited: true })).toMatchObject({ type: 'record', ok: true });
    expect(attemptAction({ ...base, attempted: true, event: 'run', verdict: bad, edited: false })).toMatchObject({ type: 'update', keepRun: true });
  });
  it('an unscored stored attempt is replaced by the first graded run (a miss enqueues)', () => {
    expect(attemptAction({ ...base, attempted: true, attemptUnscored: true, event: 'run', verdict: bad, edited: true })).toMatchObject({ type: 'record', ok: false, unscored: false });
    expect(attemptAction({ ...base, attempted: true, attemptUnscored: true, event: 'run', verdict: ok, edited: true })).toMatchObject({ type: 'record', ok: true, unscored: false });
  });
  it('an unscored stored attempt followed by an ORA error or no verdict stays an update', () => {
    expect(attemptAction({ ...base, attempted: true, attemptUnscored: true, event: 'run', verdict: err, edited: true })).toMatchObject({ type: 'update' });
    expect(attemptAction({ ...base, attempted: true, attemptUnscored: true, event: 'run', verdict: null, edited: true })).toMatchObject({ type: 'update' });
  });
  it('L1 ex-x1: the starter run, then SELECT * FROM didactic, leaves one ok attempt and no review entry', () => {
    const store = fresh();
    const starter = attemptAction({ ...base, event: 'run', verdict: err, edited: false });
    applyTo(store, starter, { fields: { sql: 'SELECT * FROM ', verdict: err, ran: true } });
    const right = attemptAction({ ...base, event: 'run', verdict: ok, edited: true });
    applyTo(store, right, { fields: { sql: 'SELECT * FROM didactic', verdict: ok, ran: true } });
    const list = store.attemptsAt(ref.src, ref.screen);
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ ok: true, done: true, sql: 'SELECT * FROM didactic' });
    expect(store.pendingCount()).toBe(0);
  });
  it('restoreSqlState reports an unscored attempt', () => {
    expect(restoreSqlState([{ item: 'e1', kind: 'sql', ok: false, unscored: true }], 'e1').unscored).toBe(true);
    expect(restoreSqlState([{ item: 'e1', kind: 'sql', ok: false }], 'e1').unscored).toBe(false);
  });
});

describe('item 12: three hints opened', () => {
  it('the hint-only marker enters review and keeps the gate shut; a later graded run is a real record', () => {
    const store = fresh();
    store.recordAttempt('e1', hintMarker({ item: 'e1', ref, at: 5 }));
    expect(store.pendingReview(5).map((i) => i.itemId)).toEqual(['e1']);
    expect(seedGate(sqlStep, store.attemptsAt(ref.src, ref.screen))).toBeUndefined();
    const restored = restoreSqlState(store.attemptsAt(ref.src, ref.screen), 'e1');
    expect(restored).toMatchObject({ hints: 3, unscored: true, ran: false, sql: null });
    const run = attemptAction({ ...base, attempted: true, attemptUnscored: restored.unscored, event: 'run', verdict: ok, edited: true });
    applyTo(store, run, { hints: 3, fields: { sql: 'SELECT 1', verdict: ok, ran: true } });
    expect(seedGate(sqlStep, store.attemptsAt(ref.src, ref.screen))).toEqual({ completed: true });
  });
  it('a paper hand-in after the marker takes the marker over', () => {
    expect(attemptAction({ ...base, attempted: true, attemptUnscored: true, event: 'paper-submit' })).toMatchObject({ type: 'update', owns: true, set: { paper: true } });
  });
});

describe('item 13: paper mode opens the gate at the saved check', () => {
  const block = { kind: 'query', check: { order: 'any', mode: 'bag' } };
  it('a checklist with points: the hand-in record is not done, the saved check is', () => {
    const store = fresh();
    const submit = attemptAction({ ...base, event: 'paper-submit' });
    expect(submit).toMatchObject({ type: 'record', unscored: true, done: false });
    applyTo(store, submit, { fields: { verdict: null, paper: true, ran: false } });
    expect(seedGate(sqlStep, store.attemptsAt(ref.src, ref.screen))).toBeUndefined();
    const done = attemptAction({ ...base, attempted: true, paperOwned: true, event: 'paper-done', paperOk: true });
    applyTo(store, done, { extra: { ticks: [0, 1, 2] } });
    expect(seedGate(sqlStep, store.attemptsAt(ref.src, ref.screen))).toEqual({ completed: true });
  });
  it('an empty checklist (no expected file) settles at hand-in as an unscored, done attempt', () => {
    expect(paperChecklist(block, null)).toEqual([]);
    const store = fresh();
    const submit = attemptAction({ ...base, event: 'paper-submit', paperEmpty: true });
    expect(submit).toMatchObject({ type: 'record', ok: false, unscored: true, done: true, set: { paperDone: true } });
    applyTo(store, submit, { fields: { verdict: null, paper: true, ran: false } });
    expect(seedGate(sqlStep, store.attemptsAt(ref.src, ref.screen))).toEqual({ completed: true });
    expect(store.pendingCount()).toBe(0);
    expect(restoreSqlState(store.attemptsAt(ref.src, ref.screen), 'e1')).toMatchObject({ paper: true, paperDone: true });
    // after a reveal the hand-in only marks the attempt, and settles it too
    expect(attemptAction({ ...base, attempted: true, revealed: true, event: 'paper-submit', paperEmpty: true })).toMatchObject({ type: 'update', set: { paper: true, paperDone: true } });
  });
  it('review variant: the saved check marks the review', () => {
    expect(attemptAction({ ...base, hidden: true, event: 'paper-submit' }).type).toBe('none');
    expect(attemptAction({ ...base, hidden: true, event: 'paper-done', paperOk: false })).toMatchObject({ type: 'markReview', ok: false });
  });
});

describe('item 25: an update writes only its own fields', () => {
  it('a paper hand-in after a reveal keeps the stored verdict, sql and ran', () => {
    const store = fresh();
    const v = { ok: false, kind: 'rows', missing: [], extra: [] };
    store.recordAttempt('e1', { ok: false, hints: 0, kind: 'sql', item: 'e1', ref, at: 1, done: true, sql: 'SELECT 2', verdict: v, ran: true });
    applyTo(store, attemptAction({ ...base, attempted: true, event: 'reveal' }), { fields: { sql: 'SELECT 2', verdict: null, ran: false, revealed: true } });
    const submit = attemptAction({ ...base, attempted: true, revealed: true, event: 'paper-submit' });
    const w = applyTo(store, submit, { fields: { verdict: null, paper: true, ran: false } });
    expect(w).toEqual({ method: 'updateLastAttempt', data: { hints: 0, paper: true } });
    const done = attemptAction({ ...base, attempted: true, revealed: true, paperOwned: true, event: 'paper-done', paperOk: false });
    expect(applyTo(store, done, { fields: { verdict: null, paper: true, ran: false }, extra: { ticks: [1] } }).data).toEqual({ hints: 0, ticks: [1], paperDone: true, done: true });
    expect(restoreSqlState(store.attemptsAt(ref.src, ref.screen), 'e1')).toMatchObject({ verdict: v, sql: 'SELECT 2', ran: true, revealed: true, paper: true, paperDone: true });
  });
  it('a run update carries the run, a record carries everything', () => {
    const run = { sql: 'S', verdict: ok, mistake: null, ran: true };
    expect(attemptWrite({ type: 'update', keepRun: true }, { hints: 1, fields: run }).data).toEqual({ hints: 1, ...run });
    expect(attemptWrite({ type: 'record', ok: true, unscored: false }, { item: 'e1', ref, at: 3, hints: 0, fields: run }).data)
      .toEqual({ ok: true, hints: 0, kind: 'sql', item: 'e1', ref, at: 3, done: true, revealed: false, ...run });
    expect(attemptWrite({ type: 'none' }, {})).toBeNull();
  });
});

describe('item 26: saved ticks come back whatever the result', () => {
  it('restores the tick indexes of a settled check that was not all ticked', () => {
    const list = [{ item: 'e1', kind: 'sql', ok: false, paper: true, paperDone: true, ticks: [0] }];
    expect(restoreSqlState(list, 'e1')).toMatchObject({ ok: false, paperDone: true, ticks: [0] });
    expect(restoreSqlState([{ item: 'e1', kind: 'sql', ok: true, paper: true, paperDone: true, ticks: [0, 'x', -1, 2] }], 'e1').ticks).toEqual([0, 2]);
    expect(restoreSqlState([{ item: 'e1', kind: 'sql', ok: true, paper: true, paperDone: true }], 'e1').ticks).toBeNull();
  });
});

describe('item 18: the review-variant note', () => {
  it('runs on the engine clock', () => {
    expect(HIDDEN_CLOCK).toBe(CLOCK);
  });
  it('says the quoted counts are the lesson ones', () => {
    const n = hiddenNote({ id: 'x' });
    expect(n.ro).toContain('Numerele de rânduri și valorile citate în enunț și în explicație sunt cele din lecție.');
    expect(n.en).toContain("Row counts and values quoted in the statement and the explanation are the lesson's.");
    expect(n.ro).not.toContain('azi');
  });
  it('names both dates of a clocked exercise, from the data', () => {
    const n = hiddenNote({ id: 'bd-l13-ex-3-1', clock: '2026-08-26' });
    expect(n.ro).toContain('Aici „azi” este 26 octombrie 2026, nu 26 august 2026: interogarea trebuie să meargă la orice dată.');
    expect(n.en).toContain('Here “today” is 26 October 2026, not 26 August 2026: the query has to work on any date.');
    expect(hiddenNote({ clock: '2026-03-01 09:00:00' }).en).toContain('not 1 March 2026');
  });
});

describe('item 12/11: opening the solution after only a hint marker', () => {
  it('is a recorded miss that opens the gate after a reload', () => {
    const store = fresh();
    store.recordAttempt('e1', hintMarker({ item: 'e1', ref, at: 5 }));
    const reveal = attemptAction({ ...base, attempted: true, attemptUnscored: true, event: 'reveal' });
    expect(reveal).toMatchObject({ type: 'record', ok: false, unscored: false });
    applyTo(store, reveal, { hints: 3, fields: { sql: 'SELECT', verdict: null, ran: false, revealed: true } });
    expect(seedGate(sqlStep, store.attemptsAt(ref.src, ref.screen))).toEqual({ completed: true });
    expect(attemptAction({ ...base, attempted: true, event: 'reveal' })).toEqual({ type: 'update', set: { revealed: true } });
  });
});
