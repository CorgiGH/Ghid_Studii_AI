import React, { useState, useCallback } from 'react';
import { useApp } from '../../contexts/AppContext';
import ProgressRing from '../ui/ProgressRing';
import CrumbStrip from './CrumbStrip';
import ProblemDetailPane from './ProblemDetailPane';
import ShortcutCheatSheet from './ShortcutCheatSheet';
import { useExerciseShell } from './useExerciseShell';
import { computeState, readAllHistories } from '../../hooks/useWidgetProgress';

/**
 * Generic exercise shell — sidebar + crumb strip + detail pane.
 *
 * Props:
 *  - problems : Problem[]
 *      where Problem = {
 *        id: string,
 *        title: {en,ro},
 *        statement?: {en,ro},
 *        widget?: WidgetSpec,         // practice
 *        blocks?: Block[],            // seminars (future plan)
 *        groupLabel?: {en,ro}         // optional sidebar group heading
 *      }
 *  - mode      : 'practice' | 'seminar'
 *  - onJumpToProblem?(index)  // for deep-linking future
 */
export default function ExerciseShell({ problems, mode = 'practice' }) {
  const { t } = useApp();
  const [seedsByIndex, setSeedsByIndex] = useState(() => problems.map(() => Date.now() + Math.floor(Math.random() * 1e6)));

  const { activeIndex, setActiveIndex, showCheatSheet, setShowCheatSheet, revealSolution, setRevealSolution } =
    useExerciseShell({
      problems,
      allowReveal: true,
      allowGenerate: mode === 'practice',
      onGenerate: () => regenerateActive(),
    });

  const regenerateActive = useCallback(() => {
    setSeedsByIndex(prev => {
      const next = prev.slice();
      next[activeIndex] = Date.now() + Math.floor(Math.random() * 1e6);
      return next;
    });
    setRevealSolution(false);
  }, [activeIndex, setRevealSolution]);

  // Recompute crumb/sidebar states on any progress event
  const [, force] = useState(0);
  React.useEffect(() => {
    const h = () => force(n => n + 1);
    window.addEventListener('alo-practice-progress', h);
    return () => window.removeEventListener('alo-practice-progress', h);
  }, []);

  const states = problems.map(p => {
    if (!p.widget) return 'idle';
    const h = readAllHistories([p.widget.id])[0]?.history;
    return computeState(h);
  });

  const problem = problems[activeIndex];

  return (
    <div className="flex h-full" style={{ minHeight: 600 }}>
      <aside
        className="hidden lg:block flex-shrink-0 overflow-y-auto border-r"
        style={{ width: 260, borderColor: 'var(--theme-border)', background: 'var(--theme-sidebar-bg, var(--theme-content-bg))' }}
        aria-label={t('Problems', 'Probleme')}
      >
        <SidebarList problems={problems} states={states} activeIndex={activeIndex} onSelect={setActiveIndex} />
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <CrumbStrip
          problems={problems}
          activeIndex={activeIndex}
          states={states}
          onJump={setActiveIndex}
        />
        <div className="flex-1 overflow-y-auto">
          <ProblemDetailPane
            problem={problem}
            seed={seedsByIndex[activeIndex]}
            revealSolution={revealSolution}
            onReveal={setRevealSolution}
            onGenerateInstance={regenerateActive}
            onSubmit={() => handleSubmit(problem)}
            showNewInstance={mode === 'practice'}
          />
        </div>
      </main>

      <ShortcutCheatSheet open={showCheatSheet} onClose={() => setShowCheatSheet(false)} />
    </div>
  );
}

function handleSubmit(problem) {
  // Progress events fire via useWidgetProgress.submit when called from inside the widget.
  // This top-level handler is a pass-through for widgets that don't own a progress hook.
  if (!problem?.widget?.id) return;
  // No-op here; widgets call useWidgetProgress themselves. Left for future shell-level hooks.
}

function SidebarList({ problems, states, activeIndex, onSelect }) {
  const { t } = useApp();
  // Group by problem.groupLabel.en if provided
  const groups = [];
  let currentGroup = null;
  problems.forEach((p, i) => {
    const label = p.groupLabel ? t(p.groupLabel.en, p.groupLabel.ro) : null;
    if (label !== currentGroup) {
      groups.push({ label, items: [] });
      currentGroup = label;
    }
    groups[groups.length - 1].items.push({ p, i });
  });

  return (
    <ul className="py-4 text-sm">
      {groups.map((g, gi) => (
        <li key={gi}>
          {g.label && (
            <div className="px-4 py-1 text-xs uppercase tracking-wide font-medium opacity-60"
                 style={{ color: 'var(--theme-content-text)' }}>
              {g.label}
            </div>
          )}
          <ul>
            {g.items.map(({ p, i }) => {
              const isActive = i === activeIndex;
              const state = states[i];
              return (
                <li key={p.id}>
                  <button
                    onClick={() => onSelect(i)}
                    aria-current={isActive ? 'true' : undefined}
                    className="w-full flex items-center gap-2 px-4 py-2 text-left"
                    style={{
                      background: isActive ? 'var(--theme-content-bg-alt, #eff6ff)' : 'transparent',
                      color: 'var(--theme-content-text)',
                      borderLeft: `3px solid ${isActive ? '#3b82f6' : 'transparent'}`,
                    }}
                  >
                    <ProgressRing
                      size={18}
                      completed={ringCompleted(state)}
                      total={ringTotal(state)}
                      isActive={isActive}
                    />
                    <span className="text-xs font-mono flex-shrink-0 w-6">{i + 1}.</span>
                    <span className="flex-1 truncate">
                      {t(p.title.en, p.title.ro)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </li>
      ))}
    </ul>
  );
}

function ringCompleted(state) {
  if (state === 'complete') return 3;
  if (state === 'active')   return 1;
  if (state === 'started')  return 1;
  return 0;
}
function ringTotal(state) {
  if (state === 'started') return 3; // amber = "tried, 0 correct" — rendered as 1/3 amber
  return 3;
}
