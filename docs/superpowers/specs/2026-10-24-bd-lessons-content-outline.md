# Schița de conținut BD L1 (SQL, laboratoarele 1-4)

Starea la 2026-10-24. Cum citești schița:
- Textele pentru cursant sunt în română, notele de proiectare în engleză.
- Etichetele de încredere sunt cele cerute: INFERRED, plus „Oracle: de verificat”.
- Rândurile și rezultatele numerice vin din datele scriptului live `resurse_script_facultate.sql`.
- Le-am calculat într-un emulator sqlite (`python3 -I`), nu în Oracle. Emulatorul validează logica și numărul de rânduri, nu comportamentul specific Oracle.
- Pe mașină nu există Oracle, deci toate afirmațiile Oracle-specifice rămân de verificat pe XE 11g înainte de livrare.
- Fișiere de lucru:
  - `/home/alexa/hub/docs/2026-10-24-research-bd-lessons/outline-tools/mkdb.py` (încarcă scriptul live în sqlite)
  - `/home/alexa/hub/docs/2026-10-24-research-bd-lessons/outline-tools/mock.py` (schema testului de probă)
  - `/home/alexa/hub/docs/2026-10-24-research-bd-lessons/mock-test-biblioteca.sql` (scriptul Oracle al schemei testului de probă)

---

## 0. Cum se leagă schița de Ghid_Studii_AI și de ritmul lui Alex

### 0.1 Ce există deja în Ghid (citit, nu modificat)
- **Registrul de materii.**
  - `src/content/registry.js:9-20` are un singur semestru, `y1s2`. BD (anul 2, semestrul 1) cere un semestru nou. INFERRED: `y2s1`, după tiparul `y1s2`.
  - Materia are forma din `oop/index.js:4-27`: `slug`, `title{en,ro}`, `courses[{id,title,shortTitle,sectionCount,metaId,src}]`, `labs`, `tests`.
- **Cursul ca JSON.**
  - Formă: `{meta:{id,title,shortTitle,source}, steps:[{id,title,group,blocks[]}]}`. Exemplu: `oop/courses/course-02.json`.
  - Propunere: 6 „cursuri” = module, fiecare lecție = un `step`. Modulele: Fundamente, Filtrare și mulțimi, Funcții pe linie, Date, JOIN, Test de probă.
- **Blocuri existente** (`src/components/blocks/registry.js:4-23`): `learn`, `definition`, `think`, `quiz`, `code`, `callout`, `table`, `list`, `animation`, `code-challenge`, `terminal`.
  - `callout` are variantele `tip|info|warning|trap` (numărate în toate cursurile: 137/130/92/54).
  - `quiz` are `question`, `options[{text,correct,explanation}]`, `explanation`, `reviewStep`.
- **Animații.**
  - `AnimationBlock.jsx` primește `renderer` + `data{meta,config,steps}`.
  - `StepPlayer.jsx:10,57-67` are `prediction{en,ro}` pe pas, deci „prezice, apoi vezi” există.
  - `TableRenderer.jsx` are însă temporizator de redare automată. Playbook-ul cere avans doar manual, așa că mașina SQL nu preia temporizatorul.
- **Teste.** `oop/tests/*.json`, `questions[{id,type:'code-writing',points,language,prompt,solution}]`. Testul de probă are nevoie de un tip nou de întrebare, `sql`.

### 0.2 Ce trebuie adăugat
| Piesă nouă | Rol |
|---|---|
| renderer `sql-machine` (în `AnimationBlock`) | banda rulantă FROM → JOIN → WHERE → SELECT → DISTINCT → ORDER BY, cu predicție înainte de fiecare pas, avans manual, tranziții animate |
| bloc `sql-exercise` | enunț verbatim, cutie SQL reală, rezultat așteptat generat de soluția de referință, scara de indicii, regulile verificatorului |
| câmp opțional `misconception` pe fiecare opțiune de quiz | numele concepției greșite (metadată de autor) și hrană pentru „grămada de greșeli” |
| `tests[].questions[].type = 'sql'` | testul de probă, cu mod hârtie |

### 0.3 Ritmul în 5 faze, aplicat fiecărei lecții
Sursa: `wiki/concepts/Learning Rhythm.md`.
1. **Pretest** (`think`). O întrebare la care nu se poate răspunde încă.
2. **Concret.** Mașina de interogări cu predicție, plus 2-3 exemple și un `callout trap` pentru 2-3 capcane. Capcanele trimit la catalogul din secțiunea 2, prin etichete `[ca-aceasta]`.
3. **Regula.** `definition`/`learn`, scurt. Se deduce din conceptele fiecărei lecții și nu e repetată mai jos.
4. **„De ce?”** (`think`, cauzal sau comparativ).
5. **Quiz** (3-4 itemi, fiecare distractor = o concepție greșită numită, fiecare opțiune cu explicație de 1-3 propoziții și `reviewStep`) **plus „Scrie singur”.**
   - În quiz, `♻` înseamnă item care revizitează o lecție anterioară. Țintă: circa 30% din itemi (Spaced Retrieval).
   - Notația din quiz: `✓` răspunsul corect; `✗[nume]` distractor cu numele concepției greșite.

**Scara de indicii pentru „Scrie singur”** (Subgoal Labeling + Faded Examples, fading de la coadă):
1. Etichetă de subobiectiv generică: „Alege tabelele”, „Leagă tabelele”, „Filtrează rândurile”, „Calculează coloanele”, „Ordonează”.
2. Schelet cu goluri.
3. Indiciu despre capcana exercițiului.
4. Soluția completă cu explicație.

În fiecare lecție cu mai multe exerciții, primul vine ca exemplu rezolvat cu etichete, al doilea cu ultimul pas lăsat gol, ultimul de la zero. Înainte de a scrie, cursantul face „urmărește” (Trace Before Write): prezice ce întoarce o interogare dată, abia apoi o scrie.

### 0.4 Reguli de proiectare pentru verificator și motor
Rezultă din exercițiile oficiale.

- **Data „azi” fixată.**
  - `SYSDATE` = 2026-10-26 14:30:00. Ora nenulă face vizibile capcanele TRUNC/ROUND (`[date-time-part]`).
  - Sesiune în engleză: `NLS_DATE_LANGUAGE=ENGLISH`, `NLS_DATE_FORMAT='DD-MON-RR'`. Panou „Setările sesiunii” care le arată.
  - Exercițiile cu dată (lab 3 ex 1, 2, 7, 11, 12) se verifică și cu o a doua dată („azi” = 2026-08-26, două zile de naștere) ca să nu treacă soluții care merg doar pe o dată.
- **A doua bază de date ascunsă.** Aceeași schemă, rânduri modificate. Respinge răspunsuri cu valori scrise de mână și arată enunțurile subspecificate. Exemplu: cheia „prenume descrescător” din lab 2 ex 8 nu poate fi verificată pe datele live, fiindcă nu există egalități pe nume.
- **Reguli de comparare.**
  - Mulțime de rânduri, ordine verificată doar dacă enunțul cere ORDER BY.
  - La egalitate pe cheia de sortare, orice ordine e acceptată.
  - Numerele se compară cu toleranță (motorul real folosește zecimale exacte, sqlite folosește virgulă mobilă).
  - Spațiile finale și majusculele la nume de zile/luni sunt „cosmetice”.
  - Antetul coloanei contează doar la exercițiile cu alias cerut.
- **Erori Oracle reale.** Motorul trebuie să dea codurile reale (ORA-00918, ORA-00904, ORA-25155, ORA-00933, ORA-01722, ORA-01789...), fiindcă o parte din capcane se predau prin eroare.
- **Ghilimele „curbe”.** Enunțurile oficiale conțin ghilimele tipografice (“a”, “n”). Cutia SQL le normalizează sau avertizează (`[curly-quotes]`).
- **Prioritate pentru luni** (INFERRED, scopul L1 nu e publicat oficial):
  - De bază: lecțiile 2-9, 18-21.
  - Important: 11-16, 22-24.
  - Mai puțin probabil: 10, 17.

---

## 1. Lista lecțiilor

### Acoperirea exercițiilor oficiale (44, fiecare exact o dată)
| Lab | Exercițiu → lecția |
|---|---|
| 2 (inline 1, 2 + 15) | inline 1 → L2 · ex 1, 2, 3 → L2 · inline 2 → L3 · ex 4 → L8 · ex 5 → L14 · ex 6 → L14 · ex 7 → L5 · ex 8 → L8 · ex 9 → L5 · ex 10 → L6 · ex 11 → L6 · ex 12 → L7 · ex 13 → L6 · ex 14 → L6 · ex 15 → L11 |
| 3 (13) | ex 1 → L13 · ex 2 → L13 · ex 3 → L14 · ex 4 → L12 · ex 5 → L12 · ex 6 → L11 · ex 7 → L15 · ex 8 → L14 · ex 9 → L16 · ex 10 → L12 · ex 11 → L15 · ex 12 → L16 · ex 13 → L12 |
| 4 (14) | ex 1, 2, 3 → L19 · ex 4, 5, 6 → L20 · ex 7 → L21 · ex 8 → L22 · ex 9 → L21 · ex 10 → L21 · ex 11 → L23 · ex 12 → L23 · ex 13 → L24 · ex 14 → L24 |

- Verificare numerică: 4+1+2+4+1+2+2+4+2+4+2+2+3+3+3+1+2+2 = 44.
- **Lab 1** (CREATE, INSERT, rulat `facultate.sql`, `user_tables`, `DESCRIBE`): DDL/DML sunt în afara L1, deci cele 3 exerciții nu se plasează. Teoria din lab 1 (model relațional, NULL, chei, tipuri) intră în L1. `DESCRIBE`/`user_tables` devin panoul „Schema” din L1.
- **Lab 5** (recapitulare, alte exemple JOIN, primul test): pagina are 314 octeți, fără conținut nou. Corespondentul e L25.
- Enunțurile sunt copiate verbatim din `/home/alexa/hub/docs/2026-10-24-research-bd-lessons/official/lab2.txt`, `lab3.txt`, `lab4.txt` (inclusiv ghilimelele și lipsa diacriticelor din original). „ADAPT” marchează schimbările necesare în aplicație.

### Harta dependențelor
```
L1 → L2 → L3 → L4 → L5 → L6, L7 → L8 → L9
L3 → L10 → L11 → L12
L4 → L13 → L14 → L15 → L16 (L5, L11 → L16)
L17 (după L16)
L4, L5, L8, L9 → L18 → L19 → L20
L19 → L21 → L22
L9, L20 → L23
L14, L21, L23 → L24
toate → L25
```

---

### Modulul 1. Fundamente

### Lecția 1. Tabel, rând, coloană, NULL, cheie
**Necesită:** nimic.
- **Concepte:**
  - (a) tabel = rânduri × coloane, cu tip pe coloană (CHAR, VARCHAR2, NUMBER, DATE); ordinea rândurilor nu contează;
  - (b) NULL = informație lipsă, nu zero;
  - (c) cheie primară / cheie străină;
  - (d) schemă vs instanță, plus cele 5 tabele ale laboratorului.
- **Pretest:** „Secretara are o foaie cu studenții și alta cu notele. Cum știe a cui e nota 10 de pe a doua foaie?”
- **Hook:** catalogul de hârtie. Dacă notele ar sta pe foaia studentului, Popescu ar fi copiat de 6 ori (are 6 note în `note`).
- **Mașina** (fără interogări, „harta tabelelor”): clic pe `note.nr_matricol` și o săgeată animată zboară spre rândul din `studenti`. Celulele NULL apar gri, diferit de 0. Predicție: „a cui e nota 10 la cursul 24?”.
- **De ce?** „De ce pui NULL, nu 0, pentru un student fără bursă?” Răspuns: 0 înseamnă „primește 0 lei”, NULL înseamnă „nu avem informația”. Zero e o valoare reală care intră în calcule.
- **Quiz:**
  1. Ce e NULL în `bursa`? ✓ lipsa informației · ✗[NULL=0] zero · ✗[NULL=spațiu] un spațiu gol.
  2. Care coloană din `note` e cheie străină spre `studenti`? ✓ `nr_matricol` · ✗[valoare=identificator] `valoare` · ✗[țintă greșită] `id_curs` (e cheie străină, dar spre `cursuri`).
  3. Pot exista doi studenți cu același nume și prenume? ✓ da (Bodnar Ioana, 116 și 119), de aceea numele nu e cheie · ✗[nume=cheie] nu · ✗[confuzie cu cheia] da, dar atunci au și același `nr_matricol`.
  4. Ce se schimbă când adaugi un student? ✓ instanța · ✗[schemă=date] schema.
- **Scrie singur:** nu există exercițiu oficial. Auxiliar: explorator cu `SELECT * FROM <tabelă>` pe fiecare din cele 5 tabele (13 / 9 / 42 / 16 / 10 rânduri). Panoul „Schema” înlocuiește `DESCRIBE` și `user_tables`.

### Lecția 2. SELECT: coloane, alias, DISTINCT
**Necesită:** L1.
- **Concepte:**
  - (a) `SELECT listă FROM tabel`, `*`;
  - (b) alias (AS opțional, „...” pentru spații sau literă mică, fără ghilimele → majuscule);
  - (c) DISTINCT / UNIQUE pe întregul rând;
  - (d) cuvintele-cheie nu țin cont de majuscule, valorile text da.
- **Pretest:** „Anii studenților sunt 1,1,1,1,2,2,2,2,3,3,3,3,3. Ce interogare dă 1,2,3?”
- **Hook:** secretara vrea lista anilor în care avem studenți, nu 13 rânduri.
- **Mașina:**
  - FROM aprinde 13 rânduri;
  - SELECT stinge coloanele nealese;
  - DISTINCT topește rândurile identice, cu contorul 13 → 3.
  - Predicție: câte rânduri dă `SELECT DISTINCT an, grupa`? Răspuns: 7, adică (3,A2), (3,A4), (3,B3), (2,A1), (2,B2), (1,B1), (1,B2).
- **Capcane:** `[distinct-row]`, `[case-sens]`, `[quotes-alias]`, `[curly-quotes]`.
- **De ce?** „De ce `SELECT DISTINCT an, grupa` nu dă 3 rânduri?” Răspuns: DISTINCT se aplică combinației, nu primei coloane.
- **Quiz:**
  1. `SELECT DISTINCT an, grupa` → câte rânduri? ✓ 7 · ✗[DISTINCT pe prima coloană] 3 · ✗[DISTINCT ignorat] 13.
  2. Alias cu spații: ✓ `nume AS "Nume Profesor"` · ✗[ghilimele simple] `'Nume Profesor'` · ✗[fără ghilimele] `nume Nume Profesor`.
  3. Ce comandă dă aceleași rânduri ca `SELECT nume FROM studenti`? ✓ `select NUME from STUDENTI` · ✗[ghilimele opționale peste tot] `select "nume" from studenti` (eroare ORA-00904).
  4. ♻ L1: în ce ordine vin rândurile fără ORDER BY? ✓ nespecificată · ✗[ordine de inserare] cea de inserare · ✗[ordine după cheie] după cheie.
- **Scrie singur** (fading: inline → ex 1 → ex 2 → ex 3):
  - Inline: „Exerciţiu: selectaţi toate liniile şi toate coloanele din tabelul studenti.” → 13 × 7.
  - Ex 1: „Scrieți o interogare pentru a afișa numele, prenumele, anul de studiu si data nașterii pentru toți studenții. Editați în SQL*Plus și executați. Salvați apoi interogarea intr-un fișier numit p1.sql.” → 13 × 4. ADAPT: partea cu SQL*Plus și `p1.sql` dispare.
  - Ex 2: „Scrieți și executați o interogare pentru a afișa în mod unic valorile burselor.” → 4 rânduri (250, 350, 450 și NULL; DISTINCT păstrează un singur NULL).
  - Ex 3: „Încărcați fișierul p1.sql în buffer. Dați fiecărei coloane din clauza SELECT un alias. Executați înterogarea.” ADAPT: pornește de la interogarea din ex 1, precompletată. Verificator: 4 coloane, fiecare cu antet diferit de numele original; aliasurile nu sunt impuse.

### Lecția 3. Calcule și text: aritmetică, `||`, NULL în expresii
**Necesită:** L2.
- **Concepte:**
  - (a) operatori aritmetici și precedența lor;
  - (b) NULL contaminează aritmetica;
  - (c) `||` și constantele text;
  - (d) `||` tratează NULL ca șir vid (contrast cu `+`).
- **Pretest:** „Sponsorul dă 10 lei fiecărui student. Ce apare în dreptul unui student fără bursă?”
- **Hook:** `bursa + 10` pentru cei 8 studenți fără bursă rămâne gol.
- **Mașina:**
  - apare coloana calculată `bursa + 10`;
  - celulele NULL rămân NULL, cu un efect vizual de „fum” care se propagă;
  - apoi `'Studentul ' || nume || ...` lipește celule;
  - comutator: „NULL cu `+`” vs „NULL cu `||`”.
- **Capcane:** `[null-arith]`, `[concat-null]`, `[int-division]` (5/2 = 2,5 în Oracle), `[concat-prec]` (INFERRED: `||` și `+` au aceeași precedență).
- **De ce?** „De ce `NULL + 10` e NULL, dar `'abc' || NULL` e 'abc'?” Răspuns: aritmetica cu „necunoscut” rămâne necunoscută; Oracle tratează NULL ca șir vid la concatenare (alte SGBD-uri nu).
- **Quiz:**
  1. `bursa + 10` la student fără bursă ✓ NULL · ✗[NULL=0] 10 · ✗[NULL=eroare] eroare.
  2. `(bursa+100)/2` vs `bursa+100/2` la bursa 450 ✓ 275 vs 500 · ✗[paranteze ignorate] la fel · ✗[stânga-dreapta] 275 în ambele.
  3. `'Anul ' || an || '.'` pentru an=2 ✓ `Anul 2.` · ✗[tipare stricte] eroare, `an` e număr · ✗[număr ignorat] `Anul .`.
  4. `'Bursa: ' || bursa` pentru NULL ✓ `Bursa: ` · ✗[NULL contaminează tot] NULL · ✗[NULL=0] `Bursa: 0`. (Oracle: de verificat.)
- **Scrie singur:** „Exerciţiu: Afişaţi jumătate din valoarea bursei studenţilor la care a fost adăugat în prealabil o sumă de 100 ron. Ţineţi cont de precedenţa operatorilor.” → `(bursa+100)/2`: 13 rânduri, cinci valori (275, 225, 225, 175, 225 în ordinea 113, 117, 118, 120, 122) și 8 NULL. Auxiliar (propoziția din lab 2): `'Studentul '||nume||' '||prenume||' este inmatriculat in anul '|| an ||'.' AS info`.

### Modulul 2. Filtrare, sortare, mulțimi

### Lecția 4. WHERE: comparații și AND / OR / NOT
**Necesită:** L2, L3.
- **Concepte:**
  - (a) WHERE păstrează rândurile pentru care condiția e adevărată;
  - (b) `= <> != < <= > >=`, text între apostroafe, case-sensitive;
  - (c) AND / OR / NOT, cu precedența NOT → AND → OR;
  - (d) paranteze.
- **Pretest:** „Studenții din anul 1 care iau bursă sau cei din anul 2. Câți sunt? Scrie condiția din ochi.”
- **Hook:** secretara cere „anul 1 sau anul 2 cu bursă”.
- **Mașina:** banda de 13 rânduri trece printr-o poartă WHERE. Fiecare rând primește un verdict colorat, iar condiția compusă apare ca arbore, cu paranteze care se mută. Predicție: clic pe rândurile care crezi că trec.
- **Capcane:** `[and-or]`, `[case-sens]`, `[implicit-conv]`.
- **De ce?** „De ce `an=1 OR an=2 AND bursa IS NOT NULL` aduce și studenți din anul 1 fără bursă?” Răspuns: AND leagă mai strâns, deci condiția e `an=1 OR (an=2 AND bursa IS NOT NULL)`.
- **Quiz:**
  1. `prenume = 'ioana'` pe datele noastre ✓ 0 rânduri · ✗[text insensibil la majuscule] 3 rânduri.
  2. `an=1 OR an=2 AND bursa IS NOT NULL` ✓ 6 rânduri (117, 118, 120, 121, 122, 123) · ✗[evaluare stânga-dreapta] 4 rânduri · ✗[AND și OR egale] 13.
  3. `WHERE an = '3'` cu `an` NUMBER ✓ merge prin conversie implicită, dar e obicei prost · ✗[tipare stricte] ORA-01722.
  4. ♻ L3: `WHERE bursa + 10 > 0` ✓ doar cei 5 cu bursă · ✗[NULL=0] toți 13.
- **Scrie singur:** nu există exercițiu oficial. Auxiliar, din textul lab 2: `WHERE an = 1` și `WHERE bursa IS NOT NULL AND an = 1`.

### Lecția 5. NULL în WHERE: IS NULL și logica cu trei valori
**Necesită:** L4.
- **Concepte:**
  - (a) `= NULL` nu găsește nimic; se folosește `IS [NOT] NULL`;
  - (b) TRUE / FALSE / UNKNOWN, WHERE păstrează doar TRUE;
  - (c) NOT UNKNOWN rămâne UNKNOWN;
  - (d) filtre și calcule peste coloane nullable.
- **Pretest:** „Câți studenți nu iau bursă? Scrie `WHERE bursa = NULL` și spune ce iese.”
- **Hook:** `WHERE bursa = NULL` dă 0 rânduri, deși sunt 8 studenți fără bursă.
- **Mașina:** aceeași poartă, dar cu trei culori (verde = TRUE, roșu = FALSE, gri = UNKNOWN). Un comutator NOT inversează verde↔roșu și lasă grii neschimbați. Predicție: câte rânduri trec la `NOT (bursa > 300)`? Răspuns: 1 (doar Pintescu, 250), deși `bursa > 300` dă 4. Cele 8 rânduri NULL rămân gri în ambele.
- **Capcane:** `[eq-null]`, `[empty-str-null]`, `[null-arith]`.
- **De ce?** „Dacă `bursa > 300` dă 4 rânduri și `NOT (bursa > 300)` dă 1, unde sunt celelalte 8?” Răspuns: NULL > 300 este UNKNOWN, iar NOT UNKNOWN este tot UNKNOWN.
- **Quiz:**
  1. `bursa = NULL` ✓ 0 rânduri, fără eroare · ✗[NULL=NULL adevărat] 8 rânduri · ✗[sintaxă] eroare.
  2. `NOT (bursa IS NULL)` ≡ ✓ `bursa IS NOT NULL` · ✗[`<> NULL`] `bursa <> NULL` · ✗[`'' ≠ NULL`] `bursa = ''` (în Oracle '' este NULL, deci tot 0 rânduri).
  3. `NOT (bursa > 300)` ✓ 1 rând · ✗[complement] 9 rânduri.
  4. ♻ L4: `an=1 OR bursa IS NULL AND an=3` ✓ 8 rânduri · ✗[stânga-dreapta] 4 rânduri.
- **Scrie singur:**
  - Ex 7: „Afișați studenții (toate informațiile pentru aceștia) care nu iau bursă.” → 8 rânduri.
  - Ex 9: „Afișați studenții care iau bursă, precum și valoarea bursei dacă aceasta ar fi mărită cu 15%.” → 5 rânduri; valorile majorate sunt 517,5 / 402,5 ×3 / 287,5. Ambiguitate: „iau bursă” = `IS NOT NULL` (de fixat în enunțul din aplicație).

### Lecția 6. LIKE
**Necesită:** L4.
- **Concepte:**
  - (a) `%` și `_`;
  - (b) LIKE este case-sensitive;
  - (c) `NOT LIKE` și combinații cu AND („exact o dată” = are, dar nu are de două ori);
  - (d) ESCAPE (nu există escape implicit).
- **Pretest:** „Cum găsești toate numele care se termină în «escu»?”
- **Hook:** `LIKE '%escu'` dă Popescu și Pintescu.
- **Mașina:** șablonul glisează peste literele valorii, `%` ca elastic, `_` ca o singură casetă. Verdict pe fiecare rând. Predicție: care rânduri se potrivesc cu `'_r%'`? Răspuns: Prelipcean, Arhire ×2, Archip.
- **Capcane:** `[case-sens]`, `[like-escape]`.
- **De ce?** „De ce `LIKE '%andr%'` nu găsește «Andrei»?” Răspuns: LIKE vede majuscule; în «Andrei» apare «And», nu «andr». Pe prenume dă doar Alexandru și Alexandra.
- **Quiz:**
  1. `prenume LIKE '%a%a%'` ✓ cel puțin două litere «a» mici · ✗[exact două] exact două · ✗[`%` = nimic] «aa» consecutiv.
  2. `nume LIKE 'p%'` ✓ 0 rânduri (P mare) · ✗[insensibil la majuscule] Popescu, Prelipcean etc.
  3. `_` ✓ exact un caracter · ✗[`_` = `%`] zero sau mai multe.
  4. ♻ L4: `nume LIKE 'P%' AND an = 1` ✓ Pintescu · ✗[OR în loc de AND] Popescu, Prelipcean, Pintescu.
- **Scrie singur** (fading: ex 10 → ex 13 → ex 14 → ex 11):
  - Ex 10: „Afișați studenții al căror nume începe cu litera P și sunt în anul 1 de studiu.” → Pintescu.
  - Ex 13: „Afișați studenții bursieri din semianul A.” → 3 rânduri (Antonie A2, Archip A1, Ciobotariu A1), prin `grupa LIKE 'A%' AND bursa IS NOT NULL`.
  - Ex 14: „Afișați toate informatiile despre studentii ale caror prenume contine EXACT o singura data litera 'a' (se ignora litera 'A' de la inceputul unor prenume).” → 5 rânduri (Bogdan, Radu, Alexandru, Ciprian, Andreea), prin `LIKE '%a%' AND NOT LIKE '%a%a%'`.
  - Ex 11: „Afișați toate informațiile despre studenții care au două apariții ale literei “a” în prenume.” → 6 rânduri (113, 114, 116, 117, 119, 121), cu `a` mic și exact două.
    - ADAPT: enunțul din aplicație spune explicit „litera a mică, exact de două ori”, fiindcă originalul e ambiguu (secțiunea 4).
    - Citirea case-insensitive dă altă mulțime (Ioana ×3, Raluca, Alexandru, Andreea).

### Lecția 7. IN, BETWEEN, ANY / ALL
**Necesită:** L5.
- **Concepte:**
  - (a) `IN (listă)` = sau-uri;
  - (b) `BETWEEN x AND y` include ambele capete;
  - (c) `NOT IN` și NULL în listă;
  - (d) `ANY/SOME/ALL`: `= ANY` ≡ `IN`, `<> ALL` ≡ `NOT IN`.
- **Pretest:** „Prenume în lista Alexandru, Ioana, Marius: scrie-o fără trei OR-uri.”
- **Hook:** lista de prenume din cerința secretarei.
- **Mașina:** rândul intră în sertarele listei. BETWEEN apare ca o riglă cu capete bifate. ANY/ALL: un tabel de comparații pe elementele listei, rezultat combinat cu sau, respectiv și, animat. Predicție: câte rânduri dă `an >= ALL (1, 2)`? Răspuns: 9 (anii 2 și 3).
- **Capcane:** `[not-in-null]`, `[between-incl]`, `[all-vs-some]`.
- **De ce?** „De ce `an NOT IN (1, NULL)` nu dă niciun rând?” Răspuns: `NOT IN` înseamnă `an<>1 AND an<>NULL`, iar a doua parte este UNKNOWN pentru orice rând.
- **Quiz:**
  1. `an BETWEEN 1 AND 3` ✓ include 1 și 3 (13 rânduri) · ✗[exclusiv] doar anul 2.
  2. `an NOT IN (1, NULL)` ✓ 0 rânduri · ✗[NULL ignorat] 9 rânduri.
  3. `an = SOME (2,3)` ≡ ✓ `an IN (2,3)` · ✗[ANY=AND] `an=2 AND an=3`.
  4. ♻ L5: `bursa IN (250, NULL)` ✓ doar rândul cu 250 · ✗[NULL=NULL] și cei 8 fără bursă.
- **Scrie singur:** Ex 12: „Afișați toate informațiile despre studenții al căror prenume este “Alexandru”, “Ioana” sau “Marius”.” → 4 rânduri (113, 115, 116, 119); Marius nu există. Ghilimelele curbe din enunț: `[curly-quotes]`.

### Lecția 8. ORDER BY
**Necesită:** L5.
- **Concepte:**
  - (a) ASC implicit / DESC;
  - (b) mai multe chei;
  - (c) NULL la sortare;
  - (d) ORDER BY pe poziție sau alias (rulează după SELECT).
- **Pretest:** „Studenții în ordinea anilor, iar în cadrul unui an alfabetic. Ce pui după ORDER BY?”
- **Hook:** lista de prezență pe ani și nume.
- **Mașina:** rândurile devin fișe care se rearanjează animat. Prima cheie formează grupuri colorate, a doua sortează în interiorul lor. Cei doi Bodnar Ioana (116 și 119) rămân în ordine arbitrară până adaugi `nr_matricol` ca ultimă cheie. Predicție: unde ajung studenții fără bursă la `ORDER BY bursa`?
- **Capcane:** `[ordering-nulls]`, `[order-pos-alias]`, `[quotes-alias]`.
- **De ce?** „De ce la `ORDER BY bursa DESC` apar primii cei fără bursă?” Răspuns: în Oracle, NULL se sortează ca cea mai mare valoare: ultimul la ASC, primul la DESC. Se schimbă cu `NULLS LAST` (nu e în pagina oficială).
- **Quiz:**
  1. `ORDER BY an, grupa DESC` ✓ DESC doar pe grupa · ✗[DESC se propagă] pe ambele.
  2. `ORDER BY bursa` ✓ NULL la sfârșit · ✗[NULL cel mai mic] NULL la început.
  3. `SELECT * FROM studenti ORDER BY 2` ✓ sortează după a doua coloană din listă (`nume`), fragil · ✗[rânduri, nu coloane] al doilea rând.
  4. ♻ L2: alias `"Student"` și `ORDER BY Student` ✓ ORA-00904, fiindcă fără ghilimele devine STUDENT · ✗[majuscule indiferente] merge.
- **Scrie singur:**
  - Ex 4: „Afișați numele concatenat cu prenumele urmat de virgulă și anul de studiu. Ordonați crescător după anul de studiu. Denumiți coloana “Studenți pe ani de studiu”.” → 13 rânduri. ADAPT: formatul exact nu e definit în original, deci aplicația arată un rând-model (`Popescu Bogdan, 3`).
  - Ex 8: „Afișați studenții (nume și prenume) care iau bursă și sunt în anii 2 și 3 de studiu. Ordonați alfabetic ascendent după nume și descendent după prenume.” → 3 rânduri (Antonie Ioana, Archip Andrada, Ciobotariu Ciprian). Cheia „prenume descrescător” nu poate fi verificată pe datele live, deci intervine a doua bază de date.

### Lecția 9. Operatori pe mulțimi: UNION, UNION ALL, INTERSECT, MINUS
**Necesită:** L8.
- **Concepte:**
  - (a) UNION (elimină duplicatele) vs UNION ALL;
  - (b) INTERSECT;
  - (c) MINUS (nu e comutativ);
  - (d) reguli: același număr și tip de coloane, se compară rândul întreg, ORDER BY doar la sfârșit.
- **Pretest:** „Lista studenților din anul 2 plus cea din anul 3: câte nume distincte?”
- **Hook:** două liste puse una peste alta.
- **Mașina:** două liste de bile. UNION topește bilele identice, UNION ALL le păstrează, INTERSECT păstrează perechile, MINUS taie din prima. Predicții:
  - UNION nume an 2 + an 3 → 8; UNION ALL → 9.
  - INTERSECT (an 2) cu (cu bursă) → Archip, Ciobotariu.
  - MINUS (an 3) minus (fără bursă) → Antonie, fiindcă Arhire e și în lista fără bursă.
- **Capcane:** `[setop-rules]`, `[minus-key]`.
- **De ce?** „Doi studenți diferiți, cu același nume, într-un UNION: ce se întâmplă cu ei?” Răspuns: se contopesc, fiindcă se compară rândul întreg; de aceea se include o cheie în SELECT.
- **Quiz:**
  1. UNION vs UNION ALL pe exemplul de mai sus ✓ 8 și 9 · ✗[UNION păstrează duplicatele] 9 și 9.
  2. `SELECT nume, prenume FROM studenti UNION SELECT nume FROM profesori` ✓ ORA-01789 · ✗[completează cu NULL] merge.
  3. `A MINUS B` vs `B MINUS A` ✓ diferite · ✗[ca UNION] la fel · ✗[diferență simetrică] ce nu e comun.
  4. ♻ L8: unde pui ORDER BY într-un UNION? ✓ la sfârșit, după ultimul SELECT · ✗[după fiecare SELECT] ORA-00933.
- **Scrie singur:** nu există exercițiu oficial; exemplele din textul lab 2 devin „prezice, apoi vezi”. Auxiliar: „numele din anul 1 care apar și la profesori”. În Oracle 11g, `EXCEPT` și `INTERSECT ALL` nu există (INFERRED din audit, secțiunea 6.A pct. 8).

### Modulul 3. Funcții pe linie

### Lecția 10. Funcții numerice, DUAL și regula NULL
**Necesită:** L3. **Prioritate:** mai puțin probabil la L1.
- **Concepte:**
  - (a) funcție pe linie = un rezultat pe rând;
  - (b) DUAL, tabelul cu un singur rând;
  - (c) CEIL / FLOOR / ROUND / TRUNC (cu al doilea argument negativ) / MOD;
  - (d) funcție cu argument NULL întoarce NULL.
- **Pretest:** „Cât face ROUND(21.665, -1)?”
- **Hook:** calculator de buzunar în SQL: `SELECT ... FROM DUAL`.
- **Mașina:** o axă a numerelor cu cursor. CEIL, FLOOR, ROUND și TRUNC pe 51,3 și pe −51,3.
- **Valori așteptate** (Oracle: de verificat): CEIL(51.3)=52, FLOOR(51.3)=51, ROUND(21.365,2)=21,37 (zecimal exact), TRUNC(21.365,2)=21,36, ROUND(21.665,-1)=20, FLOOR(−51.3)=−52, TRUNC(−51.3)=−51, MOD(26,11)=4.
- **Capcane:** `[round-neg-mod]`, `[dual]`, `[null-func]`.
- **De ce?** „De ce FLOOR(−51,3) și TRUNC(−51,3) diferă?” Răspuns: FLOOR merge spre −∞, TRUNC spre zero.
- **Quiz:**
  1. CEIL(51.3), FLOOR(51.3) ✓ 52, 51 · ✗[invers] 51, 52.
  2. ROUND(21.665,-1) ✓ 20 · ✗[ignoră semnul] 21,7 · ✗[mereu în sus] 30.
  3. FLOOR(−51.3) ✓ −52 · ✗[FLOOR=taie zecimalele] −51.
  4. ♻ L3: `ROUND(bursa/50)` pentru NULL ✓ NULL · ✗[NULL=0] 0.
- **Scrie singur:** nu există exercițiu oficial dedicat; auxiliar propriu, cu `SELECT ... FROM DUAL`.

### Lecția 11. Funcții text I: majuscule, lungime, subșiruri și capcana CHAR
**Necesită:** L10.
- **Concepte:**
  - (a) UPPER / LOWER / INITCAP și compararea insensibilă la majuscule;
  - (b) LENGTH / SUBSTR / INSTR, cu poziții de la 1;
  - (c) CHAR(n) se completează cu spații, VARCHAR2 nu;
  - (d) TRIM.
- **Pretest:** „`LENGTH(prenume)` pentru «Cosmin» din `profesori` e 6. Adevărat?” (Pagina oficială întreabă: «de ce 10?».)
- **Hook:** în `profesori`, `nume` și `prenume` sunt CHAR(10). «Cosmin» ocupă 10 casete, 4 sunt spații.
- **Mașina:** celula CHAR(10) ca 10 casete (litere + casete gri de spațiu). LENGTH numără casetele, TRIM le șterge animat, LIKE `'%n'` verifică ultima casetă (un spațiu → eșec). Comutator CHAR / VARCHAR2.
- **Capcane:** `[char-pad]`, `[char-cmp]`, `[substr-neg]`.
- **De ce?** „De ce `LIKE '%n'` nu găsește «Sabin» în `profesori.prenume`, dar găsește «Ciprian» în `studenti.prenume`?” Răspuns: prima coloană e CHAR(10) (completată cu spații), a doua VARCHAR2.
- **Quiz:**
  1. `LENGTH(prenume)` pentru «Cosmin» în `profesori` ✓ 10 · ✗[LENGTH = litere vizibile] 6.
  2. `SUBSTR('ABCDEFG',3,4)` ✓ `CDEF` · ✗[index de la 0] `BCDE` · ✗[n=poziție finală] `CDE`.
  3. `SUBSTR('ABCDEFG',-3,2)` ✓ `EF`, numărat de la sfârșit; pagina oficială greșește aici (secțiunea 4) · ✗[stânga-dreapta] `ABC`.
  4. ♻ L6: `profesori.prenume LIKE '%n'` fără TRIM ✓ 0 rânduri · ✗[CHAR fără umplutură] 6 rânduri.
  - Valoare de reținut pentru exemplu: `INSTR('CORPORATE FLOOR','OR',3,2)` = 14 (calculat manual, cu `OR` la pozițiile 2, 5 și 14).
- **Scrie singur** (fading: ex 6 → ex 15):
  - Lab 3 ex 6: „Pentru profesorii al căror nume începe cu B, afișați numele cu prima litera mică si restul mari, precum și lungimea (nr. de caractere a) numelui.” → Buraga → `bURAGA`, 6; Breaban → `bREABAN`, 7. Soluție: `LOWER(SUBSTR(TRIM(nume),1,1)) || UPPER(SUBSTR(TRIM(nume),2))` și `LENGTH(TRIM(nume))`.
  - Lab 2 ex 15: „Afişaţi numele şi prenumele profesorilor a căror prenume se termină cu litera "n" (întrebare capcană)..” → cu `TRIM(prenume) LIKE '%n'` dau 6 rânduri (Cristian ×2, Sabin, Florin, Cosmin, Stefan); cu `LOWER(TRIM(prenume)) LIKE '%n'` apare și LUCIAN (majuscule), deci 7. ADAPT: enunțul din aplicație specifică „mică sau mare”.

### Lecția 12. Funcții text II: CONCAT, LPAD / RPAD, REPLACE vs TRANSLATE
**Necesită:** L11.
- **Concepte:**
  - (a) CONCAT (doar 2 argumente, deci imbricat) ≡ `||`;
  - (b) LPAD / RPAD completează sau trunchiază;
  - (c) REPLACE (șir→șir) vs TRANSLATE (caracter→caracter);
  - (d) TRIM cu LEADING / TRAILING / BOTH.
- **Pretest:** „Cum schimbi în numele «Ciobotariu» toate «i» cu «a» și toate «a» cu «i», simultan?”
- **Hook:** etichetă cu text lipit și bară de steluțe pentru burse.
- **Mașina:** bandă de caractere; LPAD umple la stânga cu modelul repetat. Apoi `LPAD('Pagina',3)` taie la «Pag». Pentru swap, două benzi paralele: REPLACE în lanț strică rezultatul, TRANSLATE face schimbarea într-un pas.
- **Capcane:** `[pad-truncate]`, `[replace-translate]` (inclusiv: TRANSLATE cu al treilea argument gol dă NULL).
- **De ce?** „De ce două REPLACE una după alta nu schimbă i↔a, dar TRANSLATE da?” Răspuns: al doilea REPLACE vede și literele create de primul.
- **Quiz:**
  1. `LPAD('Pagina',15,'*.')` ✓ `*.*.*.*.*Pagina` · ✗[direcție greșită] `Pagina*.*.*.*.*` · ✗[model folosit o dată] `*.Pagina`.
  2. `LPAD('Pagina',3,'*')` ✓ `Pag` · ✗[nu taie niciodată] `Pagina`.
  3. swap i↔a ✓ `TRANSLATE(nume,'ia','ai')` · ✗[REPLACE de două ori] `REPLACE(REPLACE(nume,'i','a'),'a','i')` · ✗[REPLACE pe pereche] `REPLACE(nume,'ia','ai')`.
  4. ♻ L11: `LPAD(nume,12,'*')` pentru «Buraga» din `profesori` ✓ `**Buraga    ` (CHAR) · ✗[umplutura invizibilă ignorată] `******Buraga`.
- **Scrie singur** (fading: ex 4 → ex 5 → ex 10 → ex 13):
  - Lab 3 ex 4: „Utilizând functia de concatenare, obțineți pentru fiecare student textul 'Elevul <prenume> este in grupa <grupa>'.” → 13 rânduri, prin `CONCAT` imbricat.
  - Lab 3 ex 5: „Afisati valoarea bursei pe 10 caractere, completand valoarea numerica cu caracterul $.” → `LPAD(bursa,10,'$')`; 5 rânduri de forma `$$$$$$$450`, 8 NULL.
  - Lab 3 ex 10: „Afişaţi numele tuturor studenților înlocuind apariţia literei i cu a şi apariţia literei a cu i.” → `TRANSLATE`, 13 rânduri.
  - Lab 3 ex 13: „Pentru studentii bursieri (doar pentru ei) afisati numele studentului si bursa in stelute: fiecare steluta valoreaza 50 RON. In tabel, alineati stelutele la dreapta.” → 5 rânduri; `LPAD(RPAD('*', bursa/50, '*'), 9)`. ADAPT: lățimea aleasă este 9 (maximul 450/50), iar verificatorul cere șiruri de aceeași lungime, cu steluțele aliniate la dreapta.

### Modulul 4. Date

### Lecția 13. Date I: SYSDATE, aritmetica datelor, funcții de calendar
**Necesită:** L10.
- **Concepte:**
  - (a) DATE conține și ora; SYSDATE; TRUNC pentru a tăia ora;
  - (b) data ± număr = zile; data − data = zile (cu fracție);
  - (c) MONTHS_BETWEEN / ADD_MONTHS;
  - (d) NEXT_DAY / LAST_DAY / TRUNC(d,'MM'|'YYYY').
- **Pretest:** „Cât e ziua de azi peste 10 zile? Dar peste 3 ore?”
- **Hook:** azi e 26.10.2026; câte luni au trecut de la nașterea lui Popescu (născut 17.02.1995)?
- **Mașina:** calendar cu săgeți (+10 zile sare pe grilă; ADD_MONTHS(31 ian, 1) aterizează pe 28 feb). Ceas: SYSDATE are 14:30, TRUNC îl aduce la 00:00 și fracția de zi dispare.
- **Capcane:** `[date-time-part]`, `[add-months-eom]`, `[next-day]`.
- **De ce?** „De ce `SYSDATE - TRUNC(SYSDATE)` nu este 0?” Răspuns: DATE păstrează ora; rezultatul e fracția de zi (aici 14:30 ≈ 0,604).
- **Quiz:**
  1. `SYSDATE + 10` ✓ 10 zile · ✗[ore] 10 ore · ✗[luni] 10 luni.
  2. Cum adaugi 3 ore? ✓ `SYSDATE + 3/24` · ✗[zile] `SYSDATE + 3`.
  3. `ADD_MONTHS(TO_DATE('31-01-2015','DD-MM-YYYY'),1)` ✓ 28.02.2015 · ✗[+30 zile] 03.03.2015 · ✗[eroare] eroare.
  4. `MONTHS_BETWEEN(d1,d2)` cu d1 înainte de d2 ✓ valoare negativă · ✗[mereu pozitiv] pozitivă.
- **Scrie singur:**
  - Lab 3 ex 1: „Scrieți o interogare pentru a afișa data de azi. Etichetați coloana "Astazi".” → `SELECT SYSDATE AS "Astazi" FROM DUAL`; 1 rând, valoarea fixată.
  - Lab 3 ex 2: „Pentru fiecare student afișați numele, data de nastere si numărul de luni între data curentă și data nașterii.” → `MONTHS_BETWEEN(SYSDATE, data_nastere)`; Popescu ≈ 380,31 (31 ani și 8 luni + 9 zile/31 + ora). Toleranță numerică; accept și valoarea trunchiată sau rotunjită, ca să nu penalizăm o lectură legitimă a enunțului.

### Lecția 14. Date II: TO_CHAR, TO_DATE, limbă și măști
**Necesită:** L13.
- **Concepte:**
  - (a) TO_DATE(șir, mască) pentru constante (nu te baza pe formatul implicit);
  - (b) TO_CHAR(dată, mască): YYYY, MM, DD, MON, MONTH, DAY, HH24, MI;
  - (c) MONTH/DAY sunt completate cu spații la 9 caractere (prefixul `fm` le scoate); limba se alege cu al treilea argument;
  - (d) sortarea după număr de lună, nu după nume.
- **Pretest:** „Ce zi din săptămână a fost 17.02.1995?”
- **Hook:** `TO_CHAR(data_nastere,'Day')` întoarce `Friday   ` (cu spații).
- **Mașina:** o mască (`DD-MM-YYYY`) peste data 17/02/1995; fiecare element al măștii se aprinde și își arată fragmentul. Comparație `Day` / `DAY` / `fmDay`.
- **Capcane:** `[date-format-yy]`, `[to-char-pad-lang]`, `[mm-mi]`, `[month-sort]`, `[implicit-conv]`.
- **De ce?** „De ce `ORDER BY TO_CHAR(data_nastere,'MONTH')` pune AUGUST înainte de JANUARY?” Răspuns: sortează text, alfabetic.
- **Quiz:**
  1. `TO_CHAR(data,'Day')` ✓ `Friday   ` (9 caractere) · ✗[fără umplutură] `Friday` · ✗[majuscule] `FRIDAY`.
  2. Cum filtrezi anul 1995? ✓ `TO_CHAR(data_nastere,'YYYY') = '1995'` · ✗[dată = număr] `data_nastere = 1995` · ✗[dată = șir implicit] `data_nastere LIKE '1995%'`.
  3. `TO_CHAR(SYSDATE,'HH:MM')` ✓ afișează luna, nu minutele (MM = lună, MI = minute) · ✗[MM=minute] minutele.
  4. ♻ L13: `TO_DATE('17-02-95','DD-MM-YY')` ✓ 2095 (YY ia secolul curent; RR dă 1995) · ✗[YY inteligent] 1995. Relevant pentru datele 1995-1997 din schemă.
- **Scrie singur** (fading: lab 3 ex 3 → lab 2 ex 6 → lab 2 ex 5 → lab 3 ex 8):
  - Lab 3 ex 3: „Afișați ziua din săptămână în care s-a născut fiecare student.” → 13 rânduri; zile în engleză, cosmetic tolerate.
  - Lab 2 ex 6: „Afişaţi numele şi prenumele precum şi anii de studiu pentru toţi studenţii născuţi în 1995.” → 5 rânduri; `= '1995'` și `= 1995` merg ambele (audit pct. 10).
  - Lab 2 ex 5: „Afișați numele, prenumele și data de naștere a studenților născuți între 1 ianuarie 1995 si 10 iunie 1997. Ordonați descendent după anul de studiu.” → 11 rânduri; constantele cu `TO_DATE('01-01-1995','DD-MM-YYYY')`.
  - Lab 3 ex 8: „Ordonați studenții care nu iau bursă în funcție de luna cand au fost născuți; se va afișa doar numele, prenumele și luna corespunzătoare datei de naștere.” → 8 rânduri; ordine: Popescu (02), Panaite (04), Prelipcean și Bucur (05), Bodnar 119 (06), Arhire Alexandra (07), Bodnar 116 (08), Arhire Raluca (12). Se afișează numele lunii, se sortează după `'MM'`.

### Lecția 15. Date III: ziua de naștere, vârsta, prima zi a lunii
**Necesită:** L14.
- **Concepte:**
  - (a) următoarea aniversare (ADD_MONTHS cu număr de ani);
  - (b) vârsta ca ani / luni / zile (TRUNC(MONTHS_BETWEEN) + ADD_MONTHS);
  - (c) zile până la o dată (scazi `TRUNC(SYSDATE)`);
  - (d) prima zi din luna următoare: `TRUNC(ADD_MONTHS(SYSDATE,1),'MM')`.
- **Pretest:** „Câte zile mai are Popescu până la ziua lui?”
- **Hook:** Popescu: 31 ani, 8 luni, 9 zile la 26.10.2026; ziua lui e peste 114 zile, miercuri 17.02.2027.
- **Mașina:** linie a timpului: vârsta ca trei arce consecutive (ani, luni, zile) pe aceeași bară, cu predicție pe fiecare arc.
- **Capcane:** `[date-time-part]`, `[add-months-eom]`, `[next-day]`.
- **De ce?** „De ce nu calculăm vârsta ca (SYSDATE − data_nastere)/365?” Răspuns: anii bisecți și lunile inegale; folosește MONTHS_BETWEEN și ADD_MONTHS.
- **Quiz:**
  1. Vârsta în ani întregi ✓ `TRUNC(MONTHS_BETWEEN(SYSDATE,data_nastere)/12)` · ✗[ROUND] `ROUND(...)` (ar da 32 pentru Popescu) · ✗[/365] `(SYSDATE-data_nastere)/365`.
  2. `NEXT_DAY(d,'SUNDAY')` când `d` e chiar duminică ✓ duminica următoare (+7) · ✗[aceeași zi] aceeași dată.
  3. Azi 26.10 la 14:30, ziua e mâine 27.10: `zi - SYSDATE` = 0,396. Câte zile rămân? ✓ 1, cu `zi - TRUNC(SYSDATE)` · ✗[ROUND] 0 · ✗[TRUNC pe diferență] 0.
  4. ♻ L13: `ADD_MONTHS(29-FEB-1996, 12)` ✓ 28.02.1997 · ✗[1 martie] 01.03.1997.
- **Scrie singur:**
  - Lab 3 ex 7: „Pentru fiecare student afișați numele, data de nastere, data la care studentul urmeaza sa isi sarbatoreasca ziua de nastere si prima zi de duminică de după.” → 13 rânduri; Popescu: 17.02.2027 și 21.02.2027. Cazul „ziua de naștere = azi” e nespecificat (secțiunea 4).
  - Lab 3 ex 11: „Afișați pentru fiecare student numele, vârsta acestuia la data curentă sub forma '<x> ani <y> luni și <z> zile' (de ex '19 ani 3 luni și 2 zile') și numărul de zile până își va sărbători (din nou) ziua de naștere.” → Popescu: `31 ani 8 luni și 9 zile`, 114.

### Lecția 16. NVL, DECODE, CASE
**Necesită:** L5, L11, L15.
- **Concepte:**
  - (a) NVL(expr, înlocuitor) și compatibilitatea de tip;
  - (b) DECODE, care testează egalitate, cu valoare implicită;
  - (c) CASE, cu condiții și intervale;
  - (d) DECODE potrivește NULL cu NULL, `=` nu.
- **Pretest:** „Cum afișezi «mențiune» pentru studenții fără bursă și «premiul 1» pentru 450?”
- **Hook:** tabelul de premii: 450 → 1, 350 → 2, 250 → 3, fără bursă → mențiune.
- **Mașina:** o sită cu sertare: valoarea cade pe rând prin `search1`, `search2`..., iar sertarul implicit prinde restul. Predicție pentru fiecare rând: unde ajunge, inclusiv rândul cu NULL.
- **Capcane:** `[decode-null]`, `[case-no-else]`, `[implicit-conv]` (NVL cu tipuri diferite), `[null-func]`.
- **De ce?** „De ce `DECODE(bursa, NULL, 'fără')` merge, dar `bursa = NULL` nu?” Răspuns: DECODE e singura construcție care tratează NULL = NULL ca potrivire.
- **Quiz:**
  1. `NVL(bursa,'Nu are bursa')` ✓ ORA-01722 (NVL convertește al doilea argument spre tipul primului) · ✗[tipuri libere] `Nu are bursa` · ✗[NVL ignoră] 0.
  2. DECODE fără valoare implicită pentru NULL ✓ NULL · ✗[implicit 0] 0.
  3. Cum testezi `bursa > 300`? ✓ CASE (DECODE nu face intervale) · ✗[DECODE booleene] `DECODE(bursa>300,...)`.
  4. ♻ L5: `CASE WHEN bursa = NULL THEN 'fără' ELSE 'are' END` ✓ mereu «are» · ✗[NULL prins] «fără» pentru NULL.
  - Notă: CASE nu apare în pagina lab 3. Se predă ca alternativă la DECODE (INFERRED, util la test).
- **Scrie singur:**
  - Lab 3 ex 9: „Pentru fiecare student afișați numele, valoarea bursei si textul: 'premiul 1' pentru valoarea 450, 'premiul 2' pentru valoarea 350, 'premiul 3' pentru valoarea 250 și 'mentiune' pentru cei care nu iau bursa. Pentru cea de a treia coloana dati aliasul "Premiu".” → 13 rânduri.
  - Lab 3 ex 12: „Presupunând că în următoarea lună bursa de 450 RON se mărește cu 10%, cea de 350 RON cu 15% și cea de 250 RON cu 20%, afișați pentru fiecare student numele acestuia, data corespunzătoare primei zile din luna urmatoare și valoarea bursei pe care o va încasa luna următoare. Pentru cei care nu iau bursa, se va afisa valoarea 0.” → valori 495 / 402,5 / 300 / 0; prima zi a lunii următoare, cu data fixată: 01.11.2026.

### Lecția 17. Fișă: conversii și funcții rare (citit și recunoscut)
**Necesită:** L16. **Prioritate:** mai puțin probabil.
- **Concepte:**
  - (a) conversii implicite;
  - (b) TO_NUMBER / CAST;
  - (c) LEAST / GREATEST;
  - (d) NULLIF, USER, CONVERT.
- **Pretest:** „Ce dă `'01110' + 1`?”
- **Hook:** `'01110' + 1` → 1111 (nu `011101`).
- **Mașina:** conducte cu etichete de tip (VARCHAR2 → NUMBER), mic.
- **De ce?** „De ce `'10' < '9'` e adevărat pentru șiruri, dar `10 < 9` fals?” Răspuns: textul se compară caracter cu caracter.
- **Quiz:**
  1. `'01110' + 1` ✓ 1111 · ✗[+ = concatenare] `011101` · ✗[eroare] eroare.
  2. `LEAST('Mihai','Andrei','Anca')` ✓ `Anca` · ✗[după lungime] `Mihai`.
  3. `NULLIF(5,5)` ✓ NULL · ✗[identitate] 5.
  4. ♻ L16: `GREATEST(1,NULL,3)` ✓ NULL (Oracle: de verificat) · ✗[ignoră NULL] 3.
- **Scrie singur:** nu există exercițiu oficial. Doar recunoaștere.

### Modulul 5. JOIN

### Lecția 18. Mai multe tabele: produs cartezian și JOIN … ON
**Necesită:** L4, L5, L8, L9.
- **Concepte:**
  - (a) `FROM A, B` = produs cartezian (numărul de rânduri se înmulțește);
  - (b) join = cartezian + filtru de cheie;
  - (c) `JOIN … ON` (standard) vs virgulă + WHERE (Oracle vechi);
  - (d) alias de tabel și prefix pentru coloane ambigue.
- **Pretest:** „`SELECT * FROM studenti, note`: câte rânduri?”
- **Hook:** 13 × 42 = 546 rânduri. Cei 546 combină fiecare student cu fiecare notă, inclusiv ale altora.
- **Mașina:** grilă 13 × 42 în miniatură; produsul cartezian aprinde toate celulele, condiția `ON` stinge perechile nepotrivite, rămân 42. Predicții (din textul lab 4):
  - `WHERE prenume='Andrei'` fără join → 42 rânduri;
  - cu join → 0 (Andrei nu are note);
  - `prenume='Ioana'` cu join → 12 (113: 6, 116: 3, 119: 3).
- **Capcane:** `[cartesian]`, `[ambiguous-col]`, `[alias-as]`, `[join-no-on]`.
- **De ce?** „De ce `JOIN … WHERE prenume='Andrei'` dă 0 rânduri, iar `studenti, note WHERE prenume='Andrei'` dă 42? Care e corect?” Răspuns: 0, fiindcă Andrei nu are note; cele 42 sunt rezultat eronat, dar plauzibil.
- **Quiz:**
  1. `FROM studenti, note, cursuri` ✓ 13×42×9 = 4914 · ✗[sumă] 64 · ✗[doar două tabele] 546.
  2. fără `ON` ✓ produs cartezian · ✗[eroare] eroare · ✗[primul rând] un singur rând.
  3. `SELECT nr_matricol FROM studenti s JOIN note n ON s.nr_matricol=n.nr_matricol` ✓ ORA-00918 · ✗[alege prima tabelă] merge.
  4. `FROM studenti AS s` ✓ eroare în Oracle (AS e permis pe coloane, nu pe tabele) · ✗[AS peste tot] valid. (Oracle: de verificat.)
- **Scrie singur:** nu există exercițiu oficial; auxiliar: „numele studentului și valoarea notei pentru fiecare notă” (42 rânduri). Din textul lab 4: după alias, `studenti.nr_matricol` dă ORA-00904.

### Lecția 19. Lanț de JOIN-uri, NATURAL JOIN și capcana «an»
**Necesită:** L18.
- **Concepte:**
  - (a) JOIN în lanț (3-5 tabele);
  - (b) tabela de legătură `didactic` (profesori ↔ cursuri);
  - (c) rânduri multiplicate (un curs cu 2 profesori);
  - (d) NATURAL JOIN = pe toate coloanele cu același nume.
- **Pretest:** „Cine a pus nota 10 la BD?”
- **Hook:** cursurile 21 (Logica: Masalagiu și Ciobaca) și 24 (BD: Breaban și Varlan) au doi profesori. Fiecare notă apare de două ori.
- **Mașina:** un fir roșu `note → cursuri → didactic → profesori`; un rând se desparte în două când are două potriviri. Predicție: câte rânduri dă lanțul de 5 tabele? Răspuns: 56 = 42 note + 14 duplicări (9 note la cursul 21, 5 la cursul 24).
- **Capcane:** `[natural-join-all]`, `[row-multiply]`, `[ambiguous-col]`.
- **De ce?** „De ce `studenti NATURAL JOIN note NATURAL JOIN cursuri` dă 0 rânduri, deși `ON` corect dă 42?” Răspuns: a doua legătură folosește și coloana `an`, comună lui `studenti` și `cursuri`. Zero rânduri este specific datelor (INFERRED).
- **Quiz:**
  1. Lanț de 5 tabele pentru toate notele ✓ 56 · ✗[un profesor pe curs] 42 · ✗[numărul de profesori] 10.
  2. `studenti NATURAL JOIN note` leagă pe ✓ `nr_matricol` (singura coloană comună) · ✗[toate coloanele] toate.
  3. `SELECT s.nr_matricol … FROM studenti s NATURAL JOIN note n` ✓ ORA-25155 (coloana din NATURAL JOIN nu primește calificator) · ✗[merge] merge. (Oracle: de verificat.)
  4. ♻ L18: `FROM studenti s JOIN note n … WHERE studenti.nume=…` ✓ ORA-00904 · ✗[merge] merge.
- **Scrie singur** (fading: ex 3 → ex 2 → ex 1):
  - Lab 4 ex 3: „Afisaţi profesorii (numele şi prenumele) impreuna cu cursurile pe care fiecare le ţine.” → 10 rânduri (`profesori`–`didactic`–`cursuri`).
  - Lab 4 ex 2: „Afişaţi studenţii care au luat nota 10 la materia 'BD'. Singurele valori pe care aveţi voie să le hardcodaţi în interogare sunt valoarea notei (10) şi numele cursului ('BD').” → 2 rânduri (Antonie Ioana, Panaite Alexandru).
  - Lab 4 ex 1: „Afişaţi studenţii şi notele pe care le-au luat si profesorii care le-au pus acele note.” → 56 rânduri. Schema nu leagă nota de un profesor; singura legătură e „profesorii cursului” (INFERRED; secțiunea 4). Soluție de referință: lanț de 5 tabele, cu explicația duplicării.

### Lecția 20. Join extern: LEFT, RIGHT, FULL și `(+)`
**Necesită:** L19.
- **Concepte:**
  - (a) LEFT / RIGHT / FULL OUTER JOIN;
  - (b) rândurile fără pereche primesc NULL;
  - (c) „cine nu are” = LEFT JOIN + `WHERE cheia_din_dreapta IS NULL`;
  - (d) sintaxa Oracle `(+)` și filtrele în ON vs WHERE.
- **Pretest:** „Studenții 120-123 au 0 note. Apar într-un join cu `note`?”
- **Hook:** `SELECT DISTINCT nume` dă 8 în join și 11 în `studenti`. Diferența sunt cei fără note.
- **Mașina:** două coloane de rânduri legate cu fire. INNER: rândurile fără fir cad. LEFT: rămân cu NULL în dreapta. FULL: ambele părți. Comutator: filtrul în ON vs în WHERE (WHERE transformă outer în inner).
- **Capcane:** `[outer-where]`, `[plus-side]`, `[eq-null]`.
- **De ce?** „De ce pentru «fără note» testăm `n.nr_matricol IS NULL`, nu `n.valoare IS NULL`?” Răspuns: `valoare` poate fi NULL și pe rânduri care există; cheia din dreapta e NULL doar când rândul lipsește.
- **Quiz:**
  1. `studenti LEFT JOIN note` ✓ 46 rânduri (42 + 4) · ✗[cât inner] 42 · ✗[cât studenti] 13.
  2. `WHERE s.nr_matricol = n.nr_matricol(+)` ≡ ✓ LEFT JOIN · ✗[partea greșită] RIGHT JOIN.
  3. `LEFT JOIN … WHERE n.valoare = 10` ✓ efectiv INNER, fiindcă rândurile NULL sunt filtrate · ✗[păstrează toți studenții] păstrează toți.
  4. ♻ L16: `NVL(n.valoare,0)` după LEFT JOIN ✓ afișează 0 în loc de NULL · ✗[ștergere] elimină rândul.
- **Scrie singur** (ex 3 din L19 este baza):
  - Lab 4 ex 4: „Modificaţi interogarea de la punctul 3 pentru a fi afişaţi şi acei profesori care nu au încă alocat un curs.” → 17 rânduri (10 + 7 profesori fără curs: Captarencu, Moruz, Pascariu, Lazar, Kristo, Nastasa, Pasat).
  - Lab 4 ex 5: „Modificaţi interogarea de la punctul 3 pentru a fi afişate acele cursuri ce nu au alocate încă un profesor.” → 11 rânduri (10 + Limbaje formale).
  - Lab 4 ex 6: „Modificaţi interogarea de la punctul 3 astfel încât să fie afişaţi atat profesorii care nu au nici un curs alocat cât şi cursurile care nu sunt încă predate de nici un profesor.” → 18 rânduri (10 + 7 + 1).
  - ADAPT: „interogarea de la punctul 3” se afișează în enunț.

### Lecția 21. Self-join: perechi
**Necesită:** L19.
- **Concepte:**
  - (a) aceeași tabelă de două ori, cu alias-uri diferite;
  - (b) condiția de potrivire;
  - (c) eliminarea perechii cu sine;
  - (d) perechi ordonate vs neordonate: `<` pe cheia unică, nu pe nume.
- **Pretest:** „Cum găsești colegii de grupă ai lui Pintescu?” (Din textul lab 4: «Cum eliminăm înregistrarea în care studentul apare coleg cu el însuși?»)
- **Hook:** doi studenți născuți în aceeași zi a săptămânii.
- **Mașina:** două copii ale tabelei, `s1` și `s2`, cu fire între rânduri. Diagonala (rândul cu el însuși) se evidențiază și se taie. `<>` desenează fiecare pereche în ambele sensuri, `<` doar jumătate. Predicție: câte perechi cu aceeași zi de naștere? Răspuns: 11 neordonate (22 ordonate).
- **Capcane:** `[self-pair]`, `[char-cmp]`, `[join-no-on]`.
- **De ce?** „De ce `s1.nume < s2.nume` pierde perechea Bodnar–Bodnar și ce folosim în loc?” Răspuns: cei doi Bodnar au același nume, deci `<` pe nume e fals. Se folosește `s1.nr_matricol < s2.nr_matricol`.
- **Quiz:**
  1. `<>` vs `<` pe `nr_matricol` ✓ `<>` dă fiecare pereche de două ori · ✗[la fel] același număr.
  2. `FROM studenti s JOIN studenti c` fără `ON` ✓ eroare de sintaxă (INFERRED: ORA-00905) · ✗[produs cartezian] merge.
  3. `s1.nume < s2.nume` ✓ pierde perechile cu același nume · ✗[sortează perechile fără pierderi] doar ordonează.
  4. ♻ L14: comparația zilelor prin `TO_CHAR(data,'D')` ✓ merge indiferent de teritoriu, fiindcă ambele părți sunt calculate la fel · ✗[depinde de limbă] nu merge.
- **Scrie singur** (fading: ex 9 → ex 10 → ex 7):
  - Lab 4 ex 9: „Afișați studenții doi câte doi împreună cu diferența de vârstă dintre ei. Sortați în ordine crescătoare în funcție de aceste diferențe. Aveți grijă să nu comparați un student cu el însuși.” → 78 de perechi neordonate (156 ordonate). ADAPT: enunțul aplicației precizează «perechi neordonate» și «diferența în zile».
  - Lab 4 ex 10: „Afișați posibilele prietenii dintre studenți și profesori. Un profesor și un student se pot împrieteni dacă numele lor de familie are același număr de litere.” → 44 de rânduri cu `LENGTH(TRIM(p.nume))`; fără TRIM doar 32 (doar cei cu 10 litere, Prelipcean și Ciobotariu, fiindcă `LENGTH` a unui CHAR(10) e mereu 10).
  - Lab 4 ex 7: „În tabela studenți există studenți care s-au născut în aceeași zi a săptămânii. De exemplu, Cobzaru George și Pintescu Andrei s-au născut amândoi într-o zi de marți. Construiți o listă cu studenții care s-au născut în aceeași zi, grupându-i doi câte doi în ordine alfabetică a numelor (de exemplu, în rezultat va apărea combinația Cobzaru-Pintescu, dar nu va apărea și Pintescu-Cobzaru). Lista va trebui să conțină doar numele de familie a celor doi, împreună cu ziua în care cei doi s-au născut. Evident, dacă există și alți studenți care s-au născut marți, vor apărea și ei în combinație cu cei doi amintiți mai sus. Lista va fi ordonată în funcție de ziua săptămânii în care s-au născut și, în cazul în care sunt mai mult de trei studenți născuți în aceeași zi, rezultatele vor fi ordonate și după numele primei persoane din listă.” → 11 perechi. Cu `s1.nume < s2.nume` ies doar 10 (se pierde Bodnar–Bodnar, lunea). ADAPT: ordinea «după ziua săptămânii» nu e definită (calendaristică sau alfabetică); aplicația fixează lunea → duminica.

### Lecția 22. Self-join cu note: «cine a luat mai mult»
**Necesită:** L21.
- **Concepte:**
  - (a) join cu inegalitate (`n2.valoare > n1.valoare`);
  - (b) legarea pe același curs;
  - (c) 4 instanțe în FROM (`studenti s1`, `note n1`, `note n2`, `studenti s2`);
  - (d) propoziții cu `||`.
- **Pretest:** „Câți colegi au luat notă mai mare decât Popescu, într-un curs oarecare?” (Răspuns: 8 rânduri, calculat.)
- **Hook:** «cine te-a bătut la un curs».
- **Mașina:** două coloane de note pentru același curs; săgeată de la nota mai mică spre cea mai mare. Total pe toate cursurile: 118. Predicție: câte rânduri dă Popescu ca `s1`?
- **Capcane:** `[self-pair]`, `[row-multiply]`.
- **De ce?** „De ce aici nu ne trebuie `s1 <> s2`?” Răspuns: `>` strict exclude automat perechea cu sine și pe cele cu note egale.
- **Quiz:**
  1. `>=` în loc de `>` ✓ apar și egalitățile, deci și perechea cu sine · ✗[la fel] nu se schimbă nimic.
  2. fără egalitatea pe `id_curs` ✓ compară note de la cursuri diferite · ✗[la fel] același rezultat.
  3. Cine are nota maximă la un curs, ca `s1`, câte rânduri produce pentru acel curs? ✓ 0 · ✗[cu sine] 1.
  4. ♻ L11: în propoziție, `p.nume` din `profesori` (CHAR) ✓ aduce spații în plus · ✗[nimic] nimic.
- **Scrie singur:** Lab 4 ex 8: „Să se afișeze, pentru fiecare student, numele colegilor care au luat notă mai mare ca ei la fiecare dintre cursuri. Formulați rezultatele ca propoziții (de forma "Popescu Gigel a luat notă mai mare ca Vasilescu Ionel la materia BD."). Dați un nume corespunzător coloanei [pont: interogarea trebuie să returneze 118 rânduri].” → 118 rânduri, verificat pe scriptul live. «La fiecare dintre cursuri» înseamnă «pe curs», nu «la toate cursurile»; indiciul de 118 rânduri decide.

### Lecția 23. «Cel puțin unul» vs «toate»: DISTINCT și MINUS
**Necesită:** L9, L20.
- **Concepte:**
  - (a) existențial = join + DISTINCT;
  - (b) universal = «au ceva» MINUS «au un contraexemplu»;
  - (c) MINUS pe chei, nu pe nume;
  - (d) studenții fără note (adevăr vacuu).
- **Pretest:** „Care studenți nu au luat niciodată sub 7?”
- **Hook:** «a luat vreodată sub 7» vs «n-a luat niciodată sub 7».
- **Mașina:** pentru fiecare student se deschide sertarul de note. Existențial: prima notă care satisface condiția aprinde studentul. Universal: orice notă rea îl elimină. Apoi MINUS: lista din stânga («au note») minus lista «au o notă < 7», cu comutator «doar nume, prenume» în care cei doi Bodnar se contopesc vizual. Predicție: 5 studenți (111, 115, 116, 118, 119).
- **Capcane:** `[all-vs-some]`, `[minus-key]`, `[setop-rules]`.
- **De ce?** „De ce `WHERE valoare >= 7` nu înseamnă «toate notele ≥ 7»?” Răspuns: păstrează rândurile cu o notă ≥ 7, adică «cel puțin una».
- **Quiz:**
  1. `WHERE valoare >= 7` pentru «toate notele ≥ 7» ✓ greșit, e «cel puțin una» · ✗[corect] corect.
  2. MINUS pe `(nume, prenume)` ✓ 4 rânduri în loc de 5 (Bodnar ×2 se contopesc) · ✗[5 rânduri] 5.
  3. Student fără nicio notă în `(au note) MINUS (au notă < 7)` ✓ nu apare · ✗[adevăr vacuu] apare.
  4. ♻ L9: `A MINUS B` când `B` e gol ✓ `A` fără duplicate · ✗[gol] rezultat gol.
- **Scrie singur:**
  - Lab 4 ex 11: „Afișați denumirile cursurilor la care s-au pus note cel mult egale cu 8 (<=8).” → 6 cursuri (Logica, Matematica, OOP, BD, Java, Tehnologii Web).
  - Lab 4 ex 12: „Afișați numele studenților care au toate notele mai mari ca 7 sau egale cu 7.” → 5 studenți (111, 115, 116, 118, 119). Soluția include `nr_matricol` în ambele SELECT-uri. ADAPT: aplicația cere explicit coloanele `nr_matricol, nume, prenume`; fără cheie ies 4 rânduri.

### Lecția 24. Interogări compuse: JOIN + filtre pe date și text
**Necesită:** L14, L21, L23.
- **Concepte:**
  - (a) JOIN + WHERE cu paranteze pe OR/AND;
  - (b) TO_CHAR cu limbă fixată (`'NLS_DATE_LANGUAGE=ENGLISH'`);
  - (c) text de sesiune: `fmMONTH, YYYY`;
  - (d) coloană condițională cu LAST_DAY și DECODE/CASE.
- **Pretest:** «Cum scrii o interogare lungă fără să te pierzi?» (Strategia pe subobiective: tabele și legături → filtrare → coloane calculate → ordonare.)
- **Hook:** tot ce știi, într-o singură frază SELECT.
- **Mașina:** banda completă FROM → JOIN → WHERE → SELECT → ORDER BY, avans manual, cu predicție de numărătoare după fiecare etapă.
- **Capcane:** `[and-or]`, `[to-char-pad-lang]`, `[mm-mi]`.
- **De ce?** „De ce `valoare=7 OR valoare=10 AND zi='TUESDAY'` e greșit pentru «7 sau 10 într-o zi de marți»?” Răspuns: AND se evaluează primul; se scriu paranteze în jurul lui OR.
- **Quiz:**
  1. «7 sau 10, marți» ✓ `valoare IN (7,10) AND …` sau paranteze · ✗[stânga-dreapta] fără paranteze.
  2. `TO_CHAR(data_notare,'DAY') = 'TUESDAY'` ✓ nu merge (`TUESDAY  ` are spații); se folosește `fmDAY` sau TRIM · ✗[merge] merge.
  3. `TO_CHAR(d,'fmMONTH, YYYY')` ✓ `JUNE, 2015` · ✗[cu umplutură] `JUNE     , 2015` · ✗[literă mică] `June, 2015`.
  4. ♻ L13: lună cu mai puțin de 30 de zile ✓ `LAST_DAY(d) - TRUNC(d,'MM') + 1 < 30` · ✗[LAST_DAY ca număr] `LAST_DAY(d) < 30`.
- **Scrie singur:**
  - Lab 4 ex 13: „Să se afișeze studenții care au luat nota 7 sau nota 10 la OOP într-o zi de marți.” → 4 rânduri (Popescu 10, Antonie 7, Arhire 10, Panaite 10), toate din 24.06.2014; Prelipcean (5) nu intră.
  - Lab 4 ex 14: „O sesiune este identificată prin luna și anul în care a fost ținută. Scrieți numele și prenumele studenților ce au promovat o anumită materie, cu notele luate de aceștia și sesiunea în care a fost promovată materia. Formatul ce identifică sesiunea este "LUNA, AN", fără alte spații suplimentare (De ex. "JUNE, 2015" sau "FEBRUARY, 2014"). În cazul în care luna în care s-a ținut sesiunea a avut mai puțin de 30 de zile, afișați simbolul "+" pe o coloană suplimentară, indicând faptul că acea sesiune a fost mai grea (având mai puține zile), în caz contrar (când luna are mai mult de 29 de zile) valoarea coloanei va fi null.”
    - ADAPT: «o anumită materie» e nedefinit; aplicația fixează cursul. «Promovat» = nota ≥ 5 (INFERRED).
    - OOP → 8 rânduri (iunie 2014 ×5, iunie 2015 ×3), coloana `+` mereu NULL.
    - Logica → 9 rânduri, februarie, deci `+`.

### Lecția 25. Test de probă și revizuire
**Necesită:** toate.
- Testul de probă din secțiunea 3, în două moduri.
  - **Mod hârtie:** scrii răspunsul înainte să poți rula; la «Predă» se dezvăluie rularea, comparația rezultatelor și soluția.
  - **Mod cu rulare:** cutia SQL funcționează normal.
- **Grămada de greșeli** reia prin Spaced Retrieval itemii greșiți, grupați pe concepția greșită numită.
- **Quiz final** (8-12 itemi, intercalați pe toate modulele, după Learning Rhythm).
- Itemii ♻ din fiecare lecție alimentează această grămadă.

---

## 2. Catalogul capcanelor Oracle

**Legendă status:**
- **calc** = numărul de rânduri sau rezultatul, calculat în emulatorul sqlite pe datele live.
- **doc** = comportament Oracle cunoscut din documentație, necalculat aici.
- **INFERRED** = dedus din audit sau din documentație, necalculat.
- Toate trebuie rulate pe XE 11g înainte de livrare.

| Etichetă | Capcană | Exemplu pe datele noastre | Status | Predată în |
|---|---|---|---|---|
| `empty-str-null` | `''` este NULL în Oracle | `bursa = ''` → 0 rânduri | doc | L5 |
| `null-arith` | NULL în aritmetică → NULL | `bursa + 10` pentru 8 studenți | calc | L3, L5 |
| `concat-null` | `\|\|` tratează NULL ca șir vid (diferit de `+`) | `'Bursa: ' \|\| NULL` → `Bursa: ` | doc | L3 |
| `eq-null` | `= NULL`/`<> NULL` nu găsesc nimic; UNKNOWN; NOT UNKNOWN = UNKNOWN | `NOT (bursa>300)` → 1 rând, nu 9 | calc | L5, L20 |
| `not-in-null` | `NOT IN` cu NULL în listă → 0 rânduri | `an NOT IN (1, NULL)` | doc | L7 |
| `and-or` | AND înaintea lui OR | `an=1 OR an=2 AND bursa IS NOT NULL` → 6 rânduri | calc | L4, L24 |
| `case-sens` | valorile text sunt case-sensitive, cuvintele-cheie nu; alias fără ghilimele → MAJUSCULE | `prenume='ioana'` → 0 rânduri; `%andr%` nu găsește «Andrei» | calc | L2, L4, L6 |
| `quotes-alias` | ghilimelele duble sunt identificatori, nu șiruri; alias cu ghilimele e case-sensitive | `ORDER BY Student` cu alias `"Student"` → ORA-00904 | doc | L2, L8 |
| `curly-quotes` | ghilimele tipografice copiate din enunț → eroare | “a” în enunțuri | doc | L2, L7 |
| `ordering-nulls` | ASC: NULL la sfârșit; DESC: NULL primul | `ORDER BY bursa DESC` | doc | L8 |
| `order-pos-alias` | `ORDER BY 2` fragil; aliasul din SELECT se vede în ORDER BY, nu în WHERE | `ORDER BY 2` pe `SELECT *` | doc | L8 |
| `distinct-row` | DISTINCT acționează pe tot rândul | `SELECT DISTINCT an, grupa` → 7 rânduri | calc | L2 |
| `setop-rules` | număr/tip de coloane (ORA-01789/01790), compară rândul întreg, deduplică, ORDER BY doar la sfârșit; în 11g nu există EXCEPT și INTERSECT ALL | UNION 8 vs UNION ALL 9 | calc/INFERRED | L9, L23 |
| `char-pad` | CHAR(n) umplut cu spații: LENGTH, LIKE, `\|\|`, LPAD | `LENGTH(prenume)` «Cosmin» = 10; `LIKE '%n'` → 0 rânduri | calc (LIKE/LENGTH), doc (semantica Oracle) | L11, L12 |
| `char-cmp` | CHAR vs literal: comparație cu umplere; cu o coloană VARCHAR2: fără umplere, deci TRIM | `studenti.nume = TRIM(profesori.nume)` | doc/INFERRED | L11, L21 |
| `like-escape` | `%`/`_` literal cer `ESCAPE`; nu există escape implicit | `LIKE '%\_%' ESCAPE '\'` | doc | L6 |
| `implicit-conv` | `an='3'` merge; `TO_CHAR(..)=1995` merge; `NVL(bursa,'text')` → ORA-01722 | ex 2.6 | doc | L4, L14, L16 |
| `substr-neg` | SUBSTR cu poziție negativă numără de la sfârșit; poziții de la 1; INSTR dă 0 dacă nu găsește | `SUBSTR('ABCDEFG',-3,2)` = `EF` | doc (pagina oficială greșește) | L11 |
| `pad-truncate` | LPAD/RPAD trunchiază când n e mai mic | `LPAD('Pagina',3)` = `Pag` | doc | L12 |
| `replace-translate` | REPLACE în lanț strică swap-ul; TRANSLATE cu `to` gol dă NULL | ex 3.10 | doc | L12 |
| `round-neg-mod` | ROUND/TRUNC cu m negativ; FLOOR vs TRUNC la negative; MOD cu semnul deîmpărțitului | `FLOOR(-51.3)=-52`, `TRUNC(-51.3)=-51` | doc | L10 |
| `int-division` | `5/2 = 2.5` (nu există împărțire întreagă) | `bursa/50` | doc | L3, L12 |
| `dual` | SELECT fără tabel cere `FROM DUAL` | `SELECT SYSDATE FROM DUAL` | doc | L10, L13 |
| `date-time-part` | DATE conține ora; SYSDATE; diferența de date e fracționară | `SYSDATE - TRUNC(SYSDATE)` ≈ 0,604 la 14:30 | doc | L13, L15 |
| `date-format-yy` | `YY` ia secolul curent, `RR` nu; formatul implicit `DD-MON-RR` depinde de sesiune | `TO_DATE('17-02-95','DD-MM-YY')` = 2095 | doc | L14 |
| `to-char-pad-lang` | `MONTH`/`DAY` completate la 9 caractere (prefix `fm`); limba din `NLS_DATE_LANGUAGE`; `'D'` depinde de teritoriu | `TO_CHAR(d,'DAY')='TUESDAY'` nu merge | doc | L14, L24 |
| `mm-mi` | MM = lună, MI = minute; HH vs HH24 | `'HH:MM'` | doc | L14 |
| `month-sort` | sortarea după nume de lună e alfabetică | ex 3.8 | doc | L14 |
| `add-months-eom` | ADD_MONTHS la sfârșit de lună; MONTHS_BETWEEN: ordinea argumentelor și fracția | `ADD_MONTHS(31-JAN,1)` = 28.02 | doc | L13, L15 |
| `next-day` | NEXT_DAY este strict după dată; numele zilei depinde de limbă | ex 3.7 | doc | L13, L15 |
| `decode-null` | DECODE potrivește NULL cu NULL; doar egalitate; tip de rezultat din primul rezultat | ex 3.9 | doc | L16 |
| `case-no-else` | CASE fără ELSE → NULL; `WHEN x = NULL` nu prinde nimic | | doc | L16 |
| `null-func` | funcțiile cu argument NULL dau NULL (excepții: NVL, CONCAT, DECODE, ...); LEAST/GREATEST cu NULL → NULL | | doc/INFERRED | L10, L16, L17 |
| `cartesian` | uitat `ON` → produs cartezian care pare plauzibil | `studenti, note WHERE prenume='Andrei'` → 42 rânduri, adevărul e 0 | calc | L18 |
| `ambiguous-col` | coloană comună fără prefix (ORA-00918); alias de tabel ascunde numele (ORA-00904) | `SELECT nr_matricol` după JOIN | doc | L18, L19 |
| `alias-as` | `FROM tabel AS alias` nu e valid în Oracle | | doc | L18 |
| `join-no-on` | `JOIN` fără `ON` nu e valid | `studenti s1 JOIN studenti s2 WHERE …` | INFERRED (cod de eroare) | L18, L21 |
| `natural-join-all` | NATURAL JOIN pe TOATE coloanele comune (aici și `an`); coloana comună nu primește calificator (ORA-25155) | trei tabele → 0 rânduri | calc (0 rânduri), doc (eroare) | L19 |
| `row-multiply` | relația 1:N / N:M multiplică rândurile | lanț de 5 tabele: 56 din 42 | calc | L19, L22 |
| `outer-where` | testul «fără pereche» pe cheia din dreapta; filtrul în WHERE transformă outer în inner | `n.valoare IS NULL` greșit | doc | L20 |
| `plus-side` | `(+)` pe partea deficitară; nu se combină cu OR/IN | `n.nr_matricol(+)` | doc | L20 |
| `self-pair` | perechea cu sine; perechi ordonate vs neordonate; `<` pe nume pierde omonimii | 11 vs 10 perechi (ex 4.7) | calc | L21, L22 |
| `all-vs-some` | «toate» ≠ «cel puțin unul»; ANY/ALL: `NOT IN` ≠ `!=ANY` | | doc | L7, L23 |
| `minus-key` | MINUS/INTERSECT/UNION pe nume contopește omonimii; include cheia | 4 rânduri în loc de 5 (ex 4.12) | calc | L9, L23 |
| `concat-prec` | `\|\|` și `+` au aceeași precedență | `'a' \|\| 1 + 2` | INFERRED | L3 |
| `between-incl` | BETWEEN include capetele; cu date având oră, capătul superior se pierde | ex 2.5 | doc | L7, L14 |

---

## 3. Testul de probă (oglindă a L1)

### 3.1 Principii
- **Scris.** Mod hârtie: enunțul și schema se văd, cutia SQL e blocată până la «Predă»; apoi rularea, diferența față de rezultatul așteptat și soluția de referință.
- **Notare pe hârtie:** sintaxă, fiecare clauză cerută, capcana vizată. La hârtie nu contează formatul identic al rezultatului, deci nu poate fi echivalent cu verificarea automată.
- **Punctaj** (INFERRED, maximul L1 nu e publicat; L1 + L2 ≤ 50 și minimum 25 la sumă conform paginii cursului): 3 + 3 + 3 + 3 + 3 + 3 + 3 + 4 = 25, ilustrativ. Fără durată: se alege de cursant.
- **Schemă nouă, mică, 5 tabele:** „Biblioteca”.
  - Oglindește caracteristicile schemei lab: o coloană CHAR (`autori.nume`, ca `profesori.nume`), o coloană numerică cu NULL (`taxa`, ca `bursa`), două nume identice (`Ababei Vlad` ×2, ca `Bodnar Ioana`), un tabel de legătură (`scris`, ca `didactic`), un rând fără pereche pe fiecare parte (cartea `b8` fără autor/împrumut, autorul `a7` fără carte, cititorul `c6` fără împrumuturi).
  - Titlurile, anii și prețurile sunt fictive/orientative.
  - Scriptul complet: `/home/alexa/hub/docs/2026-10-24-research-bd-lessons/mock-test-biblioteca.sql`.

### 3.2 Schema și datele
```
cititori(id_cititor CHAR(4) NN, nume VARCHAR2(10), prenume VARCHAR2(10), oras VARCHAR2(8), taxa NUMBER(5,2), data_inscriere DATE)
carti(id_carte CHAR(4) NN, titlu VARCHAR2(25), gen VARCHAR2(8), an_aparitie NUMBER(4), pret NUMBER(6,2))
autori(id_autor CHAR(4) NN, nume CHAR(10), prenume CHAR(10), tara VARCHAR2(8))
scris(id_autor CHAR(4), id_carte CHAR(4))
imprumuturi(id_cititor CHAR(4), id_carte CHAR(4), data_imprumut DATE, data_returnare DATE, apreciere NUMBER(2))
```
| cititori | id | nume | prenume | oras | taxa | data_inscriere |
|---|---|---|---|---|---|---|
| | c1 | Munteanu | Elena | Iasi | NULL | 12.09.2023 |
| | c2 | Ababei | Vlad | Iasi | 15,50 | 03.10.2023 |
| | c3 | Ababei | Vlad | Iasi | NULL | 03.10.2023 |
| | c4 | Dumitru | Ion | Iasi | 8,00 | 21.01.2024 |
| | c5 | Sandu | Mihai | Vaslui | NULL | 13.02.2024 |
| | c6 | Lupu | Matei | Vaslui | NULL | 13.02.2024 |
| | c7 | Pavel | Ana | Bacau | 4,25 | 05.03.2024 |
| | c8 | Rusu | Andrada | Iasi | NULL | 05.03.2024 |

- **carti:** b1 Enigma Otiliei (roman) · b2 Ion (roman) · b3 Poezii (poezie) · b4 Baltagul (roman) · b5 Amintiri din copilarie (proza) · b6 Maitreyi (roman) · b7 Antologie de proza (proza, doi autori) · b8 Ghid de lectura (studiu).
- **autori:** a1 Calinescu George · a2 Rebreanu Liviu · a3 Eminescu Mihai · a4 SADOVEANU MIHAIL (majuscule, ca `LAZAR` din `profesori`) · a5 Creanga Ion · a6 Eliade Mircea · a7 Blaga Lucian (fără carte).
- **scris:** a1-b1, a2-b2, a3-b3, a4-b4, a5-b5, a6-b6, a1-b7, a2-b7.
- **imprumuturi** (16 rânduri):

| cititor | carte | împrumut | returnare | apreciere |
|---|---|---|---|---|
| c1 | b1 | 05.03.2024 | 19.03.2024 | 9 |
| c1 | b2 | 05.03.2024 | 20.03.2024 | 8 |
| c1 | b6 | 09.04.2024 | 30.04.2024 | 10 |
| c2 | b2 | 13.02.2024 | 27.02.2024 | 6 |
| c2 | b4 | 12.03.2024 | NULL | NULL |
| c3 | b1 | 13.02.2024 | 01.03.2024 | 7 |
| c3 | b5 | 13.03.2024 | 26.03.2024 | 8 |
| c4 | b3 | 30.01.2024 | 14.02.2024 | 9 |
| c4 | b4 | 05.03.2024 | 18.03.2024 | 7 |
| c4 | b7 | 09.04.2024 | 23.04.2024 | 7 |
| c5 | b3 | 14.03.2024 | 27.03.2024 | 5 |
| c5 | b5 | 02.04.2024 | 16.04.2024 | 6 |
| c7 | b6 | 20.03.2024 | 02.04.2024 | 9 |
| c7 | b1 | 09.04.2024 | NULL | NULL |
| c8 | b2 | 26.03.2024 | 09.04.2024 | 8 |
| c8 | b7 | 26.03.2024 | 10.04.2024 | 10 |

### 3.3 Problemele, soluțiile și rezultatele așteptate
Rezultatele sunt calculate în emulatorul sqlite pe aceleași date (logică și număr de rânduri); sintaxa Oracle trebuie rulată pe XE 11g.

**P1 (3 p), filtrare, NULL, LIKE, ORDER BY.**
- **Enunț:** «Afișați numele, prenumele și orașul cititorilor fără taxă înregistrată al căror prenume conține litera „a” (literă mică). Ordonați descrescător după oraș și, la același oraș, crescător după nume.»
- **Soluție:** `SELECT nume, prenume, oras FROM cititori WHERE taxa IS NULL AND prenume LIKE '%a%' ORDER BY oras DESC, nume ASC;`
- **Rezultat:** Lupu Matei Vaslui · Sandu Mihai Vaslui · Ababei Vlad Iasi · Munteanu Elena Iasi · Rusu Andrada Iasi.
- **Greșeli tipice:** `taxa = NULL` (0 rânduri); `LIKE '%A%'`; `DESC` aplicat doar o dată.

**P2 (3 p), «toți / numai» cu MINUS (operatori pe mulțimi).**
- **Enunț:** «Afișați cititorii (id, nume, prenume) care au împrumutat cel puțin o carte și nu au dat nicio apreciere sub 7.»
- **Soluție:** `SELECT c.id_cititor, c.nume, c.prenume FROM cititori c JOIN imprumuturi i ON c.id_cititor = i.id_cititor MINUS SELECT c.id_cititor, c.nume, c.prenume FROM cititori c JOIN imprumuturi i ON c.id_cititor = i.id_cititor WHERE i.apreciere < 7;`
- **Rezultat:** c1, c3, c4, c7, c8.
- **Greșeli tipice:** MINUS doar pe `(nume, prenume)` dă 4 rânduri, fiindcă cei doi Ababei Vlad se contopesc; `WHERE apreciere >= 7` («cel puțin una»); cititorul fără împrumuturi (c6) nu trebuie să apară.

**P3 (3 p), funcții text pe CHAR.**
- **Enunț:** «Pentru fiecare autor afișați, într-o coloană numită „Autor”, numele cu prima literă mare și restul mici, un spațiu, inițiala prenumelui și un punct (de ex. „Eminescu M.”), plus lungimea numelui (fără spații).»
- **Soluție:** `SELECT INITCAP(TRIM(nume)) || ' ' || SUBSTR(TRIM(prenume),1,1) || '.' AS "Autor", LENGTH(TRIM(nume)) AS lungime FROM autori;`
- **Rezultat:** Calinescu G. 9 · Rebreanu L. 8 · Eminescu M. 8 · Sadoveanu M. 9 · Creanga I. 7 · Eliade M. 6 · Blaga L. 5.
- **Greșeli tipice:** fără TRIM → `Calinescu  G.` (spații) și lungime 10 pentru toți; fără INITCAP → `SADOVEANU`.

**P4 (3 p), date.**
- **Enunț:** «Pentru fiecare împrumut returnat, făcut în martie (orice an), afișați id_cititor, data împrumutului în formatul DD.MM.YYYY, ziua săptămânii (în engleză, fără spații în plus) și numărul de zile de întârziere față de termenul de 14 zile (0 dacă nu a fost întârziere). Ordonați cronologic.»
- **Soluție:** `SELECT id_cititor, TO_CHAR(data_imprumut,'DD.MM.YYYY') AS data, TO_CHAR(data_imprumut,'fmDay','NLS_DATE_LANGUAGE=ENGLISH') AS zi, GREATEST(0, data_returnare - data_imprumut - 14) AS intarziere FROM imprumuturi WHERE data_returnare IS NOT NULL AND TO_CHAR(data_imprumut,'MM') = '03' ORDER BY data_imprumut;`
- **Rezultat** (8 rânduri):

| id_cititor | data | zi | întârziere |
|---|---|---|---|
| c1 | 05.03.2024 | Tuesday | 0 |
| c1 | 05.03.2024 | Tuesday | 1 |
| c4 | 05.03.2024 | Tuesday | 0 |
| c3 | 13.03.2024 | Wednesday | 0 |
| c5 | 14.03.2024 | Thursday | 0 |
| c7 | 20.03.2024 | Wednesday | 0 |
| c8 | 26.03.2024 | Tuesday | 0 |
| c8 | 26.03.2024 | Tuesday | 1 |

- **Greșeli tipice:** `ORDER BY` pe șirul formatat (nu cronologic); `fmDay` omis (`Tuesday  `); întârziere negativă fără GREATEST; rândurile nereturnate (diferență NULL).

**P5 (3 p), NVL, CASE, DECODE.**
- **Enunț:** «Pentru fiecare cititor afișați numele, taxa (0 dacă lipsește), taxa majorată cu 10% rotunjită la 2 zecimale, o categorie („fara taxa” dacă taxa lipsește sau e 0, „mica” sub 10, „mare” în rest) și un cod de oraș cu DECODE („IS” pentru Iasi, „BC” pentru Bacau, „altul” în rest).»
- **Soluție:** `SELECT nume, NVL(taxa,0) AS taxa, ROUND(NVL(taxa,0)*1.1,2) AS taxa_majorata, CASE WHEN NVL(taxa,0)=0 THEN 'fara taxa' WHEN taxa<10 THEN 'mica' ELSE 'mare' END AS categorie, DECODE(oras,'Iasi','IS','Bacau','BC','altul') AS cod FROM cititori;`
- **Rezultat** (8 rânduri):

| nume | taxa | majorata | categorie | cod |
|---|---|---|---|---|
| Munteanu | 0 | 0 | fara taxa | IS |
| Ababei | 15,5 | 17,05 | mare | IS |
| Ababei | 0 | 0 | fara taxa | IS |
| Dumitru | 8 | 8,8 | mica | IS |
| Sandu | 0 | 0 | fara taxa | altul |
| Lupu | 0 | 0 | fara taxa | altul |
| Pavel | 4,25 | 4,68 | mica | BC |
| Rusu | 0 | 0 | fara taxa | IS |

- **Greșeli tipice:** `taxa < 10` fără NVL (NULL cade în `mare`); DECODE cu comparație (`oras='Iasi'`).

**P6 (3 p), JOIN în lanț (5 tabele).**
- **Enunț:** «Afișați numele cititorului, titlul cărții și numele autorului pentru împrumuturile apreciate cu 9 sau 10.»
- **Soluție:** `SELECT c.nume AS cititor, ca.titlu, TRIM(a.nume) AS autor, i.apreciere FROM cititori c JOIN imprumuturi i ON c.id_cititor = i.id_cititor JOIN carti ca ON ca.id_carte = i.id_carte JOIN scris s ON s.id_carte = ca.id_carte JOIN autori a ON a.id_autor = s.id_autor WHERE i.apreciere >= 9;`
- **Rezultat** (6 rânduri): Munteanu / Enigma Otiliei / Calinescu / 9 · Munteanu / Maitreyi / Eliade / 10 · Dumitru / Poezii / Eminescu / 9 · Pavel / Maitreyi / Eliade / 9 · Rusu / Antologie de proza / Calinescu / 10 · Rusu / Antologie de proza / Rebreanu / 10.
- **Notă pentru corector:** cartea cu doi autori apare pe două rânduri (nu e greșeală). Greșeli tipice: tabela `scris` omisă; condiție de join lipsă (produs cartezian).

**P7 (3 p), join extern.**
- **Enunț:** «(a) Afișați toți autorii (nume, prenume) cu titlurile cărților lor; autorii fără nicio carte trebuie să apară și ei, cu titlul gol. (b) Afișați titlurile cărților care nu au fost niciodată împrumutate.»
- **Soluții:**
  - (a) `SELECT TRIM(a.nume) AS nume, TRIM(a.prenume) AS prenume, c.titlu FROM autori a LEFT JOIN scris s ON a.id_autor = s.id_autor LEFT JOIN carti c ON c.id_carte = s.id_carte;`
  - (b) `SELECT c.titlu FROM carti c LEFT JOIN imprumuturi i ON c.id_carte = i.id_carte WHERE i.id_carte IS NULL;`
- **Rezultate:**
  - (a) 9 rânduri, inclusiv Blaga Lucian cu titlu NULL și cele două rânduri ale cărții cu doi autori (Calinescu și Rebreanu apar fiecare de două ori).
  - (b) `Ghid de lectura`.
- **Greșeli tipice:** INNER JOIN în (a); testul `i.apreciere IS NULL` în (b) (greșit, apreciere poate fi NULL pe rânduri existente: c2/b4, c7/b1).

**P8 (4 p), self-join.**
- **Enunț:** «Afișați perechile de cititori din același oraș care s-au înscris în aceeași zi, fiecare pereche o singură dată, fără a compara un cititor cu el însuși. Coloane: cele două id-uri, cele două nume, orașul.»
- **Soluție:** `SELECT a.id_cititor, b.id_cititor, a.nume, b.nume, a.oras FROM cititori a JOIN cititori b ON a.oras = b.oras AND a.data_inscriere = b.data_inscriere AND a.id_cititor < b.id_cititor;`
- **Rezultat:** (c2, c3, Ababei, Ababei, Iasi) și (c5, c6, Sandu, Lupu, Vaslui).
- **Greșeli tipice:** `a.nume < b.nume` pierde perechea c2–c3 (nume identice) și o dă pe c6–c5 în sens invers; `<>` dă 4 rânduri (fiecare pereche de două ori).

### 3.4 Variante (bancă de înlocuiri, fără soluții complete)
- P1′: IN + BETWEEN pe `an_aparitie`, cu NOT LIKE.
- P2′: INTERSECT între prenumele cititorilor și ale autorilor, cu `TRIM` pe ambele părți. Rezultat așteptat: Ion și Mihai, calculat în emulator. «MIHAIL» nu se potrivește cu «Mihai» (comparație case-sensitive).
- P3′: SUBSTR/INSTR/REPLACE, bară de steluțe cu LPAD.
- P4′: vârsta de la `data_inscriere`, NEXT_DAY, ADD_MONTHS.
- P5′: DECODE-only.
- P6′: 3 tabele cu două valori fixe.
- P7′: FULL OUTER JOIN `autori`–`carti` prin `scris`.
- P8′: perechi de cititori cu diferența de vârstă de înscriere.

---

## 4. Ce greșesc paginile oficiale (de nu copiat)

Referințele sunt la `/home/alexa/hub/docs/2026-10-24-research-bd-lessons/official/*.txt` (lab2, lab3, lab4), `lab1.html` și scriptul live. Etichete: **doc** = Oracle documentat; **INFERRED**.

### 4.1 Erori
1. **`lab1.html:186`**: «NULL=NULL și NULL<>NULL returnează FALSE». În Oracle rezultatul este UNKNOWN; în WHERE, atât UNKNOWN cât și FALSE elimină rândul, dar NOT UNKNOWN rămâne UNKNOWN. Nu e echivalent cu FALSE (`NOT (bursa>300)` dă 1 rând, nu 9; calc). Predat corect în L5.
2. **`lab1.html:215`** spune `titlu_curs` «maxim 10» caractere, iar scriptul live are `VARCHAR2(15)` (`resurse_script_facultate.sql:27`). Datele depășesc 10: «Tehnologii Web» (14), «Limbaje formale» (15).
3. **`lab1.html:200,224-225,233-234,242-243`** declară NOT NULL pe `studenti.nume`, `note.nr_matricol`, `note.id_curs`, `profesori.id_prof`, `profesori.nume`, `didactic.*`. Scriptul pune NOT NULL doar pe `studenti.nr_matricol` și `cursuri.id_curs`.
4. **Script live:** `profesori` conține `p20` și `p21` de două ori (liniile 172-176: PASCARIU/Nastasa și LAZAR/PASAT), fără cheie primară. `id_prof` nu identifică un rând. Inofensiv în lab 4 (`didactic` nu are `p20`/`p21`), dar «cheia» e falsă.
5. **`lab2.txt:46`**: «%» și «_» se prefixează cu `\`. Fals: nu există escape implicit; trebuie `ESCAPE '\'`, cum arată chiar pagina la linia 116 (`ESCAPE '\'`).
6. **`lab2.txt:54`**: `FROM studenţi` (cu ţ) → ORA-00942.
7. **`lab2.txt:105`**: «NOT IN … echivalent cu „!=ANY”». `NOT IN` ≡ `<> ALL` (INFERRED). `<> ANY` e adevărat pentru aproape orice listă cu două valori distincte.
8. **`lab2.txt:143`**: `INTERSECT [ALL]` nu există în 11g (INFERRED din audit; apare în 21c).
9. **`lab3.txt:6`**: «Excepție fac CONCAT, NVL, REPLACE, REGEXP_REPLACE» e incomplet (DECODE, NULLIF, COALESCE, NVL2...). INFERRED.
10. **`lab3.txt:49`**: SUBSTR cu poziție negativă «numărarea de la stânga la dreapta». Fals: numără de la sfârșit (doc). `SUBSTR('ABCDEFG',-3,2)` = `EF`.
11. **`lab3.txt:61`**: `WHERE UPPER(nume)='BREABAN' --returneaza 0 linii`. INFERRED: o coloană CHAR comparată cu un literal se compară cu umplere de spații, deci ar trebui să potrivească. TRIM e necesar pentru LENGTH, LIKE, `||` și comparații cu VARCHAR2. A se rula pe Oracle înainte de a repeta afirmația.
12. **`lab3.txt:144`**: `SELECT 'Este o zi frumoasa de ' TO_CHAR(SYSDATE,…)` lipsește `||` → eroare de sintaxă.
13. **`lab3.txt:79`**: `TO_CHAR(SYSDATE,'DD-MM-YYYY HH:MI')` fără AM/PM e ambiguu; se folosește HH24.
14. **`lab3.txt:88`**: `NEXT_DAY('13-OCT-15','TUESDAY')` depinde de `NLS_DATE_FORMAT` și de limba sesiunii (pagina însăși recomandă TO_DATE).
15. **`lab3.txt:87,96`**: NEXT_DAY «zilei lucrătoare» (de fapt orice zi, strict după dată); TRUNC «cea mai apropiată zi» (TRUNC taie ora, ROUND rotunjește).
16. **`lab4.txt:80`**: «Cum eliminăm înregistrarea în care studentul apare coleg cu el însuși?» e fără răspuns oficial; se predă în L21.

### 4.2 Enunțuri subspecificate (pentru aplicație)
| Exercițiu | Problema | Decizie propusă |
|---|---|---|
| lab 2 ex 4 | formatul nu e definit | rând-model în enunț |
| lab 2 ex 8 | cheia «prenume descrescător» nu se verifică pe datele live | a doua bază de date |
| lab 2 ex 11 | «două apariții» și majuscule/minuscule | «a mică, exact de două ori»; citirea case-insensitive dă altă mulțime |
| lab 2 ex 15 | LUCIAN (majuscule) | «n mică sau mare» → 7 rânduri |
| lab 3 ex 2 | luni întregi sau fracționare | toleranță numerică |
| lab 3 ex 7 | ziua de naștere = azi | de fixat și verificat pe a doua dată |
| lab 3 ex 11 | idem | idem |
| lab 3 ex 13 | lățimea de aliniere | 9 |
| lab 4 ex 1 | nota nu are profesor | «profesorii cursului», 56 de rânduri |
| lab 4 ex 7 | ordine alfabetică pe nume pierde omonimii; «ordonată după zi» (calendaristic/alfabetic) | `nr_matricol` ca departajare; luni → duminică |
| lab 4 ex 9 | pereche ordonată/neordonată; unitatea diferenței | neordonate, în zile |
| lab 4 ex 12 | `MINUS` pe nume contopește Bodnar ×2 | cere `nr_matricol` |
| lab 4 ex 14 | «o anumită materie», «promovat» | curs fixat; nota ≥ 5 (INFERRED) |

### 4.3 Greșeli ale materialelor colegilor (nu reproduse)
Din `/home/alexa/hub/docs/2026-10-24-recon-semester-3.md`, secțiunea 6 (13 erori plus puncte fragile), aplicate în schiță astfel:
- `JOIN` fără `ON` (L18, L21) și `<>` pe `nr_matricol` vs `nume` (L21).
- `s1.nume < s2.nume` (L21), MINUS pe `(nume, prenume)` (L23).
- `LEFT JOIN … WHERE n.valoare IS NULL` (L20).
- `EXCEPT` în Oracle (L9).
- `π` fără DISTINCT, adică modelul multiset (L2).
- `TO_CHAR(...) = 1995` declarat greșit (L14).
- `ROUND`/`TRUNC` în zilele până la ziua de naștere (L15).
- Tabelul de măști `DAY`/`MONTH` fără umplere (L14).
- Ipoteza că «fără TRIM nu găsește nimic» cu motivație greșită (L11).
- Fragile: `NVL` cu tip diferit (L16), `LPAD` pe lungimea 9 (L12).
- Notă: erorile 6 și 7 din audit (semi-join și join-uri externe cu `profesori.nume`/`prenume` CHAR(10) vs VARCHAR2) sunt cazuri de `[char-cmp]` și apar în L11 și L21.

---

### Fișiere de lucru
- `/home/alexa/hub/docs/2026-10-24-research-bd-lessons/outline-tools/mkdb.py`
- `/home/alexa/hub/docs/2026-10-24-research-bd-lessons/outline-tools/mock.py`
- `/home/alexa/hub/docs/2026-10-24-research-bd-lessons/mock-test-biblioteca.sql`

Nu am modificat niciun repo și nu am rulat nimic în `/home/alexa/Desktop/SO/os-study-guide`.