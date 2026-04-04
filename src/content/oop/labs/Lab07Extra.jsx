import React from 'react';
import { useApp } from '../../../contexts/AppContext';

export default function Lab07Extra() {
  const { t } = useApp();
  return <p className="text-sm opacity-50">{t('Content coming soon...', 'Conținut în curând...')}</p>;
}
