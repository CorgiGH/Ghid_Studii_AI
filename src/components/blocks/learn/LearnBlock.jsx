import React from 'react';
import { useApp } from '../../../contexts/AppContext';

/** Minimal inline markdown: **bold** and `code` only */
function formatMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code style="background:var(--theme-border);padding:1px 5px;border-radius:4px;font-size:0.85em;">$1</code>')
    .replace(/\n/g, '<br/>');
}

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
        className="text-sm leading-relaxed"
        style={{ color: 'var(--theme-content-text)' }}
        dangerouslySetInnerHTML={{ __html: formatMarkdown(text) }}
      />
    </div>
  );
}
