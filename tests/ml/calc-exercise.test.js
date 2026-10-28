import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { Fraction } from '../../src/ml/calc/fraction.js';
import { parseAnswer, grade, formulaMatches, padEval, tolOf } from '../../src/ml/calc/answer.js';
import {
  validateCalc, scopeOf, withVariant, checkTexts, allRight, restoreCalcState, calcAction, hintAction, calcWrite, solutionNote, CHECKED_TWICE,
} from '../../src/components/lesson/blocks/calcSpec.js';
import { seedGate, gatingKind, isGatingScreen } from '../../src/components/lesson/playerLogic.js';

// One real store on a memory storage, shared by the mocked hook and the test, so what a check writes is what a fresh render reads.
const m = new Map();
const mem = { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { m.set(k, String(v)); } };
const { createLessonStore } = await import('../../src/lesson/store.js');
const store = createLessonStore(mem);
vi.mock('../../src/lesson/useLessonStore', () => ({ useLessonStore: () => globalThis.__calcStore, getLessonStore: () => globalThis.__calcStore }));
globalThis.__calcStore = store;
vi.mock('../../src/contexts/AppContext', () => ({ useApp: () => ({ t: (en, ro) => ro }) }));
vi.mock('../../src/components/lesson/viz/useSqlRunner.js', () => ({
  useSqlRunner: () => { throw new Error('a static table must not start the SQL engine'); },
}));

const { default: CalcExerciseBlock } = await import('../../src/components/lesson/blocks/CalcExerciseBlock.jsx');
const { default: ScreenGate } = await import('../../src/components/lesson/ScreenGate.jsx');

const PlayTennis = JSON.parse(readFileSync(new URL('./fixtures/playtennis.json', import.meta.url), 'utf8'));
const h = React.createElement;
const bi = (s) => ({ en: s, ro: s });

const block = {
  type: 'calc-exercise',
  id: 'ml-l07-hc',
  exercise: '2.27a',
  source: bi('Culegerea: p. 415'),
  statement: { en: 'Compute H(EnjoyTennis | Outlook) in bits.', ro: 'Calculează H(EnjoyTennis | Outlook) în biți, cu 4 zecimale.' },
  table: PlayTennis,
  fields: [
    { id: 'hc', label: { en: 'H(Y|X)', ro: 'H(Y|X)' }, kind: 'num', formula: "Hc(T,'Outlook','EnjoyTennis')", expected: 0.6935 },
    { id: 'root', label: bi('Rădăcina'), kind: 'choice', options: [bi('Outlook'), bi('Wind')], formula: "bestAttr(T,'EnjoyTennis')", expected: 'Outlook' },
    { id: 'frac', label: bi('Probabilitatea'), kind: 'frac', formula: '9/14', expected: '9/14', accept: [{ value: '5/9', note: { en: 'if you count only the Yes rows', ro: 'dacă numeri doar rândurile Yes' } }] },
  ],
  detectors: [
    { field: 'hc', formula: "IG(T,'Outlook','EnjoyTennis')", message: { en: 'That is the gain IG, not H(Y|X).', ro: 'Aceea e câștigul IG, nu H(Y|X).' } },
    { field: 'hc', formula: "Hcol(T,'EnjoyTennis')", message: { en: 'That is H(Y), without the weights.', ro: 'Aceea e H(Y), fără ponderi.' } },
  ],
  hints: [bi('Ce calculezi'), bi('Formula cu numerele'), bi('Pasul complet')],
  solution: bi('Soluția completă.'),
  status: 'verified-twice',
  variants: [{
    statement: bi('Aceeași cerință, alt tabel.'),
    table: { ...PlayTennis, rows: PlayTennis.rows.slice(0, 10) },
    fields: [
      { id: 'hc', formula: "Hc(T,'Outlook','EnjoyTennis')", expected: 0.6 },
      { id: 'root', formula: "bestAttr(T,'EnjoyTennis')", expected: 'Outlook' },
      { id: 'frac', formula: '6/10', expected: '3/5' },
    ],
    solution: bi('Soluția variantei.'),
  }],
};

const scope = scopeOf(block);
const field = (id) => block.fields.find((f) => f.id === id);

describe('parsing a typed answer', () => {
  it('reads a decimal comma, a decimal point, a leading point and a negative sign', () => {
    expect(parseAnswer('0,9183', 'num').value).toBeCloseTo(0.9183, 10);
    expect(parseAnswer('0.918', 'num').value).toBeCloseTo(0.918, 10);
    expect(parseAnswer('.5', 'num').value).toBe(0.5);
    expect(parseAnswer(' -1,5 ', 'num').value).toBe(-1.5);
    expect(parseAnswer('−1', 'num').value).toBe(-1);
  });
  it('reads a fraction exactly for a frac field and as a number for a num field', () => {
    expect(parseAnswer('9/17', 'frac').value.equals(new Fraction(9, 17))).toBe(true);
    expect(parseAnswer('18 / 34', 'frac').value.equals(new Fraction(9, 17))).toBe(true);
    expect(parseAnswer('0,5', 'frac').value.equals(new Fraction(1, 2))).toBe(true);
    expect(parseAnswer('9/17', 'num').value).toBeCloseTo(9 / 17, 12);
  });
  it('does not read words, empty text, a zero denominator or two points as a number', () => {
    for (const bad of ['', 'abc', '1/0', '1.2.3', '9/', '0,9183 bits']) expect(parseAnswer(bad, 'num').ok, bad).toBe(false);
    expect(parseAnswer('x', 'frac').ok).toBe(false);
  });
  it('matches a choice by its text whatever the case', () => {
    expect(parseAnswer('outlook', 'choice', [bi('Outlook'), bi('Wind')])).toEqual({ ok: true, value: 'Outlook' });
    expect(parseAnswer(' OUTLOOK ', 'choice', [bi('Outlook'), bi('Wind')]).value).toBe('Outlook');
    expect(parseAnswer('Humidity', 'choice', [bi('Outlook'), bi('Wind')]).ok).toBe(false);
    expect(parseAnswer('oUtLook', 'choice').value).toBe('oUtLook');
  });
  it('reads true/false words and a set of names', () => {
    expect(parseAnswer('Adevărat', 'tf').value).toBe(true);
    expect(parseAnswer('fals', 'tf').value).toBe(false);
    expect(parseAnswer('poate', 'tf').ok).toBe(false);
    expect(parseAnswer('wind; outlook', 'multi', [bi('Outlook'), bi('Wind')]).value).toEqual(['Outlook', 'Wind']);
  });
});

describe('grading', () => {
  it('gives the same verdict to every valid way of typing a value', () => {
    for (const typed of ['0,6935', '0.6935', '0.69354', '0,694', '.6935']) expect(grade(field('hc'), typed, scope, block.detectors).verdict, typed).toBe('right');
    for (const typed of ['9/14', '18/28', '0,642857', '0.6429']) expect(grade(field('frac'), typed, scope).verdict, typed).toBe('right');
    expect(grade(field('root'), 'outlook', scope).verdict).toBe('right');
    expect(grade(field('root'), 'OUTLOOK', scope).verdict).toBe('right');
  });
  it('compares an equivalent fraction exactly: 18/34 is 9/17', () => {
    const f = { id: 'p', kind: 'frac', expected: '9/17' };
    expect(grade(f, '18/34', {}).verdict).toBe('right');
    expect(grade(f, '9/17', {}).verdict).toBe('right');
    expect(grade(f, '8/17', {}).verdict).toBe('wrong');
  });
  it('accepts the alternative of a stated convention, with its note (the 2.4 case: 3/5)', () => {
    const f = { id: 'p', kind: 'frac', expected: '108/3125', accept: [{ value: '3/5', note: bi('în cealaltă convenție') }] };
    const g = grade(f, '3/5', {});
    expect(g.verdict).toBe('accepted-alt');
    expect(g.note).toEqual(bi('în cealaltă convenție'));
  });
  it('says what a wrong value usually is: IG where H(Y|X) was asked', () => {
    const g = grade(field('hc'), '0,2467', scope, block.detectors);
    expect(g.verdict).toBe('wrong');
    expect(g.detector.ro).toMatch(/IG/);
    expect(grade(field('hc'), '0,9403', scope, block.detectors).detector.ro).toMatch(/H\(Y\)/);
    expect(grade(field('hc'), '0,5', scope, block.detectors).detector).toBeUndefined();
  });
  it('names the natural-log mistake when a detector for it is written', () => {
    const f = { id: 'h', kind: 'num', expected: 0.971 };
    const d = [{ field: 'h', formula: '-(2/5*ln(2/5)+3/5*ln(3/5))', message: bi('ai folosit ln în loc de log₂') }];
    expect(grade(f, '0,6730', {}, d).detector).toEqual(bi('ai folosit ln în loc de log₂'));
    expect(grade(f, '0,971', {}, d).verdict).toBe('right');
  });
  it('never lets a detector turn a right answer wrong', () => {
    expect(grade(field('hc'), '0,6935', scope, block.detectors).verdict).toBe('right');
  });
  it('reports text that is not a value as unparsed, not wrong', () => {
    expect(grade(field('hc'), 'cam 0,7', scope, block.detectors).verdict).toBe('unparsed');
  });
  it('uses 0.0005 below 1 and 0.001 from 1 up, or the field tol', () => {
    expect(tolOf({ expected: 0.5 })).toBe(0.0005);
    expect(tolOf({ expected: 1.5 })).toBe(0.001);
    expect(tolOf({ expected: 1.5, tol: 0.01 })).toBe(0.01);
    expect(grade({ id: 'x', kind: 'num', expected: 0.5 }, '0,5004', {}).verdict).toBe('right');
    expect(grade({ id: 'x', kind: 'num', expected: 0.5 }, '0,5006', {}).verdict).toBe('wrong');
    expect(grade({ id: 'x', kind: 'num', expected: 1.5 }, '1,5009', {}).verdict).toBe('right');
  });
});

describe('the formula behind every expected value', () => {
  it('re-evaluates to the value the learner should type', () => {
    for (const f of block.fields) expect(formulaMatches(f, scope), f.id).toMatchObject({ ok: true });
  });
  it('fails when the expected value is wrong, and says so for a formula that does not run', () => {
    expect(formulaMatches({ ...field('hc'), expected: 0.7 }, scope).ok).toBe(false);
    expect(formulaMatches({ ...field('hc'), formula: 'nope(1)' }, scope).ok).toBe(false);
  });
  it('holds for the variant too', () => {
    const v = withVariant(block, block.variants[0]);
    expect(v.variants).toBeUndefined();
    expect(v.statement).toEqual(bi('Aceeași cerință, alt tabel.'));
    expect(v.fields[0].expected).toBe(0.6);
    expect(scopeOf(v).T.rows).toHaveLength(10);
  });
  it('the detector formulas never equal the right answer', () => {
    for (const d of block.detectors) {
      const f = field(d.field);
      expect(formulaMatches({ ...f, formula: d.formula }, scope).ok, d.formula).toBe(false);
    }
  });
});

describe('validateCalc', () => {
  const good = () => JSON.parse(JSON.stringify(block));
  it('accepts a well-formed block', () => {
    expect(validateCalc(good())).toEqual([]);
  });
  it('rejects a missing formula', () => {
    const b = good(); delete b.fields[0].formula;
    expect(validateCalc(b).join('\n')).toMatch(/formula missing/);
  });
  it('rejects an expected that is not a string or a number', () => {
    const b = good(); b.fields[0].expected = [1];
    expect(validateCalc(b).join('\n')).toMatch(/expected must be a string or a number/);
  });
  it('rejects fewer than 3 hints', () => {
    const b = good(); b.hints = b.hints.slice(0, 2);
    expect(validateCalc(b).join('\n')).toMatch(/hints must be 3/);
  });
  it('rejects a block with no variants', () => {
    const b = good(); b.variants = [];
    expect(validateCalc(b).join('\n')).toMatch(/at least 1 variant/);
    delete b.variants;
    expect(validateCalc(b).join('\n')).toMatch(/at least 1 variant/);
  });
  it('rejects an unknown status, and a ruled one without the outline line', () => {
    const b = good(); b.status = 'guessed';
    expect(validateCalc(b).join('\n')).toMatch(/status must be one of/);
    const r = good(); r.status = 'ruled';
    expect(validateCalc(r).join('\n')).toMatch(/ruledNote/);
    r.ruledNote = bi('Convenția cărții.');
    expect(validateCalc(r)).toEqual([]);
  });
  it('rejects a detector for a field that does not exist, a choice whose answer is not an option, a variant missing a field', () => {
    const d = good(); d.detectors[0].field = 'zzz';
    expect(validateCalc(d).join('\n')).toMatch(/not a field/);
    const c = good(); c.fields[1].expected = 'Humidity';
    expect(validateCalc(c).join('\n')).toMatch(/not one of the options/);
    const v = good(); v.variants[0].fields.pop();
    expect(validateCalc(v).join('\n')).toMatch(/no entry for field frac/);
  });
  it('rejects a bad table through the same rule as the other blocks', () => {
    const b = good(); b.table = { columns: ['X', 'Y'], rows: [[1]] };
    expect(validateCalc(b).join('\n')).toMatch(/row 1/);
  });
});

describe('what the solution says about where the answer comes from', () => {
  it('shows the standard line for a verified-twice exercise, the outline line for a ruled one, none for a book answer', () => {
    expect(solutionNote(block)).toEqual(CHECKED_TWICE);
    expect(CHECKED_TWICE.ro).toBe('Culegerea nu dă răspunsul; verificat de două ori.');
    expect(solutionNote({ status: 'ruled', ruledNote: bi('linia din outline') })).toEqual(bi('linia din outline'));
    expect(solutionNote({ status: 'book' })).toBeNull();
  });
});

describe('the log calculator', () => {
  it('evaluates what the keys wrote', () => {
    expect(padEval('log2(8)')).toEqual({ ok: true, text: '3' });
    expect(padEval('9/14*log2(14/9)').text).toBe('0.409776');
    expect(padEval('sqrt(16)+2^2').text).toBe('8');
    expect(padEval('0,5+0,25').text).toBe('0.75');
    expect(padEval('log2(').ok).toBe(false);
    expect(padEval('1/0').ok).toBe(false);
    expect(padEval('').ok).toBe(false);
  });
});

describe('the gate of a calc screen', () => {
  const step = { id: 's', blocks: [{ type: 'calc-exercise', id: 'x' }] };
  it('gates, and has its own kind', () => {
    expect(isGatingScreen(step)).toBe(true);
    expect(gatingKind(step)).toBe('calc');
  });
  it('opens on a right answer or a reveal (done), stays shut after a wrong check or a hint marker', () => {
    expect(seedGate(step, [{ ok: false, done: false }])).toBeUndefined();
    expect(seedGate(step, [{ ok: false, done: false, unscored: true, hints: 3 }])).toBeUndefined();
    expect(seedGate(step, [{ ok: true, done: true }])).toEqual({ completed: true });
    expect(seedGate(step, [{ ok: false, done: true, revealed: true }])).toEqual({ completed: true });
    expect(seedGate(step, [{ skipped: true }])).toEqual({ skipped: true });
  });
});

describe('what an attempt writes', () => {
  it('a wrong first check records a miss that keeps the gate shut; a later right check updates it', () => {
    expect(calcAction({ event: 'check', ok: false })).toMatchObject({ type: 'record', ok: false, done: false });
    expect(calcAction({ event: 'check', ok: true })).toMatchObject({ type: 'record', ok: true, done: true });
    expect(calcAction({ attempted: true, event: 'check', ok: true })).toEqual({ type: 'update', set: { ok: true, done: true } });
    expect(calcAction({ attempted: true, event: 'check', ok: false })).toEqual({ type: 'update', set: {} });
  });
  it('a reveal before any check is a miss; after one it only marks the attempt', () => {
    expect(calcAction({ event: 'reveal' })).toMatchObject({ type: 'record', ok: false, done: true, set: { revealed: true } });
    expect(calcAction({ attempted: true, event: 'reveal' })).toEqual({ type: 'update', set: { revealed: true, done: true } });
  });
  it('the review tab writes nothing and reports the first answer once', () => {
    expect(calcAction({ record: false, event: 'check', ok: true })).toEqual({ type: 'markReview', ok: true });
    expect(calcAction({ record: false, event: 'reveal' })).toEqual({ type: 'markReview', ok: false });
    expect(calcAction({ record: false, marked: true, event: 'check', ok: true }).type).toBe('none');
  });
  it('the third hint is a marker before any check and an enqueue after one; fewer hints are kept only after a check', () => {
    expect(hintAction({ n: 3 })).toMatchObject({ type: 'record', marker: true, ok: false, done: false });
    expect(hintAction({ attempted: true, n: 3 })).toEqual({ type: 'update', enqueue: true });
    expect(hintAction({ n: 2 }).type).toBe('none');
    expect(hintAction({ attempted: true, n: 2 })).toEqual({ type: 'update' });
    expect(hintAction({ record: false, n: 3 }).type).toBe('none');
  });
});

describe('the rendered block', () => {
  const ref = { src: 'ml/courses/lesson-07.json', screen: 4 };
  const render = (props = block, gate = {}) => renderToStaticMarkup(
    h(ScreenGate, { src: ref.src, screen: ref.screen, state: gate, patchGate: () => {}, onSkip: () => {} }, h(CalcExerciseBlock, props)),
  );
  // carries out a check the way the block does: grade, decide, write
  const press = (texts, state) => {
    const verdicts = checkTexts(block, texts, state.verdicts || {});
    const ok = allRight(block, verdicts);
    const attempts = store.attemptsAt(ref.src, ref.screen).filter((a) => a.item === block.id);
    const w = calcWrite(
      calcAction({ attempted: attempts.length > 0, unscored: attempts.at(-1)?.unscored === true, event: 'check', ok }),
      { item: block.id, ref, at: 1000, hints: 0, fields: texts, verdicts },
    );
    if (w.method === 'recordAttempt') store.recordAttempt(block.id, w.data); else store.updateLastAttempt(block.id, w.data);
    return { verdicts, ok };
  };

  it('shows the statement, the data table and empty fields at first, with no verdict', () => {
    const html = render();
    expect(html).toContain('data-testid="calc-exercise"');
    expect(html).toContain('data-testid="question-table"');
    expect(html).toContain('Sunny');
    expect(html).toContain('data-testid="calc-input-hc"');
    expect(html).not.toContain('Nu chiar');
    expect(html).not.toContain('calc-reveal');
  });

  it('a wrong value gives "Nu chiar" plus the detector message, a right one "Corect", and the gate opens; a fresh render restores it', () => {
    const wrong = { hc: '0,2467', root: 'wind', frac: '9/14' };
    let r = press(wrong, {});
    expect(r.ok).toBe(false);
    let state = restoreCalcState(store.attemptsAt(ref.src, ref.screen), block.id);
    expect(state.texts).toEqual(wrong);
    let html = render();
    expect(html).toContain('Nu chiar');
    expect(html).toContain('Aceea e câștigul IG');
    expect(html).toContain('value="0,2467"');
    expect(html).toContain('calc-reveal'); // the solution can be opened after the first check
    expect(seedGate({ id: 's', blocks: [{ type: 'calc-exercise' }] }, store.attemptsAt(ref.src, ref.screen))).toBeUndefined();
    expect(store.pendingReview(0).map((i) => i.itemId)).toContain(block.id); // the miss is in the review pile
    expect(store.pendingReview(0).find((i) => i.itemId === block.id).kind).toBe('calc');

    r = press({ hc: '0,6935', root: 'outlook', frac: '9/14' }, { verdicts: state.verdicts });
    expect(r.ok).toBe(true);
    state = restoreCalcState(store.attemptsAt(ref.src, ref.screen), block.id);
    expect(Object.values(state.verdicts).every((v) => v.verdict === 'right')).toBe(true);
    html = render();
    expect(html).toContain('Corect');
    expect(html).toContain('value="0,6935"');
    expect(html).toContain('aria-pressed="true" disabled=""><span>Outlook</span>');
    expect(html).toContain('Culegerea nu dă răspunsul; verificat de două ori.');
    expect(seedGate({ id: 's', blocks: [{ type: 'calc-exercise' }] }, store.attemptsAt(ref.src, ref.screen))).toEqual({ completed: true });
  });

  it('a block in the review tab renders without a record and shows its variant', () => {
    const html = renderToStaticMarkup(h(CalcExerciseBlock, { ...withVariant(block, block.variants[0]), record: false, onAnswer: () => {} }));
    expect(html).toContain('Aceeași cerință, alt tabel.');
  });
});

describe('the layout rules, asserted on the CSS (no DOM here)', () => {
  const css = readFileSync(new URL('../../src/index.css', import.meta.url), 'utf8');
  const rule = (sel) => {
    const out = [];
    const re = new RegExp(`(^|\\n)${sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 'g');
    let mm;
    while ((mm = re.exec(css))) out.push(mm[2]);
    return out.join(' ');
  };
  it('the data table scrolls inside its own box, the field row does not', () => {
    expect(rule('.sx-table-scroll')).toMatch(/overflow:\s*auto/);
    for (const sel of ['.ch-calc', '.ch-calc-fields', '.ch-calc-field', '.ch-calc-actions']) expect(rule(sel), sel).not.toMatch(/overflow/);
  });
  it('touch targets are at least 44px and no colour literal is used', () => {
    for (const sel of ['.ch-calc-in', '.ch-calc-choice', '.ch-calc-key']) expect(rule(sel), sel).toMatch(/min-height:\s*4[4-9]px/);
    const own = css.slice(css.indexOf('/* ---- Calculation exercise block'));
    expect(own).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/);
  });
});
