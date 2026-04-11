import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { subjects } from '../../content/registry';
import PalettePicker from '../ui/PalettePicker';

const TopBar = ({ sidebarOpen, setSidebarOpen }) => {
  const { dark, themeMode, cycleTheme, lang, toggleLang, t } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  const pathParts = location.pathname.split('/').filter(Boolean);
  const currentSubjectSlug = pathParts[1] || null;
  const currentSubject = subjects.find(s => s.slug === currentSubjectSlug);

  const [switcherOpen, setSwitcherOpen] = useState(false);
  const switcherRef = useRef(null);
  const headerRef = useRef(null);

  useEffect(() => {
    if (!switcherOpen) return;
    const handler = (e) => {
      if (switcherRef.current && !switcherRef.current.contains(e.target)) setSwitcherOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [switcherOpen]);

  // Publish TopBar height as CSS variable for other sticky elements
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const update = () => {
      document.documentElement.style.setProperty('--topbar-height', `${el.offsetHeight}px`);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-30 backdrop-blur-sm transition-colors duration-200"
      style={{ backgroundColor: 'var(--theme-nav-bg)', color: 'var(--theme-nav-text)' }}
    >
      <div className="flex items-center gap-3 px-4 py-2.5">
        {!isHome && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-1.5 rounded-lg transition"
            style={{ backgroundColor: 'var(--theme-nav-hover)' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        <span
          onClick={() => navigate('/')}
          className="font-bold text-sm cursor-pointer hover:opacity-80 transition"
        >
          {t('Study Guide', 'Ghid de Studiu')}
        </span>

        {!isHome && currentSubject && (
          <div className="relative" ref={switcherRef}>
            <button
              onClick={() => setSwitcherOpen(!switcherOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition"
              style={{ backgroundColor: 'var(--theme-nav-hover)' }}
            >
              <span>{currentSubject.icon}</span>
              <span>{currentSubject.shortTitle[lang]}</span>
              <span className="text-[10px] opacity-60">{'\u25BC'}</span>
            </button>

            {switcherOpen && (
              <div
                className="absolute left-0 top-full mt-1.5 rounded-lg p-2 shadow-lg z-50 flex flex-wrap gap-1.5"
                style={{
                  backgroundColor: 'var(--theme-nav-bg)',
                  border: '1px solid var(--theme-border)',
                  minWidth: '200px',
                }}
              >
                {subjects.map(s => (
                  <button
                    key={s.slug}
                    onClick={() => {
                      navigate(`/${s.yearSemester}/${s.slug}`);
                      setSwitcherOpen(false);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition"
                    style={{
                      backgroundColor: s.slug === currentSubjectSlug ? '#3b82f6' : 'var(--theme-nav-hover)',
                      color: s.slug === currentSubjectSlug ? '#ffffff' : 'var(--theme-nav-text)',
                    }}
                  >
                    <span>{s.icon}</span>
                    <span>{s.shortTitle[lang]}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex-1" />

        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleLang}
            className="text-xs px-2.5 py-1.5 rounded-lg font-bold transition"
            style={{ backgroundColor: 'var(--theme-nav-hover)' }}
          >
            {lang === 'ro' ? 'EN' : 'RO'}
          </button>
          <PalettePicker />
          <button
            onClick={cycleTheme}
            className="text-xs px-2 py-1.5 rounded-lg transition"
            style={{ backgroundColor: 'var(--theme-nav-hover)' }}
            title={themeMode === 'light' ? 'Light mode' : themeMode === 'dark' ? 'Dark mode' : 'System mode'}
          >
            {themeMode === 'light' ? '\u2600\uFE0F' : themeMode === 'dark' ? '\uD83C\uDF19' : '\uD83D\uDCBB'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
