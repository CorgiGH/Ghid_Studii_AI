import React, { useRef } from 'react';
import { AnimatePresence, motion as Motion } from 'motion/react';
import { useApp } from '../../../../contexts/AppContext';
import { useStepper, useVizMotion } from '../kit.js';
import { VizFrame, Wires, CountUp } from '../ui.jsx';
import { joinRows } from '../logic/join-wires.js';
import { joinSql } from '../logic/oracle.js';
import { useOracleValues } from '../useSqlRunner.js';

const KEYS = { studenti: ['nr_matricol', 'nume'], note: ['nr_matricol', 'id_curs', 'valoare'], cursuri: ['id_curs', 'titlu_curs'], didactic: ['id_prof', 'id_curs'], profesori: ['id_prof', 'nume'] };
const label = (table, row) => (row ? (KEYS[table] || Object.keys(row).slice(0, 3)).map(c => (row[c] === null ? 'NULL' : row[c])).join(' · ') : 'NULL');

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
  const wirePairs = group ? group.pairs.map((p, i) => ({ id: `w${stage.index}-${i}`, from: 'L', to: `R${i}`, cls: p.right ? 'keep' : 'null' })) : [];
  const outer = props.kind !== 'inner';
  const caption = stage.kind === 'setup'
    ? t(`${J.leftRows.length} rows in ${props.left}, ${J.rightRows.length} in ${props.right}. A pair is made when ${props.on}${props.filterIn === 'on' ? ` and ${props.filter}` : ''}.`, `${J.leftRows.length} rânduri în ${props.left}, ${J.rightRows.length} în ${props.right}. Se formează o pereche când ${props.on}${props.filterIn === 'on' ? ` și ${props.filter}` : ''}.`)
    : stage.kind === 'left'
      ? (group.pairs.some(p => p.right)
        ? t(`This row finds ${group.pairs.length} partner${group.pairs.length === 1 ? '' : 's'}: ${group.pairs.length} row${group.pairs.length === 1 ? '' : 's'} in the result.${group.refused.length ? ` ${group.refused.length} candidate${group.refused.length === 1 ? '' : 's'} failed the filter in ON.` : ''}`, `Rândul acesta găsește ${group.pairs.length} ${group.pairs.length === 1 ? 'partener' : 'parteneri'}: ${group.pairs.length} ${group.pairs.length === 1 ? 'rând' : 'rânduri'} în rezultat.${group.refused.length ? ` ${group.refused.length} ${group.refused.length === 1 ? 'candidat a picat' : 'candidați au picat'} filtrul din ON.` : ''}`)
        : outer && props.kind !== 'right'
          ? t('No partner. The join keeps this row anyway and fills the other side with NULL.', 'Niciun partener. Joncțiunea păstrează rândul și completează cealaltă parte cu NULL.')
          : t('No partner, so this row leaves no trace in the result.', 'Niciun partener, deci rândul nu apare în rezultat.'))
      : stage.kind === 'tail'
        ? t(`${J.tail.length} rows of ${props.right} had no partner; this join keeps them with NULL on the left.`, `${J.tail.length} rânduri din ${props.right} nu au avut partener; joncțiunea le păstrează cu NULL în stânga.`)
        : t(`The filter in WHERE runs after the join: rows where it is not true are dropped, including the NULL ones. ${J.kept} rows are left.`, `Filtrul din WHERE rulează după joncțiune: rândurile pentru care nu e adevărat dispar, inclusiv cele cu NULL. Rămân ${J.kept} rânduri.`);
  return (
    <VizFrame widget="join-wires" stepper={s} caption={caption} label={t('Rows of two tables joined by wires', 'Rândurile a două tabele unite prin fire')}>
      <div className="viz-jhead"><code>{props.left} {props.kind.toUpperCase()} JOIN {props.right} ON {props.on}{props.filterIn === 'on' ? ` AND ${props.filter}` : ''}{props.filterIn === 'where' ? ` WHERE ${props.filter}` : ''}</code></div>
      {(stage.kind === 'left' || stage.kind === 'tail') && (
        <div className="viz-jwires viz-wirebox" ref={box}>
          <div className="viz-jcol">
            <div className="viz-tablecap"><b>{props.left}</b></div>
            <AnimatePresence mode="popLayout" initial={false}>
              {stage.kind === 'left' && (
                <Motion.div key={`l${stage.index}`} data-wire="L" className="viz-jcard" variants={m.v.enter} initial="hidden" animate="show" exit="exit">{label(props.left, group.left)}</Motion.div>
              )}
              {stage.kind === 'tail' && J.tail.slice(0, 6).map((p, i) => (
                <Motion.div key={`n${i}`} className="viz-jcard null" variants={m.v.enter} initial="hidden" animate="show" custom={i}>NULL</Motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className="viz-jcol">
            <div className="viz-tablecap"><b>{props.right}</b></div>
            <AnimatePresence mode="popLayout" initial={false}>
              {stage.kind === 'left' && group.pairs.slice(0, 8).map((p, i) => (
                <Motion.div key={`r${stage.index}-${i}`} data-wire={`R${i}`} className={`viz-jcard${p.right ? '' : ' null'}`} variants={m.v.enter} initial="hidden" animate="show" exit="exit" custom={i + 1}>{label(props.right, p.right)}</Motion.div>
              ))}
              {stage.kind === 'left' && group.refused.slice(0, 4).map((p, i) => (
                <Motion.div key={`x${stage.index}-${i}`} className="viz-jcard refused" variants={m.v.enter} initial="hidden" animate="show" custom={i + 5}>{label(props.right, p.r)} <span aria-hidden="true">✗</span></Motion.div>
              ))}
              {stage.kind === 'tail' && J.tail.slice(0, 6).map((p, i) => (
                <Motion.div key={`t${i}`} className="viz-jcard" variants={m.v.enter} initial="hidden" animate="show" custom={i}>{label(props.right, p.right)}</Motion.div>
              ))}
            </AnimatePresence>
            {stage.kind === 'left' && group.pairs.length > 8 && <div className="viz-dim viz-more">+{group.pairs.length - 8}</div>}
          </div>
          {stage.kind === 'left' && <Wires boxRef={box} pairs={wirePairs} />}
        </div>
      )}
      {stage.kind === 'setup' && (
        <div className="viz-jsetup">
          <div className="viz-jbadge"><b>{props.left}</b><span>{J.leftRows.length} {t('rows', 'rânduri')}</span></div>
          <span className="viz-arrow" aria-hidden="true">⟷</span>
          <div className="viz-jbadge"><b>{props.right}</b><span>{J.rightRows.length} {t('rows', 'rânduri')}</span></div>
        </div>
      )}
      {stage.kind === 'where' && (
        <div className="viz-jresult">
          {J.pairs.map((p, i) => (
            <span key={i} className={`viz-jpair${p.kept ? ' kept' : ' dropped'}`} style={{ transitionDelay: m.reduced ? '0ms' : `${Math.min(i, 30) * 12}ms` }}>
              {label(props.left, p.left)} | {label(props.right, p.right)}
            </span>
          ))}
        </div>
      )}
      <div className="viz-tally">
        <span className="viz-badge">{t('rows in result', 'rânduri în rezultat')}: {k === J.count - 1 ? <CountUp key={`c${k}`} from={soFar} to={total} duration={0.6} /> : soFar}</span>
        {k > 0 && k < J.count - 1 && <button type="button" className="viz-link" onClick={() => s.goto(J.count - 1)}>{t('skip to the end', 'sari la final')}</button>}
      </div>
    </VizFrame>
  );
}
