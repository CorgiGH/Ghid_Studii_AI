import { formatDate } from './date-mask.js';
import { parseDT, fmtDT, toUTC, fromUTC, daysInMonth, weekday, DAYS } from './common.js';

const fraction = (arg) => {
  if (typeof arg === 'number') return arg;
  const m = String(arg).trim().match(/^(-?\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/);
  if (m) return Number(m[1]) / Number(m[2]);
  const n = Number(arg);
  if (Number.isNaN(n)) throw new Error(`arg ${arg}`);
  return n;
};

// One date function applied to 'YYYY-MM-DD[ HH:MM]'. Returns the same shape.
export function calendar(start, { fn, arg }) {
  const o = parseDT(start);
  switch (fn) {
    case '+': {
      const days = fraction(arg);
      const hasTime = o.hasTime || !Number.isInteger(days);
      const ms = Math.round((toUTC(o) + days * 86400000) / 60000) * 60000;
      return fmtDT(fromUTC(ms, hasTime), hasTime);
    }
    case 'ADD_MONTHS': {
      const total = o.y * 12 + (o.mo - 1) + Number(arg);
      const y = Math.floor(total / 12), mo = (total % 12 + 12) % 12 + 1;
      const wasLast = o.d === daysInMonth(o.y, o.mo);
      const d = wasLast ? daysInMonth(y, mo) : Math.min(o.d, daysInMonth(y, mo));
      return fmtDT({ ...o, y, mo, d });
    }
    case 'LAST_DAY':
      return fmtDT({ ...o, d: daysInMonth(o.y, o.mo) });
    case 'NEXT_DAY': {
      const want = DAYS.findIndex(n => n.toUpperCase().startsWith(String(arg).toUpperCase().slice(0, 3)));
      if (want < 0) throw new Error(`weekday ${arg}`);
      const ahead = ((want - weekday(o)) % 7 + 7) % 7 || 7;
      return fmtDT(fromUTC(toUTC(o) + ahead * 86400000, o.hasTime), o.hasTime);
    }
    case 'TRUNC': {
      const f = String(arg || 'DD').toUpperCase();
      const base = { ...o, h: 0, mi: 0, s: 0 };
      if (['DD', 'DDD', 'J'].includes(f)) return fmtDT(base);
      if (['MM', 'MON', 'MONTH', 'RM'].includes(f)) return fmtDT({ ...base, d: 1 });
      if (['YYYY', 'YEAR', 'YY', 'Y', 'RR', 'RRRR'].includes(f)) return fmtDT({ ...base, mo: 1, d: 1 });
      if (f === 'Q') return fmtDT({ ...base, mo: Math.floor((o.mo - 1) / 3) * 3 + 1, d: 1 });
      if (['D', 'DAY'].includes(f)) return fmtDT(fromUTC(toUTC(base) - weekday(o) * 86400000, o.hasTime), o.hasTime);
      if (f === 'HH') return fmtDT({ ...o, mi: 0, s: 0 });
      if (f === 'MI') return fmtDT({ ...o, s: 0 });
      throw new Error(`trunc ${f}`);
    }
    default:
      throw new Error(`fn ${fn}`);
  }
}

// The caption of a `+ n` step: the argument first, then what a whole number and a fraction do.
export const plusCaption = (arg) => ({
  en: `+ ${arg}: adding a number moves the date by that many days; a fraction (for example 3/24) moves the clock`,
  ro: `+ ${arg}: un număr adunat mută data cu atâtea zile; o fracție (de exemplu 3/24) mută ceasul`,
});

export function opLabel({ fn, arg }) {
  if (fn === '+') return `+ ${arg}`;
  if (arg === undefined || arg === null) return `${fn}()`;
  return `${fn}(${typeof arg === 'string' ? `'${arg}'` : arg})`;
}

// How Oracle prints a stop: the default date format DD-MON-RR shows the date only, never the
// time. The time of day is returned on its own (null for a date without one), so a widget can
// show it as the part DD-MON-RR hides.
export function oracleDisplay(stop) {
  const o = parseDT(stop);
  return {
    date: formatDate(stop, 'DD-MON-RR').text,
    time: o.hasTime ? formatDate(stop, 'HH24:MI').text : null,
  };
}

export function calendarSteps({ start, ops }) {
  const stops = [start];
  for (const op of ops) stops.push(calendar(stops[stops.length - 1], op));
  return { stops, ops, count: ops.length + 1 };
}
