import React, { useState, useRef, useEffect, useCallback } from 'react';
import useAutoProgress from '../../hooks/useAutoProgress';

const Section = ({ title, id, children, checked, onCheck }) => {
  const [open, setOpen] = useState(false);
  const { ref: autoRef } = useAutoProgress(id, open);
  const contentRef = useRef(null);
  const [maxHeight, setMaxHeight] = useState('0px');
  const [transitioning, setTransitioning] = useState(false);

  const handleToggle = useCallback(() => {
    if (!open) {
      // Opening: animate from 0 to scrollHeight
      setTransitioning(true);
      if (contentRef.current) {
        setMaxHeight(`${contentRef.current.scrollHeight}px`);
      }
      setOpen(true);
    } else {
      // Closing: snap maxHeight from 'none' to current scrollHeight, then animate to 0
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

  // After open transition ends, remove maxHeight constraint so children expand instantly
  const handleTransitionEnd = useCallback((e) => {
    if (e.target !== contentRef.current) return;
    setTransitioning(false);
    if (open && contentRef.current) {
      setMaxHeight('none');
    }
  }, [open]);

  return (
    <div ref={autoRef} className="mb-3 border rounded-lg overflow-hidden transition-shadow hover:shadow-sm" id={id}
      style={{ borderColor: 'var(--theme-border)' }}
      data-section-id={id}
    >
      <div
        className="group flex items-center gap-2 p-3 cursor-pointer transition-colors"
        style={{ backgroundColor: 'transparent' }}
        onClick={handleToggle}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--theme-hover-bg)'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={onCheck}
          onClick={e => e.stopPropagation()}
          className="w-4 h-4 accent-green-500"
        />
        <span
          className="opacity-0 group-hover:opacity-70 cursor-pointer select-none transition-opacity"
          style={{ fontSize: 'var(--type-body)', color: 'var(--theme-muted-text)' }}
          title="Copy link"
          onClick={(e) => {
            e.stopPropagation();
            const url = window.location.origin + window.location.pathname + window.location.search + '#' + id;
            navigator.clipboard.writeText(url).catch(() => {});
            e.currentTarget.textContent = '\u2713';
            setTimeout(() => { e.currentTarget.textContent = '#'; }, 2000);
          }}
        >
          #
        </span>
        <span className={`flex-1 transition-colors ${checked ? 'line-through opacity-70' : ''}`}
          style={{
            fontSize: 'var(--type-h3)',
            lineHeight: 'var(--type-h3-lh)',
            fontWeight: 'var(--type-h3-weight)',
            color: checked ? '#16a34a' : 'var(--theme-content-text)',
          }}
        >
          <span
            className="inline-block mr-1"
            style={{
              transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            ▸
          </span>
          {title}
        </span>
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
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Section;
