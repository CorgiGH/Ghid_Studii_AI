import React, { useState } from 'react';

const Toggle = ({ question, answer, hideLabel = 'Hide', showLabel = 'Show Answer' }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="my-2 border rounded dark:border-gray-600">
      <div className="flex justify-between items-center p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800" onClick={() => setOpen(!open)}>
        <span className="font-sans text-sm">{question}</span>
        <button className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition">{open ? hideLabel : showLabel}</button>
      </div>
      {open && <div className="p-2 border-t dark:border-gray-600 text-sm font-sans">{answer}</div>}
    </div>
  );
};

export default Toggle;
