import React, { useState } from 'react';

const Section = ({ title, id, children, checked, onCheck }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-3 border rounded-lg dark:border-gray-700 overflow-hidden transition-shadow hover:shadow-sm" id={id}>
      <div className="flex items-center gap-2 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" onClick={() => setOpen(!open)}>
        <input type="checkbox" checked={checked} onChange={onCheck} onClick={e => e.stopPropagation()} className="w-4 h-4 accent-green-500" />
        <span className={`font-semibold flex-1 transition-colors ${checked ? 'text-green-600 dark:text-green-400 line-through opacity-70' : ''}`}>
          {open ? '▾' : '▸'} {title}
        </span>
      </div>
      {open && <div className="p-4 border-t dark:border-gray-700 animate-slide-down">{children}</div>}
    </div>
  );
};

export default Section;
