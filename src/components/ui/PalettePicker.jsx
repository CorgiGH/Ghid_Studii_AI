import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { PALETTES } from '../../theme/palettes';

const PalettePicker = () => {
  const { palette, setPalette } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="text-xs px-2 py-1.5 rounded-lg transition"
        style={{ backgroundColor: 'var(--theme-nav-hover)', color: 'var(--theme-nav-text)' }}
        title="Color theme"
      >
        🎨
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 rounded-xl p-3 shadow-lg z-50"
          style={{
            backgroundColor: 'var(--theme-card-bg)',
            border: '1px solid var(--theme-border)',
            minWidth: '220px',
          }}
        >
          <div className="flex gap-3 justify-center">
            {Object.values(PALETTES).map((p) => (
              <button
                key={p.id}
                onClick={() => { setPalette(p.id); setOpen(false); }}
                className="flex flex-col items-center gap-1 group"
              >
                <div
                  className="w-8 h-8 rounded-full transition-all duration-150"
                  style={{
                    backgroundColor: p.swatch,
                    border: palette === p.id ? '3px solid #3b82f6' : '3px solid transparent',
                    boxShadow: palette === p.id ? '0 0 0 1px #3b82f6' : 'none',
                  }}
                />
                <span
                  className="text-[9px] font-medium"
                  style={{ color: palette === p.id ? '#3b82f6' : 'var(--theme-muted-text)' }}
                >
                  {p.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PalettePicker;
