import React, { useEffect, useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { SCHEMA_TABLES } from './blocks/sqlExerciseSpec.js';
import { loadDatasetSchema } from './blocks/datasetFiles.js';

// The tables of the exercise's dataset with their columns, in a drawer. With the engine up it asks DESCRIBE (so after a DDL
// exercise ran it shows the tables as the learner left them); without it, it reads the dataset file. A failed load shows a retry
// button and is tried again the next time the drawer opens.
export default function SchemaPanel({ dataset, client, ready, version = 0 }) {
  const { t } = useApp();
  const [open, setOpen] = useState(false);
  const [tables, setTables] = useState(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const base = dataset.replace(/-hidden$/, '');

  useEffect(() => {
    if (!open) return undefined;
    let live = true;
    const fromFile = () => loadDatasetSchema(dataset).then((s) => { if (live) setTables(s); }).catch(() => { if (live) { setTables(null); setFailed(true); } });
    if (client && ready) {
      Promise.all(SCHEMA_TABLES[base].map((name) => client.describe(name, { dataset }).then((cols) => ({ table: name.toUpperCase(), columns: cols }))))
        .then((all) => { if (live) setTables(all); })
        .catch(fromFile);
    } else fromFile();
    return () => { live = false; };
  }, [open, client, ready, dataset, base, version, attempt]);

  return (
    <details className="sx-schema" open={open} onToggle={(e) => { const o = e.currentTarget.open; setOpen(o); if (o) setFailed(false); }} data-testid="sql-schema">
      <summary>{t('Tables', 'Tabelele')}</summary>
      {open && tables === null && !failed && <p className="sx-muted">{t('Loading…', 'Se încarcă…')}</p>}
      {open && failed && (
        <p className="sx-muted" data-testid="sql-schema-error">
          {t('The tables could not be loaded.', 'Tabelele nu au putut fi încărcate.')}{' '}
          <button type="button" className="sx-btn" data-testid="sql-schema-retry" onClick={() => { setFailed(false); setAttempt((n) => n + 1); }}>{t('Try again', 'Încearcă din nou')}</button>
        </p>
      )}
      {open && tables && tables.length > 0 && (
        <div className="sx-schema-grid">
          {tables.map((tb) => (
            <table key={tb.table} className="sx-schema-table">
              <caption>{tb.table}</caption>
              <tbody>
                {tb.columns.length === 0 && <tr><td className="nul">{t('(no table)', '(nu există)')}</td></tr>}
                {tb.columns.map((c) => (
                  <tr key={c.name}><th scope="row">{c.name}</th><td>{c.type}</td></tr>
                ))}
              </tbody>
            </table>
          ))}
        </div>
      )}
    </details>
  );
}
