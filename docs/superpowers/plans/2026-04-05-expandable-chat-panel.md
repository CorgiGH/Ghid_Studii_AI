# Expandable Chat Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a draggable resize handle to the chat panel's left edge so users can adjust its width, persisted across sessions.

**Architecture:** A new `chatWidth` localStorage state in AppContext provides the persisted width. ChatPanel adds a thin drag handle div on its left edge. Mouse events on the handle compute new width from cursor position, clamped between 280px and a dynamic max that accounts for the left sidebar.

**Tech Stack:** React 19, existing useLocalStorage hook, vanilla DOM mouse events.

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `src/contexts/AppContext.jsx` | Modify | Add `chatWidth` / `setChatWidth` state via `useLocalStorage` |
| `src/components/ui/ChatPanel.jsx` | Modify | Add resize handle, drag logic, width clamping, apply persisted width |
| `src/components/layout/Sidebar.jsx` | Modify | Add `data-sidebar` attribute to layout spacer div for width querying |

---

### Task 1: Add `chatWidth` state to AppContext

**Files:**
- Modify: `src/contexts/AppContext.jsx`

- [ ] **Step 1: Add chatWidth state**

In `src/contexts/AppContext.jsx`, add a new `useLocalStorage` call after the existing `chatOpen` line (line 46):

```jsx
const [chatWidth, setChatWidth] = useLocalStorage('chatWidth', null);
```

- [ ] **Step 2: Expose chatWidth in context value**

Update the `value` useMemo (line 88) to include `chatWidth` and `setChatWidth`:

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
    chatWidth, setChatWidth,
  }), [dark, lang, palette, search, checked, t, toggleCheck, highlight, toggleDark, toggleLang, sidebarLocked, chatOpen, toggleSidebarLock, toggleChat, chatWidth]);
```

- [ ] **Step 3: Verify dev server still runs**

Run: `npm run dev` (if not already running) and confirm no errors in the console. The app should behave identically since nothing consumes `chatWidth` yet.

- [ ] **Step 4: Commit**

```bash
git add src/contexts/AppContext.jsx
git commit -m "feat: add chatWidth persisted state to AppContext"
```

---

### Task 2: Add resize handle and drag logic to ChatPanel

**Files:**
- Modify: `src/components/ui/ChatPanel.jsx`

- [ ] **Step 1: Import chatWidth from context and add refs**

Update the destructuring from `useApp()` on line 7 to also grab `chatWidth` and `setChatWidth`:

```jsx
const { t, toggleChat, chatWidth, setChatWidth } = useApp();
```

Add a ref and state for drag tracking, after the existing refs (after line 17):

```jsx
const panelRef = useRef(null);
const isDragging = useRef(false);
```

- [ ] **Step 2: Add drag event handlers**

Add this block after the existing `useEffect` hooks (after line 43), before `currentMessages`:

```jsx
// --- Resize handle drag logic ---
const handleMouseDown = useCallback((e) => {
  e.preventDefault();
  isDragging.current = true;
  document.body.style.userSelect = 'none';
  document.body.style.cursor = 'col-resize';

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    const newWidth = window.innerWidth - e.clientX;
    // Account for left sidebar: find .sidebar element width, default 0
    const sidebar = document.querySelector('[data-sidebar]');
    const sidebarWidth = sidebar ? sidebar.getBoundingClientRect().width : 0;
    const maxWidth = window.innerWidth - sidebarWidth - 300;
    const clamped = Math.max(280, Math.min(newWidth, maxWidth));
    if (panelRef.current) {
      panelRef.current.style.width = clamped + 'px';
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
    // Persist final width from the panel's current style
    if (panelRef.current) {
      setChatWidth(parseInt(panelRef.current.style.width, 10));
    }
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
}, [setChatWidth]);

// Clamp persisted width on window resize
useEffect(() => {
  if (chatWidth === null) return;
  const handleResize = () => {
    const sidebar = document.querySelector('[data-sidebar]');
    const sidebarWidth = sidebar ? sidebar.getBoundingClientRect().width : 0;
    const maxWidth = window.innerWidth - sidebarWidth - 300;
    if (chatWidth > maxWidth) {
      const clamped = Math.max(280, maxWidth);
      setChatWidth(clamped);
    }
  };
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, [chatWidth, setChatWidth]);
```

- [ ] **Step 3: Update the panel container to use persisted width and add handle**

Replace the existing outer `<div>` (lines 160-171) with:

```jsx
<div
  ref={panelRef}
  className="hidden lg:flex flex-col flex-shrink-0 sticky self-start"
  style={{
    top: 'var(--topbar-height, 44px)',
    width: chatWidth ? chatWidth + 'px' : '30%',
    minWidth: chatWidth ? undefined : '280px',
    maxWidth: chatWidth ? undefined : '400px',
    height: 'calc(100vh - var(--topbar-height, 44px))',
    backgroundColor: 'var(--theme-sidebar-bg)',
    borderLeft: '1px solid var(--theme-sidebar-border)',
    position: 'relative',
  }}
>
  {/* Resize handle */}
  <div
    onMouseDown={handleMouseDown}
    style={{
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: '6px',
      cursor: 'col-resize',
      zIndex: 10,
      transition: 'background-color 0.15s',
    }}
    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(59,130,246,0.3)'}
    onMouseLeave={(e) => { if (!isDragging.current) e.currentTarget.style.backgroundColor = 'transparent'; }}
  />
```

Note: the closing `</div>` at the end of the component remains unchanged.

- [ ] **Step 4: Add `data-sidebar` attribute to Sidebar layout spacer**

The drag logic queries `[data-sidebar]` to find the left sidebar's flex-space width. In `src/components/layout/Sidebar.jsx`, the layout spacer div at line 162 is the element that occupies space in the flex layout (the `<aside>` is fixed-positioned and doesn't affect flex). Add the attribute to that spacer:

```jsx
{/* Layout spacer when locked */}
{locked && (
  <div data-sidebar className="hidden lg:block flex-shrink-0" style={{ width: '15%', minWidth: '160px' }} />
)}
```

Note: when the sidebar is unlocked (not locked), the spacer isn't rendered, so `sidebarWidth` correctly becomes 0 — the chat panel max will use the full viewport minus 300px for content.

- [ ] **Step 5: Test manually**

1. Open the app at `http://localhost:5173`
2. Navigate to any subject with the chat panel open
3. Hover the left edge of the chat panel — should see a blue highlight
4. Click and drag left — panel should grow wider
5. Click and drag right — panel should shrink (stops at 280px min)
6. Release — width should persist
7. Reload page — chat panel should retain the dragged width
8. Resize browser window smaller — if chat width exceeds max, it should clamp down

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/ChatPanel.jsx src/pages/SubjectPage.jsx src/components/layout/Sidebar.jsx
git commit -m "feat: add draggable resize handle to chat panel"
```

- [ ] **Step 7: Push**

```bash
git push
```
