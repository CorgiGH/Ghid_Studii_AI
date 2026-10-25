import React, { useEffect, useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import ResultTable from './ResultTable.jsx';
import { loadDatasetRows } from './blocks/datasetFiles.js';

// The rows of a dataset, table by table, in a drawer. The review variant uses it: its rows differ from the lesson's, and the learner
// writes the query against them. Reads the dataset file, so it works with or without the engine. A failed load shows a retry button
// and is tried again the next time the drawer opens.
export default function DataPanel({ dataset }) {
  const { t } = useApp();
  const [open, setOpen] = useState(false);
  const [tables, setTables] = useState(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!open || tables) return undefined;
    let live = true;
    loadDatasetRows(dataset).then((r) => { if (live) setTables(r); }).catch(() => { if (live) setFailed(true); });
    return () => { live = false; };
  }, [open, dataset, tables, attempt]);

  return (
    <details className="sx-schema" open={open} onToggle={(e) => { const o = e.currentTarget.open; setOpen(o); if (o) setFailed(false); }} data-testid="sql-data">
      <summary>{t('Rows of these tables', 'Rândurile tabelelor')}</summary>
      {open && !tables && !failed && <p className="sx-muted">{t('Loading…', 'Se încarcă…')}</p>}
      {open && failed && (
        <p className="sx-muted" data-testid="sql-data-error">
          {t('The rows could not be loaded.', 'Rândurile nu au putut fi încărcate.')}{' '}
          <button type="button" className="sx-btn" data-testid="sql-data-retry" onClick={() => { setFailed(false); setAttempt((n) => n + 1); }}>{t('Try again', 'Încearcă din nou')}</button>
        </p>
      )}
      {open && tables && tables.length > 0 && (
        <div className="sx-data">
          {tables.map((tb) => <ResultTable key={tb.table} title={tb.table} columns={tb.columns} rows={tb.rows} />)}
        </div>
      )}
    </details>
  );
}
