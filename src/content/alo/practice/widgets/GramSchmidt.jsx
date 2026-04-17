import React, { useMemo, useRef, useState } from 'react';
import { useApp } from '../../../../contexts/AppContext';
import { StepPlayer } from '../../../../components/widgets-core';
import { useWidgetProgress } from '../../../../hooks/useWidgetProgress';
import { runGramSchmidt } from '../../linalg/gramSchmidt';

const SVG_SIZE = 320;
const RANGE = 5;

function w2s(x, y) {
  const px = (x + RANGE) / (2 * RANGE) * SVG_SIZE;
  const py = SVG_SIZE - (y + RANGE) / (2 * RANGE) * SVG_SIZE;
  return [px, py];
}

export default function GramSchmidt({ instance, onSubmit, onGenerateInstance }) {
  const { t } = useApp();
  const [submitted, setSubmitted] = useState(false);
  const [flaggedDependent, setFlaggedDependent] = useState(false);
  const startAt = useRef(Date.now());
  const opCount = useRef(0);
  const { submit } = useWidgetProgress('gram-schmidt', { pbLowerIsBetter: true });

  const { steps, orthonormal, dependent } = useMemo(
    () => runGramSchmidt(instance.vectors),
    [instance],
  );

  const onCheck = () => {
    if (submitted) return;
    setSubmitted(true);
    const correct = flaggedDependent === dependent;
    const feats = [];
    if (correct && dependent && flaggedDependent) feats.push('parallel-spotter');
    if (correct && !dependent) {
      const cleanNorm = orthonormal.length > 0 && orthonormal.every(u => Math.abs(Math.hypot(...u) - 1) < 1e-9);
      if (cleanNorm) feats.push('clean-norm');
    }
    const metric = opCount.current;
    submit({ correct, metric: metric || steps.length, feats });
    onSubmit?.({ correct, metric: metric || steps.length, feats });
  };

  const onNext = () => {
    setSubmitted(false);
    setFlaggedDependent(false);
    startAt.current = Date.now();
    opCount.current = 0;
    onGenerateInstance?.();
  };

  return (
    <div className="space-y-4">
      <div className="p-3 rounded border text-sm"
           style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-content-bg-alt, #f1f5f9)', color: 'var(--theme-content-text)' }}>
        <p className="font-medium mb-1">
          {t('Vectors in', 'Vectorii din')} ℝ<sup>{instance.dim}</sup>:
        </p>
        <ul className="font-mono text-sm space-y-0.5">
          {instance.vectors.map((v, i) => (
            <li key={i}>v<sub>{i+1}</sub> = ({v.join(', ')})</li>
          ))}
        </ul>
      </div>

      <StepPlayer
        steps={steps}
        renderStep={(step) => <GsStep step={step} dim={instance.dim} t={t} />}
        intervalMs={1400}
      />

      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm" style={{ color: 'var(--theme-content-text)' }}>
          {t('Are these vectors linearly DEPENDENT?', 'Sunt acești vectori liniar DEPENDENȚI?')}
        </span>
        <button
          disabled={submitted}
          onClick={() => setFlaggedDependent(true)}
          aria-pressed={flaggedDependent === true}
          className="px-3 py-1 rounded text-sm border"
          style={{
            borderColor: flaggedDependent === true ? '#3b82f6' : 'var(--theme-border)',
            background: flaggedDependent === true ? '#3b82f6' : 'transparent',
            color: flaggedDependent === true ? '#fff' : 'var(--theme-content-text)',
          }}
        >{t('Yes', 'Da')}</button>
        <button
          disabled={submitted}
          onClick={() => setFlaggedDependent(false)}
          aria-pressed={flaggedDependent === false}
          className="px-3 py-1 rounded text-sm border"
          style={{
            borderColor: flaggedDependent === false && submitted ? '#3b82f6' : 'var(--theme-border)',
            background: flaggedDependent === false && submitted ? '#3b82f6' : 'transparent',
            color: flaggedDependent === false && submitted ? '#fff' : 'var(--theme-content-text)',
          }}
        >{t('No', 'Nu')}</button>
      </div>

      <div className="flex gap-2 items-center">
        {!submitted ? (
          <button onClick={onCheck} className="px-4 py-1.5 rounded font-medium text-sm" style={{ background: '#3b82f6', color: '#fff' }}>
            {t('Check (Enter)', 'Verifică (Enter)')}
          </button>
        ) : (
          <button onClick={onNext} className="px-4 py-1.5 rounded font-medium text-sm" style={{ background: '#3b82f6', color: '#fff' }}>
            {t('New instance', 'Instanță nouă')}
          </button>
        )}
        {submitted && (
          <span className="px-3 py-1.5 text-sm rounded"
                style={{
                  background: (flaggedDependent === dependent) ? '#dcfce7' : '#fee2e2',
                  color: (flaggedDependent === dependent) ? '#15803d' : '#b91c1c',
                }}>
            {(flaggedDependent === dependent) ? t('Correct!', 'Corect!') : t('Wrong — see steps for why', 'Greșit — vezi pașii pentru motiv')}
          </span>
        )}
      </div>
    </div>
  );
}

function GsStep({ step, dim, t }) {
  if (dim !== 2) {
    return <GsStepText step={step} t={t} />;
  }
  return (
    <div className="flex gap-4 flex-wrap items-start">
      <GsSvg step={step} />
      <div className="flex-1 min-w-[200px]"><GsStepText step={step} t={t} /></div>
    </div>
  );
}

function GsSvg({ step }) {
  const arrows = [];
  if (step.type === 'initial') {
    step.inputs.forEach((v, i) => arrows.push({ v, color: '#94a3b8', label: `v${i+1}`, dashed: false }));
  } else if (step.type === 'project') {
    arrows.push({ v: step.v, color: '#94a3b8', label: `v${step.i+1}`, dashed: false });
    step.u.forEach((u, j) => arrows.push({ v: u, color: '#3b82f6', label: `u${j+1}`, dashed: false }));
    step.projections.forEach((p) => arrows.push({ v: p.proj, color: '#f59e0b', label: `proj_{u${p.ujIndex+1}}(v${step.i+1})`, dashed: true }));
    arrows.push({ v: step.w_after, color: '#22c55e', label: `w${step.i+1}`, dashed: false });
  } else if (step.type === 'normalize') {
    step.u.forEach((u, j) => arrows.push({ v: u, color: '#3b82f6', label: `u${j+1}`, dashed: false }));
    arrows.push({ v: step.w, color: '#22c55e', label: `w${step.i+1}`, dashed: true });
  } else if (step.type === 'dependent') {
    arrows.push({ v: step.w, color: '#ef4444', label: `w${step.i+1} ≈ 0`, dashed: false });
  } else if (step.type === 'complete') {
    step.u.forEach((u, j) => arrows.push({ v: u, color: '#3b82f6', label: `u${j+1}`, dashed: false }));
  }

  const [ox, oy] = w2s(0, 0);
  return (
    <svg width={SVG_SIZE} height={SVG_SIZE}
         style={{ background: 'var(--theme-content-bg-alt, #f8fafc)', border: '1px solid var(--theme-border)', borderRadius: 8 }}
         aria-label="Gram-Schmidt visualization">
      <defs>
        <marker id="gs-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
        </marker>
      </defs>
      <line x1={0} y1={oy} x2={SVG_SIZE} y2={oy} stroke="#cbd5e1" strokeWidth={1} />
      <line x1={ox} y1={0} x2={ox} y2={SVG_SIZE} stroke="#cbd5e1" strokeWidth={1} />
      {arrows.map((a, idx) => {
        const [vx, vy] = a.v.length >= 2 ? [a.v[0], a.v[1]] : [a.v[0], 0];
        const [ex, ey] = w2s(vx, vy);
        return (
          <g key={idx} style={{ color: a.color }}>
            <line x1={ox} y1={oy} x2={ex} y2={ey} stroke={a.color} strokeWidth={2}
                  strokeDasharray={a.dashed ? '4 3' : 'none'} markerEnd="url(#gs-arrow)" />
            <text x={ex + 4} y={ey - 4} fontSize={10} fill={a.color}>{a.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

function GsStepText({ step, t }) {
  if (step.type === 'initial') {
    return <p className="text-sm" style={{ color: 'var(--theme-content-text)' }}>{t('Inputs:', 'Intrări:')} {step.inputs.map((v, i) => `v${i+1}=(${v.join(',')})`).join(' · ')}</p>;
  }
  if (step.type === 'project') {
    return (
      <div className="text-sm space-y-1" style={{ color: 'var(--theme-content-text)' }}>
        <p>{t('Projecting v', 'Proiectăm v')}<sub>{step.i+1}</sub>:</p>
        <ul className="font-mono text-xs space-y-0.5">
          {step.projections.map((p, j) => (
            <li key={j}>⟨v{step.i+1}, u{p.ujIndex+1}⟩ = {p.dot.toFixed(3)}, {t('proj', 'proj')} = ({p.proj.map(c => c.toFixed(3)).join(', ')})</li>
          ))}
          <li>w<sub>{step.i+1}</sub> = ({step.w_after.map(c => c.toFixed(3)).join(', ')})</li>
        </ul>
      </div>
    );
  }
  if (step.type === 'normalize') {
    return (
      <p className="text-sm font-mono" style={{ color: 'var(--theme-content-text)' }}>
        ‖w<sub>{step.i+1}</sub>‖ = {step.norm.toFixed(3)} → u<sub>{step.i+1}</sub> = ({step.ui.map(c => c.toFixed(3)).join(', ')})
      </p>
    );
  }
  if (step.type === 'dependent') {
    return (
      <p className="text-sm" style={{ color: '#b91c1c' }}>
        ‖w<sub>{step.i+1}</sub>‖ = {step.norm.toExponential(2)} ≈ 0 — {t('linearly dependent', 'liniar dependenți')}
      </p>
    );
  }
  if (step.type === 'complete') {
    return (
      <p className="text-sm" style={{ color: 'var(--theme-content-text)' }}>
        {t('Orthonormal basis:', 'Baza ortonormată:')} {step.u.map((u, j) => `u${j+1}=(${u.map(c => c.toFixed(3)).join(',')})`).join(' · ')}
      </p>
    );
  }
  return null;
}
