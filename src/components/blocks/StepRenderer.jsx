import React from 'react';
import BlockRenderer from './BlockRenderer';

export default function StepRenderer({ step, lectureVisible }) {
  if (!step || !step.blocks) return null;

  return (
    <div>
      {step.blocks.map((block, i) => (
        <BlockRenderer key={i} block={block} lectureVisible={lectureVisible} />
      ))}
    </div>
  );
}
