// DECODE(expr, s1, r1, s2, r2, ..., default): first search value equal to expr wins;
// two NULLs count as equal here (unlike =).
const same = (a, b) => (a === null && b === null) || (a !== null && b !== null && String(a) === String(b));

export function decodeRoute(value, pairs, dflt) {
  const index = pairs.findIndex(([s]) => same(value, s === undefined ? null : s));
  if (index >= 0) return { index, isDefault: false, result: pairs[index][1] };
  return { index: -1, isDefault: true, result: dflt === undefined ? null : dflt };
}

export function decodeSieve({ pairs, default: dflt, values }) {
  return { routes: values.map(v => ({ value: v, ...decodeRoute(v, pairs, dflt) })), count: values.length + 1 };
}
