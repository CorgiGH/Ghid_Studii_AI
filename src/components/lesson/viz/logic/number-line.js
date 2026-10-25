// Decimal-safe shift: moves the decimal point by `d` places through the exponent form.
const shift = (x, d) => Number(`${x}e${d}`);
const unshift = (x, d) => Number(`${x}e${-d}`);

export function numberLine(value, fn, digits = 0) {
  const x = shift(value, digits);
  let r;
  switch (fn) {
    case 'CEIL': r = Math.ceil(x); break;
    case 'FLOOR': r = Math.floor(x); break;
    case 'TRUNC': r = Math.trunc(x); break;
    case 'ROUND': r = Math.sign(x) * Math.round(Math.abs(x)); break; // half away from zero
    default: throw new Error(`fn ${fn}`);
  }
  const out = unshift(r, digits);
  return out === 0 ? 0 : out;
}

// The stretch of line to draw around a value: one tick per unit of the grid.
export function lineWindow(value, digits = 0) {
  const unit = unshift(1, digits);
  const lo = Math.floor(shift(value, digits)) - 1;
  const hi = Math.ceil(shift(value, digits)) + 1;
  return { unit, lo, hi, ticks: Array.from({ length: hi - lo + 1 }, (_, i) => unshift(lo + i, digits)) };
}

export function numberLines({ values, fns, digits = 0 }) {
  return { lines: values.map(v => ({ value: v, window: lineWindow(v, digits), results: fns.map(fn => ({ fn, result: numberLine(v, fn, digits) })) })), count: fns.length + 1 };
}

// Is `picked` (a mark on the line) where `fn` really sends `value`? Compared on the whole-number
// grid, so 21.7 and 21.70000000000001 count as the same mark.
export function pickIsRight(value, fn, digits, picked) {
  const grid = (x) => Math.round(shift(x, digits));
  return grid(numberLine(value, fn, digits)) === grid(picked);
}

// The furthest step the progress dots may jump to. With predict on, every step after the first asks for a pick
// and is only left once "Show" was pressed (`shown[step]`), so a dot can reach the first step not yet shown but
// never one beyond it; without predict every step is open.
export function reachableStep(to, { n, predict = false, shown = {} }) {
  let cap = Math.max(0, n - 1);
  if (predict) {
    for (let j = 1; j < n; j += 1) if (!shown[j]) { cap = j; break; }
  }
  return Math.min(Math.max(0, to), cap);
}
