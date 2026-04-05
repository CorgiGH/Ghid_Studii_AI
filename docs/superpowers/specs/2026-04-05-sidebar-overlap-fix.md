# Sidebar Overlap Fix — Design Spec

## Problem

When the sidebar is locked open on desktop, it is `position: fixed; top: 0; height: 100vh`, which causes it to cover the ContentTypeBar and Breadcrumbs navigation bars.

## Design

- ContentTypeBar and Breadcrumbs remain full-width and unobstructed at all times.
- The sidebar starts below whatever navigation bars are currently rendered (TopBar, ContentTypeBar, Breadcrumbs).
- The sidebar height fills only the remaining vertical space below the navigation.
- The sidebar's top offset is measured dynamically using a ref on the header area, so it adapts to whether ContentTypeBar/Breadcrumbs are present and to any height variations.
- Mobile sidebar behavior is unchanged.

## Implementation Approach

1. Add a ref to the element that wraps the persistent header content (TopBar + any subject-page bars).
2. Measure the bottom edge of that element (e.g., via `getBoundingClientRect().bottom` in a `useEffect` + resize observer).
3. Pass the computed offset to the Sidebar component.
4. In Sidebar, set `top` to the offset and `height` to `calc(100vh - <offset>px)`.
5. Remove the existing `paddingTop: calc(3rem + 8px)` hack that was compensating for the TopBar overlap.

## Scope

- Files affected: Sidebar.jsx, SubjectPage.jsx, and potentially the layout component that renders TopBar.
- No changes to mobile sidebar, ContentTypeBar, or Breadcrumbs components.
