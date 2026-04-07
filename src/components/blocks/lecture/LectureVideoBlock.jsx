import React from 'react';
import { useApp } from '../../../contexts/AppContext';

export default function LectureVideoBlock({ url, title, label, duration, relevance }) {
  const { t } = useApp();
  const displayTitle = label ? (typeof label === 'object' ? t(label.en, label.ro) : label) : title;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl p-3 mb-3 no-underline transition-colors" style={{ backgroundColor: 'color-mix(in srgb, #818cf8 6%, var(--theme-card-bg))', border: '1px solid color-mix(in srgb, #818cf8 15%, var(--theme-border))' }}>
      <div className="w-12 h-8 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'color-mix(in srgb, #ef4444 15%, var(--theme-card-bg))' }}>
        <span style={{ color: '#ef4444' }}>{'\u25B6'}</span>
      </div>
      <div>
        <div className="text-xs font-bold" style={{ color: 'var(--theme-content-text)' }}>{displayTitle}</div>
        <div className="text-[10px]" style={{ color: 'var(--theme-muted-text)' }}>{duration}{relevance && ` \u00B7 ${relevance}`}</div>
      </div>
    </a>
  );
}
