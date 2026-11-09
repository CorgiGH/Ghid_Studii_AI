import React, { useMemo, useState } from 'react';
import { useApp } from '../../../../../contexts/AppContext';
import { useStepper } from '../../kit.js';
import { VizFrame } from '../../ui.jsx';
import { mlLikelihood } from '../../logic/ml/likelihood.js';
import { PickBar } from './mlParts.jsx';
import './ml-common.css';
import './ml-widgets.css';

const W = 320;
const H = 200;
const L = 64;
const R = 14;
const T = 14;
const B = 32;
const X = (v) => L + v * (W - L - R);
const Y = (v) => T + (1 - v) * (H - T - B);

// One frame as a pure view of the logic state (the tests render it on its own).
export function LikelihoodView({ model, frame }) {
  const { t } = useApp();
  const say = (f) => t(f.text.en, f.text.ro);
  const key = frame.fn === 'l' ? 'yl' : 'y';
  // ln L runs to minus infinity at the ends: draw the part above the floor of the axis plus one point on the floor at each
  // end (the curve visibly goes down off the chart), never a flat run along the floor
  const drawn = frame.curve
    ? (frame.fn === 'l' ? frame.curve.filter((p, i, a) => p.yl > 0 || a[i - 1]?.yl > 0 || a[i + 1]?.yl > 0) : frame.curve)
    : null;
  const line = drawn ? drawn.map((p) => `${X(p.theta).toFixed(1)},${Y(p[key]).toFixed(1)}`).join(' ') : '';
  const shade = frame.shade && frame.curve ? `M${X(0)},${Y(0)} L${line.split(' ').join(' L')} L${X(1)},${Y(0)} Z` : '';
  const markOf = (id) => frame.marks.find((m) => m.id === id);
  const line2 = frame.curve2 ? frame.curve2.map((p) => `${X(p.theta).toFixed(1)},${Y(p.y).toFixed(1)}`).join(' ') : '';
  return (
    <div className="mlv-stage">
      <svg className="mlv-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t('The likelihood of the coin data against θ', 'Verosimilitatea datelor monedei în funcție de θ')}>
        {model.ticks.map((tk) => (
          <text key={tk.canon} className="mlv-tick" x={X(tk.value)} y={H - B + 15} textAnchor="middle">{say(tk)}</text>
        ))}
        <line className="mlv-axis" x1={L} x2={W - R} y1={Y(0)} y2={Y(0)} />
        <line className="mlv-axis" x1={L} x2={L} y1={Y(1)} y2={Y(0)} />
        <text className="mlv-axisname" x={W - R} y={H - 3} textAnchor="end">θ</text>
        {frame.axis && (
          <>
            <line className="mlv-grid" x1={L} x2={W - R} y1={Y(1)} y2={Y(1)} />
            <text className="mlv-tick" x={L - 5} y={Y(1) + 3} textAnchor="end">{say(frame.axis.top)}</text>
            <text className="mlv-tick" x={L - 5} y={Y(0) + 3} textAnchor="end">{say(frame.axis.bottom)}</text>
          </>
        )}
        {shade && <path className="mlv-area" d={shade} data-value={markOf('area')?.fact.canon} />}
        {line && <polyline className="mlv-line mlv-c-entropy" data-curve={frame.fn} points={line} />}
        {line2 && <polyline className="mlv-line mlv-c-gini" data-curve="posterior" points={line2} />}
        {line2 && frame.peak2 !== undefined && (
          <>
            <line className="mlv-marker" x1={X(frame.peak2)} x2={X(frame.peak2)} y1={Y(1)} y2={Y(0)} />
            <circle className="mlv-dotmark mlv-c-gini" cx={X(frame.peak2)} cy={Y(1)} r="5" data-mark-at="map" data-value={markOf('map')?.fact.canon} />
          </>
        )}
        {frame.curve && frame.peak !== undefined && (
          <>
            <line className="mlv-marker" x1={X(frame.peak)} x2={X(frame.peak)} y1={Y(1)} y2={Y(0)} />
            <circle className="mlv-dotmark mlv-c-gini" cx={X(frame.peak)} cy={Y(1)} r="5" data-mark-at="argmax" data-value={markOf('argmax')?.fact.canon} />
          </>
        )}
        {frame.points.map((p) => (
          <circle key={p.id} className="mlv-dotmark" cx={X(p.theta)} cy={Y(p.y)} r="4.5" data-theta={p.theta} />
        ))}
      </svg>
      <ul className="mlv-readout" aria-label={t('Values on the drawing', 'Valorile din desen')}>
        {frame.marks.map((m) => (
          <li key={m.id} data-mark={m.id} data-value={m.fact.canon}>
            <span className="mlv-name">{t(m.label.en, m.label.ro)}</span>
            <b>{say(m.fact)}</b>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function MlLikelihood({ props, predict }) {
  const { t } = useApp();
  const model = useMemo(() => mlLikelihood(props), [props]);
  const hasPicks = !!predict && model.frames.some((f) => f.pick);
  const s = useStepper(model.n, { predict, own: hasPicks });
  const [picks, setPicks] = useState({});
  const frame = model.frames[s.step];
  const spec = predict && frame.pick ? { items: [frame.pick] } : null;
  const done = frame.pick ? picks[frame.pick.key] : undefined;
  const right = done !== undefined && done === frame.pick.right;
  const answered = !spec || right;
  const blocked = (to) => Array.from({ length: to }, (_, i) => i).some((i) => model.frames[i].pick && predict && picks[model.frames[i].pick.key] !== model.frames[i].pick.right);
  const stepper = {
    ...s,
    canNext: s.canNext && answered,
    goto: (to) => { if (to <= s.step || !blocked(to)) s.goto(to); },
    reset: () => { setPicks({}); s.reset(); },
  };
  const onPick = (key, id) => { setPicks((p) => ({ ...p, [key]: id })); s.settle(); };
  const L = (x) => (x !== null && typeof x === 'object' ? t(x.en, x.ro) : String(x));
  return (
    <VizFrame widget="ml-likelihood" stepper={stepper} caption={t(frame.caption.en, frame.caption.ro)} label={t('The likelihood curve of coin data', 'Curba verosimilității datelor unei monede')}>
      <LikelihoodView model={model} frame={frame} />
      <PickBar spec={spec} picks={picks} onPick={onPick} t={t} L={L} />
      {done !== undefined && (
        <p className={`mlv-fb ${right ? 'ok' : 'no'}`} role="status" data-pick={right ? 'right' : 'wrong'}>
          {right ? t('Right. ', 'Corect. ') : t('Not quite: look again at the question. ', 'Nu chiar: citește încă o dată întrebarea. ')}{right ? t(frame.pick.why.en, frame.pick.why.ro) : ''}
        </p>
      )}
    </VizFrame>
  );
}
