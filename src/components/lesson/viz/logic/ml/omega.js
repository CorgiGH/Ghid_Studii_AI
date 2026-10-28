// ml-omega (lesson 1): the die as a space of equal cells, an event B that is learned, and the restriction to B.
// Pure. Every number comes from the outcomes table through mathKit (P, Pc, count, div, mul), never from props, and every
// caption is built from the same frame state the picture is drawn from.
import Fraction from '../../../../../ml/calc/fraction.js';
import { P, Pc, count, div, mul } from '../../../../../ml/calc/mathKit.js';
import { listEn, listRo } from '../words.js';

const isLabel = (v) => (typeof v === 'string' && v.length > 0) || Number.isFinite(v);

// Problems with the props, as a list of strings (empty = fine). Used by validateViz.
export function omegaProblems(props) {
  const out = [];
  const { outcomes, events, restrictTo } = props || {};
  if (!Array.isArray(outcomes) || outcomes.length < 2 || !outcomes.every(isLabel) || new Set(outcomes.map(String)).size !== outcomes.length) {
    return ['viz (ml-omega): props.outcomes must be at least two different labels'];
  }
  if (!events || typeof events !== 'object' || !Array.isArray(events.A) || !Array.isArray(events.B)) {
    return ['viz (ml-omega): props.events must be { A: [...], B: [...] }'];
  }
  const all = new Set(outcomes.map(String));
  for (const k of ['A', 'B']) {
    if (!events[k].every((x) => all.has(String(x)))) out.push(`viz (ml-omega): props.events.${k} has an outcome that is not in props.outcomes`);
  }
  if (restrictTo !== undefined && restrictTo !== 'A' && restrictTo !== 'B') out.push('viz (ml-omega): props.restrictTo must be "A" or "B"');
  if (!out.length) {
    const g = restrictTo || 'B';
    if (events[g].length === 0) out.push(`viz (ml-omega): props.events.${g} is empty, so P(. | ${g}) does not exist`);
  }
  return out;
}

export const OMEGA_FRAMES = 7;

// frames: 0 ask how many remain, 1 reveal, 2 ask how many are favourable, 3 reveal, 4 ask P(A|B) (masses shown),
// 5 reveal (rescaled, formula), 6 B = whole space.
export function omega(props) {
  const bad = omegaProblems(props);
  if (bad.length) throw new RangeError(bad[0]);
  const g = props.restrictTo || 'B'; // the event we learn
  const a = g === 'B' ? 'A' : 'B'; // the event we ask about
  const labels = props.outcomes.map(String);
  const inG = new Set(props.events[g].map(String));
  const inA = new Set(props.events[a].map(String));
  // column A holds the event we ask about, column B the event we learn, whatever their letters are in the props
  const T = { columns: ['outcome', 'A', 'B'], rows: labels.map((l) => [l, inA.has(l) ? 1 : 0, inG.has(l) ? 1 : 0]) };
  const N = labels.length;
  const nG = count(T, 'B=1');
  const nAG = count(T, 'A=1 & B=1');
  const mass = div(new Fraction(1), new Fraction(N));
  const pG = P(T, 'B=1');
  const pAG = P(T, 'A=1 & B=1');
  const pA = P(T, 'A=1');
  const cond = Pc(T, 'A=1', 'B=1');
  const ratio = div(new Fraction(nAG), new Fraction(nG));
  if (!ratio.equals(cond)) throw new RangeError('ml-omega: counts and probabilities disagree (the outcomes are not equally likely)');
  const factor = div(new Fraction(1), pG);
  const condMass = mul(mass, factor);
  const aInG = labels.filter((l) => inA.has(l) && inG.has(l));

  const q = {
    N, nG, nAG, mass: mass.toString(), pG: pG.toString(), pAG: pAG.toString(), pA: pA.toString(), cond: cond.toString(), factor: factor.toString(), condMass: condMass.toString(),
  };
  const lst = (xs) => ({ en: listEn(xs), ro: listRo(xs) });
  const Gs = g;
  const As = a;

  function frame(step) {
    const s = Math.max(0, Math.min(OMEGA_FRAMES - 1, step));
    const kind = s === 6 ? 'info' : s % 2 === 0 ? 'ask' : 'reveal';
    const phase = s <= 1 ? 'count' : s <= 3 ? 'fav' : s <= 5 ? 'cond' : 'omega';
    const out = (l) => !inG.has(l) && (s === 1 || s === 3 || s === 5);
    const cells = labels.map((l) => {
      const cg = s === 6 ? true : inG.has(l);
      const ca = inA.has(l);
      let status = 'open';
      if (s === 6) status = 'open';
      else if (out(l)) status = 'out';
      else if ((s === 3 || s === 5) && cg && ca) status = 'fav';
      let m = null;
      if (s === 4 || s === 6) m = q.mass;
      if (s === 5) m = cg ? q.condMass : '0';
      return { label: l, inG: cg, inA: ca, status, mass: m };
    });
    const marks = [{ id: 'omega-size', value: String(N) }];
    let caption;
    const GA = lst(aInG);
    if (s === 0) {
      caption = {
        en: `We learn that ${Gs} happened. How many of the ${N} outcomes are still possible?`,
        ro: `Aflăm că ${Gs} s-a întâmplat. Câte dintre cele ${N} rezultate mai sunt posibile?`,
      };
    } else if (s === 1) {
      marks.push({ id: 'remaining', value: String(nG) });
      caption = {
        en: `Only the outcomes in ${Gs} remain: ${nG} of ${N}. The others cannot have happened.`,
        ro: `Rămân doar rezultatele din ${Gs}: ${nG} din ${N}. Celelalte nu mai pot fi cele întâmplate.`,
      };
    } else if (s === 2) {
      marks.push({ id: 'remaining', value: String(nG) });
      caption = {
        en: `${Gs} happened, ${nG} outcomes remain. In how many of these ${nG} did ${As} happen?`,
        ro: `${Gs} s-a întâmplat, au rămas ${nG} rezultate. În câte dintre aceste ${nG} s-a întâmplat ${As}?`,
      };
    } else if (s === 3) {
      marks.push({ id: 'remaining', value: String(nG) }, { id: 'favourable', value: String(nAG) }, { id: 'ratio', value: q.cond });
      caption = {
        en: `${As} happened in ${nAG} of the ${nG} remaining outcomes${aInG.length ? ` (${GA.en})` : ''}: ${q.cond}.`,
        ro: `${As} s-a întâmplat în ${nAG} din cele ${nG} rezultate rămase${aInG.length ? ` (${GA.ro})` : ''}: ${q.cond}.`,
      };
      if (nAG === 0) caption = { en: `${As} happened in none of the ${nG} remaining outcomes: 0.`, ro: `${As} nu s-a întâmplat în niciunul dintre cele ${nG} rezultate rămase: 0.` };
    } else if (s === 4) {
      marks.push({ id: 'mass', value: q.mass }, { id: 'pG', value: q.pG }, { id: 'pAG', value: q.pAG });
      caption = {
        en: `Now with probabilities: every outcome has mass ${q.mass}, P(${Gs}) = ${q.pG} and P(${As} ∩ ${Gs}) = ${q.pAG}. What is P(${As} | ${Gs})?`,
        ro: `Acum cu probabilități: fiecare rezultat are masa ${q.mass}, P(${Gs}) = ${q.pG} și P(${As} ∩ ${Gs}) = ${q.pAG}. Cât este P(${As} | ${Gs})?`,
      };
    } else if (s === 5) {
      marks.push({ id: 'factor', value: q.factor }, { id: 'condMass', value: q.condMass }, { id: 'pG', value: q.pG }, { id: 'pAG', value: q.pAG }, { id: 'cond', value: q.cond });
      caption = {
        en: `The outcomes in ${Gs} are rescaled by ${q.factor} so that they add up to 1: each now has mass ${q.condMass}. P(${As} | ${Gs}) = ${q.pAG} / ${q.pG} = ${q.cond}.`,
        ro: `Rezultatele din ${Gs} se înmulțesc cu ${q.factor} ca să dea împreună 1: fiecare are acum masa ${q.condMass}. P(${As} | ${Gs}) = ${q.pAG} / ${q.pG} = ${q.cond}.`,
      };
    } else {
      marks.push({ id: 'mass', value: q.mass }, { id: 'pA', value: q.pA });
      caption = {
        en: `If ${Gs} is the whole space Ω, nothing is eliminated and nothing is learned: P(${As} | Ω) = P(${As}) = ${q.pA}.`,
        ro: `Dacă ${Gs} este tot spațiul Ω, nu se elimină nimic și nu aflăm nimic nou: P(${As} | Ω) = P(${As}) = ${q.pA}.`,
      };
    }
    // in the whole-space frame B stands for Ω: no cell is cut away, nothing is dimmed
    return { step: s, kind, phase, cells, marks, caption, event: { learned: Gs, asked: As }, whole: s === 6 };
  }

  return { n: OMEGA_FRAMES, frame, q, learned: Gs, asked: As };
}
