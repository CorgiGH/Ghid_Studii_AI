import React, { useMemo, useState } from 'react';
import { useApp } from '../../../../contexts/AppContext';
import { StepPlayer, MatrixDisplay } from '../../../../components/widgets-core';
import { useWidgetProgress } from '../../../../hooks/useWidgetProgress';
import { runGaussElim } from '../../linalg/gaussElim';

export default function GaussElim({ instance, onSubmit, onGenerateInstance }) {
  const { t } = useApp();
  const [pivoting, setPivoting] = useState('partial');
  const [submitted, setSubmitted] = useState(false);
  const { submit } = useWidgetProgress('gauss-elim', { pbLowerIsBetter: true });

  const { steps, ops } = useMemo(
    () => runGaussElim(instance.matrix, { pivoting }),
    [instance, pivoting]
  );

  const onCheck = () => {
    if (submitted) return;
    setSubmitted(true);
    const feats = [];
    if (ops.swaps === 0 && !instance.requiresPivoting) feats.push('no-swap');
    // clean-pivot: if all cell denominators stayed ≤ 10
    const maxDen = Math.max(
      ...steps[steps.length - 1].matrix.flat()
        .map(f => Number((f.d ?? 1n)))
    );
    if (maxDen <= 10) feats.push('clean-pivot');

    const totalOps = ops.adds + ops.swaps;
    submit({ correct: true, metric: totalOps, feats });
    onSubmit?.({ correct: true, metric: totalOps, feats });
  };

  const onNext = () => {
    setSubmitted(false);
    onGenerateInstance?.();
  };

  return (
    <div className="space-y-4">
      <div className="p-3 rounded border text-sm"
           style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-content-bg-alt, #f1f5f9)', color: 'var(--theme-content-text)' }}>
        <p className="font-medium mb-1">{t('Starting matrix [A | b]:', 'Matrice inițială [A | b]:')}</p>
        <MatrixDisplay value={instance.matrix} />
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm" style={{ color: 'var(--theme-content-text)' }}>
          {t('Pivoting:', 'Pivotare:')}
          <select
            value={pivoting}
            onChange={(e) => setPivoting(e.target.value)}
            className="ml-2 px-2 py-1 rounded border"
            style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-content-bg)', color: 'var(--theme-content-text)' }}
          >
            <option value="none">{t('None', 'Fără')}</option>
            <option value="partial">{t('Partial', 'Parțială')}</option>
          </select>
        </label>
        <span className="text-xs opacity-75" style={{ color: 'var(--theme-content-text)' }}>
          {t('Adds:', 'Adunări:')} {ops.adds} · {t('Swaps:', 'Permutări:')} {ops.swaps}
        </span>
      </div>

      <StepPlayer steps={steps} />

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
