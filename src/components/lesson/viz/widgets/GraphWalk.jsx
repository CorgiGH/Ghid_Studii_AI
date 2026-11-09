import React, { useCallback, useId, useMemo, useState } from 'react';
import { useApp } from '../../../../contexts/AppContext';
import { useStepper } from '../kit.js';
import { MiniTable, ValueChips, VizFrame } from '../ui.jsx';
import { graphModel } from '../logic/graph/index.js';
import { answered, boxOf, confirmKey, feedback, judge } from '../logic/graph/common.js';
import { PickBar } from './ml/mlParts.jsx';
import './graph-walk.css';

const R = 19; // node radius in the picture's own units

// u_a, a_si, X_k, u_j*, V_s, x^k: the subscripts of the course's notation, drawn as subscripts
const NOTATION = /(?<![A-Za-z])([uαβaXV])_\{?([A-Za-z0-9*]+)\}?(?:\^(?:\{([^}]+)\}|([A-Za-z0-9]+)))?/g;
// eslint-disable-next-line react-refresh/only-export-components -- a tiny helper that belongs with the widget
export function notation(text) {
  const out = [];
  let last = 0;
  let i = 0;
  for (const m of String(text).matchAll(NOTATION)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(<span key={i++} className="gw-sym"><i>{m[1]}</i><sub>{m[2]}</sub>{m[3] || m[4] ? <sup>{m[3] || m[4]}</sup> : null}</span>);
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

const unit = (a, b) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const d = Math.hypot(dx, dy) || 1;
  return { x: dx / d, y: dy / d, d };
};

function Label({ node, L }) {
  const l = node.label;
  if (!l) return null;
  // under the node, or over it (lab: 'above') when an edge runs down from the node
  const ly = node.above ? node.y - R - 24 : node.y + R + 17;
  const sy = node.above ? node.y - R - 8 : node.y + R + 34;
  return (
    <>
      <text className="gw-lab" x={node.x} y={ly} textAnchor="middle" data-label={l.items.map((i) => i.t).join(',')}>
        {l.open}
        {l.items.map((it, i) => (
          <React.Fragment key={i}>
            <tspan className={`${it.struck ? 'struck' : ''}${it.hl ? ' hl' : ''}`}>{it.t}</tspan>
            {i < l.items.length - 1 ? <tspan>{', '}</tspan> : null}
          </React.Fragment>
        ))}
        {l.close}
      </text>
      {node.sub && <text className="gw-sub" x={node.x} y={sy} textAnchor="middle">{typeof node.sub === 'string' ? node.sub : L(node.sub)}</text>}
    </>
  );
}

function Graph({ scene, box, pos, label, L }) {
  const uid = useId().replace(/[^A-Za-z0-9]/g, '');
  const mk = (c) => `gw-ah-${uid}-${c || 'n'}`;
  return (
    <svg className="gw-svg" viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`} role="img" aria-label={label}>
      <defs>
        {['', 'hl', 'ok', 'bad', 'arc', 'dim', 'cut', 'target'].map((c) => (
          <marker key={c || 'n'} id={mk(c)} viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="11" markerHeight="11" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" className={`gw-ah ${c}`} />
          </marker>
        ))}
      </defs>
      {scene.edges.map((e, i) => {
        const a = pos[e.u];
        const b = pos[e.v];
        const u = unit(a, b);
        const x1 = a.x + u.x * R;
        const y1 = a.y + u.y * R;
        const x2 = b.x - u.x * (R + (e.arrow ? 3 : 0));
        const y2 = b.y - u.y * (R + (e.arrow ? 3 : 0));
        // a weight sits on one side of its arc; a constraint text on the other, where the AC-3 arc is not drawn
        const side = e.text ? -1 : 1;
        const mx = (a.x + b.x) / 2 - u.y * 12 * side;
        const my = (a.y + b.y) / 2 + u.x * 12 * side;
        return (
          <g key={i} data-edge={`${e.u}-${e.v}`}>
            <line className={`gw-edge ${e.cls || ''}`} x1={x1} y1={y1} x2={x2} y2={y2} markerEnd={e.arrow ? `url(#${mk(e.cls)})` : undefined} />
            {(e.w !== undefined || e.text) && <text className={`gw-w ${e.cls || ''}`} x={mx} y={my} textAnchor="middle" dominantBaseline="middle">{e.w !== undefined ? e.w : e.text}</text>}
          </g>
        );
      })}
      {scene.arc && (() => {
        const a = pos[scene.arc[0]];
        const b = pos[scene.arc[1]];
        const u = unit(a, b);
        // the bulge side comes from the stored edge, not from the arc's direction, so (B, A) bends the same way as (A, B):
        // away from the constraint text that sits on the other side of the edge
        const ed = scene.edges.find((e) => (e.u === scene.arc[0] && e.v === scene.arc[1]) || (e.u === scene.arc[1] && e.v === scene.arc[0]));
        const sd = ed ? unit(pos[ed.u], pos[ed.v]) : u;
        const nx = -sd.y;
        const ny = sd.x;
        const sx = a.x + u.x * (R + 2) + nx * 7;
        const sy = a.y + u.y * (R + 2) + ny * 7;
        const ex = b.x - u.x * (R + 5) + nx * 7;
        const ey = b.y - u.y * (R + 5) + ny * 7;
        const cx = (a.x + b.x) / 2 + nx * 30;
        const cy = (a.y + b.y) / 2 + ny * 30;
        return <path className="gw-arcpath" d={`M${sx} ${sy} Q${cx} ${cy} ${ex} ${ey}`} markerEnd={`url(#${mk('arc')})`} data-arc={scene.arc.join('>')} />;
      })()}
      {scene.nodes.map((n) => (
        <g key={n.id} data-node={n.id} data-state={n.cls || 'plain'}>
          <circle className={`gw-node ${n.cls || ''}`} cx={n.x} cy={n.y} r={R} />
          <text className="gw-id" x={n.x} y={n.y} textAnchor="middle" dominantBaseline="central">{n.id}</text>
          <Label node={n} L={L} />
        </g>
      ))}
    </svg>
  );
}

function MultiPick({ item, picks, onToggle, onConfirm, L, t }) {
  const sel = picks[item.key] || [];
  const done = picks[confirmKey(item.key)] === true;
  const ok = done && judge(item, sel);
  const mark = (id) => {
    if (!done) return '';
    const inAns = item.answer.includes(id);
    const on = sel.includes(id);
    return on && inAns ? ' right' : on ? ' wrong' : inAns ? ' miss' : '';
  };
  return (
    <div className={`gw-pick ${done ? (ok ? 'ok' : 'bad') : ''}`}>
      <div className="mlv-picks" role="group">
        <div className="mlv-stack">
          <p className="mlv-prompt">{notation(t(item.prompt.en, item.prompt.ro))}</p>
          {item.options.length > 0 && (
            <div className="mlv-opts">
              {item.options.map((o) => (
                <button key={o.id} type="button" className={`mlv-opt${mark(o.id)}`} aria-pressed={sel.includes(o.id)} onClick={() => onToggle(item.key, o.id)}>{L(o.label)}</button>
              ))}
            </div>
          )}
          <div className="mlv-opts">
            <button type="button" className="mlv-opt gw-confirm" onClick={() => onConfirm(item.key)}>{sel.length ? L(item.confirm.some) : L(item.confirm.none)}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Picks({ spec, picks, onPick, onToggle, onConfirm, t, L }) {
  if (!spec) return null;
  return (
    <div className="gw-picks">
      {spec.items.map((it) => {
        const pick = picks[it.key];
        const isDone = it.kind === 'multi' ? picks[confirmKey(it.key)] === true : pick !== undefined;
        const fb = isDone ? feedback(it, pick) : null;
        return (
          <div key={it.key}>
            {it.kind === 'multi'
              ? <MultiPick item={it} picks={picks} onToggle={onToggle} onConfirm={onConfirm} L={L} t={t} />
              : <div className={`gw-pick ${fb ? (fb.ok ? 'ok' : 'bad') : ''}`}><PickBar spec={{ items: [it] }} picks={picks} onPick={onPick} t={(en, ro) => notation(t(en, ro))} L={L} /></div>}
            {fb && fb.msg && <p className={`gw-fb ${fb.ok ? 'ok' : 'bad'}`} role="status"><span aria-hidden="true">{fb.ok ? '✓ ' : '✗ '}</span>{notation(t(fb.msg.en, fb.msg.ro))}</p>}
          </div>
        );
      })}
    </div>
  );
}

const COLS = { k: { en: 'Round', ro: 'Runda' }, fix: { en: 'Fixed', ro: 'Fixat' } };

// eslint-disable-next-line react-refresh/only-export-components -- exported for the render tests
export function useGraphModel(props) {
  return useMemo(() => graphModel(props), [props]);
}

export function Stage({ model, k, picks, spec, onPick, onToggle, onConfirm }) {
  const { t } = useApp();
  const L = (x) => (x !== null && typeof x === 'object' ? t(x.en, x.ro) : String(x));
  const scene = model.scene(k, { pending: !answered(spec, picks) });
  const box = useMemo(() => boxOf(model.nodes), [model.nodes]);
  const pos = useMemo(() => Object.fromEntries(model.nodes.map((n) => [n.id, n])), [model.nodes]);
  const heads = scene.table?.heads;
  const colLabel = (c) => (heads && c in heads ? notation(L(heads[c])) : COLS[c] ? L(COLS[c]) : notation(`u_${c.slice(2)}`));
  return (
    <div className="gw-stage">
      <Graph scene={scene} box={box} pos={pos} label={t('Graph', 'Graf')} L={L} />
      {scene.log && <p className="gw-log">{notation(L(scene.log))}</p>}
      {scene.strips?.map((s, i) => (
        <div key={i} className="gw-strip">
          <span className="gw-strip-t">{L(s.title)}</span>
          <div className="gw-chips" data-queue={s.chips.map((c) => c.t).join(' ')}>
            {s.chips.length === 0 ? <span className="gw-empty">{L(s.empty)}</span> : s.chips.map((c, j) => <span key={j} className={`viz-chip gw-chip ${c.cls}`}>{c.t}</span>)}
          </div>
        </div>
      ))}
      {scene.chips && (
        <div className="gw-strip">
          <span className="gw-strip-t">{L(scene.chips.title)}</span>
          <ValueChips items={scene.chips.items} step={scene.chips.items.length + 1} verdicts={scene.chips.verdicts} readOnly className="gw-vchips" />
        </div>
      )}
      {scene.table && (
        <MiniTable
          columns={scene.table.columns}
          rows={scene.table.rows}
          rowClass={(i) => (scene.table.rowCls ? scene.table.rowCls[i] : i === scene.table.hlRow ? 'pick' : '')}
          colLabel={colLabel}
          fmt={(v) => v}
        />
      )}
      <Picks spec={spec} picks={picks} onPick={onPick} onToggle={onToggle} onConfirm={onConfirm} t={t} L={L} />
    </div>
  );
}

export default function GraphWalk({ props, predict }) {
  const { t } = useApp();
  const model = useGraphModel(props);
  const hasPicks = useMemo(() => !!predict && model.frames.some((_, k) => model.pickSpec(k, true)), [model, predict]);
  const s = useStepper(model.count, { predict, own: hasPicks });
  const [picks, setPicks] = useState({});
  const spec = predict ? model.pickSpec(s.step, true) : null;
  const ok = answered(spec, picks);
  const onPick = useCallback((key, id) => { setPicks((p) => ({ ...p, [key]: id })); s.settle(); }, [s]);
  const onToggle = useCallback((key, id) => {
    setPicks((p) => {
      const cur = p[key] || [];
      return { ...p, [key]: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id], [confirmKey(key)]: false };
    });
  }, []);
  const onConfirm = useCallback((key) => { setPicks((p) => ({ ...p, [key]: p[key] || [], [confirmKey(key)]: true })); s.settle(); }, [s]);
  const blocked = (to) => Array.from({ length: to }, (_, i) => i).some((i) => !answered(predict ? model.pickSpec(i, true) : null, picks));
  const stepper = {
    ...s,
    canNext: s.canNext && ok,
    goto: (to) => { if (to <= s.step || !blocked(to)) s.goto(to); },
    reset: () => { setPicks({}); s.reset(); },
  };
  const cap = model.caption(s.step, { pending: !ok });
  return (
    <VizFrame widget="graph-walk" stepper={stepper} caption={notation(t(cap.en, cap.ro))} label={t('Walk through a graph algorithm', 'Parcurgerea unui algoritm pe graf')}>
      <Stage model={model} k={s.step} picks={picks} spec={spec} onPick={onPick} onToggle={onToggle} onConfirm={onConfirm} />
    </VizFrame>
  );
}
