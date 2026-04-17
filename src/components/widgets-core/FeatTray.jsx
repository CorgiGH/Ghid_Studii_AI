import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';

/**
 * Collapsed-by-default tray listing earned feats for a widget.
 *
 * Props:
 *  - allFeats       : Array<{ id, label: {en, ro} }>
 *  - earnedFeatIds  : string[]
 */
export default function FeatTray({ allFeats, earnedFeatIds = [] }) {
  const { t } = useApp();
  const [open, setOpen] = useState(false);

  if (!allFeats?.length) return null;
  const earned = earnedFeatIds.length;
  const total = allFeats.length;

  return (
    <div className="rounded-md border text-sm"
         style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-content-bg)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between px-3 py-2"
        style={{ color: 'var(--theme-content-text)' }}
      >
        <span className="font-medium">
          {t('Feats', 'Fapte')} · {earned}/{total}
        </span>
        <span>{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <ul className="px-3 pb-3 space-y-1">
          {allFeats.map(f => {
            const got = earnedFeatIds.includes(f.id);
            return (
              <li key={f.id}
                  className="flex items-center gap-2"
                  style={{ color: got ? 'var(--theme-content-text)' : 'var(--theme-muted-text)' }}>
                <span>{got ? '✓' : '○'}</span>
                <span>{t(f.label.en, f.label.ro)}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
