import React from 'react';

const COLORS = {
  definition: { light: 'bg-blue-50 border-blue-300', dark: 'dark:bg-blue-950 dark:border-blue-700' },
  theorem: { light: 'bg-green-50 border-green-300', dark: 'dark:bg-green-950 dark:border-green-700' },
  warning: { light: 'bg-red-50 border-red-300', dark: 'dark:bg-red-950 dark:border-red-700' },
  formula: { light: 'bg-purple-50 border-purple-300', dark: 'dark:bg-purple-950 dark:border-purple-700' },
  code: { light: 'bg-gray-100 border-gray-300', dark: 'dark:bg-gray-800 dark:border-gray-600' },
};

export { COLORS };

const Box = ({ type, children }) => {
  const c = COLORS[type] || COLORS.definition;
  return <div className={`border-l-4 p-3 my-3 rounded-r ${c.light} ${c.dark}`}>{children}</div>;
};

export default Box;
