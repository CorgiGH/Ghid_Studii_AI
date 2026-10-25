import { useEffect, useState } from 'react';

// What a scroll box hides right now: `right` when there are columns past the right edge the reader has not scrolled to,
// `below` / `above` the number of rows (matched by `rowSelector`) wholly under the visible part or above it (behind the
// sticky header matched by `headSelector`, too). Re-measured on scroll, on a resize of the box or its content, and whenever
// `deps` change.
export function hiddenRowsBelow(boxBottom, rowRects) {
  return rowRects.filter((r) => r.top >= boxBottom - 2).length;
}
export function hiddenRowsAbove(visibleTop, rowRects) {
  return rowRects.filter((r) => r.bottom <= visibleTop + 2).length;
}

export function useScrollCues(ref, rowSelector, deps = [], headSelector = null) {
  const [cues, setCues] = useState({ right: false, below: 0, above: 0, scrolls: false });
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const measure = () => {
      const wide = el.scrollWidth > el.clientWidth + 2;
      const right = wide && el.scrollLeft + el.clientWidth < el.scrollWidth - 2;
      const tall = el.scrollHeight > el.clientHeight + 2;
      let below = 0;
      let above = 0;
      if (tall && rowSelector) {
        const box = el.getBoundingClientRect();
        const head = headSelector ? el.querySelector(headSelector) : null;
        const rects = [...el.querySelectorAll(rowSelector)].map((r) => r.getBoundingClientRect());
        below = hiddenRowsBelow(box.bottom, rects);
        above = hiddenRowsAbove(head ? head.getBoundingClientRect().bottom : box.top, rects);
      }
      setCues((p) => (p.right === right && p.below === below && p.above === above && p.scrolls === (wide || tall) ? p : { right, below, above, scrolls: wide || tall }));
    };
    measure();
    const raf = requestAnimationFrame(measure);
    const late = setTimeout(measure, 450); // after the rows' entrance animation
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    ro?.observe(el);
    if (el.firstElementChild) ro?.observe(el.firstElementChild);
    el.addEventListener('scroll', measure, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(late);
      ro?.disconnect();
      el.removeEventListener('scroll', measure);
    };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  return cues;
}
