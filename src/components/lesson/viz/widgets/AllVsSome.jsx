import React, { useState } from 'react';
import { motion as Motion } from 'motion/react';
import { useApp } from '../../../../contexts/AppContext';
import { useStepper, useVizMotion } from '../kit.js';
import { VizFrame } from '../ui.jsx';
import { allVsSome, personName } from '../logic/all-vs-some.js';

export default function AllVsSome({ props, predict }) {
  const { t } = useApp();
  const m = useVizMotion();
  const A = allVsSome(props);
  const s = useStepper(A.count, { predict });
  const [guess, setGuess] = useState(() => new Set());
  const [namesOnly, setNamesOnly] = useState(false);
  const k = s.step;
  const cond = props.condition;
  const toggle = (id) => setGuess(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const caption = [
    t(`Students who have grades, each with their grades. A grade that meets ${cond} removes the student. ${predict ? 'Click the students you think stay.' : ''}`, `Studenții care au note, fiecare cu notele lui. O notă care îndeplinește ${cond} elimină studentul. ${predict ? 'Apasă pe studenții care crezi că rămân.' : ''}`),
    t(`The condition ${cond} is tested on each grade: red is a counterexample, green is fine.`, `Condiția ${cond} se testează pe fiecare notă: roșu e contraexemplu, verde e în regulă.`),
    t('SOME: one counterexample is enough to remove the student. The column shows the first one found.', 'SOME: un singur contraexemplu e de ajuns ca să elimine studentul. Coloana arată primul găsit.'),
    t(`ALL grades fine: no counterexample, the student stays. ${A.qualifying.length} students stay.`, `TOATE notele în regulă: niciun contraexemplu, studentul rămâne. Rămân ${A.qualifying.length} studenți.`),
    A.minus ? t(`Written with MINUS on nume and prenume only, ${A.minus.byName.length} names come out for ${A.minus.byKey.length} students: the two with the same nume and prenume merge. Use the switch to compare.`, `Scris cu MINUS doar pe nume și prenume, ies ${A.minus.byName.length} nume pentru ${A.minus.byKey.length} studenți: cei doi cu același nume și prenume se contopesc. Folosește comutatorul ca să compari.`) : '',
  ][k];
  const dup = A.minus ? new Set(A.students.map(x => personName(x.student)).filter((n, i, a) => a.indexOf(n) !== i)) : new Set();
  const settled = !s.predicting;
  return (
    <VizFrame widget="all-vs-some" stepper={s} caption={caption} label={t('ALL and SOME on a student’s grades', 'ALL și SOME pe notele unui student')}>
      <div className="viz-avs">
        <div className="viz-avs-head"><span /><span>{t('grades', 'note')}</span><span>SOME</span><span>{t('stays', 'rămâne')}</span></div>
        {A.students.map((r, i) => {
          const id = r.student.nr_matricol;
          const picked = guess.has(id);
          const right = k >= 3 && settled && predict && guess.size > 0 ? (picked === r.all ? ' guess-ok' : ' guess-miss') : '';
          return (
            <Motion.div key={id} className={`viz-avs-row${picked ? ' picked' : ''}${right}`} variants={m.v.enter} initial="hidden" animate="show" custom={Math.min(i, 8) * 0.5}>
              <span className="viz-avs-name">
                {predict && s.predicting
                  ? <button type="button" className="viz-avs-pick" aria-pressed={picked} onClick={() => toggle(id)}><b>{r.student.nume}</b> <i>{id}</i></button>
                  : <><b>{r.student.nume}</b> <i>{id}</i></>}
              </span>
              <span className="viz-avs-grades">
                {r.grades.map((g, j) => <span key={j} className={`viz-g${k >= 1 ? (r.bad[j] ? ' fail' : ' pass') : ''}`}>{g}</span>)}
              </span>
              <span className={`viz-avs-badge${k >= 2 ? (r.some ? ' no' : '') : ''}`}>{k >= 2 ? (r.some ? r.counterexample : '–') : ''}</span>
              <span className={`viz-avs-badge${k >= 3 ? (r.all ? ' yes' : ' no') : ''}`}>{k >= 3 ? (r.all ? '✓' : '✗') : ''}</span>
            </Motion.div>
          );
        })}
      </div>
      {A.minus && k === 4 && (
        <Motion.div className="viz-minus-wrap" variants={m.v.enter} initial="hidden" animate="show">
          <button type="button" className="viz-btn viz-avs-switch" aria-pressed={namesOnly} onClick={() => setNamesOnly(v => !v)}>
            {namesOnly ? t('nume, prenume only: on', 'doar nume, prenume: activ') : t('nume, prenume only: off', 'doar nume, prenume: oprit')}
          </button>
          <div className="viz-minus">
            <div><span className="viz-dim">{namesOnly ? t('MINUS on (nume, prenume)', 'MINUS pe (nume, prenume)') : t('MINUS on the key', 'MINUS pe cheie')}</span>
              <div className="viz-minus-list">
                {namesOnly
                  ? A.minus.byName.map(n => <span key={n} className={`viz-pairchip${dup.has(n) ? ' warn' : ''}`}>{n}</span>)
                  : A.students.filter(x => x.all).map(x => <span key={x.student.nr_matricol} className="viz-pairchip">{x.student.nume} {x.student.nr_matricol}</span>)}
              </div>
            </div>
            <div><span className="viz-dim">{t('rows', 'rânduri')}</span><b className="viz-num">{namesOnly ? A.minus.byName.length : A.minus.byKey.length}</b></div>
          </div>
        </Motion.div>
      )}
    </VizFrame>
  );
}
