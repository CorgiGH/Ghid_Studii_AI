import React from 'react';
import { motion as Motion } from 'motion/react';
import { useApp } from '../../../../../contexts/AppContext';
import { useStepper, useVizMotion } from '../../kit.js';
import { VizFrame } from '../../ui.jsx';
import { pmfCdf, shown } from '../../logic/ml/pmf-cdf.js';
import './ml-w2.css';

const W = 340, H = 206, L = 14, R = 14, BASE = 138, TOP = 40;

// The drawing of one frame: pmf bars (or the c.d.f. staircase), the mean marker, the sigma bracket and the deviation table.
// Exported on its own so a test can render any frame; the default export adds the stepper.
export function PmfCdfStage({ model, frame }) {
  const { t } = useApp();
  const m = useVizMotion();
  const D = frame.view === 'second' ? model.second : model.main;
  const S = shown(D, model.mode);
  const lo = Math.min(...D.xs.map((x) => x.toNumber())) - 0.6;
  const hi = Math.max(...D.xs.map((x) => x.toNumber())) + 0.6;
  const sx = (v) => L + ((v - lo) / (hi - lo)) * (W - L - R);
  const pmax = Math.max(...D.ps.map((p) => p.toNumber()));
  const barW = Math.min(38, ((W - L - R) / (hi - lo)) * 0.62);
  const mu = D.mean.toNumber();
  const fade = (i = 0) => ({ initial: { opacity: m.reduced ? 1 : 0 }, animate: { opacity: 1 }, transition: m.reduced ? { duration: 0 } : { ...m.soft, delay: i * 0.05 } });
  const show = frame.show || {};
  const xs = D.xs.map((x) => x.toNumber());
  const sdLo = sx(mu - D.sd), sdHi = sx(mu + D.sd);

  // staircase path of F: flat from the left edge to the first value, a jump at every value, flat to the right edge
  const fy = (f) => BASE - f.toNumber() * (BASE - TOP);
  let stair = '';
  if (frame.cdf) {
    stair = `M${sx(lo)} ${BASE}`;
    D.cdf.forEach((f, i) => {
      stair += ` L${sx(xs[i])} ${i === 0 ? BASE : fy(D.cdf[i - 1])} L${sx(xs[i])} ${fy(f)}`;
    });
    stair += ` L${sx(hi)} ${fy(D.cdf[D.cdf.length - 1])}`;
  }

  return (
    <div className="mpc" data-view={frame.view} data-frame={frame.kind}>
      <svg className="mpc-svg" viewBox={`0 0 ${W} ${H}`} role="img"
        aria-label={frame.cdf ? t('Cumulative distribution function', 'Funcția de repartiție') : t('Bars of the probability distribution', 'Barele distribuției de probabilitate')}>
        <line className="mpc-axis" x1={L} x2={W - R} y1={BASE} y2={BASE} />
        {!frame.cdf && D.xs.map((x, i) => {
          const h = (D.ps[i].toNumber() / pmax) * (BASE - TOP - 14);
          return (
            <Motion.g key={i} {...fade(i)}>
              <rect className="mpc-bar" x={sx(xs[i]) - barW / 2} y={BASE - h} width={barW} height={Math.max(h, 0)} rx="3"
                data-kind="bar" data-x={t(S.xs[i].en, S.xs[i].ro)} data-value={t(S.ps[i].en, S.ps[i].ro)} />
              <text className="mpc-lab" x={sx(xs[i])} y={BASE - h - 5} textAnchor="middle">{t(S.ps[i].en, S.ps[i].ro)}</text>
            </Motion.g>
          );
        })}
        {frame.cdf && (
          <>
            <Motion.path className="mpc-stair" d={stair} fill="none" initial={{ pathLength: m.reduced ? 1 : 0 }} animate={{ pathLength: 1 }} transition={m.reduced ? { duration: 0 } : { duration: 0.6 }} />
            <text className="mpc-lab dim" x={L} y={BASE - 4}>0</text>
            <text className="mpc-lab dim" x={L} y={TOP - 4}>1</text>
            {D.cdf.map((f, i) => (
              <g key={i}>
                <circle className={`mpc-dot${i === frame.cdfAt ? ' at' : ''}`} cx={sx(xs[i])} cy={fy(f)} r={i === frame.cdfAt ? 5 : 3.5}
                  data-kind={i === frame.cdfAt ? 'cdf-at' : 'cdf'} data-x={t(S.xs[i].en, S.xs[i].ro)} data-value={t(S.cdf[i].en, S.cdf[i].ro)} />
                <text className={`mpc-lab${i === frame.cdfAt ? ' at' : ''}`} x={sx(xs[i])} y={fy(f) - 8} textAnchor="middle">{t(S.cdf[i].en, S.cdf[i].ro)}</text>
              </g>
            ))}
          </>
        )}
        {D.xs.map((x, i) => (
          <text key={i} className="mpc-tick" x={sx(xs[i])} y={BASE + 15} textAnchor="middle">{t(S.xs[i].en, S.xs[i].ro)}</text>
        ))}
        {show.sd && (
          <Motion.g {...fade(1)}>
            <path className="mpc-brace" d={`M${sdLo} 30 v-6 H${sdHi} v6`} fill="none" />
            <text className="mpc-lab at" x={sx(mu)} y="16" textAnchor="middle" data-kind="sd" data-value={t(S.sd.en, S.sd.ro)}>{`σ ≈ ${t(S.sd.en, S.sd.ro)}`}</text>
          </Motion.g>
        )}
        {show.mean && (
          <Motion.g {...fade(0)}>
            <path className="mpc-mean" d={`M${sx(mu)} ${BASE + 20} l-7 11 h14 z`} data-kind="mean" data-value={t(S.mean.en, S.mean.ro)} />
            <text className="mpc-lab at" x={sx(mu)} y={BASE + 46} textAnchor="middle">{`μ = ${t(S.mean.en, S.mean.ro)}`}</text>
          </Motion.g>
        )}
      </svg>
      {show.dev && (
        <div className="viz-tablewrap">
          <table className="viz-table mpc-table">
            <tbody>
              <tr><th scope="row">x</th>{S.xs.map((v, i) => <td key={i}>{t(v.en, v.ro)}</td>)}</tr>
              <tr><th scope="row">P(x)</th>{S.ps.map((v, i) => <td key={i}>{t(v.en, v.ro)}</td>)}</tr>
              <tr><th scope="row">x − μ</th>{S.dev.map((v, i) => <td key={i} data-kind="dev" data-value={t(v.en, v.ro)}>{t(v.en, v.ro)}</td>)}</tr>
              <tr><th scope="row">(x − μ)²</th>{S.sq.map((v, i) => <td key={i} data-kind="sq" data-value={t(v.en, v.ro)}>{t(v.en, v.ro)}</td>)}</tr>
            </tbody>
          </table>
          <div className="mpc-var">{`Var(${D.name}) = `}<b data-kind="variance" data-value={t(S.variance.en, S.variance.ro)}>{t(S.variance.en, S.variance.ro)}</b></div>
        </div>
      )}
    </div>
  );
}

export default function PmfCdf({ props, predict }) {
  const { t } = useApp();
  const model = pmfCdf(props);
  const s = useStepper(model.count, { predict });
  const frame = model.frames[s.step];
  return (
    <VizFrame widget="ml-pmf-cdf" stepper={s} caption={t(frame.caption.en, frame.caption.ro)} label={t('Probability distribution, mean, variance and c.d.f.', 'Distribuție de probabilitate, medie, varianță și funcție de repartiție')}>
      <PmfCdfStage model={model} frame={frame} />
    </VizFrame>
  );
}
