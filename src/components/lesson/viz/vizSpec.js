// Shape of a `viz` block, shared by the validator script and the tests (no React).

const isStr = (v) => typeof v === 'string' && v.length > 0;
const isNum = (v) => typeof v === 'number' && Number.isFinite(v);
const isBi = (v) => !!v && typeof v === 'object' && isStr(v.en) && isStr(v.ro);
const isArr = (v) => Array.isArray(v) && v.length > 0;
const strs = (v) => isArr(v) && v.every(isStr);
const oneOf = (...xs) => (v) => xs.includes(v);
const subsetOf = (...xs) => (v) => isArr(v) && v.every(x => xs.includes(x));
const optional = (f) => (v) => v === undefined || f(v);
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const DATETIME = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;

// widget -> { prop: check } (every prop listed is required unless wrapped in optional()).
const SPEC = {
  'table-map': { dataset: isStr, from: (v) => /^\w+\.\w+$/.test(v), to: (v) => /^\w+\.\w+$/.test(v), where: (v) => !!v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length > 0, fromCaption: optional(isBi), question: isBi, answerKey: isStr },
  'table-build': { table: isStr, columns: (v) => isArr(v) && v.every(c => c && isStr(c.name) && isStr(c.type)) },
  'row-insert': { table: isStr, row: (v) => !!v && typeof v === 'object' && Object.keys(v).length > 0, errorCase: optional((v) => !!v && typeof v.row === 'object' && /^ORA-\d{5}$/.test(v.code)) },
  'delete-sweep': { table: isStr, where: optional(isStr) },
  'like-slider': { pattern: isStr, values: strs },
  'in-between': { mode: oneOf('in', 'between', 'any', 'all'), list: optional(isArr), low: optional(isNum), high: optional(isNum), op: optional(oneOf('=', '<>', '<', '>', '<=', '>=')), values: isArr },
  'number-line': { values: (v) => isArr(v) && v.every(isNum), fns: subsetOf('CEIL', 'FLOOR', 'ROUND', 'TRUNC'), digits: optional(isNum) },
  'char-boxes': { value: isStr, width: isNum, ops: subsetOf('LENGTH', 'TRIM', 'LIKE'), likePattern: optional(isStr), column: optional(isStr) },
  'char-strips': { mode: oneOf('pad', 'swap'), input: isStr, fn: optional(oneOf('LPAD', 'RPAD')), len: optional(isNum), fill: optional(isStr), from: optional(isStr), to: optional(isStr) },
  'calendar-clock': { start: (v) => DATETIME.test(v) || DATE.test(v), ops: (v) => isArr(v) && v.every(o => o && ['+', 'ADD_MONTHS', 'LAST_DAY', 'NEXT_DAY', 'TRUNC'].includes(o.fn)) },
  'date-mask': { date: (v) => DATE.test(v), masks: strs },
  'age-timeline': { birth: (v) => DATE.test(v), today: (v) => DATETIME.test(v) },
  'decode-sieve': { expr: isStr, pairs: (v) => isArr(v) && v.every(p => Array.isArray(p) && p.length === 2 && isStr(p[1])), default: optional(isStr), values: isArr },
  'type-pipes': { conversions: (v) => isArr(v) && v.every(c => c && isStr(c.from) && isStr(c.to) && isStr(c.value) && isStr(c.fn) && (c.say === undefined || isBi(c.say))) },
  'cartesian-grid': { left: isStr, right: isStr, on: isStr },
  'join-wires': { left: isStr, right: isStr, on: isStr, kind: oneOf('inner', 'left', 'right', 'full'), filterIn: optional(oneOf('on', 'where')), filter: optional(isStr) },
  'self-pairs': { table: isStr, pairOn: isStr, order: oneOf('<>', '<') },
  'all-vs-some': { studentsFrom: isStr, condition: isStr, showMinusByName: (v) => typeof v === 'boolean' },
  'set-balls': { left: isStr, right: isStr, ops: subsetOf('UNION', 'UNION ALL', 'INTERSECT', 'MINUS') },
};

export const WIDGET_NAMES = Object.keys(SPEC);

// Returns a list of problems; empty means the block is well-formed.
export function validateViz(block) {
  const errs = [];
  if (!isStr(block?.id)) errs.push('viz: id missing');
  if (!WIDGET_NAMES.includes(block?.widget)) {
    errs.push(`viz: widget "${block?.widget}" is not one of ${WIDGET_NAMES.join(', ')}`);
    return errs;
  }
  if (block.predict !== undefined && typeof block.predict !== 'boolean') errs.push('viz: predict must be true or false');
  const props = block.props;
  if (!props || typeof props !== 'object') { errs.push('viz: props missing'); return errs; }
  for (const [key, check] of Object.entries(SPEC[block.widget])) {
    if (!check(props[key])) errs.push(`viz (${block.widget}): props.${key} missing or invalid`);
  }
  const w = block.widget;
  if (w === 'in-between') {
    if (block.props.mode === 'between' && !(isNum(props.low) && isNum(props.high))) errs.push('viz (in-between): between needs props.low and props.high');
    if (block.props.mode !== 'between' && !isArr(props.list)) errs.push('viz (in-between): props.list missing or invalid');
  }
  if (w === 'char-strips') {
    if (props.mode === 'pad' && !(isStr(props.fn) && isNum(props.len))) errs.push('viz (char-strips): pad needs props.fn and props.len (props.fill is optional)');
    if (props.mode === 'swap' && !(isStr(props.from) && isStr(props.to))) errs.push('viz (char-strips): swap needs props.from and props.to');
  }
  if (w === 'char-boxes' && props.ops?.includes('LIKE') && !isStr(props.likePattern)) errs.push('viz (char-boxes): LIKE needs props.likePattern');
  if (w === 'join-wires' && !!props.filter !== !!props.filterIn) errs.push('viz (join-wires): props.filter and props.filterIn go together');
  return errs;
}
