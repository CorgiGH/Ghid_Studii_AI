# AI Chatbot Professor Assistant — Design Spec

## Overview

Add an AI-powered chatbot and answer verifier to the study guide platform. The chatbot acts as a CS tutor that knows the current course content and general CS knowledge. The answer verifier evaluates student answers to practice questions with semantic understanding.

Both features live in a single collapsible right-side panel with two tabs: **Chat** and **Check Answer**.

## Architecture

```
Browser (GitHub Pages)          VPS (Express proxy)           LLM APIs
┌─────────────────────┐    ┌──────────────────────┐    ┌──────────────┐
│  React App          │    │  /api/chat           │    │  Groq        │
│  ┌───────────────┐  │───>│    - builds prompt   │───>│  Llama 3.3   │
│  │ ChatPanel     │  │<───│    - streams SSE     │<───│  70B         │
│  │  - Chat tab   │  │    │    - no cache        │    └──────────────┘
│  │  - Verify tab │  │    │                      │           │
│  └───────────────┘  │    │  /api/verify         │    ┌──────┴───────┐
│                     │    │    - checks cache     │    │  OpenRouter  │
│  Page context       │    │    - caches responses │    │  (fallback)  │
│  extracted from     │    │    - falls back on    │    │  70B model   │
│  current section    │    │    429                │    └──────────────┘
│  via scroll pos     │    │                      │
└─────────────────────┘    │  In-memory Map cache │
                           │  CORS: GH Pages only │
                           └──────────────────────┘
```

### Request Flow

1. Student types in ChatPanel → browser POSTs to VPS proxy with `{ message, history[], pageContext, subjectSyllabus }` (chat) or `{ question, studentAnswer, type, options?, correct?, keyConcepts?, modelAnswer? }` (verify)
2. Proxy builds system prompt with role + context
3. For verify: checks in-memory cache (key = `hash(question + studentAnswer)`). Cache hit → return immediately.
4. Forwards to Groq (Llama 3.3 70B). If 429 → retry via OpenRouter (70B-class fallback model).
5. Streams response back via SSE. For verify: caches before returning.

### LLM Choice

- **Primary**: Groq API (free tier) — Llama 3.3 70B. 14,400 requests/day, ~6K tokens/min throughput. Fast inference.
- **Fallback**: OpenRouter free tier — 70B-class model (DeepSeek V3 or Llama 3.3 70B). Auto-triggered on Groq 429.
- General CS knowledge comes from the model's training data. System prompt instructs it to ground answers in course material when applicable.

### Caching Strategy

- **Chat**: no cache. Conversational queries are too varied and context-dependent.
- **Verification**: in-memory Map. Key = `hash(question + studentAnswer)`. Cleared on server restart (acceptable for study guide scale).

## Layout Changes

### Current Layout
```
| Sidebar (~20%) |     Content (~50%)     | ProgressSidebar (~30%) |
```

### New Layout
```
| Sidebar (15%) |      Content (55%)       | ChatPanel (30%) |
```

When chat panel is collapsed:
```
| Sidebar (15%) |            Content (~85%)                  |
```

When sidebar is unlocked (hidden) + chat open:
```
|         Content (~70%)          | ChatPanel (30%) |
```

When both collapsed/hidden:
```
|                  Content (~100%)                   |
```

### Content Area Changes
- Base font size increased for readability
- ProgressSidebar component removed entirely
- Progress bar + mini progress ring relocated to a slim row between breadcrumbs and content area
  - No text labels — only colored segment bars (green = done, blue = in progress, dark = not started) and the animated ring
  - Scoped to the content column only

## Sidebar Lock/Unlock

### Locked Mode (default)
- Sidebar pinned at 15% width
- Slim tab button with left-pointing chevron on the sidebar's right edge, vertically centered
- Click tab to unlock

### Unlocked Mode
- Sidebar hidden, content expands to fill its space
- Slim tab button with right-pointing chevron protrudes from the left edge of the content area, vertically centered
- Hover near tab or click to slide sidebar out as an **overlay** (on top of content, does not push layout)
- Sidebar auto-hides when mouse leaves

### Tab Button Style
- Compact/slim — small enough to not distract, visible enough to find
- Dark background (`#1e293b`), blue chevron (`#3b82f6`), subtle shadow
- Rounded on the protruding side only (e.g., `border-radius: 0 6px 6px 0`)

### Auto-Peek
- When student completes all sections of a course, the sidebar slides in for ~2 seconds showing the updated progress ring animating, then slides back out
- Only triggers in unlocked mode

### Persistence
- Lock state stored in localStorage via AppContext

## Chat Panel Component

### Structure
- Collapsible right-side panel, 30% width
- Open/closed state persisted in localStorage
- Two tabs at top: **Chat** and **Check Answer**

### Chat Tab
- Multi-turn conversation with history
- History kept in component state — cleared on page navigation (fresh chat per course)
- Streaming responses (tokens rendered as they arrive via SSE)
- "New conversation" button to clear history
- System prompt includes:
  - Role: CS tutor
  - Current section content (extracted via scroll position detection from rendered component `innerText`, ~500-1K tokens)
  - Subject syllabus summary (static export from subject's `index.js`, ~200 words)
  - Instruction: respond in whatever language the student writes in
  - Instruction: use general CS knowledge when relevant, ground in course material when applicable

### Check Answer Tab
- Two input methods:
  1. **"Check with AI" buttons** on `MultipleChoice` and open-ended question components — auto-sends question + student's answer to the panel
  2. **Free text input** at bottom of panel — student types any question/answer manually
- Color-coded verdict display:
  - Green border + checkmark = correct
  - Amber border + tilde = partial
  - Red border + X = wrong
- Each verdict includes an explanation from the LLM
- For MC: sends question text, all options, student's selection, correct answer index, explanation, key concepts
- For open-ended: sends question, student's answer, key concepts, model answer

### Language Behavior
- Auto-detects from student's message (not tied to app `lang` toggle)
- System prompt tells LLM to respond in the language the student writes in

### Mobile (deferred)
- Not in scope for this iteration
- Penciled in: bottom sheet overlay (~60% screen height) for future implementation

## Verification Data Files

Separate JS data files per course, stored alongside course content:

```
src/content/os/verify/
  course_1.js
  course_2.js
  ...
```

### Schema

```js
export default {
  courseId: 'course_2',
  questions: [
    {
      id: 'c2-q1',
      type: 'multiple-choice',
      question: 'What does fork() return to the child process?',
      options: ['The parent PID', '0', '-1', 'The child PID'],
      correct: 1,
      explanation: 'fork() returns 0 to the child process...',
      keyConcepts: ['fork', 'return values', 'parent-child']
    },
    {
      id: 'c2-q2',
      type: 'open-ended',
      question: 'Explain the difference between fork() and exec()',
      keyConcepts: ['process duplication', 'program replacement', 'PID preservation'],
      modelAnswer: 'fork() creates a copy of the current process...'
    }
  ]
};
```

- `keyConcepts` and `modelAnswer` are sent to the LLM for semantic evaluation — not used for exact matching
- These files are designed to be batch-editable and machine-readable for future exercise generation

## VPS Proxy Server

### Stack
- Node.js + Express (~80 lines)
- PM2 for process management and auto-restart
- `.env` file for API keys

### Endpoints

**`POST /api/chat`**
- Body: `{ message, history[], pageContext, subjectSyllabus }`
- Builds system prompt with role + context
- Streams response via SSE (Server-Sent Events)
- No caching
- On Groq 429 → retry via OpenRouter

**`POST /api/verify`**
- Body: `{ question, studentAnswer, type, options?, correct?, keyConcepts?, modelAnswer? }`
- Cache key: `hash(question + studentAnswer)`
- Cache hit → return cached response immediately
- Cache miss → build evaluator prompt, forward to Groq, cache response, return
- On Groq 429 → fallback to OpenRouter

### Security
- CORS whitelist: `https://corgigh.github.io` only
- API keys stored in `.env` on VPS, never exposed to browser
- No authentication required (public study guide)

### Token Budget
- Page context limited to current section (~500-1K tokens) via scroll position detection
- Subject syllabus ~200 words (~300 tokens)
- Conversation history included (multi-turn)
- Total per request: ~2-4K tokens
- Groq free tier: ~6K tokens/min — sufficient for small concurrent user base

## Integration Points

### Modified Existing Components

| Component | Change |
|-----------|--------|
| `SubjectPage.jsx` | New 3-column layout, conditional on chat/sidebar state |
| `Sidebar.jsx` | Lock/unlock toggle, slim tab button, auto-peek animation |
| `AppShell.jsx` | Manage sidebar lock and chat panel open states |
| `AppContext.jsx` | Add `sidebarLocked` and `chatOpen` state (localStorage persisted) |
| `ReadingProgress.jsx` | Relocate to slim row above content, strip text, keep segments + ring |
| `MultipleChoice.jsx` | Add "Check with AI" button |

### Removed Components

| Component | Reason |
|-----------|--------|
| `ProgressSidebar.jsx` | Replaced by chat panel; progress bar relocated above content |

### New Components

| Component | Purpose |
|-----------|---------|
| `ChatPanel.jsx` | Right-side panel with Chat/Check Answer tabs, message list, input, streaming |
| `ChatMessage.jsx` | Individual message bubble — user vs AI styles, color-coded verdicts |

### New Files

| Path | Purpose |
|------|---------|
| `src/content/<subject>/verify/*.js` | Verification data per course |
| `src/services/api.js` | Thin wrapper for proxy API calls (chat stream, verify) |
| `proxy/server.js` | Express proxy server (directory in this repo, deployed separately to VPS) |
| `proxy/.env` | API keys (gitignored) |
| `proxy/package.json` | Express + cors dependencies |

### No New Frontend Dependencies
- SSE streaming via native `fetch` + `ReadableStream`
- No state management library needed — component state + AppContext sufficient
