import React, { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { fractionToKatex, toFraction } from '../../content/alo/linalg/fractions';

/**
 * KaTeX-rendered bracketed matrix.
 *
 * Props:
 *  - value     : (number | Fraction | string)[][]
 *  - highlight : { rows?: number[], cols?: number[], cells?: Array<[r,c]> }
 *  - bracket   : 'b' | 'p' | 'v'  (default 'b' = [ ])
 *  - asLatex   : if true, returns the LaTeX string instead of rendering (for embedding)
 */
export default function MatrixDisplay({ value, highlight = {}, bracket = 'b', asLatex = false }) {
  const ref = useRef(null);
  const latex = matrixLatex(value, highlight, bracket);

  useEffect(() => {
    if (asLatex || !ref.current) return;
    katex.render(latex, ref.current, {
      throwOnError: false,
      displayMode: true,
      output: 'html',
    });
  }, [latex, asLatex]);

  if (asLatex) return latex;
  return <div ref={ref} aria-label={`Matrix ${latex}`} className="inline-block" />;
}

function matrixLatex(value, highlight, bracket) {
  const bRow = (row, r) =>
    row.map((cell, c) => wrapCell(fmt(cell), { r, c, ...highlight })).join(' & ');
  const body = value.map(bRow).join(' \\\\ ');
  return `\\begin{${bracket}matrix} ${body} \\end{${bracket}matrix}`;
}

function fmt(cell) {
  if (cell == null) return '\\,';
  if (typeof cell === 'number') return Number.isInteger(cell) ? `${cell}` : `${Number(cell).toFixed(3).replace(/\.?0+$/, '')}`;
  if (typeof cell === 'string') return cell;
  return fractionToKatex(toFraction(cell));
}

function wrapCell(inner, { r, c, rows = [], cols = [], cells = [] }) {
  const isTarget = cells.some(([rr, cc]) => rr === r && cc === c);
  const isPivotRow = rows.includes(r);
  const isPivotCol = cols.includes(c);
  if (isTarget) return `\\color{#22c55e}{${inner}}`;
  if (isPivotRow || isPivotCol) return `\\color{#f59e0b}{${inner}}`;
  return inner;
}
