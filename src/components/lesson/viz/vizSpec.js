// Shape of a `viz` block, shared by the validator script and the tests (no React).
import { omegaProblems } from './logic/ml/omega.js';
import { freqTreeProblems } from './logic/ml/freqTree.js';
import { indepProblems } from './logic/ml/indep2x2.js';
import { pmfCdf } from './logic/ml/pmf-cdf.js';
import { jointTable } from './logic/ml/joint-table.js';
import { entropyBars } from './logic/ml/entropy-bars.js';

const isStr = (v) => typeof v === 'string' && v.length > 0;
const isNum = (v) => typeof v === 'number' && Number.isFinite(v);
const isBi = (v) => !!v && typeof v === 'object' && isStr(v.en) && isStr(v.ro);
const isArr = (v) => Array.isArray(v) && v.length > 0;
const strs = (v) => isArr(v) && v.every(isStr);
const oneOf = (...xs) => (v) => xs.includes(v);
const subsetOf = (...xs) => (v) => isArr(v) && v.every(x => xs.includes(x));
const optional = (f) => (v) => v === undefined || f(v);
const isProb = (v) => typeof v === 'number' || (typeof v === 'string' && /^-?\d+(\.\d+)?(\/\d+)?$/.test(v));
const probList = (v) => isArr(v) && v.every(isProb);
const isTable = (v) => !!v && typeof v === 'object' && isArr(v.columns) && isArr(v.rows);
const colName = (c) => (typeof c === 'string' ? c : c?.en);
const isTbl = (v) => !!v && typeof v === 'object' && Array.isArray(v.columns) && v.columns.length > 0 && Array.isArray(v.rows) && v.rows.length > 0 && v.rows.every(r => Array.isArray(r) && r.length === v.columns.length);
const isPlane = (v) => !!v && typeof v === 'object' && isStr(v.x) && isStr(v.y);
// a tree of the ml-prune widget: { attr, ig?, kids: { value: node } } with { leaf } at the ends
const isPruneNode = (n) => !!n && typeof n === 'object' && (n.leaf !== undefined || (isStr(n.attr) && (n.ig === undefined || isNum(n.ig)) && !!n.kids && typeof n.kids === 'object' && Object.keys(n.kids).length > 0 && Object.values(n.kids).every(isPruneNode)));
const pruneTests = (n) => (n.leaf !== undefined ? [] : [n, ...Object.values(n.kids).flatMap(pruneTests)]);
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
  'ml-omega': { outcomes: (v) => isArr(v) && v.every((x) => isStr(x) || isNum(x)), events: (v) => !!v && typeof v === 'object' && Array.isArray(v.A) && Array.isArray(v.B), restrictTo: optional(oneOf('A', 'B')) },
  'ml-freq-tree': { population: isNum, prior: isNum, sens: isNum, fpr: isNum, labels: (v) => !!v && typeof v === 'object' },
  'ml-indep-2x2': { counts: (v) => Array.isArray(v) && v.length === 2 && v.every((r) => Array.isArray(r) && r.length === 2 && r.every(isNum)), labels: (v) => !!v && typeof v === 'object' },
  'set-balls': { left: isStr, right: isStr, ops: subsetOf('UNION', 'UNION ALL', 'INTERSECT', 'MINUS') },
  'ml-pmf-cdf': { values: (v) => isArr(v) && v.every(isNum), probs: probList, name: optional(isStr), format: optional(oneOf('fraction', 'decimal')), cdfAt: optional(isNum), second: optional((v) => !!v && typeof v === 'object' && isArr(v.values) && v.values.every(isNum) && probList(v.probs) && (v.name === undefined || isStr(v.name))) },
  'ml-joint-table': { table: isTable, x: isStr, y: isStr, z: optional(isStr), conditionOn: optional(isArr), explore: optional((v) => typeof v === 'boolean'), rowsAre: optional(oneOf('x', 'y')), format: optional(oneOf('fraction', 'decimal')), first: optional((v) => isArr(v) && v.length === 3) },
  'ml-entropy-bars': { splits: (v) => isArr(v) && v.every((s) => Array.isArray(s) && s.length === 2 && s.every(Number.isInteger)), venn: optional((v) => !!v && typeof v === 'object' && isStr(v.X) && isStr(v.Y) && (v.xGroups === undefined || strs(v.xGroups)) && (v.yLabels === undefined || (strs(v.yLabels) && v.yLabels.length === 2))) },
  'ml-id3-builder': { mode: oneOf('stumps', 'compare', 'full'), table: optional(isMlTable), target: optional(isStr), given: optional(isStumpsGiven), cases: optional(isCompareCases), positive: optional(isLabel), showValues: optional((v) => typeof v === 'boolean') },
  'ml-tree-pair': { left: isTree, right: isTree, counts: optional(subsetOf('tests', 'levels', 'leaves')), titles: optional((v) => Array.isArray(v) && v.length === 2 && v.every(isBi)), table: optional(isMlTable), target: optional(isStr) },
  'ml-dup-counter': { table: isMlTable, target: isStr, added: (v) => Array.isArray(v) && v.length > 0 && v.every(Array.isArray) },
  'ml-threshold': { table: isTbl, attr: isStr, target: isStr, plane: optional(isPlane) },
  'ml-cvloo': { table: isTbl, target: isStr, tie: isStr, continuous: optional(strs) },
  'ml-prune': { tree: isPruneNode, table: optional(isTbl), target: optional(isStr), epsilon: isNum },
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
  // the ML widgets read columns by name: a name that is not in the table is a content error, not a blank chart
  const mlCols = (tb, names, numeric) => {
    if (!isTbl(tb)) return;
    const cols = tb.columns.map(colName);
    for (const c of names.filter(isStr)) {
      if (!cols.includes(c)) errs.push(`viz (${w}): column "${c}" is not in the table (columns: ${cols.join(', ')})`);
      else if (numeric && !tb.rows.every(r => typeof r[cols.indexOf(c)] === 'number')) errs.push(`viz (${w}): column "${c}" must hold numbers`);
    }
  };
  if (w === 'ml-threshold') {
    mlCols(props.table, [props.target], false);
    mlCols(props.table, props.plane && isPlane(props.plane) ? [props.attr, props.plane.x, props.plane.y] : [props.attr], true);
  }
  if (w === 'ml-cvloo') {
    mlCols(props.table, [props.target], false);
    mlCols(props.table, Array.isArray(props.continuous) ? props.continuous : [], true);
    // tie is the leaf rule (class0, class1 or a label of the target); a tie between attributes goes to the first column
    if (isTbl(props.table) && isStr(props.tie) && !/^class[01]$/.test(props.tie)) {
      const ti = props.table.columns.map(colName).indexOf(props.target);
      if (ti >= 0 && !props.table.rows.some(r => String(r[ti]) === props.tie)) errs.push(`viz (ml-cvloo): props.tie "${props.tie}" is the leaf rule: class0, class1 or a label of ${props.target}; a tie between attributes follows the column order of the table`);
    }
  }
  if (w === 'ml-prune' && isPruneNode(props.tree)) {
    const tests = pruneTests(props.tree);
    if (!tests.length) errs.push('viz (ml-prune): the tree needs at least one test node');
    if (tests.some(n => n.ig === undefined) && !(isTbl(props.table) && isStr(props.target))) errs.push('viz (ml-prune): a test node without ig needs props.table and props.target');
    if (isTbl(props.table)) mlCols(props.table, [props.target, ...tests.map(n => n.attr)], false);
    if ((props.table === undefined) !== (props.target === undefined)) errs.push('viz (ml-prune): props.table and props.target go together');
  }
  if (w === 'join-wires' && !!props.filter !== !!props.filterIn) errs.push('viz (join-wires): props.filter and props.filterIn go together');
  if (w === 'ml-omega') errs.push(...omegaProblems(props).filter((e) => !errs.includes(e)));
  if (w === 'ml-freq-tree') errs.push(...freqTreeProblems(props).filter((e) => !errs.includes(e)));
  if (w === 'ml-indep-2x2') errs.push(...indepProblems(props).filter((e) => !errs.includes(e)));
  if (w === 'ml-pmf-cdf' && errs.length === 0) {
    try { pmfCdf(props); } catch (e) { errs.push(`viz (ml-pmf-cdf): ${e.message}`); }
  }
  if (w === 'ml-joint-table' && errs.length === 0) {
    try { jointTable(props); } catch (e) { errs.push(`viz (ml-joint-table): ${e.message}`); }
  }
  if (w === 'ml-entropy-bars' && errs.length === 0) {
    try { entropyBars(props); } catch (e) { errs.push(`viz (ml-entropy-bars): ${e.message}`); }
  }
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
