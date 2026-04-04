import React, { Suspense, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { getSubject } from '../content/registry';
import Sidebar from '../components/layout/Sidebar';
import Breadcrumbs from '../components/layout/Breadcrumbs';
import ContentTypeBar from '../components/ui/ContentTypeBar';
import CourseMap from '../components/ui/CourseMap';
import ProgressSidebar from '../components/ui/ProgressSidebar';
import CourseTransition from '../components/ui/CourseTransition';
import CourseNavigation from '../components/ui/CourseNavigation';
import { CourseBlock } from '../components/ui';

function PracticeTab({ practice: LazyPractice }) {
  return <LazyPractice />;
}

const LoadingFallback = () => {
  const { t } = useApp();
  return <div className="animate-pulse p-4 text-sm opacity-50">{t('Loading...', 'Se \u00eencarc\u0103...')}</div>;
};

export default function SubjectPage({ sidebarOpen, setSidebarOpen }) {
  const { yearSem, subject: subjectSlug, '*': wildcard } = useParams();
  const navigate = useNavigate();
  const { lang, t } = useApp();
  const subject = getSubject(subjectSlug);

  // Detect course_N in wildcard
  const courseMatch = wildcard?.match(/^course_(\d+)$/);
  const courseNum = courseMatch ? courseMatch[1] : null;

  // Determine active tab
  const tab = courseNum
    ? 'courses'
    : ['seminars', 'labs', 'practice', 'tests'].includes(wildcard) ? wildcard : 'courses';

  // Find active course when a specific course is selected
  const activeCourse = useMemo(() => {
    if (!courseNum || !subject) return null;
    return subject.courses.find(c => c.id.endsWith('course_' + courseNum)) || null;
  }, [courseNum, subject]);

  const activeCourseIndex = useMemo(() => {
    if (!activeCourse || !subject) return -1;
    return subject.courses.findIndex(c => c.id === activeCourse.id);
  }, [activeCourse, subject]);

  const sectionIds = useMemo(() => {
    if (!activeCourse?.sections) return [];
    return activeCourse.sections.map(s => s.id);
  }, [activeCourse]);

  const sectionTitles = useMemo(() => {
    if (!activeCourse?.sections) return [];
    return activeCourse.sections.map(s => s.title[lang]);
  }, [activeCourse, lang]);

  if (!subject) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-lg opacity-60">{t('Subject not found', 'Materia nu a fost g\u0103sit\u0103')}</p>
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
    const match = courseId.match(/course_(\d+)$/);
    if (match) {
      navigate(`/${yearSem}/${subjectSlug}/course_${match[1]}`);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <ContentTypeBar subject={subject} activeTab={tab} onTabChange={handleTabChange} />

      <Breadcrumbs
        yearSem={yearSem}
        subject={subject}
        tab={tab}
        activeItemTitle={activeCourse ? activeCourse.shortTitle[lang] : undefined}
      />

      <div className="flex flex-1">
        {tab === 'courses' && subject.courses.length > 0 && (
          <Sidebar
            subject={subject}
            activeCourseId={activeCourse?.id || null}
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            yearSem={yearSem}
            subjectSlug={subjectSlug}
          />
        )}

        <main className="flex-1 max-w-5xl mx-auto p-4 lg:p-8 min-h-[calc(100vh-120px)]">
          {tab === 'courses' && (
            <>
              {activeCourse ? (
                /* Single course view with transition */
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
                /* Course map overview (no course selected) */
                <>
                  {subject.courses.length === 0 ? (
                    <div className="text-center py-12 opacity-60">
                      <p className="text-4xl mb-4">{subject.icon}</p>
                      <p className="text-lg font-medium">{t('Coming soon', '\u00cen cur\u00e2nd')}</p>
                      <p className="text-sm mt-2">{t('Course content will be added here.', 'Con\u021binutul cursurilor va fi ad\u0103ugat aici.')}</p>
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
                  <p className="text-lg font-medium">{t('Coming soon', '\u00cen cur\u00e2nd')}</p>
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
            <div>
              {subject.labs.length === 0 ? (
                <div className="text-center py-12 opacity-60">
                  <p className="text-4xl mb-4">{subject.icon}</p>
                  <p className="text-lg font-medium">{t('Coming soon', '\u00cen cur\u00e2nd')}</p>
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
              )}
            </div>
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

        {/* Right progress sidebar - only when viewing a specific course */}
        {tab === 'courses' && activeCourse && (
          <ProgressSidebar
            courseId={activeCourse.id}
            sectionCount={activeCourse.sectionCount}
            sectionIds={sectionIds}
            sectionTitles={sectionTitles}
          />
        )}
      </div>
    </div>
  );
}
