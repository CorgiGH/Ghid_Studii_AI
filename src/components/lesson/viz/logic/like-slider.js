import { likeTrace, likeTokens } from './common.js';

export const likeSteps = likeTrace;
export { likeTokens };

export function likeSlider({ pattern, values }) {
  return { tokens: likeTokens(pattern), traces: values.map(v => likeTrace(pattern, v)), count: values.length + 1 };
}

const ORD_RO = ['prima', 'a doua', 'a treia', 'a patra', 'a cincea', 'a șasea', 'a șaptea', 'a opta', 'a noua', 'a zecea'];
const ORD_EN = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'];

// The opening caption: what each sign that is in this pattern does, in pattern order, and where its letters must sit.
// Only the signs the pattern has are explained ('%escu' says nothing about _).
export function likeIntro(pattern) {
  const toks = likeTokens(pattern);
  const en = [], ro = [];
  const said = new Set();
  for (let i = 0; i < toks.length;) {
    const tok = toks[i];
    if (tok.kind !== 'lit') {
      if (!said.has(tok.kind)) {
        said.add(tok.kind);
        if (tok.kind === 'one') { en.push('_ takes exactly one letter'); ro.push('_ ia exact o literă'); }
        else { en.push('% takes any number of letters, even none'); ro.push('% ia oricâte litere, chiar niciuna'); }
      }
      i += 1;
      continue;
    }
    let j = i;
    while (j < toks.length && toks[j].kind === 'lit') j += 1;
    const run = toks.slice(i, j).map(x => x.ch).join('');
    const before = toks.slice(0, i);
    const fixedStart = before.every(x => x.kind !== 'many');
    const one = run.length === 1;
    if (fixedStart && i === 0) {
      en.push(`«${run}» must be exactly at the start`); ro.push(`«${run}» trebuie să fie exact la început`);
    } else if (fixedStart && i < ORD_RO.length) {
      en.push(one ? `«${run}» must be the ${ORD_EN[i]} letter` : `«${run}» must start at the ${ORD_EN[i]} letter`);
      ro.push(one ? `«${run}» trebuie să fie ${ORD_RO[i]} literă` : `«${run}» trebuie să înceapă de la ${ORD_RO[i]} literă`);
    } else if (j === toks.length) {
      en.push(`«${run}» must be exactly at the end`); ro.push(`«${run}» trebuie să fie exact la sfârșit`);
    } else {
      en.push(`«${run}» must appear in the name`); ro.push(`«${run}» trebuie să apară în nume`);
    }
    i = j;
  }
  return {
    en: `The pattern ${pattern} is laid over each name. ${en.join('; ')}.`,
    ro: `Șablonul ${pattern} se așază peste fiecare nume. ${ro.join('; ')}.`,
  };
}

// What one name's step says, from its trace.
export function likeCaption(pattern, value, trace) {
  const v = [...String(value)];
  if (trace.match) {
    return {
      en: `${value}: every part of the pattern found its letters, and no letter is left over. It matches.`,
      ro: `${value}: fiecare parte din șablon și-a găsit literele și nu rămâne nicio literă. Se potrivește.`,
    };
  }
  const fail = trace.steps.at(-1);
  if (fail.leftover) {
    return {
      en: `${value}: the pattern ended, but letters are left over. No match.`,
      ro: `${value}: șablonul s-a terminat, dar au rămas litere. Nu se potrivește.`,
    };
  }
  if (fail.from >= v.length) {
    return {
      en: `${value}: the name ended before the pattern found all its letters. No match.`,
      ro: `${value}: numele s-a terminat înainte ca șablonul să-și găsească toate literele. Nu se potrivește.`,
    };
  }
  const toks = likeTokens(pattern);
  const tail = pattern.slice(1);
  // '%' then only letters: the ending is what counts
  if (toks[0].kind === 'many' && toks.length > 1 && toks.slice(1).every(x => x.kind === 'lit')) {
    const end = v.slice(-tail.length).join('');
    return {
      en: `${value}: % can take any beginning, but at the end the pattern needs «${tail}», and here it is «${end}». No match.`,
      ro: `${value}: % poate lua orice început, dar la sfârșit șablonul cere «${tail}», iar aici e «${end}». Nu se potrivește.`,
    };
  }
  const want = toks[fail.tok].ch;
  return {
    en: `${value}: the letter «${v[fail.from]}» is not «${want}», as the pattern requires. No match.`,
    ro: `${value}: litera «${v[fail.from]}» nu este «${want}», cum cere șablonul. Nu se potrivește.`,
  };
}

export function likeTally(matches, total) {
  return {
    en: `${matches} of ${total} names match.`,
    ro: `${matches} din ${total} nume ${matches === 1 ? 'se potrivește' : 'se potrivesc'}.`,
  };
}
