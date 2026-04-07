import React, { lazy, Suspense } from 'react';
import { useApp } from '../../../contexts/AppContext';

const StringMatchAnimation = lazy(() => import('./StringMatchAnimation'));

const KNOWN_VARIANTS = {
  kmp: { component: StringMatchAnimation, props: { variant: 'kmp' } },
  'boyer-moore': { component: StringMatchAnimation, props: { variant: 'bm' } },
  'rabin-karp': { component: StringMatchAnimation, props: { variant: 'bm' } },
  'string-matching': { component: StringMatchAnimation, props: { variant: 'kmp' } },
};

export default function AnimationBlock({ variant }) {
  const { t } = useApp();
  const entry = KNOWN_VARIANTS[variant];

  if (entry) {
    const Comp = entry.component;
    return (
      <Suspense fallback={<div className="animate-pulse p-4 text-sm opacity-50">Loading animation...</div>}>
        <Comp {...entry.props} />
      </Suspense>
    );
  }

  return (
    <div className="rounded-xl p-4 mb-3 text-center" style={{ backgroundColor: 'color-mix(in srgb, #10b981 6%, var(--theme-card-bg))', border: '1px solid color-mix(in srgb, #10b981 15%, var(--theme-border))' }}>
      <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#10b981' }}>{'\uD83C\uDFAC'} {t('Animation', 'Anima\u021bie')}</div>
      <div className="text-xs" style={{ color: 'var(--theme-muted-text)' }}>{t('Animation placeholder', 'Placeholder anima\u021bie')}: {variant}</div>
    </div>
  );
}
