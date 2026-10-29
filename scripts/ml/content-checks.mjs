// The ML content gate: the BD lessons-learned (docs/superpowers/specs/2026-10-28-bd-mistakes-to-prevent.md) as pure checks on
// the lesson JSON. tests/content/ml-content.test.js runs them on the real lessons, scripts/ml/check-repetition.mjs prints them
// per lesson. Each check takes `lessons` = [{ metaId, json }] and returns a list of problem strings; empty means clean.
// Every problem starts with a code (N1, D2 ...) and then names the step and block, so a test can tell which rule fired.
//
//   N1 formula differs from expected   N2 detector catches the right answer   N3 numeric mcq option not backed by check
//   D1 question asks about data it does not show   D2 points at another screen   D3 answer text names data not shown
//   D4 explanation cites a number that is not in the block's data
//   R1 exercise atom misplaced, repeated or unknown   R2 mcq carries review   R3 table repeated   R4 quiz stem repeated
//   R5 two blocks share a statement
//   Q1 wrong option without tag or explanation   Q2 correct answers piled on one letter
//   T1 Romanian quotes   T2 phase word   T3 English word in Romanian   T4 $ in step title   T5 trailing space   T6 markdown layout
//   S1 definition count   S2 first screen   S3 last screens   S4 validator
//   V1 viz widget   L1 term before its lesson   L2 stem holds its answer   L3 calc text holds an expected value
//   P1 en and ro disagree   F1 rounding not stated   F2 unit not stated   K1 KaTeX   C1 colour literal

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import katex from 'katex';
import { evaluate, toNumber, Fraction } from '../../src/ml/calc/formula.js';
import { formulaMatches, norm, parseAnswer, tolOf } from '../../src/ml/calc/answer.js';
import { scopeOf, withVariant } from '../../src/components/lesson/blocks/calcSpec.js';
import { isStaticTable } from '../../src/components/lesson/blocks/choiceSpec.js';
import { TRAP_TAGS } from '../../src/components/lesson/blocks/trapTags.js';
import { validateViz } from '../../src/components/lesson/viz/vizSpec.js';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

// ---- walking the JSON -------------------------------------------------------------------------------------------------------

const isStr = (v) => typeof v === 'string';
const isPair = (v) => !!v && typeof v === 'object' && !Array.isArray(v) && isStr(v.en) && isStr(v.ro);
const isObj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);

// Every { en, ro } in a node, with its JSON path.
export function* pairsIn(node, at = '') {
  if (Array.isArray(node)) { for (const [i, v] of node.entries()) yield* pairsIn(v, `${at}[${i}]`); return; }
  if (!isObj(node)) return;
  if (isPair(node)) { yield { at, en: node.en, ro: node.ro }; return; }
  for (const [k, v] of Object.entries(node)) yield* pairsIn(v, at ? `${at}.${k}` : k);
}

// The { en, ro } found under any of the given keys (a key's whole subtree counts: `options[].explain`, `hints[]`).
export function pairsUnder(node, keys, inside = false, at = '') {
  const out = [];
  if (Array.isArray(node)) { node.forEach((v, i) => out.push(...pairsUnder(v, keys, inside, `${at}[${i}]`))); return out; }
  if (!isObj(node)) return out;
  if (isPair(node)) return inside ? [{ at, en: node.en, ro: node.ro }] : out;
  for (const [k, v] of Object.entries(node)) out.push(...pairsUnder(v, keys, inside || keys.has(k), at ? `${at}.${k}` : k));
  return out;
}

// Plain strings of static tables (cells, and columns that are plain strings).
function* tableCells(node, at = '') {
  if (Array.isArray(node)) { for (const [i, v] of node.entries()) yield* tableCells(v, `${at}[${i}]`); return; }
  if (!isObj(node)) return;
  if (Array.isArray(node.columns) && Array.isArray(node.rows)) {
    for (const [i, c] of node.columns.entries()) if (isStr(c)) yield { at: `${at}.columns[${i}]`, text: c };
    for (const [r, row] of node.rows.entries()) for (const [c, cell] of row.entries()) yield { at: `${at}.rows[${r}][${c}]`, text: String(cell), value: cell };
  }
  for (const [k, v] of Object.entries(node)) if (k !== 'columns' && k !== 'rows') yield* tableCells(v, at ? `${at}.${k}` : k);
}

const tablesOf = (block) => (block?.table === undefined ? [] : (Array.isArray(block.table) ? block.table : [block.table]));

export function* blocksOf(lessons) {
  for (const lesson of lessons) {
    for (const step of lesson.json.steps || []) {
      for (const block of step.blocks || []) yield { lesson, step, block, where: `${step.id} ${block.id ?? block.type}` };
    }
  }
}

const lessonNo = (metaId) => Number(String(metaId).match(/(\d+)$/)?.[1] ?? NaN);

// Romanian text with the cedilla forms folded into the comma forms, so one regex reads both.
const fold = (s) => String(s ?? '').replace(/ş/g, 'ș').replace(/Ş/g, 'Ș').replace(/ţ/g, 'ț').replace(/Ţ/g, 'Ț');

// ---- inline text: math, code, numbers ---------------------------------------------------------------------------------------
// Mirrors src/components/blocks/formatMarkdown.js: code spans first, runs of 3+ dollars are text, $$…$$ display, then the tight
// inline $…$ (no currency like $5, \$ is an escape).

export function mathParts(text) {
  const display = [];
  const inline = [];
  let rest = String(text ?? '').replace(/`(.+?)`/g, ' ').replace(/\${3,}/g, ' ');
  rest = rest.replace(/\$\$([\s\S]+?)\$\$/g, (_, t) => { display.push(t); return ' '; });
  rest = rest.replace(/(^|[^\\\w])\$([^$\n]+?)\$(?!\d)/g, (_, pre, t) => { inline.push(t); return `${pre} `; });
  return { display, inline, segments: [...display, ...inline], rest };
}

const canonNumber = (s) => s.replace(',', '.');
const NUMBER = /\d+(?:[.,]\d+)?/g;
const canonMath = (s) => s.replace(/\s+/g, '').replace(/\{,\}/g, '.').replace(/(\d),(\d)/g, '$1.$2');

// The numbers written in the plain text (outside `code` and math), in the dot form.
export function plainNumbers(text) {
  return (mathParts(text).rest.match(NUMBER) || []).map(canonNumber);
}

// Numbers worth tracing back to the data: decimals and fractions written anywhere, math included. Whole numbers are ordinary
// words ("2 variante", "Lecția 9") and are not traced.
export function citedNumbers(text) {
  let s = String(text ?? '').replace(/`(.+?)`/g, ' ');
  s = s.replace(/\\[A-Za-z]+/g, ' ').replace(/[_^]\{[^}]*\}|[_^]\d/g, ' ').replace(/\{,\}/g, ',');
  const out = [];
  for (const m of s.matchAll(/(\d+(?:[.,]\d+)?)\s*\/\s*(\d+(?:[.,]\d+)?)|\d+[.,]\d+/g)) {
    out.push(m[2] !== undefined ? { text: `${m[1]}/${m[2]}`.replace(/,/g, '.'), value: Number(canonNumber(m[1])) / Number(canonNumber(m[2])), ratio: true }
      : { text: canonNumber(m[0]), value: Number(canonNumber(m[0])), decimals: canonNumber(m[0]).split('.')[1].length });
  }
  return out;
}

// ---- 1. numbers -------------------------------------------------------------------------------------------------------------

const numberOf = (v) => {
  if (v instanceof Fraction) return v.toNumber();
  if (typeof v === 'number') return v;
  return NaN;
};
const valueNumber = (text) => {
  const p = parseAnswer(String(text), 'num');
  return p.ok ? numberOf(p.value) : NaN;
};

// For a fraction field whose formula gives an exact Fraction and whose expected is written as a fraction: the formula's value
// when the two differ (as text), else null.
function exactFraction(f, scope) {
  let v;
  try { v = evaluate(f.formula, scope); } catch { return null; }
  if (!(v instanceof Fraction) || typeof f.expected !== 'string') return null;
  const p = parseAnswer(f.expected, 'frac');
  if (!p.ok || !p.ratio) return null;
  return p.value.equals(v) ? null : v.toString();
}

// An option's text read as a plain number: KaTeX fractions (\frac, \dfrac, \tfrac) become a/b, {,} a decimal comma, thin
// spaces go. "$\frac{3}{4}$" -> "3/4".
export function optionNumberText(text) {
  return String(text ?? '').trim()
    .replace(/\\[dt]?frac\s*\{\s*(-?[\d.,]+)\s*\}\s*\{\s*([\d.,]+)\s*\}/g, '$1/$2')
    .replace(/\{,\}/g, ',').replace(/\\[,;:! ]/g, '').trim();
}

// The block and each variant as a plain block (its own statement, data, tables and formulas), for re-evaluating.
function flavours(block) {
  return [{ label: '', b: block }, ...(block.variants || []).map((v, i) => ({ label: ` variant ${i}`, b: withVariant(block, v) }))];
}

export function numberProblems(lessons) {
  const out = [];
  for (const { block, where } of blocksOf(lessons)) {
    if (block.type === 'calc-exercise') {
      for (const { label, b } of flavours(block)) {
        const scope = scopeOf(b);
        for (const f of b.fields || []) {
          const r = formulaMatches(f, scope);
          if (!r.ok) out.push(`N1 ${where}${label} field ${f.id}: formula ${JSON.stringify(f.formula)} gives ${r.error ?? r.value}, expected ${JSON.stringify(f.expected)}`);
          else if (f.kind === 'frac') {
            // the page grades a typed fraction against expected exactly (D-667), so a fraction near it is not good enough
            const exact = exactFraction(f, scope);
            if (exact) out.push(`N1 ${where}${label} field ${f.id}: formula ${JSON.stringify(f.formula)} gives ${exact}, expected ${JSON.stringify(f.expected)} (a fraction field needs the same fraction)`);
          }
        }
        for (const d of b.detectors || []) {
          const f = (b.fields || []).find((x) => x.id === d.field);
          if (!f) continue;
          let v;
          try { v = evaluate(d.formula, scope); } catch (e) { out.push(`N2 ${where}${label} detector on ${d.field}: formula fails (${e.message})`); continue; }
          if (f.kind === 'num' || f.kind === 'frac') {
            let target;
            try { target = toNumber(v); } catch (e) { out.push(`N2 ${where}${label} detector on ${d.field}: not a number (${e.message})`); continue; }
            const want = valueNumber(f.expected);
            if (Math.abs(target - want) <= Math.max(tolOf(f), tolOf({ expected: target }))) out.push(`N2 ${where}${label} detector on ${d.field}: its value ${target} is within tolerance of the right answer ${f.expected}`);
          } else if (norm(Array.isArray(v) ? v.join(', ') : String(v)) === norm(f.expected)) {
            out.push(`N2 ${where}${label} detector on ${d.field}: its value equals the right answer`);
          }
        }
      }
    }
    if (block.type === 'mcq') {
      const right = (block.options || []).find((o) => o.correct === true);
      const t = optionNumberText(right?.text?.ro);
      if (!/^\$?-?[\d.,/ ]+\$?$/.test(t)) continue;
      const want = valueNumber(t.replace(/\$/g, ''));
      if (!block.check) { out.push(`N3 ${where}: the correct option "${t}" is a number but the block has no check { formula, data? }`); continue; }
      let got;
      try { got = toNumber(evaluate(block.check.formula, block.check.data || {})); } catch (e) { out.push(`N3 ${where}: check formula fails (${e.message})`); continue; }
      const tol = Math.max(block.check.tol ?? 0, tolOf({ expected: want }));
      if (!(Math.abs(got - want) <= tol)) out.push(`N3 ${where}: check formula gives ${got}, the correct option says ${t}`);
    }
  }
  return out;
}

// ---- 2 and 8. data on screen ------------------------------------------------------------------------------------------------

const DATA_REF = /\btabel(ul)?\b|\bdatele\b|\bsetul de date\b|\barborele\b|\bdistribuți(a|ei) (din|de mai)/i;
const POINTER = /de mai sus|ecranul anterior|același tabel|aceleași date/i;
const ASK_KEYS = new Set(['question', 'prompt', 'statement', 'claim', 'given', 'text', 'label', 'shown']);
const ANSWER_KEYS = new Set(['explain', 'hints', 'solution', 'answer', 'caption', 'why', 'end']);
const QUESTION_TYPES = new Set(['mcq', 'reflect', 'calc-exercise', 'proof-steps']);

// True when the block carries a table, or its screen has a viz or table block (or another block with a table).
function screenShowsData(step, block) {
  if (tablesOf(block).length || (block.variants || []).some((v) => v.table !== undefined)) return true;
  return (step.blocks || []).some((o) => o.type === 'viz' || o.type === 'table' || (o !== block && tablesOf(o).length));
}

const mentionsData = (pairs) => pairs.find((p) => DATA_REF.test(fold(p.ro)));

export function dataProblems(lessons) {
  const out = [];
  for (const lesson of lessons) {
    for (const { at, ro } of pairsIn(lesson.json)) if (POINTER.test(fold(ro))) out.push(`D2 ${lesson.metaId} ${at}: points at another screen: "${ro.slice(0, 60)}"`);
  }
  for (const { step, block, where } of blocksOf(lessons)) {
    if (!QUESTION_TYPES.has(block.type) && !isStr(block.caption?.ro) && !tablesOf(block).length) continue;
    if (screenShowsData(step, block)) continue;
    if (QUESTION_TYPES.has(block.type)) {
      const hit = mentionsData(pairsUnder(block, ASK_KEYS));
      if (hit) out.push(`D1 ${where}: asks about data it does not show ("${hit.ro.slice(0, 60)}")`);
    }
    const hit = mentionsData(pairsUnder(block, ANSWER_KEYS));
    if (hit) out.push(`D3 ${where}: ${hit.at} names data the screen does not show ("${hit.ro.slice(0, 60)}")`);
  }
  return out;
}

// The numbers a block's explanation may cite: its own text, its tables and the tables on its screen, its data, every field's
// expected value, the value of every formula, and what its check says.
function allowedValues(step, block) {
  const vals = [];
  const add = (v) => { const n = numberOf(v); if (Number.isFinite(n)) vals.push(n); };
  const fromText = (s) => { for (const c of citedNumbers(s)) vals.push(c.value); for (const n of plainNumbers(s)) vals.push(Number(n)); };
  for (const p of pairsUnder(block, new Set([...ASK_KEYS, 'text']))) fromText(p.ro);
  for (const b of step.blocks || []) {
    if (b !== block && b.type !== 'table' && !tablesOf(b).length) continue;
    for (const c of tableCells(b)) { fromText(c.text); if (typeof c.value === 'number') vals.push(c.value); }
  }
  for (const c of tableCells(block)) { fromText(c.text); if (typeof c.value === 'number') vals.push(c.value); }
  for (const { b } of block.type === 'calc-exercise' ? flavours(block) : []) {
    for (const v of Object.values(b.data || {})) if (typeof v === 'number') vals.push(v);
    for (const c of tableCells({ table: b.table })) { fromText(c.text); if (typeof c.value === 'number') vals.push(c.value); }
    const scope = scopeOf(b);
    for (const f of b.fields || []) {
      add(valueNumber(f.expected));
      try { const v = evaluate(f.formula, scope); if (Array.isArray(v)) v.forEach(add); else add(v); } catch { /* reported by N1 */ }
    }
    for (const d of b.detectors || []) { try { add(evaluate(d.formula, scope)); } catch { /* reported by N2 */ } }
  }
  if (block.check) {
    for (const v of Object.values(block.check.data || {})) if (typeof v === 'number') vals.push(v);
    try { add(evaluate(block.check.formula, block.check.data || {})); } catch { /* reported by N3 */ }
  }
  return vals;
}

const matchesAllowed = (cited, vals) => vals.some((v) => (cited.ratio
  ? Math.abs(v - cited.value) <= 1e-3
  : Math.abs(v - cited.value) <= 0.5 * 10 ** -cited.decimals + 1e-9));

// A decimal or a fraction cited in an explanation has to come from the block's own data or formulas (BD-mistakes G1).
export function citedProblems(lessons) {
  const out = [];
  for (const { step, block, where } of blocksOf(lessons)) {
    if (!QUESTION_TYPES.has(block.type)) continue;
    const explains = pairsUnder(block, new Set(['explain']));
    if (!explains.length) continue;
    const vals = allowedValues(step, block);
    for (const p of explains) {
      for (const c of citedNumbers(p.ro)) {
        if (!matchesAllowed(c, vals)) out.push(`D4 ${where}: ${p.at} cites ${c.text}, which is not in the block's data, table, expected values or formulas`);
      }
    }
  }
  return out;
}

// ---- 3. repetition ----------------------------------------------------------------------------------------------------------

const exerciseIds = (b) => (b.exercise === undefined ? [] : (Array.isArray(b.exercise) ? b.exercise : [b.exercise]));
const stem = (s) => norm(fold(s)).replace(/[^\p{L}\p{N}$]+/gu, ' ').trim();
const fingerprint = (tb) => JSON.stringify([
  tb.columns.map((c) => (isStr(c) ? c : c.ro)).map((c) => norm(c)),
  tb.rows.map((r) => r.map((c) => norm(String(c)))).map((r) => JSON.stringify(r)).sort(),
]);

// Lesson numbers a declared_reuse entry lets a table sit in: its owner and the L<n> of each also_in line.
function reuseSets(allocation) {
  return (allocation?.declared_reuse || []).map((d) => new Set([Number(d.owner), ...(d.also_in || []).map((s) => Number(String(s).match(/^L(\d+)/)?.[1])).filter(Number.isFinite)]));
}

export function repetitionProblems(lessons, allocation) {
  const out = [];
  const have = new Set(lessons.map((l) => lessonNo(l.metaId)));

  // exercise atoms: one block each, in the owner lesson
  const found = new Map();
  for (const { lesson, block, where } of blocksOf(lessons)) {
    if (block.type !== 'calc-exercise' && block.type !== 'proof-steps') continue;
    for (const id of exerciseIds(block)) {
      if (!found.has(id)) found.set(id, []);
      found.get(id).push({ no: lessonNo(lesson.metaId), where });
    }
  }
  const index = allocation?.exercise_index || {};
  for (const [id, hits] of found) {
    const owner = index[id]?.lesson;
    if (owner === undefined) out.push(`R1 ${hits[0].where}: exercise ${id} is not in allocation.json`);
    else {
      if (hits.length > 1) out.push(`R1 exercise ${id} appears in ${hits.length} blocks (${hits.map((h) => h.where).join('; ')})`);
      for (const h of hits) if (h.no !== owner) out.push(`R1 ${h.where}: exercise ${id} belongs to lesson ${owner}, not ${h.no}`);
    }
  }
  // an optional exercise still has its own block (the outline gives it a section); an implementation exercise is one line of text
  for (const [id, e] of Object.entries(index)) {
    if (!have.has(e.lesson) || e.answer_status === 'impl' || found.has(id)) continue;
    out.push(`R1 exercise ${id} is owned by lesson ${e.lesson} but no calc-exercise or proof-steps block carries it`);
  }

  // no revisits in the lesson flow
  for (const { block, where } of blocksOf(lessons)) if (block.type === 'mcq' && block.review !== undefined) out.push(`R2 ${where}: an ML mcq carries review "${block.review}"`);

  // a static table in one lesson only, unless declared
  const sets = reuseSets(allocation);
  const seen = new Map();
  for (const { lesson, block, where } of blocksOf(lessons)) {
    const tbs = block.type === 'table' && isStaticTable(block) ? [block] : tablesOf(block).filter(isStaticTable);
    for (const tb of tbs) {
      const fp = fingerprint(tb);
      if (!seen.has(fp)) seen.set(fp, new Map());
      const m = seen.get(fp);
      if (!m.has(lesson.metaId)) m.set(lesson.metaId, where);
    }
  }
  for (const m of seen.values()) {
    if (m.size < 2) continue;
    const nos = [...m.keys()].map(lessonNo);
    if (sets.some((s) => nos.every((n) => s.has(n)))) continue;
    out.push(`R3 the same table is in lessons ${[...m.keys()].join(', ')} (${[...m.values()].join('; ')})`);
  }

  // quiz stems and statements
  const stems = new Map();
  const statements = new Map();
  for (const { block, where } of blocksOf(lessons)) {
    if (block.type === 'mcq' && block.question) {
      const k = stem(block.question.ro);
      if (stems.has(k)) out.push(`R4 ${where}: same quiz stem as ${stems.get(k)}`); else stems.set(k, where);
    }
    const text = block.type === 'calc-exercise' ? block.statement : block.type === 'proof-steps' ? block.claim : block.type === 'reflect' ? block.prompt : null;
    if (text) {
      const k = stem(text.ro);
      if (statements.has(k)) out.push(`R5 ${where}: same statement as ${statements.get(k)}`); else statements.set(k, where);
    }
  }
  return out;
}

// ---- 4. quiz quality --------------------------------------------------------------------------------------------------------

// The letter of the right answer is spread over a lesson's mcqs (no letter over 40%, from 3 questions on) and, as a pool of its
// own, over its proof predictions (no position over two thirds, from 3 on): most predictions have two options, so 40% could
// never hold for them, and a lesson whose predictions are all "B" teaches the letter, not the step (BD-mistakes class 10).
const PREDICT_SHARE = 2 / 3;

export function quizProblems(lessons) {
  const out = [];
  for (const lesson of lessons) {
    const positions = [];
    const predicts = [];
    for (const step of lesson.json.steps || []) {
      for (const b of step.blocks || []) {
        if (b.type === 'proof-steps') {
          for (const s of b.steps || []) if (s?.predict) predicts.push((s.predict.options || []).findIndex((o) => o.correct === true));
          continue;
        }
        if (b.type !== 'mcq') continue;
        const where = `${step.id} ${b.id}`;
        (b.options || []).forEach((o, i) => {
          if (o.correct === true) return;
          if (!isStr(o.misconception) || !TRAP_TAGS.has(o.misconception)) out.push(`Q1 ${where} option ${i}: misconception "${o.misconception}" is not in the trap catalogue`);
          else if (!isPair(o.explain) || !o.explain.en.trim() || !o.explain.ro.trim()) out.push(`Q1 ${where} option ${i}: no explanation`);
        });
        positions.push((b.options || []).findIndex((o) => o.correct === true));
      }
    }
    // no letter holds more than 40% of a lesson's questions (a lesson with fewer than 3 has too few to spread)
    if (positions.length >= 3) {
      const counts = {};
      for (const p of positions) counts[p] = (counts[p] || 0) + 1;
      for (const [p, n] of Object.entries(counts)) {
        if (n / positions.length > 0.4) out.push(`Q2 ${lesson.metaId}: letter ${'ABCDEFGH'[Number(p)] ?? '?'} holds ${n} of ${positions.length} correct answers (more than 40%)`);
      }
    }
    if (predicts.length >= 3) {
      const counts = {};
      for (const p of predicts) counts[p] = (counts[p] || 0) + 1;
      for (const [p, n] of Object.entries(counts)) {
        if (n / predicts.length > PREDICT_SHARE + 1e-9) out.push(`Q2 ${lesson.metaId}: letter ${'ABCDEFGH'[Number(p)] ?? '?'} holds ${n} of ${predicts.length} proof predictions (more than two thirds)`);
      }
    }
  }
  return out;
}

// ---- 5. text sweep ----------------------------------------------------------------------------------------------------------

const PHASE_WORDS = /(?<!\p{L})(pretest|retrieve|faz[aăe]|concret:|regul[aă]:|de ce\?:|recapitulare de faz[aă])/iu;
const STEP_LABEL = /(?<!\p{L})Pasul \d+/iu;
const EN_IN_RO = ['the', 'and', 'of', 'which', 'answer', 'table', 'step'];
const EN_RE = new RegExp(`(?<![\\p{L}\\p{N}_])(${EN_IN_RO.join('|')})(?![\\p{L}\\p{N}_])`, 'giu');
const MARKDOWN_LAYOUT = [
  ['a code fence', /```/],
  ['a markdown table row', /^\s*\|.*\|\s*$/m],
  ['a list item', /^\s*(?:[-*•]|\d+[.)])\s+\S/m],
  // a backslash and an n typed into the JSON ("\\n") shows on screen as the two characters, not as a line break (lesson 2,
  // live 2026-10-29); KaTeX commands that start with \n (\ne, \neq, \nu, \not) are followed by a letter and pass
  ['a literal \\n instead of a line break', /(?<!\\)\\n(?![a-z])/],
];

export function textProblems(lessons) {
  const out = [];
  for (const lesson of lessons) {
    for (const { at, en, ro } of pairsIn(lesson.json)) {
      const w = `${lesson.metaId} ${at}`;
      if (/[„”“]/.test(ro)) out.push(`T1 ${w}: Romanian quotes in "${ro.slice(0, 50)}"`);
      for (const [lang, s] of [['en', en], ['ro', fold(ro)]]) {
        const m = s.match(PHASE_WORDS);
        if (m) out.push(`T2 ${w}: phase word "${m[1]}" in the ${lang} text`);
      }
      if (STEP_LABEL.test(ro)) out.push(`T2 ${w}: a "Pasul N" label`);
      const plain = mathParts(ro).rest;
      const english = [...plain.matchAll(EN_RE)].map((m) => m[1]).find((x) => x !== x.toUpperCase());
      if (english) out.push(`T3 ${w}: English word "${english}" in the Romanian text`);
      if (/\s$/.test(ro)) out.push(`T5 ${w}: the Romanian text ends with a space`);
      for (const [name, re] of MARKDOWN_LAYOUT) if (re.test(en) || re.test(ro)) out.push(`T6 ${w}: ${name} inside a text`);
    }
    for (const step of lesson.json.steps || []) {
      if (/\$/.test(`${step.title?.en ?? ''}${step.title?.ro ?? ''}`)) out.push(`T4 ${step.id}: a $ in the step title`);
    }
  }
  return out;
}

// ---- 6. structure -----------------------------------------------------------------------------------------------------------

export function structureProblems(lessons) {
  const out = [];
  for (const { metaId, json } of lessons) {
    const steps = json.steps || [];
    const defs = steps.flatMap((s) => s.blocks || []).filter((b) => b.type === 'definition').length;
    if (defs < 2 || defs > 4) out.push(`S1 ${metaId}: ${defs} definition blocks (a lesson has 2 to 4)`);
    if (!(steps[0]?.blocks || []).some((b) => b.type === 'mcq' || b.type === 'reflect')) out.push(`S2 ${metaId}: the first screen is not a gating question`);
    const isExercise = (s) => (s.blocks || []).some((b) => b.type === 'calc-exercise' || b.type === 'proof-steps');
    const firstEx = steps.findIndex(isExercise);
    if (firstEx < 0) out.push(`S3 ${metaId}: no exercise screen`);
    else if (!isExercise(steps[steps.length - 1]) || steps.slice(firstEx).some((s) => !isExercise(s))) out.push(`S3 ${metaId}: the last screens are not all exercises`);
  }
  return out;
}

// The course validator (scripts/validate-course-json.mjs) passes on each file.
export function validatorProblems(files) {
  const out = [];
  for (const f of files) {
    const r = spawnSync(process.execPath, [path.join(ROOT, 'scripts/validate-course-json.mjs'), f], { encoding: 'utf8' });
    if (r.status !== 0) out.push(`S4 ${path.basename(f)}: ${String(r.stderr || r.stdout).trim().split('\n').slice(0, 4).join(' | ')}`);
  }
  return out;
}

// ---- 7. viz -----------------------------------------------------------------------------------------------------------------

export function registeredWidgets(file = path.join(ROOT, 'src/components/lesson/blocks/VizBlock.jsx')) {
  return [...fs.readFileSync(file, 'utf8').matchAll(/^\s*'([\w-]+)':\s*lazy\(/gm)].map((m) => m[1]);
}

export function vizProblems(lessons, widgets = registeredWidgets()) {
  const out = [];
  for (const { block, where } of blocksOf(lessons)) {
    if (block.type !== 'viz') continue;
    if (!widgets.includes(block.widget)) out.push(`V1 ${where}: widget "${block.widget}" is not registered in VizBlock`);
    else for (const e of validateViz(block)) out.push(`V1 ${where}: ${e}`);
  }
  return out;
}

// ---- 9. terms before their lesson, answers given away -----------------------------------------------------------------------
// A term is matched as a run of whole words, each word by its stem (a word of 6+ letters loses its last 2, never below 4 letters),
// with case and diacritics ignored: "entropie condiționată" finds "entropia condiționată" and "entropiei condiționate".
// A `strict` term keeps ș and ț apart from s and t and loses only its final vowels: "varianță" (variance, Lesson 4) finds
// "varianța" and "varianțele" but not "varianta" or "variante" (a variant), which plain matching cannot tell apart.

const words = (s) => (norm(fold(s)).match(/[\p{L}\p{N}]+/gu) || []);
const stemOf = (w) => (w.length >= 6 ? w.slice(0, Math.max(4, w.length - 2)) : w);
const strictWords = (s) => (fold(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u0325\u0327-\u036f]/g, '').normalize('NFC')
  .match(/[\p{L}\p{N}]+/gu) || []);
const strictStem = (w) => { let x = w; while (x.length > 4 && /[aeiou]$/.test(x)) x = x.slice(0, -1); return x; };

export function termMatcher(term, { strict = false } = {}) {
  const split = strict ? strictWords : words;
  const ts = split(term);
  const same = strict ? (w, t) => w.startsWith(strictStem(t)) : (w, t) => (t.length >= 6 ? w.startsWith(stemOf(t)) : w === t);
  return (text) => {
    const ws = split(text);
    for (let i = 0; i + ts.length <= ws.length; i++) {
      if (ts.every((t, j) => same(ws[i + j], t))) return true;
    }
    return false;
  };
}

// owners: the parsed tests/ml/term-owners.json. A term listed twice counts from its earliest lesson.
export function termProblems(lessons, owners) {
  const byTerm = new Map();
  for (const t of owners?.terms || []) {
    const k = `${t.strict ? 'strict:' : ''}${(t.strict ? strictWords : words)(t.term).join(' ')}`;
    if (!byTerm.has(k) || byTerm.get(k).owner > t.owner) byTerm.set(k, { term: t.term, owner: t.owner, match: termMatcher(t.term, { strict: !!t.strict }) });
  }
  const out = [];
  for (const lesson of lessons) {
    const no = lessonNo(lesson.metaId);
    for (const { at, ro } of pairsIn(lesson.json)) {
      const forward = [...norm(fold(ro)).matchAll(/lectia\s+(\d+)/g)].map((m) => Number(m[1]));
      const hits = [...byTerm.values()].filter((t) => t.owner > no && !forward.includes(t.owner) && t.match(ro)).sort((a, b) => b.owner - a.owner);
      if (hits.length) out.push(`L1 ${lesson.metaId} ${at}: uses ${hits.map((t) => `"${t.term}" (lesson ${t.owner})`).join(', ')} before its lesson`);
    }
  }
  return out;
}

const boundary = (core) => new RegExp(`(?<![\\p{L}\\p{N}.,])${core}(?![\\p{L}\\p{N}]|[.,]\\d)`, 'iu');
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const decimalForms = (v) => {
  const s = String(v).trim();
  return [...new Set([s, s.replace('.', ','), s.replace(',', '.')])];
};

export function giveawayProblems(lessons) {
  const out = [];
  for (const { block, where } of blocksOf(lessons)) {
    // an mcq and each prediction of a proof are quiz stems
    const asks = block.type === 'mcq' ? [{ q: block, at: '' }]
      : block.type === 'proof-steps' ? (block.steps || []).map((s, k) => ({ q: s?.predict, at: ` step ${k + 1}` })).filter((x) => x.q) : [];
    for (const { q, at } of asks) {
      const right = (q.options || []).find((o) => o.correct === true);
      const t = norm(String(right?.text?.ro ?? '').replace(/\$/g, ''));
      if (t.length >= 3 && boundary(escapeRe(t)).test(norm(String(q.question?.ro ?? '').replace(/\$/g, '')))) out.push(`L2 ${where}${at}: the stem contains its correct option "${right.text.ro}"`);
    }
    if (block.type !== 'calc-exercise') continue;
    for (const { label, b } of flavours(block)) {
      const texts = [b.statement?.ro, b.hints?.[0]?.ro, b.hints?.[1]?.ro].filter(Boolean).map((x) => String(x).replace(/\{,\}/g, ','));
      for (const f of b.fields || []) {
        if (f.kind !== 'num' && f.kind !== 'frac') continue;
        const e = String(f.expected).trim();
        if (/^-?\d+$/.test(e)) continue; // a whole number is too common a word to trace
        for (const s of texts) {
          if (decimalForms(e).some((form) => boundary(escapeRe(form)).test(s))) { out.push(`L3 ${where}${label}: statement or hint 1/2 contains the answer ${e} of field ${f.id}`); break; }
        }
      }
    }
  }
  return out;
}

// ---- 10. English and Romanian agree -----------------------------------------------------------------------------------------

export function pairProblems(lessons) {
  const out = [];
  for (const lesson of lessons) {
    for (const { at, en, ro } of pairsIn(lesson.json)) {
      const a = mathParts(en);
      const b = mathParts(ro);
      const nums = (x) => plainNumbers(x).sort().join(' ');
      const segs = (p) => p.segments.map(canonMath).sort().join(' ¦ ');
      if (nums(en) !== nums(ro)) out.push(`P1 ${lesson.metaId} ${at}: the numbers differ (en: ${nums(en) || '-'} / ro: ${nums(ro) || '-'})`);
      if (segs(a) !== segs(b)) out.push(`P1 ${lesson.metaId} ${at}: the $…$ segments differ`);
    }
  }
  return out;
}

// ---- 11. the answer format is stated ----------------------------------------------------------------------------------------

const ROUNDING_STATED = /zecimal|frac[țţ]ie|frac[țţ]ii|ca raport|rotunjit/i;
const UNIT_STATED = /în bi[țţ]i|bi[țţ]i|\\log_?\{?2|log₂|log_2/i;
const BIT_FUNCTIONS = /\b(log2|H|Hc|Hcol|IG|IGR|splitInfo|KL|CH)\s*\(/;

// Each variant too: review shows a variant with its own statement and the block's field labels.
export function formatProblems(lessons) {
  const out = [];
  for (const { block, where } of blocksOf(lessons)) {
    if (block.type !== 'calc-exercise') continue;
    for (const { label, b } of flavours(block)) {
      const text = fold(`${b.statement?.ro ?? ''} ${(b.fields || []).map((f) => f.label?.ro ?? '').join(' ')}`);
      for (const f of b.fields || []) {
        if ((f.kind === 'num' || f.kind === 'frac') && tolOf(f) < 0.01 && !ROUNDING_STATED.test(fold(`${f.label?.ro ?? ''} ${b.statement?.ro ?? ''}`))) {
          out.push(`F1 ${where}${label} field ${f.id}: tolerance ${tolOf(f)} but neither the label nor the statement says how to round`);
        }
      }
      if ((b.fields || []).some((f) => BIT_FUNCTIONS.test(f.formula)) && !UNIT_STATED.test(text)) out.push(`F2 ${where}${label}: the formulas use log2, H or IG but the statement does not say "în biți" or $\\log_2$`);
    }
  }
  return out;
}

// ---- 12. KaTeX --------------------------------------------------------------------------------------------------------------

export function katexProblems(lessons) {
  const out = [];
  const check = (w, text) => {
    const { display, inline, rest } = mathParts(text);
    for (const [tex, displayMode] of [...display.map((t) => [t, true]), ...inline.map((t) => [t, false])]) {
      try { katex.renderToString(tex, { displayMode, throwOnError: true }); } catch (e) { out.push(`K1 ${w}: KaTeX fails on "${tex.slice(0, 50)}" (${String(e.message).slice(0, 60)})`); }
    }
    if (/(?<!\\)\$/.test(rest.replace(/\\\$/g, ''))) out.push(`K1 ${w}: a $ that does not open or close a formula in "${text.slice(0, 50)}"`);
  };
  for (const lesson of lessons) {
    for (const { at, en, ro } of pairsIn(lesson.json)) { check(`${lesson.metaId} ${at}`, en); check(`${lesson.metaId} ${at}`, ro); }
    for (const c of tableCells(lesson.json)) check(`${lesson.metaId} ${c.at}`, c.text);
  }
  return out;
}

// ---- 13. colours ------------------------------------------------------------------------------------------------------------

const COLOUR_LITERAL = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\(/;
const OPACITY_CLASS = /\bopacity-\d/;
// ML rules in the shared stylesheet: the calc-exercise and proof-steps blocks and anything named ml-, plus every definition of an
// ML token (--ml-*), wherever it sits (:root, .dark): an ML token is a color-mix of the theme tokens.
const ML_SELECTOR = /\.ch-calc|\.ch-proof|\.ml-|\.lc-/;
const ML_TOKEN = /--ml-[\w-]+\s*:[^;}]*/g;

export function colourProblems(files) {
  const out = [];
  for (const { path: p, src } of files) {
    let text = src;
    if (p.endsWith('.css')) {
      const rules = [...src.matchAll(/([^{}]+)\{([^{}]*)\}/g)];
      text = [...rules.filter((m) => ML_SELECTOR.test(m[1])).map((m) => m[0]), ...rules.flatMap((m) => m[2].match(ML_TOKEN) || [])].join('\n');
    }
    if (COLOUR_LITERAL.test(text)) out.push(`C1 ${p}: a hex, rgb( or hsl( literal (use var(--theme-*) or var(--lt-*))`);
    if (OPACITY_CLASS.test(text)) out.push(`C1 ${p}: an opacity- class (muted text uses a token)`);
  }
  return out;
}

// The files the colour rule covers: everything under any ml folder of src/components/lesson (src/components/lesson/**/ml/**),
// the three ML blocks, and the ML rules of the shared stylesheet.
export function colourFiles(root = ROOT) {
  const files = [];
  const walk = (dir, inMl) => {
    if (!fs.existsSync(dir)) return;
    for (const name of fs.readdirSync(dir).sort()) {
      const p = path.join(dir, name);
      if (fs.statSync(p).isDirectory()) walk(p, inMl || name === 'ml');
      else if (inMl && /\.(jsx?|css)$/.test(name)) files.push(p);
    }
  };
  walk(path.join(root, 'src/components/lesson'), false);
  for (const n of ['CalcExerciseBlock.jsx', 'ProofStepsBlock.jsx', 'LogCalculator.jsx']) {
    const p = path.join(root, 'src/components/lesson/blocks', n);
    if (fs.existsSync(p)) files.push(p);
  }
  if (fs.existsSync(path.join(root, 'src/index.css'))) files.push(path.join(root, 'src/index.css'));
  return files.map((p) => ({ path: path.relative(root, p), src: fs.readFileSync(p, 'utf8') }));
}

// ---- everything -------------------------------------------------------------------------------------------------------------

export const CHECKS = [
  ['numbers', numberProblems],
  ['data on screen', dataProblems],
  ['cited numbers', citedProblems],
  ['repetition', repetitionProblems],
  ['quiz quality', quizProblems],
  ['text sweep', textProblems],
  ['structure', structureProblems],
  ['viz', vizProblems],
  ['terms', termProblems],
  ['answers given away', giveawayProblems],
  ['en and ro agree', pairProblems],
  ['answer format', formatProblems],
  ['KaTeX', katexProblems],
];

export function loadAllocation(root = ROOT) {
  return JSON.parse(fs.readFileSync(path.join(root, 'docs/superpowers/specs/ml-outline/allocation.json'), 'utf8'));
}
export function loadTermOwners(root = ROOT) {
  return JSON.parse(fs.readFileSync(path.join(root, 'tests/ml/term-owners.json'), 'utf8'));
}

// Every lesson file of the subject: [{ metaId, file, json }].
export function loadLessons(root = ROOT) {
  const dir = path.join(root, 'src/content/ml/courses');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => /^lesson-\d\d\.json$/.test(f)).sort().map((f) => {
    const json = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    return { metaId: json.meta.id, file: path.join(dir, f), json };
  });
}

// Runs every check; returns { name: problems[] }.
export function runAll(lessons, { allocation, owners, widgets } = {}) {
  const res = {};
  for (const [name, fn] of CHECKS) {
    res[name] = fn === repetitionProblems ? fn(lessons, allocation) : fn === termProblems ? fn(lessons, owners) : fn === vizProblems ? fn(lessons, widgets) : fn(lessons);
  }
  return res;
}
