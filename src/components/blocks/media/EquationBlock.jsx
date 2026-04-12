import React from 'react';
import katex from 'katex';
import { useApp } from '../../../contexts/AppContext';

/**
 * Standalone centered math equation. JSON shape:
 *   { "type": "equation", "tex": "Ax = \\lambda x", "label": { "en": "(1)", "ro": "(1)" } }
 * `label` is optional.
 */
export default function EquationBlock({ tex, label }) {
  const { t } = useApp();
  if (!tex) return null;

  let html;
  try {
    html = katex.renderToString(tex, { displayMode: true, throwOnError: false, output: 'html' });
  } catch {
    html = `<span style="color:#ef4444">[math error: ${tex}]</span>`;
  }

  return (
    <div
      className="my-4 py-3 px-4 rounded-lg flex items-center justify-between gap-4"
      style={{
        backgroundColor: 'var(--theme-card-bg)',
        border: '1px solid var(--theme-border)',
      }}
    >
      <div className="flex-1 overflow-x-auto" dangerouslySetInnerHTML={{ __html: html }} />
      {label && (
        <div
          className="text-xs font-mono flex-shrink-0"
          style={{ color: 'var(--theme-muted-text)' }}
        >
          {t(label.en, label.ro)}
        </div>
      )}
    </div>
  );
}
