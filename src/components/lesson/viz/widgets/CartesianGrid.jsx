import React from 'react';
import { useApp } from '../../../../contexts/AppContext';
import { useStepper } from '../kit.js';
import { VizFrame, CountUp } from '../ui.jsx';
import { cartesianGrid } from '../logic/cartesian-grid.js';
import { cartesianSql } from '../logic/oracle.js';
import { useOracleValues } from '../useSqlRunner.js';

export default function CartesianGrid({ props, predict }) {
  const { t } = useApp();
  const G = cartesianGrid(props);
  const s = useStepper(G.count, { predict });
  const k = s.step;
  const oracle = useOracleValues(cartesianSql(props), 'facultate');
  const num = (i, fallback) => (oracle.values && oracle.values[i] != null && !Number.isNaN(Number(oracle.values[i])) ? Number(oracle.values[i]) : fallback);
  const total = num(0, G.total), matches = num(1, G.matches);
  const caption = [
    t(`${G.rows} ${props.left} rows down the side, ${G.cols} ${props.right} rows across the top. Every square is one possible pair.`, `${G.rows} rânduri din ${props.left} pe lateral, ${G.cols} rânduri din ${props.right} sus. Fiecare pătrat este o pereche posibilă.`),
    t(`Without a condition the join keeps every pair: ${G.rows} × ${G.cols} = ${total} rows.`, `Fără condiție, joncțiunea păstrează toate perechile: ${G.rows} × ${G.cols} = ${total} rânduri.`),
    t(`The condition ${props.on} keeps only the squares where both sides agree: ${matches} rows.`, `Condiția ${props.on} păstrează doar pătratele în care cele două părți se potrivesc: ${matches} rânduri.`),
  ][k];
  return (
    <VizFrame widget="cartesian-grid" stepper={s} caption={caption} label={t('Every pair of two tables', 'Toate perechile a două tabele')}>
      <div className="viz-cgrid-wrap">
        <div className="viz-cgrid-axis y">{props.left}</div>
        <div className="viz-cgrid-body">
          <div className="viz-cgrid-axis x">{props.right} →</div>
          <div className="viz-cgrid" style={{ gridTemplateColumns: `repeat(${G.cols}, 1fr)` }} data-step={k} role="img" aria-label={`${G.rows} x ${G.cols}`}>
            {G.hit.map((row, i) => row.map((h, j) => (
              <i key={`${i}-${j}`} className={`viz-cg ${k >= 1 ? 'on' : ''} ${k >= 2 ? (h ? 'hit' : 'off') : ''}`} style={{ transitionDelay: k === 1 ? `${(i + j) * 7}ms` : k === 2 ? `${(h ? 0 : (i + j) * 3)}ms` : '0ms' }} />
            )))}
          </div>
        </div>
      </div>
      <div className="viz-tally">
        <span className="viz-badge">{G.rows} × {G.cols}</span>
        {k === 1 && <span className="viz-badge"><CountUp key="t" to={total} duration={0.7} /> {t('rows', 'rânduri')}</span>}
        {k === 2 && <span className="viz-badge yes"><CountUp key="m" from={total} to={matches} duration={0.8} /> {t('rows', 'rânduri')}</span>}
      </div>
    </VizFrame>
  );
}
