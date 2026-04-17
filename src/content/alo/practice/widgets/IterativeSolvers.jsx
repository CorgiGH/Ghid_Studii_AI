import React, { useMemo, useState } from 'react';
import { useApp } from '../../../../contexts/AppContext';
import { StepPlayer, MatrixDisplay } from '../../../../components/widgets-core';
import { useWidgetProgress } from '../../../../hooks/useWidgetProgress';
import { runIterativeSolvers } from '../../linalg/iterativeSolvers';

export default function IterativeSolvers({ instance, onSubmit, onGenerateInstance }) {
  const { t } = useApp();
  const [method, setMethod] = useState('jacobi');
  const [omega, setOmega] = useState(1.1);
  const [submitted, setSubmitted] = useState(false);
  const [fastestGuess, setFastestGuess] = useState(null); // 'jacobi' | 'gauss-seidel' | 'sor'
  const { submit } = useWidgetProgress('iterative-solvers', { pbLowerIsBetter: true });

  const jResult = useMemo(() => runIterativeSolvers(instance.matrix, instance.b, { method: 'jacobi' }), [instance]);
  const gResult = useMemo(() => runIterativeSolvers(instance.matrix, instance.b, { method: 'gauss-seidel' }), [instance]);
  const sResult = useMemo(() => runIterativeSolvers(instance.matrix, instance.b, { method: 'sor', omega }), [instance, omega]);

  const current =
    method === 'jacobi' ? jResult :
    method === 'gauss-seidel' ? gResult :
    sResult;

  const fastestActual = [['jacobi', jResult], ['gauss-seidel', gResult], ['sor', sResult]]
    .sort(([, a], [, b]) => a.iterations - b.iterations)[0][0];

  const onCheck = () => {
    if (submitted) return;
    setSubmitted(true);
    const feats = [];
    const predictedRight = fastestGuess && fastestGuess === fastestActual;
    if (predictedRight) feats.push('gs-beats-jacobi');
    if (Math.abs(omega - instance.optimalOmega) < 0.05) feats.push('omega-tuner');
    submit({
      correct: !!predictedRight,
      metric: current.iterations,
      feats,
    });
    onSubmit?.({
      correct: !!predictedRight,
      metric: current.iterations,
      feats,
    });
  };

  const onNext = () => {
    setSubmitted(false);
    setMethod('jacobi');
    setOmega(1.1);
    setFastestGuess(null);
    onGenerateInstance?.();
  };

  return (
    <div className="space-y-4">
      <div className="p-3 rounded border text-sm"
           style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-content-bg-alt, #f1f5f9)', color: 'var(--theme-content-text)' }}>
        <p className="font-medium mb-1">{t('Solve Ax = b:', 'Rezolvă Ax = b:')}</p>
        <div className="flex gap-4 flex-wrap">
          <div>
            <p className="text-xs opacity-70 mb-1">A</p>
            <MatrixDisplay value={instance.matrix} />
          </div>
          <div>
            <p className="text-xs opacity-70 mb-1">b</p>
            <MatrixDisplay value={instance.b.map(v => [v])} />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        {[
          { id: 'jacobi', label: 'Jacobi' },
          { id: 'gauss-seidel', label: 'Gauss–Seidel' },
          { id: 'sor', label: 'SOR' },
        ].map(opt => (
          <button
            key={opt.id}
            onClick={() => setMethod(opt.id)}
            className="px-3 py-1 rounded text-sm border"
            style={{
              borderColor: method === opt.id ? '#3b82f6' : 'var(--theme-border)',
              background: method === opt.id ? '#3b82f6' : 'transparent',
              color: method === opt.id ? '#fff' : 'var(--theme-content-text)',
            }}
          >{opt.label}</button>
        ))}
        {method === 'sor' && (
          <label className="text-sm flex items-center gap-2" style={{ color: 'var(--theme-content-text)' }}>
            ω = {omega.toFixed(2)}
            <input
              type="range" min={1} max={1.95} step={0.01}
              value={omega}
              onChange={(e) => setOmega(parseFloat(e.target.value))}
            />
          </label>
        )}
        <span className="text-xs opacity-70" style={{ color: 'var(--theme-content-text)' }}>
          {t('iterations:', 'iterații:')} {current.iterations}
          {current.converged ? '' : t(' (did not converge)', ' (nu a convers)')}
        </span>
      </div>

      <StepPlayer
        steps={current.steps}
        renderStep={(step) => (
          <div className="space-y-2">
            <p className="text-xs font-mono" style={{ color: 'var(--theme-content-text)' }}>
              x<sub>{step.k}</sub> = ({step.x.map(c => c.toFixed(4)).join(', ')})  ·  ‖rₖ‖ = {step.residualNorm.toExponential(2)}
            </p>
            <LogResidualPlot
              series={[
                { label: 'Jacobi', steps: jResult.steps, color: '#3b82f6', highlight: method === 'jacobi' },
                { label: 'GS',     steps: gResult.steps, color: '#f59e0b', highlight: method === 'gauss-seidel' },
                { label: 'SOR',    steps: sResult.steps, color: '#22c55e', highlight: method === 'sor' },
              ]}
              currentK={step.k}
            />
          </div>
        )}
        intervalMs={700}
      />

      <div className="flex flex-wrap gap-3 items-center">
        <span className="text-sm" style={{ color: 'var(--theme-content-text)' }}>
          {t('Which method converges fastest?', 'Care metodă converge cel mai rapid?')}
        </span>
        {[
          { id: 'jacobi', label: 'Jacobi' },
          { id: 'gauss-seidel', label: 'GS' },
          { id: 'sor', label: 'SOR' },
        ].map(opt => (
          <button
            key={opt.id}
            disabled={submitted}
            onClick={() => setFastestGuess(opt.id)}
            aria-pressed={fastestGuess === opt.id}
            className="px-3 py-1 rounded text-sm border"
            style={{
              borderColor: fastestGuess === opt.id ? '#3b82f6' : 'var(--theme-border)',
              background: fastestGuess === opt.id ? '#3b82f6' : 'transparent',
              color: fastestGuess === opt.id ? '#fff' : 'var(--theme-content-text)',
            }}
          >{opt.label}</button>
        ))}
      </div>

      <div className="flex gap-2 items-center">
        {!submitted ? (
          <button
            onClick={onCheck}
            disabled={!fastestGuess}
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
                  background: fastestGuess === fastestActual ? '#dcfce7' : '#fee2e2',
                  color: fastestGuess === fastestActual ? '#15803d' : '#b91c1c',
                }}>
            {fastestGuess === fastestActual
              ? t(`Correct — ω* ≈ ${instance.optimalOmega.toFixed(2)}, fastest = ${fastestActual}`, `Corect — ω* ≈ ${instance.optimalOmega.toFixed(2)}, cea mai rapidă = ${fastestActual}`)
              : t(`Off — fastest was ${fastestActual} (ω* ≈ ${instance.optimalOmega.toFixed(2)})`, `Greșit — cea mai rapidă a fost ${fastestActual} (ω* ≈ ${instance.optimalOmega.toFixed(2)})`)
            }
          </span>
        )}
      </div>
    </div>
  );
}

const LP_W = 360, LP_H = 160, LP_PAD = 30;

function LogResidualPlot({ series, currentK }) {
  // Each series: { label, steps, color, highlight }
  const allRs = series.flatMap(s => s.steps.map(st => st.residualNorm)).filter(v => v > 0 && Number.isFinite(v));
  if (allRs.length === 0) return null;
  const logMin = Math.log10(Math.min(...allRs));
  const logMax = Math.log10(Math.max(...allRs));
  const xMax = Math.max(...series.map(s => s.steps.length - 1), 1);

  const xs = (k) => LP_PAD + (k / xMax) * (LP_W - 2 * LP_PAD);
  const ys = (r) => {
    const lg = Math.log10(r > 0 ? r : 1e-16);
    return LP_H - LP_PAD - ((lg - logMin) / (logMax - logMin || 1)) * (LP_H - 2 * LP_PAD);
  };

  return (
    <svg width={LP_W} height={LP_H}
         style={{ background: 'var(--theme-content-bg-alt, #f8fafc)', border: '1px solid var(--theme-border)', borderRadius: 6 }}
         aria-label="log-scale residual plot">
      <line x1={LP_PAD} y1={LP_H - LP_PAD} x2={LP_W - LP_PAD} y2={LP_H - LP_PAD} stroke="#cbd5e1" strokeWidth={1} />
      <line x1={LP_PAD} y1={LP_PAD} x2={LP_PAD} y2={LP_H - LP_PAD} stroke="#cbd5e1" strokeWidth={1} />
      {series.map((s, si) => {
        const pts = s.steps
          .filter(st => st.residualNorm > 0 && Number.isFinite(st.residualNorm))
          .map(st => `${xs(st.k)},${ys(st.residualNorm)}`)
          .join(' ');
        return (
          <polyline key={si} points={pts}
                    fill="none" stroke={s.color}
                    strokeWidth={s.highlight ? 2.5 : 1}
                    opacity={s.highlight ? 1 : 0.45} />
        );
      })}
      {series.map((s, si) => {
        const st = s.steps[currentK];
        if (!st || !(st.residualNorm > 0)) return null;
        return s.highlight ? <circle key={si} cx={xs(st.k)} cy={ys(st.residualNorm)} r={4} fill={s.color} /> : null;
      })}
      <text x={LP_PAD + 4} y={LP_PAD - 6} fontSize={10} fill="#64748b">log‖rₖ‖</text>
      <text x={LP_W - LP_PAD - 10} y={LP_H - LP_PAD + 14} fontSize={10} fill="#64748b">k</text>
      {/* Legend */}
      {series.map((s, si) => (
        <g key={`legend-${si}`} transform={`translate(${LP_PAD + 10 + si * 70}, ${LP_PAD + 6})`}>
          <line x1={0} y1={0} x2={12} y2={0} stroke={s.color} strokeWidth={2} />
          <text x={16} y={3} fontSize={10} fill="#64748b">{s.label}</text>
        </g>
      ))}
    </svg>
  );
}
