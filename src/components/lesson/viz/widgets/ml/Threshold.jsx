import React, { useMemo, useState } from 'react';
import { useApp } from '../../../../../contexts/AppContext';
import { useStepper } from '../../kit.js';
import { VizFrame } from '../../ui.jsx';
import { AXIS_LABEL_GAP as LABEL_GAP, AXIS_LABEL_ROW as LABEL_ROW, classMark, guessNote, intervalText, labelRows, mlThreshold, plotScale, testLabel } from '../../logic/ml/threshold.js';
import { fmt } from '../../logic/ml/tree-grow.js';
import { Counts, Legend, Shape } from './Parts.jsx';
import './ml-w4.css';

function Plot({ W, frame, t, revealed = true }) {
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
  // while a node is asked, its own line is not drawn yet
  const lines = frame.kind === 'setup'
    ? frame.cands.map((c) => ({ attr: c.attr, th: c.th, region: { x: [-Infinity, Infinity], y: [-Infinity, Infinity] }, cand: true }))
    : frame.lines.filter((b) => revealed || frame.kind !== 'node' || b.node !== frame.id);
  // the coordinates of the points, on both axes of the plane
  const ticks = (vs) => [...new Set(vs)].sort((a, b) => a - b);
  const tx = plane ? ticks(W.points.map((p) => p.x)) : [];
  const ty = plane ? ticks(W.points.map((p) => p.y)) : [];
  // the zones of the leaves made so far take their class colour; a node still asking keeps its own split uncoloured
  const zones = (frame.zones || []).filter((l) => revealed || frame.kind !== 'node' || l.parent !== frame.id);
  const zoneRect = (l) => {
    const x0 = S.X(l.region.x[0] === -Infinity ? S.domainX[0] : l.region.x[0]);
    const x1 = S.X(l.region.x[1] === Infinity ? S.domainX[1] : l.region.x[1]);
    return plane
      ? { x: x0, width: x1 - x0, y: S.Y(l.region.y[1] === Infinity ? S.domainY[1] : l.region.y[1]), height: S.Y(l.region.y[0] === -Infinity ? S.domainY[0] : l.region.y[0]) - S.Y(l.region.y[1] === Infinity ? S.domainY[1] : l.region.y[1]) }
      : { x: x0, width: x1 - x0, y: h / 2 - 38, height: 66 };
  };
  const reg = frame.kind === 'node' && frame.region ? zoneRect({ region: frame.region }) : null;
  // on the axis, labels of cuts closer than LABEL_GAP go on rows above each other (4.10: 8.25 and 8.75); the plot grows upwards
  const contrast = frame.kind === 'contrast';
  const rows = plane ? lines.map(() => 0) : labelRows([...lines.map((b) => S.X(b.th)), ...(contrast ? [S.X(frame.trial.th)] : [])], LABEL_GAP);
  const lift = Math.max(0, ...rows) * LABEL_ROW;
  return (
    <svg className="mlw4-plot" viewBox={`0 ${-lift} ${w} ${h + lift}`} role="img"
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
            {(!plane || last || b.cand) && <text data-mark="cut-label" data-value={fmt(b.th)} x={s.x1 + (plane && b.attr === ay ? 4 : 0)} y={plane ? (b.attr === ay ? s.y1 - 4 : s.y1 - 5) : s.y1 - 5 - rows[k] * LABEL_ROW} textAnchor={plane && b.attr === ay ? 'start' : 'middle'} className={last ? 'on' : ''}>{plane ? `${b.attr}≤${fmt(b.th)}` : fmt(b.th)}</text>}
          </g>
        );
      })}
      {frame.kind === 'contrast' && (
        <g>
          <line x1={S.X(frame.trial.th)} x2={S.X(frame.trial.th)} y1={h / 2 - 34} y2={h / 2 + 22} className="mlw4-cut trial" data-mark="trial" data-value={fmt(frame.trial.th)} />
          <text data-mark="cut-label" data-value={fmt(frame.trial.th)} x={S.X(frame.trial.th)} y={h / 2 - 39 - rows[rows.length - 1] * LABEL_ROW} textAnchor="middle">{fmt(frame.trial.th)}</text>
        </g>
      )}
      {pos.map(({ p, cx, cy }) => {
        const m = classMark(W.classes, p.cls);
        return <Shape key={p.i} shape={m.shape} cx={cx} cy={cy} r={plane ? 6.5 : 7} fill={m.colour} data-mark="point" data-value={plane ? `${fmt(p.x)} ${fmt(p.y)}` : fmt(p.x)} data-label={String(p.label)} />;
      })}
      {showLabels && pos.filter(({ p }, k, arr) => arr.findIndex((q) => q.p.x === p.x) === k).map(({ p, cx }) => (
        <text key={p.i} x={cx} y={h / 2 + 38} textAnchor="middle">{fmt(p.x)}</text>
      ))}
      {tx.map((v) => <text key={`x${v}`} x={S.X(v)} y={h - pad + 13} textAnchor="middle" data-mark="tick-x" data-value={fmt(v)}>{fmt(v)}</text>)}
      {ty.map((v) => <text key={`y${v}`} x={pad - 6} y={S.Y(v) + 4} textAnchor="end" data-mark="tick-y" data-value={fmt(v)}>{fmt(v)}</text>)}
      {plane && <text x={w - 2} y={h - pad + 13} textAnchor="end" className="on">{ax}</text>}
      {plane && <text x={6} y={pad - 10} className="on">{ay}</text>}
    </svg>
  );
}

// hideCands: the node's IG values are still to be predicted; hideTrial: the same for the threshold inside the run
function IgTable({ W, frame, t, hideCands = false, hideTrial = false }) {
  const cl = W.classes;
  const rows = frame.cands;
  const ig = (v, hide) => (hide ? <td className="num">?</td> : <td className="num" data-mark="ig" data-value={fmt(v)}>{fmt(v)}</td>);
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
            <tr key={c.key} className={c.best && !hideCands ? 'win' : ''}>
              <td><span data-mark="threshold" data-value={fmt(c.th)}>{testLabel(c)}</span></td>
              {ig(c.ig, hideCands)}
              <td className="num"><Counts counts={c.left} classes={cl} /></td>
              <td className="num"><Counts counts={c.right} classes={cl} /></td>
            </tr>
          ))}
          {frame.kind === 'contrast' && (
            <tr className="trial">
              <td><span data-mark="threshold" data-value={fmt(frame.trial.th)}>{testLabel(frame.trial)}</span></td>
              {ig(frame.trial.ig, hideTrial)}
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
// revealed = false on a node or the inside-run frame that is still asking: its IG (and a node's line) stay hidden.
export function Stage({ W, frame, guess = null, onPick = null, asking = false, revealed = true }) {
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
      <Plot W={W} frame={frame} t={t} revealed={revealed} />
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
          {asking && <div className="mlw4-hint">{t('Click the threshold you think wins, or press Show me.', 'Apasă pe pragul care crezi că câștigă, sau apasă Arată-mi.')}</div>}
        </>
      )}
      {(frame.kind === 'node' || frame.kind === 'contrast') && <IgTable W={W} frame={frame} t={t} hideCands={!revealed && frame.kind === 'node'} hideTrial={!revealed && frame.kind === 'contrast'} />}
      {frame.ask && !revealed && (
        <div className="mlw4-chips" role="group" aria-label={t('Your prediction', 'Predicția ta')}>
          {frame.ask.options.map((o) => (
            onPick
              ? <button key={o.key} type="button" className="mlw4-chip" aria-pressed={guess === o.key} onClick={() => onPick(o.key)} data-mark="option" data-value={o.th !== undefined ? fmt(o.th) : o.key}>{t(o.label.en, o.label.ro)}</button>
              : <span key={o.key} className="mlw4-chip">{t(o.label.en, o.label.ro)}</span>
          ))}
        </div>
      )}
      {frame.kind === 'zones' && (
        <>
          <div className="mlw4-stat">
            <span>{t('tests', 'teste')} <b data-mark="tests" data-value={frame.tests}>{frame.tests}</b></span>
            <span>{t('zones', 'zone')} <b data-mark="zones" data-value={frame.leaves.length}>{frame.leaves.length}</b></span>
          </div>
          <ul className="mlw4-zones">
            {frame.leaves.map((l, k) => {
              const m = classMark(W.classes, l.cls);
              return (
                <li key={k}>
                  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><Shape shape={m.shape} cx={8} cy={8} r={5} fill={m.colour} /></svg>
                  {W.plane
                    ? <span data-mark="zone-ineq" data-value={l.ineq}>{l.ineq}</span>
                    : <span>{W.attrs[0]} {'∈'} <span data-mark="interval" data-value={intervalText(l.region.x)}>{intervalText(l.region.x)}</span></span>}
                  <b>{'→'} {String(l.label)}</b>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

export default function Threshold({ props, predict }) {
  const { t } = useApp();
  const W = useMemo(() => mlThreshold(props), [props]);
  const s = useStepper(W.frames.length, { predict, own: true });
  // answers: frame index -> the key picked, or null for Show me. The root is asked on the setup frame (0) and shown on
  // the next one; a later node with a choice, and the threshold inside the run, are asked on their own frame.
  const [answers, setAnswers] = useState({});
  const k = s.step;
  const frame = W.frames[k];
  const asksAt = (i) => !!predict && (i === 0 ? W.frames[0].cands.length > 0 && W.frames.length > 1 : !!W.frames[i].ask);
  const open = (i) => asksAt(i) && answers[i] === undefined;
  const asking = open(k);
  const firstOpen = () => { for (let i = 0; i < W.frames.length; i += 1) if (open(i)) return i; return W.frames.length - 1; };
  const answer = (v) => { setAnswers((a) => ({ ...a, [k]: v })); s.settle(); };
  const stepper = {
    ...s,
    canNext: s.canNext && !asking,
    goto: (to) => s.goto(Math.min(to, firstOpen())),
    reset: () => { setAnswers({}); s.reset(); },
  };
  const guess = frame.kind === 'node' && frame.id === 0 ? answers[0] : answers[k];
  const note = asking ? null : guessNote(frame, guess);
  const text = asking && frame.ask ? frame.ask.caption : frame.caption;
  const caption = (
    <>
      <p>{t(text.en, text.ro)}</p>
      {note && <p data-mark="guess">{t(note.en, note.ro)}</p>}
      {asking && (
        <button type="button" className="mlw4-tap" onClick={() => answer(null)}>{t('Show me', 'Arată-mi')}</button>
      )}
    </>
  );
  return (
    <VizFrame widget="ml-threshold" stepper={stepper} caption={caption} label={t('Thresholds of a continuous attribute and the decision zones', 'Pragurile unui atribut continuu și zonele de decizie')}>
      <Stage W={W} frame={frame} guess={answers[k] ?? null} onPick={asking ? answer : null} asking={asking && k === 0} revealed={!asking || k === 0} />
    </VizFrame>
  );
}
