import { parseDT, MONTHS, DAYS, weekday, dayOfYear } from './common.js';

const TOKENS = ['HH24', 'HH12', 'YYYY', 'RRRR', 'MONTH', 'MON', 'DDD', 'DAY', 'HH', 'MI', 'SS', 'YY', 'RR', 'MM', 'DD', 'DY', 'FM', 'WW', 'AM', 'PM', 'D', 'Q'];

const p2 = (n) => String(n).padStart(2, '0');

function casing(token, text) {
  const letters = token.replace(/[^A-Za-z]/g, '');
  if (letters === letters.toUpperCase()) return text.toUpperCase();
  if (letters === letters.toLowerCase()) return text.toLowerCase();
  return text;
}

// TO_CHAR(date, mask) in NLS AMERICAN. `parts` lists every token with the text it produced.
export function formatDate(dateStr, mask) {
  const o = parseDT(dateStr);
  const wd = weekday(o);
  const parts = [];
  let fm = false;
  for (let i = 0; i < mask.length;) {
    if (mask[i] === '"') {
      const j = mask.indexOf('"', i + 1);
      const end = j < 0 ? mask.length : j;
      parts.push({ token: mask.slice(i, end + 1), text: mask.slice(i + 1, end), kind: 'literal' });
      i = end + 1;
      continue;
    }
    const rest = mask.slice(i).toUpperCase();
    const tok = TOKENS.find(t => rest.startsWith(t));
    if (!tok) { parts.push({ token: mask[i], text: mask[i], kind: 'literal' }); i += 1; continue; }
    const raw = mask.slice(i, i + tok.length);
    i += tok.length;
    const num = (n, w) => (fm ? String(n) : String(n).padStart(w, '0'));
    let text, source = null;
    switch (tok) {
      case 'FM': fm = !fm; parts.push({ token: raw, text: '', kind: 'fm' }); continue;
      case 'YYYY': case 'RRRR': text = String(o.y).padStart(4, '0'); source = 'year'; break;
      case 'YY': case 'RR': text = fm ? String(o.y % 100) : p2(o.y % 100); source = 'year'; break;
      case 'MM': text = num(o.mo, 2); source = 'month'; break;
      case 'MON': text = casing(raw, MONTHS[o.mo - 1].slice(0, 3)); source = 'month'; break;
      case 'MONTH': { const t = casing(raw, MONTHS[o.mo - 1]); text = fm ? t : t.padEnd(9, ' '); source = 'month'; break; }
      case 'DD': text = num(o.d, 2); source = 'day'; break;
      case 'DDD': text = num(dayOfYear(o), 3); source = 'day'; break;
      case 'D': text = String(wd + 1); source = 'weekday'; break;
      case 'DAY': { const t = casing(raw, DAYS[wd]); text = fm ? t : t.padEnd(9, ' '); source = 'weekday'; break; }
      case 'DY': text = casing(raw, DAYS[wd].slice(0, 3)); source = 'weekday'; break;
      case 'HH24': text = num(o.h, 2); source = 'hour'; break;
      case 'HH': case 'HH12': text = num(o.h % 12 === 0 ? 12 : o.h % 12, 2); source = 'hour'; break;
      case 'MI': text = num(o.mi, 2); source = 'minute'; break;
      case 'SS': text = num(o.s, 2); source = 'second'; break;
      case 'Q': text = String(Math.floor((o.mo - 1) / 3) + 1); source = 'month'; break;
      case 'WW': text = num(Math.floor((dayOfYear(o) - 1) / 7) + 1, 2); source = 'day'; break;
      case 'AM': case 'PM': text = o.h < 12 ? 'AM' : 'PM'; source = 'hour'; break;
      default: text = '';
    }
    parts.push({ token: raw, text, kind: 'field', source });
  }
  return { mask, parts, text: parts.map(p => p.text).join('') };
}

export function dateMask({ date, masks }) {
  return { date, formats: masks.map(m => formatDate(date, m)), count: masks.length + 1 };
}

// A table cell as Oracle shows it: DATE values (stored here as ISO text) in the default
// NLS_DATE_FORMAT DD-MON-RR; NULL as NULL; everything else as text.
export function displayCell(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) return formatDate(v, 'DD-MON-RR').text;
  return String(v);
}
