import React from 'react';

export default function CodeBlock({ language, content, code }) {
  content = content || code || '';
  return (
    <div className="rounded-xl mb-3 overflow-hidden" style={{ border: '1px solid var(--theme-border)' }}>
      {language && (
        <div
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
        className="p-4 overflow-x-auto text-sm leading-relaxed"
        style={{
          backgroundColor: 'color-mix(in srgb, #10b981 4%, var(--theme-card-bg))',
          color: '#10b981',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          margin: 0,
        }}
      >
        <code>
          {content.split('\n').map((line, i) => {
            const trimmed = line.trimStart();
            const isComment = trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('/*') || trimmed.startsWith('*');
            const isSubgoal = isComment && /^(\/\/|#)\s*(\d+\.\s|Step|Phase|Initialize|Process|Check|Return|Finalize|Acquire|Release|Validate)/i.test(trimmed);
            return (
              <React.Fragment key={i}>
                {i > 0 && '\n'}
                <span style={isComment ? {
                  color: 'color-mix(in srgb, var(--theme-content-text) 55%, transparent)',
                  fontStyle: 'italic',
                  ...(isSubgoal ? { fontWeight: 600, color: 'color-mix(in srgb, var(--theme-content-text) 75%, transparent)' } : {}),
                } : undefined}>
                  {line}
                </span>
              </React.Fragment>
            );
          })}
        </code>
      </pre>
    </div>
  );
}
