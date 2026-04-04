import React from 'react';
import { useApp } from '../contexts/AppContext';
import { yearSemesters, subjects } from '../content/registry';
import SubjectCard from '../components/ui/SubjectCard';
import useStaggeredEntrance from '../hooks/useStaggeredEntrance';

export default function Home() {
  const { lang, t } = useApp();
  const getStaggerStyle = useStaggeredEntrance('home');

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {t('University Study Guide', 'Ghid Universitar de Studiu')}
        </h2>
        <p className="text-lg" style={{ color: 'var(--theme-muted-text)' }}>
          {t('Select a subject to start studying', 'Selecteaz\u0103 o materie pentru a \u00eencepe studiul')}
        </p>
      </div>

      {yearSemesters.map(ys => (
        <div key={ys.id} className="mb-12">
          <h3
            className="text-xl font-bold mb-5 pb-2 flex items-center gap-2"
            style={{ borderBottom: '1px solid var(--theme-border)' }}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            {ys.title[lang]}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {ys.subjects.map((slug, i) => {
              const subject = subjects.find(s => s.slug === slug);
              return subject ? (
                <div key={slug} style={getStaggerStyle(i)}>
                  <SubjectCard subject={subject} />
                </div>
              ) : null;
            })}
          </div>
        </div>
      ))}

      <footer className="mt-20 pt-6 text-center text-sm opacity-40" style={{ borderTop: '1px solid var(--theme-border)' }}>
        <p>{t('Based on lectures at UAIC (2026)', 'Bazat pe cursurile de la UAIC (2026)')}</p>
      </footer>
    </main>
  );
}
