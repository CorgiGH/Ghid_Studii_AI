import React, { useState, useCallback } from 'react';
import { useApp } from '../../contexts/AppContext';
import MultipleChoiceQuestion from '../blocks/test/MultipleChoiceQuestion';
import OpenEndedQuestion from '../blocks/test/OpenEndedQuestion';
import CodeWritingQuestion from '../blocks/test/CodeWritingQuestion';
import DiagramQuestion from '../blocks/test/DiagramQuestion';
import FillInQuestion from '../blocks/test/FillInQuestion';
import TestResults from '../blocks/test/TestResults';

const questionComponents = {
  'multiple-choice': MultipleChoiceQuestion,
  'open-ended': OpenEndedQuestion,
  'code-writing': CodeWritingQuestion,
  'diagram': DiagramQuestion,
  'fill-in': FillInQuestion,
};

export default function GeneratedTestRenderer({ testData }) {
  const { t } = useApp();
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [activeQ, setActiveQ] = useState(null);

  const handleAnswer = useCallback((questionId, score, maxScore) => {
    setAnswers(prev => ({ ...prev, [questionId]: { score, maxScore } }));
  }, []);

  const { meta, questions } = testData;
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount >= totalQuestions;

  const handleFinish = () => {
    setShowResults(true);
  };

  return (
    <div>
      {/* Test header */}
      <div className="rounded-xl p-4 mb-6" style={{ backgroundColor: 'var(--theme-card-bg)', border: '1px solid var(--theme-border)' }}>
        <h2 className="text-lg font-bold" style={{ color: 'var(--theme-content-text)' }}>
          {t(meta.title.en, meta.title.ro)}
        </h2>
        <div className="flex flex-wrap gap-3 mt-2 text-xs" style={{ color: 'var(--theme-muted-text)' }}>
          <span>{meta.totalPoints} {t('points', 'puncte')}</span>
          <span>{totalQuestions} {t('questions', '\u00eentreb\u0103ri')}</span>
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
          if (!QuestionComp) return null;

          const a = answers[q.id];
          const badgeColor = a
            ? (a.score / q.points >= 0.7 ? '#22c55e' : a.score / q.points >= 0.4 ? '#f59e0b' : '#ef4444')
            : '#3b82f6';

          return (
            <div key={q.id} id={`q-${q.id}`} className="rounded-xl p-4" style={{ backgroundColor: 'var(--theme-card-bg)', border: `1px solid ${activeQ === q.id ? '#3b82f6' : 'var(--theme-border)'}` }}>
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
              : t(`${answeredCount}/${totalQuestions} answered`, `${answeredCount}/${totalQuestions} r\u0103spunse`)}
          </button>
        </div>
      )}

      {showResults && (
        <TestResults questions={questions} answers={answers} totalPoints={meta.totalPoints} />
      )}
    </div>
  );
}
