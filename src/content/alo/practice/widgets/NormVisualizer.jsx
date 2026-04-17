import React, { useRef, useState } from 'react';
import { useApp } from '../../../../contexts/AppContext';
import { useWidgetProgress } from '../../../../hooks/useWidgetProgress';

const SIZE = 320;
const RANGE = 1.6; // coordinate range [-1.6, 1.6]

function worldToScreen(x, y) {
  const px = (x + RANGE) / (2 * RANGE) * SIZE;
  const py = SIZE - (y + RANGE) / (2 * RANGE) * SIZE;
  return [px, py];
}
function screenToWorld(px, py) {
  const x = (px / SIZE) * 2 * RANGE - RANGE;
  const y = (SIZE - py) / SIZE * 2 * RANGE - RANGE;
  return [x, y];
}

export default function NormVisualizer({ instance, onSubmit, onGenerateInstance }) {
  const { t } = useApp();
  const [pt, setPt] = useState([0.5, 0.5]);
  const [submitted, setSubmitted] = useState(false);
  const svgRef = useRef(null);
  const { submit } = useWidgetProgress('norm-visualizer', { pbLowerIsBetter: true });

  const [x, y] = pt;
  const l1 = Math.abs(x) + Math.abs(y);
  const l2 = Math.hypot(x, y);
  const linf = Math.max(Math.abs(x), Math.abs(y));
  const dist = instance.optimalDistance(x, y);
  const isCorrect = instance.test(x, y);

  const onMouseDown = (e) => {
    setSubmitted(false);
    e.preventDefault();
    const onMove = (ev) => {
      const rect = svgRef.current.getBoundingClientRect();
      const px = ev.clientX - rect.left;
      const py = ev.clientY - rect.top;
      const [wx, wy] = screenToWorld(px, py);
      setPt([Math.max(-RANGE, Math.min(RANGE, wx)), Math.max(-RANGE, Math.min(RANGE, wy))]);
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    onMove(e);
  };

  const onCheck = () => {
    setSubmitted(true);
    const feats = [];
    const corners = [[1,0],[-1,0],[0,1],[0,-1]];
    if (corners.some(([cx, cy]) => Math.hypot(x - cx, y - cy) < 0.01)) feats.push('corner-shot');
    if (Math.abs(l1 - 1) < 0.02 && Math.abs(l2 - 1) < 0.02 && Math.abs(linf - 1) < 0.02) feats.push('triple-tangent');

    submit({ correct: isCorrect, metric: dist, feats });
    onSubmit?.({ correct: isCorrect, metric: dist, feats });
  };

  const onNext = () => {
    setSubmitted(false);
    setPt([0.5, 0.5]);
    onGenerateInstance?.();
  };

  const [ptSx, ptSy] = worldToScreen(x, y);

  const l1Path = (() => {
    const pts = [[1,0],[0,1],[-1,0],[0,-1]].map(([a,b]) => worldToScreen(a,b));
    return `M ${pts[0].join(' ')} L ${pts[1].join(' ')} L ${pts[2].join(' ')} L ${pts[3].join(' ')} Z`;
  })();
  const [cx, cy] = worldToScreen(0, 0);
  const r = SIZE / (2 * RANGE);
  const linfRect = (() => {
    const [sx1, sy1] = worldToScreen(-1, 1);
    return { x: sx1, y: sy1, w: 2 * r, h: 2 * r };
  })();

  return (
    <div className="flex gap-6 flex-wrap">
      <div>
        <svg
          ref={svgRef}
          width={SIZE}
          height={SIZE}
          onMouseDown={onMouseDown}
          style={{ cursor: 'crosshair', background: 'var(--theme-content-bg-alt, #f8fafc)', border: '1px solid var(--theme-border)', borderRadius: 8 }}
          aria-label={t('Norm visualizer', 'Vizualizator norme')}
        >
          <line x1={0} y1={SIZE/2} x2={SIZE} y2={SIZE/2} stroke="#cbd5e1" strokeWidth={1} />
          <line x1={SIZE/2} y1={0} x2={SIZE/2} y2={SIZE} stroke="#cbd5e1" strokeWidth={1} />
          <path d={l1Path} fill="none" stroke="#f59e0b" strokeWidth={1.5} />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#3b82f6" strokeWidth={1.5} />
          <rect {...linfRect} fill="none" stroke="#22c55e" strokeWidth={1.5} />
          <circle cx={ptSx} cy={ptSy} r={8} fill={isCorrect ? '#22c55e' : '#ef4444'} stroke="#fff" strokeWidth={2} />
        </svg>
        <div className="flex gap-3 text-xs mt-2" style={{ color: 'var(--theme-content-text)' }}>
          <span><span style={{ color: '#f59e0b' }}>━</span> ‖·‖₁</span>
          <span><span style={{ color: '#3b82f6' }}>━</span> ‖·‖₂</span>
          <span><span style={{ color: '#22c55e' }}>━</span> ‖·‖∞</span>
        </div>
      </div>

      <div className="flex-1 min-w-[240px] space-y-3">
        <div className="p-3 rounded border"
             style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-content-bg-alt, #f1f5f9)', color: 'var(--theme-content-text)' }}>
          <p className="font-medium mb-1">{t('Target:', 'Țintă:')}</p>
          <p className="text-sm">{t(instance.prompt.en, instance.prompt.ro)}</p>
        </div>
        <dl className="text-sm space-y-1" style={{ color: 'var(--theme-content-text)' }}>
          <div className="flex justify-between"><dt>x, y</dt><dd className="font-mono">({x.toFixed(3)}, {y.toFixed(3)})</dd></div>
          <div className="flex justify-between"><dt>‖·‖₁</dt><dd className="font-mono">{l1.toFixed(3)}</dd></div>
          <div className="flex justify-between"><dt>‖·‖₂</dt><dd className="font-mono">{l2.toFixed(3)}</dd></div>
          <div className="flex justify-between"><dt>‖·‖∞</dt><dd className="font-mono">{linf.toFixed(3)}</dd></div>
          <div className="flex justify-between"><dt>{t('distance from target', 'distanță de țintă')}</dt><dd className="font-mono">{dist.toFixed(3)}</dd></div>
        </dl>
        <div className="flex gap-2">
          {!submitted ? (
            <button onClick={onCheck} className="px-4 py-1.5 rounded font-medium text-sm" style={{ background: '#3b82f6', color: '#fff' }}>
              {t('Check (Enter)', 'Verifică (Enter)')}
            </button>
          ) : (
            <button onClick={onNext} className="px-4 py-1.5 rounded font-medium text-sm" style={{ background: '#3b82f6', color: '#fff' }}>
              {t('New target', 'Țintă nouă')}
            </button>
          )}
          {submitted && (
            <span className="px-3 py-1.5 text-sm rounded"
                  style={{ background: isCorrect ? '#dcfce7' : '#fee2e2', color: isCorrect ? '#15803d' : '#b91c1c' }}>
              {isCorrect ? t('Correct!', 'Corect!') : t('Not yet', 'Încă nu')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
