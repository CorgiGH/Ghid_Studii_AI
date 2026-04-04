import React, { useState } from 'react';
import TopBar from './TopBar';
import { useApp } from '../../contexts/AppContext';

const AppShell = ({ children }) => {
  const { dark } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={dark ? 'dark' : ''}>
      <div
        className="min-h-screen font-sans transition-colors duration-200"
        style={{ backgroundColor: 'var(--theme-content-bg)', color: 'var(--theme-content-text)' }}
      >
        <TopBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        {typeof children === 'function' ? children({ sidebarOpen, setSidebarOpen }) : children}
      </div>
    </div>
  );
};

export default AppShell;
