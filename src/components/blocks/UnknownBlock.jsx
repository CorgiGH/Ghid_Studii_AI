import React from 'react';
import { useApp } from '../../contexts/AppContext';

export default function UnknownBlock({ type }) {
  const { t } = useApp();
  return (
    <div
      className="rounded-lg p-3 mb-3 text-sm"
      style={{
        border: '1px dashed var(--theme-border)',
        backgroundColor: 'var(--theme-card-bg)',
        color: 'var(--theme-muted-text)',
      }}
    >
      {t(
        `Unknown block type: "${type}". Register it in registry.js to render.`,
        `Tip de bloc necunoscut: „${type}". Înregistrați-l în registry.js pentru a-l afișa.`
      )}
    </div>
  );
}
