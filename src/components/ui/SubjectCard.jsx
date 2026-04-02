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
      className="border rounded-xl p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 hover:border-blue-400 dark:border-gray-700 dark:hover:border-blue-500 bg-white dark:bg-gray-800 group"
    >
      <div className="text-3xl mb-3">{subject.icon}</div>
      <h3 className="font-bold text-lg mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {subject.title[lang]}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
        {subject.description[lang]}
      </p>
      <div className="text-xs font-medium">
        {hasCourses ? (
          <span className="inline-flex items-center gap-1.5 text-green-600 dark:text-green-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            {subject.courses.length} {t('courses', 'cursuri')}
          </span>
        ) : (
          <span className="text-gray-400 italic">{t('Coming soon', 'În curând')}</span>
        )}
      </div>
    </div>
  );
};

export default SubjectCard;
