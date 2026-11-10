import React, { useCallback, useMemo, useState } from 'react';
import { useApp } from '../../../../contexts/AppContext';
import { useStepper } from '../kit.js';
import { VizFrame } from '../ui.jsx';
import { nnNet, dataOf } from '../logic/nn-net.js';
import { PickBar, allAnswered } from './ml/mlParts.jsx';
import './nn-net.css';

const W = 320;
const ROW = 104;

// where neuron i of layer l sits (layers numbered from 1; layer 1 at the bottom)
const geometry = (layers) => {
  const L = layers.length;
  const H = 64 + (L - 1) * ROW;
  const pos = (l, i) => {
    const n = layers[l - 1];
    const gap = n >= 3 ? 92 : 108;
    return { x: 128 + (i - (n - 1) / 2) * gap, y: H - 36 - (l - 1) * ROW };
  };
  return { H, pos };
};

// the net of one frame
export function Stage({ M, k, answered = true }) {
  const { t } = useApp();
  const { P } = M;
  const { layers, L, inputs, W: Wt, hasBias } = P;
  const st = M.state(k, answered);
  const { H, pos } = geometry(layers);
  const f = M.frames[k];
  const lit = new Set(st.lit.map(([l, i, j]) => `${l}.${i}.${j}`));
  const cur = st.current ? `${st.current[0]}.${st.current[1]}` : null;
  const R = 17;
  const edges = [];
  for (let l = 2; l <= L; l += 1) {
    for (let i = 0; i < layers[l - 2]; i += 1) {
      for (let j = 0; j < layers[l - 1]; j += 1) {
        const a = pos(l - 1, i);
        const b = pos(l, j);
        const key = `${l}.${i}.${j}`;
        const isLit = lit.has(key);
        const newV = st.w[key];
        const show = P.edgeLabels === 'all' || isLit || newV !== undefined;
        // the label sits 34 % along the edge from the lower neuron: two crossing edges keep apart
        const tt = P.edgeLabels === 'all' ? 0.36 : 0.5;
        const lx = a.x + (b.x - a.x) * tt;
        const ly = a.y + (b.y - a.y) * tt;
        edges.push({ key, a, b, isLit, newV, show, lx, ly, old: Wt[l][i][j] });
      }
    }
  }
  const showVal = (v) => M.fm(v);
  return (
    <div className="nn">
      <svg className="nn-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t('The network', 'Rețeaua')}>
        {edges.map((e) => (
          <line key={`e${e.key}`} className={`nn-edge${e.isLit ? ' lit' : ''}${e.newV !== undefined ? ' upd' : ''}`}
            x1={e.a.x} y1={e.a.y - R} x2={e.b.x} y2={e.b.y + R} />
        ))}
        {edges.filter((e) => e.show).map((e) => {
          const v = e.newV !== undefined ? e.newV : e.old;
          const txt = e.newV !== undefined ? showVal(v) : M.fi(v);
          return (
            <g key={`l${e.key}`} className={`nn-wl${e.isLit ? ' lit' : ''}${e.newV !== undefined ? ' new' : ''}`}>
              <text x={e.lx} y={e.ly + 4} textAnchor="middle" data-mark="weight" data-value={dataOf(v)}>{txt}</text>
            </g>
          );
        })}
        {layers.map((n, li) => Array.from({ length: n }, (_, i) => {
          const l = li + 1;
          const p = pos(l, i);
          const key = `${l}.${i}`;
          const y = l === 1 ? inputs[i] : st.y[key];
          const z = st.z[key];
          const d = st.d[key];
          const nb = st.nb[key];
          const isCur = cur === key;
          return (
            <g key={key} className={`nn-node${isCur ? ' cur' : ''}${y !== undefined ? ' has' : ''}`} data-node={key}>
              <circle cx={p.x} cy={p.y} r={R} />
              <text className="in" x={p.x} y={p.y + 4.5} textAnchor="middle" {...(y !== undefined ? { 'data-mark': l === 1 ? 'input' : 'y', 'data-value': dataOf(y) } : {})}>
                {y !== undefined ? (l === 1 ? M.fi(y) : showVal(y)) : '?'}
              </text>
              <g className="side">
                {z !== undefined && <text className="z" x={p.x + R + 4} y={p.y - 8} data-mark="z" data-value={dataOf(z)}>z {showVal(z)}</text>}
                {d !== undefined && <text className="d" x={p.x + R + 4} y={p.y + 5} data-mark="delta" data-value={dataOf(d)}>δ {showVal(d)}</text>}
                {hasBias && l >= 2 && <text className={`b${nb !== undefined ? ' new' : ''}`} x={p.x + R + 4} y={p.y + 18} data-mark="bias" data-value={dataOf(nb !== undefined ? nb : P.b[l][i])}>b {nb !== undefined ? showVal(nb) : M.fi(P.b[l][i])}</text>}
                {l === L && <text className="t" x={p.x + R + 4} y={p.y - 20} data-mark="target" data-value={dataOf(P.target[i])}>t {M.fi(P.target[i])}</text>}
              </g>
            </g>
          );
        }))}
        <text className="lay" x="6" y={H - 6}>{t('layer 1 (inputs)', 'stratul 1 (intrări)')}</text>
      </svg>
      <div className="nn-legend">
        <span data-mark="eta" data-value={dataOf(P.eta)}>η = {M.fi(P.eta)}</span>
        <span className="nn-note" data-mark="values" data-value={P.values}>{t(M.sigmaNote.en, M.sigmaNote.ro)}</span>
        {hasBias && <span>{t('with biases', 'cu bias')}</span>}
      </div>
      {f.kind === 'end' && (
        <div className="nn-table" role="table">
          <table>
            <thead><tr><th>{t('weight', 'pondere')}</th><th>{t('old', 'veche')}</th><th>{t('new', 'nouă')}</th></tr></thead>
            <tbody>
              {M.final.weights.flatMap((m, idx) => m.flatMap((row, i) => row.map((v, j) => {
                const l = idx + 2;
                return (
                  <tr key={`${l}.${i}.${j}`}>
                    <td>w{i + 1}{j + 1} <span className="lay2">({t('layer', 'strat')} {l})</span></td>
                    <td data-value={dataOf(Wt[l][i][j])}>{M.fi(Wt[l][i][j])}</td>
                    <td data-mark="final" data-value={dataOf(v)}><b>{M.fm(v)}</b></td>
                  </tr>
                );
              })))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function NnNet({ props, predict }) {
  const { t } = useApp();
  const L = (x) => (x !== null && typeof x === 'object' ? t(x.en, x.ro) : String(x));
  const M = useMemo(() => nnNet(props), [props]);
  const s = useStepper(M.count, { predict, own: !!predict });
  const [picks, setPicks] = useState({});
  const spec = predict ? M.pickSpec(s.step) : null;
  const answered = allAnswered(spec, picks);
  const onPick = useCallback((key, id) => { setPicks((p) => ({ ...p, [key]: id })); s.settle(); }, [s]);
  const blocked = (to) => Array.from({ length: to }, (_, i) => i).some((i) => !allAnswered(predict ? M.pickSpec(i) : null, picks));
  const stepper = {
    ...s,
    canNext: s.canNext && answered,
    goto: (to) => { if (to <= s.step || !blocked(to)) s.goto(to); },
    reset: () => { setPicks({}); s.reset(); },
  };
  const cap = M.caption(s.step, { answered, picks });
  return (
    <VizFrame widget="nn-net" stepper={stepper} caption={<p>{t(cap.en, cap.ro)}</p>} label={t('One backpropagation step on a small net', 'Un pas de backpropagation pe o rețea mică')}>
      <Stage M={M} k={s.step} answered={answered} />
      <PickBar spec={spec} picks={picks} onPick={onPick} t={t} L={L} />
    </VizFrame>
  );
}
