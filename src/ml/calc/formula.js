// The formula language of the ML calculation exercises: a small Pratt parser and evaluator, with no eval and no Function.
// A formula is what a content test re-evaluates to check every number the learner sees, so it must give the same
// value in node and in the browser.
//
//   numbers 2, 0.57 (read as exact decimals), fractions 9/17, + - * / ^ and parentheses, comparisons < <= > >= == != =
//   names from the scope (a block's table T, T1, T2, its data), 'strings', [arrays], {key: value} options, true, false
//   functions: see FUNCTIONS; a name that is not in the scope or in FUNCTIONS is an error.
// Exact values stay Fractions (1/3*1/10 is 1/30); anything with a logarithm or a root is a float.

import Fraction from './fraction.js';
import * as kit from './mathKit.js';

const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

// --- tokens ---

const TOKEN = /\s*(?:(\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|\.\d+)|([A-Za-z_][A-Za-z0-9_]*)|'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"|(<=|>=|==|!=|[-+*/^()[\]{},:<>=]))/y;

function tokenize(src) {
  const out = [];
  TOKEN.lastIndex = 0;
  let pos = 0;
  while (pos < src.length) {
    if (/^\s*$/.test(src.slice(pos))) break;
    TOKEN.lastIndex = pos;
    const m = TOKEN.exec(src);
    if (!m) throw new SyntaxError(`unexpected character "${src.slice(pos).trim()[0]}" in formula`);
    pos = TOKEN.lastIndex;
    if (m[1] !== undefined) out.push({ t: 'num', v: m[1] });
    else if (m[2] !== undefined) out.push({ t: 'id', v: m[2] });
    else if (m[3] !== undefined) out.push({ t: 'str', v: m[3].replace(/\\(.)/g, '$1') });
    else if (m[4] !== undefined) out.push({ t: 'str', v: m[4].replace(/\\(.)/g, '$1') });
    else out.push({ t: 'op', v: m[5] });
  }
  return out;
}

// --- parser: binding powers ---

const BP = { '<': 10, '<=': 10, '>': 10, '>=': 10, '==': 10, '=': 10, '!=': 10, '+': 20, '-': 20, '*': 30, '/': 30, '^': 50 };
const UNARY = 40;

function parse(src) {
  const toks = tokenize(src);
  let p = 0;
  const peek = () => toks[p];
  const isOp = (v) => toks[p] && toks[p].t === 'op' && toks[p].v === v;
  const expect = (v) => {
    if (!isOp(v)) throw new SyntaxError(`expected "${v}" in formula`);
    p++;
  };

  function list(close) {
    const items = [];
    if (isOp(close)) { p++; return items; }
    for (;;) {
      items.push(expr(0));
      if (isOp(',')) { p++; continue; }
      expect(close);
      return items;
    }
  }

  function primary() {
    const tk = toks[p++];
    if (!tk) throw new SyntaxError('the formula ends too soon');
    if (tk.t === 'num') return { k: 'num', v: new Fraction(tk.v) };
    if (tk.t === 'str') return { k: 'str', v: tk.v };
    if (tk.t === 'id') {
      if (isOp('(')) { p++; return { k: 'call', name: tk.v, args: list(')') }; }
      return { k: 'name', name: tk.v };
    }
    if (tk.v === '(') { const e = expr(0); expect(')'); return e; }
    if (tk.v === '[') return { k: 'array', items: list(']') };
    if (tk.v === '{') {
      const props = [];
      if (isOp('}')) { p++; return { k: 'object', props }; }
      for (;;) {
        const key = toks[p++];
        if (!key || (key.t !== 'id' && key.t !== 'str')) throw new SyntaxError('expected an option name in { }');
        expect(':');
        props.push([key.v, expr(0)]);
        if (isOp(',')) { p++; continue; }
        expect('}');
        return { k: 'object', props };
      }
    }
    throw new SyntaxError(`unexpected "${tk.v}" in formula`);
  }

  function prefix() {
    if (isOp('-')) { p++; return { k: 'neg', e: expr(UNARY) }; }
    if (isOp('+')) { p++; return expr(UNARY); }
    return primary();
  }

  function expr(min) {
    let left = prefix();
    for (;;) {
      const tk = peek();
      if (!tk || tk.t !== 'op' || !(tk.v in BP)) break;
      const bp = BP[tk.v];
      if (bp < min) break;
      p++;
      // ^ is right-associative; every other operator is left-associative
      const right = expr(tk.v === '^' ? bp : bp + 1);
      left = { k: 'bin', op: tk.v, l: left, r: right };
    }
    return left;
  }

  const ast = expr(0);
  if (p < toks.length) throw new SyntaxError(`unexpected "${toks[p].v}" in formula`);
  return ast;
}

// --- values ---

// A number in the scope is the decimal it prints as, so 0.1 * 3 is exactly 3/10.
function lift(x) {
  if (typeof x === 'number') return Number.isFinite(x) ? Fraction.from(x) : x;
  if (Array.isArray(x)) return x.map(lift);
  return x;
}

function compare(op, a, b) {
  const n = (x) => (x instanceof Fraction || typeof x === 'number');
  if (n(a) && n(b)) {
    const c = a instanceof Fraction && b instanceof Fraction ? a.cmp(b) : Math.sign(kit.num(a) - kit.num(b));
    return op === '==' || op === '=' ? c === 0 : op === '!=' ? c !== 0 : op === '<' ? c < 0 : op === '<=' ? c <= 0 : op === '>' ? c > 0 : c >= 0;
  }
  if (op === '==' || op === '=') return a === b;
  if (op === '!=') return a !== b;
  throw new TypeError('only numbers can be ordered');
}

const FNS = {
  log2: (x) => Math.log2(kit.num(x)),
  ln: (x) => Math.log(kit.num(x)),
  log10: (x) => Math.log10(kit.num(x)),
  sqrt: (x) => Math.sqrt(kit.num(x)),
  exp: (x) => Math.exp(kit.num(x)),
  abs: (x) => (x instanceof Fraction ? x.abs() : Math.abs(x)),
  min: (...a) => flatNums(a).reduce((m, x) => (kit.num(x) < kit.num(m) ? x : m)),
  max: (...a) => flatNums(a).reduce((m, x) => (kit.num(x) > kit.num(m) ? x : m)),
  sum: (...a) => flatNums(a).reduce((s, x) => kit.add(s, x), new Fraction(0)),
  len: (x) => (Array.isArray(x) ? x.length : x.rows.length),
  H: kit.H,
  Hcol: kit.Hcol,
  Hc: kit.Hc,
  IG: kit.IG,
  IGR: kit.IGR,
  splitInfo: kit.splitInfo,
  gini: kit.gini,
  misclass: kit.misclass,
  bestAttr: kit.bestAttr,
  thresholds: kit.thresholds,
  count: kit.count,
  P: kit.P,
  Pc: kit.Pc,
  where: kit.where,
  nb: kit.nb,
  nbScore: kit.nbScore,
  nbProb: kit.nbProb,
  joint: kit.joint,
  jointScore: kit.jointScore,
  paramsNB: kit.paramsNB,
  paramsJoint: kit.paramsJoint,
  cvlooId3: kit.cvlooId3,
  trainErrId3: kit.trainErrId3,
  id3Root: kit.id3Root,
  id3Tests: kit.id3Tests,
  cvlooNB: kit.cvlooNB,
  trainErrNB: kit.trainErrNB,
  binom: kit.binom,
  binomPmf: kit.binomPmf,
  E: kit.E,
  Var: kit.Var,
  Cov: kit.Cov,
  KL: kit.KL,
  CH: kit.CH,
};

function flatNums(a) {
  const out = a.flatMap((x) => (Array.isArray(x) ? flatNums(x) : [x]));
  if (!out.length) throw new TypeError('needs at least one number');
  return out;
}

// The names a formula may call, for the validator and for documentation.
export const FUNCTIONS = Object.freeze(Object.keys(FNS));

function run(node, scope) {
  switch (node.k) {
    case 'num': return node.v;
    case 'str': return node.v;
    case 'array': return node.items.map((e) => run(e, scope));
    case 'object': {
      const o = Object.create(null);
      for (const [k, e] of node.props) o[k] = run(e, scope);
      return o;
    }
    case 'name': {
      if (node.name === 'true') return true;
      if (node.name === 'false') return false;
      if (!own(scope, node.name)) throw new ReferenceError(`unknown name ${node.name}`);
      return lift(scope[node.name]);
    }
    case 'neg': {
      const v = run(node.e, scope);
      return v instanceof Fraction ? v.neg() : -v;
    }
    case 'bin': {
      const a = run(node.l, scope);
      const b = run(node.r, scope);
      switch (node.op) {
        case '+': return kit.add(a, b);
        case '-': return kit.sub(a, b);
        case '*': return kit.mul(a, b);
        case '/': return kit.div(a, b);
        case '^': return kit.pow(a, b);
        default: return compare(node.op, a, b);
      }
    }
    case 'call': {
      if (!own(FNS, node.name)) throw new ReferenceError(`unknown function ${node.name}`);
      return FNS[node.name](...node.args.map((e) => run(e, scope)));
    }
    default: throw new Error(`bad node ${node.k}`);
  }
}

// evaluate('9/14*5/14', scope) -> Fraction | number | string | boolean | array | object
export function evaluate(expr, scope = {}) {
  if (typeof expr !== 'string' || !expr.trim()) throw new SyntaxError('empty formula');
  return run(parse(expr), scope || {});
}

// The value as a JS number, for comparing with an expected answer.
export function toNumber(v) {
  if (v instanceof Fraction) return v.toNumber();
  if (typeof v === 'number') return v;
  throw new TypeError(`not a number: ${String(v)}`);
}

export { Fraction };
