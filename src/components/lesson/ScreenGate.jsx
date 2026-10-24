import React, { createContext, useContext, useMemo } from 'react';

const noop = () => {};
const ScreenGateContext = createContext({ complete: noop, skip: noop, isComplete: true });

// Any block on a screen calls complete() once the learner has answered, revealed
// or run something. The player keeps Continue locked until then (or a skip).
// eslint-disable-next-line react-refresh/only-export-components -- the hook belongs next to its provider
export function useScreenGate() {
  return useContext(ScreenGateContext);
}

export default function ScreenGate({ state, onChange, children }) {
  const value = useMemo(() => ({
    complete: () => onChange({ completed: true }),
    skip: () => onChange({ skipped: true }),
    isComplete: !!(state && (state.completed || state.skipped)),
  }), [state, onChange]);
  return <ScreenGateContext.Provider value={value}>{children}</ScreenGateContext.Provider>;
}
