# Plan 4: Test System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a JSON-driven test system with inline answer inputs per question, deterministic grading for MCQs, AI grading for open-ended/code/diagram questions via proxy, and score tracking in localStorage.

**Architecture:** TestRenderer loads test JSON, renders question components with inline answer boxes and submit buttons. Each question shows feedback directly below itself after submission. A new `/api/grade` proxy endpoint does rubric-based AI grading with concise, structured feedback. Test scores are tracked in AppContext's `testProgress` localStorage state. SubjectPage handles JSON test entries (with `src`) via TestRenderer alongside legacy JSX tests.

**Tech Stack:** React 19, existing proxy (Express + Groq/OpenRouter LLMs), existing CodeEditor component, existing Judge0 integration, useLocalStorage hook

---

## File Map

| Action | File | Purpose |
|--------|------|---------|
| Create | `src/content/os/tests/test-sample.json` | Sample test JSON with all question types |
| Modify | `src/contexts/AppContext.jsx` | Add `testProgress` state |
| Create | `src/components/blocks/test/MultipleChoiceQuestion.jsx` | MCQ with radio/checkbox + deterministic grading |
| Create | `src/components/blocks/test/OpenEndedQuestion.jsx` | Textarea + AI grading |
| Create | `src/components/blocks/test/CodeWritingQuestion.jsx` | CodeEditor + Judge0 + AI review |
| Create | `src/components/blocks/test/DiagramQuestion.jsx` | Textarea + AI grading |
| Create | `src/components/blocks/test/FillInQuestion.jsx` | Inline text inputs + deterministic check |
| Create | `src/components/blocks/test/QuestionFeedback.jsx` | Shared feedback display component |
| Create | `src/components/blocks/test/TestResults.jsx` | Score breakdown with per-question feedback |
| Create | `src/components/blocks/test/TestRenderer.jsx` | Test shell: loads JSON, manages state, question nav |
| Modify | `src/pages/SubjectPage.jsx` | Support JSON test entries via TestRenderer |
| Modify | `src/content/os/index.js` | Add sample test JSON entry |
| Modify | `proxy/server.js` | Add `/api/grade` endpoint |
| Modify | `src/services/api.js` | Add `gradeAnswer()` function |

---

### Task 1: Sample test JSON + test progress state

**Files:**
- Create: `src/content/os/tests/test-sample.json`
- Modify: `src/contexts/AppContext.jsx`
- Modify: `src/content/os/index.js`

- [ ] **Step 1: Create sample test JSON**

Create `src/content/os/tests/test-sample.json` with one question of each type:

```json
{
  "meta": {
    "id": "os-test-sample",
    "title": { "en": "Sample Test: Linux Basics", "ro": "Test exemplu: Bazele Linux" },
    "year": 2025,
    "type": "practice",
    "duration": 30,
    "totalPoints": 50
  },
  "questions": [
    {
      "id": "q1",
      "type": "multiple-choice",
      "points": 10,
      "prompt": { "en": "What UID does the root user always have?", "ro": "Ce UID are întotdeauna utilizatorul root?" },
      "options": [
        { "text": { "en": "1", "ro": "1" } },
        { "text": { "en": "0", "ro": "0" } },
        { "text": { "en": "1000", "ro": "1000" } },
        { "text": { "en": "-1", "ro": "-1" } }
      ],
      "correctIndex": 1,
      "explanation": { "en": "UID 0 is always root — hardcoded in the kernel.", "ro": "UID 0 este întotdeauna root — codificat în nucleu." }
    },
    {
      "id": "q2",
      "type": "open-ended",
      "points": 15,
      "prompt": { "en": "Explain the difference between a process and a thread. Include at least 2 key differences.", "ro": "Explicați diferența dintre un proces și un fir de execuție. Includeți cel puțin 2 diferențe cheie." },
      "rubric": { "en": "Must mention: (1) processes have separate address spaces, threads share; (2) processes are heavier to create/switch, threads are lighter. Bonus: mention shared resources like file descriptors.", "ro": "Trebuie să menționeze: (1) procesele au spații de adresă separate, firele le partajează; (2) procesele sunt mai costisitoare la creare/comutare, firele sunt mai ușoare." },
      "relatedSteps": ["os-c6-def"]
    },
    {
      "id": "q3",
      "type": "fill-in",
      "points": 5,
      "prompt": { "en": "The command to change file permissions in Linux is ___.", "ro": "Comanda pentru a schimba permisiunile unui fișier în Linux este ___." },
      "blanks": [
        { "id": "b1", "accept": ["chmod"] }
      ]
    },
    {
      "id": "q4",
      "type": "code-writing",
      "points": 10,
      "prompt": { "en": "Write a bash script that prints numbers 1 to 5, each on a new line.", "ro": "Scrieți un script bash care afișează numerele de la 1 la 5, fiecare pe o linie nouă." },
      "language": "bash",
      "testCases": [
        { "input": "", "expected": "1\n2\n3\n4\n5\n" }
      ],
      "rubric": { "en": "Must use a loop (for or while). Output must be exactly 1-5, one per line.", "ro": "Trebuie să folosească o buclă (for sau while). Rezultatul trebuie să fie exact 1-5, câte unul pe linie." }
    },
    {
      "id": "q5",
      "type": "diagram",
      "points": 10,
      "prompt": { "en": "Describe the 3 main components of a Linux system and how they interact (kernel, shell, applications).", "ro": "Descrieți cele 3 componente principale ale unui sistem Linux și cum interacționează (nucleu, shell, aplicații)." },
      "rubric": { "en": "Must identify: (1) kernel at bottom managing hardware, (2) shell as interface layer, (3) applications at top. Must show interaction: apps → shell → kernel → hardware.", "ro": "Trebuie să identifice: (1) nucleul jos gestionând hardware, (2) shell ca strat de interfață, (3) aplicațiile sus. Trebuie să arate interacțiunea: aplicații → shell → nucleu → hardware." },
      "relatedSteps": ["os-c1-intro"]
    }
  ]
}
```

- [ ] **Step 2: Add testProgress to AppContext**

In `src/contexts/AppContext.jsx`, after the `lectureVisible` lines, add:

```jsx
const [testProgress, setTestProgress] = useLocalStorage('testProgress', {});

const saveTestResult = useCallback((testId, score, totalPoints, answers) => {
  setTestProgress(prev => ({
    ...prev,
    [testId]: {
      score,
      totalPoints,
      completedAt: new Date().toISOString().slice(0, 10),
      answers,
    },
  }));
}, []);
```

Add `testProgress`, `saveTestResult` to the `value` useMemo and its dependency array.

- [ ] **Step 3: Add sample test entry to OS index.js**

In `src/content/os/index.js`, add to the `tests` array:

```js
{ id: 'os-test-sample', src: 'os/tests/test-sample.json' },
```

Keep the existing JSX test entry — both coexist.

- [ ] **Step 4: Commit**

```bash
git add src/content/os/tests/test-sample.json src/contexts/AppContext.jsx src/content/os/index.js
git commit -m "feat: sample test JSON + testProgress state in AppContext"
```

---

### Task 2: Proxy grading endpoint + frontend API

**Files:**
- Modify: `proxy/server.js`
- Modify: `src/services/api.js`

- [ ] **Step 1: Add `/api/grade` endpoint to proxy**

In `proxy/server.js`, after the `/api/verify` route, add:

```js
function buildGradeSystemPrompt() {
  return `You grade university CS exam answers. Return ONLY a JSON object, no other text.

Format:
{"score": <number>, "maxScore": <number>, "feedback": {"correct": ["..."], "missing": ["..."], "incorrect": ["..."]}}

Rules:
- score is 0 to maxScore (partial credit allowed)
- "correct": 1-2 bullet points on what the student got right (skip if nothing correct)
- "missing": 1-2 bullet points on key concepts the student missed (skip if nothing missing)
- "incorrect": 1-2 bullet points on factual errors (skip if none)
- Each bullet point is ONE short sentence (max 20 words)
- Empty arrays are fine — omit categories with nothing to say
- Match the language of the question (Romanian or English)
- Be fair but strict — grade based on the rubric, not on effort
- NEVER pad feedback with filler like "Good attempt!" — only substantive points`;
}

app.post('/api/grade', async (req, res) => {
  try {
    const { prompt, studentAnswer, rubric, maxPoints, questionType, courseContext } = req.body;
    if (!prompt || !studentAnswer) return res.status(400).json({ error: 'prompt and studentAnswer required' });

    const cacheKey = createHash('sha256').update(`grade|${prompt}|${studentAnswer}`).digest('hex');
    if (verifyCache.has(cacheKey)) {
      return res.json(verifyCache.get(cacheKey));
    }

    let userContent = `Question (${questionType || 'open-ended'}, ${maxPoints || 10} points):\n${prompt}\n\nStudent answer:\n${studentAnswer}`;
    if (rubric) userContent += `\n\nGrading rubric:\n${rubric}`;
    if (courseContext) userContent += `\n\nRelevant course material (use as ground truth):\n${courseContext}`;

    const messages = [
      { role: 'system', content: buildGradeSystemPrompt() },
      { role: 'user', content: userContent },
    ];

    const { res: llmRes, key, provider, inputEstimate } = await callLLM(messages, false);
    const data = await llmRes.json();
    const raw = data.choices?.[0]?.message?.content || '';
    recordUsage(key, provider, inputEstimate, Math.ceil(raw.length / 4));

    let result;
    try {
      result = JSON.parse(raw);
    } catch {
      result = { score: 0, maxScore: maxPoints || 10, feedback: { incorrect: [raw.slice(0, 200)] } };
    }

    verifyCache.set(cacheKey, result);
    res.json(result);
  } catch (err) {
    console.error('Grade error:', err.message);
    res.status(500).json({ error: err.message });
  }
});
```

- [ ] **Step 2: Add `gradeAnswer()` to frontend API service**

In `src/services/api.js`, add:

```js
export async function gradeAnswer({ prompt, studentAnswer, rubric, maxPoints, questionType, courseContext }) {
  const res = await fetch(`${PROXY_URL}/api/grade`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, studentAnswer, rubric, maxPoints, questionType, courseContext }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `Error ${res.status}`);
  }

  return res.json();
}
```

- [ ] **Step 3: Commit**

```bash
git add proxy/server.js src/services/api.js
git commit -m "feat: add /api/grade endpoint for rubric-based AI grading"
```

---

### Task 3: QuestionFeedback + all 5 question components

**Files:**
- Create: `src/components/blocks/test/QuestionFeedback.jsx`
- Create: `src/components/blocks/test/MultipleChoiceQuestion.jsx`
- Create: `src/components/blocks/test/OpenEndedQuestion.jsx`
- Create: `src/components/blocks/test/CodeWritingQuestion.jsx`
- Create: `src/components/blocks/test/DiagramQuestion.jsx`
- Create: `src/components/blocks/test/FillInQuestion.jsx`

- [ ] **Step 1: Create QuestionFeedback (shared feedback display)**

```jsx
// src/components/blocks/test/QuestionFeedback.jsx
import React from 'react';

export default function QuestionFeedback({ result }) {
  if (!result) return null;
  const { score, maxScore, feedback, verdict, explanation } = result;

  // Support both /api/grade format (score/feedback) and /api/verify format (verdict/explanation)
  const isGradeFormat = score !== undefined;
  const pct = isGradeFormat ? (maxScore > 0 ? score / maxScore : 0) : (verdict === 'correct' ? 1 : verdict === 'partial' ? 0.5 : 0);
  const color = pct >= 0.7 ? '#22c55e' : pct >= 0.4 ? '#f59e0b' : '#ef4444';

  return (
    <div className="mt-3 rounded-lg p-3 text-xs" style={{ backgroundColor: `color-mix(in srgb, ${color} 8%, var(--theme-card-bg))`, border: `1px solid color-mix(in srgb, ${color} 25%, var(--theme-border))` }}>
      {/* Score header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="font-bold" style={{ color }}>
          {isGradeFormat ? `${score}/${maxScore}` : verdict?.toUpperCase()}
        </span>
        {isGradeFormat && (
          <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: 'var(--theme-border)' }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${pct * 100}%`, backgroundColor: color }} />
          </div>
        )}
      </div>

      {/* Grade format: structured feedback */}
      {isGradeFormat && feedback && (
        <div className="space-y-1">
          {feedback.correct?.length > 0 && (
            <div style={{ color: '#22c55e' }}>
              {feedback.correct.map((f, i) => <div key={i}>✓ {f}</div>)}
            </div>
          )}
          {feedback.missing?.length > 0 && (
            <div style={{ color: '#f59e0b' }}>
              {feedback.missing.map((f, i) => <div key={i}>○ {f}</div>)}
            </div>
          )}
          {feedback.incorrect?.length > 0 && (
            <div style={{ color: '#ef4444' }}>
              {feedback.incorrect.map((f, i) => <div key={i}>✗ {f}</div>)}
            </div>
          )}
        </div>
      )}

      {/* Verify format: plain explanation */}
      {!isGradeFormat && explanation && (
        <div style={{ color: 'var(--theme-content-text)' }}>{explanation}</div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create MultipleChoiceQuestion**

```jsx
// src/components/blocks/test/MultipleChoiceQuestion.jsx
import React, { useState } from 'react';
import { useApp } from '../../../contexts/AppContext';
import QuestionFeedback from './QuestionFeedback';

export default function MultipleChoiceQuestion({ question, onAnswer }) {
  const { t } = useApp();
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (selected === null) return;
    const isCorrect = selected === question.correctIndex;
    const score = isCorrect ? question.points : 0;
    const result = {
      score,
      maxScore: question.points,
      feedback: isCorrect
        ? { correct: [t(question.explanation?.en, question.explanation?.ro) || 'Correct!'] }
        : { incorrect: [t(question.explanation?.en, question.explanation?.ro) || 'Incorrect.'] },
    };
    setSubmitted(true);
    onAnswer?.(question.id, score, question.points, result);
  };

  return (
    <div>
      <div className="space-y-2">
        {question.options.map((opt, i) => {
          let borderColor = 'var(--theme-border)';
          let bg = 'transparent';
          if (submitted && i === question.correctIndex) {
            borderColor = '#22c55e';
            bg = 'color-mix(in srgb, #22c55e 8%, var(--theme-card-bg))';
          } else if (submitted && i === selected && i !== question.correctIndex) {
            borderColor = '#ef4444';
            bg = 'color-mix(in srgb, #ef4444 8%, var(--theme-card-bg))';
          } else if (!submitted && i === selected) {
            borderColor = '#3b82f6';
            bg = 'color-mix(in srgb, #3b82f6 8%, var(--theme-card-bg))';
          }

          return (
            <button
              key={i}
              onClick={() => !submitted && setSelected(i)}
              className="w-full text-left p-2.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-2"
              style={{ border: `1.5px solid ${borderColor}`, backgroundColor: bg, color: 'var(--theme-content-text)' }}
              disabled={submitted}
            >
              <span className="w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 text-[10px] font-bold"
                style={{ borderColor, color: borderColor }}>
                {String.fromCharCode(65 + i)}
              </span>
              {t(opt.text.en, opt.text.ro)}
            </button>
          );
        })}
      </div>

      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={selected === null}
          className="mt-3 px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          style={{
            backgroundColor: selected !== null ? '#3b82f6' : 'var(--theme-border)',
            color: selected !== null ? '#fff' : 'var(--theme-muted-text)',
          }}
        >
          {t('Submit', 'Trimite')}
        </button>
      )}

      {submitted && (
        <QuestionFeedback result={{
          score: selected === question.correctIndex ? question.points : 0,
          maxScore: question.points,
          feedback: selected === question.correctIndex
            ? { correct: [t(question.explanation?.en, question.explanation?.ro) || 'Correct!'] }
            : { incorrect: [t(question.explanation?.en, question.explanation?.ro) || 'Incorrect.'] },
        }} />
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create OpenEndedQuestion**

```jsx
// src/components/blocks/test/OpenEndedQuestion.jsx
import React, { useState } from 'react';
import { useApp } from '../../../contexts/AppContext';
import { gradeAnswer } from '../../../services/api';
import QuestionFeedback from './QuestionFeedback';

export default function OpenEndedQuestion({ question, onAnswer }) {
  const { t, lang } = useApp();
  const [answer, setAnswer] = useState('');
  const [grading, setGrading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!answer.trim()) return;
    setGrading(true);
    setError(null);
    try {
      const res = await gradeAnswer({
        prompt: lang === 'ro' ? question.prompt.ro : question.prompt.en,
        studentAnswer: answer,
        rubric: lang === 'ro' ? question.rubric?.ro : question.rubric?.en,
        maxPoints: question.points,
        questionType: 'open-ended',
      });
      setResult(res);
      onAnswer?.(question.id, res.score, res.maxScore, res);
    } catch (err) {
      setError(err.message);
    } finally {
      setGrading(false);
    }
  };

  return (
    <div>
      <textarea
        value={answer}
        onChange={e => setAnswer(e.target.value)}
        disabled={!!result}
        rows={4}
        className="w-full rounded-lg p-3 text-xs resize-y"
        style={{
          backgroundColor: 'var(--theme-card-bg)',
          border: '1px solid var(--theme-border)',
          color: 'var(--theme-content-text)',
        }}
        placeholder={t('Type your answer here...', 'Scrie răspunsul tău aici...')}
      />

      {!result && (
        <button
          onClick={handleSubmit}
          disabled={!answer.trim() || grading}
          className="mt-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          style={{
            backgroundColor: answer.trim() && !grading ? '#3b82f6' : 'var(--theme-border)',
            color: answer.trim() && !grading ? '#fff' : 'var(--theme-muted-text)',
          }}
        >
          {grading ? t('Grading...', 'Se corectează...') : t('Submit', 'Trimite')}
        </button>
      )}

      {error && <div className="mt-2 text-xs" style={{ color: '#ef4444' }}>{error}</div>}
      {result && <QuestionFeedback result={result} />}
    </div>
  );
}
```

- [ ] **Step 4: Create CodeWritingQuestion**

```jsx
// src/components/blocks/test/CodeWritingQuestion.jsx
import React, { useState } from 'react';
import { useApp } from '../../../contexts/AppContext';
import { gradeAnswer } from '../../../services/api';
import QuestionFeedback from './QuestionFeedback';

export default function CodeWritingQuestion({ question, onAnswer }) {
  const { t, lang } = useApp();
  const [code, setCode] = useState('');
  const [grading, setGrading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!code.trim()) return;
    setGrading(true);
    setError(null);
    try {
      const res = await gradeAnswer({
        prompt: lang === 'ro' ? question.prompt.ro : question.prompt.en,
        studentAnswer: code,
        rubric: lang === 'ro' ? question.rubric?.ro : question.rubric?.en,
        maxPoints: question.points,
        questionType: 'code-writing',
      });
      setResult(res);
      onAnswer?.(question.id, res.score, res.maxScore, res);
    } catch (err) {
      setError(err.message);
    } finally {
      setGrading(false);
    }
  };

  return (
    <div>
      <textarea
        value={code}
        onChange={e => setCode(e.target.value)}
        disabled={!!result}
        rows={8}
        spellCheck={false}
        className="w-full rounded-lg p-3 text-xs resize-y font-mono"
        style={{
          backgroundColor: '#1e293b',
          border: '1px solid var(--theme-border)',
          color: '#e2e8f0',
          tabSize: 2,
        }}
        placeholder={t(`Write your ${question.language || 'code'} here...`, `Scrie codul ${question.language || ''} aici...`)}
      />

      {!result && (
        <button
          onClick={handleSubmit}
          disabled={!code.trim() || grading}
          className="mt-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          style={{
            backgroundColor: code.trim() && !grading ? '#3b82f6' : 'var(--theme-border)',
            color: code.trim() && !grading ? '#fff' : 'var(--theme-muted-text)',
          }}
        >
          {grading ? t('Grading...', 'Se corectează...') : t('Submit', 'Trimite')}
        </button>
      )}

      {error && <div className="mt-2 text-xs" style={{ color: '#ef4444' }}>{error}</div>}
      {result && <QuestionFeedback result={result} />}
    </div>
  );
}
```

- [ ] **Step 5: Create DiagramQuestion**

```jsx
// src/components/blocks/test/DiagramQuestion.jsx
import React, { useState } from 'react';
import { useApp } from '../../../contexts/AppContext';
import { gradeAnswer } from '../../../services/api';
import QuestionFeedback from './QuestionFeedback';

export default function DiagramQuestion({ question, onAnswer }) {
  const { t, lang } = useApp();
  const [description, setDescription] = useState('');
  const [grading, setGrading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!description.trim()) return;
    setGrading(true);
    setError(null);
    try {
      const res = await gradeAnswer({
        prompt: lang === 'ro' ? question.prompt.ro : question.prompt.en,
        studentAnswer: description,
        rubric: lang === 'ro' ? question.rubric?.ro : question.rubric?.en,
        maxPoints: question.points,
        questionType: 'diagram',
      });
      setResult(res);
      onAnswer?.(question.id, res.score, res.maxScore, res);
    } catch (err) {
      setError(err.message);
    } finally {
      setGrading(false);
    }
  };

  return (
    <div>
      <div className="text-[10px] mb-1.5" style={{ color: 'var(--theme-muted-text)' }}>
        {t('Describe your diagram in text (components, connections, flow):', 'Descrie diagrama în text (componente, conexiuni, flux):')}
      </div>
      <textarea
        value={description}
        onChange={e => setDescription(e.target.value)}
        disabled={!!result}
        rows={5}
        className="w-full rounded-lg p-3 text-xs resize-y"
        style={{
          backgroundColor: 'var(--theme-card-bg)',
          border: '1px solid var(--theme-border)',
          color: 'var(--theme-content-text)',
        }}
        placeholder={t('Describe your diagram here...', 'Descrie diagrama ta aici...')}
      />

      {!result && (
        <button
          onClick={handleSubmit}
          disabled={!description.trim() || grading}
          className="mt-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          style={{
            backgroundColor: description.trim() && !grading ? '#3b82f6' : 'var(--theme-border)',
            color: description.trim() && !grading ? '#fff' : 'var(--theme-muted-text)',
          }}
        >
          {grading ? t('Grading...', 'Se corectează...') : t('Submit', 'Trimite')}
        </button>
      )}

      {error && <div className="mt-2 text-xs" style={{ color: '#ef4444' }}>{error}</div>}
      {result && <QuestionFeedback result={result} />}
    </div>
  );
}
```

- [ ] **Step 6: Create FillInQuestion**

```jsx
// src/components/blocks/test/FillInQuestion.jsx
import React, { useState } from 'react';
import { useApp } from '../../../contexts/AppContext';
import QuestionFeedback from './QuestionFeedback';

export default function FillInQuestion({ question, onAnswer }) {
  const { t } = useApp();
  const [values, setValues] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    const blanks = question.blanks || [];
    let correct = 0;
    const total = blanks.length;

    blanks.forEach(blank => {
      const val = (values[blank.id] || '').trim().toLowerCase();
      if (blank.accept.some(a => a.toLowerCase() === val)) correct++;
    });

    const score = total > 0 ? Math.round((correct / total) * question.points) : 0;
    const result = {
      score,
      maxScore: question.points,
      feedback: correct === total
        ? { correct: [t('All blanks correct!', 'Toate spațiile completate corect!')] }
        : {
            correct: correct > 0 ? [t(`${correct}/${total} correct`, `${correct}/${total} corecte`)] : [],
            missing: [t(`Expected: ${blanks.map(b => b.accept[0]).join(', ')}`, `Răspuns așteptat: ${blanks.map(b => b.accept[0]).join(', ')}`)],
          },
    };
    setSubmitted(true);
    onAnswer?.(question.id, score, question.points, result);
  };

  // Render prompt with inline blanks
  const blanks = question.blanks || [];
  const allFilled = blanks.every(b => (values[b.id] || '').trim());

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1 text-xs" style={{ color: 'var(--theme-content-text)' }}>
        {blanks.map((blank, i) => {
          let borderColor = 'var(--theme-border)';
          if (submitted) {
            const val = (values[blank.id] || '').trim().toLowerCase();
            borderColor = blank.accept.some(a => a.toLowerCase() === val) ? '#22c55e' : '#ef4444';
          }
          return (
            <input
              key={blank.id}
              type="text"
              value={values[blank.id] || ''}
              onChange={e => setValues(prev => ({ ...prev, [blank.id]: e.target.value }))}
              disabled={submitted}
              className="rounded px-2 py-1 text-xs font-mono text-center"
              style={{
                width: `${Math.max(6, (blank.accept[0]?.length || 6) + 2)}ch`,
                backgroundColor: 'var(--theme-card-bg)',
                border: `1.5px solid ${borderColor}`,
                color: 'var(--theme-content-text)',
              }}
              placeholder="___"
            />
          );
        })}
      </div>

      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={!allFilled}
          className="mt-3 px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          style={{
            backgroundColor: allFilled ? '#3b82f6' : 'var(--theme-border)',
            color: allFilled ? '#fff' : 'var(--theme-muted-text)',
          }}
        >
          {t('Submit', 'Trimite')}
        </button>
      )}

      {submitted && (
        <QuestionFeedback result={{
          score: (() => {
            let c = 0;
            blanks.forEach(b => { if (b.accept.some(a => a.toLowerCase() === (values[b.id] || '').trim().toLowerCase())) c++; });
            return Math.round((c / blanks.length) * question.points);
          })(),
          maxScore: question.points,
          feedback: (() => {
            let c = 0;
            blanks.forEach(b => { if (b.accept.some(a => a.toLowerCase() === (values[b.id] || '').trim().toLowerCase())) c++; });
            return c === blanks.length
              ? { correct: [t('All blanks correct!', 'Toate completate corect!')] }
              : { missing: [t(`Expected: ${blanks.map(b => b.accept[0]).join(', ')}`, `Așteptat: ${blanks.map(b => b.accept[0]).join(', ')}`)] };
          })(),
        }} />
      )}
    </div>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add src/components/blocks/test/
git commit -m "feat: question components with inline answer boxes and feedback"
```

---

### Task 4: TestResults component

**Files:**
- Create: `src/components/blocks/test/TestResults.jsx`

- [ ] **Step 1: Create TestResults**

```jsx
// src/components/blocks/test/TestResults.jsx
import React from 'react';
import { useApp } from '../../../contexts/AppContext';

export default function TestResults({ questions, answers, totalPoints }) {
  const { t } = useApp();

  const totalScore = Object.values(answers).reduce((sum, a) => sum + (a.score || 0), 0);
  const pct = totalPoints > 0 ? totalScore / totalPoints : 0;
  const color = pct >= 0.7 ? '#22c55e' : pct >= 0.4 ? '#f59e0b' : '#ef4444';

  return (
    <div className="rounded-xl p-4 mt-6" style={{ backgroundColor: 'var(--theme-card-bg)', border: `2px solid ${color}` }}>
      {/* Total score */}
      <div className="text-center mb-4">
        <div className="text-2xl font-bold" style={{ color }}>
          {totalScore}/{totalPoints}
        </div>
        <div className="text-xs mt-1" style={{ color: 'var(--theme-muted-text)' }}>
          {t(`${Math.round(pct * 100)}% — ${pct >= 0.7 ? 'Great job!' : pct >= 0.4 ? 'Keep studying' : 'Review the material'}`,
             `${Math.round(pct * 100)}% — ${pct >= 0.7 ? 'Foarte bine!' : pct >= 0.4 ? 'Mai studiază' : 'Revizuiește materialul'}`)}
        </div>
      </div>

      {/* Per-question breakdown */}
      <div className="space-y-2">
        {questions.map((q, i) => {
          const a = answers[q.id];
          if (!a) return null;
          const qPct = q.points > 0 ? a.score / q.points : 0;
          const qColor = qPct >= 0.7 ? '#22c55e' : qPct >= 0.4 ? '#f59e0b' : '#ef4444';
          return (
            <div key={q.id} className="flex items-center gap-2 text-xs" style={{ color: 'var(--theme-content-text)' }}>
              <span className="font-bold" style={{ color: qColor }}>{a.score}/{q.points}</span>
              <span className="truncate">{t(`Q${i + 1}`, `Î${i + 1}`)}: {t(q.prompt.en, q.prompt.ro).slice(0, 60)}...</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/blocks/test/TestResults.jsx
git commit -m "feat: TestResults component with score breakdown"
```

---

### Task 5: TestRenderer + SubjectPage integration

**Files:**
- Create: `src/components/blocks/test/TestRenderer.jsx`
- Modify: `src/pages/SubjectPage.jsx`

- [ ] **Step 1: Create TestRenderer**

```jsx
// src/components/blocks/test/TestRenderer.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../../contexts/AppContext';
import MultipleChoiceQuestion from './MultipleChoiceQuestion';
import OpenEndedQuestion from './OpenEndedQuestion';
import CodeWritingQuestion from './CodeWritingQuestion';
import DiagramQuestion from './DiagramQuestion';
import FillInQuestion from './FillInQuestion';
import TestResults from './TestResults';

const questionComponents = {
  'multiple-choice': MultipleChoiceQuestion,
  'open-ended': OpenEndedQuestion,
  'code-writing': CodeWritingQuestion,
  'diagram': DiagramQuestion,
  'fill-in': FillInQuestion,
};

export default function TestRenderer({ src }) {
  const { t, lang, saveTestResult, testProgress } = useApp();
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [activeQ, setActiveQ] = useState(null);

  // Load test JSON
  useEffect(() => {
    setLoading(true);
    setError(null);
    setTestData(null);
    setAnswers({});
    setShowResults(false);

    import(`../../../content/${src}`)
      .then(module => {
        setTestData(module.default);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [src]);

  const handleAnswer = useCallback((questionId, score, maxScore, result) => {
    setAnswers(prev => ({ ...prev, [questionId]: { score, maxScore, result } }));
  }, []);

  const totalQuestions = testData?.questions?.length || 0;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount >= totalQuestions;

  const handleFinish = () => {
    if (!testData) return;
    const totalScore = Object.values(answers).reduce((sum, a) => sum + (a.score || 0), 0);
    saveTestResult(testData.meta.id, totalScore, testData.meta.totalPoints, answers);
    setShowResults(true);
  };

  // Previous best score
  const prevBest = testProgress?.[testData?.meta?.id];

  if (loading) return <div className="animate-pulse p-4 text-sm opacity-50">{t('Loading...', 'Se încarcă...')}</div>;
  if (error) return <div className="p-4 text-sm" style={{ color: '#ef4444' }}>{t('Failed to load test', 'Nu s-a putut încărca testul')}: {error}</div>;
  if (!testData) return null;

  const { meta, questions } = testData;

  return (
    <div>
      {/* Test header */}
      <div className="rounded-xl p-4 mb-6" style={{ backgroundColor: 'var(--theme-card-bg)', border: '1px solid var(--theme-border)' }}>
        <h2 className="text-lg font-bold" style={{ color: 'var(--theme-content-text)' }}>
          {t(meta.title.en, meta.title.ro)}
        </h2>
        <div className="flex flex-wrap gap-3 mt-2 text-xs" style={{ color: 'var(--theme-muted-text)' }}>
          {meta.duration && <span>⏱ {meta.duration} min</span>}
          <span>{meta.totalPoints} {t('points', 'puncte')}</span>
          <span>{totalQuestions} {t('questions', 'întrebări')}</span>
          {prevBest && (
            <span style={{ color: '#3b82f6' }}>
              {t('Best', 'Cel mai bun')}: {prevBest.score}/{prevBest.totalPoints}
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div className="mt-3 flex gap-1">
          {questions.map(q => {
            const a = answers[q.id];
            let bg = 'var(--theme-border)';
            if (a) {
              const pct = q.points > 0 ? a.score / q.points : 0;
              bg = pct >= 0.7 ? '#22c55e' : pct >= 0.4 ? '#f59e0b' : '#ef4444';
            }
            return (
              <div
                key={q.id}
                className="flex-1 h-1.5 rounded-sm cursor-pointer transition-colors"
                style={{ backgroundColor: bg }}
                onClick={() => {
                  setActiveQ(q.id);
                  document.getElementById(`q-${q.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((q, i) => {
          const QuestionComp = questionComponents[q.type];
          if (!QuestionComp) {
            return (
              <div key={q.id} className="p-3 rounded-lg text-xs" style={{ backgroundColor: 'var(--theme-card-bg)', border: '1px solid var(--theme-border)' }}>
                {t(`Unknown question type: ${q.type}`, `Tip de întrebare necunoscut: ${q.type}`)}
              </div>
            );
          }

          return (
            <div key={q.id} id={`q-${q.id}`} className="rounded-xl p-4" style={{ backgroundColor: 'var(--theme-card-bg)', border: `1px solid ${activeQ === q.id ? '#3b82f6' : 'var(--theme-border)'}` }}>
              {/* Question header */}
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: answers[q.id] ? (answers[q.id].score / q.points >= 0.7 ? '#22c55e' : answers[q.id].score / q.points >= 0.4 ? '#f59e0b' : '#ef4444') : '#3b82f6' }}
                >
                  {i + 1}
                </span>
                <span className="text-xs font-semibold" style={{ color: 'var(--theme-content-text)' }}>
                  {t(q.prompt.en, q.prompt.ro)}
                </span>
                <span className="ml-auto text-[10px] flex-shrink-0" style={{ color: 'var(--theme-muted-text)' }}>
                  {q.points} {t('pts', 'p')}
                </span>
              </div>

              {/* Question body */}
              <QuestionComp question={q} onAnswer={handleAnswer} />
            </div>
          );
        })}
      </div>

      {/* Finish button / Results */}
      {!showResults && (
        <div className="flex justify-center mt-6">
          <button
            onClick={handleFinish}
            disabled={!allAnswered}
            className="px-6 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer"
            style={{
              backgroundColor: allAnswered ? '#22c55e' : 'var(--theme-border)',
              color: allAnswered ? '#fff' : 'var(--theme-muted-text)',
            }}
          >
            {allAnswered
              ? t('See Results', 'Vezi rezultatele')
              : t(`${answeredCount}/${totalQuestions} answered`, `${answeredCount}/${totalQuestions} răspunse`)}
          </button>
        </div>
      )}

      {showResults && (
        <TestResults questions={questions} answers={answers} totalPoints={meta.totalPoints} />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Update SubjectPage to support JSON test entries**

In `src/pages/SubjectPage.jsx`, find the tests rendering block that maps over `subject.tests`. Add a branch: if a test entry has `src` (string), render `TestRenderer`; if it has `component`, use the legacy path. Import TestRenderer at the top.

At the top of SubjectPage.jsx, add:
```jsx
import TestRenderer from '../components/blocks/test/TestRenderer';
```

In the tests tab rendering section, replace the test map to handle both formats:
```jsx
{tab === 'tests' && subject.tests && (
  <div>
    {subject.tests.map(test => {
      // JSON test entry
      if (test.src) {
        return <TestRenderer key={test.id} src={test.src} />;
      }
      // Legacy JSX test
      const TestContent = test.component;
      return (
        <CourseBlock key={test.id} title={test.title[lang]} id={test.id}>
          <Suspense fallback={<LoadingFallback />}>
            <TestContent />
          </Suspense>
        </CourseBlock>
      );
    })}
  </div>
)}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/blocks/test/TestRenderer.jsx src/pages/SubjectPage.jsx
git commit -m "feat: TestRenderer + SubjectPage integration for JSON tests"
```

---

### Task 6: Final verification

- [ ] **Step 1: Build check**

Run: `npm run build` — must pass with no errors.

- [ ] **Step 2: Smoke test**

Run: `npm run dev` and verify:
1. Navigate to `/#/y1s2/os` → Tests tab → sample test appears alongside existing JSX test
2. Answer MCQ → instant feedback with correct/incorrect highlight
3. Fill in blank → deterministic check shows result
4. Open-ended → textarea, submit triggers AI grading, feedback appears inline
5. Code writing → monospace editor, submit triggers AI grading
6. Diagram → textarea with hint, submit triggers AI grading
7. Answer all 5 → "See Results" button activates → score breakdown appears
8. Refresh page → testProgress persists in localStorage
9. Legacy JSX test still renders and works
10. All existing features unaffected (courses, themes, sidebar, lecture toggle)

- [ ] **Step 3: Commit and push**

```bash
git add -A
git commit -m "feat: Plan 4 complete — test system with inline answers and AI grading"
git push
```
