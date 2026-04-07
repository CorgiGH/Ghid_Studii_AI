import React, { useState } from 'react';
import { useApp } from '../../../contexts/AppContext';
import QuestionFeedback from './QuestionFeedback';

export default function FillInQuestion({ question, onAnswer }) {
  const { t } = useApp();
  const [values, setValues] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  const blanks = question.blanks || [];
  const allFilled = blanks.every(b => (values[b.id] || '').trim());

  const handleSubmit = () => {
    let correct = 0;
    blanks.forEach(blank => {
      const val = (values[blank.id] || '').trim().toLowerCase();
      if (blank.accept.some(a => a.toLowerCase() === val)) correct++;
    });

    const score = blanks.length > 0 ? Math.round((correct / blanks.length) * question.points) : 0;
    const res = {
      score,
      maxScore: question.points,
      feedback: correct === blanks.length
        ? { correct: [t('All blanks correct!', 'Toate completate corect!')] }
        : {
            correct: correct > 0 ? [t(`${correct}/${blanks.length} correct`, `${correct}/${blanks.length} corecte`)] : [],
            missing: [t(`Expected: ${blanks.map(b => b.accept[0]).join(', ')}`, `Așteptat: ${blanks.map(b => b.accept[0]).join(', ')}`)],
          },
    };
    setResult(res);
    setSubmitted(true);
    onAnswer?.(question.id, score, question.points);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5">
        {blanks.map(blank => {
          let borderColor = 'var(--theme-border)';
          if (submitted) {
            const val = (values[blank.id] || '').trim().toLowerCase();
            borderColor = blank.accept.some(a => a.toLowerCase() === val) ? '#22c55e' : '#ef4444';
          }
          return (
            <input
              key={blank.id}
              type="text"
              value={values[blank.id] || ''}
              onChange={e => setValues(prev => ({ ...prev, [blank.id]: e.target.value }))}
              disabled={submitted}
              className="rounded px-2 py-1 text-xs font-mono text-center"
              style={{
                width: `${Math.max(6, (blank.accept[0]?.length || 6) + 2)}ch`,
                backgroundColor: 'var(--theme-card-bg)',
                border: `1.5px solid ${borderColor}`,
                color: 'var(--theme-content-text)',
              }}
              placeholder="___"
            />
          );
        })}
      </div>

      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={!allFilled}
          className="mt-3 px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          style={{
            backgroundColor: allFilled ? '#3b82f6' : 'var(--theme-border)',
            color: allFilled ? '#fff' : 'var(--theme-muted-text)',
          }}
        >
          {t('Submit', 'Trimite')}
        </button>
      )}

      {result && <QuestionFeedback result={result} />}
    </div>
  );
}
