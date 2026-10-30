import React from 'react';
import { StepsBody } from './GuideParts.jsx';

// Block JSON: { type: 'steps', variant?: 'rule', intro?: [part], items?: [{ en, ro }], start?, result? } (guideSpec.js): a worked
// example as one card, its data on top, then the steps, each a line or two with its number in an accent circle, then the result.
// variant 'rule' is the rest of a rule continued from the screen before: it keeps the rule card's accent rail.
export default function StepsBlock({ variant, intro, items, start = 1, result }) {
  return (
    <div className={`ch-gcard ch-steps${variant === 'rule' ? ' ch-rule' : ''}`} data-testid="steps-block">
      <StepsBody intro={intro} items={items} start={start} result={result} />
    </div>
  );
}
