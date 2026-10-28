import { describe, it, expect } from 'vitest';
import { DATA, selectSimple, evalWhere, likeMatch } from '../../src/components/lesson/viz/logic/common.js';
import { stepperReducer, initialStepper } from '../../src/components/lesson/viz/logic/stepper.js';
import { tableMap } from '../../src/components/lesson/viz/logic/table-map.js';
import { tableBuild } from '../../src/components/lesson/viz/logic/table-build.js';
import { rowInsert } from '../../src/components/lesson/viz/logic/row-insert.js';
import { deleteSweep } from '../../src/components/lesson/viz/logic/delete-sweep.js';
import { likeSteps } from '../../src/components/lesson/viz/logic/like-slider.js';
import { inBetween } from '../../src/components/lesson/viz/logic/in-between.js';
import { curveReach, underRunEnd } from '../../src/components/lesson/viz/logic/wire-geometry.js';
import { numberLine, reachableStep } from '../../src/components/lesson/viz/logic/number-line.js';
import { charBoxes, charOps } from '../../src/components/lesson/viz/logic/char-boxes.js';
import { lpad, rpad, translateStr, padPlan, swapPlan, replaceChain, charStrips } from '../../src/components/lesson/viz/logic/char-strips.js';
import { calendar, calendarSteps } from '../../src/components/lesson/viz/logic/calendar-clock.js';
import { formatDate, displayCell } from '../../src/components/lesson/viz/logic/date-mask.js';
import { monthsBetween, ageSteps, ageParts } from '../../src/components/lesson/viz/logic/age-timeline.js';
import { decodeRoute } from '../../src/components/lesson/viz/logic/decode-sieve.js';
import { convert } from '../../src/components/lesson/viz/logic/type-pipes.js';
import { cartesianGrid } from '../../src/components/lesson/viz/logic/cartesian-grid.js';
import { joinRows } from '../../src/components/lesson/viz/logic/join-wires.js';
import { selfPairs } from '../../src/components/lesson/viz/logic/self-pairs.js';
import { allVsSome } from '../../src/components/lesson/viz/logic/all-vs-some.js';
import { setOp, setBalls } from '../../src/components/lesson/viz/logic/set-balls.js';
import { WIDGET_NAMES, validateViz } from '../../src/components/lesson/viz/vizSpec.js';

describe('stepper reducer', () => {
  it('without predict, steps move within bounds', () => {
    let s = initialStepper({ predict: false });
    expect(s.step).toBe(0);
    s = stepperReducer(s, { type: 'back', n: 4 });
    expect(s.step).toBe(0);
    for (let i = 0; i < 6; i++) s = stepperReducer(s, { type: 'next', n: 4 });
    expect(s.step).toBe(3);
  });
  it('with predict, next is locked until reveal, and reveal moves to the first real step', () => {
    let s = initialStepper({ predict: true });
    s = stepperReducer(s, { type: 'next', n: 4 });
    expect(s.step).toBe(0);
    expect(s.revealed).toBe(false);
    s = stepperReducer(s, { type: 'reveal', n: 4 });
    expect(s.revealed).toBe(true);
    expect(s.step).toBe(1);
    s = stepperReducer(s, { type: 'back', n: 4 });
    expect(s.step).toBe(0);
    s = stepperReducer(s, { type: 'next', n: 4 });
    expect(s.step).toBe(1);
  });
  it('goto is clamped and also locked by predict', () => {
    let s = initialStepper({ predict: true });
    s = stepperReducer(s, { type: 'goto', to: 3, n: 4 });
    expect(s.step).toBe(0);
    s = stepperReducer(s, { type: 'reveal', n: 4 });
    s = stepperReducer(s, { type: 'goto', to: 99, n: 4 });
    expect(s.step).toBe(3);
  });
});

describe('table-map', () => {
  it('follows the grade at course 24 to Popescu', () => {
    const r = tableMap({ from: 'note.nr_matricol', to: 'studenti.nr_matricol', where: { id_curs: '24' }, question: { en: 'At course 24 there is a grade 9. Whose is it?' }, answerKey: '111' });
    expect(r.fromRows[r.pick]).toMatchObject({ id_curs: '24', valoare: 9 });
    expect(r.target.nume).toBe('Popescu');
  });
});

describe('table-build', () => {
  it('builds the CREATE TABLE text one column at a time', () => {
    const r = tableBuild('studenti', [{ name: 'nr_matricol', type: 'CHAR(6)', notNull: true }, { name: 'nume', type: 'VARCHAR2(10)' }]);
    expect(r.counts).toEqual([0, 1, 2]);
    expect(r.sqlAt(2)).toBe('CREATE TABLE studenti (\n  nr_matricol CHAR(6) NOT NULL,\n  nume VARCHAR2(10)\n)');
    expect(r.sqlAt(1)).toBe('CREATE TABLE studenti (\n  nr_matricol CHAR(6) NOT NULL\n)');
  });
});

describe('row-insert', () => {
  const row = { nr_matricol: '126', nume: 'Vasile', bursa: null };
  it('lists columns in order and the INSERT text', () => {
    const r = rowInsert({ table: 'studenti', row });
    expect(r.columns).toEqual(['nr_matricol', 'nume', 'bursa']);
    expect(r.insertSql).toBe("INSERT INTO studenti VALUES ('126', 'Vasile', NULL)");
    expect(r.error).toBeNull();
  });
  it('names the column of a NULL rejection', () => {
    const r = rowInsert({ table: 'studenti', row, errorCase: { row: { ...row, nr_matricol: null }, code: 'ORA-01400' } });
    expect(r.error.code).toBe('ORA-01400');
    expect(r.error.column).toBe('nr_matricol');
    expect(r.error.message).toContain('"NR_MATRICOL"');
  });
});

describe('delete-sweep', () => {
  it('marks only the rows the WHERE keeps out', () => {
    const r = deleteSweep({ table: 'note', where: 'valoare < 5' });
    const expected = DATA.note.filter(x => x.valoare < 5).length;
    expect(r.deleted).toBe(expected);
    expect(r.kept).toBe(DATA.note.length - expected);
    expect(r.doomed.filter(Boolean)).toHaveLength(expected);
  });
  it('without WHERE every row goes and the table stays', () => {
    const r = deleteSweep({ table: 'note' });
    expect(r.deleted).toBe(42);
    expect(r.kept).toBe(0);
    expect(r.sql).toBe('DELETE FROM note');
  });
});

describe('like-slider', () => {
  it('_r% matches Prelipcean, Arhire and Archip but not Bodnar', () => {
    expect(likeSteps('_r%', 'Prelipcean').match).toBe(true);
    expect(likeSteps('_r%', 'Prelipcean').steps.at(-1).ok).toBe(true);
    expect(likeSteps('_r%', 'Arhire').match).toBe(true);
    expect(likeSteps('_r%', 'Bodnar').match).toBe(false);
    expect(likeSteps('_r%', 'Bodnar').steps.at(-1).ok).toBe(false);
  });
  it('%escu matches by the end of the name', () => {
    expect(likeMatch('%escu', 'Popescu')).toBe(true);
    expect(likeMatch('%escu', 'Pintescu')).toBe(true);
    expect(likeMatch('%escu', 'Bucur')).toBe(false);
  });
  it('is case sensitive and _ needs a character', () => {
    expect(likeMatch('p%', 'Popescu')).toBe(false);
    expect(likeMatch('Bucur_', 'Bucur')).toBe(false);
  });
});

describe('in-between', () => {
  it('IN is three-valued', () => {
    const p = { list: ['Andrei', 'Radu', 'Marius'] };
    expect(inBetween('in', p, 'Radu').result).toBe(true);
    expect(inBetween('in', p, 'Ioana').result).toBe(false);
    expect(inBetween('in', p, null).result).toBeNull();
  });
  it('BETWEEN includes both ends', () => {
    const p = { low: 250, high: 350 };
    expect(inBetween('between', p, 350).result).toBe(true);
    expect(inBetween('between', p, 250).result).toBe(true);
    expect(inBetween('between', p, 450).result).toBe(false);
    expect(inBetween('between', p, null).result).toBeNull();
  });
  it('ALL combines with and, ANY with or', () => {
    const all = inBetween('all', { list: [1, 2], op: '>=' }, 2);
    expect(all.result).toBe(true);
    expect(inBetween('all', { list: [1, 2], op: '>=' }, 1).result).toBe(false);
    expect(inBetween('any', { list: [2, 3], op: '=' }, 3).result).toBe(true);
    expect(DATA.studenti.filter(s => inBetween('all', { list: [1, 2], op: '>=' }, s.an).result === true)).toHaveLength(9);
  });
});

describe('number-line', () => {
  it('TRUNC and ROUND treat negatives away from and toward zero', () => {
    expect(numberLine(-51.3, 'TRUNC')).toBe(-51);
    expect(numberLine(-51.3, 'CEIL')).toBe(-51);
    expect(numberLine(-51.3, 'FLOOR')).toBe(-52);
    expect(numberLine(-51.3, 'ROUND')).toBe(-51);
    expect(numberLine(-2.5, 'ROUND')).toBe(-3);
    expect(numberLine(51.3, 'CEIL')).toBe(52);
  });
  it('digits move the grid, also to the left of the point', () => {
    expect(numberLine(21.365, 'ROUND', 2)).toBe(21.37);
    expect(numberLine(21.365, 'TRUNC', 2)).toBe(21.36);
    expect(numberLine(25, 'ROUND', -1)).toBe(30);
    expect(numberLine(25, 'TRUNC', -1)).toBe(20);
    expect(numberLine(21.665, 'ROUND', -1)).toBe(20);
  });
});

describe('char-boxes', () => {
  it('a CHAR(10) holds blanks you cannot see', () => {
    const b = charBoxes('Breaban', 10);
    expect(b.boxes).toHaveLength(10);
    expect(b.boxes.filter(x => x.blank)).toHaveLength(3);
    expect(b.length).toBe(10);
    expect(b.trimmedLength).toBe(7);
  });
  it('LENGTH, TRIM and LIKE on the padded value', () => {
    const ops = charOps({ value: 'Cosmin', width: 10, ops: ['LENGTH', 'TRIM', 'LIKE'], likePattern: '%n' });
    expect(ops[0]).toMatchObject({ op: 'LENGTH', result: 10 });
    expect(ops[1]).toMatchObject({ op: 'TRIM', result: 'Cosmin' });
    expect(ops[2]).toMatchObject({ op: 'LIKE', result: false });
  });
});

describe('char-strips', () => {
  it('LPAD fills on the left, repeating a multi-character fill', () => {
    expect(lpad('Pagina', 15, '*.')).toBe('*.*.*.*.*Pagina');
    expect(rpad('Pagina', 9, 'ab')).toBe('Paginaaba');
  });
  it('LPAD to a shorter length cuts from the right', () => {
    expect(lpad('Pagina', 3, '*')).toBe('Pag');
    const p = padPlan({ input: 'Pagina', fn: 'LPAD', len: 3, fill: '*' });
    expect(p.cut).toBe(3);
    expect(p.padCount).toBe(0);
  });
  it('TRANSLATE swaps character by character', () => {
    expect(translateStr('Ciobotariu', 'ia', 'ai')).toBe('Caobotirau');
    expect(translateStr('abc', 'ab', 'x')).toBe('xc');
    const s = swapPlan({ input: 'Ciobotariu', from: 'ia', to: 'ai' });
    expect(s.chars.map(c => c.out).join('')).toBe('Caobotirau');
    expect(s.chars.filter(c => c.changed)).toHaveLength(3);
  });
  it('chained REPLACE breaks the swap that TRANSLATE does in one step', () => {
    const c = replaceChain({ input: 'Ciobotariu', from: 'ia', to: 'ai' });
    expect(c.stages.map(x => x.text)).toEqual(['Caobotarau', 'Ciobotiriu']);
    expect(c.result).not.toBe(translateStr('Ciobotariu', 'ia', 'ai'));
    expect(charStrips({ mode: 'swap', input: 'Ciobotariu', from: 'ia', to: 'ai' }).count).toBe(4);
  });
  it('the pad plan counts the pad slots', () => {
    const p = padPlan({ input: 'Pagina', fn: 'LPAD', len: 15, fill: '*.' });
    expect(p.padCount).toBe(9);
    expect(p.result).toBe('*.*.*.*.*Pagina');
    expect(p.pad.join('')).toBe('*.*.*.*.*');
  });
});

describe('calendar-clock', () => {
  it('ADD_MONTHS from 31 January lands on the last day of February', () => {
    expect(calendar('2026-01-31', { fn: 'ADD_MONTHS', arg: 1 })).toBe('2026-02-28');
    expect(calendar('2026-02-28', { fn: 'ADD_MONTHS', arg: 1 })).toBe('2026-03-31');
    expect(calendar('2026-10-26 14:30', { fn: 'ADD_MONTHS', arg: 1 })).toBe('2026-11-26 14:30');
  });
  it('+ days, + fractions of a day', () => {
    expect(calendar('2026-10-26 14:30', { fn: '+', arg: 10 })).toBe('2026-11-05 14:30');
    expect(calendar('2026-10-26 14:30', { fn: '+', arg: '3/24' })).toBe('2026-10-26 17:30');
    expect(calendar('2026-10-26 14:30', { fn: '+', arg: 0.5 })).toBe('2026-10-27 02:30');
  });
  it('LAST_DAY, NEXT_DAY, TRUNC', () => {
    expect(calendar('2026-10-26 14:30', { fn: 'LAST_DAY' })).toBe('2026-10-31 14:30');
    expect(calendar('2026-10-31 14:30', { fn: 'NEXT_DAY', arg: 'MONDAY' })).toBe('2026-11-02 14:30');
    expect(calendar('2026-11-02 14:30', { fn: 'NEXT_DAY', arg: 'MONDAY' })).toBe('2026-11-09 14:30');
    expect(calendar('2026-10-26 14:30', { fn: 'TRUNC' })).toBe('2026-10-26 00:00');
    expect(calendar('2026-11-02 14:30', { fn: 'TRUNC', arg: 'MM' })).toBe('2026-11-01 00:00');
    expect(calendar('2026-11-02 14:30', { fn: 'TRUNC', arg: 'YYYY' })).toBe('2026-01-01 00:00');
  });
  it('chains the ops and reports each stop', () => {
    const s = calendarSteps({ start: '2026-10-26 14:30', ops: [{ fn: 'LAST_DAY' }, { fn: 'NEXT_DAY', arg: 'MONDAY' }, { fn: 'TRUNC', arg: 'MM' }] });
    expect(s.stops).toEqual(['2026-10-26 14:30', '2026-10-31 14:30', '2026-11-02 14:30', '2026-11-01 00:00']);
  });
});

describe('date-mask', () => {
  it('formats the usual masks (NLS AMERICAN)', () => {
    expect(formatDate('1995-02-17', 'DD-MM-YYYY').text).toBe('17-02-1995');
    expect(formatDate('1995-02-17', 'DD-MON-YY').text).toBe('17-FEB-95');
    expect(formatDate('1995-02-17', 'Mon').text).toBe('Feb');
    expect(formatDate('1995-02-17', 'YYYY-MM-DD HH24:MI').text).toBe('1995-02-17 00:00');
  });
  it('Day pads to nine characters, fm removes the padding', () => {
    expect(formatDate('1995-02-17', 'Day').text).toBe('Friday   ');
    expect(formatDate('1995-02-17', 'DAY').text).toBe('FRIDAY   ');
    expect(formatDate('1995-02-17', 'fmDay').text).toBe('Friday');
    expect(formatDate('1995-02-17', 'Month').text).toBe('February ');
    expect(formatDate('1995-02-03', 'fmDD/MM').text).toBe('3/2');
  });
  it('keeps the token list for the animation', () => {
    const f = formatDate('1995-02-17', 'DD-MON-YY');
    expect(f.parts.map(p => p.token)).toEqual(['DD', '-', 'MON', '-', 'YY']);
  });
});

describe('age-timeline', () => {
  it('MONTHS_BETWEEN follows the 31-day rule', () => {
    expect(monthsBetween('2026-10-26 14:30', '1995-02-17')).toBeCloseTo(380.30981, 4);
    expect(monthsBetween('2026-01-31', '2025-12-31')).toBe(1);
    expect(monthsBetween('2026-03-31', '2026-02-28')).toBe(1);
  });
  it('age is the floor of months / 12', () => {
    const s = ageSteps({ birth: '1995-02-17', today: '2026-10-26 14:30' });
    expect(s.age).toBe(31);
    expect(s.months).toBeCloseTo(380.30981, 4);
    expect(s.naive).toBeCloseTo(31.7, 0);
  });
  it('splits into three arcs: 31 years, 8 months, 9 days', () => {
    expect(ageParts({ birth: '1995-02-17', today: '2026-10-26 14:30' })).toMatchObject({ years: 31, months: 8, days: 9, wholeMonths: 380 });
    expect(ageSteps({ birth: '1995-02-17', today: '2026-10-26 14:30' }).count).toBe(5);
  });
});

describe('decode-sieve', () => {
  const pairs = [[450, 'premiul 1'], [350, 'premiul 2'], [250, 'premiul 3']];
  it('a NULL falls through every layer to the default', () => {
    expect(decodeRoute(null, pairs, 'mentiune')).toMatchObject({ index: -1, isDefault: true, result: 'mentiune' });
  });
  it('a value stops at the first layer that equals it', () => {
    expect(decodeRoute(350, pairs, 'mentiune')).toMatchObject({ index: 1, isDefault: false, result: 'premiul 2' });
  });
  it('a NULL search value catches a NULL', () => {
    expect(decodeRoute(null, [[null, 'fara bursa']], 'x')).toMatchObject({ index: 0, result: 'fara bursa' });
  });
  it('without a default the result is NULL', () => {
    expect(decodeRoute(1, pairs).result).toBeNull();
  });
});

describe('type-pipes', () => {
  it('converts the three lesson examples', () => {
    expect(convert({ from: 'VARCHAR2', to: 'NUMBER', value: "'01110'", fn: "'01110' + 1" })).toBe('1111');
    expect(convert({ from: 'NUMBER', to: 'VARCHAR2', value: '450', fn: "450 || ' RON'" })).toBe('450 RON');
    expect(convert({ from: 'DATE', to: 'VARCHAR2', value: '17-FEB-95', fn: "data_nastere || ''" })).toBe('17-FEB-95');
  });
  it('does arithmetic on quoted numbers', () => {
    expect(convert({ from: 'VARCHAR2', to: 'NUMBER', value: "'12'", fn: "'12' * 2" })).toBe('24');
    expect(convert({ from: 'VARCHAR2', to: 'NUMBER', value: "'7'", fn: "10 - '7'" })).toBe('3');
  });
  it('gives null for what needs Oracle', () => {
    expect(convert({ from: 'A', to: 'B', value: 'x', fn: 'TO_CHAR(SYSDATE)' })).toBeNull();
  });
});

describe('cartesian-grid', () => {
  it('13 students x 42 grades = 546 pairs, 42 of which agree', () => {
    const g = cartesianGrid({ left: 'studenti', right: 'note', on: 'studenti.nr_matricol = note.nr_matricol' });
    expect(g.rows).toBe(13);
    expect(g.cols).toBe(42);
    expect(g.total).toBe(546);
    expect(g.matches).toBe(42);
    expect(g.hit.flat().filter(Boolean)).toHaveLength(42);
  });
});

describe('join-wires', () => {
  const on = 'studenti.nr_matricol = note.nr_matricol';
  const withGrades = new Set(DATA.note.map(n => n.nr_matricol)).size;
  it('inner join keeps the 42 pairs; left join adds the students without grades', () => {
    expect(joinRows({ left: 'studenti', right: 'note', on, kind: 'inner' }).pairs).toHaveLength(42);
    const l = joinRows({ left: 'studenti', right: 'note', on, kind: 'left' });
    expect(l.pairs).toHaveLength(42 + (13 - withGrades));
    expect(l.pairs.filter(p => p.right === null)).toHaveLength(13 - withGrades);
  });
  it('a filter in ON keeps every student, a filter in WHERE drops them', () => {
    const tens = DATA.note.filter(n => n.valoare === 10).length;
    const inOn = joinRows({ left: 'studenti', right: 'note', on, kind: 'left', filterIn: 'on', filter: 'note.valoare = 10' });
    const inWhere = joinRows({ left: 'studenti', right: 'note', on, kind: 'left', filterIn: 'where', filter: 'note.valoare = 10' });
    const studentsWithTen = new Set(DATA.note.filter(n => n.valoare === 10).map(n => n.nr_matricol)).size;
    expect(inOn.pairs.filter(p => p.kept)).toHaveLength(tens + (13 - studentsWithTen));
    expect(inWhere.pairs.filter(p => p.kept)).toHaveLength(tens);
    expect(inWhere.pairs.length).toBeGreaterThan(tens);
  });
  it('right and full joins add the unmatched right side', () => {
    const r = joinRows({ left: 'cursuri', right: 'didactic', on: 'cursuri.id_curs = didactic.id_curs', kind: 'right' });
    expect(r.pairs.length).toBe(10);
    const f = joinRows({ left: 'cursuri', right: 'didactic', on: 'cursuri.id_curs = didactic.id_curs', kind: 'full' });
    expect(f.pairs.filter(p => p.left === null || p.right === null).length).toBeGreaterThan(0);
  });
});

describe('self-pairs', () => {
  it('<> yields both orders, < only one of each', () => {
    const a = selfPairs({ table: 'studenti', pairOn: "TO_CHAR(data_nastere, 'D')", order: '<>' });
    const b = selfPairs({ table: 'studenti', pairOn: "TO_CHAR(data_nastere, 'D')", order: '<' });
    expect(a.pairs.length).toBe(2 * b.pairs.length);
    expect(b.pairs.length).toBeGreaterThan(0);
    for (const p of a.pairs) expect(p.a.nr_matricol).not.toBe(p.b.nr_matricol);
  });
});

describe('all-vs-some', () => {
  const run = () => allVsSome({ studentsFrom: 'studenti', condition: 'valoare < 7', showMinusByName: true });
  it('reads the condition as the counterexample and lists only students with grades', () => {
    const r = run();
    expect(r.students.every(s => s.grades.length > 0)).toBe(true);
    for (const s of r.students) {
      expect(s.some).toBe(s.grades.some(g => g < 7));
      expect(s.all).toBe(!s.some);
    }
  });
  it('qualifying students are exactly 111, 115, 116, 118, 119', () => {
    expect(run().qualifying).toEqual(['111', '115', '116', '118', '119']);
  });
  it('MINUS on (nume, prenume) merges the two Bodnar Ioana: 4 names for 5 students', () => {
    const r = run();
    expect(r.minus.byKey).toHaveLength(5);
    expect(r.minus.byName).toEqual(['Bodnar Ioana', 'Ciobotariu Ciprian', 'Panaite Alexandru', 'Popescu Bogdan']);
  });
});

describe('set-balls', () => {
  const L = 'SELECT nume FROM studenti WHERE an = 2';
  const R = 'SELECT nume FROM studenti WHERE an = 3';
  it('UNION removes duplicates, UNION ALL keeps them: 8 and 9', () => {
    const s = setBalls({ left: L, right: R, ops: ['UNION', 'UNION ALL'] });
    expect(s.results[0].values).toHaveLength(8);
    expect(s.results[1].values).toHaveLength(9);
  });
  it('INTERSECT and MINUS compare whole values and deduplicate', () => {
    expect(setOp('INTERSECT', ['a', 'b', 'b'], ['b', 'c'])).toEqual(['b']);
    expect(setOp('MINUS', ['a', 'b', 'b'], ['b', 'c'])).toEqual(['a']);
    expect(setBalls({ left: L, right: 'SELECT nume FROM studenti WHERE bursa IS NOT NULL', ops: ['INTERSECT'] }).results[0].values).toEqual(['Archip', 'Ciobotariu']);
  });
});

describe('common helpers', () => {
  it('evalWhere is three-valued', () => {
    expect(evalWhere('bursa > 300', { bursa: null })).toBeNull();
    expect(evalWhere('bursa IS NULL', { bursa: null })).toBe(true);
    expect(evalWhere("nume LIKE 'P%' AND an = 3", { nume: 'Popescu', an: 3 })).toBe(true);
  });
  it('selectSimple runs a one-table SELECT', () => {
    expect(selectSimple('SELECT nume FROM studenti WHERE an = 1').rows).toHaveLength(4);
  });
});

describe('viz block spec', () => {
  it('knows all nineteen widgets', () => {
    expect(WIDGET_NAMES.filter((n) => !n.startsWith('ml-'))).toHaveLength(19);
  });
  it('validates id, widget, props and predict', () => {
    const ok = { type: 'viz', id: 'bd-l6-like', widget: 'like-slider', predict: false, props: { pattern: '_r%', values: ['a'] } };
    expect(validateViz(ok)).toEqual([]);
    expect(validateViz({ ...ok, widget: 'nope' })[0]).toMatch(/widget/);
    expect(validateViz({ ...ok, id: '' })[0]).toMatch(/id/);
    expect(validateViz({ ...ok, props: {} }).join(' ')).toMatch(/pattern/);
    expect(validateViz({ ...ok, predict: 'yes' }).join(' ')).toMatch(/predict/);
    expect(validateViz({ type: 'viz', id: 'x', widget: 'table-map', props: { dataset: 'facultate', from: 'a.b', to: 'c.d', question: { en: 'q' }, answerKey: '1' } }).join(' ')).toMatch(/question/);
    // the rows shown must be the question's own rows (where), never the rows of the answer key
    expect(validateViz({ type: 'viz', id: 'x', widget: 'table-map', props: { dataset: 'facultate', from: 'a.b', to: 'c.d', question: { en: 'q', ro: 'q' }, answerKey: '1' } }).join(' ')).toMatch(/where/);
  });
});

describe('table cells', () => {
  it('DATE cells show as DD-MON-RR, NULL as NULL', () => {
    expect(displayCell('2014-02-17')).toBe('17-FEB-14');
    expect(displayCell(null)).toBe('NULL');
    expect(displayCell(9)).toBe('9');
    expect(displayCell('2014')).toBe('2014');
  });
});

describe('number-line progress dots', () => {
  it('cannot skip an asking step', () => {
    // 5 steps (setup + 4 functions), predict on, nothing shown yet: only the first asking step is reachable
    expect(reachableStep(4, { n: 5, predict: true, shown: {} })).toBe(1);
    expect(reachableStep(0, { n: 5, predict: true, shown: {} })).toBe(0);
    // step 1 shown: step 2 is the next asking step
    expect(reachableStep(4, { n: 5, predict: true, shown: { 1: true } })).toBe(2);
    expect(reachableStep(1, { n: 5, predict: true, shown: { 1: true } })).toBe(1);
    expect(reachableStep(4, { n: 5, predict: true, shown: { 1: true, 2: true, 3: true, 4: true } })).toBe(4);
    // going back is always allowed, and out-of-range targets are clamped
    expect(reachableStep(-3, { n: 5, predict: true, shown: {} })).toBe(0);
  });
  it('without predict every step is open', () => {
    expect(reachableStep(9, { n: 5 })).toBe(4);
    expect(reachableStep(3, { n: 5, predict: false, shown: {} })).toBe(3);
  });
});

describe('wire along a row gridline', () => {
  it('stops at the visible edge of a scrolling source table instead of overshooting into the next one', () => {
    // 700 px: the row is 304 wide but the visible box ends at 285, and the next table starts at 299
    expect(underRunEnd({ rowLeft: 0, rowRight: 304, wrapLeft: 0, wrapRight: 285, leftToRight: true })).toBe(285);
    expect(underRunEnd({ rowLeft: 0, rowRight: 315, wrapLeft: 0, wrapRight: 315, leftToRight: true })).toBe(315);
    expect(underRunEnd({ rowLeft: -20, rowRight: 300, wrapLeft: 10, wrapRight: 300, leftToRight: false })).toBe(10);
  });
  it('curve reach never exceeds the gap when the gap is short', () => {
    expect(curveReach(14)).toBe(14);
    expect(curveReach(-14)).toBe(14);
    expect(curveReach(40)).toBe(24);
    expect(curveReach(200)).toBe(90);
  });
});
