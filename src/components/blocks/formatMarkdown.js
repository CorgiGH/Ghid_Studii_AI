import katex from 'katex';

// Inline code keeps every space it has: a padded CHAR value or an LPAD result is about those spaces.
const CODE_STYLE = 'background:var(--theme-border);padding:1px 5px;border-radius:4px;font-size:0.85em;white-space:pre-wrap;';

/**
 * Inline markdown + LaTeX math:
 *   `code`   → <code> (taken out first: what is inside backticks is never read as math or bold)
 *   $$$…     → a run of three or more dollars is literal text, never math
 *   $$...$$  → KaTeX display (block) — wrapped in .math-display-wrap for overflow
 *   $...$    → KaTeX inline (tight regex: won't match currency like $5 or $ 10, supports \$ as escape)
 *   **bold** → <strong>
 *   \n       → <br/>
 *
 * Uses stashed placeholders to protect rendered HTML from later regex passes.
 * KaTeX output is 'htmlAndMathml' for screen-reader accessibility.
 */
const inlineMath = (tex) => {
  try {
    return katex.renderToString(tex, { displayMode: false, throwOnError: false, output: 'htmlAndMathml' });
  } catch {
    return `<span style="color:var(--theme-error, #ef4444)">[math error]</span>`;
  }
};

export default function formatMarkdown(text) {
  if (!text) return '';

  const stash = [];
  const tuck = (html) => {
    const key = `\u0001STASH${stash.length}\u0001`;
    stash.push(html);
    return key;
  };

  let out = text;

  // 1. Code spans, before anything else reads their text: a shell `$1`, an SQL `'$$$450'` stay as typed. Inside code only
  //    `$…$` holding a TeX command (`len $\geq$ 1`) is still math.
  out = out.replace(/`(.+?)`/g, (_, code) => {
    const body = code.replace(/(^|[^\\\w])\$([^$\n]*\\[A-Za-z][^$\n]*?)\$(?!\d)/g, (m, pre, tex) => pre + inlineMath(tex));
    return tuck(`<code style="${CODE_STYLE}">${body}</code>`);
  });

  // 2. A run of three or more dollars is text (an LPAD fill, a row of $ signs), not the start of display math.
  out = out.replace(/\${3,}/g, (run) => tuck(run));

  // 3. Display math — $$...$$  (non-greedy, allow multi-line)
  out = out.replace(/\$\$([\s\S]+?)\$\$/g, (_, tex) => {
    try {
      const rendered = katex.renderToString(tex, { displayMode: true, throwOnError: false, output: 'htmlAndMathml' });
      return tuck(`<span class="math-display-wrap">${rendered}</span>`);
    } catch {
      return tuck(`<span style="color:var(--theme-error, #ef4444)">[math error]</span>`);
    }
  });

  // 4. Inline math — $...$  (tight: no currency, no newline, \$ escape supported)
  //    Group 1: preceding char (not \ or word char). Group 2: tex body.
  //    Negative lookahead (?!\d) prevents matching $10 style currency.
  out = out.replace(/(^|[^\\\w])\$([^$\n]+?)\$(?!\d)/g, (match, pre, tex) => pre + tuck(inlineMath(tex)));

  // 5. Bold and line breaks
  out = out
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');

  // 6. Unstash
  out = out.replace(/\u0001STASH(\d+)\u0001/g, (_, n) => stash[Number(n)]);

  // 7. Unescape literal dollars: \$ → $
  out = out.replace(/\\\$/g, '$');

  return out;
}
