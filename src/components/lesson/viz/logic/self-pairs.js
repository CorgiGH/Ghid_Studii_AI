import { DATA } from './common.js';

// Supports a bare column or TO_CHAR(col, 'D') (Sunday = 1 under NLS AMERICAN).
export function pairKey(expr, row) {
  const m = expr.trim().match(/^TO_CHAR\(\s*(\w+)\s*,\s*'D'\s*\)$/i);
  if (m) {
    const v = row[m[1].toLowerCase()];
    if (!v) return null;
    const [y, mo, d] = v.split('-').map(Number);
    return String(new Date(Date.UTC(y, mo - 1, d)).getUTCDay() + 1);
  }
  if (/^\w+$/.test(expr.trim())) return row[expr.trim().toLowerCase()] ?? null;
  throw new Error(`pairOn ${expr}`);
}

export function selfPairs({ table, pairOn, order, key = 'nr_matricol' }) {
  const rows = DATA[table] || [];
  const keys = rows.map(r => pairKey(pairOn, r));
  const pairs = [];
  const cells = rows.map((a, i) => rows.map((b, j) => {
    if (i === j) return 'self';
    if (order === '<' && !(a[key] < b[key])) return 'skipped';
    const same = keys[i] !== null && keys[i] === keys[j];
    if (same) pairs.push({ a, b, i, j });
    return same ? 'same' : 'diff';
  }));
  return { rows, keys, cells, pairs, key, count: order === '<' ? 4 : 3 };
}
