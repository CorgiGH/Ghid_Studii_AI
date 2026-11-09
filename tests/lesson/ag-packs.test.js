import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { numberProblems } from '../../scripts/ml/content-checks.mjs';
import { figureError } from '../../src/components/lesson/blocks/figureSvg.js';

// The two AG crash packs after the sem3 rebuild (plan 4.6): ids kept, pictures on every graph screen, back links, notation card,
// numbers and detectors recomputed by the formulas.

const load = (f) => JSON.parse(readFileSync(new URL(`../../src/content/ag/courses/${f}.json`, import.meta.url), 'utf8'));
const P1 = load('ag-crash-partial');
const P2 = load('ag-crash-partial-2');
const ids = (c) => c.steps.map((s) => s.id);
const step = (c, id) => c.steps.find((s) => s.id === id);
const hasKey = (x, key) => JSON.stringify(x).includes(`"${key}"`);
const indexJs = readFileSync(new URL('../../src/content/ag/index.js', import.meta.url), 'utf8');

const ORIGINAL_1 = ['pass', 'order', '1a', '1b', '1b2', '1c', '1c2', '1d', '1e', '1f', '2a', '2b', '2c', '2d', '2e', '2f', '3a', '3b', '3c', '3d', '3e', '4a', '4b', '4c', '4d', '4e', '4f',
  '5a', '5b', '5c', '5d', '5e', '6a', '6b', '6c', '6d', '6e'].map((x) => `ag-cp-${x}`);
const ORIGINAL_2 = ['7a', '7b', '7b2', '7c', '7d', '8a', '8b', '8c', '8d', '8e', '9a', '9b', '9c', '9d', '9e', '10a', '10b', '10c', '10d', 'trap1', 'trap2', 'trap3', 'trap4', 'recap',
  'm1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8'].map((x) => `ag-cp-${x}`);

describe('ids and section counts', () => {
  it('every earlier step id is still there (only ag-cp-1b and ag-cp-1b2 went, their four steps moved under the rule of ag-cp-1d)', () => {
    expect(ORIGINAL_1.filter((i) => !ids(P1).includes(i))).toEqual(['ag-cp-1b', 'ag-cp-1b2']);
    expect(ORIGINAL_2.filter((i) => !ids(P2).includes(i))).toEqual([]);
  });
  it('the other earlier steps keep their relative order', () => {
    const keep = (orig, now) => orig.filter((i) => now.includes(i));
    const order = (orig, now) => keep(orig, now).map((i) => now.indexOf(i));
    for (const [orig, c] of [[ORIGINAL_1, P1], [ORIGINAL_2, P2]]) {
      const o = order(orig, ids(c));
      expect(o).toEqual([...o].sort((a, b) => a - b));
    }
  });
  it('step ids are unique and sectionCount follows the steps', () => {
    for (const c of [P1, P2]) expect(new Set(ids(c)).size).toBe(ids(c).length);
    const count = (id) => Number(indexJs.match(new RegExp(`id: "${id}"[^\\n]*?sectionCount: (\\d+)`))[1]);
    expect(count('ag-crash-partial')).toBe(P1.steps.length);
    expect(count('ag-crash-partial-2')).toBe(P2.steps.length);
  });
});

describe('pictures on the graph screens (plan items 21-22)', () => {
  const p1 = ['1a', '1c2', '1f', '1i', '2a', '2e', '2g', '2g2', '3a', '3f2', '4a', '4d', '4e', '5b', '5c', '5e', '6a', '6b', '6b2', '6e', '6e2'];
  const p2 = ['7a', '7b2', '7c', '8a', '8c', '8d', '8d2', '8e', '9a', '9b', '9c', '9d', '9f', '9f2', '9g', '9g2', '10a', '10b2', '10c', 'mtree', 'mtree2', 'bfs', 'm1', 'm2', 'm5', 'm6'];
  it.each(p1)('part 1 ag-cp-%s draws a figure', (k) => expect(hasKey(step(P1, `ag-cp-${k}`), 'figure')).toBe(true));
  it.each(p2)('part 2 ag-cp-%s draws a figure', (k) => expect(hasKey(step(P2, `ag-cp-${k}`), 'figure')).toBe(true));
  it('the walks that replace the interims use the graph-walk widget with the picks on', () => {
    const w = (c, id) => step(c, id).blocks.find((b) => b.type === 'viz');
    for (const [c, id, mode] of [[P1, 'ag-cp-1c', 'dijkstra'], [P1, 'ag-cp-1f2', 'dijkstra'], [P1, 'ag-cp-1g', 'bfm'], [P1, 'ag-cp-2b', 'kruskal'], [P1, 'ag-cp-2d', 'prim'], [P1, 'ag-cp-2f1', 'kruskal'],
      [P2, 'ag-cp-8b', 'cut'], [P2, 'ag-cp-10b', 'colour']]) {
      expect(w(c, id)?.widget, id).toBe('graph-walk');
      expect(w(c, id).props.mode, id).toBe(mode);
      expect(w(c, id).predict, id).toBe(true);
    }
  });
  it('every figure of the two packs is valid', () => {
    for (const c of [P1, P2]) {
      const seen = [];
      JSON.stringify(c, (k, v) => { if (k === 'figure' && v && v.svg) seen.push(v); return v; });
      expect(seen.length).toBeGreaterThan(20);
      for (const f of seen) expect(figureError(f)).toBeNull();
    }
  });
});

describe('cards, menus and back links', () => {
  const backTo = (s) => s.blocks.flatMap((b) => b.intro || []).find((p) => p.cardlinks)?.cardlinks?.[0];
  it('the last screen of cards 7 to 10 and of the completions links back to the part 2 menu', () => {
    for (const id of ['ag-cp-7e', 'ag-cp-8f2', 'ag-cp-9g2', 'ag-cp-10d', 'ag-cp-bfs2']) {
      const l = backTo(step(P2, id));
      expect(l, id).toBeTruthy();
      expect(l.step).toBe('ag-cp-menu2');
    }
  });
  it('the part 2 menu lists matchings, colouring, connectivity, trees in that order', () => {
    const l = step(P2, 'ag-cp-menu2').blocks[0].intro[0].cardlinks.map((x) => x.step);
    const at = (id) => l.indexOf(id);
    expect([at('ag-cp-9a'), at('ag-cp-10a'), at('ag-cp-8a'), at('ag-cp-7a')].every((x) => x >= 0)).toBe(true);
    expect(at('ag-cp-9a')).toBeLessThan(at('ag-cp-10a'));
    expect(at('ag-cp-10a')).toBeLessThan(at('ag-cp-8a'));
    expect(at('ag-cp-8a')).toBeLessThan(at('ag-cp-7a'));
  });
  it('the notation card is five screens of at most ten rows, two columns each (it fits a phone), linked from both menus', () => {
    const screens = [step(P1, 'ag-cp-n1'), step(P1, 'ag-cp-n2'), step(P1, 'ag-cp-n3'), step(P2, 'ag-cp-trap4'), step(P2, 'ag-cp-trap4b')];
    const tabs = screens.map((s) => s.blocks[0].intro.find((p) => p.table).table);
    for (const t of tabs) {
      expect(t.rows.length).toBeLessThanOrEqual(10);
      expect(t.columns).toHaveLength(2);
      expect(t.rows.every((r) => r.length === 2)).toBe(true);
      // the meaning cell is plain words: a cell with math does not wrap and would push the table off a 390 px phone
      for (const r of t.rows) expect(r[1], r[0]).not.toMatch(/\$/);
    }
    screens.forEach((s, i) => expect(s.title.ro).toBe(`Notația cursului (${i + 1} din 5)`));
    const all = JSON.stringify(tabs);
    expect(all).toContain('numără MUCHIILE, nu costul');
    // symbols the lessons use that the card has to name (review of 2026-11-09)
    for (const sym of ['M\\\\,\\\\Delta\\\\,P', 'q(G-S)', 'L[G]=D-A', 'before(i,j)', 'c_{V_i^2}(y,t)', 'K_p', '$p$-colorare', '$p$-regulat', 'muchie în cross']) expect(all, sym).toContain(sym);
    expect(JSON.stringify(step(P1, 'ag-cp-order'))).toContain('ag-cp-n1');
    expect(JSON.stringify(step(P2, 'ag-cp-menu2'))).toContain('ag-cp-trap4b');
  });
  it('the recap is two columns of plain words, so it fits a phone', () => {
    const t = step(P2, 'ag-cp-recap').blocks[0].intro.find((p) => p.table).table;
    expect(t.columns).toHaveLength(2);
    for (const r of t.rows) for (const c of r) expect(c).not.toMatch(/\$/);
  });
});

describe('labels and words', () => {
  const banned = /Exemplul rezolvat|^Exemplu|Rețeta|^Regula|Exersează|Încearcă tu|Rândul tău|Simboluri|Pentru oral|^Capcane|ușor|ușoar|rapid|mecanic/i;
  it('no title, kicker or label carries a teaching-step word or an effort word', () => {
    for (const c of [P1, P2]) {
      for (const s of c.steps) {
        for (const t of [s.title?.ro, s.kicker?.ro, ...s.blocks.map((b) => b.label?.ro)]) if (t) expect(t, `${s.id}: ${t}`).not.toMatch(banned);
      }
    }
  });
  it('learner text has no effort words', () => {
    const txt = JSON.stringify([P1, P2].map((c) => c.steps.map((s) => s.blocks.map((b) => { const { figure: _figure, ...rest } = b; return rest; }))));
    expect(txt).not.toMatch(/\bușor|\bușoar|\brapid|\bmecanic/i);
  });
  it('Tema 1 guard: no screen of cards 4-6, and no screen of part 2, prints the first step of problem 1 (b) or the question of 1 (a)', () => {
    const t = JSON.stringify([...P1.steps.filter((s) => /^ag-cp-[456]/.test(s.id)), ...P2.steps]);
    expect(t).not.toContain('d_G(x_1)+d_G(x_2)');
    expect(t).not.toContain('Când devin cele două inegalități');
  });
  it('Tema 1 guard: the part 2 mini-test counts on a set that is not the homework\'s {x1, x2}', () => {
    const m4 = JSON.stringify(step(P2, 'ag-cp-m4'));
    expect(m4).not.toMatch(/x_1|x_2/);
    expect(m4).toContain('X=\\\\{a,b\\\\}');
  });
});

describe('numbers: every formula equals its expected value, no detector fires on the right answer', () => {
  it('has no N1 or N2 problem', () => {
    const lessons = [{ metaId: 'ag-crash-partial', json: P1 }, { metaId: 'ag-crash-partial-2', json: P2 }];
    expect(numberProblems(lessons).filter((p) => /^N[12]\b/.test(p))).toEqual([]);
  });
  it('detectors exist on every calc exercise of the packs', () => {
    for (const c of [P1, P2]) {
      for (const s of c.steps) for (const b of s.blocks) if (b.type === 'calc-exercise') expect(b.detectors?.length, b.id).toBeGreaterThan(0);
    }
  });
});

describe('no answer on the screen before the learner answers (review of 2026-11-09)', () => {
  // these screens hold only the question (or the walk); the rule, the table or the result that answers it is on the next screen
  const only = (c, id, types) => expect(step(c, id).blocks.map((b) => b.type).filter((t) => !types.includes(t)), id).toEqual([]);
  it('question screens carry no rule or worked result', () => {
    only(P2, 'ag-cp-8c', ['calc-exercise']);
    only(P2, 'ag-cp-8d', ['mcq']);
    only(P2, 'ag-cp-9b', ['mcq']);
    only(P2, 'ag-cp-10b', ['viz']);
    only(P2, 'ag-cp-bfs', ['mcq']);
    only(P2, 'ag-cp-iso', ['mcq']);
    only(P1, 'ag-cp-3f', ['mcq']);
    expect(step(P2, 'ag-cp-10c').blocks.filter((b) => b.type === 'steps').map((b) => JSON.stringify(b))).not.toContain('alpha(G)=2');
    for (const [c, id, next] of [[P2, 'ag-cp-8d', 'ag-cp-8d2'], [P2, 'ag-cp-9b', 'ag-cp-9b2'], [P2, 'ag-cp-10b', 'ag-cp-10b2'], [P2, 'ag-cp-10c', 'ag-cp-10c2'],
      [P2, 'ag-cp-bfs', 'ag-cp-bfs2'], [P2, 'ag-cp-iso', 'ag-cp-iso2'], [P1, 'ag-cp-3f', 'ag-cp-3f2'], [P1, 'ag-cp-6b', 'ag-cp-6b2'], [P1, 'ag-cp-6e', 'ag-cp-6e2']]) {
      expect(ids(c).indexOf(next), next).toBe(ids(c).indexOf(id) + 1);
    }
  });
  it('the exercise figures draw the data, not the answer: no oval, no coloured circuit or crossing edge', () => {
    const svgOf = (c, id) => JSON.stringify(step(c, id).blocks.filter((b) => b.type === 'calc-exercise' || b.type === 'mcq').map((b) => [b.figure, ...(b.variants || []).map((v) => v.figure)]));
    for (const [c, id] of [[P1, 'ag-cp-5b'], [P1, 'ag-cp-6b'], [P1, 'ag-cp-6e'], [P1, 'ag-cp-2g2'], [P2, 'ag-cp-m6']]) {
      const svg = svgOf(c, id);
      expect(svg, id).not.toContain('<ellipse');
      expect(svg, id).not.toMatch(/class=\\"warn\\" stroke-width=\\"4\\"/);
      expect(svg, id).not.toMatch(/class=\\"bad\\" stroke-width=\\"4\\"/);
    }
    expect(svgOf(P1, 'ag-cp-4d')).not.toContain('stroke-dasharray');
    expect(JSON.stringify(step(P2, 'ag-cp-trap2'))).not.toContain('maximal</text>');
  });
  it('ag-cp-1c holds the walk and ag-cp-1c2 the finished run, so the widget is not answered on the screen before it', () => {
    expect(step(P1, 'ag-cp-1c').blocks.some((b) => b.type === 'viz')).toBe(true);
    expect(JSON.stringify(step(P1, 'ag-cp-1c'))).not.toContain('8 (c)');
    expect(JSON.stringify(step(P1, 'ag-cp-1c2'))).toContain('8 (c) ✓');
  });
});

describe('variants read their own data (review of 2026-11-09: wrong-answer messages named the main exercise)', () => {
  it('a variant whose block has data brings its own data, so no detector fires with the value of the main exercise', () => {
    for (const c of [P1, P2]) {
      for (const s of c.steps) for (const b of s.blocks) {
        if (b.type !== 'calc-exercise' || !b.data) continue;
        for (const v of b.variants) expect(v.data, b.id).toBeTruthy();
      }
    }
  });
  it('no detector message names an edge of the main exercise that its variant lacks (5b, 2e2, 6b, 6e, 8c, 2f)', () => {
    const msgs = (c, id) => JSON.stringify(step(c, id).blocks.filter((b) => b.type === 'calc-exercise').map((b) => (b.detectors || []).map((d) => d.message.ro)));
    expect(msgs(P1, 'ag-cp-5b')).not.toMatch(/\\$(BD|DE|AB|AC)\\$/);
    expect(msgs(P1, 'ag-cp-2e2')).not.toMatch(/\\$(BD|AB|AC)\\$|\\(4 și 5\\)/);
    expect(msgs(P1, 'ag-cp-6b')).not.toMatch(/\\$at\\$/);
    expect(msgs(P1, 'ag-cp-6e')).not.toMatch(/\\$cb\\$/);
    expect(msgs(P1, 'ag-cp-2f')).not.toMatch(/PR|8 - 4/);
    expect(msgs(P2, 'ag-cp-8c')).not.toMatch(/24|46|56/);
    expect(msgs(P2, 'ag-cp-10d')).not.toMatch(/Oricare 3 noduri/);
  });
});
