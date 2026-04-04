import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import Toggle from '../../../components/ui/Toggle';
import Code from '../../../components/ui/Code';
import Box from '../../../components/ui/Box';

export default function TestRenderer({ test }) {
  const { t } = useApp();

  return (
    <div className="space-y-6">
      <div className="text-sm opacity-70 mb-4">
        {t('Duration', 'Durată')}: {test.duration} | {t('Total', 'Total')}: {test.totalPoints}p
      </div>

      {test.problems.map((problem) => (
        <div key={problem.number} className="mb-6">
          <h3
            className="text-lg font-semibold mb-3"
            style={{ color: 'var(--theme-text)' }}
          >
            {problem.number}. ({problem.points}p) {t(problem.title.en, problem.title.ro)}
          </h3>

          {problem.statement && (
            <Box type="definition">
              <div className="whitespace-pre-wrap">{problem.statement}</div>
            </Box>
          )}

          <div className="space-y-2 mt-3">
            {problem.parts.map((part) => (
              <Toggle
                key={part.label}
                question={`(${part.label}) (${part.points}p) ${part.question}`}
                answer={
                  <div>
                    {part.answer && (
                      <div className="whitespace-pre-wrap mb-2">{part.answer}</div>
                    )}
                    {part.code && <Code>{part.code}</Code>}
                  </div>
                }
                showLabel={t('Show Solution', 'Arată soluția')}
                hideLabel={t('Hide', 'Ascunde')}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
