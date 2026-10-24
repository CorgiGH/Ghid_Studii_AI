import React from 'react';
import { motion as Motion } from 'motion/react';
import { useApp } from '../../../../contexts/AppContext';
import { useStepper, useVizMotion } from '../kit.js';
import { VizFrame, ValueChips } from '../ui.jsx';
import { inBetween } from '../logic/in-between.js';

const mark = (o) => (o === true ? '✓' : o === false ? '✗' : '?');

export default function InBetween({ props, predict }) {
  const { t } = useApp();
  const m = useVizMotion();
  const { mode, values } = props;
  const s = useStepper(values.length + 1, { predict });
  const k = s.step;
  const results = values.map(v => inBetween(mode, props, v));
  const verdicts = results.map(r => r.result);
  const cur = k >= 1 ? results[k - 1] : null;
  const value = k >= 1 ? values[k - 1] : null;
  const op = mode === 'in' ? '=' : (props.op || '=');
  const word = { in: 'IN', between: 'BETWEEN', any: `${op} ANY`, all: `${op} ALL` }[mode];
  const combine = mode === 'all' ? t('all must be true (and)', 'toate trebuie să fie adevărate (și)') : t('one true is enough (or)', 'una adevărată e de ajuns (sau)');
  const selected = verdicts.filter(v => v === true).length;

  const caption = k === 0
    ? (mode === 'between'
      ? t(`BETWEEN ${props.low} AND ${props.high} is a ruler with both ends included.`, `BETWEEN ${props.low} AND ${props.high} este o riglă cu ambele capete incluse.`)
      : t(`${word} (${props.list.join(', ')}): each value is tried against every drawer; ${combine}.`, `${word} (${props.list.join(', ')}): fiecare valoare se încearcă la fiecare sertar; ${combine}.`))
    : cur.result === null
      ? t(`${value === null ? 'NULL' : value}: a comparison with NULL is never true and never false. It is unknown, so the row is not selected.`, `${value === null ? 'NULL' : value}: o comparație cu NULL nu e nici adevărată, nici falsă. E necunoscută, deci rândul nu este ales.`)
      : cur.result
        ? t(`${value}: selected.`, `${value}: ales.`)
        : t(`${value}: not selected.`, `${value}: nu e ales.`);

  // ruler geometry for BETWEEN
  const nums = mode === 'between' ? values.filter(v => typeof v === 'number').concat([props.low, props.high]) : [];
  const lo = mode === 'between' ? Math.min(...nums) : 0;
  const hi = mode === 'between' ? Math.max(...nums) : 1;
  const pad = (hi - lo) * 0.12 || 1;
  const pos = (x) => `${((x - (lo - pad)) / (hi - lo + 2 * pad)) * 100}%`;

  return (
    <VizFrame widget="in-between" stepper={s} caption={caption} label={t(`${word} step by step`, `${word} pas cu pas`)}>
      {mode === 'between' ? (
        <div className="viz-ruler" role="img" aria-label={`BETWEEN ${props.low} AND ${props.high}`}>
          <div className="viz-ruler-track" />
          <div className="viz-ruler-span" style={{ left: pos(props.low), width: `calc(${pos(props.high)} - ${pos(props.low)})` }} />
          {[props.low, props.high].map((x, i) => (
            <div key={i} className="viz-ruler-end" style={{ left: pos(x) }}><i /><span>{x}</span></div>
          ))}
          {typeof value === 'number' && (
            <Motion.div className={`viz-ruler-dot ${cur.result ? 'yes' : 'no'}`} initial={false} animate={{ left: pos(value) }} transition={m.soft}>
              <span>{value}</span>
            </Motion.div>
          )}
          {k >= 1 && value === null && <Motion.div className="viz-ruler-null" variants={m.v.pop} initial="hidden" animate="show">NULL ?</Motion.div>}
        </div>
      ) : (
        <div className="viz-drawers">
          {props.list.map((x, i) => {
            const c = cur ? cur.checks[i] : null;
            return (
              <div key={i} className={`viz-drawer${c ? (c.outcome === true ? ' yes' : c.outcome === false ? ' no' : ' unk') : ''}`}>
                <span className="viz-drawer-val">{String(x)}</span>
                {c && <Motion.span key={`${k}-${i}`} className="viz-drawer-mark" variants={m.v.pop} initial="hidden" animate="show" custom={i}>{mark(c.outcome)}</Motion.span>}
              </div>
            );
          })}
        </div>
      )}
      {k >= 1 && (
        <Motion.div key={k} className="viz-combine" variants={m.v.enter} initial="hidden" animate="show" custom={props.list?.length || 2}>
          {mode === 'between'
            ? <><code>{props.low} ≤ {value === null ? 'NULL' : value} ≤ {props.high}</code></>
            : <><code>{value === null ? 'NULL' : value} {op} {mode === 'all' ? 'ALL' : mode === 'any' ? 'ANY' : 'IN'}</code></>}
          <span className={`viz-badge ${cur.result === true ? 'yes' : cur.result === false ? 'no' : ''}`}>{cur.result === true ? t('true', 'adevărat') : cur.result === false ? t('false', 'fals') : t('unknown', 'necunoscut')}</span>
        </Motion.div>
      )}
      <ValueChips items={values} step={k} verdicts={verdicts} onPick={s.goto} />
      {k === values.length && <div className="viz-dim viz-note">{t(`${selected} of ${values.length} rows selected.`, `${selected} din ${values.length} rânduri alese.`)}</div>}
    </VizFrame>
  );
}
