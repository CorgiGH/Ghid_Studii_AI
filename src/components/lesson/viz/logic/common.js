// Shared pure helpers for the visual widgets: LIKE, a tiny WHERE evaluator, a
// tiny single-table SELECT and date helpers. Nothing here touches React or the DOM.
import { FACULTATE } from './facultate.js';

export const DATA = FACULTATE;

export const tr = (o, lang) => (o && typeof o === 'object' ? (o[lang] ?? o.en ?? o.ro ?? '') : (o ?? ''));

// ---------- LIKE (Oracle: case sensitive, _ one char, % any run) ----------

export function likeTokens(pattern) {
  return [...pattern].map(c => (c === '%' ? { kind: 'many', ch: c } : c === '_' ? { kind: 'one', ch: c } : { kind: 'lit', ch: c }));
}

// Walks the pattern over the value. `steps` is the path of the successful match, or (when there is none) the path of
// the first attempt, up to the token that failed, with `ok: false` last.
// A % first tries the longest run that still leaves one letter for each later fixed sign (_ or a letter), so for
// '%escu' the letters «escu» line up with the end of the name: % stands for "any beginning", and a failed name shows
// the ending that differs (Bodnar: % takes «Bo», then «e» meets «d»), not a short % that gives up early.
export function likeTrace(pattern, value) {
  const toks = likeTokens(pattern);
  const v = [...String(value)];
  let first = null;
  const fixedAfter = (ti) => toks.slice(ti + 1).filter(t => t.kind !== 'many').length;
  const go = (ti, vi, steps) => {
    if (ti === toks.length) {
      if (vi === v.length) return steps;
      // every sign used, but letters are left over
      if (!first) first = [...steps, { tok: Math.max(0, toks.length - 1), from: vi, to: v.length, ok: false, leftover: true }];
      return null;
    }
    const tok = toks[ti];
    if (tok.kind === 'many') {
      for (let end = Math.max(vi, v.length - fixedAfter(ti)); end >= vi; end--) {
        const r = go(ti + 1, end, [...steps, { tok: ti, from: vi, to: end, ok: true }]);
        if (r) return r;
      }
      return null;
    }
    const okHere = vi < v.length && (tok.kind === 'one' || v[vi] === tok.ch);
    const step = { tok: ti, from: vi, to: okHere ? vi + 1 : vi, ok: okHere };
    if (!okHere) {
      if (!first) first = [...steps, step];
      return null;
    }
    return go(ti + 1, vi + 1, [...steps, step]);
  };
  const win = go(0, 0, []);
  if (win) return { match: true, steps: win };
  if (first) return { match: false, steps: first };
  // an empty pattern against a non-empty value
  return { match: false, steps: [{ tok: 0, from: 0, to: v.length, ok: false, leftover: true }] };
}

export const likeMatch = (pattern, value) => likeTrace(pattern, value).match;

// ---------- Values ----------

const num = (x) => (typeof x === 'number' ? x : (typeof x === 'string' && x.trim() !== '' && !Number.isNaN(Number(x)) ? Number(x) : null));

// Three-valued comparison: true / false / null (unknown).
export function cmp3(a, op, b) {
  if (a === null || a === undefined || b === null || b === undefined) return null;
  const na = num(a), nb = num(b);
  const [x, y] = na !== null && nb !== null ? [na, nb] : [String(a), String(b)];
  switch (op) {
    case '=': return x === y;
    case '<>': case '!=': case '^=': return x !== y;
    case '<': return x < y;
    case '>': return x > y;
    case '<=': return x <= y;
    case '>=': return x >= y;
    default: throw new Error(`operator ${op}`);
  }
}

const lit = (s) => {
  const t = s.trim();
  if (/^null$/i.test(t)) return null;
  if (t.startsWith("'") && t.endsWith("'")) return t.slice(1, -1).replace(/''/g, "'");
  const n = Number(t);
  if (!Number.isNaN(n) && t !== '') return n;
  throw new Error(`literal ${t}`);
};

// col op literal | col IS [NOT] NULL | col [NOT] LIKE 'x' | col [NOT] IN (...) , joined by AND / OR.
export function evalWhere(where, row) {
  if (!where || !where.trim()) return true;
  const ors = where.split(/\s+OR\s+/i).map(g => g.split(/\s+AND\s+/i));
  let anyUnknown = false;
  for (const ands of ors) {
    let res = true;
    for (const term of ands) {
      const r = evalTerm(term.trim(), row);
      if (r === false) { res = false; break; }
      if (r === null) res = null;
    }
    if (res === true) return true;
    if (res === null) anyUnknown = true;
  }
  return anyUnknown ? null : false;
}

function evalTerm(term, row) {
  let m;
  if ((m = term.match(/^(?:\w+\.)?(\w+)\s+IS\s+(NOT\s+)?NULL$/i))) {
    const v = row[m[1].toLowerCase()];
    const isNull = v === null || v === undefined;
    return m[2] ? !isNull : isNull;
  }
  if ((m = term.match(/^(?:\w+\.)?(\w+)\s+(NOT\s+)?LIKE\s+('.*')$/i))) {
    const v = row[m[1].toLowerCase()];
    if (v === null || v === undefined) return null;
    const r = likeMatch(lit(m[3]), v);
    return m[2] ? !r : r;
  }
  if ((m = term.match(/^(?:\w+\.)?(\w+)\s+(NOT\s+)?IN\s*\((.*)\)$/i))) {
    const v = row[m[1].toLowerCase()];
    let res = false;
    for (const it of m[3].split(',').map(lit)) {
      const c = cmp3(v, '=', it);
      if (c === true) { res = true; break; }
      if (c === null) res = null;
    }
    if (m[2]) return res === null ? null : !res;
    return res;
  }
  if ((m = term.match(/^(?:\w+\.)?(\w+)\s*(<>|!=|\^=|<=|>=|=|<|>)\s*(.+)$/))) {
    return cmp3(row[m[1].toLowerCase()], m[2], lit(m[3]));
  }
  throw new Error(`where ${term}`);
}

// SELECT col[, col] FROM table [WHERE ...]: enough for the set-operator balls.
export function selectSimple(sql, tables = DATA) {
  const m = String(sql).trim().replace(/;$/, '').match(/^SELECT\s+(.+?)\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+))?$/i);
  if (!m) throw new Error(`select ${sql}`);
  const src = tables[m[2].toLowerCase()] || [];
  const cols = m[1] === '*' ? Object.keys(src[0] || {}) : m[1].split(',').map(c => c.trim().toLowerCase());
  const rows = src.filter(r => evalWhere(m[3], r) === true);
  return { columns: cols, rows: rows.map(r => cols.map(c => r[c] ?? null)) };
}

// ---------- Dates ----------

export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const p2 = (n) => String(n).padStart(2, '0');

export function parseDT(s) {
  const m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/);
  if (!m) throw new Error(`date ${s}`);
  return { y: +m[1], mo: +m[2], d: +m[3], h: +(m[4] ?? 0), mi: +(m[5] ?? 0), s: +(m[6] ?? 0), hasTime: m[4] !== undefined };
}

export function fmtDT(o, withTime = o.hasTime) {
  const base = `${String(o.y).padStart(4, '0')}-${p2(o.mo)}-${p2(o.d)}`;
  return withTime ? `${base} ${p2(o.h)}:${p2(o.mi)}` : base;
}

export const toUTC = (o) => Date.UTC(o.y, o.mo - 1, o.d, o.h, o.mi, o.s);
export function fromUTC(ms, hasTime) {
  const d = new Date(ms);
  return { y: d.getUTCFullYear(), mo: d.getUTCMonth() + 1, d: d.getUTCDate(), h: d.getUTCHours(), mi: d.getUTCMinutes(), s: d.getUTCSeconds(), hasTime };
}
export const daysInMonth = (y, mo) => new Date(Date.UTC(y, mo, 0)).getUTCDate();
export const weekday = (o) => new Date(Date.UTC(o.y, o.mo - 1, o.d)).getUTCDay(); // 0 = Sunday
export const dayOfYear = (o) => Math.round((Date.UTC(o.y, o.mo - 1, o.d) - Date.UTC(o.y, 0, 1)) / 86400000) + 1;

// ---------- Join conditions ----------

// "a.x = b.y [AND c.u = d.v]" -> [{lt, lc, rt, rc}]
export function parseOn(on) {
  return on.split(/\s+AND\s+/i).map(term => {
    const m = term.trim().match(/^(\w+)\.(\w+)\s*=\s*(\w+)\.(\w+)$/);
    if (!m) throw new Error(`on ${term}`);
    return { lt: m[1].toLowerCase(), lc: m[2].toLowerCase(), rt: m[3].toLowerCase(), rc: m[4].toLowerCase() };
  });
}

// lrow belongs to `left`, rrow to `right`; either may be null (an outer join's NULL side).
export function onMatches(terms, left, right, lrow, rrow) {
  if (!lrow || !rrow) return false;
  return terms.every(t => {
    const a = t.lt === left ? lrow[t.lc] : t.lt === right ? rrow[t.lc] : undefined;
    const b = t.rt === right ? rrow[t.rc] : t.rt === left ? lrow[t.rc] : undefined;
    return cmp3(a, '=', b) === true;
  });
}

// A WHERE term on a joined pair: "note.valoare = 10" picks the right-hand row, an
// unqualified column looks in both.
export function evalOnPair(filter, left, right, lrow, rrow) {
  const q = filter.match(/^\s*(\w+)\./);
  const row = q ? (q[1].toLowerCase() === right ? (rrow || {}) : (lrow || {})) : { ...(lrow || {}), ...(rrow || {}) };
  return evalWhere(filter, row);
}
