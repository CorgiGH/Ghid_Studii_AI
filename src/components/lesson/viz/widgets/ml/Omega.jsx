import React from 'react';
import { useApp } from '../../../../../contexts/AppContext';
import { useStepper } from '../../kit.js';
import { VizFrame } from '../../ui.jsx';
import { omega } from '../../logic/ml/omega.js';
import { Stat } from './probWidgets.jsx';
import './probWidgets.css';
import './omega.css';

const STAT = {
  remaining: { en: 'remaining', ro: 'rămase', key: false },
  favourable: { en: 'favourable', ro: 'favorabile', key: false },
  ratio: { en: 'by counting', ro: 'prin numărare', key: true },
  mass: { en: 'mass of one outcome', ro: 'masa unui rezultat', key: false },
  condMass: { en: 'mass after', ro: 'masa după', key: false },
  factor: { en: 'factor', ro: 'factor', key: false },
  cond: { en: 'result', ro: 'rezultat', key: true },
};

function statLabel(id, ev, t) {
  if (id === 'pG') return `P(${ev.learned})`;
  if (id === 'pAG') return `P(${ev.asked} ∩ ${ev.learned})`;
  if (id === 'pA') return `P(${ev.asked})`;
  if (id === 'cond') return `P(${ev.asked} | ${ev.learned})`;
  if (id === 'ratio') return `P(${ev.asked} | ${ev.learned}) ${t('by counting', 'prin numărare')}`;
  const s = STAT[id];
  return s ? t(s.en, s.ro) : id;
}

// The picture and the caption of one frame, from the logic module only. The stepper is passed in so a test can draw any frame.
export function OmegaBody({ props, stepper }) {
  const { t } = useApp();
  const L = omega(props);
  const f = L.frame(stepper.step);
  const ev = f.event;
  const stats = f.marks.filter((m) => m.id !== 'omega-size');
  const learned = f.whole ? 'Ω' : ev.learned;
  return (
    <VizFrame widget="ml-omega" stepper={stepper} caption={t(f.caption.en, f.caption.ro)} label={t('The outcomes of the experiment and the event we learn', 'Rezultatele experimentului și evenimentul aflat')}>
      <div className="mlw mlo" data-step={f.step} data-kind={f.kind}>
        <div className="mlw-legend">
          <span className="mlw-key" data-mark="omega-size" data-value={f.cells.length}>Ω = {f.cells.length} {t('outcomes', 'rezultate')}</span>
          <span className="mlw-key"><span className="mlw-swatch g" />{learned}{f.whole ? '' : ` ${t('(known)', '(aflat)')}`}</span>
          <span className="mlw-key"><span className="mlw-swatch a" />{ev.asked} {t('(asked)', '(întrebat)')}</span>
        </div>
        <div className="mlo-cells" role="list" aria-label={t(`The ${f.cells.length} outcomes`, `Cele ${f.cells.length} rezultate`)}>
          {f.cells.map((c) => (
            <div key={c.label} role="listitem" className={`mlo-cell ${c.status}${c.inG ? ' in-g' : ''}${c.inA ? ' in-a' : ''}`} data-mark={`cell:${c.label}`} data-label={c.label} data-status={c.status} {...(c.mass !== null ? { 'data-value': c.mass } : {})}>
              <span className="mlo-label">{c.label}</span>
              <span className="mlo-tags">{c.inG ? learned : ''}{c.inG && c.inA ? ' ' : ''}{c.inA ? ev.asked : ''}</span>
              {c.mass !== null && <span className="mlo-mass">{c.mass}</span>}
            </div>
          ))}
        </div>
        <div className="mlw-stats">
          {stats.map((m) => <Stat key={m.id} id={m.id} value={m.value} label={statLabel(m.id, ev, t)} keyed={!!STAT[m.id]?.key} />)}
        </div>
      </div>
    </VizFrame>
  );
}

export default function Omega({ props, predict }) {
  const L = omega(props);
  const s = useStepper(L.n, { predict });
  return <OmegaBody props={props} stepper={s} />;
}
