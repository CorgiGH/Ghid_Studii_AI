import React, { useState } from 'react';
import { useApp } from '../../../contexts/AppContext';
import QuestionFeedback from './QuestionFeedback';

export default function CodeTracingQuestion({ question, onAnswer }) {
  const { t } = useApp();
  const [userOutput, setUserOutput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  const expectedOutput = question.expectedOutput || '';
  const hasFilled = userOutput.trim().length > 0;

  const normalize = (s) => s.replace(/\r\n/g, '\n').replace(/\s+$/gm, '').trim();

  const handleSubmit = () => {
    const normalizedUser = normalize(userOutput);
    const normalizedExpected = normalize(expectedOutput);
    const isCorrect = normalizedUser === normalizedExpected;

    const score = isCorrect ? question.points : 0;
    const res = {
      score,
      maxScore: question.points,
      feedback: isCorrect
        ? { correct: [t('Correct output!', 'Rezultat corect!')] }
        : {
            incorrect: [t(
              `Your output: ${normalizedUser || '(empty)'}`,
              `Rezultatul tau: ${normalizedUser || '(gol)'}`
            )],
            missing: [t(
              `Expected output: ${normalizedExpected}`,
              `Rezultat asteptat: ${normalizedExpected}`
            )],
          },
    };

    if (question.explanation) {
      res.feedback.correct = res.feedback.correct || [];
      if (!isCorrect) {
        res.feedback.missing.push(t(question.explanation.en, question.explanation.ro));
      }
    }

    setResult(res);
    setSubmitted(true);
    onAnswer?.(question.id, score, question.points);
  };

  return (
    <div>
      {/* Code snippet */}
      <pre
        className="rounded-lg text-xs leading-relaxed overflow-x-auto mb-3"
        style={{
          backgroundColor: 'var(--theme-card-bg)',
          padding: '12px 14px',
          border: '1px solid var(--theme-border)',
          fontFamily: 'monospace',
          color: 'var(--theme-content-text)',
        }}
      >
        <code>{question.code}</code>
      </pre>

      {/* Input label */}
      <label
        className="block text-xs font-semibold mb-1.5"
        style={{ color: 'var(--theme-content-text)' }}
      >
        {t('Predicted output:', 'Rezultatul prezis:')}
      </label>

      {/* Answer input */}
      <textarea
        value={userOutput}
        onChange={e => setUserOutput(e.target.value)}
        disabled={submitted}
        rows={3}
        className="w-full rounded-lg px-3 py-2 text-xs font-mono resize-y"
        style={{
          backgroundColor: 'var(--theme-card-bg)',
          border: `1.5px solid ${submitted
            ? (result?.score === question.points ? '#22c55e' : '#ef4444')
            : 'var(--theme-border)'}`,
          color: 'var(--theme-content-text)',
        }}
        placeholder={t('Type the expected output here...', 'Scrie rezultatul asteptat aici...')}
      />

      {/* Submit button */}
      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={!hasFilled}
          className="mt-3 px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          style={{
            backgroundColor: hasFilled ? '#3b82f6' : 'var(--theme-border)',
            color: hasFilled ? '#fff' : 'var(--theme-muted-text)',
          }}
        >
          {t('Submit', 'Trimite')}
        </button>
      )}

      {result && <QuestionFeedback result={result} />}
    </div>
  );
}
