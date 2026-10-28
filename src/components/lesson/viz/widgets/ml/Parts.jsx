import React from 'react';
import { classMark } from '../../logic/ml/threshold.js';
import { polarity } from '../../logic/ml/tree-grow.js';
import './ml-w4.css';

export function Shape({ shape, cx, cy, r = 7, fill, className = 'mlw4-pt', ...rest }) {
  if (shape === 'square') return <rect x={cx - r} y={cy - r} width={2 * r} height={2 * r} rx="2" fill={fill} className={className} {...rest} />;
  if (shape === 'triangle') return <polygon points={`${cx},${cy - r - 1} ${cx + r + 1},${cy + r} ${cx - r - 1},${cy + r}`} fill={fill} className={className} {...rest} />;
  if (shape === 'diamond') return <polygon points={`${cx},${cy - r - 1} ${cx + r + 1},${cy} ${cx},${cy + r + 1} ${cx - r - 1},${cy}`} fill={fill} className={className} {...rest} />;
  return <circle cx={cx} cy={cy} r={r} fill={fill} className={className} {...rest} />;
}

// [3+,1-] with every count a mark of its own (a caption number can then be checked against the drawing)
export function Counts({ counts, classes }) {
  const pn = classes.length === 2 && polarity(classes[0]) === 'pos' && polarity(classes[1]) === 'neg';
  const n = (v, k) => <span key={k} data-mark="count" data-value={v}>{v}</span>;
  if (pn) return <span>[{n(counts[0], 0)}+,{n(counts[1], 1)}{'−'}]</span>;
  return <span>[{classes.map((c, k) => <React.Fragment key={k}>{k ? ', ' : ''}{String(c)} {n(counts[k], k)}</React.Fragment>)}]</span>;
}

export function Legend({ classes }) {
  return (
    <div className="mlw4-legend">
      {classes.map((c, k) => {
        const m = classMark(classes, k);
        return <span key={k}><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><Shape shape={m.shape} cx={8} cy={8} r={5} fill={m.colour} /></svg>{String(c)}</span>;
      })}
    </div>
  );
}
