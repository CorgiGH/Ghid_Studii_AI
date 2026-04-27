import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AppProvider } from './contexts/AppContext'
import ErrorBoundary from './components/ErrorBoundary'
import 'katex/dist/katex.min.css'
import './index.css'
import App from './App.jsx'

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
