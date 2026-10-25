import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion as Motion } from 'motion/react';
import { useApp } from '../../../../contexts/AppContext';
import { useStepper, useVizMotion } from '../kit.js';
import { VizFrame } from '../ui.jsx';
import { displayCell } from '../logic/date-mask.js';
import { deleteSweep, sweepBadges, sweepCaption } from '../logic/delete-sweep.js';

export default function DeleteSweep({ props, predict }) {
  const { t } = useApp();
  const m = useVizMotion();
  const d = deleteSweep(props);
  const s = useStepper(3, { predict });
  const k = s.step;
  const bodyRef = useRef(null);
  useEffect(() => {
    const body = bodyRef.current;
    const first = body?.querySelector('.doomed');
    if (k === 1 && first) body.scrollTo({ top: Math.max(0, first.offsetTop - 28), behavior: m.reduced ? 'auto' : 'smooth' });
    if (k === 0 && body) body.scrollTo({ top: 0, behavior: 'auto' });
  }, [k, m.reduced]);
  const swept = k >= 2;
  const visible = d.rows.map((r, i) => ({ r, i })).filter(({ i }) => !(swept && d.doomed[i]));
  const cap = sweepCaption(d, k, props);
  const caption = t(cap.en, cap.ro);
  return (
    <VizFrame widget="delete-sweep" stepper={s} caption={caption} label={t('Deleting rows', 'Ștergerea rândurilor')}>
      <pre className="viz-sql">{d.sql};</pre>
      <div className="viz-scrollx">
        <div className="viz-dtable" style={{ '--dt-cols': d.columns.length }}>
          <div className="viz-dt-row head">
            {d.columns.map(c => <span key={c}>{c}</span>)}
          </div>
          <div className="viz-dt-body" ref={bodyRef}>
            <AnimatePresence initial={false}>
              {visible.map(({ r, i }) => (
                <Motion.div
                  key={i}
                  layout={!m.reduced}
                  className={`viz-dt-row${k >= 1 && d.doomed[i] ? ' doomed' : ''}`}
                  initial={false}
                  exit={m.reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, x: 90, transition: { duration: 0.28, delay: Math.min(i, 24) * 0.012 } }}
                  transition={m.spring}
                >
                  {d.columns.map(c => <span key={c} className={r[c] === null ? 'nul' : ''}>{displayCell(r[c])}</span>)}
                </Motion.div>
              ))}
            </AnimatePresence>
            {visible.length === 0 && <div className="viz-emptyrows">{t('0 rows', '0 rânduri')}</div>}
          </div>
        </div>
      </div>
      <div className="viz-tally">
        {sweepBadges(d, k).map(b => (
          <span key={b.kind} className={`viz-badge${b.kind === 'go' ? ' no' : ''}`}>
            {b.kind === 'total' ? t('in the table', 'în tabel') : b.kind === 'go' ? t('go', 'pleacă') : t('stay', 'rămân')}: {b.n}
          </span>
        ))}
      </div>
    </VizFrame>
  );
}
