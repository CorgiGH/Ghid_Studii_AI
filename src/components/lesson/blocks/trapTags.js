// The trap catalogue: every misconception tag an mcq wrong option may carry.
// OUTLINE_TAGS is the catalogue in docs/superpowers/specs/2026-10-24-bd-lessons-content-outline.md (section 2);
// STAGED_TAGS are the extra tags the lesson content uses beyond that table.
// A tag used in a lesson but missing here is a validator error, so a typo cannot slip into the review pile.

export const OUTLINE_TAGS = [
  'empty-str-null', 'null-arith', 'concat-null', 'eq-null', 'not-in-null', 'and-or', 'case-sens',
  'quotes-alias', 'curly-quotes', 'ordering-nulls', 'order-pos-alias', 'distinct-row',
  'setop-rules', 'char-pad', 'char-cmp', 'like-escape', 'implicit-conv', 'substr-neg',
  'pad-truncate', 'replace-translate', 'round-neg-mod', 'int-division', 'dual', 'date-time-part',
  'date-format-yy', 'to-char-pad-lang', 'mm-mi', 'month-sort', 'add-months-eom', 'next-day',
  'decode-null', 'case-no-else', 'null-func', 'cartesian', 'ambiguous-col', 'alias-as',
  'join-no-on', 'natural-join-all', 'row-multiply', 'outer-where', 'plus-side', 'self-pair',
  'all-vs-some', 'minus-key', 'concat-prec', 'between-incl',
];

export const STAGED_TAGS = [
  'age-round', 'commit-automatic', 'constraint-roles', 'date-plus-unit', 'db-dedups', 'delete-all',
  'desc-scope', 'diacritics-in-name', 'dml-no-where', 'false-key', 'fk-wrong-target',
  'least-greatest', 'left-to-right', 'like-wildcard', 'missing-is-null', 'missing-vs-empty',
  'name-is-key', 'nullif', 'number-ignored', 'order-insert', 'order-key', 'page-vs-script',
  'parens-ignored', 'precision-vs-scale', 'scale-forgotten', 'schema-vs-instance',
  'script-appends', 'type-allows-dup', 'value-is-id', 'wrong-account', 'year-365',
];

// ML (Învățare automată) tags. Each is the ASCII kebab-case of the label the ML outline gives a wrong option
// (docs/superpowers/specs/ml-outline/2026-10-28-ml-lessons-content-outline.md, quiz items "✗[label]"), plus the misconception
// catalogue of hub/docs/2026-10-28-research-ml/reports/seminar-and-errors.md section B3 as short English names. The slug rule:
// LaTeX commands dropped ($\log$ convexă -> convexa), − ≠ θ σ ρ μ Ω ∅ spelled minus neq theta sigma rho mu omega empty,
// sub- and superscript digits written as digits (log₂ -> log2, σ² -> sigma-2), diacritics dropped, lower case, every other run
// of characters one hyphen. tests/ml/second-subject.test.js holds every outline label to this rule, and the ML content test
// fails on a tag a lesson uses that is not here.
export const ML_TAGS = [
  'caz-particular', 'empty-nu-e-disjuncta', 'uniune-nedisjuncta', 'monotonie-in-sens-invers',
  'complementul-lui-a-luat-drept-complementul-lui-b', 'p-a-b-p-b-a', 'intersectia-in-loc-de-conditionata',
  'marginala-in-loc-de-conditionata', 'uita-conditionarea-extragere-cu-intoarcere',
  'aduna-in-loc-sa-inmulteasca', 'uita-intersectia', 'produsul', 'a-a-b', 'monotonie-in-sens-gresit',
  'definitia-cu-alt-numitor', 'transpusa', 'produs-simplu', 'bucati-suprapuse', 'uita-ipoteza',
  'verosimilitate-in-loc-de-posterior', 'prior-in-loc-de-posterior', 'uitarea-numitorului', 'media-simpla',
  'un-singur-termen', 'suma-conditionatelor', 'se-suprapun', 'nu-acopera', 'sensibilitate-in-loc-de-posterior',
  'rata-fals-pozitivilor', 'fractiune-din-toti', 'uita-ponderea-ghicitului', 'prior', 'doar-ramura-prima-alba',
  'numitor-cu-d', 'negare-gresita', 'independent-fara-nimic-in-comun', 'o-probabilitate-mica-ajuta',
  'aproximativ-independente', 'conditie-necesara-luata-drept-suficienta', 'produsul-in-loc-de-reuniune',
  'presupunerea-luata-drept-regula-generala', 'fara-informatie-intersectia-e-0', 'reuniunea',
  'a-empty-sau-a-omega', 'jumatate', 'simetrie-falsa', 'doar-prima-aruncare', 'uita-conditia',
  'fara-conditia-c', 'g-e-x', 'functia-aplicata-probabilitatilor', 'liniaritatea-cere-independenta',
  'constanta-ignorata', 'semnul-lui-y-pierdut', 'varianta-media', 'p-1-minus-p-fara-n',
  'p-m-f-in-loc-de-c-d-f', 'coada-opusa', 'fara-probabilitati', 'constanta-in-exterior', 'fara-2',
  'doar-salturile-spre-dreapta', 'fara-n', 'suma-probabilitatilor-celor-doua-rezultate',
  'celula-comuna-in-loc-de-conditionata', 'conditionata-inversa', 'variabile-independente-tacit',
  'semn-gresit', 'cov-fara-factorul-2', 'rho-ca-panta', 'cov-0-pentru-ca-y-e-determinata',
  'var-0-inseamna-x-0', 'var-0-inseamna-media-0', 'desfacere-cu-semn-gresit', 'doar-o-celula',
  'sigma-in-loc-de-sigma-2', 'fara-factorul-2', 'linia-gresita', 'celula-singura', 'suma-in-loc-de-produs',
  'produs-pe-randuri', 'independenta-se-mosteneste', 'niciodata', 'o-singura-felie', 'dependenta-marginala',
  'doar-valorile-lui-z', 'presupui-independenta-inainte-de-a-insuma', 'o-singura-celula', 'insumare-dupa-z', 'insumare-dupa-w',
  'marginita-de-1', 'numarul-de-valori', 'ln-in-loc-de-log2', 'semn-pierdut', 'log10', 'ln',
  'h-probabilitatea-clasei-rare', 'h-probabilitatea-clasei-majoritare', 'doar-termenul-rar',
  'clasa-majoritara-conteaza', 'etichetele-conteaza', 'entropia-comuna-cea-mai-mare-dintre-ele',
  'produs-ca-la-probabilitati', 'ig-in-loc-de-entropia-comuna', 'ig-0-imposibil', 'ig-h-strict',
  'medie-fara-ponderi', 'ponderi-inversate', 'y-x-nu-e-variabila-deci-nu-exista', 'h-x-y-h-y-x',
  'scadere-in-loc-de-inlantuire', 'ig-in-loc-de-h-x-y', 'ramura-pura-mai-bun-automat', 'egalitate-pe-date',
  'max-h-in-loc-de-min', 'h-dat-drept-ig', 'duplicat-inconsistent', 'etichete-diferite-inconsistent',
  'citesti-doar-radacina', 'ordinea-ramurilor', 'mai-multe-exemple-mai-putina-incertitudine',
  'aproape-de-1-2-egale', 'fara-logaritmi-nu-se-poate', 'numar-egal-de-exemple-egale', 'ln-biti', 'inmultire',
  'maximul-ca-la-ig', 'produsele-nu-se-compara-fara-logaritm', 'id3-e-determinist', 'primul-din-tabel',
  'ignori-counts', 'ig-in-loc-de-h', 'ramura-se-omite', 'majoritatea-intregului-set',
  'testeaza-din-nou-un-atribut', 'frunza-fara-eticheta', 'arborele-id3', 'spatiul-ipotezelor', 'backtracking',
  'priveste-toti-pasii', 'restrictie-de-spatiu', 'fara-bias', 'ignora', 'eroare-la-antrenare',
  'date-foarte-inconsistente', 'fara-garantii-la-antrenare', 'doar-numarul-de-exemple',
  'atribute-binare-presupuse', 'valori-adunate', 'reconstruieste-la-test', 'se-actualizeaza-singur',
  'toate-mijloacele', 'valoarea-cu-doua-etichete-nu-conteaza', 'din-tot-setul', 'orice-separator',
  'doar-verticale', 'ca-la-discrete', 'acelasi-prag', 'p-cu-r', 'p-cu-acc', 'cvloo-antrenare',
  'randuri-repetate-numarate-o-data', 'overfitting-eroare-mare-la-antrenare', 'definitia-cere-eroare-0',
  'o-singura-antrenare', 'cvloo', 'antrenare-pe-parte', 'de-jos-in-sus', 'toate-deodata',
  'criteriu-pe-antrenare', 'p-mic-taie', 'uiti-valorile-asteptate', 'celule-minus-1', '1-grad-mereu',
  'parti-egale-presupuse', 'entropia-clasei', 'acelasi', 'invers', 'gini-are-maximul-1-ca-entropia',
  'gini-fara-factorul-2', 'diminuare-nula-la-impartirea-perfecta', 'gain-cost', 'cel-mai-ieftin',
  'probabilitatea-numarului-de-steme', 'coeficient-binomial', 'logaritmul-unei-sume',
  'derivata-lui-ln-1-minus-theta', 'mle-probabilitatea-adevarata', 'echiprobabilitatea-in-locul-estimarii',
  'verosimilitatea-e-o-distributie-in-theta', 'verosimilitatea-ca-probabilitate-a-parametrului',
  'probabilitatea-comuna-in-loc-de-conditionata', 'raportul-in-loc-de-proportie', 'rolurile-inversate',
  'aceeasi-moneda', 'logaritmul-sumei', 'raportul', 'varful-se-muta', 'valoarea-creste',
  'confuzie-cu-regula-de-inmultire', 'p-d-1', 'prior-pe-un-singur-factor', 'map-confundat-cu-ml',
  'valoarea-in-loc-de-argument', 'e-nevoie-de-p-d', 'map-neq-ml-chiar-la-priori-egali',
  'map-alege-mereu-ipoteza-cu-prior-mai-mare', 'egalitate-a-produselor', 'votul-lui-h-map', 'p-v-h-necunoscut',
  'doar-numaratorul', 'map-mle', 'adauga-doar-2-observatii', 'prior-doar-la-numarator',
  'prior-doar-la-numitor', 'mle', 'uita-clasa', 'hessiana-nu-e-diagonala', 'nb-cere-atribute-independente',
  'nb-e-inutil-cand-atributele-depind', 'uita-liberi-numara-si-complementele', 'uita-priorul',
  '2-n-1-fara-minus-1', 'cautare-ca-la-id3', 'toate-combinatiile', 'valorile-atributelor-gresite',
  'uita-atributul', 'numitor-gresit', '1-doar-la-numarator', '1-la-numitor-in-loc-de-val',
  'zero-numarat-imposibil', 'se-ignora-atributul', 'omite-cuvintele-absente',
  'foloseste-valorile-instantei-de-antrenament', 'mp-doar-la-numarator', 'add-one-in-loc-de-estimarea-m',
  'independenta-completa', 'simplifica-a-3', 'nb-e-mereu-mai-slab', 'eroare-0-pentru-amandoi',
  'copia-nu-aduce-informatie-noua', 'doar-celula-noua', 'nb-garanteaza-0-pe-date-consistente',
  'votul-majoritar-ramane-sursa', 'nb-neschimbat', 'prea-mult', 'sens-inversat', 'e-comuta-cu-f',
  'sens-neinversat-la-concava', 'convexa', 'am-gm-inversata', 'functia-gresita-in-jensen', 'doar-n-2',
  'jensen-cu-convexa', 'ch-in-loc-de-kl', 'directie-inversata', 'kl-e-distanta', 'simetrica',
  'ch-mic-garanteaza-modelul-adevarat', 'ch-nu-poate-fi-mai-mic-pentru-modelul-fals', 'ch-marginita-de-n',
  'model-sigur-cost-mic', 'priori-egali-nu-mai-conteaza', 'bayes-optimal-vot-bayes-comun',
  'mutually-exclusive-is-independent', 'conditional-transposed', 'base-rate-neglect', 'time-axis-fallacy',
  'approximately-independent', 'cov-zero-means-independent', 'distribution-of-sum-by-adding-probabilities',
  'independence-one-equation', 'var-sum-without-cov', 'mean-must-be-a-value', 'mle-is-true-probability',
  'entropy-bounded-by-one', 'entropy-high-when-rare-events', 'log-base-slip', 'ig-negative-or-above-h',
  'min-ig-vs-max-h', 'h-y-given-x-is-a-variable', 'unweighted-branch-comparison',
  'entropy-counts-not-symmetric', 'id3-finds-smallest-tree', 'zero-train-error-is-good', 'attribute-used-once',
  'every-midpoint-is-a-threshold', 'inconsistent-data-zero-error', 'select-on-test-accuracy',
  'loocv-trains-on-all', 'overfitting-is-high-train-error', 'nb-requires-independence',
  'nb-useless-when-dependent', 'nb-differs-from-jb-always', 'zero-count-is-impossible',
  'laplace-numerator-only', 'add-one-is-map', 'map-ml-swap', 'zero-scores-ratio', 'free-parameters-forgotten',
  'nb-error-counts-test-rows-only',
  // added 2026-10-29 with the outline items for the teacher's list of the Friday test (D-069)
  'media-nu-se-muta', 'constanta-inmultita', 'a-ramane-in-paranteza', 'o-valoare-peste-1-sau-negativa', 'suma-1-ajunge',
  'id3-minimizeaza-direct-eroarea-la-antrenare', 'id3-gaseste-arborele-minim', 'ig-maximizat-pe-tot-arborele',
  'pragul-calculat-pe-tot-setul', 'zona-fara-testele-de-pe-drum', 'cea-mai-mica-eroare-la-antrenare-castiga',
  'erori-apropiate-underfitting', 'alegi-pe-test', 'raportezi-validarea', 'factorii-se-reestimeaza',
  'priorul-trebuie-sa-fie-frecventa', 'decizia-nu-se-schimba', 'bayes-optimal-nu-greseste-niciodata',
  'nb-si-bayes-comun-inversate', 'bayes-comun-e-sensibil-la-atribute-duplicate',
  // added 2026-11-09 with the ML crash P1 rework (D-099)
  'alege-mai-mic', 'atribut-lipsa', 'cale-gresita', 'celula-gresita', 'conditie-lipsa', 'depinde-de-clasa', 'doar-priorul', 'fara-presupunere', 'inlocuire-gresita', 'nu-sterge-nimic', 'numarat-gresit', 'numitor-schimba-clasa', 'ordinea-pruning-inversata', 'prag-gresit', 'prior-compenseaza', 'regula-inventata', 'rezultate-egale', 'sau-in-loc-de-si', 'sterge-clasa', 'zero-compensat',
];

// NN (Rețele neuronale) tags: the mistakes the NN crash packs name, in the ASCII kebab-case Romanian of the ML slug rule.
// Tags that already fit a mistake (semn-gresit, uitarea-numitorului, un-singur-termen, ...) are reused from ML_TAGS.
export const NN_TAGS = [
  'gradient-zero-aproape-de-tinta', 'relu-curbeaza', 'un-neuron-relu-indoaie', 'directia-distantei-gresita',
  'distanta-dreptei-de-la-origine', 'liniar-pe-bucati-luat-drept-liniar', 'ponderi-noi-in-backprop',
  'separator-care-nu-exista', 'formula-depinde-de-y',
  // added 2026-11-09 with the HW3 crash lesson rework (D-099)
  'aceeasi-dreapta-fara-verificare', 'actualizare-cu-plus', 'actualizare-pentru-memorie', 'bias-scaleaza-w', 'cos-confundat', 'derivata-dupa-alt-z', 'eroarea-iesirii-la-intrare', 'factor-sigmoid-pastrat', 'forma-transpusa', 'indice-gresit-din-foaie', 'liniar-doar-fara-bias', 'ln-aplicat-lui-z', 'ln-uitat', 'o-singura-intrare', 'pondere-din-alta-sageata', 'separator-fara-relu', 'separator-vechi-pastrat', 'termenul-nu-dispare', 'uita-1-supra-s', 'uita-derivata-exponentialei', 'uita-factorul-y1-y', 'uita-iesirea-sursei', 'uita-ponderea', 'uita-suma-pe-lot', 'z-luat-drept-distanta',
];

// IA (Inteligență artificială) tags: the mistakes the IA crash pack names (ASCII kebab-case Romanian, the ML slug rule).
export const IA_TAGS = [
  'arc-scoate-din-y', 'arc-in-ambele-sensuri', 'fc-vede-nefixate', 'strict-cu-egalitate', 'dominanta-nu-e-strict-dominanta',
  'egalitatea-strica-nash', 'egalitatea-strica-dominanta', 'lcv-luat-drept-mrv', 'lcv-luat-drept-fc', 'lcv-valoarea-invers',
  'ac-ca-fc', 'ac-ordine-alfabetica', 'baza-si-exponent-inversate', 'produs-in-loc-de-putere', 'complexitatea-ac3-la-backtracking',
  'limita-sub-numarul-real', 'limita-prea-larga', 'toate-colorarile-complete',
  // ia-l05 tags begin (IA lecture 5 full lessons ia-l05a..e, D-099)
  'adancime-mica-explorare-mare', 'alege-blocarea-fara-calcul', 'alegeri-diferite-luate-drept-nesimetric', 'alpha-in-loc-de-beta', 'atribuie-in-loc-de-scade', 'citeste-tot-din-prudenta', 'cooperarea-pare-dominanta', 'copiaza-move-x-si-o', 'dilema-fara-dominanta', 'doi-jucatori-luati-drept-unul', 'doua-usi-inseamna-50-50', 'echilibru-implica-dominanta', 'fara-validare', 'frunza-cea-mai-mica-iluzorie', 'joc-neterminat-cu-tabla-plina', 'kriegspiel-ca-sah', 'max-poate-scadea-sub-prima-frunza', 'minimax-presupune-adversar-slab', 'parte-existenta-luata-drept-lipsa', 'ramai-e-mai-sigur', 'ramuri-socotite-egale', 'remiza-strica-suma-nula', 'scor-maxim-in-loc-de-minim', 'simultan-luat-drept-alternativ', 'tabla-plina-e-remiza', 'taiere-intoarce-valoarea-reala', 'uita-schimbarea-jucatorului', 'validare-doar-nenul', 'validare-fara-limita-gramezii', 'vina-pe-functia-de-scor',
  // ia-l05 tags end
];

import { AG_TAGS } from './trapTagsAg.js';

export const G4_TAGS = [
  'clasa-gresita', 'compara-numitori', 'confuzie-naiv', 'copie-ambii', 'copie-niciunul', 'dependente', 'estimare-confuzie', 'independenta-simpla', 'motiv-gresit', 'nedecis', 'numitor-1', 'optimal-mai-prost', 'ordine-pasi', 'pas-repetat', 'regula-gresita', 'scor-ca-probabilitate', 'sigur', 'tf-gresit', 'zero-ignorat', 'zero-nedefinit',
];


// IA lecture 4 full lessons (ia-l04a..f): generated from the lesson files, one tag per named mistake.
export const IA_L4_TAGS = [
  'ac-inseamna-rezolvat',
  'add-in-loc-de-remove',
  'alege-cea-mai-mare-sau-prima',
  'alege-variabila-libera',
  'amana-verificarea',
  'arbore-cere-backtracking',
  'atac-gresit-pe-diagonala',
  'blamezi-o-variabila-nefixata',
  'blochezi-prea-devreme',
  'bt-un-singur-nivel',
  'coloana-cea-mai-buna-gresita',
  'componenta-conexa-gresita',
  'conflict-pe-granita-corecta',
  'culoare-interzisa-de-vecin',
  'culori-egale-fara-vecinatate',
  'cutset-fara-cicluri',
  'domeniu-gol-gresit',
  'doua-culori-ajung',
  'fc-face-problema-usoara',
  'fc-nu-taie-vecinii',
  'hard-luat-drept-soft',
  'ignora-restrictiile',
  'merge-cu-domeniu-gol',
  'mult-conflict-incompleta',
  'nu-prima-culoare-legala',
  'numara-culori-gresit',
  'numara-doar-anularile',
  'numara-doar-solutia',
  'numara-reintrarile-gresit',
  'partiala-luata-drept-completa',
  'regula-fixa-ajunge-mereu',
  'reluare-gresita',
  'restrictie-la-regiune-nevecina',
  'salt-la-cea-mai-veche',
  'sare-la-vinovat',
  'solutie-luata-drept-inconsistenta',
  'sprijin-confundat-cu-existenta',
  'tehnica-pentru-alta-problema',
  'toate-asignarile-sunt-solutii',
  'uita-taierile-anterioare',
  'uita-variabila-izolata',
  'unara-luata-drept-binara',
  'valori-pierdute-inseamna-inconsistent',
  'vecin-inventat',
  'x7-in-mult-conflict',
];

// NN lecture 4 full lessons (nn-l04a..h): generated from the lesson builder, one tag per named mistake.
export const NN_L4_TAGS = [
  'ce-pentru-regresie',
  'cea-mai-mare-valoare-castiga',
  'cost-mare-la-potrivire',
  'cost-zero-la-model-perfect',
  'derivata-din-alt-loc',
  'epoci-in-loc-de-timp',
  'eroare-mare-pas-mare',
  'eta-mare-merge-bine',
  'eta-mic-ajunge-repede',
  'factorul-gresit-vinovat',
  'forgot-bias-input',
  'forma-gresita',
  'gradient-zero-exact',
  'indice-strat-gresit',
  'indici-inversati',
  'ln-1-este-1',
  'oprire-prea-devreme',
  'ordine-gresita',
  'pasi-egali-la-erori-diferite',
  'pondere-noua-in-delta',
  'prag-acelasi-peste-tot',
  'softmax-pe-toate',
  'suma-diferita-de-1',
  'suma-in-loc-de-medie',
  'termen-gresit-ramas',
  'test-folosit-la-alegere',
  'valoare-negativa-in-distributie',
];

export const TRAP_TAGS = new Set([...G4_TAGS, ...OUTLINE_TAGS, ...STAGED_TAGS, ...ML_TAGS, ...NN_TAGS, ...NN_L4_TAGS, ...IA_TAGS, ...IA_L4_TAGS, ...AG_TAGS]);
