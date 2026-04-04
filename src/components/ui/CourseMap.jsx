import React from 'react';
import { useApp } from '../../contexts/AppContext';
import ProgressRing from './ProgressRing';
import useStaggeredEntrance from '../../hooks/useStaggeredEntrance';

const CourseMap = ({ subject, onCourseClick }) => {
  const { lang, t, checked } = useApp();
  const getStaggerStyle = useStaggeredEntrance(subject.slug);

  const courses = subject.courses || [];
  if (courses.length === 0) return null;

  const courseProgress = courses.map(course => {
    const total = course.sectionCount || 0;
    const prefix = `${course.id}-`;
    const completed = total > 0
      ? Object.keys(checked).filter(k => k.startsWith(prefix) && checked[k]).length
      : 0;
    return { course, completed, total };
  });

  const totalSections = courseProgress.reduce((sum, cp) => sum + cp.total, 0);
  const totalCompleted = courseProgress.reduce((sum, cp) => sum + cp.completed, 0);
  const overallPercent = totalSections > 0 ? Math.round((totalCompleted / totalSections) * 100) : 0;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1">
          <div className="flex justify-between mb-1.5">
            <span className="font-bold text-sm" style={{ color: 'var(--theme-content-text)' }}>
              {subject.title[lang]}
            </span>
            <span className="text-xs font-semibold" style={{ color: '#3b82f6' }}>
              {overallPercent}% {t('complete', 'complet')}
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--theme-border)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${overallPercent}%`, background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)' }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {courseProgress.map(({ course, completed, total }, index) => {
          const isComplete = total > 0 && completed >= total;
          const hasProgress = completed > 0;

          let tileBg, tileBorder;
          if (isComplete) {
            tileBg = '#f0fdf4'; tileBorder = '#bbf7d0';
          } else if (hasProgress) {
            tileBg = '#eff6ff'; tileBorder = '#bfdbfe';
          } else {
            tileBg = 'var(--theme-card-bg)'; tileBorder = 'var(--theme-border)';
          }

          return (
            <button
              key={course.id}
              onClick={() => onCourseClick(course.id)}
              className="text-center p-3 rounded-xl cursor-pointer transition-all duration-150 hover:-translate-y-1 hover:shadow-md active:translate-y-px active:scale-[0.98] active:shadow-sm"
              style={{
                ...getStaggerStyle(index),
                backgroundColor: tileBg,
                border: `1.5px solid ${tileBorder}`,
                opacity: (!hasProgress && !isComplete) ? 0.6 : getStaggerStyle(index).opacity,
              }}
            >
              <div className="flex justify-center mb-1.5">
                <ProgressRing size={40} completed={completed} total={total} />
              </div>
              <div
                className="font-bold text-xs"
                style={{ color: isComplete ? '#16a34a' : hasProgress ? '#2563eb' : 'var(--theme-muted-text)' }}
              >
                {course.shortTitle[lang].split(':')[0]}
              </div>
              <div className="text-[10px] mt-0.5 truncate" style={{ color: 'var(--theme-muted-text)' }}>
                {course.shortTitle[lang].split(':').slice(1).join(':').trim() || course.shortTitle[lang]}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CourseMap;
