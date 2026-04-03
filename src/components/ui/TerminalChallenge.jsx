import React, { useState, useRef, useCallback } from 'react';
import { useApp } from '../../contexts/AppContext';
import LinuxTerminal from './LinuxTerminal';
import { Code } from './index';

export default function TerminalChallenge({ description, files, checkFn, solution, welcomeMessage }) {
  const { t } = useApp();
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

      {/* Terminal */}
      <LinuxTerminal
        key={resetKey}
        files={files}
        welcomeMessage={welcomeMessage}
        emulatorRef={emulatorRef}
      />

      {/* Controls */}
      <div className="flex items-center gap-2 p-3 border-t dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
        {checkFn && (
          <button
            onClick={check}
            className="px-4 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {t('Check', 'Verifică')}
          </button>
        )}
        <button
          onClick={reset}
          className="px-4 py-1.5 text-sm font-medium bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
        >
          {t('Reset', 'Resetează')}
        </button>
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
