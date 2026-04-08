import React from 'react';
import { useApp } from '../../../contexts/AppContext';

/** Minimal inline markdown: **bold** and `code` */
function fmt(text) {
  if (typeof text !== 'string') return text;
  const html = text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code style="background:var(--theme-border);padding:1px 4px;border-radius:3px;font-size:0.85em;">$1</code>');
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
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
    <div className="overflow-x-auto mb-3 rounded-xl" style={{ border: '1px solid var(--theme-border)' }}>
      <table className="w-full text-sm" style={{ color: 'var(--theme-content-text)' }}>
        {resolvedHeaders && (
          <thead>
            <tr style={{ backgroundColor: 'var(--theme-border)' }}>
              {resolvedHeaders.map((h, i) => <th key={i} className="px-3 py-2 text-left font-bold text-xs">{resolveCell(h, t)}</th>)}
            </tr>
          </thead>
        )}
        <tbody>
          {rows?.map((row, ri) => {
            const cells = resolveRow(row);
            return (
              <tr key={ri} style={ri % 2 ? { backgroundColor: 'var(--theme-card-bg)' } : {}}>
                {cells.map((cell, ci) => <td key={ci} className="px-3 py-2 text-xs">{resolveCell(cell, t)}</td>)}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
