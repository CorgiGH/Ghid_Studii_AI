import React from 'react';

const PermissionsSVG = () => (
  <svg viewBox="0 0 440 100" className="w-full max-w-lg mx-auto my-4" style={{fontFamily:'monospace',fontSize:13}}>
    <text x="10" y="25" fill="currentColor" fontWeight="bold">-rwxr-xr--</text>
    <line x1="18" y1="30" x2="18" y2="50" stroke="#ef4444" strokeWidth="1.5"/>
    <text x="5" y="65" fill="#ef4444" fontSize="10">type</text>
    <rect x="25" y="10" width="55" height="20" rx="3" fill="#3b82f6" opacity="0.15" stroke="#3b82f6"/>
    <text x="52" y="45" textAnchor="middle" fill="#3b82f6" fontSize="10">owner(u)</text>
    <text x="52" y="57" textAnchor="middle" fill="#3b82f6" fontSize="10">rwx=7</text>
    <rect x="82" y="10" width="45" height="20" rx="3" fill="#f59e0b" opacity="0.15" stroke="#f59e0b"/>
    <text x="104" y="45" textAnchor="middle" fill="#f59e0b" fontSize="10">group(g)</text>
    <text x="104" y="57" textAnchor="middle" fill="#f59e0b" fontSize="10">r-x=5</text>
    <rect x="130" y="10" width="45" height="20" rx="3" fill="#10b981" opacity="0.15" stroke="#10b981"/>
    <text x="152" y="45" textAnchor="middle" fill="#10b981" fontSize="10">others(o)</text>
    <text x="152" y="57" textAnchor="middle" fill="#10b981" fontSize="10">r--=4</text>
    <text x="200" y="25" fill="currentColor">{'\u2192'} chmod 754 file</text>
    <text x="200" y="80" fill="currentColor" fontSize="10">r=4, w=2, x=1 (octal sum per category)</text>
  </svg>
);

export default PermissionsSVG;
