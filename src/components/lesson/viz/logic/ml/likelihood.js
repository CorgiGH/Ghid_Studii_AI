// ml-likelihood (lesson 18): the likelihood curve L(theta) = theta^h (1-theta)^t of a coin, its logarithm, its area, and
// the maximum for other data. Exact arithmetic comes from the ML formula kit; a caption uses only this module's facts.
import { evaluate, toNumber } from '../../../../../ml/calc/formula.js';
import { caption, fact, sup } from './fact-text.js';
import { enNoun, roNoun } from '../words.js';

const STEPS = 200; // curve points: theta = 0, 0.005, ..., 1
const NATS = 6; // the ln curve shows this many nats below its maximum
const L_EXPR = 'theta^h*(1-theta)^(n-h)';

export const likelihood = (theta, h, n) => evaluate(L_EXPR, { theta, h, n });
const num = (x) => toNumber(x);
export const logLikelihood = (theta, h, n) => {
  const L = likelihood(theta, h, n);
  return num(L) === 0 ? -Infinity : num(evaluate('ln(L)', { L }));
};
export const argmax = (h, n) => evaluate('h/n', { h, n });
// area under L on [0,1]: h! t! / (n+1)! = 1 / ((n+1) C(n,h))
export const area = (h, n) => evaluate('1/((n+1)*binom(n,h))', { h, n });

export function datasetsOf(data) {
  return (Array.isArray(data) ? data : [data]).map((d) => ({ heads: d.heads, n: d.n, tails: d.n - d.heads }));
}

function curveOf(h, n) {
  const am = argmax(h, n);
  const Lmax = num(likelihood(am, h, n));
  const lmax = logLikelihood(am, h, n);
  return Array.from({ length: STEPS + 1 }, (_, i) => {
    const theta = i / STEPS;
    const L = num(likelihood(theta, h, n));
    const l = logLikelihood(theta, h, n);
    return { theta, L, l, y: L / Lmax, yl: Math.max(0, (l - (lmax - NATS)) / NATS) };
  });
}

// theta^h (1-theta)^t written with superscripts; a power of 1 shows no exponent, a power of 0 no factor.
export function formula(h, t) {
  const f = (base, k) => (k === 0 ? '' : k === 1 ? base : `${base}${sup(k)}`);
  return `${f('θ', h)}${f('(1−θ)', t)}` || '1';
}

// Where the candidate thetas sit on the drawing: y is the height as a share of the axis, 0 on the axis itself (or when clipped).
function pointsOf(grid, h, n, key) {
  const am = argmax(h, n);
  const Lmax = num(likelihood(am, h, n));
  const lmax = logLikelihood(am, h, n);
  return grid.map((g, i) => {
    const L = num(likelihood(g, h, n));
    const l = logLikelihood(g, h, n);
    const y = key === 'L' ? L / Lmax : Math.max(0, (l - (lmax - NATS)) / NATS);
    return { theta: g, y, id: `${key}${i}` };
  });
}

const NOUN = { head: ['head', 'heads', 'stemă', 'steme'], tail: ['tail', 'tails', 'ban', 'bani'], toss: ['toss', 'tosses', 'aruncare', 'aruncări'] };
// "4 heads", "1 tail", "60 de steme": the count is a fact, the noun follows its number.
const cn = (f, kind, l, n) => `${n(f)} ${l === 'en' ? enNoun(f.value, NOUN[kind][0], NOUN[kind][1]) : roNoun(f.value, NOUN[kind][2], NOUN[kind][3])}`;

const mk = (id, f, label) => ({ id, fact: f, label });
const HEADS = { en: 'heads', ro: 'steme' };
const TAILS = { en: 'tails', ro: 'bani' };
const TOSSES = { en: 'tosses', ro: 'aruncări' };

// The pick before a reveal: which value of theta is the maximum. Options are theta values (facts, so both languages print them
// with their own decimal mark); the right one is computed from the data, the wrong ones are the slips: the middle, the
// candidate beside the peak, the share of tails.
function thetaPick(id, prompt, right, extras, why) {
  const seen = new Set([right.canon]);
  const opts = [right];
  for (const x of extras) if (!seen.has(x.canon)) { seen.add(x.canon); opts.push(x); }
  opts.sort((a, b) => a.value - b.value);
  return { key: id, prompt, options: opts.map((f) => ({ id: f.canon, label: f.text })), right: right.canon, why };
}
const clip = (x) => Math.min(0.95, Math.max(0.05, Math.round(x * 100) / 100));

export function mlLikelihood({ data, grid, prior }) {
  const sets = datasetsOf(data);
  const main = sets[0];
  const frames = [];
  const ticks = [0, 0.5, 1].map((x) => fact(x));

  const base = (d) => {
    const hf = fact(d.heads, { kind: 'count' });
    const tf = fact(d.tails, { kind: 'count' });
    const nf = fact(d.n, { kind: 'count' });
    return { hf, tf, nf, marks: [mk('heads', hf, HEADS), mk('tails', tf, TAILS), mk('n', nf, TOSSES)] };
  };

  // --- the main data: question, three values, ln, area ---
  {
    const { hf, tf, nf, marks: dm } = base(main);
    const curve = curveOf(main.heads, main.n);
    const am = argmax(main.heads, main.n);
    const amf = fact(num(am));
    const Lm = fact(num(likelihood(am, main.heads, main.n)));
    const gs = grid.map((g) => ({ g, gf: fact(g), L: likelihood(g, main.heads, main.n) }));
    gs.forEach((x) => { x.Lf = fact(num(x.L)); x.l = logLikelihood(x.g, main.heads, main.n); x.lf = fact(x.l); });
    const form = formula(main.heads, main.tails);
    const gMarks = gs.map((x, i) => mk(`theta${i}`, x.gf, { en: 'candidate θ', ro: 'θ candidat' }));

    {
      const { caption: cap, used } = caption((l, n) => (l === 'en'
        ? `A coin: ${cn(nf, 'toss', l, n)} gave ${cn(hf, 'head', l, n)} and ${cn(tf, 'tail', l, n)}. L(θ) is the probability of exactly these results when the coin shows heads with probability θ. Which candidate makes the data most probable: ${gs.map((x) => n(x.gf)).join(', ')}?`
        : `O monedă: ${cn(nf, 'toss', l, n)} au dat ${cn(hf, 'head', l, n)} și ${cn(tf, 'tail', l, n)}. L(θ) este probabilitatea exactă a acestor rezultate când moneda cade stemă cu probabilitatea θ. Care candidat face datele cele mai probabile: ${gs.map((x) => n(x.gf)).join('; ')}?`));
      const pick = thetaPick('ask',
        { en: 'Where is the peak of L(θ)? Pick the θ.', ro: 'Unde este vârful lui L(θ)? Alege θ.' },
        amf, [...gs.map((x) => x.gf), fact(0.5)],
        { en: `θ = ${amf.text.en}: the share of heads, ${main.heads} / ${main.n}.`, ro: `θ = ${amf.text.ro}: ponderea stemelor, ${main.heads} / ${main.n}.` });
      frames.push({ id: 'ask', kind: 'ask', caption: cap, facts: used, pick, marks: [...dm, ...gMarks], candidates: gs.map((x) => x.g), points: grid.map((g, i) => ({ theta: g, y: 0, id: `theta${i}` })), hidden: [amf, Lm, ...gs.map((x) => x.Lf)] });
    }
    {
      const zeros = gs.filter((x) => num(x.L) === 0);
      const { caption: cap, used } = caption((l, n) => {
        const vals = gs.map((x) => `L(${n(x.gf)}) = ${n(x.Lf)}`).join('; ');
        const zero = zeros.map((x) => {
          if (x.g === 1) return l === 'en' ? ` A coin with θ = ${n(x.gf)} never shows tails, but the data has ${cn(tf, 'tail', l, n)}.` : ` O monedă cu θ = ${n(x.gf)} nu dă niciodată ban, dar datele au ${cn(tf, 'tail', l, n)}.`;
          if (x.g === 0) return l === 'en' ? ` A coin with θ = ${n(x.gf)} never shows heads, but the data has ${cn(hf, 'head', l, n)}.` : ` O monedă cu θ = ${n(x.gf)} nu dă niciodată stemă, dar datele au ${cn(hf, 'head', l, n)}.`;
          return '';
        }).join('');
        return l === 'en'
          ? `For these data L(θ) = ${form}. ${vals}.${zero} The curve peaks at θ = ${n(amf)}, which is ${n(hf)} / ${n(nf)}, the share of heads in the data; there L = ${n(Lm)}. If we take the logarithm, ℓ(θ) = ln L(θ), does the peak move?`
          : `Pentru aceste date L(θ) = ${form}. ${vals}.${zero} Curba are maximul la θ = ${n(amf)}, adică ${n(hf)} / ${n(nf)}, ponderea stemelor din date; acolo L = ${n(Lm)}. Dacă luăm logaritmul, ℓ(θ) = ln L(θ), se mută maximul?`;
      });
      frames.push({
        id: 'values', kind: 'curve', fn: 'L', caption: cap, facts: used, curve,
        axis: { top: Lm, bottom: fact(0) }, candidates: gs.map((x) => x.g), points: pointsOf(grid, main.heads, main.n, 'L'), peak: num(am),
        marks: [...dm, ...gs.flatMap((x, i) => [mk(`theta${i}`, x.gf, { en: 'θ', ro: 'θ' }), mk(`L${i}`, x.Lf, { en: `L(${x.gf.text.en})`, ro: `L(${x.gf.text.ro})` })]), mk('argmax', amf, { en: 'maximum at θ', ro: 'maximul la θ' }), mk('Lmax', Lm, { en: 'L at the maximum', ro: 'L în maxim' })],
      });
    }
    {
      const lmax = logLikelihood(am, main.heads, main.n);
      const lmf = fact(lmax);
      const samplePeak = (key) => curve.reduce((b, p) => (p[key] > b[key] ? p : b)).theta;
      const moved = Math.abs(samplePeak('l') - samplePeak('L')) > 1e-9;
      const { caption: cap, used } = caption((l, n) => {
        const vals = gs.map((x) => (num(x.L) === 0 ? `ℓ(${n(x.gf)}) = ${n(x.lf)} (L = ${n(x.Lf)})` : `ℓ(${n(x.gf)}) = ${n(x.lf)}`)).join('; ');
        const stay = moved
          ? (l === 'en' ? 'The peak moved.' : 'Maximul s-a mutat.')
          : (l === 'en' ? `The peak did not move: it is still at θ = ${n(amf)}. The logarithm changes the heights but never their order, and it turns the product into a sum.` : `Maximul nu s-a mutat: e tot la θ = ${n(amf)}. Logaritmul schimbă înălțimile, dar nu ordinea lor, și transformă produsul într-o sumă.`);
        return l === 'en'
          ? `Now ℓ(θ) = ln L(θ). ${vals}. At the maximum ℓ = ${n(lmf)}. ${stay} What area do you think lies under the curve of L?`
          : `Acum ℓ(θ) = ln L(θ). ${vals}. În maxim ℓ = ${n(lmf)}. ${stay} Ce arie crezi că e sub curba lui L?`;
      });
      frames.push({
        id: 'ln', kind: 'curve', fn: 'l', caption: cap, facts: used, curve,
        axis: { top: lmf, bottom: fact(lmax - NATS) }, candidates: gs.map((x) => x.g), points: pointsOf(grid, main.heads, main.n, 'l'), peak: num(am), moved,
        marks: [...gs.flatMap((x, i) => [mk(`theta${i}`, x.gf, { en: 'θ', ro: 'θ' }), mk(`l${i}`, x.lf, { en: `ℓ(${x.gf.text.en})`, ro: `ℓ(${x.gf.text.ro})` }), ...(num(x.L) === 0 ? [mk(`Lz${i}`, x.Lf, { en: `L(${x.gf.text.en})`, ro: `L(${x.gf.text.ro})` })] : [])]), mk('argmax', amf, { en: 'maximum at θ', ro: 'maximul la θ' }), mk('lmax', lmf, { en: 'ℓ at the maximum', ro: 'ℓ în maxim' })],
      });
    }
    {
      const A = area(main.heads, main.n);
      const Af = fact(num(A), { kind: 'text', canon: A.toString() });
      const Ad = fact(num(A));
      const one = fact(1, { kind: 'count' });
      const trap = curve.reduce((s, p, i) => (i ? s + ((p.L + curve[i - 1].L) / 2) / STEPS : s), 0);
      const { caption: cap, used } = caption((l, n) => (l === 'en'
        ? `The area under the curve of L is ${n(Af)} ≈ ${n(Ad)}, not ${n(one)}. L is not a density: it is a function of θ with the data fixed, so its area need not be ${n(one)}.`
        : `Aria de sub curba lui L este ${n(Af)} ≈ ${n(Ad)}, nu ${n(one)}. L nu e o densitate: e o funcție de θ cu datele fixate, deci aria ei nu trebuie să fie ${n(one)}.`));
      frames.push({
        id: 'area', kind: 'curve', fn: 'L', shade: true, caption: cap, facts: used, curve, trapezoid: trap,
        axis: { top: Lm, bottom: fact(0) }, candidates: [], points: [], peak: num(am),
        marks: [mk('area', Af, { en: 'area under L', ro: 'aria de sub L' }), mk('areaDecimal', Ad, { en: 'as a decimal', ro: 'ca zecimală' }), mk('one', one, { en: 'a density would have', ro: 'o densitate ar avea' })],
      });
    }
  }

  // --- the other data: ask, then the curve ---
  sets.slice(1).forEach((d, i) => {
    const { hf, tf, nf, marks: dm } = base(d);
    const am = argmax(d.heads, d.n);
    const amf = fact(num(am));
    const Lm = fact(num(likelihood(am, d.heads, d.n)));
    const curve = curveOf(d.heads, d.n);
    {
      const { caption: cap, used } = caption((l, n) => (l === 'en'
        ? `Other data: ${cn(nf, 'toss', l, n)}, ${cn(hf, 'head', l, n)} and ${cn(tf, 'tail', l, n)}. Where is the maximum of L(θ)?`
        : `Alte date: ${cn(nf, 'toss', l, n)}, ${cn(hf, 'head', l, n)} și ${cn(tf, 'tail', l, n)}. Unde este maximul lui L(θ)?`));
      const a = num(am);
      const pick = thetaPick(`ask-${i + 1}`,
        { en: 'Where is the peak of L(θ)? Pick the θ.', ro: 'Unde este vârful lui L(θ)? Alege θ.' },
        amf, [fact(clip(a - 0.2)), fact(clip(a + 0.2)), fact(0.5)],
        { en: `θ = ${amf.text.en}: ${d.heads} / ${d.n}.`, ro: `θ = ${amf.text.ro}: ${d.heads} / ${d.n}.` });
      frames.push({ id: `ask-${i + 1}`, kind: 'ask', caption: cap, facts: used, pick, marks: dm, candidates: [], points: [], hidden: [amf, Lm] });
    }
    {
      const { caption: cap, used } = caption((l, n) => (l === 'en'
        ? `With ${cn(hf, 'head', l, n)} in ${cn(nf, 'toss', l, n)} the maximum is at θ = ${n(amf)}, which is ${n(hf)} / ${n(nf)}. The vertical axis is rescaled for these data: its top is L = ${n(Lm)}.`
        : `Cu ${cn(hf, 'head', l, n)} din ${cn(nf, 'toss', l, n)} maximul e la θ = ${n(amf)}, adică ${n(hf)} / ${n(nf)}. Axa verticală e rescalată pentru aceste date: vârful ei este L = ${n(Lm)}.`));
      frames.push({
        id: `curve-${i + 1}`, kind: 'curve', fn: 'L', caption: cap, facts: used, curve, axis: { top: Lm, bottom: fact(0) }, candidates: [], points: [], peak: num(am),
        marks: [...dm, mk('argmax', amf, { en: 'maximum at θ', ro: 'maximul la θ' }), mk('Lmax', Lm, { en: 'L at the maximum', ro: 'L în maxim' })],
      });
    }
  });

  // --- a Beta(a, b) prior: the product L(θ)·p(θ) peaks at the MAP value, beside the MLE value ---
  if (prior) {
    const { a, b } = prior;
    const { hf, tf, nf } = base(main);
    const mle = argmax(main.heads, main.n);
    const mleF = fact(num(mle));
    const mapV = (main.heads + a - 1) / (main.n + a + b - 2);
    const mapF = fact(mapV);
    const h2 = main.heads + a - 1;
    const n2 = main.n + a + b - 2;
    const curveL = curveOf(main.heads, main.n);
    const curveP = curveOf(h2, n2);
    const af = fact(a - 1, { kind: 'count' });
    const bf = fact(b - 1, { kind: 'count' });
    const pa = fact(a, { kind: 'count' });
    const pb = fact(b, { kind: 'count' });
    {
      const { caption: cap, used } = caption((l, n) => (l === 'en'
        ? `A prior Beta(${n(pa)}, ${n(pb)}) acts as if we had already seen ${n(af)} extra heads and ${n(bf)} extra tails. The data are still ${cn(hf, 'head', l, n)} and ${cn(tf, 'tail', l, n)}. Where does the product L(θ)·p(θ) peak?`
        : `Un prior Beta(${n(pa)}, ${n(pb)}) se poartă ca și cum am fi văzut deja încă ${n(af)} steme și ${n(bf)} bani. Datele rămân ${cn(hf, 'head', l, n)} și ${cn(tf, 'tail', l, n)}. Unde are vârful produsul L(θ)·p(θ)?`));
      const pick = thetaPick('prior-ask',
        { en: 'Where is the peak of L(θ)·p(θ)? Pick the θ.', ro: 'Unde este vârful lui L(θ)·p(θ)? Alege θ.' },
        mapF, [mleF, fact(0.5), fact(clip(mapV + 0.1)), fact(clip(mapV - 0.1))],
        { en: `θ = ${mapF.text.en}: (${main.heads} + ${a - 1}) / (${main.n} + ${a - 1} + ${b - 1}).`, ro: `θ = ${mapF.text.ro}: (${main.heads} + ${a - 1}) / (${main.n} + ${a - 1} + ${b - 1}).` });
      frames.push({ id: 'prior-ask', kind: 'ask', caption: cap, facts: used, pick, marks: [mk('heads', hf, HEADS), mk('tails', tf, TAILS), mk('n', nf, TOSSES), mk('alpha', pa, { en: 'α', ro: 'α' }), mk('beta', pb, { en: 'β', ro: 'β' })], candidates: [], points: [], hidden: [mapF] });
    }
    {
      const { caption: cap, used } = caption((l, n) => (l === 'en'
        ? `The solid curve is L(θ), peak at θ_MLE = ${n(mleF)}. The dashed curve is L(θ)·p(θ) for the Beta(${n(pa)}, ${n(pb)}) prior, peak at θ_MAP = (${n(hf)} + ${n(af)}) / (${n(nf)} + ${n(af)} + ${n(bf)}) = ${n(mapF)}. The prior pulls the peak toward ${mapV < num(mle) ? 'the middle' : 'the prior'}; each curve is drawn up to its own peak.`
        : `Curba plină este L(θ), cu vârful la θ_MLE = ${n(mleF)}. Curba punctată este L(θ)·p(θ) pentru priorul Beta(${n(pa)}, ${n(pb)}), cu vârful la θ_MAP = (${n(hf)} + ${n(af)}) / (${n(nf)} + ${n(af)} + ${n(bf)}) = ${n(mapF)}. Priorul trage vârful spre ${mapV < num(mle) ? 'mijloc' : 'prior'}; fiecare curbă e desenată până la propriul vârf.`));
      frames.push({
        id: 'prior', kind: 'curve', fn: 'L', caption: cap, facts: used, curve: curveL, curve2: curveP,
        axis: null, candidates: [], points: [], peak: num(mle), peak2: mapV,
        marks: [mk('mle', mleF, { en: 'θ_MLE', ro: 'θ_MLE' }), mk('map', mapF, { en: 'θ_MAP', ro: 'θ_MAP' })],
      });
    }
  }

  return { n: frames.length, frames, ticks, steps: STEPS };
}
