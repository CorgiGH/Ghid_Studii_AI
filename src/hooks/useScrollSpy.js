import { useState, useEffect, useMemo } from 'react';

/**
 * Observes section headings and returns the ID of the currently visible one.
 * Updates URL hash via replaceState (no back-button pollution). Research §9.
 */
export default function useScrollSpy(sectionIds = [], { rootMargin = '-80px 0px -70% 0px', updateHash = false } = {}) {
  const [activeId, setActiveId] = useState(null);
  const idsKey = useMemo(() => JSON.stringify(sectionIds), [sectionIds]);

  useEffect(() => {
    if (!sectionIds.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the topmost intersecting entry (entries are not guaranteed in DOM order)
        let topEntry = null;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (!topEntry || entry.boundingClientRect.top < topEntry.boundingClientRect.top) {
              topEntry = entry;
            }
          }
        }
        if (topEntry) {
          const id = topEntry.target.id;
          setActiveId(id);
          if (updateHash) {
            const base = window.location.href.split('#').slice(0, 2).join('#');
            window.history.replaceState(null, '', `${base}#${id}`);
          }
        }
      },
      { rootMargin }
    );

    const elements = sectionIds
      .map(id => document.getElementById(id))
      .filter(Boolean);

    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [idsKey, rootMargin, updateHash]);

  return activeId;
}
