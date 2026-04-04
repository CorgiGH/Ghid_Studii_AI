import React from 'react';
import { useApp } from '../../contexts/AppContext';

const ReadingProgress = ({ courseId, sectionCount }) => {
  const { checked } = useApp();

  if (!sectionCount || sectionCount === 0) return null;

  const prefix = `${courseId}-`;
  const completedCount = Object.keys(checked).filter(k => k.startsWith(prefix) && checked[k]).length;
  const percent = Math.min((completedCount / sectionCount) * 100, 100);

  return (
    <div className="mb-4">
      <div className="h-[3px] rounded-full overflow-hidden" style={{ backgroundColor: 'var(--theme-border)' }}>
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${percent}%`,
            background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
          }}
        />
      </div>

      <div className="flex items-center gap-1 mt-2">
        <div
          className="h-[3px] flex-1 rounded-full transition-all duration-300"
          style={{
            background: completedCount > 0
              ? `linear-gradient(90deg, #22c55e ${percent}%, var(--theme-border, #e5e7eb) ${percent}%)`
              : 'var(--theme-border, #e5e7eb)',
          }}
        />
        <span className="ml-2 text-[11px] whitespace-nowrap" style={{ color: 'var(--theme-muted-text)' }}>
          {completedCount}/{sectionCount}
        </span>
      </div>
    </div>
  );
};

export default ReadingProgress;
