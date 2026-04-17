import React, { useMemo, useState } from 'react';
import { useApp } from '../../../../contexts/AppContext';
import { StepPlayer, MatrixDisplay } from '../../../../components/widgets-core';
import { useWidgetProgress } from '../../../../hooks/useWidgetProgress';
import { runGivensQr } from '../../linalg/givensQr';

export default function GivensQr({ instance, onSubmit, onGenerateInstance }) {
  const { t } = useApp();
  const [submitted, setSubmitted] = useState(false);
  const { submit } = useWidgetProgress('givens-qr', { pbLowerIsBetter: true });

  const { steps, Q, rotations } = useMemo(
    () => runGivensQr(instance.matrix),
    [instance],
  );

  const onCheck = () => {
    if (submitted) return;
    setSubmitted(true);
    const feats = [];
    const expected = (instance.n * (instance.n - 1)) / 2;
    if (rotations === expected) feats.push('minimal-rotations');
    const qResidual = orthogonalResidual(Q);
    if (qResidual < 1e-6) feats.push('unit-q');
    submit({ correct: true, metric: rotations, feats });
    onSubmit?.({ correct: true, metric: rotations, feats });
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
            {step.rotation && (
              <div className="text-xs font-mono p-2 rounded"
                   style={{ background: 'var(--theme-content-bg-alt, #fff7ed)', color: 'var(--theme-content-text)' }}>
                G({step.rotation.col + 1},{step.rotation.row + 1}):
                c = {step.rotation.c.toFixed(4)}, s = {step.rotation.s.toFixed(4)}, r = {step.rotation.r.toFixed(4)}
              </div>
            )}
            <div className="flex gap-6 flex-wrap items-start">
              <div>
                <p className="text-xs font-medium mb-1 opacity-70" style={{ color: 'var(--theme-content-text)' }}>A</p>
                <MatrixDisplay value={step.A} highlight={step.highlights?.A ?? {}} />
              </div>
              <div>
                <p className="text-xs font-medium mb-1 opacity-70" style={{ color: 'var(--theme-content-text)' }}>Qᵀ</p>
                <MatrixDisplay value={step.Qt} />
              </div>
            </div>
          </div>
        )}
      />

      <div className="flex gap-2 items-center">
        <span className="text-xs opacity-75" style={{ color: 'var(--theme-content-text)' }}>
          {t('Rotations used:', 'Rotații utilizate:')} {rotations} / {(instance.n * (instance.n - 1)) / 2}
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
