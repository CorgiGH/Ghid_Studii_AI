import React from 'react';

/**
 * Pre-test mode selection. Research §10: two cards, hover gets blue border.
 * Tutor = explanations after each Q. Timed = countdown, results at end.
 */
export default function TestModeSelector({ onSelect, lang }) {
  const modes = [
    {
      key: 'tutor',
      title: lang === 'ro' ? 'Mod Tutor' : 'Tutor Mode',
      desc: lang === 'ro'
        ? 'Explica\u021Bii dup\u0103 fiecare \u00EEntrebare. Po\u021Bi \u00EEnv\u0103\u021Ba din gre\u0219eli pe parcurs.'
        : 'Explanations after each question. Learn from mistakes as you go.',
      icon: '\u270D\uFE0F',
    },
    {
      key: 'timed',
      title: lang === 'ro' ? 'Mod Cronometrat' : 'Timed Mode',
      desc: lang === 'ro'
        ? 'Cronometru cu num\u0103r\u0103toare invers\u0103. Rezultate la final.'
        : 'Countdown timer. Results at the end.',
      icon: '\u23F1\uFE0F',
    },
  ];

  return (
    <div className="py-8" style={{ maxWidth: 'var(--content-max-width)', margin: '0 auto' }}>
      <h2
        className="text-center mb-6"
        style={{
          fontSize: 'var(--type-h2)',
          fontWeight: 'var(--type-h2-weight)',
          color: 'var(--theme-content-text)',
        }}
      >
        {lang === 'ro' ? 'Alege Modul' : 'Choose Mode'}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
        {modes.map(mode => (
          <button
            key={mode.key}
            onClick={() => onSelect(mode.key)}
            className="p-6 rounded-xl text-left transition-all hover:scale-[1.02]"
            style={{
              backgroundColor: 'var(--theme-card-bg)',
              border: '2px solid var(--theme-border)',
              cursor: 'pointer',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#3b82f6';
              e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--theme-border)';
              e.currentTarget.style.backgroundColor = 'var(--theme-card-bg)';
            }}
          >
            <span style={{ fontSize: '32px' }}>{mode.icon}</span>
            <h3
              className="mt-3"
              style={{
                fontSize: 'var(--type-h3)',
                fontWeight: 'var(--type-h3-weight)',
                color: 'var(--theme-content-text)',
              }}
            >
              {mode.title}
            </h3>
            <p className="mt-2" style={{ color: 'var(--theme-muted-text)', fontSize: '14px' }}>
              {mode.desc}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
