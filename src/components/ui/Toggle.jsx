import React, { useState, useRef, useCallback } from 'react';

const Toggle = ({ question, answer, hideLabel = 'Hide', showLabel = 'Reveal' }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const hasFiredEvent = useRef(false);
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
      if (!hasFiredEvent.current && rootRef.current) {
        hasFiredEvent.current = true;
        rootRef.current.dispatchEvent(new CustomEvent('toggle-interacted', { bubbles: true }));
      }
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
    <div ref={rootRef} data-toggle className="my-2 border rounded-lg overflow-hidden"
      style={{ borderColor: 'var(--theme-border)' }}
    >
      <div
        className="flex justify-between items-center p-3 cursor-pointer transition-colors"
        onClick={handleToggle}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--theme-hover-bg)'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <span className="font-sans text-sm flex-1 pr-3">{question}</span>
        <button
          className="text-xs px-3 py-1.5 rounded-lg transition-all duration-150 hover:-translate-y-0.5 active:translate-y-px active:scale-[0.97] whitespace-nowrap flex-shrink-0"
          style={{
            backgroundColor: 'transparent',
            color: 'var(--theme-muted-text)',
            border: '1px solid var(--theme-border)',
          }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--theme-card-bg)'; e.currentTarget.style.color = 'var(--theme-text)'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--theme-muted-text)'; }}
        >
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
