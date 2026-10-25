import { DATA, parseOn, onMatches } from './common.js';

export function cartesianGrid({ left, right, on }) {
  const terms = parseOn(on);
  const L = DATA[left] || [], R = DATA[right] || [];
  const hit = L.map(l => R.map(r => onMatches(terms, left, right, l, r)));
  return { leftRows: L, rightRows: R, rows: L.length, cols: R.length, total: L.length * R.length, hit, matches: hit.flat().filter(Boolean).length, count: 3 };
}
