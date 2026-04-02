import React from 'react';

const TabBar = ({ tabs, activeTab, onTabChange }) => (
  <div className="flex border-b dark:border-gray-700 mb-6">
    {tabs.map(tab => (
      <button
        key={tab.id}
        onClick={() => onTabChange(tab.id)}
        className={`px-4 py-2 text-sm font-medium transition border-b-2 -mb-px ${
          activeTab === tab.id
            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
        }`}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

export default TabBar;
