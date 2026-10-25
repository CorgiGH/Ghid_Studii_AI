import React from 'react';
import { useApp } from '../../../contexts/AppContext';

export default function Practice() {
  const { t } = useApp();
  return (
    <div className="text-center py-12 opacity-70">
      <p className="text-lg font-medium">{t('Practice happens inside the lessons', 'Exersezi direct în lecții')}</p>
      <p className="text-sm mt-2">
        {t('Every lesson ends with SQL exercises you run right there.', 'Fiecare lecție se termină cu exerciții SQL pe care le rulezi chiar acolo.')}
      </p>
    </div>
  );
}
