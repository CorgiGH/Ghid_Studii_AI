import React from 'react';
import { motion as Motion } from 'motion/react';
import { useApp } from '../../../../contexts/AppContext';
import { useStepper, useVizMotion } from '../kit.js';
import { VizFrame } from '../ui.jsx';
import { decodeCaption, decodeSieve } from '../logic/decode-sieve.js';
import { decodeSql } from '../logic/oracle.js';
import { useOracleValues } from '../useSqlRunner.js';

const LAYER = 46;

export default function DecodeSieve({ props, predict }) {
  const { t } = useApp();
  const m = useVizMotion();
  const D = decodeSieve(props);
  const s = useStepper(D.count, { predict });
  const k = s.step;
  const oracle = useOracleValues(decodeSql(props), 'facultate');
  const res = (i) => (oracle.values && oracle.values[i] !== undefined && oracle.values[i] !== null ? oracle.values[i] : D.routes[i].result);
  const cur = k >= 1 ? D.routes[k - 1] : null;
  const layers = props.pairs.length;
  const target = cur ? (cur.index >= 0 ? cur.index : layers) : 0;
  const show = (v) => (v === null ? 'NULL' : String(v));
  const cap = decodeCaption(props, cur, cur ? res(k - 1) : null);
  const caption = t(cap.en, cap.ro);
  return (
    <VizFrame widget="decode-sieve" stepper={s} caption={caption} label={t('DECODE as a stack of sieves', 'DECODE ca un teanc de site')}>
      <div className="viz-sieve">
        <div className="viz-sieve-stack" style={{ height: (layers + 1) * LAYER + 40 }}>
          {props.pairs.map(([sv, rv], i) => (
            <div key={i} className={`viz-layer${cur && !cur.isDefault && cur.index === i ? ' caught' : ''}`} style={{ top: 40 + i * LAYER, height: LAYER - 8 }}>
              <code>{show(sv)}</code><span className="viz-layer-arrow">→</span><b>{rv}</b>
            </div>
          ))}
          <div className={`viz-layer dflt${cur && cur.isDefault ? ' caught' : ''}`} style={{ top: 40 + layers * LAYER, height: LAYER - 8 }}>
            <code>{t('anything else', 'orice altceva')}</code><span className="viz-layer-arrow">→</span><b>{props.default !== undefined ? props.default : 'NULL'}</b>
          </div>
          {cur && (
            <Motion.div
              key={k}
              className={`viz-ball${cur.value === null ? ' nul' : ''}`}
              initial={{ y: 0 }}
              animate={{ y: 40 + target * LAYER + 3 }}
              transition={m.reduced ? { duration: 0 } : { type: 'spring', stiffness: 120, damping: 15, mass: 0.9 }}
            >{show(cur.value)}</Motion.div>
          )}
        </div>
        <div className="viz-sieve-out" aria-label={t('Results so far', 'Rezultatele de până acum')}>
          {D.routes.slice(0, Math.max(0, k)).map((r, i) => (
            <Motion.div key={i} className={`viz-out-row${i === k - 1 ? ' cur' : ''}`} variants={m.v.enter} initial="hidden" animate="show">
              <code>{show(r.value)}</code><span>→</span><b>{res(i) === null ? 'NULL' : String(res(i))}</b>
            </Motion.div>
          ))}
        </div>
      </div>
    </VizFrame>
  );
}
