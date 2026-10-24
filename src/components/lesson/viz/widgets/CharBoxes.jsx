import React from 'react';
import { AnimatePresence, motion as Motion } from 'motion/react';
import { useApp } from '../../../../contexts/AppContext';
import { useStepper, useVizMotion } from '../kit.js';
import { VizFrame } from '../ui.jsx';
import { charBoxes, charOps } from '../logic/char-boxes.js';

export default function CharBoxes({ props, predict }) {
  const { t } = useApp();
  const m = useVizMotion();
  const b = charBoxes(props.value, props.width);
  const ops = charOps(props);
  const s = useStepper(ops.length + 1, { predict });
  const k = s.step;
  const op = k >= 1 ? ops[k - 1] : null;
  const trimmed = op?.op === 'TRIM';
  const visible = b.boxes.filter(x => !(trimmed && x.blank));
  const lastIdx = b.boxes.length - 1;
  const likeFail = op?.op === 'LIKE' && op.result === false;
  const caption = k === 0
    ? t(`A CHAR(${props.width}) column always takes ${props.width} boxes. ${props.value} fills ${b.trimmedLength}; the other ${b.blanks} are blanks you cannot see.`, `O coloană CHAR(${props.width}) ocupă mereu ${props.width} căsuțe. ${props.value} umple ${b.trimmedLength}; celelalte ${b.blanks} sunt spații pe care nu le vezi.`)
    : op.op === 'LENGTH'
      ? t(`LENGTH counts the blanks too: ${op.result}.`, `LENGTH numără și spațiile: ${op.result}.`)
      : op.op === 'TRIM'
        ? t(`TRIM removes the blanks at both ends: ${op.length} boxes are left.`, `TRIM scoate spațiile de la capete: rămân ${op.length} căsuțe.`)
        : op.result
          ? t('LIKE matches.', 'LIKE se potrivește.')
          : t(`The last box holds a blank, not "${props.likePattern.replace('%', '')}", so ${props.likePattern} does not match.${op.trimmedResult ? ` After TRIM it would.` : ''}`, `Ultima căsuță conține un spațiu, nu „${props.likePattern.replace('%', '')}", deci ${props.likePattern} nu se potrivește.${op.trimmedResult ? ' După TRIM s-ar potrivi.' : ''}`);
  return (
    <VizFrame widget="char-boxes" stepper={s} caption={caption} label={t('A CHAR column with invisible blanks', 'O coloană CHAR cu spații nevăzute')}>
      <div className="viz-boxes-top"><code>CHAR({props.width})</code>{op && <code className="viz-op">{op.sql}</code>}</div>
      <div className="viz-boxes" role="img" aria-label={props.value}>
        <AnimatePresence initial={false} mode="popLayout">
          {visible.map((x) => {
            const i = b.boxes.indexOf(x);
            return (
              <Motion.span key={i} layout={!m.reduced}
                className={`viz-box${x.blank ? ' blank' : ''}${likeFail && i === lastIdx ? ' bad' : ''}${op?.op === 'LIKE' && op.result && i === lastIdx ? ' good' : ''}`}
                variants={m.v.pop} initial="hidden" animate="show" exit="exit" custom={x.blank ? b.trimmedLength + (i - b.trimmedLength) * 0.5 : i * 0.3}
                transition={m.soft}>
                {x.blank ? '' : x.ch}
                {op?.op === 'LENGTH' && <Motion.i className="viz-box-n" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: m.reduced ? 0 : 0.05 + i * 0.05 }}>{i + 1}</Motion.i>}
              </Motion.span>
            );
          })}
        </AnimatePresence>
      </div>
      {op && (
        <Motion.div key={k} className="viz-result" variants={m.v.enter} initial="hidden" animate="show" custom={4}>
          <span className="viz-dim">{t('result', 'rezultat')}</span>
          <b>{op.op === 'LIKE' ? (op.result ? t('match', 'se potrivește') : t('no match', 'nu se potrivește')) : String(op.result)}</b>
        </Motion.div>
      )}
    </VizFrame>
  );
}
