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
