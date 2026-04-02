import React, { useState } from 'react';
import TopBar from './TopBar';
import { useApp } from '../../contexts/AppContext';

const AppShell = ({ children }) => {
  const { dark } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={dark ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
        <TopBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        {typeof children === 'function' ? children({ sidebarOpen, setSidebarOpen }) : children}
      </div>
    </div>
  );
};

export default AppShell;
