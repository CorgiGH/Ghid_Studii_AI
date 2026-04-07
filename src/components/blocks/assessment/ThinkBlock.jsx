import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../../contexts/AppContext';

export default function ThinkBlock({ question, answer }) {
  const { t } = useApp();
  const [revealed, setRevealed] = useState(false);
  const contentRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(0);

  // Measure the content height whenever it's revealed
  useEffect(() => {
    if (!contentRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      setContentHeight(entry.contentRect.height);
    });
    ro.observe(contentRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      className="rounded-xl p-4 mb-3"
      style={{
        backgroundColor: 'color-mix(in srgb, #f59e0b 12%, var(--theme-card-bg))',
        border: '1px solid color-mix(in srgb, #f59e0b 25%, var(--theme-border))',
      }}
    >
      <div
        className="text-xs font-semibold uppercase tracking-wide mb-2"
        style={{ color: '#f59e0b' }}
      >
        {t('\uD83D\uDCA1 Think about it', '\uD83D\uDCA1 Gândește-te')}
      </div>
      <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--theme-content-text)' }}>
        {t(question.en, question.ro)}
      </p>

      {/* Reveal button — always rendered, hidden when revealed */}
      <div
        style={{
          maxHeight: revealed ? '0px' : '40px',
          opacity: revealed ? 0 : 1,
          overflow: 'hidden',
          transition: 'max-height 0.3s ease, opacity 0.2s ease',
        }}
      >
        <button
          onClick={() => setRevealed(true)}
          className="w-full text-center text-xs py-2 rounded-lg transition-colors cursor-pointer"
          style={{
            backgroundColor: 'var(--theme-border)',
            color: 'var(--theme-muted-text)',
          }}
          onMouseEnter={e => { e.target.style.color = '#f59e0b'; }}
          onMouseLeave={e => { e.target.style.color = 'var(--theme-muted-text)'; }}
        >
          {t('Click to reveal answer \u25BC', 'Click pentru răspuns \u25BC')}
        </button>
      </div>

      {/* Answer — always rendered, animated open/closed */}
      <div
        style={{
          maxHeight: revealed ? `${contentHeight + 16}px` : '0px',
          opacity: revealed ? 1 : 0,
          overflow: 'hidden',
          transition: 'max-height 0.35s ease, opacity 0.25s ease 0.05s',
        }}
      >
        <div ref={contentRef}>
          <div
            className="text-sm leading-relaxed p-3 rounded-lg"
            style={{
              backgroundColor: 'color-mix(in srgb, #f59e0b 4%, var(--theme-card-bg))',
              color: 'var(--theme-content-text)',
            }}
          >
            {t(answer.en, answer.ro)}
          </div>
          <button
            onClick={() => setRevealed(false)}
            className="w-full text-center text-xs py-1 mt-2 cursor-pointer"
            style={{ color: 'var(--theme-muted-text)' }}
          >
            {t('Hide \u25B2', 'Ascunde \u25B2')}
          </button>
        </div>
      </div>
    </div>
  );
}
