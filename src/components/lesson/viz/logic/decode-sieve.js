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

const lit = (x) => (x === null || x === undefined ? 'NULL' : typeof x === 'number' ? String(x) : `'${x}'`);
const show = (v) => (v === null || v === undefined ? 'NULL' : String(v));

// The call as the learner would write it: DECODE(bursa, 450, 'premiul 1', ..., NULL, 'mentiune').
export function decodeCall({ expr, pairs, default: dflt }) {
  const args = pairs.flatMap(([s, r]) => [lit(s), lit(r)]).concat(dflt !== undefined ? [lit(dflt)] : []);
  return `DECODE(${expr}, ${args.join(', ')})`;
}

// What each step says. The widget draws the search values as drawers, top to bottom, and a last drawer for the rest.
export function decodeCaption(props, cur, result) {
  if (!cur) {
    return {
      en: `${decodeCall(props)} checks the value drawer by drawer, from the top, and stops at the first equal one. If none is equal, the value falls to the bottom.`,
      ro: `${decodeCall(props)} verifică valoarea sertar cu sertar, de sus în jos, și se oprește la primul egal. Dacă niciunul nu e egal, valoarea cade jos.`,
    };
  }
  if (cur.isDefault) {
    return props.default !== undefined
      ? { en: `${show(cur.value)} equals no drawer, so it falls to the bottom: the default value '${props.default}'.`, ro: `${show(cur.value)} nu e egal cu niciun sertar, deci cade jos, în valoarea implicită '${props.default}'.` }
      : { en: `${show(cur.value)} equals no drawer, so it falls to the bottom and comes out NULL, because no default value was given.`, ro: `${show(cur.value)} nu e egal cu niciun sertar, deci cade jos și iese NULL, fiindcă nu s-a dat o valoare implicită.` };
  }
  const nullNote = cur.value === null
    ? { en: ' In DECODE, NULL equals NULL, unlike with =.', ro: ' În DECODE, NULL e egal cu NULL, spre deosebire de =.' }
    : { en: '', ro: '' };
  return {
    en: `${show(cur.value)} is caught by drawer ${cur.index + 1} (${show(props.pairs[cur.index][0])}): ${show(result)}.${nullNote.en}`,
    ro: `${show(cur.value)} e oprit de sertarul ${cur.index + 1} (${show(props.pairs[cur.index][0])}): ${show(result)}.${nullNote.ro}`,
  };
}
