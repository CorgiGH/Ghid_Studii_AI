// ml-nb: the Naive Bayes calculator for lessons 20, 21 and 22. Pure logic: every number the widget draws or says comes
// from mathKit's exact counts (Fractions), never from the block JSON. One frame per step; a frame carries its state
// (what is drawn), its caption (built from that state), the question to predict before the next frame, and `cites`:
// the figures the caption quotes, each of which the stage draws as an element with the same data-key and data-value.
//
// modes (each lesson uses its own):
//   joint   L20  Bayes Optimal against Bayes Naiv on one instance, then the parameter counter
//   laplace L21  the same instance without and with add-one
//   errors  L22  the error rate of Naive Bayes on a true distribution, a duplicated attribute, two error numbers
import Fraction from '../../../../../ml/calc/fraction.js';
import { P, Pc, count, nbScore, jointScore, paramsNB, paramsJoint } from '../../../../../ml/calc/mathKit.js';
import { bi, joinList } from './numbers-bilingual.js';
import { nbPick } from './nb-picks.js';
import { rows as rowsWord, enNoun, roNoun } from '../words.js';

export const NB_MODES = ['joint', 'laplace', 'errors'];
export const PARAM_N = { min: 1, max: 10 };

const colName = (c) => (typeof c === 'string' ? c : c.en);
const cmp = (a, b) => (typeof a === 'number' && typeof b === 'number' ? a - b : String(a) < String(b) ? -1 : String(a) > String(b) ? 1 : 0);
const same = (cell, lit) => String(cell) === String(lit) || (typeof cell === 'number' && Number(lit) === cell);
const cond = (pairs) => pairs.map(([k, v]) => `${k}=${v}`).join(' & ');

// "x=0 & y=1" or { x: 0, y: 1 } -> [['x', '0'], ['y', '1']]
export function parseRow(row) {
  if (typeof row === 'string') {
    return row.split('&').map((part) => {
      const m = /^\s*(.+?)\s*=\s*(.+?)\s*$/.exec(part);
      if (!m) throw new SyntaxError(`ml-nb: cannot read "${part.trim()}" in row (write Column=value joined with &)`);
      return [m[1], m[2].replace(/^(['"])(.*)\1$/, '$2')];
    });
  }
  if (row && typeof row === 'object') return Object.entries(row).map(([k, v]) => [k, String(v)]);
  throw new TypeError('ml-nb: row must be a string or an object');
}

// The table, the target and the instance in the form the frames use.
export function nbModel(props) {
  const T = props.table;
  if (!T || !Array.isArray(T.columns) || !Array.isArray(T.rows)) throw new TypeError('ml-nb: table must have columns and rows');
  const cols = T.columns.map(colName);
  const target = props.target;
  const ti = cols.indexOf(target);
  if (ti < 0) throw new RangeError(`ml-nb: target "${target}" is not a column`);
  const ignore = new Set(T.ignore || []);
  const hasP = cols.includes('P');
  const attrs = cols.filter((c) => c !== target && c !== 'P' && !ignore.has(c));
  if (!attrs.length) throw new RangeError('ml-nb: the table needs at least one attribute column');
  const pairs = parseRow(props.row);
  for (const [k] of pairs) if (!attrs.includes(k)) throw new RangeError(`ml-nb: "${k}" in row is not an attribute column`);
  const classes = [...new Set(T.rows.map((r) => r[ti]))].sort(cmp);
  const domain = (a) => {
    const i = cols.indexOf(a);
    return T.domains?.[a] ? [...T.domains[a]] : [...new Set(T.rows.map((r) => r[i]))].sort(cmp);
  };
  return { T, cols, target, ti, attrs, hasP, pairs, classes, domain, modes: props.modes };
}

const ids = (m, pairs) => m.T.rows.map((_, i) => i).filter((i) => pairs.every(([k, v]) => same(m.T.rows[i][m.cols.indexOf(k)], v)));
const classIds = (m, cls) => m.T.rows.map((_, i) => i).filter((i) => same(m.T.rows[i][m.ti], cls));

const prior = (m, cls) => P(m.T, `${m.target}=${cls}`);

// One factor P(attr = lit | class): MLE or add-one. count and size are rows (null for a table with a P column).
export function factor(m, attr, lit, cls, laplace = false) {
  const k = m.domain(attr).length;
  if (m.hasP) {
    if (laplace) throw new RangeError('ml-nb: add-one needs a table of counts, not a P column');
    return { attr, lit, cls, count: null, size: null, k, p: Pc(m.T, `${attr}=${lit}`, `${m.target}=${cls}`) };
  }
  const c = count(m.T, `${attr}=${lit} & ${m.target}=${cls}`);
  const nc = count(m.T, `${m.target}=${cls}`);
  return { attr, lit, cls, count: c, size: nc, k, p: laplace ? new Fraction(c + 1, nc + k) : new Fraction(c, nc) };
}

// The scores of every class on an instance: prior, factors, product (exact), and the probabilities when the scores add up to more than 0.
export function classScores(m, pairs, laplace = false) {
  const rows = m.classes.map((cls) => {
    const pr = prior(m, cls);
    const fs = pairs.map(([a, v]) => factor(m, a, v, cls, laplace));
    const score = fs.reduce((s, f) => s.mul(f.p), pr);
    return { cls, n: m.hasP ? null : count(m.T, `${m.target}=${cls}`), prior: pr, factors: fs, score };
  });
  const sum = rows.reduce((s, r) => s.add(r.score), new Fraction(0));
  const probs = sum.sign() > 0 ? rows.map((r) => r.score.div(sum)) : null;
  let best = 0;
  rows.forEach((r, i) => { if (r.score.cmp(rows[best].score) > 0) best = i; });
  return { rows, sum, probs, decision: rows[best].cls, undefinedPosterior: sum.sign() === 0 };
}

// Bayes Optimal on an instance: the rows identical to it, their classes, the joint estimates and the probabilities.
export function jointRows(m, pairs) {
  const hit = ids(m, pairs);
  const rows = m.classes.map((cls) => ({ cls, joint: jointScore(m.T, m.target, cond(pairs), cls), n: hit.filter((i) => same(m.T.rows[i][m.ti], cls)).length }));
  const sum = rows.reduce((s, r) => s.add(r.joint), new Fraction(0));
  return { ids: hit, rows, sum, probs: sum.sign() > 0 ? rows.map((r) => r.joint.div(sum)) : null };
}

// The rows a factor counts over: the rows of the class, and among them those that have the value.
export function factorRows(m, cls, attr, lit) {
  const inClass = classIds(m, cls);
  const ai = m.cols.indexOf(attr);
  return { inClass, withValue: inClass.filter((i) => same(m.T.rows[i][ai], lit)) };
}

export function paramCounts(n) {
  return { n, nb: paramsNB(n, 2, 2), joint: paramsJoint(n, 2, 2) };
}

const lab = (m, cls) => `${m.target}=${cls}`;
const eq = (a) => (a ? a.map(([k, v]) => `${k}=${v}`).join(', ') : '');
const instance = (m, pairs = m.pairs) => `(${eq(pairs)})`;
const FX = (key, value) => ({ key, value: value instanceof Fraction ? value.toString() : String(value) });
const names = (m) => m.classes.map((c) => lab(m, c));

// --- joint mode ---

function jointFrames(m) {
  const first = m.pairs.slice(0, 1);
  const J = jointRows(m, m.pairs);
  const S = classScores(m, m.pairs, false);
  const S1 = classScores(m, first, false);
  const J1 = jointRows(m, first);
  const c0 = m.classes[0];
  const f0 = S.rows[0].factors[0];
  const winner = S.decision;
  const decisive = J.rows.filter((r) => r.n > 0);
  const frames = [];

  frames.push({
    id: 'joint-0', mode: 'joint', state: { kind: 'joint-rows', hit: [], instance: m.pairs },
    caption: bi((L) => `${L.t('Instance to classify', 'Instanța de clasificat')}: ${instance(m)}. ${L.t('Joint Bayes looks for rows identical to it; Naive Bayes will combine the attributes one by one.', 'Bayes Optimal caută rânduri identice cu ea; Bayes Naiv va combina atributele pe rând.')}`),
    ask: bi((L) => L.t(`Predict: how many rows have exactly these values, and what class do they have?`, `Prezice: câte rânduri au exact aceste valori și ce clasă au?`)),
    cites: [],
  });

  frames.push({
    id: 'joint-1', mode: 'joint', state: { kind: 'joint-rows', hit: J.ids, instance: m.pairs, joint: J },
    caption: bi((L) => {
      if (!J.ids.length) return `${L.t('No row of the table is identical to the instance, so Joint Bayes has nothing to count.', 'Niciun rând din tabel nu e identic cu instanța, deci Bayes Optimal nu are ce număra.')}`;
      const cls = decisive.map((r) => lab(m, r.cls)).join(', ');
      const probs = J.rows.map((r, i) => `P(${lab(m, r.cls)}|${L.t('instance', 'instanță')}) = ${L.f(J.probs[i])}`).join(', ');
      return `${L.t('Identical rows', 'Rânduri identice')}: ${J.ids.length} (${cls}). ${probs}. ${L.t(`Joint Bayes rests on ${rowsWord(J.ids.length).en}.`, `Bayes Optimal se sprijină pe ${rowsWord(J.ids.length).ro}.`)}`;
    }),
    ask: bi((L) => L.t(`Predict: what are the class priors ${names(m).map((n) => `P(${n})`).join(' and ')}?`, `Prezice: cât sunt priorii claselor ${names(m).map((n) => `P(${n})`).join(' și ')}?`)),
    cites: [FX('match-count', J.ids.length), ...J.rows.map((r, i) => FX(`joint-prob:${r.cls}`, J.probs ? J.probs[i] : 0))],
  });

  frames.push({
    id: 'joint-2', mode: 'joint', state: { kind: 'priors', scores: S },
    caption: bi((L) => `${L.t('Class priors, relative frequencies', 'Priorii claselor, frecvențe relative')}: ${S.rows.map((r) => `P(${lab(m, r.cls)}) = ${L.f(r.prior)}`).join(', ')}.`),
    ask: bi((L) => L.t(`Predict: how many rows of class ${lab(m, c0)} have ${eq([[f0.attr, f0.lit]])}? So what is P(${f0.attr}=${f0.lit} | ${lab(m, c0)})?`, `Prezice: câte rânduri din clasa ${lab(m, c0)} au ${eq([[f0.attr, f0.lit]])}? Deci cât este P(${f0.attr}=${f0.lit} | ${lab(m, c0)})?`)),
    cites: S.rows.map((r) => FX(`prior:${r.cls}`, r.prior)),
  });

  frames.push({
    id: 'joint-3', mode: 'joint', state: { kind: 'factors', scores: S },
    caption: bi((L) => `${L.t('One factor per attribute, counted only over the rows of the class', 'Câte un factor pe atribut, numărat doar pe rândurile clasei')}. ${S.rows.map((r) => `${lab(m, r.cls)}: ${r.factors.map((f) => `P(${f.attr}=${f.lit}|${lab(m, r.cls)}) = ${L.f(f.p)}`).join(', ')}`).join('; ')}.`),
    ask: bi((L) => L.t('Predict: multiply prior and factors. Which class has the larger score?', 'Prezice: înmulțește priorul cu factorii. Care clasă are scorul mai mare?')),
    cites: S.rows.flatMap((r) => r.factors.map((f) => FX(`factor:${r.cls}:${f.attr}`, f.p))),
  });

  frames.push({
    id: 'joint-4', mode: 'joint', state: { kind: 'scores', scores: S },
    caption: bi((L) => `${L.t('Scores', 'Scorurile')}: ${S.rows.map((r) => `${lab(m, r.cls)}: ${L.fa(r.score)}`).join('; ')}. ${L.t('Larger', 'Mai mare')}: ${lab(m, winner)}.`),
    ask: bi((L) => L.t('Predict: divide each score by the sum of the scores. What is the probability of the decision?', 'Prezice: împarte fiecare scor la suma scorurilor. Cât este probabilitatea deciziei?')),
    cites: S.rows.map((r) => FX(`score:${r.cls}`, r.score)),
  });

  frames.push({
    id: 'joint-5', mode: 'joint', state: { kind: 'probs', scores: S },
    caption: bi((L) => (S.probs
      ? `${L.t('Normalised', 'Normalizat')}: ${S.rows.map((r, i) => `P(${lab(m, r.cls)}|${L.t('instance', 'instanță')}) = ${L.fa(S.probs[i])}`).join('; ')}. ${L.t('Decision', 'Decizia')}: ${lab(m, winner)}.`
      : `${L.t('All scores are 0: the probability is 0/0, undefined.', 'Toate scorurile sunt 0: probabilitatea este 0/0, nedefinită.')}`)),
    ask: bi((L) => L.t(`Predict: using only ${first[0][0]} (${eq(first)}), what is P(${lab(m, c0)}|${eq(first)}) for Naive Bayes? And for Joint Bayes?`, `Prezice: folosind doar ${first[0][0]} (${eq(first)}), cât este P(${lab(m, c0)}|${eq(first)}) la Bayes Naiv? Dar la Bayes Optimal?`)),
    cites: S.probs ? S.rows.map((r, i) => FX(`prob:${r.cls}`, S.probs[i])) : [],
  });

  const nbP = S1.probs ? S1.probs[0] : null;
  const jbP = J1.probs ? J1.probs[0] : null;
  const agree = nbP && jbP && nbP.equals(jbP);
  frames.push({
    id: 'joint-6', mode: 'joint', state: { kind: 'one-attribute', pairs: first, nb: S1, joint: J1 },
    caption: bi((L) => `${L.t('Only', 'Doar')} ${eq(first)}: ${L.t('Naive Bayes', 'Bayes Naiv')} P(${lab(m, c0)}|${eq(first)}) = ${nbP ? L.f(nbP) : '0/0'}, ${L.t('Joint Bayes', 'Bayes Optimal')} ${jbP ? L.f(jbP) : '0/0'}. ${agree ? L.t('The same number: with one attribute there is nothing to factorise.', 'Același număr: cu un singur atribut nu are ce să factorizeze.') : L.t('The numbers differ.', 'Numerele diferă.')}`),
    ask: bi((L) => L.t('Now the number of parameters. Predict the counts for n = 5 attributes, then move the slider to 5.', 'Acum numărul de parametri. Prezice valorile pentru n = 5 atribute, apoi mută cursorul la 5.')),
    cites: [FX('nb1', nbP || 0), FX('jb1', jbP || 0)],
  });

  frames.push(paramsFrame(PARAM_N.max));
  return frames;
}

// the parameter counter panel is its own frame, whose caption follows the slider
export function paramsFrame(n) {
  const c = paramCounts(n);
  return {
    id: 'params', mode: 'joint', state: { kind: 'params', ...c },
    // d = the number of input attributes, as the lessons write it (EB ex. 2.7 calls it n); the nouns agree with their
    // numbers: 1 atribut binar, 10 atribute binare; 11 parametri, 21 de parametri
    caption: bi((L) => `${L.t('With', 'Cu')} d = ${c.n} ${L.t(enNoun(c.n, 'binary attribute', 'binary attributes'), roNoun(c.n, 'atribut binar', 'atribute binare'))} ${L.t('and a binary class', 'și o clasă binară')}: ${L.t('Naive Bayes', 'Bayes Naiv')} 2d + 1 = ${c.nb} ${L.t('free parameters', roNoun(c.nb, 'parametru liber', 'parametri liberi'))}, ${L.t('Joint Bayes', 'Bayes Optimal')} 2ᵈ⁺¹ − 1 = ${c.joint}.`),
    ask: null,
    cites: [FX('params-nb', c.nb), FX('params-joint', c.joint)],
  };
}

// --- laplace mode ---

function laplaceFrames(m) {
  const off = classScores(m, m.pairs, false);
  const on = classScores(m, m.pairs, true);
  const zero = off.rows.flatMap((r) => r.factors).find((f) => f.p.sign() === 0) || off.rows[0].factors[0];
  const zeroOn = factor(m, zero.attr, zero.lit, zero.cls, true);
  const win = on.decision;
  const wi = m.classes.indexOf(win);
  const a = m.pairs[0][0];
  const vals = m.domain(a);
  const wcls = on.rows[wi];
  const nc = wcls.n;
  const k = vals.length;
  const smooth = vals.map((v) => factor(m, a, v, win, true).p);
  const counts = vals.map((v) => factor(m, a, v, win, false).count);
  const naive = vals.map((v) => new Fraction(factor(m, a, v, win, false).count + 1, nc));
  const sumSmooth = smooth.reduce((s, x) => s.add(x), new Fraction(0));
  const sumNaive = naive.reduce((s, x) => s.add(x), new Fraction(0));
  const frames = [];

  frames.push({
    id: 'laplace-0', mode: 'laplace', state: { kind: 'laplace-calc', smooth: false, showScores: false, showProbs: false, scores: off },
    caption: bi((L) => `${L.t('Add-one is off. Instance', 'Add-one este oprit. Instanța')} ${instance(m)}. ${L.t('Each factor is the count over the size of the class', 'Fiecare factor este numărătoarea împărțită la mărimea clasei')}.`),
    ask: bi((L) => L.t('Predict the score of each class: prior times the factors.', 'Prezice scorul fiecărei clase: priorul înmulțit cu factorii.')),
    cites: [],
  });
  frames.push({
    id: 'laplace-1', mode: 'laplace', state: { kind: 'laplace-calc', smooth: false, showScores: true, showProbs: false, scores: off },
    caption: bi((L) => `${L.t('Scores without add-one', 'Scorurile fără add-one')}: ${off.rows.map((r) => `${lab(m, r.cls)}: ${L.fa(r.score)}`).join('; ')}. ${off.rows.some((r) => r.score.sign() === 0) ? L.t('A factor of 0 cancels the whole product.', 'Un singur factor 0 anulează tot produsul.') : L.t('No score is 0 here.', 'Aici niciun scor nu este 0.')}`),
    ask: bi((L) => L.t('Predict: what is the probability of a class now?', 'Prezice: cât este acum probabilitatea unei clase?')),
    cites: off.rows.map((r) => FX(`score:${r.cls}`, r.score)),
  });
  frames.push({
    id: 'laplace-2', mode: 'laplace', state: { kind: 'laplace-calc', smooth: false, showScores: true, showProbs: true, scores: off },
    caption: bi((L) => (off.undefinedPosterior
      ? `${L.t('Probability of a class', 'Probabilitatea unei clase')} = 0/(${off.rows.map((r) => L.f(r.score)).join(' + ')}) = 0/0: ${L.t('undefined', 'nedefinită')}. ${L.t('We can neither decide nor give a probability.', 'Nu putem nici decide, nici da o probabilitate.')}`
      : `${L.t('Probabilities', 'Probabilitățile')}: ${off.rows.map((r, i) => `${lab(m, r.cls)}: ${L.fa(off.probs[i])}`).join('; ')}.`)),
    ask: bi((L) => L.t(`Predict with add-one: P(${zero.attr}=${zero.lit} | ${lab(m, zero.cls)}) = (count + 1) / (class size + number of values of ${zero.attr}) = ?`, `Prezice cu add-one: P(${zero.attr}=${zero.lit} | ${lab(m, zero.cls)}) = (număr + 1) / (mărimea clasei + numărul de valori ale lui ${zero.attr}) = ?`)),
    cites: off.probs ? off.rows.map((r, i) => FX(`prob:${r.cls}`, off.probs[i])) : [FX('posterior', '0/0')],
  });
  frames.push({
    id: 'laplace-3', mode: 'laplace', state: { kind: 'laplace-calc', smooth: true, showScores: false, showProbs: false, scores: on, zero: zeroOn },
    caption: bi((L) => `${L.t('Add-one is on: each factor is (count + 1) / (class size + number of values)', 'Add-one este pornit: fiecare factor este (număr + 1) / (mărimea clasei + numărul de valori)')}. P(${zero.attr}=${zero.lit} | ${lab(m, zero.cls)}) = (${zeroOn.count} + 1) / (${zeroOn.size} + ${zeroOn.k}) = ${L.f(zeroOn.p)}.`),
    ask: bi((L) => L.t('Predict: the scores are positive now. Which class does Naive Bayes decide?', 'Prezice: scorurile sunt pozitive acum. Ce clasă decide Bayes Naiv?')),
    cites: [FX(`factor:${zero.cls}:${zero.attr}`, zeroOn.p)],
  });
  frames.push({
    id: 'laplace-4', mode: 'laplace', state: { kind: 'laplace-calc', smooth: true, showScores: true, showProbs: true, scores: on },
    caption: bi((L) => `${L.t('Scores with add-one', 'Scorurile cu add-one')}: ${on.rows.map((r) => `${lab(m, r.cls)}: ${L.fa(r.score)}`).join('; ')}. ${L.t('Probabilities', 'Probabilitățile')}: ${on.rows.map((r, i) => `${L.f(on.probs[i])}`).join(', ')}. ${L.t('Decision', 'Decizia')}: ${lab(m, win)}.`),
    ask: bi((L) => L.t(`Predict: add up the smoothed probabilities P(${a}=v | ${lab(m, win)}) over the ${k} values of ${a}. Then redo the sum adding 1 only to the numerator.`, `Prezice: adună probabilitățile netezite P(${a}=v | ${lab(m, win)}) pentru cele ${k} valori ale lui ${a}. Apoi refă suma adăugând 1 doar la numărător.`)),
    cites: [...on.rows.map((r) => FX(`score:${r.cls}`, r.score)), ...on.rows.map((r, i) => FX(`prob:${r.cls}`, on.probs[i]))],
  });
  frames.push({
    id: 'laplace-5', mode: 'laplace', state: { kind: 'laplace-sum', attr: a, cls: win, size: nc, k, values: vals, counts, smooth, naive, sumSmooth, sumNaive },
    caption: bi((L) => `P(${a}=v | ${lab(m, win)}) ${L.t('with add-one', 'cu add-one')}: ${smooth.map((x) => L.f(x)).join(' + ')} = ${L.f(sumSmooth)}. ${L.t('Adding 1 only to the numerator', 'Adăugând 1 doar la numărător')}: ${naive.map((x) => L.f(x)).join(' + ')} = ${L.f(sumNaive)}${sumNaive.equals(1) ? '' : `, ${L.t('which is more than 1, so these are not probabilities', 'adică mai mult decât 1, deci nu sunt probabilități')}`}.`),
    ask: null,
    cites: [FX('sum-smooth', sumSmooth), FX('sum-naive', sumNaive)],
  });
  return frames;
}

// --- errors mode ---

function cellsOf(m, attrs) {
  let combos = [[]];
  for (const a of attrs) combos = combos.flatMap((c) => m.domain(a).map((v) => [...c, [a, String(v)]]));
  return combos;
}

// The cells of an attribute subset, each with the true joint P(cell, class), the Naive Bayes score (P_NB), both decisions.
export function errorTable(m, attrs) {
  const cells = cellsOf(m, attrs).map((pairs) => {
    const truth = m.classes.map((cls) => jointScore(m.T, m.target, cond(pairs), cls));
    const nbs = m.classes.map((cls) => nbScore(m.T, m.target, cond(pairs), cls));
    const argmax = (xs) => xs.reduce((b, x, i) => (x.cmp(xs[b]) > 0 ? i : b), 0);
    const nbD = argmax(nbs);
    const jbD = argmax(truth);
    return { pairs, label: eq(pairs), truth, nb: nbs, nbDecision: m.classes[nbD], jbDecision: m.classes[jbD], nbDi: nbD, jbDi: jbD };
  });
  const zero = new Fraction(0);
  const sum = (sel) => cells.reduce((s, c) => c[sel.xs].reduce((t, x, i) => (sel.skip(c) === i ? t : t.add(x)), s), zero);
  return {
    attrs, cells,
    errTrue: sum({ xs: 'truth', skip: (c) => c.nbDi }),
    errNB: sum({ xs: 'nb', skip: (c) => c.nbDi }),
    errJB: sum({ xs: 'truth', skip: (c) => c.jbDi }),
  };
}

function errorFrames(m) {
  const base = errorTable(m, m.attrs.slice(0, 1));
  const full = errorTable(m, m.attrs);
  const dup = m.attrs.length > 1;
  const flip = full.cells.find((c) => dup && c.nbDecision !== base.cells.find((b) => b.pairs[0][1] === c.pairs[0][1]).nbDecision);
  const askCell = flip || full.cells.at(-1);
  const wrongNB = (tab) => tab.cells.flatMap((c) => c.truth.map((v, i) => (i !== c.nbDi ? { cell: c.label, cls: m.classes[i], v } : null)).filter(Boolean));
  const baseWrong = wrongNB(base);
  const fullWrong = wrongNB(full);
  const sumText = (L, list) => { const nz = list.filter((w) => w.v.sign() > 0); return nz.length ? nz.map((w) => L.n(w.v)).join(' + ') : '0'; };
  const frames = [];

  frames.push({
    id: 'errors-0', mode: 'errors', state: { kind: 'errors', table: base, reveal: 'truth', copy: false, indicators: false, joint: false },
    caption: bi((L) => `${L.t('The true joint distribution of', 'Distribuția comună adevărată a lui')} ${base.attrs.join(', ')} ${L.t('and', 'și')} ${m.target}: ${base.cells.map((c) => c.truth.map((v, i) => `P(${c.label}, ${lab(m, m.classes[i])}) = ${L.n(v)}`).join(', ')).join('; ')}. ${L.t('Naive Bayes was trained on infinitely many examples of it.', 'Bayes Naiv a fost antrenat pe un număr infinit de exemple din ea.')}`),
    ask: bi((L) => L.t(`Predict: what does Naive Bayes decide for each value of ${base.attrs[0]}?`, `Prezice: ce decide Bayes Naiv pentru fiecare valoare a lui ${base.attrs[0]}?`)),
    cites: base.cells.flatMap((c) => c.truth.map((v, i) => FX(`truth:${c.label}:${m.classes[i]}`, v))),
  });
  frames.push({
    id: 'errors-1', mode: 'errors', state: { kind: 'errors', table: base, reveal: 'decision', copy: false, indicators: false, joint: false },
    caption: bi((L) => `${L.t('Naive Bayes decides', 'Bayes Naiv decide')}: ${base.cells.map((c) => `${c.label} → ${lab(m, c.nbDecision)}`).join('; ')}.`),
    ask: bi((L) => L.t('Predict: the cells where the decision differs from the class are errors. What is the error rate?', 'Prezice: celulele în care decizia diferă de clasă sunt erori. Cât este rata erorii?')),
    cites: base.cells.map((c) => FX(`decision:${c.label}`, c.nbDecision)),
  });
  frames.push({
    id: 'errors-2', mode: 'errors', state: { kind: 'errors', table: base, reveal: 'errors', copy: false, indicators: false, joint: false },
    caption: bi((L) => `${L.t('Error rate', 'Rata erorii')} = ${baseWrong.filter((w) => w.v.sign() > 0).map((w) => `P(${w.cell}, ${lab(m, w.cls)})`).join(' + ') || '0'} = ${sumText(L, baseWrong)}${baseWrong.filter((w) => w.v.sign() > 0).length > 1 ? ` = ${L.n(base.errTrue)}` : ''}.`),
    ask: dup ? bi((L) => L.t(`Now ${m.attrs.slice(1).join(', ')} is added as an exact copy of ${m.attrs[0]}. Predict the decision of the cell ${askCell.label}.`, `Acum ${m.attrs.slice(1).join(', ')} este adăugat ca o copie exactă a lui ${m.attrs[0]}. Prezice decizia celulei ${askCell.label}.`)) : null,
    cites: [FX('err-true-base', base.errTrue)],
  });
  if (dup) {
    frames.push({
      id: 'errors-3', mode: 'errors', state: { kind: 'errors', table: full, reveal: 'decision', copy: true, flipCell: flip ? flip.label : null, indicators: false, joint: false },
      // the table carries P_NB for every cell; the caption names the cell that flipped and its scores
      caption: bi((L) => `${L.t('With the copy, Naive Bayes multiplies the same evidence twice; the table gives P_NB for every cell.', 'Cu copia, Bayes Naiv înmulțește aceeași dovadă de două ori; tabelul dă P_NB pentru fiecare celulă.')} ${flip
        ? `${L.t('The decision of', 'Decizia celulei')} ${flip.label} ${L.t('changed to', 's-a schimbat în')} ${lab(m, flip.nbDecision)}: P_NB ${L.t('is', 'este')} ${joinList(L, m.classes.map((cls, i) => `${L.n(flip.nb[i])} ${L.t('for', 'pentru')} ${lab(m, cls)}`))}.`
        : L.t('No decision changed.', 'Nicio decizie nu s-a schimbat.')}`),
      ask: bi((L) => L.t('Predict: two error numbers can be computed, one against the true distribution and one against the distribution Naive Bayes builds. Which one does the exam ask for?', 'Prezice: se pot calcula două rate ale erorii, una față de distribuția adevărată și una față de distribuția construită de Bayes Naiv. Care e cerută la examen?')),
      cites: flip ? flip.nb.map((v, i) => FX(`nb:${flip.label}:${m.classes[i]}`, v)) : [],
    });
    frames.push({
      id: 'errors-4', mode: 'errors', state: { kind: 'errors', table: full, reveal: 'errors', copy: true, indicators: true, joint: false },
      caption: bi((L) => `${L.t('Error against the true distribution', 'Eroarea față de distribuția adevărată')} = ${sumText(L, fullWrong)} = ${L.n(full.errTrue)}. ${L.t('Error against the distribution Naive Bayes builds', 'Eroarea față de distribuția construită de Bayes Naiv')} = ${L.n(full.errNB)}. ${L.t('The exam asks for the true one.', 'La examen se cere cea adevărată.')}`),
      ask: bi((L) => L.t('Predict: what is the error rate of Joint Bayes on the same data, with the copy?', 'Prezice: cât este rata erorii la Bayes Optimal pe aceleași date, cu copia?')),
      cites: [FX('err-true', full.errTrue), FX('err-nb', full.errNB)],
    });
  }
  const jbBase = base.errJB;
  frames.push({
    id: 'errors-5', mode: 'errors', state: { kind: 'errors', table: full, reveal: 'errors', copy: dup, indicators: true, joint: true },
    caption: bi((L) => `${L.t('Joint Bayes decides', 'Bayes Optimal decide')}: ${full.cells.filter((c) => c.truth.some((v) => v.sign() > 0)).map((c) => `${c.label} → ${lab(m, c.jbDecision)}`).join('; ')}. ${L.t('Its error rate', 'Rata erorii lui')} = ${L.n(full.errJB)}${dup ? (full.errJB.equals(jbBase) ? `, ${L.t('the same as without the copy', 'la fel ca fără copie')} (${L.n(jbBase)})` : `, ${L.t('without the copy it was', 'fără copie era')} ${L.n(jbBase)}`) : ''}.`),
    ask: null,
    cites: [FX('err-joint', full.errJB)],
  });
  return frames;
}

// All frames for the modes the block asks for, in the order given. The parameter counter closes the joint mode.
export function nbFrames(props) {
  const m = nbModel(props);
  const out = [];
  for (const mode of props.modes) {
    if (mode === 'joint') out.push(...jointFrames(m));
    else if (mode === 'laplace') out.push(...laplaceFrames(m));
    else if (mode === 'errors') out.push(...errorFrames(m));
    else throw new RangeError(`ml-nb: unknown mode "${mode}"`);
  }
  out.forEach((f, k) => { if (f.ask) { const pk = nbPick(m, f, k); if (pk) f.pick = pk; } });
  return { model: m, frames: out };
}

// Problems with the props that validateViz cannot see from the shape alone; [] when the frames build.
export function nbProblems(props) {
  try {
    const m = nbModel(props);
    if (props.modes.some((x) => !NB_MODES.includes(x))) return ['modes must be a subset of joint, laplace, errors'];
    if ((props.modes.includes('laplace') || props.modes.includes('joint')) && m.hasP) return ['joint and laplace modes need a table of counts, not a P column'];
    // the errors frames say "an exact copy of the first attribute": any other added attribute would be described wrongly
    if (props.modes.includes('errors')) {
      const [first, ...rest] = m.attrs;
      const fi = m.cols.indexOf(first);
      for (const a of rest) {
        const ai = m.cols.indexOf(a);
        if (m.T.rows.some((r) => String(r[ai]) !== String(r[fi]))) return [`errors mode: ${a} must be an exact copy of ${first} in every row (the frames describe a duplicated attribute)`];
      }
    }
    nbFrames(props);
    return [];
  } catch (e) {
    return [String(e.message || e)];
  }
}
