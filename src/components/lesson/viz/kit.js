// Shared animation kit for the visual widgets: the stepper hook and motion variants.
// Advance is always manual; reduced motion keeps the end state and drops the movement.
import { useCallback, useMemo, useReducer } from 'react';
import { useReducedMotion } from 'motion/react';
import { useScreenGate } from '../ScreenGate.jsx';
import { initialStepper, stepperReducer } from './logic/stepper.js';

export const SPRING = { type: 'spring', stiffness: 420, damping: 34 };
export const SOFT = { type: 'spring', stiffness: 210, damping: 26 };
export const BOUNCE = { type: 'spring', stiffness: 520, damping: 20 };

// useStepper(n, { predict }) -> { step, next, back, canNext, reveal, ... }
// Step 0 is the setup frame. With predict, Next stays locked until reveal(), which
// also tells the lesson player the screen is done.
// With `own: true` the widget asks for the pick itself (marks, rows to click): the stepper
// shows no "Show me" gate of its own, and the widget calls settle() on the first pick or
// its own reveal button, which is what completes the screen. One gate, not two.
export function useStepper(n, o = {}) {
  const predict = !!o.predict;
  const own = predict && !!o.own;
  const gate = useScreenGate();
  const gated = predict && !own;
  const [s, dispatch] = useReducer(stepperReducer, { predict: gated }, initialStepper);
  const next = useCallback(() => dispatch({ type: 'next', n }), [n]);
  const back = useCallback(() => dispatch({ type: 'back', n }), [n]);
  const goto = useCallback((to) => dispatch({ type: 'goto', to, n }), [n]);
  const reveal = useCallback(() => {
    dispatch({ type: 'reveal', n });
    if (predict) gate.complete();
  }, [n, predict, gate]);
  const settle = useCallback(() => { if (predict) gate.complete(); }, [predict, gate]);
  const reset = useCallback(() => dispatch({ type: 'reset', revealed: !gated }), [gated]);
  const step = Math.min(s.step, Math.max(0, n - 1));
  return {
    n, step, revealed: s.revealed, predicting: gated && !s.revealed,
    next, back, goto, reveal, settle, reset,
    canNext: s.revealed && step < n - 1,
    canBack: step > 0,
    last: step >= n - 1,
  };
}

// Variant sets: use as <Motion.div variants={v.enter} initial="hidden" animate="show" exit="exit" custom={i}>.
export function vizVariants(reduced) {
  const d = (px) => (reduced ? 0 : px);
  const t = (spring, delayStep = 0) => (i = 0) => (reduced ? { duration: 0 } : { ...spring, delay: i * delayStep });
  const fade = (tr) => ({ opacity: 1, y: 0, scale: 1, transition: tr });
  return {
    enter: {
      hidden: { opacity: reduced ? 1 : 0, y: d(10) },
      show: (i = 0) => fade(t(SPRING, 0.04)(i)),
      exit: { opacity: reduced ? 1 : 0, y: d(-6), transition: reduced ? { duration: 0 } : { duration: 0.14 } },
    },
    exit: {
      show: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: reduced ? 1 : 0, y: d(-10), scale: reduced ? 1 : 0.96, transition: reduced ? { duration: 0 } : { duration: 0.2 } },
    },
    pop: {
      hidden: { opacity: reduced ? 1 : 0, scale: reduced ? 1 : 0.6 },
      show: (i = 0) => fade(t(BOUNCE, 0.05)(i)),
      exit: { opacity: reduced ? 1 : 0, scale: reduced ? 1 : 0.7, transition: { duration: reduced ? 0 : 0.14 } },
    },
    fall: {
      hidden: { opacity: reduced ? 1 : 0, y: d(-34) },
      show: (i = 0) => fade(t(SOFT, 0.07)(i)),
      exit: { opacity: reduced ? 1 : 0, y: d(40), transition: { duration: reduced ? 0 : 0.28, ease: [0.4, 0, 1, 1] } },
    },
  };
}

// { reduced, v, spring, soft, bounce } for a widget; the transition is instant when reduced.
export function useVizMotion() {
  const reduced = !!useReducedMotion();
  return useMemo(() => ({
    reduced,
    v: vizVariants(reduced),
    spring: reduced ? { duration: 0 } : SPRING,
    soft: reduced ? { duration: 0 } : SOFT,
    bounce: reduced ? { duration: 0 } : BOUNCE,
  }), [reduced]);
}
