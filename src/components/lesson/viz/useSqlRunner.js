// Gives widgets the SQL engine without a hard dependency on it. The engine client is
// found with a glob so a missing file (the engine branch not merged yet, or the engine
// failing) reports 'unavailable' and widgets fall back to their pure step logic.
import { useEffect, useMemo, useState } from 'react';
import { firstCell } from './logic/oracle.js';

const found = import.meta.glob('../../../sql/engine/client.js');
let clientPromise = null;

function loadClient() {
  if (!clientPromise) {
    const loader = Object.values(found)[0];
    clientPromise = loader
      ? loader().then(m => (typeof m.getSqlClient === 'function' ? m.getSqlClient() : null)).catch(() => null)
      : Promise.resolve(null);
  }
  return clientPromise;
}

// { status: 'loading' | 'ready' | 'unavailable', run(sql, { dataset }) }
export function useSqlRunner() {
  const [client, setClient] = useState(undefined);
  useEffect(() => {
    let live = true;
    loadClient().then(c => { if (live) setClient(c); });
    return () => { live = false; };
  }, []);
  return useMemo(() => {
    if (client === undefined) return { status: 'loading', run: null };
    if (!client || client.status === 'failed') return { status: 'unavailable', run: null };
    return { status: 'ready', run: (sql, o) => client.run(sql, o) };
  }, [client]);
}

// Runs a list of one-value queries (null entries are skipped) and returns the first cell
// of each, or undefined where the engine said nothing. Never throws.
export function useOracleValues(queries, dataset = 'facultate') {
  const runner = useSqlRunner();
  const key = JSON.stringify(queries || []);
  const [state, setState] = useState({ key: null, values: null });
  useEffect(() => {
    if (runner.status !== 'ready') return undefined;
    let live = true;
    const list = JSON.parse(key);
    Promise.all(list.map(sql => (sql ? runner.run(sql, { dataset }).then(firstCell).catch(() => undefined) : Promise.resolve(undefined))))
      .then(values => { if (live) setState({ key, values }); });
    return () => { live = false; };
  }, [runner, key, dataset]);
  const ready = state.key === key ? state.values : null;
  return { status: runner.status, values: ready };
}
