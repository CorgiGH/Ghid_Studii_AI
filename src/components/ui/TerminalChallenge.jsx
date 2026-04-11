import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Code } from './index';
import { injectFiles, runCheck } from '../../utils/v86Exec';
import useV86 from '../../hooks/useV86';

/* ── U1+P8: Hint — tap OR hover, works on mobile ── */
function Hint({ children }) {
  const [show, setShow] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!show) return;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setShow(false); };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [show]);

  return (
    <span ref={ref} className="relative inline-block">
      <span
        role="button"
        aria-label="Hint"
        className="cursor-help text-blue-500 hover:text-blue-400 transition text-sm"
        onClick={() => setShow(s => !s)}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        💡
      </span>
      {show && (
        <span
          className="absolute left-6 top-0 z-20 w-56 p-2 rounded-lg shadow-lg border text-sm animate-slide-down"
          style={{ background: 'var(--theme-content-bg)', color: 'var(--theme-text)', borderColor: 'var(--theme-border)' }}
        >
          {children}
        </span>
      )}
    </span>
  );
}

/* ── Exercise file list (collapsible) ── */
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

/* ── U9: Boot progress stages ── */
function BootOverlay({ booting, t }) {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 3000);
    const t2 = setTimeout(() => setStage(2), 8000);
    const t3 = setTimeout(() => setStage(3), 13000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);
  const messages = [
    booting ? t('Booting Linux...', 'Se pornește Linux...') : t('Preparing terminal...', 'Se pregătește terminalul...'),
    t('Loading system image...', 'Se încarcă imaginea sistemului...'),
    t('Starting kernel...', 'Se pornește kernelul...'),
    t('Almost ready...', 'Aproape gata...'),
  ];
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-10" style={{ background: 'rgba(10,10,20,0.92)' }}>
      <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mb-4" />
      <p className="text-sm text-gray-300 font-mono">{messages[stage]}</p>
      <p className="text-xs text-gray-500 mt-2">
        {t('This may take a few seconds on first load', 'Poate dura câteva secunde la prima încărcare')}
      </p>
    </div>
  );
}

export default function TerminalChallenge({ exercises }) {
  const { t } = useApp();
  const screenRef = useRef(null);
  const solutionRef = useRef(null);
  const resetRef = useRef(null);
  const { exec, booted, booting, boot } = useV86(screenRef);

  // #3: guard against empty exercises
  if (!exercises || exercises.length === 0) return null;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [checkResult, setCheckResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [injecting, setInjecting] = useState(false);
  const [resetMenuOpen, setResetMenuOpen] = useState(false);
  const [hasAttempted, setHasAttempted] = useState(false);
  // U7+V3: track completed exercises
  const [completed, setCompleted] = useState({});

  const ex = exercises[currentIdx];

  // Boot v86 on mount
  useEffect(() => {
    if (screenRef.current && !booted && !booting) boot();
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

  // U5: click-outside to dismiss reset dropdown
  useEffect(() => {
    if (!resetMenuOpen) return;
    const close = (e) => { if (resetRef.current && !resetRef.current.contains(e.target)) setResetMenuOpen(false); };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [resetMenuOpen]);

  const switchExercise = (idx) => {
    setCurrentIdx(idx);
    setCheckResult(null);
    setShowSolution(false);
    setResetMenuOpen(false);
    setHasAttempted(false);
  };

  const check = useCallback(async () => {
    if (!exec.current || !ex.checkScript) return;
    setChecking(true);
    setCheckResult(null);
    setHasAttempted(true);
    const minDelay = new Promise(r => setTimeout(r, 300));
    try {
      const [result] = await Promise.all([
        runCheck(exec.current, ex.checkScript),
        minDelay,
      ]);
      setCheckResult(result);
      if (result.passed) setCompleted(prev => ({ ...prev, [currentIdx]: true }));
    } catch {
      setCheckResult({ passed: false, feedback: '' });
    }
    setChecking(false);
  }, [ex, currentIdx]);

  const resetExercise = useCallback(async () => {
    if (!exec.current || !ex.files || Object.keys(ex.files).length === 0) return;
    setCheckResult(null);
    setResetMenuOpen(false);
    setInjecting(true);
    try { await injectFiles(exec.current, ex.files); } catch { /* best effort */ }
    setInjecting(false);
  }, [ex]);

  // U3: confirm before destructive Reset VM
  const resetVM = useCallback(() => {
    setResetMenuOpen(false);
    if (!window.confirm(t(
      'This will reload the page and reset all progress. Continue?',
      'Aceasta va reîncărca pagina și va reseta tot progresul. Continuați?'
    ))) return;
    setCheckResult(null);
    window.location.reload();
  }, [t]);

  // U6: scroll solution into view
  useEffect(() => {
    if (showSolution && solutionRef.current) {
      solutionRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [showSolution]);

  // P1: failure hint — show exercise-specific hint on fail, or generic message
  const failMessage = checkResult && !checkResult.passed
    ? (checkResult.feedback || ex.failureHint?.(t) || t('Not quite — try again.', 'Nu exact — încearcă din nou.'))
    : null;

  return (
    <div className="border rounded-xl overflow-hidden mb-6" style={{ borderColor: 'var(--theme-border)' }}>
      {/* Exercise selector — sticky top — U4: a11y roles — U7: completion indicators */}
      <div
        role="tablist"
        className="sticky top-0 z-30 flex items-center gap-1 p-2 overflow-x-auto"
        style={{ background: 'var(--theme-sidebar-bg)', borderBottom: '1px solid var(--theme-border)' }}
      >
        {exercises.map((e, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === currentIdx}
            onClick={() => switchExercise(i)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition whitespace-nowrap ${
              i === currentIdx ? 'bg-blue-600 text-white' : 'hover:opacity-80'
            }`}
            style={i !== currentIdx ? { background: 'var(--theme-content-bg)', color: 'var(--theme-text)' } : undefined}
          >
            {completed[i] && <span className="mr-1" style={{ color: '#22c55e' }}>✓</span>}
            {t('Ex', 'Ex')} {i + 1}
          </button>
        ))}
      </div>

      {/* Two-column layout — reversed on mobile so instructions show first */}
      <div className="flex flex-col-reverse lg:flex-row">
        {/* Terminal — U8: reduced clamp */}
        <div className="flex-1 min-w-0 relative">
          <div
            ref={screenRef}
            className="v86-screen"
            style={{
              width: '100%',
              minHeight: 'clamp(320px, 50vh, 600px)',
              maxHeight: 'calc(100vh - 280px)',
              overflow: 'auto',
              background: '#0a0a14',
            }}
          />
          {/* V1: softer boot overlay with progress stages */}
          {!booted && <BootOverlay booting={booting} t={t} />}
          {injecting && booted && (
            <div className="absolute bottom-2 left-2 z-10 px-2 py-1 rounded bg-blue-900/80 text-xs text-blue-200 font-mono">
              {t('Loading files...', 'Se încarcă fișierele...')}
            </div>
          )}
        </div>

        {/* Instructions panel — U2: max-h-none on mobile, constrained on desktop */}
        <div
          className="w-full lg:w-80 border-b lg:border-b-0 lg:border-l p-4 max-h-none lg:max-h-[calc(100vh-200px)] overflow-y-auto"
          style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-sidebar-bg)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--theme-muted)' }}>
              {t('Exercise', 'Exercițiu')} {currentIdx + 1}/{exercises.length}
            </h4>
            {ex.courseRef && (
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'color-mix(in srgb, var(--theme-content-bg), #a855f7 15%)', color: 'var(--theme-text)' }}>
                {ex.courseRef}
              </span>
            )}
          </div>

          <p className="text-sm mb-3">{ex.description}</p>

          {ex.hints && ex.hints.length > 0 && (
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {ex.hints.map((hint, i) => (
                <Hint key={i}>{hint}</Hint>
              ))}
              <span className="text-xs" style={{ color: 'var(--theme-muted)' }}>{t('Tap for hints', 'Atinge pentru indicii')}</span>
            </div>
          )}

          <ExerciseFilesList files={ex.files} t={t} />
        </div>
      </div>

      {/* Check result banner — U10+V7: theme vars */}
      {checkResult !== null && (
        <div
          className="p-3 text-sm font-medium"
          style={{
            borderTop: '1px solid var(--theme-border)',
            background: checkResult.passed
              ? 'color-mix(in srgb, var(--theme-content-bg), #22c55e 10%)'
              : 'color-mix(in srgb, var(--theme-content-bg), #ef4444 10%)',
            color: checkResult.passed ? '#16a34a' : '#dc2626',
          }}
        >
          {checkResult.passed
            ? t('Correct! Task completed.', 'Corect! Sarcină finalizată.')
            : failMessage}
          {checkResult.feedback && !checkResult.passed && failMessage !== checkResult.feedback && (
            <p className="text-xs mt-1 opacity-70 font-mono">{checkResult.feedback}</p>
          )}
        </div>
      )}

      {/* Controls — sticky bottom */}
      <div className="sticky bottom-0 z-30" style={{ borderTop: '1px solid var(--theme-border)', background: 'var(--theme-sidebar-bg)' }}>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3">
          {/* Nav buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => switchExercise(Math.max(0, currentIdx - 1))}
              disabled={currentIdx === 0}
              className="flex-1 sm:flex-none px-3 py-2 text-sm font-medium rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80"
              style={{ background: 'var(--theme-content-bg)', color: 'var(--theme-text)' }}
            >
              ← {t('Prev', 'Anterior')}
            </button>
            <button
              onClick={() => switchExercise(Math.min(exercises.length - 1, currentIdx + 1))}
              disabled={currentIdx === exercises.length - 1}
              className="flex-1 sm:flex-none px-3 py-2 text-sm font-medium rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80"
              style={{ background: 'var(--theme-content-bg)', color: 'var(--theme-text)' }}
            >
              {t('Next', 'Următor')} →
            </button>
          </div>

          <div className="hidden sm:block flex-1" />

          {/* Action buttons — V4: visual hierarchy Check(primary) > Reset(secondary) > Solution(tertiary) */}
          <div className="flex gap-2">
            {ex.checkScript && (
              <button
                onClick={check}
                disabled={checking || !booted}
                className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {checking ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
                    {t('Checking...', 'Se verifică...')}
                  </span>
                ) : t('Check', 'Verifică')}
              </button>
            )}

            {/* Reset dropdown — U5: click-outside — V8: theme vars */}
            <div className="relative flex-1 sm:flex-none" ref={resetRef}>
              <button
                onClick={() => setResetMenuOpen(!resetMenuOpen)}
                disabled={!booted}
                className="w-full px-4 py-2 text-sm font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80"
                style={{ background: 'color-mix(in srgb, var(--theme-sidebar-bg), #6b7280 30%)', color: 'var(--theme-text)' }}
              >
                {t('Reset', 'Resetează')} ▾
              </button>
              {resetMenuOpen && (
                <div className="absolute bottom-full mb-1 right-0 w-48 rounded-lg shadow-lg border overflow-hidden z-40" style={{ background: 'var(--theme-content-bg)', borderColor: 'var(--theme-border)' }}>
                  <button
                    onClick={resetExercise}
                    className="w-full px-3 py-2 text-sm text-left transition hover:opacity-80"
                    style={{ color: 'var(--theme-text)' }}
                  >
                    {t('Reset Exercise', 'Resetează exercițiul')}
                    <span className="block text-xs opacity-50">{t('Re-inject files (~0.5s)', 'Reinjectează fișierele (~0.5s)')}</span>
                  </button>
                  <button
                    onClick={resetVM}
                    className="w-full px-3 py-2 text-sm text-left transition border-t hover:opacity-80"
                    style={{ borderColor: 'var(--theme-border)', color: '#dc2626' }}
                  >
                    {t('Reset VM', 'Resetează VM')}
                    <span className="block text-xs opacity-50" style={{ color: 'var(--theme-muted)' }}>{t('Full reboot (~5s)', 'Repornire completă (~5s)')}</span>
                  </button>
                </div>
              )}
            </div>

            {/* P5: gate solution behind at least one attempt */}
            {ex.solution && (
              <button
                onClick={() => setShowSolution(!showSolution)}
                disabled={!hasAttempted && !showSolution}
                className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-lg transition border disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80"
                style={{ borderColor: 'var(--theme-border)', background: 'transparent', color: 'var(--theme-text)' }}
                title={!hasAttempted ? t('Try checking your answer first', 'Încearcă mai întâi să verifici răspunsul') : ''}
              >
                {showSolution ? t('Hide Solution', 'Ascunde soluția') : t('Show Solution', 'Arată soluția')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Solution — U6: scroll into view */}
      {showSolution && ex.solution && (
        <div ref={solutionRef} className="p-3 animate-slide-down" style={{ borderTop: '1px solid var(--theme-border)' }}>
          <p className="text-xs font-medium mb-2 opacity-60">{t('Solution:', 'Soluția:')}</p>
          <Code>{ex.solution}</Code>
        </div>
      )}
    </div>
  );
}
