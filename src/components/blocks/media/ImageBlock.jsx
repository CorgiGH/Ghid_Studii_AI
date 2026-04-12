import React from 'react';

// Resolve a JSON-provided image path against the Vite base URL so it works
// both under the dev server root and the GitHub Pages subpath.
function resolveSrc(src) {
  if (!src) return src;
  if (/^(https?:)?\/\//i.test(src) || src.startsWith('data:')) return src;
  const base = import.meta.env.BASE_URL || '/';
  const clean = src.startsWith('/') ? src.slice(1) : src;
  return base.endsWith('/') ? base + clean : base + '/' + clean;
}

export default function ImageBlock({ src, alt, caption }) {
  return (
    <figure className="mb-3">
      <img src={resolveSrc(src)} alt={alt || ''} className="rounded-xl w-full" style={{ border: '1px solid var(--theme-border)' }} />
      {caption && <figcaption className="text-xs mt-1 text-center" style={{ color: 'var(--theme-muted-text)' }}>{caption}</figcaption>}
    </figure>
  );
}
