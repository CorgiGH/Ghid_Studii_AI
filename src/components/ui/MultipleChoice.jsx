import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';

export default function MultipleChoice({ questions, multiSelect = false, onScore }) {
  const { t, lang } = useApp();
  const [answers, setAnswers] = useState({});
  const [revealed, setRevealed] = useState({});

  const select = (qIdx, oIdx) => {
    if (revealed[qIdx]) return;
    if (multiSelect) {
      setAnswers(prev => {
        const current = new Set(prev[qIdx] || []);
        if (current.has(oIdx)) current.delete(oIdx); else current.add(oIdx);
        return { ...prev, [qIdx]: new Set(current) };
      });
    } else {
      setAnswers(prev => ({ ...prev, [qIdx]: oIdx }));
    }
  };

  const reveal = (qIdx) => {
    setRevealed(prev => ({ ...prev, [qIdx]: true }));
    if (onScore) {
      const q = questions[qIdx];
      const correctIndices = new Set(q.options.map((o, i) => o.correct ? i : -1).filter(i => i >= 0));
      if (multiSelect) {
        const selected = answers[qIdx] || new Set();
        const isCorrect = selected.size === correctIndices.size && [...selected].every(i => correctIndices.has(i));
        onScore(qIdx, isCorrect);
      } else {
        const isCorrect = q.options[answers[qIdx]]?.correct === true;
        onScore(qIdx, isCorrect);
      }
    }
  };

  return (
    <div className="space-y-4">
      {questions.map((q, qIdx) => {
        const picked = answers[qIdx];
        const shown = revealed[qIdx];
        const selectedIndices = multiSelect
          ? [...(picked instanceof Set ? picked : [])]
          : (picked !== undefined ? [picked] : []);
        const wrongSelected = shown ? selectedIndices.filter(i => !q.options[i]?.correct) : [];

        return (
          <div
            key={qIdx}
            className="border rounded-lg p-4"
            style={{ borderColor: 'var(--theme-border)' }}
          >
            <p className="font-medium mb-3">{q.question[lang]}</p>
            {multiSelect && (
              <p className="text-xs mb-2" style={{ color: 'var(--theme-muted)' }}>
                {t('Select all that apply', 'Selectează toate variantele corecte')}
              </p>
            )}
            <div
              className="space-y-2"
              role={multiSelect ? 'group' : 'radiogroup'}
              aria-label={q.question[lang]}
            >
              {q.options.map((opt, oIdx) => {
                const isSelected = multiSelect ? (picked instanceof Set && picked.has(oIdx)) : picked === oIdx;
                let bg = 'transparent';
                let borderColor = 'var(--theme-border)';
                if (shown && opt.correct) {
                  bg = 'color-mix(in srgb, var(--theme-content-bg), #22c55e 10%)';
                  borderColor = '#22c55e';
                } else if (shown && isSelected && !opt.correct) {
                  bg = 'color-mix(in srgb, var(--theme-content-bg), #ef4444 10%)';
                  borderColor = '#ef4444';
                } else if (isSelected) {
                  bg = 'color-mix(in srgb, var(--theme-content-bg), #3b82f6 10%)';
                  borderColor = '#3b82f6';
                }
                return (
                  <button
                    key={oIdx}
                    type="button"
                    role={multiSelect ? 'checkbox' : 'radio'}
                    aria-checked={isSelected}
                    disabled={shown}
                    onClick={() => select(qIdx, oIdx)}
                    className="w-full text-left border rounded-lg p-2 transition text-sm hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-default"
                    style={{ background: bg, borderColor, color: 'var(--theme-text)' }}
                  >
                    {typeof opt.text === 'object' ? opt.text[lang] : opt.text}
                  </button>
                );
              })}
            </div>
            {((multiSelect ? (picked instanceof Set && picked.size > 0) : picked !== undefined)) && !shown && (
              <button
                onClick={() => reveal(qIdx)}
                className="mt-3 text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {t('Check Answer', 'Verifică răspunsul')}
              </button>
            )}
            {shown && (
              <>
                {/* Per-option feedback for EVERY wrong selection (multi-select can have several) */}
                {wrongSelected.map(idx => {
                  const opt = q.options[idx];
                  if (!opt?.feedback) return null;
                  const msg = typeof opt.feedback === 'object' ? opt.feedback[lang] : opt.feedback;
                  const label = typeof opt.text === 'object' ? opt.text[lang] : opt.text;
                  return (
                    <p
                      key={idx}
                      className="mt-3 text-sm p-2 rounded border"
                      style={{ borderColor: '#ef4444', background: 'color-mix(in srgb, var(--theme-content-bg), #ef4444 8%)', color: 'var(--theme-text)' }}
                    >
                      <strong>"{label}" — </strong>{msg}
                    </p>
                  );
                })}
                <p className="mt-3 text-sm" style={{ color: 'var(--theme-muted)' }}>
                  {q.explanation?.[lang]}
                </p>
                <button
                  onClick={() => {
                    const selectedTexts = selectedIndices.map(i => (
                      q.options[i] ? (typeof q.options[i].text === 'object' ? q.options[i].text[lang] : q.options[i].text) : ''
                    ));
                    window.dispatchEvent(new CustomEvent('check-with-ai', {
                      detail: {
                        type: 'multiple-choice',
                        question: typeof q.question === 'object' ? q.question[lang] : q.question,
                        selectedText: selectedTexts.join(', '),
                        studentAnswer: selectedTexts.join(', '),
                        selectedTexts,
                        selectedIndices,
                        options: q.options.map(o => typeof o.text === 'object' ? o.text[lang] : o.text),
                        correct: q.options.findIndex(o => o.correct),
                        keyConcepts: q.keyConcepts || [],
                        explanation: typeof q.explanation === 'object' ? q.explanation[lang] : (q.explanation || ''),
                      }
                    }));
                  }}
                  className="mt-2 text-xs px-3 py-1.5 rounded-lg text-white transition-colors hover:brightness-110 flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  style={{ backgroundColor: '#8b5cf6' }}
                >
                  <span style={{ fontSize: '13px' }}>&#10024;</span>
                  {t('Check with AI', 'Verifică cu AI')}
                </button>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
