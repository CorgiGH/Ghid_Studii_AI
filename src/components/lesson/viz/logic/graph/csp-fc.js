// graph-walk, mode csp-fc: colouring with MRV (fewest legal values first, ties alphabetical, as the lesson does) and forward
// checking (FC: the chosen value leaves the domain of every unassigned neighbour). An empty domain sends the search back to try
// the next value; when a variable has none left the search goes up one variable. Frames are computed by running the search on
// the graph and the domains of the lesson JSON.
import { both, readGraph, alpha, showSet, valuesWord } from './common.js';
import { listEn, listRo } from '../words.js';

const clone = (d) => Object.fromEntries(Object.entries(d).map(([k, v]) => [k, [...v]]));
const lst = (lang, xs) => (lang === 'en' ? listEn(xs) : listRo(xs));

export function cspFc(props) {
  const G = readGraph(props);
  const { ids } = G;
  if (!props.domains) throw new RangeError('csp-fc needs props.domains');
  const dom0 = Object.fromEntries(ids.map((id) => {
    const d = props.domains[id];
    if (!Array.isArray(d) || d.length === 0) throw new RangeError(`csp-fc: domain of ${id} missing`);
    return [id, d.map(String)];
  }));
  const order = props.tieBreak === 'order' ? ids : [...ids].sort(alpha);
  const mrvOf = (domains, assigned) => {
    const un = order.filter((id) => !(id in assigned));
    const min = Math.min(...un.map((id) => domains[id].length));
    return un.find((id) => domains[id].length === min);
  };
  // more than one unassigned variable has the fewest values: MRV broke a tie
  const tieOf = (domains, assigned) => {
    const un = ids.filter((id) => !(id in assigned));
    const min = Math.min(...un.map((id) => domains[id].length));
    return un.filter((id) => domains[id].length === min).length > 1;
  };

  const frames = [];
  const startMrv = mrvOf(dom0, {});
  frames.push({ kind: 'choose', start: true, domains: clone(dom0), assigned: {}, removed: {}, mrv: startMrv });

  const run = (domains, assigned, depth) => {
    const X = mrvOf(domains, assigned);
    const tie = tieOf(domains, assigned);
    const tried = [];
    const vals = [...domains[X]];
    for (let i = 0; i < vals.length; i++) {
      const v = vals[i];
      const asg = { ...assigned, [X]: v };
      frames.push({ kind: 'assign', domains: clone(domains), assigned: asg, X, v, tried: [...tried], size: domains[X].length, tie });
      const nd = clone(domains);
      nd[X] = [v];
      const removed = {};
      let wipe = null;
      for (const Y of G.nb(X)) {
        if (Y in asg) continue;
        if (nd[Y].includes(v)) {
          nd[Y] = nd[Y].filter((x) => x !== v);
          removed[Y] = [v];
          if (nd[Y].length === 0 && !wipe) wipe = Y;
        }
      }
      let why;
      if (wipe) {
        frames.push({ kind: 'wipeout', domains: nd, assigned: asg, removed, empty: wipe, X, v });
        why = { wipe };
      } else if (Object.keys(asg).length === ids.length) {
        frames.push({ kind: 'solved', domains: nd, assigned: asg, removed, X, v });
        return { ok: true };
      } else {
        frames.push({ kind: 'choose', domains: nd, assigned: asg, removed, mrv: mrvOf(nd, asg), X, v });
        const r = run(nd, asg, depth + 1);
        if (r.ok) return r;
        why = { child: r.X };
      }
      tried.push(v);
      frames.push({ kind: 'back', domains: clone(domains), assigned: { ...assigned }, X, tried: [...tried], next: vals[i + 1] ?? null, why, depth });
    }
    return { ok: false, X };
  };
  const result = run(clone(dom0), {}, 0);
  if (!result.ok) frames.push({ kind: 'failed', domains: clone(dom0), assigned: {}, removed: {} });
  const backtracked = frames.some((f) => f.kind === 'back');

  const M = { frames, count: frames.length, ids, dom0, solved: result.ok, backtracked, mode: 'csp-fc' };
  const sizeOf = (f, id) => f.domains[id].length;

  // ---- the pick asked at frame k (answered before the next frame) ----
  M.pickSpec = (k, predict = true) => {
    const f = frames[k];
    if (!predict || !f) return null;
    if (f.kind === 'choose') {
      const un = ids.filter((id) => !(id in f.assigned));
      if (un.length < 2) return null; // one variable left: nothing to choose
      const ties = order.filter((id) => !(id in f.assigned) && sizeOf(f, id) === sizeOf(f, f.mrv));
      return { items: [{
        key: `f${k}-mrv`, kind: 'single', answer: f.mrv,
        prompt: { en: 'Which variable does MRV take now? Ties go to the first in alphabetical order.', ro: 'Ce variabilă ia MRV acum? La egalitate, prima în ordine alfabetică.' },
        options: un.map((id) => ({ id, label: id })),
        fb: (p, ok) => both((lang) => {
          const T = (en, ro) => (lang === 'en' ? en : ro);
          if (ok && ties.length > 1) {
            const n = valuesWord(sizeOf(f, f.mrv));
            return T(`${lst(lang, ties)} have ${n.en} each; on a tie, the first alphabetically: ${f.mrv}.`, `${lst(lang, ties)} au câte ${n.ro}; la egalitate, prima alfabetic: ${f.mrv}.`);
          }
          if (ok) return T(`${f.mrv} has the fewest values: ${sizeOf(f, f.mrv)}.`, `${f.mrv} are cele mai puține valori: ${sizeOf(f, f.mrv)}.`);
          if (sizeOf(f, p) === sizeOf(f, f.mrv)) return T(`${p} ties with ${f.mrv}, and ${f.mrv} comes first alphabetically.`, `${p} e la egalitate cu ${f.mrv}, iar ${f.mrv} e prima în ordine alfabetică.`);
          return T(`${p} has ${sizeOf(f, p)} values but ${f.mrv} has only ${sizeOf(f, f.mrv)}: MRV takes the fewest.`, `${p} are ${sizeOf(f, p)} valori, dar ${f.mrv} are doar ${sizeOf(f, f.mrv)}: MRV ia variabila cu cele mai puține.`);
        }),
      }] };
    }
    if (f.kind === 'assign') {
      const opts = ids.filter((id) => !(id in f.assigned) && f.domains[id].includes(f.v));
      if (opts.length === 0) return null; // nothing unassigned still has the value: nothing to tap
      const nbs = G.nb(f.X);
      const answer = opts.filter((id) => nbs.includes(id));
      return { items: [{
        key: `f${k}-fc`, kind: 'multi', answer,
        prompt: { en: `Forward checking: from which unassigned variables does ${f.v} leave? Tap them, then check.`, ro: `Forward checking: din ce variabile nefixate iese ${f.v}? Atinge-le, apoi verifică.` },
        confirm: { some: { en: 'Check', ro: 'Verifică' }, none: { en: 'Nothing leaves', ro: 'Nu iese nimic' } },
        options: opts.map((id) => ({ id, label: { en: `${f.v} from ${id}`, ro: `${f.v} din ${id}` } })),
        fb: (p, ok) => both((lang) => {
          const T = (en, ro) => (lang === 'en' ? en : ro);
          if (ok && answer.length === 0) return T(`Right: no unassigned neighbour of ${f.X} still has ${f.v}, so nothing leaves.`, `Corect: niciun vecin nefixat al lui ${f.X} nu mai are ${f.v}, deci nu iese nimic.`);
          if (ok) return T(`Right: ${f.v} leaves ${lst(lang, answer)}, the unassigned neighbours of ${f.X} that still have it.`, `Corect: ${f.v} iese din ${lst(lang, answer)}, vecinii nefixați ai lui ${f.X} care îl mai au.`);
          const extra = (p || []).filter((id) => !answer.includes(id));
          const miss = answer.filter((id) => !(p || []).includes(id));
          if (extra.length) return T(`${lst(lang, extra)} ${extra.length > 1 ? 'are' : 'is'} not a neighbour of ${f.X}: FC cuts only from neighbours.`, `${lst(lang, extra)} ${extra.length > 1 ? 'nu sunt vecini' : 'nu e vecin'} cu ${f.X}: FC taie doar din vecini.`);
          return T(`${lst(lang, miss)} ${miss.length > 1 ? 'are' : 'is'} a neighbour of ${f.X} and still has ${f.v}: it leaves.`, `${lst(lang, miss)} ${miss.length > 1 ? 'sunt vecini' : 'e vecin'} cu ${f.X} și ${miss.length > 1 ? 'au' : 'are'} încă ${f.v}: iese.`);
        }),
      }] };
    }
    if (f.kind === 'wipeout') {
      return { items: [{
        key: `f${k}-wipe`, kind: 'single', answer: 'back',
        prompt: { en: 'A domain is empty. What now?', ro: 'Un domeniu e gol. Ce faci?' },
        options: [{ id: 'go', label: { en: 'Go on', ro: 'Merg mai departe' } }, { id: 'back', label: { en: 'Go back and try another value', ro: 'Mă întorc și încerc altă valoare' } }],
        fb: (p, ok) => both((lang) => (ok
          ? (lang === 'en' ? `${f.empty} has no legal value left, so this branch is dead.` : `${f.empty} nu mai are nicio valoare legală, deci ramura e moartă.`)
          : (lang === 'en' ? `${f.empty} cannot be given any value, so going on is useless.` : `${f.empty} nu mai poate primi nicio valoare, deci nu are rost să mergi mai departe.`))),
      }] };
    }
    if (f.kind === 'back') {
      if (f.next !== null) {
        return { items: [{
          key: `f${k}-next`, kind: 'single', answer: f.next,
          prompt: { en: `Which value of ${f.X} do you try now?`, ro: `Ce valoare încerci acum la ${f.X}?` },
          options: f.domains[f.X].map((v) => ({ id: v, label: v })),
          fb: (p, ok) => both((lang) => {
            const T = (en, ro) => (lang === 'en' ? en : ro);
            if (ok) return T(`${f.next}: the first value not tried yet.`, `${f.next}: prima valoare neîncercată.`);
            if (f.tried.includes(p)) return T(`${p} was already tried; the next untried one is ${f.next}.`, `${p} a fost deja încercată; următoarea neîncercată e ${f.next}.`);
            return T(`${p} is not tried yet, but ${f.next} comes before it: take the values in order.`, `${p} e încă neîncercată, dar ${f.next} vine înaintea ei: ia valorile în ordine.`);
          }),
        }] };
      }
      return { items: [{
        key: `f${k}-more`, kind: 'single', answer: 'no',
        prompt: { en: `Does ${f.X} have another value to try?`, ro: `Mai are ${f.X} vreo valoare de încercat?` },
        options: [{ id: 'yes', label: { en: 'Yes', ro: 'Da' } }, { id: 'no', label: { en: 'No', ro: 'Nu' } }],
        fb: (p, ok) => both((lang) => (ok
          ? (lang === 'en' ? `All of ${showSet(f.tried)} were tried.` : `Toate valorile ${showSet(f.tried)} au fost încercate.`)
          : (lang === 'en' ? `Every value of ${f.X} is crossed out.` : `Toate valorile lui ${f.X} sunt tăiate.`))),
      }] };
    }
    return null;
  };

  // ---- captions ----
  M.caption = (k) => both((lang) => {
    const f = frames[k];
    const T = (en, ro) => (lang === 'en' ? en : ro);
    const dm = (id) => showSet(f.domains[id]);
    if (f.kind === 'choose') {
      if (f.start) {
        return T(`${ids.length} variables. Under each one is its domain, the values it may take. MRV takes the variable with the fewest values.`, `${ids.length} variabile. Sub fiecare e domeniul ei, valorile pe care le poate lua. MRV ia variabila cu cele mai puține valori.`);
      }
      const cut = Object.keys(f.removed);
      const un = ids.filter((id) => !(id in f.assigned));
      const left = un.map((id) => `${id} ${dm(id)}`).join('; ');
      return T(`${f.X} = ${f.v}. FC removed ${f.v} from ${cut.length ? lst(lang, cut) : 'nobody'}. Left to assign: ${left}.`, `${f.X} = ${f.v}. FC a scos ${f.v} din ${cut.length ? lst(lang, cut) : 'nimeni'}. Rămân de fixat: ${left}.`);
    }
    if (f.kind === 'assign') {
      if (f.tried.length) return T(`Next value of ${f.X}: ${f.v}. The neighbours still have what they had before.`, `Următoarea valoare a lui ${f.X}: ${f.v}. Vecinii au din nou ce aveau înainte.`);
      const tie = f.tie ? T(' (ties alphabetical)', ' (la egalitate, alfabetic)') : '';
      return T(`MRV took ${f.X}: ${valuesWord(f.size).en}, the fewest${tie}. It gets its first legal value, ${f.v}.`, `MRV a luat ${f.X}: ${valuesWord(f.size).ro}, cele mai puține${tie}. Primește prima valoare legală, ${f.v}.`);
    }
    if (f.kind === 'wipeout') {
      return T(`Empty domain: you go back. ${f.empty} has no value left after ${f.X} = ${f.v}.`, `Domeniu gol: te întorci. ${f.empty} a rămas fără nicio valoare după ${f.X} = ${f.v}.`);
    }
    if (f.kind === 'back') {
      const why = f.why.wipe
        ? T(`${f.X} = ${f.tried.at(-1)} left ${f.why.wipe} with nothing, so it is crossed out.`, `${f.X} = ${f.tried.at(-1)} l-a lăsat pe ${f.why.wipe} fără valori, deci o tăiem.`)
        : T(`${f.X} = ${f.tried.at(-1)} failed: ${f.why.child} has no value left to try, so it is crossed out.`, `${f.X} = ${f.tried.at(-1)} nu merge: ${f.why.child} nu mai are valori de încercat, deci o tăiem.`);
      const tail = f.next !== null
        ? T(`The domains are back as before ${f.X} was assigned. Left to try: ${showSet(f.domains[f.X].filter((v) => !f.tried.includes(v)))}.`, `Domeniile sunt ca înainte să fixezi ${f.X}. Rămân de încercat: ${showSet(f.domains[f.X].filter((v) => !f.tried.includes(v)))}.`)
        : T(`${f.X} has tried every value${f.depth > 0 ? '; you go up to the variable before it' : ': nothing is left to go back to'}.`, `${f.X} a încercat toate valorile${f.depth > 0 ? '; te întorci la variabila de dinainte' : ': nu mai ai la ce te întoarce'}.`);
      return `${why} ${tail}`;
    }
    if (f.kind === 'solved') {
      const asg = ids.map((id) => `${id} = ${f.assigned[id]}`).join(', ');
      return T(`All assigned: ${asg}. No domain went empty${backtracked ? '' : ', so there was no going back'}.`, `Toate sunt fixate: ${asg}. Niciun domeniu nu s-a golit${backtracked ? '' : ', deci fără întoarcere'}.`);
    }
    return T('Every first choice ends in an empty domain: no colouring exists, the problem is inconsistent.', 'Fiecare prim pas duce la un domeniu gol: nu există colorare, problema e inconsistentă.');
  });

  // ---- the drawing of frame k ----
  M.scene = (k) => {
    const f = frames[k];
    const nodes = G.nodes.map((n) => {
      const id = n.id;
      let cls = '';
      let label;
      let sub;
      if (id in f.assigned) {
        cls = 'fixed';
        label = { items: [{ t: `= ${f.assigned[id]}` }] };
        if ((f.kind === 'assign' || f.kind === 'choose' || f.kind === 'wipeout') && id === f.X) cls = f.kind === 'assign' ? 'focus' : 'fixed';
      } else {
        const gone = f.removed?.[id] || [];
        let toks = dom0[id].filter((v) => f.domains[id].includes(v) || gone.includes(v)).map((v) => ({ t: v, struck: gone.includes(v) }));
        if (f.kind === 'back' && id === f.X) {
          toks = dom0[id].filter((v) => f.domains[id].includes(v)).map((v) => ({ t: v, struck: f.tried.includes(v) }));
          cls = 'focus';
        }
        label = { open: '{', close: '}', items: toks };
        if (f.kind === 'wipeout' && id === f.empty) { cls = 'empty'; label = { open: '{', close: '}', items: toks.map((x) => ({ ...x, struck: true })) }; }
        if (f.kind === 'choose' || f.kind === 'back') sub = f.kind === 'choose' ? valuesWord(f.domains[id].length) : undefined;
      }
      return { id, x: n.x, y: n.y, cls, label, sub, above: n.lab === 'above' };
    });
    const edges = G.edges.map((e) => {
      let cls = '';
      if (f.kind === 'choose' && f.X) {
        const other = e.u === f.X ? e.v : e.v === f.X ? e.u : null;
        if (other && f.removed[other]) cls = 'hl';
      }
      if (f.kind === 'wipeout' && ((e.u === f.X && e.v === f.empty) || (e.v === f.X && e.u === f.empty))) cls = 'bad';
      return { u: e.u, v: e.v, cls };
    });
    return { nodes, edges };
  };
  return M;
}
