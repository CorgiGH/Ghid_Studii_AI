import React from 'react';
import { useApp } from '../../contexts/AppContext';
import ProgressRing from './ProgressRing';

const InlineProgress = ({ courseId, sectionCount, sectionIds }) => {
  const { checked } = useApp();

  if (!sectionCount || sectionCount === 0) return null;

  const prefix = `${courseId}-`;
  const completedCount = Object.keys(checked).filter(k => k.startsWith(prefix) && checked[k]).length;

  return (
    <div
      className="flex items-center gap-3 px-4 py-2"
      style={{ borderBottom: '1px solid var(--theme-border)' }}
    >
      <div className="flex-1 flex gap-[3px] h-[5px]">
        {Array.from({ length: sectionCount }, (_, i) => {
          const sectionId = sectionIds?.[i];
          const isChecked = sectionId ? checked[sectionId] : i < completedCount;
          const isNext = !isChecked && i === completedCount;
          return (
            <div
              key={i}
              className="flex-1 rounded-sm transition-colors duration-300"
              style={{
                background: isChecked
                  ? '#22c55e'
                  : isNext
                    ? 'linear-gradient(90deg, #3b82f6 60%, var(--theme-border) 60%)'
                    : 'var(--theme-border)',
              }}
            />
          );
        })}
      </div>
      <ProgressRing size={22} completed={completedCount} total={sectionCount} />
    </div>
  );
};

export default InlineProgress;
