import React from 'react';
import { useApp } from '../../../contexts/AppContext';

export default function TerminalBlock() {
  const { t } = useApp();
  return (
    <div className="rounded-xl p-4 mb-3" style={{ backgroundColor: '#0a0a0f', border: '1px solid var(--theme-border)' }}>
      <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#10b981' }}>{'\uD83D\uDCBB'} {t('Terminal', 'Terminal')}</div>
      <div className="text-xs" style={{ color: 'var(--theme-muted-text)' }}>{t('Terminal placeholder', 'Placeholder terminal')}</div>
    </div>
  );
}
