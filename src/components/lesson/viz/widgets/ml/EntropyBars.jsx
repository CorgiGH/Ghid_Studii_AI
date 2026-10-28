import React, { useState } from 'react';
import { motion as Motion } from 'motion/react';
import { useApp } from '../../../../../contexts/AppContext';
import { useStepper, useVizMotion } from '../../kit.js';
import { VizFrame } from '../../ui.jsx';
import { entropyBars, curvePoint } from '../../logic/ml/entropy-bars.js';
import { bits, disp, fmtNum } from '../../logic/ml/prob-format.js';
import './ml-w2.css';

const MINUS = '−';
const CW = 300, CH = 150, CL = 30, CR = 290, CB = 125, CT = 20;
const cx = (p) => CL + (CR - CL) * p;
const cy = (h) => CB - (CB - CT) * h;
const CURVE = Array.from({ length: 51 }, (_, i) => curvePoint(i / 50)).map((c) => `${cx(c.p).toFixed(1)},${cy(c.H).toFixed(1)}`).join(' ');

// a bar of [a+, b-] unit squares (or two segments when there are many)
function SquareBar({ a, b }) {
  const total = a + b;
  if (total <= 16) {
    return (
      <div className="meb-units" role="img" aria-label={`${a}+, ${b}${MINUS}`}>
        {Array.from({ length: a }, (_, i) => <span key={`p${i}`} className="meb-sq pos">+</span>)}
        {Array.from({ length: b }, (_, i) => <span key={`n${i}`} className="meb-sq neg">{MINUS}</span>)}
      </div>
    );
  }
  return (
    <div className="meb-units seg" role="img" aria-label={`${a}+, ${b}${MINUS}`}>
      <span className="meb-seg pos" style={{ flexGrow: a }}>{a}+</span>
      <span className="meb-seg neg" style={{ flexGrow: b }}>{b}{MINUS}</span>
    </div>
  );
}

function Curve({ frame, live }) {
  const { t } = useApp();
  const pts = frame.points || [];
  const lp = frame.slider ? curvePoint(live) : null;
  return (
    <svg className="meb-curve" viewBox={`0 0 ${CW} ${CH}`} role="img" aria-label={t('The entropy curve H(p)', 'Curba entropiei H(p)')}>
      <line className="meb-axis" x1={CL} x2={CR} y1={CB} y2={CB} />
      <line className="meb-axis" x1={CL} x2={CL} y1={CT - 4} y2={CB} />
      <polyline className="meb-line" points={CURVE} fill="none" />
      <text className="meb-tick" x={CL} y={CB + 14} textAnchor="middle">0</text>
      <text className="meb-tick" x={cx(0.5)} y={CB + 14} textAnchor="middle">1/2</text>
      <text className="meb-tick" x={CR} y={CB + 14} textAnchor="middle">1</text>
      <text className="meb-tick" x={CL - 6} y={cy(1) + 4} textAnchor="end">1</text>
      <text className="meb-tick" x={CL - 6} y={cy(0) + 4} textAnchor="end">0</text>
      <text className="meb-tick" x={(CL + CR) / 2} y={CH - 2} textAnchor="middle">p</text>
      {pts.map((b, i) => (
        <g key={i}>
          <circle className={`meb-pt s${i}`} cx={cx(b.p.toNumber())} cy={cy(b.H)} r="6" data-kind="point" data-p={b.p.toString()} data-value={t(bits(b.H).en, bits(b.H).ro)} data-cap="1" />
          <text className="meb-ptlab" x={cx(b.p.toNumber())} y={cy(b.H) - 10} textAnchor="middle">{b.label}</text>
        </g>
      ))}
      {frame.showMax && (
        <circle className="meb-pt max" cx={cx(frame.max.p)} cy={cy(frame.max.H)} r="7" data-kind="max" data-value={fmtNum(frame.max.H, t('en', 'ro'), 4)} data-cap="1" />
      )}
      {lp && <circle className="meb-pt live" cx={cx(lp.p)} cy={cy(lp.H)} r="6" data-kind="live-point" />}
    </svg>
  );
}

function HBar({ b, scale }) {
  const { t } = useApp();
  const v = bits(b.value);
  return (
    <div className={`meb-hrow ${b.kind}`} data-kind="hbar" data-name={b.name} data-value={t(v.en, v.ro)} data-cap={b.cap ? '1' : undefined}>
      <span className="meb-hname">{b.name}</span>
      <span className="meb-htrack"><span className="meb-hfill" style={{ width: `${Math.min(100, (b.value / scale) * 100)}%` }} /></span>
      <span className="meb-hval">{t(v.en, v.ro)}</span>
    </div>
  );
}

function StackBar({ s, name, scale }) {
  const { t } = useApp();
  const ig = bits(s.ig);
  return (
    <div className="meb-hrow stack" aria-label={name}>
      <span className="meb-hname">{name}</span>
      <span className="meb-htrack">
        <span className="meb-hfill cond" style={{ width: `${(s.rest / scale) * 100}%` }} />
        <span className="meb-hfill ig" style={{ width: `${(s.ig / scale) * 100}%` }} data-kind="ig" data-value={t(ig.en, ig.ro)} data-cap="1" />
      </span>
      <span className="meb-hval">+ {t(ig.en, ig.ro)}</span>
    </div>
  );
}

function Groups({ rows }) {
  const { t } = useApp();
  if (!rows || rows.length === 0) return null;
  return (
    <div className="viz-tablewrap">
      <table className="viz-table meb-groups">
        <thead><tr><th scope="col">{t('Group', 'Grupa')}</th><th scope="col" /><th scope="col">H</th><th scope="col">{t('weight', 'pondere')}</th></tr></thead>
        <tbody>
          {rows.map((r, i) => {
            const h = bits(r.H);
            const w = r.wText;
            return (
              <tr key={i}>
                <th scope="row">{r.name}</th>
                <td>{r.counts}</td>
                <td data-kind="grp-h" data-value={t(h.en, h.ro)} data-cap="1">{t(h.en, h.ro)}</td>
                <td data-kind="grp-w" data-value={t(w.en, w.ro)} data-cap="1">{t(w.en, w.ro)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Venn({ v, names, filled, bank }) {
  const { t } = useApp();
  const val = (x) => bits(x);
  const txt = (x) => (filled ? t(val(x).en, val(x).ro) : '?');
  const cap = filled ? '1' : undefined;
  return (
    <div className="meb-vennwrap">
      <svg className="meb-venn" viewBox="0 0 300 170" role="img" aria-label={t('Venn diagram of the entropies', 'Diagrama Venn a entropiilor')}>
        <circle className="meb-circ x" cx="115" cy="88" r="60" />
        <circle className="meb-circ y" cx="185" cy="88" r="60" />
        <text className="meb-vlab" x="85" y="16" textAnchor="middle">{`H(${names.X}) = ${t(val(v.hx).en, val(v.hx).ro)}`}</text>
        <text className="meb-vlab" x="215" y="16" textAnchor="middle">{`H(${names.Y}) = ${t(val(v.hy).en, val(v.hy).ro)}`}</text>
        <text className="meb-vtxt" x="80" y="86" textAnchor="middle" data-kind="venn-left" data-value={filled ? t(val(v.left).en, val(v.left).ro) : ''} data-cap={cap}>{txt(v.left)}</text>
        <text className="meb-vsub" x="80" y="102" textAnchor="middle">{`H(${names.X}|${names.Y})`}</text>
        <text className="meb-vtxt" x="150" y="86" textAnchor="middle" data-kind="venn-mid" data-value={filled ? t(val(v.mid).en, val(v.mid).ro) : ''} data-cap={cap}>{txt(v.mid)}</text>
        <text className="meb-vsub" x="150" y="102" textAnchor="middle">IG</text>
        <text className="meb-vtxt" x="220" y="86" textAnchor="middle" data-kind="venn-right" data-value={filled ? t(val(v.right).en, val(v.right).ro) : ''} data-cap={cap}>{txt(v.right)}</text>
        <text className="meb-vsub" x="220" y="102" textAnchor="middle">{`H(${names.Y}|${names.X})`}</text>
        <text className="meb-vlab" x="150" y="164" textAnchor="middle" data-kind="venn-union" data-value={filled ? t(val(v.union).en, val(v.union).ro) : ''} data-cap={cap}>{`H(${names.X},${names.Y}) = ${filled ? t(val(v.union).en, val(v.union).ro) : '?'}`}</text>
      </svg>
      {!filled && bank && (
        <div className="mjt-info" aria-label={t('Values to place', 'Valori de așezat')}>
          {bank.map((x, i) => <span key={i} className="mjt-chip" data-kind="bank" data-value={t(val(x).en, val(x).ro)}><b>{t(val(x).en, val(x).ro)}</b></span>)}
        </div>
      )}
    </div>
  );
}

// The drawing of one frame (exported so a test can render any frame).
export function EntropyStage({ model, frame, live = 20 }) {
  const { t } = useApp();
  const m = useVizMotion();
  const fade = { initial: { opacity: m.reduced ? 1 : 0.4 }, animate: { opacity: 1 }, transition: m.reduced ? { duration: 0 } : { duration: 0.2 } };
  if (model.mode === 'compare') {
    const lp = frame.slider ? curvePoint(live / 100) : null;
    return (
      <Motion.div className="meb" data-frame={frame.kind} {...fade}>
        {frame.bars.map((b, i) => (
          <div className="meb-barrow" key={i}>
            <span className="meb-blabel">{b.label}</span>
            <SquareBar a={b.a} b={b.b} />
            <span className="meb-bval" data-kind={frame.values ? 'H' : undefined} data-value={frame.values ? t(bits(b.H).en, bits(b.H).ro) : undefined} data-cap={frame.values ? '1' : undefined}>
              {frame.values ? `H = ${t(bits(b.H).en, bits(b.H).ro)}` : 'H = ?'}
            </span>
          </div>
        ))}
        <Curve frame={frame} live={frame.slider ? live / 100 : 0} />
        {frame.slider && <SliderReadout live={live} lp={lp} />}
      </Motion.div>
    );
  }
  const { M } = model;
  const scale = Math.max(1, M.HY, M.HX);
  return (
    <Motion.div className="meb" data-frame={frame.kind} {...fade}>
      {frame.bars.map((b, i) => <HBar key={i} b={b} scale={scale} />)}
      {frame.stack && <StackBar s={frame.stack} name="IG" scale={scale} />}
      <Groups rows={frame.groups.map((g) => ({ ...g, wText: disp(g.w, 'decimal') }))} />
      {frame.venn && <Venn v={frame.venn} names={{ X: M.xName, Y: M.yName }} filled={frame.venn.filled} bank={frame.bank} />}
    </Motion.div>
  );
}

function SliderReadout({ live, lp }) {
  const { t } = useApp();
  const l = t('en', 'ro');
  return (
    <div className="meb-readout" data-kind="live" data-value={fmtNum(lp.H, l, 4)}>
      {`p = ${fmtNum(live / 100, l, 2)}, H(p) = ${fmtNum(lp.H, l, 4)}`}
    </div>
  );
}

export default function EntropyBars({ props, predict }) {
  const { t } = useApp();
  const model = entropyBars(props);
  const s = useStepper(model.count, { predict });
  const [live, setLive] = useState(20);
  const frame = model.frames[s.step];
  return (
    <VizFrame widget="ml-entropy-bars" stepper={s} caption={t(frame.caption.en, frame.caption.ro)} label={model.mode === 'ig' ? t('Entropy bars and information gain', 'Bare de entropie și câștig de informație') : t('Entropy of a bar of + and − squares', 'Entropia unei bare de pătrate + și −')}>
      <EntropyStage model={model} frame={frame} live={live} />
      {frame.slider && (
        <input className="meb-slider" type="range" min="0" max="100" step="1" value={live} onChange={(e) => setLive(Number(e.target.value))} aria-label={t('Move the point along the curve', 'Mută punctul pe curbă')} />
      )}
    </VizFrame>
  );
}
