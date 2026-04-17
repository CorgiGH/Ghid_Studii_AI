import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../../../../contexts/AppContext';
import { MatrixDisplay, VectorInput } from '../../../../components/widgets-core';
import { useWidgetProgress } from '../../../../hooks/useWidgetProgress';
import { computeConditionNumber, relativeAmplification } from '../../linalg/conditionNumber';

export default function ConditionNumber({ instance, onSubmit, onGenerateInstance }) {
  const { t } = useApp();
  const [submitted, setSubmitted] = useState(false);
  const [factorAnswer, setFactorAnswer] = useState('');
  const [hilbertGuess, setHilbertGuess] = useState(null); // null | true | false
  const [deltaB, setDeltaB] = useState(() => instance.b.map(() => '0'));
  const sawSignFlipRef = useRef(false);
  const { submit } = useWidgetProgress('condition-number', { pbLowerIsBetter: true });

  // Reset volatile UI state on new instance
  useEffect(() => {
    setSubmitted(false);
    setFactorAnswer('');
    setHilbertGuess(null);
    setDeltaB(instance.b.map(() => '0'));
    sawSignFlipRef.current = false;
  }, [instance]);

  const { kappa, sigmaMax, sigmaMin, singular } = useMemo(
    () => computeConditionNumber(instance.matrix),
    [instance],
  );

  const deltaBNumeric = useMemo(
    () => deltaB.map(s => {
      const v = parseFloat(s);
      return Number.isFinite(v) ? v : 0;
    }),
    [deltaB],
  );

  const probe = useMemo(
    () => relativeAmplification(instance.matrix, instance.b, deltaBNumeric),
    [instance, deltaBNumeric],
  );

  // Track lifetime sign-flip detection for the `near-singular` feat.
  useEffect(() => {
    if (probe.signFlip) sawSignFlipRef.current = true;
  }, [probe.signFlip]);

  const onCheck = () => {
    if (submitted) return;
    setSubmitted(true);

    const parsed = parseFloat(factorAnswer);
    const factorCorrect =
      Number.isFinite(parsed) &&
      Number.isFinite(probe.ratio) &&
      Math.abs(Math.log10(Math.max(parsed, 1)) - Math.log10(Math.max(probe.ratio, 1))) < 0.5;

    const hilbertCorrect = hilbertGuess !== null && hilbertGuess === instance.isHilbert;

    const feats = [];
    if (hilbertCorrect && instance.isHilbert) feats.push('hilbert-spotter');
    if (sawSignFlipRef.current) feats.push('near-singular');

    submit({
      correct: factorCorrect && hilbertGuess !== null && hilbertCorrect,
      feats,
    });
    onSubmit?.({
      correct: factorCorrect && hilbertGuess !== null && hilbertCorrect,
      feats,
    });
  };

  const onNext = () => {
    onGenerateInstance?.();
  };

  const familyLabel = (() => {
    switch (instance.family) {
      case 'hilbert': return t('Hilbert', 'Hilbert');
      case 'vandermonde': return t('Vandermonde', 'Vandermonde');
      case 'identity-scaled': return t('Identity-scaled', 'Identitate scalată');
      default: return t('Random', 'Aleatorie');
    }
  })();

  const factorParsed = parseFloat(factorAnswer);
  const factorOk =
    submitted &&
    Number.isFinite(factorParsed) &&
    Number.isFinite(probe.ratio) &&
    Math.abs(Math.log10(Math.max(factorParsed, 1)) - Math.log10(Math.max(probe.ratio, 1))) < 0.5;
  const hilbertOk = submitted && hilbertGuess !== null && hilbertGuess === instance.isHilbert;

  return (
    <div className="space-y-4">
      <div className="p-3 rounded border text-sm"
           style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-content-bg-alt, #f1f5f9)', color: 'var(--theme-content-text)' }}>
        <p className="font-medium mb-1">{t('Matrix A:', 'Matricea A:')}</p>
        <MatrixDisplay value={instance.matrix} />
        <p className="text-xs mt-2 opacity-75">
          {t('b =', 'b =')} ({instance.b.join(', ')})
        </p>
      </div>

      <div className="p-3 rounded border text-sm grid grid-cols-1 sm:grid-cols-3 gap-2"
           style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-content-bg-alt, #fff7ed)', color: 'var(--theme-content-text)' }}>
        <div><span className="opacity-70">σ<sub>max</sub>:</span> <span className="font-mono">{sigmaMax.toExponential(3)}</span></div>
        <div><span className="opacity-70">σ<sub>min</sub>:</span> <span className="font-mono">{sigmaMin.toExponential(3)}</span></div>
        <div><span className="opacity-70">κ<sub>2</sub>(A):</span> <span className="font-mono">{singular ? '∞' : kappa.toExponential(3)}</span></div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium" style={{ color: 'var(--theme-content-text)' }}>
          {t('Perturb b — set Δb:', 'Perturbă b — alege Δb:')}
        </p>
        <VectorInput
          length={instance.n}
          value={deltaB}
          onChange={setDeltaB}
          mode="float"
          ariaLabel="Delta b input"
        />

        <div className="text-xs font-mono mt-1" style={{ color: 'var(--theme-content-text)' }}>
          x = ({probe.x.map(v => v.toFixed(3)).join(', ')})
        </div>
        <div className="text-xs font-mono" style={{ color: 'var(--theme-content-text)' }}>
          x̃ = ({probe.xPerturbed.map(v => v.toFixed(3)).join(', ')})
        </div>
        <div className="text-xs font-mono" style={{ color: 'var(--theme-content-text)' }}>
          Δx = ({probe.deltaX.map(v => v.toFixed(3)).join(', ')})
        </div>
        <div className="text-sm" style={{ color: 'var(--theme-content-text)' }}>
          {t('Live amplification (‖Δx‖/‖x‖) ÷ (‖Δb‖/‖b‖) ≈', 'Amplificare live (‖Δx‖/‖x‖) ÷ (‖Δb‖/‖b‖) ≈')}
          {' '}<span className="font-mono">{Number.isFinite(probe.ratio) ? probe.ratio.toExponential(2) : '—'}</span>
          {probe.signFlip && (
            <span className="ml-2 px-2 py-0.5 text-xs rounded" style={{ background: '#fee2e2', color: '#b91c1c' }}>
              {t('sign flip detected', 'schimbare de semn detectată')}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <label className="text-sm flex items-center gap-2" style={{ color: 'var(--theme-content-text)' }}>
          {t('Estimated amplification factor:', 'Factor de amplificare estimat:')}
          <input
            type="number" step="0.1"
            value={factorAnswer}
            onChange={(e) => setFactorAnswer(e.target.value)}
            disabled={submitted}
            className="px-2 py-1 rounded border w-32 font-mono"
            style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-content-bg)', color: 'var(--theme-content-text)' }}
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <span className="text-sm" style={{ color: 'var(--theme-content-text)' }}>
          {t('Is A a Hilbert matrix?', 'Este A o matrice Hilbert?')}
        </span>
        <button
          disabled={submitted}
          onClick={() => setHilbertGuess(true)}
          aria-pressed={hilbertGuess === true}
          className="px-3 py-1 rounded text-sm border"
          style={{
            borderColor: hilbertGuess === true ? '#3b82f6' : 'var(--theme-border)',
            background: hilbertGuess === true ? '#3b82f6' : 'transparent',
            color: hilbertGuess === true ? '#fff' : 'var(--theme-content-text)',
          }}
        >{t('Yes', 'Da')}</button>
        <button
          disabled={submitted}
          onClick={() => setHilbertGuess(false)}
          aria-pressed={hilbertGuess === false}
          className="px-3 py-1 rounded text-sm border"
          style={{
            borderColor: hilbertGuess === false ? '#3b82f6' : 'var(--theme-border)',
            background: hilbertGuess === false ? '#3b82f6' : 'transparent',
            color: hilbertGuess === false ? '#fff' : 'var(--theme-content-text)',
          }}
        >{t('No', 'Nu')}</button>
      </div>

      <div className="flex gap-2 items-center flex-wrap">
        {!submitted ? (
          <button
            onClick={onCheck}
            disabled={hilbertGuess === null || !factorAnswer}
            className="px-4 py-1.5 rounded font-medium text-sm disabled:opacity-50"
            style={{ background: '#3b82f6', color: '#fff' }}
          >
            {t('Check', 'Verifică')}
          </button>
        ) : (
          <button onClick={onNext} className="px-4 py-1.5 rounded font-medium text-sm" style={{ background: '#3b82f6', color: '#fff' }}>
            {t('New instance', 'Instanță nouă')}
          </button>
        )}
        {submitted && (
          <span className="text-sm px-3 py-1.5 rounded"
                style={{
                  background: factorOk && hilbertOk ? '#dcfce7' : '#fee2e2',
                  color: factorOk && hilbertOk ? '#15803d' : '#b91c1c',
                }}>
            {factorOk && hilbertOk
              ? t(`Correct — family ${familyLabel}, κ ≈ ${kappa.toExponential(2)}`, `Corect — familia ${familyLabel}, κ ≈ ${kappa.toExponential(2)}`)
              : t(`See: family was ${familyLabel}, κ ≈ ${kappa.toExponential(2)}, live ratio ≈ ${Number.isFinite(probe.ratio) ? probe.ratio.toExponential(2) : '—'}`, `Vezi: familia a fost ${familyLabel}, κ ≈ ${kappa.toExponential(2)}, raport live ≈ ${Number.isFinite(probe.ratio) ? probe.ratio.toExponential(2) : '—'}`)
            }
          </span>
        )}
      </div>
    </div>
  );
}
