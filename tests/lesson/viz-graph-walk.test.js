import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { graphModel, graphProblems, ALL_MODES } from '../../src/components/lesson/viz/logic/graph/index.js';
import { judge, answered, confirmKey, boxOf } from '../../src/components/lesson/viz/logic/graph/common.js';
import { validateViz, WIDGET_NAMES } from '../../src/components/lesson/viz/vizSpec.js';

vi.mock('../../src/lesson/useLessonStore', async () => {
  const { createLessonStore } = await import('../../src/lesson/store.js');
  const m = new Map();
  const store = createLessonStore({ getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { m.set(k, String(v)); } });
  return { useLessonStore: () => store, getLessonStore: () => store };
});
vi.mock('../../src/contexts/AppContext', () => ({ useApp: () => ({ t: (en, ro) => ro }) }));
vi.mock('motion/react', async (orig) => ({ ...(await orig()), useReducedMotion: () => true }));

const { default: GraphWalk, Stage, notation } = await import('../../src/components/lesson/viz/widgets/GraphWalk.jsx');

const read = (p) => JSON.parse(readFileSync(new URL(`../../src/content/${p}`, import.meta.url), 'utf8'));
const IA = read('ia/courses/crash-t2.json');
const AG = read('ag/courses/ag-crash-partial.json');
const AG2 = read('ag/courses/ag-crash-partial-2.json');
const step = (course, id) => course.steps.find((s) => s.id === id);
const table = (course, id, which = 0) => step(course, id).blocks.find((b) => b.type === 'steps').intro.filter((p) => p.table)[which].table;
const vizOf = (course, id) => step(course, id).blocks.find((b) => b.type === 'viz');
// The worked traces of the lesson as the course prints them (c4ro p.28-30 and p.34-38; every row recomputed in Python). The lesson
// screens now draw them with the widgets; these tables are what the widgets must reproduce.
const S14_ROWS = [["A", "B, C", "{r, g, b}"], ["B", "A, C, D", "{r, g, b}"], ["C", "A, B, D", "{r, g, b}"], ["D", "B, C, E", "{r, g, b}"], ["E", "D", "{r, g, b}"]];
const S16_TABLE = {"rows": [["start", "{r, g, b}", "{r, g, b}", "{r, g, b}", "{r, g, b}", "{r, g, b}"], ["1. A = r", "= r", "{g, b}", "{g, b}", "{r, g, b}", "{r, g, b}"], ["2. B = g", "= r", "= g", "{b}", "{r, b}", "{r, g, b}"], ["3. C = b", "= r", "= g", "= b", "{r}", "{r, g, b}"], ["4. D = r", "= r", "= g", "= b", "= r", "{g, b}"], ["5. E = g", "= r", "= g", "= b", "= r", "= g"]], "caption": "Domeniile după fiecare alegere și după FC"};
const S20_DOMAINS = [["A", "{1, 2, 3}"], ["B", "{1, 2, 3}"], ["C", "{1, 2, 3}"]];
const S20_CONSTRAINTS = [["A < B", "(A, B) și (B, A)"], ["B < C", "(B, C) și (C, B)"]];
const S22_TABLE = {"rows": [["(A, B)", "{1, 2, 3}", "3", "{1, 2}", "(B, A)"], ["(B, A)", "{1, 2, 3}", "1", "{2, 3}", "(A, B), (C, B)"], ["(B, C)", "{2, 3}", "3", "{2}", "(A, B), (C, B)"], ["(C, B)", "{1, 2, 3}", "1, 2", "{3}", "(B, C)"], ["(B, A)", "{2}", "—", "{2}", "—"], ["(A, B)", "{1, 2}", "2", "{1}", "(B, A)"], ["(C, B)", "{3}", "—", "{3}", "—"], ["(A, B)", "{1}", "—", "{1}", "—"], ["(C, B)", "{3}", "—", "{3}", "—"], ["(B, C)", "{2}", "—", "{2}", "—"], ["(B, A)", "{2}", "—", "{2}", "—"]], "caption": "Coada pornește cu (A, B), (B, A), (B, C), (C, B); arcele noi intră la sfârșit"};

// a cell of the lesson's s16 table as the widget draws a variable
const cellOf = (frame, id) => (id in frame.assigned ? `= ${frame.assigned[id]}` : `{${frame.domains[id].join(', ')}}`);
// the s19 map of the lesson's practice exercise: P-Q, P-R, Q-R, R-S, two colours
const S19 = (colours) => ({
  mode: 'csp-fc',
  nodes: [{ id: 'P', x: 60, y: 60 }, { id: 'Q', x: 160, y: 20 }, { id: 'R', x: 160, y: 100 }, { id: 'S', x: 260, y: 100 }],
  edges: [{ u: 'P', v: 'Q' }, { u: 'P', v: 'R' }, { u: 'Q', v: 'R' }, { u: 'R', v: 'S' }],
  domains: Object.fromEntries(['P', 'Q', 'R', 'S'].map((k) => [k, colours])),
});

// graphs of the lessons for the AG modes; the positions only place the drawing
const mk = (ids, es, extra = {}) => ({ nodes: [...ids].map((id, i) => ({ id, x: 40 + (i % 4) * 90, y: 40 + Math.floor(i / 4) * 80 })), edges: es.map(([u, v, w]) => (w === undefined ? { u, v } : { u, v, w })), ...extra });
// ag-cp-2c / 2d: the example of the lesson (edges with cost)
const COURSE_MST = mk('ABCDE', [['A', 'B', 4], ['A', 'C', 2], ['B', 'C', 5], ['B', 'D', 3], ['C', 'D', 7], ['C', 'E', 6], ['D', 'E', 1]]);
// ag-cp-2f: the exercise graph
const TWO_F = mk('PQRST', [['P', 'Q', 4], ['P', 'R', 6], ['Q', 'R', 1], ['Q', 'S', 7], ['R', 'S', 5], ['R', 'T', 9], ['S', 'T', 2], ['P', 'T', 8]]);
// the new m2 data of the plan: AB 7, AC 5, BC 3, BD 2, CD 4, CE 6, DE 8, DF 9, EF 1
const M2 = mk('ABCDEF', [['A', 'B', 7], ['A', 'C', 5], ['B', 'C', 3], ['B', 'D', 2], ['C', 'D', 4], ['C', 'E', 6], ['D', 'E', 8], ['D', 'F', 9], ['E', 'F', 1]]);
// ag-cp-8b: 12 13 23 34 35 45 56; ag-cp-8e: 12 23 34 41 45 56 67 78 68
const CUT_8B = mk('123456', [['1', '2'], ['1', '3'], ['2', '3'], ['3', '4'], ['3', '5'], ['4', '5'], ['5', '6']]);
const CUT_8E = mk('12345678', [['1', '2'], ['2', '3'], ['3', '4'], ['4', '1'], ['4', '5'], ['5', '6'], ['6', '7'], ['7', '8'], ['6', '8']]);
// ag-cp-10b: the wheel, hub h and rim r1..r5
const WHEEL = { nodes: [{ id: 'h', x: 120, y: 80 }, ...[1, 2, 3, 4, 5].map((i) => ({ id: `r${i}`, x: 120 + 70 * Math.cos((i * 2 * Math.PI) / 5), y: 80 + 60 * Math.sin((i * 2 * Math.PI) / 5) }))], edges: [...[1, 2, 3, 4, 5].map((i) => ({ u: 'h', v: `r${i}` })), ...[1, 2, 3, 4, 5].map((i) => ({ u: `r${i}`, v: `r${(i % 5) + 1}` }))] };
// Bellman-Ford-Moore: s to a 3, s to b 5, b to a -4, a to c 2 (one negative arc; Dijkstra would fix a at 3, the true cost is 1)
const BFM = { mode: 'bfm', directed: true, source: 's', ...mk('sabc', [['s', 'a', 3], ['s', 'b', 5], ['b', 'a', -4], ['a', 'c', 2]]) };
const clean = (v) => String(v).replace(/\$/g, '');
const names = (M) => M.sorted.map((e) => e.name);

describe('csp-fc reproduces the s16 table of the lesson', () => {
  const props = vizOf(IA, 'ia-ct2-s15').props;
  const M = graphModel(props);
  const T = S16_TABLE;
  const rowFrames = [0, 2, 4, 6, 8, 10]; // the start, then the frame after each FC
  it('the new screen draws the same map as s16: regions, neighbours and domains', () => {
    const rows = S14_ROWS;
    for (const [name, neigh, dom] of rows) {
      const n = props.edges.filter((e) => e.u === name || e.v === name).map((e) => (e.u === name ? e.v : e.u)).sort();
      expect(n.join(', ')).toBe(neigh);
      expect(`{${props.domains[name].join(', ')}}`).toBe(dom);
    }
  });
  it('every row of the table: each variable shows the same domain or value', () => {
    expect(M.frames).toHaveLength(11);
    T.rows.forEach((row, i) => {
      const f = M.frames[rowFrames[i]];
      expect(['A', 'B', 'C', 'D', 'E'].map((id) => cellOf(f, id)), `row ${row[0]}`).toEqual(row.slice(1));
    });
  });
  it('the order of the frames: choose, then (assign, choose|solved) five times, no going back', () => {
    expect(M.frames.map((f) => f.kind)).toEqual(['choose', ...Array(4).fill(['assign', 'choose']).flat(), 'assign', 'solved']);
    expect(M.solved).toBe(true);
    expect(M.backtracked).toBe(false);
  });
  it('MRV picks A, B, C, D, E and each value is the first legal one (r, g, b, r, g)', () => {
    const asg = M.frames.filter((f) => f.kind === 'assign');
    expect(asg.map((f) => `${f.X}=${f.v}`)).toEqual(['A=r', 'B=g', 'C=b', 'D=r', 'E=g']);
    expect(M.frames.filter((f) => f.kind === 'choose').map((f) => f.mrv)).toEqual(['A', 'B', 'C', 'D', 'E']);
  });
  it('the pick before each reveal has its answer among the options', () => {
    for (let k = 0; k < M.count; k++) {
      const spec = M.pickSpec(k, true);
      if (!spec) continue;
      for (const it of spec.items) {
        const ids = it.options.map((o) => o.id);
        for (const a of [].concat(it.answer)) expect(ids, `frame ${k}`).toContain(a);
      }
    }
    expect(M.pickSpec(M.count - 1, true)).toBeNull();
    expect(M.pickSpec(0, false)).toBeNull();
  });
  it('FC pick: the neighbours that lose the value (and a non-neighbour is offered as a trap)', () => {
    const k = 1; // A = r
    const it = M.pickSpec(k, true).items[0];
    expect(it.answer).toEqual(['B', 'C']);
    expect(it.options.map((o) => o.id)).toEqual(['B', 'C', 'D', 'E']);
    const k2 = 5; // C = b: D loses b; B is fixed
    expect(M.pickSpec(k2, true).items[0].answer).toEqual(['D']);
  });
  it('a tie is named as a tie: all five have 3 values at the start, B and C have 2 after A = r (the s16 "alfabetic")', () => {
    const it0 = M.pickSpec(0, true).items[0];
    expect(it0.fb('A', true).ro).toBe('A, B, C, D și E au câte 3 valori; la egalitate, prima alfabetic: A.');
    expect(it0.fb('C', false).ro).toBe('C e la egalitate cu A, iar A e prima în ordine alfabetică.');
    expect(M.pickSpec(2, true).items[0].fb('B', true).ro).toBe('B și C au câte 2 valori; la egalitate, prima alfabetic: B.');
    // after B = g only C is down to one value: no tie
    expect(M.pickSpec(4, true).items[0].fb('C', true).ro).toBe('C are cele mai puține valori: 1.');
    expect(M.caption(1).ro).toContain('(la egalitate, alfabetic)');
    expect(M.caption(3).ro).toContain('(la egalitate, alfabetic)');
    for (const k of [5, 7, 9]) expect(M.caption(k).ro, `frame ${k}`).not.toContain('egalitate');
    expect(M.frames.filter((f) => f.kind === 'assign').map((f) => f.tie)).toEqual([true, true, false, false, false]);
  });
  it('no question with nothing to choose: frame 8 has only E left, frame 9 (E = g) has no unassigned variable', () => {
    expect(M.frames[8].kind).toBe('choose');
    expect(M.pickSpec(8, true)).toBeNull();
    expect(M.frames[9].kind).toBe('assign');
    expect(M.pickSpec(9, true)).toBeNull();
    for (let k = 0; k < M.count; k++) {
      const spec = M.pickSpec(k, true);
      if (spec && spec.items[0].kind === 'single') expect(spec.items[0].options.length, `frame ${k}`).toBeGreaterThan(1);
      if (spec && spec.items[0].kind === 'multi') expect(spec.items[0].options.length, `frame ${k}`).toBeGreaterThan(0);
    }
  });
  it('an FC question whose answer is empty says that no neighbour still has the value', () => {
    // X - Y, Z alone: X = a leaves Y alone (Y has only b); Z still has a but is not a neighbour
    const F = graphModel({ mode: 'csp-fc', nodes: [{ id: 'X', x: 0, y: 0 }, { id: 'Y', x: 90, y: 0 }, { id: 'Z', x: 180, y: 0 }], edges: [{ u: 'X', v: 'Y' }], domains: { X: ['a'], Y: ['b'], Z: ['a', 'b'] } });
    const it = F.pickSpec(1, true).items[0];
    expect(it.options.map((o) => o.id)).toEqual(['Z']);
    expect(it.answer).toEqual([]);
    expect(it.fb([], true).ro).toBe('Corect: niciun vecin nefixat al lui X nu mai are a, deci nu iese nimic.');
    expect(it.fb(['Z'], false).ro).toContain('Z nu e vecin cu X');
  });
  it('captions name MRV, the value and what FC took out', () => {
    expect(M.caption(1).ro).toContain('MRV a luat A');
    expect(M.caption(1).ro).toContain('prima valoare legală, r');
    expect(M.caption(2).ro).toContain('FC a scos r din B și C');
    expect(M.caption(10).ro).toContain('A = r, B = g, C = b, D = r, E = g');
  });
});

describe('csp-fc on the s19 map with two colours (the dead end of the lesson)', () => {
  const M = graphModel(S19(['r', 'g']));
  it('P = r: S keeps 2 values, FC empties R after Q = g, both first choices fail, the map is inconsistent', () => {
    const f2 = M.frames[2]; // after P = r and FC
    expect(f2.domains.S).toHaveLength(2);
    expect(f2.domains.Q).toEqual(['g']);
    expect(f2.domains.R).toEqual(['g']);
    expect(f2.mrv).toBe('Q'); // Q and R tie, alphabetical
    const w = M.frames.filter((f) => f.kind === 'wipeout');
    expect(w.map((f) => `${f.X}=${f.v}->${f.empty}`)).toEqual(['Q=g->R', 'Q=r->R']);
    expect(M.solved).toBe(false);
    expect(M.frames.at(-1).kind).toBe('failed');
  });
  it('the frame order of the dead end: a wipeout, Q has nothing left, then P tries g', () => {
    expect(M.frames.map((f) => f.kind)).toEqual(['choose', 'assign', 'choose', 'assign', 'wipeout', 'back', 'back', 'assign', 'choose', 'assign', 'wipeout', 'back', 'back', 'failed']);
    const backs = M.frames.filter((f) => f.kind === 'back');
    expect(backs.map((f) => `${f.X}:${f.next}`)).toEqual(['Q:null', 'P:g', 'Q:null', 'P:null']);
  });
  it('the wipeout frame draws R red and asks what to do; the back frames ask for the next value or whether any is left', () => {
    const wipe = M.frames.findIndex((f) => f.kind === 'wipeout');
    expect(M.scene(wipe).nodes.find((n) => n.id === 'R').cls).toBe('empty');
    expect(M.caption(wipe).ro).toContain('Domeniu gol: te întorci');
    expect(M.pickSpec(wipe, true).items[0].answer).toBe('back');
    const [b1, b2] = [wipe + 1, wipe + 2];
    expect(M.pickSpec(b1, true).items[0].answer).toBe('no');
    expect(M.pickSpec(b2, true).items[0].answer).toBe('g');
  });
  it('a wrong next value: a tried one is named as tried, a later untried one is told to wait its turn', () => {
    const b2 = M.frames.findIndex((f) => f.kind === 'back' && f.next === 'g');
    expect(M.pickSpec(b2, true).items[0].fb('r', false).ro).toBe('r a fost deja încercată; următoarea neîncercată e g.');
    // K4 with three colours: A = r fails all the way down, so A asks for its next value among r, g, b
    const K4 = graphModel({ mode: 'csp-fc', nodes: ['A', 'B', 'C', 'D'].map((id, i) => ({ id, x: i * 80, y: (i % 2) * 60 })), edges: [['A', 'B'], ['A', 'C'], ['A', 'D'], ['B', 'C'], ['B', 'D'], ['C', 'D']].map(([u, v]) => ({ u, v })), domains: Object.fromEntries(['A', 'B', 'C', 'D'].map((id) => [id, ['r', 'g', 'b']])) });
    const kA = K4.frames.findIndex((f) => f.kind === 'back' && f.X === 'A' && f.next === 'g');
    const it = K4.pickSpec(kA, true).items[0];
    expect(it.fb('r', false).ro).toBe('r a fost deja încercată; următoarea neîncercată e g.');
    expect(it.fb('b', false).ro).toBe('b e încă neîncercată, dar g vine înaintea ei: ia valorile în ordine.');
    expect(K4.solved).toBe(false);
  });
  it('with three colours the same map has a solution and nothing goes empty', () => {
    const M3 = graphModel(S19(['r', 'g', 'b']));
    expect(M3.solved).toBe(true);
    expect(M3.frames[2].domains.S).toHaveLength(3);
    expect(M3.frames.some((f) => f.kind === 'wipeout')).toBe(false);
  });
  it('a pick is judged: single and set', () => {
    const it = M.pickSpec(1, true).items[0];
    expect(it.kind).toBe('multi');
    expect(judge(it, ['R', 'Q'])).toBe(true);
    expect(judge(it, ['Q'])).toBe(false);
    expect(judge(it, ['Q', 'R', 'S'])).toBe(false);
    const mrv = M.pickSpec(0, true).items[0];
    expect(judge(mrv, 'P')).toBe(true);
    expect(judge(mrv, 'Q')).toBe(false);
    expect(judge(mrv, undefined)).toBe(false);
  });
  it('feedback names the neighbour rule when a non-neighbour is tapped', () => {
    const it = M.pickSpec(1, true).items[0];
    expect(it.fb(['Q', 'R', 'S'], false).ro).toContain('S nu e vecin cu P');
    expect(it.fb(['Q'], false).ro).toContain('R e vecin cu P');
  });
});

describe('ac3 reproduces the 11 arcs of s22', () => {
  const props = vizOf(IA, 'ia-ct2-s22a').props;
  const M = graphModel(props);
  const T = S22_TABLE;
  const arcText = (a) => `(${a[0]}, ${a[1]})`;
  const setText = (v) => `{${v.join(', ')}}`;
  it('the new screen has the lesson data: A < B, B < C, domains {1, 2, 3}', () => {
    const d = S20_DOMAINS;
    const c = S20_CONSTRAINTS;
    expect(d.map((r) => `${r[0]}=${r[1]}`)).toEqual(['A={1, 2, 3}', 'B={1, 2, 3}', 'C={1, 2, 3}']);
    expect(props.constraint).toBe('lt');
    expect(props.edges.map((e) => `${e.u} < ${e.v}`)).toEqual(c.map((r) => r[0]));
  });
  it('the arcs taken, the values before, the values that leave, what remains and what is added: all 11 rows', () => {
    expect(M.trace).toHaveLength(T.rows.length);
    expect(M.trace).toHaveLength(11);
    T.rows.forEach((row, i) => {
      const t = M.trace[i];
      expect([arcText(t.arc), setText(t.before), t.removed.length ? t.removed.join(', ') : '—', setText(t.after), t.added.length ? t.added.map(arcText).join(', ') : '—'], `row ${i + 1}`).toEqual(row);
    });
  });
  it('the queue starts with (A, B), (B, A), (B, C), (C, B), as the caption of the table says', () => {
    expect(M.frames[0].queue.map((q) => arcText(q.arc)).join(', ')).toBe('(A, B), (B, A), (B, C), (C, B)');
    expect(T.caption).toContain('(A, B), (B, A), (B, C), (C, B)');
  });
  it('the result: A = {1}, B = {2}, C = {3}, nothing empty', () => {
    expect(M.finalDomains).toEqual({ A: ['1'], B: ['2'], C: ['3'] });
    expect(M.inconsistent).toBe(false);
  });
  it('the queue rule: the checked neighbour is re-queued and duplicates stay (row 3 adds (A, B) while (A, B) is already waiting)', () => {
    const pop3 = M.frames.filter((f) => f.kind === 'pop')[2];
    expect(pop3.queue.map((q) => arcText(q.arc))).toEqual(['(B, C)', '(C, B)', '(B, A)', '(A, B)', '(C, B)']);
    const pop4 = M.frames.filter((f) => f.kind === 'pop')[3];
    expect(pop4.queue.map((q) => arcText(q.arc))).toEqual(['(C, B)', '(B, A)', '(A, B)', '(C, B)', '(A, B)', '(C, B)']);
  });
  it('frames: start, a pop per arc (11), a revised frame only where something left (5), the end', () => {
    expect(M.frames.map((f) => f.kind).filter((k) => k === 'pop')).toHaveLength(11);
    expect(M.frames.filter((f) => f.kind === 'revised')).toHaveLength(5);
    expect(M.count).toBe(18);
    expect(M.frames[0].kind).toBe('start');
    expect(M.frames.at(-1).kind).toBe('done');
  });
  it('frame 0 shows no queue chips and no arc count before the pick is revealed, then all 4 arcs', () => {
    expect(M.scene(0, { pending: true }).strips).toEqual([]);
    expect(M.caption(0, { pending: true }).ro).not.toContain('două arce');
    expect(M.scene(0, { pending: false }).strips[0].chips).toHaveLength(4);
    expect(M.scene(0).strips[0].chips).toHaveLength(4);
    expect(M.caption(0).ro).toContain('două arce');
  });
  it('picks: the start asks 4 arcs; a pop asks the leaving values; a revised frame asks the arcs added', () => {
    expect(M.pickSpec(0, true).items[0].answer).toBe('4');
    const pop1 = M.frames.findIndex((f) => f.kind === 'pop');
    expect(M.pickSpec(pop1, true).items[0].answer).toEqual(['3']);
    const rev = M.frames.findIndex((f) => f.kind === 'revised');
    const it = M.pickSpec(rev, true).items[0];
    expect(it.answer).toEqual(['B,A']);
    expect(it.options.map((o) => o.label)).toEqual(['(B, A)', '(A, B)']);
    expect(it.fb(['B,A'], true).ro).toBe('Corect: (X_k, A) pentru fiecare vecin X_k al lui A, inclusiv B (cel abia verificat), pentru că A s-a schimbat.');
    // row 2 revises B: neighbours A and C
    const rev2 = M.frames.findIndex((f, i) => f.kind === 'revised' && i > rev);
    expect(M.pickSpec(rev2, true).items[0].answer).toEqual(['A,B', 'C,B']);
    expect(M.pickSpec(M.count - 1, true)).toBeNull();
  });
  it('a pop where nothing leaves has the empty answer, and its feedback says nothing is added', () => {
    const k = M.frames.findIndex((f) => f.kind === 'pop' && f.leaving.length === 0);
    const it = M.pickSpec(k, true).items[0];
    expect(it.answer).toEqual([]);
    expect(judge(it, [])).toBe(true);
    expect(it.fb([], true).ro).toContain('nu iese nimic');
    expect(it.fb(['2'], false).ro).toBe('2 rămâne: 1 din A e compatibil cu el.');
  });
  it('the line under the queue says what the previous arc did', () => {
    const k = M.frames.findIndex((f, i) => f.kind === 'pop' && i > 0 && f.last && f.last.leaving.length === 0);
    expect(M.scene(k).log.ro).toContain('nu a ieșit nimic');
    const k2 = M.frames.findIndex((f) => f.kind === 'pop' && f.last && f.last.leaving.length > 0);
    expect(M.scene(k2).log.ro).toContain('am adăugat în coadă: (B, A)');
  });
  it('the arc is drawn as an arrow from X to Y', () => {
    const k = M.frames.findIndex((f) => f.kind === 'pop');
    expect(M.scene(k).arc).toEqual(['A', 'B']);
    expect(M.scene(k).nodes.find((n) => n.id === 'A').cls).toBe('focus');
    expect(M.scene(k).strips[0].chips[0].cls).toBe('cur');
  });
  it('an empty domain stops the run: A < B with {1} and {1}', () => {
    const W = graphModel({ mode: 'ac3', constraint: 'lt', nodes: [{ id: 'A', x: 0, y: 0 }, { id: 'B', x: 100, y: 0 }], edges: [{ u: 'A', v: 'B' }], domains: { A: ['1'], B: ['1'] } });
    expect(W.inconsistent).toBe(true);
    expect(W.frames.at(-1).kind).toBe('wipeout');
    expect(W.caption(W.count - 1).ro).toContain('inconsistentă');
    expect(W.pickSpec(W.count - 1, true)).toBeNull();
  });
  it('different and divides give the right supports', () => {
    const D = graphModel({ mode: 'ac3', constraint: 'different', nodes: [{ id: 'X', x: 0, y: 0 }, { id: 'Y', x: 100, y: 0 }], edges: [{ u: 'X', v: 'Y' }], domains: { X: ['1', '2'], Y: ['1'] } });
    expect(D.trace[0].removed).toEqual(['1']); // (X, Y): 1 has no different value in {1}
    // X divides Y: 5 divides neither 6 nor 8, so it leaves X; 6 and 8 each keep a divisor (2)
    const V = graphModel({ mode: 'ac3', constraint: 'divides', nodes: [{ id: 'X', x: 0, y: 0 }, { id: 'Y', x: 100, y: 0 }], edges: [{ u: 'X', v: 'Y' }], domains: { X: ['2', '3', '5'], Y: ['6', '8'] } });
    expect(V.trace[0].removed).toEqual(['5']);
    expect(V.trace[1].removed).toEqual([]);
    expect(V.finalDomains).toEqual({ X: ['2', '3'], Y: ['6', '8'] });
    // already consistent: both arcs are checked once and nothing leaves or is added
    const W = graphModel({ mode: 'ac3', constraint: 'divides', nodes: [{ id: 'X', x: 0, y: 0 }, { id: 'Y', x: 100, y: 0 }], edges: [{ u: 'X', v: 'Y' }], domains: { X: ['2', '3'], Y: ['6', '8'] } });
    expect(W.trace.map((t) => [t.removed, t.added])).toEqual([[[], []], [[], []]]);
  });
});

describe('dijkstra reproduces ag-cp-1c', () => {
  const props = vizOf(AG, 'ag-cp-1c2').props;
  const M = graphModel(props);
  const T = table(AG, 'ag-cp-1c', 0);
  it('the arcs of the new screen are the arcs the lesson draws on ag-cp-1c', () => {
    // ag-cp-1c draws its digraph as a figure: node letters and arc costs are its text labels
    const svg = step(AG, 'ag-cp-1c').blocks[0].intro.find((p) => p.figure).figure.svg;
    const labels = [...svg.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map((m) => m[1]);
    const costs = labels.filter((t) => /^\d+$/.test(t)).map(Number).sort((a, b) => a - b);
    const nodes = labels.filter((t) => /^[a-z]$/.test(t)).sort();
    expect(props.edges.map((e) => e.w).sort((a, b) => a - b)).toEqual(costs);
    expect([...new Set(props.edges.flatMap((e) => [e.u, e.v]))].sort()).toEqual(nodes);
  });
  it('the table, round by round: u and before of a, b, c, d and the check mark on the node fixed', () => {
    const rows = M.table.rowsUpTo(4);
    expect(rows).toHaveLength(T.rows.length);
    T.rows.forEach((row, i) => {
      const r = rows[i];
      expect([r.k, r.fix, r['u:a'], r['u:b'], r['u:c'], r['u:d']], `round ${i}`).toEqual(row);
    });
  });
  it('the final costs: u_a = 5, u_b = 2, u_c = 6, u_d = 8, along s, b, a, c, d', () => {
    expect(['a', 'b', 'c', 'd'].map((i) => M.final.u[i])).toEqual([5, 2, 6, 8]);
    expect(M.pathTo('d')).toEqual(['s', 'b', 'a', 'c', 'd']);
    expect(M.final.before).toMatchObject({ s: 0, a: 'b', b: 's', c: 'a', d: 'c' });
  });
  it('the order of fixing is b, a, c, d and the frames are the 5 rounds plus the result', () => {
    expect(M.rounds.map((r) => r.fixed)).toEqual(['s', 'b', 'a', 'c', 'd']);
    expect(M.frames.map((f) => f.kind)).toEqual(['round', 'round', 'round', 'round', 'round', 'done']);
  });
  it('relaxations of the lesson: round 1 improves a (7 to 5) and sets c to 10; round 3 improves d (9 to 8)', () => {
    const up = (k) => M.rounds[k].updates.map((u) => `${u.j}:${u.old === Infinity ? '∞' : u.old}->${u.now}${u.improved ? '' : ' same'}`);
    expect(up(1)).toEqual(['a:7->5', 'c:∞->10']);
    expect(up(2)).toEqual(['c:10->6', 'd:∞->9']);
    expect(up(3)).toEqual(['d:9->8']);
    expect(M.rounds[3].relaxed).toEqual([['c', 'd']]);
  });
  it('the pick before each round: the node with the smallest u outside S; none when only d is left; the last asks the path', () => {
    expect(M.pickSpec(0, true).items[0].answer).toBe('b');
    expect(M.pickSpec(0, true).items[0].options.map((o) => o.id)).toEqual(['a', 'b', 'c', 'd']);
    expect(M.pickSpec(1, true).items[0].answer).toBe('a');
    expect(M.pickSpec(2, true).items[0].answer).toBe('c');
    expect(M.pickSpec(3, true)).toBeNull(); // S = {s, b, a, c}: d is the only node left
    const last = M.pickSpec(4, true).items[0];
    // the path read back through before[] (cost 8) and the two next cheapest paths: s-b-a-d (2+3+4 = 9), s-a-c-d (7+1+2 = 10)
    expect(last.answer).toBe('s → b → a → c → d');
    expect(last.options.map((o) => o.id)).toEqual(['s → a → c → d', 's → b → a → c → d', 's → b → a → d']);
    expect(last.fb(last.answer, true).ro).toBe('Corect: before[d] = c, before[c] = a, before[a] = b, before[b] = s.');
    expect(last.fb('s → b → a → d', false).ro).toBe('Drumul acela costă 9. Citește-l înapoi din d: before[d] = c, before[c] = a, before[a] = b, before[b] = s.');
    expect(last.prompt.ro).not.toMatch(/costul minim/);
    expect(M.pickSpec(5, true)).toBeNull();
  });
  it('captions use the notation of agr3 p.9: S, u_i, before[i], a_si', () => {
    expect(M.caption(0).ro).toContain('S = {s}, u_s = 0');
    expect(M.caption(0).ro).toContain('u_a = 7, u_b = 2');
    expect(M.caption(0).ro).toContain('a_si');
    expect(M.caption(1).ro).toContain('j* = b');
    expect(M.caption(1).ro).toContain('u_a = min(7, 2 + 3) = 5, before[a] = b');
    expect(M.caption(3).ro).toContain('u_d = min(9, 6 + 2) = 8, before[d] = c');
    expect(M.caption(5).ro).toContain('s → b → a → c → d, 2 + 3 + 1 + 2 = 8');
  });
  it('the picture: weights on the arcs, arrowheads, u on the nodes, the arcs relaxed this round in green', () => {
    const sc = M.scene(3);
    expect(sc.edges.every((e) => e.arrow && typeof e.w === 'number')).toBe(true);
    expect(sc.edges.find((e) => e.u === 'c' && e.v === 'd').cls).toBe('ok');
    expect(sc.nodes.find((n) => n.id === 'd').label.items[0].t).toBe('8');
    expect(sc.nodes.find((n) => n.id === 'c').cls).toBe('focus');
    expect(M.scene(0).nodes.find((n) => n.id === 'c').label.items[0].t).toBe('∞');
    expect(M.scene(5).edges.filter((e) => e.cls === 'ok')).toHaveLength(4);
  });
  it('a tie goes to the first node alphabetically, and a node with no arc in stays at infinity', () => {
    const G = graphModel({ mode: 'dijkstra', directed: true, source: 's', nodes: [{ id: 's', x: 0, y: 0 }, { id: 'y', x: 50, y: 0 }, { id: 'x', x: 50, y: 50 }, { id: 'z', x: 100, y: 0 }], edges: [{ u: 's', v: 'y', w: 3 }, { u: 's', v: 'x', w: 3 }] });
    expect(G.rounds.map((r) => r.fixed)).toEqual(['s', 'x', 'y']);
    expect(G.final.u.z).toBe(Infinity);
    expect(G.frames.every((f) => f.kind === 'round')).toBe(true);
  });
  it('an undirected graph relaxes both ways', () => {
    const G = graphModel({ mode: 'dijkstra', directed: false, source: 'a', nodes: [{ id: 'a', x: 0, y: 0 }, { id: 'b', x: 50, y: 0 }, { id: 'c', x: 100, y: 0 }], edges: [{ u: 'b', v: 'a', w: 4 }, { u: 'c', v: 'b', w: 1 }] });
    expect(G.final.u).toEqual({ a: 0, b: 4, c: 5 });
  });
  it('an undirected graph lights its edges whichever way they are stored', () => {
    // s-b 1, a-b 2, a-t 5 is the path (1 + 2 + 5 = 8); b-s and t-a are stored the other way round
    const G = graphModel({ mode: 'dijkstra', directed: false, source: 's', target: 't', nodes: [{ id: 's', x: 0, y: 50 }, { id: 'a', x: 100, y: 0 }, { id: 'b', x: 100, y: 100 }, { id: 't', x: 200, y: 50 }], edges: [{ u: 'a', v: 's', w: 4 }, { u: 'b', v: 's', w: 1 }, { u: 'a', v: 'b', w: 2 }, { u: 't', v: 'a', w: 5 }, { u: 't', v: 'b', w: 8 }] });
    expect(G.pathTo('t')).toEqual(['s', 'b', 'a', 't']);
    expect(G.final.u.t).toBe(8);
    const cls = (k) => Object.fromEntries(G.scene(k).edges.map((e) => [`${e.u}${e.v}`, e.cls]));
    expect(cls(G.count - 1)).toEqual({ as: 'dim', bs: 'ok', ab: 'ok', ta: 'ok', tb: 'dim' });
    // round 1 fixes b and relaxes a (4 to 3) and t (to 9) along a-b and t-b
    expect(cls(1)).toMatchObject({ ab: 'ok', tb: 'ok' });
  });
  it('rejects a negative cost, an unknown source and an edge to a missing node', () => {
    const base = { mode: 'dijkstra', directed: true, source: 's', nodes: [{ id: 's', x: 0, y: 0 }, { id: 'a', x: 5, y: 5 }] };
    expect(() => graphModel({ ...base, edges: [{ u: 's', v: 'a', w: -1 }] })).toThrow(/cost/);
    expect(() => graphModel({ ...base, source: 'q', edges: [] })).toThrow(/source/);
    expect(() => graphModel({ ...base, edges: [{ u: 's', v: 'q', w: 1 }] })).toThrow(/unknown node/);
  });
});

describe('the picks gate the next frame', () => {
  it('a single pick is answered once picked, a set pick once confirmed', () => {
    const M = graphModel(vizOf(IA, 'ia-ct2-s15').props);
    const mrv = M.pickSpec(0, true);
    expect(answered(mrv, {})).toBe(false);
    expect(answered(mrv, { [mrv.items[0].key]: 'B' })).toBe(true); // a wrong pick still answers; the feedback says why
    const fc = M.pickSpec(1, true);
    const key = fc.items[0].key;
    expect(answered(fc, { [key]: ['B'] })).toBe(false);
    expect(answered(fc, { [key]: ['B'], [confirmKey(key)]: true })).toBe(true);
    expect(answered(null, {})).toBe(true);
  });
});

describe('the drawing', () => {
  const cases = [
    ['csp-fc', () => vizOf(IA, 'ia-ct2-s15').props],
    ['csp-fc dead end', () => S19(['r', 'g'])],
    ['ac3', () => vizOf(IA, 'ia-ct2-s22a').props],
    ['dijkstra', () => vizOf(AG, 'ag-cp-1c2').props],
    ['kruskal', () => ({ ...M2, mode: 'kruskal' })],
    ['prim', () => ({ ...COURSE_MST, mode: 'prim', source: 'A' })],
    ['bfm', () => BFM],
    ['cut', () => ({ ...CUT_8B, mode: 'cut' })],
    ['colour', () => ({ ...WHEEL, mode: 'colour' })],
  ];
  for (const [name, get] of cases) {
    it(`${name}: every frame renders, with and without predict, and draws every node`, () => {
      const props = get();
      const M = graphModel(props);
      for (let k = 0; k < M.count; k++) {
        for (const predict of [false, true]) {
          const spec = predict ? M.pickSpec(k, true) : null;
          const html = renderToStaticMarkup(React.createElement(Stage, { model: M, k, props, picks: {}, spec, onPick() {}, onToggle() {}, onConfirm() {} }));
          for (const n of props.nodes) expect(html, `${name} frame ${k}`).toContain(`data-node="${n.id}"`);
          expect(html).toContain('viewBox');
          expect(html).not.toContain('undefined');
          expect(html).not.toContain('NaN');
          if (predict && spec) expect(html).toContain('mlv-picks');
        }
      }
    });
  }
  it('the AC-3 queue strip draws the same arcs as the model, the first one marked', () => {
    const props = vizOf(IA, 'ia-ct2-s22a').props;
    const M = graphModel(props);
    const k = M.frames.findIndex((f) => f.kind === 'pop');
    const html = renderToStaticMarkup(React.createElement(Stage, { model: M, k, props, picks: {}, spec: null, onPick() {}, onToggle() {}, onConfirm() {} }));
    expect(html).toContain('data-queue="(A, B) (B, A) (B, C) (C, B)"');
    expect(html).toContain('gw-chip cur');
    expect(html).toContain('data-arc="A&gt;B"');
  });
  it('CSP labels are drawn from the domains: a struck value after FC, an empty domain in red', () => {
    const M = graphModel(S19(['r', 'g']));
    const props = S19(['r', 'g']);
    const draw = (k) => renderToStaticMarkup(React.createElement(Stage, { model: M, k, props, picks: {}, spec: null, onPick() {}, onToggle() {}, onConfirm() {} }));
    expect(draw(2)).toContain('data-label="r,g"'); // Q: r is still drawn, struck through, next to the g that stays
    expect(draw(2)).toContain('<tspan class="struck">r</tspan>');
    const w = M.frames.findIndex((f) => f.kind === 'wipeout');
    expect(draw(w)).toContain('data-state="empty"');
  });
  it('a pick after the answer shows its feedback; a wrong set pick marks the chips', () => {
    const M = graphModel(vizOf(IA, 'ia-ct2-s15').props);
    const props = vizOf(IA, 'ia-ct2-s15').props;
    const spec = M.pickSpec(1, true);
    const key = spec.items[0].key;
    const html = renderToStaticMarkup(React.createElement(Stage, { model: M, k: 1, props, picks: { [key]: ['B', 'E'], [confirmKey(key)]: true }, spec, onPick() {}, onToggle() {}, onConfirm() {} }));
    expect(html).toContain('gw-fb bad');
    expect(html).toContain('wrong');
    expect(html).toContain('right');
    expect(html).toContain('miss');
    expect(html).toContain('E nu e vecin cu A');
  });
  it('the widget: with predict the first frame shows the pick and Next is locked; without, Next is open', () => {
    const props = vizOf(IA, 'ia-ct2-s15').props;
    const on = renderToStaticMarkup(React.createElement(GraphWalk, { props, predict: true }));
    expect(on).toContain('data-widget="graph-walk"');
    expect(on).toContain('mlv-picks');
    expect(on).toMatch(/viz-btn-primary[^>]*disabled/);
    const off = renderToStaticMarkup(React.createElement(GraphWalk, { props, predict: false }));
    expect(off).not.toContain('mlv-picks');
    expect(off).not.toMatch(/viz-btn-primary[^>]*disabled/);
  });
  it('subscripts of the course notation are drawn as subscripts', () => {
    const html = renderToStaticMarkup(React.createElement('p', null, notation('u_a = min(7, 2 + 3), a_si, X_k, u_j*, fără u_ ')));
    expect(html).toContain('<i>u</i><sub>a</sub>');
    expect(html).toContain('<i>a</i><sub>si</sub>');
    expect(html).toContain('<i>X</i><sub>k</sub>');
    expect(html).toContain('<sub>j*</sub>');
    expect(renderToStaticMarkup(React.createElement('p', null, notation('V_s = {A}')))).toContain('<i>V</i><sub>s</sub>');
  });
  it('the AC-3 arc bends to the side away from the constraint text, for (B, A) as for (A, B)', () => {
    const props = vizOf(IA, 'ia-ct2-s22a').props;
    const M = graphModel(props);
    const y = props.nodes[0].y; // the chain is drawn on one line
    let seen = 0;
    for (let k = 0; k < M.count; k++) {
      if (!M.scene(k).arc) continue;
      const html = renderToStaticMarkup(React.createElement(Stage, { model: M, k, props, picks: {}, spec: null, onPick() {}, onToggle() {}, onConfirm() {} }));
      const q = html.match(/class="gw-arcpath" d="M[-\d.]+ ([-\d.]+) Q[-\d.]+ ([-\d.]+) [-\d.]+ ([-\d.]+)"/);
      expect(q, `frame ${k}`).not.toBeNull();
      const [sy, cy, ey] = q.slice(1).map(Number);
      expect(cy, `frame ${k} ${M.scene(k).arc.join('>')}`).toBeGreaterThan(y);
      expect(sy).toBeGreaterThan(y);
      expect(ey).toBeGreaterThan(y);
      // the constraint text sits over the line
      const t = [...html.matchAll(/class="gw-w [^"]*" x="[-\d.]+" y="([-\d.]+)"/g)].map((m) => Number(m[1]));
      for (const ty of t) expect(ty).toBeLessThan(y);
      seen++;
    }
    expect(seen).toBe(16); // 11 pops and 5 revisions draw the arc
  });
  it('the box leaves room under the lowest node for its labels', () => {
    const b = boxOf([{ id: 'a', x: 10, y: 10 }, { id: 'b', x: 110, y: 90 }]);
    expect(b.y + b.h).toBeGreaterThanOrEqual(90 + 19 + 34 + 4);
    const up = boxOf([{ id: 'a', x: 10, y: 40, lab: 'above' }, { id: 'b', x: 110, y: 90 }]);
    expect(up.y).toBeLessThanOrEqual(40 - 19 - 34); // an 'above' label has its room over the node
  });
  it('the css has no colour literals and never autoplays', () => {
    const css = readFileSync(new URL('../../src/components/lesson/viz/widgets/graph-walk.css', import.meta.url), 'utf8');
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/);
    // a struck value keeps no card-coloured halo, which would paint over the line-through
    expect(css).toMatch(/\.gw-lab \.struck \{[^}]*line-through[^}]*stroke: none/);
    // a removed edge is dashed, not a thick solid red
    expect(css).toMatch(/\.gw-edge\.cut \{[^}]*stroke-dasharray/);
    expect(css).toMatch(/@media \(max-width: 420px\)/);
    const jsx = readFileSync(new URL('../../src/components/lesson/viz/widgets/GraphWalk.jsx', import.meta.url), 'utf8');
    expect(jsx).not.toMatch(/setInterval|setTimeout|autoplay/i);
  });
});

describe('validateViz and the lesson JSON', () => {
  const block = (props) => ({ type: 'viz', id: 'x-1', widget: 'graph-walk', predict: true, props });
  it('is registered and accepts the three new screens', () => {
    expect(WIDGET_NAMES).toContain('graph-walk');
    expect(validateViz(vizOf(IA, 'ia-ct2-s15'))).toEqual([]);
    expect(validateViz(vizOf(IA, 'ia-ct2-s22a'))).toEqual([]);
    expect(validateViz(vizOf(AG, 'ag-cp-1c2'))).toEqual([]);
  });
  it('rejects an unknown mode, a mode whose data is incomplete, a bad node, a missing domain and a node that is not there', () => {
    const p = vizOf(IA, 'ia-ct2-s22a').props;
    expect(validateViz(block({ ...p, mode: 'nope' })).join(' ')).toMatch(/mode/);
    expect(ALL_MODES).toContain('colour');
    expect(validateViz(block({ ...p, mode: 'kruskal' })).join(' ')).toMatch(/needs a cost/);
    expect(validateViz(block({ ...p, nodes: [{ id: 'A' }] })).join(' ')).toMatch(/nodes/);
    expect(validateViz(block({ ...p, domains: { A: ['1'] } })).join(' ')).toMatch(/domain of B/);
    expect(validateViz(block({ ...p, edges: [{ u: 'A', v: 'Z' }] })).join(' ')).toMatch(/unknown node/);
    expect(validateViz(block({ ...p, constraint: 'sum' })).join(' ')).toMatch(/constraint/);
    expect(graphProblems({ mode: 'ac3', nodes: [], edges: [] })).not.toEqual([]);
    const d = vizOf(AG, 'ag-cp-1c2').props;
    expect(validateViz(block({ ...d, source: undefined })).join(' ')).toMatch(/source/);
  });
  it('the new screens sit right after the screens they extend, and the section counts follow the steps', () => {
    const idx = (c, id) => c.steps.findIndex((s) => s.id === id);
    expect(idx(IA, 'ia-ct2-s15')).toBe(idx(IA, 'ia-ct2-s14') + 1);
    expect(idx(IA, 'ia-ct2-s22a')).toBe(idx(IA, 'ia-ct2-s22') + 1);
    expect(idx(AG, 'ag-cp-1c2')).toBe(idx(AG, 'ag-cp-1c') + 1);
    const count = (file, id) => Number(readFileSync(new URL(`../../src/content/${file}/index.js`, import.meta.url), 'utf8').match(new RegExp(`id: "${id}"[^\\n]*?sectionCount: (\\d+)`))[1]);
    expect(count('ia', 'ia-crash-t2')).toBe(IA.steps.length);
    expect(count('ag', 'ag-crash-partial')).toBe(AG.steps.length);
  });
  it('the screens hold one widget that asks for picks and carry no teaching-step label', () => {
    for (const [c, id] of [[IA, 'ia-ct2-s15'], [IA, 'ia-ct2-s16'], [IA, 'ia-ct2-s22a'], [AG, 'ag-cp-1c2']]) {
      const s = step(c, id);
      const v = s.blocks.filter((b) => b.type === 'viz');
      expect(v).toHaveLength(1);
      expect(v[0].predict).toBe(true);
      expect(JSON.stringify([s.title, s.kicker])).not.toMatch(/Exemplu|Exersează|Rețeta|Exercițiu|Încearcă|Rândul tău|Simboluri/);
    }
  });
});

describe('kruskal reproduces the table of ag-cp-2c', () => {
  const M = graphModel({ ...COURSE_MST, mode: 'kruskal' });
  const T = table(AG, 'ag-cp-2c', 0);
  it('the sorted edges, the component after each and the verdict are the lesson table, row by row', () => {
    expect(M.count).toBe(1 + T.rows.length);
    T.rows.forEach((r, i) => {
      const sc = M.scene(i + 1).table.rows[i];
      expect(sc.edge, `row ${i}`).toBe(clean(r[0]));
      expect(String(sc.w)).toBe(String(r[1]));
      expect(sc.comp.replace(/ /g, '')).toBe(r[2] === '–' ? '–' : r[2]);
      expect(sc.ok).toBe(r[3]);
    });
  });
  it('the cost is 1 + 2 + 3 + 4 = 10 with n - 1 = 4 edges', () => {
    expect(M.cost).toBe(10);
    expect(M.accepted).toEqual(['DE', 'AC', 'BD', 'AB']);
    expect(M.complete).toBe(true);
  });
  it('ag-cp-2f: cost 12, the four rejected edges are PR, QS, PT, RT', () => {
    const F = graphModel({ ...TWO_F, mode: 'kruskal' });
    expect(F.cost).toBe(12);
    expect(F.rejected.sort()).toEqual(['PR', 'PT', 'QS', 'RT']);
  });
});

describe('kruskal on the new m2 data: 17, CD rejected first', () => {
  const M = graphModel({ ...M2, mode: 'kruskal' });
  it('sorted EF, BD, BC, CD, AC, CE, AB, DE, DF; CD is the first rejection, it closes B-C-D', () => {
    expect(names(M)).toEqual(['EF', 'BD', 'BC', 'CD', 'AC', 'CE', 'AB', 'DE', 'DF']);
    const first = M.frames.find((f) => f.kind === 'edge' && !f.ok);
    expect(first.edge.name).toBe('CD');
    expect(first.circuit.nodes).toEqual(['C', 'B', 'D']);
    expect(first.circuit.edges.sort()).toEqual(['BC', 'BD']);
  });
  it('cost 17, while the five cheapest edges give 15', () => {
    expect(M.cost).toBe(17);
    expect(M.accepted).toEqual(['EF', 'BD', 'BC', 'AC', 'CE']);
    expect(M.sorted.slice(0, 5).reduce((a, e) => a + e.w, 0)).toBe(15);
  });
  it('components after the accepted edges, from the course rule', () => {
    const comps = (k) => M.frames[k].comps.filter((c) => c.length > 1).map((c) => c.join(''));
    expect(comps(1)).toEqual(['EF']);
    expect(comps(3)).toEqual(['BCD', 'EF']);
    expect(comps(4)).toEqual(['BCD', 'EF']);
    expect(comps(5)).toEqual(['ABCD', 'EF']);
    expect(comps(6)).toEqual(['ABCDEF']);
  });
  it('the pick before each edge: accept or reject, with the components named in the feedback', () => {
    const spec = M.pickSpec(3, true).items[0];
    expect(spec.answer).toBe('rej');
    expect(spec.options.map((o) => o.id)).toEqual(['acc', 'rej']);
    expect(judge(spec, 'rej')).toBe(true);
    expect(judge(spec, 'acc')).toBe(false);
    expect(spec.fb('rej', true).ro).toMatch(/închide circuitul C–B–D–C/);
    expect(M.pickSpec(0, true).items[0].answer).toBe('acc');
    expect(M.pickSpec(M.count - 1, true)).toBeNull();
    expect(M.pickSpec(0, false)).toBeNull();
  });
  it('the picture: accepted green, the rejected edge red with its circuit lit, components coloured', () => {
    const sc = M.scene(4);
    const cls = Object.fromEntries(sc.edges.map((e) => [`${e.u}${e.v}`, e.cls]));
    expect(cls.CD).toBe('bad');
    expect(cls.BC).toBe('hl');
    expect(cls.BD).toBe('hl');
    expect(cls.EF).toBe('ok');
    expect(sc.nodes.find((n) => n.id === 'B').cls).toBe(sc.nodes.find((n) => n.id === 'D').cls);
    expect(sc.nodes.find((n) => n.id === 'A').cls).toBe('');
    expect(sc.table.rowCls[3]).toBe('gw-rej');
  });
  it('the edge the next question asks about is dashed in the picture', () => {
    const cls = (k) => Object.fromEntries(M.scene(k).edges.map((e) => [`${e.u}${e.v}`, e.cls]));
    expect(cls(0).EF).toBe('target');
    expect(cls(3).CD).toBe('target');
    expect(cls(4).AC).toBe('target');
    expect(Object.values(cls(M.count - 1))).not.toContain('target');
    for (let k = 0; k < M.count - 1; k++) expect(Object.values(cls(k)).filter((c) => c === 'target'), `frame ${k}`).toHaveLength(1);
  });
  it('rejects a directed graph and an edge without cost', () => {
    expect(() => graphModel({ ...M2, mode: 'kruskal', directed: true })).toThrow(/undirected/);
    expect(() => graphModel({ ...mk('AB', [['A', 'B']]), mode: 'kruskal' })).toThrow(/cost/);
  });
});

describe('prim reproduces the table of ag-cp-2d', () => {
  const M = graphModel({ ...COURSE_MST, mode: 'prim', source: 'A' });
  const T = table(AG, 'ag-cp-2d', 1);
  it('the rows of beta[j] and alpha[j] are the lesson table: added A, C, B, D, E', () => {
    expect(M.count).toBe(T.rows.length);
    T.rows.forEach((r, i) => {
      const sc = M.scene(i).table.rows[i];
      expect(sc.added, `row ${i}`).toBe(r[0]);
      ['B', 'C', 'D', 'E'].forEach((j, c) => expect(sc[`b:${j}`], `row ${i} ${j}`).toBe(r[c + 1]));
    });
    expect(M.scene(0).table.heads['b:B']).toBe('β[B]');
  });
  it('the tree is AC, AB, BD, DE with cost 10, as Kruskal', () => {
    expect(M.tree.map((e) => `${e.u}${e.v}`)).toEqual(['AC', 'AB', 'BD', 'DE']);
    expect(M.cost).toBe(10);
    expect(M.cost).toBe(graphModel({ ...COURSE_MST, mode: 'kruskal' }).cost);
  });
  it('the pick asks the node with the smallest beta and the feedback names beta', () => {
    const it0 = M.pickSpec(0, true).items[0];
    expect(it0.answer).toBe('C');
    expect(it0.options.map((o) => o.id)).toEqual(['B', 'C', 'D', 'E']);
    expect(it0.fb('B', false).ro).toMatch(/β\[B\] = 4, dar β\[C\] = 2 e mai mic/);
    expect(it0.fb('C', true).ro).toBe('β[C] = 2 e cel mai mic din afara lui V_s.');
    expect(M.pickSpec(M.count - 2, true)).toBeNull(); // only E is left outside V_s
    expect(M.pickSpec(M.count - 1, true)).toBeNull();
  });
  it('captions use V_s for the nodes of the tree, as agr5 p.10-11', () => {
    expect(M.caption(0).ro).toMatch(/^V_s = \{A\}, nodurile arborelui T\. β\[j\] e costul celei mai ieftine muchii de la j la un nod din V_s, α\[j\] acel nod/);
    expect(M.caption(1).ro).toContain('din afara lui V_s. V_s = {A, C}');
    for (let k = 0; k < M.count; k++) expect(M.caption(k).ro, `frame ${k}`).not.toMatch(/(^|[^_A-Za-z])T = \{|afara lui T\b/);
  });
  it('the picture: tree edges green, the cheapest edge into each outside node lit, beta on the node', () => {
    const sc = M.scene(1);
    const cls = Object.fromEntries(sc.edges.map((e) => [`${e.u}${e.v}`, e.cls]));
    expect(cls.AC).toBe('ok');
    expect(cls.AB).toBe('hl');
    expect(cls.CE).toBe('hl');
    expect(cls.CD).toBe('hl');
    expect(sc.nodes.find((n) => n.id === 'B').label.items[0].t).toBe('4');
    expect(sc.nodes.find((n) => n.id === 'A').label).toBeUndefined();
  });
  it('a disconnected graph is refused', () => {
    expect(() => graphModel({ ...mk('ABC', [['A', 'B', 1]]), mode: 'prim' })).toThrow(/not connected/);
  });
});

describe('bfm on the notation of agr3 p.18-22', () => {
  const M = graphModel(BFM);
  it('u^1 is a_si, then u^2 and u^3 follow u_i^{k+1} = min(u_i^k, min of u_j^k + a_ji) (checked in Python)', () => {
    expect(M.tables).toEqual([{ s: 0, a: 3, b: 5, c: Infinity }, { s: 0, a: 1, b: 5, c: 5 }, { s: 0, a: 1, b: 5, c: 3 }]);
    expect(M.count).toBe(3);
  });
  it('a negative arc is handled where Dijkstra refuses: u_a ends at 1, below the 3 of the first arc', () => {
    expect(() => graphModel({ ...BFM, mode: 'dijkstra' })).toThrow(/w >= 0/);
    expect(M.final.a).toBe(1);
    expect(M.final.a).toBeLessThan(M.tables[0].a);
  });
  it('the last table is u^(n-1): n - 2 rounds after the first', () => {
    expect(M.count).toBe(BFM.nodes.length - 1);
  });
  it('the pick asks one value of the next round: the first one that changes, options from the arcs into it', () => {
    const it0 = M.pickSpec(0, true).items[0];
    expect(it0.prompt.ro).toBe('Cât este u_a^2?');
    expect(it0.answer).toBe('1');
    expect(it0.options.map((o) => o.id)).toEqual(['1', '3']);
    expect(it0.fb('1', true).ro).toMatch(/u_b\^1 \+ a_ba = 5 \+ \(-4\) = 1/);
    expect(M.pickSpec(1, true).items[0].prompt.ro).toBe('Cât este u_c^3?');
    expect(M.pickSpec(1, true).items[0].answer).toBe('3');
    expect(M.pickSpec(2, true)).toBeNull();
  });
  it('captions use u_i^k and the table has one row per k', () => {
    expect(M.caption(0).ro).toMatch(/u_s\^1 = 0/);
    expect(M.caption(1).ro).toMatch(/u_a\^2 = min\(3, u_b\^1 \+ a_ba\)/);
    expect(M.scene(2).table.rows.map((r) => r.k)).toEqual([1, 2, 3]);
    expect(M.scene(2).table.rows[2]['u:c']).toBe('3');
  });
  it('arcs into a node that changed are lit, arrows are drawn', () => {
    const sc = M.scene(1);
    expect(sc.edges.every((e) => e.arrow)).toBe(true);
    expect(sc.edges.find((e) => e.u === 'b' && e.v === 'a').cls).toBe('ok');
  });
  it('refuses an undirected graph and a negative circuit reachable from s', () => {
    expect(() => graphModel({ ...BFM, directed: false })).toThrow(/directed/);
    expect(() => graphModel({ ...BFM, ...mk('sabc', [['s', 'a', 1], ['a', 'b', -2], ['b', 'a', 1], ['a', 'c', 1]]) })).toThrow(/negative circuit/);
  });
});

describe('cut reproduces ag-cp-8b and ag-cp-8e', () => {
  const M = graphModel({ ...CUT_8B, mode: 'cut' });
  const T = table(AG2, 'ag-cp-8b', 1);
  it('the node rows are the lesson table: components left and the cut-vertex mark', () => {
    const last = M.scene(6).table;
    expect(last.rows).toHaveLength(T.rows.length);
    T.rows.forEach((r, i) => {
      expect(last.rows[i].out).toBe(String(r[0]));
      expect(last.rows[i].n).toBe(r[1]);
      expect(last.rows[i].v).toBe(r[2]);
    });
  });
  it('cut vertices 3 and 5, the only bridge is 56', () => {
    expect(M.cutVertices).toEqual(['3', '5']);
    expect(M.bridges).toEqual(['5-6'.replace('-', '')]);
  });
  it('8e: three cut vertices (4, 5, 6) and two bridges (45, 56)', () => {
    const E = graphModel({ ...CUT_8E, mode: 'cut' });
    expect(E.cutVertices).toEqual(['4', '5', '6']);
    expect(E.bridges).toEqual(['45', '56']);
  });
  it('frames: the whole graph, one per node, one per edge', () => {
    expect(M.count).toBe(1 + 6 + 7);
    expect(M.frames[3].kind).toBe('node');
    expect(M.frames[7].kind).toBe('edge');
  });
  it('the pick is breaks or stays whole, judged on the components counted', () => {
    expect(M.pickSpec(2, true).items[0].answer).toBe('yes'); // node 3
    expect(M.pickSpec(0, true).items[0].answer).toBe('no'); // node 1
    expect(M.pickSpec(13, true)).toBeNull();
    expect(M.pickSpec(2, true).items[0].fb('no', false).ro).toMatch(/2 componente/);
  });
  it('the picture: the removed node is greyed, its edges dim, the pieces coloured apart', () => {
    const sc = M.scene(3);
    expect(sc.nodes.find((n) => n.id === '3').cls).toBe('gone');
    expect(sc.edges.filter((e) => e.cls === 'dim')).toHaveLength(4);
    expect(sc.nodes.find((n) => n.id === '1').cls).not.toBe(sc.nodes.find((n) => n.id === '4').cls);
    expect(sc.nodes.find((n) => n.id === '1').cls).toBe(sc.nodes.find((n) => n.id === '2').cls);
  });
  it('the removed edge is drawn as cut (dashed), not as emphasised; the next item asked is marked', () => {
    const e7 = M.scene(7);
    expect(e7.edges.find((e) => e.u === '1' && e.v === '2').cls).toBe('cut');
    expect(e7.edges.find((e) => e.u === '1' && e.v === '3').cls).toBe('target'); // the next question: edge 13
    expect(M.scene(0).nodes.find((n) => n.id === '1').cls).toBe('target');
    expect(M.scene(3).nodes.find((n) => n.id === '4').cls).toMatch(/\btarget$/);
    expect(M.scene(6).edges.find((e) => e.u === '1' && e.v === '2').cls).toBe('target'); // after the last node: the first edge
    expect(JSON.stringify(M.scene(M.count - 1))).not.toContain('target');
    expect(JSON.stringify(M.scene(7))).not.toContain('"bad"');
  });
  it('refuses a graph that is not connected', () => {
    expect(() => graphModel({ ...mk('ABC', [['A', 'B']]), mode: 'cut' })).toThrow(/connected/);
  });
});

describe('colour reproduces the wheel of ag-cp-10b', () => {
  const M = graphModel({ ...WHEEL, mode: 'colour' });
  const T = table(AG2, 'ag-cp-10b', 0);
  it('h, r1 .. r5 get 1, 2, 3, 2, 3, 4 as in the lesson table', () => {
    expect(M.steps.map((s) => s.c)).toEqual(T.rows.map((r) => r[2]));
    expect(M.steps.map((s) => s.id)).toEqual(['h', 'r1', 'r2', 'r3', 'r4', 'r5']);
    expect(M.K).toBe(4);
  });
  it('a triangle gives omega = 3, below the 4 colours used; no colouring with 3 exists, so chi = 4 (lesson 10b)', () => {
    expect(M.omega).toBe(3);
    expect(M.chi).toBe(4);
    expect(M.caption(M.count - 1).ro).toMatch(/χ\(G\) ≤ 4.*ω\(G\) = 3/);
    expect(M.caption(M.count - 1).ro).toContain('Nu există colorare cu 3 culori, deci χ(G) = 4.');
    expect(step(AG2, 'ag-cp-10b').blocks[0].result.ro).toContain('\\chi(G)=4');
  });
  it('a bad order uses more colours than needed, and the end says so: a path a-b-c-d in the order a, d, b, c', () => {
    const P = graphModel({ ...mk('abcd', [['a', 'b'], ['b', 'c'], ['c', 'd']]), mode: 'colour', order: ['a', 'd', 'b', 'c'] });
    expect(P.K).toBe(3);
    expect(P.omega).toBe(2);
    expect(P.chi).toBe(2);
    expect(P.caption(P.count - 1).ro).toContain('Există însă o colorare cu 2 culori, cât cere clica: χ(G) = 2.');
  });
  it('the options go one past the colours greedy uses, and the next node is marked', () => {
    expect(M.pickSpec(0, true).items[0].options.map((o) => o.id)).toEqual(['1', '2', '3', '4', '5']);
    expect(M.scene(0).nodes.find((n) => n.id === 'h').cls).toBe('target');
    expect(M.scene(3).nodes.find((n) => n.id === 'r3').cls).toBe('target');
    expect(M.scene(M.count - 1).nodes.some((n) => n.cls === 'target')).toBe(false);
  });
  it('when the clique number equals the colours used, chi is stated', () => {
    const tri = graphModel({ ...mk('ABC', [['A', 'B'], ['B', 'C'], ['A', 'C']]), mode: 'colour' });
    expect(tri.K).toBe(3);
    expect(tri.caption(tri.count - 1).en).toMatch(/χ\(G\) = 3/);
  });
  it('an illegal pick names the neighbour, a legal larger one is told the greedy rule, the right one is explained', () => {
    const it = M.pickSpec(2, true).items[0]; // r2: neighbours h (1) and r1 (2)
    expect(it.answer).toBe('3');
    expect(it.fb('2', false).ro).toMatch(/vecinul r1 are deja culoarea 2/);
    expect(it.fb('1', false).ro).toMatch(/vecinul h are deja culoarea 1/);
    const it4 = M.pickSpec(3, true).items[0]; // r3: h (1), r2 (3): 2 is smallest, 4 is legal
    expect(it4.answer).toBe('2');
    expect(it4.fb('4', false).ro).toMatch(/Se poate, dar regula greedy/);
    expect(it.fb('3', true).ro).toMatch(/3 e cea mai mică culoare/);
    expect(M.pickSpec(0, true).items[0].fb('1', true).ro).toMatch(/niciun vecin colorat/);
    expect(M.pickSpec(M.count - 1, true)).toBeNull();
  });
  it('the order can be set and a bad order is refused', () => {
    const rev = graphModel({ ...WHEEL, mode: 'colour', order: ['r1', 'r2', 'r3', 'r4', 'r5', 'h'] });
    expect(rev.colours.h).toBe(4);
    expect(() => graphModel({ ...WHEEL, mode: 'colour', order: ['h'] })).toThrow(/order/);
  });
  it('the picture colours nodes as they are taken and the labels carry the colour number', () => {
    const sc = M.scene(3);
    expect(sc.nodes.find((n) => n.id === 'r2').label.items[0].t).toBe('3');
    expect(sc.nodes.find((n) => n.id === 'r4').cls).toBe('');
  });
});
