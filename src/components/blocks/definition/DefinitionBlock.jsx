import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import formatMarkdown from '../formatMarkdown';

export default function DefinitionBlock({ term, content }) {
  const { t } = useApp();

  return (
    <div
      className="rounded-xl p-4 mb-3"
      style={{
        backgroundColor: 'color-mix(in srgb, #60a5fa 8%, var(--theme-card-bg))',
        border: '1px solid color-mix(in srgb, #60a5fa 20%, var(--theme-border))',
      }}
    >
      <div
        className="text-xs font-semibold uppercase tracking-wide mb-2"
        style={{ color: '#60a5fa' }}
      >
        {t('Definition', 'Definiție')}
      </div>
      <p
        className="font-bold text-sm mb-1"
        style={{ color: 'var(--theme-content-text)' }}
        dangerouslySetInnerHTML={{ __html: formatMarkdown(t(term.en, term.ro)) }}
      />
      <div
        className="text-sm leading-relaxed"
        style={{ color: 'var(--theme-content-text)', opacity: 0.85 }}
        dangerouslySetInnerHTML={{ __html: formatMarkdown(t(content.en, content.ro)) }}
      />
    </div>
  );
}
