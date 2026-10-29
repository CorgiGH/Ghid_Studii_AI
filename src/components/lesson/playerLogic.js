// Pure helpers for the lesson player (no React), so they can be tested in node.

import { proofDoneFromAttempts } from './blocks/proofSpec.js';

const GATING_TYPES = new Set(['reflect', 'mcq', 'sql-exercise', 'calc-exercise', 'proof-steps']);

export function screenFromUrl(search, total) {
  const max = Math.max(1, total | 0);
  let raw = null;
  try { raw = new URLSearchParams(search || '').get('s'); } catch { raw = null; }
  if (raw === null || !/^-?\d+$/.test(raw.trim())) return 1;
  return Math.min(max, Math.max(1, parseInt(raw, 10)));
}

// After a screen change from a scrolled-down page, the stage keeps the height go() gave it (style.minHeight) until the smooth scroll
// to the top is done, or the learner scrolls down, or `maxMs` pass: a shorter next screen would otherwise shrink the page under
// the scroll position and the content would jump (0735c17). Returns the effect's cleanup, which only stops listening: it never
// clears the height, because by the time React runs it go() may already have set the next change's hold (the ML walk found the
// jolt back on every other screen change).
export function holdStageUntilTop(stage, win = window, { maxMs = 1200 } = {}) {
  if (!stage || !stage.style.minHeight) return undefined;
  let timer = null;
  let lastY = win.scrollY;
  const detach = () => {
    win.removeEventListener('scroll', onScroll);
    win.clearTimeout(timer);
  };
  const release = () => {
    stage.style.minHeight = '';
    detach();
  };
  // the smooth scroll only ever goes up: a step down is the learner scrolling
  function onScroll() {
    const y = win.scrollY;
    if (y <= 0 || y > lastY) release();
    lastY = y;
  }
  win.addEventListener('scroll', onScroll, { passive: true });
  timer = win.setTimeout(release, maxMs);
  if (win.scrollY <= 0) release();
  return detach;
}

export function nextScreen(current, dir, total) {
  return Math.min(Math.max(1, total), Math.max(1, current + (dir < 0 ? -1 : 1)));
}

// A query-machine block gates its screen when any stage asks for a prediction.
const asksPrediction = (block) => Array.isArray(block.stages) && block.stages.some(s => s && s.predict);

export function isGatingBlock(block) {
  if (!block) return false;
  if (GATING_TYPES.has(block.type)) return true;
  if (block.type === 'query-machine') return block.predict === true || asksPrediction(block);
  return block.type === 'viz' && block.predict === true;
}

export function isGatingScreen(step) {
  return Array.isArray(step?.blocks) && step.blocks.some(isGatingBlock);
}

export function gatingKind(step) {
  const b = (step?.blocks || []).find(isGatingBlock);
  if (!b) return 'reflect';
  if (b.type === 'mcq' || b.type === 'proof-steps') return 'mcq';
  if (b.type === 'sql-exercise') return 'sql';
  if (b.type === 'calc-exercise') return 'calc';
  if (b.type === 'reflect') return 'reflect';
  return 'predict';
}

export function canAdvance(step, gate) {
  if (!isGatingScreen(step)) return true;
  return !!(gate && (gate.completed || gate.skipped));
}

// Direction-aware slide + fade. `dir` is +1 going forward, -1 going back.
export function slideVariants(reduced) {
  const dist = reduced ? 0 : 36;
  return {
    enter: dir => ({ x: dir * dist, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: dir => ({ x: -dir * dist, opacity: 0 }),
  };
}

// Gate-state reducer: returns the previous object when the patch changes nothing,
// so repeated complete()/skip() calls cause no re-render.
export function mergeGate(gates, idx, patch) {
  const prev = gates[idx] || {};
  if (Object.keys(patch).every(k => prev[k] === patch[k])) return gates;
  return { ...gates, [idx]: { ...prev, ...patch } };
}

// The record the player stores when the learner skips a gating screen (footer button or a block's skip()).
export function skipAttempt(step, src, screen, at) {
  return { ok: false, hints: 0, skipped: true, kind: gatingKind(step), ref: { src, screen }, at };
}

// Gate state rebuilt from stored attempts for this screen, so an answered screen stays
// unlocked after a reload. A sql screen needs a right answer, a run or reveal the block
// marked `done` (its gate opens on the first run), or a skip; a calc screen needs a right
// answer or a reveal (`done`), because a wrong check leaves it shut; other kinds count any
// answer, because their gate opens on the first answer.
export function seedGate(step, attempts) {
  if (!isGatingScreen(step) || !Array.isArray(attempts) || attempts.length === 0) return undefined;
  const sql = gatingKind(step) === 'sql' || gatingKind(step) === 'calc';
  if (attempts.some(a => a.skipped)) return { skipped: true };
  // A proof stays locked until its last step is shown: an earlier pick alone does not open the screen.
  const proof = (step.blocks || []).find(b => b.type === 'proof-steps');
  if (proof) return proofDoneFromAttempts(proof, attempts) ? { completed: true } : undefined;
  if (attempts.some(a => (sql ? a.ok === true || a.done === true : true))) return { completed: true };
  return undefined;
}

// Query params after a move to screen n: ?s= changes and ?variant= (set by a review link for one item) is dropped, so it does not
// carry over to the later screens of the lesson.
export function paramsForScreen(prev, n) {
  const p = new URLSearchParams(prev);
  p.set('s', String(n));
  p.delete('variant');
  return p;
}
