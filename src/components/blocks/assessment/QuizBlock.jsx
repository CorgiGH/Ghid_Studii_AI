import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../../contexts/AppContext';
import { useCourseNav } from '../CourseRenderer';
import formatMarkdown from '../formatMarkdown';

export default function QuizBlock({ questions }) {
  const { t } = useApp();
  const courseNav = useCourseNav();
  // Lift per-question results up so we can render a score summary once every
  // question has been answered. `results[qi]` is null|true|false.
  const [results, setResults] = useState(() => questions.map(() => null));
  const [resetSignal, setResetSignal] = useState(0);
  const containerRef = useRef(null);

  const recordResult = (index, correct) => {
    setResults((prev) => {
      if (prev[index] === correct) return prev;
      const next = prev.slice();
      next[index] = correct;
      return next;
    });
  };

  const handleRetry = () => {
    setResults(questions.map(() => null));
    setResetSignal((n) => n + 1);
    // Scroll the quiz container back into view so the user can re-answer
    // without losing orientation.
    requestAnimationFrame(() => {
      containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const answeredCount = results.filter((r) => r !== null).length;
  const allAnswered = answeredCount === questions.length;
  const correctCount = results.filter((r) => r === true).length;
  const missedQuestions = questions
    .map((q, qi) => ({ q, qi }))
    .filter(({ qi }) => results[qi] === false);

  return (
    <div
      ref={containerRef}
      className="rounded-xl p-4 mb-3"
      style={{
        backgroundColor: 'color-mix(in srgb, #a855f7 12%, var(--theme-card-bg))',
        border: '1px solid color-mix(in srgb, #a855f7 25%, var(--theme-border))',
      }}
    >
      <div
        className="text-xs font-semibold uppercase tracking-wide mb-3"
        style={{ color: '#a855f7' }}
      >
        {t('Quick Check', 'Verificare rapidă')}
      </div>
      {questions.map((q, qi) => (
        <QuizQuestion
          key={qi}
          q={q}
          index={qi}
          total={questions.length}
          resetSignal={resetSignal}
          onAnswered={(correct) => recordResult(qi, correct)}
        />
      ))}

      {allAnswered && (
        <div
          className="mt-4 pt-4 rounded-lg p-3"
          style={{
            borderTop: '1px solid color-mix(in srgb, #a855f7 25%, var(--theme-border))',
            backgroundColor: 'color-mix(in srgb, #a855f7 6%, var(--theme-card-bg))',
            animation: 'fadeIn 0.35s ease',
          }}
        >
          {questions.length > 1 ? (
            <div
              className="text-sm font-semibold mb-2"
              style={{ color: 'var(--theme-content-text)' }}
            >
              {t(
                `You got ${correctCount}/${questions.length} correct`,
                `Ai răspuns corect la ${correctCount}/${questions.length}`
              )}
            </div>
          ) : (
            <div
              className="text-sm font-semibold mb-2"
              style={{ color: 'var(--theme-content-text)' }}
            >
              {t('Try again — reflect first.', 'Încearcă din nou — reflectează întâi.')}
            </div>
          )}
          {missedQuestions.length > 0 && (
            <div className="text-xs" style={{ color: 'var(--theme-muted-text)' }}>
              <div className="mb-1">
                {t('Review missed questions:', 'Revizuiește întrebările greșite:')}
              </div>
              <ul className="list-disc ml-5 space-y-1">
                {missedQuestions.map(({ q, qi }) => (
                  <li key={qi}>
                    {q.reviewStep && courseNav ? (
                      <button
                        onClick={() => courseNav.navigateToStep(q.reviewStep)}
                        className="underline cursor-pointer text-left"
                        style={{
                          color: '#3b82f6',
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          font: 'inherit',
                        }}
                      >
                        {t(`Q${qi + 1} — review topic`, `Î${qi + 1} — revizuiește`)} →
                      </button>
                    ) : (
                      <span>{t(`Q${qi + 1}`, `Î${qi + 1}`)}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <button
            onClick={handleRetry}
            className="mt-3 px-3 py-1.5 rounded-lg text-xs font-medium text-white cursor-pointer"
            style={{ backgroundColor: '#a855f7' }}
          >
            {t('Retry', 'Reia')}
          </button>
        </div>
      )}
    </div>
  );
}

function QuizQuestion({ q, index, total, resetSignal, onAnswered }) {
  const { t } = useApp();
  const courseNav = useCourseNav();
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const explanationRef = useRef(null);
  const [explanationHeight, setExplanationHeight] = useState(0);

  useEffect(() => {
    if (!explanationRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      setExplanationHeight(entry.contentRect.height);
    });
    ro.observe(explanationRef.current);
    return () => ro.disconnect();
  }, []);

  // Reset without remount: preserves focus/scroll and avoids ResizeObserver churn.
  useEffect(() => {
    if (resetSignal === 0) return;
    setSelected(null);
    setSubmitted(false);
  }, [resetSignal]);

  const handleSelect = (i) => {
    if (submitted) return;
    setSelected(i);
  };

  const handleCheck = () => {
    if (selected === null) return;
    setSubmitted(true);
    if (onAnswered) {
      const correct = !!q.options[selected]?.correct;
      onAnswered(correct);
    }
  };

  // Detect per-option explanations (new format) vs single explanation (old format)
  const hasPerOptionExplanations = q.options.some(opt => opt.explanation);

  return (
    <div className={index < total - 1 ? 'mb-4 pb-4' : ''} style={index < total - 1 ? { borderBottom: '1px solid var(--theme-border)' } : {}}>
      <p className="text-sm font-medium mb-2" style={{ color: 'var(--theme-content-text)' }}>
        {total > 1 && <span style={{ color: 'var(--theme-muted-text)' }}>Q{index + 1}. </span>}
        <span dangerouslySetInnerHTML={{ __html: formatMarkdown(t(q.question.en, q.question.ro)) }} />
      </p>
      <div className="flex flex-col gap-3">
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
            <div key={oi}>
              <button
                onClick={() => handleSelect(oi)}
                className="flex items-center gap-3 p-3.5 rounded-lg text-left text-sm cursor-pointer w-full"
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
                <span
                  dangerouslySetInnerHTML={{
                    __html: formatMarkdown(typeof opt.text === 'string' ? opt.text : t(opt.text.en, opt.text.ro)),
                  }}
                />
              </button>

              {/* Per-option explanation (new format) */}
              {submitted && hasPerOptionExplanations && opt.explanation && (oi === selected || opt.correct) && (
                <div
                  className="mt-1.5 ml-9 p-2.5 rounded-lg text-xs leading-relaxed"
                  style={{
                    backgroundColor: opt.correct
                      ? 'color-mix(in srgb, #10b981 8%, var(--theme-card-bg))'
                      : 'color-mix(in srgb, #ef4444 8%, var(--theme-card-bg))',
                    border: `1px solid ${opt.correct
                      ? 'color-mix(in srgb, #10b981 20%, var(--theme-border))'
                      : 'color-mix(in srgb, #ef4444 20%, var(--theme-border))'}`,
                    color: opt.correct ? '#10b981' : '#ef4444',
                    animation: 'fadeIn 0.3s ease',
                  }}
                >
                  <span className="font-semibold">
                    {opt.correct
                      ? t('Why this is correct: ', 'De ce e corect: ')
                      : t('Why this is wrong: ', 'De ce e greșit: ')}
                  </span>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: formatMarkdown(typeof opt.explanation === 'string' ? opt.explanation : t(opt.explanation.en, opt.explanation.ro)),
                    }}
                  />
                </div>
              )}
            </div>
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

      {/* Legacy single explanation (old format — backwards compatible) */}
      {q.explanation && !hasPerOptionExplanations && (
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
              dangerouslySetInnerHTML={{ __html: formatMarkdown(t(q.explanation.en, q.explanation.ro)) }}
            />
          </div>
        </div>
      )}

      {/* Review step link */}
      {submitted && q.reviewStep && courseNav && (
        <div className="mt-2 text-xs" style={{ animation: 'fadeIn 0.3s ease 0.2s both' }}>
          <button
            onClick={() => courseNav.navigateToStep(q.reviewStep)}
            className="underline cursor-pointer"
            style={{ color: '#3b82f6', background: 'none', border: 'none', padding: 0, font: 'inherit' }}
          >
            {t('Review this topic', 'Revizuiește acest subiect')} →
          </button>
        </div>
      )}
    </div>
  );
}
