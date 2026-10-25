import React from 'react';
import { motion as Motion } from 'motion/react';
import { useApp } from '../../../../contexts/AppContext';
import { useStepper, useVizMotion } from '../kit.js';
import { VizFrame, CountUp } from '../ui.jsx';
import { ageLabels, ageSteps, ageParts, ARC_AT, ticksLit } from '../logic/age-timeline.js';
import { ageSql } from '../logic/oracle.js';
import { useOracleValues } from '../useSqlRunner.js';
import { parseDT, toUTC } from '../logic/common.js';

export default function AgeTimeline({ props, predict }) {
  const { t } = useApp();
  const m = useVizMotion();
  const A = ageSteps(props);
  const s = useStepper(A.count, { predict });
  const k = s.step;
  const oracle = useOracleValues(ageSql(props), 'facultate');
  const months = oracle.values && oracle.values[0] != null && !Number.isNaN(Number(oracle.values[0])) ? Number(oracle.values[0]) : A.months;
  const parts = ageParts(props, months);
  const L = ageLabels(props, parts);
  const b = parseDT(props.birth);
  const nowD = parseDT(props.today);
  const t0 = toUTC(b), t1 = toUTC(nowD);
  const pctOf = (ms) => ((ms - t0) / (t1 - t0 + (t1 - t0) * 0.04)) * 100;
  const birthdays = Array.from({ length: nowD.y - b.y + 1 }, (_, i) => ({ n: i, ms: Date.UTC(b.y + i, b.mo - 1, b.d) })).filter(x => x.ms <= t1 && x.n > 0);
  const caption = [
    t(`Born ${L.birth}, today is ${L.today}. How many years, months and days is that? Guess the number in each box.`, `Născut ${L.birth}, azi este ${L.today}. Câți ani, luni și zile sunt? Ghicește numărul din fiecare casetă.`),
    t(`MONTHS_BETWEEN counts whole months and adds the part of a month that has passed. TRUNC keeps ${parts.wholeMonths} whole months.`, `MONTHS_BETWEEN numără lunile întregi și adaugă partea de lună scursă. TRUNC păstrează ${parts.wholeMonths} luni întregi.`),
    t(`First box: ${parts.wholeMonths} months make ${parts.years} full years (${parts.years * 12} months). A birthday that has not come yet does not count.`, `Prima casetă: ${parts.wholeMonths} luni fac ${parts.years} ani împliniți (${parts.years * 12} luni). O zi de naștere care nu a venit încă nu se numără.`),
    t(`Second box: ${parts.months} months are left over after the years.`, `A doua casetă: după ani rămân ${parts.months} luni.`),
    t(`Third box: ADD_MONTHS(birth, ${parts.wholeMonths}) is ${L.anchor}. From there to today are ${parts.days} days. Age: ${parts.years} years, ${parts.months} months, ${parts.days} days.`, `A treia casetă: ADD_MONTHS(nașterea, ${parts.wholeMonths}) este ${L.anchor}. De acolo până azi sunt ${parts.days} zile. Vârsta: ${parts.years} ani, ${parts.months} luni, ${parts.days} zile.`),
  ][k];
  return (
    <VizFrame widget="age-timeline" stepper={s} caption={caption} label={t('Age on a timeline', 'Vârsta pe o axă a timpului')}>
      <div className="viz-timeline" role="img" aria-label={`${L.birth} - ${L.today}`}>
        <div className="viz-tl-track" />
        <Motion.div className="viz-tl-fill" initial={false} animate={{ width: k >= 1 ? `${pctOf(t1)}%` : '0%' }} transition={m.reduced ? { duration: 0 } : { duration: 0.9, ease: [0.22, 1, 0.36, 1] }} />
        {birthdays.map((x) => (
          <Motion.i key={x.n} className={`viz-tl-tick${ticksLit(k) ? ' full' : ''}`} style={{ left: `${pctOf(x.ms)}%` }}
            initial={false} animate={{ opacity: ticksLit(k) ? 1 : 0.55, scaleY: ticksLit(k) ? 1.5 : 1 }} transition={m.reduced ? { duration: 0 } : { delay: ticksLit(k) ? x.n * 0.025 : 0 }} />
        ))}
        <div className="viz-tl-pt birth" style={{ left: 0 }}><i /><span>{L.birth}</span></div>
        <div className="viz-tl-pt today" style={{ left: `${pctOf(t1)}%` }}><i /><span>{L.today}</span></div>
      </div>
      <div className="viz-arcs" role="img" aria-label={`${parts.years} ${t('years', 'ani')}, ${parts.months} ${t('months', 'luni')}, ${parts.days} ${t('days', 'zile')}`}>
        {[
          { key: 'y', at: ARC_AT.y, val: parts.years, unit: t('years', 'ani'), fn: 'TRUNC(MONTHS_BETWEEN / 12)' },
          { key: 'm', at: ARC_AT.m, val: parts.months, unit: t('months', 'luni'), fn: 'MOD(…, 12)' },
          { key: 'd', at: ARC_AT.d, val: parts.days, unit: t('days', 'zile'), fn: 'today − ADD_MONTHS' },
        ].map(a => (
          <Motion.div key={a.key} className={`viz-arc ${a.key}${k >= a.at ? ' on' : ''}`} initial={false}
            animate={{ scaleX: k >= a.at ? 1 : 0.94, opacity: k >= a.at ? 1 : 0.55 }} transition={m.spring} style={{ transformOrigin: 'left center' }}>
            <code>{a.fn}</code>
            <b>{k >= a.at ? <CountUp key={a.key} to={a.val} /> : '?'}</b>
            <i>{a.unit}</i>
          </Motion.div>
        ))}
      </div>
      <div className="viz-result"><code>MONTHS_BETWEEN</code><b>{k >= 1 ? <CountUp key="mb" to={months} digits={3} /> : '?'}</b><span className="viz-dim">{t('months', 'luni')}</span></div>
    </VizFrame>
  );
}
