import React, { Suspense, useRef, useEffect, useState } from 'react';
import registry from './registry';
import UnknownBlock from './UnknownBlock';

export default function BlockRenderer({ block, lectureVisible }) {
  const isLecture = block.type.startsWith('lecture');

  const Component = registry[block.type];
  if (!Component) {
    if (isLecture && !lectureVisible) return null;
    return <UnknownBlock type={block.type} />;
  }

  // Non-lecture blocks render directly — no animation wrapper overhead
  if (!isLecture) {
    return (
      <Suspense fallback={<div className="skeleton-shimmer h-8" />}>
        <Component {...block} />
      </Suspense>
    );
  }

  // Lecture blocks get animated wrapper
  return (
    <LectureBlockWrapper visible={lectureVisible}>
      <Suspense fallback={<div className="skeleton-shimmer h-8" />}>
        <Component {...block} />
      </Suspense>
    </LectureBlockWrapper>
  );
}

function LectureBlockWrapper({ visible, children }) {
  const contentRef = useRef(null);
  const [maxHeight, setMaxHeight] = useState(visible ? 'none' : '0px');
  const [opacity, setOpacity] = useState(visible ? 1 : 0);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip animation on first render — just set the correct state
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (visible) {
      // Expanding: measure content, animate to that height
      const el = contentRef.current;
      if (!el) return;
      const height = el.scrollHeight;
      setMaxHeight(`${height}px`);
      setOpacity(1);
      // After transition completes, remove max-height constraint so content can reflow
      const timer = setTimeout(() => setMaxHeight('none'), 350);
      return () => clearTimeout(timer);
    } else {
      // Collapsing: set explicit height first, then animate to 0
      const el = contentRef.current;
      if (!el) return;
      const height = el.scrollHeight;
      setMaxHeight(`${height}px`);
      // Force layout before animating to 0
      // eslint-disable-next-line no-unused-expressions
      el.offsetHeight;
      requestAnimationFrame(() => {
        setMaxHeight('0px');
        setOpacity(0);
      });
    }
  }, [visible]);

  return (
    <div
      ref={contentRef}
      style={{
        maxHeight,
        opacity,
        overflow: 'hidden',
        transition: 'max-height 0.3s ease, opacity 0.25s ease',
      }}
    >
      {children}
    </div>
  );
}
