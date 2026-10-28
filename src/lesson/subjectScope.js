// The lesson store is shared by every lesson-player subject, so Review and its badge filter by subject.
// A review item belongs to the subject whose course file it points at: ref.src is "<slug>/courses/lesson-NN.json".

export function inSubject(item, slug) {
  const src = item?.ref?.src;
  return typeof src === 'string' && src.startsWith(`${slug}/`);
}

// Items waiting for review in one subject, soonest first (the store's own order).
export function pendingReviewFor(store, slug, now) {
  return store.pendingReview(now).filter((i) => inSubject(i, slug));
}

// Items of one subject that are due now (the Recapitulare badge).
export function dueCountFor(store, slug, now) {
  return pendingReviewFor(store, slug, now).filter((i) => i.due <= now).length;
}
