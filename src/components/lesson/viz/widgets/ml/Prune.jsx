import React, { useMemo, useState } from 'react';
import { useApp } from '../../../../../contexts/AppContext';
import { useStepper } from '../../kit.js';
import { VizFrame } from '../../ui.jsx';
import { epsChoices, mlPrune } from '../../logic/ml/prune.js';
import { fmt } from '../../logic/ml/tree-grow.js';
import { Counts } from './Parts.jsx';
import './ml-w4.css';

function PTree({ node, P, frame, edge, t }) {
  const st = frame.status[node.id];
  const cls = frame.kind === 'setup' ? '' : ` ${st}`;
  const word = frame.kind === 'setup' ? null : st === 'cut' ? t('cut', 'tăiat') : st === 'gone' ? t('removed', 'eliminat') : null;
  return (
    <li data-status={frame.kind === 'setup' ? undefined : st}>
      {edge && <span className="mlw4-edge">{edge.attr} = <span data-mark="edge" data-value={edge.value}>{edge.value}</span></span>}
      {node.leaf
        ? <span className={`mlw4-node leaf${cls}`}><b>{'→'} <span data-mark="leaf" data-value={String(node.label)}>{String(node.label)}</span></b>{word && <span className="mlw4-sub">{word}</span>}</span>
        : (
          <span className={`mlw4-node${cls}`}>
            <b>{node.attr}</b>
            <span className="mlw4-sub">IG <b data-mark="ig" data-value={fmt(node.ig)}>{fmt(node.ig)}</b></span>
            {node.counts && <span className="mlw4-sub"><Counts counts={node.counts} classes={P.classes} /></span>}
            {st === 'cut' && <b>{'→'} <span data-mark="leaf" data-value={String(frame.cutLabels[node.id])}>{String(frame.cutLabels[node.id])}</span></b>}
            {word && <span className="mlw4-sub">{word}</span>}
          </span>
        )}
      {!node.leaf && (
        <ul>
          {node.kids.map((k, i) => <PTree key={i} node={k.node} P={P} frame={frame} edge={{ attr: node.attr, value: k.value }} t={t} />)}
        </ul>
      )}
    </li>
  );
}

// What one frame draws. Exported on its own so a test can check the caption against the marks of every frame.
export function Stage({ P, frame, choices = [], onEps = null }) {
  const { t } = useApp();
  return (
    <div className="mlw4">
      <div className="mlw4-stat">
        <span>{'ε'} <b data-mark="epsilon" data-value={fmt(frame.eps)}>{fmt(frame.eps)}</b></span>
        <span>{frame.kind === 'topdown' || frame.kind === 'bottomup' ? t('tests left', 'teste rămase') : t('tests', 'teste')} <b data-mark="tests" data-value={frame.kind === 'compare' ? P.nTests : frame.tests}>{frame.kind === 'compare' ? P.nTests : frame.tests}</b>{(frame.kind === 'topdown' || frame.kind === 'bottomup') && <> {t('of', 'din')} <span data-mark="of" data-value={P.nTests}>{P.nTests}</span></>}</span>
        {P.n !== null && frame.kind !== 'compare' && <span>{t('training error', 'eroare la antrenare')} <b data-mark="err" data-value={frame.err}>{frame.err}</b>/<span data-mark="n" data-value={P.n}>{P.n}</span></span>}
      </div>
      {frame.kind !== 'compare' && (
        <div className="mlw4-scroll">
          <ul className="mlw4-tree" aria-label={t('The tree', 'Arborele')}>
            <PTree node={P.root} P={P} frame={frame} t={t} />
          </ul>
        </div>
      )}
      {frame.kind === 'compare' && (
        <div className="viz-tablewrap">
          <table className="viz-table mlw4-table mlw4-cmp">
            <thead>
              <tr><th>{t('Test', 'Test')}</th><th>IG</th><th>top-down</th><th>bottom-up</th></tr>
            </thead>
            <tbody>
              {frame.rows.map((r) => (
                <tr key={r.id} className={r.td !== r.bu ? 'trial' : ''}>
                  <td data-mark="node" data-value={r.name}>{r.name}</td>
                  <td className="num" data-mark="ig" data-value={fmt(r.ig)}>{fmt(r.ig)}</td>
                  <td>{r.td ? t('stays', 'rămâne') : t('cut', 'tăiat')}</td>
                  <td>{r.bu ? t('stays', 'rămâne') : t('cut', 'tăiat')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {frame.kind === 'compare' && (
        <div className="mlw4-stat">
          <span>{t('top-down keeps', 'top-down păstrează')} <b data-mark="td" data-value={frame.tdTests}>{frame.tdTests}</b></span>
          <span>{t('bottom-up keeps', 'bottom-up păstrează')} <b data-mark="bu" data-value={frame.buTests}>{frame.buTests}</b></span>
          {P.n !== null && <span>{t('training error', 'eroare la antrenare')} <b data-mark="err" data-value={frame.eTD}>{frame.eTD}</b>/<span data-mark="n" data-value={P.n}>{P.n}</span> {t('and', 'și')} <b data-mark="err" data-value={frame.eBU}>{frame.eBU}</b>/{P.n}</span>}
        </div>
      )}
      {frame.kind !== 'setup' && choices.length > 1 && (
        <div className="mlw4-chips" role="group" aria-label={t('Threshold', 'Pragul')}>
          {choices.map((v) => (
            onEps
              ? <button key={fmt(v)} type="button" className="mlw4-chip" aria-pressed={fmt(v) === fmt(frame.eps)} onClick={() => onEps(v)} data-mark="eps" data-value={fmt(v)}>{'ε'} = {fmt(v)}</button>
              : <span key={fmt(v)} className="mlw4-chip" data-mark="eps" data-value={fmt(v)}>{'ε'} = {fmt(v)}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Prune({ props, predict }) {
  const { t } = useApp();
  const [eps, setEps] = useState(props.epsilon);
  const P = useMemo(() => mlPrune({ ...props, epsilon: eps }), [props, eps]);
  const choices = useMemo(() => epsChoices(props), [props]);
  const s = useStepper(P.frames.length, { predict });
  const frame = P.frames[s.step];
  const caption = <p>{t(frame.caption.en, frame.caption.ro)}</p>;
  return (
    <VizFrame widget="ml-prune" stepper={s} caption={caption} label={t('Pruning a decision tree with a threshold on the IG', 'Tăierea unui arbore de decizie cu un prag pe IG')}>
      <Stage P={P} frame={frame} choices={choices} onEps={setEps} />
    </VizFrame>
  );
}
