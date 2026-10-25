import React from 'react';
import { motion as Motion } from 'motion/react';
import { useApp } from '../../../../contexts/AppContext';
import { useStepper, useVizMotion } from '../kit.js';
import { VizFrame } from '../ui.jsx';
import { dateMask } from '../logic/date-mask.js';
import { dateMaskSql } from '../logic/oracle.js';
import { useOracleValues } from '../useSqlRunner.js';
import { parseDT } from '../logic/common.js';

// Trailing blanks drawn as small boxes, so the padding Oracle adds can be seen.
function Padded({ text }) {
  const body = text.replace(/ +$/, '');
  const blanks = text.length - body.length;
  return (
    <span className="viz-padded">
      {body}
      {Array.from({ length: blanks }, (_, i) => <i key={i} className="viz-blankbox" aria-hidden="true" />)}
      {blanks > 0 && <span className="viz-sr">{` (${blanks} blanks)`}</span>}
    </span>
  );
}

export default function DateMask({ props, predict }) {
  const { t } = useApp();
  const m = useVizMotion();
  const D = dateMask(props);
  const s = useStepper(D.count, { predict });
  const k = s.step;
  const oracle = useOracleValues(dateMaskSql(props), 'facultate');
  const o = parseDT(props.date);
  const textFor = (i) => (oracle.values && typeof oracle.values[i] === 'string' ? oracle.values[i] : D.formats[i].text);
  const cur = k >= 1 ? D.formats[k - 1] : null;
  const caption = k === 0
    ? t('One date, made of parts. A mask names the parts you want and the order.', 'O dată, făcută din părți. O mască spune ce părți vrei și în ce ordine.')
    : t(`TO_CHAR(date, '${cur.mask}'): each word in the mask is replaced by that part of the date; other characters stay as they are.`, `TO_CHAR(data, '${cur.mask}'): fiecare cuvânt din mască e înlocuit cu partea respectivă din dată; celelalte caractere rămân.`);
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
            {cur.parts.map((p, i) => (
              <Motion.span key={i} className={`viz-tok out ${p.kind}${p.source ? ` ${p.source}` : ''}`} variants={m.v.fall} custom={i + 2} initial="hidden" animate="show">
                {p.kind === 'fm' ? '' : <Padded text={p.text} />}
              </Motion.span>
            ))}
          </div>
        </Motion.div>
      )}
      <div className="viz-history">
        {D.formats.slice(0, Math.max(0, k)).map((f, i) => (
          <div key={i} className={`viz-hrow${i === k - 1 ? ' cur' : ''}`}><code>{f.mask}</code><span className="viz-harrow">→</span><b><Padded text={textFor(i)} /></b></div>
        ))}
      </div>
    </VizFrame>
  );
}

function formatDateName(date) {
  const [y, mo, d] = date.split('-').map(Number);
  return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date(Date.UTC(y, mo - 1, d)).getUTCDay()];
}
