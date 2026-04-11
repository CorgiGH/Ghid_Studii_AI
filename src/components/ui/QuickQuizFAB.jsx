import React, { useState } from 'react';

/**
 * Floating action button that launches a random quiz.
 * Bottom-right, above bottom tab bar on mobile.
 * Standard FAB: 56px, circular, shadow elevation 6dp.
 */
export default function QuickQuizFAB({ onQuiz, lang }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onQuiz}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="fixed z-40 flex items-center justify-center rounded-full transition-all"
      style={{
        width: '56px',
        height: '56px',
        bottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
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
