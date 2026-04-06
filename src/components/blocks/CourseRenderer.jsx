import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../contexts/AppContext';
import StepRenderer from './StepRenderer';
import CourseTransition from '../ui/CourseTransition';

export default function CourseRenderer({ src }) {
  const { t, markVisited, progress, toggleUnderstood } = useApp();
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [lectureVisible, setLectureVisible] = useState(false);

  // Load course JSON
  useEffect(() => {
    setLoading(true);
    setError(null);
    setCourseData(null);
    setCurrentStep(0);

    import(`../../content/${src}`)
      .then(module => {
        setCourseData(module.default);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [src]);

  const totalSteps = courseData?.steps?.length || 0;
  const step = courseData?.steps?.[currentStep];

  const goToStep = useCallback((index) => {
    if (index < 0 || index >= totalSteps) return;
    setCurrentStep(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [totalSteps]);

  // Auto-mark step as visited when navigating
  useEffect(() => {
    if (!step?.id) return;
    markVisited(step.id);
  }, [step?.id, markVisited]);

  if (loading) {
    return <div className="animate-pulse p-4 text-sm opacity-50">{t('Loading...', 'Se încarcă...')}</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-sm" style={{ color: '#ef4444' }}>
        {t('Failed to load course', 'Nu s-a putut încărca cursul')}: {error}
      </div>
    );
  }

  if (!courseData || totalSteps === 0) {
    return (
      <div className="p-4 text-sm opacity-50">
        {t('No content available', 'Niciun conținut disponibil')}
      </div>
    );
  }

  return (
    <div>
      {/* Step info bar with lecture toggle */}
      <div
        className="flex items-center justify-between mb-4 pb-3"
        style={{ borderBottom: '1px solid var(--theme-border)' }}
      >
        <div className="flex items-center gap-2">
          <span
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ backgroundColor: '#3b82f6' }}
          >
            {currentStep + 1}
          </span>
          <span className="text-xs" style={{ color: 'var(--theme-muted-text)' }}>
            {t(
              `Step ${currentStep + 1} of ${totalSteps}`,
              `Pasul ${currentStep + 1} din ${totalSteps}`
            )}
            {step.group && (
              <span style={{ color: 'var(--theme-border)' }}> · {step.group}</span>
            )}
          </span>
        </div>
        <button
          onClick={() => setLectureVisible(v => !v)}
          className="flex items-center gap-2 text-xs cursor-pointer select-none"
          style={{ color: lectureVisible ? '#818cf8' : 'var(--theme-muted-text)' }}
        >
          {t('\uD83C\uDF93 Lecture context', '\uD83C\uDF93 Context curs')}
          <span
            className="inline-block w-9 h-5 rounded-full relative transition-colors"
            style={{ backgroundColor: lectureVisible ? '#818cf8' : 'var(--theme-border)' }}
          >
            <span
              className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
              style={{ left: lectureVisible ? '18px' : '2px' }}
            />
          </span>
        </button>
      </div>

      {/* Progress strip */}
      <div className="flex gap-0.5 mb-5">
        {courseData.steps.map((s, i) => {
          const sp = progress[s.id];
          const isUnderstood = sp?.understood;
          const isVisited = sp?.visited;
          let bgColor;
          if (i === currentStep) bgColor = '#3b82f6';
          else if (isUnderstood) bgColor = '#10b981';
          else if (isVisited) bgColor = 'rgba(59, 130, 246, 0.35)';
          else bgColor = 'var(--theme-border)';
          return (
            <div
              key={s.id}
              className="flex-1 h-1 rounded-sm cursor-pointer transition-colors"
              style={{
                backgroundColor: bgColor,
                boxShadow: i === currentStep ? '0 0 6px rgba(59,130,246,0.4)' : 'none',
              }}
              onClick={() => goToStep(i)}
              title={t(s.title.en, s.title.ro)}
            />
          );
        })}
      </div>

      {/* Step title */}
      <h2
        className="text-lg font-bold mb-4"
        style={{ color: 'var(--theme-content-text)' }}
      >
        {t(step.title.en, step.title.ro)}
      </h2>

      {/* Step content */}
      <CourseTransition courseIndex={currentStep}>
        <StepRenderer
          step={step}
          lectureVisible={lectureVisible}
          isUnderstood={!!progress[step.id]?.understood}
          onToggleUnderstood={() => toggleUnderstood(step.id)}
        />
      </CourseTransition>

      {/* Navigation */}
      <div
        className="flex justify-between mt-6 pt-4"
        style={{ borderTop: '1px solid var(--theme-border)' }}
      >
        <button
          onClick={() => goToStep(currentStep - 1)}
          className="text-sm px-4 py-2 rounded-lg transition-colors cursor-pointer"
          style={{
            color: currentStep > 0 ? '#3b82f6' : 'var(--theme-border)',
            pointerEvents: currentStep > 0 ? 'auto' : 'none',
          }}
        >
          {t('\u2190 Previous', '\u2190 Anterior')}
        </button>
        <button
          onClick={() => goToStep(currentStep + 1)}
          className="text-sm px-4 py-2 rounded-lg transition-colors cursor-pointer"
          style={{
            color: currentStep < totalSteps - 1 ? '#3b82f6' : 'var(--theme-border)',
            pointerEvents: currentStep < totalSteps - 1 ? 'auto' : 'none',
          }}
        >
          {currentStep < totalSteps - 1
            ? t('Continue \u2192', 'Continuă \u2192')
            : t('Complete \u2713', 'Complet \u2713')}
        </button>
      </div>
    </div>
  );
}
