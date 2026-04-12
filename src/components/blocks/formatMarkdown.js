import katex from 'katex';

/**
 * Inline markdown + LaTeX math:
 *   $$...$$  → KaTeX display (block) — wrapped in .math-display-wrap for overflow
 *   $...$    → KaTeX inline (tight regex: won't match currency like $5 or $ 10, supports \$ as escape)
 *   **bold** → <strong>
 *   `code`   → <code>
 *   \n       → <br/>
 *
 * Math is processed first so KaTeX output isn't corrupted by the bold/code passes.
 * Uses stashed placeholders to protect rendered HTML from later regex passes.
 * KaTeX output is 'htmlAndMathml' for screen-reader accessibility.
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
      const rendered = katex.renderToString(tex, { displayMode: true, throwOnError: false, output: 'htmlAndMathml' });
      return tuck(`<span class="math-display-wrap">${rendered}</span>`);
    } catch {
      return tuck(`<span style="color:var(--theme-error, #ef4444)">[math error]</span>`);
    }
  });

  // 2. Inline math — $...$  (tight: no currency, no newline, \$ escape supported)
  //    Group 1: preceding char (not \ or word char). Group 2: tex body.
  //    Negative lookahead (?!\d) prevents matching $10 style currency.
  out = out.replace(/(^|[^\\\w])\$([^$\n]+?)\$(?!\d)/g, (match, pre, tex) => {
    try {
      const rendered = katex.renderToString(tex, { displayMode: false, throwOnError: false, output: 'htmlAndMathml' });
      return pre + tuck(rendered);
    } catch {
      return pre + tuck(`<span style="color:var(--theme-error, #ef4444)">[math error]</span>`);
    }
  });

  // 3. Existing inline markdown
  out = out
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code style="background:var(--theme-border);padding:1px 5px;border-radius:4px;font-size:0.85em;">$1</code>')
    .replace(/\n/g, '<br/>');

  // 4. Unstash math
  out = out.replace(/\u0001STASH(\d+)\u0001/g, (_, i) => stash[Number(i)]);

  // 5. Unescape literal dollars: \$ → $
  out = out.replace(/\\\$/g, '$');

  return out;
}
