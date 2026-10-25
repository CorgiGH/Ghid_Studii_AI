import React, { useLayoutEffect, useRef, useState } from 'react';
import { motion as Motion } from 'motion/react';
import { useApp } from '../../../../contexts/AppContext';
import { useStepper, useVizMotion } from '../kit.js';
import { VizFrame, CountUp } from '../ui.jsx';
import { setBalls } from '../logic/set-balls.js';
import { rowsNoun } from '../logic/words.js';
import { setBallsSql } from '../logic/oracle.js';
import { useOracleValues } from '../useSqlRunner.js';

const H = 26, GAP = 6;

function useWidth(ref) {
  const [w, setW] = useState(340);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const read = () => setW(el.clientWidth);
    read();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(read) : null;
    ro?.observe(el);
    return () => ro?.disconnect();
  }, [ref]);
  return w;
}

export default function SetBalls({ props, predict }) {
  const { t } = useApp();
  const m = useVizMotion();
  const B = setBalls(props);
  const stageRef = useRef(null);
  const width = useWidth(stageRef);
  const W = Math.max(54, Math.min(74, Math.floor((width / 2 - GAP * 2) / 2)));
  // Source pill i of a side: two columns per side; destination slots run left to right.
  const srcPos = (i, side) => ({ x: (side === 'L' ? 0 : Math.floor(width / 2)) + (i % 2) * (W + GAP), y: 12 + Math.floor(i / 2) * (H + GAP) });
  const s = useStepper(B.count, { predict });
  const k = s.step;
  const oracle = useOracleValues(setBallsSql(props), 'facultate');
  const res = k >= 1 ? B.results[k - 1] : null;
  const count = res ? (oracle.values && oracle.values[k - 1] != null && !Number.isNaN(Number(oracle.values[k - 1])) ? Number(oracle.values[k - 1]) : res.values.length) : 0;
  const srcRows = Math.ceil(Math.max(B.left.length, B.right.length) / 2);
  const srcH = srcRows * (H + GAP);
  const perRow = Math.max(2, Math.floor((width + GAP) / (W + GAP)));
  const destTop = srcH + 34;
  const destPos = (slot) => ({ x: (slot % perRow) * (W + GAP), y: 12 + destTop + Math.floor(slot / perRow) * (H + GAP) });

  // Where each source pill goes for the current op.
  const all = [...B.left.map((v, i) => ({ v, side: 'L', i })), ...B.right.map((v, i) => ({ v, side: 'R', i }))];
  const plan = (() => {
    if (!res) return [];
    const taken = new Set();
    return all.map((p, idx) => {
      if (res.op === 'UNION ALL') return { ...p, slot: idx, fade: false };
      const slot = res.values.indexOf(p.v);
      if (res.op === 'MINUS' && p.side === 'R') return { ...p, slot: -1, fade: true };
      if (res.op === 'INTERSECT' && p.side === 'R' && slot >= 0) return { ...p, slot, fade: true }; // the left copy carries it
      if (slot < 0) return { ...p, slot: -1, fade: true };
      if (taken.has(slot)) return { ...p, slot, fade: true };
      taken.add(slot);
      return { ...p, slot, fade: false };
    });
  })();
  const destRows = res ? Math.ceil((res.op === 'UNION ALL' ? all.length : res.values.length) / perRow) : 0;
  const stageH = res ? destTop + destRows * (H + GAP) + 6 : srcH + 6;
  const caption = k === 0
    ? t(`Two SELECTs, two piles of values. The set operators combine whole rows: here one name per row.`, `Două SELECT-uri, două grămezi de valori. Operatorii pe mulțimi combină rânduri întregi: aici, un nume pe rând.`)
    : ({
      UNION: t('UNION puts both piles together and melts equal values into one. The order of the rows is not guaranteed: if you want one, write ORDER BY at the end.', 'UNION pune cele două grămezi laolaltă și topește valorile egale într-una. Ordinea rândurilor nu e garantată: dacă o vrei, scrii ORDER BY la sfârșit.'),
      'UNION ALL': t('UNION ALL just stacks the piles: every ball stays, equal ones included.', 'UNION ALL doar suprapune grămezile: rămâne fiecare bilă, și cele egale.'),
      INTERSECT: t('INTERSECT keeps only values found in both piles, once each.', 'INTERSECT păstrează doar valorile găsite în ambele grămezi, câte una.'),
      MINUS: t('MINUS cuts from the first pile every value that also appears in the second, then removes repeats.', 'MINUS taie din prima grămadă orice valoare care apare și în a doua, apoi scoate repetările.'),
    })[res.op];
  return (
    <VizFrame widget="set-balls" stepper={s} caption={caption} label={t('Set operators on two piles of values', 'Operatori pe mulțimi pentru două grămezi de valori')}>
      <div className="viz-balls-sql">
        <code>{props.left}</code>
        {res && <b className="viz-balls-op">{res.op}</b>}
        <code>{props.right}</code>
      </div>
      <div className="viz-balls" style={{ height: stageH + 12 }} ref={stageRef}>
        <div className="viz-balls-label" style={{ left: 0, top: -2 }}>1</div>
        <div className="viz-balls-label" style={{ left: '50%', top: -2 }}>2</div>
        {all.map((p, idx) => (
          <span key={`s${idx}`} className={`viz-ball2 src ${p.side}${k >= 1 ? ' used' : ''}`} style={{ transform: `translate(${srcPos(p.i, p.side).x}px, ${srcPos(p.i, p.side).y}px)`, width: W, height: H }}>{p.v}</span>
        ))}
        {/* the divider runs through the middle of the gap between the source piles and the result, so its label sits above the result balls */}
        {res && <div className="viz-balls-divider" style={{ top: destTop - 8 }}><span>{res.op}</span></div>}
        {res && plan.map((p, idx) => {
          const from = srcPos(p.i, p.side);
          if (p.slot < 0) return null;
          const to = destPos(p.slot);
          return (
            <Motion.span key={`${k}-${idx}`} className={`viz-ball2 dest ${p.side}`} style={{ width: W, height: H }}
              initial={{ x: from.x, y: from.y, opacity: 1, scale: 1 }}
              animate={{ x: to.x, y: to.y, opacity: p.fade ? [1, 1, 0] : 1, scale: p.fade && !m.reduced ? [1, 1, 0.6] : 1 }}
              transition={m.reduced ? { duration: 0 } : { x: { ...m.soft, delay: idx * 0.025 }, y: { ...m.soft, delay: idx * 0.025 }, opacity: { duration: 0.7, times: [0, 0.65, 1] }, scale: { duration: 0.7, times: [0, 0.65, 1] } }}
            >{p.v}</Motion.span>
          );
        })}
      </div>
      {res && <div className="viz-tally"><span className="viz-badge yes">{res.op}: <CountUp key={k} to={count} duration={0.6} /> {t(rowsNoun(count).en, rowsNoun(count).ro)}</span></div>}
    </VizFrame>
  );
}
