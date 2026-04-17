import { useCallback, useEffect, useState, useMemo } from 'react';

/**
 * Hook: manages ExerciseShell state + keyboard shortcuts.
 *
 * Args:
 *  - problems: Array<{ id: string, ...}>
 *  - onRevealSolutionToggle (optional)
 *  - onGenerateInstance     (optional; Practice only)
 *
 * Returns: { activeIndex, setActiveIndex, showCheatSheet, setShowCheatSheet, revealSolution, setRevealSolution }
 */
export function useExerciseShell({ problems, allowReveal = true, allowGenerate = false, onGenerate }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const [revealSolution, setRevealSolution] = useState(false);

  // Reset reveal on problem change
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setRevealSolution(false); }, [activeIndex]);

  const advance = useCallback((delta) => {
    setActiveIndex(prev => {
      const next = Math.min(problems.length - 1, Math.max(0, prev + delta));
      return next;
    });
  }, [problems.length]);

  useEffect(() => {
    const onKey = (e) => {
      // Don't intercept typing inside inputs
      const tag = (e.target?.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === 'j' || e.key === 'ArrowDown') { e.preventDefault(); advance(1); }
      else if (e.key === 'k' || e.key === 'ArrowUp') { e.preventDefault(); advance(-1); }
      else if (/^[0-9]$/.test(e.key)) {
        const n = Number(e.key);
        const target = n === 0 ? 9 : n - 1; // '1'→0, '9'→8, '0'→9
        if (target < problems.length) { e.preventDefault(); setActiveIndex(target); }
      }
      else if (e.key === 'r' && allowReveal) { e.preventDefault(); setRevealSolution(v => !v); }
      else if (e.key === 'n' && allowGenerate && onGenerate) { e.preventDefault(); onGenerate(); }
      else if (e.key === '?') { e.preventDefault(); setShowCheatSheet(v => !v); }
      else if (e.key === 'Escape') { setShowCheatSheet(false); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [advance, allowReveal, allowGenerate, onGenerate, problems.length]);

  return useMemo(() => ({
    activeIndex, setActiveIndex,
    showCheatSheet, setShowCheatSheet,
    revealSolution, setRevealSolution,
    advance,
  }), [activeIndex, showCheatSheet, revealSolution, advance]);
}
