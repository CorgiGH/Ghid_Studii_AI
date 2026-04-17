import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import MatrixDisplay from './MatrixDisplay';

/**
 * Shared transport + scrubber for Step[] animations.
 *
 * Props:
 *  - steps          : Step[]  ({ matrix, highlights, label: {en,ro}, metric? })
 *  - renderStep?    : (step, index) => ReactNode  — override default render
 *  - intervalMs     : default 900 (controls autoplay cadence)
 *  - onIndexChange? : (i) => void
 */
export default function StepPlayer({ steps, renderStep, intervalMs = 900, onIndexChange }) {
  const { t } = useApp();
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [reduced, setReduced] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);

  useEffect(() => { onIndexChange?.(i); }, [i, onIndexChange]);

  useEffect(() => {
    if (!playing) return;
    timerRef.current = setInterval(() => {
      setI((prev) => {
        if (prev >= steps.length - 1) { setPlaying(false); return prev; }
        return prev + 1;
      });
    }, reduced ? 10 : intervalMs);
    return () => clearInterval(timerRef.current);
  }, [playing, intervalMs, reduced, steps.length]);

  const onKeyDown = (e) => {
    if (e.key === ' ') { e.preventDefault(); setPlaying(p => !p); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); setI(prev => Math.min(steps.length - 1, prev + 1)); }
    else if (e.key === 'ArrowLeft')  { e.preventDefault(); setI(prev => Math.max(0, prev - 1)); }
    else if (e.key === 'Home')       { e.preventDefault(); setI(0); }
    else if (e.key === 'End')        { e.preventDefault(); setI(steps.length - 1); }
  };

  if (!steps?.length) return null;
  const step = steps[i];

  return (
    <div
      tabIndex={0}
      onKeyDown={onKeyDown}
      className="flex flex-col gap-3 p-3 rounded-md focus:outline-none focus:ring-2"
      style={{ background: 'var(--theme-content-bg-alt, #f8fafc)', border: '1px solid var(--theme-border)' }}
      aria-label={t('Step player', 'Player pași')}
    >
      <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--theme-content-text)' }}>
        <span className="font-bold">{i + 1}/{steps.length}:</span>
        <span>{t(step.label.en, step.label.ro)}</span>
      </div>

      {renderStep ? renderStep(step, i) : <MatrixDisplay value={step.matrix} highlight={step.highlights} />}

      <div className="flex items-center gap-2">
        <button
          onClick={() => setI(0)}
          aria-label={t('Restart', 'Repornire')}
          className="px-2 py-1 text-sm rounded border"
          style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-content-text)' }}
        >⏮</button>
        <button
          onClick={() => setI(prev => Math.max(0, prev - 1))}
          aria-label={t('Previous step', 'Pas anterior')}
          className="px-2 py-1 text-sm rounded border"
          style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-content-text)' }}
        >◀</button>
        <button
          onClick={() => setPlaying(p => !p)}
          aria-label={playing ? t('Pause', 'Pauză') : t('Play', 'Redare')}
          className="px-3 py-1 text-sm rounded"
          style={{ background: '#3b82f6', color: '#fff' }}
        >{playing ? '⏸' : '▶'}</button>
        <button
          onClick={() => setI(prev => Math.min(steps.length - 1, prev + 1))}
          aria-label={t('Next step', 'Pas următor')}
          className="px-2 py-1 text-sm rounded border"
          style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-content-text)' }}
        >▶</button>
        <input
          type="range"
          min={0}
          max={Math.max(0, steps.length - 1)}
          value={i}
          onChange={(e) => setI(Number(e.target.value))}
          aria-label={t('Scrub to step', 'Derulează la pas')}
          className="flex-1"
        />
      </div>
    </div>
  );
}
