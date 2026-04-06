import React from 'react';
import { useApp } from '../../../contexts/AppContext';

export default function CodeChallengeBlock({ variant }) {
  const { t } = useApp();
  return (
    <div className="rounded-xl p-4 mb-3" style={{ backgroundColor: 'color-mix(in srgb, #10b981 6%, var(--theme-card-bg))', border: '1px solid color-mix(in srgb, #10b981 15%, var(--theme-border))' }}>
      <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#10b981' }}>{t('Code Challenge', 'Provocare cod')}</div>
      <div className="text-xs" style={{ color: 'var(--theme-muted-text)' }}>{t('Code challenge placeholder', 'Placeholder provocare cod')}</div>
    </div>
  );
}
