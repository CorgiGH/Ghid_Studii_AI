import React, { useState, useRef, useCallback } from 'react';
import { useApp } from '../../contexts/AppContext';
import LinuxTerminal from './LinuxTerminal';
import V86Terminal from './V86Terminal';
import { Code } from './index';

export default function TerminalChallenge({ description, files, checkFn, solution, welcomeMessage, hints }) {
  const { t } = useApp();
  const [tab, setTab] = useState('try');
  const [checkResult, setCheckResult] = useState(null);
  const [showSolution, setShowSolution] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const emulatorRef = useRef(null);

  const check = useCallback(async () => {
    if (!emulatorRef.current || !checkFn) return;
    try {
      const passed = await checkFn(emulatorRef.current);
      setCheckResult(passed);
    } catch {
      setCheckResult(false);
    }
  }, [checkFn]);

  const reset = () => {
    setResetKey(k => k + 1);
    setCheckResult(null);
  };

  return (
    <div className="border rounded-xl dark:border-gray-600 overflow-hidden mb-6">
      {/* Problem description */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-600">
        <p className="text-sm font-medium">{description}</p>
      </div>

      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row">
        {/* Left: Terminal area */}
        <div className="flex-1 min-w-0">
          {/* Tab bar */}
          <div className="flex border-b dark:border-gray-600">
            <button
              onClick={() => setTab('try')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition border-b-2 -mb-px ${
                tab === 'try'
                  ? 'border-green-500 text-green-600 dark:text-green-400 bg-green-50/50 dark:bg-green-950/20'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              {t('Try It', 'Încearcă')}
            </button>
            <button
              onClick={() => setTab('submit')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition border-b-2 -mb-px ${
                tab === 'submit'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              {t('Submit Answer', 'Trimite răspunsul')}
            </button>
          </div>

          {/* Terminal content */}
          <div style={{ display: tab === 'try' ? 'block' : 'none' }}>
            <V86Terminal />
          </div>
          {tab === 'submit' && (
            <LinuxTerminal
              key={resetKey}
              files={files}
              welcomeMessage={welcomeMessage}
              emulatorRef={emulatorRef}
            />
          )}
        </div>

        {/* Right: Instructions panel */}
        <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l dark:border-gray-600 p-4 bg-gray-50/50 dark:bg-gray-800/50">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
            {t('Instructions', 'Instrucțiuni')}
          </h4>
          <p className="text-sm mb-4">{description}</p>

          {hints && (
            <>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                {t('Hints', 'Indicii')}
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-4">
                {hints.map((hint, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-blue-500">•</span>
                    {hint}
                  </li>
                ))}
              </ul>
            </>
          )}

          {tab === 'try' && (
            <p className="text-xs text-gray-400 italic">
              {t('Use this real Linux terminal to experiment. When ready, switch to "Submit Answer" to check your solution.',
                'Folosește acest terminal Linux real pentru a experimenta. Când ești pregătit, treci la "Trimite răspunsul" pentru a verifica soluția.')}
            </p>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 p-3 border-t dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
        {tab === 'submit' && checkFn && (
          <button
            onClick={check}
            className="px-4 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {t('Check', 'Verifică')}
          </button>
        )}
        {tab === 'submit' && (
          <button
            onClick={reset}
            className="px-4 py-1.5 text-sm font-medium bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
          >
            {t('Reset', 'Resetează')}
          </button>
        )}
        {solution && (
          <button
            onClick={() => setShowSolution(!showSolution)}
            className="px-4 py-1.5 text-sm font-medium bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition ml-auto"
          >
            {showSolution ? t('Hide Solution', 'Ascunde soluția') : t('Show Solution', 'Arată soluția')}
          </button>
        )}
      </div>

      {/* Check result */}
      {checkResult !== null && (
        <div className={`p-3 text-sm font-medium border-t dark:border-gray-600 ${
          checkResult
            ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400'
            : 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400'
        }`}>
          {checkResult
            ? t('Correct! Task completed.', 'Corect! Sarcină finalizată.')
            : t('Not quite — try again.', 'Nu exact — încearcă din nou.')}
        </div>
      )}

      {/* Solution */}
      {showSolution && solution && (
        <div className="border-t dark:border-gray-600 p-3 animate-slide-down">
          <p className="text-xs font-medium mb-2 opacity-60">{t('Solution:', 'Soluția:')}</p>
          <Code>{solution}</Code>
        </div>
      )}
    </div>
  );
}
