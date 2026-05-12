import React, { useRef, useState, useEffect } from 'react';
import katex from 'katex';
import { useApp } from '../../../contexts/AppContext';

/**
 * Standalone centered math equation. JSON shape:
 *   { "type": "equation", "tex": "Ax = \\lambda x", "label": { "en": "(1)", "ro": "(1)" } }
 * `label` is optional.
 *
 * Visual: left accent-rail + subtle tint (whiteboard metaphor), no card border.
 * Label sits in a right gutter via CSS grid, italic serif to match KaTeX typography.
 * KaTeX output is htmlAndMathml for screen-reader accessibility.
 *
 * Overflow handling: the math-display wrap detects scrollable content and shows
 * an edge-fade + thin scrollbar only while there is more content past the right
 * edge. Short equations that fit inside the column render with no fade.
 */
export default function EquationBlock({ tex, label }) {
  const { t } = useApp();
  const wrapRef = useRef(null);
  const [overflowState, setOverflowState] = useState({ overflows: false, atEnd: false });

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => {
      // +4 px threshold absorbs subpixel rounding + KaTeX font-load reflow.
      const overflows = el.scrollWidth > el.clientWidth + 4;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
      setOverflowState({ overflows, atEnd });
    };
    measure();
    // Re-measure after web fonts paint — KaTeX reflows on font load.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(measure).catch(() => {});
    }
    // Also re-measure on next animation frame for layout settling.
    const rafId = requestAnimationFrame(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    el.addEventListener('scroll', measure, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      el.removeEventListener('scroll', measure);
    };
  }, [tex]);

  if (!tex) return null;

  let html;
  try {
    html = katex.renderToString(tex, { displayMode: true, throwOnError: false, output: 'htmlAndMathml' });
  } catch {
    html = `<span style="color:var(--theme-error, #ef4444)">[math error: ${tex}]</span>`;
  }

  // Apply edge-fade ONLY when there is still content to the right of the
  // visible viewport. When the user scrolls to the end, drop the fade so
  // trailing characters/closing brackets aren't permanently obscured.
  const showFade = overflowState.overflows && !overflowState.atEnd;
  const mask = showFade
    ? 'linear-gradient(to right, black 0%, black 92%, transparent 100%)'
    : 'none';

  return (
    <div
      className="equation-grid my-4 py-3 pl-4 pr-4 rounded-r-lg"
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        alignItems: 'center',
        justifyItems: 'center',
        columnGap: '1rem',
        borderLeft: '4px solid #3b82f6',
        background: 'color-mix(in srgb, var(--theme-content-text) 5%, transparent)',
      }}
    >
      <div
        ref={wrapRef}
        className="math-display-wrap"
        style={{
          fontSize: '1.05em',
          textAlign: 'center',
          width: '100%',
          maxWidth: '100%',
          overflowX: 'auto',
          overflowY: 'hidden',
          WebkitOverflowScrolling: 'touch',
          maskImage: mask,
          WebkitMaskImage: mask,
          transition: 'mask-image 0.15s ease, -webkit-mask-image 0.15s ease',
          scrollbarWidth: overflowState.overflows ? 'thin' : 'none',
          scrollbarColor: 'var(--theme-muted-text) transparent',
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {label && (
        <div
          className="equation-label text-sm italic flex-shrink-0"
          style={{
            color: 'var(--theme-muted-text)',
            fontFamily: 'Georgia, "Times New Roman", serif',
            justifySelf: 'end',
          }}
        >
          {t(label.en, label.ro)}
        </div>
      )}
    </div>
  );
}
