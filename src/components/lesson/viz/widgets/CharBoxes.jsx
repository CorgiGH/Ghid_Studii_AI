import React from 'react';
import { AnimatePresence, motion as Motion } from 'motion/react';
import { useApp } from '../../../../contexts/AppContext';
import { useStepper, useVizMotion } from '../kit.js';
import { VizFrame } from '../ui.jsx';
import { charBoxCaption, charBoxCount, charBoxStep, charBoxes, charOps } from '../logic/char-boxes.js';

export default function CharBoxes({ props, predict }) {
  const { t } = useApp();
  const m = useVizMotion();
  const b = charBoxes(props.value, props.width);
  const ops = charOps(props);
  const s = useStepper(charBoxCount(ops.length), { predict });
  const k = s.step;
  const st = charBoxStep(k);
  // the operation named on this step: asked about (intro, ask) or with its result shown (result)
  const op = ops[st.index] || null;
  const done = st.kind === 'result' ? op : null;
  const trimmed = done?.op === 'TRIM';
  const visible = b.boxes.filter(x => !(trimmed && x.blank));
  const lastIdx = b.boxes.length - 1;
  const likeFail = done?.op === 'LIKE' && done.result === false;
  const cap = charBoxCaption(props, b, ops, k);
  return (
    <VizFrame widget="char-boxes" stepper={s} caption={t(cap.en, cap.ro)} label={t('A CHAR column with invisible blanks', 'O coloană CHAR cu spații nevăzute')}>
      <div className="viz-boxes-top">
        <code>{props.column ? `${props.column} ` : ''}CHAR({props.width})</code>
        {op && <code className={`viz-op${done ? '' : ' pending'}`}>{op.sql}{done ? '' : ' = ?'}</code>}
      </div>
      {/* one row of boxes whatever the width: the boxes shrink to share the line */}
      <div className="viz-boxes" role="img" aria-label={props.value} style={{ '--n': b.boxes.length }}>
        <AnimatePresence initial={false} mode="popLayout">
          {visible.map((x) => {
            const i = b.boxes.indexOf(x);
            return (
              <Motion.span key={i} layout={!m.reduced}
                className={`viz-box${x.blank ? ' blank' : ''}${likeFail && i === lastIdx ? ' bad' : ''}${done?.op === 'LIKE' && done.result && i === lastIdx ? ' good' : ''}`}
                variants={m.v.pop} initial="hidden" animate="show" exit="exit" custom={x.blank ? b.trimmedLength + (i - b.trimmedLength) * 0.5 : i * 0.3}
                transition={m.soft}>
                {x.blank ? '' : x.ch}
                {done?.op === 'LENGTH' && <Motion.i className="viz-box-n" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: m.reduced ? 0 : 0.05 + i * 0.05 }}>{i + 1}</Motion.i>}
              </Motion.span>
            );
          })}
        </AnimatePresence>
      </div>
      {k > 0 && (
        <Motion.div key={k} className="viz-result" variants={m.v.enter} initial="hidden" animate="show" custom={4}>
          <span className="viz-dim">{t('result', 'rezultat')}</span>
          <b>{!done ? '?' : done.op === 'LIKE' ? (done.result ? t('match', 'se potrivește') : t('no match', 'nu se potrivește')) : String(done.result)}</b>
        </Motion.div>
      )}
    </VizFrame>
  );
}
