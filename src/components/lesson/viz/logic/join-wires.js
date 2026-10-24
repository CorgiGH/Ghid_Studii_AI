import { DATA, parseOn, onMatches, evalOnPair } from './common.js';

export function joinRows({ left, right, on, kind = 'inner', filterIn, filter }) {
  const terms = parseOn(on);
  const L = DATA[left] || [], R = DATA[right] || [];
  const keepR = (l, r) => (filter && filterIn === 'on' ? evalOnPair(filter, left, right, l, r) === true : true);
  const groups = [];
  const matchedRight = new Set();
  L.forEach((l, li) => {
    const matches = R.map((r, ri) => ({ r, ri })).filter(({ r }) => onMatches(terms, left, right, l, r) && keepR(l, r));
    matches.forEach(m => matchedRight.add(m.ri));
    // candidates the ON equality found but the ON filter then refused (for display)
    const refused = filter && filterIn === 'on'
      ? R.map((r, ri) => ({ r, ri })).filter(({ r }) => onMatches(terms, left, right, l, r) && !keepR(l, r))
      : [];
    const pairs = matches.map(({ r, ri }) => ({ left: l, right: r, li, ri }));
    if (!pairs.length && (kind === 'left' || kind === 'full')) pairs.push({ left: l, right: null, li, ri: -1 });
    groups.push({ li, left: l, pairs, refused });
  });
  const tail = [];
  if (kind === 'right' || kind === 'full') {
    R.forEach((r, ri) => { if (!matchedRight.has(ri)) tail.push({ left: null, right: r, li: -1, ri }); });
  }
  const pairs = groups.flatMap(g => g.pairs).concat(tail);
  for (const p of pairs) {
    p.kept = filter && filterIn === 'where' ? evalOnPair(filter, left, right, p.left, p.right) === true : true;
  }
  const stages = [{ kind: 'setup' }, ...groups.map((_, i) => ({ kind: 'left', index: i }))];
  if (tail.length) stages.push({ kind: 'tail' });
  if (filter && filterIn === 'where') stages.push({ kind: 'where' });
  return { leftRows: L, rightRows: R, groups, tail, pairs, kept: pairs.filter(p => p.kept).length, stages, count: stages.length };
}
