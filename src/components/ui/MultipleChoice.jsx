import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';

export default function MultipleChoice({ questions, multiSelect = false, onScore }) {
  const { t, lang } = useApp();
  const [answers, setAnswers] = useState({});
  const [revealed, setRevealed] = useState({});

  const select = (qIdx, oIdx) => {
    if (revealed[qIdx]) return;
    if (multiSelect) {
      setAnswers(prev => {
        const current = new Set(prev[qIdx] || []);
        if (current.has(oIdx)) current.delete(oIdx); else current.add(oIdx);
        return { ...prev, [qIdx]: new Set(current) };
      });
    } else {
      setAnswers(prev => ({ ...prev, [qIdx]: oIdx }));
    }
  };

  const reveal = (qIdx) => {
    setRevealed(prev => ({ ...prev, [qIdx]: true }));
    if (onScore) {
      const q = questions[qIdx];
      const correctIndices = new Set(q.options.map((o, i) => o.correct ? i : -1).filter(i => i >= 0));
      if (multiSelect) {
        const selected = answers[qIdx] || new Set();
        const isCorrect = selected.size === correctIndices.size && [...selected].every(i => correctIndices.has(i));
        onScore(qIdx, isCorrect);
      } else {
        const isCorrect = q.options[answers[qIdx]]?.correct === true;
        onScore(qIdx, isCorrect);
      }
    }
  };

  return (
    <div className="space-y-4">
      {questions.map((q, qIdx) => {
        const picked = answers[qIdx];
        const shown = revealed[qIdx];
        return (
          <div key={qIdx} className="border rounded-lg dark:border-gray-600 p-4">
            <p className="font-medium mb-3">{q.question[lang]}</p>
            {multiSelect && <p className="text-xs opacity-50 mb-2">{t('Select all that apply', 'Selectează toate variantele corecte')}</p>}
            <div className="space-y-2">
              {q.options.map((opt, oIdx) => {
                const isSelected = multiSelect ? (picked instanceof Set && picked.has(oIdx)) : picked === oIdx;
                let cls = 'border rounded-lg p-2 cursor-pointer transition text-sm ';
                if (shown && opt.correct) cls += 'border-green-500 bg-green-50 dark:bg-green-950 ';
                else if (shown && isSelected && !opt.correct) cls += 'border-red-500 bg-red-50 dark:bg-red-950 ';
                else if (isSelected) cls += 'border-blue-500 bg-blue-50 dark:bg-blue-950 ';
                else cls += 'border-gray-300 dark:border-gray-600 hover:border-blue-400 ';
                return (
                  <div key={oIdx} className={cls} onClick={() => select(qIdx, oIdx)}>
                    {typeof opt.text === 'object' ? opt.text[lang] : opt.text}
                  </div>
                );
              })}
            </div>
            {((multiSelect ? (picked instanceof Set && picked.size > 0) : picked !== undefined)) && !shown && (
              <button onClick={() => reveal(qIdx)} className="mt-3 text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                {t('Check Answer', 'Verifică răspunsul')}
              </button>
            )}
            {shown && (
              <>
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                  {q.explanation?.[lang]}
                </p>
                <button
                  onClick={() => {
                    const selectedIdx = multiSelect ? [...(picked || [])][0] : picked;
                    const selectedText = q.options[selectedIdx]
                      ? (typeof q.options[selectedIdx].text === 'object' ? q.options[selectedIdx].text[lang] : q.options[selectedIdx].text)
                      : '';
                    window.dispatchEvent(new CustomEvent('check-with-ai', {
                      detail: {
                        type: 'multiple-choice',
                        question: typeof q.question === 'object' ? q.question[lang] : q.question,
                        selectedText,
                        studentAnswer: selectedText,
                        options: q.options.map(o => typeof o.text === 'object' ? o.text[lang] : o.text),
                        correct: q.options.findIndex(o => o.correct),
                        keyConcepts: q.keyConcepts || [],
                        explanation: typeof q.explanation === 'object' ? q.explanation[lang] : (q.explanation || ''),
                      }
                    }));
                  }}
                  className="mt-2 text-xs px-3 py-1.5 rounded-lg text-white transition-colors hover:brightness-110 flex items-center gap-1.5"
                  style={{ backgroundColor: '#8b5cf6' }}
                >
                  <span style={{ fontSize: '13px' }}>&#10024;</span>
                  {t('Check with AI', 'Verifică cu AI')}
                </button>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
