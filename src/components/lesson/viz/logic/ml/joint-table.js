// Pure logic of the ml-joint-table widget (Lecții 5 and 6): a joint distribution of two variables (X, Y) or three
// (X, Y, Z), its marginals, a conditional, the cell-by-cell independence check, E[XY] and Cov, the grouping by X+Y,
// and, with Z, the hiding of Z and the slices "condition on Z = z". All values are exact Fractions; every number the
// widget draws or writes is built here, per frame, from the table's P column.
import Fraction from '../../../../../ml/calc/fraction.js';
import { E } from '../../../../../ml/calc/mathKit.js';
import { both, disp, fmtFrac, pickMode, toFrac } from './prob-format.js';

const colName = (c) => (typeof c === 'string' ? c : c.en);
const cmp = (a, b) => (typeof a === 'number' && typeof b === 'number' ? a - b : String(a) < String(b) ? -1 : String(a) > String(b) ? 1 : 0);
const ZERO = new Fraction(0);
const sum = (fs) => fs.reduce((s, f) => s.add(f), ZERO);
const lab = (s) => ({ en: s, ro: s });

// The table { columns, rows } with a P column: x, y, optional z name three of its columns.
export function joint(props) {
  const { table, x, y, z } = props;
  if (!table || !Array.isArray(table.columns) || !Array.isArray(table.rows)) throw new RangeError('joint: table needs columns and rows');
  const cols = table.columns.map(colName);
  const at = (n) => cols.indexOf(n);
  const ix = at(x), iy = at(y), iz = z ? at(z) : -1, ip = at('P');
  if (ix < 0 || iy < 0 || ip < 0 || (z && iz < 0)) throw new RangeError(`joint: the table must have the columns ${[x, y, z, 'P'].filter(Boolean).join(', ')}`);
  for (const r of table.rows) if (!Array.isArray(r) || r.length !== cols.length) throw new RangeError('joint: a row has the wrong length');
  const uniq = (i) => [...new Set(table.rows.map((r) => r[i]))].sort(cmp);
  const xs = uniq(ix), ys = uniq(iy), zs = z ? uniq(iz) : [null];
  const P = xs.map(() => ys.map(() => zs.map(() => ZERO)));
  for (const r of table.rows) {
    const p = toFrac(r[ip]);
    if (p.sign() < 0) throw new RangeError('joint: a probability is negative');
    const i = xs.indexOf(r[ix]), j = ys.indexOf(r[iy]), k = z ? zs.indexOf(r[iz]) : 0;
    P[i][j][k] = P[i][j][k].add(p);
  }
  const total = sum(P.flat(2));
  if (!total.equals(1)) throw new RangeError(`joint: the probabilities must sum to 1 (got ${total})`);
  const mode = pickMode(props.format, table.rows.map((r) => toFrac(r[ip])));
  const pxy = xs.map((_, i) => ys.map((__, j) => sum(zs.map((___, k) => P[i][j][k]))));
  const px = xs.map((_, i) => sum(pxy[i]));
  const py = ys.map((_, j) => sum(xs.map((__, i) => pxy[i][j])));
  const pz = zs.map((_, k) => sum(xs.flatMap((__, i) => ys.map((___, j) => P[i][j][k]))));
  return {
    xs, ys, zs, P, pxy, px, py, pz, mode, hasZ: !!z, names: { x, y, z },
    numeric: [...xs, ...ys].every((v) => typeof v === 'number'),
    rowsAre: props.rowsAre === 'y' ? 'y' : 'x',
  };
}

const f1 = (J, f, l) => fmtFrac(f, l, J.mode);
const wrapNeg = (J, f, l) => (f.sign() < 0 ? `(${f1(J, f, l)})` : f1(J, f, l));
const verdictWords = (ok, l) => (l === 'ro' ? (ok ? 'verifică' : 'nu verifică') : (ok ? 'holds' : 'does not hold'));
const crit = (l, ro, en) => (l === 'ro' ? ro : en);

// ---------- grid ----------
// A grid is what the component draws: column heads, rows of cells (each cell has a value text or "?", a class and an optional
// check annotation), optional margins. Cells carry their x/y/z so a test can read them back from data attributes.
function cellOf(J, i, j, k, spec = {}) {
  const f = spec.v === undefined ? J.P[i][j][k] : spec.v;
  return {
    i, j, k, v: f, text: f === null ? null : disp(f, J.mode), cls: spec.cls || '',
    annot: spec.annot || null, cap: !!spec.cap, button: !!spec.button,
  };
}

// XY layout: rows are X or Y (props.rowsAre), columns the other. spec(i, j) -> cell spec; marg: { x:Set, y:Set, fresh }.
function gridXY(J, spec, marg = { x: new Set(), y: new Set() }) {
  const rowsX = J.rowsAre === 'x';
  const R = rowsX ? J.xs : J.ys, C = rowsX ? J.ys : J.xs;
  const rn = rowsX ? J.names.x : J.names.y, cn = rowsX ? J.names.y : J.names.x;
  const ij = (r, c) => (rowsX ? [r, c] : [c, r]);
  const margOf = (axis, idx) => {
    const set = axis === 'x' ? marg.x : marg.y;
    if (!set.has(idx)) return null;
    const f = axis === 'x' ? J.px[idx] : J.py[idx];
    const fresh = marg.fresh && marg.fresh.axis === axis && marg.fresh.idx === idx;
    return { text: disp(f, J.mode), cap: !!fresh, axis, idx, cls: fresh ? 'new' : '' };
  };
  return {
    layout: 'xy', rowName: rn, colName: cn,
    colHeads: C.map((v) => ({ label: lab(`${cn}=${v}`) })),
    rows: R.map((v, r) => ({
      head: lab(`${rn}=${v}`),
      cells: C.map((_, c) => { const [i, j] = ij(r, c); return cellOf(J, i, j, 0, spec(i, j)); }),
      marg: margOf(rowsX ? 'x' : 'y', r),
    })),
    bottom: C.map((_, c) => margOf(rowsX ? 'y' : 'x', c)),
    rowMargHead: `P(${rn})`, bottomHead: `P(${cn})`,
    hasMarg: marg.x.size + marg.y.size > 0,
  };
}

// ---------- the L5 steps (two variables) ----------
function cellOrder(J) {
  const out = [];
  const rowsX = J.rowsAre === 'x';
  const R = rowsX ? J.xs.length : J.ys.length, C = rowsX ? J.ys.length : J.xs.length;
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) out.push(rowsX ? [r, c] : [c, r]);
  return out;
}

const prodText = (J, i, j) => ({ ...both((l) => `${f1(J, J.px[i], l)}·${f1(J, J.py[j], l)} = ${f1(J, J.px[i].mul(J.py[j]), l)}`) });
const holds = (J, i, j) => J.pxy[i][j].equals(J.px[i].mul(J.py[j]));
const cellName = (J, i, j) => `${J.names.x}=${J.xs[i]}, ${J.names.y}=${J.ys[j]}`;

export function jointSteps(J) {
  const frames = [];
  const marg = { x: new Set(), y: new Set() };
  const copy = () => ({ x: new Set(marg.x), y: new Set(marg.y) });
  const { xs, ys, names } = J;
  const rowsX = J.rowsAre === 'x';

  frames.push({
    kind: 'setup', grid: gridXY(J, () => ({}), copy()), info: [],
    caption: both((l) => crit(l,
      `Distribuția comună a lui (${names.x}, ${names.y}). Marginalele nu sunt încă scrise. Cât este P(${names.x}=${xs[0]})?`,
      `The joint distribution of (${names.x}, ${names.y}). The marginals are not written yet. What is P(${names.x}=${xs[0]})?`)),
  });

  const margFrame = (axis, idx) => {
    (axis === 'x' ? marg.x : marg.y).add(idx);
    const vals = axis === 'x' ? ys.map((_, j) => J.pxy[idx][j]) : xs.map((_, i) => J.pxy[i][idx]);
    const total = axis === 'x' ? J.px[idx] : J.py[idx];
    const n = axis === 'x' ? names.x : names.y;
    const v = axis === 'x' ? xs[idx] : ys[idx];
    const isRow = (axis === 'x') === rowsX;
    frames.push({
      kind: 'marginal', axis, idx, info: [],
      grid: gridXY(J, (i, j) => ({ cls: (axis === 'x' ? i === idx : j === idx) ? 'hl' : '' }), { ...copy(), fresh: { axis, idx } }),
      caption: both((l) => crit(l,
        `P(${n}=${v}) = ${vals.map((f) => f1(J, f, l)).join(' + ')} = ${f1(J, total, l)}: suma ${isRow ? 'rândului' : 'coloanei'} ${n}=${v}, scrisă în marginea tabelului.`,
        `P(${n}=${v}) = ${vals.map((f) => f1(J, f, l)).join(' + ')} = ${f1(J, total, l)}: the sum of the ${n}=${v} ${isRow ? 'row' : 'column'}, written in the margin of the table.`)),
    });
  };
  xs.forEach((_, i) => margFrame('x', i));
  ys.forEach((_, j) => margFrame('y', j));

  // conditional: P(X = x0 | Y = y*), y* the last value of Y with positive probability
  let js = ys.length - 1;
  while (js > 0 && J.py[js].sign() === 0) js -= 1;
  const cond = xs.map((_, i) => J.pxy[i][js].div(J.py[js]));
  frames.push({
    kind: 'conditional', info: [], yStar: js,
    grid: gridXY(J, (i, j) => (j === js ? { v: cond[i], cls: 'cond', cap: i === 0 } : { cls: 'dim' }), copy()),
    caption: both((l) => crit(l,
      `P(${names.x}=${xs[0]} | ${names.y}=${ys[js]}) = ${f1(J, J.pxy[0][js], l)} / ${f1(J, J.py[js], l)} = ${f1(J, cond[0], l)}. Linia ${names.y}=${ys[js]}, împărțită la ${f1(J, J.py[js], l)}, are suma 1: ${cond.map((f) => f1(J, f, l)).join(' + ')}.`,
      `P(${names.x}=${xs[0]} | ${names.y}=${ys[js]}) = ${f1(J, J.pxy[0][js], l)} / ${f1(J, J.py[js], l)} = ${f1(J, cond[0], l)}. The ${names.y}=${ys[js]} line, divided by ${f1(J, J.py[js], l)}, sums to 1: ${cond.map((f) => f1(J, f, l)).join(' + ')}.`)),
  });

  // independence, one cell per frame
  const order = cellOrder(J);
  const allHold = order.every(([i, j]) => holds(J, i, j));
  const failing = order.filter(([i, j]) => !holds(J, i, j)).length;
  order.forEach(([ci, cj], n) => {
    const done = order.slice(0, n);
    const spec = (i, j) => {
      if (i === ci && j === cj) return { cls: `cur ${holds(J, i, j) ? 'ok' : 'bad'}`, cap: true, annot: { text: prodText(J, i, j), ok: holds(J, i, j), cap: true } };
      if (done.some(([a, b]) => a === i && b === j)) return { cls: holds(J, i, j) ? 'ok' : 'bad', annot: { text: prodText(J, i, j), ok: holds(J, i, j) } };
      return {};
    };
    const last = n === order.length - 1;
    frames.push({
      kind: 'check', cell: [ci, cj], info: [],
      grid: gridXY(J, spec, copy()),
      caption: both((l) => {
        const ok = holds(J, ci, cj);
        let s = crit(l,
          `(${cellName(J, ci, cj)}): P(${names.x}=${xs[ci]})·P(${names.y}=${ys[cj]}) = ${f1(J, J.px[ci], l)}·${f1(J, J.py[cj], l)} = ${f1(J, J.px[ci].mul(J.py[cj]), l)}, iar în tabel este ${f1(J, J.pxy[ci][cj], l)}. ${verdictWords(ok, l)[0].toUpperCase()}${verdictWords(ok, l).slice(1)}.`,
          `(${cellName(J, ci, cj)}): P(${names.x}=${xs[ci]})·P(${names.y}=${ys[cj]}) = ${f1(J, J.px[ci], l)}·${f1(J, J.py[cj], l)} = ${f1(J, J.px[ci].mul(J.py[cj]), l)}, and the table has ${f1(J, J.pxy[ci][cj], l)}. It ${verdictWords(ok, l)}.`);
        if (last) {
          s += allHold
            ? crit(l, ` Toate cele ${order.length} celule verifică: ${names.x} și ${names.y} sunt independente.`, ` All ${order.length} cells hold: ${names.x} and ${names.y} are independent.`)
            : crit(l, ` ${failing} din ${order.length} celule nu verifică: ${names.x} și ${names.y} nu sunt independente.`, ` ${failing} of ${order.length} cells fail: ${names.x} and ${names.y} are not independent.`);
        }
        return s;
      }),
    });
  });
  const independent = allHold;

  if (J.numeric) {
    const X = xs.map(toFrac), Y = ys.map(toFrac);
    const ex = E(X, J.px), ey = E(Y, J.py);
    const nz = order.filter(([i, j]) => !X[i].mul(Y[j]).equals(0));
    const exy = sum(order.map(([i, j]) => X[i].mul(Y[j]).mul(J.pxy[i][j])));
    const eyex = ex.mul(ey);
    const cov = exy.sub(eyex);
    const nzSet = new Set(nz.map(([i, j]) => `${i},${j}`));
    frames.push({
      kind: 'expect', ex, ey, exy, cov,
      grid: gridXY(J, (i, j) => (nzSet.has(`${i},${j}`) ? { cls: 'on' } : { cls: 'dim' }), copy()),
      info: [
        { kind: 'exy', label: lab(`E[${names.x}${names.y}]`), value: disp(exy, J.mode) },
        { kind: 'exey', label: lab(`E[${names.x}]·E[${names.y}]`), value: disp(eyex, J.mode) },
        { kind: 'cov', label: lab(`Cov(${names.x}, ${names.y})`), value: disp(cov, J.mode) },
      ],
      caption: both((l) => {
        const terms = nz.length ? nz.map(([i, j]) => `${wrapNeg(J, X[i], l)}·${wrapNeg(J, Y[j], l)}·${f1(J, J.pxy[i][j], l)}`).join(' + ') : '0';
        return crit(l,
          `E[${names.x}${names.y}] = ${terms} = ${f1(J, exy, l)}${nz.length < order.length ? ` (în celelalte celule ${names.x}·${names.y} = 0)` : ''}. E[${names.x}]·E[${names.y}] = ${f1(J, ex, l)}·${f1(J, ey, l)} = ${f1(J, eyex, l)}, deci Cov(${names.x}, ${names.y}) = ${f1(J, exy, l)} − ${f1(J, eyex, l)} = ${f1(J, cov, l)}.`,
          `E[${names.x}${names.y}] = ${terms} = ${f1(J, exy, l)}${nz.length < order.length ? ` (in the other cells ${names.x}·${names.y} = 0)` : ''}. E[${names.x}]·E[${names.y}] = ${f1(J, ex, l)}·${f1(J, ey, l)} = ${f1(J, eyex, l)}, so Cov(${names.x}, ${names.y}) = ${f1(J, exy, l)} − ${f1(J, eyex, l)} = ${f1(J, cov, l)}.`);
      }),
    });

    // grouping by the value of X + Y
    const groups = new Map();
    for (const [i, j] of order) {
      const key = X[i].add(Y[j]);
      const k = key.toString();
      if (!groups.has(k)) groups.set(k, { s: key, cells: [] });
      groups.get(k).cells.push([i, j]);
    }
    const gl = [...groups.values()].sort((a, b) => a.s.cmp(b.s));
    gl.forEach((g) => { g.p = sum(g.cells.map(([i, j]) => J.pxy[i][j])); });
    const gIndex = (i, j) => gl.findIndex((g) => g.cells.some(([a, b]) => a === i && b === j));
    const es = E(gl.map((g) => g.s), gl.map((g) => g.p));
    const es2 = E(gl.map((g) => g.s.mul(g.s)), gl.map((g) => g.p));
    const vs = es2.sub(es.mul(es));
    const vx = E(X.map((v) => v.mul(v)), J.px).sub(ex.mul(ex));
    const vy = E(Y.map((v) => v.mul(v)), J.py).sub(ey.mul(ey));
    const vformula = vx.add(vy).add(cov.mul(2));
    frames.push({
      kind: 'sum', groups: gl, es, es2, vs, vx, vy, vformula,
      grid: gridXY(J, (i, j) => ({ cls: `g${gIndex(i, j) % 4}` }), copy()),
      info: [
        ...gl.map((g) => ({ kind: 'group', label: lab(`${names.x}+${names.y}=${f1(J, g.s, 'en')}`), value: disp(g.p, J.mode) })),
        { kind: 'varsum', label: lab(`Var(${names.x}+${names.y})`), value: disp(vs, J.mode) },
      ],
      caption: both((l) => {
        const gs = gl.map((g) => `${crit(l, 'valoarea', 'the value')} ${f1(J, g.s, l)} ${crit(l, 'cu', 'with')} ${g.cells.length > 1 ? `${g.cells.map(([i, j]) => f1(J, J.pxy[i][j], l)).join(' + ')} = ` : ''}${f1(J, g.p, l)}`);
        const sumList = gs.length > 1 ? `${gs.slice(0, -1).join(', ')} ${crit(l, 'și', 'and')} ${gs.at(-1)}` : gs[0];
        return crit(l,
          `Celulele cu aceeași sumă se adună: ${names.x}+${names.y} ia ${sumList}. E[${names.x}+${names.y}] = ${f1(J, es, l)}; E[(${names.x}+${names.y})²] − E[${names.x}+${names.y}]² = ${f1(J, es2, l)} − ${f1(J, es.mul(es), l)} = ${f1(J, vs, l)} = Var(${names.x}) + Var(${names.y}) + 2·Cov = ${f1(J, vx, l)} + ${f1(J, vy, l)} + 2·(${f1(J, cov, l)}) = ${f1(J, vformula, l)}.`,
          `Cells with the same sum merge: ${names.x}+${names.y} takes ${sumList}. E[${names.x}+${names.y}] = ${f1(J, es, l)}; E[(${names.x}+${names.y})²] − E[${names.x}+${names.y}]² = ${f1(J, es2, l)} − ${f1(J, es.mul(es), l)} = ${f1(J, vs, l)} = Var(${names.x}) + Var(${names.y}) + 2·Cov = ${f1(J, vx, l)} + ${f1(J, vy, l)} + 2·(${f1(J, cov, l)}) = ${f1(J, vformula, l)}.`);
      }),
    });
  }
  return { frames, independent, failing };
}

// ---------- explorer (L5 opening question): all marginals shown, the learner touches cells ----------
export function exploreView(J, picked = []) {
  const all = { x: new Set(J.xs.map((_, i) => i)), y: new Set(J.ys.map((_, j) => j)) };
  const last = picked.at(-1);
  const isPicked = (i, j) => picked.some(([a, b]) => a === i && b === j);
  const spec = (i, j) => {
    if (!isPicked(i, j)) return { button: true };
    const ok = holds(J, i, j);
    const cur = last && last[0] === i && last[1] === j;
    return { button: true, cls: `${cur ? 'cur ' : ''}${ok ? 'ok' : 'bad'}`, cap: cur, annot: { text: prodText(J, i, j), ok, cap: cur } };
  };
  const grid = gridXY(J, spec, all);
  const { names, xs, ys } = J;
  const lstX = (l) => `(${J.px.map((f) => f1(J, f, l)).join(', ')})`;
  const lstY = (l) => `(${J.py.map((f) => f1(J, f, l)).join(', ')})`;
  const failed = picked.filter(([i, j]) => !holds(J, i, j)).length;
  const caption = both((l) => {
    if (!last) {
      return crit(l,
        `Marginalele sunt P(${names.x}) = ${lstX(l)} și P(${names.y}) = ${lstY(l)}. Atinge o celulă ca să compari valoarea ei cu produsul marginalelor.`,
        `The marginals are P(${names.x}) = ${lstX(l)} and P(${names.y}) = ${lstY(l)}. Touch a cell to compare its value with the product of the marginals.`);
    }
    const [i, j] = last;
    const ok = holds(J, i, j);
    let s = crit(l,
      `(${cellName(J, i, j)}): P(${names.x}=${xs[i]}, ${names.y}=${ys[j]}) = ${f1(J, J.pxy[i][j], l)}, iar P(${names.x}=${xs[i]})·P(${names.y}=${ys[j]}) = ${f1(J, J.px[i], l)}·${f1(J, J.py[j], l)} = ${f1(J, J.px[i].mul(J.py[j]), l)}. ${ok ? 'Se potrivesc' : 'Nu sunt egale'}.`,
      `(${cellName(J, i, j)}): P(${names.x}=${xs[i]}, ${names.y}=${ys[j]}) = ${f1(J, J.pxy[i][j], l)}, and P(${names.x}=${xs[i]})·P(${names.y}=${ys[j]}) = ${f1(J, J.px[i], l)}·${f1(J, J.py[j], l)} = ${f1(J, J.px[i].mul(J.py[j]), l)}. ${ok ? 'They match' : 'They are not equal'}.`);
    s += crit(l, ` Ai verificat ${picked.length} din ${J.xs.length * J.ys.length} celule.`, ` You have checked ${picked.length} of ${J.xs.length * J.ys.length} cells.`);
    if (failed > 0) s += crit(l, ` O celulă care nu se potrivește arată că ${names.x} și ${names.y} nu sunt independente.`, ` One cell that does not match shows that ${names.x} and ${names.y} are not independent.`);
    return s;
  });
  return { grid, caption, picked, failed };
}

// ---------- the L6 steps (three variables) ----------
function pairs(J) {
  const out = [];
  J.xs.forEach((_, i) => J.ys.forEach((__, j) => out.push([i, j])));
  return out;
}

function gridXYZ(J, { cols, cell, headCls }) {
  const { names, xs, ys, zs } = J;
  return {
    layout: 'xyz', rowName: `(${names.x}, ${names.y})`, colName: names.z,
    colHeads: cols.map((c) => ({ label: c.label, cls: headCls ? headCls(c) : '' })),
    rows: pairs(J).map(([i, j]) => ({
      head: lab(`(${names.x}, ${names.y}) = (${xs[i]}, ${ys[j]})`),
      cells: cols.map((c) => ({ ...cellOf(J, i, j, c.k, cell(i, j, c)), noZ: !!c.noZ })),
      marg: null,
    })),
    bottom: null, hasMarg: false, zs, ys,
  };
}

export function jointZSteps(J, conditionOn) {
  const { xs, ys, zs, names } = J;
  const P = J.P;
  const zAll = zs.map((z, k) => ({ k, z, label: lab(`${names.z}=${z}`) }));
  const nz = (k) => J.pz[k].sign() > 0;
  const sliceZs = (Array.isArray(conditionOn) && conditionOn.length ? conditionOn : zs).map((z) => zs.indexOf(z)).filter((k) => k >= 0 && nz(k));
  const pxz = (i, k) => sum(ys.map((_, j) => P[i][j][k]));
  const pyz = (j, k) => sum(xs.map((_, i) => P[i][j][k]));
  const cx = (i, k) => pxz(i, k).div(J.pz[k]);
  const cy = (j, k) => pyz(j, k).div(J.pz[k]);
  const decomp = (i, j, k) => J.pz[k].mul(cx(i, k)).mul(cy(j, k));
  const decompOk = (i, j, k) => nz(k) && decomp(i, j, k).equals(P[i][j][k]);
  const allDecomp = pairs(J).every(([i, j]) => zs.every((_, k) => !nz(k) || decompOk(i, j, k)));
  const cellsN = pairs(J).length * zs.length;
  const frames = [];
  const full = zAll;

  frames.push({
    kind: 'setup', info: [],
    grid: gridXYZ(J, { cols: full, cell: () => ({ v: null }) }),
    caption: both((l) => crit(l,
      `Tabelul comun al lui (${names.x}, ${names.y}, ${names.z}) are ${cellsN} celule, încă goale. Prima celulă: P(${names.x}=${xs[0]}, ${names.y}=${ys[0]}, ${names.z}=${zs[0]}).`,
      `The joint table of (${names.x}, ${names.y}, ${names.z}) has ${cellsN} cells, still empty. The first cell: P(${names.x}=${xs[0]}, ${names.y}=${ys[0]}, ${names.z}=${zs[0]}).`)),
  });

  const k0 = zs.findIndex((_, k) => nz(k));
  const dtext = (i, j, k, l) => `${f1(J, J.pz[k], l)}·${f1(J, cx(i, k), l)}·${f1(J, cy(j, k), l)} = ${f1(J, decomp(i, j, k), l)}`;
  frames.push({
    kind: 'first', info: [],
    grid: gridXYZ(J, { cols: full, cell: (i, j, c) => (i === 0 && j === 0 && c.k === k0 ? { cls: 'cur', cap: true } : { v: null }) }),
    caption: both((l) => {
      const head = `P(${names.x}=${xs[0]}, ${names.y}=${ys[0]}, ${names.z}=${zs[k0]})`;
      if (decompOk(0, 0, k0)) {
        return crit(l,
          `${head} = P(${names.z}=${zs[k0]})·P(${names.x}=${xs[0]} | ${names.z}=${zs[k0]})·P(${names.y}=${ys[0]} | ${names.z}=${zs[k0]}) = ${dtext(0, 0, k0, l)}.`,
          `${head} = P(${names.z}=${zs[k0]})·P(${names.x}=${xs[0]} | ${names.z}=${zs[k0]})·P(${names.y}=${ys[0]} | ${names.z}=${zs[k0]}) = ${dtext(0, 0, k0, l)}.`);
      }
      return crit(l,
        `${head} = ${f1(J, P[0][0][k0], l)}. Produsul P(${names.z})·P(${names.x} | ${names.z})·P(${names.y} | ${names.z}) ar da ${f1(J, decomp(0, 0, k0), l)}: celula aceasta nu urmează tiparul.`,
        `${head} = ${f1(J, P[0][0][k0], l)}. The product P(${names.z})·P(${names.x} | ${names.z})·P(${names.y} | ${names.z}) would give ${f1(J, decomp(0, 0, k0), l)}: this cell does not follow the pattern.`);
    }),
  });

  frames.push({
    kind: 'all', info: [], allDecomp,
    grid: gridXYZ(J, { cols: full, cell: () => ({}) }),
    caption: both((l) => {
      if (allDecomp && ys.length > 1) {
        return crit(l,
          `Celelalte celule urmează același tipar, de exemplu P(${names.x}=${xs[0]}, ${names.y}=${ys[1]}, ${names.z}=${zs[k0]}) = ${dtext(0, 1, k0, l)}. Suma celor ${cellsN} celule este ${f1(J, sum(P.flat(2)), l)}.`,
          `The other cells follow the same pattern, for example P(${names.x}=${xs[0]}, ${names.y}=${ys[1]}, ${names.z}=${zs[k0]}) = ${dtext(0, 1, k0, l)}. The ${cellsN} cells sum to ${f1(J, sum(P.flat(2)), l)}.`);
      }
      return crit(l, `Tabelul complet: suma celor ${cellsN} celule este ${f1(J, sum(P.flat(2)), l)}.`, `The full table: the ${cellsN} cells sum to ${f1(J, sum(P.flat(2)), l)}.`);
    }),
  });

  // hide Z: add the columns
  const order = pairs(J);
  const holdsH = (i, j) => J.pxy[i][j].equals(J.px[i].mul(J.py[j]));
  const failH = order.filter(([i, j]) => !holdsH(i, j));
  const depTotal = failH.length > 0;
  const [hi, hj] = failH[0] || order[0];
  const sumCol = [{ k: 0, noZ: true, label: lab(`P(${names.x}, ${names.y})`) }];
  const hidePxy = (i, j) => ({ v: J.pxy[i][j], cls: holdsH(i, j) ? 'ok' : 'bad', annot: { text: prodText(J, i, j), ok: holdsH(i, j), cap: i === hi && j === hj }, cap: i === hi && j === hj });
  frames.push({
    kind: 'hide', depTotal,
    grid: gridXYZ(J, { cols: sumCol, cell: hidePxy }),
    info: [
      ...xs.map((_, i) => ({ kind: 'marg', label: lab(`P(${names.x}=${xs[i]})`), value: disp(J.px[i], J.mode) })),
      ...ys.map((_, j) => ({ kind: 'marg', label: lab(`P(${names.y}=${ys[j]})`), value: disp(J.py[j], J.mode) })),
    ],
    caption: both((l) => {
      const cells = zs.map((_, k) => f1(J, P[hi][hj][k], l)).join(' + ');
      const prod = `${f1(J, J.px[hi], l)}·${f1(J, J.py[hj], l)} = ${f1(J, J.px[hi].mul(J.py[hj]), l)}`;
      const eq = holdsH(hi, hj);
      return crit(l,
        `Fără ${names.z}, adunăm coloanele: P(${names.x}=${xs[hi]}, ${names.y}=${ys[hj]}) = ${cells} = ${f1(J, J.pxy[hi][hj], l)}. P(${names.x}=${xs[hi]})·P(${names.y}=${ys[hj]}) = ${prod}, ${eq ? 'la fel' : `diferit de ${f1(J, J.pxy[hi][hj], l)}`}. ${depTotal ? `${failH.length} din ${order.length} celule nu verifică: ${names.x} și ${names.y} sunt dependente.` : `Toate celulele verifică: ${names.x} și ${names.y} sunt independente.`}`,
        `Without ${names.z}, add the columns: P(${names.x}=${xs[hi]}, ${names.y}=${ys[hj]}) = ${cells} = ${f1(J, J.pxy[hi][hj], l)}. P(${names.x}=${xs[hi]})·P(${names.y}=${ys[hj]}) = ${prod}, ${eq ? 'the same' : `different from ${f1(J, J.pxy[hi][hj], l)}`}. ${depTotal ? `${failH.length} of ${order.length} cells fail: ${names.x} and ${names.y} are dependent.` : `All cells hold: ${names.x} and ${names.y} are independent.`}`);
    }),
  });

  // P(Y = y* | X = x*)
  const xi = xs.length - 1, yj = ys.length - 1;
  const condv = J.px[xi].sign() > 0 ? J.pxy[xi][yj].div(J.px[xi]) : ZERO;
  const dirWord = (l) => { const c = condv.cmp(J.py[yj]); return c > 0 ? crit(l, 'crește', 'goes up') : c < 0 ? crit(l, 'scade', 'goes down') : crit(l, 'rămâne la fel', 'stays the same'); };
  frames.push({
    kind: 'cond', condv, dir: condv.cmp(J.py[yj]),
    grid: gridXYZ(J, { cols: sumCol, cell: (i, j) => (i === xi ? { v: J.pxy[i][j], cls: j === yj ? 'cur hl' : 'hl', cap: j === yj } : { v: J.pxy[i][j], cls: 'dim' }) }),
    info: [
      { kind: 'cond', label: lab(`P(${names.y}=${ys[yj]} | ${names.x}=${xs[xi]})`), value: disp(condv, J.mode) },
      { kind: 'py', label: lab(`P(${names.y}=${ys[yj]})`), value: disp(J.py[yj], J.mode) },
    ],
    caption: both((l) => crit(l,
      `P(${names.y}=${ys[yj]} | ${names.x}=${xs[xi]}) = P(${names.x}=${xs[xi]}, ${names.y}=${ys[yj]}) / P(${names.x}=${xs[xi]}) = ${f1(J, J.pxy[xi][yj], l)} / ${f1(J, J.px[xi], l)} = ${f1(J, condv, l)}, față de P(${names.y}=${ys[yj]}) = ${f1(J, J.py[yj], l)}: probabilitatea ${dirWord(l)} când aflăm ${names.x}=${xs[xi]}.`,
      `P(${names.y}=${ys[yj]} | ${names.x}=${xs[xi]}) = P(${names.x}=${xs[xi]}, ${names.y}=${ys[yj]}) / P(${names.x}=${xs[xi]}) = ${f1(J, J.pxy[xi][yj], l)} / ${f1(J, J.px[xi], l)} = ${f1(J, condv, l)}, against P(${names.y}=${ys[yj]}) = ${f1(J, J.py[yj], l)}: the probability ${dirWord(l)} when we learn ${names.x}=${xs[xi]}.`)),
  });

  // slices
  const sliceHolds = (i, j, k) => P[i][j][k].div(J.pz[k]).equals(cx(i, k).mul(cy(j, k)));
  const ciAll = sliceZs.every((k) => order.every(([i, j]) => sliceHolds(i, j, k)));
  const coversAll = zs.every((_, k) => !nz(k) || sliceZs.includes(k));
  sliceZs.forEach((k, n) => {
    const col = [{ k, label: zAll[k].label }];
    const cv = (i, j) => P[i][j][k].div(J.pz[k]);
    const zname = `${names.z}=${zs[k]}`;
    frames.push({
      kind: 'slice', k,
      grid: gridXYZ(J, { cols: col, cell: (i, j) => ({ v: cv(i, j), cls: 'cond', cap: true }) }),
      info: [
        ...xs.map((_, i) => ({ kind: 'smarg', label: lab(`P(${names.x}=${xs[i]} | ${zname})`), value: disp(cx(i, k), J.mode) })),
        ...ys.map((_, j) => ({ kind: 'smarg', label: lab(`P(${names.y}=${ys[j]} | ${zname})`), value: disp(cy(j, k), J.mode) })),
      ],
      caption: both((l) => crit(l,
        `Cu ${zname} fixat: coloana ${zname}, împărțită la P(${zname}) = ${f1(J, J.pz[k], l)}, dă P(${names.x}, ${names.y} | ${zname}): ${order.map(([i, j]) => f1(J, cv(i, j), l)).join('; ')}. Marginalele feliei: ${[...xs.map((_, i) => `P(${names.x}=${xs[i]} | ${zname}) = ${f1(J, cx(i, k), l)}`), ...ys.map((_, j) => `P(${names.y}=${ys[j]} | ${zname}) = ${f1(J, cy(j, k), l)}`)].join(', ')}.`,
        `With ${zname} fixed: the ${zname} column, divided by P(${zname}) = ${f1(J, J.pz[k], l)}, gives P(${names.x}, ${names.y} | ${zname}): ${order.map(([i, j]) => f1(J, cv(i, j), l)).join('; ')}. Slice marginals: ${[...xs.map((_, i) => `P(${names.x}=${xs[i]} | ${zname}) = ${f1(J, cx(i, k), l)}`), ...ys.map((_, j) => `P(${names.y}=${ys[j]} | ${zname}) = ${f1(J, cy(j, k), l)}`)].join(', ')}.`)),
    });
    const passN = order.filter(([i, j]) => sliceHolds(i, j, k)).length;
    const lastSlice = n === sliceZs.length - 1;
    frames.push({
      kind: 'slicecheck', k, pass: passN === order.length, last: lastSlice,
      grid: gridXYZ(J, {
        cols: col,
        cell: (i, j) => ({ v: cv(i, j), cls: sliceHolds(i, j, k) ? 'ok' : 'bad', annot: { text: both((l) => `${f1(J, cx(i, k), l)}·${f1(J, cy(j, k), l)} = ${f1(J, cx(i, k).mul(cy(j, k)), l)}`), ok: sliceHolds(i, j, k), cap: true } }),
      }),
      info: [],
      caption: both((l) => {
        const prods = order.map(([i, j]) => `${f1(J, cx(i, k), l)}·${f1(J, cy(j, k), l)} = ${f1(J, cx(i, k).mul(cy(j, k)), l)}`).join('; ');
        let s = crit(l,
          `Produsele marginalelor feliei ${zname}: ${prods}. ${passN === order.length ? `Toate cele ${order.length} celule verifică` : `${passN} din ${order.length} celule verifică`}.`,
          `Products of the slice marginals for ${zname}: ${prods}. ${passN === order.length ? `All ${order.length} cells hold` : `${passN} of ${order.length} cells hold`}.`);
        if (lastSlice && coversAll) {
          const concl = depTotal && ciAll ? crit(l, ` Deci ${names.x} și ${names.y} sunt dependente, dar independente condiționat de ${names.z}.`, ` So ${names.x} and ${names.y} are dependent, but independent given ${names.z}.`)
            : !depTotal && ciAll ? crit(l, ` Deci ${names.x} și ${names.y} sunt independente și independente condiționat de ${names.z}.`, ` So ${names.x} and ${names.y} are independent and independent given ${names.z}.`)
              : depTotal ? crit(l, ` Deci ${names.x} și ${names.y} nu sunt independente, nici condiționat de ${names.z}.`, ` So ${names.x} and ${names.y} are neither independent nor independent given ${names.z}.`)
                : crit(l, ` Deci ${names.x} și ${names.y} sunt independente, dar nu independente condiționat de ${names.z}.`, ` So ${names.x} and ${names.y} are independent, but not independent given ${names.z}.`);
          s += concl;
        }
        return s;
      }),
    });
  });
  return { frames, depTotal, ciAll, coversAll, allDecomp };
}

// The model the widget uses: the table, and its frames (or the explorer).
export function jointTable(props) {
  const J = joint(props);
  if (props.explore) {
    if (J.hasZ) throw new RangeError('joint: explore mode has no Z');
    return { J, explore: true, frames: [{ kind: 'explore' }], count: 1 };
  }
  const r = J.hasZ ? jointZSteps(J, props.conditionOn) : jointSteps(J);
  return { J, explore: false, ...r, count: r.frames.length };
}
