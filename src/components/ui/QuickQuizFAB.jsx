import React, { useState, useEffect } from 'react';

/**
 * Floating action button that launches a random quiz.
 * Bottom-right, above bottom tab bar on mobile, near bottom on desktop.
 * Standard FAB: 56px, circular, shadow elevation 6dp.
 */
export default function QuickQuizFAB({ onQuiz, lang }) {
  const [hovered, setHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 1023px)').matches);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // On mobile the BottomTabBar already surfaces Tests one tap away — the FAB
  // becomes redundant visual noise competing for the same corner.
  if (isMobile) return null;

  return (
    <button
      onClick={onQuiz}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="fixed z-40 flex items-center justify-center rounded-full transition-all"
      style={{
        width: '56px',
        height: '56px',
        bottom: '24px',
        right: '16px',
        backgroundColor: '#3b82f6',
        color: 'white',
        boxShadow: hovered
          ? '0 8px 16px rgba(59, 130, 246, 0.4)'
          : '0 4px 12px rgba(59, 130, 246, 0.3)',
        transform: hovered ? 'scale(1.05)' : 'scale(1)',
        fontSize: '24px',
        border: 'none',
        cursor: 'pointer',
      }}
      title={lang === 'ro' ? 'Quiz Rapid' : 'Quick Quiz'}
    >
      {'\u26A1'}
    </button>
  );
}
