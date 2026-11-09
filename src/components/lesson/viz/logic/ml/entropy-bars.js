// Pure logic of the ml-entropy-bars widget. Two modes, chosen by props.venn:
//   compare (Lecția 7): bars of [a+, b-] squares, their entropy H[a+,b-] and the H(p) curve; mirror and maximum.
//   ig (Lecția 8): splits are the groups of one variable X, each [Y+, Y-] counts; the bars H(Y), H(Y|X), the gap IG,
//     the same gap in the other direction, and the Venn diagram of H(X), H(Y), IG, H(X|Y), H(Y|X), H(X,Y).
// Every number comes from mathKit's H over the counts, so the drawing and the captions agree by construction.
import Fraction from '../../../../../ml/calc/fraction.js';
import { H } from '../../../../../ml/calc/mathKit.js';
import { both, bits, fmtFrac, fmtNum, joinList } from './prob-format.js';
import { enCount, roCount } from '../words.js';

const EQ = 1e-9;
const MINUS = '−';

// Entropy of a list of counts (zeros allowed, at least one positive).
export function Hcounts(counts) {
  const total = counts.reduce((s, x) => s + x, 0);
  if (!(total > 0)) throw new RangeError('entropy: the counts must not all be zero');
  return H(...counts.map((x) => x / total));
}
export const Hab = (a, b) => Hcounts([a, b]);
export const curvePoint = (p) => ({ p, H: Hcounts([p, 1 - p]) });

const label = (a, b) => `[${a}+,${b}${MINUS}]`;
const pFrac = (a, b) => new Fraction(a, a + b);
const pText = (a, b, l) => fmtFrac(pFrac(a, b), l, 'fraction');
const cmpWord = (x, y, l) => (Math.abs(x - y) < EQ ? (l === 'ro' ? 'egală cu' : 'equal to') : x > y ? (l === 'ro' ? 'mai mare decât' : 'greater than') : (l === 'ro' ? 'mai mică decât' : 'smaller than'));
const cmpSym = (x, y) => (Math.abs(x - y) < EQ ? '=' : x > y ? '>' : '<');
const crit = (l, ro, en) => (l === 'ro' ? ro : en);
const unit = (x, l) => (Math.abs(x - 1) < 1e-12 ? 'bit' : l === 'ro' ? 'biți' : 'bits');

const validSplit = (s) => Array.isArray(s) && s.length === 2 && s.every((x) => Number.isInteger(x) && x >= 0) && s[0] + s[1] > 0;

function bar(a, b) { return { a, b, H: Hab(a, b), label: label(a, b), p: pFrac(a, b) }; }

// ---------------- compare mode ----------------
// The pick of an ask frame (own picks): the learner taps the bar with the larger entropy, or "la fel". The reason of
// each option is the share of + in the bar, against 1/2 (the more even, the more mixed).
function barPick(k, A, B) {
  const far = (x) => Math.abs(x.p.toNumber() - 0.5);
  const right = Math.abs(A.H - B.H) < EQ ? 'same' : A.H > B.H ? 'a' : 'b';
  const share = (x, l) => `${x.label}: p = ${pText(x.a, x.b, l)}`;
  const nearer = far(A) < far(B) ? A : B;
  const further = nearer === A ? B : A;
  const why = both((l) => (right === 'same'
    ? crit(l, `La fel: ${share(A, l)} și ${share(B, l)} sunt la aceeași distanță de 1/2.`, `The same: ${share(A, l)} and ${share(B, l)} are equally far from 1/2.`)
    : crit(l, `${nearer.label} are proporția de + mai aproape de 1/2 (${share(nearer, l)}), deci e mai amestecată.`, `${nearer.label} has its share of + closer to 1/2 (${share(nearer, l)}), so it is more mixed.`)));
  const wrongBar = both((l) => crit(l,
    `${further.label} e mai aproape de un nod pur: ${share(further, l)}, mai departe de 1/2 decât ${share(nearer, l)}.`,
    `${further.label} is closer to a pure node: ${share(further, l)}, further from 1/2 than ${share(nearer, l)}.`));
  const notSame = both((l) => crit(l,
    `Nu sunt la fel de amestecate: ${share(A, l)} și ${share(B, l)} sunt la distanțe diferite de 1/2.`,
    `They are not equally mixed: ${share(A, l)} and ${share(B, l)} are at different distances from 1/2.`));
  const whys = {};
  if (right === 'same') { whys.a = why; whys.b = why; } else { whys[right === 'a' ? 'b' : 'a'] = wrongBar; whys.same = notSame; }
  return {
    key: `bar-${k}`, kind: 'bar',
    prompt: both((l) => crit(l, 'Atinge bara cu entropia mai mare, sau alege «la fel».', 'Tap the bar with the larger entropy, or pick "the same".')),
    options: [{ id: 'a', label: { en: A.label, ro: A.label } }, { id: 'b', label: { en: B.label, ro: B.label } }, { id: 'same', label: { en: 'the same', ro: 'la fel' } }],
    right, why, whys,
  };
}

function compareFrames(splits) {
  const frames = [];
  const nPairs = Math.floor(splits.length / 2);
  for (let k = 0; k < nPairs; k++) {
    const A = bar(...splits[2 * k]), B = bar(...splits[2 * k + 1]);
    const base = { pair: k, bars: [A, B] };
    frames.push({
      ...base, kind: 'ask', values: false, points: [], curve: true, slider: false,
      caption: both((l) => crit(l,
        `Care bară are entropia mai mare: ${A.label} sau ${B.label}? Alege înainte să vezi valorile.`,
        `Which bar has the larger entropy: ${A.label} or ${B.label}? Decide before you see the values.`)),
    });
    const far = (x) => Math.abs(x.p.toNumber() - 0.5);
    const sameDist = Math.abs(far(A) - far(B)) < EQ;
    frames.at(-1).pick = barPick(k, A, B);
    frames.push({
      ...base, kind: 'show', values: true, points: [A, B], curve: true, slider: false,
      caption: both((l) => {
        let s = crit(l,
          `H${A.label} = ${bits(A.H)[l]} este ${cmpWord(A.H, B.H, l)} H${B.label} = ${bits(B.H)[l]}. Punctele de pe curbă sunt la p = ${pText(A.a, A.b, l)} și p = ${pText(B.a, B.b, l)}.`,
          `H${A.label} = ${bits(A.H)[l]} is ${cmpWord(A.H, B.H, l)} H${B.label} = ${bits(B.H)[l]}. The points on the curve sit at p = ${pText(A.a, A.b, l)} and p = ${pText(B.a, B.b, l)}.`);
        if (!sameDist) {
          const nearer = far(A) < far(B) ? A : B;
          s += crit(l, ` Cu cât p e mai aproape de 1/2 (aici ${nearer.label}), cu atât entropia e mai mare.`, ` The closer p is to 1/2 (here ${nearer.label}), the larger the entropy.`);
        }
        return s;
      }),
    });
  }
  // the maximum, found on a grid of p = 0, 0.01, ..., 1
  let best = { p: 0, H: -1 };
  for (let i = 0; i <= 100; i++) { const c = curvePoint(i / 100); if (c.H > best.H + 1e-12) best = c; }
  const ends = [curvePoint(0).H, curvePoint(1).H];
  const pOpts = [...new Map([0, 0.25, best.p, 1].map((p) => [String(p), p])).values()];
  const pLabel = (p) => both((l) => `p = ${fmtFrac(new Fraction(Math.round(p * 100), 100), l, 'fraction')}`);
  frames.push({
    pick: {
      key: 'max', kind: 'list',
      prompt: both((l) => crit(l, 'Unde este H cel mai mare?', 'Where is H the largest?')),
      options: pOpts.map((p) => ({ id: String(p), label: pLabel(p) })), right: String(best.p),
      why: both((l) => crit(l, 'La p = 1/2 cele două clase sunt la fel de probabile: nodul e cel mai amestecat.', 'At p = 1/2 the two classes are equally likely: the node is the most mixed.')),
      whys: Object.fromEntries(pOpts.filter((p) => p !== best.p).map((p) => [String(p), (p === 0 || p === 1)
        ? both((l) => crit(l, `La ${pLabel(p)[l]} nodul e pur: H = 0.`, `At ${pLabel(p)[l]} the node is pure: H = 0.`))
        : both((l) => crit(l, `La ${pLabel(p)[l]} o clasă e mai probabilă decât cealaltă; mută cursorul spre mijloc.`, `At ${pLabel(p)[l]} one class is more likely than the other; move the slider toward the middle.`))])),
    },
    kind: 'max-ask', bars: [], values: false, points: [], curve: true, slider: true, max: best,
    caption: both((l) => crit(l,
      'Mută cursorul de sub curbă: unde este H cel mai mare? Decide înainte să se coloreze maximul.',
      'Move the slider under the curve: where is H the largest? Decide before the maximum is coloured.')),
  });
  frames.push({
    kind: 'max-show', bars: [], values: false, points: [], curve: true, slider: true, max: best, showMax: true,
    caption: both((l) => crit(l,
      `Maximul este H = ${fmtNum(best.H, l, 4)}, la p = ${fmtFrac(new Fraction(Math.round(best.p * 100), 100), l, 'fraction')}: cele două rezultate la fel de probabile, ca la [n+,n${MINUS}]. La capete, H(0) = ${fmtNum(ends[0], l, 4)} și H(1) = ${fmtNum(ends[1], l, 4)}.`,
      `The maximum is H = ${fmtNum(best.H, l, 4)}, at p = ${fmtFrac(new Fraction(Math.round(best.p * 100), 100), l, 'fraction')}: the two outcomes equally likely, as in [n+,n${MINUS}]. At the ends, H(0) = ${fmtNum(ends[0], l, 4)} and H(1) = ${fmtNum(ends[1], l, 4)}.`)),
  });
  if (splits.length % 2 === 1) {
    const A = bar(...splits.at(-1));
    const M = bar(A.b, A.a);
    const same = Math.abs(A.H - M.H) < EQ;
    frames.push({
      pick: {
        key: 'mirror', kind: 'list',
        prompt: both((l) => crit(l, 'Se schimbă entropia?', 'Does the entropy change?')),
        options: [{ id: 'yes', label: { en: 'yes', ro: 'da' } }, { id: 'no', label: { en: 'no', ro: 'nu' } }], right: same ? 'no' : 'yes',
        why: both((l) => crit(l, 'Entropia depinde doar de cât de amestecat e nodul, nu de care clasă e majoritară: H(p) = H(1 − p).', 'Entropy depends only on how mixed the node is, not on which class is the majority: H(p) = H(1 − p).')),
        whys: { [same ? 'yes' : 'no']: both((l) => crit(l, 'Întoarcerea schimbă doar numele claselor; proporțiile rămân aceleași, deci și H.', 'Flipping only swaps the class names; the shares stay the same, and so does H.')) },
      },
      kind: 'mirror-ask', bars: [A], values: false, points: [], curve: true, slider: false,
      caption: both((l) => crit(l,
        `Întoarcem bara: ${A.label} devine ${M.label}. Se schimbă entropia?`,
        `Flip the bar: ${A.label} becomes ${M.label}. Does the entropy change?`)),
    });
    frames.push({
      kind: 'mirror-show', bars: [A, M], values: true, points: [A, M], curve: true, slider: false, same,
      caption: both((l) => crit(l,
        `H${A.label} = ${bits(A.H)[l]} și H${M.label} = ${bits(M.H)[l]}: ${same ? 'aceeași valoare, punctul sare simetric de la p = ' + pText(A.a, A.b, l) + ' la p = ' + pText(M.a, M.b, l) + ', adică H(p) = H(1 − p)' : 'valori diferite'}.`,
        `H${A.label} = ${bits(A.H)[l]} and H${M.label} = ${bits(M.H)[l]}: ${same ? 'the same value, the point jumps symmetrically from p = ' + pText(A.a, A.b, l) + ' to p = ' + pText(M.a, M.b, l) + ', that is H(p) = H(1 − p)' : 'different values'}.`)),
    });
  }
  return frames;
}

// ---------------- information-gain mode ----------------
export function igModel(splits, venn) {
  const G = splits.length;
  const xName = venn.X, yName = venn.Y;
  const xGroups = venn.xGroups || splits.map((_, g) => `${xName}=${g + 1}`);
  const yLabels = venn.yLabels || [`${yName}+`, `${yName}${MINUS}`];
  // how a class of Y is named in a sentence: Y=Scumpă when the lesson names the classes, Y+ / Y− otherwise
  const yClass = venn.yLabels ? venn.yLabels.map((c) => `${yName}=${c}`) : yLabels;
  const N = splits.reduce((s, [a, b]) => s + a + b, 0);
  const sizes = splits.map(([a, b]) => a + b);
  const yPlus = splits.reduce((s, [a]) => s + a, 0), yMinus = splits.reduce((s, [, b]) => s + b, 0);
  const wX = sizes.map((n) => new Fraction(n, N)); // P(X = group)
  const hGroup = splits.map(([a, b]) => Hab(a, b));
  const HY = Hab(yPlus, yMinus);
  const HYgX = wX.reduce((s, w, g) => s + w.toNumber() * hGroup[g], 0);
  const IGy = HY - HYgX;
  // the other direction: groups by Y, each is the count of every X group
  const yGroups = [splits.map(([a]) => a), splits.map(([, b]) => b)];
  const wY = [new Fraction(yPlus, N), new Fraction(yMinus, N)];
  const hYgroup = yGroups.map((c) => (c.reduce((s, x) => s + x, 0) > 0 ? Hcounts(c) : 0));
  const HX = Hcounts(sizes);
  const HXgY = wY.reduce((s, w, k) => s + w.toNumber() * hYgroup[k], 0);
  const IGx = HX - HXgY;
  const cells = splits.flat();
  const HXY = Hcounts(cells);
  const simple = hGroup.reduce((s, h) => s + h, 0) / G;
  return { G, N, xName, yName, xGroups, yLabels, yClass, named: !!venn.yLabels, splits, sizes, yPlus, yMinus, wX, wY, hGroup, hYgroup, yGroups, HY, HYgX, IG: IGy, HX, HXgY, IGx, HXY, simple };
}

function igFrames(M) {
  const { xName: X, yName: Y } = M;
  const frames = [];
  const hb = (name, value, kind, cap = true) => ({ name, value, kind, cap });
  const eqW = M.wX.every((w) => w.equals(M.wX[0]));
  const groupRows = (names, splits, ws, hs) => splits.map((s, g) => ({ name: names[g], counts: label(s[0], s[1]), w: ws[g], H: hs[g] }));
  // when the lesson names the classes, the [a+,b−] counts of the groups need the key: which class is + and which is −
  const key = (k) => (M.named ? `${M.yClass[k]} (${k === 0 ? '+' : MINUS})` : M.yClass[k]);
  frames.push({
    kind: 'hy', dir: 'y', bars: [hb(`H(${Y})`, M.HY, 'full')], venn: null,
    // the groups of X are the data the question needs: their counts show now, their H and weight on the next frame
    groups: groupRows(M.xGroups, M.splits, M.wX, M.hGroup).map((g) => ({ ...g, hidden: true })),
    caption: both((l) => crit(l,
      `În set sunt ${roCount(M.yPlus, 'exemplu', 'exemple')} cu ${key(0)} și ${roCount(M.yMinus, 'exemplu', 'exemple')} cu ${key(1)}: H(${Y}) = ${bits(M.HY)[l]} ${unit(M.HY, l)}. Dacă afli ${X}, cât din nesiguranța asta rămâne?`,
      `The set has ${enCount(M.yPlus, 'example', 'examples')} with ${key(0)} and ${enCount(M.yMinus, 'example', 'examples')} with ${key(1)}: H(${Y}) = ${bits(M.HY)[l]} ${unit(M.HY, l)}. If you learn ${X}, how much of this uncertainty is left?`)),
  });
  frames.push({
    kind: 'hyx', dir: 'y', bars: [hb(`H(${Y})`, M.HY, 'full', false), hb(`H(${Y}|${X})`, M.HYgX, 'cond')],
    groups: groupRows(M.xGroups, M.splits, M.wX, M.hGroup), venn: null,
    caption: both((l) => {
      const terms = M.wX.map((w, g) => `${fmtFrac(w, l, 'decimal')}·${bits(M.hGroup[g])[l]}`).join(' + ');
      return crit(l,
        `H(${Y}|${X}) = ${terms} = ${bits(M.HYgX)[l]}: media pe grupe, cu ponderile P(${X})${eqW ? '' : `, nu media simplă ${bits(M.simple)[l]}`}.`,
        `H(${Y}|${X}) = ${terms} = ${bits(M.HYgX)[l]}: the average over the groups, weighted by P(${X})${eqW ? '' : `, not the plain mean ${bits(M.simple)[l]}`}.`);
    }),
  });
  frames.push({
    kind: 'ig', dir: 'y', bars: [hb(`H(${Y})`, M.HY, 'full'), hb(`H(${Y}|${X})`, M.HYgX, 'cond')], stack: { rest: M.HYgX, ig: M.IG, whole: M.HY },
    groups: [], venn: null,
    caption: both((l) => crit(l,
      `IG(${Y};${X}) = H(${Y}) ${MINUS} H(${Y}|${X}) = ${bits(M.HY)[l]} ${MINUS} ${bits(M.HYgX)[l]} = ${bits(M.IG)[l]} ${unit(M.IG, l)}: cât din H(${Y}) dispare după ce afli ${X}.`,
      `IG(${Y};${X}) = H(${Y}) ${MINUS} H(${Y}|${X}) = ${bits(M.HY)[l]} ${MINUS} ${bits(M.HYgX)[l]} = ${bits(M.IG)[l]} ${unit(M.IG, l)}: how much of H(${Y}) disappears once you know ${X}.`)),
  });
  const same = Math.abs(M.IG - M.IGx) < EQ;
  frames.push({
    kind: 'rev', dir: 'x', bars: [hb(`H(${X})`, M.HX, 'full'), hb(`H(${X}|${Y})`, M.HXgY, 'cond')], stack: { rest: M.HXgY, ig: M.IGx, whole: M.HX },
    groups: M.yGroups.map((c, k) => ({ name: M.yLabels[k], counts: `[${c.map((n, g) => `${n} ${M.xGroups[g]}`).join(', ')}]`, w: M.wY[k], H: M.hYgroup[k] })),
    venn: null,
    caption: both((l) => {
      const terms = M.wY.map((w, k) => `${fmtFrac(w, l, 'decimal')}·${bits(M.hYgroup[k])[l]}`).join(' + ');
      return crit(l,
        `Invers: H(${X}) = ${bits(M.HX)[l]} și H(${X}|${Y}) = ${terms} = ${bits(M.HXgY)[l]}. ${same ? `Diferența, calculată fără rotunjiri intermediare, este tot ${bits(M.IGx)[l]}: IG este simetric. (Valorile sunt rotunjite la 4 zecimale.)` : `Diferența este ${bits(M.IGx)[l]}.`}`,
        `Reverse: H(${X}) = ${bits(M.HX)[l]} and H(${X}|${Y}) = ${terms} = ${bits(M.HXgY)[l]}. ${same ? `The difference, computed without intermediate rounding, is again ${bits(M.IGx)[l]}: IG is symmetric. (Values are rounded to 4 decimals.)` : `The difference is ${bits(M.IGx)[l]}.`}`);
    }),
    same,
  });
  const regions = { left: M.HXgY, mid: M.IG, right: M.HYgX, union: M.HXY, hx: M.HX, hy: M.HY };
  frames.push({
    kind: 'venn-ask', dir: 'venn', bars: [], groups: [], venn: { ...regions, filled: false },
    bank: [M.IG, M.HYgX, M.HXgY],
    caption: both((l) => crit(l,
      `Diagrama Venn: cercul din stânga este H(${X}), cel din dreapta H(${Y}). Pune valorile ${joinList([M.IG, M.HYgX, M.HXgY].map((v) => bits(v)[l]), l)} în H(${X}|${Y}), IG(${X};${Y}) și H(${Y}|${X}), apoi verifică.`,
      `The Venn diagram: the left circle is H(${X}), the right one H(${Y}). Put the values ${joinList([M.IG, M.HYgX, M.HXgY].map((v) => bits(v)[l]), l)} into H(${X}|${Y}), IG(${X};${Y}) and H(${Y}|${X}), then check.`)),
  });
  frames.push({
    kind: 'venn', dir: 'venn', bars: [], groups: [], venn: { ...regions, filled: true },
    caption: both((l) => crit(l,
      `H(${X}|${Y}) = ${bits(M.HXgY)[l]} (doar ${X}), IG(${X};${Y}) = ${bits(M.IG)[l]} (intersecția), H(${Y}|${X}) = ${bits(M.HYgX)[l]} (doar ${Y}); împreună, reuniunea este H(${X},${Y}) = ${bits(M.HXY)[l]}. (Valorile sunt rotunjite la 4 zecimale.)`,
      `H(${X}|${Y}) = ${bits(M.HXgY)[l]} (only ${X}), IG(${X};${Y}) = ${bits(M.IG)[l]} (the overlap), H(${Y}|${X}) = ${bits(M.HYgX)[l]} (only ${Y}); together the union is H(${X},${Y}) = ${bits(M.HXY)[l]}. (Values are rounded to 4 decimals.)`)),
  });
  // the question each reveal answers ends the caption of the frame before it
  const ask = {
    ig: { ro: `Cât din H(${Y}) dispare după ce afli ${X}, adică IG(${Y};${X}) = H(${Y}) ${MINUS} H(${Y}|${X})?`, en: `How much of H(${Y}) disappears once you know ${X}, that is IG(${Y};${X}) = H(${Y}) ${MINUS} H(${Y}|${X})?` },
    rev: { ro: `Invers: afli ${Y} și încerci să-l ghicești pe ${X}. Cât este IG(${X};${Y}) = H(${X}) ${MINUS} H(${X}|${Y})? Iese același număr?`, en: `The other way: you learn ${Y} and try to guess ${X}. What is IG(${X};${Y}) = H(${X}) ${MINUS} H(${X}|${Y})? Is it the same number?` },
  };
  frames.forEach((f, i) => {
    const q = ask[frames[i + 1]?.kind];
    if (!q) return;
    f.ask = q;
    f.caption = both((l) => `${f.caption[l]} ${q[l]}`);
  });
  return frames;
}

export function entropyBars(props) {
  const splits = props.splits;
  if (!Array.isArray(splits) || splits.length < 2 || !splits.every(validSplit)) throw new RangeError('entropy-bars: splits must be at least two [a, b] pairs of whole numbers, each with a + b > 0');
  if (props.venn) {
    const M = igModel(splits, props.venn);
    const frames = igFrames(M);
    return { mode: 'ig', M, frames, count: frames.length };
  }
  const frames = compareFrames(splits);
  return { mode: 'compare', frames, count: frames.length, splits };
}

