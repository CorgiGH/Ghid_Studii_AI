// ml-prune (L16): pruning a decision tree with a threshold epsilon on the IG of each test, top-down and bottom-up.
// The tree is given (nested objects); the IG of a test is computed from the rows that reach it (ML math kit), or taken
// from the node when the exercise states it and gives no data. Pure; no React.
import { IG } from '../../../../../ml/calc/mathKit.js';
import { classOrder, cmpLabel, colNames, countsText, fmt, sub } from './tree-grow.js';

const bi = (en, ro) => ({ en, ro });

// ---- the tree, with rows, counts and IG on every node ----
function annotate(props) {
  const { tree, table, target } = props;
  const names = table ? colNames(table) : null;
  const ti = table ? names.indexOf(target) : -1;
  const classes = table ? classOrder(table.rows, ti) : [];
  const nodes = [];
  const build = (raw, conds, ids) => {
    const counts = table ? classes.map((c) => ids.filter((i) => table.rows[i][ti] === c).length) : null;
    const node = { id: nodes.length, conds, ids, counts, n: ids ? ids.length : null };
    nodes.push(node);
    if (raw.leaf !== undefined) return Object.assign(node, { leaf: true, label: raw.leaf });
    const ai = table ? names.indexOf(raw.attr) : -1;
    let ig = raw.ig;
    if (ig === undefined) {
      try { ig = ids.length ? IG(sub(table, ids), raw.attr, target) : 0; } catch { ig = 0; }
    }
    Object.assign(node, { leaf: false, attr: raw.attr, ig, given: raw.ig !== undefined, kids: [] });
    for (const [value, kid] of Object.entries(raw.kids)) {
      node.kids.push({ value, node: build(kid, [...conds, { attr: raw.attr, value }], table ? ids.filter((i) => String(table.rows[i][ai]) === String(value)) : null) });
    }
    return node;
  };
  const root = build(tree, [], table ? table.rows.map((_, i) => i) : null);
  return { root, nodes, table, target, names, ti, classes };
}

export const nodeName = (n) => (n.conds.length ? `${n.attr} (${n.conds.map((c) => `${c.attr} = ${c.value}`).join(', ')})` : n.attr);
const tests = (A) => A.nodes.filter((n) => !n.leaf);

// ---- the two prunings: the set of test nodes replaced by a leaf ----
export function removedTopDown(A, eps) {
  const out = new Set();
  const walk = (n) => {
    if (n.leaf) return;
    if (n.ig < eps) { out.add(n.id); return; }
    n.kids.forEach((k) => walk(k.node));
  };
  walk(A.root);
  return out;
}

export function removedBottomUp(A, eps) {
  const out = new Set();
  // a test goes only if its IG is below eps and no test below it stays
  const walk = (n) => {
    if (n.leaf) return false;
    const kidTests = n.kids.filter((k) => !k.node.leaf).map((k) => k.node);
    kidTests.forEach(walk);
    const staysBelow = kidTests.some((k) => !out.has(k.id));
    if (n.ig < eps && !staysBelow) out.add(n.id);
    return true;
  };
  walk(A.root);
  return out;
}

// kept | cut (the top node that is replaced) | gone (below a cut), for every node
function statuses(A, removed) {
  const st = {};
  const walk = (n, under) => {
    const cut = !n.leaf && removed.has(n.id);
    st[n.id] = under ? 'gone' : cut ? 'cut' : 'kept';
    if (!n.leaf) n.kids.forEach((k) => walk(k.node, under || cut));
  };
  walk(A.root, false);
  return st;
}

// the label a replaced node gets: the majority of its rows, a tie goes to the smaller label; '?' when the exercise gives no data
function majorityLabel(A, n) {
  if (!A.table || !n.counts) return '?';
  const sorted = [...A.classes].sort(cmpLabel);
  const at = (c) => n.counts[A.classes.indexOf(c)];
  const top = Math.max(...sorted.map(at));
  return sorted.find((c) => at(c) === top);
}
const tied = (A, n) => !!A.table && n.counts && n.counts.filter((c) => c === Math.max(...n.counts)).length > 1;

function trainErrors(A, removed) {
  if (!A.table) return null;
  let e = 0;
  A.table.rows.forEach((row, i) => {
    let n = A.root;
    let label;
    for (;;) {
      if (n.leaf) { label = n.label; break; }
      if (removed.has(n.id)) { label = majorityLabel(A, n); break; }
      const ai = A.names.indexOf(n.attr);
      const k = n.kids.find((x) => String(x.value) === String(row[ai]));
      if (!k) { label = majorityLabel(A, n); break; }
      n = k.node;
    }
    if (label !== A.table.rows[i][A.ti]) e += 1;
  });
  return e;
}

export function epsChoices(props) {
  const A = annotate(props);
  const vals = [props.epsilon, ...tests(A).map((n) => n.ig).filter((v) => v > 0)];
  const seen = new Set();
  return vals.filter((v) => { const k = fmt(v); if (seen.has(k)) return false; seen.add(k); return true; }).sort((a, b) => a - b);
}

const list = (xs, and = 'and', si = 'și') => ({ en: xs.length > 1 ? `${xs.slice(0, -1).join(', ')} ${and} ${xs[xs.length - 1]}` : xs[0], ro: xs.length > 1 ? `${xs.slice(0, -1).join(', ')} ${si} ${xs[xs.length - 1]}` : xs[0] });

export function mlPrune(props) {
  const A = annotate(props);
  const eps = props.epsilon;
  const T = tests(A);
  const nTests = T.length;
  const td = removedTopDown(A, eps);
  const bu = removedBottomUp(A, eps);
  const none = new Set();
  const stTD = statuses(A, td);
  const stBU = statuses(A, bu);
  const stAll = statuses(A, none);
  const keptTests = (st) => T.filter((n) => st[n.id] === 'kept');
  const cutTests = (st) => T.filter((n) => st[n.id] === 'cut');
  const n = A.table ? A.table.rows.length : null;
  const ct = (counts) => countsText(counts, A.classes);
  const name = (x) => `${nodeName(x)}, IG ${fmt(x.ig)}`;
  const errTail = (e) => (e === null ? bi('', '') : bi(` Training error ${e}/${n}.`, ` Eroarea la antrenare ${e}/${n}.`));
  const emptyNote = A.table ? bi('', '') : bi(' A cut node becomes a leaf with no label yet (?), because the exercise gives no data.', ' Un nod tăiat devine o frunză fără etichetă încă (?), fiindcă exercițiul nu dă date.');
  const tieNote = (st) => {
    const ties = cutTests(st).filter((x) => tied(A, x));
    return ties.length ? bi(` A cut node with equal counts takes the smaller label (${majorityLabel(A, ties[0])}).`, ` Un nod tăiat cu efective egale ia eticheta mai mică (${majorityLabel(A, ties[0])}).`) : bi('', '');
  };

  const frames = [];
  frames.push({
    kind: 'setup', status: stAll, removed: none, tests: nTests, err: trainErrors(A, none), eps,
    caption: bi(`The tree has ${nTests} test nodes, with the IG of each written on it. The threshold is ε = ${fmt(eps)}: a test with IG below ε is a candidate to be cut. Which nodes remain with top-down pruning, from the root down? And with bottom-up?${A.table ? ` The training error of this tree is ${trainErrors(A, none)}/${n}.` : ''}`,
      `Arborele are ${nTests} noduri de test, cu IG-ul fiecăruia scris pe el. Pragul este ε = ${fmt(eps)}: un test cu IG sub ε e candidat la tăiere. Ce noduri rămân la pruning-ul top-down, de la rădăcină în jos? Dar la bottom-up?${A.table ? ` Eroarea la antrenare a acestui arbore este ${trainErrors(A, none)}/${n}.` : ''}`),
  });

  const belowOf = (c, st) => T.filter((x) => st[x.id] === 'gone' && x.conds.length > c.conds.length && c.conds.every((cc, i) => x.conds[i].attr === cc.attr && x.conds[i].value === cc.value)).map((x) => x.attr);
  const cutsText = (st) => {
    const cuts = cutTests(st);
    if (!cuts.length) return bi('Nothing is cut.', 'Nu se taie nimic.');
    // the tests under a cut, a repeated name said once with its count in words (4.19: two W tests under V)
    const WORDS = { en: [null, null, 'two', 'three', 'four'], ro: [null, null, 'două', 'trei', 'patru'] };
    const under = (c, lang) => {
      const b = belowOf(c, st);
      if (!b.length) return name(c);
      const groups = [...new Set(b)].map((x) => {
        const k = b.filter((y) => y === x).length;
        if (k === 1) return x;
        const w = WORDS[lang][k] || String(k);
        return lang === 'en' ? `${w} ${x} tests` : `${w} teste ${x}`;
      });
      const l = list(groups);
      return lang === 'en' ? `${name(c)}, with ${l.en} below it` : `${name(c)}, cu ${l.ro} sub el`;
    };
    const en = list(cuts.map((c) => under(c, 'en')));
    const ro = list(cuts.map((c) => under(c, 'ro')));
    return bi(`Cut: ${en.en}.`, `Tăiat: ${ro.ro}.`);
  };
  const cutLabels = (st) => Object.fromEntries(cutTests(st).map((x) => [x.id, majorityLabel(A, x)]));

  const eTD = trainErrors(A, td);
  const cutsTD = cutsText(stTD);
  frames.push({
    kind: 'topdown', status: stTD, cutLabels: cutLabels(stTD), removed: td, tests: keptTests(stTD).length, err: eTD, eps,
    caption: bi(`Top-down: from the root, a test with IG below ε = ${fmt(eps)} is replaced at once by a leaf, together with everything below it. ${cutsTD.en} ${keptTests(stTD).length} of ${nTests} tests remain.${errTail(eTD).en}${emptyNote.en}${tieNote(stTD).en}`,
      `Top-down: de la rădăcină în jos, un test cu IG sub ε = ${fmt(eps)} e înlocuit pe loc cu o frunză, împreună cu tot ce e sub el. ${cutsTD.ro} Rămân ${keptTests(stTD).length} din ${nTests} teste.${errTail(eTD).ro}${emptyNote.ro}${tieNote(stTD).ro}`),
  });

  const eBU = trainErrors(A, bu);
  const keptLow = T.filter((x) => stBU[x.id] === 'kept' && x.ig < eps).map((x) => {
    const w = T.find((y) => y !== x && stBU[y.id] === 'kept' && y.conds.length > x.conds.length && x.conds.every((cc, i) => y.conds[i].attr === cc.attr && y.conds[i].value === cc.value));
    return { node: x, witness: w };
  });
  const cutsBU = cutsText(stBU);
  const keepEn = keptLow.length ? ` Kept although IG < ε: ${list(keptLow.map((k) => `${name(k.node)} (the test ${k.witness.attr} below it has IG ${fmt(k.witness.ig)})`)).en}.` : '';
  const keepRo = keptLow.length ? ` Păstrat deși IG < ε: ${list(keptLow.map((k) => `${name(k.node)} (testul ${k.witness.attr} de sub el are IG ${fmt(k.witness.ig)})`)).ro}.` : '';
  frames.push({
    kind: 'bottomup', status: stBU, cutLabels: cutLabels(stBU), removed: bu, tests: keptTests(stBU).length, err: eBU, keptLow, eps,
    caption: bi(`Bottom-up: start at the parents of the leaves and go up; a test with IG below ε = ${fmt(eps)} goes only if no test below it stays. ${cutsBU.en}${keepEn} ${keptTests(stBU).length} of ${nTests} tests remain.${errTail(eBU).en}${emptyNote.en}${tieNote(stBU).en}`,
      `Bottom-up: pornești de la părinții frunzelor și urci; un test cu IG sub ε = ${fmt(eps)} se elimină doar dacă niciun test de sub el nu rămâne. ${cutsBU.ro}${keepRo} Rămân ${keptTests(stBU).length} din ${nTests} teste.${errTail(eBU).ro}${emptyNote.ro}${tieNote(stBU).ro}`),
  });

  const onlyBU = T.filter((x) => stBU[x.id] === 'kept' && stTD[x.id] !== 'kept');
  const onlyTD = T.filter((x) => stTD[x.id] === 'kept' && stBU[x.id] !== 'kept');
  const sameTree = !onlyBU.length && !onlyTD.length;
  const diffEn = sameTree
    ? 'Both give the same tree here.'
    : `Only bottom-up keeps ${list(onlyBU.map(name)).en}: a test with a small IG can sit above one with a large IG.`;
  const diffRo = sameTree
    ? 'Aici ambele dau același arbore.'
    : `Doar bottom-up păstrează ${list(onlyBU.map(name)).ro}: un test cu IG mic poate sta deasupra unuia cu IG mare.`;
  const errCmp = A.table ? bi(` Training error: top-down ${eTD}/${n}, bottom-up ${eBU}/${n}.`, ` Eroarea la antrenare: top-down ${eTD}/${n}, bottom-up ${eBU}/${n}.`) : bi('', '');
  frames.push({
    kind: 'compare', tdTests: keptTests(stTD).length, buTests: keptTests(stBU).length, same: sameTree, eTD, eBU, eps, tests: nTests,
    rows: T.map((x) => ({ id: x.id, name: nodeName(x), ig: x.ig, td: stTD[x.id] === 'kept', bu: stBU[x.id] === 'kept' })),
    caption: bi(`Top-down keeps ${keptTests(stTD).length} of ${nTests} tests, bottom-up keeps ${keptTests(stBU).length}. ${diffEn}${errCmp.en}`,
      `Top-down păstrează ${keptTests(stTD).length} din ${nTests} teste, bottom-up ${keptTests(stBU).length}. ${diffRo}${errCmp.ro}`),
  });

  return { frames, A, classes: A.classes, root: A.root, nTests, n, countsText: ct, hasTable: !!A.table };
}
