import React, { useState, useEffect, useCallback, useRef, createContext, useContext, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { loadJson } from '../../content/jsonLoader';
import StepRenderer from './StepRenderer';
import CourseTransition from '../ui/CourseTransition';
import ProgressRing from '../ui/ProgressRing';
import useScrollToHash from '../../hooks/useScrollToHash';
import CompletionModal from '../ui/CompletionModal';

const CourseNavContext = createContext(null);
export const useCourseNav = () => useContext(CourseNavContext);

export default function CourseRenderer({ src }) {
  const { t, markVisited, progress, toggleUnderstood, lectureVisible, toggleLecture, setCourseContext } = useApp();
  useScrollToHash();
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

    try {
      setCourseData(loadJson(src));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [src]);

  const totalSteps = courseData?.steps?.length || 0;
  const step = courseData?.steps?.[currentStep];

  const goToStep = useCallback((index) => {
    if (index < 0 || index >= totalSteps) return;
    setCurrentStep(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [totalSteps]);

  // Save last step for resume
  useEffect(() => {
    if (!step?.id || !src) return;
    const key = `lastStep:${src}`;
    localStorage.setItem(key, JSON.stringify({ stepId: step.id, stepIndex: currentStep, timestamp: Date.now() }));
  }, [step?.id, currentStep, src]);

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

  // Navigation helper: resolve a step ID to its index and navigate
  const navigateToStep = useCallback((stepId) => {
    if (!courseData?.steps) return;
    const idx = courseData.steps.findIndex(s => s.id === stepId);
    if (idx !== -1) goToStep(idx);
  }, [courseData?.steps, goToStep]);

  const courseNavValue = useMemo(() => ({ navigateToStep }), [navigateToStep]);

  // Completion celebration — modal (research §4)
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const prevUnderstoodRef = useRef(0);

  useEffect(() => {
    if (!courseData?.steps) return;
    const total = courseData.steps.length;
    const prev = prevUnderstoodRef.current;
    if (understoodCount >= total && prev < total && prev > 0) {
      setShowCompletionModal(true);
    }
    prevUnderstoodRef.current = understoodCount;
  }, [understoodCount, courseData?.steps]);

  if (loading) {
    return (
      <div className="p-4 space-y-3">
        <div className="skeleton-shimmer h-6 w-2/3" />
        <div className="skeleton-shimmer h-4 w-full" />
        <div className="skeleton-shimmer h-4 w-5/6" />
        <div className="skeleton-shimmer h-24 w-full" />
      </div>
    );
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
    <CourseNavContext.Provider value={courseNavValue}>
    <div>
      {/* ===== Sticky progress header ===== */}
      <div
        className="sticky z-10 -mx-4 lg:-mx-8 px-4 lg:px-8"
        style={{
          top: 'var(--topbar-offset, 0px)',
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
                <span style={{ color: 'var(--theme-muted-text)' }}> · {step.group}</span>
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
        style={{
          fontSize: 'var(--type-h2)',
          lineHeight: 'var(--type-h2-lh)',
          fontWeight: 'var(--type-h2-weight)',
          color: 'var(--theme-content-text)',
          marginTop: '1.25rem',
          marginBottom: '1rem',
        }}
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

      {/* Completion celebration modal — research §4 */}
      {showCompletionModal && (
        <CompletionModal
          courseName={courseData?.meta?.title ? t(courseData.meta.title.en, courseData.meta.title.ro) : ''}
          sectionsCompleted={totalSteps}
          onClose={() => setShowCompletionModal(false)}
          lang={t('en', 'ro') === 'ro' ? 'ro' : 'en'}
        />
      )}
    </div>
    </CourseNavContext.Provider>
  );
}
