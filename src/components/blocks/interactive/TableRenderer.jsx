import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../../../contexts/AppContext';
import StepPlayer from './StepPlayer';

const CELL_COLORS = {
  active:     { bg: '#f59e0b', text: 'white' },
  computed:   { bg: 'color-mix(in srgb, #22c55e 15%, var(--theme-card-bg))', text: 'var(--theme-content-text)' },
  dependency: { bg: 'var(--theme-card-bg)', text: '#3b82f6', border: '#3b82f6' },
  pending:    { bg: 'var(--theme-card-bg)', text: 'var(--theme-muted-text)' },
};

export default function TableRenderer({ data }) {
  const { t } = useApp();
  const { meta, config, steps } = data;
  const [currentStep, setCurrentStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const timerRef = useRef(null);

  const step = steps[currentStep];
  const rows = config?.rows || [];
  const cols = config?.cols || [];

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
    }, 600 / speed);
    return stopTimer;
  }, [playing, speed, steps.length, stopTimer]);

  // Build cumulative fills up to current step
  const fills = {};
  for (let i = 0; i <= currentStep; i++) {
    if (steps[i].fills) {
      Object.assign(fills, steps[i].fills);
    }
  }

  const getCellState = (coord) => {
    if (coord === step.active) return 'active';
    if (step.dependencies?.includes(coord)) return 'dependency';
    if (fills[coord] !== undefined) return 'computed';
    return 'pending';
  };

  return (
    <div className="rounded-xl p-4 mb-3" style={{
      backgroundColor: 'color-mix(in srgb, #10b981 12%, var(--theme-card-bg))',
      border: '1px solid color-mix(in srgb, #10b981 25%, var(--theme-border))',
    }}>
      <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#10b981' }}>
        {meta?.algorithm || t('DP Table', 'Tabel PD')}
      </div>

      {meta?.description && (
        <p className="text-xs mb-3" style={{ color: 'var(--theme-muted-text)' }}>
          {t(meta.description.en, meta.description.ro)}
        </p>
      )}

      {/* Table grid */}
      <div className="overflow-x-auto mb-3">
        <table className="mx-auto text-xs" style={{ borderCollapse: 'separate', borderSpacing: '3px' }}>
          {/* Column headers */}
          {cols.length > 1 && (
            <thead>
              <tr>
                <td />
                {cols.map((col, ci) => (
                  <td key={ci} className="text-center px-2 py-1 font-semibold" style={{ color: 'var(--theme-muted-text)' }}>
                    {col}
                  </td>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
                <td className="px-2 py-1 font-semibold text-right" style={{ color: 'var(--theme-muted-text)' }}>
                  {row}
                </td>
                {cols.map((_, ci) => {
                  const coord = `${ri},${ci}`;
                  const state = getCellState(coord);
                  const colors = CELL_COLORS[state];
                  const value = fills[coord];

                  return (
                    <td key={ci} className="text-center">
                      <motion.div
                        className="w-10 h-8 rounded flex items-center justify-center font-mono"
                        style={{
                          backgroundColor: colors.bg,
                          color: colors.text,
                          border: state === 'dependency' ? `1.5px solid ${colors.border}` : state === 'pending' ? '1.5px dashed var(--theme-border)' : '1.5px solid transparent',
                        }}
                        animate={state === 'active' ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {value !== undefined ? value : '?'}
                      </motion.div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
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
