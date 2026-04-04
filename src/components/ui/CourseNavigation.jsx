import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';

const CourseNavigation = ({ items, currentIndex, yearSem, subjectSlug, routePrefix = 'course_' }) => {
  const { lang } = useApp();
  const navigate = useNavigate();

  const navTo = (item) => {
    const match = item.id.match(new RegExp(routePrefix + '(\\d+)$'));
    if (match) {
      navigate(`/${yearSem}/${subjectSlug}/${routePrefix}${match[1]}`);
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
            <div className="text-[10px] opacity-60">Previous</div>
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
            <div className="text-[10px] opacity-60">Next</div>
            <div className="font-semibold text-xs">{next.shortTitle[lang]}</div>
          </div>
          <span>{'\u2192'}</span>
        </button>
      ) : <div />}
    </div>
  );
};

export default CourseNavigation;
