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
import { CourseBlock } from '../components/ui';

function PracticeTab({ practice: LazyPractice }) {
  return <LazyPractice />;
}

const LoadingFallback = () => {
  const { t } = useApp();
  return <div className="animate-pulse p-4 text-sm opacity-50">{t('Loading...', 'Se încarcă...')}</div>;
};

export default function SubjectPage({ sidebarOpen, setSidebarOpen }) {
  const { yearSem, subject: subjectSlug, '*': wildcard } = useParams();
  const navigate = useNavigate();
  const { lang, t, sidebarLocked, toggleSidebarLock, chatOpen, toggleChat } = useApp();
  const subject = getSubject(subjectSlug);

  const headerRef = useRef(null);
  const [sidebarTop, setSidebarTop] = useState(0);

  const courseMatch = wildcard?.match(/^course_(\d+)$/);
  const courseNum = courseMatch ? parseInt(courseMatch[1], 10) : null;

  const labMatch = wildcard?.match(/^lab_(\d+)$/);
  const labNum = labMatch ? parseInt(labMatch[1], 10) : null;

  const tab = courseNum
    ? 'courses'
    : labNum
      ? 'labs'
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
      setSidebarTop(Math.max(headerBottom, minTop));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (topBar) ro.observe(topBar);
    window.addEventListener('scroll', measure, { passive: true });
    return () => { ro.disconnect(); window.removeEventListener('scroll', measure); };
  }, []);

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

  const activeItem = activeCourse || activeLab;
  const activeItemSectionIds = activeCourse ? sectionIds : labSectionIds;

  return (
    <div className="flex flex-col flex-1">
      <div ref={headerRef}>
        <ContentTypeBar subject={subject} activeTab={tab} onTabChange={handleTabChange} />

        <Breadcrumbs
          yearSem={yearSem}
          subject={subject}
          tab={tab}
          activeItemTitle={activeCourse ? activeCourse.shortTitle[lang] : activeLab ? activeLab.shortTitle[lang] : undefined}
        />
      </div>

      <div className="flex flex-1">
        {/* Left sidebar */}
        {tab === 'courses' && subject.courses.length > 0 && (
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

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-h-[calc(100vh-120px)]">
          {/* Inline progress bar */}
          {activeItem && activeItem.sectionCount > 0 && (
            <InlineProgress
              courseId={activeItem.id}
              sectionCount={activeItem.sectionCount}
              sectionIds={activeItemSectionIds}
            />
          )}

          <main ref={contentRef} className="flex-1 max-w-5xl mx-auto p-4 lg:p-8" style={{ fontSize: '1.05rem' }}>
            {tab === 'courses' && (
              <>
                {activeCourse ? (
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
                  </CourseTransition>
                ) : (
                  <>
                    {subject.courses.length === 0 ? (
                      <div className="text-center py-12 opacity-60">
                        <p className="text-4xl mb-4">{subject.icon}</p>
                        <p className="text-lg font-medium">{t('Coming soon', 'În curând')}</p>
                        <p className="text-sm mt-2">{t('Course content will be added here.', 'Conținutul cursurilor va fi adăugat aici.')}</p>
                      </div>
                    ) : (
                      <CourseMap subject={subject} onCourseClick={handleCourseMapClick} />
                    )}
                  </>
                )}
              </>
            )}

            {tab === 'seminars' && subject.seminars && (
              <div>
                {subject.seminars.length === 0 ? (
                  <div className="text-center py-12 opacity-60">
                    <p className="text-4xl mb-4">{subject.icon}</p>
                    <p className="text-lg font-medium">{t('Coming soon', 'În curând')}</p>
                  </div>
                ) : (
                  subject.seminars.map(sem => {
                    const SemContent = sem.component;
                    return (
                      <CourseBlock key={sem.id} title={sem.title[lang]} id={sem.id}>
                        <Suspense fallback={<LoadingFallback />}>
                          <SemContent />
                        </Suspense>
                      </CourseBlock>
                    );
                  })
                )}
              </div>
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
              <div>
                {subject.tests.map(test => {
                  const TestContent = test.component;
                  return (
                    <CourseBlock key={test.id} title={test.title[lang]} id={test.id}>
                      <Suspense fallback={<LoadingFallback />}>
                        <TestContent />
                      </Suspense>
                    </CourseBlock>
                  );
                })}
              </div>
            )}
          </main>
        </div>

        {/* Right chat panel */}
        {chatOpen && (
          <ChatPanel
            pageContext={pageContext}
            subjectSyllabus={subject.description?.[lang] || ''}
          />
        )}

        {/* Chat reopen button when collapsed */}
        {!chatOpen && (
          <button
            className="hidden lg:flex items-center justify-center fixed right-0 top-1/2 -translate-y-1/2 z-30 transition-colors hover:brightness-125"
            style={{
              width: '12px',
              height: '36px',
              background: '#1e293b',
              border: '1px solid #334155',
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
    </div>
  );
}
