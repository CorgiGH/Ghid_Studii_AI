import React, { useRef } from 'react';
import { AnimatePresence, motion as Motion } from 'motion/react';
import { useApp } from '../../../../contexts/AppContext';
import { useStepper, useVizMotion } from '../kit.js';
import { VizFrame, Wires, CountUp } from '../ui.jsx';
import { cardColumns, cardLabel, joinCaption, joinHeader, joinRows, whereParts } from '../logic/join-wires.js';
import { joinSql } from '../logic/oracle.js';
import { useOracleValues } from '../useSqlRunner.js';
import { rows as rowsWord, rowsNoun } from '../logic/words.js';

const MAX_CARDS = 8;

export default function JoinWires({ props, predict }) {
  const { t } = useApp();
  const m = useVizMotion();
  const J = joinRows(props);
  const s = useStepper(J.count, { predict });
  const k = s.step;
  const box = useRef(null);
  const oracle = useOracleValues(joinSql(props), 'facultate');
  const total = oracle.values && oracle.values[0] != null && !Number.isNaN(Number(oracle.values[0])) ? Number(oracle.values[0]) : (props.filterIn === 'where' ? J.kept : J.pairs.length);
  const stage = J.stages[k];
  const group = stage.kind === 'left' ? J.groups[stage.index] : null;
  const soFar = stage.kind === 'setup' ? 0 : stage.kind === 'left' ? J.groups.slice(0, stage.index + 1).reduce((n, g) => n + g.pairs.length, 0) : J.pairs.length;
  const wirePairs = group ? group.pairs.slice(0, MAX_CARDS).map((p, i) => ({ id: `w${stage.index}-${i}`, from: 'L', to: `R${i}`, cls: p.right ? 'keep' : 'null' })) : [];
  const cap = joinCaption(J, props, k, total);
  // the column names over each side's cards: nr_matricol · id_curs · valoare
  const colsOf = (table, rows) => cardColumns(table, rows[0]).join(' · ');
  const leftCols = colsOf(props.left, J.leftRows);
  const rightCols = colsOf(props.right, J.rightRows);
  const pairText = (p) => `${cardLabel(props.left, p.left)} | ${cardLabel(props.right, p.right)}`;
  const shownRefused = group ? group.refused.slice(0, Math.max(0, MAX_CARDS - group.pairs.length)) : [];
  const hiddenRefused = group ? group.refused.length - shownRefused.length : 0;
  const W = stage.kind === 'where' ? whereParts(J) : null;
  return (
    <VizFrame widget="join-wires" stepper={s} caption={t(cap.en, cap.ro)} label={t('Rows of two tables joined by wires', 'Rândurile a două tabele unite prin fire')}>
      <div className="viz-jhead"><code>{joinHeader(props)}</code></div>
      {(stage.kind === 'left' || stage.kind === 'tail') && (
        <div className="viz-jwires viz-wirebox" ref={box}>
          <div className="viz-jcol">
            <div className="viz-tablecap"><b>{props.left}</b><span className="viz-jcols">{leftCols}</span></div>
            <AnimatePresence mode="popLayout" initial={false}>
              {stage.kind === 'left' && (
                <Motion.div key={`l${stage.index}`} data-wire="L" className="viz-jcard" variants={m.v.enter} initial="hidden" animate="show" exit="exit">{cardLabel(props.left, group.left)}</Motion.div>
              )}
              {stage.kind === 'tail' && J.tail.slice(0, 6).map((p, i) => (
                <Motion.div key={`n${i}`} className="viz-jcard null" variants={m.v.enter} initial="hidden" animate="show" custom={i}>NULL</Motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className="viz-jcol">
            <div className="viz-tablecap"><b>{props.right}</b><span className="viz-jcols">{rightCols}</span></div>
            <AnimatePresence mode="popLayout" initial={false}>
              {stage.kind === 'left' && group.pairs.slice(0, MAX_CARDS).map((p, i) => (
                <Motion.div key={`r${stage.index}-${i}`} data-wire={`R${i}`} className={`viz-jcard${p.right ? '' : ' null'}`} variants={m.v.enter} initial="hidden" animate="show" exit="exit" custom={i + 1}>{cardLabel(props.right, p.right)}</Motion.div>
              ))}
              {stage.kind === 'left' && shownRefused.map((p, i) => (
                <Motion.div key={`x${stage.index}-${i}`} className="viz-jcard refused" variants={m.v.enter} initial="hidden" animate="show" custom={i + 2}>{cardLabel(props.right, p.r)} <span aria-hidden="true">✗</span></Motion.div>
              ))}
              {stage.kind === 'tail' && J.tail.slice(0, 6).map((p, i) => (
                <Motion.div key={`t${i}`} className="viz-jcard" variants={m.v.enter} initial="hidden" animate="show" custom={i}>{cardLabel(props.right, p.right)}</Motion.div>
              ))}
            </AnimatePresence>
            {stage.kind === 'left' && group.pairs.length > MAX_CARDS && <div className="viz-dim viz-more">+{group.pairs.length - MAX_CARDS}</div>}
            {stage.kind === 'left' && hiddenRefused > 0 && <div className="viz-dim viz-more">+{hiddenRefused} ✗</div>}
          </div>
          {stage.kind === 'left' && <Wires boxRef={box} pairs={wirePairs} />}
        </div>
      )}
      {stage.kind === 'setup' && (
        <div className="viz-jsetup">
          <div className="viz-jbadge"><b>{props.left}</b><span>{J.leftRows.length} {t(rowsNoun(J.leftRows.length).en, rowsNoun(J.leftRows.length).ro)}</span></div>
          <span className="viz-arrow" aria-hidden="true">⟷</span>
          <div className="viz-jbadge"><b>{props.right}</b><span>{J.rightRows.length} {t(rowsNoun(J.rightRows.length).en, rowsNoun(J.rightRows.length).ro)}</span></div>
        </div>
      )}
      {(stage.kind === 'result' || stage.kind === 'where') && (
        <div className="viz-jlist">
          <div className="viz-dim viz-jcols">{leftCols} | {rightCols}</div>
          {stage.kind === 'result' && (
            <div className="viz-jresult">
              {J.pairs.map((p, i) => <span key={i} className={`viz-jpair${p.right ? '' : ' nul'}`}>{pairText(p)}</span>)}
            </div>
          )}
          {stage.kind === 'where' && (
            <>
              <div className="viz-jgroup">{t('stay', 'rămân')} ({W.kept.length})</div>
              <div className="viz-jresult">
                {W.kept.map((p, i) => <span key={i} className="viz-jpair">{pairText(p)}</span>)}
              </div>
              <div className="viz-jgroup no">{t('go', 'dispar')} ({W.droppedNull.length + W.droppedOther})</div>
              <div className="viz-jresult">
                {W.droppedNull.map((p, i) => <span key={i} className="viz-jpair dropped">{pairText(p)} ✗</span>)}
                {W.droppedOther > 0 && (
                  <span className="viz-jpair dropped summary">
                    {t(`+ ${rowsWord(W.droppedOther).en} with another value`, `+ ${rowsWord(W.droppedOther).ro} cu altă valoare`)} ✗
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      )}
      <div className="viz-tally">
        <span className="viz-badge">{t('rows in result', 'rânduri în rezultat')}: {k === J.count - 1 ? <CountUp key={`c${k}`} from={soFar} to={total} duration={0.6} /> : soFar}</span>
        {k > 0 && k < J.count - 1 && <button type="button" className="viz-link" onClick={() => s.goto(J.count - 1)}>{t('skip to the end', 'sari la final')}</button>}
      </div>
    </VizFrame>
  );
}
