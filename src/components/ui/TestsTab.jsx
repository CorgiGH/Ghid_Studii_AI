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
      const loaded = await Promise.all(
        jsonTests.map(t => import(`../../content/${t.src}`).then(m => m.default))
      );
      const pool = [];
      for (const test of loaded) {
        for (const q of test.questions) {
          pool.push({ ...q, sourceTest: test.meta.title });
        }
      }
      const shuffled = pool.sort(() => Math.random() - 0.5);
      const count = 8 + Math.floor(Math.random() * 5);
      const picked = shuffled.slice(0, Math.min(count, pool.length));
      const questions = picked.map((q, i) => ({ ...q, id: `gen-q${i + 1}` }));
      const totalPoints = questions.reduce((s, q) => s + q.points, 0);

      setGeneratedTest({
        meta: {
          id: `practice-${Date.now()}`,
          title: { en: 'Generated Practice Test', ro: 'Test de practic\u0103 generat' },
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
          {t('\u2190 Back to test list', '\u2190 \u00cenapoi la lista de teste')}
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
          {t('\u2190 Back to test list', '\u2190 \u00cenapoi la lista de teste')}
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

  const renderCard = (test) => {
    const prev = testProgress?.[test.id];
    const pct = prev ? Math.round(prev.score / prev.totalPoints * 100) : null;
    const statusColor = pct !== null
      ? (pct >= 70 ? '#22c55e' : pct >= 40 ? '#f59e0b' : '#ef4444')
      : null;

    // Extract year from id
    const yearMatch = test.id.match(/\d{4}/);
    const year = yearMatch ? yearMatch[0] : '';

    return (
      <button
        key={test.id}
        onClick={() => setActiveTest(test.id)}
        className="flex flex-col justify-between p-4 rounded-xl text-left cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md"
        style={{
          backgroundColor: 'var(--theme-card-bg)',
          border: `2px solid ${statusColor || 'var(--theme-border)'}`,
          minHeight: '120px',
        }}
      >
        {/* Top: year badge + status */}
        <div className="flex items-start justify-between gap-2">
          {year && (
            <span
              className="text-[11px] font-bold px-2 py-0.5 rounded-md"
              style={{ backgroundColor: 'var(--theme-border)', color: 'var(--theme-content-text)' }}
            >
              {year}
            </span>
          )}
          {prev ? (
            <span
              className="text-[11px] font-bold px-2 py-0.5 rounded-md"
              style={{ backgroundColor: statusColor + '20', color: statusColor }}
            >
              {pct}%
            </span>
          ) : (
            <span
              className="text-[10px] px-2 py-0.5 rounded-md"
              style={{ backgroundColor: 'var(--theme-border)', color: 'var(--theme-muted-text)' }}
            >
              {t('New', 'Nou')}
            </span>
          )}
        </div>

        {/* Middle: title */}
        <div className="mt-2 flex-1">
          <div className="text-sm font-semibold leading-tight" style={{ color: 'var(--theme-content-text)' }}>
            {t(test.shortTitle?.en || test.title.en, test.shortTitle?.ro || test.title.ro)}
          </div>
        </div>

        {/* Bottom: score bar */}
        {prev ? (
          <div className="mt-3">
            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--theme-border)' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, backgroundColor: statusColor }}
              />
            </div>
            <div className="text-[10px] mt-1 font-medium" style={{ color: 'var(--theme-muted-text)' }}>
              {prev.score}/{prev.totalPoints} {t('pts', 'p')}
            </div>
          </div>
        ) : (
          <div className="mt-3 text-[10px]" style={{ color: 'var(--theme-muted-text)' }}>
            {t('Tap to start', 'Apas\u0103 pentru a \u00eencepe')}
          </div>
        )}
      </button>
    );
  };

  const renderGroup = (title, items) => {
    if (!items.length) return null;
    return (
      <div className="mb-8">
        <h3 className="text-sm font-bold mb-3 uppercase tracking-wide" style={{ color: 'var(--theme-muted-text)' }}>
          {title}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map(renderCard)}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Generate practice test card */}
      <button
        onClick={generatePracticeTest}
        disabled={generating}
        className="w-full mb-8 p-5 rounded-xl text-left cursor-pointer transition-all hover:scale-[1.005]"
        style={{
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          opacity: generating ? 0.7 : 1,
        }}
      >
        <div className="text-white text-base font-bold">
          {generating
            ? t('Generating...', 'Se genereaz\u0103...')
            : t('Generate Practice Test', 'Genereaz\u0103 test de practic\u0103')
          }
        </div>
        <div className="text-white/70 text-xs mt-1">
          {t('Random mix of 8-12 questions from all past exams', 'Mix aleatoriu de 8-12 \u00eentreb\u0103ri din toate examenele')}
        </div>
      </button>

      {renderGroup(t('Midterms', 'Par\u021biale'), partials)}
      {renderGroup(t('Final Exams', 'Examene'), exams)}
      {renderGroup(t('Other', 'Altele'), other)}
    </div>
  );
}
