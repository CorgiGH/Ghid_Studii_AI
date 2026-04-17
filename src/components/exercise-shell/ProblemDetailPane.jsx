import React, { Suspense } from 'react';
import { AnimatePresence } from 'motion/react';
// motion.article below requires motion import for JSX transform
// eslint-disable-next-line no-unused-vars
import { motion } from 'motion/react';
import { useApp } from '../../contexts/AppContext';
import { useWidgetProgress } from '../../hooks/useWidgetProgress';
import { FeatTray } from '../widgets-core';

/**
 * Renders a single problem.
 *
 * Props:
 *  - problem              : { id, title, statement, widget?, blocks? }
 *      where widget = { id, Component, generateInstance, mode, pbMetric?, feats: [], courseRef }
 *      where blocks = Array<Block> for seminar-style content (future plan)
 *  - seed                 : current instance seed
 *  - revealSolution       : bool
 *  - onReveal(toggle)
 *  - onGenerateInstance() : next seed
 *  - onSubmit({correct, metric, feats})
 *  - showNewInstance      : bool (Practice=true, Seminars=false)
 */
export default function ProblemDetailPane({
  problem, seed, revealSolution, onReveal, onGenerateInstance, onSubmit, showNewInstance,
}) {
  const { t } = useApp();

  if (!problem) {
    return (
      <div className="p-12 text-center" style={{ color: 'var(--theme-content-text)' }}>
        <p className="text-lg">{t('Select a problem to begin', 'Selectează o problemă')}</p>
      </div>
    );
  }

  const { widget } = problem;

  return (
    <AnimatePresence mode="wait">
      <motion.article
        key={`${problem.id}-${seed}`}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.15 }}
        role="region"
        aria-labelledby={`problem-title-${problem.id}`}
        className="p-6 max-w-4xl mx-auto"
      >
        <h2
          id={`problem-title-${problem.id}`}
          className="text-xl font-bold mb-3"
          style={{ color: 'var(--theme-content-text)' }}
        >
          {t(problem.title.en, problem.title.ro)}
        </h2>

        {problem.statement && (
          <p className="mb-4" style={{ color: 'var(--theme-content-text)' }}>
            {t(problem.statement.en, problem.statement.ro)}
          </p>
        )}

        {widget && (
          <WidgetHost
            widget={widget}
            seed={seed}
            onSubmit={onSubmit}
            onGenerateInstance={onGenerateInstance}
          />
        )}

        <div className="mt-4 flex items-center gap-3 flex-wrap">
          {showNewInstance && widget && (
            <button
              onClick={onGenerateInstance}
              className="px-3 py-1.5 text-sm rounded font-medium"
              style={{ background: '#3b82f6', color: '#fff' }}
            >
              {t('Generate new instance (n)', 'Generează instanță nouă (n)')}
            </button>
          )}
          <button
            onClick={() => onReveal(!revealSolution)}
            className="px-3 py-1.5 text-sm rounded border"
            style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-content-text)' }}
          >
            {revealSolution
              ? t('Hide solution (r)', 'Ascunde soluția (r)')
              : t('Show solution (r)', 'Arată soluția (r)')}
          </button>
          {widget?.feats?.length > 0 && (
            <FeatsForWidget widgetId={widget.id} allFeats={widget.feats} />
          )}
        </div>
      </motion.article>
    </AnimatePresence>
  );
}

function WidgetHost({ widget, seed, onSubmit, onGenerateInstance }) {
  const { history } = useWidgetProgress(widget.id, {
    pbLowerIsBetter: widget.pbMetric?.lowerIsBetter ?? true,
  });
  const instance = widget.generateInstance(seed, widget.difficulty ?? 'medium');
  const Component = widget.Component;

  return (
    <div className="my-4">
      <Suspense fallback={<div className="p-6 text-sm" style={{ color: 'var(--theme-content-text)' }}>Loading widget…</div>}>
        <Component
          instance={instance}
          seed={seed}
          difficulty={widget.difficulty ?? 'medium'}
          onSubmit={onSubmit}
          onGenerateInstance={onGenerateInstance}
          history={history}
        />
      </Suspense>
    </div>
  );
}

function FeatsForWidget({ widgetId, allFeats }) {
  const { history } = useWidgetProgress(widgetId);
  return <FeatTray allFeats={allFeats} earnedFeatIds={history.feats} />;
}
