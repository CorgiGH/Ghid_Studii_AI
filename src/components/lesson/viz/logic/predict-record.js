// The record a viz predict screen leaves once the learner has revealed or picked: one `kind: 'predict'` attempt per lesson
// screen, so seedGate re-opens the screen after a reload. A prediction is a warm-up, not a graded answer (ok: true, no
// hints), so it never joins the review pile. Outside a lesson screen (no ref, as in the widget gallery) nothing is stored.
export const vizItemId = (ref) => `viz:${ref.src}#${ref.screen}`;

// Returns true when it stored the attempt, false when there was nothing to do.
export function recordVizPredict(store, ref, at) {
  if (!store || !ref) return false;
  const item = vizItemId(ref);
  if (store.attemptsAt(ref.src, ref.screen).some((a) => a && a.kind === 'predict' && a.item === item)) return false;
  store.recordAttempt(item, { ok: true, hints: 0, kind: 'predict', item, ref, at });
  return true;
}
