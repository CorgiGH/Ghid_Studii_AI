import { parseFraction } from '../../content/alo/linalg/fractions';

export function emptyMatrixValue(rows, cols, fill = '') {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => fill));
}

export function readMatrixValue(value, mode = 'int') {
  const matrix = value.map(row =>
    row.map(cell => {
      if (cell === '' || cell == null) return null;
      if (mode === 'fraction') return parseFraction(cell);
      const n = Number(cell);
      return Number.isNaN(n) ? null : n;
    })
  );
  const allValid = matrix.every(row => row.every(v => v != null));
  return { matrix, allValid };
}
