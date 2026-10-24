import React from 'react';
import { motion as Motion } from 'motion/react';
import { useApp } from '../../../../contexts/AppContext';
import { useStepper, useVizMotion } from '../kit.js';
import { VizFrame } from '../ui.jsx';
import { allVsSome } from '../logic/all-vs-some.js';

export default function AllVsSome({ props, predict }) {
  const { t } = useApp();
  const m = useVizMotion();
  const A = allVsSome(props);
  const s = useStepper(A.count, { predict });
  const k = s.step;
  const cond = props.condition;
  const caption = [
    t('Every student with their grades. Students without a grade have an empty row.', 'Fiecare student cu notele lui. Studenții fără note au rândul gol.'),
    t(`The condition ${cond} is tested on each grade: green passes, red fails.`, `Condiția ${cond} se testează pe fiecare notă: verde trece, roșu pică.`),
    t('SOME / ANY: at least one grade passes. A student with no grades has none to pass, so no.', 'SOME / ANY: cel puțin o notă trece. Un student fără note nu are nicio notă care să treacă, deci nu.'),
    t('ALL: every grade passes. A student with no grades has nothing that fails, so yes: ALL is true on an empty list.', 'ALL: toate notele trec. Un student fără note nu are nimic care să pice, deci da: ALL e adevărat pe o listă goală.'),
    A.minus ? t(`Writing it with MINUS compares names. ${A.minus.byName.length} names come out, but ${A.minus.byKey.length} students qualify: students who share a name are merged.`, `Dacă îl scrii cu MINUS, se compară numele. Ies ${A.minus.byName.length} nume, dar se califică ${A.minus.byKey.length} studenți: studenții cu același nume se contopesc.`) : '',
  ][k];
  const dup = A.minus ? new Set(A.students.map(x => x.student.nume).filter((n, i, a) => a.indexOf(n) !== i)) : new Set();
  return (
    <VizFrame widget="all-vs-some" stepper={s} caption={caption} label={t('ALL and SOME on a student’s grades', 'ALL și SOME pe notele unui student')}>
      <div className="viz-avs">
        <div className="viz-avs-head"><span /><span>{t('grades', 'note')}</span><span>SOME</span><span>ALL</span></div>
        {A.students.map((r, i) => (
          <Motion.div key={r.student.nr_matricol} className="viz-avs-row" variants={m.v.enter} initial="hidden" animate="show" custom={Math.min(i, 8) * 0.5}>
            <span className="viz-avs-name"><b>{r.student.nume}</b> <i>{r.student.nr_matricol}</i></span>
            <span className="viz-avs-grades">
              {r.grades.length === 0 && <em className="viz-dim">{t('no grades', 'fără note')}</em>}
              {r.grades.map((g, j) => <span key={j} className={`viz-g${k >= 1 ? (r.passes[j] ? ' pass' : ' fail') : ''}`}>{g}</span>)}
            </span>
            <span className={`viz-avs-badge${k >= 2 ? (r.some ? ' yes' : ' no') : ''}`}>{k >= 2 ? (r.some ? '✓' : '✗') : ''}</span>
            <span className={`viz-avs-badge${k >= 3 ? (r.all ? ' yes' : ' no') : ''}${k >= 3 && r.grades.length === 0 ? ' vac' : ''}`}>{k >= 3 ? (r.all ? '✓' : '✗') : ''}</span>
          </Motion.div>
        ))}
      </div>
      {A.minus && k === 4 && (
        <Motion.div className="viz-minus" variants={m.v.enter} initial="hidden" animate="show">
          <div><span className="viz-dim">MINUS (nume)</span><div className="viz-minus-list">{A.minus.byName.map(n => <span key={n} className={`viz-pairchip${dup.has(n) ? ' warn' : ''}`}>{n}</span>)}</div></div>
          <div><span className="viz-dim">{t('students with ALL passing', 'studenți cu ALL trecut')}</span><div className="viz-minus-list">{A.students.filter(x => x.all).map(x => <span key={x.student.nr_matricol} className="viz-pairchip">{x.student.nume} {x.student.nr_matricol}</span>)}</div></div>
        </Motion.div>
      )}
    </VizFrame>
  );
}
