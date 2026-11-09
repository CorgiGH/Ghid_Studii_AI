import React, { useCallback, useMemo, useState } from 'react';
import { useApp } from '../../../../contexts/AppContext';
import { useStepper } from '../kit.js';
import { VizFrame } from '../ui.jsx';
import { gameTree, showBound, layoutOf } from '../logic/game-tree.js';
import { PickBar, allAnswered } from './ml/mlParts.jsx';
import './game-tree.css';

// the tree of one frame
export function Stage({ M, k, answered = true }) {
  const { t } = useApp();
  const T = M.T;
  const f = M.frames[k];
  const st = M.state(k, answered);
  const { H, leafW, vbX, vbW, px, py } = layoutOf(T);
  const half = leafW / 2;
  const under = (id) => (T.nodes[id].leaf ? [id] : T.nodes[id].children.flatMap(under));
  const gone = (id) => under(id).every((l) => st.leaves[l] === 'skipped');
  const cutFrom = new Set(st.cuts.map((c) => c.from));
  const ids = T.order;
  const edges = ids.filter((id) => T.nodes[id].parent !== null);
  const curNode = M.mode === 'minimax' && f.kind === 'node' ? f.node : null;
  const onPath = (id) => curNode && T.nodes[curNode].children.includes(id);
  const chosen = new Set(st.chosen.map(([p, c]) => `${p}>${c}`));
  return (
    <div className="gt">
      <svg className="gt-svg" viewBox={`${vbX} 0 ${vbW} ${H}`} role="img" aria-label={t('The game tree', 'Arborele jocului')}>
        {edges.map((id) => {
          const p = T.nodes[id].parent;
          const x1 = px(p); const y1 = py(p) + 18; const x2 = px(id); const y2 = py(id) - (T.nodes[id].leaf ? 16 : 19);
          const skip = st.leaves && gone(id);
          return (
            <g key={`e-${id}`}>
              <line className={`gt-edge${skip ? ' skip' : ''}${chosen.has(`${p}>${id}`) ? ' pick' : onPath(id) ? ' on' : ''}`} data-mark={chosen.has(`${p}>${id}`) ? 'pick' : undefined} x1={x1} y1={y1} x2={x2} y2={y2} />
              {cutFrom.has(id) && (
                <line className="gt-slash" data-mark="slash" data-value={p} x1={(x1 + x2) / 2 - 9} y1={(y1 + y2) / 2 - 7} x2={(x1 + x2) / 2 + 9} y2={(y1 + y2) / 2 + 7} />
              )}
            </g>
          );
        })}
        {ids.map((id) => {
          const n = T.nodes[id];
          const x = px(id); const y = py(id);
          if (n.leaf) {
            const status = st.leaves[id];
            return (
              <g key={id} className={`gt-leaf ${status}`} data-leaf={status}>
                <rect x={x - half} y={y - 15} width={leafW} height={30} rx={7} />
                <text className="num" x={x} y={y + 5.5} textAnchor="middle" data-mark="leaf" data-value={n.value}>{n.value}</text>
                {status === 'skipped' && <line className="x" x1={x - half + 3} y1={y + 12} x2={x + half - 3} y2={y - 12} />}
              </g>
            );
          }
          const val = st.nodes[id];
          const b = st.bounds[id];
          const skipped = gone(id);
          const up = n.type === 'MAX';
          const cls = ['gt-node'];
          if (skipped) cls.push('skipped');
          else if (val) cls.push(val.bound ? 'bound' : 'closed');
          else if (b) cls.push('open');
          if (curNode === id) cls.push('cur');
          const pts = up ? `${x},${y - 20} ${x - 25},${y + 17} ${x + 25},${y + 17}` : `${x - 25},${y - 17} ${x + 25},${y - 17} ${x},${y + 20}`;
          const vy = up ? y + 9 : y - 4;
          return (
            <g key={id} className={cls.join(' ')} data-node={id} data-type={n.type}>
              <polygon points={pts} />
              <text className="id" x={x - 31} y={y + 5} textAnchor="end">{id}</text>
              {val && <text className="val" x={x} y={vy + 4} textAnchor="middle" data-mark="node" data-value={val.value}>{val.bound ? `${val.bound}${val.value}` : val.value}</text>}
              {b && !val && (
                <text className="ab" x={x} y={y - (up ? 26 : 23)} textAnchor="middle" data-mark="bounds" data-value={`${showBound(b[0])},${showBound(b[1])}`}>[{showBound(b[0])}, {showBound(b[1])}]</text>
              )}
            </g>
          );
        })}
      </svg>
      <div className="gt-legend"><span>▲ MAX</span><span>▼ MIN</span></div>
      {M.mode === 'alphabeta' && f.kind !== 'setup' && (
        <div className="gt-stat">
          <span>{t('leaves not evaluated', 'frunze neevaluate')}: <b data-mark="skipped" data-value={st.skipped.length}>{st.skipped.length}</b> {t('of', 'din')} <span data-mark="total" data-value={T.leaves.length}>{T.leaves.length}</span></span>
        </div>
      )}
    </div>
  );
}

export default function GameTree({ props, predict }) {
  const { t } = useApp();
  const L = (x) => (x !== null && typeof x === 'object' ? t(x.en, x.ro) : String(x));
  const M = useMemo(() => gameTree(props), [props]);
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
  const label = M.mode === 'minimax' ? t('Minimax on a game tree', 'Minimax pe un arbore de joc') : t('Alpha-beta on a game tree', 'Alpha-beta pe un arbore de joc');
  return (
    <VizFrame widget="game-tree" stepper={stepper} caption={<p>{t(cap.en, cap.ro)}</p>} label={label}>
      <Stage M={M} k={s.step} answered={answered} />
      <PickBar spec={spec} picks={picks} onPick={onPick} t={t} L={L} />
    </VizFrame>
  );
}
