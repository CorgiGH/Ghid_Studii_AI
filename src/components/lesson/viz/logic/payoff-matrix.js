// payoff-matrix (IA, c5 "Pure and dominant strategies", "Nash Equilibrium"): a two-player table, cell = [row player's payoff,
// column player's payoff], as the exams print it. Modes: nash (mark the best replies, find the pure equilibria) and
// dominance (compare two rows column by column). Pure; no React.
//
// props: { mode: 'nash' | 'dominance', players: { row, col }, rows: [names], cols: [names],
//          payoffs: [[[a, b], ...], ...] (payoffs[r][c]), compare?: [rowName, rowName] }
// Course definitions: a strategy is dominant if it always pays at least as much as any other, strictly dominant if it
// always pays more.

const bi = (en, ro) => ({ en, ro });
const listIn = (xs, and) => (xs.length > 1 ? `${xs.slice(0, -1).join(', ')} ${and} ${xs[xs.length - 1]}` : String(xs[0]));

export function checkMatrix({ rows, cols, payoffs }) {
  if (!Array.isArray(rows) || rows.length < 2 || !Array.isArray(cols) || cols.length < 2) throw new RangeError('rows and cols need at least two names');
  if (!Array.isArray(payoffs) || payoffs.length !== rows.length) throw new RangeError('payoffs needs one row per row name');
  for (const r of payoffs) {
    if (!Array.isArray(r) || r.length !== cols.length) throw new RangeError('every payoffs row needs one cell per column name');
    for (const c of r) if (!Array.isArray(c) || c.length !== 2 || !c.every(Number.isFinite)) throw new RangeError('a cell is [row payoff, column payoff]');
  }
}

// the rows (indices) with the largest row-player payoff in column c; ties all count
export function bestRowsIn(P, c) {
  const m = Math.max(...P.map((r) => r[c][0]));
  return { max: m, at: P.flatMap((r, i) => (r[c][0] === m ? [i] : [])) };
}
// the columns with the largest column-player payoff in row r
export function bestColsIn(P, r) {
  const m = Math.max(...P[r].map((x) => x[1]));
  return { max: m, at: P[r].flatMap((x, j) => (x[1] === m ? [j] : [])) };
}

// pure Nash equilibria: cells that are a best reply for both players, [row, col] in reading order
export function pureNash(P) {
  const out = [];
  for (let r = 0; r < P.length; r += 1) {
    for (let c = 0; c < P[r].length; c += 1) {
      if (bestRowsIn(P, c).at.includes(r) && bestColsIn(P, r).at.includes(c)) out.push([r, c]);
    }
  }
  return out;
}

// row a against row b, column by column: '>' | '=' | '<' on the row player's payoff
export function compareRows(P, a, b) {
  return P[a].map((cell, c) => (cell[0] > P[b][c][0] ? '>' : cell[0] === P[b][c][0] ? '=' : '<'));
}
export const verdictOf = (rels) => (rels.every((x) => x === '>') ? 'strict' : rels.every((x) => x !== '<') ? 'dominant' : 'none');

// the same for the column player: column a against column b, down the rows, on the column player's payoff
export function compareCols(P, a, b) {
  return P.map((r) => (r[a][1] > r[b][1] ? '>' : r[a][1] === r[b][1] ? '=' : '<'));
}

// whole game: rows (indices) that beat or tie every other row on every column, and those that strictly beat them
export function dominantRows(P) {
  const idx = P.map((_, i) => i);
  const vs = (i) => idx.filter((j) => j !== i).map((j) => verdictOf(compareRows(P, i, j)));
  return {
    weak: idx.filter((i) => vs(i).every((v) => v !== 'none')),
    strict: idx.filter((i) => vs(i).every((v) => v === 'strict')),
  };
}
export function dominantCols(P) {
  const idx = P[0].map((_, j) => j);
  const vs = (j) => idx.filter((k) => k !== j).map((k) => verdictOf(compareCols(P, j, k)));
  return {
    weak: idx.filter((j) => vs(j).every((v) => v !== 'none')),
    strict: idx.filter((j) => vs(j).every((v) => v === 'strict')),
  };
}

export function payoffMatrix(props) {
  const { mode, rows, cols, payoffs: P } = props;
  if (mode !== 'nash' && mode !== 'dominance') throw new RangeError('mode must be nash or dominance');
  checkMatrix(props);
  const who = props.players || { row: 'rând', col: 'coloană' };
  const M = { mode, rows, cols, P, who };
  M.nash = pureNash(P);
  const cell = (r, c) => `(${rows[r]}, ${cols[c]})`;
  const pay = (r, c) => `(${P[r][c][0]}, ${P[r][c][1]})`;

  if (mode === 'nash') {
    M.frames = [
      { kind: 'setup' },
      ...cols.map((_, c) => ({ kind: 'col', c, ...bestRowsIn(P, c) })),
      ...rows.map((_, r) => ({ kind: 'row', r, ...bestColsIn(P, r) })),
      { kind: 'end', nash: M.nash },
    ];
  } else {
    const [ra, rb] = (props.compare || []).map((n) => rows.indexOf(n));
    if (!(ra >= 0 && rb >= 0 && ra !== rb)) throw new RangeError('compare needs two different row names');
    const rels = compareRows(P, ra, rb);
    M.cmp = { a: ra, b: rb, rels, verdict: verdictOf(rels) };
    M.dom = { rows: dominantRows(P), cols: dominantCols(P) };
    M.frames = [
      { kind: 'setup' },
      ...cols.map((_, c) => ({ kind: 'cmp', c, x: P[ra][c][0], y: P[rb][c][0], rel: rels[c] })),
      { kind: 'end', verdict: M.cmp.verdict },
    ];
  }
  M.count = M.frames.length;

  // ---- what is drawn at frame k; `answered` is false while the learner still has to pick ----
  // rowBest / colBest: cells whose row-player / column-player number is marked [ ]; nash: cells both marked at the end;
  // deviations: from each equilibrium cell, the cells a single player could move to
  M.state = (k, answered = true) => {
    const st = { rowBest: [], colBest: [], nash: [], deviations: [], focusCol: null, focusRow: null, rels: [], pair: null };
    if (mode === 'nash') {
      M.frames.forEach((f, j) => {
        const shown = j < k || (j === k && answered) || M.frames[k].kind === 'end';
        if (!shown) return;
        if (f.kind === 'col') f.at.forEach((r) => st.rowBest.push([r, f.c]));
        if (f.kind === 'row') f.at.forEach((c) => st.colBest.push([f.r, c]));
      });
      const f = M.frames[k];
      if (f.kind === 'col') st.focusCol = f.c;
      if (f.kind === 'row') st.focusRow = f.r;
      if (f.kind === 'end') {
        st.nash = M.nash;
        for (const [r, c] of M.nash) {
          rows.forEach((_, r2) => { if (r2 !== r) st.deviations.push({ from: [r, c], to: [r2, c], player: 'row' }); });
          cols.forEach((_, c2) => { if (c2 !== c) st.deviations.push({ from: [r, c], to: [r, c2], player: 'col' }); });
        }
      }
    } else {
      st.pair = [M.cmp.a, M.cmp.b];
      M.frames.forEach((f, j) => {
        if (f.kind !== 'cmp') return;
        if (j < k || (j === k && answered) || M.frames[k].kind === 'end') st.rels[f.c] = f.rel;
      });
      if (M.frames[k].kind === 'cmp') st.focusCol = M.frames[k].c;
    }
    return st;
  };

  // ---- the pick asked at frame k ----
  // nash: tap the cell or cells (a set of indices); dominance: a PickBar spec with the two answers of the course
  M.ask = (k) => {
    const f = M.frames[k];
    if (mode === 'nash' && f.kind === 'col') {
      return {
        type: 'cells', axis: 'col', index: f.c, answer: f.at,
        prompt: bi(`On column ${cols[f.c]}, which row gives ${who.row} the most? Tap the cell, or every cell if there is a tie.`,
          `Pe coloana ${cols[f.c]}, ce rând îi dă lui ${who.row} cel mai mult? Atinge celula, sau toate celulele dacă sunt egale.`),
      };
    }
    if (mode === 'nash' && f.kind === 'row') {
      return {
        type: 'cells', axis: 'row', index: f.r, answer: f.at,
        prompt: bi(`On row ${rows[f.r]}, which column gives ${who.col} the most? Tap the cell, or every cell if there is a tie.`,
          `Pe rândul ${rows[f.r]}, ce coloană îi dă lui ${who.col} cel mai mult? Atinge celula, sau toate celulele dacă sunt egale.`),
      };
    }
    return null;
  };
  M.pickSpec = (k) => {
    const f = M.frames[k];
    if (mode !== 'dominance' || f.kind !== 'cmp') return null;
    const a = rows[M.cmp.a]; const b = rows[M.cmp.b];
    return {
      items: [{
        key: `d${k}`,
        prompt: bi(`On column ${cols[f.c]}: does row ${a} give ${who.row} at least as much as row ${b}?`,
          `Pe coloana ${cols[f.c]}: rândul ${a} îi dă lui ${who.row} cel puțin cât rândul ${b}?`),
        options: [{ id: 'ge', label: '≥' }, { id: 'lt', label: '<' }],
      }],
    };
  };
  M.answer = (k) => {
    const f = M.frames[k];
    if (f.kind === 'col' || f.kind === 'row') return f.at;
    if (f.kind === 'cmp') return f.rel === '<' ? 'lt' : 'ge';
    return null;
  };

  // ---- captions ----
  const names = (xs, list) => listIn(xs.map((i) => list[i]), 'și');
  const namesEn = (xs, list) => listIn(xs.map((i) => list[i]), 'and');
  M.caption = (k, { answered = true, picks = {} } = {}) => {
    const f = M.frames[k];
    if (f.kind === 'setup') {
      return mode === 'nash'
        ? bi(`${who.row} picks a row, ${who.col} picks a column. A cell shows (${who.row}'s payoff, ${who.col}'s payoff). Look for a cell where neither wants to change alone.`,
          `${who.row} alege un rând, ${who.col} alege o coloană. Celula arată (câștigul lui ${who.row}, câștigul lui ${who.col}). Căutăm celula în care niciunul nu vrea să schimbe singur.`)
        : bi(`Compare row ${rows[M.cmp.a]} with row ${rows[M.cmp.b]} on every column, using ${who.row}'s payoff only (the left number).`,
          `Compară rândul ${rows[M.cmp.a]} cu rândul ${rows[M.cmp.b]} pe fiecare coloană, doar după câștigul lui ${who.row} (numărul din stânga).`);
    }
    if (f.kind === 'col' || f.kind === 'row') {
      const col = f.kind === 'col';
      if (!answered) return col ? bi(`Column ${cols[f.c]}.`, `Coloana ${cols[f.c]}.`) : bi(`Row ${rows[f.r]}.`, `Rândul ${rows[f.r]}.`);
      const vals = col ? P.map((r) => r[f.c][0]) : P[f.r].map((x) => x[1]);
      const labels = col ? rows : cols;
      const pl = col ? who.row : who.col;
      const base = col
        ? bi(`On column ${cols[f.c]}, ${pl} gets ${vals.join(', ')}; the most is ${f.max}, at ${f.at.length > 1 ? 'rows' : 'row'} ${namesEn(f.at, labels)}.`,
          `Pe coloana ${cols[f.c]}, ${pl} ia ${vals.join(', ')}; cel mai mult este ${f.max}, la ${f.at.length > 1 ? 'rândurile' : 'rândul'} ${names(f.at, labels)}.`)
        : bi(`On row ${rows[f.r]}, ${pl} gets ${vals.join(', ')}; the most is ${f.max}, at ${f.at.length > 1 ? 'columns' : 'column'} ${namesEn(f.at, labels)}.`,
          `Pe rândul ${rows[f.r]}, ${pl} ia ${vals.join(', ')}; cel mai mult este ${f.max}, la ${f.at.length > 1 ? 'coloanele' : 'coloana'} ${names(f.at, labels)}.`);
      const pick = picks[`k${k}`];
      const ok = pick === undefined || (pick.length === f.at.length && f.at.every((x) => pick.includes(x)));
      if (ok) return base;
      const mine = pick.length ? listIn(pick.map((i) => labels[i]), 'și') : 'nimic';
      const mineEn = pick.length ? listIn(pick.map((i) => labels[i]), 'and') : 'nothing';
      return bi(`Not quite (you tapped ${mineEn}). ${base.en}`, `Nu chiar (ai atins ${mine}). ${base.ro}`);
    }
    if (f.kind === 'cmp') {
      const a = rows[M.cmp.a]; const b = rows[M.cmp.b];
      if (!answered) return bi(`Column ${cols[f.c]}.`, `Coloana ${cols[f.c]}.`);
      const holds = f.rel !== '<';
      const base = bi(`On column ${cols[f.c]}: ${a} gives ${f.x}, ${b} gives ${f.y}, so ${f.x} ${f.rel} ${f.y}${f.rel === '=' ? ' (still counts as ≥, but not strict)' : ''}.`,
        `Pe coloana ${cols[f.c]}: ${a} dă ${f.x}, ${b} dă ${f.y}, deci ${f.x} ${f.rel} ${f.y}${f.rel === '=' ? ' (se numără ca ≥, dar nu e strict)' : ''}.`);
      const pick = picks[`d${k}`];
      if (pick === undefined || pick === (holds ? 'ge' : 'lt')) return base;
      return bi(`Not quite. ${base.en}`, `Nu chiar. ${base.ro}`);
    }
    if (mode === 'dominance') {
      const a = rows[M.cmp.a]; const b = rows[M.cmp.b];
      const word = {
        strict: bi(`${a} is strictly better than ${b} on every column.`, `${a} este mai bun decât ${b} pe fiecare coloană: strict dominant față de ${b}.`),
        dominant: bi(`${a} is at least as good as ${b} on every column, but not always better.`, `${a} este cel puțin la fel de bun ca ${b} pe fiecare coloană, dar nu mereu mai bun: dominant față de ${b}, nu strict.`),
        none: bi(`${a} loses to ${b} on some column, so ${a} does not dominate ${b}.`, `${a} pierde în fața lui ${b} pe cel puțin o coloană, deci ${a} nu domină ${b}.`),
      }[M.cmp.verdict];
      const dr = M.dom.rows.weak; const dc = M.dom.cols.weak;
      const all = bi(
        `In the whole game: ${dr.length ? `${who.row} has the dominant row ${namesEn(dr, rows)}` : `${who.row} has no dominant row`}; ${dc.length ? `${who.col} has the dominant column ${namesEn(dc, cols)}` : `${who.col} has no dominant column`}.`,
        `În tot jocul: ${dr.length ? `${who.row} are rândul dominant ${names(dr, rows)}` : `${who.row} nu are niciun rând dominant`}; ${dc.length ? `${who.col} are coloana dominantă ${names(dc, cols)}` : `${who.col} nu are nicio coloană dominantă`}.`,
      );
      return bi(`${word.en} ${all.en}`, `${word.ro} ${all.ro}`);
    }
    // nash, end
    if (!f.nash.length) return bi('No cell is marked twice: there is no pure Nash equilibrium.', 'Nicio celulă nu are ambele marcaje: nu există echilibru Nash pur.');
    const eq = f.nash.map(([r, c]) => bi(`${cell(r, c)} with payoffs ${pay(r, c)}`, `${cell(r, c)}, cu câștigurile ${pay(r, c)}`));
    const dev = f.nash.map(([r, c]) => {
      const rv = P.flatMap((x, i) => (i === r ? [] : [x[c][0]]));
      const cv = P[r].flatMap((x, j) => (j === c ? [] : [x[1]]));
      return bi(`In ${cell(r, c)}: if ${who.row} changes row alone, ${who.row} gets ${listIn(rv, 'or')}; if ${who.col} changes column alone, ${who.col} gets ${listIn(cv, 'or')}.`,
        `În ${cell(r, c)}: dacă ${who.row} schimbă singur rândul, ia ${listIn(rv, 'sau')}; dacă ${who.col} schimbă singur coloana, ia ${listIn(cv, 'sau')}.`);
    });
    return bi(`Pure Nash ${f.nash.length > 1 ? 'equilibria' : 'equilibrium'}: ${listIn(eq.map((x) => x.en), 'and')}. ${dev.map((x) => x.en).join(' ')}`,
      `Echilibr${f.nash.length > 1 ? 'e' : 'u'} Nash pur${f.nash.length > 1 ? 'e' : ''}: ${listIn(eq.map((x) => x.ro), 'și')}. ${dev.map((x) => x.ro).join(' ')}`);
  };
  return M;
}
