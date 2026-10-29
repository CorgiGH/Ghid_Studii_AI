// ml-cvloo (L15): leave-one-out cross-validation of ID3 by hand. Take a row out, grow the tree on the others, predict the
// row, count the error. Pure: trees, predictions, counts and captions all come from here (tree-grow.js on the ML math kit).
import { colNames, countsText, fmt, grow, classifyPath, sub } from './tree-grow.js';

const bi = (en, ro) => ({ en, ro });

const rowOf = (T, names, attrs, i) => `(${attrs.map((a) => `${a} = ${T.rows[i][names.indexOf(a)]}`).join(', ')})`;

// the thresholds of every test node of a tree, ascending
export function treeThresholds(node, out = []) {
  if (node.leaf) return out;
  if (node.test.th !== undefined) out.push({ attr: node.test.attr, th: node.test.th });
  for (const k of node.kids) treeThresholds(k.node || k, out);
  return out.sort((a, b) => a.th - b.th);
}

export function mlCvloo({ table, target, tie = 'class0', continuous = [] }) {
  const names = colNames(table);
  const ti = names.indexOf(target);
  if (ti < 0) throw new RangeError(`unknown column ${target}`);
  const ignore = new Set(table.ignore || []);
  const attrs = names.filter((c, i) => i !== ti && c !== 'P' && !ignore.has(c));
  const n = table.rows.length;
  const opts = { continuous, tie };
  const full = grow(table, target, opts);
  const classes = full.classes;
  const ct = (counts) => countsText(counts, classes);
  const label = (i) => table.rows[i][ti];

  const errorsOf = (a) => {
    let e = 0;
    for (let i = 0; i < n; i++) {
      const g = grow(table, target, { ...opts, attrs: a, ids: table.rows.map((_, j) => j).filter((j) => j !== i) });
      if (classifyPath(g, table.rows[i]).label !== label(i)) e += 1;
    }
    return e;
  };

  let trainErr = 0;
  for (let i = 0; i < n; i++) if (classifyPath(full, table.rows[i]).label !== label(i)) trainErr += 1;

  const frames = [{
    kind: 'setup', n, tree: full.tree, trainErr, errors: 0,
    caption: bi(`${n} rows. The tree grown on all of them gets ${trainErr} of ${n} wrong: training error ${trainErr}/${n}. CVLOO takes each row out in turn, grows the tree on the other ${n - 1} rows and predicts the row that was left out.`,
      `${n} rânduri. Arborele crescut pe toate greșește ${trainErr} din ${n}: eroarea la antrenare ${trainErr}/${n}. CVLOO scoate pe rând câte un rând, crește arborele pe celelalte ${n - 1} rânduri și prezice rândul scos.`),
  }];

  let errors = 0;
  const wrongRows = [];
  for (let i = 0; i < n; i++) {
    const g = grow(table, target, { ...opts, ids: table.rows.map((_, j) => j).filter((j) => j !== i) });
    const { label: pred, path } = classifyPath(g, table.rows[i]);
    const truth = label(i);
    const wrong = pred !== truth;
    const before = errors;
    if (wrong) { errors += 1; wrongRows.push(i + 1); }
    const rowText = rowOf(table, names, attrs, i);
    const k = i + 1;
    const counts = g.tree.counts;
    frames.push({
      kind: 'fold', k, out: i, n, rowText, remaining: n - 1, tree: g.tree, path, thresholds: treeThresholds(g.tree),
      pred, truth, wrong, errBefore: before, errAfter: errors, counts,
      askCaption: bi(`Row ${k} is left out: ${rowText}. The tree is grown on the other ${n - 1} rows ${ct(counts)}. What does it predict for row ${k}?`,
        `Rândul ${k} e scos: ${rowText}. Arborele e crescut pe celelalte ${n - 1} rânduri ${ct(counts)}. Ce prezice pentru rândul ${k}?`),
      caption: bi(`Row ${k} ${rowText} is left out; the tree grown on the other ${n - 1} rows ${ct(counts)} predicts ${pred}. The row's label is ${truth}: ${wrong ? 'wrong' : 'right'}. Errors so far: ${errors} of ${k}.`,
        `Rândul ${k} ${rowText} e scos; arborele crescut pe celelalte ${n - 1} rânduri ${ct(counts)} prezice ${pred}. Eticheta rândului e ${truth}: ${wrong ? 'greșit' : 'corect'}. Erori până acum: ${errors} din ${k}.`),
    });
  }

  // the same data with the columns the other way round: a tie between two attributes goes to the first one
  const alt = attrs.length > 1 ? errorsOf([...attrs].reverse()) : null;
  const altNote = alt !== null && alt !== errors;
  const tail = altNote
    ? bi(` Careful: with the columns in the other order the same data give ${alt}/${n}; a tie between two attributes goes to the first column, so the order must be stated.`,
      ` Atenție: cu coloanele în ordine inversă aceleași date dau ${alt}/${n}; la egalitate între două atribute câștigă prima coloană, deci ordinea trebuie spusă.`)
    : bi('', '');
  // the wrong rows; with one continuous attribute each also gives its value (4.10: X = 8, 8.5, 9)
  const one = attrs.length === 1 && continuous.includes(attrs[0]) ? attrs[0] : null;
  const rowName = (r) => (one ? `${r} (${one} = ${table.rows[r - 1][names.indexOf(one)]})` : String(r));
  const andList = (xs, and) => (xs.length > 1 ? `${xs.slice(0, -1).join(', ')} ${and} ${xs[xs.length - 1]}` : xs[0]);
  const wrongEn = !wrongRows.length ? '' : wrongRows.length === 1 ? ` (row ${rowName(wrongRows[0])} is predicted wrong)` : ` (rows ${andList(wrongRows.map(rowName), 'and')} are predicted wrong)`;
  const wrongRo = !wrongRows.length ? '' : wrongRows.length === 1 ? ` (rândul ${rowName(wrongRows[0])} e prezis greșit)` : ` (rândurile ${andList(wrongRows.map(rowName), 'și')} sunt prezise greșit)`;
  frames.push({
    kind: 'end', n, errors, trainErr, alt: altNote ? alt : null, wrongRows, tree: full.tree,
    caption: bi(`CVLOO error: ${errors}/${n}${wrongEn}. Training error was ${trainErr}/${n}: the training error does not take the row out before predicting it.${tail.en}`,
      `Eroarea CVLOO: ${errors}/${n}${wrongRo}. Eroarea la antrenare a fost ${trainErr}/${n}: la antrenare rândul nu e scos înainte de a fi prezis.${tail.ro}`),
  });

  const single = attrs.length === 1 && continuous.includes(attrs[0]) ? attrs[0] : null;
  return { frames, classes, attrs, names, ti, errors, trainErr, wrongRows, alt, single, rows: table.rows.length, countsText: ct, sub };
}

// What the learner's predicted label was worth on a fold frame (null before a pick or after a skip).
export function foldNote(frame, guess) {
  if (frame.kind !== 'fold' || guess === null || guess === undefined) return null;
  return String(guess) === String(frame.pred)
    ? bi(`You predicted ${guess}: the same as the tree.`, `Ai prezis ${guess}: la fel ca arborele.`)
    : bi(`You predicted ${guess}; the tree says ${frame.pred}.`, `Ai prezis ${guess}; arborele zice ${frame.pred}.`);
}

export { fmt };
