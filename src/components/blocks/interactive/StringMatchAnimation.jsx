import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useApp } from '../../../contexts/AppContext';

const COLORS = {
  match: '#22c55e',
  mismatch: '#ef4444',
  comparing: '#f59e0b',
  skip: '#3b82f6',
  found: '#8b5cf6',
  idle: 'var(--theme-border)',
  fallback: '#f97316',
};

const PRESETS = {
  kmp: [
    { text: 'ABABXABABYABABXABABZ', pattern: 'ABABXABABZ' },
    { text: 'AAAAAAAAB', pattern: 'AAAAB' },
    { text: 'ABCABDABCABC', pattern: 'ABCABC' },
  ],
  bm: [
    { text: 'HERE IS A SIMPLE EXAMPLE', pattern: 'EXAMPLE' },
    { text: 'ABCABDABCABC', pattern: 'ABCABC' },
    { text: 'AAAAAAAAAB', pattern: 'AAAB' },
  ],
};

function computeFailure(p) {
  const m = p.length;
  const F = new Array(m).fill(0);
  F[0] = -1;
  let i = 0, j = -1;
  while (i < m - 1) {
    if (j === -1 || p[i] === p[j]) { i++; j++; F[i] = j; }
    else { j = F[j]; }
  }
  return F;
}

function computeLastOcc(p) {
  const last = {};
  for (let j = 0; j < p.length; j++) last[p[j]] = j;
  return last;
}

export default function StringMatchAnimation({ variant = 'kmp' }) {
  const { t } = useApp();
  const presets = PRESETS[variant] || PRESETS.kmp;
  const [presetIdx, setPresetIdx] = useState(0);
  const [text, setText] = useState(presets[0].text);
  const [pattern, setPattern] = useState(presets[0].pattern);
  const [offset, setOffset] = useState(0);
  const [pIdx, setPIdx] = useState(-1);
  const [textColors, setTextColors] = useState({});
  const [patColors, setPatColors] = useState({});
  const [failureArr, setFailureArr] = useState([]);
  const [failureHighlight, setFailureHighlight] = useState(-1);
  const [status, setStatus] = useState('');
  const [log, setLog] = useState([]);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(50);
  const [comparisons, setComparisons] = useState(0);
  const [foundAt, setFoundAt] = useState(null);
  const [stateVars, setStateVars] = useState({});
  const [lastOccTable, setLastOccTable] = useState(null);
  const cancelRef = useRef(false);
  const speedRef = useRef(speed);
  const pauseRef = useRef(false);
  const stepResolveRef = useRef(null);
  const logEndRef = useRef(null);

  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { pauseRef.current = paused; }, [paused]);
  useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [log]);

  const waitForStep = useCallback(() => {
    return new Promise(resolve => {
      if (cancelRef.current) { resolve(); return; }
      if (pauseRef.current) {
        stepResolveRef.current = resolve;
      } else {
        const ms = Math.max(50, 800 - speedRef.current * 7);
        setTimeout(resolve, ms);
      }
    });
  }, []);

  const stepForward = useCallback(() => {
    if (stepResolveRef.current) {
      const r = stepResolveRef.current;
      stepResolveRef.current = null;
      r();
    }
  }, []);

  const addLog = useCallback((msg) => {
    setLog(prev => [...prev.slice(-30), msg]);
  }, []);

  const reset = useCallback(() => {
    cancelRef.current = true;
    if (stepResolveRef.current) { stepResolveRef.current(); stepResolveRef.current = null; }
    setTimeout(() => {
      cancelRef.current = false;
      setOffset(0); setPIdx(-1);
      setTextColors({}); setPatColors({});
      setFailureArr([]); setFailureHighlight(-1);
      setStatus(''); setLog([]);
      setRunning(false); setPaused(false);
      setComparisons(0); setFoundAt(null);
      setStateVars({}); setLastOccTable(null);
    }, 50);
  }, []);

  const selectPreset = useCallback((idx) => {
    const p = (PRESETS[variant] || PRESETS.kmp)[idx];
    setPresetIdx(idx);
    setText(p.text);
    setPattern(p.pattern);
    reset();
  }, [variant, reset]);

  // ── KMP ──
  const runKMP = useCallback(async () => {
    setRunning(true);
    const T = text, P = pattern;
    const n = T.length, m = P.length;
    const F = computeFailure(P);
    setFailureArr(F);
    addLog(t(`Preprocessing: F = [${F.join(', ')}]`, `Preprocesare: F = [${F.join(', ')}]`));
    let comps = 0;

    let i = 0, j = 0;
    setStateVars({ i, j });

    while (i < n && !cancelRef.current) {
      setOffset(i - Math.max(j, 0));
      setStateVars({ i, j });

      if (j === -1) {
        addLog(t(`j = -1 (sentinel), advance: i = ${i + 1}, j = 0`, `j = -1 (santinel\u0103), avans\u0103m: i = ${i + 1}, j = 0`));
        i++; j++;
        setStateVars({ i, j });
        await waitForStep();
        continue;
      }

      // Compare T[i] vs P[j]
      comps++;
      setComparisons(comps);
      const tc = {}; const pc = {};
      for (let k = 0; k < j; k++) { tc[i - j + k] = 'match'; pc[k] = 'match'; }
      tc[i] = 'comparing'; pc[j] = 'comparing';
      setTextColors(tc); setPatColors(pc);
      setPIdx(j);
      setStatus(t(`Comparing T[${i}]='${T[i]}' vs P[${j}]='${P[j]}'`, `Compar\u0103m T[${i}]='${T[i]}' cu P[${j}]='${P[j]}'`));
      await waitForStep();
      if (cancelRef.current) break;

      if (T[i] === P[j]) {
        tc[i] = 'match'; pc[j] = 'match';
        setTextColors({ ...tc }); setPatColors({ ...pc });
        addLog(t(`T[${i}]='${T[i]}' = P[${j}]='${P[j]}' \u2714 match. i=${i + 1}, j=${j + 1}`, `T[${i}]='${T[i]}' = P[${j}]='${P[j]}' \u2714 potrivire. i=${i + 1}, j=${j + 1}`));
        i++; j++;

        if (j === m) {
          setFoundAt(i - m);
          setStatus(t(`Pattern found at index ${i - m}!`, `Pattern g\u0103sit la indexul ${i - m}!`));
          addLog(t(`\u2705 FOUND at offset ${i - m}! (${comps} comparisons)`, `\u2705 G\u0102SIT la offset-ul ${i - m}! (${comps} compara\u021bii)`));
          const ftc = {};
          for (let k = 0; k < m; k++) ftc[i - m + k] = 'found';
          setTextColors(ftc);
          setPatColors(Object.fromEntries(Array.from({ length: m }, (_, k) => [k, 'found'])));
          setStateVars({ i, j, result: `found at ${i - m}` });
          setRunning(false);
          return;
        }
      } else {
        tc[i] = 'mismatch'; pc[j] = 'mismatch';
        setTextColors({ ...tc }); setPatColors({ ...pc });
        setFailureHighlight(j);
        const oldJ = j;
        addLog(t(
          `T[${i}]='${T[i]}' \u2260 P[${j}]='${P[j]}' \u2718 mismatch. F[${j}] = ${F[j]}, so j \u2190 ${F[j]}`,
          `T[${i}]='${T[i]}' \u2260 P[${j}]='${P[j]}' \u2718 nepotrivire. F[${j}] = ${F[j]}, deci j \u2190 ${F[j]}`
        ));
        setStatus(t(
          `Mismatch! F[${j}] = ${F[j]}. Pattern shifts: j = ${F[j]} (border length of P[0..${j - 1}])`,
          `Nepotrivire! F[${j}] = ${F[j]}. Pattern-ul se deplaseaz\u0103: j = ${F[j]} (lungimea border-ului P[0..${j - 1}])`
        ));
        await waitForStep();
        setFailureHighlight(-1);
        j = F[j];
      }
    }

    if (!cancelRef.current) {
      setStatus(t('Pattern not found', 'Pattern-ul nu a fost g\u0103sit'));
      addLog(t(`\u274C Not found (${comps} comparisons)`, `\u274C Neg\u0103sit (${comps} compara\u021bii)`));
      setTextColors({}); setPatColors({});
      setRunning(false);
    }
  }, [text, pattern, waitForStep, addLog, t]);

  // ── Boyer-Moore ──
  const runBM = useCallback(async () => {
    setRunning(true);
    const T = text, P = pattern;
    const n = T.length, m = P.length;
    const lastOcc = computeLastOcc(P);
    setLastOccTable(lastOcc);
    addLog(t(`Preprocessing lastOcc: ${JSON.stringify(lastOcc)}`, `Preprocesare lastOcc: ${JSON.stringify(lastOcc)}`));
    let comps = 0;

    let i = 0;
    while (i <= n - m && !cancelRef.current) {
      setOffset(i);
      const tc = {}; const pc = {};
      setStateVars({ offset: i, j: m - 1 });

      let j = m - 1;
      while (j >= 0 && !cancelRef.current) {
        comps++;
        setComparisons(comps);
        for (let k = j + 1; k < m; k++) { tc[i + k] = 'match'; pc[k] = 'match'; }
        tc[i + j] = 'comparing'; pc[j] = 'comparing';
        setTextColors({ ...tc }); setPatColors({ ...pc });
        setPIdx(j);
        setStateVars({ offset: i, j });
        setStatus(t(`Comparing T[${i + j}]='${T[i + j]}' vs P[${j}]='${P[j]}' (right-to-left)`, `Compar\u0103m T[${i + j}]='${T[i + j]}' cu P[${j}]='${P[j]}' (dreapta-st\u00e2nga)`));
        await waitForStep();
        if (cancelRef.current) break;

        if (T[i + j] === P[j]) {
          tc[i + j] = 'match'; pc[j] = 'match';
          setTextColors({ ...tc }); setPatColors({ ...pc });
          addLog(t(`T[${i + j}]='${T[i + j]}' = P[${j}] \u2714`, `T[${i + j}]='${T[i + j]}' = P[${j}] \u2714`));
          j--;
        } else {
          tc[i + j] = 'mismatch'; pc[j] = 'mismatch';
          setTextColors({ ...tc }); setPatColors({ ...pc });

          const badChar = T[i + j];
          const lo = lastOcc[badChar] !== undefined ? lastOcc[badChar] : -1;
          const shift = Math.max(1, j - lo);
          addLog(t(
            `T[${i + j}]='${badChar}' \u2260 P[${j}]='${P[j]}' \u2718. lastOcc['${badChar}']=${lo === -1 ? 'none(-1)' : lo}. shift = max(1, ${j}-${lo === -1 ? '(-1)' : lo}) = ${shift}`,
            `T[${i + j}]='${badChar}' \u2260 P[${j}]='${P[j]}' \u2718. lastOcc['${badChar}']=${lo === -1 ? 'niciuna(-1)' : lo}. salt = max(1, ${j}-${lo === -1 ? '(-1)' : lo}) = ${shift}`
          ));
          setStatus(t(
            `Bad char '${badChar}': lastOcc=${lo === -1 ? 'none' : lo}, shift by ${shift}. New offset: ${i + shift}`,
            `Caracter r\u0103u '${badChar}': lastOcc=${lo === -1 ? 'niciuna' : lo}, salt cu ${shift}. Offset nou: ${i + shift}`
          ));
          await waitForStep();
          i += shift;
          break;
        }
      }

      if (j < 0) {
        setFoundAt(i);
        setStatus(t(`Pattern found at index ${i}!`, `Pattern g\u0103sit la indexul ${i}!`));
        addLog(t(`\u2705 FOUND at offset ${i}! (${comps} comparisons)`, `\u2705 G\u0102SIT la offset-ul ${i}! (${comps} compara\u021bii)`));
        const ftc = {};
        for (let k = 0; k < m; k++) ftc[i + k] = 'found';
        setTextColors(ftc);
        setPatColors(Object.fromEntries(Array.from({ length: m }, (_, k) => [k, 'found'])));
        setRunning(false);
        return;
      }
    }

    if (!cancelRef.current) {
      setStatus(t('Pattern not found', 'Pattern-ul nu a fost g\u0103sit'));
      addLog(t(`\u274C Not found (${comps} comparisons)`, `\u274C Neg\u0103sit (${comps} compara\u021bii)`));
      setTextColors({}); setPatColors({});
      setRunning(false);
    }
  }, [text, pattern, waitForStep, addLog, t]);

  const start = variant === 'bm' ? runBM : runKMP;
  const cellSize = text.length > 30 ? 'w-5 h-7 text-[9px]' : 'w-7 h-8 text-xs';

  return (
    <div className="rounded-xl p-4 mb-3" style={{ backgroundColor: 'var(--theme-card-bg)', border: '1px solid var(--theme-border)' }}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="text-xs font-bold" style={{ color: 'var(--theme-content-text)' }}>
          {variant === 'bm' ? 'Boyer-Moore' : 'KMP'} {t('Animation', 'Anima\u021bie')}
        </span>
        <div className="flex gap-1 ml-2">
          {presets.map((_, i) => (
            <button key={i} onClick={() => selectPreset(i)} disabled={running}
              className="text-[10px] px-2 py-0.5 rounded cursor-pointer"
              style={{ backgroundColor: presetIdx === i ? '#3b82f6' : 'var(--theme-border)', color: presetIdx === i ? '#fff' : 'var(--theme-muted-text)' }}>
              #{i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {!running ? (
          <button onClick={start}
            className="text-xs px-3 py-1.5 rounded-lg font-semibold cursor-pointer"
            style={{ backgroundColor: '#22c55e', color: '#fff' }}>
            {t('Run', 'Ruleaz\u0103')}
          </button>
        ) : (
          <>
            <button onClick={() => { setPaused(p => !p); if (paused) stepForward(); }}
              className="text-xs px-3 py-1.5 rounded-lg font-semibold cursor-pointer"
              style={{ backgroundColor: paused ? '#f59e0b' : '#3b82f6', color: '#fff' }}>
              {paused ? t('Resume', 'Continu\u0103') : t('Pause', 'Pauz\u0103')}
            </button>
            {paused && (
              <button onClick={stepForward}
                className="text-xs px-3 py-1.5 rounded-lg font-semibold cursor-pointer"
                style={{ backgroundColor: '#8b5cf6', color: '#fff' }}>
                {t('Step \u25B6', 'Pas \u25B6')}
              </button>
            )}
          </>
        )}
        <button onClick={reset}
          className="text-xs px-3 py-1.5 rounded-lg font-semibold cursor-pointer"
          style={{ backgroundColor: 'var(--theme-border)', color: 'var(--theme-content-text)' }}>
          {t('Reset', 'Resetare')}
        </button>

        <div className="flex items-center gap-1 ml-auto">
          <span className="text-[10px]" style={{ color: 'var(--theme-muted-text)' }}>{t('Speed', 'Vitez\u0103')}</span>
          <input type="range" min={0} max={100} value={speed} onChange={e => setSpeed(Number(e.target.value))} className="w-28 h-1 accent-blue-500" />
          <span className="text-[10px] tabular-nums w-8 text-right" style={{ color: 'var(--theme-muted-text)' }}>
            {speed === 0 ? t('Step', 'Pas') : `${speed}%`}
          </span>
        </div>
      </div>

      {/* State variables */}
      <div className="flex flex-wrap gap-3 mb-3 text-[11px] font-mono" style={{ color: 'var(--theme-content-text)' }}>
        {Object.entries(stateVars).map(([k, v]) => (
          <span key={k} className="px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--theme-content-bg)', border: '1px solid var(--theme-border)' }}>
            <span style={{ color: 'var(--theme-muted-text)' }}>{k}=</span><strong>{String(v)}</strong>
          </span>
        ))}
        <span className="px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--theme-content-bg)', border: '1px solid var(--theme-border)' }}>
          <span style={{ color: 'var(--theme-muted-text)' }}>{t('comps', 'comp')}=</span><strong>{comparisons}</strong>
        </span>
      </div>

      {/* Text + Pattern visualization */}
      <div className="overflow-x-auto pb-2">
        {/* T label */}
        <div className="flex gap-[2px] mb-0.5 min-w-max">
          <span className="text-[9px] font-bold w-4 flex-shrink-0" style={{ color: 'var(--theme-muted-text)' }}>T</span>
          {text.split('').map((ch, i) => (
            <div key={i} className={`${cellSize} flex items-center justify-center font-mono font-bold rounded-sm transition-colors duration-150`}
              style={{
                backgroundColor: textColors[i] ? COLORS[textColors[i]] + '30' : 'transparent',
                color: textColors[i] ? COLORS[textColors[i]] : 'var(--theme-content-text)',
                border: textColors[i] ? `1px solid ${COLORS[textColors[i]]}` : '1px solid transparent',
              }}>
              {ch}
            </div>
          ))}
        </div>
        {/* Indices */}
        <div className="flex gap-[2px] mb-1 min-w-max">
          <span className="w-4 flex-shrink-0" />
          {text.split('').map((_, i) => (
            <div key={i} className={`${cellSize} flex items-center justify-center text-[7px]`} style={{ color: 'var(--theme-muted-text)' }}>
              {i}
            </div>
          ))}
        </div>
        {/* P label + pattern */}
        <div className="flex gap-[2px] min-w-max">
          <span className="text-[9px] font-bold w-4 flex-shrink-0" style={{ color: 'var(--theme-muted-text)' }}>P</span>
          {text.split('').map((_, i) => {
            const pi = i - offset;
            if (pi < 0 || pi >= pattern.length) return <div key={i} className={cellSize} />;
            return (
              <div key={i} className={`${cellSize} flex items-center justify-center font-mono font-bold rounded-sm transition-colors duration-150`}
                style={{
                  backgroundColor: patColors[pi] ? COLORS[patColors[pi]] + '30' : 'var(--theme-border)',
                  color: patColors[pi] ? COLORS[patColors[pi]] : 'var(--theme-content-text)',
                  border: patColors[pi] ? `1px solid ${COLORS[patColors[pi]]}` : '1px solid var(--theme-border)',
                }}>
                {pattern[pi]}
              </div>
            );
          })}
        </div>
      </div>

      {/* KMP: Failure function table */}
      {variant === 'kmp' && failureArr.length > 0 && (
        <div className="mt-3 overflow-x-auto">
          <div className="text-[10px] font-bold mb-1" style={{ color: 'var(--theme-muted-text)' }}>
            {t('Failure function F[]', 'Func\u021bia de e\u0219ec F[]')}
          </div>
          <div className="flex gap-[2px] min-w-max">
            {pattern.split('').map((ch, i) => (
              <div key={i} className="flex flex-col items-center gap-[1px]">
                <div className="w-7 h-5 flex items-center justify-center text-[9px] font-mono font-bold rounded-t-sm"
                  style={{ backgroundColor: 'var(--theme-content-bg)', color: 'var(--theme-content-text)', border: '1px solid var(--theme-border)' }}>
                  {ch}
                </div>
                <div className={`w-7 h-5 flex items-center justify-center text-[9px] font-mono font-bold rounded-b-sm transition-colors duration-200`}
                  style={{
                    backgroundColor: failureHighlight === i ? COLORS.fallback + '30' : 'var(--theme-content-bg)',
                    color: failureHighlight === i ? COLORS.fallback : '#3b82f6',
                    border: `1px solid ${failureHighlight === i ? COLORS.fallback : 'var(--theme-border)'}`,
                  }}>
                  {failureArr[i]}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-[2px] min-w-max mt-0.5">
            {pattern.split('').map((_, i) => (
              <div key={i} className="w-7 text-center text-[7px]" style={{ color: 'var(--theme-muted-text)' }}>{i}</div>
            ))}
          </div>
        </div>
      )}

      {/* BM: lastOcc table */}
      {variant === 'bm' && lastOccTable && (
        <div className="mt-3 overflow-x-auto">
          <div className="text-[10px] font-bold mb-1" style={{ color: 'var(--theme-muted-text)' }}>
            {t('Last occurrence table', 'Tabela ultimei apari\u021bii')}
          </div>
          <div className="flex gap-[2px] min-w-max">
            {Object.entries(lastOccTable).map(([ch, idx]) => (
              <div key={ch} className="flex flex-col items-center gap-[1px]">
                <div className="w-7 h-5 flex items-center justify-center text-[9px] font-mono font-bold rounded-t-sm"
                  style={{ backgroundColor: 'var(--theme-content-bg)', color: 'var(--theme-content-text)', border: '1px solid var(--theme-border)' }}>
                  {ch}
                </div>
                <div className="w-7 h-5 flex items-center justify-center text-[9px] font-mono font-bold rounded-b-sm"
                  style={{ backgroundColor: 'var(--theme-content-bg)', color: '#3b82f6', border: '1px solid var(--theme-border)' }}>
                  {idx}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status line */}
      {status && (
        <div className="mt-3 text-[11px] font-mono p-2 rounded-lg" style={{ backgroundColor: 'var(--theme-content-bg)', color: foundAt !== null ? COLORS.found : 'var(--theme-content-text)', border: '1px solid var(--theme-border)' }}>
          {status}
        </div>
      )}

      {/* Step log */}
      {log.length > 0 && (
        <div className="mt-3">
          <div className="text-[10px] font-bold mb-1" style={{ color: 'var(--theme-muted-text)' }}>
            {t('Step log', 'Jurnal de pa\u0219i')}
          </div>
          <div className="max-h-32 overflow-y-auto rounded-lg p-2 space-y-0.5" style={{ backgroundColor: 'var(--theme-content-bg)', border: '1px solid var(--theme-border)' }}>
            {log.map((entry, i) => (
              <div key={i} className="text-[10px] font-mono" style={{ color: i === log.length - 1 ? 'var(--theme-content-text)' : 'var(--theme-muted-text)' }}>
                <span style={{ color: 'var(--theme-border)' }}>{String(i + 1).padStart(2, '0')}</span> {entry}
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-3">
        {[
          { color: COLORS.comparing, label: t('Comparing', 'Compar\u0103') },
          { color: COLORS.match, label: t('Match', 'Potrivire') },
          { color: COLORS.mismatch, label: t('Mismatch', 'Nepotrivire') },
          { color: COLORS.found, label: t('Found', 'G\u0103sit') },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color }} />
            <span className="text-[10px]" style={{ color: 'var(--theme-muted-text)' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
