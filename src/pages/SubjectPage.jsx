import React, { Suspense, useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { getSubject } from '../content/registry';
import Sidebar from '../components/layout/Sidebar';
import TabBar from '../components/ui/TabBar';
import { CourseBlock } from '../components/ui';

function PracticeTab({ practice: LazyPractice }) {
  return <LazyPractice />;
}

export default function SubjectPage({ sidebarOpen, setSidebarOpen }) {
  const { yearSem, subject: subjectSlug, '*': wildcard } = useParams();
  const navigate = useNavigate();
  const { lang, t, search, setSearch, checked, toggleCheck } = useApp();
  const subject = getSubject(subjectSlug);
  const [activeCourseId, setActiveCourseId] = useState(null);
  const [courseSearchStates, setCourseSearchStates] = useState({});
  const coursesRef = useRef(null);

  const searchActive = search && search.length >= 2;

  // Reset activeCourseId after scroll so the same course can be clicked again
  useEffect(() => {
    if (activeCourseId) {
      const timer = setTimeout(() => setActiveCourseId(null), 500);
      return () => clearTimeout(timer);
    }
  }, [activeCourseId]);

  // Two-phase content search
  useEffect(() => {
    if (!searchActive || !subject) {
      setCourseSearchStates({});
      if (CSS.highlights) CSS.highlights.delete('search-results');
      return;
    }

    // Debounce: wait for user to stop typing, then search the DOM
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

      // Apply CSS highlights
      if (CSS.highlights) {
        CSS.highlights.delete('search-results');
        if (allRanges.length > 0) {
          CSS.highlights.set('search-results', new Highlight(...allRanges));
          // Scroll to first match
          const el = allRanges[0].startContainer.parentElement;
          if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
        }
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [search, searchActive, subject]);

  const tab = wildcard === 'practice' ? 'practice' : 'courses';

  if (!subject) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-lg opacity-60">{t('Subject not found', 'Materia nu a fost găsită')}</p>
      </div>
    );
  }

  const tabs = [
    { id: 'courses', label: t('Courses', 'Cursuri') },
    { id: 'practice', label: t('Practice', 'Practică') },
  ];

  const handleTabChange = (tabId) => {
    if (tabId === 'practice') {
      navigate(`/${yearSem}/${subjectSlug}/practice`);
    } else {
      navigate(`/${yearSem}/${subjectSlug}`);
    }
  };

  return (
    <div className="flex flex-1">
      <Sidebar subject={subject} open={sidebarOpen} onClose={() => setSidebarOpen(false)} onCourseClick={setActiveCourseId} />

      <main className="flex-1 max-w-5xl mx-auto p-4 lg:p-8 min-h-[calc(100vh-57px)]">
        <div className="mb-4">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-2 inline-block"
          >
            ← {t('All subjects', 'Toate materiile')}
          </button>
          <h2 className="text-2xl font-bold">{subject.title[lang]}</h2>
        </div>

        <TabBar tabs={tabs} activeTab={tab} onTabChange={handleTabChange} />

        {tab === 'courses' && (
          <>
            <input
              type="text"
              placeholder={t('Search across all content...', 'Caută în tot conținutul...')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full p-3 mb-6 rounded-lg border dark:border-gray-600 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {subject.courses.length === 0 ? (
              <div className="text-center py-12 opacity-60">
                <p className="text-4xl mb-4">{subject.icon}</p>
                <p className="text-lg font-medium">{t('Coming soon', 'În curând')}</p>
                <p className="text-sm mt-2">{t('Course content will be added here.', 'Conținutul cursurilor va fi adăugat aici.')}</p>
              </div>
            ) : (
              <div ref={coursesRef}>
                {subject.courses.map(course => {
                  const CourseContent = course.component;
                  return (
                    <CourseBlock
                      key={course.id}
                      title={course.title[lang]}
                      id={course.id}
                      forceOpen={activeCourseId === course.id}
                      searchState={courseSearchStates[course.id]}
                    >
                      <Suspense fallback={<div className="animate-pulse p-4 text-sm opacity-50">{t('Loading...', 'Se încarcă...')}</div>}>
                        <CourseContent />
                      </Suspense>
                    </CourseBlock>
                  );
                })}
              </div>
            )}
          </>
        )}

        {tab === 'practice' && (
          <Suspense fallback={<div className="animate-pulse p-4 text-sm opacity-50">{t('Loading...', 'Se încarcă...')}</div>}>
            <PracticeTab practice={subject.practice} />
          </Suspense>
        )}
      </main>
    </div>
  );
}
