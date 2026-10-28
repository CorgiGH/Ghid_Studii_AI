import React, { Suspense, lazy } from 'react';
import { useApp } from '../../../contexts/AppContext';

const WIDGETS = {
  'table-map': lazy(() => import('../viz/widgets/TableMap.jsx')),
  'table-build': lazy(() => import('../viz/widgets/TableBuild.jsx')),
  'row-insert': lazy(() => import('../viz/widgets/RowInsert.jsx')),
  'delete-sweep': lazy(() => import('../viz/widgets/DeleteSweep.jsx')),
  'like-slider': lazy(() => import('../viz/widgets/LikeSlider.jsx')),
  'in-between': lazy(() => import('../viz/widgets/InBetween.jsx')),
  'number-line': lazy(() => import('../viz/widgets/NumberLine.jsx')),
  'char-boxes': lazy(() => import('../viz/widgets/CharBoxes.jsx')),
  'char-strips': lazy(() => import('../viz/widgets/CharStrips.jsx')),
  'calendar-clock': lazy(() => import('../viz/widgets/CalendarClock.jsx')),
  'date-mask': lazy(() => import('../viz/widgets/DateMask.jsx')),
  'age-timeline': lazy(() => import('../viz/widgets/AgeTimeline.jsx')),
  'decode-sieve': lazy(() => import('../viz/widgets/DecodeSieve.jsx')),
  'type-pipes': lazy(() => import('../viz/widgets/TypePipes.jsx')),
  'cartesian-grid': lazy(() => import('../viz/widgets/CartesianGrid.jsx')),
  'join-wires': lazy(() => import('../viz/widgets/JoinWires.jsx')),
  'self-pairs': lazy(() => import('../viz/widgets/SelfPairs.jsx')),
  'all-vs-some': lazy(() => import('../viz/widgets/AllVsSome.jsx')),
  'set-balls': lazy(() => import('../viz/widgets/SetBalls.jsx')),
  'ml-id3-builder': lazy(() => import('../viz/widgets/ml/Id3Builder.jsx')),
  'ml-tree-pair': lazy(() => import('../viz/widgets/ml/TreePair.jsx')),
};

function Notice({ children }) {
  return <div className="viz viz-notice">{children}</div>;
}

// A widget that throws must not take the lesson down with it.
class Guard extends React.Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error) { console.error('viz widget failed:', error); }
  render() { return this.state.failed ? <Notice>{this.props.message}</Notice> : this.props.children; }
}

// Block JSON: { type: 'viz', id, widget, predict, props }
export default function VizBlock({ widget, props = {}, predict = false }) {
  const { t } = useApp();
  const Widget = WIDGETS[widget];
  if (!Widget) return <Notice>{t(`Unknown visual: "${widget}".`, `Vizual necunoscut: „${widget}".`)}</Notice>;
  return (
    <Guard message={t('This visual could not be shown.', 'Acest vizual nu a putut fi afișat.')}>
      <Suspense fallback={<div className="skeleton-shimmer viz-skeleton" />}>
        <Widget props={props} predict={!!predict} />
      </Suspense>
    </Guard>
  );
}
