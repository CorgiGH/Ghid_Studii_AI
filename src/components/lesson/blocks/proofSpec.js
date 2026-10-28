// Shape and state of the `proof-steps` block, shared by the validator script, the block and the player (no React).
// Block JSON: { type:'proof-steps', id, exercise?, claim, given?, table?, steps:[{ shown, why?, predict? }], end }
//   predict: { question, options:[{ text, correct, explain, misconception? }] }, checked like an mcq.

import { tableError, validateMcq } from './choiceSpec.js';
import { restoredMcqPick } from '../../../lesson/restore.js';

const isStr = (v) => typeof v === 'string' && v.trim().length > 0;
const isBi = (v) => !!v && typeof v === 'object' && isStr(v.en) && isStr(v.ro);

// The item id under which the pick on step k is stored (and queued for review when it is wrong).
export const stepItem = (id, k) => `${id}#${k}`;

// Returns a list of problems; empty means the block is well-formed. ctx.lessonId is passed on to the mcq rules.
export function validateProof(b, ctx = {}) {
  const errs = [];
  const at = (m) => errs.push(`(proof-steps${b?.id ? ` ${b.id}` : ''}): ${m}`);
  if (!isStr(b?.id)) at('id missing');
  if (!isBi(b?.claim)) at('claim must have en + ro');
  if (b?.given !== undefined && !isBi(b.given)) at('given must have en + ro');
  if (!isBi(b?.end)) at('end must have en + ro');
  if (b?.exercise !== undefined && !(isStr(b.exercise) || (Array.isArray(b.exercise) && b.exercise.length > 0 && b.exercise.every(isStr)))) {
    at('exercise must be a string or a non-empty list of strings');
  }
  const te = tableError(b?.table);
  if (te) at(te);
  const steps = b?.steps;
  if (!Array.isArray(steps) || steps.length === 0) { at('steps must be a non-empty list'); return errs; }
  steps.forEach((s, k) => {
    if (!s || typeof s !== 'object') { at(`steps[${k}] is not an object`); return; }
    if (!isBi(s.shown)) at(`steps[${k}].shown must have en + ro`);
    if (s.why !== undefined && !isBi(s.why)) at(`steps[${k}].why must have en + ro`);
    if (s.predict !== undefined) {
      if (!s.predict || typeof s.predict !== 'object') { at(`steps[${k}].predict is not an object`); return; }
      const inner = validateMcq({ id: stepItem(b?.id || 'proof', k), question: s.predict.question, options: s.predict.options }, ctx);
      for (const e of inner) at(`steps[${k}].predict ${e}`);
    }
  });
  return errs;
}

// State rebuilt from the attempts stored for the block's screen: { shown, picks }.
//   shown: how many steps are on screen (at least 1); picks: { stepIndex: optionIndex } for answered predicts.
// A reveal is stored as { kind:'proof', item:id, shown:n, ok:true }, a pick as an mcq attempt on stepItem(id, k).
export function restoredProof(attempts, block) {
  const list = Array.isArray(attempts) ? attempts : [];
  let shown = 1;
  for (const a of list) {
    if (a && a.item === block.id && a.kind === 'proof' && Number.isInteger(a.shown)) shown = Math.max(shown, a.shown);
  }
  const picks = {};
  block.steps.forEach((s, k) => {
    if (!s.predict) return;
    const n = restoredMcqPick(list, stepItem(block.id, k), s.predict.options.length);
    if (n !== null) { picks[k] = n; shown = Math.max(shown, k + 1); }
  });
  return { shown: Math.min(shown, block.steps.length), picks };
}

// A pick is final: it counts once, on a step that is on screen and has that option.
export function pickOption(state, block, k, i) {
  const s = block.steps[k];
  if (!s?.predict || k >= state.shown || k in state.picks) return state;
  if (!Number.isInteger(i) || i < 0 || i >= s.predict.options.length) return state;
  return { ...state, picks: { ...state.picks, [k]: i } };
}

// Whether the learner may see the next step: there is one, and the step on screen last has no unanswered predict.
export function canReveal(state, block) {
  if (state.shown >= block.steps.length) return false;
  const last = state.shown - 1;
  return !block.steps[last].predict || last in state.picks;
}

export function reveal(state, block) {
  return canReveal(state, block) ? { ...state, shown: state.shown + 1 } : state;
}

// The proof is finished: the last step is on screen and its predict, if it has one, is answered.
export function proofDone(state, block) {
  const last = block.steps.length - 1;
  return state.shown >= block.steps.length && (!block.steps[last].predict || last in state.picks);
}

export const proofDoneFromAttempts = (block, attempts) => proofDone(restoredProof(attempts, block), block);
