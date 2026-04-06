import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../../contexts/AppContext';

export default function QuizBlock({ questions }) {
  const { t } = useApp();

  return (
    <div
      className="rounded-xl p-4 mb-3"
      style={{
        backgroundColor: 'color-mix(in srgb, #a855f7 6%, var(--theme-card-bg))',
        border: '1px solid color-mix(in srgb, #a855f7 15%, var(--theme-border))',
      }}
    >
      <div
        className="text-[10px] font-bold uppercase tracking-widest mb-3"
        style={{ color: '#a855f7' }}
      >
        {t('Quick Check', 'Verificare rapidă')}
      </div>
      {questions.map((q, qi) => (
        <QuizQuestion key={qi} q={q} index={qi} total={questions.length} />
      ))}
    </div>
  );
}

function QuizQuestion({ q, index, total }) {
  const { t } = useApp();
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const explanationRef = useRef(null);
  const [explanationHeight, setExplanationHeight] = useState(0);

  // Measure explanation height
  useEffect(() => {
    if (!explanationRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      setExplanationHeight(entry.contentRect.height);
    });
    ro.observe(explanationRef.current);
    return () => ro.disconnect();
  }, []);

  const handleSelect = (i) => {
    if (submitted) return;
    setSelected(i);
  };

  const handleCheck = () => {
    if (selected === null) return;
    setSubmitted(true);
  };

  return (
    <div className={index < total - 1 ? 'mb-4 pb-4' : ''} style={index < total - 1 ? { borderBottom: '1px solid var(--theme-border)' } : {}}>
      <p className="text-sm font-medium mb-2" style={{ color: 'var(--theme-content-text)' }}>
        {total > 1 && <span style={{ color: 'var(--theme-muted-text)' }}>Q{index + 1}. </span>}
        {t(q.question.en, q.question.ro)}
      </p>
      <div className="flex flex-col gap-2">
        {q.options.map((opt, oi) => {
          let bg = 'var(--theme-card-bg)';
          let border = 'var(--theme-border)';
          let textColor = 'var(--theme-content-text)';

          if (submitted) {
            if (opt.correct) {
              bg = 'color-mix(in srgb, #10b981 12%, var(--theme-card-bg))';
              border = '#10b981';
              textColor = '#10b981';
            } else if (oi === selected && !opt.correct) {
              bg = 'color-mix(in srgb, #ef4444 12%, var(--theme-card-bg))';
              border = '#ef4444';
              textColor = '#ef4444';
            }
          } else if (oi === selected) {
            border = '#a855f7';
            bg = 'color-mix(in srgb, #a855f7 8%, var(--theme-card-bg))';
          }

          return (
            <button
              key={oi}
              onClick={() => handleSelect(oi)}
              className="flex items-center gap-3 p-2.5 rounded-lg text-left text-sm cursor-pointer"
              style={{
                backgroundColor: bg,
                border: `1px solid ${border}`,
                color: textColor,
                pointerEvents: submitted ? 'none' : 'auto',
                transition: 'background-color 0.25s ease, border-color 0.25s ease, color 0.25s ease',
              }}
            >
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: 'var(--theme-border)' }}
              >
                {String.fromCharCode(65 + oi)}
              </span>
              {t(opt.text.en, opt.text.ro)}
            </button>
          );
        })}
      </div>

      {/* Check button — smoothly collapses after submit */}
      <div
        style={{
          maxHeight: submitted ? '0px' : '40px',
          opacity: submitted ? 0 : 1,
          overflow: 'hidden',
          transition: 'max-height 0.25s ease, opacity 0.15s ease',
        }}
      >
        <button
          onClick={handleCheck}
          disabled={selected === null}
          className="mt-2 px-4 py-1.5 rounded-lg text-xs font-medium text-white transition-opacity"
          style={{
            backgroundColor: '#a855f7',
            opacity: selected === null ? 0.4 : 1,
            cursor: selected === null ? 'not-allowed' : 'pointer',
          }}
        >
          {t('Check Answer', 'Verifică')}
        </button>
      </div>

      {/* Explanation — smoothly expands after submit */}
      {q.explanation && (
        <div
          style={{
            maxHeight: submitted ? `${explanationHeight + 16}px` : '0px',
            opacity: submitted ? 1 : 0,
            overflow: 'hidden',
            transition: 'max-height 0.35s ease 0.1s, opacity 0.25s ease 0.15s',
          }}
        >
          <div ref={explanationRef}>
            <div
              className="mt-2 p-3 rounded-lg text-xs leading-relaxed"
              style={{
                backgroundColor: 'color-mix(in srgb, #10b981 8%, var(--theme-card-bg))',
                border: '1px solid color-mix(in srgb, #10b981 20%, var(--theme-border))',
                color: '#10b981',
              }}
            >
              {t(q.explanation.en, q.explanation.ro)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
