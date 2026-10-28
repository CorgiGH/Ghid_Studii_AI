import React from 'react';
import { SYMS, showN } from '../../logic/ml/id3-common.js';
import './id3.css';

// A value the widget draws: data-value carries the exact text so a test can read the drawing back.
export function Val({ v, children, ...rest }) {
  return <span data-value={v} {...rest}>{children ?? v}</span>;
}

// "[48+,16-]": one mark per count
export function CountBox({ counts }) {
  return (
    <span className="mlv-box" data-box={counts.map(showN).join(',')}>
      <span className="mlv-sep" aria-hidden="true">[</span>
      {counts.map((c, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="mlv-sep" aria-hidden="true">,</span>}
          <span className={`mlv-c c${i}`}><b data-value={showN(c)}>{showN(c)}</b>{SYMS[i] ?? '?'}</span>
        </React.Fragment>
      ))}
      <span className="mlv-sep" aria-hidden="true">]</span>
    </span>
  );
}

// The prediction asked at a frame. Every option is a 44 px button.
export function PickBar({ spec, picks, onPick, t, L }) {
  if (!spec) return null;
  return (
    <div className="mlv-picks" role="group">
      {spec.items.map((it) => (
        <div key={it.key} className="mlv-stack">
          <p className="mlv-prompt">{t(it.prompt.en, it.prompt.ro)}</p>
          <div className="mlv-opts">
            {it.options.map((o) => (
              <button key={String(o.id)} type="button" className="mlv-opt" aria-pressed={picks[it.key] === o.id} onClick={() => onPick(it.key, o.id)}>{L(o.label)}</button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// the answered/unanswered state of a frame's prediction
// eslint-disable-next-line react-refresh/only-export-components -- a tiny helper that belongs with PickBar
export const allAnswered = (spec, picks) => !spec || spec.items.every((it) => picks[it.key] !== undefined);
