import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';

const SubjectCard = ({ subject }) => {
  const navigate = useNavigate();
  const { lang, t } = useApp();
  const hasCourses = subject.courses.length > 0;

  return (
    <div
      onClick={() => navigate(`/${subject.yearSemester}/${subject.slug}`)}
      className="rounded-xl p-6 cursor-pointer transition-all duration-150 hover:shadow-lg hover:-translate-y-1 active:translate-y-px active:scale-[0.98] active:shadow-sm group"
      style={{
        backgroundColor: 'var(--theme-card-bg)',
        border: '1px solid var(--theme-border)',
      }}
    >
      <div className="text-3xl mb-3">{subject.icon}</div>
      <h3 className="font-bold text-lg mb-1 group-hover:text-blue-600 transition-colors"
        style={{ color: 'var(--theme-content-text)' }}
      >
        {subject.title[lang]}
      </h3>
      <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--theme-muted-text)' }}>
        {subject.description[lang]}
      </p>
      <div className="text-xs font-medium">
        {hasCourses ? (
          <span className="inline-flex items-center gap-1.5 text-green-600">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            {subject.courses.length} {t('courses', 'cursuri')}
          </span>
        ) : (
          <span style={{ color: 'var(--theme-muted-text)' }} className="italic">{t('Coming soon', '\u00cen cur\u00e2nd')}</span>
        )}
      </div>
    </div>
  );
};

export default SubjectCard;
