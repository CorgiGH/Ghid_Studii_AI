import katex from 'katex';

/**
 * Inline markdown + LaTeX math:
 *   $$...$$  → KaTeX display (block)
 *   $...$    → KaTeX inline
 *   **bold** → <strong>
 *   `code`   → <code>
 *   \n       → <br/>
 *
 * Math is processed first so KaTeX output isn't corrupted by the bold/code passes.
 * Uses stashed placeholders to protect rendered HTML from later regex passes.
 */
export default function formatMarkdown(text) {
  if (!text) return '';

  const stash = [];
  const tuck = (html) => {
    const key = `\u0001STASH${stash.length}\u0001`;
    stash.push(html);
    return key;
  };

  let out = text;

  // 1. Display math — $$...$$  (non-greedy, allow multi-line)
  out = out.replace(/\$\$([\s\S]+?)\$\$/g, (_, tex) => {
    try {
      return tuck(katex.renderToString(tex, { displayMode: true, throwOnError: false, output: 'html' }));
    } catch {
      return tuck(`<span style="color:#ef4444">[math error]</span>`);
    }
  });

  // 2. Inline math — $...$  (not allowing newline or $ inside)
  out = out.replace(/\$([^$\n]+?)\$/g, (_, tex) => {
    try {
      return tuck(katex.renderToString(tex, { displayMode: false, throwOnError: false, output: 'html' }));
    } catch {
      return tuck(`<span style="color:#ef4444">[math error]</span>`);
    }
  });

  // 3. Existing inline markdown
  out = out
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code style="background:var(--theme-border);padding:1px 5px;border-radius:4px;font-size:0.85em;">$1</code>')
    .replace(/\n/g, '<br/>');

  // 4. Unstash math
  out = out.replace(/\u0001STASH(\d+)\u0001/g, (_, i) => stash[Number(i)]);

  return out;
}
