// Plain-language explanations of Oracle error codes, Romanian first with an English translation.
//
//   explainOra('ORA-00904') -> { ro, en }
//
// Each text says what went wrong and how to fix it in one or two sentences. A code that is not listed gets a generic pair.
const TABLE = {
  'ORA-00001': {
    ro: 'Valoarea introdusă există deja într-o coloană care trebuie să fie unică (cheie primară sau UNIQUE). Folosește o valoare nouă sau modifică rândul existent.',
    en: 'The value already exists in a column that must be unique (primary key or UNIQUE). Use a new value or change the existing row.',
  },
  'ORA-00900': {
    ro: 'Comanda nu începe cu un cuvânt pe care Oracle îl cunoaște (de exemplu SELEC în loc de SELECT, sau o comandă din alt sistem, ca SHOW sau VALUES). Verifică primul cuvânt.',
    en: 'The command does not start with a word Oracle knows (for example SELEC instead of SELECT, or a command from another system such as SHOW or VALUES). Check the first word.',
  },
  'ORA-00902': {
    ro: 'Tipul de date nu există în Oracle (de exemplu TEXT, BOOLEAN sau SERIAL). Folosește VARCHAR2(n), CHAR(n), NUMBER(p,s) sau DATE.',
    en: 'The data type does not exist in Oracle (for example TEXT, BOOLEAN or SERIAL). Use VARCHAR2(n), CHAR(n), NUMBER(p,s) or DATE.',
  },
  'ORA-00903': {
    ro: 'După FROM lipsește numele tabelului (sau nu e un nume valid). Scrie tabelul din care citești: SELECT * FROM studenti.',
    en: 'The table name is missing after FROM (or it is not a valid name). Write the table you read from: SELECT * FROM studenti.',
  },
  'ORA-00904': {
    ro: 'Numele unei coloane sau al unei funcții nu există sau este scris greșit. Verifică ortografia și că tabelul din FROM chiar are acea coloană.',
    en: 'The name of a column or function does not exist or is misspelled. Check the spelling and that the table in FROM really has that column.',
  },
  'ORA-00905': {
    ro: 'Lipsește un cuvânt cheie al comenzii (de exemplu ON după JOIN, sau VALUES, SET, INTO). Recitește forma comenzii și completează cuvântul care lipsește: un JOIN cere ON cu condiția de legătură (JOIN note n ON s.nr_matricol = n.nr_matricol).',
    en: 'A keyword of the command is missing (for example ON after JOIN, or VALUES, SET, INTO). Re-read the shape of the command and add the missing word: a JOIN needs ON with the join condition (JOIN note n ON s.nr_matricol = n.nr_matricol).',
  },
  'ORA-00906': {
    ro: 'Lipsește o paranteză stângă. VARCHAR2 cere lungimea între paranteze: VARCHAR2(20).',
    en: 'A left parenthesis is missing. VARCHAR2 needs its length in parentheses: VARCHAR2(20).',
  },
  'ORA-00907': {
    ro: 'O paranteză deschisă nu are paranteza de închidere. Numără parantezele și închide-o pe cea care lipsește.',
    en: 'An opening parenthesis has no closing one. Count the parentheses and close the missing one.',
  },
  'ORA-00909': {
    ro: 'O funcție primește un număr greșit de argumente (de exemplu CONCAT acceptă exact două). Verifică câte argumente cere funcția; pentru mai multe texte folosește ||.',
    en: 'A function gets the wrong number of arguments (for example CONCAT takes exactly two). Check how many arguments the function wants; to join more texts use ||.',
  },
  'ORA-00910': {
    ro: 'Lungimea cerută este prea mare pentru tip: VARCHAR2 are cel mult 4000 de caractere, CHAR cel mult 2000.',
    en: 'The requested length is too big for the type: VARCHAR2 holds at most 4000 characters, CHAR at most 2000.',
  },
  'ORA-00911': {
    ro: 'Comanda conține un caracter pe care Oracle nu îl acceptă aici: un al doilea ; (o a doua comandă în aceeași rulare) sau un % scris în afara ghilimelelor. % are sens doar într-un tipar LIKE, între apostrofuri (LIKE \'%a%\'); restul împărțirii se calculează cu MOD.',
    en: 'The command contains a character Oracle does not accept here: a second ; (a second command in the same run) or a % written outside quotes. % only means something in a LIKE pattern, between single quotes (LIKE \'%a%\'); the remainder of a division is MOD.',
  },
  'ORA-00913': {
    ro: 'În VALUES sunt mai multe valori decât coloane în INSERT. Numără coloanele și valorile: trebuie să fie la fel de multe.',
    en: 'VALUES has more values than the INSERT has columns. Count the columns and the values: there must be as many of one as of the other.',
  },
  'ORA-00918': {
    ro: 'Numele coloanei apare în mai multe tabele din FROM, deci Oracle nu știe pe care o vrei. Pune în față numele tabelului sau al aliasului: s.nr_matricol.',
    en: 'The column name exists in more than one table in FROM, so Oracle cannot tell which one you mean. Put the table name or alias in front: s.nr_matricol.',
  },
  'ORA-00920': {
    ro: 'Operatorul de comparație nu există în Oracle (de exemplu ILIKE sau ::). Folosește LIKE, eventual cu UPPER pe ambele părți, și CAST sau TO_CHAR pentru conversii.',
    en: 'The comparison operator does not exist in Oracle (for example ILIKE or ::). Use LIKE, with UPPER on both sides if needed, and CAST or TO_CHAR for conversions.',
  },
  'ORA-00923': {
    ro: 'Oracle nu a găsit FROM unde îl aștepta: lipsește FROM (sau e scris greșit, de pildă FORM), ori lista de după SELECT are ceva în plus sau îi lipsește o virgulă. Orice SELECT are nevoie de FROM (pentru o simplă expresie, FROM DUAL); verifică și virgulele dintre expresii.',
    en: 'Oracle did not find FROM where it expected it: FROM is missing (or misspelled, for example FORM), or the list after SELECT has something extra or is missing a comma. Every SELECT needs FROM (for a plain expression, FROM DUAL); check the commas between expressions too.',
  },
  'ORA-00928': {
    ro: 'După operatorul de mulțimi lipsește un SELECT. Oracle nu are INTERSECT ALL sau MINUS ALL; folosește INTERSECT, MINUS sau UNION ALL.',
    en: 'A SELECT is missing after the set operator. Oracle has no INTERSECT ALL or MINUS ALL; use INTERSECT, MINUS or UNION ALL.',
  },
  'ORA-00932': {
    ro: 'Tipurile de date nu se potrivesc (de exemplu compari un număr cu un text sau o dată cu un număr). Convertește una dintre părți cu TO_CHAR, TO_DATE sau TO_NUMBER.',
    en: 'The data types do not match (for example you compare a number with a text or a date with a number). Convert one side with TO_CHAR, TO_DATE or TO_NUMBER.',
  },
  'ORA-00933': {
    ro: 'Comanda nu se termină acolo unde se așteaptă Oracle: după o clauză completă urmează ceva ce nu se potrivește (un cuvânt în plus, o paranteză sau o clauză în locul greșit). De exemplu LIMIT sau FETCH FIRST nu există în Oracle 11g, iar AS nu se pune între tabel și alias. Citește comanda de la locul unde se oprește.',
    en: 'The command does not end where Oracle expects: after a complete clause comes something that does not fit (an extra word, a parenthesis or a clause in the wrong place). For example LIMIT or FETCH FIRST do not exist in Oracle 11g, and AS does not go between a table and its alias. Read the command from the place where it stops.',
  },
  'ORA-00934': {
    ro: 'O funcție de grup (COUNT, SUM, AVG, MIN, MAX) nu poate sta în WHERE. Mută condiția în HAVING sau calculeaz-o într-o subinterogare.',
    en: 'A group function (COUNT, SUM, AVG, MIN, MAX) cannot be in WHERE. Move the condition to HAVING or compute it in a subquery.',
  },
  'ORA-00936': {
    ro: 'Lipsește o expresie acolo unde Oracle o aștepta: o virgulă în plus, o condiție fără a doua parte sau o listă goală. Citește locul unde se termină comanda și completează ce lipsește.',
    en: 'An expression is missing where Oracle expected one: an extra comma, a condition without its second half or an empty list. Read the place where the command stops and add what is missing.',
  },
  'ORA-00937': {
    ro: 'Amesteci o coloană simplă cu o funcție de grup (COUNT, SUM, ...) fără GROUP BY. Fie adaugi GROUP BY pe coloană, fie scoți coloana din SELECT.',
    en: 'You mix a plain column with a group function (COUNT, SUM, ...) without GROUP BY. Either add GROUP BY on the column or remove the column from SELECT.',
  },
  'ORA-00938': {
    ro: 'Funcția a primit prea puține argumente. Verifică ce cere: de exemplu LPAD(text, lungime [, completare]) și SUBSTR(text, start [, lungime]) au nevoie de cel puțin două.',
    en: 'The function got too few arguments. Check what it needs: for example LPAD(text, length [, fill]) and SUBSTR(text, start [, length]) need at least two.',
  },
  'ORA-00939': {
    ro: 'Funcția a primit prea multe argumente. Numără virgulele dintre paranteze și compară cu forma funcției (ROUND(n [, zecimale]) are cel mult două).',
    en: 'The function got too many arguments. Count the commas between the parentheses and compare with the function\'s shape (ROUND(n [, decimals]) has at most two).',
  },
  'ORA-00942': {
    ro: 'Tabelul sau view-ul nu există sau nu ai voie să îl vezi. Verifică numele tabelului și că ai creat tabelul înainte.',
    en: 'The table or view does not exist or you are not allowed to see it. Check the table name and that you created the table first.',
  },
  'ORA-00947': {
    ro: 'În VALUES sunt mai puține valori decât coloane. Fără listă de coloane, INSERT cere o valoare pentru fiecare coloană a tabelului (poți scrie NULL); sau numește coloanele: INSERT INTO t (c1, c2) VALUES (...).',
    en: 'VALUES has fewer values than there are columns. Without a column list, INSERT wants a value for every column of the table (you can write NULL); or name the columns: INSERT INTO t (c1, c2) VALUES (...).',
  },
  'ORA-00955': {
    ro: 'Numele este deja folosit de alt obiect (tabel, view, index). Alege alt nume sau șterge întâi obiectul vechi cu DROP.',
    en: 'The name is already used by another object (table, view, index). Pick another name or drop the old object first with DROP.',
  },
  'ORA-00957': {
    ro: 'Același nume de coloană apare de două ori în CREATE TABLE. Redenumește una dintre ele.',
    en: 'The same column name appears twice in CREATE TABLE. Rename one of them.',
  },
  'ORA-00979': {
    ro: 'Ai un GROUP BY, dar în SELECT apare o coloană care nu este în GROUP BY și nu este într-o funcție de grup. Adaugă coloana în GROUP BY sau înfășoar-o în MIN, MAX etc.',
    en: 'You have a GROUP BY, but SELECT contains a column that is not in GROUP BY and not inside a group function. Add the column to GROUP BY or wrap it in MIN, MAX, etc.',
  },
  'ORA-01086': {
    ro: 'Punctul de salvare nu există: nu l-ai creat cu SAVEPOINT, a dispărut după un ROLLBACK la un punct mai vechi sau după COMMIT.',
    en: 'The savepoint does not exist: you did not create it with SAVEPOINT, or it went away after a ROLLBACK to an earlier point or after COMMIT.',
  },
  'ORA-01400': {
    ro: 'Încerci să pui NULL într-o coloană declarată NOT NULL (sau cheie primară). Dă coloanei o valoare în INSERT.',
    en: 'You try to put NULL into a column declared NOT NULL (or a primary key). Give the column a value in the INSERT.',
  },
  'ORA-01407': {
    ro: 'UPDATE ar pune NULL într-o coloană care nu acceptă NULL (NOT NULL sau cheie primară). Dă coloanei o valoare.',
    en: 'UPDATE would put NULL into a column that does not accept NULL (NOT NULL or primary key). Give the column a value.',
  },
  'ORA-01426': {
    ro: 'Rezultatul unui calcul întreg este prea mare. Folosește numere mai mici sau împarte calculul în pași.',
    en: 'The result of an integer calculation is too large. Use smaller numbers or split the calculation into steps.',
  },
  'ORA-01427': {
    ro: 'Subinterogarea folosită ca o singură valoare (după =, <, > sau în lista din SELECT) întoarce mai multe rânduri. Restrânge-o la un rând sau folosește IN, ANY sau ALL.',
    en: 'The subquery used as a single value (after =, <, > or in the SELECT list) returns more than one row. Narrow it to one row or use IN, ANY or ALL.',
  },
  'ORA-01428': {
    ro: 'Un argument al funcției este în afara valorilor permise (de exemplu SQRT dintr-un număr negativ sau INSTR cu apariția 0). Verifică valoarea dată funcției.',
    en: 'An argument of the function is outside the allowed values (for example SQRT of a negative number or INSTR with occurrence 0). Check the value given to the function.',
  },
  'ORA-01430': {
    ro: 'Coloana pe care vrei s-o adaugi există deja în tabel. Alege alt nume.',
    en: 'The column you want to add already exists in the table. Choose another name.',
  },
  'ORA-01438': {
    ro: 'Numărul are mai multe cifre decât permite NUMBER(precizie, scală) al coloanei. Folosește o valoare mai mică sau mărește precizia coloanei.',
    en: 'The number has more digits than the NUMBER(precision, scale) of the column allows. Use a smaller value or widen the column precision.',
  },
  'ORA-01476': {
    ro: 'Împarți la zero. Verifică numitorul sau protejează-l cu NULLIF(numitor, 0).',
    en: 'You divide by zero. Check the denominator or guard it with NULLIF(denominator, 0).',
  },
  'ORA-01481': {
    ro: 'Modelul de format pentru numere (al doilea argument din TO_CHAR sau TO_NUMBER) nu este valid. Folosește cifre ca 9 și 0, separatori ca , și . și câteva elemente precum FM, L, S.',
    en: 'The number format model (the second argument of TO_CHAR or TO_NUMBER) is not valid. Use digits such as 9 and 0, separators such as , and . and a few elements such as FM, L, S.',
  },
  'ORA-01722': {
    ro: 'Un text nu poate fi transformat în număr (de exemplu \'abc\' + 1). Verifică valorile din coloană sau folosește un format în TO_NUMBER.',
    en: 'A text cannot be turned into a number (for example \'abc\' + 1). Check the values in the column or use a format in TO_NUMBER.',
  },
  'ORA-01723': {
    ro: 'Lungimea unei coloane nu poate fi 0. Scrie o lungime de cel puțin 1.',
    en: 'A column cannot have length 0. Write a length of at least 1.',
  },
  'ORA-01727': {
    ro: 'Precizia din NUMBER(p,s) trebuie să fie între 1 și 38.',
    en: 'The precision in NUMBER(p,s) must be between 1 and 38.',
  },
  'ORA-01728': {
    ro: 'Scala din NUMBER(p,s) trebuie să fie între -84 și 127.',
    en: 'The scale in NUMBER(p,s) must be between -84 and 127.',
  },
  'ORA-01756': {
    ro: 'Un text între apostrofuri nu este închis: lipsește apostroful de la sfârșit. Închide textul (de exemplu \'Popescu\'); un apostrof din interiorul textului se scrie dublat: \'it\'\'s\'.',
    en: 'A text between single quotes is not closed: the closing quote is missing. Close the text (for example \'Popescu\'); a quote inside the text is written twice: \'it\'\'s\'.',
  },
  'ORA-01758': {
    ro: 'Nu poți adăuga o coloană NOT NULL într-un tabel care are deja rânduri, decât dacă îi dai o valoare implicită: ADD (c NUMBER DEFAULT 0 NOT NULL).',
    en: 'You cannot add a NOT NULL column to a table that already has rows unless you give it a default: ADD (c NUMBER DEFAULT 0 NOT NULL).',
  },
  'ORA-01785': {
    ro: 'ORDER BY trimite la o poziție care nu există în lista din SELECT. Folosește un număr între 1 și numărul de coloane selectate sau numele coloanei.',
    en: 'ORDER BY points to a position that is not in the SELECT list. Use a number from 1 to the number of selected columns, or the column name.',
  },
  'ORA-01789': {
    ro: 'Interogările legate cu UNION, INTERSECT sau MINUS trebuie să aibă același număr de coloane. Pune în fiecare SELECT câte coloane are celălalt, în aceeași ordine.',
    en: 'The queries joined by UNION, INTERSECT or MINUS must have the same number of columns. Give each SELECT as many columns as the other, in the same order.',
  },
  'ORA-01790': {
    ro: 'Coloanele aflate pe aceeași poziție în cele două interogări ale lui UNION, INTERSECT sau MINUS trebuie să aibă același tip (de exemplu text cu text). Convertește una dintre ele cu TO_CHAR sau TO_NUMBER.',
    en: 'The columns in the same position of the two queries of UNION, INTERSECT or MINUS must have the same type (for example text with text). Convert one of them with TO_CHAR or TO_NUMBER.',
  },
  'ORA-01791': {
    ro: 'În ORDER BY ai o expresie care nu apare în lista din SELECT DISTINCT sau într-o reuniune. Pune expresia și în SELECT.',
    en: 'ORDER BY has an expression that is not in the SELECT DISTINCT list or in a set operation. Put the expression in SELECT too.',
  },
  'ORA-01801': {
    ro: 'Data nu încape în lungimea cerută: textul ei (de exemplu 26-OCT-26, 9 caractere) e mai lung decât tipul din CAST. Mărește lungimea, de pildă CAST(d AS VARCHAR2(20)), sau folosește TO_CHAR.',
    en: 'The date does not fit in the requested length: its text (for example 26-OCT-26, 9 characters) is longer than the type in CAST. Make the length larger, for example CAST(d AS VARCHAR2(20)), or use TO_CHAR.',
  },
  'ORA-01821': {
    ro: 'Formatul de dată conține un element necunoscut sau unul care nu se aplică acestui tip (de pildă FF sau TZ pe un DATE). Verifică literele din format: YYYY, MM, DD, HH24, MI, SS.',
    en: 'The date format contains an unknown element or one that does not apply to this type (for example FF or TZ on a DATE). Check the letters in the format: YYYY, MM, DD, HH24, MI, SS.',
  },
  'ORA-01830': {
    ro: 'După data scrisă mai rămân caractere pe care formatul nu le folosește (de exemplu ora). Scrie doar ziua, luna și anul sau folosește TO_DATE cu formatul potrivit.',
    en: 'There are characters left after the date that the format does not use (for example the time). Write only the day, month and year, or use TO_DATE with the right format.',
  },
  'ORA-01839': {
    ro: 'Data nu există în luna aceea (de exemplu 31-FEB). Verifică ziua.',
    en: 'The date does not exist in that month (for example 31-FEB). Check the day.',
  },
  'ORA-01840': {
    ro: 'Textul este prea scurt pentru formatul de dată (lipsește luna sau anul). Scrie data completă, de exemplu 15-FEB-26, sau folosește TO_DATE.',
    en: 'The text is too short for the date format (the month or year is missing). Write the whole date, for example 15-FEB-26, or use TO_DATE.',
  },
  'ORA-01841': {
    ro: 'Anul din dată nu este valid (trebuie să fie între -4713 și 9999, fără 0), adesea pentru că textul nu se potrivește cu formatul. Verifică textul datei și masca din TO_DATE.',
    en: 'The year of the date is not valid (it must be between -4713 and 9999, not 0), often because the text does not match the format. Check the date text and the mask in TO_DATE.',
  },
  'ORA-01843': {
    ro: 'Luna din textul de dată nu este validă (de exemplu luna 13 sau un nume scris greșit). Verifică luna și limba numelor de luni din sesiune.',
    en: 'The month in the date text is not valid (for example month 13 or a misspelled name). Check the month and the language of month names in the session.',
  },
  'ORA-01846': {
    ro: 'Numele zilei nu este o zi a săptămânii în limba sesiunii. Cu setările implicite (engleză), NEXT_DAY cere de exemplu \'MONDAY\' sau \'SUNDAY\', nu \'LUNI\' sau \'DUMINICA\'.',
    en: 'The day name is not a day of the week in the session language. With the default settings (English), NEXT_DAY wants for example \'MONDAY\' or \'SUNDAY\', not \'LUNI\' or \'DUMINICA\'.',
  },
  'ORA-01847': {
    ro: 'Ziua lunii trebuie să fie între 1 și ultima zi a lunii.',
    en: 'The day of the month must be between 1 and the last day of the month.',
  },
  'ORA-01849': {
    ro: 'Cu HH sau HH12 ora trebuie să fie între 1 și 12. Pentru ore ca 13 sau 00 folosește HH24 în format.',
    en: 'With HH or HH12 the hour must be between 1 and 12. For hours such as 13 or 00, use HH24 in the format.',
  },
  'ORA-01850': {
    ro: 'Cu HH24 ora trebuie să fie între 0 și 23. Verifică ora din textul datei.',
    en: 'With HH24 the hour must be between 0 and 23. Check the hour in the date text.',
  },
  'ORA-01851': {
    ro: 'Minutele trebuie să fie între 0 și 59. Verifică minutele din textul datei (și că MI, nu MM, stă în format pentru minute).',
    en: 'The minutes must be between 0 and 59. Check the minutes in the date text (and that the format uses MI, not MM, for minutes).',
  },
  'ORA-01852': {
    ro: 'Secundele trebuie să fie între 0 și 59. Verifică secundele din textul datei.',
    en: 'The seconds must be between 0 and 59. Check the seconds in the date text.',
  },
  'ORA-01858': {
    ro: 'Oracle a găsit o literă acolo unde formatul cerea cifre, sau invers. Potrivește textul datei cu formatul din TO_DATE, caracter cu caracter.',
    en: 'Oracle found a letter where the format asked for digits, or the other way round. Match the date text to the format in TO_DATE, character by character.',
  },
  'ORA-01861': {
    ro: 'Textul de dată nu se potrivește cu formatul. Scrie formatul explicit în TO_DATE (de exemplu TO_DATE(\'26-10-2026\', \'DD-MM-YYYY\')) sau folosește DD-MON-RR.',
    en: 'The date text does not match the format. Write the format explicitly in TO_DATE (for example TO_DATE(\'26-10-2026\', \'DD-MM-YYYY\')) or use DD-MON-RR.',
  },
  'ORA-01898': {
    ro: 'Argumentul de precizie al lui ROUND sau TRUNC pentru date nu este valid. Folosește un element cunoscut: DD, MM, YYYY, Q, DAY, IW, CC.',
    en: 'The precision argument of ROUND or TRUNC for dates is not valid. Use a known element: DD, MM, YYYY, Q, DAY, IW, CC.',
  },
  'ORA-02258': {
    ro: 'NOT NULL sau NULL apare de două ori pentru aceeași coloană, sau cele două se contrazic. Lasă una singură.',
    en: 'NOT NULL or NULL appears twice for the same column, or the two contradict each other. Keep only one.',
  },
  'ORA-02260': {
    ro: 'Un tabel poate avea o singură cheie primară. Pentru mai multe coloane folosește o cheie compusă: PRIMARY KEY (a, b), iar pentru celelalte UNIQUE.',
    en: 'A table can have only one primary key. For several columns use a composite key: PRIMARY KEY (a, b), and UNIQUE for the others.',
  },
  'ORA-02264': {
    ro: 'Numele de constrângere este deja folosit în schema ta. Alege alt nume pentru CONSTRAINT.',
    en: 'The constraint name is already used in your schema. Choose another name for CONSTRAINT.',
  },
  'ORA-02266': {
    ro: 'Tabelul este referit de chei străine și nu poate fi golit cu TRUNCATE. Folosește DELETE sau șterge întâi cheile străine.',
    en: 'The table is referenced by foreign keys and cannot be emptied with TRUNCATE. Use DELETE or drop the foreign keys first.',
  },
  'ORA-02270': {
    ro: 'Cheia străină trebuie să trimită la o coloană (sau la o listă de coloane) care este cheie primară sau UNIQUE în tabelul părinte. Adaugă PRIMARY KEY sau UNIQUE acolo.',
    en: 'A foreign key must point to a column (or a list of columns) that is the primary key or UNIQUE in the parent table. Add PRIMARY KEY or UNIQUE there.',
  },
  'ORA-02290': {
    ro: 'Valoarea încalcă o restricție CHECK a tabelului. Citește condiția CHECK și alege o valoare care o respectă.',
    en: 'The value violates a CHECK constraint of the table. Read the CHECK condition and choose a value that satisfies it.',
  },
  'ORA-02291': {
    ro: 'Rândul nou face trimitere la o cheie părinte care nu există (cheie străină). Inserează întâi rândul din tabelul părinte sau folosește o valoare existentă.',
    en: 'The new row refers to a parent key that does not exist (foreign key). Insert the parent row first or use an existing value.',
  },
  'ORA-02292': {
    ro: 'Rândul pe care vrei să îl ștergi sau să îl schimbi are rânduri copil care îl folosesc. Șterge întâi rândurile copil sau folosește ON DELETE CASCADE la definirea cheii.',
    en: 'The row you want to delete or change has child rows that use it. Delete the child rows first or use ON DELETE CASCADE when defining the key.',
  },
  'ORA-02296': {
    ro: 'Coloana are deja valori NULL, deci nu poate deveni NOT NULL. Completează întâi valorile lipsă.',
    en: 'The column already has NULL values, so it cannot become NOT NULL. Fill in the missing values first.',
  },
  'ORA-02449': {
    ro: 'Tabelul are o cheie primară sau UNIQUE la care trimit chei străine din alte tabele. Șterge întâi tabelele copil sau folosește DROP TABLE ... CASCADE CONSTRAINTS.',
    en: 'The table has a primary or UNIQUE key that foreign keys in other tables point to. Drop the child tables first or use DROP TABLE ... CASCADE CONSTRAINTS.',
  },
  'ORA-03001': {
    ro: 'Forma aceasta (o numește mesajul de eroare) este valabilă în Oracle, dar nu este disponibilă în această bază de date de exercițiu. Scrie interogarea altfel (la ROWNUM: pe un singur tabel sau pe o subinterogare) sau încearc-o pe Oracle-ul din laborator.',
    en: 'This form (the error message names it) is valid in Oracle but is not available in this practice database. Write the query another way (for ROWNUM: on a single table or on a subquery) or try it on the lab\'s Oracle.',
  },
  'ORA-04043': {
    ro: 'Obiectul nu există: tabelul nu a fost creat sau numele este scris greșit. SELECT table_name FROM user_tables îți arată tabelele tale.',
    en: 'The object does not exist: the table was not created or the name is misspelled. SELECT table_name FROM user_tables shows your tables.',
  },
  'ORA-12705': {
    ro: 'Setarea de limbă sau de teritoriu cerută nu este disponibilă în acest mediu de exersare. Folosește AMERICAN, ROMANIAN, FRENCH sau GERMAN pentru limbă.',
    en: 'The requested language or territory setting is not available in this practice environment. Use AMERICAN, ROMANIAN, FRENCH or GERMAN for the language.',
  },
  'ORA-12899': {
    ro: 'Valoarea este mai lungă decât coloana (de exemplu VARCHAR2(10)). Scurtează textul sau mărește lungimea coloanei.',
    en: 'The value is longer than the column (for example VARCHAR2(10)). Shorten the text or make the column longer.',
  },
  'ORA-12983': {
    ro: 'Un tabel nu poate rămâne fără nicio coloană. Păstrează cel puțin una sau șterge tabelul cu DROP TABLE.',
    en: 'A table cannot be left without any column. Keep at least one or drop the table with DROP TABLE.',
  },
  'ORA-25137': {
    ro: 'Valoarea nu încape în tipul cerut: textul numărului are mai multe caractere decât lungimea din CAST (CAST(1/3 AS VARCHAR2(10)) are nevoie de 40). Mărește lungimea sau rotunjește întâi cu ROUND.',
    en: 'The value does not fit in the requested type: the text of the number has more characters than the length in CAST (CAST(1/3 AS VARCHAR2(10)) needs 40). Make the length larger or round first with ROUND.',
  },
  'ORA-25154': {
    ro: 'O coloană din USING nu poate avea prefix de tabel, nici în SELECT, nici în WHERE. Scrie-o fără prefix: nr_matricol, nu s.nr_matricol.',
    en: 'A column in USING cannot have a table prefix, neither in SELECT nor in WHERE. Write it without a prefix: nr_matricol, not s.nr_matricol.',
  },
  'ORA-25155': {
    ro: 'O coloană folosită de NATURAL JOIN nu poate avea prefix de tabel. Scrie-o fără prefix sau folosește JOIN ... ON.',
    en: 'A column used by a NATURAL JOIN cannot have a table prefix. Write it without a prefix or use JOIN ... ON.',
  },
  'ORA-30088': {
    ro: 'Precizia unui TIMESTAMP trebuie să fie între 0 și 9.',
    en: 'The precision of a TIMESTAMP must be between 0 and 9.',
  },
  'ORA-30483': {
    ro: 'O funcție analitică (cu OVER) nu poate sta în WHERE. Calculeaz-o într-o subinterogare din FROM și filtrează pe rezultatul ei, sau folosește ROWNUM.',
    en: 'An analytic function (with OVER) cannot be in WHERE. Compute it in a subquery in FROM and filter on its result, or use ROWNUM.',
  },
}

// what another dialect's habit is in Oracle 11g, by the construct the strictness pass names (src/sql/rewrite/lint.js)
const NOT_ORACLE = {
  except: {
    ro: 'Oracle 11g nu are EXCEPT: diferența a două interogări se scrie cu MINUS (SELECT ... MINUS SELECT ...).',
    en: 'Oracle 11g has no EXCEPT: the difference of two queries is written with MINUS (SELECT ... MINUS SELECT ...).',
  },
  limit: {
    ro: 'Oracle 11g nu are LIMIT, OFFSET, FETCH FIRST sau TOP. Primele n rânduri se iau cu WHERE ROWNUM <= n; pentru primele n într-o anumită ordine, pune ORDER BY într-o subinterogare și ROWNUM în afara ei.',
    en: 'Oracle 11g has no LIMIT, OFFSET, FETCH FIRST or TOP. The first n rows are taken with WHERE ROWNUM <= n; for the first n in a given order, put ORDER BY in a subquery and ROWNUM outside it.',
  },
  ilike: {
    ro: 'Oracle nu are ILIKE. Ca să cauți fără să conteze literele mari și mici, adu ambele părți la aceeași formă: UPPER(nume) LIKE \'POP%\'.',
    en: 'Oracle has no ILIKE. To search without caring about upper and lower case, bring both sides to the same form: UPPER(nume) LIKE \'POP%\'.',
  },
  cast: {
    ro: 'Oracle nu are operatorul ::. O conversie se scrie cu CAST(x AS tip) sau cu TO_CHAR, TO_NUMBER, TO_DATE.',
    en: 'Oracle has no :: operator. A conversion is written with CAST(x AS type) or with TO_CHAR, TO_NUMBER, TO_DATE.',
  },
  'set-all': {
    ro: 'Oracle 11g nu are INTERSECT ALL sau MINUS ALL. Folosește INTERSECT sau MINUS (care elimină dublurile) sau UNION ALL.',
    en: 'Oracle 11g has no INTERSECT ALL or MINUS ALL. Use INTERSECT or MINUS (which remove duplicates) or UNION ALL.',
  },
  default: {
    ro: 'Comanda e scrisă în alt dialect SQL, nu în Oracle 11g. Oracle nu are LIMIT, TOP, ILIKE sau ::; folosește ROWNUM, LIKE cu UPPER, CAST sau TO_CHAR.',
    en: 'The command is written in another SQL dialect, not Oracle 11g. Oracle has no LIMIT, TOP, ILIKE or ::; use ROWNUM, LIKE with UPPER, CAST or TO_CHAR.',
  },
}

const GENERIC = {
  ro: 'Oracle a refuzat comanda. Citește mesajul de eroare de lângă cod și caută în comandă locul pe care îl menționează.',
  en: 'Oracle refused the command. Read the error message next to the code and look for the place it mentions in the command.',
}

export function explainOra(code) {
  const key = /^ORA-\d+$/i.test(String(code)) ? `ORA-${String(code).slice(4).padStart(5, '0')}` : String(code)
  return TABLE[key] ?? GENERIC
}

// ---- what a verdict and a named mistake mean --------------------------------------------------------------------------
//   explainVerdict(verdict) -> { ro, en }      one or two sentences about how the learner's result differs from the expected one
//   explainMistake(id)      -> { ro, en }      what the classic trap is and how to avoid it
const count = (n, ro1, roN, en1, enN) => ({ ro: `${n} ${n === 1 ? ro1 : roN}`, en: `${n} ${n === 1 ? en1 : enN}` })

export function explainVerdict(v) {
  const miss = (v.missing ?? []).length
  const extra = (v.extra ?? []).length
  switch (v.kind) {
    case 'correct':
      return { ro: 'Rezultatul este cel cerut.', en: 'The result is the one asked for.' }
    case 'rows':
    case 'rowcount': {
      const m = count(miss, 'rând așteptat lipsește', 'rânduri așteptate lipsesc', 'expected row is missing', 'expected rows are missing')
      const x = count(extra, 'rând în plus', 'rânduri în plus', 'extra row', 'extra rows')
      const ro = miss && extra ? `${m.ro} și ${x.ro}.` : miss ? `${m.ro}.` : extra ? `Ai ${x.ro}.` : 'Rândurile nu sunt cele cerute.'
      const en = miss && extra ? `${m.en} and ${x.en}.` : miss ? `${m.en}.` : extra ? `You have ${x.en}.` : 'The rows are not the ones asked for.'
      return { ro, en }
    }
    case 'order':
      return {
        ro: 'Rândurile sunt cele cerute, dar în altă ordine. Verifică ORDER BY: coloanele și sensul (ASC/DESC) din enunț, plus coloanele în plus cerute de nota aplicației, dacă enunțul are una. Fără ORDER BY, Oracle nu garantează nicio ordine.',
        en: 'The rows are the right ones but in a different order. Check ORDER BY: the columns and direction (ASC/DESC) the statement asks for, plus the extra columns the app note asks for, if the statement has one. Without ORDER BY Oracle guarantees no order.',
      }
    case 'columns':
      return {
        ro: 'Numărul de coloane nu este cel cerut. Verifică ce coloane cere enunțul, în ce ordine, și că nu ai lăsat sau adăugat una în plus.',
        en: 'The number of columns is not the one asked for. Check which columns the statement wants, in which order, and that you did not leave one out or add one.',
      }
    case 'alias':
      return {
        ro: 'Datele sunt bune, dar numele coloanelor din antet nu sunt cele cerute (sau două coloane au același nume). Dă fiecărei coloane aliasul cerut.',
        en: 'The data is right, but the column names in the header are not the requested ones (or two columns share a name). Give each column the requested alias.',
      }
    case 'error':
      return explainOra(v.code)
    case 'not-oracle':
      return NOT_ORACLE[v.construct] ?? NOT_ORACLE.default
    case 'structure':
      return {
        ro: 'După rularea comenzilor, un tabel lipsește sau nu are coloanele cerute (nume, ordine, tip, lungime, NOT NULL). Verifică numele tabelului și definiția coloanelor.',
        en: 'After your commands ran, a table is missing or does not have the requested columns (names, order, type, length, NOT NULL). Check the table name and the column definitions.',
      }
    case 'contents': {
      const m = count(miss, 'rând așteptat lipsește', 'rânduri așteptate lipsesc', 'expected row is missing', 'expected rows are missing')
      const x = count(extra, 'rând în plus', 'rânduri în plus', 'extra row', 'extra rows')
      // a zero count says nothing: name only the side that differs (as the rows verdict does)
      const ro = [miss ? m.ro : '', extra ? x.ro : ''].filter(Boolean).join(', ')
      const en = [miss ? m.en : '', extra ? x.en : ''].filter(Boolean).join(', ')
      return {
        ro: `Tabelul${v.table ? ` ${v.table}` : ''} nu conține datele cerute${ro ? `: ${ro}` : ''}.`,
        en: `The table${v.table ? ` ${v.table}` : ''} does not hold the requested data${en ? `: ${en}` : ''}.`,
      }
    }
    case 'century':
      return {
        ro: 'Datele se afișează la fel în formatul DD-MON-RR, dar anii întregi diferă (de exemplu 1995 față de 2095): anul din două cifre ascunde secolul. Verifică formatul cu care ai scris anul în TO_DATE (RR sau YYYY) și calculele cu date. Doar o coloană DATE ține anul întreg în spatele afișării; o coloană text făcută cu TO_CHAR nu poartă niciun an ascuns.',
        en: 'The dates print the same in DD-MON-RR, but the full years differ (for example 1995 against 2095): the two-digit year hides the century. Check the format you wrote the year with in TO_DATE (RR or YYYY) and the date arithmetic. Only a DATE column keeps the full year behind what it shows; a text column made with TO_CHAR carries no hidden year.',
      }
    default:
      return GENERIC
  }
}

const MISTAKES = {
  'eq-null': {
    ro: 'Ai comparat cu NULL folosind = sau <>. NULL înseamnă „necunoscut”, deci orice comparație cu el nu este nici adevărată, nici falsă și nu alege niciun rând. Scrie IS NULL sau IS NOT NULL.',
    en: 'You compared with NULL using = or <>. NULL means "unknown", so any comparison with it is neither true nor false and picks no row. Write IS NULL or IS NOT NULL.',
  },
  'inner-vs-left': {
    ro: 'Un JOIN obișnuit păstrează doar rândurile care au pereche în celălalt tabel, așa că rândurile fără pereche dispar. Ca să le păstrezi, folosește LEFT JOIN (sau RIGHT JOIN) de la tabelul ale cărui rânduri trebuie să apară toate.',
    en: 'A plain JOIN keeps only the rows that have a partner in the other table, so rows without a partner disappear. To keep them, use LEFT JOIN (or RIGHT JOIN) starting from the table whose rows must all appear.',
  },
  'missing-join-cond': {
    ro: 'Ai mai multe tabele în FROM, dar nu le-ai legat pe toate între ele: fiecare tabel în plus are nevoie de o condiție de legătură. Fără ea, Oracle face produsul cartezian și fiecare rând se potrivește cu toate rândurile celuilalt tabel.',
    en: 'You have several tables in FROM but did not tie each one to the others: every extra table needs a join condition. Without it Oracle builds the Cartesian product and every row pairs with all rows of the other table.',
  },
  'char-trim': {
    ro: 'Coloanele CHAR(n) sunt completate cu spații până la n caractere. Textul tău diferă de cel așteptat doar prin spații; taie-le cu TRIM sau RTRIM, sau folosește VARCHAR2 când poți.',
    en: 'CHAR(n) columns are padded with blanks up to n characters. Your text differs from the expected one only by blanks; cut them with TRIM or RTRIM, or use VARCHAR2 where you can.',
  },
  'self-pair-name': {
    ro: 'Pentru perechi dintr-un singur tabel, condiția < sau <> pe nume pierde perechile cu același nume, tocmai cele care pot fi omonime. Compară cheia (de exemplu s1.nr_matricol < s2.nr_matricol): fiecare pereche apare o singură dată, chiar și când numele coincid.',
    en: 'For pairs from a single table, a < or <> condition on the name loses the pairs with the same name, exactly the ones that may be homonyms. Compare the key (for example s1.nr_matricol < s2.nr_matricol): each pair appears once, even when the names are equal.',
  },
  'minus-name-collapse': {
    ro: 'MINUS compară rânduri întregi și elimină dublurile. Dacă lista conține doar numele, două persoane cu același nume se contopesc într-un rând, iar dacă una dintre ele e în a doua listă dispar amândouă. Include cheia în SELECT sau folosește NOT IN / NOT EXISTS pe cheie.',
    en: 'MINUS compares whole rows and removes duplicates. If the list holds only names, two people with the same name merge into one row, and if one of them is in the second list both disappear. Include the key in SELECT or use NOT IN / NOT EXISTS on the key.',
  },
  'and-or': {
    ro: 'AND se evaluează înaintea lui OR. Când amesteci cele două fără paranteze, condiția se grupează altfel decât crezi. Pune între paranteze partea cu OR.',
    en: 'AND is evaluated before OR. When you mix the two without parentheses, the condition groups differently than you think. Put the OR part in parentheses.',
  },
  'dml-no-where': {
    ro: 'Un UPDATE sau DELETE fără WHERE modifică toate rândurile tabelului. Adaugă WHERE cu condiția care alege doar rândurile dorite.',
    en: 'An UPDATE or DELETE without WHERE changes every row of the table. Add a WHERE with the condition that picks only the wanted rows.',
  },
  'distinct-first-col': {
    ro: 'DISTINCT se aplică întregului rând, nu primei coloane. Cu mai multe coloane în SELECT, un rând dispare doar dacă toate valorile lui se repetă. Pentru valori distincte ale unei singure coloane, selectează numai acea coloană.',
    en: 'DISTINCT applies to the whole row, not to the first column. With several columns in SELECT a row disappears only if all its values repeat. For distinct values of a single column, select only that column.',
  },
  'case-literal': {
    ro: 'Valorile text se compară ținând cont de litere mari și mici: \'ioana\' nu este \'Ioana\'. Scrie textul exact ca în date sau compară UPPER(coloana) cu textul în litere mari.',
    en: 'Text values are compared case-sensitively: \'ioana\' is not \'Ioana\'. Write the text exactly as it is in the data, or compare UPPER(column) with the text in capitals.',
  },
}

export function explainMistake(id) {
  return MISTAKES[id] ?? GENERIC
}
