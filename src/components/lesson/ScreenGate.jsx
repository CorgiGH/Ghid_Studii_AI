import React, { createContext, useCallback, useContext, useMemo } from 'react';

const noop = () => {};
const ScreenGateContext = createContext({ complete: noop, skip: noop, isComplete: true });

// Any block on a screen calls complete() once the learner has answered, revealed
// or run something. The player keeps Continue locked until then (or a skip).
// eslint-disable-next-line react-refresh/only-export-components -- the hook belongs next to its provider
export function useScreenGate() {
  return useContext(ScreenGateContext);
}

// complete/skip keep a stable identity per screen (patchGate must be stable), so
// a block may safely list them in a useEffect dependency array.
export default function ScreenGate({ screen, state, patchGate, children }) {
  const complete = useCallback(() => patchGate(screen, { completed: true }), [patchGate, screen]);
  const skip = useCallback(() => patchGate(screen, { skipped: true }), [patchGate, screen]);
  const isComplete = !!(state && (state.completed || state.skipped));
  const value = useMemo(() => ({ complete, skip, isComplete }), [complete, skip, isComplete]);
  return <ScreenGateContext.Provider value={value}>{children}</ScreenGateContext.Provider>;
}
