// ml-indep-2x2 (lesson 3): is P(X ∩ Y) = P(X)P(Y)? A 2x2 table of events, cell by cell. Pure. The probabilities come from
// the four counts through mathKit (P, Pc, mul), the product of the margins is computed cell by cell, and every caption
// is built from the frame state that is drawn.
import { P, Pc, mul } from '../../../../../ml/calc/mathKit.js';
import { dec, loc } from './probFormat.js';

const isCount = (v) => Number.isInteger(v) && v >= 0;

export function indepProblems(props) {
  const out = [];
  const { counts, labels } = props || {};
  if (!Array.isArray(counts) || counts.length !== 2 || !counts.every((r) => Array.isArray(r) && r.length === 2 && r.every(isCount))) {
    return ['viz (ml-indep-2x2): props.counts must be [[a, b], [c, d]] of whole numbers'];
  }
  if (!labels || typeof labels.x !== 'string' || !labels.x || typeof labels.y !== 'string' || !labels.y) out.push('viz (ml-indep-2x2): props.labels needs x and y, the names of the two events');
  const [[a, b], [c, d]] = counts;
  if (a + b + c + d === 0) out.push('viz (ml-indep-2x2): the counts add up to 0');
  else if (a + b === 0 || c + d === 0 || a + c === 0 || b + d === 0) out.push('viz (ml-indep-2x2): a row or a column is empty, so a conditional probability would divide by 0');
  return out;
}

export const INDEP_FRAMES = 7;
export const CELL_IDS = ['00', '01', '10', '11'];

// frames: 0 ask the product of the margins, 1 reveal it for the first cell, 2 ask the verdict (table cell and product side
// by side), 3 reveal it (and the conditional form), 4 ask about the other three cells, 5 reveal them,
// 6 the table that would be independent (every cell equal to its product).
export function indep2x2(props) {
  const bad = indepProblems(props);
  if (bad.length) throw new RangeError(bad[0]);
  const X = props.labels.x;
  const Y = props.labels.y;
  const [[a, b], [c, d]] = props.counts;
  // the table behind the picture: one row per cell, its count as the weight
  const T = { columns: ['X', 'Y', 'P'], rows: [[1, 1, a], [1, 0, b], [0, 1, c], [0, 0, d]] };
  const rowP = [P(T, 'X=1'), P(T, 'X=0')];
  const colP = [P(T, 'Y=1'), P(T, 'Y=0')];
  const cellP = [[P(T, 'X=1 & Y=1'), P(T, 'X=1 & Y=0')], [P(T, 'X=0 & Y=1'), P(T, 'X=0 & Y=0')]];
  const prodP = [0, 1].map((i) => [0, 1].map((j) => mul(rowP[i], colP[j])));
  const eq = [0, 1].map((i) => [0, 1].map((j) => cellP[i][j].equals(prodP[i][j])));
  const condYX = Pc(T, 'Y=1', 'X=1');
  const independent = eq.flat().every(Boolean);
  const D = (f) => dec(f);
  const pos = (id) => [Number(id[0]), Number(id[1])];
  const at = (m, id) => { const [i, j] = pos(id); return m[i][j]; };
  const q = {
    pX: D(rowP[0]), pNX: D(rowP[1]), pY: D(colP[0]), pNY: D(colP[1]), condYX: D(condYX), independent,
    cell: Object.fromEntries(CELL_IDS.map((id) => [id, D(at(cellP, id))])),
    prod: Object.fromEntries(CELL_IDS.map((id) => [id, D(at(prodP, id))])),
    equal: Object.fromEntries(CELL_IDS.map((id) => [id, at(eq, id)])),
  };

  function frame(step) {
    const s = Math.max(0, Math.min(INDEP_FRAMES - 1, step));
    const kind = s === 6 ? 'info' : s % 2 === 0 ? 'ask' : 'reveal';
    const showActual = (id) => (s === 6 ? true : id === '00' ? s >= 2 : s >= 5);
    const showProd = (id) => (s === 6 ? true : id === '00' ? s >= 1 : s >= 5);
    const showSign = (id) => (s === 6 ? true : id === '00' ? s >= 3 : s >= 5);
    const cells = CELL_IDS.map((id) => {
      const actual = showActual(id) ? (s === 6 ? q.prod[id] : q.cell[id]) : null; // the toggle table holds the products themselves
      const product = showProd(id) ? q.prod[id] : null;
      const equal = s === 6 ? true : q.equal[id];
      return { id, actual, product, sign: showSign(id) ? (equal ? 'eq' : 'ne') : null };
    });
    const marks = [
      { id: 'pX', value: q.pX }, { id: 'pNX', value: q.pNX }, { id: 'pY', value: q.pY }, { id: 'pNY', value: q.pNY },
    ];
    for (const cl of cells) {
      if (cl.actual !== null) marks.push({ id: `cell-${cl.id}`, value: cl.actual });
      if (cl.product !== null) marks.push({ id: `prod-${cl.id}`, value: cl.product });
      if (cl.sign !== null) marks.push({ id: `sign-${cl.id}`, value: cl.sign });
    }
    if (s === 3) marks.push({ id: 'condYX', value: q.condYX });
    if (s >= 3) marks.push({ id: 'verdict', value: s === 6 || q.independent ? 'independent' : 'dependent' });
    const rest = ['01', '10', '11'];
    const nEq = rest.filter((id) => q.equal[id]).length;
    const cap = (lang) => {
      const en = lang === 'en';
      const d = (v) => loc(v, lang);
      const [p00, p01, p10, p11] = CELL_IDS.map((id) => d(q.prod[id]));
      const [c00, c01, c10, c11] = CELL_IDS.map((id) => d(q.cell[id]));
      switch (s) {
        case 0: return en
          ? `Only the margins are known: P(${X}) = ${d(q.pX)} and P(${Y}) = ${d(q.pY)}. If ${X} and ${Y} were independent, what would P(${X} ∩ ${Y}) be?`
          : `Se cunosc doar marginalele: P(${X}) = ${d(q.pX)} și P(${Y}) = ${d(q.pY)}. Dacă ${X} și ${Y} ar fi independente, cât ar fi P(${X} ∩ ${Y})?`;
        case 1: return en
          ? `P(${X}) · P(${Y}) = ${d(q.pX)} × ${d(q.pY)} = ${p00}: this is what the cell would hold if they were independent.`
          : `P(${X}) · P(${Y}) = ${d(q.pX)} × ${d(q.pY)} = ${p00}: atât ar fi în celulă dacă ar fi independente.`;
        case 2: return en
          ? `The table says P(${X} ∩ ${Y}) = ${c00}, and the product of the margins is ${p00}. Are ${X} and ${Y} independent?`
          : `Tabelul dă P(${X} ∩ ${Y}) = ${c00}, iar produsul marginalelor este ${p00}. Sunt ${X} și ${Y} independente?`;
        case 3: return q.equal['00']
          ? (en
            ? `${c00} = ${p00}: the product form holds in this cell. In the conditional form, P(${Y} | ${X}) = ${d(q.condYX)} = ${d(q.pY)} = P(${Y}).`
            : `${c00} = ${p00}: forma cu produs se verifică în această celulă. În forma condiționată, P(${Y} | ${X}) = ${d(q.condYX)} = ${d(q.pY)} = P(${Y}).`)
          : (en
            ? `${c00} ≠ ${p00}: not independent. The conditional form agrees: P(${Y} | ${X}) = ${d(q.condYX)} ≠ ${d(q.pY)} = P(${Y}). The equality must be exact.`
            : `${c00} ≠ ${p00}: nu sunt independente. Forma condiționată spune la fel: P(${Y} | ${X}) = ${d(q.condYX)} ≠ ${d(q.pY)} = P(${Y}). Egalitatea trebuie să fie exactă.`);
        case 4: return en
          ? `Do the other three cells equal their products?`
          : `Sunt celelalte trei celule egale cu produsele lor?`;
        case 5: {
          const list = `${c01} / ${p01}, ${c10} / ${p10}, ${c11} / ${p11}`;
          if (nEq === 0) return en ? `Cell against product: ${list}. None of them matches. For events one failed equation already decides.` : `Celulă față de produs: ${list}. Niciuna nu se potrivește. La evenimente o singură egalitate nerespectată hotărăște.`;
          if (nEq === 3) return en ? `Cell against product: ${list}. All of them match.` : `Celulă față de produs: ${list}. Toate se potrivesc.`;
          return en ? `Cell against product: ${list}. Some match and some do not; one cell that fails is enough to decide.` : `Celulă față de produs: ${list}. Unele se potrivesc, altele nu; o singură celulă care nu se potrivește ajunge ca să hotărască.`;
        }
        default: return en
          ? `With the same margins, the independent table would be ${p00}, ${p01}, ${p10}, ${p11}: every cell equals its product, so ${X} and ${Y} would be independent.`
          : `Cu aceleași marginale, tabelul independent ar fi ${p00}, ${p01}, ${p10}, ${p11}: fiecare celulă este egală cu produsul ei, deci ${X} și ${Y} ar fi independente.`;
      }
    };
    return { step: s, kind, cells, marks, caption: { en: cap('en'), ro: cap('ro') }, variant: s === 6 ? 'independent' : 'data' };
  }

  return { n: INDEP_FRAMES, frame, q };
}
