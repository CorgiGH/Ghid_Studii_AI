import React, { useState, useEffect } from 'react';
import { useApp } from '../../../contexts/AppContext';

const SPEEDS = [0.5, 1, 2, 4];

export default function StepPlayer({ totalSteps, currentStep, onStepChange, playing, onPlayPause, speed, onSpeedChange, currentStepData }) {
  const { t, lang } = useApp();
  const [predictionPending, setPredictionPending] = useState(false);

  const prediction = currentStepData?.prediction;

  // Reset prediction state when step changes externally (e.g. back button, slider)
  useEffect(() => {
    if (prediction) {
      setPredictionPending(true);
    } else {
      setPredictionPending(false);
    }
  }, [currentStep, prediction]);

  const canBack = currentStep > 0;
  const canForward = currentStep < totalSteps - 1;

  const handleForward = () => {
    if (!canForward && !predictionPending) return;
    if (predictionPending) {
      // First click: reveal the answer (dismiss prediction banner)
      setPredictionPending(false);
      return;
    }
    onStepChange(currentStep + 1);
  };

  const handlePlayPause = () => {
    if (predictionPending) {
      // Dismiss prediction before allowing play
      setPredictionPending(false);
      return;
    }
    onPlayPause();
  };

  const handleBack = () => {
    if (!canBack) return;
    setPredictionPending(false);
    onStepChange(currentStep - 1);
  };

  const nextSpeed = () => {
    const idx = SPEEDS.indexOf(speed);
    onSpeedChange(SPEEDS[(idx + 1) % SPEEDS.length]);
  };

  return (
    <div>
      {/* Prediction banner */}
      {predictionPending && prediction && (
        <div
          className="flex items-start gap-2 p-2.5 rounded-lg text-xs mb-2"
          style={{
            backgroundColor: 'color-mix(in srgb, #f59e0b 12%, var(--theme-card-bg))',
            border: '1px solid color-mix(in srgb, #f59e0b 30%, var(--theme-border))',
          }}
        >
          <span className="flex-shrink-0 text-sm leading-none" style={{ marginTop: '1px' }}>?</span>
          <span style={{ color: 'var(--theme-content-text)' }}>
            {lang === 'ro' ? prediction.ro : prediction.en}
          </span>
        </div>
      )}

      <div
        className="flex items-center gap-2 p-2 rounded-lg text-xs"
        style={{
          backgroundColor: 'var(--theme-card-bg)',
          border: '1px solid var(--theme-border)',
        }}
      >
        {/* Play / Pause */}
        <button
          onClick={handlePlayPause}
          className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer flex-shrink-0"
          style={{ backgroundColor: predictionPending ? '#f59e0b' : '#3b82f6', color: 'white' }}
          aria-label={predictionPending ? t('Reveal', 'Dezvăluie') : playing ? 'Pause' : 'Play'}
        >
          {predictionPending ? (
            <svg width="10" height="10" viewBox="0 0 10 10"><path d="M5 1L5 6M5 8L5 9" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
          ) : playing ? (
            <svg width="10" height="10" viewBox="0 0 10 10"><rect x="1" y="1" width="3" height="8" fill="white"/><rect x="6" y="1" width="3" height="8" fill="white"/></svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 10 10"><polygon points="2,0 10,5 2,10" fill="white"/></svg>
          )}
        </button>

        {/* Step back */}
        <button
          onClick={handleBack}
          className="px-1 cursor-pointer"
          style={{ color: canBack ? 'var(--theme-content-text)' : 'var(--theme-border)', pointerEvents: canBack ? 'auto' : 'none' }}
          aria-label="Previous step"
        >
          <svg width="12" height="12" viewBox="0 0 12 12"><path d="M8 1L3 6L8 11" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
        </button>

        {/* Progress bar */}
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--theme-border)' }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${totalSteps > 1 ? (currentStep / (totalSteps - 1)) * 100 : 100}%`, backgroundColor: '#3b82f6' }}
          />
        </div>

        {/* Step forward */}
        <button
          onClick={handleForward}
          className="px-1 cursor-pointer"
          style={{
            color: (canForward || predictionPending) ? (predictionPending ? '#f59e0b' : 'var(--theme-content-text)') : 'var(--theme-border)',
            pointerEvents: (canForward || predictionPending) ? 'auto' : 'none',
          }}
          aria-label={predictionPending ? t('Reveal', 'Dezvăluie') : 'Next step'}
        >
          {predictionPending ? (
            <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 6L10 6M7 3L10 6L7 9" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12"><path d="M4 1L9 6L4 11" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
          )}
        </button>

        {/* Step counter */}
        <span className="font-mono whitespace-nowrap" style={{ color: 'var(--theme-muted-text)' }}>
          {currentStep + 1}/{totalSteps}
        </span>

        {/* Speed button */}
        <button
          onClick={nextSpeed}
          className="px-1.5 py-0.5 rounded font-mono cursor-pointer"
          style={{ backgroundColor: 'var(--theme-border)', color: 'var(--theme-content-text)' }}
        >
          {speed}x
        </button>
      </div>
    </div>
  );
}
