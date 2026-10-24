import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import Home from './pages/Home';
import SubjectPage from './pages/SubjectPage';

// Dev-only page that shows every visual widget (never part of production or the smoke walk).
const VizGallery = import.meta.env.DEV ? lazy(() => import('./pages/VizGallery.jsx')) : null;
const showGallery = () => import.meta.env.DEV && new URLSearchParams(window.location.search).has('viz-gallery');

export default function App() {
  return (
    <AppShell>
      {({ sidebarOpen, setSidebarOpen }) => (
        showGallery() ? (
          <Suspense fallback={null}><VizGallery /></Suspense>
        ) : (
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/:yearSem/:subject/*" element={<SubjectPage sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />} />
        </Routes>
        )
      )}
    </AppShell>
  );
}
