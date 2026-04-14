import React from 'react';
import ReactMarkdown from 'react-markdown';
import { useApp } from '../../../contexts/AppContext';
import ProgressRing from '../../ui/ProgressRing';

function stripMd(s) {
  if (!s) return '';
  return s.replace(/[*_`#>]/g, '').replace(/\s+/g, ' ').trim();
}

function truncateOnWord(s, n) {
  if (!s || s.length <= n) return s;
  const cut = s.slice(0, n);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut) + '…';
}

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
          const color = isCorrect ? '#22c55e' : '#ef4444';
          const shortPrompt = truncateOnWord(stripMd(t(q.prompt.en, q.prompt.ro)), 70);
          const fullPrompt = t(q.prompt.en, q.prompt.ro);
          const isMC = q.type === 'multiple-choice' && Array.isArray(q.options);
          const correctOpt = isMC ? q.options[q.correctIndex] : null;
          const pickedOpt = isMC && typeof a.selectedIndex === 'number' ? q.options[a.selectedIndex] : null;
          const topExplanation = q.explanation ? t(q.explanation.en, q.explanation.ro) : null;
          const rubric = q.rubric ? t(q.rubric.en, q.rubric.ro) : null;

          return (
            <details
              key={q.id}
              className="rounded-lg overflow-hidden"
              style={{ backgroundColor: 'var(--theme-content-bg)', border: '1px solid var(--theme-border)' }}
            >
              <summary className="flex items-center gap-3 p-3 cursor-pointer list-none" style={{ outline: 'none' }}>
                <span style={{ color, fontSize: '18px' }}>{isCorrect ? '\u2713' : '\u2717'}</span>
                <span className="flex-1 text-sm" style={{ color: 'var(--theme-content-text)' }}>
                  <span className="font-semibold">{t(`Q${i + 1}`, `Î${i + 1}`)}</span>: {shortPrompt}
                </span>
                <span className="text-xs font-bold" style={{ color }}>
                  {a.score}/{q.points}
                </span>
                <span className="text-[11px]" style={{ color: 'var(--theme-muted-text)' }}>{'\u25BE'}</span>
              </summary>

              <div className="px-4 pb-4 pt-1 space-y-3 text-xs" style={{ borderTop: '1px solid var(--theme-border)', color: 'var(--theme-content-text)' }}>
                {/* Full prompt (markdown to respect code/bold/etc.) */}
                <div className="prose-sm">
                  <ReactMarkdown>{fullPrompt}</ReactMarkdown>
                </div>

                {/* For MC: show user's pick vs correct option */}
                {isMC && (
                  <div className="space-y-1.5">
                    {pickedOpt && (
                      <div className="p-2 rounded" style={{ backgroundColor: `color-mix(in srgb, ${color} 8%, var(--theme-card-bg))`, borderLeft: `3px solid ${color}` }}>
                        <div className="text-[10px] font-semibold uppercase tracking-wide mb-0.5" style={{ color }}>
                          {t('Your answer', 'Răspunsul tău')}
                        </div>
                        <div>
                          <span className="font-bold mr-1">{String.fromCharCode(65 + a.selectedIndex)}.</span>
                          {t(pickedOpt.text.en, pickedOpt.text.ro)}
                        </div>
                        {pickedOpt.explanation && (
                          <div className="mt-1 text-[11px]" style={{ color: 'var(--theme-muted-text)' }}>
                            {t(pickedOpt.explanation.en, pickedOpt.explanation.ro)}
                          </div>
                        )}
                      </div>
                    )}
                    {correctOpt && !isCorrect && (
                      <div className="p-2 rounded" style={{ backgroundColor: 'color-mix(in srgb, #22c55e 8%, var(--theme-card-bg))', borderLeft: '3px solid #22c55e' }}>
                        <div className="text-[10px] font-semibold uppercase tracking-wide mb-0.5" style={{ color: '#22c55e' }}>
                          {t('Correct answer', 'Răspuns corect')}
                        </div>
                        <div>
                          <span className="font-bold mr-1">{String.fromCharCode(65 + q.correctIndex)}.</span>
                          {t(correctOpt.text.en, correctOpt.text.ro)}
                        </div>
                        {correctOpt.explanation && (
                          <div className="mt-1 text-[11px]" style={{ color: 'var(--theme-muted-text)' }}>
                            {t(correctOpt.explanation.en, correctOpt.explanation.ro)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* For open-ended / other: show rubric if present */}
                {!isMC && rubric && (
                  <div className="p-2 rounded" style={{ backgroundColor: 'var(--theme-card-bg)', border: '1px dashed var(--theme-border)' }}>
                    <div className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--theme-muted-text)' }}>
                      {t('Rubric', 'Barem')}
                    </div>
                    <div className="whitespace-pre-wrap">{rubric}</div>
                  </div>
                )}

                {/* Top-level explanation */}
                {topExplanation && (
                  <div style={{ color: 'var(--theme-muted-text)' }}>
                    <span className="font-semibold" style={{ color: 'var(--theme-content-text)' }}>
                      {t('Why', 'De ce')}:
                    </span>{' '}
                    {topExplanation}
                  </div>
                )}
              </div>
            </details>
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
