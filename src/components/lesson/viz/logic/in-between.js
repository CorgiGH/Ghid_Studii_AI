import { cmp3 } from './common.js';

// IN / BETWEEN / op ANY / op ALL on one value, with the comparison behind each verdict.
export function inBetween(mode, { list = [], low, high, op = '=' } = {}, value) {
  if (mode === 'between') {
    const a = cmp3(value, '>=', low), b = cmp3(value, '<=', high);
    const result = a === false || b === false ? false : (a === null || b === null ? null : true);
    return { result, checks: [{ against: low, op: '>=', outcome: a }, { against: high, op: '<=', outcome: b }] };
  }
  const o = mode === 'in' ? '=' : op;
  const checks = list.map(x => ({ against: x, op: o, outcome: cmp3(value, o, x) }));
  const combine = mode === 'all' ? 'and' : 'or';
  let result;
  if (combine === 'or') {
    result = checks.some(c => c.outcome === true) ? true : (checks.some(c => c.outcome === null) ? null : false);
  } else {
    result = checks.some(c => c.outcome === false) ? false : (checks.some(c => c.outcome === null) ? null : true);
  }
  return { result, checks, combine };
}

// A value as SQL writes it: 'Radu', 450, NULL.
export const sqlLit = (v) => (v === null || v === undefined ? 'NULL' : typeof v === 'number' ? String(v) : `'${String(v).replace(/'/g, "''")}'`);

// The whole condition for one value, as valid SQL: 'Bogdan' IN ('Andrei', 'Radu', 'Marius'), 450 >= 250 AND 450 <= 350.
export function inCondition(mode, { list = [], low, high, op = '=' } = {}, value) {
  const v = sqlLit(value);
  if (mode === 'between') return `${v} >= ${low} AND ${v} <= ${high}`;
  const items = `(${list.map(sqlLit).join(', ')})`;
  if (mode === 'in') return `${v} IN ${items}`;
  return `${v} ${op} ${mode === 'all' ? 'ALL' : 'ANY'} ${items}`;
}

// What the step for one value says: the comparison that decided it, as the drawers or the ruler show it.
export function inCaption(mode, props, value, r) {
  const v = sqlLit(value);
  if (value === null || value === undefined) {
    return {
      en: 'NULL: a comparison with NULL is never true and never false. It is unknown, so the row is not selected.',
      ro: 'NULL: o comparație cu NULL nu e nici adevărată, nici falsă. E necunoscută, deci rândul nu este ales.',
    };
  }
  if (mode === 'between') {
    if (r.result) return { en: `${v} is between ${props.low} and ${props.high} (the ends count): true, the row is selected.`, ro: `${v} e între ${props.low} și ${props.high} (capetele contează): adevărat, rândul e ales.` };
    const below = value < props.low;
    return below
      ? { en: `${v} is below ${props.low}: false, the row is not selected.`, ro: `${v} e sub ${props.low}: fals, rândul nu e ales.` }
      : { en: `${v} is above ${props.high}: false, the row is not selected.`, ro: `${v} e peste ${props.high}: fals, rândul nu e ales.` };
  }
  if (mode === 'in') {
    const hit = r.checks.find(c => c.outcome === true);
    return hit
      ? { en: `${v} = ${sqlLit(hit.against)}: one equal value is enough. True, the row is selected.`, ro: `${v} = ${sqlLit(hit.against)}: ajunge o valoare egală. Adevărat, rândul e ales.` }
      : { en: `${v} equals none of the ${props.list.length} values: false, the row is not selected.`, ro: `${v} nu e egal cu niciuna dintre cele ${props.list.length} valori: fals, rândul nu e ales.` };
  }
  return r.result
    ? { en: `${v}: selected.`, ro: `${v}: ales.` }
    : { en: `${v}: not selected.`, ro: `${v}: nu e ales.` };
}
