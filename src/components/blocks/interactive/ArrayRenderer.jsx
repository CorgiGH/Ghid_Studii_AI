import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../../../contexts/AppContext';
import StepPlayer from './StepPlayer';

const COLORS = {
  comparing: '#ef4444',
  swapped: '#22c55e',
  sorted: '#86efac',
  pivot: '#f59e0b',
  found: '#3b82f6',
  default: 'var(--theme-border)',
};

export default function ArrayRenderer({ data }) {
  const { t } = useApp();
  const { meta, config, steps } = data;
  const [currentStep, setCurrentStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const timerRef = useRef(null);

  const step = steps[currentStep];
  const display = config?.display || 'bars';
  const maxVal = Math.max(...steps.flatMap(s => s.array));

  const stopTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  useEffect(() => {
    if (!playing) { stopTimer(); return; }
    timerRef.current = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length - 1) { setPlaying(false); return prev; }
        return prev + 1;
      });
    }, 800 / speed);
    return stopTimer;
  }, [playing, speed, steps.length, stopTimer]);

  const getColor = (index) => {
    const h = step.highlights || {};
    if (h.sorted?.includes(index)) return COLORS.sorted;
    if (h.comparing?.includes(index)) return COLORS.comparing;
    if (h.swapped?.includes(index)) return COLORS.swapped;
    if (h.pivot?.includes(index)) return COLORS.pivot;
    if (h.found?.includes(index)) return COLORS.found;
    return COLORS.default;
  };

  return (
    <div className="rounded-xl p-4 mb-3" style={{
      backgroundColor: 'color-mix(in srgb, #10b981 12%, var(--theme-card-bg))',
      border: '1px solid color-mix(in srgb, #10b981 25%, var(--theme-border))',
    }}>
      <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#10b981' }}>
        {meta?.algorithm || t('Animation', 'Animatie')}
      </div>

      {meta?.description && (
        <p className="text-xs mb-3" style={{ color: 'var(--theme-muted-text)' }}>
          {t(meta.description.en, meta.description.ro)}
        </p>
      )}

      {/* Array visualization */}
      <div className="flex items-end gap-1 justify-center mb-3" style={{ height: display === 'bars' ? '120px' : 'auto' }}>
        {step.array.map((val, i) => {
          const color = getColor(i);
          if (display === 'bars') {
            return (
              <motion.div
                key={i}
                layout
                className="rounded-t-sm flex items-end justify-center text-[10px] font-bold text-white"
                style={{ backgroundColor: color, width: `${Math.max(100 / step.array.length - 2, 8)}%` }}
                animate={{ height: `${(val / maxVal) * 100}%` }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                <span className="pb-0.5">{val}</span>
              </motion.div>
            );
          }
          // cells mode
          return (
            <motion.div
              key={i}
              layout
              className="w-10 h-10 rounded flex items-center justify-center text-sm font-bold"
              style={{ backgroundColor: color, color: color === COLORS.default ? 'var(--theme-content-text)' : 'white' }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              {val}
            </motion.div>
          );
        })}
      </div>

      {/* Step label */}
      {step.label && (
        <p className="text-xs text-center mb-2" style={{ color: 'var(--theme-content-text)' }}>
          {t(step.label.en, step.label.ro)}
        </p>
      )}

      <StepPlayer
        totalSteps={steps.length}
        currentStep={currentStep}
        onStepChange={setCurrentStep}
        playing={playing}
        onPlayPause={() => setPlaying(p => !p)}
        speed={speed}
        onSpeedChange={setSpeed}
      />
    </div>
  );
}
