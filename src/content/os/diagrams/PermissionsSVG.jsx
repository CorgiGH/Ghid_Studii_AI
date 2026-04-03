import React from 'react';

const PermissionsSVG = () => {
  // Fixed positions for each group — no character-width guesswork
  const type = { x: 10, w: 12 };
  const owner = { x: 24, w: 36 };
  const group = { x: 64, w: 36 };
  const others = { x: 104, w: 36 };

  return (
    <svg viewBox="0 0 440 100" className="w-full max-w-lg mx-auto my-4" style={{fontFamily:'monospace',fontSize:13}}>
      {/* Type indicator */}
      <text x={type.x + type.w / 2} y="25" textAnchor="middle" fill="currentColor" fontWeight="bold">-</text>
      <line x1={type.x + type.w / 2} y1="30" x2={type.x + type.w / 2} y2="50" stroke="#ef4444" strokeWidth="1.5"/>
      <text x={type.x + type.w / 2} y="65" textAnchor="middle" fill="#ef4444" fontSize="10">type</text>

      {/* Owner */}
      <rect x={owner.x} y="10" width={owner.w} height="20" rx="3" fill="#3b82f6" opacity="0.15" stroke="#3b82f6"/>
      <text x={owner.x + owner.w / 2} y="25" textAnchor="middle" fill="currentColor" fontWeight="bold">rwx</text>
      <text x={owner.x + owner.w / 2} y="45" textAnchor="middle" fill="#3b82f6" fontSize="10">owner(u)</text>
      <text x={owner.x + owner.w / 2} y="57" textAnchor="middle" fill="#3b82f6" fontSize="10">rwx=7</text>

      {/* Group */}
      <rect x={group.x} y="10" width={group.w} height="20" rx="3" fill="#f59e0b" opacity="0.15" stroke="#f59e0b"/>
      <text x={group.x + group.w / 2} y="25" textAnchor="middle" fill="currentColor" fontWeight="bold">r-x</text>
      <text x={group.x + group.w / 2} y="45" textAnchor="middle" fill="#f59e0b" fontSize="10">group(g)</text>
      <text x={group.x + group.w / 2} y="57" textAnchor="middle" fill="#f59e0b" fontSize="10">r-x=5</text>

      {/* Others */}
      <rect x={others.x} y="10" width={others.w} height="20" rx="3" fill="#10b981" opacity="0.15" stroke="#10b981"/>
      <text x={others.x + others.w / 2} y="25" textAnchor="middle" fill="currentColor" fontWeight="bold">r--</text>
      <text x={others.x + others.w / 2} y="45" textAnchor="middle" fill="#10b981" fontSize="10">others(o)</text>
      <text x={others.x + others.w / 2} y="57" textAnchor="middle" fill="#10b981" fontSize="10">r--=4</text>

      <text x="200" y="25" fill="currentColor">{'\u2192'} chmod 754 file</text>
      <text x="200" y="80" fill="currentColor" fontSize="10">r=4, w=2, x=1 (octal sum per category)</text>
    </svg>
  );
};

export default PermissionsSVG;
