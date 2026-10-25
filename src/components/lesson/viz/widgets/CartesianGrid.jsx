import React from 'react';
import { useApp } from '../../../../contexts/AppContext';
import { useStepper } from '../kit.js';
import { VizFrame, CountUp } from '../ui.jsx';
import { cartesianAxes, cartesianCaption, cartesianGrid } from '../logic/cartesian-grid.js';
import { cartesianSql } from '../logic/oracle.js';
import { useOracleValues } from '../useSqlRunner.js';
import { rowsNoun } from '../logic/words.js';

export default function CartesianGrid({ props, predict }) {
  const { t } = useApp();
  const G = cartesianGrid(props);
  const A = cartesianAxes(G, props);
  const s = useStepper(G.count, { predict });
  const k = s.step;
  const oracle = useOracleValues(cartesianSql(props), 'facultate');
  const num = (i, fallback) => (oracle.values && oracle.values[i] != null && !Number.isNaN(Number(oracle.values[i])) ? Number(oracle.values[i]) : fallback);
  const total = num(0, G.total), matches = num(1, G.matches);
  const cap = cartesianCaption(G, A, props, k, total, matches);
  const noun = (n) => t(rowsNoun(n).en, rowsNoun(n).ro);
  return (
    <VizFrame widget="cartesian-grid" stepper={s} caption={t(cap.en, cap.ro)} label={t('Every pair of two tables', 'Toate perechile a două tabele')}>
      <div className="viz-cgrid-wrap">
        <div className="viz-cgrid-axis y">{props.left} ({A.lcol})</div>
        <div className="viz-cgrid-body">
          <div className="viz-cgrid-axis x">{props.right} ({A.rcol}) →</div>
          {/* one grid for the labels and the squares, so each key sits exactly over / beside its squares */}
          <div className="viz-cgrid" style={{ gridTemplateColumns: `auto repeat(${G.cols}, minmax(0, 1fr))` }} data-step={k} role="img" aria-label={`${G.rows} x ${G.cols}`}>
            <span className="viz-cg-corner" aria-hidden="true" />
            {A.groups.map(g => <span key={g.key} className="viz-cg-col" style={{ gridColumn: `${g.start + 2} / span ${g.span}` }}>{g.key}</span>)}
            {G.hit.map((row, i) => (
              <React.Fragment key={i}>
                <span className={`viz-cg-row${k >= 2 && A.empty.includes(A.rowKeys[i]) ? ' empty' : ''}`}>{A.rowKeys[i]}</span>
                {row.map((h, j) => (
                  <i key={j} className={`viz-cg ${k >= 1 ? 'on' : ''} ${k >= 2 ? (h ? 'hit' : 'off') : ''}`} style={{ transitionDelay: k === 1 ? `${(i + j) * 7}ms` : k === 2 ? `${(h ? 0 : (i + j) * 3)}ms` : '0ms' }} />
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
      <div className="viz-tally">
        <span className="viz-badge">{G.rows} × {G.cols}</span>
        {k === 1 && <span className="viz-badge"><CountUp key="t" to={total} duration={0.7} /> {noun(total)}</span>}
        {k === 2 && <span className="viz-badge yes"><CountUp key="m" from={total} to={matches} duration={0.8} /> {noun(matches)}</span>}
      </div>
    </VizFrame>
  );
}
