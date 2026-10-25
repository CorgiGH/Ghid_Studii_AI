// What the viz widgets show on each step, from their pure logic (the widgets read these helpers), plus the record a
// predict screen leaves so its gate re-opens after a reload.
import { describe, it, expect } from 'vitest';
import { tableBuild } from '../../src/components/lesson/viz/logic/table-build.js';
import { rowInsert } from '../../src/components/lesson/viz/logic/row-insert.js';
import { padCall } from '../../src/components/lesson/viz/logic/char-strips.js';
import { plusCaption } from '../../src/components/lesson/viz/logic/calendar-clock.js';
import { allVsSome } from '../../src/components/lesson/viz/logic/all-vs-some.js';
import { ageLabels, ageParts } from '../../src/components/lesson/viz/logic/age-timeline.js';
import { nearMarks, lineCrowded } from '../../src/components/lesson/viz/logic/number-line.js';
import { typePipes, pipeTarget } from '../../src/components/lesson/viz/logic/type-pipes.js';
import { recordVizPredict, vizItemId } from '../../src/components/lesson/viz/logic/predict-record.js';
import { createLessonStore } from '../../src/lesson/store.js';
import { seedGate } from '../../src/components/lesson/playerLogic.js';

const D1_COLUMNS = [
  { name: 'nr_matricol', type: 'CHAR(6)', notNull: true },
  { name: 'nume', type: 'VARCHAR2(10)' },
  { name: 'prenume', type: 'VARCHAR2(10)' },
  { name: 'an', type: 'NUMBER(1)' },
  { name: 'grupa', type: 'CHAR(2)' },
  { name: 'bursa', type: 'NUMBER(6,2)' },
  { name: 'data_nastere', type: 'DATE' },
];

describe('table-build: every column gets its own step', () => {
  it('has a step for the empty frame, one per column and one for the finished table', () => {
    const b = tableBuild('studenti', D1_COLUMNS);
    expect(b.count).toBe(D1_COLUMNS.length + 2);
    expect(b.phaseAt(0)).toEqual({ kind: 'empty' });
    expect(b.phaseAt(7)).toEqual({ kind: 'column', col: D1_COLUMNS[6], index: 6 });
    expect(b.phaseAt(7).col).toMatchObject({ name: 'data_nastere', type: 'DATE' });
    expect(b.phaseAt(8)).toEqual({ kind: 'done' });
    expect(b.sqlAt(8)).toContain('data_nastere DATE');
  });
});

describe('row-insert: a NUMBER value is not quoted', () => {
  it('writes an = 2 as 2 and the CHAR values in quotes', () => {
    const r = rowInsert({ table: 'studenti', row: { nr_matricol: '126', nume: 'Vasile', an: 2, grupa: 'B2', bursa: null } });
    expect(r.insertSql).toBe("INSERT INTO studenti VALUES ('126', 'Vasile', 2, 'B2', NULL)");
  });
});

describe('char-strips: the call is quoted in full', () => {
  it('keeps the pad argument when the text is cut', () => {
    expect(padCall({ fn: 'LPAD', input: 'Pagina', len: 3, fill: '*' })).toBe("LPAD('Pagina', 3, '*')");
    expect(padCall({ fn: 'LPAD', input: 'Pagina', len: 15, fill: '*.' })).toBe("LPAD('Pagina', 15, '*.')");
    expect(padCall({ fn: 'RPAD', input: 'ab', len: 5 })).toBe("RPAD('ab', 5)");
  });
});

describe('calendar-clock: the + caption names the argument first', () => {
  it('starts with "+ 10:" and explains whole days and fractions', () => {
    const c = plusCaption(10);
    expect(c.ro).toBe('+ 10: un număr adunat mută data cu atâtea zile; o fracție (de exemplu 3/24) mută ceasul');
    expect(c.en).toBe('+ 10: adding a number moves the date by that many days; a fraction (for example 3/24) moves the clock');
    expect(plusCaption('3/24').ro.startsWith('+ 3/24: ')).toBe(true);
  });
});

describe('all-vs-some: the SOME cell shows the counterexample itself', () => {
  it('gives the first grade that meets the condition, or null', () => {
    const A = allVsSome({ studentsFrom: 'studenti', condition: 'valoare < 7', showMinusByName: true });
    const by = Object.fromEntries(A.students.map((r) => [r.student.nr_matricol, r]));
    expect(by['112'].counterexample).toBe(6); // 7, 6, 5, 6, 7, 4: the first grade below 7
    expect(by['113'].counterexample).toBe(4);
    expect(by['111'].counterexample).toBeNull();
    expect(by['111'].all).toBe(true);
  });
});

describe('age-timeline: dates as Oracle prints them (DD-MON-RR)', () => {
  it('formats the birth, today and the ADD_MONTHS anchor', () => {
    const props = { birth: '1995-02-17', today: '2026-10-26 14:30' };
    expect(ageLabels(props, ageParts(props))).toEqual({ birth: '17-FEB-95', today: '26-OCT-26', anchor: '17-OCT-26' });
  });
});

describe('number-line: pills within one mark of each other', () => {
  it('counts a result within one mark of the source as near', () => {
    expect(nearMarks(51.3, 51, 0)).toBe(true);
    expect(nearMarks(51.3, 52, 0)).toBe(true);
    expect(nearMarks(25, 30, -1)).toBe(true);
    expect(nearMarks(21.665, 20, -1)).toBe(true);
    expect(nearMarks(1, 3, 0)).toBe(false);
  });
  it('marks a line crowded when any of its results lands within one mark', () => {
    expect(lineCrowded({ value: 51.3, results: [{ fn: 'CEIL', result: 52 }] }, 0)).toBe(true);
    expect(lineCrowded({ value: 1, results: [{ fn: 'X', result: 3 }] }, 0)).toBe(false);
  });
});

describe('type-pipes: the target type stays hidden until the pipe has run', () => {
  it('shows ? for a pipe that has not run and the type once it has', () => {
    const P = typePipes({ conversions: [{ from: 'VARCHAR2', to: 'NUMBER', value: "'01110'", fn: "'01110' + 1" }, { from: 'NUMBER', to: 'VARCHAR2', value: '450', fn: "450 || ' RON'" }] });
    expect(pipeTarget(P.items[0], false)).toBe('?');
    expect(pipeTarget(P.items[0], true)).toBe('NUMBER');
    expect(pipeTarget(P.items[1], true)).toBe('VARCHAR2');
  });
});

describe('viz predict record', () => {
  const fake = () => {
    const m = new Map();
    return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { m.set(k, String(v)); } };
  };
  const ref = { src: 'bd/courses/lesson-10.json', screen: 2 };
  const step = { blocks: [{ type: 'learn' }, { type: 'viz', predict: true, widget: 'number-line' }] };

  it('records one ok predict attempt per screen, which re-opens the gate after a reload and adds nothing to review', () => {
    const storage = fake();
    const store = createLessonStore(storage);
    expect(recordVizPredict(store, ref, 1000)).toBe(true);
    expect(recordVizPredict(store, ref, 2000)).toBe(false);
    const again = createLessonStore(storage); // a reload
    const at = again.attemptsAt(ref.src, ref.screen);
    expect(at).toHaveLength(1);
    expect(at[0]).toMatchObject({ ok: true, kind: 'predict', item: vizItemId(ref), ref, at: 1000 });
    expect(seedGate(step, at)).toEqual({ completed: true });
    expect(again.pendingCount()).toBe(0);
    expect(recordVizPredict(again, ref, 3000)).toBe(false);
  });

  it('records nothing outside a lesson screen (no ref, as in the gallery)', () => {
    const store = createLessonStore(fake());
    expect(recordVizPredict(store, null, 1)).toBe(false);
    expect(store.attemptsAt('x', 1)).toEqual([]);
  });
});
