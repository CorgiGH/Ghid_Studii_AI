// The tables a question is about (a reflect prompt, an mcq), shown with the question so the learner never
// answers about data they cannot see. `table`: one { dataset, sql, caption? } or a list of them.
import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../../contexts/AppContext';
import { useSqlRunner } from '../viz/useSqlRunner.js';
import { displayCell } from '../viz/logic/date-mask.js';
import ResultTable from '../ResultTable.jsx';
import { pickReflectTable, tableFromResult } from './reflectTable.js';

// The small result table a question is about: the plain fallback at once (a cold load would otherwise show the question with
// no table while the engine starts), then the engine's own result once it answers.
function OneTable({ dataset, sql, caption }) {
  const { t } = useApp();
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
  const table = useMemo(() => pickReflectTable({ fromEngine, sql }), [fromEngine, sql]);
  if (!table) {
    if (runner.status === 'unavailable' || failed) return null;
    return <p className="ch-table-wait" data-testid="question-table-wait">{t('Loading the table…', 'Se încarcă tabelul…')}</p>;
  }
  const rows = table.rows.map((r) => table.columns.map((c) => (r[c] === null || r[c] === undefined ? null : displayCell(r[c]))));
  return <div className="ch-table" data-testid="question-table"><ResultTable title={caption || undefined} columns={table.columns} rows={rows} /></div>;
}

export default function QuestionTables({ table }) {
  const { t } = useApp();
  if (!table) return null;
  return (Array.isArray(table) ? table : [table]).map((tb, i) => (
    <OneTable key={i} dataset={tb.dataset} sql={tb.sql} caption={tb.caption ? t(tb.caption.en, tb.caption.ro) : null} />
  ));
}
