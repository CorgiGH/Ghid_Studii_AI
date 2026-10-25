import React from 'react';
import { motion as Motion } from 'motion/react';
import { useApp } from '../../../../contexts/AppContext';
import { useStepper, useVizMotion } from '../kit.js';
import { VizFrame } from '../ui.jsx';
import { dateMask, hasPadding, maskCaption, maskStep, maskStepCount, outputParts } from '../logic/date-mask.js';
import { dateMaskSql } from '../logic/oracle.js';
import { useOracleValues } from '../useSqlRunner.js';
import { parseDT } from '../logic/common.js';

// Trailing blanks drawn as small boxes, so the padding Oracle adds can be seen.
function Padded({ text }) {
  const { t } = useApp();
  const body = text.replace(/ +$/, '');
  const blanks = text.length - body.length;
  return (
    <span className="viz-padded">
      {body}
      {Array.from({ length: blanks }, (_, i) => <i key={i} className="viz-blankbox" aria-hidden="true" />)}
      {blanks > 0 && <span className="viz-sr">{t(` (${blanks} ${blanks === 1 ? 'space' : 'spaces'})`, ` (${blanks === 1 ? '1 spațiu' : `${blanks} spații`})`)}</span>}
    </span>
  );
}

export default function DateMask({ props, predict }) {
  const { t } = useApp();
  const m = useVizMotion();
  const D = dateMask(props);
  const s = useStepper(maskStepCount(D.formats.length), { predict });
  const k = s.step;
  const oracle = useOracleValues(dateMaskSql(props), 'facultate');
  const o = parseDT(props.date);
  const textFor = (i) => (oracle.values && typeof oracle.values[i] === 'string' ? oracle.values[i] : D.formats[i].text);
  const st = maskStep(k);
  const cur = st.index >= 0 ? D.formats[st.index] : null;
  const shown = st.kind === 'show';
  // masks whose output is out: every earlier one, and the current one once shown
  const done = st.index < 0 ? 0 : st.index + (shown ? 1 : 0);
  const cap = cur ? maskCaption(cur, st.kind) : null;
  const caption = k === 0
    ? t('One date, made of parts. A mask names the parts you want and the order.', 'O dată, făcută din părți. O mască spune ce părți vrei și în ce ordine.')
    : t(cap.en, cap.ro);
  const legend = Array.from({ length: done }, (_, i) => textFor(i)).some(hasPadding);
  return (
    <VizFrame widget="date-mask" stepper={s} caption={caption} label={t('A date and its format masks', 'O dată și măștile ei de format')}>
      <div className="viz-dateparts">
        {[['day', o.d], ['month', o.mo], ['year', o.y]].map(([k2, v]) => (
          <span key={k2} className={`viz-part ${k2}${cur?.parts.some(p => p.source === k2) ? ' used' : ''}`}><b>{String(v).padStart(k2 === 'year' ? 4 : 2, '0')}</b><i>{k2 === 'day' ? t('day', 'zi') : k2 === 'month' ? t('month', 'lună') : t('year', 'an')}</i></span>
        ))}
        <span className={`viz-part weekday${cur?.parts.some(p => p.source === 'weekday') ? ' used' : ''}`}><b>{formatDateName(props.date)}</b><i>{t('weekday', 'zi a săptămânii')}</i></span>
      </div>
      {cur && (
        <Motion.div key={k} className="viz-maskrow" initial="hidden" animate="show">
          <div className="viz-maskline" aria-label={`mask ${cur.mask}`}>
            {cur.parts.map((p, i) => (
              <Motion.span key={i} className={`viz-tok ${p.kind}${p.source ? ` ${p.source}` : ''}`} variants={m.v.pop} custom={i + 1}>
                {p.kind === 'field' ? p.token : p.kind === 'fm' ? p.token : p.text}
              </Motion.span>
            ))}
          </div>
          <div className="viz-arrow" aria-hidden="true">↓</div>
          <div className="viz-maskline out">
            {outputParts(cur.parts).map((p, i) => (
              shown
                ? (
                  <Motion.span key={`o${i}`} className={`viz-tok out ${p.kind}${p.source ? ` ${p.source}` : ''}`} variants={m.v.fall} custom={i + 2} initial="hidden" animate="show">
                    <Padded text={p.text} />
                  </Motion.span>
                )
                : p.kind === 'literal'
                  ? <span key={`q${i}`} className="viz-tok out literal">{p.text}</span>
                  : <span key={`q${i}`} className="viz-tok out pending">?</span>
            ))}
          </div>
        </Motion.div>
      )}
      <div className="viz-history">
        {D.formats.slice(0, done).map((f, i) => (
          <div key={i} className={`viz-hrow${i === done - 1 && shown ? ' cur' : ''}`}><code>{f.mask}</code><span className="viz-harrow">→</span><b><Padded text={textFor(i)} /></b></div>
        ))}
      </div>
      {legend && <div className="viz-dim viz-note viz-legend"><i className="viz-blankbox" aria-hidden="true" /> {t('= one space', '= un spațiu')}</div>}
    </VizFrame>
  );
}

function formatDateName(date) {
  const [y, mo, d] = date.split('-').map(Number);
  return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date(Date.UTC(y, mo - 1, d)).getUTCDay()];
}
