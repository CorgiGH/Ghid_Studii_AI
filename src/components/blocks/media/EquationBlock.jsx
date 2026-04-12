import React from 'react';
import katex from 'katex';
import { useApp } from '../../../contexts/AppContext';

/**
 * Standalone centered math equation. JSON shape:
 *   { "type": "equation", "tex": "Ax = \\lambda x", "label": { "en": "(1)", "ro": "(1)" } }
 * `label` is optional.
 *
 * Visual: left accent-rail + subtle tint (whiteboard metaphor), no card border.
 * Label sits in a right gutter via CSS grid, italic serif to match KaTeX typography.
 * KaTeX output is htmlAndMathml for screen-reader accessibility.
 */
export default function EquationBlock({ tex, label }) {
  const { t } = useApp();
  if (!tex) return null;

  let html;
  try {
    html = katex.renderToString(tex, { displayMode: true, throwOnError: false, output: 'htmlAndMathml' });
  } catch {
    html = `<span style="color:var(--theme-error, #ef4444)">[math error: ${tex}]</span>`;
  }

  return (
    <div
      className="my-4 py-3 pl-4 pr-4 rounded-r-lg"
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        alignItems: 'center',
        columnGap: '1rem',
        borderLeft: '3px solid #3b82f6',
        background: 'color-mix(in srgb, var(--theme-content-text) 3%, transparent)',
      }}
    >
      <div
        className="math-display-wrap"
        style={{ fontSize: '1.05em' }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {label && (
        <div
          className="text-sm italic flex-shrink-0"
          style={{
            color: 'var(--theme-muted-text)',
            fontFamily: 'Georgia, "Times New Roman", serif',
          }}
        >
          {t(label.en, label.ro)}
        </div>
      )}
    </div>
  );
}
