import React from 'react';
import ReactMarkdown from 'react-markdown';

const verdictStyles = {
  correct: { borderColor: '#22c55e', icon: '\u2713', label: 'Correct', color: '#22c55e' },
  partial: { borderColor: '#f59e0b', icon: '~', label: 'Partial', color: '#f59e0b' },
  wrong: { borderColor: '#ef4444', icon: '\u2717', label: 'Wrong', color: '#ef4444' },
};

const markdownComponents = {
  code({ className, children, ...props }) {
    if (!className) {
      return (
        <code
          style={{
            backgroundColor: 'rgba(255,255,255,0.08)',
            padding: '1px 5px',
            borderRadius: '4px',
            fontSize: '0.85em',
            fontFamily: 'monospace',
          }}
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <code style={{ fontFamily: 'monospace', fontSize: '0.82em' }} {...props}>{children}</code>
    );
  },
  pre({ children }) {
    return (
      <pre
        style={{
          backgroundColor: 'rgba(0,0,0,0.3)',
          padding: '8px 10px',
          borderRadius: '6px',
          overflowX: 'auto',
          margin: '6px 0',
          lineHeight: '1.5',
        }}
      >
        {children}
      </pre>
    );
  },
  p({ children }) {
    return <p style={{ margin: '4px 0' }}>{children}</p>;
  },
  ul({ children }) {
    return <ul style={{ margin: '4px 0', paddingLeft: '18px' }}>{children}</ul>;
  },
  ol({ children }) {
    return <ol style={{ margin: '4px 0', paddingLeft: '18px' }}>{children}</ol>;
  },
  li({ children }) {
    return <li style={{ margin: '2px 0' }}>{children}</li>;
  },
  blockquote({ children }) {
    return (
      <blockquote
        style={{
          borderLeft: '2px solid rgba(255,255,255,0.2)',
          paddingLeft: '10px',
          margin: '4px 0',
          opacity: 0.85,
        }}
      >
        {children}
      </blockquote>
    );
  },
};

const ChatMessage = ({ role, content, verdict, isStreaming }) => {
  const isUser = role === 'user';
  const vStyle = verdict ? verdictStyles[verdict] : null;

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className="max-w-[90%] rounded-lg px-3 py-2 text-sm leading-relaxed"
        style={{
          backgroundColor: 'var(--theme-card-bg)',
          color: 'var(--theme-content-text)',
          borderLeft: !isUser ? `2px solid ${vStyle?.borderColor || '#3b82f6'}` : undefined,
        }}
      >
        {vStyle && (
          <div className="font-bold text-xs mb-1" style={{ color: vStyle.color }}>
            {vStyle.icon} {vStyle.label}
          </div>
        )}
        {isUser ? (
          <div className="whitespace-pre-wrap">{content}</div>
        ) : (
          <div className="chat-markdown">
            <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
          </div>
        )}
        {isStreaming && (
          <span className="inline-block w-1.5 h-4 ml-0.5 animate-pulse" style={{ backgroundColor: '#3b82f6' }} />
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
