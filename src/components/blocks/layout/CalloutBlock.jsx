import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import formatMarkdown from '../formatMarkdown';

const VARIANTS = {
  tip:     { color: '#3b82f6', darkColor: '#93c5fd', icon: '\uD83D\uDCA1', label: { en: 'Tip', ro: 'Sfat' } },
  warning: { color: '#f59e0b', darkColor: '#fcd34d', icon: '\u26A0\uFE0F', label: { en: 'Warning', ro: 'Atenție' } },
  trap:    { color: '#ef4444', darkColor: '#fca5a5', icon: '\uD83D\uDEA8', label: { en: 'Trap', ro: 'Capcană' } },
  info:    { color: '#10b981', darkColor: '#6ee7b7', icon: '\u2139\uFE0F', label: { en: 'Note', ro: 'Notă' } },
};

export default function CalloutBlock({ variant = 'info', content }) {
  const { t, dark } = useApp();
  const v = VARIANTS[variant] || VARIANTS.info;

  // In dark mode reduce the tint fill so callouts read as softly-tinted cards
  // rather than saturated blocks. The left-border accent stays at full chroma.
  // Chip/label uses a lighter variant in dark mode for legibility on slate.
  const fillPct = dark ? '8%' : '12%';
  const chipColor = dark ? v.darkColor : v.color;

  return (
    <div
      className="rounded-xl p-4 mb-3"
      style={{
        backgroundColor: `color-mix(in srgb, ${v.color} ${fillPct}, var(--theme-card-bg))`,
        border: `1px solid color-mix(in srgb, ${v.color} 25%, var(--theme-border))`,
        borderLeftWidth: '3px',
        borderLeftColor: v.color,
      }}
    >
      <div
        className="text-xs font-semibold uppercase tracking-wide mb-2"
        style={{ color: chipColor }}
      >
        {v.icon} {t(v.label.en, v.label.ro)}
      </div>
      <div
        className="text-sm leading-relaxed"
        style={{ color: 'var(--theme-content-text)' }}
        dangerouslySetInnerHTML={{ __html: formatMarkdown(t(content.en, content.ro)) }}
      />
    </div>
  );
}
