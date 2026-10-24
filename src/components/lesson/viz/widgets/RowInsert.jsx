import React from 'react';
import { AnimatePresence, motion as Motion } from 'motion/react';
import { useApp } from '../../../../contexts/AppContext';
import { useStepper, useVizMotion } from '../kit.js';
import { VizFrame } from '../ui.jsx';
import { rowInsert } from '../logic/row-insert.js';

export default function RowInsert({ props, predict }) {
  const { t } = useApp();
  const m = useVizMotion();
  const r = rowInsert(props);
  const s = useStepper(r.count, { predict });
  const k = s.step;
  const fail = r.error && k === 2;
  const sql = fail ? r.error.sql : r.insertSql;
  const rowShown = k >= 1;
  const caption = k === 0
    ? t(`${props.table} is empty. One INSERT adds one row.`, `${props.table} este gol. Un INSERT adaugă un rând.`)
    : k === 1
      ? t('Each value lands in the column at the same position. A column left without a value gets NULL.', 'Fiecare valoare ajunge în coloana de pe aceeași poziție. O coloană fără valoare primește NULL.')
      : <><b>{r.error?.message}</b> {t('Nothing was added: the table still has one row.', 'Nu s-a adăugat nimic: tabelul are în continuare un rând.')}</>;
  return (
    <VizFrame widget="row-insert" stepper={s} caption={caption} label={t('Inserting a row', 'Inserarea unui rând')}>
      {k > 0 && <Motion.pre key={sql} className="viz-sql" variants={m.v.enter} initial="hidden" animate="show">{sql};</Motion.pre>}
      <div className="viz-scrollx">
        <div className="viz-rowgrid" style={{ gridTemplateColumns: `repeat(${r.columns.length}, minmax(0, 1fr))`, minWidth: r.columns.length * 84 }}>
          {r.columns.map(c => <div key={c} className="viz-rg-head">{c}</div>)}
          {rowShown && !fail && r.columns.map((c, i) => (
            <Motion.div key={`${k}-${c}`} className={`viz-rg-cell${r.row[c] === null ? ' nul' : ''}`} variants={m.v.fall} initial="hidden" animate="show" custom={i}>{r.row[c] === null ? 'NULL' : r.row[c]}</Motion.div>
          ))}
          {k === 2 && r.error && r.columns.map((c) => (
            <div key={c} className="viz-rg-cell">{r.row[c] === null ? 'NULL' : r.row[c]}</div>
          ))}
          {!rowShown && r.columns.map(c => <div key={c} className="viz-rg-cell empty" />)}
        </div>
      </div>
      <AnimatePresence>
        {fail && (
          <Motion.div
            className="viz-reject"
            variants={m.v.enter} initial="hidden" animate="show" exit="exit"
          >
            <Motion.div
              className="viz-rg-ghost"
              initial={{ x: 0 }}
              animate={m.reduced ? { x: 0 } : { x: [0, -7, 7, -5, 5, 0] }}
              transition={{ duration: 0.45, delay: 0.25 }}
            >
              {r.columns.map(c => (
                <span key={c} className={`viz-ghost-cell${c === r.error.column ? ' bad' : ''}`}>{r.error.row[c] === null ? 'NULL' : r.error.row[c]}</span>
              ))}
            </Motion.div>
            <span className="viz-badge no">{r.error.code}</span>
          </Motion.div>
        )}
      </AnimatePresence>
    </VizFrame>
  );
}
