import React from 'react';
import { motion as Motion } from 'motion/react';
import { useApp } from '../../../../contexts/AppContext';
import { useStepper, useVizMotion } from '../kit.js';
import { VizFrame, ValueChips } from '../ui.jsx';
import { likeCaption, likeIntro, likeSlider, likeTally } from '../logic/like-slider.js';

// Which token owns each letter, so the letters can be tinted by the pill that took them.
function owners(trace, len) {
  const own = Array(len).fill(-1);
  for (const st of trace.steps) for (let i = st.from; i < st.to; i++) own[i] = st.tok;
  return own;
}

export default function LikeSlider({ props, predict }) {
  const { t } = useApp();
  const m = useVizMotion();
  const L = likeSlider(props);
  const s = useStepper(L.count, { predict });
  const k = s.step;
  const cur = k >= 1 ? k - 1 : null;
  const value = cur !== null ? props.values[cur] : null;
  const trace = cur !== null ? L.traces[cur] : null;
  const chars = value !== null ? [...value] : [];
  const own = trace ? owners(trace, chars.length) : [];
  const failAt = trace && !trace.match ? trace.steps.at(-1) : null;
  const matches = L.traces.filter(x => x.match).length;
  const cap = k === 0 ? likeIntro(props.pattern) : likeCaption(props.pattern, value, trace);
  const caption = t(cap.en, cap.ro);
  const tally = likeTally(matches, props.values.length);
  const verdicts = L.traces.map(x => x.match);
  return (
    <VizFrame widget="like-slider" stepper={s} caption={caption} label={t('A LIKE pattern sliding over names', 'Un model LIKE peste nume')}>
      <div className="viz-like">
        <div className="viz-pattern" aria-label={`LIKE '${props.pattern}'`}>
          <span className="viz-dim">LIKE</span>
          <code>'{props.pattern}'</code>
        </div>
        {value !== null && (
          <Motion.div key={`${cur}`} className="viz-like-body" variants={m.v.enter} initial="hidden" animate="show">
            <div className="viz-letters" role="img" aria-label={value} style={{ '--n': chars.length }}>
              {chars.map((c, i) => {
                const bad = failAt && !failAt.leftover && i === failAt.from;
                const left = failAt && failAt.leftover && i >= failAt.from;
                return (
                  <Motion.span key={i} className={`viz-letter t${own[i] >= 0 ? own[i] % 4 : 'x'}${bad ? ' bad' : ''}${left ? ' bad' : ''}`}
                    initial={{ opacity: m.reduced ? 1 : 0.35, scale: m.reduced ? 1 : 0.85 }} animate={{ opacity: 1, scale: 1 }}
                    transition={m.reduced ? { duration: 0 } : { ...m.soft, delay: 0.05 + i * 0.03 }}>{c}</Motion.span>
                );
              })}
            </div>
            <div className="viz-pills">
              {trace.steps.map((st, j) => (
                <Motion.span key={j} className={`viz-pill t${st.tok % 4}${st.ok ? '' : ' bad'}`}
                  variants={m.v.pop} initial="hidden" animate="show" custom={j + 1}>
                  <b>{props.pattern[st.tok]}</b>
                  <span className="viz-pill-took">{st.ok ? (chars.slice(st.from, st.to).join('') || '∅') : '✗'}</span>
                </Motion.span>
              ))}
            </div>
            <Motion.div className={`viz-stamp ${trace.match ? 'yes' : 'no'}`} initial={{ scale: m.reduced ? 1 : 0.4, opacity: m.reduced ? 1 : 0 }} animate={{ scale: 1, opacity: 1 }} transition={m.reduced ? { duration: 0 } : { ...m.bounce, delay: 0.1 + trace.steps.length * 0.07 }}>
              {trace.match ? '✓' : '✗'}
            </Motion.div>
          </Motion.div>
        )}
      </div>
      <ValueChips items={props.values} step={k} verdicts={verdicts} onPick={s.goto} />
      {k === L.count - 1 && <div className="viz-dim viz-note">{t(tally.en, tally.ro)}</div>}
    </VizFrame>
  );
}
