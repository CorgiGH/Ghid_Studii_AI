import React, { useState } from 'react';
import { useApp } from '../../../contexts/AppContext';
import { gradeAnswer } from '../../../services/api';
import QuestionFeedback from './QuestionFeedback';

export default function OpenEndedQuestion({ question, onAnswer }) {
  const { t, lang } = useApp();
  const [answer, setAnswer] = useState('');
  const [grading, setGrading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!answer.trim()) return;
    setGrading(true);
    setError(null);
    try {
      const res = await gradeAnswer({
        prompt: lang === 'ro' ? question.prompt.ro : question.prompt.en,
        studentAnswer: answer,
        rubric: lang === 'ro' ? question.rubric?.ro : question.rubric?.en,
        maxPoints: question.points,
        questionType: 'open-ended',
      });
      setResult(res);
      onAnswer?.(question.id, res.score, res.maxScore);
    } catch (err) {
      setError(err.message);
    } finally {
      setGrading(false);
    }
  };

  return (
    <div>
      <textarea
        value={answer}
        onChange={e => setAnswer(e.target.value)}
        disabled={!!result}
        rows={4}
        className="w-full rounded-lg p-3 text-xs resize-y"
        style={{
          backgroundColor: 'var(--theme-card-bg)',
          border: '1px solid var(--theme-border)',
          color: 'var(--theme-content-text)',
        }}
        placeholder={t('Type your answer here...', 'Scrie răspunsul tău aici...')}
      />

      {!result && (
        <button
          onClick={handleSubmit}
          disabled={!answer.trim() || grading}
          className="mt-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          style={{
            backgroundColor: answer.trim() && !grading ? '#3b82f6' : 'var(--theme-border)',
            color: answer.trim() && !grading ? '#fff' : 'var(--theme-muted-text)',
          }}
        >
          {grading ? t('Grading...', 'Se corectează...') : t('Submit', 'Trimite')}
        </button>
      )}

      {error && <div className="mt-2 text-xs" style={{ color: '#ef4444' }}>{error}</div>}
      {result && <QuestionFeedback result={result} />}
    </div>
  );
}
