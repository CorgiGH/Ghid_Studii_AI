import { useRef, useEffect, useCallback } from 'react';
import { useApp } from '../contexts/AppContext';

export default function useAutoProgress(sectionId) {
  const { checked, setChecked } = useApp();
  const sectionRef = useRef(null);
  const hasScrolledThrough = useRef(false);
  const hasInteractedWithToggle = useRef(false);
  const hasAutoFired = useRef(false);
  const needsToggle = useRef(false);

  const tryComplete = useCallback(() => {
    if (hasAutoFired.current) return;
    if (!hasScrolledThrough.current) return;
    if (needsToggle.current && !hasInteractedWithToggle.current) return;

    hasAutoFired.current = true;
    setChecked(prev => {
      if (prev[sectionId]) return prev;
      return { ...prev, [sectionId]: true };
    });
  }, [sectionId, setChecked]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    // Detect if section contains Toggle components (they have data-toggle attr)
    const toggles = el.querySelectorAll('[data-toggle]');
    needsToggle.current = toggles.length > 0;
    if (!needsToggle.current) {
      hasInteractedWithToggle.current = true;
    }

    // Listen for toggle-interacted events bubbling up from Toggle components
    const handleToggleInteracted = () => {
      hasInteractedWithToggle.current = true;
      tryComplete();
    };
    el.addEventListener('toggle-interacted', handleToggleInteracted);

    // Create a sentinel div at the bottom of the section to observe
    const sentinel = document.createElement('div');
    sentinel.style.height = '1px';
    sentinel.style.width = '1px';
    sentinel.style.position = 'relative';
    el.appendChild(sentinel);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            hasScrolledThrough.current = true;
            tryComplete();
            observer.disconnect();
          }
        }
      },
      { threshold: 1.0 }
    );
    observer.observe(sentinel);

    return () => {
      observer.disconnect();
      el.removeEventListener('toggle-interacted', handleToggleInteracted);
      if (sentinel.parentNode) sentinel.parentNode.removeChild(sentinel);
    };
  }, [tryComplete]);

  return { ref: sectionRef };
}
