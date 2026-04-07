import React from 'react';
import { useApp } from '../../contexts/AppContext';
import ProgressRing from './ProgressRing';
import useStaggeredEntrance from '../../hooks/useStaggeredEntrance';

const CourseMap = ({ subject, onCourseClick }) => {
  const { lang, t, checked, progress } = useApp();
  const getStaggerStyle = useStaggeredEntrance(subject.slug);

  const courses = subject.courses || [];
  if (courses.length === 0) return null;

  const courseProgress = courses.map(course => {
    const total = course.sectionCount || 0;
    let completed;
    if (course.src) {
      const prefix = (course.metaId || course.id) + '-';
      completed = total > 0
        ? Object.keys(progress).filter(k => k.startsWith(prefix) && progress[k]?.understood).length
        : 0;
    } else {
      const prefix = `${course.id}-`;
      completed = total > 0
        ? Object.keys(checked).filter(k => k.startsWith(prefix) && checked[k]).length
        : 0;
    }
    return { course, completed, total };
  });

  const totalSections = courseProgress.reduce((sum, cp) => sum + cp.total, 0);
  const totalCompleted = courseProgress.reduce((sum, cp) => sum + cp.completed, 0);
  const overallPercent = totalSections > 0 ? Math.round((totalCompleted / totalSections) * 100) : 0;

  // Find the best course to resume
  const resumeCourse = (() => {
    for (const { course, completed, total } of courseProgress) {
      if (!course.src) continue;
      const key = `lastStep:${course.src}`;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const isComplete = total > 0 && completed >= total;
      if (isComplete) continue;
      try {
        const data = JSON.parse(raw);
        return { course, ...data };
      } catch { continue; }
    }
    for (const { course, completed, total } of courseProgress) {
      const isComplete = total > 0 && completed >= total;
      if (completed > 0 && !isComplete) return { course, stepIndex: 0 };
    }
    return null;
  })();

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

      {/* Resume banner */}
      {resumeCourse && (
        <button
          onClick={() => onCourseClick(resumeCourse.course.id)}
          className="w-full mb-4 p-3 rounded-xl text-left cursor-pointer transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md active:translate-y-px"
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            border: 'none',
            animation: 'fadeIn 0.4s ease',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/20 flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="white"><polygon points="3,0 14,7 3,14" /></svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white/70">
                {t('Continue where you left off', 'Continuă de unde ai rămas')}
              </div>
              <div className="text-sm font-bold text-white truncate">
                {resumeCourse.course.shortTitle[lang]}
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 3L11 8L6 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </button>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {courseProgress.map(({ course, completed, total }, index) => {
          const isComplete = total > 0 && completed >= total;
          const hasProgress = completed > 0;

          const isNext = !isComplete && !hasProgress &&
            courseProgress.slice(0, index).every(cp => cp.total > 0 && cp.completed >= cp.total);

          let tileBg, tileBorder;
          if (isComplete) {
            tileBg = '#f0fdf4'; tileBorder = '#bbf7d0';
          } else if (hasProgress) {
            tileBg = '#eff6ff'; tileBorder = '#bfdbfe';
          } else if (isNext) {
            tileBg = 'var(--theme-card-bg)'; tileBorder = '#93c5fd';
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
                opacity: (!hasProgress && !isComplete && !isNext) ? 0.6 : getStaggerStyle(index).opacity,
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
