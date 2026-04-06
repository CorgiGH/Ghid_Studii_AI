# Core Block System — Implementation Plan (Sub-Plan 1 of 5)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the block registry, BlockRenderer, StepRenderer, and CourseRenderer so that a JSON course file renders as a step-based learning flow. Integrate into SubjectPage alongside the existing JSX system (backwards compat).

**Architecture:** A `registry.js` maps block type strings to lazy-loaded React components. `BlockRenderer` looks up the type and renders it. `StepRenderer` renders all blocks for one step. `CourseRenderer` loads a JSON file, manages step navigation state, and renders the current step. SubjectPage detects whether a course has `src` (JSON) or `component` (legacy JSX) and renders accordingly.

**Tech Stack:** React 19, Vite 8 (JSON imports work out of the box), Tailwind CSS v4, existing theme CSS vars.

**Spec reference:** `docs/superpowers/specs/2026-04-07-course-content-redesign.md` sections 1 and 2.

---

### Task 1: Create a Sample JSON Course File

**Files:**
- Create: `src/content/os/courses/course-01-sample.json`

This is a minimal but real course JSON that exercises every block type we'll build in this plan. We build the data first, then the renderers.

- [ ] **Step 1: Create the sample JSON file**

```json
{
  "meta": {
    "id": "os-c1",
    "title": { "en": "Course 1: Basic Linux Commands & Filesystems", "ro": "Cursul 1: Comenzi de bază Linux și sisteme de fișiere" },
    "shortTitle": { "en": "C1: Commands & FS", "ro": "C1: Comenzi & FS" },
    "source": { "en": "Prof. — Lecture 1 slides", "ro": "Prof. — Curs 1" }
  },
  "steps": [
    {
      "id": "os-c1-intro",
      "title": { "en": "What is Linux?", "ro": "Ce este Linux?" },
      "group": "fundamentals",
      "blocks": [
        {
          "type": "learn",
          "content": {
            "en": "Linux is a family of open-source Unix-like operating systems based on the Linux kernel. When you interact with a Linux system, you're using a **shell** — a command-line interpreter that translates your commands into actions the kernel performs.",
            "ro": "Linux este o familie de sisteme de operare open-source de tip Unix, bazate pe nucleul Linux. Când interacționați cu un sistem Linux, folosiți un **shell** — un interpretor de comenzi care traduce comenzile în acțiuni executate de nucleu."
          }
        },
        {
          "type": "definition",
          "term": { "en": "Kernel", "ro": "Nucleu (Kernel)" },
          "content": {
            "en": "The core component of an operating system that manages hardware resources and provides services to programs. It handles process scheduling, memory management, device drivers, and system calls.",
            "ro": "Componenta centrală a unui sistem de operare care gestionează resursele hardware și oferă servicii programelor. Se ocupă de planificarea proceselor, gestionarea memoriei, driverele de dispozitiv și apelurile de sistem."
          }
        },
        {
          "type": "callout",
          "variant": "tip",
          "content": {
            "en": "You don't need to memorize every command. Focus on understanding **what** each command does and **when** to use it. The `man` command is your best friend for details.",
            "ro": "Nu trebuie să memorați fiecare comandă. Concentrați-vă pe înțelegerea **ce** face fiecare comandă și **când** s-o folosiți. Comanda `man` este cel mai bun prieten al vostru pentru detalii."
          }
        },
        {
          "type": "think",
          "question": {
            "en": "If Linux is just a kernel, what makes Ubuntu different from Fedora? They both use the Linux kernel.",
            "ro": "Dacă Linux este doar un nucleu, ce face Ubuntu diferit de Fedora? Ambele folosesc nucleul Linux."
          },
          "answer": {
            "en": "They differ in their **distribution** — the collection of software, package manager, default configurations, and desktop environment bundled with the kernel. The kernel is the same (or similar versions), but everything around it differs.",
            "ro": "Ele diferă prin **distribuție** — colecția de software, managerul de pachete, configurațiile implicite și mediul desktop livrate împreună cu nucleul. Nucleul este același (sau versiuni similare), dar tot restul diferă."
          }
        }
      ]
    },
    {
      "id": "os-c1-users",
      "title": { "en": "Users & Authentication", "ro": "Utilizatori și autentificare" },
      "group": "fundamentals",
      "blocks": [
        {
          "type": "learn",
          "content": {
            "en": "Linux is a **multi-user** system. Every action is performed by a user, and every file is owned by a user. The root user (UID 0) has unrestricted access — regular users have limited permissions.",
            "ro": "Linux este un sistem **multi-utilizator**. Fiecare acțiune este efectuată de un utilizator, și fiecare fișier este deținut de un utilizator. Utilizatorul root (UID 0) are acces nerestricționat — utilizatorii obișnuiți au permisiuni limitate."
          }
        },
        {
          "type": "code",
          "language": "bash",
          "content": "$ whoami\nstudent\n$ id\nuid=1000(student) gid=1000(student) groups=1000(student),27(sudo)\n$ sudo whoami\nroot"
        },
        {
          "type": "definition",
          "term": { "en": "UID (User ID)", "ro": "UID (Identificator utilizator)" },
          "content": {
            "en": "A numeric identifier assigned to each user. UID 0 is always root. Regular users typically start at UID 1000.",
            "ro": "Un identificator numeric atribuit fiecărui utilizator. UID 0 este întotdeauna root. Utilizatorii obișnuiți încep de obicei de la UID 1000."
          }
        },
        {
          "type": "quiz",
          "questions": [
            {
              "question": { "en": "What UID does the root user always have?", "ro": "Ce UID are întotdeauna utilizatorul root?" },
              "options": [
                { "text": { "en": "1", "ro": "1" }, "correct": false },
                { "text": { "en": "0", "ro": "0" }, "correct": true },
                { "text": { "en": "1000", "ro": "1000" }, "correct": false },
                { "text": { "en": "-1", "ro": "-1" }, "correct": false }
              ],
              "explanation": { "en": "UID 0 is always root. This is hardcoded in the kernel — it's not configurable.", "ro": "UID 0 este întotdeauna root. Acest lucru este codificat în nucleu — nu este configurabil." }
            }
          ]
        }
      ]
    },
    {
      "id": "os-c1-quiz",
      "title": { "en": "Self-Test", "ro": "Autoevaluare" },
      "group": "assessment",
      "blocks": [
        {
          "type": "quiz",
          "questions": [
            {
              "question": { "en": "What is the role of the Linux kernel?", "ro": "Care este rolul nucleului Linux?" },
              "options": [
                { "text": { "en": "It provides a graphical desktop environment", "ro": "Oferă un mediu grafic de desktop" }, "correct": false },
                { "text": { "en": "It manages hardware and provides services to programs", "ro": "Gestionează hardware-ul și oferă servicii programelor" }, "correct": true },
                { "text": { "en": "It is the package manager", "ro": "Este managerul de pachete" }, "correct": false }
              ],
              "explanation": { "en": "The kernel is the core OS component managing hardware resources, process scheduling, memory, and system calls.", "ro": "Nucleul este componenta centrală a SO care gestionează resursele hardware, planificarea proceselor, memoria și apelurile de sistem." }
            }
          ]
        }
      ]
    }
  ]
}
```

- [ ] **Step 2: Verify the JSON is valid**

Run: `node -e "JSON.parse(require('fs').readFileSync('src/content/os/courses/course-01-sample.json','utf8')); console.log('Valid JSON')"`
Expected: `Valid JSON`

- [ ] **Step 3: Commit**

```bash
git add src/content/os/courses/course-01-sample.json
git commit -m "feat: add sample JSON course file for block system development"
```

---

### Task 2: Block Registry and BlockRenderer

**Files:**
- Create: `src/components/blocks/registry.js`
- Create: `src/components/blocks/BlockRenderer.jsx`
- Create: `src/components/blocks/UnknownBlock.jsx`

- [ ] **Step 1: Create the block registry**

Create `src/components/blocks/registry.js`:

```js
import { lazy } from 'react';

const registry = {
  'learn':       lazy(() => import('./learn/LearnBlock.jsx')),
  'definition':  lazy(() => import('./definition/DefinitionBlock.jsx')),
  'think':       lazy(() => import('./assessment/ThinkBlock.jsx')),
  'quiz':        lazy(() => import('./assessment/QuizBlock.jsx')),
  'code':        lazy(() => import('./media/CodeBlock.jsx')),
  'callout':     lazy(() => import('./layout/CalloutBlock.jsx')),
  'diagram':     lazy(() => import('./diagram/DiagramBlock.jsx')),
  'image':       lazy(() => import('./media/ImageBlock.jsx')),
  'table':       lazy(() => import('./layout/TableBlock.jsx')),
  'list':        lazy(() => import('./layout/ListBlock.jsx')),
  // Lecture overlay blocks (filtered by toggle)
  'lecture':       lazy(() => import('./lecture/LectureNoteBlock.jsx')),
  'lecture-video': lazy(() => import('./lecture/LectureVideoBlock.jsx')),
  'lecture-exam':  lazy(() => import('./lecture/LectureExamBlock.jsx')),
  // Interactive blocks
  'animation':      lazy(() => import('./interactive/AnimationBlock.jsx')),
  'code-challenge': lazy(() => import('./interactive/CodeChallengeBlock.jsx')),
  'terminal':       lazy(() => import('./interactive/TerminalBlock.jsx')),
};

export default registry;
```

- [ ] **Step 2: Create UnknownBlock**

Create `src/components/blocks/UnknownBlock.jsx`:

```jsx
import React from 'react';
import { useApp } from '../../contexts/AppContext';

export default function UnknownBlock({ type }) {
  const { t } = useApp();
  return (
    <div
      className="rounded-lg p-3 mb-3 text-sm"
      style={{
        border: '1px dashed var(--theme-border)',
        backgroundColor: 'var(--theme-card-bg)',
        color: 'var(--theme-muted-text)',
      }}
    >
      {t(
        `Unknown block type: "${type}". Register it in registry.js to render.`,
        `Tip de bloc necunoscut: „${type}". Înregistrați-l în registry.js pentru a-l afișa.`
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create BlockRenderer**

Create `src/components/blocks/BlockRenderer.jsx`:

```jsx
import React, { Suspense } from 'react';
import registry from './registry';
import UnknownBlock from './UnknownBlock';

export default function BlockRenderer({ block, lectureVisible }) {
  if (block.type.startsWith('lecture') && !lectureVisible) return null;

  const Component = registry[block.type];
  if (!Component) return <UnknownBlock type={block.type} />;

  return (
    <Suspense fallback={<div className="animate-pulse h-8 rounded" style={{ backgroundColor: 'var(--theme-border)' }} />}>
      <Component {...block} />
    </Suspense>
  );
}
```

- [ ] **Step 4: Verify app still starts**

Run: `npm run dev`
Expected: App starts without errors (new files are not imported anywhere yet).

- [ ] **Step 5: Commit**

```bash
git add src/components/blocks/registry.js src/components/blocks/BlockRenderer.jsx src/components/blocks/UnknownBlock.jsx
git commit -m "feat: add block registry, BlockRenderer, and UnknownBlock fallback"
```

---

### Task 3: Core Block Components — Learn, Definition, Callout

**Files:**
- Create: `src/components/blocks/learn/LearnBlock.jsx`
- Create: `src/components/blocks/definition/DefinitionBlock.jsx`
- Create: `src/components/blocks/layout/CalloutBlock.jsx`

These three are the simplest content blocks — they render bilingual text with themed styling.

- [ ] **Step 1: Create LearnBlock**

Create `src/components/blocks/learn/LearnBlock.jsx`:

```jsx
import React from 'react';
import { useApp } from '../../../contexts/AppContext';

export default function LearnBlock({ content }) {
  const { t } = useApp();
  const text = t(content.en, content.ro);

  return (
    <div
      className="rounded-xl p-4 mb-3"
      style={{
        backgroundColor: 'var(--theme-card-bg)',
        border: '1px solid var(--theme-border)',
      }}
    >
      <div
        className="text-[10px] font-bold uppercase tracking-widest mb-2"
        style={{ color: '#3b82f6' }}
      >
        {t('Learn', 'Învață')}
      </div>
      <div
        className="text-sm leading-relaxed prose-sm"
        style={{ color: 'var(--theme-content-text)' }}
        dangerouslySetInnerHTML={{ __html: formatMarkdown(text) }}
      />
    </div>
  );
}

/** Minimal inline markdown: **bold** and `code` only */
function formatMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code style="background:var(--theme-border);padding:1px 5px;border-radius:4px;font-size:0.85em;">$1</code>')
    .replace(/\n/g, '<br/>');
}
```

- [ ] **Step 2: Create DefinitionBlock**

Create `src/components/blocks/definition/DefinitionBlock.jsx`:

```jsx
import React from 'react';
import { useApp } from '../../../contexts/AppContext';

export default function DefinitionBlock({ term, content }) {
  const { t } = useApp();

  return (
    <div
      className="rounded-xl p-4 mb-3"
      style={{
        backgroundColor: 'color-mix(in srgb, #60a5fa 8%, var(--theme-card-bg))',
        border: '1px solid color-mix(in srgb, #60a5fa 20%, var(--theme-border))',
      }}
    >
      <div
        className="text-[10px] font-bold uppercase tracking-widest mb-2"
        style={{ color: '#60a5fa' }}
      >
        {t('Definition', 'Definiție')}
      </div>
      <p className="font-bold text-sm mb-1" style={{ color: 'var(--theme-content-text)' }}>
        {t(term.en, term.ro)}
      </p>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--theme-content-text)', opacity: 0.85 }}>
        {t(content.en, content.ro)}
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Create CalloutBlock**

Create `src/components/blocks/layout/CalloutBlock.jsx`:

```jsx
import React from 'react';
import { useApp } from '../../../contexts/AppContext';

const VARIANTS = {
  tip:     { color: '#3b82f6', icon: '💡', label: { en: 'Tip', ro: 'Sfat' } },
  warning: { color: '#f59e0b', icon: '⚠️', label: { en: 'Warning', ro: 'Atenție' } },
  trap:    { color: '#ef4444', icon: '🚨', label: { en: 'Trap', ro: 'Capcană' } },
  info:    { color: '#10b981', icon: 'ℹ️', label: { en: 'Note', ro: 'Notă' } },
};

export default function CalloutBlock({ variant = 'info', content }) {
  const { t } = useApp();
  const v = VARIANTS[variant] || VARIANTS.info;

  return (
    <div
      className="rounded-xl p-4 mb-3"
      style={{
        backgroundColor: `color-mix(in srgb, ${v.color} 6%, var(--theme-card-bg))`,
        borderLeft: `3px solid ${v.color}`,
        border: `1px solid color-mix(in srgb, ${v.color} 15%, var(--theme-border))`,
        borderLeftWidth: '3px',
        borderLeftColor: v.color,
      }}
    >
      <div
        className="text-[10px] font-bold uppercase tracking-widest mb-2"
        style={{ color: v.color }}
      >
        {v.icon} {t(v.label.en, v.label.ro)}
      </div>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--theme-content-text)' }}>
        {t(content.en, content.ro)}
      </p>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/blocks/learn/ src/components/blocks/definition/ src/components/blocks/layout/
git commit -m "feat: add LearnBlock, DefinitionBlock, and CalloutBlock components"
```

---

### Task 4: Assessment Blocks — ThinkBlock and QuizBlock

**Files:**
- Create: `src/components/blocks/assessment/ThinkBlock.jsx`
- Create: `src/components/blocks/assessment/QuizBlock.jsx`

- [ ] **Step 1: Create ThinkBlock**

Create `src/components/blocks/assessment/ThinkBlock.jsx`:

```jsx
import React, { useState } from 'react';
import { useApp } from '../../../contexts/AppContext';

export default function ThinkBlock({ question, answer }) {
  const { t } = useApp();
  const [revealed, setRevealed] = useState(false);

  return (
    <div
      className="rounded-xl p-4 mb-3"
      style={{
        backgroundColor: 'color-mix(in srgb, #f59e0b 6%, var(--theme-card-bg))',
        border: '1px solid color-mix(in srgb, #f59e0b 15%, var(--theme-border))',
      }}
    >
      <div
        className="text-[10px] font-bold uppercase tracking-widest mb-2"
        style={{ color: '#f59e0b' }}
      >
        💡 {t('Think about it', 'Gândește-te')}
      </div>
      <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--theme-content-text)' }}>
        {t(question.en, question.ro)}
      </p>
      {!revealed ? (
        <button
          onClick={() => setRevealed(true)}
          className="w-full text-center text-xs py-2 rounded-lg transition-colors cursor-pointer"
          style={{
            backgroundColor: 'var(--theme-border)',
            color: 'var(--theme-muted-text)',
          }}
          onMouseEnter={e => { e.target.style.color = '#f59e0b'; }}
          onMouseLeave={e => { e.target.style.color = 'var(--theme-muted-text)'; }}
        >
          {t('Click to reveal answer ▼', 'Click pentru răspuns ▼')}
        </button>
      ) : (
        <>
          <div
            className="text-sm leading-relaxed p-3 rounded-lg"
            style={{
              backgroundColor: 'color-mix(in srgb, #f59e0b 4%, var(--theme-card-bg))',
              color: 'var(--theme-content-text)',
            }}
          >
            {t(answer.en, answer.ro)}
          </div>
          <button
            onClick={() => setRevealed(false)}
            className="w-full text-center text-xs py-1 mt-2 cursor-pointer"
            style={{ color: 'var(--theme-muted-text)' }}
          >
            {t('Hide ▲', 'Ascunde ▲')}
          </button>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create QuizBlock**

Create `src/components/blocks/assessment/QuizBlock.jsx`:

This wraps the existing `MultipleChoice` component, adapting the JSON format.

```jsx
import React, { useState } from 'react';
import { useApp } from '../../../contexts/AppContext';

export default function QuizBlock({ questions }) {
  const { t } = useApp();

  return (
    <div
      className="rounded-xl p-4 mb-3"
      style={{
        backgroundColor: 'color-mix(in srgb, #a855f7 6%, var(--theme-card-bg))',
        border: '1px solid color-mix(in srgb, #a855f7 15%, var(--theme-border))',
      }}
    >
      <div
        className="text-[10px] font-bold uppercase tracking-widest mb-3"
        style={{ color: '#a855f7' }}
      >
        {t('Quick Check', 'Verificare rapidă')}
      </div>
      {questions.map((q, qi) => (
        <QuizQuestion key={qi} q={q} index={qi} total={questions.length} />
      ))}
    </div>
  );
}

function QuizQuestion({ q, index, total }) {
  const { t } = useApp();
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (i) => {
    if (submitted) return;
    setSelected(i);
  };

  const handleCheck = () => {
    if (selected === null) return;
    setSubmitted(true);
  };

  return (
    <div className={index < total - 1 ? 'mb-4 pb-4' : ''} style={index < total - 1 ? { borderBottom: '1px solid var(--theme-border)' } : {}}>
      <p className="text-sm font-medium mb-2" style={{ color: 'var(--theme-content-text)' }}>
        {total > 1 && <span style={{ color: 'var(--theme-muted-text)' }}>Q{index + 1}. </span>}
        {t(q.question.en, q.question.ro)}
      </p>
      <div className="flex flex-col gap-2">
        {q.options.map((opt, oi) => {
          let bg = 'var(--theme-card-bg)';
          let border = 'var(--theme-border)';
          let textColor = 'var(--theme-content-text)';

          if (submitted) {
            if (opt.correct) {
              bg = 'color-mix(in srgb, #10b981 12%, var(--theme-card-bg))';
              border = '#10b981';
              textColor = '#10b981';
            } else if (oi === selected && !opt.correct) {
              bg = 'color-mix(in srgb, #ef4444 12%, var(--theme-card-bg))';
              border = '#ef4444';
              textColor = '#ef4444';
            }
          } else if (oi === selected) {
            border = '#a855f7';
            bg = 'color-mix(in srgb, #a855f7 8%, var(--theme-card-bg))';
          }

          return (
            <button
              key={oi}
              onClick={() => handleSelect(oi)}
              className="flex items-center gap-3 p-2.5 rounded-lg text-left text-sm transition-colors cursor-pointer"
              style={{
                backgroundColor: bg,
                border: `1px solid ${border}`,
                color: textColor,
                pointerEvents: submitted ? 'none' : 'auto',
              }}
            >
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: 'var(--theme-border)' }}
              >
                {String.fromCharCode(65 + oi)}
              </span>
              {t(opt.text.en, opt.text.ro)}
            </button>
          );
        })}
      </div>
      {!submitted && (
        <button
          onClick={handleCheck}
          disabled={selected === null}
          className="mt-2 px-4 py-1.5 rounded-lg text-xs font-medium text-white transition-opacity"
          style={{
            backgroundColor: '#a855f7',
            opacity: selected === null ? 0.4 : 1,
            cursor: selected === null ? 'not-allowed' : 'pointer',
          }}
        >
          {t('Check Answer', 'Verifică')}
        </button>
      )}
      {submitted && q.explanation && (
        <div
          className="mt-2 p-3 rounded-lg text-xs leading-relaxed"
          style={{
            backgroundColor: 'color-mix(in srgb, #10b981 8%, var(--theme-card-bg))',
            border: '1px solid color-mix(in srgb, #10b981 20%, var(--theme-border))',
            color: '#10b981',
          }}
        >
          ✅ {t(q.explanation.en, q.explanation.ro)}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/blocks/assessment/
git commit -m "feat: add ThinkBlock and QuizBlock assessment components"
```

---

### Task 5: Media Block — CodeBlock

**Files:**
- Create: `src/components/blocks/media/CodeBlock.jsx`

- [ ] **Step 1: Create CodeBlock**

Create `src/components/blocks/media/CodeBlock.jsx`:

```jsx
import React from 'react';

export default function CodeBlock({ language, content }) {
  return (
    <div className="rounded-xl mb-3 overflow-hidden" style={{ border: '1px solid var(--theme-border)' }}>
      {language && (
        <div
          className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
          style={{
            backgroundColor: 'var(--theme-border)',
            color: 'var(--theme-muted-text)',
          }}
        >
          {language}
        </div>
      )}
      <pre
        className="p-4 overflow-x-auto text-sm leading-relaxed"
        style={{
          backgroundColor: 'color-mix(in srgb, #10b981 4%, var(--theme-card-bg))',
          color: '#10b981',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          margin: 0,
        }}
      >
        <code>{content}</code>
      </pre>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/blocks/media/
git commit -m "feat: add CodeBlock media component"
```

---

### Task 6: StepRenderer

**Files:**
- Create: `src/components/blocks/StepRenderer.jsx`

StepRenderer renders all blocks for a single step. It does NOT handle progress yet (that's Plan 2). For now it just renders blocks top-to-bottom.

- [ ] **Step 1: Create StepRenderer**

Create `src/components/blocks/StepRenderer.jsx`:

```jsx
import React from 'react';
import { useApp } from '../../contexts/AppContext';
import BlockRenderer from './BlockRenderer';

export default function StepRenderer({ step, lectureVisible }) {
  const { t } = useApp();

  if (!step || !step.blocks) return null;

  return (
    <div className="animate-fadeIn">
      {step.blocks.map((block, i) => (
        <BlockRenderer key={i} block={block} lectureVisible={lectureVisible} />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/blocks/StepRenderer.jsx
git commit -m "feat: add StepRenderer — renders all blocks for a step"
```

---

### Task 7: CourseRenderer

**Files:**
- Create: `src/components/blocks/CourseRenderer.jsx`

This is the main component that loads a JSON course, manages step navigation, and renders the current step. Lecture toggle and progress are stubbed (implemented in Plans 2 and 3).

- [ ] **Step 1: Create CourseRenderer**

Create `src/components/blocks/CourseRenderer.jsx`:

```jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../contexts/AppContext';
import StepRenderer from './StepRenderer';
import CourseTransition from '../ui/CourseTransition';

export default function CourseRenderer({ src }) {
  const { t } = useApp();
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [lectureVisible, setLectureVisible] = useState(false);

  // Load course JSON
  useEffect(() => {
    setLoading(true);
    setError(null);
    setCourseData(null);
    setCurrentStep(0);

    import(`../../content/${src}`)
      .then(module => {
        setCourseData(module.default);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [src]);

  const totalSteps = courseData?.steps?.length || 0;
  const step = courseData?.steps?.[currentStep];

  const goToStep = useCallback((index) => {
    if (index < 0 || index >= totalSteps) return;
    setCurrentStep(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [totalSteps]);

  if (loading) {
    return <div className="animate-pulse p-4 text-sm opacity-50">{t('Loading...', 'Se încarcă...')}</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-sm" style={{ color: '#ef4444' }}>
        {t('Failed to load course', 'Nu s-a putut încărca cursul')}: {error}
      </div>
    );
  }

  if (!courseData || totalSteps === 0) {
    return (
      <div className="p-4 text-sm opacity-50">
        {t('No content available', 'Niciun conținut disponibil')}
      </div>
    );
  }

  return (
    <div>
      {/* Step info bar with lecture toggle */}
      <div
        className="flex items-center justify-between mb-4 pb-3"
        style={{ borderBottom: '1px solid var(--theme-border)' }}
      >
        <div className="flex items-center gap-2">
          <span
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ backgroundColor: '#3b82f6' }}
          >
            {currentStep + 1}
          </span>
          <span className="text-xs" style={{ color: 'var(--theme-muted-text)' }}>
            {t(
              `Step ${currentStep + 1} of ${totalSteps}`,
              `Pasul ${currentStep + 1} din ${totalSteps}`
            )}
            {step.group && (
              <span style={{ color: 'var(--theme-border)' }}> · {step.group}</span>
            )}
          </span>
        </div>
        <button
          onClick={() => setLectureVisible(v => !v)}
          className="flex items-center gap-2 text-xs cursor-pointer select-none"
          style={{ color: lectureVisible ? '#818cf8' : 'var(--theme-muted-text)' }}
        >
          🎓 {t('Lecture context', 'Context curs')}
          <span
            className="w-9 h-5 rounded-full relative transition-colors"
            style={{ backgroundColor: lectureVisible ? '#818cf8' : 'var(--theme-border)' }}
          >
            <span
              className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
              style={{ left: lectureVisible ? '18px' : '2px' }}
            />
          </span>
        </button>
      </div>

      {/* Progress strip */}
      <div className="flex gap-0.5 mb-5">
        {courseData.steps.map((s, i) => (
          <div
            key={s.id}
            className="flex-1 h-1 rounded-sm cursor-pointer transition-colors"
            style={{
              backgroundColor: i === currentStep
                ? '#3b82f6'
                : i < currentStep
                  ? '#10b981'
                  : 'var(--theme-border)',
              boxShadow: i === currentStep ? '0 0 6px rgba(59,130,246,0.4)' : 'none',
            }}
            onClick={() => goToStep(i)}
            title={t(s.title.en, s.title.ro)}
          />
        ))}
      </div>

      {/* Step title */}
      <h2
        className="text-lg font-bold mb-4"
        style={{ color: 'var(--theme-content-text)' }}
      >
        {t(step.title.en, step.title.ro)}
      </h2>

      {/* Step content */}
      <CourseTransition courseIndex={currentStep}>
        <StepRenderer step={step} lectureVisible={lectureVisible} />
      </CourseTransition>

      {/* Navigation */}
      <div
        className="flex justify-between mt-6 pt-4"
        style={{ borderTop: '1px solid var(--theme-border)' }}
      >
        <button
          onClick={() => goToStep(currentStep - 1)}
          className="text-sm px-4 py-2 rounded-lg transition-colors cursor-pointer"
          style={{
            color: currentStep > 0 ? '#3b82f6' : 'var(--theme-border)',
            pointerEvents: currentStep > 0 ? 'auto' : 'none',
          }}
        >
          ← {t('Previous', 'Anterior')}
        </button>
        <button
          onClick={() => goToStep(currentStep + 1)}
          className="text-sm px-4 py-2 rounded-lg transition-colors cursor-pointer"
          style={{
            color: currentStep < totalSteps - 1 ? '#3b82f6' : 'var(--theme-border)',
            pointerEvents: currentStep < totalSteps - 1 ? 'auto' : 'none',
          }}
        >
          {currentStep < totalSteps - 1
            ? t('Continue →', 'Continuă →')
            : t('Complete ✓', 'Complet ✓')}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify app starts**

Run: `npm run dev`
Expected: No errors. CourseRenderer is defined but not yet used.

- [ ] **Step 3: Commit**

```bash
git add src/components/blocks/CourseRenderer.jsx
git commit -m "feat: add CourseRenderer — loads JSON courses with step navigation"
```

---

### Task 8: Integrate CourseRenderer into SubjectPage

**Files:**
- Modify: `src/pages/SubjectPage.jsx`
- Modify: `src/content/os/index.js` (add one JSON course entry alongside existing JSX)

This creates the backwards-compat bridge: if a course entry has `src`, use `CourseRenderer`; if it has `component`, use the legacy JSX path.

- [ ] **Step 1: Add JSON course entry to OS index.js**

Add the sample JSON course as a second entry option. We add it as a **new test entry** at the end so existing courses aren't affected:

In `src/content/os/index.js`, add this entry at the end of the `courses` array (after the course_11 entry, before the `]`):

```js
    { id: 'os-c1-json', src: 'os/courses/course-01-sample.json' },
```

- [ ] **Step 2: Modify SubjectPage to support JSON courses**

In `src/pages/SubjectPage.jsx`, add the CourseRenderer import at the top with the other imports:

```jsx
import CourseRenderer from '../components/blocks/CourseRenderer';
```

Then in the courses tab rendering section, change the `activeCourse` rendering block. Find this code:

```jsx
{activeCourse ? (
  <CourseTransition courseIndex={activeCourseIndex}>
    <Suspense fallback={<LoadingFallback />}>
      {React.createElement(activeCourse.component)}
    </Suspense>
    <CourseNavigation
```

Replace with:

```jsx
{activeCourse ? (
  activeCourse.src ? (
    <>
      <CourseRenderer src={activeCourse.src} />
      <CourseNavigation
        items={subject.courses}
        currentIndex={activeCourseIndex}
        yearSem={yearSem}
        subjectSlug={subjectSlug}
      />
    </>
  ) : (
    <CourseTransition courseIndex={activeCourseIndex}>
      <Suspense fallback={<LoadingFallback />}>
        {React.createElement(activeCourse.component)}
      </Suspense>
      <CourseNavigation
```

The key change: if `activeCourse.src` exists, render `CourseRenderer`; otherwise use the old JSX path.

- [ ] **Step 3: Test in browser**

Run: `npm run dev`

1. Navigate to OS subject
2. Click on the last course in the sidebar (the new JSON test entry)
3. Verify: Step-based UI renders with the sample content
4. Click through steps — navigation works
5. Lecture toggle shows/hides nothing (no lecture blocks in sample yet)
6. Go back to a regular course (e.g., Course 1) — legacy JSX still works
7. Dark mode, palettes still work

- [ ] **Step 4: Commit**

```bash
git add src/pages/SubjectPage.jsx src/content/os/index.js
git commit -m "feat: integrate CourseRenderer into SubjectPage with backwards compat"
```

---

### Task 9: Stub Remaining Block Components

**Files:**
- Create: `src/components/blocks/diagram/DiagramBlock.jsx`
- Create: `src/components/blocks/media/ImageBlock.jsx`
- Create: `src/components/blocks/layout/TableBlock.jsx`
- Create: `src/components/blocks/layout/ListBlock.jsx`
- Create: `src/components/blocks/lecture/LectureNoteBlock.jsx`
- Create: `src/components/blocks/lecture/LectureVideoBlock.jsx`
- Create: `src/components/blocks/lecture/LectureExamBlock.jsx`
- Create: `src/components/blocks/interactive/AnimationBlock.jsx`
- Create: `src/components/blocks/interactive/CodeChallengeBlock.jsx`
- Create: `src/components/blocks/interactive/TerminalBlock.jsx`

These are registered in the registry but not yet used by the sample JSON. Create minimal stubs so the registry doesn't crash if a future JSON course uses them.

- [ ] **Step 1: Create all stub components**

Each stub follows the same pattern — render the block type name and raw data. Here's the template to use for all of them:

Create `src/components/blocks/diagram/DiagramBlock.jsx`:
```jsx
import React from 'react';
import { useApp } from '../../../contexts/AppContext';

export default function DiagramBlock({ variant, data }) {
  const { t } = useApp();
  return (
    <div className="rounded-xl p-4 mb-3" style={{ backgroundColor: 'color-mix(in srgb, #10b981 6%, var(--theme-card-bg))', border: '1px solid color-mix(in srgb, #10b981 15%, var(--theme-border))' }}>
      <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#10b981' }}>
        {t('Diagram', 'Diagramă')} — {variant || 'generic'}
      </div>
      <div className="text-xs" style={{ color: 'var(--theme-muted-text)' }}>
        {t('Diagram component placeholder. Variant: ', 'Placeholder componentă diagramă. Varianta: ')}{variant}
      </div>
    </div>
  );
}
```

Create `src/components/blocks/media/ImageBlock.jsx`:
```jsx
import React from 'react';

export default function ImageBlock({ src, alt, caption }) {
  return (
    <figure className="mb-3">
      <img src={src} alt={alt || ''} className="rounded-xl w-full" style={{ border: '1px solid var(--theme-border)' }} />
      {caption && <figcaption className="text-xs mt-1 text-center" style={{ color: 'var(--theme-muted-text)' }}>{caption}</figcaption>}
    </figure>
  );
}
```

Create `src/components/blocks/layout/TableBlock.jsx`:
```jsx
import React from 'react';
import { useApp } from '../../../contexts/AppContext';

export default function TableBlock({ headers, rows }) {
  const { t } = useApp();
  return (
    <div className="overflow-x-auto mb-3 rounded-xl" style={{ border: '1px solid var(--theme-border)' }}>
      <table className="w-full text-sm" style={{ color: 'var(--theme-content-text)' }}>
        {headers && (
          <thead>
            <tr style={{ backgroundColor: 'var(--theme-border)' }}>
              {headers.map((h, i) => <th key={i} className="px-3 py-2 text-left font-bold text-xs">{typeof h === 'object' ? t(h.en, h.ro) : h}</th>)}
            </tr>
          </thead>
        )}
        <tbody>
          {rows?.map((row, ri) => (
            <tr key={ri} style={ri % 2 ? { backgroundColor: 'var(--theme-card-bg)' } : {}}>
              {row.map((cell, ci) => <td key={ci} className="px-3 py-2 text-xs">{typeof cell === 'object' ? t(cell.en, cell.ro) : cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

Create `src/components/blocks/layout/ListBlock.jsx`:
```jsx
import React from 'react';
import { useApp } from '../../../contexts/AppContext';

export default function ListBlock({ ordered, items }) {
  const { t } = useApp();
  const Tag = ordered ? 'ol' : 'ul';
  return (
    <Tag className={`mb-3 text-sm leading-relaxed ${ordered ? 'list-decimal' : 'list-disc'} pl-5`} style={{ color: 'var(--theme-content-text)' }}>
      {items?.map((item, i) => <li key={i} className="mb-1">{typeof item === 'object' ? t(item.en, item.ro) : item}</li>)}
    </Tag>
  );
}
```

Create `src/components/blocks/lecture/LectureNoteBlock.jsx`:
```jsx
import React from 'react';
import { useApp } from '../../../contexts/AppContext';

export default function LectureNoteBlock({ slides, note, crossRef }) {
  const { t } = useApp();
  return (
    <div className="rounded-xl p-3 mb-3 flex items-start gap-3" style={{ backgroundColor: 'color-mix(in srgb, #818cf8 8%, var(--theme-card-bg))', border: '1px solid color-mix(in srgb, #818cf8 20%, var(--theme-border))' }}>
      <span className="text-lg">🎓</span>
      <div>
        {slides && <div className="text-xs font-bold" style={{ color: '#a5b4fc' }}>{t(`Slides ${slides}`, `Slide-urile ${slides}`)}</div>}
        {note && <div className="text-xs mt-1" style={{ color: 'var(--theme-muted-text)' }}>{t(note.en, note.ro)}</div>}
        {crossRef && <div className="text-xs mt-1" style={{ color: '#818cf8' }}>→ {crossRef}</div>}
      </div>
    </div>
  );
}
```

Create `src/components/blocks/lecture/LectureVideoBlock.jsx`:
```jsx
import React from 'react';

export default function LectureVideoBlock({ url, title, duration, relevance }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl p-3 mb-3 no-underline transition-colors" style={{ backgroundColor: 'color-mix(in srgb, #818cf8 6%, var(--theme-card-bg))', border: '1px solid color-mix(in srgb, #818cf8 15%, var(--theme-border))' }}>
      <div className="w-12 h-8 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'color-mix(in srgb, #ef4444 15%, var(--theme-card-bg))' }}>
        <span style={{ color: '#ef4444' }}>▶</span>
      </div>
      <div>
        <div className="text-xs font-bold" style={{ color: 'var(--theme-content-text)' }}>{title}</div>
        <div className="text-[10px]" style={{ color: 'var(--theme-muted-text)' }}>{duration}{relevance && ` · ${relevance}`}</div>
      </div>
    </a>
  );
}
```

Create `src/components/blocks/lecture/LectureExamBlock.jsx`:
```jsx
import React from 'react';
import { useApp } from '../../../contexts/AppContext';

export default function LectureExamBlock({ note, frequency, years }) {
  const { t } = useApp();
  const pct = frequency != null ? Math.round(frequency * 100) : null;
  return (
    <div className="rounded-xl p-3 mb-3" style={{ backgroundColor: 'color-mix(in srgb, #f59e0b 8%, var(--theme-card-bg))', borderLeft: '3px solid #f59e0b', border: '1px solid color-mix(in srgb, #f59e0b 15%, var(--theme-border))', borderLeftWidth: '3px', borderLeftColor: '#f59e0b' }}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#f59e0b' }}>⚠ {t('Exam', 'Examen')}</span>
        {pct != null && <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: 'color-mix(in srgb, #f59e0b 20%, var(--theme-card-bg))', color: '#f59e0b' }}>{pct}%</span>}
      </div>
      {note && <div className="text-xs" style={{ color: 'var(--theme-content-text)' }}>{t(note.en, note.ro)}</div>}
      {years?.length > 0 && <div className="text-[10px] mt-1" style={{ color: 'var(--theme-muted-text)' }}>{t('Appeared in: ', 'Apărut în: ')}{years.join(', ')}</div>}
    </div>
  );
}
```

Create `src/components/blocks/interactive/AnimationBlock.jsx`:
```jsx
import React from 'react';
import { useApp } from '../../../contexts/AppContext';

export default function AnimationBlock({ variant, data }) {
  const { t } = useApp();
  return (
    <div className="rounded-xl p-4 mb-3 text-center" style={{ backgroundColor: 'color-mix(in srgb, #10b981 6%, var(--theme-card-bg))', border: '1px solid color-mix(in srgb, #10b981 15%, var(--theme-border))' }}>
      <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#10b981' }}>🎬 {t('Animation', 'Animație')}</div>
      <div className="text-xs" style={{ color: 'var(--theme-muted-text)' }}>{t('Animation placeholder', 'Placeholder animație')}: {variant}</div>
    </div>
  );
}
```

Create `src/components/blocks/interactive/CodeChallengeBlock.jsx`:
```jsx
import React from 'react';
import CodeChallenge from '../../ui/CodeChallenge';

export default function CodeChallengeBlock(props) {
  return <CodeChallenge {...props} />;
}
```

Create `src/components/blocks/interactive/TerminalBlock.jsx`:
```jsx
import React from 'react';
import { useApp } from '../../../contexts/AppContext';

export default function TerminalBlock({ variant, ...props }) {
  const { t } = useApp();
  return (
    <div className="rounded-xl p-4 mb-3" style={{ backgroundColor: '#0a0a0f', border: '1px solid var(--theme-border)' }}>
      <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#10b981' }}>💻 {t('Terminal', 'Terminal')}</div>
      <div className="text-xs" style={{ color: 'var(--theme-muted-text)' }}>{t('Terminal placeholder', 'Placeholder terminal')}</div>
    </div>
  );
}
```

- [ ] **Step 2: Verify app starts and JSON course renders all block types**

Run: `npm run dev`
Navigate to the JSON test course. All blocks should render without errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/blocks/diagram/ src/components/blocks/media/ImageBlock.jsx src/components/blocks/layout/TableBlock.jsx src/components/blocks/layout/ListBlock.jsx src/components/blocks/lecture/ src/components/blocks/interactive/
git commit -m "feat: add all block component stubs — diagram, media, layout, lecture, interactive"
```

---

### Task 10: End-to-End Verification

- [ ] **Step 1: Full app test**

Run: `npm run dev`

Verify all of these work:
1. Home page loads
2. Navigate to OS → existing Course 1 (JSX) renders normally
3. Navigate to the JSON test course (last entry) → step-based UI renders
4. Click through all 3 steps — transitions work
5. ThinkBlock reveal/hide works
6. QuizBlock selection and checking works
7. Code block renders with syntax coloring
8. Lecture toggle does nothing (no lecture blocks in sample) — but doesn't crash
9. Switch to Lecture Review tab — seminars, labs, practice, tests tabs all still work
10. Dark/light mode works
11. All 5 palettes work
12. Sidebar works for both JSX and JSON courses
13. Chat panel still opens/closes

- [ ] **Step 2: Build check**

Run: `npm run build`
Expected: Builds successfully with no errors.

- [ ] **Step 3: Remove sample JSON test entry from OS index**

In `src/content/os/index.js`, remove the test entry we added:
```js
    { id: 'os-c1-json', src: 'os/courses/course-01-sample.json' },
```

Keep the `course-01-sample.json` file — it's useful as a reference.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete core block system — registry, renderer, all block types, SubjectPage integration"
```

---

## Summary of Files Created/Modified

### Created (21 files):
- `src/content/os/courses/course-01-sample.json`
- `src/components/blocks/registry.js`
- `src/components/blocks/BlockRenderer.jsx`
- `src/components/blocks/UnknownBlock.jsx`
- `src/components/blocks/StepRenderer.jsx`
- `src/components/blocks/CourseRenderer.jsx`
- `src/components/blocks/learn/LearnBlock.jsx`
- `src/components/blocks/definition/DefinitionBlock.jsx`
- `src/components/blocks/layout/CalloutBlock.jsx`
- `src/components/blocks/layout/TableBlock.jsx`
- `src/components/blocks/layout/ListBlock.jsx`
- `src/components/blocks/assessment/ThinkBlock.jsx`
- `src/components/blocks/assessment/QuizBlock.jsx`
- `src/components/blocks/media/CodeBlock.jsx`
- `src/components/blocks/media/ImageBlock.jsx`
- `src/components/blocks/diagram/DiagramBlock.jsx`
- `src/components/blocks/lecture/LectureNoteBlock.jsx`
- `src/components/blocks/lecture/LectureVideoBlock.jsx`
- `src/components/blocks/lecture/LectureExamBlock.jsx`
- `src/components/blocks/interactive/AnimationBlock.jsx`
- `src/components/blocks/interactive/CodeChallengeBlock.jsx`
- `src/components/blocks/interactive/TerminalBlock.jsx`

### Modified (2 files):
- `src/pages/SubjectPage.jsx` — Added CourseRenderer import + `src` vs `component` branching
- `src/content/os/index.js` — Temporarily added JSON test entry (removed in Task 10)
