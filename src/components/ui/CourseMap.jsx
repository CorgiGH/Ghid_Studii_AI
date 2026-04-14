import React from 'react';
import { useApp } from '../../contexts/AppContext';
import ProgressRing from './ProgressRing';
import useStaggeredEntrance from '../../hooks/useStaggeredEntrance';

const CourseMap = ({ subject, onCourseClick }) => {
  const { lang, t, dark, checked, progress } = useApp();
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

  const subjectDescription = subject.description?.[lang] || '';

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 mb-1.5">
            <span className="font-bold text-sm min-w-0" style={{ color: 'var(--theme-content-text)' }}>
              {subject.title[lang]}
            </span>
            {overallPercent > 0 && (
              <span className="text-xs font-semibold flex-shrink-0" style={{ color: '#3b82f6' }}>
                {overallPercent}% {t('complete', 'complet')}
              </span>
            )}
          </div>
          {overallPercent > 0 ? (
            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--theme-border)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${overallPercent}%`, background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)' }}
              />
            </div>
          ) : subjectDescription ? (
            <div className="text-xs leading-relaxed" style={{ color: 'var(--theme-muted-text)' }}>
              {subjectDescription}
            </div>
          ) : null}
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

      {/* Once a learner has started, a large central ring motivates; on a fresh
          subject it would just display a giant grey "0", so skip it until there
          is progress to celebrate. */}
      {totalCompleted > 0 && (
        <div className="flex flex-col items-center mb-6">
          <ProgressRing size={120} completed={totalCompleted} total={totalSections} />
          <p className="mt-2" style={{ fontSize: 'var(--type-body)', color: 'var(--theme-muted-text)' }}>
            {totalCompleted}/{totalSections} {t('sections', 'secțiuni')}
          </p>
        </div>
      )}
      {totalCompleted === 0 && courses[0] && (
        <button
          onClick={() => onCourseClick(courses[0].id)}
          className="w-full mb-6 text-center py-5 px-4 rounded-xl cursor-pointer transition-all duration-150 hover:-translate-y-0.5 hover:shadow-sm active:translate-y-px"
          style={{ backgroundColor: 'var(--theme-card-bg)', border: '1px dashed var(--theme-border)' }}
        >
          <div className="text-3xl mb-1">{subject.icon}</div>
          <p className="text-xs font-semibold" style={{ color: 'var(--theme-content-text)' }}>
            {t('Ready to start?', 'Gata de început?')}
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--theme-muted-text)' }}>
            {courses.length} {t('courses', 'cursuri')} · {totalSections} {t('sections total', 'secțiuni în total')}
          </p>
          <p className="text-[11px] mt-1.5 font-semibold" style={{ color: '#3b82f6' }}>
            {t('Start with', 'Începe cu')} {courses[0].shortTitle[lang].split(':')[0]} →
          </p>
        </button>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {courseProgress.map(({ course, completed, total }, index) => {
          const isComplete = total > 0 && completed >= total;
          const hasProgress = completed > 0;

          const isNext = !isComplete && !hasProgress &&
            courseProgress.slice(0, index).every(cp => cp.total > 0 && cp.completed >= cp.total);

          let borderLeftColor, tileBorder;
          if (isComplete) {
            borderLeftColor = '#22c55e';
            tileBorder = dark ? 'rgba(34,197,94,0.3)' : '#d1fae5';
          } else if (hasProgress) {
            borderLeftColor = '#3b82f6';
            tileBorder = dark ? 'rgba(96,165,250,0.3)' : '#dbeafe';
          } else if (isNext) {
            borderLeftColor = '#93c5fd';
            tileBorder = 'var(--theme-border)';
          } else {
            borderLeftColor = 'transparent';
            tileBorder = 'var(--theme-border)';
          }

          return (
            <button
              key={course.id}
              onClick={() => onCourseClick(course.id)}
              className="text-center p-3 rounded-xl cursor-pointer transition-all duration-150 hover:-translate-y-1 hover:shadow-md active:translate-y-px active:scale-[0.98] active:shadow-sm"
              style={{
                ...getStaggerStyle(index),
                backgroundColor: 'var(--theme-card-bg)',
                border: `1px solid ${tileBorder}`,
                borderLeft: `4px solid ${borderLeftColor}`,
                opacity: (!hasProgress && !isComplete && !isNext) ? 0.75 : getStaggerStyle(index).opacity,
              }}
            >
              <div className="flex justify-center mb-1.5">
                <ProgressRing size={40} completed={completed} total={total} />
              </div>
              {(() => {
                const full = course.shortTitle[lang];
                const [headRaw, ...tailParts] = full.split(':');
                const tail = tailParts.join(':').trim();
                const titleColor = isComplete ? '#16a34a' : hasProgress ? '#2563eb' : 'var(--theme-content-text)';
                return tail ? (
                  <div className="text-xs leading-tight" style={{ color: titleColor }}>
                    <span className="font-bold">{headRaw.trim()}</span>
                    <span className="opacity-80"> · {tail}</span>
                  </div>
                ) : (
                  <div className="text-xs leading-tight font-bold" style={{ color: titleColor }}>
                    {full}
                  </div>
                );
              })()}
              <div className="text-[10px] mt-1" style={{ color: 'var(--theme-muted-text)' }}>
                {total > 0 ? <>{total} {t('sections', 'secțiuni')}</> : null}
              </div>
              {totalCompleted === 0 && index === 0 && (
                <div className="text-[10px] mt-0.5 font-semibold" style={{ color: '#3b82f6' }}>
                  {t('Start here →', 'Începe aici →')}
                </div>
              )}
              {totalCompleted > 0 && isNext && (
                <div className="text-[10px] mt-0.5 font-semibold" style={{ color: '#10b981' }}>
                  {t('Up next →', 'Urmează →')}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CourseMap;
