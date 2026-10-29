// Pure logic of ml-dup-counter (L13): rows are added to a table one at a time and the smallest possible training error is
// counted. Rows with the same inputs form a group; an arbitrary tree gives a group one label, so it is wrong on every row
// of the group except the most frequent label: error = sum over groups of (n - largest label count), over all rows.
import * as K from '../../../../../ml/calc/mathKit.js';
import { both, lab, colName, fmtDec, listIn, cmpLabel, cnt } from './id3-common.js';
import { roDe } from '../words.js';

export const times = (n, lang) => (lang === 'en' ? (n === 1 ? 'once' : `${n} times`) : n === 1 ? 'o dată' : `de ${n} ${roDe(n)}ori`);

export function analyse(rows, names, ti, ignore = []) {
  const ins = names.map((_, i) => i).filter((i) => i !== ti && !ignore.includes(names[i]));
  const byKey = new Map();
  rows.forEach((r, idx) => {
    const key = ins.map((i) => String(r[i])).join('|');
    if (!byKey.has(key)) byKey.set(key, { key, vals: ins.map((i) => r[i]), rows: [], counts: new Map() });
    const g = byKey.get(key);
    g.rows.push(idx);
    g.counts.set(r[ti], (g.counts.get(r[ti]) || 0) + 1);
  });
  const groups = [...byKey.values()].map((g) => {
    const labels = [...g.counts.keys()].sort(cmpLabel);
    const counts = labels.map((l) => g.counts.get(l));
    const max = Math.max(...counts);
    const n = g.rows.length;
    return {
      key: g.key, vals: g.vals, rows: g.rows, labels, counts, n, max, errs: n - max,
      contradictory: labels.length > 1, tie: counts.filter((c) => c === max).length > 1,
    };
  });
  const errs = groups.reduce((s, g) => s + g.errs, 0);
  return { n: rows.length, groups, errs, contradictory: groups.filter((g) => g.contradictory) };
}

export const tupleText = (vals) => `(${vals.map(String).join(',')})`;

export function dupModel(props) {
  const names = props.table.columns.map(colName);
  const ti = names.indexOf(props.target);
  if (ti < 0) throw new RangeError(`unknown target column ${props.target}`);
  const ignore = props.table.ignore || [];
  const added = props.added || [];
  added.forEach((r, j) => { if (r.length !== names.length) throw new RangeError(`added row ${j + 1} has ${r.length} cells for ${names.length} columns`); });
  const rowsAt = (j) => props.table.rows.concat(added.slice(0, j));
  const states = [];
  for (let j = 0; j <= added.length; j++) {
    const rows = rowsAt(j);
    const a = analyse(rows, names, ti, ignore);
    // the same minimum from the ID3 of the calculation kit: it keeps splitting until the groups are the inputs
    const id3 = K.trainErrId3({ columns: names, rows, ignore }, props.target);
    states.push({ ...a, rows, id3 });
  }
  const m = added.length;
  const frames = [{ kind: 'base' }, ...added.map((_, j) => ({ kind: 'add', j: j + 1 })), { kind: 'summary' }];
  const M = { names, headers: props.table.columns, ti, added, states, frames, count: frames.length, m };

  M.pickSpec = (k, predict) => {
    if (!predict || k >= m) return null;
    return {
      items: [{
        key: `add${k + 1}`,
        prompt: { en: 'When this row is added, does the smallest training error (rows wrong) stay the same or go up by 1?', ro: 'Când se adaugă rândul acesta, eroarea minimă la antrenare (rânduri greșite) rămâne la fel sau crește cu 1?' },
        options: [{ id: 'same', label: { en: 'Stays the same', ro: 'Rămâne la fel' } }, { id: 'up', label: { en: 'Goes up by 1', ro: 'Crește cu 1' } }],
      }],
    };
  };
  M.groupOfRow = (state, idx) => state.groups.find((g) => g.rows.includes(idx));

  M.caption = (k, ctx = {}) => both((lang) => {
    const f = frames[k];
    const T = (en, ro) => (lang === 'en' ? en : ro);
    const tgt = lab(props.table.columns[ti], lang);
    if (f.kind === 'base') {
      const s = states[0];
      const body = s.contradictory.length === 0
        ? T(`No input combination appears with two different labels, so the set is consistent and the smallest training error is ${s.errs}/${s.n}.`, `Nicio combinație de intrări nu apare cu etichete diferite, deci setul e consistent și cea mai mică eroare la antrenare e ${s.errs}/${s.n}.`)
        : T(`Some inputs appear with different labels; the smallest training error is ${s.errs}/${s.n}.`, `Unele intrări apar cu etichete diferite; cea mai mică eroare la antrenare e ${s.errs}/${s.n}.`);
      const ask = ctx.predict && m > 0 ? T(' Rows are added one at a time; before each, say what the count does.', ' Rândurile se adaugă pe rând; înainte de fiecare, spune ce face contorul.') : '';
      return T(`The table has ${cnt('en', s.n, 'row', 'rows', 'rând', 'rânduri')}. ${body}${ask}`, `Tabelul are ${cnt('ro', s.n, 'row', 'rows', 'rând', 'rânduri')}. ${body}${ask}`);
    }
    if (f.kind === 'add') {
      const prev = states[f.j - 1];
      const cur = states[f.j];
      const idx = prev.n; // the new row's index
      const g = M.groupOfRow(cur, idx);
      const row = cur.rows[idx];
      const key = tupleText(g.vals);
      const lbl = String(row[ti]);
      const delta = cur.errs - prev.errs;
      const counter = T(`The smallest training error goes from ${prev.errs}/${prev.n} to ${cur.errs}/${cur.n}.`, `Eroarea minimă la antrenare trece de la ${prev.errs}/${prev.n} la ${cur.errs}/${cur.n}.`);
      const pk = ctx.picks?.[`add${f.j}`];
      const fb = pk === undefined ? '' : (pk === 'up') === (delta === 1) ? T(' You predicted it.', ' Ai prezis corect.') : T(' Not what you predicted.', ' Nu cum ai prezis.');
      let what;
      if (g.n === 1) {
        what = T(`New row ${key} with ${tgt} = ${lbl}: these inputs appear for the first time, no contradiction.`, `Rând nou ${key} cu ${tgt} = ${lbl}: aceste intrări apar prima dată, nicio contradicție.`);
      } else if (!g.contradictory) {
        what = T(`New row ${key} with ${tgt} = ${lbl}: these inputs now appear ${times(g.n, 'en')}, always with the same label. A repeated example contradicts nothing.`, `Rând nou ${key} cu ${tgt} = ${lbl}: aceste intrări apar acum ${times(g.n, 'ro')}, mereu cu aceeași etichetă. Un exemplu repetat nu contrazice nimic.`);
      } else {
        // "Y = 0 once and Y = 1 twice": each label with how often it occurs in the group
        const lc = g.labels.map((l, i) => `${tgt} = ${String(l)} ${times(g.counts[i], lang)}`);
        const wrong = cnt(lang, g.errs, 'row', 'rows', 'rând', 'rânduri');
        const tie = g.tie
          ? T(` The labels are tied: whichever label a tree gives, it is wrong on ${wrong}.`, ` Etichetele sunt la egalitate: oricare etichetă ar da un arbore, greșește pe ${wrong}.`)
          : T(` A tree gives all of them one label, so it is wrong on ${wrong}.`, ` Un arbore le dă o singură etichetă, deci greșește pe ${wrong}.`);
        what = T(`New row ${key} with ${tgt} = ${lbl}: these inputs now appear ${times(g.n, 'en')}, with ${listIn(lang, lc)}.${tie}`, `Rând nou ${key} cu ${tgt} = ${lbl}: aceste intrări apar acum ${times(g.n, 'ro')}, cu ${listIn(lang, lc)}.${tie}`);
      }
      return `${what} ${counter}${fb}`;
    }
    const s = states[m];
    if (s.contradictory.length === 0) {
      return T(`No contradictory group: the smallest training error is ${s.errs}/${s.n}.`, `Niciun grup contradictoriu: cea mai mică eroare la antrenare e ${s.errs}/${s.n}.`);
    }
    const parts = s.contradictory.map((g) => `${tupleText(g.vals)}: ${g.n} − ${g.max} = ${g.errs}`);
    return T(
      `Contradictory groups, the rows of the group minus the rows with its most frequent label: ${parts.join('; ')}. In total ${s.contradictory.map((g) => g.errs).join(' + ')} = ${cnt('en', s.errs, 'row', 'rows', 'rând', 'rânduri')} wrong out of ${s.n}: ${s.errs}/${s.n} = ${fmtDec(s.errs / s.n)}.`,
      `Grupurile contradictorii, rândurile grupului minus aparițiile etichetei celei mai frecvente: ${parts.join('; ')}. În total ${s.contradictory.map((g) => g.errs).join(' + ')} = ${cnt('ro', s.errs, 'row', 'rows', 'rând', 'rânduri')} greșite din ${s.n}: ${s.errs}/${s.n} = ${fmtDec(s.errs / s.n)}.`,
    );
  });
  return M;
}
