// Pure reducer behind useStepper. Step 0 is always the setup frame. With predict,
// Next is locked until reveal(), which also moves to the first real step.
export function initialStepper({ predict = false } = {}) {
  return { step: 0, revealed: !predict };
}

const clamp = (v, n) => Math.max(0, Math.min(Math.max(1, n) - 1, v));

export function stepperReducer(s, a) {
  switch (a.type) {
    case 'next':
      if (!s.revealed) return s;
      return s.step >= a.n - 1 ? s : { ...s, step: clamp(s.step + 1, a.n) };
    case 'back':
      return s.step <= 0 ? s : { ...s, step: clamp(s.step - 1, a.n) };
    case 'goto':
      if (!s.revealed) return s;
      return { ...s, step: clamp(a.to, a.n) };
    case 'reveal':
      if (s.revealed) return s;
      return { revealed: true, step: clamp(1, a.n) };
    case 'reset':
      return { step: 0, revealed: a.revealed };
    default:
      return s;
  }
}
