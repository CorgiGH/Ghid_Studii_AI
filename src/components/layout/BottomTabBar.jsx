import React, { useEffect } from 'react';

const TABS = [
  { key: 'courses', label: 'Courses', labelRo: 'Cursuri', icon: '\uD83D\uDCD6' },
  { key: 'seminars', label: 'Exercises', labelRo: 'Exerci\u021Bii', icon: '\u270D\uFE0F' },
  { key: 'labs', label: 'Labs', labelRo: 'Laboratoare', icon: '\uD83E\uDDEA' },
  { key: 'practice', label: 'Practice', labelRo: 'Practic\u0103', icon: '\uD83D\uDCBB' },
  { key: 'tests', label: 'Tests', labelRo: 'Teste', icon: '\uD83D\uDCCB' },
];

export default function BottomTabBar({ subject, activeTab, onTabChange, lang }) {
  // Only show tabs the subject actually has
  const visibleTabs = TABS.filter(t => {
    if (t.key === 'courses') return subject.courses?.length > 0;
    if (t.key === 'seminars') return subject.seminars?.length > 0;
    if (t.key === 'labs') return subject.labs?.length > 0;
    if (t.key === 'practice') return !!subject.practice;
    if (t.key === 'tests') return subject.tests?.length > 0;
    return false;
  });

  // Add bottom padding to body only when tab bar is visible
  useEffect(() => {
    if (visibleTabs.length < 2) return;
    document.body.style.paddingBottom = 'calc(64px + env(safe-area-inset-bottom, 0px))';
    return () => { document.body.style.paddingBottom = ''; };
  }, [visibleTabs.length]);

  if (visibleTabs.length < 2) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden"
      style={{
        backgroundColor: 'var(--theme-nav-bg)',
        borderTop: '1px solid var(--theme-border)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex justify-around items-center" style={{ height: '64px' }}>
        {visibleTabs.map(tab => {
          const isActive = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className="flex flex-col items-center justify-center flex-1 h-full relative transition-colors"
              style={{ color: isActive ? '#3b82f6' : 'var(--theme-muted-text)' }}
            >
              {isActive && (
                <span
                  className="absolute rounded-full"
                  style={{
                    width: '56px',
                    height: '32px',
                    backgroundColor: 'rgba(59, 130, 246, 0.12)',
                    top: '4px',
                    borderRadius: '16px',
                  }}
                />
              )}
              <span className="text-lg relative z-10">{tab.icon}</span>
              <span
                className="relative z-10"
                style={{
                  fontSize: '11px',
                  fontWeight: isActive ? 600 : 400,
                  marginTop: '2px',
                }}
              >
                {lang === 'ro' ? tab.labelRo : tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
