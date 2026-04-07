import React from 'react';
import { useApp } from '../../../contexts/AppContext';

export default function ListBlock({ ordered, items }) {
  const { t } = useApp();
  const Tag = ordered ? 'ol' : 'ul';
  // Support both array format and bilingual object format { en: [], ro: [] }
  const resolvedItems = items && !Array.isArray(items) && items.en ? (t(items.en, items.ro) || items.en) : items;
  return (
    <Tag className={`mb-3 text-sm leading-relaxed ${ordered ? 'list-decimal' : 'list-disc'} pl-5`} style={{ color: 'var(--theme-content-text)' }}>
      {resolvedItems?.map((item, i) => <li key={i} className="mb-1">{typeof item === 'object' ? t(item.en, item.ro) : item}</li>)}
    </Tag>
  );
}
