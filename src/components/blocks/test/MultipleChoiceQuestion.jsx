import React, { useState } from 'react';
import { useApp } from '../../../contexts/AppContext';
import QuestionFeedback from './QuestionFeedback';

export default function MultipleChoiceQuestion({ question, onAnswer, suppressFeedback = false }) {
  const { t } = useApp();
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (selected === null) return;
    const isCorrect = selected === question.correctIndex;
    const score = isCorrect ? question.points : 0;
    setSubmitted(true);
    onAnswer?.(question.id, score, question.points, { selectedIndex: selected });
  };

  // In Timed mode we mark the question "submitted" (so the Finish gate unlocks
  // and the progress bar colors) but suppress per-option correct/wrong cues and
  // the inline feedback until the test is finished.
  const revealResult = submitted && !suppressFeedback;

  return (
    <div>
      <div className="space-y-2">
        {question.options.map((opt, i) => {
          let borderColor = 'var(--theme-border)';
          let bg = 'transparent';
          if (revealResult && i === question.correctIndex) {
            borderColor = '#22c55e';
            bg = 'color-mix(in srgb, #22c55e 8%, var(--theme-card-bg))';
          } else if (revealResult && i === selected && i !== question.correctIndex) {
            borderColor = '#ef4444';
            bg = 'color-mix(in srgb, #ef4444 8%, var(--theme-card-bg))';
          } else if (i === selected) {
            // Selected, pre-reveal (includes timed-mode "locked in" state)
            borderColor = '#3b82f6';
            bg = 'color-mix(in srgb, #3b82f6 8%, var(--theme-card-bg))';
          }

          return (
            <button
              key={i}
              onClick={() => !submitted && setSelected(i)}
              className={`w-full text-left p-3 rounded-lg text-sm transition-colors flex items-center gap-2 min-h-[44px] ${submitted ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              style={{ border: `1.5px solid ${borderColor}`, backgroundColor: bg, color: 'var(--theme-content-text)' }}
              disabled={submitted}
            >
              <span className="w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 text-[11px] font-bold"
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
          className={`mt-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors min-h-[40px] ${selected === null ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          style={{
            backgroundColor: selected !== null ? '#3b82f6' : 'var(--theme-border)',
            color: selected !== null ? '#fff' : 'var(--theme-muted-text)',
          }}
        >
          {t('Submit', 'Trimite')}
        </button>
      )}

      {submitted && suppressFeedback && (
        <div className="mt-2 text-[11px] italic" style={{ color: 'var(--theme-muted-text)' }}>
          {t('Answer recorded. Feedback shown after you finish.', 'Răspuns înregistrat. Vei vedea feedback-ul la finalul testului.')}
        </div>
      )}

      {revealResult && (
        <QuestionFeedback result={{
          score: selected === question.correctIndex ? question.points : 0,
          maxScore: question.points,
          feedback: selected === question.correctIndex
            ? { correct: [t(question.explanation?.en, question.explanation?.ro) || t('Correct!', 'Corect!')] }
            : { incorrect: [t(question.explanation?.en, question.explanation?.ro) || t('Incorrect.', 'Incorect.')] },
        }} />
      )}
    </div>
  );
}
