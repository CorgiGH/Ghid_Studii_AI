import React, { useRef, useEffect, useCallback } from 'react';
import { useApp } from '../../contexts/AppContext';

const StickyProgressBar = ({ courseId, sectionCount, courseName }) => {
  const { checked, t } = useApp();
  const prevCountRef = useRef(0);
  const segmentsRef = useRef(null);
  const counterRef = useRef(null);
  const barRef = useRef(null);
  const initializedRef = useRef(false);

  if (!sectionCount || sectionCount === 0) return null;

  const prefix = `${courseId}-`;
  const completedCount = Object.keys(checked).filter(k => k.startsWith(prefix) && checked[k]).length;
  const isComplete = completedCount >= sectionCount;

  const celebrate = useCallback((segIndex) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const segments = segmentsRef.current?.children;
    const counter = counterRef.current;
    if (!segments || !counter) return;

    const seg = segments[segIndex];
    if (!seg) return;

    // 1. Green flash on the segment
    seg.style.transition = 'background 0.15s';
    seg.style.background = 'linear-gradient(90deg, #22c55e, #4ade80)';
    setTimeout(() => {
      seg.style.transition = 'background 0.5s';
      seg.style.background = '#3b82f6';
    }, 300);

    // 2. +1 floater
    const bar = barRef.current;
    if (bar) {
      const floater = document.createElement('div');
      floater.textContent = '+1';
      floater.style.cssText = `
        position: absolute;
        left: ${seg.offsetLeft + seg.offsetWidth / 2 - 10}px;
        top: -6px;
        color: #4ade80;
        font-size: 15px;
        font-weight: bold;
        pointer-events: none;
        animation: floatUp 0.7s ease-out forwards;
        text-shadow: 0 0 8px rgba(74,222,128,0.5);
        z-index: 10;
      `;
      bar.appendChild(floater);
      setTimeout(() => floater.remove(), 700);
    }

    // 3. Counter bounce
    counter.style.animation = 'counterBounce 0.45s ease';
    setTimeout(() => { counter.style.animation = ''; }, 450);
  }, []);

  const celebrateComplete = useCallback(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const segments = segmentsRef.current;
    const counter = counterRef.current;
    if (!segments || !counter) return;

    // Segments merge: close gaps, flatten inner radii
    setTimeout(() => {
      segments.style.gap = '0px';
      Array.from(segments.children).forEach((s, i) => {
        s.style.transition = 'background 0.4s, border-radius 0.4s';
        s.style.background = '#22c55e';
        if (i === 0) s.style.borderRadius = '4px 0 0 4px';
        else if (i === sectionCount - 1) s.style.borderRadius = '0 4px 4px 0';
        else s.style.borderRadius = '0';
      });
    }, 400);

    // Counter updates to "Complete"
    setTimeout(() => {
      counter.textContent = t('Complete', 'Complet');
      counter.style.color = '#22c55e';
    }, 700);
  }, [sectionCount, t]);

  // Detect changes and fire celebrations
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      prevCountRef.current = completedCount;
      return;
    }
    const prev = prevCountRef.current;
    if (completedCount > prev) {
      celebrate(completedCount - 1);
      if (completedCount >= sectionCount) {
        celebrateComplete();
      }
    }
    prevCountRef.current = completedCount;
  }, [completedCount, sectionCount, celebrate, celebrateComplete]);

  return (
    <div
      className="z-10 py-1.5 px-3 -mx-4 -mt-4 mb-3"
      style={{
        backgroundColor: 'var(--theme-content-bg)',
        borderBottom: '1px solid var(--theme-border)',
      }}
    >
      <div className="flex items-center gap-2">
        <div className="relative overflow-visible flex-1" ref={barRef}>
          <div
            ref={segmentsRef}
            className="flex h-1.5"
            style={{ gap: isComplete ? '0px' : '2px', transition: 'gap 0.4s ease' }}
          >
            {Array.from({ length: sectionCount }, (_, i) => (
              <div
                key={i}
                className="flex-1"
                style={{
                  borderRadius: isComplete
                    ? (i === 0 ? '3px 0 0 3px' : i === sectionCount - 1 ? '0 3px 3px 0' : '0')
                    : '3px',
                  background: i < completedCount
                    ? (isComplete ? '#22c55e' : '#3b82f6')
                    : 'var(--theme-border)',
                  transition: 'background 0.3s, border-radius 0.4s',
                }}
              />
            ))}
          </div>
        </div>
        <span
          ref={counterRef}
          className="text-[11px] font-bold whitespace-nowrap"
          style={{ color: isComplete ? '#22c55e' : 'var(--theme-muted-text)' }}
        >
          {isComplete ? t('Complete', 'Complet') : `${completedCount}/${sectionCount}`}
        </span>
      </div>
    </div>
  );
};

export default StickyProgressBar;
