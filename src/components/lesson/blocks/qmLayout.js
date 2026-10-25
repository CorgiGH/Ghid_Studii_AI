// How the query machine lays out its rows: the grid columns (each sized by what it holds, so a long computed header does not
// push the other columns off a phone screen), which side slots a step needs, when the box shows every row and what the
// set-operator lists look like. Plain functions, tested in node.
import { displayCell } from '../viz/logic/date-mask.js';

// Up to this many rows the box shows them all; past it, the box scrolls and says how many rows are below.
export { ALL_ROWS as QM_ALL_ROWS } from '../tableText.js';

// Only a real NULL reads NULL; a value the engine did not give stays blank rather than looking like a NULL.
export const cellText = (v) => (v === undefined ? '' : v === null ? 'NULL' : displayCell(typeof v === 'string' ? v.replace(/\s+$/, '') : v));

// Rough width of a text in `ch` of the cell font: capitals and m/w are wider than a digit, spaces and punctuation narrower.
export function textWidth(s) {
  let w = 0;
  for (const ch of String(s)) {
    if (/[MW]/.test(ch)) w += 1.45;
    else if (/[mw]/.test(ch)) w += 1.4;
    else if (/[ilj]/.test(ch)) w += 0.45;
    else if (/[I.,:;'|!]/.test(ch)) w += 0.5;
    else if (/[tfr]/.test(ch)) w += 0.65;
    else if (/[A-ZĂÂÎȘȚ]/.test(ch)) w += 1.1;
    else if (/[0-9a-zăâîșț]/.test(ch)) w += 1;
    else if (ch === ' ') w += 0.45;
    else w += 0.75;
  }
  return w;
}

const longestWord = (s) => Math.max(0, ...String(s).split(/\s+/).map(textWidth));

// A column label split where it may break: after an alias dot (s.|nr_|matricol) or an underscore, so a narrow column breaks
// a header between its parts rather than inside a word (n.valoa|re).
export function headParts(label) {
  return String(label ?? '').split(/(?<=_)|(?<=\.)(?=[A-Za-z])/).filter((p) => p !== '');
}

// The tri-state badge words, in the lesson's own words.
export const TRUTH_LABEL = {
  T: { en: 'TRUE', ro: 'ADEVĂRAT' },
  F: { en: 'FALSE', ro: 'FALS' },
  U: { en: 'UNKNOWN', ro: 'NECUNOSCUT' },
};

// What goes in the slot before the cells: the tri-state badge, the pick box, the position number, or nothing (no slot).
export function leadKind(rows) {
  if (rows.some((r) => r.truth)) return 'tri';
  if (rows.some((r) => r.status === 'pickable')) return 'pick';
  if (rows.some((r) => r.pos)) return 'pos';
  return 'none';
}

// The slot after the cells: the ✓ / ✗ of a checked answer, or the ×n of DISTINCT.
export function endKind(rows) {
  const mark = rows.some((r) => r.mark !== undefined);
  const count = rows.some((r) => r.count > 1);
  return mark && count ? 'both' : mark ? 'mark' : count ? 'count' : 'none';
}

// The grid columns shared by the header and every row of one table. Each cell column gets at least its longest word (so a
// name never breaks in the middle) and a share of the spare room in proportion to its longest value; a header wraps instead
// of widening its column. Returns the CSS template.
export function gridTemplate({ columns, labels = {}, rows, lang = 'ro' }) {
  const lead = leadKind(rows);
  const end = endKind(rows);
  const tracks = [];
  if (lead === 'tri') {
    const longest = Math.max(...Object.values(TRUTH_LABEL).map((l) => (lang === 'en' ? l.en : l.ro).length));
    tracks.push(`${(longest * 0.42 + 0.9).toFixed(2)}rem`);
  } else if (lead !== 'none') tracks.push('1.9rem');
  for (const c of columns) {
    const values = rows.map((r) => cellText(r.cells[c]));
    const head = String(labels[c] || c);
    const min = Math.min(16, Math.max(2.5, ...values.map(longestWord), longestWord(head) * 0.5)) + 1;
    const share = Math.min(30, Math.max(3, ...values.map(textWidth), textWidth(head) * 0.86)) + 1;
    tracks.push(`minmax(${min.toFixed(1)}ch, ${share.toFixed(1)}fr)`);
  }
  if (end === 'mark') tracks.push('1.6rem');
  else if (end === 'count' || end === 'both') tracks.push('2.8rem');
  return { template: tracks.join(' '), lead, end };
}

// A checked answer's mark: right and kept (green), right and left out (quiet: the row is struck, the mark only says the
// learner was right about it), wrong (red).
export function markTone(row) {
  if (row.mark === undefined) return null;
  if (!row.mark) return 'bad';
  return row.status === 'gone' ? 'ok-out' : 'ok';
}

// The set-operator lists. Before "Combine" both lists are plain (nothing is decided yet). After it, every row stays where it
// is: the first list's rows that reach the result are tinted, the others struck; the result is its own list below.
export function setPanelRows(view) {
  const { left, right, result } = view.panels;
  if (view.phase !== 'show') {
    const plain = (rows) => rows.map((r) => ({ ...r, status: 'plain', moved: false }));
    return { left: plain(left), right: plain(right), result: [] };
  }
  const settle = (rows) => rows.map((r) => ({ ...r, moved: false }));
  return { left: settle(left), right: settle(right), result };
}
