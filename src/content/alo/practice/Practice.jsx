import React, { useMemo } from 'react';
import { useApp } from '../../../contexts/AppContext';
import { ExerciseShell } from '../../../components/exercise-shell';
import ProgressRing from '../../../components/ui/ProgressRing';
import { widgetCatalog, catalogToProblems } from './widgetCatalog';
import { useTodayCounter } from '../../../hooks/useTodayCounter';

export default function Practice() {
  const { t } = useApp();
  const problems = useMemo(() => catalogToProblems(widgetCatalog), []);
  const widgetIds = useMemo(() => widgetCatalog.map(w => w.id), []);
  const today = useTodayCounter(widgetIds);

  if (problems.length === 0) {
    return (
      <div className="text-center py-12 opacity-60">
        <p className="text-4xl mb-4">📐</p>
        <p className="text-lg font-medium">{t('Practice widgets coming soon', 'Widget-uri de practică în curând')}</p>
        <p className="text-sm mt-2">{t('The shell is ready but no widgets are registered yet.', 'Shell-ul e pregătit dar niciun widget nu e înregistrat încă.')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center gap-4 px-4 py-2 border-b"
        style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-content-bg)' }}
      >
        <div className="flex items-center gap-2">
          <ProgressRing size={32} completed={today.totalFluent} total={widgetCatalog.length} />
          <span className="text-sm font-medium" style={{ color: 'var(--theme-content-text)' }}>
            {today.totalFluent}/{widgetCatalog.length} {t('fluent', 'fluent')}
          </span>
        </div>
        {today.count > 0 && (
          <div
            className="px-3 py-1 rounded text-sm"
            style={{ background: 'var(--theme-content-bg-alt, #eff6ff)', color: 'var(--theme-content-text)' }}
            aria-label={t('Today solves', 'Rezolvate azi')}
          >
            {t('Today:', 'Azi:')} {today.count} {t('solves across', 'rezolvări în')} {today.widgetsTouched} {t('widgets', 'widget-uri')}
          </div>
        )}
      </div>
      <div className="flex-1 min-h-0">
        <ExerciseShell problems={problems} mode="practice" />
      </div>
    </div>
  );
}
