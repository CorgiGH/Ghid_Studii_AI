import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Code } from './index';
import { injectFiles, runCheck } from '../../utils/v86Exec';
import useV86 from '../../hooks/useV86';

/* ── Hint — proper button, keyboard + Escape + viewport-safe ── */
function Hint({ children, label }) {
  const [show, setShow] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!show) return;
    const onPointer = (e) => { if (ref.current && !ref.current.contains(e.target)) setShow(false); };
    const onKey = (e) => { if (e.key === 'Escape') setShow(false); };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [show]);

  return (
    <span ref={ref} className="relative inline-block">
      <button
        type="button"
        aria-label={label || 'Hint'}
        aria-expanded={show}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium transition hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}
        onClick={() => setShow(s => !s)}
      >
        💡 {label}
      </button>
      {show && (
        <span
          role="tooltip"
          className="absolute left-0 top-full mt-1 z-20 p-2 rounded-lg shadow-lg border text-sm animate-slide-down"
          style={{
            background: 'var(--theme-content-bg)',
            color: 'var(--theme-text)',
            borderColor: 'var(--theme-border)',
            maxWidth: 'min(14rem, calc(100vw - 2rem))',
            width: 'max-content',
          }}
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

/* ── BootOverlay driven by real v86 boot stages ── */
function BootOverlay({ bootStage, t }) {
  const messages = {
    idle: t('Preparing terminal...', 'Se pregătește terminalul...'),
    script: t('Loading v86 runtime...', 'Se încarcă runtime-ul v86...'),
    emulator: t('Starting Linux kernel...', 'Se pornește kernelul Linux...'),
    login: t('Logging in...', 'Se autentifică...'),
    ready: t('Almost ready...', 'Aproape gata...'),
  };
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-10" style={{ background: 'rgba(10,10,20,0.92)' }}>
      <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mb-4" />
      <p className="text-sm text-gray-300 font-mono">{messages[bootStage] || messages.idle}</p>
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
  const { exec, booted, booting, bootStage, boot } = useV86(screenRef);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [checkResult, setCheckResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [injecting, setInjecting] = useState(false);
  const [resetMenuOpen, setResetMenuOpen] = useState(false);
  const [resetVMConfirming, setResetVMConfirming] = useState(false);
  // Per-exercise tracking — count failed attempts so solution gate requires genuine struggle
  const [attempts, setAttempts] = useState({}); // { idx: count }
  const [completed, setCompleted] = useState({});
  const attemptCount = attempts[currentIdx] || 0;
  const hasAttempted = attemptCount >= 2 || !!completed[currentIdx];

  const ex = exercises?.[currentIdx];

  // Boot v86 on mount
  useEffect(() => {
    if (screenRef.current && !booted && !booting) boot();
  }, [boot, booted, booting]);

  // Track previous exercise's manifest so we only remove its files, not user work
  const prevManifestRef = useRef(null);

  // Inject files when exercise changes or VM boots — scoped cleanup (not blanket rm -rf)
  useEffect(() => {
    if (!booted || !exec.current) return;
    let cancelled = false;
    setInjecting(true);

    // Remove ONLY the previous exercise's seeded files/dirs (if any).
    // User-created files outside the previous manifest are preserved.
    const prevManifest = prevManifestRef.current;
    const cleanupCmds = [];
    if (prevManifest) {
      for (const path of Object.keys(prevManifest)) {
        cleanupCmds.push(`rm -rf "${path}"`);
      }
    }
    const cleanup = cleanupCmds.length
      ? exec.current(cleanupCmds.join(' && ') + ' 2>/dev/null; cd /root').catch(() => {})
      : Promise.resolve();

    cleanup.then(() => {
      if (cancelled) return;
      if (!ex?.files || Object.keys(ex.files).length === 0) {
        prevManifestRef.current = null;
        setInjecting(false);
        return;
      }
      prevManifestRef.current = ex.files;
      return injectFiles(exec.current, ex.files);
    }).then(() => {
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
    setChecking(false);
    setShowSolution(false);
    setResetMenuOpen(false);
    setResetVMConfirming(false);
  };

  // Track current index via ref so async check can detect stale results
  const idxRef = useRef(currentIdx);
  idxRef.current = currentIdx;

  const check = useCallback(async () => {
    if (!exec.current || !ex?.checkScript) return;
    const checkIdx = currentIdx;
    setChecking(true);
    setCheckResult(null);
    const minDelay = new Promise(r => setTimeout(r, 300));
    try {
      const [result] = await Promise.all([
        runCheck(exec.current, ex.checkScript, ex.checkTimeout || 5000),
        minDelay,
      ]);
      // Bail if user switched exercises during the check
      if (idxRef.current !== checkIdx) return;
      // Surface timeouts distinctly so students don't think correct work "failed"
      if (result.timedOut) {
        setCheckResult({
          passed: false,
          feedback: t(
            'Check timed out — the VM took too long to respond. Try again; if this persists, use Reset VM.',
            'Verificarea a expirat — VM-ul a răspuns prea încet. Încearcă din nou; dacă persistă, folosește Reset VM.'
          ),
          timedOut: true,
        });
      } else {
        setCheckResult(result);
        if (result.passed) {
          setCompleted(prev => ({ ...prev, [checkIdx]: true }));
        } else {
          // Only count GENUINE failed attempts — check ran and reported a real result
          setAttempts(prev => ({ ...prev, [checkIdx]: (prev[checkIdx] || 0) + 1 }));
        }
      }
    } catch {
      if (idxRef.current !== checkIdx) return;
      setCheckResult({ passed: false, feedback: '' });
    }
    if (idxRef.current === checkIdx) setChecking(false);
  }, [ex, currentIdx, t]);

  const resetExercise = useCallback(async () => {
    if (!exec.current || !ex?.files || Object.keys(ex.files).length === 0) return;
    setCheckResult(null);
    setResetMenuOpen(false);
    setInjecting(true);
    try { await injectFiles(exec.current, ex.files); } catch { /* best effort */ }
    setInjecting(false);
  }, [ex]);

  // Inline themed two-step confirm for Reset VM
  const resetVMRequest = useCallback(() => {
    setResetVMConfirming(true);
  }, []);
  const resetVMExecute = useCallback(() => {
    setResetMenuOpen(false);
    setResetVMConfirming(false);
    setCheckResult(null);
    window.location.reload();
  }, []);

  // U6: scroll solution into view
  useEffect(() => {
    if (showSolution && solutionRef.current) {
      solutionRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [showSolution]);

  // P1: failure hint — show exercise-specific hint on fail, or generic message
  const failMessage = checkResult && !checkResult.passed
    ? (checkResult.feedback || ex?.failureHint?.(t) || t('Not quite — try again.', 'Nu exact — încearcă din nou.'))
    : null;

  // Guard after all hooks — safe position
  if (!exercises || exercises.length === 0 || !ex) return null;

  return (
    <div className="border rounded-xl mb-6" style={{ borderColor: 'var(--theme-border)', overflow: 'clip' }}>
      {/* Exercise selector — sticky top with full ARIA tabs pattern */}
      <div
        role="tablist"
        aria-label={t('Exercises', 'Exerciții')}
        className="sticky top-0 z-30 flex items-center gap-1 p-2 overflow-x-auto"
        style={{ background: 'var(--theme-sidebar-bg)', borderBottom: '1px solid var(--theme-border)' }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Home' || e.key === 'End') {
            e.preventDefault();
            let next = currentIdx;
            if (e.key === 'ArrowLeft') next = Math.max(0, currentIdx - 1);
            if (e.key === 'ArrowRight') next = Math.min(exercises.length - 1, currentIdx + 1);
            if (e.key === 'Home') next = 0;
            if (e.key === 'End') next = exercises.length - 1;
            switchExercise(next);
            // Move focus to the newly-selected tab button
            const newTab = e.currentTarget.children[next];
            if (newTab) requestAnimationFrame(() => newTab.focus());
          }
        }}
      >
        {exercises.map((e, i) => {
          const topic = e.topic || null;
          return (
            <button
              key={i}
              role="tab"
              aria-selected={i === currentIdx}
              tabIndex={i === currentIdx ? 0 : -1}
              onClick={() => switchExercise(i)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                i === currentIdx ? 'bg-blue-600 text-white' : 'hover:opacity-80'
              }`}
              style={i !== currentIdx ? { background: 'var(--theme-content-bg)', color: 'var(--theme-text)' } : undefined}
            >
              {completed[i] && <span className="mr-1" style={{ color: '#22c55e' }}>✓</span>}
              {t('Ex', 'Ex')} {i + 1}
              {topic && <span className="ml-1 opacity-70">· {topic}</span>}
            </button>
          );
        })}
      </div>

      {/* Two-column layout — reversed on mobile so instructions show first */}
      <div className="flex flex-col-reverse lg:flex-row">
        {/* Terminal — U8: reduced clamp */}
        <div className="flex-1 min-w-0 relative">
          <div
            ref={screenRef}
            className="v86-screen relative"
            style={{
              width: '100%',
              height: 'clamp(320px, 50vh, 600px)',
              overflow: 'hidden',
              background: '#0a0a14',
            }}
          />
          {/* V1: softer boot overlay with progress stages */}
          {!booted && <BootOverlay bootStage={bootStage} t={t} />}
          {injecting && booted && (
            <div className="absolute bottom-2 left-2 z-10 px-2 py-1 rounded bg-blue-900/80 text-xs text-blue-200 font-mono">
              {t('Loading files...', 'Se încarcă fișierele...')}
            </div>
          )}
        </div>

        {/* Instructions panel — U2: max-h-none on mobile, constrained on desktop */}
        <div
          className="w-full lg:w-96 border-b lg:border-b-0 lg:border-l p-4 max-h-none lg:max-h-[calc(100vh-200px)] overflow-y-auto"
          style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-sidebar-bg)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--theme-muted)' }}>
              {t('Exercise', 'Exercițiu')} {currentIdx + 1}/{exercises.length}
            </h4>
            {ex.courseRef && (
              <span
                className="text-xs px-2 py-0.5 rounded-full border"
                style={{
                  background: 'rgba(168, 85, 247, 0.15)',
                  color: 'var(--theme-text)',
                  borderColor: 'rgba(168, 85, 247, 0.4)',
                }}
              >
                📘 {ex.courseRef}
              </span>
            )}
          </div>

          <p className="text-sm mb-3">{ex.description}</p>

          {ex.hints && ex.hints.length > 0 && (
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {ex.hints.map((hint, i) => (
                <Hint key={i} label={`${t('Hint', 'Indiciu')} ${i + 1}`}>{hint}</Hint>
              ))}
            </div>
          )}

          <ExerciseFilesList files={ex.files} t={t} />
        </div>
      </div>

      {/* Check result banner — aria-live so screen readers announce pass/fail */}
      {checkResult !== null && (
        <div
          role={checkResult.passed ? 'status' : 'alert'}
          aria-live="polite"
          aria-atomic="true"
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

      {/* Controls — sticky on mobile above BottomTabBar (~64px + safe area), static on desktop */}
      <div
        className="sticky lg:static z-30"
        style={{
          borderTop: '1px solid var(--theme-border)',
          background: 'var(--theme-sidebar-bg)',
          bottom: 'calc(64px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3">
          {/* Nav buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => switchExercise(Math.max(0, currentIdx - 1))}
              disabled={currentIdx === 0}
              className="flex-1 sm:flex-none px-3 py-2 text-sm font-medium rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              style={{ background: 'var(--theme-content-bg)', color: 'var(--theme-text)' }}
            >
              ← {t('Prev', 'Anterior')}
            </button>
            <button
              onClick={() => switchExercise(Math.min(exercises.length - 1, currentIdx + 1))}
              disabled={currentIdx === exercises.length - 1}
              className="flex-1 sm:flex-none px-3 py-2 text-sm font-medium rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              style={{ background: 'var(--theme-content-bg)', color: 'var(--theme-text)' }}
            >
              {t('Next', 'Următor')} →
            </button>
          </div>

          <div className="hidden sm:block flex-1" />

          {/* Action buttons — V4: visual hierarchy Check(primary) > Reset(secondary) > Solution(tertiary) */}
          <div className="grid grid-cols-3 gap-2 sm:flex">
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
                className="w-full px-4 py-2 text-sm font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                style={{ background: 'color-mix(in srgb, var(--theme-sidebar-bg), #6b7280 30%)', color: 'var(--theme-text)' }}
              >
                {t('Reset', 'Resetează')} ▾
              </button>
              {resetMenuOpen && (
                <div className="absolute bottom-full mb-1 right-0 rounded-lg shadow-lg border overflow-hidden z-40" style={{ background: 'var(--theme-content-bg)', borderColor: 'var(--theme-border)', width: 'min(14rem, calc(100vw - 2rem))' }}>
                  {!resetVMConfirming ? (
                    <>
                      <button
                        onClick={resetExercise}
                        className="w-full px-3 py-2 text-sm text-left transition hover:opacity-80"
                        style={{ color: 'var(--theme-text)' }}
                      >
                        {t('Reset Exercise', 'Resetează exercițiul')}
                        <span className="block text-xs opacity-50">{t('Re-inject files (~0.5s)', 'Reinjectează fișierele (~0.5s)')}</span>
                      </button>
                      <button
                        onClick={resetVMRequest}
                        className="w-full px-3 py-2 text-sm text-left transition border-t hover:opacity-80"
                        style={{ borderColor: 'var(--theme-border)', color: '#dc2626' }}
                      >
                        {t('Reset VM', 'Resetează VM')}
                        <span className="block text-xs opacity-50" style={{ color: 'var(--theme-muted)' }}>{t('Full reboot (~5s)', 'Repornire completă (~5s)')}</span>
                      </button>
                    </>
                  ) : (
                    <div className="p-3">
                      <p className="text-xs mb-2" style={{ color: 'var(--theme-text)' }}>
                        {t('This will reload the page and reset all progress. Continue?', 'Aceasta va reîncărca pagina și va reseta tot progresul. Continuați?')}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setResetVMConfirming(false)}
                          className="flex-1 px-2 py-1 text-xs rounded transition hover:opacity-80"
                          style={{ background: 'var(--theme-content-bg)', border: '1px solid var(--theme-border)', color: 'var(--theme-text)' }}
                        >
                          {t('Cancel', 'Anulează')}
                        </button>
                        <button
                          onClick={resetVMExecute}
                          className="flex-1 px-2 py-1 text-xs text-white rounded transition hover:opacity-80"
                          style={{ background: '#dc2626' }}
                        >
                          {t('Reset', 'Resetează')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Solution gated behind 2 genuine attempts (skip gate if no checkScript) */}
            {ex.solution && (() => {
              const gated = !hasAttempted && !showSolution && !!ex.checkScript;
              const baseLabel = showSolution ? t('Hide Solution', 'Ascunde soluția') : t('Show Solution', 'Arată soluția');
              const label = gated ? `${baseLabel} (${attemptCount}/2)` : baseLabel;
              return (
                <button
                  onClick={() => setShowSolution(!showSolution)}
                  disabled={gated}
                  className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-lg transition border disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  style={{ borderColor: 'var(--theme-border)', background: 'transparent', color: 'var(--theme-text)' }}
                  aria-label={gated ? t('Show Solution (locked — try twice first)', 'Arată soluția (blocat — încearcă de două ori mai întâi)') : baseLabel}
                >
                  {gated && <span aria-hidden="true" className="mr-1">🔒</span>}
                  {label}
                </button>
              );
            })()}
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
