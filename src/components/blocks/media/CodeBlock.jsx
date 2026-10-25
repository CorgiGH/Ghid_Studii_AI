import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../../contexts/AppContext';
import { isLineComment, tokenize, wrapsLines } from './codeTokens.js';

// Token colors share the green family with the code body so highlighted
// tokens read as accents, not as hostile "syntax highlighter" rainbow.
const TOKEN_COLORS = {
  keyword: '#60a5fa',   // blue — control flow + type qualifiers
  type:    '#a78bfa',   // violet — built-in types, std:: namespace
  string:  '#fbbf24',   // amber — string / char literals
  number:  '#f472b6',   // pink — numeric literals
  preproc: '#fb923c',   // orange — preprocessor directives
  punct:   undefined,   // inherit code-body green
};

const COMMENT_STYLE = { color: 'color-mix(in srgb, var(--theme-content-text) 55%, transparent)', fontStyle: 'italic' };

// In a wrapped line a comment after the statement (`-- 37`) moves to the next line as a whole, and a short string
// ('-', '   test   ') is never split: its characters, spaces included, are the point.
const KEEP_COMMENT = { display: 'inline-block', maxWidth: '100%', textIndent: 0, verticalAlign: 'top' };
const KEEP_STRING = { whiteSpace: 'pre' };

function renderTokens(tokens, wrap = false) {
  return tokens.map((tok, idx) => {
    if (tok.kind === 'comment') return <span key={idx} style={wrap ? { ...COMMENT_STYLE, ...KEEP_COMMENT } : COMMENT_STYLE}>{tok.text}</span>;
    const color = TOKEN_COLORS[tok.kind];
    const keep = wrap && tok.kind === 'string' && tok.text.length <= 24 ? KEEP_STRING : null;
    if (!color) return <React.Fragment key={idx}>{tok.text}</React.Fragment>;
    return <span key={idx} style={{ color, ...keep }}>{tok.text}</span>;
  });
}

const SUBGOAL_STYLE = { fontWeight: 600, color: 'color-mix(in srgb, var(--theme-content-text) 75%, transparent)' };

function lineBody(line, language, wrap = false) {
  if (isLineComment(line, language)) {
    const isSubgoal = /^(\/\/|\*)\s*(\d+\.\s|Step|Phase|Initialize|Process|Check|Return|Finalize|Acquire|Release|Validate)/i.test(line.trimStart());
    return <span style={{ ...COMMENT_STYLE, ...(isSubgoal ? SUBGOAL_STYLE : {}) }}>{line}</span>;
  }
  return renderTokens(tokenize(line, language), wrap);
}

// Scrolled sideways: is there code past the right edge that the reader has not reached?
function useCutRight(ref, active, content) {
  const [cut, setCut] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!active || !el) return undefined;
    const measure = () => setCut(el.scrollWidth > el.clientWidth + 2 && el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
    measure();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    ro?.observe(el);
    el.addEventListener('scroll', measure, { passive: true });
    return () => { ro?.disconnect(); el.removeEventListener('scroll', measure); };
  }, [ref, active, content]);
  return cut;
}

export default function CodeBlock({ language, content, code }) {
  content = content || code || '';
  const { t } = useApp();
  const wrap = wrapsLines(language);
  const preRef = useRef(null);
  const cut = useCutRight(preRef, !wrap, content);
  const fade = cut ? 'linear-gradient(to right, black 0%, black 88%, transparent 100%)' : 'none';
  const lines = content.split('\n');
  return (
    <div className="rounded-xl mb-3 overflow-hidden" style={{ border: '1px solid var(--theme-border)', position: 'relative' }}>
      {language && (
        <div
          data-block-label
          className="px-3 py-1 flex items-center"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--theme-content-text) 6%, var(--theme-card-bg))',
            borderBottom: '1px solid var(--theme-border)',
          }}
        >
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
            style={{
              backgroundColor: 'color-mix(in srgb, #10b981 18%, var(--theme-card-bg))',
              color: '#10b981',
              letterSpacing: '0.08em',
            }}
          >
            {language}
          </span>
        </div>
      )}
      <pre
        ref={preRef}
        className={`p-4 text-sm leading-relaxed${wrap ? '' : ' overflow-x-auto'}`}
        data-wrap={wrap ? 'true' : undefined}
        style={{
          backgroundColor: 'color-mix(in srgb, #10b981 4%, var(--theme-card-bg))',
          color: '#10b981',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          margin: 0,
          ...(wrap ? { whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' } : { maskImage: fade, WebkitMaskImage: fade }),
        }}
      >
        <code>
          {wrap
            ? lines.map((line, i) => {
              // the continuation of a wrapped line starts 2 characters right of where the line's own text starts
              const lead = line.length - line.trimStart().length;
              return (
                <span key={i} style={{ display: 'block', paddingLeft: `${lead + 2}ch`, textIndent: `-${lead + 2}ch` }}>
                  {line === '' ? '\u00a0' : lineBody(line, language, true)}
                </span>
              );
            })
            : lines.map((line, i) => (
              <React.Fragment key={i}>
                {i > 0 && '\n'}
                {lineBody(line, language)}
              </React.Fragment>
            ))}
        </code>
      </pre>
      {cut && (
        <span
          aria-hidden="true"
          data-testid="code-scroll-cue"
          className="text-[10px] font-semibold px-1.5 rounded"
          style={{ position: 'absolute', right: 6, bottom: 2, color: 'var(--theme-muted-text)', background: 'var(--theme-card-bg)' }}
        >
          {t('scroll →', 'derulează →')}
        </span>
      )}
    </div>
  );
}
