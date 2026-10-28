// Pure helpers for the review pile (Recapitulare): which items are due, how they are
// grouped, and which question a pending multiple-choice, proof-step or calculation item comes back as.
import { withVariant } from '../components/lesson/blocks/calcSpec.js';
import { stepItem } from '../components/lesson/blocks/proofSpec.js';

const DAY = 24 * 60 * 60 * 1000;

// Whole local calendar days from `now` to `due` (0 = the same local day, 1 = the next one);
// never negative. Counted on local dates, so a daylight-saving change cannot shift the count.
export function calendarDaysUntil(due, now) {
  const a = new Date(now);
  const b = new Date(due);
  const day = (d) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.max(0, Math.round((day(b) - day(a)) / DAY));
}

// When an item comes back, by local calendar day: today / tomorrow / in N days.
export function dueLabel(due, now, lang = 'ro') {
  const days = due <= now ? 0 : calendarDaysUntil(due, now);
  if (days === 0) return lang === 'ro' ? 'azi' : 'today';
  if (days === 1) return lang === 'ro' ? 'mâine' : 'tomorrow';
  return lang === 'ro' ? `în ${days} zile` : `in ${days} days`;
}

// True when a right answer on `item` is only practice: it is not due yet, so the schedule stays.
export function isPracticeOnly(item, now) {
  return !!item && item.due > now;
}

// Groups pending items by lesson file. Groups with something due come first; inside a
// group, due items come first. `items` arrive sorted by due date.
export function groupReview(items, now) {
  const groups = new Map();
  for (const it of items) {
    const key = it.ref?.src || '';
    if (!groups.has(key)) groups.set(key, { src: key, items: [] });
    groups.get(key).items.push({ ...it, isDue: it.due <= now });
  }
  const list = [...groups.values()].map(g => ({
    ...g,
    dueCount: g.items.filter(i => i.isDue).length,
    firstDue: g.items[0].due,
  }));
  list.sort((a, b) => (b.dueCount > 0) - (a.dueCount > 0) || a.firstDue - b.firstDue);
  return list;
}

// Position (0-based) of the furthest lesson the learner has opened, or -1 when none.
// `srcs` is the course order; `visited(src)` says whether a lesson has been opened.
export function furthestVisited(srcs, visited) {
  let far = -1;
  srcs.forEach((src, i) => { if (visited(src)) far = i; });
  return far;
}

// Every mcq in the given lessons: [{ id, block, src, screen, lesson }]; `lesson` is the
// lesson's place in the course order (its `index` when given, else its place in the list).
export function collectMcqPool(lessons) {
  const pool = [];
  for (const [at, { src, course, index }] of lessons.entries()) {
    const lesson = Number.isInteger(index) ? index : at;
    (course?.steps || []).forEach((step, i) => {
      for (const block of step.blocks || []) {
        if (block.type === 'mcq' && block.id) pool.push({ id: block.id, block, src, screen: i + 1, lesson });
      }
    });
  }
  return pool;
}

export function shuffled(arr, rand = Math.random) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// The trap an item is about: the tag stored when it was missed, else the first wrong option's tag.
export function itemTag(item, original) {
  if (item?.tag) return item.tag;
  return original?.options?.find(o => !o.correct && o.misconception)?.misconception || null;
}

// Another mcq with the same trap tag, not the item itself and not one in `avoid`. It prefers
// lessons up to `upTo` (the furthest lesson the learner has opened) and only then widens to all
// lessons; inside each tier it falls back to the avoided ones, and finally to the same item
// with its options reshuffled.
// Returns { block, entry, reshuffled } or null when the original is gone and nothing else fits.
export function pickVariant(item, pool, { rand = Math.random, avoid = [], upTo = Infinity } = {}) {
  const original = pool.find(p => p.id === item.itemId) || null;
  const tag = itemTag(item, original?.block);
  const same = tag
    ? pool.filter(p => p.id !== item.itemId && p.block.options.some(o => o.misconception === tag))
    : [];
  const within = same.filter(p => !(p.lesson > upTo));
  const unseen = (list) => list.filter(p => !avoid.includes(p.id));
  const from = [unseen(within), within, unseen(same), same].find(list => list.length) || [];
  if (from.length) {
    const entry = from[Math.floor(rand() * from.length)];
    return { block: entry.block, entry, reshuffled: false };
  }
  if (!original) return null;
  return { block: { ...original.block, options: shuffled(original.block.options, rand) }, entry: original, reshuffled: true };
}

// Every prediction inside a proof-steps block, as the question a missed pick comes back as: [{ id, block, src, screen, lesson }]
// (same shape as collectMcqPool; `id` is the stored item, stepItem(proof id, k)). The question means nothing without the proof
// around it, so the block carries the claim, the given, the table and the steps before it ({ shown, why }), never the step asked.
export function collectProofPool(lessons) {
  const pool = [];
  for (const [at, { src, course, index }] of lessons.entries()) {
    const lesson = Number.isInteger(index) ? index : at;
    (course?.steps || []).forEach((step, i) => {
      for (const block of step.blocks || []) {
        if (block.type !== 'proof-steps' || !block.id || !Array.isArray(block.steps)) continue;
        block.steps.forEach((s, k) => {
          if (!s?.predict) return;
          const id = stepItem(block.id, k);
          pool.push({
            id, src, screen: i + 1, lesson,
            block: {
              type: 'proof-step', id, claim: block.claim, given: block.given, table: block.table,
              before: block.steps.slice(0, k).map(({ shown, why }) => ({ shown, why })),
              question: s.predict.question, options: s.predict.options,
            },
          });
        });
      }
    });
  }
  return pool;
}

// Every calc-exercise in the given lessons: [{ id, block, src, screen, lesson }] (same shape as collectMcqPool).
export function collectCalcPool(lessons) {
  const pool = [];
  for (const [at, { src, course, index }] of lessons.entries()) {
    const lesson = Number.isInteger(index) ? index : at;
    (course?.steps || []).forEach((step, i) => {
      for (const block of step.blocks || []) {
        if (block.type === 'calc-exercise' && block.id) pool.push({ id: block.id, block, src, screen: i + 1, lesson });
      }
    });
  }
  return pool;
}

// The calc-exercise a pending item comes back as: the same exercise with one of its `variants` swapped in (new numbers, never the
// original's). `avoid` lists the variant indexes already shown for this item; when all have been shown it starts over, without
// repeating the one just shown when there is another. Returns { block, entry, variant } or null when the exercise is gone or has
// no variant.
export function pickCalcVariant(item, pool, { avoid = [], rand = Math.random } = {}) {
  const entry = pool.find((p) => p.id === item?.itemId);
  const variants = entry?.block.variants;
  if (!Array.isArray(variants) || !variants.length) return null;
  const all = variants.map((_, i) => i);
  const fresh = all.filter((i) => !avoid.includes(i));
  const rest = all.filter((i) => i !== avoid[avoid.length - 1]);
  const from = [fresh, rest, all].find((list) => list.length) || all;
  const variant = from[Math.floor(rand() * from.length)];
  return { block: withVariant(entry.block, variants[variant]), entry, variant };
}

// A review answer given to an item: the schedule moves (markReview) and the result says what the learner is told.
// { ok, practice (a right answer on an item not yet due changes nothing), gone (the item left the pile), due (when it comes back), at }
export function applyReviewAnswer(store, itemId, ok, at) {
  const before = store.pendingReview(at).find((i) => i.itemId === itemId);
  const practice = ok && isPracticeOnly(before, at);
  store.markReview(itemId, ok, at);
  const left = store.pendingReview(at).find((i) => i.itemId === itemId);
  return { ok, practice, gone: !left, due: left?.due ?? null, at };
}
