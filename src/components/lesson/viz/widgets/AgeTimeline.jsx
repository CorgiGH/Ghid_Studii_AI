import React from 'react';
import { motion as Motion } from 'motion/react';
import { useApp } from '../../../../contexts/AppContext';
import { useStepper, useVizMotion } from '../kit.js';
import { VizFrame, CountUp } from '../ui.jsx';
import { ageArcCalls, ageCaptions, ageLabels, ageSteps, ageParts, ARC_AT, ticksLit } from '../logic/age-timeline.js';
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
  const cap = ageCaptions(L, parts, months)[k];
  const caption = t(cap.en, cap.ro);
  const calls = ageArcCalls(parts, k >= 1);
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
          { key: 'y', at: ARC_AT.y, val: parts.years, unit: t('years', 'ani'), fn: t(calls.y.en, calls.y.ro) },
          { key: 'm', at: ARC_AT.m, val: parts.months, unit: t('months', 'luni'), fn: t(calls.m.en, calls.m.ro) },
          { key: 'd', at: ARC_AT.d, val: parts.days, unit: t('days', 'zile'), fn: t(calls.d.en, calls.d.ro) },
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
