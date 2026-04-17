import React from 'react';
import { useApp } from '../../contexts/AppContext';

const SHORTCUTS = [
  { keys: ['j', '↓'], label: { en: 'Next problem', ro: 'Problema următoare' } },
  { keys: ['k', '↑'], label: { en: 'Previous problem', ro: 'Problema anterioară' } },
  { keys: ['1–9', '0'], label: { en: 'Jump to problem N', ro: 'Sari la problema N' } },
  { keys: ['Enter'], label: { en: 'Submit / check', ro: 'Trimite / verifică' } },
  { keys: ['r'], label: { en: 'Toggle solution', ro: 'Arată/ascunde soluția' } },
  { keys: ['n'], label: { en: 'New instance (Practice)', ro: 'Instanță nouă (Practică)' } },
  { keys: ['?'], label: { en: 'This cheat sheet', ro: 'Acest ghid' } },
  { keys: ['Esc'], label: { en: 'Close', ro: 'Închide' } },
];

export default function ShortcutCheatSheet({ open, onClose }) {
  const { t } = useApp();
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('Keyboard shortcuts', 'Scurtături tastatură')}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="rounded-lg p-6 max-w-md w-full"
        style={{ background: 'var(--theme-content-bg)', border: '1px solid var(--theme-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--theme-content-text)' }}>
          {t('Keyboard shortcuts', 'Scurtături tastatură')}
        </h3>
        <ul className="space-y-2">
          {SHORTCUTS.map((s, i) => (
            <li key={i} className="flex items-center justify-between">
              <span style={{ color: 'var(--theme-content-text)' }}>
                {t(s.label.en, s.label.ro)}
              </span>
              <span className="flex gap-1">
                {s.keys.map(k => (
                  <kbd key={k} className="px-2 py-0.5 rounded text-xs font-mono"
                       style={{ background: 'var(--theme-content-bg-alt, #f1f5f9)', border: '1px solid var(--theme-border)', color: 'var(--theme-content-text)' }}>
                    {k}
                  </kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
