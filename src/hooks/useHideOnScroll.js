import { useState, useEffect, useRef } from 'react';

/**
 * Hides element on scroll down, shows on scroll up.
 * Returns `hidden` boolean. Research §6: Medium/Twitter/YouTube pattern.
 */
export default function useHideOnScroll(headerHeight = 60) {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const DELTA = 5;

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      if (Math.abs(y - lastY.current) < DELTA) return;
      if (y <= 0) {
        setHidden(false);
      } else if (y > lastY.current && y > headerHeight) {
        setHidden(true);
      } else if (y < lastY.current) {
        setHidden(false);
      }
      lastY.current = y;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [headerHeight]);

  return hidden;
}
