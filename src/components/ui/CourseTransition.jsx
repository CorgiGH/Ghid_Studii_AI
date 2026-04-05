import React, { useState, useRef, useEffect } from 'react';

const DURATION = 350;

export default function CourseTransition({ courseIndex, children }) {
  const prevIndexRef = useRef(null);
  const childrenRef = useRef(children);
  const [displayChildren, setDisplayChildren] = useState(children);
  const [animClass, setAnimClass] = useState('');
  const containerRef = useRef(null);
  const timer2Ref = useRef(null);

  // Always keep ref in sync with latest children
  childrenRef.current = children;

  // When children change without courseIndex changing (e.g. lazy resolve),
  // update displayed content immediately
  useEffect(() => {
    setDisplayChildren(children);
  }, [children]);

  // Animation effect — only depends on courseIndex
  useEffect(() => {
    const prevIndex = prevIndexRef.current;
    prevIndexRef.current = courseIndex;

    if (prevIndex === null) {
      // First load — fade in
      setAnimClass('course-fade-in');
      const timer = setTimeout(() => setAnimClass(''), DURATION);
      return () => clearTimeout(timer);
    }

    if (prevIndex === courseIndex) return;

    const goingDown = courseIndex > prevIndex;

    // Phase 1: slide out old content
    setAnimClass(goingDown ? 'course-slide-out-up' : 'course-slide-out-down');

    const timer1 = setTimeout(() => {
      // Phase 2: swap content and slide in
      setDisplayChildren(childrenRef.current);
      setAnimClass(goingDown ? 'course-slide-in-up' : 'course-slide-in-down');

      timer2Ref.current = setTimeout(() => setAnimClass(''), DURATION);
    }, DURATION);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2Ref.current);
    };
  }, [courseIndex]);

  return (
    <div ref={containerRef} className={`course-transition ${animClass}`}>
      {displayChildren}
      <style>{`
        .course-transition {
          will-change: transform, opacity;
        }
        .course-slide-out-up {
          animation: courseSlideOutUp ${DURATION}ms ease forwards;
        }
        .course-slide-in-up {
          animation: courseSlideInUp ${DURATION}ms ease forwards;
        }
        .course-slide-out-down {
          animation: courseSlideOutDown ${DURATION}ms ease forwards;
        }
        .course-slide-in-down {
          animation: courseSlideInDown ${DURATION}ms ease forwards;
        }
        .course-fade-in {
          animation: courseFadeIn ${DURATION}ms ease forwards;
        }
        @keyframes courseSlideOutUp {
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(-40px); opacity: 0; }
        }
        @keyframes courseSlideInUp {
          from { transform: translateY(40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes courseSlideOutDown {
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(40px); opacity: 0; }
        }
        @keyframes courseSlideInDown {
          from { transform: translateY(-40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes courseFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
