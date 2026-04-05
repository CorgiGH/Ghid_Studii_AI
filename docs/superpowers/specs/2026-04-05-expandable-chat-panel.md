# Expandable Chat Panel — Design Spec

## Summary

Add a draggable resize handle to the left edge of the chat panel, allowing users to adjust its width. Width is persisted in localStorage across sessions.

## Approach

Mousedown-driven drag on a styled handle div. No third-party dependencies.

## Detailed Design

### Resize Handle Element

- Thin vertical `div` (6px wide) absolutely positioned on the left edge of ChatPanel
- `cursor: col-resize` on hover
- On hover: subtle background highlight (semi-transparent) to signal interactivity
- Desktop only (lg+ breakpoint), matching chat panel visibility

### Drag Behavior

1. `mousedown` on handle: start tracking, set `user-select: none` on `document.body`
2. `mousemove` on `document`: compute `newWidth = window.innerWidth - e.clientX`
3. Clamp width between min and dynamic max (see constraints below)
4. Apply as inline style width on the chat panel container
5. `mouseup` on `document`: stop tracking, remove `user-select: none`, persist width to localStorage

### Width Constraints

- **Minimum width:** 280px (matches current minWidth)
- **Maximum width:** dynamically calculated as `window.innerWidth - sidebarWidth - 300px`
  - sidebarWidth: the left sidebar's current rendered width (0 if sidebar is collapsed/hidden)
  - 300px: minimum usable width reserved for the main content area
  - This ensures the main content, sidebar, and chat panel all remain usable regardless of viewport size

### State Persistence

- New `chatWidth` state in AppContext via existing `useLocalStorage` hook
- Key: `'chatWidth'`, default: `null`
- When `chatWidth` is `null`: fall back to current behavior (`width: '30%'`, `minWidth: '280px'`, `maxWidth: '400px'`)
- When `chatWidth` is set: use that pixel value directly (no min/maxWidth CSS — the clamp logic handles bounds)
- Exposed from AppContext: `chatWidth`, `setChatWidth`

### Integration with Existing Layout

- ChatPanel currently uses inline styles: `width: '30%', minWidth: '280px', maxWidth: '400px'`
- When `chatWidth` is persisted, replace with: `width: chatWidth + 'px'`
- SubjectPage.jsx renders ChatPanel as a flex sibling of the main content and left sidebar — no layout changes needed; flex handles the content area shrinking naturally

### Edge Cases

- **Window resize:** If a persisted chatWidth exceeds the new dynamic max after a viewport resize, clamp it on render (not just during drag)
- **Sidebar toggle:** If the left sidebar opens/closes, the dynamic max changes — re-clamp if needed

## Files Changed

1. `src/components/ui/ChatPanel.jsx` — Add resize handle div, drag event handlers, width clamping logic
2. `src/contexts/AppContext.jsx` — Add `chatWidth` / `setChatWidth` with `useLocalStorage`

## Out of Scope

- Mobile chat experience (chat panel hidden below lg breakpoint)
- Preset size buttons
- Vertical resize
- Drag to reposition the panel
