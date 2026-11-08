import React from 'react';
import { useApp } from '../../../contexts/AppContext';

export default function Practice() {
  const { t } = useApp();
  return (
    <div className="text-center py-12" style={{ color: 'var(--theme-muted-text)' }}>
      <p className="text-lg font-medium">{t('Practice happens inside the lessons', 'Exersezi direct în lecții')}</p>
      <p className="text-sm mt-2">
        {t('Every lesson ends with calculation exercises you check right there.', 'Fiecare lecție se termină cu exerciții de calcul pe care le verifici chiar acolo.')}
      </p>
    </div>
  );
}
