import React from 'react';
import { motion as Motion } from 'motion/react';
import { useApp } from '../../../../contexts/AppContext';
import { useStepper, useVizMotion } from '../kit.js';
import { VizFrame } from '../ui.jsx';
import { charStrips, padCall, stageChanges, swapCalls, swapStep } from '../logic/char-strips.js';
import { charStripsSql } from '../logic/oracle.js';
import { useOracleValues } from '../useSqlRunner.js';

export default function CharStrips({ props, predict }) {
  const { t } = useApp();
  const m = useVizMotion();
  const { plan, chain, count } = charStrips(props);
  const s = useStepper(count, { predict });
  const k = s.step;
  const oracle = useOracleValues(charStripsSql(props), 'facultate');
  const result = oracle.values && oracle.values[0] != null ? oracle.values[0] : plan.result;

  if (props.mode === 'swap') {
    const stages = chain.stages;
    const n = stages.length;
    const step = swapStep(k, n);
    const shown = Math.min(k, n);
    const chainText = shown === 0 ? props.input : stages[shown - 1].text;
    const chainChars = [...chainText];
    const broken = chain.result !== plan.result;
    const cur = step.kind === 'replace' ? stages[step.index] : null;
    // the cells the current REPLACE just changed, in the colour of its pair
    const changed = cur ? stageChanges(step.index === 0 ? props.input : stages[step.index - 1].text, cur.text) : [];
    const calls = swapCalls(props);
    const caption = step.kind === 'intro'
      ? t(`Two ways to swap the letters of ${props.input}: ${calls.replace}, one REPLACE per letter, or one ${calls.translate}.`, `Două moduri de a schimba literele din ${props.input}: ${calls.replace}, câte un REPLACE pe literă, sau un singur ${calls.translate}.`)
      : step.kind === 'translate'
        ? t(`TRANSLATE reads each letter once, in the original text, and swaps in one step: ${result}`, `TRANSLATE citește fiecare literă o singură dată, în textul original, și schimbă într-un singur pas: ${result}`)
        : [
          step.index === 0
            ? t(`First REPLACE: every «${cur.from}» becomes «${cur.to}». So far so good.`, `Primul REPLACE: fiecare «${cur.from}» devine «${cur.to}». Până aici merge.`)
            : step.index === 1
              ? t(`REPLACE 2: every «${cur.from}» becomes «${cur.to}», including the ones the first REPLACE made.`, `REPLACE 2: fiecare «${cur.from}» devine «${cur.to}», inclusiv cele create de primul REPLACE.`)
              : t(`REPLACE ${step.index + 1}: every «${cur.from}» becomes «${cur.to}», including the ones the earlier REPLACEs made.`, `REPLACE ${step.index + 1}: fiecare «${cur.from}» devine «${cur.to}», inclusiv cele create de REPLACE-urile dinainte.`),
          step.last ? t(` The chain gives ${chain.result}${broken ? ': wrong' : ''}.`, ` Lanțul dă ${chain.result}${broken ? ': greșit' : ''}.`) : '',
        ].join('');
    const done = step.kind === 'translate';
    return (
      <VizFrame widget="char-strips" stepper={s} caption={caption} label={t('Chained REPLACE against TRANSLATE', 'REPLACE în lanț contra TRANSLATE')}>
        <div className="viz-maps">
          {plan.from.map((f, i) => <span key={i} className={`viz-map t${i % 4}`}><b>{f}</b><i>→</i><b>{plan.to[i] ?? '∅'}</b></span>)}
        </div>
        <div className="viz-dim viz-strip-label"><code>REPLACE(REPLACE(…))</code></div>
        <div className="viz-strip" role="img" aria-label={chainText} style={{ '--n': Math.max(chainChars.length, plan.chars.length) }}>
          {chainChars.map((c, i) => (
            <span key={i} className={`viz-cell plain${k >= n && n > 0 && broken && c !== plan.chars[i]?.out ? ' wrong' : changed[i] ? ` hit t${step.index % 4}` : ''}`}>
              <Motion.span
                key={`${shown}${c}`}
                initial={shown > 0 && !m.reduced ? { rotateX: 90, opacity: 0 } : false}
                animate={{ rotateX: 0, opacity: 1 }}
                transition={m.reduced ? { duration: 0 } : { ...m.spring, delay: i * 0.03 }}
                style={{ display: 'inline-block' }}
              >{c}</Motion.span>
            </span>
          ))}
        </div>
        <div className="viz-dim viz-strip-label"><code>TRANSLATE</code></div>
        <div className="viz-strip" role="img" aria-label={done ? result : props.input} style={{ '--n': Math.max(chainChars.length, plan.chars.length) }}>
          {plan.chars.map((c, i) => (
            <span key={i} className={`viz-cell plain${done && c.pair >= 0 ? ` hit t${c.pair % 4}` : ''}`}>
              <Motion.span
                key={done ? 'out' : 'in'}
                initial={done && !m.reduced ? { rotateX: 90, opacity: 0 } : false}
                animate={{ rotateX: 0, opacity: 1 }}
                transition={m.reduced ? { duration: 0 } : { ...m.spring, delay: i * 0.04 }}
                style={{ display: 'inline-block' }}
              >{done ? c.out : c.ch}</Motion.span>
            </span>
          ))}
        </div>
        {k >= n && n > 0 && <Motion.div className="viz-result pairs" variants={m.v.enter} initial="hidden" animate="show"><span className="viz-dim">REPLACE</span><b>{chain.result}</b>{done && <><span className="viz-dim">TRANSLATE</span><b>{result}</b></>}</Motion.div>}
      </VizFrame>
    );
  }

  const left = props.fn === 'LPAD';
  const blank = props.fill === undefined; // no pad string given: Oracle pads with a blank
  const fill = blank ? ' ' : props.fill;
  const cut = plan.cut !== null;
  const padCells = plan.pad.map((ch, i) => ({ ch, i }));
  const call = padCall(props);
  const caption = [
    cut
      ? t(`${call} must be ${props.len} characters long, but the text is ${plan.input.length}.`, `${call} trebuie să aibă ${props.len} caractere, dar textul are ${plan.input.length}.`)
      : t(`${call}: the result is ${props.len} characters, so ${plan.padCount} places are still empty.`, `${call}: rezultatul are ${props.len} caractere, deci mai sunt ${plan.padCount} locuri goale.`),
    cut
      ? t(`Too long: ${props.fn} cuts the text from the right, it never pads. The last ${plan.dropped.length} letters go.`, `Prea lung: ${props.fn} taie textul din dreapta, nu mai adaugă nimic. Ultimele ${plan.dropped.length} litere dispar.`)
      : t(`The fill ${blank ? 'is a blank, because no pad string was given' : fill.length > 1 ? `'${fill}' repeats` : `'${fill}'`} on the ${left ? 'left' : 'right'}; the last repeat is cut off when it does not fit.`, `Umplerea ${blank ? 'este un spațiu, fiindcă nu s-a dat niciun șir de umplere' : fill.length > 1 ? `'${fill}' se repetă` : `'${fill}'`} în ${left ? 'stânga' : 'dreapta'}; ultima repetare se taie dacă nu încape.`),
    t(`Result: ${result} (${[...result].length} characters).`, `Rezultat: ${result} (${[...result].length} caractere).`),
  ][k];
  const letters = plan.input.map((ch, i) => ({ ch, i, gone: cut && i >= plan.cut }));
  const cells = left ? [...padCells.map(c => ({ ...c, kind: 'pad' })), ...letters.map(c => ({ ...c, kind: 'in' }))] : [...letters.map(c => ({ ...c, kind: 'in' })), ...padCells.map(c => ({ ...c, kind: 'pad' }))];
  return (
    <VizFrame widget="char-strips" stepper={s} caption={caption} label={t(`${props.fn} on a strip of characters`, `${props.fn} pe o bandă de caractere`)}>
      <div className="viz-strip" role="img" aria-label={result} style={{ '--n': cells.length }}>
        {cells.map((c, idx) => (
          <span key={`${c.kind}${c.i}`} className={`viz-cell ${c.kind}${c.kind === 'pad' && k < 1 ? ' empty' : ''}${c.gone && k >= 1 ? ' gone' : ''}`}>
            {c.kind === 'in' && <span>{c.ch}</span>}
            {c.kind === 'pad' && k >= 1 && <Motion.span variants={m.v.fall} initial="hidden" animate="show" custom={left ? plan.padCount - c.i : c.i} style={{ display: 'inline-block' }}>{c.ch}</Motion.span>}
            <i className="viz-cell-n" aria-hidden="true">{idx + 1}</i>
          </span>
        ))}
      </div>
      {k >= 2 && <Motion.div className="viz-result pairs" variants={m.v.enter} initial="hidden" animate="show"><span className="viz-dim">{t('result', 'rezultat')}</span><b>{result}</b></Motion.div>}
    </VizFrame>
  );
}
