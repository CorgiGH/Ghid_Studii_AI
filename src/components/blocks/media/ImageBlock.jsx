import React from 'react';
import { useApp } from '../../../contexts/AppContext';

// Resolve a JSON-provided image path against the Vite base URL so it works
// both under the dev server root and the GitHub Pages subpath.
function resolveSrc(src) {
  if (!src) return src;
  if (/^(https?:)?\/\//i.test(src) || src.startsWith('data:')) return src;
  const base = import.meta.env.BASE_URL || '/';
  const clean = src.startsWith('/') ? src.slice(1) : src;
  return base.endsWith('/') ? base + clean : base + '/' + clean;
}

// Pick localized string from either a plain string or a {en, ro} object.
function pickLang(value, t) {
  if (!value) return value;
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && ('en' in value || 'ro' in value)) {
    return t(value.en || value.ro || '', value.ro || value.en || '');
  }
  return String(value);
}

export default function ImageBlock({ src, alt, caption, width, height }) {
  const { t } = useApp();
  const resolved = resolveSrc(src);
  const altText = pickLang(alt, t);

  // Ensure caption is prefixed with "Fig. — " for convention (only if not already).
  let captionText = pickLang(caption, t);
  if (captionText && !/^fig\.?\s*[—-]/i.test(captionText)) {
    captionText = `Fig. — ${captionText}`;
  }

  return (
    <figure className="mb-3 max-w-2xl mx-auto">
      <a
        href={resolved}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-xl"
        style={{
          padding: '0.5rem',
          background: 'var(--theme-card-bg)',
          border: '1px solid var(--theme-border)',
        }}
        aria-label={altText || 'Open image in new tab'}
      >
        <img
          src={resolved}
          alt={altText || ''}
          className="rounded-lg w-full block"
          loading="lazy"
          decoding="async"
          {...(width ? { width } : {})}
          {...(height ? { height } : {})}
        />
      </a>
      {captionText && (
        <figcaption
          className="text-sm italic mt-2 text-left"
          style={{ color: 'var(--theme-muted-text)' }}
        >
          {captionText}
        </figcaption>
      )}
    </figure>
  );
}
