import React from 'react';

const FileSystemTreeSVG = () => (
  <svg viewBox="0 0 400 260" className="w-full max-w-md mx-auto my-4" style={{fontFamily:'monospace',fontSize:12}}>
    <line x1="200" y1="20" x2="80" y2="70" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="200" y1="20" x2="200" y2="70" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="200" y1="20" x2="320" y2="70" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="80" y1="70" x2="40" y2="120" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="80" y1="70" x2="120" y2="120" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="200" y1="70" x2="170" y2="120" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="200" y1="70" x2="230" y2="120" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="320" y1="70" x2="290" y2="120" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="320" y1="70" x2="350" y2="120" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="40" y1="120" x2="40" y2="170" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="185" y="5" width="30" height="22" rx="4" fill="#3b82f6" opacity="0.2" stroke="#3b82f6"/>
    <text x="200" y="20" textAnchor="middle" fill="currentColor" fontWeight="bold">/</text>
    <text x="80" y="85" textAnchor="middle" fill="#f59e0b" fontWeight="bold">bin</text>
    <text x="200" y="85" textAnchor="middle" fill="#f59e0b" fontWeight="bold">home</text>
    <text x="320" y="85" textAnchor="middle" fill="#f59e0b" fontWeight="bold">etc</text>
    <text x="40" y="135" textAnchor="middle" fill="#10b981">bash</text>
    <text x="120" y="135" textAnchor="middle" fill="#10b981">ls</text>
    <text x="170" y="135" textAnchor="middle" fill="#f59e0b" fontWeight="bold">user1</text>
    <text x="230" y="135" textAnchor="middle" fill="#f59e0b" fontWeight="bold">user2</text>
    <text x="290" y="135" textAnchor="middle" fill="#10b981">passwd</text>
    <text x="350" y="135" textAnchor="middle" fill="#10b981">group</text>
    <text x="40" y="185" textAnchor="middle" fill="#10b981">.bashrc</text>
    <text x="200" y="230" textAnchor="middle" fill="currentColor" fontSize="10" opacity="0.6">UNIX Filesystem Tree (single root "/")</text>
  </svg>
);

export default FileSystemTreeSVG;
