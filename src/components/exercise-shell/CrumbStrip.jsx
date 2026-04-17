import React from 'react';
import { useApp } from '../../contexts/AppContext';

/**
 * Numeric chip strip.
 *
 * Props:
 *  - problems       : Array<{ id, title: {en,ro} }>
 *  - activeIndex    : number
 *  - states         : ('idle'|'started'|'active'|'complete')[]
 *  - onJump(index)
 */
export default function CrumbStrip({ problems, activeIndex, states, onJump }) {
  const { t } = useApp();
  return (
    <div
      role="list"
      aria-label={t('Problem navigator', 'Navigator probleme')}
      className="flex items-center gap-1 overflow-x-auto py-2 px-3"
      style={{ background: 'var(--theme-content-bg)', borderBottom: '1px solid var(--theme-border)' }}
    >
      {problems.map((p, i) => {
        const isActive = i === activeIndex;
        const state = states?.[i] ?? 'idle';
        return (
          <button
            key={p.id}
            role="listitem"
            aria-current={isActive ? 'true' : undefined}
            aria-label={`${t('Problem', 'Problema')} ${i + 1}: ${t(p.title.en, p.title.ro)}`}
            onClick={() => onJump(i)}
            className="flex-shrink-0 min-w-[36px] h-8 px-2 rounded text-sm font-mono font-medium transition-colors"
            style={{
              background: isActive ? '#3b82f6' : 'var(--theme-content-bg-alt, transparent)',
              color: isActive ? '#fff' : chipColor(state),
              border: `1px solid ${isActive ? '#3b82f6' : 'var(--theme-border)'}`,
            }}
          >
            {p.id?.startsWith('prob-') ? 'W' : 'P'}{i + 1}{state === 'complete' ? ' ✓' : ''}
          </button>
        );
      })}
      <span className="ml-auto flex-shrink-0 text-sm pl-3" style={{ color: 'var(--theme-content-text)' }}>
        {activeIndex + 1} / {problems.length}
      </span>
    </div>
  );
}

function chipColor(state) {
  if (state === 'complete') return '#22c55e';
  if (state === 'active')   return '#3b82f6';
  if (state === 'started')  return '#f59e0b';
  return 'var(--theme-content-text)';
}
