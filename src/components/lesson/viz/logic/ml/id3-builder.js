// Pure logic of the ID3 builder widget (L9 stumps, L10 compare, L11 full). Each model lists its frames and builds, for every
// frame, the caption from the same state the widget draws; the widget reads the numbers from here and nowhere else.
//   model.frames[k]      what frame k shows (the widget's stage reads it)
//   model.caption(k, c)  { en, ro } for frame k; c = { predict, picks }
//   model.pickSpec(k, predict)  null, or { items: [{ key, prompt, options: [{ id, label }] }] }: the prediction asked at frame k
import Fraction from '../../../../../ml/calc/fraction.js';
import * as K from '../../../../../ml/calc/mathKit.js';
import {
  MINUS, SYMS, EPS, both, lab, fmt4, fmtBig, showN, boxText, prep, allIds, subTable, countsOf, weightOf, headerOf,
  tableStump, givenStump, stumpErrors, leafOf, bestIndex, tiedBest, entropyOfCounts, majorityOf, sumF, listIn, cnt,
} from './id3-common.js';

const EPS_IG = 1e-12; // mathKit's tie width: the first of equal gains wins
const nm = (s, lang) => lab(s.label, lang);
const frac = (x) => Fraction.from(x);
// "a + b + c" of counts
const plus = (xs) => xs.map(showN).join(' + ');

// ===================================================================================================================
// mode 'stumps' (L9): the root, every stump's boxes, then the weighted sums and their values
// ===================================================================================================================
export function stumpsModel(props) {
  let classes; let rootCounts; let stumps; let hRoot; let N; let targetLabel; let table = null;
  if (props.given) {
    const g = props.given;
    rootCounts = g.root.map(frac);
    classes = g.classes || SYMS.slice(0, rootCounts.length);
    stumps = g.stumps.map((d) => givenStump(d, rootCounts.length, rootCounts));
    N = sumF(rootCounts);
    hRoot = entropyOfCounts(rootCounts);
    targetLabel = g.target || 'Y';
  } else {
    const P = prep(props.table, props.target, props.positive);
    const ids = allIds(P);
    classes = P.classes;
    rootCounts = countsOf(P, ids);
    stumps = P.attrs.map((a) => tableStump(P, ids, a));
    N = weightOf(P, ids);
    hRoot = K.Hcol(subTable(P, ids), P.target);
    targetLabel = headerOf(P, P.target);
    table = { headers: P.headers, rows: P.rows };
  }
  const showValues = props.showValues !== false;
  const frames = [{ kind: 'setup' }];
  stumps.forEach((_, i) => frames.push({ kind: 'boxes', i }));
  if (showValues) frames.push({ kind: 'formula' }, { kind: 'values' }, { kind: 'winner' });
  const best = bestIndex(stumps);
  const tied = tiedBest(stumps);
  const errs = stumps.map(stumpErrors);
  const errTotal = errs.map((e) => sumF(e));
  const M = {
    mode: 'stumps', classes, rootCounts, stumps, hRoot, N, best, tied, errs, errTotal, frames, count: frames.length, targetLabel, table,
    leaves: stumps.map((s) => s.branches.map((b) => leafOf(classes, b))),
  };
  // the arithmetic of IG is written out only when the rounded numbers agree with each other
  const bs = stumps[best];
  M.igSum = Math.abs((Number(fmt4(hRoot)) - Number(fmt4(bs.hc))) - Number(fmt4(bs.ig))) < 5e-5;
  M.errFrac = errTotal[best].div(N);

  // with predict the boxes of a stump stay hidden until the learner asks for them (outline L9: predict the boxes first)
  M.boxesHidden = (k, c = {}) => !!c.predict && frames[k].kind === 'boxes' && c.picks?.[`box${frames[k].i}`] === undefined;
  M.pickSpec = (k, predict) => {
    if (predict && frames[k].kind === 'boxes') {
      const s = stumps[frames[k].i];
      return {
        items: [{
          key: `box${frames[k].i}`,
          prompt: both((lang) => (lang === 'en'
            ? `How many + and − examples fall in each branch of ${nm(s, 'en')}? Work them out, then show the boxes.`
            : `Câte exemple + și câte − cad pe fiecare ramură a lui ${nm(s, 'ro')}? Calculează-le, apoi arată cutiile.`)),
          options: [{ id: 'show', label: { en: 'Show the boxes', ro: 'Arată cutiile' } }],
        }],
      };
    }
    if (!predict || frames[k].kind !== 'formula') return null;
    return {
      items: [{
        key: 'best',
        prompt: { en: 'Which question do you think leaves the least uncertainty on average? Pick one, then press Next.', ro: 'Care întrebare crezi că lasă, în medie, cea mai mică nesiguranță? Alege, apoi apasă Mai departe.' },
        options: stumps.map((s, i) => ({ id: i, label: s.label })),
      }],
    };
  };

  M.caption = (k, c = {}) => both((lang) => {
    const f = frames[k];
    const T = (en, ro) => (lang === 'en' ? en : ro);
    const names = stumps.map((s) => nm(s, lang));
    const box0 = boxText(rootCounts);
    if (f.kind === 'setup') {
      return T(
        `Root: ${cnt('en', N, 'example', 'examples', 'exemplu', 'exemple')}, ${box0}. The possible questions: ${listIn(lang, names)}. Each one splits the examples into branches; the boxes come next.`,
        `Rădăcina: ${cnt('ro', N, 'example', 'examples', 'exemplu', 'exemple')}, ${box0}. Întrebările posibile: ${listIn(lang, names)}. Fiecare împarte exemplele în ramuri; urmează cutiile.`,
      );
    }
    if (f.kind === 'boxes') {
      const s = stumps[f.i];
      if (M.boxesHidden(k, c)) {
        return T(
          `${nm(s, lang)}: how many + and − examples fall in each branch? Count them before the boxes show.`,
          `${nm(s, lang)}: câte exemple + și câte − cad pe fiecare ramură? Numără-le înainte să apară cutiile.`,
        );
      }
      const parts = s.branches.map((b) => `${lab(b.value, lang)} ${boxText(b.counts)}`).join('; ');
      const ctrl = plus(s.branches.map((b) => b.counts[0]));
      return T(
        `${nm(s, lang)}: ${parts}. Check: the ${SYMS[0]} examples in the boxes add up, ${ctrl} = ${showN(rootCounts[0])}.`,
        `${nm(s, lang)}: ${parts}. Control: exemplele ${SYMS[0]} din cutii dau ${ctrl} = ${showN(rootCounts[0])}.`,
      );
    }
    if (f.kind === 'formula') {
      return T(
        `The average conditional entropy of a question is the sum of its branches' entropies, each weighted by the branch's share of the ${cnt('en', N, 'example', 'examples', 'exemplu', 'exemple')}. Only the form is written, no values yet. Which is the smallest?`,
        `Entropia condiționată medie a unei întrebări e suma entropiilor ramurilor ei, fiecare înmulțită cu ponderea ramurii din cele ${cnt('ro', N, 'example', 'examples', 'exemplu', 'exemple')}. Se scrie doar forma, fără valori. Care e cea mai mică?`,
      );
    }
    const vals = stumps.map((s) => `H(${lab(M.targetLabel, lang)}|${nm(s, lang)}) = ${fmt4(s.hc)}`).join(', ');
    if (f.kind === 'values') {
      const win = tied.length > 1
        ? T(`Tie between ${listIn(lang, tied.map((i) => names[i]))}: the first in order is taken.`, `Egalitate între ${listIn(lang, tied.map((i) => names[i]))}: se ia primul în ordine.`)
        : T(`The smallest is H(${lab(M.targetLabel, lang)}|${names[best]}).`, `Cea mai mică e H(${lab(M.targetLabel, lang)}|${names[best]}).`);
      const p = c.picks?.best;
      const fb = p === undefined ? '' : tied.includes(p)
        ? T(` You picked ${names[p]}: right.`, ` Ai ales ${names[p]}: corect.`)
        : T(` You picked ${names[p]}: its entropy is not the smallest.`, ` Ai ales ${names[p]}: entropia lui nu e cea mai mică.`);
      return `${vals}. ${win}${fb}`;
    }
    // winner
    const bsn = names[best];
    const ig = M.igSum
      ? `IG = H(${lab(M.targetLabel, lang)}) ${MINUS} H(${lab(M.targetLabel, lang)}|${bsn}) = ${fmt4(hRoot)} ${MINUS} ${fmt4(stumps[best].hc)} = ${fmt4(stumps[best].ig)}`
      : `IG = ${fmt4(stumps[best].ig)}`;
    const e = errs[best].filter((x) => x.sign() !== 0);
    const errTxt = e.length === 0 ? '0' : e.length === 1 ? `${showN(e[0])}/${showN(N)} = ${showN(M.errFrac)}` : `(${plus(e)})/${showN(N)} = ${showN(M.errFrac)}`;
    const leafTxt = stumps[best].branches.map((b, j) => {
      const lf = M.leaves[best][j];
      return `${lab(b.value, lang)} → ${lf.tie ? T('tie', 'egal') : String(lf.label)}`;
    }).join(', ');
    return T(
      `Root: ${bsn}. ${ig}. As a tree with one question: ${leafTxt}. Training error: ${errTxt}.`,
      `Rădăcina: ${bsn}. ${ig}. Ca arbore cu o singură întrebare: ${leafTxt}. Eroarea la antrenare: ${errTxt}.`,
    );
  });
  return M;
}

// ===================================================================================================================
// mode 'compare' (L10): two stumps (or two nodes) side by side; the learner picks <, = or > before it shows
// ===================================================================================================================
const SYM_OF = (d) => (d < 0 ? '<' : d > 0 ? '>' : '=');
const minorityShare = (counts) => {
  const n = sumF(counts);
  const small = counts.reduce((m, c) => (c.cmp(m) < 0 ? c : m), counts[0]);
  return small.div(n);
};
const commonDen = (a, b) => {
  const gcd = (x, y) => (y === 0n ? x : gcd(y, x % y));
  const l = (a.d * b.d) / gcd(a.d, b.d);
  return { x: a.n * (l / a.d), y: b.n * (l / b.d), den: l };
};

// the product P = prod over branches n^n / prod c^c (0^0 = 1) and H(Y|A) = log2(P) / N
export function productOf(stump, N) {
  let P = new Fraction(1);
  for (const b of stump.branches) {
    const n = b.n;
    if (!n.isInteger()) throw new RangeError('the product form needs whole-number counts');
    let t = n.pow(n.n);
    for (const c of b.counts) if (c.sign() !== 0) t = t.div(c.pow(c.n));
    P = P.mul(t);
  }
  const log2 = Math.log2(P.toNumber());
  return { P, value: P.toNumber(), hc: log2 / N.toNumber() };
}

function buildCase(c, ci) {
  const nC = (c.nodes ? c.nodes[0] : c.stumps[0].branches[0].counts).length;
  if (c.nodes) {
    if (nC !== 2) throw new RangeError('comparing two nodes needs two classes');
    const units = c.nodes.map((counts) => {
      const cs = counts.map(frac);
      return { counts: cs, n: sumF(cs), h: entropyOfCounts(cs), share: nC === 2 ? minorityShare(cs) : null, name: null };
    });
    const sym = nC === 2 ? SYM_OF(units[0].share.cmp(units[1].share)) : SYM_OF(units[0].h - units[1].h);
    // the entropy order must agree with the minority-share order (H(p) grows on [0, 1/2])
    const symH = Math.abs(units[0].h - units[1].h) < EPS ? '=' : SYM_OF(units[0].h - units[1].h);
    return { kind: 'nodes', ci, title: c.title, units, sym, symH, nC, frames: [{ ci, kind: 'boxes' }, { ci, kind: 'symbols' }, { ci, kind: 'values' }], decided: true };
  }
  const first = c.stumps[0];
  const rootCounts = Array.from({ length: nC }, (_, k) => sumF(first.branches.map((b) => frac(b.counts[k]))));
  const stumps = c.stumps.map((d) => givenStump(d, nC, rootCounts));
  const N = sumF(rootCounts);
  const same = stumps[0].branches.length === stumps[1].branches.length;
  const pairs = same ? stumps[0].branches.map((b, j) => {
    const o = stumps[1].branches[j];
    const wEq = b.w.equals(o.w);
    const symH = Math.abs(b.h - o.h) < EPS ? '=' : SYM_OF(b.h - o.h);
    const sh = nC === 2 ? [minorityShare(b.counts), minorityShare(o.counts)] : null;
    const sym = sh ? SYM_OF(sh[0].cmp(sh[1])) : symH;
    return { j, wEq, sym, symH, shares: sh };
  }) : [];
  const weightsEqual = same && pairs.every((p) => p.wEq);
  const allLE = pairs.every((p) => p.sym === '<' || p.sym === '=');
  const allGE = pairs.every((p) => p.sym === '>' || p.sym === '=');
  const decided = weightsEqual && (allLE || allGE);
  const verdict = !decided ? null : pairs.every((p) => p.sym === '=') ? 'tie' : allLE ? 'A' : 'B';
  const prods = decided ? null : stumps.map((s) => productOf(s, N));
  const hRoot = entropyOfCounts(rootCounts);
  const frames = decided
    ? [{ ci, kind: 'boxes' }, { ci, kind: 'symbols' }, { ci, kind: 'values' }]
    : [{ ci, kind: 'boxes' }, { ci, kind: 'product' }];
  return {
    kind: 'stumps', ci, title: c.title, stumps, rootCounts, N, nC, pairs, weightsEqual, sameShape: same, decided, verdict, prods, hRoot, frames,
    winner: prods ? (prods[0].value < prods[1].value ? 'A' : prods[0].value > prods[1].value ? 'B' : 'tie') : null,
  };
}

export function compareModel(props) {
  const cases = props.cases.map(buildCase);
  const frames = cases.flatMap((c) => c.frames);
  const caseOf = (k) => cases[frames[k].ci];
  const M = { mode: 'compare', cases, frames, count: frames.length };

  M.pickSpec = (k, predict) => {
    const f = frames[k];
    if (!predict || f.kind !== 'boxes') return null;
    const c = cases[f.ci];
    const symOpts = ['<', '=', '>'].map((s) => ({ id: s, label: s }));
    if (c.kind === 'nodes') {
      return { items: [{ key: `${c.ci}:0`, prompt: { en: 'Which entropy is bigger? Pick a symbol: first node, then the second.', ro: 'Care entropie e mai mare? Alege simbolul: primul nod față de al doilea.' }, options: symOpts }] };
    }
    if (c.decided) {
      return {
        items: c.pairs.map((p) => ({
          key: `${c.ci}:${p.j}`,
          prompt: { en: `Pair ${p.j + 1}: the entropy of the branch of A against the branch of B.`, ro: `Perechea ${p.j + 1}: entropia ramurii lui A față de cea a lui B.` },
          options: symOpts,
        })),
      };
    }
    return {
      items: [{
        key: `${c.ci}:match`,
        prompt: { en: 'Can you see the winner by matching the branches two by two?', ro: 'Se vede câștigătorul din potrivirea ramurilor două câte două?' },
        options: [{ id: 'yes', label: { en: 'Yes', ro: 'Da' } }, { id: 'no', label: { en: 'No', ro: 'Nu' } }],
      }],
    };
  };

  M.caption = (k, ctx = {}) => both((lang) => {
    const f = frames[k];
    const c = caseOf(k);
    const T = (en, ro) => (lang === 'en' ? en : ro);
    const picks = ctx.picks || {};
    const sname = (i) => nm(c.stumps[i], lang);
    if (c.kind === 'nodes') {
      const [a, b] = c.units;
      if (f.kind === 'boxes') {
        return T(
          `Two nodes: ${boxText(a.counts)} and ${boxText(b.counts)}. Which has the bigger entropy? By symmetry only the smaller count matters, so compare the minority share of each.`,
          `Două noduri: ${boxText(a.counts)} și ${boxText(b.counts)}. Care are entropia mai mare? Din simetrie contează doar numărul mai mic, deci se compară cota minoritară a fiecăruia.`,
        );
      }
      const cd = commonDen(a.share, b.share);
      const same = a.share.d === b.share.d;
      const cmpTxt = `${showN(a.share)} ${c.sym} ${showN(b.share)}${same ? '' : ` (${cd.x}/${cd.den} ${c.sym} ${cd.y}/${cd.den})`}`;
      if (f.kind === 'symbols') {
        const p = picks[`${c.ci}:0`];
        const fb = p === undefined ? '' : p === c.sym ? T(` You picked ${p}: right.`, ` Ai ales ${p}: corect.`) : T(` You picked ${p}: not that one.`, ` Ai ales ${p}: nu aceasta.`);
        return T(
          `Minority share: ${cmpTxt}. A minority share is at most 1/2, and H(p) grows with p on [0, 1/2], so the first entropy is ${c.sym === '>' ? 'bigger' : c.sym === '<' ? 'smaller' : 'equal'}.${fb}`,
          `Cota minoritară: ${cmpTxt}. O cotă minoritară e cel mult 1/2, iar H(p) crește cu p pe [0, 1/2], deci prima entropie e ${c.sym === '>' ? 'mai mare' : c.sym === '<' ? 'mai mică' : 'egală'}.${fb}`,
        );
      }
      return T(`The values: ${fmt4(a.h)} ${c.symH} ${fmt4(b.h)}.`, `Valorile: ${fmt4(a.h)} ${c.symH} ${fmt4(b.h)}.`);
    }
    // two stumps
    const [A, B] = c.stumps;
    if (f.kind === 'boxes') {
      const wA = A.branches.map((b) => `${showN(b.n)}/${showN(c.N)}`);
      const wB = B.branches.map((b) => `${showN(b.n)}/${showN(c.N)}`);
      const head = T(`Root ${boxText(c.rootCounts)}. `, `Rădăcina ${boxText(c.rootCounts)}. `);
      if (c.decided) {
        const ask = ctx.predict ? T(' Pick <, = or > for each pair before it shows.', ' Alege <, = sau > pentru fiecare pereche, înainte să apară.') : '';
        return head + T(
          `The weights coincide: ${wA.join(', ')} for both. Match the branches two by two.${ask}`,
          `Ponderile coincid: ${wA.join(', ')} la amândouă. Se potrivesc ramurile două câte două.${ask}`,
        );
      }
      const asking = ctx.predict && picks[`${c.ci}:match`] === undefined;
      if (asking) {
        return head + (c.sameShape
          ? T(`The weights: ${sname(0)} ${wA.join(', ')}; ${sname(1)} ${wB.join(', ')}.`, `Ponderile: ${sname(0)} ${wA.join(', ')}; ${sname(1)} ${wB.join(', ')}.`)
          : T(`${sname(0)} has ${A.branches.length} branches, ${sname(1)} has ${B.branches.length}.`, `${sname(0)} are ${A.branches.length} ramuri, ${sname(1)} are ${B.branches.length}.`));
      }
      const why = !c.sameShape
        ? T('The stumps have different numbers of branches.', 'Cioturile au număr diferit de ramuri.')
        : c.weightsEqual
          ? T('The pairs point in different directions.', 'Perechile arată în direcții diferite.')
          : T(`The weights differ: ${wA.join(', ')} against ${wB.join(', ')}.`, `Ponderile diferă: ${wA.join(', ')} față de ${wB.join(', ')}.`);
      const pk = picks[`${c.ci}:match`];
      const fb = !ctx.predict || pk === undefined ? '' : pk === 'no' ? T(' You said no: right.', ' Ai spus nu: corect.') : T(' You said yes: not here.', ' Ai spus da: aici nu.');
      return head + T(`${why} It does not match, so the branch-by-branch comparison cannot decide. Use the product formula.${fb}`, `${why} Nu se potrivește, deci comparația ramură cu ramură nu poate hotărî. Se trece la formula produsului.${fb}`);
    }
    if (f.kind === 'symbols') {
      const lines = c.pairs.map((p) => {
        const o = A.branches[p.j]; const q = B.branches[p.j];
        const sh = p.shares ? `${T('minority share', 'cota minoritară')} ${showN(p.shares[0])} ${p.sym} ${showN(p.shares[1])}` : `${fmt4(o.h)} ${p.sym} ${fmt4(q.h)}`;
        const pk = picks[`${c.ci}:${p.j}`];
        const fb = pk === undefined ? '' : pk === p.sym ? T(' (you picked it)', ' (ai ales corect)') : T(` (you picked ${pk})`, ` (ai ales ${pk})`);
        return `${p.j === 0 ? T('Pair', 'Perechea') : T('pair', 'perechea')} ${p.j + 1}: ${boxText(o.counts)} ${p.sym} ${boxText(q.counts)}, ${sh}${fb}`;
      });
      return T(
        `${lines.join('; ')}. The weights are the same, so the pairs can be compared branch by branch: the smaller minority share has the smaller entropy (H(p) grows on [0, 1/2]).`,
        `${lines.join('; ')}. Ponderile sunt aceleași, deci perechile se compară ramură cu ramură: cota minoritară mai mică are entropia mai mică (H(p) crește pe [0, 1/2]).`,
      );
    }
    if (f.kind === 'values') {
      const worse = c.verdict === 'A' ? sname(1) : sname(0);
      const sym = SYM_OF(A.hc - B.hc);
      const v = c.verdict === 'tie'
        ? T('The two stumps are equal.', 'Cele două cioturi sunt egale.')
        : T(`${c.verdict === 'A' ? sname(0) : sname(1)} is better: each of its branches has at most the entropy of its pair in ${worse}.`, `${c.verdict === 'A' ? sname(0) : sname(1)} e mai bun: fiecare ramură a lui are cel mult entropia perechii ei din ${worse}.`);
      return `${v} H(Y|${sname(0)}) = ${fmt4(A.hc)} ${sym} H(Y|${sname(1)}) = ${fmt4(B.hc)}.`;
    }
    // product
    const [pa, pb] = c.prods;
    const w = c.winner === 'A' ? sname(0) : c.winner === 'B' ? sname(1) : null;
    const win = w ? T(`the smaller product wins: ${w}`, `câștigă produsul mai mic: ${w}`) : T('equal products', 'produse egale');
    const igA = c.hRoot - A.hc; const igB = c.hRoot - B.hc;
    return T(
      `P_${sname(0)} = ${fmtBig(pa.value)}, P_${sname(1)} = ${fmtBig(pb.value)}; ${win}. H(Y|${sname(0)}) = log2(${fmtBig(pa.value)}) / ${showN(c.N)} = ${fmt4(pa.hc)}, H(Y|${sname(1)}) = ${fmt4(pb.hc)}. H(Y) = ${fmt4(c.hRoot)}, so IG(${sname(0)}) = ${fmt4(igA)} and IG(${sname(1)}) = ${fmt4(igB)}.`,
      `P_${sname(0)} = ${fmtBig(pa.value)}, P_${sname(1)} = ${fmtBig(pb.value)}; ${win}. H(Y|${sname(0)}) = log2(${fmtBig(pa.value)}) / ${showN(c.N)} = ${fmt4(pa.hc)}, H(Y|${sname(1)}) = ${fmt4(pb.hc)}. H(Y) = ${fmt4(c.hRoot)}, deci IG(${sname(0)}) = ${fmt4(igA)} și IG(${sname(1)}) = ${fmt4(igB)}.`,
    );
  });
  return M;
}

// ===================================================================================================================
// mode 'full' (L11): the whole ID3 by hand, one split per frame
// ===================================================================================================================
const impure = (counts) => counts.filter((c) => c.sign() !== 0).length > 1;

export function fullModel(props) {
  const P = prep(props.table, props.target, props.positive);
  const root = allIds(P);
  const N = weightOf(P, root);
  const hRoot = K.Hcol(subTable(P, root), P.target);
  const mkNode = (ids, parent, edge, attrsLeft, parentMajority) => {
    const counts = countsOf(P, ids);
    return { ids, parent, edge, attrsLeft, counts, n: sumF(counts), h: entropyOfCounts(counts), children: null, test: null, exp: -1, parentMajority };
  };
  const rootNode = mkNode(root, null, null, P.attrs, null);
  const expansions = [];
  const queue = [rootNode];
  const leaves = [];
  while (queue.length) {
    const node = queue.shift();
    node.major = node.ids.length ? majorityOf(P, node.counts) : { label: node.parentMajority, tie: false };
    const cands = node.attrsLeft
      .filter((a) => new Set(node.ids.map((i) => String(P.rows[i][P.names.indexOf(a)]))).size > 1)
      .map((a) => tableStump(P, node.ids, a));
    if (!node.ids.length || !impure(node.counts) || cands.length === 0) { node.leaf = true; leaves.push(node); continue; }
    let bi = 0;
    cands.forEach((c, i) => { if (c.ig > cands[bi].ig + EPS_IG) bi = i; });
    const best = cands[bi];
    const maxIg = best.ig;
    const tiedAttrs = cands.filter((c) => Math.abs(c.ig - maxIg) < 1e-9).map((c) => c.attr);
    node.exp = expansions.length;
    node.test = best.attr;
    const rest = node.attrsLeft.filter((a) => a !== best.attr);
    node.children = best.branches.map((b) => mkNode(b.ids, node, { attr: best.attr, value: b.value }, rest, node.major.label));
    expansions.push({ node, cands, best: bi, bestStump: best, tiedAttrs });
    queue.push(...node.children);
  }
  const m = expansions.length;
  const frames = [{ kind: 'setup' }, ...expansions.map((e, i) => ({ kind: 'split', e: i })), { kind: 'final' }];
  // summary of the finished tree
  const classify = (row) => {
    let n = rootNode;
    while (n.children) {
      const ai = P.names.indexOf(n.test);
      const kid = n.children.find((c) => String(c.edge.value) === String(row[ai]));
      if (!kid) return n.major.label;
      n = kid;
    }
    return n.major.label;
  };
  const errW = sumF(P.rows.map((r, i) => (String(classify(r)) === String(r[P.ti]) ? new Fraction(0) : P.w[i])));
  const tests = expansions.length;
  const depthOf = (n) => (n.children ? 1 + Math.max(...n.children.map(depthOf)) : 0);
  const pathOf = (n) => { const out = []; for (let x = n; x.parent; x = x.parent) out.unshift(x.edge); return out; };
  const M = {
    mode: 'full', P, root: rootNode, expansions, frames, count: frames.length, N, hRoot, leaves, tests, depth: depthOf(rootNode), errW, errFrac: errW.div(N), pathOf,
    classes: P.classes,
  };
  // the rows of the node a frame is about (for the table highlight)
  M.focusNode = (k) => (frames[k].kind === 'setup' ? rootNode : frames[k].kind === 'split' ? expansions[frames[k].e].node : null);
  M.nextNode = (k) => (k < m ? expansions[k].node : null);
  // nodes drawn at frame k: the root, and the children of every split shown so far
  M.isSplit = (node, k) => node.exp >= 0 && node.exp < k;

  M.pickSpec = (k, predict) => {
    if (!predict || k >= m) return null;
    const e = expansions[k];
    return {
      items: [{
        key: `e${k}`,
        prompt: { en: `Which attribute goes in ${k === 0 ? 'the root' : 'the marked node'}? Pick one, then press Next.`, ro: `Ce atribut pui ${k === 0 ? 'în rădăcină' : 'în nodul marcat'}? Alege, apoi apasă Mai departe.` },
        options: e.cands.map((c) => ({ id: c.attr, label: c.label })),
      }],
    };
  };

  const pathText = (n, lang) => {
    const p = pathOf(n);
    if (!p.length) return lang === 'en' ? 'root' : 'rădăcina';
    return p.map((e) => `${lab(headerOf(P, e.attr), lang)} = ${String(e.value)}`).join(', ');
  };
  M.pathText = pathText;
  const tName = (lang) => lab(headerOf(P, P.target), lang);

  M.caption = (k, c = {}) => both((lang) => {
    const f = frames[k];
    const T = (en, ro) => (lang === 'en' ? en : ro);
    if (f.kind === 'setup') {
      const ask = c.predict && m > 0 ? T(' Which attribute goes in the root? Pick one first.', ' Ce atribut intră în rădăcină? Alege întâi.') : '';
      return T(
        `Root: ${cnt('en', N, 'example', 'examples', 'exemplu', 'exemple')}, ${boxText(rootNode.counts)}, H(${tName(lang)}) = ${fmt4(hRoot)}.${ask}`,
        `Rădăcina: ${cnt('ro', N, 'example', 'examples', 'exemplu', 'exemple')}, ${boxText(rootNode.counts)}, H(${tName(lang)}) = ${fmt4(hRoot)}.${ask}`,
      );
    }
    if (f.kind === 'split') {
      const e = expansions[f.e];
      const node = e.node;
      const cs = e.cands.map((x) => `H(${tName(lang)}|${lab(x.label, lang)}) = ${fmt4(x.hc)}`).join(', ');
      const best = lab(e.bestStump.label, lang);
      const tie = e.tiedAttrs.length > 1
        ? T(` Tie in the gain between ${listIn(lang, e.tiedAttrs.map((a) => lab(headerOf(P, a), lang)))}: the first in the table is taken.`, ` Egalitate la câștig între ${listIn(lang, e.tiedAttrs.map((a) => lab(headerOf(P, a), lang)))}: se ia primul din tabel.`)
        : '';
      const pk = c.picks?.[`e${f.e}`];
      const fb = pk === undefined ? '' : e.tiedAttrs.includes(pk)
        ? T(` You picked ${lab(headerOf(P, pk), lang)}: right.`, ` Ai ales ${lab(headerOf(P, pk), lang)}: corect.`)
        : T(` You picked ${lab(headerOf(P, pk), lang)}: not the best.`, ` Ai ales ${lab(headerOf(P, pk), lang)}: nu e cel mai bun.`);
      const kids = node.children.map((ch) => {
        const stop = ch.leaf ? ` → ${T('leaf', 'frunză')} ${String(ch.major.label)}` : ` → ${T('to split', 'de împărțit')}`;
        return `${String(ch.edge.value)} ${boxText(ch.counts)}${stop}`;
      }).join('; ');
      const where = node.parent
        ? T(`Node ${pathText(node, lang)} ${boxText(node.counts)}`, `Nodul ${pathText(node, lang)} ${boxText(node.counts)}`)
        : T(`Root ${boxText(node.counts)}`, `Rădăcina ${boxText(node.counts)}`);
      const next = c.predict && f.e + 1 < m ? T(' Next: pick the attribute for the marked node.', ' Urmează: alege atributul pentru nodul marcat.') : '';
      return T(
        `${where}: ${cs}. The best is ${best} (IG = ${fmt4(e.bestStump.ig)}).${tie}${fb} Branches: ${kids}.${next}`,
        `${where}: ${cs}. Cel mai bun e ${best} (IG = ${fmt4(e.bestStump.ig)}).${tie}${fb} Ramuri: ${kids}.${next}`,
      );
    }
    return T(
      `The tree is done: ${cnt('en', tests, 'test', 'tests', 'test', 'teste')}, ${cnt('en', leaves.length, 'leaf', 'leaves', 'frunză', 'frunze')}. Training error: ${showN(errW)}/${showN(N)}.`,
      `Arborele e gata: ${cnt('ro', tests, 'test', 'tests', 'test', 'teste')}, ${cnt('ro', leaves.length, 'leaf', 'leaves', 'frunză', 'frunze')}. Eroarea la antrenare: ${showN(errW)}/${showN(N)}.`,
    );
  });
  return M;
}

export function id3Model(props) {
  if (props.mode === 'stumps') return stumpsModel(props);
  if (props.mode === 'compare') return compareModel(props);
  return fullModel(props);
}
