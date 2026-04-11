import React, { useState, useEffect } from 'react';

const ProgressRing = ({ size = 24, completed = 0, total = 0, isActive = false }) => {
  // Animated fill on mount — research §2: 600ms ease-in-out (Khan Academy)
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);
  const percent = total > 0 ? completed / total : 0;
  const isComplete = total > 0 && completed >= total;
  const hasProgress = completed > 0;

  const strokeWidth = size >= 36 ? 3 : 2.5;
  const radius = (size / 2) - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent);
  const center = size / 2;

  let strokeColor, fillColor, textColor;
  if (isComplete) {
    strokeColor = '#22c55e';
    fillColor = 'var(--theme-content-bg, #dcfce7)';
    textColor = '#16a34a';
  } else if (isActive && hasProgress) {
    strokeColor = '#3b82f6';
    fillColor = 'none';
    textColor = '#3b82f6';
  } else if (hasProgress) {
    strokeColor = '#f59e0b';
    fillColor = 'none';
    textColor = '#f59e0b';
  } else {
    strokeColor = 'var(--theme-border, #e5e7eb)';
    fillColor = 'none';
    textColor = 'var(--theme-content-text, #6b7280)';
  }

  const fontSize = size >= 36 ? 10 : (size >= 28 ? 8 : 7);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0">
      <circle
        cx={center} cy={center} r={radius}
        fill={isComplete ? fillColor : 'none'}
        stroke={isComplete ? strokeColor : 'var(--theme-border, #e5e7eb)'}
        strokeWidth={strokeWidth}
      />
      {!isComplete && hasProgress && (
        <circle
          cx={center} cy={center} r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={mounted ? offset : circumference}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
          style={{ transition: 'stroke-dashoffset 0.6s ease-in-out, stroke 0.4s ease' }}
        />
      )}
      <text
        x={center} y={center + fontSize * 0.35}
        textAnchor="middle"
        fontSize={fontSize}
        fontWeight="bold"
        fill={textColor}
        opacity={(!isComplete && !hasProgress) ? 0.5 : 1}
      >
        {isComplete ? '\u2713' : (total > 0 ? Math.round(percent * 100) : '')}
      </text>
    </svg>
  );
};

export default ProgressRing;
