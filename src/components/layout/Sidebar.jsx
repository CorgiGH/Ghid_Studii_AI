import React from 'react';
import { useApp } from '../../contexts/AppContext';

const Sidebar = ({ subject, open, onClose }) => {
  const { lang, t, checked } = useApp();

  if (!subject) return null;

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 lg:z-auto
        w-64 h-screen overflow-y-auto
        border-r dark:border-gray-700
        bg-white dark:bg-gray-800
        p-4 text-sm
        transition-transform duration-200
        lg:translate-x-0
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="lg:hidden flex justify-end mb-2">
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <h2 className="font-bold text-base mb-1">{subject.title[lang]}</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{subject.description[lang]}</p>

        <nav className="space-y-1">
          {subject.courses.map(course => {
            const sectionIds = Array.from({ length: 20 }, (_, i) => `${course.id}-${i}`);
            const completedCount = sectionIds.filter(id => checked[id]).length;
            const hasProgress = completedCount > 0;

            return (
              <a
                key={course.id}
                href={`#${course.id}`}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                onClick={onClose}
              >
                {hasProgress && (
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                )}
                <span className="truncate">{course.shortTitle[lang]}</span>
              </a>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
