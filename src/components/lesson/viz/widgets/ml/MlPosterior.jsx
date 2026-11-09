import React, { useMemo } from 'react';
import { useApp } from '../../../../../contexts/AppContext';
import { useStepper } from '../../kit.js';
import { VizFrame } from '../../ui.jsx';
import { mlPosterior } from '../../logic/ml/posterior.js';
import { withSubs } from './subscript.jsx';
import './ml-common.css';
import './ml-widgets.css';

const NOTE = {
  rel: { en: 'A full bar is the largest value in this view.', ro: 'Bara plină este cea mai mare valoare din acest cadru.' },
  log: { en: 'Logarithmic axis: each step to the right is ten times more. Bars compare orders of magnitude.', ro: 'Axă logaritmică: fiecare pas spre dreapta înseamnă de zece ori mai mult. Barele compară ordinele de mărime.' },
};
const BADGE = { lik: 'h_ML', prod: 'h_MAP', post: 'h_MAP' };

// One frame as a pure view of the logic state (the tests render it on its own).
export function PosteriorView({ frame }) {
  const { t } = useApp();
  const say = (f) => t(f.text.en, f.text.ro);
  const barIds = new Set(frame.marks.filter((m) => /^(prior|lik|prod|post|eq)\d+$/.test(m.id)).map((m) => m.id));
  const pctIds = new Set(frame.marks.filter((m) => /^pct\d+$/.test(m.id)).map((m) => m.id));
  const markById = (id) => frame.marks.find((m) => m.id === id);
  const prefix = { prior: 'prior', lik: 'lik', prod: 'prod', post: 'post' }[frame.quantity];
  const idFor = (i) => (frame.id === 'equal' ? `eq${i}` : `${prefix}${i}`);
  const extras = frame.marks.filter((m) => !barIds.has(m.id) && !pctIds.has(m.id) && !/^g[pl]\d+$/.test(m.id));
  return (
    <div className="mlv-stage">
      <div className="viz-tablewrap mlv-given">
        <table className="viz-table">
          <thead><tr><th>{t('Hypothesis', 'Ipoteza')}</th><th>P(h)</th><th>P(D|h)</th></tr></thead>
          <tbody>
            {frame.given.map((g) => (
              <tr key={g.name}>
                <td>{g.name}</td>
                <td className={g.changed ? 'mlv-changed' : undefined} data-mark={g.prior.id} data-value={g.prior.fact.canon}>{say(g.prior.fact)}</td>
                <td data-mark={g.lik.id} data-value={g.lik.fact.canon}>{say(g.lik.fact)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mlv-bars">
        {frame.bars.map((b, i) => {
          const m = b.fact ? markById(idFor(i)) : null;
          const pct = b.pct ? markById(`pct${i}`) : null;
          return (
            <div key={b.name} className={`mlv-bar${b.win ? ' win' : ''}`} data-hypothesis={b.name}>
              <div className="mlv-bar-head">
                <span>{b.name}{b.win && BADGE[frame.quantity] && <> <span className="mlv-badge">{withSubs(BADGE[frame.quantity])}</span></>}</span>
                {m && (
                  <b data-mark={m.id} data-value={m.fact.canon}>
                    {say(m.fact)}
                    {pct && <> (<span data-mark={pct.id} data-value={pct.fact.canon}>{say(pct.fact)}</span>)</>}
                  </b>
                )}
              </div>
              <div className="mlv-bar-track"><span className="mlv-bar-fill" style={{ width: `${(Math.max(0, Math.min(1, b.fraction)) * 100).toFixed(1)}%` }} /></div>
            </div>
          );
        })}
      </div>
      {frame.scale.ticks.length > 0 && (
        <div className="mlv-axisrow" aria-hidden="true">{frame.scale.ticks.map((tk) => <span key={tk.canon}>{say(tk)}</span>)}</div>
      )}
      {NOTE[frame.scale.kind] && <div className="mlv-note">{t(NOTE[frame.scale.kind].en, NOTE[frame.scale.kind].ro)}</div>}
      {extras.length > 0 && (
        <ul className="mlv-readout" aria-label={t('Values on the drawing', 'Valorile din desen')}>
          {extras.map((m) => (
            <li key={m.id} data-mark={m.id} data-value={m.fact.canon}>
              <span className="mlv-name">{t(m.label.en, m.label.ro)}</span>
              <b>{say(m.fact)}</b>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function MlPosterior({ props, predict }) {
  const { t } = useApp();
  const model = useMemo(() => mlPosterior(props), [props]);
  const s = useStepper(model.n, { predict });
  const frame = model.frames[s.step];
  return (
    <VizFrame widget="ml-posterior" stepper={s} caption={withSubs(t(frame.caption.en, frame.caption.ro))} label={t('Prior, likelihood and posterior bars', 'Bare de a priori, verosimilitate și a posteriori')}>
      <PosteriorView frame={frame} />
    </VizFrame>
  );
}
