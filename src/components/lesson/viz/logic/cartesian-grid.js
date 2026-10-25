import { DATA, parseOn, onMatches } from './common.js';
import { numberRanges, rows as rowsWord } from './words.js';

export function cartesianGrid({ left, right, on }) {
  const terms = parseOn(on);
  const L = DATA[left] || [], R = DATA[right] || [];
  const hit = L.map(l => R.map(r => onMatches(terms, left, right, l, r)));
  return { leftRows: L, rightRows: R, rows: L.length, cols: R.length, total: L.length * R.length, hit, matches: hit.flat().filter(Boolean).length, count: 3 };
}

// The labels around the grid: each left row by its join key (111 … 123), the right rows grouped by theirs
// (111 ×6, 112 ×6, … 119 ×3), and the left rows that no right row matches (120–123).
export function cartesianAxes(G, { left, right, on }) {
  const t = parseOn(on)[0];
  const lcol = t.lt === left ? t.lc : t.rc;
  const rcol = t.rt === right ? t.rc : t.lc;
  const rowKeys = G.leftRows.map(r => String(r[lcol]));
  const groups = [];
  G.rightRows.forEach((r, j) => {
    const key = String(r[rcol]);
    const last = groups.at(-1);
    if (last && last.key === key) last.span += 1;
    else groups.push({ key, start: j, span: 1 });
  });
  const empty = rowKeys.filter((_, i) => !G.hit[i].some(Boolean));
  return { lcol, rcol, rowKeys, groups, empty };
}

// How a caption names the rows left without a pair, for the tables the lessons use.
const WHO = {
  studenti: [{ en: 'this student', ro: 'acest student' }, { en: 'these students', ro: 'acești studenți' }],
  cursuri: [{ en: 'this course', ro: 'acest curs' }, { en: 'these courses', ro: 'aceste cursuri' }],
  profesori: [{ en: 'this teacher', ro: 'acest profesor' }, { en: 'these teachers', ro: 'acești profesori' }],
};
const NONE = { note: { en: 'no grade', ro: 'nicio notă' }, didactic: { en: 'no teacher', ro: 'niciun profesor' } };

export function cartesianCaption(G, A, props, k, total, matches) {
  const { left, right, on } = props;
  if (k === 0) {
    return {
      en: `${rowsWord(G.rows).en} of ${left} down the side (${A.lcol} ${numberRanges(A.rowKeys)}), ${rowsWord(G.cols).en} of ${right} across the top, grouped by ${A.rcol}. Every square is one possible pair.`,
      ro: `${rowsWord(G.rows).ro} din ${left} pe lateral (${A.lcol} ${numberRanges(A.rowKeys)}), ${rowsWord(G.cols).ro} din ${right} sus, grupate după ${A.rcol}. Fiecare pătrat este o pereche posibilă.`,
    };
  }
  if (k === 1) {
    return {
      en: `Without a condition the join keeps every pair: ${G.rows} × ${G.cols} = ${rowsWord(total).en}.`,
      ro: `Fără condiție, join-ul păstrează toate perechile: ${G.rows} × ${G.cols} = ${rowsWord(total).ro}.`,
    };
  }
  const n = A.empty.length;
  const who = WHO[left] ? WHO[left][n === 1 ? 0 : 1] : { en: `${n === 1 ? 'that row' : 'those rows'} of ${left}`, ro: `${n === 1 ? 'acest rând' : 'aceste rânduri'} din ${left}` };
  const none = NONE[right] || { en: `no match in ${right}`, ro: `nicio pereche în ${right}` };
  const emptyEn = n ? ` Row${n === 1 ? '' : 's'} ${numberRanges(A.empty)} stay${n === 1 ? 's' : ''} empty: ${who.en} ${n === 1 ? 'has' : 'have'} ${none.en}.` : '';
  const emptyRo = n ? ` ${n === 1 ? 'Rândul' : 'Rândurile'} ${numberRanges(A.empty)} ${n === 1 ? 'rămâne gol' : 'rămân goale'}: ${who.ro} nu ${n === 1 ? 'are' : 'au'} ${none.ro}.` : '';
  return {
    en: `The condition ${on} keeps only the squares where the number on the left equals the one on top: ${rowsWord(matches).en}.${emptyEn}`,
    ro: `Condiția ${on} păstrează doar pătratele în care numărul din stânga e egal cu cel de sus: ${rowsWord(matches).ro}.${emptyRo}`,
  };
}
