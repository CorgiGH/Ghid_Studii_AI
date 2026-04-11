import { useState, useEffect, useMemo } from 'react';

/**
 * Observes section headings and returns the ID of the currently visible one.
 * Updates URL hash via replaceState (no back-button pollution). Research §9.
 */
export default function useScrollSpy(sectionIds = [], { rootMargin = '-80px 0px -70% 0px', updateHash = true } = {}) {
  const [activeId, setActiveId] = useState(null);
  const idsKey = useMemo(() => JSON.stringify(sectionIds), [sectionIds]);

  useEffect(() => {
    if (!sectionIds.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            setActiveId(id);
            if (updateHash) {
              const base = window.location.href.split('#').slice(0, 2).join('#');
              window.history.replaceState(null, '', `${base}#${id}`);
            }
            break;
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
