// Shapes of the two card blocks the Ghid rapid lessons are drawn with (scripts/ml/guide-to-lessons.mjs writes them):
//
//   steps: { type: 'steps', intro?: [part], items?: [{ en, ro }], start?: n, result?: { en, ro } }
//     one card: the intro parts, then the numbered steps (numbered from `start`, 1 by default, so a split example keeps its
//     numbers), then the result line. A card with only an intro is the data part of an example too long for one screen.
//   rule:  { type: 'rule', variant?: 'when', label?: { en, ro }, text: { en, ro }, body?: [part] }
//     one card: the small label, the rule sentence, then its formulas, condition lines and anything else that belongs to it.
//
//   part: { text } a paragraph · { note } a small line that qualifies a formula · { tex } a display formula
//         { points: [..] } a bulleted list · { steps: [..] } a numbered list · { heading } a small heading
//         { table } a static table ({ columns, rows, caption? }, drawn like a question's table)
import { tableError } from './choiceSpec.js';

const isStr = (v) => typeof v === 'string' && v.trim() !== '';
const isBi = (v) => !!v && typeof v === 'object' && isStr(v.en) && isStr(v.ro);
const isBiList = (v) => Array.isArray(v) && v.length > 0 && v.every(isBi);

const PART_KEYS = ['text', 'note', 'tex', 'points', 'steps', 'heading', 'table'];

// The problem with one part, or null.
export function partError(p) {
  if (!p || typeof p !== 'object') return 'a part must be an object';
  const keys = Object.keys(p);
  if (keys.length !== 1 || !PART_KEYS.includes(keys[0])) return `a part has exactly one of ${PART_KEYS.join(', ')}`;
  const [k] = keys;
  if (k === 'tex') return isStr(p.tex) ? null : 'a tex part must be a non-empty string';
  if (k === 'points' || k === 'steps') return isBiList(p[k]) ? null : `a ${k} part must be a non-empty list of { en, ro }`;
  if (k === 'table') {
    if (!p.table || Array.isArray(p.table) || !Array.isArray(p.table.columns)) return 'a table part must be one static table (columns + rows)';
    return tableError(p.table);
  }
  return isBi(p[k]) ? null : `a ${k} part must have en + ro`;
}

const partsErrors = (parts, name, at) => {
  if (!Array.isArray(parts) || !parts.length) { at(`${name} must be a non-empty list of parts`); return; }
  parts.forEach((p, i) => { const e = partError(p); if (e) at(`${name}[${i}]: ${e}`); });
};

export function validateSteps(b) {
  const errs = [];
  const at = (m) => errs.push(`(steps): ${m}`);
  if (b?.intro !== undefined) partsErrors(b.intro, 'intro', at);
  if (b?.items !== undefined && !isBiList(b.items)) at('items must be a non-empty list of { en, ro }');
  if (b?.items === undefined && b?.intro === undefined) at('needs items, an intro or both');
  if (b?.start !== undefined && !(Number.isInteger(b.start) && b.start >= 1)) at('start must be a whole number from 1');
  if (b?.result !== undefined && !isBi(b.result)) at('result must have en + ro');
  if (b?.result !== undefined && b?.items === undefined) at('a result needs the steps it ends');
  return errs;
}

export function validateRule(b) {
  const errs = [];
  const at = (m) => errs.push(`(rule): ${m}`);
  if (!isBi(b?.text)) at('text must have en + ro');
  if (b?.label !== undefined && !isBi(b.label)) at('label must have en + ro');
  if (b?.variant !== undefined && b.variant !== 'when') at("variant must be 'when' when given");
  if (b?.body !== undefined) partsErrors(b.body, 'body', at);
  return errs;
}

// The answer of a reflect block as steps: [{ intro?, items?, start?, result? }, ...], each checked like a steps card.
export function answerStepsError(list) {
  if (list === undefined) return null;
  if (!Array.isArray(list) || !list.length) return 'answerSteps must be a non-empty list of { intro?, items?, result? }';
  for (let i = 0; i < list.length; i++) {
    const e = validateSteps(list[i]);
    if (e.length) return `answerSteps[${i}] ${e[0].replace(/^\(steps\): /, '')}`;
  }
  return null;
}
