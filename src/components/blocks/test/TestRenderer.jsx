import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { useApp } from '../../../contexts/AppContext';
import { loadJson } from '../../../content/jsonLoader';
import MultipleChoiceQuestion from './MultipleChoiceQuestion';
import OpenEndedQuestion from './OpenEndedQuestion';
import CodeWritingQuestion from './CodeWritingQuestion';
import DiagramQuestion from './DiagramQuestion';
import FillInQuestion from './FillInQuestion';
import CodeTracingQuestion from './CodeTracingQuestion';
import TestResults from './TestResults';
import TestModeSelector from '../../ui/TestModeSelector';

const promptMarkdown = {
  // react-markdown v9+ no longer passes `inline` prop — detect via className
  code({ className, children, ...props }) {
    if (!className) {
      // Inline code
      return (
        <code
          style={{
            backgroundColor: 'rgba(255,255,255,0.1)',
            padding: '1px 5px',
            borderRadius: '4px',
            fontSize: '0.85em',
            fontFamily: 'monospace',
          }}
          {...props}
        >
          {children}
        </code>
      );
    }
    // Block code (className contains language- prefix)
    return (
      <code
        style={{
          fontFamily: 'monospace',
          color: 'var(--theme-content-text)',
          fontSize: '0.82em',
        }}
        {...props}
      >
        {children}
      </code>
    );
  },
  pre({ children }) {
    return (
      <pre
        style={{
          backgroundColor: 'var(--theme-card-bg)',
          padding: '10px 12px',
          borderRadius: '8px',
          overflowX: 'auto',
          margin: '8px 0',
          lineHeight: '1.5',
          border: '1px solid var(--theme-border)',
        }}
      >
        {children}
      </pre>
    );
  },
  p({ children }) {
    return <p style={{ margin: '4px 0' }}>{children}</p>;
  },
  strong({ children }) {
    return <strong style={{ fontWeight: 700 }}>{children}</strong>;
  },
  ul({ children }) {
    return <ul style={{ margin: '4px 0', paddingLeft: '18px' }}>{children}</ul>;
  },
  ol({ children }) {
    return <ol style={{ margin: '4px 0', paddingLeft: '18px' }}>{children}</ol>;
  },
  li({ children }) {
    return <li style={{ margin: '2px 0' }}>{children}</li>;
  },
};

const questionComponents = {
  'multiple-choice': MultipleChoiceQuestion,
  'open-ended': OpenEndedQuestion,
  'code-writing': CodeWritingQuestion,
  'bash-scripting': CodeWritingQuestion,
  'diagram': DiagramQuestion,
  'fill-in': FillInQuestion,
  'code-tracing': CodeTracingQuestion,
};

export default function TestRenderer({ src }) {
  const { t, lang, saveTestResult, testProgress, setCourseContext } = useApp();
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [activeQ, setActiveQ] = useState(null);
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewQuestionIds, setReviewQuestionIds] = useState([]);
  const [testMode, setTestMode] = useState(null); // null=not started, 'tutor'|'timed'
  const [timeLeft, setTimeLeft] = useState(null);

  // Load test JSON
  useEffect(() => {
    setLoading(true);
    setError(null);
    setTestData(null);
    setAnswers({});
    setShowResults(false);
    setTestMode(null);
    setTimeLeft(null);
    setReviewMode(false);
    setReviewQuestionIds([]);

    try {
      setTestData(loadJson(src));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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

  // Timed mode countdown
  useEffect(() => {
    if (testMode !== 'timed' || showResults || !testData) return;
    const totalSeconds = (testData.meta.duration || testData.questions.length * 2) * 60;
    setTimeLeft(totalSeconds);
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [testMode, showResults, testData]);

  // Auto-submit when timer hits 0
  useEffect(() => {
    if (timeLeft === 0 && testMode === 'timed' && !showResults) {
      handleFinishRef.current?.();
    }
  }, [timeLeft, testMode, showResults]);

  const handleAnswer = useCallback((questionId, score, maxScore) => {
    setAnswers(prev => ({ ...prev, [questionId]: { score, maxScore } }));
  }, []);

  const visibleQuestionCount = reviewMode
    ? reviewQuestionIds.length
    : (testData?.questions?.length || 0);
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount >= visibleQuestionCount;

  const handleFinish = useCallback(() => {
    if (!testData) return;
    const totalScore = Object.values(answers).reduce((sum, a) => sum + (a.score || 0), 0);
    // Only save to persistent progress for full test attempts, not review-mistakes sessions
    if (!reviewMode) {
      saveTestResult(testData.meta.id, totalScore, testData.meta.totalPoints, answers);
    }
    setShowResults(true);
  }, [testData, answers, saveTestResult, reviewMode]);

  const handleFinishRef = useRef(handleFinish);
  handleFinishRef.current = handleFinish;

  const prevBest = testProgress?.[testData?.meta?.id];

  // Show mode selector before test starts
  if (!testMode && !reviewMode && testData && !loading) {
    return <TestModeSelector onSelect={setTestMode} lang={lang} />;
  }

  if (loading) return (
    <div className="p-4 space-y-3">
      <div className="skeleton-shimmer h-6 w-1/2" />
      <div className="skeleton-shimmer h-4 w-full" />
      <div className="skeleton-shimmer h-4 w-4/5" />
      <div className="skeleton-shimmer h-40 w-full" />
    </div>
  );
  if (error) return <div className="p-4 text-sm" style={{ color: '#ef4444' }}>{t('Failed to load test', 'Nu s-a putut încărca testul')}: {error}</div>;
  if (!testData) return null;

  const { meta, questions: allQuestions } = testData;
  const questions = reviewMode
    ? allQuestions.filter(q => reviewQuestionIds.includes(q.id))
    : allQuestions;

  const startReviewMistakes = () => {
    const wrongIds = allQuestions
      .filter(q => {
        const a = answers[q.id];
        return a && q.points > 0 && a.score / q.points < 0.7;
      })
      .map(q => q.id);
    setReviewQuestionIds(wrongIds);
    setReviewMode(true);
    setTestMode(null);
    setTimeLeft(null);
    setAnswers({});
    setShowResults(false);
    setActiveQ(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      {/* Test header */}
      <div className="rounded-xl p-4 mb-6" style={{ backgroundColor: 'var(--theme-card-bg)', border: '1px solid var(--theme-border)' }}>
        <div className="flex items-center gap-3">
          <h2 style={{ fontSize: 'var(--type-h2)', fontWeight: 'var(--type-h2-weight)', color: 'var(--theme-content-text)' }}>
            {t(meta.title.en, meta.title.ro)}
          </h2>
          {reviewMode && (
            <span className="inline-block px-2 py-1 rounded text-sm" style={{ backgroundColor: 'rgba(59,130,246,0.12)', color: '#3b82f6', fontWeight: 600 }}>
              {t('Attempt 2', 'Încercare 2')}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-3 mt-2 text-xs" style={{ color: 'var(--theme-muted-text)' }}>
          {testMode === 'timed' && timeLeft !== null && !showResults && (
            <span style={{ color: timeLeft < 60 ? '#ef4444' : '#3b82f6', fontWeight: 600 }}>
              {'\u23F1'} {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
            </span>
          )}
          {testMode !== 'timed' && meta.duration && <span>{'\u23F1'} {meta.duration} min</span>}
          <span>{meta.totalPoints} {t('points', 'puncte')}</span>
          <span>{visibleQuestionCount} {t('questions', 'întrebări')}</span>
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
          // Fall back to open-ended for any unregistered question type
          const QuestionComp = questionComponents[q.type] || OpenEndedQuestion;

          const a = answers[q.id];
          const badgeColor = a
            ? (q.points > 0 && a.score / q.points >= 0.7 ? '#22c55e' : q.points > 0 && a.score / q.points >= 0.4 ? '#f59e0b' : '#ef4444')
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
                <div className="text-xs font-semibold flex-1 prose-sm" style={{ color: 'var(--theme-content-text)' }}>
                  <ReactMarkdown components={promptMarkdown}>
                    {t(q.prompt.en, q.prompt.ro)}
                  </ReactMarkdown>
                </div>
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
              : t(`${answeredCount}/${visibleQuestionCount} answered`, `${answeredCount}/${visibleQuestionCount} răspunse`)}
          </button>
        </div>
      )}

      {showResults && (
        <TestResults
          questions={questions}
          answers={answers}
          totalPoints={reviewMode ? questions.reduce((sum, q) => sum + q.points, 0) : meta.totalPoints}
          onRetake={() => {
            setAnswers({});
            setShowResults(false);
            setActiveQ(null);
            setReviewMode(false);
            setReviewQuestionIds([]);
            setTestMode(null);
            setTimeLeft(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onReviewMistakes={!reviewMode ? startReviewMistakes : undefined}
        />
      )}
    </div>
  );
}
