import React, { useMemo, useState } from 'react';
import { useApp } from '../../../../../contexts/AppContext';
import { useStepper } from '../../kit.js';
import { VizFrame } from '../../ui.jsx';
import { classMark, guessNote, mlThreshold, plotScale, testLabel } from '../../logic/ml/threshold.js';
import { fmt } from '../../logic/ml/tree-grow.js';
import { Counts, Legend, Shape } from './Parts.jsx';
import './ml-w4.css';

function Plot({ W, frame, t }) {
  const plane = W.plane;
  const S = useMemo(() => plotScale(W.points, plane), [W, plane]);
  const { w, h, pad } = S;
  const ax = plane ? W.attrs[0] : W.attrs[0];
  const ay = plane ? W.attrs[1] : null;
  const seg = (b) => {
    const horizontal = plane && b.attr === ay;
    const [x0, x1] = [b.region.x[0], b.region.x[1]];
    const [y0, y1] = [b.region.y[0], b.region.y[1]];
    if (!plane) return { x1: S.X(b.th), x2: S.X(b.th), y1: h / 2 - 34, y2: h / 2 + 22 };
    if (horizontal) return { x1: S.X(x0 === -Infinity ? S.domainX[0] : x0), x2: S.X(x1 === Infinity ? S.domainX[1] : x1), y1: S.Y(b.th), y2: S.Y(b.th) };
    return { x1: S.X(b.th), x2: S.X(b.th), y1: S.Y(y0 === -Infinity ? S.domainY[0] : y0), y2: S.Y(y1 === Infinity ? S.domainY[1] : y1) };
  };
  const showLabels = !plane && W.points.length <= 9;
  // points with the same x stack upwards on the axis
  const stack = {};
  const pos = W.points.map((p) => {
    const k = plane ? 0 : (stack[p.x] = (stack[p.x] ?? -1) + 1);
    return { p, cx: S.X(p.x), cy: plane ? S.Y(p.y) : h / 2 - k * 15 };
  });
  const lines = frame.kind === 'setup'
    ? frame.cands.map((c) => ({ attr: c.attr, th: c.th, region: { x: [-Infinity, Infinity], y: [-Infinity, Infinity] }, cand: true }))
    : frame.lines;
  const zones = frame.kind === 'zones' ? W.leaves : [];
  const zoneRect = (l) => {
    const x0 = S.X(l.region.x[0] === -Infinity ? S.domainX[0] : l.region.x[0]);
    const x1 = S.X(l.region.x[1] === Infinity ? S.domainX[1] : l.region.x[1]);
    return plane
      ? { x: x0, width: x1 - x0, y: S.Y(l.region.y[1] === Infinity ? S.domainY[1] : l.region.y[1]), height: S.Y(l.region.y[0] === -Infinity ? S.domainY[0] : l.region.y[0]) - S.Y(l.region.y[1] === Infinity ? S.domainY[1] : l.region.y[1]) }
      : { x: x0, width: x1 - x0, y: h / 2 - 38, height: 66 };
  };
  const reg = frame.kind === 'node' && frame.region ? zoneRect({ region: frame.region }) : null;
  return (
    <svg className="mlw4-plot" viewBox={`0 0 ${w} ${h}`} role="img"
      aria-label={plane ? t(`Points in the plane of ${ax} and ${ay}`, `Puncte în planul ${ax}, ${ay}`) : t(`Points on the ${ax} axis`, `Puncte pe axa ${ax}`)}>
      {plane && <rect x={pad} y={pad} width={w - 2 * pad} height={h - 2 * pad} className="mlw4-frame" />}
      {zones.map((l, k) => {
        const m = classMark(W.classes, l.cls);
        return <rect key={k} {...zoneRect(l)} style={{ fill: `color-mix(in srgb, ${m.colour} 16%, transparent)` }} data-mark="zone" data-value={l.label} />;
      })}
      {reg && <rect {...reg} className="mlw4-region" />}
      {!plane && <line x1={pad} x2={w - pad} y1={h / 2} y2={h / 2} className="mlw4-axis" />}
      {lines.map((b, k) => {
        const s = seg(b);
        const last = frame.kind === 'node' && b.node === frame.id;
        return (
          <g key={k}>
            <line {...s} className={`mlw4-cut${b.cand ? ' cand' : ''}`} data-mark={b.cand ? 'candidate' : 'boundary'} data-value={fmt(b.th)} data-attr={b.attr} />
            {(!plane || last || b.cand) && <text x={s.x1 + (plane && b.attr === ay ? 4 : 0)} y={plane ? (b.attr === ay ? s.y1 - 4 : s.y1 - 5) : s.y1 - 5} textAnchor={plane && b.attr === ay ? 'start' : 'middle'} className={last ? 'on' : ''}>{plane ? `${b.attr}≤${fmt(b.th)}` : fmt(b.th)}</text>}
          </g>
        );
      })}
      {frame.kind === 'contrast' && (
        <g>
          <line x1={S.X(frame.trial.th)} x2={S.X(frame.trial.th)} y1={h / 2 - 34} y2={h / 2 + 22} className="mlw4-cut trial" data-mark="trial" data-value={fmt(frame.trial.th)} />
          <text x={S.X(frame.trial.th)} y={h / 2 - 39} textAnchor="middle">{fmt(frame.trial.th)}</text>
        </g>
      )}
      {pos.map(({ p, cx, cy }) => {
        const m = classMark(W.classes, p.cls);
        return <Shape key={p.i} shape={m.shape} cx={cx} cy={cy} r={plane ? 6.5 : 7} fill={m.colour} data-mark="point" data-value={plane ? `${fmt(p.x)} ${fmt(p.y)}` : fmt(p.x)} data-label={String(p.label)} />;
      })}
      {showLabels && pos.filter(({ p }, k, arr) => arr.findIndex((q) => q.p.x === p.x) === k).map(({ p, cx }) => (
        <text key={p.i} x={cx} y={h / 2 + 38} textAnchor="middle">{fmt(p.x)}</text>
      ))}
      {plane && <text x={w - pad} y={h - 6} textAnchor="end">{ax}</text>}
      {plane && <text x={6} y={pad - 8}>{ay}</text>}
    </svg>
  );
}

function IgTable({ W, frame, t }) {
  const cl = W.classes;
  const rows = frame.cands;
  return (
    <div className="viz-tablewrap">
      <table className="viz-table mlw4-table">
        <thead>
          <tr>
            <th>{t('Test', 'Test')}</th><th>IG</th><th>{'≤'}</th><th>{'>'}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c.key} className={c.best ? 'win' : ''}>
              <td><span data-mark="threshold" data-value={fmt(c.th)}>{testLabel(c)}</span></td>
              <td className="num" data-mark="ig" data-value={fmt(c.ig)}>{fmt(c.ig)}</td>
              <td className="num"><Counts counts={c.left} classes={cl} /></td>
              <td className="num"><Counts counts={c.right} classes={cl} /></td>
            </tr>
          ))}
          {frame.kind === 'contrast' && (
            <tr className="trial">
              <td><span data-mark="threshold" data-value={fmt(frame.trial.th)}>{testLabel(frame.trial)}</span></td>
              <td className="num" data-mark="ig" data-value={fmt(frame.trial.ig)}>{fmt(frame.trial.ig)}</td>
              <td className="num"><Counts counts={frame.trial.left} classes={cl} /></td>
              <td className="num"><Counts counts={frame.trial.right} classes={cl} /></td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// What one frame draws. Exported on its own so a test can check the caption against the marks of every frame.
export function Stage({ W, frame, guess = null, onPick = null, asking = false }) {
  const { t } = useApp();
  const stat = (
    <div className="mlw4-stat">
      <span>{t('points', 'puncte')} <b data-mark="n" data-value={frame.n}>{frame.n}</b></span>
      {frame.kind === 'node' && (
        <>
          <span>{t('here', 'aici')} <b><Counts counts={frame.counts} classes={W.classes} /></b></span>
          <span>H <b data-mark="h" data-value={fmt(frame.h)}>{fmt(frame.h)}</b></span>
        </>
      )}
    </div>
  );
  return (
    <div className="mlw4">
      {stat}
      <Plot W={W} frame={frame} t={t} />
      <Legend classes={W.classes} />
      {frame.kind === 'setup' && (
        <>
          <div className="mlw4-stat"><span>{t('candidate thresholds', 'praguri candidate')} <b data-mark="candidates" data-value={frame.cands.length}>{frame.cands.length}</b></span></div>
          <div className="mlw4-chips" role="group" aria-label={t('Pick the threshold with the largest IG', 'Alege pragul cu cel mai mare IG')}>
            {frame.cands.map((c) => (
              onPick
                ? <button key={c.key} type="button" className="mlw4-chip" aria-pressed={guess === c.key} onClick={() => onPick(c.key)} data-mark="threshold" data-value={fmt(c.th)}>{testLabel(c)}</button>
                : <span key={c.key} className="mlw4-chip" data-mark="threshold" data-value={fmt(c.th)}>{testLabel(c)}</span>
            ))}
          </div>
          {asking && <div className="viz-dim viz-note">{t('Click the threshold you think wins, or press Show me.', 'Apasă pe pragul care crezi că câștigă, sau apasă Arată-mi.')}</div>}
        </>
      )}
      {(frame.kind === 'node' || frame.kind === 'contrast') && <IgTable W={W} frame={frame} t={t} />}
      {frame.kind === 'zones' && (
        <>
          <div className="mlw4-stat">
            <span>{t('tests', 'teste')} <b data-mark="tests" data-value={frame.tests}>{frame.tests}</b></span>
            <span>{t('zones', 'zone')} <b data-mark="zones" data-value={frame.leaves.length}>{frame.leaves.length}</b></span>
          </div>
          {!W.plane && (
            <ul className="mlw4-zones">
              {frame.leaves.map((l, k) => {
                const m = classMark(W.classes, l.cls);
                return (
                  <li key={k}>
                    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><Shape shape={m.shape} cx={8} cy={8} r={5} fill={m.colour} /></svg>
                    <span>{l.conds.length ? l.conds.map((c, j) => <span key={j}>{j ? ' & ' : ''}{c.attr} {c.op} <span data-mark="threshold" data-value={fmt(c.th)}>{fmt(c.th)}</span></span>) : '*'}</span>
                    <b>{String(l.label)}</b>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

export default function Threshold({ props, predict }) {
  const { t } = useApp();
  const W = useMemo(() => mlThreshold(props), [props]);
  const s = useStepper(W.frames.length, { predict, own: true });
  const [guess, setGuess] = useState(null);
  const [skipped, setSkipped] = useState(false);
  const frame = W.frames[s.step];
  const asking = predict && s.step === 0 && guess === null && !skipped;
  const pick = (key) => { setGuess(key); s.settle(); };
  const stepper = {
    ...s,
    canNext: s.canNext && !(predict && guess === null && !skipped),
    goto: (to) => (predict && guess === null && !skipped ? s.step : s.goto(to)),
    reset: () => { setGuess(null); setSkipped(false); s.reset(); },
  };
  const note = guessNote(frame, guess);
  const caption = (
    <>
      <p>{t(frame.caption.en, frame.caption.ro)}</p>
      {note && <p data-mark="guess">{t(note.en, note.ro)}</p>}
      {asking && (
        <button type="button" className="mlw4-tap" onClick={() => { setSkipped(true); s.settle(); }}>{t('Show me', 'Arată-mi')}</button>
      )}
    </>
  );
  return (
    <VizFrame widget="ml-threshold" stepper={stepper} caption={caption} label={t('Thresholds of a continuous attribute and the decision zones', 'Pragurile unui atribut continuu și zonele de decizie')}>
      <Stage W={W} frame={frame} guess={guess} onPick={predict && s.step === 0 ? pick : null} asking={asking} />
    </VizFrame>
  );
}
