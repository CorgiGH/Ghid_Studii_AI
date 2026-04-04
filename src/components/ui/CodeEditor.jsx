import React, { useRef, useCallback } from 'react';
import { useApp } from '../../contexts/AppContext';

export default function CodeEditor({ value, onChange, readOnly = false }) {
  const { dark } = useApp();
  const textareaRef = useRef(null);

  const handleChange = useCallback((e) => {
    if (onChange) onChange(e.target.value);
  }, [onChange]);

  const handleKeyDown = useCallback((e) => {
    // Tab inserts 2 spaces instead of changing focus
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.target;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      if (onChange) onChange(newValue);
      // Restore cursor position after React re-render
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2;
      });
    }
  }, [value, onChange]);

  return (
    <textarea
      ref={textareaRef}
      value={value || ''}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      readOnly={readOnly}
      spellCheck={false}
      className="w-full font-mono text-sm p-4 resize-y outline-none min-h-[200px]"
      style={{
        backgroundColor: dark ? '#1e1e2e' : '#fafafa',
        color: dark ? '#cdd6f4' : '#1e1e1e',
        border: 'none',
        borderTop: `1px solid ${dark ? '#45475a' : '#e5e7eb'}`,
        borderBottom: `1px solid ${dark ? '#45475a' : '#e5e7eb'}`,
        tabSize: 2,
        lineHeight: 1.6,
      }}
    />
  );
}
