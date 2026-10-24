import React from 'react';
import { motion as Motion } from 'motion/react';
import { useApp } from '../../../../contexts/AppContext';
import { useStepper, useVizMotion } from '../kit.js';
import { VizFrame, CountUp } from '../ui.jsx';
import { ageSteps } from '../logic/age-timeline.js';
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
  const years = months / 12;
  const age = Math.floor(years);
  const b = parseDT(props.birth);
  const nowD = parseDT(props.today);
  const t0 = toUTC(b), t1 = toUTC(nowD);
  const pctOf = (ms) => ((ms - t0) / (t1 - t0 + (t1 - t0) * 0.04)) * 100;
  const birthdays = Array.from({ length: nowD.y - b.y + 1 }, (_, i) => ({ n: i, ms: Date.UTC(b.y + i, b.mo - 1, b.d) })).filter(x => x.ms <= t1 && x.n > 0);
  const caption = [
    t(`Born ${props.birth}, today is ${props.today}. How old is that, in whole years?`, `Născut ${props.birth}, azi este ${props.today}. Câți ani împliniți sunt?`),
    t('MONTHS_BETWEEN counts whole months and adds the part of a month that has passed since the last day-of-month match.', 'MONTHS_BETWEEN numără lunile întregi și adaugă partea de lună scursă de la ultima potrivire a zilei din lună.'),
    t('Twelve months make a year: divide by 12.', 'Douăsprezece luni fac un an: împarte la 12.'),
    t(`FLOOR keeps the full years only: ${age}. A birthday that has not come yet does not count.`, `FLOOR păstrează doar anii împliniți: ${age}. O zi de naștere care nu a venit încă nu se numără.`),
  ][k];
  return (
    <VizFrame widget="age-timeline" stepper={s} caption={caption} label={t('Age on a timeline', 'Vârsta pe o axă a timpului')}>
      <div className="viz-timeline" role="img" aria-label={`${props.birth} - ${props.today}`}>
        <div className="viz-tl-track" />
        <Motion.div className="viz-tl-fill" initial={false} animate={{ width: k >= 1 ? `${pctOf(t1)}%` : '0%' }} transition={m.reduced ? { duration: 0 } : { duration: 0.9, ease: [0.22, 1, 0.36, 1] }} />
        {birthdays.map((x) => (
          <Motion.i key={x.n} className={`viz-tl-tick${k >= 3 ? ' full' : ''}`} style={{ left: `${pctOf(x.ms)}%` }}
            initial={false} animate={{ opacity: k >= 3 ? 1 : 0.55, scaleY: k >= 3 ? 1.5 : 1 }} transition={m.reduced ? { duration: 0 } : { delay: k >= 3 ? x.n * 0.025 : 0 }} />
        ))}
        <div className="viz-tl-pt birth" style={{ left: 0 }}><i /><span>{props.birth}</span></div>
        <div className="viz-tl-pt today" style={{ left: `${pctOf(t1)}%` }}><i /><span>{props.today.slice(0, 10)}</span></div>
      </div>
      <div className="viz-ageflow">
        <div className={`viz-agebox${k >= 1 ? ' on' : ''}`}><code>MONTHS_BETWEEN</code><b>{k >= 1 ? <CountUp key={`m${k >= 1}`} to={months} digits={3} /> : '?'}</b><i>{t('months', 'luni')}</i></div>
        <span className="viz-arrow" aria-hidden="true">÷ 12</span>
        <div className={`viz-agebox${k >= 2 ? ' on' : ''}`}><code>/ 12</code><b>{k >= 2 ? <CountUp key="y" from={months} to={years} digits={3} /> : '?'}</b><i>{t('years', 'ani')}</i></div>
        <span className="viz-arrow" aria-hidden="true">FLOOR</span>
        <div className={`viz-agebox final${k >= 3 ? ' on' : ''}`}><code>FLOOR</code><b>{k >= 3 ? <CountUp key="a" from={years} to={age} /> : '?'}</b><i>{t('age', 'vârsta')}</i></div>
      </div>
    </VizFrame>
  );
}
