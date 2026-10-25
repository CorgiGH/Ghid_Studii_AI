import { useEffect, useState } from 'react';

// What a scroll box hides right now: `right` when there are columns past the right edge the reader has not scrolled to,
// `below` / `above` the number of rows (matched by `rowSelector`) wholly under the visible part or above it (behind the
// sticky header matched by `headSelector`, too). Re-measured on scroll, on a resize of the box or its content, when rows
// are added or removed (an exit animation ends), and whenever `deps` change (pass values, not arrays rebuilt on every render).
export function hiddenRowsBelow(boxBottom, rowRects) {
  return rowRects.filter((r) => r.top >= boxBottom - 2).length;
}
export function hiddenRowsAbove(visibleTop, rowRects) {
  return rowRects.filter((r) => r.bottom <= visibleTop + 2).length;
}
// Where the visible rows start: under the sticky header while it is stuck to the top of the box, else the box's own top
// (a header element that is not itself sticky, such as a <thead> whose cells stick, keeps its place and scrolls out).
export function visibleTopOf(boxTop, headBottom) {
  return headBottom === null || headBottom === undefined ? boxTop : Math.max(boxTop, headBottom);
}

export function useScrollCues(ref, rowSelector, deps = [], headSelector = null) {
  const [cues, setCues] = useState({ right: false, below: 0, above: 0, scrolls: false });
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const measure = () => {
      const wide = el.scrollWidth > el.clientWidth + 2;
      const right = wide && el.scrollLeft + el.clientWidth < el.scrollWidth - 2;
      // rows can only be hidden in a box that scrolls up and down (a box that shows every row clips nothing)
      const scrollsY = /auto|scroll/.test(getComputedStyle(el).overflowY);
      const tall = scrollsY && el.scrollHeight > el.clientHeight + 2;
      let below = 0;
      let above = 0;
      if (tall && rowSelector) {
        const box = el.getBoundingClientRect();
        const head = headSelector ? el.querySelector(headSelector) : null;
        const rects = [...el.querySelectorAll(rowSelector)].map((r) => r.getBoundingClientRect());
        below = hiddenRowsBelow(box.bottom, rects);
        above = hiddenRowsAbove(visibleTopOf(box.top, head ? head.getBoundingClientRect().bottom : null), rects);
      }
      setCues((p) => (p.right === right && p.below === below && p.above === above && p.scrolls === (wide || tall) ? p : { right, below, above, scrolls: wide || tall }));
    };
    // Rows enter and leave with animations (staggered springs, layout moves, leaving rows kept out of the flow until they are
    // done), and a measure taken meanwhile counts rows where they are passing through. So the box is measured once its rows
    // are still: no row added, removed or restyled for a moment and no animation running (or, at the latest, after 2.5 s).
    // Never inside the commit either: a keystroke in the editor re-renders the result tables, and a state change made
    // synchronously here would chain into the keystroke's own synchronous update.
    let alive = true;
    let settleTimer = 0;
    let since = 0;
    let waiting = false;
    const settle = () => {
      if (!since) since = Date.now();
      clearTimeout(settleTimer);
      settleTimer = setTimeout(() => {
        if (!alive) return;
        const running = typeof el.getAnimations === 'function' ? el.getAnimations({ subtree: true }).filter((a) => a.playState === 'running') : [];
        if (running.length && Date.now() - since < 2500) {
          if (!waiting) {
            waiting = true;
            Promise.allSettled(running.map((a) => a.finished)).then(() => { waiting = false; if (alive) settle(); });
          }
          return;
        }
        since = 0;
        measure();
      }, Date.now() - since < 2500 ? 120 : 0);
    };
    settle();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(settle) : null;
    ro?.observe(el);
    if (el.firstElementChild) ro?.observe(el.firstElementChild);
    const mo = typeof MutationObserver !== 'undefined' ? new MutationObserver(settle) : null;
    mo?.observe(el, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });
    el.addEventListener('scroll', measure, { passive: true });
    return () => {
      alive = false;
      clearTimeout(settleTimer);
      ro?.disconnect();
      mo?.disconnect();
      el.removeEventListener('scroll', measure);
    };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  return cues;
}
