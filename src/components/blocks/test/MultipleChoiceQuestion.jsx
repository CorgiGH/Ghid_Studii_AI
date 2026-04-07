import React, { useState } from 'react';
import { useApp } from '../../../contexts/AppContext';
import QuestionFeedback from './QuestionFeedback';

export default function MultipleChoiceQuestion({ question, onAnswer }) {
  const { t } = useApp();
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (selected === null) return;
    const isCorrect = selected === question.correctIndex;
    const score = isCorrect ? question.points : 0;
    setSubmitted(true);
    onAnswer?.(question.id, score, question.points);
  };

  return (
    <div>
      <div className="space-y-2">
        {question.options.map((opt, i) => {
          let borderColor = 'var(--theme-border)';
          let bg = 'transparent';
          if (submitted && i === question.correctIndex) {
            borderColor = '#22c55e';
            bg = 'color-mix(in srgb, #22c55e 8%, var(--theme-card-bg))';
          } else if (submitted && i === selected && i !== question.correctIndex) {
            borderColor = '#ef4444';
            bg = 'color-mix(in srgb, #ef4444 8%, var(--theme-card-bg))';
          } else if (!submitted && i === selected) {
            borderColor = '#3b82f6';
            bg = 'color-mix(in srgb, #3b82f6 8%, var(--theme-card-bg))';
          }

          return (
            <button
              key={i}
              onClick={() => !submitted && setSelected(i)}
              className="w-full text-left p-2.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-2"
              style={{ border: `1.5px solid ${borderColor}`, backgroundColor: bg, color: 'var(--theme-content-text)' }}
              disabled={submitted}
            >
              <span className="w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 text-[10px] font-bold"
                style={{ borderColor, color: borderColor }}>
                {String.fromCharCode(65 + i)}
              </span>
              {t(opt.text.en, opt.text.ro)}
            </button>
          );
        })}
      </div>

      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={selected === null}
          className="mt-3 px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          style={{
            backgroundColor: selected !== null ? '#3b82f6' : 'var(--theme-border)',
            color: selected !== null ? '#fff' : 'var(--theme-muted-text)',
          }}
        >
          {t('Submit', 'Trimite')}
        </button>
      )}

      {submitted && (
        <QuestionFeedback result={{
          score: selected === question.correctIndex ? question.points : 0,
          maxScore: question.points,
          feedback: selected === question.correctIndex
            ? { correct: [t(question.explanation?.en, question.explanation?.ro) || 'Correct!'] }
            : { incorrect: [t(question.explanation?.en, question.explanation?.ro) || 'Incorrect.'] },
        }} />
      )}
    </div>
  );
}
