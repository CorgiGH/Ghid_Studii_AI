import React from 'react';

const SidebarToggle = ({ locked, onToggle }) => {
  // On sidebar's right edge always
  // Locked: chevron points left (click to unlock/hide)
  // Unlocked: chevron points right (click to lock/pin)
  const pointsRight = !locked;

  return (
    <button
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      className="flex items-center justify-center transition-colors duration-200 hover:brightness-125"
      style={{
        width: '12px',
        height: '36px',
        background: 'var(--theme-sidebar-bg)',
        border: '1px solid var(--theme-sidebar-border)',
        borderRight: 'none',
        borderRadius: '0 6px 6px 0',
        boxShadow: '2px 0 6px rgba(0,0,0,0.2)',
        cursor: 'pointer',
      }}
      aria-label={locked ? 'Unlock sidebar' : 'Lock sidebar'}
    >
      <svg width="7" height="10" viewBox="0 0 7 10" fill="none">
        <path
          d={pointsRight ? 'M1 1L6 5L1 9' : 'M6 1L1 5L6 9'}
          stroke="#3b82f6"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};

export default SidebarToggle;
