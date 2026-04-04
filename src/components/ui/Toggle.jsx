import React, { useState, useRef, useCallback } from 'react';

const Toggle = ({ question, answer, hideLabel = 'Hide', showLabel = 'Show Answer' }) => {
  const [open, setOpen] = useState(false);
  const contentRef = useRef(null);
  const [maxHeight, setMaxHeight] = useState('0px');
  const [transitioning, setTransitioning] = useState(false);

  const handleToggle = useCallback(() => {
    if (!open) {
      setTransitioning(true);
      if (contentRef.current) {
        setMaxHeight(`${contentRef.current.scrollHeight}px`);
      }
      setOpen(true);
    } else {
      setTransitioning(true);
      if (contentRef.current) {
        setMaxHeight(`${contentRef.current.scrollHeight}px`);
      }
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setMaxHeight('0px');
          setOpen(false);
        });
      });
    }
  }, [open]);

  const handleTransitionEnd = useCallback((e) => {
    if (e.target !== contentRef.current) return;
    setTransitioning(false);
    if (open && contentRef.current) {
      setMaxHeight('none');
    }
  }, [open]);

  return (
    <div className="my-2 border rounded-lg overflow-hidden"
      style={{ borderColor: 'var(--theme-border)' }}
    >
      <div
        className="flex justify-between items-center p-3 cursor-pointer transition-colors"
        onClick={handleToggle}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--theme-hover-bg)'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <span className="font-sans text-sm flex-1 pr-3">{question}</span>
        <button className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md active:translate-y-px active:scale-[0.97] whitespace-nowrap flex-shrink-0">
          {open ? hideLabel : showLabel}
        </button>
      </div>
      <div
        ref={contentRef}
        className="overflow-hidden"
        style={{
          maxHeight,
          transition: transitioning ? 'max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
          borderTop: open ? '1px solid var(--theme-border)' : '1px solid transparent',
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        <div className="p-3 text-sm font-sans" style={{ backgroundColor: 'var(--theme-hover-bg)' }}>
          {answer}
        </div>
      </div>
    </div>
  );
};

export default Toggle;
