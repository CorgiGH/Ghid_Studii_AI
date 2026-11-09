// ml-nb: the pick the learner makes before each reveal (own picks with PickBar). A frame that carries an `ask` also carries a
// `pick`: { key, prompt, options: [{ id, label }], right, why }. The options are computed from the same exact counts the frames
// use, so the right one is never typed; the wrong ones are the slips a first-time learner makes (the other class, a whole-table
// count, the unweighted score, the wrong error).
import Fraction from '../../../../../ml/calc/fraction.js';
import { bi } from './numbers-bilingual.js';
import { enCount, roCount } from '../words.js';
import { classScores, jointRows, errorTable, factor, paramCounts } from './nb.js';

const lab = (m, cls) => `${m.target}=${cls}`;
const text = (s) => (typeof s === 'string' ? { en: s, ro: s } : s);
const key = (s) => (typeof s === 'string' ? s : s.en);
const TIE = { en: 'tie', ro: 'egalitate' };
const NONE = { en: 'none', ro: 'niciuna' };
const same = (cell, lit) => String(cell) === String(lit) || (typeof cell === 'number' && Number(lit) === cell);
const fr = (a, b) => new Fraction(a, b);
const fmt = (x) => (x instanceof Fraction ? x.toString() : String(x));
// an error rate as the errors mode prints it (a P column holds decimals): 0.3 / 0,3; the id is the English side
const dec = (x) => bi((L) => L.n(x));

// right + up to two different wrong labels (strings), in a fixed order that is not "right first":
// the right one sits at position (frameNumber mod 3), so a run of frames does not always put it first.
function build(id, k, prompt, right, wrongs, why) {
  const seen = new Set([key(right)]);
  const ws = [];
  for (const w of wrongs) if (!seen.has(key(w))) { seen.add(key(w)); ws.push(w); }
  const all = [right, ...ws.slice(0, 2)];
  const at = k % all.length;
  const order = all.slice(1);
  order.splice(at, 0, right);
  return { key: id, prompt, options: order.map((o) => ({ id: key(o), label: text(o) })), right: key(right), why };
}

export function nbPick(m, frame, k) {
  const id = frame.id;
  const N = m.T.rows.length;
  const [c0] = m.classes;
  switch (id) {
    case 'joint-0': {
      const J = jointRows(m, m.pairs);
      const first = m.T.rows.filter((r) => same(r[m.cols.indexOf(m.pairs[0][0])], m.pairs[0][1])).length;
      return build(id, k, bi((L) => L.t('How many rows of the table have exactly the values of the instance?', 'Câte rânduri din tabel au exact valorile instanței?')),
        String(J.ids.length), [String(first), String(N), String(Math.max(0, J.ids.length - 1))],
        bi((L) => L.t(`${enCount(J.ids.length, 'row matches', 'rows match')} every value, the class column does not matter.`, `${roCount(J.ids.length, 'rând se potrivește', 'rânduri se potrivesc')} la toate valorile; coloana clasei nu contează.`)));
    }
    case 'joint-1': {
      const n0 = m.T.rows.filter((r) => same(r[m.ti], c0)).length;
      const p = fr(n0, N);
      return build(id, k, bi((L) => L.t(`What is P(${lab(m, c0)}), the share of rows of class ${lab(m, c0)}?`, `Cât este P(${lab(m, c0)}), ponderea rândurilor din clasa ${lab(m, c0)}?`)),
        fmt(p), [fmt(fr(N - n0, N)), fmt(fr(n0, N + 1)), fmt(fr(n0, Math.max(1, N - n0)))],
        bi((L) => L.t(`${n0} of ${N} rows have class ${lab(m, c0)}.`, `${n0} din ${N} rânduri au clasa ${lab(m, c0)}.`)));
    }
    case 'joint-2': {
      const f0 = classScores(m, m.pairs, false).rows[0].factors[0];
      const nAll = m.T.rows.filter((r) => same(r[m.cols.indexOf(f0.attr)], f0.lit)).length;
      return build(id, k, bi((L) => L.t(`What is P(${f0.attr}=${f0.lit} | ${lab(m, c0)})? Count only inside class ${lab(m, c0)}.`, `Cât este P(${f0.attr}=${f0.lit} | ${lab(m, c0)})? Numără doar în clasa ${lab(m, c0)}.`)),
        fmt(f0.p), [fmt(fr(nAll, N)), fmt(fr(f0.size - f0.count, f0.size)), fmt(fr(f0.count, N))],
        bi((L) => L.t(`${f0.count} of the ${f0.size} rows of the class have ${f0.attr}=${f0.lit}.`, `${f0.count} din cele ${f0.size} rânduri ale clasei au ${f0.attr}=${f0.lit}.`)));
    }
    case 'joint-3': {
      const S = classScores(m, m.pairs, false);
      const tie = S.rows.length > 1 && S.rows.every((r) => r.score.equals(S.rows[0].score));
      const win = tie ? TIE : lab(m, S.decision);
      return build(id, k, bi((L) => L.t('Multiply the prior and the factors of each class. Which class has the larger score?', 'Înmulțește priorul cu factorii fiecărei clase. Care clasă are scorul mai mare?')),
        win, [...m.classes.map((c) => lab(m, c)), TIE],
        bi((L) => (tie ? L.t('The two products are equal.', 'Cele două produse sunt egale.') : L.t(`${win} has the larger product.`, `${win} are produsul mai mare.`))));
    }
    case 'joint-4': {
      const S = classScores(m, m.pairs, false);
      const wi = m.classes.indexOf(S.decision);
      const pr = S.probs ? S.probs[wi] : null;
      if (!pr) return null;
      return build(id, k, bi((L) => L.t(`Divide each score by the sum of the scores. What is the probability of ${lab(m, S.decision)}?`, `Împarte fiecare scor la suma scorurilor. Cât este probabilitatea lui ${lab(m, S.decision)}?`)),
        fmt(pr), [fmt(S.rows[wi].score), fmt(S.rows[wi].score.div(S.rows[wi === 0 ? 1 : 0].score)), '1/2'],
        bi((L) => L.t('The winning score divided by the sum of both scores.', 'Scorul câștigătorului împărțit la suma ambelor scoruri.')));
    }
    case 'joint-5': {
      const S1 = classScores(m, m.pairs.slice(0, 1), false);
      const J1 = jointRows(m, m.pairs.slice(0, 1));
      const agree = S1.probs && J1.probs && S1.probs[0].equals(J1.probs[0]);
      const a = bi((L) => L.t('the same number', 'același număr'));
      const b = bi((L) => L.t('different numbers', 'numere diferite'));
      return {
        key: id, prompt: bi((L) => L.t(`With only ${m.pairs[0][0]}=${m.pairs[0][1]}, is P(${lab(m, c0)}|${m.pairs[0][0]}=${m.pairs[0][1]}) the same for Naive Bayes and Optimal Bayes?`, `Doar cu ${m.pairs[0][0]}=${m.pairs[0][1]}: P(${lab(m, c0)}|${m.pairs[0][0]}=${m.pairs[0][1]}) este la fel la Bayes Naiv și la Bayes Optimal?`)),
        options: [{ id: 'same', label: a }, { id: 'diff', label: b }], right: agree ? 'same' : 'diff',
        why: bi((L) => L.t(agree ? 'With one attribute there is nothing to factorise, so both count the same rows.' : 'The two numbers differ.', agree ? 'Cu un singur atribut nu are ce să factorizeze: ambele numără aceleași rânduri.' : 'Numerele diferă.')),
      };
    }
    case 'joint-6': {
      const c = paramCounts(5);
      const s = (nb, jb) => ({ en: `Naive Bayes ${nb}, Optimal Bayes ${jb}`, ro: `Bayes Naiv ${nb}, Bayes Optimal ${jb}` });
      return build(id, k, bi((L) => L.t('With 5 binary attributes and a binary class: how many free parameters for each classifier?', 'Cu 5 atribute binare și o clasă binară: câți parametri liberi are fiecare clasificator?')),
        s(c.nb, c.joint), [s(c.nb - 1, c.joint + 1), s(c.nb, 2 ** 5), s(5, c.joint)],
        bi((L) => L.t(`2d + 1 = ${c.nb} and 2ᵈ⁺¹ − 1 = ${c.joint}, with d = 5.`, `2d + 1 = ${c.nb} și 2ᵈ⁺¹ − 1 = ${c.joint}, cu d = 5.`)));
    }
    case 'laplace-0': {
      const off = classScores(m, m.pairs, false);
      const zeros = off.rows.filter((r) => r.score.sign() === 0).map((r) => lab(m, r.cls));
      const right = zeros.length ? zeros.join(' + ') : NONE;
      return build(id, k, bi((L) => L.t('Multiply the prior and the factors of each class. Which class gets the score 0?', 'Înmulțește priorul cu factorii fiecărei clase. Care clasă are scorul 0?')),
        right, [...m.classes.map((c) => lab(m, c)), NONE],
        bi((L) => L.t(zeros.length ? `${zeros.join(' + ')} has a factor 0, so its whole product is 0.` : 'No factor is 0.', zeros.length ? `${zeros.join(' + ')} are un factor 0, deci tot produsul e 0.` : 'Niciun factor nu e 0.')));
    }
    case 'laplace-1': {
      const off = classScores(m, m.pairs, false);
      if (off.undefinedPosterior) {
        return build(id, k, bi((L) => L.t('Both scores are 0. What is the probability of a class?', 'Ambele scoruri sunt 0. Cât este probabilitatea unei clase?')),
          { en: '0/0, undefined', ro: '0/0, nedefinită' }, ['0', '1', '1/2'], bi((L) => L.t('0 divided by a sum of zeros is 0/0: undefined.', '0 împărțit la o sumă de zerouri este 0/0: nedefinit.')));
      }
      const wi = m.classes.indexOf(off.decision);
      return build(id, k, bi((L) => L.t(`What is the probability of ${lab(m, off.decision)} now?`, `Cât este acum probabilitatea lui ${lab(m, off.decision)}?`)),
        fmt(off.probs[wi]), [fmt(off.rows[wi].score), '1', '1/2'], bi((L) => L.t('The winning score divided by the sum of the scores.', 'Scorul câștigătorului împărțit la suma scorurilor.')));
    }
    case 'laplace-2': {
      const off = classScores(m, m.pairs, false);
      const zero = off.rows.flatMap((r) => r.factors).find((f) => f.p.sign() === 0) || off.rows[0].factors[0];
      const on = factor(m, zero.attr, zero.lit, zero.cls, true);
      return build(id, k, bi((L) => L.t(`With add-one, what is P(${zero.attr}=${zero.lit} | ${lab(m, zero.cls)})?`, `Cu add-one, cât este P(${zero.attr}=${zero.lit} | ${lab(m, zero.cls)})?`)),
        fmt(on.p), [fmt(fr(zero.count, zero.size)), fmt(fr(zero.count + 1, zero.size)), fmt(fr(zero.count + 1, zero.size + 1))],
        bi((L) => L.t(`(${zero.count} + 1) / (${zero.size} + ${zero.k}): 1 added to the count, the number of values added to the class size.`, `(${zero.count} + 1) / (${zero.size} + ${zero.k}): 1 la număr, numărul de valori la mărimea clasei.`)));
    }
    case 'laplace-3': {
      const on = classScores(m, m.pairs, true);
      return build(id, k, bi((L) => L.t('The scores are positive now. Which class does Naive Bayes decide?', 'Scorurile sunt acum pozitive. Ce clasă decide Bayes Naiv?')),
        lab(m, on.decision), m.classes.map((c) => lab(m, c)),
        bi((L) => L.t(`${lab(m, on.decision)} has the larger score.`, `${lab(m, on.decision)} are scorul mai mare.`)));
    }
    case 'laplace-4': {
      return build(id, k, bi((L) => L.t('Add up the smoothed probabilities over all values of the attribute. What do you get?', 'Adună probabilitățile netezite peste toate valorile atributului. Cât obții?')),
        '1', [{ en: 'more than 1', ro: 'mai mult de 1' }, { en: 'less than 1', ro: 'mai puțin de 1' }, '0'],
        bi((L) => L.t('Exactly 1: add-one keeps a distribution. Adding 1 only to the numerator breaks it.', 'Exact 1: add-one păstrează o distribuție. Adăugat doar la numărător, 1 o strică.')));
    }
    case 'errors-0': {
      const base = errorTable(m, m.attrs.slice(0, 1));
      const c = base.cells[0];
      return build(id, k, bi((L) => L.t(`What does Naive Bayes decide when ${c.label}?`, `Ce decide Bayes Naiv când ${c.label}?`)),
        lab(m, c.nbDecision), m.classes.map((x) => lab(m, x)),
        bi((L) => L.t('The class with the larger number in that cell.', 'Clasa cu numărul mai mare din celula aceea.')));
    }
    case 'errors-1': {
      const base = errorTable(m, m.attrs.slice(0, 1));
      const err = base.errTrue;
      return build(id, k, bi((L) => L.t('The error rate is the sum of the numbers the classifier did not choose. What is it?', 'Rata erorii este suma numerelor pe care clasificatorul nu le-a ales. Cât este?')),
        dec(err), [dec(new Fraction(1).sub(err)), dec(err.div(new Fraction(2))), dec(new Fraction(1, 2))],
        bi((L) => L.t('Add the lost numbers, not the chosen ones.', 'Aduni numerele pierdute, nu cele alese.')));
    }
    case 'errors-2': {
      const full = errorTable(m, m.attrs);
      const flip = full.cells.find((c) => c.nbDecision !== errorTable(m, m.attrs.slice(0, 1)).cells.find((b) => b.pairs[0][1] === c.pairs[0][1]).nbDecision) || full.cells.at(-1);
      return build(id, k, bi((L) => L.t(`With the copy, what does Naive Bayes decide for ${flip.label}?`, `Cu copia, ce decide Bayes Naiv pentru ${flip.label}?`)),
        lab(m, flip.nbDecision), m.classes.map((x) => lab(m, x)),
        bi((L) => L.t('The copy multiplies the same evidence twice.', 'Copia înmulțește aceeași dovadă de două ori.')));
    }
    case 'errors-3': {
      const a = bi((L) => L.t('against the true distribution', 'față de distribuția adevărată'));
      const b = bi((L) => L.t('against the distribution Naive Bayes builds', 'față de distribuția construită de Bayes Naiv'));
      return {
        key: id, prompt: bi((L) => L.t('Which error does the exam ask for?', 'Care rată a erorii se cere la examen?')),
        options: [{ id: 'nb', label: b }, { id: 'true', label: a }], right: 'true',
        why: bi((L) => L.t('The true one: new instances come from the real data.', 'Cea adevărată: instanțele noi vin din datele reale.')),
      };
    }
    case 'errors-4': {
      const full = errorTable(m, m.attrs);
      return build(id, k, bi((L) => L.t('What is the error rate of Optimal Bayes on the same data, with the copy?', 'Cât este rata erorii la Bayes Optimal pe aceleași date, cu copia?')),
        dec(full.errJB), [dec(full.errTrue), dec(full.errNB), dec(new Fraction(1).sub(full.errJB))],
        bi((L) => L.t('Optimal Bayes ignores the copy: its error does not change.', 'Bayes Optimal ignoră copia: eroarea lui nu se schimbă.')));
    }
    default:
      return null;
  }
}
