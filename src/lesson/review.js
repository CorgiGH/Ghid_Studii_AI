// Pure helpers for the review pile (Recapitulare): which items are due, how they are
// grouped, and which question a pending multiple-choice item comes back as.
const DAY = 24 * 60 * 60 * 1000;

export function dueLabel(due, now, lang = 'ro') {
  if (due <= now) return lang === 'ro' ? 'acum' : 'now';
  const days = Math.ceil((due - now) / DAY);
  if (days <= 1) return lang === 'ro' ? 'mâine' : 'tomorrow';
  return lang === 'ro' ? `în ${days} zile` : `in ${days} days`;
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

// Every mcq in the given lessons: [{ id, block, src, screen }].
export function collectMcqPool(lessons) {
  const pool = [];
  for (const { src, course } of lessons) {
    (course?.steps || []).forEach((step, i) => {
      for (const block of step.blocks || []) {
        if (block.type === 'mcq' && block.id) pool.push({ id: block.id, block, src, screen: i + 1 });
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

// Another mcq with the same trap tag, from any lesson, not the item itself and not one in `avoid`
// (falls back to the avoided ones, then to the same item with its options reshuffled).
// Returns { block, entry, reshuffled } or null when the original is gone and nothing else fits.
export function pickVariant(item, pool, { rand = Math.random, avoid = [] } = {}) {
  const original = pool.find(p => p.id === item.itemId) || null;
  const tag = itemTag(item, original?.block);
  const same = tag
    ? pool.filter(p => p.id !== item.itemId && p.block.options.some(o => o.misconception === tag))
    : [];
  const fresh = same.filter(p => !avoid.includes(p.id));
  const from = fresh.length ? fresh : same;
  if (from.length) {
    const entry = from[Math.floor(rand() * from.length)];
    return { block: entry.block, entry, reshuffled: false };
  }
  if (!original) return null;
  return { block: { ...original.block, options: shuffled(original.block.options, rand) }, entry: original, reshuffled: true };
}
