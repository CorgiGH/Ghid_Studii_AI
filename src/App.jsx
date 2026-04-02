import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import Home from './pages/Home';
import SubjectPage from './pages/SubjectPage';

export default function App() {
  return (
    <AppShell>
      {({ sidebarOpen, setSidebarOpen }) => (
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/:yearSem/:subject/*" element={<SubjectPage sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />} />
        </Routes>
      )}
    </AppShell>
  );
}
