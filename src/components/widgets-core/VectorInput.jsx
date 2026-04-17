import React from 'react';
import MatrixGrid from './MatrixGrid';

/**
 * Single-row vector input. Wraps MatrixGrid with rows=1.
 *
 * Props:
 *  - length, value (string[]), onChange(string[]), mode, readOnly
 */
export default function VectorInput({ length, value, onChange, mode = 'int', readOnly = false, ariaLabel }) {
  const matrixValue = [value ?? Array(length).fill('')];
  return (
    <MatrixGrid
      rows={1}
      cols={length}
      value={matrixValue}
      onChange={(next) => onChange?.(next[0])}
      mode={mode}
      readOnly={readOnly}
      ariaLabel={ariaLabel ?? 'Vector input'}
    />
  );
}
