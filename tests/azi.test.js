import { describe, it, expect } from 'vitest';
import schedule from '../src/content/schedule-y2s1.json';
import {
  buildTargets, openingIndex, nextIndexAfter, moveIndex, markDone, unmarkDone, resolveCourse,
} from '../src/pages/aziLogic.js';

const steps = [...schedule.steps].sort((a, b) => new Date(a.due) - new Date(b.due));
const byId = id => steps.find(s => s.id === id);
const at = iso => new Date(iso).getTime();

describe('azi opening step', () => {
  it('opens on the first step that is not done and not passed', () => {
    expect(steps[openingIndex(steps, [], at('2026-11-08T10:00:00+02:00'))].id).toBe('ml-tema-6');
  });
  it('skips done steps', () => {
    const i = openingIndex(steps, ['ml-tema-6'], at('2026-11-08T10:00:00+02:00'));
    expect(steps[i].id).toBe('ia-test-scris-2');
  });
  it('skips passed steps', () => {
    const i = openingIndex(steps, [], at('2026-11-12T13:00:00+02:00'));
    expect(steps[i].id).toBe('ag-tema-1');
  });
  it('falls back to the first not-done step when all are passed, and the last when all are done', () => {
    const late = at('2027-01-01T00:00:00+02:00');
    expect(steps[openingIndex(steps, ['ml-tema-6'], late)].id).toBe('ia-test-scris-2');
    expect(openingIndex(steps, steps.map(s => s.id), late)).toBe(steps.length - 1);
  });
  it('after Gata moves to the next open step, wrapping around', () => {
    const now = at('2026-11-08T10:00:00+02:00');
    const done = ['ml-tema-6'];
    expect(steps[nextIndexAfter(steps, done, now, 0)].id).toBe('ia-test-scris-2');
    const all = steps.slice(1).map(s => s.id);
    expect(steps[nextIndexAfter(steps, all, now, steps.length - 1)].id).toBe('ml-tema-6');
  });
});

describe('azi back / forward and undo', () => {
  it('stays inside the bounds', () => {
    expect(moveIndex(0, -1, 6)).toBe(0);
    expect(moveIndex(0, 1, 6)).toBe(1);
    expect(moveIndex(5, 1, 6)).toBe(5);
    expect(moveIndex(5, -1, 6)).toBe(4);
  });
  it('marks done once and undoes', () => {
    const d = markDone([], 'a');
    expect(markDone(d, 'a')).toEqual(['a']);
    expect(unmarkDone(['a', 'b'], 'a')).toEqual(['b']);
    expect(unmarkDone(['b'], 'a')).toEqual(['b']);
  });
});

describe('azi buttons', () => {
  it('IA step has exactly one button', () => {
    expect(buildTargets(byId('ia-test-scris-2'))).toHaveLength(1);
  });
  it('single-pack steps give one crash button', () => {
    for (const id of ['nn-tema-3', 'ml-p1']) {
      const t = buildTargets(byId(id));
      expect(t).toHaveLength(1);
      expect(t[0].kind).toBe('crash');
    }
  });
  it('a lesson plus a different crash pack give two different targets', () => {
    const t = buildTargets({ ...byId('ml-tema-6'), crash: 'ml-crash-p1' });
    expect(t).toHaveLength(2);
    expect(new Set(t.map(x => x.href)).size).toBe(2);
    expect(t[0].kind).toBe('lesson');
    expect(t[1].kind).toBe('crash');
  });
  it('ag-partial and ag-tema-1 give two part buttons', () => {
    for (const id of ['ag-partial', 'ag-tema-1']) {
      const t = buildTargets(byId(id));
      expect(t.map(x => x.part)).toEqual([1, 2]);
      expect(t.every(x => x.parts === 2 && x.kind === 'crash')).toBe(true);
      expect(new Set(t.map(x => x.href)).size).toBe(2);
    }
  });
  it('a string crash still works and a missing course gives no button', () => {
    expect(buildTargets({ id: 'x', link: { subject: 'ia', course: 'ia-crash-t2' }, crash: 'ia-crash-t2' })).toHaveLength(1);
    expect(buildTargets({ id: 'x', link: { subject: 'ia', course: 'nope' }, crash: 'nope-too' })).toEqual([]);
    expect(buildTargets({ id: 'x' })).toEqual([]);
    expect(resolveCourse('ia', 'nope')).toBeNull();
  });
});

describe('azi real schedule', () => {
  it('ml-tema-6 has only its lesson (no crash pack in the schedule)', () => {
    const t = buildTargets(byId('ml-tema-6'));
    expect(t.map(x => x.kind)).toEqual(['lesson']);
  });
});
