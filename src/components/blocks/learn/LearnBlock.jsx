import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import formatMarkdown from '../formatMarkdown';

export default function LearnBlock({ content }) {
  const { t } = useApp();
  const text = t(content.en, content.ro);

  return (
    <div
      className="rounded-xl p-4 mb-3"
      style={{
        backgroundColor: 'var(--theme-card-bg)',
        border: '1px solid var(--theme-border)',
      }}
    >
      <div
        className="text-xs font-semibold uppercase tracking-wide mb-2"
        style={{ color: '#3b82f6' }}
      >
        {t('Learn', 'Învață')}
      </div>
      <div
        className="text-[15px] leading-relaxed"
        style={{ color: 'var(--theme-content-text)' }}
        dangerouslySetInnerHTML={{ __html: formatMarkdown(text) }}
      />
    </div>
  );
}
