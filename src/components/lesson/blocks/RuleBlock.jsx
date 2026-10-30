import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import formatMarkdown from '../../blocks/formatMarkdown';
import { Parts } from './GuideParts.jsx';

// Block JSON: { type: 'rule', variant?: 'when', label?, text, body?: [part] } (guideSpec.js): the rule sentence, then its formulas
// stacked in one panel with their condition lines, then whatever else belongs to the rule, all in one card. variant 'when' is
// the card's "when you see this" trigger: a plain card, the sentence in regular weight.
export default function RuleBlock({ variant, label, text, body }) {
  const { t } = useApp();
  return (
    <div className={`ch-gcard ch-rule${variant === 'when' ? ' ch-rule-when' : ''}`} data-testid="rule-block">
      {label && <p className="ch-gcard-label">{t(label.en, label.ro)}</p>}
      <p className="ch-rule-text" dangerouslySetInnerHTML={{ __html: formatMarkdown(t(text.en, text.ro)) }} />
      {body && <Parts parts={body} />}
    </div>
  );
}
