import React, { useState } from 'react';
import { motion as Motion } from 'motion/react';
import { useApp } from '../../../../contexts/AppContext';
import { useStepper, useVizMotion } from '../kit.js';
import { VizFrame } from '../ui.jsx';
import { allVsSome, avsCaptions, firstHitHeader, personName } from '../logic/all-vs-some.js';

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
  const cap = avsCaptions(A, cond, predict)[k];
  const caption = t(cap.en, cap.ro);
  const head = firstHitHeader(cond);
  const dup = A.minus ? new Set(A.students.map(x => personName(x.student)).filter((n, i, a) => a.indexOf(n) !== i)) : new Set();
  const settled = !s.predicting;
  // after the reveal each guess is marked by an outline on the name (explained by the legend), not by a second ✓/✗
  const marked = k >= 3 && settled && predict && guess.size > 0;
  return (
    <VizFrame widget="all-vs-some" stepper={s} caption={caption} label={t('All grades or at least one, per student', 'Toate notele sau măcar una, pentru fiecare student')}>
      <div className="viz-avs">
        <div className="viz-avs-head"><span /><span>{t('grades', 'note')}</span><span>{t(head.en, head.ro)}</span><span>{t('stays', 'rămâne')}</span></div>
        {A.students.map((r, i) => {
          const id = r.student.nr_matricol;
          const picked = guess.has(id);
          const right = marked ? (picked === r.all ? ' guess-ok' : ' guess-miss') : '';
          return (
            <Motion.div key={id} className={`viz-avs-row${picked ? ' picked' : ''}${right}`} variants={m.v.enter} initial="hidden" animate="show" custom={Math.min(i, 8) * 0.5}>
              <span className="viz-avs-name">
                {predict && s.predicting
                  ? <button type="button" className="viz-avs-pick" aria-pressed={picked} onClick={() => toggle(id)}><b>{r.student.nume}</b> <i>{id}</i></button>
                  : <span className="viz-avs-who"><b>{r.student.nume}</b> <i>{id}</i></span>}
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
      {marked && <div className="viz-dim viz-note">{t('Green outline: you guessed right. Red outline: you guessed wrong.', 'Chenar verde: ai ghicit. Chenar roșu: ai greșit.')}</div>}
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
