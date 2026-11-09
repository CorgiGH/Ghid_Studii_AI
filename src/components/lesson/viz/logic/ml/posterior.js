// ml-posterior (lesson 19): prior, likelihood, product and posterior bars of Bayes' rule for hypotheses, and what happens
// to h_MAP when the priors are made equal. Exact arithmetic from the ML formula kit; captions use this module's facts only.
import { evaluate, toNumber, Fraction } from '../../../../../ml/calc/formula.js';
import { caption, fact, sup } from './fact-text.js';
import { listEn, listRo } from '../words.js';

const LOG_BELOW = 1e-3; // a frame whose largest value is under this is drawn on a log axis

// A prior or likelihood is a number or a formula such as '(1/6)^10' or '0.1^7*0.5^3'.
const val = (x) => (typeof x === 'string' ? evaluate(x) : Fraction.from(x));
const num = (x) => toNumber(x);
const sum = (xs) => xs.reduce((s, x) => s.add(x), new Fraction(0));

const winners = (vals) => {
  let best = vals[0];
  for (const v of vals) if (v.cmp(best) > 0) best = v;
  return vals.map((v, i) => (v.cmp(best) === 0 ? i : -1)).filter((i) => i >= 0);
};

export function posteriorOf(hypotheses) {
  const pri = hypotheses.map((h) => val(h.prior));
  const lik = hypotheses.map((h) => val(h.lik));
  for (const [i, x] of [...pri, ...lik].entries()) {
    if (x.sign() <= 0 || x.cmp(new Fraction(1)) > 0) throw new RangeError(`every prior and likelihood must be between 0 and 1 (above 0), got ${x.toString()} (${i < pri.length ? 'a prior' : 'a likelihood'})`);
  }
  if (!sum(pri).equals(new Fraction(1))) throw new RangeError(`the priors must sum to 1, got ${sum(pri).toString()}`);
  const prod = lik.map((l, i) => l.mul(pri[i]));
  const pd = sum(prod);
  const post = prod.map((x) => x.div(pd));
  const eq = new Fraction(1, hypotheses.length);
  const prodEq = lik.map((l) => l.mul(eq));
  return { pri, lik, prod, pd, post, eq, prodEq, map: winners(prod), ml: winners(lik), mapEq: winners(prodEq) };
}

const SUPE = (e) => `10${sup(e)}`;
function scaleOf(values, kind) {
  const nums = values.map(num);
  const max = Math.max(...nums);
  if (kind === 'abs') return { kind: 'abs', fractions: nums, ticks: [fact(0), fact(1)] };
  if (max < LOG_BELOW) {
    const logs = values.map((v) => num(evaluate('log10(x)', { x: v })));
    const lo = Math.floor(Math.min(...logs)) - 1;
    const hi = Math.ceil(Math.max(...logs));
    // one tick per power of ten, evenly spaced along the bar
    const tick = (e) => ({ ...fact(10 ** e, { kind: 'text', canon: `1e${e}` }), text: { en: SUPE(e), ro: SUPE(e) } });
    const ticks = Array.from({ length: hi - lo + 1 }, (_, i) => tick(lo + i));
    return { kind: 'log', lo, hi, fractions: logs.map((x) => (x - lo) / (hi - lo)), ticks };
  }
  return { kind: 'rel', fractions: nums.map((x) => x / max), ticks: [] };
}

const mk = (id, f, label) => ({ id, fact: f, label });
const LAB = {
  prior: { en: 'prior P(h)', ro: 'a priori P(h)' },
  lik: { en: 'likelihood P(D|h)', ro: 'verosimilitate P(D|h)' },
  prod: { en: 'P(D|h)P(h)', ro: 'P(D|h)P(h)' },
  post: { en: 'posterior P(h|D)', ro: 'a posteriori P(h|D)' },
};

export function mlPosterior({ hypotheses }) {
  const S = posteriorOf(hypotheses);
  const names = hypotheses.map((h) => h.name);
  const list = (idx) => idx.map((i) => names[i]).join(' = ');
  const frames = [];

  const bars = (id, values, facts, win, scaleKind, labelKey, extraFacts = []) => {
    const sc = scaleOf(values, scaleKind);
    return {
      scale: sc,
      bars: names.map((name, i) => ({ name, value: num(values[i]), fraction: sc.fractions[i], fact: facts[i], win: win.includes(i), pct: extraFacts[i] || null })),
      marks: names.map((name, i) => mk(`${id}${i}`, facts[i], { en: `${LAB[labelKey].en}, ${name}`, ro: `${LAB[labelKey].ro}, ${name}` })),
    };
  };
  const rowText = (l, n, fs, hint) => names.map((nm, i) => `${nm} ${n(fs[i])}`).join(l === 'en' ? '; ' : '; ') + (hint || '');

  const priF = S.pri.map((x) => fact(num(x)));
  const likF = S.lik.map((x) => fact(num(x)));
  const prodF = S.prod.map((x) => fact(num(x)));
  const pdF = fact(num(S.pd));
  const postF = S.post.map((x) => fact(num(x), { dec: 4 }));
  const pctF = S.post.map((x) => fact(num(x), { kind: 'pct' }));
  const eqF = fact(num(S.eq));
  const prodEqF = S.prodEq.map((x) => fact(num(x)));
  const topPrior = winners(S.pri);
  const flips = S.mapEq.join() !== S.map.join();
  // the data of the problem: shown on every frame, so each question has its numbers on screen
  const given = names.map((name, i) => ({
    name,
    prior: mk(`gp${i}`, priF[i], { en: `P(h), ${name}`, ro: `P(h), ${name}` }),
    lik: mk(`gl${i}`, likF[i], { en: `P(D|h), ${name}`, ro: `P(D|h), ${name}` }),
  }));

  frames.push({
    id: 'ask', quantity: 'none', bars: names.map((name) => ({ name, value: null, fraction: 0, fact: null, win: false, pct: null })), names, scale: { kind: 'abs', ticks: [] }, marks: [], facts: [], hidden: [...prodF, pdF, ...postF],
    caption: caption((l) => (l === 'en'
      ? `Hypotheses ${names.join(' and ')} compete to explain the data D; the table gives each one its prior P(h) and its likelihood P(D|h). Before seeing D, which hypothesis is more plausible?`
      : `Ipotezele ${names.join(' și ')} se întrec să explice datele D; tabelul dă pentru fiecare probabilitatea a priori P(h) și verosimilitatea P(D|h). Înainte să vedem D, care ipoteză e mai plauzibilă?`)).caption,
  });
  {
    const { caption: cap, used } = caption((l, n) => (l === 'en'
      ? `Prior P(h): ${rowText(l, n, priF)}. Before the data, ${list(topPrior)} is more plausible. Which hypothesis explains the data better, that is, has the larger P(D|h)?`
      : `A priori P(h): ${rowText(l, n, priF)}. Înainte de date, ${list(topPrior)} e mai plauzibilă. Care ipoteză explică datele mai bine, adică are P(D|h) mai mare?`));
    frames.push({ id: 'prior', quantity: 'prior', names, caption: cap, facts: used, ...bars('prior', S.pri, priF, [], 'abs', 'prior') });
  }
  // a hypothesis name may be lower case (cancer), so the sentence that names h_ML starts with a lead-in
  const mlSentence = (l) => {
    const ns = S.ml.map((i) => names[i]);
    if (ns.length === 1) {
      return l === 'en' ? `The data are explained better by the hypothesis ${ns[0]}: it is h_ML.` : `Datele sunt explicate mai bine de ipoteza ${ns[0]}: ea este h_ML.`;
    }
    return l === 'en' ? `The data are explained equally well by the hypotheses ${listEn(ns)}: each is an h_ML.` : `Datele sunt explicate la fel de bine de ipotezele ${listRo(ns)}: fiecare este h_ML.`;
  };
  {
    const { caption: cap, used } = caption((l, n) => (l === 'en'
      ? `Likelihood P(D|h): ${rowText(l, n, likF)}. ${mlSentence(l)} Which hypothesis will have the largest P(D|h)P(h), the h_MAP?`
      : `Verosimilitate P(D|h): ${rowText(l, n, likF)}. ${mlSentence(l)} Care ipoteză va avea P(D|h)P(h) cel mai mare, h_MAP?`));
    frames.push({ id: 'lik', quantity: 'lik', names, caption: cap, facts: used, ...bars('lik', S.lik, likF, S.ml, 'rel', 'lik') });
  }
  {
    const same = S.map.join() === S.ml.join();
    const { caption: cap, used } = caption((l, n) => (l === 'en'
      ? `P(D|h)P(h): ${rowText(l, n, prodF)}. The largest is ${list(S.map)}, so h_MAP = ${list(S.map)}${same ? ', the same as h_ML.' : `, not h_ML = ${list(S.ml)}: the prior changed the winner.`} Divide each product by their sum P(D): what are the posteriors?`
      : `P(D|h)P(h): ${rowText(l, n, prodF)}. Cel mai mare este ${list(S.map)}, deci h_MAP = ${list(S.map)}${same ? ', la fel ca h_ML.' : `, nu h_ML = ${list(S.ml)}: priorul a schimbat câștigătoarea.`} Împarte fiecare produs la suma lor P(D): cât sunt probabilitățile a posteriori?`));
    frames.push({ id: 'product', quantity: 'prod', names, caption: cap, facts: used, ...bars('prod', S.prod, prodF, S.map, 'rel', 'prod') });
  }
  {
    const { caption: cap, used } = caption((l, n) => (l === 'en'
      ? `P(D) = ${n(pdF)}, the sum of the products. Posterior P(h|D): ${names.map((nm, i) => `${nm} ${n(postF[i])} (${n(pctF[i])})`).join('; ')}. If the priors were equal, would the winner change?`
      : `P(D) = ${n(pdF)}, suma produselor. A posteriori P(h|D): ${names.map((nm, i) => `${nm} ${n(postF[i])} (${n(pctF[i])})`).join('; ')}. Dacă priorii ar fi egali, s-ar schimba câștigătoarea?`));
    const b = bars('post', S.post, postF, S.map, 'abs', 'post', pctF);
    frames.push({
      id: 'posterior', quantity: 'post', names, caption: cap, facts: used, ...b,
      marks: [mk('pd', pdF, { en: 'P(D), the sum', ro: 'P(D), suma' }), ...b.marks, ...pctF.map((f, i) => mk(`pct${i}`, f, { en: `percent, ${names[i]}`, ro: `procent, ${names[i]}` }))],
    });
  }
  {
    const { caption: cap, used } = caption((l, n) => {
      const verdict = flips
        ? (l === 'en' ? `The winner changed: h_MAP = ${list(S.mapEq)}, which is h_ML (${list(S.ml)}), as it must be when the priors are equal.` : `Câștigătoarea s-a schimbat: h_MAP = ${list(S.mapEq)}, adică h_ML (${list(S.ml)}), cum e firesc când priorii sunt egali.`)
        : (l === 'en' ? `The winner did not change: h_MAP = ${list(S.mapEq)}, still the same as h_ML.` : `Câștigătoarea nu s-a schimbat: h_MAP = ${list(S.mapEq)}, la fel ca h_ML.`);
      return l === 'en'
        ? `Equal priors, P(h) = ${n(eqF)} for each. P(D|h)P(h): ${rowText(l, n, prodEqF)}. ${verdict}`
        : `Priori egali, P(h) = ${n(eqF)} pentru fiecare. P(D|h)P(h): ${rowText(l, n, prodEqF)}. ${verdict}`;
    });
    const b = bars('eq', S.prodEq, prodEqF, S.mapEq, 'rel', 'prod');
    frames.push({ id: 'equal', quantity: 'prod', names, caption: cap, facts: used, ...b, marks: [mk('eqprior', eqF, { en: 'every prior', ro: 'fiecare prior' }), ...b.marks], flips });
  }
  // The pick before each reveal (own picks with PickBar): the question that ends a frame's caption is answered on the next
  // frame, so the frame that asks carries the pick. Options and the right one come from the same exact values; every wrong
  // option has its own reason.
  const TIE = { en: 'they are equal', ro: 'sunt egale' };
  const nameOpts = (tie) => [...names.map((nm) => ({ id: nm, label: { en: nm, ro: nm } })), ...(tie ? [{ id: 'tie', label: TIE }] : [])];
  const winnerId = (idx) => (idx.length === 1 ? names[idx[0]] : 'tie');
  const rowOf = (fs) => ({ en: names.map((nm, i) => `${nm} ${fs[i].text.en}`).join('; '), ro: names.map((nm, i) => `${nm} ${fs[i].text.ro}`).join('; ') });
  const whyNames = (idx, fs, what) => {
    const row = rowOf(fs);
    const out = {};
    for (const o of nameOpts(true)) {
      if (o.id === winnerId(idx)) continue;
      out[o.id] = o.id === 'tie'
        ? { en: `They differ: ${row.en}.`, ro: `Diferă: ${row.ro}.` }
        : { en: `${what.en} of ${o.id} is smaller: ${row.en}.`, ro: `${what.ro} lui ${o.id} e mai mic: ${row.ro}.` };
    }
    return out;
  };
  const pickOf = (key, prompt, right, options, why, whys) => ({ key, prompt, options, right, why, whys });
  const byId = Object.fromEntries(frames.map((f) => [f.id, f]));
  byId.ask.pick = pickOf('ask', { en: 'Before the data, which hypothesis is more plausible?', ro: 'Înainte de date, care ipoteză e mai plauzibilă?' },
    winnerId(topPrior), nameOpts(topPrior.length > 1),
    { en: `The larger prior P(h): ${rowOf(priF).en}.`, ro: `Priorul P(h) mai mare: ${rowOf(priF).ro}.` },
    whyNames(topPrior, priF, { en: 'The prior P(h)', ro: 'Priorul P(h) al' }));
  byId.prior.pick = pickOf('prior', { en: 'Which hypothesis has the larger P(D|h)?', ro: 'Care ipoteză are P(D|h) mai mare?' },
    winnerId(S.ml), nameOpts(S.ml.length > 1),
    { en: `Only P(D|h) counts here, not the prior: ${rowOf(likF).en}.`, ro: `Aici contează doar P(D|h), nu priorul: ${rowOf(likF).ro}.` },
    whyNames(S.ml, likF, { en: 'P(D|h)', ro: 'P(D|h) al' }));
  byId.lik.pick = pickOf('lik', { en: 'Which hypothesis will be h_MAP?', ro: 'Care ipoteză va fi h_MAP?' },
    winnerId(S.map), nameOpts(S.map.length > 1),
    { en: `h_MAP compares the products P(D|h)P(h): ${rowOf(prodF).en}.`, ro: `h_MAP compară produsele P(D|h)P(h): ${rowOf(prodF).ro}.` },
    whyNames(S.map, prodF, { en: 'The product P(D|h)P(h)', ro: 'Produsul P(D|h)P(h) al' }));
  if (S.map.length === 1) {
    const w = S.map[0];
    const cands = [[postF[w], 'right'], [prodF[w], 'prod'], [likF[w], 'lik'], [priF[w], 'prior']];
    const seen = new Set();
    const opts = cands.filter(([f]) => (seen.has(f.canon) ? false : (seen.add(f.canon), true))).slice(0, 3);
    const reason = {
      prod: { en: 'That is the product P(D|h)P(h), not yet divided by P(D), the sum of the products.', ro: 'Acesta e produsul P(D|h)P(h), încă neîmpărțit la P(D), suma produselor.' },
      lik: { en: 'That is the likelihood P(D|h): it goes the other way.', ro: 'Aceasta e verosimilitatea P(D|h): condiționarea e pe dos.' },
      prior: { en: 'That is the prior, before the data.', ro: 'Acesta e priorul, dinainte de date.' },
    };
    byId.product.pick = pickOf('product', { en: `What is P(${names[w]}|D)?`, ro: `Cât este P(${names[w]}|D)?` },
      postF[w].canon, opts.map(([f]) => ({ id: f.canon, label: f.text })).sort((a, b) => Number(a.id) - Number(b.id)),
      { en: `The product of ${names[w]} divided by P(D) = ${pdF.text.en}.`, ro: `Produsul lui ${names[w]} împărțit la P(D) = ${pdF.text.ro}.` },
      Object.fromEntries(opts.filter(([, k]) => k !== 'right').map(([f, k]) => [f.canon, reason[k]])));
  }
  byId.posterior.pick = pickOf('posterior', { en: 'With equal priors, would the winner change?', ro: 'Cu priori egali, s-ar schimba câștigătoarea?' },
    flips ? 'yes' : 'no', [{ id: 'yes', label: { en: 'yes', ro: 'da' } }, { id: 'no', label: { en: 'no', ro: 'nu' } }],
    flips
      ? { en: `Yes: with equal priors only P(D|h) decides, and h_ML = ${list(S.ml)}.`, ro: `Da: cu priori egali decide doar P(D|h), iar h_ML = ${list(S.ml)}.` }
      : { en: `No: with equal priors only P(D|h) decides, and h_ML = ${list(S.ml)} is already h_MAP.`, ro: `Nu: cu priori egali decide doar P(D|h), iar h_ML = ${list(S.ml)} e deja h_MAP.` },
    flips
      ? { no: { en: `With equal priors the prior cancels and h_ML = ${list(S.ml)} wins, not ${list(S.map)}.`, ro: `Cu priori egali priorul se simplifică și câștigă h_ML = ${list(S.ml)}, nu ${list(S.map)}.` } }
      : { yes: { en: `h_MAP = ${list(S.map)} already has the larger P(D|h), so equal priors do not move it.`, ro: `h_MAP = ${list(S.map)} are deja P(D|h) mai mare, deci priorii egali nu îl schimbă.` } });
  // on the equal-priors frame the table's prior column shows the prior its bars use
  const givenEq = given.map((g, i) => ({ ...g, prior: mk(`gp${i}`, eqF, g.prior.label), changed: true }));
  for (const fr of frames) {
    fr.given = fr.id === 'equal' ? givenEq : given;
    fr.marks = [...fr.given.flatMap((g) => [g.prior, g.lik]), ...fr.marks];
  }
  return { n: frames.length, frames, names, state: S, flips };
}

// Problems with the props that the shape check cannot see (a formula that does not evaluate, priors off 1); [] when the frames build.
export function posteriorProblems(props) {
  try {
    mlPosterior(props);
    return [];
  } catch (e) {
    return [String(e.message || e)];
  }
}
