import React from 'react';

export default class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true, error: error?.message || String(error) };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info?.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.hash = '#/';
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: '100vh', padding: '2rem', backgroundColor: '#0f172a', color: '#e2e8f0',
          fontFamily: 'system-ui, sans-serif', textAlign: 'center',
        }}>
          <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</p>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            Something went wrong{this.state.error && <span style={{ display: 'block', fontSize: '0.7rem', opacity: 0.5, marginTop: '0.5rem', maxWidth: '400px', wordBreak: 'break-all' }}>{this.state.error}</span>}
          </h1>
          <p style={{ fontSize: '0.875rem', opacity: 0.6, marginBottom: '1.5rem' }}>
            An unexpected error occurred. This is usually fixed by reloading.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={this.handleReload}
              style={{
                padding: '0.5rem 1.25rem', borderRadius: '0.5rem', border: 'none',
                backgroundColor: '#3b82f6', color: '#fff', cursor: 'pointer', fontSize: '0.875rem',
              }}
            >
              Reload page
            </button>
            <button
              onClick={this.handleGoHome}
              style={{
                padding: '0.5rem 1.25rem', borderRadius: '0.5rem', border: '1px solid #334155',
                backgroundColor: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: '0.875rem',
              }}
            >
              Go home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
