# AI Chatbot Professor Assistant — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an AI chatbot tutor and answer verifier as a collapsible right-side panel, with a lockable sidebar, relocated progress bar, and a VPS proxy server for Groq/OpenRouter LLM calls.

**Architecture:** React frontend with a new `ChatPanel` component in the right 30% of the layout. A separate Express proxy on the VPS holds API keys and forwards to Groq (Llama 3.3 70B) with OpenRouter fallback. Verification responses are cached in-memory. The existing sidebar becomes lockable/unlockable with a slim protruding tab button.

**Tech Stack:** React 19, Express, Groq API (OpenAI-compatible), native fetch + ReadableStream for SSE, CSS transitions for sidebar animations, localStorage for state persistence.

---

## File Map

### New Files

| Path | Responsibility |
|------|---------------|
| `src/components/ui/ChatPanel.jsx` | Right-side panel: Chat/Check Answer tabs, message list, streaming display, input |
| `src/components/ui/ChatMessage.jsx` | Single message bubble: user vs AI styles, color-coded verdicts for verification |
| `src/components/ui/SidebarToggle.jsx` | Slim protruding chevron tab for lock/unlock |
| `src/components/ui/InlineProgress.jsx` | Slim progress segment bar + mini ring row (replaces ProgressSidebar) |
| `src/services/api.js` | Thin wrapper: `streamChat()` and `verifyAnswer()` calling VPS proxy |
| `src/content/os/verify/course_1.js` | Verification data for OS Course 1 (example/template) |
| `proxy/server.js` | Express proxy: `/api/chat` (streaming), `/api/verify` (cached) |
| `proxy/package.json` | Express + cors dependencies |
| `proxy/.env.example` | Template for API keys |
| `proxy/.gitignore` | Ignore `.env` |

### Modified Files

| Path | Change |
|------|--------|
| `src/contexts/AppContext.jsx` | Add `sidebarLocked`, `chatOpen` state (localStorage) |
| `src/pages/SubjectPage.jsx` | New 3-column layout, replace ProgressSidebar with ChatPanel + InlineProgress |
| `src/components/layout/Sidebar.jsx` | Width 15%, lock/unlock behavior, auto-peek animation |
| `src/components/layout/AppShell.jsx` | Pass sidebar lock state down |
| `src/components/ui/MultipleChoice.jsx` | Add "Check with AI" button |

### Removed Files

| Path | Reason |
|------|--------|
| `src/components/ui/ProgressSidebar.jsx` | Replaced by InlineProgress + ChatPanel |

---

## Task 1: Add AppContext State for Sidebar Lock and Chat Panel

**Files:**
- Modify: `src/contexts/AppContext.jsx`

- [ ] **Step 1: Add `sidebarLocked` and `chatOpen` localStorage state**

In `src/contexts/AppContext.jsx`, add two new `useLocalStorage` hooks and expose them in the context value:

```jsx
// Add after the existing useLocalStorage calls (line 44):
const [sidebarLocked, setSidebarLocked] = useLocalStorage('sidebarLocked', true);
const [chatOpen, setChatOpen] = useLocalStorage('chatOpen', true);
```

Add `toggleSidebarLock` and `toggleChat` callbacks:

```jsx
const toggleSidebarLock = useCallback(() => setSidebarLocked(l => !l), []);
const toggleChat = useCallback(() => setChatOpen(c => !c), []);
```

Add all four to the `value` useMemo:

```jsx
const value = useMemo(() => ({
  dark, setDark, toggleDark,
  lang, setLang, toggleLang,
  palette, setPalette,
  search, setSearch,
  checked, setChecked, toggleCheck,
  t, highlight,
  sidebarLocked, setSidebarLocked, toggleSidebarLock,
  chatOpen, setChatOpen, toggleChat,
}), [dark, lang, palette, search, checked, t, toggleCheck, highlight, toggleDark, toggleLang, sidebarLocked, chatOpen, toggleSidebarLock, toggleChat]);
```

- [ ] **Step 2: Verify the app still renders**

Run: `npm run dev`

Open `http://localhost:5173` — confirm the app loads without errors. Check browser console for no warnings.

- [ ] **Step 3: Commit**

```bash
git add src/contexts/AppContext.jsx
git commit -m "feat: add sidebarLocked and chatOpen state to AppContext"
```

---

## Task 2: Create InlineProgress Component

**Files:**
- Create: `src/components/ui/InlineProgress.jsx`

- [ ] **Step 1: Create the InlineProgress component**

This replaces ProgressSidebar — a slim horizontal row with colored segments and a mini progress ring. No text labels.

```jsx
import React from 'react';
import { useApp } from '../../contexts/AppContext';
import ProgressRing from './ProgressRing';

const InlineProgress = ({ courseId, sectionCount, sectionIds }) => {
  const { checked } = useApp();

  if (!sectionCount || sectionCount === 0) return null;

  const prefix = `${courseId}-`;
  const completedCount = Object.keys(checked).filter(k => k.startsWith(prefix) && checked[k]).length;

  return (
    <div
      className="flex items-center gap-3 px-4 py-2"
      style={{ borderBottom: '1px solid var(--theme-border)' }}
    >
      <div className="flex-1 flex gap-[3px] h-[5px]">
        {Array.from({ length: sectionCount }, (_, i) => {
          const sectionId = sectionIds?.[i];
          const isChecked = sectionId ? checked[sectionId] : i < completedCount;
          const isNext = !isChecked && i === completedCount;
          return (
            <div
              key={i}
              className="flex-1 rounded-sm transition-colors duration-300"
              style={{
                background: isChecked
                  ? '#22c55e'
                  : isNext
                    ? 'linear-gradient(90deg, #3b82f6 60%, var(--theme-border) 60%)'
                    : 'var(--theme-border)',
              }}
            />
          );
        })}
      </div>
      <ProgressRing size={22} completed={completedCount} total={sectionCount} />
    </div>
  );
};

export default InlineProgress;
```

- [ ] **Step 2: Verify it renders**

We'll integrate it in Task 5 (SubjectPage layout). For now, confirm the file has no syntax errors by importing it temporarily in the browser console or by running the dev server.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/InlineProgress.jsx
git commit -m "feat: add InlineProgress component (segment bar + mini ring)"
```

---

## Task 3: Create SidebarToggle Component

**Files:**
- Create: `src/components/ui/SidebarToggle.jsx`

- [ ] **Step 1: Create the slim chevron tab button**

```jsx
import React from 'react';

const SidebarToggle = ({ locked, onToggle, side = 'sidebar' }) => {
  // When on the sidebar edge (locked): chevron points left (collapse)
  // When on the content edge (unlocked): chevron points right (expand)
  const pointsRight = side === 'content';

  return (
    <button
      onClick={onToggle}
      className="absolute top-1/2 -translate-y-1/2 z-30 flex items-center justify-center transition-colors duration-200 hover:brightness-125"
      style={{
        right: side === 'sidebar' ? '-12px' : undefined,
        left: side === 'content' ? '0px' : undefined,
        width: '12px',
        height: '36px',
        background: '#1e293b',
        border: '1px solid #334155',
        borderLeft: side === 'content' ? 'none' : undefined,
        borderRight: side === 'sidebar' ? 'none' : undefined,
        borderRadius: side === 'content' ? '0 6px 6px 0' : '6px 0 0 6px',
        boxShadow: '2px 0 6px rgba(0,0,0,0.2)',
        cursor: 'pointer',
      }}
      aria-label={locked ? 'Unlock sidebar' : 'Lock sidebar'}
    >
      <svg width="7" height="10" viewBox="0 0 7 10" fill="none">
        <path
          d={pointsRight ? 'M1 1L6 5L1 9' : 'M6 1L1 5L6 9'}
          stroke="#3b82f6"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};

export default SidebarToggle;
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/SidebarToggle.jsx
git commit -m "feat: add SidebarToggle chevron tab component"
```

---

## Task 4: Update Sidebar with Lock/Unlock Behavior

**Files:**
- Modify: `src/components/layout/Sidebar.jsx`

- [ ] **Step 1: Add lock/unlock props and overlay behavior**

Replace the entire `Sidebar.jsx` with the updated version. Key changes:
- Accept `locked`, `onToggleLock` props
- When unlocked: sidebar is hidden, appears as overlay on hover
- When locked: pinned at width with the toggle tab on the right edge
- Auto-peek animation on course completion

```jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import ProgressRing from '../ui/ProgressRing';
import SidebarToggle from '../ui/SidebarToggle';

const Sidebar = ({ items, activeCourseId, open, onClose, yearSem, subjectSlug, routePrefix, locked, onToggleLock }) => {
  const navigate = useNavigate();
  const { lang, t, checked } = useApp();
  const [hoveredId, setHoveredId] = useState(null);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [peeking, setPeeking] = useState(false);
  const hideTimeoutRef = useRef(null);
  const prevCompletedRef = useRef(null);

  if (!items?.length) return null;

  const handleItemClick = (item) => {
    const match = item.id.match(new RegExp(routePrefix + '(\\d+)$'));
    if (match) {
      navigate(`/${yearSem}/${subjectSlug}/${routePrefix}${match[1]}`);
    }
    onClose();
    if (!locked) setOverlayVisible(false);
  };

  // Count total completed courses for auto-peek
  const totalCompleted = items.reduce((count, course) => {
    const total = course.sectionCount || 0;
    if (total === 0) return count;
    const prefix = `${course.id}-`;
    const done = Object.keys(checked).filter(k => k.startsWith(prefix) && checked[k]).length;
    return done >= total ? count + 1 : count;
  }, 0);

  // Auto-peek when a course is newly completed (unlocked mode only)
  useEffect(() => {
    if (locked) return;
    if (prevCompletedRef.current === null) {
      prevCompletedRef.current = totalCompleted;
      return;
    }
    if (totalCompleted > prevCompletedRef.current) {
      setPeeking(true);
      const timer = setTimeout(() => setPeeking(false), 2000);
      prevCompletedRef.current = totalCompleted;
      return () => clearTimeout(timer);
    }
    prevCompletedRef.current = totalCompleted;
  }, [totalCompleted, locked]);

  const handleMouseEnter = () => {
    if (locked) return;
    clearTimeout(hideTimeoutRef.current);
    setOverlayVisible(true);
  };

  const handleMouseLeave = () => {
    if (locked) return;
    hideTimeoutRef.current = setTimeout(() => setOverlayVisible(false), 200);
  };

  const showSidebar = locked || overlayVisible || peeking;

  return (
    <>
      {/* Mobile overlay backdrop */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      {/* Hover zone when unlocked — invisible strip on the left edge */}
      {!locked && (
        <div
          className="hidden lg:block fixed top-20 left-0 z-30 h-[calc(100vh-5rem)]"
          style={{ width: '16px' }}
          onMouseEnter={handleMouseEnter}
        >
          <SidebarToggle locked={false} onToggle={onToggleLock} side="content" />
        </div>
      )}

      <aside
        className={`
          fixed lg:${locked ? 'sticky' : 'fixed'} top-20 left-0 z-50 lg:z-auto
          h-[calc(100vh-5rem)] overflow-y-auto
          p-3 text-sm
          transition-all duration-200
          ${open ? 'translate-x-0' : (showSidebar ? 'translate-x-0' : '-translate-x-full')}
          ${!locked ? 'lg:shadow-xl' : ''}
        `}
        style={{
          width: locked ? '15%' : '15%',
          minWidth: locked ? '160px' : '160px',
          backgroundColor: 'var(--theme-sidebar-bg)',
          borderRight: '1px solid var(--theme-sidebar-border)',
          position: locked ? undefined : 'fixed',
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Lock toggle tab — only in locked mode on desktop */}
        {locked && (
          <div className="hidden lg:block">
            <SidebarToggle locked={true} onToggle={onToggleLock} side="sidebar" />
          </div>
        )}

        <div className="lg:hidden flex justify-end mb-2">
          <button
            onClick={onClose}
            className="p-1 rounded transition"
            style={{ backgroundColor: 'var(--theme-hover-bg)' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          {items.map(course => {
            const total = course.sectionCount || 0;
            const prefix = `${course.id}-`;
            const completed = total > 0
              ? Object.keys(checked).filter(k => k.startsWith(prefix) && checked[k]).length
              : 0;
            const isActive = activeCourseId === course.id;
            const isComplete = total > 0 && completed >= total;
            const hasProgress = completed > 0;
            const isHovered = hoveredId === course.id && !isActive;

            const buttonStyle = {
              position: 'relative',
              border: '1.5px solid transparent',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              ...(isActive ? {
                transform: 'scale(1.07)',
                borderColor: '#3b82f6',
                backgroundColor: 'var(--theme-hover-bg)',
                boxShadow: '0 4px 20px rgba(59, 130, 246, 0.25), 0 0 0 1px rgba(59, 130, 246, 0.1)',
              } : isHovered ? {
                transform: 'scale(1.04)',
                borderColor: 'rgba(59, 130, 246, 0.25)',
                backgroundColor: 'var(--theme-hover-bg)',
                boxShadow: '0 2px 12px rgba(59, 130, 246, 0.1)',
              } : {
                transform: 'scale(1)',
                borderColor: 'transparent',
                backgroundColor: 'transparent',
                boxShadow: 'none',
              }),
            };

            return (
              <button
                key={course.id}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg w-full text-left"
                style={buttonStyle}
                onMouseEnter={() => setHoveredId(course.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => handleItemClick(course)}
              >
                {isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      left: '-1px',
                      top: '20%',
                      bottom: '20%',
                      width: '3px',
                      borderRadius: '0 3px 3px 0',
                      background: '#3b82f6',
                    }}
                  />
                )}
                <ProgressRing
                  size={20}
                  completed={completed}
                  total={total}
                  isActive={isActive}
                />
                <div className="flex-1 min-w-0">
                  <div
                    className="text-xs truncate"
                    style={{
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? '#fff' : (isComplete ? '#16a34a' : 'var(--theme-content-text)'),
                      opacity: !hasProgress && !isActive ? 0.5 : 1,
                    }}
                  >
                    {course.shortTitle[lang]}
                  </div>
                  {total > 0 && (
                    <div className="text-[10px]" style={{ color: isComplete ? '#22c55e' : 'var(--theme-muted-text)' }}>
                      {isComplete ? t('Complete', 'Complet') : `${completed}/${total}`}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
```

- [ ] **Step 2: Verify sidebar renders in both modes**

Run: `npm run dev`

Open a course page. The sidebar should appear locked by default with the chevron tab on its right edge. Clicking the tab should hide the sidebar. Hovering the left edge should reveal it as an overlay.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Sidebar.jsx
git commit -m "feat: add lock/unlock behavior and auto-peek to Sidebar"
```

---

## Task 5: Update SubjectPage Layout (3-Column + InlineProgress)

**Files:**
- Modify: `src/pages/SubjectPage.jsx`

- [ ] **Step 1: Replace ProgressSidebar with InlineProgress, add ChatPanel placeholder**

Replace the full SubjectPage. Key changes:
- Remove `ProgressSidebar` import
- Add `InlineProgress` import
- Add `ChatPanel` import (placeholder `div` until Task 8)
- Pass `locked` / `onToggleLock` to Sidebar
- New flex layout: sidebar (15% when locked) | content (flex-1) | chat panel (30% when open)
- InlineProgress row between Breadcrumbs and content
- Content area gets larger font via wrapper style

```jsx
import React, { Suspense, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { getSubject } from '../content/registry';
import Sidebar from '../components/layout/Sidebar';
import Breadcrumbs from '../components/layout/Breadcrumbs';
import ContentTypeBar from '../components/ui/ContentTypeBar';
import CourseMap from '../components/ui/CourseMap';
import InlineProgress from '../components/ui/InlineProgress';
import CourseTransition from '../components/ui/CourseTransition';
import CourseNavigation from '../components/ui/CourseNavigation';
import { CourseBlock } from '../components/ui';

function PracticeTab({ practice: LazyPractice }) {
  return <LazyPractice />;
}

const LoadingFallback = () => {
  const { t } = useApp();
  return <div className="animate-pulse p-4 text-sm opacity-50">{t('Loading...', 'Se încarcă...')}</div>;
};

export default function SubjectPage({ sidebarOpen, setSidebarOpen }) {
  const { yearSem, subject: subjectSlug, '*': wildcard } = useParams();
  const navigate = useNavigate();
  const { lang, t, sidebarLocked, toggleSidebarLock, chatOpen } = useApp();
  const subject = getSubject(subjectSlug);

  const courseMatch = wildcard?.match(/^course_(\d+)$/);
  const courseNum = courseMatch ? courseMatch[1] : null;

  const labMatch = wildcard?.match(/^lab_(\d+)$/);
  const labNum = labMatch ? labMatch[1] : null;

  const tab = courseNum
    ? 'courses'
    : labNum
      ? 'labs'
      : ['seminars', 'labs', 'practice', 'tests'].includes(wildcard) ? wildcard : 'courses';

  const activeCourse = useMemo(() => {
    if (!courseNum || !subject) return null;
    return subject.courses.find(c => c.id.endsWith('course_' + courseNum)) || null;
  }, [courseNum, subject]);

  const activeCourseIndex = useMemo(() => {
    if (!activeCourse || !subject) return -1;
    return subject.courses.findIndex(c => c.id === activeCourse.id);
  }, [activeCourse, subject]);

  const sectionIds = useMemo(() => {
    if (!activeCourse?.sections) return [];
    return activeCourse.sections.map(s => s.id);
  }, [activeCourse]);

  const activeLab = useMemo(() => {
    if (!labNum || !subject) return null;
    return subject.labs?.find(l => l.id.endsWith('lab_' + labNum)) || null;
  }, [labNum, subject]);

  const activeLabIndex = useMemo(() => {
    if (!activeLab || !subject) return -1;
    return subject.labs.findIndex(l => l.id === activeLab.id);
  }, [activeLab, subject]);

  const labSectionIds = useMemo(() => activeLab?.sections?.map(s => s.id) || [], [activeLab]);

  if (!subject) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-lg opacity-60">{t('Subject not found', 'Materia nu a fost găsită')}</p>
      </div>
    );
  }

  const handleTabChange = (tabId) => {
    if (tabId === 'courses') {
      navigate(`/${yearSem}/${subjectSlug}`);
    } else {
      navigate(`/${yearSem}/${subjectSlug}/${tabId}`);
    }
  };

  const handleCourseMapClick = (courseId) => {
    const match = courseId.match(/course_(\d+)$/);
    if (match) {
      navigate(`/${yearSem}/${subjectSlug}/course_${match[1]}`);
    }
  };

  // Determine which item is active for inline progress
  const activeItem = activeCourse || activeLab;
  const activeItemSectionIds = activeCourse ? sectionIds : labSectionIds;

  return (
    <div className="flex flex-col flex-1">
      <ContentTypeBar subject={subject} activeTab={tab} onTabChange={handleTabChange} />

      <Breadcrumbs
        yearSem={yearSem}
        subject={subject}
        tab={tab}
        activeItemTitle={activeCourse ? activeCourse.shortTitle[lang] : activeLab ? activeLab.shortTitle[lang] : undefined}
      />

      <div className="flex flex-1">
        {/* Left sidebar */}
        {tab === 'courses' && subject.courses.length > 0 && (
          <Sidebar
            items={subject.courses}
            activeCourseId={activeCourse?.id || null}
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            yearSem={yearSem}
            subjectSlug={subjectSlug}
            routePrefix="course_"
            locked={sidebarLocked}
            onToggleLock={toggleSidebarLock}
          />
        )}

        {tab === 'labs' && subject.labs?.length > 0 && (
          <Sidebar
            items={subject.labs}
            activeCourseId={activeLab?.id || null}
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            yearSem={yearSem}
            subjectSlug={subjectSlug}
            routePrefix="lab_"
            locked={sidebarLocked}
            onToggleLock={toggleSidebarLock}
          />
        )}

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-h-[calc(100vh-120px)]">
          {/* Inline progress bar — only when viewing a specific course or lab */}
          {activeItem && activeItem.sectionCount > 0 && (
            <InlineProgress
              courseId={activeItem.id}
              sectionCount={activeItem.sectionCount}
              sectionIds={activeItemSectionIds}
            />
          )}

          <main className="flex-1 max-w-5xl mx-auto p-4 lg:p-8" style={{ fontSize: '1.05rem' }}>
            {tab === 'courses' && (
              <>
                {activeCourse ? (
                  <CourseTransition courseIndex={activeCourseIndex}>
                    <Suspense fallback={<LoadingFallback />}>
                      {React.createElement(activeCourse.component)}
                    </Suspense>
                    <CourseNavigation
                      items={subject.courses}
                      currentIndex={activeCourseIndex}
                      yearSem={yearSem}
                      subjectSlug={subjectSlug}
                    />
                  </CourseTransition>
                ) : (
                  <>
                    {subject.courses.length === 0 ? (
                      <div className="text-center py-12 opacity-60">
                        <p className="text-4xl mb-4">{subject.icon}</p>
                        <p className="text-lg font-medium">{t('Coming soon', 'În curând')}</p>
                        <p className="text-sm mt-2">{t('Course content will be added here.', 'Conținutul cursurilor va fi adăugat aici.')}</p>
                      </div>
                    ) : (
                      <CourseMap subject={subject} onCourseClick={handleCourseMapClick} />
                    )}
                  </>
                )}
              </>
            )}

            {tab === 'seminars' && subject.seminars && (
              <div>
                {subject.seminars.length === 0 ? (
                  <div className="text-center py-12 opacity-60">
                    <p className="text-4xl mb-4">{subject.icon}</p>
                    <p className="text-lg font-medium">{t('Coming soon', 'În curând')}</p>
                  </div>
                ) : (
                  subject.seminars.map(sem => {
                    const SemContent = sem.component;
                    return (
                      <CourseBlock key={sem.id} title={sem.title[lang]} id={sem.id}>
                        <Suspense fallback={<LoadingFallback />}>
                          <SemContent />
                        </Suspense>
                      </CourseBlock>
                    );
                  })
                )}
              </div>
            )}

            {tab === 'labs' && subject.labs && (
              <>
                {activeLab ? (
                  <CourseTransition courseIndex={activeLabIndex}>
                    <Suspense fallback={<LoadingFallback />}>
                      {React.createElement(activeLab.component)}
                    </Suspense>
                    <CourseNavigation
                      items={subject.labs}
                      currentIndex={activeLabIndex}
                      yearSem={yearSem}
                      subjectSlug={subjectSlug}
                      routePrefix="lab_"
                    />
                  </CourseTransition>
                ) : (
                  subject.labs.length === 0 ? (
                    <div className="text-center py-12 opacity-60">
                      <p className="text-4xl mb-4">{subject.icon}</p>
                      <p className="text-lg font-medium">{t('Coming soon', 'În curând')}</p>
                    </div>
                  ) : (
                    subject.labs.map(lab => {
                      const LabContent = lab.component;
                      return (
                        <CourseBlock key={lab.id} title={lab.title[lang]} id={lab.id}>
                          <Suspense fallback={<LoadingFallback />}>
                            <LabContent />
                          </Suspense>
                        </CourseBlock>
                      );
                    })
                  )
                )}
              </>
            )}

            {tab === 'practice' && (
              <Suspense fallback={<LoadingFallback />}>
                <PracticeTab practice={subject.practice} />
              </Suspense>
            )}

            {tab === 'tests' && subject.tests && (
              <div>
                {subject.tests.map(test => {
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
          </main>
        </div>

        {/* Right chat panel — placeholder until Task 8 */}
        {chatOpen && (
          <div
            className="hidden lg:flex flex-col flex-shrink-0 h-[calc(100vh-5rem)] sticky top-20"
            style={{
              width: '30%',
              minWidth: '280px',
              maxWidth: '400px',
              backgroundColor: 'var(--theme-sidebar-bg)',
              borderLeft: '1px solid var(--theme-sidebar-border)',
            }}
          >
            <div className="p-4 text-center opacity-50 text-sm">
              Chat panel placeholder
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify the new layout**

Run: `npm run dev`

Navigate to a course page. Verify:
- Left sidebar at ~15% with lock/unlock tab
- InlineProgress bar between breadcrumbs and content (segment bar + ring, no text)
- Content area fills the remaining space with larger font
- Placeholder chat panel on the right (30%)
- Toggling sidebar lock hides/shows sidebar
- Content expands when sidebar is unlocked

- [ ] **Step 3: Commit**

```bash
git add src/pages/SubjectPage.jsx
git commit -m "feat: new 3-column layout with InlineProgress, remove ProgressSidebar"
```

---

## Task 6: Create the API Service Layer

**Files:**
- Create: `src/services/api.js`

- [ ] **Step 1: Create api.js with streamChat and verifyAnswer**

```js
const PROXY_URL = import.meta.env.VITE_PROXY_URL || 'http://localhost:3001';

export async function streamChat({ message, history, pageContext, subjectSyllabus }, onChunk, onDone, onError) {
  try {
    const res = await fetch(`${PROXY_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history, pageContext, subjectSyllabus }),
    });

    if (!res.ok) {
      const err = await res.text();
      onError(err || `Error ${res.status}`);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            onDone();
            return;
          }
          try {
            const parsed = JSON.parse(data);
            if (parsed.content) onChunk(parsed.content);
            if (parsed.error) onError(parsed.error);
          } catch {
            // Skip malformed lines
          }
        }
      }
    }
    onDone();
  } catch (err) {
    onError(err.message || 'Network error');
  }
}

export async function verifyAnswer({ question, studentAnswer, type, options, correct, keyConcepts, modelAnswer }) {
  const res = await fetch(`${PROXY_URL}/api/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, studentAnswer, type, options, correct, keyConcepts, modelAnswer }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `Error ${res.status}`);
  }

  return res.json();
}
```

- [ ] **Step 2: Commit**

```bash
git add src/services/api.js
git commit -m "feat: add API service layer for chat streaming and answer verification"
```

---

## Task 7: Create ChatMessage Component

**Files:**
- Create: `src/components/ui/ChatMessage.jsx`

- [ ] **Step 1: Create ChatMessage with user/AI styles and verdict coloring**

```jsx
import React from 'react';

const verdictStyles = {
  correct: { borderColor: '#22c55e', icon: '\u2713', label: 'Correct', color: '#22c55e' },
  partial: { borderColor: '#f59e0b', icon: '~', label: 'Partial', color: '#f59e0b' },
  wrong: { borderColor: '#ef4444', icon: '\u2717', label: 'Wrong', color: '#ef4444' },
};

const ChatMessage = ({ role, content, verdict, isStreaming }) => {
  const isUser = role === 'user';
  const vStyle = verdict ? verdictStyles[verdict] : null;

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className="max-w-[90%] rounded-lg px-3 py-2 text-sm leading-relaxed"
        style={{
          backgroundColor: isUser ? '#1e293b' : '#1a2332',
          color: isUser ? '#ccc' : '#ddd',
          borderLeft: !isUser ? `2px solid ${vStyle?.borderColor || '#3b82f6'}` : undefined,
        }}
      >
        {vStyle && (
          <div className="font-bold text-xs mb-1" style={{ color: vStyle.color }}>
            {vStyle.icon} {vStyle.label}
          </div>
        )}
        <div className="whitespace-pre-wrap">{content}</div>
        {isStreaming && (
          <span className="inline-block w-1.5 h-4 ml-0.5 animate-pulse" style={{ backgroundColor: '#3b82f6' }} />
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/ChatMessage.jsx
git commit -m "feat: add ChatMessage component with verdict styling"
```

---

## Task 8: Create ChatPanel Component

**Files:**
- Create: `src/components/ui/ChatPanel.jsx`
- Modify: `src/pages/SubjectPage.jsx` (replace placeholder)

- [ ] **Step 1: Create ChatPanel with Chat and Check Answer tabs**

```jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../../contexts/AppContext';
import ChatMessage from './ChatMessage';
import { streamChat, verifyAnswer } from '../../services/api';

const ChatPanel = ({ pageContext, subjectSyllabus, onClose }) => {
  const { t, toggleChat } = useApp();
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState([]);
  const [verifyMessages, setVerifyMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages, verifyMessages, streamingContent]);

  const currentMessages = activeTab === 'chat' ? messages : verifyMessages;
  const setCurrentMessages = activeTab === 'chat' ? setMessages : setVerifyMessages;

  const buildHistory = () => {
    return messages.map(m => ({ role: m.role, content: m.content }));
  };

  const handleSendChat = useCallback(async (text) => {
    if (!text.trim() || isLoading) return;

    const userMsg = { role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setStreamingContent('');

    let fullResponse = '';

    await streamChat(
      {
        message: text.trim(),
        history: buildHistory(),
        pageContext: pageContext || '',
        subjectSyllabus: subjectSyllabus || '',
      },
      (chunk) => {
        fullResponse += chunk;
        setStreamingContent(fullResponse);
      },
      () => {
        setMessages(prev => [...prev, { role: 'assistant', content: fullResponse }]);
        setStreamingContent('');
        setIsLoading(false);
      },
      (error) => {
        setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error}` }]);
        setStreamingContent('');
        setIsLoading(false);
      }
    );
  }, [isLoading, pageContext, subjectSyllabus, messages]);

  const handleSendVerify = useCallback(async (text) => {
    if (!text.trim() || isLoading) return;

    const userMsg = { role: 'user', content: text.trim() };
    setVerifyMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await verifyAnswer({
        question: text.trim(),
        studentAnswer: text.trim(),
        type: 'open-ended',
        keyConcepts: [],
        modelAnswer: '',
      });
      setVerifyMessages(prev => [...prev, {
        role: 'assistant',
        content: result.explanation || result.content || 'No response',
        verdict: result.verdict || null,
      }]);
    } catch (err) {
      setVerifyMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${err.message}`,
      }]);
    }
    setIsLoading(false);
  }, [isLoading]);

  // Public method for "Check with AI" buttons to call
  const handleCheckFromButton = useCallback(async (data) => {
    setActiveTab('check');
    const summary = data.type === 'multiple-choice'
      ? `Q: ${data.question}\nSelected: ${data.selectedText}`
      : `Q: ${data.question}\nMy answer: ${data.studentAnswer}`;

    setVerifyMessages(prev => [...prev, { role: 'user', content: summary, fromButton: true }]);
    setIsLoading(true);

    try {
      const result = await verifyAnswer(data);
      setVerifyMessages(prev => [...prev, {
        role: 'assistant',
        content: result.explanation || result.content || 'No response',
        verdict: result.verdict || null,
      }]);
    } catch (err) {
      setVerifyMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${err.message}`,
      }]);
    }
    setIsLoading(false);
  }, []);

  // Expose handleCheckFromButton via ref or context (we'll use a global event)
  useEffect(() => {
    const handler = (e) => handleCheckFromButton(e.detail);
    window.addEventListener('check-with-ai', handler);
    return () => window.removeEventListener('check-with-ai', handler);
  }, [handleCheckFromButton]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (activeTab === 'chat') {
      handleSendChat(input);
    } else {
      handleSendVerify(input);
    }
  };

  const handleNewConversation = () => {
    setMessages([]);
    setStreamingContent('');
  };

  return (
    <div
      className="hidden lg:flex flex-col flex-shrink-0 h-[calc(100vh-5rem)] sticky top-20"
      style={{
        width: '30%',
        minWidth: '280px',
        maxWidth: '400px',
        backgroundColor: 'var(--theme-sidebar-bg)',
        borderLeft: '1px solid var(--theme-sidebar-border)',
      }}
    >
      {/* Header with tabs */}
      <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: '1px solid var(--theme-border)' }}>
        <button
          className="text-xs px-3 py-1 rounded-full transition-colors"
          style={{
            backgroundColor: activeTab === 'chat' ? '#3b82f6' : 'transparent',
            color: activeTab === 'chat' ? '#fff' : 'var(--theme-muted-text)',
          }}
          onClick={() => setActiveTab('chat')}
        >
          Chat
        </button>
        <button
          className="text-xs px-3 py-1 rounded-full transition-colors"
          style={{
            backgroundColor: activeTab === 'check' ? '#3b82f6' : 'transparent',
            color: activeTab === 'check' ? '#fff' : 'var(--theme-muted-text)',
          }}
          onClick={() => setActiveTab('check')}
        >
          {t('Check Answer', 'Verifică')}
        </button>
        <div className="flex-1" />
        {activeTab === 'chat' && messages.length > 0 && (
          <button
            className="text-[10px] px-2 py-0.5 rounded transition-colors"
            style={{ color: 'var(--theme-muted-text)', backgroundColor: 'var(--theme-hover-bg)' }}
            onClick={handleNewConversation}
          >
            {t('New', 'Nou')}
          </button>
        )}
        <button
          className="text-xs p-1 rounded transition-colors"
          style={{ color: 'var(--theme-muted-text)' }}
          onClick={toggleChat}
          aria-label="Close chat"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3">
        {currentMessages.length === 0 && !streamingContent && (
          <div className="text-center mt-8 opacity-50 text-xs">
            {activeTab === 'chat'
              ? t('Ask a question about this course...', 'Pune o întrebare despre acest curs...')
              : t('Type your question and answer, or use "Check with AI" buttons', 'Scrie întrebarea și răspunsul, sau folosește butoanele "Verifică cu AI"')}
          </div>
        )}
        {currentMessages.map((msg, i) => (
          <ChatMessage key={i} role={msg.role} content={msg.content} verdict={msg.verdict} />
        ))}
        {streamingContent && activeTab === 'chat' && (
          <ChatMessage role="assistant" content={streamingContent} isStreaming={true} />
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2 p-3" style={{ borderTop: '1px solid var(--theme-border)' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={activeTab === 'chat'
            ? t('Ask about this course...', 'Întreabă despre curs...')
            : t('Type your question...', 'Scrie întrebarea...')}
          className="flex-1 text-sm rounded-lg px-3 py-2 outline-none"
          style={{
            backgroundColor: 'var(--theme-hover-bg)',
            color: 'var(--theme-content-text)',
            border: '1px solid var(--theme-border)',
          }}
          disabled={isLoading}
        />
        <button
          type="submit"
          className="text-sm px-3 py-2 rounded-lg text-white transition-colors"
          style={{ backgroundColor: isLoading ? '#64748b' : '#3b82f6' }}
          disabled={isLoading || !input.trim()}
        >
          {isLoading ? '...' : t('Send', 'Trimite')}
        </button>
      </form>
    </div>
  );
};

export default ChatPanel;
```

- [ ] **Step 2: Wire ChatPanel into SubjectPage**

In `src/pages/SubjectPage.jsx`, replace the placeholder chat panel div with the real component.

Add import at top:
```jsx
import ChatPanel from '../components/ui/ChatPanel';
```

Replace the placeholder `{chatOpen && ( <div ...>` block (near the bottom) with:

```jsx
{chatOpen && (
  <ChatPanel
    pageContext=""
    subjectSyllabus={subject.description?.[lang] || ''}
  />
)}
```

Note: `pageContext` is empty for now — we'll wire up section content extraction in Task 10.

- [ ] **Step 3: Verify the chat panel renders**

Run: `npm run dev`

Navigate to a course. Verify:
- Chat panel appears on the right with Chat/Check Answer tabs
- Can type messages (they'll fail to send since proxy isn't running — that's expected)
- Close button (X) hides the panel and content expands
- Panel state persists on page reload (localStorage)

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/ChatPanel.jsx src/pages/SubjectPage.jsx
git commit -m "feat: add ChatPanel component with Chat and Check Answer tabs"
```

---

## Task 9: Add "Check with AI" Button to MultipleChoice

**Files:**
- Modify: `src/components/ui/MultipleChoice.jsx`

- [ ] **Step 1: Add the purple "Check with AI" button after answer reveal**

In `src/components/ui/MultipleChoice.jsx`, add a button that dispatches a `check-with-ai` custom event (listened by ChatPanel).

Replace the `{shown && (` block (line 67-70) with:

```jsx
{shown && (
  <>
    <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
      {q.explanation?.[lang]}
    </p>
    <button
      onClick={() => {
        const selectedIdx = multiSelect ? [...(picked || [])][0] : picked;
        const selectedText = q.options[selectedIdx] 
          ? (typeof q.options[selectedIdx].text === 'object' ? q.options[selectedIdx].text[lang] : q.options[selectedIdx].text)
          : '';
        window.dispatchEvent(new CustomEvent('check-with-ai', {
          detail: {
            type: 'multiple-choice',
            question: typeof q.question === 'object' ? q.question[lang] : q.question,
            selectedText,
            studentAnswer: selectedText,
            options: q.options.map(o => typeof o.text === 'object' ? o.text[lang] : o.text),
            correct: q.options.findIndex(o => o.correct),
            keyConcepts: q.keyConcepts || [],
            explanation: typeof q.explanation === 'object' ? q.explanation[lang] : (q.explanation || ''),
          }
        }));
      }}
      className="mt-2 text-xs px-3 py-1.5 rounded-lg text-white transition-colors hover:brightness-110 flex items-center gap-1.5"
      style={{ backgroundColor: '#8b5cf6' }}
    >
      <span style={{ fontSize: '13px' }}>&#10024;</span>
      {t('Check with AI', 'Verifică cu AI')}
    </button>
  </>
)}
```

- [ ] **Step 2: Verify the button appears**

Run: `npm run dev`

Navigate to a course with MultipleChoice questions (e.g., OS Course 1 quiz). Select an answer, click "Check Answer", and verify:
- The purple "Check with AI" button appears below the explanation
- Clicking it switches the chat panel to the "Check Answer" tab with the question auto-populated

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/MultipleChoice.jsx
git commit -m "feat: add 'Check with AI' button to MultipleChoice component"
```

---

## Task 10: Add Page Context Extraction

**Files:**
- Modify: `src/pages/SubjectPage.jsx`

- [ ] **Step 1: Extract current section text and pass to ChatPanel**

Add a `ref` to the main content area and extract visible text. In `SubjectPage.jsx`:

Add `useRef` and `useState` to the React import:
```jsx
import React, { Suspense, useMemo, useRef, useState, useEffect } from 'react';
```

Add after the `useMemo` hooks:
```jsx
const contentRef = useRef(null);
const [pageContext, setPageContext] = useState('');

// Extract visible section text for chat context
useEffect(() => {
  if (!contentRef.current) {
    setPageContext('');
    return;
  }
  // Debounce: extract after scrolling settles
  const extract = () => {
    const el = contentRef.current;
    if (!el) return;
    // Get all section elements
    const sections = el.querySelectorAll('[id^="course_"], [id^="lab_"]');
    if (sections.length === 0) {
      // Fallback: grab first 2000 chars of content
      setPageContext(el.innerText.slice(0, 2000));
      return;
    }
    // Find the section closest to the viewport top
    let closest = sections[0];
    let closestDist = Infinity;
    for (const sec of sections) {
      const dist = Math.abs(sec.getBoundingClientRect().top);
      if (dist < closestDist) {
        closestDist = dist;
        closest = sec;
      }
    }
    // Extract text of the closest section (limit to 2000 chars)
    setPageContext(closest.innerText.slice(0, 2000));
  };

  extract();
  const handler = () => { clearTimeout(handler._t); handler._t = setTimeout(extract, 300); };
  window.addEventListener('scroll', handler, { passive: true });
  return () => window.removeEventListener('scroll', handler);
}, [activeCourse, activeLab]);
```

Add `ref={contentRef}` to the `<main>` element:
```jsx
<main ref={contentRef} className="flex-1 max-w-5xl mx-auto p-4 lg:p-8" style={{ fontSize: '1.05rem' }}>
```

Update the ChatPanel props:
```jsx
<ChatPanel
  pageContext={pageContext}
  subjectSyllabus={subject.description?.[lang] || ''}
/>
```

- [ ] **Step 2: Verify context extraction**

Run: `npm run dev`

Open browser devtools, add a temporary `console.log(pageContext)` in the ChatPanel. Navigate to a course and scroll — verify the context updates to the nearest section's text.

- [ ] **Step 3: Commit**

```bash
git add src/pages/SubjectPage.jsx
git commit -m "feat: extract current section text as chat context"
```

---

## Task 11: Build the VPS Proxy Server

**Files:**
- Create: `proxy/package.json`
- Create: `proxy/server.js`
- Create: `proxy/.env.example`
- Create: `proxy/.gitignore`

- [ ] **Step 1: Create proxy/package.json**

```json
{
  "name": "study-guide-proxy",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^5.1.0"
  }
}
```

- [ ] **Step 2: Create proxy/.env.example**

```
GROQ_API_KEY=your_groq_api_key_here
OPENROUTER_API_KEY=your_openrouter_api_key_here
PORT=3001
CORS_ORIGIN=https://corgigh.github.io
```

- [ ] **Step 3: Create proxy/.gitignore**

```
node_modules/
.env
```

- [ ] **Step 4: Create proxy/server.js**

```js
import express from 'express';
import cors from 'cors';
import { createHash } from 'crypto';

const app = express();
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
const GROQ_KEY = process.env.GROQ_API_KEY;
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const OPENROUTER_MODEL = 'meta-llama/llama-3.3-70b-instruct:free';

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json({ limit: '64kb' }));

// Verification cache (in-memory)
const verifyCache = new Map();

function buildChatSystemPrompt(pageContext, syllabus) {
  return `You are a friendly, knowledgeable CS university tutor. Your role is to help students understand course material deeply — not just give answers, but build understanding.

Current page content (use as primary reference):
${pageContext}

Subject overview:
${syllabus}

Rules:
- Respond in whatever language the student writes in
- Ground answers in the course material when applicable
- Use your general CS knowledge when the question goes beyond the page content
- Be encouraging but accurate — never make up information
- Use examples and analogies to explain complex concepts
- Keep responses concise but thorough`;
}

function buildVerifySystemPrompt() {
  return `You are an answer evaluator for a CS university course. Evaluate the student's answer and respond with a JSON object:
{"verdict": "correct" | "partial" | "wrong", "explanation": "your explanation here"}

Rules:
- "correct": answer demonstrates full understanding of key concepts
- "partial": answer is on the right track but missing important aspects
- "wrong": answer is incorrect or shows fundamental misunderstanding
- Respond in whatever language the student's question is written in
- Be encouraging even when the answer is wrong
- Always explain WHY the answer is correct/partial/wrong
- Reference the key concepts and model answer when provided
- Respond ONLY with the JSON object, no other text`;
}

async function callLLM(messages, stream = false, useOpenRouter = false) {
  const url = useOpenRouter
    ? 'https://openrouter.ai/api/v1/chat/completions'
    : 'https://api.groq.com/openai/v1/chat/completions';
  const key = useOpenRouter ? OPENROUTER_KEY : GROQ_KEY;
  const model = useOpenRouter ? OPENROUTER_MODEL : GROQ_MODEL;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify({ model, messages, stream, temperature: 0.7, max_tokens: 1024 }),
  });

  if (res.status === 429 && !useOpenRouter) {
    // Rate limited on Groq — fallback to OpenRouter
    return callLLM(messages, stream, true);
  }

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`LLM API error ${res.status}: ${err}`);
  }

  return res;
}

// POST /api/chat — streaming
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [], pageContext = '', subjectSyllabus = '' } = req.body;
    if (!message) return res.status(400).json({ error: 'message required' });

    const messages = [
      { role: 'system', content: buildChatSystemPrompt(pageContext, subjectSyllabus) },
      ...history.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: message },
    ];

    const llmRes = await callLLM(messages, true);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const reader = llmRes.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') {
            res.write('data: [DONE]\n\n');
            res.end();
            return;
          }
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
          } catch {
            // skip
          }
        }
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('Chat error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    } else {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    }
  }
});

// POST /api/verify — cached
app.post('/api/verify', async (req, res) => {
  try {
    const { question, studentAnswer, type, options, correct, keyConcepts, modelAnswer } = req.body;
    if (!question) return res.status(400).json({ error: 'question required' });

    const cacheKey = createHash('sha256').update(`${question}|${studentAnswer}`).digest('hex');

    if (verifyCache.has(cacheKey)) {
      return res.json(verifyCache.get(cacheKey));
    }

    let userContent = `Question: ${question}\nStudent answer: ${studentAnswer}\nQuestion type: ${type || 'open-ended'}`;
    if (options) userContent += `\nOptions: ${options.join(', ')}`;
    if (correct !== undefined) userContent += `\nCorrect answer index: ${correct}`;
    if (keyConcepts?.length) userContent += `\nKey concepts to check: ${keyConcepts.join(', ')}`;
    if (modelAnswer) userContent += `\nModel answer: ${modelAnswer}`;

    const messages = [
      { role: 'system', content: buildVerifySystemPrompt() },
      { role: 'user', content: userContent },
    ];

    const llmRes = await callLLM(messages, false);
    const data = await llmRes.json();
    const raw = data.choices?.[0]?.message?.content || '';

    let result;
    try {
      result = JSON.parse(raw);
    } catch {
      result = { verdict: 'partial', explanation: raw };
    }

    verifyCache.set(cacheKey, result);
    res.json(result);
  } catch (err) {
    console.error('Verify error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Proxy running on port ${PORT}`);
  console.log(`CORS origin: ${CORS_ORIGIN}`);
});
```

- [ ] **Step 5: Commit**

```bash
git add proxy/
git commit -m "feat: add VPS proxy server with Groq/OpenRouter LLM routing"
```

---

## Task 12: Create Example Verification Data File

**Files:**
- Create: `src/content/os/verify/course_1.js`

- [ ] **Step 1: Create verification data for OS Course 1**

```js
export default {
  courseId: 'course_1',
  questions: [
    {
      id: 'c1-q1',
      type: 'multiple-choice',
      question: 'What command lists files in a directory?',
      options: ['cd', 'ls', 'pwd', 'cat'],
      correct: 1,
      explanation: 'ls lists directory contents. cd changes directory, pwd prints working directory, cat displays file contents.',
      keyConcepts: ['ls', 'directory listing', 'basic commands'],
    },
    {
      id: 'c1-q2',
      type: 'multiple-choice',
      question: 'Which permission allows executing a file?',
      options: ['r (read)', 'w (write)', 'x (execute)', 'd (directory)'],
      correct: 2,
      explanation: 'The x (execute) permission allows running a file as a program or script.',
      keyConcepts: ['permissions', 'execute', 'chmod'],
    },
    {
      id: 'c1-q3',
      type: 'open-ended',
      question: 'Explain the difference between absolute and relative paths in Linux.',
      keyConcepts: ['absolute path', 'relative path', 'root directory', 'current directory', '/'],
      modelAnswer: 'An absolute path starts from the root directory (/) and specifies the complete location of a file, e.g., /home/user/file.txt. A relative path starts from the current working directory and uses . (current dir) and .. (parent dir) to navigate, e.g., ../docs/file.txt.',
    },
  ],
};
```

- [ ] **Step 2: Commit**

```bash
git add src/content/os/verify/course_1.js
git commit -m "feat: add example verification data for OS Course 1"
```

---

## Task 13: Add Chat Panel Reopen Button

**Files:**
- Modify: `src/pages/SubjectPage.jsx`

- [ ] **Step 1: Add a small button to reopen the chat panel when closed**

When the chat panel is collapsed, show a small chat icon button on the right edge so the user can reopen it.

In `SubjectPage.jsx`, after the `{chatOpen && (<ChatPanel .../>)}` block, add:

```jsx
{!chatOpen && (
  <button
    className="hidden lg:flex items-center justify-center fixed right-0 top-1/2 -translate-y-1/2 z-30 transition-colors hover:brightness-125"
    style={{
      width: '12px',
      height: '36px',
      background: '#1e293b',
      border: '1px solid #334155',
      borderRight: 'none',
      borderRadius: '6px 0 0 6px',
      boxShadow: '-2px 0 6px rgba(0,0,0,0.2)',
      cursor: 'pointer',
    }}
    onClick={toggleChat}
    aria-label="Open chat"
  >
    <svg width="7" height="10" viewBox="0 0 7 10" fill="none">
      <path d="M6 1L1 5L6 9" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </button>
)}
```

Also ensure `toggleChat` is destructured from `useApp()` at the top of SubjectPage (it should already be there from Task 5).

- [ ] **Step 2: Verify the reopen button**

Run: `npm run dev`

Close the chat panel. Verify a slim chevron tab appears on the right edge. Click it — the chat panel should reopen.

- [ ] **Step 3: Commit**

```bash
git add src/pages/SubjectPage.jsx
git commit -m "feat: add chat panel reopen button when collapsed"
```

---

## Task 14: Add .env Configuration for Frontend

**Files:**
- Create: `.env.example`
- Modify: `.gitignore` (if .env not already listed)

- [ ] **Step 1: Create .env.example for the frontend**

```
VITE_PROXY_URL=http://localhost:3001
```

- [ ] **Step 2: Verify .env is in .gitignore**

Check that `.gitignore` includes `.env`. If not, add it.

- [ ] **Step 3: Commit**

```bash
git add .env.example .gitignore
git commit -m "feat: add .env.example for proxy URL configuration"
```

---

## Task 15: End-to-End Test

- [ ] **Step 1: Start the proxy locally**

```bash
cd proxy
npm install
cp .env.example .env
# Edit .env with real Groq API key
npm run dev
```

- [ ] **Step 2: Start the frontend**

```bash
# In the project root
echo "VITE_PROXY_URL=http://localhost:3001" > .env
npm run dev
```

- [ ] **Step 3: Test chat flow**

1. Open `http://localhost:5173/#/y1s2/os/course_1`
2. Type a question in the chat panel: "What is the ls command?"
3. Verify streaming response appears
4. Ask a follow-up: "What flags does it support?"
5. Verify conversation history works

- [ ] **Step 4: Test answer verification**

1. Navigate to a course with MultipleChoice
2. Answer a question and click "Check Answer"
3. After reveal, click "Check with AI"
4. Verify the Check Answer tab activates with the question auto-populated and a color-coded verdict appears

- [ ] **Step 5: Test sidebar lock/unlock**

1. Click the sidebar toggle tab — sidebar should hide
2. Hover near the left edge — sidebar should appear as overlay
3. Move mouse away — sidebar should hide
4. Click the toggle tab again — sidebar locks back

- [ ] **Step 6: Test panel persistence**

1. Close the chat panel
2. Reload the page
3. Verify chat panel stays closed
4. Unlock the sidebar
5. Reload — verify sidebar stays unlocked

- [ ] **Step 7: Commit any fixes**

```bash
git add -A
git commit -m "fix: end-to-end test fixes"
```

---

## Self-Review Checklist

- [x] **Spec coverage**: Layout changes (Task 2, 5), sidebar lock/unlock (Task 3, 4), chat panel (Task 7, 8), answer verification (Task 9), page context (Task 10), proxy server (Task 11), verification data (Task 12), persistence (Task 1), reopen button (Task 13)
- [x] **No placeholders**: All tasks have complete code
- [x] **Type consistency**: `streamChat` / `verifyAnswer` signatures match between api.js (Task 6) and ChatPanel (Task 8). `check-with-ai` event detail shape matches between MultipleChoice (Task 9) and ChatPanel handler (Task 8). `locked`/`onToggleLock` props consistent between Sidebar (Task 4) and SubjectPage (Task 5).
- [x] **Spec requirement: ProgressSidebar removal**: Handled in Task 5 (removed import, replaced with InlineProgress + ChatPanel)
- [x] **Spec requirement: content font size increase**: Handled in Task 5 (`fontSize: '1.05rem'` on main)
