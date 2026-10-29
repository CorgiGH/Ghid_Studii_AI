// ml-freq-tree (lesson 2): natural frequencies on a probability tree. Pure. Counts and probabilities come from the
// four props through mathKit's exact arithmetic; every caption is built from the same frame state that is drawn.
import Fraction from '../../../../../ml/calc/fraction.js';
import { add, sub, mul, div } from '../../../../../ml/calc/mathKit.js';
import { roDe } from '../words.js';
import { dec, group, loc } from './probFormat.js';

const isBi = (v) => !!v && typeof v === 'object' && typeof v.en === 'string' && v.en.length > 0 && typeof v.ro === 'string' && v.ro.length > 0;
const isProb = (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 1;
export const LABEL_KEYS = ['sick', 'healthy', 'pos', 'neg', 'people'];

export function freqTreeProblems(props) {
  const out = [];
  const { population, prior, sens, fpr, labels } = props || {};
  if (!Number.isInteger(population) || population < 1) out.push('viz (ml-freq-tree): props.population must be a whole number of at least 1');
  for (const [k, v] of Object.entries({ prior, sens, fpr })) if (!isProb(v)) out.push(`viz (ml-freq-tree): props.${k} must be a number from 0 to 1`);
  if (!labels || typeof labels !== 'object' || !LABEL_KEYS.every((k) => isBi(labels[k]))) out.push(`viz (ml-freq-tree): props.labels needs ${LABEL_KEYS.join(', ')}, each { en, ro }`);
  if (out.length) return out;
  const N = new Fraction(population);
  const sickN = mul(N, Fraction.from(prior));
  const healthyN = sub(N, sickN);
  const parts = { 'population × prior': sickN, 'sick × sens': mul(sickN, Fraction.from(sens)), 'healthy × fpr': mul(healthyN, Fraction.from(fpr)) };
  for (const [k, v] of Object.entries(parts)) if (!v.isInteger()) out.push(`viz (ml-freq-tree): ${k} is ${v}, not a whole number of people; choose a population that makes every count whole`);
  if (!out.length && add(parts['sick × sens'], parts['healthy × fpr']).sign() === 0) out.push('viz (ml-freq-tree): nobody is positive, so there is no fraction to show');
  return out;
}

export const FREQ_FRAMES = 9;
export const LEAVES = ['sickPos', 'sickNeg', 'healthyPos', 'healthyNeg'];

// frames: 0 ask sick, 1 reveal split, 2 ask sick+positive, 3 reveal, 4 ask healthy+positive, 5 reveal,
// 6 ask total positives and the fraction, 7 reveal (the two positive leaves highlighted), 8 the same with probabilities.
export function freqTree(props) {
  const bad = freqTreeProblems(props);
  if (bad.length) throw new RangeError(bad[0]);
  const F = (x) => Fraction.from(x);
  const one = new Fraction(1);
  const N = new Fraction(props.population);
  const prior = F(props.prior);
  const sens = F(props.sens);
  const fpr = F(props.fpr);
  const priorC = sub(one, prior);
  const sensC = sub(one, sens);
  const fprC = sub(one, fpr);
  const sickN = mul(N, prior);
  const healthyN = sub(N, sickN);
  const c = {
    root: N,
    sick: sickN,
    healthy: healthyN,
    sickPos: mul(sickN, sens),
    sickNeg: mul(sickN, sensC),
    healthyPos: mul(healthyN, fpr),
    healthyNeg: mul(healthyN, fprC),
  };
  const total = add(c.sickPos, c.healthyPos);
  const posterior = div(c.sickPos, total);
  const edge = { sick: prior, healthy: priorC, sickPos: sens, sickNeg: sensC, healthyPos: fpr, healthyNeg: fprC };
  const prod = {
    sickPos: mul(prior, sens), sickNeg: mul(prior, sensC), healthyPos: mul(priorC, fpr), healthyNeg: mul(priorC, fprC),
  };
  const posProb = add(prod.sickPos, prod.healthyPos);
  const posterior2 = div(prod.sickPos, posProb);
  if (!posterior2.equals(posterior)) throw new RangeError('ml-freq-tree: counts and probabilities disagree');
  const n = (x) => x.toString(); // counts are whole numbers
  const cnt = {}; for (const k of Object.keys(c)) cnt[k] = n(c[k]);
  const exactPost = dec(posterior, 4) === dec(posterior, 12);
  const sign = exactPost ? '=' : '≈';
  const V = { prior: dec(prior), sens: dec(sens), fpr: dec(fpr), priorC: dec(priorC), post: dec(posterior), posProb: dec(posProb) };
  const P = {}; for (const k of Object.keys(edge)) P[k] = dec(edge[k]);
  const Q = {}; for (const k of LEAVES) Q[k] = dec(prod[k]);

  const shownAt = (s) => ({
    root: true,
    sick: s >= 1, healthy: s >= 1,
    sickPos: s >= 3, sickNeg: s >= 3,
    healthyPos: s >= 5, healthyNeg: s >= 5,
  });

  function frame(step) {
    const s = Math.max(0, Math.min(FREQ_FRAMES - 1, step));
    const kind = s === 8 ? 'info' : s % 2 === 0 ? 'ask' : 'reveal';
    const shown = shownAt(s);
    const probs = s === 8;
    const nodes = Object.keys(c).map((id) => ({
      id, shown: shown[id], count: shown[id] ? cnt[id] : null,
      edge: probs && id !== 'root' ? P[id] : null,
      product: probs && LEAVES.includes(id) ? Q[id] : null,
      hl: (s === 7 || s === 8) && (id === 'sickPos' || id === 'healthyPos'),
    }));
    const marks = [
      { id: 'given-prior', value: V.prior }, { id: 'given-sens', value: V.sens }, { id: 'given-fpr', value: V.fpr },
      { id: 'population', value: n(N) },
    ];
    for (const nd of nodes) if (nd.shown && nd.id !== 'root') marks.push({ id: `node-${nd.id}`, value: nd.count });
    if (probs) {
      for (const nd of nodes) {
        if (nd.edge !== null) marks.push({ id: `edge-${nd.id}`, value: nd.edge });
        if (nd.product !== null) marks.push({ id: `prod-${nd.id}`, value: nd.product });
      }
    }
    if (s >= 7) marks.push({ id: 'positives', value: n(total) }, { id: 'fraction', value: `${n(c.sickPos)}/${n(total)}` }, { id: 'posterior', value: V.post });
    if (s === 8) marks.push({ id: 'positive-prob', value: V.posProb });

    const T = (lang) => {
      const L = (k) => props.labels[k][lang];
      const d = (x) => (lang === 'ro' ? loc(x, 'ro') : x);
      const G = (x) => group(n(x));
      const cn = (x, k) => `${G(x)} ${lang === 'ro' ? roDe(Number(n(x))) : ''}${L(k)}`;
      return { L, d, G, cn };
    };
    const cap = (lang) => {
      const { L, d, G, cn } = T(lang);
      const en = lang === 'en';
      switch (s) {
        case 0: return en ? `Imagine ${G(N)} ${L('people')}. How many of them are ${L('sick')}?` : `Imaginează-ți ${cn(N, 'people')}. Câți ${L('sick')} sunt în acest grup?`;
        case 1: return en
          ? `${G(sickN)} of ${G(N)} are ${L('sick')} (${d(V.prior)}); the other ${G(healthyN)} are ${L('healthy')}.`
          : `Sunt ${cn(sickN, 'sick')} din ${G(N)} (${d(V.prior)}); ceilalți ${G(healthyN)} sunt ${L('healthy')}.`;
        case 2: return en
          ? `Of the ${G(sickN)} ${L('sick')}, how many are ${L('pos')}? (${d(V.sens)} of them.)`
          : `Dintre cei ${cn(sickN, 'sick')}, câți sunt ${L('pos')}? (${d(V.sens)} dintre ei.)`;
        case 3: return en
          ? `${G(sickN)} × ${d(V.sens)} = ${G(c.sickPos)} are ${L('pos')}; the other ${G(c.sickNeg)} are ${L('neg')}.`
          : `${G(sickN)} × ${d(V.sens)} = ${cn(c.sickPos, 'pos')}; ceilalți ${cn(c.sickNeg, 'neg')}.`;
        case 4: return en
          ? `Of the ${G(healthyN)} ${L('healthy')}, how many are ${L('pos')}? (${d(V.fpr)} of them.)`
          : `Dintre cei ${cn(healthyN, 'healthy')}, câți sunt ${L('pos')}? (${d(V.fpr)} dintre ei.)`;
        case 5: return en
          ? `${G(healthyN)} × ${d(V.fpr)} = ${G(c.healthyPos)} are ${L('pos')}; the other ${G(c.healthyNeg)} are ${L('neg')}.`
          : `${G(healthyN)} × ${d(V.fpr)} = ${cn(c.healthyPos, 'pos')}; ceilalți ${cn(c.healthyNeg, 'neg')}.`;
        case 6: return en
          ? `How many are ${L('pos')} in all, and how many of those are ${L('sick')}? What fraction?`
          : `Câți sunt ${L('pos')} în total și câți dintre ei sunt ${L('sick')}? Ce fracție?`;
        case 7: return en
          ? `${G(c.sickPos)} + ${G(c.healthyPos)} = ${G(total)} are ${L('pos')}; ${G(c.sickPos)} of them are ${L('sick')}. Fraction ${G(c.sickPos)}/${G(total)} ${sign} ${d(V.post)}.`
          : `${G(c.sickPos)} + ${G(c.healthyPos)} = ${cn(total, 'pos')}; dintre ei ${G(c.sickPos)} sunt ${L('sick')}. Fracția ${G(c.sickPos)}/${G(total)} ${sign} ${d(V.post)}.`;
        default: return en
          ? `With probabilities: ${d(V.prior)} × ${d(V.sens)} = ${d(Q.sickPos)} and ${d(V.priorC)} × ${d(V.fpr)} = ${d(Q.healthyPos)} are the ${L('pos')} leaves. ${d(Q.sickPos)} / (${d(Q.sickPos)} + ${d(Q.healthyPos)}) = ${d(Q.sickPos)} / ${d(V.posProb)} ${sign} ${d(V.post)}, the same fraction.`
          : `Cu probabilități: ${d(V.prior)} × ${d(V.sens)} = ${d(Q.sickPos)} și ${d(V.priorC)} × ${d(V.fpr)} = ${d(Q.healthyPos)} sunt frunzele celor ${L('pos')}. ${d(Q.sickPos)} / (${d(Q.sickPos)} + ${d(Q.healthyPos)}) = ${d(Q.sickPos)} / ${d(V.posProb)} ${sign} ${d(V.post)}, aceeași fracție.`;
      }
    };
    return { step: s, kind, nodes, marks, caption: { en: cap('en'), ro: cap('ro') }, probs };
  }

  return { n: FREQ_FRAMES, frame, counts: cnt, total: n(total), posterior: V.post, ratio: `${n(c.sickPos)}/${n(total)}`, probs: { edge: P, product: Q, positive: V.posProb } };
}
