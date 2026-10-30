import React from 'react';
import { StepsBody } from './GuideParts.jsx';

// Block JSON: { type: 'steps', intro?: [part], items?: [{ en, ro }], start?, result? } (guideSpec.js): a worked example as
// one card, its data on top, then the steps, each a line or two with its number in an accent circle, then the result.
export default function StepsBlock({ intro, items, start = 1, result }) {
  return (
    <div className="ch-gcard ch-steps" data-testid="steps-block">
      <StepsBody intro={intro} items={items} start={start} result={result} />
    </div>
  );
}
