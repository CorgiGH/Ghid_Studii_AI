import React, { Suspense } from 'react';
import registry from './registry';
import UnknownBlock from './UnknownBlock';

export default function BlockRenderer({ block, lectureVisible }) {
  if (block.type.startsWith('lecture') && !lectureVisible) return null;

  const Component = registry[block.type];
  if (!Component) return <UnknownBlock type={block.type} />;

  return (
    <Suspense fallback={<div className="animate-pulse h-8 rounded" style={{ backgroundColor: 'var(--theme-border)' }} />}>
      <Component {...block} />
    </Suspense>
  );
}
