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

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

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
    if (j === -1 || p[i] === p[j]) {
      i++; j++;
      F[i] = j;
    } else {
      j = F[j];
    }
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
  const [status, setStatus] = useState('');
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(50);
  const [comparisons, setComparisons] = useState(0);
  const [foundAt, setFoundAt] = useState(null);
  const cancelRef = useRef(false);
  const speedRef = useRef(speed);

  useEffect(() => { speedRef.current = speed; }, [speed]);
  const delay = useCallback(() => sleep(Math.max(20, 350 - speedRef.current * 3)), []);

  const reset = useCallback(() => {
    cancelRef.current = true;
    setTimeout(() => {
      cancelRef.current = false;
      setOffset(0);
      setPIdx(-1);
      setTextColors({});
      setPatColors({});
      setFailureArr([]);
      setStatus('');
      setRunning(false);
      setComparisons(0);
      setFoundAt(null);
    }, 50);
  }, []);

  const selectPreset = useCallback((idx) => {
    const p = (PRESETS[variant] || PRESETS.kmp)[idx];
    setPresetIdx(idx);
    setText(p.text);
    setPattern(p.pattern);
    reset();
  }, [variant, reset]);

  const runKMP = useCallback(async () => {
    setRunning(true);
    const T = text, P = pattern;
    const n = T.length, m = P.length;
    const F = computeFailure(P);
    setFailureArr(F);
    let comps = 0;

    let i = 0, j = 0;
    while (i < n && !cancelRef.current) {
      setOffset(i - j);

      if (j === -1 || T[i] === P[j]) {
        if (j >= 0) {
          comps++;
          setComparisons(comps);
          const tc = {}; const pc = {};
          tc[i] = 'match'; pc[j] = 'match';
          // show previously matched chars
          for (let k = 0; k < j; k++) { tc[i - j + k] = 'match'; pc[k] = 'match'; }
          setTextColors(tc); setPatColors(pc);
          setPIdx(j);
          setStatus(t(`Match: T[${i}]='${T[i]}' = P[${j}]='${P[j]}'`, `Potrivire: T[${i}]='${T[i]}' = P[${j}]='${P[j]}'`));
          await delay();
        }
        i++; j++;
        if (j === m) {
          setFoundAt(i - m);
          setStatus(t(`Pattern found at index ${i - m}!`, `Pattern g\u0103sit la indexul ${i - m}!`));
          const tc = {};
          for (let k = 0; k < m; k++) tc[i - m + k] = 'found';
          setTextColors(tc);
          setPatColors(Object.fromEntries(Array.from({ length: m }, (_, k) => [k, 'found'])));
          setRunning(false);
          return;
        }
      } else {
        if (j > 0) {
          comps++;
          setComparisons(comps);
          const tc = {}; const pc = {};
          // show matched portion
          for (let k = 0; k < j; k++) { tc[i - j + k] = 'match'; pc[k] = 'match'; }
          tc[i] = 'mismatch'; pc[j] = 'mismatch';
          setTextColors(tc); setPatColors(pc);
          setPIdx(j);
          setStatus(t(`Mismatch: T[${i}]='${T[i]}' \u2260 P[${j}]='${P[j]}'. Fallback: j = F[${j}] = ${F[j]}`, `Nepotrivire: T[${i}]='${T[i]}' \u2260 P[${j}]='${P[j]}'. Revenire: j = F[${j}] = ${F[j]}`));
          await delay();
        }
        j = F[j];
      }
    }

    if (!cancelRef.current) {
      setStatus(t('Pattern not found', 'Pattern-ul nu a fost g\u0103sit'));
      setTextColors({});
      setPatColors({});
      setRunning(false);
    }
  }, [text, pattern, delay, t]);

  const runBM = useCallback(async () => {
    setRunning(true);
    const T = text, P = pattern;
    const n = T.length, m = P.length;
    const lastOcc = computeLastOcc(P);
    let comps = 0;

    let i = 0;
    while (i <= n - m && !cancelRef.current) {
      setOffset(i);
      const tc = {}; const pc = {};

      let j = m - 1;
      while (j >= 0 && !cancelRef.current) {
        comps++;
        setComparisons(comps);
        tc[i + j] = 'comparing'; pc[j] = 'comparing';
        setTextColors({ ...tc }); setPatColors({ ...pc });
        setPIdx(j);
        await delay();

        if (T[i + j] === P[j]) {
          tc[i + j] = 'match'; pc[j] = 'match';
          setTextColors({ ...tc }); setPatColors({ ...pc });
          setStatus(t(`Match: T[${i + j}]='${T[i + j]}' = P[${j}]='${P[j]}'`, `Potrivire: T[${i + j}]='${T[i + j]}' = P[${j}]='${P[j]}'`));
          j--;
          await delay();
        } else {
          tc[i + j] = 'mismatch'; pc[j] = 'mismatch';
          setTextColors({ ...tc }); setPatColors({ ...pc });

          const badChar = T[i + j];
          const lo = lastOcc[badChar] !== undefined ? lastOcc[badChar] : -1;
          const shift = Math.max(1, j - lo);
          setStatus(t(
            `Mismatch: T[${i + j}]='${badChar}' \u2260 P[${j}]='${P[j]}'. Last occ of '${badChar}' in P: ${lo === -1 ? 'none' : lo}. Shift: ${shift}`,
            `Nepotrivire: T[${i + j}]='${badChar}' \u2260 P[${j}]='${P[j]}'. Ultima apari\u021bie a '${badChar}' \u00een P: ${lo === -1 ? 'niciuna' : lo}. Salt: ${shift}`
          ));
          await delay();
          i += shift;
          break;
        }
      }

      if (j < 0) {
        setFoundAt(i);
        setStatus(t(`Pattern found at index ${i}!`, `Pattern g\u0103sit la indexul ${i}!`));
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
      setTextColors({});
      setPatColors({});
      setRunning(false);
    }
  }, [text, pattern, delay, t]);

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
            <button
              key={i}
              onClick={() => selectPreset(i)}
              disabled={running}
              className="text-[10px] px-2 py-0.5 rounded cursor-pointer"
              style={{
                backgroundColor: presetIdx === i ? '#3b82f6' : 'var(--theme-border)',
                color: presetIdx === i ? '#fff' : 'var(--theme-muted-text)',
              }}
            >
              #{i + 1}
            </button>
          ))}
        </div>

        <div className="flex gap-1 ml-auto">
          <button
            onClick={start}
            disabled={running}
            className="text-xs px-3 py-1 rounded-lg font-semibold cursor-pointer"
            style={{ backgroundColor: running ? 'var(--theme-border)' : '#22c55e', color: running ? 'var(--theme-muted-text)' : '#fff' }}
          >
            {t('Run', 'Ruleaz\u0103')}
          </button>
          <button
            onClick={reset}
            className="text-xs px-3 py-1 rounded-lg font-semibold cursor-pointer"
            style={{ backgroundColor: 'var(--theme-border)', color: 'var(--theme-content-text)' }}
          >
            {t('Reset', 'Resetare')}
          </button>
        </div>
      </div>

      {/* Speed */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px]" style={{ color: 'var(--theme-muted-text)' }}>{t('Speed', 'Vitez\u0103')}</span>
        <input type="range" min={1} max={100} value={speed} onChange={e => setSpeed(Number(e.target.value))} className="w-24 h-1 accent-blue-500" />
        <span className="text-[10px] ml-auto" style={{ color: 'var(--theme-muted-text)' }}>
          {t('Comparisons', 'Compara\u021bii')}: {comparisons}
        </span>
      </div>

      {/* Text row */}
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-[2px] mb-1 min-w-max">
          {text.split('').map((ch, i) => (
            <div
              key={i}
              className={`${cellSize} flex items-center justify-center font-mono font-bold rounded-sm transition-colors duration-150`}
              style={{
                backgroundColor: textColors[i] ? COLORS[textColors[i]] + '30' : 'transparent',
                color: textColors[i] ? COLORS[textColors[i]] : 'var(--theme-content-text)',
                border: textColors[i] ? `1px solid ${COLORS[textColors[i]]}` : '1px solid transparent',
              }}
            >
              {ch}
            </div>
          ))}
        </div>

        {/* Index labels */}
        <div className="flex gap-[2px] mb-2 min-w-max">
          {text.split('').map((_, i) => (
            <div key={i} className={`${cellSize} flex items-center justify-center text-[8px]`} style={{ color: 'var(--theme-muted-text)' }}>
              {i}
            </div>
          ))}
        </div>

        {/* Pattern row (offset) */}
        <div className="flex gap-[2px] min-w-max">
          {text.split('').map((_, i) => {
            const pi = i - offset;
            if (pi < 0 || pi >= pattern.length) {
              return <div key={i} className={cellSize} />;
            }
            return (
              <div
                key={i}
                className={`${cellSize} flex items-center justify-center font-mono font-bold rounded-sm transition-colors duration-150`}
                style={{
                  backgroundColor: patColors[pi] ? COLORS[patColors[pi]] + '30' : 'var(--theme-border)',
                  color: patColors[pi] ? COLORS[patColors[pi]] : 'var(--theme-content-text)',
                  border: patColors[pi] ? `1px solid ${COLORS[patColors[pi]]}` : '1px solid var(--theme-border)',
                }}
              >
                {pattern[pi]}
              </div>
            );
          })}
        </div>
      </div>

      {/* Failure function (KMP only) */}
      {variant === 'kmp' && failureArr.length > 0 && (
        <div className="mt-3 overflow-x-auto">
          <div className="text-[10px] font-bold mb-1" style={{ color: 'var(--theme-muted-text)' }}>
            F[] = [{failureArr.join(', ')}]
          </div>
        </div>
      )}

      {/* Status */}
      {status && (
        <div className="mt-2 text-[11px] font-mono p-2 rounded-lg" style={{ backgroundColor: 'var(--theme-content-bg)', color: foundAt !== null ? COLORS.found : 'var(--theme-content-text)' }}>
          {status}
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
