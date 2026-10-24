import React from 'react';
import { AnimatePresence, motion as Motion } from 'motion/react';
import { useApp } from '../../../../contexts/AppContext';
import { useStepper, useVizMotion } from '../kit.js';
import { VizFrame } from '../ui.jsx';
import { tableBuild } from '../logic/table-build.js';

export default function TableBuild({ props, predict }) {
  const { t } = useApp();
  const m = useVizMotion();
  const b = tableBuild(props.table, props.columns);
  const s = useStepper(b.count, { predict });
  const k = s.step;
  const col = props.columns[k - 1];
  const caption = k === 0
    ? t(`An empty frame named ${props.table}. Columns come first, rows later.`, `Un cadru gol numit ${props.table}. Mai întâi coloanele, rândurile vin după.`)
    : k < props.columns.length
      ? t(`Column ${col.name}: it can only hold ${col.type}${col.notNull ? ', and it can never be empty' : ''}.`, `Coloana ${col.name}: poate ține doar ${col.type}${col.notNull ? ' și nu poate rămâne goală' : ''}.`)
      : t(`The table exists, with no rows yet: ${props.columns.length} columns, 0 rows.`, `Tabelul există, încă fără rânduri: ${props.columns.length} coloane, 0 rânduri.`);
  return (
    <VizFrame widget="table-build" stepper={s} caption={caption} label={t('Building a table column by column', 'Construim un tabel coloană cu coloană')}>
      <div className="viz-split viz-split-code">
        <pre className="viz-sql" aria-label="CREATE TABLE">{b.sqlAt(k)}</pre>
        <div className="viz-frame">
          <div className="viz-frame-title">{props.table}</div>
          <div className="viz-cols">
            <AnimatePresence initial={false}>
              {props.columns.slice(0, k).map((c, i) => (
                <Motion.div key={c.name} className="viz-colhead" variants={m.v.fall} initial="hidden" animate="show" exit="exit" custom={0} layout={!m.reduced}>
                  <b>{c.name}</b>
                  <span className="viz-type">{c.type}</span>
                  {c.notNull && <span className="viz-badge no">NOT NULL</span>}
                  <span className="viz-idx" aria-hidden="true">{i + 1}</span>
                </Motion.div>
              ))}
            </AnimatePresence>
            {k === 0 && <div className="viz-empty">{t('no columns yet', 'încă nicio coloană')}</div>}
          </div>
          {k >= props.columns.length && <div className="viz-emptyrows">{t('0 rows', '0 rânduri')}</div>}
        </div>
      </div>
    </VizFrame>
  );
}
