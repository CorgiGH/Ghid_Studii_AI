import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, animate, motion as Motion } from 'motion/react';
import { useApp } from '../../../../contexts/AppContext';
import { useStepper, useVizMotion } from '../kit.js';
import { VizFrame } from '../ui.jsx';
import { calendarSteps, opLabel, oracleDisplay } from '../logic/calendar-clock.js';
import { calendarSql } from '../logic/oracle.js';
import { useOracleValues } from '../useSqlRunner.js';
import { parseDT, daysInMonth, weekday, MONTHS } from '../logic/common.js';

const WD_EN = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const WD_RO = ['Lu', 'Ma', 'Mi', 'Jo', 'Vi', 'Sâ', 'Du'];
const MONTHS_RO = ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie'];

// Hand angle that always takes the short way round from the previous angle.
function useHand(target) {
  const m = useVizMotion();
  const [ang, setAng] = useState(target);
  const cur = useRef(target);
  useEffect(() => {
    const from = cur.current;
    const to = from + (((target - from) % 360 + 540) % 360 - 180);
    cur.current = to;
    const c = animate(from, to, { ...(m.reduced ? { duration: 0 } : { type: 'spring', stiffness: 90, damping: 16 }), onUpdate: setAng });
    return () => c.stop();
  }, [target, m.reduced]);
  return ang;
}

function Clock({ h, mi, show }) {
  const hourA = useHand((h % 12) * 30 + mi * 0.5);
  const minA = useHand(mi * 6);
  return (
    <svg className={`viz-clock${show ? '' : ' off'}`} viewBox="0 0 100 100" role="img" aria-label={`${String(h).padStart(2, '0')}:${String(mi).padStart(2, '0')}`}>
      <circle cx="50" cy="50" r="46" className="viz-clock-face" />
      {Array.from({ length: 12 }, (_, i) => (
        <line key={i} x1="50" y1="8" x2="50" y2={i % 3 === 0 ? 15 : 12} className="viz-clock-tick" transform={`rotate(${i * 30} 50 50)`} />
      ))}
      <line x1="50" y1="50" x2="50" y2="26" className="viz-clock-hour" transform={`rotate(${hourA} 50 50)`} />
      <line x1="50" y1="50" x2="50" y2="14" className="viz-clock-min" transform={`rotate(${minA} 50 50)`} />
      <circle cx="50" cy="50" r="3" className="viz-clock-pin" />
    </svg>
  );
}

function Month({ o, lang }) {
  const m = useVizMotion();
  const first = (weekday({ ...o, d: 1 }) + 6) % 7; // Monday first
  const dim = daysInMonth(o.y, o.mo);
  const cells = Array.from({ length: first + dim }, (_, i) => (i < first ? null : i - first + 1));
  return (
    <div className="viz-month">
      <div className="viz-month-title">{lang === 'ro' ? MONTHS_RO[o.mo - 1] : MONTHS[o.mo - 1]} {o.y}</div>
      <div className="viz-month-grid">
        {(lang === 'ro' ? WD_RO : WD_EN).map(d => <span key={d} className="viz-wd">{d}</span>)}
        {cells.map((d, i) => (
          <span key={i} className={`viz-day${d === o.d ? ' sel' : ''}${d === dim ? ' last' : ''}`}>
            {d === o.d && (
              <Motion.span layoutId="viz-day-ring" className="viz-day-ring" transition={m.reduced ? { duration: 0 } : m.spring} />
            )}
            <span className="viz-day-n">{d || ''}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function CalendarClock({ props, predict }) {
  const { t, lang } = useApp();
  const m = useVizMotion();
  const C = calendarSteps(props);
  const s = useStepper(C.count, { predict });
  const k = s.step;
  const oracle = useOracleValues(calendarSql(props), 'facultate');
  const stops = C.stops.map((st, i) => (oracle.values && oracle.values[i] ? oracle.values[i] : st));
  const now = parseDT(stops[k]);
  const op = k >= 1 ? props.ops[k - 1] : null;
  const display = oracleDisplay(stops[k]);
  const caption = k === 0
    ? t('The starting moment. Dates carry a time of day; the clock shows it.', 'Momentul de plecare. Datele au și o oră; ceasul o arată.')
    : ({
      '+': t(`Adding a number moves the date by that many days; a fraction moves the clock (${op.arg}).`, `Un număr adunat mută data cu atâtea zile; o fracție mută ceasul (${op.arg}).`),
      ADD_MONTHS: t('ADD_MONTHS moves whole months. If the day does not exist there, it lands on the last day. From a last day it always lands on a last day.', 'ADD_MONTHS mută luni întregi. Dacă ziua nu există acolo, ajunge pe ultima zi. Din ultima zi a unei luni ajunge mereu pe ultima zi.'),
      LAST_DAY: t('LAST_DAY jumps to the last day of the month; the time stays.', 'LAST_DAY sare la ultima zi a lunii; ora rămâne.'),
      NEXT_DAY: t(`NEXT_DAY goes to the next ${op.arg} strictly after this date; the time stays.`, `NEXT_DAY merge la următoarea zi ${op.arg}, strict după această dată; ora rămâne.`),
      TRUNC: op.arg ? t(`TRUNC with '${op.arg}' cuts back to the start of that unit, and the time goes to 00:00.`, `TRUNC cu '${op.arg}' taie înapoi la începutul acelei unități, iar ora devine 00:00.`) : t('TRUNC cuts the time of day: back to 00:00 on the same date.', 'TRUNC taie ora: înapoi la 00:00 în aceeași zi.'),
    })[op.fn];
  return (
    <VizFrame widget="calendar-clock" stepper={s} caption={caption} label={t('Calendar and clock', 'Calendar și ceas')}>
      <div className="viz-trail" aria-label={t('Steps so far', 'Pașii de până acum')}>
        {stops.slice(0, k + 1).map((st, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="viz-trail-op">{opLabel(props.ops[i - 1])}</span>}
            <Motion.code className={`viz-trail-stop${i === k ? ' cur' : ''}`} variants={m.v.pop} initial="hidden" animate="show">{st}</Motion.code>
          </React.Fragment>
        ))}
      </div>
      <div className="viz-cal">
        <AnimatePresence mode="popLayout" initial={false}>
          <Motion.div key={`${now.y}-${now.mo}`} variants={m.v.enter} initial="hidden" animate="show" exit="exit" className="viz-cal-month">
            <Month o={now} lang={lang} />
          </Motion.div>
        </AnimatePresence>
        <div className="viz-clockbox">
          <Clock h={now.h} mi={now.mi} show={now.hasTime} />
          <div className="viz-digital">{now.hasTime ? `${String(now.h).padStart(2, '0')}:${String(now.mi).padStart(2, '0')}` : t('no time', 'fără oră')}</div>
        </div>
      </div>
      <div className="viz-resultcol">
        <div className="viz-result"><span className="viz-dim">DD-MON-RR</span><b>{display.date}</b></div>
        {display.time && (
          <div className="viz-result"><span className="viz-dim">{t('the time of day DD-MON-RR does not show', 'ora zilei, pe care DD-MON-RR n-o arată')}</span><b>{display.time}</b></div>
        )}
      </div>
    </VizFrame>
  );
}
