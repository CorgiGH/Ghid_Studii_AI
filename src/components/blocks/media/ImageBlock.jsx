import React from 'react';

export default function ImageBlock({ src, alt, caption }) {
  return (
    <figure className="mb-3">
      <img src={src} alt={alt || ''} className="rounded-xl w-full" style={{ border: '1px solid var(--theme-border)' }} />
      {caption && <figcaption className="text-xs mt-1 text-center" style={{ color: 'var(--theme-muted-text)' }}>{caption}</figcaption>}
    </figure>
  );
}
