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
  // rows can be: [...] | [{en:[], ro:[]}, ...] | {en: [[]], ro: [[]]}  (whole-table bilingual)
  const resolvedRows = (rows && !Array.isArray(rows) && rows.en) ? (t(rows.en, rows.ro) || rows.en) : rows;
  const resolveRow = (row) => {
    if (!Array.isArray(row) && row?.en) return t(row.en, row.ro) || row.en;
    return row;
  };
  return (
    <div
      className="overflow-x-auto mb-3 rounded-xl max-w-prose mx-auto"
      style={{
        border: '1px solid var(--theme-border)',
        // Soft right-edge fade signals horizontal scroll on narrow viewports.
        maskImage: 'linear-gradient(to right, black 0%, black 96%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, black 0%, black 96%, transparent 100%)',
        scrollbarWidth: 'thin',
        scrollbarColor: 'var(--theme-muted-text) transparent',
      }}
    >
      <table className="w-full text-sm" style={{ color: 'var(--theme-content-text)', minWidth: '0' }}>
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
          {resolvedRows?.map((row, ri) => {
            const cells = resolveRow(row);
            return (
              <tr
                key={ri}
                style={{
                  // Stronger zebra: every row gets a thin bottom border so wrapped
                  // cells stay visually grouped on narrow viewports.
                  backgroundColor: ri % 2
                    ? 'color-mix(in srgb, var(--theme-content-text) 6%, var(--theme-card-bg))'
                    : 'var(--theme-card-bg)',
                  borderBottom: '1px solid color-mix(in srgb, var(--theme-border) 50%, transparent)',
                }}
              >
                {cells.map((cell, ci) => {
                  // Cells that resolve to just an em-dash are structural
                  // placeholders (e.g. lower triangle of a divided-difference
                  // table). Render at reduced opacity so the populated cells
                  // form the visual figure.
                  const raw = typeof cell === 'object' ? t(cell.en, cell.ro) : cell;
                  const isPlaceholder = typeof raw === 'string' && raw.trim() === '—';
                  return (
                    <td
                      key={ci}
                      className="px-3 py-2 text-xs"
                      style={{
                        verticalAlign: 'top',
                        textAlign: 'left',
                        opacity: isPlaceholder ? 0.3 : 1,
                      }}
                    >
                      {resolveCell(cell, t)}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
