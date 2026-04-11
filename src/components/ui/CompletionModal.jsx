import React, { useEffect, useState } from 'react';

/**
 * Brief celebration modal for course completion.
 * Research §4: Khan Academy pattern — centered modal, fade+scale, stats.
 */
export default function CompletionModal({ courseName, sectionsCompleted, onNext, onClose, lang }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundColor: visible ? 'rgba(15, 23, 42, 0.6)' : 'transparent',
        backdropFilter: visible ? 'blur(4px)' : 'none',
        transition: 'background-color 0.3s, backdrop-filter 0.3s',
      }}
      onClick={handleClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="rounded-2xl p-8 text-center"
        style={{
          maxWidth: '480px',
          width: '90%',
          backgroundColor: 'var(--theme-card-bg)',
          border: '2px solid #22c55e',
          transform: visible ? 'scale(1)' : 'scale(0.95)',
          opacity: visible ? 1 : 0,
          transition: 'transform 0.3s ease-out, opacity 0.3s ease-out',
        }}
      >
        <div
          className="mx-auto mb-4 flex items-center justify-center rounded-full"
          style={{
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
          }}
        >
          <span style={{ fontSize: '32px', color: 'white' }}>{'\u2713'}</span>
        </div>

        <h2
          style={{
            fontSize: 'var(--type-h2)',
            fontWeight: 'var(--type-h2-weight)',
            color: 'var(--theme-content-text)',
            marginBottom: '8px',
          }}
        >
          {lang === 'ro' ? 'Curs Finalizat!' : 'Course Complete!'}
        </h2>

        <p style={{ color: 'var(--theme-muted-text)', marginBottom: '24px' }}>
          {courseName} — {sectionsCompleted} {lang === 'ro' ? 'sec\u021Biuni completate' : 'sections completed'}
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-lg transition-colors"
            style={{
              border: '1px solid var(--theme-border)',
              color: 'var(--theme-content-text)',
              backgroundColor: 'var(--theme-card-bg)',
            }}
          >
            {lang === 'ro' ? '\u00CEnchide' : 'Close'}
          </button>
          {onNext && (
            <button
              onClick={() => { handleClose(); setTimeout(onNext, 300); }}
              className="px-4 py-2 rounded-lg transition-colors"
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
              }}
            >
              {lang === 'ro' ? 'Cursul Urm\u0103tor' : 'Next Course'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
