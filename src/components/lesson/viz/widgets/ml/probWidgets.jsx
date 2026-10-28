import React from 'react';

// A small labelled value that the tests can read: data-mark names it, data-value is the number it shows.
export function Stat({ id, value, label, keyed = false, shown }) {
  return (
    <span className={`mlw-stat${keyed ? ' key' : ''}`} data-mark={id} data-value={value}>
      <span>{label}</span>
      <b>{shown ?? value}</b>
    </span>
  );
}
