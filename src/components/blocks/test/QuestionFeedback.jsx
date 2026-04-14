import React from 'react';
import { useApp } from '../../../contexts/AppContext';

export default function QuestionFeedback({ result }) {
  const { t } = useApp();
  if (!result) return null;
  const { score, maxScore, feedback, verdict, explanation, rubric } = result;

  const isGradeFormat = score !== undefined;
  const pct = isGradeFormat ? (maxScore > 0 ? score / maxScore : 0) : (verdict === 'correct' ? 1 : verdict === 'partial' ? 0.5 : 0);
  const color = pct >= 0.7 ? '#22c55e' : pct >= 0.4 ? '#f59e0b' : '#ef4444';

  return (
    <div className="mt-3 rounded-lg p-3 text-xs" style={{ backgroundColor: `color-mix(in srgb, ${color} 8%, var(--theme-card-bg))`, border: `1px solid color-mix(in srgb, ${color} 25%, var(--theme-border))` }}>
      {/* Score header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="font-bold" style={{ color }}>
          {isGradeFormat ? `${score}/${maxScore}` : verdict?.toUpperCase()}
        </span>
        {isGradeFormat && (
          <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: 'var(--theme-border)' }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${pct * 100}%`, backgroundColor: color }} />
          </div>
        )}
      </div>

      {/* Grade format: structured feedback */}
      {isGradeFormat && feedback && typeof feedback === 'object' && (
        <div className="space-y-1">
          {feedback.correct?.length > 0 && (
            <div style={{ color: '#22c55e' }}>
              {feedback.correct.map((f, i) => <div key={i}>{'\u2713'} {f}</div>)}
            </div>
          )}
          {feedback.missing?.length > 0 && (
            <div style={{ color: '#f59e0b' }}>
              {feedback.missing.map((f, i) => <div key={i}>{'\u25CB'} {f}</div>)}
            </div>
          )}
          {feedback.incorrect?.length > 0 && (
            <div style={{ color: '#ef4444' }}>
              {feedback.incorrect.map((f, i) => <div key={i}>{'\u2717'} {f}</div>)}
            </div>
          )}
        </div>
      )}

      {/* Plain-string feedback (used by the self-score fallback) */}
      {isGradeFormat && typeof feedback === 'string' && (
        <div style={{ color: 'var(--theme-content-text)' }}>{feedback}</div>
      )}

      {/* Rubric (surfaced when auto-grading is skipped so the learner can self-assess) */}
      {rubric && (
        <details className="mt-2">
          <summary className="cursor-pointer text-[11px] font-semibold" style={{ color: 'var(--theme-muted-text)' }}>
            {t('Rubric', 'Barem')}
          </summary>
          <div className="mt-1 whitespace-pre-wrap" style={{ color: 'var(--theme-content-text)' }}>{rubric}</div>
        </details>
      )}

      {/* Verify format: plain explanation */}
      {!isGradeFormat && explanation && (
        <div style={{ color: 'var(--theme-content-text)' }}>{explanation}</div>
      )}
    </div>
  );
}
