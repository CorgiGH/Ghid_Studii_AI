import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import CodeEditor from './CodeEditor';
import { Code } from './index';

const JUDGE0_URL = 'https://ce.judge0.com/submissions?base64_encoded=true&wait=true';
const C_LANGUAGE_ID = 50;

function toBase64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

function fromBase64(str) {
  if (!str) return str;
  try { return decodeURIComponent(escape(atob(str))); } catch { return atob(str); }
}

async function executeCode(sourceCode, stdin = '') {
  const res = await fetch(JUDGE0_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source_code: toBase64(sourceCode),
      language_id: C_LANGUAGE_ID,
      stdin: toBase64(stdin),
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || data.message || `API error: ${res.status}`);
  }

  // Decode base64 fields in response
  data.stdout = fromBase64(data.stdout);
  data.stderr = fromBase64(data.stderr);
  data.compile_output = fromBase64(data.compile_output);
  return data;
}

export default function CodeChallenge({ description, starterCode, expectedOutput, solution, stdin = '' }) {
  const { t } = useApp();
  const [code, setCode] = useState(starterCode || '');
  const [output, setOutput] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkResult, setCheckResult] = useState(null);
  const [showSolution, setShowSolution] = useState(false);

  const run = async () => {
    setLoading(true);
    setOutput(null);
    setError(null);
    setCheckResult(null);
    try {
      const result = await executeCode(code, stdin);
      if (result.status?.id === 6) {
        setError(result.compile_output || t('Compilation error', 'Eroare de compilare'));
      } else if (result.status?.id === 11 || result.status?.id === 12) {
        setError(result.stderr || t('Runtime error', 'Eroare la execuție'));
      } else if (result.status?.id === 5) {
        setError(t('Time limit exceeded', 'Limita de timp depășită'));
      } else {
        setOutput(result.stdout || '');
        if (result.stderr) setError(result.stderr);
      }
    } catch (e) {
      setError(e.message.startsWith('API error') || e.message.startsWith('some ')
        ? e.message
        : t('Network error — check your connection or try again later.', 'Eroare de rețea — verifică conexiunea sau încearcă mai târziu.'));
    }
    setLoading(false);
  };

  const check = () => {
    if (output === null) return;
    const match = output.trim() === expectedOutput.trim();
    setCheckResult(match);
  };

  return (
    <div className="border rounded-xl dark:border-gray-600 overflow-hidden mb-6">
      {/* Problem description */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-600">
        <p className="text-sm font-medium">{description}</p>
        {expectedOutput && (
          <p className="text-xs mt-2 opacity-60">
            {t('Expected output:', 'Output așteptat:')} <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{expectedOutput}</code>
          </p>
        )}
      </div>

      {/* Editor */}
      <CodeEditor value={code} onChange={setCode} />

      {/* Controls */}
      <div className="flex items-center gap-2 p-3 border-t dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
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
            {t('Check Answer', 'Verifică')}
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

      {/* Output panel */}
      {(output !== null || error) && (
        <div className="border-t dark:border-gray-600">
          {error && (
            <pre className="p-3 text-sm font-mono text-red-500 bg-red-50 dark:bg-red-950/30 overflow-x-auto whitespace-pre-wrap">
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
        <div className={`p-3 text-sm font-medium border-t dark:border-gray-600 ${
          checkResult
            ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400'
            : 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400'
        }`}>
          {checkResult
            ? t('Correct! Output matches expected.', 'Corect! Output-ul corespunde.')
            : t('Incorrect — output does not match expected.', 'Incorect — output-ul nu corespunde.')}
        </div>
      )}

      {/* Solution */}
      {showSolution && solution && (
        <div className="border-t dark:border-gray-600 p-3 animate-slide-down">
          <p className="text-xs font-medium mb-2 opacity-60">{t('Model Solution:', 'Soluția model:')}</p>
          <Code>{solution}</Code>
        </div>
      )}
    </div>
  );
}
