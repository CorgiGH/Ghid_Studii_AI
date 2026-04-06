import React from 'react';
import { useApp } from '../../../contexts/AppContext';

const VARIANTS = {
  tip:     { color: '#3b82f6', icon: '\uD83D\uDCA1', label: { en: 'Tip', ro: 'Sfat' } },
  warning: { color: '#f59e0b', icon: '\u26A0\uFE0F', label: { en: 'Warning', ro: 'Atenție' } },
  trap:    { color: '#ef4444', icon: '\uD83D\uDEA8', label: { en: 'Trap', ro: 'Capcană' } },
  info:    { color: '#10b981', icon: '\u2139\uFE0F', label: { en: 'Note', ro: 'Notă' } },
};

export default function CalloutBlock({ variant = 'info', content }) {
  const { t } = useApp();
  const v = VARIANTS[variant] || VARIANTS.info;

  return (
    <div
      className="rounded-xl p-4 mb-3"
      style={{
        backgroundColor: `color-mix(in srgb, ${v.color} 6%, var(--theme-card-bg))`,
        border: `1px solid color-mix(in srgb, ${v.color} 15%, var(--theme-border))`,
        borderLeftWidth: '3px',
        borderLeftColor: v.color,
      }}
    >
      <div
        className="text-[10px] font-bold uppercase tracking-widest mb-2"
        style={{ color: v.color }}
      >
        {v.icon} {t(v.label.en, v.label.ro)}
      </div>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--theme-content-text)' }}>
        {t(content.en, content.ro)}
      </p>
    </div>
  );
}
