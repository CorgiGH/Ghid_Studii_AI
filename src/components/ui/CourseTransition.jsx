import React, { useState, useRef, useEffect } from 'react';

const DURATION = 350;

export default function CourseTransition({ courseIndex, children }) {
  const prevIndexRef = useRef(null);
  const [displayChildren, setDisplayChildren] = useState(children);
  const [animClass, setAnimClass] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    const prevIndex = prevIndexRef.current;
    prevIndexRef.current = courseIndex;

    if (prevIndex === null) {
      // First load — fade in
      setDisplayChildren(children);
      setAnimClass('course-fade-in');
      const timer = setTimeout(() => setAnimClass(''), DURATION);
      return () => clearTimeout(timer);
    }

    if (prevIndex === courseIndex) {
      setDisplayChildren(children);
      return;
    }

    const goingDown = courseIndex > prevIndex;

    // Phase 1: slide out old content
    setAnimClass(goingDown ? 'course-slide-out-up' : 'course-slide-out-down');

    const timer1 = setTimeout(() => {
      // Phase 2: swap content and slide in
      setDisplayChildren(children);
      setAnimClass(goingDown ? 'course-slide-in-up' : 'course-slide-in-down');

      const timer2 = setTimeout(() => setAnimClass(''), DURATION);
      return () => clearTimeout(timer2);
    }, DURATION);

    return () => clearTimeout(timer1);
  }, [courseIndex, children]);

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
