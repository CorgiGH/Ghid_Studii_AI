// Shape and rules of the `calc-exercise` block, shared by the validator script, the block and the tests (no React).
//
// Block JSON:
//   { type: 'calc-exercise', id, exercise?: string | string[], source?: {en,ro}, statement: {en,ro}, table?, data?: {name: value},
//     fields: [{ id, label, kind: 'num'|'frac'|'choice'|'tf'|'multi', formula, expected, tol?, options?, accept?: [{ value, note }] }],
//     detectors?: [{ field, formula, message }], hints: [h1, h2, h3], solution: {en,ro}, status: 'book'|'verified-twice'|'ruled',
//     ruledNote?: {en,ro} (the outline's line for a `ruled` exercise),
//     variants: [{ statement, table?, data?, hints?: [h1, h2, h3], fields: [{ id, formula, expected, tol?, accept? }], solution }] }
// `formula` is what the content test re-evaluates; `expected` is what the learner should type (the test checks they agree).
// A variant brings its own hints and accepted alternatives or none: the block's ones carry the block's numbers.

import { tableError, isStaticTable } from './choiceSpec.js';
import { KINDS, grade, isRight, matchOption, norm } from '../../../ml/calc/answer.js';

export const HINT_COUNT = 3;
export const STATUSES = ['book', 'verified-twice', 'ruled'];

const isStr = (v) => typeof v === 'string' && v.trim().length > 0;
const isBi = (v) => !!v && typeof v === 'object' && isStr(v.en) && isStr(v.ro);
const isObj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
const isValue = (v) => isStr(v) || (typeof v === 'number' && Number.isFinite(v));
const acceptOk = (list) => Array.isArray(list) && list.every((a) => a && isValue(a.value) && isBi(a.note));
const hintsOk = (list) => Array.isArray(list) && list.length === HINT_COUNT && list.every(isBi);

export const CHECKED_TWICE = {
  en: 'The workbook gives no answer; checked twice.',
  ro: 'Culegerea nu dă răspunsul; verificat de două ori.',
};

// The line under the solution that says where the answer comes from: none for a book answer, the standard line for one we
// checked twice, the outline's own line for a ruled one.
export function solutionNote(block) {
  if (block?.status === 'verified-twice') return CHECKED_TWICE;
  if (block?.status === 'ruled') return block.ruledNote || null;
  return null;
}

// Returns a list of problems; empty means the block is well-formed.
export function validateCalc(b) {
  const errs = [];
  const at = (m) => errs.push(`(calc-exercise${b?.id ? ` ${b.id}` : ''}): ${m}`);
  if (!isStr(b?.id)) at('id missing');
  if (b?.exercise !== undefined && !(isStr(b.exercise) || (Array.isArray(b.exercise) && b.exercise.length && b.exercise.every(isStr)))) at('exercise must be a string or a list of strings');
  if (b?.source !== undefined && !isBi(b.source)) at('source must have en + ro');
  if (!isBi(b?.statement)) at('statement must have en + ro');
  const te = tableError(b?.table);
  if (te) at(te);
  if (b?.data !== undefined && !(isObj(b.data) && Object.values(b.data).every((v) => typeof v === 'number' || isStr(v)))) at('data must map names to numbers or strings');

  const fields = b?.fields;
  const ids = new Set();
  if (!Array.isArray(fields) || !fields.length) at('needs at least one field');
  else {
    fields.forEach((f, i) => {
      const fa = (m) => at(`fields[${i}]${isStr(f?.id) ? ` (${f.id})` : ''}: ${m}`);
      if (!isStr(f?.id)) fa('id missing');
      else if (ids.has(f.id)) fa('duplicate field id');
      else ids.add(f.id);
      if (!isBi(f?.label)) fa('label must have en + ro');
      if (!KINDS.includes(f?.kind)) fa(`kind must be one of ${KINDS.join(', ')}`);
      if (!isStr(f?.formula)) fa('formula missing');
      if (!isValue(f?.expected)) fa('expected must be a string or a number');
      if (f?.tol !== undefined && !(typeof f.tol === 'number' && f.tol > 0)) fa('tol must be a positive number');
      const hasOptions = f?.options !== undefined;
      if (hasOptions && !(Array.isArray(f.options) && f.options.length >= 2 && f.options.every(isBi))) fa('options must be a list of at least 2 { en, ro }');
      if (f?.kind === 'multi' && !hasOptions) fa('a multi field needs options');
      if (hasOptions && f.kind !== 'choice' && f.kind !== 'multi') fa('options belong to a choice or multi field');
      if (f?.kind === 'choice' && hasOptions && Array.isArray(f.options) && isValue(f.expected) && !matchOption(String(f.expected), f.options)) fa(`expected "${f.expected}" is not one of the options`);
      if (f?.kind === 'tf' && isValue(f.expected) && !['true', 'false'].includes(String(f.expected))) fa('a tf field expects "true" or "false"');
      if (f?.accept !== undefined && !acceptOk(f.accept)) fa('accept must list { value, note: {en, ro} }');
    });
  }

  if (b?.detectors !== undefined) {
    if (!Array.isArray(b.detectors)) at('detectors must be a list');
    else b.detectors.forEach((d, i) => {
      if (!ids.has(d?.field)) at(`detectors[${i}].field "${d?.field}" is not a field of this block`);
      if (!isStr(d?.formula)) at(`detectors[${i}].formula missing`);
      if (!isBi(d?.message)) at(`detectors[${i}].message must have en + ro`);
    });
  }

  if (!hintsOk(b?.hints)) at(`hints must be ${HINT_COUNT} { en, ro } entries: what to compute, the formula with the numbers in, the full step`);
  if (!isBi(b?.solution)) at('solution must have en + ro');
  if (!STATUSES.includes(b?.status)) at(`status must be one of ${STATUSES.join(', ')}`);
  if (b?.status === 'ruled' && !isBi(b.ruledNote)) at('a ruled exercise needs ruledNote { en, ro } (the outline\'s line for it)');
  if (b?.ruledNote !== undefined && !isBi(b.ruledNote)) at('ruledNote must have en + ro');

  if (!Array.isArray(b?.variants) || !b.variants.length) at('needs at least 1 variant (review brings the exercise back with new numbers)');
  else {
    b.variants.forEach((v, i) => {
      const va = (m) => at(`variants[${i}]: ${m}`);
      if (!isBi(v?.statement)) va('statement must have en + ro');
      const ve = tableError(v?.table);
      if (ve) va(ve);
      if (v?.data !== undefined && !(isObj(v.data) && Object.values(v.data).every((x) => typeof x === 'number' || isStr(x)))) va('data must map names to numbers or strings');
      if (!isBi(v?.solution)) va('solution must have en + ro');
      if (v?.hints !== undefined && !hintsOk(v.hints)) va(`hints must be ${HINT_COUNT} { en, ro } entries, written for the variant's numbers`);
      if (!Array.isArray(v?.fields)) { va('fields missing'); return; }
      const seen = new Set(v.fields.map((f) => f?.id));
      for (const id of ids) if (!seen.has(id)) va(`no entry for field ${id}`);
      v.fields.forEach((f) => {
        if (!ids.has(f?.id)) va(`field "${f?.id}" is not a field of this block`);
        else {
          if (!isStr(f.formula)) va(`field ${f.id}: formula missing`);
          if (!isValue(f.expected)) va(`field ${f.id}: expected must be a string or a number`);
          if (f.tol !== undefined && !(typeof f.tol === 'number' && f.tol > 0)) va(`field ${f.id}: tol must be a positive number`);
          if (f.accept !== undefined && !acceptOk(f.accept)) va(`field ${f.id}: accept must list { value, note: {en, ro} }`);
        }
      });
    });
  }
  return errs;
}

// ---- data a formula can name --------------------------------------------------------------------------------------------

// The names a block's formulas can use: T (a single table) or T1, T2… (a list), and every key of `data`.
export function scopeOf(block) {
  const scope = { ...(block?.data || {}) };
  const t = block?.table;
  const list = t === undefined ? [] : (Array.isArray(t) ? t : [t]);
  list.forEach((tb, i) => {
    if (!isStaticTable(tb)) return;
    scope[`T${i + 1}`] = tb;
    if (list.length === 1) scope.T = tb;
  });
  return scope;
}

// The block with one of its variants swapped in: its statement, tables, data, solution and the formula + expected of each field.
// Hints and accepted alternatives come from the variant or not at all: the block's own hold the block's numbers. The result has
// no `variants`, so it renders and grades as an ordinary block.
export function withVariant(block, variant) {
  if (!variant) return block;
  const byId = Object.fromEntries((variant.fields || []).map((f) => [f.id, f]));
  const { variants, ...rest } = block;
  void variants;
  return {
    ...rest,
    statement: variant.statement,
    solution: variant.solution,
    table: variant.table ?? block.table,
    data: variant.data ?? block.data,
    hints: variant.hints ?? [],
    fields: block.fields.map((f) => {
      const v = byId[f.id];
      return v ? { ...f, formula: v.formula, expected: v.expected, tol: v.tol ?? f.tol, accept: v.accept } : f;
    }),
  };
}

// ---- what the learner sees ------------------------------------------------------------------------------------------------

const VERDICT_VIEW = {
  right: { en: 'Correct', ro: 'Corect' },
  'accepted-alt': { en: 'Correct under the other convention', ro: 'Corect, cu cealaltă convenție' },
  wrong: { en: 'Not quite', ro: 'Nu chiar' },
  unparsed: { en: 'Not a value I can read', ro: 'Nu pot citi valoarea' },
};
export const verdictView = (v) => VERDICT_VIEW[v?.verdict] || null;

const UNPARSED_HELP = {
  num: { en: 'Type a number, for example 0,92 or 9/17.', ro: 'Scrie un număr, de exemplu 0,92 sau 9/17.' },
  frac: { en: 'Type a fraction such as 9/17, or a decimal.', ro: 'Scrie o fracție ca 9/17, sau o zecimală.' },
  choice: { en: 'Pick one of the options.', ro: 'Alege una dintre variante.' },
  tf: { en: 'Answer true or false.', ro: 'Răspunde adevărat sau fals.' },
  multi: { en: 'Pick the options that apply.', ro: 'Alege variantele care se potrivesc.' },
};
export const unparsedHelp = (kind) => UNPARSED_HELP[kind] || UNPARSED_HELP.num;

// ---- checking and the stored attempt ---------------------------------------------------------------------------------

// Grades every field that has text and is not right already. Returns the new verdicts: { fieldId: { verdict, detector?, note? } }.
export function checkTexts(block, texts, prev = {}) {
  const scope = scopeOf(block);
  const out = { ...prev };
  for (const f of block.fields) {
    if (isRight(prev[f.id])) continue;
    const text = texts?.[f.id];
    if (typeof text !== 'string' || !norm(text)) { delete out[f.id]; continue; }
    out[f.id] = grade(f, text, scope, block.detectors || []);
  }
  return out;
}

// True when every field of the block has a right (or accepted) verdict.
export const allRight = (block, verdicts) => block.fields.every((f) => isRight(verdicts?.[f.id]));

// What the learner typed, the verdicts and hints, restored from the attempts stored for the screen (null when there is none).
export function restoreCalcState(attempts, id) {
  const list = (Array.isArray(attempts) ? attempts : []).filter((a) => a && a.item === id && a.kind === 'calc');
  if (!list.length) return null;
  const last = list[list.length - 1];
  const texts = {};
  if (last.fields && typeof last.fields === 'object') for (const [k, v] of Object.entries(last.fields)) if (typeof v === 'string') texts[k] = v;
  const verdicts = last.verdicts && typeof last.verdicts === 'object' ? last.verdicts : {};
  return {
    texts,
    verdicts,
    hints: Number.isInteger(last.hints) ? Math.min(HINT_COUNT, Math.max(0, last.hints)) : 0,
    revealed: last.revealed === true,
    ok: last.ok === true,
    unscored: last.unscored === true,
  };
}

// One decision for every path that ends an attempt, as in the SQL block.
//   event 'check'   the learner pressed Verifică (`ok` = every field right)
//   event 'reveal'  the learner opened the solution
// record = this block may write attempts (false in the review tab, which schedules through markReview); attempted = an attempt of
// this block is stored; unscored = that attempt is only a third-hint marker; marked = the review answer was already given.
// Returns { type: 'none' | 'record' | 'update' | 'markReview', ok?, done?, set? }.
const NONE = { type: 'none' };
export function calcAction({ record = true, attempted = false, unscored = false, marked = false, event = 'check', ok = false } = {}) {
  if (!record) {
    if (marked) return NONE;
    return { type: 'markReview', ok: event === 'check' && ok === true };
  }
  if (event === 'check') {
    if (!attempted || unscored) return { type: 'record', ok, done: ok };
    return { type: 'update', set: ok ? { ok: true, done: true } : {} };
  }
  if (event === 'reveal') {
    if (!attempted || unscored) return { type: 'record', ok: false, done: true, set: { revealed: true } };
    return { type: 'update', set: { revealed: true, done: true } };
  }
  return NONE;
}

// The third hint: before any attempt it is a marker that keeps the gate shut and puts the item in the review pile; after one it
// updates the attempt and enqueues the item. Fewer hints are stored only when an attempt exists.
export function hintAction({ record = true, attempted = false, n = 0 } = {}) {
  if (!record) return NONE;
  if (n < HINT_COUNT) return attempted ? { type: 'update' } : NONE;
  return attempted ? { type: 'update', enqueue: true } : { type: 'record', ok: false, done: false, marker: true };
}

// What the store gets: { method: 'recordAttempt' | 'updateLastAttempt', data } or null.
export function calcWrite(action, { item, ref, at, hints = 0, fields = {}, verdicts = {} } = {}) {
  if (action?.type === 'record') {
    return {
      method: 'recordAttempt',
      data: {
        ok: action.ok === true, hints, kind: 'calc', item, ref, at, done: action.done === true, revealed: false,
        ...(action.marker ? { unscored: true } : { fields, verdicts }), ...(action.set ?? {}),
      },
    };
  }
  if (action?.type === 'update') return { method: 'updateLastAttempt', data: { hints, fields, verdicts, ...(action.set ?? {}) } };
  return null;
}
