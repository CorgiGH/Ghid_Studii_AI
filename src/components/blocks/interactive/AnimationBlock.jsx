import React, { lazy, Suspense } from 'react';
import { useApp } from '../../../contexts/AppContext';

const StringMatchAnimation = lazy(() => import('./StringMatchAnimation'));
const ArrayRenderer = lazy(() => import('./ArrayRenderer'));
const GraphRenderer = lazy(() => import('./GraphRenderer'));
const TableRenderer = lazy(() => import('./TableRenderer'));

const KNOWN_VARIANTS = {
  kmp: { component: StringMatchAnimation, props: { variant: 'kmp' } },
  'boyer-moore': { component: StringMatchAnimation, props: { variant: 'bm' } },
  'rabin-karp': { component: StringMatchAnimation, props: { variant: 'rk' } },
  'string-matching': { component: StringMatchAnimation, props: { variant: 'kmp' } },
};

const RENDERERS = {
  array: ArrayRenderer,
  graph: GraphRenderer,
  table: TableRenderer,
};

export default function AnimationBlock({ variant, renderer, data }) {
  const { t } = useApp();

  const loading = (
    <div className="p-4 space-y-3">
      <div className="skeleton-shimmer h-6 w-1/3" />
      <div className="skeleton-shimmer h-48 w-full" />
    </div>
  );

  // New data-driven format: renderer + data
  if (renderer && RENDERERS[renderer]) {
    const Comp = RENDERERS[renderer];
    return (
      <Suspense fallback={loading}>
        <Comp data={data} />
      </Suspense>
    );
  }

  // Legacy variant format
  const entry = KNOWN_VARIANTS[variant];
  if (entry) {
    const Comp = entry.component;
    return (
      <Suspense fallback={loading}>
        <Comp {...entry.props} />
      </Suspense>
    );
  }

  // Fallback for unknown
  return (
    <div className="rounded-xl p-4 mb-3 text-center" style={{
      backgroundColor: 'color-mix(in srgb, #10b981 12%, var(--theme-card-bg))',
      border: '1px solid color-mix(in srgb, #10b981 25%, var(--theme-border))',
    }}>
      <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#10b981' }}>
        🎬 {t('Animation', 'Animație')}
      </div>
      <div className="text-xs" style={{ color: 'var(--theme-muted-text)' }}>
        {t('Animation placeholder', 'Placeholder animație')}: {variant || renderer}
      </div>
    </div>
  );
}
