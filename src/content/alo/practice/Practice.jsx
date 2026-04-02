import React from 'react';
import { useApp } from '../../../contexts/AppContext';

export default function Practice() {
  const { t } = useApp();
  return (
    <div className="text-center py-12 opacity-60">
      <p className="text-4xl mb-4">📐</p>
      <p className="text-lg font-medium">{t('Coming soon', 'În curând')}</p>
      <p className="text-sm mt-2">{t('Practice problems will be added here.', 'Problemele de practică vor fi adăugate aici.')}</p>
    </div>
  );
}
