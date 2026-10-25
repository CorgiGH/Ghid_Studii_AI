// The SQL client for blocks that run the learner's own queries. Unlike useSqlRunner (widgets: a value or nothing) it keeps
// following the client's status, so a boot that fails after the page has rendered flips the block to paper mode.
import { useEffect, useState } from 'react';

let clientPromise = null;
function loadClient() {
  clientPromise ??= import('../../../sql/engine/client.js').then((m) => m.getSqlClient());
  return clientPromise;
}

// -> { client: SqlClient | null, status: 'loading' (no client yet) | 'idle' | 'ready' | 'failed' }
export function useSqlClient() {
  const [client, setClient] = useState(null);
  const [status, setStatus] = useState('loading');
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
  }, []);
  return { client, status };
}
