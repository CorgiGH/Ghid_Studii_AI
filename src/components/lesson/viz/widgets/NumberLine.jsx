import React from 'react';
import { motion as Motion } from 'motion/react';
import { useApp } from '../../../../contexts/AppContext';
import { useStepper, useVizMotion } from '../kit.js';
import { VizFrame } from '../ui.jsx';
import { numberLines } from '../logic/number-line.js';
import { numberLineSql } from '../logic/oracle.js';
import { useOracleValues } from '../useSqlRunner.js';

const label = (x, digits) => (digits > 0 ? x.toFixed(digits) : String(x));

export default function NumberLine({ props, predict }) {
  const { t } = useApp();
  const m = useVizMotion();
  const digits = props.digits ?? 0;
  const N = numberLines(props);
  const s = useStepper(N.count, { predict });
  const k = s.step;
  const sql = numberLineSql(props);
  const oracle = useOracleValues(sql, 'facultate');
  const fnAt = k >= 1 ? props.fns[k - 1] : null;
  const dText = digits === 0 ? '' : `, ${digits}`;
  const hint = {
    CEIL: t('CEIL goes up to the next whole number.', 'CEIL urcă la următorul număr întreg.'),
    FLOOR: t('FLOOR goes down to the previous whole number.', 'FLOOR coboară la numărul întreg anterior.'),
    ROUND: t('ROUND goes to the nearest mark; exactly halfway goes away from zero.', 'ROUND merge la cea mai apropiată gradație; fix la jumătate merge departe de zero.'),
    TRUNC: t('TRUNC cuts the extra digits off, toward zero.', 'TRUNC taie cifrele în plus, spre zero.'),
  };
  const caption = k === 0
    ? (digits === 0 ? t('Each number sits between two whole numbers.', 'Fiecare număr stă între doi întregi.') : t(`The marks are ${digits > 0 ? `${Math.pow(10, -digits)} apart` : `${Math.pow(10, -digits)} apart (the digits left of the point)`}.`, `Gradațiile sunt la distanță de ${Math.pow(10, -digits)}${digits < 0 ? ' (cifrele din stânga virgulei)' : ''}.`))
    : hint[fnAt];
  return (
    <VizFrame widget="number-line" stepper={s} caption={caption} label={t('Rounding functions on a number line', 'Funcțiile de rotunjire pe axa numerelor')}>
      <div className="viz-lines">
        {N.lines.map((ln, li) => {
          const { lo, hi, ticks } = ln.window;
          const span = hi - lo;
          const pct = (x) => `${((Math.round(x / ln.window.unit) - lo) / span) * 100}%`;
          const vPct = `${((x => (Number(`${x}e${digits}`) - lo) / span * 100)(ln.value))}%`;
          const res = k >= 1 ? ln.results[k - 1] : null;
          const oracleVal = res && oracle.values ? oracle.values[li * props.fns.length + (k - 1)] : undefined;
          const shown = oracleVal !== undefined && oracleVal !== null && !Number.isNaN(Number(oracleVal)) ? Number(oracleVal) : res?.result;
          return (
            <div className="viz-line" key={li}>
              <div className="viz-line-track" role="img" aria-label={`${ln.value}`}>
                <div className="viz-line-axis" />
                {ticks.map((x, i) => (
                  <div key={i} className="viz-tick" style={{ left: `${(i / span) * 100}%` }}><i /><span>{label(x, Math.max(0, digits))}</span></div>
                ))}
                <div className="viz-dot-src" style={{ left: vPct }}><span>{ln.value}</span></div>
                {res && (
                  <Motion.div className="viz-dot-res" initial={false} animate={{ left: pct(shown) }} transition={m.soft}>
                    <span>{label(shown, Math.max(0, digits))}</span>
                  </Motion.div>
                )}
              </div>
              <div className="viz-line-fns">
                {ln.results.map((r, j) => (
                  <span key={j} className={`viz-fn${j === k - 1 ? ' cur' : ''}${j < k ? ' done' : ''}`}>
                    <code>{r.fn}({ln.value}{dText})</code>
                    <b>{j < k ? label(j === k - 1 ? shown : r.result, Math.max(0, digits)) : '?'}</b>
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </VizFrame>
  );
}
