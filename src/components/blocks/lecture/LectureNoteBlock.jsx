import React from 'react';
import { useApp } from '../../../contexts/AppContext';

export default function LectureNoteBlock({ slides, note, crossRef }) {
  const { t } = useApp();
  return (
    <div className="rounded-xl p-3 mb-3 flex items-start gap-3" style={{ backgroundColor: 'color-mix(in srgb, #818cf8 8%, var(--theme-card-bg))', border: '1px solid color-mix(in srgb, #818cf8 20%, var(--theme-border))' }}>
      <span className="text-lg">{'\uD83C\uDF93'}</span>
      <div>
        {slides && <div className="text-xs font-bold" style={{ color: '#a5b4fc' }}>{t(`Slides ${slides}`, `Slide-urile ${slides}`)}</div>}
        {note && <div className="text-xs mt-1" style={{ color: 'var(--theme-muted-text)' }}>{t(note.en, note.ro)}</div>}
        {crossRef && <div className="text-xs mt-1" style={{ color: '#818cf8' }}>{'\u2192'} {crossRef}</div>}
      </div>
    </div>
  );
}
