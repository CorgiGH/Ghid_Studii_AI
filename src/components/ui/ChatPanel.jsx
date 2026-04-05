import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../../contexts/AppContext';
import ChatMessage from './ChatMessage';
import { streamChat, verifyAnswer } from '../../services/api';

const ChatPanel = ({ pageContext, subjectSyllabus }) => {
  const { t, toggleChat, chatWidth, setChatWidth } = useApp();
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState([]);
  const [verifyMessages, setVerifyMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef(null);
  const lastResponseRef = useRef(null);
  const historyRef = useRef([]);
  const hasScrolledRef = useRef(false);
  const panelRef = useRef(null);
  const isDragging = useRef(false);

  // Scroll to the top of the latest response once when it first appears
  useEffect(() => {
    if (streamingContent && !hasScrolledRef.current) {
      hasScrolledRef.current = true;
      lastResponseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (!streamingContent) {
      hasScrolledRef.current = false;
    }
  }, [streamingContent]);

  // Scroll to top of new verify/finalized messages
  useEffect(() => {
    const msgs = activeTab === 'chat' ? messages : verifyMessages;
    const last = msgs[msgs.length - 1];
    if (last?.role === 'assistant') {
      requestAnimationFrame(() => {
        lastResponseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, [messages, verifyMessages, activeTab]);

  // Keep historyRef in sync with messages
  useEffect(() => {
    historyRef.current = messages.map(m => ({ role: m.role, content: m.content }));
  }, [messages]);

  // --- Resize handle drag logic ---
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';

    const handleMouseMove = (e) => {
      if (!isDragging.current) return;
      const newWidth = window.innerWidth - e.clientX;
      const sidebar = document.querySelector('[data-sidebar]');
      const sidebarWidth = sidebar ? sidebar.getBoundingClientRect().width : 0;
      const maxWidth = window.innerWidth - sidebarWidth - 300;
      const clamped = Math.max(280, Math.min(newWidth, maxWidth));
      if (panelRef.current) {
        panelRef.current.style.width = clamped + 'px';
      }
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      if (panelRef.current) {
        setChatWidth(parseInt(panelRef.current.style.width, 10));
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [setChatWidth]);

  // Clamp persisted width on window resize
  useEffect(() => {
    if (chatWidth === null) return;
    const handleResize = () => {
      const sidebar = document.querySelector('[data-sidebar]');
      const sidebarWidth = sidebar ? sidebar.getBoundingClientRect().width : 0;
      const maxWidth = window.innerWidth - sidebarWidth - 300;
      if (chatWidth > maxWidth) {
        const clamped = Math.max(280, maxWidth);
        setChatWidth(clamped);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [chatWidth, setChatWidth]);

  const currentMessages = activeTab === 'chat' ? messages : verifyMessages;

  const handleSendChat = useCallback(async (text) => {
    if (!text.trim() || isLoading) return;

    const userMsg = { role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setStreamingContent('');

    let fullResponse = '';

    await streamChat(
      {
        message: text.trim(),
        history: historyRef.current,
        pageContext: pageContext || '',
        subjectSyllabus: subjectSyllabus || '',
      },
      (chunk) => {
        fullResponse += chunk;
        setStreamingContent(fullResponse);
      },
      () => {
        setMessages(prev => [...prev, { role: 'assistant', content: fullResponse }]);
        setStreamingContent('');
        setIsLoading(false);
      },
      (error) => {
        setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error}` }]);
        setStreamingContent('');
        setIsLoading(false);
      }
    );
  }, [isLoading, pageContext, subjectSyllabus]);

  const handleSendVerify = useCallback(async (text) => {
    if (!text.trim() || isLoading) return;

    const userMsg = { role: 'user', content: text.trim() };
    setVerifyMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await verifyAnswer({
        question: text.trim(),
        studentAnswer: text.trim(),
        type: 'open-ended',
        keyConcepts: [],
        modelAnswer: '',
      });
      setVerifyMessages(prev => [...prev, {
        role: 'assistant',
        content: result.explanation || result.content || 'No response',
        verdict: result.verdict || null,
      }]);
    } catch (err) {
      setVerifyMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${err.message}`,
      }]);
    }
    setIsLoading(false);
  }, [isLoading]);

  // Listen for "Check with AI" button events from MultipleChoice
  const handleCheckFromButton = useCallback(async (data) => {
    setActiveTab('check');
    const summary = data.type === 'multiple-choice'
      ? `Q: ${data.question}\nSelected: ${data.selectedText}`
      : `Q: ${data.question}\nMy answer: ${data.studentAnswer}`;

    setVerifyMessages(prev => [...prev, { role: 'user', content: summary }]);
    setIsLoading(true);

    try {
      const result = await verifyAnswer(data);
      setVerifyMessages(prev => [...prev, {
        role: 'assistant',
        content: result.explanation || result.content || 'No response',
        verdict: result.verdict || null,
      }]);
    } catch (err) {
      setVerifyMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${err.message}`,
      }]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const handler = (e) => handleCheckFromButton(e.detail);
    window.addEventListener('check-with-ai', handler);
    return () => window.removeEventListener('check-with-ai', handler);
  }, [handleCheckFromButton]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (activeTab === 'chat') {
      handleSendChat(input);
    } else {
      handleSendVerify(input);
    }
  };

  const handleNewConversation = () => {
    setMessages([]);
    setStreamingContent('');
  };

  return (
    <div
      ref={panelRef}
      className="hidden lg:flex flex-col flex-shrink-0 sticky self-start"
      style={{
        top: 'var(--topbar-height, 44px)',
        width: chatWidth ? chatWidth + 'px' : '30%',
        minWidth: chatWidth ? undefined : '280px',
        maxWidth: chatWidth ? undefined : '400px',
        height: 'calc(100vh - var(--topbar-height, 44px))',
        backgroundColor: 'var(--theme-sidebar-bg)',
        borderLeft: '1px solid var(--theme-sidebar-border)',
        position: 'relative',
      }}
    >
      {/* Resize handle */}
      <div
        onMouseDown={handleMouseDown}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '6px',
          cursor: 'col-resize',
          zIndex: 10,
          transition: 'background-color 0.15s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(59,130,246,0.3)'}
        onMouseLeave={(e) => { if (!isDragging.current) e.currentTarget.style.backgroundColor = 'transparent'; }}
      />
      {/* Header with tabs */}
      <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: '1px solid var(--theme-border)' }}>
        <button
          className="text-xs px-3 py-1 rounded-full transition-colors"
          style={{
            backgroundColor: activeTab === 'chat' ? '#3b82f6' : 'transparent',
            color: activeTab === 'chat' ? '#fff' : 'var(--theme-muted-text)',
          }}
          onClick={() => setActiveTab('chat')}
        >
          Chat
        </button>
        <button
          className="text-xs px-3 py-1 rounded-full transition-colors"
          style={{
            backgroundColor: activeTab === 'check' ? '#3b82f6' : 'transparent',
            color: activeTab === 'check' ? '#fff' : 'var(--theme-muted-text)',
          }}
          onClick={() => setActiveTab('check')}
        >
          {t('Check Answer', 'Verifică')}
        </button>
        <div className="flex-1" />
        {activeTab === 'chat' && messages.length > 0 && (
          <button
            className="text-[10px] px-2 py-0.5 rounded transition-colors"
            style={{ color: 'var(--theme-muted-text)', backgroundColor: 'var(--theme-hover-bg)' }}
            onClick={handleNewConversation}
          >
            {t('New', 'Nou')}
          </button>
        )}
        <button
          className="text-xs p-1 rounded transition-colors"
          style={{ color: 'var(--theme-muted-text)' }}
          onClick={toggleChat}
          aria-label="Close chat"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3">
        {currentMessages.length === 0 && !streamingContent && (
          <div className="text-center mt-8 opacity-50 text-xs">
            {activeTab === 'chat'
              ? t('Ask a question about this course...', 'Pune o întrebare despre acest curs...')
              : t('Type your question and answer, or use "Check with AI" buttons', 'Scrie întrebarea și răspunsul, sau folosește butoanele "Verifică cu AI"')}
          </div>
        )}
        {currentMessages.map((msg, i) => {
          const isLastAssistant = msg.role === 'assistant' && i === currentMessages.length - 1;
          return (
            <div key={i} ref={isLastAssistant ? lastResponseRef : undefined}>
              <ChatMessage role={msg.role} content={msg.content} verdict={msg.verdict} />
            </div>
          );
        })}
        {streamingContent && activeTab === 'chat' && (
          <div ref={lastResponseRef}>
            <ChatMessage role="assistant" content={streamingContent} isStreaming={true} />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2 p-3" style={{ borderTop: '1px solid var(--theme-border)' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={activeTab === 'chat'
            ? t('Ask about this course...', 'Întreabă despre curs...')
            : t('Type your question...', 'Scrie întrebarea...')}
          className="flex-1 text-sm rounded-lg px-3 py-2 outline-none"
          style={{
            backgroundColor: 'var(--theme-hover-bg)',
            color: 'var(--theme-content-text)',
            border: '1px solid var(--theme-border)',
          }}
          disabled={isLoading}
        />
        <button
          type="submit"
          className="text-sm px-3 py-2 rounded-lg text-white transition-colors"
          style={{ backgroundColor: isLoading ? '#64748b' : '#3b82f6' }}
          disabled={isLoading || !input.trim()}
        >
          {isLoading ? '...' : t('Send', 'Trimite')}
        </button>
      </form>
    </div>
  );
};

export default ChatPanel;
