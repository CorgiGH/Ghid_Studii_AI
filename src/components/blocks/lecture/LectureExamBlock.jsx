import React from 'react';
import { useApp } from '../../../contexts/AppContext';

export default function LectureExamBlock({ note, frequency, years }) {
  const { t } = useApp();
  const pct = frequency != null ? Math.round(frequency * 100) : null;
  return (
    <div className="rounded-xl p-3 mb-3" style={{ backgroundColor: 'color-mix(in srgb, #f59e0b 8%, var(--theme-card-bg))', border: '1px solid color-mix(in srgb, #f59e0b 15%, var(--theme-border))', borderLeftWidth: '3px', borderLeftColor: '#f59e0b' }}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#f59e0b' }}>{'\u26A0'} {t('Exam', 'Examen')}</span>
        {pct != null && <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: 'color-mix(in srgb, #f59e0b 20%, var(--theme-card-bg))', color: '#f59e0b' }}>{pct}%</span>}
      </div>
      {note && <div className="text-xs" style={{ color: 'var(--theme-content-text)' }}>{t(note.en, note.ro)}</div>}
      {years?.length > 0 && <div className="text-[10px] mt-1" style={{ color: 'var(--theme-muted-text)' }}>{t('Appeared in: ', 'Apărut în: ')}{years.join(', ')}</div>}
    </div>
  );
}
