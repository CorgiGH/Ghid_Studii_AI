// SQL a widget asks the engine for, so values that depend on Oracle come from the
// engine and not from the props. Each builder returns strings (or null = nothing to ask).
import { opLabel } from './calendar-clock.js';

const q = (s) => `'${String(s).replace(/'/g, "''")}'`;

export function firstCell(result) {
  if (!result || result.error || !result.rows || !result.rows.length) return undefined;
  const v = result.rows[0][0];
  return v === null || v === undefined ? null : String(v);
}

const dateExpr = (s) => (s.length > 10 ? `TO_DATE(${q(s)}, 'YYYY-MM-DD HH24:MI')` : `TO_DATE(${q(s)}, 'YYYY-MM-DD')`);

function opExpr(expr, { fn, arg }) {
  switch (fn) {
    case '+': return `(${expr} + ${arg})`;
    case 'ADD_MONTHS': return `ADD_MONTHS(${expr}, ${arg})`;
    case 'LAST_DAY': return `LAST_DAY(${expr})`;
    case 'NEXT_DAY': return `NEXT_DAY(${expr}, ${q(arg)})`;
    case 'TRUNC': return arg === undefined || arg === null ? `TRUNC(${expr})` : `TRUNC(${expr}, ${q(arg)})`;
    default: return expr;
  }
}

export function calendarSql({ start, ops }) {
  const fmt = start.length > 10 ? 'YYYY-MM-DD HH24:MI' : 'YYYY-MM-DD';
  const out = [];
  let expr = dateExpr(start);
  out.push(`SELECT TO_CHAR(${expr}, '${fmt}') FROM dual`);
  for (const op of ops) {
    expr = opExpr(expr, op);
    out.push(`SELECT TO_CHAR(${expr}, 'YYYY-MM-DD HH24:MI') FROM dual`);
  }
  return out;
}
export { opLabel };

export const dateMaskSql = ({ date, masks }) => masks.map(m => `SELECT TO_CHAR(${dateExpr(date)}, ${q(m)}) FROM dual`);

export const ageSql = ({ birth, today }) => [`SELECT MONTHS_BETWEEN(${dateExpr(today)}, ${dateExpr(birth)}) FROM dual`];

export function charStripsSql(p) {
  if (p.mode === 'swap') return [`SELECT TRANSLATE(${q(p.input)}, ${q(p.from)}, ${q(p.to)}) FROM dual`];
  return [`SELECT ${p.fn}(${q(p.input)}, ${p.len}${p.fill === undefined ? '' : `, ${q(p.fill)}`}) FROM dual`];
}

export const numberLineSql = ({ values, fns, digits = 0 }) => values.flatMap(v => fns.map(fn => `SELECT ${fn}(${v}${fn === 'CEIL' || fn === 'FLOOR' ? '' : `, ${digits}`}) FROM dual`));

export const decodeSql = ({ pairs, default: dflt, values }) => values.map(v => {
  const lit = (x) => (x === null ? 'NULL' : typeof x === 'number' ? String(x) : q(x));
  const args = pairs.flatMap(([s, r]) => [lit(s), q(r)]).concat(dflt !== undefined ? [q(dflt)] : []);
  return `SELECT DECODE(${lit(v)}, ${args.join(', ')}) FROM dual`;
});

export function typePipesSql({ conversions }) {
  return conversions.map(c => (/[A-Za-z_]\w*/.test(c.fn.replace(/'[^']*'/g, '')) ? null : `SELECT ${c.fn} FROM dual`));
}

export const cartesianSql = ({ left, right, on }) => [`SELECT COUNT(*) FROM ${left}, ${right}`, `SELECT COUNT(*) FROM ${left}, ${right} WHERE ${on}`];

export function joinSql({ left, right, on, kind, filterIn, filter }) {
  const jt = { inner: 'INNER JOIN', left: 'LEFT JOIN', right: 'RIGHT JOIN', full: 'FULL OUTER JOIN' }[kind];
  const onPart = filter && filterIn === 'on' ? `${on} AND ${filter}` : on;
  const where = filter && filterIn === 'where' ? ` WHERE ${filter}` : '';
  return [`SELECT COUNT(*) FROM ${left} ${jt} ${right} ON ${onPart}${where}`];
}

export const selfPairsSql = ({ table, pairOn, order }) => {
  const side = (alias) => (/^\w+$/.test(pairOn.trim()) ? `${alias}.${pairOn.trim()}` : pairOn.replace(/(\(\s*)(\w+)/, `$1${alias}.$2`));
  return [`SELECT COUNT(*) FROM ${table} a, ${table} b WHERE ${side('a')} = ${side('b')} AND a.nr_matricol ${order} b.nr_matricol`];
};

export const setBallsSql = ({ left, right, ops }) => ops.map(op => `SELECT COUNT(*) FROM (${left} ${op} ${right})`);
