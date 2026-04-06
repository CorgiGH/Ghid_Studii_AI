import React from 'react';
import { useApp } from '../../../contexts/AppContext';

export default function ListBlock({ ordered, items }) {
  const { t } = useApp();
  const Tag = ordered ? 'ol' : 'ul';
  return (
    <Tag className={`mb-3 text-sm leading-relaxed ${ordered ? 'list-decimal' : 'list-disc'} pl-5`} style={{ color: 'var(--theme-content-text)' }}>
      {items?.map((item, i) => <li key={i} className="mb-1">{typeof item === 'object' ? t(item.en, item.ro) : item}</li>)}
    </Tag>
  );
}
