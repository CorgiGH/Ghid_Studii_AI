import React, { useState } from 'react';
import { motion as Motion } from 'motion/react';
import { useApp } from '../../../../contexts/AppContext';
import { useStepper, useVizMotion } from '../kit.js';
import { VizFrame } from '../ui.jsx';
import { numberLines, pickIsRight } from '../logic/number-line.js';
import { numberLineSql } from '../logic/oracle.js';
import { useOracleValues } from '../useSqlRunner.js';

const label = (x, digits) => (digits > 0 ? x.toFixed(digits) : String(x));

export default function NumberLine({ props, predict }) {
  const { t } = useApp();
  const m = useVizMotion();
  const digits = props.digits ?? 0;
  const N = numberLines(props);
  const s = useStepper(N.count, { predict, own: true });
  const k = s.step;
  const sql = numberLineSql(props);
  const oracle = useOracleValues(sql, 'facultate');
  const fnAt = k >= 1 ? props.fns[k - 1] : null;
  // With predict on, the learner picks a mark for each line before the number moves there.
  // picks: `${step}:${line}` -> the mark chosen; shownSteps: steps whose answers were asked for.
  const [picks, setPicks] = useState({});
  const [shownSteps, setShownSteps] = useState({});
  const asking = (li) => predict && k >= 1 && picks[`${k}:${li}`] === undefined && !shownSteps[k];
  const anyAsking = N.lines.some((_, li) => asking(li));
  // Next waits while a line still asks for its pick; "Show" is the skip.
  const stepper = { ...s, canNext: s.canNext && !anyAsking, reset: () => { setPicks({}); setShownSteps({}); s.reset(); } };
  const dText = digits === 0 ? '' : `, ${digits}`;
  const hint = {
    CEIL: t('CEIL goes up to the next whole number.', 'CEIL urcă la următorul număr întreg.'),
    FLOOR: t('FLOOR goes down to the previous whole number.', 'FLOOR coboară la numărul întreg anterior.'),
    ROUND: t('ROUND goes to the nearest mark; exactly halfway goes away from zero.', 'ROUND merge la cea mai apropiată gradație; fix la jumătate merge departe de zero.'),
    TRUNC: t('TRUNC cuts the extra digits off, toward zero.', 'TRUNC taie cifrele în plus, spre zero.'),
  };
  const caption = anyAsking
    ? t(`Where does the number land with ${fnAt}? Click a mark on each line, then press Show.`, `Unde ajunge numărul cu ${fnAt}? Apasă pe o gradație la fiecare axă, apoi apasă Arată.`)
    : k === 0
    ? (digits === 0 ? t('Each number sits between two whole numbers.', 'Fiecare număr stă între doi întregi.') : t(`The marks are ${digits > 0 ? `${Math.pow(10, -digits)} apart` : `${Math.pow(10, -digits)} apart (the digits left of the point)`}.`, `Gradațiile sunt la distanță de ${Math.pow(10, -digits)}${digits < 0 ? ' (cifrele din stânga virgulei)' : ''}.`))
    : hint[fnAt];
  return (
    <VizFrame widget="number-line" stepper={stepper} caption={caption} label={t('Rounding functions on a number line', 'Funcțiile de rotunjire pe axa numerelor')}>
      <div className="viz-lines">
        {N.lines.map((ln, li) => {
          const { lo, hi, ticks } = ln.window;
          const span = hi - lo;
          const pct = (x) => `${((Math.round(x / ln.window.unit) - lo) / span) * 100}%`;
          const vPct = `${((x => (Number(`${x}e${digits}`) - lo) / span * 100)(ln.value))}%`;
          const res = k >= 1 && !asking(li) ? ln.results[k - 1] : null;
          const picked = k >= 1 ? picks[`${k}:${li}`] : undefined;
          const oracleVal = res && oracle.values ? oracle.values[li * props.fns.length + (k - 1)] : undefined;
          const shown = oracleVal !== undefined && oracleVal !== null && !Number.isNaN(Number(oracleVal)) ? Number(oracleVal) : res?.result;
          return (
            <div className="viz-line" key={li}>
              <div className="viz-line-track" role="img" aria-label={`${ln.value}`}>
                <div className="viz-line-axis" />
                {ticks.map((x, i) => {
                  const mark = picked !== undefined && pickIsRight(ln.value, fnAt, digits, x) ? ' right' : picked === x ? ' wrong' : '';
                  return asking(li)
                    ? (
                      <button key={i} type="button" className="viz-tick can-pick" style={{ left: `${(i / span) * 100}%` }}
                        aria-label={t(`${ln.value} lands on ${label(x, Math.max(0, digits))}`, `${ln.value} ajunge la ${label(x, Math.max(0, digits))}`)}
                        onClick={() => { setPicks(p => ({ ...p, [`${k}:${li}`]: x })); s.settle(); }}>
                        <i /><span>{label(x, Math.max(0, digits))}</span>
                      </button>
                    )
                    : <div key={i} className={`viz-tick${mark}`} style={{ left: `${(i / span) * 100}%` }}><i /><span>{label(x, Math.max(0, digits))}</span></div>;
                })}
                <div className="viz-dot-src" style={{ left: vPct }}><span>{ln.value}</span></div>
                {res && (
                  <Motion.div className="viz-dot-res" initial={{ left: vPct }} animate={{ left: pct(shown) }} transition={m.soft}>
                    <span>{label(shown, Math.max(0, digits))}</span>
                  </Motion.div>
                )}
              </div>
              <div className="viz-line-fns">
                {ln.results.map((r, j) => (
                  <span key={j} className={`viz-fn${j === k - 1 ? ' cur' : ''}${j < k ? ' done' : ''}`}>
                    <code>{r.fn}({ln.value}{dText})</code>
                    <b>{j < k && !(j === k - 1 && asking(li)) ? label(j === k - 1 ? shown : r.result, Math.max(0, digits)) : '?'}</b>
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {anyAsking && (
        <button type="button" className="viz-btn viz-numline-show" onClick={() => { setShownSteps(v => ({ ...v, [k]: true })); s.settle(); }}>{t('Show', 'Arată')}</button>
      )}
    </VizFrame>
  );
}
