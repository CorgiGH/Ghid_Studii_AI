import React from 'react';

// Token colors share the green family with the code body so highlighted
// tokens read as accents, not as hostile "syntax highlighter" rainbow.
const TOKEN_COLORS = {
  keyword: '#60a5fa',   // blue — control flow + type qualifiers
  type:    '#a78bfa',   // violet — built-in types, std:: namespace
  string:  '#fbbf24',   // amber — string / char literals
  number:  '#f472b6',   // pink — numeric literals
  preproc: '#fb923c',   // orange — preprocessor directives
  punct:   undefined,   // inherit code-body green
};

const KEYWORDS = new Set([
  'auto','break','case','catch','class','const','constexpr','continue','default','delete','do',
  'else','enum','explicit','export','extern','false','for','friend','goto','if','inline',
  'mutable','namespace','new','noexcept','nullptr','operator','override','private','protected',
  'public','register','return','sizeof','static','struct','switch','template','this','throw',
  'true','try','typedef','typename','union','using','virtual','volatile','while','final',
]);

const TYPES = new Set([
  'bool','char','double','float','int','long','short','signed','unsigned','void','wchar_t',
  'size_t','ssize_t','int8_t','int16_t','int32_t','int64_t','uint8_t','uint16_t','uint32_t','uint64_t',
]);

function tokenize(line) {
  // Comment lines are handled by the caller — this only tokenizes code lines.
  const tokens = [];
  let i = 0;
  const n = line.length;
  while (i < n) {
    const ch = line[i];
    // Whitespace
    if (ch === ' ' || ch === '\t') {
      let j = i;
      while (j < n && (line[j] === ' ' || line[j] === '\t')) j++;
      tokens.push({ kind: 'ws', text: line.slice(i, j) });
      i = j;
      continue;
    }
    // Inline comment starting mid-line
    if (ch === '/' && line[i + 1] === '/') {
      tokens.push({ kind: 'comment', text: line.slice(i) });
      i = n;
      continue;
    }
    // Block comment fragment on a single line
    if (ch === '/' && line[i + 1] === '*') {
      const close = line.indexOf('*/', i + 2);
      const end = close === -1 ? n : close + 2;
      tokens.push({ kind: 'comment', text: line.slice(i, end) });
      i = end;
      continue;
    }
    // Preprocessor at line start (allow leading ws already consumed)
    if (ch === '#' && tokens.every(t => t.kind === 'ws')) {
      tokens.push({ kind: 'preproc', text: line.slice(i) });
      i = n;
      continue;
    }
    // String literal " ... " (supports escapes)
    if (ch === '"' || ch === "'") {
      let j = i + 1;
      while (j < n) {
        if (line[j] === '\\') { j += 2; continue; }
        if (line[j] === ch) { j++; break; }
        j++;
      }
      tokens.push({ kind: 'string', text: line.slice(i, j) });
      i = j;
      continue;
    }
    // Numeric literal
    if (/[0-9]/.test(ch)) {
      let j = i;
      while (j < n && /[0-9a-fA-FxX._']/.test(line[j])) j++;
      tokens.push({ kind: 'number', text: line.slice(i, j) });
      i = j;
      continue;
    }
    // Identifier (keyword / type / plain)
    if (/[A-Za-z_]/.test(ch)) {
      let j = i;
      while (j < n && /[A-Za-z0-9_]/.test(line[j])) j++;
      const word = line.slice(i, j);
      let kind = 'ident';
      if (KEYWORDS.has(word)) kind = 'keyword';
      else if (TYPES.has(word)) kind = 'type';
      else if (word === 'std' && line.slice(j, j + 2) === '::') kind = 'type';
      tokens.push({ kind, text: word });
      i = j;
      continue;
    }
    // Anything else (punctuation, operators) — single char
    tokens.push({ kind: 'punct', text: ch });
    i++;
  }
  return tokens;
}

function renderTokens(tokens) {
  return tokens.map((tok, idx) => {
    const color = TOKEN_COLORS[tok.kind];
    if (!color) return <React.Fragment key={idx}>{tok.text}</React.Fragment>;
    return <span key={idx} style={{ color }}>{tok.text}</span>;
  });
}

export default function CodeBlock({ language, content, code }) {
  content = content || code || '';
  return (
    <div className="rounded-xl mb-3 overflow-hidden" style={{ border: '1px solid var(--theme-border)' }}>
      {language && (
        <div
          className="px-3 py-1 flex items-center"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--theme-content-text) 6%, var(--theme-card-bg))',
            borderBottom: '1px solid var(--theme-border)',
          }}
        >
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
            style={{
              backgroundColor: 'color-mix(in srgb, #10b981 18%, var(--theme-card-bg))',
              color: '#10b981',
              letterSpacing: '0.08em',
            }}
          >
            {language}
          </span>
        </div>
      )}
      <pre
        className="p-4 overflow-x-auto text-sm leading-relaxed"
        style={{
          backgroundColor: 'color-mix(in srgb, #10b981 4%, var(--theme-card-bg))',
          color: '#10b981',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          margin: 0,
        }}
      >
        <code>
          {content.split('\n').map((line, i) => {
            const trimmed = line.trimStart();
            const isLineComment =
              trimmed.startsWith('//') ||
              trimmed.startsWith('/*') ||
              trimmed.startsWith('*');
            const isSubgoal =
              isLineComment &&
              /^(\/\/|\*)\s*(\d+\.\s|Step|Phase|Initialize|Process|Check|Return|Finalize|Acquire|Release|Validate)/i.test(trimmed);

            if (isLineComment) {
              return (
                <React.Fragment key={i}>
                  {i > 0 && '\n'}
                  <span style={{
                    color: 'color-mix(in srgb, var(--theme-content-text) 55%, transparent)',
                    fontStyle: 'italic',
                    ...(isSubgoal ? { fontWeight: 600, color: 'color-mix(in srgb, var(--theme-content-text) 75%, transparent)' } : {}),
                  }}>
                    {line}
                  </span>
                </React.Fragment>
              );
            }

            return (
              <React.Fragment key={i}>
                {i > 0 && '\n'}
                {renderTokens(tokenize(line))}
              </React.Fragment>
            );
          })}
        </code>
      </pre>
    </div>
  );
}
