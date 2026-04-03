import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';

export default function MultipleChoice({ questions }) {
  const { t, lang } = useApp();
  const [answers, setAnswers] = useState({});
  const [revealed, setRevealed] = useState({});

  const select = (qIdx, oIdx) => {
    if (revealed[qIdx]) return;
    setAnswers(prev => ({ ...prev, [qIdx]: oIdx }));
  };

  const reveal = (qIdx) => {
    setRevealed(prev => ({ ...prev, [qIdx]: true }));
  };

  return (
    <div className="space-y-4">
      {questions.map((q, qIdx) => {
        const picked = answers[qIdx];
        const shown = revealed[qIdx];
        return (
          <div key={qIdx} className="border rounded-lg dark:border-gray-600 p-4">
            <p className="font-medium mb-3">{q.question[lang]}</p>
            <div className="space-y-2">
              {q.options.map((opt, oIdx) => {
                let cls = 'border rounded-lg p-2 cursor-pointer transition text-sm ';
                if (shown && opt.correct) cls += 'border-green-500 bg-green-50 dark:bg-green-950 ';
                else if (shown && picked === oIdx && !opt.correct) cls += 'border-red-500 bg-red-50 dark:bg-red-950 ';
                else if (picked === oIdx) cls += 'border-blue-500 bg-blue-50 dark:bg-blue-950 ';
                else cls += 'border-gray-300 dark:border-gray-600 hover:border-blue-400 ';
                return (
                  <div key={oIdx} className={cls} onClick={() => select(qIdx, oIdx)}>
                    {typeof opt.text === 'object' ? opt.text[lang] : opt.text}
                  </div>
                );
              })}
            </div>
            {picked !== undefined && !shown && (
              <button onClick={() => reveal(qIdx)} className="mt-3 text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                {t('Check Answer', 'Verifică răspunsul')}
              </button>
            )}
            {shown && (
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                {q.explanation?.[lang]}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
