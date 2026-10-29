// Pure logic of the ml-pmf-cdf widget (Lecția 4): pmf bars, the mean as the balance point, the squared deviations
// and the variance, a mean that is not a value, then the c.d.f. staircase. Every number drawn or written comes from
// here (exact Fractions through mathKit), never from the props' text.
import Fraction from '../../../../../ml/calc/fraction.js';
import { E, Var } from '../../../../../ml/calc/mathKit.js';
import { both, disp, dispNum, fmtFrac, joinList, pickMode, toFrac } from './prob-format.js';

// One distribution: values sorted ascending with their probabilities, and everything derived from them.
export function distribution(values, probs, name = 'X') {
  if (!Array.isArray(values) || !Array.isArray(probs) || values.length === 0 || values.length !== probs.length) {
    throw new RangeError('pmf: values and probs must be lists of the same length');
  }
  const pairs = values.map((v, i) => ({ x: toFrac(v), p: toFrac(probs[i]) })).sort((a, b) => a.x.cmp(b.x));
  const total = pairs.reduce((s, q) => s.add(q.p), new Fraction(0));
  if (!total.equals(1) || pairs.some((q) => q.p.sign() < 0)) throw new RangeError(`pmf: the probabilities must be non-negative and sum to 1 (got ${total})`);
  const xs = pairs.map((q) => q.x);
  const ps = pairs.map((q) => q.p);
  const mean = E(xs, ps);
  const variance = Var(xs, ps);
  const dev = xs.map((x) => x.sub(mean));
  const sq = dev.map((d) => d.mul(d));
  let acc = new Fraction(0);
  const cdf = ps.map((p) => { acc = acc.add(p); return acc; });
  return {
    name, xs, ps, mean, variance, dev, sq, cdf,
    ex2: E(xs.map((x) => x.mul(x)), ps),
    sd: Math.sqrt(variance.toNumber()),
    meanIsValue: xs.some((x) => x.equals(mean)),
  };
}

// The value whose F the c.d.f. frame highlights: props.cdfAt, else the largest value not above the mean.
function cdfIndex(D, cdfAt) {
  if (cdfAt !== undefined && cdfAt !== null) {
    const i = D.xs.findIndex((x) => x.equals(toFrac(cdfAt)));
    if (i >= 0) return i;
  }
  let at = 0;
  D.xs.forEach((x, i) => { if (x.cmp(D.mean) <= 0) at = i; });
  return at;
}

const list = (fs, lang, mode) => joinList(fs.map((f) => fmtFrac(f, lang, mode)), lang);
const rad = (f, l, mode) => (f.isInteger() ? fmtFrac(f, l, mode) : `(${fmtFrac(f, l, mode)})`);
const wrapNeg = (f, lang, mode) => (f.sign() < 0 ? `(${fmtFrac(f, lang, mode)})` : fmtFrac(f, lang, mode));

export function pmfCdf(props) {
  const name = props.name || 'X';
  const main = distribution(props.values, props.probs, name);
  const second = props.second ? distribution(props.second.values, props.second.probs, props.second.name || 'R') : null;
  const allP = [...main.ps, ...(second ? second.ps : [])];
  const mode = pickMode(props.format, allP);
  const at = cdfIndex(main, props.cdfAt);

  const sdText = (D) => dispNum(D.sd, 2);
  const frames = [];

  frames.push({
    kind: 'setup', view: 'main', show: {},
    caption: both((l) => (l === 'ro'
      ? `${name} ia valorile ${list(main.xs, l, mode)} cu probabilitățile ${list(main.ps, l, mode)}. În ce punct ar sta barele în echilibru pe axa numerelor?`
      : `${name} takes the values ${list(main.xs, l, mode)} with probabilities ${list(main.ps, l, mode)}. At which point would the bars balance on the number line?`)),
  });

  const meanTerms = (D, l) => D.xs.map((x, i) => `${wrapNeg(x, l, mode)}·${fmtFrac(D.ps[i], l, mode)}`).join(' + ');
  frames.push({
    kind: 'mean', view: 'main', show: { mean: true },
    caption: both((l) => (l === 'ro'
      ? `E[${name}] = ${meanTerms(main, l)} = ${fmtFrac(main.mean, l, mode)}. Triunghiul marchează punctul de echilibru al barelor.`
      : `E[${name}] = ${meanTerms(main, l)} = ${fmtFrac(main.mean, l, mode)}. The triangle marks the balance point of the bars.`)),
  });

  // ask: the deviations and their squares are drawn, the variance is not
  frames.push({
    kind: 'dev', view: 'main', show: { mean: true, dev: true },
    caption: both((l) => (l === 'ro'
      ? `Abaterile față de medie: ${list(main.dev, l, mode)}; pătratele lor: ${list(main.sq, l, mode)}. Cât este Var(${name}), media pătratelor ponderată cu probabilitățile?`
      : `Deviations from the mean: ${list(main.dev, l, mode)}; their squares: ${list(main.sq, l, mode)}. What is Var(${name}), the mean of the squares weighted by the probabilities?`)),
  });

  // (x − μ)²·p(x), in the order of the mean's x·p(x): "1/6·4" would read as 1/(6·4)
  const varTerms = (D, l) => D.xs.map((x, i) => `${fmtFrac(D.sq[i], l, mode)}·${fmtFrac(D.ps[i], l, mode)}`).join(' + ');
  frames.push({
    kind: 'variance', view: 'main', show: { mean: true, dev: true, variance: true, sd: true },
    caption: both((l) => (l === 'ro'
      ? `Var(${name}) = ${varTerms(main, l)} = ${fmtFrac(main.variance, l, mode)}. Abaterea standard σ = √${rad(main.variance, l, mode)} ≈ ${sdText(main)[l]}: paranteza se întinde la σ de o parte și de alta a mediei.`
      : `Var(${name}) = ${varTerms(main, l)} = ${fmtFrac(main.variance, l, mode)}. Standard deviation σ = √${rad(main.variance, l, mode)} ≈ ${sdText(main)[l]}: the bracket reaches σ on each side of the mean.`)),
  });

  if (second) {
    const r = second.name;
    frames.push({
      kind: 'second-ask', view: 'second', show: {},
      caption: both((l) => (l === 'ro'
        ? `${r} ia valorile ${list(second.xs, l, mode)} cu probabilitățile ${list(second.ps, l, mode)}. Unde stă media lui ${r}? Poate media să fie o valoare pe care ${r} nu o ia?`
        : `${r} takes the values ${list(second.xs, l, mode)} with probabilities ${list(second.ps, l, mode)}. Where is the mean of ${r}? Can the mean be a value ${r} never takes?`)),
    });
    frames.push({
      kind: 'second', view: 'second', show: { mean: true },
      caption: both((l) => {
        const m = fmtFrac(second.mean, l, mode);
        const head = `E[${r}] = ${meanTerms(second, l)} = ${m}. `;
        if (second.meanIsValue) {
          return head + (l === 'ro'
            ? `Aici ${r} chiar ia valoarea ${m}, dar nu e obligatoriu ca media să fie o valoare posibilă.`
            : `Here ${r} does take the value ${m}, but the mean does not have to be a possible value.`);
        }
        return head + (l === 'ro'
          ? `Dar ${r} nu ia niciodată valoarea ${m}: media poate fi o valoare pe care variabila nu o ia.`
          : `But ${r} never takes the value ${m}: the mean can be a value the variable never takes.`);
      }),
    });
  }

  const fAt = main.cdf[at];
  const cumTerms = (l) => main.ps.slice(0, at + 1).map((p) => fmtFrac(p, l, mode)).join(' + ');
  const xAt = (l) => fmtFrac(main.xs[at], l, mode);
  // ask: the staircase is drawn without its values
  frames.push({
    kind: 'cdf-ask', view: 'main', cdf: true, cdfLabels: false, show: { cdf: true },
    caption: both((l) => (l === 'ro'
      ? `F(x) = P(${name} ≤ x) crește în trepte, câte una la fiecare valoare. Cât este F(${xAt(l)})?`
      : `F(x) = P(${name} ≤ x) climbs in steps, one at each value. What is F(${xAt(l)})?`)),
  });
  frames.push({
    kind: 'cdf', view: 'main', cdf: true, cdfAt: at, show: { cdf: true },
    caption: both((l) => (l === 'ro'
      ? `F(${xAt(l)}) = P(${name} ≤ ${xAt(l)}) = ${at > 0 ? `${cumTerms(l)} = ` : ''}${fmtFrac(fAt, l, mode)}: suma probabilităților până la ${xAt(l)} inclusiv.`
      : `F(${xAt(l)}) = P(${name} ≤ ${xAt(l)}) = ${at > 0 ? `${cumTerms(l)} = ` : ''}${fmtFrac(fAt, l, mode)}: the sum of the probabilities up to ${xAt(l)}, included.`)),
  });

  return { name, mode, main, second, cdfAt: at, frames, count: frames.length };
}

// The values the widget prints for a distribution (bilingual), used by the component so it never formats on its own.
export function shown(D, mode) {
  return {
    xs: D.xs.map((x) => disp(x, mode)),
    ps: D.ps.map((p) => disp(p, mode)),
    mean: disp(D.mean, mode),
    variance: disp(D.variance, mode),
    sd: dispNum(D.sd, 2),
    dev: D.dev.map((d) => disp(d, mode)),
    sq: D.sq.map((s) => disp(s, mode)),
    cdf: D.cdf.map((f) => disp(f, mode)),
  };
}
