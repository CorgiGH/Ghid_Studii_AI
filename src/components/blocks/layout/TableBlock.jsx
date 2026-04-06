import React from 'react';
import { useApp } from '../../../contexts/AppContext';

export default function TableBlock({ headers, rows }) {
  const { t } = useApp();
  return (
    <div className="overflow-x-auto mb-3 rounded-xl" style={{ border: '1px solid var(--theme-border)' }}>
      <table className="w-full text-sm" style={{ color: 'var(--theme-content-text)' }}>
        {headers && (
          <thead>
            <tr style={{ backgroundColor: 'var(--theme-border)' }}>
              {headers.map((h, i) => <th key={i} className="px-3 py-2 text-left font-bold text-xs">{typeof h === 'object' ? t(h.en, h.ro) : h}</th>)}
            </tr>
          </thead>
        )}
        <tbody>
          {rows?.map((row, ri) => (
            <tr key={ri} style={ri % 2 ? { backgroundColor: 'var(--theme-card-bg)' } : {}}>
              {row.map((cell, ci) => <td key={ci} className="px-3 py-2 text-xs">{typeof cell === 'object' ? t(cell.en, cell.ro) : cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
