// The ML lesson content as a whole: registration, shared ids, and the content gate (numbers, data on screen, repetition, quiz
// quality, text sweep, structure, terms, formats, KaTeX, colours). The checks live in scripts/ml/content-checks.mjs so the
// per-lesson report (scripts/ml/check-repetition.mjs) runs the same code; they are re-exported from here.
import fs from 'node:fs';
import os from 'node:os';
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
// Lessons are published in the teacher's priority order (design §11, D-068: L18–L22 before L17) and built in parallel lanes
// that each hold one lesson, so the registered lessons may have gaps; they are always sorted by lesson number.
const idOfFile = (f) => `ml-l${f.match(/^lesson-(\d\d)\.json$/)[1]}`;

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
  it('registers one course per lesson file, sorted by lesson number (a lesson not published yet leaves a gap)', () => {
    // the ten Ghid rapid lessons (meta.kind "guide") come first, in the order g1a b1a g1b b1b g2 b2 g3 b3 g4 b4
    const guides = ml.courses.filter((c) => !/^ml-l\d\d$/.test(c.id));
    expect(guides.map((c) => c.id)).toEqual(['1a', '1b', '2', '3', '4'].flatMap((p) => [`ml-g${p}`, `ml-b${p}`]));
    expect(ml.courses.slice(0, guides.length)).toEqual(guides);
    expect(ml.courses.slice(guides.length).map((c) => c.id)).toEqual(files.map(idOfFile));
    expect(ml.courses).toHaveLength(files.length + guides.length);
  });
  it('gives each course its file, meta id, section count and unique step ids', () => {
    for (const c of ml.courses) {
      const nn = c.id.slice(-2);
      expect(c.id).toMatch(/^ml-(l\d\d|[gb]\w+)$/);
      expect(c.src).toBe(/^ml-l/.test(c.id) ? `ml/courses/lesson-${nn}.json` : `ml/courses/guide-${c.id.slice(3)}.json`);
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

describe('content gate: guide lessons', () => {
  const guide = { metaId: 'ml-g9', json: { meta: { id: 'ml-g9', kind: 'guide' }, steps: [{ id: 'ml-g9-s1', title: { en: 'A', ro: 'A' }, blocks: [{ type: 'learn', content: { en: 'text', ro: 'text' } }] }] } };
  const plain = { metaId: 'ml-l09', json: { meta: { id: 'ml-l09' }, steps: guide.json.steps } };
  it('a lesson with meta.kind "guide" is exempt from the outline checks (structure, repetition, quiz quality, terms)', () => {
    expect(structureProblems([plain]).length).toBeGreaterThan(0);
    expect(structureProblems([guide])).toEqual([]);
    expect(quizProblems([guide])).toEqual([]);
    expect(repetitionProblems([guide], {})).toEqual([]);
  });
  it('a guide lesson still gets the text, KaTeX and en/ro checks', () => {
    const bad = { metaId: 'ml-g9', json: { meta: { kind: 'guide' }, steps: [{ id: 'ml-g9-s1', title: { en: 'A', ro: 'A' }, blocks: [{ type: 'learn', content: { en: 'a 3', ro: 'a „4” \\frac{' } }, { type: 'equation', tex: '\\frac{' }] }] } };
    expect(textProblems([bad]).length).toBeGreaterThan(0);
    expect(pairProblems([bad]).length).toBeGreaterThan(0);
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
    // an optional exercise is still on its lesson's screens (the outline gives each one its own section); only an
    // implementation exercise has no block (it is one line of text)
    const alloc = { exercise_index: { '8.1': { lesson: 8 }, '8.2': { lesson: 8 }, '8.3': { lesson: 8, optional: true }, '8.4': { lesson: 8, answer_status: 'impl', optional: true }, '9.1': { lesson: 9 }, '10.1': { lesson: 10 } }, declared_reuse: [] };
    const mkBlock = (id, ex) => ({ type: 'calc-exercise', id, exercise: ex });
    const ls = asLesson({ meta: { id: 'ml-l08' }, steps: [{ id: 'ml-l08-s1', blocks: [mkBlock('ml-l08-a', ['8.1', '9.1']), mkBlock('ml-l08-b', '8.1')] }] });
    expect(repetitionProblems([ls], alloc).map((p) => p.replace(/^R1 /, ''))).toEqual([
      'exercise 8.1 appears in 2 blocks (ml-l08-s1 ml-l08-a; ml-l08-s1 ml-l08-b)',
      'ml-l08-s1 ml-l08-a: exercise 9.1 belongs to lesson 9, not 8',
      'exercise 8.2 is owned by lesson 8 but no calc-exercise or proof-steps block carries it',
      'exercise 8.3 is owned by lesson 8 but no calc-exercise or proof-steps block carries it',
    ]);
  });
  it('a fraction field whose formula gives another fraction fails, even inside the tolerance', () => {
    // 82/155 = 0.52903 is within 0.0005 of 9/17 = 0.52941, but a learner who types 82/155 is graded against 9/17 exactly
    const b = calc({ fields: [{ id: 'a', kind: 'frac', label: { en: 'a', ro: 'a' }, formula: '82/155', expected: '9/17' }] });
    expect(codes(numberProblems([one(b)]))).toEqual(['N1']);
  });
  it('a correct option written as a KaTeX fraction is a number and needs its check', () => {
    const mk = (text, check) => ({ type: 'mcq', question: { en: 'q', ro: 'q' }, ...(check ? { check } : {}), options: [{ correct: true, text: { en: text, ro: text } }, { correct: false, text: { en: 'b', ro: 'b' } }] });
    expect(codes(numberProblems([one(mk('$\\frac{3}{4}$'))]))).toEqual(['N3']);
    expect(numberProblems([one(mk('$\\dfrac{3}{4}$', { formula: '3/4' }))])).toEqual([]);
    expect(codes(numberProblems([one(mk('$\\tfrac{3}{4}$', { formula: '2/3' }))]))).toEqual(['N3']);
  });
  it('a variant states the rounding and the unit too (review shows it with its own statement)', () => {
    const b = calc({
      statement: { en: 'In bits, to 4 decimals.', ro: 'În biți, cu 4 zecimale.' },
      fields: [{ id: 'a', kind: 'num', label: { en: 'a', ro: 'a' }, formula: 'H(1/2, 1/2)', expected: 1 }],
      variants: [{ statement: { en: 'p = 1/4.', ro: 'p = 1/4.' }, solution: { en: 's', ro: 's' }, fields: [{ id: 'a', formula: 'H(1/4, 3/4)', expected: 0.8113 }] }],
    });
    expect(formatProblems([one(b)]).map((p) => p.slice(0, 2))).toEqual(['F1', 'F2']);
    expect(formatProblems([one(b)]).every((p) => p.includes('variant 0'))).toBe(true);
  });
  const proof = (picks, question = { en: 'Next?', ro: 'Ce urmează?' }) => ({
    type: 'proof-steps', claim: { en: 'c', ro: 'c' }, end: { en: 'e', ro: 'e' },
    steps: picks.map((k) => ({ shown: { en: 's', ro: 's' }, predict: { question, options: [0, 1].map((i) => ({ correct: i === k, text: { en: `form ${i}`, ro: `forma ${i}` }, explain: { en: 'x', ro: 'x' }, misconception: 'caz-particular' })) } })),
  });
  it('a proof prediction that holds its correct option in its question gives the answer away', () => {
    expect(codes(giveawayProblems([one(proof([1], { en: 'Is it form 1?', ro: 'Este forma 1?' }))]))).toEqual(['L2']);
    expect(giveawayProblems([one(proof([1]))])).toEqual([]);
  });
  it('proof predictions: no position holds more than two thirds of a lesson\'s predictions', () => {
    expect(codes(quizProblems([one(proof([1, 1, 1, 1, 1]))]))).toEqual(['Q2']);
    expect(quizProblems([one(proof([1, 0, 1, 0, 1]))])).toEqual([]);
    expect(quizProblems([one(proof([1, 1]))])).toEqual([]); // two are too few to spread
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
  const learn = (no, ro) => asLesson({ meta: { id: `ml-l${no}` }, steps: [{ id: `ml-l${no}-s1`, title: { en: 't', ro: 't' }, blocks: [{ type: 'learn', content: { en: 'x', ro } }] }] });
  it('variance (Lesson 4) is not "variant": a strict term keeps ș and ț apart from s and t', () => {
    expect(termProblems([learn('01', 'Varianta condiționată a regulii de înmulțire.')], owners)).toEqual([]);
    expect(termProblems([learn('01', 'Alte variante: varianta 2.')], owners)).toEqual([]);
    expect(codes(termProblems([learn('01', 'Varianța lui X.')], owners))).toEqual(['L1']);
    expect(codes(termProblems([learn('01', 'Calculăm varianțele.')], owners))).toEqual(['L1']);
  });
  it('an everyday word is no lesson\'s term: xor in the tree lessons, the Gibbs classifier before Lesson 24', () => {
    expect(termProblems([learn('12', 'Pe xor, fiecare atribut are IG 0 la rădăcină.')], owners)).toEqual([]);
    expect(termProblems([learn('19', 'Pe slide-uri mai există clasificatorul Gibbs.')], owners)).toEqual([]);
    expect(codes(termProblems([learn('19', 'Inegalitatea lui Gibbs spune că...')], owners))).toEqual(['L1']);
  });
  it('a forward note that names the owner lesson may use the term', () => {
    const ls = asLesson({ meta: { id: 'ml-l03' }, steps: [{ id: 'ml-l03-s1', title: { en: 't', ro: 't' }, blocks: [{ type: 'learn', content: { en: 'Entropy comes later (Lesson 7).', ro: 'Entropia vine mai târziu (vezi Lecția 7).' } }] }] });
    expect(termProblems([ls], owners)).toEqual([]);
  });
  it('text sweep: a backslash and an n typed as text is not a line break; \\ne and \\neq in a formula are', () => {
    expect(codes(textProblems([one({ type: 'learn', content: { en: 'One.\\nTwo.', ro: 'Unu.\\nDoi.' } })]))).toEqual(['T6']);
    expect(textProblems([one({ type: 'learn', content: { en: 'One.\n\nTwo, $i \\ne j$, $a \\neq b$.', ro: 'Unu.\n\nDoi, $i \\ne j$, $a \\neq b$.' } })])).toEqual([]);
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
  it('colours: an ML token is a color-mix of the theme tokens wherever it is defined', () => {
    expect(codes(colourProblems([{ path: 'x.css', src: ':root { --ml-hl: #ffcc00; --lt-acc: #123456 }' }]))).toEqual(['C1']);
    expect(codes(colourProblems([{ path: 'x.css', src: '.dark { --ml-hl: rgb(1, 2, 3) }' }]))).toEqual(['C1']);
    expect(colourProblems([{ path: 'x.css', src: ':root { --ml-hl: color-mix(in srgb, var(--lt-acc) 30%, var(--theme-card-bg)); --lt-acc: #123456 }' }])).toEqual([]);
  });
  it('colours: every ml folder under the lesson components is covered', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ml-colour-'));
    try {
      for (const p of ['src/components/lesson/blocks/ml/A.jsx', 'src/components/lesson/viz/widgets/ml/sub/B.css', 'src/components/lesson/viz/logic/ml/c.js', 'src/components/lesson/viz/widgets/D.jsx']) {
        fs.mkdirSync(path.dirname(path.join(root, p)), { recursive: true });
        fs.writeFileSync(path.join(root, p), 'x');
      }
      const got = colourFiles(root).map((f) => f.path).sort();
      expect(got).toEqual(['src/components/lesson/blocks/ml/A.jsx', 'src/components/lesson/viz/logic/ml/c.js', 'src/components/lesson/viz/widgets/ml/sub/B.css']);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
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
