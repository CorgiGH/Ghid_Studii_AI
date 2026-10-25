const stripQuotes = (s) => (s.startsWith("'") && s.endsWith("'") ? s.slice(1, -1) : s);

// What Oracle's implicit conversion yields for the three lesson shapes; null when only
// Oracle can say.
const ARITH = { '+': (x, y) => x + y, '-': (x, y) => x - y, '*': (x, y) => x * y, '/': (x, y) => x / y };
const isNum = (s) => s.trim() !== '' && !Number.isNaN(Number(s));

// What Oracle's implicit conversion yields for the lesson shapes; null when only
// Oracle can say.
export function convert({ fn, value }) {
  let m = fn.match(/^'(.*)'\s*([+\-*/])\s*(-?\d+(?:\.\d+)?)$/);
  if (m && isNum(m[1])) return String(ARITH[m[2]](Number(m[1]), Number(m[3])));
  m = fn.match(/^(-?\d+(?:\.\d+)?)\s*([+\-*/])\s*'(.*)'$/);
  if (m && isNum(m[3])) return String(ARITH[m[2]](Number(m[1]), Number(m[3])));
  m = fn.match(/^(.+?)\s*\|\|\s*'(.*)'$/);
  if (m) {
    const left = m[1].trim();
    const base = /^'.*'$/.test(left) ? stripQuotes(left) : (/^-?\d+(\.\d+)?$/.test(left) ? left : stripQuotes(value));
    return base + m[2];
  }
  return null;
}

export function typePipes({ conversions }) {
  return { items: conversions.map(c => ({ ...c, result: convert(c) })), count: conversions.length + 1 };
}
