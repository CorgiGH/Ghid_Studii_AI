// Counted nouns for widget captions and badges, in both languages.
// Romanian: 1 rând, 5 rânduri, 20 de rânduri. A whole number whose last two digits are 00 or 20 and up takes "de"
// (20 de rânduri, 101 rânduri, 120 de rânduri); 0 and 1 to 19 do not.
export const roDe = (n) => {
  const r = Math.abs(n) % 100;
  return Number.isInteger(n) && n !== 0 && (r === 0 || r >= 20) ? 'de ' : '';
};

// roCount(42, 'rând', 'rânduri') -> '42 de rânduri'; roCount(1, 'rând', 'rânduri') -> '1 rând'
export const roCount = (n, one, many) => (n === 1 ? `1 ${one}` : `${n} ${roDe(n)}${many}`);

// The noun alone, as it follows the number n (for a number drawn on its own, such as a counting badge).
export const roNoun = (n, one, many) => (n === 1 ? one : `${roDe(n)}${many}`);

export const enCount = (n, one, many) => `${n} ${n === 1 ? one : many}`;
export const enNoun = (n, one, many) => (n === 1 ? one : many);

// { en, ro } for "N rows"
export const rows = (n) => ({ en: enCount(n, 'row', 'rows'), ro: roCount(n, 'rând', 'rânduri') });
export const rowsNoun = (n) => ({ en: enNoun(n, 'row', 'rows'), ro: roNoun(n, 'rând', 'rânduri') });

// "a, b și c" / "a, b and c"
export const listRo = (xs) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} și ${xs.at(-1)}`);
export const listEn = (xs) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs.at(-1)}`);

// Consecutive numbers as ranges: [120, 121, 122, 123] -> '120–123'; [111, 113] -> '111, 113'.
export function numberRanges(values) {
  const nums = values.map(Number);
  const out = [];
  for (let i = 0; i < nums.length;) {
    let j = i;
    while (j + 1 < nums.length && nums[j + 1] === nums[j] + 1) j += 1;
    out.push(j - i >= 2 ? `${values[i]}–${values[j]}` : values.slice(i, j + 1).join(', '));
    i = j + 1;
  }
  return out.join(', ');
}
