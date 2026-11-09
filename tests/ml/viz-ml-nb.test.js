import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { validateViz } from '../../src/components/lesson/viz/vizSpec.js';
import Fraction from '../../src/ml/calc/fraction.js';
import { nbScore, nbProb, paramsNB, paramsJoint } from '../../src/ml/calc/mathKit.js';
import { classScores, errorTable, factor, factorRows, jointRows, nbFrames, nbModel, nbProblems, paramCounts, paramsFrame, parseRow } from '../../src/components/lesson/viz/logic/ml/nb.js';
import { L_EN, L_RO, fmtNum, numberTokens } from '../../src/components/lesson/viz/logic/ml/numbers-bilingual.js';

vi.mock('../../src/lesson/useLessonStore', async () => {
  const { createLessonStore } = await import('../../src/lesson/store.js');
  const m = new Map();
  const store = createLessonStore({ getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { m.set(k, String(v)); } });
  return { useLessonStore: () => store, getLessonStore: () => store };
});
vi.mock('../../src/contexts/AppContext', () => ({ useApp: () => ({ t: (en, ro) => ro }) }));

const { default: Nb, NbStage } = await import('../../src/components/lesson/viz/widgets/ml/Nb.jsx');

// the outline's own examples
const P20 = { columns: ['x', 'y', 'z', 'U'], rows: [[1, 0, 0, 0], [0, 1, 1, 0], [0, 0, 1, 0], [1, 0, 0, 1], [0, 0, 1, 1], [0, 1, 0, 1], [1, 1, 0, 1]] };
const T21 = { columns: ['A', 'B', 'Y'], rows: [[1, 0, 0], [1, 1, 1], [0, 1, 1], [1, 1, 2], [2, 1, 2]] };
const T20C = { columns: ['X1', 'X2', 'Y', 'P'], rows: [[0, 0, 0, 0.56], [1, 1, 0, 0.24], [0, 0, 1, 0.06], [1, 1, 1, 0.14]] };
const JOINT = { table: P20, target: 'U', row: 'x=0 & y=1 & z=0', modes: ['joint'] };
const LAPLACE = { table: T21, target: 'Y', row: 'A=0 & B=0', modes: ['laplace'] };
const ERRORS = { table: T20C, target: 'Y', row: 'X1=1', modes: ['errors'] };
const frac = (s) => new Fraction(s);
const h = React.createElement;
const stage = (model, frame, extra = {}) => renderToStaticMarkup(h(NbStage, { model, frame, t: (en) => en, L: L_EN, ...extra }));
const widget = (props, predict) => renderToStaticMarkup(h(Nb, { props, predict }));

const block = (props) => ({ type: 'viz', id: 'ml-l20-nb', widget: 'ml-nb', predict: true, props });
const strip = (html) => html.replace(/<[^>]+>/g, ' ');
const markFor = (html, key) => {
  const m = new RegExp(`data-key="${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*data-value="([^"]*)"`).exec(html);
  return m ? m[1] : null;
};

describe('ml-nb spec', () => {
  it('accepts the outline props for L20, L21 and L22', () => {
    expect(validateViz(block(JOINT))).toEqual([]);
    expect(validateViz(block(LAPLACE))).toEqual([]);
    expect(validateViz(block(ERRORS))).toEqual([]);
    expect(validateViz(block({ ...JOINT, row: { x: 0, y: 1, z: 0 } }))).toEqual([]);
  });
  it('rejects a missing prop and a bad mode', () => {
    for (const k of ['table', 'target', 'row', 'modes']) {
      const p = { ...JOINT };
      delete p[k];
      expect(validateViz(block(p)).join(' ')).toMatch(new RegExp(k));
    }
    expect(validateViz(block({ ...JOINT, modes: ['nope'] })).join(' ')).toMatch(/modes/);
    expect(validateViz(block({ ...JOINT, modes: [] })).join(' ')).toMatch(/modes/);
  });
  it('rejects a row naming a column that is not an attribute, an unknown target and add-one on a P table', () => {
    expect(validateViz(block({ ...JOINT, row: 'q=1' })).join(' ')).toMatch(/not an attribute/);
    expect(validateViz(block({ ...JOINT, target: 'nope' })).join(' ')).toMatch(/target/);
    expect(nbProblems({ ...ERRORS, modes: ['laplace'] }).join(' ')).toMatch(/P column/);
  });
  it('reads the row in both forms', () => {
    expect(parseRow('x=0 & y=1')).toEqual([['x', '0'], ['y', '1']]);
    expect(parseRow({ x: 0, y: 1 })).toEqual([['x', '0'], ['y', '1']]);
  });
});

describe('ml-nb logic: L20 (P20, instance x=0 y=1 z=0)', () => {
  const m = nbModel(JOINT);
  it('Joint Bayes finds one identical row, of class 1', () => {
    const J = jointRows(m, m.pairs);
    expect(J.ids).toEqual([5]);
    expect(J.rows.map((r) => r.n)).toEqual([0, 1]);
    expect(J.probs.map(String)).toEqual(['0', '1']);
  });
  it('priors 3/7 and 4/7, factors as the outline, scores 2/63 and 3/28, probabilities 8/35 and 27/35', () => {
    const S = classScores(m, m.pairs);
    expect(S.rows.map((r) => r.prior.toString())).toEqual(['3/7', '4/7']);
    expect(S.rows[0].factors.map((f) => f.p.toString())).toEqual(['2/3', '1/3', '1/3']);
    expect(S.rows[1].factors.map((f) => f.p.toString())).toEqual(['1/2', '1/2', '3/4']);
    expect(S.rows.map((r) => r.score.toString())).toEqual(['2/63', '3/28']);
    expect(S.rows[0].score.toNumber()).toBeCloseTo(0.0317, 4);
    expect(S.rows[1].score.toNumber()).toBeCloseTo(0.1071, 4);
    expect(S.probs.map(String)).toEqual(['8/35', '27/35']);
    expect(S.decision).toBe(1);
  });
  it('agrees with mathKit on every score and probability', () => {
    const S = classScores(m, m.pairs);
    S.rows.forEach((r, i) => {
      expect(r.score.equals(nbScore(P20, 'U', 'x=0 & y=1 & z=0', r.cls))).toBe(true);
      expect(S.probs[i].equals(nbProb(P20, 'U', 'x=0 & y=1 & z=0', r.cls))).toBe(true);
    });
  });
  it('with only x both calculators say 1/2', () => {
    const f = nbFrames(JOINT).frames.find((x) => x.id === 'joint-6');
    expect(f.state.nb.probs[0].toString()).toBe('1/2');
    expect(f.state.joint.probs[0].toString()).toBe('1/2');
    expect(f.caption.en).toContain('The same number');
  });
  it('a factor counts the rows of its class and, among them, those with the value', () => {
    const r = factorRows(m, 0, 'x', '0');
    expect(r.inClass).toEqual([0, 1, 2]);
    expect(r.withValue).toEqual([1, 2]);
  });
  it('parameter counter: 2n+1 and 2^(n+1)-1 (21 and 2047 at n=10, 11 and 63 at n=5, 7 and 15 at n=3)', () => {
    expect(paramCounts(10)).toEqual({ n: 10, nb: 21, joint: 2047 });
    expect(paramCounts(5)).toEqual({ n: 5, nb: 11, joint: 63 });
    expect(paramCounts(3)).toEqual({ n: 3, nb: 7, joint: 15 });
    expect(paramCounts(4)).toEqual({ n: 4, nb: 9, joint: 31 });
    for (let n = 1; n <= 10; n++) { expect(paramCounts(n).nb).toBe(paramsNB(n, 2)); expect(paramCounts(n).joint).toBe(paramsJoint(n, 2)); }
  });
  it('the slider frame is rebuilt from n and its caption follows it', () => {
    const f = paramsFrame(5);
    expect(f.caption.en).toContain('d = 5');
    expect(f.caption.en).toContain('= 11');
    expect(f.caption.en).toContain('= 63');
    expect(markFor(stage(m, f, { n: 5 }), 'params-joint')).toBe('63');
  });
});

describe('ml-nb logic: L21 (T21T2 7, instance A=0 B=0)', () => {
  const m = nbModel(LAPLACE);
  it('without add-one all three scores are 0 and the posterior is 0/0', () => {
    const S = classScores(m, m.pairs, false);
    expect(S.rows.map((r) => r.score.toString())).toEqual(['0', '0', '0']);
    expect(S.undefinedPosterior).toBe(true);
    expect(S.probs).toBeNull();
  });
  it('with add-one: factors 1/4, 2/3, 2/5, 1/4, 1/5, 1/4; scores 1/30, 1/25, 1/50; decision Y=1 with 3/7', () => {
    const S = classScores(m, m.pairs, true);
    expect(S.rows.flatMap((r) => r.factors.map((f) => f.p.toString()))).toEqual(['1/4', '2/3', '2/5', '1/4', '1/5', '1/4']);
    expect(S.rows.map((r) => r.score.toString())).toEqual(['1/30', '1/25', '1/50']);
    expect(S.sum.toString()).toBe('7/75');
    expect(S.probs.map(String)).toEqual(['5/14', '3/7', '3/14']);
    expect(S.decision).toBe(1);
  });
  it('the first smoothed factor is (0+1)/(1+3)', () => {
    const f = factor(m, 'A', '0', 0, true);
    expect([f.count, f.size, f.k, f.p.toString()]).toEqual([0, 1, 3, '1/4']);
  });
  it('agrees with mathKit with the laplace option', () => {
    const S = classScores(m, m.pairs, true);
    S.rows.forEach((r) => expect(r.score.equals(nbScore(T21, 'Y', 'A=0 & B=0', r.cls, { laplace: true }))).toBe(true));
  });
  it('the sum panel: 2/5 + 2/5 + 1/5 = 1, and with 1 only on the numerator 1 + 1 + 1/2 = 5/2', () => {
    const f = nbFrames(LAPLACE).frames.find((x) => x.id === 'laplace-5');
    expect(f.state.smooth.map(String)).toEqual(['2/5', '2/5', '1/5']);
    expect(f.state.sumSmooth.toString()).toBe('1');
    expect(f.state.naive.map(String)).toEqual(['1', '1', '1/2']);
    expect(f.state.sumNaive.toString()).toBe('5/2');
  });
});

describe('ml-nb logic: L22 (T20C 3, true P(Y)=0.8/0.2)', () => {
  const m = nbModel(ERRORS);
  const base = errorTable(m, ['X1']);
  const full = errorTable(m, ['X1', 'X2']);
  it('NB decides 0 for both values of X1; the error is 0.20 (cells 0.06 + 0.14)', () => {
    expect(base.cells.map((c) => c.nbDecision)).toEqual([0, 0]);
    expect(base.cells.map((c) => c.truth.map(String))).toEqual([['14/25', '3/50'], ['6/25', '7/50']]);
    expect(base.errTrue.toNumber()).toBeCloseTo(0.2, 12);
  });
  it('with the copy the cell (1,1) flips to 1: scores 0.072 and 0.098', () => {
    const c = full.cells.find((x) => x.label === 'X1=1, X2=1');
    expect(c.nb.map((v) => v.toNumber())).toEqual([0.072, 0.098]);
    expect(c.nbDecision).toBe(1);
    const c00 = full.cells[0];
    expect(c00.nb.map((v) => v.toNumber())).toEqual([0.392, 0.018]);
  });
  it('the two error numbers: 0.30 against the true P, 0.174 against P_NB', () => {
    expect(full.errTrue.toNumber()).toBeCloseTo(0.3, 12);
    expect(full.errNB.toNumber()).toBeCloseTo(0.174, 12);
    expect(full.errNB.toString()).toBe('87/500');
  });
  it('Joint Bayes keeps 0.20 with the copy', () => {
    expect(full.errJB.toNumber()).toBeCloseTo(0.2, 12);
    expect(base.errJB.toNumber()).toBeCloseTo(0.2, 12);
    expect(nbFrames(ERRORS).frames.at(-1).caption.en).toContain('the same as without the copy');
  });
  it('the impossible cells (0,1) and (1,0) get P_NB mass but no true mass', () => {
    const c = full.cells.find((x) => x.label === 'X1=0, X2=1');
    expect(c.truth.map((v) => v.toNumber())).toEqual([0, 0]);
    expect(c.nb.map((v) => v.toNumber())).toEqual([0.168, 0.042]);
  });
  it('L22 quiz numbers: P(Y)=.9/.1, copy of X1 raises the NB error from 0.1 to 0.21', () => {
    const T = { columns: ['X1', 'X2', 'Y', 'P'], rows: [[0, 0, 0, 0.72], [1, 1, 0, 0.18], [0, 0, 1, 0.03], [1, 1, 1, 0.07]] };
    const mm = nbModel({ table: T, target: 'Y', row: 'X1=1', modes: ['errors'] });
    expect(errorTable(mm, ['X1']).errTrue.toNumber()).toBeCloseTo(0.1, 12);
    expect(errorTable(mm, ['X1', 'X2']).errTrue.toNumber()).toBeCloseTo(0.21, 12);
  });
});

describe('ml-nb frames: captions say what is drawn', () => {
  const cases = [['joint', JOINT], ['laplace', LAPLACE], ['errors', ERRORS]];
  for (const [name, props] of cases) {
    const { model, frames } = nbFrames(props);
    const html = (f) => stage(model, f);
    it(`${name}: every cited figure is a mark with the same data-value, and the caption quotes it`, () => {
      for (const f of frames) {
        const h = html(f);
        for (const c of f.cites) {
          expect(markFor(h, c.key), `${f.id} ${c.key}`).toBe(c.value);
          if (c.key.startsWith('decision:')) continue;
          const asNum = c.value !== "0/0" && /^-?\d+(\/\d+)?$/.test(c.value) ? fmtNum(frac(c.value), 4, 'en') : null;
          const hits = [c.value, asNum].filter(Boolean);
          expect(hits.some((x) => f.caption.en.includes(x)), `${f.id}: caption quotes ${c.key} = ${c.value}`).toBe(true);
        }
      }
    });
    it(`${name}: every number in a caption is a number the stage shows (or a formula constant)`, () => {
      for (const f of frames) {
        const seen = new Set(numberTokens(strip(html(f)) + ' ' + [...html(f).matchAll(/data-value="([^"]*)"/g)].map((x) => x[1]).join(' ')));
        for (const tok of numberTokens(f.caption.en)) {
          if (seen.has(tok) || tok === '1' || tok === '2') continue;
          // an English decimal of a cited fraction
          const ok = f.cites.some((c) => /\//.test(c.value) && fmtNum(frac(c.value), 4, 'en') === tok);
          expect(ok || [...seen].some((s) => /\//.test(s) && fmtNum(frac(s), 4, 'en') === tok), `${f.id}: ${tok} in "${f.caption.en}"`).toBe(true);
        }
      }
    });
    it(`${name}: English and Romanian carry the same numbers`, () => {
      for (const f of frames) {
        for (const k of ['caption', 'ask']) {
          if (!f[k]) continue;
          expect(numberTokens(f[k].ro).sort(), `${f.id} ${k}`).toEqual(numberTokens(f[k].en).sort());
          expect(f[k].ro).not.toMatch(/\d\.\d/);
        }
      }
    });
    it(`${name}: a caption does not give away what the question before it asks to predict`, () => {
      frames.forEach((f, k) => {
        if (k === 0) return;
        const prev = frames[k - 1];
        const hidden = f.cites.map((c) => c.value).filter((v) => /\//.test(v) && !prev.cites.some((c) => c.value === v));
        for (const v of hidden) {
          expect(prev.caption.en + ' ' + (prev.ask ? prev.ask.en : ''), `${prev.id} leaks ${v}`).not.toContain(` ${v}`);
        }
      });
    });
  }
  it('Romanian writes a decimal comma and the outline terms', () => {
    const f = nbFrames(ERRORS).frames.find((x) => x.id === 'errors-4');
    expect(f.caption.ro).toContain('0,174');
    expect(f.caption.ro).toContain('Eroarea față de distribuția adevărată');
    expect(L_RO.n(0.5)).toBe('0,5');
    expect(L_EN.n(0.5)).toBe('0.5');
  });
});

describe('ml-nb review fixes', () => {
  const ro = (model, f, extra = {}) => renderToStaticMarkup(h(NbStage, { model, frame: f, t: (en, r) => r, L: L_RO, ...extra }));
  const heads = (html) => [...html.matchAll(/<th>(.*?)<\/th>/g)].map((x) => x[1]);
  it('the error table names its columns as joint probabilities and puts the decisions right after the cell', () => {
    const { model, frames } = nbFrames(ERRORS);
    expect(heads(stage(model, frames.find((x) => x.id === 'errors-0')))).toEqual(['X1', 'Naive Bayes', 'P(X1, Y=0)', 'P(X1, Y=1)']);
    expect(heads(stage(model, frames.find((x) => x.id === 'errors-3')))).toEqual(['X1, X2', 'Naive Bayes', 'P(X1, X2, Y=0)', 'P(X1, X2, Y=1)', 'P<sub>NB</sub>(X1, X2, Y=0)', 'P<sub>NB</sub>(X1, X2, Y=1)']);
    expect(heads(stage(model, frames.at(-1)))).toEqual(['X1, X2', 'Naive Bayes', 'Joint Bayes', 'P(X1, X2, Y=0)', 'P(X1, X2, Y=1)']);
    for (const f of frames) expect(stage(model, f), f.id).not.toContain('P_NB');
  });
  it('with the copy, the caption names the cell that flipped and its two scores, not all eight numbers', () => {
    const f = nbFrames(ERRORS).frames.find((x) => x.id === 'errors-3');
    expect(f.caption.en).toContain('The decision of X1=1, X2=1 changed to Y=1: P_NB is 0.072 for Y=0 and 0.098 for Y=1.');
    expect(f.caption.ro).toContain('Decizia celulei X1=1, X2=1 s-a schimbat în Y=1: P_NB este 0,072 pentru Y=0 și 0,098 pentru Y=1.');
    expect(f.caption.en).not.toContain('0.392');
    expect(f.cites.map((c) => c.key)).toEqual(['nb:X1=1, X2=1:0', 'nb:X1=1, X2=1:1']);
  });
  it('Romanian labels: the error boxes, Joint Bayes error, the factor hint', () => {
    const { model, frames } = nbFrames(ERRORS);
    expect(ro(model, frames.find((x) => x.id === 'errors-4'))).toContain('eroarea față de distribuția adevărată');
    expect(ro(model, frames.find((x) => x.id === 'errors-4'))).toContain('eroarea față de P<sub>NB</sub>');
    expect(ro(model, frames.at(-1))).toContain('Rata erorii la Bayes Optimal');
    const j = nbFrames(JOINT);
    const hint = ro(j.model, j.frames.find((x) => x.id === 'joint-3'));
    expect(hint).toContain('evidențiezi');
    expect(hint).not.toContain('luminezi');
  });
  it('the parameter counter writes 2ᵈ⁺¹ − 1 with d as the lessons do, not 2^(n+1)', () => {
    expect(paramsFrame(10).caption.en).toContain('2ᵈ⁺¹ − 1 = 2047');
    expect(paramsFrame(10).caption.ro).toContain('2ᵈ⁺¹ − 1 = 2047');
    expect(paramsFrame(10).caption.en).not.toContain('^');
  });
  it('a negative number prints with the minus sign', () => {
    expect(L_RO.n(-0.3219)).toBe('−0,3219');
    expect(L_EN.n(-0.3219)).toBe('−0.3219');
    expect(numberTokens('−0,3219')).toEqual(['0.3219']);
  });
});

describe('ml-nb render', () => {
  it('first frame with predict: the question is a pick of its own and Next is locked until the right pick', () => {
    const html = widget(JOINT, true);
    expect(html).toContain('data-widget="ml-nb"');
    expect(html).toContain('mlv-picks');
    expect(html).toMatch(/viz-btn-primary" disabled/);
    expect(html).not.toContain('Arată-mi');
    expect(html).not.toContain('data-key="score:0"');
    expect(html).toContain('Instanța');
  });
  it('first frame without predict shows Next enabled', () => {
    const html = widget(JOINT, false);
    expect(html).toContain('Mai departe');
    expect(html).not.toMatch(/Mai departe<\/span>[^]*disabled/);
  });
  it('the end state (last frame) draws every mark the caption cites', () => {
    for (const props of [JOINT, LAPLACE, ERRORS]) {
      const { model, frames } = nbFrames(props);
      const f = frames.at(-1);
      const h = stage(model, f, { t: (en, ro) => ro, L: L_RO });
      for (const c of f.cites) expect(markFor(h, c.key)).toBe(c.value);
    }
  });
  it('a factor is a 44 px button and a chosen one lights its rows', () => {
    const { model, frames } = nbFrames(JOINT);
    const f = frames.find((x) => x.id === 'joint-3');
    const h = stage(model, f, { sel: { cls: 0, attr: 'x', lit: '0' }, onSel: () => {} });
    expect(h).toContain('mlnb-factor sel');
    expect((h.match(/data-lit="1"/g) || []).length).toBe(2);
  });
  it('uses no colour literals', async () => {
    const fs = await import('node:fs');
    for (const p of ['src/components/lesson/viz/widgets/ml/nb.css', 'src/components/lesson/viz/widgets/ml/Nb.jsx']) {
      expect(fs.readFileSync(p, 'utf8'), p).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(|opacity-/);
    }
  });
});

describe('ml-nb second review: data on screen, 390 px, Romanian, contrast', () => {
  const ro = (model, f, extra = {}) => renderToStaticMarkup(h(NbStage, { model, frame: f, t: (en, r) => r, L: L_RO, ...extra }));
  const heads = (html) => [...html.matchAll(/<th(?: [^>]*)?>(.*?)<\/th>/g)].map((x) => x[1]);
  it('the one-attribute answer shows the table with the rows that have x=0 lit (the data the question is about)', () => {
    const { model, frames } = nbFrames(JOINT);
    const f = frames.find((x) => x.id === 'joint-6');
    const html = stage(model, f);
    expect(html).toContain('<table');
    expect([...html.matchAll(/data-row="(\d+)"[^>]*data-lit="1"/g)].map((x) => Number(x[1]))).toEqual([1, 2, 4, 5]);
  });
  it('the factor question reads as a count: how many rows of the class have the value', () => {
    const f = nbFrames(JOINT).frames.find((x) => x.id === 'joint-2');
    expect(f.ask.en).toBe('Predict: how many rows of class U=0 have x=0? So what is P(x=0 | U=0)?');
    expect(f.ask.ro).toBe('Prezice: câte rânduri din clasa U=0 au x=0? Deci cât este P(x=0 | U=0)?');
  });
  it('the parameter counter agrees its nouns with the numbers (21 de parametri, 1 atribut binar)', () => {
    expect(paramsFrame(10).caption.ro).toContain('Cu d = 10 atribute binare și o clasă binară: Bayes Naiv 2d + 1 = 21 de parametri liberi, Bayes Optimal 2ᵈ⁺¹ − 1 = 2047.');
    expect(paramsFrame(5).caption.ro).toContain('= 11 parametri liberi');
    expect(paramsFrame(1).caption.ro).toContain('Cu d = 1 atribut binar și o clasă binară');
    expect(paramsFrame(1).caption.en).toContain('With d = 1 binary attribute and a binary class');
    expect(paramsFrame(10).caption.en).toContain('= 21 free parameters');
  });
  it('the factor table fits a phone: the class cell is the bare value, headers have no spaces, a smoothed factor breaks after its fraction', () => {
    const j = nbFrames(JOINT);
    const html = stage(j.model, j.frames.find((x) => x.id === 'joint-3'));
    expect(heads(html).slice(-5)).toEqual(['Class', 'P(U)', 'P(x=0|<wbr/>U)', 'P(y=1|<wbr/>U)', 'P(z=0|<wbr/>U)']);
    expect(html).toMatch(/<td>0<\/td><td class="num" data-key="prior:0"/);
    const l = nbFrames(LAPLACE);
    const sm = stage(l.model, l.frames.find((x) => x.id === 'laplace-3'));
    expect(sm).toContain('<span class="mlnb-calc">(0+1)/(1+3)</span><span class="mlnb-eq">= 1/4</span>');
  });
  it('the error table names the cell by its values under an X1, X2 header; Joint Bayes view drops the P_NB columns', () => {
    const { model, frames } = nbFrames(ERRORS);
    const e3 = stage(model, frames.find((x) => x.id === 'errors-3'));
    expect(heads(e3)).toEqual(['X1, X2', 'Naive Bayes', 'P(X1, X2, Y=0)', 'P(X1, X2, Y=1)', 'P<sub>NB</sub>(X1, X2, Y=0)', 'P<sub>NB</sub>(X1, X2, Y=1)']);
    expect(e3).toContain('<td>1, 1</td>');
    const e5 = stage(model, frames.at(-1));
    expect(heads(e5)).toEqual(['X1, X2', 'Naive Bayes', 'Joint Bayes', 'P(X1, X2, Y=0)', 'P(X1, X2, Y=1)']);
  });
  it('with the copy, the two P_NB scores of the cell that flipped are shown under the table too (they scroll out of view at 390 px)', () => {
    const { model, frames } = nbFrames(ERRORS);
    const html = ro(model, frames.find((x) => x.id === 'errors-3'));
    const line = /<div class="mlnb-line flip"[^>]*>(.*?)<\/div>/.exec(html)?.[1] ?? '';
    expect(line.replace(/<[^>]+>/g, '')).toBe('X1=1, X2=1: PNB(Y=0) = 0,072; PNB(Y=1) = 0,098 → Y=1');
    expect(line).toContain('data-key="flip-nb:0" data-value="9/125"');
    expect(line).toContain('data-key="flip-nb:1" data-value="49/500"');
  });
  it('the errors mode only takes attributes that copy the first one (the frames describe a duplicated attribute)', () => {
    const T = { columns: ['S', 'W', 'R', 'Y', 'P'], rows: [[0, 0, 1, 0, 0.5], [1, 1, 0, 1, 0.5]] };
    expect(nbProblems({ table: T, target: 'Y', row: 'S=1', modes: ['errors'] }).join(' ')).toMatch(/copy of S/);
    expect(nbProblems(ERRORS)).toEqual([]);
  });
  it('the sum frame of add-one shows the table with the rows of the class lit, and each smoothed term as a fraction', () => {
    const { model, frames } = nbFrames(LAPLACE);
    const f = frames.find((x) => x.id === 'laplace-5');
    const html = stage(model, f);
    expect([...html.matchAll(/<tr class="([^"]*)" data-row="(\d+)"/g)].filter((x) => x[1] !== 'dim').map((x) => Number(x[2]))).toEqual([1, 2]);
    expect(html).toContain('A=0: (1+1)/(2+3) = 2/5');
    expect(html).toContain('A=2: (0+1)/(2+3) = 1/5');
  });
  it('the sum question says what to add in Romanian (the smoothed probabilities, then the sum again with 1 only on the numerator)', () => {
    const f = nbFrames(LAPLACE).frames.find((x) => x.id === 'laplace-4');
    expect(f.ask.ro).toBe('Prezice: adună probabilitățile netezite P(A=v | Y=1) pentru cele 3 valori ale lui A. Apoi refă suma adăugând 1 doar la numărător.');
    expect(f.ask.en).toBe('Predict: add up the smoothed probabilities P(A=v | Y=1) over the 3 values of A. Then redo the sum adding 1 only to the numerator.');
  });
  it('lane-owned text keeps AA contrast: error cells and indicator labels use the content colour, not the drop or muted colour on a tinted fill', async () => {
    const fs = await import('node:fs');
    const css = fs.readFileSync('src/components/lesson/viz/widgets/ml/nb.css', 'utf8');
    expect(css).toMatch(/\.mlnb-grid td\.bad \{[^}]*color: var\(--theme-content-text\)/);
    expect(css).toMatch(/\.mlnb-ind span \{[^}]*color: var\(--theme-content-text\)/);
  });
});

describe('ml-nb own picks', () => {
  const MODES = { joint: JOINT, laplace: LAPLACE, errors: ERRORS };
  for (const [name, props] of Object.entries(MODES)) {
    it(`${name}: every frame that asks carries a pick whose right option is one of three different options, in both languages`, () => {
      const { frames } = nbFrames(props);
      const asking = frames.filter((f) => f.ask);
      expect(asking.length).toBeGreaterThan(2);
      for (const f of asking) {
        if (!f.pick) continue;
        const ids = f.pick.options.map((o) => o.id);
        expect(new Set(ids).size, f.id).toBe(ids.length);
        expect(ids.length, f.id).toBeGreaterThanOrEqual(2);
        expect(ids, f.id).toContain(f.pick.right);
        for (const o of f.pick.options) { expect(o.label.en.length).toBeGreaterThan(0); expect(o.label.ro.length).toBeGreaterThan(0); }
        expect(f.pick.why.en.length).toBeGreaterThan(0);
        expect(f.pick.why.ro.length).toBeGreaterThan(0);
        expect(f.pick.prompt.ro.length).toBeGreaterThan(0);
      }
    });
  }
  it('joint: the picks are the lesson numbers (identical rows 1, prior 3/7 for U=0, factor 2/3, class, probability)', () => {
    const { frames } = nbFrames(JOINT);
    const right = (id) => frames.find((f) => f.id === id).pick.right;
    const S = classScores(nbModel(JOINT), nbModel(JOINT).pairs, false);
    expect(right('joint-0')).toBe(String(jointRows(nbModel(JOINT), nbModel(JOINT).pairs).ids.length));
    expect(right('joint-1')).toBe('3/7');
    expect(right('joint-3')).toBe(`U=${S.decision}`);
    expect(right('joint-4')).toBe(S.probs[S.rows.findIndex((r) => r.cls === S.decision)].toString());
    expect(right('joint-6')).toBe(`Naive Bayes ${paramsNB(5, 2, 2)}, Optimal Bayes ${paramsJoint(5, 2, 2)}`);
  });
  it('laplace: the add-one factor pick is (count + 1) / (size + values) and the sum pick is 1', () => {
    const { frames } = nbFrames(LAPLACE);
    const m = nbModel(LAPLACE);
    const off = classScores(m, m.pairs, false);
    const zero = off.rows.flatMap((r) => r.factors).find((f) => f.p.sign() === 0);
    expect(frames.find((f) => f.id === 'laplace-2').pick.right).toBe(factor(m, zero.attr, zero.lit, zero.cls, true).p.toString());
    expect(frames.find((f) => f.id === 'laplace-4').pick.right).toBe('1');
  });
  it('errors: the error-rate pick is the sum of the lost numbers and the exam asks for the true distribution', () => {
    const { frames } = nbFrames(ERRORS);
    const m = nbModel(ERRORS);
    // the options are decimals, as in the P column: the id is the English side (decimal point)
    expect(frames.find((f) => f.id === 'errors-1').pick.right).toBe(String(errorTable(m, m.attrs.slice(0, 1)).errTrue.toNumber()));
    expect(frames.find((f) => f.id === 'errors-3').pick.right).toBe('true');
  });
  it('a wrong pick explains and a right pick moves on: the widget shows feedback only after a pick and the pick is in a 44 px button row', () => {
    const html = widget(JOINT, true);
    expect(html).not.toContain('mlnb-fb');
    expect(html).toContain('mlv-opt');
  });
  it('without predict no frame asks for a pick', () => {
    expect(widget(JOINT, false)).not.toContain('mlv-picks');
  });
});

describe('ml-nb review b3: one row, the whole table, d', () => {
  it('a single matching row is "1 rând se potrivește" (ml-g4 s13, the 7-row table)', () => {
    const f = nbFrames(JOINT).frames.find((x) => x.id === 'joint-0');
    expect(f.pick.why.ro).toBe('1 rând se potrivește la toate valorile; coloana clasei nu contează.');
    expect(f.pick.why.en).toBe('1 row matches every value, the class column does not matter.');
  });
  it('the data table is drawn whole: no fixed height, so 16 rows are counted without an inner scroll (crash-p1 s09)', () => {
    const T16 = { columns: ['A', 'B', 'Y'], rows: [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 1, 0], [1, 0, 0], [1, 0, 0], [1, 1, 0], [1, 1, 0], [0, 0, 1], [0, 1, 1], [0, 1, 1], [1, 0, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1]] };
    const html = widget({ table: T16, target: 'Y', row: 'A=1 & B=1', modes: ['joint'] }, true);
    expect(html).toContain('class="viz-tablewrap mlnb-table"');
    expect(html).not.toMatch(/max-height/);
    expect((html.match(/data-row="/g) || []).length).toBe(16);
  });
  it('the parameter pick says 2d + 1 and 2ᵈ⁺¹ − 1, as the lessons do', () => {
    const f = nbFrames(JOINT).frames.find((x) => x.id === 'joint-6');
    expect(f.pick.why.ro).toBe('2d + 1 = 11 și 2ᵈ⁺¹ − 1 = 63, cu d = 5.');
  });
});

describe('roNums: the Romanian decimal comma for the ID3 widgets', () => {
  it('turns the point into a comma and keeps a list of decimals readable', async () => {
    const { roNums } = await import('../../src/components/lesson/viz/logic/ml/numbers-bilingual.js');
    expect(roNums('IG 0.4591, mai mic')).toBe('IG 0,4591, mai mic');
    expect(roNums('praguri: 19.5, 22.5 și 28.5')).toBe('praguri: 19,5; 22,5 și 28,5');
    expect(roNums('(1.5, 4]')).toBe('(1,5; 4]');
    // crash-p1 s30c: the zones of the threshold tree
    expect(roNums('(−∞, 19.5] → nu; (19.5, 28.5] → da; (28.5, ∞) → nu')).toBe('(−∞; 19,5] → nu; (19,5; 28,5] → da; (28,5; ∞) → nu');
    expect(roNums('(−∞, 54] → No')).toBe('(−∞, 54] → No');
    expect(roNums('ε = 0.02')).toBe('ε = 0,02');
    expect(roNums('[3+, 1−] și (0, 1)')).toBe('[3+, 1−] și (0, 1)');
  });
});
