import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { Fraction } from '../../src/ml/calc/fraction.js';
import { evaluate, toNumber } from '../../src/ml/calc/formula.js';

// Every expected value below is a value the book or verified-answers.md gives for that exercise. Four-decimal values are
// compared within 5e-5 (the plan's tolerance); IG(Outlook) = 0.246750 is 0.2467 printed, 4.98e-5 away.
const fixture = (name) => JSON.parse(readFileSync(new URL(`./fixtures/${name}.json`, import.meta.url), 'utf8'));
const PlayTennis = fixture('playtennis'); // ex. 2.27 and 4.54, book p.415 and p.606 (the same 14 days)
const Startup = fixture('startup-451'); // ex. 4.51, book p.602
const X24 = fixture('x-24'); // ex. 2.4, book p.365
const Cold = fixture('cold-057'); // ex. 0.57, book p.134

const scope = { PlayTennis, Startup, X24, Cold };
const val = (expr, extra = {}) => toNumber(evaluate(expr, { ...scope, ...extra }));
const close = (expr, want, tol = 5e-5) => {
  const got = val(expr);
  expect(Math.abs(got - want), `${expr} = ${got}, want ${want}`).toBeLessThanOrEqual(tol);
};
const PT = (f) => `${f}(PlayTennis,'Outlook','EnjoyTennis')`;

describe('Fraction', () => {
  it('reduces, keeps the sign on top and does exact arithmetic', () => {
    expect(new Fraction(18, 34).equals(new Fraction(9, 17))).toBe(true);
    expect(new Fraction(1, -3).toString()).toBe('-1/3');
    expect(new Fraction(1, 3).add(new Fraction(1, 6)).toString()).toBe('1/2');
    expect(new Fraction(1, 3).mul(new Fraction(1, 10)).toString()).toBe('1/30');
    expect(new Fraction(2, 3).div(new Fraction(4, 9)).toString()).toBe('3/2');
    expect(new Fraction(5, 1).toString()).toBe('5');
    expect(new Fraction(3, 5).pow(3).toString()).toBe('27/125');
    expect(new Fraction(3, 5).pow(-2).toString()).toBe('25/9');
  });

  it('reads decimals as written, not as the binary double next to them', () => {
    expect(Fraction.from(0.1).add(Fraction.from(0.2)).equals(Fraction.from(0.3))).toBe(true);
    expect(Fraction.from(2.3).toString()).toBe('23/10');
    expect(new Fraction('0.25').toString()).toBe('1/4');
    expect(new Fraction('9/17').toString()).toBe('9/17');
    expect(Fraction.from(1e-7).toString()).toBe('1/10000000');
  });

  it('converts to the nearest double, also past 2^53', () => {
    expect(new Fraction(9, 17).toNumber()).toBe(9 / 17);
    expect(new Fraction(108, 3125).toNumber()).toBe(0.03456);
    expect(new Fraction(3, 5).pow(60).toNumber()).toBeCloseTo(0.6 ** 60, 25);
    expect(new Fraction(7n * 10n ** 400n, 10n ** 400n).toNumber()).toBe(7);
  });

  it('refuses a zero denominator and a non-integer constructor argument', () => {
    expect(() => new Fraction(1, 0)).toThrow(/division by zero/);
    expect(() => new Fraction(0.5)).toThrow(/integer/);
    expect(() => new Fraction(1, 3).div(new Fraction(0))).toThrow(/division by zero/);
  });
});

describe('the formula language', () => {
  it('keeps fractions exact', () => {
    expect(evaluate('1/3*1/10', {}).equals(new Fraction(1, 30))).toBe(true);
    expect(evaluate('(3/5)^3*(2/5)^2', {}).equals(new Fraction(108, 3125))).toBe(true); // ex. 2.4 d, T0
    expect(evaluate('1*1/3*(2/3)^2*1/4', {}).equals(new Fraction(1, 27))).toBe(true); // ex. 2.4 d, one test
    expect(evaluate('(1/4)^4', {}).equals(new Fraction(1, 256))).toBe(true); // ex. 2.4 d, two tests
    expect(evaluate('0.6*0.5', {}).equals(new Fraction(3, 10))).toBe(true);
  });

  it('follows the usual precedence, with ^ right-associative and tighter than unary minus', () => {
    expect(val('2+3*4')).toBe(14);
    expect(val('(2+3)*4')).toBe(20);
    expect(val('2^3^2')).toBe(512);
    expect(val('-2^2')).toBe(-4);
    expect(val('2^-1')).toBe(0.5);
    expect(val('10-4-3')).toBe(3);
    expect(val('8/4/2')).toBe(1);
  });

  it('compares and reads names, strings, arrays and objects', () => {
    expect(evaluate('1/3 < 0.34', {})).toBe(true);
    expect(evaluate('2/4 == 1/2', {})).toBe(true);
    expect(evaluate("'Sunny' == 'Sunny'", {})).toBe(true);
    expect(evaluate('a != b', { a: 1, b: 2 })).toBe(true);
    expect(val('sum([1,2,3,4])')).toBe(10);
    expect(val('x*2', { x: 0.1 })).toBe(0.2);
    expect(evaluate('true', {})).toBe(true);
  });

  it('has log, exp, roots and the usual helpers', () => {
    expect(val('log2(8)')).toBe(3);
    expect(val('log2(0.125)')).toBe(-3);
    expect(val('ln(1)')).toBe(0);
    expect(val('log10(1000)')).toBeCloseTo(3, 12);
    expect(val('sqrt(16)')).toBe(4);
    expect(val('exp(0)')).toBe(1);
    expect(val('abs(-3/4)')).toBe(0.75);
    expect(val('min(3,1,2)')).toBe(1);
    expect(val('max(3,1,2)')).toBe(3);
    expect(evaluate('sum(1/2,1/3,1/6)', {}).equals(new Fraction(1))).toBe(true);
  });

  it('rejects an unknown function, an unknown name, a bad token and a missing parenthesis', () => {
    expect(() => evaluate('foo(1)', {})).toThrow(/unknown function foo/);
    expect(() => evaluate('bar + 1', {})).toThrow(/unknown name bar/);
    expect(() => evaluate('1 $ 2', {})).toThrow();
    expect(() => evaluate('(1+2', {})).toThrow();
    expect(() => evaluate('1/0', {})).toThrow(/division by zero/);
    expect(() => evaluate('', {})).toThrow();
  });

  it('does not use eval or Function', () => {
    for (const f of ['formula.js', 'mathKit.js', 'fraction.js']) {
      const src = readFileSync(new URL(`../../src/ml/calc/${f}`, import.meta.url), 'utf8').replace(/\/\/.*$/gm, '');
      expect(src, f).not.toMatch(/\beval\s*\(/);
      expect(src, f).not.toMatch(/\bnew\s+Function\b|\bFunction\s*\(/);
    }
    // an expression cannot reach JavaScript either
    expect(() => evaluate('constructor("return 1")()', {})).toThrow();
    expect(() => evaluate('__proto__', {})).toThrow(/unknown name/);
    expect(() => evaluate('x.y', { x: {} })).toThrow();
  });
});

describe('entropy and information gain', () => {
  it('H of a distribution, and of counts', () => {
    close('H(9/14, 5/14)', 0.9403);
    close('H(9, 5)', 0.9403); // integers summing past 1 are counts
    close('H(1/2, 1/2)', 1);
    close('H(1, 0)', 0); // 0*log2(0) is 0; integers summing to 1 are a distribution
    close('H(1/4, 1/4, 1/4, 1/4)', 2);
    close('H([9, 5])', 0.9403);
    expect(() => evaluate('H(1/2, 1/3)', {})).toThrow(/distribution/);
  });

  it('T20C hint, corrected: H(1/5, 4/5) is 0.7219 and H(2/5, 3/5) is 0.9710', () => {
    close('H(1/5, 4/5)', 0.7219);
    close('H(2/5, 3/5)', 0.9710);
  });

  it('PlayTennis: H, IG of every attribute, the best attribute (ex. 4.54 a)', () => {
    close("Hcol(PlayTennis,'EnjoyTennis')", 0.9403);
    close(PT('IG'), 0.2467); // 0.246750, printed 0.2467
    close("IG(PlayTennis,'Humidity','EnjoyTennis')", 0.1518);
    close("IG(PlayTennis,'Wind','EnjoyTennis')", 0.0481);
    close("IG(PlayTennis,'Temperature','EnjoyTennis')", 0.0292);
    expect(evaluate("bestAttr(PlayTennis,'EnjoyTennis')", scope)).toBe('Outlook');
  });

  it('PlayTennis: Hc is the weighted average and IG = H - Hc', () => {
    const hc = val(PT('Hc'));
    expect(hc).toBeCloseTo(0.6935, 4);
    expect(val(PT('IG'))).toBeCloseTo(val("Hcol(PlayTennis,'EnjoyTennis')") - hc, 12);
  });

  it('PlayTennis, Rain node of ex. 4.54 a: Wind 0.9710 against Temperature 0.0200 and Humidity 0.0200', () => {
    const rain = { Rain: evaluate("where(PlayTennis,'Outlook=Rain')", scope) };
    const at = (a) => toNumber(evaluate(`IG(Rain,'${a}','EnjoyTennis')`, rain));
    expect(Math.abs(at('Wind') - 0.9710)).toBeLessThanOrEqual(5e-5);
    expect(Math.abs(at('Temperature') - 0.0200)).toBeLessThanOrEqual(5e-5);
    expect(Math.abs(at('Humidity') - 0.0200)).toBeLessThanOrEqual(5e-5);
    expect(evaluate("bestAttr(Rain,'EnjoyTennis')", rain)).toBe('Wind');
  });

  it('SplitInfo and gain ratio (ex. 4.52 b: Outlook 1.5774 and 0.1564, Wind 0.9852 and 0.0488)', () => {
    close("splitInfo(PlayTennis,'Outlook')", 1.5774);
    close(PT('IGR'), 0.1564);
    close("splitInfo(PlayTennis,'Wind')", 0.9852);
    close("IGR(PlayTennis,'Wind','EnjoyTennis')", 0.0488);
  });

  it('ex. 0.57: H(C), H(T), H(C|T) = 0.82740 (the book prints 0.82715), H(T|C)', () => {
    close("Hcol(Cold,'C')", 0.9710);
    close("Hcol(Cold,'T')", 1.5813);
    close("Hc(Cold,'T','C')", 0.82740);
    close("Hc(Cold,'C','T')", 1.4377);
  });

  it('gini, misclassification and the other impurity measures', () => {
    close('gini(1/2, 1/2)', 0.5);
    close('gini(9, 5)', 1 - (9 / 14) ** 2 - (5 / 14) ** 2);
    close('misclass(1/4, 3/4)', 0.25);
    close('misclass(9, 5)', 5 / 14);
  });

  it('breaks ties between attributes left to right', () => {
    // two attributes that split alike: the left one wins
    const T = { columns: ['A', 'B', 'Y'], rows: [[0, 0, 0], [0, 0, 0], [1, 1, 1], [1, 1, 1]] };
    expect(evaluate("bestAttr(T,'Y')", { T })).toBe('A');
    const T2 = { columns: ['B', 'A', 'Y'], rows: T.rows.map(([a, b, y]) => [b, a, y]) };
    expect(evaluate("bestAttr(T,'Y')", { T: T2 })).toBe('B');
  });
});

describe('thresholds for a continuous attribute', () => {
  it('ex. 4.51 a: 6 thresholds when a value with both labels is a boundary, 5 without', () => {
    expect(evaluate("thresholds(Startup,'Capital','Milionar')", scope)).toEqual([2.1, 2.6, 3.0, 3.25, 4.5, 5.85]);
    expect(evaluate("thresholds(Startup,'Capital','Milionar',{mixedBoundary:true})", scope)).toHaveLength(6);
    expect(evaluate("thresholds(Startup,'Capital','Milionar',{mixedBoundary:false})", scope)).toEqual([2.1, 2.6, 3.25, 4.5, 5.85]);
    expect(val("count(thresholds(Startup,'Capital','Milionar'))")).toBe(6);
  });

  it('ex. 4.51 b: IG of every root candidate', () => {
    const ig = (t) => val(`IG(Startup,'Capital','Milionar',{threshold:${t}})`);
    expect(Math.abs(ig(2.1) - 0.3436)).toBeLessThanOrEqual(5e-5);
    expect(Math.abs(ig(5.85) - 0.1130)).toBeLessThanOrEqual(5e-5);
    expect(Math.abs(ig(2.6) - 0.1043)).toBeLessThanOrEqual(5e-5);
    expect(Math.abs(ig(3.0) - 0.0718)).toBeLessThanOrEqual(5e-5);
    expect(Math.abs(ig(3.25) - 0.0102)).toBeLessThanOrEqual(5e-5);
    expect(Math.abs(ig(4.5) - 0.0041)).toBeLessThanOrEqual(5e-5);
    close("IG(Startup,'Produs','Milionar')", 0.0428);
    close("IG(Startup,'Stiinte','Milionar')", 0.0006);
    close("Hcol(Startup,'Milionar')", 0.9799);
  });

  it('ex. 2.4: the two thresholds and their IG (0.4200, the book truncates it to 0.419)', () => {
    expect(evaluate("thresholds(X24,'X','Y')", scope)).toEqual([2.5, 3.625]);
    close("IG(X24,'X','Y',{threshold:2.5})", 0.4200);
    close("IG(X24,'X','Y',{threshold:3.625})", 0.171);
  });
});

describe('ID3, training error and CVLOO', () => {
  const dt2 = (tie) => `{continuous:['X'], maxDepth:1, tie:'${tie}'}`;
  const dtStar = "{continuous:['X']}";

  it('ex. 2.4 a, DT2: training error 1 of 5; CVLOO 1 of 5 with a tied leaf going to class 0, 3 of 5 to class 1', () => {
    expect(val(`trainErrId3(X24,'Y',${dt2('class0')})`)).toBe(1);
    expect(val(`cvlooId3(X24,'Y',${dt2('class0')})`)).toBe(1);
    expect(val(`cvlooId3(X24,'Y',${dt2('class1')})`)).toBe(3);
  });

  it('ex. 2.4 b, DT*: training error 0, CVLOO 2 of 5', () => {
    expect(val(`trainErrId3(X24,'Y',${dtStar})`)).toBe(0);
    expect(val(`cvlooId3(X24,'Y',${dtStar})`)).toBe(2);
  });

  it('PlayTennis is consistent, so the full tree has training error 0', () => {
    expect(val("trainErrId3(PlayTennis,'EnjoyTennis')")).toBe(0);
  });

  it('ex. 4.51 b: the full tree has root Capital <= 2.1 and 4 test nodes', () => {
    expect(evaluate("id3Root(Startup,'Milionar',{continuous:['Capital']})", scope)).toEqual({ attr: 'Capital', threshold: 2.1 });
    expect(val("id3Tests(Startup,'Milionar',{continuous:['Capital']})")).toBe(4);
  });

  it('ex. 4.54: the PlayTennis tree has 3 test nodes (Outlook, then Humidity under Sunny and Wind under Rain)', () => {
    expect(evaluate("id3Root(PlayTennis,'EnjoyTennis')", scope)).toEqual({ attr: 'Outlook' });
    expect(val("id3Tests(PlayTennis,'EnjoyTennis')")).toBe(3);
  });
});

describe('Naive Bayes and Joint Bayes', () => {
  const X = "'Outlook=Sunny & Temperature=Cool & Humidity=High & Wind=Strong'";

  it('ex. 2.27 a: scores 18/875 for No and 1/189 for Yes, so No, with probability 486/611', () => {
    expect(evaluate(`nbScore(PlayTennis,'EnjoyTennis',${X},'No')`, scope).equals(new Fraction(18, 875))).toBe(true);
    expect(evaluate(`nbScore(PlayTennis,'EnjoyTennis',${X},'Yes')`, scope).equals(new Fraction(1, 189))).toBe(true);
    expect(evaluate(`nb(PlayTennis,'EnjoyTennis',${X})`, scope)).toBe('No');
    expect(evaluate(`nbProb(PlayTennis,'EnjoyTennis',${X},'No')`, scope).equals(new Fraction(486, 611))).toBe(true);
  });

  it('ex. 2.27 b: 13 free parameters for Naive Bayes and 71 for Joint Bayes; Bernoulli attributes give 2n+1 and 2^(n+1)-1', () => {
    expect(val('paramsNB(4,[3,3,2,2],2)')).toBe(13);
    expect(val('paramsJoint(4,[3,3,2,2],2)')).toBe(71);
    expect(val('paramsNB(5,2,2)')).toBe(11);
    expect(val('paramsJoint(5,2,2)')).toBe(63);
  });

  it('ex. 2.27 c: training error 1 of 14, CVLOO 6 of 14', () => {
    expect(val("trainErrNB(PlayTennis,'EnjoyTennis')")).toBe(1);
    expect(val("cvlooNB(PlayTennis,'EnjoyTennis')")).toBe(6);
  });

  it('add-one smoothing adds 1 to the count and the number of values of the attribute to the class size', () => {
    const T = { columns: ['A', 'Y'], rows: [[0, 'p'], [0, 'p'], [1, 'p'], [0, 'n']] };
    const sc = (cls, lap) => evaluate(`nbScore(T,'Y','A=1','${cls}',{laplace:${lap}})`, { T });
    expect(sc('p', false).equals(new Fraction(3, 4).mul(new Fraction(1, 3)))).toBe(true);
    expect(sc('n', false).equals(new Fraction(0))).toBe(true);
    expect(sc('p', true).equals(new Fraction(3, 4).mul(new Fraction(2, 5)))).toBe(true); // (1+1)/(3+2); the prior stays 3/4
    expect(sc('n', true).equals(new Fraction(1, 4).mul(new Fraction(1, 3)))).toBe(true); // (0+1)/(1+2)
  });

  it('Joint Bayes reads the joint counts', () => {
    expect(evaluate("joint(PlayTennis,'EnjoyTennis','Outlook=Sunny & Temperature=Hot & Humidity=High & Wind=Weak')", scope)).toBe('No');
    expect(evaluate("jointScore(PlayTennis,'EnjoyTennis','Outlook=Sunny & Temperature=Hot & Humidity=High & Wind=Weak','No')", scope).equals(new Fraction(1, 14))).toBe(true);
  });
});

describe('counting, probabilities and the other distributions', () => {
  it('count, P and Pc read conditions like "Outlook=Sunny & EnjoyTennis=Yes"', () => {
    expect(val("count(PlayTennis,'Outlook=Sunny & EnjoyTennis=Yes')")).toBe(2);
    expect(val("count(PlayTennis)")).toBe(14);
    expect(evaluate("P(PlayTennis,'EnjoyTennis=Yes')", scope).equals(new Fraction(9, 14))).toBe(true);
    expect(evaluate("Pc(PlayTennis,'Outlook=Sunny','EnjoyTennis=Yes')", scope).equals(new Fraction(2, 9))).toBe(true);
    expect(evaluate("P(Startup,'Capital>3')", scope).equals(new Fraction(5, 12))).toBe(true);
    expect(() => evaluate("Pc(PlayTennis,'Outlook=Sunny','Outlook=Hail')", scope)).toThrow(/division by zero|impossible/);
    expect(() => evaluate("count(PlayTennis,'Foo=1')", scope)).toThrow(/unknown column/);
  });

  it('P reads a probability column named P as weights (ex. 0.57)', () => {
    expect(evaluate("P(Cold,'C=no')", scope).equals(new Fraction(3, 5))).toBe(true);
    expect(evaluate("P(Cold,'T=sunny')", scope).equals(new Fraction(7, 20))).toBe(true);
    expect(evaluate("Pc(Cold,'C=no','T=sunny')", scope).equals(new Fraction(6, 7))).toBe(true);
  });

  it('binom, binomPmf, E, Var, Cov', () => {
    expect(evaluate('binom(5,2)', {}).equals(new Fraction(10))).toBe(true);
    expect(evaluate('binomPmf(4,1/2,2)', {}).equals(new Fraction(3, 8))).toBe(true);
    expect(evaluate('E([1,2,3],[1/2,1/4,1/4])', {}).equals(new Fraction(7, 4))).toBe(true);
    expect(evaluate('Var([0,1],[1/2,1/2])', {}).equals(new Fraction(1, 4))).toBe(true);
    const J = { columns: ['X', 'Y', 'P'], rows: [[0, 0, 0.25], [0, 1, 0.25], [1, 0, 0.25], [1, 1, 0.25]] };
    expect(evaluate("Cov(J,'X','Y')", { J }).equals(new Fraction(0))).toBe(true);
    const D = { columns: ['X', 'Y', 'P'], rows: [[0, 0, 0.5], [1, 1, 0.5]] };
    expect(evaluate("Cov(D,'X','Y')", { D }).equals(new Fraction(1, 4))).toBe(true);
    expect(() => evaluate('binom(3,5)', {})).not.toThrow();
  });

  it('KL and cross-entropy in bits, CH = H + KL', () => {
    const kl = val('KL([1/2,1/2],[1/4,3/4])');
    const ch = val('CH([1/2,1/2],[1/4,3/4])');
    expect(kl).toBeCloseTo(0.5 + 0.5 * Math.log2(2 / 3), 12);
    expect(ch).toBeCloseTo(1 + kl, 12);
    expect(val('KL([1/3,2/3],[1/3,2/3])')).toBe(0);
    expect(val('KL([1/2,1/2],[1,0])')).toBe(Infinity);
  });
});
