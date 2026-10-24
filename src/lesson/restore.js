// Rebuild what a question block showed from the attempts stored for its screen, so a reload
// or Back shows the learner's answer again instead of an unanswered question. Pure, no React.

const forItem = (attempts, id, kind) =>
  (Array.isArray(attempts) ? attempts : []).filter(a => a && a.item === id && a.kind === kind);

// Index of the option the learner chose, or null when this question has no usable record.
export function restoredMcqPick(attempts, id, optionCount) {
  const list = forItem(attempts, id, 'mcq');
  for (let i = list.length - 1; i >= 0; i -= 1) {
    const n = list[i].option;
    if (Number.isInteger(n) && n >= 0 && n < optionCount) return n;
  }
  return null;
}

// { text } when the learner already revealed this reflect answer, else null.
export function restoredReflect(attempts, id) {
  const list = forItem(attempts, id, 'reflect');
  if (list.length === 0) return null;
  const last = list[list.length - 1];
  return { text: typeof last.text === 'string' ? last.text : '' };
}

export const REFLECT_TEXT_MAX = 600;

// Whether a block that was restored from a stored attempt may record a new one. A restored
// question is final: recording again would reset the review schedule it already earned.
export function shouldRecordAttempt({ record = true, ref, restored = false }) {
  return !!record && !!ref && !restored;
}
