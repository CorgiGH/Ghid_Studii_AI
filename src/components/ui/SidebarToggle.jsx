import React from 'react';

const SidebarToggle = ({ locked, onToggle, side = 'sidebar' }) => {
  const pointsRight = side === 'content';

  return (
    <button
      onClick={onToggle}
      className="absolute top-1/2 -translate-y-1/2 z-30 flex items-center justify-center transition-colors duration-200 hover:brightness-125"
      style={{
        right: side === 'sidebar' ? '-12px' : undefined,
        left: side === 'content' ? '0px' : undefined,
        width: '12px',
        height: '36px',
        background: '#1e293b',
        border: '1px solid #334155',
        borderLeft: side === 'content' ? 'none' : undefined,
        borderRight: side === 'sidebar' ? 'none' : undefined,
        borderRadius: side === 'content' ? '0 6px 6px 0' : '6px 0 0 6px',
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
