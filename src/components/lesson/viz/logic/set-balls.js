import { selectSimple } from './common.js';

const sortStr = (a, b) => (String(a) < String(b) ? -1 : String(a) > String(b) ? 1 : 0);

// Oracle 11g set operators on one column: UNION / INTERSECT / MINUS deduplicate and
// sort; UNION ALL keeps every row in order.
export function setOp(op, L, R) {
  const dist = (xs) => [...new Set(xs)];
  switch (op) {
    case 'UNION ALL': return [...L, ...R];
    case 'UNION': return dist([...L, ...R]).sort(sortStr);
    case 'INTERSECT': return dist(L).filter(x => R.includes(x)).sort(sortStr);
    case 'MINUS': return dist(L).filter(x => !R.includes(x)).sort(sortStr);
    default: throw new Error(`op ${op}`);
  }
}

export function setBalls({ left, right, ops }) {
  const L = selectSimple(left).rows.map(r => r[0]);
  const R = selectSimple(right).rows.map(r => r[0]);
  return { left: L, right: R, results: ops.map(op => ({ op, values: setOp(op, L, R) })), count: ops.length + 1 };
}
