import React, { useMemo, useState, Suspense, lazy } from 'react';
import { useApp } from '../../../../contexts/AppContext';
import { StepPlayer, MatrixDisplay } from '../../../../components/widgets-core';
import { useWidgetProgress } from '../../../../hooks/useWidgetProgress';
import { runHouseholderQr } from '../../linalg/householderQr';

const ReflectionScene = lazy(() => import('./HouseholderScene'));

export default function HouseholderQr({ instance, onSubmit, onGenerateInstance }) {
  const { t } = useApp();
  const [submitted, setSubmitted] = useState(false);
  const { submit } = useWidgetProgress('householder-qr', { pbLowerIsBetter: true });

  const { steps, Q, R, reflections } = useMemo(
    () => runHouseholderQr(instance.matrix),
    [instance],
  );

  const onCheck = () => {
    if (submitted) return;
    setSubmitted(true);
    const feats = [];
    // single-shot: reached upper-triangular R without numeric drift — proxy: ‖QR − A‖∞ < 1e-9
    const residual = residualMax(instance.matrix, Q, R);
    if (residual < 1e-9) feats.push('single-shot');
    // orthogonal: ‖QᵀQ − I‖∞ < 1e-9
    if (orthogonalResidual(Q) < 1e-9) feats.push('orthogonal');
    submit({ correct: true, metric: residual, feats });
    onSubmit?.({ correct: true, metric: residual, feats });
  };

  const onNext = () => {
    setSubmitted(false);
    onGenerateInstance?.();
  };

  return (
    <div className="space-y-4">
      <div className="p-3 rounded border text-sm"
           style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-content-bg-alt, #f1f5f9)', color: 'var(--theme-content-text)' }}>
        <p className="font-medium mb-1">{t('Starting matrix A:', 'Matrice inițială A:')}</p>
        <MatrixDisplay value={instance.matrix} />
      </div>

      <StepPlayer
        steps={steps}
        renderStep={(step) => (
          <div className="space-y-3">
            {step.reflection && (
              <div className="text-xs font-mono p-2 rounded"
                   style={{ background: 'var(--theme-content-bg-alt, #fff7ed)', color: 'var(--theme-content-text)' }}>
                {t('Reflection', 'Reflexie')} k = {step.reflection.col + 1}:
                {' '}‖x‖ = {step.reflection.normX.toFixed(4)},
                {' '}v = ({step.reflection.v.map(c => c.toFixed(3)).join(', ')})
              </div>
            )}
            <div className="flex gap-6 flex-wrap items-start">
              {instance.n === 3 && step.reflection && (
                <div className="shrink-0"
                     style={{ width: 320, height: 320, border: '1px solid var(--theme-border)', borderRadius: 8, background: 'var(--theme-content-bg-alt, #f8fafc)' }}>
                  <Suspense fallback={<SceneFallback t={t} />}>
                    <ReflectionScene x={step.reflection.x} v={step.reflection.v} />
                  </Suspense>
                </div>
              )}
              <div>
                <p className="text-xs font-medium mb-1 opacity-70" style={{ color: 'var(--theme-content-text)' }}>A</p>
                <MatrixDisplay value={step.A} highlight={step.highlights?.A ?? {}} />
              </div>
              <div>
                <p className="text-xs font-medium mb-1 opacity-70" style={{ color: 'var(--theme-content-text)' }}>Q</p>
                <MatrixDisplay value={step.Q} />
              </div>
            </div>
          </div>
        )}
      />

      <div className="flex gap-2 items-center">
        <span className="text-xs opacity-75" style={{ color: 'var(--theme-content-text)' }}>
          {t('Reflections used:', 'Reflexii utilizate:')} {reflections} / {Math.min(instance.n, instance.n - 1)}
        </span>
        {!submitted ? (
          <button onClick={onCheck} className="ml-auto px-4 py-1.5 rounded font-medium text-sm" style={{ background: '#3b82f6', color: '#fff' }}>
            {t('Mark as reviewed (Enter)', 'Marchează ca revizuit (Enter)')}
          </button>
        ) : (
          <button onClick={onNext} className="ml-auto px-4 py-1.5 rounded font-medium text-sm" style={{ background: '#3b82f6', color: '#fff' }}>
            {t('New instance', 'Instanță nouă')}
          </button>
        )}
      </div>
    </div>
  );
}

function SceneFallback({ t }) {
  return (
    <div className="w-full h-full flex items-center justify-center text-xs opacity-70" style={{ color: 'var(--theme-content-text)' }}>
      {t('Loading 3D view…', 'Se încarcă vizualizarea 3D…')}
    </div>
  );
}

function residualMax(A, Q, R) {
  const m = A.length, n = A[0]?.length ?? 0;
  let maxAbs = 0;
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      let s = 0;
      for (let k = 0; k < Math.min(m, R.length); k++) s += Q[i][k] * R[k][j];
      const diff = Math.abs(A[i][j] - s);
      if (diff > maxAbs) maxAbs = diff;
    }
  }
  return maxAbs;
}

function orthogonalResidual(Q) {
  const n = Q.length;
  let maxAbs = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let dot = 0;
      for (let k = 0; k < n; k++) dot += Q[k][i] * Q[k][j];
      const target = i === j ? 1 : 0;
      const diff = Math.abs(dot - target);
      if (diff > maxAbs) maxAbs = diff;
    }
  }
  return maxAbs;
}
