import React, { useCallback, useMemo, useState } from 'react';
import { useApp } from '../../../../contexts/AppContext';
import { useStepper } from '../kit.js';
import { VizFrame } from '../ui.jsx';
import { payoffMatrix } from '../logic/payoff-matrix.js';
import { PickBar, allAnswered } from './ml/mlParts.jsx';
import './payoff-matrix.css';

const ARROW = (from, to) => (to[0] < from[0] ? '↑' : to[0] > from[0] ? '↓' : to[1] < from[1] ? '←' : '→');

// One frame's table. `taps` is the set of indices the learner has tapped while the frame is still asked.
export function Stage({ M, k, answered = true, taps = [], onTap = null }) {
  const { t } = useApp();
  const f = M.frames[k];
  const st = M.state(k, answered);
  const asking = !answered && (f.kind === 'col' || f.kind === 'row');
  const has = (list, r, c) => list.some(([a, b]) => a === r && b === c);
  const dev = (r, c) => st.deviations.find((d) => d.to[0] === r && d.to[1] === c);
  return (
    <div className="pm">
      <table className="pm-table" aria-label={t('Payoff matrix', 'Matrice de câștiguri')}>
        <thead>
          <tr>
            <th className="row pm-corner" scope="col"><span className="pm-pa">{M.who.row} ↓</span><br /><span className="pm-pb">{M.who.col} →</span></th>
            {M.cols.map((c) => <th key={c} scope="col" data-mark="col" data-value={c}>{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {M.rows.map((rn, r) => (
            <tr key={rn}>
              <th scope="row" data-mark="row" data-value={rn}>{rn}</th>
              {M.cols.map((cn, c) => {
                const [a, b] = M.P[r][c];
                const markA = has(st.rowBest, r, c);
                const markB = has(st.colBest, r, c);
                const isNash = has(st.nash, r, c);
                const d = dev(r, c);
                const inFocus = (f.kind === 'col' && st.focusCol === c) || (f.kind === 'row' && st.focusRow === r);
                const idx = f.kind === 'col' ? r : c;
                const tapped = asking && inFocus && taps.includes(idx);
                const cls = ['pm-cell'];
                if (isNash) cls.push('nash');
                if (inFocus && !isNash) cls.push('focus');
                if (st.pair && r === st.pair[0]) cls.push('rowhl');
                if (st.pair && r === st.pair[1]) cls.push('rowhl2');
                const nums = (
                  <span className="pm-nums">
                    <span className={`pm-n a${markA ? ' mark' : ''}${d && d.player === 'row' ? ' worse' : ''}`} data-value={a} data-mark={markA ? 'best-a' : undefined}>{markA ? `[${a}]` : a}</span>
                    <span className={`pm-n b${markB ? ' mark' : ''}${d && d.player === 'col' ? ' worse' : ''}`} data-value={b} data-mark={markB ? 'best-b' : undefined}>{markB ? `[${b}]` : b}</span>
                  </span>
                );
                const label = `${rn}, ${cn}: ${a}, ${b}`;
                return (
                  <td key={cn} className={cls.join(' ')} data-cell={`${rn},${cn}`} data-nash={isNash ? 'true' : undefined}>
                    {asking && inFocus && onTap
                      ? <button type="button" className="pm-btn" aria-pressed={tapped} aria-label={label} onClick={() => onTap(idx)}>{nums}</button>
                      : nums}
                    {d && <span className="pm-arrow" aria-hidden="true" data-mark="deviation">{ARROW(d.from, d.to)}</span>}
                  </td>
                );
              })}
            </tr>
          ))}
          {M.mode === 'dominance' && (
            <tr className="pm-rel">
              <th scope="row">{M.rows[M.cmp.a]} ? {M.rows[M.cmp.b]}</th>
              {M.cols.map((cn, c) => {
                const rel = st.rels[c];
                return <td key={cn} className={rel ? (rel === '<' ? 'lt' : 'ge') : ''} data-mark="rel" data-value={rel || ''}>{rel || '?'}</td>;
              })}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function PayoffMatrix({ props, predict }) {
  const { t } = useApp();
  const L = (x) => (x !== null && typeof x === 'object' ? t(x.en, x.ro) : String(x));
  const M = useMemo(() => payoffMatrix(props), [props]);
  const hasAsks = !!predict;
  const s = useStepper(M.count, { predict, own: hasAsks });
  // picks: `d<k>` -> 'ge' | 'lt' (dominance); `k<k>` -> the indices confirmed (nash). taps: the unconfirmed selection of this frame.
  const [picks, setPicks] = useState({});
  const [tapsAt, setTapsAt] = useState({});
  const ask = predict ? M.ask(s.step) : null;
  const spec = predict ? M.pickSpec(s.step) : null;
  const specAnswered = (i) => allAnswered(predict ? M.pickSpec(i) : null, picks);
  const askAnswered = (i) => !(predict && M.ask(i)) || picks[`k${i}`] !== undefined;
  const answered = specAnswered(s.step) && askAnswered(s.step);
  const taps = tapsAt[s.step] || [];
  const onTap = useCallback((i) => setTapsAt((m) => {
    const cur = m[s.step] || [];
    return { ...m, [s.step]: cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i].sort((p, q) => p - q) };
  }), [s.step]);
  const confirm = () => { setPicks((p) => ({ ...p, [`k${s.step}`]: taps })); s.settle(); };
  const onPick = useCallback((key, id) => { setPicks((p) => ({ ...p, [key]: id })); s.settle(); }, [s]);
  const blocked = (to) => Array.from({ length: to }, (_, i) => i).some((i) => !(specAnswered(i) && askAnswered(i)));
  const stepper = {
    ...s,
    canNext: s.canNext && answered,
    goto: (to) => { if (to <= s.step || !blocked(to)) s.goto(to); },
    reset: () => { setPicks({}); setTapsAt({}); s.reset(); },
  };
  const cap = M.caption(s.step, { answered, picks });
  const label = M.mode === 'nash' ? t('Pure Nash equilibrium in a payoff matrix', 'Echilibrul Nash pur într-o matrice de câștiguri') : t('Dominant strategy in a payoff matrix', 'Strategia dominantă într-o matrice de câștiguri');
  const betweenCap = <p>{t(cap.en, cap.ro)}</p>;
  return (
    <VizFrame widget="payoff-matrix" stepper={stepper} caption={betweenCap} label={label}>
      <Stage M={M} k={s.step} answered={answered} taps={taps} onTap={ask && !answered ? onTap : null} />
      {ask && !answered && (
        <div className="mlv-picks" role="group">
          <p className="mlv-prompt">{t(ask.prompt.en, ask.prompt.ro)}</p>
          <button type="button" className="viz-btn viz-btn-primary" style={{ alignSelf: 'flex-start' }} disabled={!taps.length} onClick={confirm}>{t('Done', 'Gata')}</button>
        </div>
      )}
      <PickBar spec={spec} picks={picks} onPick={onPick} t={t} L={L} />
    </VizFrame>
  );
}
