import React, { useMemo, useState } from 'react';
import { useApp } from '../../../../contexts/AppContext';
import { MatrixDisplay } from '../../../../components/widgets-core';
import { useWidgetProgress } from '../../../../hooks/useWidgetProgress';

const PROPERTIES = [
  { id: 'symmetric',         label: { en: 'Symmetric',          ro: 'Simetrică' } },
  { id: 'upperTriangular',   label: { en: 'Upper triangular',   ro: 'Triunghiulară superioară' } },
  { id: 'lowerTriangular',   label: { en: 'Lower triangular',   ro: 'Triunghiulară inferioară' } },
  { id: 'diagonal',          label: { en: 'Diagonal',           ro: 'Diagonală' } },
  { id: 'square',            label: { en: 'Square',             ro: 'Pătratică' } },
];

export default function MatrixInput({ instance, onSubmit, onGenerateInstance }) {
  const { t } = useApp();
  const [selected, setSelected] = useState(new Set());
  const [submitted, setSubmitted] = useState(false);
  const startAt = useMemo(() => Date.now(), [instance]);
  const { history, submit } = useWidgetProgress('matrix-input', { pbLowerIsBetter: true });

  const toggle = (id) => {
    if (submitted) return;
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const onCheck = () => {
    if (submitted) return;
    setSubmitted(true);
    const correctSet = new Set(instance.correctProperties);
    const correct =
      selected.size === correctSet.size && [...selected].every(id => correctSet.has(id));
    const elapsedSec = Math.round((Date.now() - startAt) / 1000);

    const feats = [];
    if (correct && elapsedSec < 5) feats.push('quick-eye');
    // flawless-five tracked via session counter below
    const sessionKey = '__mi_session';
    const prev = Number(sessionStorage.getItem(sessionKey) || '0');
    const nextCount = correct ? prev + 1 : 0;
    sessionStorage.setItem(sessionKey, String(nextCount));
    if (nextCount >= 5) feats.push('flawless-five');

    submit({ correct, metric: elapsedSec, feats });
    onSubmit?.({ correct, metric: elapsedSec, feats });
  };

  const onNext = () => {
    setSelected(new Set());
    setSubmitted(false);
    onGenerateInstance?.();
  };

  return (
    <div className="space-y-4">
      <MatrixDisplay value={instance.matrix} />
      <p className="text-sm" style={{ color: 'var(--theme-content-text)' }}>
        {t('Select every property that applies:', 'Selectează toate proprietățile aplicabile:')}
      </p>
      <div className="flex flex-wrap gap-2">
        {PROPERTIES.map(p => {
          const isSelected = selected.has(p.id);
          const isCorrect = submitted && instance.correctProperties.includes(p.id);
          const isWrong = submitted && isSelected && !instance.correctProperties.includes(p.id);
          const border = isCorrect ? '#22c55e' : (isWrong ? '#ef4444' : 'var(--theme-border)');
          return (
            <button
              key={p.id}
              onClick={() => toggle(p.id)}
              disabled={submitted}
              aria-pressed={isSelected}
              className="px-3 py-1.5 text-sm rounded"
              style={{
                background: isSelected ? 'var(--theme-content-bg-alt, #eff6ff)' : 'transparent',
                color: 'var(--theme-content-text)',
                border: `2px solid ${border}`,
                opacity: submitted && !isSelected && !instance.correctProperties.includes(p.id) ? 0.5 : 1,
              }}
            >
              {t(p.label.en, p.label.ro)}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-3">
        {!submitted ? (
          <button
            onClick={onCheck}
            className="px-4 py-1.5 rounded font-medium text-sm"
            style={{ background: '#3b82f6', color: '#fff' }}
          >
            {t('Check (Enter)', 'Verifică (Enter)')}
          </button>
        ) : (
          <button
            onClick={onNext}
            className="px-4 py-1.5 rounded font-medium text-sm"
            style={{ background: '#3b82f6', color: '#fff' }}
          >
            {t('Next matrix', 'Următoarea matrice')}
          </button>
        )}
        {history.bestMetric != null && (
          <span className="text-xs opacity-75" style={{ color: 'var(--theme-content-text)' }}>
            {t('PB:', 'Record:')} {history.bestMetric}s
          </span>
        )}
      </div>
    </div>
  );
}
