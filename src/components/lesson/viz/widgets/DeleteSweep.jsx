import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion as Motion } from 'motion/react';
import { useApp } from '../../../../contexts/AppContext';
import { useStepper, useVizMotion } from '../kit.js';
import { VizFrame } from '../ui.jsx';
import { displayCell } from '../logic/date-mask.js';
import { deleteSweep } from '../logic/delete-sweep.js';

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
  const caption = k === 0
    ? t(`${props.table} has ${d.rows.length} rows. ${props.where ? 'The WHERE decides which ones go.' : 'There is no WHERE.'}`, `${props.table} are ${d.rows.length} rânduri. ${props.where ? 'WHERE hotărăște care pleacă.' : 'Nu există WHERE.'}`)
    : k === 1
      ? (props.where
        ? t(`${d.deleted} rows satisfy the condition. Only those are marked.`, `${d.deleted} rânduri îndeplinesc condiția. Doar ele sunt marcate.`)
        : t('Without WHERE every row is marked.', 'Fără WHERE toate rândurile sunt marcate.'))
      : (props.where
        ? t(`${d.deleted} rows deleted, ${d.kept} stay.`, `${d.deleted} rânduri șterse, ${d.kept} rămân.`)
        : t('All rows are gone, but the table itself, its columns and types, is still there.', 'Toate rândurile au dispărut, dar tabelul, cu coloanele și tipurile lui, există în continuare.'));
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
        <span className="viz-badge">{t('stay', 'rămân')}: {swept ? d.kept : d.rows.length}</span>
        {k >= 1 && <span className="viz-badge no">{t('go', 'pleacă')}: {d.deleted}</span>}
      </div>
    </VizFrame>
  );
}
