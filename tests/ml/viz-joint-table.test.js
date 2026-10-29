import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { marks, text } from './w2-viz-helpers.js';
import { validateViz } from '../../src/components/lesson/viz/vizSpec.js';
import { jointTable, exploreView, joint } from '../../src/components/lesson/viz/logic/ml/joint-table.js';
import Fraction from '../../src/ml/calc/fraction.js';

let LANG = 'ro';
vi.mock('../../src/lesson/useLessonStore', async () => {
  const { createLessonStore } = await import('../../src/lesson/store.js');
  const m = new Map();
  const store = createLessonStore({ getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { m.set(k, String(v)); } });
  return { useLessonStore: () => store, getLessonStore: () => store };
});
vi.mock('../../src/contexts/AppContext', () => ({ useApp: () => ({ t: (en, ro) => (LANG === 'ro' ? ro : en), lang: LANG }) }));
vi.mock('motion/react', async (orig) => ({ ...(await orig()), useReducedMotion: () => true }));

const { default: JointTable, JointStage, JointGrid } = await import('../../src/components/lesson/viz/widgets/ml/JointTable.jsx');

// L5 config A (opening question), config B (worked example, rows are Y), L6 config C (noisy witnesses).
const A = { x: 'X', y: 'Y', explore: true, format: 'fraction', table: { columns: ['X', 'Y', 'P'], rows: [[0, 0, '1/4'], [0, 1, '1/4'], [1, 0, '1/4'], [1, 1, 0], [2, 0, 0], [2, 1, '1/4']] } };
const B = { x: 'X', y: 'Y', rowsAre: 'y', table: { columns: ['X', 'Y', 'P'], rows: [[0, 0, 0.1], [1, 0, 0.2], [0, 1, 0.3], [1, 1, 0.4]] } };
const C = {
  x: 'X', y: 'Y', z: 'Z', conditionOn: [0, 1],
  table: { columns: ['X', 'Y', 'Z', 'P'], rows: [[0, 0, 0, 0.32], [0, 1, 0, 0.08], [1, 0, 0, 0.08], [1, 1, 0, 0.02], [0, 0, 1, 0.02], [0, 1, 1, 0.08], [1, 0, 1, 0.08], [1, 1, 1, 0.32]] },
};
const fr = (s) => new Fraction(s);

describe('joint-table logic, config B (Cn-s2:6, L5.s02-s05)', () => {
  const M = jointTable(B);
  const F = Object.fromEntries(M.frames.map((f, i) => [`${f.kind}${i}`, f]));
  it('marginals 0,4 0,6 0,3 0,7', () => {
    expect(M.J.px.map(String)).toEqual(['2/5', '3/5']);
    expect(M.J.py.map(String)).toEqual(['3/10', '7/10']);
  });
  it('frames: setup, 4 marginals, conditional, 4 checks, expectation, grouping', () => {
    expect(M.frames.map((f) => f.kind)).toEqual(['setup', 'marginal', 'marginal', 'marginal', 'marginal', 'conditional', 'check', 'check', 'check', 'check', 'expect', 'sum']);
    expect(M.count).toBe(12);
  });
  it('P(X=0|Y=1) = 3/7', () => {
    expect(M.frames[5].caption.ro).toContain('P(X=0 | Y=1) = 0,3 / 0,7 = 3/7');
    expect(M.frames[5].caption.en).toContain('= 0.3 / 0.7 = 3/7');
  });
  it('the four products 0,12; 0,18; 0,28; 0,42 against 0,1; 0,2; 0,3; 0,4, none verifies', () => {
    const cs = M.frames.filter((f) => f.kind === 'check');
    expect(cs.map((f) => f.caption.ro.match(/= ([\d,]+), iar în tabel este ([\d,]+)/).slice(1))).toEqual([['0,12', '0,1'], ['0,18', '0,2'], ['0,28', '0,3'], ['0,42', '0,4']]);
    expect(M.independent).toBe(false);
    expect(cs.at(-1).caption.ro).toContain('4 din 4 celule nu verifică: X și Y nu sunt independente');
  });
  it('E[XY] = 0,4, E[X]E[Y] = 0,42, Cov = -0,02', () => {
    const e = M.frames.find((f) => f.kind === 'expect');
    expect(e.exy.equals(fr('2/5'))).toBe(true);
    expect(e.cov.equals(fr('-1/50'))).toBe(true);
    expect(e.caption.ro).toContain('E[XY] = 1·1·0,4 = 0,4');
    expect(e.caption.ro).toContain('0,6·0,7 = 0,42');
    expect(e.caption.ro).toContain('0,4 − 0,42 = −0,02');
  });
  it('X+Y: 0 with 0,1; 1 with 0,5; 2 with 0,4; Var(X+Y) = 0,41 both ways', () => {
    const g = M.frames.find((f) => f.kind === 'sum');
    expect(g.groups.map((x) => [x.s.toString(), x.p.toString()])).toEqual([['0', '1/10'], ['1', '1/2'], ['2', '2/5']]);
    expect(g.es.equals(fr('13/10'))).toBe(true);
    expect(g.es2.equals(fr('21/10'))).toBe(true);
    expect(g.vs.equals(fr('41/100'))).toBe(true);
    expect(g.vformula.equals(g.vs)).toBe(true);
    expect(g.vx.equals(fr('6/25'))).toBe(true);
    expect(g.vy.equals(fr('21/100'))).toBe(true);
    expect(g.caption.ro).toContain('2,1 − 1,69 = 0,41');
    expect(g.caption.ro).toContain('0,24 + 0,21 + 2·(−0,02) = 0,41');
  });
  it('a table that is independent says so', () => {
    const I = jointTable({ x: 'X', y: 'Y', table: { columns: ['X', 'Y', 'P'], rows: [[0, 0, '1/4'], [0, 1, '1/4'], [1, 0, '1/4'], [1, 1, '1/4']] } });
    expect(I.independent).toBe(true);
    expect(I.frames.filter((f) => f.kind === 'check').at(-1).caption.ro).toContain('Toate cele 4 celule verifică: X și Y sunt independente');
  });
  it('non-numeric values skip the expectation and grouping frames', () => {
    const S = jointTable({ x: 'A', y: 'B', table: { columns: ['A', 'B', 'P'], rows: [['u', 'p', '1/2'], ['u', 'q', '1/4'], ['v', 'p', 0], ['v', 'q', '1/4']] } });
    expect(S.frames.map((f) => f.kind)).not.toContain('expect');
  });
});

// Outline L5/L6 visual specs: the learner predicts each marginal, the conditional, the verdict per cell, E[XY], Var(X+Y);
// in L6 the first cell, the next one, the marginal dependence, P(Y=1|X=1), each slice and its verdict. Each frame's caption
// ends with the question the next frame answers, and that question gives away no value.
describe('joint-table: a question before every reveal', () => {
  const noValue = (q) => expect(q, q).not.toMatch(/\d[,.]\d|\d\/\d/);
  it('config B: every frame but the last ends with the next question, and the question holds no value', () => {
    const M = jointTable(B);
    const F = M.frames;
    F.slice(0, -1).forEach((f, i) => {
      expect(f.ask, `frame ${i}`).toBeTruthy();
      for (const l of ['ro', 'en']) { expect(f.caption[l].endsWith(f.ask[l]), `frame ${i} ${l}`).toBe(true); noValue(f.ask[l]); expect(f.ask[l]).toMatch(/\?$/); }
    });
    expect(F.at(-1).ask).toBeFalsy();
    expect(F[0].caption.ro).toBe('Distribuția comună a lui (X, Y). Marginalele nu sunt încă scrise. Cât este P(X=0)?');
    expect(F[1].ask.ro).toBe('Cât este P(X=1)?');
    expect(F[2].ask.ro).toBe('Cât este P(Y=0)?');
    expect(F[3].ask.ro).toBe('Cât este P(Y=1)?');
    expect(F[4].ask.ro).toBe('Cât este P(X=0 | Y=1)?');
    expect(F[5].ask.ro).toBe('Sunt X și Y independente? Verifică celulă cu celulă: în celula (X=0, Y=0), este P(X=0)·P(Y=0) egal cu valoarea din tabel?');
    expect(F[6].ask.ro).toBe('Celula (X=1, Y=0): este P(X=1)·P(Y=0) egal cu valoarea din tabel?');
    expect(F[9].ask.ro).toBe('Cât este E[XY]? Ce semn are Cov(X, Y) = E[XY] − E[X]·E[Y]?');
    expect(F[10].ask.ro).toBe('Grupează celulele după valoarea lui X+Y: cât este Var(X+Y)?');
    expect(F[5].caption.ro).toContain('Rândul Y=1, împărțit la 0,7, are suma 1');
  });
  it('config B: the frame that asks for a marginal does not draw it yet', () => {
    LANG = 'ro';
    const M = jointTable(B);
    M.frames.slice(0, 4).forEach((f, i) => {
      const ms = marks(renderToStaticMarkup(React.createElement(JointStage, { model: M, frame: f })));
      expect(ms.filter((m) => m.kind === 'marg'), `frame ${i}`).toHaveLength(i);
    });
  });
  it('config C: the same, with the L6 questions', () => {
    const M = jointTable(C);
    const F = M.frames;
    F.slice(0, -1).forEach((f, i) => {
      expect(f.ask, `frame ${i}`).toBeTruthy();
      for (const l of ['ro', 'en']) { expect(f.caption[l].endsWith(f.ask[l])).toBe(true); noValue(f.ask[l]); expect(f.ask[l]).toMatch(/\?$/); }
    });
    expect(F[0].caption.ro).toBe('Tabelul comun al lui (X, Y, Z) are 8 celule, încă goale. Cât este P(X=0, Y=0, Z=0)?');
    expect(F[1].ask.ro).toBe('Cât este P(X=0, Y=1, Z=0)?');
    expect(F[2].ask.ro).toBe('Ascunde Z: adună coloanele. Cât este P(X=0, Y=0)? Sunt X și Y independente?');
    expect(F[3].ask.ro).toBe('Cât este P(Y=1 | X=1)? Față de P(Y=1), crește, scade sau rămâne la fel?');
    expect(F[4].ask.ro).toBe('Fixează Z=0: împarte coloana Z=0 la P(Z=0). Care este P(X, Y | Z=0)?');
    expect(F[5].ask.ro).toBe('Compară fiecare celulă cu produsul marginalelor feliei: sunt X și Y independente în felia Z=0?');
    expect(F[6].ask.ro).toBe('Fixează Z=1: împarte coloana Z=1 la P(Z=1). Care este P(X, Y | Z=1)?');
    expect(F[7].ask.ro).toBe('Compară fiecare celulă cu produsul marginalelor feliei: sunt X și Y independente în felia Z=1?');
  });
});

// Romanian writes the decimal comma, so a list of such numbers joined with ", " is ambiguous ("0,1, 0,4"): it uses "; ".
const AMBIGUOUS = /\d,\d+, (?=[−\d(P])/;
describe('joint-table: Romanian lists of decimals are unambiguous', () => {
  it('no caption joins decimal-comma numbers with ", " (configs A, B, C)', () => {
    const caps = [B, C].flatMap((p) => jointTable(p).frames.map((f) => f.caption.ro));
    const J = jointTable({ ...A, format: 'decimal' }).J;
    caps.push(...[[], [[0, 0]], [[1, 0]]].map((p) => exploreView(J, p).caption.ro));
    for (const c of caps) expect(c, c).not.toMatch(AMBIGUOUS);
    expect(exploreView(J, []).caption.ro).toContain('P(X) = (0,5; 0,25; 0,25)');
  });
});

describe('joint-table logic, explorer (L5.s01)', () => {
  const M = jointTable(A);
  it('marginals (1/2, 1/4, 1/4) and (1/2, 1/2); cell (0,0) matches, cell (1,0) does not', () => {
    expect(M.J.px.map(String)).toEqual(['1/2', '1/4', '1/4']);
    expect(M.J.py.map(String)).toEqual(['1/2', '1/2']);
    const v0 = exploreView(M.J, []);
    expect(v0.caption.ro).toContain('P(X) = (1/2, 1/4, 1/4) și P(Y) = (1/2, 1/2)');
    const v1 = exploreView(M.J, [[0, 0]]);
    expect(v1.caption.ro).toContain('P(X=0, Y=0) = 1/4, iar P(X=0)·P(Y=0) = 1/2·1/2 = 1/4. Se potrivesc.');
    const v2 = exploreView(M.J, [[0, 0], [1, 0]]);
    expect(v2.caption.ro).toContain('P(X=1)·P(Y=0) = 1/4·1/2 = 1/8. Nu sunt egale.');
    expect(v2.caption.ro).toContain('Ai verificat 2 din 6 celule');
    expect(v2.caption.ro).toContain('nu sunt independente');
    expect(v1.caption.ro).not.toContain('nu sunt independente');
  });
});

describe('joint-table logic, config C (L6.s02-s04)', () => {
  const M = jointTable(C);
  const by = (k) => M.frames.filter((f) => f.kind === k);
  it('frames: setup, first, all, hide, cond, then slice and check for Z=0 and Z=1', () => {
    expect(M.frames.map((f) => f.kind)).toEqual(['setup', 'first', 'all', 'hide', 'cond', 'slice', 'slicecheck', 'slice', 'slicecheck']);
  });
  it('first cell 0,5·0,8·0,8 = 0,32; second 0,5·0,8·0,2 = 0,08', () => {
    expect(M.frames[1].caption.ro).toContain('0,5·0,8·0,8 = 0,32');
    expect(M.frames[2].caption.ro).toContain('0,5·0,8·0,2 = 0,08');
    expect(M.allDecomp).toBe(true);
  });
  it('hide Z: 0,34 / 0,16 / 0,16 / 0,34; 0,25 against 0,34; dependent', () => {
    const h = by('hide')[0];
    expect(h.grid.rows.map((r) => r.cells[0].text.ro)).toEqual(['0,34', '0,16', '0,16', '0,34']);
    expect(h.caption.ro).toContain('0,32 + 0,02 = 0,34');
    expect(h.caption.ro).toContain('0,5·0,5 = 0,25');
    expect(h.depTotal).toBe(true);
  });
  it('P(Y=1|X=1) = 0,68 and it goes up from 0,5', () => {
    const c = by('cond')[0];
    expect(c.condv.equals(fr('17/25'))).toBe(true);
    expect(c.caption.ro).toContain('= 0,34 / 0,5 = 0,68');
    expect(c.caption.ro).toContain('probabilitatea crește');
    expect(c.dir).toBe(1);
  });
  it('slice Z=0 is 0,64 0,16 0,16 0,04, slice Z=1 is 0,04 0,16 0,16 0,64, all cells verify, conclusion', () => {
    const [s0, s1] = by('slice');
    expect(s0.grid.rows.map((r) => r.cells[0].text.ro)).toEqual(['0,64', '0,16', '0,16', '0,04']);
    expect(s1.grid.rows.map((r) => r.cells[0].text.ro)).toEqual(['0,04', '0,16', '0,16', '0,64']);
    const [c0, c1] = by('slicecheck');
    expect(c0.pass && c1.pass).toBe(true);
    expect(c0.caption.ro).toContain('Toate cele 4 celule verifică');
    expect(c0.caption.ro).not.toContain('Deci');
    expect(c1.caption.ro).toContain('Deci X și Y sunt dependente, dar independente condiționat de Z.');
    expect(c1.caption.en).toContain('So X and Y are dependent, but independent given Z.');
    expect(M.ciAll).toBe(true);
    expect(M.depTotal).toBe(true);
  });
  // L6.s02 asks for P(X=1, Y=1, Z=1); the widget asks for the cell the lesson names (props.first), the first one otherwise.
  it('props.first picks the cell the first question asks for, and the next example follows it', () => {
    const F = jointTable({ ...C, first: [1, 1, 1] }).frames;
    expect(F[0].caption.ro).toBe('Tabelul comun al lui (X, Y, Z) are 8 celule, încă goale. Cât este P(X=1, Y=1, Z=1)?');
    expect(F[1].caption.ro).toBe('P(X=1, Y=1, Z=1) = P(Z=1)·P(X=1 | Z=1)·P(Y=1 | Z=1) = 0,5·0,8·0,8 = 0,32. Cât este P(X=1, Y=0, Z=1)?');
    expect(F[1].caption.en).toContain('P(X=1, Y=1, Z=1) = P(Z=1)·P(X=1 | Z=1)·P(Y=1 | Z=1) = 0.5·0.8·0.8 = 0.32.');
    expect(F[2].caption.ro).toContain('de exemplu P(X=1, Y=0, Z=1) = 0,5·0,8·0,2 = 0,08.');
    LANG = 'ro';
    const ms = marks(renderToStaticMarkup(React.createElement(JointStage, { model: jointTable({ ...C, first: [1, 1, 1] }), frame: F[1] })));
    expect(ms.filter((m) => m.kind === 'cell' && m.value).map((m) => [m.x, m.y, m.z, m.value])).toEqual([['1', '1', '1', '0,32']]);
    // without the prop: the first cell, as before
    expect(jointTable(C).frames[0].caption.ro).toContain('Cât este P(X=0, Y=0, Z=0)?');
  });
  it('a slice column is headed by what it holds, P(X, Y | Z=z), not by Z=z as in the joint table', () => {
    const M = jointTable(C);
    const heads = M.frames.filter((f) => f.kind === 'slice' || f.kind === 'slicecheck').map((f) => f.grid.colHeads[0].label.ro);
    expect(heads).toEqual(['P(X, Y | Z=0)', 'P(X, Y | Z=0)', 'P(X, Y | Z=1)', 'P(X, Y | Z=1)']);
    expect(M.frames[2].grid.colHeads.map((h) => h.label.ro)).toEqual(['Z=0', 'Z=1']);
  });
  it('a conditionally dependent table fails its slice (0.16 shape: independent overall, not given Z)', () => {
    // X, Y independent overall (uniform) but X = Y inside each slice of Z = X xor Y... built so slice Z=0 fails at (0,0)
    const rows = [[0, 0, 0, '1/8'], [1, 1, 0, '1/8'], [0, 1, 1, '1/8'], [1, 0, 1, '1/8'], [0, 0, 1, 0], [1, 1, 1, 0], [0, 1, 0, 0], [1, 0, 0, 0]];
    const T = jointTable({ x: 'X', y: 'Y', z: 'Z', table: { columns: ['X', 'Y', 'Z', 'P'], rows: rows.map(([a, b, c, p]) => [a, b, c, p === 0 ? 0 : '1/4']) } });
    const sc = T.frames.find((f) => f.kind === 'slicecheck');
    expect(sc.pass).toBe(false);
    expect(T.ciAll).toBe(false);
    expect(T.frames.at(-1).caption.ro).toContain('nu independente condiționat de Z');
  });
});

describe('joint-table validateViz', () => {
  const block = (props) => ({ type: 'viz', id: 'ml-l05-viz', widget: 'ml-joint-table', predict: true, props });
  it('accepts the outline props', () => {
    expect(validateViz(block(B))).toEqual([]);
    expect(validateViz(block(C))).toEqual([]);
    expect(validateViz(block(A))).toEqual([]);
  });
  it('rejects a missing required prop, a missing column, a bad sum', () => {
    expect(validateViz(block({ x: 'X', y: 'Y' })).join(' ')).toMatch(/table/);
    expect(validateViz(block({ table: B.table, y: 'Y' })).join(' ')).toMatch(/props\.x/);
    expect(validateViz(block({ ...B, z: 'Z' })).join(' ')).toMatch(/columns/);
    expect(validateViz(block({ ...B, table: { columns: ['X', 'Y', 'P'], rows: [[0, 0, 0.5], [1, 1, 0.4]] } })).join(' ')).toMatch(/sum to 1/);
    expect(validateViz(block({ ...C, explore: true })).join(' ')).toMatch(/explore/);
    expect(validateViz(block({ ...C, first: [1, 1] })).join(' ')).toMatch(/first/);
    expect(validateViz(block({ ...C, first: [1, 2, 1] })).join(' ')).toMatch(/first/);
    expect(validateViz(block({ ...B, first: [1, 1, 1] })).join(' ')).toMatch(/first/);
    expect(validateViz(block({ ...C, first: [1, 1, 1] }))).toEqual([]);
  });
});

// Every element the caption must be able to name (data-cap) shows the same text the caption prints.
describe('joint-table: the caption matches the drawing (G4)', () => {
  for (const [name, props] of [['B', B], ['C', C]]) {
    for (const lang of ['ro', 'en']) {
      it(`${name} ${lang}: every cap mark is quoted in its caption`, () => {
        LANG = lang;
        const M = jointTable(props);
        M.frames.forEach((frame) => {
          const html = renderToStaticMarkup(React.createElement(JointStage, { model: M, frame }));
          const caps = marks(html).filter((m) => /data-cap="1"/.test(m.tag));
          const cap = frame.caption[lang];
          for (const m of caps) expect(cap, `${name}/${frame.kind}/${m.kind}`).toContain(m.value);
        });
        LANG = 'ro';
      });
    }
  }
  it('check frame: the current cell is marked and its annotation holds the product', () => {
    LANG = 'ro';
    const M = jointTable(B);
    const frame = M.frames.find((f) => f.kind === 'check');
    const ms = marks(renderToStaticMarkup(React.createElement(JointStage, { model: M, frame })));
    const cur = ms.filter((m) => m.kind === 'cell' && /mjt-cell [^"]*cur/.test(m.tag));
    expect(cur).toHaveLength(1);
    expect([cur[0].x, cur[0].y, cur[0].value]).toEqual(['0', '0', '0,1']);
    expect(ms.filter((m) => m.kind === 'annot').map((m) => m.value)).toEqual(['0,4·0,3 = 0,12']);
  });
  it('the setup frame draws the four cells and no margin; the marginal frame draws the new margin', () => {
    LANG = 'ro';
    const M = jointTable(B);
    const s = marks(renderToStaticMarkup(React.createElement(JointStage, { model: M, frame: M.frames[0] })));
    expect(s.filter((m) => m.kind === 'cell').map((m) => m.value)).toEqual(['0,1', '0,2', '0,3', '0,4']);
    expect(s.filter((m) => m.kind === 'marg')).toHaveLength(0);
    const m1 = marks(renderToStaticMarkup(React.createElement(JointStage, { model: M, frame: M.frames[1] })));
    expect(m1.filter((m) => m.kind === 'marg').map((m) => m.value)).toEqual(['0,4']);
  });
  it('every frame of C draws 4 rows; the slice frame has one column of 4 cells', () => {
    const M = jointTable(C);
    const s = marks(renderToStaticMarkup(React.createElement(JointStage, { model: M, frame: M.frames[5] })));
    expect(s.filter((m) => m.kind === 'cell').map((m) => [m.z, m.value])).toEqual([['0', '0,64'], ['0', '0,16'], ['0', '0,16'], ['0', '0,04']]);
    const f1 = marks(renderToStaticMarkup(React.createElement(JointStage, { model: M, frame: M.frames[2] })));
    expect(f1.filter((m) => m.kind === 'cell')).toHaveLength(8);
  });
  it('the explorer grid makes every cell a button and shows the annotation of picked cells', () => {
    const M = jointTable(A);
    const view = exploreView(M.J, [[1, 0]]);
    const html = renderToStaticMarkup(React.createElement(JointGrid, { grid: view.grid, J: M.J }));
    expect((html.match(/mjt-cellbtn/g) || []).length).toBe(6);
    expect(marks(html).filter((m) => m.kind === 'annot').map((m) => m.value)).toEqual(['1/4·1/2 = 1/8']);
  });
  it('no step text carries a hex colour or an opacity class', () => {
    const M = jointTable(C);
    const html = M.frames.map((frame) => renderToStaticMarkup(React.createElement(JointStage, { model: M, frame }))).join('');
    expect(html).not.toMatch(/#[0-9a-f]{3,8}\b|rgb\(|opacity-/i);
  });
});

describe('joint-table widget', () => {
  it('first frame (predict): only the "Arată-mi" button; the table scrolls inside its own box', () => {
    LANG = 'ro';
    const html = renderToStaticMarkup(React.createElement(JointTable, { props: B, predict: true }));
    expect(html).toContain('Arată-mi');
    expect(html).not.toContain('Mai departe');
    expect(html).toContain('viz-tablewrap');
    expect(text(html)).toContain('Cât este P(X=0)?');
  });
  it('explorer without picks shows the intro caption and no Next logic problem', () => {
    const html = renderToStaticMarkup(React.createElement(JointTable, { props: A, predict: true }));
    expect(text(html)).toContain('Atinge o celulă');
    expect(html).not.toContain('Arată-mi');
  });
  it('the joint of a non-numeric table keeps its labels', () => {
    const J = joint({ x: 'A', y: 'B', table: { columns: ['A', 'B', 'P'], rows: [['u', 'p', '1/2'], ['v', 'q', '1/2']] } });
    expect(J.numeric).toBe(false);
    expect(J.xs).toEqual(['u', 'v']);
  });
});
