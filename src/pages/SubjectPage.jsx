import React, { Suspense, useState } from 'react';
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
      <Sidebar subject={subject} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

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
              subject.courses.map(course => {
                const CourseContent = course.component;
                return (
                  <CourseBlock key={course.id} title={course.title[lang]} id={course.id}>
                    <Suspense fallback={<div className="animate-pulse p-4 text-sm opacity-50">{t('Loading...', 'Se încarcă...')}</div>}>
                      <CourseContent />
                    </Suspense>
                  </CourseBlock>
                );
              })
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
