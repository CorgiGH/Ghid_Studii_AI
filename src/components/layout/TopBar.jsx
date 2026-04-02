import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';

const TopBar = ({ sidebarOpen, setSidebarOpen }) => {
  const { dark, toggleDark, lang, toggleLang, t } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 border-b dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      {!isHome && (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      <h1
        onClick={() => navigate('/')}
        className="font-bold text-lg cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition flex-1"
      >
        {t('Study Guide', 'Ghid de Studiu')}
      </h1>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleDark}
          className="text-xs px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          {dark ? '☀️' : '🌙'}
        </button>
        <button
          onClick={toggleLang}
          className="text-xs px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition font-bold"
        >
          {lang === 'ro' ? 'EN' : 'RO'}
        </button>
      </div>
    </header>
  );
};

export default TopBar;
