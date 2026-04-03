import React, { useState, useRef, useCallback } from 'react';
import { useApp } from '../../contexts/AppContext';
import LinuxTerminal from './LinuxTerminal';
import V86Terminal from './V86Terminal';
import { Code } from './index';

function HoverHint({ children }) {
  const [show, setShow] = useState(false);
  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <span className="cursor-help text-blue-500 hover:text-blue-400 transition text-sm">
        💡
      </span>
      {show && (
        <span className="absolute left-6 top-0 z-20 w-56 p-2 rounded-lg shadow-lg border dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 animate-slide-down">
          {children}
        </span>
      )}
    </span>
  );
}

export default function TerminalChallenge({ exercises }) {
  const { t } = useApp();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [tab, setTab] = useState('try');
  const [checkResult, setCheckResult] = useState(null);
  const [showSolution, setShowSolution] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const emulatorRef = useRef(null);

  const ex = exercises[currentIdx];

  const switchExercise = (idx) => {
    setCurrentIdx(idx);
    setTab('try');
    setCheckResult(null);
    setShowSolution(false);
    setResetKey(k => k + 1);
  };

  const check = useCallback(async () => {
    if (!emulatorRef.current || !ex.checkFn) return;
    try {
      const passed = await ex.checkFn(emulatorRef.current);
      setCheckResult(passed);
    } catch {
      setCheckResult(false);
    }
  }, [ex]);

  const reset = () => {
    setResetKey(k => k + 1);
    setCheckResult(null);
  };

  return (
    <div className="border rounded-xl dark:border-gray-600 overflow-hidden mb-6">
      {/* Exercise selector */}
      <div className="flex items-center gap-1 p-2 bg-gray-100 dark:bg-gray-800 border-b dark:border-gray-600 overflow-x-auto">
        {exercises.map((e, i) => (
          <button
            key={i}
            onClick={() => switchExercise(i)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition whitespace-nowrap ${
              i === currentIdx
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {t('Ex', 'Ex')} {i + 1}
          </button>
        ))}
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
              key={`${currentIdx}-${resetKey}`}
              files={ex.files}
              welcomeMessage={ex.welcomeMessage}
              emulatorRef={emulatorRef}
            />
          )}
        </div>

        {/* Right: Instructions panel */}
        <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l dark:border-gray-600 p-4 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center gap-2 mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {t('Exercise', 'Exercițiu')} {currentIdx + 1}/{exercises.length}
            </h4>
            {ex.courseRef && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                {ex.courseRef}
              </span>
            )}
          </div>

          <p className="text-sm mb-4">{ex.description}</p>

          {ex.hints && ex.hints.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              {ex.hints.map((hint, i) => (
                <HoverHint key={i}>{hint}</HoverHint>
              ))}
              <span className="text-xs text-gray-400">{t('Hover for hints', 'Treci cursorul pentru indicii')}</span>
            </div>
          )}

          {tab === 'try' && (
            <p className="text-xs text-gray-400 italic">
              {t('Experiment freely here. Switch to "Submit Answer" when ready.',
                'Experimentează liber aici. Treci la "Trimite răspunsul" când ești pregătit.')}
            </p>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 p-3 border-t dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
        {/* Prev/Next */}
        <button
          onClick={() => switchExercise(Math.max(0, currentIdx - 1))}
          disabled={currentIdx === 0}
          className="px-3 py-1.5 text-sm font-medium bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← {t('Prev', 'Anterior')}
        </button>
        <button
          onClick={() => switchExercise(Math.min(exercises.length - 1, currentIdx + 1))}
          disabled={currentIdx === exercises.length - 1}
          className="px-3 py-1.5 text-sm font-medium bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {t('Next', 'Următor')} →
        </button>

        <div className="flex-1" />

        {tab === 'submit' && ex.checkFn && (
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
        {ex.solution && (
          <button
            onClick={() => setShowSolution(!showSolution)}
            className="px-4 py-1.5 text-sm font-medium bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
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
      {showSolution && ex.solution && (
        <div className="border-t dark:border-gray-600 p-3 animate-slide-down">
          <p className="text-xs font-medium mb-2 opacity-60">{t('Solution:', 'Soluția:')}</p>
          <Code>{ex.solution}</Code>
        </div>
      )}
    </div>
  );
}
