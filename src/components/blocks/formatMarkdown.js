/** Minimal inline markdown: **bold** and `code` only */
export default function formatMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code style="background:var(--theme-border);padding:1px 5px;border-radius:4px;font-size:0.85em;">$1</code>')
    .replace(/\n/g, '<br/>');
}
