import React, { createContext, useCallback, useContext, useMemo } from 'react';

const noop = () => {};
const ScreenGateContext = createContext({ complete: noop, skip: noop, isComplete: true, ref: null });

// Any block on a screen calls complete() once the learner has answered, revealed
// or run something. The player keeps Continue locked until then (or a skip).
// eslint-disable-next-line react-refresh/only-export-components -- the hook belongs next to its provider
export function useScreenGate() {
  return useContext(ScreenGateContext);
}

// complete keeps a stable identity per screen (patchGate must be stable) and `onSkip`
// is the player's own skip handler (records the skip and advances), so a block may
// safely list them in a useEffect dependency array. `ref` is {src, screen}, the place
// a block stamps on the attempts it records.
export default function ScreenGate({ src, screen, state, patchGate, onSkip, children }) {
  const complete = useCallback(() => patchGate(screen, { completed: true }), [patchGate, screen]);
  const isComplete = !!(state && (state.completed || state.skipped));
  const ref = useMemo(() => ({ src, screen }), [src, screen]);
  const value = useMemo(() => ({ complete, skip: onSkip, isComplete, ref }), [complete, onSkip, isComplete, ref]);
  return <ScreenGateContext.Provider value={value}>{children}</ScreenGateContext.Provider>;
}
