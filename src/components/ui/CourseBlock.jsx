import React, { useState, useEffect, useRef } from 'react';

const CourseBlock = ({ title, id, children, forceOpen, searchState }) => {
  const [userOpen, setUserOpen] = useState(false);
  const ref = useRef(null);

  // searchState overrides user toggle: 'match' = open, 'no-match' = closed, undefined = user control
  const open = searchState ? searchState === 'match' : userOpen;

  useEffect(() => {
    if (forceOpen) {
      setUserOpen(true);
      setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    }
  }, [forceOpen]);

  return (
    <div ref={ref} className="mb-4 border-2 rounded-xl dark:border-gray-600 overflow-hidden transition-shadow hover:shadow-md" id={id}>
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 font-bold text-lg transition-colors"
        onClick={() => { if (!searchState) setUserOpen(!userOpen); }}
      >
        <span className="mr-2">{open ? '▾' : '▸'}</span>{title}
      </div>
      {/* Always render content so it's searchable in the DOM; hide with CSS when closed */}
      <div className={`p-4 border-t dark:border-gray-600 ${open ? '' : 'hidden'}`}>{children}</div>
    </div>
  );
};

export default CourseBlock;
