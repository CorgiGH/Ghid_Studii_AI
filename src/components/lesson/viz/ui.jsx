import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { AnimatePresence, animate, motion as Motion } from 'motion/react';
import { useApp } from '../../../contexts/AppContext';
import { useVizMotion } from './kit.js';
import { displayCell } from './logic/date-mask.js';

// Frame every widget sits in: stage, live caption, and the manual controls.
export function VizFrame({ widget, stepper, caption, children, label }) {
  const { t } = useApp();
  const m = useVizMotion();
  const { n, step } = stepper;
  const dots = n <= 14;
  return (
    <figure className="viz" data-widget={widget} aria-label={label}>
      <div className="viz-stage">{children}</div>
      <div className="viz-caption" aria-live="polite" aria-atomic="true">
        <AnimatePresence mode="wait" initial={false}>
          <Motion.div
            key={step + (stepper.predicting ? 'p' : '')}
            initial={{ opacity: m.reduced ? 1 : 0, y: m.reduced ? 0 : 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: m.reduced ? 1 : 0 }}
            transition={m.reduced ? { duration: 0 } : { duration: 0.16 }}
          >
            {caption}
            {stepper.predicting && (
              <p className="viz-think">{t('Think first: what comes out? Then press the button.', 'Gândește-te întâi: ce iese? Apoi apasă butonul.')}</p>
            )}
          </Motion.div>
        </AnimatePresence>
      </div>
      <div className="viz-controls">
        {stepper.predicting ? (
          <button type="button" className="viz-btn viz-btn-primary" onClick={stepper.reveal}>{t('Show me', 'Arată-mi')}</button>
        ) : (
          <>
            <button type="button" className="viz-btn" onClick={stepper.back} disabled={!stepper.canBack} aria-label={t('Previous step', 'Pasul anterior')}>
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <div className="viz-progress" role="presentation">
              {dots
                ? Array.from({ length: n }, (_, i) => (
                  <button key={i} type="button" tabIndex={-1} aria-hidden="true" className={`viz-dot${i === step ? ' on' : ''}${i < step ? ' past' : ''}`} onClick={() => stepper.goto(i)} />
                ))
                : <span className="viz-count">{step + 1} / {n}</span>}
            </div>
            {stepper.last ? (
              <button type="button" className="viz-btn" onClick={stepper.reset}>{t('Again', 'Din nou')}</button>
            ) : (
              <button type="button" className="viz-btn viz-btn-primary" onClick={stepper.next} disabled={!stepper.canNext}>
                <span>{t('Next', 'Mai departe')}</span>
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            )}
          </>
        )}
      </div>
    </figure>
  );
}

// Plain table used by several widgets. Rows and cells take class hooks so the widget
// decides the colour; transitions are CSS so a 40-row table stays cheap.
export function MiniTable({ columns, rows, rowClass, cellClass, wirePrefix, caption, highlightCols, fmt, maxHeight }) {
  const show = (v) => (fmt ? fmt(v) : displayCell(v));
  return (
    <div className="viz-tablewrap" style={maxHeight ? { maxHeight, overflowY: 'auto' } : undefined}>
      {caption && <div className="viz-tablecap">{caption}</div>}
      <table className="viz-table">
        <thead>
          <tr>{columns.map(c => <th key={c} className={highlightCols?.includes(c) ? 'hl' : ''}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={rowClass ? rowClass(i, r) : ''}>
              {columns.map(c => (
                <td
                  key={c}
                  className={`${r[c] === null || r[c] === undefined ? 'nul ' : ''}${highlightCols?.includes(c) ? 'hl ' : ''}${cellClass ? cellClass(i, c, r) : ''}`}
                  data-wire={wirePrefix ? `${wirePrefix}:${i}:${c}` : undefined}
                >{show(r[c])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// SVG wires between elements marked data-wire="id" inside `boxRef`. pairs: [{ id, from, to, cls }].
// Re-measures after layout, on resize and once the entrance animations have settled.
export function Wires({ boxRef, pairs, settle = 0 }) {
  const m = useVizMotion();
  const [paths, setPaths] = useState([]);
  const sig = pairs.map(p => `${p.id}|${p.from}|${p.to}`).join(';');
  const measure = useCallback(() => {
    const box = boxRef.current;
    if (!box) return;
    const b = box.getBoundingClientRect();
    const find = (id) => box.querySelector(`[data-wire="${CSS.escape(id)}"]`);
    const out = [];
    for (const p of pairs) {
      const a = find(p.from), z = find(p.to);
      if (!a || !z) continue;
      const ra = a.getBoundingClientRect(), rz = z.getBoundingClientRect();
      let x1, y1, x2, y2, d;
      if (ra.right > rz.left + 4 && ra.left < rz.right - 4) {
        // stacked layout: run top to bottom
        const down = ra.top < rz.top;
        x1 = ra.left + ra.width / 2 - b.left; y1 = (down ? ra.bottom : ra.top) - b.top;
        x2 = rz.left + rz.width / 2 - b.left; y2 = (down ? rz.top : rz.bottom) - b.top;
        const dy = Math.max(16, Math.abs(y2 - y1) * 0.5) * (down ? 1 : -1);
        d = `M${x1} ${y1} C${x1} ${y1 + dy} ${x2} ${y2 - dy} ${x2} ${y2}`;
      } else {
        const leftToRight = ra.left < rz.left;
        x1 = (leftToRight ? ra.right : ra.left) - b.left;
        x2 = (leftToRight ? rz.left : rz.right) - b.left;
        y1 = ra.top + ra.height / 2 - b.top;
        y2 = rz.top + rz.height / 2 - b.top;
        const dx = Math.max(24, Math.abs(x2 - x1) * 0.45) * (leftToRight ? 1 : -1);
        d = `M${x1} ${y1} C${x1 + dx} ${y1} ${x2 - dx} ${y2} ${x2} ${y2}`;
      }
      out.push({ id: p.id, cls: p.cls || '', d, x2, y2 });
    }
    setPaths(prev => (JSON.stringify(prev) === JSON.stringify(out) ? prev : out));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- pairs is summarised by sig
  }, [boxRef, sig]);
  useLayoutEffect(() => {
    measure();
    const box = boxRef.current;
    if (!box) return undefined;
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    ro?.observe(box);
    const timer = setTimeout(measure, 420 + settle);
    window.addEventListener('resize', measure);
    return () => { ro?.disconnect(); clearTimeout(timer); window.removeEventListener('resize', measure); };
  }, [measure, boxRef, settle]);
  return (
    <svg className="viz-wires" aria-hidden="true">
      <AnimatePresence>
        {paths.map(p => (
          <Motion.g key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: m.reduced ? 0 : 0.2 }}>
            <Motion.path
              className={`viz-wire ${p.cls}`}
              d={p.d}
              initial={{ pathLength: m.reduced ? 1 : 0 }}
              animate={{ pathLength: 1 }}
              transition={m.reduced ? { duration: 0 } : { duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            />
            <circle className={`viz-wire-end ${p.cls}`} cx={p.x2} cy={p.y2} r="3.5" />
          </Motion.g>
        ))}
      </AnimatePresence>
    </svg>
  );
}

export function Code({ children }) {
  return <code className="viz-code">{children}</code>;
}

// Counts from `from` to `to`; with reduced motion it just shows `to`.
export function CountUp({ to, from = 0, digits = 0, duration = 0.9 }) {
  const m = useVizMotion();
  const [v, setV] = useState(from);
  useEffect(() => {
    if (m.reduced) return undefined;
    const c = animate(from, to, { duration, ease: [0.22, 1, 0.36, 1], onUpdate: setV });
    return () => c.stop();
  }, [to, from, duration, m.reduced]);
  return <span className="viz-num">{Number(m.reduced ? to : v).toFixed(digits)}</span>;
}

// A row of chips, one per value; the current one is lit and earlier ones carry their verdict.
export function ValueChips({ items, step, verdicts, onPick, className = '' }) {
  return (
    <div className={`viz-chips ${className}`}>
      {items.map((it, i) => {
        const done = i < step - 1;
        const cur = i === step - 1;
        const v = verdicts ? verdicts[i] : undefined;
        const tone = done || cur ? (v === true ? 'yes' : v === false ? 'no' : 'unk') : '';
        return (
          <button key={i} type="button" className={`viz-chip ${tone}${cur ? ' cur' : ''}`} onClick={() => onPick?.(i + 1)} aria-current={cur ? 'true' : undefined}>
            {it === null || it === undefined ? <em>NULL</em> : String(it)}
            {(done || cur) && <span className="viz-chip-mark" aria-hidden="true">{v === true ? '✓' : v === false ? '✗' : '?'}</span>}
          </button>
        );
      })}
    </div>
  );
}
