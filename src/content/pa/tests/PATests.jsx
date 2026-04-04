import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import TestRenderer from './TestRenderer';
import CourseBlock from '../../../components/ui/CourseBlock';
import { tests } from './testData';

export default function PATests() {
  const { t, lang } = useApp();

  const midterms = tests
    .filter((x) => x.type === 'partial')
    .sort((a, b) => a.year - b.year || (a.variant || '').localeCompare(b.variant || ''));

  const finals = tests
    .filter((x) => x.type === 'exam')
    .sort((a, b) => a.year - b.year || (a.variant || '').localeCompare(b.variant || ''));

  const renderGroup = (groupTests) => {
    const years = [...new Set(groupTests.map((x) => x.year))];
    return years.map((year) => {
      const yearTests = groupTests.filter((x) => x.year === year);
      return (
        <div key={year} className="mb-4">
          <h3
            className="text-lg font-bold mb-3 mt-6"
            style={{ color: 'var(--theme-text)' }}
          >
            {year}
          </h3>
          {yearTests.map((test) => (
            <CourseBlock
              key={test.id}
              title={test.title[lang]}
              id={test.id}
            >
              <TestRenderer test={test} />
            </CourseBlock>
          ))}
        </div>
      );
    });
  };

  return (
    <div>
      <h2
        className="text-xl font-bold mb-4"
        style={{ color: 'var(--theme-text)' }}
      >
        {t('Midterm (Partial)', 'Partial')}
      </h2>
      {renderGroup(midterms)}

      <h2
        className="text-xl font-bold mb-4 mt-8"
        style={{ color: 'var(--theme-text)' }}
      >
        {t('Final Exam', 'Examen')}
      </h2>
      {renderGroup(finals)}
    </div>
  );
}
