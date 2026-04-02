import React, { useState } from 'react';

const CourseBlock = ({ title, id, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-4 border-2 rounded-lg dark:border-gray-600" id={id}>
      <div className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 font-bold text-xl" onClick={() => setOpen(!open)}>
        {open ? '▾' : '▸'} {title}
      </div>
      {open && <div className="p-4 border-t dark:border-gray-600">{children}</div>}
    </div>
  );
};

export default CourseBlock;
