import { parseDT, daysInMonth, toUTC } from './common.js';
import { calendar } from './calendar-clock.js';

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

// Age as years, months, days: TRUNC(MONTHS_BETWEEN) gives whole months; ADD_MONTHS moves the
// birth date forward by them and what is left up to `today` is the days.
export function ageParts({ birth, today }, months = monthsBetween(today, birth)) {
  const whole = Math.trunc(months);
  const anchor = calendar(birth, { fn: 'ADD_MONTHS', arg: whole });
  const days = Math.floor((toUTC(parseDT(today)) - toUTC(parseDT(anchor))) / 86400000);
  return { years: Math.trunc(whole / 12), months: whole % 12, days, wholeMonths: whole, anchor };
}

// The step on which each arc appears, and the step on which the yearly birthday ticks light up:
// the same one as the years arc (the ticks are what the years arc counts).
export const ARC_AT = { y: 2, m: 3, d: 4 };
export const ticksLit = (step) => step >= ARC_AT.y;

export function ageSteps({ birth, today }) {
  const months = monthsBetween(today, birth);
  const years = months / 12;
  const days = (toUTC(parseDT(today)) - toUTC(parseDT(birth))) / 86400000;
  return { birth, today, months, years, age: Math.floor(years), days, naive: days / 365, naiveAge: Math.floor(days / 365), parts: ageParts({ birth, today }, months), count: 5 };
}
