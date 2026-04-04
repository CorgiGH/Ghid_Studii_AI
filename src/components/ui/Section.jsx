import React, { useState, useRef, useEffect } from 'react';

const Section = ({ title, id, children, checked, onCheck }) => {
  const [open, setOpen] = useState(false);
  const contentRef = useRef(null);
  const [maxHeight, setMaxHeight] = useState('0px');

  useEffect(() => {
    if (open && contentRef.current) {
      setMaxHeight(`${contentRef.current.scrollHeight}px`);
    } else {
      setMaxHeight('0px');
    }
  }, [open]);

  // Re-measure when children change (e.g. nested toggles opening)
  useEffect(() => {
    if (!open || !contentRef.current) return;
    const el = contentRef.current;
    const remeasure = () => {
      if (el) setMaxHeight(`${el.scrollHeight}px`);
    };
    const observer = new ResizeObserver(remeasure);
    observer.observe(el);
    // Also re-measure after CSS transitions end (catches nested expand/collapse)
    el.addEventListener('transitionend', remeasure);
    return () => {
      observer.disconnect();
      el.removeEventListener('transitionend', remeasure);
    };
  }, [open]);

  return (
    <div className="mb-3 border rounded-lg overflow-hidden transition-shadow hover:shadow-sm" id={id}
      style={{ borderColor: 'var(--theme-border)' }}
    >
      <div
        className="flex items-center gap-2 p-3 cursor-pointer transition-colors"
        style={{ backgroundColor: 'transparent' }}
        onClick={() => setOpen(!open)}
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
        <span className={`font-semibold flex-1 transition-colors ${checked ? 'text-green-600 line-through opacity-70' : ''}`}
          style={{ color: checked ? undefined : 'var(--theme-content-text)' }}
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
          transition: 'max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          borderTop: open ? '1px solid var(--theme-border)' : '1px solid transparent',
        }}
      >
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Section;
