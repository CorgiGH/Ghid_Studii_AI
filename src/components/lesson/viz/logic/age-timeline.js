import { parseDT, daysInMonth, toUTC } from './common.js';

const dayFrac = (o) => (o.h * 3600 + o.mi * 60 + o.s) / 86400;

// Oracle MONTHS_BETWEEN(a, b): whole months when both are the same day number or both
// last days; otherwise the day gap (and time of day) counts as a share of a 31-day month.
export function monthsBetween(a, b) {
  const x = parseDT(a), y = parseDT(b);
  const whole = (x.y - y.y) * 12 + (x.mo - y.mo);
  const bothLast = x.d === daysInMonth(x.y, x.mo) && y.d === daysInMonth(y.y, y.mo);
  if (x.d === y.d || bothLast) return whole;
  return whole + ((x.d - y.d) + (dayFrac(x) - dayFrac(y))) / 31;
}

export function ageSteps({ birth, today }) {
  const months = monthsBetween(today, birth);
  const years = months / 12;
  const days = (toUTC(parseDT(today)) - toUTC(parseDT(birth))) / 86400000;
  return { birth, today, months, years, age: Math.floor(years), days, naive: days / 365, naiveAge: Math.floor(days / 365), count: 4 };
}
