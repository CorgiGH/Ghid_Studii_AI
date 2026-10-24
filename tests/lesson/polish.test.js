import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { FACULTATE } from '../../src/components/lesson/viz/logic/facultate.js';
import { ARC_AT, ticksLit } from '../../src/components/lesson/viz/logic/age-timeline.js';
import { charStrips, lpad, rpad, swapStep } from '../../src/components/lesson/viz/logic/char-strips.js';
import { allVsSome, personName } from '../../src/components/lesson/viz/logic/all-vs-some.js';
import { mapWire, tableMap } from '../../src/components/lesson/viz/logic/table-map.js';
import { numberLine, pickIsRight, numberLines } from '../../src/components/lesson/viz/logic/number-line.js';
import { oracleDisplay } from '../../src/components/lesson/viz/logic/calendar-clock.js';
import { charStripsSql } from '../../src/components/lesson/viz/logic/oracle.js';
import { validateViz } from '../../src/components/lesson/viz/vizSpec.js';
import { lessonOrder, validateMcq } from '../../src/components/lesson/blocks/choiceSpec.js';
import { OUTLINE_TAGS, STAGED_TAGS, TRAP_TAGS } from '../../src/components/lesson/blocks/trapTags.js';
import { REFLECT_TEXT_MAX, restoredMcqPick, restoredReflect } from '../../src/lesson/restore.js';
import { calendarDaysUntil, collectMcqPool, dueLabel, furthestVisited, isPracticeOnly, pickVariant } from '../../src/lesson/review.js';
import { createLessonStore } from '../../src/lesson/store.js';
import { fallbackTable } from '../../src/components/lesson/blocks/reflectTable.js';

const bi = (s) => ({ en: s, ro: s });
const opt = (correct, misconception) => ({ text: bi('o'), correct, explain: bi('e'), ...(correct ? {} : { misconception }) });
const mcq = (id, tags, extra = {}) => ({ type: 'mcq', id, question: bi('q'), options: [opt(true), ...tags.map(t => opt(false, t))], ...extra });
const memStorage = () => { const m = {}; return { getItem: k => m[k] ?? null, setItem: (k, v) => { m[k] = v; } }; };

describe('trap catalogue in the validator', () => {
  it('knows the outline tags and the staged extras, without duplicates', () => {
    expect(OUTLINE_TAGS.length).toBeGreaterThan(40);
    expect(STAGED_TAGS.length).toBeGreaterThan(20);
    expect(TRAP_TAGS.size).toBe(OUTLINE_TAGS.length + STAGED_TAGS.length);
    expect(TRAP_TAGS.has('not-in-null')).toBe(true);
  });

  it('accepts a catalogue tag and rejects an unknown one', () => {
    expect(validateMcq(mcq('q', ['not-in-null']))).toEqual([]);
    expect(validateMcq(mcq('q', ['not-in-nul'])).join(' ')).toMatch(/not in the trap catalogue/);
  });
});

describe('review must name an earlier lesson', () => {
  it('orders lesson ids, with 01 < 01a < 01b < 02', () => {
    expect(lessonOrder('bd-l01')).toBeLessThan(lessonOrder('bd-l01a'));
    expect(lessonOrder('bd-l01c')).toBeLessThan(lessonOrder('bd-l02'));
    expect(lessonOrder('lesson 3')).toBeNull();
  });

  it('accepts an earlier lesson, rejects the same lesson and a later one', () => {
    const ok = mcq('q', ['and-or'], { review: 'bd-l04' });
    expect(validateMcq(ok, { lessonId: 'bd-l05' })).toEqual([]);
    expect(validateMcq({ ...ok, review: 'bd-l05' }, { lessonId: 'bd-l05' }).join(' ')).toMatch(/earlier/);
    expect(validateMcq({ ...ok, review: 'bd-l09' }, { lessonId: 'bd-l05' }).join(' ')).toMatch(/earlier/);
    expect(validateMcq({ ...ok, review: 'bd-l01b' }, { lessonId: 'bd-l01a' }).join(' ')).toMatch(/earlier/);
  });
});

describe('restoring a question from stored attempts', () => {
  it('mcq: the chosen option comes back, and only for its own block', () => {
    const attempts = [{ kind: 'mcq', item: 'a', option: 2 }, { kind: 'mcq', item: 'b', option: 0 }];
    expect(restoredMcqPick(attempts, 'a', 4)).toBe(2);
    expect(restoredMcqPick(attempts, 'b', 4)).toBe(0);
    expect(restoredMcqPick(attempts, 'c', 4)).toBeNull();
  });

  it('mcq: an out-of-range or missing index restores nothing', () => {
    expect(restoredMcqPick([{ kind: 'mcq', item: 'a', option: 9 }], 'a', 4)).toBeNull();
    expect(restoredMcqPick([{ kind: 'mcq', item: 'a' }], 'a', 4)).toBeNull();
    expect(restoredMcqPick(undefined, 'a', 4)).toBeNull();
  });

  it('reflect: the revealed answer and the typed text come back', () => {
    expect(restoredReflect([{ kind: 'reflect', item: 'r', text: 'my guess' }], 'r')).toEqual({ text: 'my guess' });
    expect(restoredReflect([{ kind: 'reflect', item: 'r' }], 'r')).toEqual({ text: '' });
    expect(restoredReflect([{ kind: 'reflect', item: 'x' }], 'r')).toBeNull();
    expect(REFLECT_TEXT_MAX).toBeGreaterThan(100);
  });

  it('works end to end through the store: attemptsAt feeds the restore and records nothing new', () => {
    const store = createLessonStore(memStorage());
    store.recordAttempt('q1', { ok: false, hints: 0, kind: 'mcq', item: 'q1', option: 3, ref: { src: 's', screen: 4 }, at: 1 });
    store.recordAttempt('q2', { ok: true, hints: 0, kind: 'mcq', item: 'q2', option: 1, ref: { src: 's', screen: 5 }, at: 2 });
    const before = JSON.stringify(store.attemptsAt('s', 4));
    expect(restoredMcqPick(store.attemptsAt('s', 4), 'q1', 4)).toBe(3);
    expect(restoredMcqPick(store.attemptsAt('s', 4), 'q2', 4)).toBeNull();
    expect(JSON.stringify(store.attemptsAt('s', 4))).toBe(before);
  });
});

describe('Recapitulare labels and counts', () => {
  const noon = new Date(2026, 9, 26, 12, 0).getTime();

  it('counts local calendar days, not 24-hour spans', () => {
    expect(calendarDaysUntil(new Date(2026, 9, 26, 23, 59).getTime(), noon)).toBe(0);
    expect(calendarDaysUntil(new Date(2026, 9, 27, 0, 1).getTime(), noon)).toBe(1);
    expect(calendarDaysUntil(new Date(2026, 9, 29, 8, 0).getTime(), noon)).toBe(3);
    expect(calendarDaysUntil(noon - 1000, noon)).toBe(0);
  });

  it('crosses a month and a clock change by the date, not the hour count', () => {
    const late = new Date(2026, 9, 31, 23, 0).getTime();
    expect(calendarDaysUntil(new Date(2026, 10, 1, 1, 0).getTime(), late)).toBe(1);
    const before = new Date(2026, 2, 28, 12, 0).getTime();
    expect(calendarDaysUntil(new Date(2026, 2, 30, 12, 0).getTime(), before)).toBe(2);
  });

  it('labels due items azi / mâine / în N zile', () => {
    expect(dueLabel(noon, noon, 'ro')).toBe('azi');
    expect(dueLabel(new Date(2026, 9, 27, 9, 0).getTime(), noon, 'ro')).toBe('mâine');
    expect(dueLabel(new Date(2026, 9, 30, 9, 0).getTime(), noon, 'ro')).toBe('în 4 zile');
  });

  it('a right answer on an item that is not due yet is practice only', () => {
    expect(isPracticeOnly({ due: noon + 1000 }, noon)).toBe(true);
    expect(isPracticeOnly({ due: noon }, noon)).toBe(false);
    expect(isPracticeOnly(undefined, noon)).toBe(false);
  });

  it('the tab badge counts due items only', () => {
    const store = createLessonStore(memStorage());
    const miss = (id, at) => store.recordAttempt(id, { ok: false, hints: 0, kind: 'mcq', ref: { src: 's', screen: 1 }, at });
    miss('a', noon - 10); miss('b', noon - 20);
    expect(store.dueCount(noon)).toBe(2);
    store.markReview('a', true, noon); // due again tomorrow
    expect(store.pendingCount()).toBe(2);
    expect(store.dueCount(noon)).toBe(1);
  });

  it('a practice answer leaves the schedule untouched', () => {
    const store = createLessonStore(memStorage());
    store.recordAttempt('a', { ok: false, hints: 0, kind: 'mcq', ref: { src: 's', screen: 1 }, at: 100 });
    store.markReview('a', true, 100); // due +1 day
    const due = store.pendingReview(100)[0].due;
    store.markReview('a', true, 200);
    expect(store.pendingReview(200)[0].due).toBe(due);
  });
});

describe('variant picker prefers visited lessons', () => {
  const lessons = [
    { src: 'l0', index: 0, course: { steps: [{ blocks: [mcq('a0', ['and-or'])] }] } },
    { src: 'l1', index: 1, course: { steps: [{ blocks: [mcq('a1', ['and-or'])] }] } },
    { src: 'l2', index: 2, course: { steps: [{ blocks: [mcq('a2', ['and-or'])] }] } },
    { src: 'l3', index: 3, course: { steps: [{ blocks: [mcq('a3', ['and-or'])] }] } },
  ];
  const pool = collectMcqPool(lessons);
  const item = { itemId: 'a0', tag: 'and-or' };

  it('furthestVisited gives the last opened lesson in course order', () => {
    expect(furthestVisited(['l0', 'l1', 'l2'], s => s === 'l0' || s === 'l1')).toBe(1);
    expect(furthestVisited(['l0', 'l1'], () => false)).toBe(-1);
  });

  it('only offers lessons up to the furthest visited while one fits', () => {
    for (let i = 0; i < 20; i++) {
      const v = pickVariant(item, pool, { upTo: 1, rand: Math.random });
      expect(v.entry.id).toBe('a1');
    }
  });

  it('widens to later lessons once the visited ones are exhausted of candidates', () => {
    const only0 = pickVariant(item, pool, { upTo: 0 });
    expect(['a1', 'a2', 'a3']).toContain(only0.entry.id);
  });

  it('prefers an unseen variant inside the visited lessons, repeats one before widening', () => {
    expect(pickVariant(item, pool, { upTo: 2, avoid: ['a1'] }).entry.id).toBe('a2');
    expect(pickVariant(item, pool, { upTo: 2, avoid: ['a1', 'a2'] }).entry.id).toMatch(/a1|a2/);
  });

  it('pool entries carry the lesson position from the course index', () => {
    expect(pool.map(p => p.lesson)).toEqual([0, 1, 2, 3]);
  });
});

describe('reflect fallback table formats dates with the shared formatter', () => {
  it('shows DD-MON-RR', () => {
    const t = fallbackTable('SELECT data_nastere FROM studenti');
    expect(t.rows.every(r => /^\d{2}-[A-Z]{3}-\d{2}$/.test(r.DATA_NASTERE))).toBe(true);
  });
});

// ---- widgets ----
describe('facultate data is generated from the official script', () => {
  const sql = readFileSync(new URL('../../public/sql/datasets/facultate.sql', import.meta.url), 'utf8');
  const inserts = (name) => (sql.match(new RegExp(`^INSERT INTO ${name}\\s*VALUES`, 'gim')) || []).length;

  it('has one row per INSERT in every table', () => {
    for (const name of Object.keys(FACULTATE)) expect(FACULTATE[name], name).toHaveLength(inserts(name));
  });

  it('keeps all 16 profesori, including the second p20 and p21', () => {
    expect(FACULTATE.profesori).toHaveLength(16);
    expect(FACULTATE.profesori.filter(p => p.id_prof === 'p20').map(p => p.nume)).toEqual(['PASCARIU', 'Nastasa']);
    expect(FACULTATE.profesori.filter(p => p.id_prof === 'p21').map(p => p.nume)).toEqual(['LAZAR', 'PASAT']);
  });
});

describe('age-timeline ticks', () => {
  it('the birthday ticks light up on the step the years arc appears, not one later', () => {
    expect(ticksLit(ARC_AT.y - 1)).toBe(false);
    expect(ticksLit(ARC_AT.y)).toBe(true);
    expect(ARC_AT.y).toBe(2);
  });
});

describe('char-strips swap with any number of REPLACE stages', () => {
  it.each([1, 2, 3, 4])('%i stages: every step is defined, none runs past the stages', (n) => {
    const from = 'abcd'.slice(0, n), to = 'wxyz'.slice(0, n);
    const { chain, count } = charStrips({ mode: 'swap', input: 'abcdabcd', from, to });
    expect(chain.stages).toHaveLength(n);
    expect(count).toBe(n + 2);
    const kinds = Array.from({ length: count }, (_, k) => swapStep(k, n));
    expect(kinds[0].kind).toBe('intro');
    expect(kinds.slice(1, n + 1).every((st, i) => st.kind === 'replace' && st.index === i && chain.stages[st.index])).toBe(true);
    expect(kinds[n].last).toBe(true);
    expect(kinds[n + 1].kind).toBe('translate');
  });

  it('the old two-stage view keeps its four steps', () => {
    expect(charStrips({ mode: 'swap', input: 'Ciobotariu', from: 'ia', to: 'ai' }).count).toBe(4);
  });
});

describe('char-strips pad without a fill', () => {
  it('pads with a blank like Oracle', () => {
    expect(lpad('ab', 5)).toBe('   ab');
    expect(rpad('ab', 5)).toBe('ab   ');
    expect(charStrips({ mode: 'pad', input: 'ab', fn: 'LPAD', len: 5 }).plan.result).toBe('   ab');
  });

  it('the validator and the Oracle query both treat fill as optional', () => {
    const block = { id: 'v', widget: 'char-strips', props: { mode: 'pad', input: 'ab', fn: 'LPAD', len: 5 } };
    expect(validateViz(block)).toEqual([]);
    expect(charStripsSql(block.props)).toEqual(["SELECT LPAD('ab', 5) FROM dual"]);
    expect(charStripsSql({ ...block.props, fill: '*' })).toEqual(["SELECT LPAD('ab', 5, '*') FROM dual"]);
    expect(validateViz({ ...block, props: { mode: 'pad', input: 'ab', fn: 'LPAD' } }).join(' ')).toMatch(/props.len/);
  });
});

describe('all-vs-some compares nume and prenume', () => {
  it('names are (nume, prenume) pairs, so only the two Bodnar Ioana merge', () => {
    const r = allVsSome({ studentsFrom: 'studenti', condition: 'valoare < 7', showMinusByName: true });
    expect(r.minus.byName).toEqual(['Bodnar Ioana', 'Ciobotariu Ciprian', 'Panaite Alexandru', 'Popescu Bogdan']);
    expect(r.minus.byKey).toHaveLength(5);
    expect(personName({ nume: 'Bodnar', prenume: 'Ioana' })).toBe('Bodnar Ioana');
  });

  it('two students with the same nume but different prenume stay apart', () => {
    const r = allVsSome({ studentsFrom: 'studenti', condition: 'valoare < 0', showMinusByName: true });
    const arhire = r.students.filter(s => s.student.nume === 'Arhire');
    // Arhire Raluca / Arhire Alexandra, if they have grades, are two different names
    expect(new Set(arhire.map(s => personName(s.student))).size).toBe(arhire.length);
  });
});

describe('table-map arrow fired from a key cell', () => {
  const m = tableMap({ from: 'note.nr_matricol', to: 'studenti.nr_matricol', question: { en: 'At course 24 there is a grade 9. Whose is it?' }, answerKey: '111' });
  const cols = Object.keys(m.fromRows[0]);

  it('leads from the clicked row to the studenti row with the same key', () => {
    const w = mapWire(m, 2, cols);
    expect(w.row).toBe(2);
    expect(w.from.startsWith('from:2:')).toBe(true);
    expect(w.to).toBe(`to:${m.toRows.indexOf(m.target)}:nr_matricol`);
    expect(m.target.nume).toBe('Popescu');
  });

  it('falls back to the picked row for no or a bad click, and gives nothing without a target', () => {
    expect(mapWire(m, null, cols).row).toBe(m.pick);
    expect(mapWire(m, 99, cols).row).toBe(m.pick);
    expect(mapWire({ ...m, target: null }, 0, cols)).toBeNull();
  });
});

describe('number-line prediction', () => {
  it('a pick is right only on the mark the function really gives', () => {
    expect(pickIsRight(51.3, 'CEIL', 0, 52)).toBe(true);
    expect(pickIsRight(51.3, 'CEIL', 0, 51)).toBe(false);
    expect(pickIsRight(-51.3, 'FLOOR', 0, -52)).toBe(true);
    expect(pickIsRight(-51.3, 'TRUNC', 0, -51)).toBe(true);
    expect(pickIsRight(21.365, 'ROUND', 2, 21.37)).toBe(true);
    expect(pickIsRight(21.665, 'ROUND', -1, 20)).toBe(true);
    expect(pickIsRight(25, 'ROUND', -1, 30)).toBe(true);
  });

  it('the right answer is always one of the marks offered to click', () => {
    for (const [values, fns, digits] of [[[51.3, -51.3], ['CEIL', 'FLOOR', 'ROUND', 'TRUNC'], 0], [[21.365], ['ROUND', 'TRUNC'], 2], [[21.665, 25], ['ROUND', 'TRUNC'], -1]]) {
      for (const ln of numberLines({ values, fns, digits }).lines) {
        for (const fn of fns) {
          const marks = ln.window.ticks.filter(x => pickIsRight(ln.value, fn, digits, x));
          expect(marks, `${ln.value} ${fn}`).toHaveLength(1);
          expect(numberLine(ln.value, fn, digits)).toBeDefined();
        }
      }
    }
  });
});

describe('calendar-clock shows what Oracle shows', () => {
  it('DD-MON-RR carries the date only, the time is given separately', () => {
    expect(oracleDisplay('2026-11-05 17:30')).toEqual({ date: '05-NOV-26', time: '17:30' });
    expect(oracleDisplay('2026-11-05')).toEqual({ date: '05-NOV-26', time: null });
  });
});
