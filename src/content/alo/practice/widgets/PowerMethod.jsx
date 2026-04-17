import React, { useMemo, useState } from 'react';
import { useApp } from '../../../../contexts/AppContext';
import { StepPlayer, MatrixDisplay } from '../../../../components/widgets-core';
import { useWidgetProgress } from '../../../../hooks/useWidgetProgress';
import { runPowerMethod } from '../../linalg/powerMethod';

export default function PowerMethod({ instance, onSubmit, onGenerateInstance }) {
  const { t } = useApp();
  const [submitted, setSubmitted] = useState(false);
  const [answer, setAnswer] = useState('');
  const [gapGuess, setGapGuess] = useState('');
  const { submit } = useWidgetProgress('power-method', { pbLowerIsBetter: true });

  const { steps, lambda: computedLambda, iterations, converged } = useMemo(
    () => runPowerMethod(instance.matrix, {
      maxIter: 30,
      tol: 1e-6,
      truthEigenvector: instance.truthVec,
    }),
    [instance],
  );

  const onCheck = () => {
    if (submitted) return;
    setSubmitted(true);
    const parsed = parseFloat(answer);
    const lambdaCorrect = Number.isFinite(parsed) && Math.abs(parsed - instance.truthLambda) < 0.05;
    const feats = [];
    if (lambdaCorrect && iterations <= 5) feats.push('fast-converge');
    if (gapGuess) {
      const parsedGap = parseFloat(gapGuess);
      if (Number.isFinite(parsedGap) && Math.abs(parsedGap - instance.gapRatio) < 0.15) {
        feats.push('gap-spotter');
      }
    }
    submit({ correct: lambdaCorrect, metric: iterations, feats });
    onSubmit?.({ correct: lambdaCorrect, metric: iterations, feats });
  };

  const onNext = () => {
    setSubmitted(false);
    setAnswer('');
    setGapGuess('');
    onGenerateInstance?.();
  };

  return (
    <div className="space-y-4">
      <div className="p-3 rounded border text-sm"
           style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-content-bg-alt, #f1f5f9)', color: 'var(--theme-content-text)' }}>
        <p className="font-medium mb-1">{t('Find the dominant eigenvalue of A:', 'Găsește valoarea proprie dominantă a lui A:')}</p>
        <MatrixDisplay value={instance.matrix} />
      </div>

      <StepPlayer
        steps={steps}
        renderStep={(step) => (
          <div className="space-y-2">
            <p className="text-xs font-mono" style={{ color: 'var(--theme-content-text)' }}>
              x<sub>{step.k}</sub> = ({step.x.map(c => c.toFixed(3)).join(', ')})
              {step.lambdaRayleigh != null && !Number.isNaN(step.lambdaRayleigh) && (
                <>  ·  λ ≈ {step.lambdaRayleigh.toFixed(5)}</>
              )}
            </p>
            <ConvergencePlot steps={steps} currentK={step.k} />
          </div>
        )}
        intervalMs={900}
      />

      <div className="flex flex-wrap gap-3 items-center">
        <label className="text-sm flex items-center gap-2" style={{ color: 'var(--theme-content-text)' }}>
          {t('Your λ₁:', 'λ₁ al tău:')}
          <input
            type="number" step="0.01"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={submitted}
            className="px-2 py-1 rounded border w-28 font-mono"
            style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-content-bg)', color: 'var(--theme-content-text)' }}
          />
        </label>
        <label className="text-sm flex items-center gap-2" style={{ color: 'var(--theme-content-text)' }}>
          {t('Gap ratio |λ₁/λ₂| (optional):', 'Raport gap |λ₁/λ₂| (opțional):')}
          <input
            type="number" step="0.01"
            value={gapGuess}
            onChange={(e) => setGapGuess(e.target.value)}
            disabled={submitted}
            className="px-2 py-1 rounded border w-24 font-mono"
            style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-content-bg)', color: 'var(--theme-content-text)' }}
          />
        </label>
      </div>

      <div className="flex gap-2 items-center">
        {!submitted ? (
          <button onClick={onCheck} className="px-4 py-1.5 rounded font-medium text-sm" style={{ background: '#3b82f6', color: '#fff' }}>
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
                  background: Math.abs(parseFloat(answer) - instance.truthLambda) < 0.05 ? '#dcfce7' : '#fee2e2',
                  color: Math.abs(parseFloat(answer) - instance.truthLambda) < 0.05 ? '#15803d' : '#b91c1c',
                }}>
            {Math.abs(parseFloat(answer) - instance.truthLambda) < 0.05
              ? t(`Correct — truth λ₁ = ${instance.truthLambda.toFixed(4)}, converged in ${iterations} iter`, `Corect — adevărat λ₁ = ${instance.truthLambda.toFixed(4)}, convergență în ${iterations} iter`)
              : t(`Off — truth λ₁ = ${instance.truthLambda.toFixed(4)} (computed ${computedLambda.toFixed(4)})`, `Greșit — adevărat λ₁ = ${instance.truthLambda.toFixed(4)} (calculat ${computedLambda.toFixed(4)})`)
            }
          </span>
        )}
        {!converged && submitted && (
          <span className="text-xs opacity-75" style={{ color: 'var(--theme-content-text)' }}>
            {t('(did not reach tol in 30 iter)', '(nu s-a atins toleranța în 30 iter)')}
          </span>
        )}
      </div>
    </div>
  );
}

const PLOT_W = 320, PLOT_H = 140, PAD = 28;

function ConvergencePlot({ steps, currentK }) {
  // Plot λₖ vs k — simple SVG line chart, auto-scale Y.
  const ys = steps.map(s => s.lambdaRayleigh).filter(v => Number.isFinite(v));
  if (ys.length === 0) return null;
  const yMin = Math.min(...ys), yMax = Math.max(...ys);
  const yPad = (yMax - yMin) * 0.1 || 0.5;
  const yLo = yMin - yPad, yHi = yMax + yPad;
  const xMax = Math.max(steps.length - 1, 1);

  const xs = (k) => PAD + (k / xMax) * (PLOT_W - 2 * PAD);
  const ysc = (v) => PLOT_H - PAD - ((v - yLo) / (yHi - yLo)) * (PLOT_H - 2 * PAD);

  const pts = steps
    .filter(s => Number.isFinite(s.lambdaRayleigh))
    .map(s => `${xs(s.k)},${ysc(s.lambdaRayleigh)}`)
    .join(' ');
  const currentStep = steps.find(s => s.k === currentK);

  return (
    <svg width={PLOT_W} height={PLOT_H}
         style={{ background: 'var(--theme-content-bg-alt, #f8fafc)', border: '1px solid var(--theme-border)', borderRadius: 6 }}
         aria-label="Rayleigh quotient convergence">
      <line x1={PAD} y1={PLOT_H - PAD} x2={PLOT_W - PAD} y2={PLOT_H - PAD} stroke="#cbd5e1" strokeWidth={1} />
      <line x1={PAD} y1={PAD} x2={PAD} y2={PLOT_H - PAD} stroke="#cbd5e1" strokeWidth={1} />
      <polyline points={pts} fill="none" stroke="#3b82f6" strokeWidth={2} />
      {currentStep && Number.isFinite(currentStep.lambdaRayleigh) && (
        <circle cx={xs(currentStep.k)} cy={ysc(currentStep.lambdaRayleigh)} r={4} fill="#22c55e" />
      )}
      <text x={PAD + 4} y={PAD - 6} fontSize={10} fill="#64748b">λ</text>
      <text x={PLOT_W - PAD - 10} y={PLOT_H - PAD + 14} fontSize={10} fill="#64748b">k</text>
    </svg>
  );
}
