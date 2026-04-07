import React from 'react';
import { useApp } from '../../../contexts/AppContext';

const SPEEDS = [0.5, 1, 2, 4];

export default function StepPlayer({ totalSteps, currentStep, onStepChange, playing, onPlayPause, speed, onSpeedChange }) {
  const { t } = useApp();

  const canBack = currentStep > 0;
  const canForward = currentStep < totalSteps - 1;

  const nextSpeed = () => {
    const idx = SPEEDS.indexOf(speed);
    onSpeedChange(SPEEDS[(idx + 1) % SPEEDS.length]);
  };

  return (
    <div
      className="flex items-center gap-2 p-2 rounded-lg text-xs"
      style={{
        backgroundColor: 'var(--theme-card-bg)',
        border: '1px solid var(--theme-border)',
      }}
    >
      {/* Play / Pause */}
      <button
        onClick={onPlayPause}
        className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer flex-shrink-0"
        style={{ backgroundColor: '#3b82f6', color: 'white' }}
        aria-label={playing ? 'Pause' : 'Play'}
      >
        {playing ? (
          <svg width="10" height="10" viewBox="0 0 10 10"><rect x="1" y="1" width="3" height="8" fill="white"/><rect x="6" y="1" width="3" height="8" fill="white"/></svg>
        ) : (
          <svg width="10" height="10" viewBox="0 0 10 10"><polygon points="2,0 10,5 2,10" fill="white"/></svg>
        )}
      </button>

      {/* Step back */}
      <button
        onClick={() => canBack && onStepChange(currentStep - 1)}
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
        onClick={() => canForward && onStepChange(currentStep + 1)}
        className="px-1 cursor-pointer"
        style={{ color: canForward ? 'var(--theme-content-text)' : 'var(--theme-border)', pointerEvents: canForward ? 'auto' : 'none' }}
        aria-label="Next step"
      >
        <svg width="12" height="12" viewBox="0 0 12 12"><path d="M4 1L9 6L4 11" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
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
  );
}
