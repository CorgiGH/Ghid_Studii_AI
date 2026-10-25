// The SQL client for blocks that run the learner's own queries. Unlike useSqlRunner (widgets: a value or nothing) it keeps
// following the client's status, so a boot that fails after the page has rendered flips the block to paper mode.
import { useEffect, useState } from 'react';

let clientPromise = null;
function loadClient() {
  if (!clientPromise) {
    clientPromise = import('../../../sql/engine/client.js').then((m) => m.getSqlClient());
    clientPromise.catch(() => { clientPromise = null; }); // a failed chunk load is tried again by the next block that mounts
  }
  return clientPromise;
}

// -> { client: SqlClient | null, status: 'loading' (no client yet) | 'idle' | 'ready' | 'failed', reload: () => void }
// reload() imports the client chunk again after a failed load (it does nothing once a client is there).
export function useSqlClient() {
  const [client, setClient] = useState(null);
  const [status, setStatus] = useState('loading');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let live = true;
    let off = () => {};
    loadClient().then((c) => {
      if (!live) return;
      setClient(c);
      setStatus(c.status);
      off = c.onStatus(setStatus);
    }).catch(() => { if (live) setStatus('failed'); });
    return () => { live = false; off(); };
  }, [attempt]);
  const reload = () => { if (!client) { setStatus('loading'); setAttempt((n) => n + 1); } };
  return { client, status, reload };
}
