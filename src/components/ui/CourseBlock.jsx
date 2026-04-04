import React, { useState, useEffect, useRef } from 'react';
import CompletionVignette from './CompletionVignette';
import { useApp } from '../../contexts/AppContext';

const CourseBlock = ({ title, id, children, forceOpen, searchState, courseId, sectionCount }) => {
  const [userOpen, setUserOpen] = useState(false);
  const ref = useRef(null);
  const contentRef = useRef(null);
  const innerRef = useRef(null);
  const [maxHeight, setMaxHeight] = useState('0px');
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

  useEffect(() => {
    if (open && innerRef.current) {
      setMaxHeight(`${innerRef.current.scrollHeight}px`);
    } else {
      setMaxHeight('0px');
    }
  }, [open]);

  useEffect(() => {
    if (!open || !innerRef.current) return;
    const el = innerRef.current;
    const remeasure = () => {
      if (el) setMaxHeight(`${el.scrollHeight}px`);
    };
    const observer = new ResizeObserver(remeasure);
    observer.observe(el);
    // Re-measure after nested transitions complete (Toggle/Section expanding)
    el.addEventListener('transitionend', remeasure);
    return () => {
      observer.disconnect();
      el.removeEventListener('transitionend', remeasure);
    };
  }, [open]);

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
        onClick={() => { if (!searchState) setUserOpen(!userOpen); }}
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
          transition: 'max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div ref={innerRef} className="p-4" style={{ borderTop: '1px solid var(--theme-border)' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default CourseBlock;
