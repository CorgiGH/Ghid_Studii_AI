import React, { useState } from 'react';

const Toggle = ({ question, answer, hideLabel = 'Hide', showLabel = 'Show Answer' }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="my-2 border rounded-lg dark:border-gray-600 overflow-hidden">
      <div className="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" onClick={() => setOpen(!open)}>
        <span className="font-sans text-sm flex-1 pr-3">{question}</span>
        <button className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap flex-shrink-0">
          {open ? hideLabel : showLabel}
        </button>
      </div>
      {open && <div className="p-3 border-t dark:border-gray-600 text-sm font-sans bg-gray-50/50 dark:bg-gray-800/50 animate-slide-down">{answer}</div>}
    </div>
  );
};

export default Toggle;
