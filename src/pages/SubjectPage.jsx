import React, { Suspense, useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { getSubject } from '../content/registry';
import Sidebar from '../components/layout/Sidebar';
import Breadcrumbs from '../components/layout/Breadcrumbs';
import ContentTypeBar from '../components/ui/ContentTypeBar';
import CourseMap from '../components/ui/CourseMap';
import StickyProgressBar from '../components/ui/StickyProgressBar';
import useStaggeredEntrance from '../hooks/useStaggeredEntrance';
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
  const { lang, t, search, setSearch, checked } = useApp();
  const subject = getSubject(subjectSlug);
  const [activeCourseId, setActiveCourseId] = useState(null);
  const [courseSearchStates, setCourseSearchStates] = useState({});
  const coursesRef = useRef(null);

  const searchActive = search && search.length >= 2;
  const getStaggerStyle = useStaggeredEntrance(subjectSlug + '-courses');

  useEffect(() => {
    if (activeCourseId) {
      const timer = setTimeout(() => setActiveCourseId(null), 500);
      return () => clearTimeout(timer);
    }
  }, [activeCourseId]);

  useEffect(() => {
    if (!searchActive || !subject) {
      setCourseSearchStates({});
      if (CSS.highlights) CSS.highlights.delete('search-results');
      return;
    }

    const timer = setTimeout(() => {
      if (!coursesRef.current) return;
      const query = search.toLowerCase();
      const newStates = {};
      const allRanges = [];

      for (const course of subject.courses) {
        const el = document.getElementById(course.id);
        if (!el) { newStates[course.id] = 'no-match'; continue; }

        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        let hasMatch = false;

        while (walker.nextNode()) {
          const node = walker.currentNode;
          const text = node.textContent.toLowerCase();
          let pos = 0;
          while (pos < text.length) {
            const idx = text.indexOf(query, pos);
            if (idx === -1) break;
            hasMatch = true;
            const range = new Range();
            range.setStart(node, idx);
            range.setEnd(node, idx + search.length);
            allRanges.push(range);
            pos = idx + search.length;
          }
        }
        newStates[course.id] = hasMatch ? 'match' : 'no-match';
      }

      setCourseSearchStates(newStates);

      if (CSS.highlights) {
        CSS.highlights.delete('search-results');
        if (allRanges.length > 0) {
          CSS.highlights.set('search-results', new Highlight(...allRanges));
          const el = allRanges[0].startContainer.parentElement;
          if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
        }
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [search, searchActive, subject]);

  const tab = ['seminars', 'labs', 'practice', 'tests'].includes(wildcard) ? wildcard : 'courses';

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

  const handleCourseClick = (courseId) => {
    setActiveCourseId(courseId);
    const el = document.getElementById(courseId);
    if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const activeCourseIndex = activeCourseId
    ? subject.courses.findIndex(c => c.id === activeCourseId)
    : -1;

  const openCourse = activeCourseId
    ? subject.courses.find(c => c.id === activeCourseId)
    : null;

  const showCourseMap = tab === 'courses' && !searchActive && subject.courses.length > 0;

  return (
    <div className="flex flex-col flex-1">
      <ContentTypeBar subject={subject} activeTab={tab} onTabChange={handleTabChange} />

      <Breadcrumbs
        yearSem={yearSem}
        subject={subject}
        tab={tab}
        activeItemTitle={openCourse ? openCourse.shortTitle[lang] : undefined}
      />

      <div className="flex flex-1">
        {tab === 'courses' && subject.courses.length > 0 && (
          <Sidebar
            subject={subject}
            activeCourseId={activeCourseId}
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onCourseClick={handleCourseClick}
          />
        )}

        <main className="flex-1 max-w-5xl mx-auto p-4 lg:p-8 min-h-[calc(100vh-120px)]">
          {tab === 'courses' && (
            <>
              {showCourseMap && (
                <CourseMap subject={subject} onCourseClick={handleCourseClick} />
              )}

              <input
                type="text"
                placeholder={t('Search across all content...', 'Caut\u0103 \u00een tot con\u021binutul...')}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full p-3 mb-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                style={{
                  backgroundColor: 'var(--theme-card-bg)',
                  border: '1px solid var(--theme-border)',
                  color: 'var(--theme-content-text)',
                }}
              />

              {subject.courses.length === 0 ? (
                <div className="text-center py-12 opacity-60">
                  <p className="text-4xl mb-4">{subject.icon}</p>
                  <p className="text-lg font-medium">{t('Coming soon', '\u00cen cur\u00e2nd')}</p>
                  <p className="text-sm mt-2">{t('Course content will be added here.', 'Con\u021binutul cursurilor va fi ad\u0103ugat aici.')}</p>
                </div>
              ) : (
                <div ref={coursesRef}>
                  {subject.courses.map((course, index) => {
                    const CourseContent = course.component;
                    return (
                      <div key={course.id} style={getStaggerStyle(index)}>
                        <CourseBlock
                          title={course.title[lang]}
                          id={course.id}
                          forceOpen={activeCourseId === course.id}
                          searchState={courseSearchStates[course.id]}
                          courseId={course.id}
                          sectionCount={course.sectionCount}
                        >
                          {course.sectionCount > 0 && (
                            <StickyProgressBar
                              courseId={course.id}
                              sectionCount={course.sectionCount}
                              courseName={course.shortTitle[lang]}
                            />
                          )}
                          <Suspense fallback={<LoadingFallback />}>
                            <CourseContent />
                          </Suspense>
                          <CourseNavigation
                            items={subject.courses}
                            currentIndex={index}
                            onNavigate={handleCourseClick}
                          />
                        </CourseBlock>
                      </div>
                    );
                  })}
                </div>
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
      </div>
    </div>
  );
}
