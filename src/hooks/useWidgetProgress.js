import { useCallback, useEffect, useState } from 'react';

const STORAGE_PREFIX = 'alo.practice.';

function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function defaultHistory() {
  return {
    attempts: 0,
    correct: 0,
    bestMetric: null,
    lastSolveAt: null,
    feats: [],
    todayCount: 0,
    todayDate: todayString(),
  };
}

function readStorage(widgetId) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + widgetId);
    if (!raw) return defaultHistory();
    const parsed = JSON.parse(raw);
    if (parsed.todayDate !== todayString()) {
      parsed.todayDate = todayString();
      parsed.todayCount = 0;
    }
    return { ...defaultHistory(), ...parsed };
  } catch {
    return defaultHistory();
  }
}

function writeStorage(widgetId, history) {
  try {
    localStorage.setItem(STORAGE_PREFIX + widgetId, JSON.stringify(history));
  } catch {
    // quota exceeded — silently ignore (app should not crash)
  }
}

export function computeState(history) {
  if (history.correct >= 3) return 'complete';
  if (history.correct >= 1) return 'active';
  if (history.attempts >= 1) return 'started';
  return 'idle';
}

/**
 * Hook: returns { history, submit, regenerate } for a widget.
 *
 * Usage: const { history, submit } = useWidgetProgress(widgetId);
 * Call submit({ correct, metric, feats }) after the student commits an answer.
 */
export function useWidgetProgress(widgetId, { pbLowerIsBetter = true } = {}) {
  const [history, setHistory] = useState(() => readStorage(widgetId));

  useEffect(() => { setHistory(readStorage(widgetId)); }, [widgetId]);

  const submit = useCallback(({ correct, metric, feats }) => {
    setHistory(prev => {
      const next = { ...prev };
      next.attempts += 1;
      if (correct) {
        next.correct += 1;
        next.lastSolveAt = new Date().toISOString();
        if (prev.todayDate !== todayString()) {
          next.todayDate = todayString();
          next.todayCount = 1;
        } else {
          next.todayCount = (prev.todayCount || 0) + 1;
        }
        if (metric != null) {
          const better = pbLowerIsBetter
            ? (prev.bestMetric == null || metric < prev.bestMetric)
            : (prev.bestMetric == null || metric > prev.bestMetric);
          if (better) next.bestMetric = metric;
        }
      }
      if (feats?.length) {
        const set = new Set(prev.feats || []);
        feats.forEach(f => set.add(f));
        next.feats = Array.from(set);
      }
      writeStorage(widgetId, next);
      window.dispatchEvent(new CustomEvent('alo-practice-progress', { detail: { widgetId, history: next } }));
      return next;
    });
  }, [widgetId, pbLowerIsBetter]);

  const reset = useCallback(() => {
    setHistory(defaultHistory());
    writeStorage(widgetId, defaultHistory());
    window.dispatchEvent(new CustomEvent('alo-practice-progress', { detail: { widgetId, history: defaultHistory() } }));
  }, [widgetId]);

  return { history, submit, reset, state: computeState(history) };
}

/** Reads all widget histories for aggregate rings. */
export function readAllHistories(widgetIds) {
  return widgetIds.map(id => ({ id, history: readStorage(id) }));
}
