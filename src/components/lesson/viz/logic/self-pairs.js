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

// A row's name in the pair list; two students with the same name (Bodnar) also carry their key, so a pair of
// them never looks like a student paired with himself.
export function rowName(row, rows, key = 'nr_matricol') {
  const twins = rows.filter(r => r.nume === row.nume).length > 1;
  return twins ? `${row.nume} (${row[key]})` : row.nume;
}

// The legend under the grid: each axis key with its name, 111 Popescu · 112 Prelipcean · …
export const axisLegend = (rows, key = 'nr_matricol') => rows.map(r => ({ key: String(r[key]), name: r.nume }));
