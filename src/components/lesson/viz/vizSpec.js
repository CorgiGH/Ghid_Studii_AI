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

// ML widgets: a static table is { columns: [string | {en, ro}], rows: [[cell]] } (optional ignore, domains)
const isLabel = (v) => isStr(v) || isNum(v) || typeof v === 'boolean';
const isName = (v) => isStr(v) || isBi(v);
const isMlTable = (v) => !!v && Array.isArray(v.columns) && v.columns.length > 0 && v.columns.every(isName)
  && Array.isArray(v.rows) && v.rows.length > 0 && v.rows.every((r) => Array.isArray(r) && r.length === v.columns.length);
const isCounts = (v) => Array.isArray(v) && v.length >= 2 && v.every((x) => isNum(x) && x >= 0);
const isStump = (v) => !!v && isName(v.name) && Array.isArray(v.branches) && v.branches.length >= 2 && v.branches.every((b) => b && isCounts(b.counts));
const isStumpsGiven = (v) => !!v && isCounts(v.root) && Array.isArray(v.stumps) && v.stumps.length > 0 && v.stumps.every((s) => isStump(s) && s.branches.every((b) => b.counts.length === v.root.length));
const isCompareCase = (c) => !!c && ((Array.isArray(c.nodes) && c.nodes.length === 2 && c.nodes.every((n) => isCounts(n) && n.length === 2))
  || (Array.isArray(c.stumps) && c.stumps.length === 2 && c.stumps.every(isStump)));
const isCompareCases = (v) => isArr(v) && v.every(isCompareCase);
// a tree: a leaf { leaf } or a test { attr, kids: { value: tree } }
const isTree = (t) => !!t && typeof t === 'object' && (Object.prototype.hasOwnProperty.call(t, 'leaf')
  ? isLabel(t.leaf)
  : isStr(t.attr) && !!t.kids && typeof t.kids === 'object' && Object.keys(t.kids).length >= 2 && Object.values(t.kids).every(isTree));

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
  'ml-id3-builder': { mode: oneOf('stumps', 'compare', 'full'), table: optional(isMlTable), target: optional(isStr), given: optional(isStumpsGiven), cases: optional(isCompareCases), positive: optional(isLabel), showValues: optional((v) => typeof v === 'boolean') },
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
  if (w === 'ml-id3-builder') {
    if (props.mode === 'compare') {
      if (!isCompareCases(props.cases)) errs.push('viz (ml-id3-builder): compare needs props.cases, each with nodes (two [pos, neg] pairs) or stumps (two with branches)');
    } else if (props.mode === 'stumps' && props.given !== undefined) {
      if (!isStumpsGiven(props.given)) errs.push('viz (ml-id3-builder): props.given needs root counts and stumps whose branch counts match');
    } else if (!(isMlTable(props.table) && isStr(props.target) && props.table.columns.some((c) => (c.en ?? c) === props.target))) {
      errs.push('viz (ml-id3-builder): this mode needs props.table and props.target (a column of the table)');
    }
  }
  if (w === 'ml-tree-pair' && props.table !== undefined && !(isMlTable(props.table) && isStr(props.target))) errs.push('viz (ml-tree-pair): props.table goes with props.target');
  if (w === 'ml-dup-counter') {
    if (isMlTable(props.table) && !props.table.columns.some((c) => (c.en ?? c) === props.target)) errs.push('viz (ml-dup-counter): props.target is not a column of the table');
    if (isMlTable(props.table) && Array.isArray(props.added) && !props.added.every((r) => Array.isArray(r) && r.length === props.table.columns.length)) errs.push('viz (ml-dup-counter): every added row needs one cell per column');
  }
  return errs;
}
