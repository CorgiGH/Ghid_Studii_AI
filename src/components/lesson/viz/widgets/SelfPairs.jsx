import React from 'react';
import { useApp } from '../../../../contexts/AppContext';
import { useStepper } from '../kit.js';
import { VizFrame } from '../ui.jsx';
import { axisLegend, rowName, selfPairs } from '../logic/self-pairs.js';
import { selfPairsSql } from '../logic/oracle.js';
import { useOracleValues } from '../useSqlRunner.js';

export default function SelfPairs({ props, predict }) {
  const { t } = useApp();
  const P = selfPairs(props);
  const s = useStepper(P.count, { predict });
  const k = s.step;
  const oracle = useOracleValues(selfPairsSql(props), 'facultate');
  const total = oracle.values && oracle.values[0] != null && !Number.isNaN(Number(oracle.values[0])) ? Number(oracle.values[0]) : P.pairs.length;
  const half = props.order === '<';
  const idxMatch = half ? 3 : 2;
  const idxMirror = 2;
  const caption = [
    t(`The same table twice, as a and b: ${P.rows.length} × ${P.rows.length} squares, one for every possible pair.`, `Același tabel de două ori, ca a și b: ${P.rows.length} × ${P.rows.length} pătrate, câte unul pentru fiecare pereche posibilă.`),
    t('A student paired with themselves is not a pair: the diagonal goes.', 'Un student împerecheat cu el însuși nu e o pereche: diagonala dispare.'),
    ...(half ? [t(`${props.order} keeps each couple once: (a, b) stays, (b, a) is dropped.`, `${props.order} păstrează fiecare cuplu o singură dată: (a, b) rămâne, (b, a) dispare.`)] : []),
    t(`Squares where ${props.pairOn} is equal on both sides: ${total} pairs${half ? '' : ', each couple twice (once in each order)'}.`, `Pătratele în care ${props.pairOn} e egal pe ambele părți: ${total} perechi${half ? '' : ', fiecare cuplu de două ori (în ambele ordini)'}.`),
  ][k];
  const n = P.rows.length;
  return (
    <VizFrame widget="self-pairs" stepper={s} caption={caption} label={t('A table paired with itself', 'Un tabel împerecheat cu el însuși')}>
      <div className="viz-matrix-wrap">
        <div className="viz-matrix" style={{ gridTemplateColumns: `auto repeat(${n}, 1fr)` }} role="img" aria-label={`${n} x ${n}`}>
          <span className="viz-mx-corner">a \ b</span>
          {P.rows.map((r, j) => <span key={j} className="viz-mx-h">{String(r[P.key])}</span>)}
          {P.rows.map((r, i) => (
            <React.Fragment key={i}>
              <span className="viz-mx-h side">{String(r[P.key])}</span>
              {P.cells[i].map((c, j) => {
                let cls = 'in';
                if (c === 'self') cls = k >= 1 ? 'gone' : 'in';
                else if (c === 'skipped') cls = k >= idxMirror && half ? 'gone' : 'in';
                else if (c === 'same') cls = k >= idxMatch ? 'hit' : 'in';
                else cls = k >= idxMatch ? 'off' : 'in';
                return <i key={j} className={`viz-mx ${cls}`} style={{ transitionDelay: `${(i + j) * 8}ms` }} />;
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
      <div className="viz-mx-legend viz-dim">
        {axisLegend(P.rows, P.key).map(x => <span key={x.key}><b>{x.key}</b> {x.name}</span>)}
      </div>
      {k >= idxMatch && (
        <div className="viz-pairlist">
          {P.pairs.map((p, i) => <span key={i} className="viz-pairchip" style={{ animationDelay: `${i * 30}ms` }}>{rowName(p.a, P.rows, P.key)} · {rowName(p.b, P.rows, P.key)}</span>)}
        </div>
      )}
    </VizFrame>
  );
}
