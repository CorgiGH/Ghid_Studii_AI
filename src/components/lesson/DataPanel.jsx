import React, { useEffect, useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import ResultTable from './ResultTable.jsx';
import { rowsFromSql } from './blocks/sqlExerciseSpec.js';

const cache = new Map(); // dataset -> Promise<[{ table, columns, rows }]>
function loadRows(dataset) {
  if (!cache.has(dataset)) {
    const url = `${import.meta.env.BASE_URL}sql/datasets/${dataset}.sql`;
    cache.set(dataset, fetch(url).then((r) => (r.ok ? r.text() : Promise.reject(new Error(String(r.status))))).then(rowsFromSql));
  }
  return cache.get(dataset);
}

// The rows of a dataset, table by table, in a drawer. The review variant uses it: its rows differ from the lesson's, and the learner
// writes the query against them. Reads the dataset file, so it works with or without the engine.
export default function DataPanel({ dataset }) {
  const { t } = useApp();
  const [open, setOpen] = useState(false);
  const [tables, setTables] = useState(null);

  useEffect(() => {
    if (!open || tables) return undefined;
    let live = true;
    loadRows(dataset).then((r) => { if (live) setTables(r); }).catch(() => { if (live) setTables([]); });
    return () => { live = false; };
  }, [open, dataset, tables]);

  return (
    <details className="sx-schema" open={open} onToggle={(e) => setOpen(e.currentTarget.open)} data-testid="sql-data">
      <summary>{t('Rows of these tables', 'Rândurile tabelelor')}</summary>
      {open && tables === null && <p className="sx-muted">{t('Loading…', 'Se încarcă…')}</p>}
      {open && tables && tables.length === 0 && <p className="sx-muted">{t('The rows could not be loaded.', 'Rândurile nu au putut fi încărcate.')}</p>}
      {open && tables && tables.length > 0 && (
        <div className="sx-data">
          {tables.map((tb) => <ResultTable key={tb.table} title={tb.table} columns={tb.columns} rows={tb.rows} />)}
        </div>
      )}
    </details>
  );
}
