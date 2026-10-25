import React, { useEffect, useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { SCHEMA_TABLES, schemaFromSql } from './blocks/sqlExerciseSpec.js';

const staticSchema = new Map(); // dataset -> Promise<[{ table, columns }]>
function loadStaticSchema(dataset) {
  if (!staticSchema.has(dataset)) {
    const url = `${import.meta.env.BASE_URL}sql/datasets/${dataset.replace(/-hidden$/, '')}.sql`;
    staticSchema.set(dataset, fetch(url).then((r) => (r.ok ? r.text() : Promise.reject(new Error(String(r.status))))).then(schemaFromSql));
  }
  return staticSchema.get(dataset);
}

// The tables of the exercise's dataset with their columns, in a drawer. With the engine up it asks DESCRIBE (so after a DDL
// exercise ran it shows the tables as the learner left them); without it, it reads the dataset file.
export default function SchemaPanel({ dataset, client, ready, version = 0 }) {
  const { t } = useApp();
  const [open, setOpen] = useState(false);
  const [tables, setTables] = useState(null);
  const base = dataset.replace(/-hidden$/, '');

  useEffect(() => {
    if (!open) return undefined;
    let live = true;
    const fromFile = () => loadStaticSchema(dataset).then((s) => { if (live) setTables(s); }).catch(() => { if (live) setTables([]); });
    if (client && ready) {
      Promise.all(SCHEMA_TABLES[base].map((name) => client.describe(name, { dataset }).then((cols) => ({ table: name.toUpperCase(), columns: cols }))))
        .then((all) => { if (live) setTables(all); })
        .catch(fromFile);
    } else fromFile();
    return () => { live = false; };
  }, [open, client, ready, dataset, base, version]);

  return (
    <details className="sx-schema" open={open} onToggle={(e) => setOpen(e.currentTarget.open)} data-testid="sql-schema">
      <summary>{t('Tables', 'Tabelele')}</summary>
      {open && tables === null && <p className="sx-muted">{t('Loading…', 'Se încarcă…')}</p>}
      {open && tables && tables.length === 0 && <p className="sx-muted">{t('The tables could not be loaded.', 'Tabelele nu au putut fi încărcate.')}</p>}
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
