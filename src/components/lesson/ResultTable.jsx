import React from 'react';
import { useApp } from '../../contexts/AppContext';

// A query result as a table: header, rows, "n rows" line and a note when the engine cut the list. `mark` tints rows
// (extra rows of the learner's table, missing rows of the expected one). NULL reads NULL, never a blank.
export default function ResultTable({ title, columns, rows, rowCount, truncated = false, mark, markKind = 'extra', caption, empty }) {
  const { t } = useApp();
  const total = rowCount ?? rows.length;
  return (
    <figure className="sx-table" data-testid="sql-result-table">
      {title && <figcaption className="sx-table-title">{title}</figcaption>}
      <div className="sx-table-scroll" tabIndex={0} role="region" aria-label={title || t('Result', 'Rezultat')}>
        <table>
          <thead>
            <tr>{columns.map((c, i) => <th key={i} scope="col">{c}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((r, ri) => (
              <tr key={ri} className={mark?.[ri] ? `is-${markKind}` : undefined}>
                {r.map((v, ci) => (
                  <td key={ci} className={v === null || v === undefined ? 'nul' : undefined}>{v === null || v === undefined ? 'NULL' : v}</td>
                ))}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td className="nul" colSpan={Math.max(1, columns.length)}>{empty || t('No rows', 'Niciun rând')}</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="sx-table-count" data-testid="sql-row-count">
        {t(`${total} ${total === 1 ? 'row' : 'rows'}`, `${total} ${total === 1 ? 'rând' : 'rânduri'}`)}
        {truncated && <span className="sx-trunc"> · {t(`showing the first ${rows.length}`, `se afișează primele ${rows.length}`)}</span>}
        {caption && <span> · {caption}</span>}
      </p>
    </figure>
  );
}
