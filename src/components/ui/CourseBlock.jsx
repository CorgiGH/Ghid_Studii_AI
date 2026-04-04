import React, { useState, useEffect, useRef, useCallback } from 'react';
import CompletionVignette from './CompletionVignette';
import { useApp } from '../../contexts/AppContext';

const CourseBlock = ({ title, id, children, forceOpen, searchState, courseId, sectionCount }) => {
  const [userOpen, setUserOpen] = useState(false);
  const ref = useRef(null);
  const contentRef = useRef(null);
  const innerRef = useRef(null);
  const [maxHeight, setMaxHeight] = useState('0px');
  const [transitioning, setTransitioning] = useState(false);
  const { checked } = useApp();
  const [vignetteActive, setVignetteActive] = useState(false);
  const [showGreenBorder, setShowGreenBorder] = useState(false);

  const open = searchState ? searchState === 'match' : userOpen;

  useEffect(() => {
    if (forceOpen) {
      setUserOpen(true);
      setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    }
  }, [forceOpen]);

  // Handle open/close transitions
  const prevOpenRef = useRef(open);
  useEffect(() => {
    if (open === prevOpenRef.current) return;
    prevOpenRef.current = open;

    if (open && innerRef.current) {
      // Opening: animate from 0 to scrollHeight
      setTransitioning(true);
      setMaxHeight(`${innerRef.current.scrollHeight}px`);
    } else if (!open && innerRef.current) {
      // Closing: snap to scrollHeight then animate to 0
      setTransitioning(false);
      setMaxHeight(`${innerRef.current.scrollHeight}px`);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTransitioning(true);
          setMaxHeight('0px');
        });
      });
    }
  }, [open]);

  // After open transition ends, remove maxHeight constraint so children expand instantly
  const handleTransitionEnd = useCallback((e) => {
    if (e.target !== contentRef.current) return;
    setTransitioning(false);
    if (open && innerRef.current) {
      setMaxHeight('none');
    }
  }, [open]);

  // When maxHeight is 'none' (open, not transitioning), re-measure if children resize
  // This handles cases where lazy-loaded content changes the height
  useEffect(() => {
    if (maxHeight !== 'none' || !innerRef.current) return;
    const el = innerRef.current;
    const observer = new ResizeObserver(() => {
      // maxHeight is already 'none', so no action needed — content expands naturally
      // But we need to keep scrollHeight current for when we close
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [maxHeight]);

  // Detect course completion for vignette
  const prevCompleteRef = useRef(false);
  const isComplete = courseId && sectionCount > 0
    ? Object.keys(checked).filter(k => k.startsWith(`${courseId}-`) && checked[k]).length >= sectionCount
    : false;

  useEffect(() => {
    if (isComplete && !prevCompleteRef.current && open) {
      setTimeout(() => setVignetteActive(true), 500);
    }
    prevCompleteRef.current = isComplete;
  }, [isComplete, open]);

  useEffect(() => {
    if (isComplete) setShowGreenBorder(true);
    else setShowGreenBorder(false);
  }, [isComplete]);

  const handleClick = useCallback(() => {
    if (!searchState) setUserOpen(prev => !prev);
  }, [searchState]);

  return (
    <div
      ref={ref}
      className="mb-4 rounded-xl transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm"
      style={{
        border: `2px solid ${showGreenBorder ? 'rgba(34,197,94,0.35)' : 'var(--theme-border)'}`,
        boxShadow: showGreenBorder ? '0 0 12px rgba(34,197,94,0.08)' : undefined,
        transition: 'border-color 0.5s, box-shadow 0.5s',
        position: 'relative',
        overflow: 'hidden',
      }}
      id={id}
    >
      <CompletionVignette
        trigger={vignetteActive}
        onComplete={() => setVignetteActive(false)}
      />
      <div
        className="p-4 cursor-pointer font-bold text-lg transition-colors"
        style={{ color: 'var(--theme-content-text)' }}
        onClick={handleClick}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--theme-hover-bg)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <span
          className="inline-block mr-2"
          style={{
            transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          ▸
        </span>
        {title}
      </div>
      <div
        ref={contentRef}
        className="overflow-hidden"
        style={{
          maxHeight,
          transition: transitioning ? 'max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        <div ref={innerRef} className="p-4" style={{ borderTop: '1px solid var(--theme-border)' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default CourseBlock;
