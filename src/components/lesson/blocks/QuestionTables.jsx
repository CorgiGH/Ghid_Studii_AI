// The tables a question is about (a reflect prompt, an mcq), shown with the question so the learner never
// answers about data they cannot see. `table`: one { dataset, sql, caption? } or a list of them.
import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../../contexts/AppContext';
import { useSqlRunner } from '../viz/useSqlRunner.js';
import { MiniTable } from '../viz/ui.jsx';
import { pickReflectTable, tableFromResult } from './reflectTable.js';

// The small result table a reflect prompt is about: the engine when it is up, else a plain fallback.
function OneTable({ dataset, sql, caption }) {
  const runner = useSqlRunner();
  const [fromEngine, setFromEngine] = useState(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (runner.status !== 'ready') return undefined;
    let live = true;
    // The runner reads the engine status only once, so a run that rejects (engine failed to
    // start) or gives no table is how a late failure shows; then the fallback takes over.
    runner.run(sql, { dataset })
      .then(r => { if (!live) return; const tb = tableFromResult(r); if (tb) setFromEngine(tb); else setFailed(true); })
      .catch(() => { if (live) setFailed(true); });
    return () => { live = false; };
  }, [runner, sql, dataset]);
  // Nothing while the engine is loading, so the table never visibly swaps; the plain fallback
  // only when the engine is not there at all or its run failed.
  const table = useMemo(
    () => pickReflectTable({ fromEngine, unavailable: runner.status === 'unavailable' || failed, sql }),
    [fromEngine, runner.status, failed, sql],
  );
  if (!table) return null;
  return <div className="viz ch-table"><MiniTable caption={caption ? <b>{caption}</b> : undefined} columns={table.columns} rows={table.rows} maxHeight="14rem" /></div>;
}

export default function QuestionTables({ table }) {
  const { t } = useApp();
  if (!table) return null;
  return (Array.isArray(table) ? table : [table]).map((tb, i) => (
    <OneTable key={i} dataset={tb.dataset} sql={tb.sql} caption={tb.caption ? t(tb.caption.en, tb.caption.ro) : null} />
  ));
}
