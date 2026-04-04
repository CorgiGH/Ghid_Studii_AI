import React from 'react';

const verdictStyles = {
  correct: { borderColor: '#22c55e', icon: '\u2713', label: 'Correct', color: '#22c55e' },
  partial: { borderColor: '#f59e0b', icon: '~', label: 'Partial', color: '#f59e0b' },
  wrong: { borderColor: '#ef4444', icon: '\u2717', label: 'Wrong', color: '#ef4444' },
};

const ChatMessage = ({ role, content, verdict, isStreaming }) => {
  const isUser = role === 'user';
  const vStyle = verdict ? verdictStyles[verdict] : null;

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className="max-w-[90%] rounded-lg px-3 py-2 text-sm leading-relaxed"
        style={{
          backgroundColor: isUser ? '#1e293b' : '#1a2332',
          color: isUser ? '#ccc' : '#ddd',
          borderLeft: !isUser ? `2px solid ${vStyle?.borderColor || '#3b82f6'}` : undefined,
        }}
      >
        {vStyle && (
          <div className="font-bold text-xs mb-1" style={{ color: vStyle.color }}>
            {vStyle.icon} {vStyle.label}
          </div>
        )}
        <div className="whitespace-pre-wrap">{content}</div>
        {isStreaming && (
          <span className="inline-block w-1.5 h-4 ml-0.5 animate-pulse" style={{ backgroundColor: '#3b82f6' }} />
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
