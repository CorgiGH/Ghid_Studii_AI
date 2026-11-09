// Shared by the ML widget tests: read the numbers out of a caption and out of the marks a widget draws.
// Romanian prints the decimal comma (numbers-bilingual.js roNums): 0,8113 reads back as 0.8113. A tuple of three or more
// values, (0,0,1), keeps its commas: it is protected first, then every other digit,digit is a decimal.
const foldRo = (text) => text
  .replace(/\(\d+(?:,\d+){2,}\)/g, (m) => m.replace(/,/g, '§'))
  .replace(/(\d),(\d)/g, '$1.$2')
  .replace(/§/g, ',');
export const numbersOf = (text) => foldRo(text).match(/(?<![A-Za-z_\d.])\d+(?:\.\d+)?/g) || [];
export const marksOf = (html) => {
  const out = new Set();
  for (const m of html.matchAll(/data-(?:value|box)="([^"]*)"/g)) for (const n of m[1].match(/\d+(?:\.\d+)?/g) || []) out.add(n);
  return out;
};
// every number of a caption is drawn (in both languages, and the two captions say the same numbers)
export function expectCaptionDrawn(expect, cap, html, where) {
  const drawn = marksOf(html);
  for (const lang of ['en', 'ro']) {
    for (const n of numbersOf(cap[lang])) expect(drawn.has(n), `${where} (${lang}): ${n} is in the caption but not drawn. Caption: ${cap[lang]}`).toBe(true);
  }
  expect(numbersOf(cap.en).sort(), `${where}: en and ro captions differ in numbers`).toEqual(numbersOf(cap.ro).sort());
}
