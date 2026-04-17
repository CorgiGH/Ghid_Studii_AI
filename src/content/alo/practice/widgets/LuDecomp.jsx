import React, { useMemo, useState } from 'react';
import { useApp } from '../../../../contexts/AppContext';
import { StepPlayer, MatrixDisplay } from '../../../../components/widgets-core';
import { useWidgetProgress } from '../../../../hooks/useWidgetProgress';
import { runLuDecomp } from '../../linalg/luDecomp';

export default function LuDecomp({ instance, onSubmit, onGenerateInstance }) {
  const { t } = useApp();
  const [variant, setVariant] = useState(instance.defaultVariant ?? 'doolittle');
  const [submitted, setSubmitted] = useState(false);
  const { submit } = useWidgetProgress('lu-decomp', { pbLowerIsBetter: true });

  const { steps, L, U, success } = useMemo(
    () => runLuDecomp(instance.matrix, { variant }),
    [instance, variant],
  );

  const onCheck = () => {
    if (submitted) return;
    setSubmitted(true);
    if (!success) {
      submit({ correct: false });
      onSubmit?.({ correct: false });
      return;
    }
    const feats = [];
    if (variant === 'doolittle') {
      const maxDen = Math.max(...L.flat().map(f => Number(f.d ?? 1n)));
      if (maxDen <= 8) feats.push('doolittle-clean');
    }
    const residual = computeResidualMax(instance.matrix, L, U);
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

      <div className="flex items-center gap-3 flex-wrap">
        <label className="text-sm" style={{ color: 'var(--theme-content-text)' }}>
          {t('Variant:', 'Varianta:')}
          <select
            value={variant}
            onChange={(e) => setVariant(e.target.value)}
            className="ml-2 px-2 py-1 rounded border"
            style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-content-bg)', color: 'var(--theme-content-text)' }}
          >
            <option value="doolittle">{t('Doolittle (L diag = 1)', 'Doolittle (diag L = 1)')}</option>
            <option value="crout">{t('Crout (U diag = 1)', 'Crout (diag U = 1)')}</option>
          </select>
        </label>
        {!success && (
          <span className="text-xs px-2 py-1 rounded" style={{ background: '#fee2e2', color: '#b91c1c' }}>
            {t('Variant fails — try the other or a new instance', 'Varianta eșuează — încearcă cealaltă sau o instanță nouă')}
          </span>
        )}
      </div>

      <StepPlayer
        steps={steps}
        renderStep={(step) => (
          <div className="flex gap-6 flex-wrap items-start">
            <div>
              <p className="text-xs font-medium mb-1 opacity-70" style={{ color: 'var(--theme-content-text)' }}>L</p>
              <MatrixDisplay value={step.L} highlight={step.highlights?.L ?? {}} />
            </div>
            <div>
              <p className="text-xs font-medium mb-1 opacity-70" style={{ color: 'var(--theme-content-text)' }}>U</p>
              <MatrixDisplay value={step.U} highlight={step.highlights?.U ?? {}} />
            </div>
          </div>
        )}
      />

      <div className="flex gap-2">
        {!submitted ? (
          <button onClick={onCheck} className="px-4 py-1.5 rounded font-medium text-sm" style={{ background: '#3b82f6', color: '#fff' }}>
            {t('Mark as reviewed (Enter)', 'Marchează ca revizuit (Enter)')}
          </button>
        ) : (
          <button onClick={onNext} className="px-4 py-1.5 rounded font-medium text-sm" style={{ background: '#3b82f6', color: '#fff' }}>
            {t('New instance', 'Instanță nouă')}
          </button>
        )}
      </div>
    </div>
  );
}

function computeResidualMax(A, L, U) {
  const n = A.length;
  let maxDiff = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let sum = 0;
      for (let p = 0; p < n; p++) {
        sum += Number(L[i][p].valueOf?.() ?? L[i][p]) * Number(U[p][j].valueOf?.() ?? U[p][j]);
      }
      const diff = Math.abs(Number(A[i][j].valueOf?.() ?? A[i][j]) - sum);
      if (diff > maxDiff) maxDiff = diff;
    }
  }
  return maxDiff;
}
