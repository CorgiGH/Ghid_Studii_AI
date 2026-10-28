// Exact rational numbers for the ML calculation exercises (BigInt numerator and denominator, always reduced), so
// 1/3 * 1/10 is 1/30 and not 0.03333333333333333. Pure and framework-free: the content tests and the browser share it.

const gcd = (a, b) => {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b) [a, b] = [b, a % b];
  return a;
};

const bitLength = (n) => n.toString(2).length;

// BigInt ratio -> nearest double, also when numerator or denominator is past 2^53 (a big power of a small fraction).
function ratioToNumber(n, d) {
  const neg = n < 0n;
  const a = neg ? -n : n;
  if (a === 0n) return 0;
  if (a < 2n ** 53n && d < 2n ** 53n) return (neg ? -1 : 1) * (Number(a) / Number(d));
  // keep 64 significant bits of the quotient, then scale back in two steps so 2**-shift cannot overflow
  const shift = BigInt(Math.max(0, 64 - (bitLength(a) - bitLength(d))));
  const q = (a << shift) / d;
  const s = Number(shift);
  const half = Math.floor(s / 2);
  return (neg ? -1 : 1) * ((Number(q) * 2 ** -half) * 2 ** -(s - half));
}

// A decimal such as 0.5, 2.3, -1e-7 or "0.25" as the exact fraction it is written as (not the binary double nearby).
function parseDecimal(text) {
  const m = String(text).trim().match(/^([+-]?)(\d*)(?:\.(\d*))?(?:[eE]([+-]?\d+))?$/);
  if (!m || (m[2] === '' && (m[3] === undefined || m[3] === ''))) throw new TypeError(`not a number: ${text}`);
  const frac = m[3] ?? '';
  let num = BigInt((m[2] || '0') + frac);
  let den = 10n ** BigInt(frac.length);
  const e = m[4] ? Number(m[4]) : 0;
  if (e > 0) num *= 10n ** BigInt(e);
  else if (e < 0) den *= 10n ** BigInt(-e);
  return [m[1] === '-' ? -num : num, den];
}

export class Fraction {
  // new Fraction(9, 17), new Fraction(18n, 34n), new Fraction('9/17'), new Fraction('0.25'). A JS number must be an integer
  // here; Fraction.from(0.1) is the way to turn a decimal into the fraction it is written as.
  constructor(n, d = 1n) {
    if (typeof n === 'string') {
      const slash = n.indexOf('/');
      if (slash >= 0) {
        const a = new Fraction(n.slice(0, slash));
        const b = new Fraction(n.slice(slash + 1));
        const f = a.div(b);
        n = f.n;
        d = f.d;
      } else {
        const [pn, pd] = parseDecimal(n);
        n = pn;
        d = pd;
      }
    } else {
      if (typeof n === 'number') {
        if (!Number.isInteger(n)) throw new TypeError(`Fraction needs an integer, got ${n}; use Fraction.from`);
        n = BigInt(n);
      }
      if (typeof d === 'number') {
        if (!Number.isInteger(d)) throw new TypeError(`Fraction needs an integer denominator, got ${d}`);
        d = BigInt(d);
      }
    }
    if (d === 0n) throw new RangeError('division by zero');
    if (d < 0n) { n = -n; d = -d; }
    const g = gcd(n, d) || 1n;
    this.n = n / g;
    this.d = d / g;
  }

  // Any JS number (as the decimal it prints as), bigint, numeric string or Fraction -> Fraction.
  static from(x) {
    if (x instanceof Fraction) return x;
    if (typeof x === 'bigint') return new Fraction(x);
    if (typeof x === 'number') {
      if (!Number.isFinite(x)) throw new RangeError(`not a finite number: ${x}`);
      const [n, d] = parseDecimal(String(x));
      return new Fraction(n, d);
    }
    return new Fraction(String(x));
  }

  add(o) { o = Fraction.from(o); return new Fraction(this.n * o.d + o.n * this.d, this.d * o.d); }
  sub(o) { o = Fraction.from(o); return new Fraction(this.n * o.d - o.n * this.d, this.d * o.d); }
  mul(o) { o = Fraction.from(o); return new Fraction(this.n * o.n, this.d * o.d); }
  div(o) {
    o = Fraction.from(o);
    if (o.n === 0n) throw new RangeError('division by zero');
    return new Fraction(this.n * o.d, this.d * o.n);
  }
  neg() { return new Fraction(-this.n, this.d); }
  abs() { return this.n < 0n ? this.neg() : this; }
  // integer power (negative allowed); anything else belongs to Math.pow on toNumber()
  pow(k) {
    k = typeof k === 'bigint' ? k : BigInt(k);
    if (k >= 0n) return new Fraction(this.n ** k, this.d ** k);
    if (this.n === 0n) throw new RangeError('division by zero');
    return new Fraction(this.d ** -k, this.n ** -k);
  }
  equals(o) { o = Fraction.from(o); return this.n === o.n && this.d === o.d; }
  cmp(o) { o = Fraction.from(o); const a = this.n * o.d; const b = o.n * this.d; return a < b ? -1 : a > b ? 1 : 0; }
  sign() { return this.n < 0n ? -1 : this.n > 0n ? 1 : 0; }
  isInteger() { return this.d === 1n; }
  toNumber() { return ratioToNumber(this.n, this.d); }
  toString() { return this.d === 1n ? String(this.n) : `${this.n}/${this.d}`; }
}

export default Fraction;
