// Pure logic of ml-tree-pair (L12): two decision trees for the same function, side by side. A tree is a nested object:
// a test { attr, kids: { value: tree } } or a leaf { leaf: label }. Test nodes are numbered level by level (the root is 1),
// and every count the widget prints (tests, levels, leaves, errors on the rows) is computed here from the trees.
import { both, lab, colName, listIn, cnt } from './id3-common.js';

export const isLeaf = (t) => !!t && Object.prototype.hasOwnProperty.call(t, 'leaf');

// Annotated copy: { kind, num?, attr?, level?, label?, kids: [{ value, node }] }
export function annotate(tree) {
  let counter = 0;
  const root = (function build(t, level) {
    if (isLeaf(t)) return { kind: 'leaf', label: t.leaf, level, kids: [] };
    return { kind: 'test', attr: t.attr, level, num: 0, kids: Object.entries(t.kids).map(([value, k]) => ({ value, node: build(k, level + 1) })) };
  })(tree, 1);
  // number the tests breadth first, left to right
  const queue = [root];
  while (queue.length) {
    const n = queue.shift();
    if (n.kind === 'test') n.num = ++counter;
    queue.push(...n.kids.map((k) => k.node));
  }
  return root;
}

export function stats(root) {
  let tests = 0; let leaves = 0; let levels = 0;
  (function walk(n) {
    if (n.kind === 'test') { tests++; levels = Math.max(levels, n.level); } else leaves++;
    n.kids.forEach((k) => walk(k.node));
  })(root);
  return { tests, leaves, levels };
}

export function classify(tree, row, names) {
  let t = tree;
  while (!isLeaf(t)) {
    const v = row[names.indexOf(t.attr)];
    const kid = Object.entries(t.kids).find(([key]) => String(key) === String(v));
    if (!kid) return undefined;
    t = kid[1];
  }
  return t.leaf;
}

const DEFAULT_TITLES = [{ en: 'ID3 tree', ro: 'Arborele ID3' }, { en: 'Smaller tree', ro: 'Arborele mai mic' }];

export function treePairModel(props) {
  const sides = [props.left, props.right].map(annotate);
  const st = sides.map(stats);
  const titles = props.titles || DEFAULT_TITLES;
  const shown = props.counts || ['tests', 'levels'];
  let rowsInfo = null;
  if (props.table) {
    const names = props.table.columns.map(colName);
    const ti = names.indexOf(props.target);
    const preds = [props.left, props.right].map((t) => props.table.rows.map((r) => classify(t, r, names)));
    const errors = preds.map((p) => p.filter((v, i) => String(v) !== String(props.table.rows[i][ti])).length);
    const agree = preds[0].filter((v, i) => String(v) === String(preds[1][i])).length;
    rowsInfo = { n: props.table.rows.length, errors, agree };
  }
  const sameTests = st[0].tests === st[1].tests;
  const levelDiff = Math.abs(st[0].levels - st[1].levels);
  const fewer = st[0].levels < st[1].levels ? 0 : st[1].levels < st[0].levels ? 1 : -1;
  const M = { sides, stats: st, titles, shown, rowsInfo, sameTests, levelDiff, fewer };
  M.caption = () => both((lang) => {
    const T = (en, ro) => (lang === 'en' ? en : ro);
    const unit = {
      tests: (n) => cnt(lang, n, 'test', 'tests', 'test', 'teste'),
      levels: (n) => cnt(lang, n, 'level', 'levels', 'nivel', 'niveluri'),
      leaves: (n) => cnt(lang, n, 'leaf', 'leaves', 'frunză', 'frunze'),
    };
    // a title inside a sentence: "the minimum tree" / "arborele minim" (a leading capital stays when the next letter is one too: ID3)
    const mid = (i) => {
      const x = lab(titles[i], lang);
      const low = x.length > 1 && x[1] === x[1].toLowerCase() ? x[0].toLowerCase() + x.slice(1) : x;
      return lang === 'en' ? `the ${low}` : low;
    };
    const side = (i, first) => `${first ? lab(titles[i], lang) : mid(i)}: ${listIn(lang, shown.map((k) => unit[k](st[i][k])))}`;
    let cmp = '';
    if (shown.includes('tests') && shown.includes('levels') && sameTests && levelDiff > 0) {
      cmp = T(
        ` Both have ${unit.tests(st[0].tests)}, but ${mid(fewer)} has ${levelDiff} ${levelDiff === 1 ? 'level' : 'levels'} fewer.`,
        ` Ambii au ${unit.tests(st[0].tests)}, dar ${mid(fewer)} are cu ${levelDiff} ${levelDiff === 1 ? 'nivel' : 'niveluri'} mai puțin.`,
      );
    }
    let rows = '';
    if (rowsInfo) {
      rows = T(
        ` On the ${cnt('en', rowsInfo.n, 'row', 'rows', 'rând', 'rânduri')}, errors: ${mid(0)} ${rowsInfo.errors[0]}, ${mid(1)} ${rowsInfo.errors[1]}; the two trees give the same label on ${cnt('en', rowsInfo.agree, 'row', 'rows', 'rând', 'rânduri')}.`,
        ` Pe cele ${cnt('ro', rowsInfo.n, 'row', 'rows', 'rând', 'rânduri')}, erori: ${mid(0)} ${rowsInfo.errors[0]}, ${mid(1)} ${rowsInfo.errors[1]}; cei doi arbori dau aceeași etichetă pe ${cnt('ro', rowsInfo.agree, 'row', 'rows', 'rând', 'rânduri')}.`,
      );
    }
    return `${side(0, true)}; ${side(1, false)}.${cmp}${rows}`;
  });
  return M;
}
