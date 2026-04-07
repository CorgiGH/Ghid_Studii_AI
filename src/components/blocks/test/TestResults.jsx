import React from 'react';
import { useApp } from '../../../contexts/AppContext';

export default function TestResults({ questions, answers, totalPoints }) {
  const { t } = useApp();

  const totalScore = Object.values(answers).reduce((sum, a) => sum + (a.score || 0), 0);
  const pct = totalPoints > 0 ? totalScore / totalPoints : 0;
  const color = pct >= 0.7 ? '#22c55e' : pct >= 0.4 ? '#f59e0b' : '#ef4444';

  return (
    <div className="rounded-xl p-4 mt-6" style={{ backgroundColor: 'var(--theme-card-bg)', border: `2px solid ${color}` }}>
      {/* Total score */}
      <div className="text-center mb-4">
        <div className="text-2xl font-bold" style={{ color }}>
          {totalScore}/{totalPoints}
        </div>
        <div className="text-xs mt-1" style={{ color: 'var(--theme-muted-text)' }}>
          {t(`${Math.round(pct * 100)}% — ${pct >= 0.7 ? 'Great job!' : pct >= 0.4 ? 'Keep studying' : 'Review the material'}`,
             `${Math.round(pct * 100)}% — ${pct >= 0.7 ? 'Foarte bine!' : pct >= 0.4 ? 'Mai studiază' : 'Revizuiește materialul'}`)}
        </div>
      </div>

      {/* Per-question breakdown */}
      <div className="space-y-2">
        {questions.map((q, i) => {
          const a = answers[q.id];
          if (!a) return null;
          const qPct = q.points > 0 ? a.score / q.points : 0;
          const qColor = qPct >= 0.7 ? '#22c55e' : qPct >= 0.4 ? '#f59e0b' : '#ef4444';
          return (
            <div key={q.id} className="flex items-center gap-2 text-xs" style={{ color: 'var(--theme-content-text)' }}>
              <span className="font-bold" style={{ color: qColor }}>{a.score}/{q.points}</span>
              <span className="truncate">{t(`Q${i + 1}`, `Î${i + 1}`)}: {t(q.prompt.en, q.prompt.ro).slice(0, 60)}...</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
