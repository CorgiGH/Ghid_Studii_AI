import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import formatMarkdown from '../formatMarkdown';

export default function ListBlock({ ordered, items }) {
  const { t } = useApp();
  const Tag = ordered ? 'ol' : 'ul';
  const resolvedItems = items && !Array.isArray(items) && items.en ? (t(items.en, items.ro) || items.en) : items;
  return (
    <Tag className={`mb-3 text-sm leading-relaxed ${ordered ? 'list-decimal' : 'list-disc'} pl-5`} style={{ color: 'var(--theme-content-text)' }}>
      {resolvedItems?.map((item, i) => {
        const text = typeof item === 'object' ? t(item.en, item.ro) : item;
        return <li key={i} className="mb-1" dangerouslySetInnerHTML={{ __html: formatMarkdown(text) }} />;
      })}
    </Tag>
  );
}
