import React, { useCallback, useRef } from 'react';
import { parseFraction } from '../../content/alo/linalg/fractions';

/**
 * Focus-ring matrix input grid.
 *
 * Props:
 *  - rows, cols : integer dimensions
 *  - value      : (string | null)[][] — raw text per cell; null = empty
 *  - onChange(value)
 *  - mode       : 'int' | 'fraction' | 'number'  (controls validation only)
 *  - readOnly   : boolean
 *  - cellSize   : px (default 44)
 *  - ariaLabel  : string
 */
export default function MatrixGrid({
  rows, cols, value, onChange,
  mode = 'int', readOnly = false, cellSize = 44, ariaLabel = 'Matrix input',
}) {
  const gridRef = useRef(null);

  const setCell = (r, c, text) => {
    const next = value.map(row => row.slice());
    next[r][c] = text;
    onChange?.(next);
  };

  const isValid = (text) => {
    if (text === '' || text == null) return true;
    if (mode === 'int') return /^-?\d+$/.test(text);
    if (mode === 'fraction') return parseFraction(text) != null;
    return !Number.isNaN(Number(text));
  };

  const onKeyDown = useCallback((e, r, c) => {
    let nr = r, nc = c;
    if (e.key === 'ArrowRight') nc = Math.min(cols - 1, c + 1);
    else if (e.key === 'ArrowLeft') nc = Math.max(0, c - 1);
    else if (e.key === 'ArrowDown') nr = Math.min(rows - 1, r + 1);
    else if (e.key === 'ArrowUp') nr = Math.max(0, r - 1);
    else if (e.key === 'Tab') return;
    else return;
    e.preventDefault();
    const target = gridRef.current?.querySelector(`[data-cell="${nr}-${nc}"]`);
    target?.focus();
  }, [rows, cols]);

  return (
    <div
      ref={gridRef}
      role="grid"
      aria-label={ariaLabel}
      className="inline-grid gap-1 p-2 rounded-md"
      style={{
        gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
        backgroundColor: 'var(--theme-content-bg-alt, #f1f5f9)',
        border: '1px solid var(--theme-border)',
      }}
    >
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: cols }).map((_, c) => {
          const cellVal = value?.[r]?.[c] ?? '';
          const valid = isValid(cellVal);
          return (
            <input
              key={`${r}-${c}`}
              data-cell={`${r}-${c}`}
              role="gridcell"
              aria-label={`row ${r + 1} column ${c + 1}`}
              type="text"
              value={cellVal}
              readOnly={readOnly}
              onChange={(e) => setCell(r, c, e.target.value)}
              onKeyDown={(e) => onKeyDown(e, r, c)}
              className="text-center font-mono rounded focus:outline-none focus:ring-2"
              style={{
                width: cellSize, height: cellSize,
                background: 'var(--theme-content-bg)',
                color: 'var(--theme-content-text)',
                border: `1px solid ${valid ? 'var(--theme-border)' : '#ef4444'}`,
                caretColor: '#3b82f6',
              }}
            />
          );
        })
      )}
    </div>
  );
}
