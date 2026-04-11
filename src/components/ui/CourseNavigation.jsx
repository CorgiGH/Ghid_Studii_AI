import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';

const CourseNavigation = ({ items, currentIndex, yearSem, subjectSlug, routePrefix = 'course_' }) => {
  const { lang, t } = useApp();
  const navigate = useNavigate();

  const navTo = (item) => {
    const idx = items.findIndex(i => i.id === item.id);
    if (idx !== -1) {
      navigate(`/${yearSem}/${subjectSlug}/${routePrefix}${idx + 1}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  const prev = currentIndex > 0 ? items[currentIndex - 1] : null;
  const next = currentIndex < items.length - 1 ? items[currentIndex + 1] : null;

  if (!prev && !next) return null;

  return (
    <div
      className="flex justify-between items-center mt-8 pt-4 text-sm"
      style={{ borderTop: '1px solid var(--theme-border)' }}
    >
      {prev ? (
        <button
          onClick={() => navTo(prev)}
          className="flex items-center gap-2 hover:opacity-80 transition"
          style={{ color: 'var(--theme-muted-text)' }}
        >
          <span>{'\u2190'}</span>
          <div className="text-left">
            <div className="text-[10px] opacity-60">{t('Previous', 'Anteriorul')}</div>
            <div className="font-medium text-xs">{prev.shortTitle[lang]}</div>
          </div>
        </button>
      ) : <div />}

      {next ? (
        <button
          onClick={() => navTo(next)}
          className="flex items-center gap-2 hover:opacity-80 transition text-right"
          style={{ color: '#3b82f6' }}
        >
          <div>
            <div className="text-[10px] opacity-60">{t('Next', 'Următorul')}</div>
            <div className="font-semibold text-xs">{next.shortTitle[lang]}</div>
          </div>
          <span>{'\u2192'}</span>
        </button>
      ) : <div />}
    </div>
  );
};

export default CourseNavigation;
