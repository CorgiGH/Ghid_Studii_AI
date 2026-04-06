import React from 'react';

export default function CodeBlock({ language, content }) {
  return (
    <div className="rounded-xl mb-3 overflow-hidden" style={{ border: '1px solid var(--theme-border)' }}>
      {language && (
        <div
          className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
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
        <code>{content}</code>
      </pre>
    </div>
  );
}
