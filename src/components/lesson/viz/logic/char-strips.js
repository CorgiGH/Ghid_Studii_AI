// LPAD / RPAD / TRANSLATE as Oracle does them.
function padChars(len, fill) {
  const f = [...fill];
  return Array.from({ length: len }, (_, i) => f[i % f.length]);
}

// `fill` is optional: like Oracle, LPAD and RPAD pad with a blank when no pad string is given.
// The call as the learner would write it: LPAD('Pagina', 3, '*'); with no pad string given, the third argument is left out.
export const padCall = ({ fn, input, len, fill }) => `${fn}('${input}', ${len}${fill === undefined ? '' : `, '${fill}'`})`;

export function padPlan({ input, fn, len, fill = ' ' }) {
  const chars = [...input];
  if (len <= chars.length) {
    const kept = chars.slice(0, Math.max(0, len));
    return { input: chars, pad: [], padCount: 0, cut: len, dropped: chars.slice(len), result: kept.join(''), fn, len };
  }
  const pad = padChars(len - chars.length, fill);
  return { input: chars, pad, padCount: pad.length, cut: null, dropped: [], result: fn === 'LPAD' ? pad.join('') + input : input + pad.join(''), fn, len };
}

export const lpad = (s, len, fill = ' ') => padPlan({ input: s, fn: 'LPAD', len, fill }).result;
export const rpad = (s, len, fill = ' ') => padPlan({ input: s, fn: 'RPAD', len, fill }).result;

export function translateStr(s, from, to) {
  const f = [...from], t = [...to];
  return [...s].map(c => { const i = f.indexOf(c); return i < 0 ? c : (t[i] ?? ''); }).join('');
}

export function swapPlan({ input, from, to }) {
  const f = [...from], t = [...to];
  const chars = [...input].map(c => {
    const i = f.indexOf(c);
    const out = i < 0 ? c : (t[i] ?? '');
    return { ch: c, out, changed: i >= 0 && out !== c, pair: i };
  });
  return { chars, from: f, to: t, result: chars.map(c => c.out).join('') };
}

// REPLACE(s, a, b) for single characters; a missing replacement removes the character.
export const replaceChar = (s, a, b = '') => [...s].map(c => (c === a ? b : c)).join('');

// Nested REPLACEs, one per (from[i], to[i]) pair, innermost first. Each later REPLACE sees
// the letters the earlier ones created, which is why the chain cannot swap two letters.
export function replaceChain({ input, from, to }) {
  const f = [...from], t = [...to];
  const stages = [];
  let cur = input;
  f.forEach((a, i) => {
    cur = replaceChar(cur, a, t[i] ?? '');
    stages.push({ from: a, to: t[i] ?? '', text: cur, chars: [...cur] });
  });
  return { stages, result: cur };
}

// What step `k` of the swap view shows, for a chain of `n` REPLACE stages: step 0 introduces
// both ways, steps 1..n are the REPLACEs one by one, the last step is the single TRANSLATE.
export function swapStep(k, n) {
  if (k <= 0) return { kind: 'intro' };
  if (k <= n) return { kind: 'replace', index: k - 1, last: k === n };
  return { kind: 'translate' };
}

export function charStrips(p) {
  if (p.mode === 'swap') {
    const chain = replaceChain(p);
    return { plan: swapPlan(p), chain, count: chain.stages.length + 2 };
  }
  return { plan: padPlan(p), count: 3 };
}
