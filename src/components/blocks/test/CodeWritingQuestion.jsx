import React, { useState } from 'react';
import { useApp } from '../../../contexts/AppContext';
import { gradeAnswer } from '../../../services/api';
import QuestionFeedback from './QuestionFeedback';

export default function CodeWritingQuestion({ question, onAnswer }) {
  const { t, lang } = useApp();
  const [code, setCode] = useState('');
  const [grading, setGrading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!code.trim()) return;
    setGrading(true);
    setError(null);
    try {
      const res = await gradeAnswer({
        prompt: lang === 'ro' ? question.prompt.ro : question.prompt.en,
        studentAnswer: code,
        rubric: lang === 'ro' ? question.rubric?.ro : question.rubric?.en,
        maxPoints: question.points,
        questionType: 'code-writing',
      });
      setResult(res);
      onAnswer?.(question.id, res.score, res.maxScore);
    } catch (err) {
      setError(err.message);
    } finally {
      setGrading(false);
    }
  };

  return (
    <div>
      <textarea
        value={code}
        onChange={e => setCode(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Tab') {
            e.preventDefault();
            const { selectionStart, selectionEnd } = e.target;
            const newVal = code.slice(0, selectionStart) + '\t' + code.slice(selectionEnd);
            setCode(newVal);
            requestAnimationFrame(() => {
              e.target.selectionStart = e.target.selectionEnd = selectionStart + 1;
            });
          }
        }}
        disabled={!!result}
        rows={8}
        spellCheck={false}
        className="w-full rounded-lg p-3 text-xs resize-y font-mono"
        style={{
          backgroundColor: 'var(--theme-card-bg)',
          border: '1px solid var(--theme-border)',
          color: 'var(--theme-content-text)',
          tabSize: 2,
        }}
        placeholder={t(`Write your ${question.language || 'code'} here...`, `Scrie codul ${question.language || ''} aici...`)}
      />

      {!result && (
        <button
          onClick={handleSubmit}
          disabled={!code.trim() || grading}
          className="mt-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          style={{
            backgroundColor: code.trim() && !grading ? '#3b82f6' : 'var(--theme-border)',
            color: code.trim() && !grading ? '#fff' : 'var(--theme-muted-text)',
          }}
        >
          {grading ? t('Grading...', 'Se corectează...') : t('Submit', 'Trimite')}
        </button>
      )}

      {error && <div className="mt-2 text-xs" style={{ color: '#ef4444' }}>{error}</div>}
      {result && <QuestionFeedback result={result} />}
    </div>
  );
}
