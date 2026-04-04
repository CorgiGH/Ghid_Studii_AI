import React, { useState, useCallback } from 'react';
import { useApp } from '../../contexts/AppContext';
import CodeEditor from './CodeEditor';

const JUDGE0_URL = 'https://ce.judge0.com/submissions?base64_encoded=true&wait=true';
const BASH_LANGUAGE_ID = 46;

function toBase64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

function fromBase64(str) {
  if (!str) return str;
  try { return decodeURIComponent(escape(atob(str))); } catch { return atob(str); }
}

function buildBashScript(files) {
  const writeCommands = files.map(f => {
    return `cat > '${f.name}' << '__MFE_EOF__'\n${f.content}\n__MFE_EOF__`;
  }).join('\n\n');

  const hasC = files.some(f => f.name.endsWith('.c'));
  const hasCpp = files.some(f => f.name.endsWith('.cpp'));

  let compileCmd;
  if (hasCpp) {
    compileCmd = "g++ *.cpp -o out 2>&1 && ./out";
  } else if (hasC) {
    compileCmd = "gcc *.c -o out 2>&1 && ./out";
  } else {
    compileCmd = "g++ *.cpp -o out 2>&1 && ./out";
  }

  return `${writeCommands}\n\n${compileCmd}`;
}

export default function MultiFileEditor({ files: initialFiles, expectedOutput, stdin = '' }) {
  const { t, dark } = useApp();
  const [files, setFiles] = useState(initialFiles.map(f => ({ ...f })));
  const [activeIndex, setActiveIndex] = useState(0);
  const [output, setOutput] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkResult, setCheckResult] = useState(null);
  const [renamingIndex, setRenamingIndex] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  const updateFileContent = useCallback((content) => {
    setFiles(prev => prev.map((f, i) => i === activeIndex ? { ...f, content } : f));
  }, [activeIndex]);

  const addFile = () => {
    const name = prompt(t('Enter file name:', 'Introdu numele fișierului:'));
    if (!name || !name.trim()) return;
    setFiles(prev => [...prev, { name: name.trim(), content: '', language: 'cpp' }]);
    setActiveIndex(files.length);
  };

  const deleteFile = (index) => {
    if (files.length <= 1) return;
    if (!confirm(t(`Delete "${files[index].name}"?`, `Ștergi "${files[index].name}"?`))) return;
    setFiles(prev => prev.filter((_, i) => i !== index));
    if (activeIndex >= index && activeIndex > 0) setActiveIndex(activeIndex - 1);
  };

  const startRename = (index) => {
    setRenamingIndex(index);
    setRenameValue(files[index].name);
  };

  const finishRename = () => {
    if (renameValue.trim() && renamingIndex !== null) {
      setFiles(prev => prev.map((f, i) => i === renamingIndex ? { ...f, name: renameValue.trim() } : f));
    }
    setRenamingIndex(null);
    setRenameValue('');
  };

  const run = async () => {
    setLoading(true);
    setOutput(null);
    setError(null);
    setCheckResult(null);
    try {
      const script = buildBashScript(files);
      const res = await fetch(JUDGE0_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_code: toBase64(script),
          language_id: BASH_LANGUAGE_ID,
          stdin: toBase64(stdin),
          cpu_time_limit: 10,
          memory_limit: 131072,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || `API error: ${res.status}`);

      data.stdout = fromBase64(data.stdout);
      data.stderr = fromBase64(data.stderr);
      data.compile_output = fromBase64(data.compile_output);

      if (data.status?.id === 6) {
        setError(data.compile_output || t('Compilation error', 'Eroare de compilare'));
      } else if (data.status?.id === 11 || data.status?.id === 12) {
        setError(data.stderr || t('Runtime error', 'Eroare la execuție'));
      } else if (data.status?.id === 5) {
        setError(t('Time limit exceeded', 'Limita de timp depășită'));
      } else {
        setOutput(data.stdout || '');
        if (data.stderr) setError(data.stderr);
      }
    } catch (e) {
      setError(e.message.startsWith('API error')
        ? e.message
        : t('Network error — check your connection or try again later.', 'Eroare de rețea — verifică conexiunea sau încearcă mai târziu.'));
    }
    setLoading(false);
  };

  const check = () => {
    if (output === null) return;
    setCheckResult(output.trim() === expectedOutput.trim());
  };

  return (
    <div className="border rounded-xl overflow-hidden mb-6" style={{ borderColor: 'var(--theme-border)' }}>
      {/* File tabs */}
      <div
        className="flex items-center gap-0.5 px-2 py-1.5 overflow-x-auto"
        style={{ backgroundColor: 'var(--theme-nav-bg)', borderBottom: '1px solid var(--theme-border)' }}
      >
        {files.map((file, i) => (
          <div
            key={i}
            className="flex items-center gap-1 px-3 py-1 rounded-t text-xs font-mono cursor-pointer transition-colors"
            style={{
              backgroundColor: i === activeIndex ? 'var(--theme-content-bg)' : 'transparent',
              color: i === activeIndex ? '#3b82f6' : 'var(--theme-muted-text)',
              fontWeight: i === activeIndex ? 600 : 400,
            }}
            onClick={() => setActiveIndex(i)}
            onDoubleClick={() => startRename(i)}
          >
            {renamingIndex === i ? (
              <input
                type="text"
                value={renameValue}
                onChange={e => setRenameValue(e.target.value)}
                onBlur={finishRename}
                onKeyDown={e => { if (e.key === 'Enter') finishRename(); if (e.key === 'Escape') setRenamingIndex(null); }}
                className="bg-transparent border-b text-xs font-mono w-24 outline-none"
                style={{ color: 'var(--theme-content-text)', borderColor: '#3b82f6' }}
                autoFocus
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <span>{file.name}</span>
            )}
            {files.length > 1 && (
              <button
                onClick={e => { e.stopPropagation(); deleteFile(i); }}
                className="ml-1 opacity-40 hover:opacity-100 transition-opacity text-xs"
                title={t('Delete file', 'Șterge fișierul')}
              >
                ×
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addFile}
          className="px-2 py-1 text-xs opacity-50 hover:opacity-100 transition-opacity"
          style={{ color: 'var(--theme-content-text)' }}
          title={t('Add file', 'Adaugă fișier')}
        >
          +
        </button>
      </div>

      {/* Editor */}
      <CodeEditor
        value={files[activeIndex]?.content || ''}
        onChange={updateFileContent}
      />

      {/* Controls */}
      <div
        className="flex items-center gap-2 p-3"
        style={{ borderTop: '1px solid var(--theme-border)', backgroundColor: 'var(--theme-nav-bg)' }}
      >
        <button
          onClick={run}
          disabled={loading}
          className="px-4 py-1.5 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? t('Running...', 'Se execută...') : t('Run', 'Rulează')}
        </button>
        {expectedOutput && output !== null && (
          <button
            onClick={check}
            className="px-4 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {t('Check', 'Verifică')}
          </button>
        )}
      </div>

      {/* Output panel */}
      {(output !== null || error) && (
        <div style={{ borderTop: '1px solid var(--theme-border)' }}>
          {error && (
            <pre className="p-3 text-sm font-mono text-red-500 overflow-x-auto whitespace-pre-wrap"
              style={{ backgroundColor: dark ? 'rgba(127,29,29,0.15)' : '#fef2f2' }}>
              {error}
            </pre>
          )}
          {output !== null && (
            <pre className="p-3 text-sm font-mono text-green-400 bg-gray-900 overflow-x-auto whitespace-pre-wrap">
              {output || t('(no output)', '(fără output)')}
            </pre>
          )}
        </div>
      )}

      {/* Check result */}
      {checkResult !== null && (
        <div
          className="p-3 text-sm font-medium"
          style={{
            borderTop: '1px solid var(--theme-border)',
            backgroundColor: checkResult ? (dark ? 'rgba(34,197,94,0.1)' : '#f0fdf4') : (dark ? 'rgba(239,68,68,0.1)' : '#fef2f2'),
            color: checkResult ? (dark ? '#4ade80' : '#15803d') : (dark ? '#f87171' : '#b91c1c'),
          }}
        >
          {checkResult
            ? t('Correct! Output matches expected.', 'Corect! Output-ul corespunde.')
            : t('Incorrect — output does not match expected.', 'Incorect — output-ul nu corespunde.')}
        </div>
      )}
    </div>
  );
}
