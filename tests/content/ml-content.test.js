// The ML lesson content as a whole: registration, shared ids, and the content gate (numbers, data on screen, repetition, quiz
// quality, text sweep, structure, terms, formats, KaTeX, colours). The checks live in scripts/ml/content-checks.mjs so the
// per-lesson report (scripts/ml/check-repetition.mjs) runs the same code; they are re-exported from here.
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import ml from '../../src/content/ml/index.js';
import { yearSemesters, getSubject } from '../../src/content/registry.js';
import { loadJson } from '../../src/content/jsonLoader.js';
import { isRawMaterial } from '../../src/content/rawMaterial.js';
import {
  numberProblems, dataProblems, citedProblems, repetitionProblems, quizProblems, textProblems, structureProblems, validatorProblems,
  vizProblems, termProblems, giveawayProblems, pairProblems, formatProblems, katexProblems, colourProblems, colourFiles,
  citedNumbers, termMatcher, mathParts, registeredWidgets, loadAllocation, loadTermOwners, loadLessons, runAll,
} from '../../scripts/ml/content-checks.mjs';

export {
  numberProblems, dataProblems, citedProblems, repetitionProblems, quizProblems, textProblems, structureProblems, validatorProblems,
  vizProblems, termProblems, giveawayProblems, pairProblems, formatProblems, katexProblems, colourProblems,
};

const ROOT = path.resolve(import.meta.dirname, '..', '..');
const COURSES = path.join(ROOT, 'src/content/ml/courses');
const files = fs.existsSync(COURSES) ? fs.readdirSync(COURSES).filter((f) => /^lesson-\d\d\.json$/.test(f)).sort() : [];

describe('ml registration', () => {
  it('is a lesson-player subject in year 2 semester 1, after bd', () => {
    expect(ml.slug).toBe('ml');
    expect(ml.player).toBe('lesson');
    expect(ml.yearSemester).toBe('y2s1');
    expect(ml.title).toEqual({ en: 'Machine learning', ro: 'Învățare automată' });
    expect(ml.shortTitle).toEqual({ en: 'ML', ro: 'ML' });
    expect(getSubject('ml')).toBe(ml);
    expect(yearSemesters.find((y) => y.id === 'y2s1').subjects).toEqual(['bd', 'ml']);
  });
  it('has a bilingual description', () => {
    expect(ml.description.en).toMatch(/weeks 1–5/);
    expect(ml.description.ro).toMatch(/săptămânile 1–5/);
  });
  it('registers one course per lesson file, in ml-l01… order with no gaps', () => {
    expect(ml.courses.map((c) => c.id)).toEqual(files.map((_, i) => `ml-l${String(i + 1).padStart(2, '0')}`));
    expect(ml.courses).toHaveLength(files.length);
  });
  it('gives each course its file, meta id, section count and unique step ids', () => {
    for (const [i, c] of ml.courses.entries()) {
      const nn = String(i + 1).padStart(2, '0');
      expect(c.src).toBe(`ml/courses/lesson-${nn}.json`);
      expect(c.metaId).toBe(c.id);
      const json = loadJson(c.src);
      expect(json.meta.id).toBe(c.metaId);
      expect(c.sectionCount).toBe(json.steps.length);
      const ids = json.steps.map((s) => s.id);
      for (const id of ids) expect(id.startsWith(`${c.metaId}-`)).toBe(true);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});

// BD and ML share one progress store, keyed by step and block id (attempts, the review pile). An ML id that equals a BD id or
// another ML lesson's would mix their progress, so every step and block id starts with its lesson id and is used once in the
// subject (BD's content test holds its own lessons to the same rule).
function idProblems(lessons) {
  const out = [];
  const seen = new Set();
  for (const { metaId, json } of lessons) {
    for (const s of json.steps || []) {
      for (const id of [s.id, ...(s.blocks || []).map((b) => b.id).filter((v) => v !== undefined)]) {
        if (typeof id !== 'string' || !id.startsWith(`${metaId}-`)) out.push(`${id} does not start with ${metaId}-`);
        else if (seen.has(id)) out.push(`${id} is used twice`);
        seen.add(id);
      }
    }
  }
  return out;
}

describe('ids in the shared progress store', () => {
  it('flags an id without its lesson prefix and an id used twice', () => {
    const bad = [
      { metaId: 'ml-l01', json: { steps: [{ id: 'ml-l01-s1', blocks: [{ type: 'mcq', id: 'q1' }, { type: 'learn' }] }] } },
      { metaId: 'ml-l02', json: { steps: [{ id: 'ml-l02-s1', blocks: [{ type: 'mcq', id: 'ml-l02-q1' }, { type: 'reflect', id: 'ml-l02-q1' }] }] } },
    ];
    expect(idProblems(bad)).toEqual(['q1 does not start with ml-l01-', 'ml-l02-q1 is used twice']);
  });

  it('every ML step and block id starts with its lesson id and is unique in the subject', () => {
    expect(idProblems(ml.courses.map((c) => ({ metaId: c.metaId, json: loadJson(c.src) })))).toEqual([]);
  });
});

describe('the ML subject shell', () => {
  it('colours text only through theme tokens: no colour literal, no opacity class', () => {
    const files = [];
    const walk = (dir) => {
      for (const name of fs.readdirSync(dir)) {
        const p = path.join(dir, name);
        if (isRawMaterial(path.relative(path.join(ROOT, 'src/content'), p))) continue;
        if (fs.statSync(p).isDirectory()) walk(p);
        else if (/\.(jsx?|css)$/.test(name)) files.push(p);
      }
    };
    walk(path.join(ROOT, 'src/content/ml'));
    expect(files.length).toBeGreaterThan(1);
    for (const f of files) {
      const src = fs.readFileSync(f, 'utf8');
      expect(src, f).not.toMatch(/#[0-9a-fA-F]{3,8}\b|\b(rgba?|hsla?)\(/);
      expect(src, f).not.toMatch(/\bopacity-\d/);
    }
  });
});

// ---- the content gate -------------------------------------------------------------------------------------------------------

const FIXTURES = path.join(ROOT, 'tests/ml/fixtures');
const readFixture = (name) => JSON.parse(fs.readFileSync(path.join(FIXTURES, name), 'utf8'));
const asLesson = (json) => ({ metaId: json.meta.id, json });
const bad = asLesson(readFixture('lesson-bad.json'));
const good = asLesson(readFixture('lesson-good.json'));
const codes = (problems) => problems.map((p) => p.split(' ')[0]).sort();
const owners = loadTermOwners();
const allocation = loadAllocation();
const widgets = registeredWidgets();
const NO_EXERCISES = { exercise_index: {}, declared_reuse: [] };
const GOOD_EXERCISES = { exercise_index: { '8.1': { lesson: 8, answer_status: 'book' } }, declared_reuse: [] };

// The same table as the bad lesson's mcq, alone in another lesson: the table appears in two lessons.
const tableBlock = bad.json.steps.flatMap((s) => s.blocks).find((b) => b.id === 'ml-l03-m3').table;
const otherLesson = (no, ...tables) => asLesson({ meta: { id: `ml-l${no}` }, steps: [{ id: `ml-l${no}-s1`, blocks: tables.map((table, i) => ({ type: 'table', id: `ml-l${no}-t${i}`, ...table })) }] });

describe('content gate: the bad fixture breaks each rule once and only that rule', () => {
  it('numbers: a formula that disagrees with its expected value, a detector that catches the right answer, a numeric option with no check', () => {
    expect(codes(numberProblems([bad]))).toEqual(['N1', 'N2', 'N3']);
  });
  it('data on screen: a question about a table that is not shown, a pointer at another screen, an explanation about data not shown', () => {
    expect(codes(dataProblems([bad]))).toEqual(['D1', 'D2', 'D3']);
  });
  it('a number cited in an explanation has to be in the block\'s data', () => {
    expect(codes(citedProblems([bad]))).toEqual(['D4']);
  });
  it('repetition: unknown exercise, review on an mcq, a table in two lessons, a stem used twice, a statement used twice', () => {
    expect(codes(repetitionProblems([bad, otherLesson('04', tableBlock)], NO_EXERCISES))).toEqual(['R1', 'R2', 'R3', 'R4', 'R5']);
  });
  it('quiz quality: a wrong option with a tag outside the catalogue, correct answers piled on one letter', () => {
    expect(codes(quizProblems([bad]))).toEqual(['Q1', 'Q2']);
  });
  it('text sweep: quotes, a phase word, English in Romanian, $ in a title, a trailing space, a markdown list', () => {
    expect(codes(textProblems([bad]))).toEqual(['T1', 'T2', 'T3', 'T4', 'T5', 'T6']);
  });
  it('structure: definition count, first screen, last screens', () => {
    expect(codes(structureProblems([bad]))).toEqual(['S1', 'S2', 'S3']);
  });
  it('the course validator fails on the fixture and passes on the good lesson', () => {
    expect(codes(validatorProblems([path.join(FIXTURES, 'lesson-bad.json')]))).toEqual(['S4']);
    expect(validatorProblems([path.join(FIXTURES, 'lesson-good.json')])).toEqual([]);
  });
  it('viz: a widget that is not registered', () => {
    expect(codes(vizProblems([bad], widgets))).toEqual(['V1']);
  });
  it('terms: a term taught in a later lesson', () => {
    expect(codes(termProblems([bad], owners))).toEqual(['L1']);
  });
  it('answers given away: a stem that holds its correct option, a calc statement that holds the answer', () => {
    expect(codes(giveawayProblems([bad]))).toEqual(['L2', 'L3']);
  });
  it('English and Romanian disagree on a number', () => {
    expect(codes(pairProblems([bad]))).toEqual(['P1']);
  });
  it('the answer format: rounding and unit not stated', () => {
    expect(codes(formatProblems([bad]))).toEqual(['F1', 'F2']);
  });
  it('KaTeX: a formula that does not render', () => {
    expect(codes(katexProblems([bad]))).toEqual(['K1']);
  });
  it('a good lesson passes every check', () => {
    const res = runAll([good], { allocation: GOOD_EXERCISES, owners, widgets });
    expect(res).toEqual(Object.fromEntries(Object.keys(res).map((k) => [k, []])));
    expect(validatorProblems([path.join(FIXTURES, 'lesson-good.json')])).toEqual([]);
  });
});

describe('content gate: edge cases of each rule', () => {
  const one = (block, extra = {}) => asLesson({ meta: { id: 'ml-l08' }, steps: [{ id: 'ml-l08-s1', blocks: [{ ...block, id: 'ml-l08-x' }], ...extra }] });
  const calc = (over) => ({ type: 'calc-exercise', statement: { en: 'x', ro: 'x' }, status: 'book', fields: [{ id: 'a', kind: 'num', label: { en: 'a', ro: 'a' }, formula: '1/2', expected: 0.5 }], ...over });

  it('an answer typed as 9/17 or 0,9183 needs one formula: a fraction field accepts the formula that gives the same value', () => {
    const b = calc({ fields: [{ id: 'a', kind: 'frac', label: { en: 'a', ro: 'a' }, formula: '9/17', expected: '18/34' }] });
    expect(numberProblems([one(b)])).toEqual([]);
  });
  it('a variant is re-evaluated with its own numbers', () => {
    const b = calc({ variants: [{ statement: { en: 'x', ro: 'x' }, solution: { en: 's', ro: 's' }, fields: [{ id: 'a', formula: '1/4', expected: 0.3 }] }] });
    expect(codes(numberProblems([one(b)]))).toEqual(['N1']);
  });
  it('a numeric correct option with a check that agrees passes, and one that disagrees fails', () => {
    const mk = (formula) => ({ type: 'mcq', question: { en: 'q', ro: 'q' }, check: { formula }, options: [{ correct: true, text: { en: '0.75', ro: '0,75' } }, { correct: false, text: { en: 'b', ro: 'b' } }] });
    expect(numberProblems([one(mk('3/4'))])).toEqual([]);
    expect(codes(numberProblems([one(mk('2/3'))]))).toEqual(['N3']);
  });
  it('a screen with a viz or a table block shows the data a question names', () => {
    const q = { type: 'reflect', id: 'ml-l08-q', prompt: { en: 'q', ro: 'Ce arată tabelul?' }, answer: { en: 'a', ro: 'a' } };
    const withViz = asLesson({ meta: { id: 'ml-l08' }, steps: [{ id: 'ml-l08-s1', blocks: [q, { type: 'viz', id: 'ml-l08-v' }] }] });
    expect(dataProblems([withViz])).toEqual([]);
    expect(codes(dataProblems([one(q)]))).toEqual(['D1']);
  });
  it('cited numbers: decimals and fractions are traced, whole numbers are not', () => {
    expect(citedNumbers('Are 3 zile, 0,75 și 9/17 și $0{,}5$ la $\\log_2$').map((c) => c.text)).toEqual(['0.75', '9/17', '0.5']);
  });
  it('an exercise atom: in two blocks, in the wrong lesson, or missing from its owner lesson', () => {
    const alloc = { exercise_index: { '8.1': { lesson: 8 }, '8.2': { lesson: 8 }, '8.3': { lesson: 8, optional: true }, '8.4': { lesson: 8, answer_status: 'impl' }, '9.1': { lesson: 9 } }, declared_reuse: [] };
    const mkBlock = (id, ex) => ({ type: 'calc-exercise', id, exercise: ex });
    const ls = asLesson({ meta: { id: 'ml-l08' }, steps: [{ id: 'ml-l08-s1', blocks: [mkBlock('ml-l08-a', ['8.1', '9.1']), mkBlock('ml-l08-b', '8.1')] }] });
    expect(repetitionProblems([ls], alloc).map((p) => p.replace(/^R1 /, ''))).toEqual([
      'exercise 8.1 appears in 2 blocks (ml-l08-s1 ml-l08-a; ml-l08-s1 ml-l08-b)',
      'ml-l08-s1 ml-l08-a: exercise 9.1 belongs to lesson 9, not 8',
      'exercise 8.2 is owned by lesson 8 but no calc-exercise or proof-steps block carries it',
    ]);
  });
  it('a table shared by lessons is allowed when allocation.json declares the reuse', () => {
    const alloc = { exercise_index: {}, declared_reuse: [{ table: 't', owner: 4, also_in: ['L5: x'] }] };
    expect(repetitionProblems([otherLesson('04', tableBlock), otherLesson('05', tableBlock)], alloc)).toEqual([]);
    expect(codes(repetitionProblems([otherLesson('04', tableBlock), otherLesson('06', tableBlock)], alloc))).toEqual(['R3']);
  });
  it('correct answers spread over the letters pass', () => {
    const mk = (i, at) => ({ type: 'mcq', id: `ml-l08-m${i}`, options: [0, 1, 2].map((k) => ({ correct: k === at, text: { en: 'x', ro: 'x' }, explain: { en: 'e', ro: 'e' }, misconception: 'caz-particular' })) });
    const ls = asLesson({ meta: { id: 'ml-l08' }, steps: [{ id: 'ml-l08-s1', blocks: [mk(1, 0), mk(2, 1), mk(3, 2)] }] });
    expect(quizProblems([ls])).toEqual([]);
  });
  it('a term matches by stem, whole words in a row', () => {
    const m = termMatcher('entropie condiționată');
    expect(m('Entropiei condiționate a lui Y')).toBe(true);
    expect(m('entropia și apoi condiționată')).toBe(false);
  });
  it('a forward note that names the owner lesson may use the term', () => {
    const ls = asLesson({ meta: { id: 'ml-l03' }, steps: [{ id: 'ml-l03-s1', title: { en: 't', ro: 't' }, blocks: [{ type: 'learn', content: { en: 'Entropy comes later (Lesson 7).', ro: 'Entropia vine mai târziu (vezi Lecția 7).' } }] }] });
    expect(termProblems([ls], owners)).toEqual([]);
  });
  it('math: a currency sign is not a formula, an unclosed formula is', () => {
    expect(mathParts('Costă $5 și $10').segments).toEqual([]);
    expect(codes(katexProblems([one({ type: 'learn', content: { en: 'a $\\frac{1$', ro: 'a $\\frac{1$' } })]))).toEqual(['K1', 'K1']);
  });
  it('colours: a literal or an opacity class fails in JSX, only ML rules count in the shared stylesheet', () => {
    expect(codes(colourProblems([{ path: 'a.jsx', src: 'style={{ color: "#fff" }}' }, { path: 'b.jsx', src: 'className="opacity-60"' }, { path: 'c.jsx', src: 'var(--lt-acc)' }]))).toEqual(['C1', 'C1']);
    expect(colourProblems([{ path: 'x.css', src: '.qm-scroll { mask: linear-gradient(#000 0, transparent) } .ch-calc { color: var(--theme-text) }' }])).toEqual([]);
    expect(codes(colourProblems([{ path: 'x.css', src: '.ch-calc-key { color: #fff }' }]))).toEqual(['C1']);
  });
});

describe('content gate: term-owners.json', () => {
  it('names every concept of allocation.json, with the lesson that owns it', () => {
    const concepts = Object.fromEntries(allocation.lessons.flatMap((l) => l.concepts.map((c) => [c.id, l.n])));
    const seen = new Set();
    for (const t of owners.terms) {
      expect(concepts[t.concept], `${t.term}: unknown concept ${t.concept}`).toBe(t.owner);
      expect(t.term.trim(), 'a term').toBeTruthy();
      seen.add(t.concept);
    }
    expect([...Object.keys(concepts)].filter((c) => !seen.has(c))).toEqual([]);
  });
});

describe('content gate: the ML lessons that exist', () => {
  const lessons = loadLessons();
  it.each([
    ['numbers', numberProblems], ['data on screen', dataProblems], ['cited numbers', citedProblems], ['quiz quality', quizProblems],
    ['text sweep', textProblems], ['structure', structureProblems], ['answers given away', giveawayProblems], ['en and ro agree', pairProblems],
    ['answer format', formatProblems], ['KaTeX', katexProblems],
  ])('%s', (_name, fn) => {
    expect(fn(lessons)).toEqual([]);
  });
  it('repetition', () => { expect(repetitionProblems(lessons, allocation)).toEqual([]); });
  it('viz', () => { expect(vizProblems(lessons, widgets)).toEqual([]); });
  it('terms', () => { expect(termProblems(lessons, owners)).toEqual([]); });
  it('the course validator passes on every file', () => { expect(validatorProblems(lessons.map((l) => l.file))).toEqual([]); });
  it('no hard-coded colour or opacity class in the ML components and their rules', () => {
    expect(colourProblems(colourFiles())).toEqual([]);
  });
});
