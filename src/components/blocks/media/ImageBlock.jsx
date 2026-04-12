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

  // Captions are authored by hand — render as-is. Authors can add "Fig. N — "
  // manually when numbering is desired.
  const captionText = pickLang(caption, t);

  const isDecorative = !altText;

  return (
    <figure className="mb-5 max-w-2xl mx-auto">
      <a
        href={resolved}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-xl relative"
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
          style={{ cursor: 'zoom-in' }}
          loading="lazy"
          decoding="async"
          {...(width ? { width } : {})}
          {...(height ? { height } : {})}
        />
        {!isDecorative && (
          <span
            aria-hidden="true"
            className="absolute flex items-center justify-center pointer-events-none"
            style={{
              top: '0.5rem',
              right: '0.5rem',
              width: '20px',
              height: '20px',
              background: 'transparent',
              opacity: 0.5,
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--theme-muted-text)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.5" y2="16.5" />
            </svg>
          </span>
        )}
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
