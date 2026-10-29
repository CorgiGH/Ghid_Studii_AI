import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { mlThreshold, guessNote } from '../../src/components/lesson/viz/logic/ml/threshold.js';
import { validateViz } from '../../src/components/lesson/viz/vizSpec.js';

vi.mock('../../src/contexts/AppContext', () => ({ useApp: () => ({ t: (en, ro) => ro, lang: 'ro' }) }));
vi.mock('../../src/lesson/useLessonStore', () => ({ useLessonStore: () => null, getLessonStore: () => null }));
vi.mock('motion/react', async (orig) => ({ ...(await orig()), useReducedMotion: () => true }));

// ML3:21, the temperatures of the L14 worked example
const TEMPS = { columns: ['Temperature', 'Play'], rows: [[40, 'No'], [48, 'No'], [60, 'Yes'], [72, 'Yes'], [80, 'Yes'], [90, 'No']] };
// E 3.11.b: ten points in the plane
const PLANE = { columns: ['x', 'y', 'label'], rows: [[1, 3, '+'], [2, 3, '+'], [2, 1, '+'], [3, 2, '+'], [4, 5, '+'], [1, 5, '-'], [1, 1, '-'], [4, 3, '-'], [5, 4, '-'], [5, 2, '-']] };
// E 4.48
const P48 = { columns: ['X1', 'X2', 'Y'], rows: [[1, 2, '+'], [2, 3, '+'], [3, 4, '-'], [3, 2, '-'], [3, 1, '-'], [4, 4, '-'], [5, 4, '-'], [5, 2, '+'], [5, 1, '+']] };

const close = (a, b) => expect(a).toBeCloseTo(b, 3);
const byKey = (frame, key) => frame.cands.find((c) => c.key === key);

describe('ml-threshold on the temperatures (L14 worked example)', () => {
  const W = mlThreshold({ table: TEMPS, attr: 'Temperature', target: 'Play' });
  it('has the thresholds 54 and 85, only where the label changes', () => {
    expect(W.frames[0].cands.map((c) => c.th)).toEqual([54, 85]);
    expect(W.frames[0].cands.map((c) => c.key)).toEqual(['Temperature@54', 'Temperature@85']);
  });
  it('the setup frame does not give away any IG', () => {
    const f = W.frames[0];
    expect(f.showIG).toBe(false);
    expect(JSON.stringify(f.cands)).not.toMatch(/ig/);
    expect(f.caption.en).not.toMatch(/0\.4591|0\.1909/);
  });
  it('root: H = 1, IG(54) = 0.4591, IG(85) = 0.1909, 54 wins', () => {
    const f = W.frames[1];
    expect(f.kind).toBe('node');
    expect(f.counts).toEqual([3, 3]);
    close(f.h, 1);
    close(byKey(f, 'Temperature@54').ig, 0.4591);
    close(byKey(f, 'Temperature@85').ig, 0.1909);
    expect(f.best.key).toBe('Temperature@54');
    expect(byKey(f, 'Temperature@54').left).toEqual([0, 2]);
    expect(byKey(f, 'Temperature@54').right).toEqual([3, 1]);
    expect(byKey(f, 'Temperature@85').left).toEqual([3, 2]);
    expect(byKey(f, 'Temperature@85').right).toEqual([0, 1]);
    expect(f.caption.en).toContain('[3+,3−]');
    expect(f.caption.en).toContain('IG 0.4591');
    expect(f.caption.ro).toContain('IG 0.4591');
  });
  it('a threshold inside the run of Yes (66) has IG 0.0817', () => {
    const f = W.frames[2];
    expect(f.kind).toBe('contrast');
    expect(f.trial.th).toBe(66);
    close(f.trial.ig, 0.0817);
    expect(f.trial.left).toEqual([1, 2]);
    expect(f.trial.right).toEqual([2, 1]);
    expect(f.caption.en).toContain('0.0817');
  });
  it('the right node recomputes its thresholds from its 4 points: only 85, IG 0.8113', () => {
    const f = W.frames[3];
    expect(f.kind).toBe('node');
    expect(f.n).toBe(4);
    expect(f.cands.map((c) => c.th)).toEqual([85]);
    close(f.cands[0].ig, 0.8113);
    expect(f.caption.en).toContain('Temperature > 54');
  });
  it('zones: No up to 54, Yes up to 85, No after; 2 tests', () => {
    const f = W.frames[W.frames.length - 1];
    expect(f.kind).toBe('zones');
    expect(f.tests).toBe(2);
    expect(f.leaves.map((l) => l.label)).toEqual(['No', 'Yes', 'No']);
    expect(f.leaves.map((l) => l.region.x)).toEqual([[-Infinity, 54], [54, 85], [85, Infinity]]);
    expect(W.frames.length).toBe(5);
  });
  it('the guess note says right or what the pick was worth', () => {
    const f = W.frames[1];
    expect(guessNote(f, 'Temperature@54').en).toBe('You picked Temperature ≤ 54: right.');
    expect(guessNote(f, 'Temperature@85').en).toContain('IG 0.1909');
    expect(guessNote(f, 'Temperature@85').en).toContain('IG 0.4591');
    expect(guessNote(f, null)).toBeNull();
    expect(guessNote(W.frames[3], 'Temperature@85')).toBeNull();
  });
  it('every frame has an English and a Romanian caption with the same numbers', () => {
    const nums = (s) => (s.match(/\d+(?:\.\d+)?/g) || []).join(' ');
    for (const f of W.frames) {
      expect(f.caption.en.length).toBeGreaterThan(10);
      expect(nums(f.caption.ro)).toBe(nums(f.caption.en));
    }
  });
});

describe('ml-threshold in the plane (E 3.11.b)', () => {
  const W = mlThreshold({ table: PLANE, attr: 'x', target: 'label', plane: { x: 'x', y: 'y' } });
  it('root IGs match the outline and the root is x <= 4.5', () => {
    const f = W.frames[1];
    close(f.h, 1);
    close(byKey(f, 'x@4.5').ig, 0.2365);
    close(byKey(f, 'x@3.5').ig, 0.1245);
    close(byKey(f, 'x@1.5').ig, 0.0349);
    close(byKey(f, 'y@3.5').ig, 0.0349);
    expect(f.best.key).toBe('x@4.5');
  });
  it('the tree has 6 tests and 7 zones', () => {
    expect(W.tests).toBe(6);
    expect(W.leaves.length).toBe(7);
    expect(W.frames[W.frames.length - 1].caption.en).toContain('6 tests and 7 zones');
  });
  it('has no trial frame in the plane', () => {
    expect(W.frames.some((f) => f.kind === 'contrast')).toBe(false);
  });
});

describe('ml-threshold on E 4.48', () => {
  const W = mlThreshold({ table: P48, attr: 'X1', target: 'Y', plane: { x: 'X1', y: 'X2' } });
  it('root: five thresholds, X2 <= 3.5 wins with 0.3789', () => {
    const f = W.frames[1];
    expect(f.cands.length).toBe(5);
    close(byKey(f, 'X1@2.5').ig, 0.3198);
    close(byKey(f, 'X1@4.5').ig, 0.0728);
    close(byKey(f, 'X2@1.5').ig, 0.0026);
    close(byKey(f, 'X2@2.5').ig, 0.0911);
    close(byKey(f, 'X2@3.5').ig, 0.3789);
    expect(f.best.key).toBe('X2@3.5');
  });
  it('level 2 recomputes: X1 <= 4 replaces 4.5, and the tie with X1 <= 2.5 is named', () => {
    const f = W.frames[2];
    expect(f.n).toBe(6);
    close(byKey(f, 'X1@2.5').ig, 0.2516);
    close(byKey(f, 'X1@4').ig, 0.2516);
    close(byKey(f, 'X2@1.5').ig, 0.0441);
    close(byKey(f, 'X2@2.5').ig, 0.1092);
    expect(f.best.key).toBe('X1@2.5');
    expect(f.caption.en).toContain('same IG');
    expect(W.tests).toBe(3);
    expect(W.leaves.length).toBe(4);
  });
});

describe('validateViz for ml-threshold', () => {
  const ok = { id: 'v1', widget: 'ml-threshold', predict: true, props: { table: TEMPS, attr: 'Temperature', target: 'Play' } };
  it('accepts the outline props, with and without a plane', () => {
    expect(validateViz(ok)).toEqual([]);
    expect(validateViz({ ...ok, props: { ...ok.props, table: PLANE, attr: 'x', target: 'label', plane: { x: 'x', y: 'y' } } })).toEqual([]);
  });
  it('rejects a missing table, attr, target, a bad plane or an unknown column', () => {
    for (const k of ['table', 'attr', 'target']) {
      const props = { ...ok.props }; delete props[k];
      expect(validateViz({ ...ok, props }).join(' ')).toContain(`props.${k}`);
    }
    expect(validateViz({ ...ok, props: { ...ok.props, plane: { x: 'a' } } }).join(' ')).toContain('props.plane');
    expect(validateViz({ ...ok, props: { ...ok.props, attr: 'Nope' } }).join(' ')).toContain('Nope');
  });
});

const numbers = (str) => (String(str).match(/-?\d+(?:\.\d+)?/g) || []).map((x) => String(Number(x)));
const marks = (html) => {
  const out = new Set();
  for (const m of html.matchAll(/data-value="([^"]*)"/g)) for (const n of numbers(m[1])) out.add(n);
  return out;
};

describe('ml-threshold: the caption matches the picture (every frame)', async () => {
  const { Stage } = await import('../../src/components/lesson/viz/widgets/ml/Threshold.jsx');
  const cases = {
    temps: mlThreshold({ table: TEMPS, attr: 'Temperature', target: 'Play' }),
    plane: mlThreshold({ table: PLANE, attr: 'x', target: 'label', plane: { x: 'x', y: 'y' } }),
    e448: mlThreshold({ table: P48, attr: 'X1', target: 'Y', plane: { x: 'X1', y: 'X2' } }),
  };
  for (const [name, W] of Object.entries(cases)) {
    it(`${name}: every number of the English and Romanian captions is a data-value of that frame`, () => {
      W.frames.forEach((f, k) => {
        const html = renderToStaticMarkup(React.createElement(Stage, { W, frame: f }));
        const have = marks(html);
        for (const lang of ['en', 'ro']) {
          for (const n of numbers(f.caption[lang])) expect(have.has(n), `${name} frame ${k} (${f.kind}) ${lang}: ${n} in "${f.caption[lang]}"`).toBe(true);
        }
      });
    });
  }
  it('the first frame draws no IG at all and the node frames draw one per candidate', () => {
    const W = cases.temps;
    expect(renderToStaticMarkup(React.createElement(Stage, { W, frame: W.frames[0] }))).not.toContain('data-mark="ig"');
    const html = renderToStaticMarkup(React.createElement(Stage, { W, frame: W.frames[1] }));
    expect([...html.matchAll(/data-mark="ig" data-value="([^"]*)"/g)].map((m) => m[1])).toEqual(['0.4591', '0.1909']);
  });
  it('points carry their value, one per row', () => {
    const W = cases.temps;
    const html = renderToStaticMarkup(React.createElement(Stage, { W, frame: W.frames[0] }));
    expect([...html.matchAll(/data-mark="point" data-value="([^"]*)"/g)].map((m) => m[1])).toEqual(['40', '48', '60', '72', '80', '90']);
  });
  it('colours are theme and lesson tokens only', () => {
    const html = renderToStaticMarkup(React.createElement(Stage, { W: cases.plane, frame: cases.plane.frames[cases.plane.frames.length - 1] }));
    expect(html).not.toMatch(/#[0-9a-f]{3,8}\b|rgb\(|hsl\(/i);
  });
});

describe('ml-threshold component', () => {
  it('renders the asking frame with predict: chips to pick, Next locked, no IG', async () => {
    const { default: Threshold } = await import('../../src/components/lesson/viz/widgets/ml/Threshold.jsx');
    const html = renderToStaticMarkup(React.createElement(Threshold, { props: { table: TEMPS, attr: 'Temperature', target: 'Play' }, predict: true }));
    expect(html).toContain('data-widget="ml-threshold"');
    expect(html).toContain('mlw4-chip');
    expect(html).toContain('<button type="button" class="mlw4-chip"');
    expect(html).not.toContain('data-mark="ig"');
    expect(html).toMatch(/viz-btn viz-btn-primary" disabled/);
  });
  it('without predict the first frame has Next open', async () => {
    const { default: Threshold } = await import('../../src/components/lesson/viz/widgets/ml/Threshold.jsx');
    const html = renderToStaticMarkup(React.createElement(Threshold, { props: { table: TEMPS, attr: 'Temperature', target: 'Play' }, predict: false }));
    expect(html).not.toMatch(/viz-btn viz-btn-primary" disabled/);
    expect(html).not.toContain('<button type="button" class="mlw4-chip"');
  });
  it('the end state with reduced motion shows the zones and the tests', async () => {
    const { Stage } = await import('../../src/components/lesson/viz/widgets/ml/Threshold.jsx');
    const W = mlThreshold({ table: TEMPS, attr: 'Temperature', target: 'Play' });
    const html = renderToStaticMarkup(React.createElement(Stage, { W, frame: W.frames[W.frames.length - 1] }));
    expect(html).toContain('data-mark="tests" data-value="2"');
    expect(html).toContain('data-mark="zones" data-value="3"');
    expect([...html.matchAll(/data-mark="boundary" data-value="([^"]*)"/g)].map((m) => m[1])).toEqual(['54', '85']);
  });
});

describe('review fixes', () => {
  const temps = mlThreshold({ table: TEMPS, attr: 'Temperature', target: 'Play' });
  const e448 = mlThreshold({ table: P48, attr: 'X1', target: 'Y', plane: { x: 'X1', y: 'X2' } });
  const igNums = (f) => f.cands.filter((c) => c.ig !== undefined).map((c) => String(Number(c.ig.toFixed(4))));
  it('a node after the root with two or more tests asks for the winner before its IG shows (outline L14: predict the winner, then the line is drawn)', () => {
    const f = e448.frames[2];
    expect(f.ask.options.map((o) => o.key)).toEqual(['X1@2.5', 'X1@4', 'X2@1.5', 'X2@2.5']);
    for (const lang of ['en', 'ro']) for (const n of igNums(f)) expect(f.ask.caption[lang]).not.toContain(n);
    expect(f.ask.caption.ro).toContain('X1 ≤ 2.5, X1 ≤ 4, X2 ≤ 1.5, X2 ≤ 2.5');
    // a node with one candidate (85 in the temperatures) has nothing to ask
    expect(temps.frames[3].ask).toBeUndefined();
  });
  it('the tie counts as right: X1 <= 4 has the same IG as X1 <= 2.5', () => {
    const f = e448.frames[2];
    expect(guessNote(f, 'X1@4').ro).toContain('corect');
    expect(guessNote(f, 'X1@4').ro).toContain('același IG');
    expect(guessNote(f, 'X2@1.5').ro).toContain('0.0441');
  });
  it('the threshold inside the run asks first whether its IG is smaller or larger (outline C5)', () => {
    const f = temps.frames[2];
    expect(f.kind).toBe('contrast');
    expect(f.ask.options.map((o) => o.key)).toEqual(['lower', 'higher']);
    expect(f.ask.caption.en).not.toContain('0.0817');
    expect(f.ask.caption.en).toContain('0.4591');
    expect(guessNote(f, 'lower').ro).toContain('corect');
    expect(guessNote(f, 'higher').ro).not.toContain('corect');
  });
  it('while it asks, the stage hides the IG of the node and does not draw its line', async () => {
    const { Stage } = await import('../../src/components/lesson/viz/widgets/ml/Threshold.jsx');
    const f = e448.frames[2];
    const hidden = renderToStaticMarkup(React.createElement(Stage, { W: e448, frame: f, revealed: false, onPick: () => {} }));
    expect(hidden).not.toContain('data-mark="ig"');
    expect([...hidden.matchAll(/data-mark="boundary" data-value="([^"]*)"/g)].map((m) => m[1])).toEqual(['3.5']);
    for (const n of numbers(f.ask.caption.ro)) expect(marks(hidden).has(n), `${n} in ${f.ask.caption.ro}`).toBe(true);
    const shown = renderToStaticMarkup(React.createElement(Stage, { W: e448, frame: f }));
    expect([...shown.matchAll(/data-mark="boundary" data-value="([^"]*)"/g)].map((m) => m[1])).toEqual(['3.5', '2.5']);
    const c = temps.frames[2];
    const ch = renderToStaticMarkup(React.createElement(Stage, { W: temps, frame: c, revealed: false, onPick: () => {} }));
    expect(ch).not.toContain('data-value="0.0817"');
    for (const n of numbers(c.ask.caption.ro)) expect(marks(ch).has(n), `${n} in ${c.ask.caption.ro}`).toBe(true);
  });
  it('the zones on the axis read as intervals, as in the outline: (−∞, 54] No, (54, 85] Yes, (85, ∞) No', () => {
    const z = temps.frames[temps.frames.length - 1];
    expect(z.caption.ro).toContain('(−∞, 54] → No; (54, 85] → Yes; (85, ∞) → No');
    expect(z.caption.ro).not.toContain('&');
  });
  it('the plane draws the coordinates of its points on the axes', async () => {
    const { Stage } = await import('../../src/components/lesson/viz/widgets/ml/Threshold.jsx');
    const html = renderToStaticMarkup(React.createElement(Stage, { W: e448, frame: e448.frames[0] }));
    expect([...html.matchAll(/data-mark="tick-x" data-value="([^"]*)"/g)].map((m) => m[1])).toEqual(['1', '2', '3', '4', '5']);
    expect([...html.matchAll(/data-mark="tick-y" data-value="([^"]*)"/g)].map((m) => m[1])).toEqual(['1', '2', '3', '4']);
  });
  it('the inside-run sentence speaks of the label changes at the ends of the run', () => {
    expect(temps.frames[2].caption.en).toContain('at its ends');
  });
});

describe('css of the w4 widgets', () => {
  it('coloured or muted text uses the ink tokens, never a raw lesson token or the bare muted colour', async () => {
    const { readFileSync } = await import('node:fs');
    const css = readFileSync(new URL('../../src/components/lesson/viz/widgets/ml/ml-w4.css', import.meta.url), 'utf8');
    const colours = [...css.matchAll(/(?:^|[;{\s])(?:color|fill):\s*([^;}]+)/g)].map((m) => m[1]).filter((v) => !/none/.test(v));
    expect(colours.length).toBeGreaterThan(5);
    for (const c of colours) expect(c).not.toMatch(/var\(--lt-(keep|drop|hint|acc|t\d)\)|--theme-muted-text/);
    const idx = readFileSync(new URL('../../src/index.css', import.meta.url), 'utf8');
    for (const k of ['keep', 'drop', 'hint']) expect(idx).toContain(`--ml-${k}-ink: color-mix(in srgb, var(--lt-${k}) 70%, var(--theme-content-text));`);
    expect(idx).toContain('--ml-muted-ink: color-mix(in srgb, var(--theme-muted-text) 60%, var(--theme-content-text));');
    expect(css).toMatch(/\.mlw4-plot \{[^}]*max-width/);
  });
});
