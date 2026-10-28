import React, { useCallback, useMemo, useState } from 'react';
import { useApp } from '../../../../../contexts/AppContext';
import { useStepper } from '../../kit.js';
import { VizFrame } from '../../ui.jsx';
import { dupModel, tupleText } from '../../logic/ml/dup-counter.js';
import { fmtDec } from '../../logic/ml/id3-common.js';
import { PickBar, Val, allAnswered } from './mlParts.jsx';

export function DupStage({ model: M, k, predict }) {
  const { t } = useApp();
  const L = (x) => (x !== null && typeof x === 'object' ? t(x.en, x.ro) : String(x));
  const f = M.frames[k];
  const idx = f.kind === 'base' ? 0 : f.kind === 'add' ? f.j : M.m;
  const state = M.states[idx];
  const prev = f.kind === 'add' ? M.states[f.j - 1] : null;
  const newRow = prev ? prev.n : -1;
  const contra = new Set(state.contradictory.flatMap((g) => g.rows));
  const ghost = predict && k < M.m ? M.added[k] : null;
  const g = prev ? M.groupOfRow(state, newRow) : null;
  const up = prev && state.errs > prev.errs;
  const summary = f.kind === 'summary';
  const header = M.names.map((_, i) => L(M.headers[i]));
  return (
    <div className="mlv-stack">
      <div className="viz-tablewrap mlv-table">
        <table className="viz-table">
          <thead><tr>{header.map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
          <tbody>
            {state.rows.map((r, i) => (
              <tr key={i} className={i === newRow ? 'mlv-new' : contra.has(i) ? 'mlv-contra' : ''}>
                {r.map((c, j) => <td key={j} data-value={String(c)}>{String(c)}</td>)}
              </tr>
            ))}
            {ghost && <tr className="mlv-ghost">{ghost.map((c, j) => <td key={j}>{String(c)}</td>)}</tr>}
          </tbody>
        </table>
      </div>
      <div className={`mlv-counter${up ? ' up' : ''}`}>
        <span>{t('Smallest error count', 'Cele mai puține rânduri greșite')}</span>
        {prev && <><b className="mlv-dim" data-value={String(prev.errs)}>{prev.errs}</b><span className="mlv-dim">/</span><b className="mlv-dim" data-value={String(prev.n)}>{prev.n}</b><span aria-hidden="true">{'→'}</span></>}
        <b data-value={String(state.errs)}>{state.errs}</b><span>/</span><b data-value={String(state.n)}>{state.n}</b>
        {summary && <span>= <Val v={fmtDec(state.errs / state.n)} /></span>}
      </div>
      {g && (
        <div className="mlv-group">
          <Val v={tupleText(g.vals)} />
          <span>{t('appears', 'apare')} <Val v={String(g.n)} /> {t('time(s)', 'ori')}:</span>
          {g.labels.map((l, i) => <span key={i}><Val v={String(l)} /> {'×'} <Val v={String(g.counts[i])} /></span>)}
          {g.errs > 0 && <span>{t('wrong on', 'greșește pe')} <Val v={String(g.errs)} /></span>}
        </div>
      )}
      {summary && state.contradictory.length > 0 && (
        <div className="viz-tablewrap">
          <table className="viz-table">
            <thead><tr><th>{t('inputs', 'intrări')}</th><th>{t('rows', 'rânduri')}</th><th>{t('most frequent', 'cea mai frecventă')}</th><th>{t('wrong', 'greșite')}</th></tr></thead>
            <tbody>
              {state.contradictory.map((cg) => (
                <tr key={cg.key}>
                  <td><Val v={tupleText(cg.vals)} /></td>
                  <td><Val v={String(cg.n)} /></td>
                  <td><Val v={String(cg.max)} /></td>
                  <td><Val v={String(cg.errs)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function DupCounter({ props, predict }) {
  const { t } = useApp();
  const L = (x) => (x !== null && typeof x === 'object' ? t(x.en, x.ro) : String(x));
  const model = useMemo(() => dupModel(props), [props]);
  const hasPicks = useMemo(() => !!predict && model.frames.some((_, k) => model.pickSpec(k, true)), [model, predict]);
  const s = useStepper(model.count, { predict, own: hasPicks });
  const [picks, setPicks] = useState({});
  const spec = predict ? model.pickSpec(s.step, true) : null;
  const answered = allAnswered(spec, picks);
  const onPick = useCallback((key, id) => { setPicks((p) => ({ ...p, [key]: id })); s.settle(); }, [s]);
  const blocked = (to) => Array.from({ length: to }, (_, i) => i).some((i) => !allAnswered(predict ? model.pickSpec(i, true) : null, picks));
  const stepper = {
    ...s,
    canNext: s.canNext && answered,
    goto: (to) => { if (to <= s.step || !blocked(to)) s.goto(to); },
    reset: () => { setPicks({}); s.reset(); },
  };
  const cap = model.caption(s.step, { predict: !!predict, picks });
  return (
    <VizFrame widget="ml-dup-counter" stepper={stepper} caption={t(cap.en, cap.ro)} label={t('Duplicate and contradictory rows', 'Rânduri duplicate și contradictorii')}>
      <DupStage model={model} k={s.step} predict={!!predict} />
      <PickBar spec={spec} picks={picks} onPick={onPick} t={t} L={L} />
    </VizFrame>
  );
}
