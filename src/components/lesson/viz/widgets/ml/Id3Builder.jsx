import React, { useCallback, useMemo, useState } from 'react';
import { useApp } from '../../../../../contexts/AppContext';
import { useStepper } from '../../kit.js';
import { VizFrame } from '../../ui.jsx';
import { id3Model } from '../../logic/ml/id3-builder.js';
import { fmt4, fmtBig, showN, headerOf, MINUS } from '../../logic/ml/id3-common.js';
import { CountBox, PickBar, Val, allAnswered } from './mlParts.jsx';

const useL = () => {
  const { t } = useApp();
  const L = (x) => (x !== null && typeof x === 'object' ? t(x.en, x.ro) : String(x));
  return { t, L };
};

// the data table of a widget (the rows the boxes count); rowClass marks rows in or out of a node
function DataTable({ headers, rows, rowClass }) {
  const { L } = useL();
  return (
    <div className="viz-tablewrap mlv-table">
      <table className="viz-table">
        <thead><tr>{headers.map((h, i) => <th key={i}>{L(h)}</th>)}</tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={rowClass ? rowClass(i) : ''}>
              {r.map((c, j) => <td key={j} data-value={String(c)}>{String(c)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------- mode stumps ----------------
export function StumpsStage({ model: M, k, predict = false, picks = {} }) {
  const { t, L } = useL();
  const f = M.frames[k];
  const cards = f.kind === 'setup' ? 0 : f.kind === 'boxes' ? f.i + 1 : M.stumps.length;
  const showW = f.kind === 'formula' || f.kind === 'values' || f.kind === 'winner';
  const showVal = f.kind === 'values' || f.kind === 'winner';
  const winner = f.kind === 'winner';
  const tg = L(M.targetLabel);
  const hideCur = M.boxesHidden(k, { predict, picks });
  return (
    <div className="mlv-stack">
      {M.table && <DataTable headers={M.table.headers} rows={M.table.rows} />}
      <div className="mlv-root" data-node="root">
        <b>{t('Root', 'Rădăcina')}</b>
        <CountBox counts={M.rootCounts} />
        <span className="mlv-dim">N = <Val v={showN(M.N)} /></span>
        {winner && <span>H({tg}) = <Val v={fmt4(M.hRoot)} /></span>}
      </div>
      {M.stumps.slice(0, cards).map((s, i) => {
        const isBest = showVal && M.tied.includes(i) && (!winner || i === M.best);
        return (
          <section key={s.attr} className={`mlv-card${isBest ? ' best' : ''}`} data-attr={s.attr}>
            <h4 className="mlv-card-h">{L(s.label)}</h4>
            <div className="mlv-branches">
              {s.branches.map((b, j) => (
                <div key={j} className="mlv-branch">
                  <span className="mlv-bval">{L(b.value)}</span>
                  <CountBox counts={b.counts} hidden={hideCur && f.i === i} />
                  {winner && i === M.best && (
                    <>
                      <span className="mlv-leaf">{'→'} {String(M.leaves[i][j].label)}{M.leaves[i][j].tie ? t(' (a tie)', ' (egalitate)') : ''}</span>
                      <span className="mlv-wt">{t('wrong', 'greșite')}: <Val v={showN(M.errs[i][j])} /></span>
                    </>
                  )}
                </div>
              ))}
            </div>
            {showW && (
              <div className="mlv-formula">
                <span>H({tg}|{L(s.label)}) =</span>
                {s.branches.map((b, j) => (
                  <span key={j} className="mlv-term">
                    {j > 0 && <span aria-hidden="true">+</span>}
                    <Val v={`${showN(b.n)}/${showN(M.N)}`} />
                    <span aria-hidden="true">{'·'} H</span>
                    <CountBox counts={b.counts} />
                  </span>
                ))}
                {showVal && <><span aria-hidden="true">=</span><b className="mlv-hc" data-value={fmt4(s.hc)}>{fmt4(s.hc)}</b></>}
              </div>
            )}
            {winner && i === M.best && (
              <div className="mlv-formula">
                <span>IG = <Val v={fmt4(s.ig)} /></span>
                <span>{t('training error', 'eroarea la antrenare')} = <Val v={showN(M.errFrac)} /></span>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

// ---------------- mode compare ----------------
function PairRows({ c, f }) {
  const { t, L } = useL();
  const [A, B] = c.stumps;
  const showSym = c.decided && (f.kind === 'symbols' || f.kind === 'values');
  const grow = (b) => ({ flexGrow: Math.max(1, Math.round(b.w.toNumber() * 100)) });
  const wts = f.kind === 'boxes' || f.kind === 'product';
  const row = (S, withW) => (
    <div className="mlv-cmp-row">
      {S.branches.map((b, j) => (
        <div key={j} className="mlv-seg" style={grow(b)}>
          <CountBox counts={b.counts} />
          {withW && <span className="mlv-wt"><Val v={`${showN(b.n)}/${showN(c.N)}`} /></span>}
        </div>
      ))}
    </div>
  );
  return (
    <div className="mlv-stack">
      <div className="mlv-root" data-node="root"><b>{t('Root', 'Rădăcina')}</b><CountBox counts={c.rootCounts} /></div>
      <span className="mlv-cmp-name">{L(A.label)}</span>
      {row(A, wts)}
      {showSym && (
        <div className="mlv-cmp-row">
          {c.pairs.map((p, j) => (
            <div key={j} className="mlv-seg" style={grow(A.branches[j])}>
              <span className="mlv-sym" data-value={p.sym}>{p.sym}</span>
              {f.kind === 'symbols' && p.shares && (
                <span className="mlv-wt"><Val v={showN(p.shares[0])} /> {p.sym} <Val v={showN(p.shares[1])} /></span>
              )}
            </div>
          ))}
        </div>
      )}
      {showSym && f.kind === 'symbols' && (
        <span className="mlv-dim">
          {c.pairs.some((p) => p.shares)
            ? t(`Under each symbol: the minority share in ${L(A.label)} against ${L(B.label)}; H(p) grows on`, `Sub fiecare simbol: cota minoritară în ${L(A.label)} față de ${L(B.label)}; H(p) crește pe`)
            : t('H(p) grows on', 'H(p) crește pe')} [<Val v="0" />, <Val v="1/2" />]
        </span>
      )}
      <span className="mlv-cmp-name">{L(B.label)}</span>
      {row(B, wts)}
    </div>
  );
}

function ValuesPanel({ c }) {
  const { L } = useL();
  return (
    <div className="mlv-stack">
      {c.stumps.map((S, i) => (
        <div key={i} className="mlv-expr">
          <span>H(Y|{L(S.label)}) =</span>
          {S.branches.map((b, j) => (
            <span key={j} className="mlv-term">
              {j > 0 && <span aria-hidden="true">+</span>}
              <Val v={`${showN(b.n)}/${showN(c.N)}`} /><span aria-hidden="true">{'·'}</span><Val v={fmt4(b.h)} />
            </span>
          ))}
          <span aria-hidden="true">=</span><b data-value={fmt4(S.hc)}>{fmt4(S.hc)}</b>
        </div>
      ))}
    </div>
  );
}

function ProductPanel({ c }) {
  const { t, L } = useL();
  return (
    <div className="mlv-stack">
      {c.stumps.map((S, i) => {
        const pr = c.prods[i];
        const igv = c.hRoot - S.hc;
        const isWin = (c.winner === 'A' && i === 0) || (c.winner === 'B' && i === 1);
        return (
          <div key={i} className="mlv-prod">
            <p>
              P<sub>{L(S.label)}</sub> ={' '}
              {S.branches.map((b, j) => (
                <span key={j}>{j > 0 && ' · '}{showN(b.n)}<sup>{showN(b.n)}</sup>/({b.counts.filter((x) => x.sign() !== 0).map((x, q) => <span key={q}>{q > 0 && '·'}{showN(x)}<sup>{showN(x)}</sup></span>)})</span>
              ))}
              {' = '}<b data-value={fmtBig(pr.value)} className={isWin ? 'mlv-win' : ''}>{fmtBig(pr.value)}</b>
            </p>
            <p>H(Y|{L(S.label)}) = log<sub>2</sub> P / <Val v={showN(c.N)} /> = <b data-value={fmt4(pr.hc)}>{fmt4(pr.hc)}</b></p>
            <p>IG({L(S.label)}) = <Val v={fmt4(c.hRoot)} /> {MINUS} {fmt4(pr.hc)} = <Val v={fmt4(igv)} /></p>
          </div>
        );
      })}
      <span className="mlv-dim">{t('The smaller product wins.', 'Câștigă produsul mai mic.')}</span>
    </div>
  );
}

function NodesRows({ c, f }) {
  const { t } = useL();
  const [a, b] = c.units;
  const sym = f.kind === 'values' ? c.symH : c.sym;
  const showSym = f.kind !== 'boxes';
  const cd = (() => { const g = (x, y) => (y === 0n ? x : g(y, x % y)); const l = (a.share.d * b.share.d) / g(a.share.d, b.share.d); return { x: a.share.n * (l / a.share.d), y: b.share.n * (l / b.share.d), den: l }; })();
  return (
    <div className="mlv-stack">
      <div className="mlv-cmp-row"><CountBox counts={a.counts} />{f.kind === 'values' && <span>H = <Val v={fmt4(a.h)} /></span>}</div>
      {showSym && <div className="mlv-cmp-row"><span className="mlv-sym" data-value={sym}>{sym}</span></div>}
      <div className="mlv-cmp-row"><CountBox counts={b.counts} />{f.kind === 'values' && <span>H = <Val v={fmt4(b.h)} /></span>}</div>
      {f.kind === 'symbols' && (
        <div className="mlv-expr">
          <span>{t('minority share', 'cota minoritară')}</span><Val v={showN(a.share)} /><span>{c.sym}</span><Val v={showN(b.share)} />
          {a.share.d !== b.share.d && <><span aria-hidden="true">=</span><Val v={`${cd.x}/${cd.den}`} /><span>{c.sym}</span><Val v={`${cd.y}/${cd.den}`} /></>}
          <span className="mlv-dim">{t('H(p) grows on', 'H(p) crește pe')} [<Val v="0" />, <Val v="1/2" />]</span>
        </div>
      )}
    </div>
  );
}

export function CompareStage({ model: M, k }) {
  const { L } = useL();
  const f = M.frames[k];
  const c = M.cases[f.ci];
  return (
    <div className="mlv-stack" data-case={c.ci}>
      {c.title && <b>{L(c.title)}</b>}
      {c.kind === 'nodes' && <NodesRows c={c} f={f} />}
      {c.kind === 'stumps' && <PairRows c={c} f={f} />}
      {c.kind === 'stumps' && f.kind === 'values' && <ValuesPanel c={c} />}
      {c.kind === 'stumps' && f.kind === 'product' && <ProductPanel c={c} />}
    </div>
  );
}

// ---------------- mode full ----------------
function TreeNode({ node, k, M, markNext }) {
  const { t, L } = useL();
  const split = M.isSplit(node, k);
  return (
    <li className={`mlv-tn${markNext === node ? ' next' : ''}`}>
      <span className="mlv-tn-head">
        {node.edge && <span className="mlv-edge">{String(node.edge.value)}</span>}
        <CountBox counts={node.counts} />
        {split
          ? <b className="mlv-test">{L(headerOf(M.P, node.test))}?</b>
          : node.leaf
            ? <span className="mlv-leafchip">{t('leaf', 'frunză')} {String(node.major.label)}</span>
            : <span className="mlv-open">{t('to split', 'de împărțit')}</span>}
      </span>
      {split && <ul>{node.children.map((ch, i) => <TreeNode key={i} node={ch} k={k} M={M} markNext={markNext} />)}</ul>}
    </li>
  );
}

export function FullStage({ model: M, k, predict }) {
  const { t, L } = useL();
  const f = M.frames[k];
  // with predict, the rows of the node the learner is asked about (the marked one); else the rows of the split shown
  const focus = predict && M.nextNode(k) ? M.nextNode(k) : M.focusNode(k);
  const focusIds = focus ? new Set(focus.ids) : null;
  const markNext = predict ? M.nextNode(k) : null;
  const e = f.kind === 'split' ? M.expansions[f.e] : null;
  return (
    <div className="mlv-stack">
      <DataTable headers={M.P.headers} rows={M.P.rows} rowClass={(i) => (focusIds ? (focusIds.has(i) ? 'pick' : 'mlv-out') : '')} />
      <ul className="mlv-tree" data-tree="">
        <TreeNode node={M.root} k={k} M={M} markNext={markNext} />
      </ul>
      {e && (
        <div className="viz-tablewrap">
          <table className="viz-table mlv-cands">
            <thead><tr><th>{t('attribute', 'atribut')}</th><th>H({L(headerOf(M.P, M.P.target))}|A)</th><th>IG</th></tr></thead>
            <tbody>
              {e.cands.map((c, i) => (
                <tr key={c.attr} className={i === e.best ? 'best' : ''}>
                  <td>{L(c.label)}</td>
                  <td><Val v={fmt4(c.hc)} /></td>
                  <td><Val v={fmt4(c.ig)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {f.kind === 'setup' && <div className="mlv-sum"><span className="viz-badge">N = <Val v={showN(M.N)} /></span><span className="viz-badge">H({L(headerOf(M.P, M.P.target))}) = <Val v={fmt4(M.hRoot)} /></span></div>}
      {f.kind === 'final' && (
        <>
          <div className="mlv-sum">
            <span className="viz-badge"><Val v={String(M.tests)} /> {t('tests', 'teste')}</span>
            <span className="viz-badge"><Val v={String(M.leaves.length)} /> {t('leaves', 'frunze')}</span>
            <span className="viz-badge">{t('error', 'eroare')} <Val v={showN(M.errW)} />/<Val v={showN(M.N)} /></span>
          </div>
          <ol className="mlv-rules">
            {M.leaves.map((lf, i) => (
              <li key={i}>
                {/* the outline's notation for rules, in both languages: IF a = x ∧ b = y THEN class (L11 C5) */}
                {M.pathOf(lf).length > 0 && <>IF {M.pathOf(lf).map((ed, q) => <span key={q}>{q > 0 && ' ∧ '}{L(headerOf(M.P, ed.attr))} = {String(ed.value)}</span>)} THEN </>}
                {L(headerOf(M.P, M.P.target))} = <b>{String(lf.major.label)}</b>
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}

export function Stage({ model, k, predict, picks = {} }) {
  if (model.mode === 'stumps') return <StumpsStage model={model} k={k} predict={predict} picks={picks} />;
  if (model.mode === 'compare') return <CompareStage model={model} k={k} />;
  return <FullStage model={model} k={k} predict={predict} />;
}

// ---------------- the widget ----------------
export default function Id3Builder({ props, predict }) {
  const { t } = useApp();
  const L = (x) => (x !== null && typeof x === 'object' ? t(x.en, x.ro) : String(x));
  const model = useMemo(() => id3Model(props), [props]);
  const hasPicks = useMemo(() => !!predict && model.frames.some((_, k) => model.pickSpec(k, true)), [model, predict]);
  const s = useStepper(model.count, { predict, own: hasPicks });
  const [picks, setPicks] = useState({});
  const spec = predict ? model.pickSpec(s.step, true) : null;
  const answered = allAnswered(spec, picks);
  const onPick = useCallback((key, id) => { setPicks((p) => ({ ...p, [key]: id })); s.settle(); }, [s]);
  const blocked = (to) => Array.from({ length: to }, (_, i) => i).some((i) => !allAnswered(predict ? model.pickSpec(i, true) : null, picks));
  const stepper = {
    ...s,
    canNext: s.canNext && answered,
    goto: (to) => { if (to <= s.step || !blocked(to)) s.goto(to); },
    reset: () => { setPicks({}); s.reset(); },
  };
  const cap = model.caption(s.step, { predict: !!predict, picks });
  const label = props.mode === 'stumps'
    ? t('Decision stumps and the choice of the root', 'Cioturile de decizie și alegerea rădăcinii')
    : props.mode === 'compare' ? t('Comparing two stumps', 'Compararea a două cioturi') : t('ID3 by hand', 'ID3 de mână');
  return (
    <VizFrame widget="ml-id3-builder" stepper={stepper} caption={t(cap.en, cap.ro)} label={label}>
      <Stage model={model} k={s.step} predict={!!predict} picks={picks} />
      <PickBar spec={spec} picks={picks} onPick={onPick} t={t} L={L} />
    </VizFrame>
  );
}
