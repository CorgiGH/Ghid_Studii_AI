import React from 'react';
import { useApp } from '../../contexts/AppContext';
import BlockRenderer from './BlockRenderer';

export default function StepRenderer({ step, lectureVisible, isUnderstood, onToggleUnderstood }) {
  const { t } = useApp();

  if (!step || !step.blocks) return null;

  return (
    <div>
      {step.blocks.map((block, i) => (
        <BlockRenderer key={i} block={block} lectureVisible={lectureVisible} />
      ))}

      {/* "I understand" button */}
      <div className="flex justify-center mt-8 mb-2">
        <button
          onClick={onToggleUnderstood}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer"
          style={{
            backgroundColor: isUnderstood ? '#10b981' : 'transparent',
            color: isUnderstood ? '#fff' : '#10b981',
            border: `2px solid ${isUnderstood ? '#10b981' : '#10b98180'}`,
            boxShadow: isUnderstood ? '0 2px 12px rgba(16,185,129,0.3)' : 'none',
          }}
        >
          {isUnderstood ? (
            <>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8.5L6.5 12L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {t('Understood!', 'Am înțeles!')}
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              {t('I understand this', 'Am înțeles asta')}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
