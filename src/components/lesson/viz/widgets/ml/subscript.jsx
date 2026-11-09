import React from 'react';

// The ML notation h_MAP, h_ML and P_NB stays plain text in the logic modules (the tests read it as text);
// on screen the tail is drawn as a real subscript.
const SUB = /\b([hP])_(MAP|ML|NB)\b/g;

export function withSubs(text) {
  const parts = String(text).split(SUB);
  if (parts.length === 1) return parts[0];
  const out = [];
  for (let i = 0; i < parts.length; i += 3) {
    if (parts[i]) out.push(parts[i]);
    if (i + 2 < parts.length) out.push(<React.Fragment key={i}>{parts[i + 1]}<sub>{parts[i + 2]}</sub></React.Fragment>);
  }
  return out;
}
