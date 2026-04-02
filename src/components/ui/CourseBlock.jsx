import React, { useState } from 'react';

const CourseBlock = ({ title, id, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-4 border-2 rounded-xl dark:border-gray-600 overflow-hidden transition-shadow hover:shadow-md" id={id}>
      <div className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 font-bold text-lg transition-colors" onClick={() => setOpen(!open)}>
        <span className="mr-2">{open ? '▾' : '▸'}</span>{title}
      </div>
      {open && <div className="p-4 border-t dark:border-gray-600 animate-slide-down">{children}</div>}
    </div>
  );
};

export default CourseBlock;
