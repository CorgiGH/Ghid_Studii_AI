import React, { Suspense, useMemo, useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { getSubject } from '../content/registry';
import Sidebar from '../components/layout/Sidebar';
import Breadcrumbs from '../components/layout/Breadcrumbs';
import ContentTypeBar from '../components/ui/ContentTypeBar';
import CourseMap from '../components/ui/CourseMap';
import InlineProgress from '../components/ui/InlineProgress';
import ChatPanel from '../components/ui/ChatPanel';
import CourseTransition from '../components/ui/CourseTransition';
import CourseNavigation from '../components/ui/CourseNavigation';
import CourseRenderer from '../components/blocks/CourseRenderer';
import TestRenderer from '../components/blocks/test/TestRenderer';
import TestsTab from '../components/ui/TestsTab';
import BottomTabBar from '../components/layout/BottomTabBar';
import QuickQuizFAB from '../components/ui/QuickQuizFAB';
import { CourseBlock } from '../components/ui';

function PracticeTab({ practice: LazyPractice }) {
  return <LazyPractice />;
}

const LoadingFallback = () => {
  const { t } = useApp();
  return (
    <div className="p-4 lg:p-8 space-y-4" style={{ maxWidth: 'var(--content-max-width)' }}>
      <div className="skeleton-shimmer h-8 w-3/4" />
      <div className="skeleton-shimmer h-4 w-full" />
      <div className="skeleton-shimmer h-4 w-5/6" />
      <div className="skeleton-shimmer h-4 w-2/3" />
      <div className="skeleton-shimmer h-32 w-full mt-4" />
    </div>
  );
};

export default function SubjectPage({ sidebarOpen, setSidebarOpen }) {
  const { yearSem, subject: subjectSlug, '*': wildcard } = useParams();
  const navigate = useNavigate();
  const { lang, t, sidebarLocked, toggleSidebarLock, chatOpen, toggleChat } = useApp();
  const subject = getSubject(subjectSlug);

  const headerRef = useRef(null);
  const progressRef = useRef(null);
  const [sidebarTop, setSidebarTop] = useState(0);
  const [examMode, setExamMode] = useState(false);

  const courseMatch = wildcard?.match(/^course_(\d+)$/);
  const courseNum = courseMatch ? parseInt(courseMatch[1], 10) : null;

  const labMatch = wildcard?.match(/^lab_(\d+)$/);
  const labNum = labMatch ? parseInt(labMatch[1], 10) : null;

  const semMatch = wildcard?.match(/^sem_(\d+)$/);
  const semNum = semMatch ? parseInt(semMatch[1], 10) : null;

  const tab = courseNum
    ? 'courses'
    : labNum
      ? 'labs'
      : semNum
        ? 'seminars'
        : ['seminars', 'labs', 'practice', 'tests'].includes(wildcard) ? wildcard : 'courses';

  const activeCourse = useMemo(() => {
    if (!courseNum || !subject) return null;
    return subject.courses[courseNum - 1] || null;
  }, [courseNum, subject]);

  const activeCourseIndex = useMemo(() => {
    if (!activeCourse || !subject) return -1;
    return subject.courses.findIndex(c => c.id === activeCourse.id);
  }, [activeCourse, subject]);

  const sectionIds = useMemo(() => {
    if (!activeCourse?.sections) return [];
    return activeCourse.sections.map(s => s.id);
  }, [activeCourse]);

  const activeLab = useMemo(() => {
    if (!labNum || !subject) return null;
    return subject.labs?.[labNum - 1] || null;
  }, [labNum, subject]);

  const activeLabIndex = useMemo(() => {
    if (!activeLab || !subject) return -1;
    return subject.labs.findIndex(l => l.id === activeLab.id);
  }, [activeLab, subject]);

  const labSectionIds = useMemo(() => activeLab?.sections?.map(s => s.id) || [], [activeLab]);

  const activeSem = useMemo(() => {
    if (!semNum || !subject) return null;
    return subject.seminars?.[semNum - 1] || null;
  }, [semNum, subject]);

  const activeSemIndex = useMemo(() => {
    if (!activeSem || !subject) return -1;
    return subject.seminars.findIndex(s => s.id === activeSem.id);
  }, [activeSem, subject]);

  // Page context extraction for chat
  const contentRef = useRef(null);
  const [pageContext, setPageContext] = useState('');

  useEffect(() => {
    if (!contentRef.current) {
      setPageContext('');
      return;
    }
    const extract = () => {
      const el = contentRef.current;
      if (!el) return;
      const sections = el.querySelectorAll('[id^="course_"], [id^="lab_"]');
      if (sections.length === 0) {
        setPageContext(el.innerText.slice(0, 2000));
        return;
      }
      let closest = sections[0];
      let closestDist = Infinity;
      for (const sec of sections) {
        const dist = Math.abs(sec.getBoundingClientRect().top);
        if (dist < closestDist) {
          closestDist = dist;
          closest = sec;
        }
      }
      setPageContext(closest.innerText.slice(0, 2000));
    };

    extract();
    let debounceTimer;
    const handler = () => { clearTimeout(debounceTimer); debounceTimer = setTimeout(extract, 300); };
    window.addEventListener('scroll', handler, { passive: true });
    return () => { window.removeEventListener('scroll', handler); clearTimeout(debounceTimer); };
  }, [activeCourse, activeLab]);

  useEffect(() => {
    const el = headerRef.current;
    const topBar = document.querySelector('header');
    if (!el) return;
    const measure = () => {
      const headerBottom = Math.round(el.getBoundingClientRect().bottom);
      const minTop = topBar ? Math.round(topBar.getBoundingClientRect().bottom) : 0;
      const progEl = progressRef.current;
      const progBottom = progEl ? Math.round(progEl.getBoundingClientRect().bottom) : 0;
      setSidebarTop(Math.max(headerBottom, minTop, progBottom));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (topBar) ro.observe(topBar);
    if (progressRef.current) ro.observe(progressRef.current);
    window.addEventListener('scroll', measure, { passive: true });
    return () => { ro.disconnect(); window.removeEventListener('scroll', measure); };
  }, [activeCourse, activeLab]);

  if (!subject) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-lg opacity-60">{t('Subject not found', 'Materia nu a fost găsită')}</p>
      </div>
    );
  }

  const handleTabChange = (tabId) => {
    if (tabId === 'courses') {
      navigate(`/${yearSem}/${subjectSlug}`);
    } else {
      navigate(`/${yearSem}/${subjectSlug}/${tabId}`);
    }
  };

  const handleCourseMapClick = (courseId) => {
    const idx = subject.courses.findIndex(c => c.id === courseId);
    if (idx !== -1) {
      navigate(`/${yearSem}/${subjectSlug}/course_${idx + 1}`);
    }
  };

  const activeItem = activeCourse || activeLab || activeSem;
  const activeItemSectionIds = activeCourse ? sectionIds : labSectionIds;

  return (
    <div className="flex flex-col flex-1">
      <div ref={headerRef}>
        <div className="hidden lg:block">
          <ContentTypeBar subject={subject} activeTab={tab} onTabChange={handleTabChange} />
        </div>

        <div className="flex items-center">
          <div className="flex-1">
            <Breadcrumbs
              yearSem={yearSem}
              subject={subject}
              tab={tab}
              activeItemTitle={activeCourse ? activeCourse.shortTitle[lang] : activeLab ? activeLab.shortTitle[lang] : activeSem ? activeSem.shortTitle[lang] : undefined}
            />
          </div>
          {tab === 'courses' && activeCourse && (
            <button
              onClick={() => setExamMode(e => !e)}
              className="px-3 py-1.5 rounded-lg text-sm transition-colors mr-4 flex-shrink-0 whitespace-nowrap"
              style={{
                backgroundColor: examMode ? 'rgba(239, 68, 68, 0.12)' : 'var(--theme-card-bg)',
                color: examMode ? '#ef4444' : 'var(--theme-muted-text)',
                border: `1px solid ${examMode ? '#ef4444' : 'var(--theme-border)'}`,
                fontWeight: examMode ? 600 : 400,
              }}
            >
              {t('\uD83C\uDFAF Exam Mode', '\uD83C\uDFAF Mod Examen')}
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1">
        {/* Left sidebar — hide on CourseMap (no active course) because it would
            just duplicate the tile grid. Reappears as soon as a course opens. */}
        {tab === 'courses' && subject.courses.length > 0 && activeCourse && (
          <Sidebar
            items={subject.courses}
            activeCourseId={activeCourse?.id || null}
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            yearSem={yearSem}
            subjectSlug={subjectSlug}
            routePrefix="course_"
            locked={sidebarLocked}
            onToggleLock={toggleSidebarLock}
            sidebarTop={sidebarTop}
          />
        )}

        {tab === 'labs' && subject.labs?.length > 0 && (
          <Sidebar
            items={subject.labs}
            activeCourseId={activeLab?.id || null}
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            yearSem={yearSem}
            subjectSlug={subjectSlug}
            routePrefix="lab_"
            locked={sidebarLocked}
            onToggleLock={toggleSidebarLock}
            sidebarTop={sidebarTop}
          />
        )}

        {tab === 'seminars' && subject.seminars?.length > 0 && activeSem && (
          <Sidebar
            items={subject.seminars}
            activeCourseId={activeSem?.id || null}
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            yearSem={yearSem}
            subjectSlug={subjectSlug}
            routePrefix="sem_"
            locked={sidebarLocked}
            onToggleLock={toggleSidebarLock}
            sidebarTop={sidebarTop}
          />
        )}

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Inline progress bar — sticky below TopBar (legacy JSX courses only; JSON courses have their own sticky header in CourseRenderer) */}
          {activeItem && activeItem.sectionCount > 0 && !activeItem.src && (
            <InlineProgress
              ref={progressRef}
              courseId={activeItem.id}
              sectionCount={activeItem.sectionCount}
              sectionIds={activeItemSectionIds}
            />
          )}

          <main ref={contentRef} className={`flex-1 flex flex-col mx-auto w-full min-w-0 ${tab === 'practice' || tab === 'seminars' ? 'py-4 lg:py-6 px-0' : 'p-4 lg:p-8'}`} style={{ maxWidth: tab === 'practice' || tab === 'seminars' ? 'none' : 'var(--content-max-width)', fontSize: 'var(--type-body)', lineHeight: 'var(--type-body-lh)' }}>
            {tab === 'courses' && (
              <>
                {activeCourse ? (
                  activeCourse.src ? (
                    <CourseRenderer
                      src={activeCourse.src}
                      examMode={examMode}
                      onNextCourse={courseNum < subject.courses.length ? () => navigate(`/${yearSem}/${subjectSlug}/course_${courseNum + 1}`) : undefined}
                    />
                  ) : (
                  <CourseTransition courseIndex={activeCourseIndex}>
                    <Suspense fallback={<LoadingFallback />}>
                      {React.createElement(activeCourse.component)}
                    </Suspense>
                    <CourseNavigation
                      items={subject.courses}
                      currentIndex={activeCourseIndex}
                      yearSem={yearSem}
                      subjectSlug={subjectSlug}
                    />
                  </CourseTransition>)
                ) : (
                  <>
                    {subject.courses.length === 0 ? (
                      <div className="text-center py-12 opacity-60">
                        <p className="text-4xl mb-4">{subject.icon}</p>
                        <p className="text-lg font-medium">{t('Coming soon', 'În curând')}</p>
                        <p className="text-sm mt-2">{t('Course content will be added here.', 'Conținutul cursurilor va fi adăugat aici.')}</p>
                      </div>
                    ) : (
                      <div className="self-start w-full">
                        <CourseMap subject={subject} onCourseClick={handleCourseMapClick} />
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {tab === 'seminars' && subject.seminars && (
              <>
                {activeSem ? (
                  <CourseTransition courseIndex={activeSemIndex}>
                    <Suspense fallback={<LoadingFallback />}>
                      {React.createElement(activeSem.component)}
                    </Suspense>
                    <CourseNavigation
                      items={subject.seminars}
                      currentIndex={activeSemIndex}
                      yearSem={yearSem}
                      subjectSlug={subjectSlug}
                      routePrefix="sem_"
                    />
                  </CourseTransition>
                ) : (
                  subject.seminars.length === 0 ? (
                    <div className="text-center py-12 opacity-60">
                      <p className="text-4xl mb-4">{subject.icon}</p>
                      <p className="text-lg font-medium">{t('Coming soon', 'În curând')}</p>
                    </div>
                  ) : (
                    <div className="space-y-3 px-4 lg:px-8" style={{ maxWidth: 'var(--content-max-width)' }}>
                      {subject.seminars.map((sem, idx) => (
                        <button
                          key={sem.id}
                          type="button"
                          onClick={() => navigate(`/${yearSem}/${subjectSlug}/sem_${idx + 1}`)}
                          aria-label={`${t('Open seminar', 'Deschide seminarul')}: ${sem.title[lang]}`}
                          className="w-full text-left p-4 rounded border transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                          style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-card-bg)', color: 'var(--theme-content-text)' }}
                        >
                          <h3 className="font-semibold mb-1">{sem.title[lang]}</h3>
                          <p className="text-xs" style={{ color: 'var(--theme-muted-text)' }}>{t('Click to open', 'Click pentru a deschide')}</p>
                        </button>
                      ))}
                    </div>
                  )
                )}
              </>
            )}

            {tab === 'labs' && subject.labs && (
              <>
                {activeLab ? (
                  <CourseTransition courseIndex={activeLabIndex}>
                    <Suspense fallback={<LoadingFallback />}>
                      {React.createElement(activeLab.component)}
                    </Suspense>
                    <CourseNavigation
                      items={subject.labs}
                      currentIndex={activeLabIndex}
                      yearSem={yearSem}
                      subjectSlug={subjectSlug}
                      routePrefix="lab_"
                    />
                  </CourseTransition>
                ) : (
                  subject.labs.length === 0 ? (
                    <div className="text-center py-12 opacity-60">
                      <p className="text-4xl mb-4">{subject.icon}</p>
                      <p className="text-lg font-medium">{t('Coming soon', 'În curând')}</p>
                    </div>
                  ) : (
                    subject.labs.map(lab => {
                      const LabContent = lab.component;
                      return (
                        <CourseBlock key={lab.id} title={lab.title[lang]} id={lab.id}>
                          <Suspense fallback={<LoadingFallback />}>
                            <LabContent />
                          </Suspense>
                        </CourseBlock>
                      );
                    })
                  )
                )}
              </>
            )}

            {tab === 'practice' && (
              <Suspense fallback={<LoadingFallback />}>
                <PracticeTab practice={subject.practice} />
              </Suspense>
            )}

            {tab === 'tests' && subject.tests && (
              <TestsTab tests={subject.tests} courses={subject.courses} />
            )}
          </main>
        </div>

        {/* Right chat panel — only show when a course or lab is active (not on CourseMap overview) */}
        {chatOpen && (activeCourse || activeLab || activeSem) && (
          <ChatPanel
            pageContext={pageContext}
            subjectSyllabus={subject.description?.[lang] || ''}
          />
        )}

        {/* Chat reopen button when collapsed */}
        {!chatOpen && (activeCourse || activeLab || activeSem) && (
          <button
            className="hidden lg:flex items-center justify-center fixed right-0 top-1/2 -translate-y-1/2 z-30 transition-colors hover:brightness-125"
            style={{
              width: '12px',
              height: '36px',
              background: 'var(--theme-sidebar-bg)',
              border: '1px solid var(--theme-sidebar-border)',
              borderRight: 'none',
              borderRadius: '6px 0 0 6px',
              boxShadow: '-2px 0 6px rgba(0,0,0,0.2)',
              cursor: 'pointer',
            }}
            onClick={toggleChat}
            aria-label="Open chat"
          >
            <svg width="7" height="10" viewBox="0 0 7 10" fill="none">
              <path d="M6 1L1 5L6 9" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Mobile bottom tab bar — replaces ContentTypeBar on small screens */}
      <BottomTabBar
        subject={subject}
        activeTab={tab}
        onTabChange={handleTabChange}
        lang={lang}
      />

      {/* Quick quiz FAB — only show when subject has tests */}
      {subject.tests?.length > 0 && (
        <QuickQuizFAB
          lang={lang}
          onQuiz={() => handleTabChange('tests')}
        />
      )}
    </div>
  );
}
