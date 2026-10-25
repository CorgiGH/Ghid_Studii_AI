import { parseDT, daysInMonth, toUTC } from './common.js';
import { roCount } from './words.js';
import { calendar } from './calendar-clock.js';
import { formatDate } from './date-mask.js';

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

// The dates as Oracle prints them by default (DD-MON-RR): the birth, today and the ADD_MONTHS anchor of the days arc.
const oracleDate = (iso) => formatDate(iso, 'DD-MON-RR').text;
export function ageLabels({ birth, today }, parts) {
  return { birth: oracleDate(birth), today: oracleDate(today), anchor: oracleDate(parts.anchor) };
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

// The SQL over each box, as the learner would write it. Until MONTHS_BETWEEN has run (step 1) the whole months are
// not known yet and the calls read "luni"; after that they carry the number, as on the next screen (380).
export function ageArcCalls(parts, known) {
  const n = { en: known ? String(parts.wholeMonths) : 'months', ro: known ? String(parts.wholeMonths) : 'luni' };
  const call = (f) => ({ en: f(n.en), ro: f(n.ro) });
  return {
    y: call((x) => `TRUNC(${x} / 12)`),
    m: call((x) => `MOD(${x}, 12)`),
    d: call((x) => `TRUNC(SYSDATE) - ADD_MONTHS(data_nastere, ${x})`),
  };
}

// The caption of each step, with Romanian counts (380 de luni, 31 de ani, 8 luni).
export function ageCaptions(L, parts, months) {
  const luni = (n) => roCount(n, 'lună', 'luni');
  const ani = (n) => roCount(n, 'an', 'ani');
  const zile = (n) => roCount(n, 'zi', 'zile');
  const en = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  return [
    { en: `Born ${L.birth}, today is ${L.today}. How many years, months and days is that? Guess the number in each box.`, ro: `Născut ${L.birth}, azi este ${L.today}. Câți ani, luni și zile sunt? Ghicește numărul din fiecare casetă.` },
    { en: `MONTHS_BETWEEN(SYSDATE, data_nastere) counts whole months and adds the part of a month that has passed: ${months.toFixed(3)}. TRUNC keeps ${en(parts.wholeMonths, 'whole month', 'whole months')}.`, ro: `MONTHS_BETWEEN(SYSDATE, data_nastere) numără lunile întregi și adaugă partea de lună scursă: ${months.toFixed(3)}. TRUNC păstrează ${luni(parts.wholeMonths)} întregi.` },
    { en: `First box: ${en(parts.wholeMonths, 'month', 'months')} make ${en(parts.years, 'full year', 'full years')} (${en(parts.years * 12, 'month', 'months')}). A birthday that has not come yet does not count.`, ro: `Prima casetă: ${luni(parts.wholeMonths)} fac ${ani(parts.years)} împliniți (${luni(parts.years * 12)}). O zi de naștere care nu a venit încă nu se numără.` },
    { en: `Second box: ${en(parts.months, 'month is', 'months are')} left over after the years.`, ro: `A doua casetă: după ani ${parts.months === 1 ? 'rămâne' : 'rămân'} ${luni(parts.months)}.` },
    { en: `Third box: ADD_MONTHS(data_nastere, ${parts.wholeMonths}) is ${L.anchor}. From there to today ${parts.days === 1 ? 'is 1 day' : `are ${parts.days} days`}. Age: ${en(parts.years, 'year', 'years')}, ${en(parts.months, 'month', 'months')}, ${en(parts.days, 'day', 'days')}.`, ro: `A treia casetă: ADD_MONTHS(data_nastere, ${parts.wholeMonths}) este ${L.anchor}. De acolo până azi ${parts.days === 1 ? 'este 1 zi' : `sunt ${zile(parts.days)}`}. Vârsta: ${ani(parts.years)}, ${luni(parts.months)}, ${zile(parts.days)}.` },
  ];
}
