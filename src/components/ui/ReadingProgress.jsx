import React from 'react';
import { useApp } from '../../contexts/AppContext';

const ReadingProgress = ({ courseId, sectionCount }) => {
  const { checked, t } = useApp();

  if (!sectionCount || sectionCount === 0) return null;

  const sections = Array.from({ length: sectionCount }, (_, i) => ({
    id: `${courseId}-${i}`,
    completed: !!checked[`${courseId}-${i}`],
  }));

  const completedCount = sections.filter(s => s.completed).length;
  const percent = (completedCount / sectionCount) * 100;

  const currentIndex = sections.findIndex(s => !s.completed);

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
        {sections.map((section, i) => {
          let color;
          if (section.completed) {
            color = '#22c55e';
          } else if (i === currentIndex) {
            color = '#3b82f6';
          } else {
            color = 'var(--theme-border, #e5e7eb)';
          }

          return (
            <div
              key={section.id}
              className="h-[3px] flex-1 rounded-full transition-colors duration-300"
              style={{
                backgroundColor: color,
                boxShadow: i === currentIndex ? '0 0 4px rgba(59,130,246,0.4)' : 'none',
              }}
            />
          );
        })}
        <span className="ml-2 text-[11px] whitespace-nowrap" style={{ color: 'var(--theme-muted-text)' }}>
          {completedCount}/{sectionCount}
        </span>
      </div>
    </div>
  );
};

export default ReadingProgress;
