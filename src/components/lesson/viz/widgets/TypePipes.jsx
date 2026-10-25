import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion as Motion } from 'motion/react';
import { useApp } from '../../../../contexts/AppContext';
import { useStepper, useVizMotion } from '../kit.js';
import { VizFrame } from '../ui.jsx';
import { pipeCaption, pipeTarget, typePipes } from '../logic/type-pipes.js';
import { typePipesSql } from '../logic/oracle.js';
import { useOracleValues } from '../useSqlRunner.js';

// Shows the original value, then swaps to the converted one midway through the pipe.
function Morph({ from, to, run }) {
  const m = useVizMotion();
  const [done, setDone] = useState(!run);
  useEffect(() => {
    if (!run || m.reduced) return undefined;
    const id = setTimeout(() => setDone(true), 480);
    return () => clearTimeout(id);
  }, [run, m.reduced]);
  const shown = m.reduced || done ? to : from;
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Motion.span key={shown} initial={{ opacity: 0, scale: m.reduced ? 1 : 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: m.reduced ? 0 : 0.14 }}>{shown}</Motion.span>
    </AnimatePresence>
  );
}

export default function TypePipes({ props, predict }) {
  const { t } = useApp();
  const m = useVizMotion();
  const P = typePipes(props);
  const s = useStepper(P.count, { predict });
  const k = s.step;
  const oracle = useOracleValues(typePipesSql(props), 'facultate');
  const resultOf = (i) => (oracle.values && oracle.values[i] != null ? oracle.values[i] : P.items[i].result);
  const caption = k === 0
    ? t('Oracle quietly changes a value from one type to another when an expression needs it. Each pipe is one such change.', 'Oracle schimbă pe tăcute o valoare dintr-un tip în altul când expresia o cere. Fiecare conductă e o astfel de schimbare.')
    : t(pipeCaption(props.conversions[k - 1]).en, pipeCaption(props.conversions[k - 1]).ro);
  return (
    <VizFrame widget="type-pipes" stepper={s} caption={caption} label={t('Implicit type conversions as pipes', 'Conversiile implicite de tip ca niște conducte')}>
      <div className="viz-pipes">
        {P.items.map((c, i) => {
          const active = i === k - 1;
          const done = i < k;
          const res = resultOf(i);
          return (
            <div key={i} className={`viz-pipe${active ? ' active' : ''}${done ? ' done' : ''}`}>
              <code className="viz-pipe-fn">{c.fn}</code>
              <div className="viz-pipe-row">
                <span className="viz-type-node from">{c.from}</span>
                <div className="viz-pipe-tube">
                  {done && (
                    <Motion.span
                      key={`${i}-${active}`}
                      className="viz-pipe-token"
                      initial={active ? { left: '0%', x: '0%', y: '-50%' } : false}
                      animate={{ left: '100%', x: '-100%', y: '-50%' }}
                      transition={m.reduced ? { duration: 0 } : { duration: 0.9, ease: [0.5, 0, 0.2, 1] }}
                    >
                      <Morph from={c.value} to={res !== null && res !== undefined ? String(res) : '?'} run={active} />
                    </Motion.span>
                  )}
                  {!done && <span className="viz-pipe-token waiting">{c.value}</span>}
                </div>
                <span className={`viz-type-node to${done ? '' : ' unknown'}`}>{pipeTarget(c, done)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </VizFrame>
  );
}
