import { DATA } from './common.js';

const words = (q) => (String(q).match(/-?\d+(?:\.\d+)?/g) || []).map(Number);

// Which row of the "from" table does the question point at? Among the rows that carry
// the answer key, the one whose cells repeat the most numbers from the question.
export function pickSourceRow(rows, question) {
  const nums = words(question);
  let best = 0, bestScore = -1;
  rows.forEach((r, i) => {
    const cells = Object.values(r).map(v => (typeof v === 'number' ? v : Number(v)));
    const score = nums.filter(n => cells.includes(n)).length;
    if (score > bestScore) { best = i; bestScore = score; }
  });
  return best;
}

export function tableMap({ from, to, question, answerKey, dataset = 'facultate' }) {
  void dataset;
  const [fromTable, fromCol] = from.split('.');
  const [toTable, toCol] = to.split('.');
  const fromRows = (DATA[fromTable] || []).filter(r => String(r[fromCol]) === String(answerKey));
  const q = typeof question === 'object' ? (question.en || question.ro || '') : question;
  const pick = pickSourceRow(fromRows, q);
  const toRows = DATA[toTable] || [];
  const target = toRows.find(r => String(r[toCol]) === String(answerKey)) || null;
  return { fromTable, fromCol, toTable, toCol, fromRows, pick, toRows, target, count: 3 };
}

// The arrow the learner fires by clicking a key cell: from that row of the "from" table to
// the matching row of the "to" table. `fromRow` is the clicked row index (the picked row by
// default). Null when there is no matching row.
export function mapWire(m, fromRow) {
  if (!m.target) return null;
  const row = Number.isInteger(fromRow) && fromRow >= 0 && fromRow < m.fromRows.length ? fromRow : m.pick;
  return { id: 'k', from: `from:${row}:${m.fromCol}`, to: `to:${m.toRows.indexOf(m.target)}:${m.toCol}`, cls: 'keep', under: true, row };
}
