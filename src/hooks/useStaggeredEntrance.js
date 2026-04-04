import { useEffect, useRef, useState } from 'react';

/**
 * Returns a function that generates inline styles for each child index.
 * Children animate in with opacity + translateY, staggered by 80ms.
 *
 * Usage:
 *   const getStaggerStyle = useStaggeredEntrance(key);
 *   items.map((item, i) => <div style={getStaggerStyle(i)}>{item}</div>)
 *
 * @param {string|number} key - Changes to this trigger a new entrance animation
 * @param {object} opts - { delay: 80, duration: 250, maxStagger: 8 }
 */
export default function useStaggeredEntrance(key, opts = {}) {
  const { delay = 80, duration = 250, maxStagger = 8 } = opts;
  const [triggered, setTriggered] = useState(false);
  const prevKey = useRef(key);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTriggered(true);
      return;
    }

    setTriggered(false);
    const frame = requestAnimationFrame(() => {
      setTriggered(true);
    });
    prevKey.current = key;
    return () => cancelAnimationFrame(frame);
  }, [key]);

  return (index) => {
    if (triggered) {
      return {
        opacity: 1,
        transform: 'translateY(0)',
        transition: `opacity ${duration}ms ease, transform ${duration}ms ease`,
        transitionDelay: `${Math.min(index, maxStagger) * delay}ms`,
      };
    }
    return {
      opacity: 0,
      transform: 'translateY(12px)',
    };
  };
}
