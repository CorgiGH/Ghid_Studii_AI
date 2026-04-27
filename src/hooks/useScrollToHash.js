import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Scrolls to the element matching the URL fragment on mount/navigation.
 * Under BrowserRouter the fragment is just `location.hash` (the only `#`
 * in the URL is the in-page anchor).
 */
export default function useScrollToHash() {
  const location = useLocation();

  useEffect(() => {
    const sectionId = location.hash ? location.hash.slice(1) : null;
    if (!sectionId) return;

    const timer = setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 300);
    return () => clearTimeout(timer);
  }, [location.pathname]);
}
