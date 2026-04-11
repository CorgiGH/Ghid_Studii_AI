import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Code } from './index';
import { injectFiles, runCheck } from '../../utils/v86Exec';
import useV86 from '../../hooks/useV86';

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

function ExerciseFilesList({ files, t }) {
  const [open, setOpen] = useState(false);
  if (!files || Object.keys(files).length === 0) return null;

  const entries = Object.entries(files);
  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen(!open)}
        className="text-xs font-medium hover:opacity-80 transition flex items-center gap-1"
        style={{ color: 'var(--theme-muted)' }}
      >
        <span className={`transition-transform ${open ? 'rotate-90' : ''}`}>▶</span>
        {t('Exercise Files', 'Fișiere exercițiu')} ({entries.length})
      </button>
      {open && (
        <ul className="mt-1 ml-4 text-xs space-y-0.5" style={{ color: 'var(--theme-muted)' }}>
          {entries.map(([path, val]) => (
            <li key={path} className="font-mono">
              {val === null ? '📁' : '📄'} {path.split('/').pop()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function TerminalChallenge({ exercises }) {
  const { t } = useApp();
  const screenRef = useRef(null);
  const { exec, booted, booting, boot } = useV86(screenRef);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [checkResult, setCheckResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [injecting, setInjecting] = useState(false);
  const [resetMenuOpen, setResetMenuOpen] = useState(false);

  const ex = exercises[currentIdx];

  // Boot v86 on mount
  useEffect(() => {
    if (screenRef.current && !booted && !booting) {
      boot();
    }
  }, [boot, booted, booting]);

  // Inject files when exercise changes or VM boots
  useEffect(() => {
    if (!booted || !exec.current || !ex.files || Object.keys(ex.files).length === 0) return;
    let cancelled = false;
    setInjecting(true);
    injectFiles(exec.current, ex.files).then(() => {
      if (!cancelled) setInjecting(false);
    }).catch(() => {
      if (!cancelled) setInjecting(false);
    });
    return () => { cancelled = true; };
  }, [booted, currentIdx]);

  const switchExercise = (idx) => {
    setCurrentIdx(idx);
    setCheckResult(null);
    setShowSolution(false);
    setResetMenuOpen(false);
  };

  const check = useCallback(async () => {
    if (!exec.current || !ex.checkScript) return;
    setChecking(true);
    setCheckResult(null);
    const minDelay = new Promise(r => setTimeout(r, 300));
    try {
      const [result] = await Promise.all([
        runCheck(exec.current, ex.checkScript),
        minDelay,
      ]);
      setCheckResult(result);
    } catch {
      setCheckResult({ passed: false, feedback: '' });
    }
    setChecking(false);
  }, [ex]);

  const resetExercise = useCallback(async () => {
    if (!exec.current || !ex.files || Object.keys(ex.files).length === 0) return;
    setCheckResult(null);
    setResetMenuOpen(false);
    setInjecting(true);
    try {
      await injectFiles(exec.current, ex.files);
    } catch { /* best effort */ }
    setInjecting(false);
  }, [ex]);

  const resetVM = useCallback(() => {
    setResetMenuOpen(false);
    setCheckResult(null);
    window.location.reload();
  }, []);

  return (
    <div className="border rounded-xl overflow-hidden mb-6" style={{ borderColor: 'var(--theme-border)' }}>
      {/* Exercise selector */}
      <div className="flex items-center gap-1 p-2 overflow-x-auto" style={{ background: 'var(--theme-sidebar-bg)', borderBottom: '1px solid var(--theme-border)' }}>
        {exercises.map((e, i) => (
          <button
            key={i}
            onClick={() => switchExercise(i)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition whitespace-nowrap ${
              i === currentIdx
                ? 'bg-blue-600 text-white'
                : 'hover:opacity-80'
            }`}
            style={i !== currentIdx ? { background: 'var(--theme-content-bg)', color: 'var(--theme-text)' } : undefined}
          >
            {t('Ex', 'Ex')} {i + 1}
          </button>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row">
        {/* Left: v86 terminal */}
        <div className="flex-1 min-w-0 relative">
          <div ref={screenRef} className="v86-screen" style={{ width: '100%', minHeight: '450px', overflow: 'auto', background: '#000' }} />
          {/* Boot overlay */}
          {!booted && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/90 z-10">
              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mb-4" />
              <p className="text-sm text-gray-300 font-mono">
                {booting ? t('Booting Linux...', 'Se pornește Linux...') : t('Preparing terminal...', 'Se pregătește terminalul...')}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {t('This may take a few seconds on first load', 'Poate dura câteva secunde la prima încărcare')}
              </p>
            </div>
          )}
          {/* Injecting indicator */}
          {injecting && booted && (
            <div className="absolute bottom-2 left-2 z-10 px-2 py-1 rounded bg-blue-900/80 text-xs text-blue-200 font-mono">
              {t('Loading files...', 'Se încarcă fișierele...')}
            </div>
          )}
        </div>

        {/* Right: Instructions panel */}
        <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l p-4" style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-sidebar-bg)' }}>
          <div className="flex items-center gap-2 mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--theme-muted)' }}>
              {t('Exercise', 'Exercițiu')} {currentIdx + 1}/{exercises.length}
            </h4>
            {ex.courseRef && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                {ex.courseRef}
              </span>
            )}
          </div>

          <p className="text-sm mb-3">{ex.description}</p>

          {ex.hints && ex.hints.length > 0 && (
            <div className="flex items-center gap-2 mb-3">
              {ex.hints.map((hint, i) => (
                <HoverHint key={i}>{hint}</HoverHint>
              ))}
              <span className="text-xs" style={{ color: 'var(--theme-muted)' }}>{t('Hover for hints', 'Treci cursorul pentru indicii')}</span>
            </div>
          )}

          <ExerciseFilesList files={ex.files} t={t} />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 p-3 flex-wrap" style={{ borderTop: '1px solid var(--theme-border)', background: 'var(--theme-sidebar-bg)' }}>
        <button
          onClick={() => switchExercise(Math.max(0, currentIdx - 1))}
          disabled={currentIdx === 0}
          className="px-3 py-1.5 text-sm font-medium rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80"
          style={{ background: 'var(--theme-content-bg)', color: 'var(--theme-text)' }}
        >
          ← {t('Prev', 'Anterior')}
        </button>
        <button
          onClick={() => switchExercise(Math.min(exercises.length - 1, currentIdx + 1))}
          disabled={currentIdx === exercises.length - 1}
          className="px-3 py-1.5 text-sm font-medium rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80"
          style={{ background: 'var(--theme-content-bg)', color: 'var(--theme-text)' }}
        >
          {t('Next', 'Următor')} →
        </button>

        <div className="flex-1" />

        {ex.checkScript && (
          <button
            onClick={check}
            disabled={checking || !booted}
            className="px-4 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {checking ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
                {t('Checking...', 'Se verifică...')}
              </span>
            ) : t('Check', 'Verifică')}
          </button>
        )}

        {/* Reset dropdown */}
        <div className="relative">
          <button
            onClick={() => setResetMenuOpen(!resetMenuOpen)}
            disabled={!booted}
            className="px-4 py-1.5 text-sm font-medium bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('Reset', 'Resetează')} ▾
          </button>
          {resetMenuOpen && (
            <div className="absolute bottom-full mb-1 right-0 w-48 rounded-lg shadow-lg border overflow-hidden z-20" style={{ background: 'var(--theme-content-bg)', borderColor: 'var(--theme-border)' }}>
              <button
                onClick={resetExercise}
                className="w-full px-3 py-2 text-sm text-left hover:bg-blue-50 dark:hover:bg-blue-950/20 transition"
              >
                {t('Reset Exercise', 'Resetează exercițiul')}
                <span className="block text-xs opacity-50">{t('Re-inject files (~0.5s)', 'Reinjectează fișierele (~0.5s)')}</span>
              </button>
              <button
                onClick={resetVM}
                className="w-full px-3 py-2 text-sm text-left hover:bg-red-50 dark:hover:bg-red-950/20 transition border-t"
                style={{ borderColor: 'var(--theme-border)' }}
              >
                {t('Reset VM', 'Resetează VM')}
                <span className="block text-xs opacity-50">{t('Full reboot (~5s)', 'Repornire completă (~5s)')}</span>
              </button>
            </div>
          )}
        </div>

        {ex.solution && (
          <button
            onClick={() => setShowSolution(!showSolution)}
            className="px-4 py-1.5 text-sm font-medium bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
          >
            {showSolution ? t('Hide Solution', 'Ascunde soluția') : t('Show Solution', 'Arată soluția')}
          </button>
        )}
      </div>

      {/* Check result banner */}
      {checkResult !== null && (
        <div className={`p-3 text-sm font-medium ${
          checkResult.passed
            ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400'
            : 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400'
        }`} style={{ borderTop: '1px solid var(--theme-border)' }}>
          {checkResult.passed
            ? t('Correct! Task completed.', 'Corect! Sarcină finalizată.')
            : t('Not quite — try again.', 'Nu exact — încearcă din nou.')}
          {checkResult.feedback && (
            <p className="text-xs mt-1 opacity-70 font-mono">{checkResult.feedback}</p>
          )}
        </div>
      )}

      {/* Solution */}
      {showSolution && ex.solution && (
        <div className="p-3 animate-slide-down" style={{ borderTop: '1px solid var(--theme-border)' }}>
          <p className="text-xs font-medium mb-2 opacity-60">{t('Solution:', 'Soluția:')}</p>
          <Code>{ex.solution}</Code>
        </div>
      )}
    </div>
  );
}
