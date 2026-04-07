# OOP Subject Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add OOP (Object-Oriented Programming) as a new subject with 7 course pages, 13 interactive lab pages with a multi-file code editor, and a practice tab with ~70-100 multiple-choice questions.

**Architecture:** New `src/content/oop/` directory following the exact same structure as existing subjects (os, pa). A new reusable `MultiFileEditor` component in `src/components/ui/` provides tabbed multi-file editing with Judge0 Bash compilation. All content is bilingual (EN/RO) and themed with CSS custom properties.

**Tech Stack:** React 19, CodeMirror 6 (already installed), Judge0 CE API (Bash language_id 46), Tailwind CSS v4 with `var(--theme-*)` custom properties.

**Spec:** `docs/superpowers/specs/2026-04-04-oop-subject-design.md`

---

## File Map

### New files to create

| File | Responsibility |
|------|---------------|
| `src/components/ui/MultiFileEditor.jsx` | Reusable tabbed multi-file code editor with Judge0 compilation |
| `src/content/oop/index.js` | Subject metadata + lazy imports for all courses, labs, practice |
| `src/content/oop/courses/Course01.jsx` | Lecture 1: Introduction |
| `src/content/oop/courses/Course02.jsx` | Lecture 2: C++ Language Specifiers |
| `src/content/oop/courses/Course03.jsx` | Lecture 3: Creating an Object |
| `src/content/oop/courses/Course04.jsx` | Lecture 4: Operators |
| `src/content/oop/courses/Course05.jsx` | Lecture 5: Inheritance |
| `src/content/oop/courses/Course06.jsx` | Lecture 6: Templates |
| `src/content/oop/courses/Course07.jsx` | Lecture 7: STL (1) |
| `src/content/oop/labs/Lab01.jsx` | Lab 01 |
| `src/content/oop/labs/Lab01Extra.jsx` | Lab 01 Extra |
| `src/content/oop/labs/Lab02.jsx` | Lab 02 |
| `src/content/oop/labs/Lab02Extra.jsx` | Lab 02 Extra |
| `src/content/oop/labs/Lab03.jsx` | Lab 03 |
| `src/content/oop/labs/Lab03Extra.jsx` | Lab 03 Extra |
| `src/content/oop/labs/Lab04.jsx` | Lab 04 |
| `src/content/oop/labs/Lab05.jsx` | Lab 05 |
| `src/content/oop/labs/Lab05Extra.jsx` | Lab 05 Extra |
| `src/content/oop/labs/Lab06.jsx` | Lab 06 |
| `src/content/oop/labs/Lab06Extra.jsx` | Lab 06 Extra |
| `src/content/oop/labs/Lab07.jsx` | Lab 07 |
| `src/content/oop/labs/Lab07Extra.jsx` | Lab 07 Extra |
| `src/content/oop/practice/Practice.jsx` | Practice MC questions grouped by course |

### Existing files to modify

| File | Change |
|------|--------|
| `src/content/registry.js` | Add oop import + add to subjects array + add to y1s2 yearSemesters |
| `src/components/ui/index.js` | Export MultiFileEditor |

---

## Task 1: MultiFileEditor Component

**Files:**
- Create: `src/components/ui/MultiFileEditor.jsx`
- Modify: `src/components/ui/index.js`

This is the core new component. It provides a tabbed file editor with Judge0 Bash-based compilation for multi-file C/C++ projects.

- [ ] **Step 1: Create MultiFileEditor.jsx**

```jsx
// src/components/ui/MultiFileEditor.jsx
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
    const escaped = f.content.replace(/\\/g, '\\\\');
    return `cat > '${f.name}' << '__MFE_EOF__'\n${escaped}\n__MFE_EOF__`;
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
```

- [ ] **Step 2: Export MultiFileEditor from ui/index.js**

Add to `src/components/ui/index.js`:

```js
export { default as MultiFileEditor } from './MultiFileEditor';
```

- [ ] **Step 3: Verify it compiles**

Run: `npm run build 2>&1 | head -20`

Expected: Build succeeds (MultiFileEditor isn't used yet but should compile without errors).

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/MultiFileEditor.jsx src/components/ui/index.js
git commit -m "feat(oop): add MultiFileEditor component with Judge0 Bash compilation"
```

---

## Task 2: OOP Subject Shell + Registry

**Files:**
- Create: `src/content/oop/index.js`
- Modify: `src/content/registry.js`

Set up the subject metadata with all lazy imports pointing to files we'll create in subsequent tasks. Use empty placeholder components temporarily so the app doesn't crash.

- [ ] **Step 1: Create oop/index.js**

```jsx
// src/content/oop/index.js
import { lazy } from 'react';

const oop = {
  slug: 'oop',
  yearSemester: 'y1s2',
  title: { en: 'Object-Oriented Programming', ro: 'Programare Orientată pe Obiecte' },
  shortTitle: { en: 'OOP', ro: 'POO' },
  description: {
    en: 'C++ fundamentals: classes, constructors, operators, inheritance, templates, STL',
    ro: 'Bazele C++: clase, constructori, operatori, moștenire, șabloane, STL',
  },
  icon: '🧱',
  courses: [
    { id: 'oop-c1', title: { en: 'Course 1: Introduction', ro: 'Cursul 1: Introducere' }, shortTitle: { en: 'C1: Introduction', ro: 'C1: Introducere' }, sectionCount: 6, component: lazy(() => import('./courses/Course01.jsx')) },
    { id: 'oop-c2', title: { en: 'Course 2: C++ Language Specifiers', ro: 'Cursul 2: Specificatori ai limbajului C++' }, shortTitle: { en: 'C2: Specifiers', ro: 'C2: Specificatori' }, sectionCount: 6, component: lazy(() => import('./courses/Course02.jsx')) },
    { id: 'oop-c3', title: { en: 'Course 3: Creating an Object', ro: 'Cursul 3: Crearea unui obiect' }, shortTitle: { en: 'C3: Objects', ro: 'C3: Obiecte' }, sectionCount: 7, component: lazy(() => import('./courses/Course03.jsx')) },
    { id: 'oop-c4', title: { en: 'Course 4: Operators', ro: 'Cursul 4: Operatori' }, shortTitle: { en: 'C4: Operators', ro: 'C4: Operatori' }, sectionCount: 6, component: lazy(() => import('./courses/Course04.jsx')) },
    { id: 'oop-c5', title: { en: 'Course 5: Inheritance', ro: 'Cursul 5: Moștenire' }, shortTitle: { en: 'C5: Inheritance', ro: 'C5: Moștenire' }, sectionCount: 6, component: lazy(() => import('./courses/Course05.jsx')) },
    { id: 'oop-c6', title: { en: 'Course 6: Templates', ro: 'Cursul 6: Șabloane' }, shortTitle: { en: 'C6: Templates', ro: 'C6: Șabloane' }, sectionCount: 6, component: lazy(() => import('./courses/Course06.jsx')) },
    { id: 'oop-c7', title: { en: 'Course 7: STL (1)', ro: 'Cursul 7: STL (1)' }, shortTitle: { en: 'C7: STL', ro: 'C7: STL' }, sectionCount: 6, component: lazy(() => import('./courses/Course07.jsx')) },
  ],
  seminars: [],
  labs: [
    { id: 'oop-l1', title: { en: 'Lab 01: Introduction', ro: 'Lab 01: Introducere' }, shortTitle: { en: 'L1: Intro', ro: 'L1: Intro' }, component: lazy(() => import('./labs/Lab01.jsx')) },
    { id: 'oop-l1e', title: { en: 'Lab 01 Extra', ro: 'Lab 01 Extra' }, shortTitle: { en: 'L1 Extra', ro: 'L1 Extra' }, component: lazy(() => import('./labs/Lab01Extra.jsx')) },
    { id: 'oop-l2', title: { en: 'Lab 02', ro: 'Lab 02' }, shortTitle: { en: 'L2', ro: 'L2' }, component: lazy(() => import('./labs/Lab02.jsx')) },
    { id: 'oop-l2e', title: { en: 'Lab 02 Extra', ro: 'Lab 02 Extra' }, shortTitle: { en: 'L2 Extra', ro: 'L2 Extra' }, component: lazy(() => import('./labs/Lab02Extra.jsx')) },
    { id: 'oop-l3', title: { en: 'Lab 03: Classes', ro: 'Lab 03: Clase' }, shortTitle: { en: 'L3: Classes', ro: 'L3: Clase' }, component: lazy(() => import('./labs/Lab03.jsx')) },
    { id: 'oop-l3e', title: { en: 'Lab 03 Extra', ro: 'Lab 03 Extra' }, shortTitle: { en: 'L3 Extra', ro: 'L3 Extra' }, component: lazy(() => import('./labs/Lab03Extra.jsx')) },
    { id: 'oop-l4', title: { en: 'Lab 04', ro: 'Lab 04' }, shortTitle: { en: 'L4', ro: 'L4' }, component: lazy(() => import('./labs/Lab04.jsx')) },
    { id: 'oop-l5', title: { en: 'Lab 05: Number Class', ro: 'Lab 05: Clasa Number' }, shortTitle: { en: 'L5: Number', ro: 'L5: Number' }, component: lazy(() => import('./labs/Lab05.jsx')) },
    { id: 'oop-l5e', title: { en: 'Lab 05 Extra', ro: 'Lab 05 Extra' }, shortTitle: { en: 'L5 Extra', ro: 'L5 Extra' }, component: lazy(() => import('./labs/Lab05Extra.jsx')) },
    { id: 'oop-l6', title: { en: 'Lab 06', ro: 'Lab 06' }, shortTitle: { en: 'L6', ro: 'L6' }, component: lazy(() => import('./labs/Lab06.jsx')) },
    { id: 'oop-l6e', title: { en: 'Lab 06 Extra', ro: 'Lab 06 Extra' }, shortTitle: { en: 'L6 Extra', ro: 'L6 Extra' }, component: lazy(() => import('./labs/Lab06Extra.jsx')) },
    { id: 'oop-l7', title: { en: 'Lab 07', ro: 'Lab 07' }, shortTitle: { en: 'L7', ro: 'L7' }, component: lazy(() => import('./labs/Lab07.jsx')) },
    { id: 'oop-l7e', title: { en: 'Lab 07 Extra', ro: 'Lab 07 Extra' }, shortTitle: { en: 'L7 Extra', ro: 'L7 Extra' }, component: lazy(() => import('./labs/Lab07Extra.jsx')) },
  ],
  tests: [],
  practice: lazy(() => import('./practice/Practice.jsx')),
};

export default oop;
```

- [ ] **Step 2: Update registry.js**

In `src/content/registry.js`, add the import and register the subject:

```js
import os from './os/index.js';
import probStat from './prob-stat/index.js';
import alo from './alo/index.js';
import pa from './pa/index.js';
import oop from './oop/index.js';

export const subjects = [os, probStat, alo, pa, oop];

export const yearSemesters = [
  {
    id: 'y1s2',
    title: { en: 'Year 1, Semester 2', ro: 'Anul 1, Semestrul 2' },
    subjects: ['os', 'prob-stat', 'alo', 'pa', 'oop'],
  },
];
```

- [ ] **Step 3: Create placeholder files for all courses, labs, and practice**

Create minimal placeholder components for every file referenced in `index.js` so the app doesn't crash. Each placeholder follows this pattern:

```jsx
// src/content/oop/courses/Course01.jsx (and Course02-07)
import React from 'react';
import { useApp } from '../../../contexts/AppContext';

export default function Course01() {
  const { t } = useApp();
  return <p className="text-sm opacity-50">{t('Content coming soon...', 'Conținut în curând...')}</p>;
}
```

```jsx
// src/content/oop/labs/Lab01.jsx (and all other lab files)
import React from 'react';
import { useApp } from '../../../contexts/AppContext';

export default function Lab01() {
  const { t } = useApp();
  return <p className="text-sm opacity-50">{t('Content coming soon...', 'Conținut în curând...')}</p>;
}
```

```jsx
// src/content/oop/practice/Practice.jsx
import React from 'react';
import { useApp } from '../../../contexts/AppContext';

export default function Practice() {
  const { t } = useApp();
  return <p className="text-sm opacity-50">{t('Content coming soon...', 'Conținut în curând...')}</p>;
}
```

Create all 24 files (7 courses + 13 labs + 1 practice + index.js already created + registry already modified). Each file should export a default function named after the file (Course01, Course02, ..., Lab01, Lab01Extra, ..., Practice).

- [ ] **Step 4: Verify the app builds and OOP appears**

Run: `npm run build 2>&1 | tail -5`

Expected: Build succeeds. OOP subject card should appear on the home page alongside OS, Prob-Stat, ALO, PA.

- [ ] **Step 5: Commit**

```bash
git add src/content/oop/ src/content/registry.js
git commit -m "feat(oop): add OOP subject shell with placeholders for all content"
```

---

## Task 3: Course 1 — Introduction

**Files:**
- Modify: `src/content/oop/courses/Course01.jsx`

Fetch the Course 1 PDF content from `https://gdt050579.github.io/poo_course_fii/courses.html` (links to `courses/Course-1.pdf`), then build the full bilingual course page.

**Source content topics:** Compilers, OS architecture, C++ history and revisions, From C to C++, Classes (Data Members & methods).

- [ ] **Step 1: Fetch Course 1 content from source**

Use WebFetch on `https://gdt050579.github.io/poo_course_fii/courses/Course-1.pdf` to extract the full lecture content. Since it's a PDF, also try fetching the print version page which may have HTML content: `https://gdt050579.github.io/poo_course_fii/print.html`.

- [ ] **Step 2: Build the full Course01.jsx**

Replace the placeholder with a complete bilingual course page using `Section`, `Box`, `Code`, and `Toggle` components. Follow the exact pattern from `src/content/pa/courses/Course01.jsx`:

```jsx
import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Section, Toggle } from '../../../components/ui';

export default function Course01() {
  const { t, checked, toggleCheck } = useApp();

  return (
    <>
      <Box type="definition">
        <p className="font-bold mb-2">{t('Course 1 — Topics:', 'Cursul 1 — Subiecte:')}</p>
        <ol className="list-decimal pl-5 text-sm">
          <li>{t('Administrative & glossary', 'Administrativ & glosar')}</li>
          <li>{t('Compilers', 'Compilatoare')}</li>
          <li>{t('OS architecture', 'Arhitectura SO')}</li>
          <li>{t('C++ history and revisions', 'Istoria C++ și revizii')}</li>
          <li>{t('From C to C++', 'De la C la C++')}</li>
          <li>{t('Classes: data members & methods', 'Clase: membri date & metode')}</li>
        </ol>
      </Box>

      {/* Build 6 Section components covering each topic from the PDF */}
      {/* Section IDs: oop-c1-compilers, oop-c1-os-arch, oop-c1-cpp-history, oop-c1-c-to-cpp, oop-c1-classes, oop-c1-data-methods */}
      {/* Each Section uses: Box for definitions/theorems, Code for C++ snippets, Toggle for Q&A */}
      {/* ALL text must use t('English', 'Romanian') */}
      {/* Content must be derived from the actual PDF — not invented */}
    </>
  );
}
```

The actual content for each section must come from the fetched PDF. The implementer must fetch the PDF, extract the content, and build the full bilingual page. Section count in index.js is set to 6.

- [ ] **Step 3: Verify it renders**

Run: `npm run dev` and navigate to `/#/y1s2/oop`. Open Course 1 and verify all 6 sections render correctly with bilingual content.

- [ ] **Step 4: Commit**

```bash
git add src/content/oop/courses/Course01.jsx
git commit -m "feat(oop): add Course 1 — Introduction"
```

---

## Task 4: Course 2 — C++ Language Specifiers

**Files:**
- Modify: `src/content/oop/courses/Course02.jsx`

**Source:** `https://gdt050579.github.io/poo_course_fii/courses/Course-2.pdf`
**Topics:** Pointers and References, Method overloading, NULL pointer, const specifier, friend specifier.

- [ ] **Step 1: Fetch Course 2 content from source PDF**
- [ ] **Step 2: Build the full Course02.jsx following the same pattern as Course01** — 6 sections with IDs like `oop-c2-pointers`, `oop-c2-references`, `oop-c2-overloading`, `oop-c2-null`, `oop-c2-const`, `oop-c2-friend`. All bilingual.
- [ ] **Step 3: Verify it renders at `/#/y1s2/oop`**
- [ ] **Step 4: Commit**

```bash
git add src/content/oop/courses/Course02.jsx
git commit -m "feat(oop): add Course 2 — C++ Language Specifiers"
```

---

## Task 5: Course 3 — Creating an Object

**Files:**
- Modify: `src/content/oop/courses/Course03.jsx`

**Source:** `https://gdt050579.github.io/poo_course_fii/courses/Course-3.pdf`
**Topics:** Initialization lists, Constructors, Const & Reference data members, Delegating constructor, Value Types, Copy & Move Constructors, Constraints.

- [ ] **Step 1: Fetch Course 3 content from source PDF**
- [ ] **Step 2: Build the full Course03.jsx** — 7 sections (sectionCount is 7 in index.js). IDs like `oop-c3-init-lists`, `oop-c3-constructors`, `oop-c3-const-ref`, `oop-c3-delegating`, `oop-c3-value-types`, `oop-c3-copy-move`, `oop-c3-constraints`. All bilingual.
- [ ] **Step 3: Verify it renders**
- [ ] **Step 4: Commit**

```bash
git add src/content/oop/courses/Course03.jsx
git commit -m "feat(oop): add Course 3 — Creating an Object"
```

---

## Task 6: Course 4 — Operators

**Files:**
- Modify: `src/content/oop/courses/Course04.jsx`

**Source:** `https://gdt050579.github.io/poo_course_fii/courses/Course-4.pdf`
**Topics:** Destructor, C++ operators, Operators for classes, Operations with objects.

- [ ] **Step 1: Fetch Course 4 content from source PDF**
- [ ] **Step 2: Build the full Course04.jsx** — 6 sections. IDs like `oop-c4-destructor`, `oop-c4-cpp-operators`, `oop-c4-class-operators`, `oop-c4-arithmetic`, `oop-c4-comparison`, `oop-c4-assignment`. All bilingual.
- [ ] **Step 3: Verify it renders**
- [ ] **Step 4: Commit**

```bash
git add src/content/oop/courses/Course04.jsx
git commit -m "feat(oop): add Course 4 — Operators"
```

---

## Task 7: Course 5 — Inheritance

**Files:**
- Modify: `src/content/oop/courses/Course05.jsx`

**Source:** `https://gdt050579.github.io/poo_course_fii/courses/Course-5.pdf`
**Topics:** Inheritance concepts, Virtual methods, How virtual methods are modeled by the C++ compiler (vtables), Covariance, Abstract classes (Interfaces), Memory alignment in case of inheritance.

- [ ] **Step 1: Fetch Course 5 content from source PDF**
- [ ] **Step 2: Build the full Course05.jsx** — 6 sections. IDs like `oop-c5-inheritance`, `oop-c5-virtual`, `oop-c5-vtables`, `oop-c5-covariance`, `oop-c5-abstract`, `oop-c5-memory`. All bilingual.
- [ ] **Step 3: Verify it renders**
- [ ] **Step 4: Commit**

```bash
git add src/content/oop/courses/Course05.jsx
git commit -m "feat(oop): add Course 5 — Inheritance"
```

---

## Task 8: Course 6 — Templates

**Files:**
- Modify: `src/content/oop/courses/Course06.jsx`

**Source:** `https://gdt050579.github.io/poo_course_fii/courses/Course-6.pdf`
**Topics:** Casts, Macros, Macros vs Inline, Literals, Templates, Function templates, Class templates, Template specialization, Compile-time assertion checking.

- [ ] **Step 1: Fetch Course 6 content from source PDF**
- [ ] **Step 2: Build the full Course06.jsx** — 6 sections. IDs like `oop-c6-casts`, `oop-c6-macros`, `oop-c6-literals`, `oop-c6-func-templates`, `oop-c6-class-templates`, `oop-c6-specialization`. All bilingual.
- [ ] **Step 3: Verify it renders**
- [ ] **Step 4: Commit**

```bash
git add src/content/oop/courses/Course06.jsx
git commit -m "feat(oop): add Course 6 — Templates"
```

---

## Task 9: Course 7 — STL (1)

**Files:**
- Modify: `src/content/oop/courses/Course07.jsx`

**Source:** `https://gdt050579.github.io/poo_course_fii/courses/Course-7.pdf`
**Topics:** Sequence containers, Adaptors, I/O Streams, Strings, Initialization lists.

- [ ] **Step 1: Fetch Course 7 content from source PDF**
- [ ] **Step 2: Build the full Course07.jsx** — 6 sections. IDs like `oop-c7-sequence`, `oop-c7-adaptors`, `oop-c7-streams`, `oop-c7-strings`, `oop-c7-init-lists`, `oop-c7-iterators`. All bilingual.
- [ ] **Step 3: Verify it renders**
- [ ] **Step 4: Commit**

```bash
git add src/content/oop/courses/Course07.jsx
git commit -m "feat(oop): add Course 7 — STL (1)"
```

---

## Task 10: Lab 01 + Lab 01 Extra

**Files:**
- Modify: `src/content/oop/labs/Lab01.jsx`
- Modify: `src/content/oop/labs/Lab01Extra.jsx`

**Source:** `https://gdt050579.github.io/poo_course_fii/labs/lab01.html` and `labs/lab01_extra.html`

- [ ] **Step 1: Fetch Lab 01 and Lab 01 Extra content from source**
- [ ] **Step 2: Build Lab01.jsx**

Each exercise gets bilingual instructions followed by a `MultiFileEditor`. Example structure:

```jsx
import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box } from '../../../components/ui';
import MultiFileEditor from '../../../components/ui/MultiFileEditor';

export default function Lab01() {
  const { t } = useApp();

  return (
    <>
      {/* Exercise 1: Git setup — instructions only, no editor */}
      <h3 className="text-lg font-bold mb-2">{t('Exercise 1: Git Setup', 'Exercițiul 1: Configurare Git')}</h3>
      <p className="mb-4">{t('Create a private GitHub repository...', 'Creați un repository GitHub privat...')}</p>

      {/* Exercise 2: File I/O in C */}
      <h3 className="text-lg font-bold mb-2 mt-8">{t('Exercise 2: File I/O and String Conversion', 'Exercițiul 2: I/O Fișiere și Conversia Șirurilor')}</h3>
      <p className="mb-4">{t('Write a program that opens "in.txt"...', 'Scrieți un program care deschide "in.txt"...')}</p>
      <MultiFileEditor
        files={[
          { name: 'main.c', content: '', language: 'c' },
        ]}
      />

      {/* Exercise 3: String Sorting */}
      {/* ... instructions + MultiFileEditor ... */}

      {/* Exercise 4: Prime Checker in C++ — includes starter code from source */}
      {/* ... instructions + MultiFileEditor with starter code ... */}
    </>
  );
}
```

The actual exercise descriptions, starter code, and file setup must come from the fetched source page.

- [ ] **Step 3: Build Lab01Extra.jsx** — same pattern, fetch from `lab01_extra.html`
- [ ] **Step 4: Verify both render at `/#/y1s2/oop/labs`**
- [ ] **Step 5: Commit**

```bash
git add src/content/oop/labs/Lab01.jsx src/content/oop/labs/Lab01Extra.jsx
git commit -m "feat(oop): add Lab 01 + Lab 01 Extra with MultiFileEditor"
```

---

## Task 11: Lab 02 + Lab 02 Extra

**Files:**
- Modify: `src/content/oop/labs/Lab02.jsx`
- Modify: `src/content/oop/labs/Lab02Extra.jsx`

**Source:** `https://gdt050579.github.io/poo_course_fii/labs/lab02.html` and `labs/lab02_extra.html`

- [ ] **Step 1: Fetch Lab 02 and Lab 02 Extra content**
- [ ] **Step 2: Build Lab02.jsx** — bilingual instructions + MultiFileEditor per exercise. Starter files as provided by source.
- [ ] **Step 3: Build Lab02Extra.jsx**
- [ ] **Step 4: Verify both render**
- [ ] **Step 5: Commit**

```bash
git add src/content/oop/labs/Lab02.jsx src/content/oop/labs/Lab02Extra.jsx
git commit -m "feat(oop): add Lab 02 + Lab 02 Extra"
```

---

## Task 12: Lab 03 + Lab 03 Extra

**Files:**
- Modify: `src/content/oop/labs/Lab03.jsx`
- Modify: `src/content/oop/labs/Lab03Extra.jsx`

**Source:** `https://gdt050579.github.io/poo_course_fii/labs/lab03.html` and `labs/lab03_extra.html`

Lab 03 has 2 independent exercises (Math class, Canvas class) — each gets its own MultiFileEditor with 3 files (`Math.h`/`Math.cpp`/`main.cpp` and `Canvas.h`/`Canvas.cpp`/`main.cpp`).

- [ ] **Step 1: Fetch Lab 03 and Lab 03 Extra content**
- [ ] **Step 2: Build Lab03.jsx** — 2 exercises, 2 MultiFileEditor instances
- [ ] **Step 3: Build Lab03Extra.jsx**
- [ ] **Step 4: Verify both render**
- [ ] **Step 5: Commit**

```bash
git add src/content/oop/labs/Lab03.jsx src/content/oop/labs/Lab03Extra.jsx
git commit -m "feat(oop): add Lab 03 + Lab 03 Extra"
```

---

## Task 13: Lab 04

**Files:**
- Modify: `src/content/oop/labs/Lab04.jsx`

**Source:** `https://gdt050579.github.io/poo_course_fii/labs/lab04.html`

No extra for Lab 04.

- [ ] **Step 1: Fetch Lab 04 content**
- [ ] **Step 2: Build Lab04.jsx**
- [ ] **Step 3: Verify it renders**
- [ ] **Step 4: Commit**

```bash
git add src/content/oop/labs/Lab04.jsx
git commit -m "feat(oop): add Lab 04"
```

---

## Task 14: Lab 05 + Lab 05 Extra

**Files:**
- Modify: `src/content/oop/labs/Lab05.jsx`
- Modify: `src/content/oop/labs/Lab05Extra.jsx`

**Source:** `https://gdt050579.github.io/poo_course_fii/labs/lab05.html` and `labs/lab05_extra.html`

Lab 05 is the Number class with operator overloading — 1 main exercise with `Number.h`/`Number.cpp`/`main.cpp`.

- [ ] **Step 1: Fetch Lab 05 and Lab 05 Extra content**
- [ ] **Step 2: Build Lab05.jsx** — MultiFileEditor with starter files as provided by source
- [ ] **Step 3: Build Lab05Extra.jsx**
- [ ] **Step 4: Verify both render**
- [ ] **Step 5: Commit**

```bash
git add src/content/oop/labs/Lab05.jsx src/content/oop/labs/Lab05Extra.jsx
git commit -m "feat(oop): add Lab 05 + Lab 05 Extra"
```

---

## Task 15: Lab 06 + Lab 06 Extra

**Files:**
- Modify: `src/content/oop/labs/Lab06.jsx`
- Modify: `src/content/oop/labs/Lab06Extra.jsx`

**Source:** `https://gdt050579.github.io/poo_course_fii/labs/lab06.html` and `labs/lab06_extra.html`

- [ ] **Step 1: Fetch Lab 06 and Lab 06 Extra content**
- [ ] **Step 2: Build Lab06.jsx**
- [ ] **Step 3: Build Lab06Extra.jsx**
- [ ] **Step 4: Verify both render**
- [ ] **Step 5: Commit**

```bash
git add src/content/oop/labs/Lab06.jsx src/content/oop/labs/Lab06Extra.jsx
git commit -m "feat(oop): add Lab 06 + Lab 06 Extra"
```

---

## Task 16: Lab 07 + Lab 07 Extra

**Files:**
- Modify: `src/content/oop/labs/Lab07.jsx`
- Modify: `src/content/oop/labs/Lab07Extra.jsx`

**Source:** `https://gdt050579.github.io/poo_course_fii/labs/lab07.html` and `labs/lab07_extra.html`

- [ ] **Step 1: Fetch Lab 07 and Lab 07 Extra content**
- [ ] **Step 2: Build Lab07.jsx**
- [ ] **Step 3: Build Lab07Extra.jsx**
- [ ] **Step 4: Verify both render**
- [ ] **Step 5: Commit**

```bash
git add src/content/oop/labs/Lab07.jsx src/content/oop/labs/Lab07Extra.jsx
git commit -m "feat(oop): add Lab 07 + Lab 07 Extra"
```

---

## Task 17: Practice Tab — Courses 1-3 Questions

**Files:**
- Modify: `src/content/oop/practice/Practice.jsx`

Build the first half of practice questions. Each course group is wrapped in a `CourseBlock`.

- [ ] **Step 1: Fetch Courses 1-3 PDFs to extract question-worthy content**

Review the completed Course01-03.jsx files for content to base questions on.

- [ ] **Step 2: Build Practice.jsx with questions for Courses 1-3**

Follow the exact pattern from `src/content/pa/practice/Practice.jsx`:

```jsx
import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import MultipleChoice from '../../../components/ui/MultipleChoice';
import CourseBlock from '../../../components/ui/CourseBlock';

const course1Questions = [
  {
    question: { en: '1. Which C++ standard introduced classes?', ro: '1. Care standard C++ a introdus clasele?' },
    options: [
      { text: 'C++98', correct: true },
      { text: 'C++11', correct: false },
      { text: 'C++14', correct: false },
      { text: 'C++17', correct: false },
    ],
    explanation: { en: 'Classes were part of the original C++ standard (C++98).', ro: 'Clasele au făcut parte din standardul original C++ (C++98).' },
  },
  // ... 9-14 more questions derived from actual Course 1 content
];

const course2Questions = [
  // ... 10-15 questions on pointers, references, overloading, const, friend
];

const course3Questions = [
  // ... 10-15 questions on constructors, copy/move, init lists
];

export default function Practice() {
  const { t } = useApp();

  return (
    <div className="space-y-4">
      <CourseBlock title={t('Course 1: Introduction', 'Cursul 1: Introducere')} id="oop-practice-c1">
        <MultipleChoice questions={course1Questions} />
      </CourseBlock>
      <CourseBlock title={t('Course 2: C++ Language Specifiers', 'Cursul 2: Specificatori C++')} id="oop-practice-c2">
        <MultipleChoice questions={course2Questions} />
      </CourseBlock>
      <CourseBlock title={t('Course 3: Creating an Object', 'Cursul 3: Crearea unui obiect')} id="oop-practice-c3">
        <MultipleChoice questions={course3Questions} />
      </CourseBlock>
    </div>
  );
}
```

The questions MUST be derived from the actual course content (fetched PDFs), not generic OOP trivia. Include: conceptual understanding, code output prediction, error identification, behavior questions.

- [ ] **Step 3: Verify it renders at `/#/y1s2/oop/practice`**
- [ ] **Step 4: Commit**

```bash
git add src/content/oop/practice/Practice.jsx
git commit -m "feat(oop): add practice questions for Courses 1-3"
```

---

## Task 18: Practice Tab — Courses 4-7 Questions

**Files:**
- Modify: `src/content/oop/practice/Practice.jsx`

- [ ] **Step 1: Review Course04-07.jsx content for question material**
- [ ] **Step 2: Add course4Questions, course5Questions, course6Questions, course7Questions arrays and corresponding CourseBlock sections to Practice.jsx**

Add 4 more question arrays (10-15 questions each) and 4 more CourseBlock sections:
- Course 4: Operators — questions on destructors, operator overloading rules, assignment operators
- Course 5: Inheritance — questions on virtual methods, vtables, abstract classes, covariance
- Course 6: Templates — questions on casts, macros vs inline, template specialization, SFINAE
- Course 7: STL — questions on containers, iterators, streams, string operations

- [ ] **Step 3: Verify all 7 course sections render at `/#/y1s2/oop/practice`**
- [ ] **Step 4: Commit**

```bash
git add src/content/oop/practice/Practice.jsx
git commit -m "feat(oop): add practice questions for Courses 4-7"
```

---

## Task 19: Final Integration Check + Lab Title Updates

**Files:**
- Possibly modify: `src/content/oop/index.js` (update lab titles/shortTitles after content is known)

- [ ] **Step 1: Review all lab content and update index.js titles**

After all labs are built, update the lab entries in `src/content/oop/index.js` with accurate titles based on the actual content. For example, Lab 02 might need `title: { en: 'Lab 02: Strings & Arrays', ro: 'Lab 02: Șiruri & Tablouri' }` once we know its content.

- [ ] **Step 2: Verify complete build**

Run: `npm run build 2>&1 | tail -10`

Expected: Clean build with no warnings.

- [ ] **Step 3: Verify all tabs work**

Run `npm run dev` and check:
- Home page shows OOP card
- `/#/y1s2/oop` — Courses tab with 7 courses, all openable, all sections checkable
- `/#/y1s2/oop/labs` — Labs tab with 13 labs, all with working MultiFileEditors
- `/#/y1s2/oop/practice` — Practice tab with 7 course groups, all questions answerable
- Dark mode works correctly across all new content
- All 5 palette themes render correctly

- [ ] **Step 4: Update sectionCount values in index.js if any course ended up with a different number of sections than initially estimated**

- [ ] **Step 5: Commit any final adjustments**

```bash
git add src/content/oop/
git commit -m "feat(oop): finalize titles, section counts, and integration"
```

- [ ] **Step 6: Push to remote**

```bash
git push
```
