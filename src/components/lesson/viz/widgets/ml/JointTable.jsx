import React, { useState } from 'react';
import { motion as Motion } from 'motion/react';
import { useApp } from '../../../../../contexts/AppContext';
import { useStepper, useVizMotion } from '../../kit.js';
import { VizFrame } from '../../ui.jsx';
import { jointTable, exploreView } from '../../logic/ml/joint-table.js';
import './ml-w2.css';

const heading = (h, t) => (typeof h === 'string' ? h : t(h.en, h.ro));

// One grid: heads, cells (value or "?", optional check line), margins. Pure drawing of what the logic produced.
export function JointGrid({ grid, J, onPick }) {
  const { t } = useApp();
  const showMarg = grid.rows.some((r) => r.marg) || (grid.bottom || []).some(Boolean);
  const mark = (ok) => (ok ? '✓' : '✗');
  return (
    <div className="viz-tablewrap">
      <table className="viz-table mjt-table" data-layout={grid.layout}>
        <thead>
          <tr>
            <th scope="col" className="mjt-corner">{grid.rowName} \ {grid.colName}</th>
            {grid.colHeads.map((c, n) => <th scope="col" key={n} className={c.cls || ''}>{heading(c.label, t)}</th>)}
            {showMarg && grid.rowMargHead && <th scope="col" className="mjt-marghead">{grid.rowMargHead}</th>}
          </tr>
        </thead>
        <tbody>
          {grid.rows.map((r, ri) => (
            <tr key={ri}>
              <th scope="row">{heading(r.head, t)}</th>
              {r.cells.map((c, ci) => {
                const txt = c.text ? t(c.text.en, c.text.ro) : '?';
                const body = c.button
                  ? <button type="button" className="mjt-cellbtn" onClick={() => onPick && onPick(c.i, c.j)} aria-label={`${grid.rowName} ${heading(r.head, t)}, ${grid.colName} ${heading(grid.colHeads[ci].label, t)}`}>{txt}</button>
                  : <span className="mjt-val">{txt}</span>;
                return (
                  <td key={ci} className={`mjt-cell ${c.cls}`} data-kind="cell" data-x={String(J.xs[c.i])} data-y={String(J.ys[c.j])}
                    data-z={J.hasZ && !c.noZ ? String(J.zs[c.k]) : undefined} data-value={c.text ? txt : ''} data-cap={c.cap ? '1' : undefined}>
                    {body}
                    {c.annot && (
                      <span className={`mjt-annot ${c.annot.ok ? 'ok' : 'bad'}`} data-kind="annot" data-ok={c.annot.ok ? '1' : '0'}
                        data-value={t(c.annot.text.en, c.annot.text.ro)} data-cap={c.annot.cap ? '1' : undefined}>
                        {t(c.annot.text.en, c.annot.text.ro)} <b aria-label={c.annot.ok ? t('holds', 'verifică') : t('does not hold', 'nu verifică')}>{mark(c.annot.ok)}</b>
                      </span>
                    )}
                  </td>
                );
              })}
              {showMarg && grid.rowMargHead && (
                <td className={`mjt-marg ${r.marg ? r.marg.cls : ''}`} data-kind={r.marg ? 'marg' : undefined} data-value={r.marg ? t(r.marg.text.en, r.marg.text.ro) : undefined} data-cap={r.marg && r.marg.cap ? '1' : undefined}>
                  {r.marg ? t(r.marg.text.en, r.marg.text.ro) : ''}
                </td>
              )}
            </tr>
          ))}
          {showMarg && grid.bottom && (
            <tr>
              <th scope="row" className="mjt-marghead">{grid.bottomHead}</th>
              {grid.bottom.map((b, n) => (
                <td key={n} className={`mjt-marg ${b ? b.cls : ''}`} data-kind={b ? 'marg' : undefined} data-value={b ? t(b.text.en, b.text.ro) : undefined} data-cap={b && b.cap ? '1' : undefined}>
                  {b ? t(b.text.en, b.text.ro) : ''}
                </td>
              ))}
              {grid.rowMargHead && <td />}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function InfoChips({ info }) {
  const { t } = useApp();
  if (!info || info.length === 0) return null;
  return (
    <div className="mjt-info">
      {info.map((c, n) => (
        <span key={n} className="mjt-chip" data-kind={c.kind} data-value={t(c.value.en, c.value.ro)} data-cap={c.kind === 'marg' ? undefined : '1'}>
          {t(c.label.en, c.label.ro)} = <b>{t(c.value.en, c.value.ro)}</b>
        </span>
      ))}
    </div>
  );
}

// The drawing of one step frame (exported so a test can render any frame).
export function JointStage({ model, frame }) {
  const m = useVizMotion();
  return (
    <Motion.div className="mjt" data-frame={frame.kind} initial={{ opacity: m.reduced ? 1 : 0.4 }} animate={{ opacity: 1 }} transition={m.reduced ? { duration: 0 } : { duration: 0.2 }}>
      <JointGrid grid={frame.grid} J={model.J} />
      <InfoChips info={frame.info} />
    </Motion.div>
  );
}

// With predict the learner's first touched cell is the pick that completes the screen (own mode: no "Show me" gate).
function Explorer({ props, predict }) {
  const { t } = useApp();
  const model = jointTable(props);
  const [picked, setPicked] = useState([]);
  const s = useStepper(1, { predict, own: true });
  const view = exploreView(model.J, picked);
  const pick = (i, j) => { setPicked((p) => [...p.filter(([a, b]) => !(a === i && b === j)), [i, j]]); s.settle(); };
  const stepper = { ...s, reset: () => { s.reset(); setPicked([]); } };
  return (
    <VizFrame widget="ml-joint-table" stepper={stepper} caption={t(view.caption.en, view.caption.ro)} label={t('Joint table: compare each cell with the product of the marginals', 'Tabel comun: compară fiecare celulă cu produsul marginalelor')}>
      <div className="mjt" data-frame="explore"><JointGrid grid={view.grid} J={model.J} onPick={pick} /></div>
    </VizFrame>
  );
}

function Steps({ props, predict }) {
  const { t } = useApp();
  const model = jointTable(props);
  const s = useStepper(model.count, { predict });
  const frame = model.frames[s.step];
  return (
    <VizFrame widget="ml-joint-table" stepper={s} caption={t(frame.caption.en, frame.caption.ro)} label={t('Joint distribution table, step by step', 'Tabelul distribuției comune, pas cu pas')}>
      <JointStage model={model} frame={frame} />
    </VizFrame>
  );
}

export default function JointTable({ props, predict }) {
  return props.explore ? <Explorer props={props} predict={predict} /> : <Steps props={props} predict={predict} />;
}
