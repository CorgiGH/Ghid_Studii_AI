import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import formatMarkdown from '../formatMarkdown';

function fmt(text) {
  if (typeof text !== 'string') return text;
  return <span dangerouslySetInnerHTML={{ __html: formatMarkdown(text) }} />;
}

function resolveCell(cell, t) {
  const raw = typeof cell === 'object' ? t(cell.en, cell.ro) : cell;
  return fmt(raw);
}

export default function TableBlock({ headers, rows }) {
  const { t } = useApp();
  // Support both array format and bilingual object format { en: [], ro: [] }
  const resolvedHeaders = headers && !Array.isArray(headers) && headers.en ? (t(headers.en, headers.ro) || headers.en) : headers;
  const resolveRow = (row) => {
    if (!Array.isArray(row) && row?.en) return t(row.en, row.ro) || row.en;
    return row;
  };
  return (
    <div
      className="overflow-x-auto mb-3 rounded-xl max-w-prose mx-auto"
      style={{ border: '1px solid var(--theme-border)' }}
    >
      <table className="w-full text-sm" style={{ color: 'var(--theme-content-text)' }}>
        {resolvedHeaders && (
          <thead>
            <tr style={{ backgroundColor: 'var(--theme-border)' }}>
              {resolvedHeaders.map((h, i) => (
                <th
                  key={i}
                  className="px-3 py-2 text-left font-bold text-xs"
                  style={{ verticalAlign: 'top' }}
                >
                  {resolveCell(h, t)}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {rows?.map((row, ri) => {
            const cells = resolveRow(row);
            return (
              <tr key={ri} style={ri % 2 ? { backgroundColor: 'var(--theme-card-bg)' } : {}}>
                {cells.map((cell, ci) => (
                  <td
                    key={ci}
                    className="px-3 py-2 text-xs"
                    style={{ verticalAlign: 'top', textAlign: 'left' }}
                  >
                    {resolveCell(cell, t)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
