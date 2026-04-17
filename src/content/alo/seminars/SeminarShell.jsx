import React, { useMemo } from 'react';
import ExerciseShell from '../../../components/exercise-shell/ExerciseShell';
import { widgetCatalog } from '../practice/widgetCatalog';

/**
 * Renders a single seminar's problems via the shared ExerciseShell.
 *
 * Props:
 *   - seminarData : { id, title:{en,ro}, problems: Problem[] }
 *     where Problem = { id, title:{en,ro}, statement?:{en,ro}, blocks?:Block[], widgets?:[{id,mode}] }
 *
 * Seminar problems are fixed content (no seeded instance generation), so we pass mode="seminar"
 * which tells ExerciseShell to disable the "Generate new instance" control.
 */
export default function SeminarShell({ seminarData }) {
  const problems = useMemo(
    () => (seminarData?.problems ?? []).map(p => ({
      id: p.id,
      title: p.title,
      statement: p.statement,
      blocks: p.blocks,
      widget: (p.widgets && p.widgets.length > 0) ? pickReferencedWidget(p.widgets[0]) : undefined,
      groupLabel: undefined,
    })),
    [seminarData],
  );

  return <ExerciseShell problems={problems} mode="seminar" />;
}

function pickReferencedWidget(ref) {
  if (!ref?.id) return undefined;
  return widgetCatalog.find(w => w.id === ref.id);
}
