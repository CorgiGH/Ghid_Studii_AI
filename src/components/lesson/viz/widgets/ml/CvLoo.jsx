import React, { useMemo, useState } from 'react';
import { useApp } from '../../../../../contexts/AppContext';
import { useStepper } from '../../kit.js';
import { VizFrame } from '../../ui.jsx';
import { foldNote, mlCvloo } from '../../logic/ml/cvloo.js';
import { classMark, plotScale } from '../../logic/ml/threshold.js';
import { fmt } from '../../logic/ml/tree-grow.js';
import { Counts, Legend, Shape } from './Parts.jsx';
import './ml-w4.css';

function Tree({ node, W, path, revealed, edge }) {
  const onPath = revealed && path.includes(node);
  const stop = revealed && path[path.length - 1] === node;
  const cls = `mlw4-node${node.leaf ? ' leaf' : ''}${onPath ? ' kept' : ''}`;
  return (
    <li>
      {edge && <span className="mlw4-edge">{edge}</span>}
      {node.leaf
        ? <span className={cls} data-mark="leaf" data-value={String(node.label)}><b>{'→'} {String(node.label)}</b>{node.empty ? null : <span className="mlw4-sub"><Counts counts={node.counts} classes={W.classes} /></span>}{stop ? <span aria-hidden="true"> {'◀'}</span> : null}</span>
        : <span className={cls}><b>{node.test.attr}{node.test.th !== undefined ? ' ≤ ' : ' ?'}{node.test.th !== undefined ? <span data-mark="threshold" data-value={fmt(node.test.th)}>{fmt(node.test.th)}</span> : null}</b><span className="mlw4-sub"><Counts counts={node.counts} classes={W.classes} /></span></span>}
      {!node.leaf && (
        <ul>
          {node.kids.map((k, i) => {
            const child = k.node || k;
            const label = node.test.th !== undefined
              ? `${i === 0 ? '≤' : '>'} ${fmt(node.test.th)}`
              : `${node.test.attr} = ${k.value}`;
            return <Tree key={i} node={child} W={W} path={path} revealed={revealed} edge={label} />;
          })}
        </ul>
      )}
    </li>
  );
}

function Rows({ table, out, t }) {
  return (
    <div className="viz-tablewrap" style={{ maxHeight: '14rem', overflowY: 'auto' }}>
      <table className="viz-table mlw4-table">
        <thead>
          <tr>
            <th>#</th>
            {table.columns.map((c) => <th key={typeof c === 'string' ? c : c.en}>{typeof c === 'string' ? c : t(c.en, c.ro)}</th>)}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((r, i) => (
            <tr key={i} className={out === i ? 'mlw4-row-out' : ''} data-out={out === i ? 'true' : undefined}>
              <td className="num" data-mark="row" data-value={i + 1}>{i + 1}</td>
              {r.map((v, j) => <td key={j} className="num" data-mark="cell" data-value={typeof v === 'number' ? fmt(v) : String(v)}>{String(v)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// 4.10: one continuous attribute, so the rows sit on an axis and the thresholds of the refit tree show where it cuts
function Axis({ W, table, frame, t }) {
  const attr = W.single;
  const xi = W.names.indexOf(attr);
  const pts = table.rows.map((r, i) => ({ i, x: r[xi], cls: W.classes.indexOf(r[W.ti]), label: r[W.ti] }));
  const S = plotScale(pts, false, 320, 96);
  const stack = {};
  const out = frame.kind === 'fold' ? frame.out : null;
  const cuts = frame.kind === 'fold' ? frame.thresholds : [];
  return (
    <svg className="mlw4-plot" viewBox={`0 0 ${S.w} ${S.h}`} role="img" aria-label={t(`Rows on the ${attr} axis`, `Rânduri pe axa ${attr}`)}>
      <line x1={S.pad} x2={S.w - S.pad} y1={S.h / 2 + 8} y2={S.h / 2 + 8} className="mlw4-axis" />
      {cuts.map((c, k) => (
        <g key={k}>
          <line x1={S.X(c.th)} x2={S.X(c.th)} y1={S.h / 2 - 36} y2={S.h / 2 + 22} className="mlw4-cut" data-mark="boundary" data-value={fmt(c.th)} />
          <text x={S.X(c.th)} y={S.h / 2 - 41} textAnchor="middle" className="on">{fmt(c.th)}</text>
        </g>
      ))}
      {pts.map((p) => {
        const k = (stack[p.x] = (stack[p.x] ?? -1) + 1);
        const m = classMark(W.classes, p.cls);
        const cy = S.h / 2 + 8 - k * 15;
        const gone = p.i === out;
        return <Shape key={p.i} shape={m.shape} cx={S.X(p.x)} cy={cy} r={6.5} fill={gone ? 'none' : m.colour} className={`mlw4-pt${gone ? ' gone' : ''}`} style={gone ? { stroke: m.colour } : undefined} data-mark="point" data-value={fmt(p.x)} data-out={gone ? 'true' : undefined} />;
      })}
    </svg>
  );
}

// What one frame draws; `revealed` is false while the learner is still to predict the fold (verdict and count stay hidden).
export function Stage({ W, table, frame, revealed = true, guess = null, onPick = null }) {
  const { t } = useApp();
  const fold = frame.kind === 'fold';
  const errors = frame.kind === 'end' ? frame.errors : fold ? (revealed ? frame.errAfter : frame.errBefore) : 0;
  const tree = frame.tree;
  return (
    <div className="mlw4">
      <div className="mlw4-stat">
        <span>{t('rows', 'rânduri')} <b data-mark="n" data-value={frame.n}>{frame.n}</b></span>
        {fold && <span>{t('left out: row', 'scos: rândul')} <b data-mark="fold" data-value={frame.k}>{frame.k}</b></span>}
        {frame.kind === 'setup' && <span>{t('training error', 'eroare la antrenare')} <b data-mark="train" data-value={frame.trainErr}>{frame.trainErr}</b>/{frame.n}</span>}
        <span>{t('CVLOO errors', 'erori CVLOO')} <b data-mark="errors" data-value={errors}>{errors}</b></span>
      </div>
      <Rows table={table} out={fold ? frame.out : null} t={t} />
      {W.single && <Axis W={W} table={table} frame={frame} t={t} />}
      <Legend classes={W.classes} />
      {frame.kind !== 'end' && (
        <div className="mlw4-scroll">
          <ul className="mlw4-tree" aria-label={t('The tree', 'Arborele')}>
            <Tree node={tree} W={W} path={fold ? frame.path : []} revealed={fold && revealed} />
          </ul>
        </div>
      )}
      {fold && !revealed && (
        <div className="mlw4-chips" role="group" aria-label={t('What does the tree predict for the left-out row?', 'Ce prezice arborele pentru rândul scos?')}>
          {W.classes.map((c) => (
            onPick
              ? <button key={String(c)} type="button" className="mlw4-chip" aria-pressed={guess === c} onClick={() => onPick(c)}>{String(c)}</button>
              : <span key={String(c)} className="mlw4-chip">{String(c)}</span>
          ))}
        </div>
      )}
      {fold && revealed && (
        <div className="mlw4-stat">
          <span className={`mlw4-verdict ${frame.wrong ? 'bad' : 'ok'}`} data-mark="verdict" data-value={frame.wrong ? 'wrong' : 'right'}>
            {t('tree says', 'arborele zice')} <b data-mark="pred" data-value={String(frame.pred)}>{String(frame.pred)}</b> {frame.wrong ? '≠' : '='} {t('label', 'eticheta')} <b data-mark="truth" data-value={String(frame.truth)}>{String(frame.truth)}</b> {frame.wrong ? t('wrong', 'greșit') : t('right', 'corect')}
          </span>
        </div>
      )}
      {frame.kind === 'end' && (
        <div className="mlw4-stat">
          <span>E<sub>CVLOO</sub> <b data-mark="cvloo" data-value={frame.errors}>{frame.errors}</b>/<span data-mark="n" data-value={frame.n}>{frame.n}</span></span>
          <span>{t('training', 'antrenare')} <b data-mark="train" data-value={frame.trainErr}>{frame.trainErr}</b>/{frame.n}</span>
          {frame.alt !== null && <span>{t('other column order', 'altă ordine a coloanelor')} <b data-mark="alt" data-value={frame.alt}>{frame.alt}</b>/{frame.n}</span>}
        </div>
      )}
    </div>
  );
}

export default function CvLoo({ props, predict }) {
  const { t } = useApp();
  const W = useMemo(() => mlCvloo(props), [props]);
  const s = useStepper(W.frames.length, { predict, own: true });
  // answers: fold number -> the label picked, or null when the learner pressed Show me
  const [answers, setAnswers] = useState({});
  const frame = W.frames[s.step];
  const fold = frame.kind === 'fold';
  const answered = (k) => !predict || answers[k] !== undefined;
  const asking = fold && !answered(frame.k);
  const firstOpen = () => { for (let k = 1; k <= W.frames.length - 2; k += 1) if (!answered(k)) return k; return W.frames.length - 1; };
  const answer = (k, v) => { setAnswers((a) => ({ ...a, [k]: v })); s.settle(); };
  const stepper = {
    ...s,
    canNext: s.canNext && !asking,
    goto: (to) => s.goto(Math.min(to, firstOpen())),
    reset: () => { setAnswers({}); s.reset(); },
  };
  const note = fold && !asking ? foldNote(frame, answers[frame.k]) : null;
  const caption = (
    <>
      <p>{asking ? t(frame.askCaption.en, frame.askCaption.ro) : t(frame.caption.en, frame.caption.ro)}</p>
      {note && <p data-mark="guess">{t(note.en, note.ro)}</p>}
      {asking && <button type="button" className="mlw4-tap" onClick={() => answer(frame.k, null)}>{t('Show me', 'Arată-mi')}</button>}
    </>
  );
  return (
    <VizFrame widget="ml-cvloo" stepper={stepper} caption={caption} label={t('Leave-one-out cross-validation of a decision tree', 'Validarea încrucișată leave-one-out a unui arbore de decizie')}>
      <Stage W={W} table={props.table} frame={frame} revealed={!asking} guess={fold ? answers[frame.k] ?? null : null} onPick={asking ? (c) => answer(frame.k, c) : null} />
    </VizFrame>
  );
}
