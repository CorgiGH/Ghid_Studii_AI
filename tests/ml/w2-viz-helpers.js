// Shared by the ML widget tests: read the marks a widget drew (elements with data-kind) out of the server markup.
export function marks(html) {
  const out = [];
  for (const m of html.matchAll(/<[a-z]+\s[^>]*data-kind="([^"]+)"[^>]*>/g)) {
    const tag = m[0];
    const attr = (n) => { const a = tag.match(new RegExp(`\\s${n}="([^"]*)"`)); return a ? a[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"') : undefined; };
    out.push({ kind: m[1], value: attr('data-value'), x: attr('data-x'), y: attr('data-y'), z: attr('data-z'), tag });
  }
  return out;
}
export const text = (html) => html.replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ');
