import { DATA } from './common.js';

const words = (q) => (String(q).match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
const asNum = (v) => (typeof v === 'number' ? v : Number(v));

// Which row of the "from" table does the question point at? The one whose cells repeat the
// most numbers from the question (first such row on a tie).
export function pickSourceRow(rows, question) {
  const nums = words(question);
  let best = 0, bestScore = -1;
  rows.forEach((r, i) => {
    const cells = Object.values(r).map(asNum);
    const score = nums.filter(n => cells.includes(n)).length;
    if (score > bestScore) { best = i; bestScore = score; }
  });
  return best;
}

// The rows shown are the ones the question is about (`where`: { column: value }, e.g. the grades
// of course 24), so every row carries its own key and the learner has to find the asked row.
// `about`: the [column, value] cells of the picked row that the question names (id_curs 24, valoare 9).
export function tableMap({ from, to, where = {}, question, answerKey, dataset = 'facultate' }) {
  void dataset;
  const [fromTable, fromCol] = from.split('.');
  const [toTable, toCol] = to.split('.');
  const fromRows = (DATA[fromTable] || []).filter(r => Object.entries(where).every(([c, v]) => String(r[c]) === String(v)));
  const q = typeof question === 'object' ? (question.en || question.ro || '') : question;
  const pick = pickSourceRow(fromRows, q);
  const nums = words(q);
  const about = Object.entries(fromRows[pick] || {}).filter(([c, v]) => c !== fromCol && nums.includes(asNum(v)));
  const toRows = DATA[toTable] || [];
  const target = toRows.find(r => String(r[toCol]) === String(answerKey)) || null;
  return { fromTable, fromCol, toTable, toCol, fromRows, pick, about, toRows, target, count: 3 };
}

// The arrow the learner fires by clicking a key cell: from that row of the "from" table to the row
// of the "to" table with the same key. `fromRow` is the clicked row index (the picked row by
// default). `hit`: the clicked row is the one the question asks about. Null when there is no target.
export function mapWire(m, fromRow) {
  if (!m.target) return null;
  const row = Number.isInteger(fromRow) && fromRow >= 0 && fromRow < m.fromRows.length ? fromRow : m.pick;
  const key = String(m.fromRows[row][m.fromCol]);
  const at = m.toRows.findIndex(r => String(r[m.toCol]) === key);
  if (at < 0) return null;
  return { id: 'k', from: `from:${row}:${m.fromCol}`, to: `to:${at}:${m.toCol}`, cls: 'keep', under: true, row, student: m.toRows[at], hit: row === m.pick };
}
