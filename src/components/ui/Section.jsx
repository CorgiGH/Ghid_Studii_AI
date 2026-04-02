import React, { useState } from 'react';

const Section = ({ title, id, children, checked, onCheck }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-3 border rounded dark:border-gray-700" id={id}>
      <div className="flex items-center gap-2 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800" onClick={() => setOpen(!open)}>
        <input type="checkbox" checked={checked} onChange={onCheck} onClick={e => e.stopPropagation()} className="w-4 h-4 accent-green-500" />
        <span className="font-bold text-lg flex-1">{open ? '▾' : '▸'} {title}</span>
      </div>
      {open && <div className="p-4 border-t dark:border-gray-700">{children}</div>}
    </div>
  );
};

export default Section;
