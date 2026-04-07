import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../../contexts/AppContext';
import StepRenderer from './StepRenderer';
import CourseTransition from '../ui/CourseTransition';
import ProgressRing from '../ui/ProgressRing';

export default function CourseRenderer({ src }) {
  const { t, markVisited, progress, toggleUnderstood, lectureVisible, toggleLecture, setCourseContext } = useApp();
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [topBarHeight, setTopBarHeight] = useState(0);

  // Measure TopBar height for sticky positioning
  useEffect(() => {
    const topBar = document.querySelector('header');
    if (!topBar) return;
    const measure = () => setTopBarHeight(Math.round(topBar.getBoundingClientRect().height));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(topBar);
    return () => ro.disconnect();
  }, []);

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

  // Set course context for chat panel
  useEffect(() => {
    if (!step || !courseData) return;
    setCourseContext({
      type: 'course',
      courseTitle: t(courseData.meta.title.en, courseData.meta.title.ro),
      stepTitle: t(step.title.en, step.title.ro),
      stepId: step.id,
      blocks: step.blocks,
      testMode: false,
    });
    return () => setCourseContext(null);
  }, [step, courseData, setCourseContext, t]);

  // Count understood steps
  const understoodCount = courseData?.steps
    ? courseData.steps.filter(s => progress[s.id]?.understood).length
    : 0;
  const allUnderstood = totalSteps > 0 && understoodCount >= totalSteps;

  // Completion celebration
  const [showCompletionToast, setShowCompletionToast] = useState(false);
  const [toastDismissing, setToastDismissing] = useState(false);
  const prevUnderstoodRef = useRef(0);

  useEffect(() => {
    if (!courseData?.steps) return;
    const total = courseData.steps.length;
    const prev = prevUnderstoodRef.current;
    if (understoodCount >= total && prev < total && prev > 0) {
      setShowCompletionToast(true);
      setTimeout(() => {
        setToastDismissing(true);
        setTimeout(() => {
          setShowCompletionToast(false);
          setToastDismissing(false);
        }, 300);
      }, 1500);
    }
    prevUnderstoodRef.current = understoodCount;
  }, [understoodCount, courseData?.steps]);

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
      {/* ===== Sticky progress header ===== */}
      <div
        className="sticky z-10 -mx-4 lg:-mx-8 px-4 lg:px-8"
        style={{
          top: `${topBarHeight}px`,
          backgroundColor: 'var(--theme-content-bg)',
          borderBottom: '1px solid var(--theme-border)',
        }}
      >
        {/* Row: step info + lecture toggle + ring */}
        <div className="flex items-center gap-3 py-2">
          {/* Step badge + label */}
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ backgroundColor: '#3b82f6' }}
            >
              {currentStep + 1}
            </span>
            <span className="text-xs truncate" style={{ color: 'var(--theme-muted-text)' }}>
              {t(
                `Step ${currentStep + 1} of ${totalSteps}`,
                `Pasul ${currentStep + 1} din ${totalSteps}`
              )}
              {step.group && (
                <span style={{ color: 'var(--theme-border)' }}> · {step.group}</span>
              )}
            </span>
          </div>

          {/* Progress strip segments */}
          <div className="flex gap-0.5 flex-1 h-[5px]">
            {courseData.steps.map((s, i) => {
              const sp = progress[s.id];
              const isUnderstood = sp?.understood;
              const isVisited = sp?.visited;
              let bgColor;
              if (allUnderstood) bgColor = '#22c55e';
              else if (i === currentStep) bgColor = '#3b82f6';
              else if (isUnderstood) bgColor = '#10b981';
              else if (isVisited) bgColor = 'rgba(59, 130, 246, 0.35)';
              else bgColor = 'var(--theme-border)';
              return (
                <div
                  key={s.id}
                  className="flex-1 rounded-sm cursor-pointer transition-colors"
                  style={{
                    backgroundColor: bgColor,
                    boxShadow: i === currentStep && !allUnderstood ? '0 0 6px rgba(59,130,246,0.4)' : 'none',
                  }}
                  onClick={() => goToStep(i)}
                  title={t(s.title.en, s.title.ro)}
                />
              );
            })}
          </div>

          {/* Lecture toggle */}
          <button
            onClick={toggleLecture}
            className="flex items-center gap-1.5 text-xs cursor-pointer select-none flex-shrink-0"
            style={{ color: lectureVisible ? '#818cf8' : 'var(--theme-muted-text)' }}
          >
            <span className="hidden sm:inline">{t('\uD83C\uDF93 Lecture', '\uD83C\uDF93 Curs')}</span>
            <span
              className="inline-block w-8 h-4 rounded-full relative transition-colors flex-shrink-0"
              style={{ backgroundColor: lectureVisible ? '#818cf8' : 'var(--theme-border)' }}
            >
              <span
                className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all"
                style={{ left: lectureVisible ? '15px' : '2px' }}
              />
            </span>
          </button>

          {/* ProgressRing */}
          <ProgressRing size={22} completed={understoodCount} total={totalSteps} />
        </div>
      </div>

      {/* Step title */}
      <h2
        className="text-lg font-bold mb-4 mt-5"
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

      {/* Completion celebration toast */}
      {showCompletionToast && (
        <div
          onClick={() => { setToastDismissing(true); setTimeout(() => { setShowCompletionToast(false); setToastDismissing(false); }, 300); }}
          style={{
            position: 'fixed', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(2px)',
            zIndex: 50,
            animation: toastDismissing ? 'fadeOut 0.3s ease forwards' : 'fadeIn 0.3s ease',
            cursor: 'pointer',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--theme-content-bg, #1e293b)',
              border: '2px solid #22c55e', borderRadius: '16px',
              padding: '24px 36px', textAlign: 'center',
              boxShadow: '0 12px 48px rgba(34,197,94,0.25)',
              animation: toastDismissing ? 'fadeOut 0.3s ease forwards' : 'popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 12px', fontSize: '24px', color: 'white',
              boxShadow: '0 0 20px rgba(34,197,94,0.4)',
            }}>&#10003;</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--theme-text, #e2e8f0)', marginBottom: '4px' }}>
              {t('Course Complete!', 'Curs complet!')}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--theme-muted-text, #94a3b8)' }}>
              {t(`All ${totalSteps} steps understood`, `Toți cei ${totalSteps} pași înțeleși`)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
