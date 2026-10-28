import React from 'react';
import { useApp } from '../../../../../contexts/AppContext';
import { treePairModel } from '../../logic/ml/tree-pair.js';
import { Val } from './mlParts.jsx';
import { roNoun, enNoun } from '../../logic/words.js';

function Item({ node, edge }) {
  const leaf = node.kind === 'leaf';
  return (
    <li className="mlv-tn">
      <span className="mlv-tn-head">
        {edge !== undefined && <span className="mlv-edge">{edge}</span>}
        {leaf
          ? <span className="mlv-leafchip" data-leaf={String(node.label)}>{'\u2192'} {String(node.label)}</span>
          : <><span className="mlv-tnum" data-value={String(node.num)}>{node.num}</span><b className="mlv-test">{node.attr}?</b></>}
      </span>
      {!leaf && <ul>{node.kids.map((k, i) => <Item key={i} node={k.node} edge={k.value} />)}</ul>}
    </li>
  );
}

// the two trees, their counts and the sentence under them (exported so a test can render the end state directly)
export function PairBody({ model: M }) {
  const { t } = useApp();
  const noun = (key, n) => ({
    tests: t(enNoun(n, 'test', 'tests'), roNoun(n, 'test', 'teste')),
    levels: t(enNoun(n, 'level', 'levels'), roNoun(n, 'nivel', 'niveluri')),
    leaves: t(enNoun(n, 'leaf', 'leaves'), roNoun(n, 'frunză', 'frunze')),
  })[key];
  return (
    <div className="viz-stage mlv-pairgrid">
      {M.sides.map((root, i) => (
        <section key={i} className="mlv-pside" data-side={i}>
          <h4>{t(M.titles[i].en, M.titles[i].ro)}</h4>
          <div className="mlv-scroll"><ul className="mlv-tree"><Item node={root} /></ul></div>
          <div className="mlv-sum">
            {M.shown.map((key) => <span key={key} className="viz-badge"><Val v={String(M.stats[i][key])} /> {noun(key, M.stats[i][key])}</span>)}
            {M.rowsInfo && <span className="viz-badge">{t('wrong', 'greșite')} <Val v={String(M.rowsInfo.errors[i])} /> / <Val v={String(M.rowsInfo.n)} /></span>}
          </div>
        </section>
      ))}
      {(M.levelDiff > 0 || M.rowsInfo) && (
        <div className="mlv-sum" style={{ gridColumn: '1 / -1' }}>
          {M.levelDiff > 0 && M.sameTests && <span className="viz-badge">{t('level difference', 'diferența de niveluri')} <Val v={String(M.levelDiff)} /></span>}
          {M.rowsInfo && <span className="viz-badge">{t('same label on', 'aceeași etichetă pe')} <Val v={String(M.rowsInfo.agree)} /> / <Val v={String(M.rowsInfo.n)} /></span>}
        </div>
      )}
    </div>
  );
}

export default function TreePair({ props }) {
  const { t } = useApp();
  const M = React.useMemo(() => treePairModel(props), [props]);
  const cap = M.caption();
  return (
    <figure className="viz" data-widget="ml-tree-pair" aria-label={t('Two trees for the same function', 'Doi arbori pentru aceeași funcție')}>
      <PairBody model={M} />
      <div className="viz-caption">{t(cap.en, cap.ro)}</div>
    </figure>
  );
}
