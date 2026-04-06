import React from 'react';
import { useApp } from '../../../contexts/AppContext';

export default function AnimationBlock({ variant }) {
  const { t } = useApp();
  return (
    <div className="rounded-xl p-4 mb-3 text-center" style={{ backgroundColor: 'color-mix(in srgb, #10b981 6%, var(--theme-card-bg))', border: '1px solid color-mix(in srgb, #10b981 15%, var(--theme-border))' }}>
      <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#10b981' }}>{'\uD83C\uDFAC'} {t('Animation', 'Animație')}</div>
      <div className="text-xs" style={{ color: 'var(--theme-muted-text)' }}>{t('Animation placeholder', 'Placeholder animație')}: {variant}</div>
    </div>
  );
}
