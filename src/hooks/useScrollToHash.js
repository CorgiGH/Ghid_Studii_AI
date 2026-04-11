import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Scrolls to the element matching a section hash on mount/navigation.
 * HashRouter URLs: /#/route/path#section-id — the section fragment is
 * the third # segment in window.location.href, not location.hash from
 * react-router (which only gives the route path).
 */
export default function useScrollToHash() {
  const location = useLocation();

  useEffect(() => {
    // Extract section hash from the raw URL (third # segment)
    const parts = window.location.href.split('#');
    const sectionId = parts.length >= 3 ? parts[2] : null;
    if (!sectionId) return;

    const timer = setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 300);
    return () => clearTimeout(timer);
  }, [location.pathname]);
}
