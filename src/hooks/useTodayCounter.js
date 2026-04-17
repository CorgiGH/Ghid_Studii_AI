import { useEffect, useState } from 'react';
import { readAllHistories } from './useWidgetProgress';

function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Aggregates today's solves across a given list of widget ids.
 * Returns { count, widgetsTouched, totalFluent }.
 * Re-reads localStorage on any `alo-practice-progress` event.
 */
export function useTodayCounter(widgetIds) {
  const [state, setState] = useState(() => compute(widgetIds));

  useEffect(() => {
    const update = () => setState(compute(widgetIds));
    update();
    window.addEventListener('alo-practice-progress', update);
    return () => window.removeEventListener('alo-practice-progress', update);
  }, [widgetIds.join('|')]);

  return state;
}

function compute(widgetIds) {
  const today = todayString();
  const rows = readAllHistories(widgetIds);
  let count = 0;
  let widgetsTouched = 0;
  let totalFluent = 0;
  for (const { history } of rows) {
    if (history.todayDate === today) {
      count += history.todayCount || 0;
      if ((history.todayCount || 0) > 0) widgetsTouched += 1;
    }
    if (history.correct >= 3) totalFluent += 1;
  }
  return { count, widgetsTouched, totalFluent };
}
