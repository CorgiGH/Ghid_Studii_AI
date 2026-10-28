import React from 'react';
import { useApp } from '../../../../../contexts/AppContext';
import { useStepper } from '../../kit.js';
import { VizFrame } from '../../ui.jsx';
import { indep2x2 } from '../../logic/ml/indep2x2.js';
import { loc } from '../../logic/ml/probFormat.js';
import './probWidgets.css';
import './indep2x2.css';

const SIGN = { eq: '=', ne: '≠' };

function Cell({ cl, lang, tProduct }) {
  const d = (v) => loc(v, lang);
  return (
    <td className={`mli-cell${cl.sign ? ` ${cl.sign}` : ''}${cl.actual === null ? ' empty' : ''}`} data-cell={cl.id}>
      {cl.actual !== null
        ? <b className="mli-actual" data-mark={`cell-${cl.id}`} data-value={cl.actual}>{d(cl.actual)}</b>
        : <b className="mli-actual q" aria-label="?">·</b>}
      <span className="mli-prodline">
        {cl.sign && <span className="mli-sign" data-mark={`sign-${cl.id}`} data-value={cl.sign} aria-label={cl.sign === 'eq' ? '=' : '≠'}>{SIGN[cl.sign]}</span>}
        {cl.product !== null && <span className="mli-prod" data-mark={`prod-${cl.id}`} data-value={cl.product}>{tProduct} {d(cl.product)}</span>}
      </span>
    </td>
  );
}

// The picture and the caption of one frame, from the logic module only.
export function Indep2x2Body({ props, stepper }) {
  const { t, lang } = useApp();
  const l = lang === 'en' ? 'en' : 'ro';
  const L = indep2x2(props);
  const f = L.frame(stepper.step);
  const X = props.labels.x;
  const Y = props.labels.y;
  const cell = Object.fromEntries(f.cells.map((c) => [c.id, c]));
  const q = L.q;
  const non = (v) => t(`not ${v}`, `non ${v}`);
  const d = (v) => loc(v, l);
  const tProduct = t('product', 'produs');
  return (
    <VizFrame widget="ml-indep-2x2" stepper={stepper} caption={t(f.caption.en, f.caption.ro)} label={t(`A 2 by 2 table of the events ${X} and ${Y}`, `Un tabel 2 pe 2 cu evenimentele ${X} și ${Y}`)}>
      <div className="mlw mli" data-step={f.step} data-kind={f.kind} data-variant={f.variant}>
        <div className="mlw-scroll">
          <table className="mli-table">
            <thead>
              <tr>
                <th scope="col" />
                <th scope="col">{Y}</th>
                <th scope="col">{non(Y)}</th>
                <th scope="col" className="mli-margin">{t('row total', 'total rând')}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">{X}</th>
                <Cell cl={cell['00']} lang={l} tProduct={tProduct} />
                <Cell cl={cell['01']} lang={l} tProduct={tProduct} />
                <td className="mli-margin"><b data-mark="pX" data-value={q.pX}>{d(q.pX)}</b></td>
              </tr>
              <tr>
                <th scope="row">{non(X)}</th>
                <Cell cl={cell['10']} lang={l} tProduct={tProduct} />
                <Cell cl={cell['11']} lang={l} tProduct={tProduct} />
                <td className="mli-margin"><b data-mark="pNX" data-value={q.pNX}>{d(q.pNX)}</b></td>
              </tr>
              <tr className="mli-margin">
                <th scope="row">{t('column total', 'total coloană')}</th>
                <td><b data-mark="pY" data-value={q.pY}>{d(q.pY)}</b></td>
                <td><b data-mark="pNY" data-value={q.pNY}>{d(q.pNY)}</b></td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mlw-stats">
          {f.marks.some((m) => m.id === 'condYX') && (
            <span className="mlw-stat" data-mark="condYX" data-value={q.condYX}><span>{`P(${Y} | ${X})`}</span><b>{d(q.condYX)}</b></span>
          )}
          {f.marks.some((m) => m.id === 'verdict') && (
            <span className="mlw-stat key" data-mark="verdict" data-value={f.marks.find((m) => m.id === 'verdict').value}>
              <b>{f.marks.find((m) => m.id === 'verdict').value === 'independent' ? t('independent', 'independente') : t('dependent', 'dependente')}</b>
            </span>
          )}
        </div>
      </div>
    </VizFrame>
  );
}

export default function Indep2x2({ props, predict }) {
  const L = indep2x2(props);
  const s = useStepper(L.n, { predict });
  return <Indep2x2Body props={props} stepper={s} />;
}
