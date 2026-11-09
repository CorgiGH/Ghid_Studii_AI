import React, { useMemo, useState } from 'react';
import { useApp } from '../../../../../contexts/AppContext';
import { useStepper } from '../../kit.js';
import { VizFrame } from '../../ui.jsx';
import { PARAM_N, factorRows, nbFrames, paramsFrame } from '../../logic/ml/nb.js';
import { L_EN, L_RO } from '../../logic/ml/numbers-bilingual.js';
import { withSubs } from './subscript.jsx';
import { PickBar } from './mlParts.jsx';
import './ml-common.css';
import './nb.css';

const pct = (f) => `${Math.max(0, Math.min(1, f.toNumber())) * 100}%`;
const show = (f) => f.toString();
const label = (m, cls) => `${m.target}=${cls}`;

// The data table of the block; rows lit by the frame (identical rows, or the rows a chosen factor counts over).
function DataTable({ model, hit = [], inClass = [], withValue = [] }) {
  const m = model;
  const lit = hit.length > 0 || inClass.length > 0;
  const cls = (i) => {
    if (withValue.includes(i) || hit.includes(i)) return 'pick';
    if (inClass.includes(i)) return '';
    if (lit) return 'dim';
    return '';
  };
  return (
    <div className="viz-tablewrap mlnb-table" style={{ maxHeight: '15rem', overflowY: 'auto' }}>
      <table className="viz-table">
        <thead><tr>{m.cols.map((c) => <th key={c} className={c === m.target ? 'hl' : ''}>{c}</th>)}</tr></thead>
        <tbody>
          {m.T.rows.map((r, i) => (
            <tr key={i} className={cls(i)} data-row={i} data-lit={cls(i) === 'pick' ? '1' : undefined}>
              {r.map((v, j) => <td key={j} data-value={String(v)} className={m.cols[j] === m.target ? 'hl' : ''}>{String(v)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Bar({ name, f, k, bad }) {
  return (
    <div className={`mlnb-bar${bad ? ' bad' : ''}`}>
      <span>{name}</span>
      <div className="mlnb-bar-track" data-key={k} data-value={show(f)}>
        <div className="mlnb-bar-fill" style={{ width: pct(f) }} />
        <span className="mlnb-bar-val">{show(f)}</span>
      </div>
    </div>
  );
}

function Factors({ model, scores, smooth, sel, onSel, t }) {
  const m = model;
  return (
    <div className="mlnb-scroll">
      <table className="mlnb-grid">
        <thead>
          <tr><th>{t('Class', 'Clasa')}</th><th>P({m.target})</th>{m.pairs.map(([a, v]) => <th key={a}>P({a}={v}|<wbr />{m.target})</th>)}</tr>
        </thead>
        <tbody>
          {scores.rows.map((r) => (
            <tr key={String(r.cls)}>
              <td>{String(r.cls)}</td>
              <td className="num" data-key={`prior:${r.cls}`} data-value={show(r.prior)}>{show(r.prior)}</td>
              {r.factors.map((f) => {
                const open = sel && sel.cls === r.cls && sel.attr === f.attr;
                // a smoothed factor shows its arithmetic, the fraction on one line and the result on the next, so the table fits 390 px
                const text = smooth && f.count !== null
                  ? <><span className="mlnb-calc">({f.count}+1)/({f.size}+{f.k})</span><span className="mlnb-eq">= {show(f.p)}</span></>
                  : show(f.p);
                return (
                  <td key={f.attr} className="num">
                    {onSel
                      ? <button type="button" className={`mlnb-factor${open ? ' sel' : ''}`} aria-pressed={!!open} data-key={`factor:${r.cls}:${f.attr}`} data-value={show(f.p)} onClick={() => onSel(open ? null : { cls: r.cls, attr: f.attr, lit: f.lit })}>{text}</button>
                      : <span className="mlnb-f" data-key={`factor:${r.cls}:${f.attr}`} data-value={show(f.p)}>{text}</span>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ScoreLines({ model, scores, probs, L }) {
  const m = model;
  return (
    <div className="mlnb-bars">
      {scores.rows.map((r, i) => (
        <div key={String(r.cls)} className={`mlnb-line${r.cls === scores.decision && scores.sum.sign() > 0 ? ' win' : ''}`}>
          <b>{label(m, r.cls)}</b>: {[r.prior, ...r.factors.map((f) => f.p)].map(show).join(' · ')} = <b data-key={`score:${r.cls}`} data-value={show(r.score)}>{show(r.score)}</b>
          {r.score.isInteger() ? '' : ` ≈ ${L.n(r.score)}`}
          {probs && scores.probs && (
            <> → P = <b data-key={`prob:${r.cls}`} data-value={show(scores.probs[i])}>{show(scores.probs[i])}</b></>
          )}
        </div>
      ))}
    </div>
  );
}

function Params({ state, n, onN, t }) {
  const max = state.joint;
  return (
    <div className="mlnb-bars">
      <div className="mlnb-slider">
        <span className="mlnb-hint">n</span>
        <input type="range" min={PARAM_N.min} max={PARAM_N.max} step={1} value={n} onChange={(e) => onN(Number(e.target.value))} aria-label={t('Number of attributes n', 'Numărul de atribute n')} />
        <b data-key="params-n" data-value={String(n)}>{n}</b>
      </div>
      <div className="mlnb-bar"><span>{t('Naive Bayes', 'Bayes Naiv')}</span>
        <div className="mlnb-bar-track" data-key="params-nb" data-value={String(state.nb)}><div className="mlnb-bar-fill" style={{ width: `${(state.nb / max) * 100}%` }} /><span className="mlnb-bar-val">{state.nb}</span></div></div>
      <div className="mlnb-bar"><span>{t('Joint Bayes', 'Bayes Optimal')}</span>
        <div className="mlnb-bar-track" data-key="params-joint" data-value={String(state.joint)}><div className="mlnb-bar-fill" style={{ width: '100%' }} /><span className="mlnb-bar-val">{state.joint}</span></div></div>
    </div>
  );
}

function ErrorTable({ model, state, t, L }) {
  const m = model;
  const { table, reveal, copy, indicators, joint, flipCell } = state;
  const showDecision = reveal !== 'truth';
  const showErr = reveal === 'errors';
  // the Joint Bayes view compares decisions and true probabilities only; P_NB has done its job by then
  const showNB = copy && !joint;
  // the probabilities are joint ones, P(cell, class): the header names the attributes of the cell, the cell shows its values
  const over = table.attrs.join(', ');
  const flip = flipCell && !showErr ? table.cells.find((c) => c.label === flipCell) : null;
  return (
    <>
      <div className="mlnb-scroll">
        <table className="mlnb-grid">
          <thead>
            <tr>
              <th>{over}</th>
              <th>{t('Naive Bayes', 'Bayes Naiv')}</th>
              {joint && <th>{t('Joint Bayes', 'Bayes Optimal')}</th>}
              {m.classes.map((c) => <th key={`t${c}`}>P({over}, {label(m, c)})</th>)}
              {showNB && m.classes.map((c) => <th key={`n${c}`}>{withSubs(`P_NB(${over}, ${label(m, c)})`)}</th>)}
            </tr>
          </thead>
          <tbody>
            {table.cells.map((c) => (
              <tr key={c.label}>
                <td>{c.pairs.map(([, v]) => v).join(', ')}</td>
                <td className={showDecision ? (flipCell === c.label ? 'flip' : '') : 'unk'} data-key={`decision:${c.label}`} data-value={showDecision ? String(c.nbDecision) : '?'}>{showDecision ? label(m, c.nbDecision) : '?'}</td>
                {joint && <td data-key={`joint-decision:${c.label}`} data-value={String(c.jbDecision)}>{c.truth.some((v) => v.sign() > 0) ? label(m, c.jbDecision) : '–'}</td>}
                {c.truth.map((v, i) => {
                  const wrong = joint ? i !== c.jbDi : i !== c.nbDi;
                  return <td key={i} className={`num${showErr && wrong && v.sign() > 0 ? ' bad' : ''}`} data-key={`truth:${c.label}:${m.classes[i]}`} data-value={show(v)}>{L.n(v)}</td>;
                })}
                {showNB && c.nb.map((v, i) => <td key={i} className="num" data-key={`nb:${c.label}:${m.classes[i]}`} data-value={show(v)}>{L.n(v)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {flip && (
        <div className="mlnb-line flip">
          {flip.label}: {m.classes.map((cls, i) => (
            <React.Fragment key={String(cls)}>{i > 0 && '; '}{withSubs(`P_NB(${label(m, cls)})`)} = <b data-key={`flip-nb:${cls}`} data-value={show(flip.nb[i])}>{L.n(flip.nb[i])}</b></React.Fragment>
          ))} → {label(m, flip.nbDecision)}
        </div>
      )}
      {showErr && (
        <div className="mlnb-ind">
          {joint ? (
            <div className="true"><span>{t('Joint Bayes error rate', 'Rata erorii la Bayes Optimal')}</span><b data-key="err-joint" data-value={show(table.errJB)}>{L.n(table.errJB)}</b></div>
          ) : indicators ? (
            <>
              <div className="true"><span>{t('error against the true distribution', 'eroarea față de distribuția adevărată')}</span><b data-key="err-true" data-value={show(table.errTrue)}>{L.n(table.errTrue)}</b></div>
              <div><span>{withSubs(t('error against P_NB', 'eroarea față de P_NB'))}</span><b data-key="err-nb" data-value={show(table.errNB)}>{L.n(table.errNB)}</b></div>
            </>
          ) : (
            <div className="true"><span>{t('error rate', 'rata erorii')}</span><b data-key="err-true-base" data-value={show(table.errTrue)}>{L.n(table.errTrue)}</b></div>
          )}
        </div>
      )}
    </>
  );
}

// What one frame draws. Pure: the frame holds every number, so a test can render any frame and read its marks.
export function NbStage({ model, frame, sel = null, onSel = null, n = PARAM_N.max, onN = () => {}, t, L = L_EN }) {
  const m = model;
  const st = frame.state;
  const rows = sel ? factorRows(m, sel.cls, sel.attr, sel.lit) : null;
  const tbl = (extra) => <DataTable model={m} {...extra} />;
  const inst = (p) => (
    <div className="mlnb-inst">
      <span className="mlnb-hint">{t('Instance', 'Instanța')}:</span>
      {p.map(([a, v]) => <span key={a} className="mlnb-chip" data-key={`inst:${a}`} data-value={v}>{a}={v}</span>)}
    </div>
  );
  switch (st.kind) {
    case 'joint-rows':
      return (
        <div className="mlnb-stage">
          {inst(m.pairs)}
          {tbl({ hit: st.hit })}
          {st.joint && (
            <div className="mlnb-inst">
              <span className="mlnb-chip hit" data-key="match-count" data-value={String(st.hit.length)}>{t('identical rows', 'rânduri identice')}: {st.hit.length}</span>
              {st.joint.rows.map((r, i) => <span key={String(r.cls)} className="mlnb-chip" data-key={`joint-prob:${r.cls}`} data-value={st.joint.probs ? show(st.joint.probs[i]) : '0'}>P({label(m, r.cls)}|{t('instance', 'instanță')}) = {st.joint.probs ? show(st.joint.probs[i]) : '0'}</span>)}
            </div>
          )}
        </div>
      );
    case 'priors':
      return (
        <div className="mlnb-stage">
          {tbl({})}
          <div className="mlnb-bars">{st.scores.rows.map((r) => <Bar key={String(r.cls)} name={`P(${label(m, r.cls)})`} f={r.prior} k={`prior:${r.cls}`} />)}</div>
        </div>
      );
    case 'factors':
      return (
        <div className="mlnb-stage">
          {tbl(rows ? { inClass: rows.inClass, withValue: rows.withValue } : {})}
          <Factors model={m} scores={st.scores} smooth={false} sel={sel} onSel={onSel} t={t} />
          <div className="mlnb-hint">{t('Tap a factor to highlight the rows it counts over.', 'Atinge un factor ca să evidențiezi rândurile pe care le numără.')}</div>
        </div>
      );
    case 'scores':
      return <div className="mlnb-stage">{tbl({})}<ScoreLines model={m} scores={st.scores} probs={false} L={L} /></div>;
    case 'probs':
      return <div className="mlnb-stage">{tbl({})}<ScoreLines model={m} scores={st.scores} probs L={L} /></div>;
    case 'one-attribute':
      return (
        <div className="mlnb-stage">
          {inst(st.pairs)}
          {tbl({ hit: st.joint.ids })}
          <div className="mlnb-bars">
            <div className="mlnb-line"><b>{t('Naive Bayes', 'Bayes Naiv')}</b>: P({label(m, m.classes[0])}|{st.pairs.map(([a, v]) => `${a}=${v}`).join(', ')}) = <b data-key="nb1" data-value={st.nb.probs ? show(st.nb.probs[0]) : '0/0'}>{st.nb.probs ? show(st.nb.probs[0]) : '0/0'}</b></div>
            <div className="mlnb-line"><b>{t('Joint Bayes', 'Bayes Optimal')}</b>: P({label(m, m.classes[0])}|{st.pairs.map(([a, v]) => `${a}=${v}`).join(', ')}) = <b data-key="jb1" data-value={st.joint.probs ? show(st.joint.probs[0]) : '0/0'}>{st.joint.probs ? show(st.joint.probs[0]) : '0/0'}</b></div>
          </div>
        </div>
      );
    case 'params':
      return <div className="mlnb-stage"><Params state={st} n={n} onN={onN} t={t} /></div>;
    case 'laplace-calc':
      return (
        <div className="mlnb-stage">
          {tbl({})}
          <div className="mlnb-inst">
            {inst(m.pairs)}
            <span className={`mlnb-chip ${st.smooth ? 'on' : 'off'}`} data-key="addone" data-value={st.smooth ? 'on' : 'off'}>add-one: {st.smooth ? t('on', 'pornit') : t('off', 'oprit')}</span>
          </div>
          <Factors model={m} scores={st.scores} smooth={st.smooth} sel={null} onSel={null} t={t} />
          {st.showScores
            ? <ScoreLines model={m} scores={st.scores} probs={st.showProbs && !st.scores.undefinedPosterior} L={L} />
            : <div className="mlnb-line">{t('Scores', 'Scorurile')}: ?</div>}
          {st.showProbs && st.scores.undefinedPosterior && (
            <div className="mlnb-line bad" data-key="posterior" data-value="0/0">P = 0/({st.scores.rows.map((r) => show(r.score)).join(' + ')}) = 0/0 — {t('undefined', 'nedefinit')}</div>
          )}
        </div>
      );
    case 'laplace-sum':
      return (
        <div className="mlnb-stage">
          {tbl({ inClass: factorRows(m, st.cls, st.attr, st.values[0]).inClass })}
          <div className="mlnb-inst">
            {st.values.map((v, i) => <span key={String(v)} className="mlnb-chip">{st.attr}={String(v)}: ({st.counts[i]}+1)/({st.size}+{st.k}) = {show(st.smooth[i])}</span>)}
          </div>
          <div className="mlnb-line win">
            P({st.attr}=v | {label(m, st.cls)}), {t('with add-one', 'cu add-one')}: {st.smooth.map(show).join(' + ')} = <b data-key="sum-smooth" data-value={show(st.sumSmooth)}>{show(st.sumSmooth)}</b>
          </div>
          <div className={`mlnb-line${st.sumNaive.equals(1) ? '' : ' bad'}`}>
            {t('1 added to the numerator only', '1 adăugat doar la numărător')}: {st.naive.map(show).join(' + ')} = <b data-key="sum-naive" data-value={show(st.sumNaive)}>{show(st.sumNaive)}</b>
          </div>
        </div>
      );
    case 'errors':
      return <div className="mlnb-stage"><ErrorTable model={m} state={st} t={t} L={L} /></div>;
    default:
      return null;
  }
}

export default function Nb({ props, predict }) {
  const { t } = useApp();
  const built = useMemo(() => nbFrames(props), [props]);
  const { model, frames } = built;
  const hasPicks = !!predict && frames.some((f) => f.pick);
  const s = useStepper(frames.length, { predict, own: hasPicks });
  const [sel, setSel] = useState(null);
  const [n, setN] = useState(PARAM_N.max);
  const [picks, setPicks] = useState({});
  const base = frames[s.step];
  const frame = base.id === 'params' ? paramsFrame(n) : base;
  const L = t('en', 'ro') === 'ro' ? L_RO : L_EN;
  const cap = frame.caption[L.lang];
  const spec = predict && base.pick ? { items: [base.pick] } : null;
  const answered = !spec || picks[base.pick.key] === base.pick.right;
  const ask = frame.ask && !spec ? frame.ask[L.lang] : null;
  const onPick = (key, id) => { setPicks((p) => ({ ...p, [key]: id })); s.settle(); };
  const done = base.pick ? picks[base.pick.key] : undefined;
  const right = done !== undefined && done === base.pick.right;
  const caption = (
    <>
      <p className="mlnb-cap">{withSubs(cap)}</p>
      {ask && <p className="mlnb-ask">{withSubs(ask)}</p>}
    </>
  );
  const blocked = (to) => Array.from({ length: to }, (_, i) => i).some((i) => frames[i].pick && predict && picks[frames[i].pick.key] !== frames[i].pick.right);
  const stepper = {
    ...s,
    canNext: s.canNext && answered,
    goto: (to) => { if (to <= s.step || !blocked(to)) s.goto(to); },
    reset: () => { setSel(null); setPicks({}); s.reset(); },
  };
  return (
    <VizFrame widget="ml-nb" stepper={stepper} caption={caption} label={t('Naive Bayes calculator', 'Calculatorul Bayes Naiv')}>
      <div className="mlnb">
        <NbStage model={model} frame={frame} sel={sel} onSel={setSel} n={n} onN={setN} t={t} L={L} />
        <PickBar spec={spec} picks={picks} onPick={onPick} t={t} L={(x) => (x !== null && typeof x === 'object' ? t(x.en, x.ro) : String(x))} />
        {done !== undefined && (
          <p className={`mlnb-fb ${right ? 'ok' : 'no'}`} role="status" data-pick={right ? 'right' : 'wrong'}>
            {right ? t('Right. ', 'Corect. ') : t('Not quite. ', 'Nu chiar. ')}{withSubs(base.pick.why[L.lang])}
          </p>
        )}
      </div>
    </VizFrame>
  );
}
