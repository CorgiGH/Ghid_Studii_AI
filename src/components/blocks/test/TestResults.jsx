import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import ProgressRing from '../../ui/ProgressRing';

export default function TestResults({ questions, answers, totalPoints, onRetake, onReviewMistakes }) {
  const { t } = useApp();

  const totalScore = Object.values(answers).reduce((sum, a) => sum + (a.score || 0), 0);
  const pct = totalPoints > 0 ? totalScore / totalPoints : 0;
  const percent = Math.round(pct * 100);
  const color = pct >= 0.8 ? '#22c55e' : pct >= 0.5 ? '#f59e0b' : '#ef4444';

  const wrongQuestions = questions.filter(q => {
    const a = answers[q.id];
    return a && q.points > 0 && a.score / q.points < 0.7;
  });

  return (
    <div className="rounded-xl p-6 mt-6" style={{ backgroundColor: 'var(--theme-card-bg)', border: `2px solid ${color}` }}>
      {/* Score ring */}
      <div className="flex flex-col items-center mb-6">
        <ProgressRing size={120} completed={totalScore} total={totalPoints} />
        <p className="mt-3" style={{ fontSize: 'var(--type-h2)', fontWeight: 'var(--type-h2-weight)', color }}>
          {percent}%
        </p>
        <p style={{ color: 'var(--theme-muted-text)' }}>
          {totalScore}/{totalPoints} {t('points', 'puncte')}
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--theme-muted-text)' }}>
          {t(
            pct >= 0.8 ? 'Great job!' : pct >= 0.5 ? 'Keep studying' : 'Review the material',
            pct >= 0.8 ? 'Foarte bine!' : pct >= 0.5 ? 'Mai studiază' : 'Revizuiește materialul'
          )}
        </p>
      </div>

      {/* Per-question breakdown */}
      <h3 className="mb-3" style={{ fontSize: 'var(--type-h3)', fontWeight: 'var(--type-h3-weight)', color: 'var(--theme-content-text)' }}>
        {t('Questions', 'Întrebări')}
      </h3>
      <div className="space-y-2 mb-6">
        {questions.map((q, i) => {
          const a = answers[q.id];
          if (!a) return null;
          const qPct = q.points > 0 ? a.score / q.points : 0;
          const isCorrect = qPct >= 0.7;
          return (
            <div
              key={q.id}
              className="flex items-center gap-3 p-3 rounded-lg"
              style={{ backgroundColor: 'var(--theme-content-bg)', border: '1px solid var(--theme-border)' }}
            >
              <span style={{ color: isCorrect ? '#22c55e' : '#ef4444', fontSize: '18px' }}>
                {isCorrect ? '\u2713' : '\u2717'}
              </span>
              <span className="flex-1 text-sm truncate" style={{ color: 'var(--theme-content-text)' }}>
                {t(`Q${i + 1}`, `Î${i + 1}`)}: {t(q.prompt.en, q.prompt.ro).slice(0, 80)}
              </span>
              <span className="text-xs font-bold" style={{ color: isCorrect ? '#22c55e' : '#ef4444' }}>
                {a.score}/{q.points}
              </span>
            </div>
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 justify-center">
        {wrongQuestions.length > 0 && onReviewMistakes && (
          <button
            onClick={onReviewMistakes}
            className="px-6 py-3 rounded-lg transition-colors"
            style={{ backgroundColor: '#3b82f6', color: 'white', fontWeight: 600 }}
          >
            {t('Review Mistakes', 'Revizuiește Greșelile')} ({wrongQuestions.length})
          </button>
        )}
        {onRetake && (
          <button
            onClick={onRetake}
            className="px-6 py-3 rounded-lg transition-colors"
            style={{ border: '1px solid var(--theme-border)', color: 'var(--theme-content-text)', backgroundColor: 'var(--theme-card-bg)', fontWeight: 600 }}
          >
            {t('Retake Test', 'Reia Testul')}
          </button>
        )}
      </div>
    </div>
  );
}
