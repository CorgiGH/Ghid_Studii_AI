import React from 'react';

export default function CodeBlock({ language, content, code }) {
  content = content || code || '';
  return (
    <div className="rounded-xl mb-3 overflow-hidden" style={{ border: '1px solid var(--theme-border)' }}>
      {language && (
        <div
          className="px-3 py-1 text-xs font-semibold uppercase tracking-wide"
          style={{
            backgroundColor: 'var(--theme-border)',
            color: 'var(--theme-muted-text)',
          }}
        >
          {language}
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
            const isSubgoal = isComment && /^(\/\/|#)\s*(Step|Phase|Initialize|Process|Check|Return|Finalize)/i.test(trimmed);
            return (
              <React.Fragment key={i}>
                {i > 0 && '\n'}
                <span style={isComment ? {
                  color: '#6ee7b7',
                  fontStyle: 'italic',
                  ...(isSubgoal ? { fontWeight: 600 } : {}),
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
