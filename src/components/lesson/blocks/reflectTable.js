// Offline fallback for the small table a reflect block shows: plain
// SELECT cols|* FROM table [WHERE ...] [ORDER BY col [DESC], ...] over the lab dataset.
// Anything fancier (joins, functions, DUAL) returns null and the table is left out
// unless the SQL engine can run it.
import { DATA, evalWhere } from '../viz/logic/common.js';
import { formatDate } from '../viz/logic/date-mask.js';

const cmpVal = (a, b) => {
  if (a === b) return 0;
  if (a === null || a === undefined) return 1; // NULLs sort last in ascending order
  if (b === null || b === undefined) return -1;
  return a < b ? -1 : 1;
};

// Oracle's default date display (NLS_DATE_FORMAT DD-MON-RR), the same formatter the widgets use.
const oracleCell = (v) => (
  typeof v === 'string' && /^\d{4}-\d{2}-\d{2}(?:[T ].*)?$/.test(v) ? formatDate(v.slice(0, 10), 'DD-MON-RR').text : v
);

export function fallbackTable(sql, tables = DATA) {
  try {
    const m = String(sql).trim().replace(/;$/, '')
      .match(/^SELECT\s+(.+?)\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+?))?(?:\s+ORDER\s+BY\s+(.+))?$/i);
    if (!m || /[()]/.test(m[1]) || /\bAS\b/i.test(m[1])) return null;
    const src = tables[m[2].toLowerCase()];
    if (!src || !src.length) return null;
    const cols = m[1].trim() === '*' ? Object.keys(src[0]) : m[1].split(',').map(c => c.trim().toLowerCase());
    if (cols.some(c => !(c in src[0]))) return null;
    let rows = src.filter(r => evalWhere(m[3], r) === true);
    if (m[4]) {
      const keys = m[4].split(',').map(k => {
        const [col, dir] = k.trim().split(/\s+/);
        return { col: col.toLowerCase(), sign: /^desc$/i.test(dir || '') ? -1 : 1 };
      });
      if (keys.some(k => !(k.col in src[0]))) return null;
      rows = [...rows].sort((x, y) => {
        for (const k of keys) { const c = cmpVal(x[k.col], y[k.col]) * k.sign; if (c) return c; }
        return 0;
      });
    }
    const head = cols.map(c => c.toUpperCase());
    return { columns: head, rows: rows.map(r => Object.fromEntries(cols.map((c, i) => [head[i], oracleCell(r[c] ?? null)]))) };
  } catch {
    return null;
  }
}

// Engine result ({ columns, rows: [[...]] }) -> MiniTable shape.
export function tableFromResult(res) {
  if (!res || res.error || !Array.isArray(res.columns) || !res.columns.length) return null;
  return { columns: res.columns, rows: (res.rows || []).map(r => Object.fromEntries(res.columns.map((c, i) => [c, r[i] ?? null]))) };
}

// Which table a reflect block shows: the engine's when it answered, the plain fallback when the
// engine is unavailable or failed, nothing while it is still loading.
export function pickReflectTable({ fromEngine, unavailable, sql }) {
  return fromEngine || (unavailable ? fallbackTable(sql) : null);
}
