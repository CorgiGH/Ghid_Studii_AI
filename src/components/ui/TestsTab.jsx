import React, { useState, Suspense, useCallback } from 'react';
import { useApp } from '../../contexts/AppContext';
import TestRenderer from '../blocks/test/TestRenderer';
import GeneratedTestRenderer from './GeneratedTestRenderer';

function LoadingFallback() {
  return <div className="animate-pulse p-4 text-sm opacity-50">Loading...</div>;
}

export default function TestsTab({ tests }) {
  const { t, lang, testProgress } = useApp();
  const [activeTest, setActiveTest] = useState(null);
  const [generatedTest, setGeneratedTest] = useState(null);
  const [generating, setGenerating] = useState(false);

  const generatePracticeTest = useCallback(async () => {
    setGenerating(true);
    try {
      const jsonTests = tests.filter(t => t.src);
      // Load all test JSONs
      const loaded = await Promise.all(
        jsonTests.map(t => import(`../../content/${t.src}`).then(m => m.default))
      );
      // Collect all questions with source info
      const pool = [];
      for (const test of loaded) {
        for (const q of test.questions) {
          pool.push({ ...q, sourceTest: test.meta.title });
        }
      }
      // Shuffle and pick 8-12 questions
      const shuffled = pool.sort(() => Math.random() - 0.5);
      const count = 8 + Math.floor(Math.random() * 5);
      const picked = shuffled.slice(0, Math.min(count, pool.length));
      // Reassign IDs
      const questions = picked.map((q, i) => ({ ...q, id: `gen-q${i + 1}` }));
      const totalPoints = questions.reduce((s, q) => s + q.points, 0);

      setGeneratedTest({
        meta: {
          id: `practice-${Date.now()}`,
          title: { en: 'Generated Practice Test', ro: 'Test de practică generat' },
          totalPoints,
          duration: 60,
        },
        questions,
      });
    } catch (err) {
      console.error('Failed to generate test:', err);
    } finally {
      setGenerating(false);
    }
  }, [tests]);

  // Generated test view
  if (generatedTest) {
    return (
      <div>
        <button
          onClick={() => setGeneratedTest(null)}
          className="mb-4 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
          style={{ backgroundColor: 'var(--theme-card-bg)', border: '1px solid var(--theme-border)', color: 'var(--theme-content-text)' }}
        >
          {t('\u2190 Back to test list', '\u2190 Înapoi la lista de teste')}
        </button>
        <GeneratedTestRenderer testData={generatedTest} />
      </div>
    );
  }

  // Active test view
  if (activeTest) {
    const test = tests.find(t => t.id === activeTest);
    if (!test) return null;

    return (
      <div>
        <button
          onClick={() => setActiveTest(null)}
          className="mb-4 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
          style={{ backgroundColor: 'var(--theme-card-bg)', border: '1px solid var(--theme-border)', color: 'var(--theme-content-text)' }}
        >
          {t('\u2190 Back to test list', '\u2190 Înapoi la lista de teste')}
        </button>

        {test.src ? (
          <TestRenderer src={test.src} />
        ) : (
          <Suspense fallback={<LoadingFallback />}>
            {test.component && <test.component />}
          </Suspense>
        )}
      </div>
    );
  }

  // Group tests by type
  const partials = tests.filter(t => t.id.startsWith('partial-'));
  const exams = tests.filter(t => t.id.startsWith('exam-'));
  const other = tests.filter(t => !t.id.startsWith('partial-') && !t.id.startsWith('exam-'));

  const renderGroup = (title, items) => {
    if (!items.length) return null;
    return (
      <div className="mb-6">
        <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--theme-content-text)' }}>{title}</h3>
        <div className="grid gap-2">
          {items.map(test => {
            const prev = testProgress?.[test.id];
            const pct = prev ? Math.round(prev.score / prev.totalPoints * 100) : null;
            const statusColor = pct !== null
              ? (pct >= 70 ? '#22c55e' : pct >= 40 ? '#f59e0b' : '#ef4444')
              : null;

            return (
              <button
                key={test.id}
                onClick={() => setActiveTest(test.id)}
                className="flex items-center gap-3 p-3 rounded-xl text-left cursor-pointer transition-all hover:scale-[1.01]"
                style={{
                  backgroundColor: 'var(--theme-card-bg)',
                  border: '1px solid var(--theme-border)',
                }}
              >
                {/* Status indicator */}
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: statusColor || 'var(--theme-border)' }}
                />

                {/* Title */}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold truncate" style={{ color: 'var(--theme-content-text)' }}>
                    {t(test.title.en, test.title.ro)}
                  </div>
                </div>

                {/* Score badge */}
                {prev && (
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: statusColor + '20', color: statusColor }}
                  >
                    {prev.score}/{prev.totalPoints}
                  </span>
                )}

                {/* Arrow */}
                <span className="text-xs flex-shrink-0" style={{ color: 'var(--theme-muted-text)' }}>{'\u203A'}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Generate practice test button */}
      <button
        onClick={generatePracticeTest}
        disabled={generating}
        className="w-full mb-6 p-3 rounded-xl text-sm font-bold cursor-pointer transition-all hover:scale-[1.005]"
        style={{
          backgroundColor: '#3b82f6',
          color: '#fff',
          opacity: generating ? 0.6 : 1,
        }}
      >
        {generating
          ? t('Generating...', 'Se genereaz\u0103...')
          : t('Generate Practice Test (random mix)', 'Genereaz\u0103 test de practic\u0103 (mix aleatoriu)')
        }
      </button>

      {renderGroup(t('Midterms (Partials)', 'Par\u021biale'), partials)}
      {renderGroup(t('Final Exams', 'Examene'), exams)}
      {renderGroup(t('Other Tests', 'Alte teste'), other)}
    </div>
  );
}
