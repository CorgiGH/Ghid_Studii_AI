import React from 'react';
import { COLORS } from './Box';

const Code = ({ children }) => (
  <pre className={`p-3 my-2 rounded text-sm font-mono overflow-x-auto ${COLORS.code.light} ${COLORS.code.dark}`}>
    <code>{children}</code>
  </pre>
);

export default Code;
