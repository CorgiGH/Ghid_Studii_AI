import { DATA, parseOn, onMatches, evalOnPair } from './common.js';
import { rows as rowsWord } from './words.js';

export function joinRows({ left, right, on, kind = 'inner', filterIn, filter }) {
  const terms = parseOn(on);
  const L = DATA[left] || [], R = DATA[right] || [];
  const keepR = (l, r) => (filter && filterIn === 'on' ? evalOnPair(filter, left, right, l, r) === true : true);
  const groups = [];
  const matchedRight = new Set();
  L.forEach((l, li) => {
    const matches = R.map((r, ri) => ({ r, ri })).filter(({ r }) => onMatches(terms, left, right, l, r) && keepR(l, r));
    matches.forEach(m => matchedRight.add(m.ri));
    // candidates the ON equality found but the ON filter then refused (for display)
    const refused = filter && filterIn === 'on'
      ? R.map((r, ri) => ({ r, ri })).filter(({ r }) => onMatches(terms, left, right, l, r) && !keepR(l, r))
      : [];
    const pairs = matches.map(({ r, ri }) => ({ left: l, right: r, li, ri }));
    if (!pairs.length && (kind === 'left' || kind === 'full')) pairs.push({ left: l, right: null, li, ri: -1 });
    groups.push({ li, left: l, pairs, refused });
  });
  const tail = [];
  if (kind === 'right' || kind === 'full') {
    R.forEach((r, ri) => { if (!matchedRight.has(ri)) tail.push({ left: null, right: r, li: -1, ri }); });
  }
  const pairs = groups.flatMap(g => g.pairs).concat(tail);
  for (const p of pairs) {
    p.kept = filter && filterIn === 'where' ? evalOnPair(filter, left, right, p.left, p.right) === true : true;
  }
  const stages = [{ kind: 'setup' }, ...groups.map((_, i) => ({ kind: 'left', index: i }))];
  if (tail.length) stages.push({ kind: 'tail' });
  if (filter && filterIn === 'where') stages.push({ kind: 'where' });
  // with the filter in ON, a last step lists the whole result, so it can be set beside the WHERE picture
  if (filter && filterIn === 'on') stages.push({ kind: 'result' });
  return { leftRows: L, rightRows: R, groups, tail, pairs, kept: pairs.filter(p => p.kept).length, stages, count: stages.length };
}

// The columns each card shows, per table, and the header line printed above the cards.
export const CARD_COLUMNS = { studenti: ['nr_matricol', 'nume'], note: ['nr_matricol', 'id_curs', 'valoare'], cursuri: ['id_curs', 'titlu_curs'], didactic: ['id_prof', 'id_curs'], profesori: ['id_prof', 'nume'] };
export const cardColumns = (table, sample) => CARD_COLUMNS[table] || Object.keys(sample || {}).slice(0, 3);
export const cardLabel = (table, row) => (row ? cardColumns(table, row).map(c => (row[c] === null ? 'NULL' : row[c])).join(' · ') : 'NULL');

// The SQL header: plain JOIN for an inner join (INNER is taught later), LEFT / RIGHT / FULL JOIN otherwise.
export function joinHeader({ left, right, on, kind, filterIn, filter }) {
  const jt = kind === 'inner' ? 'JOIN' : `${kind.toUpperCase()} JOIN`;
  return `${left} ${jt} ${right} ON ${on}${filterIn === 'on' ? ` AND ${filter}` : ''}${filterIn === 'where' ? ` WHERE ${filter}` : ''}`;
}

// What the WHERE step draws: the rows that stay, the NULL rows that go (listed one by one) and how many other rows go.
export function whereParts(J) {
  return {
    kept: J.pairs.filter(p => p.kept),
    droppedNull: J.pairs.filter(p => !p.kept && !p.right),
    droppedOther: J.pairs.filter(p => !p.kept && p.right).length,
  };
}

const roWas = (n, one, many) => (n === 1 ? one : many);

export function joinCaption(J, props, k, total) {
  const stage = J.stages[k];
  const { left, right, on, filterIn, filter } = props;
  if (stage.kind === 'setup') {
    return {
      en: `${rowsWord(J.leftRows.length).en} in ${left}, ${rowsWord(J.rightRows.length).en} in ${right}. A pair is made when ${on}${filterIn === 'on' ? ` and ${filter}` : ''}.`,
      ro: `${rowsWord(J.leftRows.length).ro} în ${left}, ${rowsWord(J.rightRows.length).ro} în ${right}. Se formează o pereche când ${on}${filterIn === 'on' ? ` și ${filter}` : ''}.`,
    };
  }
  if (stage.kind === 'left') {
    const g = J.groups[stage.index];
    const n = g.pairs.filter(p => p.right).length;
    const r = g.refused.length;
    const refEn = r ? ` ${r} candidate${r === 1 ? '' : 's'} (struck through) failed the filter in ON.` : '';
    const refRo = r ? ` ${r === 1 ? '1 candidat (tăiat) a picat' : `${r} candidați (tăiați) au picat`} filtrul din ON.` : '';
    if (n) {
      return {
        en: `This row finds ${n} partner${n === 1 ? '' : 's'}: ${rowsWord(n).en} in the result.${refEn}`,
        ro: `Rândul acesta găsește ${n} ${roWas(n, 'partener', 'parteneri')}: ${rowsWord(n).ro} în rezultat.${refRo}`,
      };
    }
    if (g.pairs.length) {
      return {
        en: `No partner.${refEn} The join keeps this row anyway and fills the other side with NULL.`,
        ro: `Niciun partener.${refRo} Join-ul păstrează totuși rândul și completează cealaltă parte cu NULL.`,
      };
    }
    return { en: `No partner, so this row leaves no trace in the result.${refEn}`, ro: `Niciun partener, deci rândul nu apare în rezultat.${refRo}` };
  }
  if (stage.kind === 'tail') {
    return {
      en: `${rowsWord(J.tail.length).en} of ${right} had no partner; this join keeps them with NULL on the left.`,
      ro: `${rowsWord(J.tail.length).ro} din ${right} nu au avut partener; join-ul le păstrează cu NULL în stânga.`,
    };
  }
  if (stage.kind === 'result') {
    const m = J.pairs.filter(p => p.right).length, z = J.pairs.length - m;
    return {
      en: `The result: ${rowsWord(total).en}. ${m} have on the right a ${right} row that passes ${filter}, and ${z} have NULL on the right. No row of ${left} was lost.`,
      ro: `Rezultatul: ${rowsWord(total).ro}. ${m} au în dreapta un rând din ${right} care trece de ${filter}, iar ${z} au NULL în dreapta. Niciun rând din ${left} nu s-a pierdut.`,
    };
  }
  const w = whereParts(J);
  return {
    en: `The filter in WHERE runs after the join and keeps only the rows where ${filter} is true: ${rowsWord(w.kept.length).en}. The ${w.droppedNull.length} rows with NULL and the ${w.droppedOther} others go.`,
    ro: `Filtrul din WHERE rulează după join și păstrează doar rândurile pentru care ${filter} e adevărat: ${rowsWord(w.kept.length).ro}. Dispar cele ${w.droppedNull.length} rânduri cu NULL și celelalte ${w.droppedOther}.`,
  };
}
