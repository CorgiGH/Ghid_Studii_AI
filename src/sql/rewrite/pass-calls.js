// Pass 3 (recursive): ANY/ALL (list) -> ARRAY, TRIM of blanks -> NULL, DECODE -> CASE, GREATEST/LEAST -> NULL if any argument is NULL.
import { isSig, isWord, matchParen, nextSig, prevSig, raw, splitTop, trimSpace, untokenize } from './tokens.js'

export function callTransforms(ts) {
  const out = [];
  for (let i = 0; i < ts.length; i++) {
    const x = ts[i];
    const nm = x.type === 'word' ? x.text.toUpperCase() : '';
    if ((nm === 'ANY' || nm === 'SOME' || nm === 'ALL')) {
      const pi0 = prevSig(ts, i); const o0 = nextSig(ts, i);
      if (pi0 >= 0 && ['=', '<', '>', '<=', '>=', '<>', '!=', '^='].includes(ts[pi0].text) && o0 >= 0 && ts[o0].text === '(') {
        const c0 = matchParen(ts, o0); const inner = trimSpace(ts.slice(o0 + 1, c0));
        if (c0 > 0 && !(inner.length && isWord(inner.filter(isSig)[0], 'SELECT'))) {
          const args = splitTop(inner).map((a) => untokenize(callTransforms(trimSpace(a))));
          out.push(raw(`${x.text.toUpperCase()} (ARRAY[${args.join(', ')}])`)); i = c0; continue;
        }
      }
    }
    if (nm === 'TRIM' || nm === 'LTRIM' || nm === 'RTRIM') {          // Oracle: TRIM of only blanks = '' = NULL
      const o1 = nextSig(ts, i); const pi1 = prevSig(ts, i);
      if (o1 >= 0 && ts[o1].text === '(' && !(pi1 >= 0 && ts[pi1].text === '.')) {
        const c1 = matchParen(ts, o1);
        if (c1 > 0) { out.push(raw(`NULLIF(${x.text}(${untokenize(callTransforms(ts.slice(o1 + 1, c1)))}), '')`)); i = c1; continue; }
      }
    }
    if (nm === 'DECODE' || nm === 'GREATEST' || nm === 'LEAST') {
      const o = nextSig(ts, i);
      const pi = prevSig(ts, i);
      if (o >= 0 && ts[o].text === '(' && !(pi >= 0 && ts[pi].text === '.')) {
        const c = matchParen(ts, o);
        if (c > 0) {
          const args = splitTop(ts.slice(o + 1, c)).map((a) => untokenize(callTransforms(trimSpace(a))));
          if (nm === 'DECODE' && args.length >= 3) {
            const e = args[0]; let s = 'CASE';
            let k = 1;
            for (; k + 1 < args.length; k += 2) s += ` WHEN (${e}) IS NOT DISTINCT FROM (${args[k]}) THEN (${args[k + 1]})`;
            if (k < args.length) s += ` ELSE (${args[k]})`;
            s += ' END';
            out.push(raw(s)); i = c; continue;
          }
          if ((nm === 'GREATEST' || nm === 'LEAST') && args.length >= 2) {
            out.push(raw(`CASE WHEN ${args.map((a) => `(${a}) IS NULL`).join(' OR ')} THEN NULL ELSE ${nm}(${args.join(', ')}) END`));
            i = c; continue;
          }
        }
      }
    }
    out.push(x);
  }
  return out;
}

