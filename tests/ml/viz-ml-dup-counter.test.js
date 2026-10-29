import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import * as K from '../../src/ml/calc/mathKit.js';
import { dupModel, analyse, times } from '../../src/components/lesson/viz/logic/ml/dup-counter.js';
import { validateViz, WIDGET_NAMES } from '../../src/components/lesson/viz/vizSpec.js';
import { expectCaptionDrawn } from './ml-viz-helpers.js';

vi.mock('../../src/lesson/useLessonStore', async () => {
  const { createLessonStore } = await import('../../src/lesson/store.js');
  const m = new Map();
  const store = createLessonStore({ getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { m.set(k, String(v)); } });
  return { useLessonStore: () => store, getLessonStore: () => store };
});
vi.mock('../../src/contexts/AppContext', () => ({ useApp: () => ({ t: (en, ro) => ro }) }));
vi.mock('motion/react', async (orig) => ({ ...(await orig()), useReducedMotion: () => true }));

const { default: DupCounter, DupStage } = await import('../../src/components/lesson/viz/widgets/ml/DupCounter.jsx');

// T21T2 1: each of the 8 input combinations once
const TABLE = { columns: ['A', 'B', 'C', 'Y'], rows: [[0, 0, 0, 0], [0, 0, 1, 1], [0, 1, 0, 1], [0, 1, 1, 0], [1, 0, 0, 0], [1, 0, 1, 1], [1, 1, 0, 0], [1, 1, 1, 1]] };
const PROPS = { table: TABLE, target: 'Y', added: [[0, 0, 0, 1], [0, 0, 1, 0]] };

describe('the counter (T21T2 1)', () => {
  const M = dupModel(PROPS);
  it('is 0/8 on the consistent table, then 1/9, then 2/10', () => {
    expect(M.states.map((s) => `${s.errs}/${s.n}`)).toEqual(['0/8', '1/9', '2/10']);
  });
  it('equals the training error of the ID3 of the kit at every step', () => {
    for (const s of M.states) expect(s.errs).toBe(s.id3);
  });
  it('the contradictory groups are (0,0,0) and (0,0,1), two rows each, one wrong each', () => {
    const last = M.states[2];
    expect(last.contradictory.map((g) => [g.vals.join(''), g.n, g.max, g.errs])).toEqual([['000', 2, 1, 1], ['001', 2, 1, 1]]);
    expect(last.contradictory.every((g) => g.tie)).toBe(true);
    expect(M.states[1].contradictory).toHaveLength(1);
    expect(M.states[0].contradictory).toHaveLength(0);
  });
  it('a duplicate with the same label adds nothing; a third row on the majority adds nothing, on the minority adds 1', () => {
    const rows = [[0, 0], [0, 1], [1, 1]];
    const a = analyse([...rows, [0, 0]], ['X', 'Y'], 1);
    expect(a.errs).toBe(1); // X=0: labels 0,1,0 -> 1 wrong
    const b = analyse([...rows, [0, 0], [0, 1]], ['X', 'Y'], 1);
    expect(b.errs).toBe(2); // X=0: 0,1,0,1 -> 2 wrong
    const c = analyse([[0, 1], [0, 1]], ['X', 'Y'], 1);
    expect(c.errs).toBe(0);
    expect(K.trainErrId3({ columns: ['X', 'Y'], rows: [...rows, [0, 0], [0, 1]] }, 'Y')).toBe(2);
  });
  it('the counter grows by 0 or 1 per added row (so the prediction has two answers)', () => {
    const big = dupModel({ table: TABLE, target: 'Y', added: [[0, 0, 0, 1], [0, 0, 0, 1], [0, 0, 0, 0], [0, 0, 0, 0], [1, 1, 1, 1]] });
    for (let j = 1; j < big.states.length; j++) expect([0, 1]).toContain(big.states[j].errs - big.states[j - 1].errs);
    for (const s of big.states) expect(s.errs).toBe(s.id3);
  });
  it('frames: base, one per added row, summary', () => {
    expect(M.frames.map((f) => f.kind)).toEqual(['base', 'add', 'add', 'summary']);
  });
  it('captions', () => {
    expect(M.caption(0).ro).toContain('Tabelul are 8 rânduri.');
    expect(M.caption(0).ro).toContain('0/8');
    expect(M.caption(1).ro).toContain('Rând nou (0,0,0) cu Y = 1');
    expect(M.caption(1).ro).toContain('de 2 ori, cu Y = 0 o dată și Y = 1 o dată');
    expect(M.caption(1).ro).toContain('Eroarea minimă la antrenare trece de la 0/8 la 1/9.');
    expect(M.caption(1).ro).toContain('oricare etichetă ar da un arbore, greșește pe 1 rând.');
    expect(M.caption(2).ro).toContain('de la 1/9 la 2/10');
    expect(M.caption(3).ro).toBe('Grupurile contradictorii, rândurile grupului minus aparițiile etichetei celei mai frecvente: (0,0,0): 2 − 1 = 1; (0,0,1): 2 − 1 = 1. În total 1 + 1 = 2 rânduri greșite din 10: 2/10 = 0.2.');
  });
  it('the counter does not move in the caption before the prediction (the base frame never names the next row)', () => {
    expect(M.caption(0, { predict: true }).ro).not.toContain('1/9');
    expect(M.pickSpec(0, true).items[0].key).toBe('add1');
    expect(M.pickSpec(1, true).items[0].key).toBe('add2');
    expect(M.pickSpec(2, true)).toBeNull();
    expect(M.pickSpec(0, false)).toBeNull();
    expect(M.pickSpec(2, true)).toBeNull();
  });
  it('a pick is answered', () => {
    expect(M.caption(1, { picks: { add1: 'up' } }).ro).toContain('Ai prezis corect.');
    expect(M.caption(1, { picks: { add1: 'same' } }).ro).toContain('Nu cum ai prezis.');
  });
  it('a repeated row with the same label is called a duplicate, not a contradiction', () => {
    const D = dupModel({ table: TABLE, target: 'Y', added: [[0, 0, 0, 0]] });
    expect(D.caption(1).ro).toContain('mereu cu aceeași etichetă');
    expect(D.states[1].errs).toBe(0);
  });
  it('Romanian counted nouns', () => {
    expect([1, 2, 5, 20, 21].map((n) => times(n, 'ro'))).toEqual(['o dată', 'de 2 ori', 'de 5 ori', 'de 20 de ori', 'de 21 de ori']);
  });
  it('rejects an added row of the wrong width', () => {
    expect(() => dupModel({ table: TABLE, target: 'Y', added: [[0, 0, 1]] })).toThrow(/cells/);
  });
});

describe('the caption matches the picture', () => {
  const M = dupModel(PROPS);
  it('every frame, with and without predict: each number of the caption is drawn', () => {
    for (let k = 0; k < M.count; k++) {
      for (const predict of [false, true]) {
        const html = renderToStaticMarkup(React.createElement(DupStage, { model: M, k, predict }));
        expectCaptionDrawn(expect, M.caption(k, { predict, picks: { add1: 'up', add2: 'up' } }), html, `frame ${k}`);
      }
    }
  });
  it('end state: the contradictory rows are marked and the counter says 2 / 10 = 0.2', () => {
    const html = renderToStaticMarkup(React.createElement(DupStage, { model: M, k: 3, predict: false }));
    expect((html.match(/mlv-contra/g) || []).length).toBe(4);
    expect(html).toContain('data-value="0.2"');
    expect(html).toContain('mlv-counter');
  });
  it('the added row is marked at its frame and the ghost row shows only with predict', () => {
    expect(renderToStaticMarkup(React.createElement(DupStage, { model: M, k: 1, predict: false }))).toContain('mlv-new');
    expect(renderToStaticMarkup(React.createElement(DupStage, { model: M, k: 0, predict: true }))).toContain('mlv-ghost');
    expect(renderToStaticMarkup(React.createElement(DupStage, { model: M, k: 0, predict: false }))).not.toContain('mlv-ghost');
  });
});

describe('the widget', () => {
  const html = (predict) => renderToStaticMarkup(React.createElement(DupCounter, { props: PROPS, predict }));
  it('first frame with predict: the prediction bar shows and Next is locked', () => {
    const h = html(true);
    expect(h).toContain('data-widget="ml-dup-counter"');
    expect(h).toContain('mlv-picks');
    expect(h).toMatch(/viz-btn-primary[^>]*disabled/);
    expect(h).not.toContain('1/9');
  });
  it('first frame without predict: Next is open', () => {
    const h = html(false);
    expect(h).not.toContain('mlv-picks');
    expect(h).not.toMatch(/viz-btn-primary[^>]*disabled/);
  });
});

describe('validateViz', () => {
  const v = (props) => validateViz({ id: 'ml-l13-v1', widget: 'ml-dup-counter', predict: true, props });
  it('is registered and accepts the outline props', () => {
    expect(WIDGET_NAMES).toContain('ml-dup-counter');
    expect(v(PROPS)).toEqual([]);
  });
  it('rejects a missing prop, an unknown target or a short added row', () => {
    expect(v({ table: TABLE, target: 'Y' })).not.toEqual([]);
    expect(v({ table: TABLE, added: PROPS.added })).not.toEqual([]);
    expect(v({ table: TABLE, target: 'Z', added: PROPS.added })).not.toEqual([]);
    expect(v({ table: TABLE, target: 'Y', added: [[0, 0, 1]] })).not.toEqual([]);
    expect(v({ target: 'Y', added: PROPS.added })).not.toEqual([]);
  });
  it('the css file has no colour literals', () => {
    const css = readFileSync(new URL('../../src/components/lesson/viz/widgets/ml/id3.css', import.meta.url), 'utf8');
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/);
  });
});

describe('review fixes', () => {
  const M = dupModel(PROPS);
  it('the group line counts the rows per label in words, with the target column named', () => {
    const html = renderToStaticMarkup(React.createElement(DupStage, { model: M, k: 1, predict: false }));
    expect(html).toContain('apare de 2 ori');
    expect(html).toMatch(/Y = <span data-value="0">0<\/span> <span data-value="1">o dată<\/span>/);
    expect(html).toContain('un arbore greșește pe');
    expect(html).not.toContain('time(s)');
  });
  it('the counter is called the smallest training error, the same words as the caption', () => {
    const html = renderToStaticMarkup(React.createElement(DupStage, { model: M, k: 0, predict: false }));
    expect(html).toContain('Eroarea minimă la antrenare');
    expect(M.pickSpec(0, true).items[0].prompt.ro).toContain('eroarea minimă la antrenare');
  });
  it('the summary table headers may wrap so the four columns fit a phone', () => {
    const css = readFileSync(new URL('../../src/components/lesson/viz/widgets/ml/id3.css', import.meta.url), 'utf8');
    expect(css).toMatch(/\.mlv-sumtable th \{[^}]*white-space: normal/);
    expect(renderToStaticMarkup(React.createElement(DupStage, { model: M, k: 3, predict: false }))).toContain('mlv-sumtable');
  });
});

describe('second review', () => {
  const M = dupModel(PROPS);
  it('the labels of a group are counted in words, not as "0 (1) and 1 (1)"', () => {
    expect(M.caption(1).ro).toContain('aceste intrări apar acum de 2 ori, cu Y = 0 o dată și Y = 1 o dată.');
    expect(M.caption(1).ro).toContain('Etichetele sunt la egalitate: oricare etichetă ar da un arbore, greșește pe 1 rând.');
    expect(M.caption(1).en).toContain('these inputs now appear 2 times, with Y = 0 once and Y = 1 once.');
    const D = dupModel({ table: TABLE, target: 'Y', added: [[0, 0, 0, 1], [0, 0, 0, 1]] });
    expect(D.caption(2).ro).toContain('de 3 ori, cu Y = 0 o dată și Y = 1 de 2 ori. Un arbore le dă o singură etichetă, deci greșește pe 1 rând.');
    const html = renderToStaticMarkup(React.createElement(DupStage, { model: M, k: 1, predict: false }));
    expect(html.replace(/<[^>]+>/g, '')).toContain('Y = 0 o dată;');
    expect(html.replace(/<[^>]+>/g, '')).toContain('Y = 1 o dată');
    expect(html.replace(/<[^>]+>/g, '')).not.toMatch(/Y = 0: 1/);
  });
  it('the counter keeps each fraction whole on a phone: 0/8 → 1/9 never breaks inside a fraction', () => {
    const css = readFileSync(new URL('../../src/components/lesson/viz/widgets/ml/id3.css', import.meta.url), 'utf8');
    expect(css).toMatch(/\.mlv-frac \{[^}]*white-space: nowrap/);
    const html = renderToStaticMarkup(React.createElement(DupStage, { model: M, k: 1, predict: false }));
    expect((html.match(/class="mlv-frac/g) || []).length).toBe(2);
  });
});
