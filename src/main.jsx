import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AppProvider } from './contexts/AppContext'
import ErrorBoundary from './components/ErrorBoundary'
import 'katex/dist/katex.min.css'
import './index.css'
import App from './App.jsx'

// After a deploy, a tab opened earlier still asks for the old lazy chunks, which no
// longer exist on the server. Reload once to pick up the new build instead of showing
// "this visual could not be shown". The flag stops a reload loop if the file is really gone.
window.addEventListener('vite:preloadError', (event) => {
  try {
    if (sessionStorage.getItem('chunkReloaded')) return;
    sessionStorage.setItem('chunkReloaded', '1');
  } catch { /* storage blocked: reload anyway, once per page load */ }
  event.preventDefault();
  window.location.reload();
});
window.addEventListener('load', () => {
  setTimeout(() => { try { sessionStorage.removeItem('chunkReloaded'); } catch { /* ignore */ } }, 10000);
});

// Vite serves BASE_URL with a trailing slash; react-router wants no trailing.
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter basename={basename}>
        <AppProvider>
          <App />
        </AppProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
