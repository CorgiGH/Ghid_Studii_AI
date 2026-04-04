import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { getYearSemester } from '../../content/registry';

const Breadcrumbs = ({ yearSem, subject, tab, activeItemTitle }) => {
  const { t, lang } = useApp();
  const navigate = useNavigate();
  const ys = getYearSemester(yearSem);

  const tabLabels = {
    courses: t('Courses', 'Cursuri'),
    seminars: t('Solved Exercises', 'Exerciții rezolvate'),
    labs: t('Exercises', 'Exerciții'),
    practice: t('Practice', 'Practică'),
    tests: t('Tests', 'Teste'),
  };

  const crumbs = [
    { label: t('Home', 'Acasă'), onClick: () => navigate('/') },
    ...(ys ? [{ label: ys.title[lang], onClick: () => navigate('/') }] : []),
    { label: subject.title[lang], onClick: () => navigate(`/${yearSem}/${subject.slug}`) },
    { label: tabLabels[tab] || tab, onClick: () => {
      if (tab === 'courses') navigate(`/${yearSem}/${subject.slug}`);
      else navigate(`/${yearSem}/${subject.slug}/${tab}`);
    }},
    ...(activeItemTitle ? [{ label: activeItemTitle }] : []),
  ];

  return (
    <nav
      className="px-4 py-1.5 text-xs transition-colors duration-200 overflow-x-auto whitespace-nowrap"
      style={{ backgroundColor: 'var(--theme-breadcrumb-bg)', color: 'var(--theme-muted-text)' }}
    >
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <React.Fragment key={i}>
            {i > 0 && <span className="mx-1.5 opacity-40">/</span>}
            {isLast ? (
              <span className="font-semibold" style={{ color: 'var(--theme-content-text)' }}>
                {crumb.label}
              </span>
            ) : (
              <span
                onClick={crumb.onClick}
                className="cursor-pointer hover:underline"
                style={{ color: '#3b82f6' }}
              >
                {crumb.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
