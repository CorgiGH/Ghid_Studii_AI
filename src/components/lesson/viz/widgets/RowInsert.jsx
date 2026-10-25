import React from 'react';
import { AnimatePresence, motion as Motion } from 'motion/react';
import { useApp } from '../../../../contexts/AppContext';
import { useStepper, useVizMotion } from '../kit.js';
import { VizFrame } from '../ui.jsx';
import { rowInsert, rowInsertCaption } from '../logic/row-insert.js';

export default function RowInsert({ props, predict }) {
  const { t } = useApp();
  const m = useVizMotion();
  const r = rowInsert(props);
  const s = useStepper(r.count, { predict });
  const k = s.step;
  const fail = r.error && k === 2;
  const sql = fail ? r.error.sql : r.insertSql;
  const rowShown = k >= 1;
  const cap = rowInsertCaption(r, k, props.table);
  const caption = fail ? <><b>{r.error.message}</b> {t(cap.en, cap.ro)}</> : t(cap.en, cap.ro);
  const cellText = (v) => (v === null || v === undefined ? 'NULL' : v);
  return (
    <VizFrame widget="row-insert" stepper={s} caption={caption} label={t('Inserting a row', 'Inserarea unui rând')}>
      {k > 0 && <Motion.pre key={sql} className="viz-sql" variants={m.v.enter} initial="hidden" animate="show">{sql};</Motion.pre>}
      {/* one unit per column, its name above its value; the units wrap, so all the columns stay on screen at phone width */}
      <div className="viz-rowgrid">
        {r.columns.map((col, i) => (
          <div key={col} className="viz-rg-unit">
            <div className="viz-rg-head">{col}</div>
            {!rowShown && <div className="viz-rg-cell empty" />}
            {rowShown && !fail && (
              <Motion.div key={k} className={`viz-rg-cell${r.row[col] === null ? ' nul' : ''}`} variants={m.v.fall} initial="hidden" animate="show" custom={i}>{cellText(r.row[col])}</Motion.div>
            )}
            {fail && <div className={`viz-rg-cell${r.row[col] === null ? ' nul' : ''}`}>{cellText(r.row[col])}</div>}
          </div>
        ))}
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
