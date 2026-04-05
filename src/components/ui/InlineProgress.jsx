import React, { useState, useEffect, useRef, useCallback, forwardRef } from 'react';
import { useApp } from '../../contexts/AppContext';
import ProgressRing from './ProgressRing';

const InlineProgress = forwardRef(({ courseId, sectionCount, sectionIds }, ref) => {
  const { checked, t } = useApp();
  const [topBarHeight, setTopBarHeight] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastDismissing, setToastDismissing] = useState(false);
  const prevCountRef = useRef(0);
  const segmentsRef = useRef(null);
  const counterRef = useRef(null);
  const barRef = useRef(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    const topBar = document.querySelector('header');
    if (!topBar) return;
    const measure = () => setTopBarHeight(Math.round(topBar.getBoundingClientRect().height));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(topBar);
    return () => ro.disconnect();
  }, []);

  if (!sectionCount || sectionCount === 0) return null;

  const prefix = `${courseId}-`;
  const completedCount = Object.keys(checked).filter(k => k.startsWith(prefix) && checked[k]).length;
  const isComplete = completedCount >= sectionCount;

  const dismissToast = useCallback(() => {
    setToastDismissing(true);
    setTimeout(() => {
      setShowToast(false);
      setToastDismissing(false);
    }, 300);
  }, []);

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
    if (!segments) return;

    // Segments merge: close gaps, flatten inner radii
    setTimeout(() => {
      segments.style.gap = '0px';
      Array.from(segments.children).forEach((s, i) => {
        s.style.transition = 'background 0.4s, border-radius 0.4s';
        s.style.background = '#22c55e';
        if (i === 0) s.style.borderRadius = '3px 0 0 3px';
        else if (i === sectionCount - 1) s.style.borderRadius = '0 3px 3px 0';
        else s.style.borderRadius = '0';
      });
    }, 400);

    // Show completion toast after merge animation
    setTimeout(() => {
      setShowToast(true);
    }, 800);
  }, [sectionCount]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!showToast || toastDismissing) return;
    const timer = setTimeout(dismissToast, 1200);
    return () => clearTimeout(timer);
  }, [showToast, toastDismissing, dismissToast]);

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
    <>
      <div
        ref={ref}
        className="flex items-center gap-3 px-4 py-2 sticky z-10"
        style={{
          top: `${topBarHeight}px`,
          borderBottom: '1px solid var(--theme-border)',
          backgroundColor: 'var(--theme-content-bg)',
        }}
      >
        <div className="relative overflow-visible flex-1" ref={barRef}>
          <div
            ref={segmentsRef}
            className="flex h-[5px]"
            style={{ gap: isComplete ? '0px' : '3px', transition: 'gap 0.4s ease' }}
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
        <div ref={counterRef}>
          <ProgressRing size={22} completed={completedCount} total={sectionCount} />
        </div>
      </div>

      {showToast && (
        <div
          onClick={dismissToast}
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(15,23,42,0.6)',
            backdropFilter: 'blur(2px)',
            zIndex: 50,
            animation: toastDismissing ? 'fadeOut 0.3s ease forwards' : 'fadeIn 0.3s ease',
            cursor: 'pointer',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--theme-content-bg, #1e293b)',
              border: '2px solid #22c55e',
              borderRadius: '16px',
              padding: '24px 36px',
              textAlign: 'center',
              boxShadow: '0 12px 48px rgba(34,197,94,0.25)',
              animation: toastDismissing ? 'fadeOut 0.3s ease forwards' : 'popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
                fontSize: '24px',
                color: 'white',
                boxShadow: '0 0 20px rgba(34,197,94,0.4)',
              }}
            >
              &#10003;
            </div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--theme-text, #e2e8f0)', marginBottom: '4px' }}>
              {t('Course Complete!', 'Curs complet!')}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--theme-muted-text, #94a3b8)' }}>
              {t(`All ${sectionCount} sections finished`, `Toate cele ${sectionCount} secțiuni completate`)}
            </div>
          </div>
        </div>
      )}
    </>
  );
});

export default InlineProgress;
