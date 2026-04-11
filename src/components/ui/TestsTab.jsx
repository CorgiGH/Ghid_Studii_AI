import React, { useState, Suspense, useCallback } from 'react';
import { useApp } from '../../contexts/AppContext';
import { generateTest } from '../../services/api';
import { loadJson } from '../../content/jsonLoader';
import TestRenderer from '../blocks/test/TestRenderer';
import GeneratedTestRenderer from './GeneratedTestRenderer';

function LoadingFallback() {
  return (
    <div className="p-4 space-y-3">
      <div className="skeleton-shimmer h-6 w-1/2" />
      <div className="skeleton-shimmer h-4 w-full" />
      <div className="skeleton-shimmer h-4 w-3/4" />
    </div>
  );
}

export default function TestsTab({ tests, courses }) {
  const { t, lang, testProgress } = useApp();
  const [activeTest, setActiveTest] = useState(null);
  const [generatedTest, setGeneratedTest] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiError, setAiError] = useState(null);

  const generateAITest = useCallback(async () => {
    setAiGenerating(true);
    setAiError(null);
    try {
      // Load all JSON courses to extract content
      const jsonCourses = (courses || []).filter(c => c.src);
      if (!jsonCourses.length) throw new Error('No JSON courses available');

      // Pick 2-3 random courses for variety
      const shuffled = [...jsonCourses].sort(() => Math.random() - 0.5);
      const picked = shuffled.slice(0, Math.min(3, shuffled.length));

      const loaded = await Promise.all(
        picked.map(c => Promise.resolve(loadJson(c.src)))
      );

      // Extract text content from steps/blocks
      const contentParts = loaded.map(course => {
        const title = course.meta.title.en;
        const steps = course.steps.map(step => {
          const blocks = step.blocks
            .filter(b => b.type === 'learn' || b.type === 'definition' || b.type === 'code')
            .map(b => {
              if (b.type === 'code') return b.content;
              return b.content?.en || b.term?.en || '';
            })
            .join('\n');
          return `## ${step.title.en}\n${blocks}`;
        }).join('\n\n');
        return `# ${title}\n${steps}`;
      }).join('\n\n---\n\n');

      const { questions } = await generateTest({
        courseContent: contentParts,
        numQuestions: 8,
        lang,
      });

      const totalPoints = questions.reduce((s, q) => s + q.points, 0);
      setGeneratedTest({
        meta: {
          id: `ai-${Date.now()}`,
          title: { en: 'AI-Generated Test', ro: 'Test generat de AI' },
          totalPoints,
          duration: 60,
        },
        questions,
      });
    } catch (err) {
      console.error('AI generation failed:', err);
      setAiError(err.message);
    } finally {
      setAiGenerating(false);
    }
  }, [courses, lang]);

  const generatePracticeTest = useCallback(async () => {
    setGenerating(true);
    try {
      const jsonTests = tests.filter(t => t.src);
      const loaded = await Promise.all(
        jsonTests.map(t => Promise.resolve(loadJson(t.src)))
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
      {/* Generate buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        <button
          onClick={generatePracticeTest}
          disabled={generating}
          className="p-4 rounded-xl text-left cursor-pointer transition-all hover:scale-[1.005]"
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            opacity: generating ? 0.7 : 1,
          }}
        >
          <div className="text-white text-sm font-bold">
            {generating
              ? t('Generating...', 'Se genereaz\u0103...')
              : t('Random Mix', 'Mix aleatoriu')
            }
          </div>
          <div className="text-white/70 text-[11px] mt-1">
            {t('8-12 questions sampled from past exams', '8-12 \u00eentreb\u0103ri din examenele anterioare')}
          </div>
        </button>

        <button
          onClick={generateAITest}
          disabled={aiGenerating}
          className="p-4 rounded-xl text-left cursor-pointer transition-all hover:scale-[1.005]"
          style={{
            background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
            opacity: aiGenerating ? 0.7 : 1,
          }}
        >
          <div className="text-white text-sm font-bold">
            {aiGenerating
              ? t('AI is thinking...', 'AI-ul genereaz\u0103...')
              : t('AI Generate from Courses', 'Genereaz\u0103 cu AI din cursuri')
            }
          </div>
          <div className="text-white/70 text-[11px] mt-1">
            {t('New original questions based on course content', '\u00centreb\u0103ri originale bazate pe con\u021binutul cursurilor')}
          </div>
        </button>
      </div>

      {aiError && (
        <div className="mb-4 p-3 rounded-lg text-xs" style={{ backgroundColor: '#ef444420', color: '#ef4444', border: '1px solid #ef444440' }}>
          {t('Generation failed', 'Generarea a e\u0219uat')}: {aiError}
        </div>
      )}

      {renderGroup(t('Midterms', 'Par\u021biale'), partials)}
      {renderGroup(t('Final Exams', 'Examene'), exams)}
      {renderGroup(t('Other', 'Altele'), other)}
    </div>
  );
}
