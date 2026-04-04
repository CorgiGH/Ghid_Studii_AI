import React, { useRef, useEffect, useCallback } from 'react';
import { useApp } from '../../contexts/AppContext';
import ProgressRing from './ProgressRing';

const ProgressSidebar = ({ courseId, sectionCount, sectionIds, sectionTitles }) => {
  const { checked, t } = useApp();
  const segmentsRef = useRef(null);
  const ringRef = useRef(null);
  const prevCountRef = useRef(0);
  const initializedRef = useRef(false);

  if (!sectionCount || sectionCount === 0) return null;

  const prefix = `${courseId}-`;
  const completedCount = Object.keys(checked).filter(k => k.startsWith(prefix) && checked[k]).length;
  const isComplete = completedCount >= sectionCount;

  const celebrate = useCallback((segIndex) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const segments = segmentsRef.current?.children;
    if (!segments) return;
    const seg = segments[segIndex];
    if (!seg) return;

    seg.style.transition = 'background 0.15s';
    seg.style.background = 'linear-gradient(180deg, #22c55e, #4ade80)';
    setTimeout(() => {
      seg.style.transition = 'background 0.5s';
      seg.style.background = '#3b82f6';
    }, 300);

    const floater = document.createElement('div');
    floater.textContent = '+1';
    floater.style.cssText = `
      position: absolute;
      left: 14px;
      top: ${seg.offsetTop + seg.offsetHeight / 2 - 8}px;
      color: #4ade80;
      font-size: 13px;
      font-weight: bold;
      pointer-events: none;
      animation: floatRight 0.7s ease-out forwards;
      text-shadow: 0 0 8px rgba(74,222,128,0.5);
      z-index: 10;
    `;
    segmentsRef.current.parentElement.appendChild(floater);
    setTimeout(() => floater.remove(), 700);

    if (ringRef.current) {
      ringRef.current.style.animation = 'counterBounce 0.45s ease';
      setTimeout(() => { if (ringRef.current) ringRef.current.style.animation = ''; }, 450);
    }
  }, []);

  const celebrateComplete = useCallback(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const segments = segmentsRef.current;
    if (!segments) return;

    setTimeout(() => {
      segments.style.gap = '0px';
      Array.from(segments.children).forEach((s, i) => {
        s.style.transition = 'background 0.4s, border-radius 0.4s';
        s.style.background = '#22c55e';
        if (i === 0) s.style.borderRadius = '3px 3px 0 0';
        else if (i === sectionCount - 1) s.style.borderRadius = '0 0 3px 3px';
        else s.style.borderRadius = '0';
      });
    }, 400);
  }, [sectionCount]);

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

  const handleSegmentClick = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <aside className="hidden lg:block lg:sticky top-20 w-44 h-[calc(100vh-5rem)] p-3 flex-shrink-0">
      <div className="flex flex-col h-full">
        <div className="flex-1 relative overflow-visible">
          <div className="flex gap-3 h-full">
            <div
              ref={segmentsRef}
              className="flex flex-col w-1.5"
              style={{ gap: isComplete ? '0px' : '2px', transition: 'gap 0.4s ease' }}
            >
              {Array.from({ length: sectionCount }, (_, i) => {
                const sectionId = sectionIds?.[i];
                const isChecked = sectionId ? checked[sectionId] : i < completedCount;
                return (
                  <div
                    key={i}
                    className="flex-1 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => sectionId && handleSegmentClick(sectionId)}
                    style={{
                      borderRadius: isComplete
                        ? (i === 0 ? '3px 3px 0 0' : i === sectionCount - 1 ? '0 0 3px 3px' : '0')
                        : '3px',
                      background: isChecked
                        ? (isComplete ? '#22c55e' : '#3b82f6')
                        : 'var(--theme-border)',
                      transition: 'background 0.3s, border-radius 0.4s',
                      minHeight: '8px',
                    }}
                  />
                );
              })}
            </div>

            <div className="flex flex-col flex-1 min-w-0" style={{ gap: '2px' }}>
              {Array.from({ length: sectionCount }, (_, i) => {
                const sectionId = sectionIds?.[i];
                const label = sectionTitles?.[i] || `Section ${i + 1}`;
                const isChecked = sectionId ? checked[sectionId] : i < completedCount;
                return (
                  <div
                    key={i}
                    className="flex-1 flex items-center cursor-pointer hover:opacity-80 transition-colors min-h-0"
                    onClick={() => sectionId && handleSegmentClick(sectionId)}
                  >
                    <span
                      className="text-[10px] leading-tight truncate"
                      style={{
                        color: isChecked ? '#22c55e' : 'var(--theme-muted-text)',
                        transition: 'color 0.3s',
                      }}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div ref={ringRef} className="flex items-center justify-center gap-2 pt-3 mt-3"
          style={{ borderTop: '1px solid var(--theme-border)' }}
        >
          <ProgressRing size={32} completed={completedCount} total={sectionCount} />
          <span
            className="text-xs font-bold"
            style={{ color: isComplete ? '#22c55e' : 'var(--theme-muted-text)' }}
          >
            {isComplete ? t('Complete', 'Complet') : `${completedCount}/${sectionCount}`}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes floatRight {
          0% { opacity: 1; transform: translateX(0); }
          100% { opacity: 0; transform: translateX(20px) translateY(-10px); }
        }
        @keyframes counterBounce {
          0% { transform: scale(1); }
          40% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
      `}</style>
    </aside>
  );
};

export default ProgressSidebar;
