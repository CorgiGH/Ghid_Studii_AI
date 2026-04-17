import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { useApp } from '../../contexts/AppContext';
import { Box, Code, Toggle } from '../ui';
import MultipleChoice from '../ui/MultipleChoice';
import formatMarkdown from '../blocks/formatMarkdown';

/**
 * Renders an array of seminar blocks. Each block has a `type` and a type-specific payload.
 *
 * Supported types:
 *   - mc                { questions: [{ question:{en,ro}, options:[{text,correct,feedback}], explanation:{en,ro} }] }
 *   - proof-toggle      { question:{en,ro}, answer:{en,ro} }
 *   - definition        { title?:{en,ro}, content:{en,ro} }
 *   - theorem           { title?:{en,ro}, content:{en,ro} }
 *   - code              { language?:string, code:string }
 *   - equation          { tex:string }
 *   - learn             { content:{en,ro} }
 */
export default function SeminarBlockRenderer({ blocks }) {
  const { t } = useApp();
  if (!Array.isArray(blocks) || blocks.length === 0) return null;
  return (
    <div className="space-y-3 my-4">
      {blocks.map((block, i) => <SeminarBlock key={i} block={block} t={t} />)}
    </div>
  );
}

function SeminarBlock({ block, t }) {
  switch (block.type) {
    case 'mc':
      return <MultipleChoice questions={Array.isArray(block.questions) ? block.questions : [block.questions]} />;

    case 'proof-toggle':
      return (
        <Toggle
          question={t(block.question.en, block.question.ro)}
          answer={<span dangerouslySetInnerHTML={{ __html: formatMarkdown(t(block.answer.en, block.answer.ro)) }} />}
          hideLabel={t('Hide solution', 'Ascunde soluția')}
          showLabel={t('Show solution', 'Arată soluția')}
        />
      );

    case 'definition':
      return (
        <Box type="definition">
          {block.title && <strong className="block mb-1">{t(block.title.en, block.title.ro)}</strong>}
          <span dangerouslySetInnerHTML={{ __html: formatMarkdown(t(block.content.en, block.content.ro)) }} />
        </Box>
      );

    case 'theorem':
      return (
        <Box type="theorem">
          {block.title && <strong className="block mb-1">{t(block.title.en, block.title.ro)}</strong>}
          <span dangerouslySetInnerHTML={{ __html: formatMarkdown(t(block.content.en, block.content.ro)) }} />
        </Box>
      );

    case 'code':
      return <Code language={block.language ?? 'plaintext'}>{block.code}</Code>;

    case 'equation': {
      let html;
      try {
        html = katex.renderToString(block.tex, { displayMode: true, throwOnError: false, output: 'htmlAndMathml' });
      } catch {
        html = `<code>${escapeHtml(block.tex)}</code>`;
      }
      return <div className="my-2 text-center overflow-x-auto" dangerouslySetInnerHTML={{ __html: html }} />;
    }

    case 'learn':
      return (
        <p className="text-sm leading-relaxed" style={{ color: 'var(--theme-content-text)' }}
           dangerouslySetInnerHTML={{ __html: formatMarkdown(t(block.content.en, block.content.ro)) }} />
      );

    default:
      return (
        <div className="text-xs p-2 rounded" style={{ background: '#fee2e2', color: '#b91c1c' }}>
          Unknown seminar block type: {block.type}
        </div>
      );
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
}
