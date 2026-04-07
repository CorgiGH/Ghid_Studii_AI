import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../../contexts/AppContext';
import MultipleChoiceQuestion from './MultipleChoiceQuestion';
import OpenEndedQuestion from './OpenEndedQuestion';
import CodeWritingQuestion from './CodeWritingQuestion';
import DiagramQuestion from './DiagramQuestion';
import FillInQuestion from './FillInQuestion';
import TestResults from './TestResults';

const questionComponents = {
  'multiple-choice': MultipleChoiceQuestion,
  'open-ended': OpenEndedQuestion,
  'code-writing': CodeWritingQuestion,
  'diagram': DiagramQuestion,
  'fill-in': FillInQuestion,
};

export default function TestRenderer({ src }) {
  const { t, lang, saveTestResult, testProgress, setCourseContext } = useApp();
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [activeQ, setActiveQ] = useState(null);

  // Load test JSON
  useEffect(() => {
    setLoading(true);
    setError(null);
    setTestData(null);
    setAnswers({});
    setShowResults(false);

    import(`../../../content/${src}`)
      .then(module => {
        setTestData(module.default);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [src]);

  // Set test context for chat panel (test mode guard)
  useEffect(() => {
    if (!testData) return;
    setCourseContext({
      type: 'test',
      courseTitle: t(testData.meta.title.en, testData.meta.title.ro),
      stepTitle: null,
      stepId: null,
      blocks: [],
      testMode: true,
    });
    return () => setCourseContext(null);
  }, [testData, setCourseContext, t]);

  const handleAnswer = useCallback((questionId, score, maxScore) => {
    setAnswers(prev => ({ ...prev, [questionId]: { score, maxScore } }));
  }, []);

  const totalQuestions = testData?.questions?.length || 0;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount >= totalQuestions;

  const handleFinish = () => {
    if (!testData) return;
    const totalScore = Object.values(answers).reduce((sum, a) => sum + (a.score || 0), 0);
    saveTestResult(testData.meta.id, totalScore, testData.meta.totalPoints, answers);
    setShowResults(true);
  };

  const prevBest = testProgress?.[testData?.meta?.id];

  if (loading) return <div className="animate-pulse p-4 text-sm opacity-50">{t('Loading...', 'Se încarcă...')}</div>;
  if (error) return <div className="p-4 text-sm" style={{ color: '#ef4444' }}>{t('Failed to load test', 'Nu s-a putut încărca testul')}: {error}</div>;
  if (!testData) return null;

  const { meta, questions } = testData;

  return (
    <div>
      {/* Test header */}
      <div className="rounded-xl p-4 mb-6" style={{ backgroundColor: 'var(--theme-card-bg)', border: '1px solid var(--theme-border)' }}>
        <h2 className="text-lg font-bold" style={{ color: 'var(--theme-content-text)' }}>
          {t(meta.title.en, meta.title.ro)}
        </h2>
        <div className="flex flex-wrap gap-3 mt-2 text-xs" style={{ color: 'var(--theme-muted-text)' }}>
          {meta.duration && <span>{'\u23F1'} {meta.duration} min</span>}
          <span>{meta.totalPoints} {t('points', 'puncte')}</span>
          <span>{totalQuestions} {t('questions', 'întrebări')}</span>
          {prevBest && (
            <span style={{ color: '#3b82f6' }}>
              {t('Best', 'Cel mai bun')}: {prevBest.score}/{prevBest.totalPoints}
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div className="mt-3 flex gap-1">
          {questions.map(q => {
            const a = answers[q.id];
            let bg = 'var(--theme-border)';
            if (a) {
              const pct = q.points > 0 ? a.score / q.points : 0;
              bg = pct >= 0.7 ? '#22c55e' : pct >= 0.4 ? '#f59e0b' : '#ef4444';
            }
            return (
              <div
                key={q.id}
                className="flex-1 h-1.5 rounded-sm cursor-pointer transition-colors"
                style={{ backgroundColor: bg }}
                onClick={() => {
                  setActiveQ(q.id);
                  document.getElementById(`q-${q.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((q, i) => {
          const QuestionComp = questionComponents[q.type];
          if (!QuestionComp) {
            return (
              <div key={q.id} className="p-3 rounded-lg text-xs" style={{ backgroundColor: 'var(--theme-card-bg)', border: '1px solid var(--theme-border)', color: 'var(--theme-muted-text)' }}>
                {t(`Unknown question type: ${q.type}`, `Tip de întrebare necunoscut: ${q.type}`)}
              </div>
            );
          }

          const a = answers[q.id];
          const badgeColor = a
            ? (a.score / q.points >= 0.7 ? '#22c55e' : a.score / q.points >= 0.4 ? '#f59e0b' : '#ef4444')
            : '#3b82f6';

          return (
            <div key={q.id} id={`q-${q.id}`} className="rounded-xl p-4" style={{ backgroundColor: 'var(--theme-card-bg)', border: `1px solid ${activeQ === q.id ? '#3b82f6' : 'var(--theme-border)'}` }}>
              {/* Question header */}
              <div className="flex items-start gap-2 mb-3">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: badgeColor }}
                >
                  {i + 1}
                </span>
                <span className="text-xs font-semibold flex-1" style={{ color: 'var(--theme-content-text)' }}>
                  {t(q.prompt.en, q.prompt.ro)}
                </span>
                <span className="text-[10px] flex-shrink-0" style={{ color: 'var(--theme-muted-text)' }}>
                  {q.points} {t('pts', 'p')}
                </span>
              </div>

              {/* Question body */}
              <QuestionComp question={q} onAnswer={handleAnswer} />
            </div>
          );
        })}
      </div>

      {/* Finish button / Results */}
      {!showResults && (
        <div className="flex justify-center mt-6">
          <button
            onClick={handleFinish}
            disabled={!allAnswered}
            className="px-6 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer"
            style={{
              backgroundColor: allAnswered ? '#22c55e' : 'var(--theme-border)',
              color: allAnswered ? '#fff' : 'var(--theme-muted-text)',
            }}
          >
            {allAnswered
              ? t('See Results', 'Vezi rezultatele')
              : t(`${answeredCount}/${totalQuestions} answered`, `${answeredCount}/${totalQuestions} răspunse`)}
          </button>
        </div>
      )}

      {showResults && (
        <TestResults questions={questions} answers={answers} totalPoints={meta.totalPoints} />
      )}
    </div>
  );
}
