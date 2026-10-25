// Line-by-line tokens for CodeBlock (no React here, so the rules are tested in node).

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

// SQL's line comment is `--`; in C-like code `--` is the decrement operator, so it only starts a comment in SQL.
export function isLineComment(line, language) {
  const trimmed = line.trimStart();
  if (language === 'sql') return trimmed.startsWith('--');
  return trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*');
}

export function tokenize(line, language) {
  // Comment lines are handled by the caller — this only tokenizes code lines.
  const sql = language === 'sql';
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
    // Inline comment starting mid-line (SQL: `-- 37` after a statement)
    if ((!sql && ch === '/' && line[i + 1] === '/') || (sql && ch === '-' && line[i + 1] === '-')) {
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

// SQL lines wrap instead of running off a phone screen; a wrapped line continues indented under its own start, so it
// still reads as one statement. Other languages keep their layout (aligned diagrams, C) and say so when they scroll.
export const wrapsLines = (language) => language === 'sql';
