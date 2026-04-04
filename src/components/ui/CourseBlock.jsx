import React, { useState, useEffect, useRef } from 'react';

const CourseBlock = ({ title, id, children, forceOpen, searchState }) => {
  const [userOpen, setUserOpen] = useState(false);
  const ref = useRef(null);

  const open = searchState ? searchState === 'match' : userOpen;

  useEffect(() => {
    if (forceOpen) {
      setUserOpen(true);
      setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    }
  }, [forceOpen]);

  return (
    <div
      ref={ref}
      className="mb-4 rounded-xl overflow-hidden transition-shadow hover:shadow-md"
      style={{ border: '2px solid var(--theme-border)' }}
      id={id}
    >
      <div
        className="p-4 cursor-pointer font-bold text-lg transition-colors"
        style={{ color: 'var(--theme-content-text)' }}
        onClick={() => { if (!searchState) setUserOpen(!userOpen); }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--theme-hover-bg)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <span className="mr-2">{open ? '\u25BE' : '\u25B8'}</span>{title}
      </div>
      <div
        className={`p-4 ${open ? '' : 'hidden'}`}
        style={{ borderTop: '1px solid var(--theme-border)' }}
      >
        {children}
      </div>
    </div>
  );
};

export default CourseBlock;
