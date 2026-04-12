import React from 'react';
import { useApp } from '../../contexts/AppContext';

const ContentTypeBar = ({ subject, activeTab, onTabChange }) => {
  const { t } = useApp();

  const tabs = [];
  if (subject.courses?.length > 0) {
    tabs.push({ id: 'courses', label: t('Courses', 'Cursuri') });
  }
  if (subject.seminars?.length > 0) {
    tabs.push({ id: 'seminars', label: t('Solved Exercises', 'Exerciții rezolvate') });
  }
  if (subject.labs?.length > 0) {
    tabs.push({ id: 'labs', label: t('Exercises', 'Exerciții') });
  }
  if (subject.practice) {
    tabs.push({ id: 'practice', label: t('Practice', 'Practică') });
  }
  if (subject.tests?.length > 0) {
    tabs.push({ id: 'tests', label: t('Tests', 'Teste') });
  }

  return (
    <div
      className="flex items-center gap-1 px-4 py-2 overflow-x-auto transition-colors duration-200 sticky z-20"
      style={{
        top: 'var(--topbar-offset, 0px)',
        transition: 'top 0.2s ease-in-out, background-color 0.2s, color 0.2s',
        backgroundColor: 'var(--theme-content-type-bg)',
        borderBottom: '1px solid var(--theme-border)',
      }}
    >
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="px-3.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all duration-150 min-h-[44px] flex items-center"
            style={isActive ? {
              backgroundColor: 'var(--theme-card-bg)',
              color: '#3b82f6',
              fontWeight: 600,
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
            } : {
              backgroundColor: 'transparent',
              color: 'var(--theme-muted-text)',
              border: '1px solid transparent',
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default ContentTypeBar;
