// graph-walk, mode ac3: arc consistency as the course gives it (c4ro p.37-38). The queue starts with every constraint in both
// directions. Take the front arc (X, Y); a value of X without a supporting value in D_Y leaves. If X lost something, put (X_k, X)
// at the end of the queue for every neighbour X_k of X, the one just checked (Y) included, duplicates kept. An empty domain
// means inconsistent; an empty queue means done.
import { both, readGraph, showSet, showArc, valuesWord, arcsWord } from './common.js';
import { listEn, listRo } from '../words.js';

const lst = (lang, xs) => (lang === 'en' ? listEn(xs) : listRo(xs));
const holds = (kind, a, b) => (kind === 'lt' ? Number(a) < Number(b) : kind === 'divides' ? Number(b) % Number(a) === 0 : String(a) !== String(b));
export const CONSTRAINTS = ['different', 'lt', 'divides'];
const sign = (kind) => (kind === 'lt' ? '<' : kind === 'divides' ? '|' : '≠');

export function ac3(props) {
  const G = readGraph(props);
  const { ids } = G;
  const kind = props.constraint || 'different';
  if (!CONSTRAINTS.includes(kind)) throw new RangeError(`ac3: unknown constraint ${kind}`);
  if (!props.domains) throw new RangeError('ac3 needs props.domains');
  const dom0 = Object.fromEntries(ids.map((id) => {
    const d = props.domains[id];
    if (!Array.isArray(d) || d.length === 0) throw new RangeError(`ac3: domain of ${id} missing`);
    return [id, d.map(String)];
  }));
  // x is a value of X, y a value of Y; the edge stores the constraint as u R v
  const supports = (X, Y, x, y) => {
    const e = G.edgeOf(X, Y);
    const k = e.c || kind;
    return e.u === X ? holds(k, x, y) : holds(k, y, x);
  };
  const edgeText = (e) => `${e.u} ${sign(e.c || kind)} ${e.v}`;

  const clone = (d) => Object.fromEntries(Object.entries(d).map(([k, v]) => [k, [...v]]));
  const frames = [];
  const trace = [];
  const domains = clone(dom0);
  let queue = [];
  for (const e of G.edges) queue.push({ arc: [e.u, e.v] }, { arc: [e.v, e.u] });
  const snapQ = (q, fresh = []) => q.map((it) => ({ arc: [...it.arc], fresh: fresh.includes(it) }));
  frames.push({ kind: 'start', domains: clone(domains), queue: snapQ(queue) });

  let last = null; // what the previous arc did, for the line under the queue
  let freshItems = [];
  let inconsistent = false;
  while (queue.length) {
    const cur = queue[0];
    const rest = queue.slice(1);
    const [X, Y] = cur.arc;
    const before = [...domains[X]];
    const leaving = before.filter((x) => !domains[Y].some((y) => supports(X, Y, x, y)));
    frames.push({ kind: 'pop', arc: [X, Y], domains: clone(domains), queue: snapQ(queue, freshItems), leaving, before, last });
    domains[X] = before.filter((x) => !leaving.includes(x));
    queue = rest;
    let added = [];
    if (leaving.length && domains[X].length === 0) {
      frames.push({ kind: 'wipeout', arc: [X, Y], X, domains: clone(domains), before, leaving, queue: snapQ(queue) });
      trace.push({ arc: [X, Y], before, removed: leaving, after: [], added: [] });
      inconsistent = true;
      break;
    }
    if (leaving.length) {
      added = G.nb(X).map((Z) => ({ arc: [Z, X] }));
      frames.push({ kind: 'revised', arc: [X, Y], X, Y, domains: clone(domains), before, leaving, queue: snapQ(queue), added: added.map((a) => [...a.arc]) });
      queue = [...queue, ...added];
    }
    freshItems = added;
    trace.push({ arc: [X, Y], before, removed: leaving, after: [...domains[X]], added: added.map((a) => [...a.arc]) });
    last = { arc: [X, Y], leaving, added: added.map((a) => [...a.arc]) };
  }
  if (!inconsistent) frames.push({ kind: 'done', domains: clone(domains), queue: [], last });

  const M = { frames, count: frames.length, ids, dom0, trace, finalDomains: clone(domains), inconsistent, mode: 'ac3' };
  const arcText = (a) => showArc(a);

  M.pickSpec = (k, predict = true) => {
    const f = frames[k];
    if (!predict || !f) return null;
    if (f.kind === 'start') {
      const e = G.edges.length;
      const opts = [...new Set([e, 2 * e, 3 * e])];
      return { items: [{
        key: `f${k}-n`, kind: 'single', answer: String(2 * e),
        prompt: { en: 'How many arcs go into the queue at the start?', ro: 'Câte arce intră în coadă la început?' },
        options: opts.map((n) => ({ id: String(n), label: String(n) })),
        fb: (p, ok) => both((lang) => (ok
          ? (lang === 'en' ? `${e} constraints, each in both directions: ${2 * e} arcs.` : `${e} constrângeri, fiecare în ambele sensuri: ${2 * e} arce.`)
          : (lang === 'en' ? `Each constraint gives two arcs, (X, Y) and (Y, X): ${2 * e}.` : `Fiecare constrângere dă două arce, (X, Y) și (Y, X): ${2 * e}.`))),
      }] };
    }
    if (f.kind === 'pop') {
      const [X, Y] = f.arc;
      return { items: [{
        key: `f${k}-leave`, kind: 'multi', answer: f.leaving,
        prompt: { en: `Arc (${X}, ${Y}): which values of ${X} have no support in ${showSet(f.domains[Y])}? Tap them, then check.`, ro: `Arcul (${X}, ${Y}): ce valori ale lui ${X} nu au sprijin în ${showSet(f.domains[Y])}? Atinge-le, apoi verifică.` },
        confirm: { some: { en: 'Check', ro: 'Verifică' }, none: { en: 'Nothing leaves', ro: 'Nu iese nimic' } },
        options: f.before.map((x) => ({ id: x, label: x })),
        fb: (p, ok) => both((lang) => {
          const T = (en, ro) => (lang === 'en' ? en : ro);
          if (ok) {
            return f.leaving.length
              ? T(`Right: ${lst(lang, f.leaving)} ${f.leaving.length > 1 ? 'have' : 'has'} no compatible value in ${showSet(f.domains[Y])}.`, `Corect: ${lst(lang, f.leaving)} nu ${f.leaving.length > 1 ? 'au' : 'are'} nicio valoare compatibilă în ${showSet(f.domains[Y])}.`)
              : T(`Right: every value of ${X} has a support in ${showSet(f.domains[Y])}, nothing leaves.`, `Corect: fiecare valoare a lui ${X} are sprijin în ${showSet(f.domains[Y])}, nu iese nimic.`);
          }
          const extra = (p || []).filter((x) => !f.leaving.includes(x));
          if (extra.length) {
            const x = extra[0];
            const y = f.domains[Y].find((v) => supports(X, Y, x, v));
            return T(`${x} stays: ${y} in ${Y} is compatible with it.`, `${x} rămâne: ${y} din ${Y} e compatibil cu el.`);
          }
          const x = f.leaving.find((v) => !(p || []).includes(v));
          return T(`${x} has no value in ${showSet(f.domains[Y])} that fits the constraint: it leaves.`, `${x} nu are în ${showSet(f.domains[Y])} nicio valoare care respectă constrângerea: iese.`);
        }),
      }] };
    }
    if (f.kind === 'revised') {
      const [X, Y] = f.arc;
      const opts = [];
      for (const Z of G.nb(X)) opts.push({ id: `${Z},${X}`, label: arcText([Z, X]) }, { id: `${X},${Z}`, label: arcText([X, Z]) });
      return { items: [{
        key: `f${k}-add`, kind: 'multi', answer: f.added.map((a) => a.join(',')),
        prompt: { en: `${X} lost values. Which arcs go to the end of the queue? Tap them, then check.`, ro: `${X} a pierdut valori. Ce arce intră la sfârșitul cozii? Atinge-le, apoi verifică.` },
        confirm: { some: { en: 'Check', ro: 'Verifică' }, none: { en: 'None', ro: 'Niciunul' } },
        options: opts,
        fb: (p, ok) => both((lang) => {
          const T = (en, ro) => (lang === 'en' ? en : ro);
          if (ok) return T(`Right: (X_k, ${X}) for every neighbour X_k of ${X}, including ${Y} (the one just checked), because ${X} changed.`, `Corect: (X_k, ${X}) pentru fiecare vecin X_k al lui ${X}, inclusiv ${Y} (cel abia verificat), pentru că ${X} s-a schimbat.`);
          const flip = (p || []).some((id) => id.startsWith(`${X},`));
          if (flip) return T(`The new arcs end in ${X}: (X_k, ${X}). Only the neighbours' values depend on ${X}.`, `Arcele noi se termină în ${X}: (X_k, ${X}). Valorile vecinilor depind de ${X}.`);
          return T(`Every neighbour of ${X} gets an arc, the one just checked (${Y}) too.`, `Fiecare vecin al lui ${X} primește un arc, și cel abia verificat (${Y}).`);
        }),
      }] };
    }
    return null;
  };

  M.caption = (k, opts = {}) => both((lang) => {
    const f = frames[k];
    const T = (en, ro) => (lang === 'en' ? en : ro);
    const dm = (id) => showSet(f.domains[id]);
    if (f.kind === 'start') {
      const cons = G.edges.map(edgeText).join(', ');
      if (opts.pending) return T(`Constraints: ${cons}. The domains start full.`, `Constrângeri: ${cons}. Domeniile pornesc întregi.`);
      return T(`Constraints: ${cons}. Each gives two arcs, one each way, and all go into the queue in this order. The domains start full.`, `Constrângeri: ${cons}. Fiecare dă două arce, câte unul în fiecare sens; toate intră în coadă în ordinea asta. Domeniile pornesc întregi.`);
    }
    if (f.kind === 'pop') {
      const [X, Y] = f.arc;
      return T(`Front of the queue: (${X}, ${Y}). Only ${X} can lose values. A value of ${X} stays if some value in ${Y} ${dm(Y)} fits the constraint with it.`, `Primul din coadă: (${X}, ${Y}). Doar ${X} poate pierde valori. O valoare a lui ${X} rămâne dacă în ${Y} ${dm(Y)} există o valoare care respectă constrângerea cu ea.`);
    }
    if (f.kind === 'revised') {
      const [X] = f.arc;
      return T(`${lst(lang, f.leaving)} left ${X}: it keeps ${dm(X)}. ${X} changed, so its neighbours must be checked against it again.`, `${lst(lang, f.leaving)} ${f.leaving.length > 1 ? 'au ieșit' : 'a ieșit'} din ${X}: rămâne ${dm(X)}. ${X} s-a schimbat, deci vecinii lui trebuie verificați din nou față de el.`);
    }
    if (f.kind === 'wipeout') {
      return T(`The domain of ${f.X} is empty: the problem is inconsistent, you stop.`, `Domeniul lui ${f.X} e gol: problema e inconsistentă, te oprești.`);
    }
    const fin = ids.map((id) => `${id} = ${dm(id)}`).join(', ');
    return T(`The queue is empty. ${fin}. No domain is empty, so the problem is not inconsistent.`, `Coada e goală. ${fin}. Niciun domeniu nu e gol, deci problema nu e inconsistentă.`);
  });

  // opts.pending: the pick of this frame is not answered yet. On the start frame the queue would give the answer away (2 x constraints), so the strip stays hidden.
  M.scene = (k, opts = {}) => {
    const f = frames[k];
    const arc = f.arc || null;
    const nodes = G.nodes.map((n) => {
      const id = n.id;
      const gone = f.kind === 'revised' || f.kind === 'wipeout' ? (id === f.X ? f.leaving : []) : [];
      const vals = dom0[id].filter((v) => f.domains[id].includes(v) || gone.includes(v));
      let cls = '';
      if (arc && id === arc[0]) cls = f.kind === 'wipeout' ? 'empty' : 'focus';
      if (arc && id === arc[1]) cls = 'target';
      const label = { open: '{', close: '}', items: vals.map((v) => ({ t: v, struck: gone.includes(v) })) };
      return { id, x: n.x, y: n.y, cls, label, above: n.lab === 'above' };
    });
    const edges = G.edges.map((e) => ({
      u: e.u, v: e.v, text: edgeText(e),
      cls: arc && ((e.u === arc[0] && e.v === arc[1]) || (e.u === arc[1] && e.v === arc[0])) ? 'hl' : '',
    }));
    const strips = f.kind === 'start' && opts.pending ? [] : [{
      title: { en: 'Queue', ro: 'Coada' },
      chips: f.queue.map((it, i) => ({ t: arcText(it.arc), cls: (f.kind === 'pop' && i === 0) ? 'cur' : it.fresh ? 'new' : '' })),
      empty: { en: 'empty', ro: 'goală' },
    }];
    let log = null;
    if (f.last && (f.kind === 'pop' || f.kind === 'done')) {
      const l = f.last;
      log = both((lang) => {
        const T = (en, ro) => (lang === 'en' ? en : ro);
        const a = arcText(l.arc);
        if (!l.leaving.length) return T(`${a}: nothing left, nothing added to the queue.`, `${a}: nu a ieșit nimic, nu adăugăm nimic în coadă.`);
        return T(`${a}: ${lst(lang, l.leaving)} left; added to the queue: ${l.added.map(arcText).join(', ')}.`, `${a}: ${l.leaving.length > 1 ? 'au ieșit' : 'a ieșit'} ${lst(lang, l.leaving)}; am adăugat în coadă: ${l.added.map(arcText).join(', ')}.`);
      });
    }
    let chips = null;
    if (f.kind === 'revised' || f.kind === 'wipeout') {
      chips = { title: { en: `Domain of ${f.arc[0]} before`, ro: `Domeniul lui ${f.arc[0]} înainte` }, items: f.before, verdicts: f.before.map((x) => !f.leaving.includes(x)) };
    }
    return { nodes, edges, arc, strips, log, chips };
  };
  M.valuesWord = valuesWord; M.arcsWord = arcsWord;
  return M;
}
