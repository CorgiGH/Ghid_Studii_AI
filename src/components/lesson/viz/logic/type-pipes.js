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

// The type written at the end of a pipe: '?' until that pipe has run, so the learner guesses it first.
export const pipeTarget = (item, done) => (done ? item.to : '?');

export function typePipes({ conversions }) {
  return { items: conversions.map(c => ({ ...c, result: convert(c) })), count: conversions.length + 1 };
}

// What a pipe's step says: the conversion's own sentence when the lesson gives one ('12' becomes the number 12, then
// 12 * 2 = 24), else the plain fact; either way, that Oracle did it unasked.
export function pipeCaption(c) {
  const say = c.say || { en: `${c.from} becomes ${c.to} inside ${c.fn}.`, ro: `${c.from} devine ${c.to} în ${c.fn}.` };
  return { en: `${say.en} You never wrote a conversion; Oracle did it.`, ro: `${say.ro} Nu ai scris nicio conversie; a făcut-o Oracle.` };
}
