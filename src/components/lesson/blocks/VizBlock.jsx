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
  'game-tree': lazy(() => import('../viz/widgets/GameTree.jsx')),
  'payoff-matrix': lazy(() => import('../viz/widgets/PayoffMatrix.jsx')),
  'ml-omega': lazy(() => import('../viz/widgets/ml/Omega.jsx')),
  'ml-freq-tree': lazy(() => import('../viz/widgets/ml/FreqTree.jsx')),
  'ml-indep-2x2': lazy(() => import('../viz/widgets/ml/Indep2x2.jsx')),
  'ml-pmf-cdf': lazy(() => import('../viz/widgets/ml/PmfCdf.jsx')),
  'ml-joint-table': lazy(() => import('../viz/widgets/ml/JointTable.jsx')),
  'ml-entropy-bars': lazy(() => import('../viz/widgets/ml/EntropyBars.jsx')),
  'ml-id3-builder': lazy(() => import('../viz/widgets/ml/Id3Builder.jsx')),
  'ml-tree-pair': lazy(() => import('../viz/widgets/ml/TreePair.jsx')),
  'ml-dup-counter': lazy(() => import('../viz/widgets/ml/DupCounter.jsx')),
  'ml-threshold': lazy(() => import('../viz/widgets/ml/Threshold.jsx')),
  'ml-cvloo': lazy(() => import('../viz/widgets/ml/CvLoo.jsx')),
  'ml-prune': lazy(() => import('../viz/widgets/ml/Prune.jsx')),
  'ml-nb': lazy(() => import('../viz/widgets/ml/Nb.jsx')),
  'ml-likelihood': lazy(() => import('../viz/widgets/ml/MlLikelihood.jsx')),
  'ml-posterior': lazy(() => import('../viz/widgets/ml/MlPosterior.jsx')),
  'graph-walk': lazy(() => import('../viz/widgets/GraphWalk.jsx')),
};

function Notice({ children }) {
  return <div className="viz viz-notice">{children}</div>;
}

// A widget that throws must not take the lesson down with it.
// A chunk that failed to load (the site was updated while this tab was open) gets a
// reload button instead of the generic message; main.jsx usually reloads before this.
const isChunkError = (e) => /dynamically imported module|Importing a module script failed|Loading chunk|preload/i.test(String(e?.message || e));
class Guard extends React.Component {
  state = { failed: false, chunk: false };
  static getDerivedStateFromError(error) { return { failed: true, chunk: isChunkError(error) }; }
  componentDidCatch(error) { console.error('viz widget failed:', error); }
  render() {
    if (!this.state.failed) return this.props.children;
    if (this.state.chunk) {
      return (
        <Notice>
          {this.props.updated}{' '}
          <button type="button" className="underline font-semibold" onClick={() => window.location.reload()}>{this.props.reload}</button>
        </Notice>
      );
    }
    return <Notice>{this.props.message}</Notice>;
  }
}

// Block JSON: { type: 'viz', id, widget, predict, props }
export default function VizBlock({ widget, props = {}, predict = false }) {
  const { t } = useApp();
  const Widget = WIDGETS[widget];
  if (!Widget) return <Notice>{t(`Unknown visual: "${widget}".`, `Vizual necunoscut: „${widget}".`)}</Notice>;
  return (
    <Guard
      message={t('This visual could not be shown.', 'Acest vizual nu a putut fi afișat.')}
      updated={t('The site was updated while this page was open.', 'Site-ul s-a actualizat cât timp pagina era deschisă.')}
      reload={t('Reload the page', 'Reîncarcă pagina')}
    >
      <Suspense fallback={<div className="skeleton-shimmer viz-skeleton" />}>
        <Widget props={props} predict={!!predict} />
      </Suspense>
    </Guard>
  );
}
